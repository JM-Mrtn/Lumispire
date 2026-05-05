import mongoose from "mongoose";
import TrainingBatch from "../models/TrainingBatch.js";
import TrainingModule from "../models/TrainingModule.js";
import { DEFAULT_PRETEST_BANK } from "../utils/trainingPretestBank.js";
import TraineeUser from "../models/TraineeUser.js";
import {
  uploadBufferToTrainingGridFS,
  deleteFileFromTrainingGridFS,
} from "../utils/trainingGridfs.js";

function normalizeCourseName(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (clean === "housekeeping") return "Housekeeping";
  if (clean === "event management") return "Event Management";
  return String(value || "").trim();
}

function getCourseKey(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (clean === "housekeeping") return "housekeeping";
  if (clean === "event management") return "event-management";
  return clean.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizePathLevel(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (["all", "beginner", "intermediate", "advanced"].includes(clean)) {
    return clean;
  }
  return "all";
}

function normalizeTagList(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))];
  }

  if (typeof value === "string") {
    return [
      ...new Set(
        value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    ];
  }

  return [];
}

function toSavedFiles(savedList = []) {
  return savedList.map((item) => ({
    fileId: item.fileId,
    originalName: item.originalName || "",
    filename: item.filename || "",
    mimetype: item.mimetype || "",
    size: Number(item.size || 0),
  }));
}

function pickIncomingFiles(req) {
  if (Array.isArray(req.files) && req.files.length) return req.files;

  if (Array.isArray(req.files?.moduleFiles) && req.files.moduleFiles.length) {
    return req.files.moduleFiles;
  }

  if (Array.isArray(req.files?.moduleFile) && req.files.moduleFile.length) {
    return req.files.moduleFile;
  }

  if (Array.isArray(req.files?.files) && req.files.files.length) {
    return req.files.files;
  }

  if (req.file) return [req.file];

  return [];
}

function isPretestRequiredForCourse(course = "") {
  const key = getCourseKey(course);
  return Boolean(DEFAULT_PRETEST_BANK[key]);
}

function hasCompletedPretest(trainee) {
  return (
    String(trainee?.pretestStatus || "").trim().toLowerCase() === "completed" ||
    Boolean(trainee?.pretestLastTakenAt)
  );
}

function parseRemovedFileIds(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch {
      // raw fallback below
    }

    return [raw];
  }

  return [];
}

const PATH_LEVEL_ORDER = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

function getAllowedPathLevelsForLearningPath(value = "beginner") {
  const normalized = normalizePathLevel(value);
  const target = normalized === "all" ? "beginner" : normalized;
  const maxRank = PATH_LEVEL_ORDER[target] || 1;

  const levels = Object.entries(PATH_LEVEL_ORDER)
    .filter(([, rank]) => rank <= maxRank)
    .map(([level]) => level);

  return ["all", ...levels];
}

function normalizeAllowedCourses(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).map(normalizeCourseName).filter(Boolean))];
}

function normalizeBatchView(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (["current", "past", "all"].includes(clean)) return clean;
  return "current";
}

async function getCurrentBatchMapForCourses(courses = []) {
  const normalizedCourses = normalizeAllowedCourses(courses);
  if (!normalizedCourses.length) return new Map();

  const rows = await TrainingBatch.find({
    course: { $in: normalizedCourses },
    isActive: true,
    status: { $ne: "archived" },
  })
    .sort({ course: 1, createdAt: -1 })
    .lean();

  const map = new Map();
  for (const row of rows) {
    const course = normalizeCourseName(row?.course || "");
    if (!course || map.has(course)) continue;
    map.set(course, row);
  }

  return map;
}

async function getBatchByIdForCourses(batchId = "", courses = []) {
  const normalizedCourses = normalizeAllowedCourses(courses);
  if (!normalizedCourses.length || !mongoose.Types.ObjectId.isValid(String(batchId || ""))) {
    return null;
  }

  return TrainingBatch.findOne({
    _id: batchId,
    course: { $in: normalizedCourses },
  }).lean();
}

async function getBatchRowsForCourses(courses = [], view = "current") {
  const normalizedCourses = normalizeAllowedCourses(courses);
  if (!normalizedCourses.length) return [];

  const normalizedView = normalizeBatchView(view);
  if (normalizedView === "current") {
    const batchMap = await getCurrentBatchMapForCourses(normalizedCourses);
    return [...batchMap.values()];
  }

  const query = {
    course: { $in: normalizedCourses },
  };

  if (normalizedView === "past") {
    query.$or = [{ status: "archived" }, { isActive: false }];
  }

  const sort =
    normalizedView === "past"
      ? { archivedAt: -1, updatedAt: -1, createdAt: -1 }
      : { createdAt: -1, updatedAt: -1 };

  return TrainingBatch.find(query).sort(sort).lean();
}

async function resolveProfessorBatchContext(req, { course = "", batchId = "", view = "current" } = {}) {
  const requestedCourse = normalizeCourseName(course === "All" ? "" : course);
  const allowedCourses = normalizeAllowedCourses(req.professor?.courseAssignments || []);
  const targetCourses = requestedCourse ? [requestedCourse] : allowedCourses;

  if (requestedCourse && !allowedCourses.includes(requestedCourse)) {
    return {
      ok: false,
      status: 403,
      message: "You can only view modules for your assigned courses.",
      batches: [],
      batchIds: [],
      batchMap: new Map(),
      allowedCourses,
      selectedBatchId: String(batchId || "").trim(),
      view: normalizeBatchView(view),
    };
  }

  const selectedBatchId = String(batchId || "").trim();
  let batches = [];

  if (selectedBatchId) {
    const batch = await getBatchByIdForCourses(selectedBatchId, targetCourses);
    if (!batch) {
      return {
        ok: false,
        status: 404,
        message: "Batch not found or not allowed for this professor.",
        batches: [],
        batchIds: [],
        batchMap: new Map(),
        allowedCourses,
        selectedBatchId,
        view: normalizeBatchView(view),
      };
    }

    batches = [batch];
  } else {
    batches = await getBatchRowsForCourses(targetCourses, view);
  }

  const batchMap = new Map();
  for (const batch of batches) {
    const normalizedCourse = normalizeCourseName(batch?.course || "");
    if (!normalizedCourse || batchMap.has(normalizedCourse)) continue;
    batchMap.set(normalizedCourse, batch);
  }

  return {
    ok: true,
    status: 200,
    message: "",
    batches,
    batchIds: batches.map((batch) => String(batch._id)),
    batchMap,
    allowedCourses,
    selectedBatchId,
    view: normalizeBatchView(view),
  };
}

async function getTraineeTargetBatch(trainee, course = "") {
  const normalizedCourse = normalizeCourseName(course || trainee?.course || "");
  if (!normalizedCourse) return null;

  const traineeBatchId = String(trainee?.batchId || "").trim();
  if (traineeBatchId && mongoose.Types.ObjectId.isValid(traineeBatchId)) {
    const batch = await TrainingBatch.findOne({
      _id: traineeBatchId,
      course: normalizedCourse,
    }).lean();

    if (batch) return batch;
  }

  const batchMap = await getCurrentBatchMapForCourses([normalizedCourse]);
  return batchMap.get(normalizedCourse) || null;
}

export async function listTraineeModules(req, res) {
  try {
    const trainee = await TraineeUser.findById(req.trainee.id).select(
      "course batchId learningPathLevel pretestStatus pretestLastTakenAt learningGoal"
    );

    if (!trainee) {
      return res.status(404).json({ message: "Trainee account not found." });
    }

    const course = normalizeCourseName(trainee.course || "");
    const courseKey = getCourseKey(course);
    const learningPathLevel = trainee.learningPathLevel || "beginner";
    const lockedByPretest = isPretestRequiredForCourse(course) && !hasCompletedPretest(trainee);

    if (!courseKey) {
      return res.json({
        course,
        courseKey,
        lockedByPretest,
        learningPathLevel,
        learningGoal: trainee.learningGoal || "",
        modules: [],
      });
    }

    if (lockedByPretest) {
      return res.json({
        course,
        courseKey,
        lockedByPretest: true,
        learningPathLevel,
        learningGoal: trainee.learningGoal || "",
        modules: [],
      });
    }

    const targetBatch = await getTraineeTargetBatch(trainee, course);

    if (!targetBatch) {
      return res.json({
        course,
        courseKey,
        lockedByPretest: false,
        learningPathLevel,
        learningGoal: trainee.learningGoal || "",
        modules: [],
      });
    }

    const allowedPathLevels = getAllowedPathLevelsForLearningPath(learningPathLevel);

    const modules = await TrainingModule.find({
      courseKey,
      isActive: true,
      batchId: String(targetBatch._id),
      pathLevel: { $in: allowedPathLevels },
    })
      .sort({ sequence: 1, createdAt: -1 })
      .lean();

    return res.json({
      course,
      courseKey,
      lockedByPretest: false,
      learningPathLevel,
      learningGoal: trainee.learningGoal || "",
      batchId: String(targetBatch._id),
      batchCode: targetBatch.batchCode || "",
      batchName: targetBatch.batchName || "",
      modules,
    });
  } catch (error) {
    console.error("listTraineeModules error:", error);
    return res.status(500).json({ message: "Failed to load modules." });
  }
}

export async function listProfessorModules(req, res) {
  try {
    const { course = "", batchId = "", view = "current" } = req.query || {};
    const batchContext = await resolveProfessorBatchContext(req, {
      course,
      batchId,
      view,
    });

    if (!batchContext.ok) {
      return res.status(batchContext.status).json({
        success: false,
        message: batchContext.message,
      });
    }

    if (!batchContext.batchIds.length) {
      return res.json({
        success: true,
        allowedCourses: batchContext.allowedCourses,
        selectedBatchId: batchContext.selectedBatchId,
        view: batchContext.view,
        modules: [],
      });
    }

    const modules = await TrainingModule.find({
      isActive: true,
      batchId: { $in: batchContext.batchIds },
    })
      .sort({ batchCode: -1, course: 1, sequence: 1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      allowedCourses: batchContext.allowedCourses,
      selectedBatchId: batchContext.selectedBatchId,
      view: batchContext.view,
      modules,
    });
  } catch (error) {
    console.error("listProfessorModules error:", error);
    return res.status(500).json({ success: false, message: "Failed to load modules." });
  }
}

export async function createProfessorModule(req, res) {
  const savedFiles = [];

  try {
    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();
    const course = normalizeCourseName(req.body?.course || "");
    const pathLevel = normalizePathLevel(req.body?.pathLevel || "all");
    const sequence = Math.max(1, Number(req.body?.sequence || 1));
    const learningGoalTags = normalizeTagList(req.body?.learningGoalTags);

    if (!title || !course) {
      return res.status(400).json({
        success: false,
        message: "Title and course are required.",
      });
    }

    const allowedCourses = normalizeAllowedCourses(req.professor?.courseAssignments || []);
    if (!allowedCourses.includes(course)) {
      return res.status(403).json({
        success: false,
        message: "You can only create modules for your assigned courses.",
      });
    }

    const batchMap = await getCurrentBatchMapForCourses([course]);
    const currentBatch = batchMap.get(course);

    if (!currentBatch) {
      return res.status(400).json({
        success: false,
        message: "You can only create modules when there is a current active batch for this course.",
      });
    }

    const incomingFiles = pickIncomingFiles(req);
    if (!incomingFiles.length) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least 1 module file.",
      });
    }

    for (const file of incomingFiles) {
      const saved = await uploadBufferToTrainingGridFS(file, "training-modules");
      if (saved) savedFiles.push(saved);
    }

    const files = toSavedFiles(savedFiles);
    const firstFile = files[0] || null;

    const moduleDoc = await TrainingModule.create({
      title,
      description,
      course,
      courseKey: getCourseKey(course),
      batchId: String(currentBatch._id),
      batchCode: currentBatch.batchCode || "",
      batchName: currentBatch.batchName || "",
      pathLevel,
      sequence,
      learningGoalTags,
      files,
      file: firstFile,
      fileId: firstFile?.fileId ? String(firstFile.fileId) : "",
      fileName: firstFile?.originalName || "",
      mimeType: firstFile?.mimetype || "",
      fileSize: Number(firstFile?.size || 0),
      uploadedByProfessorId: req.professor?.id
        ? new mongoose.Types.ObjectId(req.professor.id)
        : null,
      uploadedByProfessorName: req.professor?.name || req.professor?.email || "",
    });

    return res.status(201).json({
      success: true,
      message: "Module created successfully.",
      module: moduleDoc,
    });
  } catch (error) {
    for (const file of savedFiles) {
      await deleteFileFromTrainingGridFS(file?.fileId).catch(() => null);
    }

    console.error("createProfessorModule error:", error);
    return res.status(500).json({ success: false, message: "Failed to create module." });
  }
}

export async function updateProfessorModule(req, res) {
  const newlySavedFiles = [];

  try {
    const moduleDoc = await TrainingModule.findById(req.params.id);
    if (!moduleDoc) {
      return res.status(404).json({ success: false, message: "Module not found." });
    }

    const allowedCourses = normalizeAllowedCourses(req.professor?.courseAssignments || []);
    if (!allowedCourses.includes(moduleDoc.course)) {
      return res.status(403).json({
        success: false,
        message: "You can only update modules for your assigned courses.",
      });
    }

    const batchMap = await getCurrentBatchMapForCourses([moduleDoc.course]);
    const currentBatch = batchMap.get(moduleDoc.course);

    if (!currentBatch) {
      return res.status(400).json({
        success: false,
        message: "There is no current active batch for this course.",
      });
    }

    const belongsToCurrentBatch =
      moduleDoc?.batchId && String(moduleDoc.batchId) === String(currentBatch._id);

    if (!belongsToCurrentBatch) {
      return res.status(403).json({
        success: false,
        message: "You can only update modules that belong to the current batch.",
      });
    }

    const nextCourse = normalizeCourseName(req.body?.course || moduleDoc.course);
    if (!allowedCourses.includes(nextCourse) || nextCourse !== moduleDoc.course) {
      return res.status(403).json({
        success: false,
        message: "You can only update modules inside the same current batch course.",
      });
    }

    const removedExistingFileIds = parseRemovedFileIds(
      req.body?.removedFileIds ?? req.body?.removedExistingFileIds
    );

    const existingFiles = Array.isArray(moduleDoc.files) ? moduleDoc.files : [];
    const keptFiles = existingFiles.filter((file) => {
      const id = String(file?.fileId || "");
      return !removedExistingFileIds.includes(id);
    });

    const incomingFiles = pickIncomingFiles(req);
    for (const file of incomingFiles) {
      const saved = await uploadBufferToTrainingGridFS(file, "training-modules");
      if (saved) newlySavedFiles.push(saved);
    }

    const files = [...keptFiles, ...toSavedFiles(newlySavedFiles)];
    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: "A module must keep at least 1 file.",
      });
    }

    const firstFile = files[0] || null;

    moduleDoc.title = String(req.body?.title || moduleDoc.title).trim();
    moduleDoc.description = String(req.body?.description || moduleDoc.description).trim();
    moduleDoc.course = nextCourse;
    moduleDoc.courseKey = getCourseKey(nextCourse);
    moduleDoc.batchId = String(currentBatch._id);
    moduleDoc.batchCode = currentBatch.batchCode || "";
    moduleDoc.batchName = currentBatch.batchName || "";
    moduleDoc.pathLevel = normalizePathLevel(req.body?.pathLevel || moduleDoc.pathLevel || "all");
    moduleDoc.sequence = Math.max(1, Number(req.body?.sequence || moduleDoc.sequence || 1));
    moduleDoc.learningGoalTags = normalizeTagList(
      req.body?.learningGoalTags ?? moduleDoc.learningGoalTags
    );
    moduleDoc.files = files;
    moduleDoc.file = firstFile;
    moduleDoc.fileId = firstFile?.fileId ? String(firstFile.fileId) : "";
    moduleDoc.fileName = firstFile?.originalName || "";
    moduleDoc.mimeType = firstFile?.mimetype || "";
    moduleDoc.fileSize = Number(firstFile?.size || 0);

    await moduleDoc.save();

    for (const fileId of removedExistingFileIds) {
      await deleteFileFromTrainingGridFS(fileId).catch(() => null);
    }

    return res.json({
      success: true,
      message: "Module updated successfully.",
      module: moduleDoc,
    });
  } catch (error) {
    for (const file of newlySavedFiles) {
      await deleteFileFromTrainingGridFS(file?.fileId).catch(() => null);
    }

    console.error("updateProfessorModule error:", error);
    return res.status(500).json({ success: false, message: "Failed to update module." });
  }
}

export async function deleteProfessorModule(req, res) {
  try {
    const moduleDoc = await TrainingModule.findById(req.params.id);
    if (!moduleDoc) {
      return res.status(404).json({ success: false, message: "Module not found." });
    }

    const allowedCourses = normalizeAllowedCourses(req.professor?.courseAssignments || []);
    if (!allowedCourses.includes(moduleDoc.course)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete modules for your assigned courses.",
      });
    }

    const batchMap = await getCurrentBatchMapForCourses([moduleDoc.course]);
    const currentBatch = batchMap.get(moduleDoc.course);

    if (!currentBatch) {
      return res.status(400).json({
        success: false,
        message: "There is no current active batch for this course.",
      });
    }

    const belongsToCurrentBatch =
      moduleDoc?.batchId && String(moduleDoc.batchId) === String(currentBatch._id);

    if (!belongsToCurrentBatch) {
      return res.status(403).json({
        success: false,
        message: "You can only delete modules that belong to the current batch.",
      });
    }

    const files = Array.isArray(moduleDoc.files) ? moduleDoc.files : [];
    await moduleDoc.deleteOne();

    for (const file of files) {
      await deleteFileFromTrainingGridFS(String(file?.fileId || "")).catch(() => null);
    }

    return res.json({ success: true, message: "Module deleted successfully." });
  } catch (error) {
    console.error("deleteProfessorModule error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete module." });
  }
}

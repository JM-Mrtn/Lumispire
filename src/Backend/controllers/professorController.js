import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import ProfessorUser from "../models/ProfessorUser.js";
import TraineeUser from "../models/TraineeUser.js";
import EnrollmentRequest from "../models/EnrollmentRequest.js";
import TrainingBatch from "../models/TrainingBatch.js";
import ProfessorAttendance from "../models/ProfessorAttendance.js";
import ProfessorAssessment from "../models/ProfessorAssessment.js";
import ProfessorScore from "../models/ProfessorScore.js";
import {
  uploadBufferToTrainingGridFS,
  deleteFileFromTrainingGridFS,
} from "../utils/trainingGridfs.js";

function normalizeDateOnly(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function normalizeCourseName(value = "") {
  const clean = String(value || "").trim().toLowerCase();

  if (clean === "event management") return "Event Management";
  if (clean === "housekeeping") return "Housekeeping";

  return String(value || "").trim();
}

function normalizeCourseArray(values = []) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map(normalizeCourseName)
        .filter(Boolean)
    ),
  ];
}

function getProfessorAllowedCourses(req) {
  return normalizeCourseArray(req?.professor?.courseAssignments || []);
}

function resolveProfessorCourse(req, incomingCourse = "") {
  const allowedCourses = getProfessorAllowedCourses(req);
  const normalizedIncoming = normalizeCourseName(incomingCourse);

  if (!allowedCourses.length) {
    return {
      ok: false,
      allowedCourses: [],
      selectedCourse: "",
      message: "Professor has no assigned course.",
    };
  }

  if (!normalizedIncoming) {
    return {
      ok: true,
      allowedCourses,
      selectedCourse: allowedCourses.length === 1 ? allowedCourses[0] : "",
      message: "",
    };
  }

  if (!allowedCourses.includes(normalizedIncoming)) {
    return {
      ok: false,
      allowedCourses,
      selectedCourse: "",
      message: "You are not allowed to manage this course.",
    };
  }

  return {
    ok: true,
    allowedCourses,
    selectedCourse: normalizedIncoming,
    message: "",
  };
}

function getResolvedCourseFilter(resolved) {
  if (resolved.selectedCourse) return resolved.selectedCourse;
  return { $in: resolved.allowedCourses };
}

function isProfessorAllowedForCourse(req, course = "") {
  const normalized = normalizeCourseName(course);
  if (!normalized) return false;
  return getProfessorAllowedCourses(req).includes(normalized);
}

function getProfessorDisplayName(professor) {
  if (!professor) return "";
  return (
    [professor.firstName, professor.lastName].filter(Boolean).join(" ").trim() ||
    professor.name ||
    professor.username ||
    professor.email ||
    ""
  );
}

function getProfessorJwtSecret() {
  return String(
    process.env.PROFESSOR_JWT_SECRET || process.env.JWT_SECRET || ""
  ).trim();
}

function signProfessorToken(payload) {
  const secret = getProfessorJwtSecret();

  if (!secret) {
    return {
      ok: false,
      message: "PROFESSOR_JWT_SECRET or JWT_SECRET is missing in .env",
    };
  }

  const token = jwt.sign(payload, secret, {
    expiresIn: process.env.PROFESSOR_JWT_EXPIRES_IN || "1d",
  });

  return { ok: true, token };
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function toDateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function csvEscape(value) {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
}

function isAllowedAttendanceStatus(value = "") {
  return ["Pending", "Present", "Absent", "Late"].includes(
    String(value || "").trim()
  );
}

function normalizeBatchView(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (["current", "past", "all"].includes(clean)) return clean;
  return "current";
}

function buildAttendanceWindowKey({ attendanceDate = "", uploadOpenAt = null } = {}) {
  const openAt = uploadOpenAt ? new Date(uploadOpenAt) : null;
  if (openAt && !Number.isNaN(openAt.getTime())) {
    return `open:${openAt.toISOString()}`;
  }

  const dateOnly = normalizeDateOnly(attendanceDate || uploadOpenAt);
  if (dateOnly) {
    return `date:${dateOnly}`;
  }

  return String(value || "").trim();
}

function isDuplicateKeyError(error) {
  return Number(error?.code || 0) === 11000;
}

function buildAttendanceRecordKey(row = {}) {
  if (row?.uploadOpenAt) {
    const d = new Date(row.uploadOpenAt);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }

  if (row?.createdAt) {
    const d = new Date(row.createdAt);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }

  return String(row?.attendanceDate || "").trim();
}

function mapAttendanceRecordOption(row = {}) {
  return {
    key: buildAttendanceRecordKey(row),
    attendanceDate: normalizeDateOnly(row?.attendanceDate),
    uploadOpenAt: row?.uploadOpenAt || null,
    uploadCloseAt: row?.uploadCloseAt || null,
    createdAt: row?.createdAt || null,
    course: row?.course || "",
    batchId: String(row?.batchId || "").trim(),
  };
}

async function getLatestCurrentBatchMapForCourses(courses = []) {
  const normalizedCourses = normalizeCourseArray(courses);
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

async function getAccessibleBatchRowsForCourses(courses = [], view = "current") {
  const normalizedCourses = normalizeCourseArray(courses);
  if (!normalizedCourses.length) return [];

  const normalizedView = normalizeBatchView(view);

  if (normalizedView === "current") {
    const latestMap = await getLatestCurrentBatchMapForCourses(normalizedCourses);
    return [...latestMap.values()];
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

async function getAccessibleBatchById(batchId = "", courses = []) {
  const normalizedCourses = normalizeCourseArray(courses);
  if (!normalizedCourses.length || !isValidObjectId(batchId)) return null;

  return TrainingBatch.findOne({
    _id: batchId,
    course: { $in: normalizedCourses },
  }).lean();
}

async function resolveProfessorCurrentBatchContext(req, optionsOrCourse = "") {
  const options =
    typeof optionsOrCourse === "string"
      ? { incomingCourse: optionsOrCourse }
      : optionsOrCourse || {};

  const incomingCourse = String(
    options.incomingCourse ?? options.course ?? ""
  ).trim();
  const requestedBatchId = String(options.batchId || "").trim();
  const view = normalizeBatchView(options.view || "current");

  const resolved = resolveProfessorCourse(
    req,
    incomingCourse === "All" ? "" : incomingCourse
  );

  if (!resolved.ok) {
    return {
      ok: false,
      status: 403,
      message: resolved.message,
      allowedCourses: resolved.allowedCourses || [],
      selectedCourse: resolved.selectedCourse || "",
      batches: [],
      batchIds: [],
      batchMap: new Map(),
      requestedBatchId,
      view,
      hasExplicitBatch: Boolean(requestedBatchId),
    };
  }

  const targetCourses = resolved.selectedCourse
    ? [resolved.selectedCourse]
    : resolved.allowedCourses;

  let batches = [];

  if (requestedBatchId) {
    if (!isValidObjectId(requestedBatchId)) {
      return {
        ok: false,
        status: 400,
        message: "Invalid batch id.",
        allowedCourses: resolved.allowedCourses || [],
        selectedCourse: resolved.selectedCourse || "",
        batches: [],
        batchIds: [],
        batchMap: new Map(),
        requestedBatchId,
        view,
        hasExplicitBatch: true,
      };
    }

    const batch = await getAccessibleBatchById(requestedBatchId, targetCourses);
    if (!batch) {
      return {
        ok: false,
        status: 404,
        message: "Batch not found or not allowed for this professor.",
        allowedCourses: resolved.allowedCourses || [],
        selectedCourse: resolved.selectedCourse || "",
        batches: [],
        batchIds: [],
        batchMap: new Map(),
        requestedBatchId,
        view,
        hasExplicitBatch: true,
      };
    }

    batches = [batch];
  } else {
    batches = await getAccessibleBatchRowsForCourses(targetCourses, view);
  }

  const batchIds = batches.map((batch) => String(batch._id));
  const batchMap = new Map();

  for (const batch of batches) {
    const course = normalizeCourseName(batch?.course || "");
    if (!course || batchMap.has(course)) continue;
    batchMap.set(course, batch);
  }

  return {
    ok: true,
    status: 200,
    message: "",
    allowedCourses: resolved.allowedCourses || [],
    selectedCourse: resolved.selectedCourse || "",
    batches,
    batchIds,
    batchMap,
    requestedBatchId,
    view,
    hasExplicitBatch: Boolean(requestedBatchId),
  };
}

function getCurrentBatchForCourseFromContext(context, course = "") {
  if (!context?.batchMap) return null;
  return context.batchMap.get(normalizeCourseName(course || "")) || null;
}

function buildCurrentBatchAssessmentQuery(context) {
  const batchIds = Array.isArray(context?.batchIds) ? context.batchIds : [];
  if (!batchIds.length) return null;

  return {
    batchId: { $in: batchIds },
  };
}

/* =========================
   ASSIGNMENT / ASSESSMENT HELPERS
========================= */

function normalizeProfessorAssessmentCourse(value = "") {
  const clean = String(value || "").trim().toLowerCase();

  if (clean === "event management") return "Event Management";
  if (clean === "housekeeping") return "Housekeeping";

  return String(value || "").trim();
}

function getProfessorAssessmentAllowedCourses(req) {
  const raw = Array.isArray(req?.professor?.courseAssignments)
    ? req.professor.courseAssignments
    : [];

  return [
    ...new Set(
      raw
        .map((item) => normalizeProfessorAssessmentCourse(item))
        .filter(Boolean)
    ),
  ];
}

function getUploadedAssessmentFiles(req) {
  return [
    ...(req?.files?.assessmentFiles || []),
    ...(req?.files?.assessmentFile || []),
  ].filter(Boolean);
}

function parseProfessorJsonArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeAssessmentStoredFiles(row) {
  if (Array.isArray(row?.files) && row.files.length) {
    return row.files.map((file) => ({
      fileId: file?.fileId ? String(file.fileId) : "",
      originalName: file?.originalName || file?.filename || "Assignment File",
      filename: file?.filename || file?.originalName || "Assignment File",
      mimetype: file?.mimetype || "",
      size: Number(file?.size || 0),
    }));
  }

  const legacyFileId =
    row?.fileId || row?.file?.fileId || row?.file?.id || "";

  if (!legacyFileId) return [];

  return [
    {
      fileId: String(legacyFileId),
      originalName:
        row?.fileName ||
        row?.file?.originalName ||
        row?.file?.filename ||
        "Assignment File",
      filename:
        row?.file?.filename ||
        row?.fileName ||
        row?.file?.originalName ||
        "Assignment File",
      mimetype: row?.mimeType || row?.file?.mimetype || "",
      size: Number(row?.fileSize || row?.file?.size || 0),
    },
  ];
}

async function deleteAssessmentStoredFiles(files = []) {
  for (const file of files) {
    const fileId = String(file?.fileId || "").trim();
    if (!fileId) continue;
    await deleteFileFromTrainingGridFS(fileId).catch(() => null);
  }
}

function mapProfessorAssessment(row) {
  const files = normalizeAssessmentStoredFiles(row);
  const firstFile = files[0] || null;

  return {
    ...row,
    uploadOpenAt: row?.uploadOpenAt || null,
    files,
    fileCount: files.length,
    fileId: firstFile?.fileId || "",
    fileName: firstFile?.originalName || "Assignment File",
    mimeType: firstFile?.mimetype || "",
    fileSize: Number(firstFile?.size || 0),
  };
}

export async function professorLogin(req, res) {
  try {
    const { username = "", email = "", password = "" } = req.body || {};
    const identity = String(username || email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!identity || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required.",
      });
    }

    const professor = await ProfessorUser.findOne({
      $or: [{ username: identity }, { email: identity }],
    }).select("+password");

    if (!professor) {
      return res.status(401).json({
        success: false,
        message: "Invalid professor credentials.",
      });
    }

    if (!professor.active) {
      return res.status(403).json({
        success: false,
        message: "Professor account is inactive.",
      });
    }

    const matched = await bcrypt.compare(cleanPassword, professor.password || "");
    if (!matched) {
      return res.status(401).json({
        success: false,
        message: "Invalid professor credentials.",
      });
    }

    const professorPayload = {
      id: String(professor._id),
      email: professor.email,
      username: professor.username,
      name: `${professor.firstName || ""} ${professor.lastName || ""}`.trim(),
      role: "professor",
    };

    const signed = signProfessorToken(professorPayload);
    if (!signed.ok) {
      return res.status(500).json({
        success: false,
        message: signed.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Professor login successful.",
      professorToken: signed.token,
      professor: {
        ...professorPayload,
        firstName: professor.firstName,
        lastName: professor.lastName,
        mustChangePassword: professor.mustChangePassword,
        courseAssignments: normalizeCourseArray(
          professor.courseAssignments || []
        ),
      },
    });
  } catch (error) {
    console.error("professorLogin error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Professor login failed.",
    });
  }
}

export async function professorMe(req, res) {
  return res.status(200).json({
    success: true,
    professor: {
      ...req.professor,
      courseAssignments: getProfessorAllowedCourses(req),
    },
  });
}

export async function professorDashboard(req, res) {
  try {
    const batchContext = await resolveProfessorCurrentBatchContext(req, "");

    if (!batchContext.ok) {
      return res.status(batchContext.status).json({
        success: false,
        message: batchContext.message,
      });
    }

    if (!batchContext.batchIds.length) {
      return res.status(200).json({
        success: true,
        allowedCourses: batchContext.allowedCourses,
        stats: {
          totalTrainees: 0,
          activeAssessments: 0,
          todayAttendance: 0,
          totalScores: 0,
        },
      });
    }

    const today = toDateOnly(new Date().toISOString());
    const assessmentQuery = buildCurrentBatchAssessmentQuery(batchContext);

    const [totalTrainees, activeAssessments, todayAttendance] = await Promise.all(
      [
        TraineeUser.countDocuments({
          active: { $ne: false },
          batchId: { $in: batchContext.batchIds },
        }),
        assessmentQuery
          ? ProfessorAssessment.countDocuments({
              active: true,
              ...assessmentQuery,
            })
          : Promise.resolve(0),
        ProfessorAttendance.countDocuments({
          attendanceDate: today,
          batchId: { $in: batchContext.batchIds },
        }),
      ]
    );

    return res.status(200).json({
      success: true,
      allowedCourses: batchContext.allowedCourses,
      stats: {
        totalTrainees,
        activeAssessments,
        todayAttendance,
        totalScores: 0,
      },
    });
  } catch (error) {
    console.error("professorDashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load professor dashboard.",
    });
  }
}

export async function listProfessorTrainees(req, res) {
  try {
    const { course = "", batchId = "", view = "current" } = req.query || {};
    const batchContext = await resolveProfessorCurrentBatchContext(req, {
      incomingCourse: course,
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
      return res.status(200).json({
        success: true,
        allowedCourses: batchContext.allowedCourses,
        view: batchContext.view,
        selectedBatchId: batchContext.requestedBatchId || "",
        trainees: [],
      });
    }

    const query = {
      active: { $ne: false },
      batchId: { $in: batchContext.batchIds },
    };

    const trainees = await TraineeUser.find(query)
      .select(
        [
          "firstName",
          "lastName",
          "email",
          "course",
          "batchId",
          "batchCode",
          "batchName",
          "active",
          "pretestStatus",
          "pretestScorePercent",
          "pretestLastTakenAt",
          "learningPathLevel",
          "trainingStatus",
          "certificateStatus",
          "certificateId",
          "passedAt",
          "completedAt",
          "profilePhoto",
        ].join(" ")
      )
      .sort({ batchCode: -1, firstName: 1, lastName: 1 })
      .lean();

    const traineeIds = trainees
      .map((trainee) => trainee?._id)
      .filter(Boolean);

    const generatedEmails = trainees
      .map((trainee) => String(trainee?.email || "").trim().toLowerCase())
      .filter(Boolean);

    const enrollments = await EnrollmentRequest.find({
      $or: [
        { traineeUserId: { $in: traineeIds } },
        { generatedTraineeEmail: { $in: generatedEmails } },
      ],
    })
      .select("traineeUserId generatedTraineeEmail picture2x2")
      .sort({ createdAt: -1 })
      .lean();

    const enrollmentByTraineeId = new Map();
    const enrollmentByGeneratedEmail = new Map();

    for (const enrollment of enrollments) {
      const traineeUserId = enrollment?.traineeUserId
        ? String(enrollment.traineeUserId)
        : "";
      const generatedEmail = String(
        enrollment?.generatedTraineeEmail || ""
      ).trim().toLowerCase();

      if (traineeUserId && !enrollmentByTraineeId.has(traineeUserId)) {
        enrollmentByTraineeId.set(traineeUserId, enrollment);
      }

      if (generatedEmail && !enrollmentByGeneratedEmail.has(generatedEmail)) {
        enrollmentByGeneratedEmail.set(generatedEmail, enrollment);
      }
    }

    const normalizedTrainees = trainees.map((trainee) => {
      const pretestCompleted =
        trainee?.pretestStatus === "completed" || !!trainee?.pretestLastTakenAt;

      const traineeId = trainee?._id ? String(trainee._id) : "";
      const traineeEmail = String(trainee?.email || "").trim().toLowerCase();

      const enrollment =
        enrollmentByTraineeId.get(traineeId) ||
        enrollmentByGeneratedEmail.get(traineeEmail) ||
        null;

      return {
        ...trainee,
        batchId: trainee?.batchId ? String(trainee.batchId) : "",
        batchCode: trainee?.batchCode || "",
        batchName: trainee?.batchName || "",
        pretestStatus: pretestCompleted ? "completed" : "not_started",
        pretestScorePercent: Number(trainee?.pretestScorePercent || 0),
        pretestLastTakenAt: trainee?.pretestLastTakenAt || null,
        learningPathLevel: trainee?.learningPathLevel || "beginner",
        trainingStatus: trainee?.trainingStatus || "Enrolled",
        certificateStatus: trainee?.certificateStatus || "none",
        certificateId: trainee?.certificateId || null,
        passedAt: trainee?.passedAt || null,
        completedAt: trainee?.completedAt || null,
        profilePhoto: trainee?.profilePhoto || null,
        picture2x2: enrollment?.picture2x2 || null,
      };
    });

    return res.status(200).json({
      success: true,
      allowedCourses: batchContext.allowedCourses,
      view: batchContext.view,
      selectedBatchId: batchContext.requestedBatchId || "",
      trainees: normalizedTrainees,
    });
  } catch (error) {
    console.error("listProfessorTrainees error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load trainees.",
    });
  }
}

export const listProfessorAttendanceDates = async (req, res) => {
  try {
    const { course = "", batchId = "", view = "current" } = req.query || {};
    const batchContext = await resolveProfessorCurrentBatchContext(req, {
      incomingCourse: course,
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
        view: batchContext.view,
        selectedBatchId: batchContext.requestedBatchId || "",
        records: [],
        dates: [],
      });
    }

    const rows = await ProfessorAttendance.find({
      batchId: { $in: batchContext.batchIds },
    })
      .select("attendanceDate uploadOpenAt uploadCloseAt createdAt course batchId batchCode batchName")
      .sort({ uploadOpenAt: -1, createdAt: -1 })
      .lean();

    const seen = new Set();
    const records = [];

    for (const row of rows) {
      const key = buildAttendanceRecordKey(row);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      records.push(mapAttendanceRecordOption(row));
    }

    return res.json({
      success: true,
      view: batchContext.view,
      selectedBatchId: batchContext.requestedBatchId || "",
      records,
      dates: records.map((item) => item.attendanceDate).filter(Boolean),
    });
  } catch (error) {
    console.error("listProfessorAttendanceDates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load attendance record list.",
    });
  }
};

export async function listProfessorAttendance(req, res) {
  try {
    const {
      attendanceDate = "",
      uploadOpenAt = "",
      course = "",
      batchId = "",
      view = "current",
    } = req.query || {};

    const batchContext = await resolveProfessorCurrentBatchContext(req, {
      incomingCourse: course,
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
      return res.status(200).json({
        success: true,
        allowedCourses: batchContext.allowedCourses,
        view: batchContext.view,
        selectedBatchId: batchContext.requestedBatchId || "",
        attendance: [],
      });
    }

    const filter = {
      batchId: { $in: batchContext.batchIds },
    };

    if (uploadOpenAt) {
      const openAt = new Date(uploadOpenAt);

      if (Number.isNaN(openAt.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance record time.",
        });
      }

      filter.uploadOpenAt = openAt;
    } else if (attendanceDate) {
      const d = new Date(attendanceDate);

      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance date.",
        });
      }

      filter.attendanceDate = d.toISOString().slice(0, 10);
    }

    const attendance = await ProfessorAttendance.find(filter)
      .populate(
        "traineeUserId",
        "firstName lastName email course batchId batchCode batchName pretestStatus pretestScorePercent pretestLastTakenAt learningPathLevel trainingStatus certificateStatus"
      )
      .sort({ createdAt: -1, traineeName: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      allowedCourses: batchContext.allowedCourses,
      view: batchContext.view,
      selectedBatchId: batchContext.requestedBatchId || "",
      attendance,
    });
  } catch (error) {
    console.error("listProfessorAttendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load attendance.",
    });
  }
}

export async function saveProfessorAttendance(req, res) {
  try {
    const {
      traineeUserId,
      traineeName = "",
      email = "",
      course = "",
      attendanceDate = "",
      status = "Present",
      remarks = "",
      uploadOpenAt = "",
      uploadCloseAt = "",
    } = req.body || {};

    const dateOnly = normalizeDateOnly(attendanceDate);
    if (!traineeUserId || !dateOnly) {
      return res.status(400).json({
        success: false,
        message: "traineeUserId and valid attendanceDate are required.",
      });
    }

    if (!isValidObjectId(traineeUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trainee user id.",
      });
    }

    const trainee = await TraineeUser.findById(traineeUserId)
      .select("firstName lastName email course active batchId batchCode batchName")
      .lean();

    if (!trainee) {
      return res.status(404).json({
        success: false,
        message: "Trainee not found.",
      });
    }

    if (trainee.active === false) {
      return res.status(400).json({
        success: false,
        message: "Trainee account is inactive.",
      });
    }

    const traineeCourse = normalizeCourseName(trainee.course);
    if (!traineeCourse) {
      return res.status(400).json({
        success: false,
        message: "Trainee has no valid assigned course.",
      });
    }

    const batchContext = await resolveProfessorCurrentBatchContext(req, {
      incomingCourse: course || traineeCourse,
      view: "current",
    });

    if (!batchContext.ok) {
      return res.status(batchContext.status).json({
        success: false,
        message: batchContext.message,
      });
    }

    const currentBatch = getCurrentBatchForCourseFromContext(
      batchContext,
      traineeCourse
    );

    if (!currentBatch) {
      return res.status(400).json({
        success: false,
        message: "There is no current active batch for this course.",
      });
    }

    if (!trainee.batchId || String(trainee.batchId) !== String(currentBatch._id)) {
      return res.status(400).json({
        success: false,
        message: "This trainee is not part of the current batch.",
      });
    }

    const openAt = uploadOpenAt ? new Date(uploadOpenAt) : null;
    const closeAt = uploadCloseAt ? new Date(uploadCloseAt) : null;

    if (openAt && Number.isNaN(openAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid upload open time.",
      });
    }

    if (closeAt && Number.isNaN(closeAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid upload close time.",
      });
    }

    if (openAt && closeAt && closeAt.getTime() <= openAt.getTime()) {
      return res.status(400).json({
        success: false,
        message: "Upload close time must be later than upload open time.",
      });
    }

    if (!isAllowedAttendanceStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status.",
      });
    }

    const attendanceWindowKey = buildAttendanceWindowKey({
      attendanceDate: dateOnly,
      uploadOpenAt: openAt,
    });

    const existing = await ProfessorAttendance.findOne({
      batchId: String(currentBatch._id),
      traineeUserId,
      attendanceWindowKey,
    }).lean();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Attendance is already posted for this trainee in this attendance window.",
        attendanceId: String(existing._id),
      });
    }

    const doc = await ProfessorAttendance.create({
      batchId: String(currentBatch._id),
      batchCode: trainee.batchCode || currentBatch.batchCode || "",
      batchName: trainee.batchName || currentBatch.batchName || "",
      traineeUserId,
      traineeName:
        traineeName ||
        `${trainee.firstName || ""} ${trainee.lastName || ""}`.trim(),
      email: email || trainee.email || "",
      course: traineeCourse,
      attendanceDate: dateOnly,
      attendanceWindowKey,
      status: String(status).trim(),
      remarks: String(remarks || "").trim(),
      uploadOpenAt: openAt || null,
      uploadCloseAt: closeAt || null,
      createdByProfessorId: req?.professor?.id || null,
      createdByProfessorName: getProfessorDisplayName(req?.professor),
      proofReviewStatus: "pending",
      proofReviewRemarks: "",
      proofFile: null,
      proofFileId: "",
      traineeProofNote: "",
      submittedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "Attendance posted successfully.",
      attendance: doc,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        message: "Attendance is already posted for this trainee in this attendance window.",
      });
    }

    console.error("saveProfessorAttendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save attendance.",
    });
  }
}

export async function saveProfessorAttendanceBulk(req, res) {
  try {
    const professorId = req?.professor?.id || null;
    const professorUser = req?.professor || null;
    const allowedCourses = getProfessorAllowedCourses(req);

    if (!allowedCourses.length) {
      return res.status(403).json({
        success: false,
        message: "Professor has no assigned course.",
      });
    }

    const {
      attendanceDate = "",
      uploadOpenAt = "",
      uploadCloseAt = "",
      rows = [],
    } = req.body || {};

    const openAt = uploadOpenAt ? new Date(uploadOpenAt) : null;
    const closeAt = uploadCloseAt ? new Date(uploadCloseAt) : null;

    if (!openAt || Number.isNaN(openAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Valid upload open time is required.",
      });
    }

    if (!closeAt || Number.isNaN(closeAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Valid upload close time is required.",
      });
    }

    if (closeAt.getTime() <= openAt.getTime()) {
      return res.status(400).json({
        success: false,
        message: "Upload close time must be later than upload open time.",
      });
    }

    const dateOnly = normalizeDateOnly(attendanceDate || uploadOpenAt);
    if (!dateOnly) {
      return res.status(400).json({
        success: false,
        message: "Valid attendance date is required.",
      });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No attendance rows were provided.",
      });
    }

    const cleanedRows = rows
      .map((row) => ({
        traineeUserId: String(row?.traineeUserId || "").trim(),
        traineeName: String(row?.traineeName || "").trim(),
        email: String(row?.email || "").trim(),
        course: String(row?.course || "").trim(),
        status: String(row?.status || "Pending").trim(),
        remarks: String(row?.remarks || "").trim(),
      }))
      .filter((row) => row.traineeUserId && isValidObjectId(row.traineeUserId));

    if (cleanedRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid trainee attendance rows were provided.",
      });
    }

    for (const row of cleanedRows) {
      if (!isAllowedAttendanceStatus(row.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid attendance status for trainee ${
            row.traineeName || row.traineeUserId
          }.`,
        });
      }
    }

    const uniqueTraineeIds = [...new Set(cleanedRows.map((row) => row.traineeUserId))];

    const trainees = await TraineeUser.find({
      _id: { $in: uniqueTraineeIds },
      active: { $ne: false },
    })
      .select("firstName lastName email course active batchId batchCode batchName")
      .lean();

    const traineeMap = new Map(trainees.map((t) => [String(t._id), t]));
    const professorName = getProfessorDisplayName(professorUser);
    const batchContext = await resolveProfessorCurrentBatchContext(req, {
      view: "current",
    });

    if (!batchContext.ok) {
      return res.status(batchContext.status).json({
        success: false,
        message: batchContext.message,
      });
    }

    const attendanceWindowKey = buildAttendanceWindowKey({
      attendanceDate: dateOnly,
      uploadOpenAt: openAt,
    });

    const docsToInsert = [];
    const seenInRequest = new Set();

    for (const row of cleanedRows) {
      const trainee = traineeMap.get(String(row.traineeUserId));
      if (!trainee) continue;

      const traineeCourse = normalizeCourseName(trainee.course);
      if (!traineeCourse) {
        return res.status(400).json({
          success: false,
          message: "One or more trainees have no valid assigned course.",
        });
      }

      if (!allowedCourses.includes(traineeCourse)) {
        return res.status(403).json({
          success: false,
          message:
            "One or more trainees belong to a course you are not allowed to manage.",
        });
      }

      const currentBatch = getCurrentBatchForCourseFromContext(
        batchContext,
        traineeCourse
      );

      if (!currentBatch) {
        return res.status(400).json({
          success: false,
          message: `There is no current active batch for ${traineeCourse}.`,
        });
      }

      if (!trainee.batchId || String(trainee.batchId) !== String(currentBatch._id)) {
        return res.status(400).json({
          success: false,
          message: "One or more trainees are not part of the current batch.",
        });
      }

      const incomingCourse = normalizeCourseName(row.course || traineeCourse);
      if (incomingCourse && incomingCourse !== traineeCourse) {
        return res.status(400).json({
          success: false,
          message:
            "One or more rows have a course that does not match the trainee's assigned course.",
        });
      }

      if (seenInRequest.has(String(row.traineeUserId))) continue;
      seenInRequest.add(String(row.traineeUserId));

      docsToInsert.push({
        batchId: String(currentBatch._id),
        batchCode: trainee.batchCode || currentBatch.batchCode || "",
        batchName: trainee.batchName || currentBatch.batchName || "",
        traineeUserId: row.traineeUserId,
        traineeName:
          row.traineeName ||
          `${trainee.firstName || ""} ${trainee.lastName || ""}`.trim(),
        email: row.email || trainee.email || "",
        course: traineeCourse,
        attendanceDate: dateOnly,
        attendanceWindowKey,
        status: row.status || "Pending",
        remarks: row.remarks || "",
        uploadOpenAt: openAt,
        uploadCloseAt: closeAt,
        createdByProfessorId: professorId || null,
        createdByProfessorName: professorName,
        proofReviewStatus: "pending",
        proofReviewRemarks: "",
        proofFile: null,
        proofFileId: "",
        traineeProofNote: "",
        submittedAt: null,
      });
    }

    if (docsToInsert.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid active trainee rows were found.",
      });
    }

    const duplicateFilters = docsToInsert.map((doc) => ({
      batchId: doc.batchId,
      traineeUserId: doc.traineeUserId,
      attendanceWindowKey: doc.attendanceWindowKey,
    }));

    const existingRows = await ProfessorAttendance.find({
      $or: duplicateFilters,
    })
      .select("traineeUserId traineeName")
      .lean();

    if (existingRows.length) {
      const names = [
        ...new Set(
          existingRows.map((item) => item?.traineeName || String(item?.traineeUserId || "")).filter(Boolean)
        ),
      ];

      return res.status(409).json({
        success: false,
        message: `Attendance is already posted for: ${names.join(", ")}.`,
      });
    }

    const saved = await ProfessorAttendance.insertMany(docsToInsert, {
      ordered: true,
    });

    return res.status(201).json({
      success: true,
      message: "Attendance posted successfully.",
      attendance: saved,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        message: "Attendance is already posted for one or more trainees in this attendance window.",
      });
    }

    console.error("saveProfessorAttendanceBulk error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save attendance.",
    });
  }
}

export async function updateProfessorAttendance(req, res) {
  try {
    const { id } = req.params;
    const { status, remarks = "" } = req.body || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance id.",
      });
    }

    const attendance = await ProfessorAttendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    if (!isProfessorAllowedForCourse(req, attendance.course)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this attendance record.",
      });
    }

    if (status !== undefined && !isAllowedAttendanceStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status.",
      });
    }

    if (status !== undefined) {
      attendance.status = String(status).trim();
    }

    attendance.remarks = String(remarks || "").trim();
    attendance.markedByName = req.professor?.name || "Professor";
    attendance.markedByEmail = req.professor?.email || "";

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully.",
      attendance,
    });
  } catch (error) {
    console.error("updateProfessorAttendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update attendance.",
    });
  }
}

export async function reviewProfessorAttendanceProof(req, res) {
  try {
    const { attendanceId } = req.params;
    const {
      proofReviewStatus = "",
      proofReviewRemarks = "",
      status = "",
    } = req.body || {};

    if (!attendanceId || !isValidObjectId(attendanceId)) {
      return res.status(400).json({
        success: false,
        message: "Valid attendance id is required.",
      });
    }

    if (!["pending", "approved", "rejected"].includes(proofReviewStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid proof review status.",
      });
    }

    if (status && !isAllowedAttendanceStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status.",
      });
    }

    const attendance = await ProfessorAttendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    if (!isProfessorAllowedForCourse(req, attendance.course)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to review this attendance proof.",
      });
    }

    if (!attendance.proofFile?.fileId) {
      return res.status(400).json({
        success: false,
        message: "This attendance record has no uploaded proof.",
      });
    }

    attendance.proofReviewStatus = proofReviewStatus;
    attendance.proofReviewRemarks = String(proofReviewRemarks || "").trim();
    attendance.reviewedAt = new Date();
    attendance.reviewedByName = req?.professor?.name || "";
    attendance.reviewedByEmail = req?.professor?.email || "";

    if (status) {
      attendance.status = String(status).trim();
    } else if (
      proofReviewStatus === "approved" &&
      (!attendance.status || attendance.status === "Pending")
    ) {
      attendance.status = "Present";
    }

    if (proofReviewStatus === "approved") {
      attendance.markedByName = req?.professor?.name || "";
      attendance.markedByEmail = req?.professor?.email || "";
    }

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance proof reviewed successfully.",
      attendance: {
        id: String(attendance._id),
        attendanceDate: attendance.attendanceDate,
        status: attendance.status,
        proofReviewStatus: attendance.proofReviewStatus,
        proofReviewRemarks: attendance.proofReviewRemarks,
        reviewedAt: attendance.reviewedAt,
      },
    });
  } catch (error) {
    console.error("reviewProfessorAttendanceProof error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to review attendance proof.",
    });
  }
}

export async function exportProfessorAttendance(req, res) {
  try {
    const {
      attendanceDate = "",
      uploadOpenAt = "",
      batchId = "",
      course = "",
      view = "current",
    } = req.query || {};

    const batchContext = await resolveProfessorCurrentBatchContext(req, {
      incomingCourse: course,
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
      return res.status(200).send(
        [
          [
            "Attendance Date",
            "Trainee Name",
            "Course",
            "Status",
            "Remarks",
            "Marked By",
            "Marked By Email",
          ]
            .map(csvEscape)
            .join(","),
        ].join("\n")
      );
    }

    const query = {
      batchId: { $in: batchContext.batchIds },
    };

    if (uploadOpenAt) {
      const openAt = new Date(uploadOpenAt);
      if (Number.isNaN(openAt.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance record time.",
        });
      }
      query.uploadOpenAt = openAt;
    } else if (attendanceDate) {
      const dateOnly = normalizeDateOnly(attendanceDate);
      if (!dateOnly) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance date.",
        });
      }
      query.attendanceDate = dateOnly;
    }

    const items = await ProfessorAttendance.find(query)
      .sort({ attendanceDate: 1, traineeName: 1 })
      .lean();

    const lines = [
      [
        "Attendance Date",
        "Trainee Name",
        "Course",
        "Status",
        "Remarks",
        "Marked By",
        "Marked By Email",
      ]
        .map(csvEscape)
        .join(","),
      ...items.map((item) =>
        [
          item.attendanceDate,
          item.traineeName,
          item.course,
          item.status,
          item.remarks,
          item.markedByName,
          item.markedByEmail,
        ]
          .map(csvEscape)
          .join(",")
      ),
    ];

    const csv = lines.join("\n");
    const filenameBase =
      uploadOpenAt ||
      attendanceDate ||
      String(batchContext.requestedBatchId || "selected-batch");

    const safeFilename =
      String(filenameBase)
        .replace(/[^a-z0-9-_]+/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "selected-batch";

    const filename = `attendance-${safeFilename}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.status(200).send(csv);
  } catch (error) {
    console.error("exportProfessorAttendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export attendance.",
    });
  }
}

export async function listProfessorAssessments(req, res) {
  try {
    const { course = "", batchId = "", view = "current" } = req.query || {};
    const batchContext = await resolveProfessorCurrentBatchContext(req, {
      incomingCourse: course,
      batchId,
      view,
    });

    if (!batchContext.ok) {
      return res.status(batchContext.status).json({
        success: false,
        message: batchContext.message,
      });
    }

    const assessmentScope = buildCurrentBatchAssessmentQuery(batchContext);
    if (!assessmentScope) {
      return res.status(200).json({
        success: true,
        allowedCourses: batchContext.allowedCourses,
        view: batchContext.view,
        selectedBatchId: batchContext.requestedBatchId || "",
        assessments: [],
      });
    }

    const assessments = await ProfessorAssessment.find({
      ...assessmentScope,
      active: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      allowedCourses: batchContext.allowedCourses,
      view: batchContext.view,
      selectedBatchId: batchContext.requestedBatchId || "",
      assessments: assessments.map(mapProfessorAssessment),
    });
  } catch (error) {
    console.error("listProfessorAssessments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load assignments.",
    });
  }
}

export async function createProfessorAssessment(req, res) {
  try {
    const {
      title = "",
      description = "",
      course = "",
      totalPoints = 0,
      uploadOpenAt = "",
      dueDate = "",
    } = req.body || {};

    const files = getUploadedAssessmentFiles(req);

    if (!title || !course || Number(totalPoints) <= 0) {
      return res.status(400).json({
        success: false,
        message: "title, course, and totalPoints are required.",
      });
    }

    if (files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can upload up to 5 assignment files only.",
      });
    }

    const normalizedCourse = normalizeProfessorAssessmentCourse(course);
    if (!normalizedCourse) {
      return res.status(400).json({
        success: false,
        message: "Invalid course.",
      });
    }

    const batchContext = await resolveProfessorCurrentBatchContext(
      req,
      normalizedCourse
    );
    if (!batchContext.ok) {
      return res.status(batchContext.status).json({
        success: false,
        message: batchContext.message,
      });
    }

    const currentBatch = getCurrentBatchForCourseFromContext(
      batchContext,
      normalizedCourse
    );
    if (!currentBatch) {
      return res.status(400).json({
        success: false,
        message:
          "You can only create assignments when there is a current active batch for this course.",
      });
    }

    const openAtDate = uploadOpenAt ? new Date(uploadOpenAt) : null;
    const dueAtDate = dueDate ? new Date(dueDate) : null;

    if (openAtDate && Number.isNaN(openAtDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid upload open date/time.",
      });
    }

    if (dueAtDate && Number.isNaN(dueAtDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date/time.",
      });
    }

    if (openAtDate && dueAtDate && openAtDate.getTime() > dueAtDate.getTime()) {
      return res.status(400).json({
        success: false,
        message:
          "Upload open date/time must be earlier than or equal to the due date/time.",
      });
    }

    const uploadedFiles = await Promise.all(
      files.map((file) =>
        uploadBufferToTrainingGridFS(file, "training-assignments")
      )
    );

    const normalizedFiles = uploadedFiles.map((uploaded, index) => {
      const original = files[index];
      return {
        fileId: uploaded?.fileId,
        originalName:
          uploaded?.originalName ||
          uploaded?.filename ||
          original?.originalname ||
          "Assignment File",
        filename:
          uploaded?.filename ||
          uploaded?.originalName ||
          original?.originalname ||
          "Assignment File",
        mimetype: uploaded?.mimetype || original?.mimetype || "",
        size: Number(uploaded?.size || original?.size || 0),
      };
    });

    const firstFile = normalizedFiles[0] || null;

    const assessment = await ProfessorAssessment.create({
      title: String(title || "").trim(),
      description: String(description || "").trim(),
      course: normalizedCourse,
      batchId: String(currentBatch._id),
      batchCode: currentBatch.batchCode || "",
      batchName: currentBatch.batchName || "",
      totalPoints: Number(totalPoints),
      uploadOpenAt: openAtDate || null,
      dueDate: dueAtDate || null,
      active: true,
      files: normalizedFiles,
      file: firstFile || null,
      fileId: firstFile?.fileId ? String(firstFile.fileId) : "",
      fileName: firstFile?.originalName || "",
      mimeType: firstFile?.mimetype || "",
      fileSize: Number(firstFile?.size || 0),
      createdByName: req.professor?.name || "Professor",
      createdByEmail: req.professor?.email || "",
    });

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully.",
      assessment: mapProfessorAssessment(assessment.toObject()),
    });
  } catch (error) {
    console.error("createProfessorAssessment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create assignment.",
    });
  }
}

export async function updateProfessorAssessment(req, res) {
  let uploadedFiles = [];

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment id.",
      });
    }

    const {
      title = "",
      description = "",
      course = "",
      totalPoints = 0,
      uploadOpenAt = "",
      dueDate = "",
    } = req.body || {};

    const files = getUploadedAssessmentFiles(req);
    const removedFileIds = parseProfessorJsonArray(req.body.removedFileIds).map(
      (item) => String(item || "").trim()
    );

    const assessment = await ProfessorAssessment.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const currentCourse = normalizeProfessorAssessmentCourse(
      assessment.course || ""
    );
    const batchContext = await resolveProfessorCurrentBatchContext(
      req,
      currentCourse
    );

    if (!batchContext.ok) {
      return res.status(batchContext.status).json({
        success: false,
        message: batchContext.message,
      });
    }

    const currentBatch = getCurrentBatchForCourseFromContext(
      batchContext,
      currentCourse
    );
    if (!currentBatch) {
      return res.status(400).json({
        success: false,
        message: "There is no current active batch for this course.",
      });
    }

    const belongsToCurrentBatch = assessment?.batchId
      ? String(assessment.batchId) === String(currentBatch._id)
      : new Date(assessment.createdAt).getTime() >=
        new Date(currentBatch.createdAt).getTime();

    if (!belongsToCurrentBatch) {
      return res.status(403).json({
        success: false,
        message: "You can only edit assignments that belong to the current batch.",
      });
    }

    const normalizedCourse = normalizeProfessorAssessmentCourse(
      course || assessment.course || ""
    );
    if (!normalizedCourse) {
      return res.status(400).json({
        success: false,
        message: "Invalid course.",
      });
    }

    if (normalizedCourse !== currentCourse) {
      return res.status(400).json({
        success: false,
        message: "Assignments cannot be moved to another batch course here.",
      });
    }

    const openAtDate = uploadOpenAt ? new Date(uploadOpenAt) : null;
    const dueAtDate = dueDate ? new Date(dueDate) : null;

    if (openAtDate && Number.isNaN(openAtDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid upload open date/time.",
      });
    }

    if (dueAtDate && Number.isNaN(dueAtDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date/time.",
      });
    }

    if (openAtDate && dueAtDate && openAtDate.getTime() > dueAtDate.getTime()) {
      return res.status(400).json({
        success: false,
        message:
          "Upload open date/time must be earlier than or equal to the due date/time.",
      });
    }

    const existingFiles = normalizeAssessmentStoredFiles(assessment.toObject());
    const filesToDelete = existingFiles.filter((file) =>
      removedFileIds.includes(String(file.fileId || ""))
    );
    const keptExistingFiles = existingFiles.filter(
      (file) => !removedFileIds.includes(String(file.fileId || ""))
    );

    if (files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can upload up to 5 assignment files only.",
      });
    }

    uploadedFiles = await Promise.all(
      files.map((file) =>
        uploadBufferToTrainingGridFS(file, "training-assignments")
      )
    );

    const normalizedNewFiles = uploadedFiles.map((uploaded, index) => {
      const original = files[index];
      return {
        fileId: uploaded?.fileId,
        originalName:
          uploaded?.originalName ||
          uploaded?.filename ||
          original?.originalname ||
          "Assignment File",
        filename:
          uploaded?.filename ||
          uploaded?.originalName ||
          original?.originalname ||
          "Assignment File",
        mimetype: uploaded?.mimetype || original?.mimetype || "",
        size: Number(uploaded?.size || original?.size || 0),
      };
    });

    const finalFiles = [...keptExistingFiles, ...normalizedNewFiles];

    if (finalFiles.length > 5) {
      return res.status(400).json({
        success: false,
        message: "An assignment can only have up to 5 files.",
      });
    }

    const firstFile = finalFiles[0] || null;

    assessment.title = String(title || "").trim();
    assessment.description = String(description || "").trim();
    assessment.totalPoints = Number(totalPoints);
    assessment.uploadOpenAt = openAtDate || null;
    assessment.dueDate = dueAtDate || null;
    assessment.active = true;
    assessment.batchId = String(currentBatch._id);
    assessment.batchCode = currentBatch.batchCode || "";
    assessment.batchName = currentBatch.batchName || "";
    assessment.files = finalFiles;
    assessment.file = firstFile || null;
    assessment.fileId = firstFile?.fileId ? String(firstFile.fileId) : "";
    assessment.fileName = firstFile?.originalName || "";
    assessment.mimeType = firstFile?.mimetype || "";
    assessment.fileSize = Number(firstFile?.size || 0);

    await assessment.save();
    await deleteAssessmentStoredFiles(filesToDelete);

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully.",
      assessment: mapProfessorAssessment(assessment.toObject()),
    });
  } catch (error) {
    await deleteAssessmentStoredFiles(
      uploadedFiles.map((file, index) => ({
        fileId: file?.fileId,
        originalName: file?.originalName || `uploaded-${index + 1}`,
      }))
    );

    console.error("updateProfessorAssessment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update assignment.",
    });
  }
}

export async function deleteProfessorAssessment(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment id.",
      });
    }

    const assessment = await ProfessorAssessment.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const currentCourse = normalizeProfessorAssessmentCourse(
      assessment.course || ""
    );
    const batchContext = await resolveProfessorCurrentBatchContext(
      req,
      currentCourse
    );

    if (!batchContext.ok) {
      return res.status(batchContext.status).json({
        success: false,
        message: batchContext.message,
      });
    }

    const currentBatch = getCurrentBatchForCourseFromContext(
      batchContext,
      currentCourse
    );
    if (!currentBatch) {
      return res.status(400).json({
        success: false,
        message: "There is no current active batch for this course.",
      });
    }

    const belongsToCurrentBatch = assessment?.batchId
      ? String(assessment.batchId) === String(currentBatch._id)
      : new Date(assessment.createdAt).getTime() >=
        new Date(currentBatch.createdAt).getTime();

    if (!belongsToCurrentBatch) {
      return res.status(403).json({
        success: false,
        message: "You can only delete assignments that belong to the current batch.",
      });
    }

    const filesToDelete = normalizeAssessmentStoredFiles(assessment.toObject());

    await ProfessorAssessment.findByIdAndDelete(id);
    await deleteAssessmentStoredFiles(filesToDelete);

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully.",
      assessment,
    });
  } catch (error) {
    console.error("deleteProfessorAssessment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete assignment.",
    });
  }
}

export async function listProfessorScores(req, res) {
  try {
    const { course = "", traineeUserId = "", assessmentId = "" } = req.query || {};
    const resolved = resolveProfessorCourse(req, course === "All" ? "" : course);

    if (!resolved.ok) {
      return res.status(403).json({
        success: false,
        message: resolved.message,
      });
    }

    const query = {
      course: getResolvedCourseFilter(resolved),
    };

    if (traineeUserId) {
      if (!isValidObjectId(traineeUserId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid trainee id.",
        });
      }
      query.traineeUserId = traineeUserId;
    }

    if (assessmentId) {
      if (!isValidObjectId(assessmentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assessment id.",
        });
      }
      query.assessmentId = assessmentId;
    }

    const scores = await ProfessorScore.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      allowedCourses: resolved.allowedCourses,
      scores,
    });
  } catch (error) {
    console.error("listProfessorScores error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load scores.",
    });
  }
}

export async function saveProfessorScore(req, res) {
  try {
    const { traineeUserId, assessmentId, score = 0, remarks = "" } = req.body || {};

    if (!traineeUserId || !assessmentId) {
      return res.status(400).json({
        success: false,
        message: "traineeUserId and assessmentId are required.",
      });
    }

    if (!isValidObjectId(traineeUserId) || !isValidObjectId(assessmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trainee or assessment id.",
      });
    }

    const [trainee, assessment] = await Promise.all([
      TraineeUser.findById(traineeUserId)
        .select("firstName lastName course active")
        .lean(),
      ProfessorAssessment.findById(assessmentId).lean(),
    ]);

    if (!trainee || !assessment) {
      return res.status(404).json({
        success: false,
        message: "Trainee or assessment not found.",
      });
    }

    if (trainee.active === false) {
      return res.status(400).json({
        success: false,
        message: "Trainee account is inactive.",
      });
    }

    const traineeCourse = normalizeCourseName(trainee.course);
    const assessmentCourse = normalizeCourseName(assessment.course);

    if (!traineeCourse || !assessmentCourse) {
      return res.status(400).json({
        success: false,
        message: "Trainee or assessment has an invalid course.",
      });
    }

    if (traineeCourse !== assessmentCourse) {
      return res.status(400).json({
        success: false,
        message: "Trainee course and assessment course do not match.",
      });
    }

    if (!isProfessorAllowedForCourse(req, traineeCourse)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to save scores for this course.",
      });
    }

    const numericScore = Number(score);
    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > Number(assessment.totalPoints)
    ) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${assessment.totalPoints}.`,
      });
    }

    const percentage = Number(
      ((numericScore / Number(assessment.totalPoints)) * 100).toFixed(2)
    );

    const doc = await ProfessorScore.findOneAndUpdate(
      {
        traineeUserId,
        assessmentId,
      },
      {
        traineeUserId,
        traineeName: `${trainee.firstName || ""} ${trainee.lastName || ""}`.trim(),
        assessmentId,
        assessmentTitle: assessment.title,
        course: assessmentCourse,
        score: numericScore,
        totalPoints: Number(assessment.totalPoints),
        percentage,
        remarks: String(remarks || "").trim(),
        gradedByName: req.professor?.name || "Professor",
        gradedByEmail: req.professor?.email || "",
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Score saved successfully.",
      score: doc,
    });
  } catch (error) {
    console.error("saveProfessorScore error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save score.",
    });
  }
}

export async function updateProfessorScore(req, res) {
  try {
    const { id } = req.params;
    const { score = 0, remarks = "" } = req.body || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid score id.",
      });
    }

    const existing = await ProfessorScore.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Score not found.",
      });
    }

    if (!isProfessorAllowedForCourse(req, existing.course)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this score.",
      });
    }

    const numericScore = Number(score);
    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > Number(existing.totalPoints)
    ) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${existing.totalPoints}.`,
      });
    }

    const percentage = Number(
      ((numericScore / Number(existing.totalPoints)) * 100).toFixed(2)
    );

    existing.score = numericScore;
    existing.percentage = percentage;
    existing.remarks = String(remarks || "").trim();
    existing.gradedByName = req.professor?.name || "Professor";
    existing.gradedByEmail = req.professor?.email || "";

    await existing.save();

    return res.status(200).json({
      success: true,
      message: "Score updated successfully.",
      score: existing,
    });
  } catch (error) {
    console.error("updateProfessorScore error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update score.",
    });
  }
}

export async function deleteProfessorScore(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid score id.",
      });
    }

    const doc = await ProfessorScore.findById(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Score not found.",
      });
    }

    if (!isProfessorAllowedForCourse(req, doc.course)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this score.",
      });
    }

    await ProfessorScore.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Score deleted successfully.",
      score: doc,
    });
  } catch (error) {
    console.error("deleteProfessorScore error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete score.",
    });
  }
}
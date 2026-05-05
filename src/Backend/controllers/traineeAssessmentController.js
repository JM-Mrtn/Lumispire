import mongoose from "mongoose";
import TraineeUser from "../models/TraineeUser.js";
import ProfessorAssessment from "../models/ProfessorAssessment.js";
import ProfessorScore from "../models/ProfessorScore.js";
import TraineeAssessmentSubmission from "../models/TraineeAssessmentSubmission.js";
import TrainingBatch from "../models/TrainingBatch.js";
import { DEFAULT_PRETEST_BANK, getCourseKey } from "../utils/trainingPretestBank.js";
import {
  uploadBufferToTrainingGridFS,
  deleteFileFromTrainingGridFS,
} from "../utils/trainingGridfs.js";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizeCourseName(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (clean === "housekeeping") return "Housekeeping";
  if (clean === "event management") return "Event Management";
  return String(value || "").trim();
}

async function getCurrentBatchForCourse(course = "") {
  const normalizedCourse = normalizeCourseName(course);
  if (!normalizedCourse) return null;

  return TrainingBatch.findOne({
    course: normalizedCourse,
    isActive: true,
    status: { $ne: "archived" },
  }).sort({ createdAt: -1 });
}

function toDateOnly(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeAssessmentFiles(row) {
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

function mapSubmission(row) {
  const files = normalizeAssessmentFiles(row);
  const firstFile = files[0] || null;

  return {
    id: String(row?._id || ""),
    submissionId: String(row?._id || ""),
    traineeUserId: String(row?.traineeUserId || ""),
    traineeName: row?.traineeName || "",
    course: row?.course || "",
    assessmentId: String(row?.assessmentId || ""),
    assessmentTitle: row?.assessmentTitle || "",
    files,
    fileCount: files.length,
    fileId: firstFile?.fileId || "",
    fileName: firstFile?.originalName || "Submission File",
    mimeType: firstFile?.mimetype || "",
    fileSize: Number(firstFile?.size || 0),
    status: row?.status || "Submitted",
    isLateSubmission: Boolean(row?.isLateSubmission),
    lateSubmittedAt: row?.lateSubmittedAt || null,
    submittedAt: row?.submittedAt || null,
    updatedAt: row?.updatedAt || null,
  };
}

function getUploadedSubmissionFiles(req) {
  return [
    ...(req?.files?.submissionFiles || []),
    ...(req?.files?.submissionFile || []),
  ].filter(Boolean);
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

async function deleteStoredFiles(rows = []) {
  for (const file of rows) {
    await deleteFileFromTrainingGridFS(file?.fileId).catch(() => null);
  }
}

export async function listTraineeAssessments(req, res) {
  try {
    const traineeId = req?.trainee?.id;

    if (!traineeId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized trainee request.",
      });
    }

    const trainee = await TraineeUser.findById(traineeId)
      .select("firstName lastName course active batchId pretestStatus pretestLastTakenAt")
      .lean();

    if (!trainee) {
      return res.status(404).json({
        success: false,
        message: "Trainee not found.",
      });
    }

    if (trainee.active === false) {
      return res.status(403).json({
        success: false,
        message: "Trainee account is inactive.",
      });
    }

    if (isPretestRequiredForCourse(trainee.course) && !hasCompletedPretest(trainee)) {
      return res.status(403).json({
        success: false,
        message: "Please complete the pre-test first before submitting assignments.",
      });
    }

    const traineeCourse = String(trainee.course || "").trim();
    const currentBatch = await getCurrentBatchForCourse(traineeCourse);

    if (
      !currentBatch ||
      !trainee.batchId ||
      String(trainee.batchId) !== String(currentBatch._id)
    ) {
      return res.status(200).json({
        success: true,
        pretestRequired: true,
        pretestCompleted: hasCompletedPretest(trainee),
        assessments: [],
      });
    }

    if (!traineeCourse) {
      return res.status(200).json({
        success: true,
        pretestRequired: true,
        pretestCompleted: hasCompletedPretest(trainee),
        assessments: [],
      });
    }

    const [assessments, scores, submissions] = await Promise.all([
      ProfessorAssessment.find({
        active: true,
        course: traineeCourse,
        batchId: currentBatch._id,
      })
        .sort({ dueDate: 1, createdAt: -1 })
        .lean(),

      ProfessorScore.find({
        traineeUserId: traineeId,
      })
        .select("assessmentId score totalPoints percentage")
        .lean(),

      TraineeAssessmentSubmission.find({
        traineeUserId: traineeId,
      }).lean(),
    ]);

    const scoreMap = new Map(
      scores.map((item) => [String(item.assessmentId), item])
    );

    const submissionMap = new Map(
      submissions.map((item) => [String(item.assessmentId), item])
    );

    const now = new Date();

    const visibleAssessments = assessments.filter((assessment) => {
      if (!assessment?.uploadOpenAt) return true;
      const openAt = new Date(assessment.uploadOpenAt);
      if (Number.isNaN(openAt.getTime())) return true;
      return openAt.getTime() <= now.getTime();
    });

    const mapped = visibleAssessments.map((assessment) => {
      const assessmentId = String(assessment._id);
      const matchedScore = scoreMap.get(assessmentId);
      const matchedSubmission = submissionMap.get(assessmentId);

      const dueAt = assessment.dueDate ? new Date(assessment.dueDate) : null;
      const isPastDue =
        dueAt instanceof Date &&
        !Number.isNaN(dueAt.getTime()) &&
        dueAt.getTime() < now.getTime();

      const submittedAt = matchedSubmission?.submittedAt
        ? new Date(matchedSubmission.submittedAt)
        : null;

      const submittedLate = Boolean(matchedSubmission?.isLateSubmission) ||
        (Boolean(matchedSubmission) &&
          dueAt instanceof Date &&
          !Number.isNaN(dueAt.getTime()) &&
          submittedAt instanceof Date &&
          !Number.isNaN(submittedAt.getTime()) &&
          submittedAt.getTime() > dueAt.getTime());

      let tab = "upcoming";
      let statusText = "Open";

      if (matchedScore) {
        tab = "completed";
        statusText = submittedLate ? "Turned In Late - Graded" : "Graded";
      } else if (matchedSubmission) {
        tab = "completed";
        statusText = submittedLate ? "Turned In Late" : "Submitted";
      } else if (isPastDue) {
        tab = "pastDue";
        statusText = "Turn In Late";
      }

      const uploadOpenAt = assessment.uploadOpenAt || null;
      const openAtDate = uploadOpenAt ? new Date(uploadOpenAt) : null;
      const files = normalizeAssessmentFiles(assessment);

      const canSubmit =
        (!isPretestRequiredForCourse(trainee.course) || hasCompletedPretest(trainee)) &&
        !matchedScore &&
        (!openAtDate ||
          Number.isNaN(openAtDate.getTime()) ||
          openAtDate.getTime() <= now.getTime());

      const canSubmitLate = canSubmit && isPastDue;

      return {
        id: assessmentId,
        assessmentId,
        title: assessment.title || "Untitled Assignment",
        description:
          assessment.description ||
          "Click here to see the full details about this assignment.",
        deadline: toDateOnly(assessment.dueDate),
        dueDate: assessment.dueDate || null,
        uploadOpenAt,
        tab,
        statusText,
        course: assessment.course || "",
        totalPoints: assessment.totalPoints || 0,
        active: assessment.active === true,
        score: matchedScore?.score ?? null,
        percentage: matchedScore?.percentage ?? null,
        files,
        fileCount: files.length,
        submission: matchedSubmission ? mapSubmission(matchedSubmission) : null,
        isPastDue,
        canSubmit,
        canSubmitLate,
        isLateSubmission: submittedLate,
      };
    });

    return res.status(200).json({
      success: true,
      pretestRequired: true,
      pretestCompleted: hasCompletedPretest(trainee),
      assessments: mapped,
    });
  } catch (error) {
    console.error("listTraineeAssessments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load trainee assignments.",
    });
  }
}

export async function submitTraineeAssessment(req, res) {
  let uploadedFiles = [];

  try {
    const traineeId = req?.trainee?.id;
    const { assessmentId = "" } = req.params || {};
    const files = getUploadedSubmissionFiles(req);

    if (!traineeId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized trainee request.",
      });
    }

    if (!isValidObjectId(assessmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment id.",
      });
    }

    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least 1 submission file.",
      });
    }

    if (files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can upload up to 5 submission files only.",
      });
    }

    const [trainee, assessment, existingScore, existingSubmission] = await Promise.all([
      TraineeUser.findById(traineeId)
        .select("firstName lastName course active batchId pretestStatus pretestLastTakenAt")
        .lean(),
      ProfessorAssessment.findById(assessmentId).lean(),
      ProfessorScore.findOne({
        traineeUserId: traineeId,
        assessmentId,
      }).lean(),
      TraineeAssessmentSubmission.findOne({
        assessmentId,
        traineeUserId: traineeId,
      }).lean(),
    ]);

    if (!trainee) {
      return res.status(404).json({
        success: false,
        message: "Trainee not found.",
      });
    }

    if (trainee.active === false) {
      return res.status(403).json({
        success: false,
        message: "Trainee account is inactive.",
      });
    }

    if (isPretestRequiredForCourse(trainee.course) && !hasCompletedPretest(trainee)) {
      return res.status(403).json({
        success: false,
        message: "Please complete the pre-test first before submitting assignments.",
      });
    }

    if (!assessment || assessment.active === false) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const currentBatch = await getCurrentBatchForCourse(
      String(trainee.course || "").trim()
    );

    if (
      !currentBatch ||
      !trainee.batchId ||
      String(trainee.batchId) !== String(currentBatch._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not part of the current active batch for this course.",
      });
    }

    if (!assessment.batchId || String(assessment.batchId) !== String(currentBatch._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to submit to this assignment.",
      });
    }

    if (String(assessment.course || "").trim() !== String(trainee.course || "").trim()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to submit to this assignment.",
      });
    }

    if (existingScore) {
      return res.status(400).json({
        success: false,
        message: "This assignment is already graded and can no longer be resubmitted.",
      });
    }

    const now = new Date();

    if (assessment.uploadOpenAt) {
      const openAt = new Date(assessment.uploadOpenAt);
      if (!Number.isNaN(openAt.getTime()) && openAt.getTime() > now.getTime()) {
        return res.status(400).json({
          success: false,
          message: "This assignment is not open for submission yet.",
        });
      }
    }

    let isLateSubmission = false;
    let lateSubmittedAt = null;

    if (assessment.dueDate) {
      const dueAt = new Date(assessment.dueDate);
      if (!Number.isNaN(dueAt.getTime()) && dueAt.getTime() < now.getTime()) {
        isLateSubmission = true;
        lateSubmittedAt = now;
      }
    }

    uploadedFiles = await Promise.all(
      files.map((file) =>
        uploadBufferToTrainingGridFS(file, "trainee-assignment-submissions")
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
          "Submission File",
        filename:
          uploaded?.filename ||
          uploaded?.originalName ||
          original?.originalname ||
          "Submission File",
        mimetype: uploaded?.mimetype || original?.mimetype || "",
        size: Number(uploaded?.size || original?.size || 0),
      };
    });

    const firstFile = normalizedFiles[0] || null;

    const submission = await TraineeAssessmentSubmission.findOneAndUpdate(
      {
        assessmentId,
        traineeUserId: traineeId,
      },
      {
        assessmentId,
        traineeUserId: traineeId,
        traineeName: `${trainee.firstName || ""} ${trainee.lastName || ""}`.trim(),
        course: trainee.course || "",
        assessmentTitle: assessment.title || "",
        files: normalizedFiles,
        file: firstFile || null,
        fileId: firstFile?.fileId ? String(firstFile.fileId) : "",
        fileName: firstFile?.originalName || "",
        mimeType: firstFile?.mimetype || "",
        fileSize: Number(firstFile?.size || 0),
        status: isLateSubmission ? "Turned In Late" : "Submitted",
        isLateSubmission,
        lateSubmittedAt,
        submittedAt: now,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    if (existingSubmission) {
      const oldFiles = normalizeAssessmentFiles(existingSubmission);
      await deleteStoredFiles(oldFiles);
    }

    return res.status(200).json({
      success: true,
      message: isLateSubmission
        ? "Assignment turned in late successfully."
        : "Assignment submitted successfully.",
      submission: mapSubmission(submission),
    });
  } catch (error) {
    await deleteStoredFiles(uploadedFiles);

    console.error("submitTraineeAssessment error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate submission was blocked. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit assignment.",
    });
  }
}
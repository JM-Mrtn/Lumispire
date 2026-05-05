import mongoose from "mongoose";
import TrainingBatch from "../models/TrainingBatch.js";
import ProfessorAssessment from "../models/ProfessorAssessment.js";
import ProfessorScore from "../models/ProfessorScore.js";
import TraineeAssessmentSubmission from "../models/TraineeAssessmentSubmission.js";
import TraineeUser from "../models/TraineeUser.js";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizeCourseName(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (clean === "event management") return "Event Management";
  if (clean === "housekeeping") return "Housekeeping";
  return String(value || "").trim();
}

function getAllowedCourses(req) {
  const raw = Array.isArray(req?.professor?.courseAssignments)
    ? req.professor.courseAssignments
    : [];

  return [
    ...new Set(raw.map((item) => normalizeCourseName(item)).filter(Boolean)),
  ];
}

async function getAssessmentBatch(assessment) {
  const assessmentCourse = normalizeCourseName(assessment?.course || "");
  if (!assessmentCourse) return null;

  const explicitBatchId = String(assessment?.batchId || "").trim();
  if (explicitBatchId && isValidObjectId(explicitBatchId)) {
    const explicitBatch = await TrainingBatch.findOne({
      _id: explicitBatchId,
      course: assessmentCourse,
    }).lean();

    if (explicitBatch) return explicitBatch;
  }

  return TrainingBatch.findOne({
    course: assessmentCourse,
    createdAt: { $lte: assessment?.createdAt || new Date() },
  })
    .sort({ createdAt: -1 })
    .lean();
}

function normalizeStoredFiles(row) {
  if (Array.isArray(row?.files) && row.files.length) {
    return row.files.map((file) => ({
      fileId: file?.fileId ? String(file.fileId) : "",
      originalName: file?.originalName || file?.filename || "Submission File",
      filename: file?.filename || file?.originalName || "Submission File",
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
        "Submission File",
      filename:
        row?.file?.filename ||
        row?.fileName ||
        row?.file?.originalName ||
        "Submission File",
      mimetype: row?.mimeType || row?.file?.mimetype || "",
      size: Number(row?.fileSize || row?.file?.size || 0),
    },
  ];
}

export async function listProfessorAssessmentSubmissions(req, res) {
  try {
    const { id = "" } = req.params || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment id.",
      });
    }

    const assessment = await ProfessorAssessment.findById(id).lean();

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const allowedCourses = getAllowedCourses(req);
    const assessmentCourse = normalizeCourseName(assessment.course || "");

    if (allowedCourses.length && !allowedCourses.includes(assessmentCourse)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view submissions for this assignment.",
      });
    }

    const assessmentBatch = await getAssessmentBatch(assessment);
    if (!assessmentBatch) {
      return res.status(200).json({
        success: true,
        submissions: [],
      });
    }

    const batchTrainees = await TraineeUser.find({
      active: { $ne: false },
      batchId: String(assessmentBatch._id),
    })
      .select("_id")
      .lean();

    const batchTraineeIds = batchTrainees.map((row) => row._id);

    if (!batchTraineeIds.length) {
      return res.status(200).json({
        success: true,
        submissions: [],
      });
    }

    const [submissions, scores] = await Promise.all([
      TraineeAssessmentSubmission.find({
        assessmentId: id,
        traineeUserId: { $in: batchTraineeIds },
      })
        .sort({ submittedAt: -1 })
        .lean(),
      ProfessorScore.find({
        assessmentId: id,
        traineeUserId: { $in: batchTraineeIds },
      })
        .select("traineeUserId score totalPoints percentage")
        .lean(),
    ]);

    const scoreMap = new Map(
      scores.map((item) => [String(item.traineeUserId), item])
    );

    const mapped = submissions.map((submission) => {
      const files = normalizeStoredFiles(submission);
      const matchedScore = scoreMap.get(String(submission.traineeUserId));

      return {
        id: String(submission._id || ""),
        submissionId: String(submission._id || ""),
        traineeUserId: String(submission.traineeUserId || ""),
        traineeName: submission.traineeName || "",
        course: submission.course || "",
        assessmentId: String(submission.assessmentId || ""),
        assessmentTitle: submission.assessmentTitle || "",
        files,
        fileCount: files.length,
        submittedAt: submission.submittedAt || null,
        updatedAt: submission.updatedAt || null,
        score: matchedScore?.score ?? null,
        percentage: matchedScore?.percentage ?? null,
      };
    });

    return res.status(200).json({
      success: true,
      batchId: String(assessmentBatch._id || ""),
      batchCode: assessmentBatch.batchCode || "",
      batchName: assessmentBatch.batchName || "",
      submissions: mapped,
    });
  } catch (error) {
    console.error("listProfessorAssessmentSubmissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load assignment submissions.",
    });
  }
}

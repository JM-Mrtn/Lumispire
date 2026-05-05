import mongoose from "mongoose";
import TraineeUser from "../models/TraineeUser.js";
import ProfessorAttendance from "../models/ProfessorAttendance.js";
import TrainingBatch from "../models/TrainingBatch.js";
import {
  uploadBufferToTrainingGridFS,
  deleteFileFromTrainingGridFS,
} from "../utils/trainingGridfs.js";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizeDateOnly(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
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
  })
    .sort({ createdAt: -1 })
    .lean();
}

function getWindowStatus(now, openAt, closeAt) {
  const hasOpen = openAt instanceof Date && !Number.isNaN(openAt.getTime());
  const hasClose = closeAt instanceof Date && !Number.isNaN(closeAt.getTime());

  if (hasOpen && now.getTime() < openAt.getTime()) return "not_open";
  if (hasClose && now.getTime() > closeAt.getTime()) return "closed";
  return "open";
}

function mapAttendanceRow(row) {
  const now = new Date();

  const uploadOpenAt = row?.uploadOpenAt ? new Date(row.uploadOpenAt) : null;
  const uploadCloseAt = row?.uploadCloseAt ? new Date(row.uploadCloseAt) : null;

  const proofReviewStatus = String(
    row?.proofReviewStatus || "pending"
  ).toLowerCase();

  const windowStatus = getWindowStatus(now, uploadOpenAt, uploadCloseAt);

  const hasProof = Boolean(
    row?.proofFileId ||
      row?.proofFile?.fileId ||
      row?.proofFile?.id
  );

  const canUpload =
    windowStatus === "open" &&
    proofReviewStatus !== "approved";

  return {
    id: String(row?._id || ""),
    traineeUserId: row?.traineeUserId?._id
      ? String(row.traineeUserId._id)
      : String(row?.traineeUserId || ""),
    traineeName: row?.traineeName || "",
    email: row?.email || "",
    course: row?.course || "",
    attendanceDate: normalizeDateOnly(row?.attendanceDate),
    status: row?.status || "Pending",
    remarks: row?.remarks || "",
    proofReviewStatus,
    proofReviewRemarks: row?.proofReviewRemarks || "",
    traineeProofNote: row?.traineeProofNote || "",
    proofFileId:
      row?.proofFileId ||
      row?.proofFile?.fileId ||
      row?.proofFile?.id ||
      "",
    proofFileName:
      row?.proofFile?.originalName ||
      row?.proofFile?.filename ||
      row?.proofFile?.name ||
      "",
    submittedAt: row?.submittedAt || null,
    createdAt: row?.createdAt || null,
    uploadOpenAt: uploadOpenAt ? uploadOpenAt.toISOString() : null,
    uploadCloseAt: uploadCloseAt ? uploadCloseAt.toISOString() : null,
    windowStatus,
    canUpload,
    hasProof,
  };
}

export async function listMyTraineeAttendance(req, res) {
  try {
    const traineeId = req?.trainee?.id;

    if (!traineeId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized trainee request.",
      });
    }

    const trainee = await TraineeUser.findById(traineeId)
      .select("firstName lastName email course active batchId")
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

    const currentBatch = await getCurrentBatchForCourse(trainee.course || "");

    if (
      !currentBatch ||
      !trainee.batchId ||
      String(trainee.batchId) !== String(currentBatch._id)
    ) {
      return res.status(200).json({
        success: true,
        attendance: [],
      });
    }

    const rows = await ProfessorAttendance.find({
      traineeUserId: traineeId,
      batchId: String(currentBatch._id),
    })
      .sort({ createdAt: -1, attendanceDate: -1, submittedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      attendance: rows.map(mapAttendanceRow),
    });
  } catch (error) {
    console.error("listMyTraineeAttendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load trainee attendance.",
    });
  }
}

export async function submitTraineeAttendanceProof(req, res) {
  let uploaded = null;

  try {
    const traineeId = req?.trainee?.id;
    const {
      attendanceId = "",
      traineeProofNote = "",
      traineeNote = "",
    } = req.body || {};
    const file = req.file;

    if (!traineeId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized trainee request.",
      });
    }

    if (!attendanceId || !isValidObjectId(attendanceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance record.",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a proof file.",
      });
    }

    const trainee = await TraineeUser.findById(traineeId)
      .select("active")
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

    const attendance = await ProfessorAttendance.findOne({
      _id: attendanceId,
      traineeUserId: traineeId,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "Attendance is not available yet. Please wait for your professor to post attendance first.",
      });
    }

    const now = new Date();
    const openAt = attendance.uploadOpenAt
      ? new Date(attendance.uploadOpenAt)
      : null;
    const closeAt = attendance.uploadCloseAt
      ? new Date(attendance.uploadCloseAt)
      : null;
    const windowStatus = getWindowStatus(now, openAt, closeAt);

    if (windowStatus === "not_open") {
      return res.status(400).json({
        success: false,
        message: "The upload window is not open yet.",
      });
    }

    if (windowStatus === "closed") {
      return res.status(400).json({
        success: false,
        message: "The upload window is already closed.",
      });
    }

    const proofReviewStatus = String(
      attendance.proofReviewStatus || "pending"
    ).toLowerCase();

    if (proofReviewStatus === "approved") {
      return res.status(400).json({
        success: false,
        message:
          "This attendance proof is already approved and can no longer be changed.",
      });
    }

    const oldProofFileId = String(
      attendance?.proofFileId ||
        attendance?.proofFile?.fileId ||
        ""
    ).trim();

    uploaded = await uploadBufferToTrainingGridFS(file, "attendance-proofs");

    const cleanNote = String(traineeProofNote || traineeNote || "").trim();
    const submittedAt = new Date();

    if (oldProofFileId) {
      attendance.proofHistory = Array.isArray(attendance.proofHistory)
        ? attendance.proofHistory
        : [];

      attendance.proofHistory.push({
        file: attendance.proofFile || null,
        fileId: oldProofFileId,
        fileName:
          attendance?.proofFile?.originalName ||
          attendance?.proofFile?.filename ||
          "",
        note: attendance.traineeProofNote || "",
        submittedAt:
          attendance.submittedAt || attendance.updatedAt || new Date(),
        reviewStatus: attendance.proofReviewStatus || "pending",
        reviewRemarks: attendance.proofReviewRemarks || "",
      });
    }

    attendance.proofFile = uploaded;
    attendance.proofFileId = uploaded?.fileId ? String(uploaded.fileId) : "";
    attendance.traineeProofNote = cleanNote;
    attendance.submittedAt = submittedAt;
    attendance.proofReviewStatus = "pending";
    attendance.proofReviewRemarks = "";

    await attendance.save();

    if (oldProofFileId && oldProofFileId !== attendance.proofFileId) {
      await deleteFileFromTrainingGridFS(oldProofFileId).catch(() => null);
    }

    return res.status(200).json({
      success: true,
      message: "Attendance proof uploaded successfully.",
      attendance: mapAttendanceRow(attendance.toObject()),
    });
  } catch (error) {
    if (uploaded?.fileId) {
      await deleteFileFromTrainingGridFS(uploaded.fileId).catch(() => null);
    }

    console.error("submitTraineeAttendanceProof error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload attendance proof.",
    });
  }
}
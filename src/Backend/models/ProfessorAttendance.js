import mongoose from "mongoose";

const proofHistoryItemSchema = new mongoose.Schema(
  {
    file: {
      type: Object,
      default: null,
    },
    fileId: {
      type: String,
      default: "",
      trim: true,
    },
    fileName: {
      type: String,
      default: "",
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewStatus: {
      type: String,
      default: "pending",
      trim: true,
    },
    reviewRemarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: true }
);

const professorAttendanceSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    batchCode: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    batchName: {
      type: String,
      default: "",
      trim: true,
    },
    traineeUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TraineeUser",
      required: true,
      index: true,
    },
    traineeName: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    course: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    attendanceDate: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    attendanceWindowKey: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    status: {
      type: String,
      default: "Pending",
      trim: true,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    proofFile: {
      type: Object,
      default: null,
    },
    proofFileId: {
      type: String,
      default: "",
      trim: true,
    },
    traineeProofNote: {
      type: String,
      default: "",
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    proofReviewStatus: {
      type: String,
      default: "pending",
      trim: true,
    },
    proofReviewRemarks: {
      type: String,
      default: "",
      trim: true,
    },
    uploadOpenAt: {
      type: Date,
      default: null,
    },
    uploadCloseAt: {
      type: Date,
      default: null,
    },
    proofHistory: {
      type: [proofHistoryItemSchema],
      default: [],
    },
    createdByProfessorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfessorUser",
      default: null,
    },
    createdByProfessorName: {
      type: String,
      default: "",
      trim: true,
    },
    markedByName: {
      type: String,
      default: "",
      trim: true,
    },
    markedByEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedByName: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedByEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

professorAttendanceSchema.index({ batchId: 1, traineeName: 1 });
professorAttendanceSchema.index({ attendanceDate: -1, createdAt: -1 });
professorAttendanceSchema.index({ traineeUserId: 1, createdAt: -1 });
professorAttendanceSchema.index(
  { batchId: 1, traineeUserId: 1, attendanceWindowKey: 1 },
  {
    unique: true,
    name: "uniq_training_attendance_per_window",
    partialFilterExpression: {
      attendanceWindowKey: { $exists: true, $gt: "" },
    },
  }
);

export default mongoose.models.ProfessorAttendance ||
  mongoose.model("ProfessorAttendance", professorAttendanceSchema);

import mongoose from "mongoose";

const trainingBatchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: true,
      trim: true,
    },
    batchCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    sectionLabel: {
      type: String,
      default: "Section 1",
      trim: true,
    },
    maxTrainees: {
      type: Number,
      default: 25,
      min: 1,
      max: 25,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    enrollmentOpenAt: {
      type: Date,
      default: null,
      index: true,
    },
    enrollmentCloseAt: {
      type: Date,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "closed", "archived"],
      default: "open",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
      index: true,
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
    createdByAdminId: {
      type: String,
      default: "",
      trim: true,
    },
    createdByAdminName: {
      type: String,
      default: "",
      trim: true,
    },
    lastOpenedAt: {
      type: Date,
      default: Date.now,
    },
    lastClosedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

trainingBatchSchema.index({ course: 1, status: 1, createdAt: -1 });
trainingBatchSchema.index({ course: 1, isActive: 1, archivedAt: -1, createdAt: -1 });

const TrainingBatch =
  mongoose.models.TrainingBatch ||
  mongoose.model("TrainingBatch", trainingBatchSchema);

export default TrainingBatch;
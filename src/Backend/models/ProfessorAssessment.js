import mongoose from "mongoose";

const assignmentFileSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    originalName: {
      type: String,
      default: "",
      trim: true,
    },
    filename: {
      type: String,
      default: "",
      trim: true,
    },
    mimetype: {
      type: String,
      default: "",
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const professorAssessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingBatch",
      default: null,
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
    totalPoints: {
      type: Number,
      required: true,
      min: 1,
    },
    uploadOpenAt: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    files: {
      type: [assignmentFileSchema],
      default: [],
    },
    file: {
      type: assignmentFileSchema,
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
    mimeType: {
      type: String,
      default: "",
      trim: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    createdByName: {
      type: String,
      default: "",
      trim: true,
    },
    createdByEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

professorAssessmentSchema.index({ batchId: 1, createdAt: -1 });

const ProfessorAssessment = mongoose.model(
  "ProfessorAssessment",
  professorAssessmentSchema
);

export default ProfessorAssessment;
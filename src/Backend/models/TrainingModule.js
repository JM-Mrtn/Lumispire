import mongoose from "mongoose";

const moduleFileSchema = new mongoose.Schema(
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

const trainingModuleSchema = new mongoose.Schema(
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
    courseKey: {
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
    sequence: {
      type: Number,
      default: 1,
      min: 1,
      index: true,
    },
    pathLevel: {
      type: String,
      enum: ["all", "beginner", "intermediate", "advanced"],
      default: "all",
      index: true,
    },
    learningGoalTags: {
      type: [String],
      default: [],
    },
    files: {
      type: [moduleFileSchema],
      default: [],
    },
    file: {
      type: moduleFileSchema,
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
    uploadedByProfessorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfessorUser",
      default: null,
    },
    uploadedByProfessorName: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

trainingModuleSchema.index({ courseKey: 1, sequence: 1, createdAt: -1 });
trainingModuleSchema.index({ courseKey: 1, pathLevel: 1, createdAt: -1 });
trainingModuleSchema.index({ isActive: 1, createdAt: -1 });
trainingModuleSchema.index({ batchId: 1, sequence: 1, createdAt: -1 });

const TrainingModule = mongoose.model("TrainingModule", trainingModuleSchema);

export default TrainingModule;
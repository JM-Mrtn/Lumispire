import mongoose from "mongoose";

const fileRefSchema = new mongoose.Schema(
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

const traineeAssessmentSubmissionSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfessorAssessment",
      required: true,
      index: true,
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
    course: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    assessmentTitle: {
      type: String,
      default: "",
      trim: true,
    },
    files: {
      type: [fileRefSchema],
      default: [],
    },
    file: {
      type: fileRefSchema,
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
    status: {
      type: String,
      default: "Submitted",
      trim: true,
    },
    isLateSubmission: {
      type: Boolean,
      default: false,
      index: true,
    },
    lateSubmittedAt: {
      type: Date,
      default: null,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

traineeAssessmentSubmissionSchema.index(
  { assessmentId: 1, traineeUserId: 1 },
  { unique: true, name: "uniq_assessment_submission_per_trainee" }
);

const TraineeAssessmentSubmission = mongoose.model(
  "TraineeAssessmentSubmission",
  traineeAssessmentSubmissionSchema
);

export default TraineeAssessmentSubmission;

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
    },
    filename: {
      type: String,
      default: "",
    },
    mimetype: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const pretestResultItemSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      default: "",
      trim: true,
    },
    prompt: {
      type: String,
      default: "",
      trim: true,
    },
    selectedAnswer: {
      type: String,
      default: "",
      trim: true,
    },
    correctAnswer: {
      type: String,
      default: "",
      trim: true,
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
    },
    points: {
      type: Number,
      default: 1,
      min: 0,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const pretestEvaluationSchema = new mongoose.Schema(
  {
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    suggestedFocusAreas: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    professorActions: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const traineeUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    middleName: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
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
      index: true,
    },
    learningGoal: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    learningPathLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      index: true,
    },
    pretestStatus: {
      type: String,
      enum: ["not_started", "completed", "passed", "failed"],
      default: "not_started",
      index: true,
    },
    pretestScorePercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    pretestLastTakenAt: {
      type: Date,
      default: null,
    },
    pretestLatestResults: {
      type: [pretestResultItemSchema],
      default: [],
    },
    pretestEvaluation: {
      type: pretestEvaluationSchema,
      default: () => ({
        summary: "",
        strengths: [],
        weaknesses: [],
        suggestedFocusAreas: [],
        recommendations: [],
        professorActions: [],
      }),
    },
    completedCompetencyCodes: {
      type: [String],
      default: [],
    },
    competencyChecklistUpdatedAt: {
      type: Date,
      default: null,
    },
    competencyChecklistUpdatedByName: {
      type: String,
      default: "",
      trim: true,
    },
    competencyRemarks: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      default: "Male",
    },
    status: {
      type: String,
      enum: ["Single", "Married", "Widowed", "Separated"],
      default: "Single",
    },
    rfidUid: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },
    trainingStatus: {
      type: String,
      enum: ["Enrolled", "Completed", "Passed", "Failed"],
      default: "Enrolled",
      index: true,
    },
    passedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    certificateStatus: {
      type: String,
      enum: ["none", "issued", "revoked"],
      default: "none",
      index: true,
    },
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingCertificate",
      default: null,
    },
    profilePhoto: {
      type: fileRefSchema,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
    pendingPasswordHash: {
      type: String,
      default: null,
      select: false,
    },
    passwordChangeOtpHash: {
      type: String,
      default: null,
      select: false,
    },
    passwordChangeOtpExpiry: {
      type: Date,
      default: null,
      select: false,
    },
    passwordChangeRequestedAt: {
      type: Date,
      default: null,
      select: false,
    },
    passwordChangeResendAvailableAt: {
      type: Date,
      default: null,
      select: false,
    },
    forgotPasswordPendingHash: {
      type: String,
      default: null,
      select: false,
    },
    forgotPasswordOtpHash: {
      type: String,
      default: null,
      select: false,
    },
    forgotPasswordOtpExpiry: {
      type: Date,
      default: null,
      select: false,
    },
    forgotPasswordRequestedAt: {
      type: Date,
      default: null,
      select: false,
    },
    forgotPasswordResendAvailableAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const TraineeUser =
  mongoose.models.TraineeUser ||
  mongoose.model("TraineeUser", traineeUserSchema);

export default TraineeUser;
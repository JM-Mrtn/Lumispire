import mongoose from "mongoose";

const competencyItemSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      default: "",
      trim: true,
    },
    label: {
      type: String,
      default: "",
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const competencyGroupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    items: {
      type: [competencyItemSchema],
      default: [],
    },
  },
  { _id: false }
);

const competencyCountsSchema = new mongoose.Schema(
  {
    completed: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const attendanceSnapshotSchema = new mongoose.Schema(
  {
    required: {
      type: Number,
      default: 0,
      min: 0,
    },
    completed: {
      type: Number,
      default: 0,
      min: 0,
    },
    basis: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const trainingCertificateSchema = new mongoose.Schema(
  {
    traineeUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TraineeUser",
      required: true,
      index: true,
    },
    traineeName: {
      type: String,
      required: true,
      trim: true,
    },
    traineeEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
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
    courseDisplayName: {
      type: String,
      default: "",
      trim: true,
    },
    qualificationTitle: {
      type: String,
      default: "",
      trim: true,
    },

    certificateNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    serialNo: {
      type: String,
      default: "",
      trim: true,
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
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
    sectionLabel: {
      type: String,
      default: "",
      trim: true,
    },

    trainingStartDate: {
      type: Date,
      default: null,
    },
    trainingEndDate: {
      type: Date,
      default: null,
    },

    trainingCenterName: {
      type: String,
      default: "",
      trim: true,
    },
    trainingVenueAddress: {
      type: String,
      default: "",
      trim: true,
    },
    trainingVenueDisplay: {
      type: String,
      default: "",
      trim: true,
    },

    certificatePreviewImage: {
      type: String,
      default: "",
      trim: true,
    },

    learningPathLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    pretestScorePercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    onlineClasses: {
      type: attendanceSnapshotSchema,
      default: () => ({
        required: 0,
        completed: 0,
        basis: "",
      }),
    },
    faceToFaceClasses: {
      type: attendanceSnapshotSchema,
      default: () => ({
        required: 0,
        completed: 0,
        basis: "",
      }),
    },

    competencyCounts: {
      type: competencyCountsSchema,
      default: () => ({
        completed: 0,
        total: 0,
      }),
    },
    completedCompetencyCodes: {
      type: [String],
      default: [],
    },
    competencyGroups: {
      type: [competencyGroupSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["issued", "revoked"],
      default: "issued",
      index: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },

    issuedByProfessorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfessorUser",
      default: null,
    },
    issuedByProfessorName: {
      type: String,
      default: "",
      trim: true,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

trainingCertificateSchema.index(
  { traineeUserId: 1, courseKey: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "issued" } }
);

trainingCertificateSchema.index(
  { serialNo: 1 },
  {
    unique: true,
    name: "uniq_training_certificate_serial_no",
    partialFilterExpression: {
      serialNo: { $exists: true, $type: "string", $gt: "" },
    },
  }
);

const TrainingCertificate =
  mongoose.models.TrainingCertificate ||
  mongoose.model("TrainingCertificate", trainingCertificateSchema);

export default TrainingCertificate;
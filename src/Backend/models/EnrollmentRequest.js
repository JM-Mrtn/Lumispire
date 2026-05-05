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

const enrollmentRequestSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: true,
      trim: true,
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
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    middleName: { type: String, default: "", trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    birthDate: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Single", "Married", "Widowed", "Separated"],
      required: true,
    },
    completeAddress: {
      type: String,
      required: true,
      trim: true,
    },
    educationAttainment: {
      type: [String],
      default: [],
    },
    otherEducationText: {
      type: String,
      default: "",
      trim: true,
    },
    employmentStatus: {
      type: [String],
      default: [],
    },
    birthCertificate: {
      type: fileRefSchema,
      default: null,
    },
    form137138: {
      type: fileRefSchema,
      default: null,
    },
    diplomaTor: {
      type: fileRefSchema,
      default: null,
    },
    picture2x2: {
      type: fileRefSchema,
      default: null,
    },
    marriageContract: {
      type: fileRefSchema,
      default: null,
    },
    applicationForm: {
      type: fileRefSchema,
      default: null,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    generatedTraineeEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    traineeUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TraineeUser",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

enrollmentRequestSchema.index(
  { email: 1 },
  { unique: true, name: "unique_enrollment_email" }
);

const EnrollmentRequest = mongoose.model(
  "EnrollmentRequest",
  enrollmentRequestSchema
);

export default EnrollmentRequest;
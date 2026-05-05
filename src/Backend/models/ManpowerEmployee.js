import mongoose from "mongoose";

const fileRefSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
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

const manpowerEmployeeSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManpowerApplication",
      required: true,
      index: true,
    },
    vacancy: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    deploymentSite: {
      type: String,
      default: "",
      trim: true,
    },
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
    contactNo: {
      type: String,
      default: "",
      trim: true,
    },
    personalEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    companyEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    dailyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    regionCode: {
      type: String,
      default: "NCR",
      trim: true,
    },

    profilePhoto: {
      type: fileRefSchema,
      default: () => ({}),
    },

    passwordChangeOtpHash: {
      type: String,
      default: "",
      select: false,
    },
    passwordChangeOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ManpowerEmployee", manpowerEmployeeSchema);
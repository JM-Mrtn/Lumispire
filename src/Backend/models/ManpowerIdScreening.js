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

const manpowerIdScreeningSchema = new mongoose.Schema(
  {
    applicantName: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true, index: true },
    consentGiven: { type: Boolean, default: true },
    consentAt: { type: Date, default: Date.now },

    idType: { type: String, default: "", trim: true },
    image: { type: fileRefSchema, default: () => ({}) },

    detectedIdType: { type: String, default: "unknown" },
    status: {
      type: String,
      enum: ["unreadable", "suspicious", "needs_manual_review", "likely_valid"],
      default: "unreadable",
      index: true,
    },
    reviewDecision: {
      type: String,
      enum: ["auto_approved", "manual_review", "auto_rejected"],
      default: "manual_review",
    },
    confidenceScore: { type: Number, default: 0 },

    extractedText: { type: String, default: "" },

    checks: {
      resolutionOk: { type: Boolean, default: false },
      enoughText: { type: Boolean, default: false },
      hasKeywords: { type: Boolean, default: false },
      looksBlank: { type: Boolean, default: false },
    },

    matchedKeywords: { type: [String], default: [] },
    reasons: { type: [String], default: [] },

    officialCheckAvailable: { type: Boolean, default: false },
    officialCheckUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ManpowerIdScreening", manpowerIdScreeningSchema);
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
      default: "needs_manual_review",
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

    aiConnected: { type: Boolean, default: false },
    aiConnectionStatus: {
      type: String,
      enum: [
        "not_checked",
        "connected",
        "missing_key",
        "not_supported",
        "error",
      ],
      default: "not_checked",
      index: true,
    },
    aiProvider: { type: String, default: "none", trim: true },
    aiModel: { type: String, default: "", trim: true },
    aiCheckedAt: { type: Date, default: null },
    aiSummary: { type: String, default: "", trim: true },
    aiDocumentType: { type: String, default: "unknown", trim: true },
    aiRiskLevel: {
      type: String,
      enum: ["low", "medium", "high", "unknown"],
      default: "unknown",
    },
    aiDecision: {
      type: String,
      enum: ["approve", "needs_manual_review", "reject"],
      default: "needs_manual_review",
    },
    aiError: { type: String, default: "", trim: true },
    aiRawResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    officialCheckAvailable: { type: Boolean, default: false },
    officialCheckUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ManpowerIdScreening", manpowerIdScreeningSchema);
// src/Backend/models/HotelIdVerification.js
import mongoose from "mongoose";

const idFileSchema = new mongoose.Schema(
  {
    data: {
      type: Buffer,
      required: true,
      select: false,
    },
    originalName: {
      type: String,
      default: "",
    },
    mimeType: {
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

const hotelIdVerificationSchema = new mongoose.Schema(
  {
    hotelUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelUser",
      required: true,
    },

    fullName: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    idType: {
      type: String,
      default: "uploaded_id",
      trim: true,
    },

    consentGiven: {
      type: Boolean,
      default: false,
    },

    consentAt: {
      type: Date,
      default: null,
    },

    idFile: {
      type: idFileSchema,
      required: true,
    },

    screeningStatus: {
      type: String,
      enum: ["unreadable", "suspicious", "needs_manual_review", "likely_valid"],
      default: "needs_manual_review",
    },

    confidenceScore: {
      type: Number,
      default: 0,
    },

    extractedText: {
      type: String,
      default: "",
    },

    matchedKeywords: {
      type: [String],
      default: [],
    },

    checks: {
      resolutionOk: { type: Boolean, default: false },
      enoughText: { type: Boolean, default: false },
      hasKeywords: { type: Boolean, default: false },
      looksBlank: { type: Boolean, default: false },
    },

    reasons: {
      type: [String],
      default: [],
    },

    reviewDecision: {
      type: String,
      enum: [
        "auto_approved",
        "auto_rejected",
        "manual_review",
        "approved",
        "rejected",
      ],
      default: "manual_review",
    },

    reviewedByAdmin: {
      type: Boolean,
      default: false,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewRemarks: {
      type: String,
      default: "",
    },

    nextAllowedUploadAt: {
      type: Date,
      default: null,
    },

    aiConnected: {
      type: Boolean,
      default: false,
    },

    aiConnectionStatus: {
      type: String,
      default: "not_checked",
      trim: true,
    },

    aiProvider: {
      type: String,
      default: "",
      trim: true,
    },

    aiModel: {
      type: String,
      default: "",
      trim: true,
    },

    aiCheckedAt: {
      type: Date,
      default: null,
    },

    aiSummary: {
      type: String,
      default: "",
    },

    aiDocumentType: {
      type: String,
      default: "unknown",
      trim: true,
    },

    aiRiskLevel: {
      type: String,
      default: "unknown",
      trim: true,
    },

    aiDecision: {
      type: String,
      default: "needs_manual_review",
      trim: true,
    },

    aiError: {
      type: String,
      default: "",
    },

    aiRawResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

const HotelIdVerification =
  mongoose.models.HotelIdVerification ||
  mongoose.model("HotelIdVerification", hotelIdVerificationSchema);

export default HotelIdVerification;
// src/Backend/models/HotelIdVerification.js
import mongoose from "mongoose";

const idFileSchema = new mongoose.Schema(
  {
    // ✅ ID FILE STORED IN MONGODB
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
      enum: ["auto_approved", "auto_rejected", "manual_review"],
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
  },
  { timestamps: true }
);

const HotelIdVerification =
  mongoose.models.HotelIdVerification ||
  mongoose.model("HotelIdVerification", hotelIdVerificationSchema);

export default HotelIdVerification;
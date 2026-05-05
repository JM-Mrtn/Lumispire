// src/Backend/models/hotelUser.js
import mongoose from "mongoose";

const hotelUserSchema = new mongoose.Schema(
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

    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
      select: false,
    },

    verificationTokenExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    usedVerificationTokens: {
      type: [String],
      default: [],
      select: false,
    },

    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    changePwOtpHash: {
      type: String,
      default: null,
      select: false,
    },

    changePwOtpExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    changePwOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    pendingNewPasswordHash: {
      type: String,
      default: null,
      select: false,
    },

    changePwOtpLastSentAt: {
      type: Date,
      default: null,
      select: false,
    },

    // ✅ PROFILE PICTURE STORED IN MONGODB
    profilePicture: {
      data: {
        type: Buffer,
        default: null,
        select: false,
      },
      contentType: {
        type: String,
        default: "",
      },
      filename: {
        type: String,
        default: "",
      },
      size: {
        type: Number,
        default: 0,
      },
    },

    active: {
      type: Boolean,
      default: true,
    },

    idVerificationStatus: {
      type: String,
      enum: ["not_submitted", "pending", "verified", "rejected"],
      default: "not_submitted",
    },

    isIdentityVerified: {
      type: Boolean,
      default: false,
    },

    idVerifiedAt: {
      type: Date,
      default: null,
    },

    idVerificationRemarks: {
      type: String,
      default: "",
    },

    hotelIdVerificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelIdVerification",
      default: null,
    },
  },
  { timestamps: true }
);

hotelUserSchema.index({ resetPasswordToken: 1 });

const HotelUser =
  mongoose.models.HotelUser || mongoose.model("HotelUser", hotelUserSchema);

export default HotelUser;
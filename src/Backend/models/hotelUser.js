// src/Backend/models/hotelUser.js
import mongoose from "mongoose";

const profilePictureSchema = new mongoose.Schema(
  {
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
  { _id: false }
);

const hotelUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    middleName: {
      type: String,
      trim: true,
      default: "",
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    fullName: {
      type: String,
      trim: true,
      default: "",
    },

    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    passwordHash: {
      type: String,
      default: "",
      select: false,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
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

    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationExpiresAt: {
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

    resetPasswordTokenHash: {
      type: String,
      default: "",
      select: false,
    },

    resetPasswordExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },

    resetPasswordExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    changePasswordOtpHash: {
      type: String,
      default: "",
      select: false,
    },

    changePasswordOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
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

    profilePicture: {
      type: profilePictureSchema,
      default: () => ({}),
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    idVerificationStatus: {
      type: String,
      enum: ["not_submitted", "pending", "verified", "rejected"],
      default: "not_submitted",
      index: true,
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
hotelUserSchema.index({ emailVerificationToken: 1 });
hotelUserSchema.index({ verificationToken: 1 });

const HotelUser =
  mongoose.models.HotelUser || mongoose.model("HotelUser", hotelUserSchema);

export default HotelUser;

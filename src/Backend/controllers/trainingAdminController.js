// src/Backend/controllers/trainingAdminController.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

import TraineeUser from "../models/TraineeUser.js";
import EnrollmentRequest from "../models/EnrollmentRequest.js";
import { sendTrainingOtpEmail } from "../utils/sendTrainingOtpEmail.js";
import {
  uploadBufferToTrainingGridFS,
  getTrainingGridFSBucket,
} from "../utils/trainingGridfs.js";

const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;

function getTrainingJwtSecret() {
  return process.env.TRAINING_JWT_SECRET || process.env.JWT_SECRET;
}

function sanitizeUser(u) {
  if (!u) return null;

  return {
    _id: u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    middleName: u.middleName || "",
    email: u.email,
    phone: u.phone,
    course: u.course,
    gender: u.gender,
    status: u.status,
    trainingStatus: u.trainingStatus || "Enrolled",
    profilePhoto: u.profilePhoto || null,
    mustChangePassword: Boolean(u.mustChangePassword),
    active: Boolean(u.active),
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getRetryAfterSeconds(dateValue) {
  if (!dateValue) return 0;
  const diffMs = new Date(dateValue).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 1000));
}

function maskEmail(email = "") {
  const [name, domain] = String(email).split("@");
  if (!name || !domain) return email || "";
  if (name.length <= 2) return `${name[0] || "*"}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

async function getPersonalEmailForTrainee(user) {
  const enrollment = await EnrollmentRequest.findOne({
    $or: [
      { traineeUserId: user._id },
      { generatedTraineeEmail: String(user.email || "").toLowerCase() },
    ],
  }).sort({ createdAt: -1 });

  return {
    enrollment,
    personalEmail: enrollment?.email || "",
  };
}

function validateNewPassword(next, confirm) {
  if (!next) return "New password is required.";
  if (next.length < 6 || next.length > 20) {
    return "Password must be 6–20 characters.";
  }
  if (!/[A-Z]/.test(next) || !/[a-z]/.test(next)) {
    return "Must include uppercase and lowercase letters.";
  }
  if (!/[^A-Za-z0-9]/.test(next)) {
    return "Must contain at least 1 symbol.";
  }
  if (!confirm) return "Confirm password is required.";
  if (next !== confirm) return "Passwords do not match.";
  return "";
}

async function deleteGridFSFileIfExists(fileRef) {
  try {
    const fileId = fileRef?.fileId;
    if (!fileId) return;

    const bucket = getTrainingGridFSBucket();
    const objectId =
      typeof fileId === "string"
        ? new ObjectId(fileId)
        : new ObjectId(String(fileId));

    await bucket.delete(objectId);
  } catch (error) {
    console.warn("deleteGridFSFileIfExists warning:", error.message);
  }
}

// POST /api/training/login
export async function traineeLogin(req, res) {
  try {
    const { email, password } = req.body || {};
    const e = String(email || "").trim().toLowerCase();
    const p = String(password || "");

    if (!e || !p) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await TraineeUser.findOne({ email: e }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.active === false) {
      return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    }

    const ok = await bcrypt.compare(p, user.password || "");
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const secret = getTrainingJwtSecret();
    if (!secret) {
      return res.status(500).json({
        message: "TRAINING_JWT_SECRET or JWT_SECRET missing in .env",
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: "trainee" },
      secret,
      { expiresIn: process.env.TRAINING_JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({
      token,
      user: sanitizeUser(user),
      mustChangePassword: Boolean(user.mustChangePassword),
    });
  } catch (err) {
    console.error("traineeLogin error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// GET /api/training/profile
export async function traineeProfile(req, res) {
  try {
    const id = req.trainee?.id;
    if (!id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const user = await TraineeUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const enrollment = await EnrollmentRequest.findOne({
      $or: [
        { traineeUserId: user._id },
        { generatedTraineeEmail: user.email.toLowerCase() },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      user: sanitizeUser(user),
      enrollment: enrollment || null,
    });
  } catch (err) {
    console.error("traineeProfile error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PATCH /api/training/profile/photo
export async function traineeUploadProfilePhoto(req, res) {
  try {
    const id = req.trainee?.id;

    if (!id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const user = await TraineeUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Profile photo is required." });
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Only JPG, JPEG, PNG, and WEBP files are allowed.",
      });
    }

    const oldPhoto = user.profilePhoto || null;

    const uploadedPhoto = await uploadBufferToTrainingGridFS(
      req.file,
      "training/profile-photo"
    );

    if (!uploadedPhoto) {
      return res.status(500).json({
        message: "Failed to upload profile photo.",
      });
    }

    user.profilePhoto = uploadedPhoto;
    await user.save();

    if (oldPhoto?.fileId) {
      const oldId = String(oldPhoto.fileId);
      const newId = String(uploadedPhoto.fileId);

      if (oldId !== newId) {
        await deleteGridFSFileIfExists(oldPhoto);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully.",
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("traineeUploadProfilePhoto error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to upload profile photo.",
    });
  }
}

// POST /api/training/change-password/request-otp
export async function traineeRequestChangePasswordOtp(req, res) {
  try {
    const id = req.trainee?.id;
    if (!id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    const current = String(currentPassword || "");
    const next = String(newPassword || "");
    const confirm = String(confirmPassword || "");

    if (!current) {
      return res.status(400).json({ message: "Current password is required." });
    }

    const passwordError = validateNewPassword(next, confirm);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const user = await TraineeUser.findById(id).select(
      "+password +pendingPasswordHash +passwordChangeOtpHash +passwordChangeOtpExpiry +passwordChangeRequestedAt +passwordChangeResendAvailableAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentOk = await bcrypt.compare(current, user.password || "");
    if (!currentOk) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const sameAsCurrent = await bcrypt.compare(next, user.password || "");
    if (sameAsCurrent) {
      return res.status(400).json({
        message: "New password must be different from your current password.",
      });
    }

    const retryAfterSeconds = getRetryAfterSeconds(user.passwordChangeResendAvailableAt);
    if (retryAfterSeconds > 0) {
      return res.status(429).json({
        message: "Please wait before requesting OTP again.",
        retryAfterSeconds,
      });
    }

    const { personalEmail } = await getPersonalEmailForTrainee(user);
    if (!personalEmail) {
      return res.status(400).json({
        message: "Personal email not found for this trainee.",
      });
    }

    const otp = generateOtp();

    user.pendingPasswordHash = await bcrypt.hash(next, 10);
    user.passwordChangeOtpHash = hashOtp(otp);
    user.passwordChangeOtpExpiry = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );
    user.passwordChangeRequestedAt = new Date();
    user.passwordChangeResendAvailableAt = new Date(
      Date.now() + OTP_COOLDOWN_SECONDS * 1000
    );

    await user.save();

    await sendTrainingOtpEmail({
      to: personalEmail,
      firstName: user.firstName,
      otp,
      subject: "TAMSI Change Password OTP",
      heading: "Use this OTP to change your TAMSI password:",
      note: "This code expires in 10 minutes.",
    });

    return res.status(200).json({
      message: `OTP sent to your personal email (${maskEmail(personalEmail)}).`,
      cooldownSeconds: OTP_COOLDOWN_SECONDS,
    });
  } catch (err) {
    console.error("traineeRequestChangePasswordOtp error:", err);
    return res.status(500).json({ message: err.message || "Server error." });
  }
}

export async function traineeUpdateProfile(req, res) {
  try {
    const id = req.trainee?.id;
    if (!id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const {
      firstName,
      lastName,
      middleName = "",
      phone,
      gender,
      status,
      completeAddress = "",
    } = req.body || {};

    const cleanFirstName = String(firstName || "").trim();
    const cleanLastName = String(lastName || "").trim();
    const cleanMiddleName = String(middleName || "").trim();
    const cleanPhone = String(phone || "").trim();
    const cleanGender = String(gender || "").trim();
    const cleanStatus = String(status || "").trim();
    const cleanAddress = String(completeAddress || "").trim();

    if (!cleanFirstName || !cleanLastName || !cleanPhone) {
      return res.status(400).json({
        message: "First name, last name, and phone number are required.",
      });
    }

    if (!/^[0-9+\-\s()]{7,}$/.test(cleanPhone)) {
      return res.status(400).json({
        message: "Please provide a valid phone number.",
      });
    }

    if (!["Male", "Female"].includes(cleanGender)) {
      return res.status(400).json({
        message: "Invalid gender value.",
      });
    }

    if (!["Single", "Married", "Widowed", "Separated"].includes(cleanStatus)) {
      return res.status(400).json({
        message: "Invalid civil status value.",
      });
    }

    if (!cleanAddress) {
      return res.status(400).json({
        message: "Complete address is required.",
      });
    }

    const user = await TraineeUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.firstName = cleanFirstName;
    user.lastName = cleanLastName;
    user.middleName = cleanMiddleName;
    user.phone = cleanPhone;
    user.gender = cleanGender;
    user.status = cleanStatus;

    await user.save();

    const enrollment = await EnrollmentRequest.findOne({
      $or: [
        { traineeUserId: user._id },
        { generatedTraineeEmail: String(user.email || "").toLowerCase() },
      ],
    }).sort({ createdAt: -1 });

    if (enrollment) {
      enrollment.firstName = cleanFirstName;
      enrollment.lastName = cleanLastName;
      enrollment.middleName = cleanMiddleName;
      enrollment.phoneNumber = cleanPhone;
      enrollment.gender = cleanGender;
      enrollment.status = cleanStatus;
      enrollment.completeAddress = cleanAddress;
      await enrollment.save();
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: sanitizeUser(user),
      enrollment: enrollment || null,
    });
  } catch (err) {
    console.error("traineeUpdateProfile error:", err);
    return res.status(500).json({
      message: err.message || "Failed to update profile.",
    });
  }
}

// POST /api/training/change-password/resend-otp
export async function traineeResendChangePasswordOtp(req, res) {
  try {
    const id = req.trainee?.id;
    if (!id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const user = await TraineeUser.findById(id).select(
      "+pendingPasswordHash +passwordChangeOtpHash +passwordChangeOtpExpiry +passwordChangeRequestedAt +passwordChangeResendAvailableAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.pendingPasswordHash || !user.passwordChangeOtpHash) {
      return res.status(400).json({
        message: "No OTP request found. Please submit the form again.",
      });
    }

    const retryAfterSeconds = getRetryAfterSeconds(user.passwordChangeResendAvailableAt);
    if (retryAfterSeconds > 0) {
      return res.status(429).json({
        message: "Please wait before resending OTP.",
        retryAfterSeconds,
      });
    }

    const { personalEmail } = await getPersonalEmailForTrainee(user);
    if (!personalEmail) {
      return res.status(400).json({
        message: "Personal email not found for this trainee.",
      });
    }

    const otp = generateOtp();

    user.passwordChangeOtpHash = hashOtp(otp);
    user.passwordChangeOtpExpiry = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );
    user.passwordChangeRequestedAt = new Date();
    user.passwordChangeResendAvailableAt = new Date(
      Date.now() + OTP_COOLDOWN_SECONDS * 1000
    );

    await user.save();

    await sendTrainingOtpEmail({
      to: personalEmail,
      firstName: user.firstName,
      otp,
      subject: "TAMSI Change Password OTP",
      heading: "Use this OTP to change your TAMSI password:",
      note: "This code expires in 10 minutes.",
    });

    return res.status(200).json({
      message: `OTP resent to your personal email (${maskEmail(personalEmail)}).`,
      cooldownSeconds: OTP_COOLDOWN_SECONDS,
    });
  } catch (err) {
    console.error("traineeResendChangePasswordOtp error:", err);
    return res.status(500).json({ message: err.message || "Server error." });
  }
}

// POST /api/training/change-password/verify-otp
export async function traineeVerifyChangePasswordOtp(req, res) {
  try {
    const id = req.trainee?.id;
    if (!id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const { otp } = req.body || {};
    const code = String(otp || "").trim();

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: "OTP must be 6 digits." });
    }

    const user = await TraineeUser.findById(id).select(
      "+password +pendingPasswordHash +passwordChangeOtpHash +passwordChangeOtpExpiry +passwordChangeRequestedAt +passwordChangeResendAvailableAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.pendingPasswordHash || !user.passwordChangeOtpHash) {
      return res.status(400).json({
        message: "No OTP request found. Please submit the form again.",
      });
    }

    if (
      !user.passwordChangeOtpExpiry ||
      new Date(user.passwordChangeOtpExpiry).getTime() < Date.now()
    ) {
      user.pendingPasswordHash = null;
      user.passwordChangeOtpHash = null;
      user.passwordChangeOtpExpiry = null;
      user.passwordChangeRequestedAt = null;
      user.passwordChangeResendAvailableAt = null;
      await user.save();

      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (hashOtp(code) !== user.passwordChangeOtpHash) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    user.password = user.pendingPasswordHash;
    user.mustChangePassword = false;

    user.pendingPasswordHash = null;
    user.passwordChangeOtpHash = null;
    user.passwordChangeOtpExpiry = null;
    user.passwordChangeRequestedAt = null;
    user.passwordChangeResendAvailableAt = null;

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully.",
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("traineeVerifyChangePasswordOtp error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// POST /api/training/forgot-password/request-otp
export async function traineeForgotPasswordRequestOtp(req, res) {
  try {
    const { email, newPassword, confirmPassword } = req.body || {};

    const traineeEmail = String(email || "").trim().toLowerCase();
    if (!traineeEmail) {
      return res.status(400).json({ message: "Trainee email is required." });
    }

    const passwordError = validateNewPassword(
      String(newPassword || ""),
      String(confirmPassword || "")
    );
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const user = await TraineeUser.findOne({ email: traineeEmail }).select(
      "+password +forgotPasswordPendingHash +forgotPasswordOtpHash +forgotPasswordOtpExpiry +forgotPasswordRequestedAt +forgotPasswordResendAvailableAt"
    );

    if (!user) {
      return res.status(404).json({ message: "Trainee account not found." });
    }

    if (user.active === false) {
      return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    }

    const sameAsCurrent = await bcrypt.compare(String(newPassword), user.password || "");
    if (sameAsCurrent) {
      return res.status(400).json({
        message: "New password must be different from your current password.",
      });
    }

    const retryAfterSeconds = getRetryAfterSeconds(user.forgotPasswordResendAvailableAt);
    if (retryAfterSeconds > 0) {
      return res.status(429).json({
        message: "Please wait before requesting OTP again.",
        retryAfterSeconds,
      });
    }

    const { personalEmail } = await getPersonalEmailForTrainee(user);
    if (!personalEmail) {
      return res.status(400).json({
        message: "Personal email not found for this trainee.",
      });
    }

    const otp = generateOtp();

    user.forgotPasswordPendingHash = await bcrypt.hash(String(newPassword), 10);
    user.forgotPasswordOtpHash = hashOtp(otp);
    user.forgotPasswordOtpExpiry = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );
    user.forgotPasswordRequestedAt = new Date();
    user.forgotPasswordResendAvailableAt = new Date(
      Date.now() + OTP_COOLDOWN_SECONDS * 1000
    );

    await user.save();

    await sendTrainingOtpEmail({
      to: personalEmail,
      firstName: user.firstName,
      otp,
      subject: "TAMSI Forgot Password OTP",
      heading: "Use this OTP to reset your TAMSI password:",
      note: "This code expires in 10 minutes.",
    });

    return res.status(200).json({
      message: `OTP sent to your personal email (${maskEmail(personalEmail)}).`,
      cooldownSeconds: OTP_COOLDOWN_SECONDS,
    });
  } catch (err) {
    console.error("traineeForgotPasswordRequestOtp error:", err);
    return res.status(500).json({ message: err.message || "Server error." });
  }
}

// POST /api/training/forgot-password/resend-otp
export async function traineeForgotPasswordResendOtp(req, res) {
  try {
    const { email } = req.body || {};
    const traineeEmail = String(email || "").trim().toLowerCase();

    if (!traineeEmail) {
      return res.status(400).json({ message: "Trainee email is required." });
    }

    const user = await TraineeUser.findOne({ email: traineeEmail }).select(
      "+forgotPasswordPendingHash +forgotPasswordOtpHash +forgotPasswordOtpExpiry +forgotPasswordRequestedAt +forgotPasswordResendAvailableAt"
    );

    if (!user) {
      return res.status(404).json({ message: "Trainee account not found." });
    }

    if (!user.forgotPasswordPendingHash || !user.forgotPasswordOtpHash) {
      return res.status(400).json({
        message: "No OTP request found. Please submit the form again.",
      });
    }

    const retryAfterSeconds = getRetryAfterSeconds(user.forgotPasswordResendAvailableAt);
    if (retryAfterSeconds > 0) {
      return res.status(429).json({
        message: "Please wait before resending OTP.",
        retryAfterSeconds,
      });
    }

    const { personalEmail } = await getPersonalEmailForTrainee(user);
    if (!personalEmail) {
      return res.status(400).json({
        message: "Personal email not found for this trainee.",
      });
    }

    const otp = generateOtp();

    user.forgotPasswordOtpHash = hashOtp(otp);
    user.forgotPasswordOtpExpiry = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );
    user.forgotPasswordRequestedAt = new Date();
    user.forgotPasswordResendAvailableAt = new Date(
      Date.now() + OTP_COOLDOWN_SECONDS * 1000
    );

    await user.save();

    await sendTrainingOtpEmail({
      to: personalEmail,
      firstName: user.firstName,
      otp,
      subject: "TAMSI Forgot Password OTP",
      heading: "Use this OTP to reset your TAMSI password:",
      note: "This code expires in 10 minutes.",
    });

    return res.status(200).json({
      message: `OTP resent to your personal email (${maskEmail(personalEmail)}).`,
      cooldownSeconds: OTP_COOLDOWN_SECONDS,
    });
  } catch (err) {
    console.error("traineeForgotPasswordResendOtp error:", err);
    return res.status(500).json({ message: err.message || "Server error." });
  }
}

// POST /api/training/forgot-password/verify-otp
export async function traineeForgotPasswordVerifyOtp(req, res) {
  try {
    const { email, otp } = req.body || {};

    const traineeEmail = String(email || "").trim().toLowerCase();
    const code = String(otp || "").trim();

    if (!traineeEmail) {
      return res.status(400).json({ message: "Trainee email is required." });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: "OTP must be 6 digits." });
    }

    const user = await TraineeUser.findOne({ email: traineeEmail }).select(
      "+forgotPasswordPendingHash +forgotPasswordOtpHash +forgotPasswordOtpExpiry +forgotPasswordRequestedAt +forgotPasswordResendAvailableAt"
    );

    if (!user) {
      return res.status(404).json({ message: "Trainee account not found." });
    }

    if (!user.forgotPasswordPendingHash || !user.forgotPasswordOtpHash) {
      return res.status(400).json({
        message: "No OTP request found. Please submit the form again.",
      });
    }

    if (
      !user.forgotPasswordOtpExpiry ||
      new Date(user.forgotPasswordOtpExpiry).getTime() < Date.now()
    ) {
      user.forgotPasswordPendingHash = null;
      user.forgotPasswordOtpHash = null;
      user.forgotPasswordOtpExpiry = null;
      user.forgotPasswordRequestedAt = null;
      user.forgotPasswordResendAvailableAt = null;
      await user.save();

      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (hashOtp(code) !== user.forgotPasswordOtpHash) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    user.password = user.forgotPasswordPendingHash;
    user.mustChangePassword = false;

    user.forgotPasswordPendingHash = null;
    user.forgotPasswordOtpHash = null;
    user.forgotPasswordOtpExpiry = null;
    user.forgotPasswordRequestedAt = null;
    user.forgotPasswordResendAvailableAt = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully.",
    });
  } catch (err) {
    console.error("traineeForgotPasswordVerifyOtp error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}
// src/Backend/routes/hotelRoutes.js
import express from "express";
import multer from "multer";

import {
  checkUsername,
  checkEmail,
  hotelSignUp,
  hotelLogIn,
  verifyEmail,
  resendVerification,
} from "../controllers/hotelAuthController.js";

import {
  forgotPassword,
  resetPassword,
  requestChangePasswordOtp,
  resendChangePasswordOtp,
  verifyChangePasswordOtp,
} from "../controllers/hotelPasswordController.js";

import {
  getHotelUserProfile,
  updateUser,
  uploadProfilePicture,
  getProfilePicture,
} from "../controllers/hotelProfileController.js";

import { uploadHotelIdForVerification } from "../controllers/hotelIdVerificationController.js";

const router = express.Router();

/* ===================== PROFILE PICTURE MULTER ===================== */
const profileUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ===================== HOTEL ID MULTER ===================== */
const idUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG, WEBP, and PDF files are allowed."));
    }
  },
  limits: { fileSize: 8 * 1024 * 1024 },
});

/* ===================== USER ROUTES ===================== */
router.get("/check-username", checkUsername);
router.get("/check-email", checkEmail);

router.post("/hotel-signup", hotelSignUp);
router.post("/hotel-login", hotelLogIn);

router.post("/change-password/request-otp", requestChangePasswordOtp);
router.post("/change-password/resend-otp", resendChangePasswordOtp);
router.post("/change-password/verify-otp", verifyChangePasswordOtp);

router.post("/hotel-forgot-password", forgotPassword);
router.post("/hotel-reset-password/:token", resetPassword);

router.get("/verify-email/:verificationToken", verifyEmail);
router.post("/resend-verification", resendVerification);

router.get("/hotel-user-profile", getHotelUserProfile);

// ✅ endpoint to display profile picture from MongoDB
router.get("/profile-picture/:userId", getProfilePicture);

router.put(
  "/profile-picture",
  profileUpload.single("profilePicture"),
  uploadProfilePicture
);

router.put(
  "/upload-id",
  idUpload.single("idImage"),
  uploadHotelIdForVerification
);

router.put("/update-user/:userId", updateUser);

/* ===================== MULTER ERROR HANDLER ===================== */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File is too large." });
    }
    return res.status(400).json({ message: err.message || "Upload error." });
  }

  if (
    err?.message === "Only image files are allowed." ||
    err?.message === "Only JPG, JPEG, PNG, WEBP, and PDF files are allowed."
  ) {
    return res.status(400).json({ message: err.message });
  }

  return next(err);
});

export default router;
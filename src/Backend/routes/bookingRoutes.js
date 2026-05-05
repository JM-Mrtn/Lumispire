// src/Backend/routes/bookingRoutes.js
import express from "express";
import multer from "multer";
import {
  createResortBooking,
  checkResortAvailability,
  getMyResortBookings,
  adminGetAllResortBookings,
  adminGetResortBookingProof,
  adminUpdateResortBookingStatus,
  adminRescheduleResortBooking,
  adminGetResortRescheduleOptions,
  getBookedDates,
} from "../controllers/bookingController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf";

    if (!ok) {
      return cb(new Error("Only image or PDF files are allowed."));
    }

    cb(null, true);
  },
});

/* ===================== USER ===================== */
router.post("/resort-bookings", upload.single("proof"), createResortBooking);

router.get("/resort-bookings/check", checkResortAvailability);

// optional old alias
router.get("/resort-bookings/availability", checkResortAvailability);

router.get("/resort-bookings/booked-dates", getBookedDates);

router.get("/my-resort-bookings", getMyResortBookings);

/* ===================== ADMIN ===================== */
router.get("/admin/resort-bookings", adminGetAllResortBookings);

router.get(
  "/admin/resort-bookings/:bookingId/proof",
  adminGetResortBookingProof
);

router.put(
  "/admin/resort-bookings/:bookingId/status",
  adminUpdateResortBookingStatus
);

router.get(
  "/admin/resort-bookings/:bookingId/reschedule-options",
  adminGetResortRescheduleOptions
);

router.put(
  "/admin/resort-bookings/:bookingId/reschedule",
  adminRescheduleResortBooking
);

/* ===================== MULTER ERROR HANDLER ===================== */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File must be 5MB or smaller.",
      });
    }
    return res.status(400).json({
      message: err.message || "Upload error.",
    });
  }

  if (err?.message === "Only image or PDF files are allowed.") {
    return res.status(400).json({ message: err.message });
  }

  return next(err);
});

export default router;
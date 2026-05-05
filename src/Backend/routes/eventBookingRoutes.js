// src/Backend/routes/eventBookingRoutes.js
import express from "express";
import multer from "multer";
import {
  createEventBooking,
  getMyEventBookings,
  getEventBookedDates,
  checkEventAvailability,
  adminGetAllEventBookings,
  adminGetEventBookingProof,
  adminUpdateEventBookingStatus,
  adminRescheduleEventBooking,
  adminGetEventRescheduleOptions,
} from "../controllers/eventBookingController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
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
router.get("/event-bookings/booked-dates", getEventBookedDates);
router.get("/event-bookings/check", checkEventAvailability);
router.post("/event-bookings", upload.single("proof"), createEventBooking);
router.get("/my-event-bookings", getMyEventBookings);

/* ===================== ADMIN ===================== */
router.get("/admin/event-bookings", adminGetAllEventBookings);

router.get(
  "/admin/event-bookings/:bookingId/proof",
  adminGetEventBookingProof
);

router.put(
  "/admin/event-bookings/:bookingId/status",
  adminUpdateEventBookingStatus
);

router.get(
  "/admin/event-bookings/:bookingId/reschedule-options",
  adminGetEventRescheduleOptions
);

router.put(
  "/admin/event-bookings/:bookingId/reschedule",
  adminRescheduleEventBooking
);

/* ===================== MULTER ERROR HANDLER ===================== */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File must be 5MB or smaller.",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || "Upload error.",
    });
  }

  if (err?.message === "Only image or PDF files are allowed.") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return next(err);
});

export default router;

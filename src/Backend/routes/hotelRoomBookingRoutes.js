// src/Backend/routes/hotelRoomBookingRoutes.js
import express from "express";
import multer from "multer";
import {
  createHotelRoomBooking,
  checkHotelRoomAvailability,
  getHotelRoomBookedDates,
  getMyHotelRoomBookings,
  adminGetAllHotelRoomBookings,
  adminGetHotelRoomBookingProof,
  adminUpdateHotelRoomBookingStatus,
  adminRescheduleHotelRoomBooking,
  adminGetHotelRoomRescheduleOptions,
} from "../controllers/hotelRoomBookingController.js";

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
router.post("/hotel-room-bookings", upload.single("proof"), createHotelRoomBooking);

router.get("/hotel-room-bookings/check", checkHotelRoomAvailability);

router.get("/hotel-room-bookings/booked-dates", getHotelRoomBookedDates);

router.get("/my-hotel-room-bookings", getMyHotelRoomBookings);

/* ===================== ADMIN ===================== */
router.get("/admin/hotel-room-bookings", adminGetAllHotelRoomBookings);

router.get(
  "/admin/hotel-room-bookings/:bookingId/proof",
  adminGetHotelRoomBookingProof
);

router.put(
  "/admin/hotel-room-bookings/:bookingId/status",
  adminUpdateHotelRoomBookingStatus
);

router.get(
  "/admin/hotel-room-bookings/:bookingId/reschedule-options",
  adminGetHotelRoomRescheduleOptions
);

router.put(
  "/admin/hotel-room-bookings/:bookingId/reschedule",
  adminRescheduleHotelRoomBooking
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
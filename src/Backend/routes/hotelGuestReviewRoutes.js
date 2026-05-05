// src/Backend/routes/hotelGuestReviewRoutes.js
import express from "express";
import {
  getApprovedBookingHistoryForReview,
  createGuestReview,
  getMyGuestReviews,
  adminGetAllGuestReviews,
  adminReplyToGuestReview,
} from "../controllers/hotelGuestReviewController.js";

const router = express.Router();

/* ===================== USER ===================== */
router.get("/approved-booking-history", getApprovedBookingHistoryForReview);
router.post("/guest-reviews", createGuestReview);
router.get("/my-guest-reviews", getMyGuestReviews);

/* ===================== ADMIN ===================== */
router.get("/admin/guest-reviews", adminGetAllGuestReviews);
router.put("/admin/guest-reviews/:reviewId/reply", adminReplyToGuestReview);

export default router;
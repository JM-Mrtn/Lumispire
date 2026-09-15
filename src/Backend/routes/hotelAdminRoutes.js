// src/Backend/routes/hotelAdminRoutes.js
import express from "express";
import {
  adminLogin,
  getAllHotelUsers,
  getHotelUserById,
  adminUpdateUser,
  deactivateUser,
  activateUser,
  deleteDeactivatedUser,
  adminApproveHotelId,
  adminRejectHotelId,
  adminRunHotelIdAiCheck,
  adminGetHotelIdFile,
} from "../controllers/hotelAdminController.js";

import { adminGetAllHotelBookings } from "../controllers/hotelAdminBookingController.js";
import {
  adminGetBlockedDates,
  adminCreateBlockedDate,
  adminDeleteBlockedDate,
} from "../controllers/hotelBlockedDateController.js";

const router = express.Router();

router.post("/admin-login", adminLogin);

/* Combined admin bookings endpoint */
router.get("/admin/bookings", adminGetAllHotelBookings);

// Blocked-date admin API. Keep both route shapes for compatibility because
// this router is mounted under both /api/hotel and /api/hotel-admin.
router.get("/admin/blocked-dates", adminGetBlockedDates);
router.post("/admin/blocked-dates", adminCreateBlockedDate);
router.delete("/admin/blocked-dates/:blockedDateId", adminDeleteBlockedDate);

router.get("/blocked-dates", adminGetBlockedDates);
router.post("/blocked-dates", adminCreateBlockedDate);
router.delete("/blocked-dates/:blockedDateId", adminDeleteBlockedDate);

router.get("/hotel-users", getAllHotelUsers);
router.get("/hotel-users/:userId", getHotelUserById);

router.put("/admin-update-user/:userId", adminUpdateUser);
router.put("/deactivate-user/:userId", deactivateUser);
router.put("/activate-user/:userId", activateUser);
router.delete("/hotel-users/:userId", deleteDeactivatedUser);

router.put("/admin-approve-id/:userId", adminApproveHotelId);
router.put("/admin-reject-id/:userId", adminRejectHotelId);
router.post("/admin-run-ai-id-check/:verificationId", adminRunHotelIdAiCheck);

router.get("/admin-hotel-id-file/:verificationId", adminGetHotelIdFile);

export default router;
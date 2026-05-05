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

const router = express.Router();

router.post("/admin-login", adminLogin);

router.get("/hotel-users", getAllHotelUsers);
router.get("/hotel-users/:userId", getHotelUserById);

router.put("/admin-update-user/:userId", adminUpdateUser);
router.put("/deactivate-user/:userId", deactivateUser);
router.put("/activate-user/:userId", activateUser);
router.delete("/hotel-users/:userId", deleteDeactivatedUser);

router.put("/admin-approve-id/:userId", adminApproveHotelId);
router.put("/admin-reject-id/:userId", adminRejectHotelId);
router.post("/admin-run-ai-id-check/:verificationId", adminRunHotelIdAiCheck);

// ✅ reads hotel ID directly from MongoDB
router.get("/admin-hotel-id-file/:verificationId", adminGetHotelIdFile);

export default router;
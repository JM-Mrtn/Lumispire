import express from "express";
import verifyTrainingAdmin from "../middleware/verifyTrainingAdmin.js";
import {
  listAdminEnrollments,
  getAdminEnrollmentById,
  approveAdminEnrollment,
  rejectAdminEnrollment,
  completeAdminEnrollment,
} from "../controllers/adminEnrollmentController.js";

const router = express.Router();

router.use(verifyTrainingAdmin);

router.get("/", listAdminEnrollments);
router.get("/:id", getAdminEnrollmentById);

router.patch("/:id/approve", approveAdminEnrollment);
router.put("/:id/approve", approveAdminEnrollment);

router.patch("/:id/reject", rejectAdminEnrollment);
router.put("/:id/reject", rejectAdminEnrollment);

router.patch("/:id/complete", completeAdminEnrollment);
router.put("/:id/complete", completeAdminEnrollment);

export default router;

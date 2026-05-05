import express from "express";
import {
  createEnrollment,
  checkEnrollmentEmailAvailability,
} from "../controllers/enrollmentController.js";
import { listOpenEnrollmentBatches } from "../controllers/trainingBatchController.js";
import { listPublicTrainingCourses } from "../controllers/adminCourseController.js";
import { trainingEnrollmentUpload } from "../middleware/trainingUpload.js";

const router = express.Router();

router.get("/courses", listPublicTrainingCourses);
router.get("/open-batches", listOpenEnrollmentBatches);
router.get("/check-email", checkEnrollmentEmailAvailability);
router.get("/check-email/:email", checkEnrollmentEmailAvailability);
router.post("/", trainingEnrollmentUpload, createEnrollment);

export default router;
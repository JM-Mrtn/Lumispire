import express from "express";
import verifyTrainingAdmin from "../middleware/verifyTrainingAdmin.js";
import {
  getAdminCourseRoadmap,
  updateAdminCourseRoadmap,
  resetAdminCourseRoadmap,
} from "../controllers/adminRoadmapController.js";

const router = express.Router();

router.use(verifyTrainingAdmin);
router.get("/:courseId", getAdminCourseRoadmap);
router.put("/:courseId", updateAdminCourseRoadmap);
router.patch("/:courseId", updateAdminCourseRoadmap);
router.post("/:courseId/reset", resetAdminCourseRoadmap);

export default router;

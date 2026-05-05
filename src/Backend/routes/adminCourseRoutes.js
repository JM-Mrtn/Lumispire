import express from "express";
import verifyTrainingAdmin from "../middleware/verifyTrainingAdmin.js";
import {
  listAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
} from "../controllers/adminCourseController.js";

const router = express.Router();

router.use(verifyTrainingAdmin);
router.get("/", listAdminCourses);
router.post("/", createAdminCourse);
router.put("/:id", updateAdminCourse);
router.patch("/:id", updateAdminCourse);
router.delete("/:id", deleteAdminCourse);

export default router;

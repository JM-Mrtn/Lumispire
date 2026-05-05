import express from "express";
import {
  getManpowerExamByApplication,
  submitManpowerExamByApplication,
} from "../controllers/manpowerAssessmentController.js";

const router = express.Router();

router.get("/applications/:id/exam", getManpowerExamByApplication);
router.post("/applications/:id/exam", submitManpowerExamByApplication);

export default router;

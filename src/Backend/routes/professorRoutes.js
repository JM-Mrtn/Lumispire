import express from "express";
import requireProfessor from "../middleware/requireProfessor.js";
import {
  professorLogin,
  professorMe,
  professorDashboard,
  listProfessorTrainees,
  listProfessorAttendanceDates,
  listProfessorAttendance,
  saveProfessorAttendance,
  saveProfessorAttendanceBulk,
  updateProfessorAttendance,
  exportProfessorAttendance,
  reviewProfessorAttendanceProof,
  listProfessorAssessments,
  createProfessorAssessment,
  updateProfessorAssessment,
  deleteProfessorAssessment,
  listProfessorScores,
  saveProfessorScore,
  updateProfessorScore,
  deleteProfessorScore,
} from "../controllers/professorController.js";
import {
  listProfessorBatches,
} from "../controllers/trainingBatchController.js";
import { listProfessorAssessmentSubmissions } from "../controllers/professorAssessmentSubmissionController.js";
import { markTraineePassedByProfessor } from "../controllers/trainingCertificationController.js";
import {
  getProfessorTraineeProgress,
  updateProfessorTraineeCompetencies,
} from "../controllers/trainingProgressController.js";
import { trainingAssessmentUpload } from "../middleware/trainingAssessmentUpload.js";
import { trainingModuleUpload } from "../middleware/trainingModuleUpload.js";
import {
  createProfessorModule,
  listProfessorModules,
  updateProfessorModule,
  deleteProfessorModule,
} from "../controllers/trainingModuleController.js";

const router = express.Router();

router.post("/login", professorLogin);

router.use(requireProfessor);

router.get("/me", professorMe);
router.get("/dashboard", professorDashboard);
router.get("/trainees", listProfessorTrainees);
router.patch("/trainees/:traineeId/pass", markTraineePassedByProfessor);
router.get("/trainees/:traineeId/progress", getProfessorTraineeProgress);
router.patch(
  "/trainees/:traineeId/competencies",
  updateProfessorTraineeCompetencies
);

router.get("/attendance/dates", listProfessorAttendanceDates);
router.get("/attendance", listProfessorAttendance);
router.get("/attendance/export", exportProfessorAttendance);
router.post("/attendance", saveProfessorAttendance);
router.post("/attendance/bulk", saveProfessorAttendanceBulk);
router.put("/attendance/:id", updateProfessorAttendance);
router.patch("/attendance/:id", updateProfessorAttendance);
router.patch(
  "/attendance/:attendanceId/review-proof",
  reviewProfessorAttendanceProof
);

router.get("/assessments", listProfessorAssessments);
router.get("/assessments/:id/submissions", listProfessorAssessmentSubmissions);
router.post("/assessments", trainingAssessmentUpload, createProfessorAssessment);
router.put(
  "/assessments/:id",
  trainingAssessmentUpload,
  updateProfessorAssessment
);
router.patch(
  "/assessments/:id",
  trainingAssessmentUpload,
  updateProfessorAssessment
);
router.delete("/assessments/:id", deleteProfessorAssessment);

router.get("/scores", listProfessorScores);
router.post("/scores", saveProfessorScore);
router.put("/scores/:id", updateProfessorScore);
router.patch("/scores/:id", updateProfessorScore);
router.delete("/scores/:id", deleteProfessorScore);

router.get("/modules", listProfessorModules);
router.post("/modules", trainingModuleUpload, createProfessorModule);
router.put("/modules/:id", trainingModuleUpload, updateProfessorModule);
router.patch("/modules/:id", trainingModuleUpload, updateProfessorModule);
router.delete("/modules/:id", deleteProfessorModule);

router.get("/batches", listProfessorBatches);

export default router;
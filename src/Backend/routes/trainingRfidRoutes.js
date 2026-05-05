import express from "express";
import {
  getRfidTrainees,
  registerTraineeRfid,
  removeTraineeRfid,
  scanTraineeRfid,
  getTraineeRfidLogs,
  openProfessorRfidAttendance,
  closeProfessorRfidAttendance,
  getProfessorRfidAttendanceStatus,
  exportProfessorRfidAttendance,
} from "../controllers/trainingRfidController.js";
import verifyTrainingAdmin from "../middleware/verifyTrainingAdmin.js";
import requireProfessor from "../middleware/requireProfessor.js";

const router = express.Router();

router.post("/scan", scanTraineeRfid);

router.get(
  "/professor/status",
  requireProfessor,
  getProfessorRfidAttendanceStatus
);

router.get(
  "/professor/export",
  requireProfessor,
  exportProfessorRfidAttendance
);

router.post(
  "/professor/open",
  requireProfessor,
  openProfessorRfidAttendance
);

router.patch(
  "/professor/close",
  requireProfessor,
  closeProfessorRfidAttendance
);

router.get("/trainees", verifyTrainingAdmin, getRfidTrainees);
router.post("/register", verifyTrainingAdmin, registerTraineeRfid);
router.delete("/remove/:traineeId", verifyTrainingAdmin, removeTraineeRfid);
router.get("/logs", verifyTrainingAdmin, getTraineeRfidLogs);

export default router;
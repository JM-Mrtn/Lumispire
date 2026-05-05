import express from "express";
import verifyManpowerHr from "../middleware/verifyManpowerHr.js";
import {
  manpowerHrLogin,
  listManpowerApplications,
  getManpowerApplicationById,
  getManpowerApplicationRequirementFile,
  scheduleManpowerInterview,
  rejectManpowerApplicant,
  hireManpowerApplicant,
  listManpowerEmployees,
  listManpowerLeavesForHr,
  approveManpowerLeave,
  rejectManpowerLeave,
} from "../controllers/manpowerHrController.js";
import {
  upsertManpowerPayroll,
  listManpowerPayroll,
} from "../controllers/manpowerPayrollController.js";

const router = express.Router();

router.post("/login", manpowerHrLogin);

router.get("/applications", verifyManpowerHr, listManpowerApplications);
router.get("/applications/:id", verifyManpowerHr, getManpowerApplicationById);
router.get(
  "/applications/:id/requirement/:key",
  verifyManpowerHr,
  getManpowerApplicationRequirementFile
);
router.post(
  "/applications/:id/schedule-interview",
  verifyManpowerHr,
  scheduleManpowerInterview
);
router.post("/applications/:id/reject", verifyManpowerHr, rejectManpowerApplicant);
router.post("/applications/:id/hire", verifyManpowerHr, hireManpowerApplicant);

router.get("/employees", verifyManpowerHr, listManpowerEmployees);

router.get("/leaves", verifyManpowerHr, listManpowerLeavesForHr);
router.patch("/leaves/:leaveId/approve", verifyManpowerHr, approveManpowerLeave);
router.patch("/leaves/:leaveId/reject", verifyManpowerHr, rejectManpowerLeave);

router.get("/payroll", verifyManpowerHr, listManpowerPayroll);
router.post("/payroll/:employeeId", verifyManpowerHr, upsertManpowerPayroll);

export default router;
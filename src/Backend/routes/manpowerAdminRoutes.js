import express from "express";
import verifyManpowerAdmin from "../middleware/verifyManpowerAdmin.js";
import { manpowerProfilePhotoUpload } from "../middleware/manpowerUpload.js";
import {
  manpowerAdminLogin,
  getManpowerAdminDashboard,
  listManpowerAdminAccounts,
  updateManpowerEmployeeAccountStatus,
  updateManpowerEmployeeDailyRate,
  updateManpowerEmployeePasswordFlag,
  resetManpowerEmployeePassword,
  listManpowerJobs,
  createManpowerJob,
  updateManpowerJob,
  updateManpowerJobStatus,
  deleteManpowerJob,
} from "../controllers/manpowerAdminController.js";
import {
  getManpowerDeductionConfig,
  updateManpowerDeductionConfig,
  resetManpowerDeductionConfig,
} from "../controllers/manpowerDeductionConfigController.js";

const router = express.Router();

router.post("/login", manpowerAdminLogin);

router.use(verifyManpowerAdmin);

router.get("/deductions", getManpowerDeductionConfig);
router.put("/deductions", updateManpowerDeductionConfig);
router.post("/deductions/reset", resetManpowerDeductionConfig);

router.get("/dashboard", getManpowerAdminDashboard);

router.get("/jobs", listManpowerJobs);

router.post(
  "/jobs",
  manpowerProfilePhotoUpload.single("image"),
  createManpowerJob
);

router.put(
  "/jobs/:jobId",
  manpowerProfilePhotoUpload.single("image"),
  updateManpowerJob
);

router.patch("/jobs/:jobId/status", updateManpowerJobStatus);
router.delete("/jobs/:jobId", deleteManpowerJob);

router.get("/accounts", listManpowerAdminAccounts);

router.patch(
  "/accounts/:employeeId/status",
  updateManpowerEmployeeAccountStatus
);

router.patch(
  "/accounts/:employeeId/daily-rate",
  updateManpowerEmployeeDailyRate
);

router.patch(
  "/accounts/:employeeId/must-change-password",
  updateManpowerEmployeePasswordFlag
);

router.post(
  "/accounts/:employeeId/reset-password",
  resetManpowerEmployeePassword
);

export default router;
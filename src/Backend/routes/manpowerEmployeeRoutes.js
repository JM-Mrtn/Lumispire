import express from "express";
import requireManpowerEmployee from "../middleware/requireManpowerEmployee.js";
import { manpowerProfilePhotoUpload } from "../middleware/manpowerUpload.js";
import {
  manpowerEmployeeLogin,
  manpowerEmployeeMe,
  uploadMyManpowerProfilePhoto,
  streamMyManpowerProfilePhoto,
  listMyManpowerPayroll,
  fileMyManpowerLeave,
  listMyManpowerLeaves,
  requestManpowerEmployeeChangePasswordOtp,
  manpowerEmployeeChangePassword,
} from "../controllers/manpowerEmployeeAuthController.js";

const router = express.Router();

router.post("/login", manpowerEmployeeLogin);

router.get("/me", requireManpowerEmployee, manpowerEmployeeMe);

router.post(
  "/profile-photo",
  requireManpowerEmployee,
  manpowerProfilePhotoUpload.single("profilePhoto"),
  uploadMyManpowerProfilePhoto
);

router.get(
  "/profile-photo",
  requireManpowerEmployee,
  streamMyManpowerProfilePhoto
);

router.get("/payroll", requireManpowerEmployee, listMyManpowerPayroll);

router.get("/leaves", requireManpowerEmployee, listMyManpowerLeaves);
router.post("/leaves", requireManpowerEmployee, fileMyManpowerLeave);

router.post(
  "/change-password/request-otp",
  requireManpowerEmployee,
  requestManpowerEmployeeChangePasswordOtp
);

router.post(
  "/change-password",
  requireManpowerEmployee,
  manpowerEmployeeChangePassword
);

export default router;
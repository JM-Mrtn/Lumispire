import express from "express";
import {
  traineeLogin,
  traineeProfile,
  traineeUploadProfilePhoto,
  traineeUpdateProfile,
  traineeRequestChangePasswordOtp,
  traineeResendChangePasswordOtp,
  traineeVerifyChangePasswordOtp,
  traineeForgotPasswordRequestOtp,
  traineeForgotPasswordResendOtp,
  traineeForgotPasswordVerifyOtp,
} from "../controllers/trainingAdminController.js";
import { requireTrainee } from "../middleware/requireTrainee.js";
import {
  listMyTraineeAttendance,
  submitTraineeAttendanceProof,
} from "../controllers/traineeAttendanceController.js";
import { trainingAttendanceProofUpload } from "../middleware/trainingAttendanceProofUpload.js";
import { listTraineeModules } from "../controllers/trainingModuleController.js";
import {
  listTraineeAssessments,
  submitTraineeAssessment,
} from "../controllers/traineeAssessmentController.js";
import {
  getMyTraineePretest,
  submitMyTraineePretest,
} from "../controllers/trainingPretestController.js";
import {
  getMyTrainingCertificate,
  verifyTrainingCertificate,
  searchTrainingCertificates,
} from "../controllers/trainingCertificationController.js";
import { trainingAssessmentSubmissionUpload } from "../middleware/trainingAssessmentSubmissionUpload.js";
import { trainingProfilePhotoUpload } from "../middleware/trainingProfilePhotoUpload.js";
import { getMyTrainingProgress } from "../controllers/trainingProgressController.js";

const router = express.Router();

router.post("/login", traineeLogin);
router.get("/profile", requireTrainee, traineeProfile);
router.patch("/profile", requireTrainee, traineeUpdateProfile);
router.put("/profile", requireTrainee, traineeUpdateProfile);

router.patch("/profile/photo", requireTrainee, trainingProfilePhotoUpload, traineeUploadProfilePhoto);
router.post("/change-password/request-otp", requireTrainee, traineeRequestChangePasswordOtp);
router.post("/change-password/resend-otp", requireTrainee, traineeResendChangePasswordOtp);
router.post("/change-password/verify-otp", requireTrainee, traineeVerifyChangePasswordOtp);

router.post("/forgot-password/request-otp", traineeForgotPasswordRequestOtp);
router.post("/forgot-password/resend-otp", traineeForgotPasswordResendOtp);
router.post("/forgot-password/verify-otp", traineeForgotPasswordVerifyOtp);

router.get("/pretest", requireTrainee, getMyTraineePretest);
router.post("/pretest/submit", requireTrainee, submitMyTraineePretest);

router.get("/modules", requireTrainee, listTraineeModules);
router.get("/assessments", requireTrainee, listTraineeAssessments);
router.post("/assessments/:assessmentId/submit", requireTrainee, trainingAssessmentSubmissionUpload, submitTraineeAssessment);

router.get("/attendance", requireTrainee, listMyTraineeAttendance);
router.post("/attendance/proof", requireTrainee, trainingAttendanceProofUpload, submitTraineeAttendanceProof);

router.get("/progress", requireTrainee, getMyTrainingProgress);

router.get("/certificate", requireTrainee, getMyTrainingCertificate);
router.get("/certificate/search", searchTrainingCertificates);
router.get("/certificate/verify", verifyTrainingCertificate);
router.get("/certificate/verify/:verificationCode", verifyTrainingCertificate);

export default router;

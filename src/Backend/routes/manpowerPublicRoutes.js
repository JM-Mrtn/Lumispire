import express from "express";
import {
  listManpowerVacancies,
  checkManpowerApplicationEmailAvailability,
  submitManpowerApplication,
} from "../controllers/manpowerPublicController.js";
import { askManpowerChatbot } from "../controllers/manpowerChatbotController.js";
import { manpowerRequirementUpload } from "../middleware/manpowerUpload.js";

const router = express.Router();

router.get("/vacancies", listManpowerVacancies);
router.get("/check-email", checkManpowerApplicationEmailAvailability);
router.post("/apply", manpowerRequirementUpload, submitManpowerApplication);
router.post("/chatbot", askManpowerChatbot);

export default router;

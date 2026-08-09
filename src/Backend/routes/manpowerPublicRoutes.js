import express from "express";
import {
  listManpowerVacancies,
  checkManpowerApplicationEmailAvailability,
  submitManpowerApplication,
} from "../controllers/manpowerPublicController.js";
import { askManpowerChatbot } from "../controllers/manpowerChatbotController.js";
import { listPublicManpowerHighlights } from "../controllers/manpowerHighlightController.js";
import { sendManpowerContactMessage } from "../controllers/manpowerContactController.js";
import { manpowerRequirementUpload } from "../middleware/manpowerUpload.js";

const router = express.Router();

router.get("/vacancies", listManpowerVacancies);
router.get("/highlights", listPublicManpowerHighlights);
router.get("/check-email", checkManpowerApplicationEmailAvailability);
router.post("/apply", manpowerRequirementUpload, submitManpowerApplication);
router.post("/chatbot", askManpowerChatbot);
router.post("/contact-message", sendManpowerContactMessage);

export default router;

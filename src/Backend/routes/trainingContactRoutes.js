import express from "express";
import { sendTrainingContactMessage } from "../controllers/trainingContactController.js";

const router = express.Router();

router.post("/contact-message", sendTrainingContactMessage);

export default router;

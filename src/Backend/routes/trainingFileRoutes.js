import express from "express";
import { streamTrainingUploadedFile } from "../controllers/trainingFileController.js";

const router = express.Router();

router.get("/:id", streamTrainingUploadedFile);

export default router;
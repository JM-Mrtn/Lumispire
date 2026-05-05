import express from "express";
import { trainingAdminLogin } from "../controllers/trainingAdminAuthController.js";

const router = express.Router();

// Dedicated training admin login endpoint
router.post("/login", trainingAdminLogin);

export default router;
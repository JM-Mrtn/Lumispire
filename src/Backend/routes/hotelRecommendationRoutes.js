// src/Backend/routes/hotelRecommendationRoutes.js
import express from "express";
import { getHotelSmartRecommendations } from "../controllers/hotelRecommendationController.js";

const router = express.Router();

router.get("/recommendations", getHotelSmartRecommendations);

export default router;
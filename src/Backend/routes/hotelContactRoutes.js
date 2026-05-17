import express from "express";
import { sendHotelContactMessage } from "../controllers/hotelContactController.js";

const router = express.Router();

router.post("/contact-message", sendHotelContactMessage);

export default router;
import express from "express";
import requireHotelVerifiedUser from "../middleware/requireHotelVerifiedUser.js";
import requireHotelAdmin from "../middleware/requireHotelAdmin.js";
import {
  getMyHotelChatMessages,
  sendMyHotelChatMessage,
  getHotelAdminChatConversations,
  getHotelAdminConversationMessages,
  sendHotelAdminConversationMessage,
} from "../controllers/hotelChatController.js";

const router = express.Router();

/* USER: verified hotel guest conversation */
router.get("/my/messages", requireHotelVerifiedUser, getMyHotelChatMessages);
router.post("/my/messages", requireHotelVerifiedUser, sendMyHotelChatMessage);

/* ADMIN: support inbox */
router.get(
  "/admin/conversations",
  requireHotelAdmin,
  getHotelAdminChatConversations
);

router.get(
  "/admin/conversations/:userId/messages",
  requireHotelAdmin,
  getHotelAdminConversationMessages
);

router.post(
  "/admin/conversations/:userId/messages",
  requireHotelAdmin,
  sendHotelAdminConversationMessage
);

export default router;

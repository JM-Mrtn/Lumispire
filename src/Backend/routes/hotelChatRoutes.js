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

/* User private conversation with admin */
router.get("/my/messages", requireHotelVerifiedUser, getMyHotelChatMessages);
router.post("/my/messages", requireHotelVerifiedUser, sendMyHotelChatMessage);

/* Admin conversation inbox */
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
import mongoose from "mongoose";
import HotelChatMessage from "../models/HotelChatMessage.js";
import HotelUser from "../models/hotelUser.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const VALID_CONCERNS = ["reschedule", "cancel", "others"];

const CONCERN_LABELS = {
  reschedule: "Reschedule",
  cancel: "Cancel",
  others: "Others",
};

const getUserDisplayName = (user) => {
  if (!user) return "Hotel User";

  return (
    user.fullName ||
    user.name ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.email ||
    "Hotel User"
  );
};

const buildUserInfo = (user) => ({
  _id: user?._id,
  fullName: getUserDisplayName(user),
  name: getUserDisplayName(user),
  email: user?.email || "",
  phone: user?.phone || user?.contactNumber || "",
  idVerificationStatus: user?.idVerificationStatus || "",
  isIdentityVerified: user?.isIdentityVerified || false,
});

function cleanText(value = "") {
  return String(value || "").trim();
}

function normalizeConcernType(value = "") {
  const raw = cleanText(value).toLowerCase();
  return VALID_CONCERNS.includes(raw) ? raw : "";
}

function sanitizeConcernDetails(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [
      key,
      typeof val === "string" ? cleanText(val) : val,
    ])
  );
}

function getManilaDateParts() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value || "";

  const weekdayText = get("weekday");
  const weekdayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  let hour = Number(get("hour"));
  if (hour === 24) hour = 0;

  return {
    weekday: weekdayMap[weekdayText] ?? 0,
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number(get("minute")) || 0,
  };
}

function parseWorkingDays() {
  const raw = String(process.env.HOTEL_CHAT_WORKING_DAYS || "1,2,3,4,5,6")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6);

  return raw.length > 0 ? raw : [1, 2, 3, 4, 5, 6];
}

function getWorkingHoursStatus() {
  const startHour = Number(process.env.HOTEL_CHAT_WORKING_HOUR_START || 8);
  const endHour = Number(process.env.HOTEL_CHAT_WORKING_HOUR_END || 17);
  const workingDays = parseWorkingDays();
  const now = getManilaDateParts();

  const isWorkingDay = workingDays.includes(now.weekday);
  const isWorkingHour =
    Number.isFinite(startHour) &&
    Number.isFinite(endHour) &&
    now.hour >= startHour &&
    now.hour < endHour;

  return {
    isOpen: isWorkingDay && isWorkingHour,
    startHour,
    endHour,
    timezone: "Asia/Manila",
  };
}

function formatHour(hour) {
  const n = Number(hour);
  if (!Number.isFinite(n)) return "";

  if (n === 0) return "12:00 AM";
  if (n < 12) return `${n}:00 AM`;
  if (n === 12) return "12:00 PM";
  return `${n - 12}:00 PM`;
}

function buildBotReply({ concernType = "" }) {
  const status = getWorkingHoursStatus();
  const concernLabel = CONCERN_LABELS[concernType] || "your concern/needs";

  if (status.isOpen) {
    return {
      autoReplyKind: "working_hours",
      text:
        `Thank you for your message about ${concernLabel.toLowerCase()}.\n\n` +
        "Please wait for the admin to reply to your concern/needs.",
    };
  }

  return {
    autoReplyKind: "after_hours",
    text:
      `Thank you for your message about ${concernLabel.toLowerCase()}.\n\n` +
      `Our admin support is currently outside working hours. Please wait for our working hours ` +
      `(${formatHour(status.startHour)} - ${formatHour(status.endHour)}, Asia/Manila time).\n\n` +
      "For now, you may check our FAQs here: /hotel-faqs",
  };
}

async function populateMessage(messageId) {
  return HotelChatMessage.findById(messageId)
    .populate(
      "conversationUser",
      "fullName name firstName lastName email phone contactNumber idVerificationStatus isIdentityVerified"
    )
    .lean();
}

function emitMessage(io, userId, message) {
  if (!io || !message) return;

  io.to(`hotel-chat-user-${userId}`).emit("hotelChat:message", message);

  io.to("hotel-chat-admins").emit("hotelChat:newConversationMessage", {
    conversationUser: userId,
    message,
  });
}

async function userAlreadySpecifiedConcern(userId) {
  const existing = await HotelChatMessage.exists({
    conversationUser: userId,
    concernType: { $in: VALID_CONCERNS },
    messageType: "inquiry",
  });

  return Boolean(existing);
}

/* ===================== USER: GET MY MESSAGES ===================== */

export const getMyHotelChatMessages = async (req, res) => {
  try {
    const userId = req.hotelUserId;

    const messages = await HotelChatMessage.find({
      conversationUser: userId,
    })
      .sort({ createdAt: 1 })
      .lean();

    await HotelChatMessage.updateMany(
      {
        conversationUser: userId,
        senderRole: { $in: ["admin", "bot"] },
        readByUser: false,
      },
      { $set: { readByUser: true } }
    );

    return res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("getMyHotelChatMessages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load your chat messages.",
    });
  }
};

/* ===================== USER: SEND MESSAGE ===================== */

export const sendMyHotelChatMessage = async (req, res) => {
  try {
    const userId = req.hotelUserId;
    const text = cleanText(req.body.message || req.body.text || "");
    const concernType = normalizeConcernType(req.body.concernType);
    const concernDetails = sanitizeConcernDetails(req.body.concernDetails);

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    /*
      User must send concern form first.
      After that, every normal message is allowed.
    */
    if (!concernType) {
      const hasConcern = await userAlreadySpecifiedConcern(userId);

      if (!hasConcern) {
        return res.status(400).json({
          success: false,
          message: "Please specify your concern/need first before chatting.",
        });
      }
    }

    const savedMessage = await HotelChatMessage.create({
      conversationUser: userId,
      sender: userId,
      senderRole: "user",
      message: text,
      messageType: concernType ? "inquiry" : "chat",
      concernType,
      concernDetails,
      readByUser: true,
      readByAdmin: false,
    });

    const populatedMessage = await populateMessage(savedMessage._id);
    const io = req.app.get("io");

    emitMessage(io, userId, populatedMessage);

    /*
      FIX:
      Auto-reply now happens for EVERY user message:
      - concern form messages
      - normal follow-up chat messages
    */
    const botReply = buildBotReply({ concernType });
    const workingHours = getWorkingHoursStatus();

    const botMessage = await HotelChatMessage.create({
      conversationUser: userId,
      sender: null,
      senderRole: "bot",
      message: botReply.text,
      messageType: "auto_reply",
      concernType,
      concernDetails,
      isAutoReply: true,
      autoReplyKind: botReply.autoReplyKind,
      readByUser: false,
      readByAdmin: true,
    });

    const populatedBotMessage = await populateMessage(botMessage._id);
    emitMessage(io, userId, populatedBotMessage);

    return res.status(201).json({
      success: true,
      message: populatedMessage,
      botMessage: populatedBotMessage,
      workingHours,
    });
  } catch (error) {
    console.error("sendMyHotelChatMessage error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
};

/* ===================== ADMIN: GET CONVERSATIONS ===================== */

export const getHotelAdminChatConversations = async (req, res) => {
  try {
    const latestMessages = await HotelChatMessage.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$conversationUser",
          lastMessageId: { $first: "$_id" },
          lastMessage: { $first: "$message" },
          lastMessageAt: { $first: "$createdAt" },
          lastSenderRole: { $first: "$senderRole" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$senderRole", "user"] },
                    { $eq: ["$readByAdmin", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          lastMessageAt: -1,
        },
      },
    ]);

    const userIds = latestMessages.map((item) => item._id).filter(Boolean);

    const [users, latestConcerns] = await Promise.all([
      HotelUser.find({
        _id: { $in: userIds },
      })
        .select(
          "fullName name firstName lastName email phone contactNumber idVerificationStatus isIdentityVerified"
        )
        .lean(),

      HotelChatMessage.aggregate([
        {
          $match: {
            conversationUser: { $in: userIds },
            concernType: { $in: VALID_CONCERNS },
            messageType: "inquiry",
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $group: {
            _id: "$conversationUser",
            latestConcernType: { $first: "$concernType" },
            latestConcernDetails: { $first: "$concernDetails" },
            latestConcernAt: { $first: "$createdAt" },
          },
        },
      ]),
    ]);

    const userMap = new Map(users.map((user) => [String(user._id), user]));

    const concernMap = new Map(
      latestConcerns.map((item) => [String(item._id), item])
    );

    const conversations = latestMessages.map((item) => {
      const user = userMap.get(String(item._id));
      const concern = concernMap.get(String(item._id));

      return {
        conversationUser: item._id,
        user: buildUserInfo(user),
        lastMessage: item.lastMessage,
        lastMessageAt: item.lastMessageAt,
        lastSenderRole: item.lastSenderRole,
        latestConcernType: concern?.latestConcernType || "",
        latestConcernDetails: concern?.latestConcernDetails || {},
        latestConcernAt: concern?.latestConcernAt || null,
        unreadCount: item.unreadCount || 0,
      };
    });

    return res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("getHotelAdminChatConversations error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load admin chat conversations.",
    });
  }
};

/* ===================== ADMIN: GET CONVERSATION MESSAGES ===================== */

export const getHotelAdminConversationMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await HotelUser.findById(userId)
      .select(
        "fullName name firstName lastName email phone contactNumber idVerificationStatus isIdentityVerified"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Hotel user not found.",
      });
    }

    const messages = await HotelChatMessage.find({
      conversationUser: userId,
    })
      .sort({ createdAt: 1 })
      .lean();

    await HotelChatMessage.updateMany(
      {
        conversationUser: userId,
        senderRole: "user",
        readByAdmin: false,
      },
      { $set: { readByAdmin: true } }
    );

    return res.json({
      success: true,
      user: buildUserInfo(user),
      messages,
    });
  } catch (error) {
    console.error("getHotelAdminConversationMessages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load conversation messages.",
    });
  }
};

/* ===================== ADMIN: SEND REPLY ===================== */

export const sendHotelAdminConversationMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const text = cleanText(req.body.message || req.body.text || "");

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const user = await HotelUser.findById(userId)
      .select(
        "fullName name firstName lastName email phone contactNumber idVerificationStatus isIdentityVerified"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Hotel user not found.",
      });
    }

    const savedMessage = await HotelChatMessage.create({
      conversationUser: userId,
      sender: null,
      senderRole: "admin",
      message: text,
      messageType: "chat",
      readByUser: false,
      readByAdmin: true,
    });

    const populatedMessage = await populateMessage(savedMessage._id);
    const io = req.app.get("io");

    emitMessage(io, userId, populatedMessage);

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("sendHotelAdminConversationMessage error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send admin reply.",
    });
  }
};
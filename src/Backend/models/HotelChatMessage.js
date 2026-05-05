import mongoose from "mongoose";

const hotelChatMessageSchema = new mongoose.Schema(
  {
    conversationUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelUser",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelUser",
      default: null,
    },

    senderRole: {
      type: String,
      enum: ["user", "admin", "bot"],
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    messageType: {
      type: String,
      enum: ["chat", "inquiry", "auto_reply"],
      default: "chat",
      index: true,
    },

    concernType: {
      type: String,
      enum: ["", "reschedule", "cancel", "others"],
      default: "",
      index: true,
    },

    concernDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isAutoReply: {
      type: Boolean,
      default: false,
      index: true,
    },

    autoReplyKind: {
      type: String,
      enum: ["", "working_hours", "after_hours"],
      default: "",
    },

    readByUser: {
      type: Boolean,
      default: false,
    },

    readByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

hotelChatMessageSchema.index({ conversationUser: 1, createdAt: 1 });
hotelChatMessageSchema.index({ conversationUser: 1, concernType: 1, createdAt: -1 });
hotelChatMessageSchema.index({ senderRole: 1, readByAdmin: 1, createdAt: -1 });
hotelChatMessageSchema.index({ senderRole: 1, readByUser: 1, createdAt: -1 });

const HotelChatMessage =
  mongoose.models.HotelChatMessage ||
  mongoose.model("HotelChatMessage", hotelChatMessageSchema);

export default HotelChatMessage;

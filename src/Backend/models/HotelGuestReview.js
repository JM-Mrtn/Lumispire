// src/Backend/models/HotelGuestReview.js
import mongoose from "mongoose";

const hotelGuestReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelUser",
      required: true,
      index: true,
    },

    bookingType: {
      type: String,
      enum: ["resort", "event", "hotel_room"],
      required: true,
      index: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    serviceType: {
      type: String,
      trim: true,
      default: "",
    },

    bookingTitle: {
      type: String,
      trim: true,
      default: "",
    },

    bookingDate: {
      type: String,
      trim: true,
      default: "",
    },

    bookingTime: {
      type: String,
      trim: true,
      default: "",
    },

    firstName: {
      type: String,
      trim: true,
      default: "",
    },

    lastName: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    reviewText: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    adminReply: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

hotelGuestReviewSchema.index(
  { userId: 1, bookingType: 1, bookingId: 1 },
  { unique: true }
);

hotelGuestReviewSchema.index({ createdAt: -1 });
hotelGuestReviewSchema.index({ rating: 1 });

const HotelGuestReview =
  mongoose.models.HotelGuestReview ||
  mongoose.model("HotelGuestReview", hotelGuestReviewSchema);

export default HotelGuestReview;
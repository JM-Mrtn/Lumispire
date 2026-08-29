import mongoose from "mongoose";

const hotelCheckInOutSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelUser",
      required: true,
      index: true,
    },
    bookingType: {
      type: String,
      enum: ["resort", "room", "event"],
      default: "resort",
      index: true,
    },
    status: {
      type: String,
      enum: ["NOT_CHECKED_IN", "CHECKED_IN", "CHECKED_OUT"],
      default: "NOT_CHECKED_IN",
      index: true,
    },
    checkInAt: {
      type: Date,
      default: null,
      index: true,
    },
    checkOutAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

hotelCheckInOutSchema.index({ bookingId: 1, userId: 1 }, { unique: true });
hotelCheckInOutSchema.index({ updatedAt: -1 });
hotelCheckInOutSchema.index({ status: 1, updatedAt: -1 });

const HotelCheckInOut =
  mongoose.models.HotelCheckInOut ||
  mongoose.model("HotelCheckInOut", hotelCheckInOutSchema, "checkinandouts");

export default HotelCheckInOut;

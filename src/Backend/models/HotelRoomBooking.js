// src/Backend/models/HotelRoomBooking.js
import mongoose from "mongoose";

const hotelRoomBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelUser",
      required: true,
      index: true,
    },

    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },

    serviceType: {
      type: String,
      default: "Hotel",
      trim: true,
    },

    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelServicePackage",
      default: null,
      index: true,
    },

    packageTitle: {
      type: String,
      trim: true,
      default: "",
    },

    roomType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    date: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    time: {
      type: String,
      required: true,
      trim: true,
    },

    startDateTime: {
      type: Date,
      default: null,
      index: true,
    },

    endDateTime: {
      type: Date,
      default: null,
      index: true,
    },

    pax: {
      type: Number,
      required: true,
      min: 1,
    },

    maxPax: {
      type: Number,
      required: true,
      min: 1,
    },

    baseMaxPax: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAdditionalPax: {
      type: Number,
      default: 20,
      min: 0,
    },

    additionalPax: {
      type: Number,
      default: 0,
      min: 0,
    },

    additionalPaxRate: {
      type: Number,
      default: 250,
      min: 0,
    },

    additionalPaxCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    basePrice: { type: Number, default: 0, min: 0 },
    baseAmount: { type: Number, default: 0, min: 0 },
    seasonalIncreasePercent: { type: Number, default: 0, min: 0 },
    weekendIncreasePercent: { type: Number, default: 0, min: 0 },
    monthlyBookingIncreasePercent: { type: Number, default: 0, min: 0 },
    monthlyConfirmedBookings: { type: Number, default: 0, min: 0 },
    totalIncreasePercent: { type: Number, default: 0, min: 0 },


    paymentMethod: {
      type: String,
      enum: ["BANK TRANSFER", "GCASH"],
      required: true,
    },

    proof: {
      data: { type: Buffer, select: false },
      contentType: { type: String, default: "" },
      filename: { type: String, default: "" },
      size: { type: Number, default: 0 },
      uploadedAt: { type: Date, default: Date.now },
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

hotelRoomBookingSchema.index({ userId: 1, createdAt: -1 });

hotelRoomBookingSchema.index({
  roomType: 1,
  status: 1,
  isActive: 1,
  startDateTime: 1,
  endDateTime: 1,
});

hotelRoomBookingSchema.index({
  roomType: 1,
  date: 1,
  status: 1,
  isActive: 1,
});

const HotelRoomBooking =
  mongoose.models.HotelRoomBooking ||
  mongoose.model("HotelRoomBooking", hotelRoomBookingSchema);

export default HotelRoomBooking;
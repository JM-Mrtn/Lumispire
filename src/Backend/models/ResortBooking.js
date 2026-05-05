// src/Backend/models/ResortBooking.js
import mongoose from "mongoose";

const resortBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelUser",
      required: true,
    },

    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    serviceType: { type: String, default: "Resort & Venue" },

    venue: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },

    slotPeriod: {
      type: String,
      enum: ["DAYTIME", "OVERNIGHT", "FULLDAY"],
      default: "DAYTIME",
      index: true,
    },

    startDateTime: { type: Date, index: true },
    endDateTime: { type: Date, index: true },

    pax: { type: Number, required: true, min: 1 },
    totalGuests: { type: Number, required: true, min: 1 },

    adults: { type: Number, default: 0, min: 0 },
    kids: { type: Number, default: 0, min: 0 },

    price: { type: Number, required: true, min: 0 },

    basePrice: { type: Number, default: 0, min: 0 },
    baseAmount: { type: Number, default: 0, min: 0 },
    baseCapacity: { type: Number, default: 0, min: 0 },
    maxBookablePax: { type: Number, default: 0, min: 0 },
    maxAdditionalPax: { type: Number, default: 20, min: 0 },
    additionalPax: { type: Number, default: 0, min: 0 },
    additionalPaxRate: { type: Number, default: 250, min: 0 },
    additionalPaxCharge: { type: Number, default: 0, min: 0 },
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
      contentType: { type: String },
      filename: { type: String },
      size: { type: Number },
      uploadedAt: { type: Date, default: Date.now },
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

resortBookingSchema.index({
  venue: 1,
  date: 1,
  status: 1,
  isActive: 1,
});

resortBookingSchema.index({
  venue: 1,
  startDateTime: 1,
  endDateTime: 1,
  status: 1,
  isActive: 1,
});

resortBookingSchema.index({ userId: 1, createdAt: -1 });

const ResortBooking =
  mongoose.models.ResortBooking ||
  mongoose.model("ResortBooking", resortBookingSchema);

export default ResortBooking;
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
    additionalPaxRate: { type: Number, default: 500, min: 0 },
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

    paymentTerm: {
      type: String,
      enum: ["DOWN_PAYMENT", "FULL_PAYMENT"],
      default: "FULL_PAYMENT",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PARTIALLY_PAID", "FULLY_PAID"],
      default: "FULLY_PAID",
      index: true,
    },

    amountToPay: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    balanceAmount: { type: Number, default: 0, min: 0 },

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

// Supports admin queries that sort the entire resort booking collection by newest first.
// The userId + createdAt compound index cannot serve a global createdAt-only sort.
resortBookingSchema.index({ createdAt: -1 });

// Lightweight covered index for the Hotel Admin Manage Bookings list.
// Resort documents contain embedded proof.data buffers that can be several MB.
// The admin list only needs these scalar fields, so this index lets MongoDB
// return the list without fetching the large booking document body/proof image.
resortBookingSchema.index(
  {
    _id: -1,
    firstName: 1,
    lastName: 1,
    email: 1,
    phone: 1,
    venue: 1,
    date: 1,
    category: 1,
    time: 1,
    pax: 1,
    totalGuests: 1,
    adults: 1,
    kids: 1,
    price: 1,
    paymentMethod: 1,
    paymentTerm: 1,
    paymentStatus: 1,
    amountToPay: 1,
    paidAmount: 1,
    balanceAmount: 1,
    status: 1,
    isActive: 1,
    createdAt: -1,
  },
  { name: "admin_resort_booking_list_v2" }
);

resortBookingSchema.index({ userId: 1, createdAt: -1 });

const ResortBooking =
  mongoose.models.ResortBooking ||
  mongoose.model("ResortBooking", resortBookingSchema);

export default ResortBooking;
// src/Backend/models/EventBooking.js
import mongoose from "mongoose";

const eventBookingSchema = new mongoose.Schema(
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
      default: "Event Package",
      trim: true,
    },

    packageId: { type: String, trim: true, default: "" },
    eventPackage: { type: String, trim: true, required: true },

    eventDate: { type: String, trim: true, required: true, index: true },
    venue: { type: String, trim: true, required: true, index: true },
    time: { type: String, trim: true, required: true },


    selectedVariantId: {
      type: String,
      trim: true,
      default: "",
    },

    timeVariationLabel: {
      type: String,
      trim: true,
      default: "",
    },

    selectedTimeSlots: {
      type: [String],
      default: [],
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

    // Selected package capacity tier, for example 50 Pax / 80 Pax / 100 Pax.
    basePax: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Maximum capacity of the selected venue, stored for reference/display.
    venueCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Extra pax allowed after the selected package basePax.
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
      default: 500,
      min: 0,
    },

    // Food computation fields. Kept separate from additionalPax fields for clearer display/reporting.
    foodIncludedPax: {
      type: Number,
      default: 0,
      min: 0,
    },

    chargeableFoodPax: {
      type: Number,
      default: 0,
      min: 0,
    },

    foodChargePerExtraPax: {
      type: Number,
      default: 500,
      min: 0,
    },

    foodCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    baseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    additionalPaxCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    eventTheme: { type: String, trim: true, default: "" },
    eventType: { type: String, trim: true, default: "" },
    foodAllergy: { type: String, trim: true, default: "" },
    specialRequest: { type: String, trim: true, default: "" },

    appetizer: { type: String, trim: true, default: "" },
    mainDish: { type: String, trim: true, default: "" },
    dessert: { type: String, trim: true, default: "" },
    drinks: { type: String, trim: true, default: "" },

    paymentMethod: {
      type: String,
      enum: ["BANK TRANSFER", "GCASH"],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
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

eventBookingSchema.index({ userId: 1, createdAt: -1 });
eventBookingSchema.index({ eventDate: 1, venue: 1, status: 1, isActive: 1 });
eventBookingSchema.index({ venue: 1, eventDate: 1, isActive: 1 });
eventBookingSchema.index({ venue: 1, status: 1, isActive: 1, startDateTime: 1, endDateTime: 1 });

const EventBooking =
  mongoose.models.EventBooking ||
  mongoose.model("EventBooking", eventBookingSchema);

export default EventBooking;

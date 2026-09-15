import mongoose from "mongoose";

const HotelBlockedDateSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },

    // New package-specific blocking fields.
    serviceType: {
      type: String,
      enum: ["resort_venue", "event_package", "hotel_condo", ""],
      default: "",
      index: true,
    },
    packageId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    packageTitle: {
      type: String,
      trim: true,
      default: "",
      maxlength: 160,
    },

    // Exact package time slot to block. ALL_DAY keeps the existing full-day
    // maintenance behavior, while a configured package slot only blocks the
    // overlapping morning/afternoon/night interval.
    timeSlot: {
      type: String,
      trim: true,
      default: "ALL_DAY",
      maxlength: 180,
      index: true,
    },

    // Kept only for compatibility with blocked dates created by the older
    // all-service / venue / hotel-room implementation.
    scope: {
      type: String,
      enum: ["", "ALL", "VENUE", "HOTEL_ROOM"],
      default: "",
      index: true,
    },

    reason: {
      type: String,
      enum: ["WALK_IN", "MAINTENANCE", "PRIVATE_EVENT", "OTHER"],
      default: "OTHER",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    createdBy: {
      type: String,
      trim: true,
      default: "Hotel Admin",
    },
  },
  { timestamps: true }
);

// This is intentionally non-unique. The controller prevents duplicate
// package/date combinations, while still allowing different packages to be
// disabled on the same date.
HotelBlockedDateSchema.index({ date: 1, serviceType: 1, packageId: 1, timeSlot: 1 });
HotelBlockedDateSchema.index({ date: 1, serviceType: 1, createdAt: -1 });

const HotelBlockedDate =
  mongoose.models.HotelBlockedDate ||
  mongoose.model("HotelBlockedDate", HotelBlockedDateSchema);

export default HotelBlockedDate;

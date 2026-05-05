import mongoose from "mongoose";

const packageVariantSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      required: true,
      maxlength: 80,
    },

    // Used by Event Package variations. Example: 50, 80, 100 pax.
    // Optional so Resort/Hotel time-based variations stay compatible.
    pax: {
      type: Number,
      default: 0,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    timeSlots: {
      type: [String],
      default: [],
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const packageImageSchema = new mongoose.Schema(
  {
    data: {
      type: Buffer,
      default: null,
      select: false,
    },
    contentType: {
      type: String,
      default: "",
    },
    filename: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: 0,
    },
    uploadedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const hotelServicePackageSchema = new mongoose.Schema(
  {
    seedKey: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["resort_venue", "hotel_condo", "event_package"],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    subtitle: {
      type: String,
      trim: true,
      default: "",
      maxlength: 180,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1500,
    },

    duration: {
      type: String,
      trim: true,
      default: "",
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    variants: {
      type: [packageVariantSchema],
      default: [],
    },

    capacity: {
      type: String,
      trim: true,
      default: "",
    },

    // Admin-selected venues where an Event Package can be booked.
    // Used only when type === "event_package".
    availableVenues: {
      type: [String],
      default: [],
    },

    inclusions: {
      type: [String],
      default: [],
    },

    // Response/display image source used by the frontend.
    // Admin no longer types this manually; backend generates it from uploaded packageImage.
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // Uploaded package image stored directly in MongoDB.
    packageImage: {
      type: packageImageSchema,
      default: () => ({}),
    },

    displayOrder: {
      type: Number,
      default: 0,
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

hotelServicePackageSchema.index({
  type: 1,
  isActive: 1,
  displayOrder: 1,
  createdAt: -1,
});

const HotelServicePackage =
  mongoose.models.HotelServicePackage ||
  mongoose.model("HotelServicePackage", hotelServicePackageSchema);

export default HotelServicePackage;

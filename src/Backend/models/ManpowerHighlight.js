import mongoose from "mongoose";

const fileRefSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    originalName: {
      type: String,
      default: "",
    },
    filename: {
      type: String,
      default: "",
    },
    mimetype: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const manpowerHighlightSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 240,
    },
    image: {
      type: fileRefSchema,
      default: () => ({}),
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    createdBy: {
      type: String,
      default: "admin",
      trim: true,
    },
    updatedBy: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

manpowerHighlightSchema.index({ active: 1, sortOrder: 1, createdAt: -1 });

export default mongoose.model("ManpowerHighlight", manpowerHighlightSchema);
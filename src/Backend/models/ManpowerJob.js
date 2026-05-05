import mongoose from "mongoose";

const manpowerJobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    qualifications: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: String,
      default: "admin",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ManpowerJob", manpowerJobSchema);
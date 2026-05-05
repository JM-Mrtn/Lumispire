import mongoose from "mongoose";

const manpowerLeaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManpowerEmployee",
      required: true,
      index: true,
    },

    vacancy: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    leaveType: {
      type: String,
      required: true,
      enum: [
        "Vacation Leave",
        "Sick Leave",
        "Emergency Leave",
        "Maternity Leave",
        "Paternity Leave",
        "Bereavement Leave",
        "Other",
      ],
      index: true,
    },

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    totalDays: {
      type: Number,
      default: 1,
      min: 1,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    hrRemarks: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    reviewedBy: {
      type: String,
      default: "",
      trim: true,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

manpowerLeaveSchema.index({ employeeId: 1, createdAt: -1 });

export default mongoose.model("ManpowerLeave", manpowerLeaveSchema);
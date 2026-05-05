import mongoose from "mongoose";

const traineeRfidLogSchema = new mongoose.Schema(
  {
    traineeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TraineeUser",
      default: null,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingRfidSession",
      default: null,
      index: true,
    },
    uid: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    traineeName: {
      type: String,
      trim: true,
      default: "",
    },
    course: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    attendanceDate: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    action: {
      type: String,
      enum: ["time_in", "time_out"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "success",
        "unknown_card",
        "inactive_trainee",
        "no_open_session",
        "cooldown_active",
      ],
      default: "success",
      index: true,
    },
    station: {
      type: String,
      trim: true,
      default: "Training RFID Station",
    },
    cooldownUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

traineeRfidLogSchema.index({ sessionId: 1, createdAt: -1 });
traineeRfidLogSchema.index({ course: 1, attendanceDate: 1, createdAt: -1 });
traineeRfidLogSchema.index({ traineeId: 1, attendanceDate: 1, createdAt: -1 });

const TraineeRfidLog =
  mongoose.models.TraineeRfidLog ||
  mongoose.model("TraineeRfidLog", traineeRfidLogSchema);

export default TraineeRfidLog;
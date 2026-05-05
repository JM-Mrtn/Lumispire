import mongoose from "mongoose";

const trainingRfidSessionSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    attendanceDate: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    station: {
      type: String,
      default: "Housekeeping RFID Station",
      trim: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
      index: true,
    },
    openedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    openedByProfessorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfessorUser",
      default: null,
    },
    openedByProfessorName: {
      type: String,
      default: "",
      trim: true,
    },
    openedByProfessorEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    closedByProfessorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfessorUser",
      default: null,
    },
    closedByProfessorName: {
      type: String,
      default: "",
      trim: true,
    },
    closedByProfessorEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

trainingRfidSessionSchema.index(
  { course: 1, isOpen: 1 },
  {
    unique: true,
    partialFilterExpression: { isOpen: true },
    name: "uniq_open_rfid_session_per_course",
  }
);

const TrainingRfidSession =
  mongoose.models.TrainingRfidSession ||
  mongoose.model("TrainingRfidSession", trainingRfidSessionSchema);

export default TrainingRfidSession;
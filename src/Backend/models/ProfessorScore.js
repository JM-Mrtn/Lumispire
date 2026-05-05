import mongoose from "mongoose";

const professorScoreSchema = new mongoose.Schema(
  {
    traineeUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TraineeUser",
      required: true,
      index: true,
    },
    traineeName: {
      type: String,
      required: true,
      trim: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfessorAssessment",
      required: true,
      index: true,
    },
    assessmentTitle: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPoints: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    gradedByName: {
      type: String,
      default: "",
      trim: true,
    },
    gradedByEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

professorScoreSchema.index(
  { traineeUserId: 1, assessmentId: 1 },
  { unique: true }
);

const ProfessorScore = mongoose.model("ProfessorScore", professorScoreSchema);

export default ProfessorScore;

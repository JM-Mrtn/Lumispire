import mongoose from "mongoose";

const pretestQuestionSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length >= 2;
        },
        message: "Each pre-test question must have at least 2 options.",
      },
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
    },
    points: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: true }
);

const trainingPretestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    courseKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    passingScorePercent: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    questions: {
      type: [pretestQuestionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

trainingPretestSchema.index({ courseKey: 1, active: 1 });

const TrainingPretest = mongoose.model("TrainingPretest", trainingPretestSchema);

export default TrainingPretest;

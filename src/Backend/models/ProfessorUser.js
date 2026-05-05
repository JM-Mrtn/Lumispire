import mongoose from "mongoose";

const professorUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      default: "professor",
      enum: ["professor"],
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    courseAssignments: {
      type: [String],
      default: [],
    },
    accountSource: {
      type: String,
      enum: ["manual", "env_fixed"],
      default: "manual",
      index: true,
    },
    envAccountKey: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
  },
  { timestamps: true }
);

professorUserSchema.index(
  { envAccountKey: 1 },
  {
    unique: true,
    sparse: true,
    name: "uniq_professor_env_account_key",
  }
);

const ProfessorUser =
  mongoose.models.ProfessorUser ||
  mongoose.model("ProfessorUser", professorUserSchema);

export default ProfessorUser;
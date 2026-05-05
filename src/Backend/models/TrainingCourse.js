import mongoose from "mongoose";

const roadmapExamQuestionSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      default: "",
      trim: true,
    },
    options: {
      type: [String],
      default: [],
    },
    answer: {
      type: String,
      default: "",
      trim: true,
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
  },
  { _id: true }
);

const roadmapCompetencyItemSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    studyPoints: {
      type: [String],
      default: [],
    },
    studyModuleOverview: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },
    learningObjectives: {
      type: [String],
      default: [],
    },
    lessonDiscussion: {
      type: [String],
      default: [],
    },
    stepByStepProcedure: {
      type: [String],
      default: [],
    },
    workplaceScenario: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },
    practiceActivity: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },
    keyTerms: {
      type: [String],
      default: [],
    },
    readinessChecklist: {
      type: [String],
      default: [],
    },
    examQuestions: {
      type: [roadmapExamQuestionSchema],
      default: [],
    },
    sequence: {
      type: Number,
      default: 1,
      min: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const roadmapCompetencyGroupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sequence: {
      type: Number,
      default: 1,
      min: 1,
    },
    items: {
      type: [roadmapCompetencyItemSchema],
      default: [],
    },
  },
  { _id: true }
);

const progressWeightsSchema = new mongoose.Schema(
  {
    online: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    faceToFace: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    competencies: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    pretest: {
      type: Number,
      default: 30,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const trainingCourseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    certificatePreviewImage: {
      type: String,
      default: "",
      trim: true,
    },
    requiredOnlineClasses: {
      type: Number,
      default: 0,
      min: 0,
    },
    requiredFaceToFaceClasses: {
      type: Number,
      default: 0,
      min: 0,
    },
    onlineAttendanceBasis: {
      type: String,
      default: "verified_professor_attendance",
      trim: true,
    },
    faceToFaceAttendanceBasis: {
      type: String,
      default: "none",
      trim: true,
    },
    progressWeights: {
      type: progressWeightsSchema,
      default: () => ({
        online: 0,
        faceToFace: 0,
        competencies: 70,
        pretest: 30,
      }),
    },
    competencyGroups: {
      type: [roadmapCompetencyGroupSchema],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    professorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfessorUser",
      default: null,
      index: true,
    },
    professorUsername: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    professorEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    createdByAdminId: {
      type: String,
      default: "",
      trim: true,
    },
    createdByAdminName: {
      type: String,
      default: "Training Admin",
      trim: true,
    },
  },
  { timestamps: true }
);

trainingCourseSchema.index({ active: 1, name: 1 });

const TrainingCourse =
  mongoose.models.TrainingCourse ||
  mongoose.model("TrainingCourse", trainingCourseSchema);

export default TrainingCourse;

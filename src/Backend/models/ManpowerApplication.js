import mongoose from "mongoose";

const NAME_REGEX = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,49}$/;
const OPTIONAL_NAME_REGEX = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,49}$/;
const CONTACT_REGEX = /^\d{11}$/;
const SSS_REGEX = /^\d{10}$/;
const TIN_REGEX = /^(\d{9}|\d{12})$/;
const PAGIBIG_REGEX = /^\d{12}$/;
const PHILHEALTH_REGEX = /^\d{12}$/;
const BIRTHPLACE_REGEX = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s,.'-]{1,99}$/;
const RELIGION_REGEX = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,59}$/;
const NATIONALITY_REGEX = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,59}$/;

const fileRefSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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

const idVerificationSchema = new mongoose.Schema(
  {
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManpowerIdScreening",
      default: null,
    },
    screeningStatus: {
      type: String,
      enum: ["unreadable", "suspicious", "needs_manual_review", "likely_valid"],
      default: "needs_manual_review",
    },
    reviewDecision: {
      type: String,
      enum: ["auto_approved", "manual_review", "auto_rejected"],
      default: "manual_review",
    },
    confidenceScore: {
      type: Number,
      default: 0,
    },
    matchedKeywords: {
      type: [String],
      default: [],
    },
    reasons: {
      type: [String],
      default: [],
    },

    aiConnected: {
      type: Boolean,
      default: false,
    },
    aiConnectionStatus: {
      type: String,
      enum: [
        "not_checked",
        "connected",
        "missing_key",
        "not_supported",
        "error",
      ],
      default: "not_checked",
    },
    aiProvider: {
      type: String,
      default: "none",
      trim: true,
    },
    aiModel: {
      type: String,
      default: "",
      trim: true,
    },
    aiCheckedAt: {
      type: Date,
      default: null,
    },
    aiSummary: {
      type: String,
      default: "",
      trim: true,
    },
    aiDocumentType: {
      type: String,
      default: "unknown",
      trim: true,
    },
    aiRiskLevel: {
      type: String,
      enum: ["low", "medium", "high", "unknown"],
      default: "unknown",
    },
    aiDecision: {
      type: String,
      enum: ["approve", "needs_manual_review", "reject"],
      default: "needs_manual_review",
    },
    aiError: {
      type: String,
      default: "",
      trim: true,
    },

    checkedAt: {
      type: Date,
      default: null,
    },
    reviewedByAdmin: {
      type: Boolean,
      default: false,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewRemarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const assessmentAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      default: "",
      trim: true,
    },
    questionText: {
      type: String,
      default: "",
      trim: true,
    },
    questionType: {
      type: String,
      default: "",
      trim: true,
    },
    applicantAnswer: {
      type: String,
      default: "",
      trim: true,
    },
    correctAnswer: {
      type: String,
      default: "",
      trim: true,
    },
    expectedAnswer: {
      type: String,
      default: "",
      trim: true,
    },
    maxPoints: {
      type: Number,
      default: 0,
    },
    earnedPoints: {
      type: Number,
      default: 0,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    aiEvaluated: {
      type: Boolean,
      default: false,
    },
    feedback: {
      type: String,
      default: "",
      trim: true,
    },
    matchedCriteria: {
      type: [String],
      default: [],
    },
    missingCriteria: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
      index: true,
    },
    examId: {
      type: String,
      default: "",
      trim: true,
    },
    examTitle: {
      type: String,
      default: "",
      trim: true,
    },
    vacancy: {
      type: String,
      default: "",
      trim: true,
    },
    passingScore: {
      type: Number,
      default: 70,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    answers: {
      type: [assessmentAnswerSchema],
      default: [],
    },
  },
  { _id: false }
);

const manpowerApplicationSchema = new mongoose.Schema(
  {
    vacancy: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => NAME_REGEX.test(String(value || "").trim()),
        message:
          "First name must contain letters only and must not include numbers.",
      },
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => NAME_REGEX.test(String(value || "").trim()),
        message:
          "Last name must contain letters only and must not include numbers.",
      },
    },

    middleName: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (value) => {
          const trimmed = String(value || "").trim();
          if (!trimmed) return true;
          return OPTIONAL_NAME_REGEX.test(trimmed);
        },
        message:
          "Middle name must contain letters only and must not include numbers.",
      },
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    completeAddress: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },

    contactNo: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => CONTACT_REGEX.test(String(value || "").trim()),
        message: "Contact number must contain exactly 11 digits.",
      },
    },

    age: {
      type: Number,
      required: true,
      min: 18,
      max: 60,
    },

    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Prefer not to say"],
    },

    sssNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => SSS_REGEX.test(String(value || "").trim()),
        message: "SSS number must contain exactly 10 digits.",
      },
    },

    tinNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => TIN_REGEX.test(String(value || "").trim()),
        message: "TIN number must contain 9 or 12 digits.",
      },
    },

    pagibigNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => PAGIBIG_REGEX.test(String(value || "").trim()),
        message: "Pag-IBIG number must contain exactly 12 digits.",
      },
    },

    philhealthNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => PHILHEALTH_REGEX.test(String(value || "").trim()),
        message: "PhilHealth number must contain exactly 12 digits.",
      },
    },

    birthPlace: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => BIRTHPLACE_REGEX.test(String(value || "").trim()),
        message:
          "Birthplace must contain letters only and valid punctuation only.",
      },
    },

    civilStatus: {
      type: String,
      required: true,
      enum: ["Single", "Married", "Widowed", "Divorced", "Separated", "Annulled"],
    },

    religion: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => RELIGION_REGEX.test(String(value || "").trim()),
        message:
          "Religion must contain letters only and must not include numbers.",
      },
    },

    nationality: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => NATIONALITY_REGEX.test(String(value || "").trim()),
        message:
          "Nationality must contain letters only and must not include numbers.",
      },
    },

    idType: {
      type: String,
      default: "",
      trim: true,
    },

    idVerificationStatus: {
      type: String,
      enum: ["not_submitted", "pending", "verified", "rejected"],
      default: "not_submitted",
      index: true,
    },

    isIdentityVerified: {
      type: Boolean,
      default: false,
    },

    idVerifiedAt: {
      type: Date,
      default: null,
    },

    idVerificationRemarks: {
      type: String,
      default: "",
      trim: true,
    },

    idVerification: {
      type: idVerificationSchema,
      default: () => ({}),
    },

    assessment: {
      type: assessmentSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "FOR_REVIEW",
        "INTERVIEW_SCHEDULED",
        "INTERVIEWED",
        "HIRED",
        "REJECTED",
      ],
      default: "PENDING",
      index: true,
    },

    hrNotes: {
      type: String,
      default: "",
      trim: true,
    },

    interview: {
      scheduledAt: {
        type: Date,
        default: null,
      },
      location: {
        type: String,
        default: "",
        trim: true,
      },
      interviewer: {
        type: String,
        default: "",
        trim: true,
      },
      remarks: {
        type: String,
        default: "",
        trim: true,
      },
      emailSentAt: {
        type: Date,
        default: null,
      },
    },

    hiredAt: {
      type: Date,
      default: null,
    },

    hiredFor: {
      type: String,
      default: "",
      trim: true,
    },

    hiredEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManpowerEmployee",
      default: null,
    },

    requirements: {
      validId: fileRefSchema,
      nbi: fileRefSchema,
      barangayClearance: fileRefSchema,
      sss: fileRefSchema,
      philhealth: fileRefSchema,
      pagibig: fileRefSchema,
      tin: fileRefSchema,
      transcriptOfRecords: fileRefSchema,
      diploma: fileRefSchema,
      birthCertificate: fileRefSchema,
      photo1x1: fileRefSchema,
      photo2x2: fileRefSchema,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ManpowerApplication", manpowerApplicationSchema);
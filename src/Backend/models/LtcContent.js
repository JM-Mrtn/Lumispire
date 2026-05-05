import mongoose from "mongoose";

const companyValueSchema = new mongoose.Schema(
  {
    letter: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, required: true },
    body: { type: String, trim: true, default: "" },
  },
  { _id: true }
);

const timelineSchema = new mongoose.Schema(
  {
    date: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, required: true },
    body: { type: String, trim: true, default: "" },
    side: { type: String, enum: ["left", "right"], default: "right" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true, timestamps: true }
);

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    body: { type: String, trim: true, default: "" },
    footer: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true, timestamps: true }
);

const highlightSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    subtitle: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "General" },
    image: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true, timestamps: true }
);

const teamSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, trim: true, default: "" },
    body: [{ type: String, trim: true }],
  },
  { _id: true }
);

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    role: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    avatar: { type: String, trim: true, default: "" },
    education: { type: String, trim: true, default: "" },
    practiceAreas: { type: String, trim: true, default: "" },
    affiliations: [{ type: String, trim: true }],
    sections: [teamSectionSchema],
    isFounder: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true, timestamps: true }
);

const ltcContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      default: "main",
      immutable: true,
    },
    company: {
      name: { type: String, trim: true, default: "LTC Group of Companies" },
      shortName: { type: String, trim: true, default: "LTC" },
      tagline: {
        type: String,
        trim: true,
        default:
          "Training, assessment, manpower, hotel and restaurant services for professional business needs.",
      },
      heroTitle: {
        type: String,
        trim: true,
        default: "We Specialize in Training, Assessment, Manpower & Hotel & Restaurant Services",
      },
      heroSubtitle: {
        type: String,
        trim: true,
        default: "Delivering excellence and professional solutions for your business needs",
      },
      logoUrl: { type: String, trim: true, default: "/LTCLogo.jpg" },
      bannerUrl: { type: String, trim: true, default: "/LTCBanner.png" },
      aboutTitle: { type: String, trim: true, default: "About LTC Group of Companies" },
      aboutBody: {
        type: String,
        trim: true,
        default:
          "LTC Group of Companies provides reliable support across training, assessment, manpower, hotel, resort, and restaurant services.",
      },
      contactEmail: { type: String, trim: true, default: "" },
      contactPhone: { type: String, trim: true, default: "" },
      address: { type: String, trim: true, default: "" },
      values: [companyValueSchema],
    },
    timeline: [timelineSchema],
    achievements: [achievementSchema],
    highlights: [highlightSchema],
    teamMembers: [teamMemberSchema],
    updatedBy: { type: String, trim: true, default: "ltc-admin" },
  },
  { timestamps: true }
);

ltcContentSchema.index({ key: 1 }, { unique: true });

const LtcContent =
  mongoose.models.LtcContent || mongoose.model("LtcContent", ltcContentSchema);

export default LtcContent;

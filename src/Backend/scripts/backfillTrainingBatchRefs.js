import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import ProfessorAssessment from "../models/ProfessorAssessment.js";
import TrainingModule from "../models/TrainingModule.js";
import TrainingBatch from "../models/TrainingBatch.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

function normalizeCourseName(value = "") {
  const clean = String(value || "").trim().toLowerCase();

  if (clean === "housekeeping") return "Housekeeping";
  if (clean === "event management") return "Event Management";

  return String(value || "").trim();
}

function hasValidObjectId(value) {
  if (!value) return false;
  return mongoose.Types.ObjectId.isValid(String(value));
}

async function findNearestBatch(course = "", createdAt = null) {
  const normalizedCourse = normalizeCourseName(course);
  if (!normalizedCourse) return null;

  return TrainingBatch.findOne({
    course: normalizedCourse,
    createdAt: { $lte: createdAt || new Date() },
  }).sort({ createdAt: -1 });
}

async function backfillAssessments() {
  const rows = await ProfessorAssessment.find({});
  let updated = 0;
  let skipped = 0;
  let noBatchFound = 0;

  for (const row of rows) {
    if (hasValidObjectId(row.batchId)) {
      skipped += 1;
      continue;
    }

    const batch = await findNearestBatch(row.course, row.createdAt);
    if (!batch) {
      noBatchFound += 1;
      continue;
    }

    row.batchId = batch._id;
    row.batchCode = batch.batchCode || "";
    row.batchName = batch.batchName || "";
    await row.save();

    updated += 1;
  }

  console.log(
    `Assessments updated: ${updated}, skipped: ${skipped}, no batch found: ${noBatchFound}`
  );
}

async function backfillModules() {
  const rows = await TrainingModule.find({});
  let updated = 0;
  let skipped = 0;
  let noBatchFound = 0;

  for (const row of rows) {
    if (hasValidObjectId(row.batchId)) {
      skipped += 1;
      continue;
    }

    const batch = await findNearestBatch(row.course, row.createdAt);
    if (!batch) {
      noBatchFound += 1;
      continue;
    }

    row.batchId = batch._id;
    row.batchCode = batch.batchCode || "";
    row.batchName = batch.batchName || "";
    await row.save();

    updated += 1;
  }

  console.log(
    `Modules updated: ${updated}, skipped: ${skipped}, no batch found: ${noBatchFound}`
  );
}

async function run() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await backfillAssessments();
    await backfillModules();

    console.log("Backfill completed successfully");
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (closeError) {
      console.error("Failed to close MongoDB connection:", closeError);
    }
  }
}

run();
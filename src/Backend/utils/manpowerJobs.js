import ManpowerJob from "../models/ManpowerJob.js";
import { DEFAULT_MANPOWER_JOBS } from "./manpowerConstants.js";

export function cleanJobTitle(value = "") {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(value = "") {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function seedDefaultManpowerJobs() {
  for (const job of DEFAULT_MANPOWER_JOBS) {
    const title = cleanJobTitle(job.title);
    if (!title) continue;

    const existing = await ManpowerJob.findOne({
      title: new RegExp(`^${escapeRegex(title)}$`, "i"),
    }).lean();

    if (existing) continue;

    await ManpowerJob.create({
      title,
      description: "",
      qualifications: [],
      active: true,
      createdBy: "system-seed",
    });
  }
}

export async function getActiveManpowerJobs() {
  return ManpowerJob.find({ active: true }).sort({ title: 1 }).lean();
}

export async function findActiveManpowerJobByTitle(title = "") {
  const clean = cleanJobTitle(title);

  if (!clean) return null;

  return ManpowerJob.findOne({
    title: new RegExp(`^${escapeRegex(clean)}$`, "i"),
    active: true,
  }).lean();
}
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

import TrainingCourse from "../models/TrainingCourse.js";
import ProfessorUser from "../models/ProfessorUser.js";
import TrainingBatch from "../models/TrainingBatch.js";
import EnrollmentRequest from "../models/EnrollmentRequest.js";
import TraineeUser from "../models/TraineeUser.js";
import { buildDefaultRoadmapForCourse } from "../utils/trainingRoadmapService.js";

function clean(value = "") {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeCourseName(value = "") {
  return clean(value);
}

function slugify(value = "") {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "course";
}

function sanitizeNamePart(value = "") {
  return slugify(value).replace(/-/g, "");
}

function generateTemporaryPassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
}

async function makeUniqueProfessorIdentity(courseName = "") {
  const base = sanitizeNamePart(courseName) || "course";
  let username = `${base}.professor`;
  let email = `${base}.professor@tamsi.com`;
  let counter = 1;

  while (await ProfessorUser.findOne({ $or: [{ username }, { email }] }).lean()) {
    counter += 1;
    username = `${base}.professor${counter}`;
    email = `${base}.professor${counter}@tamsi.com`;
  }

  return { username, email };
}

function splitCourseDisplayName(courseName = "") {
  const words = clean(courseName).split(" ").filter(Boolean);
  if (!words.length) return { firstName: "Course", lastName: "Professor" };
  if (words.length === 1) return { firstName: words[0], lastName: "Professor" };
  return {
    firstName: words.slice(0, -1).join(" "),
    lastName: `${words.at(-1)} Professor`,
  };
}

function sanitizeProfessor(professor) {
  if (!professor) return null;
  return {
    _id: professor._id,
    firstName: professor.firstName || "",
    lastName: professor.lastName || "",
    username: professor.username || "",
    email: professor.email || "",
    role: professor.role || "professor",
    active: professor.active !== false,
    mustChangePassword: Boolean(professor.mustChangePassword),
    courseAssignments: Array.isArray(professor.courseAssignments)
      ? professor.courseAssignments
      : [],
    accountSource: professor.accountSource || "manual",
    envAccountKey: professor.envAccountKey || "",
    createdAt: professor.createdAt,
    updatedAt: professor.updatedAt,
  };
}

function mapCourse(course, professor = null, stats = {}) {
  return {
    _id: course?._id,
    name: course?.name || "",
    slug: course?.slug || "",
    description: course?.description || "",
    imageUrl: course?.imageUrl || "",
    active: course?.active !== false,
    professorUserId: course?.professorUserId || null,
    professorUsername: course?.professorUsername || "",
    professorEmail: course?.professorEmail || "",
    professor: sanitizeProfessor(professor || course?.professorUserId || null),
    batchCount: Number(stats.batchCount || 0),
    enrollmentCount: Number(stats.enrollmentCount || 0),
    traineeCount: Number(stats.traineeCount || 0),
    createdAt: course?.createdAt || null,
    updatedAt: course?.updatedAt || null,
  };
}

async function attachCourseStats(course) {
  const [batchCount, enrollmentCount, traineeCount] = await Promise.all([
    TrainingBatch.countDocuments({ course: course.name }),
    EnrollmentRequest.countDocuments({ course: course.name }),
    TraineeUser.countDocuments({ course: course.name }),
  ]);

  return { batchCount, enrollmentCount, traineeCount };
}

async function createProfessorForCourse(courseName, override = {}) {
  const { username, email } = await makeUniqueProfessorIdentity(courseName);
  const tempPassword = clean(override.password) || generateTemporaryPassword(12);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
  const splitName = splitCourseDisplayName(courseName);

  const professor = await ProfessorUser.create({
    firstName: clean(override.firstName) || splitName.firstName,
    lastName: clean(override.lastName) || splitName.lastName,
    username: clean(override.username).toLowerCase() || username,
    email: clean(override.email).toLowerCase() || email,
    password: hashedPassword,
    role: "professor",
    active: true,
    mustChangePassword: true,
    courseAssignments: [courseName],
    accountSource: "manual",
    envAccountKey: "",
  });

  return { professor, tempPassword };
}

export async function listPublicTrainingCourses(_req, res) {
  try {
    const courses = await TrainingCourse.find({ active: true })
      .sort({ name: 1 })
      .populate("professorUserId", "firstName lastName username email active courseAssignments accountSource")
      .lean();

    return res.status(200).json({
      success: true,
      courses: courses.map((course) => mapCourse(course, course.professorUserId)),
    });
  } catch (error) {
    console.error("listPublicTrainingCourses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load courses.",
    });
  }
}

export async function listAdminCourses(_req, res) {
  try {
    const courses = await TrainingCourse.find({})
      .sort({ active: -1, name: 1 })
      .populate("professorUserId", "firstName lastName username email active courseAssignments accountSource envAccountKey mustChangePassword")
      .lean();

    const mapped = await Promise.all(
      courses.map(async (course) => {
        const stats = await attachCourseStats(course);
        return mapCourse(course, course.professorUserId, stats);
      })
    );

    return res.status(200).json({ success: true, courses: mapped });
  } catch (error) {
    console.error("listAdminCourses error:", error);
    return res.status(500).json({ success: false, message: "Failed to load courses." });
  }
}

export async function createAdminCourse(req, res) {
  let createdProfessor = null;

  try {
    const name = normalizeCourseName(req.body?.name);
    const description = clean(req.body?.description);
    const imageUrl = clean(req.body?.imageUrl);

    if (!name) {
      return res.status(400).json({ success: false, message: "Course name is required." });
    }

    const slug = slugify(name);
    const existing = await TrainingCourse.findOne({
      $or: [{ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }, { slug }],
    }).lean();

    if (existing) {
      return res.status(409).json({ success: false, message: "This course already exists." });
    }

    const professorResult = await createProfessorForCourse(name, req.body?.professor || {});
    createdProfessor = professorResult.professor;
    const defaultRoadmap = buildDefaultRoadmapForCourse(name);

    const course = await TrainingCourse.create({
      name,
      slug,
      description,
      imageUrl,
      certificatePreviewImage: defaultRoadmap.certificatePreviewImage || "",
      requiredOnlineClasses: defaultRoadmap.requiredOnlineClasses,
      requiredFaceToFaceClasses: defaultRoadmap.requiredFaceToFaceClasses,
      onlineAttendanceBasis: defaultRoadmap.onlineAttendanceBasis,
      faceToFaceAttendanceBasis: defaultRoadmap.faceToFaceAttendanceBasis,
      progressWeights: defaultRoadmap.progressWeights,
      competencyGroups: defaultRoadmap.competencyGroups,
      active: true,
      professorUserId: createdProfessor._id,
      professorUsername: createdProfessor.username,
      professorEmail: createdProfessor.email,
      createdByAdminId: req.trainingAdmin?.id || "training-admin",
      createdByAdminName: req.trainingAdmin?.username || "Training Admin",
    });

    return res.status(201).json({
      success: true,
      message: "Course and professor account created successfully.",
      course: mapCourse(course, createdProfessor),
      professor: sanitizeProfessor(createdProfessor),
      professorCredentials: {
        username: createdProfessor.username,
        email: createdProfessor.email,
        temporaryPassword: professorResult.tempPassword,
      },
    });
  } catch (error) {
    if (createdProfessor?._id) {
      await ProfessorUser.findByIdAndDelete(createdProfessor._id).catch(() => null);
    }

    console.error("createAdminCourse error:", error);

    if (Number(error?.code || 0) === 11000) {
      return res.status(409).json({ success: false, message: "Course or professor account already exists." });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create course.",
    });
  }
}

export async function updateAdminCourse(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid course id." });
    }

    const course = await TrainingCourse.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const oldName = course.name;
    const nextName = normalizeCourseName(req.body?.name || course.name);
    const nextSlug = slugify(nextName);

    if (!nextName) {
      return res.status(400).json({ success: false, message: "Course name is required." });
    }

    const duplicate = await TrainingCourse.findOne({
      _id: { $ne: course._id },
      $or: [{ name: new RegExp(`^${nextName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }, { slug: nextSlug }],
    }).lean();

    if (duplicate) {
      return res.status(409).json({ success: false, message: "Another course already uses this name." });
    }

    course.name = nextName;
    course.slug = nextSlug;
    course.description = clean(req.body?.description);
    course.imageUrl = clean(req.body?.imageUrl);
    course.active = req.body?.active === undefined ? course.active !== false : Boolean(req.body.active);

    await course.save();

    if (oldName !== nextName) {
      await Promise.all([
        TrainingBatch.updateMany({ course: oldName }, { $set: { course: nextName } }),
        EnrollmentRequest.updateMany({ course: oldName }, { $set: { course: nextName } }),
        TraineeUser.updateMany({ course: oldName }, { $set: { course: nextName } }),
        ProfessorUser.updateMany(
          { courseAssignments: oldName },
          { $set: { "courseAssignments.$": nextName } }
        ),
      ]);
    }

    const professor = course.professorUserId
      ? await ProfessorUser.findById(course.professorUserId)
      : null;

    if (professor) {
      professor.courseAssignments = [nextName];
      professor.active = course.active !== false;
      await professor.save();
      course.professorUsername = professor.username || course.professorUsername;
      course.professorEmail = professor.email || course.professorEmail;
      await course.save();
    }

    const stats = await attachCourseStats(course);

    return res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      course: mapCourse(course, professor, stats),
    });
  } catch (error) {
    console.error("updateAdminCourse error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update course.",
    });
  }
}

export async function deleteAdminCourse(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid course id." });
    }

    const course = await TrainingCourse.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const [batchCount, enrollmentCount, traineeCount] = await Promise.all([
      TrainingBatch.countDocuments({ course: course.name }),
      EnrollmentRequest.countDocuments({ course: course.name }),
      TraineeUser.countDocuments({ course: course.name }),
    ]);

    if (batchCount || enrollmentCount || traineeCount) {
      course.active = false;
      await course.save();

      if (course.professorUserId) {
        await ProfessorUser.findByIdAndUpdate(course.professorUserId, {
          $set: { active: false },
        }).catch(() => null);
      }

      return res.status(200).json({
        success: true,
        message:
          "Course has existing records, so it was deactivated instead of permanently deleted.",
        course: mapCourse(course, null, { batchCount, enrollmentCount, traineeCount }),
      });
    }

    if (course.professorUserId) {
      await ProfessorUser.findByIdAndDelete(course.professorUserId).catch(() => null);
    }

    await course.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Course and its unused professor account deleted successfully.",
    });
  } catch (error) {
    console.error("deleteAdminCourse error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete course." });
  }
}

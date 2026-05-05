import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

import ProfessorUser from "../models/ProfessorUser.js";
import TrainingCourse from "../models/TrainingCourse.js";

function clean(value = "") {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeCourseName(value = "") {
  return clean(value);
}

function sanitizeProfessor(professor) {
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

function generateTemporaryPassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
}

function normalizeCourseAssignments(values = []) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((item) => normalizeCourseName(item))
        .filter(Boolean)
    ),
  ];
}

async function validateCoursesExist(courseAssignments = []) {
  if (!courseAssignments.length) return [];

  const courses = await TrainingCourse.find({
    name: { $in: courseAssignments },
    active: true,
  }).select("name").lean();

  const allowed = new Set(courses.map((course) => course.name));
  return courseAssignments.filter((course) => allowed.has(course));
}

export async function listAdminProfessors(_req, res) {
  try {
    const professors = await ProfessorUser.find({})
      .sort({ active: -1, createdAt: -1, lastName: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      professors: professors.map(sanitizeProfessor),
    });
  } catch (error) {
    console.error("listAdminProfessors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load professors.",
    });
  }
}

export async function createAdminProfessor(req, res) {
  try {
    const firstName = clean(req.body?.firstName);
    const lastName = clean(req.body?.lastName);
    const username = clean(req.body?.username).toLowerCase();
    const email = clean(req.body?.email).toLowerCase();
    const password = clean(req.body?.password) || generateTemporaryPassword(12);
    const courseAssignments = normalizeCourseAssignments(req.body?.courseAssignments);
    const validCourseAssignments = await validateCoursesExist(courseAssignments);

    if (!firstName || !lastName || !username || !email) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, username, and email are required.",
      });
    }

    if (validCourseAssignments.length !== courseAssignments.length) {
      return res.status(400).json({
        success: false,
        message: "One or more assigned courses are not active or do not exist.",
      });
    }

    const exists = await ProfessorUser.findOne({ $or: [{ username }, { email }] }).lean();
    if (exists) {
      return res.status(409).json({ success: false, message: "Username or email already exists." });
    }

    const professor = await ProfessorUser.create({
      firstName,
      lastName,
      username,
      email,
      password: await bcrypt.hash(password, 10),
      role: "professor",
      active: true,
      mustChangePassword: true,
      courseAssignments: validCourseAssignments,
      accountSource: "manual",
      envAccountKey: "",
    });

    return res.status(201).json({
      success: true,
      message: "Professor created successfully.",
      professor: sanitizeProfessor(professor),
      temporaryPassword: password,
    });
  } catch (error) {
    console.error("createAdminProfessor error:", error);
    if (Number(error?.code || 0) === 11000) {
      return res.status(409).json({ success: false, message: "Username or email already exists." });
    }
    return res.status(500).json({ success: false, message: "Failed to create professor." });
  }
}

export async function updateAdminProfessor(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid professor id." });
    }

    const professor = await ProfessorUser.findById(id);
    if (!professor) {
      return res.status(404).json({ success: false, message: "Professor not found." });
    }

    const firstName = clean(req.body?.firstName || professor.firstName);
    const lastName = clean(req.body?.lastName || professor.lastName);
    const username = clean(req.body?.username || professor.username).toLowerCase();
    const email = clean(req.body?.email || professor.email).toLowerCase();
    const courseAssignments = normalizeCourseAssignments(
      req.body?.courseAssignments ?? professor.courseAssignments
    );
    const validCourseAssignments = await validateCoursesExist(courseAssignments);

    if (!firstName || !lastName || !username || !email) {
      return res.status(400).json({ success: false, message: "Required fields are missing." });
    }

    if (validCourseAssignments.length !== courseAssignments.length) {
      return res.status(400).json({
        success: false,
        message: "One or more assigned courses are not active or do not exist.",
      });
    }

    const duplicate = await ProfessorUser.findOne({
      _id: { $ne: professor._id },
      $or: [{ username }, { email }],
    }).lean();

    if (duplicate) {
      return res.status(409).json({ success: false, message: "Username or email already exists." });
    }

    professor.firstName = firstName;
    professor.lastName = lastName;
    professor.username = username;
    professor.email = email;
    professor.courseAssignments = validCourseAssignments;
    professor.active = req.body?.active === undefined ? professor.active !== false : Boolean(req.body.active);
    professor.accountSource = "manual";
    professor.envAccountKey = "";

    await professor.save();

    await TrainingCourse.updateMany(
      { professorUserId: professor._id },
      {
        $set: {
          professorUsername: professor.username,
          professorEmail: professor.email,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Professor updated successfully.",
      professor: sanitizeProfessor(professor),
    });
  } catch (error) {
    console.error("updateAdminProfessor error:", error);
    return res.status(500).json({ success: false, message: "Failed to update professor." });
  }
}

export async function resetAdminProfessorPassword(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid professor id." });
    }

    const professor = await ProfessorUser.findById(id).select("+password");
    if (!professor) {
      return res.status(404).json({ success: false, message: "Professor not found." });
    }

    const temporaryPassword = clean(req.body?.password) || generateTemporaryPassword(12);
    if (temporaryPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    professor.password = await bcrypt.hash(temporaryPassword, 10);
    professor.mustChangePassword = true;
    professor.active = true;
    await professor.save();

    return res.status(200).json({
      success: true,
      message: "Professor password reset successfully.",
      professor: sanitizeProfessor(professor),
      temporaryPassword,
    });
  } catch (error) {
    console.error("resetAdminProfessorPassword error:", error);
    return res.status(500).json({ success: false, message: "Failed to reset professor password." });
  }
}

export async function deactivateAdminProfessor(req, res) {
  try {
    const professor = await ProfessorUser.findByIdAndUpdate(
      req.params.id,
      { $set: { active: false } },
      { new: true }
    );

    if (!professor) {
      return res.status(404).json({ success: false, message: "Professor not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Professor deactivated successfully.",
      professor: sanitizeProfessor(professor),
    });
  } catch (error) {
    console.error("deactivateAdminProfessor error:", error);
    return res.status(500).json({ success: false, message: "Failed to deactivate professor." });
  }
}

export async function activateAdminProfessor(req, res) {
  try {
    const professor = await ProfessorUser.findByIdAndUpdate(
      req.params.id,
      { $set: { active: true } },
      { new: true }
    );

    if (!professor) {
      return res.status(404).json({ success: false, message: "Professor not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Professor activated successfully.",
      professor: sanitizeProfessor(professor),
    });
  } catch (error) {
    console.error("activateAdminProfessor error:", error);
    return res.status(500).json({ success: false, message: "Failed to activate professor." });
  }
}

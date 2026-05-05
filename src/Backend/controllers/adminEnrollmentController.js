// src/Backend/controllers/adminEnrollmentController.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import EnrollmentRequest from "../models/EnrollmentRequest.js";
import TraineeUser from "../models/TraineeUser.js";
import { sendTrainingCredentialsEmail } from "../utils/sendTrainingCredentialsEmail.js";

function sanitizePart(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getInitial(value = "") {
  const clean = sanitizePart(value);
  return clean ? clean.charAt(0) : "";
}

function generateTemporaryPassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = crypto.randomBytes(length);
  let password = "";

  for (let i = 0; i < length; i += 1) {
    password += chars[bytes[i] % chars.length];
  }

  return password;
}

async function generateUniqueTraineeEmail(enrollment) {
  const lastName = sanitizePart(enrollment.lastName) || "user";
  const firstInitial = getInitial(enrollment.firstName);
  const middleInitial = getInitial(enrollment.middleName);

  const base = `${lastName}${firstInitial}${middleInitial}` || "user";
  const domain = "tamsi.com";

  let candidate = `${base}@${domain}`.toLowerCase();
  let counter = 1;

  while (await TraineeUser.findOne({ email: candidate })) {
    candidate = `${base}${counter}@${domain}`.toLowerCase();
    counter += 1;
  }

  return candidate;
}

function normalizeStatusFilter(status) {
  const allowed = new Set(["pending", "approved", "rejected"]);
  return allowed.has(String(status || "").toLowerCase())
    ? String(status).toLowerCase()
    : "pending";
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function listAdminEnrollments(req, res) {
  try {
    const status = normalizeStatusFilter(req.query.status);

    const enrollments = await EnrollmentRequest.find({ approvalStatus: status })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      enrollments,
    });
  } catch (error) {
    console.error("listAdminEnrollments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments.",
    });
  }
}

export async function getAdminEnrollmentById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment id.",
      });
    }

    const enrollment = await EnrollmentRequest.findById(id).lean();

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      enrollment,
    });
  } catch (error) {
    console.error("getAdminEnrollmentById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrollment details.",
    });
  }
}

export async function approveAdminEnrollment(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment id.",
      });
    }

    const enrollment = await EnrollmentRequest.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    if (
      enrollment.approvalStatus === "approved" &&
      enrollment.generatedTraineeEmail
    ) {
      return res.status(200).json({
        success: true,
        message: "Enrollment is already approved.",
        traineeEmail: enrollment.generatedTraineeEmail,
        enrollment,
      });
    }

    const personalEmail = String(enrollment.email || "").trim().toLowerCase();

    if (!personalEmail) {
      return res.status(400).json({
        success: false,
        message: "Applicant personal email is missing.",
      });
    }

    let traineeUser = null;
    let generatedTraineeEmail = String(
      enrollment.generatedTraineeEmail || ""
    ).toLowerCase();
    let tempPassword = "";

    if (enrollment.traineeUserId) {
      traineeUser = await TraineeUser.findById(enrollment.traineeUserId).select(
        "+password"
      );
    }

    if (!traineeUser && generatedTraineeEmail) {
      traineeUser = await TraineeUser.findOne({
        email: generatedTraineeEmail,
      }).select("+password");
    }

    if (!traineeUser) {
      if (!generatedTraineeEmail) {
        generatedTraineeEmail = await generateUniqueTraineeEmail(enrollment);
      }

      tempPassword = generateTemporaryPassword(10);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      traineeUser = await TraineeUser.create({
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        middleName: enrollment.middleName || "",
        email: generatedTraineeEmail,
        password: hashedPassword,
        phone: enrollment.phoneNumber || "",
        course: enrollment.course || "",
        gender: enrollment.gender || "Male",
        status: enrollment.status || "Single",
        batchId: enrollment.batchId || null,
        batchCode: enrollment.batchCode || "",
        batchName: enrollment.batchName || "",
        trainingStatus: "Enrolled",
        active: true,
        mustChangePassword: true,
      });

      enrollment.traineeUserId = traineeUser._id;
      enrollment.generatedTraineeEmail = generatedTraineeEmail;
    } else {
      traineeUser.firstName = enrollment.firstName || traineeUser.firstName;
      traineeUser.lastName = enrollment.lastName || traineeUser.lastName;
      traineeUser.middleName =
        enrollment.middleName || traineeUser.middleName || "";
      traineeUser.phone = enrollment.phoneNumber || traineeUser.phone || "";
      traineeUser.course = enrollment.course || traineeUser.course || "";
      traineeUser.gender = enrollment.gender || traineeUser.gender || "Male";
      traineeUser.status = enrollment.status || traineeUser.status || "Single";
      traineeUser.batchId = enrollment.batchId || traineeUser.batchId || null;
      traineeUser.batchCode =
        enrollment.batchCode || traineeUser.batchCode || "";
      traineeUser.batchName =
        enrollment.batchName || traineeUser.batchName || "";
      traineeUser.trainingStatus = traineeUser.trainingStatus || "Enrolled";
      traineeUser.active = true;

      await traineeUser.save();

      if (!enrollment.generatedTraineeEmail) {
        enrollment.generatedTraineeEmail = traineeUser.email;
      }
      if (!enrollment.traineeUserId) {
        enrollment.traineeUserId = traineeUser._id;
      }
    }

    enrollment.approvalStatus = "approved";
    enrollment.remarks = "";
    enrollment.approvedAt = new Date();
    enrollment.rejectedAt = null;

    await enrollment.save();

    if (tempPassword) {
      await sendTrainingCredentialsEmail({
        to: personalEmail,
        firstName: enrollment.firstName,
        traineeEmail: enrollment.generatedTraineeEmail,
        tempPassword,
        course: enrollment.course,
      });
    }

    return res.status(200).json({
      success: true,
      message: tempPassword
        ? "Enrollment approved successfully. Credentials sent to applicant email."
        : "Enrollment approved successfully.",
      traineeEmail: enrollment.generatedTraineeEmail,
      tempPassword,
      personalEmail,
      enrollment,
    });
  } catch (error) {
    console.error("approveAdminEnrollment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to approve enrollment.",
    });
  }
}

export async function rejectAdminEnrollment(req, res) {
  try {
    const { id } = req.params;
    const { remarks = "" } = req.body || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment id.",
      });
    }

    const enrollment = await EnrollmentRequest.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    if (enrollment.approvalStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Approved enrollments cannot be rejected here.",
      });
    }

    enrollment.approvalStatus = "rejected";
    enrollment.remarks = String(remarks || "").trim();
    enrollment.rejectedAt = new Date();
    enrollment.approvedAt = null;

    await enrollment.save();

    return res.status(200).json({
      success: true,
      message: "Enrollment rejected successfully.",
      enrollment,
    });
  } catch (error) {
    console.error("rejectAdminEnrollment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reject enrollment.",
    });
  }
}

export async function completeAdminEnrollment(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment id.",
      });
    }

    const enrollment = await EnrollmentRequest.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    if (enrollment.approvalStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved enrollments can be marked completed.",
      });
    }

    let traineeUser = null;

    if (enrollment.traineeUserId) {
      traineeUser = await TraineeUser.findById(enrollment.traineeUserId);
    }

    if (!traineeUser && enrollment.generatedTraineeEmail) {
      traineeUser = await TraineeUser.findOne({
        email: String(enrollment.generatedTraineeEmail).toLowerCase(),
      });
    }

    if (traineeUser) {
      traineeUser.trainingStatus = "Completed";
      traineeUser.batchId = enrollment.batchId || traineeUser.batchId || null;
      traineeUser.batchCode =
        enrollment.batchCode || traineeUser.batchCode || "";
      traineeUser.batchName =
        enrollment.batchName || traineeUser.batchName || "";
      await traineeUser.save();
    }

    return res.status(200).json({
      success: true,
      message: "Enrollment marked as completed.",
      enrollment,
      traineeUser,
    });
  } catch (error) {
    console.error("completeAdminEnrollment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to complete enrollment.",
    });
  }
}
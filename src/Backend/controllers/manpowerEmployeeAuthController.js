import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import ManpowerEmployee from "../models/ManpowerEmployee.js";
import ManpowerPayroll from "../models/ManpowerPayroll.js";
import ManpowerLeave from "../models/ManpowerLeave.js";
import { sendManpowerEmployeePasswordOtpEmail } from "../utils/manpowerMailer.js";
import {
  findManpowerFileById,
  openManpowerGridFSDownloadStream,
  uploadBufferToManpowerGridFS,
  deleteFileFromManpowerGridFS,
} from "../utils/manpowerGridfs.js";

function getSecret() {
  return (
    process.env.MANPOWER_JWT_SECRET ||
    process.env.JWT_SECRET ||
    "change-this-secret"
  );
}

function buildEmployeePayload(employee) {
  if (!employee) return null;

  const profilePhotoFileId = employee?.profilePhoto?.fileId
    ? String(employee.profilePhoto.fileId)
    : "";

  return {
    _id: employee._id,
    applicationId: employee.applicationId,
    companyEmail: employee.companyEmail,
    personalEmail: employee.personalEmail,
    firstName: employee.firstName,
    lastName: employee.lastName,
    middleName: employee.middleName || "",
    contactNo: employee.contactNo || "",
    vacancy: employee.vacancy || "",
    deploymentSite: employee.deploymentSite || "",
    regionCode: employee.regionCode || "",
    dailyRate: Number(employee.dailyRate || 0),
    mustChangePassword: Boolean(employee.mustChangePassword),
    active: employee.active !== false,
    profilePhoto: employee.profilePhoto || null,
    profilePhotoFileId,
    hasProfilePhoto: Boolean(profilePhotoFileId),
    createdAt: employee.createdAt || null,
    updatedAt: employee.updatedAt || null,
  };
}

function buildLeavePayload(row) {
  if (!row) return null;

  return {
    _id: row._id,
    employeeId: row.employeeId,
    vacancy: row.vacancy || "",
    leaveType: row.leaveType || "",
    startDate: row.startDate || null,
    endDate: row.endDate || null,
    totalDays: Number(row.totalDays || 0),
    reason: row.reason || "",
    status: row.status || "PENDING",
    hrRemarks: row.hrRemarks || "",
    reviewedBy: row.reviewedBy || "",
    reviewedAt: row.reviewedAt || null,
    createdAt: row.createdAt || null,
    updatedAt: row.updatedAt || null,
  };
}

function formatDateKey(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPayrollRowKey(row) {
  return [formatDateKey(row?.cutoffStart), formatDateKey(row?.cutoffEnd)].join(
    "__"
  );
}

function getRowTimestamp(row) {
  const updatedAt = row?.updatedAt ? new Date(row.updatedAt).getTime() : 0;
  const createdAt = row?.createdAt ? new Date(row.createdAt).getTime() : 0;
  return Math.max(updatedAt || 0, createdAt || 0);
}

function dedupePayrollRows(rows = []) {
  const map = new Map();

  for (const row of rows) {
    const key = getPayrollRowKey(row);
    if (!key) continue;

    const existing = map.get(key);
    if (!existing || getRowTimestamp(row) >= getRowTimestamp(existing)) {
      map.set(key, row);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const aStart = a?.cutoffStart ? new Date(a.cutoffStart).getTime() : 0;
    const bStart = b?.cutoffStart ? new Date(b.cutoffStart).getTime() : 0;

    if (bStart !== aStart) return bStart - aStart;

    const aUpdated = getRowTimestamp(a);
    const bUpdated = getRowTimestamp(b);
    return bUpdated - aUpdated;
  });
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function maskEmail(email = "") {
  const value = String(email || "").trim();
  const [local, domain] = value.split("@");
  if (!local || !domain) return value || "your email";

  const visibleLocal =
    local.length <= 2 ? `${local[0] || "*"}*` : `${local.slice(0, 2)}***`;

  return `${visibleLocal}@${domain}`;
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function parseDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getInclusiveDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / (24 * 60 * 60 * 1000)) + 1);
}

function buildInlineDisposition(filename = "profile-photo") {
  const safeAscii = String(filename || "profile-photo").replace(/["\\\r\n]/g, "_");
  const utf8 = encodeURIComponent(String(filename || "profile-photo"));
  return `inline; filename="${safeAscii}"; filename*=UTF-8''${utf8}`;
}

export async function manpowerEmployeeLogin(req, res) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Company email and password are required.",
      });
    }

    const employee = await ManpowerEmployee.findOne({
      companyEmail: email,
      active: true,
    }).select("+passwordHash");

    if (!employee) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(password, employee.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      {
        isManpowerEmployee: true,
        employeeId: employee._id,
        companyEmail: employee.companyEmail,
      },
      getSecret(),
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      employee: buildEmployeePayload(employee),
    });
  } catch (error) {
    console.error("manpowerEmployeeLogin error:", error);
    return res.status(500).json({ message: "Failed to log in employee." });
  }
}

export async function manpowerEmployeeMe(req, res) {
  try {
    const employee = await ManpowerEmployee.findById(req.employee.employeeId).lean();

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    return res.json({
      employee: buildEmployeePayload(employee),
    });
  } catch (error) {
    console.error("manpowerEmployeeMe error:", error);
    return res.status(500).json({ message: "Failed to load profile." });
  }
}

export async function uploadMyManpowerProfilePhoto(req, res) {
  try {
    const employee = await ManpowerEmployee.findById(req.employee.employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const file = req.file;

    if (!file?.buffer) {
      return res.status(400).json({
        message: "Please select a profile photo to upload.",
      });
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const mimetype = String(file.mimetype || "").toLowerCase();

    if (!allowed.includes(mimetype)) {
      return res.status(400).json({
        message: "Profile photo must be JPG, JPEG, PNG, or WEBP.",
      });
    }

    const previousFileId = employee?.profilePhoto?.fileId
      ? String(employee.profilePhoto.fileId)
      : "";

    const uploaded = await uploadBufferToManpowerGridFS({
      buffer: file.buffer,
      filename: `manpower-profile-${employee._id}-${file.originalname}`,
      originalName: file.originalname || "profile-photo",
      contentType: mimetype,
      mimetype,
      size: Number(file.size || 0),
      folder: "manpower-profile-photos",
    });

    employee.profilePhoto = uploaded;
    await employee.save();

    if (previousFileId) {
      try {
        await deleteFileFromManpowerGridFS(previousFileId);
      } catch (deleteError) {
        console.error("Failed to delete old profile photo:", deleteError);
      }
    }

    return res.json({
      message: "Profile photo uploaded successfully.",
      employee: buildEmployeePayload(employee),
    });
  } catch (error) {
    console.error("uploadMyManpowerProfilePhoto error:", error);
    return res.status(500).json({
      message: error?.message || "Failed to upload profile photo.",
    });
  }
}

export async function streamMyManpowerProfilePhoto(req, res) {
  try {
    const employee = await ManpowerEmployee.findById(req.employee.employeeId)
      .select("profilePhoto")
      .lean();

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const fileId = employee?.profilePhoto?.fileId
      ? String(employee.profilePhoto.fileId)
      : "";

    if (!fileId) {
      return res.status(404).json({ message: "Profile photo not found." });
    }

    const fileDoc = await findManpowerFileById(fileId);

    if (!fileDoc) {
      return res.status(404).json({ message: "Profile photo file not found." });
    }

    const contentType =
      employee?.profilePhoto?.mimetype ||
      fileDoc?.contentType ||
      fileDoc?.metadata?.mimetype ||
      "application/octet-stream";

    const originalName =
      employee?.profilePhoto?.originalName ||
      fileDoc?.metadata?.originalName ||
      fileDoc?.filename ||
      "profile-photo";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", buildInlineDisposition(originalName));
    res.setHeader("Cache-Control", "no-store");

    const stream = openManpowerGridFSDownloadStream(fileId);

    stream.on("error", (error) => {
      console.error("streamMyManpowerProfilePhoto stream error:", error);
      if (!res.headersSent) {
        return res.status(404).json({ message: "Profile photo data not found." });
      }
      res.end();
    });

    return stream.pipe(res);
  } catch (error) {
    console.error("streamMyManpowerProfilePhoto error:", error);
    return res.status(500).json({
      message: "Failed to load profile photo.",
    });
  }
}

export async function listMyManpowerPayroll(req, res) {
  try {
    const employeeId = req?.employee?.employeeId;

    if (!employeeId) {
      return res.status(401).json({ message: "Unauthorized employee request." });
    }

    const employee = await ManpowerEmployee.findById(employeeId).lean();
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const payrolls = await ManpowerPayroll.find({
      employeeId,
    })
      .sort({ cutoffStart: -1, updatedAt: -1, createdAt: -1 })
      .lean();

    return res.json({
      employee: buildEmployeePayload(employee),
      payrolls: dedupePayrollRows(payrolls),
    });
  } catch (error) {
    console.error("listMyManpowerPayroll error:", error);
    return res.status(500).json({
      message: "Failed to load payroll history.",
    });
  }
}

export async function fileMyManpowerLeave(req, res) {
  try {
    const employeeId = req?.employee?.employeeId;

    if (!employeeId) {
      return res.status(401).json({ message: "Unauthorized employee request." });
    }

    const employee = await ManpowerEmployee.findById(employeeId).lean();

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const leaveType = cleanText(req.body?.leaveType);
    const startDate = parseDate(req.body?.startDate);
    const endDate = parseDate(req.body?.endDate);
    const reason = cleanText(req.body?.reason);

    const allowedLeaveTypes = [
      "Vacation Leave",
      "Sick Leave",
      "Emergency Leave",
      "Maternity Leave",
      "Paternity Leave",
      "Bereavement Leave",
      "Other",
    ];

    if (!allowedLeaveTypes.includes(leaveType)) {
      return res.status(400).json({ message: "Please select a valid leave type." });
    }

    if (!startDate) {
      return res.status(400).json({ message: "Valid start date is required." });
    }

    if (!endDate) {
      return res.status(400).json({ message: "Valid end date is required." });
    }

    if (endDate.getTime() < startDate.getTime()) {
      return res.status(400).json({
        message: "End date must not be earlier than start date.",
      });
    }

    if (!reason || reason.length < 5) {
      return res.status(400).json({
        message: "Please enter a reason with at least 5 characters.",
      });
    }

    const overlappingPending = await ManpowerLeave.findOne({
      employeeId,
      status: "PENDING",
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    }).lean();

    if (overlappingPending) {
      return res.status(409).json({
        message:
          "You already have a pending leave request that overlaps with these dates.",
      });
    }

    const leave = await ManpowerLeave.create({
      employeeId,
      vacancy: employee.vacancy || "",
      leaveType,
      startDate,
      endDate,
      totalDays: getInclusiveDays(startDate, endDate),
      reason,
      status: "PENDING",
    });

    return res.status(201).json({
      message: "Leave request filed successfully.",
      leave: buildLeavePayload(leave),
    });
  } catch (error) {
    console.error("fileMyManpowerLeave error:", error);
    return res.status(500).json({
      message: error?.message || "Failed to file leave request.",
    });
  }
}

export async function listMyManpowerLeaves(req, res) {
  try {
    const employeeId = req?.employee?.employeeId;

    if (!employeeId) {
      return res.status(401).json({ message: "Unauthorized employee request." });
    }

    const leaves = await ManpowerLeave.find({ employeeId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      leaves: leaves.map(buildLeavePayload),
    });
  } catch (error) {
    console.error("listMyManpowerLeaves error:", error);
    return res.status(500).json({
      message: "Failed to load leave requests.",
    });
  }
}

export async function requestManpowerEmployeeChangePasswordOtp(req, res) {
  try {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters.",
      });
    }

    const employee = await ManpowerEmployee.findById(req.employee.employeeId).select(
      "+passwordHash +passwordChangeOtpHash +passwordChangeOtpExpiresAt"
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const ok = await bcrypt.compare(currentPassword, employee.passwordHash);
    if (!ok) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const sameAsCurrent = await bcrypt.compare(newPassword, employee.passwordHash);
    if (sameAsCurrent) {
      return res.status(400).json({
        message: "New password must be different from the current password.",
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const recipient = employee.personalEmail || employee.companyEmail;

    if (!recipient) {
      return res.status(400).json({
        message: "No email address is available for OTP delivery.",
      });
    }

    employee.passwordChangeOtpHash = await bcrypt.hash(otp, 10);
    employee.passwordChangeOtpExpiresAt = expiresAt;
    await employee.save();

    try {
      await sendManpowerEmployeePasswordOtpEmail({
        to: recipient,
        employeeName: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
        otp,
        expiresInMinutes: 10,
      });
    } catch (emailError) {
      employee.passwordChangeOtpHash = "";
      employee.passwordChangeOtpExpiresAt = null;
      await employee.save();

      console.error("requestManpowerEmployeeChangePasswordOtp email error:", emailError);
      return res.status(500).json({
        message: emailError?.message || "Failed to send OTP email.",
      });
    }

    return res.json({
      message: `OTP sent successfully to ${maskEmail(recipient)}.`,
    });
  } catch (error) {
    console.error("requestManpowerEmployeeChangePasswordOtp error:", error);
    return res.status(500).json({
      message: error?.message || "Failed to send password change OTP.",
    });
  }
}

export async function manpowerEmployeeChangePassword(req, res) {
  try {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");
    const otp = String(req.body?.otp || "").trim();

    if (!currentPassword || !newPassword || !otp) {
      return res.status(400).json({
        message: "Current password, new password, and OTP are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters.",
      });
    }

    const employee = await ManpowerEmployee.findById(req.employee.employeeId).select(
      "+passwordHash +passwordChangeOtpHash +passwordChangeOtpExpiresAt"
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const ok = await bcrypt.compare(currentPassword, employee.passwordHash);
    if (!ok) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const sameAsCurrent = await bcrypt.compare(newPassword, employee.passwordHash);
    if (sameAsCurrent) {
      return res.status(400).json({
        message: "New password must be different from the current password.",
      });
    }

    if (!employee.passwordChangeOtpHash || !employee.passwordChangeOtpExpiresAt) {
      return res.status(400).json({
        message: "Please request an OTP first.",
      });
    }

    if (new Date(employee.passwordChangeOtpExpiresAt).getTime() < Date.now()) {
      employee.passwordChangeOtpHash = "";
      employee.passwordChangeOtpExpiresAt = null;
      await employee.save();

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const otpOk = await bcrypt.compare(otp, employee.passwordChangeOtpHash);
    if (!otpOk) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    employee.passwordHash = await bcrypt.hash(newPassword, 10);
    employee.mustChangePassword = false;
    employee.passwordChangeOtpHash = "";
    employee.passwordChangeOtpExpiresAt = null;
    await employee.save();

    return res.json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("manpowerEmployeeChangePassword error:", error);
    return res.status(500).json({ message: "Failed to change password." });
  }
}
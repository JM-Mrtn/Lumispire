import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import ManpowerApplication from "../models/ManpowerApplication.js";
import ManpowerEmployee from "../models/ManpowerEmployee.js";
import ManpowerLeave from "../models/ManpowerLeave.js";
import {
  buildSystemEmail,
  normalizeEmail,
  normalizeText,
} from "../utils/manpowerConstants.js";
import {
  sendHiredCredentialsEmail,
  sendInterviewScheduleEmail,
} from "../utils/manpowerMailer.js";
import {
  findManpowerFileById,
  openManpowerGridFSDownloadStream,
} from "../utils/manpowerGridfs.js";

function getSecret() {
  return (
    process.env.MANPOWER_JWT_SECRET ||
    process.env.JWT_SECRET ||
    "change-this-secret"
  );
}

function makeTempPassword(length = 10) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#";

  let out = "";

  while (out.length < length) {
    const byte = crypto.randomBytes(1)[0];
    out += chars[byte % chars.length];
  }

  return out;
}

async function createUniqueCompanyEmail(application) {
  const baseEmail = buildSystemEmail({
    firstName: application.firstName,
    lastName: application.lastName,
    middleName: application.middleName,
  });

  const [local, domain] = baseEmail.split("@");

  let candidate = baseEmail;
  let counter = 1;

  while (await ManpowerEmployee.exists({ companyEmail: candidate })) {
    counter += 1;
    candidate = `${local}${counter}@${domain}`;
  }

  return candidate;
}

function isValidObjectId(value = "") {
  return mongoose.Types.ObjectId.isValid(String(value || "").trim());
}

function parseMoney(value = 0) {
  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .trim();

  const numberValue = Number(cleaned);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function buildInlineDisposition(filename = "file") {
  const safeAscii = String(filename || "file").replace(/["\\\r\n]/g, "_");
  const utf8 = encodeURIComponent(String(filename || "file"));

  return `inline; filename="${safeAscii}"; filename*=UTF-8''${utf8}`;
}

function buildEmployeePayload(employee) {
  if (!employee) return null;

  const profilePhotoFileId = employee?.profilePhoto?.fileId
    ? String(employee.profilePhoto.fileId)
    : "";

  return {
    _id: employee._id,
    applicationId: employee.applicationId,
    vacancy: employee.vacancy || "",
    deploymentSite: employee.deploymentSite || "",
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    middleName: employee.middleName || "",
    contactNo: employee.contactNo || "",
    personalEmail: employee.personalEmail || "",
    companyEmail: employee.companyEmail || "",
    dailyRate: Number(employee.dailyRate || 0),
    regionCode: employee.regionCode || "",
    active: employee.active !== false,
    mustChangePassword: Boolean(employee.mustChangePassword),
    profilePhoto: employee.profilePhoto || null,
    profilePhotoFileId,
    hasProfilePhoto: Boolean(profilePhotoFileId),
    createdAt: employee.createdAt || null,
    updatedAt: employee.updatedAt || null,
  };
}

function buildLeavePayload(row) {
  if (!row) return null;

  const employee = row.employeeId && typeof row.employeeId === "object"
    ? row.employeeId
    : null;

  const fullName = employee
    ? [employee.firstName || "", employee.middleName || "", employee.lastName || ""]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

  return {
    _id: row._id,
    employeeId: employee?._id || row.employeeId,
    employeeName: fullName,
    companyEmail: employee?.companyEmail || "",
    contactNo: employee?.contactNo || "",
    vacancy: row.vacancy || employee?.vacancy || "",
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

export async function manpowerHrLogin(req, res) {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();

    const expectedUser = process.env.MANPOWER_HR_USER || "manpowerhr";
    const expectedPass = process.env.MANPOWER_HR_PASS || "manpowerhr123";

    if (username !== expectedUser || password !== expectedPass) {
      return res.status(401).json({
        message: "Invalid HR credentials.",
      });
    }

    const token = jwt.sign(
      {
        isManpowerHr: true,
        role: "manpower-hr",
        username,
      },
      getSecret(),
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      hrUser: {
        username,
        role: "manpower-hr",
      },
    });
  } catch (error) {
    console.error("manpowerHrLogin error:", error);

    return res.status(500).json({
      message: "Failed to log in HR user.",
    });
  }
}

export async function listManpowerApplications(req, res) {
  try {
    const status = String(req.query?.status || "").trim().toUpperCase();
    const vacancy = String(req.query?.vacancy || "").trim();

    const query = {};

    if (status) query.status = status;
    if (vacancy) query.vacancy = vacancy;

    const applications = await ManpowerApplication.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      applications,
    });
  } catch (error) {
    console.error("listManpowerApplications error:", error);

    return res.status(500).json({
      message: "Failed to load applications.",
    });
  }
}

export async function getManpowerApplicationById(req, res) {
  try {
    const application = await ManpowerApplication.findById(req.params.id).lean();

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    return res.json({
      application,
    });
  } catch (error) {
    console.error("getManpowerApplicationById error:", error);

    return res.status(500).json({
      message: "Failed to load application.",
    });
  }
}

export async function getManpowerApplicationRequirementFile(req, res) {
  try {
    const applicationId = String(req.params?.id || "").trim();
    const requirementKey = String(req.params?.key || "").trim();

    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({
        message: "Invalid application id.",
      });
    }

    const allowedRequirementKeys = [
      "validId",
      "resume",
      "nbi",
      "barangayClearance",
      "sss",
      "philhealth",
      "pagibig",
      "tin",
      "transcriptOfRecords",
      "diploma",
      "birthCertificate",
      "photo1x1",
      "photo2x2",
    ];

    if (!allowedRequirementKeys.includes(requirementKey)) {
      return res.status(400).json({
        message: "Invalid requirement key.",
      });
    }

    const application = await ManpowerApplication.findById(applicationId)
      .select("requirements firstName lastName email vacancy")
      .lean();

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    const fileMeta = application?.requirements?.[requirementKey];
    const fileId = fileMeta?.fileId ? String(fileMeta.fileId) : "";

    if (!fileId || !isValidObjectId(fileId)) {
      return res.status(404).json({
        message: "Uploaded file not found.",
      });
    }

    const fileDoc = await findManpowerFileById(fileId);

    if (!fileDoc) {
      return res.status(404).json({
        message: "File data not found.",
      });
    }

    const contentType =
      fileMeta?.mimetype ||
      fileDoc?.contentType ||
      fileDoc?.metadata?.mimetype ||
      "application/octet-stream";

    const originalName =
      fileMeta?.originalName ||
      fileDoc?.metadata?.originalName ||
      fileDoc?.filename ||
      `${requirementKey}-file`;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", buildInlineDisposition(originalName));

    const downloadStream = openManpowerGridFSDownloadStream(fileId);

    downloadStream.on("error", (error) => {
      console.error("getManpowerApplicationRequirementFile stream error:", error);

      if (!res.headersSent) {
        return res.status(404).json({
          message: "File data not found.",
        });
      }

      res.end();
    });

    return downloadStream.pipe(res);
  } catch (error) {
    console.error("getManpowerApplicationRequirementFile error:", error);

    return res.status(500).json({
      message: "Failed to load uploaded requirement file.",
    });
  }
}

export async function scheduleManpowerInterview(req, res) {
  try {
    const application = await ManpowerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    const scheduledAt = req.body?.scheduledAt
      ? new Date(req.body.scheduledAt)
      : null;

    const location = normalizeText(req.body?.location);
    const interviewer = normalizeText(req.body?.interviewer);
    const remarks = normalizeText(req.body?.remarks);

    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      return res.status(400).json({
        message: "Valid interview date and time is required.",
      });
    }

    application.status = "INTERVIEW_SCHEDULED";
    application.interview = {
      scheduledAt,
      location,
      interviewer,
      remarks,
      emailSentAt: new Date(),
    };

    await application.save();

    try {
      await sendInterviewScheduleEmail({
        to: application.email,
        applicantName: `${application.firstName} ${application.lastName}`,
        vacancy: application.vacancy,
        scheduledAt,
        location,
        interviewer,
        remarks,
      });
    } catch (emailError) {
      console.error("schedule interview email error:", emailError);
    }

    return res.json({
      message: "Interview scheduled successfully.",
      application,
    });
  } catch (error) {
    console.error("scheduleManpowerInterview error:", error);

    return res.status(500).json({
      message: "Failed to schedule interview.",
    });
  }
}

export async function rejectManpowerApplicant(req, res) {
  try {
    const application = await ManpowerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    application.status = "REJECTED";
    application.hrNotes = normalizeText(req.body?.hrNotes);

    await application.save();

    return res.json({
      message: "Application marked as rejected.",
      application,
    });
  } catch (error) {
    console.error("rejectManpowerApplicant error:", error);

    return res.status(500).json({
      message: "Failed to reject applicant.",
    });
  }
}

export async function hireManpowerApplicant(req, res) {
  try {
    const application = await ManpowerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    if (application.hiredEmployeeId) {
      const existing = await ManpowerEmployee.findById(
        application.hiredEmployeeId
      ).lean();

      return res.json({
        message: "Applicant is already hired.",
        employee: existing,
      });
    }

    const vacancy = application.vacancy;
    const companyEmail = await createUniqueCompanyEmail(application);
    const temporaryPassword = makeTempPassword(10);
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const deploymentSite = normalizeText(req.body?.deploymentSite);
    const regionCode = normalizeText(req.body?.regionCode) || "NCR";
    const hrNotes = normalizeText(req.body?.hrNotes);
    const dailyRate = parseMoney(req.body?.dailyRate);

    if (!Number.isFinite(dailyRate) || dailyRate <= 0) {
      return res.status(400).json({
        message: "Please enter a valid daily rate when hiring an applicant.",
      });
    }

    const employee = await ManpowerEmployee.create({
      applicationId: application._id,
      vacancy,
      deploymentSite,
      firstName: application.firstName,
      lastName: application.lastName,
      middleName: application.middleName,
      contactNo: application.contactNo,
      personalEmail: normalizeEmail(application.email),
      companyEmail,
      passwordHash,
      mustChangePassword: true,
      active: true,
      dailyRate,
      regionCode,
    });

    application.status = "HIRED";
    application.hiredAt = new Date();
    application.hiredFor = vacancy;
    application.hiredEmployeeId = employee._id;
    application.hrNotes = hrNotes;

    await application.save();

    try {
      await sendHiredCredentialsEmail({
        to: application.email,
        employeeName: `${application.firstName} ${application.lastName}`,
        vacancy,
        companyEmail,
        temporaryPassword,
      });
    } catch (emailError) {
      console.error("hireManpowerApplicant email error:", emailError);
    }

    return res.json({
      message: "Applicant hired successfully.",
      employee: {
        _id: employee._id,
        companyEmail,
        temporaryPassword,
        vacancy: employee.vacancy,
        deploymentSite: employee.deploymentSite,
        regionCode: employee.regionCode,
        dailyRate: employee.dailyRate,
      },
    });
  } catch (error) {
    console.error("hireManpowerApplicant error:", error);

    return res.status(500).json({
      message: error?.message || "Failed to hire applicant.",
    });
  }
}

export async function listManpowerEmployees(req, res) {
  try {
    const vacancy = String(req.query?.vacancy || "").trim();

    const query = {};

    if (vacancy) query.vacancy = vacancy;

    const employees = await ManpowerEmployee.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      employees: employees.map(buildEmployeePayload),
    });
  } catch (error) {
    console.error("listManpowerEmployees error:", error);

    return res.status(500).json({
      message: "Failed to load employees.",
    });
  }
}

export async function listManpowerLeavesForHr(req, res) {
  try {
    const status = String(req.query?.status || "").trim().toUpperCase();
    const vacancy = String(req.query?.vacancy || "").trim();

    const query = {};

    if (["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      query.status = status;
    }

    if (vacancy) {
      query.vacancy = vacancy;
    }

    const leaves = await ManpowerLeave.find(query)
      .populate(
        "employeeId",
        "firstName middleName lastName companyEmail contactNo vacancy deploymentSite"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      leaves: leaves.map(buildLeavePayload),
    });
  } catch (error) {
    console.error("listManpowerLeavesForHr error:", error);
    return res.status(500).json({
      message: "Failed to load leave requests.",
    });
  }
}

export async function approveManpowerLeave(req, res) {
  try {
    const leaveId = String(req.params?.leaveId || "").trim();
    const hrRemarks = normalizeText(req.body?.hrRemarks);

    if (!isValidObjectId(leaveId)) {
      return res.status(400).json({ message: "Invalid leave request id." });
    }

    const leave = await ManpowerLeave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found." });
    }

    if (leave.status !== "PENDING") {
      return res.status(409).json({
        message: "Only pending leave requests can be approved.",
      });
    }

    leave.status = "APPROVED";
    leave.hrRemarks = hrRemarks;
    leave.reviewedBy = req.hr?.username || "HR";
    leave.reviewedAt = new Date();

    await leave.save();

    const populated = await ManpowerLeave.findById(leave._id)
      .populate(
        "employeeId",
        "firstName middleName lastName companyEmail contactNo vacancy deploymentSite"
      )
      .lean();

    return res.json({
      message: "Leave request approved successfully.",
      leave: buildLeavePayload(populated),
    });
  } catch (error) {
    console.error("approveManpowerLeave error:", error);
    return res.status(500).json({
      message: error?.message || "Failed to approve leave request.",
    });
  }
}

export async function rejectManpowerLeave(req, res) {
  try {
    const leaveId = String(req.params?.leaveId || "").trim();
    const hrRemarks = normalizeText(req.body?.hrRemarks);

    if (!isValidObjectId(leaveId)) {
      return res.status(400).json({ message: "Invalid leave request id." });
    }

    if (!hrRemarks || hrRemarks.length < 3) {
      return res.status(400).json({
        message: "Please enter HR remarks before rejecting the leave request.",
      });
    }

    const leave = await ManpowerLeave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found." });
    }

    if (leave.status !== "PENDING") {
      return res.status(409).json({
        message: "Only pending leave requests can be rejected.",
      });
    }

    leave.status = "REJECTED";
    leave.hrRemarks = hrRemarks;
    leave.reviewedBy = req.hr?.username || "HR";
    leave.reviewedAt = new Date();

    await leave.save();

    const populated = await ManpowerLeave.findById(leave._id)
      .populate(
        "employeeId",
        "firstName middleName lastName companyEmail contactNo vacancy deploymentSite"
      )
      .lean();

    return res.json({
      message: "Leave request rejected successfully.",
      leave: buildLeavePayload(populated),
    });
  } catch (error) {
    console.error("rejectManpowerLeave error:", error);
    return res.status(500).json({
      message: error?.message || "Failed to reject leave request.",
    });
  }
}
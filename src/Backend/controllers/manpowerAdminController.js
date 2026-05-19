import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import ManpowerApplication from "../models/ManpowerApplication.js";
import ManpowerEmployee from "../models/ManpowerEmployee.js";
import ManpowerJob from "../models/ManpowerJob.js";
import {
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

function getAdminUsername() {
  return String(process.env.MANPOWER_ADMIN_USER || "manpoweradmin").trim();
}

function getAdminPassword() {
  return String(
    process.env.MANPOWER_ADMIN_PASS ||
      process.env.MANPOWER_ADMIN_KEY ||
      "manpoweradmin123"
  ).trim();
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function escapeRegex(value = "") {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseMoney(value = 0) {
  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .trim();

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
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

function normalizeQualifications(value) {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);

  return String(value || "")
    .split(/\r?\n|,/)
    .map(cleanText)
    .filter(Boolean);
}

function parseBoolean(value, fallback = true) {
  if (typeof value === "boolean") return value;

  const text = String(value ?? "").trim().toLowerCase();

  if (["true", "1", "yes", "active", "on"].includes(text)) return true;
  if (["false", "0", "no", "inactive", "off"].includes(text)) return false;

  return fallback;
}

function buildJobImageUrl(image = {}) {
  const fileId = image?.fileId ? String(image.fileId) : "";
  return fileId ? `/manpower/files/${fileId}` : "";
}

function buildJobPayload(job) {
  if (!job) return null;

  return {
    _id: job._id,
    title: job.title || "",
    description: job.description || "",
    qualifications: Array.isArray(job.qualifications) ? job.qualifications : [],
    image: job.image || null,
    imageUrl: buildJobImageUrl(job.image),
    active: job.active !== false,
    createdBy: job.createdBy || "",
    createdAt: job.createdAt || null,
    updatedAt: job.updatedAt || null,
  };
}

async function uploadJobImage(file) {
  if (!file?.buffer) return null;

  const mimetype = String(file.mimetype || "").toLowerCase();
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowed.includes(mimetype)) {
    const error = new Error("Job photo must be JPG, JPEG, PNG, or WEBP.");
    error.status = 400;
    throw error;
  }

  const originalName = file.originalname || "job-photo";

  return uploadBufferToManpowerGridFS({
    buffer: file.buffer,
    filename: `manpower-job-${Date.now()}-${originalName}`,
    originalName,
    contentType: mimetype,
    mimetype,
    size: Number(file.size || 0),
    folder: "manpower-jobs",
  });
}

async function safeDeleteJobImage(image = {}) {
  const fileId = image?.fileId ? String(image.fileId) : "";

  if (!fileId) return;

  try {
    await deleteFileFromManpowerGridFS(fileId);
  } catch (error) {
    console.error("Failed to delete old job image:", error);
  }
}

function buildEmployeeAccountPayload(employee) {
  if (!employee) return null;

  const fullName = [
    employee.firstName || "",
    employee.middleName || "",
    employee.lastName || "",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    _id: employee._id,
    applicationId: employee.applicationId || null,
    fullName,
    firstName: employee.firstName || "",
    middleName: employee.middleName || "",
    lastName: employee.lastName || "",
    personalEmail: employee.personalEmail || "",
    companyEmail: employee.companyEmail || "",
    contactNo: employee.contactNo || "",
    vacancy: employee.vacancy || "",
    deploymentSite: employee.deploymentSite || "",
    regionCode: employee.regionCode || "",
    dailyRate: Number(employee.dailyRate || 0),
    active: employee.active !== false,
    mustChangePassword: Boolean(employee.mustChangePassword),
    createdAt: employee.createdAt || null,
    updatedAt: employee.updatedAt || null,
  };
}

export async function manpowerAdminLogin(req, res) {
  try {
    const username = cleanText(req.body?.username);
    const password = cleanText(req.body?.password);

    const expectedUser = getAdminUsername();
    const expectedPass = getAdminPassword();

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    if (username !== expectedUser || password !== expectedPass) {
      return res.status(401).json({
        message: "Invalid admin credentials.",
      });
    }

    const token = jwt.sign(
      {
        isManpowerAdmin: true,
        role: "manpower-admin",
        username,
      },
      getSecret(),
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      adminUser: {
        username,
        role: "manpower-admin",
      },
    });
  } catch (error) {
    console.error("manpowerAdminLogin error:", error);

    return res.status(500).json({
      message: "Failed to log in admin.",
    });
  }
}

export async function getManpowerAdminDashboard(req, res) {
  try {
    const requestedYear = Number(req.query?.year || new Date().getFullYear());
    const selectedYear = Number.isFinite(requestedYear)
      ? requestedYear
      : new Date().getFullYear();

    const yearStart = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
    const yearEnd = new Date(selectedYear + 1, 0, 1, 0, 0, 0, 0);

    const monthLabels = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const [employees, hiredApplications, jobs, monthlyApplicantRows, yearRows] =
      await Promise.all([
        ManpowerEmployee.find()
          .select(
            "vacancy active mustChangePassword companyEmail personalEmail createdAt updatedAt dailyRate"
          )
          .lean(),
        ManpowerApplication.countDocuments({ status: "HIRED" }),
        ManpowerJob.find().sort({ title: 1 }).lean(),
        ManpowerApplication.aggregate([
          {
            $match: {
              createdAt: {
                $gte: yearStart,
                $lt: yearEnd,
              },
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              total: { $sum: 1 },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]),
        ManpowerApplication.aggregate([
          {
            $group: {
              _id: { $year: "$createdAt" },
            },
          },
          {
            $sort: {
              _id: -1,
            },
          },
        ]),
      ]);

    const monthlyApplicants = monthLabels.map((month, index) => {
      const monthNumber = index + 1;
      const found = monthlyApplicantRows.find(
        (row) => Number(row?._id) === monthNumber
      );

      return {
        month,
        total: Number(found?.total || 0),
      };
    });

    const availableYears = yearRows
      .map((row) => Number(row?._id))
      .filter((year) => Number.isFinite(year));

    if (!availableYears.includes(selectedYear)) {
      availableYears.unshift(selectedYear);
    }

    const summary = {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((item) => item.active !== false).length,
      inactiveEmployees: employees.filter((item) => item.active === false)
        .length,
      mustChangePasswordCount: employees.filter((item) =>
        Boolean(item.mustChangePassword)
      ).length,
      readyAccountsCount: employees.filter(
        (item) => item.active !== false && !item.mustChangePassword
      ).length,
      hiredApplications,
      totalJobs: jobs.length,
      activeJobs: jobs.filter((item) => item.active !== false).length,
      inactiveJobs: jobs.filter((item) => item.active === false).length,
    };

    const map = new Map();

    for (const job of jobs) {
      map.set(job.title, {
        vacancy: job.title,
        active: job.active !== false,
        totalAccounts: 0,
        activeAccounts: 0,
        inactiveAccounts: 0,
        mustChangePasswordCount: 0,
      });
    }

    for (const employee of employees) {
      const vacancy = cleanText(employee?.vacancy);
      if (!vacancy) continue;

      if (!map.has(vacancy)) {
        map.set(vacancy, {
          vacancy,
          active: false,
          totalAccounts: 0,
          activeAccounts: 0,
          inactiveAccounts: 0,
          mustChangePasswordCount: 0,
        });
      }

      const row = map.get(vacancy);
      row.totalAccounts += 1;

      if (employee.active !== false) {
        row.activeAccounts += 1;
      } else {
        row.inactiveAccounts += 1;
      }

      if (employee.mustChangePassword) {
        row.mustChangePasswordCount += 1;
      }
    }

    return res.json({
      summary,
      vacancyBreakdown: Array.from(map.values()).filter(
        (item) => item.totalAccounts > 0
      ),
      monthlyApplicants,
      selectedYear,
      availableYears,
    });
  } catch (error) {
    console.error("getManpowerAdminDashboard error:", error);

    return res.status(500).json({
      message: "Failed to load admin dashboard.",
    });
  }
}

export async function listManpowerJobs(req, res) {
  try {
    const search = cleanText(req.query?.search);
    const status = cleanText(req.query?.status).toLowerCase();

    const query = {};

    if (status === "active") query.active = true;
    if (status === "inactive") query.active = false;

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [{ title: regex }, { description: regex }];
    }

    const jobs = await ManpowerJob.find(query).sort({ title: 1 }).lean();

    return res.json({
      jobs: jobs.map(buildJobPayload),
    });
  } catch (error) {
    console.error("listManpowerJobs error:", error);

    return res.status(500).json({
      message: "Failed to load job vacancies.",
    });
  }
}

export async function createManpowerJob(req, res) {
  try {
    const title = cleanText(req.body?.title);
    const description = cleanText(req.body?.description);
    const qualifications = normalizeQualifications(req.body?.qualifications);
    const active = parseBoolean(req.body?.active, true);

    if (!title || title.length < 2) {
      return res.status(400).json({
        message: "Job title is required.",
      });
    }

    const existing = await ManpowerJob.findOne({
      title: new RegExp(`^${escapeRegex(title)}$`, "i"),
    }).lean();

    if (existing) {
      return res.status(409).json({
        message: "This job already exists.",
      });
    }

    const uploadedImage = await uploadJobImage(req.file);

    const job = await ManpowerJob.create({
      title,
      description,
      qualifications,
      image: uploadedImage || {},
      active,
      createdBy: req.manpowerAdmin?.username || "admin",
    });

    return res.status(201).json({
      message: "Job vacancy created successfully.",
      job: buildJobPayload(job),
    });
  } catch (error) {
    console.error("createManpowerJob error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "This job already exists.",
      });
    }

    return res.status(error?.status || 500).json({
      message: error?.message || "Failed to create job vacancy.",
    });
  }
}

export async function updateManpowerJob(req, res) {
  try {
    const jobId = cleanText(req.params?.jobId);
    const title = cleanText(req.body?.title);
    const description = cleanText(req.body?.description);
    const qualifications = normalizeQualifications(req.body?.qualifications);
    const active = parseBoolean(req.body?.active, true);

    if (!title || title.length < 2) {
      return res.status(400).json({
        message: "Job title is required.",
      });
    }

    const duplicate = await ManpowerJob.findOne({
      _id: { $ne: jobId },
      title: new RegExp(`^${escapeRegex(title)}$`, "i"),
    }).lean();

    if (duplicate) {
      return res.status(409).json({
        message: "Another job with this title already exists.",
      });
    }

    const job = await ManpowerJob.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job vacancy not found.",
      });
    }

    const previousImage = job.image?.fileId
      ? job.image.toObject?.() || job.image
      : null;

    job.title = title;
    job.description = description;
    job.qualifications = qualifications;
    job.active = active;

    if (req.file?.buffer) {
      const uploadedImage = await uploadJobImage(req.file);
      job.image = uploadedImage || {};
    }

    await job.save();

    if (req.file?.buffer && previousImage?.fileId) {
      await safeDeleteJobImage(previousImage);
    }

    return res.json({
      message: "Job vacancy updated successfully.",
      job: buildJobPayload(job),
    });
  } catch (error) {
    console.error("updateManpowerJob error:", error);

    return res.status(error?.status || 500).json({
      message: error?.message || "Failed to update job vacancy.",
    });
  }
}

export async function updateManpowerJobStatus(req, res) {
  try {
    const jobId = cleanText(req.params?.jobId);
    const active = req.body?.active;

    if (typeof active !== "boolean") {
      return res.status(400).json({
        message: "Active status must be true or false.",
      });
    }

    const job = await ManpowerJob.findByIdAndUpdate(
      jobId,
      { active },
      { new: true }
    ).lean();

    if (!job) {
      return res.status(404).json({
        message: "Job vacancy not found.",
      });
    }

    return res.json({
      message: active
        ? "Job vacancy activated successfully."
        : "Job vacancy deactivated successfully.",
      job: buildJobPayload(job),
    });
  } catch (error) {
    console.error("updateManpowerJobStatus error:", error);

    return res.status(500).json({
      message: "Failed to update job status.",
    });
  }
}

export async function deleteManpowerJob(req, res) {
  try {
    const jobId = cleanText(req.params?.jobId);

    const job = await ManpowerJob.findById(jobId).lean();

    if (!job) {
      return res.status(404).json({
        message: "Job vacancy not found.",
      });
    }

    const usedCount = await ManpowerApplication.countDocuments({
      vacancy: job.title,
    });

    if (usedCount > 0) {
      await ManpowerJob.findByIdAndUpdate(jobId, { active: false });

      return res.json({
        message:
          "This job already has application records, so it was deactivated instead of permanently deleted.",
      });
    }

    await ManpowerJob.findByIdAndDelete(jobId);

    if (job?.image?.fileId) {
      await safeDeleteJobImage(job.image);
    }

    return res.json({
      message: "Job vacancy deleted successfully.",
    });
  } catch (error) {
    console.error("deleteManpowerJob error:", error);

    return res.status(500).json({
      message: "Failed to delete job vacancy.",
    });
  }
}

export async function listManpowerAdminAccounts(req, res) {
  try {
    const search = cleanText(req.query?.search);
    const vacancy = cleanText(req.query?.vacancy);
    const status = cleanText(req.query?.status).toLowerCase();
    const passwordState = cleanText(req.query?.passwordState).toLowerCase();

    const query = {};

    if (vacancy) {
      query.vacancy = vacancy;
    }

    if (status === "active") {
      query.active = true;
    } else if (status === "inactive") {
      query.active = false;
    }

    if (passwordState === "must_change") {
      query.mustChangePassword = true;
    } else if (passwordState === "ready") {
      query.mustChangePassword = false;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { firstName: regex },
        { middleName: regex },
        { lastName: regex },
        { companyEmail: regex },
        { personalEmail: regex },
        { contactNo: regex },
        { deploymentSite: regex },
      ];
    }

    const employees = await ManpowerEmployee.find(query)
      .sort({ createdAt: -1, lastName: 1, firstName: 1 })
      .lean();

    return res.json({
      employees: employees.map(buildEmployeeAccountPayload),
    });
  } catch (error) {
    console.error("listManpowerAdminAccounts error:", error);

    return res.status(500).json({
      message: "Failed to load accounts.",
    });
  }
}

export async function updateManpowerEmployeeAccountStatus(req, res) {
  try {
    const employeeId = cleanText(req.params?.employeeId);
    const active = req.body?.active;

    if (typeof active !== "boolean") {
      return res.status(400).json({
        message: "Active status must be true or false.",
      });
    }

    const employee = await ManpowerEmployee.findByIdAndUpdate(
      employeeId,
      { active },
      { new: true }
    ).lean();

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found.",
      });
    }

    return res.json({
      message: active
        ? "Employee account activated successfully."
        : "Employee account deactivated successfully.",
      employee: buildEmployeeAccountPayload(employee),
    });
  } catch (error) {
    console.error("updateManpowerEmployeeAccountStatus error:", error);

    return res.status(500).json({
      message: "Failed to update account status.",
    });
  }
}

export async function updateManpowerEmployeeDailyRate(req, res) {
  try {
    const employeeId = cleanText(req.params?.employeeId);
    const dailyRate = parseMoney(req.body?.dailyRate);

    if (!Number.isFinite(dailyRate) || dailyRate <= 0) {
      return res.status(400).json({
        message: "Please enter a valid daily rate.",
      });
    }

    const employee = await ManpowerEmployee.findByIdAndUpdate(
      employeeId,
      { dailyRate },
      { new: true, runValidators: true }
    ).lean();

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found.",
      });
    }

    return res.json({
      message: "Employee daily rate updated successfully.",
      employee: buildEmployeeAccountPayload(employee),
    });
  } catch (error) {
    console.error("updateManpowerEmployeeDailyRate error:", error);

    return res.status(500).json({
      message: error?.message || "Failed to update employee daily rate.",
    });
  }
}

export async function updateManpowerEmployeePasswordFlag(req, res) {
  try {
    const employeeId = cleanText(req.params?.employeeId);
    const mustChangePassword =
      typeof req.body?.mustChangePassword === "boolean"
        ? req.body.mustChangePassword
        : true;

    const employee = await ManpowerEmployee.findByIdAndUpdate(
      employeeId,
      { mustChangePassword },
      { new: true }
    ).lean();

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found.",
      });
    }

    return res.json({
      message: mustChangePassword
        ? "Employee password was marked for forced change."
        : "Employee password-change requirement was removed.",
      employee: buildEmployeeAccountPayload(employee),
    });
  } catch (error) {
    console.error("updateManpowerEmployeePasswordFlag error:", error);

    return res.status(500).json({
      message: "Failed to update password-change flag.",
    });
  }
}

export async function resetManpowerEmployeePassword(req, res) {
  try {
    const employeeId = cleanText(req.params?.employeeId);
    const manualPassword = cleanText(req.body?.newPassword);

    if (manualPassword && manualPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters.",
      });
    }

    const employee = await ManpowerEmployee.findById(employeeId).select(
      "+passwordHash +passwordChangeOtpHash +passwordChangeOtpExpiresAt"
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found.",
      });
    }

    const temporaryPassword = manualPassword || makeTempPassword(10);

    employee.passwordHash = await bcrypt.hash(temporaryPassword, 10);
    employee.mustChangePassword = true;
    employee.passwordChangeOtpHash = "";
    employee.passwordChangeOtpExpiresAt = null;

    await employee.save();

    return res.json({
      message: "Employee password reset successfully.",
      employee: buildEmployeeAccountPayload(employee),
      temporaryPassword,
    });
  } catch (error) {
    console.error("resetManpowerEmployeePassword error:", error);

    return res.status(500).json({
      message: "Failed to reset employee password.",
    });
  }
}
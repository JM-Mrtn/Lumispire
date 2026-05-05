import EnrollmentRequest from "../models/EnrollmentRequest.js";
import TrainingBatch from "../models/TrainingBatch.js";
import TrainingCourse from "../models/TrainingCourse.js";
import { uploadBufferToTrainingGridFS } from "../utils/trainingGridfs.js";
import { sendEnrollmentReceivedEmail } from "../utils/sendEnrollmentReceivedEmail.js";

function safeTrim(value = "") {
  return String(value ?? "").trim();
}

function normalizeEmail(value = "") {
  return safeTrim(value).toLowerCase();
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function getUploadedFile(req, fieldName) {
  return req?.files?.[fieldName]?.[0] || null;
}

function calculateAgeFromBirthDate(birthDate) {
  if (!birthDate) return null;

  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

function normalizeCourse(value = "") {
  return safeTrim(value);
}

function normalizeGender(value = "") {
  const clean = safeTrim(value);
  const allowed = ["Male", "Female"];
  return allowed.includes(clean) ? clean : "";
}

function normalizeStatus(value = "") {
  const clean = safeTrim(value);
  const allowed = ["Single", "Married", "Widowed", "Separated"];
  return allowed.includes(clean) ? clean : "";
}

async function countBatchReservedSlots(batchId) {
  return EnrollmentRequest.countDocuments({
    batchId,
    approvalStatus: { $in: ["pending", "approved"] },
  });
}

async function getValidatedOpenBatch(batchId = "", course = "") {
  const cleanId = safeTrim(batchId);
  if (!cleanId) {
    return { ok: false, status: 400, message: "Batch is required." };
  }

  const batch = await TrainingBatch.findById(cleanId);
  if (!batch || batch.isActive === false || batch.status !== "open" || batch.archivedAt) {
    return {
      ok: false,
      status: 400,
      message: "Selected batch is not open for enrollment.",
    };
  }

  const now = Date.now();
  const openAt = batch.enrollmentOpenAt ? new Date(batch.enrollmentOpenAt).getTime() : null;
  const closeAt = batch.enrollmentCloseAt ? new Date(batch.enrollmentCloseAt).getTime() : null;

  if (openAt && now < openAt) {
    return {
      ok: false,
      status: 400,
      message: "Enrollment for the selected batch has not opened yet.",
    };
  }

  if (closeAt && now > closeAt) {
    return {
      ok: false,
      status: 400,
      message: "Enrollment for the selected batch is already closed.",
    };
  }

  if (course && normalizeCourse(batch.course) !== normalizeCourse(course)) {
    return {
      ok: false,
      status: 400,
      message: "Selected batch does not match the chosen course.",
    };
  }

  const reservedSlots = await countBatchReservedSlots(batch._id);
  const maxTrainees = Number(batch.maxTrainees || 25);

  if (reservedSlots >= maxTrainees) {
    return {
      ok: false,
      status: 400,
      message: "Selected batch is already full.",
    };
  }

  return {
    ok: true,
    batch,
    reservedSlots,
    availableSlots: Math.max(0, maxTrainees - reservedSlots),
  };
}

export async function checkEnrollmentEmailAvailability(req, res) {
  try {
    const email = normalizeEmail(req.query.email || req.params.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        exists: false,
        available: false,
        message: "Email is required.",
      });
    }

    const existing = await EnrollmentRequest.findOne({ email }).select("_id email");

    return res.status(200).json({
      success: true,
      exists: Boolean(existing),
      available: !existing,
      message: existing
        ? "This email is already used."
        : "This email is available.",
    });
  } catch (error) {
    console.error("checkEnrollmentEmailAvailability error:", error);
    return res.status(500).json({
      success: false,
      exists: false,
      available: false,
      message: error.message || "Failed to check email.",
    });
  }
}

export async function createEnrollment(req, res) {
  try {
    const firstName = safeTrim(req.body.firstName);
    const lastName = safeTrim(req.body.lastName);
    const middleName = safeTrim(req.body.middleName);
    const phoneNumber = safeTrim(req.body.phoneNumber);
    const email = normalizeEmail(req.body.email);
    const birthDate = safeTrim(req.body.birthDate);
    const gender = normalizeGender(req.body.gender);
    const status = normalizeStatus(req.body.status);
    const completeAddress = safeTrim(req.body.completeAddress);
    const course = normalizeCourse(req.body.course);
    const batchId = safeTrim(req.body.batchId);
    const otherEducationText = safeTrim(req.body.otherEducationText);

    const educationAttainment = parseJsonArray(req.body.educationAttainment);
    const employmentStatus = parseJsonArray(req.body.employmentStatus);

    const birthCertificateFile = getUploadedFile(req, "birthCertificate");
    const form137138File = getUploadedFile(req, "form137138");
    const diplomaTorFile = getUploadedFile(req, "diplomaTor");
    const picture2x2File = getUploadedFile(req, "picture2x2");
    const marriageContractFile = getUploadedFile(req, "marriageContract");
    const applicationFormFile = getUploadedFile(req, "applicationForm");

    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !email ||
      !birthDate ||
      !gender ||
      !status ||
      !completeAddress ||
      !course ||
      !batchId
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields, including batch selection.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
        field: "email",
      });
    }

    if (!/^(09\d{9}|\+639\d{9})$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Use a valid PH mobile number like 09XXXXXXXXX or +639XXXXXXXXX.",
        field: "phoneNumber",
      });
    }

    const age = calculateAgeFromBirthDate(birthDate);
    if (age === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid birth date.",
        field: "birthDate",
      });
    }

    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: "Applicant must be 18 years old and above.",
        field: "birthDate",
      });
    }

    if (!educationAttainment.length) {
      return res.status(400).json({
        success: false,
        message: "Please select one educational attainment.",
        field: "educationAttainment",
      });
    }

    if (educationAttainment.length > 1) {
      return res.status(400).json({
        success: false,
        message: "Please select only one educational attainment.",
        field: "educationAttainment",
      });
    }

    if (
      educationAttainment.some((item) => String(item).toLowerCase() === "others") &&
      !otherEducationText
    ) {
      return res.status(400).json({
        success: false,
        message: "Please specify the other educational attainment.",
        field: "otherEducationText",
      });
    }

    if (!employmentStatus.length) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one employment status.",
        field: "employmentStatus",
      });
    }

    if (
      !birthCertificateFile ||
      !diplomaTorFile ||
      !picture2x2File ||
      !applicationFormFile
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload all required documents: Birth Certificate, Diploma/TOR, 2X2 Picture with Name, and Application Form.",
      });
    }

    const existingEmail = await EnrollmentRequest.findOne({ email }).select("_id email");
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "This email is already used for an enrollment.",
        field: "email",
      });
    }

    const batchCheck = await getValidatedOpenBatch(batchId, course);
    if (!batchCheck.ok) {
      return res.status(batchCheck.status).json({
        success: false,
        message: batchCheck.message,
        field: "batchId",
      });
    }

    const activeCourse = await TrainingCourse.findOne({ name: course, active: true }).lean();
    if (!activeCourse) {
      return res.status(400).json({
        success: false,
        message: "Selected course is not active or does not exist.",
        field: "course",
      });
    }

    const batch = batchCheck.batch;

    const [
      birthCertificate,
      form137138,
      diplomaTor,
      picture2x2,
      marriageContract,
      applicationForm,
    ] = await Promise.all([
      uploadBufferToTrainingGridFS(birthCertificateFile, "training/birth-certificate"),
      form137138File
        ? uploadBufferToTrainingGridFS(form137138File, "training/form-137-138")
        : Promise.resolve(null),
      uploadBufferToTrainingGridFS(diplomaTorFile, "training/diploma-tor"),
      uploadBufferToTrainingGridFS(picture2x2File, "training/picture-2x2"),
      marriageContractFile
        ? uploadBufferToTrainingGridFS(marriageContractFile, "training/marriage-contract")
        : Promise.resolve(null),
      uploadBufferToTrainingGridFS(applicationFormFile, "training/application-form"),
    ]);

    const enrollment = await EnrollmentRequest.create({
      course,
      batchId: batch._id,
      batchCode: batch.batchCode || "",
      batchName: batch.batchName || "",
      firstName,
      lastName,
      middleName,
      email,
      phoneNumber,
      birthDate,
      age,
      gender,
      status,
      completeAddress,
      educationAttainment,
      otherEducationText,
      employmentStatus,
      birthCertificate,
      form137138,
      diplomaTor,
      picture2x2,
      marriageContract,
      applicationForm,
      approvalStatus: "pending",
    });

    let emailNoticeSent = false;

    try {
      await sendEnrollmentReceivedEmail({
        to: email,
        firstName,
        course,
      });
      emailNoticeSent = true;
    } catch (mailError) {
      console.error("sendEnrollmentReceivedEmail error:", mailError);
    }

    return res.status(201).json({
      success: true,
      message: emailNoticeSent
        ? "Application submitted successfully. A confirmation email has been sent."
        : "Application submitted successfully.",
      emailNoticeSent,
      enrollmentId: enrollment._id,
      enrollment,
      batch: {
        _id: batch._id,
        batchCode: batch.batchCode,
        batchName: batch.batchName,
        sectionLabel: batch.sectionLabel || "Section 1",
        maxTrainees: Number(batch.maxTrainees || 25),
        availableSlots: batchCheck.availableSlots,
      },
    });
  } catch (error) {
    console.error("createEnrollment error:", error);

    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "This email is already used for an enrollment.",
        field: "email",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create enrollment.",
    });
  }
}
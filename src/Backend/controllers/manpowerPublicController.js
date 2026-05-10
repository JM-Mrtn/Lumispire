import ManpowerApplication from "../models/ManpowerApplication.js";
import ManpowerIdScreening from "../models/ManpowerIdScreening.js";
import { uploadBufferToManpowerGridFS } from "../utils/manpowerGridfs.js";
import { analyzeUploadedId } from "../utils/manpowerIdScreening.js";
import { analyzeResumeAgainstVacancy } from "../utils/manpowerResumeScreening.js";
import {
  REQUIRED_REQUIREMENTS,
  normalizeEmail,
  normalizeText,
} from "../utils/manpowerConstants.js";
import {
  findActiveManpowerJobByTitle,
  getActiveManpowerJobs,
} from "../utils/manpowerJobs.js";

function getUploadedFile(req, fieldName) {
  return req?.files?.[fieldName]?.[0] || null;
}

function digitsOnly(value = "") {
  return String(value || "").replace(/\D/g, "");
}

function sanitizeName(value = "") {
  return String(value || "")
    .replace(/[^A-Za-zÀ-ÿ\s.'-]/g, "")
    .trim();
}

function sanitizeAlphaText(value = "") {
  return String(value || "")
    .replace(/[^A-Za-zÀ-ÿ\s.'-]/g, "")
    .trim();
}

function sanitizeBirthPlace(value = "") {
  return String(value || "")
    .replace(/[^A-Za-zÀ-ÿ\s,.'-]/g, "")
    .trim();
}

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isValidName(value = "") {
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,49}$/.test(String(value || "").trim());
}

function isValidOptionalName(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return true;
  return isValidName(trimmed);
}

function isValidContact(value = "") {
  return /^\d{11}$/.test(String(value || "").trim());
}

function isValidTin(value = "") {
  return /^(\d{9}|\d{12})$/.test(String(value || "").trim());
}

function isValidBirthPlace(value = "") {
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s,.'-]{1,99}$/.test(
    String(value || "").trim()
  );
}

function isValidReligion(value = "") {
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,59}$/.test(
    String(value || "").trim()
  );
}

function isValidNationality(value = "") {
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,59}$/.test(
    String(value || "").trim()
  );
}

async function uploadRequirementFile(file, prefix) {
  if (!file?.buffer) return null;

  return uploadBufferToManpowerGridFS({
    buffer: file.buffer,
    filename: `${prefix}-${Date.now()}-${file.originalname}`,
    originalName: file.originalname || "",
    contentType: file.mimetype || "",
    mimetype: file.mimetype || "",
    size: Number(file.size || 0),
    folder: "manpower-requirements",
  });
}

function buildApplicationIdVerificationState(screening) {
  const reviewDecision = String(screening?.reviewDecision || "").trim();

  if (reviewDecision === "auto_approved") {
    return {
      idVerificationStatus: "verified",
      isIdentityVerified: true,
      idVerifiedAt: new Date(),
      idVerificationRemarks: "Automatically approved by ID screening.",
    };
  }

  if (reviewDecision === "auto_rejected") {
    return {
      idVerificationStatus: "pending",
      isIdentityVerified: false,
      idVerifiedAt: null,
      idVerificationRemarks:
        Array.isArray(screening?.reasons) && screening.reasons.length
          ? `Valid ID was flagged by AI screening and is pending HR review. ${screening.reasons.join(
              " "
            )}`
          : "Valid ID was flagged by AI screening and is pending HR review.",
    };
  }

  return {
    idVerificationStatus: "pending",
    isIdentityVerified: false,
    idVerifiedAt: null,
    idVerificationRemarks:
      "Valid ID uploaded successfully and is pending manual review.",
  };
}

function buildPublicJobImageUrl(image = {}) {
  const fileId = image?.fileId ? String(image.fileId) : "";
  return fileId ? `/manpower/files/${fileId}` : "";
}

export async function listManpowerVacancies(_req, res) {
  try {
    const jobs = await getActiveManpowerJobs();

    return res.json({
      vacancies: jobs.map((job) => job.title),
      jobs: jobs.map((job) => ({
        _id: job._id,
        title: job.title,
        description: job.description || "",
        qualifications: Array.isArray(job.qualifications)
          ? job.qualifications
          : [],
        image: job.image || null,
        imageUrl: buildPublicJobImageUrl(job.image),
        dailyRate: Number(job.dailyRate || 0),
        active: job.active !== false,
      })),
    });
  } catch (error) {
    console.error("listManpowerVacancies error:", error);
    return res.status(500).json({
      message: "Failed to load manpower job vacancies.",
    });
  }
}

export async function checkManpowerApplicationEmailAvailability(req, res) {
  try {
    const email = normalizeEmail(req.query?.email);

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const existingApplication = await ManpowerApplication.findOne({ email })
      .select("_id email")
      .lean();

    return res.json({
      available: !existingApplication,
    });
  } catch (error) {
    console.error("checkManpowerApplicationEmailAvailability error:", error);
    return res.status(500).json({
      message: "Failed to check email.",
    });
  }
}

export async function submitManpowerApplication(req, res) {
  try {
    const firstName = sanitizeName(req.body?.firstName);
    const lastName = sanitizeName(req.body?.lastName);
    const middleName = sanitizeName(req.body?.middleName);
    const email = normalizeEmail(req.body?.email);
    const completeAddress = normalizeText(req.body?.completeAddress);
    const contactNo = digitsOnly(req.body?.contactNo);
    const age = Number(req.body?.age || 0);
    const gender = normalizeText(req.body?.gender);
    const requestedVacancy = normalizeText(req.body?.vacancy);
    const selectedJob = await findActiveManpowerJobByTitle(requestedVacancy);
    const vacancy = selectedJob?.title || "";

    const sssNumber = digitsOnly(req.body?.sssNumber);
    const tinNumber = digitsOnly(req.body?.tinNumber);
    const pagibigNumber = digitsOnly(req.body?.pagibigNumber);
    const philhealthNumber = digitsOnly(req.body?.philhealthNumber);
    const birthPlace = sanitizeBirthPlace(req.body?.birthPlace);
    const civilStatus = normalizeText(req.body?.civilStatus);
    const religion = sanitizeAlphaText(req.body?.religion);
    const nationality = sanitizeAlphaText(req.body?.nationality);

    if (!vacancy) {
      return res.status(400).json({
        message: "Please select an active job vacancy.",
      });
    }

    if (!isValidName(firstName)) {
      return res.status(400).json({
        message:
          "First name must contain letters only and must not include numbers.",
      });
    }

    if (!isValidName(lastName)) {
      return res.status(400).json({
        message:
          "Last name must contain letters only and must not include numbers.",
      });
    }

    if (!isValidOptionalName(middleName)) {
      return res.status(400).json({
        message:
          "Middle name must contain letters only and must not include numbers.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (!completeAddress || completeAddress.length < 5) {
      return res.status(400).json({
        message: "Please enter a valid complete address.",
      });
    }

    if (!isValidContact(contactNo)) {
      return res.status(400).json({
        message: "Contact number must contain exactly 11 digits.",
      });
    }

    if (!Number.isFinite(age) || age < 18 || age > 60) {
      return res.status(400).json({
        message: "Age must be between 18 and 60.",
      });
    }

    if (!["Male", "Female", "Prefer not to say"].includes(gender)) {
      return res.status(400).json({
        message: "Please select a valid gender.",
      });
    }

    if (!/^\d{10}$/.test(sssNumber)) {
      return res.status(400).json({
        message: "SSS number must contain exactly 10 digits.",
      });
    }

    if (!isValidTin(tinNumber)) {
      return res.status(400).json({
        message: "TIN number must contain 9 or 12 digits.",
      });
    }

    if (!/^\d{12}$/.test(pagibigNumber)) {
      return res.status(400).json({
        message: "Pag-IBIG number must contain exactly 12 digits.",
      });
    }

    if (!/^\d{12}$/.test(philhealthNumber)) {
      return res.status(400).json({
        message: "PhilHealth number must contain exactly 12 digits.",
      });
    }

    if (!isValidBirthPlace(birthPlace)) {
      return res.status(400).json({
        message: "Birthplace must contain letters only and valid punctuation only.",
      });
    }

    if (
      ![
        "Single",
        "Married",
        "Widowed",
        "Divorced",
        "Separated",
        "Annulled",
      ].includes(civilStatus)
    ) {
      return res.status(400).json({
        message: "Please select a valid civil status.",
      });
    }

    if (!isValidReligion(religion)) {
      return res.status(400).json({
        message: "Religion must contain letters only and must not include numbers.",
      });
    }

    if (!isValidNationality(nationality)) {
      return res.status(400).json({
        message:
          "Nationality must contain letters only and must not include numbers.",
      });
    }

    const existingApplication = await ManpowerApplication.findOne({
      email,
    }).lean();

    if (existingApplication) {
      return res.status(409).json({
        message:
          "This email address has already been used for a manpower application.",
      });
    }

    const uploadedFiles = {};
    const missingRequirements = [];

    for (const key of REQUIRED_REQUIREMENTS) {
      const file = getUploadedFile(req, key);

      if (!file) {
        missingRequirements.push(key);
      } else {
        uploadedFiles[key] = file;
      }
    }

    if (missingRequirements.length > 0) {
      return res.status(400).json({
        message: `Missing requirement: ${missingRequirements[0]}.`,
      });
    }

    const validIdFile = uploadedFiles.validId;

    if (!validIdFile) {
      return res.status(400).json({
        message: "Please upload your Valid ID.",
      });
    }

    const supportedValidIdMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (
      !supportedValidIdMimeTypes.includes(
        String(validIdFile?.mimetype || "").toLowerCase()
      )
    ) {
      return res.status(400).json({
        message: "Valid ID must be uploaded as JPG, JPEG, PNG, WEBP, or PDF.",
      });
    }

    const resumeFile = uploadedFiles.resume;

    if (!resumeFile) {
      return res.status(400).json({
        message: "Please upload your Resume.",
      });
    }

    const supportedResumeMimeTypes = [
      "application/pdf",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !supportedResumeMimeTypes.includes(
        String(resumeFile?.mimetype || "").toLowerCase()
      )
    ) {
      return res.status(400).json({
        message: "Resume must be uploaded as PDF, TXT, JPG, PNG, or WEBP.",
      });
    }

    const screening = await analyzeUploadedId({
      file: validIdFile,
      idType: "",
    });

    const resumeScreening = await analyzeResumeAgainstVacancy({
      file: resumeFile,
      vacancy,
    });

    const applicantName = `${firstName} ${middleName || ""} ${lastName}`
      .replace(/\s+/g, " ")
      .trim();

    const requirements = {};

    for (const key of REQUIRED_REQUIREMENTS) {
      requirements[key] = await uploadRequirementFile(
        uploadedFiles[key],
        `manpower-${key}-${lastName}-${firstName}`
      );
    }

    const idScreeningDoc = await ManpowerIdScreening.create({
      applicantName,
      email,
      consentGiven: true,
      consentAt: new Date(),
      idType: "",
      image: requirements.validId,
      detectedIdType: screening?.matchedKeywords?.[0] || "unknown",
      status: screening.screeningStatus,
      reviewDecision: screening.reviewDecision,
      confidenceScore: screening.confidenceScore,
      extractedText: screening.extractedText,
      checks: screening.checks,
      matchedKeywords: screening.matchedKeywords,
      reasons: screening.reasons,
      aiConnected: screening.aiConnected,
      aiConnectionStatus: screening.aiConnectionStatus,
      aiProvider: screening.aiProvider,
      aiModel: screening.aiModel,
      aiCheckedAt: screening.aiCheckedAt,
      aiSummary: screening.aiSummary,
      aiDocumentType: screening.aiDocumentType,
      aiRiskLevel: screening.aiRiskLevel,
      aiDecision: screening.aiDecision,
      aiError: screening.aiError,
      aiRawResult: screening.aiRawResult,
    });

    const idState = buildApplicationIdVerificationState(screening);

    const application = await ManpowerApplication.create({
      vacancy,
      firstName,
      lastName,
      middleName,
      email,
      completeAddress,
      contactNo,
      age,
      gender,
      sssNumber,
      tinNumber,
      pagibigNumber,
      philhealthNumber,
      birthPlace,
      civilStatus,
      religion,
      nationality,

      idVerificationStatus: idState.idVerificationStatus,
      isIdentityVerified: idState.isIdentityVerified,
      idVerifiedAt: idState.idVerifiedAt,
      idVerificationRemarks: idState.idVerificationRemarks,

      idVerification: {
        screeningId: idScreeningDoc._id,
        screeningStatus: screening.screeningStatus,
        reviewDecision: screening.reviewDecision,
        confidenceScore: screening.confidenceScore,
        matchedKeywords: screening.matchedKeywords,
        reasons: screening.reasons,

        aiConnected: screening.aiConnected,
        aiConnectionStatus: screening.aiConnectionStatus,
        aiProvider: screening.aiProvider,
        aiModel: screening.aiModel,
        aiCheckedAt: screening.aiCheckedAt,
        aiSummary: screening.aiSummary,
        aiDocumentType: screening.aiDocumentType,
        aiRiskLevel: screening.aiRiskLevel,
        aiDecision: screening.aiDecision,
        aiError: screening.aiError,

        checkedAt: new Date(),
        reviewedByAdmin: false,
        reviewedAt: null,
        reviewRemarks: "",
      },

      resumeScreening,

      status: "PENDING",
      requirements,
    });

    return res.status(201).json({
      message:
        screening.reviewDecision === "auto_approved"
          ? "Application submitted successfully. Valid ID was automatically approved."
          : "Application submitted successfully. Valid ID is pending manual review.",
      application: {
        _id: application._id,
        vacancy: application.vacancy,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        status: application.status,
        idVerificationStatus: application.idVerificationStatus,
        isIdentityVerified: application.isIdentityVerified,
        idVerificationRemarks: application.idVerificationRemarks,
        idVerification: application.idVerification,
        resumeScreening: {
          score: application?.resumeScreening?.score || 0,
          status: application?.resumeScreening?.status || "not_screened",
          recommendation: application?.resumeScreening?.recommendation || "",
          summary: application?.resumeScreening?.summary || "",
        },
        createdAt: application.createdAt,
      },
      idScreening: {
        status: screening.screeningStatus,
        reviewDecision: screening.reviewDecision,
        confidenceScore: screening.confidenceScore,
        aiConnected: screening.aiConnected,
        aiConnectionStatus: screening.aiConnectionStatus,
        aiProvider: screening.aiProvider,
        aiModel: screening.aiModel,
        aiSummary: screening.aiSummary,
        aiRiskLevel: screening.aiRiskLevel,
        aiDecision: screening.aiDecision,
        aiError: screening.aiError,
      },
      resumeScreening: {
        score: application?.resumeScreening?.score || 0,
        status: application?.resumeScreening?.status || "not_screened",
        recommendation: application?.resumeScreening?.recommendation || "",
        summary: application?.resumeScreening?.summary || "",
      },
    });
  } catch (error) {
    console.error("submitManpowerApplication error:", error);

    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(409).json({
        message:
          "This email address has already been used for a manpower application.",
      });
    }

    return res.status(500).json({
      message: error?.message || "Failed to submit manpower application.",
    });
  }
}
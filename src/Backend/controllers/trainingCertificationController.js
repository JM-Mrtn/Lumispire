import crypto from "crypto";
import mongoose from "mongoose";
import TraineeUser from "../models/TraineeUser.js";
import TrainingBatch from "../models/TrainingBatch.js";
import TrainingCertificate from "../models/TrainingCertificate.js";
import {
  getCourseCertificatePreviewImage,
  normalizeTrainingCourseName,
} from "../utils/trainingProgressCatalog.js";
import { buildTraineeProgressSnapshot } from "../utils/trainingProgressService.js";

const ALLOW_CERTIFICATE_ISSUE_FOR_TESTING = true;

function getCourseKey(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (clean === "housekeeping") return "housekeeping";
  if (clean === "event management") return "event-management";
  return clean.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getCoursePrefix(courseKey = "") {
  if (courseKey === "event-management") return "EMS";
  if (courseKey === "housekeeping") return "HSK";
  return "CRT";
}

function getCourseDisplayName(course = "") {
  const normalized = normalizeTrainingCourseName(course || "");
  if (normalized === "Housekeeping") return "Housekeeping";
  if (normalized === "Event Management") return "Event Management";
  return normalized || "Training Course";
}

function getQualificationTitle(course = "") {
  const normalized = normalizeTrainingCourseName(course || "");
  if (normalized === "Housekeeping") return "Housekeeping NC II";
  if (normalized === "Event Management") return "Event Management Services";
  return normalized || "Training Qualification";
}

function buildCertificateNo(courseKey = "") {
  const prefix = getCoursePrefix(courseKey);
  const year = new Date().getFullYear();
  const random = String(Date.now()).slice(-6);
  return `TAMSI-${prefix}-${year}-${random}`;
}

function isFormattedSerialNo(value = "") {
  return /^\d{4}-\d{5}$/.test(String(value || "").trim());
}

function normalizeLegacySerialNo(value = "") {
  const clean = String(value || "").trim();

  if (isFormattedSerialNo(clean)) return clean;
  if (/^\d{9}$/.test(clean)) return `${clean.slice(0, 4)}-${clean.slice(4)}`;

  return "";
}

async function serialNoExists(serialNo = "", excludeId = null) {
  const clean = String(serialNo || "").trim();
  if (!clean) return false;

  const query = { serialNo: clean };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await TrainingCertificate.findOne(query).select("_id").lean();
  return Boolean(existing);
}

async function buildSerialNo(issuedAt = new Date(), excludeId = null) {
  const d = new Date(issuedAt);
  const year = Number.isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
  const prefix = String(year);

  const related = await TrainingCertificate.find({
    serialNo: new RegExp(`^${prefix}-?\\d{5}$`),
  })
    .select("serialNo")
    .lean();

  let maxNumber = 0;
  for (const item of related) {
    const raw = String(item?.serialNo || "").trim();
    const normalized = normalizeLegacySerialNo(raw);
    if (!normalized) continue;

    const sequence = Number(normalized.slice(-5));
    if (Number.isFinite(sequence) && sequence > maxNumber) {
      maxNumber = sequence;
    }
  }

  let nextNumber = maxNumber + 1;
  while (nextNumber <= 99999) {
    const candidate = `${prefix}-${String(nextNumber).padStart(5, "0")}`;
    if (!(await serialNoExists(candidate, excludeId))) {
      return candidate;
    }
    nextNumber += 1;
  }

  throw new Error(`Serial number limit reached for ${year}.`);
}

async function ensureCertificateSerialNo(certificate, issuedAt = null) {
  if (!certificate) return "";

  const current = String(certificate.serialNo || "").trim();
  const normalized = normalizeLegacySerialNo(current);

  if (normalized && normalized !== current) {
    const taken = await serialNoExists(normalized, certificate._id);
    if (!taken) {
      certificate.serialNo = normalized;
      await certificate.save();
      return normalized;
    }
  }

  if (isFormattedSerialNo(current)) {
    return current;
  }

  const generated = await buildSerialNo(
    issuedAt || certificate.issuedAt || new Date(),
    certificate._id
  );

  if (generated !== current) {
    certificate.serialNo = generated;
    await certificate.save();
  }

  return generated;
}


function escapeRegex(value = "") {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeCertificateSearchText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeCertificateNoPart(value = "") {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toUpperCase();
}

function buildCertificateNumberCondition(part = "", position = "first") {
  const clean = normalizeCertificateNoPart(part);
  if (!clean) return null;

  const escaped = escapeRegex(clean);
  const pattern = position === "last" ? `${escaped}$` : `^${escaped}`;

  return {
    $or: [
      { certificateNo: new RegExp(pattern, "i") },
      { serialNo: new RegExp(pattern, "i") },
    ],
  };
}

function buildCertificateSearchQuery(params = {}) {
  const firstName = normalizeCertificateSearchText(params.firstName);
  const lastName = normalizeCertificateSearchText(params.lastName);
  const firstFour = normalizeCertificateNoPart(params.firstFour);
  const lastFour = normalizeCertificateNoPart(params.lastFour);
  const verificationCode = normalizeCertificateSearchText(
    params.verificationCode || params.code
  ).toUpperCase();

  const andConditions = [{ status: "issued" }];

  if (firstName) {
    andConditions.push({ traineeName: new RegExp(escapeRegex(firstName), "i") });
  }

  if (lastName) {
    andConditions.push({ traineeName: new RegExp(escapeRegex(lastName), "i") });
  }

  if (verificationCode) {
    andConditions.push({ verificationCode });
  }

  const firstCondition = buildCertificateNumberCondition(firstFour, "first");
  if (firstCondition) andConditions.push(firstCondition);

  const lastCondition = buildCertificateNumberCondition(lastFour, "last");
  if (lastCondition) andConditions.push(lastCondition);

  return andConditions;
}

function buildVerificationCode() {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

function buildFullName(trainee = {}) {
  return [trainee.firstName || "", trainee.middleName || "", trainee.lastName || ""]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeCompetencyGroups(groups = []) {
  return (Array.isArray(groups) ? groups : []).map((group) => ({
    title: String(group?.title || "").trim(),
    items: Array.isArray(group?.items)
      ? group.items.map((item) => ({
          code: String(item?.code || "").trim(),
          label: String(item?.label || "").trim(),
          completed: item?.completed === true,
        }))
      : [],
  }));
}

function sanitizeCompletedCodes(codes = []) {
  return [
    ...new Set(
      (Array.isArray(codes) ? codes : [])
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    ),
  ];
}

function getVenuePreset(course = "") {
  const normalized = normalizeTrainingCourseName(course || "");

  if (normalized === "Housekeeping") {
    const trainingCenterName = "LTC TRAINING, ASSESSMENT AND MULTI SERVICES, INC.";
    const trainingVenueAddress =
      "Light Tower Center II, 2nd Floor, 5441 Curie St., Barangay Palanan, Makati City";

    return {
      trainingCenterName,
      trainingVenueAddress,
      trainingVenueDisplay: `${trainingCenterName} - ${trainingVenueAddress}`,
    };
  }

  if (normalized === "Event Management") {
    const trainingCenterName = "LTC TRAINING, ASSESSMENT AND MULTI SERVICES, INC.";
    const trainingVenueAddress =
      "Light Tower Center II, 2nd Floor, 5441 Curie St., Barangay Palanan, Makati City";

    return {
      trainingCenterName,
      trainingVenueAddress,
      trainingVenueDisplay: `${trainingCenterName} - ${trainingVenueAddress}`,
    };
  }

  return {
    trainingCenterName: "LTC TRAINING, ASSESSMENT AND MULTI SERVICES, INC.",
    trainingVenueAddress: "Makati City",
    trainingVenueDisplay:
      "LTC TRAINING, ASSESSMENT AND MULTI SERVICES, INC. - Makati City",
  };
}

async function getCertificateBatchForTrainee(trainee, course = "") {
  const normalizedCourse = normalizeTrainingCourseName(course || trainee?.course || "");

  if (trainee?.batchId && mongoose.Types.ObjectId.isValid(String(trainee.batchId))) {
    const directBatch = await TrainingBatch.findById(trainee.batchId)
      .select(
        "_id batchCode batchName sectionLabel startDate endDate course isActive status"
      )
      .lean();

    if (
      directBatch &&
      normalizeTrainingCourseName(directBatch.course || "") === normalizedCourse
    ) {
      return directBatch;
    }
  }

  return TrainingBatch.findOne({
    course: normalizedCourse,
    isActive: true,
    status: { $ne: "archived" },
  })
    .sort({ createdAt: -1 })
    .select("_id batchCode batchName sectionLabel startDate endDate course isActive status")
    .lean();
}

function buildCertificateSnapshot({
  trainee,
  course,
  courseKey,
  progress,
  batch,
  professor,
  issuedAt,
  completedAt,
  remarks,
}) {
  const venuePreset = getVenuePreset(course);

  return {
    traineeUserId: trainee._id,
    traineeName: buildFullName(trainee),
    traineeEmail: trainee.email || "",

    course,
    courseKey,
    courseDisplayName: getCourseDisplayName(course),
    qualificationTitle: getQualificationTitle(course),

    batchId: batch?._id || null,
    batchCode: batch?.batchCode || trainee?.batchCode || "",
    batchName: batch?.batchName || trainee?.batchName || "",
    sectionLabel: batch?.sectionLabel || "Section 1",

    trainingStartDate: batch?.startDate || null,
    trainingEndDate: batch?.endDate || completedAt || null,

    trainingCenterName: venuePreset.trainingCenterName,
    trainingVenueAddress: venuePreset.trainingVenueAddress,
    trainingVenueDisplay: venuePreset.trainingVenueDisplay,

    certificatePreviewImage: progress?.certificatePreviewImage || getCourseCertificatePreviewImage(course),

    learningPathLevel: trainee.learningPathLevel || "beginner",
    pretestScorePercent: Number(trainee.pretestScorePercent || 0),
    progressPercent: Number(progress?.progressPercent || 0),

    onlineClasses: {
      required: Number(progress?.onlineClasses?.required || 0),
      completed: Number(progress?.onlineClasses?.completed || 0),
      basis: String(progress?.onlineClasses?.basis || "").trim(),
    },

    faceToFaceClasses: {
      required: Number(progress?.faceToFaceClasses?.required || 0),
      completed: Number(progress?.faceToFaceClasses?.completed || 0),
      basis: String(progress?.faceToFaceClasses?.basis || "").trim(),
    },

    competencyCounts: {
      completed: Number(progress?.competencyCounts?.completed || 0),
      total: Number(progress?.competencyCounts?.total || 0),
    },

    completedCompetencyCodes: sanitizeCompletedCodes(
      progress?.completedCompetencyCodes || trainee?.completedCompetencyCodes || []
    ),

    competencyGroups: sanitizeCompetencyGroups(progress?.competencyGroups || []),

    issuedAt,
    completedAt,

    issuedByProfessorId: professor?.id || null,
    issuedByProfessorName: professor?.name || professor?.email || "",
    remarks,
  };
}

function mapCertificateResponse(certificate) {
  return {
    _id: certificate?._id,
    traineeUserId: certificate?.traineeUserId,
    traineeName: certificate?.traineeName || "",
    traineeEmail: certificate?.traineeEmail || "",
    course: certificate?.course || "",
    courseKey: certificate?.courseKey || "",
    courseDisplayName: certificate?.courseDisplayName || "",
    qualificationTitle: certificate?.qualificationTitle || "",
    certificateNo: certificate?.certificateNo || "",
    serialNo: certificate?.serialNo || "",
    verificationCode: certificate?.verificationCode || "",
    batchId: certificate?.batchId || null,
    batchCode: certificate?.batchCode || "",
    batchName: certificate?.batchName || "",
    sectionLabel: certificate?.sectionLabel || "",
    trainingStartDate: certificate?.trainingStartDate || null,
    trainingEndDate: certificate?.trainingEndDate || null,
    trainingCenterName: certificate?.trainingCenterName || "",
    trainingVenueAddress: certificate?.trainingVenueAddress || "",
    trainingVenueDisplay: certificate?.trainingVenueDisplay || "",
    certificatePreviewImage: certificate?.certificatePreviewImage || "",
    learningPathLevel: certificate?.learningPathLevel || "beginner",
    pretestScorePercent: Number(certificate?.pretestScorePercent || 0),
    progressPercent: Number(certificate?.progressPercent || 0),
    onlineClasses: certificate?.onlineClasses || {
      required: 0,
      completed: 0,
      basis: "",
    },
    faceToFaceClasses: certificate?.faceToFaceClasses || {
      required: 0,
      completed: 0,
      basis: "",
    },
    competencyCounts: certificate?.competencyCounts || {
      completed: 0,
      total: 0,
    },
    completedCompetencyCodes: Array.isArray(certificate?.completedCompetencyCodes)
      ? certificate.completedCompetencyCodes
      : [],
    competencyGroups: Array.isArray(certificate?.competencyGroups)
      ? certificate.competencyGroups
      : [],
    status: certificate?.status || "issued",
    issuedAt: certificate?.issuedAt || null,
    completedAt: certificate?.completedAt || null,
    issuedByProfessorName: certificate?.issuedByProfessorName || "",
    remarks: certificate?.remarks || "",
  };
}

export async function markTraineePassedByProfessor(req, res) {
  try {
    const traineeId = String(req.params?.traineeId || "").trim();
    const remarks = String(req.body?.remarks || "").trim().slice(0, 300);

    const trainee = await TraineeUser.findById(traineeId).select(
      [
        "firstName",
        "lastName",
        "middleName",
        "email",
        "course",
        "batchId",
        "batchCode",
        "batchName",
        "trainingStatus",
        "pretestStatus",
        "pretestScorePercent",
        "pretestLastTakenAt",
        "learningPathLevel",
        "certificateId",
        "certificateStatus",
        "completedCompetencyCodes",
        "passedAt",
        "completedAt",
      ].join(" ")
    );

    if (!trainee) {
      return res.status(404).json({
        success: false,
        message: "Trainee not found.",
      });
    }

    const allowedCourses = Array.isArray(req.professor?.courseAssignments)
      ? req.professor.courseAssignments
          .map(normalizeTrainingCourseName)
          .filter(Boolean)
      : [];

    const traineeCourse = normalizeTrainingCourseName(trainee.course || "");
    if (!allowedCourses.includes(traineeCourse)) {
      return res.status(403).json({
        success: false,
        message: "You can only mark trainees as passed for your assigned course.",
      });
    }

    const progress = await buildTraineeProgressSnapshot(trainee);

    if (!ALLOW_CERTIFICATE_ISSUE_FOR_TESTING && !progress.isEligibleForCompletion) {
      return res.status(400).json({
        success: false,
        message: "Trainee is not yet eligible for completion.",
        incompleteReasons: progress.incompleteReasons,
        progress,
      });
    }

    const now = new Date();
    const completionDate = trainee.completedAt || trainee.passedAt || now;
    const courseKey = getCourseKey(traineeCourse);
    const batch = await getCertificateBatchForTrainee(trainee, traineeCourse);

    let certificate = await TrainingCertificate.findOne({
      traineeUserId: trainee._id,
      courseKey,
      status: "issued",
    });

    const snapshot = buildCertificateSnapshot({
      trainee,
      course: traineeCourse,
      courseKey,
      progress,
      batch,
      professor: req.professor || {},
      issuedAt: certificate?.issuedAt || now,
      completedAt: completionDate,
      remarks,
    });

    if (!certificate) {
      certificate = await TrainingCertificate.create({
        ...snapshot,
        certificateNo: buildCertificateNo(courseKey),
        serialNo: await buildSerialNo(now),
        verificationCode: buildVerificationCode(),
        status: "issued",
      });
    } else {
      certificate.traineeName = snapshot.traineeName;
      certificate.traineeEmail = snapshot.traineeEmail;
      certificate.course = snapshot.course;
      certificate.courseKey = snapshot.courseKey;
      certificate.courseDisplayName = snapshot.courseDisplayName;
      certificate.qualificationTitle = snapshot.qualificationTitle;

      certificate.batchId = snapshot.batchId;
      certificate.batchCode = snapshot.batchCode;
      certificate.batchName = snapshot.batchName;
      certificate.sectionLabel = snapshot.sectionLabel;

      certificate.trainingStartDate = snapshot.trainingStartDate;
      certificate.trainingEndDate = snapshot.trainingEndDate;

      certificate.trainingCenterName = snapshot.trainingCenterName;
      certificate.trainingVenueAddress = snapshot.trainingVenueAddress;
      certificate.trainingVenueDisplay = snapshot.trainingVenueDisplay;

      certificate.certificatePreviewImage = snapshot.certificatePreviewImage;

      certificate.learningPathLevel = snapshot.learningPathLevel;
      certificate.pretestScorePercent = snapshot.pretestScorePercent;
      certificate.progressPercent = snapshot.progressPercent;

      certificate.onlineClasses = snapshot.onlineClasses;
      certificate.faceToFaceClasses = snapshot.faceToFaceClasses;

      certificate.competencyCounts = snapshot.competencyCounts;
      certificate.completedCompetencyCodes = snapshot.completedCompetencyCodes;
      certificate.competencyGroups = snapshot.competencyGroups;

      certificate.completedAt = snapshot.completedAt;
      certificate.issuedByProfessorId = snapshot.issuedByProfessorId;
      certificate.issuedByProfessorName = snapshot.issuedByProfessorName;
      certificate.remarks = snapshot.remarks;
      certificate.status = "issued";

      await certificate.save();
      await ensureCertificateSerialNo(certificate, certificate.issuedAt || now);
    }

    trainee.trainingStatus = "Completed";
    trainee.passedAt = now;
    trainee.completedAt = completionDate;
    trainee.certificateStatus = "issued";
    trainee.certificateId = certificate._id;
    await trainee.save();

    return res.json({
      success: true,
      message: ALLOW_CERTIFICATE_ISSUE_FOR_TESTING
        ? "Certificate issued successfully in testing mode."
        : "Trainee marked as completed and certificate issued successfully.",
      trainee: {
        _id: trainee._id,
        trainingStatus: trainee.trainingStatus,
        passedAt: trainee.passedAt,
        completedAt: trainee.completedAt,
        certificateStatus: trainee.certificateStatus,
        certificateId: trainee.certificateId,
      },
      certificate: mapCertificateResponse(certificate),
      progress,
      testingMode: ALLOW_CERTIFICATE_ISSUE_FOR_TESTING,
    });
  } catch (error) {
    console.error("markTraineePassedByProfessor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark trainee as passed.",
    });
  }
}

export async function getMyTrainingCertificate(req, res) {
  try {
    const traineeId = String(req.trainee?.id || "").trim();

    const trainee = await TraineeUser.findById(traineeId).select(
      "firstName lastName middleName email course trainingStatus certificateStatus certificateId"
    );

    if (!trainee) {
      return res.status(404).json({
        success: false,
        message: "Trainee account not found.",
      });
    }

    if (!trainee.certificateId) {
      return res.status(404).json({
        success: false,
        message: "No certificate found for this trainee yet.",
      });
    }

    const certificate = await TrainingCertificate.findById(trainee.certificateId);
    if (!certificate || certificate.status !== "issued") {
      return res.status(404).json({
        success: false,
        message: "Certificate is not available.",
      });
    }

    await ensureCertificateSerialNo(certificate, certificate.issuedAt || new Date());

    return res.json({
      success: true,
      certificate: mapCertificateResponse(certificate),
      certificatePreviewImage:
        certificate?.certificatePreviewImage ||
        getCourseCertificatePreviewImage(trainee.course),
    });
  } catch (error) {
    console.error("getMyTrainingCertificate error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load certificate.",
    });
  }
}


export async function searchTrainingCertificates(req, res) {
  try {
    const searchValues = {
      firstName: req.query?.firstName,
      lastName: req.query?.lastName,
      firstFour: req.query?.firstFour,
      lastFour: req.query?.lastFour,
      verificationCode: req.query?.verificationCode || req.query?.code,
    };

    const hasSearchValue = Object.values(searchValues).some((value) =>
      normalizeCertificateSearchText(value)
    );

    if (!hasSearchValue) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Please provide a name or certificate number filter.",
        certificates: [],
      });
    }

    const andConditions = buildCertificateSearchQuery(searchValues);

    const certificates = await TrainingCertificate.find({ $and: andConditions })
      .sort({ issuedAt: -1, createdAt: -1 })
      .limit(25);

    for (const certificate of certificates) {
      await ensureCertificateSerialNo(certificate, certificate.issuedAt || new Date());
    }

    return res.status(200).json({
      success: true,
      valid: certificates.length > 0,
      count: certificates.length,
      certificates: certificates.map(mapCertificateResponse),
      message: certificates.length
        ? "Certificate record found."
        : "No matching certificate record was found.",
    });
  } catch (error) {
    console.error("searchTrainingCertificates error:", error);
    return res.status(500).json({
      success: false,
      valid: false,
      message: "Failed to search certificates.",
      certificates: [],
    });
  }
}

export async function verifyTrainingCertificate(req, res) {
  try {
    const verificationCode = String(
      req.params?.verificationCode || req.query?.code || ""
    )
      .trim()
      .toUpperCase();

    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required.",
      });
    }

    const certificate = await TrainingCertificate.findOne({
      verificationCode,
      status: "issued",
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or invalid.",
      });
    }

    return res.json({
      success: true,
      valid: true,
      certificate: mapCertificateResponse(certificate),
      certificatePreviewImage:
        certificate?.certificatePreviewImage ||
        getCourseCertificatePreviewImage(certificate.course),
    });
  } catch (error) {
    console.error("verifyTrainingCertificate error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify certificate.",
    });
  }
}
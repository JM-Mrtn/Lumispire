import mongoose from "mongoose";
import TrainingBatch from "../models/TrainingBatch.js";
import TrainingCourse from "../models/TrainingCourse.js";
import EnrollmentRequest from "../models/EnrollmentRequest.js";
import TraineeUser from "../models/TraineeUser.js";

function clean(value = "") {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeCourseName(value = "") {
  return clean(value);
}

function getCoursePrefix(course = "") {
  const normalized = normalizeCourseName(course);
  if (normalized.toLowerCase() === "housekeeping") return "HSK";
  if (normalized.toLowerCase() === "event management") return "EMS";
  const letters = normalized
    .split(/\s+/)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return (letters || "BAT").slice(0, 4);
}

function getProfessorAllowedCourses(req) {
  const raw = Array.isArray(req?.professor?.courseAssignments)
    ? req.professor.courseAssignments
    : [];
  return [...new Set(raw.map((item) => normalizeCourseName(item)).filter(Boolean))];
}

function isWithinOpenWindow(batch) {
  const now = Date.now();
  const openAt = batch?.enrollmentOpenAt ? new Date(batch.enrollmentOpenAt).getTime() : null;
  const closeAt = batch?.enrollmentCloseAt ? new Date(batch.enrollmentCloseAt).getTime() : null;

  if (openAt && now < openAt) return false;
  if (closeAt && now > closeAt) return false;
  return true;
}

function normalizeBatchView(value = "") {
  const cleanValue = String(value || "").trim().toLowerCase();
  if (["current", "past", "all"].includes(cleanValue)) return cleanValue;
  return "current";
}

function isPastBatch(batch) {
  return batch?.status === "archived" || batch?.isActive === false;
}

async function countReservedSlots(batchId) {
  return EnrollmentRequest.countDocuments({
    batchId,
    approvalStatus: { $in: ["pending", "approved"] },
  });
}

async function countActiveTrainees(batchId) {
  return TraineeUser.countDocuments({
    batchId,
    active: { $ne: false },
  });
}

function mapBatch(batch, reservedSlots = 0, traineeCount = 0) {
  const maxTrainees = Number(batch?.maxTrainees || 25);
  const availableSlots = Math.max(0, maxTrainees - Number(reservedSlots || 0));

  return {
    _id: batch?._id,
    batchName: batch?.batchName || "",
    batchCode: batch?.batchCode || "",
    course: batch?.course || "",
    description: batch?.description || "",
    sectionLabel: batch?.sectionLabel || "Section 1",
    maxTrainees,
    reservedSlots: Number(reservedSlots || 0),
    traineeCount: Number(traineeCount || 0),
    availableSlots,
    isFull: availableSlots <= 0,
    startDate: batch?.startDate || null,
    endDate: batch?.endDate || null,
    enrollmentOpenAt: batch?.enrollmentOpenAt || null,
    enrollmentCloseAt: batch?.enrollmentCloseAt || null,
    status: batch?.status || "closed",
    isActive: batch?.isActive !== false,
    isPast: isPastBatch(batch),
    isOpenNow:
      batch?.status === "open" &&
      batch?.isActive !== false &&
      isWithinOpenWindow(batch),
    createdAt: batch?.createdAt || null,
    updatedAt: batch?.updatedAt || null,
    archivedAt: batch?.archivedAt || null,
    createdByProfessorId: batch?.createdByProfessorId || null,
    createdByProfessorName: batch?.createdByProfessorName || "",
    createdByAdminId: batch?.createdByAdminId || "",
    createdByAdminName: batch?.createdByAdminName || "",
    lastOpenedAt: batch?.lastOpenedAt || null,
    lastClosedAt: batch?.lastClosedAt || null,
  };
}

async function mapBatchWithCounts(batch) {
  const [reservedSlots, traineeCount] = await Promise.all([
    countReservedSlots(batch._id),
    countActiveTrainees(batch._id),
  ]);

  return mapBatch(batch, reservedSlots, traineeCount);
}

function validateDate(value, label) {
  if (!value) return { ok: true, value: null };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, message: `Invalid ${label}.` };
  }
  return { ok: true, value: parsed };
}

async function generateBatchCode(course) {
  const prefix = getCoursePrefix(course);
  const year = new Date().getFullYear();
  const start = new Date(`${year}-01-01T00:00:00.000Z`);
  const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const count = await TrainingBatch.countDocuments({
    course,
    createdAt: { $gte: start, $lt: end },
  });

  return `TAMSI-${prefix}-${year}-${String(count + 1).padStart(3, "0")}`;
}

function buildBatchQuery({ course = "", view = "current", allowedCourses = [] } = {}) {
  const normalizedCourse = normalizeCourseName(course === "All" ? "" : course);
  const normalizedView = normalizeBatchView(view);
  const query = {};

  if (normalizedCourse) {
    query.course = normalizedCourse;
  } else if (Array.isArray(allowedCourses) && allowedCourses.length) {
    query.course = { $in: allowedCourses };
  }

  if (normalizedView === "current") {
    query.isActive = true;
    query.status = { $ne: "archived" };
  } else if (normalizedView === "past") {
    query.$or = [{ status: "archived" }, { isActive: false }];
  }

  return { query, view: normalizedView };
}

async function getActiveCourseByName(courseName) {
  return TrainingCourse.findOne({ name: normalizeCourseName(courseName), active: true }).lean();
}

function validateBatchPayload(body = {}, { partial = false } = {}) {
  const batchName = clean(body.batchName);
  const course = normalizeCourseName(body.course);
  const description = clean(body.description);
  const requestedStatus = clean(body.status || "open").toLowerCase();
  const maxTrainees = Math.min(25, Math.max(1, Number(body.maxTrainees || 25)));

  if (!partial && (!batchName || !course)) {
    return { ok: false, message: "Batch name and course are required." };
  }

  if (requestedStatus && !["open", "closed", "archived"].includes(requestedStatus)) {
    return { ok: false, message: "Invalid batch status." };
  }

  const startDateCheck = validateDate(body.startDate, "start date");
  if (!startDateCheck.ok) return startDateCheck;

  const endDateCheck = validateDate(body.endDate, "end date");
  if (!endDateCheck.ok) return endDateCheck;

  const openAtCheck = validateDate(body.enrollmentOpenAt, "enrollment open date/time");
  if (!openAtCheck.ok) return openAtCheck;

  const closeAtCheck = validateDate(body.enrollmentCloseAt, "enrollment close date/time");
  if (!closeAtCheck.ok) return closeAtCheck;

  if (startDateCheck.value && endDateCheck.value && endDateCheck.value < startDateCheck.value) {
    return { ok: false, message: "End date must be later than or equal to the start date." };
  }

  if (openAtCheck.value && closeAtCheck.value && closeAtCheck.value <= openAtCheck.value) {
    return { ok: false, message: "Enrollment close date/time must be later than the open date/time." };
  }

  return {
    ok: true,
    batchName,
    course,
    description,
    status: requestedStatus === "archived" ? "archived" : requestedStatus === "closed" ? "closed" : "open",
    maxTrainees,
    startDate: startDateCheck.value,
    endDate: endDateCheck.value,
    enrollmentOpenAt: openAtCheck.value,
    enrollmentCloseAt: closeAtCheck.value,
  };
}

async function assertNoOtherCurrentBatch(course, excludeId = null) {
  const query = {
    course,
    isActive: true,
    status: { $ne: "archived" },
  };

  if (excludeId) query._id = { $ne: excludeId };

  return TrainingBatch.findOne(query).lean();
}

export async function listAdminBatches(req, res) {
  try {
    const { course = "", view = "current" } = req.query || {};
    const { query, view: normalizedView } = buildBatchQuery({ course, view });

    const sort =
      normalizedView === "past"
        ? { archivedAt: -1, updatedAt: -1, createdAt: -1 }
        : { createdAt: -1 };

    const batches = await TrainingBatch.find(query).sort(sort).lean();
    const mapped = await Promise.all(batches.map(mapBatchWithCounts));

    return res.status(200).json({
      success: true,
      view: normalizedView,
      batches: mapped,
    });
  } catch (error) {
    console.error("listAdminBatches error:", error);
    return res.status(500).json({ success: false, message: "Failed to load batches." });
  }
}

export async function createAdminBatch(req, res) {
  try {
    const payload = validateBatchPayload(req.body || {});
    if (!payload.ok) {
      return res.status(400).json({ success: false, message: payload.message });
    }

    const course = await getActiveCourseByName(payload.course);
    if (!course) {
      return res.status(400).json({ success: false, message: "Selected course is not active or does not exist." });
    }

    const existingCurrentBatch = await assertNoOtherCurrentBatch(payload.course);
    if (existingCurrentBatch) {
      return res.status(400).json({
        success: false,
        message: "There is already a current batch for this course. Move it to Past Batches first before creating a new one.",
      });
    }

    const batchCode = await generateBatchCode(payload.course);
    const status = payload.status === "archived" ? "closed" : payload.status;

    const batch = await TrainingBatch.create({
      batchName: payload.batchName,
      batchCode,
      course: payload.course,
      description: payload.description,
      sectionLabel: "Section 1",
      maxTrainees: payload.maxTrainees,
      startDate: payload.startDate,
      endDate: payload.endDate,
      enrollmentOpenAt: payload.enrollmentOpenAt,
      enrollmentCloseAt: payload.enrollmentCloseAt,
      status,
      isActive: true,
      archivedAt: null,
      createdByAdminId: req.trainingAdmin?.id || "training-admin",
      createdByAdminName: req.trainingAdmin?.username || "Training Admin",
      lastOpenedAt: status === "open" ? new Date() : null,
      lastClosedAt: status === "closed" ? new Date() : null,
    });

    return res.status(201).json({
      success: true,
      message: status === "open" ? "Batch created and enrollment opened successfully." : "Batch created successfully.",
      batch: mapBatch(batch, 0, 0),
    });
  } catch (error) {
    console.error("createAdminBatch error:", error);
    return res.status(500).json({ success: false, message: error?.message || "Failed to create batch." });
  }
}

export async function updateAdminBatch(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid batch id." });
    }

    const batch = await TrainingBatch.findById(id);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }

    const payload = validateBatchPayload(
      {
        batchName: req.body?.batchName ?? batch.batchName,
        course: req.body?.course ?? batch.course,
        description: req.body?.description ?? batch.description,
        startDate: req.body?.startDate ?? batch.startDate,
        endDate: req.body?.endDate ?? batch.endDate,
        enrollmentOpenAt: req.body?.enrollmentOpenAt ?? batch.enrollmentOpenAt,
        enrollmentCloseAt: req.body?.enrollmentCloseAt ?? batch.enrollmentCloseAt,
        status: req.body?.status ?? batch.status,
        maxTrainees: req.body?.maxTrainees ?? batch.maxTrainees,
      },
      { partial: true }
    );

    if (!payload.ok) {
      return res.status(400).json({ success: false, message: payload.message });
    }

    const course = await getActiveCourseByName(payload.course);
    if (!course) {
      return res.status(400).json({ success: false, message: "Selected course is not active or does not exist." });
    }

    if (payload.status !== "archived") {
      const existingCurrentBatch = await assertNoOtherCurrentBatch(payload.course, batch._id);
      if (existingCurrentBatch) {
        return res.status(400).json({
          success: false,
          message: "Another current batch already exists for this course. Archive it first before updating this batch as current.",
        });
      }
    }

    batch.batchName = payload.batchName || batch.batchName;
    batch.course = payload.course || batch.course;
    batch.description = payload.description;
    batch.maxTrainees = payload.maxTrainees;
    batch.startDate = payload.startDate;
    batch.endDate = payload.endDate;
    batch.enrollmentOpenAt = payload.enrollmentOpenAt;
    batch.enrollmentCloseAt = payload.enrollmentCloseAt;

    if (payload.status === "archived") {
      batch.status = "archived";
      batch.isActive = false;
      batch.archivedAt = batch.archivedAt || new Date();
      batch.lastClosedAt = new Date();
    } else {
      batch.status = payload.status;
      batch.isActive = true;
      batch.archivedAt = null;
      if (payload.status === "open") batch.lastOpenedAt = new Date();
      if (payload.status === "closed") batch.lastClosedAt = new Date();
    }

    await batch.save();
    const mapped = await mapBatchWithCounts(batch);

    return res.status(200).json({
      success: true,
      message: "Batch updated successfully.",
      batch: mapped,
    });
  } catch (error) {
    console.error("updateAdminBatch error:", error);
    return res.status(500).json({ success: false, message: "Failed to update batch." });
  }
}

export async function updateAdminBatchStatus(req, res) {
  try {
    const requestedStatus = clean(req.body?.status).toLowerCase();
    if (!["open", "closed", "archived"].includes(requestedStatus)) {
      return res.status(400).json({ success: false, message: "Invalid batch status." });
    }

    const batch = await TrainingBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }

    if (requestedStatus === "archived") {
      batch.status = "archived";
      batch.isActive = false;
      batch.archivedAt = new Date();
      batch.lastClosedAt = new Date();
    } else {
      const currentOtherBatch = await assertNoOtherCurrentBatch(batch.course, batch._id);
      if (currentOtherBatch) {
        return res.status(400).json({
          success: false,
          message: "Another current batch already exists for this course. Archive it first before reopening this batch.",
        });
      }

      batch.isActive = true;
      batch.archivedAt = null;
      batch.status = requestedStatus;
      if (requestedStatus === "open") batch.lastOpenedAt = new Date();
      if (requestedStatus === "closed") batch.lastClosedAt = new Date();
    }

    await batch.save();
    const mapped = await mapBatchWithCounts(batch);

    return res.status(200).json({
      success: true,
      message: requestedStatus === "archived" ? "Batch moved to Past Batches successfully." : `Batch status updated to ${batch.status}.`,
      batch: mapped,
    });
  } catch (error) {
    console.error("updateAdminBatchStatus error:", error);
    return res.status(500).json({ success: false, message: "Failed to update batch status." });
  }
}

export async function deleteAdminBatch(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid batch id." });
    }

    const batch = await TrainingBatch.findById(id);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }

    const [reservedSlots, traineeCount] = await Promise.all([
      countReservedSlots(batch._id),
      countActiveTrainees(batch._id),
    ]);

    if (reservedSlots || traineeCount) {
      batch.status = "archived";
      batch.isActive = false;
      batch.archivedAt = new Date();
      batch.lastClosedAt = new Date();
      await batch.save();

      return res.status(200).json({
        success: true,
        message: "Batch has enrollments/trainees, so it was moved to Past Batches instead of deleted.",
        batch: mapBatch(batch, reservedSlots, traineeCount),
      });
    }

    await batch.deleteOne();
    return res.status(200).json({ success: true, message: "Batch deleted successfully." });
  } catch (error) {
    console.error("deleteAdminBatch error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete batch." });
  }
}

export async function listProfessorBatches(req, res) {
  try {
    const allowedCourses = getProfessorAllowedCourses(req);
    if (!allowedCourses.length) {
      return res.status(403).json({ success: false, message: "Professor has no assigned course." });
    }

    const requestedCourse = normalizeCourseName(req.query?.course || "");
    if (requestedCourse && !allowedCourses.includes(requestedCourse)) {
      return res.status(403).json({ success: false, message: "You are not allowed to view batches for this course." });
    }

    const { query, view } = buildBatchQuery({
      course: requestedCourse,
      view: req.query?.view || "current",
      allowedCourses,
    });

    const sort = view === "past" ? { archivedAt: -1, updatedAt: -1, createdAt: -1 } : { createdAt: -1 };
    const batches = await TrainingBatch.find(query).sort(sort).lean();
    const mapped = await Promise.all(batches.map(mapBatchWithCounts));

    return res.status(200).json({ success: true, allowedCourses, view, batches: mapped });
  } catch (error) {
    console.error("listProfessorBatches error:", error);
    return res.status(500).json({ success: false, message: "Failed to load batches." });
  }
}

export async function createProfessorBatch(_req, res) {
  return res.status(403).json({
    success: false,
    message: "Batch creation was moved to the Training Admin side.",
  });
}

export async function updateProfessorBatchStatus(_req, res) {
  return res.status(403).json({
    success: false,
    message: "Batch status updates were moved to the Training Admin side.",
  });
}

export async function listOpenEnrollmentBatches(_req, res) {
  try {
    const now = new Date();

    const batches = await TrainingBatch.find({
      isActive: true,
      status: "open",
      archivedAt: null,
      $and: [
        { $or: [{ enrollmentOpenAt: null }, { enrollmentOpenAt: { $lte: now } }] },
        { $or: [{ enrollmentCloseAt: null }, { enrollmentCloseAt: { $gte: now } }] },
      ],
    })
      .sort({ course: 1, createdAt: -1 })
      .lean();

    const mapped = await Promise.all(batches.map(mapBatchWithCounts));

    return res.status(200).json({
      success: true,
      batches: mapped.filter((batch) => !batch.isFull),
    });
  } catch (error) {
    console.error("listOpenEnrollmentBatches error:", error);
    return res.status(500).json({ success: false, message: "Failed to load open enrollment batches." });
  }
}

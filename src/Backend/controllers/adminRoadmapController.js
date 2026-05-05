import mongoose from "mongoose";
import TrainingCourse from "../models/TrainingCourse.js";
import {
  buildDefaultRoadmapForCourse,
  normalizeRoadmapCompetencyGroups,
} from "../utils/trainingRoadmapService.js";

function clean(value = "") {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function isValidObjectId(value = "") {
  return mongoose.Types.ObjectId.isValid(String(value || ""));
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : fallback;
}

function mapCourseRoadmap(course) {
  const defaults = buildDefaultRoadmapForCourse(course?.name || "Training");
  const groups = Array.isArray(course?.competencyGroups) && course.competencyGroups.length
    ? course.competencyGroups
    : defaults.competencyGroups;

  return {
    course: {
      _id: course?._id,
      name: course?.name || "",
      slug: course?.slug || "",
      active: course?.active !== false,
    },
    requiredOnlineClasses: safeNumber(course?.requiredOnlineClasses, defaults.requiredOnlineClasses),
    requiredFaceToFaceClasses: safeNumber(course?.requiredFaceToFaceClasses, defaults.requiredFaceToFaceClasses),
    onlineAttendanceBasis: course?.onlineAttendanceBasis || defaults.onlineAttendanceBasis,
    faceToFaceAttendanceBasis: course?.faceToFaceAttendanceBasis || defaults.faceToFaceAttendanceBasis,
    certificatePreviewImage: course?.certificatePreviewImage || defaults.certificatePreviewImage || "",
    progressWeights: {
      online: safeNumber(course?.progressWeights?.online, defaults.progressWeights.online),
      faceToFace: safeNumber(course?.progressWeights?.faceToFace, defaults.progressWeights.faceToFace),
      competencies: safeNumber(course?.progressWeights?.competencies, defaults.progressWeights.competencies),
      pretest: safeNumber(course?.progressWeights?.pretest, defaults.progressWeights.pretest),
    },
    competencyGroups: normalizeRoadmapCompetencyGroups(groups, course?.name || "Training"),
  };
}

async function getCourseOr404(req, res) {
  const { courseId = "" } = req.params || {};
  if (!isValidObjectId(courseId)) {
    res.status(400).json({ success: false, message: "Invalid course id." });
    return null;
  }

  const course = await TrainingCourse.findById(courseId);
  if (!course) {
    res.status(404).json({ success: false, message: "Course not found." });
    return null;
  }

  return course;
}

export async function getAdminCourseRoadmap(req, res) {
  try {
    const course = await getCourseOr404(req, res);
    if (!course) return null;

    const defaults = buildDefaultRoadmapForCourse(course.name);
    if (!Array.isArray(course.competencyGroups) || course.competencyGroups.length === 0) {
      course.requiredOnlineClasses = safeNumber(course.requiredOnlineClasses, defaults.requiredOnlineClasses);
      course.requiredFaceToFaceClasses = safeNumber(course.requiredFaceToFaceClasses, defaults.requiredFaceToFaceClasses);
      course.onlineAttendanceBasis = course.onlineAttendanceBasis || defaults.onlineAttendanceBasis;
      course.faceToFaceAttendanceBasis = course.faceToFaceAttendanceBasis || defaults.faceToFaceAttendanceBasis;
      course.certificatePreviewImage = course.certificatePreviewImage || defaults.certificatePreviewImage || "";
      course.progressWeights = course.progressWeights || defaults.progressWeights;
      course.competencyGroups = defaults.competencyGroups;
      await course.save();
    }

    return res.status(200).json({
      success: true,
      roadmap: mapCourseRoadmap(course),
    });
  } catch (error) {
    console.error("getAdminCourseRoadmap error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load course roadmap.",
    });
  }
}

export async function updateAdminCourseRoadmap(req, res) {
  try {
    const course = await getCourseOr404(req, res);
    if (!course) return null;

    const defaults = buildDefaultRoadmapForCourse(course.name);
    const groups = normalizeRoadmapCompetencyGroups(req.body?.competencyGroups, course.name);

    if (!groups.length) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one competency group with one competency.",
      });
    }

    const weights = req.body?.progressWeights || {};

    course.requiredOnlineClasses = safeNumber(req.body?.requiredOnlineClasses, defaults.requiredOnlineClasses);
    course.requiredFaceToFaceClasses = safeNumber(req.body?.requiredFaceToFaceClasses, defaults.requiredFaceToFaceClasses);
    course.onlineAttendanceBasis = clean(req.body?.onlineAttendanceBasis) || defaults.onlineAttendanceBasis;
    course.faceToFaceAttendanceBasis = clean(req.body?.faceToFaceAttendanceBasis) || defaults.faceToFaceAttendanceBasis;
    course.certificatePreviewImage = clean(req.body?.certificatePreviewImage);
    course.progressWeights = {
      online: safeNumber(weights.online, defaults.progressWeights.online),
      faceToFace: safeNumber(weights.faceToFace, defaults.progressWeights.faceToFace),
      competencies: safeNumber(weights.competencies, defaults.progressWeights.competencies),
      pretest: safeNumber(weights.pretest, defaults.progressWeights.pretest),
    };
    course.competencyGroups = groups;

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course competencies and roadmap saved successfully.",
      roadmap: mapCourseRoadmap(course),
    });
  } catch (error) {
    console.error("updateAdminCourseRoadmap error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to save course roadmap.",
    });
  }
}

export async function resetAdminCourseRoadmap(req, res) {
  try {
    const course = await getCourseOr404(req, res);
    if (!course) return null;

    const defaults = buildDefaultRoadmapForCourse(course.name);
    course.requiredOnlineClasses = defaults.requiredOnlineClasses;
    course.requiredFaceToFaceClasses = defaults.requiredFaceToFaceClasses;
    course.onlineAttendanceBasis = defaults.onlineAttendanceBasis;
    course.faceToFaceAttendanceBasis = defaults.faceToFaceAttendanceBasis;
    course.certificatePreviewImage = defaults.certificatePreviewImage || "";
    course.progressWeights = defaults.progressWeights;
    course.competencyGroups = defaults.competencyGroups;

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course roadmap reset to default successfully.",
      roadmap: mapCourseRoadmap(course),
    });
  } catch (error) {
    console.error("resetAdminCourseRoadmap error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset course roadmap.",
    });
  }
}

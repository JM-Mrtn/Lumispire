import TrainingBatch from "../models/TrainingBatch.js";
import { normalizeTrainingCourseName } from "./trainingProgressCatalog.js";
import {
  getCourseProgressConfigForCourse,
  getCourseCompetencyCodesForCourse,
} from "./trainingRoadmapService.js";

function hasCompletedPretest(trainee) {
  return (
    String(trainee?.pretestStatus || "").trim().toLowerCase() === "completed" ||
    Boolean(trainee?.pretestLastTakenAt)
  );
}

async function getCurrentBatchForCourse(course = "") {
  const normalizedCourse = normalizeTrainingCourseName(course || "");
  if (!normalizedCourse) return null;

  return TrainingBatch.findOne({
    course: normalizedCourse,
    isActive: true,
    status: { $ne: "archived" },
  })
    .sort({ createdAt: -1 })
    .lean();
}

async function getBatchForTrainee(course = "", trainee = null) {
  const normalizedCourse = normalizeTrainingCourseName(
    course || trainee?.course || ""
  );

  if (!normalizedCourse) return null;

  const traineeBatchId = String(trainee?.batchId || "").trim();

  if (traineeBatchId) {
    const assignedBatch = await TrainingBatch.findOne({
      _id: traineeBatchId,
      course: normalizedCourse,
    }).lean();

    if (assignedBatch) return assignedBatch;
  }

  return getCurrentBatchForCourse(normalizedCourse);
}

function clampRatio(value) {
  const safe = Number(value || 0);

  if (!Number.isFinite(safe) || safe <= 0) return 0;
  if (safe >= 1) return 1;

  return safe;
}

/*
  Attendance has been removed from progress.
  These exports are kept only so older imports will not break.
*/
export async function countVerifiedOnlineClasses() {
  return 0;
}

export async function countVerifiedFaceToFaceRfidDays() {
  return 0;
}

export async function buildCompetencyProgress(course = "", completedCodes = []) {
  const config = await getCourseProgressConfigForCourse(course);

  const groupsSource = Array.isArray(config?.competencyGroups)
    ? config.competencyGroups
    : [];

  const validCodes = new Set(await getCourseCompetencyCodesForCourse(course));

  const normalizedCompletedCodes = [
    ...new Set(
      (Array.isArray(completedCodes) ? completedCodes : [])
        .map((item) => String(item || "").trim())
        .filter((item) => validCodes.has(item))
    ),
  ];

  const completedSet = new Set(normalizedCompletedCodes);

  const groups = groupsSource.map((group) => ({
    title: group.title,
    sequence: group.sequence || 1,
    items: (group.items || []).map((item) => ({
      ...item,
      completed: completedSet.has(item.code),
    })),
  }));

  const totalCount = groups.reduce(
    (sum, group) => sum + (group.items || []).length,
    0
  );

  const completedCount = groups.reduce(
    (sum, group) =>
      sum + (group.items || []).filter((item) => item.completed).length,
    0
  );

  return {
    groups,
    completedCodes: normalizedCompletedCodes,
    totalCount,
    completedCount,
    complete: totalCount > 0 ? completedCount >= totalCount : true,
  };
}

function computeProgressPercent(
  config,
  {
    competenciesCompleted = 0,
    competenciesTotal = 0,
    pretestCompleted = false,
  } = {}
) {
  const weights = config?.weights || {};

  const competencyWeight = Number(weights.competencies || 70);
  const pretestWeight = Number(weights.pretest || 30);
  const totalWeight =
    competencyWeight + pretestWeight > 0
      ? competencyWeight + pretestWeight
      : 100;

  const competencyRatio =
    competenciesTotal > 0
      ? clampRatio(competenciesCompleted / competenciesTotal)
      : 1;

  const pretestRatio = pretestCompleted ? 1 : 0;

  const total =
    competencyRatio * (competencyWeight / totalWeight) * 100 +
    pretestRatio * (pretestWeight / totalWeight) * 100;

  return Math.round(Math.min(100, Math.max(0, total)));
}

export async function buildTraineeProgressSnapshot(trainee) {
  const course = normalizeTrainingCourseName(trainee?.course || "");
  const config = await getCourseProgressConfigForCourse(course);
  const pretestCompleted = hasCompletedPretest(trainee);

  if (!config) {
    return {
      course,
      progressPercent: pretestCompleted ? 100 : 0,
      certificatePreviewImage: "",
      competencyGroups: [],
      completedCompetencyCodes: [],
      competencyCounts: {
        completed: 0,
        total: 0,
      },
      pretestCompleted,
      trainingStatus: trainee?.trainingStatus || "Enrolled",
      certificateStatus: trainee?.certificateStatus || "none",
      isEligibleForCompletion: pretestCompleted,
      incompleteReasons: pretestCompleted
        ? []
        : ["Pre-test is not completed yet."],
    };
  }

  const targetBatch = await getBatchForTrainee(course, trainee);

  const competencyProgress = await buildCompetencyProgress(
    course,
    trainee?.completedCompetencyCodes || []
  );

  const progressPercent = computeProgressPercent(config, {
    competenciesCompleted: competencyProgress.completedCount,
    competenciesTotal: competencyProgress.totalCount,
    pretestCompleted,
  });

  const incompleteReasons = [];

  if (!pretestCompleted) {
    incompleteReasons.push("Pre-test is not completed yet.");
  }

  if (!competencyProgress.complete) {
    incompleteReasons.push(
      `${competencyProgress.completedCount} of ${competencyProgress.totalCount} competencies completed.`
    );
  }

  return {
    course,
    courseKey: config.courseKey,
    batchId: targetBatch?._id ? String(targetBatch._id) : "",
    batchCode: targetBatch?.batchCode || trainee?.batchCode || "",
    batchName: targetBatch?.batchName || trainee?.batchName || "",
    batchStatus: targetBatch?.status || "",
    progressPercent,
    certificatePreviewImage: config?.certificatePreviewImage || "",
    competencyGroups: competencyProgress.groups,
    completedCompetencyCodes: competencyProgress.completedCodes,
    competencyCounts: {
      completed: competencyProgress.completedCount,
      total: competencyProgress.totalCount,
    },
    pretestCompleted,
    trainingStatus: trainee?.trainingStatus || "Enrolled",
    certificateStatus: trainee?.certificateStatus || "none",
    isEligibleForCompletion: incompleteReasons.length === 0,
    incompleteReasons,
  };
}

export default {
  countVerifiedOnlineClasses,
  countVerifiedFaceToFaceRfidDays,
  buildCompetencyProgress,
  buildTraineeProgressSnapshot,
};

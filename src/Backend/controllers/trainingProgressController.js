import TraineeUser from "../models/TraineeUser.js";
import { normalizeTrainingCourseName } from "../utils/trainingProgressCatalog.js";
import { buildTraineeProgressSnapshot } from "../utils/trainingProgressService.js";
import { getCourseCompetencyCodesForCourse } from "../utils/trainingRoadmapService.js";

function isProfessorAllowedForCourse(req, course = "") {
  const normalized = normalizeTrainingCourseName(course);
  const allowedCourses = Array.isArray(req?.professor?.courseAssignments)
    ? req.professor.courseAssignments
        .map(normalizeTrainingCourseName)
        .filter(Boolean)
    : [];
  return allowedCourses.includes(normalized);
}

async function loadProgressTraineeById(id) {
  return TraineeUser.findById(id).select(
    [
      "firstName",
      "lastName",
      "middleName",
      "email",
      "phone",
      "course",
      "batchId",
      "batchCode",
      "batchName",
      "active",
      "trainingStatus",
      "certificateStatus",
      "certificateId",
      "passedAt",
      "completedAt",
      "pretestStatus",
      "pretestScorePercent",
      "pretestLastTakenAt",
      "pretestLatestResults",
      "pretestEvaluation",
      "learningPathLevel",
      "learningGoal",
      "completedCompetencyCodes",
      "competencyChecklistUpdatedAt",
      "competencyChecklistUpdatedByName",
      "competencyRemarks",
      "profilePhoto",
    ].join(" ")
  );
}

function buildPretestPayload(trainee) {
  const completed =
    String(trainee?.pretestStatus || "").trim().toLowerCase() === "completed" ||
    Boolean(trainee?.pretestLastTakenAt);

  return {
    completed,
    status: completed ? "completed" : "not_started",
    scorePercent: Number(trainee?.pretestScorePercent || 0),
    lastTakenAt: trainee?.pretestLastTakenAt || null,
    learningPathLevel: trainee?.learningPathLevel || "beginner",
    learningGoal: trainee?.learningGoal || "",
    results: Array.isArray(trainee?.pretestLatestResults)
      ? trainee.pretestLatestResults
      : [],
    evaluation: trainee?.pretestEvaluation || null,
  };
}

export async function getMyTrainingProgress(req, res) {
  try {
    const traineeId = String(req?.trainee?.id || "").trim();
    if (!traineeId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized trainee request.",
      });
    }

    const trainee = await loadProgressTraineeById(traineeId);
    if (!trainee) {
      return res.status(404).json({
        success: false,
        message: "Trainee account not found.",
      });
    }

    const progress = await buildTraineeProgressSnapshot(trainee);

    return res.status(200).json({
      success: true,
      user: trainee,
      progress: {
        ...progress,
        pretest: buildPretestPayload(trainee),
      },
    });
  } catch (error) {
    console.error("getMyTrainingProgress error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load training progress.",
    });
  }
}

export async function getProfessorTraineeProgress(req, res) {
  try {
    const traineeId = String(req.params?.traineeId || "").trim();
    const trainee = await loadProgressTraineeById(traineeId);

    if (!trainee) {
      return res.status(404).json({
        success: false,
        message: "Trainee not found.",
      });
    }

    if (!isProfessorAllowedForCourse(req, trainee.course)) {
      return res.status(403).json({
        success: false,
        message: "You can only view progress for trainees in your assigned course.",
      });
    }

    const progress = await buildTraineeProgressSnapshot(trainee);

    return res.status(200).json({
      success: true,
      trainee,
      progress: {
        ...progress,
        pretest: buildPretestPayload(trainee),
      },
    });
  } catch (error) {
    console.error("getProfessorTraineeProgress error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load trainee progress.",
    });
  }
}

export async function updateProfessorTraineeCompetencies(req, res) {
  try {
    const traineeId = String(req.params?.traineeId || "").trim();
    const completedCodes = Array.isArray(req.body?.completedCompetencyCodes)
      ? req.body.completedCompetencyCodes
      : [];
    const remarks = String(req.body?.remarks || "")
      .trim()
      .slice(0, 300);

    const trainee = await loadProgressTraineeById(traineeId);
    if (!trainee) {
      return res.status(404).json({
        success: false,
        message: "Trainee not found.",
      });
    }

    if (!isProfessorAllowedForCourse(req, trainee.course)) {
      return res.status(403).json({
        success: false,
        message: "You can only update competencies for trainees in your assigned course.",
      });
    }

    const allowedCodes = new Set(await getCourseCompetencyCodesForCourse(trainee.course));
    const normalizedCodes = [
      ...new Set(
        completedCodes
          .map((item) => String(item || "").trim())
          .filter((item) => allowedCodes.has(item))
      ),
    ];

    trainee.completedCompetencyCodes = normalizedCodes;
    trainee.competencyChecklistUpdatedAt = new Date();
    trainee.competencyChecklistUpdatedByName =
      req.professor?.name || req.professor?.email || "Professor";
    if (remarks) trainee.competencyRemarks = remarks;

    await trainee.save();

    const progress = await buildTraineeProgressSnapshot(trainee);

    return res.status(200).json({
      success: true,
      message: "Competency checklist updated successfully.",
      trainee,
      progress: {
        ...progress,
        pretest: buildPretestPayload(trainee),
      },
    });
  } catch (error) {
    console.error("updateProfessorTraineeCompetencies error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update trainee competencies.",
    });
  }
}
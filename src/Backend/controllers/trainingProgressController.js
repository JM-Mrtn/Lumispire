import TraineeUser from "../models/TraineeUser.js";
import { normalizeTrainingCourseName } from "../utils/trainingProgressCatalog.js";
import { buildTraineeProgressSnapshot } from "../utils/trainingProgressService.js";
import { getCourseCompetencyCodesForCourse } from "../utils/trainingRoadmapService.js";
import { getCourseCompetencyGroupsForCourse } from "../utils/trainingRoadmapService.js";

const ROADMAP_EXAM_QUESTION_COUNT = 10;
const ROADMAP_EXAM_PASSING_SCORE = 7;

function clean(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function buildRoadmapExamProgressPayload(trainee) {
  const entries = Array.isArray(trainee?.roadmapExamProgress)
    ? trainee.roadmapExamProgress
    : [];

  return entries.reduce(
    (result, entry) => {
      const code = clean(entry?.competencyCode);
      if (!code) return result;

      result.examPassed[code] = entry?.passed === true;
      result.attempts[code] = Number(entry?.attemptCount || 0);
      result.scores[code] = Number(entry?.latestScore || 0);
      result.completedAt[code] = entry?.completedAt || null;
      result.answers[code] = (entry?.latestAnswers || []).reduce(
        (answers, answer, index) => {
          answers[index] = clean(answer?.selectedAnswer);
          return answers;
        },
        {}
      );
      return result;
    },
    { examPassed: {}, attempts: {}, scores: {}, completedAt: {}, answers: {} }
  );
}

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
      "roadmapExamProgress",
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
        roadmapExamProgress: buildRoadmapExamProgressPayload(trainee),
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

export async function submitMyRoadmapExam(req, res) {
  try {
    const traineeId = clean(req?.trainee?.id);
    const competencyCode = clean(req.body?.competencyCode);
    const submittedAnswers = Array.isArray(req.body?.answers) ? req.body.answers : [];

    if (!traineeId || !competencyCode) {
      return res.status(400).json({ success: false, message: "Competency code is required." });
    }

    const trainee = await loadProgressTraineeById(traineeId);
    if (!trainee) {
      return res.status(404).json({ success: false, message: "Trainee account not found." });
    }

    const groups = await getCourseCompetencyGroupsForCourse(trainee.course);
    const competencies = groups.flatMap((group) => group.items || []);
    const competencyIndex = competencies.findIndex(
      (item) => clean(item?.code) === competencyCode
    );
    const competency = competencies[competencyIndex];

    if (!competency) {
      return res.status(404).json({ success: false, message: "Roadmap competency was not found." });
    }

    if (competencyIndex > 0) {
      const previousCode = clean(competencies[competencyIndex - 1]?.code);
      const previousProfessorPassed = (trainee.completedCompetencyCodes || []).includes(previousCode);
      const previousExamPassed = (trainee.roadmapExamProgress || []).some(
        (entry) => clean(entry?.competencyCode) === previousCode && entry?.passed === true
      );

      if (!previousProfessorPassed || !previousExamPassed) {
        return res.status(409).json({
          success: false,
          message: "Complete the previous roadmap step before taking this exam.",
        });
      }
    }

    const questionByPrompt = new Map(
      (competency.examQuestions || []).map((question) => [clean(question?.prompt), question])
    );
    const normalizedAnswers = submittedAnswers
      .map((item) => ({
        prompt: clean(item?.prompt),
        selectedAnswer: clean(item?.selectedAnswer),
      }))
      .filter((item) => item.prompt && item.selectedAnswer);
    const uniquePrompts = new Set(normalizedAnswers.map((item) => item.prompt));

    if (
      normalizedAnswers.length !== ROADMAP_EXAM_QUESTION_COUNT ||
      uniquePrompts.size !== ROADMAP_EXAM_QUESTION_COUNT ||
      normalizedAnswers.some((item) => {
        const question = questionByPrompt.get(item.prompt);
        return (
          !question ||
          !(question.options || []).map(clean).includes(item.selectedAnswer)
        );
      })
    ) {
      return res.status(400).json({
        success: false,
        message: `Submit exactly ${ROADMAP_EXAM_QUESTION_COUNT} valid roadmap answers.`,
      });
    }

    const evaluated = normalizedAnswers.map((item) => {
      const question = questionByPrompt.get(item.prompt);
      const answer = clean(question?.answer);
      return {
        prompt: item.prompt,
        selectedAnswer: item.selectedAnswer,
        answer,
        explanation: clean(question?.explanation) || "Review the competency study module.",
        isCorrect: item.selectedAnswer === answer,
      };
    });
    const correctCount = evaluated.filter((item) => item.isCorrect).length;
    const scorePercent = Math.round((correctCount / ROADMAP_EXAM_QUESTION_COUNT) * 100);
    const currentAttemptPassed = correctCount >= ROADMAP_EXAM_PASSING_SCORE;
    const professorPassed = (trainee.completedCompetencyCodes || []).includes(competencyCode);
    const now = new Date();

    if (!Array.isArray(trainee.roadmapExamProgress)) trainee.roadmapExamProgress = [];
    let examEntry = trainee.roadmapExamProgress.find(
      (entry) => clean(entry?.competencyCode) === competencyCode
    );
    if (!examEntry) {
      trainee.roadmapExamProgress.push({ competencyCode });
      examEntry = trainee.roadmapExamProgress[trainee.roadmapExamProgress.length - 1];
    }

    examEntry.passed = examEntry.passed === true || currentAttemptPassed;
    const examPassed = examEntry.passed === true;
    const unlockNext = examPassed && professorPassed;
    examEntry.latestScore = scorePercent;
    examEntry.attemptCount = Number(examEntry.attemptCount || 0) + 1;
    examEntry.lastTakenAt = now;
    examEntry.latestAnswers = normalizedAnswers;
    if (unlockNext && !examEntry.completedAt) examEntry.completedAt = now;

    trainee.markModified("roadmapExamProgress");
    await trainee.save();

    return res.status(200).json({
      success: true,
      result: {
        examPassed,
        professorPassed,
        unlockNext,
        correctCount,
        total: ROADMAP_EXAM_QUESTION_COUNT,
        scorePercent,
        wrongItems: evaluated.filter((item) => !item.isCorrect),
      },
      roadmapExamProgress: buildRoadmapExamProgressPayload(trainee),
    });
  } catch (error) {
    console.error("submitMyRoadmapExam error:", error);
    return res.status(500).json({ success: false, message: "Failed to save roadmap exam." });
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

    for (const entry of trainee.roadmapExamProgress || []) {
      if (
        entry?.passed === true &&
        normalizedCodes.includes(clean(entry?.competencyCode)) &&
        !entry.completedAt
      ) {
        entry.completedAt = new Date();
      }
    }
    trainee.markModified("roadmapExamProgress");

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

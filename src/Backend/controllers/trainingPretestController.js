import TrainingPretest from "../models/TrainingPretest.js";
import TraineeUser from "../models/TraineeUser.js";
import TrainingModule from "../models/TrainingModule.js";
import {
  getCourseKey,
  getLearningPathFromPercent,
  getPretestBankForCourse,
} from "../utils/trainingPretestBank.js";

function normalizeCourseName(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (clean === "housekeeping") return "Housekeeping";
  if (clean === "event management") return "Event Management";
  return String(value || "").trim();
}

function sanitizeQuestions(pretest) {
  return (Array.isArray(pretest?.questions) ? pretest.questions : []).map(
    (question) => ({
      id: String(question._id),
      _id: String(question._id),
      prompt: question.prompt,
      options: Array.isArray(question.options) ? question.options : [],
      points: Number(question.points || 1),
    })
  );
}

function hasCompletedPretest(trainee) {
  return (
    String(trainee?.pretestStatus || "").trim().toLowerCase() === "completed" ||
    Boolean(trainee?.pretestLastTakenAt)
  );
}

function resolveSubmittedAnswer(question, answerItem) {
  const directAnswer = String(answerItem?.answer || "").trim();
  if (directAnswer) return directAnswer;

  const optionIndexRaw = answerItem?.selectedOptionIndex;
  const optionIndex = Number(optionIndexRaw);
  if (!Number.isInteger(optionIndex)) return "";

  const options = Array.isArray(question?.options) ? question.options : [];
  const picked = options[optionIndex];

  if (typeof picked === "string") return picked.trim();
  if (picked && typeof picked === "object") {
    return String(picked.value || picked.label || picked.text || "").trim();
  }

  return String(value || "").trim();
}

function buildQuestionMap(questions = []) {
  const map = new Map();
  for (const question of questions) {
    map.set(String(question._id), question);
  }
  return map;
}

function uniqueStrings(values = []) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    ),
  ];
}

function getCategoryRules(course = "") {
  const normalized = normalizeCourseName(course);

  if (normalized === "Housekeeping") {
    return [
      {
        name: "Room Preparation and Cleaning Standards",
        keywords: [
          "room",
          "bed",
          "linen",
          "inventory",
          "inspection",
          "status updating",
          "checklist",
          "cleaning",
        ],
      },
      {
        name: "Sanitation and Hygiene",
        keywords: [
          "hygiene",
          "cross-contamination",
          "disinfect",
          "bathroom",
          "hand hygiene",
          "germs",
          "odor",
        ],
      },
      {
        name: "Safety and Equipment Handling",
        keywords: [
          "chemical",
          "bleach",
          "ppe",
          "gloves",
          "wet floor",
          "damaged equipment",
          "broken glass",
          "safety",
        ],
      },
      {
        name: "Guest Service and Communication",
        keywords: [
          "guest",
          "request",
          "occupied",
          "communication",
          "customer service",
          "professional interaction",
          "privacy",
        ],
      },
      {
        name: "Operations and Housekeeping Procedure",
        keywords: [
          "lost-and-found",
          "cart",
          "supplies",
          "final inspection",
          "report",
          "procedure",
          "workflow",
        ],
      },
    ];
  }

  if (normalized === "Event Management") {
    return [
      {
        name: "Planning and Budgeting",
        keywords: [
          "budget",
          "objective",
          "brief",
          "proposal",
          "audience",
          "planning",
        ],
      },
      {
        name: "Program Flow and Coordination",
        keywords: [
          "program flow",
          "timeline",
          "coordination",
          "rehearsal",
          "deployment",
          "communication channels",
        ],
      },
      {
        name: "Venue and Logistics",
        keywords: [
          "venue",
          "ocular",
          "layout",
          "logistics",
          "registration",
          "signage",
        ],
      },
      {
        name: "Risk and Contingency Handling",
        keywords: [
          "backup",
          "contingency",
          "risk",
          "delayed",
          "unexpected",
          "disruption",
          "complaint",
        ],
      },
      {
        name: "Client, Guest, and Protocol Management",
        keywords: [
          "client",
          "guest",
          "vip",
          "protocol",
          "crowd",
          "rsvp",
          "on-site complaint",
        ],
      },
    ];
  }

  return [
    {
      name: "General Knowledge",
      keywords: [],
    },
  ];
}

function detectQuestionCategory(course = "", prompt = "", explanation = "") {
  const text = `${prompt} ${explanation}`.toLowerCase();
  const rules = getCategoryRules(course);

  let bestCategory = rules[0]?.name || "General Knowledge";
  let bestScore = -1;

  for (const rule of rules) {
    const score = (rule.keywords || []).reduce((sum, keyword) => {
      return text.includes(String(keyword).toLowerCase()) ? sum + 1 : sum;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestCategory = rule.name;
    }
  }

  return bestCategory || "General Knowledge";
}

function getRecommendationMap(course = "") {
  const normalized = normalizeCourseName(course);

  if (normalized === "Housekeeping") {
    return {
      "Room Preparation and Cleaning Standards":
        "Review room preparation sequence, bed making, linen handling, room inspection, and housekeeping checklist standards before moving to higher-difficulty modules.",
      "Sanitation and Hygiene":
        "Repeat sanitation, disinfection, bathroom care, and cross-contamination lessons. Add more demonstration-based activities and short recall quizzes.",
      "Safety and Equipment Handling":
        "Focus on PPE use, chemical handling, wet-floor safety, damaged equipment reporting, and safe disposal procedures through guided practice.",
      "Guest Service and Communication":
        "Give more guest-interaction scenarios, occupied-room etiquette drills, and communication practice so the trainee becomes more confident in service handling.",
      "Operations and Housekeeping Procedure":
        "Reinforce workflow discipline such as lost-and-found procedure, cart setup, supply readiness, and reporting standards with checklist-based coaching.",
    };
  }

  if (normalized === "Event Management") {
    return {
      "Planning and Budgeting":
        "Strengthen foundation modules on event objectives, budgeting, planning briefs, and audience analysis before introducing more advanced tasks.",
      "Program Flow and Coordination":
        "Provide extra coaching on timeline control, rehearsal preparation, staff coordination, and execution flow using event case simulations.",
      "Venue and Logistics":
        "Add venue-ocular exercises, floor-plan review, signage planning, registration flow, and logistics checklists to improve operational judgment.",
      "Risk and Contingency Handling":
        "Use scenario-based activities for delays, disruptions, supplier issues, and contingency planning so the trainee can respond calmly under pressure.",
      "Client, Guest, and Protocol Management":
        "Reinforce client communication, guest service recovery, RSVP handling, VIP protocol, and crowd management through role-play and guided feedback.",
    };
  }

  return {
    "General Knowledge":
      "Review the trainee’s missed concepts first, then assign targeted modules and short reinforcement activities before moving forward.",
  };
}

function getProfessorActionTemplates(course = "", learningPathLevel = "beginner") {
  const normalized = normalizeCourseName(course);
  const cleanPath = String(learningPathLevel || "").trim().toLowerCase();

  const baseActions = [];

  if (cleanPath === "beginner") {
    baseActions.push(
      "Start the trainee on foundation-level modules first and avoid skipping core topics.",
      "Use shorter guided activities, demonstrations, and frequent knowledge checks before moving to more advanced practice."
    );
  } else if (cleanPath === "intermediate") {
    baseActions.push(
      "Keep the trainee on intermediate-level modules but add targeted remediation for weak topics.",
      "Use mixed strategy coaching: short review, practical application, then quick re-check."
    );
  } else {
    baseActions.push(
      "Keep the trainee challenged with higher-level tasks while still reinforcing weak areas found in the pre-test.",
      "Use application-heavy coaching, scenario work, and performance feedback rather than only repetition."
    );
  }

  if (normalized === "Housekeeping") {
    baseActions.push(
      "Match coaching with actual housekeeping demonstrations such as room setup, sanitation flow, safety checks, and guest-service practice."
    );
  }

  if (normalized === "Event Management") {
    baseActions.push(
      "Match coaching with event scenarios such as planning briefs, program flow control, coordination drills, and contingency handling."
    );
  }

  return uniqueStrings(baseActions);
}

function buildPretestEvaluation({
  course = "",
  results = [],
  scorePercent = 0,
  learningPathLevel = "beginner",
  learningGoal = "",
}) {
  const safeResults = Array.isArray(results) ? results : [];
  const statsMap = new Map();

  for (const item of safeResults) {
    const category = String(item?.category || "General Knowledge").trim() || "General Knowledge";
    const current = statsMap.get(category) || {
      total: 0,
      correct: 0,
      incorrect: 0,
    };

    current.total += 1;
    if (item?.isCorrect) current.correct += 1;
    else current.incorrect += 1;

    statsMap.set(category, current);
  }

  const rankedCategories = [...statsMap.entries()].map(([category, stats]) => ({
    category,
    ...stats,
    accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
  }));

  rankedCategories.sort((a, b) => {
    if (b.incorrect !== a.incorrect) return b.incorrect - a.incorrect;
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
    return a.category.localeCompare(b.category);
  });

  const weaknessAreas = rankedCategories
    .filter((item) => item.incorrect > 0)
    .map((item) => item.category);

  const strengthAreas = [...rankedCategories]
    .filter((item) => item.correct > 0)
    .sort((a, b) => {
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (b.correct !== a.correct) return b.correct - a.correct;
      return a.category.localeCompare(b.category);
    })
    .slice(0, 3)
    .map((item) => item.category);

  const recommendationMap = getRecommendationMap(course);

  const recommendations = weaknessAreas.map(
    (area) =>
      recommendationMap[area] ||
      "Review the missed concepts in this area and give the trainee additional guided practice before proceeding."
  );

  const professorActions = [
    ...getProfessorActionTemplates(course, learningPathLevel),
    ...weaknessAreas.map(
      (area) =>
        `Give targeted remediation for ${area} using short reviews, guided examples, and follow-up practice checks.`
    ),
  ];

  let summary = `The trainee scored ${Number(scorePercent || 0)}% and was placed in the ${String(
    learningPathLevel || "beginner"
  )} learning path.`;

  if (weaknessAreas.length) {
    summary += ` Main weakness area(s): ${weaknessAreas.join(", ")}.`;
  } else {
    summary += " The trainee showed consistent understanding across the assessed areas.";
  }

  if (learningGoal) {
    summary += ` Reported learning goal: ${learningGoal}.`;
  }

  return {
    summary,
    strengths: uniqueStrings(
      strengthAreas.map((area) => `Shows stronger understanding in ${area}.`)
    ),
    weaknesses: uniqueStrings(
      weaknessAreas.map((area) => `Needs improvement in ${area}.`)
    ),
    suggestedFocusAreas: uniqueStrings(weaknessAreas),
    recommendations: uniqueStrings(recommendations),
    professorActions: uniqueStrings(professorActions),
  };
}

async function ensureCoursePretest(course = "") {
  const courseName = normalizeCourseName(course);
  const courseKey = getCourseKey(courseName);
  if (!courseKey) return null;

  const bank = getPretestBankForCourse(courseName);
  if (!bank || !Array.isArray(bank.questions) || !bank.questions.length) return null;

  let pretest = await TrainingPretest.findOne({ courseKey, active: true }).sort({
    createdAt: -1,
  });

  if (!pretest) {
    pretest = await TrainingPretest.create({
      title: bank.title,
      description: bank.description,
      course: courseName,
      courseKey,
      active: true,
      passingScorePercent: Number(bank.passingScorePercent || 60),
      questions: bank.questions,
    });

    return pretest;
  }

  const existingCount = Array.isArray(pretest.questions) ? pretest.questions.length : 0;
  const bankCount = Array.isArray(bank.questions) ? bank.questions.length : 0;

  const shouldSync =
    existingCount !== bankCount ||
    String(pretest.title || "") !== String(bank.title || "") ||
    String(pretest.description || "") !== String(bank.description || "") ||
    Number(pretest.passingScorePercent || 60) !== Number(bank.passingScorePercent || 60);

  if (shouldSync) {
    pretest.title = bank.title;
    pretest.description = bank.description;
    pretest.course = courseName;
    pretest.courseKey = courseKey;
    pretest.active = true;
    pretest.passingScorePercent = Number(bank.passingScorePercent || 60);
    pretest.questions = bank.questions;
    await pretest.save();
  }

  return pretest;
}

export async function getMyTraineePretest(req, res) {
  try {
    const traineeId = String(req.trainee?.id || "").trim();

    const trainee = await TraineeUser.findById(traineeId).select(
      [
        "firstName",
        "lastName",
        "course",
        "pretestStatus",
        "pretestScorePercent",
        "pretestLastTakenAt",
        "learningPathLevel",
        "learningGoal",
        "pretestLatestResults",
        "pretestEvaluation",
      ].join(" ")
    );

    if (!trainee) {
      return res
        .status(404)
        .json({ success: false, message: "Trainee account not found." });
    }

    const pretest = await ensureCoursePretest(trainee.course || "");
    if (!pretest) {
      return res.status(404).json({
        success: false,
        message: "No pre-test is configured for this course yet.",
      });
    }

    const completed = hasCompletedPretest(trainee);

    return res.json({
      success: true,
      requiresPretest: true,
      completed,
      latestAttempt: completed
        ? {
            submittedAt: trainee.pretestLastTakenAt || null,
            scorePercent: Number(trainee.pretestScorePercent || 0),
            learningPathLevel: trainee.learningPathLevel || "beginner",
            learningPath: trainee.learningPathLevel || "beginner",
            learningGoal: trainee.learningGoal || "",
            status: "completed",
            results: Array.isArray(trainee.pretestLatestResults)
              ? trainee.pretestLatestResults
              : [],
            evaluation: trainee.pretestEvaluation || null,
          }
        : null,
      pretest: {
        id: String(pretest._id),
        title: pretest.title,
        description: pretest.description,
        course: pretest.course,
        passingScorePercent: Number(pretest.passingScorePercent || 60),
        questionCount: Array.isArray(pretest.questions) ? pretest.questions.length : 0,
        status: completed ? "completed" : "not_started",
        scorePercent: Number(trainee.pretestScorePercent || 0),
        learningPathLevel: trainee.learningPathLevel || "beginner",
        learningPath: trainee.learningPathLevel || "beginner",
        learningGoal: trainee.learningGoal || "",
        lastTakenAt: trainee.pretestLastTakenAt || null,
        completed,
        results: completed && Array.isArray(trainee.pretestLatestResults)
          ? trainee.pretestLatestResults
          : [],
        evaluation: completed ? trainee.pretestEvaluation || null : null,
        questions: completed ? [] : sanitizeQuestions(pretest),
      },
    });
  } catch (error) {
    console.error("getMyTraineePretest error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load trainee pre-test." });
  }
}

export async function submitMyTraineePretest(req, res) {
  try {
    const traineeId = String(req.trainee?.id || "").trim();

    const trainee = await TraineeUser.findById(traineeId).select(
      [
        "firstName",
        "lastName",
        "course",
        "pretestStatus",
        "pretestScorePercent",
        "pretestLastTakenAt",
        "learningPathLevel",
        "learningGoal",
        "pretestLatestResults",
        "pretestEvaluation",
      ].join(" ")
    );

    if (!trainee) {
      return res
        .status(404)
        .json({ success: false, message: "Trainee account not found." });
    }

    const pretest = await ensureCoursePretest(trainee.course || "");
    if (!pretest) {
      return res.status(404).json({
        success: false,
        message: "No pre-test is configured for this course yet.",
      });
    }

    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
    const learningGoal = String(req.body?.learningGoal || "").trim().slice(0, 200);

    const questionMap = buildQuestionMap(pretest.questions || []);

    const normalizedAnswers = answers
      .map((item) => {
        const rawQuestionId = item?.questionId || item?.id || "";
        const questionId = String(rawQuestionId || "").trim();
        const question = questionMap.get(questionId);

        return {
          questionId,
          answer: resolveSubmittedAnswer(question, item),
        };
      })
      .filter(
        (item) => item.questionId && item.answer && questionMap.has(item.questionId)
      );

    if (normalizedAnswers.length !== (pretest.questions || []).length) {
      return res.status(400).json({
        success: false,
        message: "Please answer all pre-test questions before submitting.",
      });
    }

    const uniqueIds = new Set(normalizedAnswers.map((item) => item.questionId));
    if (uniqueIds.size !== (pretest.questions || []).length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate or invalid pre-test answers were detected.",
      });
    }

    let earnedPoints = 0;
    let totalPoints = 0;

    const results = normalizedAnswers.map((item) => {
      const question = questionMap.get(item.questionId);
      const points = Number(question?.points || 1);
      totalPoints += points;

      const isCorrect =
        String(item.answer || "").trim().toLowerCase() ===
        String(question?.correctAnswer || "").trim().toLowerCase();

      if (isCorrect) earnedPoints += points;

      return {
        questionId: item.questionId,
        prompt: question?.prompt || "",
        selectedAnswer: item.answer,
        correctAnswer: question?.correctAnswer || "",
        explanation: question?.explanation || "",
        points,
        isCorrect,
        category: detectQuestionCategory(
          trainee.course || "",
          question?.prompt || "",
          question?.explanation || ""
        ),
      };
    });

    const scorePercent =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    const learningPathLevel = getLearningPathFromPercent(scorePercent);

    const evaluation = buildPretestEvaluation({
      course: trainee.course || "",
      results,
      scorePercent,
      learningPathLevel,
      learningGoal: learningGoal || trainee.learningGoal || "",
    });

    trainee.pretestStatus = "completed";
    trainee.pretestScorePercent = scorePercent;
    trainee.pretestLastTakenAt = new Date();
    trainee.learningPathLevel = learningPathLevel;
    trainee.pretestLatestResults = results;
    trainee.pretestEvaluation = evaluation;
    if (learningGoal) trainee.learningGoal = learningGoal;
    await trainee.save();

    const moduleCount = await TrainingModule.countDocuments({
      courseKey: getCourseKey(trainee.course || ""),
      isActive: true,
      $or: [{ pathLevel: "all" }, { pathLevel: learningPathLevel }],
    });

    return res.json({
      success: true,
      message: "Pre-test completed. Your learning path and evaluation have been generated.",
      pretest: {
        id: String(pretest._id),
        title: pretest.title,
        status: "completed",
        scorePercent,
        passingScorePercent: Number(pretest.passingScorePercent || 60),
        learningPathLevel,
        learningPath: learningPathLevel,
        learningGoal: trainee.learningGoal || "",
        lastTakenAt: trainee.pretestLastTakenAt,
        submittedAt: trainee.pretestLastTakenAt,
        completed: true,
        lockedModules: false,
        recommendedModuleCount: moduleCount,
        results,
        evaluation,
      },
    });
  } catch (error) {
    console.error("submitMyTraineePretest error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to submit trainee pre-test." });
  }
}
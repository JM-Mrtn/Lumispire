// src/Backend/utils/manpowerAssessmentEvaluator.js
import { getManpowerExamByVacancy } from "./manpowerAssessmentBank.js";

function toNumber(value = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function round2(value = 0) {
  return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

function clampScore(value = 0, max = 100) {
  const num = toNumber(value);
  return Math.max(0, Math.min(max, round2(num)));
}

function normalizeText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function extractJson(text = "") {
  const raw = String(text || "").trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    //
  }

  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch {
      //
    }
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    } catch {
      //
    }
  }

  return null;
}

function buildMissingAnswerResult(question, applicantAnswer = "") {
  return {
    questionId: question.id,
    questionText: question.questionText,
    questionType: question.questionType,
    applicantAnswer,
    correctAnswer: question.correctAnswer || "",
    expectedAnswer: question.expectedAnswer || "",
    maxPoints: question.maxPoints,
    earnedPoints: 0,
    isCorrect: false,
    aiEvaluated: false,
    feedback: "No answer was submitted for this question.",
    matchedCriteria: [],
    missingCriteria: (question.rubric || []).map((item) => item.criterion),
  };
}

function evaluateObjectiveQuestion(question, applicantAnswer = "") {
  const normalizedApplicant = normalizeText(applicantAnswer);
  const normalizedCorrect = normalizeText(question.correctAnswer);

  const isCorrect = normalizedApplicant === normalizedCorrect;
  const earnedPoints = isCorrect ? toNumber(question.maxPoints) : 0;

  return {
    questionId: question.id,
    questionText: question.questionText,
    questionType: question.questionType,
    applicantAnswer,
    correctAnswer: question.correctAnswer || "",
    expectedAnswer: "",
    maxPoints: question.maxPoints,
    earnedPoints,
    isCorrect,
    aiEvaluated: false,
    feedback: isCorrect ? "Correct answer." : "Incorrect answer.",
    matchedCriteria: [],
    missingCriteria: [],
  };
}

function fallbackEvaluateOpenEndedQuestion(question, applicantAnswer = "") {
  const answerText = normalizeText(applicantAnswer);
  const rubric = Array.isArray(question?.rubric) ? question.rubric : [];

  if (!answerText) {
    return buildMissingAnswerResult(question, applicantAnswer);
  }

  let earnedPoints = 0;
  const matchedCriteria = [];
  const missingCriteria = [];

  for (const criterion of rubric) {
    const keywords = Array.isArray(criterion?.keywords) ? criterion.keywords : [];
    const matched = keywords.some((keyword) =>
      answerText.includes(normalizeText(keyword))
    );

    if (matched) {
      earnedPoints += toNumber(criterion?.points || 0);
      matchedCriteria.push(String(criterion?.criterion || "").trim());
    } else {
      missingCriteria.push(String(criterion?.criterion || "").trim());
    }
  }

  earnedPoints = clampScore(earnedPoints, question.maxPoints);

  let feedback = "Answer was evaluated using fallback rubric checking.";
  if (matchedCriteria.length && missingCriteria.length) {
    feedback = `Answer matched some expected points but missed: ${missingCriteria.join(
      ", "
    )}.`;
  } else if (matchedCriteria.length && !missingCriteria.length) {
    feedback = "Answer covered all key rubric points.";
  } else if (!matchedCriteria.length) {
    feedback = "Answer did not clearly match the key rubric points.";
  }

  return {
    questionId: question.id,
    questionText: question.questionText,
    questionType: question.questionType,
    applicantAnswer,
    correctAnswer: "",
    expectedAnswer: question.expectedAnswer || "",
    maxPoints: question.maxPoints,
    earnedPoints,
    isCorrect: earnedPoints >= toNumber(question.maxPoints),
    aiEvaluated: false,
    feedback,
    matchedCriteria,
    missingCriteria,
  };
}

async function aiEvaluateOpenEndedQuestion({ vacancy, examTitle, question, applicantAnswer }) {
  const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
  const model = String(process.env.GEMINI_MODEL || "gemini-2.5-flash-lite").trim();

  if (!apiKey) {
    return fallbackEvaluateOpenEndedQuestion(question, applicantAnswer);
  }

  const rubricLines = (question.rubric || [])
    .map(
      (item) =>
        `- ${item.criterion}: ${item.points} points. Keywords: ${(item.keywords || []).join(
          ", "
        )}`
    )
    .join("\n");

  const prompt = `
You are evaluating a manpower qualifying exam answer.

Job Vacancy:
${vacancy}

Exam Title:
${examTitle}

Question:
${question.questionText}

Expected Answer:
${question.expectedAnswer || "Use the rubric only."}

Rubric:
${rubricLines}

Applicant Answer:
${String(applicantAnswer || "").trim()}

Return STRICT JSON only:
{
  "score": 0,
  "feedback": "",
  "matchedCriteria": [],
  "missingCriteria": []
}

Rules:
- score must be between 0 and ${question.maxPoints}
- do not give points beyond the rubric
- matchedCriteria and missingCriteria must use the rubric wording
- do not return markdown
`.trim();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    const rawText =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || "")
        .join("\n")
        .trim() || "";

    const parsed = extractJson(rawText);

    if (!res.ok || !parsed) {
      return fallbackEvaluateOpenEndedQuestion(question, applicantAnswer);
    }

    const earnedPoints = clampScore(parsed?.score || 0, question.maxPoints);

    return {
      questionId: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      applicantAnswer,
      correctAnswer: "",
      expectedAnswer: question.expectedAnswer || "",
      maxPoints: question.maxPoints,
      earnedPoints,
      isCorrect: earnedPoints >= toNumber(question.maxPoints),
      aiEvaluated: true,
      feedback:
        String(parsed?.feedback || "").trim() ||
        "Answer was evaluated by AI.",
      matchedCriteria: Array.isArray(parsed?.matchedCriteria)
        ? parsed.matchedCriteria.map((item) => String(item || "").trim()).filter(Boolean)
        : [],
      missingCriteria: Array.isArray(parsed?.missingCriteria)
        ? parsed.missingCriteria.map((item) => String(item || "").trim()).filter(Boolean)
        : [],
    };
  } catch {
    return fallbackEvaluateOpenEndedQuestion(question, applicantAnswer);
  }
}

export async function evaluateManpowerAssessment({ vacancy = "", answers = [] }) {
  const exam = getManpowerExamByVacancy(vacancy);

  if (!exam) {
    throw new Error("No qualifying exam is available for this vacancy.");
  }

  const answerMap = new Map(
    (Array.isArray(answers) ? answers : []).map((row) => [
      String(row?.questionId || "").trim(),
      String(row?.answer || "").trim(),
    ])
  );

  const evaluatedAnswers = [];
  let totalScore = 0;

  for (const question of exam.questions || []) {
    const applicantAnswer = answerMap.get(question.id) || "";

    let result;

    if (!applicantAnswer) {
      result = buildMissingAnswerResult(question, applicantAnswer);
    } else if (
      question.questionType === "multiple_choice" ||
      question.questionType === "true_false" ||
      question.questionType === "identification"
    ) {
      result = evaluateObjectiveQuestion(question, applicantAnswer);
    } else {
      result = await aiEvaluateOpenEndedQuestion({
        vacancy: exam.vacancy,
        examTitle: exam.title,
        question,
        applicantAnswer,
      });
    }

    totalScore += toNumber(result.earnedPoints || 0);
    evaluatedAnswers.push(result);
  }

  const maxScore = toNumber(exam.maxScore || 0);
  const percentage = maxScore > 0 ? round2((totalScore / maxScore) * 100) : 0;

  return {
    examId: exam.examId,
    examTitle: exam.title,
    vacancy: exam.vacancy,
    passingScore: toNumber(exam.passingScore || 70),
    maxScore,
    totalScore: round2(totalScore),
    percentage,
    passed: percentage >= toNumber(exam.passingScore || 70),
    status: "completed",
    submittedAt: new Date(),
    answers: evaluatedAnswers,
  };
}
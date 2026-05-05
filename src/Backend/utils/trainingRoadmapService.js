import TrainingCourse from "../models/TrainingCourse.js";
import {
  getCourseProgressConfig as getFallbackProgressConfig,
  normalizeTrainingCourseName,
} from "./trainingProgressCatalog.js";

function clean(value = "") {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function slugify(value = "") {
  return (
    clean(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "course"
  );
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : fallback;
}

function uniqueStrings(values = []) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((item) => clean(item))
        .filter(Boolean)
    ),
  ];
}

function normalizeQuestion(raw = {}, context = {}) {
  const label = clean(context.label || "this competency") || "this competency";
  const course = clean(context.course || "this course") || "this course";
  const groupTitle = clean(context.groupTitle || "Competency") || "Competency";

  const prompt = clean(raw.prompt || raw.question) ||
    `What is the main purpose of ${label} in ${course}?`;

  const answer = clean(raw.answer || raw.correctAnswer || raw.correctOption) ||
    `To demonstrate the required skill correctly`;

  const baseOptions = Array.isArray(raw.options)
    ? raw.options.map(clean).filter(Boolean)
    : [];

  const options = uniqueStrings([
    answer,
    ...baseOptions,
    "To ignore workplace standards",
    "To skip professor checking",
    "To complete the course without practice",
  ]).slice(0, 4);

  while (options.length < 4) {
    options.push(`Related option ${options.length + 1}`);
  }

  return {
    prompt,
    options,
    answer,
    explanation:
      clean(raw.explanation) ||
      `${label} belongs to ${groupTitle} and supports skill readiness in ${course}.`,
    keywords: uniqueStrings(raw.keywords || [label, groupTitle, course]),
  };
}

export function buildDefaultExamQuestions({ course = "", groupTitle = "", label = "", code = "" } = {}) {
  const courseName = normalizeTrainingCourseName(course) || clean(course) || "your course";
  const competency = clean(label || code || "this competency");
  const group = clean(groupTitle || "Competency");

  return [
    {
      prompt: `What is the main goal of learning "${competency}" in ${courseName}?`,
      options: [
        "To build the required skill for training and workplace readiness",
        "To skip practical activities",
        "To avoid professor checking",
        "To replace all attendance requirements",
      ],
      answer: "To build the required skill for training and workplace readiness",
      explanation: `This competency supports practical readiness in ${courseName}.`,
      keywords: [competency, courseName, group],
    },
    {
      prompt: `Before being marked competent in "${competency}", what should the trainee do?`,
      options: [
        "Study the module, practice the skill, and ask for feedback",
        "Answer randomly without reviewing",
        "Ignore the professor's instructions",
        "Skip the checklist",
      ],
      answer: "Study the module, practice the skill, and ask for feedback",
      explanation: "Competency completion requires understanding, practice, and professor checking.",
      keywords: ["study", "practice", competency],
    },
    {
      prompt: `Which behavior best shows readiness for "${competency}"?`,
      options: [
        "Explaining and demonstrating the competency correctly",
        "Memorizing only the course name",
        "Avoiding practical activities",
        "Waiting for classmates to finish first",
      ],
      answer: "Explaining and demonstrating the competency correctly",
      explanation: "Readiness means the trainee can explain and perform the skill.",
      keywords: ["readiness", "demonstrate", competency],
    },
    {
      prompt: `If a trainee is unsure how to perform "${competency}", what is the best action?`,
      options: [
        "Ask the professor for clarification and practice again",
        "Continue incorrectly",
        "Mark it completed alone",
        "Stop attending the activity",
      ],
      answer: "Ask the professor for clarification and practice again",
      explanation: "Asking for clarification prevents mistakes and supports correct learning.",
      keywords: ["clarification", "feedback", competency],
    },
    {
      prompt: `The competency "${competency}" belongs to which roadmap group?`,
      options: [group, "Payment Records", "Website Navigation", "Personal Profile"],
      answer: group,
      explanation: `This item is listed under ${group}.`,
      keywords: [group, competency],
    },
    {
      prompt: `Why should "${competency}" be practiced in a realistic activity?`,
      options: [
        "To connect the lesson with actual workplace performance",
        "To make the roadmap longer only",
        "To remove the professor's role",
        "To avoid the exam",
      ],
      answer: "To connect the lesson with actual workplace performance",
      explanation: "Practice helps transfer knowledge into workplace behavior.",
      keywords: ["practice", "workplace", competency],
    },
    {
      prompt: `If a mistake happens while applying "${competency}", what should the trainee do?`,
      options: [
        "Accept feedback, correct the mistake, and practice again",
        "Ignore the mistake",
        "Argue with the professor",
        "Hide the mistake",
      ],
      answer: "Accept feedback, correct the mistake, and practice again",
      explanation: "Competency improves through feedback and correction.",
      keywords: ["mistake", "feedback", competency],
    },
    {
      prompt: `What must happen before the next roadmap step unlocks after "${competency}"?`,
      options: [
        "The trainee passes the exam and the professor checks the competency",
        "The trainee opens the page once",
        "The trainee changes their profile photo",
        "The trainee skips all questions",
      ],
      answer: "The trainee passes the exam and the professor checks the competency",
      explanation: "The roadmap requires both exam passing and professor competency checking.",
      keywords: ["unlock", "professor", "exam"],
    },
    {
      prompt: `Which attitude is most appropriate while learning "${competency}"?`,
      options: [
        "Professional, respectful, and willing to improve",
        "Careless and unwilling to listen",
        "Absent during practice",
        "Focused only on finishing quickly",
      ],
      answer: "Professional, respectful, and willing to improve",
      explanation: "Professional attitude supports successful skills training.",
      keywords: ["professionalism", "attitude", competency],
    },
    {
      prompt: `What should the trainee do before taking the exam for "${competency}"?`,
      options: [
        "Review the study module, lesson points, and checklist",
        "Answer randomly",
        "Close the roadmap",
        "Wait for another trainee to answer",
      ],
      answer: "Review the study module, lesson points, and checklist",
      explanation: "Reviewing helps the trainee answer accurately and understand the skill.",
      keywords: ["review", "exam", competency],
    },
  ].map((question) => normalizeQuestion(question, { course: courseName, groupTitle: group, label: competency }));
}

function buildStudyPoints({ course = "", groupTitle = "", label = "" } = {}) {
  const courseName = normalizeTrainingCourseName(course) || clean(course) || "this course";
  const competency = clean(label || "this competency");
  const group = clean(groupTitle || "Competency");

  return [
    `Understand the purpose of ${competency} in ${courseName}.`,
    `Practice the correct steps, safety rules, and quality standards connected to ${group}.`,
    `Prepare to explain and demonstrate ${competency} during professor checking.`,
  ];
}

function readArray(raw, key, fallbackKeys = []) {
  const direct = raw?.[key];
  if (Array.isArray(direct)) return uniqueStrings(direct);
  if (typeof direct === "string") return uniqueStrings(direct.split("\n"));

  for (const altKey of fallbackKeys) {
    const alt = raw?.[altKey];
    if (Array.isArray(alt)) return uniqueStrings(alt);
    if (typeof alt === "string") return uniqueStrings(alt.split("\n"));
  }

  return [];
}

function readString(raw, key, fallbackKeys = []) {
  const direct = clean(raw?.[key]);
  if (direct) return direct;

  for (const altKey of fallbackKeys) {
    const alt = clean(raw?.[altKey]);
    if (alt) return alt;
  }

  return "";
}

function buildDefaultStudyModule({ course = "", groupTitle = "", label = "", description = "", studyPoints = [] } = {}) {
  const courseName = normalizeTrainingCourseName(course) || clean(course) || "this course";
  const competency = clean(label || "this competency");
  const group = clean(groupTitle || "Competency");
  const points = uniqueStrings(studyPoints).length
    ? uniqueStrings(studyPoints)
    : buildStudyPoints({ course: courseName, groupTitle: group, label: competency });

  return {
    studyModuleOverview:
      clean(description) ||
      `This study module explains ${competency} as part of ${group} in ${courseName}. Trainees should review this before taking the competency exam.`,
    learningObjectives: [
      `Explain the purpose of ${competency}.`,
      `Apply ${competency} using correct training standards.`,
      `Prepare to demonstrate ${competency} during professor checking.`,
    ],
    lessonDiscussion: [
      `${competency} is an important competency in ${courseName}. It helps trainees understand what must be done, why it matters, and how it should be applied during training or workplace situations.`,
      `Trainees should study the lesson points, practice the procedure, and ask the professor for clarification if any step is unclear.`,
      `This competency becomes complete only after the trainee passes the exam and the professor confirms the competency check.`,
    ],
    stepByStepProcedure: [
      "Read and understand the module overview.",
      "Review each lesson point carefully.",
      "Practice the competency using the correct procedure.",
      "Ask the professor for feedback or clarification.",
      "Take the competency exam when ready.",
    ],
    workplaceScenario: `In a realistic ${courseName} training situation, the trainee must apply ${competency} properly, follow instructions, and show professional behavior while performing the task.`,
    practiceActivity: `Write or demonstrate how you would apply ${competency}. Include the correct steps, safety or quality reminders, and what you should do if you need help.`,
    keyTerms: uniqueStrings([competency, group, courseName, "Competency", "Assessment"]),
    readinessChecklist: [
      "I reviewed the module overview.",
      "I studied the lesson points.",
      "I understand the procedure.",
      "I am ready to answer the exam.",
    ],
  };
}

export function normalizeRoadmapCompetencyGroups(groups = [], course = "") {
  const courseName = normalizeTrainingCourseName(course) || clean(course) || "Training";
  const courseKey = slugify(courseName).toUpperCase() || "GEN";
  const safeGroups = Array.isArray(groups) ? groups : [];

  return safeGroups
    .map((group, groupIndex) => {
      const title = clean(group?.title) || `Competency Group ${groupIndex + 1}`;
      const rawItems = Array.isArray(group?.items) ? group.items : [];

      const items = rawItems
        .map((item, itemIndex) => {
          const code = clean(item?.code) || `${courseKey}-${String(groupIndex + 1).padStart(2, "0")}-${String(itemIndex + 1).padStart(2, "0")}`;
          const label = clean(item?.label) || code;
          const studyPoints = uniqueStrings(item?.studyPoints).length
            ? uniqueStrings(item.studyPoints)
            : buildStudyPoints({ course: courseName, groupTitle: title, label });
          const rawQuestions = Array.isArray(item?.examQuestions) ? item.examQuestions : [];
          const examQuestions = rawQuestions.length
            ? rawQuestions.map((question) => normalizeQuestion(question, { course: courseName, groupTitle: title, label }))
            : buildDefaultExamQuestions({ course: courseName, groupTitle: title, label, code });

          const defaultStudyModule = buildDefaultStudyModule({
            course: courseName,
            groupTitle: title,
            label,
            description: item?.description,
            studyPoints,
          });
          const studyModule = item?.studyModule && typeof item.studyModule === "object" ? item.studyModule : {};

          return {
            code,
            label,
            description:
              clean(item?.description) ||
              `Study, practice, and demonstrate ${label} as part of ${courseName}.`,
            studyPoints,
            studyModuleOverview:
              readString(item, "studyModuleOverview", ["overview"]) ||
              readString(studyModule, "overview", ["studyModuleOverview"]) ||
              defaultStudyModule.studyModuleOverview,
            learningObjectives:
              readArray(item, "learningObjectives", ["objectives"]).length
                ? readArray(item, "learningObjectives", ["objectives"])
                : readArray(studyModule, "objectives", ["learningObjectives"]).length
                ? readArray(studyModule, "objectives", ["learningObjectives"])
                : defaultStudyModule.learningObjectives,
            lessonDiscussion:
              readArray(item, "lessonDiscussion", ["discussion"]).length
                ? readArray(item, "lessonDiscussion", ["discussion"])
                : readArray(studyModule, "discussion", ["lessonDiscussion"]).length
                ? readArray(studyModule, "discussion", ["lessonDiscussion"])
                : defaultStudyModule.lessonDiscussion,
            stepByStepProcedure:
              readArray(item, "stepByStepProcedure", ["procedures"]).length
                ? readArray(item, "stepByStepProcedure", ["procedures"])
                : readArray(studyModule, "procedures", ["stepByStepProcedure"]).length
                ? readArray(studyModule, "procedures", ["stepByStepProcedure"])
                : defaultStudyModule.stepByStepProcedure,
            workplaceScenario:
              readString(item, "workplaceScenario", ["scenario"]) ||
              readString(studyModule, "scenario", ["workplaceScenario"]) ||
              defaultStudyModule.workplaceScenario,
            practiceActivity:
              readString(item, "practiceActivity", ["activity"]) ||
              readString(studyModule, "activity", ["practiceActivity"]) ||
              defaultStudyModule.practiceActivity,
            keyTerms:
              readArray(item, "keyTerms").length
                ? readArray(item, "keyTerms")
                : readArray(studyModule, "keyTerms").length
                ? readArray(studyModule, "keyTerms")
                : defaultStudyModule.keyTerms,
            readinessChecklist:
              readArray(item, "readinessChecklist", ["checklist"]).length
                ? readArray(item, "readinessChecklist", ["checklist"])
                : readArray(studyModule, "checklist", ["readinessChecklist"]).length
                ? readArray(studyModule, "checklist", ["readinessChecklist"])
                : defaultStudyModule.readinessChecklist,
            examQuestions,
            sequence: safeNumber(item?.sequence, itemIndex + 1) || itemIndex + 1,
            active: item?.active === undefined ? true : item.active !== false,
          };
        })
        .filter((item) => item.code && item.label && item.active !== false)
        .sort((a, b) => Number(a.sequence || 0) - Number(b.sequence || 0));

      return {
        title,
        sequence: safeNumber(group?.sequence, groupIndex + 1) || groupIndex + 1,
        items,
      };
    })
    .filter((group) => group.title && group.items.length)
    .sort((a, b) => Number(a.sequence || 0) - Number(b.sequence || 0));
}

export function buildDefaultRoadmapForCourse(course = "") {
  const courseName = normalizeTrainingCourseName(course) || clean(course) || "Training";
  const fallback = getFallbackProgressConfig(courseName);
  const groups = normalizeRoadmapCompetencyGroups(fallback?.competencyGroups || [], courseName);

  return {
    requiredOnlineClasses: safeNumber(fallback?.requiredOnlineClasses, 0),
    requiredFaceToFaceClasses: safeNumber(fallback?.requiredFaceToFaceClasses, 0),
    onlineAttendanceBasis: fallback?.onlineAttendanceBasis || "verified_professor_attendance",
    faceToFaceAttendanceBasis: fallback?.faceToFaceAttendanceBasis || "none",
    certificatePreviewImage: fallback?.certificatePreviewImage || "",
    progressWeights: {
      online: safeNumber(fallback?.weights?.online, 0),
      faceToFace: safeNumber(fallback?.weights?.faceToFace, 0),
      competencies: safeNumber(fallback?.weights?.competencies, 70),
      pretest: safeNumber(fallback?.weights?.pretest, 30),
    },
    competencyGroups: groups,
  };
}

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findCourseDoc(course = "") {
  const name = normalizeTrainingCourseName(course) || clean(course);
  if (!name) return null;

  return TrainingCourse.findOne({
    $or: [
      { name: new RegExp(`^${escapeRegex(name)}$`, "i") },
      { slug: slugify(name) },
    ],
  }).lean();
}

export async function getCourseProgressConfigForCourse(course = "") {
  const normalizedCourse = normalizeTrainingCourseName(course) || clean(course);
  if (!normalizedCourse) return null;

  const fallback = buildDefaultRoadmapForCourse(normalizedCourse);
  const courseDoc = await findCourseDoc(normalizedCourse);

  if (!courseDoc) {
    return {
      course: normalizedCourse,
      courseKey: slugify(normalizedCourse),
      requiredOnlineClasses: fallback.requiredOnlineClasses,
      requiredFaceToFaceClasses: fallback.requiredFaceToFaceClasses,
      onlineAttendanceBasis: fallback.onlineAttendanceBasis,
      faceToFaceAttendanceBasis: fallback.faceToFaceAttendanceBasis,
      certificatePreviewImage: fallback.certificatePreviewImage,
      competencyGroups: fallback.competencyGroups,
      weights: fallback.progressWeights,
    };
  }

  const rawGroups = Array.isArray(courseDoc.competencyGroups) && courseDoc.competencyGroups.length
    ? courseDoc.competencyGroups
    : fallback.competencyGroups;

  return {
    course: courseDoc.name || normalizedCourse,
    courseKey: courseDoc.slug || slugify(courseDoc.name || normalizedCourse),
    requiredOnlineClasses: safeNumber(courseDoc.requiredOnlineClasses, fallback.requiredOnlineClasses),
    requiredFaceToFaceClasses: safeNumber(courseDoc.requiredFaceToFaceClasses, fallback.requiredFaceToFaceClasses),
    onlineAttendanceBasis: courseDoc.onlineAttendanceBasis || fallback.onlineAttendanceBasis,
    faceToFaceAttendanceBasis: courseDoc.faceToFaceAttendanceBasis || fallback.faceToFaceAttendanceBasis,
    certificatePreviewImage: courseDoc.certificatePreviewImage || fallback.certificatePreviewImage || "",
    competencyGroups: normalizeRoadmapCompetencyGroups(rawGroups, courseDoc.name || normalizedCourse),
    weights: {
      online: safeNumber(courseDoc.progressWeights?.online, fallback.progressWeights.online),
      faceToFace: safeNumber(courseDoc.progressWeights?.faceToFace, fallback.progressWeights.faceToFace),
      competencies: safeNumber(courseDoc.progressWeights?.competencies, fallback.progressWeights.competencies),
      pretest: safeNumber(courseDoc.progressWeights?.pretest, fallback.progressWeights.pretest),
    },
  };
}

export async function getCourseCompetencyGroupsForCourse(course = "") {
  return (await getCourseProgressConfigForCourse(course))?.competencyGroups || [];
}

export async function getCourseCompetencyCodesForCourse(course = "") {
  return (await getCourseCompetencyGroupsForCourse(course))
    .flatMap((group) => group.items || [])
    .map((item) => item.code)
    .filter(Boolean);
}

export default {
  buildDefaultExamQuestions,
  buildDefaultRoadmapForCourse,
  normalizeRoadmapCompetencyGroups,
  getCourseProgressConfigForCourse,
  getCourseCompetencyGroupsForCourse,
  getCourseCompetencyCodesForCourse,
};

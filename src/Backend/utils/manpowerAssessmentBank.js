// src/Backend/utils/manpowerAssessmentBank.js

const JOB_PROFILES = {
  "Accounting Clerk": {
    primaryDuty: "Recording transactions and organizing financial documents",
    keySkill: "Accuracy in numbers and records",
    safetyFocus: "confidentiality and document accuracy",
    qualityGoal: "accurate bookkeeping and complete records",
    toolOrMethod: "spreadsheets, receipts, and organized filing",
  },
  "General Clerk": {
    primaryDuty: "Handling clerical work, records, and office documents",
    keySkill: "Organized clerical support and attention to detail",
    safetyFocus: "proper filing, data accuracy, and office procedure compliance",
    qualityGoal: "organized records and accurate office support",
    toolOrMethod: "filing systems, forms, and office records",
  },
  "Money Sorter": {
    primaryDuty: "Sorting, counting, and verifying cash accurately",
    keySkill: "Careful counting and attention to detail",
    safetyFocus: "cash accuracy and secure handling procedures",
    qualityGoal: "accurate cash sorting and reduced discrepancies",
    toolOrMethod: "counting procedures, verification, and secure handling",
  },
  "Data Encoder": {
    primaryDuty: "Encoding data accurately into records or systems",
    keySkill: "Fast and accurate data entry",
    safetyFocus: "data accuracy and careful record checking",
    qualityGoal: "accurate encoded data and complete records",
    toolOrMethod: "computer systems, spreadsheets, and data checking",
  },
  "Admin Assistant": {
    primaryDuty: "Supporting office operations, scheduling, and documentation",
    keySkill: "Administrative coordination and communication",
    safetyFocus: "document accuracy and proper office coordination",
    qualityGoal: "smooth office support and organized documentation",
    toolOrMethod: "email, calendars, documents, and coordination",
  },
  "HR Assistant": {
    primaryDuty: "Supporting recruitment, records, and employee documentation",
    keySkill: "Confidential record handling and communication",
    safetyFocus: "confidentiality and accurate employee records",
    qualityGoal: "organized HR records and timely coordination",
    toolOrMethod: "employee files, screening records, and communication",
  },
  "Production Worker": {
    primaryDuty: "Assisting production tasks, assembly, and packing work",
    keySkill: "Following instructions and maintaining productivity",
    safetyFocus: "safe production work and correct process execution",
    qualityGoal: "consistent production output and product quality",
    toolOrMethod: "production procedures, teamwork, and careful handling",
  },
  Warehouseman: {
    primaryDuty: "Receiving, storing, and releasing warehouse stocks properly",
    keySkill: "Inventory handling and organization",
    safetyFocus: "safe stock handling and correct inventory movement",
    qualityGoal: "organized inventory and accurate stock control",
    toolOrMethod: "inventory logs, stock arrangement, and warehouse procedures",
  },
  Stockman: {
    primaryDuty: "Monitoring, replenishing, and organizing stocks",
    keySkill: "Stock monitoring and organization",
    safetyFocus: "proper stock arrangement and accurate counting",
    qualityGoal: "complete shelf stocks and accurate inventory levels",
    toolOrMethod: "stock counts, replenishment, and inventory checks",
  },
  "Sales Coordinator": {
    primaryDuty: "Coordinating sales documents, reports, and customer follow-ups",
    keySkill: "Coordination and customer-related documentation",
    safetyFocus: "accurate reports and timely coordination",
    qualityGoal: "organized sales support and timely follow-up",
    toolOrMethod: "sales reports, communication, and document tracking",
  },
  "Financial Advisor": {
    primaryDuty: "Explaining financial products and guiding clients responsibly",
    keySkill: "Client communication and financial product understanding",
    safetyFocus: "accurate information and responsible client handling",
    qualityGoal: "clear client guidance and trustworthy recommendations",
    toolOrMethod: "client interviews, product explanations, and documentation",
  },
  Engineer: {
    primaryDuty: "Applying technical knowledge to solve engineering tasks",
    keySkill: "Technical analysis and problem solving",
    safetyFocus: "safe technical work and compliance with standards",
    qualityGoal: "safe, efficient, and technically sound work output",
    toolOrMethod: "technical plans, inspection, and standard procedures",
  },
  Driver: {
    primaryDuty: "Transporting people, goods, or documents safely and on time",
    keySkill: "Safe driving and route awareness",
    safetyFocus: "road safety, vehicle checks, and compliance with traffic rules",
    qualityGoal: "safe transport and timely delivery",
    toolOrMethod: "vehicle inspection, defensive driving, and route planning",
  },
  Promodiser: {
    primaryDuty: "Promoting products and assisting customers in stores",
    keySkill: "Product presentation and customer interaction",
    safetyFocus: "proper display standards and professional customer handling",
    qualityGoal: "effective product promotion and customer assistance",
    toolOrMethod: "product knowledge, displays, and customer communication",
  },
  Merchandiser: {
    primaryDuty: "Arranging displays and maintaining product availability in stores",
    keySkill: "Display organization and stock monitoring",
    safetyFocus: "proper product arrangement and inventory checking",
    qualityGoal: "attractive displays and complete product availability",
    toolOrMethod: "display planning, stock checks, and store coordination",
  },
  Messenger: {
    primaryDuty: "Delivering documents and items accurately and on time",
    keySkill: "Reliability and route coordination",
    safetyFocus: "safe document handling and timely delivery",
    qualityGoal: "secure delivery and accurate handoff of items",
    toolOrMethod: "delivery logs, route planning, and coordination",
  },
  "Forklift Operator": {
    primaryDuty: "Operating a forklift safely to move warehouse goods",
    keySkill: "Safe equipment operation and careful material handling",
    safetyFocus: "forklift safety and secure load movement",
    qualityGoal: "safe transfer of goods and minimal handling errors",
    toolOrMethod: "equipment inspection, safe lifting, and warehouse coordination",
  },
  Janitor: {
    primaryDuty: "Cleaning facilities and maintaining sanitary surroundings",
    keySkill: "Cleanliness, consistency, and sanitation awareness",
    safetyFocus: "safe cleaning practices and sanitation standards",
    qualityGoal: "clean, safe, and sanitary work areas",
    toolOrMethod: "cleaning schedules, sanitation materials, and proper procedures",
  },
};

function cleanVacancy(value = "") {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function getGenericProfile(vacancy = "Selected Job") {
  return {
    primaryDuty: `Performing the assigned duties of a ${vacancy}`,
    keySkill: "Reliability, communication, and attention to detail",
    safetyFocus: "company procedures, workplace safety, and proper task execution",
    qualityGoal: "safe, reliable, and quality work output",
    toolOrMethod: "company tools, standard procedures, teamwork, and communication",
  };
}

function slugify(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueOptions(values = []) {
  return [...new Set(values.filter(Boolean).map((item) => String(item).trim()))];
}

function getDistractorFieldValues(currentVacancy, field, count = 3) {
  return Object.entries(JOB_PROFILES)
    .filter(([vacancy]) => vacancy !== currentVacancy)
    .map(([, profile]) => profile?.[field] || "")
    .filter(Boolean)
    .slice(0, count);
}

function insertCorrectOption(correct, distractors, seedText = "") {
  const options = uniqueOptions([correct, ...distractors]).slice(0, 4);
  const withoutCorrect = options.filter((item) => item !== correct);

  const seed = String(seedText || "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const insertAt = withoutCorrect.length
    ? seed % (withoutCorrect.length + 1)
    : 0;

  const finalOptions = [...withoutCorrect];
  finalOptions.splice(insertAt, 0, correct);

  return finalOptions.slice(0, 4);
}

function buildExamQuestions(vacancy, profile) {
  const dutyOptions = insertCorrectOption(
    profile.primaryDuty,
    getDistractorFieldValues(vacancy, "primaryDuty", 3),
    `${vacancy}-q1`
  );

  const skillOptions = insertCorrectOption(
    profile.keySkill,
    getDistractorFieldValues(vacancy, "keySkill", 3),
    `${vacancy}-q2`
  );

  return [
    {
      id: "q1",
      questionText: `Which task best matches the role of a ${vacancy}?`,
      questionType: "multiple_choice",
      choices: dutyOptions,
      correctAnswer: profile.primaryDuty,
      maxPoints: 10,
    },
    {
      id: "q2",
      questionText: `Which quality is most important for a ${vacancy} to perform well?`,
      questionType: "multiple_choice",
      choices: skillOptions,
      correctAnswer: profile.keySkill,
      maxPoints: 10,
    },
    {
      id: "q3",
      questionText: `True or False: Following ${profile.safetyFocus} helps a ${vacancy} work safely and effectively.`,
      questionType: "true_false",
      choices: ["True", "False"],
      correctAnswer: "True",
      maxPoints: 10,
    },
    {
      id: "q4",
      questionText: `Why is ${profile.qualityGoal} important for a ${vacancy}?`,
      questionType: "short_answer",
      expectedAnswer: `A good answer should explain that ${profile.qualityGoal} is important because it helps the employee perform ${profile.primaryDuty.toLowerCase()}, maintain work quality, and support safe or reliable operations.`,
      rubric: [
        {
          criterion: `Mentions ${profile.qualityGoal}`,
          points: 4,
          keywords: profile.qualityGoal
            .toLowerCase()
            .split(/[\s,]+/)
            .filter((word) => word.length > 3)
            .slice(0, 4),
        },
        {
          criterion: `Connects the answer to ${profile.primaryDuty.toLowerCase()}`,
          points: 3,
          keywords: profile.primaryDuty
            .toLowerCase()
            .split(/[\s,]+/)
            .filter((word) => word.length > 3)
            .slice(0, 4),
        },
        {
          criterion: "Explains work quality, safety, or reliability",
          points: 3,
          keywords: [
            "quality",
            "safe",
            "safety",
            "reliable",
            "accuracy",
            "effective",
          ],
        },
      ],
      maxPoints: 10,
      aiEvaluationEnabled: true,
    },
    {
      id: "q5",
      questionText: `If you are hired as a ${vacancy}, how will you use ${profile.toolOrMethod} and communication to do the job well?`,
      questionType: "short_answer",
      expectedAnswer: `A strong answer should mention using ${profile.toolOrMethod}, following company procedures, communicating clearly with supervisors or teammates, and doing the work responsibly.`,
      rubric: [
        {
          criterion: `Mentions ${profile.toolOrMethod}`,
          points: 4,
          keywords: profile.toolOrMethod
            .toLowerCase()
            .split(/[\s,]+/)
            .filter((word) => word.length > 3)
            .slice(0, 4),
        },
        {
          criterion: "Mentions communication or coordination",
          points: 3,
          keywords: [
            "communicate",
            "communication",
            "coordinate",
            "report",
            "inform",
            "team",
          ],
        },
        {
          criterion: "Mentions following procedures or responsibility",
          points: 3,
          keywords: [
            "procedure",
            "responsible",
            "follow",
            "careful",
            "proper",
            "standard",
          ],
        },
      ],
      maxPoints: 10,
      aiEvaluationEnabled: true,
    },
  ];
}

export function getManpowerExamByVacancy(vacancy = "") {
  const normalizedVacancy = cleanVacancy(vacancy);

  if (!normalizedVacancy) {
    return null;
  }

  const profile = JOB_PROFILES[normalizedVacancy] || getGenericProfile(normalizedVacancy);
  const questions = buildExamQuestions(normalizedVacancy, profile);

  const maxScore = questions.reduce(
    (sum, item) => sum + Number(item.maxPoints || 0),
    0
  );

  return {
    examId: `manpower-exam-${slugify(normalizedVacancy)}`,
    vacancy: normalizedVacancy,
    title: `${normalizedVacancy} Qualifying Exam`,
    passingScore: 70,
    maxScore,
    questions,
  };
}

export function sanitizeManpowerExamForApplicant(exam) {
  if (!exam) return null;

  return {
    examId: exam.examId,
    vacancy: exam.vacancy,
    title: exam.title,
    passingScore: exam.passingScore,
    maxScore: exam.maxScore,
    questions: (exam.questions || []).map((question) => ({
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      choices: Array.isArray(question.choices) ? question.choices : [],
      maxPoints: question.maxPoints,
    })),
  };
}
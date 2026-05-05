import ManpowerJob from "../models/ManpowerJob.js";
import { REQUIRED_REQUIREMENTS } from "../utils/manpowerConstants.js";

const FAQS = [
  {
    question: "How do I apply for a manpower job opening?",
    answer:
      "Go to the Manpower Services page and click Apply Now. Fill out the application form completely, choose your preferred job offer, upload all required documents, and submit your application.",
  },
  {
    question: "What requirements do I need to submit?",
    answer:
      "Applicants are required to upload a Valid ID, Resume, NBI, Barangay Clearance, SSS, PhilHealth, Pag-IBIG, TIN, Transcript of Records, Diploma, Birth Certificate, 1x1 Picture, and 2x2 Picture.",
  },
  {
    question: "Can I apply for more than one vacancy?",
    answer:
      "The current application form is designed for one vacancy per submission. Choose the job offer that best matches your qualifications before submitting your application.",
  },
  {
    question: "Who can apply for manpower services?",
    answer:
      "Applicants who meet the job qualifications, are ready to submit complete requirements, and pass the screening and evaluation process may apply.",
  },
  {
    question: "Is there an age requirement for applicants?",
    answer:
      "Yes. Based on the current manpower application form validation, applicants must be between 18 and 60 years old.",
  },
  {
    question: "What happens after I submit my application?",
    answer:
      "Your application will go through initial validation and screening. Your uploaded valid ID and resume may also be checked by the system. After that, your application will be reviewed by HR.",
  },
  {
    question: "Will I take an exam after applying?",
    answer:
      "Yes. After a successful application submission, applicants proceed to a qualifying exam that is based on the selected vacancy.",
  },
  {
    question: "What if I already used my email before?",
    answer:
      "Each manpower application must use a unique email address. If your email was already used in a previous submission, the system will not allow another application using the same email.",
  },
  {
    question: "How will I know if I am scheduled for an interview?",
    answer:
      "If your application passes HR review, you may receive an interview schedule through the email address you used in your application.",
  },
  {
    question: "What happens if I get hired?",
    answer:
      "Once hired, the system creates your manpower employee account. Your company email and temporary password will be sent to your email so you can access the employee side.",
  },
  {
    question: "How do I log in as a manpower employee?",
    answer:
      "Use the company email and temporary password provided after hiring. Once logged in, you can access your employee home page, profile, and payroll records.",
  },
  {
    question: "Can I change my password?",
    answer:
      "Yes. Employees can request an OTP for password change. The OTP will be sent to the registered email address connected to the employee account.",
  },
  {
    question: "How can I check my payroll?",
    answer:
      "After logging in to the manpower employee account, go to the Payroll section to view your available payroll history and saved payroll details.",
  },
  {
    question: "Where can I contact manpower services?",
    answer:
      "You can use the Contact Us page to send your message, inquiry, or follow-up concern regarding manpower application, interview, or employment matters.",
  },
];

const CONTACT_INFO = {
  address: "2/F 544 Curie Street, Palanan, Makati City",
  phones: ["09959808051", "09516281271"],
  emails: ["ltc.tamis@gmail.com", "lorengladisu@ltcmultiservices.com"],
  hours: "Monday - Thursday | 8:00 AM - 5:00 PM",
};

const FALLBACK_VACANCIES = [
  "Accounting Clerk",
  "General Clerk",
  "Money Sorter",
  "Data Encoder",
  "Admin Assistant",
  "HR Assistant",
  "Production Worker",
  "Warehouseman",
  "Stockman",
  "Sales Coordinator",
  "Financial Advisor",
  "Engineer",
  "Driver",
  "Promodiser",
  "Merchandiser",
  "Messenger",
  "Forklift Operator",
  "Janitor",
];

function cleanText(value = "") {
  return String(value || "").trim();
}

function lowerText(value = "") {
  return cleanText(value).toLowerCase();
}

function uniqueList(items = []) {
  return [
    ...new Set(items.map((item) => String(item || "").trim()).filter(Boolean)),
  ];
}

function normalizeHistory(history = []) {
  if (!Array.isArray(history)) return [];

  return history
    .map((item) => ({
      role: item?.role === "assistant" ? "assistant" : "user",
      text: cleanText(item?.text || ""),
    }))
    .filter((item) => item.text)
    .slice(-8);
}

async function getActiveVacancies() {
  try {
    const jobs = await ManpowerJob.find({ active: true })
      .select("title dailyRate description qualifications")
      .sort({ title: 1 })
      .lean();

    const titles = jobs
      .map((job) => String(job?.title || "").trim())
      .filter(Boolean);

    return {
      jobs,
      titles: titles.length ? titles : FALLBACK_VACANCIES,
    };
  } catch (error) {
    console.error("getActiveVacancies chatbot error:", error);

    return {
      jobs: [],
      titles: FALLBACK_VACANCIES,
    };
  }
}

function formatRequirements() {
  const labelMap = {
    validId: "Valid ID",
    resume: "Resume",
    nbi: "NBI",
    barangayClearance: "Barangay Clearance",
    sss: "SSS",
    philhealth: "PhilHealth",
    pagibig: "Pag-IBIG",
    tin: "TIN",
    transcriptOfRecords: "Transcript of Records",
    diploma: "Diploma",
    birthCertificate: "Birth Certificate",
    photo1x1: "1x1 Picture",
    photo2x2: "2x2 Picture",
  };

  return REQUIRED_REQUIREMENTS.map((key) => labelMap[key] || key);
}

function getFaqMatches(question = "") {
  const q = lowerText(question);
  if (!q) return [];

  const tokens = uniqueList(
    q.split(/[^a-z0-9]+/i).filter((word) => word.length >= 3)
  );

  return FAQS.map((faq) => {
    const haystack = `${faq.question} ${faq.answer}`.toLowerCase();
    let score = 0;

    for (const token of tokens) {
      if (haystack.includes(token)) score += 1;
    }

    if (haystack.includes(q)) score += 5;

    return { ...faq, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function getGreetingReply() {
  return "Hello. I’m the LTC Manpower Services assistant. You can ask me about job openings, requirements, applying, exams, interview schedules, employee login, OTP password change, payroll, and contact details.";
}

function getVacancyReply(vacancies = []) {
  const list = Array.isArray(vacancies) && vacancies.length ? vacancies : FALLBACK_VACANCIES;

  return `These are the current manpower job openings: ${list.join(", ")}.`;
}

function getRequirementsReply() {
  return `The required documents are: ${formatRequirements().join(", ")}.`;
}

function getApplyReply() {
  return "To apply, go to Manpower Services, open Apply Now, choose your preferred job offer, complete the application form, upload all required documents, and submit your application.";
}

function getExamReply() {
  return "Yes. After a successful application submission, applicants proceed to a qualifying exam based on the selected vacancy.";
}

function getInterviewReply() {
  return "If your application passes HR review, you may receive an interview schedule through the email address you used in your application.";
}

function getHireReply() {
  return "Once hired, the system creates your manpower employee account and sends your company email plus temporary password to your email address.";
}

function getEmployeeLoginReply() {
  return "Manpower employees log in using the company email and temporary password provided after hiring. Once logged in, they can access their home page, profile, and payroll records.";
}

function getOtpReply() {
  return "Yes. Employees can request an OTP for password change. The OTP is sent to the registered email address connected to the employee account.";
}

function getPayrollReply() {
  return "After logging in to the manpower employee account, go to the Payroll section to view available payroll history and saved payroll details.";
}

function getContactReply() {
  return `You can contact LTC Manpower Services at ${CONTACT_INFO.address}. Phone: ${CONTACT_INFO.phones.join(
    " / "
  )}. Email: ${CONTACT_INFO.emails.join(" / ")}. Office hours: ${
    CONTACT_INFO.hours
  }.`;
}

function getEmailUsedReply() {
  return "Each manpower application must use a unique email address. If your email was already used in a previous application, the system will not allow another application using the same email.";
}

function getAgeReply() {
  return "Applicants must be between 18 and 60 years old.";
}

function getFallbackReply() {
  return "I can help with manpower job openings, requirements, application steps, exams, interview schedules, employee login, OTP password change, payroll, and contact details. Try asking: What job openings are available, What requirements do I need, or How do I apply?";
}

function detectIntent(text = "") {
  const q = lowerText(text);

  if (!q) return "";

  if (
    q.includes("hello") ||
    q.includes("hi") ||
    q.includes("good morning") ||
    q.includes("good afternoon")
  ) {
    return "greeting";
  }

  if (
    q.includes("requirement") ||
    q.includes("requirements") ||
    q.includes("document") ||
    q.includes("documents")
  ) {
    return "requirements";
  }

  if (
    q.includes("apply") ||
    q.includes("application") ||
    q.includes("how to apply")
  ) {
    return "apply";
  }

  if (q.includes("exam") || q.includes("qualifying")) {
    return "exam";
  }

  if (
    q.includes("interview") ||
    q.includes("schedule") ||
    q.includes("scheduled")
  ) {
    return "interview";
  }

  if (
    q.includes("hired") ||
    q.includes("hire") ||
    q.includes("employee account")
  ) {
    return "hire";
  }

  if (
    q.includes("otp") ||
    q.includes("change password") ||
    q.includes("forgot password")
  ) {
    return "otp";
  }

  if (q.includes("payroll") || q.includes("salary")) {
    return "payroll";
  }

  if (
    q.includes("contact") ||
    q.includes("address") ||
    q.includes("location") ||
    q.includes("phone") ||
    q.includes("office")
  ) {
    return "contact";
  }

  if (
    q.includes("already used") ||
    q.includes("used my email") ||
    q.includes("duplicate email")
  ) {
    return "email_used";
  }

  if (q.includes("age")) {
    return "age";
  }

  if (
    q.includes("login") ||
    q.includes("log in") ||
    q.includes("sign in") ||
    q.includes("employee")
  ) {
    return "employee_login";
  }

  if (
    q.includes("job") ||
    q.includes("jobs") ||
    q.includes("vacancy") ||
    q.includes("vacancies") ||
    q.includes("job offer") ||
    q.includes("positions") ||
    q.includes("opening") ||
    q.includes("openings")
  ) {
    return "vacancy";
  }

  return "";
}

function replyFromIntent(intent = "", context = {}) {
  switch (intent) {
    case "greeting":
      return getGreetingReply();
    case "requirements":
      return getRequirementsReply();
    case "apply":
      return getApplyReply();
    case "exam":
      return getExamReply();
    case "interview":
      return getInterviewReply();
    case "hire":
      return getHireReply();
    case "employee_login":
      return getEmployeeLoginReply();
    case "otp":
      return getOtpReply();
    case "payroll":
      return getPayrollReply();
    case "contact":
      return getContactReply();
    case "email_used":
      return getEmailUsedReply();
    case "age":
      return getAgeReply();
    case "vacancy":
      return getVacancyReply(context.vacancies);
    default:
      return "";
  }
}

function isFollowUpQuestion(question = "") {
  const q = lowerText(question);

  return (
    q === "how about that" ||
    q === "what about that" ||
    q === "and that" ||
    q === "what about it" ||
    q === "how about it" ||
    q === "more" ||
    q === "next" ||
    q === "what else"
  );
}

async function buildReply(question = "", history = []) {
  const currentQuestion = lowerText(question);
  const vacancyData = await getActiveVacancies();

  const context = {
    vacancies: vacancyData.titles,
    jobs: vacancyData.jobs,
  };

  if (!currentQuestion) return getGreetingReply();

  const currentIntent = detectIntent(currentQuestion);
  if (currentIntent) {
    return replyFromIntent(currentIntent, context);
  }

  const currentFaqMatches = getFaqMatches(currentQuestion);
  if (currentFaqMatches.length > 0) {
    return currentFaqMatches.map((item) => item.answer).join(" ");
  }

  if (isFollowUpQuestion(currentQuestion)) {
    const lastUserMessage = [...history]
      .reverse()
      .find(
        (item) =>
          item.role === "user" && lowerText(item.text) !== currentQuestion
      );

    if (lastUserMessage) {
      const lastIntent = detectIntent(lastUserMessage.text);
      if (lastIntent) {
        return replyFromIntent(lastIntent, context);
      }

      const lastFaqMatches = getFaqMatches(lastUserMessage.text);
      if (lastFaqMatches.length > 0) {
        return lastFaqMatches.map((item) => item.answer).join(" ");
      }
    }
  }

  return getFallbackReply();
}

export async function askManpowerChatbot(req, res) {
  try {
    const question = cleanText(req.body?.question);
    const history = normalizeHistory(req.body?.history);

    if (!question) {
      return res.status(400).json({
        message: "Question is required.",
      });
    }

    const reply = await buildReply(question, history);

    return res.json({
      reply,
    });
  } catch (error) {
    console.error("askManpowerChatbot error:", error);

    return res.status(500).json({
      message: "Failed to process chatbot request.",
    });
  }
}
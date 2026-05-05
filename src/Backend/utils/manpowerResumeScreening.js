import OpenAI from "openai";

const SUPPORTED_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const VACANCY_KEYWORDS = {
  "Accounting Clerk": [
    "accounting",
    "bookkeeping",
    "accounts payable",
    "accounts receivable",
    "invoice",
    "ledger",
    "excel",
    "financial report",
  ],
  "General Clerk": [
    "filing",
    "clerical",
    "records",
    "encoding",
    "office",
    "documentation",
    "data entry",
  ],
  "Money Sorter": [
    "cash handling",
    "money counting",
    "sorting",
    "accuracy",
    "attention to detail",
    "banking",
  ],
  "Data Encoder": [
    "data entry",
    "typing",
    "excel",
    "spreadsheet",
    "accuracy",
    "database",
    "computer literate",
  ],
  "Admin Assistant": [
    "administrative",
    "scheduling",
    "email",
    "filing",
    "microsoft office",
    "coordination",
  ],
  "HR Assistant": [
    "recruitment",
    "screening",
    "interview",
    "employee records",
    "hr",
    "onboarding",
  ],
  "Production Worker": [
    "production",
    "assembly",
    "packing",
    "machine operation",
    "warehouse",
    "manufacturing",
  ],
  Warehouseman: [
    "warehouse",
    "inventory",
    "stock",
    "loading",
    "unloading",
    "receiving",
    "delivery",
  ],
  Stockman: [
    "stock",
    "inventory",
    "monitoring",
    "replenishment",
    "warehouse",
    "counting",
  ],
  "Sales Coordinator": [
    "sales",
    "customer service",
    "quotation",
    "coordination",
    "reporting",
    "excel",
  ],
  "Financial Advisor": [
    "financial",
    "sales",
    "insurance",
    "investment",
    "client",
    "presentation",
  ],
  Engineer: [
    "engineering",
    "technical",
    "autocad",
    "project",
    "maintenance",
    "supervision",
  ],
  Driver: [
    "driving",
    "license",
    "delivery",
    "transport",
    "route",
    "vehicle maintenance",
  ],
  Promodiser: [
    "promodiser",
    "product display",
    "sales",
    "merchandising",
    "customer service",
  ],
  Merchandiser: [
    "merchandising",
    "display",
    "inventory",
    "retail",
    "stock",
    "sales",
  ],
  Messenger: [
    "messenger",
    "delivery",
    "documents",
    "routing",
    "errands",
    "driving",
  ],
  "Forklift Operator": [
    "forklift",
    "warehouse",
    "loading",
    "unloading",
    "operator",
    "inventory",
  ],
  Janitor: [
    "cleaning",
    "sanitation",
    "maintenance",
    "housekeeping",
    "janitorial",
    "facility",
  ],
};

function clampScore(value = 0) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function uniqueStrings(values = [], max = 8) {
  const out = [];

  for (const value of values || []) {
    const text = String(value || "").trim();
    if (!text) continue;
    if (!out.includes(text)) out.push(text);
    if (out.length >= max) break;
  }

  return out;
}

function getVacancyKeywords(vacancy = "") {
  return VACANCY_KEYWORDS[String(vacancy || "").trim()] || [];
}

function deriveStatus(score = 0, recommendation = "") {
  const rec = String(recommendation || "").toLowerCase();

  if (rec.includes("strong")) return "strong_match";
  if (rec.includes("possible") || rec.includes("potential")) {
    return "possible_match";
  }
  if (rec.includes("weak")) return "weak_match";
  if (rec.includes("manual")) return "manual_review";

  if (score >= 85) return "strong_match";
  if (score >= 65) return "possible_match";
  if (score >= 40) return "weak_match";

  return "manual_review";
}

function fallbackResumeScreening({ file, vacancy = "", note = "" }) {
  const keywords = getVacancyKeywords(vacancy);
  const fileName = String(file?.originalname || "").toLowerCase();

  const matchedKeywords = keywords.filter((keyword) =>
    fileName.includes(String(keyword).toLowerCase().replace(/\s+/g, ""))
  );

  const score = matchedKeywords.length
    ? Math.min(55, 20 + matchedKeywords.length * 7)
    : 20;

  return {
    score,
    status: "manual_review",
    recommendation: "manual_review",
    summary:
      note ||
      "Resume uploaded successfully. AI screening needs manual HR review.",
    matchedKeywords,
    missingKeywords: keywords
      .filter((item) => !matchedKeywords.includes(item))
      .slice(0, 6),
    strengths: matchedKeywords.length
      ? [
          "Resume file uploaded successfully.",
          "Some vacancy-related keywords were detected.",
        ]
      : ["Resume file uploaded successfully."],
    concerns: [
      "Automatic AI scoring could not fully evaluate this file format or content.",
    ],
    screeningMethod: "fallback",
    model: "rule-based",
    screenedAt: new Date(),
  };
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

function normalizeAiResult(parsed, vacancy = "", method = "openai", model = "") {
  const vacancyKeywords = getVacancyKeywords(vacancy);

  const score = clampScore(parsed?.score || 0);
  const recommendation =
    String(parsed?.recommendation || "").trim() || "manual_review";

  const matchedKeywords = uniqueStrings(
    Array.isArray(parsed?.matchedKeywords) ? parsed.matchedKeywords : [],
    8
  );

  const missingKeywords = uniqueStrings(
    Array.isArray(parsed?.missingKeywords)
      ? parsed.missingKeywords
      : vacancyKeywords.filter((keyword) => !matchedKeywords.includes(keyword)),
    8
  );

  return {
    score,
    status: deriveStatus(score, recommendation),
    recommendation,
    summary:
      String(parsed?.summary || "").trim() ||
      "Resume was screened automatically.",
    matchedKeywords,
    missingKeywords,
    strengths: uniqueStrings(parsed?.strengths || [], 6),
    concerns: uniqueStrings(parsed?.concerns || [], 6),
    screeningMethod: method,
    model: model || "openai",
    screenedAt: new Date(),
  };
}

function getResponseText(response) {
  if (response?.output_text) return response.output_text;

  const parts = [];

  for (const item of response?.output || []) {
    for (const content of item?.content || []) {
      if (content?.text) parts.push(content.text);
    }
  }

  return parts.join("\n").trim();
}

function buildResumeInput(file) {
  const mimeType = String(file?.mimetype || "").toLowerCase();
  const originalName = String(file?.originalname || "resume").trim();
  const buffer = file?.buffer;

  if (!buffer) return null;

  if (mimeType === "text/plain") {
    const text = Buffer.from(buffer).toString("utf8").slice(0, 20000);

    return {
      type: "text",
      content: {
        type: "input_text",
        text: text || "Text resume was uploaded, but no readable text was found.",
      },
    };
  }

  const base64 = Buffer.from(buffer).toString("base64");

  if (SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)) {
    return {
      type: "image",
      content: {
        type: "input_image",
        image_url: `data:${mimeType};base64,${base64}`,
        detail: "high",
      },
    };
  }

  if (mimeType === "application/pdf") {
    return {
      type: "file",
      content: {
        type: "input_file",
        filename: originalName.toLowerCase().endsWith(".pdf")
          ? originalName
          : `${originalName}.pdf`,
        file_data: `data:application/pdf;base64,${base64}`,
      },
    };
  }

  return null;
}

function getFriendlyOpenAiError(err) {
  const message =
    err?.error?.message ||
    err?.message ||
    "OpenAI resume screening failed. Manual HR review is required.";

  if (/quota|credit|billing|insufficient/i.test(message)) {
    return "OpenAI is connected, but billing or credits are not available yet. Manual HR review is required.";
  }

  if (/model|not found|does not exist/i.test(message)) {
    return "OpenAI is connected, but the selected model is not available for this API key. Change OPENAI_RESUME_MODEL or OPENAI_MODEL in Render.";
  }

  if (/api key|auth|permission|unauthorized/i.test(message)) {
    return "OpenAI API key is missing, invalid, or has insufficient permission. Manual HR review is required.";
  }

  return message;
}

export async function analyzeResumeAgainstVacancy({ file, vacancy = "" }) {
  if (!file?.buffer) {
    return fallbackResumeScreening({
      file,
      vacancy,
      note: "No resume file buffer was received. Manual review is required.",
    });
  }

  const mimeType = String(file?.mimetype || "").toLowerCase();

  if (!SUPPORTED_RESUME_MIME_TYPES.has(mimeType)) {
    return fallbackResumeScreening({
      file,
      vacancy,
      note:
        "Resume was uploaded, but this file format is not supported for automatic AI screening. Manual review is required.",
    });
  }

  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  const model = String(
    process.env.OPENAI_RESUME_MODEL ||
      process.env.OPENAI_MODEL ||
      "gpt-5.4-mini"
  ).trim();

  if (!apiKey) {
    return fallbackResumeScreening({
      file,
      vacancy,
      note:
        "Resume was uploaded successfully, but OPENAI_API_KEY is not configured. Manual review is required.",
    });
  }

  const resumeInput = buildResumeInput(file);

  if (!resumeInput) {
    return fallbackResumeScreening({
      file,
      vacancy,
      note:
        "Resume was uploaded successfully, but the file could not be prepared for AI screening. Manual review is required.",
    });
  }

  const targetKeywords = getVacancyKeywords(vacancy);

  const prompt = `
You are an AI resume screening assistant for manpower recruitment.

Evaluate the attached resume against this job vacancy:
"${vacancy}"

Target job keywords:
${targetKeywords.join(", ") || "general job fit, communication, reliability"}

Return STRICT JSON only with this shape:
{
  "score": 0,
  "recommendation": "strong_match",
  "summary": "short summary",
  "matchedKeywords": ["keyword1"],
  "missingKeywords": ["keyword2"],
  "strengths": ["strength1"],
  "concerns": ["concern1"]
}

Rules:
- score must be 0 to 100
- recommendation must be one of:
  "strong_match", "possible_match", "weak_match", "manual_review"
- matchedKeywords and missingKeywords must be short strings
- strengths and concerns must be short bullet-style strings
- do not include markdown
- base the evaluation only on the attached resume
- this is only a screening assistant; HR must make the final hiring decision
`.trim();

  try {
    const client = new OpenAI({ apiKey });

    const content = [
      {
        type: "input_text",
        text: prompt,
      },
      resumeInput.content,
    ];

    const response = await client.responses.create({
      model,
      max_output_tokens: 1200,
      input: [
        {
          role: "system",
          content:
            "You are a careful HR resume screening assistant. You provide structured screening support only. You do not make final hiring decisions.",
        },
        {
          role: "user",
          content,
        },
      ],
    });

    const rawText = getResponseText(response);
    const parsed = extractJson(rawText);

    if (!parsed) {
      return fallbackResumeScreening({
        file,
        vacancy,
        note:
          "Resume was uploaded successfully, but OpenAI response could not be parsed. Manual review is required.",
      });
    }

    return normalizeAiResult(parsed, vacancy, "openai", model);
  } catch (error) {
    console.error("OpenAI resume screening error:", error?.message || error);

    return fallbackResumeScreening({
      file,
      vacancy,
      note: getFriendlyOpenAiError(error),
    });
  }
}

export default {
  analyzeResumeAgainstVacancy,
};
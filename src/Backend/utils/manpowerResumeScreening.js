// src/Backend/utils/manpowerResumeScreening.js
const SUPPORTED_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "image/jpeg",
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
  if (rec.includes("possible") || rec.includes("potential")) return "possible_match";
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
    missingKeywords: keywords.filter((item) => !matchedKeywords.includes(item)).slice(0, 6),
    strengths: matchedKeywords.length
      ? ["Resume file uploaded successfully.", "Some vacancy-related keywords were detected."]
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

function normalizeAiResult(parsed, vacancy = "", method = "gemini", model = "") {
  const vacancyKeywords = getVacancyKeywords(vacancy);

  const score = clampScore(parsed?.score || 0);
  const recommendation = String(parsed?.recommendation || "").trim() || "manual_review";

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
    model: model || "gemini",
    screenedAt: new Date(),
  };
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

  const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
  const model = String(process.env.GEMINI_MODEL || "gemini-2.5-flash-lite").trim();

  if (!apiKey) {
    return fallbackResumeScreening({
      file,
      vacancy,
      note:
        "Resume was uploaded successfully, but AI screening is not configured. Manual review is required.",
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
- base the evaluation only on the attached file
`.trim();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: Buffer.from(file.buffer).toString("base64"),
                  },
                },
              ],
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
      return fallbackResumeScreening({
        file,
        vacancy,
        note:
          data?.error?.message ||
          "Resume was uploaded successfully, but AI response could not be parsed. Manual review is required.",
      });
    }

    return normalizeAiResult(parsed, vacancy, "gemini", model);
  } catch (error) {
    return fallbackResumeScreening({
      file,
      vacancy,
      note:
        error?.message ||
        "Resume was uploaded successfully, but AI screening failed. Manual review is required.",
    });
  }
}
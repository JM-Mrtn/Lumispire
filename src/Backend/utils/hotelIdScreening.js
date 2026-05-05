import OpenAI from "openai";

const ID_KEYWORDS = [
  "philippine",
  "identification",
  "national",
  "passport",
  "driver",
  "license",
  "umid",
  "philhealth",
  "sss",
  "prc",
  "postal",
  "id",
];

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const SUPPORTED_FILE_MIME_TYPES = new Set([
  ...SUPPORTED_IMAGE_MIME_TYPES,
  "application/pdf",
]);

function basicFallbackAnalysis({ file, idType = "" }) {
  const size = Number(file?.size || 0);
  const originalName = String(
    file?.originalname || file?.originalName || ""
  ).toLowerCase();
  const normalizedIdType = String(idType || "").toLowerCase();

  const matchedKeywords = [];
  const reasons = [];

  const checks = {
    resolutionOk: size >= 50 * 1024,
    enoughText: false,
    hasKeywords: false,
    looksBlank: false,
  };

  const extractedText = "";
  let confidenceScore = 0;
  let screeningStatus = "needs_manual_review";
  let reviewDecision = "manual_review";

  if (size < 15 * 1024) {
    checks.looksBlank = true;
    reasons.push("Uploaded file is too small and appears invalid or blank.");
    confidenceScore = 5;
    screeningStatus = "unreadable";
    reviewDecision = "manual_review";

    return {
      extractedText,
      matchedKeywords,
      checks,
      confidenceScore,
      screeningStatus,
      reviewDecision,
      reasons,
      aiConnected: false,
      aiConnectionStatus: "not_checked",
      aiProvider: "none",
      aiModel: "",
      aiCheckedAt: null,
      aiSummary: "Basic file-size check only. AI did not run.",
      aiDocumentType: "unknown",
      aiRiskLevel: "unknown",
      aiDecision: "needs_manual_review",
      aiError: "",
      aiRawResult: null,
    };
  }

  for (const keyword of ID_KEYWORDS) {
    if (originalName.includes(keyword) || normalizedIdType.includes(keyword)) {
      if (!matchedKeywords.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    }
  }

  checks.hasKeywords = matchedKeywords.length > 0;
  checks.enoughText = size >= 120 * 1024;

  if (checks.resolutionOk) confidenceScore += 25;
  if (checks.enoughText) confidenceScore += 20;
  if (checks.hasKeywords) confidenceScore += 25;
  if (size > 250 * 1024) confidenceScore += 15;
  if (size > 800 * 1024) confidenceScore += 10;

  if (!checks.resolutionOk && !checks.hasKeywords) {
    reasons.push("Low-quality upload and no valid ID indicators were detected.");
    confidenceScore = Math.min(confidenceScore, 25);
    screeningStatus = "unreadable";
    reviewDecision = "manual_review";
  } else if (confidenceScore >= 70) {
    reasons.push(
      "Upload passed basic automatic screening. Admin must still review the ID."
    );
    screeningStatus = "likely_valid";
    reviewDecision = "manual_review";
  } else if (confidenceScore >= 35) {
    reasons.push("Upload requires manual review.");
    screeningStatus = "needs_manual_review";
    reviewDecision = "manual_review";
  } else {
    reasons.push("Upload looks suspicious and requires manual review.");
    screeningStatus = "suspicious";
    reviewDecision = "manual_review";
  }

  return {
    extractedText,
    matchedKeywords,
    checks,
    confidenceScore,
    screeningStatus,
    reviewDecision,
    reasons,
    aiConnected: false,
    aiConnectionStatus: "not_checked",
    aiProvider: "none",
    aiModel: "",
    aiCheckedAt: null,
    aiSummary: "Basic file metadata screening only. AI did not run.",
    aiDocumentType: "unknown",
    aiRiskLevel: "unknown",
    aiDecision: "needs_manual_review",
    aiError: "",
    aiRawResult: null,
  };
}

function clampScore(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function safeString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value).trim() || fallback;
}

function safeArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => safeString(item)).filter(Boolean);
  }
  return [];
}

function extractJson(text = "") {
  const raw = String(text || "").trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeDecision(value = "") {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (["approve", "approved", "likely_valid", "valid"].includes(normalized)) {
    return "approve";
  }

  if (["reject", "rejected", "invalid", "suspicious"].includes(normalized)) {
    return "reject";
  }

  if (
    ["needs_manual_review", "manual_review", "review"].includes(normalized)
  ) {
    return "needs_manual_review";
  }

  return "needs_manual_review";
}

function normalizeRisk(value = "") {
  const normalized = String(value || "").toLowerCase();

  if (["low", "medium", "high"].includes(normalized)) {
    return normalized;
  }

  return "unknown";
}

function statusFromAi({ decision, riskLevel, readable, confidenceScore }) {
  if (readable === false) return "unreadable";
  if (decision === "reject" || riskLevel === "high") return "suspicious";
  if (decision === "approve" && confidenceScore >= 70 && riskLevel === "low") {
    return "likely_valid";
  }

  return "needs_manual_review";
}

function buildAiResult({ aiData, fallback, model }) {
  const decision = normalizeDecision(aiData?.decision);
  const riskLevel = normalizeRisk(aiData?.riskLevel);
  const confidenceScore = clampScore(
    aiData?.confidenceScore ?? fallback.confidenceScore
  );
  const readable =
    typeof aiData?.isReadable === "boolean" ? aiData.isReadable : true;

  const reasons = safeArray(aiData?.reasons);
  const extractedText = safeString(aiData?.extractedText, fallback.extractedText);
  const matchedKeywords = safeArray(aiData?.matchedKeywords);

  const screeningStatus = statusFromAi({
    decision,
    riskLevel,
    readable,
    confidenceScore,
  });

  return {
    ...fallback,
    extractedText,
    matchedKeywords: matchedKeywords.length
      ? matchedKeywords
      : fallback.matchedKeywords,
    checks: {
      ...fallback.checks,
      resolutionOk: readable !== false,
      enoughText: Boolean(extractedText) || fallback.checks.enoughText,
      hasKeywords: matchedKeywords.length > 0 || fallback.checks.hasKeywords,
      looksBlank: readable === false,
    },
    confidenceScore,
    screeningStatus,
    reviewDecision: "manual_review",
    reasons: reasons.length
      ? reasons
      : [
          safeString(
            aiData?.summary,
            "AI completed the ID check. Admin must make the final decision."
          ),
        ],
    aiConnected: true,
    aiConnectionStatus: "connected",
    aiProvider: "openai",
    aiModel: model,
    aiCheckedAt: new Date(),
    aiSummary: safeString(
      aiData?.summary,
      "AI completed the ID check. Admin must make the final decision."
    ),
    aiDocumentType: safeString(aiData?.documentType, "unknown"),
    aiRiskLevel: riskLevel,
    aiDecision: decision,
    aiError: "",
    aiRawResult: aiData || null,
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

function buildInputFile(file) {
  const mimeType = String(
    file?.mimetype || file?.mimeType || "application/octet-stream"
  ).toLowerCase();

  const originalName = safeString(
    file?.originalname || file?.originalName,
    "uploaded-id"
  );

  const buffer = file?.buffer || file?.data;

  if (!buffer) return null;

  const base64 = Buffer.isBuffer(buffer)
    ? buffer.toString("base64")
    : Buffer.from(buffer).toString("base64");

  if (SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)) {
    return {
      type: "input_image",
      image_url: `data:${mimeType};base64,${base64}`,
      detail: "high",
    };
  }

  if (mimeType === "application/pdf") {
    return {
      type: "input_file",
      filename: originalName.endsWith(".pdf")
        ? originalName
        : `${originalName}.pdf`,
      file_data: `data:application/pdf;base64,${base64}`,
    };
  }

  return null;
}

function getFriendlyOpenAiError(err) {
  const message =
    err?.error?.message ||
    err?.message ||
    "OpenAI ID check failed. Please check your API key and billing.";

  if (/quota|credit|billing|insufficient/i.test(message)) {
    return "OpenAI is connected, but billing or credits are not available yet.";
  }

  if (/model|not found|does not exist/i.test(message)) {
    return "OpenAI is connected, but the selected model is not available for this API key. Change OPENAI_ID_MODEL or OPENAI_MODEL in Render.";
  }

  if (/api key|auth|permission|unauthorized/i.test(message)) {
    return "OpenAI API key is missing, invalid, or has insufficient permission.";
  }

  return message;
}

export async function analyzeUploadedId({ file, idType = "" }) {
  const fallback = basicFallbackAnalysis({ file, idType });

  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  const model = String(
    process.env.OPENAI_ID_MODEL ||
      process.env.OPENAI_MODEL ||
      "gpt-5.4-mini"
  ).trim();

  const mimeType = String(file?.mimetype || file?.mimeType || "").toLowerCase();

  if (!apiKey) {
    return {
      ...fallback,
      aiConnected: false,
      aiConnectionStatus: "missing_key",
      aiError: "OPENAI_API_KEY is not configured.",
      aiSummary:
        "ID uploaded. AI check did not run because OPENAI_API_KEY is missing.",
      reasons: [
        ...fallback.reasons,
        "OPENAI_API_KEY is not configured, so only basic file screening was completed.",
      ],
    };
  }

  if (!SUPPORTED_FILE_MIME_TYPES.has(mimeType)) {
    return {
      ...fallback,
      aiConnected: false,
      aiConnectionStatus: "not_supported",
      aiError: "Unsupported file type for AI ID check.",
      aiSummary:
        "ID uploaded. AI check did not run because the file type is not supported.",
      reasons: [...fallback.reasons, "Unsupported file type for AI ID check."],
    };
  }

  const fileInput = buildInputFile(file);

  if (!fileInput) {
    return {
      ...fallback,
      aiConnected: false,
      aiConnectionStatus: "error",
      aiError: "Could not prepare uploaded file for AI analysis.",
      aiSummary: "ID uploaded, but AI could not read the uploaded file buffer.",
      reasons: [
        ...fallback.reasons,
        "Could not prepare uploaded file for AI analysis.",
      ],
    };
  }

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      model,
      max_output_tokens: 1200,
      input: [
        {
          role: "system",
          content:
            "You are an ID pre-screening assistant for a hotel and resort account verification system. You only provide a risk assessment for admin review. You do not make the final verification decision.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Analyze the uploaded ID image or PDF.

Return only valid JSON with this exact shape:
{
  "isReadable": true,
  "documentType": "government_id",
  "fullNameVisible": true,
  "birthDateVisible": true,
  "idNumberVisible": true,
  "expirationDateVisible": true,
  "isExpired": false,
  "riskLevel": "low",
  "confidenceScore": 85,
  "decision": "needs_manual_review",
  "summary": "Short admin-friendly explanation.",
  "reasons": ["reason 1", "reason 2"],
  "matchedKeywords": ["passport", "philippine"],
  "extractedText": "Visible text summary only. Do not expose unnecessary sensitive data."
}

Rules:
- riskLevel must be one of: "low", "medium", "high", "unknown"
- decision must be one of: "approve", "needs_manual_review", "reject"
- If unsure, use "needs_manual_review"
- Do not include markdown
- Do not approve final verification; admin must manually approve or reject
`.trim(),
            },
            fileInput,
          ],
        },
      ],
    });

    const text = getResponseText(response);
    const aiData = extractJson(text);

    if (!aiData) {
      return {
        ...fallback,
        aiConnected: true,
        aiConnectionStatus: "connected",
        aiProvider: "openai",
        aiModel: model,
        aiCheckedAt: new Date(),
        aiSummary:
          "OpenAI responded, but the response could not be parsed as JSON. Admin should manually review the uploaded ID.",
        aiDecision: "needs_manual_review",
        aiRiskLevel: "unknown",
        aiError: "AI response was not valid JSON.",
        aiRawResult: { rawText: text },
        reasons: [
          ...fallback.reasons,
          "OpenAI responded, but the response could not be parsed as JSON.",
        ],
      };
    }

    return buildAiResult({ aiData, fallback, model });
  } catch (err) {
    const friendlyError = getFriendlyOpenAiError(err);

    console.error("OpenAI ID screening error:", err?.message || err);

    return {
      ...fallback,
      aiConnected: false,
      aiConnectionStatus: "error",
      aiProvider: "openai",
      aiModel: model,
      aiCheckedAt: new Date(),
      aiSummary: friendlyError,
      aiDecision: "needs_manual_review",
      aiRiskLevel: "unknown",
      aiError: friendlyError,
      aiRawResult: {
        message: err?.message || "OpenAI request failed.",
        code: err?.code || err?.error?.code || "",
        type: err?.type || err?.error?.type || "",
      },
      reasons: [...fallback.reasons, friendlyError],
    };
  }
}

export default {
  analyzeUploadedId,
};
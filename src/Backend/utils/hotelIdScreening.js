import OpenAI from "openai";

const ID_KEYWORDS = [
  "philippine",
  "republic",
  "identification",
  "national",
  "passport",
  "driver",
  "license",
  "driver's license",
  "umid",
  "philhealth",
  "sss",
  "prc",
  "postal",
  "voter",
  "tin",
  "id",
  "id number",
  "card number",
  "government",
  "date of birth",
  "birth date",
  "dob",
  "signature",
  "expiry",
  "expiration",
  "valid until",
];

const NON_ID_PHRASES = [
  "not an id",
  "not a valid id",
  "not a government id",
  "not an id document",
  "not an identification document",
  "no identity fields",
  "no identity fields are visible",
  "no id fields",
  "pizza",
  "order flow",
  "diagram",
  "receipt",
  "food",
  "selfie",
  "landscape",
  "building",
  "animal",
  "blank",
  "screenshot",
  "unrelated",
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

function cleanText(value = "") {
  return String(value || "").trim();
}

function textIncludesAny(text = "", phrases = []) {
  const lower = String(text || "").toLowerCase();
  return phrases.some((phrase) => lower.includes(String(phrase).toLowerCase()));
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

function safeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();

    if (["true", "yes", "1"].includes(lower)) return true;
    if (["false", "no", "0"].includes(lower)) return false;
  }

  return fallback;
}

function normalizeDecision(value = "") {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (["approve", "approved", "likely_valid", "valid"].includes(normalized)) {
    return "approve";
  }

  if (
    [
      "reject",
      "rejected",
      "invalid",
      "suspicious",
      "not_id",
      "not_valid",
      "not_a_government_id",
    ].includes(normalized)
  ) {
    return "reject";
  }

  if (["needs_manual_review", "manual_review", "review"].includes(normalized)) {
    return "needs_manual_review";
  }

  return "needs_manual_review";
}

function normalizeRisk(value = "") {
  const normalized = String(value || "").toLowerCase();

  if (["low", "medium", "high"].includes(normalized)) return normalized;

  return "unknown";
}

function normalizeDocumentType(value = "") {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return normalized || "unknown";
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

function basicFallbackAnalysis({ file, idType = "" }) {
  const size = Number(file?.size || 0);
  const originalName = String(
    file?.originalname || file?.originalName || ""
  ).toLowerCase();
  const normalizedIdType = String(idType || "").toLowerCase();

  const matchedKeywords = [];

  for (const keyword of ID_KEYWORDS) {
    if (originalName.includes(keyword) || normalizedIdType.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }

  const checks = {
    resolutionOk: size >= 50 * 1024,
    enoughText: size >= 120 * 1024,
    hasKeywords: matchedKeywords.length > 0,
    looksBlank: size < 15 * 1024,
    hasAnyIdIndicators: matchedKeywords.length > 0,
    likelyGovernmentId: matchedKeywords.length > 0,
    fullNameVisible: false,
    birthDateVisible: false,
    idNumberVisible: false,
    expirationDateVisible: false,
  };

  let confidenceScore = 0;

  if (checks.resolutionOk) confidenceScore += 25;
  if (checks.enoughText) confidenceScore += 20;
  if (checks.hasKeywords) confidenceScore += 35;
  if (size > 250 * 1024) confidenceScore += 10;
  if (size > 800 * 1024) confidenceScore += 10;

  const noIdIndicators = !checks.hasKeywords && confidenceScore <= 45;
  const tooSmall = size < 15 * 1024;

  const autoRejected = tooSmall || noIdIndicators;

  return {
    extractedText: "",
    matchedKeywords,
    checks,
    confidenceScore: autoRejected ? Math.min(confidenceScore, 20) : confidenceScore,
    screeningStatus: autoRejected ? "suspicious" : "needs_manual_review",
    reviewDecision: autoRejected ? "auto_rejected" : "manual_review",
    reasons: autoRejected
      ? [
          "Auto-rejected: the uploaded file has no reliable signs of being a real government ID.",
        ]
      : ["Upload has limited ID indicators and requires manual review."],
    aiConnected: false,
    aiConnectionStatus: "not_checked",
    aiProvider: "none",
    aiModel: "",
    aiCheckedAt: null,
    aiSummary: autoRejected
      ? "Auto-rejected because the upload has no clear ID indicators."
      : "Basic file metadata screening only. AI did not run.",
    aiDocumentType: "unknown",
    aiRiskLevel: autoRejected ? "high" : "unknown",
    aiDecision: autoRejected ? "reject" : "needs_manual_review",
    aiError: "",
    aiRawResult: null,
  };
}

function shouldAutoRejectAiResult({
  decision,
  riskLevel,
  confidenceScore,
  readable,
  documentType,
  summary,
  extractedText,
  reasons,
  matchedKeywords,
  fullNameVisible,
  birthDateVisible,
  idNumberVisible,
  expirationDateVisible,
  hasAnyIdIndicators,
  isLikelyGovernmentId,
}) {
  const combinedText = [
    documentType,
    summary,
    extractedText,
    ...(Array.isArray(reasons) ? reasons : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const invalidDocumentTypes = new Set([
    "not_id",
    "not_a_government_id",
    "non_id",
    "blank",
    "selfie",
    "receipt",
    "screenshot",
    "diagram",
    "food",
    "order_flow",
    "unrelated",
    "unknown_document",
  ]);

  const hasCoreIdentityField =
    fullNameVisible ||
    birthDateVisible ||
    idNumberVisible ||
    expirationDateVisible;

  const hasKeywordSignal =
    Array.isArray(matchedKeywords) && matchedKeywords.length > 0;

  const textSaysNotId = textIncludesAny(combinedText, NON_ID_PHRASES);
  const textHasIdSignal = textIncludesAny(combinedText, ID_KEYWORDS);

  const noIdEvidence =
    hasAnyIdIndicators === false ||
    isLikelyGovernmentId === false ||
    (!hasCoreIdentityField && !hasKeywordSignal && !textHasIdSignal);

  if (readable === false) return true;
  if (invalidDocumentTypes.has(documentType)) return true;

  if (textSaysNotId) return true;

  if (confidenceScore <= 20 && noIdEvidence) return true;

  if (decision === "reject" && noIdEvidence) return true;

  if (riskLevel === "high" && noIdEvidence) return true;

  return false;
}

function buildAiResult({ aiData, fallback, model }) {
  const decision = normalizeDecision(aiData?.decision);
  const riskLevel = normalizeRisk(aiData?.riskLevel);
  const documentType = normalizeDocumentType(aiData?.documentType);

  const confidenceScore = clampScore(
    aiData?.confidenceScore ?? fallback.confidenceScore
  );

  const readable = safeBoolean(aiData?.isReadable, true);
  const fullNameVisible = safeBoolean(aiData?.fullNameVisible, false);
  const birthDateVisible = safeBoolean(aiData?.birthDateVisible, false);
  const idNumberVisible = safeBoolean(aiData?.idNumberVisible, false);
  const expirationDateVisible = safeBoolean(aiData?.expirationDateVisible, false);

  const matchedKeywords = safeArray(aiData?.matchedKeywords);
  const reasons = safeArray(aiData?.reasons);
  const extractedText = safeString(aiData?.extractedText, fallback.extractedText);

  const summary = safeString(
    aiData?.summary,
    "AI completed the ID pre-check."
  );

  const hasAnyIdIndicators = safeBoolean(
    aiData?.hasAnyIdIndicators,
    fullNameVisible ||
      birthDateVisible ||
      idNumberVisible ||
      expirationDateVisible ||
      matchedKeywords.length > 0
  );

  const isLikelyGovernmentId = safeBoolean(
    aiData?.isLikelyGovernmentId,
    documentType.includes("government") ||
      documentType.includes("passport") ||
      documentType.includes("license") ||
      documentType.includes("national") ||
      matchedKeywords.length > 0
  );

  const autoRejected = shouldAutoRejectAiResult({
    decision,
    riskLevel,
    confidenceScore,
    readable,
    documentType,
    summary,
    extractedText,
    reasons,
    matchedKeywords,
    fullNameVisible,
    birthDateVisible,
    idNumberVisible,
    expirationDateVisible,
    hasAnyIdIndicators,
    isLikelyGovernmentId,
  });

  const finalReasons = [
    ...(autoRejected
      ? [
          "Auto-rejected: AI did not detect enough signs that the upload is a real government ID.",
        ]
      : []),
    ...(reasons.length ? reasons : [summary]),
  ];

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
      hasAnyIdIndicators,
      likelyGovernmentId: isLikelyGovernmentId,
      fullNameVisible,
      birthDateVisible,
      idNumberVisible,
      expirationDateVisible,
    },
    confidenceScore,
    screeningStatus: autoRejected
      ? "suspicious"
      : decision === "approve" && confidenceScore >= 70 && riskLevel === "low"
      ? "likely_valid"
      : decision === "reject" || riskLevel === "high"
      ? "suspicious"
      : "needs_manual_review",
    reviewDecision: autoRejected ? "auto_rejected" : "manual_review",
    reasons: finalReasons,
    aiConnected: true,
    aiConnectionStatus: "connected",
    aiProvider: "openai",
    aiModel: model,
    aiCheckedAt: new Date(),
    aiSummary: autoRejected
      ? "Auto-rejected because the uploaded file does not appear to be a real government ID."
      : summary,
    aiDocumentType: documentType || "unknown",
    aiRiskLevel: autoRejected ? "high" : riskLevel,
    aiDecision: autoRejected ? "reject" : decision,
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
        fallback.reviewDecision === "auto_rejected"
          ? fallback.aiSummary
          : "ID uploaded. AI check did not run because OPENAI_API_KEY is missing.",
      reasons: [
        ...fallback.reasons,
        "OPENAI_API_KEY is not configured, so only basic file screening was completed.",
      ],
    };
  }

  if (!SUPPORTED_FILE_MIME_TYPES.has(mimeType)) {
    return {
      ...fallback,
      reviewDecision: "auto_rejected",
      screeningStatus: "suspicious",
      aiConnected: false,
      aiConnectionStatus: "not_supported",
      aiError: "Unsupported file type for AI ID check.",
      aiSummary:
        "Auto-rejected because this file type is not supported for ID verification.",
      aiDecision: "reject",
      aiRiskLevel: "high",
      reasons: [
        ...fallback.reasons,
        "Unsupported file type for AI ID check.",
      ],
    };
  }

  const fileInput = buildInputFile(file);

  if (!fileInput) {
    return {
      ...fallback,
      reviewDecision: "auto_rejected",
      screeningStatus: "suspicious",
      aiConnected: false,
      aiConnectionStatus: "error",
      aiError: "Could not prepare uploaded file for AI analysis.",
      aiSummary:
        "Auto-rejected because the uploaded file could not be prepared for ID verification.",
      aiDecision: "reject",
      aiRiskLevel: "high",
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
            "You are an ID pre-screening assistant for a hotel and resort account verification system. You must detect whether the upload appears to be a real government ID. If it is a random image, diagram, receipt, food image, screenshot, or unrelated document, mark it as not a government ID.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Analyze the uploaded file.

Return only valid JSON with this exact shape:
{
  "isReadable": true,
  "isLikelyGovernmentId": true,
  "hasAnyIdIndicators": true,
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

Strict rules:
- If the file is a random photo, diagram, pizza/order flow, receipt, selfie, screenshot, blank image, or unrelated document, set:
  "isLikelyGovernmentId": false,
  "hasAnyIdIndicators": false,
  "documentType": "not_id",
  "riskLevel": "high",
  "confidenceScore": 0 to 20,
  "decision": "reject".
- If there is no visible name, birth date, ID number, government label, official ID layout, or ID keyword, set decision to "reject".
- If it looks like an ID but details are unclear, use "needs_manual_review".
- Do not approve final verification. Valid-looking IDs still need admin approval.
- Do not include markdown.
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
          "OpenAI responded, but the response could not be parsed as JSON. Admin should manually review the uploaded file.",
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
      aiSummary:
        fallback.reviewDecision === "auto_rejected"
          ? fallback.aiSummary
          : friendlyError,
      aiDecision:
        fallback.reviewDecision === "auto_rejected"
          ? "reject"
          : "needs_manual_review",
      aiRiskLevel:
        fallback.reviewDecision === "auto_rejected" ? "high" : "unknown",
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
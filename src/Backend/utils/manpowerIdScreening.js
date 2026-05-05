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

function safeString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value).trim() || fallback;
}

function safeArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => safeString(item)).filter(Boolean);
}

function clampScore(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeDecision(value = "") {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (["approve", "approved", "valid", "likely_valid"].includes(normalized)) {
    return "approve";
  }

  if (["reject", "rejected", "invalid", "suspicious"].includes(normalized)) {
    return "reject";
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

function extractJson(text = "") {
  const raw = String(text || "").trim();

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    const fenced = raw.match(/```json\s*([\s\S]*?)```/i);

    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1]);
      } catch {
        // continue
      }
    }

    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }

    return null;
  }
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

function basicFallbackAnalysis({ file, idType = "", note = "" }) {
  const size = Number(file?.size || 0);
  const originalName = String(file?.originalname || "").toLowerCase();
  const normalizedIdType = String(idType || "").toLowerCase();

  const matchedKeywords = [];
  const reasons = [];

  const checks = {
    resolutionOk: size >= 50 * 1024,
    enoughText: false,
    hasKeywords: false,
    looksBlank: false,
  };

  let confidenceScore = 0;
  let screeningStatus = "needs_manual_review";

  if (size < 15 * 1024) {
    checks.looksBlank = true;
    confidenceScore = 5;
    screeningStatus = "unreadable";
    reasons.push("Uploaded file is too small and appears invalid or blank.");
  } else {
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
      screeningStatus = "unreadable";
      confidenceScore = Math.min(confidenceScore, 25);
      reasons.push("Low-quality upload and no valid ID indicators were detected.");
    } else if (confidenceScore >= 70) {
      screeningStatus = "likely_valid";
      reasons.push(
        "Upload passed basic ID screening. HR must still manually verify the ID."
      );
    } else if (confidenceScore >= 35) {
      screeningStatus = "needs_manual_review";
      reasons.push("Upload requires manual HR review.");
    } else {
      screeningStatus = "suspicious";
      reasons.push("Upload looks suspicious and requires manual HR review.");
    }
  }

  return {
    extractedText: "",
    matchedKeywords,
    checks,
    confidenceScore,
    screeningStatus,
    reviewDecision: "manual_review",
    reasons: note ? [note, ...reasons] : reasons,

    aiConnected: false,
    aiConnectionStatus: "not_checked",
    aiProvider: "none",
    aiModel: "",
    aiCheckedAt: null,
    aiSummary: note || "Basic file metadata screening only. AI did not run.",
    aiDocumentType: "unknown",
    aiRiskLevel: "unknown",
    aiDecision: "needs_manual_review",
    aiError: "",
    aiRawResult: null,
  };
}

function statusFromAi({ readable, riskLevel, decision, confidenceScore }) {
  if (readable === false) return "unreadable";
  if (riskLevel === "high" || decision === "reject") return "suspicious";
  if (riskLevel === "low" && decision === "approve" && confidenceScore >= 70) {
    return "likely_valid";
  }

  return "needs_manual_review";
}

function buildInputFile(file) {
  const mimeType = String(file?.mimetype || "").toLowerCase();
  const originalName = safeString(file?.originalname, "uploaded-id");
  const buffer = file?.buffer;

  if (!buffer) return null;

  const base64 = Buffer.from(buffer).toString("base64");

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
      filename: originalName.toLowerCase().endsWith(".pdf")
        ? originalName
        : `${originalName}.pdf`,
      file_data: `data:application/pdf;base64,${base64}`,
    };
  }

  return null;
}

function getFriendlyOpenAiError(error) {
  const message =
    error?.error?.message ||
    error?.message ||
    "OpenAI ID screening failed. Manual HR review is required.";

  if (/quota|credit|billing|insufficient/i.test(message)) {
    return "OpenAI is connected, but billing or credits are not available yet. Manual HR review is required.";
  }

  if (/model|not found|does not exist/i.test(message)) {
    return "OpenAI is connected, but the selected model is not available. Change OPENAI_MANPOWER_ID_MODEL, OPENAI_ID_MODEL, or OPENAI_MODEL in Render.";
  }

  if (/api key|auth|permission|unauthorized/i.test(message)) {
    return "OpenAI API key is missing, invalid, or has insufficient permission. Manual HR review is required.";
  }

  return message;
}

export async function analyzeUploadedId({ file, idType = "" }) {
  const fallback = basicFallbackAnalysis({ file, idType });

  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  const model = String(
    process.env.OPENAI_MANPOWER_ID_MODEL ||
      process.env.OPENAI_ID_MODEL ||
      process.env.OPENAI_MODEL ||
      "gpt-5.4-mini"
  ).trim();

  const mimeType = String(file?.mimetype || "").toLowerCase();

  if (!apiKey) {
    return {
      ...fallback,
      aiConnectionStatus: "missing_key",
      aiError: "OPENAI_API_KEY is not configured.",
      aiSummary:
        "Valid ID uploaded. AI check did not run because OPENAI_API_KEY is missing.",
      reasons: [
        ...fallback.reasons,
        "OPENAI_API_KEY is not configured, so HR must manually review the uploaded ID.",
      ],
    };
  }

  if (!SUPPORTED_FILE_MIME_TYPES.has(mimeType)) {
    return {
      ...fallback,
      aiConnectionStatus: "not_supported",
      aiError: "Unsupported file type for AI ID check.",
      aiSummary:
        "Valid ID uploaded. AI check did not run because the file type is not supported.",
      reasons: [
        ...fallback.reasons,
        "Unsupported file type for AI ID check. Upload JPG, PNG, WEBP, or PDF.",
      ],
    };
  }

  const fileInput = buildInputFile(file);

  if (!fileInput) {
    return {
      ...fallback,
      aiConnectionStatus: "error",
      aiError: "Could not prepare uploaded file for AI analysis.",
      aiSummary:
        "Valid ID uploaded, but AI could not read the uploaded file buffer.",
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
            "You are an ID pre-screening assistant for a manpower recruitment system. You only provide risk assessment for HR review. HR must make the final verification decision.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Analyze the uploaded valid ID image or PDF.

Return STRICT JSON only with this shape:
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
  "summary": "Short HR-friendly explanation.",
  "reasons": ["reason 1", "reason 2"],
  "matchedKeywords": ["passport", "philippine"],
  "extractedText": "Visible text summary only. Do not expose unnecessary sensitive data."
}

Rules:
- riskLevel must be one of: "low", "medium", "high", "unknown"
- decision must be one of: "approve", "needs_manual_review", "reject"
- If unsure, use "needs_manual_review"
- Do not include markdown
- Do not make final identity approval
- HR must manually approve or reject
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
          "OpenAI responded, but the response could not be parsed as JSON. HR must manually review the uploaded ID.",
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

    const decision = normalizeDecision(aiData?.decision);
    const riskLevel = normalizeRisk(aiData?.riskLevel);
    const confidenceScore = clampScore(
      aiData?.confidenceScore ?? fallback.confidenceScore
    );
    const readable =
      typeof aiData?.isReadable === "boolean" ? aiData.isReadable : true;

    const screeningStatus = statusFromAi({
      readable,
      riskLevel,
      decision,
      confidenceScore,
    });

    const reasons = safeArray(aiData?.reasons);

    return {
      ...fallback,
      extractedText: safeString(aiData?.extractedText, fallback.extractedText),
      matchedKeywords: safeArray(aiData?.matchedKeywords).length
        ? safeArray(aiData?.matchedKeywords)
        : fallback.matchedKeywords,
      checks: {
        ...fallback.checks,
        resolutionOk: readable !== false,
        enoughText: Boolean(aiData?.extractedText) || fallback.checks.enoughText,
        hasKeywords:
          safeArray(aiData?.matchedKeywords).length > 0 ||
          fallback.checks.hasKeywords,
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
              "AI completed the ID check. HR must make the final decision."
            ),
          ],

      aiConnected: true,
      aiConnectionStatus: "connected",
      aiProvider: "openai",
      aiModel: model,
      aiCheckedAt: new Date(),
      aiSummary: safeString(
        aiData?.summary,
        "AI completed the ID check. HR must make the final decision."
      ),
      aiDocumentType: safeString(aiData?.documentType, "unknown"),
      aiRiskLevel: riskLevel,
      aiDecision: decision,
      aiError: "",
      aiRawResult: aiData || null,
    };
  } catch (error) {
    const friendlyError = getFriendlyOpenAiError(error);

    console.error("OpenAI manpower ID screening error:", error?.message || error);

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
        message: error?.message || "OpenAI request failed.",
        code: error?.code || error?.error?.code || "",
        type: error?.type || error?.error?.type || "",
      },
      reasons: [...fallback.reasons, friendlyError],
    };
  }
}

export default {
  analyzeUploadedId,
};
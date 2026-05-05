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

export function analyzeUploadedId({ file, idType = "" }) {
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

  const extractedText = "";
  let confidenceScore = 0;
  let screeningStatus = "needs_manual_review";
  let reviewDecision = "manual_review";

  if (size < 15 * 1024) {
    checks.looksBlank = true;
    reasons.push("Uploaded file is too small and appears invalid or blank.");
    confidenceScore = 5;
    screeningStatus = "unreadable";
    reviewDecision = "auto_rejected";

    return {
      extractedText,
      matchedKeywords,
      checks,
      confidenceScore,
      screeningStatus,
      reviewDecision,
      reasons,
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
    reviewDecision = "auto_rejected";
  } else if (confidenceScore >= 70) {
    reasons.push("Upload passed basic automatic screening.");
    screeningStatus = "likely_valid";
    reviewDecision = "auto_approved";
  } else if (confidenceScore >= 35) {
    reasons.push("Upload requires manual review.");
    screeningStatus = "needs_manual_review";
    reviewDecision = "manual_review";
  } else {
    reasons.push("Upload failed automatic screening.");
    screeningStatus = "suspicious";
    reviewDecision = "auto_rejected";
  }

  return {
    extractedText,
    matchedKeywords,
    checks,
    confidenceScore,
    screeningStatus,
    reviewDecision,
    reasons,
  };
}

export default {
  analyzeUploadedId,
};
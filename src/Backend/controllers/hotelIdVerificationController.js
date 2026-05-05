// src/Backend/controllers/hotelIdVerificationController.js
import HotelUser from "../models/hotelUser.js";
import HotelIdVerification from "../models/HotelIdVerification.js";
import { requireHotelUserAuth } from "../utils/hotelAuthHelpers.js";
import { analyzeUploadedId } from "../utils/hotelIdScreening.js";

const ID_REUPLOAD_COOLDOWN_MS = 60 * 1000;

function getUserIdFromDecoded(decoded = {}) {
  return decoded.userId || decoded.id || decoded.hotelUserId || decoded._id || "";
}

function toDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addMs(date, ms) {
  return new Date(date.getTime() + ms);
}

function secondsUntil(date) {
  const target = toDate(date);
  if (!target) return 0;

  return Math.max(0, Math.ceil((target.getTime() - Date.now()) / 1000));
}

function hasText(value = "", phrases = []) {
  const text = String(value || "").toLowerCase();
  return phrases.some((phrase) => text.includes(String(phrase).toLowerCase()));
}

function shouldForceRejectAnalysis(analysis = {}) {
  const combinedText = [
    analysis.aiSummary,
    analysis.aiError,
    analysis.aiDocumentType,
    analysis.aiDecision,
    analysis.aiRiskLevel,
    ...(Array.isArray(analysis.reasons) ? analysis.reasons : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const noIdPhrases = [
    "not an id",
    "not a government id",
    "not an id document",
    "not an identification document",
    "no identity fields",
    "no identity fields are visible",
    "no visible name",
    "no id number",
    "pizza",
    "order flow",
    "diagram",
    "receipt",
    "selfie",
    "screenshot",
    "blank",
    "unrelated",
  ];

  if (analysis.reviewDecision === "auto_rejected") return true;
  if (analysis.aiDecision === "reject") return true;
  if (analysis.aiRiskLevel === "high" && hasText(combinedText, noIdPhrases)) {
    return true;
  }

  return hasText(combinedText, noIdPhrases);
}

function normalizeRejectedAnalysis(analysis = {}) {
  return {
    ...analysis,
    screeningStatus: "suspicious",
    reviewDecision: "auto_rejected",
    aiDecision: "reject",
    aiRiskLevel: "high",
    aiSummary:
      analysis.aiSummary ||
      "Auto-rejected because the uploaded file does not appear to be a real government ID.",
    reasons: [
      "Auto-rejected: no reliable government ID indicators were detected.",
      ...(Array.isArray(analysis.reasons) ? analysis.reasons : []),
    ],
  };
}

function buildUserFacingAiRemark(analysis) {
  if (analysis.reviewDecision === "auto_rejected") {
    return (
      analysis.aiSummary ||
      "ID upload was automatically rejected because the uploaded file does not appear to be a real government ID."
    );
  }

  if (analysis.aiConnectionStatus === "connected") {
    return "ID uploaded successfully. AI pre-check completed and is waiting for admin review.";
  }

  if (analysis.aiConnectionStatus === "missing_key") {
    return "ID uploaded successfully. AI pre-check did not run because the OpenAI key is not configured yet. Admin can still review the ID manually.";
  }

  if (analysis.aiConnectionStatus === "error") {
    return `ID uploaded successfully. AI pre-check could not finish: ${
      analysis.aiSummary || analysis.aiError || "OpenAI request failed."
    } Admin can rerun the AI check later.`;
  }

  if (analysis.aiConnectionStatus === "not_supported") {
    return "ID upload was rejected because this file type is not supported for ID verification.";
  }

  return "ID uploaded successfully and is pending manual review.";
}

function buildIdUploadPolicy(user, verification = null) {
  const status = String(user?.idVerificationStatus || "not_submitted");
  const isVerified =
    user?.isIdentityVerified === true || status === "verified";

  const reviewDecision = String(verification?.reviewDecision || "");
  const effectiveStatus =
    reviewDecision === "auto_rejected" && status !== "verified"
      ? "rejected"
      : status;

  if (isVerified) {
    return {
      canUpload: false,
      blockType: "verified",
      message: "Your ID is already approved. Uploading another ID is disabled.",
      lockedUntil: null,
      secondsRemaining: 0,
    };
  }

  if (effectiveStatus === "pending") {
    return {
      canUpload: false,
      blockType: "manual_review",
      message:
        "Your uploaded ID is still under manual review. You can upload again only after the admin rejects it.",
      lockedUntil: null,
      secondsRemaining: 0,
    };
  }

  if (effectiveStatus === "rejected") {
    const lastActionDate =
      toDate(verification?.reviewedAt) ||
      toDate(verification?.updatedAt) ||
      toDate(verification?.createdAt) ||
      toDate(user?.updatedAt) ||
      new Date();

    const lockedUntil = addMs(lastActionDate, ID_REUPLOAD_COOLDOWN_MS);
    const remaining = secondsUntil(lockedUntil);

    if (remaining > 0) {
      return {
        canUpload: false,
        blockType: "cooldown",
        message: `Please wait ${remaining} second${
          remaining === 1 ? "" : "s"
        } before uploading another ID.`,
        lockedUntil: lockedUntil.toISOString(),
        secondsRemaining: remaining,
      };
    }

    return {
      canUpload: true,
      blockType: "",
      message: "You can upload another ID now.",
      lockedUntil: null,
      secondsRemaining: 0,
    };
  }

  return {
    canUpload: true,
    blockType: "",
    message: "You can upload an ID now.",
    lockedUntil: null,
    secondsRemaining: 0,
  };
}

export const uploadHotelIdForVerification = async (req, res) => {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  try {
    const consentGiven =
      String(req.body.consentGiven || "").toLowerCase() === "true" ||
      req.body.consentGiven === true;

    if (!consentGiven) {
      return res.status(400).json({
        success: false,
        message: "You must give consent before uploading your ID.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an ID file.",
      });
    }

    const userId = getUserIdFromDecoded(auth.decoded);
    const user = await HotelUser.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated.",
      });
    }

    const existingVerification = user.hotelIdVerificationId
      ? await HotelIdVerification.findById(user.hotelIdVerificationId).select(
          "reviewDecision reviewedByAdmin reviewedAt createdAt updatedAt"
        )
      : null;

    const uploadPolicy = buildIdUploadPolicy(user, existingVerification);

    if (!uploadPolicy.canUpload) {
      const statusCode =
        uploadPolicy.blockType === "cooldown"
          ? 429
          : uploadPolicy.blockType === "verified"
          ? 403
          : 409;

      return res.status(statusCode).json({
        success: false,
        message: uploadPolicy.message,
        idUploadPolicy: uploadPolicy,
        idVerificationStatus: user.idVerificationStatus,
        isIdentityVerified: user.isIdentityVerified,
      });
    }

    if (user.hotelIdVerificationId) {
      await HotelIdVerification.findByIdAndDelete(user.hotelIdVerificationId);
    }

    let analysis = await analyzeUploadedId({
      file: req.file,
      idType: "uploaded_id",
    });

    if (shouldForceRejectAnalysis(analysis)) {
      analysis = normalizeRejectedAnalysis(analysis);
    }

    const autoRejected = analysis.reviewDecision === "auto_rejected";

    const verification = await HotelIdVerification.create({
      hotelUserId: user._id,
      fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.email,
      idType: "uploaded_id",
      consentGiven: true,
      consentAt: new Date(),

      idFile: {
        data: req.file.buffer,
        originalName: req.file.originalname || "",
        mimeType: req.file.mimetype || "",
        size: req.file.size || 0,
      },

      screeningStatus: analysis.screeningStatus,
      confidenceScore: analysis.confidenceScore,
      extractedText: analysis.extractedText,
      matchedKeywords: analysis.matchedKeywords,
      checks: analysis.checks,
      reasons: analysis.reasons,

      reviewDecision: analysis.reviewDecision || "manual_review",
      reviewedByAdmin: false,
      reviewedAt: null,
      reviewRemarks: autoRejected
        ? "Automatically rejected because no real government ID indicators were detected."
        : "",

      aiConnected: Boolean(analysis.aiConnected),
      aiConnectionStatus: analysis.aiConnectionStatus || "not_checked",
      aiProvider: analysis.aiProvider || "",
      aiModel: analysis.aiModel || "",
      aiCheckedAt: analysis.aiCheckedAt || null,
      aiSummary: analysis.aiSummary || "",
      aiDocumentType: analysis.aiDocumentType || "unknown",
      aiRiskLevel: analysis.aiRiskLevel || "unknown",
      aiDecision: analysis.aiDecision || "needs_manual_review",
      aiError: analysis.aiError || "",
      aiRawResult: analysis.aiRawResult || null,
    });

    user.hotelIdVerificationId = verification._id;
    user.idVerificationStatus = autoRejected ? "rejected" : "pending";
    user.isIdentityVerified = false;
    user.idVerifiedAt = null;
    user.idVerificationRemarks = buildUserFacingAiRemark(analysis);

    await user.save();

    const nextPolicy = buildIdUploadPolicy(user, verification);

    return res.status(200).json({
      success: true,
      message: user.idVerificationRemarks,
      idVerificationStatus: user.idVerificationStatus,
      isIdentityVerified: user.isIdentityVerified,
      idVerificationRemarks: user.idVerificationRemarks,
      idUploadPolicy: nextPolicy,

      hotelIdVerificationId: verification._id,
      screeningStatus: verification.screeningStatus,
      reviewDecision: verification.reviewDecision,
      confidenceScore: verification.confidenceScore,
      aiConnected: verification.aiConnected,
      aiConnectionStatus: verification.aiConnectionStatus,
      aiProvider: verification.aiProvider,
      aiModel: verification.aiModel,
      aiCheckedAt: verification.aiCheckedAt,
      aiSummary: verification.aiSummary,
      aiDocumentType: verification.aiDocumentType,
      aiRiskLevel: verification.aiRiskLevel,
      aiDecision: verification.aiDecision,
      aiError: verification.aiError,
      reasons: verification.reasons,
    });
  } catch (err) {
    console.error("uploadHotelIdForVerification error:", err);

    return res.status(500).json({
      success: false,
      message: "Error uploading ID for verification.",
    });
  }
};
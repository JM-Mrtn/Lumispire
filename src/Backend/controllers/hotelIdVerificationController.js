// src/Backend/controllers/hotelIdVerificationController.js
import HotelUser from "../models/hotelUser.js";
import HotelIdVerification from "../models/HotelIdVerification.js";
import { requireHotelUserAuth } from "../utils/hotelAuthHelpers.js";
import { analyzeUploadedId } from "../utils/hotelIdScreening.js";

function getUserIdFromDecoded(decoded = {}) {
  return decoded.userId || decoded.id || decoded.hotelUserId || decoded._id || "";
}

function buildUserFacingAiRemark(analysis) {
  if (analysis.aiConnectionStatus === "connected") {
    return "ID uploaded successfully. AI pre-check completed and is waiting for admin review.";
  }

  if (analysis.aiConnectionStatus === "missing_key") {
    return "ID uploaded successfully. AI pre-check did not run because the OpenAI key is not configured yet. Admin can still review the ID manually.";
  }

  if (analysis.aiConnectionStatus === "error") {
    return `ID uploaded successfully. AI pre-check could not finish: ${analysis.aiSummary || analysis.aiError || "OpenAI request failed."} Admin can rerun the AI check later.`;
  }

  if (analysis.aiConnectionStatus === "not_supported") {
    return "ID uploaded successfully. AI pre-check did not run because this file type is not supported for AI reading. Admin can review it manually.";
  }

  return "ID uploaded successfully and is pending manual review.";
}

export const uploadHotelIdForVerification = async (req, res) => {
  const auth = requireHotelUserAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  try {
    const consentGiven =
      String(req.body.consentGiven || "").toLowerCase() === "true" ||
      req.body.consentGiven === true;

    if (!consentGiven) {
      return res.status(400).json({
        message: "You must give consent before uploading your ID.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an ID file." });
    }

    const userId = getUserIdFromDecoded(auth.decoded);
    const user = await HotelUser.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.hotelIdVerificationId) {
      await HotelIdVerification.findByIdAndDelete(user.hotelIdVerificationId);
    }

    const analysis = await analyzeUploadedId({
      file: req.file,
      idType: "uploaded_id",
    });

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
      reviewDecision: "manual_review",
      reviewedByAdmin: false,
      reviewedAt: null,
      reviewRemarks: "",
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
    user.idVerificationStatus = "pending";
    user.isIdentityVerified = false;
    user.idVerifiedAt = null;
    user.idVerificationRemarks = buildUserFacingAiRemark(analysis);

    await user.save();

    return res.status(200).json({
      message: user.idVerificationRemarks,
      idVerificationStatus: user.idVerificationStatus,
      isIdentityVerified: user.isIdentityVerified,
      idVerificationRemarks: user.idVerificationRemarks,
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
    return res.status(500).json({ message: "Error uploading ID for verification." });
  }
};

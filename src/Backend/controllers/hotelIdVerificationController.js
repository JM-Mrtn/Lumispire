// src/Backend/controllers/hotelIdVerificationController.js
import HotelUser from "../models/hotelUser.js";
import HotelIdVerification from "../models/HotelIdVerification.js";
import { requireHotelUserAuth } from "../utils/hotelAuthHelpers.js";
import { analyzeUploadedId } from "../utils/hotelIdScreening.js";

function getUserIdFromDecoded(decoded = {}) {
  return decoded.userId || decoded.id || decoded.hotelUserId || decoded._id || "";
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

    const analysis = analyzeUploadedId({
      file: req.file,
      idType: "",
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
      reviewDecision: analysis.reviewDecision,
      reviewedByAdmin: false,
      reviewedAt: null,
      reviewRemarks: "",
    });

    user.hotelIdVerificationId = verification._id;

    if (analysis.reviewDecision === "auto_rejected") {
      user.idVerificationStatus = "rejected";
      user.isIdentityVerified = false;
      user.idVerifiedAt = null;
      user.idVerificationRemarks = analysis.reasons.join(" ");
    } else if (analysis.reviewDecision === "auto_approved") {
      user.idVerificationStatus = "verified";
      user.isIdentityVerified = true;
      user.idVerifiedAt = new Date();
      user.idVerificationRemarks = "Automatically approved by ID screening.";
    } else {
      user.idVerificationStatus = "pending";
      user.isIdentityVerified = false;
      user.idVerifiedAt = null;
      user.idVerificationRemarks =
        "ID uploaded successfully and is pending manual review.";
    }

    await user.save();

    return res.status(200).json({
      message:
        analysis.reviewDecision === "auto_rejected"
          ? "ID was automatically rejected."
          : analysis.reviewDecision === "auto_approved"
          ? "ID was automatically approved."
          : "ID uploaded successfully. Verification is pending review.",
      idVerificationStatus: user.idVerificationStatus,
      isIdentityVerified: user.isIdentityVerified,
      idVerificationRemarks: user.idVerificationRemarks,
      hotelIdVerificationId: verification._id,
      screeningStatus: verification.screeningStatus,
      reviewDecision: verification.reviewDecision,
      confidenceScore: verification.confidenceScore,
    });
  } catch (err) {
    console.error("uploadHotelIdForVerification error:", err);
    return res.status(500).json({ message: "Error uploading ID for verification." });
  }
};
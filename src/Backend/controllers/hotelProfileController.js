// src/Backend/controllers/hotelProfileController.js
import bcrypt from "bcrypt";
import HotelUser from "../models/hotelUser.js";
import {
  requireHotelUserAuth,
  isValidObjectId,
} from "../utils/hotelAuthHelpers.js";

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

const getProfilePictureUrl = (user) => {
  const hasProfile =
    user?.profilePicture &&
    user.profilePicture.contentType &&
    Number(user.profilePicture.size || 0) > 0;

  return hasProfile ? `/api/hotel/profile-picture/${user._id}` : "";
};

export const getHotelUserProfile = async (req, res) => {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  try {
    const userId = getUserIdFromDecoded(auth.decoded);

    const user = await HotelUser.findById(userId)
      .populate({
        path: "hotelIdVerificationId",
        select:
          "screeningStatus confidenceScore reviewDecision reviewRemarks reasons createdAt updatedAt reviewedAt reviewedByAdmin aiConnected aiConnectionStatus aiProvider aiModel aiCheckedAt aiSummary aiDocumentType aiRiskLevel aiDecision aiError",
      })
      .select(
        "-password -passwordHash -verificationToken -verificationTokenExpiry -usedVerificationTokens -resetPasswordToken -resetPasswordTokenHash -resetPasswordExpiresAt -resetPasswordExpires -resetPasswordExpiry -changePasswordOtpHash -changePasswordOtpExpiresAt -passwordChangeOtpHash -passwordChangeOtpExpiresAt -changePwOtpHash -changePwOtpExpiry -changePwOtpAttempts -pendingNewPasswordHash -changePwOtpLastSentAt"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const plain = user.toObject();
    plain.profilePicture = getProfilePictureUrl(user);
    plain.idUploadPolicy = buildIdUploadPolicy(
      user,
      plain.hotelIdVerificationId || null
    );

    return res.status(200).json(plain);
  } catch (err) {
    console.error("getHotelUserProfile error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching profile.",
    });
  }
};

export const getProfilePicture = async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid userId",
    });
  }

  try {
    const user = await HotelUser.findById(userId).select(
      "+profilePicture.data profilePicture.contentType profilePicture.filename profilePicture.size"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.profilePicture?.data) {
      return res.status(404).json({
        success: false,
        message: "No profile picture found.",
      });
    }

    res.setHeader(
      "Content-Type",
      user.profilePicture.contentType || "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(
        user.profilePicture.filename || "profile-picture"
      )}"`
    );

    return res.send(user.profilePicture.data);
  } catch (err) {
    console.error("getProfilePicture error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching profile picture.",
    });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded.",
      });
    }

    const userId = getUserIdFromDecoded(auth.decoded);

    const user = await HotelUser.findById(userId).select(
      "+profilePicture.data"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.profilePicture = {
      data: req.file.buffer,
      contentType: req.file.mimetype || "",
      filename: req.file.originalname || "",
      size: req.file.size || 0,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully.",
      profilePicture: `/api/hotel/profile-picture/${user._id}`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profilePicture: `/api/hotel/profile-picture/${user._id}`,
      },
    });
  } catch (err) {
    console.error("uploadProfilePicture error:", err);

    return res.status(500).json({
      success: false,
      message: "Error uploading profile picture.",
    });
  }
};

export const updateUser = async (req, res) => {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid userId",
    });
  }

  const tokenUserId = getUserIdFromDecoded(auth.decoded);

  if (String(tokenUserId) !== String(userId) && !auth.decoded.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Forbidden.",
    });
  }

  try {
    const update = {};

    ["firstName", "lastName", "phone", "username", "email"].forEach((key) => {
      if (req.body[key] !== undefined) {
        update[key] = String(req.body[key]).trim();
      }
    });

    if (update.email) update.email = update.email.toLowerCase();

    if (update.username) {
      const exists = await HotelUser.findOne({
        username: update.username,
        _id: { $ne: userId },
      }).select("_id");

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Username already taken.",
        });
      }
    }

    if (update.email) {
      const exists = await HotelUser.findOne({
        email: update.email,
        _id: { $ne: userId },
      }).select("_id");

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }
    }

    if (req.body.password) {
      const password = String(req.body.password || "");
      const confirmPassword = String(req.body.confirmPassword || "");

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      update.password = hashedPassword;
      update.passwordHash = hashedPassword;
      update.changePwOtpHash = null;
      update.changePwOtpExpiry = null;
      update.changePwOtpAttempts = 0;
      update.pendingNewPasswordHash = null;
      update.changePwOtpLastSentAt = null;
    }

    const user = await HotelUser.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).select(
      "-password -passwordHash -changePwOtpHash -changePwOtpExpiry -changePwOtpAttempts -pendingNewPasswordHash -changePwOtpLastSentAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const plain = user.toObject();
    plain.profilePicture = getProfilePictureUrl(user);

    return res.status(200).json({
      success: true,
      message: "Updated successfully",
      user: plain,
    });
  } catch (err) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";

      return res.status(409).json({
        success: false,
        message: `${field} already exists.`,
      });
    }

    console.error("updateUser error:", err);

    return res.status(500).json({
      success: false,
      message: "Error updating user.",
    });
  }
};
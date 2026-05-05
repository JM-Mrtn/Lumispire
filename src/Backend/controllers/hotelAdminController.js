import bcrypt from "bcrypt";
import HotelUser from "../models/hotelUser.js";
import HotelIdVerification from "../models/HotelIdVerification.js";
import {
  requireHotelAdminAuth,
  isValidObjectId,
  signHotelAdminToken,
} from "../utils/hotelAuthHelpers.js";

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    const HOTEL_ADMIN_USER = String(process.env.HOTEL_ADMIN_USER || "").trim();
    const HOTEL_ADMIN_PASS = String(process.env.HOTEL_ADMIN_PASS || "").trim();
    const HOTEL_ADMIN_JWT_SECRET = String(
      process.env.HOTEL_ADMIN_JWT_SECRET || process.env.JWT_SECRET || ""
    ).trim();

    if (!HOTEL_ADMIN_USER || !HOTEL_ADMIN_PASS) {
      return res.status(500).json({
        message: "Hotel admin credentials are not configured.",
      });
    }

    if (!HOTEL_ADMIN_JWT_SECRET) {
      return res.status(500).json({
        message: "HOTEL_ADMIN_JWT_SECRET or JWT_SECRET is missing in .env",
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const okUser = String(username).trim() === HOTEL_ADMIN_USER;
    const okPass = String(password) === HOTEL_ADMIN_PASS;

    if (!okUser || !okPass) {
      return res.status(401).json({ message: "Invalid hotel admin credentials." });
    }

    const hotelAdminToken = signHotelAdminToken(
      {
        id: "hotel-admin",
        username: HOTEL_ADMIN_USER,
        role: "hotel_admin",
        scope: "hotel",
        isHotelAdmin: true,
      },
      process.env.HOTEL_ADMIN_JWT_EXPIRES_IN || "7d"
    );

    return res.status(200).json({
      message: "Hotel admin login successful.",
      hotelAdminToken,
      adminToken: hotelAdminToken,
      token: hotelAdminToken,
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    return res.status(500).json({ message: "Server error during admin login." });
  }
};

export const getAllHotelUsers = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  try {
    const users = await HotelUser.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "hotelIdVerificationId",
        select:
          "idFile screeningStatus confidenceScore reviewDecision reviewRemarks reasons createdAt",
      })
      .select(
        "-password -verificationToken -verificationTokenExpiry -usedVerificationTokens -resetPasswordToken -resetPasswordExpiry -changePwOtpHash -changePwOtpExpiry -changePwOtpAttempts -pendingNewPasswordHash -changePwOtpLastSentAt"
      );

    return res.status(200).json(users);
  } catch (err) {
    console.error("getAllHotelUsers error:", err);
    return res.status(500).json({ message: "Error fetching users." });
  }
};

export const getHotelUserById = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const user = await HotelUser.findById(userId)
      .populate({
        path: "hotelIdVerificationId",
        select:
          "idFile screeningStatus confidenceScore reviewDecision reviewRemarks reasons createdAt",
      })
      .select(
        "-password -verificationToken -verificationTokenExpiry -usedVerificationTokens -resetPasswordToken -resetPasswordExpiry -changePwOtpHash -changePwOtpExpiry -changePwOtpAttempts -pendingNewPasswordHash -changePwOtpLastSentAt"
      );

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.status(200).json(user);
  } catch (err) {
    console.error("getHotelUserById error:", err);
    return res.status(500).json({ message: "Error fetching user." });
  }
};

export const adminUpdateUser = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const update = {};

    ["firstName", "lastName", "username", "email", "phone"].forEach((k) => {
      if (req.body[k] !== undefined) {
        const val = String(req.body[k]).trim();
        if (val !== "") update[k] = val;
      }
    });

    if (update.email) update.email = update.email.toLowerCase();

    if (update.username) {
      const exists = await HotelUser.findOne({
        username: update.username,
        _id: { $ne: userId },
      }).select("_id");

      if (exists) {
        return res.status(409).json({ message: "Username already taken." });
      }
    }

    if (update.email) {
      const exists = await HotelUser.findOne({
        email: update.email,
        _id: { $ne: userId },
      }).select("_id");

      if (exists) {
        return res.status(409).json({ message: "Email already exists." });
      }
    }

    const pw = String(req.body.password || "");
    const cpw = String(req.body.confirmPassword || "");

    if (pw) {
      if (!cpw) {
        return res.status(400).json({ message: "Confirm password is required." });
      }

      if (pw !== cpw) {
        return res.status(400).json({ message: "Passwords do not match." });
      }

      update.password = await bcrypt.hash(pw, 10);
      update.passwordHash = update.password;
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

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({
      message: "Admin updated user successfully",
      user,
    });
  } catch (err) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(409).json({ message: `${field} already exists.` });
    }

    console.error("adminUpdateUser error:", err);
    return res.status(500).json({ message: "Error updating user." });
  }
};

export const deactivateUser = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const user = await HotelUser.findByIdAndUpdate(
      userId,
      { active: false },
      { new: true }
    ).select(
      "-password -passwordHash -changePwOtpHash -changePwOtpExpiry -changePwOtpAttempts -pendingNewPasswordHash -changePwOtpLastSentAt"
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({ message: "User deactivated", user });
  } catch (err) {
    console.error("deactivateUser error:", err);
    return res.status(500).json({ message: "Error deactivating user." });
  }
};

export const activateUser = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const user = await HotelUser.findByIdAndUpdate(
      userId,
      { active: true },
      { new: true }
    ).select(
      "-password -passwordHash -changePwOtpHash -changePwOtpExpiry -changePwOtpAttempts -pendingNewPasswordHash -changePwOtpLastSentAt"
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({ message: "User activated", user });
  } catch (err) {
    console.error("activateUser error:", err);
    return res.status(500).json({ message: "Error activating user." });
  }
};

export const deleteDeactivatedUser = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const user = await HotelUser.findById(userId).select(
      "active username email hotelIdVerificationId"
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.active !== false) {
      return res.status(400).json({
        message: "Only deactivated accounts can be permanently deleted.",
      });
    }

    await HotelIdVerification.deleteMany({
      $or: [
        { hotelUserId: user._id },
        ...(user.hotelIdVerificationId ? [{ _id: user.hotelIdVerificationId }] : []),
      ],
    });

    await HotelUser.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "Deactivated account deleted successfully.",
      deletedUserId: userId,
    });
  } catch (err) {
    console.error("deleteDeactivatedUser error:", err);
    return res.status(500).json({ message: "Error deleting account." });
  }
};

export const adminApproveHotelId = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const user = await HotelUser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.idVerificationStatus = "verified";
    user.isIdentityVerified = true;
    user.idVerifiedAt = new Date();
    user.idVerificationRemarks =
      String(req.body.remarks || "").trim() || "ID approved by admin.";

    await user.save();

    if (user.hotelIdVerificationId) {
      await HotelIdVerification.findByIdAndUpdate(user.hotelIdVerificationId, {
        screeningStatus: "likely_valid",
        confidenceScore: 100,
        reviewedByAdmin: true,
        reviewedAt: new Date(),
        reviewRemarks: user.idVerificationRemarks,
        reasons: ["Approved by admin."],
      });
    }

    return res.status(200).json({
      message: "User ID approved successfully.",
      user,
    });
  } catch (err) {
    console.error("adminApproveHotelId error:", err);
    return res.status(500).json({ message: "Error approving user ID." });
  }
};

export const adminRejectHotelId = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const remarks =
      String(req.body.remarks || "").trim() || "Uploaded ID was rejected.";

    const user = await HotelUser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.idVerificationStatus = "rejected";
    user.isIdentityVerified = false;
    user.idVerifiedAt = null;
    user.idVerificationRemarks = remarks;

    await user.save();

    if (user.hotelIdVerificationId) {
      await HotelIdVerification.findByIdAndUpdate(user.hotelIdVerificationId, {
        screeningStatus: "suspicious",
        reviewedByAdmin: true,
        reviewedAt: new Date(),
        reviewRemarks: remarks,
        reasons: [remarks],
      });
    }

    return res.status(200).json({
      message: "User ID rejected successfully.",
      user,
    });
  } catch (err) {
    console.error("adminRejectHotelId error:", err);
    return res.status(500).json({ message: "Error rejecting user ID." });
  }
};

export const adminGetHotelIdFile = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const { verificationId } = req.params;

  if (!isValidObjectId(verificationId)) {
    return res.status(400).json({ message: "Invalid verificationId" });
  }

  try {
    const verification = await HotelIdVerification.findById(verificationId).select(
      "+idFile.data idFile.mimeType idFile.originalName idFile.size"
    );

    if (!verification) {
      return res.status(404).json({ message: "Verification record not found." });
    }

    if (!verification.idFile?.data) {
      return res.status(404).json({ message: "No ID file found." });
    }

    res.setHeader(
      "Content-Type",
      verification.idFile.mimeType || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(
        verification.idFile.originalName || "hotel-id-file"
      )}"`
    );

    return res.send(verification.idFile.data);
  } catch (err) {
    console.error("adminGetHotelIdFile error:", err);
    return res.status(500).json({ message: "Error fetching hotel ID file." });
  }
};
// src/Backend/controllers/hotelProfileController.js
import bcrypt from "bcrypt";
import HotelUser from "../models/hotelUser.js";
import {
  requireHotelUserAuth,
  isValidObjectId,
} from "../utils/hotelAuthHelpers.js";

function getUserIdFromDecoded(decoded = {}) {
  return decoded.userId || decoded.id || decoded.hotelUserId || decoded._id || "";
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
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  try {
    const userId = getUserIdFromDecoded(auth.decoded);

    const user = await HotelUser.findById(userId).select(
      "-password -passwordHash -verificationToken -verificationTokenExpiry -usedVerificationTokens -resetPasswordToken -resetPasswordExpiry -changePwOtpHash -changePwOtpExpiry -changePwOtpAttempts -pendingNewPasswordHash -changePwOtpLastSentAt"
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    const plain = user.toObject();
    plain.profilePicture = getProfilePictureUrl(user);

    return res.status(200).json(plain);
  } catch (err) {
    console.error("getHotelUserProfile error:", err);
    return res.status(500).json({ message: "Error fetching profile." });
  }
};

export const getProfilePicture = async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const user = await HotelUser.findById(userId).select(
      "+profilePicture.data profilePicture.contentType profilePicture.filename profilePicture.size"
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.profilePicture?.data) {
      return res.status(404).json({ message: "No profile picture found." });
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
    return res.status(500).json({ message: "Error fetching profile picture." });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const auth = requireHotelUserAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    const userId = getUserIdFromDecoded(auth.decoded);

    const user = await HotelUser.findById(userId).select(
      "+profilePicture.data"
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    user.profilePicture = {
      data: req.file.buffer,
      contentType: req.file.mimetype || "",
      filename: req.file.originalname || "",
      size: req.file.size || 0,
    };

    await user.save();

    return res.status(200).json({
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
    return res.status(500).json({ message: "Error uploading profile picture." });
  }
};

export const updateUser = async (req, res) => {
  const auth = requireHotelUserAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  const tokenUserId = getUserIdFromDecoded(auth.decoded);

  if (String(tokenUserId) !== String(userId) && !auth.decoded.isAdmin) {
    return res.status(403).json({ message: "Forbidden." });
  }

  try {
    const update = {};

    ["firstName", "lastName", "phone", "username", "email"].forEach((k) => {
      if (req.body[k] !== undefined) update[k] = String(req.body[k]).trim();
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

    if (req.body.password) {
      const pw = String(req.body.password || "");
      const cpw = String(req.body.confirmPassword || "");

      if (pw !== cpw) {
        return res.status(400).json({ message: "Passwords do not match." });
      }

      const hashedPassword = await bcrypt.hash(pw, 10);

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

    if (!user) return res.status(404).json({ message: "User not found." });

    const plain = user.toObject();
    plain.profilePicture = getProfilePictureUrl(user);

    return res.status(200).json({ message: "Updated successfully", user: plain });
  } catch (err) {
    console.error("updateUser error:", err);

    if (err?.code === 11000) {
      return res.status(409).json({ message: "Username or email already exists." });
    }

    return res.status(500).json({ message: "Error updating user." });
  }
};
import bcrypt from "bcrypt";
import crypto from "crypto";
import HotelUser from "../models/hotelUser.js";
import { requireHotelUserAuth } from "../utils/hotelAuthHelpers.js";
import {
  sendHotelResetPasswordEmail,
  sendHotelChangePasswordOtpEmail,
} from "../utils/hotelEmailHelpers.js";

function cleanText(value = "") {
  return String(value || "").trim();
}

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function generateRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function getUserIdFromDecoded(decoded = {}) {
  return (
    decoded.id ||
    decoded._id ||
    decoded.userId ||
    decoded.hotelUserId ||
    decoded.sub ||
    ""
  );
}

function maskEmail(email = "") {
  const value = String(email || "").trim();
  const [local, domain] = value.split("@");

  if (!local || !domain) return value || "your email";

  const visibleLocal =
    local.length <= 2 ? `${local[0] || "*"}*` : `${local.slice(0, 2)}***`;

  return `${visibleLocal}@${domain}`;
}

function isPasswordStrongEnough(password = "") {
  return String(password || "").length >= 8;
}

async function comparePassword(inputPassword, user) {
  const savedPassword = user?.passwordHash || user?.password || "";

  if (!savedPassword) return false;

  try {
    return bcrypt.compare(String(inputPassword || ""), savedPassword);
  } catch {
    return false;
  }
}

async function setUserPassword(user, newPassword) {
  const hashedPassword = await bcrypt.hash(String(newPassword || ""), 10);

  /*
    Compatibility:
    Some versions of your HotelUser model use "password",
    others use "passwordHash". This sets both safely.
  */
  user.password = hashedPassword;
  user.passwordHash = hashedPassword;

  return user;
}

function clearResetPasswordFields(user) {
  user.resetPasswordToken = "";
  user.resetPasswordTokenHash = "";
  user.resetPasswordExpiresAt = null;
  user.resetPasswordExpires = null;
  user.resetPasswordExpiry = null;
}

function clearChangePasswordOtpFields(user) {
  user.changePasswordOtpHash = "";
  user.changePasswordOtpExpiresAt = null;

  user.passwordChangeOtpHash = "";
  user.passwordChangeOtpExpiresAt = null;

  user.changePwOtpHash = null;
  user.changePwOtpExpiry = null;
  user.changePwOtpAttempts = 0;
  user.pendingNewPasswordHash = null;
  user.changePwOtpLastSentAt = null;
}

function getOtpHash(user) {
  return (
    user?.changePasswordOtpHash ||
    user?.passwordChangeOtpHash ||
    user?.changePwOtpHash ||
    ""
  );
}

function getOtpExpiresAt(user) {
  return (
    user?.changePasswordOtpExpiresAt ||
    user?.passwordChangeOtpExpiresAt ||
    user?.changePwOtpExpiry ||
    null
  );
}

function setOtpFields(user, otpHash, expiresAt) {
  /*
    Compatibility with different field names used in your previous files.
  */
  user.changePasswordOtpHash = otpHash;
  user.changePasswordOtpExpiresAt = expiresAt;

  user.passwordChangeOtpHash = otpHash;
  user.passwordChangeOtpExpiresAt = expiresAt;

  user.changePwOtpHash = otpHash;
  user.changePwOtpExpiry = expiresAt;
  user.changePwOtpLastSentAt = new Date();

  if (typeof user.changePwOtpAttempts === "number") {
    user.changePwOtpAttempts += 1;
  } else {
    user.changePwOtpAttempts = 1;
  }
}

async function getAuthenticatedHotelUser(req, selectExtra = "") {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return {
      ok: false,
      status: auth.status,
      message: auth.message,
      user: null,
    };
  }

  const userId = getUserIdFromDecoded(auth.decoded);

  if (!userId) {
    return {
      ok: false,
      status: 401,
      message: "Invalid user token.",
      user: null,
    };
  }

  const user = await HotelUser.findById(userId).select(selectExtra);

  if (!user) {
    return {
      ok: false,
      status: 404,
      message: "User not found.",
      user: null,
    };
  }

  if (user.active === false) {
    return {
      ok: false,
      status: 403,
      message: "Your account is deactivated.",
      user: null,
    };
  }

  return {
    ok: true,
    status: 200,
    message: "",
    user,
  };
}

async function createAndSendChangePasswordOtp(user) {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  setOtpFields(user, otpHash, expiresAt);
  await user.save();

  try {
    await sendHotelChangePasswordOtpEmail(user.email, otp);
  } catch (emailError) {
    clearChangePasswordOtpFields(user);
    await user.save();
    throw emailError;
  }

  return otp;
}

/* ===================== FORGOT PASSWORD ===================== */

export async function forgotPassword(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await HotelUser.findOne({ email }).select(
      "+resetPasswordToken +resetPasswordTokenHash +resetPasswordExpiresAt +resetPasswordExpires +resetPasswordExpiry"
    );

    /*
      Do not reveal if the email exists.
    */
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a reset link has been sent.",
      });
    }

    const rawToken = generateRawToken(32);
    const hashedToken = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    /*
      Compatibility:
      Keep raw token for older frontend reset links,
      and hashed token for safer newer checking.
    */
    user.resetPasswordToken = rawToken;
    user.resetPasswordTokenHash = hashedToken;
    user.resetPasswordExpiresAt = expiresAt;
    user.resetPasswordExpires = expiresAt;
    user.resetPasswordExpiry = expiresAt;

    await user.save();

    try {
      await sendHotelResetPasswordEmail(email, rawToken);
    } catch (emailError) {
      console.error("forgotPassword email error:", emailError);

      clearResetPasswordFields(user);
      await user.save();

      return res.status(500).json({
        success: false,
        message: emailError?.message || "Failed to send password reset email.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "If the email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to request password reset.",
    });
  }
}

/* ===================== RESET PASSWORD ===================== */

export async function resetPassword(req, res) {
  try {
    const rawToken = cleanText(req.params?.token || req.body?.token);
    const newPassword = String(req.body?.newPassword || req.body?.password || "");

    if (!rawToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required.",
      });
    }

    if (!isPasswordStrongEnough(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    let user = await HotelUser.findOne({
      resetPasswordToken: rawToken,
    }).select(
      "+password +passwordHash +resetPasswordToken +resetPasswordTokenHash +resetPasswordExpiresAt +resetPasswordExpires +resetPasswordExpiry"
    );

    /*
      Fallback for hashed token storage.
    */
    if (!user) {
      const candidates = await HotelUser.find({
        $or: [
          { resetPasswordExpiresAt: { $gt: new Date() } },
          { resetPasswordExpires: { $gt: new Date() } },
          { resetPasswordExpiry: { $gt: new Date() } },
        ],
      }).select(
        "+password +passwordHash +resetPasswordToken +resetPasswordTokenHash +resetPasswordExpiresAt +resetPasswordExpires +resetPasswordExpiry"
      );

      for (const candidate of candidates) {
        if (
          candidate.resetPasswordTokenHash &&
          (await bcrypt.compare(rawToken, candidate.resetPasswordTokenHash))
        ) {
          user = candidate;
          break;
        }
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    const expiresAt =
      user.resetPasswordExpiresAt ||
      user.resetPasswordExpires ||
      user.resetPasswordExpiry ||
      null;

    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      clearResetPasswordFields(user);
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Reset token has expired.",
      });
    }

    const sameAsCurrent = await comparePassword(newPassword, user);

    if (sameAsCurrent) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

    await setUserPassword(user, newPassword);
    clearResetPasswordFields(user);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password.",
    });
  }
}

/* ===================== REQUEST CHANGE PASSWORD OTP ===================== */

export async function requestChangePasswordOtp(req, res) {
  try {
    const result = await getAuthenticatedHotelUser(
      req,
      "+password +passwordHash +changePasswordOtpHash +changePasswordOtpExpiresAt +passwordChangeOtpHash +passwordChangeOtpExpiresAt +changePwOtpHash +changePwOtpExpiry +changePwOtpAttempts +pendingNewPasswordHash +changePwOtpLastSentAt"
    );

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    const user = result.user;
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (!isPasswordStrongEnough(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    const currentOk = await comparePassword(currentPassword, user);

    if (!currentOk) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const sameAsCurrent = await comparePassword(newPassword, user);

    if (sameAsCurrent) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

    /*
      Store pending password hash so resend/verify does not need to expose
      the plain new password repeatedly.
    */
    user.pendingNewPasswordHash = await bcrypt.hash(newPassword, 10);

    try {
      await createAndSendChangePasswordOtp(user);
    } catch (emailError) {
      console.error("requestChangePasswordOtp email error:", emailError);

      return res.status(500).json({
        success: false,
        message: emailError?.message || "Failed to send OTP email.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${maskEmail(user.email)}.`,
    });
  } catch (error) {
    console.error("requestChangePasswordOtp error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send password change OTP.",
    });
  }
}

/* ===================== RESEND CHANGE PASSWORD OTP ===================== */

export async function resendChangePasswordOtp(req, res) {
  try {
    const result = await getAuthenticatedHotelUser(
      req,
      "+password +passwordHash +changePasswordOtpHash +changePasswordOtpExpiresAt +passwordChangeOtpHash +passwordChangeOtpExpiresAt +changePwOtpHash +changePwOtpExpiry +changePwOtpAttempts +pendingNewPasswordHash +changePwOtpLastSentAt"
    );

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    const user = result.user;
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (currentPassword) {
      const currentOk = await comparePassword(currentPassword, user);

      if (!currentOk) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }
    }

    if (newPassword) {
      if (!isPasswordStrongEnough(newPassword)) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters.",
        });
      }

      const sameAsCurrent = await comparePassword(newPassword, user);

      if (sameAsCurrent) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from the current password.",
        });
      }

      user.pendingNewPasswordHash = await bcrypt.hash(newPassword, 10);
    }

    if (!user.pendingNewPasswordHash) {
      return res.status(400).json({
        success: false,
        message: "Please request an OTP first.",
      });
    }

    try {
      await createAndSendChangePasswordOtp(user);
    } catch (emailError) {
      console.error("resendChangePasswordOtp email error:", emailError);

      return res.status(500).json({
        success: false,
        message: emailError?.message || "Failed to resend OTP email.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `OTP resent successfully to ${maskEmail(user.email)}.`,
    });
  } catch (error) {
    console.error("resendChangePasswordOtp error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend password change OTP.",
    });
  }
}

/* ===================== VERIFY CHANGE PASSWORD OTP ===================== */

export async function verifyChangePasswordOtp(req, res) {
  try {
    const result = await getAuthenticatedHotelUser(
      req,
      "+password +passwordHash +changePasswordOtpHash +changePasswordOtpExpiresAt +passwordChangeOtpHash +passwordChangeOtpExpiresAt +changePwOtpHash +changePwOtpExpiry +changePwOtpAttempts +pendingNewPasswordHash +changePwOtpLastSentAt"
    );

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    const user = result.user;
    const otp = cleanText(req.body?.otp);
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    /*
      If frontend sends currentPassword/newPassword together with OTP,
      support that flow too.
    */
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required.",
        });
      }

      if (!isPasswordStrongEnough(newPassword)) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters.",
        });
      }

      const currentOk = await comparePassword(currentPassword, user);

      if (!currentOk) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }

      const sameAsCurrent = await comparePassword(newPassword, user);

      if (sameAsCurrent) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from the current password.",
        });
      }

      user.pendingNewPasswordHash = await bcrypt.hash(newPassword, 10);
    }

    const otpHash = getOtpHash(user);
    const otpExpiresAt = getOtpExpiresAt(user);

    if (!otpHash || !otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Please request an OTP first.",
      });
    }

    if (new Date(otpExpiresAt).getTime() < Date.now()) {
      clearChangePasswordOtpFields(user);
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const otpOk = await bcrypt.compare(otp, otpHash);

    if (!otpOk) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (!user.pendingNewPasswordHash) {
      return res.status(400).json({
        success: false,
        message: "Pending new password was not found. Please request an OTP again.",
      });
    }

    /*
      pendingNewPasswordHash is already hashed, so assign directly.
    */
    user.password = user.pendingNewPasswordHash;
    user.passwordHash = user.pendingNewPasswordHash;

    clearChangePasswordOtpFields(user);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("verifyChangePasswordOtp error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP.",
    });
  }
}

/* ===================== COMPATIBILITY EXPORTS ===================== */

export const forgotHotelPassword = forgotPassword;
export const hotelForgotPassword = forgotPassword;
export const requestPasswordReset = forgotPassword;

export const resetHotelPassword = resetPassword;
export const hotelResetPassword = resetPassword;

export const requestHotelChangePasswordOtp = requestChangePasswordOtp;
export const requestHotelPasswordOtp = requestChangePasswordOtp;

export const resendHotelChangePasswordOtp = resendChangePasswordOtp;
export const resendHotelPasswordOtp = resendChangePasswordOtp;

export const changePassword = verifyChangePasswordOtp;
export const changeHotelPassword = verifyChangePasswordOtp;
export const hotelChangePassword = verifyChangePasswordOtp;
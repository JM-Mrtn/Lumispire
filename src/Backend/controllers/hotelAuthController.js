import bcrypt from "bcrypt";
import crypto from "crypto";
import HotelUser from "../models/hotelUser.js";
import {
  signHotelUserToken,
  requireHotelUserAuth,
} from "../utils/hotelAuthHelpers.js";
import { sendHotelVerificationEmail } from "../utils/hotelEmailHelpers.js";

function cleanText(value = "") {
  return String(value || "").trim();
}

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function isPasswordStrongEnough(password = "") {
  return String(password || "").length >= 8;
}

function isValidPhilippinePhone(phone = "") {
  return /^09\d{9}$/.test(cleanText(phone));
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

function buildFullName({ firstName = "", middleName = "", lastName = "" } = {}) {
  return [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildUserPayload(user) {
  if (!user) return null;

  const firstName = user.firstName || "";
  const middleName = user.middleName || "";
  const lastName = user.lastName || "";

  return {
    _id: user._id,
    id: user._id,
    firstName,
    middleName,
    lastName,
    fullName:
      user.fullName ||
      buildFullName({
        firstName,
        middleName,
        lastName,
      }),
    username: user.username || "",
    email: user.email || "",
    phone: user.phone || user.phoneNumber || "",
    phoneNumber: user.phoneNumber || user.phone || "",
    address: user.address || "",
    profilePicture: user.profilePicture || "",
    active: user.active !== false,
    isEmailVerified:
      user.isEmailVerified === true ||
      user.emailVerified === true ||
      user.verified === true,
    emailVerified:
      user.emailVerified === true ||
      user.isEmailVerified === true ||
      user.verified === true,
    verified:
      user.verified === true ||
      user.isEmailVerified === true ||
      user.emailVerified === true,
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
  };
}

async function setUserPassword(user, password) {
  const hash = await bcrypt.hash(String(password || ""), 10);

  /*
    Compatibility:
    Some versions of your HotelUser model use "password",
    others may use "passwordHash". Setting both is safe.
  */
  user.password = hash;
  user.passwordHash = hash;

  return user;
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

async function findUserForPassword(email) {
  return HotelUser.findOne({ email }).select(
    "+password +passwordHash +verificationToken +verificationTokenExpiry +emailVerificationToken +emailVerificationExpiresAt"
  );
}

function makeHotelUserToken(user) {
  return signHotelUserToken(
    {
      id: user._id,
      userId: user._id,
      hotelUserId: user._id,
      email: user.email,
      role: "hotel_user",
      isHotelUser: true,
    },
    "7d"
  );
}

/* ===================== CHECK USERNAME ===================== */

export async function checkUsername(req, res) {
  try {
    const username = cleanText(req.query?.username || req.body?.username);

    if (!username) {
      return res.status(400).json({
        success: false,
        available: false,
        exists: false,
        message: "Username is required.",
      });
    }

    const existing = await HotelUser.findOne({
      username,
    })
      .select("_id username")
      .lean();

    return res.status(200).json({
      success: true,
      available: !existing,
      exists: Boolean(existing),
      message: existing ? "Username already taken." : "Username is available.",
    });
  } catch (error) {
    console.error("checkUsername error:", error);

    return res.status(500).json({
      success: false,
      available: false,
      exists: false,
      message: "Failed to check username.",
    });
  }
}

/* ===================== CHECK EMAIL ===================== */

export async function checkEmail(req, res) {
  try {
    const email = normalizeEmail(req.query?.email || req.body?.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        available: false,
        exists: false,
        message: "Email is required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        available: false,
        exists: false,
        message: "Please enter a valid email address.",
      });
    }

    const existing = await HotelUser.findOne({
      email,
    })
      .select("_id email")
      .lean();

    return res.status(200).json({
      success: true,
      available: !existing,
      exists: Boolean(existing),
      message: existing ? "Email is already registered." : "Email is available.",
    });
  } catch (error) {
    console.error("checkEmail error:", error);

    return res.status(500).json({
      success: false,
      available: false,
      exists: false,
      message: "Failed to check email.",
    });
  }
}

/* ===================== SIGN UP ===================== */

export async function hotelSignUp(req, res) {
  try {
    const firstName = cleanText(req.body?.firstName);
    const middleName = cleanText(req.body?.middleName);
    const lastName = cleanText(req.body?.lastName);
    const username = cleanText(req.body?.username);
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    const confirmPassword = String(req.body?.confirmPassword || "");
    const phone = cleanText(req.body?.phone || req.body?.phoneNumber);
    const address = cleanText(req.body?.address);

    if (!firstName || !lastName || !username || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name, username, email, phone number, and password are required.",
      });
    }

    if (!isValidPhilippinePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must start with 09 and be exactly 11 digits.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!isPasswordStrongEnough(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const duplicateConditions = [{ email }];
    if (username) duplicateConditions.push({ username });

    const existing = await HotelUser.findOne({
      $or: duplicateConditions,
    })
      .select("_id email username")
      .lean();

    if (existing?.email === email) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    if (username && existing?.username === username) {
      return res.status(409).json({
        success: false,
        message: "Username already taken.",
      });
    }

    const verificationToken = generateToken(32);
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new HotelUser({
      firstName,
      middleName,
      lastName,
      fullName: buildFullName({
        firstName,
        middleName,
        lastName,
      }),
      username,
      email,
      phone,
      phoneNumber: phone,
      address,
      active: true,

      isEmailVerified: false,
      emailVerified: false,
      verified: false,

      verificationToken,
      verificationTokenExpiry: verificationExpiresAt,

      emailVerificationToken: verificationToken,
      emailVerificationExpiresAt: verificationExpiresAt,
    });

    await setUserPassword(user, password);
    await user.save();

    try {
      await sendHotelVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("hotelSignUp verification email error:", emailError);
    }

    const token = makeHotelUserToken(user);

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please check your email for verification.",
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error("hotelSignUp error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create account.",
    });
  }
}

/* ===================== LOG IN ===================== */

export async function hotelLogIn(req, res) {
  try {
    const emailOrUsername = cleanText(
      req.body?.email || req.body?.username || req.body?.identifier
    );
    const password = String(req.body?.password || "");

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/username and password are required.",
      });
    }

    const normalized = normalizeEmail(emailOrUsername);

    const user = await HotelUser.findOne({
      $or: [{ email: normalized }, { username: emailOrUsername }],
    }).select(
      "+password +passwordHash +verificationToken +verificationTokenExpiry +emailVerificationToken +emailVerificationExpiresAt"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password.",
      });
    }

    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated.",
      });
    }

    const ok = await comparePassword(password, user);

    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password.",
      });
    }

    const token = makeHotelUserToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error("hotelLogIn error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to log in.",
    });
  }
}

/* ===================== VERIFY EMAIL ===================== */

export async function verifyEmail(req, res) {
  const shouldRedirect =
    String(req.query?.redirect || "") === "1" ||
    !String(req.headers.accept || "").includes("application/json");

  const getLoginRedirectUrl = (status = "success") => {
    const frontendBase = (
      process.env.CORS_ORIGIN ||
      process.env.FRONTEND_URL ||
      "http://localhost:5173"
    ).replace(/\/+$/, "");

    return `${frontendBase}/hotel-login?verified=${encodeURIComponent(status)}`;
  };

  const redirectToLogin = (status = "success") => {
    return res.redirect(302, getLoginRedirectUrl(status));
  };

  try {
    const verificationToken = cleanText(
      req.params?.verificationToken ||
        req.params?.token ||
        req.body?.verificationToken ||
        req.body?.token ||
        req.query?.verificationToken ||
        req.query?.token
    );

    if (!verificationToken) {
      if (shouldRedirect) return redirectToLogin("missing-token");

      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    const user = await HotelUser.findOne({
      $or: [
        { verificationToken },
        { emailVerificationToken: verificationToken },
      ],
    }).select(
      "+verificationToken +verificationTokenExpiry +emailVerificationToken +emailVerificationExpiresAt"
    );

    if (!user) {
      if (shouldRedirect) return redirectToLogin("invalid-or-expired");

      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token.",
      });
    }

    const expiresAt =
      user.verificationTokenExpiry || user.emailVerificationExpiresAt || null;

    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      if (shouldRedirect) return redirectToLogin("expired");

      return res.status(400).json({
        success: false,
        message: "Verification token has expired. Please request a new one.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerified = true;
    user.verified = true;
    user.emailVerifiedAt = new Date();

    user.verificationToken = "";
    user.verificationTokenExpiry = null;
    user.emailVerificationToken = "";
    user.emailVerificationExpiresAt = null;

    await user.save();

    if (shouldRedirect) return redirectToLogin("success");

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error("verifyEmail error:", error);

    if (shouldRedirect) return redirectToLogin("server-error");

    return res.status(500).json({
      success: false,
      message: "Failed to verify email.",
    });
  }
}

/* ===================== RESEND VERIFICATION ===================== */

export async function resendVerification(req, res) {
  try {
    const email = normalizeEmail(req.body?.email || req.query?.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const user = await HotelUser.findOne({ email }).select(
      "+verificationToken +verificationTokenExpiry +emailVerificationToken +emailVerificationExpiresAt"
    );

    /*
      Do not expose account existence too much.
    */
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If the email exists and is not verified, a verification email has been sent.",
      });
    }

    const alreadyVerified =
      user.isEmailVerified === true ||
      user.emailVerified === true ||
      user.verified === true;

    if (alreadyVerified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified.",
      });
    }

    const verificationToken = generateToken(32);
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationExpiresAt;
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiresAt = verificationExpiresAt;

    await user.save();

    try {
      await sendHotelVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("resendVerification email error:", emailError);

      return res.status(500).json({
        success: false,
        message: emailError?.message || "Failed to send verification email.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully.",
    });
  } catch (error) {
    console.error("resendVerification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email.",
    });
  }
}

/* ===================== ME ===================== */

export async function getHotelMe(req, res) {
  try {
    const auth = requireHotelUserAuth(req);

    if (!auth.ok) {
      return res.status(auth.status).json({
        success: false,
        message: auth.message,
      });
    }

    const userId = getUserIdFromDecoded(auth.decoded);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user token.",
      });
    }

    const user = await HotelUser.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error("getHotelMe error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load profile.",
    });
  }
}

/* ===================== COMPATIBILITY EXPORTS ===================== */

export const registerHotelUser = hotelSignUp;
export const register = hotelSignUp;
export const signup = hotelSignUp;
export const signUp = hotelSignUp;
export const hotelRegister = hotelSignUp;
export const hotelSignup = hotelSignUp;
export const registerUser = hotelSignUp;
export const signupUser = hotelSignUp;

export const loginHotelUser = hotelLogIn;
export const login = hotelLogIn;
export const hotelLogin = hotelLogIn;
export const loginUser = hotelLogIn;

export const verifyHotelEmail = verifyEmail;
export const confirmEmail = verifyEmail;
export const verifyHotelUserEmail = verifyEmail;

export const checkHotelEmail = checkEmail;
export const checkEmailAvailability = checkEmail;
export const checkHotelEmailAvailability = checkEmail;

export const checkHotelUsername = checkUsername;
export const checkUsernameAvailability = checkUsername;
export const checkHotelUsernameAvailability = checkUsername;

export const me = getHotelMe;
export const getMe = getHotelMe;
export const hotelMe = getHotelMe;
export const getHotelProfile = getHotelMe;
export const getCurrentUser = getHotelMe;
export const currentUser = getHotelMe;
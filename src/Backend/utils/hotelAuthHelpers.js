import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id || "").trim());
}

function cleanSecret(value = "") {
  return String(value || "").trim();
}

function getHotelUserJwtSecret() {
  return (
    cleanSecret(process.env.HOTEL_JWT_SECRET) ||
    cleanSecret(process.env.JWT_SECRET) ||
    cleanSecret(process.env.HOTEL_ADMIN_JWT_SECRET)
  );
}

function getHotelAdminJwtSecret() {
  return (
    cleanSecret(process.env.HOTEL_ADMIN_JWT_SECRET) ||
    cleanSecret(process.env.JWT_SECRET) ||
    cleanSecret(process.env.HOTEL_JWT_SECRET)
  );
}

function getBearerToken(req) {
  const auth = String(req?.headers?.authorization || "").trim();

  if (!auth.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return auth.slice("Bearer ".length).trim();
}

export function signHotelUserToken(
  payload,
  expiresIn = process.env.HOTEL_JWT_EXPIRES_IN || "7d",
  secret = getHotelUserJwtSecret()
) {
  const finalSecret = cleanSecret(secret);

  if (!finalSecret) {
    throw new Error(
      "HOTEL_JWT_SECRET, JWT_SECRET, or HOTEL_ADMIN_JWT_SECRET is missing in .env"
    );
  }

  return jwt.sign(payload, finalSecret, { expiresIn });
}

export function signHotelAdminToken(
  payload,
  expiresIn = process.env.HOTEL_ADMIN_JWT_EXPIRES_IN || "7d",
  secret = getHotelAdminJwtSecret()
) {
  const finalSecret = cleanSecret(secret);

  if (!finalSecret) {
    throw new Error(
      "HOTEL_ADMIN_JWT_SECRET, JWT_SECRET, or HOTEL_JWT_SECRET is missing in .env"
    );
  }

  return jwt.sign(payload, finalSecret, { expiresIn });
}

export function requireHotelUserAuth(req, secret = getHotelUserJwtSecret()) {
  const token = getBearerToken(req);

  if (!token) {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized, missing token.",
    };
  }

  const finalSecret = cleanSecret(secret);

  if (!finalSecret) {
    return {
      ok: false,
      status: 500,
      message:
        "HOTEL_JWT_SECRET, JWT_SECRET, or HOTEL_ADMIN_JWT_SECRET is missing in .env",
    };
  }

  try {
    const decoded = jwt.verify(token, finalSecret);

    const role = String(
      decoded?.role || decoded?.type || decoded?.userRole || ""
    )
      .trim()
      .toLowerCase();

    const isHotelUser =
      decoded?.isHotelUser === true ||
      decoded?.hotelUser === true ||
      role === "hotel_user" ||
      Boolean(decoded?.hotelUserId) ||
      Boolean(decoded?.userId) ||
      Boolean(decoded?.id);

    if (!isHotelUser) {
      return {
        ok: false,
        status: 403,
        message: "Hotel user access required.",
      };
    }

    return {
      ok: true,
      decoded,
    };
  } catch {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized, invalid token.",
    };
  }
}

export function requireHotelAdminAuth(req, secret = getHotelAdminJwtSecret()) {
  const token = getBearerToken(req);

  if (!token) {
    return {
      ok: false,
      status: 401,
      message: "Missing Authorization token.",
    };
  }

  const finalSecret = cleanSecret(secret);

  if (!finalSecret) {
    return {
      ok: false,
      status: 500,
      message:
        "HOTEL_ADMIN_JWT_SECRET, JWT_SECRET, or HOTEL_JWT_SECRET is missing in .env",
    };
  }

  try {
    const decoded = jwt.verify(token, finalSecret);

    const role = String(
      decoded?.role || decoded?.type || decoded?.userRole || ""
    )
      .trim()
      .toLowerCase();

    const isHotelAdmin =
      decoded?.isHotelAdmin === true ||
      decoded?.hotelAdmin === true ||
      decoded?.scope === "hotel" ||
      role === "hotel_admin";

    if (!isHotelAdmin) {
      return {
        ok: false,
        status: 403,
        message: "Forbidden: hotel admin only.",
      };
    }

    return {
      ok: true,
      decoded,
    };
  } catch {
    return {
      ok: false,
      status: 401,
      message: "Invalid or expired hotel admin token.",
    };
  }
}

/*
  Compatibility aliases.
  These help if an older Hotel controller still uses the old generic names.
*/
export const signToken = signHotelUserToken;
export const requireAuth = requireHotelUserAuth;
export const requireHotelAdmin = requireHotelAdminAuth;
export const requireAdmin = requireHotelAdminAuth;

export default {
  isValidObjectId,
  signHotelUserToken,
  signHotelAdminToken,
  requireHotelUserAuth,
  requireHotelAdminAuth,

  signToken,
  requireAuth,
  requireHotelAdmin,
  requireAdmin,
};
import jwt from "jsonwebtoken";
import HotelUser from "../models/hotelUser.js";

function getHotelJwtSecret() {
  return (
    String(process.env.HOTEL_JWT_SECRET || "").trim() ||
    String(process.env.JWT_SECRET || "").trim() ||
    String(process.env.SECRET_KEY || "").trim()
  );
}

function getBearerToken(req) {
  const authHeader = String(req.headers.authorization || "").trim();
  return authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
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

export default async function requireHotelVerifiedUser(req, res, next) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Hotel user token is required.",
      });
    }

    const secret = getHotelJwtSecret();

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "HOTEL_JWT_SECRET, JWT_SECRET, or SECRET_KEY is missing in .env.",
      });
    }

    const decoded = jwt.verify(token, secret);
    const userId = getUserIdFromDecoded(decoded);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid hotel user token.",
      });
    }

    const user = await HotelUser.findById(userId).select(
      "firstName lastName fullName name email phone active idVerificationStatus isIdentityVerified"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Hotel user not found.",
      });
    }

    // Your HotelUser model uses `active`, not `isActive`.
    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated.",
      });
    }

    const isVerified =
      user.isIdentityVerified === true || user.idVerificationStatus === "verified";

    if (!isVerified) {
      return res.status(403).json({
        success: false,
        message: "You must verify your ID before using the hotel chat.",
      });
    }

    req.hotelUser = user;
    req.hotelUserId = user._id;
    req.hotelUserDecoded = decoded;

    return next();
  } catch (error) {
    console.error("requireHotelVerifiedUser error:", error?.message || error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired hotel user token.",
    });
  }
}

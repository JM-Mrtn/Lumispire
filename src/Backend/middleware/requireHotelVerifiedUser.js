import jwt from "jsonwebtoken";
import HotelUser from "../models/hotelUser.js";

const getHotelJwtSecret = () => {
  return (
    process.env.HOTEL_JWT_SECRET ||
    process.env.JWT_SECRET ||
    process.env.SECRET_KEY ||
    "hotel_secret_key"
  );
};

export default async function requireHotelVerifiedUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Hotel user token is required.",
      });
    }

    const decoded = jwt.verify(token, getHotelJwtSecret());

    const userId =
      decoded.id ||
      decoded._id ||
      decoded.userId ||
      decoded.hotelUserId ||
      decoded.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid hotel user token.",
      });
    }

    const user = await HotelUser.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Hotel user not found.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated.",
      });
    }

    const isVerified =
      user.isIdentityVerified === true ||
      user.idVerificationStatus === "verified";

    if (!isVerified) {
      return res.status(403).json({
        success: false,
        message: "You must verify your ID before using the hotel chat.",
      });
    }

    req.hotelUser = user;
    req.hotelUserId = user._id;

    next();
  } catch (error) {
    console.error("requireHotelVerifiedUser error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired hotel user token.",
    });
  }
}
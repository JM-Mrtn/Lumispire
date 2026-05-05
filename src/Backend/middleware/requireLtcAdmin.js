import jwt from "jsonwebtoken";

export function getLtcAdminJwtSecret() {
  return (
    process.env.LTC_ADMIN_JWT_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    process.env.JWT_SECRET ||
    process.env.SECRET_KEY ||
    "ltc_admin_secret_key"
  );
}

export default function requireLtcAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "LTC admin token is required.",
      });
    }

    const decoded = jwt.verify(token, getLtcAdminJwtSecret());

    if (decoded?.role !== "ltc-admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access LTC admin content.",
      });
    }

    req.ltcAdmin = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired LTC admin token.",
    });
  }
}

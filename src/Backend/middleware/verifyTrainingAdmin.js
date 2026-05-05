import jwt from "jsonwebtoken";

function getTrainingAdminJwtSecret() {
  return String(process.env.TRAINING_ADMIN_JWT_SECRET || "").trim();
}

export default function verifyTrainingAdmin(req, res, next) {
  try {
    const authHeader = String(req.headers.authorization || "").trim();
    const [scheme, token] = authHeader.split(" ");

    if (String(scheme || "").toLowerCase() !== "bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Training admin authorization token is required.",
      });
    }

    const secret = getTrainingAdminJwtSecret();
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "TRAINING_ADMIN_JWT_SECRET is not configured.",
      });
    }

    const decoded = jwt.verify(token, secret);

    const role = String(
      decoded?.role || decoded?.userRole || decoded?.type || ""
    ).trim();

    const isTrainingAdmin =
      decoded?.isTrainingAdmin === true ||
      decoded?.scope === "training" ||
      role === "training_admin";

    if (!isTrainingAdmin) {
      return res.status(403).json({
        success: false,
        message: "Training admin access required.",
      });
    }

    req.trainingAdmin = decoded;
    return next();
  } catch (error) {
    console.error("verifyTrainingAdmin error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired training admin token.",
    });
  }
}
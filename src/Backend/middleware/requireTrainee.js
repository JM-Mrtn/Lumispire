import jwt from "jsonwebtoken";

function getTrainingJwtSecret() {
  return process.env.TRAINING_JWT_SECRET || process.env.JWT_SECRET;
}

export function requireTrainee(req, res, next) {
  const auth = req?.headers?.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Missing Authorization token.",
    });
  }

  const token = auth.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Missing token.",
    });
  }

  try {
    const secret = getTrainingJwtSecret();
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Training JWT secret is missing in .env",
      });
    }

    const decoded = jwt.verify(token, secret);
    const role = decoded?.role;
    const id = decoded?.id;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    if (role !== "trainee") {
      return res.status(403).json({
        success: false,
        message: "Trainee access required.",
      });
    }

    req.trainee = { id, role };
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}

export default requireTrainee;
import jwt from "jsonwebtoken";

function getTrainingAdminJwtSecret() {
  return String(process.env.TRAINING_ADMIN_JWT_SECRET || "").trim();
}

export async function trainingAdminLogin(req, res) {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");

    const TRAINING_ADMIN_USER = String(
      process.env.TRAINING_ADMIN_USER || ""
    ).trim();

    const TRAINING_ADMIN_PASS = String(
      process.env.TRAINING_ADMIN_PASS || ""
    ).trim();

    const secret = getTrainingAdminJwtSecret();

    if (!TRAINING_ADMIN_USER || !TRAINING_ADMIN_PASS) {
      return res.status(500).json({
        success: false,
        message:
          "TRAINING_ADMIN_USER or TRAINING_ADMIN_PASS is missing in .env",
      });
    }

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "TRAINING_ADMIN_JWT_SECRET is missing in .env",
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const validUser = username === TRAINING_ADMIN_USER;
    const validPass = password === TRAINING_ADMIN_PASS;

    if (!validUser || !validPass) {
      return res.status(401).json({
        success: false,
        message: "Invalid training admin credentials.",
      });
    }

    const trainingAdminToken = jwt.sign(
      {
        id: "training-admin",
        username: TRAINING_ADMIN_USER,
        role: "training_admin",
        scope: "training",
        isTrainingAdmin: true,
      },
      secret,
      {
        expiresIn: process.env.TRAINING_ADMIN_JWT_EXPIRES_IN || "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Training admin login successful.",
      trainingAdminToken,
      token: trainingAdminToken,
    });
  } catch (error) {
    console.error("trainingAdminLogin error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during training admin login.",
    });
  }
}

export default trainingAdminLogin;
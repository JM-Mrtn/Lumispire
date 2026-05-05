import jwt from "jsonwebtoken";
import ProfessorUser from "../models/ProfessorUser.js";

function getProfessorJwtSecret() {
  return String(
    process.env.PROFESSOR_JWT_SECRET || process.env.JWT_SECRET || ""
  ).trim();
}

export default async function requireProfessor(req, res, next) {
  try {
    const authHeader = String(req.headers.authorization || "").trim();
    const [scheme, token] = authHeader.split(" ");

    if (String(scheme || "").toLowerCase() !== "bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Professor authorization token is required.",
      });
    }

    const secret = getProfessorJwtSecret();
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "PROFESSOR_JWT_SECRET or JWT_SECRET is missing in .env",
      });
    }

    const decoded = jwt.verify(token, secret);
    const professorId = decoded?.id || decoded?._id || "";

    if (!professorId) {
      return res.status(401).json({
        success: false,
        message: "Invalid professor token.",
      });
    }

    const professor = await ProfessorUser.findById(professorId).select(
      "firstName lastName username email active courseAssignments"
    );

    if (!professor) {
      return res.status(401).json({
        success: false,
        message: "Professor account not found.",
      });
    }

    if (professor.active === false) {
      return res.status(403).json({
        success: false,
        message: "Professor account is inactive.",
      });
    }

    req.professor = {
      id: String(professor._id),
      email: professor.email || "",
      username: professor.username || "",
      firstName: professor.firstName || "",
      lastName: professor.lastName || "",
      name:
        `${professor.firstName || ""} ${professor.lastName || ""}`.trim() ||
        professor.username ||
        professor.email ||
        "Professor",
      role: "professor",
      courseAssignments: Array.isArray(professor.courseAssignments)
        ? professor.courseAssignments
        : [],
    };

    return next();
  } catch (error) {
    console.error("requireProfessor error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired professor token.",
    });
  }
}
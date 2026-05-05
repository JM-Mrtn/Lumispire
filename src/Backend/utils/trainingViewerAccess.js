import jwt from "jsonwebtoken";
import ProfessorUser from "../models/ProfessorUser.js";
import TraineeUser from "../models/TraineeUser.js";

function getTokenFromRequest(req) {
  const authHeader = String(req.headers.authorization || "").trim();
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return String(
    req.query?.token ||
      req.query?.authToken ||
      req.query?.access_token ||
      ""
  ).trim();
}

function getTrainingAdminSecret() {
  return String(process.env.TRAINING_ADMIN_JWT_SECRET || "").trim();
}

function getProfessorSecret() {
  return String(process.env.PROFESSOR_JWT_SECRET || process.env.JWT_SECRET || "").trim();
}

function getTraineeSecret() {
  return String(process.env.TRAINING_JWT_SECRET || process.env.JWT_SECRET || "").trim();
}

function safeVerify(token, secret) {
  try {
    if (!token || !secret) return null;
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

export function isTrainingProtectedFolder(folder = "") {
  const value = String(folder || "").trim().toLowerCase();

  if (!value) return false;

  return (
    value.startsWith("training") ||
    value === "attendance-proofs" ||
    value === "trainee-assignment-submissions"
  );
}

export async function resolveTrainingViewer(req) {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const trainingAdminDecoded = safeVerify(token, getTrainingAdminSecret());
  if (trainingAdminDecoded) {
    const role = String(
      trainingAdminDecoded?.role ||
        trainingAdminDecoded?.userRole ||
        trainingAdminDecoded?.type ||
        ""
    ).trim();

    const isTrainingAdmin =
      trainingAdminDecoded?.isTrainingAdmin === true ||
      trainingAdminDecoded?.scope === "training" ||
      role === "training_admin";

    if (isTrainingAdmin) {
      return { type: "training_admin", id: trainingAdminDecoded?.id || "" };
    }
  }

  const professorDecoded = safeVerify(token, getProfessorSecret());
  if (professorDecoded?.id) {
    const professor = await ProfessorUser.findById(professorDecoded.id)
      .select("_id active")
      .lean();

    if (professor && professor.active !== false) {
      return { type: "professor", id: String(professor._id) };
    }
  }

  const traineeDecoded = safeVerify(token, getTraineeSecret());
  if (traineeDecoded?.id && traineeDecoded?.role === "trainee") {
    const trainee = await TraineeUser.findById(traineeDecoded.id)
      .select("_id active")
      .lean();

    if (trainee && trainee.active !== false) {
      return { type: "trainee", id: String(trainee._id) };
    }
  }

  return null;
}
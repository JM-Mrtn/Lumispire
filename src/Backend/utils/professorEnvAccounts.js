import bcrypt from "bcrypt";
import ProfessorUser from "../models/ProfessorUser.js";

function clean(value = "") {
  return String(value || "").trim();
}

function lower(value = "") {
  return clean(value).toLowerCase();
}

function normalizeCourseName(value = "") {
  const v = clean(value).toLowerCase();

  if (v === "event management" || v === "events management") {
    return "Event Management";
  }

  if (v === "housekeeping") {
    return "Housekeeping";
  }

  return clean(value);
}

function buildProfessorConfig(prefix, defaults) {
  const firstNameRaw = clean(process.env[`${prefix}_FIRST_NAME`]);
  const lastNameRaw = clean(process.env[`${prefix}_LAST_NAME`]);
  const username = lower(process.env[`${prefix}_USERNAME`]);
  const email = lower(process.env[`${prefix}_EMAIL`]);
  const password = clean(process.env[`${prefix}_PASSWORD`]);

  const hasAny =
    Boolean(firstNameRaw) ||
    Boolean(lastNameRaw) ||
    Boolean(username) ||
    Boolean(email) ||
    Boolean(password);

  if (!hasAny) return null;

  if (!username || !email || !password) {
    throw new Error(
      `${prefix}_USERNAME, ${prefix}_EMAIL, and ${prefix}_PASSWORD are required.`
    );
  }

  if (password.length < 6) {
    throw new Error(`${prefix}_PASSWORD must be at least 6 characters.`);
  }

  return {
    envAccountKey: defaults.envAccountKey,
    firstName: firstNameRaw || defaults.firstName,
    lastName: lastNameRaw || defaults.lastName,
    username,
    email,
    password,
    courseAssignments: defaults.courseAssignments
      .map(normalizeCourseName)
      .filter(Boolean),
  };
}

export function getFixedProfessorConfigsFromEnv() {
  return [
    buildProfessorConfig("PROFESSOR_EVENT", {
      envAccountKey: "PROFESSOR_EVENT",
      firstName: "Event Management",
      lastName: "Professor",
      courseAssignments: ["Event Management"],
    }),
    buildProfessorConfig("PROFESSOR_HOUSEKEEPING", {
      envAccountKey: "PROFESSOR_HOUSEKEEPING",
      firstName: "Housekeeping",
      lastName: "Professor",
      courseAssignments: ["Housekeeping"],
    }),
  ].filter(Boolean);
}

async function ensureNoConflictingProfessorIdentity(config) {
  const duplicate = await ProfessorUser.findOne({
    envAccountKey: { $ne: config.envAccountKey },
    $or: [{ username: config.username }, { email: config.email }],
  }).lean();

  if (duplicate) {
    throw new Error(
      `Duplicate professor username/email conflict for ${config.envAccountKey}.`
    );
  }
}

export async function syncFixedProfessorAccountsFromEnv() {
  const configs = getFixedProfessorConfigsFromEnv();

  if (!configs.length) {
    console.log("[training] No fixed professor .env accounts configured.");
    return [];
  }

  const synced = [];

  for (const config of configs) {
    await ensureNoConflictingProfessorIdentity(config);

    const hashedPassword = await bcrypt.hash(config.password, 10);

    const professor = await ProfessorUser.findOneAndUpdate(
      { envAccountKey: config.envAccountKey },
      {
        $set: {
          firstName: config.firstName,
          lastName: config.lastName,
          username: config.username,
          email: config.email,
          password: hashedPassword,
          role: "professor",
          active: true,
          mustChangePassword: false,
          courseAssignments: config.courseAssignments,
          accountSource: "env_fixed",
          envAccountKey: config.envAccountKey,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    synced.push({
      _id: professor._id,
      envAccountKey: professor.envAccountKey,
      username: professor.username,
      email: professor.email,
      courseAssignments: professor.courseAssignments || [],
    });
  }

  console.log(
    `[training] Synced ${synced.length} fixed professor account(s) from .env without deleting existing professor records.`
  );

  return synced;
}

export default {
  getFixedProfessorConfigsFromEnv,
  syncFixedProfessorAccountsFromEnv,
};

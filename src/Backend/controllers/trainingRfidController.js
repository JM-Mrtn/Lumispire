import mongoose from "mongoose";
import TraineeUser from "../models/TraineeUser.js";
import TraineeRfidLog from "../models/TraineeRfidLog.js";
import TrainingRfidSession from "../models/TrainingRfidSession.js";

const RFID_TIMEOUT_COOLDOWN_MINUTES = 10;
const HOUSEKEEPING_COURSE = "Housekeeping";
const DEFAULT_STATION = "Housekeeping RFID Station";

function getFullName(user) {
  return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
}

function normalizeCourseName(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (clean === "housekeeping") return "Housekeeping";
  if (clean === "event management") return "Event Management";
  return String(value || "").trim();
}

function getProfessorAllowedCourses(req) {
  const raw = Array.isArray(req?.professor?.courseAssignments)
    ? req.professor.courseAssignments
    : [];

  return [
    ...new Set(raw.map((item) => normalizeCourseName(item)).filter(Boolean)),
  ];
}

function isProfessorAllowedForCourse(req, course = "") {
  return getProfessorAllowedCourses(req).includes(normalizeCourseName(course));
}

function getManilaDateOnly(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((item) => item.type === "year")?.value || "0000";
  const month = parts.find((item) => item.type === "month")?.value || "00";
  const day = parts.find((item) => item.type === "day")?.value || "00";

  return `${year}-${month}-${day}`;
}

function formatManilaDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getCooldownRemainingParts(cooldownUntil) {
  const diffMs = new Date(cooldownUntil).getTime() - Date.now();
  const safe = Math.max(0, diffMs);

  const totalSeconds = Math.ceil(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    totalSeconds,
    minutes,
    seconds,
  };
}

function buildCooldownMessage(cooldownUntil) {
  const { minutes, seconds } = getCooldownRemainingParts(cooldownUntil);
  if (minutes <= 0) {
    return `Please wait ${seconds} second(s) before timing out again.`;
  }
  return `Please wait ${minutes} minute(s) and ${seconds} second(s) before timing out again.`;
}

function mapSession(session) {
  if (!session) return null;

  return {
    _id: session._id,
    id: String(session._id),
    course: session.course || "",
    attendanceDate: session.attendanceDate || "",
    station: session.station || DEFAULT_STATION,
    isOpen: session.isOpen === true,
    openedAt: session.openedAt || null,
    closedAt: session.closedAt || null,
    openedByProfessorName: session.openedByProfessorName || "",
    openedByProfessorEmail: session.openedByProfessorEmail || "",
    closedByProfessorName: session.closedByProfessorName || "",
    closedByProfessorEmail: session.closedByProfessorEmail || "",
  };
}

function getLogMessage(log) {
  const status = String(log?.status || "").toLowerCase();

  if (status === "success") {
    return `${log?.traineeName || "Trainee"} ${
      log?.action === "time_out" ? "timed out" : "timed in"
    } successfully.`;
  }

  if (status === "unknown_card") return "Card not recognized.";
  if (status === "inactive_trainee") return "This trainee account is inactive.";
  if (status === "no_open_session") return "RFID attendance is not open right now.";
  if (status === "cooldown_active") {
    return log?.cooldownUntil
      ? buildCooldownMessage(log.cooldownUntil)
      : "Please wait before timing out again.";
  }

  return "RFID scan processed.";
}

function mapLog(log) {
  return {
    _id: log._id,
    id: String(log._id),
    traineeId: log?.traineeId ? String(log.traineeId) : "",
    sessionId: log?.sessionId ? String(log.sessionId) : "",
    uid: log?.uid || "",
    traineeName: log?.traineeName || "",
    course: log?.course || "",
    attendanceDate: log?.attendanceDate || "",
    action: log?.action || "time_in",
    status: log?.status || "success",
    station: log?.station || DEFAULT_STATION,
    cooldownUntil: log?.cooldownUntil || null,
    createdAt: log?.createdAt || null,
    updatedAt: log?.updatedAt || null,
    message: getLogMessage(log),
    createdAtLabel: formatManilaDateTime(log?.createdAt),
  };
}

async function closeOtherOpenSessions(course, excludeId, closer = {}) {
  const filter = {
    course,
    isOpen: true,
  };

  if (excludeId && mongoose.Types.ObjectId.isValid(String(excludeId))) {
    filter._id = { $ne: excludeId };
  }

  await TrainingRfidSession.updateMany(filter, {
    $set: {
      isOpen: false,
      closedAt: new Date(),
      closedByProfessorId: closer.id || null,
      closedByProfessorName: closer.name || "",
      closedByProfessorEmail: closer.email || "",
    },
  });
}

export const getRfidTrainees = async (req, res) => {
  try {
    const trainees = await TraineeUser.find({})
      .select("_id firstName lastName email active rfidUid trainingStatus course")
      .sort({ firstName: 1, lastName: 1 });

    const formatted = trainees.map((trainee) => ({
      _id: trainee._id,
      fullName: getFullName(trainee),
      email: trainee.email || "",
      active: trainee.active !== false,
      rfidUid: trainee.rfidUid || "",
      trainingStatus: trainee.trainingStatus || "",
      course: trainee.course || "",
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("getRfidTrainees error:", error);
    return res.status(500).json({
      message: "Failed to fetch trainees for RFID registration.",
    });
  }
};

export const registerTraineeRfid = async (req, res) => {
  try {
    const { traineeId, uid } = req.body;

    if (!traineeId || !uid) {
      return res.status(400).json({
        message: "traineeId and uid are required.",
      });
    }

    const normalizedUid = String(uid).trim().toUpperCase();

    if (!normalizedUid) {
      return res.status(400).json({
        message: "RFID UID is required.",
      });
    }

    const existingUid = await TraineeUser.findOne({ rfidUid: normalizedUid });
    if (existingUid && String(existingUid._id) !== String(traineeId)) {
      return res.status(409).json({
        message: "This RFID card is already assigned to another trainee.",
      });
    }

    const trainee = await TraineeUser.findById(traineeId);
    if (!trainee) {
      return res.status(404).json({
        message: "Trainee not found.",
      });
    }

    trainee.rfidUid = normalizedUid;
    await trainee.save();

    return res.json({
      message: "RFID card registered successfully.",
      trainee: {
        _id: trainee._id,
        fullName: getFullName(trainee),
        email: trainee.email || "",
        rfidUid: trainee.rfidUid,
      },
    });
  } catch (error) {
    console.error("registerTraineeRfid error:", error);
    return res.status(500).json({
      message: "Failed to register trainee RFID card.",
    });
  }
};

export const removeTraineeRfid = async (req, res) => {
  try {
    const { traineeId } = req.params;

    const trainee = await TraineeUser.findById(traineeId);
    if (!trainee) {
      return res.status(404).json({
        message: "Trainee not found.",
      });
    }

    trainee.rfidUid = "";
    await trainee.save();

    return res.json({
      message: "RFID card removed successfully.",
      trainee: {
        _id: trainee._id,
        fullName: getFullName(trainee),
        email: trainee.email || "",
        rfidUid: "",
      },
    });
  } catch (error) {
    console.error("removeTraineeRfid error:", error);
    return res.status(500).json({
      message: "Failed to remove trainee RFID card.",
    });
  }
};

export const openProfessorRfidAttendance = async (req, res) => {
  try {
    const requestedCourse = normalizeCourseName(
      req.body?.course || req.query?.course || HOUSEKEEPING_COURSE
    );

    if (requestedCourse !== HOUSEKEEPING_COURSE) {
      return res.status(400).json({
        success: false,
        message: "RFID attendance is available for Housekeeping only.",
      });
    }

    if (!isProfessorAllowedForCourse(req, HOUSEKEEPING_COURSE)) {
      return res.status(403).json({
        success: false,
        message: "Only the Housekeeping professor can open RFID attendance.",
      });
    }

    const attendanceDate = String(
      req.body?.attendanceDate || req.query?.attendanceDate || getManilaDateOnly()
    ).trim();

    const station = String(req.body?.station || DEFAULT_STATION).trim() || DEFAULT_STATION;

    const existingOpen = await TrainingRfidSession.findOne({
      course: HOUSEKEEPING_COURSE,
      isOpen: true,
    }).sort({ openedAt: -1 });

    if (existingOpen && String(existingOpen.attendanceDate) === attendanceDate) {
      return res.status(200).json({
        success: true,
        message: "RFID attendance is already open.",
        session: mapSession(existingOpen),
      });
    }

    if (existingOpen) {
      existingOpen.isOpen = false;
      existingOpen.closedAt = new Date();
      existingOpen.closedByProfessorId = req.professor?.id || null;
      existingOpen.closedByProfessorName = req.professor?.name || "";
      existingOpen.closedByProfessorEmail = req.professor?.email || "";
      await existingOpen.save();
    }

    await closeOtherOpenSessions(HOUSEKEEPING_COURSE, null, {
      id: req.professor?.id || null,
      name: req.professor?.name || "",
      email: req.professor?.email || "",
    });

    const session = await TrainingRfidSession.create({
      course: HOUSEKEEPING_COURSE,
      attendanceDate,
      station,
      isOpen: true,
      openedAt: new Date(),
      openedByProfessorId: req.professor?.id || null,
      openedByProfessorName: req.professor?.name || "",
      openedByProfessorEmail: req.professor?.email || "",
    });

    return res.status(201).json({
      success: true,
      message: "Housekeeping RFID attendance opened successfully.",
      session: mapSession(session),
    });
  } catch (error) {
    console.error("openProfessorRfidAttendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to open RFID attendance.",
    });
  }
};

export const closeProfessorRfidAttendance = async (req, res) => {
  try {
    if (!isProfessorAllowedForCourse(req, HOUSEKEEPING_COURSE)) {
      return res.status(403).json({
        success: false,
        message: "Only the Housekeeping professor can close RFID attendance.",
      });
    }

    const sessionId = String(req.body?.sessionId || req.query?.sessionId || "").trim();

    let session = null;

    if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
      session = await TrainingRfidSession.findById(sessionId);
    }

    if (!session) {
      session = await TrainingRfidSession.findOne({
        course: HOUSEKEEPING_COURSE,
        isOpen: true,
      }).sort({ openedAt: -1 });
    }

    if (!session || session.isOpen !== true) {
      return res.status(404).json({
        success: false,
        message: "No open RFID attendance session found.",
      });
    }

    session.isOpen = false;
    session.closedAt = new Date();
    session.closedByProfessorId = req.professor?.id || null;
    session.closedByProfessorName = req.professor?.name || "";
    session.closedByProfessorEmail = req.professor?.email || "";
    await session.save();

    return res.status(200).json({
      success: true,
      message: "Housekeeping RFID attendance closed successfully.",
      session: mapSession(session),
    });
  } catch (error) {
    console.error("closeProfessorRfidAttendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to close RFID attendance.",
    });
  }
};

export const getProfessorRfidAttendanceStatus = async (req, res) => {
  try {
    if (!isProfessorAllowedForCourse(req, HOUSEKEEPING_COURSE)) {
      return res.status(403).json({
        success: false,
        message: "Only the Housekeeping professor can view RFID attendance.",
      });
    }

    const attendanceDate = String(
      req.query?.attendanceDate || getManilaDateOnly()
    ).trim();

    const requestedSessionId = String(req.query?.sessionId || "").trim();

    const sessions = await TrainingRfidSession.find({
      course: HOUSEKEEPING_COURSE,
      attendanceDate,
    })
      .sort({ openedAt: -1 })
      .lean();

    let selectedSession =
      sessions.find((item) => String(item._id) === requestedSessionId) ||
      sessions.find((item) => item.isOpen === true) ||
      sessions[0] ||
      null;

    const logs = selectedSession
      ? await TraineeRfidLog.find({
          sessionId: selectedSession._id,
        })
          .sort({ createdAt: -1 })
          .limit(200)
          .lean()
      : [];

    return res.status(200).json({
      success: true,
      cooldownMinutes: RFID_TIMEOUT_COOLDOWN_MINUTES,
      session: mapSession(selectedSession),
      sessions: sessions.map(mapSession),
      logs: logs.map(mapLog),
    });
  } catch (error) {
    console.error("getProfessorRfidAttendanceStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load RFID attendance status.",
    });
  }
};

export const scanTraineeRfid = async (req, res) => {
  try {
    const { uid, station = DEFAULT_STATION } = req.body;

    if (!uid) {
      return res.status(400).json({
        message: "UID is required.",
      });
    }

    const normalizedUid = String(uid).trim().toUpperCase();
    const scanDate = getManilaDateOnly();

    const trainee = await TraineeUser.findOne({ rfidUid: normalizedUid });

    if (!trainee) {
      const unknownLog = await TraineeRfidLog.create({
        uid: normalizedUid,
        action: "time_in",
        status: "unknown_card",
        station,
        attendanceDate: scanDate,
      });

      return res.status(404).json({
        ok: false,
        message: "Card not recognized.",
        log: mapLog(unknownLog),
      });
    }

    const traineeCourse = normalizeCourseName(trainee.course || "");

    if (trainee.active === false) {
      const inactiveLog = await TraineeRfidLog.create({
        traineeId: trainee._id,
        uid: normalizedUid,
        traineeName: getFullName(trainee),
        course: traineeCourse,
        attendanceDate: scanDate,
        action: "time_in",
        status: "inactive_trainee",
        station,
      });

      return res.status(403).json({
        ok: false,
        message: "This trainee account is inactive.",
        log: mapLog(inactiveLog),
      });
    }

    if (traineeCourse !== HOUSEKEEPING_COURSE) {
      return res.status(403).json({
        ok: false,
        message: "RFID attendance is enabled for Housekeeping trainees only.",
      });
    }

    const activeSession = await TrainingRfidSession.findOne({
      course: HOUSEKEEPING_COURSE,
      isOpen: true,
    }).sort({ openedAt: -1 });

    if (!activeSession) {
      const noSessionLog = await TraineeRfidLog.create({
        traineeId: trainee._id,
        uid: normalizedUid,
        traineeName: getFullName(trainee),
        course: traineeCourse,
        attendanceDate: scanDate,
        action: "time_in",
        status: "no_open_session",
        station,
      });

      return res.status(403).json({
        ok: false,
        message: "RFID attendance is not open right now.",
        log: mapLog(noSessionLog),
      });
    }

    const effectiveAttendanceDate =
      String(activeSession.attendanceDate || scanDate).trim() || scanDate;

    const successLogsInSession = await TraineeRfidLog.find({
      traineeId: trainee._id,
      sessionId: activeSession._id,
      status: "success",
    })
      .sort({ createdAt: 1 })
      .lean();

    const successfulTimeIn = successLogsInSession.find(
      (item) => String(item?.action || "").toLowerCase() === "time_in"
    );

    const successfulTimeOut = successLogsInSession.find(
      (item) => String(item?.action || "").toLowerCase() === "time_out"
    );

    if (successfulTimeIn && successfulTimeOut) {
      return res.status(409).json({
        ok: false,
        message: `${getFullName(
          trainee
        )} already completed RFID attendance for this open session.`,
        trainee: {
          _id: trainee._id,
          fullName: getFullName(trainee),
          email: trainee.email,
          course: trainee.course || "",
        },
        session: mapSession(activeSession),
      });
    }

    const nextAction = successfulTimeIn ? "time_out" : "time_in";

    if (nextAction === "time_out" && successfulTimeIn?.createdAt) {
      const cooldownUntil = new Date(
        new Date(successfulTimeIn.createdAt).getTime() +
          RFID_TIMEOUT_COOLDOWN_MINUTES * 60 * 1000
      );

      if (Date.now() < cooldownUntil.getTime()) {
        return res.status(429).json({
          ok: false,
          message: buildCooldownMessage(cooldownUntil),
          cooldownUntil,
          trainee: {
            _id: trainee._id,
            fullName: getFullName(trainee),
            email: trainee.email,
            course: trainee.course || "",
          },
          session: mapSession(activeSession),
        });
      }
    }

    const successLog = await TraineeRfidLog.create({
      traineeId: trainee._id,
      sessionId: activeSession._id,
      uid: normalizedUid,
      traineeName: getFullName(trainee),
      course: traineeCourse,
      attendanceDate: effectiveAttendanceDate,
      action: nextAction,
      status: "success",
      station: activeSession.station || station,
    });

    return res.status(200).json({
      ok: true,
      message: `${getFullName(trainee)} ${
        nextAction === "time_in" ? "timed in" : "timed out"
      } successfully.`,
      trainee: {
        _id: trainee._id,
        fullName: getFullName(trainee),
        email: trainee.email,
        course: trainee.course || "",
      },
      session: mapSession(activeSession),
      log: mapLog(successLog),
    });
  } catch (error) {
    console.error("scanTraineeRfid error:", error);
    return res.status(500).json({
      message: "Failed to process trainee RFID scan.",
    });
  }
};

export const getTraineeRfidLogs = async (req, res) => {
  try {
    const { traineeId, date, sessionId, course } = req.query;

    const filter = {};

    if (traineeId) {
      filter.traineeId = traineeId;
    }

    if (sessionId && mongoose.Types.ObjectId.isValid(String(sessionId))) {
      filter.sessionId = sessionId;
    }

    if (course) {
      filter.course = normalizeCourseName(course);
    }

    if (date) {
      filter.attendanceDate = String(date).trim();
    }

    const logs = await TraineeRfidLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.json(logs.map(mapLog));
  } catch (error) {
    console.error("getTraineeRfidLogs error:", error);
    return res.status(500).json({
      message: "Failed to fetch trainee RFID logs.",
    });
  }
};
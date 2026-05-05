import mongoose from "mongoose";
import TraineeUser from "../models/TraineeUser.js";
import TraineeRfidLog from "../models/TraineeRfidLog.js";
import TrainingRfidSession from "../models/TrainingRfidSession.js";

const RFID_TIMEOUT_COOLDOWN_MINUTES = 10;
const DEFAULT_STATION = "Training RFID Station";

function getFullName(user) {
  return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
}

function toTitleCase(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeCourseName(value = "") {
  const raw = String(value || "").trim();
  const clean = raw.toLowerCase();

  if (clean === "housekeeping") return "Housekeeping";
  if (clean === "event management" || clean === "events management") {
    return "Event Management";
  }
  if (clean === "cookery") return "Cookery";

  return raw || toTitleCase(value);
}

function normalizeUid(value = "") {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function getProfessorAllowedCourses(req) {
  const raw = Array.isArray(req?.professor?.courseAssignments)
    ? req.professor.courseAssignments
    : [];

  return [...new Set(raw.map((item) => normalizeCourseName(item)).filter(Boolean))];
}

function isProfessorAllowedForCourse(req, course = "") {
  const normalized = normalizeCourseName(course);
  return getProfessorAllowedCourses(req).includes(normalized);
}

function resolveProfessorCourse(req, requestedCourse = "") {
  const allowedCourses = getProfessorAllowedCourses(req);
  const normalizedRequested = normalizeCourseName(requestedCourse);

  if (!allowedCourses.length) {
    return {
      ok: false,
      status: 403,
      message: "Professor has no assigned course.",
      course: "",
      allowedCourses,
    };
  }

  if (normalizedRequested) {
    if (!allowedCourses.includes(normalizedRequested)) {
      return {
        ok: false,
        status: 403,
        message: "You are not allowed to manage RFID attendance for this course.",
        course: "",
        allowedCourses,
      };
    }

    return {
      ok: true,
      status: 200,
      message: "",
      course: normalizedRequested,
      allowedCourses,
    };
  }

  return {
    ok: true,
    status: 200,
    message: "",
    course: allowedCourses[0],
    allowedCourses,
  };
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

function csvEscape(value = "") {
  const safe = String(value ?? "");
  return `"${safe.replace(/"/g, '""')}"`;
}

function getCooldownRemainingParts(cooldownUntil) {
  const diffMs = new Date(cooldownUntil).getTime() - Date.now();
  const safe = Math.max(0, diffMs);

  const totalSeconds = Math.ceil(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { totalSeconds, minutes, seconds };
}

function buildCooldownMessage(cooldownUntil) {
  const { minutes, seconds } = getCooldownRemainingParts(cooldownUntil);

  if (minutes <= 0) {
    return `Please wait ${seconds} second(s) before timing out again.`;
  }

  return `Please wait ${minutes} minute(s) and ${seconds} second(s) before timing out again.`;
}

function mapSession(session, extra = {}) {
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
    scanCount: Number(extra.scanCount || 0),
    timeInCount: Number(extra.timeInCount || 0),
    timeOutCount: Number(extra.timeOutCount || 0),
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

function mapLog(log, traineeMap = new Map()) {
  const traineeId = log?.traineeId ? String(log.traineeId) : "";
  const trainee = traineeMap.get(traineeId);

  return {
    _id: log._id,
    id: String(log._id),
    traineeId,
    sessionId: log?.sessionId ? String(log.sessionId) : "",
    uid: log?.uid || "",
    traineeName: log?.traineeName || trainee?.fullName || "",
    traineeEmail: trainee?.email || "",
    course: log?.course || trainee?.course || "",
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

async function buildTraineeMapForLogs(logs = []) {
  const traineeIds = [
    ...new Set(
      logs
        .map((log) => (log?.traineeId ? String(log.traineeId) : ""))
        .filter(Boolean)
    ),
  ];

  if (!traineeIds.length) return new Map();

  const trainees = await TraineeUser.find({ _id: { $in: traineeIds } })
    .select("_id firstName lastName email course")
    .lean();

  return new Map(
    trainees.map((trainee) => [
      String(trainee._id),
      {
        fullName: getFullName(trainee),
        email: trainee.email || "",
        course: trainee.course || "",
      },
    ])
  );
}

async function getSessionLogSummary(sessionIds = []) {
  const ids = sessionIds
    .filter(Boolean)
    .map((id) => new mongoose.Types.ObjectId(String(id)));

  if (!ids.length) return new Map();

  const rows = await TraineeRfidLog.aggregate([
    {
      $match: {
        sessionId: { $in: ids },
        status: "success",
      },
    },
    {
      $group: {
        _id: "$sessionId",
        scanCount: { $sum: 1 },
        timeInCount: {
          $sum: {
            $cond: [{ $eq: ["$action", "time_in"] }, 1, 0],
          },
        },
        timeOutCount: {
          $sum: {
            $cond: [{ $eq: ["$action", "time_out"] }, 1, 0],
          },
        },
      },
    },
  ]);

  return new Map(rows.map((row) => [String(row._id), row]));
}

async function closeOtherOpenSessions(course, excludeId, closer = {}) {
  const normalizedCourse = normalizeCourseName(course);

  const filter = {
    course: normalizedCourse,
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

async function findTraineeByNormalizedUid(normalizedUid = "") {
  const cleanUid = normalizeUid(normalizedUid);
  if (!cleanUid) return null;

  return TraineeUser.findOne({
    $or: [
      { rfidUid: cleanUid },
      { rfidUid: String(normalizedUid || "").trim().toUpperCase() },
    ],
  });
}

export const getRfidTrainees = async (_req, res) => {
  try {
    const trainees = await TraineeUser.find({})
      .select(
        "_id firstName lastName email active rfidUid trainingStatus course batchCode batchName"
      )
      .sort({ course: 1, firstName: 1, lastName: 1 });

    const formatted = trainees.map((trainee) => ({
      _id: trainee._id,
      fullName: getFullName(trainee),
      email: trainee.email || "",
      active: trainee.active !== false,
      rfidUid: trainee.rfidUid || "",
      trainingStatus: trainee.trainingStatus || "",
      course: trainee.course || "",
      batchCode: trainee.batchCode || "",
      batchName: trainee.batchName || "",
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
    const { traineeId, uid } = req.body || {};
    const normalizedUid = normalizeUid(uid);

    if (!traineeId || !normalizedUid) {
      return res.status(400).json({
        message: "traineeId and valid uid are required.",
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
        course: trainee.course || "",
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
        course: trainee.course || "",
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
    const courseContext = resolveProfessorCourse(
      req,
      req.body?.course || req.query?.course || ""
    );

    if (!courseContext.ok) {
      return res.status(courseContext.status).json({
        success: false,
        message: courseContext.message,
        allowedCourses: courseContext.allowedCourses,
      });
    }

    const course = courseContext.course;
    const attendanceDate = String(
      req.body?.attendanceDate ||
        req.query?.attendanceDate ||
        getManilaDateOnly()
    ).trim();

    const station =
      String(req.body?.station || req.query?.station || "").trim() ||
      `${course} RFID Station`;

    const existingOpen = await TrainingRfidSession.findOne({
      course,
      isOpen: true,
    }).sort({ openedAt: -1 });

    if (existingOpen && String(existingOpen.attendanceDate) === attendanceDate) {
      const summaryMap = await getSessionLogSummary([existingOpen._id]);

      return res.status(200).json({
        success: true,
        message: `${course} RFID attendance is already open.`,
        allowedCourses: courseContext.allowedCourses,
        session: mapSession(
          existingOpen,
          summaryMap.get(String(existingOpen._id)) || {}
        ),
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

    await closeOtherOpenSessions(course, null, {
      id: req.professor?.id || null,
      name: req.professor?.name || "",
      email: req.professor?.email || "",
    });

    const session = await TrainingRfidSession.create({
      course,
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
      message: `${course} RFID attendance opened successfully.`,
      allowedCourses: courseContext.allowedCourses,
      session: mapSession(session),
    });
  } catch (error) {
    console.error("openProfessorRfidAttendance error:", error);

    if (Number(error?.code || 0) === 11000) {
      return res.status(409).json({
        success: false,
        message: "RFID attendance is already open for this course.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to open RFID attendance.",
    });
  }
};

export const closeProfessorRfidAttendance = async (req, res) => {
  try {
    const sessionId = String(req.body?.sessionId || req.query?.sessionId || "").trim();
    let session = null;

    if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
      session = await TrainingRfidSession.findById(sessionId);
      if (session && !isProfessorAllowedForCourse(req, session.course)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to close RFID attendance for this course.",
        });
      }
    }

    if (!session) {
      const courseContext = resolveProfessorCourse(
        req,
        req.body?.course || req.query?.course || ""
      );

      if (!courseContext.ok) {
        return res.status(courseContext.status).json({
          success: false,
          message: courseContext.message,
          allowedCourses: courseContext.allowedCourses,
        });
      }

      session = await TrainingRfidSession.findOne({
        course: courseContext.course,
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

    const summaryMap = await getSessionLogSummary([session._id]);

    return res.status(200).json({
      success: true,
      message: `${session.course} RFID attendance closed successfully.`,
      session: mapSession(session, summaryMap.get(String(session._id)) || {}),
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
    const allowedCourses = getProfessorAllowedCourses(req);

    if (!allowedCourses.length) {
      return res.status(403).json({
        success: false,
        message: "Professor has no assigned course.",
        allowedCourses: [],
      });
    }

    const requestedCourse = normalizeCourseName(req.query?.course || "");
    const attendanceDate = String(
      req.query?.attendanceDate || getManilaDateOnly()
    ).trim();

    if (requestedCourse && !allowedCourses.includes(requestedCourse)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view RFID attendance for this course.",
        allowedCourses,
      });
    }

    const query = {
      course: requestedCourse || { $in: allowedCourses },
      attendanceDate,
    };

    const requestedSessionId = String(req.query?.sessionId || "").trim();

    const sessions = await TrainingRfidSession.find(query)
      .sort({ openedAt: -1, createdAt: -1 })
      .lean();

    const summaryMap = await getSessionLogSummary(
      sessions.map((session) => session._id)
    );

    const selectedSession =
      sessions.find((item) => String(item._id) === requestedSessionId) ||
      sessions.find((item) => item.isOpen === true) ||
      sessions[0] ||
      null;

    const rawLogs = selectedSession
      ? await TraineeRfidLog.find({ sessionId: selectedSession._id })
          .sort({ createdAt: -1 })
          .limit(500)
          .lean()
      : [];

    const traineeMap = await buildTraineeMapForLogs(rawLogs);

    return res.status(200).json({
      success: true,
      allowedCourses,
      cooldownMinutes: RFID_TIMEOUT_COOLDOWN_MINUTES,
      session: selectedSession
        ? mapSession(
            selectedSession,
            summaryMap.get(String(selectedSession._id)) || {}
          )
        : null,
      sessions: sessions.map((session) =>
        mapSession(session, summaryMap.get(String(session._id)) || {})
      ),
      logs: rawLogs.map((log) => mapLog(log, traineeMap)),
    });
  } catch (error) {
    console.error("getProfessorRfidAttendanceStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load RFID attendance status.",
    });
  }
};

export const exportProfessorRfidAttendance = async (req, res) => {
  try {
    const allowedCourses = getProfessorAllowedCourses(req);

    if (!allowedCourses.length) {
      return res.status(403).json({
        success: false,
        message: "Professor has no assigned course.",
      });
    }

    const sessionId = String(req.query?.sessionId || "").trim();
    const requestedCourse = normalizeCourseName(req.query?.course || "");
    const attendanceDate = String(
      req.query?.attendanceDate || getManilaDateOnly()
    ).trim();

    let session = null;

    if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
      session = await TrainingRfidSession.findById(sessionId).lean();

      if (session && !allowedCourses.includes(normalizeCourseName(session.course))) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to export RFID attendance for this course.",
        });
      }
    }

    if (!session) {
      if (requestedCourse && !allowedCourses.includes(requestedCourse)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to export RFID attendance for this course.",
        });
      }

      session = await TrainingRfidSession.findOne({
        course: requestedCourse || { $in: allowedCourses },
        attendanceDate,
      })
        .sort({ openedAt: -1 })
        .lean();
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "RFID attendance session not found.",
      });
    }

    const rawLogs = await TraineeRfidLog.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .lean();

    const traineeMap = await buildTraineeMapForLogs(rawLogs);
    const logs = rawLogs.map((log) => mapLog(log, traineeMap));

    const rows = [
      [
        "Course",
        "Session Date",
        "Station",
        "Session Status",
        "Opened At",
        "Closed At",
        "Trainee Name",
        "Trainee Email",
        "UID",
        "Action",
        "Scan Status",
        "Scan Time",
        "Message",
      ],
      ...logs.map((log) => [
        session.course || "",
        session.attendanceDate || "",
        session.station || "",
        session.isOpen ? "Open" : "Closed",
        formatManilaDateTime(session.openedAt),
        formatManilaDateTime(session.closedAt),
        log.traineeName || "",
        log.traineeEmail || "",
        log.uid || "",
        log.action || "",
        log.status || "",
        formatManilaDateTime(log.createdAt),
        log.message || "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => csvEscape(cell)).join(","))
      .join("\n");

    const safeCourse = String(session.course || "rfid")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const filename = `${safeCourse}-rfid-attendance-${session.attendanceDate || "session"}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.status(200).send(csv);
  } catch (error) {
    console.error("exportProfessorRfidAttendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export RFID attendance.",
    });
  }
};

export const scanTraineeRfid = async (req, res) => {
  try {
    const uid = req.body?.uid;
    const station =
      String(req.body?.station || DEFAULT_STATION).trim() || DEFAULT_STATION;
    const normalizedUid = normalizeUid(uid);

    if (!normalizedUid) {
      return res.status(400).json({
        ok: false,
        message: "UID is required.",
      });
    }

    const scanDate = getManilaDateOnly();
    const trainee = await findTraineeByNormalizedUid(normalizedUid);

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

    if (!traineeCourse) {
      return res.status(403).json({
        ok: false,
        message: "This trainee has no assigned course.",
        trainee: {
          _id: trainee._id,
          fullName: getFullName(trainee),
          email: trainee.email || "",
          course: trainee.course || "",
        },
      });
    }

    const activeSession = await TrainingRfidSession.findOne({
      course: traineeCourse,
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
        message: `RFID attendance is not open right now for ${traineeCourse}.`,
        trainee: {
          _id: trainee._id,
          fullName: getFullName(trainee),
          email: trainee.email || "",
          course: trainee.course || "",
        },
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
        message: `${getFullName(trainee)} already completed RFID attendance for this open session.`,
        trainee: {
          _id: trainee._id,
          fullName: getFullName(trainee),
          email: trainee.email || "",
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
            email: trainee.email || "",
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
      success: true,
      message: `${getFullName(trainee)} ${
        nextAction === "time_in" ? "timed in" : "timed out"
      } successfully.`,
      trainee: {
        _id: trainee._id,
        fullName: getFullName(trainee),
        email: trainee.email || "",
        course: trainee.course || "",
      },
      session: mapSession(activeSession),
      log: mapLog(successLog),
    });
  } catch (error) {
    console.error("scanTraineeRfid error:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to process trainee RFID scan.",
    });
  }
};

export const getTraineeRfidLogs = async (req, res) => {
  try {
    const { traineeId, date, sessionId, course } = req.query || {};

    const filter = {};

    if (traineeId) filter.traineeId = traineeId;

    if (sessionId && mongoose.Types.ObjectId.isValid(String(sessionId))) {
      filter.sessionId = sessionId;
    }

    if (course) filter.course = normalizeCourseName(course);
    if (date) filter.attendanceDate = String(date).trim();

    const logs = await TraineeRfidLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const traineeMap = await buildTraineeMapForLogs(logs);

    return res.json(logs.map((log) => mapLog(log, traineeMap)));
  } catch (error) {
    console.error("getTraineeRfidLogs error:", error);
    return res.status(500).json({
      message: "Failed to fetch trainee RFID logs.",
    });
  }
};
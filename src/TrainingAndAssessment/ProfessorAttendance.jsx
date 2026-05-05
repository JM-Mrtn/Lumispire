import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const ATTENDANCE_STATUSES = ["Pending", "Present", "Late", "Absent"];
const ROWS_PER_PAGE = 5;
const RFID_LOGS_PER_PAGE = 6;

function professorAuthHeaders(extra = {}) {
  const token = localStorage.getItem("professorToken") || "";
  return { ...extra, Authorization: `Bearer ${token}` };
}

function normalizeCourseName(value = "") {
  const raw = String(value || "").trim();
  const clean = raw.toLowerCase();

  if (clean === "event management") return "Event Management";
  if (clean === "housekeeping") return "Housekeeping";
  if (clean === "cookery") return "Cookery";

  return raw;
}

function normalizeCourseAssignments(values = []) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((item) => normalizeCourseName(item))
        .filter(Boolean)
    ),
  ];
}

function getStoredProfessor() {
  try {
    return JSON.parse(localStorage.getItem("professorUser") || "null");
  } catch {
    return null;
  }
}

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || "Invalid server response.");
  }
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const data = await readJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

function todayLocalISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function toDateTimeLocalValue(value) {
  const d = value ? new Date(value) : new Date();

  if (Number.isNaN(d.getTime())) return "";

  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function buildDefaultOpenAndCloseTimes() {
  const now = new Date();
  const close = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  return {
    open: toDateTimeLocalValue(now),
    close: toDateTimeLocalValue(close),
  };
}

function getDatePartFromDateTimeLocal(value = "") {
  const [datePart] = String(value || "").split("T");
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : todayLocalISO();
}

function formatDateTime(value) {
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

function getProfessorName(professor) {
  return (
    professor?.name ||
    `${professor?.firstName || ""} ${professor?.lastName || ""}`.trim() ||
    professor?.username ||
    professor?.email ||
    "Professor Name"
  );
}

function getObjectIdString(value) {
  if (!value) return "";

  if (typeof value === "string") return value.trim();

  if (typeof value === "object") {
    if (value.$oid) return String(value.$oid).trim();

    if (
      typeof value.toString === "function" &&
      value.toString() !== "[object Object]"
    ) {
      return String(value.toString()).trim();
    }
  }

  return "";
}

function getProofFileId(row) {
  return getObjectIdString(
    row?.proofFileId ||
      row?.proofFile?.fileId ||
      row?.proofFile?.id ||
      row?.fileId ||
      ""
  );
}

function getProofFileName(row) {
  return (
    row?.proofFileName ||
    row?.proofFile?.originalName ||
    row?.proofFile?.filename ||
    row?.proofFile?.name ||
    row?.fileName ||
    "Proof File"
  );
}

function getProofFileMimeType(row) {
  return String(
    row?.proofFile?.mimetype ||
      row?.proofFile?.mimeType ||
      row?.mimeType ||
      row?.proofFileType ||
      ""
  ).toLowerCase();
}

function buildProtectedFileUrl(fileId = "") {
  const cleanId = getObjectIdString(fileId);
  const token = localStorage.getItem("professorToken") || "";

  if (!cleanId) return "#";

  const baseUrl = `${API_BASE}/training-files/${cleanId}`;

  if (!token) return baseUrl;

  return `${baseUrl}?token=${encodeURIComponent(token)}`;
}

function getTrainingFileId(fileRef) {
  if (!fileRef || typeof fileRef !== "object") return "";
  return getObjectIdString(fileRef?.fileId || fileRef?.id || "");
}

function getTrainingFileName(fileRef, fallback = "Reference Photo") {
  if (!fileRef || typeof fileRef !== "object") return fallback;

  return fileRef?.originalName || fileRef?.filename || fileRef?.name || fallback;
}

function getTrainingFileMimeType(fileRef) {
  if (!fileRef || typeof fileRef !== "object") return "";

  return String(fileRef?.mimetype || fileRef?.mimeType || "").toLowerCase();
}

function buildTrainingProtectedFileUrl(fileId = "") {
  return buildProtectedFileUrl(fileId);
}

function getReferencePhotoFile(trainee) {
  if (trainee?.picture2x2?.fileId) return trainee.picture2x2;
  if (trainee?.profilePhoto?.fileId) return trainee.profilePhoto;
  return null;
}

function getImageLike(fileName = "", mimeType = "") {
  const cleanMime = String(mimeType || "").toLowerCase();

  return (
    cleanMime.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(String(fileName || ""))
  );
}

function getPdfLike(fileName = "", mimeType = "") {
  const cleanMime = String(mimeType || "").toLowerCase();

  return cleanMime === "application/pdf" || /\.pdf$/i.test(String(fileName || ""));
}

function getAttendanceRowTraineeId(row) {
  if (!row) return "";

  const raw =
    row?.traineeUserId?._id ||
    row?.traineeUserId?.id ||
    row?.traineeUserId ||
    row?.traineeId ||
    "";

  return String(raw || "").trim();
}

function pickAttendanceRowForTrainee(rows, trainee) {
  const traineeId = String(trainee?._id || "").trim();
  const traineeEmail = String(trainee?.email || "").trim().toLowerCase();

  return (
    rows.find((row) => getAttendanceRowTraineeId(row) === traineeId) ||
    rows.find(
      (row) =>
        String(row?.email || "")
          .trim()
          .toLowerCase() === traineeEmail
    ) ||
    null
  );
}

function buildMergedRows(trainees = [], attendanceRows = []) {
  return [...trainees]
    .map((trainee, index) => {
      const row = pickAttendanceRowForTrainee(attendanceRows, trainee);
      const proofId = getProofFileId(row);
      const hasProof = Boolean(proofId);
      const hasExistingAttendance = Boolean(row?._id || row?.id);
      const referencePhoto = getReferencePhotoFile(trainee);

      let derivedStatus = "Not Posted";

      if (hasProof) {
        derivedStatus = "Submitted";
      } else if (hasExistingAttendance) {
        derivedStatus = String(row?.status || "Pending").trim() || "Pending";
      }

      return {
        key: String(trainee?._id || row?._id || row?.id || `row-${index}`),
        traineeId: String(trainee?._id || "").trim(),
        traineeName:
          `${trainee?.firstName || ""} ${trainee?.lastName || ""}`.trim() ||
          row?.traineeName ||
          "Full name of the trainee",
        email: trainee?.email || row?.email || "traineeemail@tamsi.com",
        course: trainee?.course || row?.course || "Course",
        attendanceId: row?._id || row?.id || "",
        hasExistingAttendance,
        hasProof,
        proofId,
        proofFileName: getProofFileName(row),
        proofFileMimeType: getProofFileMimeType(row),
        status: derivedStatus,
        rawStatus: row?.status || "",
        remarks: row?.remarks || "",
        proofReviewStatus: hasProof
          ? String(row?.proofReviewStatus || "pending").toLowerCase()
          : "missing",
        submittedAt: row?.submittedAt || null,
        attendanceDate: row?.attendanceDate || "",
        uploadOpenAt: row?.uploadOpenAt || null,
        uploadCloseAt: row?.uploadCloseAt || null,
        referencePhoto,
        referencePhotoId: getTrainingFileId(referencePhoto),
        referencePhotoName: getTrainingFileName(
          referencePhoto,
          "2X2 Picture with Name"
        ),
        referencePhotoMimeType: getTrainingFileMimeType(referencePhoto),
      };
    })
    .sort((a, b) => a.traineeName.localeCompare(b.traineeName));
}

function buildAttendanceRecordLabel(record, index) {
  const primary =
    record?.uploadOpenAt || record?.createdAt || record?.attendanceDate || "";

  return `Record ${index + 1} • ${formatDateTime(primary)}`;
}

function buildRfidSessionLabel(session, index) {
  const opened = formatDateTime(session?.openedAt);
  const status = session?.isOpen ? "Open" : "Closed";
  const scans = Number(session?.scanCount || 0);

  return `RFID Session ${index + 1} • ${opened} • ${status} • ${scans} scan(s)`;
}

function modalBackdropClasses(open) {
  return open
    ? "fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 py-6"
    : "hidden";
}

function StatusPill({ row }) {
  const value = row?.status || "Pending";
  const clean = String(value).toLowerCase();

  let classes = "bg-[#bdf0a4] text-[#2d5038]";

  if (clean === "pending") classes = "bg-yellow-100 text-yellow-800";
  if (clean === "late") classes = "bg-orange-100 text-orange-800";
  if (clean === "absent" || clean === "not posted") {
    classes = "bg-red-100 text-red-800";
  }

  return (
    <span
      className={`inline-flex min-w-[84px] justify-center rounded-full px-3 py-1 text-[10px] font-black ${classes}`}
    >
      {value}
    </span>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e2e8da]">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-[#6f7c71]">
        {label}
      </div>
      <div className="mt-2 text-lg font-black text-[#395345]">{value}</div>
    </div>
  );
}

export default function ProfessorAttendance() {
  const navigate = useNavigate();
  const initialWindow = useMemo(() => buildDefaultOpenAndCloseTimes(), []);
  const storedProfessor = useMemo(() => getStoredProfessor(), []);

  const [professor, setProfessor] = useState(() => storedProfessor);
  const [allowedCourses, setAllowedCourses] = useState(() =>
    normalizeCourseAssignments(storedProfessor?.courseAssignments || [])
  );

  const [course, setCourse] = useState("");
  const [trainees, setTrainees] = useState([]);
  const [recordHistoryRows, setRecordHistoryRows] = useState([]);
  const [postingHistoryRows, setPostingHistoryRows] = useState([]);

  const [selectedRecordKey, setSelectedRecordKey] = useState("");
  const [recordOptions, setRecordOptions] = useState([]);

  const [loadingProfessor, setLoadingProfessor] = useState(false);
  const [loadingTrainees, setLoadingTrainees] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingRecordDates, setLoadingRecordDates] = useState(false);
  const [loadingPosting, setLoadingPosting] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalRow, setViewModalRow] = useState(null);
  const [postingAttendance, setPostingAttendance] = useState(false);
  const [reviewingId, setReviewingId] = useState("");

  const [uploadOpenAt, setUploadOpenAt] = useState(initialWindow.open);
  const [uploadCloseAt, setUploadCloseAt] = useState(initialWindow.close);
  const [postRowsById, setPostRowsById] = useState({});

  const [rfidLoading, setRfidLoading] = useState(false);
  const [rfidSession, setRfidSession] = useState(null);
  const [rfidSessions, setRfidSessions] = useState([]);
  const [selectedRfidSessionId, setSelectedRfidSessionId] = useState("");
  const [rfidLogs, setRfidLogs] = useState([]);
  const [rfidPage, setRfidPage] = useState(1);

  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const professorName = getProfessorName(professor);
  const professorEmail = professor?.email || "traineemail@tamsi.com";

  const menuItems = [
    { label: "Dashboard", path: "/professor-dashboard" },
    { label: "Manage Attendance", path: "/professor-attendance" },
    { label: "Manage Assignment", path: "/professor-assessments" },
    { label: "Manage Modules", path: "/professor-modules" },
    { label: "Manage Progress", path: "/professor-progress" },
  ];

  const courseOptions = useMemo(() => {
    if (!allowedCourses.length) return [];
    return allowedCourses.length > 1 ? ["All", ...allowedCourses] : allowedCourses;
  }, [allowedCourses]);

  const selectedCourseForRfid = useMemo(() => {
    if (course && course !== "All") return course;
    return allowedCourses[0] || "";
  }, [course, allowedCourses]);

  const selectedRecord = useMemo(
    () => recordOptions.find((item) => item.key === selectedRecordKey) || null,
    [recordOptions, selectedRecordKey]
  );

  const postingAttendanceDate = useMemo(
    () => getDatePartFromDateTimeLocal(uploadOpenAt),
    [uploadOpenAt]
  );

  const recordsAttendanceDate = selectedRecord?.attendanceDate || todayLocalISO();

  const selectedRfidSession = useMemo(
    () =>
      rfidSessions.find(
        (session) =>
          String(session?.id || session?._id || "") ===
          String(selectedRfidSessionId || "")
      ) ||
      rfidSession ||
      null,
    [rfidSessions, selectedRfidSessionId, rfidSession]
  );

  const rfidTotalPages = Math.max(
    1,
    Math.ceil(rfidLogs.length / RFID_LOGS_PER_PAGE)
  );

  const paginatedRfidLogs = useMemo(() => {
    const start = (rfidPage - 1) * RFID_LOGS_PER_PAGE;
    return rfidLogs.slice(start, start + RFID_LOGS_PER_PAGE);
  }, [rfidLogs, rfidPage]);

  const traineeQuery = useMemo(() => {
    const params = new URLSearchParams();

    if (course && course !== "All") params.set("course", course);

    const q = params.toString();
    return q ? `?${q}` : "";
  }, [course]);

  const postingAttendanceQuery = useMemo(() => {
    const params = new URLSearchParams();

    if (postingAttendanceDate) {
      params.set("attendanceDate", postingAttendanceDate);
    }

    if (course && course !== "All") {
      params.set("course", course);
    }

    const q = params.toString();
    return q ? `?${q}` : "";
  }, [postingAttendanceDate, course]);

  const recordsAttendanceQuery = useMemo(() => {
    const params = new URLSearchParams();

    if (selectedRecord?.uploadOpenAt) {
      params.set("uploadOpenAt", selectedRecord.uploadOpenAt);
    } else if (selectedRecord?.attendanceDate) {
      params.set("attendanceDate", selectedRecord.attendanceDate);
    }

    if (course && course !== "All") {
      params.set("course", course);
    }

    const q = params.toString();
    return q ? `?${q}` : "";
  }, [selectedRecord, course]);

  const recordMergedRows = useMemo(
    () => buildMergedRows(trainees, recordHistoryRows),
    [trainees, recordHistoryRows]
  );

  const postingMergedRows = useMemo(
    () => buildMergedRows(trainees, postingHistoryRows),
    [trainees, postingHistoryRows]
  );

  const totalPages = Math.max(1, Math.ceil(recordMergedRows.length / ROWS_PER_PAGE));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return recordMergedRows.slice(start, start + ROWS_PER_PAGE);
  }, [recordMergedRows, page]);

  const pageLoading =
    loadingProfessor || loadingTrainees || loadingRecords || loadingRecordDates;

  const loadProfessorCourses = useCallback(async () => {
    try {
      setLoadingProfessor(true);

      const meData = await fetchJson(`${API_BASE}/professors/me`, {
        headers: professorAuthHeaders(),
      });

      const nextProfessor = meData?.professor || null;
      const nextAllowedCourses = normalizeCourseAssignments(
        nextProfessor?.courseAssignments || []
      );

      if (nextProfessor) {
        localStorage.setItem("professorUser", JSON.stringify(nextProfessor));
        setProfessor(nextProfessor);
      }

      setAllowedCourses(nextAllowedCourses);

      if (nextAllowedCourses.length) {
        setCourse((prev) => {
          if (prev && (prev === "All" || nextAllowedCourses.includes(prev))) {
            return prev;
          }

          return nextAllowedCourses.length > 1 ? "All" : nextAllowedCourses[0];
        });
      }
    } catch {
      const fallback = normalizeCourseAssignments(
        getStoredProfessor()?.courseAssignments || []
      );

      setAllowedCourses(fallback);

      if (fallback.length) {
        setCourse((prev) => {
          if (prev && (prev === "All" || fallback.includes(prev))) return prev;
          return fallback.length > 1 ? "All" : fallback[0];
        });
      }
    } finally {
      setLoadingProfessor(false);
    }
  }, []);

  const loadTrainees = useCallback(async () => {
    try {
      setLoadingTrainees(true);

      const data = await fetchJson(`${API_BASE}/professors/trainees${traineeQuery}`, {
        headers: professorAuthHeaders(),
      });

      setTrainees(Array.isArray(data?.trainees) ? data.trainees : []);
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to load trainees.",
      });
    } finally {
      setLoadingTrainees(false);
    }
  }, [traineeQuery]);

  const loadRecordDateOptions = useCallback(async () => {
    try {
      setLoadingRecordDates(true);

      const params = new URLSearchParams();

      if (course && course !== "All") {
        params.set("course", course);
      }

      const query = params.toString();
      const url = query
        ? `${API_BASE}/professors/attendance/dates?${query}`
        : `${API_BASE}/professors/attendance/dates`;

      const data = await fetchJson(url, {
        headers: professorAuthHeaders(),
      });

      const records = Array.isArray(data?.records) ? data.records : [];

      setRecordOptions(records);

      setSelectedRecordKey((prev) => {
        if (!records.length) return "";
        if (records.some((item) => item.key === prev)) return prev;
        return records[0].key;
      });
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to load attendance record list.",
      });

      setRecordOptions([]);
      setSelectedRecordKey("");
    } finally {
      setLoadingRecordDates(false);
    }
  }, [course]);

  const loadRecordAttendanceRows = useCallback(async () => {
    try {
      setLoadingRecords(true);

      const data = await fetchJson(
        `${API_BASE}/professors/attendance${recordsAttendanceQuery}`,
        {
          headers: professorAuthHeaders(),
        }
      );

      setRecordHistoryRows(Array.isArray(data?.attendance) ? data.attendance : []);
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to load attendance records.",
      });
    } finally {
      setLoadingRecords(false);
    }
  }, [recordsAttendanceQuery]);

  const loadPostingAttendanceRows = useCallback(async () => {
    try {
      setLoadingPosting(true);

      const data = await fetchJson(
        `${API_BASE}/professors/attendance${postingAttendanceQuery}`,
        {
          headers: professorAuthHeaders(),
        }
      );

      setPostingHistoryRows(Array.isArray(data?.attendance) ? data.attendance : []);
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to load posting attendance records.",
      });
    } finally {
      setLoadingPosting(false);
    }
  }, [postingAttendanceQuery]);

  const loadRfidStatus = useCallback(
    async (sessionId = selectedRfidSessionId) => {
      if (!selectedCourseForRfid) {
        setRfidSession(null);
        setRfidSessions([]);
        setSelectedRfidSessionId("");
        setRfidLogs([]);
        return;
      }

      try {
        setRfidLoading(true);

        const params = new URLSearchParams();
        params.set("course", selectedCourseForRfid);
        params.set("attendanceDate", todayLocalISO());

        if (sessionId) {
          params.set("sessionId", sessionId);
        }

        const data = await fetchJson(
          `${API_BASE}/training/rfid/professor/status?${params.toString()}`,
          {
            headers: professorAuthHeaders(),
          }
        );

        const nextSessions = Array.isArray(data?.sessions) ? data.sessions : [];
        const selectedId = String(data?.session?.id || data?.session?._id || "");

        setRfidSession(data?.session || null);
        setRfidSessions(nextSessions);
        setSelectedRfidSessionId(selectedId);
        setRfidLogs(Array.isArray(data?.logs) ? data.logs : []);
        setRfidPage(1);
      } catch (error) {
        setMsg({
          type: "error",
          text: error.message || "Failed to load RFID attendance status.",
        });
      } finally {
        setRfidLoading(false);
      }
    },
    [selectedCourseForRfid, selectedRfidSessionId]
  );

  const refreshPage = useCallback(async () => {
    setMsg({ type: "", text: "" });

    await Promise.all([loadTrainees(), loadRecordDateOptions()]);
    await Promise.all([loadRecordAttendanceRows(), loadRfidStatus()]);
  }, [
    loadTrainees,
    loadRecordDateOptions,
    loadRecordAttendanceRows,
    loadRfidStatus,
  ]);

  useEffect(() => {
    loadProfessorCourses();
  }, [loadProfessorCourses]);

  useEffect(() => {
    if (!allowedCourses.length) return;

    setPage(1);
    loadTrainees();
    loadRecordDateOptions();
  }, [allowedCourses.length, course, loadTrainees, loadRecordDateOptions]);

  useEffect(() => {
    if (!allowedCourses.length) return;

    setPage(1);
    loadRecordAttendanceRows();
  }, [allowedCourses.length, selectedRecordKey, loadRecordAttendanceRows]);

  useEffect(() => {
    if (!allowedCourses.length || !selectedCourseForRfid) return;
    loadRfidStatus("");
  }, [allowedCourses.length, selectedCourseForRfid]);

  useEffect(() => {
    if (!rfidSession?.isOpen) return;

    const timer = setInterval(() => {
      loadRfidStatus(selectedRfidSessionId);
    }, 5000);

    return () => clearInterval(timer);
  }, [rfidSession?.isOpen, selectedRfidSessionId, loadRfidStatus]);

  useEffect(() => {
    const next = {};

    for (const row of postingMergedRows) {
      next[row.traineeId] = {
        status:
          row.rawStatus && ATTENDANCE_STATUSES.includes(row.rawStatus)
            ? row.rawStatus
            : "Pending",
        remarks: row.remarks || "",
      };
    }

    setPostRowsById(next);
  }, [postingMergedRows]);

  async function openCreateAttendanceModal() {
    setCreateModalOpen(true);
    await Promise.all([loadTrainees(), loadPostingAttendanceRows()]);
  }

  function updatePostRow(traineeId, key, value) {
    setPostRowsById((prev) => ({
      ...prev,
      [traineeId]: {
        ...(prev[traineeId] || { status: "Pending", remarks: "" }),
        [key]: value,
      },
    }));
  }

  function applyBulkStatus(status) {
    setPostRowsById((prev) => {
      const next = { ...prev };

      for (const row of postingMergedRows) {
        next[row.traineeId] = {
          ...(next[row.traineeId] || { remarks: "" }),
          status,
        };
      }

      return next;
    });
  }

  async function submitBulkAttendance() {
    try {
      if (!postingMergedRows.length) {
        throw new Error("There are no trainees available for posting.");
      }

      if (!uploadOpenAt || !uploadCloseAt) {
        throw new Error("Upload open time and upload close time are required.");
      }

      setPostingAttendance(true);
      setMsg({ type: "", text: "" });

      const rows = postingMergedRows.map((row) => {
        const state = postRowsById[row.traineeId] || {};

        return {
          traineeUserId: row.traineeId,
          traineeName: row.traineeName,
          email: row.email,
          course: row.course,
          status: state.status || "Pending",
          remarks: state.remarks || "",
        };
      });

      await fetchJson(`${API_BASE}/professors/attendance/bulk`, {
        method: "POST",
        headers: professorAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          attendanceDate: postingAttendanceDate,
          uploadOpenAt,
          uploadCloseAt,
          rows,
        }),
      });

      setMsg({
        type: "success",
        text: "Attendance created successfully.",
      });

      setCreateModalOpen(false);
      await refreshPage();
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to create attendance.",
      });
    } finally {
      setPostingAttendance(false);
    }
  }

  async function openRfidAttendance() {
    try {
      if (!selectedCourseForRfid) {
        throw new Error("Please select a course first.");
      }

      setRfidLoading(true);
      setMsg({ type: "", text: "" });

      const data = await fetchJson(`${API_BASE}/training/rfid/professor/open`, {
        method: "POST",
        headers: professorAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          course: selectedCourseForRfid,
          attendanceDate: todayLocalISO(),
          station: `${selectedCourseForRfid} RFID Station`,
        }),
      });

      const nextId = String(data?.session?.id || data?.session?._id || "");

      setMsg({
        type: "success",
        text: data?.message || `${selectedCourseForRfid} RFID attendance opened.`,
      });

      await loadRfidStatus(nextId);
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to open RFID attendance.",
      });
    } finally {
      setRfidLoading(false);
    }
  }

  async function closeRfidAttendance() {
    try {
      if (!selectedRfidSession?.id && !selectedRfidSession?._id) {
        throw new Error("No RFID session selected.");
      }

      setRfidLoading(true);
      setMsg({ type: "", text: "" });

      const data = await fetchJson(`${API_BASE}/training/rfid/professor/close`, {
        method: "PATCH",
        headers: professorAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          sessionId: selectedRfidSession.id || selectedRfidSession._id,
        }),
      });

      setMsg({
        type: "success",
        text: data?.message || "RFID attendance closed.",
      });

      await loadRfidStatus(selectedRfidSession.id || selectedRfidSession._id);
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to close RFID attendance.",
      });
    } finally {
      setRfidLoading(false);
    }
  }

  async function exportAttendance() {
    try {
      const params = new URLSearchParams();

      if (selectedRecord?.uploadOpenAt) {
        params.set("uploadOpenAt", selectedRecord.uploadOpenAt);
      } else {
        params.set("attendanceDate", recordsAttendanceDate);
      }

      if (selectedRecord?.batchId) {
        params.set("batchId", selectedRecord.batchId);
      }

      if (course && course !== "All") {
        params.set("course", course);
      }

      const res = await fetch(
        `${API_BASE}/professors/attendance/export?${params.toString()}`,
        { headers: professorAuthHeaders() }
      );

      if (!res.ok) {
        const data = await readJsonSafe(res);
        throw new Error(data?.message || "Failed to export attendance.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `attendance-${recordsAttendanceDate}.csv`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to export attendance.",
      });
    }
  }

  async function exportRfidAttendance() {
    try {
      if (!selectedRfidSession?.id && !selectedRfidSession?._id) {
        throw new Error("Please select an RFID session first.");
      }

      const params = new URLSearchParams();
      params.set("sessionId", selectedRfidSession.id || selectedRfidSession._id);

      const res = await fetch(
        `${API_BASE}/training/rfid/professor/export?${params.toString()}`,
        { headers: professorAuthHeaders() }
      );

      if (!res.ok) {
        const data = await readJsonSafe(res);
        throw new Error(data?.message || "Failed to export RFID attendance.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      const safeCourse = String(selectedRfidSession.course || "rfid")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      a.href = url;
      a.download = `${safeCourse}-rfid-attendance-${
        selectedRfidSession.attendanceDate || todayLocalISO()
      }.csv`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to export RFID attendance.",
      });
    }
  }

  function openScannerDisplay() {
    if (!selectedCourseForRfid) return;

    navigate(
      `/trainee-rfid-scan?course=${encodeURIComponent(selectedCourseForRfid)}`
    );
  }

  async function handleReview(modalRow, proofReviewStatus, status) {
    try {
      if (!modalRow?.attendanceId) {
        throw new Error("Attendance record is missing.");
      }

      setReviewingId(modalRow.attendanceId);
      setMsg({ type: "", text: "" });

      await fetchJson(
        `${API_BASE}/professors/attendance/${modalRow.attendanceId}/review-proof`,
        {
          method: "PATCH",
          headers: professorAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            proofReviewStatus,
            status,
          }),
        }
      );

      setMsg({
        type: "success",
        text:
          proofReviewStatus === "approved"
            ? "Attendance proof approved successfully."
            : "Attendance proof rejected successfully.",
      });

      await loadRecordAttendanceRows();
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to review proof.",
      });
    } finally {
      setReviewingId("");
    }
  }

  function handleLogout() {
    localStorage.removeItem("professorToken");
    localStorage.removeItem("professor");
    localStorage.removeItem("professorUser");
    localStorage.removeItem("storedProfessor");

    navigate("/professor-login");
  }

  const rfidOpen = selectedRfidSession?.isOpen === true;

  return (
    <div className="min-h-screen bg-[#12391f] font-sans text-white">
      <header className="flex h-[88px] items-center bg-white px-6 shadow-sm md:px-10">
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#2d5238] bg-white text-sm font-black text-[#2d5238]">
            LC
          </div>

          <h1 className="text-xl font-black uppercase tracking-wide text-[#2d5238] md:text-3xl">
            Training &amp; Assessment
          </h1>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-88px)] flex-col lg:flex-row">
        <aside className="flex w-full flex-col bg-[#2d5038] lg:w-[262px]">
          <div className="border-b border-white/15 px-6 py-8 text-center">
            <div className="mx-auto h-[76px] w-[76px] rounded-full border-4 border-[#b7bbb6] bg-white shadow-sm" />

            <h2 className="mt-5 text-base font-black uppercase leading-tight">
              {professorName}
            </h2>

            <p className="mt-1 break-words text-xs font-semibold text-white/80">
              {professorEmail}
            </p>
          </div>

          <nav className="flex-1 py-6">
            {menuItems.map((item) => {
              const active = item.label === "Manage Attendance";

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`block w-full px-11 py-4 text-left text-sm font-black uppercase transition ${
                    active
                      ? "bg-[#d8e0da] text-[#1e3e2a]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="px-20 pb-10 lg:px-20">
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-black uppercase text-white transition hover:text-[#d8e0da]"
            >
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 bg-[#12391f] px-5 py-6 md:px-8 lg:px-8">
          <section className="mx-auto max-w-[1040px]">
            <div className="mb-7">
              <h2 className="text-3xl font-black uppercase tracking-tight md:text-[34px]">
                Manage Trainee Attendance
              </h2>
              <div className="mt-1 h-1 w-full max-w-[530px] bg-white/60" />
            </div>

            {msg.text ? (
              <div
                className={`mb-5 rounded-xl px-4 py-3 text-sm font-bold ring-1 ${
                  msg.type === "success"
                    ? "bg-green-50 text-green-800 ring-green-200"
                    : "bg-red-50 text-red-800 ring-red-200"
                }`}
              >
                {msg.text}
              </div>
            ) : null}

            <div className="mb-7 rounded-2xl bg-[#2d5038] p-5 shadow-sm ring-1 ring-white/15">
              <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-black uppercase">
                      {selectedCourseForRfid || "Course"} RFID Attendance
                    </h3>

                    <span
                      className={`rounded-full px-4 py-1 text-xs font-black uppercase ${
                        rfidOpen
                          ? "bg-[#bdf0a4] text-[#2d5038]"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {rfidOpen ? "Open" : "Closed"}
                    </span>
                  </div>

                  <p className="mt-2 max-w-2xl text-sm font-bold text-white/85">
                    View one RFID attendance session at a time. Select a session
                    below to avoid a long scan list.
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
                        RFID Session
                      </label>

                      <select
                        value={selectedRfidSessionId}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          setSelectedRfidSessionId(nextId);
                          loadRfidStatus(nextId);
                        }}
                        disabled={rfidLoading || !rfidSessions.length}
                        className="mt-2 h-11 w-full rounded-xl border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none disabled:bg-white/70"
                      >
                        {!rfidSessions.length ? (
                          <option value="">No RFID sessions today</option>
                        ) : (
                          rfidSessions.map((session, index) => (
                            <option
                              key={session.id || session._id}
                              value={session.id || session._id}
                            >
                              {buildRfidSessionLabel(session, index)}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
                        Selected Session Details
                      </label>

                      <div className="mt-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white">
                        <div>
                          Date: {selectedRfidSession?.attendanceDate || todayLocalISO()}
                        </div>
                        <div>
                          Station: {selectedRfidSession?.station || `${selectedCourseForRfid} RFID Station`}
                        </div>
                        <div>
                          Time In: {Number(selectedRfidSession?.timeInCount || 0)} • Time Out:{" "}
                          {Number(selectedRfidSession?.timeOutCount || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white/10 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-black uppercase">
                        Scans in selected session
                      </h4>

                      <div className="text-xs font-black text-white/70">
                        Page {rfidPage} / {rfidTotalPages}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {rfidLoading ? (
                        <div className="rounded-xl bg-white/10 px-4 py-5 text-sm font-bold text-white/75 md:col-span-2">
                          Loading RFID session...
                        </div>
                      ) : paginatedRfidLogs.length ? (
                        paginatedRfidLogs.map((log) => (
                          <div
                            key={log.id || `${log.uid}-${log.createdAt}`}
                            className="rounded-xl bg-white/10 px-4 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-black">
                                  {log.traineeName || log.uid || "RFID Scan"}
                                </div>
                                <div className="mt-1 text-xs font-bold text-white/75">
                                  {log.message || "RFID scan processed."}
                                </div>
                                <div className="mt-1 text-xs font-bold uppercase text-white/55">
                                  {formatDateTime(log.createdAt)}
                                </div>
                              </div>

                              <span
                                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                                  log.status === "success"
                                    ? "bg-[#bdf0a4] text-[#2d5038]"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {log.action || log.status || "scan"}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl bg-white/10 px-4 py-5 text-center text-sm font-bold text-white/75 md:col-span-2">
                          No scans in this RFID session yet.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setRfidPage((prev) => Math.max(1, prev - 1))}
                        disabled={rfidPage <= 1}
                        className="rounded-lg border border-white/25 px-4 py-2 text-xs font-black uppercase disabled:opacity-40"
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setRfidPage((prev) => Math.min(rfidTotalPages, prev + 1))
                        }
                        disabled={rfidPage >= rfidTotalPages}
                        className="rounded-lg border border-white/25 px-4 py-2 text-xs font-black uppercase disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={openRfidAttendance}
                    disabled={rfidLoading || !selectedCourseForRfid}
                    className="rounded-xl bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-[#2d5038] transition hover:bg-[#eef1e7] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Open RFID Attendance
                  </button>

                  <button
                    type="button"
                    onClick={openScannerDisplay}
                    disabled={!rfidOpen}
                    className="rounded-xl bg-[#bdf0a4] px-5 py-4 text-xs font-black uppercase tracking-widest text-[#2d5038] transition hover:bg-[#d7ffc7] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Open Scanner Display
                  </button>

                  <button
                    type="button"
                    onClick={closeRfidAttendance}
                    disabled={rfidLoading || !rfidOpen}
                    className="rounded-xl border border-white/25 px-5 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Close RFID
                  </button>

                  <button
                    type="button"
                    onClick={() => loadRfidStatus(selectedRfidSessionId)}
                    disabled={rfidLoading}
                    className="rounded-xl border border-white/25 px-5 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Refresh RFID
                  </button>

                  <button
                    type="button"
                    onClick={exportRfidAttendance}
                    disabled={!selectedRfidSession}
                    className="rounded-xl bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-[#2d5038] transition hover:bg-[#eef1e7] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Export RFID Session
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-7 rounded-lg bg-[#2d5038] px-5 py-4 shadow-sm">
              <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
                <div>
                  <label className="text-base font-black uppercase text-white">
                    Course
                  </label>

                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    disabled={courseOptions.length <= 1}
                    className="mt-1 h-8 w-full max-w-[270px] rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none disabled:bg-white/80"
                  >
                    {!courseOptions.length ? (
                      <option value="">No assigned course</option>
                    ) : (
                      courseOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={refreshPage}
                  disabled={pageLoading}
                  className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pageLoading ? "Loading..." : "Refresh"}
                </button>

                <button
                  type="button"
                  onClick={openCreateAttendanceModal}
                  disabled={pageLoading || !allowedCourses.length}
                  className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Create Attendance
                </button>

                <button
                  type="button"
                  onClick={exportAttendance}
                  disabled={pageLoading || !allowedCourses.length}
                  className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Export Attendance
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-[#2d5038] shadow-sm">
              <div className="bg-white px-4 py-4">
                <h3 className="text-lg font-black text-[#2d5038]">My Students</h3>
              </div>

              <div className="min-h-[372px] divide-y divide-white/25">
                {pageLoading ? (
                  [1, 2].map((item) => (
                    <div
                      key={item}
                      className="grid gap-4 px-3 py-4 md:grid-cols-[64px_1.4fr_1.4fr_.7fr_.7fr_100px_90px] md:items-center"
                    >
                      <div className="h-11 w-11 rounded-full bg-white" />
                      <div className="h-4 rounded-full bg-white/35" />
                      <div className="h-4 rounded-full bg-white/35" />
                      <div className="h-4 rounded-full bg-white/35" />
                      <div className="h-4 rounded-full bg-white/35" />
                      <div className="h-5 rounded-full bg-[#bdf0a4]" />
                      <div className="h-5 rounded-full bg-white" />
                    </div>
                  ))
                ) : paginatedRows.length ? (
                  paginatedRows.map((row) => (
                    <div
                      key={row.key}
                      className="grid gap-4 px-3 py-4 text-sm font-black md:grid-cols-[64px_1.4fr_1.4fr_.7fr_.7fr_100px_90px] md:items-center"
                    >
                      <div className="h-11 w-11 rounded-full bg-white" />

                      <div className="text-white">{row.traineeName}</div>

                      <div className="break-words text-white/90">{row.email}</div>

                      <div className="text-white/90">{row.course}</div>

                      <div className="text-white/90">Status</div>

                      <div>
                        <StatusPill row={row} />
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewModalRow(row)}
                        className="inline-flex min-w-[84px] justify-center rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#2d5038] transition hover:bg-[#eef1e7]"
                      >
                        View
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-12 text-center text-sm font-bold text-white/80">
                    No trainees found for this course.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between px-2 text-base font-bold">
              <div>
                Page {page} / {totalPages}
              </div>

              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="text-3xl leading-none text-white disabled:opacity-30"
                  aria-label="Previous page"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="font-black text-white disabled:opacity-30"
                >
                  Next Page
                </button>

                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="text-3xl leading-none text-white disabled:opacity-30"
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      <div className={modalBackdropClasses(createModalOpen)}>
        <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white text-[#395345] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#e8ece2] px-6 py-4">
            <div>
              <h3 className="text-xl font-black">Create Attendance</h3>
              <p className="mt-1 text-sm text-[#627165]">
                Attendance Date: {postingAttendanceDate}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="rounded-full border border-[#d7ddd0] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#395345]"
            >
              Close
            </button>
          </div>

          <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
                  Upload Open At
                </label>
                <input
                  type="datetime-local"
                  value={uploadOpenAt}
                  onChange={(e) => setUploadOpenAt(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
                  Upload Close At
                </label>
                <input
                  type="datetime-local"
                  value={uploadCloseAt}
                  onChange={(e) => setUploadCloseAt(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <SummaryCard label="Total Trainees" value={postingMergedRows.length} />
              <SummaryCard
                label="Already Posted"
                value={postingMergedRows.filter((row) => row.hasExistingAttendance).length}
              />
              <SummaryCard
                label="Submitted Proof"
                value={postingMergedRows.filter((row) => row.hasProof).length}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {ATTENDANCE_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => applyBulkStatus(status)}
                  className="rounded-xl border border-[#c6ccb9] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#395345]"
                >
                  Set All {status}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {loadingPosting ? (
                <div className="rounded-2xl bg-[#f7f8f3] px-5 py-4 text-sm font-bold text-[#647166]">
                  Loading attendance rows...
                </div>
              ) : postingMergedRows.length ? (
                postingMergedRows.map((row) => {
                  const rowState = postRowsById[row.traineeId] || {
                    status: "Pending",
                    remarks: "",
                  };

                  return (
                    <div
                      key={row.traineeId}
                      className="rounded-[24px] bg-[#f9fbf7] p-5 ring-1 ring-[#e2e8da]"
                    >
                      <div className="grid gap-4 lg:grid-cols-[1fr_220px_1fr] lg:items-start">
                        <div>
                          <div className="text-lg font-black">{row.traineeName}</div>
                          <div className="mt-1 text-sm text-[#627165]">{row.email}</div>
                          <div className="mt-2 text-sm font-bold">{row.course}</div>
                        </div>

                        <div>
                          <label className="text-xs font-black uppercase tracking-[0.14em] text-[#6f7c71]">
                            Status
                          </label>
                          <select
                            value={rowState.status}
                            onChange={(e) =>
                              updatePostRow(row.traineeId, "status", e.target.value)
                            }
                            className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
                          >
                            {ATTENDANCE_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-black uppercase tracking-[0.14em] text-[#6f7c71]">
                            Remarks
                          </label>
                          <textarea
                            rows={3}
                            value={rowState.remarks}
                            onChange={(e) =>
                              updatePostRow(row.traineeId, "remarks", e.target.value)
                            }
                            placeholder="Optional remarks"
                            className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl bg-[#f7f8f3] px-5 py-4 text-sm font-bold text-[#647166]">
                  No trainees available for attendance creation.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl border border-[#c6ccb9] bg-white px-5 py-3 text-sm font-black text-[#395345]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitBulkAttendance}
                disabled={postingAttendance || !postingMergedRows.length}
                className="rounded-xl bg-[#395345] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {postingAttendance ? "Creating..." : "Submit Attendance"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={modalBackdropClasses(Boolean(viewModalRow))}>
        <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white text-[#395345] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#e8ece2] px-6 py-4">
            <div>
              <h3 className="text-xl font-black">Attendance Details</h3>
              <p className="mt-1 text-sm text-[#627165]">
                {viewModalRow?.traineeName || "-"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setViewModalRow(null)}
              className="rounded-full border border-[#d7ddd0] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#395345]"
            >
              Close
            </button>
          </div>

          <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-6">
            {viewModalRow ? (
              <>
                <div className="mb-5 grid gap-4 md:grid-cols-3">
                  <SummaryCard label="Course" value={viewModalRow.course} />
                  <SummaryCard label="Status" value={viewModalRow.status} />
                  <SummaryCard
                    label="Uploaded At"
                    value={
                      viewModalRow.hasProof
                        ? formatDateTime(viewModalRow.submittedAt)
                        : "-"
                    }
                  />
                </div>

                {viewModalRow.hasProof ? (
                  <>
                    <div className="mb-5 flex flex-wrap gap-3">
                      <a
                        href={buildProtectedFileUrl(viewModalRow.proofId)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm font-black text-[#395345]"
                      >
                        Open Original Proof
                      </a>

                      {viewModalRow.referencePhotoId ? (
                        <a
                          href={buildTrainingProtectedFileUrl(
                            viewModalRow.referencePhotoId
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm font-black text-[#395345]"
                        >
                          Open 2x2 Photo
                        </a>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleReview(viewModalRow, "approved", "Present")}
                        disabled={reviewingId === viewModalRow.attendanceId}
                        className="rounded-xl bg-green-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReview(viewModalRow, "rejected", "Absent")}
                        disabled={reviewingId === viewModalRow.attendanceId}
                        className="rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                      <div className="rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e2e8da]">
                        <div className="mb-3">
                          <div className="text-sm font-black">
                            Trainee 2x2 Reference
                          </div>
                          <div className="mt-1 text-xs text-[#627165]">
                            2X2 picture
                          </div>
                        </div>

                        {viewModalRow.referencePhotoId ? (
                          getPdfLike(viewModalRow.referencePhotoName, viewModalRow.referencePhotoMimeType) ? (
                            <iframe
                              src={buildTrainingProtectedFileUrl(
                                viewModalRow.referencePhotoId
                              )}
                              title={viewModalRow.referencePhotoName}
                              className="h-[520px] w-full rounded-2xl border border-[#d7ddd0]"
                            />
                          ) : getImageLike(viewModalRow.referencePhotoName, viewModalRow.referencePhotoMimeType) ? (
                            <div className="rounded-2xl bg-white p-3 ring-1 ring-[#e2e8da]">
                              <img
                                src={buildTrainingProtectedFileUrl(
                                  viewModalRow.referencePhotoId
                                )}
                                alt={viewModalRow.referencePhotoName}
                                className="h-[520px] w-full rounded-2xl object-contain"
                              />
                            </div>
                          ) : (
                            <div className="rounded-2xl bg-white p-6 text-sm text-[#627165] ring-1 ring-[#e2e8da]">
                              Preview is not available for this 2x2 file type.
                            </div>
                          )
                        ) : (
                          <div className="rounded-2xl bg-yellow-50 px-5 py-4 text-sm font-bold text-yellow-800 ring-1 ring-yellow-200">
                            No 2x2 photo uploaded for this trainee.
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e2e8da]">
                        <div className="mb-3">
                          <div className="text-sm font-black">
                            Uploaded Attendance Proof
                          </div>
                          <div className="mt-1 text-xs text-[#627165]">
                            {viewModalRow.proofFileName}
                          </div>
                        </div>

                        {getPdfLike(viewModalRow.proofFileName, viewModalRow.proofFileMimeType) ? (
                          <iframe
                            src={buildProtectedFileUrl(viewModalRow.proofId)}
                            title={viewModalRow.proofFileName}
                            className="h-[520px] w-full rounded-2xl border border-[#d7ddd0]"
                          />
                        ) : getImageLike(viewModalRow.proofFileName, viewModalRow.proofFileMimeType) ? (
                          <div className="rounded-2xl bg-white p-3 ring-1 ring-[#e2e8da]">
                            <img
                              src={buildProtectedFileUrl(viewModalRow.proofId)}
                              alt={viewModalRow.proofFileName}
                              className="h-[520px] w-full rounded-2xl object-contain"
                            />
                          </div>
                        ) : (
                          <div className="rounded-2xl bg-white p-6 text-sm text-[#627165] ring-1 ring-[#e2e8da]">
                            Preview is not available for this file type. Open the
                            original proof instead.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl bg-yellow-50 px-5 py-4 text-sm font-bold text-yellow-800 ring-1 ring-yellow-200">
                    No proof has been submitted for this trainee yet.
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
// src/TrainingAndAssessment/TraineeAttendance.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  isTrainingAuthResponse,
  redirectToTraineeLogin,
} from "./trainingSession";
import { buildTrainingFileUrl } from "./trainingFileUrl";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";

  const r = String(raw).replace(/\/+$/, "");

  if (r.endsWith("/api/hotel")) {
    return r.replace(/\/api\/hotel$/i, "/api");
  }

  if (r.endsWith("/api")) return r;

  if (r.includes("/api/")) {
    return r.replace(/\/api\/hotel.*$/i, "/api");
  }

  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const API_ORIGIN = API_BASE.replace(/\/api$/i, "");

function authHeaders(extra = {}) {
  const token = localStorage.getItem("trainingToken") || "";

  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  };
}

function buildProtectedFileUrl(fileId = "") {
  const token = localStorage.getItem("trainingToken") || "";

  if (!fileId) return "#";

  if (!token) {
    return `${API_BASE}/files/${fileId}`;
  }

  return `${API_BASE}/files/${fileId}?token=${encodeURIComponent(token)}`;
}

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || "Invalid server response.");
  }
}

function normalizeSlashes(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/");
}

function getObjectIdString(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    if (value.$oid) return String(value.$oid);

    if (value.toString && value.toString() !== "[object Object]") {
      return String(value.toString());
    }
  }

  return "";
}

function getFilePath(file) {
  if (!file) return "";

  if (typeof file === "string") {
    return normalizeSlashes(file);
  }

  if (typeof file === "object") {
    return normalizeSlashes(
      file.filePath ||
        file.path ||
        file.url ||
        file.secure_url ||
        file.location ||
        file.file ||
        ""
    );
  }

  return "";
}

function getFileId(file) {
  if (!file || typeof file !== "object") return "";
  return getObjectIdString(file.fileId);
}

function buildFileUrl(file) {
  const fileId = getFileId(file);

  if (fileId) {
    return buildTrainingFileUrl(fileId);
  }

  const filePath = getFilePath(file);

  if (!filePath) return "";

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const fileIdMatch = filePath.match(/(?:^|\/)api\/training-files\/([^/?#]+)/i);

  if (fileIdMatch?.[1]) {
    return buildTrainingFileUrl(fileIdMatch[1]);
  }

  return `${API_ORIGIN}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
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

function formatCardDate(value) {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return value;
  }

  return d.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatCardTime(value) {
  if (!value) return "9AM";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "9AM";

  return d.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
  });
}

function badgeClass(status) {
  const s = String(status || "").toLowerCase();

  if (s === "approved" || s === "present" || s === "open") {
    return "bg-green-50 text-green-700 ring-green-200";
  }

  if (s === "rejected" || s === "absent" || s === "closed") {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  if (s === "late" || s === "not_open" || s === "pending") {
    return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  }

  return "bg-[#eef1e7] text-[#395345] ring-[#d9dfd2]";
}

function windowLabel(windowStatus) {
  if (windowStatus === "not_open") return "Not open yet";
  if (windowStatus === "closed") return "Closed";
  return "Open";
}

function getTimeValue(value) {
  if (!value) return 0;

  const t = new Date(value).getTime();

  return Number.isNaN(t) ? 0 : t;
}

function getRowSortTime(row) {
  return (
    getTimeValue(row?.createdAt) ||
    getTimeValue(row?.uploadOpenAt) ||
    getTimeValue(row?.attendanceDate)
  );
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("trainingUser") || "null");
  } catch {
    return null;
  }
}

function getFullName(user) {
  const direct =
    user?.fullName ||
    user?.name ||
    user?.traineeName ||
    user?.studentName ||
    "";

  if (direct) return direct;

  const firstName = user?.firstName || "";
  const middleName = user?.middleName || "";
  const lastName = user?.lastName || "";

  return [firstName, middleName, lastName].filter(Boolean).join(" ");
}

function getEmail(user) {
  return user?.email || user?.traineeEmail || user?.studentEmail || "";
}

function getAttendanceBucket(row) {
  const hasProof = Boolean(row?.proofFileId);
  const proofReview = String(row?.proofReviewStatus || "pending").toLowerCase();
  const windowStatus = String(row?.windowStatus || "open").toLowerCase();

  if (
    proofReview === "approved" ||
    proofReview === "present" ||
    row?.status === "approved" ||
    row?.status === "present"
  ) {
    return "completed";
  }

  if (windowStatus === "closed" && !hasProof) {
    return "past_due";
  }

  if (hasProof) {
    return "completed";
  }

  return "upcoming";
}

export default function TraineeAttendance() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [notesById, setNotesById] = useState({});
  const [filesById, setFilesById] = useState({});
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [selectedRow, setSelectedRow] = useState(null);
  const [user, setUser] = useState(() => getStoredUser());

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => getRowSortTime(b) - getRowSortTime(a));
  }, [rows]);

  const filteredRows = useMemo(() => {
    return sortedRows.filter((row) => getAttendanceBucket(row) === activeFilter);
  }, [sortedRows, activeFilter]);

  const counts = useMemo(() => {
    return sortedRows.reduce(
      (acc, row) => {
        acc[getAttendanceBucket(row)] += 1;
        return acc;
      },
      {
        upcoming: 0,
        past_due: 0,
        completed: 0,
      }
    );
  }, [sortedRows]);

  const traineeName = getFullName(user) || "Trainee Full Name";
  const traineeEmail = getEmail(user) || "traineeemail@tamsi.com";
  const profilePhotoUrl = buildFileUrl(user?.profilePhoto);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const goToProfile = () => {
    const token = localStorage.getItem("trainingToken");
    goTo(token ? "/trainee-profile" : "/trainee-login");
  };

  async function loadAttendance() {
    const token = localStorage.getItem("trainingToken") || "";

    if (!token) {
      redirectToTraineeLogin(navigate);
      return;
    }

    try {
      setLoading(true);
      setErr("");

      const savedUser = getStoredUser();

      if (savedUser) {
        setUser(savedUser);
      }

      const res = await fetch(`${API_BASE}/training/attendance`, {
        headers: authHeaders(),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Failed to load attendance.");
      }

      const nextRows = Array.isArray(data?.attendance) ? data.attendance : [];

      setRows(nextRows);

      if (data?.user || data?.trainee) {
        const nextUser = data.user || data.trainee;
        setUser(nextUser);
        localStorage.setItem("trainingUser", JSON.stringify(nextUser));
      }

      setNotesById((prev) => {
        const next = { ...prev };

        for (const row of nextRows) {
          if (typeof next[row.id] === "undefined") {
            next[row.id] = "";
          }
        }

        return next;
      });
    } catch (error) {
      setErr(error.message || "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttendance();
  }, []);

  function setNote(id, value) {
    setNotesById((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  function setFile(id, file) {
    setFilesById((prev) => ({
      ...prev,
      [id]: file || null,
    }));
  }

  async function submitProof(attendanceId) {
    try {
      setSubmittingId(attendanceId);
      setMsg("");
      setErr("");

      const proofFile = filesById[attendanceId];

      if (!proofFile) {
        throw new Error("Please choose a proof file first.");
      }

      const formData = new FormData();

      formData.append("attendanceId", attendanceId);
      formData.append("traineeProofNote", notesById[attendanceId] || "");
      formData.append("proofFile", proofFile);

      const res = await fetch(`${API_BASE}/training/attendance/proof`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Upload failed.");
      }

      setMsg(data?.message || "Attendance proof uploaded successfully.");

      setFilesById((prev) => ({
        ...prev,
        [attendanceId]: null,
      }));

      setNotesById((prev) => ({
        ...prev,
        [attendanceId]: "",
      }));

      const fileInput = document.getElementById(
        `attendance-proof-file-${attendanceId}`
      );

      if (fileInput) fileInput.value = "";

      setSelectedRow(null);
      await loadAttendance();
    } catch (error) {
      setErr(error.message || "Failed to upload attendance proof.");
    } finally {
      setSubmittingId("");
    }
  }

  return (
    <div className="min-h-screen bg-[#123a20] text-[#395345]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#d7ddcf] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => goTo("/trainee-home")}
            className="flex items-center gap-3"
            aria-label="TAMSI Home"
          >
            <img
              src="/TamsiLogo.png"
              alt="TAMSI Logo"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/80x80/d7ddd4/45674b?text=T";
              }}
            />

            <span className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b] sm:text-[28px]">
              TAMSI
            </span>
          </button>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
            <button
              type="button"
              onClick={() => goTo("/trainee-home")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-roadmap")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Roadmap
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-attendance")}
              className="border-b-2 border-[#45674b] pb-1 text-[11px] font-bold uppercase tracking-wide text-[#173d25] xl:text-[12px]"
            >
              Attendance
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-modules")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Modules
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-assignment")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Assignment
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-progress")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Progress
            </button>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={goToProfile}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Profile
            </button>

            <button
              type="button"
              onClick={goToProfile}
              className="h-10 w-10 overflow-hidden rounded-full bg-[#d8d8d8] ring-2 ring-[#45674b]/20"
              aria-label="Profile"
            >
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/80x80/d7ddd4/45674b?text=P";
                  }}
                />
              ) : (
                <img
                  src="https://placehold.co/80x80/d7ddd4/45674b?text=P"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-md border border-[#45674b]/20 bg-[#f7faf2] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#45674b] lg:hidden"
          >
            Menu
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#d7ddcf] bg-white px-5 py-3 lg:hidden">
            <div className="space-y-1 rounded-xl bg-[#f4f7ef] p-2">
              <button
                type="button"
                onClick={() => goTo("/trainee-home")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-roadmap")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Roadmap
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-attendance")}
                className="block w-full rounded-lg bg-white px-4 py-3 text-left text-sm font-bold text-[#173d25]"
              >
                Attendance
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-modules")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Modules
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-assignment")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Assignment
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-progress")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Progress
              </button>

              <button
                type="button"
                onClick={goToProfile}
                className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                <span>Profile</span>

                <span className="h-8 w-8 overflow-hidden rounded-full bg-[#d8d8d8]">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/80x80/d7ddd4/45674b?text=P";
                      }}
                    />
                  ) : (
                    <img
                      src="https://placehold.co/80x80/d7ddd4/45674b?text=P"
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* TRAINING BANNER */}
        <section className="relative flex h-[260px] items-center justify-center overflow-hidden bg-[#d7ded3] px-5 text-center sm:h-[310px] md:h-[360px] lg:h-[390px]">
          <img
            src="/TrainingBanner.png"
            alt="TAMSI Training Banner"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/1600x420/d7ddd4/45674b?text=TAMSI+Training+And+Assessment";
            }}
          />

          <div className="absolute inset-0 bg-[#d7ded3]/55" />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            <h1 className="font-['Montserrat',sans-serif] text-4xl font-extrabold leading-tight tracking-wide text-[#45674b] drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl">
              TAMSI Training And Assessment
            </h1>
          </div>
        </section>

        {/* TRAINEE + FILTER BAR */}
        <section className="bg-gradient-to-b from-[#486b4b] via-[#123a20] to-[#123a20] px-5 py-9 text-white sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-['Montserrat',sans-serif] text-2xl font-extrabold uppercase leading-tight text-white">
                {traineeName}
              </h1>

              <p className="mt-1 text-sm font-semibold text-white/85">
                {traineeEmail}
              </p>

              <div className="mt-3 h-[2px] w-[250px] max-w-full rounded-full bg-white/45" />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:w-[560px]">
              <FilterButton
                active={activeFilter === "upcoming"}
                label="Upcoming"
                count={counts.upcoming}
                onClick={() => setActiveFilter("upcoming")}
              />

              <FilterButton
                active={activeFilter === "past_due"}
                label="Past Due"
                count={counts.past_due}
                onClick={() => setActiveFilter("past_due")}
              />

              <FilterButton
                active={activeFilter === "completed"}
                label="Completed"
                count={counts.completed}
                onClick={() => setActiveFilter("completed")}
              />
            </div>
          </div>
        </section>

        {/* ATTENDANCE CARDS */}
        <section className="bg-[#2e5038] px-5 py-14 text-white sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1280px]">
            {msg ? (
              <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 ring-1 ring-green-200">
                {msg}
              </div>
            ) : null}

            {err ? (
              <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 ring-1 ring-red-200">
                {err}
              </div>
            ) : null}

            {loading ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl">
                Loading attendance records...
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl">
                No {activeFilter.replace("_", " ")} attendance records.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
                {filteredRows.map((row) => {
                  const hasProof = Boolean(row.proofFileId);
                  const proofReview = String(
                    row.proofReviewStatus || "pending"
                  ).toLowerCase();
                  const windowStatus = String(
                    row.windowStatus || "open"
                  ).toLowerCase();

                  const canSubmit =
                    row.canUpload &&
                    proofReview !== "approved" &&
                    windowStatus !== "closed";

                  return (
                    <div
                      key={row.id}
                      className="flex min-h-[120px] items-center gap-5 rounded-lg bg-white px-6 py-5 text-[#45674b] shadow-xl"
                    >
                      <PaperIcon />

                      <div className="min-w-0 flex-1">
                        <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold uppercase leading-none text-[#45674b]">
                          Attendance
                        </h2>

                        <p className="mt-1 text-sm font-extrabold text-[#45674b]/85">
                          {formatCardDate(row.attendanceDate || row.createdAt)}
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#45674b]/75">
                          Due today {formatCardTime(row.uploadCloseAt)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ring-1 ${badgeClass(
                              proofReview
                            )}`}
                          >
                            {proofReview}
                          </span>

                          {hasProof ? (
                            <a
                              href={buildProtectedFileUrl(row.proofFileId)}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full bg-[#eef1e7] px-3 py-1 text-[10px] font-extrabold uppercase text-[#45674b] ring-1 ring-[#d9dfd2] hover:bg-[#e4eadc]"
                            >
                              View Proof
                            </a>
                          ) : null}
                        </div>
                      </div>

                      <div className="self-end">
                        <button
                          type="button"
                          onClick={() => setSelectedRow(row)}
                          className="min-w-[100px] rounded-full border-[3px] border-[#45674b] bg-white px-5 py-1 font-['Montserrat',sans-serif] text-xs font-extrabold uppercase text-[#45674b] transition hover:bg-[#45674b] hover:text-white"
                        >
                          {canSubmit ? "Submit" : "View"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="h-[55px] bg-[#123a20]" />
      </main>

      <AttendanceModal
        row={selectedRow}
        note={selectedRow ? notesById[selectedRow.id] ?? "" : ""}
        file={selectedRow ? filesById[selectedRow.id] : null}
        submitting={selectedRow ? submittingId === selectedRow.id : false}
        onClose={() => setSelectedRow(null)}
        onNoteChange={(value) => selectedRow && setNote(selectedRow.id, value)}
        onFileChange={(file) => selectedRow && setFile(selectedRow.id, file)}
        onSubmit={() => selectedRow && submitProof(selectedRow.id)}
      />

      {/* SMALLER FOOTER */}
      <footer className="bg-white text-[#4d6f55]">
        <div className="mx-auto max-w-[1440px] px-5 py-3 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.05fr_1.05fr_1.3fr_1fr_0.65fr]">
            <div className="border-[#d6ded2] md:border-r md:pr-5">
              <div className="flex items-center gap-3">
                <img
                  src="/TamsiLogo.png"
                  alt="TAMSI Logo"
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/80x80/ffffff/4d6f55?text=T";
                  }}
                />

                <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b]">
                  TAMSI
                </h2>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">Menu</h3>

              <div className="mt-1 grid grid-cols-2 gap-x-5 gap-y-0.5 text-[11px] font-semibold text-[#6b776d]">
                <button
                  type="button"
                  onClick={() => goTo("/trainee-home")}
                  className="text-left hover:text-[#173d25]"
                >
                  Home
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-roadmap")}
                  className="text-left hover:text-[#173d25]"
                >
                  Roadmap
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-attendance")}
                  className="text-left hover:text-[#173d25]"
                >
                  Attendance
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-modules")}
                  className="text-left hover:text-[#173d25]"
                >
                  Modules
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-assignment")}
                  className="text-left hover:text-[#173d25]"
                >
                  Assignment
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-progress")}
                  className="text-left hover:text-[#173d25]"
                >
                  Progress
                </button>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Contact Information
              </h3>

              <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
                <p>ltc.tamsi@gmail.com</p>
                <p>lorengladis@ltcmultiservices.com</p>
                <p>09959808051 / 09516281271</p>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">Address</h3>

              <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
                <p>2/F 5441 Curie Street,</p>
                <p>Palanan, Makati City</p>
              </div>
            </div>

            <div className="md:pl-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Follow Us
              </h3>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-1 border-t border-[#d6ded2] pt-2 text-[9px] font-bold text-[#7b897e] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FilterButton({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-[30px] rounded-full border-2 px-5 font-['Montserrat',sans-serif] text-xs font-extrabold uppercase transition",
        active
          ? "border-white bg-white text-[#45674b] shadow-md"
          : "border-white bg-white/95 text-[#45674b] hover:bg-white",
      ].join(" ")}
    >
      {label} {count ? `(${count})` : ""}
    </button>
  );
}

function PaperIcon() {
  return (
    <svg
      viewBox="0 0 90 90"
      className="h-16 w-16 shrink-0 text-[#8a936e]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28 18H58L68 28V68C68 70.2 66.2 72 64 72H28C25.8 72 24 70.2 24 68V22C24 19.8 25.8 18 28 18Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M58 18V29H68"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M19 25H53L61 33V75"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.75"
      />

      <path
        d="M34 36H55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M34 46H55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M34 56H50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M29 36L31 38L34 34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M29 46L31 48L34 44"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M29 56L31 58L34 54"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AttendanceModal({
  row,
  note,
  file,
  submitting,
  onClose,
  onNoteChange,
  onFileChange,
  onSubmit,
}) {
  if (!row) return null;

  const hasProof = Boolean(row.proofFileId);
  const proofReview = String(row.proofReviewStatus || "pending").toLowerCase();
  const windowStatus = String(row.windowStatus || "open").toLowerCase();

  const canUpload =
    row.canUpload && proofReview !== "approved" && windowStatus !== "closed";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 text-[#45674b] shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold uppercase">
              Attendance
            </h2>

            <p className="mt-1 text-sm font-bold">
              {formatCardDate(row.attendanceDate || row.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#45674b]/20 px-4 py-2 text-xs font-extrabold uppercase text-[#45674b] hover:bg-[#eef1e7]"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoBox label="Professor Posted" value={formatDateTime(row.createdAt)} />
          <InfoBox label="Upload Opens" value={formatDateTime(row.uploadOpenAt)} />
          <InfoBox label="Upload Closes" value={formatDateTime(row.uploadCloseAt)} />
          <InfoBox label="Upload Window" value={windowLabel(windowStatus)} />
          <InfoBox label="Status" value={row.status || "Pending"} />
          <InfoBox label="Proof Review" value={proofReview} />
        </div>

        {row.remarks ? (
          <div className="mt-4 rounded-2xl bg-[#f4f7ef] px-4 py-3 text-sm">
            <span className="font-extrabold">Professor remarks:</span>{" "}
            {row.remarks}
          </div>
        ) : null}

        {row.traineeProofNote ? (
          <div className="mt-4 rounded-2xl bg-[#f4f7ef] px-4 py-3 text-sm">
            <span className="font-extrabold">Your note:</span>{" "}
            {row.traineeProofNote}
          </div>
        ) : null}

        {row.proofReviewRemarks ? (
          <div className="mt-4 rounded-2xl bg-[#f4f7ef] px-4 py-3 text-sm">
            <span className="font-extrabold">Professor note:</span>{" "}
            {row.proofReviewRemarks}
          </div>
        ) : null}

        {hasProof ? (
          <div className="mt-5 rounded-2xl bg-[#f4f7ef] p-4">
            <p className="text-sm font-extrabold">Uploaded Proof</p>

            <a
              href={buildProtectedFileUrl(row.proofFileId)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-full border border-[#45674b] px-5 py-2 text-xs font-extrabold uppercase text-[#45674b] transition hover:bg-[#45674b] hover:text-white"
            >
              View Uploaded File
            </a>
          </div>
        ) : null}

        {windowStatus === "not_open" ? (
          <div className="mt-5 rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800 ring-1 ring-yellow-200">
            The upload window is not open yet.
          </div>
        ) : null}

        {windowStatus === "closed" ? (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800 ring-1 ring-red-200">
            The upload window is already closed.
          </div>
        ) : null}

        {proofReview === "approved" ? (
          <div className="mt-5 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-800 ring-1 ring-green-200">
            This attendance proof is already approved.
          </div>
        ) : null}

        {canUpload ? (
          <div className="mt-5 rounded-2xl border border-[#d6ded2] bg-white p-4">
            <h3 className="text-sm font-extrabold uppercase">
              Upload Attendance Proof
            </h3>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold">Upload Proof</label>

              <input
                id={`attendance-proof-file-${row.id}`}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none"
              />

              {file?.name ? (
                <p className="mt-2 text-xs font-semibold text-[#45674b]/80">
                  Selected: {file.name}
                </p>
              ) : null}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold">
                Note for Professor
              </label>

              <textarea
                rows={4}
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="Optional note about your uploaded attendance proof."
                className="w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none"
              />
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="mt-4 rounded-full bg-[#45674b] px-6 py-3 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-[#2f463a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Uploading..." : "Upload Attendance Proof"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f4f7ef] px-4 py-3">
      <p className="text-[11px] font-extrabold uppercase text-[#45674b]/70">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-[#45674b]">{value}</p>
    </div>
  );
}
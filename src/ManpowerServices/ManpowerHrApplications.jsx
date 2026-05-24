import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

function getHrToken() {
  return localStorage.getItem("manpowerHrToken") || "";
}

function getHrUser() {
  try {
    return JSON.parse(localStorage.getItem("manpowerHrUser") || "null");
  } catch {
    return null;
  }
}

function clearHrSession() {
  localStorage.removeItem("manpowerHrToken");
  localStorage.removeItem("manpowerHrUser");
}

function hrHeaders(extra = {}) {
  const token = getHrToken();

  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
}

function getApplicantName(app) {
  return (
    [app?.firstName, app?.middleName, app?.lastName]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() || "Name"
  );
}

function getApplicantInitials(app) {
  const first = String(app?.firstName || getApplicantName(app).split(/\s+/)[0] || "").trim();
  const last = String(app?.lastName || getApplicantName(app).split(/\s+/).slice(-1)[0] || "").trim();
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  return initials || "AP";
}

function getStatusChipClass(status = "") {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "HIRED") {
    return "bg-[#bdf0a8] text-[#244b35]";
  }

  if (normalized === "REJECTED") {
    return "bg-[#f4c8c8] text-[#7c3232]";
  }

  if (normalized === "INTERVIEW_SCHEDULED") {
    return "bg-[#d5e7ff] text-[#244b92]";
  }

  if (normalized === "INTERVIEWED") {
    return "bg-[#eadfff] text-[#6941c6]";
  }

  if (normalized === "FOR_REVIEW") {
    return "bg-[#ffe4ba] text-[#8a5206]";
  }

  return "bg-[#eef3ea] text-[#395345]";
}

function getScreeningStatusChipClass(status = "") {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "likely_valid") {
    return "bg-[#e8f4ed] text-[#246843]";
  }

  if (normalized === "needs_manual_review") {
    return "bg-[#fff4e8] text-[#b54708]";
  }

  if (normalized === "suspicious") {
    return "bg-[#faecec] text-[#8b3232]";
  }

  if (normalized === "unreadable") {
    return "bg-[#f2f4f7] text-[#475467]";
  }

  return "bg-[#eef3ea] text-[#395345]";
}

function getResumeScreeningChipClass(status = "") {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "strong_match") {
    return "bg-[#e8f4ed] text-[#246843]";
  }

  if (normalized === "possible_match") {
    return "bg-[#eef4ff] text-[#244b92]";
  }

  if (normalized === "weak_match") {
    return "bg-[#fff4e8] text-[#b54708]";
  }

  if (normalized === "manual_review") {
    return "bg-[#f2f4f7] text-[#475467]";
  }

  return "bg-[#eef3ea] text-[#395345]";
}

function getAiConnectionChipClass(status = "") {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "connected") {
    return "bg-[#e8f4ed] text-[#246843]";
  }

  if (normalized === "missing_key" || normalized === "error") {
    return "bg-[#faecec] text-[#8b3232]";
  }

  if (normalized === "not_supported") {
    return "bg-[#fff4e8] text-[#b54708]";
  }

  return "bg-[#eef3ea] text-[#395345]";
}

function getRiskChipClass(risk = "") {
  const normalized = String(risk || "").toLowerCase();

  if (normalized === "low") {
    return "bg-[#e8f4ed] text-[#246843]";
  }

  if (normalized === "medium") {
    return "bg-[#fff4e8] text-[#b54708]";
  }

  if (normalized === "high") {
    return "bg-[#faecec] text-[#8b3232]";
  }

  return "bg-[#eef3ea] text-[#395345]";
}

function prettifyValue(value = "") {
  return String(value || "-")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function renderStringList(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return <span>-</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#395345] ring-1 ring-[#dfe8dd]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function getAssessmentChipClass(status = "", passed = false) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "completed" && passed) {
    return "bg-[#e8f4ed] text-[#246843]";
  }

  if (normalized === "completed" && !passed) {
    return "bg-[#faecec] text-[#8b3232]";
  }

  if (normalized === "in_progress") {
    return "bg-[#eef4ff] text-[#244b92]";
  }

  return "bg-[#eef3ea] text-[#395345]";
}

function prettifyReviewDecision(value = "") {
  const normalized = String(value || "").trim();

  if (!normalized) return "-";

  return normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getRequirementRows(application) {
  const requirements = application?.requirements || {};

  return Object.entries(requirements).filter(
    ([, value]) => value?.filename || value?.originalName || value?.fileId
  );
}

const REQUIREMENT_LABELS = {
  validId: "Valid ID",
  resume: "Resume",
  nbi: "NBI Clearance",
  barangayClearance: "Barangay Clearance",
  sss: "SSS",
  philhealth: "PhilHealth",
  pagibig: "Pag-IBIG",
  tin: "TIN",
  transcriptOfRecords: "Transcript of Records",
  diploma: "Diploma",
  birthCertificate: "Birth Certificate",
  photo1x1: "1x1 Picture",
  photo2x2: "2x2 Picture",
};

function getRequirementLabel(key = "") {
  return REQUIREMENT_LABELS[key] || prettifyValue(key);
}

function getRequirementFileName(key = "", fileMeta = {}) {
  return (
    fileMeta?.originalName ||
    fileMeta?.filename ||
    `${getRequirementLabel(key)} file`
  );
}

function formatCount(value) {
  return String(value || 0).padStart(2, "0");
}

function formatScore(value) {
  const score = Number(value || 0);
  return Number.isFinite(score) ? `${Math.round(score)}%` : "0%";
}

function getResumeScoreValue(app) {
  const score = Number(app?.resumeScreening?.score ?? app?.resumeScore ?? 0);
  return Number.isFinite(score) ? score : 0;
}

function SidebarIcon({ type }) {
  const common = "h-4 w-4";

  if (type === "applicants") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-8 0v2" />
        <circle cx="12" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 8v6M23 11h-6" />
      </svg>
    );
  }

  if (type === "payroll") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h4M15 15h2" />
      </svg>
    );
  }

  if (type === "leave") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4M16 2v4M3 10h18" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m8 15 2.4 2.4L16 12" />
      </svg>
    );
  }

  if (type === "billing") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6M9 11h6M9 15h3" />
      </svg>
    );
  }

  if (type === "logout") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m16 17 5-5-5-5M21 12H9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}


function ApplicantActionIcon({ type }) {
  const common = "h-4 w-4";

  if (type === "view") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  if (type === "ai") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    );
  }

  if (type === "schedule") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4M16 2v4M3 10h18" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 15 2 2 4-5" />
      </svg>
    );
  }

  if (type === "hire") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-8 0v2" />
        <circle cx="12" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m17 11 2 2 4-4" />
      </svg>
    );
  }

  return null;
}

function SidebarButton({ active = false, children, onClick, icon = "dashboard" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[52px] w-full items-center gap-4 rounded-[26px] px-6 text-left text-[13px] font-black tracking-tight transition duration-300 ${
        active
          ? "bg-white text-[#071f14] shadow-[0_18px_38px_rgba(0,0,0,0.20)]"
          : "text-white hover:translate-x-1 hover:bg-white/10"
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center transition duration-300 ${
          active
            ? "text-[#071f14]"
            : "text-white/85 group-hover:text-[#f4d484]"
        }`}
      >
        <SidebarIcon type={icon} />
      </span>
      <span className="min-w-0 flex-1 leading-tight">{children}</span>
    </button>
  );
}

function SummaryCard({ title, value, tone = "green" }) {
  const valueColor =
    tone === "red"
      ? "text-[#9d2f2f]"
      : tone === "gold"
      ? "text-[#bd6b00]"
      : "text-[#071f14]";

  return (
    <div className="group relative min-h-[132px] overflow-hidden rounded-3xl border border-white/80 bg-white p-6 text-left shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(8,39,25,0.16)]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-14 -right-12 h-36 w-36 rounded-full bg-[#f4d484]/20 blur-2xl transition group-hover:scale-110" />
      <p className="relative text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
        {title}
      </p>
      <p className={`relative mt-4 text-4xl font-black leading-none tracking-tight ${valueColor}`}>
        {formatCount(value)}
      </p>
    </div>
  );
}

function SectionCard({ eyebrow, title, children, className = "", right = null }) {
  return (
    <section className={`relative overflow-hidden rounded-3xl border border-white/80 bg-white text-[#071f14] shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 ${className}`}>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-[#f4d484]/20 blur-2xl" />
      <div className="relative p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="shrink-0">
            {eyebrow ? (
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-2 whitespace-nowrap text-2xl font-black tracking-tight text-[#071f14]">
                {title}
              </h2>
            ) : null}
          </div>
          {right ? <div className="w-full xl:flex-1">{right}</div> : null}
        </div>
        <div className={title || eyebrow ? "mt-5" : ""}>{children}</div>
      </div>
    </section>
  );
}

export default function ManpowerHrApplications() {
  const navigate = useNavigate();

  const [token, setToken] = useState(getHrToken());
  const [hrUser] = useState(getHrUser());

  const [applications, setApplications] = useState([]);
  const [screeningSummary, setScreeningSummary] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [vacancyFilter, setVacancyFilter] = useState("");
  const [resumeStatusFilter, setResumeStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("resume_score");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);

  const [selectedApp, setSelectedApp] = useState(null);
  const [activeModal, setActiveModal] = useState("");
  const [loadingApplication, setLoadingApplication] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [screeningActionId, setScreeningActionId] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    scheduledAt: "",
    location: "",
    interviewer: "",
    remarks: "",
  });

  const [hireForm, setHireForm] = useState({
    deploymentSite: "",
    regionCode: "NCR",
    dailyRate: "",
    hrNotes: "",
  });

  const [rejectForm, setRejectForm] = useState({
    hrNotes: "",
  });

  const [idPreviewUrl, setIdPreviewUrl] = useState("");
  const [idPreviewMimeType, setIdPreviewMimeType] = useState("");
  const [idPreviewLoading, setIdPreviewLoading] = useState(false);
  const [idPreviewError, setIdPreviewError] = useState("");

  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [requirementPreviewUrl, setRequirementPreviewUrl] = useState("");
  const [requirementPreviewMimeType, setRequirementPreviewMimeType] = useState("");
  const [requirementPreviewLoading, setRequirementPreviewLoading] = useState(false);
  const [requirementPreviewError, setRequirementPreviewError] = useState("");

  const previewObjectUrlRef = useRef("");
  const requirementPreviewObjectUrlRef = useRef("");

  const itemsPerPage = 5;

  const hrEmail =
    hrUser?.email ||
    hrUser?.companyEmail ||
    hrUser?.username ||
    "traineeemail@tamsi.com";

  function logout() {
    clearHrSession();
    setToken("");
    navigate("/manpower-hr-login", { replace: true });
  }

  function revokePreviewUrl() {
    if (previewObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      } catch {
        // ignore cleanup error
      }

      previewObjectUrlRef.current = "";
    }
  }

  function clearIdPreviewState() {
    revokePreviewUrl();
    setIdPreviewUrl("");
    setIdPreviewMimeType("");
    setIdPreviewLoading(false);
    setIdPreviewError("");
  }

  function revokeRequirementPreviewUrl() {
    if (requirementPreviewObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(requirementPreviewObjectUrlRef.current);
      } catch {
        // ignore cleanup error
      }

      requirementPreviewObjectUrlRef.current = "";
    }
  }

  function clearRequirementPreviewState() {
    revokeRequirementPreviewUrl();
    setSelectedRequirement(null);
    setRequirementPreviewUrl("");
    setRequirementPreviewMimeType("");
    setRequirementPreviewLoading(false);
    setRequirementPreviewError("");
  }

  useEffect(() => {
    return () => {
      revokePreviewUrl();
      revokeRequirementPreviewUrl();
    };
  }, []);

  useEffect(() => {
    loadVacancies();
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/manpower-hr-login", { replace: true });
      return;
    }

    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter, vacancyFilter, resumeStatusFilter, sortBy, navigate]);

  async function loadVacancies() {
    try {
      const res = await fetch(`${API_BASE}/manpower/vacancies`);
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const list = Array.isArray(data?.vacancies) ? data.vacancies : [];
        setVacancies(list.filter(Boolean));
      }
    } catch {
      setVacancies([]);
    }
  }

  async function loadApplications() {
    setLoadingList(true);

    try {
      const query = new URLSearchParams();

      if (statusFilter) {
        query.set("status", statusFilter);
      }

      if (vacancyFilter) {
        query.set("vacancy", vacancyFilter);
      }

      if (resumeStatusFilter) {
        query.set("resumeStatus", resumeStatusFilter);
      }

      if (sortBy) {
        query.set("sortBy", sortBy);
      }

      const queryString = query.toString();

      const url = queryString
        ? `${API_BASE}/manpower/hr/applications?${queryString}`
        : `${API_BASE}/manpower/hr/applications`;

      const res = await fetch(url, {
        headers: hrHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (res.ok) {
        setApplications(Array.isArray(data.applications) ? data.applications : []);
        setScreeningSummary(
          Array.isArray(data.resumeScreeningSummary)
            ? data.resumeScreeningSummary
            : []
        );
        setPage(1);
      }
    } finally {
      setLoadingList(false);
    }
  }

  async function loadValidIdPreview(applicationId) {
    if (!applicationId) {
      clearIdPreviewState();
      return;
    }

    setIdPreviewLoading(true);
    setIdPreviewError("");

    try {
      const res = await fetch(
        `${API_BASE}/manpower/hr/applications/${applicationId}/requirement/validId`,
        {
          headers: hrHeaders(),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to load valid ID preview.");
      }

      const blob = await res.blob();

      const mimeType =
        res.headers.get("Content-Type") || blob.type || "application/octet-stream";

      revokePreviewUrl();

      const objectUrl = URL.createObjectURL(blob);
      previewObjectUrlRef.current = objectUrl;

      setIdPreviewUrl(objectUrl);
      setIdPreviewMimeType(mimeType);
    } catch (error) {
      clearIdPreviewState();
      setIdPreviewError(error?.message || "Failed to load valid ID preview.");
    } finally {
      setIdPreviewLoading(false);
    }
  }

  async function openRequirementPreview(requirementKey, fileMeta = {}) {
    if (!selectedApp?._id || !requirementKey) return;

    clearRequirementPreviewState();

    setSelectedRequirement({
      key: requirementKey,
      label: getRequirementLabel(requirementKey),
      fileName: getRequirementFileName(requirementKey, fileMeta),
      meta: fileMeta || {},
    });
    setActiveModal("requirement");
    setRequirementPreviewLoading(true);
    setRequirementPreviewError("");

    try {
      const res = await fetch(
        `${API_BASE}/manpower/hr/applications/${selectedApp._id}/requirement/${requirementKey}`,
        {
          headers: hrHeaders(),
        }
      );

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to load uploaded requirement.");
      }

      const blob = await res.blob();
      const mimeType =
        res.headers.get("Content-Type") ||
        blob.type ||
        fileMeta?.mimetype ||
        "application/octet-stream";

      revokeRequirementPreviewUrl();

      const objectUrl = URL.createObjectURL(blob);
      requirementPreviewObjectUrlRef.current = objectUrl;

      setRequirementPreviewUrl(objectUrl);
      setRequirementPreviewMimeType(mimeType);
    } catch (error) {
      setRequirementPreviewError(
        error?.message || "Failed to load uploaded requirement."
      );
    } finally {
      setRequirementPreviewLoading(false);
    }
  }

  function backToApplicantDetails() {
    clearRequirementPreviewState();
    setActiveModal("view");
  }

  async function loadApplicationDetails(applicationId, mode = "view") {
    if (!applicationId) return;

    setActiveModal(mode);
    setSelectedApp(null);
    clearIdPreviewState();
    clearRequirementPreviewState();
    setLoadingApplication(true);

    try {
      const res = await fetch(
        `${API_BASE}/manpower/hr/applications/${applicationId}`,
        {
          headers: hrHeaders(),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load application details.");
      }

      const application = data?.application || null;

      setSelectedApp(application);

      if (mode === "schedule") {
        setScheduleForm({
          scheduledAt: application?.interview?.scheduledAt
            ? new Date(application.interview.scheduledAt)
                .toISOString()
                .slice(0, 16)
            : "",
          location: application?.interview?.location || "",
          interviewer: application?.interview?.interviewer || "",
          remarks: application?.interview?.remarks || "",
        });
      } else {
        setScheduleForm({
          scheduledAt: "",
          location: "",
          interviewer: "",
          remarks: "",
        });
      }

      if (mode === "hire") {
        setHireForm({
          deploymentSite: application?.deploymentSite || "",
          regionCode: application?.regionCode || "NCR",
          dailyRate: "",
          hrNotes: application?.hrNotes || "",
        });
      } else {
        setHireForm({
          deploymentSite: "",
          regionCode: "NCR",
          dailyRate: "",
          hrNotes: "",
        });
      }

      if (mode === "reject") {
        setRejectForm({
          hrNotes: application?.hrNotes || "",
        });
      } else {
        setRejectForm({
          hrNotes: "",
        });
      }

      if (mode === "view" && application?.requirements?.validId?.fileId) {
        await loadValidIdPreview(application._id);
      } else {
        clearIdPreviewState();
      }
    } catch (error) {
      setActiveModal("");
      setSelectedApp(null);
      clearIdPreviewState();
      alert(error?.message || "Failed to load application details.");
    } finally {
      setLoadingApplication(false);
    }
  }

  async function scheduleInterview() {
    if (!selectedApp?._id || actionSubmitting) return;

    setActionSubmitting(true);

    try {
      const res = await fetch(
        `${API_BASE}/manpower/hr/applications/${selectedApp._id}/schedule-interview`,
        {
          method: "POST",
          headers: {
            ...hrHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scheduleForm),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.message || "Failed to schedule interview.");
        return;
      }

      alert("Interview schedule sent to applicant email.");
      closeModal();
      loadApplications();
    } finally {
      setActionSubmitting(false);
    }
  }

  async function hireApplicant() {
    if (!selectedApp?._id || actionSubmitting) return;

    setActionSubmitting(true);

    try {
      const res = await fetch(
        `${API_BASE}/manpower/hr/applications/${selectedApp._id}/hire`,
        {
          method: "POST",
          headers: {
            ...hrHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...hireForm,
            dailyRate: Number(hireForm.dailyRate || 0),
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.message || "Failed to hire applicant.");
        return;
      }

      alert(
        `Applicant hired.\nCompany Email: ${data?.employee?.companyEmail || "-"}\nTemporary Password: ${data?.employee?.temporaryPassword || "-"}`
      );

      closeModal();
      loadApplications();
    } finally {
      setActionSubmitting(false);
    }
  }

  async function rejectApplicant(applicationId = selectedApp?._id) {
    if (!applicationId || actionSubmitting) return;

    setActionSubmitting(true);

    try {
      const res = await fetch(
        `${API_BASE}/manpower/hr/applications/${applicationId}/reject`,
        {
          method: "POST",
          headers: {
            ...hrHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hrNotes: rejectForm.hrNotes,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.message || "Failed to reject applicant.");
        return;
      }

      alert("Application marked as rejected.");
      closeModal();
      loadApplications();
    } finally {
      setActionSubmitting(false);
    }
  }

  async function rescreenResume(applicationId, options = {}) {
    if (!applicationId) return false;

    const skipConfirm = Boolean(options?.skipConfirm);

    if (!skipConfirm) {
      const confirmed = window.confirm(
        "Run AI resume screening again for this applicant? This will use the stored resume file and the selected job vacancy."
      );

      if (!confirmed) return false;
    }

    setScreeningActionId(applicationId);

    try {
      const res = await fetch(
        `${API_BASE}/manpower/hr/applications/${applicationId}/rescreen-resume`,
        {
          method: "POST",
          headers: hrHeaders(),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to screen applicant resume.");
      }

      alert("Resume screening updated successfully.");

      if (selectedApp?._id === applicationId && activeModal === "view") {
        await loadApplicationDetails(applicationId, "view");
      }

      loadApplications();
      return true;
    } catch (error) {
      alert(error?.message || "Failed to screen applicant resume.");
      return false;
    } finally {
      setScreeningActionId("");
    }
  }

  function closeModal() {
    setSelectedApp(null);
    setActiveModal("");
    setLoadingApplication(false);
    setActionSubmitting(false);
    setScheduleForm({
      scheduledAt: "",
      location: "",
      interviewer: "",
      remarks: "",
    });
    setHireForm({
      deploymentSite: "",
      regionCode: "NCR",
      dailyRate: "",
      hrNotes: "",
    });
    setRejectForm({
      hrNotes: "",
    });
    clearIdPreviewState();
    clearRequirementPreviewState();
  }

  const summary = useMemo(() => {
    return {
      totalApplicants: applications.length,
      pending: applications.filter((row) => row.status === "PENDING").length,
      interviewScheduled: applications.filter(
        (row) => row.status === "INTERVIEW_SCHEDULED"
      ).length,
      forReview: applications.filter((row) => row.status === "FOR_REVIEW")
        .length,
      totalEmployees: applications.filter((row) => row.status === "HIRED")
        .length,
      interviewed: applications.filter((row) => row.status === "INTERVIEWED")
        .length,
      hired: applications.filter((row) => row.status === "HIRED").length,
      rejected: applications.filter((row) => row.status === "REJECTED").length,
    };
  }, [applications]);

  const resumeStats = useMemo(() => {
    const scores = applications.map(getResumeScoreValue).filter((score) => score > 0);

    return {
      strongMatches: applications.filter(
        (row) => row?.resumeScreening?.status === "strong_match"
      ).length,
      possibleMatches: applications.filter(
        (row) => row?.resumeScreening?.status === "possible_match"
      ).length,
      averageScore: scores.length
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0,
      topScore: scores.length ? Math.max(...scores) : 0,
    };
  }, [applications]);

  const activeScreeningSummary = useMemo(() => {
    if (!vacancyFilter) return screeningSummary;
    return screeningSummary.filter((row) => row.vacancy === vacancyFilter);
  }, [screeningSummary, vacancyFilter]);

  const filteredApplications = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    const matchedApplications = applications.filter((app) => {
      const resumeStatus = app?.resumeScreening?.status || "not_screened";
      const haystack = [
        getApplicantName(app),
        app?.vacancy,
        app?.email,
        app?.contactNo,
        app?.status,
        app?.idVerification?.confidenceScore,
        app?.resumeScreening?.score,
        app?.assessment?.percentage,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesStatus = !statusFilter || app?.status === statusFilter;
      const matchesVacancy = !vacancyFilter || app?.vacancy === vacancyFilter;
      const matchesResumeStatus = !resumeStatusFilter || resumeStatus === resumeStatusFilter;

      return matchesKeyword && matchesStatus && matchesVacancy && matchesResumeStatus;
    });

    return [...matchedApplications].sort((a, b) => {
      const aScore = getResumeScoreValue(a);
      const bScore = getResumeScoreValue(b);
      const aDate = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b?.createdAt ? new Date(b.createdAt).getTime() : 0;

      if (sortBy === "lowest_score") return aScore - bScore;
      if (sortBy === "newest") return bDate - aDate;
      if (sortBy === "oldest") return aDate - bDate;

      return bScore - aScore;
    });
  }, [applications, searchValue, statusFilter, vacancyFilter, resumeStatusFilter, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, vacancyFilter, resumeStatusFilter, sortBy, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / itemsPerPage));

  const pagedApplications = filteredApplications.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const requirementRows = getRequirementRows(selectedApp);
  const validIdRow = selectedApp?.requirements?.validId || null;

  const canShowImagePreview =
    Boolean(idPreviewUrl) && String(idPreviewMimeType || "").startsWith("image/");

  const canShowRequirementImagePreview =
    Boolean(requirementPreviewUrl) &&
    String(requirementPreviewMimeType || "").startsWith("image/");

  const canShowRequirementPdfPreview =
    Boolean(requirementPreviewUrl) &&
    String(requirementPreviewMimeType || "").toLowerCase().includes("pdf");

  const canShowRequirementTextPreview =
    Boolean(requirementPreviewUrl) &&
    String(requirementPreviewMimeType || "").toLowerCase().startsWith("text/");

  const modalTitle =
    activeModal === "schedule"
      ? "Schedule Interview"
      : activeModal === "hire"
      ? "Hire Applicant"
      : activeModal === "reject"
      ? "Reject Applicant"
      : activeModal === "ai"
      ? "AI Resume Screening"
      : activeModal === "requirement"
      ? "View Uploaded Requirement"
      : "Applicant Details";

  const modalWidthClass =
    activeModal === "view" || activeModal === "requirement"
      ? "max-w-6xl"
      : "max-w-2xl";

  return (
    <div className="min-h-screen bg-[#edf3ee] font-sans text-[#071f14]">
      <div className="grid min-h-screen lg:grid-cols-[270px_1fr]">
        <aside className="sticky top-0 flex h-screen min-h-screen w-full flex-col overflow-hidden bg-[#082719] px-7 py-9 text-white shadow-[18px_0_55px_rgba(7,31,20,0.28)]">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#f4d484]">
              Manpower Services HR
            </p>
            <h1 className="mt-3 text-[17px] font-black leading-tight tracking-tight text-white">
              LTC Manpower Services
            </h1>
          </div>

          <nav className="mt-12 flex-1 space-y-4">
            <SidebarButton icon="dashboard" onClick={() => navigate("/manpower-hr")}>
              Dashboard
            </SidebarButton>

            <SidebarButton
              active
              icon="applicants"
              onClick={() => navigate("/manpower-hr-applications")}
            >
              Manage Applicants
            </SidebarButton>

            <SidebarButton icon="payroll" onClick={() => navigate("/manpower-hr-payroll")}>
              Manage Payroll
            </SidebarButton>

            <SidebarButton icon="leave" onClick={() => navigate("/manpower-hr-leaves")}>
              Manage File Leave
            </SidebarButton>

            <SidebarButton icon="billing" onClick={() => navigate("/manpower-hr-billing")}>
              Manage Billing
            </SidebarButton>
          </nav>

          <div className="border-t border-white/15 pt-7">
            <button
              type="button"
              onClick={logout}
              className="group flex min-h-[52px] w-full items-center gap-4 rounded-[26px] bg-white/10 px-6 text-left text-[13px] font-black capitalize tracking-tight text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#f4d484] hover:text-[#071f14]"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center text-white/90 transition duration-300 group-hover:text-[#071f14]">
                <SidebarIcon type="logout" />
              </span>
              <span>Sign out</span>
            </button>
            <p className="mt-7 text-center text-[11px] font-bold text-white/55">
              © LTC Manpower Services
            </p>
          </div>
        </aside>

        <main className="min-w-0 px-5 py-6 lg:px-8">
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#071f14] via-[#174a30] to-[#315b42] p-7 text-white shadow-[0_30px_80px_rgba(8,39,25,0.18)] md:p-10">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#f4d484]/20 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f4d484]">
                  Manpower HR Center
                </p>
                <h1 className="mt-3 max-w-3xl text-[38px] font-black leading-[0.98] tracking-[-0.055em] md:text-[56px]">
                  Manage Applicants
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] font-semibold leading-7 text-white/75">
                  Review manpower applications, AI resume ranking, exam scores, interview status, and hiring actions in one professional dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={loadApplications}
                disabled={loadingList}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-7 text-[13px] font-black uppercase tracking-[0.08em] text-[#071f14] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:bg-[#f4d484] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingList ? "Refreshing..." : "Refresh Applicants"}
              </button>
            </div>
          </section>

          <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <button type="button" onClick={() => setStatusFilter("")}>
              <SummaryCard title="Total Applicants" value={summary.totalApplicants} />
            </button>

            <button type="button" onClick={() => setStatusFilter("PENDING")}>
              <SummaryCard title="Pending Approval" value={summary.pending} tone="gold" />
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("INTERVIEW_SCHEDULED")}
            >
              <SummaryCard
                title="Interview Scheduled"
                value={summary.interviewScheduled}
                tone="gold"
              />
            </button>

            <button type="button" onClick={() => setStatusFilter("FOR_REVIEW")}>
              <SummaryCard title="For Review" value={summary.forReview} />
            </button>

            <button type="button" onClick={() => setStatusFilter("HIRED")}>
              <SummaryCard title="Total Employees" value={summary.totalEmployees} />
            </button>

            <button type="button" onClick={() => setStatusFilter("INTERVIEWED")}>
              <SummaryCard title="Interviewed" value={summary.interviewed} />
            </button>

            <button type="button" onClick={() => setStatusFilter("HIRED")}>
              <SummaryCard title="Hired" value={summary.hired} />
            </button>

            <button type="button" onClick={() => setStatusFilter("REJECTED")}>
              <SummaryCard title="Rejected" value={summary.rejected} tone="red" />
            </button>
          </section>

          <SectionCard eyebrow="AI Ranking" title="Resume Screening Ranking" className="mt-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="max-w-3xl text-sm font-semibold leading-6 text-[#071f14]/60">
                  Applicants are ranked per selected job by AI resume score, match status, and exam percentage.
                  Choose a vacancy to see who is most qualified for that job.
                </p>
              </div>

              <div className="grid min-w-[280px] grid-cols-2 gap-3 text-center sm:grid-cols-4 lg:min-w-[520px]">
                <div className="rounded-2xl bg-[#f8fbf9] px-3 py-3 text-[#071f14]">
                  <p className="text-xs font-black uppercase">Strong</p>
                  <p className="text-2xl font-black">{resumeStats.strongMatches}</p>
                </div>
                <div className="rounded-2xl bg-[#f8fbf9] px-3 py-3 text-[#071f14]">
                  <p className="text-xs font-black uppercase">Possible</p>
                  <p className="text-2xl font-black">{resumeStats.possibleMatches}</p>
                </div>
                <div className="rounded-2xl bg-[#f8fbf9] px-3 py-3 text-[#071f14]">
                  <p className="text-xs font-black uppercase">Average</p>
                  <p className="text-2xl font-black">{formatScore(resumeStats.averageScore)}</p>
                </div>
                <div className="rounded-2xl bg-[#f8fbf9] px-3 py-3 text-[#071f14]">
                  <p className="text-xs font-black uppercase">Top</p>
                  <p className="text-2xl font-black">{formatScore(resumeStats.topScore)}</p>
                </div>
              </div>
            </div>

            {activeScreeningSummary.length > 0 && (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {activeScreeningSummary.slice(0, 4).map((row) => (
                  <div
                    key={row.vacancy}
                    className="rounded-2xl border border-[#d7e2da] bg-[#f8fbf9] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black">{row.vacancy}</h3>
                        <p className="mt-1 text-xs font-semibold text-[#071f14]/55">
                          {row.screenedApplicants}/{row.totalApplicants} screened • Avg {formatScore(row.averageScore)}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#082719] px-3 py-1 text-xs font-black text-white">
                        Top {formatScore(row.topScore)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-[#071f14]/70">
                      Best candidate: {row.topApplicant?.fullName || "No applicant yet"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            eyebrow="Applicant Records"
            title="List of Applicants"
            className="mt-7"
            right={
              <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(250px,1fr)_170px_190px_160px_48px] xl:items-center">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => {
                    setSearchValue(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search applicant, email, score..."
                  className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[13px] font-bold text-[#071f14] outline-none transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_rgba(8,39,25,0.08)] focus:border-[#d7a84d] focus:bg-white focus:shadow-[0_12px_28px_rgba(8,39,25,0.08)] sm:col-span-2 xl:col-span-1"
                />

                <select
                  value={vacancyFilter}
                  onChange={(event) => {
                    setVacancyFilter(event.target.value);
                    setPage(1);
                  }}
                  className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[12px] font-black text-[#071f14] outline-none transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_rgba(8,39,25,0.08)] focus:border-[#d7a84d] focus:bg-white focus:shadow-[0_12px_28px_rgba(8,39,25,0.08)]"
                >
                  <option value="">All Jobs</option>
                  {vacancies.map((vacancy) => (
                    <option key={vacancy} value={vacancy}>
                      {vacancy}
                    </option>
                  ))}
                </select>

                <select
                  value={resumeStatusFilter}
                  onChange={(event) => {
                    setResumeStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[12px] font-black text-[#071f14] outline-none transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_rgba(8,39,25,0.08)] focus:border-[#d7a84d] focus:bg-white focus:shadow-[0_12px_28px_rgba(8,39,25,0.08)]"
                >
                  <option value="">All Resume Status</option>
                  <option value="strong_match">Strong Match</option>
                  <option value="possible_match">Possible Match</option>
                  <option value="weak_match">Weak Match</option>
                  <option value="manual_review">Manual Review</option>
                  <option value="not_screened">Not Screened</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value);
                    setPage(1);
                  }}
                  className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[12px] font-black text-[#071f14] outline-none transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_rgba(8,39,25,0.08)] focus:border-[#d7a84d] focus:bg-white focus:shadow-[0_12px_28px_rgba(8,39,25,0.08)]"
                >
                  <option value="resume_score">Most Qualified</option>
                  <option value="lowest_score">Lowest Score</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>

                <button
                  type="button"
                  onClick={loadApplications}
                  disabled={loadingList}
                  title={loadingList ? "Loading applicants" : "Refresh applicants"}
                  aria-label={loadingList ? "Loading applicants" : "Refresh applicants"}
                  className="group grid min-h-[48px] w-full place-items-center rounded-full bg-[#174a30] text-white shadow-[0_14px_28px_rgba(8,39,25,0.16)] transition hover:-translate-y-0.5 hover:bg-[#082719] hover:shadow-[0_18px_38px_rgba(8,39,25,0.22)] disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2 xl:col-span-1 xl:w-12"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-5 w-5 ${loadingList ? "animate-spin" : "transition duration-300 group-hover:rotate-180"}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12a8 8 0 0 1-13.66 5.66" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12A8 8 0 0 1 17.66 6.34" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 18H4v3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 6h3V3" />
                  </svg>
                </button>
              </div>
            }
          >
            <div className="overflow-hidden rounded-3xl border border-[#d7e2da] bg-[#f8fbf9]">
              {pagedApplications.length ? (
                <div className="divide-y divide-[#d7e2da]">
                  {pagedApplications.map((app, index) => {
                    const resumeScore = getResumeScoreValue(app);
                    const resumeStatus = app?.resumeScreening?.status || "not_screened";

                    const examScore =
                      app?.assessment?.status === "completed"
                        ? `${app?.assessment?.percentage ?? 0}%`
                        : "-";

                    return (
                      <article
                        key={app._id}
                        className="group grid gap-4 bg-white/70 px-5 py-5 transition duration-300 hover:bg-white hover:shadow-[0_16px_40px_rgba(8,39,25,0.08)] md:grid-cols-[58px_minmax(210px,1.45fr)_minmax(120px,0.85fr)_90px_minmax(132px,0.85fr)_80px_minmax(132px,0.9fr)_150px] md:items-center"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#082719] text-[16px] font-black uppercase tracking-[0.04em] text-[#f4d484] shadow-[0_12px_26px_rgba(8,39,25,0.18)] ring-1 ring-[#f4d484]/20 transition duration-300 group-hover:scale-105">
                          {getApplicantInitials(app)}
                        </div>

                        <div>
                          <p className="text-[15px] font-black text-[#071f14]">{getApplicantName(app)}</p>
                          <p className="mt-1 break-all text-[11px] font-bold text-[#071f14]/55">
                            {app.email || "Email"}
                          </p>
                        </div>

                        <p className="text-[13px] font-black text-[#071f14] md:text-left">{app.vacancy || "Job"}</p>

                        <p className="text-[18px] font-black text-[#071f14] md:text-center">{formatScore(resumeScore)}</p>

                        <span
                          className={`inline-flex min-w-[118px] justify-center rounded-full px-3 py-1 text-center text-[11px] font-black ${getResumeScreeningChipClass(
                            resumeStatus
                          )}`}
                        >
                          {prettifyValue(resumeStatus)}
                        </span>

                        <p className="text-[14px] font-black text-[#071f14] md:text-center">{examScore}</p>

                        <span
                          className={`inline-flex min-w-[118px] justify-center rounded-full px-3 py-1 text-center text-[11px] font-black ${getStatusChipClass(
                            app.status
                          )}`}
                        >
                          {prettifyValue(app.status || "PENDING")}
                        </span>

                        <div className="grid w-fit grid-cols-4 gap-2 md:ml-auto md:justify-self-end">
                          <button
                            type="button"
                            onClick={() => loadApplicationDetails(app._id, "view")}
                            title="View Details"
                            aria-label="View Details"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7e2da] bg-[#eef4ef] text-[#174a30] shadow-[0_8px_18px_rgba(8,39,25,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d7a84d] hover:bg-[#e1f2e5] hover:shadow-[0_12px_26px_rgba(8,39,25,0.12)]"
                          >
                            <ApplicantActionIcon type="view" />
                          </button>

                          <button
                            type="button"
                            onClick={() => loadApplicationDetails(app._id, "ai")}
                            disabled={screeningActionId === app._id}
                            title={screeningActionId === app._id ? "Screening..." : "AI Screen"}
                            aria-label={screeningActionId === app._id ? "Screening..." : "AI Screen"}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dce6fb] bg-[#eef4ff] text-[#244b92] shadow-[0_8px_18px_rgba(8,39,25,0.08)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#dfe9ff] hover:shadow-[0_12px_26px_rgba(8,39,25,0.12)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                          >
                            <ApplicantActionIcon type="ai" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              loadApplicationDetails(app._id, "schedule")
                            }
                            title="Interview Schedule"
                            aria-label="Interview Schedule"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#f5ddba] bg-[#fff3df] text-[#b54708] shadow-[0_8px_18px_rgba(8,39,25,0.08)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffe8bf] hover:shadow-[0_12px_26px_rgba(8,39,25,0.12)]"
                          >
                            <ApplicantActionIcon type="schedule" />
                          </button>

                          <button
                            type="button"
                            onClick={() => loadApplicationDetails(app._id, "hire")}
                            title="Hire"
                            aria-label="Hire"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#082719] bg-[#082719] text-white shadow-[0_8px_18px_rgba(8,39,25,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#174a30] hover:shadow-[0_12px_26px_rgba(8,39,25,0.18)]"
                          >
                            <ApplicantActionIcon type="hire" />
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  <div className="flex flex-col gap-4 border-t border-[#d7e2da] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[12px] font-bold text-[#071f14]/55">
                      Page <b className="text-[#071f14]">{page}</b> of <b className="text-[#071f14]">{totalPages}</b> • Showing <b className="text-[#071f14]">{pagedApplications.length}</b> of <b className="text-[#071f14]">{filteredApplications.length}</b> applicants
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={page <= 1}
                        className="rounded-full border border-[#d7e2da] bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#071f14] transition hover:-translate-y-0.5 hover:border-[#d7a84d] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                      >
                        Prev
                      </button>
                      <span className="rounded-full bg-[#082719] px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-white">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPage((current) => Math.min(totalPages, current + 1))
                        }
                        disabled={page >= totalPages}
                        className="rounded-full border border-[#d7e2da] bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#071f14] transition hover:-translate-y-0.5 hover:border-[#d7a84d] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-14 text-center text-[14px] font-bold text-[#071f14]/55">
                  {loadingList ? "Loading applicants..." : "No applicants found."}
                </div>
              )}
            </div>
          </SectionCard>

        </main>
      </div>


      <style>{`
        @keyframes hrModalOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes hrModalCardIn {
          from { opacity: 0; transform: translateY(22px) scale(.975); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .ltc-hr-modal-overlay {
          animation: hrModalOverlayIn .22s ease-out both;
          backdrop-filter: blur(8px);
        }

        .ltc-hr-action-modal {
          position: relative;
          border: 1px solid rgba(255,255,255,.82);
          box-shadow: 0 34px 90px rgba(8,39,25,.32);
          animation: hrModalCardIn .34s cubic-bezier(.22,1,.36,1) both;
          background:
            radial-gradient(circle at top right, rgba(244,212,132,.16), transparent 30%),
            linear-gradient(180deg,#ffffff 0%,#f8fbf9 100%);
        }

        .ltc-hr-action-modal::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 7px;
          background: linear-gradient(90deg,#235f3e,#2f754c,#d7a84d);
          z-index: 5;
        }

        .ltc-hr-modal-header {
          position: sticky;
          top: 0;
          z-index: 4;
          background:
            radial-gradient(circle at 88% 20%, rgba(244,212,132,.24), transparent 28%),
            linear-gradient(135deg,#071f14,#174a30 58%,#315b42);
          color: white;
          padding: 28px;
          border: 0;
        }

        .ltc-hr-modal-header p,
        .ltc-hr-modal-header h2 {
          color: inherit;
        }

        .ltc-hr-modal-header .ltc-hr-modal-eyebrow {
          color: #f4d484;
          text-shadow: 0 8px 24px rgba(0,0,0,.16);
        }

        .ltc-hr-modal-header .ltc-hr-modal-subtitle {
          color: rgba(255,255,255,.76);
          max-width: 900px;
        }

        .ltc-hr-modal-close {
          min-height: 44px;
          border-radius: 999px;
          background: rgba(255,255,255,.94);
          color: #071f14;
          box-shadow: 0 16px 34px rgba(0,0,0,.16);
          transition: transform .28s cubic-bezier(.22,1,.36,1), background .28s cubic-bezier(.22,1,.36,1), box-shadow .28s cubic-bezier(.22,1,.36,1);
        }

        .ltc-hr-modal-close:hover {
          transform: translateY(-2px);
          background: #f4d484;
          box-shadow: 0 20px 44px rgba(0,0,0,.20);
        }

        .ltc-hr-action-modal > .grid,
        .ltc-hr-action-modal > .space-y-4,
        .ltc-hr-action-modal > .rounded-2xl,
        .ltc-hr-action-modal > .overflow-hidden,
        .ltc-hr-action-modal > .text-center {
          margin: 24px;
        }

        .ltc-hr-action-modal section.rounded-2xl,
        .ltc-hr-action-modal div.rounded-2xl {
          border: 1px solid rgba(215,226,218,.85);
          box-shadow: 0 16px 40px rgba(8,39,25,.08);
          transition: transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s cubic-bezier(.22,1,.36,1), border-color .28s cubic-bezier(.22,1,.36,1);
        }

        .ltc-hr-action-modal section.rounded-2xl:hover,
        .ltc-hr-action-modal div.rounded-2xl:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 58px rgba(8,39,25,.12);
          border-color: rgba(215,168,77,.48);
        }

        .ltc-hr-action-modal h3,
        .ltc-hr-action-modal .font-black {
          letter-spacing: -0.02em;
        }

        .ltc-hr-action-modal input,
        .ltc-hr-action-modal textarea,
        .ltc-hr-action-modal select {
          border-radius: 18px !important;
          border-color: #d7e2da !important;
          background: rgba(255,255,255,.94) !important;
          min-height: 52px;
          box-shadow: 0 10px 24px rgba(8,39,25,.05);
          transition: transform .24s cubic-bezier(.22,1,.36,1), box-shadow .24s cubic-bezier(.22,1,.36,1), border-color .24s cubic-bezier(.22,1,.36,1);
        }

        .ltc-hr-action-modal textarea {
          min-height: 128px;
          resize: vertical;
        }

        .ltc-hr-action-modal input:focus,
        .ltc-hr-action-modal textarea:focus,
        .ltc-hr-action-modal select:focus {
          transform: translateY(-1px);
          border-color: #d7a84d !important;
          box-shadow: 0 18px 38px rgba(8,39,25,.11) !important;
          outline: none !important;
        }

        .ltc-hr-action-modal button:not(.ltc-hr-modal-close) {
          border-radius: 999px !important;
          min-height: 46px;
          transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s cubic-bezier(.22,1,.36,1), filter .25s cubic-bezier(.22,1,.36,1);
        }

        .ltc-hr-action-modal button:not(.ltc-hr-modal-close):hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 38px rgba(8,39,25,.16);
          filter: saturate(1.05);
        }

        .ltc-hr-action-modal button:disabled {
          opacity: .68;
          cursor: not-allowed;
        }

        .ltc-hr-action-modal .bg-[#f8faf6],
        .ltc-hr-action-modal .bg-[#f8fbf9] {
          background: linear-gradient(135deg,#fbfdfb,#f3f8f4) !important;
        }

        .ltc-hr-action-modal .bg-[#eef4ff] {
          background: linear-gradient(135deg,#eef4ff,#f7fbff) !important;
          border-color: rgba(147,177,230,.38) !important;
        }

        .ltc-hr-action-modal .bg-[#faecec] {
          background: linear-gradient(135deg,#fff1f1,#faecec) !important;
          border-color: rgba(157,47,47,.18) !important;
        }

        @media (max-width: 640px) {
          .ltc-hr-modal-header { padding: 24px 18px; }
          .ltc-hr-action-modal > .grid,
          .ltc-hr-action-modal > .space-y-4,
          .ltc-hr-action-modal > .rounded-2xl,
          .ltc-hr-action-modal > .overflow-hidden,
          .ltc-hr-action-modal > .text-center { margin: 18px; }
        }
      `}</style>

      {activeModal && (
        <div className="ltc-hr-modal-overlay fixed inset-0 z-40 flex items-center justify-center bg-[#071f14]/70 p-4">
          <div
            className={`ltc-hr-action-modal max-h-[92vh] w-full ${modalWidthClass} overflow-y-auto rounded-[32px] bg-white text-[#24352c] shadow-xl`}
          >
            <div className="ltc-hr-modal-header flex items-start justify-between gap-4">
              <div>
                <p className="ltc-hr-modal-eyebrow text-xs font-black uppercase tracking-[0.24em]">
                  Manpower HR Action
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                  {modalTitle}
                </h2>
                {selectedApp && (
                  <p className="ltc-hr-modal-subtitle mt-2 text-sm font-semibold leading-6">
                    {getApplicantName(selectedApp)} • {selectedApp.vacancy || "Job"} • {selectedApp.email || "Email"}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="ltc-hr-modal-close px-5 py-2 text-sm font-black"
              >
                Close
              </button>
            </div>

            {loadingApplication || !selectedApp ? (
              <div className="rounded-2xl border border-[#d7decf] bg-[#f8faf6] px-4 py-8 text-center text-sm font-bold text-[#5f6f61]">
                Loading application details...
              </div>
            ) : activeModal === "view" ? (
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <section className="rounded-2xl bg-[#f8faf6] p-4">
                    <h3 className="font-black text-[#24352c]">Applicant Details</h3>

                    <div className="mt-4 grid gap-3 text-sm text-[#56695b] md:grid-cols-2">
                      <p>
                        <span className="font-black text-[#24352c]">Full Name:</span>{" "}
                        {selectedApp.firstName} {selectedApp.middleName || ""} {selectedApp.lastName}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Email:</span>{" "}
                        {selectedApp.email || "-"}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Contact No.:</span>{" "}
                        {selectedApp.contactNo || "-"}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Vacancy:</span>{" "}
                        {selectedApp.vacancy || "-"}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Age:</span>{" "}
                        {selectedApp.age || "-"}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Gender:</span>{" "}
                        {selectedApp.gender || "-"}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Civil Status:</span>{" "}
                        {selectedApp.civilStatus || "-"}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Nationality:</span>{" "}
                        {selectedApp.nationality || "-"}
                      </p>
                      <p className="md:col-span-2">
                        <span className="font-black text-[#24352c]">Address:</span>{" "}
                        {selectedApp.completeAddress || "-"}
                      </p>
                    </div>
                  </section>

                  <section className="rounded-2xl bg-[#f8faf6] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-[#24352c]">AI Resume Screening</h3>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getResumeScreeningChipClass(
                          selectedApp?.resumeScreening?.status
                        )}`}
                      >
                        {prettifyValue(selectedApp?.resumeScreening?.status || "not_screened")}
                      </span>
                      <span className="inline-flex rounded-full bg-[#eef3ea] px-3 py-1 text-xs font-black text-[#395345]">
                        Score: {formatScore(selectedApp?.resumeScreening?.score || 0)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-[#56695b] md:grid-cols-2">
                      <p>
                        <span className="font-black text-[#24352c]">Recommendation:</span>{" "}
                        {prettifyValue(selectedApp?.resumeScreening?.recommendation || "-")}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Screened At:</span>{" "}
                        {formatDateTime(selectedApp?.resumeScreening?.screenedAt)}
                      </p>
                      <p className="md:col-span-2">
                        <span className="font-black text-[#24352c]">Summary:</span>{" "}
                        {selectedApp?.resumeScreening?.summary || "-"}
                      </p>
                      <div className="md:col-span-2">
                        <p className="mb-2 font-black text-[#24352c]">Strengths:</p>
                        {renderStringList(selectedApp?.resumeScreening?.strengths)}
                      </div>
                      <div className="md:col-span-2">
                        <p className="mb-2 font-black text-[#24352c]">Concerns:</p>
                        {renderStringList(selectedApp?.resumeScreening?.concerns)}
                      </div>
                      <div className="md:col-span-2">
                        <p className="mb-2 font-black text-[#24352c]">Matched Keywords:</p>
                        {renderStringList(selectedApp?.resumeScreening?.matchedKeywords)}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl bg-[#f8faf6] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-[#24352c]">AI ID Verifier Result</h3>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getScreeningStatusChipClass(
                          selectedApp?.idVerification?.screeningStatus
                        )}`}
                      >
                        {prettifyValue(selectedApp?.idVerification?.screeningStatus)}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getRiskChipClass(
                          selectedApp?.idVerification?.aiRiskLevel
                        )}`}
                      >
                        Risk: {prettifyValue(selectedApp?.idVerification?.aiRiskLevel || "unknown")}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-[#56695b] md:grid-cols-2">
                      <p>
                        <span className="font-black text-[#24352c]">Confidence Score:</span>{" "}
                        {selectedApp?.idVerification?.confidenceScore ?? "-"}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">AI Decision:</span>{" "}
                        {prettifyValue(selectedApp?.idVerification?.aiDecision || "needs_manual_review")}
                      </p>
                      <p className="md:col-span-2">
                        <span className="font-black text-[#24352c]">AI Summary:</span>{" "}
                        {selectedApp?.idVerification?.aiSummary || "-"}
                      </p>
                      {selectedApp?.idVerification?.aiError && (
                        <p className="md:col-span-2 rounded-xl bg-[#faecec] p-3 text-[#8b3232]">
                          <span className="font-black">AI Error:</span> {selectedApp.idVerification.aiError}
                        </p>
                      )}
                      <div className="md:col-span-2">
                        <p className="mb-2 font-black text-[#24352c]">Reasons:</p>
                        {renderStringList(selectedApp?.idVerification?.reasons)}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl bg-[#f8faf6] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-[#24352c]">Job Assessment Result</h3>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getAssessmentChipClass(
                          selectedApp?.assessment?.status,
                          selectedApp?.assessment?.passed
                        )}`}
                      >
                        {selectedApp?.assessment?.status === "completed"
                          ? selectedApp?.assessment?.passed
                            ? "Passed"
                            : "Failed"
                          : selectedApp?.assessment?.status || "not_started"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-[#56695b] md:grid-cols-2">
                      <p>
                        <span className="font-black text-[#24352c]">Total Score:</span>{" "}
                        {selectedApp?.assessment?.totalScore ?? 0} / {selectedApp?.assessment?.maxScore ?? 0}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Percentage:</span>{" "}
                        {selectedApp?.assessment?.percentage ?? 0}%
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Passing Score:</span>{" "}
                        {selectedApp?.assessment?.passingScore ?? 70}%
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Submitted At:</span>{" "}
                        {formatDateTime(selectedApp?.assessment?.submittedAt)}
                      </p>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="rounded-2xl bg-[#f8faf6] p-4">
                    <h3 className="font-black text-[#24352c]">Application Status</h3>
                    <div className="mt-4 space-y-3 text-sm text-[#56695b]">
                      <p>
                        <span className="font-black text-[#24352c]">Status:</span>{" "}
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getStatusChipClass(
                            selectedApp?.status
                          )}`}
                        >
                          {selectedApp?.status || "-"}
                        </span>
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Submitted:</span>{" "}
                        {formatDateTime(selectedApp?.createdAt)}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Interview Schedule:</span>{" "}
                        {formatDateTime(selectedApp?.interview?.scheduledAt)}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Interview Location:</span>{" "}
                        {selectedApp?.interview?.location || "-"}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">Interviewer:</span>{" "}
                        {selectedApp?.interview?.interviewer || "-"}
                      </p>
                      <p>
                        <span className="font-black text-[#24352c]">HR Notes:</span>{" "}
                        {selectedApp?.hrNotes || "-"}
                      </p>
                    </div>
                  </section>

                  <section className="rounded-2xl bg-[#f8faf6] p-4">
                    <h3 className="font-black text-[#24352c]">Separate Actions</h3>
                    <p className="mt-2 text-sm font-semibold text-[#5f6f61]">
                      Choose an action below. Each workflow opens in a separate designed modal for a cleaner HR review process.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => loadApplicationDetails(selectedApp._id, "ai")}
                        className="rounded-xl bg-[#d5e7ff] px-4 py-3 text-sm font-black text-[#244b92]"
                      >
                        AI Screen
                      </button>
                      <button
                        type="button"
                        onClick={() => loadApplicationDetails(selectedApp._id, "schedule")}
                        className="rounded-xl bg-[#bdf0a8] px-4 py-3 text-sm font-black text-[#294f35]"
                      >
                        Interview Schedule
                      </button>
                      <button
                        type="button"
                        onClick={() => loadApplicationDetails(selectedApp._id, "hire")}
                        className="rounded-xl bg-[#246843] px-4 py-3 text-sm font-black text-white"
                      >
                        Hire Applicant
                      </button>
                      <button
                        type="button"
                        onClick={() => loadApplicationDetails(selectedApp._id, "reject")}
                        className="rounded-xl bg-[#8b3232] px-4 py-3 text-sm font-black text-white"
                      >
                        Reject Applicant
                      </button>
                    </div>
                  </section>

                  <section className="rounded-2xl bg-[#f8faf6] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-black text-[#24352c]">Uploaded Valid ID Preview</h3>
                      {idPreviewUrl && (
                        <button
                          type="button"
                          onClick={() => window.open(idPreviewUrl, "_blank", "noopener,noreferrer")}
                          className="rounded-lg bg-[#eef3ea] px-3 py-2 text-xs font-black text-[#395345]"
                        >
                          Open ID
                        </button>
                      )}
                    </div>

                    {validIdRow && (
                      <p className="mt-2 text-xs text-[#667567]">
                        {validIdRow?.originalName || validIdRow?.filename || "Uploaded Valid ID"}
                      </p>
                    )}

                    <div className="mt-4 rounded-xl border border-[#d9e3d5] bg-white p-4">
                      {idPreviewLoading ? (
                        <p className="text-sm text-[#6b7a6d]">Loading valid ID preview...</p>
                      ) : idPreviewError ? (
                        <p className="text-sm text-[#8b3232]">{idPreviewError}</p>
                      ) : canShowImagePreview ? (
                        <img
                          src={idPreviewUrl}
                          alt="Uploaded Valid ID"
                          className="max-h-[360px] w-full rounded-xl bg-[#f8faf6] object-contain"
                        />
                      ) : validIdRow ? (
                        <p className="text-sm text-[#6b7a6d]">Preview is not available for this file.</p>
                      ) : (
                        <p className="text-sm text-[#6b7a6d]">No uploaded valid ID found.</p>
                      )}
                    </div>
                  </section>

                  <section className="rounded-2xl bg-[#f8faf6] p-4">
                    <h3 className="font-black text-[#24352c]">Uploaded Requirements</h3>
                    {requirementRows.length ? (
                      <div className="mt-4 overflow-hidden rounded-xl border border-[#d9e3d5] bg-white">
                        <table className="min-w-full text-sm">
                          <thead className="bg-[#f4f7f2] text-[#395345]">
                            <tr>
                              <th className="px-4 py-3 text-left font-black">Requirement</th>
                              <th className="px-4 py-3 text-left font-black">File Name</th>
                              <th className="px-4 py-3 text-right font-black">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {requirementRows.map(([key, value]) => (
                              <tr key={key} className="border-t border-[#eef2ea]">
                                <td className="px-4 py-3 font-medium text-[#395345]">
                                  {getRequirementLabel(key)}
                                </td>
                                <td className="px-4 py-3 text-[#56695b]">
                                  {getRequirementFileName(key, value)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => openRequirementPreview(key, value)}
                                    className="rounded-full bg-[#d5e7ff] px-4 py-2 text-xs font-black text-[#244b92] transition hover:bg-[#c4dcff]"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[#6b7a6d]">No uploaded requirements found.</p>
                    )}
                  </section>
                </div>
              </div>
            ) : activeModal === "requirement" ? (
              <div className="space-y-5">
                <div className="rounded-2xl bg-[#f8faf6] p-4 text-sm text-[#56695b]">
                  <div className="grid gap-3 md:grid-cols-2">
                    <p>
                      <span className="font-black text-[#24352c]">Applicant:</span>{" "}
                      {getApplicantName(selectedApp)}
                    </p>
                    <p>
                      <span className="font-black text-[#24352c]">Position:</span>{" "}
                      {selectedApp.vacancy || "-"}
                    </p>
                    <p>
                      <span className="font-black text-[#24352c]">Requirement:</span>{" "}
                      {selectedRequirement?.label || "-"}
                    </p>
                    <p>
                      <span className="font-black text-[#24352c]">File:</span>{" "}
                      {selectedRequirement?.fileName || "-"}
                    </p>
                    <p className="md:col-span-2">
                      <span className="font-black text-[#24352c]">Type:</span>{" "}
                      {requirementPreviewMimeType || selectedRequirement?.meta?.mimetype || "-"}
                    </p>
                  </div>
                </div>

                <div className="min-h-[460px] overflow-hidden rounded-2xl border border-[#d9e3d5] bg-[#f8faf6] p-4">
                  {requirementPreviewLoading ? (
                    <div className="flex min-h-[420px] items-center justify-center rounded-xl bg-white text-sm font-bold text-[#6b7a6d]">
                      Loading uploaded requirement...
                    </div>
                  ) : requirementPreviewError ? (
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl bg-[#faecec] p-6 text-center text-sm font-bold text-[#8b3232]">
                      <p>{requirementPreviewError}</p>
                      <button
                        type="button"
                        onClick={() =>
                          openRequirementPreview(
                            selectedRequirement?.key,
                            selectedRequirement?.meta
                          )
                        }
                        className="mt-4 rounded-xl bg-white px-5 py-3 text-xs font-black text-[#8b3232]"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : canShowRequirementImagePreview ? (
                    <img
                      src={requirementPreviewUrl}
                      alt={selectedRequirement?.label || "Uploaded requirement"}
                      className="max-h-[70vh] w-full rounded-xl bg-white object-contain"
                    />
                  ) : canShowRequirementPdfPreview || canShowRequirementTextPreview ? (
                    <iframe
                      title={selectedRequirement?.label || "Uploaded requirement"}
                      src={requirementPreviewUrl}
                      className="h-[70vh] w-full rounded-xl bg-white"
                    />
                  ) : requirementPreviewUrl ? (
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl bg-white p-6 text-center text-sm text-[#6b7a6d]">
                      <p className="font-bold">
                        This file type cannot be previewed directly in the modal.
                      </p>
                      <button
                        type="button"
                        onClick={() => window.open(requirementPreviewUrl, "_blank", "noopener,noreferrer")}
                        className="mt-4 rounded-xl bg-[#395345] px-5 py-3 text-xs font-black text-white"
                      >
                        Open File
                      </button>
                    </div>
                  ) : (
                    <div className="flex min-h-[420px] items-center justify-center rounded-xl bg-white text-sm font-bold text-[#6b7a6d]">
                      No preview available.
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={backToApplicantDetails}
                    className="rounded-xl bg-[#eef3ea] px-5 py-3 text-sm font-black text-[#395345]"
                  >
                    Back to Details
                  </button>
                  {requirementPreviewUrl && (
                    <button
                      type="button"
                      onClick={() => window.open(requirementPreviewUrl, "_blank", "noopener,noreferrer")}
                      className="rounded-xl bg-[#d5e7ff] px-5 py-3 text-sm font-black text-[#244b92]"
                    >
                      Open in New Tab
                    </button>
                  )}
                </div>
              </div>
            ) : activeModal === "schedule" ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#f8faf6] p-4 text-sm text-[#56695b]">
                  <p>
                    <span className="font-black text-[#24352c]">Applicant:</span> {getApplicantName(selectedApp)}
                  </p>
                  <p className="mt-1">
                    <span className="font-black text-[#24352c]">Position:</span> {selectedApp.vacancy || "-"}
                  </p>
                  <p className="mt-1">
                    <span className="font-black text-[#24352c]">Email:</span> {selectedApp.email || "-"}
                  </p>
                </div>

                <input
                  type="datetime-local"
                  value={scheduleForm.scheduledAt}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({ ...prev, scheduledAt: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[#c6ccb9] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#395345]"
                />
                <input
                  placeholder="Location"
                  value={scheduleForm.location}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({ ...prev, location: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[#c6ccb9] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#395345]"
                />
                <input
                  placeholder="Interviewer"
                  value={scheduleForm.interviewer}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({ ...prev, interviewer: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[#c6ccb9] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#395345]"
                />
                <textarea
                  rows={4}
                  placeholder="Remarks"
                  value={scheduleForm.remarks}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({ ...prev, remarks: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[#c6ccb9] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#395345]"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl bg-[#eef3ea] px-5 py-3 text-sm font-black text-[#395345]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={scheduleInterview}
                    disabled={actionSubmitting}
                    className="rounded-xl bg-[#395345] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {actionSubmitting ? "Sending..." : "Send Interview Schedule"}
                  </button>
                </div>
              </div>
            ) : activeModal === "hire" ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#f8faf6] p-4 text-sm text-[#56695b]">
                  <p>
                    <span className="font-black text-[#24352c]">Applicant:</span> {getApplicantName(selectedApp)}
                  </p>
                  <p className="mt-1">
                    <span className="font-black text-[#24352c]">Position:</span> {selectedApp.vacancy || "-"}
                  </p>
                  <p className="mt-1">
                    <span className="font-black text-[#24352c]">Email:</span> {selectedApp.email || "-"}
                  </p>
                </div>

                <input
                  placeholder="Deployment Site"
                  value={hireForm.deploymentSite}
                  onChange={(event) =>
                    setHireForm((prev) => ({ ...prev, deploymentSite: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[#c6ccb9] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#246843]"
                />
                <input
                  placeholder="Region Code"
                  value={hireForm.regionCode}
                  onChange={(event) =>
                    setHireForm((prev) => ({ ...prev, regionCode: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[#c6ccb9] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#246843]"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Daily Rate"
                  value={hireForm.dailyRate}
                  onChange={(event) =>
                    setHireForm((prev) => ({ ...prev, dailyRate: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[#c6ccb9] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#246843]"
                />
                <textarea
                  rows={4}
                  placeholder="HR Notes"
                  value={hireForm.hrNotes}
                  onChange={(event) =>
                    setHireForm((prev) => ({ ...prev, hrNotes: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[#c6ccb9] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#246843]"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl bg-[#eef3ea] px-5 py-3 text-sm font-black text-[#395345]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={hireApplicant}
                    disabled={actionSubmitting}
                    className="rounded-xl bg-[#246843] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {actionSubmitting ? "Hiring..." : "Mark as Hired and Send Credentials"}
                  </button>
                </div>
              </div>
            ) : activeModal === "reject" ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#faecec] p-4 text-sm text-[#8b3232]">
                  <p className="font-black">Reject {getApplicantName(selectedApp)}?</p>
                  <p className="mt-1 font-semibold">
                    This action will mark the applicant as rejected. Add a clear HR note for your record.
                  </p>
                </div>

                <textarea
                  rows={5}
                  placeholder="Rejection note or reason"
                  value={rejectForm.hrNotes}
                  onChange={(event) =>
                    setRejectForm((prev) => ({ ...prev, hrNotes: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[#c6ccb9] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8b3232]"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl bg-[#eef3ea] px-5 py-3 text-sm font-black text-[#395345]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectApplicant(selectedApp._id)}
                    disabled={actionSubmitting}
                    className="rounded-xl bg-[#8b3232] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {actionSubmitting ? "Rejecting..." : "Reject Application"}
                  </button>
                </div>
              </div>
            ) : activeModal === "ai" ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#f8faf6] p-4 text-sm text-[#56695b]">
                  <p>
                    <span className="font-black text-[#24352c]">Applicant:</span> {getApplicantName(selectedApp)}
                  </p>
                  <p className="mt-1">
                    <span className="font-black text-[#24352c]">Position:</span> {selectedApp.vacancy || "-"}
                  </p>
                  <p className="mt-1">
                    <span className="font-black text-[#24352c]">Current Resume Score:</span>{" "}
                    {formatScore(selectedApp?.resumeScreening?.score || 0)}
                  </p>
                  <p className="mt-1">
                    <span className="font-black text-[#24352c]">Current Status:</span>{" "}
                    {prettifyValue(selectedApp?.resumeScreening?.status || "not_screened")}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#eef4ff] p-4 text-sm font-semibold text-[#244b92]">
                  This will run AI resume screening again using the uploaded resume and selected vacancy.
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl bg-[#eef3ea] px-5 py-3 text-sm font-black text-[#395345]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const success = await rescreenResume(selectedApp._id, { skipConfirm: true });
                      if (success) closeModal();
                    }}
                    disabled={screeningActionId === selectedApp._id}
                    className="rounded-xl bg-[#d5e7ff] px-5 py-3 text-sm font-black text-[#244b92] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {screeningActionId === selectedApp._id ? "Screening..." : "Run AI Screen"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}
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

function BrandLogo() {
  return (
    <div className="flex items-center gap-5">
      <img
        src="/logo.png"
        alt="Manpower Logo"
        className="h-16 w-16 rounded-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      <h1 className="text-[28px] font-black uppercase tracking-wide text-[#315b42] sm:text-[34px]">
        MANPOWER SERVICES
      </h1>
    </div>
  );
}

function SidebarButton({ active = false, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-6 py-4 text-center text-[16px] font-black uppercase transition ${
        active
          ? "bg-[#d5ddd6] text-[#244b35]"
          : "text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-lg border-[3px] border-[#718575] bg-[#456650] px-4 py-3 text-white shadow-sm">
      <h3 className="text-[15px] font-black uppercase leading-tight">
        {title}
      </h3>
      <p className="mt-3 text-center text-[32px] font-black leading-none">
        {formatCount(value)}
      </p>
    </div>
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

    if (!keyword) return applications;

    return applications.filter((app) => {
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

      return haystack.includes(keyword);
    });
  }, [applications, searchValue]);

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
    <div className="min-h-screen bg-[#0f3a1e] font-sans text-white">
      <header className="border-b border-[#d7decf] bg-[#f7f9f5]">
        <div className="flex h-[90px] items-center px-8">
          <BrandLogo />
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-90px)] lg:grid-cols-[265px_1fr]">
        <aside className="flex bg-[#294f35] lg:min-h-[calc(100vh-90px)]">
          <div className="flex w-full flex-col">
            <div className="border-b border-white/15 px-6 py-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#9ca59d] bg-white text-[28px] font-black text-[#315b42]">
                HR
              </div>

              <h2 className="mt-5 text-[17px] font-black uppercase leading-tight text-white">
                Human Resources
              </h2>

              <p className="mt-2 break-all text-[11px] font-bold text-white">
                {hrEmail}
              </p>
            </div>

            <nav className="border-t border-white/5">
              <SidebarButton onClick={() => navigate("/manpower-hr")}>
                Dashboard
              </SidebarButton>

              <SidebarButton active onClick={() => navigate("/manpower-hr-applications")}>
                Manage Applicants
              </SidebarButton>

              <SidebarButton onClick={() => navigate("/manpower-hr-payroll")}>
                Manage Payroll
              </SidebarButton>

              <SidebarButton onClick={() => navigate("/manpower-hr-leaves")}>
                Manage File Leave
              </SidebarButton>

              <SidebarButton onClick={() => navigate("/manpower-hr-billing")}>
                Manage Billing
              </SidebarButton>
            </nav>

            <div className="mt-auto px-6 py-8">
              <button
                type="button"
                onClick={logout}
                className="w-full rounded-full px-5 py-3 text-[16px] font-black uppercase text-white transition hover:bg-white/10"
              >
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        <main className="bg-[#0f3a1e] px-6 py-6 lg:px-8">
          <section>
            <h1 className="text-[32px] font-black uppercase leading-tight text-white md:text-[38px]">
              Manage Applicants
            </h1>
            <div className="mt-2 h-[4px] w-[360px] max-w-full bg-white/65" />
          </section>

          <section className="mt-6 grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
            <button type="button" onClick={() => setStatusFilter("")}>
              <SummaryCard title="Total Applicants" value={summary.totalApplicants} />
            </button>

            <button type="button" onClick={() => setStatusFilter("PENDING")}>
              <SummaryCard title="Pending Approval" value={summary.pending} />
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("INTERVIEW_SCHEDULED")}
            >
              <SummaryCard
                title="Interview Scheduled"
                value={summary.interviewScheduled}
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
              <SummaryCard title="Rejected" value={summary.rejected} />
            </button>
          </section>

          <section className="mt-7 rounded-2xl border border-white/20 bg-white/10 p-4 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-[20px] font-black uppercase">Resume Screening Ranking</h2>
                <p className="mt-1 max-w-3xl text-sm font-semibold text-white/75">
                  Applicants are ranked per selected job by AI resume score, match status, and exam percentage.
                  Choose a vacancy to see who is most qualified for that job.
                </p>
              </div>

              <div className="grid min-w-[280px] grid-cols-2 gap-3 text-center sm:grid-cols-4 lg:min-w-[520px]">
                <div className="rounded-xl bg-white px-3 py-3 text-[#294f35]">
                  <p className="text-xs font-black uppercase">Strong</p>
                  <p className="text-2xl font-black">{resumeStats.strongMatches}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 text-[#294f35]">
                  <p className="text-xs font-black uppercase">Possible</p>
                  <p className="text-2xl font-black">{resumeStats.possibleMatches}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 text-[#294f35]">
                  <p className="text-xs font-black uppercase">Average</p>
                  <p className="text-2xl font-black">{formatScore(resumeStats.averageScore)}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 text-[#294f35]">
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
                    className="rounded-xl border border-white/15 bg-[#294f35] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black">{row.vacancy}</h3>
                        <p className="mt-1 text-xs font-semibold text-white/70">
                          {row.screenedApplicants}/{row.totalApplicants} screened • Avg {formatScore(row.averageScore)}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#294f35]">
                        Top {formatScore(row.topScore)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-white/80">
                      Best candidate: {row.topApplicant?.fullName || "No applicant yet"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-7 overflow-hidden rounded-lg bg-[#294f35]">
            <div className="flex flex-col gap-4 rounded-t-lg bg-white px-4 py-4 text-[#294f35] lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-[18px] font-black">List of Applicants</h2>

              <div className="grid w-full gap-3 lg:max-w-5xl lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => {
                    setSearchValue(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search applicant, email, score"
                  className="h-[34px] w-full rounded-full border border-[#aab5aa] bg-white px-4 text-[13px] font-semibold text-[#294f35] outline-none"
                />

                <select
                  value={vacancyFilter}
                  onChange={(event) => {
                    setVacancyFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-[34px] w-full rounded-full border border-[#aab5aa] bg-white px-4 text-[13px] font-black text-[#294f35] outline-none"
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
                  className="h-[34px] w-full rounded-full border border-[#aab5aa] bg-white px-4 text-[13px] font-black text-[#294f35] outline-none"
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
                  className="h-[34px] w-full rounded-full border border-[#aab5aa] bg-white px-4 text-[13px] font-black text-[#294f35] outline-none"
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
                  className="h-[34px] min-w-[110px] rounded-full bg-[#174322] px-5 text-[12px] font-black text-white transition hover:bg-[#0f3319] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingList ? "Loading..." : "Refresh"}
                </button>
              </div>
            </div>

            <div className="min-h-[320px]">
              {pagedApplications.length ? (
                pagedApplications.map((app, index) => {
                  const rankNumber =
                    app?.resumeRank || (page - 1) * itemsPerPage + index + 1;
                  const resumeScore = getResumeScoreValue(app);
                  const resumeStatus = app?.resumeScreening?.status || "not_screened";

                  const examScore =
                    app?.assessment?.status === "completed"
                      ? `${app?.assessment?.percentage ?? 0}%`
                      : "-";

                  return (
                    <div
                      key={app._id}
                      className="grid gap-4 border-b border-white/25 px-4 py-5 text-white md:grid-cols-[64px_1fr_0.85fr_0.55fr_0.75fr_0.65fr_0.75fr_1.8fr] md:items-center"
                    >
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-white text-[#315b42]">
                        <span className="text-[10px] font-black uppercase leading-none">Rank</span>
                        <span className="text-[16px] font-black leading-none">#{rankNumber}</span>
                      </div>

                      <div>
                        <p className="text-[16px] font-black">{getApplicantName(app)}</p>
                        <p className="mt-1 break-all text-[11px] font-bold text-white/70">
                          {app.email || "Email"}
                        </p>
                      </div>

                      <p className="text-[16px] font-black">{app.vacancy || "Job"}</p>

                      <p className="text-[18px] font-black">{formatScore(resumeScore)}</p>

                      <span
                        className={`inline-flex justify-center rounded-full px-3 py-1 text-[11px] font-black ${getResumeScreeningChipClass(
                          resumeStatus
                        )}`}
                      >
                        {prettifyValue(resumeStatus)}
                      </span>

                      <p className="text-[15px] font-black">{examScore}</p>

                      <span
                        className={`inline-flex justify-center rounded-full px-3 py-1 text-[11px] font-black ${getStatusChipClass(
                          app.status
                        )}`}
                      >
                        {app.status || "PENDING"}
                      </span>

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <button
                          type="button"
                          onClick={() => loadApplicationDetails(app._id, "view")}
                          className="min-w-[90px] rounded-full bg-[#bdf0a8] px-4 py-1 text-[11px] font-black text-[#294f35] transition hover:bg-[#a9df94]"
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          onClick={() => loadApplicationDetails(app._id, "ai")}
                          disabled={screeningActionId === app._id}
                          className="min-w-[92px] rounded-full bg-[#d5e7ff] px-4 py-1 text-[11px] font-black text-[#244b92] transition hover:bg-[#c5dcff] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {screeningActionId === app._id ? "Screening..." : "AI Screen"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            loadApplicationDetails(app._id, "schedule")
                          }
                          className="min-w-[100px] rounded-full bg-[#bdf0a8] px-4 py-1 text-[11px] font-black text-[#294f35] transition hover:bg-[#a9df94]"
                        >
                          Interview Schedule
                        </button>

                        <button
                          type="button"
                          onClick={() => loadApplicationDetails(app._id, "hire")}
                          className="min-w-[86px] rounded-full bg-white px-4 py-1 text-[11px] font-black text-[#294f35] transition hover:bg-[#e7eee3]"
                        >
                          Hire
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-14 text-center text-[14px] font-semibold text-white/80">
                  {loadingList ? "Loading applicants..." : "No applicants found."}
                </div>
              )}
            </div>
          </section>

          <div className="mt-4 flex items-center justify-between text-white">
            <p className="text-[16px] font-black">
              Page {page} / {totalPages}
            </p>

            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="text-[28px] leading-none text-white transition hover:text-white/70 disabled:opacity-30"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className="text-[16px] font-black text-white transition hover:text-white/70 disabled:opacity-30"
              >
                Next Page
              </button>

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className="text-[28px] leading-none text-white transition hover:text-white/70 disabled:opacity-30"
              >
                ›
              </button>
            </div>
          </div>
        </main>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4">
          <div
            className={`max-h-[92vh] w-full ${modalWidthClass} overflow-y-auto rounded-[24px] bg-white p-6 text-[#24352c] shadow-xl`}
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#e2eadf] pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6b7a6d]">
                  Manpower HR Action
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#24352c]">
                  {modalTitle}
                </h2>
                {selectedApp && (
                  <p className="mt-1 text-sm font-semibold text-[#5f6f61]">
                    {getApplicantName(selectedApp)} • {selectedApp.vacancy || "Job"} • {selectedApp.email || "Email"}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-[#eef3ea] px-4 py-2 text-sm font-black text-[#395345] transition hover:bg-[#dfe8dd]"
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
                      Each action now opens its own modal, so viewing details, AI screening, scheduling, hiring, and rejecting no longer share one large form.
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
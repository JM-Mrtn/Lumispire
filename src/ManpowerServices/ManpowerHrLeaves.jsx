import React, { useEffect, useMemo, useState } from "react";
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

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCount(value) {
  return String(value || 0).padStart(2, "0");
}

function getEmployeeName(row) {
  return (
    row?.employeeName ||
    row?.fullName ||
    [row?.firstName, row?.middleName, row?.lastName]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() ||
    "Full name"
  );
}

function normalizeStatus(status) {
  return String(status || "PENDING").toUpperCase();
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

function SummaryCard({ title, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border-[3px] border-[#718575] bg-[#456650] px-4 py-3 text-left text-white shadow-sm transition hover:bg-[#506f5a]"
    >
      <h3 className="text-[15px] font-black uppercase leading-tight">
        {title}
      </h3>
      <p className="mt-3 text-center text-[32px] font-black leading-none">
        {formatCount(value)}
      </p>
    </button>
  );
}

function StatusBadge({ status }) {
  const value = normalizeStatus(status);

  const className =
    value === "APPROVED"
      ? "bg-[#bdf0a8] text-[#244b35]"
      : value === "REJECTED"
      ? "bg-[#f4c8c8] text-[#7c3232]"
      : value === "CANCELLED"
      ? "bg-[#eef0f2] text-[#475467]"
      : value === "COMPLETED"
      ? "bg-[#d5e7ff] text-[#244b92]"
      : "bg-[#fff0ba] text-[#73520d]";

  return (
    <span
      className={`inline-flex justify-center rounded-full px-3 py-1 text-[11px] font-black ${className}`}
    >
      {value}
    </span>
  );
}



function HrSidebarIcon({ type }) {
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

function RefreshIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 0 1-15.3 6.36L3 15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15v6h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12A9 9 0 0 1 18.3 5.64L21 9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 9V3h-6" />
    </svg>
  );
}

function ReviewIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M9 15l2 2 4-4" />
    </svg>
  );
}

function HrSidebarButton({ active = false, children, onClick, icon = "dashboard" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[46px] w-full items-center gap-3 rounded-[23px] px-5 text-left text-[12px] font-black tracking-tight transition duration-300 ${
        active
          ? "bg-white text-[#071f14] shadow-[0_18px_38px_rgba(0,0,0,0.20)]"
          : "text-white hover:translate-x-1 hover:bg-white/10"
      }`}
    >
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center transition duration-300 ${
          active ? "text-[#071f14]" : "text-white/85 group-hover:text-[#f4d484]"
        }`}
      >
        <HrSidebarIcon type={icon} />
      </span>
      <span className="min-w-0 flex-1 leading-tight">{children}</span>
    </button>
  );
}

function LeaveStatCard({ title, value, note, tone = "green", onClick }) {
  const valueColor =
    tone === "red"
      ? "text-[#9d2f2f]"
      : tone === "gold"
      ? "text-[#bd6b00]"
      : "text-[#071f14]";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-[132px] overflow-hidden rounded-3xl border border-white/80 bg-white p-6 text-left shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(8,39,25,0.16)]"
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-14 -right-12 h-36 w-36 rounded-full bg-[#f4d484]/20 blur-2xl transition group-hover:scale-110" />
      <p className="relative text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
        {title}
      </p>
      <p className={`relative mt-4 text-4xl font-black leading-none tracking-tight ${valueColor}`}>
        {value}
      </p>
      {note ? (
        <p className="relative mt-3 text-sm font-semibold text-[#071f14]/55">
          {note}
        </p>
      ) : null}
    </button>
  );
}

function HrSectionCard({ eyebrow, title, children, className = "", right = null }) {
  return (
    <section className={`relative overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 ${className}`}>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-[#f4d484]/20 blur-2xl" />
      <div className="relative p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071f14]">
                {title}
              </h2>
            ) : null}
          </div>
          {right}
        </div>
        <div className={title || eyebrow ? "mt-5" : ""}>{children}</div>
      </div>
    </section>
  );
}

function EmployeeInitials({ row }) {
  const names = getEmployeeName(row).split(/\s+/).filter(Boolean);
  const first = names[0]?.charAt(0) || "E";
  const last = names.length > 1 ? names[names.length - 1].charAt(0) : "L";
  return `${first}${last}`.toUpperCase();
}
export default function ManpowerHrLeaves() {
  const navigate = useNavigate();

  const [token, setToken] = useState(getHrToken());
  const [hrUser] = useState(getHrUser());

  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [vacancyFilter, setVacancyFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [hrRemarks, setHrRemarks] = useState("");

  const [message, setMessage] = useState({
    success: "",
    error: "",
  });

  const hrEmail =
    hrUser?.email ||
    hrUser?.companyEmail ||
    hrUser?.username ||
    "ltc.tamsi@gmail.com";

  function logout() {
    clearHrSession();
    setToken("");
    navigate("/manpower-hr-login", { replace: true });
  }

  async function loadLeaves() {
    setLoading(true);

    setMessage((prev) => ({
      ...prev,
      error: "",
    }));

    try {
      const params = new URLSearchParams();

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const query = params.toString();

      const url = query
        ? `${API_BASE}/manpower/hr/leaves?${query}`
        : `${API_BASE}/manpower/hr/leaves`;

      const res = await fetch(url, {
        headers: hrHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load leave requests.");
      }

      setLeaves(Array.isArray(data.leaves) ? data.leaves : []);
    } catch (error) {
      setMessage({
        success: "",
        error: error?.message || "Failed to load leave requests.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      navigate("/manpower-hr-login", { replace: true });
      return;
    }

    loadLeaves();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate, statusFilter]);

  const filteredLeaves = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return leaves.filter((row) => {
      const haystack = [
        getEmployeeName(row),
        row.companyEmail,
        row.contactNo,
        row.vacancy,
        row.job,
        row.deploymentSite,
        row.leaveType,
        row.reason,
        row.status,
        row.hrRemarks,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const startDate = row?.startDate ? new Date(row.startDate) : null;
      const endDate = row?.endDate ? new Date(row.endDate) : null;
      const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
      const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;
      const job = row?.vacancy || row?.job || "";

      const matchesSearch = !keyword || haystack.includes(keyword);
      const matchesType = !leaveTypeFilter || row?.leaveType === leaveTypeFilter;
      const matchesVacancy = !vacancyFilter || job === vacancyFilter;
      const matchesFrom = !fromDate || !endDate || endDate >= fromDate;
      const matchesTo = !toDate || !startDate || startDate <= toDate;

      return matchesSearch && matchesType && matchesVacancy && matchesFrom && matchesTo;
    });
  }, [leaves, search, leaveTypeFilter, vacancyFilter, dateFrom, dateTo]);

  const leaveTypes = useMemo(
    () => Array.from(new Set(leaves.map((row) => row?.leaveType).filter(Boolean))).sort(),
    [leaves]
  );

  const vacancyOptions = useMemo(
    () => Array.from(new Set(leaves.map((row) => row?.vacancy || row?.job).filter(Boolean))).sort(),
    [leaves]
  );

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / itemsPerPage));
  const pagedLeaves = filteredLeaves.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, leaveTypeFilter, vacancyFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const overlappingLeaves = useMemo(() => {
    if (!selectedLeave) return [];
    const selectedEmployeeId = selectedLeave?.employeeId?._id || selectedLeave?.employeeId || selectedLeave?.companyEmail || selectedLeave?.email;
    const selectedStart = new Date(selectedLeave.startDate).getTime();
    const selectedEnd = new Date(selectedLeave.endDate).getTime();
    if (!selectedEmployeeId || !Number.isFinite(selectedStart) || !Number.isFinite(selectedEnd)) return [];
    return leaves.filter((row) => {
      if (row._id === selectedLeave._id) return false;
      const employeeId = row?.employeeId?._id || row?.employeeId || row?.companyEmail || row?.email;
      if (String(employeeId) !== String(selectedEmployeeId)) return false;
      if (!["PENDING", "APPROVED"].includes(normalizeStatus(row.status))) return false;
      const start = new Date(row.startDate).getTime();
      const end = new Date(row.endDate).getTime();
      return Number.isFinite(start) && Number.isFinite(end) && start <= selectedEnd && end >= selectedStart;
    });
  }, [selectedLeave, leaves]);

  function exportLeavesCsv() {
    const headers = ["Employee", "Email", "Job", "Leave Type", "Start", "End", "Days", "Status", "HR Remarks"];
    const rows = filteredLeaves.map((row) => [
      getEmployeeName(row), row?.companyEmail || row?.email || "", row?.vacancy || row?.job || "",
      row?.leaveType || "", formatDate(row?.startDate), formatDate(row?.endDate), row?.totalDays || "",
      normalizeStatus(row?.status), row?.hrRemarks || "",
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `manpower-leaves-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const summary = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter((item) => normalizeStatus(item.status) === "PENDING")
        .length,
      approved: leaves.filter((item) => normalizeStatus(item.status) === "APPROVED")
        .length,
      rejected: leaves.filter((item) => normalizeStatus(item.status) === "REJECTED")
        .length,
    };
  }, [leaves]);

  function openReviewModal(leave) {
    setPendingAction("");
    setSelectedLeave(leave);
    setHrRemarks(leave?.hrRemarks || "");

    setMessage({
      success: "",
      error: "",
    });
  }

  function closeReviewModal() {
    setPendingAction("");
    setSelectedLeave(null);
    setHrRemarks("");
  }

  async function reviewLeave(action) {
    if (!selectedLeave?._id) return;

    const normalizedAction = String(action || "").toLowerCase();

    if (!["approve", "reject"].includes(normalizedAction)) return;

    if (normalizedAction === "reject" && hrRemarks.trim().length < 3) {
      setMessage({
        success: "",
        error: "Please enter HR remarks before rejecting the leave request.",
      });
      return;
    }

    setPendingAction("");
    setActionLoading(true);

    setMessage({
      success: "",
      error: "",
    });

    try {
      const res = await fetch(
        `${API_BASE}/manpower/hr/leaves/${selectedLeave._id}/${normalizedAction}`,
        {
          method: "PATCH",
          headers: {
            ...hrHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hrRemarks: hrRemarks.trim(),
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(
          data?.message || `Failed to ${normalizedAction} leave request.`
        );
      }

      closeReviewModal();
      await loadLeaves();

      setMessage({
        success: data?.message || "Leave request updated successfully.",
        error: "",
      });
    } catch (error) {
      setMessage({
        success: "",
        error: error?.message || `Failed to ${normalizedAction} leave request.`,
      });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#edf3ee] font-sans text-[#071f14]">
      <style>{`
        @keyframes hrLeaveFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hrLeaveModalIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {mobileSidebarOpen ? (
        <button type="button" aria-label="Close navigation" onClick={() => setMobileSidebarOpen(false)} className="fixed inset-0 z-40 bg-[#071f14]/60 backdrop-blur-sm lg:hidden" />
      ) : null}
      <div className="grid min-h-screen lg:grid-cols-[270px_1fr]">
        <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[270px] flex-col overflow-hidden bg-[#082719] px-7 py-9 text-white shadow-[18px_0_55px_rgba(7,31,20,0.28)] transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <button type="button" onClick={() => setMobileSidebarOpen(false)} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl font-black lg:hidden">×</button>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#f4d484]">
              Manpower Services HR
            </p>
            <h1 className="mt-3 text-[17px] font-black leading-tight tracking-tight text-white">
              LTC Manpower Services
            </h1>
          </div>

          <nav className="mt-12 flex-1 space-y-4">
            <HrSidebarButton icon="dashboard" onClick={() => navigate("/manpower-hr")}>
              Dashboard
            </HrSidebarButton>
            <HrSidebarButton icon="applicants" onClick={() => navigate("/manpower-hr-applications")}>
              Manage Applicants
            </HrSidebarButton>
            <HrSidebarButton icon="payroll" onClick={() => navigate("/manpower-hr-payroll")}>
              Manage Payroll
            </HrSidebarButton>
            <HrSidebarButton active icon="leave" onClick={() => navigate("/manpower-hr-leaves")}>
              Manage File Leave
            </HrSidebarButton>
            <HrSidebarButton icon="billing" onClick={() => navigate("/manpower-hr-billing")}>
              Manage Billing
            </HrSidebarButton>
          </nav>

          <div className="border-t border-white/15 pt-7">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="group flex min-h-[52px] w-full items-center gap-4 rounded-[26px] bg-white/10 px-6 text-left text-[13px] font-black capitalize tracking-tight text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#f4d484] hover:text-[#071f14]"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center text-white/90 transition duration-300 group-hover:text-[#071f14]">
                <HrSidebarIcon type="logout" />
              </span>
              <span>Sign out</span>
            </button>
            <p className="mt-4 break-all text-center text-[11px] font-bold text-white/65">{hrEmail}</p>
            <button type="button" onClick={() => navigate("/manpower-services")} className="mt-3 w-full text-center text-[11px] font-black uppercase tracking-[0.12em] text-[#f4d484] hover:text-white">View Public Website</button>
            <p className="mt-4 text-center text-[11px] font-bold text-white/55">© LTC Manpower Services</p>
          </div>
        </aside>

        <main className="min-w-0 px-5 py-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm lg:hidden">
            <button type="button" onClick={() => setMobileSidebarOpen(true)} className="rounded-full bg-[#082719] px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-white">Menu</button>
            <p className="text-sm font-black text-[#071f14]">Leave Management</p>
          </div>
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#071f14] via-[#174a30] to-[#315b42] p-7 text-white shadow-[0_30px_80px_rgba(8,39,25,0.18)] md:p-10">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#f4d484]/20 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f4d484]">
                  Manpower HR Center
                </p>
                <h1 className="mt-3 max-w-3xl text-[38px] font-black leading-[0.98] tracking-[-0.055em] md:text-[56px]">
                  File Leave Management
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] font-semibold leading-7 text-white/75">
                  Review employee leave requests, monitor approval status, and process HR actions in one professional dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={loadLeaves}
                disabled={loading}
                className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-white px-7 text-[13px] font-black uppercase tracking-[0.08em] text-[#071f14] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:bg-[#f4d484] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshIcon />
                {loading ? "Refreshing..." : "Refresh Requests"}
              </button>
            </div>
          </section>

          <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <LeaveStatCard
              title="Total Leave"
              value={summary.total}
              note="All filed leave requests"
              onClick={() => setStatusFilter("")}
            />
            <LeaveStatCard
              title="Pending"
              value={summary.pending}
              note="Requests awaiting review"
              tone="gold"
              onClick={() => setStatusFilter("PENDING")}
            />
            <LeaveStatCard
              title="Approved"
              value={summary.approved}
              note="Requests already approved"
              onClick={() => setStatusFilter("APPROVED")}
            />
            <LeaveStatCard
              title="Rejected"
              value={summary.rejected}
              note="Requests marked rejected"
              tone="red"
              onClick={() => setStatusFilter("REJECTED")}
            />
          </section>

          <HrSectionCard
            eyebrow="Leave Records"
            title="List of Employee Leave Requests"
            className="mt-7"
            right={
              <div className="flex w-full flex-col gap-3">
                <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employee, email, leave type..." className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[13px] font-bold text-[#071f14] outline-none focus:border-[#d7a84d]" />
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-[48px] rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[12px] font-black text-[#071f14] outline-none focus:border-[#d7a84d]">
                    <option value="">All Status</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="CANCELLED">Cancelled</option><option value="COMPLETED">Completed</option>
                  </select>
                  <select value={leaveTypeFilter} onChange={(event) => setLeaveTypeFilter(event.target.value)} className="min-h-[48px] rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[12px] font-black text-[#071f14] outline-none focus:border-[#d7a84d]">
                    <option value="">All Leave Types</option>{leaveTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <select value={vacancyFilter} onChange={(event) => setVacancyFilter(event.target.value)} className="min-h-[48px] rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[12px] font-black text-[#071f14] outline-none focus:border-[#d7a84d]">
                    <option value="">All Jobs</option>{vacancyOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <label className="rounded-2xl border border-[#d7e2da] bg-[#f8fbf9] px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#071f14]/45">From<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="mt-1 block w-full bg-transparent text-xs text-[#071f14] outline-none" /></label>
                  <label className="rounded-2xl border border-[#d7e2da] bg-[#f8fbf9] px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#071f14]/45">To<input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="mt-1 block w-full bg-transparent text-xs text-[#071f14] outline-none" /></label>
                  <button type="button" onClick={exportLeavesCsv} className="min-h-[48px] rounded-full border border-[#174a30] bg-white px-5 text-xs font-black uppercase tracking-[0.08em] text-[#174a30] hover:bg-[#eef4ef]">Export CSV</button>
                  <button type="button" onClick={loadLeaves} disabled={loading} className="min-h-[48px] rounded-full bg-[#174a30] px-5 text-xs font-black uppercase tracking-[0.08em] text-white disabled:opacity-60">{loading ? "Refreshing..." : "Refresh"}</button>
                </div>
                <p className="text-[12px] font-black uppercase tracking-[0.12em] text-[#071f14]/45">Showing {filteredLeaves.length} of {leaves.length} requests</p>
              </div>
            }
          >
            {message.success ? (
              <div className="mb-5 rounded-2xl border border-[#d7e2da] bg-[#f8fbf9] px-5 py-3 text-[13px] font-bold text-[#174a30]">
                {message.success}
              </div>
            ) : null}

            {message.error ? (
              <div className="mb-5 rounded-2xl border border-[#efc9c9] bg-[#fff2f2] px-5 py-3 text-[13px] font-bold text-[#912f2f]">
                {message.error}
              </div>
            ) : null}

            <div className="overflow-hidden rounded-3xl border border-[#d7e2da] bg-[#f8fbf9]">
              {pagedLeaves.length ? (
                <div className="divide-y divide-[#d7e2da]">
                  {pagedLeaves.map((leave) => (
                    <article
                      key={leave._id}
                      className="grid gap-4 bg-white/70 px-5 py-5 transition duration-300 hover:bg-white hover:shadow-[0_16px_40px_rgba(8,39,25,0.08)] md:grid-cols-[58px_1.15fr_1.45fr_0.9fr_0.9fr_0.65fr_58px] md:items-center"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#082719] text-[14px] font-black text-[#f4d484] shadow-[0_12px_26px_rgba(8,39,25,0.18)]">
                        <EmployeeInitials row={leave} />
                      </div>

                      <div>
                        <p className="text-[15px] font-black leading-snug text-[#071f14]">
                          {getEmployeeName(leave)}
                        </p>
                        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#071f14]/35">
                          {leave.leaveType || "Leave"}
                        </p>
                      </div>

                      <p className="break-all text-[13px] font-extrabold text-[#071f14]/70">
                        {leave.companyEmail || leave.email || "No email provided"}
                      </p>

                      <p className="text-[13px] font-black text-[#071f14]">
                        {leave.vacancy || leave.job || "Job"}
                      </p>

                      <div>
                        <p className="text-[12px] font-black text-[#071f14]">
                          {formatDate(leave.startDate)}
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-[#071f14]/50">
                          to {formatDate(leave.endDate)}
                        </p>
                      </div>

                      <StatusBadge status={leave.status} />

                      <div className="flex justify-start md:justify-end">
                        <button
                          type="button"
                          onClick={() => openReviewModal(leave)}
                          title="Review leave request"
                          aria-label="Review leave request"
                          className="grid h-12 w-12 place-items-center rounded-full bg-[#082719] text-white shadow-[0_12px_26px_rgba(8,39,25,0.16)] transition hover:-translate-y-1 hover:bg-[#d7a84d] hover:text-[#071f14]"
                        >
                          <ReviewIcon />
                        </button>
                      </div>
                    </article>
                  ))}
                  <div className="flex flex-col gap-3 border-t border-[#d7e2da] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-bold text-[#071f14]/55">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                      <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-full border border-[#d7e2da] px-4 py-2 text-xs font-black disabled:opacity-40">Prev</button>
                      <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-full bg-[#082719] px-4 py-2 text-xs font-black text-white disabled:opacity-40">Next</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-14 text-center text-[14px] font-bold text-[#071f14]/55">
                  {loading ? "Loading leave requests..." : "No leave requests found."}
                </div>
              )}
            </div>
          </HrSectionCard>
        </main>
      </div>

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#071f14]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_34px_90px_rgba(8,39,25,0.35)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7a84d]">Confirm Sign Out</p>
            <h2 className="mt-2 text-2xl font-black text-[#071f14]">Leave the HR portal?</h2>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowLogoutConfirm(false)} className="rounded-full bg-[#eef3ea] px-5 py-3 text-sm font-black text-[#395345]">Cancel</button><button type="button" onClick={logout} className="rounded-full bg-[#8b3232] px-5 py-3 text-sm font-black text-white">Sign Out</button></div>
          </div>
        </div>
      ) : null}

      {selectedLeave ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[30px] bg-white text-[#071f14] shadow-[0_30px_90px_rgba(0,0,0,0.35)]" style={{ animation: "hrLeaveModalIn 0.32s ease-out both" }}>
            <div className="relative overflow-hidden bg-[#082719] px-6 py-6 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,212,132,0.24),transparent_34%),linear-gradient(135deg,rgba(35,95,62,0.96),rgba(8,39,25,1))]" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#f4d484]">
                    Manpower HR Action
                  </p>
                  <h3 className="mt-2 text-3xl font-black tracking-tight text-white">
                    Review Leave Request
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-white/70">
                    {getEmployeeName(selectedLeave)} · {selectedLeave.leaveType || "Leave"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="rounded-full bg-white px-5 py-2 text-sm font-black text-[#082719] transition hover:-translate-y-0.5 hover:bg-[#f4d484]"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 rounded-[24px] border border-[#d7e2da] bg-[#f8fbf9] p-5 text-sm text-[#395345] md:grid-cols-2">
                <p><span className="font-black text-[#071f14]">Employee:</span> {getEmployeeName(selectedLeave)}</p>
                <p><span className="font-black text-[#071f14]">Email:</span> {selectedLeave.companyEmail || selectedLeave.email || "-"}</p>
                <p><span className="font-black text-[#071f14]">Contact:</span> {selectedLeave.contactNo || "-"}</p>
                <p><span className="font-black text-[#071f14]">Job:</span> {selectedLeave.vacancy || selectedLeave.job || "-"}</p>
                <p><span className="font-black text-[#071f14]">Deployment:</span> {selectedLeave.deploymentSite || selectedLeave.deployment || "-"}</p>
                <p><span className="font-black text-[#071f14]">Leave Type:</span> {selectedLeave.leaveType || "-"}</p>
                <p><span className="font-black text-[#071f14]">Status:</span> <StatusBadge status={selectedLeave.status} /></p>
                <p><span className="font-black text-[#071f14]">Dates:</span> {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}</p>
                <p><span className="font-black text-[#071f14]">Total Days:</span> {selectedLeave.totalDays || 0}</p>
                <p><span className="font-black text-[#071f14]">Filed:</span> {formatDateTime(selectedLeave.createdAt)}</p>
                <p><span className="font-black text-[#071f14]">Available Balance:</span> {selectedLeave.availableBalance ?? selectedLeave.leaveBalance ?? "Not provided"}</p>
                <p><span className="font-black text-[#071f14]">Supporting Document:</span> {selectedLeave.attachmentUrl || selectedLeave.attachment?.url ? <a href={selectedLeave.attachmentUrl || selectedLeave.attachment?.url} target="_blank" rel="noreferrer" className="font-black text-[#174a30] underline">Open attachment</a> : "None"}</p>
                <p className="md:col-span-2"><span className="font-black text-[#071f14]">Reason:</span> {selectedLeave.reason || "-"}</p>

                {selectedLeave.reviewedBy ? (
                  <p><span className="font-black text-[#071f14]">Reviewed By:</span> {selectedLeave.reviewedBy}</p>
                ) : null}

                {selectedLeave.reviewedAt ? (
                  <p><span className="font-black text-[#071f14]">Reviewed At:</span> {formatDateTime(selectedLeave.reviewedAt)}</p>
                ) : null}
              </div>

              {overlappingLeaves.length ? (
                <div className="mt-5 rounded-[18px] border border-[#f0d39a] bg-[#fff8e8] px-4 py-3 text-sm font-bold text-[#8a5206]">
                  Warning: {overlappingLeaves.length} overlapping pending or approved leave request(s) were found for this employee.
                </div>
              ) : null}

              <label className="mt-5 block text-sm font-black text-[#071f14]">
                HR Remarks
                <textarea
                  value={hrRemarks}
                  onChange={(event) => setHrRemarks(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-[18px] border border-[#d7e2da] bg-white px-4 py-3 text-sm font-semibold text-[#071f14] outline-none transition focus:border-[#d7a84d] focus:shadow-[0_14px_30px_rgba(8,39,25,0.10)]"
                  placeholder="Add approval or rejection remarks..."
                />
              </label>

              {message.error ? (
                <div className="mt-4 rounded-[18px] border border-[#efc9c9] bg-[#fff2f2] px-4 py-3 text-sm font-bold text-[#912f2f]">
                  {message.error}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end">
                <button
                  type="button"
                  disabled={actionLoading || normalizeStatus(selectedLeave.status) !== "PENDING"}
                  onClick={() => setPendingAction("reject")}
                  className="rounded-full bg-[#fff1f1] px-6 py-3 text-sm font-black text-[#9d2f2f] transition hover:-translate-y-0.5 hover:bg-[#fee2e2] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {actionLoading ? "Saving..." : "Reject"}
                </button>

                <button
                  type="button"
                  disabled={actionLoading || normalizeStatus(selectedLeave.status) !== "PENDING"}
                  onClick={() => setPendingAction("approve")}
                  className="rounded-full bg-[#174a30] px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#082719] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {actionLoading ? "Saving..." : "Approve"}
                </button>
              </div>

              {pendingAction ? (
                <div className="mt-5 rounded-[20px] border border-[#d7e2da] bg-[#f8fbf9] p-4">
                  <p className="text-sm font-black text-[#071f14]">Confirm {pendingAction === "approve" ? "approval" : "rejection"}?</p>
                  <p className="mt-1 text-xs font-semibold text-[#071f14]/55">This action updates the employee's leave record.</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setPendingAction("")} className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#395345]">Cancel</button>
                    <button type="button" onClick={() => reviewLeave(pendingAction)} disabled={actionLoading} className={`rounded-full px-4 py-2 text-xs font-black text-white ${pendingAction === "approve" ? "bg-[#174a30]" : "bg-[#8b3232]"}`}>{actionLoading ? "Saving..." : "Confirm"}</button>
                  </div>
                </div>
              ) : null}

              {normalizeStatus(selectedLeave.status) !== "PENDING" ? (
                <p className="mt-3 text-right text-xs font-semibold text-[#7a5b0b]">
                  This leave request was already reviewed.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

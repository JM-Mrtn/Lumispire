import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGO_IMAGE = "/ManpowerLogo.webp";
const HERO_IMAGE = "/ManpowerBanner.webp";

const EMPLOYEE_LOGIN_ROUTE = "/manpower-employee-login";
const EMPLOYEE_HOME_ROUTE = "/manpower-employee-home";
const EMPLOYEE_PAYROLL_ROUTE = "/manpower-employee-payroll";
const EMPLOYEE_LEAVE_ROUTE = "/manpower-employee-leave";
const EMPLOYEE_PROFILE_ROUTE = "/manpower-employee-profile";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const LEAVE_TYPES = [
  "Vacation Leave",
  "Sick Leave",
  "Emergency Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Bereavement Leave",
  "Other",
];

const fontMontserrat = { fontFamily: "Arial, Helvetica, sans-serif" };
const fontPontano = { fontFamily: "Arial, Helvetica, sans-serif" };
const fontPoppins = { fontFamily: "Arial, Helvetica, sans-serif" };

function HeaderNavLink({ to, children, active = false }) {
  return (
    <Link to={to} className={`ltc-nav-link ${active ? "active" : ""}`}>
      {children}
    </Link>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h5 style={fontMontserrat}>{title}</h5>
      <div className="mp-leave-footer-list" style={fontPontano}>
        {children}
      </div>
    </div>
  );
}

function getEmployeeToken() {
  return localStorage.getItem("manpowerEmployeeToken") || "";
}

function getEmployeeUser() {
  try {
    return JSON.parse(localStorage.getItem("manpowerEmployeeUser") || "null");
  } catch {
    return null;
  }
}

function clearEmployeeSession() {
  localStorage.removeItem("manpowerEmployeeToken");
  localStorage.removeItem("manpowerEmployeeUser");
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

function normalizeStatus(status) {
  return String(status || "PENDING").toUpperCase();
}

function StatusBadge({ status }) {
  const value = normalizeStatus(status);

  const className =
    value === "APPROVED"
      ? "is-approved"
      : value === "REJECTED"
      ? "is-rejected"
      : "is-pending";

  return <span className={`mp-leave-status ${className}`}>{value}</span>;
}

function SummaryCard({ label, value, tone = "default" }) {
  return (
    <article className={`mp-leave-summary-card is-${tone}`}>
      <p className="mp-leave-summary-label" style={fontPoppins}>
        {label}
      </p>
      <p className="mp-leave-summary-value" style={fontMontserrat}>
        {value}
      </p>
    </article>
  );
}

export default function ManpowerEmployeeLeave() {
  const navigate = useNavigate();

  const [token, setToken] = useState(getEmployeeToken());
  const [employee, setEmployee] = useState(getEmployeeUser());
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [message, setMessage] = useState({ success: "", error: "" });
  const [form, setForm] = useState({
    leaveType: "Vacation Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("all");
  const [historyDateFilter, setHistoryDateFilter] = useState("");
  const [historySortOrder, setHistorySortOrder] = useState("newest");
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const fullName = useMemo(() => {
    return [
      employee?.firstName || "",
      employee?.middleName || "",
      employee?.lastName || "",
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }, [employee]);

  const displayName = fullName || "Employee Full Name";
  const displayEmail =
    employee?.companyEmail || employee?.email || "employeeemail@manpower.com";

  const summary = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter((item) => normalizeStatus(item.status) === "PENDING")
        .length,
      approved: leaves.filter(
        (item) => normalizeStatus(item.status) === "APPROVED"
      ).length,
      rejected: leaves.filter(
        (item) => normalizeStatus(item.status) === "REJECTED"
      ).length,
    };
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    const selectedStatus = String(historyStatusFilter || "all").toUpperCase();
    const selectedType = String(historyTypeFilter || "all");
    const selectedDate = String(historyDateFilter || "");

    const matches = leaves.filter((item) => {
      const itemStatus = normalizeStatus(item.status);
      const itemType = String(item.leaveType || "");

      const matchesStatus =
        selectedStatus === "ALL" || itemStatus === selectedStatus;

      const matchesType = selectedType === "all" || itemType === selectedType;

      const matchesDate = !selectedDate || (() => {
        const start = item.startDate ? new Date(item.startDate) : null;
        const end = item.endDate ? new Date(item.endDate) : null;
        const selected = new Date(`${selectedDate}T00:00:00`);

        if (Number.isNaN(selected.getTime())) return true;
        if (!start || Number.isNaN(start.getTime())) return false;

        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();

        if (!end || Number.isNaN(end.getTime())) {
          return startDay === selected.getTime();
        }

        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
        return selected.getTime() >= startDay && selected.getTime() <= endDay;
      })();

      return matchesStatus && matchesType && matchesDate;
    });

    return [...matches].sort((a, b) => {
      const getTime = (item) => {
        const filed = item?.createdAt ? new Date(item.createdAt).getTime() : NaN;
        if (Number.isFinite(filed)) return filed;

        const start = item?.startDate ? new Date(item.startDate).getTime() : NaN;
        return Number.isFinite(start) ? start : 0;
      };

      return historySortOrder === "oldest" ? getTime(a) - getTime(b) : getTime(b) - getTime(a);
    });
  }, [leaves, historyStatusFilter, historyTypeFilter, historyDateFilter, historySortOrder]);

  const requestedDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(`${form.startDate}T00:00:00`);
    const end = new Date(`${form.endDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
    return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  }, [form.startDate, form.endDate]);

  const overlappingLeave = useMemo(() => {
    if (!form.startDate || !form.endDate) return null;
    const requestedStart = new Date(`${form.startDate}T00:00:00`).getTime();
    const requestedEnd = new Date(`${form.endDate}T23:59:59`).getTime();
    return leaves.find((item) => {
      const status = normalizeStatus(item?.status);
      if (!["PENDING", "APPROVED"].includes(status)) return false;
      const start = item?.startDate ? new Date(item.startDate).getTime() : NaN;
      const end = item?.endDate ? new Date(item.endDate).getTime() : start;
      return Number.isFinite(start) && Number.isFinite(end) && requestedStart <= end && requestedEnd >= start;
    }) || null;
  }, [form.startDate, form.endDate, leaves]);

  function clearHistoryFilters() {
    setHistoryStatusFilter("all");
    setHistoryTypeFilter("all");
    setHistoryDateFilter("");
    setHistorySortOrder("newest");
  }

  function logout() {
    clearEmployeeSession();
    setToken("");
    setEmployee(null);
    navigate(EMPLOYEE_LOGIN_ROUTE, { replace: true });
  }

  async function loadProfile() {
    try {
      const res = await fetch(`${API_BASE}/manpower/employee/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load employee profile.");
      }

      const nextEmployee = data.employee || null;
      setEmployee(nextEmployee);
      localStorage.setItem("manpowerEmployeeUser", JSON.stringify(nextEmployee));
    } catch (error) {
      setMessage({
        success: "",
        error: error?.message || "Failed to load employee profile.",
      });
    }
  }

  async function loadLeaves() {
    setLeaveLoading(true);

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/leaves`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      setLeaveLoading(false);
    }
  }

  async function initPage() {
    setLoading(true);
    await Promise.all([loadProfile(), loadLeaves()]);
    setLoading(false);
  }

  useEffect(() => {
    if (!token) {
      navigate(EMPLOYEE_LOGIN_ROUTE, { replace: true });
      return;
    }

    initPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  function submitLeave(event) {
    event.preventDefault();
    setMessage({ success: "", error: "" });

    if (!form.startDate || !form.endDate) {
      setMessage({ success: "", error: "Please select both the start and end dates." });
      return;
    }
    if (new Date(form.endDate).getTime() < new Date(form.startDate).getTime()) {
      setMessage({ success: "", error: "End date must not be earlier than start date." });
      return;
    }
    if (!form.reason.trim() || form.reason.trim().length < 10) {
      setMessage({ success: "", error: "Please enter a clear reason with at least 10 characters." });
      return;
    }
    if (form.reason.trim().length > 1000) {
      setMessage({ success: "", error: "Reason must not exceed 1,000 characters." });
      return;
    }
    if (overlappingLeave) {
      setMessage({
        success: "",
        error: `The selected dates overlap with an existing ${String(overlappingLeave.status || "pending").toLowerCase()} leave request.`,
      });
      return;
    }
    setShowSubmitConfirm(true);
  }

  async function confirmSubmitLeave() {
    setShowSubmitConfirm(false);
    setLeaveLoading(true);
    setMessage({ success: "", error: "" });

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/leaves`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaveType: form.leaveType,
          startDate: form.startDate,
          endDate: form.endDate,
          reason: form.reason.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(data?.message || "Failed to submit leave request.");

      setMessage({ success: data?.message || "Leave request submitted successfully.", error: "" });
      setForm({ leaveType: "Vacation Leave", startDate: "", endDate: "", reason: "" });
      await loadLeaves();
    } catch (error) {
      setMessage({ success: "", error: error?.message || "Failed to submit leave request." });
    } finally {
      setLeaveLoading(false);
    }
  }

  const inputClass = "mp-leave-input";

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  return (
    <div className="mp-leave-page" style={fontPontano}>
      <style>{`
        .mp-leave-page {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
          --green-600: #2f754c;
          --footer-green: #082719;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --dark: #101828;
          --muted: #667085;
          --glass: rgba(255,255,255,.82);
          --shadow-md: 0 18px 45px rgba(8,39,25,.12);
          --shadow-lg: 0 32px 80px rgba(8,39,25,.18);
          --radius: 24px;
          --ease: cubic-bezier(.22,1,.36,1);
          min-height: 100vh;
          color: var(--dark);
          background:
            radial-gradient(circle at 12% 0%, rgba(215,168,77,.12), transparent 28%),
            radial-gradient(circle at 92% 12%, rgba(35,95,62,.12), transparent 30%),
            linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%);
          line-height: 1.65;
          letter-spacing: -.01em;
          overflow-x: hidden;
          font-family: Arial, Helvetica, sans-serif;
        }

        .mp-leave-page * { box-sizing: border-box; }

        .mp-leave-container {
          width: min(1180px, 92%);
          margin: auto;
        }

        .mp-leave-header {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          background: var(--footer-green);
          border-bottom: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 10px 34px rgba(7,31,20,.14);
          margin: 0;
        }

        .mp-leave-header .mp-leave-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding-left: 32px;
          padding-right: 32px;
        }

        .mp-leave-nav {
          min-height: 76px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .mp-leave-logo {
          display: flex;
          align-items: center;
          gap: 13px;
          color: white;
          border: 0;
          background: transparent;
          cursor: pointer;
          text-align: left;
          padding: 0;
          text-decoration: none;
        }

        .mp-leave-logo-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(145deg,#fff,#e3f4ea);
          color: var(--green-800);
          font-weight: 900;
          box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
          object-fit: cover;
        }

        .mp-leave-logo h1 {
          font-size: 18px;
          line-height: 1;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -.04em;
          margin: 0;
        }

        .mp-leave-logo p {
          font-size: 11px;
          color: rgba(255,255,255,.72);
          margin: 3px 0 0;
        }

        .mp-leave-desktop-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mp-leave-nav-link {
          color: rgba(255,255,255,.78);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 10px 14px;
          border-radius: 999px;
          transition: .25s var(--ease);
          border: 0;
          background: transparent;
          cursor: pointer;
          text-decoration: none;
        }

        .mp-leave-nav-link:hover,
        .mp-leave-nav-link.active {
          color: white;
          background: rgba(255,255,255,.13);
          transform: translateY(-1px);
        }

        .mp-leave-profile-link {
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.22);
          min-width: 116px;
          text-align: center;
        }

        .mp-leave-menu-button {
          display: none;
          color: white;
          border: 0;
          background: rgba(255,255,255,.1);
          border-radius: 12px;
          padding: 10px;
          cursor: pointer;
        }

        .mp-leave-menu-button svg { width: 24px; height: 24px; }

        .mp-leave-sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(0,0,0,.42);
        }

        .mp-leave-sidebar-panel {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: min(310px, 86vw);
          background: white;
          box-shadow: -20px 0 60px rgba(0,0,0,.25);
          padding: 20px;
        }

        .mp-leave-sidebar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(16,24,40,.1);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .mp-leave-sidebar-title {
          color: var(--green-950);
          font-weight: 900;
          letter-spacing: .14em;
          font-size: 12px;
          margin: 0;
        }

        .mp-leave-sidebar-close {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 0;
          background: #f2f4f7;
          color: #101828;
          cursor: pointer;
          font-weight: 900;
        }

        .mp-leave-sidebar-link {
          display: block;
          width: 100%;
          border: 0;
          background: transparent;
          color: #101828;
          text-align: left;
          border-radius: 14px;
          padding: 13px 14px;
          font-weight: 800;
          margin-bottom: 8px;
          cursor: pointer;
        }

        .mp-leave-sidebar-link:hover,
        .mp-leave-sidebar-link.active {
          background: var(--green-800);
          color: white;
        }

        .mp-leave-hero {
          position: relative;
          overflow: hidden;
          color: white;
          isolation: isolate;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
          padding: 82px 0 78px;
        }

        .mp-leave-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -3;
          background:
            linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.88) 42%, rgba(12,64,39,.76) 100%);
          opacity: .96;
          transform: scale(1.02);
        }

        .mp-leave-hero::after {
          content: "";
          position: absolute;
          inset: -16% -10% -24% -10%;
          z-index: -2;
          background:
            radial-gradient(circle at 16% 82%, rgba(19,120,72,.36), transparent 24%),
            radial-gradient(circle at 36% 92%, rgba(7,76,47,.46), transparent 30%),
            radial-gradient(circle at 72% 18%, rgba(28,108,68,.28), transparent 30%),
            radial-gradient(circle at 88% 44%, rgba(244,212,132,.14), transparent 28%),
            radial-gradient(circle at 90% 84%, rgba(22,108,66,.30), transparent 26%),
            linear-gradient(135deg, rgba(3,24,15,.34), rgba(8,56,34,.08));
          pointer-events: none;
        }

        .mp-leave-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .mp-leave-eyebrow {
          display: inline-flex;
          color: var(--gold-soft);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .mp-leave-hero h2 {
          margin: 0;
          color: white;
          font-size: clamp(38px, 5.7vw, 66px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.055em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .mp-leave-hero h2 span { color: var(--gold-soft); }

        .mp-leave-hero p {
          max-width: 760px;
          margin: 18px auto 0;
          color: rgba(255,255,255,.80);
          font-size: 17px;
          line-height: 1.8;
        }

        .mp-leave-hero-actions {
          margin-top: 26px;
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .mp-leave-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 24px;
          border-radius: 999px;
          border: 0;
          cursor: pointer;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          transition: .28s var(--ease);
        }

        .mp-leave-btn:hover { transform: translateY(-3px); }

        .mp-leave-btn-primary {
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.28);
        }

        .mp-leave-btn-soft {
          color: white;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.18);
        }

        .mp-leave-section { padding: 84px 0; min-height: 760px; }

        .mp-leave-section-title {
          text-align: center;
          margin-bottom: 34px;
        }

        .mp-leave-section-title span {
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .mp-leave-section-title h3 {
          margin: 10px 0 0;
          color: var(--green-950);
          font-size: clamp(32px,4vw,50px);
          line-height: 1.08;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .mp-leave-section-title p {
          max-width: 760px;
          margin: 15px auto 0;
          color: var(--muted);
        }

        .mp-leave-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 28px;
        }

        .mp-leave-summary-card,
        .mp-leave-panel {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          transition: .38s var(--ease);
        }

        .mp-leave-summary-card::before,
        .mp-leave-panel::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          z-index: 3;
        }

        .mp-leave-summary-card {
          min-height: 150px;
          padding: 28px;
        }

        .mp-leave-summary-card::after {
          content: "";
          position: absolute;
          width: 150px;
          height: 150px;
          right: -70px;
          bottom: -80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(215,168,77,.22), transparent 58%);
          transition: .38s var(--ease);
        }

        .mp-leave-summary-card:hover,
        .mp-leave-panel:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(215,168,77,.45);
        }

        .mp-leave-summary-card:hover::after { transform: translate(-12px, -12px) scale(1.12); }

        .mp-leave-summary-label {
          position: relative;
          z-index: 1;
          margin: 0;
          color: rgba(7,31,20,.48);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .2em;
          text-transform: uppercase;
        }

        .mp-leave-summary-value {
          position: relative;
          z-index: 1;
          margin: 16px 0 0;
          color: var(--green-950);
          font-size: 46px;
          line-height: .9;
          font-weight: 900;
          letter-spacing: -.055em;
        }

        .mp-leave-summary-card.is-pending::before { background: linear-gradient(90deg,#d7a84d,#f4d484); }
        .mp-leave-summary-card.is-approved::before { background: linear-gradient(90deg,#17663b,#2f754c,#d7a84d); }
        .mp-leave-summary-card.is-rejected::before { background: linear-gradient(90deg,#8b3232,#c96a6a,#f4d484); }

        .mp-leave-message {
          border-radius: 18px;
          padding: 14px 18px;
          margin-bottom: 18px;
          font-size: 14px;
          font-weight: 800;
          box-shadow: 0 12px 26px rgba(8,39,25,.08);
        }

        .mp-leave-message.success {
          border: 1px solid rgba(37,99,60,.2);
          background: #edf8ee;
          color: #25633c;
        }

        .mp-leave-message.error {
          border: 1px solid rgba(145,47,47,.2);
          background: #fff2f2;
          color: #912f2f;
        }

        .mp-leave-main-grid {
          display: grid;
          grid-template-columns: .86fr 1.14fr;
          gap: 24px;
          align-items: start;
        }

        .mp-leave-panel-header {
          position: relative;
          padding: 30px 30px 22px;
          border-bottom: 1px solid rgba(35,95,62,.1);
        }

        .mp-leave-panel-header h3 {
          margin: 0;
          color: var(--green-950);
          font-size: clamp(24px,3vw,34px);
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -.055em;
        }

        .mp-leave-panel-header p {
          margin: 10px 0 0;
          color: var(--muted);
          font-size: 14px;
          font-weight: 650;
        }

        .mp-leave-panel-body { padding: 28px 30px 30px; }

        .mp-leave-form-grid {
          display: grid;
          gap: 18px;
        }

        .mp-leave-label {
          display: block;
          color: var(--green-950);
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .mp-leave-input {
          margin-top: 8px;
          width: 100%;
          min-height: 52px;
          border: 1px solid rgba(35,95,62,.16);
          border-radius: 18px;
          background: #fff;
          padding: 0 16px;
          color: var(--green-950);
          font-size: 14px;
          font-weight: 750;
          outline: none;
          box-shadow: 0 12px 24px rgba(8,39,25,.06);
          transition: .28s var(--ease);
        }

        textarea.mp-leave-input {
          min-height: 140px;
          padding-top: 14px;
          resize: none;
        }

        .mp-leave-input:focus {
          border-color: rgba(215,168,77,.72);
          box-shadow: 0 16px 34px rgba(8,39,25,.11);
          transform: translateY(-1px);
        }

        .mp-leave-date-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .mp-leave-history-toolbar {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
          gap: 12px;
          padding: 22px 22px 0;
          align-items: end;
        }

        .mp-leave-filter-label {
          display: block;
          min-width: 0;
          color: var(--green-950);
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .mp-leave-filter-control {
          margin-top: 7px;
          width: 100%;
          min-height: 46px;
          border: 1px solid rgba(35,95,62,.16);
          border-radius: 16px;
          background: #fff;
          padding: 0 14px;
          color: var(--green-950);
          font-size: 13px;
          font-weight: 800;
          outline: none;
          box-shadow: 0 10px 20px rgba(8,39,25,.06);
          transition: .28s var(--ease);
        }

        .mp-leave-filter-control:focus,
        .mp-leave-filter-control:hover {
          border-color: rgba(215,168,77,.72);
          box-shadow: 0 14px 28px rgba(8,39,25,.10);
          transform: translateY(-1px);
        }

        .mp-leave-clear-filter {
          min-height: 46px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(35,95,62,.16);
          background: #fff7df;
          color: var(--green-950);
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 10px 20px rgba(8,39,25,.06);
          transition: .28s var(--ease);
        }

        .mp-leave-clear-filter:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 32px rgba(8,39,25,.12);
        }

        .mp-leave-history-count {
          margin: 16px 22px 0;
          border-radius: 18px;
          border: 1px solid rgba(35,95,62,.12);
          background: #f7fbf8;
          padding: 12px 16px;
          color: #52695a;
          font-size: 13px;
          font-weight: 800;
        }

        .mp-leave-history-count strong {
          color: var(--green-950);
        }

        .mp-leave-table-wrap {
          overflow-x: auto;
          padding: 22px;
        }

        .mp-leave-table {
          width: 100%;
          min-width: 760px;
          border-collapse: separate;
          border-spacing: 0;
          overflow: hidden;
          border-radius: 20px;
          background: white;
          box-shadow: 0 12px 26px rgba(8,39,25,.07);
        }

        .mp-leave-table thead {
          background: #eef8f2;
          color: var(--green-800);
        }

        .mp-leave-table th {
          padding: 15px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .mp-leave-table td {
          padding: 15px 16px;
          border-top: 1px solid #edf2ed;
          color: #52695a;
          font-size: 13px;
          font-weight: 700;
          vertical-align: top;
        }

        .mp-leave-table td:first-child {
          color: var(--green-950);
          font-weight: 900;
        }

        .mp-leave-table tbody tr {
          transition: .25s var(--ease);
        }

        .mp-leave-table tbody tr:hover {
          background: #f8fbf8;
        }

        .mp-leave-status {
          display: inline-flex;
          border-radius: 999px;
          border: 1px solid transparent;
          padding: 7px 12px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .mp-leave-status.is-approved { border-color: #b9d8bb; background: #edf8ee; color: #25633c; }
        .mp-leave-status.is-rejected { border-color: #efc9c9; background: #fff2f2; color: #912f2f; }
        .mp-leave-status.is-pending { border-color: #ead28d; background: #fff7df; color: #7a5b0b; }

        .mp-leave-loading-card,
        .mp-leave-empty-row {
          padding: 54px 20px !important;
          text-align: center;
          color: var(--muted) !important;
          font-weight: 800 !important;
        }

        .mp-leave-footer {
          width: 100%;
          background: var(--footer-green);
          color: white;
          padding: 30px 0 12px;
          margin: 0;
        }

        .mp-leave-footer .mp-leave-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding-left: 32px;
          padding-right: 32px;
        }

        .mp-leave-footer-grid {
          width: 100%;
          display: grid;
          grid-template-columns: 1.5fr .9fr 1fr 1.65fr .9fr;
          gap: 22px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .mp-leave-footer h4 {
          color: white;
          font-weight: 900;
          font-size: 18px;
          line-height: 1.2;
          margin: 0 0 10px;
        }

        .mp-leave-footer h5 {
          color: #f4d484;
          font-size: 12px;
          line-height: 1.2;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .14em;
          margin: 0 0 10px;
        }

        .mp-leave-footer p,
        .mp-leave-footer a {
          display: block;
          color: rgba(255,255,255,.68);
          font-size: 13px;
          line-height: 1.55;
          margin: 5px 0;
          text-decoration: none;
        }

        .mp-leave-footer a:hover { color: white; text-decoration: underline; }

        .mp-leave-copyright {
          width: 100%;
          padding-top: 14px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: rgba(255,255,255,.52);
          font-size: 12px;
          line-height: 1.4;
        }

        @keyframes mpLeaveReveal {
          from { opacity: 0; transform: translateY(34px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .mp-leave-page *, .mp-leave-page *::before, .mp-leave-page *::after {
            animation-duration: .001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .001ms !important;
          }
        }

        @media (max-width: 1100px) {
          .mp-leave-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .mp-leave-main-grid { grid-template-columns: 1fr; }
          .mp-leave-history-toolbar { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .mp-leave-clear-filter { width: 100%; }
          .mp-leave-footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 900px) {
          .mp-leave-header .mp-leave-container { padding-left: 22px; padding-right: 22px; }
          .mp-leave-nav { min-height: auto; padding: 18px 0; }
          .mp-leave-desktop-nav { display: none; }
          .mp-leave-menu-button { display: grid; place-items: center; }
          .mp-leave-footer { padding: 28px 0 12px; }
          .mp-leave-footer-grid { grid-template-columns: 1fr; gap: 18px; padding-bottom: 22px; }
          .mp-leave-footer .mp-leave-container { padding-left: 22px; padding-right: 22px; }
          .mp-leave-copyright { flex-direction: column; }
        }

        @media (max-width: 600px) {
          .mp-leave-header .mp-leave-container,
          .mp-leave-footer .mp-leave-container { padding-left: 16px; padding-right: 16px; }
          .mp-leave-logo h1 { font-size: 14px; }
          .mp-leave-logo p { font-size: 10px; }
          .mp-leave-hero { padding: 70px 0 66px; }
          .mp-leave-hero h2 { font-size: clamp(34px, 11vw, 46px); letter-spacing: -.045em; }
          .mp-leave-hero p { font-size: 15px; }
          .mp-leave-section { padding: 64px 0; }
          .mp-leave-summary-grid { grid-template-columns: 1fr; }
          .mp-leave-history-toolbar { grid-template-columns: 1fr; }
          .mp-leave-date-grid { grid-template-columns: 1fr; }
          .mp-leave-panel-header,
          .mp-leave-panel-body { padding-left: 22px; padding-right: 22px; }
          .mp-leave-btn { width: 100%; }
        }
      

        /* ===== Unified LTC Manpower Employee Portal ===== */
        .mp-leave-header {
          position: sticky !important;
          top: 0 !important;
          z-index: 80 !important;
          width: 100% !important;
          background: #082719 !important;
          border-bottom: 1px solid rgba(255,255,255,.10) !important;
          box-shadow: 0 10px 34px rgba(7,31,20,.14) !important;
        }
        .mp-leave-header .mp-leave-container,
        .mp-leave-footer .mp-leave-container {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding-left: 32px !important;
          padding-right: 32px !important;
        }
        .mp-leave-nav {
          min-height: 76px !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 24px !important;
        }
        .mp-leave-logo { display: flex !important; align-items: center !important; gap: 13px !important; color: #fff !important; text-decoration: none !important; }
        .mp-leave-logo-icon {
          width: 42px !important; height: 42px !important; min-width: 42px !important;
          border-radius: 999px !important; background: #fff !important; object-fit: cover !important;
          box-shadow: 0 0 0 5px rgba(255,255,255,.08),0 12px 24px rgba(0,0,0,.12) !important;
        }
        .mp-leave-logo h1 { margin: 0 !important; color: #fff !important; font-size: 18px !important; line-height: 1 !important; font-weight: 900 !important; letter-spacing: -.04em !important; text-transform: uppercase !important; }
        .mp-leave-logo p { margin: 3px 0 0 !important; color: rgba(255,255,255,.72) !important; font-size: 11px !important; line-height: 1.3 !important; }
        .mp-leave-desktop-nav { margin-left: auto !important; display: flex !important; align-items: center !important; gap: 8px !important; }
        .mp-leave-nav-link {
          display: inline-flex !important; align-items: center !important; justify-content: center !important;
          min-height: 40px !important; padding: 0 14px !important; border: 0 !important; border-radius: 999px !important;
          background: transparent !important; color: rgba(255,255,255,.78) !important; font-size: 12px !important;
          font-weight: 800 !important; letter-spacing: .08em !important; line-height: 1 !important; text-transform: uppercase !important;
          text-decoration: none !important; white-space: nowrap !important;
        }
        .mp-leave-nav-link:hover,.mp-leave-nav-link.active { color:#fff !important; background:rgba(255,255,255,.13) !important; transform:translateY(-1px) !important; }
        .mp-leave-profile-link { min-width:104px !important; color:#102418 !important; background:linear-gradient(135deg,#f4d484,#d7a84d) !important; box-shadow:0 14px 28px rgba(215,168,77,.18) !important; }
        .mp-leave-profile-link:hover { color:#102418 !important; background:linear-gradient(135deg,#f8dc8c,#d7a84d) !important; }
        .mp-leave-menu-button {
          display:none !important; width:44px !important; height:44px !important; min-width:44px !important; padding:0 !important;
          border:0 !important; border-radius:12px !important; background:rgba(255,255,255,.10) !important; color:#fff !important;
        }
        .mp-leave-sidebar-overlay { position:fixed !important; inset:0 !important; z-index:100 !important; background:rgba(0,0,0,.42) !important; }
        .mp-leave-sidebar-panel { position:absolute !important; top:0 !important; right:0 !important; width:min(310px,86vw) !important; height:100% !important; padding:20px !important; overflow-y:auto !important; background:#fff !important; box-shadow:-20px 0 60px rgba(0,0,0,.25) !important; }
        .mp-leave-sidebar-top { display:flex !important; align-items:center !important; justify-content:space-between !important; margin-bottom:16px !important; padding-bottom:16px !important; border-bottom:1px solid rgba(16,24,40,.10) !important; }
        .mp-leave-sidebar-title { margin:0 !important; color:#071f14 !important; font-size:12px !important; font-weight:900 !important; letter-spacing:.14em !important; }
        .mp-leave-sidebar-close { width:44px !important; height:44px !important; border:0 !important; border-radius:12px !important; background:#f2f4f7 !important; color:#101828 !important; }
        .mp-leave-sidebar-link { display:flex !important; align-items:center !important; width:100% !important; min-height:48px !important; margin-bottom:8px !important; padding:0 14px !important; border:0 !important; border-radius:14px !important; background:transparent !important; color:#101828 !important; font-size:13px !important; font-weight:800 !important; text-align:left !important; text-decoration:none !important; }
        .mp-leave-sidebar-link:hover,.mp-leave-sidebar-link.active { color:#fff !important; background:#174a30 !important; }

        .mp-leave-hero {
          position:relative !important; min-height:300px !important; padding:0 !important; display:flex !important; align-items:center !important;
          overflow:hidden !important; isolation:isolate !important; color:#fff !important;
          background:linear-gradient(120deg,#03180f 0%,#082719 42%,#155f3b 100%) !important;
        }
        .mp-leave-hero-image { position:absolute !important; inset:0 !important; z-index:-4 !important; width:100% !important; height:100% !important; object-fit:cover !important; object-position:center !important; opacity:.28 !important; filter:saturate(.9) contrast(1.08) !important; }
        .mp-leave-hero::before { content:"" !important; position:absolute !important; inset:0 !important; z-index:-3 !important; background:linear-gradient(120deg,rgba(2,18,11,.96) 0%,rgba(5,37,23,.88) 42%,rgba(12,64,39,.76) 100%) !important; transform:none !important; }
        .mp-leave-hero::after { content:"" !important; position:absolute !important; inset:-16% -10% -24% !important; z-index:-2 !important; background:radial-gradient(circle at 16% 82%,rgba(19,120,72,.32),transparent 24%),radial-gradient(circle at 72% 18%,rgba(28,108,68,.24),transparent 30%),radial-gradient(circle at 88% 44%,rgba(244,212,132,.12),transparent 28%) !important; filter:none !important; transform:none !important; animation:none !important; }
        .mp-leave-hero-content { position:relative !important; z-index:2 !important; width:min(960px,92%) !important; max-width:960px !important; min-height:300px !important; margin:0 auto !important; padding:58px 0 62px !important; display:flex !important; flex-direction:column !important; align-items:center !important; justify-content:center !important; text-align:center !important; }
        .mp-leave-eyebrow { margin:0 0 10px !important; padding:8px 14px !important; border:1px solid rgba(255,255,255,.18) !important; border-radius:999px !important; background:rgba(255,255,255,.10) !important; color:#f4d484 !important; font-size:11px !important; font-weight:900 !important; letter-spacing:.18em !important; }
        .mp-leave-hero h2 { margin:0 !important; max-width:900px !important; color:#fff !important; font-size:clamp(40px,5.2vw,64px) !important; line-height:1 !important; font-weight:900 !important; letter-spacing:-.055em !important; text-align:center !important; }
        .mp-leave-hero p { max-width:720px !important; margin:18px auto 0 !important; color:rgba(255,255,255,.82) !important; font-size:16px !important; line-height:1.75 !important; text-align:center !important; }
        .mp-leave-section { padding-top:56px !important; padding-bottom:72px !important; }
        .mp-leave-summary-card,.mp-leave-panel { border-radius:28px !important; border:1px solid rgba(35,95,62,.10) !important; background:rgba(255,255,255,.90) !important; box-shadow:0 18px 45px rgba(8,39,25,.12) !important; }

        .mp-leave-footer { width:100% !important; margin:0 !important; padding:30px 0 12px !important; background:#082719 !important; color:#fff !important; }
        .mp-leave-footer-grid { width:100% !important; display:grid !important; grid-template-columns:1.2fr .8fr 1.2fr 1fr .8fr !important; gap:22px !important; padding-bottom:24px !important; border-bottom:1px solid rgba(255,255,255,.10) !important; }
        .mp-leave-footer .mp-leave-logo { align-items:center !important; }
        .mp-leave-footer .mp-leave-logo > div > p { display:none !important; }
        .mp-leave-footer .mp-leave-logo h4 { margin:0 !important; color:#fff !important; font-size:20px !important; font-weight:900 !important; text-transform:uppercase !important; }
        .mp-leave-footer h5 { margin:0 0 10px !important; color:#f4d484 !important; font-size:12px !important; font-weight:900 !important; letter-spacing:.14em !important; text-transform:uppercase !important; }
        .mp-leave-footer p,.mp-leave-footer a,.mp-leave-footer-link { display:block !important; margin:5px 0 !important; color:rgba(255,255,255,.68) !important; font-size:13px !important; line-height:1.55 !important; text-decoration:none !important; }
        .mp-leave-copyright { width:100% !important; padding-top:14px !important; display:flex !important; justify-content:space-between !important; gap:12px !important; color:rgba(255,255,255,.52) !important; font-size:12px !important; }
        @media (max-width:1180px) { .mp-leave-footer-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; } }
        @media (max-width:900px) {
          .mp-leave-header .mp-leave-container,.mp-leave-footer .mp-leave-container { padding-left:22px !important; padding-right:22px !important; }
          .mp-leave-nav { min-height:72px !important; }
          .mp-leave-desktop-nav { display:none !important; }
          .mp-leave-menu-button { display:grid !important; place-items:center !important; margin-left:auto !important; }
          .mp-leave-hero { min-height:260px !important; }
          .mp-leave-hero-content { min-height:260px !important; padding:48px 0 52px !important; }
          .mp-leave-footer-grid { grid-template-columns:1fr !important; gap:18px !important; padding-bottom:22px !important; }
          .mp-leave-copyright { flex-direction:column !important; }
        }
        @media (max-width:600px) {
          .mp-leave-header .mp-leave-container,.mp-leave-footer .mp-leave-container { padding-left:16px !important; padding-right:16px !important; }
          .mp-leave-logo h1 { font-size:14px !important; }
          .mp-leave-logo p { font-size:10px !important; }
          .mp-leave-hero { min-height:235px !important; }
          .mp-leave-hero-content { min-height:235px !important; padding:42px 0 46px !important; }
          .mp-leave-hero h2 { font-size:clamp(34px,11vw,48px) !important; }
          .mp-leave-hero p { font-size:14px !important; }
          .mp-leave-section { padding-top:42px !important; padding-bottom:56px !important; }
        }


        /* ===== FINAL UNIFIED EMPLOYEE HEADER ===== */
        .mp-leave-header {
          position: sticky !important; top:0 !important; z-index:100 !important; width:100% !important;
          height:76px !important; min-height:76px !important; margin:0 !important;
          background:#082719 !important; border-bottom:1px solid rgba(255,255,255,.10) !important;
          box-shadow:0 10px 34px rgba(7,31,20,.14) !important;
        }
        .mp-leave-header .mp-leave-container { width:100% !important; max-width:none !important; height:100% !important; margin:0 !important; padding:0 32px !important; }
        .mp-leave-nav { width:100% !important; height:76px !important; min-height:76px !important; padding:0 !important; display:flex !important; align-items:center !important; justify-content:flex-start !important; gap:24px !important; }
        .mp-leave-logo { min-width:0 !important; flex:0 0 auto !important; display:inline-flex !important; align-items:center !important; gap:13px !important; padding:0 !important; border:0 !important; background:transparent !important; color:#fff !important; text-decoration:none !important; }
        .mp-leave-logo-icon { width:42px !important; height:42px !important; min-width:42px !important; min-height:42px !important; border-radius:999px !important; background:#fff !important; object-fit:cover !important; box-shadow:0 0 0 5px rgba(255,255,255,.08),0 12px 24px rgba(0,0,0,.12) !important; }
        .mp-leave-logo h1 { margin:0 !important; color:#fff !important; font-size:18px !important; line-height:1 !important; font-weight:900 !important; letter-spacing:-.04em !important; text-transform:uppercase !important; white-space:nowrap !important; }
        .mp-leave-logo p { margin:3px 0 0 !important; color:rgba(255,255,255,.72) !important; font-size:11px !important; line-height:1.3 !important; white-space:nowrap !important; }
        .mp-leave-desktop-nav { margin-left:auto !important; display:flex !important; align-items:center !important; justify-content:flex-end !important; gap:8px !important; }
        .mp-leave-nav-link { min-height:40px !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; padding:0 14px !important; border:0 !important; border-radius:999px !important; background:transparent !important; color:rgba(255,255,255,.78) !important; font-size:12px !important; font-weight:800 !important; line-height:1 !important; letter-spacing:.08em !important; text-transform:uppercase !important; text-decoration:none !important; white-space:nowrap !important; cursor:pointer !important; }
        .mp-leave-nav-link:hover,.mp-leave-nav-link.active { color:#fff !important; background:rgba(255,255,255,.13) !important; transform:translateY(-1px) !important; }
        .mp-leave-profile-link { min-width:104px !important; margin-left:4px !important; color:#102418 !important; background:linear-gradient(135deg,#f4d484,#d7a84d) !important; box-shadow:0 14px 28px rgba(215,168,77,.18) !important; }
        .mp-leave-profile-link:hover { color:#102418 !important; background:linear-gradient(135deg,#f8dc8c,#d7a84d) !important; }
        .mp-leave-menu-button { display:none !important; width:44px !important; height:44px !important; min-width:44px !important; margin-left:auto !important; padding:0 !important; border:1px solid rgba(255,255,255,.12) !important; border-radius:14px !important; background:rgba(255,255,255,.10) !important; color:#fff !important; cursor:pointer !important; }
        .mp-leave-menu-button svg { width:24px !important; height:24px !important; }
        .mp-leave-sidebar-overlay { position:fixed !important; inset:0 !important; z-index:150 !important; background:rgba(0,0,0,.48) !important; backdrop-filter:blur(5px) !important; }
        .mp-leave-sidebar-panel { position:absolute !important; top:0 !important; right:0 !important; width:min(320px,88vw) !important; height:100% !important; padding:22px !important; overflow-y:auto !important; background:#fff !important; box-shadow:-24px 0 70px rgba(0,0,0,.28) !important; }
        .mp-leave-sidebar-top { display:flex !important; align-items:center !important; justify-content:space-between !important; margin-bottom:16px !important; padding-bottom:16px !important; border-bottom:1px solid rgba(16,24,40,.10) !important; }
        .mp-leave-sidebar-title { margin:0 !important; color:#071f14 !important; font-size:12px !important; font-weight:900 !important; letter-spacing:.14em !important; }
        .mp-leave-sidebar-close { width:44px !important; height:44px !important; border:0 !important; border-radius:13px !important; background:#f2f4f7 !important; color:#101828 !important; cursor:pointer !important; }
        .mp-leave-sidebar-link { width:100% !important; min-height:48px !important; display:flex !important; align-items:center !important; margin:0 0 8px !important; padding:0 14px !important; border:0 !important; border-radius:14px !important; background:transparent !important; color:#101828 !important; font-size:13px !important; font-weight:800 !important; letter-spacing:.06em !important; text-align:left !important; text-transform:uppercase !important; cursor:pointer !important; }
        .mp-leave-sidebar-link:hover,.mp-leave-sidebar-link.active { color:#fff !important; background:#174a30 !important; }
        @media (max-width:1000px) {
          .mp-leave-header { height:72px !important; min-height:72px !important; }
          .mp-leave-header .mp-leave-container { padding-left:22px !important; padding-right:22px !important; }
          .mp-leave-nav { height:72px !important; min-height:72px !important; }
          .mp-leave-desktop-nav { display:none !important; }
          .mp-leave-menu-button { display:grid !important; place-items:center !important; }
        }
        @media (max-width:700px) {
          .mp-leave-header { height:68px !important; min-height:68px !important; }
          .mp-leave-header .mp-leave-container { padding-left:16px !important; padding-right:16px !important; }
          .mp-leave-nav { height:68px !important; min-height:68px !important; gap:14px !important; }
          .mp-leave-logo-icon { width:40px !important; height:40px !important; min-width:40px !important; min-height:40px !important; }
          .mp-leave-logo h1 { font-size:14px !important; }
          .mp-leave-logo p { display:none !important; }
        }

        /* Exact employee header used by Home, Payroll, Leave, Profile, and Change Password */
        .ltc-header {
          position:sticky !important; top:0 !important; z-index:100 !important; width:100% !important;
          height:76px !important; min-height:76px !important; margin:0 !important;
          background:#082719 !important; border-bottom:1px solid rgba(255,255,255,.10) !important;
          box-shadow:0 10px 34px rgba(7,31,20,.14) !important;
        }
        .ltc-container { width:min(1180px,92%); margin:auto; }
        .ltc-header .ltc-container { width:100% !important; max-width:none !important; height:100% !important; margin:0 !important; padding:0 32px !important; }
        .ltc-nav { width:100% !important; height:76px !important; min-height:76px !important; padding:0 !important; display:flex !important; align-items:center !important; justify-content:flex-start !important; gap:24px !important; }
        .ltc-logo { min-width:0 !important; flex:0 0 auto !important; display:inline-flex !important; align-items:center !important; gap:13px !important; padding:0 !important; border:0 !important; background:transparent !important; color:#fff !important; text-align:left !important; text-decoration:none !important; cursor:pointer !important; }
        .ltc-logo-icon { width:42px !important; height:42px !important; min-width:42px !important; min-height:42px !important; border-radius:999px !important; background:#fff !important; object-fit:cover !important; box-shadow:0 0 0 5px rgba(255,255,255,.08),0 12px 24px rgba(0,0,0,.12) !important; }
        .ltc-logo h1 { margin:0 !important; color:#fff !important; font-size:18px !important; line-height:1 !important; font-weight:900 !important; letter-spacing:-.04em !important; text-transform:uppercase !important; white-space:nowrap !important; }
        .ltc-logo p { margin:3px 0 0 !important; color:rgba(255,255,255,.72) !important; font-size:11px !important; line-height:1.3 !important; white-space:nowrap !important; }
        .ltc-desktop-nav { margin-left:auto !important; display:flex !important; align-items:center !important; justify-content:flex-end !important; gap:8px !important; }
        .ltc-profile-wrap { margin-left:4px !important; display:flex !important; align-items:center !important; flex:0 0 auto !important; }
        .ltc-nav-link { min-height:40px !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; padding:0 14px !important; border:0 !important; border-radius:999px !important; background:transparent !important; color:rgba(255,255,255,.78) !important; font-size:12px !important; font-weight:800 !important; line-height:1 !important; letter-spacing:.08em !important; text-transform:uppercase !important; text-decoration:none !important; white-space:nowrap !important; cursor:pointer !important; transition:color .25s ease,background .25s ease,transform .25s ease !important; }
        .ltc-nav-link:hover,.ltc-nav-link.active { color:#fff !important; background:rgba(255,255,255,.13) !important; transform:translateY(-1px) !important; }
        .ltc-profile-wrap .ltc-nav-link,.ltc-nav-link.ltc-profile-button { min-width:104px !important; color:#102418 !important; background:linear-gradient(135deg,#f4d484,#d7a84d) !important; box-shadow:0 14px 28px rgba(215,168,77,.18) !important; }
        .ltc-profile-wrap .ltc-nav-link:hover,.ltc-nav-link.ltc-profile-button:hover { color:#102418 !important; background:linear-gradient(135deg,#f8dc8c,#d7a84d) !important; }
        .ltc-menu-button { display:none !important; width:44px !important; height:44px !important; min-width:44px !important; margin-left:auto !important; padding:0 !important; border:1px solid rgba(255,255,255,.12) !important; border-radius:14px !important; background:rgba(255,255,255,.10) !important; color:#fff !important; cursor:pointer !important; }
        .ltc-menu-button svg { width:24px !important; height:24px !important; }
        .ltc-sidebar-overlay { position:fixed !important; inset:0 !important; z-index:150 !important; background:rgba(0,0,0,.48) !important; backdrop-filter:blur(5px) !important; }
        .ltc-sidebar-panel { position:absolute !important; top:0 !important; right:0 !important; width:min(320px,88vw) !important; height:100% !important; padding:22px !important; overflow-y:auto !important; background:#fff !important; box-shadow:-24px 0 70px rgba(0,0,0,.28) !important; }
        .ltc-sidebar-top { display:flex !important; align-items:center !important; justify-content:space-between !important; margin-bottom:16px !important; padding-bottom:16px !important; border-bottom:1px solid rgba(16,24,40,.10) !important; }
        .ltc-sidebar-title { margin:0 !important; color:#071f14 !important; font-size:12px !important; font-weight:900 !important; letter-spacing:.14em !important; }
        .ltc-sidebar-close { width:44px !important; height:44px !important; border:0 !important; border-radius:13px !important; background:#f2f4f7 !important; color:#101828 !important; cursor:pointer !important; }
        .ltc-sidebar-link { width:100% !important; min-height:48px !important; display:flex !important; align-items:center !important; margin:0 0 8px !important; padding:0 14px !important; border:0 !important; border-radius:14px !important; background:transparent !important; color:#101828 !important; font-size:13px !important; font-weight:800 !important; letter-spacing:.06em !important; text-align:left !important; text-transform:uppercase !important; text-decoration:none !important; cursor:pointer !important; }
        .ltc-sidebar-link:hover,.ltc-sidebar-link.active { color:#fff !important; background:#174a30 !important; }

        .ltc-hero { position:relative !important; min-height:300px !important; padding:0 !important; display:flex !important; align-items:center !important; overflow:hidden !important; isolation:isolate !important; color:#fff !important; background:linear-gradient(120deg,#03180f 0%,#082719 42%,#155f3b 100%) !important; }
        .ltc-hero-slide { position:absolute !important; inset:0 !important; z-index:-4 !important; width:100% !important; height:100% !important; object-fit:cover !important; object-position:center !important; opacity:.28 !important; filter:saturate(.9) contrast(1.08) !important; animation:none !important; transform:none !important; }
        .ltc-hero::before { content:"" !important; position:absolute !important; inset:0 !important; z-index:-3 !important; background:linear-gradient(120deg,rgba(2,18,11,.96) 0%,rgba(5,37,23,.88) 42%,rgba(12,64,39,.76) 100%) !important; }
        .ltc-hero::after { content:"" !important; position:absolute !important; inset:-16% -10% -24% !important; z-index:-2 !important; background:radial-gradient(circle at 16% 82%,rgba(19,120,72,.32),transparent 24%),radial-gradient(circle at 72% 18%,rgba(28,108,68,.24),transparent 30%),radial-gradient(circle at 88% 44%,rgba(244,212,132,.12),transparent 28%) !important; pointer-events:none !important; animation:none !important; transform:none !important; filter:none !important; }
        .ltc-hero-content { position:relative !important; z-index:2 !important; width:min(960px,92%) !important; max-width:960px !important; min-height:300px !important; margin:0 auto !important; padding:58px 0 62px !important; display:flex !important; flex-direction:column !important; align-items:center !important; justify-content:center !important; text-align:center !important; animation:none !important; transform:none !important; }
        .ltc-hero-title { margin:14px 0 0 !important; max-width:900px !important; color:#fff !important; font-size:clamp(40px,5.2vw,64px) !important; line-height:1 !important; font-weight:900 !important; letter-spacing:-.055em !important; text-align:center !important; text-shadow:0 8px 26px rgba(0,0,0,.22) !important; animation:none !important; transform:none !important; }
        .ltc-hero-title span { color:#f4d484 !important; }
        .ltc-hero-text { max-width:720px !important; margin:18px auto 0 !important; color:rgba(255,255,255,.82) !important; font-size:16px !important; line-height:1.75 !important; text-align:center !important; animation:none !important; transform:none !important; }

        @media (max-width:1000px) {
          .ltc-header { height:72px !important; min-height:72px !important; }
          .ltc-header .ltc-container { padding-left:22px !important; padding-right:22px !important; }
          .ltc-nav { height:72px !important; min-height:72px !important; }
          .ltc-desktop-nav,.ltc-profile-wrap { display:none !important; }
          .ltc-menu-button { display:grid !important; place-items:center !important; }
          .ltc-hero { min-height:260px !important; }
          .ltc-hero-content { min-height:260px !important; padding:48px 0 52px !important; }
        }
        @media (max-width:700px) {
          .ltc-header { height:68px !important; min-height:68px !important; }
          .ltc-header .ltc-container { padding-left:16px !important; padding-right:16px !important; }
          .ltc-nav { height:68px !important; min-height:68px !important; gap:14px !important; }
          .ltc-logo-icon { width:40px !important; height:40px !important; min-width:40px !important; min-height:40px !important; }
          .ltc-logo h1 { font-size:14px !important; }
          .ltc-logo p { display:none !important; }
          .ltc-hero { min-height:235px !important; }
          .ltc-hero-content { min-height:235px !important; padding:42px 0 46px !important; }
          .ltc-hero-title { font-size:clamp(34px,11vw,48px) !important; }
          .ltc-hero-text { font-size:14px !important; }
        }

`}</style>

      <header className="ltc-header">
        <div className="ltc-container">
          <div className="ltc-nav">
            <Link to={EMPLOYEE_HOME_ROUTE} className="ltc-logo" aria-label="Manpower Employee Home">
              <img
                src={LOGO_IMAGE}
                width="128"
                height="128"
                decoding="async"
                alt="Manpower Logo"
                className="ltc-logo-icon"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://placehold.co/80x80/ffffff/45674b?text=M";
                }}
              />
              <div>
                <h1 style={fontMontserrat}>LTC MANPOWER SERVICES</h1>
                <p style={fontPontano}>Employee workforce portal.</p>
              </div>
            </Link>

            <nav className="ltc-desktop-nav" aria-label="Employee navigation">
              <HeaderNavLink to={EMPLOYEE_HOME_ROUTE}>Home</HeaderNavLink>
              <HeaderNavLink to={EMPLOYEE_PAYROLL_ROUTE}>Payroll</HeaderNavLink>
              <HeaderNavLink to={EMPLOYEE_LEAVE_ROUTE} active>Leave</HeaderNavLink>
            </nav>

            <div className="ltc-profile-wrap">
              <Link
                to={EMPLOYEE_PROFILE_ROUTE}
                className="ltc-nav-link ltc-profile-button"
                style={fontPoppins}
              >
                Profile
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="ltc-menu-button"
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="ltc-sidebar-overlay">
          <div style={{ position: "absolute", inset: 0 }} onClick={() => setMobileOpen(false)} />

          <div className="ltc-sidebar-panel">
            <div className="ltc-sidebar-top">
              <p className="ltc-sidebar-title" style={fontPoppins}>MENU</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="ltc-sidebar-close"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_HOME_ROUTE} className="ltc-sidebar-link" style={fontPoppins}>Home</Link>
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_PAYROLL_ROUTE} className="ltc-sidebar-link" style={fontPoppins}>Payroll</Link>
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_LEAVE_ROUTE} className="ltc-sidebar-link active" style={fontPoppins}>Leave</Link>
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_PROFILE_ROUTE} className="ltc-sidebar-link" style={fontPoppins}>Profile</Link>
          </div>
        </div>
      ) : null}

      <main>
        <section className="ltc-hero">
          <img
            src={HERO_IMAGE}
            alt="Manpower banner"
            className="ltc-hero-slide"
            width="1672"
            height="941"
            srcSet="/ManpowerBanner-960.webp 960w, /ManpowerBanner-1440.webp 1440w, /ManpowerBanner.webp 1672w"
            sizes="100vw"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div className="ltc-container ltc-hero-content">
            <h2 className="ltc-hero-title" style={fontMontserrat}>
              Leave <span>Requests</span>
            </h2>
            <p className="ltc-hero-text" style={fontPontano}>
              Submit a new request and keep track of your leave history.
            </p>
          </div>
        </section>

        <section className="mp-leave-section">
          <div className="mp-leave-container">
            <div className="mp-leave-section-title">
              <span style={fontPoppins}>Leave Overview</span>
              <h3 style={fontMontserrat}>Track your leave requests</h3>
              <p style={fontPontano}>
                
              </p>
            </div>

            {loading ? (
              <div className="mp-leave-panel">
                <div className="mp-leave-loading-card" style={fontPontano}>
                  Loading leave page...
                </div>
              </div>
            ) : (
              <>
                <div className="mp-leave-summary-grid">
                  <SummaryCard label="Total" value={summary.total} />
                  <SummaryCard label="Pending" value={summary.pending} tone="pending" />
                  <SummaryCard label="Approved" value={summary.approved} tone="approved" />
                  <SummaryCard label="Rejected" value={summary.rejected} tone="rejected" />
                </div>

                {message.success ? (
                  <div className="mp-leave-message success" style={fontPontano}>
                    {message.success}
                  </div>
                ) : null}

                {message.error ? (
                  <div className="mp-leave-message error" style={fontPontano}>
                    {message.error}
                  </div>
                ) : null}

                <div className="mp-leave-main-grid">
                  <form id="new-leave-request" onSubmit={submitLeave} className="mp-leave-panel">
                    <div className="mp-leave-panel-header">
                      <h3 style={fontMontserrat}>New Leave Request</h3>
                      <p style={fontPontano}>Complete the form below. HR will review your request.</p>
                    </div>

                    <div className="mp-leave-panel-body">
                      <div className="mp-leave-form-grid">
                        <label className="mp-leave-label" style={fontPoppins}>
                          Leave Type
                          <select
                            value={form.leaveType}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                leaveType: event.target.value,
                              }))
                            }
                            className={inputClass}
                          >
                            {LEAVE_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="mp-leave-date-grid">
                          <label className="mp-leave-label" style={fontPoppins}>
                            Start Date
                            <input
                              type="date"
                              value={form.startDate}
                              onChange={(event) =>
                                setForm((prev) => ({
                                  ...prev,
                                  startDate: event.target.value,
                                }))
                              }
                              className={inputClass}
                              required
                            />
                          </label>

                          <label className="mp-leave-label" style={fontPoppins}>
                            End Date
                            <input
                              type="date"
                              value={form.endDate}
                              onChange={(event) =>
                                setForm((prev) => ({
                                  ...prev,
                                  endDate: event.target.value,
                                }))
                              }
                              className={inputClass}
                              required
                            />
                          </label>
                        </div>

                        <label className="mp-leave-label" style={fontPoppins}>
                          Reason
                          <textarea
                            value={form.reason}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                reason: event.target.value,
                              }))
                            }
                            rows={6}
                            maxLength={1000}
                            className={inputClass}
                            placeholder="Explain the reason for your leave request..."
                            required
                          />
                          <span style={{ display: "block", marginTop: 6, color: "#667085", fontSize: 12 }}>
                            {form.reason.length}/1000 characters
                          </span>
                        </label>

                        {requestedDays > 0 ? (
                          <div style={{ padding: "12px 14px", borderRadius: 14, background: overlappingLeave ? "#fff4f4" : "#f0f8f3", border: `1px solid ${overlappingLeave ? "#efb7b7" : "#cbe2d2"}`, color: overlappingLeave ? "#8b2525" : "#245b3b", fontWeight: 700 }}>
                            {requestedDays} calendar day{requestedDays === 1 ? "" : "s"} requested.
                            {overlappingLeave ? " These dates overlap with an existing leave request." : " No overlapping pending or approved leave was found."}
                          </div>
                        ) : null}

                        <button
                          type="submit"
                          disabled={leaveLoading}
                          className="mp-leave-btn mp-leave-btn-primary"
                          style={fontMontserrat}
                        >
                          {leaveLoading ? "Submitting..." : "Review Leave Request"}
                        </button>
                      </div>
                    </div>
                  </form>

                  <section className="mp-leave-panel">
                    <div className="mp-leave-panel-header">
                      <h3 style={fontMontserrat}>My Leave History</h3>
                      <p style={fontPontano}>Filter leave requests by status, type, date, and filed order.</p>
                    </div>

                    <div className="mp-leave-history-toolbar">
                      <label className="mp-leave-filter-label" style={fontPoppins}>
                        Status
                        <select
                          value={historyStatusFilter}
                          onChange={(event) => setHistoryStatusFilter(event.target.value)}
                          className="mp-leave-filter-control"
                        >
                          <option value="all">All Status</option>
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </label>

                      <label className="mp-leave-filter-label" style={fontPoppins}>
                        Leave Type
                        <select
                          value={historyTypeFilter}
                          onChange={(event) => setHistoryTypeFilter(event.target.value)}
                          className="mp-leave-filter-control"
                        >
                          <option value="all">All Types</option>
                          {LEAVE_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="mp-leave-filter-label" style={fontPoppins}>
                        Date Covered
                        <input
                          type="date"
                          value={historyDateFilter}
                          onChange={(event) => setHistoryDateFilter(event.target.value)}
                          className="mp-leave-filter-control"
                        />
                      </label>

                      <label className="mp-leave-filter-label" style={fontPoppins}>
                        Sort Filed
                        <select
                          value={historySortOrder}
                          onChange={(event) => setHistorySortOrder(event.target.value)}
                          className="mp-leave-filter-control"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                        </select>
                      </label>

                      <button
                        type="button"
                        onClick={clearHistoryFilters}
                        className="mp-leave-clear-filter"
                        style={fontMontserrat}
                      >
                        Clear
                      </button>
                    </div>

                    <div className="mp-leave-history-count" style={fontPontano}>
                      Showing <strong>{filteredLeaves.length}</strong> of <strong>{leaves.length}</strong> leave request{leaves.length === 1 ? "" : "s"}.
                    </div>

                    <div className="mp-leave-table-wrap">
                      <table className="mp-leave-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Dates</th>
                            <th>Days</th>
                            <th>Status</th>
                            <th>HR Remarks</th>
                            <th>Filed</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredLeaves.map((row) => (
                            <tr key={row._id}>
                              <td>{row.leaveType || "-"}</td>
                              <td>
                                {formatDate(row.startDate)} - {formatDate(row.endDate)}
                              </td>
                              <td>{row.totalDays || 0}</td>
                              <td>
                                <StatusBadge status={row.status} />
                              </td>
                              <td>{row.hrRemarks || "-"}</td>
                              <td>{formatDateTime(row.createdAt)}</td>
                            </tr>
                          ))}

                          {!leaveLoading && leaves.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="mp-leave-empty-row">
                                No leave requests yet.
                              </td>
                            </tr>
                          ) : null}

                          {!leaveLoading && leaves.length > 0 && filteredLeaves.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="mp-leave-empty-row">
                                No leave requests match the selected filters.
                              </td>
                            </tr>
                          ) : null}

                          {leaveLoading ? (
                            <tr>
                              <td colSpan={6} className="mp-leave-empty-row">
                                Loading leave requests...
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="mp-leave-footer">
        <div className="mp-leave-container mp-leave-footer-grid">
          <div>
            <Link to={EMPLOYEE_HOME_ROUTE} className="mp-leave-logo">
              <img src={LOGO_IMAGE} alt="Manpower Logo" className="mp-leave-logo-icon" width="128" height="128" decoding="async" />

              <div>
                <h4 style={fontMontserrat}>LTC Manpower</h4>
                <p style={fontPontano}>Professional staffing and workforce support solutions.</p>
              </div>
            </Link>
          </div>

          <FooterColumn title="Menu">
            <Link to={EMPLOYEE_HOME_ROUTE}>Home</Link>
            <Link to={EMPLOYEE_PAYROLL_ROUTE}>Payroll</Link>
            <Link to={EMPLOYEE_LEAVE_ROUTE}>Leave</Link>
            <Link to={EMPLOYEE_PROFILE_ROUTE}>Profile</Link>
          </FooterColumn>

          <FooterColumn title="Contact Information">
            <p>ltc.tamsi@gmail.com</p>
            <p>lorengladius@ltcmultiservices.com</p>
            <p>+639516281271 / +639959808051</p>
          </FooterColumn>

          <FooterColumn title="Address">
            <p>2/F 5441 Currie Street,</p>
            <p>Palanan, Makati City</p>
          </FooterColumn>

          <FooterColumn title="Follow Us">
            <a href="https://www.facebook.com/profile.php?id=61571746334920" target="_blank" rel="noreferrer">Facebook Page</a>
            <a href="mailto:lorengladius@ltcmultiservices.com">Email LTC Manpower</a>
          </FooterColumn>
        </div>

        <div className="mp-leave-container mp-leave-copyright">
          <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
        </div>
      </footer>

      {showSubmitConfirm ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", padding: 20, background: "rgba(3,24,15,.72)", backdropFilter: "blur(6px)" }}>
          <div role="dialog" aria-modal="true" aria-labelledby="leave-confirm-title" style={{ width: "min(520px,100%)", borderRadius: 24, background: "white", padding: 26, boxShadow: "0 30px 80px rgba(0,0,0,.28)" }}>
            <p style={{ margin: 0, color: "#d7a84d", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12 }}>Confirm request</p>
            <h2 id="leave-confirm-title" style={{ margin: "8px 0 14px", color: "#0e3321", fontFamily: "Arial, Helvetica, sans-serif" }}>Submit this leave request?</h2>
            <div style={{ borderRadius: 16, background: "#f6faf7", border: "1px solid #dce9df", padding: 16, color: "#344b3d" }}>
              <strong>{form.leaveType}</strong>
              <p style={{ margin: "6px 0 0" }}>{formatDate(form.startDate)} - {formatDate(form.endDate)}</p>
              <p style={{ margin: "4px 0 0" }}>{requestedDays} calendar day{requestedDays === 1 ? "" : "s"}</p>
              <p style={{ margin: "10px 0 0", whiteSpace: "pre-wrap" }}>{form.reason.trim()}</p>
            </div>
            <p style={{ color: "#667085", fontSize: 13 }}>HR will review this request. Submitted details cannot be edited from the employee portal.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <button type="button" onClick={() => setShowSubmitConfirm(false)} className="mp-leave-btn" style={{ background: "#eef2ef", color: "#244532" }}>Go Back</button>
              <button type="button" onClick={confirmSubmitLeave} className="mp-leave-btn mp-leave-btn-primary">Confirm and Submit</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

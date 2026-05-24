import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGO_IMAGE = "/ManpowerLogo.png";
const HERO_IMAGE = "/LTCBanner.png";

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

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

function HeaderNavLink({ to, children, active = false }) {
  return (
    <Link to={to} className={`mp-leave-nav-link ${active ? "active" : ""}`}>
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

      setEmployee(data.employee || null);
      localStorage.setItem(
        "manpowerEmployeeUser",
        JSON.stringify(data.employee || null)
      );
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

  async function submitLeave(event) {
    event.preventDefault();

    setMessage({ success: "", error: "" });

    if (!form.startDate) {
      setMessage({ success: "", error: "Please select a start date." });
      return;
    }

    if (!form.endDate) {
      setMessage({ success: "", error: "Please select an end date." });
      return;
    }

    if (new Date(form.endDate).getTime() < new Date(form.startDate).getTime()) {
      setMessage({
        success: "",
        error: "End date must not be earlier than start date.",
      });
      return;
    }

    if (!form.reason.trim() || form.reason.trim().length < 5) {
      setMessage({
        success: "",
        error: "Please enter a reason with at least 5 characters.",
      });
      return;
    }

    setLeaveLoading(true);

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

      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit leave request.");
      }

      setMessage({
        success: data?.message || "Leave request submitted successfully.",
        error: "",
      });

      setForm({
        leaveType: "Vacation Leave",
        startDate: "",
        endDate: "",
        reason: "",
      });

      await loadLeaves();
    } catch (error) {
      setMessage({
        success: "",
        error: error?.message || "Failed to submit leave request.",
      });
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
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

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
          font-family: "Inter", Arial, sans-serif;
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
          width: 38px;
          height: 38px;
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
            linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.88) 42%, rgba(12,64,39,.76) 100%),
            url("${HERO_IMAGE}") center center / cover no-repeat;
          background-blend-mode: multiply;
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
          filter: blur(30px);
          pointer-events: none;
        }

        .mp-leave-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
          animation: mpLeaveReveal .8s var(--ease) both;
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
          backdrop-filter: blur(8px);
        }

        .mp-leave-section { padding: 84px 0; }

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
          backdrop-filter: blur(18px);
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
      `}</style>

      <header className="mp-leave-header">
        <div className="mp-leave-container mp-leave-nav">
          <Link to={EMPLOYEE_HOME_ROUTE} className="mp-leave-logo">
            <img src={LOGO_IMAGE} alt="Manpower Logo" className="mp-leave-logo-icon" />
            <div>
              <h1 style={fontMontserrat}>LTC MANPOWER SERVICES</h1>
              <p style={fontPontano}>Professional staffing and workforce solutions.</p>
            </div>
          </Link>

          <nav className="mp-leave-desktop-nav" style={fontPoppins}>
            <HeaderNavLink to={EMPLOYEE_HOME_ROUTE}>Home</HeaderNavLink>
            <HeaderNavLink to={EMPLOYEE_PAYROLL_ROUTE}>Payroll</HeaderNavLink>
            <HeaderNavLink to={EMPLOYEE_LEAVE_ROUTE} active>Leave</HeaderNavLink>
            <Link
              to={EMPLOYEE_PROFILE_ROUTE}
              className="mp-leave-nav-link mp-leave-profile-link"
            >
              Profile
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="mp-leave-menu-button"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="mp-leave-sidebar-overlay">
          <div style={{ position: "absolute", inset: 0 }} onClick={() => setMobileOpen(false)} />
          <div className="mp-leave-sidebar-panel">
            <div className="mp-leave-sidebar-top">
              <p className="mp-leave-sidebar-title" style={fontPoppins}>MENU</p>
              <button type="button" onClick={() => setMobileOpen(false)} className="mp-leave-sidebar-close" aria-label="Close menu">
                ✕
              </button>
            </div>
            <div style={fontPoppins}>
              <button type="button" onClick={() => goTo(EMPLOYEE_HOME_ROUTE)} className="mp-leave-sidebar-link">Home</button>
              <button type="button" onClick={() => goTo(EMPLOYEE_PAYROLL_ROUTE)} className="mp-leave-sidebar-link">Payroll</button>
              <button type="button" onClick={() => goTo(EMPLOYEE_LEAVE_ROUTE)} className="mp-leave-sidebar-link active">Leave</button>
              <button type="button" onClick={() => goTo(EMPLOYEE_PROFILE_ROUTE)} className="mp-leave-sidebar-link">Profile</button>
            </div>
          </div>
        </div>
      ) : null}

      <main>
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
                            className={inputClass}
                            placeholder="Write your reason for leave..."
                            required
                          />
                        </label>

                        <button
                          type="submit"
                          disabled={leaveLoading}
                          className="mp-leave-btn mp-leave-btn-primary"
                          style={fontMontserrat}
                        >
                          {leaveLoading ? "Submitting..." : "Submit Leave Request"}
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
              <img src={LOGO_IMAGE} alt="Manpower Logo" className="mp-leave-logo-icon" />
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
            <p>ltc.tamis@gmail.com</p>
            <p>lorengladisu@ltcmultiservices.com</p>
            <p>09959808051 / 09516281271</p>
          </FooterColumn>

          <FooterColumn title="Address">
            <p>2/F 544 Curie Street,</p>
            <p>Palanan, Makati City</p>
          </FooterColumn>

          <FooterColumn title="Follow Us">
            <p>Facebook</p>
            <p>Email</p>
            <p>LinkedIn</p>
          </FooterColumn>
        </div>

        <div className="mp-leave-container mp-leave-copyright">
          <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
        </div>
      </footer>
    </div>
  );
}

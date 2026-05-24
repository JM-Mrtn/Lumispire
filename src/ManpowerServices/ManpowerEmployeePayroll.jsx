import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const LOGO_IMAGE = "/ManpowerLogo.png";

const EMPLOYEE_LOGIN_ROUTE = "/manpower-employee-login";
const EMPLOYEE_HOME_ROUTE = "/manpower-employee-home";
const EMPLOYEE_PAYROLL_ROUTE = "/manpower-employee-payroll";
const EMPLOYEE_LEAVE_ROUTE = "/manpower-employee-leave";
const EMPLOYEE_PROFILE_ROUTE = "/manpower-employee-profile";

const COMPANY_NAME = "LTC Manpower Services";
const COMPANY_ADDRESS = "2/F 544 Curie Street, Palanan, Makati City";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const employeePayrollAssignmentStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-trainee-home-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --glass: rgba(255,255,255,.84);
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

  .ltc-trainee-home-page * { box-sizing: border-box; }
  .ltc-container { width: min(1180px, 92%); margin: auto; }

  .ltc-header {
    position: sticky;
    top: 0;
    z-index: 50;
    width: 100%;
    background: var(--footer-green);
    border-bottom: 1px solid rgba(255,255,255,.1);
    box-shadow: 0 10px 34px rgba(7,31,20,.14);
    margin: 0;
  }

  .ltc-header .ltc-container {
    width: 100%;
    max-width: none;
    margin: 0;
    padding-left: 32px;
    padding-right: 32px;
  }

  .ltc-nav {
    min-height: 76px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }

  .ltc-logo {
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

  .ltc-logo-icon {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    background: white;
    object-fit: cover;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
  }

  .ltc-logo h1 {
    font-size: 18px;
    line-height: 1;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -.04em;
    margin: 0;
  }

  .ltc-logo p {
    font-size: 11px;
    color: rgba(255,255,255,.72);
    margin: 3px 0 0;
  }

  .ltc-desktop-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .ltc-profile-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ltc-nav-link {
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
    white-space: nowrap;
    text-decoration: none;
  }

  .ltc-nav-link:hover,
  .ltc-nav-link.active {
    color: white;
    background: rgba(255,255,255,.13);
    transform: translateY(-1px);
  }

  .ltc-profile-button {
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 14px 28px rgba(215,168,77,.18);
  }

  .ltc-menu-button {
    display: none;
    color: white;
    border: 0;
    background: rgba(255,255,255,.1);
    border-radius: 12px;
    padding: 10px;
    cursor: pointer;
  }

  .ltc-menu-button svg { width: 24px; height: 24px; }

  .ltc-sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 80;
    background: rgba(0,0,0,.42);
  }

  .ltc-sidebar-panel {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: min(310px, 86vw);
    background: white;
    box-shadow: -20px 0 60px rgba(0,0,0,.25);
    padding: 20px;
  }

  .ltc-sidebar-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(16,24,40,.1);
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .ltc-sidebar-title {
    color: var(--green-950);
    font-weight: 900;
    letter-spacing: .14em;
    font-size: 12px;
  }

  .ltc-sidebar-close {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    border: 0;
    background: #f2f4f7;
    color: #101828;
    cursor: pointer;
  }

  .ltc-sidebar-link {
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
    text-decoration: none;
  }

  .ltc-sidebar-link:hover,
  .ltc-sidebar-link.active {
    background: var(--green-800);
    color: white;
  }

  .ltc-hero {
    position: relative;
    min-height: 360px;
    overflow: hidden;
    color: white;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
    display: flex;
    align-items: center;
  }

  .ltc-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(circle at 12% 20%, rgba(244,212,132,.16), transparent 28%),
      radial-gradient(circle at 90% 18%, rgba(35,95,62,.48), transparent 32%),
      linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.90) 46%, rgba(12,64,39,.76) 100%);
  }

  .ltc-hero::after {
    content: "";
    position: absolute;
    inset: -16% -10% -24% -10%;
    z-index: 1;
    background:
      radial-gradient(circle at 16% 82%, rgba(19,120,72,.36), transparent 24%),
      radial-gradient(circle at 88% 44%, rgba(244,212,132,.14), transparent 28%),
      linear-gradient(135deg, rgba(3,24,15,.34), rgba(8,56,34,.08));
    filter: blur(30px);
    pointer-events: none;
  }

  .ltc-hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
    padding: 76px 0 84px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: ltcAppleReveal .9s var(--ease) both;
  }

  .ltc-hero-title {
    margin: 0 auto;
    max-width: 940px;
    font-size: clamp(42px, 6vw, 76px);
    line-height: .98;
    font-weight: 900;
    letter-spacing: -.065em;
    text-shadow: 0 8px 26px rgba(0,0,0,.22);
  }

  .ltc-hero-title span { color: var(--gold-soft); }

  .ltc-hero-text {
    max-width: 720px;
    margin: 24px auto 0;
    color: rgba(255,255,255,.80);
    font-size: 18px;
    line-height: 1.8;
  }

  .ltc-payroll-overview {
    padding: 64px 0 84px;
  }

  .ltc-payroll-panel {
    position: relative;
    overflow: hidden;
    border-radius: 32px;
    background: var(--glass);
    border: 1px solid rgba(255,255,255,.82);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
    padding: 28px;
    animation: ltcAppleReveal .75s var(--ease) both;
  }

  .ltc-payroll-panel::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 6px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
  }

  .ltc-payroll-header-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 22px;
    align-items: end;
    padding-bottom: 22px;
    border-bottom: 1px solid rgba(35,95,62,.12);
  }

  .ltc-payroll-title {
    color: var(--green-950);
    font-size: clamp(30px, 4vw, 46px);
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -.055em;
    margin: 0;
  }

  .ltc-payroll-subtitle {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: 14px;
    font-weight: 700;
  }

  .ltc-payroll-meta-row {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .ltc-payroll-meta-row span {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    background: #eef4ef;
    color: var(--green-800);
    padding: 8px 13px;
    font-size: 12px;
    font-weight: 900;
  }

  .ltc-employee-card {
    min-width: 260px;
    border-radius: 24px;
    background: linear-gradient(135deg, rgba(8,39,25,.96), rgba(35,95,62,.9));
    color: white;
    padding: 22px;
    box-shadow: 0 18px 45px rgba(8,39,25,.18);
  }

  .ltc-employee-label {
    margin: 0;
    color: var(--gold-soft);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .18em;
    text-transform: uppercase;
  }

  .ltc-employee-name {
    margin: 7px 0 0;
    font-size: 22px;
    line-height: 1.15;
    font-weight: 900;
  }

  .ltc-employee-email {
    margin: 6px 0 0;
    font-size: 13px;
    color: rgba(255,255,255,.76);
    word-break: break-word;
  }

  .ltc-payroll-tools {
    margin-top: 22px;
    display: grid;
    grid-template-columns: minmax(220px, 1.2fr) minmax(160px, .7fr) minmax(160px, .7fr) minmax(170px, .75fr) auto;
    gap: 14px;
    align-items: center;
  }

  .ltc-payroll-search,
  .ltc-payroll-filter {
    width: 100%;
    min-height: 54px;
    border: 1px solid rgba(35,95,62,.18);
    border-radius: 999px;
    background: #fff;
    padding: 0 22px;
    font-size: 14px;
    font-weight: 700;
    color: var(--green-950);
    outline: none;
    transition: .28s var(--ease);
    box-shadow: 0 12px 24px rgba(8,39,25,.06);
  }

  .ltc-payroll-search:focus,
  .ltc-payroll-filter:focus {
    border-color: rgba(215,168,77,.72);
    box-shadow: 0 16px 34px rgba(8,39,25,.11);
    transform: translateY(-1px);
  }

  .ltc-payroll-filter {
    cursor: pointer;
  }

  .ltc-payroll-filter[type="date"] {
    color-scheme: light;
  }

  .ltc-primary-button,
  .ltc-outline-button {
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 0 22px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform .28s var(--ease), box-shadow .28s var(--ease), background .28s var(--ease), color .28s var(--ease);
    text-decoration: none;
  }

  .ltc-primary-button {
    border: 0;
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 16px 35px rgba(215,168,77,.24);
  }

  .ltc-outline-button {
    border: 1px solid rgba(35,95,62,.18);
    color: var(--green-950);
    background: white;
  }

  .ltc-primary-button:hover,
  .ltc-outline-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 45px rgba(8,39,25,.14);
  }

  .ltc-primary-button:disabled {
    opacity: .65;
    cursor: not-allowed;
    transform: none;
  }

  .ltc-payroll-list {
    margin-top: 24px;
    border-radius: 28px;
    background: linear-gradient(135deg, rgba(8,39,25,.96), rgba(35,95,62,.9));
    box-shadow: var(--shadow-lg);
    padding: 22px;
    min-height: 430px;
  }

  .ltc-state-card {
    border-radius: 22px;
    background: white;
    color: var(--muted);
    padding: 42px 24px;
    text-align: center;
    font-weight: 800;
    box-shadow: 0 14px 30px rgba(8,39,25,.10);
  }

  .ltc-state-card.error {
    border: 1px solid #fecaca;
    background: #fef2f2;
    color: #b91c1c;
  }

  .ltc-payroll-items {
    display: grid;
    gap: 14px;
  }

  .ltc-payroll-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 18px;
    align-items: center;
    border-radius: 24px;
    background: rgba(255,255,255,.94);
    border: 1px solid rgba(255,255,255,.7);
    padding: 20px;
    box-shadow: 0 14px 30px rgba(8,39,25,.12);
    transition: transform .32s var(--ease), box-shadow .32s var(--ease), border-color .32s var(--ease);
  }

  .ltc-payroll-item:hover {
    transform: translateY(-5px);
    border-color: rgba(215,168,77,.54);
    box-shadow: 0 28px 60px rgba(8,39,25,.22);
  }

  .ltc-payroll-item-title {
    color: var(--green-950);
    font-size: 20px;
    font-weight: 900;
    margin: 0;
  }

  .ltc-payroll-item-text {
    margin: 6px 0 0;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
  }

  .ltc-payroll-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
  }

  .ltc-footer {
    width: 100%;
    background: var(--footer-green);
    color: white;
    padding: 30px 0 12px;
    margin: 0;
  }

  .ltc-footer .ltc-container {
    width: 100%;
    max-width: none;
    margin: 0;
    padding-left: 32px;
    padding-right: 32px;
  }

  .ltc-footer-grid {
    width: 100%;
    display: grid;
    grid-template-columns: 1.5fr .9fr 1fr 1.65fr .9fr;
    gap: 22px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255,255,255,.1);
  }

  .ltc-footer-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ltc-footer-brand img {
    width: 48px;
    height: 48px;
    border-radius: 999px;
    background: white;
    object-fit: contain;
  }

  .ltc-footer h4 {
    color: white;
    font-weight: 900;
    font-size: 18px;
    line-height: 1.2;
    margin: 0;
  }

  .ltc-footer h5 {
    color: #f4d484;
    font-size: 12px;
    line-height: 1.2;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .14em;
    margin: 0 0 10px;
  }

  .ltc-footer p,
  .ltc-footer a,
  .ltc-footer-link {
    display: block;
    color: rgba(255,255,255,.68);
    font-size: 13px;
    line-height: 1.55;
    margin: 5px 0;
    text-decoration: none;
  }

  .ltc-footer a:hover,
  .ltc-footer-link:hover {
    color: white;
    text-decoration: underline;
  }

  .ltc-copyright {
    width: 100%;
    padding-top: 14px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: rgba(255,255,255,.52);
    font-size: 12px;
    line-height: 1.4;
  }

  @keyframes ltcAppleReveal {
    from { opacity: 0; transform: translateY(34px) scale(.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ltc-trainee-home-page *, .ltc-trainee-home-page *::before, .ltc-trainee-home-page *::after {
      animation-duration: .001ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: .001ms !important;
    }
  }

  @media (max-width: 900px) {
    .ltc-header .ltc-container { padding-left: 22px; padding-right: 22px; }
    .ltc-nav { min-height: auto; padding: 18px 0; }
    .ltc-desktop-nav, .ltc-profile-wrap { display: none; }
    .ltc-menu-button { display: grid; place-items: center; }
    .ltc-hero { min-height: 420px; }
    .ltc-payroll-header-row, .ltc-payroll-tools, .ltc-payroll-item { grid-template-columns: 1fr; }
    .ltc-employee-card { min-width: 0; }
    .ltc-payroll-actions { justify-content: flex-start; }
    .ltc-footer { padding: 28px 0 12px; }
    .ltc-footer-grid { grid-template-columns: 1fr; gap: 18px; padding-bottom: 22px; }
    .ltc-footer .ltc-container { padding-left: 22px; padding-right: 22px; }
    .ltc-copyright { flex-direction: column; }
  }

  @media (max-width: 600px) {
    .ltc-header .ltc-container { padding-left: 16px; padding-right: 16px; }
    .ltc-logo h1 { font-size: 14px; }
    .ltc-logo p { font-size: 10px; }
    .ltc-hero-title { font-size: clamp(38px, 12vw, 54px); letter-spacing: -.045em; }
    .ltc-payroll-overview { padding: 42px 0 60px; }
    .ltc-payroll-panel, .ltc-payroll-list { padding: 18px; border-radius: 24px; }
    .ltc-primary-button, .ltc-outline-button { width: 100%; }
    .ltc-footer .ltc-container { padding-left: 16px; padding-right: 16px; }
  }
`;

const ATTENDANCE_FIELDS = [
  { key: "regularDays", label: "Regular Days", unit: "day/s" },
  { key: "regularHours", label: "Regular Hours", unit: "hour/s" },
  { key: "overtimeHours", label: "Overtime Hours", unit: "hour/s" },
  { key: "restDayHours", label: "Rest Day Hours", unit: "hour/s" },
  { key: "restDayOtHours", label: "Rest Day OT Hours", unit: "hour/s" },
  { key: "specialHolidayHours", label: "Special Holiday Hours", unit: "hour/s" },
  {
    key: "specialHolidayOtHours",
    label: "Special Holiday OT Hours",
    unit: "hour/s",
  },
  {
    key: "specialHolidayRestDayHours",
    label: "Special Holiday Rest Day Hours",
    unit: "hour/s",
  },
  {
    key: "specialHolidayRestDayOtHours",
    label: "Special Holiday Rest Day OT Hours",
    unit: "hour/s",
  },
  {
    key: "regularHolidayHours",
    label: "Regular Holiday Hours",
    unit: "hour/s",
  },
  {
    key: "regularHolidayOtHours",
    label: "Regular Holiday OT Hours",
    unit: "hour/s",
  },
  {
    key: "regularHolidayRestDayHours",
    label: "Regular Holiday Rest Day Hours",
    unit: "hour/s",
  },
  {
    key: "regularHolidayRestDayOtHours",
    label: "Regular Holiday Rest Day OT Hours",
    unit: "hour/s",
  },
  { key: "nightDiffHours", label: "Night Differential Hours", unit: "hour/s" },
  { key: "sundayHours", label: "Sunday Hours", unit: "hour/s" },
  { key: "sundayOtHours", label: "Sunday OT Hours", unit: "hour/s" },
  { key: "lateHours", label: "Late Hours", unit: "hour/s" },
  { key: "undertimeHours", label: "Undertime Hours", unit: "hour/s" },
  { key: "absentDays", label: "Absent Days", unit: "day/s" },
];

function HeaderNavLink({ to, children, active = false }) {
  return (
    <Link
      to={to}
      className={`ltc-nav-link ${active ? "active" : ""}`}
      style={fontPoppins}
    >
      {children}
    </Link>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h5 style={fontMontserrat}>{title}</h5>
      <div>{children}</div>
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

function toNumber(value = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function round2(value = 0) {
  return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

function formatMoney(value = 0) {
  return `₱${toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPlainMoney(value = 0) {
  return toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatAttendanceNumber(value = 0) {
  return toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateKey(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRowsFromResponse(data) {
  if (Array.isArray(data?.payrolls)) return data.payrolls;
  if (Array.isArray(data?.history)) return data.history;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.records)) return data.records;

  return [];
}

function getComputed(row) {
  return row?.computed || row?.summary || row?.payrollSummary || {};
}

function getDisplayDate(row) {
  return row?.cutoffEnd || row?.cutoffStart || row?.payDate || row?.createdAt || null;
}

function getPayrollDate(row) {
  return formatDate(
    row?.payDate || row?.cutoffEnd || row?.cutoffStart || row?.createdAt
  );
}

function getCutoffPeriod(row) {
  return `${formatDate(row?.cutoffStart)} - ${formatDate(row?.cutoffEnd)}`;
}

function getRowTimestamp(row) {
  const updatedAt = row?.updatedAt ? new Date(row.updatedAt).getTime() : 0;
  const createdAt = row?.createdAt ? new Date(row.createdAt).getTime() : 0;

  return Math.max(updatedAt, createdAt);
}

function getRowKey(row) {
  return `${formatDateKey(row?.cutoffStart)}__${formatDateKey(row?.cutoffEnd)}`;
}

function dedupePayrollRows(rows = []) {
  const map = new Map();

  for (const row of rows) {
    const key = getRowKey(row);
    if (!key) continue;

    const existing = map.get(key);

    if (!existing || getRowTimestamp(row) >= getRowTimestamp(existing)) {
      map.set(key, row);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const aDate = a?.cutoffStart ? new Date(a.cutoffStart).getTime() : 0;
    const bDate = b?.cutoffStart ? new Date(b.cutoffStart).getTime() : 0;

    if (bDate !== aDate) return bDate - aDate;

    return getRowTimestamp(b) - getRowTimestamp(a);
  });
}

function escapeHtml(value = "") {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return map[char] || char;
  });
}

function downloadHtmlFile(filename, html) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function numberToWordsBelowThousand(number) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const n = Math.floor(number);

  if (n < 20) return ones[n];

  if (n < 100) {
    const ten = Math.floor(n / 10);
    const one = n % 10;

    return `${tens[ten]}${one ? ` ${ones[one]}` : ""}`.trim();
  }

  const hundred = Math.floor(n / 100);
  const rest = n % 100;

  return `${ones[hundred]} Hundred${
    rest ? ` ${numberToWordsBelowThousand(rest)}` : ""
  }`.trim();
}

function numberToWords(number) {
  const n = Math.floor(Math.abs(toNumber(number)));

  if (n === 0) return "Zero";

  const parts = [];

  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const hundreds = n % 1_000;

  if (millions) {
    parts.push(`${numberToWordsBelowThousand(millions)} Million`);
  }

  if (thousands) {
    parts.push(`${numberToWordsBelowThousand(thousands)} Thousand`);
  }

  if (hundreds) {
    parts.push(numberToWordsBelowThousand(hundreds));
  }

  return parts.join(" ").trim();
}

function amountToWords(value = 0) {
  const amount = round2(value);
  const pesos = Math.floor(amount);
  const cents = Math.round((amount - pesos) * 100);

  const pesoWords = `${numberToWords(pesos)} Peso${pesos === 1 ? "" : "s"}`;

  if (cents > 0) {
    return `${pesoWords} and ${String(cents).padStart(2, "0")}/100 Only`;
  }

  return `${pesoWords} Only`;
}

function getEmployeePosition(employee, row) {
  return (
    employee?.position ||
    employee?.vacancy ||
    employee?.designation ||
    row?.position ||
    row?.vacancy ||
    row?.designation ||
    "-"
  );
}

function getDeploymentSite(employee, row) {
  return (
    employee?.deploymentSite ||
    employee?.site ||
    employee?.assignedSite ||
    employee?.workLocation ||
    employee?.location ||
    row?.deploymentSite ||
    row?.site ||
    row?.assignedSite ||
    row?.workLocation ||
    row?.location ||
    "-"
  );
}

function addAmount(rows, label, value) {
  const amount = round2(value);

  if (Math.abs(amount) > 0) {
    rows.push({ label, value: amount });
  }
}

function getAttendanceRows(row) {
  const attendance = row?.attendance || {};

  return ATTENDANCE_FIELDS.map((field) => ({
    label: field.label,
    value: `${formatAttendanceNumber(attendance?.[field.key] || 0)} ${field.unit}`,
  }));
}

function getSalarySlipData(row) {
  const computed = getComputed(row);
  const items = computed?.items || row?.items || {};
  const adjustments = row?.adjustments || {};

  const earnings = [];
  const deductions = [];

  addAmount(earnings, "Basic Pay", items.basePay);
  addAmount(earnings, "Overtime Pay", items.otPay);
  addAmount(earnings, "Rest Day Pay", items.restDayPay);
  addAmount(earnings, "Rest Day OT Pay", items.restDayOtPay);
  addAmount(earnings, "Special Holiday Pay", items.specialPay);
  addAmount(earnings, "Special Holiday OT Pay", items.specialOtPay);
  addAmount(earnings, "Special Holiday Rest Day Pay", items.specialRestDayPay);
  addAmount(
    earnings,
    "Special Holiday Rest Day OT Pay",
    items.specialRestDayOtPay ?? items.specialHolidayRestDayOtPay
  );
  addAmount(earnings, "Regular Holiday Pay", items.regularHolidayPay);
  addAmount(earnings, "Regular Holiday OT Pay", items.regularHolidayOtPay);
  addAmount(earnings, "Regular Holiday Rest Day Pay", items.regularHolidayRestDayPay);
  addAmount(
    earnings,
    "Regular Holiday Rest Day OT Pay",
    items.regularHolidayRestDayOtPay
  );
  addAmount(earnings, "Sunday Pay", items.sundayPay);
  addAmount(earnings, "Sunday OT Pay", items.sundayOtPay);
  addAmount(earnings, "Night Differential", items.nightDiffPay);
  addAmount(earnings, "Allowance", adjustments.manualAllowance);
  addAmount(earnings, "Bonus", adjustments.manualBonus);

  addAmount(deductions, "SSS", items.sssEmployee);
  addAmount(deductions, "PhilHealth", items.philhealthEmployee);
  addAmount(deductions, "Pag-IBIG", items.pagibigEmployee);
  addAmount(deductions, "Withholding Tax", items.withholdingTax);
  addAmount(deductions, "Cash Advance", adjustments.cashAdvance);
  addAmount(deductions, "Loan Deduction", adjustments.loanDeduction);
  addAmount(deductions, "Other Deduction", adjustments.otherDeduction);
  addAmount(deductions, "Late Deduction", items.lateDeduction);
  addAmount(deductions, "Undertime Deduction", items.undertimeDeduction);
  addAmount(deductions, "Absent Deduction", items.absentDeduction);

  const grossPay = round2(computed?.grossPay ?? row?.grossPay ?? 0);
  const totalDeductions = round2(
    computed?.totalDeductions ?? row?.totalDeductions ?? 0
  );
  const netPay = round2(
    computed?.netPay ?? row?.netPay ?? grossPay - totalDeductions
  );

  if (!earnings.length && grossPay > 0) {
    earnings.push({ label: "Gross Earnings", value: grossPay });
  }

  if (!deductions.length && totalDeductions > 0) {
    deductions.push({ label: "Total Deductions", value: totalDeductions });
  }

  return {
    earnings,
    deductions,
    grossPay,
    totalDeductions,
    netPay,
  };
}

function getPayslipTableRows(row) {
  const attendanceRows = getAttendanceRows(row);
  const salarySlip = getSalarySlipData(row);

  const leftRows = [
    ...attendanceRows.map((item) => ({
      label: item.label,
      value: item.value,
    })),
    ...salarySlip.earnings.map((item) => ({
      label: item.label,
      value: formatPlainMoney(item.value),
    })),
  ];

  const rightRows = salarySlip.deductions.map((item) => ({
    label: item.label,
    value: formatPlainMoney(item.value),
  }));

  if (!salarySlip.earnings.length && salarySlip.grossPay <= 0) {
    leftRows.push({
      label: "No earnings encoded",
      value: "0.00",
    });
  }

  if (!salarySlip.deductions.length && salarySlip.totalDeductions <= 0) {
    rightRows.push({
      label: "No deductions encoded",
      value: "0.00",
    });
  }

  const length = Math.max(leftRows.length, rightRows.length, 3);

  return Array.from({ length }, (_, index) => ({
    earning: leftRows[index] || null,
    deduction: rightRows[index] || null,
  }));
}

function PayslipDetailsTable({ row }) {
  const salarySlip = getSalarySlipData(row);
  const tableRows = getPayslipTableRows(row);

  return (
    <div className="mt-8 overflow-hidden border border-black">
      <table className="w-full border-collapse text-[12px] sm:text-[13px]">
        <thead>
          <tr className="bg-[#bfbfbf]">
            <th className="border border-black px-2 py-2 text-left font-black">
              Earnings
            </th>
            <th className="border border-black px-2 py-2 text-right font-black">
              Amount
            </th>
            <th className="border border-black px-2 py-2 text-left font-black">
              Deductions
            </th>
            <th className="border border-black px-2 py-2 text-right font-black">
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          {tableRows.map((item, index) => (
            <tr key={`payslip-row-${index}`}>
              <td className="h-7 border border-black px-2">
                {item.earning?.label || ""}
              </td>
              <td className="h-7 border border-black bg-[#eeeeee] px-2 text-right">
                {item.earning?.value || ""}
              </td>
              <td className="h-7 border border-black px-2">
                {item.deduction?.label || ""}
              </td>
              <td className="h-7 border border-black bg-[#eeeeee] px-2 text-right">
                {item.deduction?.value || ""}
              </td>
            </tr>
          ))}

          <tr>
            <td className="h-8 border border-black px-2 font-bold">
              Total Addition
            </td>
            <td className="h-8 border border-black bg-[#eeeeee] px-2 text-right font-bold">
              {formatPlainMoney(salarySlip.grossPay)}
            </td>
            <td className="h-8 border border-black px-2 font-bold">
              Total Deduction
            </td>
            <td className="h-8 border border-black bg-[#eeeeee] px-2 text-right font-bold">
              {formatPlainMoney(salarySlip.totalDeductions)}
            </td>
          </tr>

          <tr>
            <td className="h-8 border border-black px-2" />
            <td className="h-8 border border-black bg-[#eeeeee] px-2" />
            <td className="h-9 border border-black px-2 font-black">
              NET Salary
            </td>
            <td className="h-9 border border-black bg-[#d9d9d9] px-2 text-right font-black">
              {formatPlainMoney(salarySlip.netPay)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SalarySlipPaper({
  row,
  employee,
  employeeName,
  employeeEmail,
  compact = false,
}) {
  const computed = getComputed(row);
  const salarySlip = getSalarySlipData(row);

  const payrollDate = getPayrollDate(row);
  const cutoff = getCutoffPeriod(row);
  const position = getEmployeePosition(employee, row);
  const deploymentSite = getDeploymentSite(employee, row);

  return (
    <div
      className={`mx-auto bg-white text-black ${
        compact
          ? "w-full max-w-[860px] p-5 sm:p-8"
          : "w-[860px] min-h-[1080px] p-10"
      }`}
    >
      <div className="text-center">
        <h1 className="font-serif text-[34px] font-black leading-none sm:text-[44px]">
          {COMPANY_NAME}
        </h1>
        <p className="mt-2 text-[13px] font-medium">[{COMPANY_ADDRESS}]</p>
        <h2 className="mt-8 text-[26px] font-black">Salary Slip</h2>
      </div>

      <div className="mx-auto mt-10 max-w-[620px] text-[14px] font-bold leading-7">
        <div className="grid grid-cols-[150px_1fr] items-end">
          <span>Employee Name:</span>
          <span className="border-b border-dashed border-black px-2 font-semibold">
            {employeeName}
          </span>
        </div>

        <div className="grid grid-cols-[150px_1fr] items-end">
          <span>Position:</span>
          <span className="border-b border-dashed border-black px-2 font-semibold">
            {position}
          </span>
        </div>

        <div className="grid grid-cols-[150px_1fr] items-end">
          <span>Deployment Site:</span>
          <span className="border-b border-dashed border-black px-2 font-semibold">
            {deploymentSite}
          </span>
        </div>

        <div className="grid grid-cols-[150px_1fr] items-end">
          <span>Payroll Date:</span>
          <span className="border-b border-dashed border-black px-2 font-semibold">
            {payrollDate}
          </span>
        </div>

        <div className="grid grid-cols-[150px_1fr] items-end">
          <span>Cutoff Period:</span>
          <span className="border-b border-dashed border-black px-2 font-semibold">
            {cutoff}
          </span>
        </div>
      </div>

      <PayslipDetailsTable row={row} />

      <p className="mt-8 text-[13px] font-bold">
        {amountToWords(salarySlip.netPay)}
      </p>

      <div className="mt-24 grid gap-12 text-center text-[13px] font-bold sm:grid-cols-2">
        <div>
          <div className="mx-auto w-[260px] border-b border-dashed border-black" />
          <p className="mt-1 italic">Employee Signature</p>
        </div>

        <div>
          <div className="mx-auto w-[260px] border-b border-dashed border-black" />
          <p className="mt-1 italic">Director</p>
        </div>
      </div>

      <div className="mt-10 border-t border-dashed border-gray-400 pt-3 text-[11px] text-gray-600">
        <p>Email: {employeeEmail || "-"}</p>
        <p>
          Payroll Cycle:{" "}
          {computed?.payrollCycleLabel || computed?.payrollCycle || "-"} • Rate
          Per Day: {formatMoney(computed?.ratePerDay || row?.ratePerDay)}
        </p>
      </div>
    </div>
  );
}

function buildSalarySlipHtml({ row, employee, employeeName, employeeEmail }) {
  const computed = getComputed(row);
  const salarySlip = getSalarySlipData(row);
  const tableRows = getPayslipTableRows(row);

  const payrollDate = getPayrollDate(row);
  const cutoff = getCutoffPeriod(row);
  const position = getEmployeePosition(employee, row);
  const deploymentSite = getDeploymentSite(employee, row);

  const rowsHtml = tableRows
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.earning?.label || "")}</td>
          <td class="amount">${escapeHtml(item.earning?.value || "")}</td>
          <td>${escapeHtml(item.deduction?.label || "")}</td>
          <td class="amount">${escapeHtml(item.deduction?.value || "")}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Salary Slip - ${escapeHtml(employeeName)}</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #f3f3f3;
            color: #000;
            font-family: Arial, sans-serif;
          }

          .page {
            width: 850px;
            min-height: 1100px;
            margin: 24px auto;
            background: #fff;
            padding: 54px 42px;
            border: 1px solid #cfcfcf;
          }

          .company {
            text-align: center;
          }

          .company h1 {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 46px;
            line-height: 1;
            font-weight: 900;
          }

          .company p {
            margin: 8px 0 0;
            font-size: 13px;
          }

          .company h2 {
            margin: 32px 0 0;
            font-size: 28px;
            font-weight: 900;
          }

          .details {
            width: 620px;
            margin: 38px auto 24px;
            font-size: 14px;
            font-weight: 700;
            line-height: 1.9;
          }

          .line {
            display: grid;
            grid-template-columns: 150px 1fr;
            align-items: end;
          }

          .blank {
            display: inline-block;
            min-height: 20px;
            border-bottom: 1px dashed #000;
            padding: 0 8px;
            font-weight: 600;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 28px;
            border: 1px solid #000;
            font-size: 13px;
          }

          th {
            border: 1px solid #000;
            background: #bfbfbf;
            padding: 7px 8px;
            text-align: left;
            font-weight: 900;
          }

          td {
            height: 29px;
            border: 1px solid #000;
            padding: 6px 8px;
          }

          .amount {
            background: #eeeeee;
            text-align: right;
          }

          .total {
            font-weight: 800;
          }

          .net {
            background: #d9d9d9;
            font-weight: 900;
          }

          .words {
            margin-top: 28px;
            font-size: 13px;
            font-weight: 800;
          }

          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            margin-top: 110px;
            text-align: center;
            font-size: 13px;
            font-weight: 800;
          }

          .signature-line {
            width: 270px;
            margin: 0 auto 5px;
            border-bottom: 1px dashed #000;
          }

          .signature-label {
            font-style: italic;
          }

          .footer-note {
            margin-top: 46px;
            padding-top: 10px;
            border-top: 1px dashed #999;
            color: #555;
            font-size: 11px;
            line-height: 1.5;
          }

          @media print {
            body {
              background: #fff;
            }

            .page {
              width: 100%;
              min-height: auto;
              margin: 0;
              border: 0;
              padding: 36px;
            }
          }
        </style>
      </head>

      <body>
        <div class="page">
          <div class="company">
            <h1>${escapeHtml(COMPANY_NAME)}</h1>
            <p>[${escapeHtml(COMPANY_ADDRESS)}]</p>
            <h2>Salary Slip</h2>
          </div>

          <div class="details">
            <div class="line">
              <span>Employee Name:</span>
              <span class="blank">${escapeHtml(employeeName)}</span>
            </div>

            <div class="line">
              <span>Position:</span>
              <span class="blank">${escapeHtml(position)}</span>
            </div>

            <div class="line">
              <span>Deployment Site:</span>
              <span class="blank">${escapeHtml(deploymentSite)}</span>
            </div>

            <div class="line">
              <span>Payroll Date:</span>
              <span class="blank">${escapeHtml(payrollDate)}</span>
            </div>

            <div class="line">
              <span>Cutoff Period:</span>
              <span class="blank">${escapeHtml(cutoff)}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Earnings</th>
                <th style="text-align:right;">Amount</th>
                <th>Deductions</th>
                <th style="text-align:right;">Amount</th>
              </tr>
            </thead>

            <tbody>
              ${rowsHtml}

              <tr>
                <td class="total">Total Addition</td>
                <td class="amount total">${escapeHtml(formatPlainMoney(salarySlip.grossPay))}</td>
                <td class="total">Total Deduction</td>
                <td class="amount total">${escapeHtml(formatPlainMoney(salarySlip.totalDeductions))}</td>
              </tr>

              <tr>
                <td></td>
                <td class="amount"></td>
                <td class="total">NET Salary</td>
                <td class="amount net">${escapeHtml(formatPlainMoney(salarySlip.netPay))}</td>
              </tr>
            </tbody>
          </table>

          <p class="words">${escapeHtml(amountToWords(salarySlip.netPay))}</p>

          <div class="signatures">
            <div>
              <div class="signature-line"></div>
              <div class="signature-label">Employee Signature</div>
            </div>

            <div>
              <div class="signature-line"></div>
              <div class="signature-label">Director</div>
            </div>
          </div>

          <div class="footer-note">
            <div>Email: ${escapeHtml(employeeEmail || "-")}</div>
            <div>
              Payroll Cycle:
              ${escapeHtml(computed?.payrollCycleLabel || computed?.payrollCycle || "-")}
              • Rate Per Day:
              ${escapeHtml(formatMoney(computed?.ratePerDay || row?.ratePerDay))}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getCutoffCycleValue(row) {
  const computed = getComputed(row);
  const rawValue = String(
    computed?.payrollCycleLabel ||
      computed?.payrollCycle ||
      row?.payrollCycleLabel ||
      row?.payrollCycle ||
      row?.cutoffType ||
      row?.cutoff ||
      ""
  ).toLowerCase();

  if (
    rawValue.includes("1st") ||
    rawValue.includes("first") ||
    rawValue === "1" ||
    rawValue.includes("cycle 1") ||
    rawValue.includes("cutoff 1")
  ) {
    return "first";
  }

  if (
    rawValue.includes("2nd") ||
    rawValue.includes("second") ||
    rawValue === "2" ||
    rawValue.includes("cycle 2") ||
    rawValue.includes("cutoff 2")
  ) {
    return "second";
  }

  const cutoffStart = row?.cutoffStart ? new Date(row.cutoffStart) : null;

  if (cutoffStart && !Number.isNaN(cutoffStart.getTime())) {
    return cutoffStart.getDate() <= 15 ? "first" : "second";
  }

  return "unknown";
}

function getCutoffCycleLabel(row) {
  const cycle = getCutoffCycleValue(row);

  if (cycle === "first") return "1st Cutoff";
  if (cycle === "second") return "2nd Cutoff";

  const computed = getComputed(row);
  return computed?.payrollCycleLabel || computed?.payrollCycle || "Cutoff";
}

function PayrollModal({
  row,
  employee,
  employeeName,
  employeeEmail,
  onClose,
  onDownload,
}) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/60 px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#24372d]">
              Salary Slip Preview
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#52695a]">
              {getPayrollDate(row)}
            </p>
            <p className="text-xs font-semibold text-[#52695a]">
              Cutoff: {getCutoffPeriod(row)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onDownload(row)}
              className="rounded-xl bg-[#315b42] px-5 py-2 text-sm font-black text-white transition hover:bg-[#254934]"
            >
              Download Payslip
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border-2 border-[#315b42] px-5 py-2 text-sm font-black text-[#315b42] transition hover:bg-[#315b42] hover:text-white"
              aria-label="Close payroll details"
            >
              Close
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-[#e8e8e8] p-3 shadow-2xl">
          <SalarySlipPaper
            row={row}
            employee={employee}
            employeeName={employeeName}
            employeeEmail={employeeEmail}
            compact
          />
        </div>
      </div>
    </div>
  );
}

export default function ManpowerEmployeePayroll() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(() => getEmployeeUser());
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [cutoffFilter, setCutoffFilter] = useState("all");
  const [dateSort, setDateSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const employeeName = useMemo(() => {
    const fullName = [
      employee?.firstName || "",
      employee?.middleName || "",
      employee?.lastName || "",
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return fullName || "Employee";
  }, [employee]);

  const employeeEmail =
    employee?.companyEmail || employee?.personalEmail || employee?.email || "";

  async function loadPayroll(showRefresh = false) {
    const token = getEmployeeToken();

    if (!token) {
      navigate(EMPLOYEE_LOGIN_ROUTE, { replace: true });
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/payroll`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        clearEmployeeSession();
        navigate(EMPLOYEE_LOGIN_ROUTE, { replace: true });
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load payroll history.");
      }

      if (data?.employee) {
        localStorage.setItem("manpowerEmployeeUser", JSON.stringify(data.employee));
        setEmployee(data.employee);
      }

      setRows(dedupePayrollRows(getRowsFromResponse(data)));
    } catch (err) {
      setError(err?.message || "Failed to load payroll history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadPayroll(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    const selectedDate = filterDate ? new Date(`${filterDate}T00:00:00`) : null;
    const selectedDateKey = selectedDate && !Number.isNaN(selectedDate.getTime())
      ? formatDateKey(selectedDate)
      : "";

    const matchedRows = rows.filter((row) => {
      const computed = getComputed(row);
      const displayDate = getDisplayDate(row);
      const payrollDateKey = formatDateKey(displayDate);
      const cutoffStartKey = formatDateKey(row?.cutoffStart);
      const cutoffEndKey = formatDateKey(row?.cutoffEnd);

      const haystack = [
        formatDate(row?.cutoffStart),
        formatDate(row?.cutoffEnd),
        formatDate(displayDate),
        getPayrollDate(row),
        getCutoffPeriod(row),
        computed?.payrollCycle,
        computed?.payrollCycleLabel,
        getCutoffCycleLabel(row),
        employeeName,
        employeeEmail,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesDate =
        !selectedDateKey ||
        payrollDateKey === selectedDateKey ||
        cutoffStartKey === selectedDateKey ||
        cutoffEndKey === selectedDateKey;
      const matchesCutoff =
        cutoffFilter === "all" || getCutoffCycleValue(row) === cutoffFilter;

      return matchesKeyword && matchesDate && matchesCutoff;
    });

    return [...matchedRows].sort((a, b) => {
      const firstCycle = getCutoffCycleValue(a);
      const secondCycle = getCutoffCycleValue(b);

      if (cutoffFilter === "all" && firstCycle !== secondCycle) {
        if (firstCycle === "first") return -1;
        if (secondCycle === "first") return 1;
        if (firstCycle === "second") return -1;
        if (secondCycle === "second") return 1;
      }

      const firstDate = getDisplayDate(a) ? new Date(getDisplayDate(a)).getTime() : 0;
      const secondDate = getDisplayDate(b) ? new Date(getDisplayDate(b)).getTime() : 0;
      const dateDiff = dateSort === "oldest" ? firstDate - secondDate : secondDate - firstDate;

      if (dateDiff !== 0) return dateDiff;

      return dateSort === "oldest"
        ? getRowTimestamp(a) - getRowTimestamp(b)
        : getRowTimestamp(b) - getRowTimestamp(a);
    });
  }, [rows, searchValue, filterDate, cutoffFilter, dateSort, employeeName, employeeEmail]);

  function handleDownload(row) {
    const fileDate = formatDateKey(getDisplayDate(row)) || "payroll";

    const html = buildSalarySlipHtml({
      row,
      employee,
      employeeName,
      employeeEmail,
    });

    downloadHtmlFile(`manpower-salary-slip-${fileDate}.html`, html);
  }

  return (
    <div className="ltc-trainee-home-page" style={fontPontano}>
      <style>{employeePayrollAssignmentStyles}</style>

      <header className="ltc-header">
        <div className="ltc-container">
          <div className="ltc-nav">
            <Link to={EMPLOYEE_HOME_ROUTE} className="ltc-logo" aria-label="Manpower Employee Home">
              <img
                src={LOGO_IMAGE}
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
              <HeaderNavLink to={EMPLOYEE_PAYROLL_ROUTE} active>
                Payroll
              </HeaderNavLink>
              <HeaderNavLink to={EMPLOYEE_LEAVE_ROUTE}>Leave</HeaderNavLink>
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
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
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

            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_HOME_ROUTE} className="ltc-sidebar-link" style={fontPoppins}>
              Home
            </Link>
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_PAYROLL_ROUTE} className="ltc-sidebar-link active" style={fontPoppins}>
              Payroll
            </Link>
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_LEAVE_ROUTE} className="ltc-sidebar-link" style={fontPoppins}>
              Leave
            </Link>
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_PROFILE_ROUTE} className="ltc-sidebar-link" style={fontPoppins}>
              Profile
            </Link>
          </div>
        </div>
      ) : null}

      <main>
        <section className="ltc-hero">
          <div className="ltc-container ltc-hero-content">
            <h2 className="ltc-hero-title" style={fontMontserrat}>
              Payroll <span>History</span>
            </h2>
            <p className="ltc-hero-text" style={fontPontano}>
              View your salary slips, review cutoff periods, and download payroll records.
            </p>
          </div>
        </section>

        <section className="ltc-payroll-overview">
          <div className="ltc-container">
            <div className="ltc-payroll-panel">
              <div className="ltc-payroll-header-row">
                <div>
                  <h1 className="ltc-payroll-title" style={fontMontserrat}>
                    My Payroll
                  </h1>
                  <p className="ltc-payroll-subtitle" style={fontPoppins}>
                  </p>

                  <div className="ltc-payroll-meta-row">
                    <span>Total Records: {rows.length}</span>
                    <span>Showing: {filteredRows.length}</span>
                    <span>Cutoff: {cutoffFilter === "first" ? "1st Cutoff" : cutoffFilter === "second" ? "2nd Cutoff" : "All Cutoffs"}</span>
                  </div>
                </div>

                <div className="ltc-employee-card">
                  <p className="ltc-employee-label" style={fontPoppins}>Employee</p>
                  <h2 className="ltc-employee-name" style={fontMontserrat}>{employeeName}</h2>
                  {employeeEmail ? (
                    <p className="ltc-employee-email" style={fontPontano}>{employeeEmail}</p>
                  ) : null}
                </div>
              </div>

              <div className="ltc-payroll-tools">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search payroll date or cutoff"
                  className="ltc-payroll-search"
                  style={fontPontano}
                />

                <input
                  type="date"
                  value={filterDate}
                  onChange={(event) => setFilterDate(event.target.value)}
                  className="ltc-payroll-filter"
                  style={fontPoppins}
                  aria-label="Filter salary slips by date"
                />

                <select
                  value={cutoffFilter}
                  onChange={(event) => setCutoffFilter(event.target.value)}
                  className="ltc-payroll-filter"
                  style={fontPoppins}
                  aria-label="Sort salary slips by cutoff"
                >
                  <option value="all">All Cutoffs</option>
                  <option value="first">1st Cutoff</option>
                  <option value="second">2nd Cutoff</option>
                </select>

                <select
                  value={dateSort}
                  onChange={(event) => setDateSort(event.target.value)}
                  className="ltc-payroll-filter"
                  style={fontPoppins}
                  aria-label="Sort salary slips by date"
                >
                  <option value="newest">Newest Date First</option>
                  <option value="oldest">Oldest Date First</option>
                </select>

                <button
                  type="button"
                  onClick={() => loadPayroll(true)}
                  disabled={refreshing}
                  className="ltc-primary-button"
                  style={fontMontserrat}
                >
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              <section className="ltc-payroll-list">
                {loading ? (
                  <div className="ltc-state-card" style={fontPoppins}>
                    Loading payroll history...
                  </div>
                ) : null}

                {!loading && error ? (
                  <div className="ltc-state-card error" style={fontPoppins}>
                    {error}
                  </div>
                ) : null}

                {!loading && !error && filteredRows.length === 0 ? (
                  <div className="ltc-state-card" style={fontPoppins}>
                    No payroll history found.
                  </div>
                ) : null}

                {!loading && !error && filteredRows.length > 0 ? (
                  <div className="ltc-payroll-items">
                    {filteredRows.map((row, index) => (
                      <article
                        key={row?._id || `${getRowKey(row)}-${index}`}
                        className="ltc-payroll-item"
                      >
                        <div>
                          <h2 className="ltc-payroll-item-title" style={fontMontserrat}>
                            Salary Slip - {getPayrollDate(row)}
                          </h2>

                          <p className="ltc-payroll-item-text" style={fontPontano}>
                            Cutoff: {getCutoffPeriod(row)}
                          </p>

                          <p className="ltc-payroll-item-text" style={fontPontano}>
                            Cycle: {getCutoffCycleLabel(row)}
                          </p>
                        </div>

                        <div className="ltc-payroll-actions">
                          <button
                            type="button"
                            onClick={() => setSelectedRow(row)}
                            className="ltc-primary-button"
                            style={fontMontserrat}
                          >
                            View Salary Slip
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownload(row)}
                            className="ltc-outline-button"
                            style={fontMontserrat}
                          >
                            Download
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        </section>
      </main>

      <footer className="ltc-footer">
        <div className="ltc-container ltc-footer-grid">
          <div>
            <Link to={EMPLOYEE_HOME_ROUTE} className="ltc-footer-brand">
              <img
                src={LOGO_IMAGE}
                alt="Manpower Logo"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://placehold.co/80x80/ffffff/4d6f55?text=M";
                }}
              />
              <h4 style={fontMontserrat}>LTC Manpower</h4>
            </Link>
          </div>

          <FooterColumn title="Menu">
            <Link to={EMPLOYEE_HOME_ROUTE} style={fontPontano}>Home</Link>
            <Link to={EMPLOYEE_PAYROLL_ROUTE} style={fontPontano}>Payroll</Link>
            <Link to={EMPLOYEE_LEAVE_ROUTE} style={fontPontano}>Leave</Link>
            <Link to={EMPLOYEE_PROFILE_ROUTE} style={fontPontano}>Profile</Link>
          </FooterColumn>

          <FooterColumn title="Contact Information">
            <p style={fontPontano}>ltc.tamis@gmail.com</p>
            <p style={fontPontano}>lorengladisu@ltcmultiservices.com</p>
            <p style={fontPontano}>09959808051 / 09516281271</p>
          </FooterColumn>

          <FooterColumn title="Address">
            <p style={fontPontano}>2/F 544 Curie Street,</p>
            <p style={fontPontano}>Palanan, Makati City</p>
          </FooterColumn>

          <FooterColumn title="Follow Us">
            <p style={fontPontano}>Facebook</p>
            <p style={fontPontano}>Email</p>
            <p style={fontPontano}>LinkedIn</p>
          </FooterColumn>
        </div>

        <div className="ltc-container ltc-copyright">
          <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
        </div>
      </footer>

      {selectedRow ? (
        <PayrollModal
          row={selectedRow}
          employee={employee}
          employeeName={employeeName}
          employeeEmail={employeeEmail}
          onClose={() => setSelectedRow(null)}
          onDownload={handleDownload}
        />
      ) : null}
    </div>
  );
}
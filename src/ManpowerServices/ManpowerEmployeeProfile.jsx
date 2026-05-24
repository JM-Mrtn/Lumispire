import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGO_IMAGE = "/ManpowerLogo.png";
const HERO_IMAGE = "/ManpowerBanner.png";

const EMPLOYEE_HOME_ROUTE = "/manpower-employee-home";
const EMPLOYEE_PAYROLL_ROUTE = "/manpower-employee-payroll";
const EMPLOYEE_LEAVE_ROUTE = "/manpower-employee-leave";
const EMPLOYEE_PROFILE_ROUTE = "/manpower-employee-profile";
const EMPLOYEE_LOGIN_ROUTE = "/manpower-employee-login";
const EMPLOYEE_CHANGE_PASSWORD_ROUTE = "/manpower-employee-change-password";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

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

function saveEmployeeSession(token, employee) {
  localStorage.setItem("manpowerEmployeeToken", token);
  localStorage.setItem("manpowerEmployeeUser", JSON.stringify(employee || null));
}

function clearEmployeeSession() {
  localStorage.removeItem("manpowerEmployeeToken");
  localStorage.removeItem("manpowerEmployeeUser");
}

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

function ProfileInfoBlock({ value, label }) {
  return (
    <article className="ltc-info-card">
      <p className="ltc-info-label" style={fontPoppins}>{label}</p>
      <h3 className="ltc-info-value" style={fontMontserrat}>
        {value || "-"}
      </h3>
    </article>
  );
}

export default function ManpowerEmployeeProfile() {
  const navigate = useNavigate();
  const photoObjectUrlRef = useRef("");

  const [token, setToken] = useState(getEmployeeToken());
  const [employee, setEmployee] = useState(getEmployeeUser());
  const [mobileOpen, setMobileOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoState, setPhotoState] = useState({
    loading: false,
    success: "",
    error: "",
  });

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

  const firstName = employee?.firstName || "Your Name";
  const lastName = employee?.lastName || "Your Name";
  const middleName = employee?.middleName || "Your Name";

  const displayName = fullName || "Employee Full Name";
  const displayEmail =
    employee?.companyEmail || employee?.email || "employeeemail@manpower.com";

  const contactNumber =
    employee?.contactNo || employee?.phoneNumber || "Your Number";

  const statusLabel =
    employee?.active === false ? "Inactive Employee" : "Active Employee";

  const profileInitial = (employee?.firstName || employee?.lastName || "E")
    .charAt(0)
    .toUpperCase();

  function logout() {
    clearEmployeeSession();
    setToken("");
    setEmployee(null);
    navigate(EMPLOYEE_LOGIN_ROUTE, { replace: true });
  }

  function revokePhotoUrl() {
    if (photoObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(photoObjectUrlRef.current);
      } catch {
        // Ignore cleanup error.
      }

      photoObjectUrlRef.current = "";
    }
  }

  async function loadProfile() {
    setLoading(true);
    setError("");

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

      const nextEmployee = data?.employee || null;

      setEmployee(nextEmployee);
      saveEmployeeSession(token, nextEmployee);
    } catch (err) {
      setError(err?.message || "Failed to load employee profile.");
    } finally {
      setLoading(false);
    }
  }

  async function loadProfilePhoto() {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/profile-photo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        revokePhotoUrl();
        setPhotoUrl("");
        return;
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      revokePhotoUrl();

      photoObjectUrlRef.current = objectUrl;
      setPhotoUrl(objectUrl);
    } catch {
      revokePhotoUrl();
      setPhotoUrl("");
    }
  }

  useEffect(() => {
    if (!token) {
      navigate(EMPLOYEE_LOGIN_ROUTE, { replace: true });
      return;
    }

    loadProfile();
    loadProfilePhoto();

    return () => {
      revokePhotoUrl();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  async function handlePhotoUpload(event) {
    const file = event.target.files?.[0] || null;

    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowed.includes(String(file.type || "").toLowerCase())) {
      setPhotoState({
        loading: false,
        success: "",
        error: "Please upload JPG, JPEG, PNG, or WEBP only.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("profilePhoto", file);

    setPhotoState({
      loading: true,
      success: "",
      error: "",
    });

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/profile-photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to upload profile photo.");
      }

      const updatedEmployee = data?.employee || employee;

      setEmployee(updatedEmployee);
      saveEmployeeSession(token, updatedEmployee);

      await loadProfilePhoto();

      setPhotoState({
        loading: false,
        success: data?.message || "Profile photo uploaded successfully.",
        error: "",
      });
    } catch (err) {
      setPhotoState({
        loading: false,
        success: "",
        error: err?.message || "Failed to upload profile photo.",
      });
    } finally {
      event.target.value = "";
    }
  }

  const profileStyles = `
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

    .ltc-manpower-employee-home {
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

    .ltc-manpower-employee-home * { box-sizing: border-box; }
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
      overflow: hidden;
      color: white;
      isolation: isolate;
      background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
      padding: 92px 0 86px;
    }

    .ltc-hero-slide {
      position: absolute;
      inset: 0;
      z-index: -4;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: .34;
    }

    .ltc-hero::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -3;
      background: linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.88) 42%, rgba(12,64,39,.76) 100%);
    }

    .ltc-hero::after {
      content: "";
      position: absolute;
      inset: -16% -10% -24% -10%;
      z-index: -2;
      background:
        radial-gradient(circle at 16% 82%, rgba(19,120,72,.36), transparent 24%),
        radial-gradient(circle at 36% 92%, rgba(7,76,47,.46), transparent 30%),
        radial-gradient(circle at 72% 18%, rgba(28,108,68,.28), transparent 30%),
        radial-gradient(circle at 88% 44%, rgba(244,212,132,.14), transparent 28%),
        radial-gradient(circle at 90% 84%, rgba(22,108,66,.30), transparent 26%);
      filter: blur(30px);
      pointer-events: none;
    }

    .ltc-hero-content {
      position: relative;
      z-index: 2;
      max-width: 980px;
      margin: 0 auto;
      text-align: center;
      animation: ltcAppleReveal .9s var(--ease) both;
    }

    .ltc-eyebrow {
      display: inline-flex;
      color: var(--gold-soft);
      background: rgba(255,255,255,.12);
      border: 1px solid rgba(255,255,255,.24);
      border-radius: 999px;
      padding: 12px 22px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .22em;
      text-transform: uppercase;
      backdrop-filter: blur(8px);
    }

    .ltc-hero-title {
      margin: 18px 0 0;
      color: white;
      font-size: clamp(38px, 6vw, 76px);
      line-height: 1.05;
      font-weight: 900;
      letter-spacing: -.055em;
      text-shadow: 0 8px 26px rgba(0,0,0,.22);
    }

    .ltc-hero-title span { color: var(--gold-soft); }

    .ltc-hero-text {
      max-width: 760px;
      margin: 18px auto 0;
      color: rgba(255,255,255,.82);
      font-size: 17px;
      line-height: 1.8;
    }

    .ltc-section { padding: 74px 0; }

    .ltc-profile-shell {
      position: relative;
      overflow: hidden;
      border-radius: var(--radius);
      background: var(--glass);
      border: 1px solid rgba(255,255,255,.76);
      box-shadow: var(--shadow-md);
      backdrop-filter: blur(18px);
      padding: 34px;
      transition: .25s var(--ease);
    }

    .ltc-profile-shell::before {
      content: "";
      position: absolute;
      inset: 0 0 auto;
      height: 6px;
      background: linear-gradient(90deg,var(--green-700),var(--gold));
      z-index: 3;
    }

    .ltc-profile-shell:hover {
      box-shadow: var(--shadow-lg);
      border-color: rgba(215,168,77,.45);
    }

    .ltc-profile-grid {
      display: grid;
      grid-template-columns: minmax(260px, .78fr) minmax(0, 1.45fr);
      gap: 26px;
      align-items: stretch;
    }

    .ltc-profile-card {
      position: relative;
      overflow: hidden;
      border-radius: 28px;
      color: white;
      background: linear-gradient(145deg, #082719, #235f3e);
      min-height: 480px;
      padding: 34px 26px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: var(--shadow-lg);
    }

    .ltc-profile-card::after {
      content: "";
      position: absolute;
      right: -60px;
      top: -80px;
      width: 190px;
      height: 190px;
      border-radius: 999px;
      background: rgba(244,212,132,.20);
    }

    .ltc-profile-photo {
      position: relative;
      z-index: 1;
      width: 126px;
      height: 126px;
      display: grid;
      place-items: center;
      overflow: hidden;
      border-radius: 999px;
      background: white;
      color: var(--green-800);
      font-size: 46px;
      font-weight: 900;
      box-shadow: 0 0 0 8px rgba(255,255,255,.12), 0 18px 35px rgba(0,0,0,.22);
    }

    .ltc-profile-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ltc-profile-name {
      position: relative;
      z-index: 1;
      margin: 26px 0 0;
      color: white;
      font-size: clamp(24px, 3vw, 34px);
      font-weight: 900;
      line-height: 1.08;
      letter-spacing: -.045em;
    }

    .ltc-profile-email {
      position: relative;
      z-index: 1;
      margin: 10px 0 0;
      max-width: 100%;
      color: rgba(255,255,255,.78);
      font-size: 13px;
      font-weight: 700;
      word-break: break-word;
    }

    .ltc-upload-button {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 210px;
      min-height: 48px;
      margin-top: 28px;
      border-radius: 999px;
      color: #102418;
      background: linear-gradient(135deg,#f4d484,#d7a84d);
      box-shadow: 0 14px 28px rgba(215,168,77,.18);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .1em;
      text-transform: uppercase;
      cursor: pointer;
      transition: .25s var(--ease);
    }

    .ltc-upload-button:hover { transform: translateY(-3px); }

    .ltc-profile-status {
      position: relative;
      z-index: 1;
      display: inline-flex;
      margin-top: auto;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.18);
      background: rgba(255,255,255,.10);
      padding: 10px 16px;
      color: rgba(255,255,255,.86);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      backdrop-filter: blur(8px);
    }

    .ltc-profile-details {
      border-radius: 28px;
      background: white;
      border: 1px solid rgba(35,95,62,.12);
      box-shadow: 0 16px 34px rgba(8,39,25,.08);
      padding: 32px;
    }

    .ltc-section-heading {
      margin: 0;
      color: var(--green-950);
      font-size: clamp(28px,3vw,42px);
      line-height: 1.08;
      letter-spacing: -.05em;
      font-weight: 900;
    }

    .ltc-section-line {
      margin-top: 12px;
      width: 180px;
      height: 3px;
      border-radius: 999px;
      background: linear-gradient(90deg,var(--green-700),var(--gold));
    }

    .ltc-section-intro {
      max-width: 760px;
      margin: 16px 0 0;
      color: var(--muted);
      font-size: 15px;
      font-weight: 700;
    }

    .ltc-profile-info-grid {
      margin-top: 28px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .ltc-profile-info-card {
      position: relative;
      overflow: hidden;
      min-height: 120px;
      border-radius: 22px;
      border: 1px solid rgba(35,95,62,.12);
      background: linear-gradient(145deg, #ffffff, #f8fbf7);
      padding: 22px;
      transition: .25s var(--ease);
    }

    .ltc-profile-info-card::before {
      content: "";
      position: absolute;
      inset: 0 0 auto;
      height: 5px;
      background: linear-gradient(90deg,var(--green-700),var(--gold));
      opacity: .9;
    }

    .ltc-profile-info-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 22px 44px rgba(8,39,25,.10);
      border-color: rgba(215,168,77,.45);
    }

    .ltc-profile-info-label {
      margin: 0;
      color: #7b8b81;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .16em;
      text-transform: uppercase;
    }

    .ltc-profile-info-value {
      margin: 12px 0 0;
      color: var(--green-950);
      font-size: 20px;
      line-height: 1.2;
      font-weight: 900;
      word-break: break-word;
    }

    .ltc-profile-actions {
      margin-top: 26px;
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
    }

    .ltc-primary-button,
    .ltc-outline-button {
      min-height: 50px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 0 24px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: .28s var(--ease);
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

    .ltc-message-success { margin-top: 14px; color: #dcfce7; font-size: 12px; font-weight: 800; }
    .ltc-message-error { margin-top: 14px; color: #fee2e2; font-size: 12px; font-weight: 800; }

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
      grid-template-columns: 1.2fr .8fr 1.2fr 1fr .8fr;
      gap: 22px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255,255,255,.1);
    }

    .ltc-footer-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }

    .ltc-footer-brand img {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      object-fit: cover;
      background: white;
    }

    .ltc-footer h4 {
      color: white;
      font-weight: 900;
      font-size: 20px;
      line-height: 1.2;
      margin: 0;
      text-transform: uppercase;
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
    .ltc-footer a {
      display: block;
      color: rgba(255,255,255,.68);
      font-size: 13px;
      line-height: 1.55;
      margin: 5px 0;
      text-decoration: none;
    }

    .ltc-footer a:hover { color: white; text-decoration: underline; }

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
      .ltc-manpower-employee-home *, .ltc-manpower-employee-home *::before, .ltc-manpower-employee-home *::after {
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
      .ltc-hero { padding: 76px 0 72px; }
      .ltc-profile-grid { grid-template-columns: 1fr; }
      .ltc-profile-card { min-height: 420px; }
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
      .ltc-section { padding: 52px 0; }
      .ltc-profile-shell, .ltc-profile-details { padding: 22px; border-radius: 24px; }
      .ltc-profile-info-grid { grid-template-columns: 1fr; }
      .ltc-primary-button, .ltc-outline-button, .ltc-upload-button { width: 100%; }
      .ltc-footer .ltc-container { padding-left: 16px; padding-right: 16px; }
    }


    /* Compact professional profile layout fix */
    .ltc-section {
      padding: 42px 0 56px;
    }

    .ltc-profile-shell {
      max-width: 1020px;
      margin: 0 auto;
      padding: 22px;
      border-radius: 28px;
    }

    .ltc-profile-grid {
      grid-template-columns: 315px minmax(0, 1fr);
      gap: 22px;
      align-items: stretch;
    }

    .ltc-profile-card {
      min-height: 420px;
      padding: 26px 22px;
      border-radius: 24px;
      justify-content: flex-start;
    }

    .ltc-profile-card::after {
      right: -76px;
      top: -76px;
      width: 160px;
      height: 160px;
    }

    .ltc-profile-photo {
      width: 104px;
      height: 104px;
      font-size: 38px;
      box-shadow: 0 0 0 7px rgba(255,255,255,.12), 0 14px 28px rgba(0,0,0,.18);
    }

    .ltc-profile-name {
      margin-top: 22px;
      font-size: 26px;
      line-height: 1.12;
    }

    .ltc-profile-email {
      margin-top: 8px;
      font-size: 12px;
    }

    .ltc-upload-button {
      min-width: 180px;
      min-height: 42px;
      margin-top: 24px;
      font-size: 11px;
    }

    .ltc-profile-status {
      margin-top: auto;
      padding: 8px 14px;
      font-size: 11px;
    }

    .ltc-profile-details {
      padding: 26px 28px;
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .ltc-section-heading {
      font-size: clamp(26px, 3vw, 36px);
    }

    .ltc-section-line {
      width: 150px;
      margin-top: 10px;
    }

    .ltc-section-intro {
      margin-top: 14px;
      font-size: 13px;
      line-height: 1.65;
    }

    .ltc-profile-info-grid {
      margin-top: 22px;
      gap: 14px;
    }

    .ltc-profile-info-card {
      min-height: 92px;
      border-radius: 18px;
      padding: 17px 18px;
    }

    .ltc-profile-info-label {
      font-size: 10px;
      letter-spacing: .14em;
    }

    .ltc-profile-info-value {
      margin-top: 9px;
      font-size: 17px;
      line-height: 1.2;
    }

    .ltc-profile-actions {
      margin-top: 22px;
      gap: 12px;
    }

    .ltc-primary-button,
    .ltc-outline-button {
      min-height: 44px;
      padding: 0 22px;
      font-size: 11px;
    }

    @media (max-width: 900px) {
      .ltc-profile-shell { max-width: 680px; padding: 20px; }
      .ltc-profile-grid { grid-template-columns: 1fr; }
      .ltc-profile-card { min-height: 340px; }
    }

    /* TraineeProfile layout style applied to manpower profile */
    .ltc-manpower-employee-home .hidden { display: none !important; }

    .ltc-manpower-employee-home .ltc-hero {
      min-height: 210px;
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;
      color: white;
      background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
      isolation: isolate;
    }

    .ltc-manpower-employee-home .ltc-hero-slide {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: .24;
      filter: saturate(.9) contrast(1.08);
    }

    .ltc-manpower-employee-home .ltc-hero:before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 18% 20%, rgba(244,212,132,.22), transparent 28%),
        linear-gradient(120deg, rgba(2,18,11,.94), rgba(7,31,20,.83), rgba(35,95,62,.70));
      z-index: 0;
    }

    .ltc-manpower-employee-home .ltc-hero:after {
      content: "";
      position: absolute;
      inset: -18% -10% -24% -10%;
      background:
        radial-gradient(circle at 18% 82%, rgba(19,120,72,.35), transparent 24%),
        radial-gradient(circle at 88% 44%, rgba(244,212,132,.15), transparent 28%);
      filter: blur(30px);
      z-index: 1;
      pointer-events: none;
    }

    .ltc-manpower-employee-home .ltc-hero-content {
      position: relative;
      z-index: 2;
      width: 100%;
      padding: 38px 0 42px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: ltcFadeUp .75s var(--ease) both;
    }

    .ltc-hero-kicker {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.18);
      background: rgba(255,255,255,.11);
      padding: 8px 12px;
      color: rgba(255,255,255,.86);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }

    .ltc-manpower-employee-home .ltc-hero-title {
      margin: 0 auto;
      max-width: 760px;
      font-size: clamp(42px, 5.5vw, 72px);
      line-height: .96;
      font-weight: 900;
      letter-spacing: -.06em;
      text-align: center;
      color: white;
    }

    .ltc-manpower-employee-home .ltc-hero-title span { color: var(--gold-soft); }
    .ltc-manpower-employee-home .ltc-hero-text {
      max-width: 720px;
      margin: 16px auto 0;
      color: rgba(255,255,255,.84);
      font-size: clamp(16px, 1.65vw, 20px);
      font-weight: 700;
      line-height: 1.7;
      text-align: center;
    }

    .ltc-profile-overview { padding: 32px 0 52px; }
    .ltc-profile-overview .ltc-container { width: min(1040px, 92%); }

    .ltc-profile-shell {
      max-width: none;
      border-radius: 28px;
      background: rgba(255,255,255,.86);
      border: 1px solid rgba(35,95,62,.12);
      box-shadow: 0 22px 54px rgba(8,39,25,.14);
      padding: 18px;
      animation: ltcFadeUp .72s var(--ease) both;
    }

    .ltc-profile-header-row {
      display: grid;
      grid-template-columns: minmax(230px,.72fr) minmax(0,1.55fr);
      gap: 18px;
      align-items: stretch;
    }

    .ltc-profile-card {
      position: relative;
      overflow: hidden;
      border-radius: 26px;
      background: linear-gradient(145deg, var(--green-900), var(--green-700));
      color: white;
      padding: 24px 22px;
      min-height: 430px;
      box-shadow: 0 20px 44px rgba(35,95,62,.18);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .ltc-profile-card:before {
      content: "";
      position: absolute;
      right: -54px;
      top: -54px;
      width: 160px;
      height: 160px;
      border-radius: 999px;
      background: rgba(244,212,132,.22);
    }

    .ltc-main-avatar {
      position: relative;
      width: 98px;
      height: 98px;
      border-radius: 999px;
      overflow: hidden;
      background: white;
      color: var(--green-800);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      font-weight: 900;
      box-shadow: 0 0 0 6px rgba(255,255,255,.14), 0 18px 38px rgba(0,0,0,.2);
      transition: transform .28s var(--ease), box-shadow .28s var(--ease);
    }

    .ltc-main-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .ltc-profile-card:hover .ltc-main-avatar {
      transform: translateY(-3px) scale(1.04);
      box-shadow: 0 0 0 7px rgba(255,255,255,.18), 0 22px 46px rgba(0,0,0,.24);
    }

    .ltc-profile-name {
      margin: 18px 0 0;
      font-size: 24px;
      line-height: 1.08;
      font-weight: 900;
      letter-spacing: -.04em;
      width: 100%;
      text-align: center;
    }

    .ltc-profile-email {
      margin: 8px auto 0;
      color: rgba(255,255,255,.82);
      font-size: 13px;
      font-weight: 700;
      overflow-wrap: anywhere;
      width: 100%;
      text-align: center;
    }

    .ltc-photo-button {
      margin-top: 22px;
      width: min(100%, 300px);
      border: 0;
      border-radius: 999px;
      background: linear-gradient(135deg,#f4d484,#d7a84d);
      color: #102418;
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .1em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 16px 34px rgba(215,168,77,.23);
      transition: .25s var(--ease);
    }

    .ltc-photo-button:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 22px 44px rgba(215,168,77,.32); }
    .ltc-photo-button:disabled { cursor: not-allowed; opacity: .62; }

    .ltc-profile-info-panel {
      border-radius: 26px;
      background: white;
      border: 1px solid rgba(35,95,62,.1);
      padding: 22px;
      box-shadow: 0 16px 38px rgba(8,39,25,.1);
    }

    .ltc-section-eyebrow { margin: 0; color: var(--gold); font-size: 12px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
    .ltc-section-title { margin: 6px 0 0; color: var(--green-900); font-size: clamp(24px,2.6vw,32px); line-height: 1.05; font-weight: 900; letter-spacing: -.05em; }
    .ltc-section-copy { margin: 10px 0 0; color: #667085; font-size: 14px; font-weight: 600; max-width: 720px; }

    .ltc-info-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0,1fr));
      gap: 12px;
      margin-top: 20px;
    }

    .ltc-info-card {
      min-height: 96px;
      border-radius: 18px;
      border: 1px solid rgba(35,95,62,.11);
      background: #f8fbf9;
      padding: 14px;
      transition: transform .25s var(--ease), box-shadow .25s var(--ease), border-color .25s var(--ease), background .25s var(--ease);
      animation: ltcFadeUp .65s var(--ease) both;
    }

    .ltc-info-card:hover {
      transform: translateY(-5px);
      border-color: rgba(215,168,77,.42);
      background: #fffdf7;
      box-shadow: 0 18px 38px rgba(35,95,62,.12);
    }

    .ltc-info-label { margin: 0; color: #7b897e; font-size: 11px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
    .ltc-info-value { margin: 8px 0 0; color: var(--green-900); font-size: 14px; font-weight: 900; line-height: 1.3; overflow-wrap: anywhere; }

    .ltc-action-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap: 12px;
      margin-top: 18px;
    }

    .ltc-action-button {
      border: 0;
      border-radius: 999px;
      background: linear-gradient(135deg,var(--green-800),var(--green-700));
      color: white;
      padding: 12px 14px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .09em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 14px 28px rgba(35,95,62,.2);
      transition: .25s var(--ease);
    }

    .ltc-action-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(35,95,62,.28);
      background: linear-gradient(135deg,var(--gold),#b98421);
      color: #102418;
    }

    .ltc-action-button.light {
      color: var(--green-800);
      background: #f5faf7;
      border: 1px solid rgba(35,95,62,.12);
      box-shadow: none;
    }

    .ltc-action-button.light:hover { background: #fff7df; color: #102418; border-color: rgba(215,168,77,.35); }

    .ltc-alert {
      margin-bottom: 18px;
      border-radius: 18px;
      padding: 14px 16px;
      font-size: 14px;
      font-weight: 800;
      animation: ltcFadeUp .45s var(--ease) both;
    }
    .ltc-alert-success { background: #ecfdf3; color: #067647; border: 1px solid #abefc6; }
    .ltc-alert-error { background: #fef3f2; color: #b42318; border: 1px solid #fecdca; }
    .ltc-loading-card {
      margin: 24px auto;
      border-radius: 22px;
      background: #f8fbf9;
      border: 1px solid rgba(35,95,62,.1);
      padding: 22px;
      color: var(--green-800);
      font-weight: 900;
      max-width: 1040px;
      text-align: center;
      box-shadow: 0 16px 38px rgba(8,39,25,.08);
    }

    .ltc-status-chip {
      margin-top: auto;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.18);
      background: rgba(255,255,255,.10);
      padding: 9px 16px;
      color: rgba(255,255,255,.84);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    @media (max-width: 1100px) {
      .ltc-profile-header-row { grid-template-columns: 1fr; }
      .ltc-info-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
    }

    @media (max-width: 720px) {
      .ltc-manpower-employee-home .ltc-hero { min-height: 190px; }
      .ltc-manpower-employee-home .ltc-hero-content { padding: 34px 0 38px; }
      .ltc-profile-overview { padding: 26px 0 44px; }
      .ltc-profile-shell { padding: 15px; border-radius: 24px; }
      .ltc-profile-card, .ltc-profile-info-panel { padding: 20px; border-radius: 22px; min-height: auto; }
      .ltc-info-grid, .ltc-action-row { grid-template-columns: 1fr; }
    }

    @media (max-width: 600px) {
      .ltc-section { padding: 34px 0 46px; }
      .ltc-profile-shell, .ltc-profile-details { padding: 18px; }
      .ltc-profile-info-card { min-height: 84px; }
    }

  `;

  return (
    <div className="ltc-manpower-employee-home" style={fontPontano}>
      <style>{profileStyles}</style>

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
                <p style={fontPontano}>Professional staffing and workforce solutions.</p>
              </div>
            </Link>

            <nav className="ltc-desktop-nav" aria-label="Employee navigation">
              <HeaderNavLink to={EMPLOYEE_HOME_ROUTE}>Home</HeaderNavLink>
              <HeaderNavLink to={EMPLOYEE_PAYROLL_ROUTE}>Payroll</HeaderNavLink>
              <HeaderNavLink to={EMPLOYEE_LEAVE_ROUTE}>Leave</HeaderNavLink>
            </nav>

            <div className="ltc-profile-wrap">
              <HeaderNavLink to={EMPLOYEE_PROFILE_ROUTE} active>
                Profile
              </HeaderNavLink>
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
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_PAYROLL_ROUTE} className="ltc-sidebar-link" style={fontPoppins}>
              Payroll
            </Link>
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_LEAVE_ROUTE} className="ltc-sidebar-link" style={fontPoppins}>
              Leave
            </Link>
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_PROFILE_ROUTE} className="ltc-sidebar-link active" style={fontPoppins}>
              Profile
            </Link>
          </div>
        </div>
      ) : null}

      <main>
        <section className="ltc-hero">
          <img
            src={HERO_IMAGE}
            alt="Manpower banner"
            className="ltc-hero-slide"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ltc-container ltc-hero-content">
            <h1 className="ltc-hero-title" style={fontMontserrat}>
              My <span>Profile</span>
            </h1>
            <p className="ltc-hero-text" style={fontPontano}>
              Review your manpower information, update your profile photo, and manage your account access.
            </p>
          </div>
        </section>

        <section className="ltc-profile-overview">
          <div className="ltc-container">
            {loading && (
              <div className="ltc-loading-card" style={fontPoppins}>
                Loading employee profile...
              </div>
            )}

            {!loading && error && (
              <div className="ltc-alert ltc-alert-error" style={fontPoppins}>
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="ltc-profile-shell">
                <div className="ltc-profile-header-row">
                  <aside className="ltc-profile-card">
                    <div className="ltc-main-avatar">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Employee profile" />
                      ) : (
                        profileInitial
                      )}
                    </div>

                    <h2 className="ltc-profile-name" style={fontMontserrat}>
                      {displayName}
                    </h2>

                    <p className="ltc-profile-email" style={fontPontano}>
                      {displayEmail}
                    </p>

                    <label className="ltc-photo-button" style={fontMontserrat}>
                      {photoState.loading ? "Uploading..." : "Upload Photo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePhotoUpload}
                        disabled={photoState.loading}
                        className="hidden"
                      />
                    </label>

                    {photoState.success && (
                      <p className="ltc-alert ltc-alert-success" style={{ ...fontPontano, marginTop: "14px", width: "100%" }}>
                        {photoState.success}
                      </p>
                    )}

                    {photoState.error && (
                      <p className="ltc-alert ltc-alert-error" style={{ ...fontPontano, marginTop: "14px", width: "100%" }}>
                        {photoState.error}
                      </p>
                    )}

                    <span className="ltc-status-chip" style={fontPoppins}>
                      {statusLabel}
                    </span>
                  </aside>

                  <section className="ltc-profile-info-panel">
                    <p className="ltc-section-eyebrow" style={fontPoppins}>
                      Profile Overview
                    </p>
                    <h2 className="ltc-section-title" style={fontMontserrat}>
                      Personal Information
                    </h2>
                    <p className="ltc-section-copy" style={fontPontano}>
                    </p>

                    <div className="ltc-info-grid">
                      <ProfileInfoBlock value={firstName} label="First Name" />
                      <ProfileInfoBlock value={lastName} label="Last Name" />
                      <ProfileInfoBlock value={middleName} label="Middle Name" />
                      <ProfileInfoBlock value={displayEmail} label="Email Address" />
                      <ProfileInfoBlock value={contactNumber} label="Contact Number" />
                      <ProfileInfoBlock value={statusLabel} label="Status" />
                    </div>

                    <div className="ltc-action-row">
                      <button
                        type="button"
                        onClick={() => navigate(EMPLOYEE_CHANGE_PASSWORD_ROUTE)}
                        className="ltc-action-button light"
                        style={fontMontserrat}
                      >
                        Change Password
                      </button>

                      <button
                        type="button"
                        onClick={logout}
                        className="ltc-action-button"
                        style={fontMontserrat}
                      >
                        Sign Out
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            )}
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
    </div>
  );
}

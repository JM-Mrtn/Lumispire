import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const HERO_IMAGE = "/ManpowerBanner.png";
const LOGO_IMAGE = "/ManpowerLogo.png";

const MANPOWER_HOME_ROUTE = "/manpower-services";
const EMPLOYEE_HOME_ROUTE = "/manpower-employee-home";
const EMPLOYEE_CHANGE_PASSWORD_ROUTE = "/manpower-employee-change-password";
const REMEMBER_EMAIL_KEY = "manpowerEmployeeRememberedEmail";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 12C3.8 8.5 7.4 6 12 6C16.6 6 20.2 8.5 22 12C20.2 15.5 16.6 18 12 18C7.4 18 3.8 15.5 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M10.6 6.2C11.05 6.07 11.52 6 12 6C16.6 6 20.2 8.5 22 12C21.22 13.52 20.16 14.84 18.9 15.88"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.12 14.12C13.58 14.66 12.83 15 12 15C10.34 15 9 13.66 9 12C9 11.17 9.34 10.42 9.88 9.88"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.1 8.12C4.84 9.16 3.78 10.48 3 12C4.8 15.5 8.4 18 13 18C13.48 18 13.95 17.93 14.4 17.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const manpowerLoginStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@600;700;800;900&display=swap");

  .manpower-employee-login-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --shadow-lg: 0 32px 80px rgba(8, 39, 25, 0.2);
    --ease: cubic-bezier(.22, 1, .36, 1);

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

  .manpower-employee-login-page * { box-sizing: border-box; }

  .manpower-employee-login-container {
    width: min(1180px, 92%);
    margin: auto;
  }

  .manpower-employee-login-header {
    position: sticky;
    top: 0;
    z-index: 50;
    width: 100%;
    background: var(--footer-green);
    border-bottom: 1px solid rgba(255,255,255,.1);
    box-shadow: 0 10px 34px rgba(7,31,20,.14);
    margin: 0;
  }

  .manpower-employee-login-header .manpower-employee-login-container {
    width: 100%;
    max-width: none;
    margin: 0;
    padding-left: 32px;
    padding-right: 32px;
  }

  .manpower-employee-login-nav {
    min-height: 76px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }

  .manpower-employee-login-logo {
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

  .manpower-employee-login-logo-icon {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    background: white;
    object-fit: contain;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
  }

  .manpower-employee-login-logo h1 {
    font-size: 18px;
    line-height: 1;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -.04em;
    margin: 0;
  }

  .manpower-employee-login-logo p {
    font-size: 11px;
    color: rgba(255,255,255,.72);
    margin: 3px 0 0;
  }

  .manpower-employee-login-desktop-nav {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .manpower-employee-login-nav-link {
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

  .manpower-employee-login-nav-link:hover,
  .manpower-employee-login-nav-link.active {
    color: white;
    background: rgba(255,255,255,.13);
    transform: translateY(-1px);
  }

  .manpower-employee-login-back-button {
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 14px 28px rgba(215,168,77,.18);
  }

  .manpower-employee-login-menu-button {
    display: none;
    color: white;
    border: 0;
    background: rgba(255,255,255,.1);
    border-radius: 12px;
    padding: 10px 14px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .manpower-employee-login-mobile-nav {
    display: none;
    border-top: 1px solid rgba(255,255,255,.1);
    padding: 8px 18px 18px;
    background: var(--footer-green);
  }

  .manpower-employee-login-mobile-nav button {
    display: block;
    width: 100%;
    border: 0;
    background: transparent;
    color: rgba(255,255,255,.82);
    text-align: left;
    padding: 12px 14px;
    border-radius: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .08em;
  }

  .manpower-employee-login-mobile-nav button:hover {
    color: white;
    background: rgba(255,255,255,.11);
  }

  .manpower-employee-login-hero {
    position: relative;
    min-height: calc(100vh - 76px);
    overflow: hidden;
    isolation: isolate;
    display: flex;
    align-items: center;
    padding: 54px 0;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
  }

  .manpower-employee-login-hero-bg {
    position: absolute;
    inset: 0;
    z-index: -4;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .32;
  }

  .manpower-employee-login-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -3;
    background: linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.88) 42%, rgba(12,64,39,.76) 100%);
  }

  .manpower-employee-login-hero::after {
    content: "";
    position: absolute;
    inset: -16% -10% -24%;
    z-index: -2;
    background:
      radial-gradient(circle at 16% 82%, rgba(19, 120, 72, 0.36), transparent 24%),
      radial-gradient(circle at 36% 92%, rgba(7, 76, 47, 0.46), transparent 30%),
      radial-gradient(circle at 72% 18%, rgba(28, 108, 68, 0.28), transparent 30%),
      radial-gradient(circle at 88% 44%, rgba(244, 212, 132, 0.14), transparent 28%),
      radial-gradient(circle at 90% 84%, rgba(22, 108, 66, 0.30), transparent 26%);
    filter: blur(30px);
    pointer-events: none;
  }

  .manpower-employee-login-grid {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(380px, .78fr);
    align-items: center;
    gap: 44px;
  }

  .manpower-employee-login-eyebrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(255,255,255,.11);
    color: var(--gold-soft);
    border-radius: 999px;
    padding: 12px 24px;
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .28em;
    text-transform: uppercase;
    backdrop-filter: blur(10px);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.14);
  }

  .manpower-employee-login-title {
    margin: 22px 0 16px;
    max-width: 720px;
    color: white;
    font-size: clamp(48px, 6vw, 86px);
    line-height: .92;
    font-weight: 950;
    letter-spacing: -.075em;
  }

  .manpower-employee-login-title span { color: var(--gold-soft); }

  .manpower-employee-login-copy {
    max-width: 620px;
    color: rgba(255,255,255,.84);
    font-size: 18px;
    line-height: 1.75;
    margin: 0;
  }

  .manpower-employee-login-points {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 30px;
    max-width: 700px;
  }

  .manpower-employee-login-point {
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 20px;
    background: rgba(255,255,255,.09);
    padding: 16px;
    backdrop-filter: blur(10px);
  }

  .manpower-employee-login-point strong {
    display: block;
    color: white;
    font-size: 14px;
    font-weight: 900;
    margin-bottom: 2px;
  }

  .manpower-employee-login-point span {
    display: block;
    color: rgba(255,255,255,.66);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.45;
  }

  .manpower-employee-login-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 30px;
    background: rgba(255,255,255,.92);
    box-shadow: var(--shadow-lg);
    padding: 34px;
    color: var(--dark);
    backdrop-filter: blur(18px);
    animation: loginFadeUp .7s var(--ease) both;
  }

  .manpower-employee-login-card::before {
    content: "";
    position: absolute;
    top: -90px;
    right: -90px;
    width: 190px;
    height: 190px;
    background: radial-gradient(circle, rgba(244,212,132,.36), transparent 66%);
    pointer-events: none;
  }

  .manpower-employee-login-card-header {
    position: relative;
    text-align: center;
    margin-bottom: 24px;
  }

  .manpower-employee-login-card-title {
    margin: 0;
    color: var(--green-950);
    font-size: 34px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -.05em;
  }

  .manpower-employee-login-card-subtitle {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: 14px;
    font-weight: 700;
  }

  .manpower-employee-login-alert {
    position: relative;
    border-radius: 18px;
    border: 1px solid rgba(239,68,68,.22);
    background: rgba(254,242,242,.95);
    color: #b91c1c;
    padding: 13px 15px;
    text-align: center;
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 18px;
  }

  .manpower-employee-login-form {
    position: relative;
    display: grid;
    gap: 18px;
  }

  .manpower-employee-login-field label {
    display: block;
    margin-bottom: 8px;
    color: var(--green-950);
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .manpower-employee-login-input-wrap { position: relative; }

  .manpower-employee-login-input {
    width: 100%;
    min-height: 54px;
    border: 1px solid rgba(8,39,25,.14);
    border-radius: 18px;
    background: rgba(255,255,255,.9);
    color: var(--dark);
    outline: none;
    padding: 0 18px;
    font-size: 15px;
    font-weight: 700;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
    transition: .22s var(--ease);
  }

  .manpower-employee-login-input.password { padding-right: 58px; }

  .manpower-employee-login-input:focus {
    border-color: rgba(215,168,77,.8);
    box-shadow: 0 0 0 4px rgba(215,168,77,.16);
    transform: translateY(-1px);
  }

  .manpower-employee-login-eye-button {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    color: var(--green-800);
    cursor: pointer;
    padding: 6px;
    border-radius: 999px;
    transition: .22s var(--ease);
  }

  .manpower-employee-login-eye-button:hover { background: rgba(8,39,25,.08); }

  .manpower-employee-login-submit {
    width: 100%;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--gold-soft), var(--gold));
    color: #102418;
    min-height: 56px;
    padding: 0 24px;
    font-size: 15px;
    font-weight: 950;
    letter-spacing: .12em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 18px 34px rgba(215,168,77,.28);
    transition: .25s var(--ease);
  }

  .manpower-employee-login-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 22px 42px rgba(215,168,77,.34);
  }

  .manpower-employee-login-submit:disabled {
    cursor: not-allowed;
    opacity: .62;
  }

  .manpower-employee-login-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: -4px;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
  }

  .manpower-employee-login-remember {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .manpower-employee-login-remember input { accent-color: var(--green-700); }

  .manpower-employee-login-caps {
    margin: 8px 0 0;
    color: #9a6410;
    font-size: 12px;
    font-weight: 800;
  }

  .manpower-employee-login-help {
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
  }

  .manpower-employee-login-links {
    display: grid;
    gap: 8px;
    text-align: center;
    margin-top: 3px;
  }

  .manpower-employee-login-links a {
    color: var(--green-800);
    font-weight: 900;
    text-decoration: none;
    transition: .22s var(--ease);
  }

  .manpower-employee-login-links a:hover { color: var(--gold); }

  .manpower-employee-login-links p {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
    font-weight: 700;
  }

  @keyframes loginFadeUp {
    from { opacity: 0; transform: translateY(26px) scale(.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 1024px) {
    .manpower-employee-login-desktop-nav { display: none; }
    .manpower-employee-login-menu-button { display: inline-flex; align-items: center; justify-content: center; }
    .manpower-employee-login-mobile-nav.open { display: block; }
    .manpower-employee-login-grid { grid-template-columns: 1fr; gap: 32px; max-width: 760px; margin: 0 auto; }
    .manpower-employee-login-hero-copy { text-align: center; }
    .manpower-employee-login-title, .manpower-employee-login-copy { margin-left: auto; margin-right: auto; }
    .manpower-employee-login-points { margin-left: auto; margin-right: auto; }
  }

  @media (max-width: 680px) {
    .manpower-employee-login-header .manpower-employee-login-container { padding-left: 18px; padding-right: 18px; }
    .manpower-employee-login-nav { min-height: 68px; }
    .manpower-employee-login-logo-icon { width: 38px; height: 38px; }
    .manpower-employee-login-logo h1 { font-size: 16px; }
    .manpower-employee-login-logo p { display: none; }
    .manpower-employee-login-hero { min-height: calc(100vh - 68px); padding: 32px 0; }
    .manpower-employee-login-eyebrow { padding: 10px 16px; font-size: 10px; letter-spacing: .18em; }
    .manpower-employee-login-title { font-size: clamp(40px, 12vw, 58px); }
    .manpower-employee-login-copy { font-size: 15px; }
    .manpower-employee-login-points { grid-template-columns: 1fr; }
    .manpower-employee-login-card { border-radius: 24px; padding: 26px 20px; }
    .manpower-employee-login-card-title { font-size: 28px; }
  }
`;

export default function ManpowerEmployeeLogin({ onLogin }) {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(
    () => Boolean(localStorage.getItem(REMEMBER_EMAIL_KEY))
  );
  const [checkingSession, setCheckingSession] = useState(true);

  const [form, setForm] = useState({
    email: localStorage.getItem(REMEMBER_EMAIL_KEY) || "",
    password: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
  });

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("manpowerEmployeeToken") || "";

    async function validateExistingSession() {
      if (!token) {
        if (active) setCheckingSession(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/manpower/employee/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          localStorage.removeItem("manpowerEmployeeToken");
          localStorage.removeItem("manpowerEmployeeUser");
          if (active) setCheckingSession(false);
          return;
        }

        const employee = data?.employee || null;
        localStorage.setItem("manpowerEmployeeUser", JSON.stringify(employee));
        if (!active) return;
        navigate(
          employee?.mustChangePassword
            ? EMPLOYEE_CHANGE_PASSWORD_ROUTE
            : EMPLOYEE_HOME_ROUTE,
          { replace: true }
        );
      } catch {
        if (active) setCheckingSession(false);
      }
    }

    validateExistingSession();
    return () => {
      active = false;
    };
  }, [navigate]);

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  function updateField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setStatus({
      loading: false,
      error: "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      email: form.email.trim(),
      password: form.password,
    };

    if (!payload.email || !payload.password) {
      setStatus({
        loading: false,
        error: "Please enter your employee email and password.",
      });
      return;
    }

    try {
      setStatus({
        loading: true,
        error: "",
      });

      const res = await fetch(`${API_BASE}/manpower/employee/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Invalid employee email or password.");
      }

      const token = data?.token || data?.employeeToken || "";
      const employee = data?.employee || data?.user || null;

      if (!token) {
        throw new Error("Login succeeded, but no employee token was returned.");
      }

      localStorage.setItem("manpowerEmployeeToken", token);
      localStorage.setItem("manpowerEmployeeUser", JSON.stringify(employee));
      if (rememberEmail) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, payload.email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      if (typeof onLogin === "function") {
        onLogin({
          token,
          employee,
        });
      }

      if (employee?.mustChangePassword) {
        navigate(EMPLOYEE_CHANGE_PASSWORD_ROUTE, { replace: true });
        return;
      }

      navigate(EMPLOYEE_HOME_ROUTE, { replace: true });
    } catch (error) {
      const rawMessage = String(error?.message || "Failed to sign in.");
      const lower = rawMessage.toLowerCase();
      let friendlyMessage = rawMessage;
      if (lower.includes("inactive") || lower.includes("disabled")) {
        friendlyMessage = "Your employee account is inactive. Please contact HR or the administrator.";
      } else if (lower.includes("unauthorized") || lower.includes("invalid")) {
        friendlyMessage = "Invalid employee email or password.";
      }
      setStatus({ loading: false, error: friendlyMessage });
    }
  }

  return (
    <div className="manpower-employee-login-page">
      <style>{manpowerLoginStyles}</style>

      <header className="manpower-employee-login-header">
        <div className="manpower-employee-login-container">
          <div className="manpower-employee-login-nav">
            <button
              type="button"
              onClick={() => goTo(MANPOWER_HOME_ROUTE)}
              className="manpower-employee-login-logo"
              aria-label="LTC Manpower Home"
            >
              <img
                src={LOGO_IMAGE}
                alt="LTC Manpower Logo"
                className="manpower-employee-login-logo-icon"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />

              <span>
                <h1>LTC Manpower</h1>
                <p>Professional staffing and workforce solutions.</p>
              </span>
            </button>

            <nav className="manpower-employee-login-desktop-nav">
              <Link to={MANPOWER_HOME_ROUTE} className="manpower-employee-login-nav-link">
                Home
              </Link>
              <Link to="/manpower-positions" className="manpower-employee-login-nav-link">
                Job Offer
              </Link>
              <Link to="/manpower-requirements" className="manpower-employee-login-nav-link">
                Requirements
              </Link>
              <Link to="/manpower-contact" className="manpower-employee-login-nav-link">
                Contact
              </Link>
              <Link to="/manpower-faqs" className="manpower-employee-login-nav-link">
                FAQs
              </Link>
              <Link to={MANPOWER_HOME_ROUTE} className="manpower-employee-login-nav-link manpower-employee-login-back-button">
                Back
              </Link>
            </nav>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="manpower-employee-login-menu-button"
            >
              Menu
            </button>
          </div>
        </div>

        <div className={`manpower-employee-login-mobile-nav ${mobileOpen ? "open" : ""}`}>
          <button type="button" onClick={() => goTo(MANPOWER_HOME_ROUTE)}>Home</button>
          <button type="button" onClick={() => goTo("/manpower-positions")}>Job Offer</button>
          <button type="button" onClick={() => goTo("/manpower-requirements")}>Requirements</button>
          <button type="button" onClick={() => goTo("/manpower-contact")}>Contact</button>
          <button type="button" onClick={() => goTo("/manpower-faqs")}>FAQs</button>
          <button type="button" onClick={() => goTo(MANPOWER_HOME_ROUTE)}>Back</button>
        </div>
      </header>

      <main>
        <section className="manpower-employee-login-hero">
          <img
            src={HERO_IMAGE}
            alt="LTC Manpower"
            className="manpower-employee-login-hero-bg"
            onError={(event) => {
              event.currentTarget.src =
                "https://placehold.co/1600x900/082719/f4d484?text=LTC+Manpower+Services";
            }}
          />

          <div className="manpower-employee-login-container manpower-employee-login-grid">
            <div className="manpower-employee-login-hero-copy">
              <div className="manpower-employee-login-eyebrow">Employee Portal</div>

              <h2 className="manpower-employee-login-title">
                Welcome <span>Back</span>
              </h2>

              <p className="manpower-employee-login-copy">
                Sign in to access your manpower employee dashboard, review your account, and manage your work information securely.
              </p>

              <div className="manpower-employee-login-points" aria-hidden="true">
                <div className="manpower-employee-login-point">
                  <strong>Secure Login</strong>
                  <span>Protected employee access</span>
                </div>
                <div className="manpower-employee-login-point">
                  <strong>Account Status</strong>
                  <span>Access manpower tools</span>
                </div>
                <div className="manpower-employee-login-point">
                  <strong>Fast Access</strong>
                  <span>Continue to your dashboard</span>
                </div>
              </div>
            </div>

            <div className="manpower-employee-login-card">
              <div className="manpower-employee-login-card-header">
                <h1 className="manpower-employee-login-card-title">Employee Login</h1>
                <p className="manpower-employee-login-card-subtitle">
                  Enter your employee email and password to continue.
                </p>
              </div>

              {status.error && <div className="manpower-employee-login-alert">{status.error}</div>}

              <form onSubmit={handleSubmit} className="manpower-employee-login-form">
                <div className="manpower-employee-login-field">
                  <label htmlFor="employee-email">Employee Email</label>
                  <input
                    id="employee-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    autoComplete="email"
                    className="manpower-employee-login-input"
                  />
                </div>

                <div className="manpower-employee-login-field">
                  <label htmlFor="employee-password">Password</label>
                  <div className="manpower-employee-login-input-wrap">
                    <input
                      id="employee-password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      onKeyUp={(event) => setCapsLockOn(event.getModifierState("CapsLock"))}
                      onKeyDown={(event) => setCapsLockOn(event.getModifierState("CapsLock"))}
                      onBlur={() => setCapsLockOn(false)}
                      autoComplete="current-password"
                      className="manpower-employee-login-input password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="manpower-employee-login-eye-button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {capsLockOn ? (
                    <p className="manpower-employee-login-caps" role="status">Caps Lock is on.</p>
                  ) : null}
                </div>

                <div className="manpower-employee-login-options">
                  <label className="manpower-employee-login-remember">
                    <input
                      type="checkbox"
                      checked={rememberEmail}
                      onChange={(event) => setRememberEmail(event.target.checked)}
                    />
                    Remember email
                  </label>
                  <span className="manpower-employee-login-help">Password help: contact HR.</span>
                </div>

                <button type="submit" disabled={status.loading || checkingSession} className="manpower-employee-login-submit">
                  {checkingSession ? "Checking Session..." : status.loading ? "Signing In..." : "Sign In"}
                </button>

                <div className="manpower-employee-login-links">
                  <p>
                    Don&apos;t have account? <Link to="/manpower-apply">Apply Now</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

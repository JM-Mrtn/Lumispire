import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKGROUND_IMAGES = ["/TrainingAds.png", "/LTCBanner.png", "/TrainingAssessment.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
  return `${clean}/api`;
}

function getHrToken() {
  return localStorage.getItem("manpowerHrToken") || "";
}

function saveHrSession(token, hrUser) {
  localStorage.setItem("manpowerHrToken", token);
  localStorage.setItem("manpowerHrUser", JSON.stringify(hrUser || null));
}

async function readJsonSafe(res) {
  const text = await res.text();
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new Error(text?.slice(0, 160) || "Invalid server response.");
  }
}

export default function ManpowerHrLogin() {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  const API_BASE = useMemo(() => normalizeApiBase(import.meta.env.VITE_API_URL), []);

  useEffect(() => {
    if (getHrToken()) {
      navigate("/manpower-hr", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/manpower/hr/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message || "Login failed.");
      }

      saveHrSession(data.token, data.hrUser);
      setLoginForm({ username: "", password: "" });
      navigate("/manpower-hr", { replace: true });
    } catch (error) {
      setLoginError(error?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  const goToMainHome = () => navigate("/");
  const goToManpowerHome = () => navigate("/manpower");

  const UserIcon = () => (
    <svg viewBox="0 0 24 24" className="ltc-input-icon-svg" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );

  const LockIcon = () => (
    <svg viewBox="0 0 24 24" className="ltc-input-icon-svg" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );

  const EyeIcon = ({ open }) => (
    <svg viewBox="0 0 24 24" className="ltc-input-icon-svg" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
      />
      <circle cx="12" cy="12" r="2.75" />
      {!open && <path strokeLinecap="round" d="M4 20L20 4" />}
    </svg>
  );

  const PinIcon = () => (
    <svg viewBox="0 0 24 24" className="ltc-location-icon" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );

  const ManpowerLogo = () => (
    <button type="button" onClick={goToManpowerHome} className="ltc-logo" aria-label="Go to manpower home">
      <img
        src="/LTCLogo.jpg"
        alt="LTC Group logo"
        className="ltc-logo-icon"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      <div>
        <h1 style={fontMontserrat}>Manpower HR</h1>
        <p style={fontPontano}>Employees, jobs, payroll, and manpower records.</p>
      </div>
    </button>
  );

  return (
    <div className="ltc-hotel-login-page" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .ltc-hotel-login-page {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
          --footer-green: #082719;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --dark: #101828;
          --muted: #667085;
          --glass: rgba(255,255,255,.78);
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

        .ltc-hotel-login-page * {
          box-sizing: border-box;
        }

        .ltc-login-shell {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          isolation: isolate;
          color: white;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
        }

        .ltc-login-bg {
          position: absolute;
          inset: 0;
          z-index: -4;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 1000ms ease;
        }

        .ltc-login-bg.active {
          opacity: 1;
        }

        .ltc-login-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -3;
          background:
            linear-gradient(
              120deg,
              rgba(2, 18, 11, 0.96) 0%,
              rgba(5, 37, 23, 0.88) 42%,
              rgba(12, 64, 39, 0.76) 100%
            );
          opacity: .98;
        }

        .ltc-login-shell::after {
          content: "";
          position: absolute;
          inset: -16% -10% -24% -10%;
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

        .ltc-container {
          width: min(1180px, 92%);
          margin: auto;
        }

        .ltc-header {
          position: relative;
          z-index: 20;
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
        }

        .ltc-nav-link:hover,
        .ltc-nav-link.active {
          color: white;
          background: rgba(255,255,255,.13);
          transform: translateY(-1px);
        }

        .ltc-login-main {
          position: relative;
          z-index: 5;
          min-height: calc(100vh - 76px);
          display: grid;
          grid-template-columns: minmax(0, 1fr) 470px;
          align-items: center;
          gap: 48px;
          padding: 76px 0;
        }

        .ltc-login-copy {
          max-width: 690px;
        }

        .ltc-login-copy .eyebrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 54px;
          padding: 0 28px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.24);
          background: rgba(255,255,255,.12);
          color: var(--gold-soft);
          font-size: 18px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .22em;
          line-height: 1;
          backdrop-filter: blur(8px);
        }

        .ltc-login-copy h2 {
          margin: 22px 0 0;
          color: white;
          font-size: clamp(42px, 6vw, 72px);
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: -.06em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .ltc-login-copy h2 span {
          color: var(--gold-soft);
        }

        .ltc-login-copy p {
          max-width: 650px;
          margin: 18px 0 0;
          color: rgba(255,255,255,.80);
          font-size: 17px;
          line-height: 1.8;
        }

        .ltc-location-box {
          margin-top: 22px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          width: 320px;
          min-height: 74px;
          padding: 12px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,.16);
          background: rgba(255,255,255,.10);
          backdrop-filter: blur(10px);
          box-shadow: 0 14px 32px rgba(0,0,0,.12);
          vertical-align: top;
        }

        .ltc-location-box + .ltc-location-box {
          margin-left: 10px;
        }

        .ltc-location-icon {
          width: 24px;
          height: 24px;
          color: var(--gold-soft);
          flex: 0 0 auto;
        }

        .ltc-location-box h3 {
          margin: 0;
          color: white;
          font-size: 17px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -.03em;
        }

        .ltc-location-box p {
          margin: 2px 0 0;
          color: rgba(255,255,255,.72);
          font-size: 12px;
          line-height: 1.3;
        }

        .ltc-login-card {
          position: relative;
          overflow: hidden;
          width: 100%;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(18px);
          padding: 34px;
          transition: .38s var(--ease);
        }

        .ltc-login-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          z-index: 3;
        }

        .ltc-login-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 36px 90px rgba(8,39,25,.26);
          border-color: rgba(215,168,77,.45);
        }

        .ltc-card-title {
          text-align: center;
        }

        .ltc-card-title p {
          margin: 0;
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .ltc-card-title h1 {
          margin: 8px 0 0;
          color: var(--green-950);
          font-size: clamp(32px, 4vw, 44px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.055em;
        }

        .ltc-card-title h1 span {
          color: var(--gold);
        }

        .ltc-error-alert {
          margin-top: 20px;
          border-radius: 18px;
          border: 1px solid rgba(239,68,68,.22);
          background: rgba(239,68,68,.10);
          color: #b42318;
          padding: 13px 16px;
          text-align: center;
          font-size: 13px;
          line-height: 1.45;
          font-weight: 700;
        }

        .ltc-login-form {
          margin-top: 26px;
          display: grid;
          gap: 15px;
        }

        .ltc-field-wrap {
          display: grid;
          gap: 7px;
        }

        .ltc-field-label {
          padding-left: 16px;
          color: rgba(16,36,24,.58);
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .12em;
        }

        .ltc-input-shell {
          position: relative;
        }

        .ltc-input-icon {
          pointer-events: none;
          position: absolute;
          left: 17px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--green-700);
          display: grid;
          place-items: center;
        }

        .ltc-input-icon-svg {
          width: 20px;
          height: 20px;
        }

        .ltc-eye-button {
          position: absolute;
          right: 17px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: var(--green-700);
          cursor: pointer;
          display: grid;
          place-items: center;
          padding: 0;
          transition: .25s var(--ease);
        }

        .ltc-eye-button:hover {
          color: var(--green-950);
          transform: translateY(-50%) scale(1.05);
        }

        .ltc-eye-button:disabled {
          cursor: not-allowed;
          opacity: .55;
        }

        .ltc-input {
          width: 100%;
          min-height: 54px;
          border: 1px solid rgba(35,95,62,.18);
          background: rgba(248,250,247,.88);
          color: var(--dark);
          border-radius: 999px;
          padding: 0 18px 0 50px;
          font-size: 14px;
          outline: none;
          transition: .25s var(--ease);
          font-family: inherit;
        }

        .ltc-input.has-eye {
          padding-right: 52px;
        }

        .ltc-input::placeholder {
          color: rgba(102,112,133,.72);
        }

        .ltc-input:focus {
          border-color: var(--green-700);
          background: white;
          box-shadow: 0 0 0 4px rgba(35,95,62,.1);
        }

        .ltc-input:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .ltc-submit-button {
          margin: 8px auto 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
          width: 100%;
          border-radius: 999px;
          border: 0;
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.28);
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          transition: .28s var(--ease);
        }

        .ltc-submit-button:hover {
          transform: translateY(-3px);
        }

        .ltc-submit-button:disabled {
          cursor: not-allowed;
          opacity: .6;
          transform: none;
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
          grid-template-columns: 1.2fr .8fr 1.2fr 1fr .8fr;
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
          width: 42px;
          height: 42px;
          border-radius: 999px;
          object-fit: cover;
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
        .ltc-footer-link {
          display: block;
          color: rgba(255,255,255,.68);
          font-size: 13px;
          line-height: 1.55;
          margin: 5px 0;
        }

        .ltc-footer-link {
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          text-align: left;
        }

        .ltc-footer-link:hover {
          color: white;
          text-decoration: underline;
        }

        .ltc-socials {
          display: flex;
          gap: 8px;
        }

        .ltc-socials span {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: rgba(255,255,255,.13);
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

        @media (max-width: 1000px) {
          .ltc-login-main {
            grid-template-columns: 1fr;
            gap: 34px;
            padding: 58px 0;
          }

          .ltc-login-copy {
            max-width: 760px;
            text-align: center;
            margin: 0 auto;
          }

          .ltc-location-box {
            margin-left: auto;
            margin-right: auto;
          }

          .ltc-location-box + .ltc-location-box {
            margin-left: 10px;
          }

          .ltc-login-card {
            max-width: 500px;
            margin: 0 auto;
          }
        }

        @media (max-width: 900px) {
          .ltc-header .ltc-container {
            padding-left: 22px;
            padding-right: 22px;
          }

          .ltc-nav {
            min-height: auto;
            padding: 18px 0;
          }
        }

        @media (max-width: 600px) {
          .ltc-header .ltc-container {
            padding-left: 16px;
            padding-right: 16px;
          }

          .ltc-logo h1 {
            font-size: 14px;
          }

          .ltc-logo p {
            font-size: 10px;
          }

          .ltc-desktop-nav {
            gap: 4px;
          }

          .ltc-nav-link {
            font-size: 11px;
            padding: 9px 10px;
          }

          .ltc-login-main {
            min-height: auto;
            padding: 44px 0 58px;
          }

          .ltc-login-copy .eyebrow {
            min-height: 48px;
            padding: 0 22px;
            font-size: 15px;
            letter-spacing: .18em;
          }

          .ltc-login-copy h2 {
            font-size: clamp(36px, 12vw, 48px);
            letter-spacing: -.045em;
          }

          .ltc-login-copy p {
            font-size: 15px;
          }

          .ltc-location-box {
            width: 100%;
            max-width: 320px;
            justify-content: flex-start;
            text-align: left;
          }

          .ltc-location-box + .ltc-location-box {
            margin-left: 0;
            margin-top: 12px;
          }

          .ltc-login-card {
            padding: 28px 20px;
          }

          .ltc-card-title h1 {
            font-size: 34px;
          }
        }
      

        .ltc-error-alert.success {
          border-color: rgba(16, 185, 129, .28);
          background: rgba(16, 185, 129, .10);
          color: #047857;
        }

        .ltc-input:disabled,
        .ltc-eye-button:disabled {
          opacity: .65;
          cursor: not-allowed;
        }


        .ltc-login-card,
        .ltc-login-copy,
        .ltc-location-box {
          animation: ltcFadeUp .75s var(--ease) both;
        }

        .ltc-login-card { animation-delay: .12s; }
        .ltc-location-box:nth-of-type(2) { animation-delay: .18s; }
        .ltc-location-box:nth-of-type(3) { animation-delay: .25s; }

        @keyframes ltcFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ltc-login-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 36px 90px rgba(8, 39, 25, .24);
        }

        .ltc-location-box:hover {
          transform: translateY(-4px);
          border-color: rgba(244, 212, 132, .52);
          background: rgba(255, 255, 255, .16);
        }

        .ltc-input-shell:focus-within {
          transform: translateY(-2px);
          box-shadow: 0 16px 35px rgba(8, 39, 25, .14);
        }
`}</style>

      <div className="ltc-login-shell">
        {BACKGROUND_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`ltc-login-bg ${bgIndex === index ? "active" : ""}`}
            style={{ backgroundImage: `url('${image}')` }}
          />
        ))}

        <header className="ltc-header">
          <div className="ltc-container ltc-nav">
            <ManpowerLogo />

            <nav className="ltc-desktop-nav" style={fontPoppins}>
              <button type="button" onClick={goToMainHome} className="ltc-nav-link">
                HOME
              </button>

              <button type="button" onClick={goToManpowerHome} className="ltc-nav-link active">
                MANPOWER
              </button>
            </nav>
          </div>
        </header>

        <main className="ltc-container ltc-login-main">
          <section className="ltc-login-copy">
            <div className="eyebrow" style={fontMontserrat}>
              Human Resources Portal
            </div>

            <h2 style={fontMontserrat}>
              LTC Manpower <span>Services</span>
            </h2>

            <p style={fontPontano}>
              Sign in to review manpower records, support employee workflows, and manage HR-side manpower operations.
            </p>

            <div className="ltc-location-box">
              <PinIcon />

              <div>
                <h3 style={fontMontserrat}>LTC Group of Companies</h3>
                <p style={fontPoppins}>Centralized manpower HR portal</p>
              </div>
            </div>

            <div className="ltc-location-box">
              <PinIcon />

              <div>
                <h3 style={fontMontserrat}>Secure HR Access</h3>
                <p style={fontPoppins}>Employee records, applications, and HR workflow controls</p>
              </div>
            </div>
          </section>

          <section className="ltc-login-card">
            <div className="ltc-card-title">
              <p style={fontMontserrat}>LTC MANPOWER SERVICES</p>
              <h1 style={fontMontserrat}>
                HR <span>Login</span>
              </h1>
            </div>

            {loginError ? (
              <div className="ltc-error-alert" style={fontPoppins}>
                {loginError}
              </div>
            ) : null}

            <form className="ltc-login-form" onSubmit={handleLogin}>
              <div className="ltc-field-wrap">
                <div className="ltc-input-shell">
                  <span className="ltc-input-icon">
                    <UserIcon />
                  </span>

                  <input
                    type="text"
                    placeholder="Enter HR username"
                    value={loginForm.username}
                    onChange={(event) => {
                      setLoginForm((prev) => ({
                        ...prev,
                        username: event.target.value,
                      }));
                      setLoginError("");
                    }}
                    autoComplete="username"
                    disabled={loading}
                    className="ltc-input"
                    style={fontPoppins}
                    required
                  />
                </div>
              </div>

              <div className="ltc-field-wrap">
                <div className="ltc-input-shell">
                  <span className="ltc-input-icon">
                    <LockIcon />
                  </span>

                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Enter HR password"
                    value={loginForm.password}
                    onChange={(event) => {
                      setLoginForm((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }));
                      setLoginError("");
                    }}
                    autoComplete="current-password"
                    disabled={loading}
                    className="ltc-input has-eye"
                    style={fontPoppins}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw((value) => !value)}
                    className="ltc-eye-button"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="ltc-submit-button"
                style={fontMontserrat}
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

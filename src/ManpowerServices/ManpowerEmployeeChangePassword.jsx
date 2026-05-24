import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const LOGO_IMAGE = "/ManpowerLogo.png";
const HERO_IMAGE = "/ManpowerBanner.png";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-change-password-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --glass: rgba(255,255,255,.88);
    --shadow-md: 0 18px 45px rgba(8,39,25,.12);
    --shadow-lg: 0 32px 80px rgba(8,39,25,.18);
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

  .ltc-change-password-page * { box-sizing: border-box; }
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
    transition: .25s var(--ease);
  }

  .ltc-logo:hover { transform: translateY(-1px); }

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

  .ltc-desktop-nav { display: flex; align-items: center; gap: 8px; margin-left: auto; }

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

  .ltc-hero {
    position: relative;
    overflow: hidden;
    color: white;
    isolation: isolate;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
    padding: 74px 0 66px;
  }

  .ltc-hero-slide {
    position: absolute;
    inset: 0;
    z-index: -4;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .30;
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
      radial-gradient(circle at 88% 44%, rgba(244,212,132,.14), transparent 28%);
    animation: ltcFloatGlow 8s ease-in-out infinite alternate;
  }

  .ltc-hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 900px;
    animation: ltcFadeUp .72s var(--ease) both;
  }

  .ltc-eyebrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0 28px;
    border: 1px solid rgba(255,255,255,.24);
    background: rgba(255,255,255,.12);
    border-radius: 999px;
    color: var(--gold-soft);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .24em;
    text-transform: uppercase;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
  }

  .ltc-hero-title {
    margin: 24px 0 16px;
    font-size: clamp(42px, 6.5vw, 82px);
    line-height: .95;
    font-weight: 900;
    letter-spacing: -.08em;
  }

  .ltc-hero-title span { color: var(--gold-soft); }

  .ltc-hero-text {
    max-width: 750px;
    margin: 0 auto;
    color: rgba(255,255,255,.9);
    font-size: clamp(16px, 2vw, 21px);
  }

  .ltc-section { padding: 54px 0 70px; }

  .ltc-form-shell {
    position: relative;
    overflow: hidden;
    max-width: 780px;
    margin: 0 auto;
    padding: clamp(24px, 4vw, 42px);
    border-radius: 32px;
    background: var(--glass);
    border: 1px solid rgba(8,39,25,.1);
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(18px);
    animation: ltcFadeUp .78s var(--ease) .08s both;
    transition: transform .28s var(--ease), box-shadow .28s var(--ease);
  }

  .ltc-form-shell:hover {
    transform: translateY(-4px);
    box-shadow: 0 36px 90px rgba(8,39,25,.22);
  }

  .ltc-form-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(244,212,132,.16), transparent 34%, rgba(35,95,62,.08));
  }

  .ltc-form-inner { position: relative; z-index: 1; }

  .ltc-form-header {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .ltc-section-heading {
    margin: 0;
    color: var(--green-900);
    font-size: clamp(28px, 4vw, 42px);
    line-height: 1;
    font-weight: 900;
    letter-spacing: -.06em;
  }

  .ltc-section-line {
    width: 72px;
    height: 4px;
    border-radius: 999px;
    margin: 16px 0;
    background: linear-gradient(90deg,var(--gold-soft),var(--gold));
  }

  .ltc-muted-text { color: var(--muted); margin: 0; font-size: 14px; line-height: 1.7; }
  .ltc-form-grid { display: grid; gap: 18px; }

  .ltc-field { animation: ltcFadeUp .7s var(--ease) both; }
  .ltc-field:nth-child(1) { animation-delay: .10s; }
  .ltc-field:nth-child(2) { animation-delay: .16s; }
  .ltc-field:nth-child(3) { animation-delay: .22s; }
  .ltc-field:nth-child(4) { animation-delay: .28s; }

  .ltc-field label {
    display: block;
    color: var(--green-900);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 9px;
  }

  .ltc-input {
    width: 100%;
    min-height: 54px;
    border: 1px solid rgba(8,39,25,.14);
    border-radius: 18px;
    background: rgba(255,255,255,.9);
    color: var(--green-950);
    padding: 0 18px;
    outline: none;
    font-size: 15px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
    transition: .25s var(--ease);
  }

  .ltc-input:hover { border-color: rgba(35,95,62,.28); transform: translateY(-1px); }
  .ltc-input:focus { border-color: rgba(215,168,77,.8); box-shadow: 0 0 0 4px rgba(215,168,77,.16); }

  .ltc-actions { display: grid; gap: 12px; margin-top: 22px; }

  .ltc-actions-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .ltc-primary-button,
  .ltc-secondary-button,
  .ltc-outline-button {
    border: 0;
    border-radius: 999px;
    min-height: 52px;
    padding: 0 24px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: .25s var(--ease);
    text-decoration: none;
  }

  .ltc-primary-button {
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 18px 34px rgba(215,168,77,.24);
  }

  .ltc-primary-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 24px 45px rgba(215,168,77,.32); }

  .ltc-secondary-button {
    color: white;
    background: linear-gradient(135deg,#235f3e,#082719);
    box-shadow: 0 16px 30px rgba(8,39,25,.18);
  }

  .ltc-secondary-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 22px 42px rgba(8,39,25,.24); }

  .ltc-outline-button {
    color: var(--green-900);
    background: rgba(8,39,25,.08);
    border: 1px solid rgba(8,39,25,.12);
  }

  .ltc-outline-button:hover:not(:disabled) { transform: translateY(-2px); background: rgba(215,168,77,.18); }

  .ltc-primary-button:disabled,
  .ltc-secondary-button:disabled { opacity: .62; cursor: not-allowed; transform: none; }

  .ltc-status {
    border-radius: 18px;
    padding: 14px 16px;
    margin-bottom: 18px;
    font-size: 14px;
    font-weight: 700;
    border: 1px solid transparent;
    animation: ltcFadeUp .42s var(--ease) both;
  }

  .ltc-status-success { color: #067647; background: #ecfdf3; border-color: #abefc6; }
  .ltc-status-error { color: #b42318; background: #fef3f2; border-color: #fecdca; }
  .ltc-status-info { color: #344054; background: #f2f4f7; border-color: #eaecf0; }

  .ltc-note { color: rgba(8,39,25,.62); font-size: 12px; line-height: 1.6; text-align: center; margin: 20px 0 0; }

  .ltc-footer { background: var(--footer-green); color: white; padding: 32px 0; text-align: center; }
  .ltc-footer p { margin: 0; color: rgba(255,255,255,.72); font-size: 13px; }

  @keyframes ltcFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes ltcFloatGlow {
    from { transform: translate3d(-1%, -1%, 0) scale(1); }
    to { transform: translate3d(1%, 1%, 0) scale(1.04); }
  }

  @media (max-width: 768px) {
    .ltc-header .ltc-container { padding-left: 18px; padding-right: 18px; }
    .ltc-desktop-nav { gap: 4px; flex-wrap: wrap; justify-content: flex-end; }
    .ltc-nav-link { font-size: 10px; padding: 8px 9px; }
    .ltc-logo p { display: none; }
    .ltc-hero { padding: 58px 0 54px; }
    .ltc-form-header { flex-direction: column; }
  }

  @media (max-width: 560px) {
    .ltc-nav { min-height: auto; padding: 14px 0; align-items: flex-start; flex-direction: column; }
    .ltc-desktop-nav { width: 100%; justify-content: flex-start; }
    .ltc-eyebrow { min-height: 46px; padding: 0 22px; font-size: 11px; letter-spacing: .18em; }
    .ltc-section { padding: 34px 0 48px; }
    .ltc-form-shell { border-radius: 24px; }
    .ltc-actions-row { grid-template-columns: 1fr; }
  }
`;

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

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Manpower Logo"
        className="h-10 w-10 rounded-full object-cover"
      />
      <h1 className="text-[22px] font-black tracking-wide text-[#2f5a45] md:text-[28px]">
        MANPOWER
      </h1>
    </div>
  );
}

function FooterLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Lumispire Logo"
        className="h-9 w-9 rounded-full object-cover"
      />
      <p className="text-2xl font-black tracking-wide text-white">LUMISPIRE</p>
    </div>
  );
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 10V8a4 4 0 1 1 8 0v2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 7h16v10H4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m5 8 7 6 7-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ManpowerEmployeeChangePassword() {
  const navigate = useNavigate();

  const [token, setToken] = useState(getEmployeeToken());
  const [employee, setEmployee] = useState(getEmployeeUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });

  const [otpState, setOtpState] = useState({
    loading: false,
    success: "",
    error: "",
  });

  const [passwordState, setPasswordState] = useState({
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

  function logout() {
    clearEmployeeSession();
    setToken("");
    setEmployee(null);
    navigate("/manpower-employee-login", { replace: true });
  }

  useEffect(() => {
    if (!token) {
      navigate("/manpower-employee-login", { replace: true });
      return;
    }

    let active = true;

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

        if (!active) return;

        const nextEmployee = data?.employee || null;
        setEmployee(nextEmployee);
        saveEmployeeSession(token, nextEmployee);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load employee profile.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [token, navigate]);

  function validateBeforeOtp() {
    const currentPassword = String(passwordForm.currentPassword || "");
    const newPassword = String(passwordForm.newPassword || "");
    const confirmPassword = String(passwordForm.confirmPassword || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return "Please complete current password, new password, and confirm password first.";
    }

    if (newPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }

    if (newPassword !== confirmPassword) {
      return "New password and confirm password do not match.";
    }

    return "";
  }

  async function sendOtp(e) {
    e.preventDefault();

    setOtpState({
      loading: false,
      success: "",
      error: "",
    });

    setPasswordState((prev) => ({
      ...prev,
      success: "",
      error: "",
    }));

    const validationError = validateBeforeOtp();

    if (validationError) {
      setOtpState({
        loading: false,
        success: "",
        error: validationError,
      });
      return;
    }

    setOtpState({
      loading: true,
      success: "",
      error: "",
    });

    try {
      const res = await fetch(
        `${API_BASE}/manpower/employee/change-password/request-otp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to send OTP.");
      }

      setOtpState({
        loading: false,
        success: data?.message || "OTP sent successfully.",
        error: "",
      });
    } catch (err) {
      setOtpState({
        loading: false,
        success: "",
        error: err?.message || "Failed to send OTP.",
      });
    }
  }

  async function changePassword(e) {
    e.preventDefault();

    setPasswordState({
      loading: false,
      success: "",
      error: "",
    });

    setOtpState((prev) => ({
      ...prev,
      error: "",
    }));

    const currentPassword = String(passwordForm.currentPassword || "");
    const newPassword = String(passwordForm.newPassword || "");
    const confirmPassword = String(passwordForm.confirmPassword || "");
    const otp = String(passwordForm.otp || "").trim();

    if (!currentPassword || !newPassword || !confirmPassword || !otp) {
      setPasswordState({
        loading: false,
        success: "",
        error: "Please complete all password fields and enter the OTP.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordState({
        loading: false,
        success: "",
        error: "New password must be at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordState({
        loading: false,
        success: "",
        error: "New password and confirm password do not match.",
      });
      return;
    }

    setPasswordState({
      loading: true,
      success: "",
      error: "",
    });

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          otp,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to change password.");
      }

      const updatedEmployee = {
        ...(employee || {}),
        mustChangePassword: false,
      };

      setEmployee(updatedEmployee);
      saveEmployeeSession(token, updatedEmployee);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        otp: "",
      });

      setOtpState({
        loading: false,
        success: "",
        error: "",
      });

      setPasswordState({
        loading: false,
        success: data?.message || "Password updated successfully.",
        error: "",
      });
    } catch (err) {
      setPasswordState({
        loading: false,
        success: "",
        error: err?.message || "Failed to change password.",
      });
    }
  }

  return (
    <div className="ltc-change-password-page" style={fontPontano}>
      <style>{pageStyles}</style>

      <header className="ltc-header">
        <div className="ltc-container ltc-nav">
          <button
            type="button"
            onClick={() => navigate("/manpower-employee-home")}
            className="ltc-logo"
            aria-label="Go to manpower employee home"
          >
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
              <h1 style={fontMontserrat}>LTC MANPOWER</h1>
              <p style={fontPontano}>Employee workforce portal.</p>
            </div>
          </button>

          <nav className="ltc-desktop-nav" style={fontPoppins}>
            <button
              type="button"
              onClick={() => navigate("/manpower-employee-home")}
              className="ltc-nav-link"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigate("/manpower-employee-payroll")}
              className="ltc-nav-link"
            >
              Payroll
            </button>
            <button
              type="button"
              onClick={() => navigate("/manpower-employee-leave")}
              className="ltc-nav-link"
            >
              Leave
            </button>
            <button
              type="button"
              onClick={() => navigate("/manpower-employee-profile")}
              className="ltc-nav-link ltc-profile-button"
            >
              Profile
            </button>
          </nav>
        </div>
      </header>

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
            <h2 className="ltc-hero-title" style={fontMontserrat}>
              Change <span>Password</span>
            </h2>
            <p className="ltc-hero-text" style={fontPontano}>
              Update your manpower employee account password using OTP verification.
            </p>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            {loading ? (
              <div className="ltc-form-shell">
                <div className="ltc-form-inner">
                  <div className="ltc-status ltc-status-info" style={fontPoppins}>
                    Loading employee account...
                  </div>
                </div>
              </div>
            ) : null}

            {!loading && error ? (
              <div className="ltc-form-shell">
                <div className="ltc-form-inner">
                  <div className="ltc-status ltc-status-error" style={fontPoppins}>
                    {error}
                  </div>
                </div>
              </div>
            ) : null}

            {!loading && !error ? (
              <section className="ltc-form-shell">
                <div className="ltc-form-inner">
                  <div className="ltc-form-header">
                    <div>
                      <h3 className="ltc-section-heading" style={fontMontserrat}>
                        Secure Account
                      </h3>
                      <div className="ltc-section-line" />
                      <p className="ltc-muted-text" style={fontPontano}>
                        Enter your current password, choose a new password, request an OTP, then verify it to complete the password change.
                      </p>
                    </div>
                  </div>

                  <div className="ltc-status ltc-status-info" style={fontPontano}>
                    <strong style={fontPoppins}>OTP will be sent to:</strong>{" "}
                    {employee?.personalEmail || employee?.companyEmail || "-"}
                  </div>

                  {otpState.error ? (
                    <div className="ltc-status ltc-status-error" style={fontPontano}>
                      {otpState.error}
                    </div>
                  ) : null}

                  {otpState.success ? (
                    <div className="ltc-status ltc-status-success" style={fontPontano}>
                      {otpState.success}
                    </div>
                  ) : null}

                  {passwordState.error ? (
                    <div className="ltc-status ltc-status-error" style={fontPontano}>
                      {passwordState.error}
                    </div>
                  ) : null}

                  {passwordState.success ? (
                    <div className="ltc-status ltc-status-success" style={fontPontano}>
                      {passwordState.success}
                    </div>
                  ) : null}

                  <form onSubmit={changePassword} className="ltc-form-grid">
                    <div className="ltc-field">
                      <label style={fontPoppins}>Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="ltc-input"
                        style={fontPontano}
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="ltc-field">
                      <label style={fontPoppins}>New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        className="ltc-input"
                        style={fontPontano}
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="ltc-field">
                      <label style={fontPoppins}>Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="ltc-input"
                        style={fontPontano}
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="ltc-field">
                      <label style={fontPoppins}>OTP Code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={passwordForm.otp}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                          }))
                        }
                        className="ltc-input"
                        style={fontPontano}
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>

                    <div className="ltc-actions">
                      <div className="ltc-actions-row">
                        <button
                          type="button"
                          onClick={sendOtp}
                          disabled={otpState.loading}
                          className="ltc-primary-button"
                          style={fontMontserrat}
                        >
                          {otpState.loading ? "Sending OTP..." : "Send OTP"}
                        </button>

                        <button
                          type="submit"
                          disabled={passwordState.loading}
                          className="ltc-secondary-button"
                          style={fontMontserrat}
                        >
                          {passwordState.loading ? "Updating..." : "Verify OTP & Update"}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate("/manpower-employee-profile")}
                        className="ltc-outline-button"
                        style={fontMontserrat}
                      >
                        Back to Profile
                      </button>
                    </div>
                  </form>

                  <p className="ltc-note" style={fontPontano}>
                    Keep your password private. Use at least 8 characters for your new manpower account password.
                  </p>
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </main>

      <footer className="ltc-footer">
        <div className="ltc-container">
          <p style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

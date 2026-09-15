// HotelAndRestaurant/HotelResetPassword.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGE = "/HotelLanding1.png";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

function getHotelApiBase() {
  const raw = (
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel`;
  if (raw.includes("/api/hotel")) return raw;

  return `${raw}/api/hotel`;
}

function getHotelToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
}

const API_BASE = getHotelApiBase();

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-reset-page {
    --green-950:#071f14;
    --green-900:#0e3321;
    --green-800:#174a30;
    --green-700:#235f3e;
    --footer-green:#082719;
    --gold:#d7a84d;
    --gold-soft:#f4d484;
    --dark:#101828;
    --muted:#667085;
    --glass:rgba(255,255,255,.84);
    --shadow-md:0 18px 45px rgba(8,39,25,.12);
    --shadow-lg:0 32px 80px rgba(8,39,25,.18);
    --radius:24px;
    --ease:cubic-bezier(.22,1,.36,1);

    min-height:100vh;
    color:var(--dark);
    background:
      radial-gradient(circle at 12% 0%,rgba(215,168,77,.12),transparent 28%),
      radial-gradient(circle at 92% 12%,rgba(35,95,62,.12),transparent 30%),
      linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%);
    line-height:1.65;
    letter-spacing:-.01em;
    overflow-x:hidden;
    font-family:"Inter",Arial,sans-serif;
  }

  .ltc-reset-page * { box-sizing:border-box; }

  .ltc-container {
    width:min(1180px,92%);
    margin:auto;
  }

  .ltc-header {
    position:sticky;
    top:0;
    z-index:50;
    width:100%;
    background:var(--footer-green);
    border-bottom:1px solid rgba(255,255,255,.1);
    box-shadow:0 10px 34px rgba(7,31,20,.14);
    margin:0;
  }

  .ltc-header .ltc-container {
    width:100%;
    max-width:none;
    margin:0;
    padding-left:32px;
    padding-right:32px;
  }

  .ltc-nav {
    min-height:76px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:24px;
  }

  .ltc-logo {
    display:flex;
    align-items:center;
    gap:13px;
    color:white;
    border:0;
    background:transparent;
    cursor:pointer;
    text-align:left;
    padding:0;
  }

  .ltc-logo-icon {
    width:42px;
    height:42px;
    border-radius:999px;
    background:white;
    object-fit:cover;
    box-shadow:0 0 0 5px rgba(255,255,255,.08),0 12px 24px rgba(0,0,0,.12);
  }

  .ltc-logo h1 {
    margin:0;
    font-size:18px;
    line-height:1;
    font-weight:900;
    text-transform:uppercase;
    letter-spacing:-.04em;
  }

  .ltc-logo p {
    margin:3px 0 0;
    color:rgba(255,255,255,.72);
    font-size:11px;
  }

  .ltc-desktop-nav {
    display:flex;
    align-items:center;
    gap:8px;
  }

  .ltc-nav-link {
    color:rgba(255,255,255,.78);
    font-size:12px;
    font-weight:800;
    letter-spacing:.08em;
    text-transform:uppercase;
    padding:10px 14px;
    border-radius:999px;
    transition:.25s var(--ease);
    border:0;
    background:transparent;
    cursor:pointer;
  }

  .ltc-nav-link:hover,
  .ltc-nav-link.active {
    color:white;
    background:rgba(255,255,255,.13);
    transform:translateY(-1px);
  }

  .ltc-profile-button {
    color:#102418;
    background:linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow:0 14px 28px rgba(215,168,77,.18);
  }

  .ltc-menu-button {
    display:none;
    color:white;
    border:0;
    background:rgba(255,255,255,.1);
    border-radius:12px;
    padding:10px;
    cursor:pointer;
  }

  .ltc-menu-button svg {
    width:24px;
    height:24px;
  }

  .ltc-hero {
    position:relative;
    overflow:hidden;
    color:white;
    isolation:isolate;
    background:linear-gradient(120deg,#03180f 0%,#082719 42%,#155f3b 100%);
    padding:82px 0 78px;
  }

  .ltc-hero-slide {
    position:absolute;
    inset:0;
    z-index:-4;
    width:100%;
    height:100%;
    object-fit:cover;
    opacity:.35;
  }

  .ltc-hero::before {
    content:"";
    position:absolute;
    inset:0;
    z-index:-3;
    background:linear-gradient(
      120deg,
      rgba(2,18,11,.96) 0%,
      rgba(5,37,23,.88) 42%,
      rgba(12,64,39,.76) 100%
    );
  }

  .ltc-hero::after {
    content:"";
    position:absolute;
    inset:-16% -10% -24% -10%;
    z-index:-2;
    background:
      radial-gradient(circle at 16% 82%,rgba(19,120,72,.36),transparent 24%),
      radial-gradient(circle at 36% 92%,rgba(7,76,47,.46),transparent 30%),
      radial-gradient(circle at 72% 18%,rgba(28,108,68,.28),transparent 30%),
      radial-gradient(circle at 88% 44%,rgba(244,212,132,.14),transparent 28%);
    filter:blur(30px);
    pointer-events:none;
  }

  .ltc-hero-content {
    position:relative;
    z-index:2;
    max-width:920px;
    margin:0 auto;
    text-align:center;
  }

  .ltc-eyebrow {
    display:inline-flex;
    color:var(--gold-soft);
    background:rgba(255,255,255,.12);
    border:1px solid rgba(255,255,255,.24);
    border-radius:999px;
    padding:12px 22px;
    font-size:12px;
    font-weight:900;
    letter-spacing:.22em;
    text-transform:uppercase;
    backdrop-filter:blur(8px);
  }

  .ltc-hero-title {
    margin:18px 0 0;
    color:white;
    font-size:clamp(36px,5vw,62px);
    line-height:1.05;
    font-weight:900;
    letter-spacing:-.055em;
    text-shadow:0 8px 26px rgba(0,0,0,.22);
  }

  .ltc-hero-title span { color:var(--gold-soft); }

  .ltc-hero-text {
    max-width:760px;
    margin:18px auto 0;
    color:rgba(255,255,255,.80);
    font-size:17px;
    line-height:1.8;
  }

  .ltc-section {
    padding:54px 0 84px;
  }

  .ltc-reset-shell {
    position:relative;
    overflow:hidden;
    width:min(760px,100%);
    margin:0 auto;
    border-radius:var(--radius);
    background:var(--glass);
    border:1px solid rgba(255,255,255,.76);
    box-shadow:var(--shadow-md);
    backdrop-filter:blur(18px);
    padding:34px;
  }

  .ltc-reset-shell::before {
    content:"";
    position:absolute;
    inset:0 0 auto;
    height:6px;
    background:linear-gradient(90deg,var(--green-700),var(--gold));
  }

  .ltc-reset-inner {
    position:relative;
    z-index:1;
  }

  .ltc-section-eyebrow {
    margin:0;
    color:var(--green-700);
    font-size:12px;
    font-weight:900;
    letter-spacing:.18em;
    text-transform:uppercase;
  }

  .ltc-section-heading {
    margin:8px 0 0;
    color:var(--green-950);
    font-size:clamp(28px,4vw,42px);
    line-height:1.08;
    letter-spacing:-.05em;
    font-weight:900;
  }

  .ltc-section-line {
    margin-top:14px;
    width:120px;
    height:3px;
    border-radius:999px;
    background:var(--green-700);
  }

  .ltc-muted-text {
    margin:14px 0 0;
    color:var(--muted);
    font-size:14px;
    line-height:1.75;
    font-weight:600;
  }

  .ltc-reset-form {
    margin-top:28px;
    display:grid;
    gap:18px;
  }

  .ltc-field label {
    display:block;
    margin:0 0 8px;
    color:var(--green-950);
    font-size:12px;
    font-weight:900;
    letter-spacing:.08em;
    text-transform:uppercase;
  }

  .ltc-input-wrap {
    position:relative;
  }

  .ltc-input {
    width:100%;
    min-height:54px;
    border-radius:18px;
    border:1px solid rgba(35,95,62,.16);
    background:rgba(255,255,255,.9);
    color:var(--dark);
    outline:none;
    padding:0 58px 0 18px;
    font-size:14px;
    font-family:inherit;
    font-weight:700;
    transition:.25s var(--ease);
    box-shadow:0 10px 24px rgba(8,39,25,.05);
  }

  .ltc-input:focus {
    border-color:var(--green-700);
    background:white;
    box-shadow:0 0 0 4px rgba(35,95,62,.10);
  }

  .ltc-input:disabled {
    cursor:not-allowed;
    opacity:.65;
  }

  .ltc-eye-button {
    position:absolute;
    right:9px;
    top:50%;
    transform:translateY(-50%);
    width:40px;
    height:40px;
    display:grid;
    place-items:center;
    border:0;
    border-radius:999px;
    background:rgba(35,95,62,.08);
    color:var(--green-800);
    cursor:pointer;
    transition:.22s var(--ease);
  }

  .ltc-eye-button:hover:not(:disabled) {
    background:rgba(215,168,77,.18);
    transform:translateY(-50%) scale(1.04);
  }

  .ltc-eye-button:disabled {
    cursor:not-allowed;
    opacity:.5;
  }

  .ltc-eye-button svg {
    width:20px;
    height:20px;
  }

  .ltc-status {
    border-radius:16px;
    border:1px solid transparent;
    padding:12px 14px;
    font-size:13px;
    line-height:1.55;
    font-weight:800;
  }

  .ltc-status-success {
    color:#047857;
    background:rgba(16,185,129,.10);
    border-color:rgba(16,185,129,.25);
  }

  .ltc-status-error {
    color:#b42318;
    background:rgba(239,68,68,.10);
    border-color:rgba(239,68,68,.22);
  }

  .ltc-actions {
    margin-top:4px;
    display:grid;
    gap:12px;
  }

  .ltc-primary-button,
  .ltc-secondary-button {
    min-height:52px;
    border-radius:999px;
    padding:0 28px;
    cursor:pointer;
    font-size:13px;
    font-weight:900;
    transition:all .28s var(--ease);
  }

  .ltc-primary-button {
    border:0;
    color:#102418;
    background:linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow:0 16px 35px rgba(215,168,77,.22);
  }

  .ltc-primary-button:hover:not(:disabled) {
    transform:translateY(-3px);
    background:linear-gradient(135deg,#f7dc93,#c99634);
    box-shadow:0 22px 45px rgba(215,168,77,.30);
  }

  .ltc-secondary-button {
    border:1px solid rgba(35,95,62,.18);
    color:var(--green-800);
    background:white;
    box-shadow:0 12px 28px rgba(8,39,25,.06);
  }

  .ltc-secondary-button:hover:not(:disabled) {
    transform:translateY(-3px);
    color:white;
    background:var(--green-800);
    border-color:var(--green-800);
  }

  .ltc-primary-button:disabled,
  .ltc-secondary-button:disabled {
    opacity:.6;
    cursor:not-allowed;
    transform:none;
    box-shadow:none;
  }

  .ltc-security-note {
    margin:4px 0 0;
    color:var(--muted);
    text-align:center;
    font-size:12px;
    line-height:1.6;
    font-weight:700;
  }

  .ltc-footer {
    width:100%;
    margin:0;
    padding:30px 0 12px;
    background:var(--footer-green);
    color:white;
  }

  .ltc-footer .ltc-container {
    width:100%;
    max-width:none;
    margin:0;
    padding-left:32px;
    padding-right:32px;
  }

  .ltc-footer-grid {
    width:100%;
    display:grid;
    grid-template-columns:1.1fr .75fr 1.1fr 1.1fr 1fr;
    gap:22px;
    padding-bottom:24px;
    border-bottom:1px solid rgba(255,255,255,.1);
  }

  .ltc-footer-brand {
    display:flex;
    align-items:center;
    gap:12px;
  }

  .ltc-footer-brand img {
    width:42px;
    height:42px;
    border-radius:999px;
    object-fit:cover;
  }

  .ltc-footer h4 {
    margin:0;
    color:white;
    font-size:20px;
    line-height:1.2;
    font-weight:900;
    text-transform:uppercase;
  }

  .ltc-footer h5 {
    margin:0 0 10px;
    color:#f4d484;
    font-size:12px;
    line-height:1.2;
    font-weight:900;
    text-transform:uppercase;
    letter-spacing:.14em;
  }

  .ltc-footer p,
  .ltc-footer-link {
    display:block;
    margin:5px 0;
    color:rgba(255,255,255,.68);
    font-size:13px;
    line-height:1.55;
  }

  .ltc-footer-small-text {
    margin:4px 0 !important;
    font-size:12px !important;
    line-height:1.42 !important;
  }

  .ltc-footer-small-text strong {
    font-size:12px !important;
    line-height:1.42 !important;
  }

  .ltc-footer-link {
    width:auto;
    min-height:0;
    border:0;
    padding:0;
    background:transparent;
    text-align:left;
    cursor:pointer;
  }

  .ltc-footer-link:hover,
  .ltc-footer-link:focus-visible {
    color:white;
    text-decoration:underline;
  }

  .ltc-facebook-link {
    width:34px;
    height:34px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    margin-top:6px;
    border:1px solid rgba(255,255,255,.16);
    border-radius:999px;
    background:rgba(255,255,255,.10);
    color:white;
    cursor:pointer;
    transition:.25s var(--ease);
  }

  .ltc-facebook-link:hover,
  .ltc-facebook-link:focus-visible {
    color:#f4d484;
    border-color:rgba(244,212,132,.42);
    background:rgba(244,212,132,.12);
    transform:translateY(-2px);
  }

  .ltc-facebook-link svg {
    width:18px;
    height:18px;
    fill:currentColor;
  }

  .ltc-copyright {
    width:100%;
    padding-top:14px;
    display:flex;
    justify-content:space-between;
    gap:12px;
    color:rgba(255,255,255,.52);
    font-size:12px;
    line-height:1.4;
  }

  .ltc-sidebar-overlay {
    position:fixed;
    inset:0;
    z-index:80;
    background:rgba(0,0,0,.42);
  }

  .ltc-sidebar-panel {
    position:absolute;
    right:0;
    top:0;
    height:100%;
    width:min(310px,86vw);
    background:white;
    box-shadow:-20px 0 60px rgba(0,0,0,.25);
    padding:20px;
  }

  .ltc-sidebar-top {
    display:flex;
    align-items:center;
    justify-content:space-between;
    border-bottom:1px solid rgba(16,24,40,.1);
    padding-bottom:16px;
    margin-bottom:16px;
  }

  .ltc-sidebar-title {
    color:var(--green-950);
    font-weight:900;
    letter-spacing:.14em;
    font-size:12px;
    margin:0;
  }

  .ltc-sidebar-close {
    width:38px;
    height:38px;
    border-radius:12px;
    border:0;
    background:#f2f4f7;
    color:#101828;
    cursor:pointer;
  }

  .ltc-sidebar-link {
    display:block;
    width:100%;
    border:0;
    background:transparent;
    color:#101828;
    text-align:left;
    border-radius:14px;
    padding:13px 14px;
    font-weight:800;
    margin-bottom:8px;
    cursor:pointer;
  }

  .ltc-sidebar-link:hover,
  .ltc-sidebar-link.active {
    background:var(--green-800);
    color:white;
  }

  @media (max-width:1100px) {
    .ltc-footer-grid {
      grid-template-columns:repeat(2,minmax(0,1fr));
    }
  }

  @media (max-width:900px) {
    .ltc-header .ltc-container {
      padding-left:22px;
      padding-right:22px;
    }

    .ltc-nav {
      min-height:auto;
      padding:18px 0;
    }

    .ltc-desktop-nav { display:none; }
    .ltc-menu-button { display:grid; place-items:center; }
    .ltc-hero { padding:76px 0 74px; }
    .ltc-section { padding:44px 0 64px; }
    .ltc-reset-shell { padding:28px 22px; }

    .ltc-footer {
      padding:28px 0 12px;
    }

    .ltc-footer-grid {
      grid-template-columns:1fr;
      gap:18px;
      padding-bottom:22px;
    }

    .ltc-footer .ltc-container {
      padding-left:22px;
      padding-right:22px;
    }

    .ltc-copyright {
      flex-direction:column;
    }
  }

  @media (max-width:600px) {
    .ltc-header .ltc-container,
    .ltc-footer .ltc-container {
      padding-left:16px;
      padding-right:16px;
    }

    .ltc-logo h1 { font-size:14px; }
    .ltc-logo p { font-size:10px; }

    .ltc-hero-title {
      font-size:clamp(34px,11vw,46px);
      letter-spacing:-.045em;
    }

    .ltc-hero-text { font-size:15px; }
    .ltc-reset-shell { padding:26px 18px; }
  }
`;

function EyeIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
      />
      <circle cx="12" cy="12" r="2.75" />
      {!open ? <path strokeLinecap="round" d="M4 20L20 4" /> : null}
    </svg>
  );
}

export default function HotelResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const validate = () => {
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (!token) return "Reset token is missing.";
    if (!cleanPassword) return "New password is required.";
    if (cleanPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }
    if (!cleanConfirmPassword) return "Confirm password is required.";
    if (cleanConfirmPassword !== cleanPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const clearError = () => {
    if (status.type === "error") {
      setStatus({ type: "", message: "" });
    }
  };

  const submit = async () => {
    setStatus({ type: "", message: "" });

    const validationMessage = validate();
    if (validationMessage) {
      setStatus({ type: "error", message: validationMessage });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/hotel-reset-password/${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token,
            password: password.trim(),
            newPassword: password.trim(),
            confirmPassword: confirmPassword.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to reset password.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: data.message || "Password reset successfully. Redirecting...",
      });

      window.setTimeout(() => {
        navigate("/hotel-login", { replace: true });
      }, 1200);
    } catch (error) {
      console.error("reset password error:", error);
      setStatus({
        type: "error",
        message: "Network error. Please check if the backend server is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  const goToProfile = () => {
    navigate(getHotelToken() ? "/hotel-profile" : "/hotel-login");
  };

  return (
    <div className="ltc-reset-page" style={fontPontano}>
      <style>{pageStyles}</style>

      <Header
        navigate={navigate}
        goToProfile={goToProfile}
        openMenu={() => setIsOpen(true)}
      />

      <main>
        <section className="ltc-hero">
          <img
            src={HERO_IMAGE}
            alt="Reset password background"
            className="ltc-hero-slide"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ltc-container ltc-hero-content">
            <span className="ltc-eyebrow" style={fontMontserrat}>
              Account Security
            </span>

            <h1 className="ltc-hero-title" style={fontMontserrat}>
              Reset <span>Password</span>
            </h1>

            <p className="ltc-hero-text" style={fontPontano}>
              Create a new password for your Hotel &amp; Resort account and continue booking securely.
            </p>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-reset-shell">
              <div className="ltc-reset-inner">
                <p className="ltc-section-eyebrow" style={fontMontserrat}>
                  Create a New Password
                </p>

                <h2 className="ltc-section-heading" style={fontMontserrat}>
                  Set your new password
                </h2>

                <div className="ltc-section-line" />

                <p className="ltc-muted-text" style={fontPoppins}>
                  Choose a strong password you have not used before. Use at least 8 characters for better security.
                </p>

                <form
                  className="ltc-reset-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!loading) submit();
                  }}
                >
                  <PasswordField
                    id="hotel-reset-password"
                    label="New Password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(value) => {
                      setPassword(value);
                      clearError();
                    }}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    disabled={loading}
                    show={showPw}
                    onToggle={() => setShowPw((value) => !value)}
                  />

                  <PasswordField
                    id="hotel-reset-confirm-password"
                    label="Confirm Password"
                    type={showCpw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(value) => {
                      setConfirmPassword(value);
                      clearError();
                    }}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    disabled={loading}
                    show={showCpw}
                    onToggle={() => setShowCpw((value) => !value)}
                  />

                  {status.message ? (
                    <div
                      id="hotel-reset-status"
                      role={status.type === "error" ? "alert" : "status"}
                      aria-live="polite"
                      className={`ltc-status ${
                        status.type === "success"
                          ? "ltc-status-success"
                          : "ltc-status-error"
                      }`}
                      style={fontPoppins}
                    >
                      {status.message}
                    </div>
                  ) : null}

                  <div className="ltc-actions">
                    <button
                      type="submit"
                      disabled={loading}
                      className="ltc-primary-button"
                      style={fontMontserrat}
                    >
                      {loading ? "Saving..." : "Save Password"}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/hotel-login", { replace: true })}
                      disabled={loading}
                      className="ltc-secondary-button"
                      style={fontMontserrat}
                    >
                      Back to Login
                    </button>
                  </div>

                  <p className="ltc-security-note" style={fontPoppins}>
                    For your security, this reset link may expire. If it no longer works, request a new password-reset email from the login page.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {isOpen ? (
        <MobileMenu
          onClose={() => setIsOpen(false)}
          navigate={navigate}
          goToProfile={goToProfile}
        />
      ) : null}
    </div>
  );
}

function PasswordField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  show,
  onToggle,
}) {
  return (
    <div className="ltc-field">
      <label htmlFor={id} style={fontMontserrat}>
        {label}
      </label>

      <div className="ltc-input-wrap">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="ltc-input"
          style={fontPoppins}
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="ltc-eye-button"
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-controls={id}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

function Header({ navigate, goToProfile, openMenu }) {
  const signedIn = getHotelToken();

  return (
    <header className="ltc-header">
      <div className="ltc-container ltc-nav">
        <button
          onClick={() => navigate("/home")}
          type="button"
          className="ltc-logo"
          aria-label="Go to home"
        >
          <img
            src={HOTEL_LOGO}
            alt="Hotel logo"
            className="ltc-logo-icon"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div>
            <h1 style={fontMontserrat}>Hotel &amp; Resort</h1>
            <p style={fontPontano}>
              Resort, venue, hotel, and events booking services.
            </p>
          </div>
        </button>

        <nav className="ltc-desktop-nav" style={fontPoppins}>
          <NavButton label="Home" onClick={() => navigate("/resort-venue")} />
          <NavButton label="Virtual Tour" onClick={() => navigate("/virtual-tour")} />
          <NavButton label="Contact" onClick={() => navigate("/hotel-contact-us")} />
          <NavButton label="FAQs" onClick={() => navigate("/hotel-faqs")} />
          <NavButton
            label={signedIn ? "Profile" : "Sign In"}
            onClick={goToProfile}
            className="ltc-profile-button"
          />
        </nav>

        <button
          onClick={openMenu}
          type="button"
          aria-label="Open menu"
          className="ltc-menu-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

function NavButton({ label, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ltc-nav-link ${className}`}
    >
      {label}
    </button>
  );
}

function Footer() {
  return (
    <footer className="ltc-footer">
      <div className="ltc-container ltc-footer-grid">
        <div>
          <div className="ltc-footer-brand">
            <img
              src={LUMISPIRE_LOGO}
              alt="Lumispire logo"
              width="42"
              height="42"
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <h4 style={fontMontserrat}>Lumispire</h4>
          </div>
        </div>

        <FooterColumn title="Menu">
          <FooterLink onClick={() => (window.location.href = "/resort-venue")}>
            Home
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/virtual-tour")}>
            Virtual Tour
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-contact-us")}>
            Contact
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-faqs")}>
            FAQs
          </FooterLink>
          <FooterLink
            onClick={() => {
              window.location.href = getHotelToken()
                ? "/hotel-profile"
                : "/hotel-login";
            }}
          >
            {getHotelToken() ? "Profile" : "Sign In"}
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Resort">
          <FooterText className="ltc-footer-small-text">
            <strong>Address:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">
            Ecotrend Subdivision San Nicolas, Bacoor Cavite
          </FooterText>
          <FooterText className="ltc-footer-small-text">
            <strong>Contact No.:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">+63 9953781962</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9064191405</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9338699988</FooterText>
        </FooterColumn>

        <FooterColumn title="Hotel">
          <FooterText className="ltc-footer-small-text">
            <strong>Address:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">
            2/F 5441 Currie Street, Palanan, Makati City
          </FooterText>
          <FooterText className="ltc-footer-small-text">
            <strong>Contact No.:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">+63 9064191405</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9338699988</FooterText>
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>recruitment@ltcmultiservices.com</FooterText>
          <FooterText>marketing@ltcmultiservices.com</FooterText>
          <FooterText>lorenzoeventandvenue@gmail.com</FooterText>
          <FacebookLink />
        </FooterColumn>
      </div>

      <div className="ltc-container ltc-copyright">
        <span style={fontPontano}>
          © 2026 LTC GROUP OF COMPANIES. All rights reserved.
        </span>
        <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
      </div>
    </footer>
  );
}

function FacebookLink() {
  return (
    <button
      type="button"
      className="ltc-facebook-link"
      aria-label="Open Facebook page"
      title="Facebook"
      onClick={() => {
        window.open(
          "https://www.facebook.com/4delorenzo?rdid=2DsYHS1ll77JUW6K&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18wf6uHcfv%2F#",
          "_blank",
          "noopener,noreferrer"
        );
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.9h2.77l-.44 2.91h-2.33V22c4.78-.76 8.45-4.92 8.45-9.94Z" />
      </svg>
    </button>
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

function FooterLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ltc-footer-link"
      style={fontPontano}
    >
      {children}
    </button>
  );
}

function FooterText({ children, className = "" }) {
  return (
    <p className={className} style={fontPontano}>
      {children}
    </p>
  );
}

function MobileMenu({ onClose, navigate, goToProfile }) {
  const signedIn = getHotelToken();

  return (
    <div className="ltc-sidebar-overlay">
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <div className="ltc-sidebar-panel">
        <div className="ltc-sidebar-top">
          <p className="ltc-sidebar-title" style={fontPoppins}>
            MENU
          </p>

          <button
            type="button"
            onClick={onClose}
            className="ltc-sidebar-close"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <MobileLink
          label="Home"
          onClick={() => {
            onClose();
            navigate("/resort-venue");
          }}
        />
        <MobileLink
          label="Virtual Tour"
          onClick={() => {
            onClose();
            navigate("/virtual-tour");
          }}
        />
        <MobileLink
          label="Contact"
          onClick={() => {
            onClose();
            navigate("/hotel-contact-us");
          }}
        />
        <MobileLink
          label="FAQs"
          onClick={() => {
            onClose();
            navigate("/hotel-faqs");
          }}
        />
        <MobileLink
          label={signedIn ? "Profile" : "Sign In"}
          onClick={() => {
            onClose();
            goToProfile();
          }}
          active
        />
      </div>
    </div>
  );
}

function MobileLink({ label, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ltc-sidebar-link ${active ? "active" : ""}`}
      style={fontPoppins}
    >
      {label}
    </button>
  );
}

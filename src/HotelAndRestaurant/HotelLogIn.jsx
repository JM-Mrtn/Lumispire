import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKGROUND_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];
const USERNAME_MIN_LENGTH = 5;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 20;

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

function getHotelToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
}

const HotelLogIn = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [bgIndex, setBgIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);


  const verificationStatus = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("verified") || "";
  }, []);

  const verificationNotice = useMemo(() => {
    if (!verificationStatus) return null;

    const notices = {
      success: {
        type: "success",
        title: "Email verified successfully.",
        message: "You can now sign in to your Lumispire Hotel & Resort account.",
      },
      "invalid-or-expired": {
        type: "error",
        title: "Verification link is invalid or already used.",
        message: "Please sign in if your email is already verified, or request a new verification email from sign up/login.",
      },
      expired: {
        type: "error",
        title: "Verification link expired.",
        message: "Please request a new verification email to continue.",
      },
      "missing-token": {
        type: "error",
        title: "Verification token is missing.",
        message: "Please open the latest verification email and try again.",
      },
      "server-error": {
        type: "error",
        title: "Verification could not be completed.",
        message: "Please try again in a moment.",
      },
    };

    return notices[verificationStatus] || null;
  }, [verificationStatus]);

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    if (raw.includes("/api/hotel")) return raw;
    if (raw.includes("/api/")) return raw;
    return `${raw}/api/hotel`;
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const validateUsername = (value) => {
    const clean = String(value || "").trim();

    if (!clean) return "Username is required.";
    if (clean.length < USERNAME_MIN_LENGTH) {
      return `Username must be at least ${USERNAME_MIN_LENGTH} characters.`;
    }
    if (clean.length > USERNAME_MAX_LENGTH) {
      return `Username must be max ${USERNAME_MAX_LENGTH} characters.`;
    }
    if (!/^[A-Za-z0-9]+$/.test(clean)) {
      return "Username must contain letters and numbers only.";
    }

    return "";
  };

  const validatePassword = (value) => {
    const clean = String(value || "");

    if (!clean) return "Password is required.";
    if (clean.length < PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    }
    if (clean.length > PASSWORD_MAX_LENGTH) {
      return `Password must be max ${PASSWORD_MAX_LENGTH} characters.`;
    }

    return "";
  };

  const runValidation = () => {
    const next = {
      username: validateUsername(username),
      password: validatePassword(password),
    };

    setErrors(next);
    return next;
  };

  const fieldError = (key) => (touched[key] ? errors[key] : "");

  const setUsernameField = (value) => {
    const clean = value.replace(/[^A-Za-z0-9]/g, "").slice(0, USERNAME_MAX_LENGTH);

    setUsername(clean);
    setTouched((prev) => ({ ...prev, username: true }));
    setErrorMessage("");
  };

  const setPasswordField = (value) => {
    setPassword(value.slice(0, PASSWORD_MAX_LENGTH));
    setErrorMessage("");

    setErrors((prev) => ({
      ...prev,
      password: "",
    }));
  };

  useEffect(() => {
    if (!touched.username) return;

    setErrors((prev) => ({
      ...prev,
      username: validateUsername(username),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, touched.username]);

  const handleLogin = async () => {
    setErrorMessage("");
    setTouched({ username: true, password: true });

    const validation = runValidation();
    const hasValidationError = Object.values(validation).some(Boolean);

    if (hasValidationError || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/hotel-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        localStorage.setItem("token", data.token);

        if (data.user) {
          localStorage.setItem("hotelUser", JSON.stringify(data.user));
        }

        navigate("/resort-venue");
      } else {
        setErrorMessage(data.message || "There was an error logging in.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToSignUp = () => navigate("/hotel-signup");
  const goToHome = () => navigate("/resort-venue");
  const goToContact = () => navigate("/hotel-contact-us");
  const goToForgotPassword = () => navigate("/hotel-forgot-password");

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

  const CrownLogo = () => (
    <button type="button" onClick={() => navigate("/resort-venue")} className="ltc-logo" aria-label="Go to hotel home">
      <img
        src="/HotelLogo.png"
        alt="Hotel logo"
        className="ltc-logo-icon"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      <div>
        <h1 style={fontMontserrat}>Hotel &amp; Resort</h1>
        <p style={fontPontano}>Resort, venue, hotel, and events booking services.</p>
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

        .ltc-menu-button svg {
          width: 24px;
          height: 24px;
        }

        .ltc-sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
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
          margin: 0;
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
        }

        .ltc-sidebar-link:hover,
        .ltc-sidebar-link.active {
          background: var(--green-800);
          color: white;
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
          margin-top: 30px;
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.10);
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 45px rgba(0,0,0,.14);
        }

        .ltc-location-icon {
          width: 28px;
          height: 28px;
          color: var(--gold-soft);
          flex: 0 0 auto;
        }

        .ltc-location-box h3 {
          margin: 0;
          color: white;
          font-size: 20px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -.035em;
        }

        .ltc-location-box p {
          margin: 3px 0 0;
          color: rgba(255,255,255,.72);
          font-size: 13px;
          line-height: 1.35;
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

        .ltc-status-alert {
          margin-top: 20px;
          border-radius: 18px;
          padding: 14px 16px;
          text-align: left;
          font-size: 13px;
          line-height: 1.45;
          font-weight: 700;
        }

        .ltc-status-alert strong {
          display: block;
          margin-bottom: 4px;
          font-size: 13px;
          line-height: 1.35;
        }

        .ltc-status-alert span {
          display: block;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.5;
        }

        .ltc-status-alert.success {
          border: 1px solid rgba(35,95,62,.22);
          background: rgba(35,95,62,.10);
          color: #174a30;
        }

        .ltc-status-alert.error {
          border: 1px solid rgba(239,68,68,.22);
          background: rgba(239,68,68,.10);
          color: #b42318;
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

        .ltc-input.error {
          border-color: rgba(239,68,68,.55);
          box-shadow: 0 0 0 4px rgba(239,68,68,.08);
        }

        .ltc-field-error {
          margin: 0;
          padding: 0 16px;
          color: #b42318;
          font-size: 11px;
          line-height: 1.4;
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

        .ltc-auth-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 4px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.5;
          text-align: center;
        }

        .ltc-auth-links button {
          border: 0;
          background: transparent;
          color: var(--green-800);
          font-weight: 900;
          cursor: pointer;
          padding: 0;
          transition: .25s var(--ease);
        }

        .ltc-auth-links button:hover {
          color: var(--green-950);
          text-decoration: underline;
          text-underline-offset: 4px;
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
          grid-template-columns: 1.1fr .75fr 1.1fr 1.1fr 1fr;
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

        .ltc-footer-small-text {
          font-size: 12px !important;
          line-height: 1.42 !important;
          margin: 4px 0 !important;
        }

        .ltc-footer-small-text strong {
          font-size: 12px !important;
          line-height: 1.42 !important;
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

        .ltc-facebook-link {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 999px;
          background: rgba(255,255,255,.10);
          color: white;
          cursor: pointer;
          transition: .25s var(--ease);
          margin-top: 6px;
        }

        .ltc-facebook-link:hover {
          color: #f4d484;
          border-color: rgba(244,212,132,.42);
          background: rgba(244,212,132,.12);
          transform: translateY(-2px);
        }

        .ltc-facebook-link svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
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

          .ltc-footer {
            padding: 28px 0 12px;
          }

          .ltc-footer-grid {
            grid-template-columns: 1fr;
            gap: 18px;
            padding-bottom: 22px;
          }

          .ltc-footer .ltc-container {
            padding-left: 22px;
            padding-right: 22px;
          }

          .ltc-copyright {
            flex-direction: column;
          }
        }

        @media (max-width: 600px) {
          .ltc-header .ltc-container,
          .ltc-footer .ltc-container {
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
            display: none;
          }

          .ltc-menu-button {
            display: grid;
            place-items: center;
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
            justify-content: center;
            text-align: left;
          }

          .ltc-login-card {
            padding: 28px 20px;
          }

          .ltc-card-title h1 {
            font-size: 34px;
          }

          .ltc-auth-links {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="ltc-login-shell">
        {BACKGROUND_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`ltc-login-bg ${bgIndex === index ? "active" : ""}`}
            style={{
              backgroundImage: `url('${image}')`,
            }}
          />
        ))}

        <header className="ltc-header">
          <div className="ltc-container ltc-nav">
            <CrownLogo />

            <nav className="ltc-desktop-nav" style={fontPoppins}>
              <button type="button" onClick={goToHome} className="ltc-nav-link">
                HOME
              </button>

              <button
                type="button"
                onClick={() => navigate("/virtual-tour")}
                className="ltc-nav-link"
              >
                VIRTUAL TOUR
              </button>

              <button type="button" onClick={goToContact} className="ltc-nav-link">
                CONTACT
              </button>

              <button
                type="button"
                onClick={() => navigate("/hotel-faqs")}
                className="ltc-nav-link"
              >
                FAQS
              </button>

              <button
                type="button"
                onClick={() => navigate(getHotelToken() ? "/hotel-profile" : "/hotel-login")}
                className="ltc-nav-link ltc-profile-button"
              >
                {getHotelToken() ? "PROFILE" : "SIGN IN"}
              </button>
            </nav>

            <button
              onClick={() => setIsOpen(true)}
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <main className="ltc-container ltc-login-main">
          <section className="ltc-login-copy">
            <div className="eyebrow" style={fontMontserrat}>
              WELCOME TO
            </div>

            <h2 style={fontMontserrat}>
              Patio de <span>Lorenzo</span>
            </h2>

            <p style={fontPontano}>
              Sign in to continue your resort, venue, hotel, condo, and event package booking
              experience.
            </p>

            <div className="ltc-location-box">
              <PinIcon />

              <div>
                <h3 style={fontMontserrat}>Bacoor, Cavite</h3>
                <p style={fontPoppins}>Eco Trend Subdivision</p>
              </div>
            </div>

            <div className="ltc-location-box">
              <PinIcon />

              <div>
                <h3 style={fontMontserrat}>Palanan, Makati</h3>
                <p style={fontPoppins}>Building II, Curie Street</p>
              </div>
            </div>
          </section>

          <section className="ltc-login-card">
            <div className="ltc-card-title">
              <p style={fontMontserrat}>Hotel & Resort Account</p>
              <h1 style={fontMontserrat}>
                 <span></span>
              </h1>
            </div>

            {errorMessage ? (
              <div className="ltc-error-alert" style={fontPoppins}>
                {errorMessage}
              </div>
            ) : null}

            {verificationNotice ? (
              <div className={`ltc-status-alert ${verificationNotice.type}`} style={fontPoppins}>
                <strong>{verificationNotice.title}</strong>
                <span>{verificationNotice.message}</span>
              </div>
            ) : null}

            <form
              className="ltc-login-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className="ltc-field-wrap">
                <div className="ltc-input-shell">
                  <span className="ltc-input-icon">
                    <UserIcon />
                  </span>

                  <input
                    type="text"
                    maxLength={USERNAME_MAX_LENGTH}
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsernameField(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
                    autoComplete="username"
                    aria-invalid={fieldError("username") ? "true" : "false"}
                    className={`ltc-input ${fieldError("username") ? "error" : ""}`}
                    style={fontPoppins}
                  />
                </div>

                {fieldError("username") ? (
                  <p className="ltc-field-error" style={fontPoppins}>
                    {fieldError("username")}
                  </p>
                ) : null}
              </div>

              <div className="ltc-field-wrap">
                <div className="ltc-input-shell">
                  <span className="ltc-input-icon">
                    <LockIcon />
                  </span>

                  <input
                    type={showPw ? "text" : "password"}
                    maxLength={PASSWORD_MAX_LENGTH}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPasswordField(e.target.value)}
                    onBlur={() => {}}
                    autoComplete="current-password"
                    aria-invalid={fieldError("password") ? "true" : "false"}
                    className={`ltc-input has-eye ${fieldError("password") ? "error" : ""}`}
                    style={fontPoppins}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="ltc-eye-button"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>

                {fieldError("password") ? (
                  <p className="ltc-field-error" style={fontPoppins}>
                    {fieldError("password")}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="ltc-submit-button"
                style={fontMontserrat}
              >
                {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
              </button>

              <div className="ltc-auth-links" style={fontPoppins}>
                <button type="button" onClick={goToForgotPassword}>
                  Forget Password?
                </button>

                <span>|</span>

                <button type="button" onClick={goToSignUp}>
                  Create Account
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>

      {isOpen ? (
        <MobileMenu
          onClose={() => setIsOpen(false)}
          navigate={navigate}
          goToProfile={() => navigate(getHotelToken() ? "/hotel-profile" : "/hotel-login")}
        />
      ) : null}

      <Footer />
    </div>
  );
};

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
            onClick={onClose}
            className="ltc-sidebar-close"
            aria-label="Close menu"
            type="button"
          >
            ✕
          </button>
        </div>

        <MenuItem
          label="HOME"
          onClick={() => {
            onClose();
            navigate("/resort-venue");
          }}
        />

        <MenuItem
          label="VIRTUAL TOUR"
          onClick={() => {
            onClose();
            navigate("/virtual-tour");
          }}
        />

        <MenuItem
          label="CONTACT"
          onClick={() => {
            onClose();
            navigate("/hotel-contact-us");
          }}
        />

        <MenuItem
          label="FAQS"
          onClick={() => {
            onClose();
            navigate("/hotel-faqs");
          }}
        />

        <MenuItem
          label={signedIn ? "PROFILE" : "SIGN IN"}
          active={!signedIn}
          onClick={() => {
            onClose();
            goToProfile();
          }}
        />
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`ltc-sidebar-link ${active ? "active" : ""}`}
      style={fontPoppins}
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
              src="/HotelLumispireLogo.png"
              alt="Lumispire logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <h4 style={fontMontserrat}>Lumispire</h4>
          </div>
        </div>

        <FooterColumn title="Menu">
          <FooterLink onClick={() => (window.location.href = "/resort-venue")}>Home</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/virtual-tour")}>
            Virtual Tour
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-contact-us")}>
            Contact
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-faqs")}>FAQs</FooterLink>
          <FooterLink
            onClick={() => {
              window.location.href =
                localStorage.getItem("token") || localStorage.getItem("hotelToken")
                  ? "/hotel-profile"
                  : "/hotel-login";
            }}
          >
            {localStorage.getItem("token") || localStorage.getItem("hotelToken")
              ? "Profile"
              : "Sign In"}
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
        <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
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
    <button onClick={onClick} type="button" className="ltc-footer-link" style={fontPontano}>
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

export default HotelLogIn;
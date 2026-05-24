// src/TrainingAndAssessment/TraineeForgotPassword.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const TAMSI_LOGO = "/TamsiLogo.png";
const HERO_IMAGES = ["/TrainingLanding1.png", "/TrainingLanding2.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return r + "/api";
}

function getTrainingToken() {
  return localStorage.getItem("traineeToken") || localStorage.getItem("trainingToken") || localStorage.getItem("token") || "";
}

const RevealOnScroll = ({ children, className = "", delay = 0, y = 18 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0px)" : `translateY(${y}px)`,
        transition: "opacity 650ms ease, transform 650ms ease",
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
};

const TraineeForgotPassword = () => {
  const navigate = useNavigate();

  const API_BASE = useMemo(
    () =>
      normalizeApiBase(
        import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
      ),
    []
  );

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [step, setStep] = useState("FORM");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [cooldown, setCooldown] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => {
      setCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const validateForm = () => {
    if (!email.trim()) return "Trainee email is required.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid trainee email.";
    if (!newPassword) return "New password is required.";
    if (newPassword.length < 6 || newPassword.length > 20) {
      return "Password must be 6–20 characters.";
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
      return "Must include uppercase and lowercase letters.";
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return "Must contain at least 1 symbol.";
    }
    if (!confirmPassword) return "Confirm password is required.";
    if (confirmPassword !== newPassword) return "Passwords do not match.";
    return "";
  };

  const validateOtp = () => {
    const code = otp.trim();
    if (!code) return "OTP is required.";
    if (!/^\d{6}$/.test(code)) return "OTP must be 6 digits.";
    return "";
  };

  const sendOtp = async () => {
    setStatus({ type: "", message: "" });

    const msg = validateForm();
    if (msg) {
      setStatus({ type: "error", message: msg });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/training/forgot-password/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setCooldown(Number(data.retryAfterSeconds || 60));
        setStatus({
          type: "error",
          message: data.message || "Please wait before requesting OTP again.",
        });
        return;
      }

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to send OTP.",
        });
        return;
      }

      setStep("OTP");
      setCooldown(Number(data.cooldownSeconds || 60));
      setStatus({
        type: "success",
        message: data.message || "OTP sent to your email.",
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const resendOtp = async () => {
    setStatus({ type: "", message: "" });

    if (!email.trim()) {
      setStatus({ type: "error", message: "Trainee email is required." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/training/forgot-password/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setCooldown(Number(data.retryAfterSeconds || 60));
        setStatus({
          type: "error",
          message: data.message || "Please wait before resending OTP.",
        });
        return;
      }

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to resend OTP.",
        });
        return;
      }

      setCooldown(Number(data.cooldownSeconds || 60));
      setStatus({
        type: "success",
        message: data.message || "OTP resent to your email.",
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Network error while resending OTP.",
      });
    } finally {
      setSaving(false);
    }
  };

  const verifyOtpAndSave = async () => {
    setStatus({ type: "", message: "" });

    const msg1 = validateForm();
    if (msg1) {
      setStatus({ type: "error", message: msg1 });
      return;
    }

    const msg2 = validateOtp();
    if (msg2) {
      setStatus({ type: "error", message: msg2 });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/training/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.message || "OTP verification failed.";
        setStatus({ type: "error", message });

        if (String(message).toLowerCase().includes("no otp request")) {
          setStep("FORM");
          setOtp("");
        }
        return;
      }

      setStatus({
        type: "success",
        message: data.message || "Password reset successfully.",
      });

      setTimeout(() => navigate("/trainee-login"), 700);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Network error while verifying OTP.",
      });
    } finally {
      setSaving(false);
    }
  };

  const statusClass =
    status.type === "success"
      ? "ltc-status-success"
      : status.type === "error"
      ? "ltc-status-error"
      : "";

  const fmt = (s) => String(s).padStart(2, "0");
  const mmss = `${fmt(Math.floor(cooldown / 60))}:${fmt(cooldown % 60)}`;

  const goToProfile = () => {
    navigate(getTrainingToken() ? "/training-profile" : "/trainee-login");
  };

  return (
    <div className="ltc-forgot-page" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .ltc-forgot-page {
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

        .ltc-forgot-page * {
          box-sizing: border-box;
        }

        .ltc-container {
          width: min(1180px, 92%);
          margin: auto;
        }

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

        .ltc-hero {
          position: relative;
          overflow: hidden;
          color: white;
          isolation: isolate;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
          padding: 92px 0 88px;
        }

        .ltc-hero-slide {
          position: absolute;
          inset: 0;
          z-index: -4;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 1000ms ease;
        }

        .ltc-hero-slide.active {
          opacity: 1;
        }

        .ltc-hero::before {
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

        .ltc-hero::after {
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

        .ltc-hero-content {
          position: relative;
          z-index: 2;
          max-width: 920px;
          margin: 0 auto;
          text-align: center;
        }

        .ltc-hero h2 {
          margin: 0;
          color: white;
          font-size: clamp(36px, 5vw, 62px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.055em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .ltc-hero h2 span {
          color: var(--gold-soft);
        }

        .ltc-hero p {
          max-width: 760px;
          margin: 18px auto 0;
          color: rgba(255,255,255,.80);
          font-size: 17px;
          line-height: 1.8;
        }

        .ltc-section {
          padding: 84px 0;
        }

        .ltc-section-title {
          text-align: center;
          margin-bottom: 42px;
        }

        .ltc-section-title span {
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .ltc-section-title h3 {
          margin: 10px 0 0;
          color: var(--green-950);
          font-size: clamp(32px,4vw,50px);
          line-height: 1.08;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .ltc-section-title p {
          max-width: 760px;
          margin: 15px auto 0;
          color: var(--muted);
        }

        .ltc-forgot-wrapper {
          max-width: 760px;
          margin: 0 auto;
        }

        .ltc-forgot-card {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(18px);
          padding: 44px;
          transition: .38s var(--ease);
        }

        .ltc-forgot-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          z-index: 3;
        }

        .ltc-forgot-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(215,168,77,.45);
        }

        .ltc-forgot-illustration {
          width: 130px;
          height: 130px;
          margin: 0 auto 24px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(35,95,62,.08);
          border: 1px solid rgba(35,95,62,.10);
          box-shadow: 0 18px 40px rgba(8,39,25,.08);
          overflow: hidden;
        }

        .ltc-forgot-illustration img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ltc-forgot-illustration svg {
          width: 54px;
          height: 54px;
          color: var(--green-800);
        }

        .ltc-forgot-title {
          margin: 0;
          text-align: center;
          color: var(--green-950);
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.08;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .ltc-forgot-title span {
          color: var(--gold);
        }

        .ltc-forgot-subtitle {
          margin: 14px auto 0;
          max-width: 560px;
          text-align: center;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.8;
        }

        .ltc-forgot-form {
          margin: 34px auto 0;
          max-width: 560px;
          display: grid;
          gap: 16px;
        }

        .ltc-field {
          display: grid;
          gap: 8px;
        }

        .ltc-field label {
          color: var(--green-950);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .ltc-input-shell {
          position: relative;
        }

        .ltc-input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          width: 21px;
          height: 21px;
          color: var(--green-800);
          pointer-events: none;
        }

        .ltc-email-input {
          width: 100%;
          height: 54px;
          border: 1px solid rgba(35,95,62,.16);
          background: rgba(255,255,255,.86);
          color: var(--dark);
          outline: none;
          font-size: 14px;
          font-family: inherit;
          border-radius: 999px;
          padding: 0 18px 0 52px;
          transition: .25s var(--ease);
          box-shadow: 0 10px 24px rgba(8,39,25,.05);
        }

        .ltc-email-input::placeholder {
          color: rgba(102,112,133,.72);
        }

        .ltc-email-input:focus {
          border-color: var(--green-700);
          background: white;
          box-shadow: 0 0 0 4px rgba(35,95,62,.10);
        }

        .ltc-email-input:disabled {
          cursor: not-allowed;
          opacity: .7;
        }

        .ltc-status {
          border-radius: 16px;
          border: 1px solid transparent;
          padding: 12px 14px;
          text-align: center;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 800;
        }

        .ltc-status-success {
          color: #047857;
          background: rgba(16,185,129,.10);
          border-color: rgba(16,185,129,.25);
        }

        .ltc-status-error {
          color: #b42318;
          background: rgba(239,68,68,.10);
          border-color: rgba(239,68,68,.22);
        }

        .ltc-submit-button {
          margin-top: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
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
          opacity: .65;
          transform: none;
        }

        .ltc-back-button {
          margin: 4px auto 0;
          display: inline-flex;
          justify-content: center;
          width: fit-content;
          border: 0;
          background: transparent;
          color: var(--green-800);
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          transition: .25s var(--ease);
        }

        .ltc-back-button:hover {
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

        @media (max-width: 1100px) {
          .ltc-footer-grid {
            grid-template-columns: 1fr;
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

          .ltc-desktop-nav {
            display: none;
          }

          .ltc-menu-button {
            display: grid;
            place-items: center;
          }

          .ltc-footer {
            padding: 28px 0 12px;
          }

          .ltc-footer-grid {
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

          .ltc-hero {
            padding: 76px 0 74px;
          }

          .ltc-hero h2 {
            font-size: clamp(34px, 11vw, 46px);
            letter-spacing: -.045em;
          }

          .ltc-hero p {
            font-size: 15px;
          }

          .ltc-section {
            padding: 64px 0;
          }

          .ltc-forgot-card {
            padding: 32px 20px;
          }

          .ltc-forgot-illustration {
            width: 112px;
            height: 112px;
          }
        }
      

        .ltc-password-shell {
          position: relative;
        }

        .ltc-password-shell .ltc-email-input {
          padding-right: 56px;
        }

        .ltc-password-toggle {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 0;
          background: rgba(8,39,25,.07);
          color: var(--green-800);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: .25s var(--ease);
        }

        .ltc-password-toggle:hover {
          background: rgba(215,168,77,.2);
          transform: translateY(-50%) scale(1.04);
        }

        .ltc-form-grid {
          display: grid;
          gap: 18px;
        }

        .ltc-help-text {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          text-align: center;
          line-height: 1.6;
        }

        .ltc-secondary-button {
          width: 100%;
          min-height: 52px;
          border-radius: 999px;
          border: 1px solid rgba(8,39,25,.12);
          background: rgba(8,39,25,.08);
          color: var(--green-900);
          font-size: 13px;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: .25s var(--ease);
        }

        .ltc-secondary-button:hover {
          background: rgba(8,39,25,.12);
          transform: translateY(-2px);
        }

        .ltc-secondary-button:disabled {
          opacity: .6;
          cursor: not-allowed;
          transform: none;
        }

        .ltc-otp-actions {
          display: grid;
          gap: 12px;
        }
`}</style>

      <Header navigate={navigate} goToProfile={goToProfile} openMenu={() => setIsOpen(true)} />

      <main>
        <section className="ltc-hero">
          {HERO_IMAGES.map((image, index) => (
            <img
              key={image}
              src={image}
              alt="Training and assessment background"
              className={`ltc-hero-slide ${heroIndex === index ? "active" : ""}`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ))}

          <div className="ltc-container ltc-hero-content">
            <RevealOnScroll>
              <h2 style={fontMontserrat}>
                Forget <span>Password?</span>
              </h2>

              <p style={fontPontano}>
                Reset your trainee account password securely with OTP verification.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <RevealOnScroll className="ltc-section-title">
              <span>Account Recovery</span>
              <h3 style={fontMontserrat}>Reset your trainee account password</h3>
              <p style={fontPontano}>
                Enter your registered trainee email and create a new password, then verify the OTP sent to your inbox.
              </p>
            </RevealOnScroll>

            <div className="ltc-forgot-wrapper">
              <RevealOnScroll className="ltc-forgot-card">
                <div className="ltc-forgot-illustration">
                  <img
                    src="/ForgetPasswordBG.jpg"
                    alt="Forget password"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>

                <h1 className="ltc-forgot-title" style={fontMontserrat}>
                  Forget <span>Password?</span>
                </h1>

                <p className="ltc-forgot-subtitle" style={fontPontano}>
                  Fill in your account details below and complete the OTP verification to reset your password.
                </p>

                <div className="ltc-forgot-form ltc-form-grid">
                  <div className="ltc-field">
                    <label style={fontMontserrat}>Trainee Email</label>
                    <div className="ltc-input-shell">
                      <svg className="ltc-input-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z" />
                      </svg>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="ltc-email-input"
                        placeholder="Enter your trainee email"
                        autoComplete="email"
                        disabled={step === "OTP"}
                        style={fontPoppins}
                      />
                    </div>
                  </div>

                  <div className="ltc-field">
                    <label style={fontMontserrat}>New Password</label>
                    <div className="ltc-input-shell ltc-password-shell">
                      <svg className="ltc-input-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 0 1 6 0v3H9Z" />
                      </svg>
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value.slice(0, 20))}
                        className="ltc-email-input"
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        style={fontPoppins}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="ltc-password-toggle"
                        aria-label={showNew ? "Hide new password" : "Show new password"}
                      >
                        {showNew ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>

                  <div className="ltc-field">
                    <label style={fontMontserrat}>Confirm Password</label>
                    <div className="ltc-input-shell ltc-password-shell">
                      <svg className="ltc-input-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 0 1 6 0v3H9Z" />
                      </svg>
                      <input
                        type={showCpw ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value.slice(0, 20))}
                        className="ltc-email-input"
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        style={fontPoppins}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCpw((v) => !v)}
                        className="ltc-password-toggle"
                        aria-label={showCpw ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showCpw ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>

                  {step === "OTP" ? (
                    <div className="ltc-field">
                      <label style={fontMontserrat}>Enter OTP (6 digits)</label>
                      <div className="ltc-input-shell">
                        <svg className="ltc-input-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2 3v2h6V5H9Zm3 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                        </svg>
                        <input
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className="ltc-email-input"
                          placeholder="123456"
                          inputMode="numeric"
                          style={fontPoppins}
                        />
                      </div>
                    </div>
                  ) : null}

                  {status.message ? (
                    <div className={`ltc-status ${statusClass}`} style={fontPoppins}>
                      {status.message}
                    </div>
                  ) : null}

                  {step === "FORM" ? (
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={saving}
                      className="ltc-submit-button"
                      style={fontMontserrat}
                    >
                      {saving ? "SENDING..." : "Send OTP"}
                    </button>
                  ) : (
                    <div className="ltc-otp-actions">
                      <button
                        type="button"
                        onClick={verifyOtpAndSave}
                        disabled={saving}
                        className="ltc-submit-button"
                        style={fontMontserrat}
                      >
                        {saving ? "VERIFYING..." : "Verify OTP & Reset Password"}
                      </button>

                      <button
                        type="button"
                        onClick={resendOtp}
                        disabled={saving || cooldown > 0}
                        className="ltc-secondary-button"
                        style={fontMontserrat}
                      >
                        {cooldown > 0 ? `Resend OTP (${mmss})` : "Resend OTP"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStep("FORM");
                          setOtp("");
                          setStatus({ type: "", message: "" });
                        }}
                        disabled={saving}
                        className="ltc-back-button"
                        style={fontPoppins}
                      >
                        Back to Form
                      </button>
                    </div>
                  )}

                  <p className="ltc-help-text" style={fontPontano}>
                    OTP expires in 10 minutes. Password must include uppercase, lowercase, and at least 1 symbol.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/trainee-login")}
                    className="ltc-back-button"
                    style={fontPoppins}
                  >
                    Back to Login
                  </button>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      {isOpen ? (
        <MobileMenu onClose={() => setIsOpen(false)} navigate={navigate} goToProfile={goToProfile} />
      ) : null}
    </div>
  );
};

function Header({ navigate, goToProfile, openMenu }) {
  const signedIn = getTrainingToken();

  return (
    <header className="ltc-header">
      <div className="ltc-container ltc-nav">
        <button
          onClick={() => navigate("/training")}
          type="button"
          className="ltc-logo"
          aria-label="Go to training home"
        >
          <img
            src={TAMSI_LOGO}
            alt="TAMSI logo"
            className="ltc-logo-icon"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div>
            <h1 style={fontMontserrat}>TAMSI</h1>
            <p style={fontPontano}>Training and assessment management services.</p>
          </div>
        </button>

        <nav className="ltc-desktop-nav" style={fontPoppins}>
          <NavButton label="Home" onClick={() => navigate("/training")} />
          <NavButton label="Course" onClick={() => navigate("/training-course")} />
          <NavButton label="Requirements" onClick={() => navigate("/training-requirements")} />
          <NavButton label="Contact" onClick={() => navigate("/training-contact-us")} />
          <NavButton label="FAQs" onClick={() => navigate("/training-faqs")} />
          <NavButton
            label={signedIn ? "Profile" : "Sign In"}
            onClick={goToProfile}
            className="ltc-profile-button"
          />
        </nav>

        <button onClick={openMenu} type="button" aria-label="Open menu" className="ltc-menu-button">
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
  );
}

function NavButton({ label, onClick, active = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`ltc-nav-link ${active ? "active" : ""} ${className}`}
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
              src={TAMSI_LOGO}
              alt="Lumispire logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <h4 style={fontMontserrat}>Lumispire</h4>
          </div>
        </div>

        <FooterColumn title="Menu">
          <FooterLink onClick={() => (window.location.href = "/training")}>Home</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/training-course")}>Course</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/training-requirements")}>Requirements</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/training-contact-us")}>Contact</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/training-faqs")}>FAQs</FooterLink>
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>ltc.tamsi@gmail.com</FooterText>
          <FooterText>lorengladius@ltcmultiservices.com</FooterText>
          <FooterText>0995906805 / 09516281271</FooterText>
        </FooterColumn>

        <FooterColumn title="Address">
          <FooterText>2/F 5441 Currie Street,</FooterText>
          <FooterText>Palanan, Makati City</FooterText>
        </FooterColumn>

        <FooterColumn title="Follow Us">
          <div className="ltc-socials">
            <span />
            <span />
            <span />
          </div>
        </FooterColumn>
      </div>

      <div className="ltc-container ltc-copyright">
        <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
        <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
      </div>
    </footer>
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

function FooterText({ children }) {
  return <p style={fontPontano}>{children}</p>;
}

function MobileMenu({ onClose, navigate, goToProfile }) {
  const signedIn = getTrainingToken();

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
            navigate("/training");
          }}
        />

        <MenuItem
          label="COURSE"
          onClick={() => {
            onClose();
            navigate("/training-course");
          }}
        />

        <MenuItem
          label="REQUIREMENTS"
          onClick={() => {
            onClose();
            navigate("/training-requirements");
          }}
        />

        <MenuItem
          label="CONTACT"
          onClick={() => {
            onClose();
            navigate("/training-contact-us");
          }}
        />

        <MenuItem
          label="FAQS"
          onClick={() => {
            onClose();
            navigate("/training-faqs");
          }}
        />

        <MenuItem
          label={signedIn ? "PROFILE" : "SIGN IN"}
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

export default TraineeForgotPassword;

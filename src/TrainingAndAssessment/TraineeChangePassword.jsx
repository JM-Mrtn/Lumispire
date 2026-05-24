// src/TrainingAndAssessment/TraineeChangePassword.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearTrainingSession } from "./trainingSession";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return r + "/api";
}


const TRAINING_LOGO = "/HotelLogo.png";
const HERO_IMAGE = "/HotelLanding1.png";

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
    --glass: rgba(255,255,255,.86);
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

  .ltc-desktop-nav { display: flex; align-items: center; gap: 8px; }

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

  .ltc-hero {
    position: relative;
    overflow: hidden;
    color: white;
    isolation: isolate;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
    padding: 78px 0 70px;
  }

  .ltc-hero-slide {
    position: absolute;
    inset: 0;
    z-index: -4;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .35;
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
    min-height: 54px;
    padding: 0 34px;
    border: 1px solid rgba(255,255,255,.24);
    background: rgba(255,255,255,.12);
    border-radius: 999px;
    color: var(--gold-soft);
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .28em;
    text-transform: uppercase;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
  }

  .ltc-hero-title {
    margin: 28px 0 16px;
    font-size: clamp(44px, 7vw, 86px);
    line-height: .95;
    font-weight: 900;
    letter-spacing: -.08em;
  }

  .ltc-hero-title span { color: var(--gold-soft); }

  .ltc-hero-text {
    max-width: 750px;
    margin: 0 auto;
    color: rgba(255,255,255,.9);
    font-size: clamp(17px, 2vw, 22px);
  }

  .ltc-section { padding: 54px 0 70px; }

  .ltc-form-shell {
    position: relative;
    overflow: hidden;
    max-width: 760px;
    margin: 0 auto;
    padding: clamp(24px, 4vw, 42px);
    border-radius: 32px;
    background: var(--glass);
    border: 1px solid rgba(8,39,25,.1);
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(18px);
    animation: ltcFadeUp .78s var(--ease) .08s both;
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
    margin-bottom: 26px;
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

  .ltc-field label {
    display: block;
    color: var(--green-900);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 9px;
  }

  .ltc-input-wrap { position: relative; }

  .ltc-input {
    width: 100%;
    min-height: 54px;
    border: 1px solid rgba(8,39,25,.14);
    border-radius: 18px;
    background: rgba(255,255,255,.9);
    color: var(--green-950);
    padding: 0 54px 0 18px;
    outline: none;
    font-size: 15px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
    transition: .25s var(--ease);
  }

  .ltc-input:hover { border-color: rgba(35,95,62,.28); transform: translateY(-1px); }
  .ltc-input:focus { border-color: rgba(215,168,77,.8); box-shadow: 0 0 0 4px rgba(215,168,77,.16); }

  .ltc-eye-button {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 999px;
    background: rgba(8,39,25,.08);
    color: var(--green-900);
    cursor: pointer;
    transition: .25s var(--ease);
  }

  .ltc-eye-button:hover { background: rgba(215,168,77,.22); transform: translateY(-50%) scale(1.04); }

  .ltc-actions { display: grid; gap: 12px; margin-top: 22px; }

  .ltc-primary-button,
  .ltc-secondary-button {
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

  .ltc-ghost-button { color: var(--green-900); background: rgba(8,39,25,.08); }

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
  }
`;

const TrainingChangePassword = () => {
  const navigate = useNavigate();

  const API_BASE = useMemo(
    () =>
      normalizeApiBase(
        import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
      ),
    []
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [step, setStep] = useState("FORM"); // FORM | OTP
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => {
      setCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const tokenOrKick = () => {
    const token = localStorage.getItem("trainingToken");
    if (!token) {
      navigate("/trainee-login");
      return null;
    }
    return token;
  };

  const shouldLogoutForAuth = (res, data) => {
    if (!(res.status === 401 || res.status === 403)) return false;

    const msg = String(data?.message || "").toLowerCase();

    return (
      msg.includes("unauthorized") ||
      msg.includes("invalid or expired token") ||
      msg.includes("missing token") ||
      msg.includes("trainee access required") ||
      msg.includes("invalid token") ||
      msg.includes("expired token")
    );
  };

  const validateForm = () => {
    if (!currentPassword) return "Current password is required.";
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
    if (currentPassword === newPassword) {
      return "New password must be different from current password.";
    }
    return "";
  };

  const validateOtp = () => {
    const code = otp.trim();
    if (!code) return "OTP is required.";
    if (!/^\d{6}$/.test(code)) return "OTP must be 6 digits.";
    return "";
  };

  const handleAuthFail = () => {
    clearTrainingSession();
    navigate("/trainee-login", { replace: true });
  };

  const sendOtp = async () => {
    setStatus({ type: "", message: "" });

    const token = tokenOrKick();
    if (!token) return;

    const msg = validateForm();
    if (msg) {
      setStatus({ type: "error", message: msg });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/training/change-password/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (shouldLogoutForAuth(res, data)) {
        handleAuthFail();
        return;
      }

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

    const token = tokenOrKick();
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/training/change-password/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (shouldLogoutForAuth(res, data)) {
        handleAuthFail();
        return;
      }

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

    const token = tokenOrKick();
    if (!token) return;

    const formMsg = validateForm();
    if (formMsg) {
      setStatus({ type: "error", message: formMsg });
      return;
    }

    const otpMsg = validateOtp();
    if (otpMsg) {
      setStatus({ type: "error", message: otpMsg });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/training/change-password/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: otp.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (shouldLogoutForAuth(res, data)) {
        handleAuthFail();
        return;
      }

      if (!res.ok) {
        const message = data.message || "OTP verification failed.";
        setStatus({ type: "error", message });

        if (String(message).toLowerCase().includes("no otp request")) {
          setStep("FORM");
          setOtp("");
        }
        return;
      }

      if (data?.user) {
        localStorage.setItem("trainingUser", JSON.stringify(data.user));
      }

      setStatus({
        type: "success",
        message: data.message || "Password changed successfully.",
      });

      setTimeout(() => navigate("/trainee-profile"), 700);
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
      : "ltc-status-info";

  const fmt = (s) => String(s).padStart(2, "0");
  const mmss = `${fmt(Math.floor(cooldown / 60))}:${fmt(cooldown % 60)}`;

  return (
    <div className="ltc-change-password-page" style={fontPontano}>
      <style>{pageStyles}</style>

      <Header navigate={navigate} />

      <main>
        <section className="ltc-hero">
          <img
            src={HERO_IMAGE}
            alt="Change password background"
            className="ltc-hero-slide"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ltc-container ltc-hero-content">
            <h1 className="ltc-hero-title" style={fontMontserrat}>
              Change <span>Password</span>
            </h1>

            <p className="ltc-hero-text" style={fontPontano}>
              Update your trainee account password safely using OTP verification sent to your email.
            </p>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-form-shell">
              <div className="ltc-form-inner">
                <div className="ltc-form-header">
                  <div>
                    <h2 className="ltc-section-heading" style={fontMontserrat}>
                      Password Security
                    </h2>
                    <div className="ltc-section-line" />
                    <p className="ltc-muted-text" style={fontPoppins}>
                      Enter your current password, create a new strong password, then verify the OTP before saving changes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/trainee-profile")}
                    className="ltc-secondary-button"
                    style={fontMontserrat}
                  >
                    Back to Profile
                  </button>
                </div>

                {status.message ? (
                  <div className={`ltc-status ${statusClass}`} style={fontPoppins}>
                    {status.message}
                  </div>
                ) : null}

                <div className="ltc-form-grid">
                  <PasswordField
                    label="Current Password"
                    type={showCur ? "text" : "password"}
                    value={currentPassword}
                    onChange={(value) => setCurrentPassword(value.slice(0, 20))}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    onToggle={() => setShowCur((v) => !v)}
                  />

                  <PasswordField
                    label="New Password"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(value) => setNewPassword(value.slice(0, 20))}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    onToggle={() => setShowNew((v) => !v)}
                  />

                  <PasswordField
                    label="Confirm Password"
                    type={showCpw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(value) => setConfirmPassword(value.slice(0, 20))}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    onToggle={() => setShowCpw((v) => !v)}
                  />

                  {step === "FORM" ? (
                    <div className="ltc-actions">
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={saving}
                        className="ltc-primary-button"
                        style={fontMontserrat}
                      >
                        {saving ? "Sending..." : "Send OTP"}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="ltc-field">
                        <label style={fontMontserrat}>Enter OTP (6 digits)</label>
                        <input
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className="ltc-input"
                          style={fontPoppins}
                          placeholder="123456"
                          inputMode="numeric"
                        />
                      </div>

                      <div className="ltc-actions">
                        <button
                          type="button"
                          onClick={verifyOtpAndSave}
                          disabled={saving}
                          className="ltc-primary-button"
                          style={fontMontserrat}
                        >
                          {saving ? "Verifying..." : "Verify OTP & Save Password"}
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
                          className="ltc-secondary-button ltc-ghost-button"
                          style={fontMontserrat}
                        >
                          Back to Form
                        </button>
                      </div>
                    </>
                  )}

                  <p className="ltc-note" style={fontPoppins}>
                    OTP expires in 10 minutes. Password must include uppercase, lowercase, and at least 1 symbol.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

function PasswordField({ label, type, value, onChange, placeholder, autoComplete, onToggle }) {
  return (
    <div className="ltc-field">
      <label style={fontMontserrat}>{label}</label>
      <div className="ltc-input-wrap">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ltc-input"
          style={fontPoppins}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={onToggle}
          className="ltc-eye-button"
          aria-label={`Toggle ${label.toLowerCase()} visibility`}
        >
          👁
        </button>
      </div>
    </div>
  );
}

function Header({ navigate }) {
  return (
    <header className="ltc-header">
      <div className="ltc-container ltc-nav">
        <button
          onClick={() => navigate("/trainee-home")}
          type="button"
          className="ltc-logo"
          aria-label="Go to trainee home"
        >
          <img
            src={TRAINING_LOGO}
            alt="Training logo"
            className="ltc-logo-icon"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div>
            <h1 style={fontMontserrat}>TRAINING & ASSESSMENT</h1>

          </div>
        </button>

        <nav className="ltc-desktop-nav" style={fontPoppins}>
          <NavButton label="Home" onClick={() => navigate("/trainee-home")} />
          <NavButton label="Roadmap" onClick={() => navigate("/trainee-roadmap")} />
          <NavButton label="Attendance" onClick={() => navigate("/trainee-attendance")} />
          <NavButton label="Modules" onClick={() => navigate("/trainee-modules")} />
          <NavButton label="Assignments" onClick={() => navigate("/trainee-assignment")} />
          <NavButton label="Profile" onClick={() => navigate("/trainee-profile")} className="ltc-profile-button" />
        </nav>
      </div>
    </header>
  );
}

function NavButton({ label, onClick, className = "" }) {
  return (
    <button type="button" onClick={onClick} className={`ltc-nav-link ${className}`}>
      {label}
    </button>
  );
}

function Footer() {
  return (
    <footer className="ltc-footer">
      <div className="ltc-container">
        <p style={fontPoppins}>© {new Date().getFullYear()} Training and Assessment Portal. All rights reserved.</p>
      </div>
    </footer>
  );
}


export default TrainingChangePassword;
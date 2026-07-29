// src/Frontend/HotelAndRestaurant/EmailConfirmation.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];
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
  return `${raw}/api/hotel`;
}

const API_BASE = getHotelApiBase();

function getHotelToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
}

function maskEmail(email = "") {
  if (!email || !email.includes("@")) return "your email address";

  const [local, domain] = email.split("@");
  const maskedLocal =
    local.length <= 2
      ? `${local.charAt(0)}*`
      : `${local.slice(0, 2)}***${local.slice(-1)}`;

  return `${maskedLocal}@${domain}`;
}

export default function EmailConfirmation() {
  const { verificationToken, token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const finalToken = verificationToken || token || "";
  const email =
    location.state?.email ||
    sessionStorage.getItem("pendingVerificationEmail") ||
    "";
  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(Boolean(finalToken));
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState({
    type: "info",
    message: finalToken
      ? "Verifying your email address..."
      : "Open your inbox and click the verification link we sent.",
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let redirectTimer;

    async function verifyEmail() {
      if (!finalToken) return;

      setLoading(true);
      setStatus({
        type: "info",
        message: "Verifying your email address...",
      });

      try {
        const response = await fetch(
          `${API_BASE}/verify-email/${encodeURIComponent(finalToken)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setStatus({
            type: "error",
            message:
              data.message ||
              "Verification failed. The link may be invalid or expired.",
          });
          return;
        }

        sessionStorage.removeItem("pendingVerificationEmail");
        setStatus({
          type: "success",
          message: "Your email is verified. Redirecting you to login...",
        });

        redirectTimer = window.setTimeout(() => {
          navigate("/hotel-login", { replace: true });
        }, 1200);
      } catch (error) {
        console.error("verifyEmail error:", error);
        setStatus({
          type: "error",
          message:
            "We could not reach the server. Please check your connection and try again.",
        });
      } finally {
        setLoading(false);
      }
    }

    verifyEmail();
    return () => {
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [finalToken, navigate]);

  const handleProceed = () => {
    navigate("/hotel-login", { replace: true });
  };

  const handleResend = async () => {
    if (!email) {
      setStatus({
        type: "error",
        message: "No email was found. Please return to sign up and try again.",
      });
      return;
    }

    setResending(true);
    setStatus({
      type: "info",
      message: "Sending a new verification email...",
    });

    try {
      const response = await fetch(`${API_BASE}/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to resend the verification email.",
        });
        return;
      }

      setStatus({
        type: "success",
        message:
          data.message ||
          "A new verification link has been sent to your email.",
      });
    } catch (error) {
      console.error("resend verification error:", error);
      setStatus({
        type: "error",
        message:
          "We could not reach the server. Please check your connection and try again.",
      });
    } finally {
      setResending(false);
    }
  };

  const goTo = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="ltc-email-page" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Pontano+Sans&family=Poppins:wght@500;600;700&display=swap");

        .ltc-email-page {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
          --footer-green: #082719;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --muted: #667085;
          --ease: cubic-bezier(.22,1,.36,1);
          min-height: 100vh;
          color: #101828;
          background: #eef4f0;
          overflow-x: hidden;
        }

        .ltc-email-page * {
          box-sizing: border-box;
        }

        .ltc-container {
          width: min(1180px,92%);
          margin: auto;
        }

        .ltc-header {
          position: relative;
          z-index: 30;
          width: 100%;
          margin: 0;
          border-bottom: 1px solid rgba(255,255,255,.1);
          background: var(--footer-green);
          box-shadow: 0 10px 34px rgba(7,31,20,.14);
        }

        .ltc-header .ltc-container,
        .ltc-footer .ltc-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding-left: 32px;
          padding-right: 32px;
        }

        .ltc-nav {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .ltc-logo {
          display: flex;
          align-items: center;
          gap: 13px;
          border: 0;
          padding: 0;
          background: transparent;
          color: white;
          text-align: left;
          cursor: pointer;
        }

        .ltc-logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background: white;
          object-fit: cover;
          box-shadow: 0 0 0 5px rgba(255,255,255,.08),0 12px 24px rgba(0,0,0,.12);
        }

        .ltc-logo h1 {
          margin: 0;
          font-size: 18px;
          line-height: 1;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -.04em;
        }

        .ltc-logo p {
          margin: 3px 0 0;
          color: rgba(255,255,255,.72);
          font-size: 11px;
        }

        .ltc-desktop-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ltc-nav-link {
          border: 0;
          border-radius: 999px;
          padding: 10px 14px;
          background: transparent;
          color: rgba(255,255,255,.78);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: .25s var(--ease);
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
          border: 0;
          border-radius: 12px;
          padding: 10px;
          background: rgba(255,255,255,.1);
          color: white;
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
          top: 0;
          right: 0;
          width: min(310px,86vw);
          height: 100%;
          padding: 20px;
          background: white;
          box-shadow: -20px 0 60px rgba(0,0,0,.25);
        }

        .ltc-sidebar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(16,24,40,.1);
          padding-bottom: 16px;
        }

        .ltc-sidebar-title {
          margin: 0;
          color: var(--green-950);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .14em;
        }

        .ltc-sidebar-close {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 12px;
          background: #f2f4f7;
          color: #101828;
          cursor: pointer;
        }

        .ltc-sidebar-link {
          display: block;
          width: 100%;
          margin-bottom: 8px;
          border: 0;
          border-radius: 14px;
          padding: 13px 14px;
          background: transparent;
          color: #101828;
          text-align: left;
          font-weight: 800;
          cursor: pointer;
        }

        .ltc-sidebar-link:hover,
        .ltc-sidebar-link.active {
          background: var(--green-800);
          color: white;
        }

        .ltc-footer {
          width: 100%;
          margin: 0;
          padding: 30px 0 12px;
          background: var(--footer-green);
          color: white;
        }

        .ltc-footer-grid {
          width: 100%;
          display: grid;
          grid-template-columns: 1.1fr .75fr 1.1fr 1.1fr 1fr;
          gap: 22px;
          border-bottom: 1px solid rgba(255,255,255,.1);
          padding-bottom: 24px;
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
          margin: 0;
          color: white;
          font-size: 20px;
          line-height: 1.2;
          font-weight: 900;
          text-transform: uppercase;
        }

        .ltc-footer h5 {
          margin: 0 0 10px;
          color: #f4d484;
          font-size: 12px;
          line-height: 1.2;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .14em;
        }

        .ltc-footer p,
        .ltc-footer-link {
          display: block;
          margin: 5px 0;
          color: rgba(255,255,255,.68);
          font-size: 13px;
          line-height: 1.55;
        }

        .ltc-footer-small-text {
          margin: 4px 0 !important;
          font-size: 12px !important;
          line-height: 1.42 !important;
        }

        .ltc-footer-small-text strong {
          font-size: 12px !important;
          line-height: 1.42 !important;
        }

        .ltc-footer-link {
          border: 0;
          padding: 0;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .ltc-footer-link:hover {
          color: white;
          text-decoration: underline;
        }

        .ltc-facebook-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          margin-top: 6px;
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 999px;
          background: rgba(255,255,255,.1);
          color: white;
          cursor: pointer;
          transition: .25s var(--ease);
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

        .ltc-copyright {
          width: 100%;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding-top: 14px;
          color: rgba(255,255,255,.52);
          font-size: 12px;
          line-height: 1.4;
        }

        .ltc-email-container {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .ltc-email-header {
          position: relative;
          z-index: 30;
          background: rgba(255,255,255,.92);
          border-bottom: 1px solid rgba(14,51,33,.09);
          box-shadow: 0 12px 38px rgba(7,31,20,.08);
          backdrop-filter: blur(18px);
        }

        .ltc-email-nav {
          min-height: 78px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
        }

        .ltc-email-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 0;
          padding: 0;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .ltc-email-logo img {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          object-fit: contain;
        }

        .ltc-email-logo h1 {
          margin: 0;
          color: var(--green-950);
          font-size: 16px;
          font-weight: 900;
          letter-spacing: -.025em;
        }

        .ltc-email-logo p {
          margin: 2px 0 0;
          color: var(--muted);
          font-size: 11px;
        }

        .ltc-email-links {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ltc-email-nav-button {
          min-height: 40px;
          border: 0;
          border-radius: 999px;
          padding: 0 15px;
          background: transparent;
          color: var(--green-800);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: .25s ease;
        }

        .ltc-email-nav-button:hover {
          color: var(--green-950);
          background: rgba(35,95,62,.08);
        }

        .ltc-email-nav-button.primary {
          padding: 0 20px;
          color: white;
          background: var(--green-800);
          box-shadow: 0 12px 24px rgba(23,74,48,.18);
        }

        .ltc-email-menu-button {
          display: none;
          width: 44px;
          height: 44px;
          place-items: center;
          border: 0;
          border-radius: 14px;
          background: rgba(35,95,62,.09);
          color: var(--green-900);
          cursor: pointer;
        }

        .ltc-email-menu-button svg {
          width: 23px;
          height: 23px;
        }

        .ltc-email-main {
          position: relative;
          min-height: 690px;
          display: grid;
          place-items: center;
          padding: 54px 0;
          isolation: isolate;
          overflow: hidden;
        }

        .ltc-email-bg {
          position: absolute;
          inset: 0;
          z-index: -3;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 1.2s ease, transform 7s ease;
        }

        .ltc-email-bg.active {
          opacity: 1;
          transform: scale(1);
        }

        .ltc-email-main::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            linear-gradient(105deg,rgba(7,31,20,.92),rgba(7,31,20,.66) 48%,rgba(7,31,20,.34)),
            radial-gradient(circle at 78% 20%,rgba(215,168,77,.24),transparent 35%);
        }

        .ltc-email-main::after {
          content: "";
          position: absolute;
          inset: auto 7% 8% auto;
          z-index: -1;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: rgba(244,212,132,.17);
          filter: blur(12px);
        }

        .ltc-email-card {
          width: min(960px, 100%);
          display: grid;
          grid-template-columns: 1.08fr .92fr;
          border: 1px solid rgba(255,255,255,.58);
          border-radius: 34px;
          background: rgba(255,255,255,.96);
          box-shadow: 0 38px 100px rgba(0,0,0,.28);
          overflow: hidden;
          backdrop-filter: blur(22px);
        }

        .ltc-email-content {
          position: relative;
          padding: 48px;
        }

        .ltc-email-content::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
        }

        .ltc-email-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          color: var(--green-700);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .ltc-email-eyebrow::before {
          content: "";
          width: 22px;
          height: 2px;
          border-radius: 999px;
          background: var(--gold);
        }

        .ltc-email-content h2 {
          margin: 14px 0 0;
          color: var(--green-950);
          font-size: clamp(32px,4vw,48px);
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: -.055em;
        }

        .ltc-email-content h2 span {
          color: var(--gold);
        }

        .ltc-email-intro {
          margin: 18px 0 0;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.75;
        }

        .ltc-email-address {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          max-width: 100%;
          margin-top: 18px;
          border-radius: 999px;
          padding: 10px 14px;
          background: rgba(35,95,62,.08);
          color: var(--green-800);
          font-size: 13px;
          font-weight: 900;
          overflow-wrap: anywhere;
        }

        .ltc-email-address svg {
          flex: 0 0 auto;
          width: 18px;
          height: 18px;
        }

        .ltc-email-status {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 22px;
          border: 1px solid rgba(35,95,62,.14);
          border-radius: 18px;
          padding: 14px 16px;
          background: #f7faf8;
        }

        .ltc-email-status.success {
          border-color: rgba(22,163,74,.2);
          background: #f0fdf4;
          color: #166534;
        }

        .ltc-email-status.error {
          border-color: rgba(220,38,38,.18);
          background: #fef2f2;
          color: #b42318;
        }

        .ltc-email-status.info {
          color: var(--green-800);
        }

        .ltc-email-status-icon {
          flex: 0 0 auto;
          display: grid;
          width: 25px;
          height: 25px;
          place-items: center;
          border-radius: 50%;
          background: currentColor;
          color: white;
          font-size: 13px;
          font-weight: 900;
        }

        .ltc-email-status.info .ltc-email-status-icon {
          background: var(--green-700);
        }

        .ltc-email-status p {
          margin: 1px 0 0;
          color: inherit;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 700;
        }

        .ltc-email-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .ltc-email-action {
          min-height: 46px;
          border-radius: 999px;
          padding: 0 21px;
          border: 1px solid rgba(35,95,62,.18);
          background: white;
          color: var(--green-800);
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: .28s var(--ease);
        }

        .ltc-email-action:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: rgba(215,168,77,.65);
          box-shadow: 0 12px 28px rgba(7,31,20,.12);
        }

        .ltc-email-action.primary {
          border-color: var(--green-800);
          background: linear-gradient(135deg,var(--green-700),var(--green-900));
          color: white;
          box-shadow: 0 14px 30px rgba(23,74,48,.22);
        }

        .ltc-email-action:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .ltc-email-help {
          margin: 18px 0 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
        }

        .ltc-email-visual {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 500px;
          padding: 38px;
          color: white;
          text-align: center;
          background:
            radial-gradient(circle at 50% 32%,rgba(244,212,132,.2),transparent 30%),
            linear-gradient(155deg,var(--green-700),var(--green-950));
          overflow: hidden;
        }

        .ltc-email-visual::before,
        .ltc-email-visual::after {
          content: "";
          position: absolute;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 50%;
        }

        .ltc-email-visual::before {
          width: 360px;
          height: 360px;
          top: -160px;
          right: -150px;
        }

        .ltc-email-visual::after {
          width: 260px;
          height: 260px;
          bottom: -130px;
          left: -110px;
        }

        .ltc-email-visual-inner {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .ltc-email-icon-wrap {
          position: relative;
          display: grid;
          width: 150px;
          height: 150px;
          place-items: center;
          margin: 0 auto;
          border: 1px solid rgba(255,255,255,.26);
          border-radius: 42px;
          background: rgba(255,255,255,.11);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.28),0 30px 60px rgba(0,0,0,.2);
          backdrop-filter: blur(12px);
          transform: rotate(-3deg);
        }

        .ltc-email-icon-wrap svg {
          width: 76px;
          height: 76px;
          color: var(--gold-soft);
          transform: rotate(3deg);
        }

        .ltc-email-check {
          position: absolute;
          right: -10px;
          bottom: -10px;
          display: grid;
          width: 48px;
          height: 48px;
          place-items: center;
          border: 5px solid var(--green-900);
          border-radius: 50%;
          background: var(--gold);
          color: var(--green-950);
          font-size: 20px;
          font-weight: 900;
        }

        .ltc-email-visual h3 {
          margin: 30px 0 0;
          font-size: 23px;
          line-height: 1.2;
          font-weight: 900;
        }

        .ltc-email-visual p {
          max-width: 310px;
          margin: 12px auto 0;
          color: rgba(255,255,255,.72);
          font-size: 13px;
          line-height: 1.7;
        }

        .ltc-email-steps {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
        }

        .ltc-email-step {
          display: grid;
          width: 30px;
          height: 30px;
          place-items: center;
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 50%;
          color: rgba(255,255,255,.62);
          font-size: 11px;
          font-weight: 900;
        }

        .ltc-email-step.active {
          border-color: var(--gold);
          background: var(--gold);
          color: var(--green-950);
        }

        .ltc-email-footer {
          padding: 34px 0 18px;
          color: rgba(255,255,255,.72);
          background: var(--green-950);
        }

        .ltc-email-footer-grid {
          display: grid;
          grid-template-columns: 1.2fr .8fr .9fr;
          gap: 50px;
        }

        .ltc-email-footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ltc-email-footer-brand img {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .ltc-email-footer h4,
        .ltc-email-footer h5 {
          margin: 0;
          color: white;
          font-size: 15px;
          font-weight: 900;
        }

        .ltc-email-footer h5 {
          color: var(--gold-soft);
          font-size: 12px;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .ltc-email-footer p {
          margin: 10px 0 0;
          font-size: 12px;
          line-height: 1.7;
        }

        .ltc-email-footer button {
          display: block;
          margin-top: 8px;
          border: 0;
          padding: 0;
          background: transparent;
          color: rgba(255,255,255,.72);
          font-size: 12px;
          cursor: pointer;
        }

        .ltc-email-footer button:hover {
          color: var(--gold-soft);
        }

        .ltc-email-copyright {
          margin-top: 26px;
          border-top: 1px solid rgba(255,255,255,.1);
          padding-top: 16px;
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,.45);
        }

        .ltc-email-mobile {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: flex;
          justify-content: flex-end;
          background: rgba(0,0,0,.48);
          backdrop-filter: blur(3px);
        }

        .ltc-email-mobile-panel {
          width: min(330px,86vw);
          min-height: 100%;
          padding: 24px;
          background: white;
          box-shadow: -20px 0 50px rgba(0,0,0,.2);
        }

        .ltc-email-mobile-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .ltc-email-mobile-top strong {
          color: var(--green-950);
          font-size: 17px;
        }

        .ltc-email-mobile-close {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 12px;
          background: #f2f4f7;
          cursor: pointer;
        }

        .ltc-email-mobile-link {
          display: block;
          width: 100%;
          min-height: 46px;
          margin-top: 8px;
          border: 0;
          border-radius: 14px;
          padding: 0 15px;
          background: #f7f9f8;
          color: var(--green-800);
          text-align: left;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .ltc-email-mobile-link.primary {
          background: var(--green-800);
          color: white;
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

          .ltc-email-links {
            display: none;
          }

          .ltc-email-menu-button {
            display: grid;
          }

          .ltc-email-card {
            grid-template-columns: 1fr;
            width: min(620px,100%);
          }

          .ltc-email-visual {
            min-height: auto;
            padding: 42px 30px;
          }

          .ltc-email-icon-wrap {
            width: 120px;
            height: 120px;
            border-radius: 34px;
          }

          .ltc-email-icon-wrap svg {
            width: 62px;
            height: 62px;
          }

          .ltc-email-footer-grid {
            grid-template-columns: 1fr 1fr;
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

          .ltc-email-container {
            width: calc(100% - 26px);
            max-width: 1180px;
          }

          .ltc-email-nav {
            min-height: 70px;
          }

          .ltc-email-logo p {
            display: none;
          }

          .ltc-email-main {
            min-height: auto;
            padding: 28px 0;
          }

          .ltc-email-card {
            border-radius: 25px;
          }

          .ltc-email-content {
            padding: 34px 24px 30px;
          }

          .ltc-email-content h2 {
            font-size: 32px;
          }

          .ltc-email-actions {
            flex-direction: column;
          }

          .ltc-email-action {
            width: 100%;
          }

          .ltc-email-visual {
            padding: 34px 24px;
          }

          .ltc-email-footer-grid {
            grid-template-columns: 1fr;
            gap: 26px;
          }
        }
      `}</style>

      <header className="ltc-header">
        <div className="ltc-container ltc-nav">
          <button
            type="button"
            onClick={() => navigate("/resort-venue")}
            className="ltc-logo"
            aria-label="Go to hotel home"
          >
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

          <nav className="ltc-desktop-nav" style={fontPoppins}>
            <button type="button" onClick={() => goTo("/resort-venue")} className="ltc-nav-link">
              HOME
            </button>
            <button type="button" onClick={() => goTo("/virtual-tour")} className="ltc-nav-link">
              VIRTUAL TOUR
            </button>
            <button type="button" onClick={() => goTo("/hotel-contact-us")} className="ltc-nav-link">
              CONTACT
            </button>
            <button type="button" onClick={() => goTo("/hotel-faqs")} className="ltc-nav-link">
              FAQS
            </button>
            <button type="button" onClick={handleProceed} className="ltc-nav-link ltc-profile-button">
              SIGN IN
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="ltc-menu-button"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <main className="ltc-email-main">
        {HERO_IMAGES.map((image, index) => (
          <img
            key={image}
            src={image}
            alt=""
            aria-hidden="true"
            className={`ltc-email-bg ${heroIndex === index ? "active" : ""}`}
          />
        ))}

        <div className="ltc-email-container">
          <section className="ltc-email-card" aria-labelledby="email-verification-title">
            <div className="ltc-email-content">
              <p className="ltc-email-eyebrow" style={fontMontserrat}>
                Account Security
              </p>
              <h2 id="email-verification-title" style={fontMontserrat}>
                Verify your <span>email.</span>
              </h2>
              <p className="ltc-email-intro" style={fontPontano}>
                {finalToken
                  ? "Please wait while we securely confirm your verification link."
                  : "We sent a secure verification link to your registered email address. Click it to activate your account."}
              </p>

              {!finalToken ? (
                <div className="ltc-email-address" style={fontMontserrat}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.75l9 6 9-6M4.5 5.25h15A1.5 1.5 0 0121 6.75v10.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.25V6.75a1.5 1.5 0 011.5-1.5z" />
                  </svg>
                  {maskedEmail}
                </div>
              ) : null}

              <div className={`ltc-email-status ${status.type}`} role="status" aria-live="polite">
                <span className="ltc-email-status-icon">
                  {loading || resending ? "•" : status.type === "success" ? "✓" : status.type === "error" ? "!" : "i"}
                </span>
                <p style={fontPoppins}>{status.message}</p>
              </div>

              <div className="ltc-email-actions" style={fontPoppins}>
                <button
                  type="button"
                  className="ltc-email-action primary"
                  onClick={handleProceed}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Proceed to Login"}
                </button>
                <button
                  type="button"
                  className="ltc-email-action"
                  onClick={handleResend}
                  disabled={loading || resending}
                >
                  {resending ? "Sending..." : "Resend Email"}
                </button>
              </div>

              <p className="ltc-email-help" style={fontPontano}>
                Didn’t receive the email? Check your spam folder or request a new link. For your security, verification links may expire.
              </p>
            </div>

            <aside className="ltc-email-visual">
              <div className="ltc-email-visual-inner">
                <div className="ltc-email-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75l8.25 5.5 8.25-5.5M5.25 5.25h13.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5z" />
                  </svg>
                  <span className="ltc-email-check">✓</span>
                </div>
                <h3 style={fontMontserrat}>One last step</h3>
                <p style={fontPontano}>
                  Confirming your email protects your account and allows us to send important booking updates securely.
                </p>
                <div className="ltc-email-steps" aria-label="Account setup progress">
                  <span className="ltc-email-step active">1</span>
                  <span className="ltc-email-step active">2</span>
                  <span className="ltc-email-step">3</span>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>

      <Footer navigate={navigate} />

      {isMenuOpen ? (
        <MobileMenu
          onClose={() => setIsMenuOpen(false)}
          navigate={navigate}
          goToProfile={() => navigate(getHotelToken() ? "/hotel-profile" : "/hotel-login")}
        />
      ) : null}
    </div>
  );
}

function Footer({ navigate }) {
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
          <FooterLink onClick={() => navigate("/resort-venue")}>Home</FooterLink>
          <FooterLink onClick={() => navigate("/virtual-tour")}>Virtual Tour</FooterLink>
          <FooterLink onClick={() => navigate("/hotel-contact-us")}>Contact</FooterLink>
          <FooterLink onClick={() => navigate("/hotel-faqs")}>FAQs</FooterLink>
          <FooterLink onClick={() => navigate(getHotelToken() ? "/hotel-profile" : "/hotel-login")}>
            {getHotelToken() ? "Profile" : "Sign In"}
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Resort">
          <FooterText className="ltc-footer-small-text"><strong>Address:</strong></FooterText>
          <FooterText className="ltc-footer-small-text">
            Ecotrend Subdivision San Nicolas, Bacoor Cavite
          </FooterText>
          <FooterText className="ltc-footer-small-text"><strong>Contact No.:</strong></FooterText>
          <FooterText className="ltc-footer-small-text">+63 9953781962</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9064191405</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9338699988</FooterText>
        </FooterColumn>

        <FooterColumn title="Hotel">
          <FooterText className="ltc-footer-small-text"><strong>Address:</strong></FooterText>
          <FooterText className="ltc-footer-small-text">
            2/F 5441 Currie Street, Palanan, Makati City
          </FooterText>
          <FooterText className="ltc-footer-small-text"><strong>Contact No.:</strong></FooterText>
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
    <button type="button" className="ltc-footer-link" style={fontPontano} onClick={onClick}>
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
          <p className="ltc-sidebar-title" style={fontPoppins}>MENU</p>
          <button type="button" className="ltc-sidebar-close" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>
        <MenuItem label="HOME" onClick={() => { onClose(); navigate("/resort-venue"); }} />
        <MenuItem label="VIRTUAL TOUR" onClick={() => { onClose(); navigate("/virtual-tour"); }} />
        <MenuItem label="CONTACT" onClick={() => { onClose(); navigate("/hotel-contact-us"); }} />
        <MenuItem label="FAQS" onClick={() => { onClose(); navigate("/hotel-faqs"); }} />
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
      type="button"
      className={`ltc-sidebar-link ${active ? "active" : ""}`}
      style={fontPoppins}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

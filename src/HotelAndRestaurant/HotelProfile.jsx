import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_ID_UPLOAD_POLICY = {
  canUpload: true,
  blockType: "",
  message: "You can upload an ID now.",
  lockedUntil: null,
  secondsRemaining: 0,
};

const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const BOT_KNOWLEDGE = [
  {
    question: "How do I book a hotel room?",
    keywords: ["hotel", "room", "condo", "book", "booking", "stay"],
    answer:
      "To book a hotel or condo room, go to Hotel & Condo, choose a room package, select duration, date, time slot, pax, payment method, then upload proof of payment.",
  },
  {
    question: "How do I book a resort or venue?",
    keywords: ["resort", "venue", "lorenzo", "hall", "veranda", "cavanas", "campsite"],
    answer:
      "To book a resort or venue, go to Resort & Venue, choose your venue, select available duration and time slot, enter pax, choose payment method, upload proof of payment, then submit.",
  },
  {
    question: "How do I book an event package?",
    keywords: ["event", "package", "wedding", "debut", "birthday", "corporate"],
    answer:
      "To book an event package, open Event Package, choose package, venue, capacity variation, event date, time slot, menu choices, payment method, and proof of payment.",
  },
  {
    question: "What payment methods are accepted?",
    keywords: ["payment", "pay", "gcash", "bank", "transfer", "proof", "receipt"],
    answer:
      "The system accepts GCash and Bank Transfer. You must upload a valid proof of payment image or PDF before submitting your booking.",
  },
  {
    question: "What does pending booking mean?",
    keywords: ["pending", "confirmed", "cancelled", "approved", "status", "rejected"],
    answer:
      "Pending means your booking is waiting for admin approval. Confirmed means it was approved. Cancelled means it was rejected, cancelled, or no longer active.",
  },
  {
    question: "Why is my time slot unavailable?",
    keywords: ["time", "slot", "unavailable", "conflict", "available", "date"],
    answer:
      "A time slot can be unavailable if another pending or confirmed booking overlaps with it. Some bookings require at least a 1-hour gap before or after another booking.",
  },
  {
    question: "Why did the price increase?",
    keywords: ["price", "increase", "expensive", "dynamic", "weekend", "seasonal", "pax"],
    answer:
      "Prices may increase because of seasonal dates, weekends, monthly booking demand, or additional pax beyond the base capacity.",
  },
  {
    question: "Why do I need ID verification?",
    keywords: ["id", "verification", "verify", "identity", "government", "upload id"],
    answer:
      "ID verification helps confirm that bookings are made by a real guest. Upload a clear valid government ID from your profile and wait for admin review.",
  },
  {
    question: "Why is my ID pending?",
    keywords: ["pending id", "manual review", "pending", "review", "waiting"],
    answer:
      "Pending ID verification means your uploaded ID is waiting for admin review. You can upload again only after the admin rejects your current ID.",
  },
  {
    question: "Why was my ID rejected?",
    keywords: ["rejected", "invalid id", "not id", "ai rejected", "auto rejected"],
    answer:
      "Your ID may be rejected if the file is unclear, unreadable, not a government ID, expired, or does not show enough identity details. Upload a clearer valid government ID when allowed.",
  },
  {
    question: "How do I reset my password?",
    keywords: ["forgot", "password", "reset", "login"],
    answer:
      "Go to Forgot Password, enter your registered email, and check your email for the reset link. Use the reset link before it expires.",
  },
  {
    question: "How do I change my password?",
    keywords: ["change password", "otp", "current password", "new password"],
    answer:
      "From your profile, click Change Password. Enter your current password and new password, then verify the OTP sent to your registered email.",
  },
  {
    question: "Where can I get recommendations?",
    keywords: ["recommend", "recommendation", "suggest", "best", "package"],
    answer:
      "Open Hotel Recommendations to get suggested hotel, resort, and event options based on your preferences.",
    route: "/hotel-recommendations",
    routeLabel: "Open Recommendations",
  },
  {
    question: "Where can I read all FAQs?",
    keywords: ["faq", "faqs", "help", "questions", "guide"],
    answer:
      "Open the Hotel FAQs page to read detailed answers about booking, payment, ID verification, account, and support concerns.",
    route: "/hotel-faqs",
    routeLabel: "Open FAQs",
  },
];

const QUICK_QUESTIONS = [
  "How do I book a resort?",
  "What payment methods are accepted?",
  "Why is my ID pending?",
  "Why is my time slot unavailable?",
  "Where can I get recommendations?",
];

function getHotelApiBase() {
  const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel`;

  return `${raw}/api/hotel`;
}

function getServerBase() {
  const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  return raw.replace(/\/api\/.*$/, "");
}

function getHotelToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
}

function normalizeIdUploadPolicy(policy, data = {}) {
  if (policy && typeof policy.canUpload === "boolean") {
    return {
      ...DEFAULT_ID_UPLOAD_POLICY,
      ...policy,
    };
  }

  if (data.isIdentityVerified || data.idVerificationStatus === "verified") {
    return {
      canUpload: false,
      blockType: "verified",
      message: "Your ID is already approved. Uploading another ID is disabled.",
      lockedUntil: null,
      secondsRemaining: 0,
    };
  }

  if (data.idVerificationStatus === "pending") {
    return {
      canUpload: false,
      blockType: "manual_review",
      message:
        "Your uploaded ID is still under manual review. You can upload again only after the admin rejects it.",
      lockedUntil: null,
      secondsRemaining: 0,
    };
  }

  return DEFAULT_ID_UPLOAD_POLICY;
}

function formatRemaining(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));

  if (safeSeconds <= 0) return "0 seconds";
  if (safeSeconds < 60) return `${safeSeconds} second${safeSeconds === 1 ? "" : "s"}`;

  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;

  return `${minutes} minute${minutes === 1 ? "" : "s"}${
    rest ? ` and ${rest} second${rest === 1 ? "" : "s"}` : ""
  }`;
}

function humanize(value = "unknown") {
  return String(value || "unknown").replaceAll("_", " ");
}

function getBotReply(message = "") {
  const input = String(message || "").toLowerCase().trim();

  if (!input) {
    return {
      answer: "Please type a hotel question first.",
      matched: null,
    };
  }

  let bestMatch = null;
  let bestScore = 0;

  BOT_KNOWLEDGE.forEach((item) => {
    let score = 0;

    item.keywords.forEach((keyword) => {
      const cleanKeyword = keyword.toLowerCase();

      if (input.includes(cleanKeyword)) {
        score += cleanKeyword.length > 6 ? 2 : 1;
      }
    });

    if (input.includes(item.question.toLowerCase())) {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  if (!bestMatch || bestScore === 0) {
    return {
      answer:
        "I can answer basic hotel and resort questions about booking, payment, ID verification, booking status, time slots, prices, password reset, FAQs, and recommendations. Try asking: 'How do I book a resort?' or 'Why is my ID pending?'",
      matched: null,
    };
  }

  return {
    answer: bestMatch.answer,
    matched: bestMatch,
  };
}

const profilePageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-profile-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --glass: rgba(255, 255, 255, 0.82);
    --shadow-md: 0 18px 45px rgba(8, 39, 25, 0.12);
    --shadow-lg: 0 32px 80px rgba(8, 39, 25, 0.18);
    --radius: 24px;
    --ease: cubic-bezier(.22, 1, .36, 1);

    min-height: 100vh;
    color: var(--dark);
    background:
      radial-gradient(circle at 12% 0%, rgba(215, 168, 77, .12), transparent 28%),
      radial-gradient(circle at 92% 12%, rgba(35, 95, 62, .12), transparent 30%),
      linear-gradient(180deg, #f8fbf9 0%, #fff 42%, #f5faf7 100%);
    line-height: 1.65;
    letter-spacing: -.01em;
    overflow-x: hidden;
    font-family: "Inter", Arial, sans-serif;
  }

  .ltc-profile-page * {
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

  .ltc-signout-button {
    color: #fecaca;
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

  .ltc-hero {
    position: relative;
    overflow: hidden;
    color: white;
    isolation: isolate;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
    padding: 90px 0 88px;
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
    font-size: clamp(36px, 5vw, 62px);
    line-height: 1.05;
    font-weight: 900;
    letter-spacing: -.055em;
    text-shadow: 0 8px 26px rgba(0,0,0,.22);
  }

  .ltc-hero-title span {
    color: var(--gold-soft);
  }

  .ltc-hero-text {
    max-width: 760px;
    margin: 18px auto 0;
    color: rgba(255,255,255,.80);
    font-size: 17px;
    line-height: 1.8;
  }

  .ltc-hero-actions {
    margin-top: 28px;
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .ltc-main {
    padding: 46px 0 84px;
  }

  .ltc-status-banner {
    margin-bottom: 24px;
    border-radius: 18px;
    padding: 14px 18px;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.5;
  }

  .ltc-status-success {
    border: 1px solid rgba(16,185,129,.25);
    background: rgba(16,185,129,.10);
    color: #047857;
  }

  .ltc-status-info {
    border: 1px solid rgba(245,158,11,.24);
    background: rgba(245,158,11,.10);
    color: #b45309;
  }

  .ltc-status-error {
    border: 1px solid rgba(239,68,68,.22);
    background: rgba(239,68,68,.10);
    color: #b42318;
  }

  .ltc-profile-grid {
    display: grid;
    grid-template-columns: 330px minmax(0, 1fr);
    gap: 28px;
    align-items: start;
  }

  .ltc-side-card,
  .ltc-dashboard-card {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius);
    background: var(--glass);
    border: 1px solid rgba(255,255,255,.76);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
    transition: .35s var(--ease);
  }

  .ltc-side-card::before,
  .ltc-dashboard-card::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 6px;
    background: linear-gradient(90deg, var(--green-700), var(--gold));
    z-index: 3;
  }

  .ltc-side-card:hover,
  .ltc-dashboard-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-lg);
    border-color: rgba(215,168,77,.45);
  }

  .ltc-side-card {
    padding: 30px 24px 24px;
    text-align: center;
  }

  .ltc-avatar {
    width: 178px;
    height: 178px;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 32px;
    border: 4px solid rgba(255,255,255,.76);
    background: rgba(35,95,62,.08);
    box-shadow: 0 18px 42px rgba(8,39,25,.12);
  }

  .ltc-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ltc-avatar-fallback {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: var(--green-800);
    font-size: 54px;
    font-weight: 900;
  }

  .ltc-profile-name {
    margin: 18px 0 0;
    color: var(--green-950);
    font-size: 24px;
    line-height: 1.15;
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .ltc-profile-username {
    margin: 6px 0 0;
    color: var(--muted);
    font-size: 13px;
    font-weight: 800;
    word-break: break-word;
  }

  .ltc-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 32px;
    border-radius: 999px;
    padding: 0 13px;
    font-size: 12px;
    font-weight: 900;
    border: 1px solid transparent;
  }

  .ltc-badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
  }

  .ltc-badge-success {
    color: #047857;
    background: rgba(16,185,129,.10);
    border-color: rgba(16,185,129,.25);
  }

  .ltc-badge-warning {
    color: #b45309;
    background: rgba(245,158,11,.10);
    border-color: rgba(245,158,11,.24);
  }

  .ltc-badge-danger {
    color: #b42318;
    background: rgba(239,68,68,.10);
    border-color: rgba(239,68,68,.22);
  }

  .ltc-badge-neutral {
    color: #475467;
    background: rgba(102,112,133,.09);
    border-color: rgba(102,112,133,.14);
  }

  .ltc-side-actions {
    margin-top: 24px;
    display: grid;
    gap: 10px;
  }

  .ltc-primary-button,
  .ltc-secondary-button,
  .ltc-danger-button {
    min-height: 48px;
    border-radius: 999px;
    padding: 0 18px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    transition: .25s var(--ease);
    border: 0;
  }

  .ltc-primary-button {
    color: #102418;
    background: linear-gradient(135deg, #f4d484, #d7a84d);
    box-shadow: 0 14px 30px rgba(215,168,77,.24);
  }

  .ltc-secondary-button {
    color: var(--green-800);
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(35,95,62,.14);
  }

  .ltc-danger-button {
    color: #b42318;
    background: rgba(239,68,68,.10);
    border: 1px solid rgba(239,68,68,.22);
  }

  .ltc-primary-button:hover,
  .ltc-secondary-button:hover,
  .ltc-danger-button:hover {
    transform: translateY(-2px);
  }

  .ltc-primary-button:disabled,
  .ltc-secondary-button:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none;
  }

  .ltc-content-stack {
    display: grid;
    gap: 24px;
  }

  .ltc-dashboard-card {
    padding: 30px;
  }

  .ltc-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 24px;
  }

  .ltc-card-eyebrow {
    color: var(--green-700);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .18em;
    text-transform: uppercase;
    margin: 0;
  }

  .ltc-card-title {
    color: var(--green-950);
    font-size: clamp(24px, 3vw, 34px);
    line-height: 1.08;
    letter-spacing: -.05em;
    font-weight: 900;
    margin: 8px 0 0;
  }

  .ltc-info-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .ltc-info-field,
  .ltc-ai-box {
    border-radius: 18px;
    background: rgba(255,255,255,.68);
    border: 1px solid rgba(35,95,62,.10);
    padding: 16px;
    min-height: 88px;
    transition: .25s var(--ease);
  }

  .ltc-info-field:hover,
  .ltc-ai-box:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,.92);
    box-shadow: 0 14px 28px rgba(8,39,25,.08);
  }

  .ltc-info-label,
  .ltc-ai-label {
    margin: 0;
    color: var(--muted);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .13em;
    text-transform: uppercase;
  }

  .ltc-info-value,
  .ltc-ai-value {
    margin: 8px 0 0;
    color: var(--green-950);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 850;
    word-break: break-word;
  }

  .ltc-help-text {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.8;
    font-weight: 500;
  }

  .ltc-alert-box {
    margin-top: 18px;
    border-radius: 18px;
    padding: 14px 16px;
    border: 1px solid rgba(245,158,11,.24);
    background: rgba(245,158,11,.10);
    color: #b45309;
    font-size: 13px;
    line-height: 1.55;
    font-weight: 800;
  }

  .ltc-upload-row {
    margin-top: 22px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 14px;
    align-items: end;
  }

  .ltc-upload-label {
    margin: 0 0 8px;
    color: var(--green-950);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-file-display {
    min-height: 50px;
    display: flex;
    align-items: center;
    border-radius: 999px;
    border: 1px solid rgba(35,95,62,.14);
    background: rgba(255,255,255,.74);
    color: var(--muted);
    padding: 0 18px;
    font-size: 13px;
    font-weight: 800;
    word-break: break-word;
  }

  .ltc-consent {
    margin-top: 18px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    border-radius: 18px;
    border: 1px solid rgba(35,95,62,.10);
    background: rgba(255,255,255,.62);
    padding: 14px 16px;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.6;
    font-weight: 700;
  }

  .ltc-consent input {
    margin-top: 4px;
    accent-color: var(--green-800);
  }

  .ltc-verification-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: .85fr 1.15fr;
    gap: 14px;
  }

  .ltc-status-card {
    border-radius: 18px;
    border: 1px solid rgba(35,95,62,.10);
    background: rgba(255,255,255,.68);
    padding: 18px;
  }

  .ltc-status-title {
    margin: 0;
    color: var(--muted);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .ltc-status-value {
    margin: 8px 0 0;
    color: var(--green-950);
    font-size: 22px;
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .ltc-status-desc {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.7;
    font-weight: 600;
  }

  .ltc-ai-card {
    margin-top: 18px;
    border-radius: 20px;
    border: 1px solid rgba(35,95,62,.10);
    background: rgba(255,255,255,.68);
    padding: 20px;
  }

  .ltc-ai-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 16px;
  }

  .ltc-ai-title {
    margin: 0;
    color: var(--green-950);
    font-size: 20px;
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .ltc-ai-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .ltc-ai-summary {
    margin: 16px 0 0;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.8;
    font-weight: 600;
  }

  .ltc-card-actions {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
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

  .ltc-chat-overlay {
    position: fixed;
    inset: 0;
    z-index: 90;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    background: rgba(0,0,0,.35);
    padding: 24px;
    backdrop-filter: blur(4px);
  }

  .ltc-chat-panel {
    width: min(430px, 100%);
    height: min(620px, 88vh);
    overflow: hidden;
    border-radius: 28px;
    background: white;
    box-shadow: 0 32px 90px rgba(0,0,0,.28);
    display: flex;
    flex-direction: column;
  }

  .ltc-chat-head {
    background: var(--green-800);
    color: white;
    padding: 18px 20px;
  }

  .ltc-chat-top {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .ltc-chat-head p {
    margin: 0;
    color: rgba(255,255,255,.66);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .ltc-chat-head h3 {
    margin: 5px 0 0;
    color: white;
    font-size: 20px;
    line-height: 1.15;
    font-weight: 900;
  }

  .ltc-chat-close {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 0;
    background: rgba(255,255,255,.12);
    color: white;
    cursor: pointer;
    font-weight: 900;
  }

  .ltc-chat-body {
    flex: 1;
    overflow-y: auto;
    background: #f8fbf9;
    padding: 16px;
    display: grid;
    gap: 12px;
    align-content: start;
  }

  .ltc-chat-message {
    max-width: 86%;
    border-radius: 18px;
    padding: 12px 14px;
    font-size: 13px;
    line-height: 1.6;
    font-weight: 650;
    box-shadow: 0 8px 20px rgba(8,39,25,.08);
  }

  .ltc-chat-message.bot {
    justify-self: start;
    color: var(--green-800);
    background: white;
  }

  .ltc-chat-message.user {
    justify-self: end;
    color: white;
    background: var(--green-800);
  }

  .ltc-chat-route {
    margin-top: 10px;
    border: 0;
    border-radius: 999px;
    color: white;
    background: var(--green-800);
    padding: 9px 13px;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
  }

  .ltc-chat-footer {
    border-top: 1px solid rgba(16,24,40,.1);
    background: white;
    padding: 14px;
  }

  .ltc-quick-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 10px;
  }

  .ltc-quick-button {
    flex: 0 0 auto;
    border: 1px solid rgba(35,95,62,.14);
    background: rgba(35,95,62,.06);
    color: var(--green-800);
    border-radius: 999px;
    padding: 8px 11px;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
  }

  .ltc-chat-form {
    display: flex;
    gap: 8px;
  }

  .ltc-chat-input {
    flex: 1;
    height: 46px;
    border-radius: 16px;
    border: 1px solid rgba(16,24,40,.12);
    background: #f8fbf9;
    color: var(--green-950);
    padding: 0 14px;
    outline: none;
    font-size: 13px;
    font-weight: 650;
  }

  .ltc-chat-send {
    border: 0;
    border-radius: 16px;
    color: white;
    background: var(--green-800);
    padding: 0 16px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .ltc-view-faq {
    margin-top: 10px;
    width: 100%;
    min-height: 44px;
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.14);
    background: white;
    color: var(--green-800);
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  @media (max-width: 1100px) {
    .ltc-profile-grid {
      grid-template-columns: 1fr;
    }

    .ltc-side-card {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 24px;
      align-items: center;
      text-align: left;
    }

    .ltc-side-main {
      display: flex;
      align-items: center;
      gap: 22px;
    }

    .ltc-avatar {
      width: 138px;
      height: 138px;
      margin: 0;
    }

    .ltc-side-actions {
      margin-top: 0;
    }

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

    .ltc-hero {
      padding: 78px 0 76px;
    }

    .ltc-main {
      padding: 38px 0 64px;
    }

    .ltc-info-grid,
    .ltc-ai-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ltc-upload-row,
    .ltc-verification-grid {
      grid-template-columns: 1fr;
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

  @media (max-width: 620px) {
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

    .ltc-hero-title {
      font-size: clamp(34px, 11vw, 46px);
      letter-spacing: -.045em;
    }

    .ltc-hero-text {
      font-size: 15px;
    }

    .ltc-side-card {
      display: block;
      text-align: center;
      padding: 28px 18px 20px;
    }

    .ltc-side-main {
      display: block;
    }

    .ltc-avatar {
      width: 142px;
      height: 142px;
      margin: 0 auto;
    }

    .ltc-side-actions {
      margin-top: 22px;
    }

    .ltc-dashboard-card {
      padding: 24px 18px;
    }

    .ltc-card-header,
    .ltc-ai-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .ltc-info-grid,
    .ltc-ai-grid {
      grid-template-columns: 1fr;
    }

    .ltc-card-actions {
      flex-direction: column;
    }

    .ltc-card-actions button,
    .ltc-upload-row button {
      width: 100%;
    }

    .ltc-chat-overlay {
      padding: 12px;
    }
  }
`;

const HotelProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const idFileInputRef = useRef(null);

  const API_BASE = useMemo(() => getHotelApiBase(), []);
  const SERVER_BASE = useMemo(() => getServerBase(), []);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    profilePicture: "",
    idVerificationStatus: "not_submitted",
    isIdentityVerified: false,
    idVerificationRemarks: "",
    idUploadPolicy: DEFAULT_ID_UPLOAD_POLICY,
    aiConnected: false,
    aiConnectionStatus: "not_checked",
    aiSummary: "",
    aiDecision: "unknown",
    aiRiskLevel: "unknown",
    aiDocumentType: "unknown",
    aiCheckedAt: null,
    aiError: "",
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isOpen, setIsOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  const [idFile, setIdFile] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [idUploading, setIdUploading] = useState(false);
  const [lastAiResult, setLastAiResult] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [imageFailed, setImageFailed] = useState(false);
  const [isBotOpen, setIsBotOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const resolveImageUrl = (url) => {
    if (!url) return "";

    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("blob:") ||
      url.startsWith("data:")
    ) {
      return url;
    }

    return `${SERVER_BASE}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const fetchProfile = async () => {
    const token = getHotelToken();

    if (!token) {
      navigate("/hotel-login", { replace: true });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/hotel-user-profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("hotelToken");
        navigate("/hotel-login", { replace: true });
        return;
      }

      const verification = data.hotelIdVerificationId || {};

      setForm({
        firstName: data.firstName || "",
        middleName: data.middleName || "",
        lastName: data.lastName || "",
        username: data.username || "",
        email: data.email || "",
        phone: data.phone || "",
        profilePicture: data.profilePicture || "",
        idVerificationStatus: data.idVerificationStatus || "not_submitted",
        isIdentityVerified: Boolean(data.isIdentityVerified),
        idVerificationRemarks: data.idVerificationRemarks || "",
        idUploadPolicy: normalizeIdUploadPolicy(data.idUploadPolicy, data),
        aiConnected: Boolean(verification.aiConnected),
        aiConnectionStatus: verification.aiConnectionStatus || "not_checked",
        aiSummary: verification.aiSummary || "",
        aiDecision: verification.aiDecision || "unknown",
        aiRiskLevel: verification.aiRiskLevel || "unknown",
        aiDocumentType: verification.aiDocumentType || "unknown",
        aiCheckedAt: verification.aiCheckedAt || null,
        aiError: verification.aiError || "",
      });

      setImageFailed(false);
    } catch (err) {
      console.error("fetchProfile error:", err);

      setStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, API_BASE]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const idUploadPolicy = form.idUploadPolicy || DEFAULT_ID_UPLOAD_POLICY;

  const cooldownSeconds = useMemo(() => {
    if (!idUploadPolicy.lockedUntil) return 0;

    const target = new Date(idUploadPolicy.lockedUntil).getTime();

    if (!Number.isFinite(target)) return 0;

    return Math.max(0, Math.ceil((target - now) / 1000));
  }, [idUploadPolicy.lockedUntil, now]);

  const cooldownActive =
    idUploadPolicy.blockType === "cooldown" && cooldownSeconds > 0;

  const hardBlocked =
    !idUploadPolicy.canUpload && idUploadPolicy.blockType !== "cooldown";

  const canUploadIdNow =
    !loading && !idUploading && !hardBlocked && !cooldownActive;

  const uploadBlockMessage = useMemo(() => {
    if (cooldownActive) {
      return `Please wait ${formatRemaining(
        cooldownSeconds
      )} before uploading another ID.`;
    }

    if (hardBlocked) {
      return idUploadPolicy.message || "ID upload is currently disabled.";
    }

    return "";
  }, [cooldownActive, cooldownSeconds, hardBlocked, idUploadPolicy.message]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hotelToken");
    navigate("/resort-venue", { replace: true });
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleChooseId = () => {
    if (!canUploadIdNow) {
      setStatus({
        type: "info",
        message: uploadBlockMessage || "ID upload is currently disabled.",
      });
      return;
    }

    idFileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus({
        type: "error",
        message: "Please select a valid image file.",
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setStatus({
        type: "error",
        message: "Image must be 5MB or smaller.",
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const token = getHotelToken();

    if (!token) {
      navigate("/hotel-login", { replace: true });
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const tempPreview = URL.createObjectURL(file);

    setPreviewUrl(tempPreview);
    setUploading(true);
    setImageFailed(false);
    setStatus({ type: "", message: "" });

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await fetch(`${API_BASE}/profile-picture`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload profile picture.");
      }

      const savedUrl =
        data.profilePicture ||
        data.user?.profilePicture ||
        data.data?.profilePicture ||
        "";

      setForm((prev) => ({
        ...prev,
        profilePicture: savedUrl,
      }));

      if (savedUrl) {
        URL.revokeObjectURL(tempPreview);
        setPreviewUrl("");
      }

      setStatus({
        type: "success",
        message: "Profile picture uploaded successfully.",
      });
    } catch (err) {
      console.error("handleProfilePictureChange error:", err);

      setPreviewUrl("");

      setStatus({
        type: "error",
        message: err.message || "Failed to upload profile picture.",
      });
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleIdFileChange = (event) => {
    if (!canUploadIdNow) {
      setStatus({
        type: "info",
        message: uploadBlockMessage || "ID upload is currently disabled.",
      });

      if (idFileInputRef.current) idFileInputRef.current.value = "";
      return;
    }

    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setStatus({
        type: "error",
        message: "Only JPG, JPEG, PNG, WEBP, and PDF files are allowed.",
      });

      if (idFileInputRef.current) idFileInputRef.current.value = "";
      return;
    }

    const maxSize = 8 * 1024 * 1024;

    if (file.size > maxSize) {
      setStatus({
        type: "error",
        message: "ID file must be 8MB or smaller.",
      });

      if (idFileInputRef.current) idFileInputRef.current.value = "";
      return;
    }

    setIdFile(file);
    setStatus({ type: "", message: "" });
  };

  const handleUploadId = async () => {
    const token = getHotelToken();

    if (!token) {
      navigate("/hotel-login", { replace: true });
      return;
    }

    if (!canUploadIdNow) {
      setStatus({
        type: "info",
        message: uploadBlockMessage || "ID upload is currently disabled.",
      });
      return;
    }

    if (!idFile) {
      setStatus({
        type: "error",
        message: "Please select an ID file to upload.",
      });
      return;
    }

    if (!consentGiven) {
      setStatus({
        type: "error",
        message: "You must agree before submitting your ID.",
      });
      return;
    }

    setIdUploading(true);
    setStatus({ type: "", message: "" });

    try {
      const formData = new FormData();
      formData.append("idImage", idFile);
      formData.append("consentGiven", "true");

      const res = await fetch(`${API_BASE}/upload-id`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.idUploadPolicy) {
          setForm((prev) => ({
            ...prev,
            idUploadPolicy: normalizeIdUploadPolicy(data.idUploadPolicy, data),
            idVerificationStatus:
              data.idVerificationStatus || prev.idVerificationStatus,
            isIdentityVerified:
              data.isIdentityVerified ?? prev.isIdentityVerified,
          }));
        }

        throw new Error(data.message || "Failed to upload ID.");
      }

      const aiResult = {
        aiConnected: Boolean(data.aiConnected),
        aiConnectionStatus: data.aiConnectionStatus || "not_checked",
        aiSummary: data.aiSummary || "",
        aiDecision: data.aiDecision || "unknown",
        aiRiskLevel: data.aiRiskLevel || "unknown",
        aiDocumentType: data.aiDocumentType || "unknown",
        aiCheckedAt: data.aiCheckedAt || null,
        aiError: data.aiError || "",
        confidenceScore: data.confidenceScore,
        reasons: Array.isArray(data.reasons) ? data.reasons : [],
      };

      setLastAiResult(aiResult);

      setForm((prev) => ({
        ...prev,
        idVerificationStatus:
          data.idVerificationStatus || prev.idVerificationStatus,
        isIdentityVerified: Boolean(data.isIdentityVerified),
        idVerificationRemarks:
          data.idVerificationRemarks ||
          data.message ||
          prev.idVerificationRemarks,
        idUploadPolicy: normalizeIdUploadPolicy(data.idUploadPolicy, data),
        aiConnected: Boolean(data.aiConnected),
        aiConnectionStatus: data.aiConnectionStatus || "not_checked",
        aiSummary: data.aiSummary || "",
        aiDecision: data.aiDecision || "unknown",
        aiRiskLevel: data.aiRiskLevel || "unknown",
        aiDocumentType: data.aiDocumentType || "unknown",
        aiCheckedAt: data.aiCheckedAt || null,
        aiError: data.aiError || "",
      }));

      setStatus({
        type: data.idVerificationStatus === "rejected" ? "error" : "success",
        message: data.message || "ID uploaded successfully.",
      });

      setIdFile(null);
      setConsentGiven(false);

      if (idFileInputRef.current) {
        idFileInputRef.current.value = "";
      }

      await fetchProfile();
    } catch (err) {
      console.error("handleUploadId error:", err);

      setStatus({
        type: "error",
        message: err.message || "Failed to upload ID.",
      });
    } finally {
      setIdUploading(false);
    }
  };

  const displayName = useMemo(() => {
    if (loading) return "Full Name";

    const full = [form.firstName, form.middleName, form.lastName]
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join(" ");

    return full || "Full Name";
  }, [loading, form.firstName, form.middleName, form.lastName]);

  const initials = useMemo(() => {
    const first = form.firstName?.trim()?.[0] || "";
    const middle = form.middleName?.trim()?.[0] || "";
    const last = form.lastName?.trim()?.[0] || "";
    const user = form.username?.trim()?.[0] || "";

    return (first + last || first + middle || user || "U").toUpperCase();
  }, [form.firstName, form.middleName, form.lastName, form.username]);

  const resolvedProfilePicture = resolveImageUrl(form.profilePicture);
  const profileImageSrc = previewUrl || resolvedProfilePicture;

  const verificationBadge = useMemo(() => {
    if (form.idVerificationStatus === "verified") {
      return {
        label: "Verified",
        className: "ltc-badge-success",
        dotClassName: "bg-emerald",
      };
    }

    if (form.idVerificationStatus === "pending") {
      return {
        label: "Pending Review",
        className: "ltc-badge-warning",
        dotClassName: "bg-amber",
      };
    }

    if (form.idVerificationStatus === "rejected") {
      return {
        label: "Rejected",
        className: "ltc-badge-danger",
        dotClassName: "bg-rose",
      };
    }

    return {
      label: "Not Submitted",
      className: "ltc-badge-neutral",
      dotClassName: "bg-slate",
    };
  }, [form.idVerificationStatus]);

  const aiBadge = useMemo(() => {
    const source = lastAiResult || form;
    const aiStatus = source.aiConnectionStatus || "not_checked";

    if (aiStatus === "connected") {
      return {
        label: "AI Connected",
        className: "ltc-badge-success",
      };
    }

    if (aiStatus === "missing_key") {
      return {
        label: "AI Key Missing",
        className: "ltc-badge-warning",
      };
    }

    if (aiStatus === "error") {
      return {
        label: "AI Check Failed",
        className: "ltc-badge-danger",
      };
    }

    if (aiStatus === "not_supported") {
      return {
        label: "AI Not Supported",
        className: "ltc-badge-neutral",
      };
    }

    return {
      label: "AI Not Checked",
      className: "ltc-badge-neutral",
    };
  }, [form, lastAiResult]);

  const aiDisplay = lastAiResult || form;

  const uploadButtonText = idUploading
    ? "Uploading ID..."
    : form.idVerificationStatus === "verified"
    ? "ID Already Approved"
    : form.idVerificationStatus === "pending"
    ? "Waiting for Admin Review"
    : cooldownActive
    ? `Wait ${cooldownSeconds}s`
    : "Upload ID for Verification";

  const accountFields = [
    { title: "First Name", value: loading ? "Loading..." : form.firstName || "-" },
    { title: "Middle Name", value: loading ? "Loading..." : form.middleName || "-" },
    { title: "Last Name", value: loading ? "Loading..." : form.lastName || "-" },
    { title: "Username", value: loading ? "Loading..." : form.username || "-" },
    { title: "Email", value: loading ? "Loading..." : form.email || "-" },
    { title: "Phone Number", value: loading ? "Loading..." : form.phone || "-" },
    {
      title: "Identity Verification",
      value: loading
        ? "Loading..."
        : form.isIdentityVerified
        ? "Verified"
        : form.idVerificationStatus === "pending"
        ? "Pending Review"
        : form.idVerificationStatus === "rejected"
        ? "Rejected"
        : "Not Submitted",
    },
  ];

  const aiStats = [
    { title: "AI Decision", value: humanize(aiDisplay.aiDecision) },
    { title: "Risk Level", value: humanize(aiDisplay.aiRiskLevel) },
    { title: "Document Type", value: humanize(aiDisplay.aiDocumentType) },
  ];

  return (
    <div className="ltc-profile-page" style={fontPontano}>
      <style>{profilePageStyles}</style>

      <Header
        navigate={navigate}
        onSignOut={handleSignOut}
        openMenu={() => setIsOpen(true)}
      />

      <main className="ltc-main">
        <div className="ltc-container">
          {status.message ? (
            <StatusBanner type={status.type} message={status.message} />
          ) : null}

          <div className="ltc-profile-grid">
            <aside className="ltc-side-card">
              <div className="ltc-side-main">
                <AvatarPreview
                  src={profileImageSrc}
                  initials={initials}
                  imageFailed={imageFailed}
                  setImageFailed={setImageFailed}
                  setStatus={setStatus}
                />

                <div>
                  <h2 className="ltc-profile-name" style={fontMontserrat}>
                    {displayName}
                  </h2>

                  <p className="ltc-profile-username" style={fontPoppins}>
                    {loading ? "@username" : form.username ? `@${form.username}` : "@username"}
                  </p>

                  <div style={{ marginTop: "14px" }}>
                    <Badge
                      label={verificationBadge.label}
                      className={verificationBadge.className}
                      dotClassName={verificationBadge.dotClassName}
                    />
                  </div>
                </div>
              </div>

              <div className="ltc-side-actions">
                <button
                  type="button"
                  onClick={handleChoosePhoto}
                  disabled={uploading}
                  className="ltc-primary-button"
                  style={fontMontserrat}
                >
                  {uploading ? "Uploading Photo..." : "Upload Photo"}
                </button>

                <SideActionButton onClick={() => navigate("/hotel-recommendations")}>
                  Hotel Recommendations
                </SideActionButton>

                <SideActionButton onClick={() => navigate("/hotel-chat")}>
                  Open Hotel &amp; Resort Chat
                </SideActionButton>

                <SideActionButton onClick={() => navigate("/hotel-guest-reviews")}>
                  My Approved Booking Reviews
                </SideActionButton>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="ltc-danger-button"
                  style={fontMontserrat}
                >
                  Sign Out
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                hidden
              />
            </aside>

            <section className="ltc-content-stack">
              <DashboardCard
                eyebrow="Account Information"
                title="Personal Details"
                action={
                  <button
                    type="button"
                    onClick={() => navigate("/hotel-change-password")}
                    className="ltc-primary-button"
                    style={fontMontserrat}
                  >
                    Change Password
                  </button>
                }
              >
                <div className="ltc-info-grid">
                  {accountFields.map((field) => (
                    <ProfileField
                      key={field.title}
                      title={field.title}
                      value={field.value}
                    />
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard
                eyebrow="Identity Verification"
                title="Upload Government ID"
                action={
                  <Badge
                    label={verificationBadge.label}
                    className={verificationBadge.className}
                    dotClassName={verificationBadge.dotClassName}
                  />
                }
              >
                <p className="ltc-help-text" style={fontPontano}>
                  Upload a valid government ID. The backend will run an AI pre-check first,
                  then your document will wait for admin review when needed.
                </p>

                {uploadBlockMessage ? (
                  <div className="ltc-alert-box" style={fontPoppins}>
                    {uploadBlockMessage}
                  </div>
                ) : null}

                <div className="ltc-upload-row">
                  <div>
                    <p className="ltc-upload-label" style={fontMontserrat}>
                      Selected File
                    </p>

                    <div className="ltc-file-display" style={fontPoppins}>
                      {idFile ? idFile.name : "No file selected"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleChooseId}
                    disabled={!canUploadIdNow}
                    className="ltc-primary-button"
                    style={fontMontserrat}
                  >
                    Choose ID File
                  </button>

                  <input
                    ref={idFileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleIdFileChange}
                    disabled={!canUploadIdNow}
                    hidden
                  />
                </div>

                <label className="ltc-consent" style={fontPoppins}>
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(event) => setConsentGiven(event.target.checked)}
                    disabled={!canUploadIdNow}
                  />

                  <span>
                    I agree to submit my ID for account verification and admin review.
                  </span>
                </label>

                <div className="ltc-verification-grid">
                  <div className="ltc-status-card">
                    <p className="ltc-status-title" style={fontMontserrat}>
                      Current Status
                    </p>

                    <p className="ltc-status-value" style={fontMontserrat}>
                      {verificationBadge.label}
                    </p>
                  </div>

                  <div className="ltc-status-card">
                    {form.idVerificationRemarks ? (
                      <p className="ltc-status-desc" style={fontPontano}>
                        <strong>Remarks: </strong>
                        {form.idVerificationRemarks}
                      </p>
                    ) : (
                      <p className="ltc-status-desc" style={fontPontano}>
                        No admin remarks yet.
                      </p>
                    )}

                    <p className="ltc-status-desc" style={fontPontano}>
                      <strong>Upload Rule: </strong>
                      {canUploadIdNow
                        ? "You can upload an ID now."
                        : uploadBlockMessage || "ID upload is currently blocked."}
                    </p>
                  </div>
                </div>

                <div className="ltc-ai-card">
                  <div className="ltc-ai-header">
                    <div>
                      <p className="ltc-card-eyebrow" style={fontMontserrat}>
                        AI Pre-check
                      </p>

                      <h4 className="ltc-ai-title" style={fontMontserrat}>
                        AI ID Review
                      </h4>
                    </div>

                    <Badge label={aiBadge.label} className={aiBadge.className} />
                  </div>

                  <div className="ltc-ai-grid">
                    {aiStats.map((item) => (
                      <AiInfo key={item.title} title={item.title} value={item.value} />
                    ))}
                  </div>

                  <p className="ltc-ai-summary" style={fontPontano}>
                    {aiDisplay.aiSummary || "Upload your ID to run the AI pre-check."}
                  </p>

                  {aiDisplay.aiCheckedAt ? (
                    <p className="ltc-ai-summary" style={fontPoppins}>
                      Last checked: {new Date(aiDisplay.aiCheckedAt).toLocaleString()}
                    </p>
                  ) : null}

                  {aiDisplay.aiError ? (
                    <p className="ltc-ai-summary" style={{ ...fontPoppins, color: "#b42318" }}>
                      AI Error: {aiDisplay.aiError}
                    </p>
                  ) : null}
                </div>

                <div className="ltc-card-actions">
                  <button
                    type="button"
                    onClick={handleUploadId}
                    disabled={!canUploadIdNow || !idFile || idUploading}
                    className="ltc-primary-button"
                    style={fontMontserrat}
                  >
                    {uploadButtonText}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBotOpen(true)}
                    className="ltc-secondary-button"
                    style={fontMontserrat}
                  >
                    Ask Chatbot About ID
                  </button>
                </div>
              </DashboardCard>
            </section>
          </div>
        </div>
      </main>

      <Footer navigate={navigate} />

      {isOpen ? (
        <MobileMenu
          onClose={() => setIsOpen(false)}
          navigate={navigate}
          onSignOut={handleSignOut}
        />
      ) : null}

      <ProfileFaqBot
        isOpen={isBotOpen}
        onClose={() => setIsBotOpen(false)}
        navigate={navigate}
      />
    </div>
  );
};

function Header({ navigate, openMenu, onSignOut }) {
  return (
    <header className="ltc-header">
      <div className="ltc-container ltc-nav">
        <button
          type="button"
          onClick={() => navigate("/resort-venue")}
          className="ltc-logo"
          aria-label="Go to hotel home"
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
            <p style={fontPontano}>Resort, venue, hotel, and events booking services.</p>
          </div>
        </button>

        <nav className="ltc-desktop-nav" style={fontPoppins}>
          <NavButton label="Home" onClick={() => navigate("/resort-venue")} />
          <NavButton label="Virtual Tour" onClick={() => navigate("/virtual-tour")} />
          <NavButton label="Contact" onClick={() => navigate("/hotel-contact-us")} />
          <NavButton label="FAQs" onClick={() => navigate("/hotel-faqs")} />
          <NavButton active label="Profile" onClick={() => navigate("/hotel-profile")} />
          <NavButton label="Sign Out" onClick={onSignOut} className="ltc-signout-button" />
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

function AvatarPreview({
  src,
  initials,
  imageFailed,
  setImageFailed,
  setStatus,
}) {
  return (
    <div className="ltc-avatar">
      {src && !imageFailed ? (
        <img
          src={src}
          alt="Profile"
          onError={() => {
            setImageFailed(true);
            setStatus({
              type: "error",
              message: "Uploaded image could not be displayed.",
            });
          }}
        />
      ) : (
        <div className="ltc-avatar-fallback" style={fontMontserrat}>
          {initials}
        </div>
      )}
    </div>
  );
}

function DashboardCard({ eyebrow, title, action, children }) {
  return (
    <section className="ltc-dashboard-card">
      <div className="ltc-card-header">
        <div>
          <p className="ltc-card-eyebrow" style={fontMontserrat}>
            {eyebrow}
          </p>

          <h3 className="ltc-card-title" style={fontMontserrat}>
            {title}
          </h3>
        </div>

        {action ? <div>{action}</div> : null}
      </div>

      {children}
    </section>
  );
}

function ProfileField({ title, value }) {
  return (
    <div className="ltc-info-field">
      <p className="ltc-info-label" style={fontMontserrat}>
        {title}
      </p>

      <p className="ltc-info-value" style={fontPoppins}>
        {value}
      </p>
    </div>
  );
}

function AiInfo({ title, value }) {
  return (
    <div className="ltc-ai-box">
      <p className="ltc-ai-label" style={fontMontserrat}>
        {title}
      </p>

      <p className="ltc-ai-value" style={fontPoppins}>
        {value}
      </p>
    </div>
  );
}

function Badge({ label, className, dotClassName }) {
  const dotColor =
    dotClassName === "bg-emerald"
      ? "#10b981"
      : dotClassName === "bg-amber"
      ? "#f59e0b"
      : dotClassName === "bg-rose"
      ? "#ef4444"
      : "#98a2b3";

  return (
    <span className={`ltc-badge ${className}`} style={fontPoppins}>
      {dotClassName ? (
        <span className="ltc-badge-dot" style={{ background: dotColor }} />
      ) : null}
      {label}
    </span>
  );
}

function StatusBanner({ type, message }) {
  const className =
    type === "success"
      ? "ltc-status-success"
      : type === "info"
      ? "ltc-status-info"
      : "ltc-status-error";

  return (
    <div className={`ltc-status-banner ${className}`} style={fontPoppins}>
      {message}
    </div>
  );
}

function SideActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ltc-secondary-button"
      style={fontMontserrat}
    >
      {children}
    </button>
  );
}

function ProfileFaqBot({ isOpen, onClose, navigate }) {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Hi! I am your Hotel & Resort Chatbot. Ask me basic questions about booking, payment, ID verification, booking status, prices, password reset, FAQs, and recommendations.",
      matched: null,
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (textValue = input) => {
    const clean = String(textValue || "").trim();

    if (!clean) return;

    const reply = getBotReply(clean);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: clean, matched: null },
      { role: "bot", text: reply.answer, matched: reply.matched },
    ]);

    setInput("");
  };

  if (!isOpen) return null;

  return (
    <div className="ltc-chat-overlay">
      <div className="ltc-chat-panel">
        <div className="ltc-chat-head">
          <div className="ltc-chat-top">
            <div>
              <p style={fontMontserrat}>Basic Questions</p>
              <h3 style={fontMontserrat}>Hotel &amp; Resort Chatbot</h3>
            </div>

            <button type="button" onClick={onClose} className="ltc-chat-close" aria-label="Close chatbot">
              X
            </button>
          </div>
        </div>

        <div className="ltc-chat-body">
          {messages.map((message, index) => {
            const isBot = message.role === "bot";

            return (
              <div
                key={`${message.role}-${index}`}
                className={`ltc-chat-message ${isBot ? "bot" : "user"}`}
                style={fontPontano}
              >
                {message.text}

                {isBot && message.matched?.route ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(message.matched.route);
                    }}
                    className="ltc-chat-route"
                    style={fontMontserrat}
                  >
                    {message.matched.routeLabel || "Open Page"}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="ltc-chat-footer">
          <div className="ltc-quick-scroll">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="ltc-quick-button"
                style={fontPoppins}
              >
                {question}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="ltc-chat-form"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a basic hotel and resort question..."
              className="ltc-chat-input"
              style={fontPoppins}
            />

            <button type="submit" className="ltc-chat-send" style={fontMontserrat}>
              Send
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/hotel-faqs");
            }}
            className="ltc-view-faq"
            style={fontMontserrat}
          >
            View Complete FAQs
          </button>
        </div>
      </div>
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
              src={LUMISPIRE_LOGO}
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
          <FooterLink onClick={() => navigate("/hotel-profile")}>Profile</FooterLink>
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

function MobileMenu({ onClose, navigate, onSignOut }) {
  return (
    <div className="ltc-sidebar-overlay">
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <div className="ltc-sidebar-panel">
        <div className="ltc-sidebar-top">
          <p className="ltc-sidebar-title" style={fontPoppins}>
            MENU
          </p>

          <button onClick={onClose} className="ltc-sidebar-close" aria-label="Close menu" type="button">
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
          label="PROFILE"
          active
          onClick={() => {
            onClose();
            navigate("/hotel-profile");
          }}
        />

        <MenuItem
          label="SIGN OUT"
          onClick={() => {
            onClose();
            onSignOut();
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

export default HotelProfile;
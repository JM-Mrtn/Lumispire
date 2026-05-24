// src/TrainingAndAssessment/TraineeProfile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearTrainingSession,
  isTrainingAuthResponse,
  redirectToTraineeLogin,
} from "./trainingSession";
import { buildTrainingFileUrl } from "./trainingFileUrl";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";

  const r = String(raw).replace(/\/+$/, "");

  if (r.endsWith("/api/hotel")) {
    return r.replace(/\/api\/hotel$/i, "/api");
  }

  if (r.endsWith("/api")) return r;

  if (r.includes("/api/")) {
    return r.replace(/\/api\/hotel.*$/i, "/api");
  }

  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const API_ORIGIN = API_BASE.replace(/\/api$/i, "");

const TRAINING_CONTACT_INFO = {
  email1: "ltc.tamsi@gmail.com",
  email2: "lorengladis@ltcmultiservices.com",
  phone: "09959808051 / 09516281271",
  addressLine1: "2/F 5441 Curie Street,",
  addressLine2: "Palanan, Makati City",
};

const TRAINEE_NAV_ITEMS = [
  { key: "home", label: "Home", path: "/trainee-home" },
  { key: "roadmap", label: "Roadmap", path: "/trainee-roadmap" },
  { key: "attendance", label: "Attendance", path: "/trainee-attendance" },
  { key: "modules", label: "Modules", path: "/trainee-modules" },
  { key: "assignment", label: "Assignment", path: "/trainee-assignment" },
  { key: "progress", label: "Progress", path: "/trainee-progress" },
];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-trainee-home-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --panel: rgba(255,255,255,.92);
    --shadow-md: 0 18px 45px rgba(8,39,25,.12);
    --shadow-lg: 0 30px 70px rgba(8,39,25,.18);
    --radius: 24px;
    --ease: cubic-bezier(.22,1,.36,1);
    min-height: 100vh;
    color: var(--dark);
    background:
      radial-gradient(circle at 10% 4%, rgba(215,168,77,.13), transparent 28%),
      radial-gradient(circle at 92% 18%, rgba(35,95,62,.12), transparent 30%),
      linear-gradient(180deg,#f7fbf8 0%,#fff 48%,#f4faf6 100%);
    line-height: 1.65;
    letter-spacing: -.01em;
    overflow-x: hidden;
    font-family: "Inter", Arial, sans-serif;
  }

  .ltc-trainee-home-page * { box-sizing: border-box; }
  .ltc-trainee-home-page .hidden { display: none !important; }
  .ltc-container { width: min(1180px, 92%); margin: auto; }

  .ltc-header {
    position: sticky;
    top: 0;
    z-index: 50;
    width: 100%;
    background: var(--footer-green);
    border-bottom: 1px solid rgba(255,255,255,.1);
    box-shadow: 0 10px 34px rgba(7,31,20,.14);
    animation: ltcHeaderDrop .55s var(--ease) both;
  }

  .ltc-header .ltc-container {
    width: 100%;
    max-width: none;
    padding-left: 32px;
    padding-right: 32px;
  }

  .ltc-nav {
    min-height: 76px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 22px;
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
    transition: transform .28s var(--ease);
  }

  .ltc-logo:hover { transform: translateY(-2px) scale(1.01); }

  .ltc-logo-icon {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    background: white;
    object-fit: cover;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
    transition: transform .28s var(--ease), box-shadow .28s var(--ease);
  }

  .ltc-logo:hover .ltc-logo-icon {
    transform: scale(1.07) rotate(-2deg);
    box-shadow: 0 0 0 5px rgba(255,255,255,.12), 0 18px 34px rgba(0,0,0,.22);
  }

  .ltc-logo h1 {
    font-size: 18px;
    line-height: 1;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -.04em;
    margin: 0;
  }

  .ltc-logo p { font-size: 11px; color: rgba(255,255,255,.72); margin: 3px 0 0; }

  .ltc-desktop-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .ltc-profile-wrap { display: flex; align-items: center; gap: 12px; }

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

  .ltc-nav-link:hover, .ltc-nav-link.active {
    color: white;
    background: rgba(255,255,255,.13);
    transform: translateY(-1px);
  }

  .ltc-profile-button {
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 14px 28px rgba(215,168,77,.18);
  }

  .ltc-profile-button:hover {
    color: #102418;
    background: linear-gradient(135deg,#ffe6a1,#d7a84d);
    box-shadow: 0 18px 34px rgba(215,168,77,.28);
  }

  .ltc-profile-avatar {
    width: 42px;
    height: 42px;
    overflow: hidden;
    border-radius: 999px;
    border: 0;
    background: rgba(255,255,255,.9);
    cursor: pointer;
    padding: 0;
    box-shadow: 0 0 0 3px rgba(255,255,255,.1);
    transition: transform .28s var(--ease), box-shadow .28s var(--ease);
  }

  .ltc-profile-avatar:hover {
    transform: scale(1.07) rotate(-2deg);
    box-shadow: 0 0 0 5px rgba(255,255,255,.12), 0 18px 34px rgba(0,0,0,.22);
  }

  .ltc-avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .ltc-menu-button {
    display: none;
    border: 1px solid rgba(255,255,255,.16);
    background: rgba(255,255,255,.1);
    color: white;
    padding: 10px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: .25s var(--ease);
  }

  .ltc-menu-button:hover { background: rgba(255,255,255,.18); transform: translateY(-2px); }

  .ltc-mobile-sidebar {
    position: fixed;
    inset: 0;
    z-index: 80;
    pointer-events: none;
  }

  .ltc-mobile-sidebar.open { pointer-events: auto; }

  .ltc-sidebar-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(2,12,8,.56);
    opacity: 0;
    transition: .28s var(--ease);
  }

  .ltc-mobile-sidebar.open .ltc-sidebar-backdrop { opacity: 1; }

  .ltc-sidebar-panel {
    position: absolute;
    top: 0;
    right: 0;
    width: min(350px, 86vw);
    height: 100%;
    padding: 24px;
    background: var(--footer-green);
    transform: translateX(100%);
    transition: .34s var(--ease);
    box-shadow: -30px 0 80px rgba(0,0,0,.28);
    color: white;
  }

  .ltc-mobile-sidebar.open .ltc-sidebar-panel { transform: translateX(0); }

  .ltc-sidebar-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }

  .ltc-sidebar-close {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.16);
    background: rgba(255,255,255,.1);
    color: white;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    transition: .25s var(--ease);
  }

  .ltc-sidebar-close:hover { background: rgba(255,255,255,.18); transform: rotate(90deg); }

  .ltc-sidebar-links { display: grid; gap: 10px; margin-top: 30px; }

  .ltc-sidebar-link {
    border: 1px solid rgba(255,255,255,.1);
    background: rgba(255,255,255,.06);
    color: rgba(255,255,255,.82);
    padding: 13px 15px;
    border-radius: 18px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .08em;
    text-align: left;
    cursor: pointer;
    transition: .25s var(--ease);
  }

  .ltc-sidebar-link:hover, .ltc-sidebar-link.active {
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    transform: translateX(-4px);
  }

  .ltc-hero {
    position: relative;
    min-height: 260px;
    display: flex;
    align-items: center;
    overflow: hidden;
    background: linear-gradient(135deg, var(--green-950), var(--green-700));
    color: white;
  }

  .ltc-hero-slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .28;
    filter: saturate(.9) contrast(1.05);
  }

  .ltc-hero:after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 15% 28%, rgba(244,212,132,.25), transparent 26%),
      linear-gradient(90deg, rgba(7,31,20,.72), rgba(7,31,20,.72));
  }

  .ltc-hero-content { position: relative; z-index: 1; padding: 58px 0 64px; animation: ltcFadeUp .75s var(--ease) both; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }

  .ltc-hero-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(255,255,255,.11);
    padding: 8px 12px;
    color: rgba(255,255,255,.85);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .ltc-hero-title { margin: 0 auto; max-width: 760px; font-size: clamp(38px, 6vw, 70px); line-height: .95; font-weight: 900; letter-spacing: -.06em; text-align: center; }
  .ltc-hero-title span { color: var(--gold-soft); }
  .ltc-hero-text { max-width: 660px; margin: 18px auto 0; color: rgba(255,255,255,.82); font-size: clamp(15px, 1.6vw, 18px); font-weight: 500; text-align: center; }

  .ltc-profile-overview { padding: 32px 0 52px; }
  .ltc-profile-overview .ltc-container { width: min(1040px, 92%); }

  .ltc-profile-shell {
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
    box-shadow: 0 0 0 6px rgba(255,255,255,.14), 0 18px 38px rgba(0,0,0,.2);
    transition: transform .28s var(--ease), box-shadow .28s var(--ease);
  }

  .ltc-profile-card:hover .ltc-main-avatar {
    transform: translateY(-3px) scale(1.04);
    box-shadow: 0 0 0 7px rgba(255,255,255,.18), 0 22px 46px rgba(0,0,0,.24);
  }

  .ltc-profile-name { margin: 18px 0 0; font-size: 24px; line-height: 1.08; font-weight: 900; letter-spacing: -.04em; width: 100%; text-align: center; }
  .ltc-profile-email { margin: 8px auto 0; color: rgba(255,255,255,.82); font-size: 13px; font-weight: 700; overflow-wrap: anywhere; width: 100%; text-align: center; }

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
    grid-template-columns: repeat(3, minmax(0,1fr));
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
    margin-top: 24px;
    border-radius: 22px;
    background: #f8fbf9;
    border: 1px solid rgba(35,95,62,.1);
    padding: 22px;
    color: var(--green-800);
    font-weight: 900;
  }

  .ltc-footer {
    background: var(--footer-green);
    color: rgba(255,255,255,.76);
    margin-top: 0;
    width: 100%;
  }

  .ltc-footer .ltc-container {
    width: 100%;
    max-width: none;
    padding-left: 32px;
    padding-right: 32px;
  }

  .ltc-footer-grid {
    display: grid;
    grid-template-columns: 1.05fr .85fr 1.2fr 1fr .7fr;
    gap: 18px;
    padding: 18px 0 12px;
    align-items: start;
  }

  .ltc-footer-logo { display: flex; align-items: center; gap: 9px; color: white; }
  .ltc-footer-logo img { width: 32px; height: 32px; border-radius: 999px; background: white; object-fit: cover; }
  .ltc-footer-logo h2 { margin: 0; font-size: 15px; font-weight: 900; letter-spacing: -.04em; }
  .ltc-footer h3 { margin: 0 0 7px; color: white; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .1em; line-height: 1.15; }
  .ltc-footer p { margin: 0 0 3px; font-size: 11px; line-height: 1.35; color: rgba(255,255,255,.72); }
  .ltc-footer-link { display: block; border: 0; background: transparent; padding: 0; margin: 0 0 3px; color: rgba(255,255,255,.72); text-align: left; cursor: pointer; font-size: 11px; line-height: 1.25; font-weight: 700; transition: .25s var(--ease); }
  .ltc-footer-link:hover { color: var(--gold-soft); transform: translateX(4px); }
  .ltc-socials { display: flex; gap: 7px; }
  .ltc-socials span { width: 28px; height: 28px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,.1); color: white; font-size: 12px; font-weight: 900; transition: .25s var(--ease); }
  .ltc-socials span:hover { transform: translateY(-2px); background: var(--gold); color: #102418; }
  .ltc-footer-bottom { border-top: 1px solid rgba(255,255,255,.1); padding: 8px 0; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-size: 10px; line-height: 1.35; color: rgba(255,255,255,.56); }

  @keyframes ltcFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ltcHeaderDrop { from { opacity: 0; transform: translateY(-18px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 1100px) {
    .ltc-desktop-nav, .ltc-profile-wrap { display: none; }
    .ltc-menu-button { display: inline-flex; align-items: center; }
    .ltc-profile-header-row { grid-template-columns: 1fr; }
    .ltc-info-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
    .ltc-footer-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
  }

  @media (max-width: 720px) {
    .ltc-header .ltc-container { padding-left: 18px; padding-right: 18px; }
    .ltc-hero { min-height: 230px; }
    .ltc-hero-content { padding: 42px 0 48px; }
    .ltc-profile-overview { padding: 26px 0 44px; }
    .ltc-profile-shell { padding: 15px; border-radius: 24px; }
    .ltc-profile-card, .ltc-profile-info-panel { padding: 20px; border-radius: 22px; min-height: auto; }
    .ltc-info-grid, .ltc-action-row { grid-template-columns: 1fr; }
    .ltc-footer-grid { grid-template-columns: 1fr; gap: 12px; padding-top: 16px; padding-bottom: 10px; }
    .ltc-footer .ltc-container { padding-left: 18px; padding-right: 18px; }
  }
`;

function getToken() {
  return localStorage.getItem("trainingToken") || "";
}

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 180) || "Invalid server response.");
  }
}

function normalizeSlashes(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/");
}

function getObjectIdString(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    if (value.$oid) return String(value.$oid);

    if (value.toString && value.toString() !== "[object Object]") {
      return String(value.toString());
    }
  }

  return "";
}

function getFilePath(file) {
  if (!file) return "";

  if (typeof file === "string") {
    return normalizeSlashes(file);
  }

  if (typeof file === "object") {
    return normalizeSlashes(
      file.filePath ||
        file.path ||
        file.url ||
        file.secure_url ||
        file.location ||
        file.file ||
        ""
    );
  }

  return "";
}

function getFileId(file) {
  if (!file || typeof file !== "object") return "";
  return getObjectIdString(file.fileId);
}

function buildFileUrl(file) {
  const fileId = getFileId(file);

  if (fileId) {
    return buildTrainingFileUrl(fileId);
  }

  const filePath = getFilePath(file);

  if (!filePath) return "";

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const fileIdMatch = filePath.match(/(?:^|\/)api\/training-files\/([^/?#]+)/i);

  if (fileIdMatch?.[1]) {
    return buildTrainingFileUrl(fileIdMatch[1]);
  }

  return `${API_ORIGIN}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
}

function getFullName(user) {
  const direct =
    user?.fullName ||
    user?.name ||
    user?.traineeName ||
    user?.studentName ||
    "";

  if (direct) return direct;

  return [user?.firstName, user?.middleName, user?.lastName]
    .filter(Boolean)
    .join(" ");
}

function getPhoneNumber(user, enrollment) {
  return (
    user?.phoneNumber ||
    user?.phone ||
    user?.contactNumber ||
    enrollment?.phoneNumber ||
    enrollment?.phone ||
    "—"
  );
}

export default function TraineeProfile() {
  const navigate = useNavigate();
  const token = useMemo(() => getToken(), []);
  const fileInputRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trainingUser") || "null");
    } catch {
      return null;
    }
  });

  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchProfile = async () => {
    setMsg({ type: "", text: "" });

    if (!token) {
      redirectToTraineeLogin(navigate);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/training/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Failed to load profile.");
      }

      const fetchedUser = data?.user || null;
      const fetchedEnrollment = data?.enrollment || null;

      setUser(fetchedUser);
      setEnrollment(fetchedEnrollment);

      if (fetchedUser) {
        localStorage.setItem("trainingUser", JSON.stringify(fetchedUser));
      }
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to load profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const logout = () => {
    clearTrainingSession();
    navigate("/trainee-login", { replace: true });
  };

  const fullName = getFullName(user) || "Trainee Full Name";
  const profilePhotoUrl = buildFileUrl(user?.profilePhoto);

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    if (!token) {
      e.target.value = "";
      redirectToTraineeLogin(navigate);
      return;
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      setMsg({
        type: "error",
        text: "Only JPG, JPEG, PNG, and WEBP files are allowed.",
      });
      e.target.value = "";
      return;
    }

    try {
      setUploadingPhoto(true);
      setMsg({ type: "", text: "" });

      const formData = new FormData();
      formData.append("profilePhoto", file);

      const res = await fetch(`${API_BASE}/training/profile/photo`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Failed to upload profile photo.");
      }

      const nextUser = data?.user || null;

      if (nextUser) {
        setUser(nextUser);
        localStorage.setItem("trainingUser", JSON.stringify(nextUser));
      }

      setMsg({
        type: "success",
        text: data?.message || "Profile photo uploaded successfully.",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to upload profile photo.",
      });
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  return (
    <div className="ltc-trainee-home-page">
      <style>{pageStyles}</style>

      <Header
        goTo={goTo}
        profilePhotoUrl={profilePhotoUrl}
        onOpenMenu={() => setMobileOpen(true)}
        activeKey="profile"
      />

      <MobileSidebar
        open={mobileOpen}
        goTo={goTo}
        onClose={() => setMobileOpen(false)}
        activeKey="profile"
      />

      <main>
        <section className="ltc-hero">
          <img
            src="/TrainingBanner.png"
            alt="TAMSI Training Banner"
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
              Review your trainee information, update your profile photo, and manage your account access.
            </p>
          </div>
        </section>

        <section className="ltc-profile-overview">
          <div className="ltc-container">
            {msg.text ? (
              <div
                className={`ltc-alert ${
                  msg.type === "success" ? "ltc-alert-success" : "ltc-alert-error"
                }`}
              >
                {msg.text}
              </div>
            ) : null}

            <div className="ltc-profile-shell">
              <div className="ltc-profile-header-row">
                <aside className="ltc-profile-card">
                  <div className="ltc-main-avatar">
                    <ProfileAvatar profilePhotoUrl={profilePhotoUrl} large />
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  <h2 className="ltc-profile-name" style={fontMontserrat}>
                    {fullName}
                  </h2>
                  <p className="ltc-profile-email" style={fontPontano}>
                    {user?.email || "traineeemail@tamsi.com"}
                  </p>

                  <button
                    type="button"
                    onClick={handleChoosePhoto}
                    disabled={uploadingPhoto}
                    className="ltc-photo-button"
                    style={fontMontserrat}
                  >
                    {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                  </button>
                </aside>

                <section className="ltc-profile-info-panel">
                  <p className="ltc-section-eyebrow" style={fontPoppins}>
                    Profile Overview
                  </p>
                  <h2 className="ltc-section-title" style={fontMontserrat}>
                    Personal Information
                  </h2>

                  {loading ? (
                    <div className="ltc-loading-card">Loading profile...</div>
                  ) : (
                    <>
                      <div className="ltc-info-grid">
                        <InfoCard label="First Name" value={user?.firstName || "—"} delay={0} />
                        <InfoCard label="Last Name" value={user?.lastName || "—"} delay={70} />
                        <InfoCard label="Middle Name" value={user?.middleName || "—"} delay={140} />
                        <InfoCard label="Email Address" value={user?.email || "—"} delay={210} />
                        <InfoCard label="Contact Number" value={getPhoneNumber(user, enrollment)} delay={280} />
                        <InfoCard label="Course" value={user?.course || enrollment?.course || "—"} delay={350} />
                      </div>

                      <div className="ltc-action-row">
                        <button
                          type="button"
                          onClick={() => goTo("/training-change-password")}
                          className="ltc-action-button light"
                          style={fontMontserrat}
                        >
                          Change Password
                        </button>

                        <button
                          type="button"
                          onClick={() => goTo("/trainee-certificate")}
                          className="ltc-action-button"
                          style={fontMontserrat}
                        >
                          Certificate
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
                    </>
                  )}
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer goTo={goTo} />
    </div>
  );
}

function Header({ goTo, profilePhotoUrl, onOpenMenu, activeKey }) {
  return (
    <header className="ltc-header">
      <div className="ltc-container">
        <nav className="ltc-nav">
          <button
            type="button"
            className="ltc-logo"
            onClick={() => goTo("/trainee-home")}
            aria-label="TAMSI Trainee Home"
          >
            <img
              src="/TamsiLogo.png"
              alt="TAMSI Logo"
              className="ltc-logo-icon"
              onError={(event) => {
                event.currentTarget.src =
                  "https://placehold.co/80x80/ffffff/45674b?text=T";
              }}
            />
            <span>
              <h1 style={fontMontserrat}>TAMSI</h1>
              <p style={fontPontano}>Training And Assessment</p>
            </span>
          </button>

          <div className="ltc-desktop-nav">
            {TRAINEE_NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => goTo(item.path)}
                className={`ltc-nav-link ${activeKey === item.key ? "active" : ""}`}
                style={fontPoppins}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="ltc-profile-wrap">
            <button
              type="button"
              onClick={() => goTo("/trainee-profile")}
              className={`ltc-nav-link ltc-profile-button ${
                activeKey === "profile" ? "active" : ""
              }`}
              style={fontPoppins}
            >
              Profile
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-profile")}
              className="ltc-profile-avatar"
              aria-label="Profile"
            >
              <ProfileAvatar profilePhotoUrl={profilePhotoUrl} />
            </button>
          </div>

          <button type="button" onClick={onOpenMenu} className="ltc-menu-button">
            Menu
          </button>
        </nav>
      </div>
    </header>
  );
}

function MobileSidebar({ open, goTo, onClose, activeKey }) {
  const items = [
    ...TRAINEE_NAV_ITEMS,
    { key: "profile", label: "Profile", path: "/trainee-profile" },
  ];

  return (
    <div className={`ltc-mobile-sidebar ${open ? "open" : ""}`}>
      <button
        type="button"
        className="ltc-sidebar-backdrop"
        onClick={onClose}
        aria-label="Close menu"
      />

      <aside className="ltc-sidebar-panel">
        <div className="ltc-sidebar-top">
          <div className="ltc-logo">
            <img
              src="/TamsiLogo.png"
              alt="TAMSI Logo"
              className="ltc-logo-icon"
              onError={(event) => {
                event.currentTarget.src =
                  "https://placehold.co/80x80/ffffff/45674b?text=T";
              }}
            />
            <span>
              <h1 style={fontMontserrat}>TAMSI</h1>
              <p style={fontPontano}>Trainee Menu</p>
            </span>
          </div>

          <button type="button" className="ltc-sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="ltc-sidebar-links">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => goTo(item.path)}
              className={`ltc-sidebar-link ${activeKey === item.key ? "active" : ""}`}
              style={fontPoppins}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Footer({ goTo }) {
  return (
    <footer className="ltc-footer">
      <div className="ltc-container">
        <div className="ltc-footer-grid">
          <div>
            <div className="ltc-footer-logo">
              <img
                src="/TamsiLogo.png"
                alt="TAMSI Logo"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://placehold.co/80x80/ffffff/45674b?text=T";
                }}
              />
              <h2 style={fontMontserrat}>TAMSI</h2>
            </div>
          </div>

          <div>
            <h3 style={fontMontserrat}>Menu</h3>
            {TRAINEE_NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => goTo(item.path)}
                className="ltc-footer-link"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div>
            <h3 style={fontMontserrat}>Contact Information</h3>
            <p>{TRAINING_CONTACT_INFO.email1}</p>
            <p>{TRAINING_CONTACT_INFO.email2}</p>
            <p>{TRAINING_CONTACT_INFO.phone}</p>
          </div>

          <div>
            <h3 style={fontMontserrat}>Address</h3>
            <p>{TRAINING_CONTACT_INFO.addressLine1}</p>
            <p>{TRAINING_CONTACT_INFO.addressLine2}</p>
          </div>

          <div>
            <h3 style={fontMontserrat}>Follow Us</h3>
            <div className="ltc-socials">
              <span>f</span>
              <span>in</span>
            </div>
          </div>
        </div>

        <div className="ltc-footer-bottom">
          <span>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span>Developed by CRMS Tech Alliance</span>
        </div>
      </div>
    </footer>
  );
}

function InfoCard({ label, value, delay = 0 }) {
  return (
    <article className="ltc-info-card" style={{ animationDelay: `${delay}ms` }}>
      <p className="ltc-info-label" style={fontPoppins}>{label}</p>
      <p className="ltc-info-value" style={fontMontserrat}>{value || "—"}</p>
    </article>
  );
}

function ProfileAvatar({ profilePhotoUrl, large = false }) {
  const fallback = large
    ? "https://placehold.co/240x240/ffffff/45674b?text=P"
    : "https://placehold.co/80x80/d7ddd4/45674b?text=P";

  return (
    <img
      src={profilePhotoUrl || fallback}
      alt="Profile"
      className="ltc-avatar-img"
      onError={(e) => {
        e.currentTarget.src = fallback;
      }}
    />
  );
}

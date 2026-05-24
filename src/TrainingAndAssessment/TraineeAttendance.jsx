// src/TrainingAndAssessment/TraineeAttendance.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
    --glass: rgba(255,255,255,.84);
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

  .ltc-trainee-home-page * { box-sizing: border-box; }
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
    margin-left: auto;
  }

  .ltc-profile-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
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

  .ltc-profile-avatar {
    width: 42px;
    height: 42px;
    overflow: hidden;
    border-radius: 999px;
    border: 0;
    background: rgba(255,255,255,.9);
    cursor: pointer;
    padding: 0;
    box-shadow: 0 0 0 4px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.14);
  }

  .ltc-profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .ltc-menu-button {
    display: none;
    color: white;
    border: 0;
    background: rgba(255,255,255,.1);
    border-radius: 12px;
    padding: 10px;
    cursor: pointer;
  }

  .ltc-menu-button svg { width: 24px; height: 24px; }

  .ltc-hero {
    position: relative;
    overflow: hidden;
    color: white;
    isolation: isolate;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
    padding: 92px 0 86px;
  }

  .ltc-hero-slide {
    position: absolute;
    inset: 0;
    z-index: -4;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .34;
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
      radial-gradient(circle at 88% 44%, rgba(244,212,132,.14), transparent 28%),
      radial-gradient(circle at 90% 84%, rgba(22,108,66,.30), transparent 26%);
    filter: blur(30px);
    pointer-events: none;
  }

  .ltc-hero-content {
    position: relative;
    z-index: 2;
    max-width: 980px;
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
    font-size: clamp(38px, 6vw, 76px);
    line-height: 1.05;
    font-weight: 900;
    letter-spacing: -.055em;
    text-shadow: 0 8px 26px rgba(0,0,0,.22);
  }

  .ltc-hero-title span { color: var(--gold-soft); }

  .ltc-hero-text {
    max-width: 760px;
    margin: 18px auto 0;
    color: rgba(255,255,255,.82);
    font-size: 17px;
    line-height: 1.8;
  }

  .ltc-section { padding: 74px 0; }

  .ltc-home-shell {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius);
    background: var(--glass);
    border: 1px solid rgba(255,255,255,.76);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
    padding: 34px;
  }

  .ltc-home-shell::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 6px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
    z-index: 3;
  }

  .ltc-home-shell:hover {
    box-shadow: var(--shadow-lg);
    border-color: rgba(215,168,77,.45);
  }

  .ltc-section-heading {
    margin: 0;
    color: var(--green-950);
    font-size: clamp(28px,3vw,42px);
    line-height: 1.08;
    letter-spacing: -.05em;
    font-weight: 900;
  }

  .ltc-section-line {
    margin-top: 12px;
    width: 180px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
  }

  .ltc-section-intro {
    max-width: 760px;
    margin: 16px 0 0;
    color: var(--muted);
    font-size: 15px;
    font-weight: 700;
  }

  .ltc-quick-grid {
    margin-top: 32px;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 18px;
  }

  .ltc-quick-card {
    position: relative;
    overflow: hidden;
    min-height: 238px;
    border: 1px solid rgba(35,95,62,.12);
    border-radius: 22px;
    background: white;
    padding: 24px 18px;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 16px 34px rgba(8,39,25,.08);
    transition: .25s var(--ease);
  }

  .ltc-quick-card::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 5px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
    opacity: .92;
  }

  .ltc-quick-card:hover {
    transform: translateY(-6px);
    border-color: rgba(215,168,77,.55);
    box-shadow: 0 22px 44px rgba(8,39,25,.14);
  }

  .ltc-icon-frame {
    display: grid;
    place-items: center;
    width: 88px;
    height: 88px;
    margin: 0 auto;
    border-radius: 26px;
    color: var(--green-800);
    background: rgba(35,95,62,.08);
    box-shadow: inset 0 0 0 1px rgba(35,95,62,.08);
  }

  .ltc-icon-frame svg { width: 58px; height: 58px; }

  .ltc-quick-title {
    margin: 18px 0 0;
    color: var(--green-950);
    font-size: 19px;
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: -.03em;
  }

  .ltc-card-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 130px;
    min-height: 42px;
    margin-top: 22px;
    border-radius: 999px;
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 14px 28px rgba(215,168,77,.18);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .1em;
    text-transform: uppercase;
    transition: .25s var(--ease);
  }

  .ltc-quick-card:hover .ltc-card-action {
    transform: translateY(-2px);
    background: linear-gradient(135deg,#f7dc93,#c99634);
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
    background: white;
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

  .ltc-footer-link:hover { color: white; text-decoration: underline; }
  .ltc-socials { display: flex; gap: 8px; }
  .ltc-socials span { width: 26px; height: 26px; border-radius: 999px; background: rgba(255,255,255,.13); }

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

  .ltc-sidebar-overlay { position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,.42); }
  .ltc-sidebar-panel { position: absolute; right: 0; top: 0; height: 100%; width: min(310px,86vw); background: white; box-shadow: -20px 0 60px rgba(0,0,0,.25); padding: 20px; }
  .ltc-sidebar-top { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(16,24,40,.1); padding-bottom: 16px; margin-bottom: 16px; }
  .ltc-sidebar-title { color: var(--green-950); font-weight: 900; letter-spacing: .14em; font-size: 12px; margin: 0; }
  .ltc-sidebar-close { width: 38px; height: 38px; border-radius: 12px; border: 0; background: #f2f4f7; color: #101828; cursor: pointer; }
  .ltc-sidebar-link { display: block; width: 100%; border: 0; background: transparent; color: #101828; text-align: left; border-radius: 14px; padding: 13px 14px; font-weight: 800; margin-bottom: 8px; cursor: pointer; }
  .ltc-sidebar-link:hover,
  .ltc-sidebar-link.active { background: var(--green-800); color: white; }

  @media (max-width: 1180px) {
    .ltc-quick-grid { grid-template-columns: repeat(3, minmax(0,1fr)); }
    .ltc-footer-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 900px) {
    .ltc-header .ltc-container { padding-left: 22px; padding-right: 22px; }
    .ltc-nav { min-height: auto; padding: 18px 0; }
    .ltc-desktop-nav,
    .ltc-profile-wrap { display: none; }
    .ltc-menu-button { display: grid; place-items: center; }
    .ltc-hero { padding: 76px 0 74px; }
    .ltc-section { padding: 58px 0; }
    .ltc-home-shell { padding: 28px 22px; }
    .ltc-quick-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
    .ltc-footer { padding: 28px 0 12px; }
    .ltc-footer-grid { grid-template-columns: 1fr; gap: 18px; padding-bottom: 22px; }
    .ltc-footer .ltc-container { padding-left: 22px; padding-right: 22px; }
    .ltc-copyright { flex-direction: column; }
  }

  @media (max-width: 600px) {
    .ltc-header .ltc-container,
    .ltc-footer .ltc-container { padding-left: 16px; padding-right: 16px; }
    .ltc-logo h1 { font-size: 14px; }
    .ltc-logo p { font-size: 10px; }
    .ltc-hero-title { font-size: clamp(34px, 11vw, 46px); letter-spacing: -.045em; }
    .ltc-hero-text { font-size: 15px; }
    .ltc-home-shell { padding: 26px 18px; }
    .ltc-quick-grid { grid-template-columns: 1fr; }
  }


  .ltc-attendance-overview {
    padding: 54px 0 30px;
  }

  .ltc-attendance-panel {
    border: 1px solid rgba(8, 39, 25, .1);
    border-radius: 30px;
    background: rgba(255, 255, 255, .88);
    box-shadow: var(--shadow-md);
    padding: 30px;
    overflow: hidden;
    position: relative;
  }

  .ltc-attendance-panel::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 0% 0%, rgba(215,168,77,.18), transparent 30%),
      radial-gradient(circle at 100% 0%, rgba(35,95,62,.12), transparent 34%);
    pointer-events: none;
  }

  .ltc-attendance-header-row {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 24px;
  }

  .ltc-attendance-title {
    margin: 0;
    color: var(--green-800);
    font-size: clamp(30px, 4vw, 48px);
    line-height: 1;
    font-weight: 900;
    letter-spacing: -.05em;
  }

  .ltc-attendance-subtitle {
    max-width: 700px;
    margin: 12px 0 0;
    color: #6f8173;
    font-size: 16px;
    font-weight: 700;
  }

  .ltc-trainee-card {
    min-width: min(360px, 100%);
    border: 1px solid rgba(35,95,62,.12);
    border-radius: 24px;
    background: rgba(255,255,255,.86);
    padding: 18px 20px;
    box-shadow: 0 18px 40px rgba(8,39,25,.08);
  }

  .ltc-trainee-label {
    margin: 0;
    color: var(--gold);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .ltc-trainee-name {
    margin: 5px 0 0;
    color: var(--green-800);
    font-size: 18px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .ltc-trainee-email {
    margin: 2px 0 0;
    color: #738278;
    font-size: 12px;
    font-weight: 700;
  }

  .ltc-filter-grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 28px;
  }

  .ltc-filter-btn {
    border: 1px solid rgba(35,95,62,.16);
    border-radius: 20px;
    background: linear-gradient(180deg,#ffffff,#f6faf7);
    color: var(--green-800);
    min-height: 84px;
    padding: 16px;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 12px 28px rgba(8,39,25,.07);
    transition: .28s var(--ease);
  }

  .ltc-filter-btn:hover,
  .ltc-filter-btn.active {
    transform: translateY(-4px);
    border-color: rgba(215,168,77,.55);
    background: linear-gradient(135deg,#ffffff 0%,#fff8e7 100%);
    box-shadow: 0 22px 44px rgba(8,39,25,.13);
  }

  .ltc-filter-label {
    display: block;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .ltc-filter-count {
    display: block;
    margin-top: 5px;
    font-size: 26px;
    font-weight: 900;
    color: var(--gold);
  }

  .ltc-attendance-list-section {
    padding: 34px 0 72px;
  }

  .ltc-alert {
    border-radius: 18px;
    padding: 14px 16px;
    margin-bottom: 18px;
    font-size: 14px;
    font-weight: 800;
    box-shadow: 0 12px 26px rgba(8,39,25,.08);
  }

  .ltc-alert-success {
    background: #ecfdf3;
    color: #067647;
    border: 1px solid #abefc6;
  }

  .ltc-alert-error {
    background: #fef3f2;
    color: #b42318;
    border: 1px solid #fecdca;
  }

  .ltc-empty-state {
    border: 1px solid rgba(35,95,62,.12);
    border-radius: 24px;
    background: white;
    padding: 30px;
    color: var(--green-800);
    font-size: 15px;
    font-weight: 800;
    box-shadow: var(--shadow-md);
  }

  .ltc-attendance-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
  }

  .ltc-attendance-card {
    display: flex;
    flex-direction: column;
    min-height: 285px;
    border: 1px solid rgba(35,95,62,.13);
    border-radius: 28px;
    background: rgba(255,255,255,.92);
    color: var(--green-800);
    padding: 24px;
    box-shadow: 0 18px 48px rgba(8,39,25,.10);
    transition: .32s var(--ease);
    animation: ltcFadeUp .65s var(--ease) both;
  }

  .ltc-attendance-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 30px 70px rgba(8,39,25,.16);
    border-color: rgba(215,168,77,.48);
  }

  .ltc-card-top {
    display: flex;
    gap: 15px;
    align-items: flex-start;
  }

  .ltc-attendance-icon {
    width: 62px;
    height: 62px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(215,168,77,.22), rgba(35,95,62,.10));
    color: var(--green-700);
  }

  .ltc-attendance-icon svg {
    width: 45px;
    height: 45px;
  }

  .ltc-card-title {
    margin: 0;
    color: var(--green-800);
    font-size: 22px;
    line-height: 1;
    font-weight: 900;
    text-transform: uppercase;
  }

  .ltc-card-date {
    margin: 8px 0 0;
    color: var(--green-700);
    font-size: 14px;
    font-weight: 900;
  }

  .ltc-card-due {
    margin: 4px 0 0;
    color: #708476;
    font-size: 12px;
    font-weight: 800;
  }

  .ltc-badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 18px;
  }

  .ltc-status-badge,
  .ltc-proof-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 7px 11px;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .06em;
    text-decoration: none;
  }

  .ltc-status-badge {
    border: 1px solid rgba(35,95,62,.14);
    background: #f5faf7;
    color: var(--green-700);
  }

  .ltc-status-badge.bg-green-50 { background: #ecfdf3; color: #067647; border-color: #abefc6; }
  .ltc-status-badge.bg-red-50 { background: #fef3f2; color: #b42318; border-color: #fecdca; }
  .ltc-status-badge.bg-yellow-50 { background: #fffaeb; color: #b54708; border-color: #fedf89; }

  .ltc-proof-link {
    background: #f7f3e7;
    color: #94670c;
    border: 1px solid rgba(215,168,77,.35);
    transition: .25s var(--ease);
  }

  .ltc-proof-link:hover {
    transform: translateY(-2px);
    background: #fff3cf;
  }

  .ltc-card-action-row {
    margin-top: auto;
    padding-top: 22px;
  }

  .ltc-action-button {
    width: 100%;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(135deg,var(--green-800),var(--green-700));
    color: white;
    padding: 13px 18px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .1em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 14px 28px rgba(35,95,62,.2);
    transition: .25s var(--ease);
  }

  .ltc-action-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(35,95,62,.28);
    background: linear-gradient(135deg,var(--gold),#b98421);
  }

  @keyframes ltcFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 1100px) {
    .ltc-attendance-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ltc-attendance-header-row { grid-template-columns: 1fr; }
    .ltc-trainee-card { min-width: 0; }
  }

  @media (max-width: 760px) {
    .ltc-attendance-panel { padding: 24px 18px; }
    .ltc-filter-grid { grid-template-columns: 1fr; }
    .ltc-attendance-grid { grid-template-columns: 1fr; }
  }
`;

function authHeaders(extra = {}) {
  const token = localStorage.getItem("trainingToken") || "";

  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  };
}

function buildProtectedFileUrl(fileId = "") {
  const token = localStorage.getItem("trainingToken") || "";

  if (!fileId) return "#";

  if (!token) {
    return `${API_BASE}/files/${fileId}`;
  }

  return `${API_BASE}/files/${fileId}?token=${encodeURIComponent(token)}`;
}

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || "Invalid server response.");
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

function formatDateTime(value) {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCardDate(value) {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return value;
  }

  return d.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatCardTime(value) {
  if (!value) return "9AM";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "9AM";

  return d.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
  });
}

function badgeClass(status) {
  const s = String(status || "").toLowerCase();

  if (s === "approved" || s === "present" || s === "open") {
    return "bg-green-50 text-green-700 ring-green-200";
  }

  if (s === "rejected" || s === "absent" || s === "closed") {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  if (s === "late" || s === "not_open" || s === "pending") {
    return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  }

  return "bg-[#eef1e7] text-[#395345] ring-[#d9dfd2]";
}

function windowLabel(windowStatus) {
  if (windowStatus === "not_open") return "Not open yet";
  if (windowStatus === "closed") return "Closed";
  return "Open";
}

function getTimeValue(value) {
  if (!value) return 0;

  const t = new Date(value).getTime();

  return Number.isNaN(t) ? 0 : t;
}

function getRowSortTime(row) {
  return (
    getTimeValue(row?.createdAt) ||
    getTimeValue(row?.uploadOpenAt) ||
    getTimeValue(row?.attendanceDate)
  );
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("trainingUser") || "null");
  } catch {
    return null;
  }
}

function getFullName(user) {
  const direct =
    user?.fullName ||
    user?.name ||
    user?.traineeName ||
    user?.studentName ||
    "";

  if (direct) return direct;

  const firstName = user?.firstName || "";
  const middleName = user?.middleName || "";
  const lastName = user?.lastName || "";

  return [firstName, middleName, lastName].filter(Boolean).join(" ");
}

function getEmail(user) {
  return user?.email || user?.traineeEmail || user?.studentEmail || "";
}

function getAttendanceBucket(row) {
  const hasProof = Boolean(row?.proofFileId);
  const proofReview = String(row?.proofReviewStatus || "pending").toLowerCase();
  const windowStatus = String(row?.windowStatus || "open").toLowerCase();

  if (
    proofReview === "approved" ||
    proofReview === "present" ||
    row?.status === "approved" ||
    row?.status === "present"
  ) {
    return "completed";
  }

  if (windowStatus === "closed" && !hasProof) {
    return "past_due";
  }

  if (hasProof) {
    return "completed";
  }

  return "upcoming";
}

export default function TraineeAttendance() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [notesById, setNotesById] = useState({});
  const [filesById, setFilesById] = useState({});
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [selectedRow, setSelectedRow] = useState(null);
  const [user, setUser] = useState(() => getStoredUser());

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => getRowSortTime(b) - getRowSortTime(a));
  }, [rows]);

  const filteredRows = useMemo(() => {
    return sortedRows.filter((row) => getAttendanceBucket(row) === activeFilter);
  }, [sortedRows, activeFilter]);

  const counts = useMemo(() => {
    return sortedRows.reduce(
      (acc, row) => {
        acc[getAttendanceBucket(row)] += 1;
        return acc;
      },
      {
        upcoming: 0,
        past_due: 0,
        completed: 0,
      }
    );
  }, [sortedRows]);

  const traineeName = getFullName(user) || "Trainee Full Name";
  const traineeEmail = getEmail(user) || "traineeemail@tamsi.com";
  const profilePhotoUrl = buildFileUrl(user?.profilePhoto);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const goToProfile = () => {
    const token = localStorage.getItem("trainingToken");
    goTo(token ? "/trainee-profile" : "/trainee-login");
  };

  async function loadAttendance() {
    const token = localStorage.getItem("trainingToken") || "";

    if (!token) {
      redirectToTraineeLogin(navigate);
      return;
    }

    try {
      setLoading(true);
      setErr("");

      const savedUser = getStoredUser();

      if (savedUser) {
        setUser(savedUser);
      }

      const res = await fetch(`${API_BASE}/training/attendance`, {
        headers: authHeaders(),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Failed to load attendance.");
      }

      const nextRows = Array.isArray(data?.attendance) ? data.attendance : [];

      setRows(nextRows);

      if (data?.user || data?.trainee) {
        const nextUser = data.user || data.trainee;
        setUser(nextUser);
        localStorage.setItem("trainingUser", JSON.stringify(nextUser));
      }

      setNotesById((prev) => {
        const next = { ...prev };

        for (const row of nextRows) {
          if (typeof next[row.id] === "undefined") {
            next[row.id] = "";
          }
        }

        return next;
      });
    } catch (error) {
      setErr(error.message || "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttendance();
  }, []);

  function setNote(id, value) {
    setNotesById((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  function setFile(id, file) {
    setFilesById((prev) => ({
      ...prev,
      [id]: file || null,
    }));
  }

  async function submitProof(attendanceId) {
    try {
      setSubmittingId(attendanceId);
      setMsg("");
      setErr("");

      const proofFile = filesById[attendanceId];

      if (!proofFile) {
        throw new Error("Please choose a proof file first.");
      }

      const formData = new FormData();

      formData.append("attendanceId", attendanceId);
      formData.append("traineeProofNote", notesById[attendanceId] || "");
      formData.append("proofFile", proofFile);

      const res = await fetch(`${API_BASE}/training/attendance/proof`, {
        method: "POST",
        headers: authHeaders(),
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

        throw new Error(data?.message || "Upload failed.");
      }

      setMsg(data?.message || "Attendance proof uploaded successfully.");

      setFilesById((prev) => ({
        ...prev,
        [attendanceId]: null,
      }));

      setNotesById((prev) => ({
        ...prev,
        [attendanceId]: "",
      }));

      const fileInput = document.getElementById(
        `attendance-proof-file-${attendanceId}`
      );

      if (fileInput) fileInput.value = "";

      setSelectedRow(null);
      await loadAttendance();
    } catch (error) {
      setErr(error.message || "Failed to upload attendance proof.");
    } finally {
      setSubmittingId("");
    }
  }

  return (
    <div className="ltc-trainee-home-page">
      <style>{pageStyles}</style>

      <Header
        goTo={goTo}
        goToProfile={goToProfile}
        profilePhotoUrl={profilePhotoUrl}
        onOpenMenu={() => setMobileOpen(true)}
        activeKey="attendance"
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
            <h2 className="ltc-hero-title" style={fontMontserrat}>
              Attendance <span>Submission</span>
            </h2>
            <p className="ltc-hero-text" style={fontPontano}>
              View your attendance records, check upload windows, and submit attendance proof for professor review.
            </p>
          </div>
        </section>

        <section className="ltc-attendance-overview">
          <div className="ltc-container">
            <div className="ltc-attendance-panel">
              <div className="ltc-attendance-header-row">
                <div>
                  <h1 className="ltc-attendance-title" style={fontMontserrat}>
                    My Attendance
                  </h1>
                  <p className="ltc-attendance-subtitle" style={fontPoppins}>
                    Choose a status below to review your attendance list and upload proof when the submission window is open.
                  </p>
                </div>

                <div className="ltc-trainee-card">
                  <p className="ltc-trainee-label" style={fontPoppins}>Trainee</p>
                  <h2 className="ltc-trainee-name" style={fontMontserrat}>{traineeName}</h2>
                  <p className="ltc-trainee-email" style={fontPontano}>{traineeEmail}</p>
                </div>
              </div>

              <div className="ltc-filter-grid">
                <FilterButton
                  active={activeFilter === "upcoming"}
                  label="Upcoming"
                  count={counts.upcoming}
                  onClick={() => setActiveFilter("upcoming")}
                />

                <FilterButton
                  active={activeFilter === "past_due"}
                  label="Past Due"
                  count={counts.past_due}
                  onClick={() => setActiveFilter("past_due")}
                />

                <FilterButton
                  active={activeFilter === "completed"}
                  label="Completed"
                  count={counts.completed}
                  onClick={() => setActiveFilter("completed")}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="ltc-attendance-list-section">
          <div className="ltc-container">
            {msg ? <div className="ltc-alert ltc-alert-success">{msg}</div> : null}
            {err ? <div className="ltc-alert ltc-alert-error">{err}</div> : null}

            {loading ? (
              <div className="ltc-empty-state">Loading attendance records...</div>
            ) : filteredRows.length === 0 ? (
              <div className="ltc-empty-state">
                No {activeFilter.replace("_", " ")} attendance records.
              </div>
            ) : (
              <div className="ltc-attendance-grid">
                {filteredRows.map((row, index) => {
                  const hasProof = Boolean(row.proofFileId);
                  const proofReview = String(
                    row.proofReviewStatus || "pending"
                  ).toLowerCase();
                  const windowStatus = String(
                    row.windowStatus || "open"
                  ).toLowerCase();

                  const canSubmit =
                    row.canUpload &&
                    proofReview !== "approved" &&
                    windowStatus !== "closed";

                  return (
                    <article
                      key={row.id}
                      className="ltc-attendance-card"
                      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
                    >
                      <div className="ltc-card-top">
                        <span className="ltc-attendance-icon">
                          <PaperIcon />
                        </span>

                        <div>
                          <h2 className="ltc-card-title" style={fontMontserrat}>
                            Attendance
                          </h2>
                          <p className="ltc-card-date" style={fontPoppins}>
                            {formatCardDate(row.attendanceDate || row.createdAt)}
                          </p>
                          <p className="ltc-card-due" style={fontPontano}>
                            Due today {formatCardTime(row.uploadCloseAt)}
                          </p>
                        </div>
                      </div>

                      <div className="ltc-badge-row">
                        <span className={`ltc-status-badge ${badgeClass(proofReview)}`}>
                          {proofReview}
                        </span>

                        {hasProof ? (
                          <a
                            href={buildProtectedFileUrl(row.proofFileId)}
                            target="_blank"
                            rel="noreferrer"
                            className="ltc-proof-link"
                          >
                            View Proof
                          </a>
                        ) : null}
                      </div>

                      <div className="ltc-card-action-row">
                        <button
                          type="button"
                          onClick={() => setSelectedRow(row)}
                          className="ltc-action-button"
                          style={fontMontserrat}
                        >
                          {canSubmit ? "Submit" : "View"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <AttendanceModal
        row={selectedRow}
        note={selectedRow ? notesById[selectedRow.id] ?? "" : ""}
        file={selectedRow ? filesById[selectedRow.id] : null}
        submitting={selectedRow ? submittingId === selectedRow.id : false}
        onClose={() => setSelectedRow(null)}
        onNoteChange={(value) => selectedRow && setNote(selectedRow.id, value)}
        onFileChange={(file) => selectedRow && setFile(selectedRow.id, file)}
        onSubmit={() => selectedRow && submitProof(selectedRow.id)}
      />

      <Footer goTo={goTo} />

      {mobileOpen ? (
        <MobileMenu
          onClose={() => setMobileOpen(false)}
          goTo={goTo}
          goToProfile={goToProfile}
          activeKey="attendance"
        />
      ) : null}
    </div>
  );

function FilterButton({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ltc-filter-btn ${active ? "active" : ""}`}
    >
      <span className="ltc-filter-label" style={fontPoppins}>{label}</span>
      <span className="ltc-filter-count" style={fontMontserrat}>{count}</span>
    </button>
  );
}

function PaperIcon() {
  return (
    <svg
      viewBox="0 0 90 90"
      className="h-16 w-16 shrink-0 text-[#8a936e]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28 18H58L68 28V68C68 70.2 66.2 72 64 72H28C25.8 72 24 70.2 24 68V22C24 19.8 25.8 18 28 18Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M58 18V29H68"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M19 25H53L61 33V75"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.75"
      />

      <path
        d="M34 36H55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M34 46H55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M34 56H50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M29 36L31 38L34 34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M29 46L31 48L34 44"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M29 56L31 58L34 54"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AttendanceModal({
  row,
  note,
  file,
  submitting,
  onClose,
  onNoteChange,
  onFileChange,
  onSubmit,
}) {
  if (!row) return null;

  const hasProof = Boolean(row.proofFileId);
  const proofReview = String(row.proofReviewStatus || "pending").toLowerCase();
  const windowStatus = String(row.windowStatus || "open").toLowerCase();

  const canUpload =
    row.canUpload && proofReview !== "approved" && windowStatus !== "closed";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 text-[#45674b] shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold uppercase">
              Attendance
            </h2>

            <p className="mt-1 text-sm font-bold">
              {formatCardDate(row.attendanceDate || row.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#45674b]/20 px-4 py-2 text-xs font-extrabold uppercase text-[#45674b] hover:bg-[#eef1e7]"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoBox label="Professor Posted" value={formatDateTime(row.createdAt)} />
          <InfoBox label="Upload Opens" value={formatDateTime(row.uploadOpenAt)} />
          <InfoBox label="Upload Closes" value={formatDateTime(row.uploadCloseAt)} />
          <InfoBox label="Upload Window" value={windowLabel(windowStatus)} />
          <InfoBox label="Status" value={row.status || "Pending"} />
          <InfoBox label="Proof Review" value={proofReview} />
        </div>

        {row.remarks ? (
          <div className="mt-4 rounded-2xl bg-[#f4f7ef] px-4 py-3 text-sm">
            <span className="font-extrabold">Professor remarks:</span>{" "}
            {row.remarks}
          </div>
        ) : null}

        {row.traineeProofNote ? (
          <div className="mt-4 rounded-2xl bg-[#f4f7ef] px-4 py-3 text-sm">
            <span className="font-extrabold">Your note:</span>{" "}
            {row.traineeProofNote}
          </div>
        ) : null}

        {row.proofReviewRemarks ? (
          <div className="mt-4 rounded-2xl bg-[#f4f7ef] px-4 py-3 text-sm">
            <span className="font-extrabold">Professor note:</span>{" "}
            {row.proofReviewRemarks}
          </div>
        ) : null}

        {hasProof ? (
          <div className="mt-5 rounded-2xl bg-[#f4f7ef] p-4">
            <p className="text-sm font-extrabold">Uploaded Proof</p>

            <a
              href={buildProtectedFileUrl(row.proofFileId)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-full border border-[#45674b] px-5 py-2 text-xs font-extrabold uppercase text-[#45674b] transition hover:bg-[#45674b] hover:text-white"
            >
              View Uploaded File
            </a>
          </div>
        ) : null}

        {windowStatus === "not_open" ? (
          <div className="mt-5 rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800 ring-1 ring-yellow-200">
            The upload window is not open yet.
          </div>
        ) : null}

        {windowStatus === "closed" ? (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800 ring-1 ring-red-200">
            The upload window is already closed.
          </div>
        ) : null}

        {proofReview === "approved" ? (
          <div className="mt-5 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-800 ring-1 ring-green-200">
            This attendance proof is already approved.
          </div>
        ) : null}

        {canUpload ? (
          <div className="mt-5 rounded-2xl border border-[#d6ded2] bg-white p-4">
            <h3 className="text-sm font-extrabold uppercase">
              Upload Attendance Proof
            </h3>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold">Upload Proof</label>

              <input
                id={`attendance-proof-file-${row.id}`}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none"
              />

              {file?.name ? (
                <p className="mt-2 text-xs font-semibold text-[#45674b]/80">
                  Selected: {file.name}
                </p>
              ) : null}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold">
                Note for Professor
              </label>

              <textarea
                rows={4}
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="Optional note about your uploaded attendance proof."
                className="w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none"
              />
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="mt-4 rounded-full bg-[#45674b] px-6 py-3 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-[#2f463a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Uploading..." : "Upload Attendance Proof"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f4f7ef] px-4 py-3">
      <p className="text-[11px] font-extrabold uppercase text-[#45674b]/70">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-[#45674b]">{value}</p>
    </div>
  );
}

function Header({ goTo, goToProfile, profilePhotoUrl, onOpenMenu, activeKey }) {
  return (
    <header className="ltc-header">
      <div className="ltc-container">
        <div className="ltc-nav">
          <button
            type="button"
            onClick={() => goTo("/trainee-home")}
            className="ltc-logo"
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
            <div>
              <h1 style={fontMontserrat}>TRAINING & ASSESSMENT</h1>
            </div>
          </button>

          <nav className="ltc-desktop-nav" aria-label="Trainee navigation">
            {TRAINEE_NAV_ITEMS.map((item) => (
              <HeaderNavButton
                key={item.key}
                label={item.label}
                active={item.key === activeKey}
                onClick={() => goTo(item.path)}
              />
            ))}
          </nav>

          <div className="ltc-profile-wrap">
            <HeaderNavButton
              label="Profile"
              className="ltc-profile-button"
              onClick={goToProfile}
            />
            <button
              type="button"
              onClick={goToProfile}
              className="ltc-profile-avatar"
              aria-label="Profile"
            >
              <ProfileImage profilePhotoUrl={profilePhotoUrl} />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenMenu}
            className="ltc-menu-button"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

function HeaderNavButton({ label, active = false, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ltc-nav-link ${active ? "active" : ""} ${className}`}
      style={fontPoppins}
    >
      {label}
    </button>
  );
}

function ProfileImage({ profilePhotoUrl }) {
  if (profilePhotoUrl) {
    return (
      <img
        src={profilePhotoUrl}
        alt="Profile"
        onError={(e) => {
          e.currentTarget.src =
            "https://placehold.co/80x80/d7ddd4/45674b?text=P";
        }}
      />
    );
  }

  return (
    <img
      src="https://placehold.co/80x80/d7ddd4/45674b?text=P"
      alt="Profile"
    />
  );
}

function Footer({ goTo }) {
  return (
    <footer className="ltc-footer">
      <div className="ltc-container ltc-footer-grid">
        <div>
          <div className="ltc-footer-brand">
            <img
              src="/TamsiLogo.png"
              alt="TAMSI Logo"
              onError={(event) => {
                event.currentTarget.src =
                  "https://placehold.co/80x80/ffffff/4d6f55?text=T";
              }}
            />
            <h4 style={fontMontserrat}>Training & Assessment</h4>
          </div>
        </div>

        <FooterColumn title="Menu">
          {TRAINEE_NAV_ITEMS.map((item) => (
            <FooterLink key={item.key} onClick={() => goTo(item.path)}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>{TRAINING_CONTACT_INFO.email1}</FooterText>
          <FooterText>{TRAINING_CONTACT_INFO.email2}</FooterText>
          <FooterText>{TRAINING_CONTACT_INFO.phone}</FooterText>
        </FooterColumn>

        <FooterColumn title="Address">
          <FooterText>{TRAINING_CONTACT_INFO.addressLine1}</FooterText>
          <FooterText>{TRAINING_CONTACT_INFO.addressLine2}</FooterText>
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

function FooterText({ children }) {
  return <p style={fontPontano}>{children}</p>;
}

function MobileMenu({ onClose, goTo, goToProfile, activeKey }) {
  return (
    <div className="ltc-sidebar-overlay">
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <div className="ltc-sidebar-panel">
        <div className="ltc-sidebar-top">
          <p className="ltc-sidebar-title" style={fontPoppins}>MENU</p>
          <button
            type="button"
            onClick={onClose}
            className="ltc-sidebar-close"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {TRAINEE_NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => goTo(item.path)}
            className={`ltc-sidebar-link ${item.key === activeKey ? "active" : ""}`}
            style={fontPoppins}
          >
            {item.label}
          </button>
        ))}

        <button
          type="button"
          onClick={goToProfile}
          className="ltc-sidebar-link"
          style={fontPoppins}
        >
          Profile
        </button>
      </div>
    </div>
  );
}
}
// src/TrainingAndAssessment/TraineeModules.jsx
import React, { useEffect, useMemo, useState } from "react";
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


  .ltc-modules-overview {
    position: relative;
    z-index: 2;
    padding: 44px 0 24px;
  }

  .ltc-modules-panel {
    overflow: hidden;
    border: 1px solid rgba(71,103,75,.18);
    border-radius: 28px;
    background: rgba(255,255,255,.92);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
    animation: ltcFadeUp .75s var(--ease) both;
  }

  .ltc-modules-header-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 430px);
    gap: 24px;
    align-items: center;
    padding: 30px;
  }

  .ltc-modules-title {
    margin: 0;
    color: #244b31;
    font-size: clamp(28px, 4vw, 46px);
    line-height: 1.05;
    font-weight: 900;
    letter-spacing: -.05em;
  }

  .ltc-modules-subtitle {
    max-width: 720px;
    margin: 12px 0 0;
    color: #6d806f;
    font-size: 16px;
    font-weight: 700;
  }

  .ltc-modules-meta-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .ltc-modules-meta-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(71,103,75,.18);
    border-radius: 22px;
    background: linear-gradient(145deg,#f8fbf6,#eef5ed);
    padding: 18px 20px;
    box-shadow: 0 14px 32px rgba(8,39,25,.08);
    transition: transform .28s var(--ease), box-shadow .28s var(--ease), border-color .28s var(--ease);
  }

  .ltc-modules-meta-card::after {
    content: "";
    position: absolute;
    right: -34px;
    top: -34px;
    width: 92px;
    height: 92px;
    border-radius: 999px;
    background: rgba(215,168,77,.16);
  }

  .ltc-modules-meta-card:hover {
    transform: translateY(-4px);
    border-color: rgba(215,168,77,.42);
    box-shadow: 0 22px 48px rgba(8,39,25,.13);
  }

  .ltc-modules-meta-label {
    margin: 0;
    color: #7a8c7c;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .ltc-modules-meta-value {
    margin: 5px 0 0;
    color: #244b31;
    font-size: 18px;
    font-weight: 900;
  }

  .ltc-modules-toolbar {
    display: grid;
    grid-template-columns: minmax(180px, 260px) minmax(240px, 1fr);
    gap: 14px;
    border-top: 1px solid rgba(71,103,75,.12);
    background: linear-gradient(135deg, rgba(244,247,239,.9), rgba(255,255,255,.8));
    padding: 22px 30px 28px;
  }

  .ltc-modules-input,
  .ltc-modules-select {
    width: 100%;
    min-height: 48px;
    border: 1px solid rgba(71,103,75,.18);
    border-radius: 999px;
    background: white;
    color: #2f5639;
    padding: 0 18px;
    font-size: 13px;
    font-weight: 800;
    outline: none;
    box-shadow: 0 12px 28px rgba(8,39,25,.06);
    transition: transform .24s var(--ease), border-color .24s var(--ease), box-shadow .24s var(--ease);
  }

  .ltc-modules-input::placeholder { color: rgba(47,86,57,.56); }

  .ltc-modules-input:focus,
  .ltc-modules-select:focus {
    transform: translateY(-2px);
    border-color: rgba(215,168,77,.7);
    box-shadow: 0 16px 34px rgba(8,39,25,.10), 0 0 0 4px rgba(215,168,77,.12);
  }

  .ltc-modules-input:disabled,
  .ltc-modules-select:disabled {
    cursor: not-allowed;
    opacity: .58;
  }

  .ltc-modules-list-section {
    padding: 22px 0 70px;
  }

  .ltc-modules-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px;
  }

  .ltc-module-card {
    position: relative;
    min-height: 284px;
    overflow: hidden;
    border: 1px solid rgba(71,103,75,.16);
    border-radius: 28px;
    background: rgba(255,255,255,.94);
    padding: 26px 22px;
    text-align: center;
    color: #395345;
    box-shadow: 0 18px 42px rgba(8,39,25,.10);
    cursor: pointer;
    animation: ltcFadeUp .7s var(--ease) both;
    transition: transform .32s var(--ease), box-shadow .32s var(--ease), border-color .32s var(--ease);
  }

  .ltc-module-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 18% 18%, rgba(215,168,77,.16), transparent 26%),
      radial-gradient(circle at 88% 8%, rgba(35,95,62,.12), transparent 30%);
    opacity: 0;
    transition: opacity .32s var(--ease);
  }

  .ltc-module-card:hover {
    transform: translateY(-10px) scale(1.015);
    border-color: rgba(215,168,77,.52);
    box-shadow: 0 34px 74px rgba(8,39,25,.17);
  }

  .ltc-module-card:hover::before { opacity: 1; }
  .ltc-module-card > * { position: relative; z-index: 1; }

  .ltc-module-icon-wrap {
    display: grid;
    place-items: center;
    width: 90px;
    height: 90px;
    margin: 0 auto 14px;
    border-radius: 26px;
    background: linear-gradient(145deg,#f6f8f1,#edf3eb);
    color: #6f8261;
    box-shadow: inset 0 0 0 1px rgba(71,103,75,.10), 0 14px 28px rgba(8,39,25,.08);
    transition: transform .32s var(--ease), background .32s var(--ease), color .32s var(--ease);
  }

  .ltc-module-card:hover .ltc-module-icon-wrap {
    transform: rotate(-3deg) scale(1.06);
    background: linear-gradient(145deg,#244b31,#46704d);
    color: #fff;
  }

  .ltc-module-title {
    margin: 0;
    color: #284b32;
    font-size: 20px;
    line-height: 1.25;
    font-weight: 900;
    letter-spacing: -.03em;
  }

  .ltc-module-badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
  }

  .ltc-module-badge {
    border-radius: 999px;
    background: #eef4ec;
    color: #45674b;
    padding: 6px 10px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .09em;
    text-transform: uppercase;
    box-shadow: inset 0 0 0 1px rgba(71,103,75,.12);
  }

  .ltc-module-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 142px;
    min-height: 42px;
    margin-top: 24px;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(135deg,#244b31,#47704e);
    color: white;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .12em;
    text-transform: uppercase;
    box-shadow: 0 15px 28px rgba(36,75,49,.18);
    transition: transform .25s var(--ease), box-shadow .25s var(--ease), background .25s var(--ease);
  }

  .ltc-module-card:hover .ltc-module-button {
    transform: translateY(-2px);
    background: linear-gradient(135deg,#d7a84d,#f4d484);
    color: #143121;
    box-shadow: 0 18px 34px rgba(215,168,77,.22);
  }

  .ltc-module-empty,
  .ltc-module-lock,
  .ltc-module-alert {
    border-radius: 24px;
    background: rgba(255,255,255,.94);
    padding: 22px 24px;
    color: #395345;
    box-shadow: var(--shadow-md);
    border: 1px solid rgba(71,103,75,.14);
    animation: ltcFadeUp .65s var(--ease) both;
  }

  .ltc-module-alert.success { color: #166534; background: #f0fdf4; border-color: #bbf7d0; }
  .ltc-module-alert.error { color: #991b1b; background: #fef2f2; border-color: #fecaca; }

  .ltc-module-lock {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 24px;
  }

  .ltc-module-lock h2 {
    margin: 0;
    color: #244b31;
    font-size: 20px;
    font-weight: 900;
  }

  .ltc-module-lock p {
    margin: 6px 0 0;
    color: #6d806f;
    font-size: 14px;
    font-weight: 700;
  }

  .ltc-goto-button {
    border: 0;
    border-radius: 999px;
    background: linear-gradient(135deg,#244b31,#47704e);
    color: white;
    padding: 14px 22px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform .25s var(--ease), box-shadow .25s var(--ease);
  }

  .ltc-goto-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 32px rgba(36,75,49,.18);
  }

  .ltc-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,.62);
    padding: 24px;
    backdrop-filter: blur(8px);
  }

  .ltc-modal-panel {
    width: min(1120px, 100%);
    max-height: 90vh;
    overflow: hidden;
    border-radius: 30px;
    background: white;
    box-shadow: 0 30px 90px rgba(0,0,0,.28);
    animation: ltcModalIn .26s var(--ease) both;
  }

  .ltc-modal-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    border-bottom: 1px solid #e8ece2;
    padding: 20px 24px;
  }

  .ltc-modal-top h3 {
    margin: 0;
    color: #284b32;
    font-size: 22px;
    font-weight: 900;
  }

  .ltc-modal-close {
    border: 1px solid #d7ddd0;
    border-radius: 999px;
    background: #fff;
    color: #395345;
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background .2s var(--ease), transform .2s var(--ease);
  }

  .ltc-modal-close:hover { background: #eef1e7; transform: translateY(-1px); }

  .ltc-modal-body {
    max-height: calc(90vh - 84px);
    overflow-y: auto;
    padding: 24px;
  }

  @keyframes ltcModalIn {
    from { opacity: 0; transform: translateY(16px) scale(.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 1100px) {
    .ltc-modules-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  @media (max-width: 900px) {
    .ltc-modules-header-row { grid-template-columns: 1fr; padding: 24px; }
    .ltc-modules-toolbar { grid-template-columns: 1fr; padding: 20px 24px 24px; }
    .ltc-modules-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ltc-module-lock { align-items: flex-start; flex-direction: column; }
  }

  @media (max-width: 560px) {
    .ltc-modules-grid { grid-template-columns: 1fr; }
    .ltc-modules-title { font-size: 32px; }
    .ltc-module-card { min-height: auto; }
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

function formatBytes(bytes = 0) {
  const size = Number(bytes || 0);

  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isPreviewableImage(mime = "", name = "") {
  const lowerMime = String(mime || "").toLowerCase();
  const lowerName = String(name || "").toLowerCase();

  return (
    lowerMime.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/.test(lowerName)
  );
}

function isPreviewablePdf(mime = "", name = "") {
  const lowerMime = String(mime || "").toLowerCase();
  const lowerName = String(name || "").toLowerCase();

  return lowerMime === "application/pdf" || lowerName.endsWith(".pdf");
}

function getModuleFiles(module) {
  if (Array.isArray(module?.files) && module.files.length) {
    return module.files.map((file) => ({
      fileId: getObjectIdString(file?.fileId),
      originalName: file?.originalName || file?.filename || "Module File",
      filename: file?.filename || file?.originalName || "Module File",
      mimetype: file?.mimetype || file?.mimeType || "",
      size: Number(file?.size || 0),
    }));
  }

  const legacyId =
    module?.fileId ||
    module?.moduleFileId ||
    module?.file?.fileId ||
    module?.moduleFile?.fileId ||
    "";

  if (!legacyId) return [];

  return [
    {
      fileId: getObjectIdString(legacyId),
      originalName:
        module?.fileName ||
        module?.originalName ||
        module?.filename ||
        module?.file?.originalName ||
        module?.file?.filename ||
        "Module File",
      filename:
        module?.filename ||
        module?.fileName ||
        module?.file?.filename ||
        "Module File",
      mimetype:
        module?.mimeType ||
        module?.mimetype ||
        module?.file?.mimetype ||
        "",
      size: Number(module?.fileSize || module?.size || module?.file?.size || 0),
    },
  ];
}

function getFileUrl(file) {
  const fileId = getObjectIdString(file?.fileId);

  if (!fileId) return "";

  return buildTrainingFileUrl(fileId);
}

function normalizeLearningPath(value = "") {
  const clean = String(value || "").trim().toLowerCase();

  if (clean === "advanced") return "advanced";
  if (clean === "intermediate") return "intermediate";

  return "beginner";
}

function learningPathLabel(value = "") {
  const clean = normalizeLearningPath(value);

  if (clean === "advanced") return "Advanced";
  if (clean === "intermediate") return "Intermediate";

  return "Beginner";
}

function learningPathBadgeClass(value = "") {
  const clean = normalizeLearningPath(value);

  if (clean === "advanced") {
    return "bg-green-50 text-green-700 ring-green-200";
  }

  if (clean === "intermediate") {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }

  return "bg-yellow-50 text-yellow-700 ring-yellow-200";
}

function getModulePathLevel(module) {
  return normalizeLearningPath(
    module?.learningPathLevel ||
      module?.recommendedLevel ||
      module?.level ||
      module?.audienceLevel ||
      "beginner"
  );
}

function ModuleModal({ open, onClose, title, children, maxWidth = "max-w-6xl" }) {
  if (!open) return null;

  return (
    <div className="ltc-modal-backdrop" onClick={onClose}>
      <div className="ltc-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ltc-modal-top">
          <h3 style={fontMontserrat}>{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="ltc-modal-close"
            style={fontPoppins}
          >
            Close
          </button>
        </div>

        <div className="ltc-modal-body">{children}</div>
      </div>
    </div>
  );
}

export default function TraineeModules() {
  const navigate = useNavigate();
  const token = useMemo(() => getToken(), []);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trainingUser") || "null");
    } catch {
      return null;
    }
  });

  const [course, setCourse] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lockedByPretest, setLockedByPretest] = useState(false);
  const [learningPath, setLearningPath] = useState("beginner");

  useEffect(() => {
    const loadAll = async () => {
      if (!token) {
        setLoading(false);
        redirectToTraineeLogin(navigate);
        return;
      }

      try {
        setLoading(true);
        setMsg({ type: "", text: "" });

        const profileRes = await fetch(`${API_BASE}/training/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const profileData = await readJsonSafe(profileRes);

        if (!profileRes.ok) {
          if (isTrainingAuthResponse(profileRes, profileData)) {
            redirectToTraineeLogin(navigate, {
              message: profileData?.message || "Please login again.",
            });
            return;
          }

          throw new Error(profileData?.message || "Failed to load profile.");
        }

        const fetchedUser = profileData?.user || null;

        setUser(fetchedUser);

        if (fetchedUser) {
          localStorage.setItem("trainingUser", JSON.stringify(fetchedUser));
          setCourse(fetchedUser.course || "");
          setLearningPath(
            normalizeLearningPath(
              fetchedUser.learningPathLevel ||
                fetchedUser.learningPath ||
                "beginner"
            )
          );
        }

        const modulesRes = await fetch(`${API_BASE}/training/modules`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const modulesData = await readJsonSafe(modulesRes);

        if (!modulesRes.ok) {
          if (isTrainingAuthResponse(modulesRes, modulesData)) {
            redirectToTraineeLogin(navigate, {
              message: modulesData?.message || "Please login again.",
            });
            return;
          }

          throw new Error(modulesData?.message || "Failed to load modules.");
        }

        setModules(Array.isArray(modulesData?.modules) ? modulesData.modules : []);
        setLockedByPretest(Boolean(modulesData?.lockedByPretest));

        if (modulesData?.course) setCourse(modulesData.course);

        if (modulesData?.learningPathLevel) {
          setLearningPath(normalizeLearningPath(modulesData.learningPathLevel));
        }
      } catch (err) {
        setMsg({
          type: "error",
          text: err.message || "Failed to load modules.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [token, navigate]);

  const visibleModules = useMemo(() => {
    const q = search.trim().toLowerCase();

    return [...modules].filter((item) => {
      const level = getModulePathLevel(item);

      if (category !== "all" && level !== category) {
        return false;
      }

      const moduleFiles = getModuleFiles(item);
      const fileNames = moduleFiles
        .map((file) => file.originalName || file.filename || "")
        .join(" ");

      const text =
        `${item.title} ${item.description} ${item.course} ${item.uploadedByProfessorName} ${fileNames} ${level}`.toLowerCase();

      return !q || text.includes(q);
    });
  }, [modules, search, category]);

  const profilePhotoUrl = buildFileUrl(user?.profilePhoto);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const goToProfile = () => {
    const savedToken = localStorage.getItem("trainingToken");
    goTo(savedToken ? "/trainee-profile" : "/trainee-login");
  };

  const logout = () => {
    clearTrainingSession();
    navigate("/trainee-login", { replace: true });
  };

  return (
    <div className="ltc-trainee-home-page">
      <style>{pageStyles}</style>

      <Header
        goTo={goTo}
        goToProfile={goToProfile}
        profilePhotoUrl={profilePhotoUrl}
        onOpenMenu={() => setMobileOpen(true)}
        activeKey="modules"
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
              Online <span>Modules</span>
            </h2>
            <p className="ltc-hero-text" style={fontPontano}>
              Browse your assigned TAMSI learning files, open module details, and review resources based on your learning path.
            </p>
          </div>
        </section>

        <section className="ltc-modules-overview">
          <div className="ltc-container">
            <div className="ltc-modules-panel">
              <div className="ltc-modules-header-row">
                <div>
                  <h1 className="ltc-modules-title" style={fontMontserrat}>
                    TAMSI Online Modules
                  </h1>
                </div>

                <div className="ltc-modules-meta-grid">
                  <div className="ltc-modules-meta-card">
                    <p className="ltc-modules-meta-label" style={fontPoppins}>Course</p>
                    <p className="ltc-modules-meta-value" style={fontMontserrat}>
                      {course || "Not assigned"}
                    </p>
                  </div>

                  <div className="ltc-modules-meta-card">
                    <p className="ltc-modules-meta-label" style={fontPoppins}>Learning Path</p>
                    <p className="ltc-modules-meta-value" style={fontMontserrat}>
                      {learningPathLabel(learningPath)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="ltc-modules-toolbar">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={lockedByPretest}
                  className="ltc-modules-select"
                  style={fontPoppins}
                >
                  <option value="all">Category</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Module"
                  disabled={lockedByPretest}
                  className="ltc-modules-input"
                  style={fontPoppins}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="ltc-modules-list-section">
          <div className="ltc-container">
            {msg.text && (
              <div
                className={`ltc-module-alert ${
                  msg.type === "success" ? "success" : "error"
                }`}
                style={fontPoppins}
              >
                {msg.text}
              </div>
            )}

            {lockedByPretest ? (
              <div className="ltc-module-lock">
                <div>
                  <h2 style={fontMontserrat}>
                    Modules are locked until you finish the pre-test
                  </h2>
                  <p style={fontPoppins}>
                    The pre-test is inside the Assignment page. Finish it first,
                    then your modules will appear here.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-assignment")}
                  className="ltc-goto-button"
                  style={fontMontserrat}
                >
                  Go to Assignment
                </button>
              </div>
            ) : null}

            {loading ? (
              <div className="ltc-module-empty" style={fontPoppins}>
                Loading modules...
              </div>
            ) : !course ? (
              <div className="ltc-module-empty" style={fontPoppins}>
                No course assigned to this trainee account yet.
              </div>
            ) : lockedByPretest ? (
              <div className="ltc-module-empty" style={fontPoppins}>
                Complete the pre-test in the Assignment page first.
              </div>
            ) : visibleModules.length === 0 ? (
              <div className="ltc-module-empty" style={fontPoppins}>
                No modules found.
              </div>
            ) : (
              <div className="ltc-modules-grid">
                {visibleModules.map((module, index) => {
                  const files = getModuleFiles(module);
                  const level = getModulePathLevel(module);

                  return (
                    <button
                      key={module.id || module._id || `${module.title}-${index}`}
                      type="button"
                      onClick={() => setSelectedModule(module)}
                      className="ltc-module-card"
                      style={{ animationDelay: `${Math.min(index * 70, 490)}ms` }}
                    >
                      <span className="ltc-module-icon-wrap">
                        <PaperIcon />
                      </span>

                      <h2 className="ltc-module-title" style={fontMontserrat}>
                        {module.title || `Module #${index + 1}`}
                      </h2>

                      <div className="ltc-module-badges">
                        <span className="ltc-module-badge">
                          {learningPathLabel(level)}
                        </span>

                        <span className="ltc-module-badge">Files: {files.length}</span>
                      </div>

                      <span className="ltc-module-button" style={fontMontserrat}>
                        View
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <ModuleModal
        open={Boolean(selectedModule)}
        onClose={() => setSelectedModule(null)}
        title={selectedModule?.title || "Module Details"}
      >
        {selectedModule ? (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#395345] ring-1 ring-[#d7ddd0]">
                  {selectedModule.course || course}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ring-1 ${learningPathBadgeClass(
                    getModulePathLevel(selectedModule)
                  )}`}
                >
                  {learningPathLabel(getModulePathLevel(selectedModule))}
                </span>
              </div>

              <div className="mt-4 text-2xl font-extrabold text-[#395345]">
                {selectedModule.title || "Untitled Module"}
              </div>

              <p className="mt-3 text-sm leading-7 text-[#647166]">
                {selectedModule.description ||
                  "No description available for this module."}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                    Uploaded By
                  </div>

                  <div className="mt-2 text-sm text-[#395345]">
                    {selectedModule.uploadedByProfessorName || "Professor"}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                    Uploaded At
                  </div>

                  <div className="mt-2 text-sm text-[#395345]">
                    {formatDateTime(selectedModule.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
              <div className="text-sm font-bold text-[#395345]">
                Module Files
              </div>

              <p className="mt-1 text-xs text-[#647166]">
                Open or preview the files attached to this module.
              </p>

              <div className="mt-4 space-y-4">
                {getModuleFiles(selectedModule).length ? (
                  getModuleFiles(selectedModule).map((file, index) => {
                    const fileUrl = getFileUrl(file);
                    const fileName =
                      file?.originalName ||
                      file?.filename ||
                      `Module File ${index + 1}`;

                    return (
                      <div
                        key={`${file.fileId || fileName}-${index}`}
                        className="rounded-2xl border border-[#dde3d6] bg-[#f7f8f3] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-[#395345]">
                              {index + 1}. {fileName}
                            </div>

                            <div className="mt-1 text-xs text-[#647166]">
                              {formatBytes(file.size)}
                            </div>
                          </div>

                          {fileUrl ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-[#c6ccb9] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#395345] transition hover:bg-[#eef1e7]"
                            >
                              Open
                            </a>
                          ) : null}
                        </div>

                        {fileUrl && isPreviewableImage(file.mimetype, fileName) ? (
                          <img
                            src={fileUrl}
                            alt={fileName}
                            className="mt-4 max-h-[320px] w-full rounded-xl object-contain ring-1 ring-[#dde3d6]"
                          />
                        ) : fileUrl && isPreviewablePdf(file.mimetype, fileName) ? (
                          <iframe
                            src={fileUrl}
                            title={fileName}
                            className="mt-4 h-[420px] w-full rounded-xl border border-[#dde3d6]"
                          />
                        ) : (
                          <div className="mt-4 rounded-xl border border-[#dde3d6] bg-white px-4 py-3 text-sm text-[#627165]">
                            Preview is not available for this file type. Use the
                            Open button above.
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3 text-sm text-[#647166]">
                    No files attached to this module.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </ModuleModal>

      <Footer goTo={goTo} />

      {mobileOpen ? (
        <MobileMenu
          onClose={() => setMobileOpen(false)}
          goTo={goTo}
          goToProfile={goToProfile}
          activeKey="modules"
        />
      ) : null}
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
            <h4 style={fontMontserrat}>TAMSI</h4>
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

function PaperIcon() {
  return (
    <svg
      viewBox="0 0 90 90"
      className="h-20 w-20 text-[#8a936e]"
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
// src/TrainingAndAssessment/TraineeAssignment.jsx
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


  .ltc-assignment-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }

  .ltc-assignment-meta-row span,
  .ltc-assignment-count-pills span,
  .ltc-assignment-pretest-badges span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 8px 12px;
    background: rgba(35,95,62,.08);
    border: 1px solid rgba(35,95,62,.13);
    color: var(--green-700);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .06em;
  }

  .ltc-assignment-toolbar,
  .ltc-assignment-pretest-card,
  .ltc-assignment-lock-card {
    margin-bottom: 24px;
    border-radius: var(--radius);
    border: 1px solid rgba(35,95,62,.12);
    background: rgba(255,255,255,.9);
    box-shadow: var(--shadow-md);
  }

  .ltc-assignment-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 18px;
  }

  .ltc-assignment-search {
    width: min(360px, 100%);
    min-height: 48px;
    border-radius: 999px;
    border: 1px solid rgba(35,95,62,.15);
    background: white;
    padding: 0 18px;
    outline: none;
    color: var(--green-800);
    font-size: 13px;
    font-weight: 800;
    box-shadow: inset 0 1px 2px rgba(16,24,40,.04);
    transition: .25s var(--ease);
  }

  .ltc-assignment-search:focus {
    border-color: rgba(215,168,77,.65);
    box-shadow: 0 0 0 4px rgba(215,168,77,.16);
  }

  .ltc-assignment-count-pills,
  .ltc-assignment-pretest-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .ltc-assignment-pretest-card,
  .ltc-assignment-lock-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 22px;
    padding: 22px;
  }

  .ltc-assignment-pretest-card h3,
  .ltc-assignment-lock-card h2 {
    margin: 0;
    color: var(--green-800);
    font-size: 24px;
    font-weight: 900;
  }

  .ltc-assignment-pretest-card p,
  .ltc-assignment-lock-card p {
    margin: 8px 0 0;
    color: #6f7e72;
    font-size: 14px;
    font-weight: 700;
  }

  .ltc-assignment-lock-button {
    width: auto;
    min-width: 190px;
    padding-left: 24px;
    padding-right: 24px;
  }

  .ltc-assignment-card {
    cursor: default;
  }

  .ltc-assignment-card .ltc-action-button {
    margin-top: auto;
  }


  /* Enhanced animation and hover effects for Trainee Assignment */
  .ltc-header {
    animation: ltcHeaderDrop .55s var(--ease) both;
  }

  .ltc-logo,
  .ltc-profile-avatar,
  .ltc-menu-button,
  .ltc-sidebar-close,
  .ltc-footer-link,
  .ltc-socials span {
    transition: transform .28s var(--ease), box-shadow .28s var(--ease), background .28s var(--ease), color .28s var(--ease), border-color .28s var(--ease), opacity .28s var(--ease);
  }

  .ltc-logo:hover {
    transform: translateY(-2px) scale(1.01);
  }

  .ltc-logo:hover .ltc-logo-icon,
  .ltc-profile-avatar:hover {
    transform: scale(1.07) rotate(-2deg);
    box-shadow: 0 0 0 5px rgba(255,255,255,.12), 0 18px 34px rgba(0,0,0,.22);
  }

  .ltc-profile-button:hover {
    color: #102418;
    background: linear-gradient(135deg,#ffe6a1,#d7a84d);
    box-shadow: 0 18px 34px rgba(215,168,77,.28);
  }

  .ltc-menu-button:hover {
    background: rgba(255,255,255,.18);
    transform: translateY(-2px);
  }

  .ltc-hero,
  .ltc-attendance-panel,
  .ltc-assignment-toolbar,
  .ltc-assignment-pretest-card,
  .ltc-assignment-lock-card,
  .ltc-empty-state,
  .ltc-alert {
    animation: ltcFadeUp .72s var(--ease) both;
  }

  .ltc-attendance-panel {
    position: relative;
    overflow: hidden;
    transition: transform .32s var(--ease), box-shadow .32s var(--ease), border-color .32s var(--ease);
  }

  .ltc-attendance-panel::before,
  .ltc-assignment-toolbar::before,
  .ltc-assignment-pretest-card::before,
  .ltc-assignment-lock-card::before,
  .ltc-attendance-card::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,.54) 44%, transparent 72%);
    transform: translateX(-125%);
    transition: transform .8s var(--ease);
  }

  .ltc-attendance-panel:hover {
    transform: translateY(-4px);
    border-color: rgba(215,168,77,.35);
    box-shadow: 0 28px 70px rgba(8,39,25,.13);
  }

  .ltc-attendance-panel:hover::before,
  .ltc-assignment-toolbar:hover::before,
  .ltc-assignment-pretest-card:hover::before,
  .ltc-assignment-lock-card:hover::before,
  .ltc-attendance-card:hover::before {
    transform: translateX(125%);
  }

  .ltc-trainee-card {
    transition: transform .3s var(--ease), box-shadow .3s var(--ease), border-color .3s var(--ease), background .3s var(--ease);
    animation: ltcFadeRight .7s var(--ease) both;
  }

  .ltc-trainee-card:hover {
    transform: translateY(-5px);
    border-color: rgba(215,168,77,.46);
    background: #fff;
    box-shadow: 0 26px 58px rgba(8,39,25,.14);
  }

  .ltc-filter-btn {
    position: relative;
    overflow: hidden;
    animation: ltcFadeUp .65s var(--ease) both;
  }

  .ltc-filter-btn:nth-child(2) { animation-delay: .08s; }
  .ltc-filter-btn:nth-child(3) { animation-delay: .16s; }

  .ltc-filter-btn::after {
    content: "";
    position: absolute;
    width: 96px;
    height: 96px;
    right: -34px;
    top: -42px;
    border-radius: 999px;
    background: rgba(215,168,77,.14);
    transform: scale(.4);
    opacity: 0;
    transition: transform .35s var(--ease), opacity .35s var(--ease);
  }

  .ltc-filter-btn:hover::after,
  .ltc-filter-btn.active::after {
    transform: scale(1);
    opacity: 1;
  }

  .ltc-assignment-toolbar,
  .ltc-assignment-pretest-card,
  .ltc-assignment-lock-card,
  .ltc-attendance-card {
    position: relative;
    overflow: hidden;
    transform-origin: center;
  }

  .ltc-assignment-toolbar:hover,
  .ltc-assignment-pretest-card:hover,
  .ltc-assignment-lock-card:hover {
    transform: translateY(-5px);
    border-color: rgba(215,168,77,.40);
    box-shadow: 0 26px 62px rgba(8,39,25,.14);
  }

  .ltc-assignment-toolbar,
  .ltc-assignment-pretest-card,
  .ltc-assignment-lock-card {
    transition: transform .32s var(--ease), box-shadow .32s var(--ease), border-color .32s var(--ease), background .32s var(--ease);
  }

  .ltc-assignment-search:hover {
    border-color: rgba(35,95,62,.35);
    box-shadow: inset 0 1px 2px rgba(16,24,40,.04), 0 12px 24px rgba(8,39,25,.08);
  }

  .ltc-assignment-meta-row span,
  .ltc-assignment-count-pills span,
  .ltc-assignment-pretest-badges span,
  .ltc-status-badge {
    transition: transform .25s var(--ease), background .25s var(--ease), border-color .25s var(--ease), box-shadow .25s var(--ease);
  }

  .ltc-assignment-meta-row span:hover,
  .ltc-assignment-count-pills span:hover,
  .ltc-assignment-pretest-badges span:hover,
  .ltc-status-badge:hover {
    transform: translateY(-2px);
    background: rgba(215,168,77,.13);
    border-color: rgba(215,168,77,.38);
    box-shadow: 0 12px 24px rgba(8,39,25,.08);
  }

  .ltc-attendance-card:nth-child(2n) { animation-delay: .07s; }
  .ltc-attendance-card:nth-child(3n) { animation-delay: .14s; }
  .ltc-attendance-card:nth-child(4n) { animation-delay: .21s; }

  .ltc-attendance-card:hover {
    transform: translateY(-10px) scale(1.01);
  }

  .ltc-attendance-card:hover .ltc-attendance-icon {
    transform: translateY(-3px) rotate(-3deg) scale(1.06);
    background: linear-gradient(135deg, rgba(215,168,77,.34), rgba(35,95,62,.14));
    box-shadow: 0 18px 34px rgba(8,39,25,.12);
  }

  .ltc-attendance-icon {
    transition: transform .32s var(--ease), box-shadow .32s var(--ease), background .32s var(--ease);
  }

  .ltc-card-title,
  .ltc-card-date,
  .ltc-card-due {
    transition: color .25s var(--ease), transform .25s var(--ease);
  }

  .ltc-attendance-card:hover .ltc-card-title {
    color: var(--green-700);
    transform: translateX(2px);
  }

  .ltc-proof-link:hover {
    box-shadow: 0 12px 24px rgba(215,168,77,.18);
  }

  .ltc-action-button,
  .ltc-assignment-lock-button {
    position: relative;
    overflow: hidden;
  }

  .ltc-action-button::before,
  .ltc-assignment-lock-button::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,.32), transparent);
    transform: translateX(-120%);
    transition: transform .65s var(--ease);
  }

  .ltc-action-button:hover::before,
  .ltc-assignment-lock-button:hover::before {
    transform: translateX(120%);
  }

  .ltc-empty-state:hover,
  .ltc-alert:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 48px rgba(8,39,25,.12);
  }

  .ltc-sidebar-panel {
    animation: ltcSlideIn .35s var(--ease) both;
  }

  .ltc-sidebar-link {
    transition: transform .25s var(--ease), background .25s var(--ease), color .25s var(--ease), box-shadow .25s var(--ease);
  }

  .ltc-sidebar-link:hover,
  .ltc-sidebar-link.active {
    transform: translateX(5px);
    box-shadow: 0 12px 24px rgba(8,39,25,.10);
  }

  .ltc-footer-brand img:hover,
  .ltc-socials span:hover {
    transform: translateY(-3px) scale(1.08);
  }

  @keyframes ltcHeaderDrop {
    from { opacity: 0; transform: translateY(-18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes ltcFadeRight {
    from { opacity: 0; transform: translateX(18px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes ltcSlideIn {
    from { opacity: 0; transform: translateX(32px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ltc-trainee-home-page *,
    .ltc-trainee-home-page *::before,
    .ltc-trainee-home-page *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: .01ms !important;
    }
  }

  @media (max-width: 760px) {
    .ltc-assignment-toolbar,
    .ltc-assignment-pretest-card,
    .ltc-assignment-lock-card {
      align-items: stretch;
      flex-direction: column;
    }
    .ltc-assignment-lock-button,
    .ltc-assignment-card .ltc-action-button {
      width: 100%;
    }
  }
`;

const MAX_SUBMISSION_FILES = 5;
const MAX_SUBMISSION_FILE_SIZE = 25 * 1024 * 1024;

const ALLOWED_SUBMISSION_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".txt",
  ".xls",
  ".xlsx",
]);

function getToken() {
  return localStorage.getItem("trainingToken") || "";
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

    if (
      typeof value.toString === "function" &&
      value.toString() !== "[object Object]"
    ) {
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

  if (Number.isNaN(d.getTime())) return "-";

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

function formatBytes(bytes = 0) {
  const size = Number(bytes || 0);

  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getTabLabel(tab) {
  if (tab === "completed") return "Completed";
  if (tab === "pastDue") return "Past Due";

  return "Upcoming";
}

function getStatusClasses(tab) {
  if (tab === "completed") return "bg-green-50 text-green-700 ring-green-200";
  if (tab === "pastDue") return "bg-red-50 text-red-700 ring-red-200";

  return "bg-yellow-50 text-yellow-700 ring-yellow-200";
}

function isTurnInLateItem(item) {
  return Boolean(
    item?.canSubmitLate ||
      (item?.canSubmit && item?.isPastDue) ||
      (item?.canSubmit && item?.tab === "pastDue")
  );
}

function getAssessmentActionLabel(item) {
  if (!item?.canSubmit) return "View";
  if (isTurnInLateItem(item)) return "Turn In Late";
  return "Answer";
}

function getSubmitButtonLabel(item, submitting) {
  if (submitting) return isTurnInLateItem(item) ? "Turning in late..." : "Submitting...";
  return isTurnInLateItem(item) ? "Turn In Late" : "Submit Assignment";
}

function getSubmissionHelperText(item) {
  if (isTurnInLateItem(item)) {
    return "This assignment is already past due. You can still upload your files, but your submission will be marked as Turned In Late.";
  }

  return "Add files one at a time. Up to 5 files. Submitting again will replace your old submission.";
}

function getClosedSubmissionMessage(item) {
  if (item?.score != null) {
    return "This assignment is already graded and can no longer be resubmitted.";
  }

  if (item?.isPastDue || item?.tab === "pastDue") {
    return "This assignment is past due. Late submission is not available for this assignment.";
  }

  return "This assignment is no longer open for submission.";
}

function getDaysMeta(deadline, tab) {
  if (!deadline) return "No deadline";

  const d = new Date(deadline);

  if (Number.isNaN(d.getTime())) return "No deadline";

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (tab === "completed") return "Submission recorded";
  if (diffMs < 0) return `${Math.abs(diffDays)} day(s) overdue`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";

  return `${diffDays} day(s) left`;
}

function sortAssessments(list, activeTab) {
  const items = [...list];

  items.sort((a, b) => {
    const aDue = a?.dueDate
      ? new Date(a.dueDate).getTime()
      : Number.MAX_SAFE_INTEGER;
    const bDue = b?.dueDate
      ? new Date(b.dueDate).getTime()
      : Number.MAX_SAFE_INTEGER;

    if (activeTab === "completed") {
      if (bDue !== aDue) return bDue - aDue;
    } else if (aDue !== bDue) {
      return aDue - bDue;
    }

    return String(a?.title || "").localeCompare(String(b?.title || ""));
  });

  return items;
}

function getFileExtension(name = "") {
  const idx = String(name || "").lastIndexOf(".");
  return idx >= 0 ? String(name).slice(idx).toLowerCase() : "";
}

function validateSubmissionFile(file) {
  if (!file) return "No file selected.";

  const ext = getFileExtension(file.name);

  if (!ALLOWED_SUBMISSION_EXTENSIONS.has(ext)) {
    return "Only PDF, image, DOC, DOCX, PPT, PPTX, TXT, XLS, and XLSX files are allowed.";
  }

  if (file.size > MAX_SUBMISSION_FILE_SIZE) {
    return "Each submission file must be 25MB or less.";
  }

  return "";
}

function isSamePickedFile(a, b) {
  if (!a || !b) return false;

  return (
    a.name === b.name &&
    a.size === b.size &&
    a.type === b.type &&
    a.lastModified === b.lastModified
  );
}

function addSingleFileToQueue(currentFiles, pickedFile) {
  if (!pickedFile) {
    return {
      files: currentFiles,
      error: "No file selected.",
    };
  }

  if (currentFiles.length >= MAX_SUBMISSION_FILES) {
    return {
      files: currentFiles,
      error: `You can upload up to ${MAX_SUBMISSION_FILES} files only.`,
    };
  }

  const validationError = validateSubmissionFile(pickedFile);

  if (validationError) {
    return {
      files: currentFiles,
      error: validationError,
    };
  }

  const alreadyExists = currentFiles.some((file) =>
    isSamePickedFile(file, pickedFile)
  );

  if (alreadyExists) {
    return {
      files: currentFiles,
      error: "That file is already added.",
    };
  }

  return {
    files: [...currentFiles, pickedFile],
    error: "",
  };
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

function getFilesFromItem(item) {
  if (Array.isArray(item?.files) && item.files.length) {
    return item.files.map((file) => ({
      fileId: getObjectIdString(file?.fileId),
      originalName: file?.originalName || file?.filename || "File",
      filename: file?.filename || file?.originalName || "File",
      mimetype: file?.mimetype || file?.mimeType || "",
      size: Number(file?.size || 0),
    }));
  }

  const legacyId =
    item?.fileId ||
    item?.assignmentFileId ||
    item?.moduleFileId ||
    item?.file?.fileId ||
    "";

  if (!legacyId) return [];

  return [
    {
      fileId: getObjectIdString(legacyId),
      originalName:
        item?.fileName ||
        item?.originalName ||
        item?.filename ||
        item?.file?.originalName ||
        item?.file?.filename ||
        "File",
      filename:
        item?.filename ||
        item?.fileName ||
        item?.file?.filename ||
        "File",
      mimetype: item?.mimeType || item?.mimetype || item?.file?.mimetype || "",
      size: Number(item?.fileSize || item?.size || item?.file?.size || 0),
    },
  ];
}

function getFileUrl(file) {
  const fileId = getObjectIdString(file?.fileId);

  if (!fileId) return "";

  return buildTrainingFileUrl(fileId);
}

function ModalShell({ open, onClose, title, children, maxWidth = "max-w-5xl" }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        className={`max-h-[90vh] w-full ${maxWidth} overflow-hidden rounded-[28px] bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e8ece2] px-6 py-4">
          <h3 className="text-xl font-extrabold text-[#395345]">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d7ddd0] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#395345] transition hover:bg-[#eef1e7]"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function PretestModal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#e8ece2] px-6 py-4">
          <div>
            <h3 className="text-xl font-extrabold text-[#395345]">
              Course Pre-Test
            </h3>

            <p className="mt-1 text-sm text-[#627165]">
              Complete this first before accessing assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d7ddd0] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#395345] transition hover:bg-[#eef1e7]"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(92vh-86px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
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

function getStoredPretestState() {
  try {
    return JSON.parse(localStorage.getItem("trainingPretestState") || "null");
  } catch {
    return null;
  }
}

function saveStoredPretestState(value) {
  if (!value) {
    localStorage.removeItem("trainingPretestState");
    return;
  }

  localStorage.setItem("trainingPretestState", JSON.stringify(value));
}

function isPretestLockResponse(res, data) {
  return res?.status === 403 && /pre-?test/i.test(String(data?.message || ""));
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

function getEmail(user) {
  return user?.email || user?.traineeEmail || user?.studentEmail || "";
}

export default function TraineeAssignment() {
  const navigate = useNavigate();
  const token = getToken();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trainingUser") || "null");
    } catch {
      return null;
    }
  });

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [submissionFiles, setSubmissionFiles] = useState([]);

  const [pretestModalOpen, setPretestModalOpen] = useState(false);
  const [pretestLoading, setPretestLoading] = useState(true);
  const [pretestSubmitting, setPretestSubmitting] = useState(false);
  const [pretestError, setPretestError] = useState("");
  const [pretest, setPretest] = useState(() => getStoredPretestState());
  const [pretestAnswers, setPretestAnswers] = useState({});
  const [pretestResult, setPretestResult] = useState(null);

  async function loadInitialData() {
    if (!token) {
      redirectToTraineeLogin(navigate);
      return;
    }

    try {
      setLoading(true);
      setPretestLoading(true);
      setMsg({ type: "", text: "" });

      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, pretestRes, assessmentsRes] = await Promise.all([
        fetch(`${API_BASE}/training/profile`, { headers }),
        fetch(`${API_BASE}/training/pretest`, { headers }).catch(() => null),
        fetch(`${API_BASE}/training/assessments`, { headers }).catch(() => null),
      ]);

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

      if (fetchedUser) {
        setUser(fetchedUser);
        localStorage.setItem("trainingUser", JSON.stringify(fetchedUser));
      }

      if (pretestRes) {
        if (pretestRes.status === 404) {
          setPretest(null);
          setPretestResult(null);
          saveStoredPretestState(null);
        } else {
          const pretestData = await readJsonSafe(pretestRes);

          if (!pretestRes.ok) {
            if (isTrainingAuthResponse(pretestRes, pretestData)) {
              redirectToTraineeLogin(navigate, {
                message: pretestData?.message || "Please login again.",
              });
              return;
            }

            throw new Error(pretestData?.message || "Failed to load pre-test.");
          }

          const normalizedState = {
            ...pretestData,
            pretest:
              pretestData?.pretest ||
              pretestData?.exam ||
              pretestData?.data ||
              null,
            latestAttempt:
              pretestData?.latestAttempt ||
              pretestData?.result ||
              pretestData?.latestResult ||
              null,
            completed: Boolean(pretestData?.completed),
            requiresPretest: Boolean(pretestData?.requiresPretest ?? true),
          };

          setPretest(normalizedState);
          saveStoredPretestState(normalizedState);

          if (normalizedState?.latestAttempt?.submittedAt) {
            setPretestResult(normalizedState.latestAttempt);
          } else {
            setPretestResult(null);
          }
        }
      } else {
        setPretest(null);
        setPretestResult(null);
      }

      if (assessmentsRes) {
        const assessmentsData = await readJsonSafe(assessmentsRes);

        if (assessmentsRes.ok) {
          setAssessments(
            Array.isArray(assessmentsData?.assessments)
              ? assessmentsData.assessments
              : []
          );
        } else if (isTrainingAuthResponse(assessmentsRes, assessmentsData)) {
          redirectToTraineeLogin(navigate, {
            message: assessmentsData?.message || "Please login again.",
          });
          return;
        } else if (isPretestLockResponse(assessmentsRes, assessmentsData)) {
          setAssessments([]);
        } else {
          throw new Error(
            assessmentsData?.message || "Failed to load assignments."
          );
        }
      } else {
        setAssessments([]);
      }
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to load trainee assignment data.",
      });
    } finally {
      setLoading(false);
      setPretestLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, [token, navigate]);

  const activePretest = pretest?.pretest || null;
  const latestAttempt = pretestResult || pretest?.latestAttempt || null;

  const pretestRequired = Boolean(
    pretest?.requiresPretest ?? pretest?.pretestRequired ?? activePretest
  );

  const pretestCompleted = Boolean(
    latestAttempt?.submittedAt ||
      pretest?.completed ||
      pretest?.alreadyCompleted
  );

  const assignmentLocked = Boolean(pretestRequired && !pretestCompleted);

  const learningPath = normalizeLearningPath(
    latestAttempt?.learningPathLevel ||
      latestAttempt?.learningPath ||
      pretest?.pretest?.learningPathLevel ||
      pretest?.learningPath ||
      user?.learningPathLevel ||
      "beginner"
  );

  const counts = useMemo(() => {
    const source = assignmentLocked ? [] : assessments;

    return {
      upcoming: source.filter((item) => item.tab === "upcoming").length,
      completed: source.filter((item) => item.tab === "completed").length,
      pastDue: source.filter((item) => item.tab === "pastDue").length,
    };
  }, [assessments, assignmentLocked]);

  const filteredAssessments = useMemo(() => {
    if (assignmentLocked) return [];

    const q = search.trim().toLowerCase();
    const base = assessments.filter((item) => item.tab === activeTab);

    const searched = base.filter((item) => {
      const assignmentFiles = getFilesFromItem(item);
      const fileNames = assignmentFiles
        .map((file) => file.originalName || file.filename || "")
        .join(" ");

      const haystack = [
        item.title,
        item.description,
        item.course,
        item.statusText,
        item.deadline,
        fileNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !q || haystack.includes(q);
    });

    return sortAssessments(searched, activeTab);
  }, [assessments, activeTab, search, assignmentLocked]);

  const courseLabel = useMemo(() => user?.course || "Not assigned", [user]);

  const questionCount = Array.isArray(activePretest?.questions)
    ? activePretest.questions.length
    : 0;

  const answeredCount = useMemo(() => {
    return Object.keys(pretestAnswers).filter(
      (key) =>
        typeof pretestAnswers[key] === "string" &&
        pretestAnswers[key].trim()
    ).length;
  }, [pretestAnswers]);

  const traineeName = getFullName(user) || "Trainee Full Name";
  const traineeEmail = getEmail(user) || "traineeemail@tamsi.com";
  const profilePhotoUrl = buildFileUrl(user?.profilePhoto);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const goToProfile = () => {
    if (token) goTo("/trainee-profile");
    else goTo("/trainee-login");
  };

  const handleSignOut = () => {
    clearTrainingSession();
    navigate("/trainee-login", { replace: true });
  };

  function openAssessment(item) {
    if (assignmentLocked) {
      setMsg({
        type: "error",
        text: "Please take and complete the pre-test before opening professor assignments.",
      });
      return;
    }

    setSelectedAssessment(item);
    setSubmissionFiles([]);
  }

  function closeAssessment() {
    setSelectedAssessment(null);
    setSubmissionFiles([]);
  }

  function handleAddSubmissionFile(event) {
    const pickedFile = event.target.files?.[0] || null;
    const result = addSingleFileToQueue(submissionFiles, pickedFile);

    if (result.error) {
      setMsg({ type: "error", text: result.error });
    } else {
      setMsg({ type: "", text: "" });
      setSubmissionFiles(result.files);
    }

    event.target.value = "";
  }

  function removeQueuedSubmissionFile(indexToRemove) {
    setSubmissionFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  }

  function handlePickPretestAnswer(questionId, answerText) {
    setPretestAnswers((prev) => ({
      ...prev,
      [String(questionId)]: answerText,
    }));
  }

  function openPretestModal() {
    setPretestError("");
    setPretestModalOpen(true);
  }

  function closePretestModal() {
    if (pretestSubmitting) return;
    setPretestModalOpen(false);
  }

  async function handleSubmitPretest() {
    if (!activePretest?.questions?.length) {
      setPretestError("No pre-test questions found.");
      return;
    }

    if (answeredCount !== activePretest.questions.length) {
      setPretestError("Please answer all questions before submitting.");
      return;
    }

    try {
      setPretestSubmitting(true);
      setPretestError("");

      const answers = activePretest.questions.map((item) => ({
        questionId: String(item.id),
        answer: String(pretestAnswers[String(item.id)] || "").trim(),
      }));

      const learningGoalValue =
        typeof user?.learningGoal === "string" ? user.learningGoal : "";

      const res = await fetch(`${API_BASE}/training/pretest/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers,
          learningGoal: learningGoalValue,
        }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Failed to submit pre-test.");
      }

      const result = data?.pretest || null;

      setPretestResult(result);

      const nextState = {
        ...(pretest || {}),
        requiresPretest: true,
        completed: true,
        latestAttempt: result,
        pretest: {
          ...(pretest?.pretest || {}),
          questions: [],
        },
      };

      setPretest(nextState);
      saveStoredPretestState(nextState);
      setPretestModalOpen(false);

      setMsg({
        type: "success",
        text: `Pre-test submitted. Your learning path is ${learningPathLabel(
          result?.learningPathLevel
        )}. Assignments are now unlocked.`,
      });

      await loadInitialData();
    } catch (err) {
      setPretestError(err.message || "Failed to submit pre-test.");
    } finally {
      setPretestSubmitting(false);
    }
  }

  async function submitAssignment() {
    try {
      if (assignmentLocked) {
        throw new Error("Please complete the pre-test before submitting assignments.");
      }

      if (!selectedAssessment?.assessmentId && !selectedAssessment?.id) {
        throw new Error("Assignment id is missing.");
      }

      if (!submissionFiles.length) {
        throw new Error("Please add at least 1 submission file.");
      }

      setSubmitting(true);
      setMsg({ type: "", text: "" });

      const formData = new FormData();

      submissionFiles.forEach((file) => {
        formData.append("submissionFiles", file);
      });

      const assessmentId =
        selectedAssessment.assessmentId || selectedAssessment.id;

      const res = await fetch(
        `${API_BASE}/training/assessments/${assessmentId}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Failed to submit assignment.");
      }

      setMsg({
        type: "success",
        text: data?.message || "Assignment submitted successfully.",
      });

      setSubmissionFiles([]);
      await loadInitialData();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to submit assignment.",
      });
    } finally {
      setSubmitting(false);
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
        activeKey="assignment"
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
              Assignment <span>Submission</span>
            </h2>
            <p className="ltc-hero-text" style={fontPontano}>
              Review professor assignments, complete required pre-tests, and submit your assignment files for grading.
            </p>
          </div>
        </section>

        <section className="ltc-attendance-overview">
          <div className="ltc-container">
            <div className="ltc-attendance-panel">
              <div className="ltc-attendance-header-row">
                <div>
                  <h1 className="ltc-attendance-title" style={fontMontserrat}>
                    My Assignments
                  </h1>
                  <p className="ltc-attendance-subtitle" style={fontPoppins}>
                    Choose a status below to review upcoming, past due, and completed assignments.
                  </p>

                  <div className="ltc-assignment-meta-row">
                    <span>Course: {courseLabel}</span>
                    {pretestCompleted ? (
                      <span>Learning Path: {learningPathLabel(learningPath)}</span>
                    ) : (
                      <span>Pre-Test Required</span>
                    )}
                  </div>
                </div>

                <div className="ltc-trainee-card">
                  <p className="ltc-trainee-label" style={fontPoppins}>Trainee</p>
                  <h2 className="ltc-trainee-name" style={fontMontserrat}>{traineeName}</h2>
                  <p className="ltc-trainee-email" style={fontPontano}>{traineeEmail}</p>
                </div>
              </div>

              <div className="ltc-filter-grid">
                <FilterButton
                  active={activeTab === "upcoming"}
                  label="Upcoming"
                  count={counts.upcoming}
                  onClick={() => setActiveTab("upcoming")}
                />

                <FilterButton
                  active={activeTab === "pastDue"}
                  label="Past Due"
                  count={counts.pastDue}
                  onClick={() => setActiveTab("pastDue")}
                />

                <FilterButton
                  active={activeTab === "completed"}
                  label="Completed"
                  count={counts.completed}
                  onClick={() => setActiveTab("completed")}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="ltc-attendance-list-section">
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

            {pretestCompleted && latestAttempt ? (
              <div className="ltc-assignment-pretest-card">
                <div>
                  <h3 style={fontMontserrat}>Pre-Test Completed</h3>
                  <p style={fontPontano}>Assignments are now unlocked for your account.</p>
                </div>
                <div className="ltc-assignment-pretest-badges">
                  <span>Score: {Number(latestAttempt?.scorePercent || 0)}%</span>
                  <span>Path: {learningPathLabel(latestAttempt?.learningPathLevel || latestAttempt?.learningPath)}</span>
                </div>
              </div>
            ) : null}

            {assignmentLocked ? (
              <div className="ltc-assignment-lock-card">
                <div>
                  <h2 style={fontMontserrat}>Pre-Test Required</h2>
                  <p style={fontPontano}>
                    You need to take and submit the course pre-test before you can open or answer assignments uploaded by your professor.
                  </p>
                  <div className="ltc-assignment-meta-row">
                    <span>Course: {courseLabel}</span>
                    <span>Assignments Locked</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openPretestModal}
                  disabled={pretestLoading}
                  className="ltc-action-button ltc-assignment-lock-button"
                  style={fontMontserrat}
                >
                  {pretestLoading ? "Loading..." : "Take Pre-Test"}
                </button>
              </div>
            ) : (
              <div className="ltc-assignment-toolbar">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assignment"
                  className="ltc-assignment-search"
                />

                <div className="ltc-assignment-count-pills">
                  <span>Upcoming: {counts.upcoming}</span>
                  <span>Past Due: {counts.pastDue}</span>
                  <span>Completed: {counts.completed}</span>
                </div>
              </div>
            )}

            {loading || pretestLoading ? (
              <div className="ltc-empty-state">Loading assignments...</div>
            ) : assignmentLocked ? (
              <div className="ltc-empty-state">
                Professor assignments are hidden until you finish the pre-test.
              </div>
            ) : filteredAssessments.length === 0 ? (
              <div className="ltc-empty-state">No assignments found in this tab.</div>
            ) : (
              <div className="ltc-attendance-grid">
                {filteredAssessments.map((item, index) => {
                  const fileCount = getFilesFromItem(item).length;
                  const submittedCount = item.submission
                    ? getFilesFromItem(item.submission).length
                    : 0;

                  return (
                    <article
                      key={item.id || item.assessmentId}
                      className="ltc-attendance-card ltc-assignment-card"
                      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
                    >
                      <div className="ltc-card-top">
                        <span className="ltc-attendance-icon">
                          <PaperIcon />
                        </span>

                        <div>
                          <h2 className="ltc-card-title" style={fontMontserrat}>
                            Assignment
                          </h2>
                          <p className="ltc-card-date" style={fontPoppins}>
                            {formatCardDate(item.dueDate)}
                          </p>
                          <p className="ltc-card-due" style={fontPontano}>
                            {getDaysMeta(item.dueDate, item.tab)} {item.dueDate ? formatCardTime(item.dueDate) : ""}
                          </p>
                        </div>
                      </div>

                      <div className="ltc-badge-row">
                        <span className={`ltc-status-badge ${getStatusClasses(item.tab)}`}>
                          {item.statusText || getTabLabel(item.tab)}
                        </span>
                        <span className="ltc-status-badge">Files: {fileCount}</span>
                        {submittedCount ? (
                          <span className="ltc-status-badge bg-green-50">
                            Submitted: {submittedCount}
                          </span>
                        ) : null}
                      </div>

                      <div className="ltc-card-action-row">
                        <button
                          type="button"
                          onClick={() => openAssessment(item)}
                          className="ltc-action-button"
                          style={fontMontserrat}
                        >
                          {getAssessmentActionLabel(item)}
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

      <PretestModal open={pretestModalOpen} onClose={closePretestModal}>
        {activePretest ? (
          <div>
            <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
              <div className="text-lg font-extrabold text-[#395345]">
                {activePretest.title || "Course Pre-Test"}
              </div>

              <p className="mt-2 text-sm text-[#627165]">
                {activePretest.description ||
                  "Answer all questions before submitting."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#eef1e7] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#395345]">
                  {questionCount} questions
                </span>

                <span className="rounded-full bg-[#eef1e7] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#395345]">
                  Passing Score{" "}
                  {Number(activePretest.passingScorePercent || 60)}%
                </span>
              </div>
            </div>

            {pretestError ? (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 ring-1 ring-red-200">
                {pretestError}
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              {(activePretest.questions || []).map((question, index) => {
                const questionId = String(question.id);
                const selectedAnswer = pretestAnswers[questionId] || "";

                return (
                  <div
                    key={questionId}
                    className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]"
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                      Question {index + 1}
                    </div>

                    <div className="mt-2 text-base font-semibold text-[#395345]">
                      {question.prompt}
                    </div>

                    <div className="mt-4 grid gap-3">
                      {(question.options || []).map((option, optionIndex) => {
                        const optionText =
                          typeof option === "string"
                            ? option
                            : option?.label ||
                              option?.text ||
                              option?.value ||
                              "";

                        const checked = selectedAnswer === optionText;

                        return (
                          <label
                            key={`${questionId}-${optionIndex}`}
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                              checked
                                ? "border-[#395345] bg-[#eef1e7]"
                                : "border-[#dde3d6] bg-[#f7f8f3]"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`pretest-${questionId}`}
                              checked={checked}
                              onChange={() =>
                                handlePickPretestAnswer(questionId, optionText)
                              }
                              className="mt-1 h-4 w-4"
                            />

                            <span className="text-sm text-[#395345]">
                              {optionText}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da] md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-[#627165]">
                Answered {answeredCount} of {questionCount}
              </div>

              <button
                type="button"
                onClick={handleSubmitPretest}
                disabled={pretestSubmitting}
                className="rounded-2xl bg-[#395345] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white disabled:opacity-60"
              >
                {pretestSubmitting ? "Submitting..." : "Submit Pre-Test"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#f7f8f3] px-5 py-6 text-sm text-[#627165] ring-1 ring-[#e2e8da]">
            No pre-test is configured for this course yet.
          </div>
        )}
      </PretestModal>

      <ModalShell
        open={Boolean(selectedAssessment)}
        onClose={closeAssessment}
        title={selectedAssessment?.title || "Assignment Details"}
        maxWidth="max-w-6xl"
      >
        {selectedAssessment ? (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ring-1 ${getStatusClasses(
                      selectedAssessment.tab
                    )}`}
                  >
                    {selectedAssessment.statusText ||
                      getTabLabel(selectedAssessment.tab)}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#395345] ring-1 ring-[#d7ddd0]">
                    {selectedAssessment.course || "-"}
                  </span>
                </div>

                <div className="mt-4 text-2xl font-extrabold text-[#395345]">
                  {selectedAssessment.title}
                </div>

                <p className="mt-3 text-sm leading-7 text-[#647166]">
                  {selectedAssessment.description ||
                    "No description provided."}
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <DetailBox
                    label="Upload Opens"
                    value={formatDateTime(selectedAssessment.uploadOpenAt)}
                  />

                  <DetailBox
                    label="Due Date"
                    value={formatDateTime(selectedAssessment.dueDate)}
                  />

                  <DetailBox
                    label="Total Points"
                    value={Number(selectedAssessment.totalPoints || 0)}
                    strong
                  />

                  <DetailBox
                    label="Score"
                    value={
                      selectedAssessment.score != null
                        ? `${selectedAssessment.score}/${selectedAssessment.totalPoints}`
                        : "Not graded yet"
                    }
                    strong
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
                <div className="text-sm font-bold text-[#395345]">
                  Assignment Files
                </div>

                <p className="mt-1 text-xs text-[#647166]">
                  Review the files attached by your professor.
                </p>

                <div className="mt-4 space-y-4">
                  {getFilesFromItem(selectedAssessment).length ? (
                    getFilesFromItem(selectedAssessment).map((file, index) => {
                      const fileUrl = getFileUrl(file);
                      const fileName =
                        file?.originalName ||
                        file?.filename ||
                        `Assignment File ${index + 1}`;

                      return (
                        <FilePreviewCard
                          key={`${file.fileId || fileName}-${index}`}
                          file={file}
                          index={index}
                          fileUrl={fileUrl}
                          fileName={fileName}
                        />
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3 text-sm text-[#647166]">
                      No assignment files attached.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
              <div className="text-sm font-bold text-[#395345]">
                Your Submission
              </div>

              <p className="mt-1 text-xs text-[#647166]">
                You can upload up to 5 files for the professor to grade.
              </p>

              {selectedAssessment.submission ? (
                <div className="mt-4">
                  <div className="rounded-xl bg-[#eef1e7] px-4 py-3 text-sm font-semibold text-[#395345]">
                    Submitted at:{" "}
                    {formatDateTime(selectedAssessment.submission.submittedAt)}
                  </div>

                  <div className="mt-4 space-y-3">
                    {getFilesFromItem(selectedAssessment.submission).map(
                      (file, index) => {
                        const fileUrl = getFileUrl(file);
                        const fileName =
                          file?.originalName ||
                          file?.filename ||
                          `Submission File ${index + 1}`;

                        return (
                          <div
                            key={`${file.fileId || fileName}-${index}`}
                            className="flex items-center justify-between rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3"
                          >
                            <div className="min-w-0 pr-4">
                              <div className="truncate text-sm font-semibold text-[#395345]">
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
                                className="rounded-xl border border-[#c6ccb9] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#395345]"
                              >
                                Open
                              </a>
                            ) : null}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3 text-sm text-[#647166]">
                  No submission yet.
                </div>
              )}

              {selectedAssessment.canSubmit ? (
                <div className="mt-5">
                  <div className="text-sm font-bold text-[#395345]">
                    Add Submission Files
                  </div>

                  <p className="mt-1 text-xs text-[#647166]">
                    {getSubmissionHelperText(selectedAssessment)}
                  </p>

                  <input
                    type="file"
                    onChange={handleAddSubmissionFile}
                    className="mt-4 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                  />

                  {submissionFiles.length ? (
                    <div className="mt-4 space-y-2">
                      {submissionFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${file.size}-${index}`}
                          className="flex items-center justify-between rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3"
                        >
                          <div className="min-w-0 pr-4">
                            <div className="truncate text-sm font-semibold text-[#395345]">
                              {index + 1}. {file.name}
                            </div>

                            <div className="mt-1 text-xs text-[#647166]">
                              {formatBytes(file.size)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeQueuedSubmissionFile(index)}
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={submitAssignment}
                      disabled={submitting}
                      className="rounded-2xl bg-[#395345] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#2f463a] disabled:opacity-60"
                    >
                      {getSubmitButtonLabel(selectedAssessment, submitting)}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3 text-sm text-[#647166]">
                  {getClosedSubmissionMessage(selectedAssessment)}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </ModalShell>

      <Footer goTo={goTo} />

      {mobileOpen ? (
        <MobileMenu
          onClose={() => setMobileOpen(false)}
          goTo={goTo}
          goToProfile={goToProfile}
          activeKey="assignment"
        />
      ) : null}
    </div>
  );
}

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

function DetailBox({ label, value, strong = false }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
        {label}
      </div>

      <div
        className={[
          "mt-2 text-sm text-[#395345]",
          strong ? "font-semibold" : "",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function FilePreviewCard({ file, index, fileUrl, fileName }) {
  return (
    <div className="rounded-2xl border border-[#dde3d6] bg-[#f7f8f3] p-4">
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
            className="rounded-xl border border-[#c6ccb9] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#395345]"
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
          Preview is not available for this file type. Use the Open button
          above.
        </div>
      )}
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

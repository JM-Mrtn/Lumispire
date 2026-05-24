// src/TrainingAndAssessment/TraineeProgress.jsx
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
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
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


  @keyframes ltcProgressFill {
    from { width: 0; }
  }

  .ltc-progress-overview {
    position: relative;
    padding: 86px 0 72px;
    background:
      radial-gradient(circle at 14% 0%, rgba(215,168,77,.16), transparent 30%),
      linear-gradient(180deg,#f5faf7 0%,#ffffff 100%);
  }

  .ltc-progress-panel {
    position: relative;
    overflow: hidden;
    border-radius: 32px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(215,168,77,.24);
    box-shadow: var(--shadow-lg);
    padding: 34px;
    animation: ltcFadeUp .75s var(--ease) both;
  }

  .ltc-progress-panel::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 7px;
    background: linear-gradient(90deg,var(--green-800),var(--gold),var(--green-700));
  }

  .ltc-progress-header-row {
    display: grid;
    grid-template-columns: minmax(0,1fr) 320px;
    gap: 26px;
    align-items: stretch;
  }

  .ltc-progress-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    border-radius: 999px;
    background: rgba(35,95,62,.08);
    border: 1px solid rgba(35,95,62,.12);
    padding: 7px 12px;
    color: var(--green-800);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .ltc-progress-title {
    margin: 0;
    color: var(--green-900);
    font-size: clamp(30px, 4vw, 52px);
    line-height: 1;
    font-weight: 900;
    letter-spacing: -.05em;
  }

  .ltc-progress-subtitle {
    max-width: 680px;
    margin: 12px 0 0;
    color: var(--muted);
    font-size: 16px;
  }

  .ltc-progress-user-card {
    min-height: 100%;
    border-radius: 28px;
    background: linear-gradient(135deg,var(--green-900),var(--green-700));
    color: white;
    padding: 24px;
    box-shadow: 0 24px 60px rgba(8,39,25,.18);
    transition: .35s var(--ease);
  }

  .ltc-progress-user-card:hover { transform: translateY(-6px); }
  .ltc-progress-user-card p { margin: 0; color: rgba(255,255,255,.72); }
  .ltc-progress-user-card h2 { margin: 7px 0 4px; font-size: 22px; line-height: 1.1; color: white; }

  .ltc-progress-radial-wrap {
    display: grid;
    grid-template-columns: 230px minmax(0,1fr);
    gap: 26px;
    align-items: center;
    margin-top: 32px;
    border-radius: 28px;
    background:
      radial-gradient(circle at 15% 20%, rgba(244,212,132,.24), transparent 28%),
      linear-gradient(135deg,var(--green-950),var(--green-800));
    padding: 28px;
    color: white;
  }

  .ltc-progress-ring {
    width: 190px;
    height: 190px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: conic-gradient(var(--gold) var(--progress-deg), rgba(255,255,255,.16) 0deg);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.16), 0 24px 48px rgba(0,0,0,.2);
    margin: auto;
    transition: transform .35s var(--ease);
  }

  .ltc-progress-ring:hover { transform: scale(1.04) rotate(2deg); }
  .ltc-progress-ring-inner {
    width: 138px;
    height: 138px;
    border-radius: inherit;
    display: grid;
    place-items: center;
    background: var(--green-950);
    text-align: center;
  }
  .ltc-progress-ring-inner strong { display:block; font-size: 36px; line-height: 1; color: white; }
  .ltc-progress-ring-inner span { display:block; margin-top: 6px; color: rgba(255,255,255,.68); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }

  .ltc-progress-summary h3 { margin: 0; font-size: 27px; color: white; font-weight: 900; }
  .ltc-progress-summary p { margin: 8px 0 0; color: rgba(255,255,255,.72); }

  .ltc-progress-stat-grid {
    display: grid;
    grid-template-columns: repeat(4,minmax(0,1fr));
    gap: 16px;
    margin-top: 22px;
  }

  .ltc-progress-stat-card,
  .ltc-progress-bar-card,
  .ltc-progress-check-card,
  .ltc-progress-competency-card {
    border-radius: 24px;
    background: white;
    border: 1px solid #e8ece2;
    box-shadow: var(--shadow-md);
    transition: transform .35s var(--ease), box-shadow .35s var(--ease), border-color .35s var(--ease);
    animation: ltcFadeUp .72s var(--ease) both;
  }

  .ltc-progress-stat-card:hover,
  .ltc-progress-bar-card:hover,
  .ltc-progress-check-card:hover,
  .ltc-progress-competency-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
    border-color: rgba(215,168,77,.48);
  }

  .ltc-progress-stat-card { padding: 20px; }
  .ltc-progress-stat-card span { display:block; color: var(--muted); font-size: 11px; font-weight: 900; letter-spacing: .13em; text-transform: uppercase; }
  .ltc-progress-stat-card strong { display:block; margin-top: 10px; color: var(--green-900); font-size: 22px; line-height: 1.1; }
  .ltc-progress-stat-card small { display:block; margin-top: 6px; color: var(--muted); font-weight: 700; }

  .ltc-progress-content-grid {
    display: grid;
    grid-template-columns: minmax(0,.82fr) minmax(0,1.18fr);
    gap: 24px;
    margin-top: 26px;
  }

  .ltc-progress-stack { display: grid; gap: 20px; }
  .ltc-progress-bar-card { padding: 22px; }
  .ltc-progress-card-title { margin: 0; color: var(--green-900); font-size: 18px; font-weight: 900; }
  .ltc-progress-card-subtitle { margin: 4px 0 0; color: var(--muted); font-size: 13px; font-weight: 700; }

  .ltc-progress-bar-track {
    height: 14px;
    overflow: hidden;
    border-radius: 999px;
    background: #e8ece2;
    margin-top: 18px;
  }
  .ltc-progress-bar-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
    animation: ltcProgressFill 1s var(--ease) both;
  }

  .ltc-progress-check-card { overflow: hidden; }
  .ltc-progress-card-head { padding: 22px 22px 16px; border-bottom: 1px solid #e8ece2; }
  .ltc-progress-check-list { padding: 18px 22px 22px; display:grid; gap: 12px; }
  .ltc-progress-check-row {
    display: flex;
    gap: 12px;
    align-items: center;
    border-radius: 16px;
    background: #f7faf8;
    padding: 13px 14px;
    color: var(--green-900);
    font-weight: 800;
    transition: .3s var(--ease);
  }
  .ltc-progress-check-row:hover { transform: translateX(5px); background: #eef6f0; }
  .ltc-progress-check-mark {
    width: 24px;
    height: 24px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 2px solid #c9d4c7;
    color: transparent;
    font-size: 12px;
    font-weight: 900;
  }
  .ltc-progress-check-mark.done { background: var(--green-700); border-color: var(--green-700); color: white; }
  .ltc-progress-requirements { margin: 14px 22px 22px; border-radius: 18px; padding: 16px; font-weight: 700; }
  .ltc-progress-requirements.error { background: #fff1f1; color: #9b1c1c; border: 1px solid #ffd4d4; }
  .ltc-progress-requirements.success { background: #eefaf1; color: #166534; border: 1px solid #c7f0d0; }

  .ltc-progress-competency-card { overflow: hidden; }
  .ltc-progress-competency-head { background: linear-gradient(135deg,var(--green-900),var(--green-700)); padding: 20px 22px; color: white; }
  .ltc-progress-competency-head h3 { margin: 0; color: white; font-size: 18px; }
  .ltc-progress-competency-body { padding: 18px; display:grid; gap: 12px; }
  .ltc-progress-competency-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    border-radius: 18px;
    background: #f7faf8;
    padding: 14px;
    transition: .3s var(--ease);
  }
  .ltc-progress-competency-item:hover { transform: translateY(-3px); background: #eef6f0; }
  .ltc-progress-competency-item strong { color: var(--green-900); font-size: 14px; }
  .ltc-progress-competency-item p { margin: 2px 0 0; color: var(--muted); font-size: 12px; font-weight: 700; }
  .ltc-progress-empty { border-radius: 18px; background: #f7faf8; color: var(--muted); padding: 18px; font-weight: 800; }

  @media (max-width: 980px) {
    .ltc-progress-header-row,
    .ltc-progress-radial-wrap,
    .ltc-progress-content-grid { grid-template-columns: 1fr; }
    .ltc-progress-stat-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  }
  @media (max-width: 620px) {
    .ltc-progress-panel { padding: 22px; border-radius: 24px; }
    .ltc-progress-stat-grid { grid-template-columns: 1fr; }
    .ltc-progress-ring { width: 168px; height: 168px; }
    .ltc-progress-ring-inner { width: 122px; height: 122px; }
  }
`;

function getToken() {
  return localStorage.getItem("trainingToken") || "";
}

async function readJsonSafe(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { throw new Error(text?.slice(0, 180) || "Invalid server response."); }
}

function normalizeSlashes(value) {
  return String(value || "").trim().replace(/\\/g, "/");
}

function getObjectIdString(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value.$oid) return String(value.$oid);
    if (value.toString && value.toString() !== "[object Object]") return String(value.toString());
  }
  return "";
}

function getFilePath(file) {
  if (!file) return "";
  if (typeof file === "string") return normalizeSlashes(file);
  if (typeof file === "object") {
    return normalizeSlashes(file.filePath || file.path || file.url || file.secure_url || file.location || file.file || "");
  }
  return "";
}

function getFileId(file) {
  if (!file || typeof file !== "object") return "";
  return getObjectIdString(file.fileId);
}

function buildFileUrl(file) {
  const fileId = getFileId(file);
  if (fileId) return buildTrainingFileUrl(fileId);
  const filePath = getFilePath(file);
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const fileIdMatch = filePath.match(/(?:^|\/)api\/training-files\/([^/?#]+)/i);
  if (fileIdMatch?.[1]) return buildTrainingFileUrl(fileIdMatch[1]);
  return `${API_ORIGIN}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
}

function percentage(completed, required) {
  if (!required) return 100;
  return Math.min(100, Math.round((Number(completed || 0) / Number(required || 1)) * 100));
}

function getFullName(user) {
  const direct = user?.fullName || user?.name || user?.traineeName || user?.studentName || "";
  if (direct) return direct;
  return [user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(" ");
}

function getEmail(user) {
  return user?.email || user?.traineeEmail || user?.studentEmail || "";
}

function ProgressBar({ completed, required, label }) {
  const pct = percentage(completed, required);
  return (
    <div className="ltc-progress-bar-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
        <div>
          <h3 className="ltc-progress-card-title" style={fontMontserrat}>{label}</h3>
          <p className="ltc-progress-card-subtitle" style={fontPoppins}>{completed} of {required} completed</p>
        </div>
        <strong style={{ color: "#174a30", fontSize: 18 }}>{pct}%</strong>
      </div>
      <div className="ltc-progress-bar-track">
        <div className="ltc-progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext = "" }) {
  return (
    <div className="ltc-progress-stat-card">
      <span style={fontPoppins}>{label}</span>
      <strong style={fontMontserrat}>{value}</strong>
      {subtext ? <small style={fontPontano}>{subtext}</small> : null}
    </div>
  );
}

function ChecklistRow({ label, checked }) {
  return (
    <div className="ltc-progress-check-row" style={fontPoppins}>
      <span className={`ltc-progress-check-mark ${checked ? "done" : ""}`}>✓</span>
      <span>{label}</span>
    </div>
  );
}

function CompetencySection({ title, items = [] }) {
  return (
    <article className="ltc-progress-competency-card">
      <div className="ltc-progress-competency-head">
        <h3 style={fontMontserrat}>{title}</h3>
      </div>
      <div className="ltc-progress-competency-body">
        {items.length ? (
          items.map((item) => (
            <div key={item.code} className="ltc-progress-competency-item">
              <span className={`ltc-progress-check-mark ${item.completed ? "done" : ""}`}>✓</span>
              <div>
                <strong style={fontPoppins}>{item.label}</strong>
                <p style={fontPontano}>{item.code}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="ltc-progress-empty" style={fontPoppins}>No competencies listed yet.</div>
        )}
      </div>
    </article>
  );
}

export default function TraineeProgress() {
  const navigate = useNavigate();
  const token = useMemo(() => getToken(), []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("trainingUser") || "null"); } catch { return null; }
  });
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const loadProgress = async () => {
      if (!token) {
        setLoading(false);
        redirectToTraineeLogin(navigate);
        return;
      }
      try {
        setLoading(true);
        setMsg({ type: "", text: "" });
        const res = await fetch(`${API_BASE}/training/progress`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await readJsonSafe(res);
        if (!res.ok) {
          if (isTrainingAuthResponse(res, data)) {
            redirectToTraineeLogin(navigate, { message: data?.message || "Please login again." });
            return;
          }
          throw new Error(data?.message || "Failed to load trainee progress.");
        }
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("trainingUser", JSON.stringify(data.user));
        }
        setProgress(data?.progress || null);
      } catch (err) {
        setMsg({ type: "error", text: err.message || "Failed to load trainee progress." });
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, [token, navigate]);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const goToProfile = () => {
    const savedToken = localStorage.getItem("trainingToken");
    goTo(savedToken ? "/trainee-profile" : "/trainee-login");
  };

  const profilePhotoUrl = buildFileUrl(user?.profilePhoto);
  const fullName = getFullName(user) || "Trainee Full Name";
  const email = getEmail(user) || "traineeemail@tamsi.com";
  const courseLabel = progress?.course || user?.course || "Not assigned";
  const trainingStatus = progress?.trainingStatus || user?.trainingStatus || "Enrolled";
  const progressPercent = Number(progress?.progressPercent || 0);
  const completedCompetencies = Number(progress?.competencyCounts?.completed || 0);
  const totalCompetencies = Number(progress?.competencyCounts?.total || 0);
  const allCompetenciesComplete = completedCompetencies >= totalCompetencies;

  return (
    <div className="ltc-trainee-home-page">
      <style>{pageStyles}</style>

      <Header
        goTo={goTo}
        goToProfile={goToProfile}
        profilePhotoUrl={profilePhotoUrl}
        onOpenMenu={() => setMobileOpen(true)}
        activeKey="progress"
      />

      <main>
        <section className="ltc-hero">
          <img
            src="/TrainingBanner.png"
            alt="TAMSI Training Banner"
            className="ltc-hero-slide"
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
          <div className="ltc-container ltc-hero-content">
            <h2 className="ltc-hero-title" style={fontMontserrat}>
              Training <span>Progress</span>
            </h2>
            <p className="ltc-hero-text" style={fontPontano}>
              Monitor your course progress, completed competencies, pre-test status, and remaining completion requirements.
            </p>
          </div>
        </section>

        <section className="ltc-progress-overview">
          <div className="ltc-container">
            {msg.text ? (
              <div className={`ltc-alert ${msg.type === "success" ? "ltc-alert-success" : "ltc-alert-error"}`}>
                {msg.text}
              </div>
            ) : null}

            {loading ? (
              <div className="ltc-empty-state">Loading progress...</div>
            ) : (
              <div className="ltc-progress-panel">
                <div className="ltc-progress-header-row">
                  <div>
                    <span className="ltc-progress-eyebrow" style={fontPoppins}>Progress dashboard</span>
                    <h1 className="ltc-progress-title" style={fontMontserrat}>My Training Status</h1>
                    <p className="ltc-progress-subtitle" style={fontPontano}>
                      A clean overview of your completion percentage, course status, required pre-test, and competency progress.
                    </p>
                  </div>

                  <aside className="ltc-progress-user-card">
                    <p style={fontPoppins}>Trainee</p>
                    <h2 style={fontMontserrat}>{fullName}</h2>
                    <p style={fontPontano}>{email}</p>
                    <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <span className="ltc-tag">{courseLabel}</span>
                      <span className="ltc-tag">{trainingStatus}</span>
                    </div>
                  </aside>
                </div>

                <div className="ltc-progress-radial-wrap">
                  <div className="ltc-progress-ring" style={{ "--progress-deg": `${Math.max(0, Math.min(100, progressPercent)) * 3.6}deg` }}>
                    <div className="ltc-progress-ring-inner">
                      <div>
                        <strong style={fontMontserrat}>{progressPercent}%</strong>
                        <span style={fontPoppins}>Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="ltc-progress-summary">
                    <h3 style={fontMontserrat}>Current Progress</h3>
                    <p style={fontPontano}>
                      Keep completing required activities until your pre-test and competency requirements are marked complete.
                    </p>
                    <div className="ltc-progress-bar-track">
                      <div className="ltc-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="ltc-progress-stat-grid">
                  <StatCard label="Course" value={courseLabel} />
                  <StatCard label="Training Status" value={trainingStatus} />
                  <StatCard label="Overall Progress" value={`${progressPercent}%`} />
                  <StatCard
                    label="Completion"
                    value={progress?.isEligibleForCompletion ? "Ready" : "Ongoing"}
                    subtext={progress?.certificateStatus === "issued" ? "Certificate issued" : ""}
                  />
                </div>

                <div className="ltc-progress-content-grid">
                  <div className="ltc-progress-stack">
                    <ProgressBar label="Competencies" completed={completedCompetencies} required={totalCompetencies} />
                    <ProgressBar label="Pre-Test" completed={progress?.pretestCompleted ? 1 : 0} required={1} />

                    <section className="ltc-progress-check-card">
                      <div className="ltc-progress-card-head">
                        <h3 className="ltc-progress-card-title" style={fontMontserrat}>Completion Checklist</h3>
                        <p className="ltc-progress-card-subtitle" style={fontPoppins}>Requirements before course completion review.</p>
                      </div>

                      <div className="ltc-progress-check-list">
                        <ChecklistRow label="Pre-test completed" checked={Boolean(progress?.pretestCompleted)} />
                        <ChecklistRow label="All competencies completed" checked={allCompetenciesComplete} />
                      </div>

                      {!progress?.isEligibleForCompletion && Array.isArray(progress?.incompleteReasons) && progress.incompleteReasons.length ? (
                        <div className="ltc-progress-requirements error">
                          <strong style={fontMontserrat}>Remaining requirements</strong>
                          <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                            {progress.incompleteReasons.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                      ) : (
                        <div className="ltc-progress-requirements success" style={fontPoppins}>
                          You are ready for course completion review.
                        </div>
                      )}
                    </section>
                  </div>

                  <div className="ltc-progress-stack">
                    {(progress?.competencyGroups || []).length ? (
                      (progress?.competencyGroups || []).map((group) => (
                        <CompetencySection key={group.title} title={group.title} items={group.items || []} />
                      ))
                    ) : (
                      <CompetencySection title="Competencies" items={[]} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer goTo={goTo} />
      {mobileOpen ? (
        <MobileMenu
          onClose={() => setMobileOpen(false)}
          goTo={goTo}
          goToProfile={goToProfile}
          activeKey="progress"
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


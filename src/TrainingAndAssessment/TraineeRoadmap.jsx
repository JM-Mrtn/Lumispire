// src/TrainingAndAssessment/TraineeRoadmap.jsx
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
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

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
    display: none !important;
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



  @keyframes ltcFadeUp {
    from { opacity: 0; transform: translateY(26px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes ltcFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes ltcFloatSoft {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @keyframes ltcPulseRing {
    0%, 100% { box-shadow: 0 0 0 0 rgba(215,168,77,.35), 0 18px 34px rgba(8,39,25,.14); }
    50% { box-shadow: 0 0 0 10px rgba(215,168,77,0), 0 24px 44px rgba(8,39,25,.18); }
  }

  .ltc-hero-content,
  .ltc-home-shell,
  .roadmap-info-panel,
  .roadmap-flow-panel,
  .roadmap-mobile-card,
  .roadmap-alert {
    animation: ltcFadeUp .75s var(--ease) both;
  }

  .ltc-hero-content { animation-delay: .05s; }
  .ltc-home-shell { animation-delay: .1s; }
  .roadmap-info-panel { animation-delay: .18s; }
  .roadmap-flow-panel { animation-delay: .26s; }

  .ltc-hero-slide {
    animation: ltcFadeIn .9s ease both;
    transition: transform 8s ease, filter .6s ease;
  }

  .ltc-hero:hover .ltc-hero-slide {
    transform: scale(1.04);
    filter: saturate(1.08) brightness(1.03);
  }

  .ltc-eyebrow,
  .ltc-section-line {
    animation: ltcFadeUp .7s var(--ease) both;
  }

  .ltc-section-line {
    transition: width .35s var(--ease), filter .35s var(--ease);
  }

  .ltc-home-shell:hover .ltc-section-line {
    width: 240px;
    filter: drop-shadow(0 8px 12px rgba(215,168,77,.22));
  }

  .roadmap-info-panel {
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 24px;
    min-height: 148px;
    padding: 26px;
    border-radius: 26px;
    color: #45674b;
    background:
      linear-gradient(135deg, rgba(255,255,255,.96), rgba(248,250,244,.9)),
      radial-gradient(circle at 14% 0%, rgba(215,168,77,.18), transparent 32%),
      radial-gradient(circle at 100% 70%, rgba(35,95,62,.16), transparent 34%);
    border: 1px solid rgba(69,103,75,.16);
    box-shadow: 0 22px 54px rgba(8,39,25,.11);
    transition: transform .28s var(--ease), box-shadow .28s var(--ease), border-color .28s var(--ease), background .28s var(--ease);
  }

  .roadmap-info-panel::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 7px;
    background: linear-gradient(180deg, var(--gold), var(--green-700));
  }

  .roadmap-info-panel::after {
    content: "";
    position: absolute;
    right: -70px;
    top: -90px;
    width: 230px;
    height: 230px;
    border-radius: 999px;
    background: rgba(215,168,77,.14);
    filter: blur(4px);
    transition: transform .45s var(--ease), opacity .35s var(--ease);
    pointer-events: none;
  }

  .roadmap-info-panel:hover {
    transform: translateY(-6px);
    box-shadow: 0 30px 70px rgba(8,39,25,.17);
    border-color: rgba(215,168,77,.55);
  }

  .roadmap-info-panel:hover::after {
    transform: scale(1.1) translate(-12px, 12px);
    opacity: .9;
  }

  .roadmap-info-content {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    align-items: center;
    gap: 18px;
    min-width: 0;
  }

  .roadmap-info-icon {
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    border-radius: 22px;
    color: #f4d484;
    background: linear-gradient(145deg, var(--green-900), var(--green-700));
    box-shadow: 0 18px 32px rgba(8,39,25,.18), inset 0 0 0 1px rgba(255,255,255,.12);
    transition: transform .28s var(--ease), box-shadow .28s var(--ease);
  }

  .roadmap-info-icon svg {
    width: 34px;
    height: 34px;
  }

  .roadmap-info-panel:hover .roadmap-info-icon {
    transform: rotate(-4deg) scale(1.06);
    box-shadow: 0 22px 38px rgba(8,39,25,.24), inset 0 0 0 1px rgba(255,255,255,.18);
  }

  .roadmap-info-copy { min-width: 0; }

  .roadmap-info-kicker {
    display: inline-flex;
    margin-bottom: 4px;
    color: #9a6b19;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .roadmap-info-title {
    margin: 0;
    color: #2f5b39;
    font-size: clamp(23px, 2.4vw, 32px);
    line-height: 1.06;
    font-weight: 900;
    letter-spacing: -.045em;
  }

  .roadmap-info-text {
    max-width: 720px;
    margin: 9px 0 0;
    color: rgba(69,103,75,.78);
    font-size: 15px;
    line-height: 1.75;
    font-weight: 700;
  }

  .roadmap-info-actions {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(170px, 220px) minmax(190px, auto);
    align-items: center;
    gap: 14px;
  }

  .roadmap-next-card {
    min-height: 86px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 22px;
    padding: 16px 18px;
    text-align: left;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(69,103,75,.15);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.78), 0 14px 28px rgba(8,39,25,.07);
    transition: transform .25s var(--ease), border-color .25s var(--ease), box-shadow .25s var(--ease), background .25s var(--ease);
  }

  .roadmap-next-card:hover {
    transform: translateY(-3px);
    border-color: rgba(215,168,77,.5);
    background: #fffdf7;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 18px 32px rgba(8,39,25,.11);
  }

  .roadmap-next-label {
    color: #7b8678;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .18em;
    text-transform: uppercase;
  }

  .roadmap-next-title {
    margin-top: 6px;
    color: #45674b;
    font-size: 15px;
    line-height: 1.28;
    font-weight: 900;
    word-break: break-word;
  }

  .roadmap-refresh-button {
    min-height: 58px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 0;
    border-radius: 999px;
    padding: 15px 24px;
    color: white;
    background: linear-gradient(135deg, #45674b, #274633);
    box-shadow: 0 16px 34px rgba(8,39,25,.19);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    line-height: 1.25;
    text-transform: uppercase;
    cursor: pointer;
    white-space: normal;
  }

  .roadmap-refresh-button:disabled {
    cursor: not-allowed;
    opacity: .62;
  }

  .roadmap-refresh-icon {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    flex: 0 0 auto;
    border-radius: 999px;
    background: rgba(255,255,255,.16);
    font-size: 16px;
    line-height: 1;
    transition: transform .35s var(--ease), background .25s var(--ease);
  }

  .roadmap-refresh-button:hover:not(:disabled) .roadmap-refresh-icon {
    transform: rotate(180deg);
    background: rgba(255,255,255,.24);
  }

  .roadmap-refresh-button,
  .roadmap-action-button,
  .ltc-nav-link,
  .ltc-sidebar-link,
  .ltc-profile-avatar,
  .ltc-menu-button,
  .ltc-sidebar-close,
  .ltc-footer-link {
    transition: transform .24s var(--ease), box-shadow .24s var(--ease), background .24s var(--ease), color .24s var(--ease), border-color .24s var(--ease), opacity .24s var(--ease);
  }

  .roadmap-refresh-button:hover:not(:disabled),
  .roadmap-action-button:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 18px 34px rgba(8,39,25,.2);
  }

  .roadmap-refresh-button:active:not(:disabled),
  .roadmap-action-button:active:not(:disabled) {
    transform: translateY(-1px) scale(.99);
  }

  .ltc-profile-avatar:hover,
  .ltc-menu-button:hover,
  .ltc-sidebar-close:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 16px 28px rgba(0,0,0,.16);
  }

  .ltc-footer-link:hover {
    transform: translateX(4px);
  }

  .roadmap-step-row {
    animation: ltcFadeUp .65s var(--ease) both;
  }

  .roadmap-step-card {
    position: relative;
    overflow: hidden;
    animation: ltcFadeUp .62s var(--ease) both;
    transition: transform .28s var(--ease), box-shadow .28s var(--ease), border-color .28s var(--ease), filter .28s var(--ease);
  }

  .roadmap-step-card::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 5px;
    background: linear-gradient(90deg, var(--green-700), var(--gold));
    opacity: .75;
    transform: scaleX(.42);
    transform-origin: left;
    transition: transform .35s var(--ease), opacity .35s var(--ease);
  }

  .roadmap-step-card:not(:disabled):hover {
    transform: translateY(-8px) scale(1.015);
    border-color: rgba(215,168,77,.62) !important;
    box-shadow: 0 30px 64px rgba(8,39,25,.18) !important;
    filter: saturate(1.03);
  }

  .roadmap-step-card:not(:disabled):hover::before {
    transform: scaleX(1);
    opacity: 1;
  }

  .roadmap-step-card h3,
  .roadmap-mobile-card .roadmap-mobile-title {
    transition: color .25s var(--ease), transform .25s var(--ease);
  }

  .roadmap-step-card:not(:disabled):hover h3,
  .roadmap-mobile-card:hover .roadmap-mobile-title {
    color: var(--green-900);
    transform: translateY(-1px);
  }

  .roadmap-mini-stat {
    transition: transform .24s var(--ease), background .24s var(--ease), box-shadow .24s var(--ease);
  }

  .roadmap-step-card:not(:disabled):hover .roadmap-mini-stat {
    transform: translateY(-2px);
    background: #fbfaf4;
    box-shadow: inset 0 0 0 1px rgba(215,168,77,.24);
  }

  .roadmap-node {
    transition: transform .28s var(--ease), box-shadow .28s var(--ease), filter .28s var(--ease);
  }

  .roadmap-step-row:hover .roadmap-node {
    transform: scale(1.12) rotate(-3deg);
    animation: ltcPulseRing 1.4s ease-in-out infinite;
    filter: saturate(1.08);
  }

  .roadmap-connector-line {
    transition: background .28s var(--ease), transform .28s var(--ease), box-shadow .28s var(--ease);
  }

  .roadmap-step-row:hover .roadmap-connector-line {
    background: linear-gradient(90deg, var(--gold), var(--green-700));
    transform: translateY(-50%) scaleX(1.12);
    box-shadow: 0 0 16px rgba(215,168,77,.32);
  }

  .roadmap-mobile-card {
    transition: transform .28s var(--ease), box-shadow .28s var(--ease), border-color .28s var(--ease), background .28s var(--ease);
  }

  .roadmap-mobile-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 24px 44px rgba(8,39,25,.13);
    border-color: rgba(215,168,77,.55) !important;
  }

  .roadmap-mobile-node {
    transition: transform .25s var(--ease), box-shadow .25s var(--ease);
  }

  .roadmap-mobile-card:hover .roadmap-mobile-node {
    transform: scale(1.08);
    box-shadow: 0 12px 24px rgba(8,39,25,.18);
  }

  .roadmap-status-pill {
    transition: transform .22s var(--ease), box-shadow .22s var(--ease), filter .22s var(--ease);
  }

  .roadmap-step-card:hover .roadmap-status-pill,
  .roadmap-mobile-card:hover .roadmap-status-pill {
    transform: translateY(-1px);
    filter: saturate(1.08);
    box-shadow: 0 10px 18px rgba(8,39,25,.08);
  }

  @media (prefers-reduced-motion: reduce) {
    .ltc-trainee-home-page *,
    .ltc-trainee-home-page *::before,
    .ltc-trainee-home-page *::after {
      animation-duration: .001ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: .001ms !important;
    }
  }

  @media (max-width: 1180px) {
    .ltc-quick-grid { grid-template-columns: repeat(3, minmax(0,1fr)); }
    .ltc-footer-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 900px) {
    .roadmap-info-panel { grid-template-columns: 1fr; align-items: stretch; padding: 24px; gap: 20px; }
    .roadmap-info-actions { grid-template-columns: 1fr; }
    .roadmap-refresh-button { width: 100%; }
    .ltc-header .ltc-container { padding-left: 22px; padding-right: 22px; }
    .ltc-nav { min-height: auto; padding: 18px 0; }
    .ltc-desktop-nav,
    .ltc-profile-wrap { display: none; }
    .ltc-menu-button { display: none !important; }
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
    .roadmap-info-panel { padding: 22px 18px; border-radius: 22px; }
    .roadmap-info-content { grid-template-columns: 1fr; text-align: left; gap: 14px; }
    .roadmap-info-icon { width: 56px; height: 56px; border-radius: 18px; }
    .roadmap-info-text { font-size: 14px; }
    .roadmap-next-card { min-height: auto; }
    .ltc-header .ltc-container,
    .ltc-footer .ltc-container { padding-left: 16px; padding-right: 16px; }
    .ltc-logo h1 { font-size: 14px; }
    .ltc-logo p { font-size: 10px; }
    .ltc-hero-title { font-size: clamp(34px, 11vw, 46px); letter-spacing: -.045em; }
    .ltc-hero-text { font-size: 15px; }
    .ltc-home-shell { padding: 26px 18px; }
    .ltc-quick-grid { grid-template-columns: 1fr; }
  }
`;


const PASSING_SCORE = 7;
const EXAM_QUESTION_COUNT = 10;

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

function normalizeCourseName(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (clean === "housekeeping") return "Housekeeping";
  if (clean === "event management") return "Event Management";
  return String(value || "").trim();
}

function courseKey(value = "") {
  return normalizeCourseName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function getRoadmapStorageKey(user, course = "") {
  const userId =
    getObjectIdString(user?._id) ||
    getObjectIdString(user?.id) ||
    String(user?.email || "trainee").trim().toLowerCase();

  return `competencyRoadmapProgress:${userId}:${courseKey(
    course || user?.course || "general"
  )}`;
}

function readRoadmapProgress(storageKey) {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "null");

    return {
      examPassed: parsed?.examPassed || {},
      attempts: parsed?.attempts || {},
      scores: parsed?.scores || {},
      completedAt: parsed?.completedAt || {},
      answers: parsed?.answers || {},
    };
  } catch {
    return {
      examPassed: {},
      attempts: {},
      scores: {},
      completedAt: {},
      answers: {},
    };
  }
}

function writeRoadmapProgress(storageKey, value) {
  if (!storageKey) return;
  localStorage.setItem(storageKey, JSON.stringify(value || {}));
}

function flattenCompetencyGroups(groups = []) {
  const safeGroups = Array.isArray(groups) ? groups : [];

  return safeGroups.flatMap((group, groupIndex) => {
    const groupTitle = String(
      group?.title || `Competency Group ${groupIndex + 1}`
    ).trim();

    const items = Array.isArray(group?.items) ? group.items : [];

    return items.map((item, itemIndex) => {
      const label = String(
        item?.label || item?.code || `Competency ${itemIndex + 1}`
      ).trim();

      return {
        id: String(item?.code || `${groupIndex}-${itemIndex}`).trim(),
        code: String(item?.code || "").trim(),
        title: label,
        label,
        description: String(item?.description || "").trim(),
        studyPoints: Array.isArray(item?.studyPoints)
          ? item.studyPoints.map((point) => String(point || "").trim()).filter(Boolean)
          : [],
        studyModuleOverview: String(item?.studyModuleOverview || "").trim(),
        learningObjectives: Array.isArray(item?.learningObjectives)
          ? item.learningObjectives.map((point) => String(point || "").trim()).filter(Boolean)
          : [],
        lessonDiscussion: Array.isArray(item?.lessonDiscussion)
          ? item.lessonDiscussion.map((point) => String(point || "").trim()).filter(Boolean)
          : [],
        stepByStepProcedure: Array.isArray(item?.stepByStepProcedure)
          ? item.stepByStepProcedure.map((point) => String(point || "").trim()).filter(Boolean)
          : [],
        workplaceScenario: String(item?.workplaceScenario || "").trim(),
        practiceActivity: String(item?.practiceActivity || "").trim(),
        keyTerms: Array.isArray(item?.keyTerms)
          ? item.keyTerms.map((point) => String(point || "").trim()).filter(Boolean)
          : [],
        readinessChecklist: Array.isArray(item?.readinessChecklist)
          ? item.readinessChecklist.map((point) => String(point || "").trim()).filter(Boolean)
          : [],
        examQuestions: Array.isArray(item?.examQuestions) ? item.examQuestions : [],
        sequence: Number(item?.sequence || itemIndex + 1),
        groupTitle,
        groupIndex,
        itemIndex,
        professorCompleted: item?.completed === true,
      };
    });
  });
}

function buildLessonPoints(step) {
  const customPoints = Array.isArray(step?.studyPoints)
    ? step.studyPoints.map((point) => String(point || "").trim()).filter(Boolean)
    : [];

  if (customPoints.length) {
    return customPoints;
  }

  const title = String(step?.title || "").toLowerCase();
  const course = normalizeCourseName(step?.course || "");

  if (course === "Housekeeping") {
    if (title.includes("communication") || title.includes("customer")) {
      return [
        "Use polite, calm, and professional communication with guests and coworkers.",
        "Listen carefully to instructions, guest requests, and workplace updates.",
        "Report concerns properly using the correct workplace channel.",
      ];
    }

    if (
      title.includes("hygiene") ||
      title.includes("safety") ||
      title.includes("health")
    ) {
      return [
        "Follow proper hygiene and safety procedures before, during, and after work.",
        "Use personal protective equipment when handling cleaning materials or risky tasks.",
        "Prevent accidents by following safety signs, labels, and workplace rules.",
      ];
    }

    if (title.includes("room") || title.includes("housekeeping")) {
      return [
        "Prepare the room by removing trash and used linens before detailed cleaning.",
        "Clean from cleaner areas to dirtier areas to reduce contamination.",
        "Use a checklist to confirm the room is complete, clean, and guest-ready.",
      ];
    }

    if (title.includes("laundry") || title.includes("linen")) {
      return [
        "Separate clean and soiled linens to maintain hygiene.",
        "Handle guest clothes and linens carefully to prevent loss or damage.",
        "Follow proper laundry and storage procedures.",
      ];
    }

    if (
      title.includes("guest") ||
      title.includes("valet") ||
      title.includes("butler")
    ) {
      return [
        "Respect guest privacy and personal belongings at all times.",
        "Respond to guest requests with professionalism and proper service etiquette.",
        "Follow lost-and-found procedures for any guest item found.",
      ];
    }

    return [
      "Understand the purpose of this housekeeping competency.",
      "Practice the correct workplace procedure connected to this skill.",
      "Apply safety, quality, and professionalism while performing the task.",
    ];
  }

  if (course === "Event Management") {
    if (
      title.includes("proposal") ||
      title.includes("concept") ||
      title.includes("plan")
    ) {
      return [
        "Start with clear event objectives, client requirements, and target audience.",
        "Prepare a practical proposal or concept based on the event goal.",
        "Align budget, timeline, venue, and resources with the approved plan.",
      ];
    }

    if (
      title.includes("venue") ||
      title.includes("site") ||
      title.includes("logistics")
    ) {
      return [
        "Check venue access, layout, safety, power, and guest flow.",
        "Plan logistics, registration, signage, and supplier movement.",
        "Prepare backup plans for possible venue or operations issues.",
      ];
    }

    if (title.includes("program") || title.includes("event management")) {
      return [
        "Create a clear program flow and timeline.",
        "Coordinate staff, suppliers, and responsibilities before the event starts.",
        "Monitor the live event and adjust calmly when problems happen.",
      ];
    }

    if (
      title.includes("protocol") ||
      title.includes("guest") ||
      title.includes("relationship")
    ) {
      return [
        "Use professional communication when dealing with clients, guests, and partners.",
        "Follow protocol and guest-handling standards, especially for VIPs.",
        "Document approvals, changes, and important event decisions.",
      ];
    }

    if (
      title.includes("team") ||
      title.includes("communication") ||
      title.includes("lead")
    ) {
      return [
        "Lead with clear instructions and respectful communication.",
        "Assign tasks based on roles and event requirements.",
        "Keep communication channels open during preparation and live operations.",
      ];
    }

    return [
      "Understand the purpose of this event management competency.",
      "Practice the planning, coordination, or execution skill connected to this item.",
      "Apply professionalism, communication, and problem-solving during event work.",
    ];
  }

  return [
    `Review the competency under ${step?.groupTitle || "your course"}.`,
    "Understand the expected skill or behavior.",
    "Apply the competency in the actual training activity.",
  ];
}

function buildStudyModuleSections(step) {
  const course = normalizeCourseName(step?.course || "");
  const title = String(step?.title || "");
  const groupTitle = String(step?.groupTitle || "");
  const lowerTitle = title.toLowerCase();

  const cleanList = (values = []) =>
    (Array.isArray(values) ? values : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean);

  const base = {
    title,
    groupTitle,
    course,
    overview: "",
    objectives: [],
    discussion: [],
    procedures: [],
    scenario: "",
    activity: "",
    keyTerms: [],
    checklist: [],
  };

  const adminStudyModule = {
    overview: String(step?.studyModuleOverview || "").trim(),
    objectives: cleanList(step?.learningObjectives),
    discussion: cleanList(step?.lessonDiscussion),
    procedures: cleanList(step?.stepByStepProcedure),
    scenario: String(step?.workplaceScenario || "").trim(),
    activity: String(step?.practiceActivity || "").trim(),
    keyTerms: cleanList(step?.keyTerms),
    checklist: cleanList(step?.readinessChecklist),
  };

  const hasAdminStudyModule =
    adminStudyModule.overview ||
    adminStudyModule.objectives.length ||
    adminStudyModule.discussion.length ||
    adminStudyModule.procedures.length ||
    adminStudyModule.scenario ||
    adminStudyModule.activity ||
    adminStudyModule.keyTerms.length ||
    adminStudyModule.checklist.length;

  if (hasAdminStudyModule) {
    const fallbackLessonPoints = buildLessonPoints(step);
    return {
      ...base,
      overview:
        adminStudyModule.overview ||
        step?.description ||
        `This module teaches the competency "${title}" under ${groupTitle || "your course"}.`,
      objectives: adminStudyModule.objectives.length
        ? adminStudyModule.objectives
        : ["Understand the competency.", "Apply the skill.", "Prepare for the exam."],
      discussion: adminStudyModule.discussion.length
        ? adminStudyModule.discussion
        : ["Study the meaning, purpose, and proper application of this competency before answering the exam."],
      procedures: adminStudyModule.procedures.length
        ? adminStudyModule.procedures
        : ["Read the module.", "Review the lesson points.", "Answer the exam."],
      scenario:
        adminStudyModule.scenario ||
        "Apply this competency in a realistic training situation.",
      activity:
        adminStudyModule.activity ||
        "Write three key things you learned from this competency.",
      keyTerms: adminStudyModule.keyTerms.length
        ? adminStudyModule.keyTerms
        : ["Competency", "Skill", "Training", "Assessment"],
      checklist: adminStudyModule.checklist.length
        ? adminStudyModule.checklist
        : ["I reviewed the module.", "I understand the skill.", "I am ready for the exam."],
      lessonPoints: fallbackLessonPoints,
    };
  }

  if (course === "Housekeeping") {
    if (
      lowerTitle.includes("communication") ||
      lowerTitle.includes("customer") ||
      lowerTitle.includes("guest")
    ) {
      return {
        ...base,
        overview:
          "This module teaches the trainee how to communicate properly in a housekeeping workplace. It focuses on respectful communication with guests, coworkers, and supervisors while following service standards.",
        objectives: [
          "Explain why workplace communication is important in housekeeping.",
          "Use polite and professional words when talking to guests.",
          "Report room issues, guest requests, and workplace concerns properly.",
          "Practice calm communication during service situations.",
        ],
        discussion: [
          "Housekeeping work requires clear communication because room status, guest requests, maintenance concerns, and safety issues must be reported accurately. A small communication mistake can delay room release or affect guest satisfaction.",
          "A housekeeper must speak politely, listen carefully, and confirm instructions when needed. Professional communication includes greeting guests, asking permission before entering, explaining service politely, and reporting problems without blaming others.",
          "Communication also happens between departments. Housekeeping may coordinate with front office, maintenance, laundry, and supervisors. The trainee must learn how to give correct information such as room number, issue found, action taken, and assistance needed.",
        ],
        procedures: [
          "Listen carefully to the instruction or guest request.",
          "Confirm important details such as room number, item requested, or problem found.",
          "Use polite language and avoid arguing.",
          "Report the concern to the correct person or department.",
          "Record important information if the workplace requires documentation.",
        ],
        scenario:
          "A guest says that the room lacks towels and asks for extra supplies. The correct response is to acknowledge the request politely, confirm the needed item, provide the item if allowed, and report or record the request according to procedure.",
        activity:
          "Write or practice a short conversation where a guest requests extra towels. Your answer should be polite, clear, and professional.",
        keyTerms: [
          "Workplace communication",
          "Guest request",
          "Professional language",
          "Room status update",
          "Service recovery",
        ],
        checklist: [
          "I can communicate politely with guests.",
          "I can report issues to the correct person.",
          "I can confirm instructions before acting.",
          "I can avoid rude or unclear communication.",
        ],
      };
    }

    if (
      lowerTitle.includes("hygiene") ||
      lowerTitle.includes("safety") ||
      lowerTitle.includes("health")
    ) {
      return {
        ...base,
        overview:
          "This module teaches safety, hygiene, and health practices in housekeeping. It focuses on preventing accidents, avoiding contamination, and protecting both the worker and the guest.",
        objectives: [
          "Identify basic housekeeping safety rules.",
          "Explain the importance of hygiene and sanitation.",
          "Use PPE properly during cleaning tasks.",
          "Recognize hazards such as wet floors, chemicals, and broken glass.",
        ],
        discussion: [
          "Housekeeping staff are exposed to chemicals, sharp objects, wet floors, dust, and contaminated surfaces. Safety procedures help prevent injuries and protect the guest environment.",
          "Hygiene is also important because housekeeping directly affects guest comfort and health. High-touch surfaces, bathrooms, linens, and room equipment must be cleaned carefully to reduce germs and cross-contamination.",
          "The trainee must understand that safety is not optional. Reading labels, wearing gloves when needed, placing warning signs, and reporting hazards are part of professional housekeeping work.",
        ],
        procedures: [
          "Check the work area for hazards before starting.",
          "Wear proper PPE such as gloves or mask when needed.",
          "Read chemical labels before use.",
          "Place warning signs for wet floors.",
          "Report damaged equipment or unsafe conditions immediately.",
        ],
        scenario:
          "While cleaning, you see broken glass near the bathroom. The correct response is to avoid picking it up with bare hands, use safe tools, dispose of it properly, and report the incident if required.",
        activity:
          "List three possible hazards in a guest room and write the correct action for each hazard.",
        keyTerms: [
          "PPE",
          "Sanitation",
          "Cross-contamination",
          "Hazard",
          "Chemical safety",
        ],
        checklist: [
          "I can identify common housekeeping hazards.",
          "I can use PPE correctly.",
          "I can follow chemical safety rules.",
          "I can report unsafe conditions properly.",
        ],
      };
    }

    if (
      lowerTitle.includes("room") ||
      lowerTitle.includes("housekeeping") ||
      lowerTitle.includes("clean")
    ) {
      return {
        ...base,
        overview:
          "This module teaches the correct room preparation and cleaning process. It focuses on making the guest room clean, complete, safe, and ready for occupancy.",
        objectives: [
          "Explain the correct sequence of room cleaning.",
          "Prepare the room by removing trash and used linens.",
          "Apply proper cleaning and inspection standards.",
          "Use a checklist to confirm room readiness.",
        ],
        discussion: [
          "Room preparation is one of the most important housekeeping responsibilities. A guest room must be clean, organized, complete with supplies, and free from visible defects.",
          "The cleaning sequence helps the housekeeper work efficiently. Used linens and trash are removed first, then surfaces, bathroom, amenities, bed setup, and final inspection are completed.",
          "A final inspection ensures that the room is guest-ready. This includes checking cleanliness, odor, supplies, linen arrangement, bathroom condition, and room equipment.",
        ],
        procedures: [
          "Knock and announce before entering if the room may be occupied.",
          "Remove trash and used linens.",
          "Clean surfaces from cleaner areas to dirtier areas.",
          "Clean and sanitize the bathroom.",
          "Make the bed using clean and properly tucked linens.",
          "Refill amenities and check room inventory.",
          "Do a final inspection before releasing the room.",
        ],
        scenario:
          "You are assigned to prepare a checkout room. You should remove used items first, follow the cleaning sequence, refill supplies, and inspect the room before marking it ready.",
        activity:
          "Create a simple room cleaning checklist with at least seven tasks in correct order.",
        keyTerms: [
          "Room preparation",
          "Cleaning sequence",
          "Final inspection",
          "Room inventory",
          "Guest-ready room",
        ],
        checklist: [
          "I can follow the correct room cleaning sequence.",
          "I can check room supplies and amenities.",
          "I can identify if a room is guest-ready.",
          "I can use a checklist during final inspection.",
        ],
      };
    }

    if (lowerTitle.includes("laundry") || lowerTitle.includes("linen")) {
      return {
        ...base,
        overview:
          "This module teaches proper linen and laundry handling. It focuses on hygiene, sorting, care of guest items, and preventing loss or contamination.",
        objectives: [
          "Separate clean and soiled linens properly.",
          "Handle guest clothes and linens with care.",
          "Explain why linen control is important.",
          "Apply hygienic laundry handling practices.",
        ],
        discussion: [
          "Linen handling affects cleanliness and guest satisfaction. Clean linens must never be mixed with soiled linens because this may cause contamination.",
          "Guest clothes and linens must be handled carefully to prevent loss, damage, or mix-ups. Proper recording and sorting are important in laundry operations.",
          "The trainee must understand that linen control supports accountability, hygiene, and quality service.",
        ],
        procedures: [
          "Collect soiled linens carefully.",
          "Separate clean and soiled items.",
          "Avoid placing clean linens on the floor.",
          "Report damaged or missing linen.",
          "Store clean linens in the correct area.",
        ],
        scenario:
          "You find a stained towel and a clean towel in the same cart. The correct action is to separate them immediately and follow the linen handling procedure.",
        activity: "List five rules for proper linen handling in housekeeping.",
        keyTerms: [
          "Clean linen",
          "Soiled linen",
          "Laundry handling",
          "Linen control",
          "Guest clothes",
        ],
        checklist: [
          "I can separate clean and soiled linens.",
          "I can handle guest clothes carefully.",
          "I can avoid contamination during linen handling.",
          "I can report linen problems properly.",
        ],
      };
    }

    return {
      ...base,
      overview: `This module teaches the housekeeping competency "${title}" under ${groupTitle}. It helps the trainee understand the required skill, correct procedure, and workplace standard.`,
      objectives: [
        `Understand the competency: ${title}.`,
        "Apply the skill during actual housekeeping work.",
        "Follow workplace safety, quality, and service standards.",
      ],
      discussion: [
        "This competency is part of professional housekeeping training. The trainee must understand not only the definition of the skill, but also how it is performed in real workplace situations.",
        "Good housekeeping requires consistency, attention to detail, safety awareness, and professional behavior. Every task should support cleanliness, guest comfort, and workplace efficiency.",
      ],
      procedures: [
        "Read and understand the competency requirement.",
        "Observe the correct demonstration or workplace standard.",
        "Practice the skill carefully.",
        "Ask for feedback from the professor or trainer.",
        "Apply corrections until the competency is performed properly.",
      ],
      scenario:
        "During training, the professor asks you to demonstrate this competency. You should follow the correct procedure, maintain safety, and ask for clarification if instructions are unclear.",
      activity:
        "Write three things you must remember when performing this competency.",
      keyTerms: [
        "Competency",
        "Procedure",
        "Workplace standard",
        "Safety",
        "Quality",
      ],
      checklist: [
        "I understand the purpose of this competency.",
        "I can explain the correct procedure.",
        "I can apply the skill safely.",
        "I am ready to answer the exam.",
      ],
    };
  }

  if (course === "Event Management") {
    if (
      lowerTitle.includes("proposal") ||
      lowerTitle.includes("concept") ||
      lowerTitle.includes("plan")
    ) {
      return {
        ...base,
        overview:
          "This module teaches event planning and proposal development. It focuses on objectives, client requirements, audience needs, budget, and event concept.",
        objectives: [
          "Identify the purpose and objectives of an event.",
          "Explain the importance of an event brief.",
          "Prepare basic planning details for an event proposal.",
          "Connect the event concept with budget, audience, and venue.",
        ],
        discussion: [
          "Event planning begins with a clear understanding of the client’s goal, target audience, budget, and expected outcome. Without clear objectives, the event may become disorganized or fail to meet expectations.",
          "An event proposal communicates the plan. It may include the theme, program, target audience, venue, budget, suppliers, logistics, and timeline.",
          "The trainee must learn that planning is not only about creativity. It also requires organization, budgeting, communication, and practical decision-making.",
        ],
        procedures: [
          "Identify the event objective.",
          "Understand the client or audience requirement.",
          "Prepare a concept suitable for the event.",
          "Estimate the budget and needed resources.",
          "Create a timeline and list of responsibilities.",
        ],
        scenario:
          "A client wants a small corporate seminar. The correct approach is to clarify the objective, number of guests, budget, venue needs, program flow, and technical requirements before preparing a proposal.",
        activity:
          "Create a simple event concept for a seminar, birthday, or corporate event. Include objective, audience, venue, and budget idea.",
        keyTerms: [
          "Event objective",
          "Event brief",
          "Proposal",
          "Budget",
          "Target audience",
        ],
        checklist: [
          "I can identify event objectives.",
          "I can explain the purpose of an event proposal.",
          "I can connect budget with event planning.",
          "I can prepare basic event planning details.",
        ],
      };
    }

    if (
      lowerTitle.includes("venue") ||
      lowerTitle.includes("site") ||
      lowerTitle.includes("logistics")
    ) {
      return {
        ...base,
        overview:
          "This module teaches venue selection and logistics planning. It focuses on checking the event site, guest flow, safety, equipment, suppliers, and operational needs.",
        objectives: [
          "Explain why venue ocular inspection is important.",
          "Identify logistics concerns before event day.",
          "Plan guest movement, registration, and signage.",
          "Recognize safety and operational requirements in a venue.",
        ],
        discussion: [
          "The venue affects the success of an event. A good venue should match the event objective, guest count, budget, safety needs, and program requirements.",
          "During an ocular visit, the event team checks layout, entrances, exits, parking, electricity, stage area, comfort rooms, registration area, supplier access, and emergency routes.",
          "Logistics planning makes sure that people, equipment, supplies, and services are in the right place at the right time.",
        ],
        procedures: [
          "Check the venue size and layout.",
          "Identify entrance, exit, registration, and guest flow.",
          "Confirm power supply, equipment, and technical needs.",
          "Check supplier access and setup area.",
          "Prepare signage and logistics checklist.",
        ],
        scenario:
          "You inspect a venue and notice that the registration table blocks the entrance. The correct action is to adjust the layout to improve guest flow and avoid crowding.",
        activity:
          "Draw or describe a simple event layout with registration, stage, guest seating, entrance, and exit.",
        keyTerms: [
          "Venue ocular",
          "Logistics",
          "Guest flow",
          "Layout",
          "Signage",
        ],
        checklist: [
          "I can identify important venue areas.",
          "I can explain guest flow.",
          "I can recognize logistics problems.",
          "I can suggest layout improvements.",
        ],
      };
    }

    if (
      lowerTitle.includes("program") ||
      lowerTitle.includes("coordination") ||
      lowerTitle.includes("event management")
    ) {
      return {
        ...base,
        overview:
          "This module teaches program flow and event coordination. It focuses on timeline management, team roles, supplier coordination, rehearsal, and live event monitoring.",
        objectives: [
          "Explain the importance of program flow.",
          "Identify team roles and responsibilities.",
          "Coordinate suppliers and event staff.",
          "Monitor the event timeline during execution.",
        ],
        discussion: [
          "A program flow is the guide for what happens before, during, and after the event. It helps the team know the order of activities and who is responsible for each task.",
          "Coordination is important because events involve many people. Staff, suppliers, performers, clients, and guests must be managed properly.",
          "During live operations, the team must monitor time, solve problems, and communicate changes quickly.",
        ],
        procedures: [
          "Prepare the event timeline.",
          "Assign staff and supplier responsibilities.",
          "Conduct briefing or rehearsal before the event.",
          "Monitor the program flow during the event.",
          "Record issues for post-event evaluation.",
        ],
        scenario:
          "The speaker arrives late during a seminar. The correct response is to adjust the program flow, inform the host or coordinator, and use the contingency plan.",
        activity:
          "Create a short program flow for a 1-hour event with opening, main activity, and closing.",
        keyTerms: [
          "Program flow",
          "Timeline",
          "Coordination",
          "Rehearsal",
          "Event execution",
        ],
        checklist: [
          "I can read and follow a program flow.",
          "I can identify event team roles.",
          "I can communicate changes during an event.",
          "I can help keep the event on schedule.",
        ],
      };
    }

    if (
      lowerTitle.includes("protocol") ||
      lowerTitle.includes("guest") ||
      lowerTitle.includes("relationship") ||
      lowerTitle.includes("client")
    ) {
      return {
        ...base,
        overview:
          "This module teaches client, guest, and protocol management. It focuses on professional communication, VIP handling, guest service, and proper event etiquette.",
        objectives: [
          "Use professional communication with clients and guests.",
          "Explain the importance of guest handling and protocol.",
          "Respond properly to complaints or guest concerns.",
          "Recognize the need for documentation and approvals.",
        ],
        discussion: [
          "Event management is a service-based field. Clients and guests expect organized, respectful, and professional handling.",
          "Protocol is especially important when there are VIPs, formal guests, or official programs. Seating, introductions, timing, and assistance must be coordinated carefully.",
          "Complaints should be handled calmly. The event staff must listen, acknowledge the concern, and coordinate a solution quickly.",
        ],
        procedures: [
          "Greet clients and guests professionally.",
          "Confirm client instructions and approvals.",
          "Follow VIP or protocol requirements.",
          "Respond calmly to concerns or complaints.",
          "Document important changes or decisions.",
        ],
        scenario:
          "A guest complains that their seat is missing. The correct response is to acknowledge the concern, check the seating plan, coordinate with the team, and provide a solution calmly.",
        activity:
          "Write a polite response to a guest complaint during an event.",
        keyTerms: [
          "Client handling",
          "Guest service",
          "Protocol",
          "VIP",
          "Service recovery",
        ],
        checklist: [
          "I can communicate professionally with guests.",
          "I can follow protocol requirements.",
          "I can respond calmly to complaints.",
          "I can document important client approvals.",
        ],
      };
    }

    return {
      ...base,
      overview: `This module teaches the event management competency "${title}" under ${groupTitle}. It helps the trainee understand the required skill and how to apply it during event planning or execution.`,
      objectives: [
        `Understand the competency: ${title}.`,
        "Apply the skill in an event management situation.",
        "Use communication, planning, and problem-solving during the task.",
      ],
      discussion: [
        "This competency is part of professional event management training. The trainee must understand the skill and how it supports successful event planning or execution.",
        "Event work requires organization, teamwork, communication, and quick decision-making. Every competency supports smoother preparation and better guest experience.",
      ],
      procedures: [
        "Read and understand the competency requirement.",
        "Study how the skill is used in event planning or execution.",
        "Practice through a sample event scenario.",
        "Ask feedback from the professor or trainer.",
        "Apply corrections until the competency is performed properly.",
      ],
      scenario:
        "During event preparation, the professor asks you to apply this competency in a sample situation. You should follow the process, communicate clearly, and solve problems professionally.",
      activity:
        "Write three ways this competency can help during an actual event.",
      keyTerms: [
        "Competency",
        "Event planning",
        "Coordination",
        "Communication",
        "Execution",
      ],
      checklist: [
        "I understand the purpose of this competency.",
        "I can explain how it applies to events.",
        "I can use the skill in a practical scenario.",
        "I am ready to answer the exam.",
      ],
    };
  }

  return {
    ...base,
    overview: `This module teaches the competency "${title}" under ${groupTitle}.`,
    objectives: [
      "Understand the competency.",
      "Apply the skill.",
      "Prepare for the exam.",
    ],
    discussion: [
      "Study the meaning, purpose, and proper application of this competency before answering the exam.",
    ],
    procedures: ["Read the module.", "Review the lesson points.", "Answer the exam."],
    scenario: "Apply this competency in a realistic training situation.",
    activity: "Write three key things you learned from this competency.",
    keyTerms: ["Competency", "Skill", "Training", "Assessment"],
    checklist: [
      "I reviewed the module.",
      "I understand the skill.",
      "I am ready for the exam.",
    ],
  };
}

const QUESTION_BANK = {
  Housekeeping: [
    {
      id: "hk-q1",
      keywords: ["room", "clean", "prepare", "guest"],
      prompt:
        "What should usually be done first when preparing a guest room for cleaning?",
      options: [
        "Arrange decorations first",
        "Remove trash and used linens",
        "Polish mirrors first",
        "Refill the minibar only",
      ],
      answer: "Remove trash and used linens",
      explanation:
        "Removing used items first prepares the room for complete cleaning.",
    },
    {
      id: "hk-q2",
      keywords: ["hygiene", "sanitation", "cross", "contamination"],
      prompt:
        "What helps prevent cross-contamination during housekeeping work?",
      options: [
        "Using the same cloth everywhere",
        "Using color-coded cleaning tools",
        "Skipping bathroom sanitation",
        "Mixing all chemicals together",
      ],
      answer: "Using color-coded cleaning tools",
      explanation:
        "Color-coded tools separate cleaning materials for different areas.",
    },
    {
      id: "hk-q3",
      keywords: ["safety", "chemical", "ppe", "health"],
      prompt: "What should be done before using a cleaning chemical?",
      options: [
        "Use the strongest amount possible",
        "Read the label and instructions",
        "Mix it with bleach immediately",
        "Smell it to test strength",
      ],
      answer: "Read the label and instructions",
      explanation:
        "Labels give safety, dosage, and proper handling instructions.",
    },
    {
      id: "hk-q4",
      keywords: ["guest", "privacy", "communication"],
      prompt: "What should a housekeeper do before entering an occupied room?",
      options: [
        "Open the door immediately",
        "Knock and announce housekeeping",
        "Enter silently",
        "Ask another guest",
      ],
      answer: "Knock and announce housekeeping",
      explanation:
        "This respects guest privacy and follows proper service protocol.",
    },
    {
      id: "hk-q5",
      keywords: ["linen", "laundry"],
      prompt: "Which practice shows proper linen handling?",
      options: [
        "Place clean linens on the floor",
        "Separate clean and soiled linens",
        "Store damp linens for a long time",
        "Mix clean and dirty linens together",
      ],
      answer: "Separate clean and soiled linens",
      explanation:
        "Separating linens helps maintain hygiene and prevent contamination.",
    },
    {
      id: "hk-q6",
      keywords: ["inspection", "checklist", "room"],
      prompt: "Why is a final room inspection important?",
      options: [
        "To delay guest check-in",
        "To confirm the room is clean, complete, and guest-ready",
        "To skip bathroom cleaning",
        "To replace all other cleaning tasks",
      ],
      answer: "To confirm the room is clean, complete, and guest-ready",
      explanation: "Final inspection ensures the room meets service standards.",
    },
    {
      id: "hk-q7",
      keywords: ["wet", "floor", "safety"],
      prompt: "What should be done when the floor is wet during cleaning?",
      options: [
        "Leave it without warning",
        "Put a warning sign and dry it properly",
        "Cover it with linen",
        "Ignore it if no guest is nearby",
      ],
      answer: "Put a warning sign and dry it properly",
      explanation:
        "Wet floor signs and drying help prevent slips and accidents.",
    },
    {
      id: "hk-q8",
      keywords: ["lost", "found", "guest"],
      prompt: "What should be done when a guest valuable is found?",
      options: [
        "Keep it temporarily",
        "Follow lost-and-found procedure immediately",
        "Hide it in the room",
        "Give it to another worker without a record",
      ],
      answer: "Follow lost-and-found procedure immediately",
      explanation: "Guest property must be recorded and handled properly.",
    },
    {
      id: "hk-q9",
      keywords: ["customer", "service", "communication"],
      prompt: "Which behavior shows professional guest interaction?",
      options: [
        "Arguing with the guest",
        "Polite and respectful communication",
        "Ignoring guest concerns",
        "Using rude language",
      ],
      answer: "Polite and respectful communication",
      explanation:
        "Professional communication improves guest trust and service quality.",
    },
    {
      id: "hk-q10",
      keywords: ["equipment", "damaged", "report"],
      prompt: "What should be done if room equipment is damaged?",
      options: [
        "Ignore it",
        "Report it using the proper process",
        "Hide the issue",
        "Let the guest discover it",
      ],
      answer: "Report it using the proper process",
      explanation:
        "Reporting damage helps protect guests and supports maintenance action.",
    },
    {
      id: "hk-q11",
      keywords: ["cart", "supplies", "workflow"],
      prompt: "How should a housekeeping cart be positioned?",
      options: [
        "Blocking the hallway",
        "Near the work area without blocking exits",
        "Inside the elevator",
        "Far from the room",
      ],
      answer: "Near the work area without blocking exits",
      explanation:
        "Cart placement should support work efficiency and safety.",
    },
    {
      id: "hk-q12",
      keywords: ["professionalism", "team", "workplace"],
      prompt: "Which action supports professionalism in housekeeping?",
      options: [
        "Ignoring team instructions",
        "Following standards and communicating respectfully",
        "Skipping safety checks",
        "Leaving tasks unfinished",
      ],
      answer: "Following standards and communicating respectfully",
      explanation:
        "Professionalism includes discipline, respect, and standard procedures.",
    },
  ],

  "Event Management": [
    {
      id: "em-q1",
      keywords: ["plan", "proposal", "objective", "budget"],
      prompt: "What should be clearly defined early in event planning?",
      options: [
        "Event objectives and budget",
        "Only the souvenir design",
        "Only the backdrop color",
        "Only the social media caption",
      ],
      answer: "Event objectives and budget",
      explanation: "Objectives and budget guide the entire event plan.",
    },
    {
      id: "em-q2",
      keywords: ["program", "timeline", "coordination"],
      prompt: "Why is a program flow important?",
      options: [
        "It removes the need for staff",
        "It manages timing and responsibilities",
        "It is only for decoration",
        "It replaces the client brief",
      ],
      answer: "It manages timing and responsibilities",
      explanation: "Program flow keeps the event organized and coordinated.",
    },
    {
      id: "em-q3",
      keywords: ["venue", "site", "logistics"],
      prompt: "What should be checked during a venue ocular visit?",
      options: [
        "Only paint color",
        "Layout, access, safety, power, and logistics",
        "Only the food menu",
        "Only decorations",
      ],
      answer: "Layout, access, safety, power, and logistics",
      explanation: "Venue checks must cover operations and safety needs.",
    },
    {
      id: "em-q4",
      keywords: ["risk", "contingency", "problem"],
      prompt:
        "What should the team do when a supplier is delayed on event day?",
      options: [
        "Ignore the issue",
        "Activate the contingency plan and update stakeholders",
        "Cancel immediately",
        "Blame the client",
      ],
      answer: "Activate the contingency plan and update stakeholders",
      explanation:
        "Contingency planning helps the team respond professionally.",
    },
    {
      id: "em-q5",
      keywords: ["client", "guest", "communication"],
      prompt:
        "Which skill is very important when handling clients and guests?",
      options: [
        "Clear and professional communication",
        "Avoiding communication",
        "Changing plans without approval",
        "Ignoring complaints",
      ],
      answer: "Clear and professional communication",
      explanation:
        "Good communication protects client trust and guest experience.",
    },
    {
      id: "em-q6",
      keywords: ["supplier", "contractor", "coordination"],
      prompt: "Why is supplier coordination important before event day?",
      options: [
        "To confirm timing, deliverables, and responsibilities",
        "To avoid written plans",
        "To reduce teamwork",
        "To replace the event program",
      ],
      answer: "To confirm timing, deliverables, and responsibilities",
      explanation: "Supplier coordination reduces delays and misunderstandings.",
    },
    {
      id: "em-q7",
      keywords: ["registration", "rsvp", "guest"],
      prompt: "What does RSVP management help control?",
      options: [
        "Guest count and attendance planning",
        "Only stage lighting",
        "Only color theme",
        "Only staff uniforms",
      ],
      answer: "Guest count and attendance planning",
      explanation:
        "RSVP helps with seating, food, registration, and logistics.",
    },
    {
      id: "em-q8",
      keywords: ["rehearsal", "technical", "flow"],
      prompt: "Why is a technical rehearsal useful?",
      options: [
        "It tests timing, audio, visuals, and coordination",
        "It delays the event only",
        "It replaces the final plan",
        "It is only for performers",
      ],
      answer: "It tests timing, audio, visuals, and coordination",
      explanation: "Rehearsal identifies problems before the live event.",
    },
    {
      id: "em-q9",
      keywords: ["protocol", "vip", "guest"],
      prompt: "What is best practice when handling VIP guests?",
      options: [
        "Ignore protocol",
        "Follow protocol and coordinate details carefully",
        "Change seating without approval",
        "Let anyone decide",
      ],
      answer: "Follow protocol and coordinate details carefully",
      explanation:
        "VIP handling requires planning, protocol awareness, and attention to detail.",
    },
    {
      id: "em-q10",
      keywords: ["crowd", "safety", "flow"],
      prompt: "What does crowd management mainly protect?",
      options: [
        "Guest safety, flow, and order",
        "Only decorations",
        "Only ticket design",
        "Only stage timing",
      ],
      answer: "Guest safety, flow, and order",
      explanation:
        "Crowd management supports safe and smooth event movement.",
    },
    {
      id: "em-q11",
      keywords: ["complaint", "service", "recovery"],
      prompt: "How should an on-site complaint be handled?",
      options: [
        "Argue with the guest",
        "Respond calmly, acknowledge, and solve promptly",
        "Ignore it",
        "Blame another team member",
      ],
      answer: "Respond calmly, acknowledge, and solve promptly",
      explanation:
        "Service recovery protects the event experience and reputation.",
    },
    {
      id: "em-q12",
      keywords: ["team", "communication", "lead"],
      prompt: "Which action supports good event team coordination?",
      options: [
        "Maintain clear communication channels",
        "Avoid updates until the event ends",
        "Let everyone improvise alone",
        "Remove task assignments",
      ],
      answer: "Maintain clear communication channels",
      explanation:
        "Clear communication helps the team respond quickly and correctly.",
    },
  ],
};

function buildGenericCompetencyQuestions(step = {}, count = EXAM_QUESTION_COUNT) {
  const title = String(step?.title || step?.label || "this competency").trim() || "this competency";
  const groupTitle = String(step?.groupTitle || "your competency group").trim() || "your competency group";
  const courseName = String(step?.course || "your course").trim() || "your course";
  const safeIdBase = String(step?.code || title || "generic")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "generic";

  const templates = [
    {
      id: `${safeIdBase}-gen-q1`,
      keywords: ["purpose", "competency", "skill"],
      prompt: `What is the main purpose of studying "${title}" in ${courseName}?`,
      options: [
        "To understand and apply the required workplace skill correctly",
        "To skip the professor's competency check",
        "To memorize the title only without practice",
        "To avoid doing the training activity",
      ],
      answer: "To understand and apply the required workplace skill correctly",
      explanation: "A competency is useful only when the trainee understands it and can apply it in practice.",
    },
    {
      id: `${safeIdBase}-gen-q2`,
      keywords: ["procedure", "steps", "process"],
      prompt: `Before performing the competency "${title}", what should the trainee do first?`,
      options: [
        "Read and understand the instructions or standard procedure",
        "Guess the procedure without reviewing anything",
        "Ask another trainee to answer for them",
        "Skip directly to completion",
      ],
      answer: "Read and understand the instructions or standard procedure",
      explanation: "Understanding the required standard helps the trainee perform the competency correctly and safely.",
    },
    {
      id: `${safeIdBase}-gen-q3`,
      keywords: ["safety", "quality", "standard"],
      prompt: `Which behavior best shows proper performance of "${title}"?`,
      options: [
        "Following standards, safety rules, and professor instructions",
        "Rushing the task without checking quality",
        "Ignoring feedback after the activity",
        "Doing only the easiest part of the task",
      ],
      answer: "Following standards, safety rules, and professor instructions",
      explanation: "Competency performance should follow the correct standard, safety expectations, and trainer guidance.",
    },
    {
      id: `${safeIdBase}-gen-q4`,
      keywords: ["communication", "feedback", "professor"],
      prompt: `What should the trainee do if they are unsure how to apply "${title}"?`,
      options: [
        "Ask the professor or trainer for clarification",
        "Hide the confusion and continue incorrectly",
        "Stop attending the activity",
        "Copy another trainee without understanding",
      ],
      answer: "Ask the professor or trainer for clarification",
      explanation: "Asking for clarification prevents mistakes and supports proper learning.",
    },
    {
      id: `${safeIdBase}-gen-q5`,
      keywords: ["group", "category", "competency"],
      prompt: `The competency "${title}" belongs to which roadmap group?`,
      options: [
        groupTitle,
        "Unrelated personal activity",
        "Website design section",
        "Payment processing section",
      ],
      answer: groupTitle,
      explanation: `This roadmap item is listed under ${groupTitle}.`,
    },
    {
      id: `${safeIdBase}-gen-q6`,
      keywords: ["practice", "application", "scenario"],
      prompt: `Why should the trainee practice "${title}" in a realistic activity?`,
      options: [
        "To connect the lesson with actual workplace performance",
        "To avoid learning the correct process",
        "To make the roadmap longer only",
        "To remove the professor's role",
      ],
      answer: "To connect the lesson with actual workplace performance",
      explanation: "Practice helps the trainee transfer knowledge into real workplace behavior.",
    },
    {
      id: `${safeIdBase}-gen-q7`,
      keywords: ["mistake", "correction", "improvement"],
      prompt: `If the trainee makes a mistake while applying "${title}", what is the best action?`,
      options: [
        "Accept feedback, correct the mistake, and practice again",
        "Ignore the mistake completely",
        "Argue with the professor immediately",
        "Mark the competency completed without checking",
      ],
      answer: "Accept feedback, correct the mistake, and practice again",
      explanation: "Competency learning improves through feedback, correction, and repeated practice.",
    },
    {
      id: `${safeIdBase}-gen-q8`,
      keywords: ["completion", "check", "professor"],
      prompt: `In the roadmap, what must happen before "${title}" can fully unlock the next step?`,
      options: [
        "The trainee passes the exam and the professor checks the competency",
        "The trainee only opens the modal once",
        "The trainee changes their profile photo",
        "The trainee skips all questions",
      ],
      answer: "The trainee passes the exam and the professor checks the competency",
      explanation: "The roadmap requires both the exam result and the professor competency check before moving forward.",
    },
    {
      id: `${safeIdBase}-gen-q9`,
      keywords: ["professionalism", "attitude", "behavior"],
      prompt: `Which attitude is most appropriate while learning "${title}"?`,
      options: [
        "Professional, respectful, and willing to improve",
        "Careless and unwilling to listen",
        "Absent during practice",
        "Focused only on finishing quickly",
      ],
      answer: "Professional, respectful, and willing to improve",
      explanation: "Good attitude supports successful skills training and assessment.",
    },
    {
      id: `${safeIdBase}-gen-q10`,
      keywords: ["review", "exam", "module"],
      prompt: `What should the trainee do before taking the exam for "${title}"?`,
      options: [
        "Review the study module, lesson points, and checklist",
        "Answer randomly without reading",
        "Close the roadmap and ignore the module",
        "Wait for another trainee to answer first",
      ],
      answer: "Review the study module, lesson points, and checklist",
      explanation: "Reviewing the module helps the trainee answer accurately and understand the skill.",
    },
    {
      id: `${safeIdBase}-gen-q11`,
      keywords: ["course", "training", "skill"],
      prompt: `How does "${title}" support the trainee's ${courseName} training?`,
      options: [
        "It builds a required skill for course completion and workplace readiness",
        "It replaces all other requirements automatically",
        "It removes the need for attendance",
        "It is unrelated to the course",
      ],
      answer: "It builds a required skill for course completion and workplace readiness",
      explanation: "Each roadmap competency supports progress toward course completion and practical readiness.",
    },
    {
      id: `${safeIdBase}-gen-q12`,
      keywords: ["checklist", "readiness", "assessment"],
      prompt: `Which sign shows that the trainee is ready to be checked for "${title}"?`,
      options: [
        "They can explain and demonstrate the competency correctly",
        "They only know the course name",
        "They skipped the study module",
        "They have not practiced the task",
      ],
      answer: "They can explain and demonstrate the competency correctly",
      explanation: "Readiness means the trainee understands the competency and can apply it correctly.",
    },
  ];

  return templates.slice(0, Math.max(count, EXAM_QUESTION_COUNT));
}

function normalizeRoadmapQuestion(question, index = 0, step = null) {
  const prompt = String(question?.prompt || question?.question || "").trim();
  const answer = String(
    question?.answer || question?.correctAnswer || question?.correctOption || ""
  ).trim();
  const options = Array.isArray(question?.options)
    ? question.options.map((option) => String(option || "").trim()).filter(Boolean)
    : [];

  if (!prompt || !answer) return null;

  const mergedOptions = [...new Set([answer, ...options])].filter(Boolean);
  while (mergedOptions.length < 4) {
    mergedOptions.push(`Option ${mergedOptions.length + 1}`);
  }

  return {
    id: String(question?.id || `${step?.id || "roadmap"}-custom-${index + 1}`),
    prompt,
    options: mergedOptions.slice(0, 4),
    answer,
    explanation: String(question?.explanation || "Review the lesson points for this competency.").trim(),
    keywords: Array.isArray(question?.keywords) ? question.keywords : [],
  };
}

function getQuestionBankForCourse(course = "", step = null) {
  const customQuestions = Array.isArray(step?.examQuestions)
    ? step.examQuestions
        .map((question, index) => normalizeRoadmapQuestion(question, index, step))
        .filter(Boolean)
    : [];

  if (customQuestions.length) {
    return customQuestions;
  }

  const normalizedCourse = normalizeCourseName(course);
  const fixedBank = QUESTION_BANK[normalizedCourse];

  if (Array.isArray(fixedBank) && fixedBank.length) {
    return fixedBank;
  }

  return buildGenericCompetencyQuestions(
    {
      ...(step || {}),
      course: normalizedCourse || step?.course || "your course",
    },
    EXAM_QUESTION_COUNT
  );
}

function questionScore(question, step) {
  const text = normalizeText(
    [
      step?.title,
      step?.label,
      step?.code,
      step?.groupTitle,
      step?.course,
      ...(buildLessonPoints(step) || []),
    ].join(" ")
  );

  return (question.keywords || []).reduce((sum, keyword) => {
    const cleanKeyword = normalizeText(keyword);
    return cleanKeyword && text.includes(cleanKeyword) ? sum + 2 : sum;
  }, 0);
}

function selectQuestions(course, step, count = EXAM_QUESTION_COUNT) {
  const bank = getQuestionBankForCourse(course, step);

  if (!Array.isArray(bank) || !bank.length) {
    return buildGenericCompetencyQuestions(step, count).slice(0, count);
  }

  const scored = bank
    .map((question, index) => ({
      ...question,
      __index: index,
      __score: questionScore(question, step),
    }))
    .sort((a, b) => {
      if (b.__score !== a.__score) return b.__score - a.__score;
      return a.__index - b.__index;
    });

  const selected = [];
  const used = new Set();

  for (const item of scored) {
    if (selected.length >= count) break;
    if (item.__score > 0) {
      selected.push(item);
      used.add(item.id);
    }
  }

  for (const item of bank) {
    if (selected.length >= count) break;
    if (!used.has(item.id)) {
      selected.push(item);
      used.add(item.id);
    }
  }

  if (selected.length < count) {
    for (const item of buildGenericCompetencyQuestions(step, count)) {
      if (selected.length >= count) break;
      if (!used.has(item.id)) {
        selected.push(item);
        used.add(item.id);
      }
    }
  }

  return selected.slice(0, count).map(({ __index, __score, ...item }) => item);
}

function buildRoadmapPath(points = []) {
  if (!points.length) return "";
  const first = points[0];

  let d = `M 20 ${first.y} L ${Math.max(20, first.x - 90)} ${first.y}`;
  d += ` L ${first.x} ${first.y}`;

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x + 90} ${last.y} L ${last.x + 190} ${last.y}`;

  return d;
}

function getRoadmapPoints(steps = []) {
  return steps.map((step, index) => ({
    ...step,
    x: 120 + index * 250,
    y: index % 2 === 0 ? 400 : 170,
  }));
}

function RoadmapModal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e8ece2] px-6 py-4">
          <h3 className="text-xl font-extrabold text-[#395345]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d7ddd0] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#395345]"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(92vh-82px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ step }) {
  if (step.completed) {
    return (
      <span className="roadmap-status-pill rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-green-700 ring-1 ring-green-200">
        Completed
      </span>
    );
  }

  if (!step.professorCompleted) {
    return (
      <span className="roadmap-status-pill rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-700 ring-1 ring-red-200">
        Waiting Professor Check
      </span>
    );
  }

  if (step.examPassed) {
    return (
      <span className="roadmap-status-pill rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 ring-1 ring-blue-200">
        Exam Passed
      </span>
    );
  }

  if (step.locked) {
    return (
      <span className="roadmap-status-pill rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-700 ring-1 ring-gray-200">
        Locked
      </span>
    );
  }

  return (
    <span className="roadmap-status-pill rounded-full bg-yellow-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-yellow-700 ring-1 ring-yellow-200">
      Ready
    </span>
  );
}

function RoadmapStepCard({ step, onOpenStep, align = "left" }) {
  const locked = step.locked;

  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onOpenStep(step)}
      className={[
        "roadmap-step-card group w-full rounded-[24px] border bg-white p-5 text-left shadow-xl ring-1 transition duration-300",
        locked
          ? "cursor-not-allowed border-[#e1e6dc] ring-[#d9dfd2] opacity-70"
          : "border-[#d9dfd2] ring-[#d9dfd2] hover:-translate-y-1 hover:shadow-2xl",
        align === "right" ? "lg:text-left" : "lg:text-right",
      ].join(" ")}
    >
      <div
        className={[
          "flex flex-wrap items-center gap-2",
          align === "right" ? "lg:justify-start" : "lg:justify-end",
        ].join(" ")}
      >
        <span className="rounded-full bg-[#eef1e7] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#45674b] ring-1 ring-[#d9dfd2]">
          Step {step.index + 1}
        </span>

        {step.code ? (
          <span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#647165] ring-1 ring-[#d7ddd0]">
            {step.code}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 font-['Montserrat',sans-serif] text-lg font-extrabold leading-tight text-[#45674b]">
        {step.title}
      </h3>

      <p className="mt-2 text-sm font-semibold leading-6 text-[#647165]">
        {step.groupTitle}
      </p>

      <div
        className={[
          "mt-3 flex flex-wrap gap-2",
          align === "right" ? "lg:justify-start" : "lg:justify-end",
        ].join(" ")}
      >
        <StatusPill step={step} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="roadmap-mini-stat rounded-2xl bg-[#f7f8f3] px-3 py-2 ring-1 ring-[#e2e8da]">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#748175]">
            Score
          </div>
          <div className="mt-1 text-sm font-extrabold text-[#45674b]">
            {step.latestScore ? `${step.latestScore}%` : "-"}
          </div>
        </div>

        <div className="roadmap-mini-stat rounded-2xl bg-[#f7f8f3] px-3 py-2 ring-1 ring-[#e2e8da]">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#748175]">
            Attempts
          </div>
          <div className="mt-1 text-sm font-extrabold text-[#45674b]">
            {step.attemptCount}
          </div>
        </div>
      </div>

      <div
        className={[
          "mt-5 flex",
          align === "right" ? "lg:justify-start" : "lg:justify-end",
        ].join(" ")}
      >
        <span
          className={[
            "roadmap-action-button inline-flex items-center rounded-full px-5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] transition",
            locked
              ? "bg-[#d7ddd0] text-[#657367]"
              : step.completed
              ? "bg-green-600 text-white group-hover:bg-green-700"
              : "bg-[#45674b] text-white group-hover:bg-[#2f463a]",
          ].join(" ")}
        >
          {step.completed ? "Open Again" : locked ? "Locked" : "Open Step"}
        </span>
      </div>
    </button>
  );
}

function DesktopRoadmap({ steps, onOpenStep }) {
  return (
    <div className="hidden lg:block">
      <div className="roadmap-flow-panel rounded-[30px] bg-white p-6 shadow-xl ring-1 ring-[#d9dfd2]">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold text-[#45674b]">
              Roadmap Flow
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#647165]">
              Follow the path from top to bottom. No side scrolling needed.
            </p>
          </div>
        </div>

        <div className="relative mx-auto max-w-[1120px] py-2">
          <div className="absolute left-1/2 top-0 h-full w-[10px] -translate-x-1/2 rounded-full bg-[#dfe8d9]" />
          <div className="absolute left-1/2 top-0 h-full w-[4px] -translate-x-1/2 rounded-full bg-[#8a936e]" />

          <div className="space-y-8">
            {steps.map((step) => {
              const isLeft = step.index % 2 === 0;
              const circleClass = step.completed
                ? "bg-green-600 text-white ring-green-100"
                : step.professorCompleted
                ? "bg-[#f1b337] text-white ring-yellow-100"
                : step.locked
                ? "bg-[#9aa59b] text-white ring-gray-100"
                : "bg-red-400 text-white ring-red-100";

              return (
                <div
                  key={step.id}
                  className="roadmap-step-row relative grid grid-cols-[1fr_96px_1fr] items-center gap-5"
                  style={{ animationDelay: `${Math.min(step.index * 0.06, 0.48)}s` }}
                >
                  <div className="min-w-0">
                    {isLeft ? (
                      <RoadmapStepCard
                        step={step}
                        onOpenStep={onOpenStep}
                        align="left"
                      />
                    ) : null}
                  </div>

                  <div className="relative flex h-full min-h-[190px] items-center justify-center">
                    <div
                      className={[
                        "roadmap-node relative z-10 flex h-14 w-14 items-center justify-center rounded-full text-sm font-extrabold shadow-xl ring-8 transition",
                        circleClass,
                      ].join(" ")}
                    >
                      {step.completed ? "✓" : step.index + 1}
                    </div>

                    <div
                      className={[
                        "roadmap-connector-line absolute top-1/2 h-[4px] w-[46px] -translate-y-1/2 rounded-full bg-[#8a936e]",
                        isLeft ? "left-0" : "right-0",
                      ].join(" ")}
                    />
                  </div>

                  <div className="min-w-0">
                    {!isLeft ? (
                      <RoadmapStepCard
                        step={step}
                        onOpenStep={onOpenStep}
                        align="right"
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileRoadmap({ steps, onOpenStep }) {
  return (
    <div className="space-y-5 lg:hidden">
      {steps.map((step) => (
        <div
          key={step.id}
          style={{ animationDelay: `${Math.min(step.index * 0.06, 0.48)}s` }}
          className={[
            "roadmap-mobile-card relative rounded-[22px] border p-4 shadow-sm",
            step.completed
              ? "border-green-200 bg-green-50"
              : step.locked
              ? "border-[#e1e6dc] bg-[#f7f8f3] opacity-90"
              : "border-[#d9ddd2] bg-white",
          ].join(" ")}
        >
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={[
                  "roadmap-mobile-node flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold",
                  step.completed
                    ? "bg-green-600 text-white"
                    : step.professorCompleted
                    ? "bg-[#f1b337] text-white"
                    : "bg-red-400 text-white",
                ].join(" ")}
              >
                {step.completed ? "✓" : step.index + 1}
              </div>

              {step.index !== steps.length - 1 ? (
                <div className="mt-2 h-16 w-[4px] rounded-full bg-[#8a936e]" />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <StatusPill step={step} />
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#395345] ring-1 ring-[#d7ddd0]">
                  {step.code}
                </span>
              </div>

              <div className="roadmap-mobile-title mt-3 text-lg font-extrabold text-[#45674b]">
                {step.title}
              </div>

              <p className="mt-2 text-sm leading-6 text-[#647166]">
                {step.groupTitle}
              </p>

              <div className="mt-3 text-xs font-bold text-[#627165]">
                Score: {step.latestScore ? `${step.latestScore}%` : "-"} |
                Attempts: {step.attemptCount}
              </div>

              <button
                type="button"
                disabled={step.locked}
                onClick={() => onOpenStep(step)}
                className={[
                  "roadmap-action-button mt-4 rounded-2xl px-5 py-3 text-sm font-bold uppercase tracking-[0.14em]",
                  step.locked
                    ? "cursor-not-allowed bg-[#d7ddd0] text-[#657367]"
                    : step.completed
                    ? "bg-green-600 text-white"
                    : "bg-[#45674b] text-white",
                ].join(" ")}
              >
                {step.completed
                  ? "Open Again"
                  : step.locked
                  ? "Locked"
                  : "Open Step"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


function buildStudyModulePages(selectedStep, selectedStudyModule) {
  if (!selectedStep || !selectedStudyModule) return [];

  const objectives = Array.isArray(selectedStudyModule.objectives)
    ? selectedStudyModule.objectives
    : [];
  const discussion = Array.isArray(selectedStudyModule.discussion)
    ? selectedStudyModule.discussion
    : [];
  const procedures = Array.isArray(selectedStudyModule.procedures)
    ? selectedStudyModule.procedures
    : [];
  const keyTerms = Array.isArray(selectedStudyModule.keyTerms)
    ? selectedStudyModule.keyTerms
    : [];
  const checklist = Array.isArray(selectedStudyModule.checklist)
    ? selectedStudyModule.checklist
    : [];
  const lessonPoints = Array.isArray(selectedStep.lessonPoints)
    ? selectedStep.lessonPoints
    : [];

  return [
    {
      key: "overview",
      label: "Overview",
      eyebrow: "Stage 1",
      title: "Module Overview",
      description: "Start with the purpose of this competency before reviewing the details.",
      content: (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#748175]">
              Competency
            </div>
            <h4 className="mt-2 text-2xl font-extrabold text-[#395345]">
              {selectedStep.title}
            </h4>
            <p className="mt-2 text-sm leading-7 text-[#647166]">
              Code: <span className="font-bold text-[#395345]">{selectedStep.code}</span>
            </p>
            <p className="text-sm leading-7 text-[#647166]">
              Group: <span className="font-bold text-[#395345]">{selectedStep.groupTitle}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
            <div className="text-sm font-extrabold text-[#395345]">
              What this module is about
            </div>
            <p className="mt-3 text-sm leading-7 text-[#647166]">
              {selectedStudyModule.overview ||
                `This module teaches the competency "${selectedStep.title}" under ${selectedStep.groupTitle}.`}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "objectives",
      label: "Objectives",
      eyebrow: "Stage 2",
      title: "Learning Objectives",
      description: "These are the expected learning outcomes before you answer the exam.",
      content: (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
          <ul className="space-y-3 text-sm leading-7 text-[#647166]">
            {(objectives.length ? objectives : [
              "Understand the competency.",
              "Apply the skill.",
              "Prepare for the exam.",
            ]).map((item, index) => (
              <li key={`objective-page-${index}`} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#395345] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      key: "discussion",
      label: "Discussion",
      eyebrow: "Stage 3",
      title: "Lesson Discussion",
      description: "Read the lesson explanation carefully before moving forward.",
      content: (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
          <div className="space-y-4">
            {(discussion.length ? discussion : [
              "Study the meaning, purpose, and proper application of this competency before answering the exam.",
            ]).map((paragraph, index) => (
              <p
                key={`discussion-page-${index}`}
                className="text-sm leading-7 text-[#647166]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "procedure",
      label: "Procedure",
      eyebrow: "Stage 4",
      title: "Step-by-Step Procedure",
      description: "Follow this sequence while studying and practicing the competency.",
      content: (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
          <ol className="space-y-3 text-sm leading-7 text-[#647166]">
            {(procedures.length ? procedures : [
              "Read the module.",
              "Review the lesson points.",
              "Answer the exam.",
            ]).map((item, index) => (
              <li key={`procedure-page-${index}`} className="flex gap-3">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#395345] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      ),
    },
    {
      key: "scenario",
      label: "Scenario",
      eyebrow: "Stage 5",
      title: "Real Workplace Scenario",
      description: "Connect the lesson to a realistic training or workplace situation.",
      content: (
        <div className="rounded-2xl bg-[#eef1e7] p-5 ring-1 ring-[#d7ddd0]">
          <p className="text-sm leading-7 text-[#647166]">
            {selectedStudyModule.scenario ||
              "Apply this competency in a realistic training situation."}
          </p>
        </div>
      ),
    },
    {
      key: "activity",
      label: "Activity",
      eyebrow: "Stage 6",
      title: "Practice Activity",
      description: "Use this activity to check your understanding before the exam.",
      content: (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
          <p className="text-sm leading-7 text-[#647166]">
            {selectedStudyModule.activity ||
              "Write three key things you learned from this competency."}
          </p>
        </div>
      ),
    },
    {
      key: "terms",
      label: "Key Terms",
      eyebrow: "Stage 7",
      title: "Key Terms",
      description: "Review important words or concepts used in this competency.",
      content: (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
          <div className="flex flex-wrap gap-2">
            {(keyTerms.length ? keyTerms : ["Competency", "Skill", "Training", "Assessment"]).map(
              (term, index) => (
                <span
                  key={`term-page-${index}`}
                  className="rounded-full bg-[#f7f8f3] px-4 py-2 text-xs font-bold text-[#395345] ring-1 ring-[#d7ddd0]"
                >
                  {term}
                </span>
              )
            )}
          </div>
        </div>
      ),
    },
    {
      key: "checklist",
      label: "Checklist",
      eyebrow: "Stage 8",
      title: "Readiness Checklist",
      description: "Make sure you can confirm these before taking the exam.",
      content: (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
          <ul className="space-y-3 text-sm leading-7 text-[#647166]">
            {(checklist.length ? checklist : [
              "I reviewed the module.",
              "I understand the skill.",
              "I am ready for the exam.",
            ]).map((item, index) => (
              <li key={`checklist-page-${index}`} className="flex gap-3">
                <span className="font-bold text-green-700">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      key: "summary",
      label: "Summary",
      eyebrow: "Final Stage",
      title: "Module Summary",
      description: "Review the important points, then continue to the exam.",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {(lessonPoints.length ? lessonPoints : [
              "Review this competency before taking the exam.",
            ]).map((point, index) => (
              <div
                key={`${selectedStep.id}-summary-page-${index}`}
                className="rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3"
              >
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                  Lesson Point {index + 1}
                </div>
                <p className="mt-1 text-sm leading-6 text-[#395345]">
                  {point}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                Professor Competency Check
              </div>
              <div
                className={[
                  "mt-2 text-sm font-bold",
                  selectedStep.professorCompleted ? "text-green-700" : "text-red-700",
                ].join(" ")}
              >
                {selectedStep.professorCompleted ? "Checked by professor" : "Not checked yet"}
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                Exam Status
              </div>
              <div
                className={[
                  "mt-2 text-sm font-bold",
                  selectedStep.examPassed ? "text-green-700" : "text-yellow-700",
                ].join(" ")}
              >
                {selectedStep.examPassed ? "Passed" : "Not passed yet"}
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                Latest Score
              </div>
              <div className="mt-2 text-sm text-[#395345]">
                {selectedStep.latestScore ? `${selectedStep.latestScore}%` : "-"}
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                Attempts
              </div>
              <div className="mt-2 text-sm text-[#395345]">
                {selectedStep.attemptCount}
              </div>
            </div>
          </div>

          {!selectedStep.professorCompleted ? (
            <div className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-800 ring-1 ring-red-200">
              You can study the module and take the exam now. The next roadmap step will only unlock after your professor checks this competency.
            </div>
          ) : null}
        </div>
      ),
    },
  ];
}


function RoadmapStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/12 px-4 py-3 text-white ring-1 ring-white/20">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">
        {label}
      </div>

      <div className="mt-1 text-sm font-extrabold">{value}</div>
    </div>
  );
}

export default function TraineeRoadmap() {
  const navigate = useNavigate();
  const token = useMemo(() => getToken(), []);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trainingUser") || "null");
    } catch {
      return null;
    }
  });

  const [progress, setProgress] = useState(null);
  const [course, setCourse] = useState("");
  const [selectedStep, setSelectedStep] = useState(null);
  const [modalPage, setModalPage] = useState("lesson");
  const [studyPageIndex, setStudyPageIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [examResult, setExamResult] = useState(null);

  const storageKey = useMemo(
    () => getRoadmapStorageKey(user, course),
    [user, course]
  );

  const [roadmapProgress, setRoadmapProgress] = useState({
    examPassed: {},
    attempts: {},
    scores: {},
    completedAt: {},
    answers: {},
  });

  useEffect(() => {
    setRoadmapProgress(readRoadmapProgress(storageKey));
  }, [storageKey]);

  async function loadRoadmap({ silent = false } = {}) {
    if (!token) {
      setLoading(false);
      redirectToTraineeLogin(navigate);
      return;
    }

    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setMsg({ type: "", text: "" });

      const res = await fetch(`${API_BASE}/training/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Failed to load competency roadmap.");
      }

      if (data?.user) {
        setUser(data.user);
        localStorage.setItem("trainingUser", JSON.stringify(data.user));
      }

      setProgress(data?.progress || null);
      setCourse(data?.progress?.course || data?.user?.course || "");

      if (silent) {
        setMsg({
          type: "success",
          text: "Roadmap refreshed from professor competency checklist.",
        });
      }
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to load competency roadmap.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadRoadmap();
  }, [token, navigate]);

  const competencyStepsRaw = useMemo(() => {
    const steps = flattenCompetencyGroups(progress?.competencyGroups || []);

    return steps.map((step) => ({
      ...step,
      course: progress?.course || course,
      lessonPoints: buildLessonPoints({
        ...step,
        course: progress?.course || course,
      }),
    }));
  }, [progress, course]);

  const steps = useMemo(() => {
    return competencyStepsRaw.map((step, index) => {
      const prev = competencyStepsRaw[index - 1];
      const prevId = prev?.id || "";

      const examPassed = Boolean(roadmapProgress?.examPassed?.[step.id]);
      const professorCompleted = step.professorCompleted === true;
      const completed = professorCompleted && examPassed;

      const previousCompleted =
        index === 0 ||
        (Boolean(roadmapProgress?.examPassed?.[prevId]) &&
          prev?.professorCompleted === true);

      const locked = !previousCompleted;

      return {
        ...step,
        index,
        examPassed,
        professorCompleted,
        completed,
        locked,
        latestScore: Number(roadmapProgress?.scores?.[step.id] || 0),
        attemptCount: Number(roadmapProgress?.attempts?.[step.id] || 0),
        completedAt: roadmapProgress?.completedAt?.[step.id] || null,
      };
    });
  }, [competencyStepsRaw, roadmapProgress]);

  const completedCount = steps.filter((step) => step.completed).length;

  const progressPercent = steps.length
    ? Math.round((completedCount / steps.length) * 100)
    : 0;

  const nextOpenStep =
    steps.find((step) => !step.completed && !step.locked) || null;

  const examQuestions = useMemo(() => {
    if (!selectedStep) return [];
    return selectQuestions(course, selectedStep, EXAM_QUESTION_COUNT);
  }, [course, selectedStep]);

  const profilePhotoUrl = user?.profilePhoto?.fileId
    ? buildTrainingFileUrl(user.profilePhoto.fileId)
    : "";

  const fullName = user
    ? `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""}`
        .replace(/\s+/g, " ")
        .trim()
    : "";

  const traineeDisplayName = fullName || "TAMSI Trainee";
  const traineeEmail = user?.email || user?.traineeEmail || "traineeemail@tamsi.com";

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  function goToProfile() {
    const savedToken = localStorage.getItem("trainingToken");
    goTo(savedToken ? "/trainee-profile" : "/trainee-login");
  }

  function logout() {
    clearTrainingSession();
    navigate("/trainee-login", { replace: true });
  }

  function openStep(step) {
    if (!step || step.locked) return;

    setSelectedStep(step);
    setModalPage("lesson");
    setStudyPageIndex(0);
    setAnswers(roadmapProgress?.answers?.[step.id] || {});
    setExamResult(null);
  }

  function closeModal() {
    setSelectedStep(null);
    setModalPage("lesson");
    setStudyPageIndex(0);
    setAnswers({});
    setExamResult(null);
  }

  function saveExamResult({ step, nextAnswers }) {
    if (!step) return;

    if (examQuestions.length < EXAM_QUESTION_COUNT) {
      setMsg({
        type: "error",
        text: "Exam questions are incomplete. Please reopen this roadmap step.",
      });
      return;
    }

    if (Object.keys(nextAnswers).length < examQuestions.length) {
      setMsg({
        type: "error",
        text: "Please answer all questions first.",
      });
      return;
    }

    const correctCount = examQuestions.reduce((total, question, index) => {
      return total + (nextAnswers[index] === question.answer ? 1 : 0);
    }, 0);

    const scorePercent = Math.round((correctCount / examQuestions.length) * 100);
    const examPassed = correctCount >= PASSING_SCORE;
    const professorPassed = step.professorCompleted === true;
    const unlockNext = examPassed && professorPassed;

    const nextProgress = {
      examPassed: {
        ...(roadmapProgress?.examPassed || {}),
      },
      attempts: {
        ...(roadmapProgress?.attempts || {}),
        [step.id]: Number(roadmapProgress?.attempts?.[step.id] || 0) + 1,
      },
      scores: {
        ...(roadmapProgress?.scores || {}),
        [step.id]: scorePercent,
      },
      completedAt: {
        ...(roadmapProgress?.completedAt || {}),
      },
      answers: {
        ...(roadmapProgress?.answers || {}),
        [step.id]: nextAnswers,
      },
    };

    if (examPassed) {
      nextProgress.examPassed[step.id] = true;
    }

    if (unlockNext) {
      nextProgress.completedAt[step.id] = new Date().toISOString();
    }

    setRoadmapProgress(nextProgress);
    writeRoadmapProgress(storageKey, nextProgress);

    setExamResult({
      examPassed,
      professorPassed,
      unlockNext,
      correctCount,
      total: examQuestions.length,
      scorePercent,
      wrongItems: examQuestions
        .map((question, index) => ({
          ...question,
          selectedAnswer: nextAnswers[index] || "",
        }))
        .filter((item) => item.selectedAnswer !== item.answer),
    });

    setModalPage("result");

    setMsg({
      type: unlockNext ? "success" : "error",
      text: unlockNext
        ? "Competency exam passed and professor already checked this competency. Next roadmap step is now unlocked."
        : examPassed
        ? "Exam passed, but this competency still needs professor check before the next step unlocks."
        : "Exam not passed yet. Review the study module and try again.",
    });
  }

  function updateAnswer(questionIndex, option) {
    const nextAnswers = {
      ...answers,
      [questionIndex]: option,
    };

    setAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length >= examQuestions.length) {
      saveExamResult({
        step: selectedStep,
        nextAnswers,
      });
    }
  }

  function resetCurrentExam() {
    setAnswers({});
    setExamResult(null);
    setModalPage("exam");
  }

  const selectedStudyModule = selectedStep
    ? buildStudyModuleSections(selectedStep)
    : null;

  const studyPages = useMemo(
    () => buildStudyModulePages(selectedStep, selectedStudyModule),
    [selectedStep, selectedStudyModule]
  );

  const currentStudyPageIndex = Math.min(
    Math.max(studyPageIndex, 0),
    Math.max(studyPages.length - 1, 0)
  );
  const currentStudyPage = studyPages[currentStudyPageIndex] || null;
  const isFirstStudyPage = currentStudyPageIndex <= 0;
  const isLastStudyPage = currentStudyPageIndex >= studyPages.length - 1;

  return (
    <div className="ltc-trainee-home-page">
      <style>{pageStyles}</style>

      <Header
        activeKey="roadmap"
        goTo={goTo}
        goToProfile={goToProfile}
        profilePhotoUrl={profilePhotoUrl}
        onOpenMenu={() => setMobileOpen(true)}
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
              Competency <span>Roadmap</span>
            </h2>
            <p className="ltc-hero-text" style={fontPontano}>
              {traineeDisplayName} • {traineeEmail}
            </p>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-home-shell">
              <h2 className="ltc-section-heading" style={fontMontserrat}>
                Competency-Based Roadmap
              </h2>
              <div className="ltc-section-line" />
              <p className="ltc-section-intro" style={fontPoppins}>
                Each step is based on your course competencies. Study the module, take the exam, and wait for the professor check. The next step unlocks only after both requirements are done.
              </p>

              {msg.text ? (
                <div
                  className={[
                    "roadmap-alert mt-6 rounded-xl px-4 py-3 text-sm font-semibold",
                    msg.type === "success"
                      ? "bg-green-50 text-green-800 ring-1 ring-green-200"
                      : "bg-red-50 text-red-800 ring-1 ring-red-200",
                  ].join(" ")}
                >
                  {msg.text}
                </div>
              ) : null}

              <div className="roadmap-info-panel mt-6">
                <div className="roadmap-info-content">
                  <div className="roadmap-info-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13.5 9.2 17.7 19 7.9"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="roadmap-info-copy">
                    <span className="roadmap-info-kicker">Roadmap Overview</span>
                    <h3 className="roadmap-info-title" style={fontMontserrat}>
                      Your Training Path
                    </h3>
                    <p className="roadmap-info-text">
                      Track your competency progress, open available study modules, and refresh professor checks when updates are made.
                    </p>
                  </div>
                </div>

                <div className="roadmap-info-actions">
                  <div className="roadmap-next-card">
                    <div className="roadmap-next-label">Next Step</div>
                    <div className="roadmap-next-title">
                      {nextOpenStep?.title ||
                        "All completed or waiting professor check"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadRoadmap({ silent: true })}
                    disabled={refreshing}
                    className="roadmap-refresh-button"
                  >
                    <span className="roadmap-refresh-icon" aria-hidden="true">
                      ↻
                    </span>
                    <span>{refreshing ? "Refreshing..." : "Refresh Professor Check"}</span>
                  </button>
                </div>
              </div>

              <div className="mt-6">
                {loading ? (
                  <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl ring-1 ring-[#e2e8da]">
                    Loading competency roadmap...
                  </div>
                ) : !course ? (
                  <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-red-700 shadow-xl ring-1 ring-red-100">
                    No course assigned to this trainee account yet.
                  </div>
                ) : !steps.length ? (
                  <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl ring-1 ring-[#e2e8da]">
                    No competency roadmap found for this course yet.
                  </div>
                ) : (
                  <>
                    <DesktopRoadmap steps={steps} onOpenStep={openStep} />
                    <MobileRoadmap steps={steps} onOpenStep={openStep} />
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer goTo={goTo} />

      {mobileOpen ? (
        <MobileMenu
          activeKey="roadmap"
          onClose={() => setMobileOpen(false)}
          goTo={goTo}
          goToProfile={goToProfile}
        />
      ) : null}

      <RoadmapModal
        open={Boolean(selectedStep)}
        onClose={closeModal}
        title={
          selectedStep
            ? `${selectedStep.title} ${
                modalPage === "exam"
                  ? "- Exam"
                  : modalPage === "result"
                  ? "- Result"
                  : "- Study Module"
              }`
            : "Competency Roadmap"
        }
      >
        {selectedStep ? (
          <>
            {modalPage === "lesson" && selectedStudyModule && currentStudyPage ? (
              <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                <aside className="rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e2e8da]">
                  <div className="flex flex-wrap gap-2">
                    <StatusPill step={selectedStep} />
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#395345] ring-1 ring-[#d7ddd0]">
                      {selectedStep.code}
                    </span>
                  </div>

                  <div className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#748175]">
                    Full Competency Study Module
                  </div>

                  <h4 className="mt-2 text-xl font-extrabold leading-tight text-[#395345]">
                    {selectedStep.title}
                  </h4>

                  <p className="mt-2 text-xs leading-6 text-[#647166]">
                    Group: <span className="font-bold">{selectedStep.groupTitle}</span>
                  </p>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#dce3d6]">
                    <div
                      className="h-full rounded-full bg-[#395345] transition-all"
                      style={{
                        width: `${Math.round(
                          ((currentStudyPageIndex + 1) / studyPages.length) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 text-xs font-bold text-[#647166]">
                    Stage {currentStudyPageIndex + 1} of {studyPages.length}
                  </div>

                  <div className="mt-5 space-y-2">
                    {studyPages.map((page, index) => {
                      const active = index === currentStudyPageIndex;
                      const done = index < currentStudyPageIndex;

                      return (
                        <button
                          key={page.key}
                          type="button"
                          onClick={() => setStudyPageIndex(index)}
                          className={[
                            "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-xs font-bold transition",
                            active
                              ? "bg-[#395345] text-white"
                              : done
                              ? "bg-green-50 text-green-800 ring-1 ring-green-100"
                              : "bg-white text-[#395345] ring-1 ring-[#e2e8da] hover:bg-[#eef1e7]",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                              active
                                ? "bg-white text-[#395345]"
                                : done
                                ? "bg-green-600 text-white"
                                : "bg-[#f7f8f3] text-[#395345] ring-1 ring-[#d7ddd0]",
                            ].join(" ")}
                          >
                            {done ? "✓" : index + 1}
                          </span>
                          <span>{page.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <section className="rounded-2xl bg-white ring-1 ring-[#e2e8da]">
                  <div className="border-b border-[#edf1e8] p-5">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#748175]">
                      {currentStudyPage.eyebrow}
                    </div>
                    <h4 className="mt-2 text-2xl font-extrabold text-[#395345]">
                      {currentStudyPage.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-[#647166]">
                      {currentStudyPage.description}
                    </p>
                  </div>

                  <div className="min-h-[330px] p-5">
                    {currentStudyPage.content}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1e8] bg-[#fbfcf8] p-5">
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                      {isLastStudyPage
                        ? "Ready for exam"
                        : `Next: ${studyPages[currentStudyPageIndex + 1]?.label || "Continue"}`}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-2xl border border-[#c9d0c1] bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#395345]"
                      >
                        Close
                      </button>

                      <button
                        type="button"
                        disabled={isFirstStudyPage}
                        onClick={() =>
                          setStudyPageIndex((current) => Math.max(current - 1, 0))
                        }
                        className="rounded-2xl border border-[#c9d0c1] bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#395345] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>

                      {!isLastStudyPage ? (
                        <button
                          type="button"
                          onClick={() =>
                            setStudyPageIndex((current) =>
                              Math.min(current + 1, studyPages.length - 1)
                            )
                          }
                          className="rounded-2xl bg-[#395345] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
                        >
                          Next Stage
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={resetCurrentExam}
                          className="rounded-2xl bg-[#395345] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
                        >
                          Next: Take Exam
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            ) : null}

            {modalPage === "exam" ? (
              <div>
                <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-lg font-extrabold text-[#355345]">
                        Competency Exam
                      </h4>
                      <p className="mt-1 text-sm text-[#647166]">
                        Select your answer using the radio buttons. After you
                        answer the last question, the exam will automatically
                        check your score.
                      </p>
                    </div>

                    <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#395345] ring-1 ring-[#d7ddd0]">
                      Answered: {Object.keys(answers).length}/
                      {examQuestions.length}
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-5">
                  {examQuestions.map((question, questionIndex) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-[#dde3d6] bg-white p-5 ring-1 ring-black/5"
                    >
                      <div className="text-sm font-bold uppercase tracking-[0.14em] text-[#748175]">
                        Question {questionIndex + 1}
                      </div>

                      <h5 className="mt-2 text-base font-semibold text-[#355345]">
                        {question.prompt}
                      </h5>

                      <div className="mt-4 space-y-3">
                        {question.options.map((option) => {
                          const checked = answers[questionIndex] === option;

                          return (
                            <label
                              key={option}
                              className={[
                                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition",
                                checked
                                  ? "border-[#395345] bg-[#eef3eb]"
                                  : "border-[#dde3d6] bg-[#fafbf8]",
                              ].join(" ")}
                            >
                              <input
                                type="radio"
                                name={`question-${questionIndex}`}
                                value={option}
                                checked={checked}
                                onChange={() =>
                                  updateAnswer(questionIndex, option)
                                }
                                className="mt-1"
                              />
                              <span className="text-sm text-[#355345]">
                                {option}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setModalPage("lesson")}
                    className="rounded-2xl border border-[#c9d0c1] bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#395345]"
                  >
                    Back to Study Module
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      saveExamResult({
                        step: selectedStep,
                        nextAnswers: answers,
                      })
                    }
                    className="rounded-2xl bg-[#395345] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
                  >
                    Check Now
                  </button>
                </div>
              </div>
            ) : null}

            {modalPage === "result" && examResult ? (
              <div>
                <div
                  className={[
                    "rounded-2xl p-6 ring-1",
                    examResult.unlockNext
                      ? "bg-green-50 text-green-900 ring-green-200"
                      : examResult.examPassed
                      ? "bg-yellow-50 text-yellow-900 ring-yellow-200"
                      : "bg-red-50 text-red-900 ring-red-200",
                  ].join(" ")}
                >
                  <div className="text-xs font-bold uppercase tracking-[0.16em]">
                    Exam Result
                  </div>

                  <h4 className="mt-2 text-2xl font-extrabold">
                    {examResult.unlockNext
                      ? "Step Completed"
                      : examResult.examPassed
                      ? "Exam Passed - Waiting Professor Check"
                      : "Exam Not Passed"}
                  </h4>

                  <p className="mt-2 text-sm">
                    Score:{" "}
                    <span className="font-bold">
                      {examResult.correctCount}
                    </span>{" "}
                    / {examResult.total} ({examResult.scorePercent}%)
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-white/70 p-4 ring-1 ring-black/5">
                      <div className="text-xs font-bold uppercase tracking-[0.14em]">
                        Exam Requirement
                      </div>
                      <div className="mt-2 text-sm font-bold">
                        {examResult.examPassed
                          ? "Passed"
                          : "Needs at least 7/10"}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/70 p-4 ring-1 ring-black/5">
                      <div className="text-xs font-bold uppercase tracking-[0.14em]">
                        Professor Competency Check
                      </div>
                      <div className="mt-2 text-sm font-bold">
                        {examResult.professorPassed
                          ? "Already checked"
                          : "Not checked yet"}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6">
                    {examResult.unlockNext
                      ? "The next roadmap step is now unlocked."
                      : examResult.examPassed
                      ? "You passed the exam, but your professor must check this competency before the next step unlocks. Click Refresh Professor Check after your professor updates it."
                      : "Review the study module and retake the exam."}
                  </p>
                </div>

                {examResult.wrongItems.length ? (
                  <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
                    <h5 className="text-base font-extrabold text-[#355345]">
                      Review Wrong Answers
                    </h5>

                    <div className="mt-4 space-y-4">
                      {examResult.wrongItems.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
                          className="rounded-xl border border-[#ede2e2] bg-[#fff7f7] p-4"
                        >
                          <p className="text-sm font-semibold text-[#355345]">
                            {item.prompt}
                          </p>
                          <p className="mt-2 text-sm text-red-700">
                            Your answer: {item.selectedAnswer || "-"}
                          </p>
                          <p className="mt-1 text-sm text-green-700">
                            Correct answer: {item.answer}
                          </p>
                          <p className="mt-2 text-xs text-[#647166]">
                            {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setModalPage("lesson")}
                    className="rounded-2xl border border-[#c9d0c1] bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#395345]"
                  >
                    Review Study Module
                  </button>

                  {!examResult.examPassed ? (
                    <button
                      type="button"
                      onClick={resetCurrentExam}
                      className="rounded-2xl bg-[#c45f34] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
                    >
                      Retake Exam
                    </button>
                  ) : null}

                  {!examResult.professorPassed ? (
                    <button
                      type="button"
                      onClick={() => loadRoadmap({ silent: true })}
                      className="rounded-2xl bg-[#395345] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
                    >
                      Refresh Professor Check
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl bg-[#395345] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
                  >
                    Close Roadmap
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </RoadmapModal>
    </div>
  );
}

function Header({ activeKey = "home", goTo, goToProfile, profilePhotoUrl, onOpenMenu }) {
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

function MobileMenu({ activeKey = "home", onClose, goTo, goToProfile }) {
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


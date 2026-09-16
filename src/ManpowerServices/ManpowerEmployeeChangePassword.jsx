import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const LOGO_IMAGE = "/ManpowerLogo.webp";
const HERO_IMAGE = "/ManpowerBanner.webp";

const EMPLOYEE_LOGIN_ROUTE = "/manpower-employee-login";
const EMPLOYEE_HOME_ROUTE = "/manpower-employee-home";
const EMPLOYEE_PAYROLL_ROUTE = "/manpower-employee-payroll";
const EMPLOYEE_LEAVE_ROUTE = "/manpower-employee-leave";
const EMPLOYEE_PROFILE_ROUTE = "/manpower-employee-profile";

const fontMontserrat = { fontFamily: "Arial, Helvetica, sans-serif" };
const fontPontano = { fontFamily: "Arial, Helvetica, sans-serif" };
const fontPoppins = { fontFamily: "Arial, Helvetica, sans-serif" };

const pageStyles = `
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
    --glass: rgba(255,255,255,.88);
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
    font-family: Arial, Helvetica, sans-serif;
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

  .ltc-desktop-nav { display: flex; align-items: center; gap: 8px; margin-left: auto; }

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

  .ltc-hero {
    position: relative;
    overflow: hidden;
    color: white;
    isolation: isolate;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
    padding: 74px 0 66px;
  }

  .ltc-hero-slide {
    position: absolute;
    inset: 0;
    z-index: -4;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .30;
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
  }

  .ltc-eyebrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0 28px;
    border: 1px solid rgba(255,255,255,.24);
    background: rgba(255,255,255,.12);
    border-radius: 999px;
    color: var(--gold-soft);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .24em;
    text-transform: uppercase;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
  }

  .ltc-hero-title {
    margin: 24px 0 16px;
    font-size: clamp(42px, 6.5vw, 82px);
    line-height: .95;
    font-weight: 900;
    letter-spacing: -.08em;
  }

  .ltc-hero-title span { color: var(--gold-soft); }

  .ltc-hero-text {
    max-width: 750px;
    margin: 0 auto;
    color: rgba(255,255,255,.9);
    font-size: clamp(16px, 2vw, 21px);
  }

  .ltc-section { padding: 54px 0 70px; min-height: 760px; }

  .ltc-form-shell {
    position: relative;
    overflow: hidden;
    max-width: 780px;
    margin: 0 auto;
    padding: clamp(24px, 4vw, 42px);
    border-radius: 32px;
    background: var(--glass);
    border: 1px solid rgba(8,39,25,.1);
    box-shadow: var(--shadow-lg);
    transition: transform .28s var(--ease), box-shadow .28s var(--ease);
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
    margin-bottom: 24px;
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
  .ltc-field:nth-child(4) { animation-delay: .28s; }

  .ltc-field label {
    display: block;
    color: var(--green-900);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 9px;
  }

  .ltc-input {
    width: 100%;
    min-height: 54px;
    border: 1px solid rgba(8,39,25,.14);
    border-radius: 18px;
    background: rgba(255,255,255,.9);
    color: var(--green-950);
    padding: 0 18px;
    outline: none;
    font-size: 15px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
    transition: .25s var(--ease);
  }

  .ltc-input:hover { border-color: rgba(35,95,62,.28); transform: translateY(-1px); }
  .ltc-input:focus { border-color: rgba(215,168,77,.8); box-shadow: 0 0 0 4px rgba(215,168,77,.16); }

  .ltc-actions { display: grid; gap: 12px; margin-top: 22px; }

  .ltc-actions-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .ltc-primary-button,
  .ltc-secondary-button,
  .ltc-outline-button {
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
    text-decoration: none;
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

  .ltc-outline-button {
    color: var(--green-900);
    background: rgba(8,39,25,.08);
    border: 1px solid rgba(8,39,25,.12);
  }

  .ltc-outline-button:hover:not(:disabled) { transform: translateY(-2px); background: rgba(215,168,77,.18); }

  .ltc-primary-button:disabled,
  .ltc-secondary-button:disabled { opacity: .62; cursor: not-allowed; transform: none; }

  .ltc-status {
    border-radius: 18px;
    padding: 14px 16px;
    margin-bottom: 18px;
    font-size: 14px;
    font-weight: 700;
    border: 1px solid transparent;
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
    .ltc-actions-row { grid-template-columns: 1fr; }
  }


  /* ===== Unified LTC Manpower Employee Portal ===== */
  .ltc-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 80 !important;
    width: 100% !important;
    background: #082719 !important;
    border-bottom: 1px solid rgba(255,255,255,.10) !important;
    box-shadow: 0 10px 34px rgba(7,31,20,.14) !important;
  }

  .ltc-header .ltc-container {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding-left: 32px !important;
    padding-right: 32px !important;
  }

  .ltc-nav {
    min-height: 76px !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 24px !important;
  }

  .ltc-logo {
    display: flex !important;
    align-items: center !important;
    gap: 13px !important;
    flex: 0 0 auto !important;
    color: #fff !important;
    text-decoration: none !important;
  }

  .ltc-logo-icon {
    width: 42px !important;
    height: 42px !important;
    min-width: 42px !important;
    border-radius: 999px !important;
    background: #fff !important;
    object-fit: cover !important;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12) !important;
  }

  .ltc-logo h1 {
    margin: 0 !important;
    color: #fff !important;
    font-size: 18px !important;
    line-height: 1 !important;
    font-weight: 900 !important;
    letter-spacing: -.04em !important;
    text-transform: uppercase !important;
  }

  .ltc-logo p {
    margin: 3px 0 0 !important;
    color: rgba(255,255,255,.72) !important;
    font-size: 11px !important;
    line-height: 1.3 !important;
  }

  .ltc-desktop-nav {
    margin-left: auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 8px !important;
  }

  .ltc-profile-wrap {
    display: flex !important;
    align-items: center !important;
    margin-left: 4px !important;
  }

  .ltc-nav-link {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-height: 40px !important;
    padding: 0 14px !important;
    border: 0 !important;
    border-radius: 999px !important;
    background: transparent !important;
    color: rgba(255,255,255,.78) !important;
    font-size: 12px !important;
    font-weight: 800 !important;
    letter-spacing: .08em !important;
    line-height: 1 !important;
    text-decoration: none !important;
    text-transform: uppercase !important;
    white-space: nowrap !important;
    transition: background .25s ease, color .25s ease, transform .25s ease !important;
  }

  .ltc-nav-link:hover,
  .ltc-nav-link.active {
    color: #fff !important;
    background: rgba(255,255,255,.13) !important;
    transform: translateY(-1px) !important;
  }

  .ltc-profile-wrap .ltc-nav-link,
  .ltc-nav-link.ltc-profile-button {
    min-width: 104px !important;
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 14px 28px rgba(215,168,77,.18) !important;
  }

  .ltc-profile-wrap .ltc-nav-link:hover,
  .ltc-profile-wrap .ltc-nav-link.active,
  .ltc-nav-link.ltc-profile-button:hover,
  .ltc-nav-link.ltc-profile-button.active {
    color: #102418 !important;
    background: linear-gradient(135deg,#f8dc8c,#d7a84d) !important;
  }

  .ltc-menu-button {
    display: none !important;
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 12px !important;
    background: rgba(255,255,255,.10) !important;
    color: #fff !important;
    cursor: pointer !important;
  }

  .ltc-menu-button svg { width: 24px !important; height: 24px !important; }

  .ltc-sidebar-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 100 !important;
    background: rgba(0,0,0,.42) !important;
  }

  .ltc-sidebar-panel {
    position: absolute !important;
    top: 0 !important;
    right: 0 !important;
    width: min(310px,86vw) !important;
    height: 100% !important;
    padding: 20px !important;
    overflow-y: auto !important;
    background: #fff !important;
    box-shadow: -20px 0 60px rgba(0,0,0,.25) !important;
  }

  .ltc-sidebar-top {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    margin-bottom: 16px !important;
    padding-bottom: 16px !important;
    border-bottom: 1px solid rgba(16,24,40,.10) !important;
  }

  .ltc-sidebar-title {
    margin: 0 !important;
    color: #071f14 !important;
    font-size: 12px !important;
    font-weight: 900 !important;
    letter-spacing: .14em !important;
  }

  .ltc-sidebar-close {
    width: 44px !important;
    height: 44px !important;
    border: 0 !important;
    border-radius: 12px !important;
    background: #f2f4f7 !important;
    color: #101828 !important;
    cursor: pointer !important;
  }

  .ltc-sidebar-link {
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
    min-height: 48px !important;
    margin-bottom: 8px !important;
    padding: 0 14px !important;
    border: 0 !important;
    border-radius: 14px !important;
    background: transparent !important;
    color: #101828 !important;
    font-size: 13px !important;
    font-weight: 800 !important;
    text-align: left !important;
    text-decoration: none !important;
    cursor: pointer !important;
  }

  .ltc-sidebar-link:hover,
  .ltc-sidebar-link.active {
    color: #fff !important;
    background: #174a30 !important;
  }

  .ltc-hero {
    position: relative !important;
    min-height: 300px !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    overflow: hidden !important;
    isolation: isolate !important;
    color: #fff !important;
    background: linear-gradient(120deg,#03180f 0%,#082719 42%,#155f3b 100%) !important;
  }

  .ltc-hero-slide {
    position: absolute !important;
    inset: 0 !important;
    z-index: -4 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    object-position: center !important;
    opacity: .28 !important;
    filter: saturate(.9) contrast(1.08) !important;
    animation: none !important;
    transform: none !important;
  }

  .ltc-hero::before {
    content: "" !important;
    position: absolute !important;
    inset: 0 !important;
    z-index: -3 !important;
    background: linear-gradient(120deg,rgba(2,18,11,.96) 0%,rgba(5,37,23,.88) 42%,rgba(12,64,39,.76) 100%) !important;
  }

  .ltc-hero::after {
    content: "" !important;
    position: absolute !important;
    inset: -16% -10% -24% !important;
    z-index: -2 !important;
    background:
      radial-gradient(circle at 16% 82%,rgba(19,120,72,.32),transparent 24%),
      radial-gradient(circle at 72% 18%,rgba(28,108,68,.24),transparent 30%),
      radial-gradient(circle at 88% 44%,rgba(244,212,132,.12),transparent 28%) !important;
    pointer-events: none !important;
    animation: none !important;
    transform: none !important;
    filter: none !important;
  }

  .ltc-hero-content {
    position: relative !important;
    z-index: 2 !important;
    width: min(960px,92%) !important;
    max-width: 960px !important;
    min-height: 300px !important;
    margin: 0 auto !important;
    padding: 58px 0 62px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    animation: none !important;
    transform: none !important;
  }

  .ltc-eyebrow {
    min-height: 0 !important;
    padding: 8px 14px !important;
    border: 1px solid rgba(255,255,255,.18) !important;
    border-radius: 999px !important;
    background: rgba(255,255,255,.10) !important;
    color: #f4d484 !important;
    font-size: 11px !important;
    font-weight: 900 !important;
    letter-spacing: .18em !important;
    text-transform: uppercase !important;
  }

  .ltc-hero-title {
    margin: 14px 0 0 !important;
    max-width: 900px !important;
    color: #fff !important;
    font-size: clamp(40px,5.2vw,64px) !important;
    line-height: 1 !important;
    font-weight: 900 !important;
    letter-spacing: -.055em !important;
    text-align: center !important;
    text-shadow: 0 8px 26px rgba(0,0,0,.22) !important;
    animation: none !important;
    transform: none !important;
  }

  .ltc-hero-title span { color: #f4d484 !important; }

  .ltc-hero-text {
    max-width: 720px !important;
    margin: 18px auto 0 !important;
    color: rgba(255,255,255,.82) !important;
    font-size: 16px !important;
    line-height: 1.75 !important;
    text-align: center !important;
    animation: none !important;
    transform: none !important;
  }

  .ltc-section,
  .ltc-profile-overview,
  .ltc-payroll-overview {
    padding-top: 56px !important;
    padding-bottom: 72px !important;
  }

  .ltc-home-shell,
  .ltc-profile-shell,
  .ltc-payroll-panel,
  .ltc-form-shell {
    border-radius: 28px !important;
    border: 1px solid rgba(35,95,62,.10) !important;
    background: rgba(255,255,255,.90) !important;
    box-shadow: 0 18px 45px rgba(8,39,25,.12) !important;
  }

  .ltc-field { animation: none !important; transform: none !important; }

  .ltc-footer {
    width: 100% !important;
    margin: 0 !important;
    padding: 30px 0 12px !important;
    background: #082719 !important;
    color: #fff !important;
    text-align: left !important;
  }

  .ltc-footer .ltc-container {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding-left: 32px !important;
    padding-right: 32px !important;
  }

  .ltc-footer-grid {
    width: 100% !important;
    display: grid !important;
    grid-template-columns: 1.2fr .8fr 1.2fr 1fr .8fr !important;
    gap: 22px !important;
    padding-bottom: 24px !important;
    border-bottom: 1px solid rgba(255,255,255,.10) !important;
  }

  .ltc-footer-brand {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    color: #fff !important;
    text-decoration: none !important;
    cursor: pointer !important;
  }

  .ltc-footer-brand img {
    width: 42px !important;
    height: 42px !important;
    border-radius: 999px !important;
    background: #fff !important;
    object-fit: cover !important;
  }

  .ltc-footer h4 {
    margin: 0 !important;
    color: #fff !important;
    font-size: 20px !important;
    line-height: 1.2 !important;
    font-weight: 900 !important;
    text-transform: uppercase !important;
  }

  .ltc-footer h5 {
    margin: 0 0 10px !important;
    color: #f4d484 !important;
    font-size: 12px !important;
    line-height: 1.2 !important;
    font-weight: 900 !important;
    letter-spacing: .14em !important;
    text-transform: uppercase !important;
  }

  .ltc-footer p,
  .ltc-footer a,
  .ltc-footer-link {
    display: block !important;
    margin: 5px 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    color: rgba(255,255,255,.68) !important;
    font-size: 13px !important;
    line-height: 1.55 !important;
    text-align: left !important;
    text-decoration: none !important;
  }

  .ltc-footer a:hover,
  .ltc-footer-link:hover { color: #fff !important; text-decoration: underline !important; }

  .ltc-copyright {
    width: 100% !important;
    padding-top: 14px !important;
    display: flex !important;
    justify-content: space-between !important;
    gap: 12px !important;
    color: rgba(255,255,255,.52) !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
  }

  @media (max-width: 1180px) {
    .ltc-footer-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
  }

  @media (max-width: 900px) {
    .ltc-header .ltc-container,
    .ltc-footer .ltc-container { padding-left: 22px !important; padding-right: 22px !important; }
    .ltc-nav { min-height: 72px !important; }
    .ltc-desktop-nav,
    .ltc-profile-wrap { display: none !important; }
    .ltc-menu-button { display: grid !important; place-items: center !important; margin-left: auto !important; }
    .ltc-hero { min-height: 260px !important; }
    .ltc-hero-content { min-height: 260px !important; padding: 48px 0 52px !important; }
    .ltc-footer-grid { grid-template-columns: 1fr !important; gap: 18px !important; padding-bottom: 22px !important; }
    .ltc-copyright { flex-direction: column !important; }
  }

  @media (max-width: 600px) {
    .ltc-header .ltc-container,
    .ltc-footer .ltc-container { padding-left: 16px !important; padding-right: 16px !important; }
    .ltc-logo h1 { font-size: 14px !important; }
    .ltc-logo p { font-size: 10px !important; }
    .ltc-hero { min-height: 235px !important; }
    .ltc-hero-content { min-height: 235px !important; padding: 42px 0 46px !important; }
    .ltc-hero-title { font-size: clamp(34px,11vw,48px) !important; }
    .ltc-hero-text { font-size: 14px !important; }
    .ltc-section,
    .ltc-profile-overview,
    .ltc-payroll-overview { padding-top: 42px !important; padding-bottom: 56px !important; }
  }


  /* ===== FINAL UNIFIED EMPLOYEE HEADER ===== */
  .ltc-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 100 !important;
    width: 100% !important;
    height: 76px !important;
    min-height: 76px !important;
    margin: 0 !important;
    background: #082719 !important;
    border-bottom: 1px solid rgba(255,255,255,.10) !important;
    box-shadow: 0 10px 34px rgba(7,31,20,.14) !important;
  }
  .ltc-header .ltc-container {
    width: 100% !important;
    max-width: none !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 32px !important;
  }
  .ltc-nav {
    width: 100% !important;
    height: 76px !important;
    min-height: 76px !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 24px !important;
  }
  .ltc-logo {
    min-width: 0 !important;
    flex: 0 0 auto !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 13px !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    color: #fff !important;
    text-align: left !important;
    text-decoration: none !important;
    cursor: pointer !important;
  }
  .ltc-logo-icon {
    width: 42px !important;
    height: 42px !important;
    min-width: 42px !important;
    min-height: 42px !important;
    border-radius: 999px !important;
    background: #fff !important;
    object-fit: cover !important;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12) !important;
  }
  .ltc-logo > div,
  .ltc-logo > span {
    min-width: 0 !important;
    display: block !important;
  }
  .ltc-logo h1 {
    margin: 0 !important;
    color: #fff !important;
    font-size: 18px !important;
    line-height: 1 !important;
    font-weight: 900 !important;
    letter-spacing: -.04em !important;
    text-transform: uppercase !important;
    white-space: nowrap !important;
  }
  .ltc-logo p {
    margin: 3px 0 0 !important;
    color: rgba(255,255,255,.72) !important;
    font-size: 11px !important;
    line-height: 1.3 !important;
    white-space: nowrap !important;
  }
  .ltc-desktop-nav {
    margin-left: auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 8px !important;
  }
  .ltc-profile-wrap {
    margin-left: 4px !important;
    display: flex !important;
    align-items: center !important;
    flex: 0 0 auto !important;
  }
  .ltc-nav-link {
    min-height: 40px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 14px !important;
    border: 0 !important;
    border-radius: 999px !important;
    background: transparent !important;
    color: rgba(255,255,255,.78) !important;
    font-size: 12px !important;
    font-weight: 800 !important;
    line-height: 1 !important;
    letter-spacing: .08em !important;
    text-transform: uppercase !important;
    text-decoration: none !important;
    white-space: nowrap !important;
    cursor: pointer !important;
    transition: color .25s ease, background .25s ease, transform .25s ease !important;
  }
  .ltc-nav-link:hover,
  .ltc-nav-link.active {
    color: #fff !important;
    background: rgba(255,255,255,.13) !important;
    transform: translateY(-1px) !important;
  }
  .ltc-profile-wrap .ltc-nav-link,
  .ltc-nav-link.ltc-profile-button {
    min-width: 104px !important;
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 14px 28px rgba(215,168,77,.18) !important;
  }
  .ltc-profile-wrap .ltc-nav-link:hover,
  .ltc-profile-wrap .ltc-nav-link.active,
  .ltc-nav-link.ltc-profile-button:hover,
  .ltc-nav-link.ltc-profile-button.active {
    color: #102418 !important;
    background: linear-gradient(135deg,#f8dc8c,#d7a84d) !important;
  }
  .ltc-menu-button {
    display: none !important;
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    margin-left: auto !important;
    padding: 0 !important;
    border: 1px solid rgba(255,255,255,.12) !important;
    border-radius: 14px !important;
    background: rgba(255,255,255,.10) !important;
    color: #fff !important;
    cursor: pointer !important;
  }
  .ltc-menu-button svg { width: 24px !important; height: 24px !important; }
  .ltc-sidebar-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 150 !important;
    background: rgba(0,0,0,.48) !important;
    backdrop-filter: blur(5px) !important;
  }
  .ltc-sidebar-panel {
    position: absolute !important;
    top: 0 !important;
    right: 0 !important;
    width: min(320px,88vw) !important;
    height: 100% !important;
    padding: 22px !important;
    overflow-y: auto !important;
    background: #fff !important;
    box-shadow: -24px 0 70px rgba(0,0,0,.28) !important;
  }
  .ltc-sidebar-top {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    margin-bottom: 16px !important;
    padding-bottom: 16px !important;
    border-bottom: 1px solid rgba(16,24,40,.10) !important;
  }
  .ltc-sidebar-title {
    margin: 0 !important;
    color: #071f14 !important;
    font-size: 12px !important;
    font-weight: 900 !important;
    letter-spacing: .14em !important;
  }
  .ltc-sidebar-close {
    width: 44px !important;
    height: 44px !important;
    border: 0 !important;
    border-radius: 13px !important;
    background: #f2f4f7 !important;
    color: #101828 !important;
    cursor: pointer !important;
  }
  .ltc-sidebar-link {
    width: 100% !important;
    min-height: 48px !important;
    display: flex !important;
    align-items: center !important;
    margin: 0 0 8px !important;
    padding: 0 14px !important;
    border: 0 !important;
    border-radius: 14px !important;
    background: transparent !important;
    color: #101828 !important;
    font-size: 13px !important;
    font-weight: 800 !important;
    letter-spacing: .06em !important;
    text-align: left !important;
    text-transform: uppercase !important;
    text-decoration: none !important;
    cursor: pointer !important;
  }
  .ltc-sidebar-link:hover,
  .ltc-sidebar-link.active {
    color: #fff !important;
    background: #174a30 !important;
  }
  @media (max-width: 1000px) {
    .ltc-header { height: 72px !important; min-height: 72px !important; }
    .ltc-header .ltc-container { padding-left: 22px !important; padding-right: 22px !important; }
    .ltc-nav { height: 72px !important; min-height: 72px !important; }
    .ltc-desktop-nav,
    .ltc-profile-wrap { display: none !important; }
    .ltc-menu-button { display: grid !important; place-items: center !important; }
  }
  @media (max-width: 700px) {
    .ltc-header { height: 68px !important; min-height: 68px !important; }
    .ltc-header .ltc-container { padding-left: 16px !important; padding-right: 16px !important; }
    .ltc-nav { height: 68px !important; min-height: 68px !important; gap: 14px !important; }
    .ltc-logo-icon { width: 40px !important; height: 40px !important; min-width: 40px !important; min-height: 40px !important; }
    .ltc-logo h1 { font-size: 14px !important; }
    .ltc-logo p { display: none !important; }
  }

`;

function getEmployeeToken() {
  return localStorage.getItem("manpowerEmployeeToken") || "";
}

function getEmployeeUser() {
  try {
    return JSON.parse(localStorage.getItem("manpowerEmployeeUser") || "null");
  } catch {
    return null;
  }
}

function saveEmployeeSession(token, employee) {
  localStorage.setItem("manpowerEmployeeToken", token);
  localStorage.setItem("manpowerEmployeeUser", JSON.stringify(employee || null));
}

function clearEmployeeSession() {
  localStorage.removeItem("manpowerEmployeeToken");
  localStorage.removeItem("manpowerEmployeeUser");
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/ManpowerLogo.webp"
        alt="Manpower Logo"
        className="h-10 w-10 rounded-full object-cover"
      />
      <h1 className="text-[22px] font-black tracking-wide text-[#2f5a45] md:text-[28px]">
        MANPOWER
      </h1>
    </div>
  );
}

function FooterLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/ManpowerLogo.webp"
        alt="Lumispire Logo"
        className="h-9 w-9 rounded-full object-cover"
      />
      <p className="text-2xl font-black tracking-wide text-white">LUMISPIRE</p>
    </div>
  );
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 10V8a4 4 0 1 1 8 0v2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 7h16v10H4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m5 8 7 6 7-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}


const homeReferenceFooterStyles = `
  /* Exact visual reference: ManpowerEmployeeHome.jsx footer */
  .emp-home-footer {
    width: 100%;
    margin: 0;
    padding: 30px 0 12px;
    background: #082719;
    color: #fff;
    text-align: left;
    font-family: Arial, Helvetica, sans-serif;
  }

  .emp-home-footer * { box-sizing: border-box; }

  .emp-home-footer-container {
    width: 100%;
    max-width: none;
    margin: 0;
    padding-left: 32px;
    padding-right: 32px;
  }

  .emp-home-footer-grid {
    width: 100%;
    display: grid;
    grid-template-columns: 1.2fr .8fr 1.2fr 1fr .8fr;
    gap: 22px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255,255,255,.10);
  }

  .emp-home-footer-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #fff;
    text-decoration: none;
    cursor: pointer;
    text-align: left;
  }

  .emp-home-footer-brand img {
    width: 42px;
    height: 42px;
    min-width: 42px;
    border-radius: 999px;
    object-fit: cover;
    background: #fff;
  }

  .emp-home-footer h4 {
    margin: 0;
    color: #fff;
    font-size: 20px;
    line-height: 1.2;
    font-weight: 900;
    text-transform: uppercase;
  }

  .emp-home-footer h5 {
    margin: 0 0 10px;
    color: #f4d484;
    font-size: 12px;
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .emp-home-footer p,
  .emp-home-footer-link {
    display: block;
    margin: 5px 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: rgba(255,255,255,.68);
    font-size: 13px;
    line-height: 1.55;
    text-align: left;
    text-decoration: none;
  }

  button.emp-home-footer-link {
    width: auto;
    cursor: pointer;
  }

  .emp-home-footer-link:hover {
    color: #fff;
    text-decoration: underline;
  }

  .emp-home-footer-copyright {
    width: 100%;
    padding-top: 14px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: rgba(255,255,255,.52);
    font-size: 12px;
    line-height: 1.4;
  }

  @media (max-width: 1180px) {
    .emp-home-footer-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 900px) {
    .emp-home-footer {
      padding: 28px 0 12px;
    }

    .emp-home-footer-container {
      padding-left: 22px;
      padding-right: 22px;
    }

    .emp-home-footer-grid {
      grid-template-columns: 1fr;
      gap: 18px;
      padding-bottom: 22px;
    }

    .emp-home-footer-copyright {
      flex-direction: column;
    }
  }

  @media (max-width: 600px) {
    .emp-home-footer-container {
      padding-left: 16px;
      padding-right: 16px;
    }
  }
`;

function HomeReferenceFooter({ onNavigate }) {
  const footerHeadingFont = { fontFamily: "Arial, Helvetica, sans-serif" };
  const footerBodyFont = { fontFamily: "Arial, Helvetica, sans-serif" };

  return (
    <>
      <style>{homeReferenceFooterStyles}</style>
      <footer className="emp-home-footer">
        <div className="emp-home-footer-container emp-home-footer-grid">
          <div>
            <button
              type="button"
              onClick={() => onNavigate("/manpower-employee-home")}
              className="emp-home-footer-brand"
            >
              <img
                src={LOGO_IMAGE}
                width="128"
                height="128"
                decoding="async"
                alt="Manpower Logo"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://placehold.co/80x80/ffffff/4d6f55?text=M";
                }}
              />
              <h4 style={footerHeadingFont}>LTC Manpower</h4>
            </button>
          </div>

          <div>
            <h5 style={footerHeadingFont}>Menu</h5>
            <div>
              <button type="button" onClick={() => onNavigate("/manpower-employee-home")} className="emp-home-footer-link" style={footerBodyFont}>Home</button>
              <button type="button" onClick={() => onNavigate("/manpower-employee-payroll")} className="emp-home-footer-link" style={footerBodyFont}>Payroll</button>
              <button type="button" onClick={() => onNavigate("/manpower-employee-leave")} className="emp-home-footer-link" style={footerBodyFont}>Leave</button>
              <button type="button" onClick={() => onNavigate("/manpower-employee-profile")} className="emp-home-footer-link" style={footerBodyFont}>Profile</button>
            </div>
          </div>

          <div>
            <h5 style={footerHeadingFont}>Contact Information</h5>
            <div>
              <p style={footerBodyFont}>lorengladius@ltcmultiservices.com</p>
              <p style={footerBodyFont}>ltc.tamsi@gmail.com</p>
              <p style={footerBodyFont}>+639516281271 / +639959808051</p>
            </div>
          </div>

          <div>
            <h5 style={footerHeadingFont}>Address</h5>
            <div>
              <p style={footerBodyFont}>2/F 5441 Currie Street,</p>
              <p style={footerBodyFont}>Palanan, Makati City</p>
            </div>
          </div>

          <div>
            <h5 style={footerHeadingFont}>Follow Us</h5>
            <div>
              <a
                href="https://www.facebook.com/profile.php?id=61571746334920"
                target="_blank"
                rel="noreferrer"
                className="emp-home-footer-link"
                style={footerBodyFont}
              >
                Facebook Page
              </a>
              <a
                href="mailto:lorengladius@ltcmultiservices.com"
                className="emp-home-footer-link"
                style={footerBodyFont}
              >
                Email LTC Manpower
              </a>
            </div>
          </div>
        </div>

        <div className="emp-home-footer-container emp-home-footer-copyright">
          <span style={footerBodyFont}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span style={footerBodyFont}>Developed by CRMS Tech Alliance</span>
        </div>
      </footer>
    </>
  );
}

export default function ManpowerEmployeeChangePassword() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [token, setToken] = useState(getEmployeeToken());
  const [employee, setEmployee] = useState(getEmployeeUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });

  const [otpState, setOtpState] = useState({
    loading: false,
    success: "",
    error: "",
  });

  const [passwordState, setPasswordState] = useState({
    loading: false,
    success: "",
    error: "",
  });
  const [otpSeconds, setOtpSeconds] = useState(0);

  const passwordChecks = useMemo(() => {
    const value = String(passwordForm.newPassword || "");
    return {
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[^A-Za-z0-9]/.test(value),
      different: Boolean(value) && value !== passwordForm.currentPassword,
    };
  }, [passwordForm.newPassword, passwordForm.currentPassword]);

  const strongPassword = Object.values(passwordChecks).every(Boolean);

  useEffect(() => {
    if (otpSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setOtpSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpSeconds]);

  const fullName = useMemo(() => {
    return [
      employee?.firstName || "",
      employee?.middleName || "",
      employee?.lastName || "",
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }, [employee]);

  function logout() {
    clearEmployeeSession();
    setToken("");
    setEmployee(null);
    navigate("/manpower-employee-login", { replace: true });
  }

  useEffect(() => {
    if (!token) {
      navigate("/manpower-employee-login", { replace: true });
      return;
    }

    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/manpower/employee/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 401 || res.status === 403) {
          logout();
          return;
        }

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load employee profile.");
        }

        if (!active) return;

        const nextEmployee = data?.employee || null;
        setEmployee(nextEmployee);
        saveEmployeeSession(token, nextEmployee);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load employee profile.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [token, navigate]);

  function validateBeforeOtp() {
    const currentPassword = String(passwordForm.currentPassword || "");
    const newPassword = String(passwordForm.newPassword || "");
    const confirmPassword = String(passwordForm.confirmPassword || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return "Please complete current password, new password, and confirm password first.";
    }

    if (!strongPassword) {
      return "Use at least 8 characters with uppercase, lowercase, number, and special character. The new password must differ from the current password.";
    }

    if (newPassword !== confirmPassword) {
      return "New password and confirm password do not match.";
    }

    return "";
  }

  async function sendOtp(e) {
    e.preventDefault();

    setOtpState({
      loading: false,
      success: "",
      error: "",
    });

    setPasswordState((prev) => ({
      ...prev,
      success: "",
      error: "",
    }));

    const validationError = validateBeforeOtp();

    if (validationError) {
      setOtpState({
        loading: false,
        success: "",
        error: validationError,
      });
      return;
    }

    setOtpState({
      loading: true,
      success: "",
      error: "",
    });

    try {
      const res = await fetch(
        `${API_BASE}/manpower/employee/change-password/request-otp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to send OTP.");
      }

      setOtpState({
        loading: false,
        success: data?.message || "OTP sent successfully. It will expire shortly.",
        error: "",
      });
      setOtpSeconds(60);
    } catch (err) {
      setOtpState({
        loading: false,
        success: "",
        error: err?.message || "Failed to send OTP.",
      });
    }
  }

  async function changePassword(e) {
    e.preventDefault();

    setPasswordState({
      loading: false,
      success: "",
      error: "",
    });

    setOtpState((prev) => ({
      ...prev,
      error: "",
    }));

    const currentPassword = String(passwordForm.currentPassword || "");
    const newPassword = String(passwordForm.newPassword || "");
    const confirmPassword = String(passwordForm.confirmPassword || "");
    const otp = String(passwordForm.otp || "").trim();

    if (!currentPassword || !newPassword || !confirmPassword || !otp) {
      setPasswordState({
        loading: false,
        success: "",
        error: "Please complete all password fields and enter the OTP.",
      });
      return;
    }

    if (!strongPassword) {
      setPasswordState({
        loading: false,
        success: "",
        error: "Your new password does not meet all security requirements.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordState({
        loading: false,
        success: "",
        error: "New password and confirm password do not match.",
      });
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setPasswordState({ loading: false, success: "", error: "Enter the complete 6-digit OTP." });
      return;
    }

    setPasswordState({
      loading: true,
      success: "",
      error: "",
    });

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          otp,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to change password.");
      }

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "", otp: "" });
      setOtpState({ loading: false, success: "", error: "" });
      setOtpSeconds(0);
      setPasswordState({
        loading: false,
        success: data?.message || "Password updated successfully. You will be signed out for security.",
        error: "",
      });
      window.setTimeout(() => {
        clearEmployeeSession();
        navigate("/manpower-employee-login", { replace: true, state: { passwordChanged: true } });
      }, 1400);
    } catch (err) {
      setPasswordState({
        loading: false,
        success: "",
        error: err?.message || "Failed to change password.",
      });
    }
  }

  return (
    <div className="ltc-change-password-page" style={fontPontano}>
      <style>{pageStyles}</style>

      <header className="ltc-header">
        <div className="ltc-container">
          <div className="ltc-nav">
          <button
            type="button"
            onClick={() => navigate("/manpower-employee-home")}
            className="ltc-logo"
            aria-label="Go to manpower employee home"
          >
            <img
              src={LOGO_IMAGE}
              width="128"
              height="128"
              decoding="async"
              alt="Manpower Logo"
              className="ltc-logo-icon"
              onError={(event) => {
                event.currentTarget.src =
                  "https://placehold.co/80x80/ffffff/45674b?text=M";
              }}
            />
            <div>
              <h1 style={fontMontserrat}>LTC MANPOWER SERVICES</h1>
              <p style={fontPontano}>Employee workforce portal.</p>
            </div>
          </button>

          <nav className="ltc-desktop-nav" style={fontPoppins} aria-label="Employee navigation">
            <button type="button" onClick={() => navigate(EMPLOYEE_HOME_ROUTE)} className="ltc-nav-link">Home</button>
            <button type="button" onClick={() => navigate(EMPLOYEE_PAYROLL_ROUTE)} className="ltc-nav-link">Payroll</button>
            <button type="button" onClick={() => navigate(EMPLOYEE_LEAVE_ROUTE)} className="ltc-nav-link">Leave</button>
          </nav>

          <div className="ltc-profile-wrap">
            <button
              type="button"
              onClick={() => navigate(EMPLOYEE_PROFILE_ROUTE)}
              className="ltc-nav-link ltc-profile-button active"
            >
              Profile
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="ltc-menu-button"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="ltc-sidebar-overlay">
          <div style={{ position: "absolute", inset: 0 }} onClick={() => setMobileOpen(false)} />
          <div className="ltc-sidebar-panel">
            <div className="ltc-sidebar-top">
              <p className="ltc-sidebar-title" style={fontPoppins}>MENU</p>
              <button type="button" onClick={() => setMobileOpen(false)} className="ltc-sidebar-close" aria-label="Close menu">✕</button>
            </div>
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_HOME_ROUTE} className="ltc-sidebar-link" style={fontPoppins}>Home</Link>
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_PAYROLL_ROUTE} className="ltc-sidebar-link" style={fontPoppins}>Payroll</Link>
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_LEAVE_ROUTE} className="ltc-sidebar-link" style={fontPoppins}>Leave</Link>
            <Link onClick={() => setMobileOpen(false)} to={EMPLOYEE_PROFILE_ROUTE} className="ltc-sidebar-link active" style={fontPoppins}>Profile</Link>
          </div>
        </div>
      ) : null}

      <main>
        <section className="ltc-hero">
          <img
            src={HERO_IMAGE}
            alt="Manpower banner"
            className="ltc-hero-slide"
            width="1672"
            height="941"
            srcSet="/ManpowerBanner-960.webp 960w, /ManpowerBanner-1440.webp 1440w, /ManpowerBanner.webp 1672w"
            sizes="100vw"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div className="ltc-container ltc-hero-content">
            <h2 className="ltc-hero-title" style={fontMontserrat}>
              Change <span>Password</span>
            </h2>
            <p className="ltc-hero-text" style={fontPontano}>
              Update your manpower employee account password using OTP verification.
            </p>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            {loading ? (
              <div className="ltc-form-shell">
                <div className="ltc-form-inner">
                  <div className="ltc-status ltc-status-info" style={fontPoppins}>
                    Loading employee account...
                  </div>
                </div>
              </div>
            ) : null}

            {!loading && error ? (
              <div className="ltc-form-shell">
                <div className="ltc-form-inner">
                  <div className="ltc-status ltc-status-error" style={fontPoppins}>
                    {error}
                  </div>
                </div>
              </div>
            ) : null}

            {!loading && !error ? (
              <section className="ltc-form-shell">
                <div className="ltc-form-inner">
                  <div className="ltc-form-header">
                    <div>
                      <h3 className="ltc-section-heading" style={fontMontserrat}>
                        Secure Account
                      </h3>
                      <div className="ltc-section-line" />
                      <p className="ltc-muted-text" style={fontPontano}>
                        Enter your current password, choose a new password, request an OTP, then verify it to complete the password change.
                      </p>
                    </div>
                  </div>

                  <div className="ltc-status ltc-status-info" style={fontPontano}>
                    <strong style={fontPoppins}>OTP will be sent to:</strong>{" "}
                    {employee?.personalEmail || employee?.companyEmail || "-"}
                  </div>

                  {otpState.error ? (
                    <div className="ltc-status ltc-status-error" style={fontPontano}>
                      {otpState.error}
                    </div>
                  ) : null}

                  {otpState.success ? (
                    <div className="ltc-status ltc-status-success" style={fontPontano}>
                      {otpState.success}
                    </div>
                  ) : null}

                  {passwordState.error ? (
                    <div className="ltc-status ltc-status-error" style={fontPontano}>
                      {passwordState.error}
                    </div>
                  ) : null}

                  {passwordState.success ? (
                    <div className="ltc-status ltc-status-success" style={fontPontano}>
                      {passwordState.success}
                    </div>
                  ) : null}

                  <form onSubmit={changePassword} className="ltc-form-grid">
                    <div className="ltc-field">
                      <label htmlFor="current-password" style={fontPoppins}>Current Password</label>
                      <input
                        id="current-password"
                        name="current-password"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="ltc-input"
                        style={fontPontano}
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="ltc-field">
                      <label htmlFor="new-password" style={fontPoppins}>New Password</label>
                      <input
                        id="new-password"
                        name="new-password"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        className="ltc-input"
                        style={fontPontano}
                        autoComplete="new-password"
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 8, padding: 14, borderRadius: 16, background: "#f7faf8", border: "1px solid #dce7df", fontSize: 13 }}>
                      {[
                        ["length", "At least 8 characters"],
                        ["upper", "At least one uppercase letter"],
                        ["lower", "At least one lowercase letter"],
                        ["number", "At least one number"],
                        ["special", "At least one special character"],
                        ["different", "Different from current password"],
                      ].map(([key, label]) => (
                        <span key={key} style={{ color: passwordChecks[key] ? "#1f6b38" : "#8a4d4d", fontWeight: 700 }}>
                          {passwordChecks[key] ? "✓" : "○"} {label}
                        </span>
                      ))}
                    </div>

                    <div className="ltc-field">
                      <label htmlFor="confirm-new-password" style={fontPoppins}>Confirm New Password</label>
                      <input
                        id="confirm-new-password"
                        name="confirm-new-password"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="ltc-input"
                        style={fontPontano}
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="ltc-field">
                      <label htmlFor="otp-code" style={fontPoppins}>OTP Code</label>
                      <input
                        id="otp-code"
                        name="otp-code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={passwordForm.otp}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                          }))
                        }
                        className="ltc-input"
                        style={fontPontano}
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>

                    <div className="ltc-actions">
                      <div className="ltc-actions-row">
                        <button
                          type="button"
                          onClick={sendOtp}
                          disabled={otpState.loading || otpSeconds > 0 || !strongPassword}
                          className="ltc-primary-button"
                          style={fontMontserrat}
                        >
                          {otpState.loading ? "Sending OTP..." : otpSeconds > 0 ? `Resend OTP in ${otpSeconds}s` : "Send OTP"}
                        </button>

                        <button
                          type="submit"
                          disabled={passwordState.loading || !strongPassword || passwordForm.otp.length !== 6}
                          className="ltc-secondary-button"
                          style={fontMontserrat}
                        >
                          {passwordState.loading ? "Updating..." : "Verify OTP & Update"}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate("/manpower-employee-profile")}
                        className="ltc-outline-button"
                        style={fontMontserrat}
                      >
                        Back to Profile
                      </button>
                    </div>
                  </form>

                  <p className="ltc-note" style={fontPontano}>
                    Keep your password private. After a successful change, you will be signed out and must sign in again using the new password.
                  </p>
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </main>
      <HomeReferenceFooter onNavigate={(path) => navigate(path)} />
    </div>
  );
}

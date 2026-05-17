// HotelGuestReviews.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelChatButton from "./HotelChatButton";

const COLORS = {
  green: "#3f5b44",
  soft: "#ECE9E1",
  border: "rgba(63, 91, 68, 0.28)",
};


const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-reviews-page {
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
  .ltc-reviews-page * { box-sizing: border-box; }
  .ltc-container { width: min(1180px, 92%); margin: auto; }
  .ltc-header { position: sticky; top: 0; z-index: 50; width: 100%; background: var(--footer-green); border-bottom: 1px solid rgba(255,255,255,.1); box-shadow: 0 10px 34px rgba(7,31,20,.14); margin: 0; }
  .ltc-header .ltc-container { width: 100%; max-width: none; margin: 0; padding-left: 32px; padding-right: 32px; }
  .ltc-nav { min-height: 76px; display: flex; justify-content: space-between; align-items: center; gap: 24px; }
  .ltc-logo { display: flex; align-items: center; gap: 13px; color: white; border: 0; background: transparent; cursor: pointer; text-align: left; padding: 0; }
  .ltc-logo-icon { width: 42px; height: 42px; border-radius: 999px; background: white; object-fit: cover; box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12); }
  .ltc-logo h1 { font-size: 18px; line-height: 1; font-weight: 900; text-transform: uppercase; letter-spacing: -.04em; margin: 0; }
  .ltc-logo p { font-size: 11px; color: rgba(255,255,255,.72); margin: 3px 0 0; }
  .ltc-desktop-nav { display: flex; align-items: center; gap: 8px; }
  .ltc-nav-link { color: rgba(255,255,255,.78); font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 10px 14px; border-radius: 999px; transition: .25s var(--ease); border: 0; background: transparent; cursor: pointer; }
  .ltc-nav-link:hover, .ltc-nav-link.active { color: white; background: rgba(255,255,255,.13); transform: translateY(-1px); }
  .ltc-profile-button { color: #102418; background: linear-gradient(135deg,#f4d484,#d7a84d); box-shadow: 0 14px 28px rgba(215,168,77,.18); }
  .ltc-menu-button { display: none; color: white; border: 0; background: rgba(255,255,255,.1); border-radius: 12px; padding: 10px; cursor: pointer; }
  .ltc-menu-button svg { width: 24px; height: 24px; }

  .ltc-hero { position: relative; overflow: hidden; color: white; isolation: isolate; background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%); padding: 82px 0 78px; }
  .ltc-hero-slide { position: absolute; inset: 0; z-index: -4; width: 100%; height: 100%; object-fit: cover; opacity: .35; }
  .ltc-hero::before { content: ""; position: absolute; inset: 0; z-index: -3; background: linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.88) 42%, rgba(12,64,39,.76) 100%); }
  .ltc-hero::after { content: ""; position: absolute; inset: -16% -10% -24% -10%; z-index: -2; background: radial-gradient(circle at 16% 82%, rgba(19,120,72,.36), transparent 24%), radial-gradient(circle at 36% 92%, rgba(7,76,47,.46), transparent 30%), radial-gradient(circle at 72% 18%, rgba(28,108,68,.28), transparent 30%), radial-gradient(circle at 88% 44%, rgba(244,212,132,.14), transparent 28%); filter: blur(30px); pointer-events: none; }
  .ltc-hero-content { position: relative; z-index: 2; max-width: 920px; margin: 0 auto; text-align: center; }
  .ltc-eyebrow { display: inline-flex; color: var(--gold-soft); background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.24); border-radius: 999px; padding: 12px 22px; font-size: 12px; font-weight: 900; letter-spacing: .22em; text-transform: uppercase; backdrop-filter: blur(8px); }
  .ltc-hero-title { margin: 18px 0 0; color: white; font-size: clamp(36px, 5vw, 62px); line-height: 1.05; font-weight: 900; letter-spacing: -.055em; text-shadow: 0 8px 26px rgba(0,0,0,.22); }
  .ltc-hero-title span { color: var(--gold-soft); }
  .ltc-hero-text { max-width: 760px; margin: 18px auto 0; color: rgba(255,255,255,.80); font-size: 17px; line-height: 1.8; }
  .ltc-section { padding: 54px 0 84px; }
  .ltc-form-shell { position: relative; overflow: hidden; border-radius: var(--radius); background: var(--glass); border: 1px solid rgba(255,255,255,.76); box-shadow: var(--shadow-md); backdrop-filter: blur(18px); padding: 34px; transition: .28s var(--ease); }
  .ltc-form-shell::before { content: ""; position: absolute; inset: 0 0 auto; height: 6px; background: linear-gradient(90deg,var(--green-700),var(--gold)); z-index: 3; }
  .ltc-form-shell:hover { box-shadow: var(--shadow-lg); border-color: rgba(215,168,77,.45); }
  .ltc-filter-header { margin-bottom: 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
  .ltc-section-heading { margin: 0; color: var(--green-950); font-size: clamp(24px,3vw,34px); line-height: 1.08; letter-spacing: -.05em; font-weight: 900; }
  .ltc-section-line { margin-top: 10px; width: 180px; height: 3px; border-radius: 999px; background: linear-gradient(90deg,var(--green-700),var(--gold)); }
  .ltc-muted-text { margin: 10px 0 0; color: var(--muted); font-size: 13px; line-height: 1.7; font-weight: 700; }
  .ltc-primary-button, .ltc-secondary-button { min-height: 52px; min-width: 190px; border-radius: 999px; padding: 0 28px; cursor: pointer; font-size: 13px; font-weight: 900; transition: all .28s var(--ease); }
  .ltc-primary-button { border: 0; color: #102418; background: linear-gradient(135deg, #f4d484, #d7a84d); box-shadow: 0 16px 35px rgba(215,168,77,.22); }
  .ltc-primary-button:hover { transform: translateY(-4px); background: linear-gradient(135deg, #f7dc93, #c99634); box-shadow: 0 22px 45px rgba(215,168,77,.32); }
  .ltc-secondary-button { border: 1px solid rgba(35,95,62,.18); color: var(--green-800); background: white; box-shadow: 0 12px 28px rgba(8,39,25,.06); }
  .ltc-secondary-button:hover { transform: translateY(-4px); color: white; background: var(--green-800); border-color: var(--green-800); box-shadow: 0 18px 38px rgba(8,39,25,.18); }
  .ltc-primary-button:disabled, .ltc-secondary-button:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }
  .ltc-status { margin-top: 24px; border-radius: 16px; border: 1px solid transparent; padding: 12px 14px; font-size: 13px; line-height: 1.55; font-weight: 800; }
  .ltc-status-success { color: #047857; background: rgba(16,185,129,.10); border-color: rgba(16,185,129,.25); }
  .ltc-status-error { color: #b42318; background: rgba(239,68,68,.10); border-color: rgba(239,68,68,.22); }
  .ltc-status-warning { color: #b54708; background: rgba(245,158,11,.12); border-color: rgba(245,158,11,.25); }
  .ltc-status-info { color: #475467; background: rgba(102,112,133,.09); border-color: rgba(102,112,133,.14); }
  .ltc-stats-grid { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 16px; margin-bottom: 18px; }
  .ltc-stats-grid-secondary { grid-template-columns: repeat(2,minmax(0,1fr)); margin-bottom: 28px; }
  .ltc-stat-card { border-radius: 24px; background: rgba(255,255,255,.92); border: 1px solid rgba(35,95,62,.12); box-shadow: 0 16px 34px rgba(8,39,25,.08); padding: 20px; transition: .28s var(--ease); }
  .ltc-stat-card:hover { transform: translateY(-4px); border-color: rgba(215,168,77,.45); box-shadow: 0 24px 50px rgba(8,39,25,.13); }
  .ltc-stat-label { margin: 0; color: rgba(16,24,40,.50); font-size: 11px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
  .ltc-stat-value { margin: 6px 0 0; color: var(--green-800); font-size: 32px; line-height: 1; font-weight: 900; }
  .ltc-filter-panel { margin-bottom: 30px; }
  .ltc-filter-block { margin-top: 22px; border-radius: 20px; background: rgba(35,95,62,.07); border: 1px solid rgba(35,95,62,.09); padding: 18px; }
  .ltc-filter-title { margin: 0 0 12px; color: rgba(16,24,40,.48); font-size: 11px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
  .ltc-filter-buttons { display: flex; flex-wrap: wrap; gap: 10px; }
  .ltc-filter-button { min-height: 40px; border-radius: 999px; padding: 0 18px; border: 1px solid rgba(35,95,62,.14); background: white; color: var(--green-800); cursor: pointer; font-size: 12px; font-weight: 900; transition: .25s var(--ease); }
  .ltc-filter-button:hover { transform: translateY(-2px); border-color: rgba(215,168,77,.55); box-shadow: 0 10px 22px rgba(8,39,25,.08); }
  .ltc-filter-button.active { color: #102418; background: linear-gradient(135deg,#f4d484,#d7a84d); border-color: transparent; box-shadow: 0 14px 28px rgba(215,168,77,.20); }
  .ltc-bookings-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 22px; }
  .ltc-booking-card { position: relative; overflow: hidden; border-radius: 24px; background: rgba(255,255,255,.92); border: 1px solid rgba(35,95,62,.12); box-shadow: 0 16px 34px rgba(8,39,25,.08); transition: .28s var(--ease); }
  .ltc-booking-card:hover { transform: translateY(-6px); border-color: rgba(215,168,77,.55); box-shadow: 0 26px 56px rgba(8,39,25,.16); }
  .ltc-card-top { position: relative; overflow: hidden; min-height: 156px; padding: 24px; color: white; background: linear-gradient(135deg, var(--green-950), var(--green-800)); }
  .ltc-card-top::after { content: ""; position: absolute; inset: -50% -30% auto auto; width: 220px; height: 220px; border-radius: 999px; background: rgba(244,212,132,.18); filter: blur(4px); }
  .ltc-card-top-inner { position: relative; z-index: 2; display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
  .ltc-card-eyebrow { margin: 0; color: var(--gold-soft); font-size: 11px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; }
  .ltc-card-title { margin: 8px 0 0; color: white; font-size: 24px; line-height: 1.08; font-weight: 900; letter-spacing: -.04em; }
  .ltc-card-id { margin: 10px 0 0; color: rgba(255,255,255,.70); font-size: 12px; font-weight: 700; }
  .ltc-status-badge { flex: 0 0 auto; border-radius: 999px; padding: 9px 12px; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.20); color: white; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; backdrop-filter: blur(6px); }
  .ltc-status-approved { background: rgba(16,185,129,.18); color: #d1fae5; }
  .ltc-status-cancelled { background: rgba(244,63,94,.18); color: #ffe4e6; }
  .ltc-status-pending { background: rgba(245,158,11,.18); color: #fef3c7; }
  .ltc-card-body { padding: 22px; }
  .ltc-info-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
  .ltc-info-box { border-radius: 18px; background: rgba(35,95,62,.07); border: 1px solid rgba(35,95,62,.08); padding: 13px 14px; }
  .ltc-info-label { margin: 0; color: rgba(16,24,40,.46); font-size: 11px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
  .ltc-info-value { margin: 3px 0 0; color: var(--green-800); font-size: 14px; font-weight: 900; line-height: 1.35; overflow-wrap: anywhere; }
  .ltc-note-box { margin-top: 18px; border-radius: 18px; background: rgba(35,95,62,.07); border: 1px solid rgba(35,95,62,.08); padding: 16px; color: rgba(16,24,40,.70); }
  .ltc-note-box h4 { margin: 0; color: var(--green-800); font-size: 14px; font-weight: 900; }
  .ltc-note-box p { margin: 4px 0 0; font-size: 13px; line-height: 1.65; font-weight: 700; }
  .ltc-review-box { margin-top: 18px; border-radius: 18px; background: rgba(215,168,77,.12); border: 1px solid rgba(215,168,77,.22); padding: 16px; }
  .ltc-review-top { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
  .ltc-review-title { margin: 0; color: var(--green-800); font-size: 14px; font-weight: 900; }
  .ltc-stars { margin: 0; color: #d7a84d; font-weight: 900; }
  .ltc-review-text { margin: 8px 0 0; color: rgba(16,24,40,.70); font-size: 13px; line-height: 1.65; font-weight: 700; }
  .ltc-admin-reply { margin-top: 14px; border-radius: 16px; background: white; padding: 14px; }
  .ltc-admin-reply p:first-child { margin: 0; color: rgba(16,24,40,.48); font-size: 10px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
  .ltc-admin-reply p:last-child { margin: 6px 0 0; color: rgba(16,24,40,.68); font-size: 13px; font-weight: 700; }
  .ltc-card-button { margin-top: 20px; width: 100%; min-width: 0; }
  .ltc-disabled-button { margin-top: 20px; width: 100%; min-height: 52px; border-radius: 999px; border: 0; background: rgba(16,24,40,.08); color: rgba(16,24,40,.38); font-size: 12px; font-weight: 900; cursor: not-allowed; }
  .ltc-empty-state { text-align: center; }
  .ltc-pagination { margin-top: 30px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .ltc-pagination-text { margin: 0; color: rgba(16,24,40,.58); font-size: 13px; font-weight: 800; }
  .ltc-page-buttons { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .ltc-page-button { min-height: 38px; min-width: 38px; border-radius: 999px; border: 1px solid rgba(35,95,62,.14); background: white; color: var(--green-800); cursor: pointer; font-size: 12px; font-weight: 900; padding: 0 13px; }
  .ltc-page-button.active { color: #102418; background: linear-gradient(135deg,#f4d484,#d7a84d); border-color: transparent; }
  .ltc-page-button:disabled { cursor: not-allowed; opacity: .45; }
  .ltc-timeline { border-radius: 18px; background: rgba(35,95,62,.06); border: 1px solid rgba(35,95,62,.08); padding: 16px; margin-bottom: 18px; }
  .ltc-timeline-steps { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
  .ltc-timeline-step { flex: 1; text-align: center; }
  .ltc-step-circle { margin: 0 auto; width: 36px; height: 36px; border-radius: 999px; display: grid; place-items: center; background: white; border: 1px solid rgba(35,95,62,.14); color: rgba(16,24,40,.38); font-size: 12px; font-weight: 900; }
  .ltc-timeline-step.active .ltc-step-circle { color: #102418; border-color: transparent; background: linear-gradient(135deg,#f4d484,#d7a84d); }
  .ltc-step-title { margin: 8px 0 0; color: rgba(16,24,40,.56); font-size: 11px; font-weight: 900; }
  .ltc-timeline-step.active .ltc-step-title { color: var(--green-800); }
  .ltc-step-desc { margin: 3px 0 0; color: rgba(16,24,40,.42); font-size: 10px; font-weight: 700; }
  .ltc-cancelled-note { margin: 14px 0 0; border-radius: 14px; background: rgba(244,63,94,.10); color: #b42318; padding: 10px; text-align: center; font-size: 12px; font-weight: 900; }
  .ltc-modal-overlay { position: fixed; inset: 0; z-index: 90; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.55); padding: 18px; }
  .ltc-modal { width: min(620px, 100%); border-radius: 28px; background: white; padding: 28px; box-shadow: 0 32px 80px rgba(0,0,0,.25); }
  .ltc-modal-top { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; }
  .ltc-modal-close { width: 40px; height: 40px; border-radius: 14px; border: 0; background: #f2f4f7; color: #101828; cursor: pointer; font-weight: 900; }
  .ltc-rating-row { display: flex; gap: 8px; margin-top: 8px; }
  .ltc-star-button { border: 0; background: transparent; color: rgba(16,24,40,.18); font-size: 38px; line-height: 1; cursor: pointer; transition: .2s var(--ease); }
  .ltc-star-button.active { color: #d7a84d; transform: translateY(-2px); }
  .ltc-field { margin-top: 22px; }
  .ltc-field label { display: block; margin: 0 0 8px; color: var(--green-950); font-size: 12px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
  .ltc-textarea { width: 100%; min-height: 145px; resize: vertical; border-radius: 22px; border: 1px solid rgba(35,95,62,.16); background: rgba(255,255,255,.88); color: var(--dark); outline: none; font-size: 14px; font-family: inherit; font-weight: 700; padding: 16px 18px; transition: .25s var(--ease); box-shadow: 0 10px 24px rgba(8,39,25,.05); }
  .ltc-textarea:focus { border-color: var(--green-700); background: white; box-shadow: 0 0 0 4px rgba(35,95,62,.10); }
  .ltc-char-count { margin: 6px 0 0; color: rgba(16,24,40,.42); font-size: 12px; font-weight: 700; }
  .ltc-modal-actions { margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap; }
  .ltc-footer { width: 100%; background: var(--footer-green); color: white; padding: 30px 0 12px; margin: 0; }
  .ltc-footer .ltc-container { width: 100%; max-width: none; margin: 0; padding-left: 32px; padding-right: 32px; }
  .ltc-footer-grid { width: 100%; display: grid; grid-template-columns: 1.2fr .8fr 1.2fr 1fr .8fr; gap: 22px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,.1); }
  .ltc-footer-brand { display: flex; align-items: center; gap: 12px; }
  .ltc-footer-brand img { width: 42px; height: 42px; border-radius: 999px; object-fit: cover; }
  .ltc-footer h4 { color: white; font-weight: 900; font-size: 20px; line-height: 1.2; margin: 0; text-transform: uppercase; }
  .ltc-footer h5 { color: #f4d484; font-size: 12px; line-height: 1.2; font-weight: 900; text-transform: uppercase; letter-spacing: .14em; margin: 0 0 10px; }
  .ltc-footer p, .ltc-footer-link { display: block; color: rgba(255,255,255,.68); font-size: 13px; line-height: 1.55; margin: 5px 0; }
  .ltc-footer-link { border: 0; background: transparent; padding: 0; cursor: pointer; text-align: left; }
  .ltc-footer-link:hover { color: white; text-decoration: underline; }
  .ltc-socials { display: flex; gap: 8px; }
  .ltc-socials span { width: 26px; height: 26px; border-radius: 999px; background: rgba(255,255,255,.13); }
  .ltc-copyright { width: 100%; padding-top: 14px; display: flex; justify-content: space-between; gap: 12px; color: rgba(255,255,255,.52); font-size: 12px; line-height: 1.4; }
  .ltc-sidebar-overlay { position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,.42); }
  .ltc-sidebar-panel { position: absolute; right: 0; top: 0; height: 100%; width: min(310px, 86vw); background: white; box-shadow: -20px 0 60px rgba(0,0,0,.25); padding: 20px; }
  .ltc-sidebar-top { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(16,24,40,.1); padding-bottom: 16px; margin-bottom: 16px; }
  .ltc-sidebar-title { color: var(--green-950); font-weight: 900; letter-spacing: .14em; font-size: 12px; margin: 0; }
  .ltc-sidebar-close { width: 38px; height: 38px; border-radius: 12px; border: 0; background: #f2f4f7; color: #101828; cursor: pointer; }
  .ltc-sidebar-link { display: block; width: 100%; border: 0; background: transparent; color: #101828; text-align: left; border-radius: 14px; padding: 13px 14px; font-weight: 800; margin-bottom: 8px; cursor: pointer; }
  .ltc-sidebar-link:hover, .ltc-sidebar-link.active { background: var(--green-800); color: white; }
  @media (max-width: 1100px) { .ltc-stats-grid { grid-template-columns: repeat(3,1fr); } .ltc-bookings-grid, .ltc-footer-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 900px) { .ltc-header .ltc-container { padding-left: 22px; padding-right: 22px; } .ltc-nav { min-height: auto; padding: 18px 0; } .ltc-desktop-nav { display: none; } .ltc-menu-button { display: grid; place-items: center; } .ltc-hero { padding: 76px 0 74px; } .ltc-section { padding: 44px 0 64px; } .ltc-form-shell { padding: 28px 22px; } .ltc-filter-header { align-items: flex-start; } .ltc-footer { padding: 28px 0 12px; } .ltc-footer-grid { gap: 18px; padding-bottom: 22px; } .ltc-footer .ltc-container { padding-left: 22px; padding-right: 22px; } .ltc-copyright { flex-direction: column; } }
  @media (max-width: 700px) { .ltc-stats-grid, .ltc-stats-grid-secondary, .ltc-bookings-grid, .ltc-info-grid, .ltc-footer-grid { grid-template-columns: 1fr; } .ltc-timeline-steps { gap: 4px; } .ltc-card-top-inner, .ltc-modal-top { flex-direction: column; } }
  @media (max-width: 600px) { .ltc-header .ltc-container, .ltc-footer .ltc-container { padding-left: 16px; padding-right: 16px; } .ltc-logo h1 { font-size: 14px; } .ltc-logo p { font-size: 10px; } .ltc-hero-title { font-size: clamp(34px, 11vw, 46px); letter-spacing: -.045em; } .ltc-hero-text { font-size: 15px; } .ltc-form-shell { padding: 26px 18px; } .ltc-primary-button, .ltc-secondary-button { width: 100%; min-width: 0; } .ltc-modal { padding: 22px 18px; } }
`;

const STATUS_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Submitted / Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "CANCELLED", label: "Cancelled / Rejected" },
  { id: "NOT_REVIEWED", label: "Not Reviewed" },
  { id: "REVIEWED", label: "Reviewed" },
];

const SERVICE_FILTERS = [
  { id: "ALL", label: "All Services" },
  { id: "hotel_room", label: "Hotel" },
  { id: "resort", label: "Resort" },
  { id: "event", label: "Event" },
];

const BOOKINGS_PER_PAGE = 6;

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
}

function normalizeApiBase() {
  const raw = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel`;
  if (raw.includes("/api/hotel")) return raw;

  return `${raw}/api/hotel`;
}

function normalizeStatus(value) {
  const status = String(value || "PENDING").toUpperCase();

  if (status === "CONFIRMED" || status === "APPROVED") return "CONFIRMED";

  if (
    status === "CANCELLED" ||
    status === "CANCELED" ||
    status === "REJECTED" ||
    status === "DECLINED"
  ) {
    return "CANCELLED";
  }

  return "PENDING";
}

function formatDate(value) {
  if (!value) return "—";

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split("-");
    return `${month}/${day}/${year}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "—";

  return parsed.toLocaleDateString("en-PH", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function formatPeso(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) return "—";

  return `₱${amount.toLocaleString("en-PH")}`;
}

function getStatusInfo(status) {
  if (status === "CONFIRMED") {
    return {
      label: "APPROVED",
      badge: "bg-emerald-100 text-emerald-700",
      box: "bg-emerald-50 text-emerald-700",
      heading: "Your booking has been approved.",
      description:
        "Admin has confirmed your booking. You can now submit a rating and review for this booking.",
    };
  }

  if (status === "CANCELLED") {
    return {
      label: "CANCELLED / REJECTED",
      badge: "bg-rose-100 text-rose-700",
      box: "bg-rose-50 text-rose-700",
      heading: "Your booking was cancelled or rejected.",
      description:
        "This booking is no longer active. If you need help, please contact hotel support or create another booking.",
    };
  }

  return {
    label: "SUBMITTED",
    badge: "bg-amber-100 text-amber-700",
    box: "bg-amber-50 text-amber-700",
    heading: "Your booking has been sent.",
    description:
      "Your booking is waiting for admin review. Once approved, it will become available for guest review.",
  };
}

function getServiceLabel(type) {
  if (type === "hotel_room") return "Hotel";
  if (type === "resort") return "Resort";
  if (type === "event") return "Event";
  return "service";
}

function getBookingServiceBadge(type) {
  if (type === "hotel_room") return "Hotel";
  if (type === "resort") return "Resort";
  if (type === "event") return "Event";
  return "Booking";
}

function getReviewMapKey(type, id) {
  return `${String(type || "").toLowerCase()}:${String(id || "")}`;
}

function getBookAgainRouteAndState(booking) {
  const raw = booking?.raw || {};

  if (booking.bookingType === "hotel_room") {
    const selectedPackageTitle =
      raw.packageTitle ||
      raw.selectedPackageTitle ||
      raw.selectedPackage ||
      booking.bookingTitle ||
      "";

    return {
      route: "/hotel-booking-form",
      state: {
        bookAgain: true,
        previousBookingId: booking._id,
        selectedPackageId:
          raw.packageId || raw.selectedPackageId || raw.package?._id || "",
        selectedPackage: selectedPackageTitle,
        selectedPackageTitle,
        selectedDuration: raw.duration || raw.selectedDuration || "",
        selectedRoomType:
          raw.roomType ||
          raw.selectedRoomType ||
          String(booking.bookingTitle || "").split(" - ")[0] ||
          "",
        selectedPrice: raw.price || raw.totalAmount || booking.amount || "",
        selectedCapacity: raw.capacity || raw.selectedCapacity || "",
      },
    };
  }

  if (booking.bookingType === "resort") {
    const selectedVenue =
      raw.venue ||
      raw.selectedVenue ||
      raw.selectedPackage ||
      raw.selectedPackageTitle ||
      booking.bookingTitle ||
      "";

    return {
      route: "/resort-form",
      state: {
        bookAgain: true,
        previousBookingId: booking._id,
        selectedPackageId:
          raw.packageId || raw.selectedPackageId || raw.package?._id || "",
        selectedPackage: selectedVenue,
        selectedVenue,
        selectedDuration:
          raw.category || raw.duration || raw.selectedDuration || "",
        selectedPrice: raw.price || raw.totalAmount || booking.amount || "",
        selectedCapacity: raw.capacity || raw.selectedCapacity || "",
      },
    };
  }

  if (booking.bookingType === "event") {
    const selectedPackageTitle =
      raw.eventPackage ||
      raw.selectedPackageTitle ||
      raw.selectedPackage ||
      raw.packageName ||
      booking.bookingTitle ||
      "";

    return {
      route: "/event-form",
      state: {
        bookAgain: true,
        previousBookingId: booking._id,
        selectedPackageId:
          raw.packageId || raw.selectedPackageId || raw.package?._id || "",
        selectedPackage: selectedPackageTitle,
        selectedPackageTitle,
        selectedPrice: raw.totalAmount || raw.price || booking.amount || "",
        selectedCapacity: raw.capacity || raw.selectedCapacity || "",
      },
    };
  }

  return {
    route: "/hotel-resort",
    state: {},
  };
}

export default function HotelGuestReviews() {
  const navigate = useNavigate();
  const API_BASE = useMemo(() => normalizeApiBase(), []);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [status, setStatus] = useState({ type: "", message: "" });
  const [isOpen, setIsOpen] = useState(false);

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  const kickToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hotelToken");
    navigate("/hotel-login", { replace: true });
  };

  const goToProfile = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");
    navigate(token ? "/hotel-profile" : "/hotel-login");
  };

  const fetchJson = async (url) => {
    const response = await fetch(url, {
      method: "GET",
      headers: authHeaders(),
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      kickToLogin();
      return {
        kicked: true,
        ok: false,
        data: null,
      };
    }

    return {
      kicked: false,
      ok: response.ok,
      data,
      status: response.status,
    };
  };

  const normalizeResortBooking = (booking) => ({
    _id: String(booking?._id || ""),
    bookingType: "resort",
    serviceType: booking?.serviceType || "Resort & Venue",
    bookingTitle: booking?.venue || booking?.packageName || "Resort & Venue Booking",
    bookingDate: booking?.date || booking?.bookingDate || "",
    bookingTime: booking?.time || booking?.bookingTime || "",
    status: normalizeStatus(booking?.status),
    paymentMethod: booking?.paymentMethod || "",
    amount: Number(booking?.price || booking?.totalAmount || 0),
    pax:
      Number(
        booking?.pax ||
          booking?.totalGuests ||
          Number(booking?.adults || 0) + Number(booking?.kids || 0)
      ) || 0,
    createdAt: booking?.createdAt || "",
    updatedAt: booking?.updatedAt || "",
    raw: booking,
  });

  const normalizeEventBooking = (booking) => ({
    _id: String(booking?._id || ""),
    bookingType: "event",
    serviceType: booking?.serviceType || "Event Package",
    bookingTitle:
      booking?.eventPackage ||
      booking?.packageName ||
      booking?.eventType ||
      "Event Package Booking",
    bookingDate: booking?.eventDate || booking?.date || booking?.bookingDate || "",
    bookingTime: booking?.time || booking?.bookingTime || "",
    status: normalizeStatus(booking?.status),
    paymentMethod: booking?.paymentMethod || "",
    amount: Number(booking?.totalAmount || booking?.price || 0),
    pax: Number(booking?.pax || booking?.guests || 0),
    createdAt: booking?.createdAt || "",
    updatedAt: booking?.updatedAt || "",
    raw: booking,
  });

  const normalizeHotelRoomBooking = (booking) => ({
    _id: String(booking?._id || ""),
    bookingType: "hotel_room",
    serviceType: booking?.serviceType || "Hotel",
    bookingTitle: `${booking?.roomType || "Hotel Room"}${
      booking?.duration ? ` - ${booking.duration}` : ""
    }`,
    bookingDate: booking?.date || booking?.bookingDate || booking?.checkInDate || "",
    bookingTime: booking?.time || booking?.bookingTime || "",
    status: normalizeStatus(booking?.status),
    paymentMethod: booking?.paymentMethod || "",
    amount: Number(booking?.price || booking?.totalAmount || 0),
    pax: Number(booking?.pax || booking?.guests || 0),
    createdAt: booking?.createdAt || "",
    updatedAt: booking?.updatedAt || "",
    raw: booking,
  });

  const buildReviewMap = (approvedRows) => {
    const map = new Map();

    approvedRows.forEach((item) => {
      const id = String(item?._id || item?.bookingId || "");
      const type = String(item?.bookingType || "").toLowerCase();

      if (!id) return;

      const reviewInfo = {
        reviewed: Boolean(item?.reviewed),
        review: item?.review || null,
      };

      map.set(getReviewMapKey(type, id), reviewInfo);

      if (type === "hotel") {
        map.set(getReviewMapKey("hotel_room", id), reviewInfo);
      }

      if (type === "hotel_room") {
        map.set(getReviewMapKey("hotel", id), reviewInfo);
      }
    });

    return map;
  };

  const fetchBookingsAndReviews = async () => {
    if (!getToken()) {
      navigate("/hotel-login", { replace: true });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const [resortResult, eventResult, hotelResult, approvedResult] =
        await Promise.all([
          fetchJson(`${API_BASE}/my-resort-bookings`),
          fetchJson(`${API_BASE}/my-event-bookings`),
          fetchJson(`${API_BASE}/my-hotel-room-bookings`),
          fetchJson(`${API_BASE}/approved-booking-history`),
        ]);

      if (
        resortResult.kicked ||
        eventResult.kicked ||
        hotelResult.kicked ||
        approvedResult.kicked
      ) {
        return;
      }

      const resortRows =
        resortResult.ok && Array.isArray(resortResult.data) ? resortResult.data : [];

      const eventRows =
        eventResult.ok && Array.isArray(eventResult.data) ? eventResult.data : [];

      const hotelRows =
        hotelResult.ok && Array.isArray(hotelResult.data) ? hotelResult.data : [];

      const approvedRows =
        approvedResult.ok && Array.isArray(approvedResult.data?.history)
          ? approvedResult.data.history
          : [];

      const reviewMap = buildReviewMap(approvedRows);

      const merged = [
        ...resortRows.map(normalizeResortBooking),
        ...eventRows.map(normalizeEventBooking),
        ...hotelRows.map(normalizeHotelRoomBooking),
      ]
        .filter((booking) => booking._id)
        .map((booking) => {
          const reviewInfo = reviewMap.get(
            getReviewMapKey(booking.bookingType, booking._id)
          );

          return {
            ...booking,
            reviewed: Boolean(reviewInfo?.reviewed),
            review: reviewInfo?.review || null,
          };
        })
        .sort((a, b) => {
          const bTime = new Date(b.createdAt || b.bookingDate || 0).getTime();
          const aTime = new Date(a.createdAt || a.bookingDate || 0).getTime();
          return bTime - aTime;
        });

      setBookings(merged);

      if (
        !resortResult.ok ||
        !eventResult.ok ||
        !hotelResult.ok ||
        !approvedResult.ok
      ) {
        setStatus({
          type: "warning",
          message:
            "Some booking records could not be loaded. Please refresh if something is missing.",
        });
      }
    } catch (error) {
      console.error("fetchBookingsAndReviews error:", error);
      setBookings([]);
      setStatus({
        type: "error",
        message: "Network error while loading your bookings.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const totalBookings = bookings.length;
    const totalPending = bookings.filter((item) => item.status === "PENDING").length;
    const totalApproved = bookings.filter((item) => item.status === "CONFIRMED").length;
    const totalCancelled = bookings.filter((item) => item.status === "CANCELLED").length;
    const totalReviewed = bookings.filter((item) => item.reviewed).length;

    return {
      totalBookings,
      totalPending,
      totalApproved,
      totalCancelled,
      totalReviewed,
    };
  }, [bookings]);

  const filteredByStatus = useMemo(() => {
    if (statusFilter === "PENDING") {
      return bookings.filter((item) => item.status === "PENDING");
    }

    if (statusFilter === "APPROVED") {
      return bookings.filter((item) => item.status === "CONFIRMED");
    }

    if (statusFilter === "CANCELLED") {
      return bookings.filter((item) => item.status === "CANCELLED");
    }

    if (statusFilter === "NOT_REVIEWED") {
      return bookings.filter((item) => item.status === "CONFIRMED" && !item.reviewed);
    }

    if (statusFilter === "REVIEWED") {
      return bookings.filter((item) => item.reviewed);
    }

    return bookings;
  }, [bookings, statusFilter]);

  const serviceCounts = useMemo(() => {
    return {
      ALL: filteredByStatus.length,
      hotel_room: filteredByStatus.filter((item) => item.bookingType === "hotel_room")
        .length,
      resort: filteredByStatus.filter((item) => item.bookingType === "resort").length,
      event: filteredByStatus.filter((item) => item.bookingType === "event").length,
    };
  }, [filteredByStatus]);

  const filteredBookings = useMemo(() => {
    if (serviceFilter === "ALL") return filteredByStatus;

    return filteredByStatus.filter((item) => item.bookingType === serviceFilter);
  }, [filteredByStatus, serviceFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, serviceFilter, bookings.length]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE));
  }, [filteredBookings.length]);

  const safePage = Math.min(page, totalPages);

  const paginatedBookings = useMemo(() => {
    const start = (safePage - 1) * BOOKINGS_PER_PAGE;
    return filteredBookings.slice(start, start + BOOKINGS_PER_PAGE);
  }, [filteredBookings, safePage]);

  const averageRating = useMemo(() => {
    const reviewed = bookings.filter((item) => item.reviewed && item.review?.rating);

    if (!reviewed.length) return "";

    const total = reviewed.reduce(
      (sum, item) => sum + Number(item.review?.rating || 0),
      0
    );

    return (total / reviewed.length).toFixed(1);
  }, [bookings]);

  const activeStatusLabel =
    STATUS_FILTERS.find((item) => item.id === statusFilter)?.label || "All";

  const statusBoxClass =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : status.type === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  const openReviewModal = (booking) => {
    if (!booking || booking.reviewed) return;

    if (booking.status !== "CONFIRMED") {
      setStatus({
        type: "error",
        message: "Only approved bookings can receive a review.",
      });
      return;
    }

    setSelectedBooking(booking);
    setRating(5);
    setReviewText("");
    setStatus({ type: "", message: "" });
  };

  const closeReviewModal = () => {
    if (submitting) return;

    setSelectedBooking(null);
    setRating(5);
    setReviewText("");
  };

  const handleBookAgain = (booking) => {
    if (!booking) return;

    const config = getBookAgainRouteAndState(booking);

    sessionStorage.setItem(
      "hotelBookAgainSource",
      JSON.stringify({
        bookingType: booking.bookingType,
        bookingId: booking._id,
        bookingTitle: booking.bookingTitle,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        createdAt: new Date().toISOString(),
      })
    );

    navigate(config.route, {
      state: config.state,
    });
  };

  const submitReview = async () => {
    if (!selectedBooking) return;

    if (!getToken()) {
      navigate("/hotel-login", { replace: true });
      return;
    }

    if (selectedBooking.status !== "CONFIRMED") {
      setStatus({
        type: "error",
        message: "Only approved bookings can receive a review.",
      });
      return;
    }

    if (!Number.isFinite(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      setStatus({
        type: "error",
        message: "Please choose a rating from 1 to 5.",
      });
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 5) {
      setStatus({
        type: "error",
        message: "Please write a review with at least 5 characters.",
      });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(`${API_BASE}/guest-reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          bookingType: selectedBooking.bookingType,
          bookingId: selectedBooking._id,
          rating: Number(rating),
          reviewText: reviewText.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        kickToLogin();
        return;
      }

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to submit review.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: "Review submitted successfully.",
      });

      closeReviewModal();
      await fetchBookingsAndReviews();
    } catch (error) {
      console.error("submitReview error:", error);
      setStatus({
        type: "error",
        message: "Network error while submitting review.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const statusClass =
    status.type === "success"
      ? "ltc-status-success"
      : status.type === "error"
      ? "ltc-status-error"
      : status.type === "warning"
      ? "ltc-status-warning"
      : "ltc-status-info";

  return (
    <div className="ltc-reviews-page" style={fontPontano}>
      <style>{pageStyles}</style>

      <Header
        navigate={navigate}
        goToProfile={goToProfile}
        openMenu={() => setIsOpen(true)}
      />

      <main>
        <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-filter-header">
              <div>
                <h2 className="ltc-section-heading" style={fontMontserrat}>
                  Booking Review Dashboard
                </h2>
                <div className="ltc-section-line" />
                <p className="ltc-muted-text" style={fontPoppins}>
                  Choose a booking status, filter by service, review approved bookings, and book completed services again.
                </p>
              </div>

              <div className="ltc-filter-buttons">
                <button
                  type="button"
                  onClick={fetchBookingsAndReviews}
                  disabled={loading}
                  className="ltc-secondary-button"
                  style={fontMontserrat}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/hotel-profile")}
                  className="ltc-primary-button"
                  style={fontMontserrat}
                >
                  Back to Profile
                </button>
              </div>
            </div>

            {status.message ? (
              <div className={`ltc-status ${statusClass}`} style={fontPoppins}>
                {status.message}
              </div>
            ) : null}

            <div className="ltc-stats-grid">
              <StatCard label="Total Bookings" value={totals.totalBookings} />
              <StatCard label="Submitted / Pending" value={totals.totalPending} />
              <StatCard label="Approved" value={totals.totalApproved} />
              <StatCard label="Cancelled / Rejected" value={totals.totalCancelled} />
              <StatCard label="Reviews" value={totals.totalReviewed} />
            </div>

            <div className="ltc-stats-grid ltc-stats-grid-secondary">
              <StatCard
                label="Waiting for Review"
                value={Math.max(0, totals.totalApproved - totals.totalReviewed)}
              />
              <StatCard label="Average Rating" value={averageRating ? `${averageRating} ★` : "—"} />
            </div>

            <div className="ltc-form-shell ltc-filter-panel">
              <div>
                <p className="ltc-filter-title" style={fontMontserrat}>
                  Step 1: Choose booking process status
                </p>

                <div className="ltc-filter-buttons">
                  {STATUS_FILTERS.map((item) => (
                    <FilterButton
                      key={item.id}
                      label={item.label}
                      active={statusFilter === item.id}
                      onClick={() => {
                        setStatusFilter(item.id);
                        setServiceFilter("ALL");
                        setPage(1);
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="ltc-filter-block">
                <p className="ltc-filter-title" style={fontMontserrat}>
                  Step 2: Filter inside "{activeStatusLabel}"
                </p>

                <div className="ltc-filter-buttons">
                  {SERVICE_FILTERS.map((item) => (
                    <ServiceFilterButton
                      key={item.id}
                      label={`${item.label} (${serviceCounts[item.id] || 0})`}
                      active={serviceFilter === item.id}
                      onClick={() => {
                        setServiceFilter(item.id);
                        setPage(1);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="ltc-form-shell ltc-empty-state">
                <h2 className="ltc-section-heading" style={fontMontserrat}>
                  Loading your bookings...
                </h2>
                <div className="ltc-section-line" style={{ marginLeft: "auto", marginRight: "auto" }} />
                <p className="ltc-muted-text" style={fontPoppins}>
                  Please wait while your booking process records are being refreshed.
                </p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="ltc-form-shell ltc-empty-state">
                <h2 className="ltc-section-heading" style={fontMontserrat}>
                  No Bookings Found
                </h2>
                <div className="ltc-section-line" style={{ marginLeft: "auto", marginRight: "auto" }} />
                <p className="ltc-muted-text" style={fontPoppins}>
                  No {serviceFilter === "ALL" ? "service" : getServiceLabel(serviceFilter)} bookings found under "{activeStatusLabel}".
                </p>
              </div>
            ) : (
              <div className="ltc-bookings-grid">
                {paginatedBookings.map((booking) => (
                  <BookingProcessCard
                    key={`${booking.bookingType}-${booking._id}`}
                    booking={booking}
                    onReview={() => openReviewModal(booking)}
                    onBookAgain={() => handleBookAgain(booking)}
                  />
                ))}
              </div>
            )}

            {!loading && filteredBookings.length > 0 ? (
              <PaginationBar
                page={safePage}
                totalPages={totalPages}
                totalItems={filteredBookings.length}
                onPageChange={setPage}
              />
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
      <HotelChatButton />

      {isOpen ? (
        <MobileMenu
          onClose={() => setIsOpen(false)}
          navigate={navigate}
          goToProfile={goToProfile}
        />
      ) : null}

      {selectedBooking ? (
        <ReviewModal
          selectedBooking={selectedBooking}
          rating={rating}
          setRating={setRating}
          reviewText={reviewText}
          setReviewText={setReviewText}
          submitting={submitting}
          closeReviewModal={closeReviewModal}
          submitReview={submitReview}
        />
      ) : null}
    </div>
  );

}


function PaginationBar({ page, totalPages, totalItems, onPageChange }) {
  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="ltc-form-shell ltc-pagination">
      <p className="ltc-pagination-text" style={fontPoppins}>
        Page {page} of {totalPages} • {totalItems} result{totalItems === 1 ? "" : "s"}
      </p>

      <div className="ltc-page-buttons">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="ltc-page-button"
          style={fontMontserrat}
        >
          Previous
        </button>

        {pages.map((item, index) =>
          item === "..." ? (
            <span key={`dots-${index}`} className="ltc-pagination-text">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`ltc-page-button ${item === page ? "active" : ""}`}
              style={fontMontserrat}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="ltc-page-button"
          style={fontMontserrat}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function buildPageNumbers(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  const result = [];
  sorted.forEach((item, index) => {
    if (index > 0 && item - sorted[index - 1] > 1) {
      result.push("...");
    }
    result.push(item);
  });

  return result;
}

function BookingProcessCard({ booking, onReview, onBookAgain }) {
  const serviceBadge = getBookingServiceBadge(booking.bookingType);
  const statusInfo = getStatusInfo(booking.status);
  const canReview = booking.status === "CONFIRMED" && !booking.reviewed;

  return (
    <article className="ltc-booking-card">
      <div className="ltc-card-top">
        <div className="ltc-card-top-inner">
          <div>
            <p className="ltc-card-eyebrow" style={fontMontserrat}>
              {serviceBadge}
            </p>

            <h3 className="ltc-card-title" style={fontMontserrat}>
              {booking.bookingTitle}
            </h3>

            <p className="ltc-card-id" style={fontPoppins}>
              Booking ID: {booking._id}
            </p>
          </div>

          <span className={`ltc-status-badge ${getStatusBadgeClass(booking.status)}`} style={fontMontserrat}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="ltc-card-body">
        <BookingTimeline status={booking.status} />

        <div className="ltc-info-grid">
          <Info label="Service" value={booking.serviceType} />
          <Info label="Date" value={formatDate(booking.bookingDate)} />
          <Info label="Time" value={booking.bookingTime || "—"} />
          <Info label="Pax" value={booking.pax || "—"} />
          <Info label="Payment" value={booking.paymentMethod || "—"} />
          <Info label="Amount" value={formatPeso(booking.amount)} />
        </div>

        <div className="ltc-note-box">
          <h4 style={fontMontserrat}>{statusInfo.heading}</h4>
          <p style={fontPoppins}>{statusInfo.description}</p>
        </div>

        {booking.reviewed ? (
          <>
            <div className="ltc-review-box">
              <div className="ltc-review-top">
                <p className="ltc-review-title" style={fontMontserrat}>
                  Your Review
                </p>

                <p className="ltc-stars" style={fontMontserrat}>
                  {"★".repeat(Number(booking.review?.rating || 0))}
                </p>
              </div>

              <p className="ltc-review-text" style={fontPoppins}>
                {booking.review?.reviewText || "No review text."}
              </p>

              {booking.review?.adminReply ? (
                <div className="ltc-admin-reply">
                  <p style={fontMontserrat}>Admin Reply</p>
                  <p style={fontPoppins}>{booking.review.adminReply}</p>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onBookAgain}
              className="ltc-primary-button ltc-card-button"
              style={fontMontserrat}
            >
              BOOK IT AGAIN
            </button>
          </>
        ) : canReview ? (
          <button
            type="button"
            onClick={onReview}
            className="ltc-primary-button ltc-card-button"
            style={fontMontserrat}
          >
            WRITE REVIEW
          </button>
        ) : (
          <button type="button" disabled className="ltc-disabled-button" style={fontMontserrat}>
            {booking.status === "PENDING"
              ? "WAITING FOR ADMIN APPROVAL"
              : booking.status === "CANCELLED"
              ? "BOOKING CANCELLED / REJECTED"
              : "REVIEW NOT AVAILABLE"}
          </button>
        )}
      </div>
    </article>
  );
}

function getStatusBadgeClass(status) {
  if (status === "CONFIRMED") return "ltc-status-approved";
  if (status === "CANCELLED") return "ltc-status-cancelled";
  return "ltc-status-pending";
}

function BookingTimeline({ status }) {
  const steps = [
    { key: "SUBMITTED", title: "Submitted", description: "Booking sent" },
    { key: "PENDING", title: "Admin Review", description: "Waiting approval" },
    { key: "CONFIRMED", title: "Approved", description: "Confirmed booking" },
  ];

  const isCancelled = status === "CANCELLED";
  const activeIndex = status === "CONFIRMED" ? 2 : status === "PENDING" ? 1 : isCancelled ? 1 : 0;

  return (
    <div className="ltc-timeline">
      <div className="ltc-timeline-steps">
        {steps.map((step, index) => {
          const active = index <= activeIndex && !isCancelled;

          return (
            <div key={step.key} className={`ltc-timeline-step ${active ? "active" : ""}`}>
              <div className="ltc-step-circle" style={fontMontserrat}>
                {active ? "✓" : index + 1}
              </div>

              <p className="ltc-step-title" style={fontMontserrat}>
                {step.title}
              </p>

              <p className="ltc-step-desc" style={fontPoppins}>
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {isCancelled ? (
        <div className="ltc-cancelled-note" style={fontPoppins}>
          This booking was cancelled or rejected by admin.
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="ltc-stat-card">
      <p className="ltc-stat-label" style={fontMontserrat}>{label}</p>
      <p className="ltc-stat-value" style={fontMontserrat}>{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="ltc-info-box">
      <p className="ltc-info-label" style={fontMontserrat}>{label}</p>
      <p className="ltc-info-value" style={fontPoppins}>{value || "—"}</p>
    </div>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ltc-filter-button ${active ? "active" : ""}`}
      style={fontMontserrat}
    >
      {label}
    </button>
  );
}

function ServiceFilterButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ltc-filter-button ${active ? "active" : ""}`}
      style={fontMontserrat}
    >
      {label}
    </button>
  );
}

function ReviewModal({
  selectedBooking,
  rating,
  setRating,
  reviewText,
  setReviewText,
  submitting,
  closeReviewModal,
  submitReview,
}) {
  return (
    <div className="ltc-modal-overlay">
      <div className="ltc-modal">
        <div className="ltc-modal-top">
          <div>
            <p className="ltc-filter-title" style={fontMontserrat}>
              Submit Review
            </p>

            <h2 className="ltc-section-heading" style={fontMontserrat}>
              {selectedBooking.bookingTitle}
            </h2>

            <p className="ltc-muted-text" style={fontPoppins}>
              {selectedBooking.serviceType} • {formatDate(selectedBooking.bookingDate)}
            </p>
          </div>

          <button
            type="button"
            onClick={closeReviewModal}
            disabled={submitting}
            className="ltc-modal-close"
            aria-label="Close review modal"
          >
            ✕
          </button>
        </div>

        <div className="ltc-field">
          <label style={fontMontserrat}>Rating</label>
          <div className="ltc-rating-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`ltc-star-button ${star <= rating ? "active" : ""}`}
                aria-label={`${star} star rating`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="ltc-field">
          <label style={fontMontserrat}>Review</label>
          <textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value.slice(0, 1000))}
            rows={5}
            placeholder="Write your experience here..."
            className="ltc-textarea"
            style={fontPoppins}
          />

          <p className="ltc-char-count" style={fontPoppins}>
            {reviewText.length}/1000 characters
          </p>
        </div>

        <div className="ltc-modal-actions">
          <button
            type="button"
            onClick={closeReviewModal}
            disabled={submitting}
            className="ltc-secondary-button"
            style={fontMontserrat}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submitReview}
            disabled={submitting}
            className="ltc-primary-button"
            style={fontMontserrat}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Header({ navigate, goToProfile, openMenu }) {
  return (
    <header className="ltc-header">
      <div className="ltc-container ltc-nav">
        <button
          onClick={() => navigate("/home")}
          type="button"
          className="ltc-logo"
          aria-label="Go to home"
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
          <NavButton label="Home" onClick={() => navigate("/hotel-resort")} />
          <NavButton label="Virtual Tour" onClick={() => navigate("/virtual-tour")} />
          <NavButton label="Contact" onClick={() => navigate("/hotel-contact-us")} />
          <NavButton label="FAQs" onClick={() => navigate("/hotel-faqs")} />
          <NavButton
            label={
              localStorage.getItem("token") || localStorage.getItem("hotelToken")
                ? "Profile"
                : "Sign In"
            }
            onClick={goToProfile}
            className="ltc-profile-button"
          />
        </nav>

        <button
          onClick={openMenu}
          type="button"
          aria-label="Open menu"
          className="ltc-menu-button"
        >
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

function Footer() {
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
          <FooterLink onClick={() => (window.location.href = "/hotel-resort")}>Home</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/virtual-tour")}>Virtual Tour</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-contact-us")}>Contact</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-faqs")}>FAQs</FooterLink>
          <FooterLink
            onClick={() => {
              window.location.href =
                localStorage.getItem("token") || localStorage.getItem("hotelToken")
                  ? "/hotel-profile"
                  : "/hotel-login";
            }}
          >
            {localStorage.getItem("token") || localStorage.getItem("hotelToken")
              ? "Profile"
              : "Sign In"}
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>ltc.amsi@gmail.com</FooterText>
          <FooterText>lorengladius@ltcmultiservices.com</FooterText>
          <FooterText>09959808051 / 09516281271</FooterText>
        </FooterColumn>

        <FooterColumn title="Address">
          <FooterText>2/F 5441 Currie Street,</FooterText>
          <FooterText>Palanan, Makati City</FooterText>
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
    <button onClick={onClick} type="button" className="ltc-footer-link" style={fontPontano}>
      {children}
    </button>
  );
}

function FooterText({ children }) {
  return <p style={fontPontano}>{children}</p>;
}

function MobileMenu({ onClose, navigate, goToProfile }) {
  return (
    <div className="ltc-sidebar-overlay">
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <div className="ltc-sidebar-panel">
        <div className="ltc-sidebar-top">
          <p className="ltc-sidebar-title" style={fontPoppins}>
            MENU
          </p>

          <button
            onClick={onClose}
            className="ltc-sidebar-close"
            aria-label="Close menu"
            type="button"
          >
            ✕
          </button>
        </div>

        <MobileLink label="Home" onClick={() => navigate("/hotel-resort")} />
        <MobileLink label="Virtual Tour" onClick={() => navigate("/virtual-tour")} />
        <MobileLink label="Contact" onClick={() => navigate("/hotel-contact-us")} />
        <MobileLink label="FAQs" onClick={() => navigate("/hotel-faqs")} />
        <MobileLink
          label={
            localStorage.getItem("token") || localStorage.getItem("hotelToken")
              ? "Profile"
              : "Sign In"
          }
          onClick={goToProfile}
          active
        />
      </div>
    </div>
  );
}

function MobileLink({ label, onClick, active = false }) {
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

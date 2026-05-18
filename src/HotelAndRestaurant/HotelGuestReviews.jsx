// HotelGuestReviews.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


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
  .ltc-card-actions { margin-top: 20px; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
  .ltc-card-actions .ltc-card-button { margin-top: 0; }
  .ltc-card-actions-full { margin-top: 10px; }
  .ltc-card-actions-full .ltc-card-button { margin-top: 0; }
  .ltc-disabled-button { margin-top: 20px; width: 100%; min-height: 52px; border-radius: 999px; border: 0; background: rgba(16,24,40,.08); color: rgba(16,24,40,.38); font-size: 12px; font-weight: 900; cursor: not-allowed; }

  .ltc-details-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 95;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 32px 18px;
    background: rgba(0,0,0,.55);
    overflow-y: auto;
    overscroll-behavior: contain;
    backdrop-filter: blur(6px);
  }

  .ltc-details-receipt-modal {
    width: min(840px, 96vw);
    max-height: calc(100vh - 64px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 24px;
    background: #ffffff;
    border: 1px solid rgba(255,255,255,.72);
    box-shadow: 0 34px 90px rgba(0,0,0,.28);
  }

  .ltc-details-receipt-modal-header {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 22px;
    background: var(--footer-green);
    color: white;
  }

  .ltc-details-receipt-modal-header h3 {
    margin: 0;
    font-size: 18px;
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: -.02em;
  }

  .ltc-details-receipt-close {
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: 999px;
    background: rgba(255,255,255,.12);
    color: white;
    cursor: pointer;
    font-size: 18px;
    font-weight: 900;
    transition: .25s var(--ease);
  }

  .ltc-details-receipt-close:hover {
    background: rgba(255,255,255,.22);
    transform: scale(1.04);
  }

  .ltc-details-receipt-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .ltc-details-receipt-paper {
    margin: 24px;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(35,95,62,.12);
    background: white;
  }

  .ltc-details-receipt-top {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    padding: 26px;
    color: white;
    background: var(--green-800);
  }

  .ltc-details-receipt-brand h4,
  .ltc-details-receipt-meta h4 {
    margin: 0;
    font-size: 22px;
    line-height: 1.1;
    font-weight: 900;
    text-transform: uppercase;
  }

  .ltc-details-receipt-brand p,
  .ltc-details-receipt-meta p {
    margin: 6px 0 0;
    color: rgba(255,255,255,.78);
    font-size: 12px;
    font-weight: 700;
  }

  .ltc-details-receipt-meta {
    text-align: right;
  }

  .ltc-details-receipt-status {
    margin: 22px 26px 0;
    border-radius: 14px;
    padding: 12px 14px;
    background: rgba(244,212,132,.32);
    color: var(--green-950);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .06em;
    text-transform: uppercase;
  }

  .ltc-details-receipt-thanks {
    margin: 18px 26px 0;
  }

  .ltc-details-receipt-thanks h4 {
    margin: 0;
    color: var(--green-800);
    font-size: 22px;
    font-weight: 900;
  }

  .ltc-details-receipt-thanks p {
    margin: 4px 0 0;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
  }

  .ltc-details-receipt-body {
    padding: 24px 26px 28px;
  }

  .ltc-details-receipt-body h5 {
    margin: 0 0 12px;
    color: var(--green-950);
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-details-receipt-two-col {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: 24px;
  }

  .ltc-details-receipt-box {
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.12);
    background: rgba(35,95,62,.04);
    padding: 16px;
  }

  .ltc-details-receipt-name {
    margin: 0;
    color: var(--green-950);
    font-size: 15px;
    font-weight: 900;
  }

  .ltc-details-receipt-muted {
    margin: 5px 0 0;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
  }

  .ltc-details-receipt-table {
    width: 100%;
    border-collapse: collapse;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.12);
    margin-bottom: 24px;
  }

  .ltc-details-receipt-table th,
  .ltc-details-receipt-table td {
    padding: 12px 14px;
    border-bottom: 1px solid rgba(35,95,62,.10);
    text-align: left;
    vertical-align: top;
    font-size: 13px;
  }

  .ltc-details-receipt-table th {
    width: 34%;
    color: var(--muted);
    font-weight: 900;
    letter-spacing: .05em;
    text-transform: uppercase;
    background: rgba(35,95,62,.04);
  }

  .ltc-details-receipt-table td {
    color: var(--green-950);
    font-weight: 800;
  }

  .ltc-details-receipt-table tr:last-child th,
  .ltc-details-receipt-table tr:last-child td {
    border-bottom: 0;
  }

  .ltc-details-receipt-summary {
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.12);
    overflow: hidden;
  }

  .ltc-details-receipt-summary-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 13px 16px;
    border-bottom: 1px solid rgba(35,95,62,.10);
    color: var(--green-950);
    font-size: 13px;
    font-weight: 800;
  }

  .ltc-details-receipt-summary-row:last-child {
    border-bottom: 0;
  }

  .ltc-details-receipt-summary-row.balance {
    background: var(--green-800);
    color: white;
    font-size: 15px;
    font-weight: 900;
  }

  .ltc-details-receipt-balance-due {
    margin-top: 16px;
    margin-left: auto;
    width: min(260px, 100%);
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.20);
    padding: 16px;
    color: var(--green-950);
    background: #fff;
    text-align: right;
  }

  .ltc-details-receipt-balance-due p {
    margin: 0;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-details-receipt-balance-due strong {
    display: block;
    margin-top: 4px;
    color: var(--green-800);
    font-size: 22px;
    font-weight: 900;
  }

  .ltc-details-receipt-note {
    margin-top: 18px;
    border-radius: 16px;
    background: rgba(102,112,133,.08);
    color: var(--muted);
    padding: 14px 16px;
    font-size: 13px;
    line-height: 1.65;
    font-weight: 700;
  }

  .ltc-details-receipt-footer {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 18px;
    color: var(--green-800);
    font-size: 12px;
    font-weight: 900;
  }

  .ltc-details-receipt-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-wrap: wrap;
    padding: 0 26px 26px;
  }

  @media (max-width: 1100px) { .ltc-stats-grid { grid-template-columns: repeat(3,1fr); } .ltc-bookings-grid, .ltc-footer-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 900px) { .ltc-header .ltc-container { padding-left: 22px; padding-right: 22px; } .ltc-nav { min-height: auto; padding: 18px 0; } .ltc-desktop-nav { display: none; } .ltc-menu-button { display: grid; place-items: center; } .ltc-hero { padding: 76px 0 74px; } .ltc-section { padding: 44px 0 64px; } .ltc-form-shell { padding: 28px 22px; } .ltc-filter-header { align-items: flex-start; } .ltc-footer { padding: 28px 0 12px; } .ltc-footer-grid { gap: 18px; padding-bottom: 22px; } .ltc-footer .ltc-container { padding-left: 22px; padding-right: 22px; } .ltc-copyright { flex-direction: column; } }
  @media (max-width: 700px) { .ltc-stats-grid, .ltc-stats-grid-secondary, .ltc-bookings-grid, .ltc-info-grid, .ltc-complete-details-grid, .ltc-footer-grid { grid-template-columns: 1fr; } .ltc-card-actions { grid-template-columns: 1fr; } .ltc-timeline-steps { gap: 4px; } .ltc-card-top-inner, .ltc-modal-top, .ltc-details-modal-header { flex-direction: column; } }
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

function getReceiptNumber(booking) {
  const id = String(booking?._id || "BOOKING").slice(-8).toUpperCase();
  return `LTC-${id}`;
}

function getBookingDetailRows(booking) {
  if (!booking) return [];

  const raw = booking.raw || {};

  const baseRows = [
    ["Receipt No.", getReceiptNumber(booking)],
    ["Booking ID", booking._id],
    ["Service", booking.serviceType],
    ["Booking Type", getBookingServiceBadge(booking.bookingType)],
    ["Title", booking.bookingTitle],
    ["Status", getStatusInfo(booking.status).label],
    ["Date", formatDate(booking.bookingDate)],
    ["Time", booking.bookingTime || "—"],
    ["Pax / Guests", booking.pax || "—"],
    ["Payment Method", booking.paymentMethod || "—"],
    ["Amount", formatPeso(booking.amount)],
    ["Submitted At", booking.createdAt ? formatDate(booking.createdAt) : "—"],
  ];

  if (booking.bookingType === "hotel_room") {
    return [
      ...baseRows,
      ["Room Type", raw.roomType || raw.selectedRoomType || "—"],
      ["Duration", raw.duration || raw.selectedDuration || "—"],
      ["Package", raw.packageTitle || raw.selectedPackageTitle || raw.selectedPackage || "—"],
      ["Payment Term", raw.paymentTerm || "—"],
      ["Balance", formatPeso(raw.balanceAmount || raw.balance || 0)],
    ];
  }

  if (booking.bookingType === "resort") {
    return [
      ...baseRows,
      ["Venue", raw.venue || raw.selectedVenue || raw.packageName || "—"],
      ["Category / Duration", raw.category || raw.duration || raw.selectedDuration || "—"],
      ["Adults", raw.adults || "—"],
      ["Kids", raw.kids || "—"],
      ["Additional Pax", raw.additionalPax || "—"],
      ["Payment Term", raw.paymentTerm || "—"],
      ["Balance", formatPeso(raw.balanceAmount || raw.balance || 0)],
    ];
  }

  if (booking.bookingType === "event") {
    return [
      ...baseRows,
      ["Event Package", raw.eventPackage || raw.selectedPackageTitle || raw.packageName || "—"],
      ["Event Type", raw.eventType || "—"],
      ["Event Theme", raw.eventTheme || "—"],
      ["Venue", raw.venueDisplayName || raw.venue || "—"],
      ["Base Pax", raw.basePax || "—"],
      ["Additional Pax", raw.additionalPax || "—"],
      ["Food Charge", formatPeso(raw.foodCharge || raw.additionalPaxCharge || 0)],
      ["Payment Term", raw.paymentTerm || "—"],
      ["Balance", formatPeso(raw.balanceAmount || raw.balance || 0)],
    ];
  }

  return baseRows;
}



function formatDateMMDDYYYY(value) {
  if (!value) return "";

  const raw = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-");
    return `${month}/${day}/${year}`;
  }

  const parsed = new Date(raw);

  if (!Number.isNaN(parsed.getTime())) {
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    const year = parsed.getFullYear();
    return `${month}/${day}/${year}`;
  }

  return raw;
}

function formatPesoReceipt(value) {
  const num = Number(value || 0);

  if (!num) return "PHP 0";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  })
    .format(num)
    .replace("₱", "PHP ");
}

function formatPesoReceiptDisplay(value) {
  const num = Number(value || 0);

  if (!num) return "₱ 0";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(num);
}

function sanitizeReceiptFileName(value = "booking-receipt") {
  return String(value || "booking-receipt")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapePdfText(value = "") {
  return String(value ?? "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ");
}

function splitPdfText(text = "", maxLength = 76) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function pdfText(text, x, y, size = 10, font = "F1") {
  return [`/${font} ${size} Tf`, `1 0 0 1 ${x} ${y} Tm`, `(${escapePdfText(text)}) Tj`].join("\n");
}

function pdfLine(x1, y1, x2, y2) {
  return `${x1} ${y1} m ${x2} ${y2} l S`;
}

function pdfRect(x, y, w, h, stroke = true, fill = false) {
  if (fill && stroke) return `${x} ${y} ${w} ${h} re B`;
  if (fill) return `${x} ${y} ${w} ${h} re f`;
  return `${x} ${y} ${w} ${h} re S`;
}

function getReceiptDataFromBooking(booking) {
  const raw = booking?.raw || {};
  const firstName = raw.firstName || raw.guestFirstName || raw.customerFirstName || "";
  const lastName = raw.lastName || raw.guestLastName || raw.customerLastName || "";

  const guestName =
    `${firstName} ${lastName}`.trim() ||
    raw.guestName ||
    raw.fullName ||
    raw.name ||
    booking?.guestName ||
    booking?.customerName ||
    "Guest";

  const email = raw.email || raw.guestEmail || booking?.email || "";
  const phone = raw.phone || raw.contactNumber || raw.mobileNumber || booking?.phone || "";

  const serviceType =
    booking?.serviceType ||
    getBookingServiceBadge(booking?.bookingType) ||
    "Booking";

  const packageName =
    booking?.bookingTitle ||
    raw.packageTitle ||
    raw.selectedPackageTitle ||
    raw.selectedPackage ||
    raw.eventPackage ||
    raw.venueDisplayName ||
    raw.venue ||
    raw.roomType ||
    raw.packageName ||
    "";

  const amountPaid = Number(
    raw.paidAmount ||
      raw.amountToPay ||
      raw.amountPaid ||
      raw.downPaymentAmount ||
      booking?.amountPaid ||
      booking?.paidAmount ||
      booking?.amount ||
      0
  );

  const totalAmount = Number(
    raw.totalAmount ||
      raw.price ||
      raw.totalPrice ||
      booking?.totalAmount ||
      booking?.amount ||
      0
  );

  const balanceAmount = Math.max(
    0,
    Number(
      raw.balanceAmount ||
        raw.remainingBalance ||
        raw.balance ||
        booking?.balanceAmount ||
        booking?.remainingBalance ||
        totalAmount - amountPaid ||
        0
    )
  );

  const paymentTermRaw =
    raw.paymentTerm ||
    booking?.paymentTerm ||
    (balanceAmount > 0 ? "Down Payment" : "Full Payment");

  const paymentTerm =
    String(paymentTermRaw).toUpperCase() === "DOWN_PAYMENT"
      ? "Down Payment"
      : String(paymentTermRaw).toUpperCase() === "FULL_PAYMENT"
      ? "Full Payment"
      : paymentTermRaw || "—";

  return {
    receiptNumber: getReceiptNumber(booking),
    receiptDate: booking?.createdAt
      ? new Date(booking.createdAt).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "2-digit",
        })
      : new Date().toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "2-digit",
        }),
    guestName,
    email,
    phone,
    serviceType,
    packageName,
    date: booking?.bookingDate || raw.date || raw.eventDate || "",
    time: booking?.bookingTime || raw.time || "",
    pax: booking?.pax || raw.pax || raw.totalGuests || "",
    paymentMethod: booking?.paymentMethod || raw.paymentMethod || "—",
    paymentTerm,
    amountPaid,
    totalAmount,
    balanceAmount,
  };
}

function createProfessionalBookingReceiptPdf({
  receiptNumber,
  receiptDate,
  guestName,
  email,
  phone,
  serviceType,
  packageName,
  date,
  time,
  pax,
  paymentMethod,
  paymentTerm,
  amountPaid,
  totalAmount,
  balanceAmount,
}) {
  const pageWidth = 612;
  const pageHeight = 792;
  const left = 48;
  const right = 564;

  const stream = [];

  stream.push("0.184 0.322 0.239 rg");
  stream.push(pdfRect(0, 704, 612, 88, false, true));

  stream.push("1 1 1 rg");
  stream.push("BT");
  stream.push(pdfText("LUMISPIRE", 48, 748, 24, "F2"));
  stream.push(pdfText("HOTEL & RESORT", 48, 728, 12, "F1"));
  stream.push(pdfText("BOOKING RECEIPT / BILLING STATEMENT", 332, 748, 12, "F2"));
  stream.push(pdfText(`Receipt No. ${receiptNumber}`, 332, 728, 10, "F1"));
  stream.push(pdfText(`Issued: ${receiptDate}`, 332, 712, 10, "F1"));
  stream.push("ET");

  stream.push("0.95 0.95 0.92 rg");
  stream.push(pdfRect(left, 664, 516, 24, false, true));
  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("STATUS: SUBMITTED - WAITING FOR ADMIN APPROVAL", 62, 672, 10, "F2"));
  stream.push("ET");

  stream.push("0 0 0 RG");
  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("Thank you for booking!", left, 632, 20, "F2"));
  stream.push("0.31 0.40 0.34 rg");
  stream.push(pdfText("Your booking request has been submitted successfully. Please keep this receipt for your records.", left, 612, 10, "F1"));
  stream.push("ET");

  stream.push("0.82 0.86 0.82 RG");
  stream.push(pdfRect(left, 500, 246, 88, true, false));
  stream.push(pdfRect(318, 500, 246, 88, true, false));

  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("BILLED TO", 62, 568, 10, "F2"));
  stream.push(pdfText(guestName || "Guest", 62, 548, 12, "F2"));
  stream.push("0.36 0.43 0.37 rg");
  stream.push(pdfText(email || "-", 62, 532, 9, "F1"));
  stream.push(pdfText(phone || "-", 62, 512, 9, "F1"));

  stream.push("0.184 0.322 0.239 rg");
  stream.push(pdfText("PAYMENT OVERVIEW", 332, 568, 10, "F2"));
  stream.push(pdfText(`Method: ${paymentMethod || "-"}`, 332, 548, 10, "F1"));
  stream.push(pdfText(`Term: ${paymentTerm || "-"}`, 332, 532, 10, "F1"));
  stream.push("ET");

  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("BOOKING DETAILS", left, 486, 13, "F2"));
  stream.push("ET");
  stream.push("0.82 0.86 0.82 RG");
  stream.push(pdfLine(left, 476, right, 476));

  const detailRows = [
    ["Service", serviceType || "-"],
    ["Package / Venue", packageName || "-"],
    ["Date", formatDateMMDDYYYY(date) || "-"],
    ["Time", time || "-"],
    ["Pax", pax ? `${pax} pax` : "-"],
  ];

  let y = 454;
  detailRows.forEach(([label, value]) => {
    stream.push("0.36 0.43 0.37 rg");
    stream.push("BT");
    stream.push(pdfText(label.toUpperCase(), left, y, 9, "F2"));
    stream.push("0.184 0.322 0.239 rg");

    const lines = splitPdfText(value, 62);
    lines.forEach((line, index) => {
      stream.push(pdfText(index === 0 ? line : `  ${line}`, 190, y - index * 13, 10, "F1"));
    });

    stream.push("ET");
    y -= Math.max(22, lines.length * 13 + 8);
  });

  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("PAYMENT SUMMARY", left, 320, 13, "F2"));
  stream.push("ET");
  stream.push("0.82 0.86 0.82 RG");
  stream.push(pdfLine(left, 310, right, 310));

  stream.push("0.95 0.95 0.92 rg");
  stream.push(pdfRect(left, 282, 516, 26, false, true));
  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("DESCRIPTION", 62, 291, 9, "F2"));
  stream.push(pdfText("AMOUNT", 480, 291, 9, "F2"));
  stream.push("ET");

  const paymentRows = [
    ["Total Booking Amount", formatPesoReceipt(totalAmount)],
    ["Amount Paid", formatPesoReceipt(amountPaid)],
    ["Remaining Balance", formatPesoReceipt(balanceAmount)],
  ];

  y = 262;
  paymentRows.forEach(([label, value]) => {
    stream.push("0.82 0.86 0.82 RG");
    stream.push(pdfLine(left, y - 8, right, y - 8));

    stream.push("0.184 0.322 0.239 rg");
    stream.push("BT");
    stream.push(pdfText(label, 62, y, 10, "F1"));
    stream.push(pdfText(value, 450, y, 10, "F2"));
    stream.push("ET");

    y -= 28;
  });

  stream.push("0.184 0.322 0.239 rg");
  stream.push(pdfRect(348, 154, 216, 44, true, false));
  stream.push("BT");
  stream.push(pdfText("BALANCE DUE", 362, 178, 10, "F2"));
  stream.push(pdfText(formatPesoReceipt(balanceAmount), 450, 164, 14, "F2"));
  stream.push("ET");

  stream.push("0.95 0.95 0.92 rg");
  stream.push(pdfRect(left, 92, 516, 42, false, true));
  stream.push("0.36 0.43 0.37 rg");
  stream.push("BT");
  splitPdfText(
    "Note: This receipt confirms that your booking request and proof of payment were submitted. Final confirmation is subject to admin approval. Please check your profile for booking status updates.",
    96
  ).forEach((line, index) => {
    stream.push(pdfText(line, 62, 116 - index * 13, 9, "F1"));
  });
  stream.push("ET");

  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("LTC GROUP OF COMPANIES", left, 54, 9, "F2"));
  stream.push(pdfText("Developed by CRMS Tech Alliance", left, 40, 8, "F1"));
  stream.push(pdfText("This is a system-generated receipt.", 386, 40, 8, "F1"));
  stream.push("ET");

  const content = stream.join("\n");
  const encoder = new TextEncoder();
  const contentLength = encoder.encode(content).length;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`,
  ];

  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];

  objects.forEach((body, index) => {
    offsets.push(chunks.join("").length);
    chunks.push(`${index + 1} 0 obj\n${body}\nendobj\n`);
  });

  const xrefOffset = chunks.join("").length;

  chunks.push(`xref\n0 ${objects.length + 1}\n`);
  chunks.push("0000000000 65535 f \n");

  offsets.slice(1).forEach((offset) => {
    chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });

  chunks.push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return new Blob(chunks, { type: "application/pdf" });
}


function downloadBookingPdf(booking) {
  if (!booking) return;

  const receiptData = getReceiptDataFromBooking(booking);
  const pdfBlob = createProfessionalBookingReceiptPdf(receiptData);
  const url = URL.createObjectURL(pdfBlob);
  const fileName = `${sanitizeReceiptFileName(receiptData.serviceType)}-${sanitizeReceiptFileName(receiptData.guestName)}-receipt.pdf`;

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
    route: "/resort-venue",
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
  const [detailsBooking, setDetailsBooking] = useState(null);
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

  const openDetailsModal = (booking) => {
    setDetailsBooking(booking);
    setStatus({ type: "", message: "" });
  };

  const closeDetailsModal = () => {
    setDetailsBooking(null);
  };

  const handleDownloadPdf = (booking) => {
    try {
      downloadBookingPdf(booking);
    } catch (error) {
      console.error("handleDownloadPdf error:", error);
      setStatus({
        type: "error",
        message: "Could not generate booking PDF. Please try again.",
      });
    }
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
                    onViewDetails={() => openDetailsModal(booking)}
                    onDownloadPdf={() => handleDownloadPdf(booking)}
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
      

      {isOpen ? (
        <MobileMenu
          onClose={() => setIsOpen(false)}
          navigate={navigate}
          goToProfile={goToProfile}
        />
      ) : null}

      {detailsBooking ? (
        <BookingDetailsModal
          booking={detailsBooking}
          onClose={closeDetailsModal}
          onDownloadPdf={() => handleDownloadPdf(detailsBooking)}
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

function BookingProcessCard({
  booking,
  onReview,
  onBookAgain,
  onViewDetails,
  onDownloadPdf,
}) {
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

        <div className="ltc-card-actions">
          <button
            type="button"
            onClick={onViewDetails}
            className="ltc-secondary-button ltc-card-button"
            style={fontMontserrat}
          >
            VIEW DETAILS
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="ltc-secondary-button ltc-card-button"
            style={fontMontserrat}
          >
            DOWNLOAD PDF
          </button>
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

            <div className="ltc-card-actions-full">
              <button
                type="button"
                onClick={onBookAgain}
                className="ltc-primary-button ltc-card-button"
                style={fontMontserrat}
              >
                BOOK IT AGAIN
              </button>
            </div>
          </>
        ) : canReview ? (
          <div className="ltc-card-actions-full">
            <button
              type="button"
              onClick={onReview}
              className="ltc-primary-button ltc-card-button"
              style={fontMontserrat}
            >
              WRITE REVIEW
            </button>
          </div>
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

function BookingDetailsModal({ booking, onClose, onDownloadPdf }) {
  const receiptData = getReceiptDataFromBooking(booking);

  return (
    <div
      className="ltc-details-modal-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="ltc-details-receipt-modal"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <div className="ltc-details-receipt-modal-header">
          <h3 style={fontMontserrat}>Booking Receipt Preview</h3>

          <button
            type="button"
            onClick={onClose}
            className="ltc-details-receipt-close"
            aria-label="Close receipt preview"
          >
            ×
          </button>
        </div>

        <div className="ltc-details-receipt-scroll">
          <div className="ltc-details-receipt-paper">
            <div className="ltc-details-receipt-top">
              <div className="ltc-details-receipt-brand">
                <h4 style={fontMontserrat}>Lumispire</h4>
                <p style={fontPontano}>Hotel &amp; Resort</p>
              </div>

              <div className="ltc-details-receipt-meta">
                <h4 style={fontMontserrat}>Booking Receipt</h4>
                <p style={fontPontano}>Receipt No. {receiptData.receiptNumber}</p>
                <p style={fontPontano}>Issued: {receiptData.receiptDate}</p>
              </div>
            </div>

            <div className="ltc-details-receipt-status" style={fontMontserrat}>
              Status: Submitted — Waiting for Admin Approval
            </div>

            <div className="ltc-details-receipt-thanks">
              <h4 style={fontMontserrat}>Thank you for booking!</h4>
              <p style={fontPontano}>
                Your booking request has been submitted successfully. Please keep this receipt for your records.
              </p>
            </div>

            <div className="ltc-details-receipt-body">
              <div className="ltc-details-receipt-two-col">
                <div className="ltc-details-receipt-box">
                  <h5 style={fontMontserrat}>Billed To</h5>
                  <p className="ltc-details-receipt-name" style={fontMontserrat}>
                    {receiptData.guestName}
                  </p>
                  <p className="ltc-details-receipt-muted" style={fontPontano}>
                    {receiptData.email || "—"}
                  </p>
                  <p className="ltc-details-receipt-muted" style={fontPontano}>
                    {receiptData.phone || "—"}
                  </p>
                </div>

                <div className="ltc-details-receipt-box">
                  <h5 style={fontMontserrat}>Payment Overview</h5>
                  <p className="ltc-details-receipt-muted" style={fontPontano}>
                    Method: {receiptData.paymentMethod || "—"}
                  </p>
                  <p className="ltc-details-receipt-muted" style={fontPontano}>
                    Term: {receiptData.paymentTerm || "—"}
                  </p>
                </div>
              </div>

              <h5 style={fontMontserrat}>Booking Details</h5>
              <table className="ltc-details-receipt-table">
                <tbody>
                  <ReceiptPreviewRow label="Service" value={receiptData.serviceType || "—"} />
                  <ReceiptPreviewRow label="Package / Venue" value={receiptData.packageName || "—"} />
                  <ReceiptPreviewRow label="Date" value={formatDateMMDDYYYY(receiptData.date) || "—"} />
                  <ReceiptPreviewRow label="Time" value={receiptData.time || "—"} />
                  <ReceiptPreviewRow
                    label="Pax"
                    value={receiptData.pax ? `${receiptData.pax} pax` : "—"}
                  />
                </tbody>
              </table>

              <h5 style={fontMontserrat}>Payment Summary</h5>
              <div className="ltc-details-receipt-summary">
                <div className="ltc-details-receipt-summary-row" style={fontPontano}>
                  <span>Total Booking Amount</span>
                  <strong>{formatPesoReceiptDisplay(receiptData.totalAmount)}</strong>
                </div>

                <div className="ltc-details-receipt-summary-row" style={fontPontano}>
                  <span>Amount Paid</span>
                  <strong>{formatPesoReceiptDisplay(receiptData.amountPaid)}</strong>
                </div>

                <div className="ltc-details-receipt-summary-row balance" style={fontMontserrat}>
                  <span>Remaining Balance</span>
                  <strong>{formatPesoReceiptDisplay(receiptData.balanceAmount)}</strong>
                </div>
              </div>

              <div className="ltc-details-receipt-balance-due">
                <p style={fontMontserrat}>Balance Due</p>
                <strong style={fontMontserrat}>
                  {formatPesoReceiptDisplay(receiptData.balanceAmount)}
                </strong>
              </div>

              <div className="ltc-details-receipt-note" style={fontPontano}>
                This receipt confirms that your booking request and proof of payment were submitted.
                Final confirmation is subject to admin approval. Please check your profile for booking status updates.
              </div>

              <div className="ltc-details-receipt-footer" style={fontPontano}>
                <span>LTC GROUP OF COMPANIES</span>
                <span>Developed by CRMS Tech Alliance</span>
              </div>
            </div>

            <div className="ltc-details-receipt-actions">
              <button
                type="button"
                onClick={onClose}
                className="ltc-secondary-button"
                style={fontMontserrat}
              >
                Close
              </button>

              <button
                type="button"
                onClick={onDownloadPdf}
                className="ltc-primary-button"
                style={fontMontserrat}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptPreviewRow({ label, value }) {
  return (
    <tr>
      <th style={fontMontserrat}>{label}</th>
      <td style={fontPontano}>{value}</td>
    </tr>
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
          onClick={() => navigate("/resort-venue")}
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
          <NavButton label="Home" onClick={() => navigate("/resort-venue")} />
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
          <FooterLink onClick={() => (window.location.href = "/resort-venue")}>Home</FooterLink>
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

        <MobileLink label="Home" onClick={() => navigate("/resort-venue")} />
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

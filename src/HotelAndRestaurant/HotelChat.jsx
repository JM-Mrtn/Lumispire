import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";


const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-chat-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --glass: rgba(255,255,255,.82);
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

  .ltc-chat-page * { box-sizing: border-box; }

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

  .ltc-profile-button {
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 14px 28px rgba(215,168,77,.18);
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
    padding: 82px 0 78px;
  }

  .ltc-hero-slide {
    position: absolute;
    inset: 0;
    z-index: -4;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .35;
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

  .ltc-hero-title span { color: var(--gold-soft); }

  .ltc-hero-text {
    max-width: 760px;
    margin: 18px auto 0;
    color: rgba(255,255,255,.80);
    font-size: 17px;
    line-height: 1.8;
  }

  .ltc-section { padding: 84px 0; }

  .ltc-form-shell {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius);
    background: var(--glass);
    border: 1px solid rgba(255,255,255,.76);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
    padding: 34px;
    transition: .28s var(--ease);
  }

  .ltc-form-shell::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 6px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
    z-index: 3;
  }

  .ltc-form-shell:hover {
    box-shadow: var(--shadow-lg);
    border-color: rgba(215,168,77,.45);
  }

  .ltc-filter-header {
    margin-bottom: 24px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    flex-wrap: wrap;
  }

  .ltc-section-heading {
    margin: 0;
    color: var(--green-950);
    font-size: clamp(24px,3vw,34px);
    line-height: 1.08;
    letter-spacing: -.05em;
    font-weight: 900;
  }

  .ltc-section-line {
    margin-top: 10px;
    width: 180px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
  }

  .ltc-muted-text {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.7;
    font-weight: 700;
  }

  .ltc-filter-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0,1fr));
    gap: 18px 16px;
  }

  .ltc-field label {
    display: block;
    margin: 0 0 8px;
    color: var(--green-950);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-input,
  .ltc-select {
    width: 100%;
    min-height: 50px;
    border-radius: 999px;
    border: 1px solid rgba(35,95,62,.16);
    background: rgba(255,255,255,.88);
    color: var(--dark);
    outline: none;
    font-size: 14px;
    font-family: inherit;
    font-weight: 700;
    padding: 0 18px;
    transition: .25s var(--ease);
    box-shadow: 0 10px 24px rgba(8,39,25,.05);
  }

  .ltc-input::placeholder { color: rgba(102,112,133,.68); }

  .ltc-input:focus,
  .ltc-select:focus {
    border-color: var(--green-700);
    background: white;
    box-shadow: 0 0 0 4px rgba(35,95,62,.10);
  }

  .ltc-filter-actions {
    margin-top: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .ltc-history-pill {
    display: inline-flex;
    align-items: center;
    min-height: 42px;
    border-radius: 999px;
    background: rgba(35,95,62,.08);
    border: 1px solid rgba(35,95,62,.10);
    color: var(--green-800);
    padding: 0 18px;
    font-size: 13px;
    font-weight: 900;
  }

  .ltc-status {
    margin-top: 24px;
    border-radius: 16px;
    border: 1px solid transparent;
    padding: 12px 14px;
    font-size: 13px;
    line-height: 1.55;
    font-weight: 800;
  }

  .ltc-status-success {
    color: #047857;
    background: rgba(16,185,129,.10);
    border-color: rgba(16,185,129,.25);
  }

  .ltc-status-error {
    color: #b42318;
    background: rgba(239,68,68,.10);
    border-color: rgba(239,68,68,.22);
  }

  .ltc-status-info {
    color: #475467;
    background: rgba(102,112,133,.09);
    border-color: rgba(102,112,133,.14);
  }

  .ltc-primary-button,
  .ltc-secondary-button {
    min-height: 52px;
    min-width: 210px;
    border-radius: 999px;
    padding: 0 28px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 900;
    transition: all .28s var(--ease);
  }

  .ltc-primary-button {
    border: 0;
    color: #102418;
    background: linear-gradient(135deg, #f4d484, #d7a84d);
    box-shadow: 0 16px 35px rgba(215,168,77,.22);
  }

  .ltc-primary-button:hover {
    transform: translateY(-4px);
    background: linear-gradient(135deg, #f7dc93, #c99634);
    box-shadow: 0 22px 45px rgba(215,168,77,.32);
  }

  .ltc-primary-button:active {
    transform: translateY(-1px) scale(.98);
    box-shadow: 0 10px 24px rgba(215,168,77,.22);
  }

  .ltc-secondary-button {
    border: 1px solid rgba(35,95,62,.18);
    color: var(--green-800);
    background: white;
    box-shadow: 0 12px 28px rgba(8,39,25,.06);
  }

  .ltc-secondary-button:hover {
    transform: translateY(-4px);
    color: white;
    background: var(--green-800);
    border-color: var(--green-800);
    box-shadow: 0 18px 38px rgba(8,39,25,.18);
  }

  .ltc-primary-button:disabled,
  .ltc-secondary-button:disabled {
    opacity: .6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .ltc-recommendations-grid {
    margin-top: 34px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap: 22px;
  }

  .ltc-recommendation-card {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(35,95,62,.12);
    box-shadow: 0 16px 34px rgba(8,39,25,.08);
    transition: .28s var(--ease);
  }

  .ltc-recommendation-card:hover {
    transform: translateY(-6px);
    border-color: rgba(215,168,77,.55);
    box-shadow: 0 26px 56px rgba(8,39,25,.16);
  }

  .ltc-card-top {
    position: relative;
    overflow: hidden;
    min-height: 156px;
    padding: 24px;
    color: white;
    background: linear-gradient(135deg, var(--green-950), var(--green-800));
  }

  .ltc-card-top::after {
    content: "";
    position: absolute;
    inset: -50% -30% auto auto;
    width: 220px;
    height: 220px;
    border-radius: 999px;
    background: rgba(244,212,132,.18);
    filter: blur(4px);
  }

  .ltc-card-top-inner {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }

  .ltc-card-eyebrow {
    margin: 0;
    color: var(--gold-soft);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .ltc-card-title {
    margin: 8px 0 0;
    color: white;
    font-size: 24px;
    line-height: 1.08;
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .ltc-match-badge {
    min-width: 70px;
    border-radius: 18px;
    background: rgba(255,255,255,.14);
    border: 1px solid rgba(255,255,255,.18);
    padding: 10px 11px;
    text-align: center;
    backdrop-filter: blur(6px);
  }

  .ltc-match-badge span {
    display: block;
    color: rgba(255,255,255,.7);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-match-badge strong {
    display: block;
    color: white;
    font-size: 19px;
    line-height: 1.1;
    font-weight: 900;
  }

  .ltc-card-body { padding: 22px; }

  .ltc-info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 12px;
  }

  .ltc-info-box {
    border-radius: 18px;
    background: rgba(35,95,62,.07);
    border: 1px solid rgba(35,95,62,.08);
    padding: 13px 14px;
  }

  .ltc-info-label {
    margin: 0;
    color: rgba(16,24,40,.46);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-info-value {
    margin: 3px 0 0;
    color: var(--green-800);
    font-size: 14px;
    font-weight: 900;
    line-height: 1.35;
  }

  .ltc-reason-title {
    margin: 20px 0 0;
    color: rgba(16,24,40,.48);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-reason-list {
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
    display: grid;
    gap: 8px;
    color: rgba(16,24,40,.68);
    font-size: 14px;
    line-height: 1.55;
    font-weight: 700;
  }

  .ltc-reason-list li {
    display: flex;
    gap: 9px;
  }

  .ltc-reason-dot {
    width: 7px;
    height: 7px;
    margin-top: 8px;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--green-700), var(--gold));
    flex: 0 0 auto;
  }

  .ltc-tag-row {
    margin-top: 18px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ltc-tag {
    border-radius: 999px;
    background: rgba(35,95,62,.10);
    border: 1px solid rgba(35,95,62,.08);
    color: var(--green-800);
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 900;
  }

  .ltc-card-button {
    margin-top: 22px;
    width: 100%;
    min-width: 0;
  }

  .ltc-empty-state {
    margin-top: 34px;
    text-align: center;
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

  @media (max-width: 1100px) {
    .ltc-filter-grid,
    .ltc-recommendations-grid,
    .ltc-footer-grid {
      grid-template-columns: 1fr 1fr;
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

    .ltc-desktop-nav { display: none; }
    .ltc-menu-button { display: grid; place-items: center; }
    .ltc-hero { padding: 76px 0 74px; }
    .ltc-section { padding: 64px 0; }
    .ltc-form-shell { padding: 28px 22px; }
    .ltc-filter-header { align-items: flex-start; }
    .ltc-footer { padding: 28px 0 12px; }
    .ltc-footer-grid { gap: 18px; padding-bottom: 22px; }
    .ltc-footer .ltc-container { padding-left: 22px; padding-right: 22px; }
    .ltc-copyright { flex-direction: column; }
  }

  @media (max-width: 700px) {
    .ltc-filter-grid,
    .ltc-recommendations-grid,
    .ltc-info-grid,
    .ltc-footer-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .ltc-header .ltc-container,
    .ltc-footer .ltc-container {
      padding-left: 16px;
      padding-right: 16px;
    }

    .ltc-logo h1 { font-size: 14px; }
    .ltc-logo p { font-size: 10px; }

    .ltc-hero-title {
      font-size: clamp(34px, 11vw, 46px);
      letter-spacing: -.045em;
    }

    .ltc-hero-text { font-size: 15px; }
    .ltc-form-shell { padding: 26px 18px; }

    .ltc-primary-button,
    .ltc-secondary-button {
      width: 100%;
    }
  }


  .ltc-chat-shell {
    margin-top: -44px;
    position: relative;
    z-index: 2;
  }

  .ltc-chat-card {
    overflow: hidden;
    border: 1px solid rgba(8,39,25,.10);
    border-radius: 34px;
    background: rgba(255,255,255,.94);
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(14px);
  }

  .ltc-chat-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    padding: 28px;
    background:
      radial-gradient(circle at 92% 0%, rgba(244,212,132,.24), transparent 32%),
      linear-gradient(135deg, var(--green-900), var(--green-700));
    color: white;
  }

  .ltc-chat-card-header h2 {
    margin: 0;
    font-size: clamp(24px, 3vw, 36px);
    line-height: 1.1;
    font-weight: 900;
    letter-spacing: -.05em;
  }

  .ltc-chat-card-header p {
    margin: 8px 0 0;
    max-width: 620px;
    color: rgba(255,255,255,.76);
    font-size: 14px;
  }

  .ltc-chat-form-wrap {
    padding: 24px 28px;
    border-bottom: 1px solid rgba(8,39,25,.10);
    background:
      linear-gradient(180deg, rgba(248,251,249,.98), rgba(255,255,255,.98));
  }

  .ltc-chat-window {
    height: min(520px, 62vh);
    overflow-y: auto;
    padding: 26px;
    background:
      radial-gradient(circle at 15% 0%, rgba(215,168,77,.10), transparent 24%),
      linear-gradient(180deg, #fbfdfb 0%, #f4faf6 100%);
  }

  .ltc-chat-empty {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .ltc-chat-empty-icon {
    width: 76px;
    height: 76px;
    margin: 0 auto;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: rgba(35,95,62,.10);
    font-size: 34px;
    box-shadow: inset 0 0 0 1px rgba(35,95,62,.08);
  }

  .ltc-chat-empty h3 {
    margin: 18px 0 4px;
    color: var(--green-900);
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .ltc-chat-empty p {
    margin: 0;
    color: rgba(16,36,24,.52);
    font-weight: 700;
  }

  .ltc-message-list {
    display: grid;
    gap: 14px;
  }

  .ltc-message-row {
    display: flex;
  }

  .ltc-message-row.staff {
    justify-content: flex-start;
  }

  .ltc-message-row.guest {
    justify-content: flex-end;
  }

  .ltc-message-bubble {
    max-width: min(82%, 680px);
    border-radius: 26px;
    padding: 14px 16px;
    box-shadow: 0 16px 36px rgba(8,39,25,.10);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .ltc-message-bubble.staff {
    border-bottom-left-radius: 8px;
    border: 1px solid rgba(8,39,25,.10);
    background: white;
    color: #234232;
  }

  .ltc-message-bubble.bot {
    border-bottom-left-radius: 8px;
    border: 1px solid rgba(215,168,77,.28);
    background: linear-gradient(135deg, rgba(255,248,225,.96), rgba(255,255,255,.98));
    color: #234232;
  }

  .ltc-message-bubble.guest {
    border-bottom-right-radius: 8px;
    background: linear-gradient(135deg, var(--green-800), var(--green-700));
    color: white;
  }

  .ltc-message-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    opacity: .68;
  }

  .ltc-concern-pill {
    display: inline-flex;
    border-radius: 999px;
    padding: 3px 8px;
    background: rgba(215,168,77,.20);
    color: inherit;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-message-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
  }

  .ltc-message-time {
    margin: 8px 0 0;
    font-size: 10px;
    font-weight: 700;
    opacity: .55;
  }

  .ltc-compose-bar {
    padding: 20px;
    border-top: 1px solid rgba(8,39,25,.10);
    background: white;
  }

  .ltc-compose-row {
    display: flex;
    gap: 12px;
  }

  .ltc-chat-textarea {
    min-height: 58px;
    flex: 1;
    resize: none;
    border: 1px solid rgba(8,39,25,.13);
    border-radius: 22px;
    background: #f8fbf9;
    color: var(--green-900);
    padding: 14px 16px;
    font-size: 14px;
    font-weight: 700;
    outline: 0;
    transition: .25s var(--ease);
  }

  .ltc-chat-textarea:focus {
    border-color: rgba(35,95,62,.45);
    box-shadow: 0 0 0 5px rgba(35,95,62,.08);
    background: white;
  }

  .ltc-chat-textarea:disabled {
    cursor: not-allowed;
    opacity: .58;
  }

  .ltc-status {
    margin: 0 0 22px;
  }

  .ltc-chat-note {
    margin: 10px 0 0;
    color: rgba(16,36,24,.46);
    font-size: 12px;
    font-weight: 700;
  }

  @media (max-width: 720px) {
    .ltc-chat-shell { margin-top: -24px; }
    .ltc-chat-card { border-radius: 24px; }
    .ltc-chat-card-header { flex-direction: column; padding: 22px; }
    .ltc-chat-form-wrap { padding: 20px; }
    .ltc-chat-window { height: 55vh; padding: 18px; }
    .ltc-message-bubble { max-width: 94%; }
    .ltc-compose-row { flex-direction: column; }
  }
`;


function getHotelApiBase() {
  const raw =
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  const cleaned = String(raw).replace(/\/+$/, "");
  if (cleaned.endsWith("/api/hotel")) return cleaned;
  if (cleaned.endsWith("/api")) return `${cleaned}/hotel`;
  return `${cleaned}/api/hotel`;
}

const API_BASE = getHotelApiBase();
const SOCKET_BASE = API_BASE.replace(/\/api\/hotel$/i, "").replace(/\/api$/i, "");

const CONCERNS = [
  {
    id: "reschedule",
    label: "Reschedule",
    icon: "📅",
    description: "Request a new date or time for an existing booking.",
  },
  {
    id: "cancel",
    label: "Cancel",
    icon: "❌",
    description: "Ask the admin to cancel an existing booking.",
  },
  {
    id: "others",
    label: "Others",
    icon: "💬",
    description: "Ask about rooms, packages, payment, or other concerns.",
  },
];

const DEFAULT_FORMS = {
  reschedule: {
    bookingId: "",
    bookingType: "",
    bookingTitle: "",
    bookingDate: "",
    bookingTime: "",
    requestedDate: "",
    requestedTime: "",
    reason: "",
  },
  cancel: {
    bookingId: "",
    bookingType: "",
    bookingTitle: "",
    bookingDate: "",
    bookingTime: "",
    reason: "",
  },
  others: {
    subject: "",
    details: "",
  },
};

function getHotelToken() {
  return localStorage.getItem("hotelToken") || localStorage.getItem("token") || "";
}

function formatDate(value) {
  if (!value) return "No date";
  try {
    return new Date(value).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return value;
  }
}

function formatTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("en-PH", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function peso(value) {
  return Number(value || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  });
}

function extractArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function normalizeBookingOption(type, booking) {
  const id = String(booking?._id || booking?.id || "");
  if (!id) return null;

  if (type === "resort") {
    return {
      id,
      bookingType: "Resort & Venue",
      bookingTitle: booking.venue || booking.title || "Resort & Venue Booking",
      bookingDate: booking.date || "",
      bookingTime: booking.time || "",
      status: booking.status || "",
      amount: booking.price || booking.totalAmount || 0,
      raw: booking,
      label: `${booking.venue || "Resort & Venue"} • ${formatDate(
        booking.date
      )} • ${booking.status || "NO STATUS"} • ${id}`,
    };
  }

  if (type === "event") {
    return {
      id,
      bookingType: "Event Package",
      bookingTitle:
        booking.eventPackage || booking.packageTitle || booking.title || "Event Package Booking",
      bookingDate: booking.eventDate || booking.date || "",
      bookingTime: booking.time || "",
      status: booking.status || "",
      amount: booking.totalAmount || booking.price || 0,
      raw: booking,
      label: `${booking.eventPackage || booking.packageTitle || "Event Package"} • ${formatDate(
        booking.eventDate || booking.date
      )} • ${booking.status || "NO STATUS"} • ${id}`,
    };
  }

  return {
    id,
    bookingType: "Hotel & Condo",
    bookingTitle: `${booking.roomType || booking.packageTitle || "Hotel Room"}${
      booking.duration ? ` - ${booking.duration}` : ""
    }`,
    bookingDate: booking.date || "",
    bookingTime: booking.time || "",
    status: booking.status || "",
    amount: booking.price || booking.totalAmount || 0,
    raw: booking,
    label: `${booking.roomType || booking.packageTitle || "Hotel Room"} ${
      booking.duration || ""
    } • ${formatDate(booking.date)} • ${booking.status || "NO STATUS"} • ${id}`,
  };
}

function addMessageWithoutDuplicate(prevMessages, newMessage) {
  if (!newMessage) return prevMessages;

  const id = String(newMessage._id || "");
  if (id && prevMessages.some((item) => String(item._id || "") === id)) {
    return prevMessages;
  }

  return [...prevMessages, newMessage];
}

function addMessagesWithoutDuplicate(prevMessages, newMessages = []) {
  return newMessages.reduce(
    (current, item) => addMessageWithoutDuplicate(current, item),
    prevMessages
  );
}

function getConcernLabel(type) {
  return CONCERNS.find((item) => item.id === type)?.label || "Concern";
}

function buildConcernMessage(type, details = {}) {
  if (type === "reschedule") {
    return [
      "Concern/Need: Reschedule",
      `Booking Type: ${details.bookingType || "Not provided"}`,
      `Booking ID: ${details.bookingId || "Not provided"}`,
      `Booking Name: ${details.bookingTitle || "Not provided"}`,
      `Current Date: ${details.bookingDate || "Not provided"}`,
      `Current Time: ${details.bookingTime || "Not provided"}`,
      `Requested Date: ${details.requestedDate || "Not provided"}`,
      `Requested Time: ${details.requestedTime || "Not provided"}`,
      `Reason: ${details.reason || "Not provided"}`,
    ].join("\n");
  }

  if (type === "cancel") {
    return [
      "Concern/Need: Cancel",
      `Booking Type: ${details.bookingType || "Not provided"}`,
      `Booking ID: ${details.bookingId || "Not provided"}`,
      `Booking Name: ${details.bookingTitle || "Not provided"}`,
      `Booking Date: ${details.bookingDate || "Not provided"}`,
      `Booking Time: ${details.bookingTime || "Not provided"}`,
      `Reason: ${details.reason || "Not provided"}`,
    ].join("\n");
  }

  return [
    "Concern/Need: Others",
    `Subject: ${details.subject || "Not provided"}`,
    `Details: ${details.details || "Not provided"}`,
  ].join("\n");
}

function shouldShowFaqButton(message) {
  return message?.autoReplyKind === "after_hours";
}

function FieldLabel({ children }) {
  return (
    <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-[#355240]/70">
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder = "", type = "text", readOnly = false }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#2f4d36] outline-none focus:border-[#355240] read-only:bg-black/5"
    />
  );
}

function Select({ value, onChange, children, disabled = false }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#2f4d36] outline-none focus:border-[#355240] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </select>
  );
}

export default function HotelChat() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  const token = useMemo(() => getHotelToken(), []);

  const [messages, setMessages] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [selectedConcern, setSelectedConcern] = useState("");
  const [concernForm, setConcernForm] = useState({});
  const [messageText, setMessageText] = useState("");

  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [sendingConcern, setSendingConcern] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isOpen, setIsOpen] = useState(false);

  const selectedBooking = useMemo(() => {
    return myBookings.find((item) => item.id === concernForm.bookingId) || null;
  }, [myBookings, concernForm.bookingId]);

  const hasSpecifiedConcern = messages.some((msg) =>
    ["reschedule", "cancel", "others"].includes(String(msg?.concernType || ""))
  );

  const canFreeChat = hasSpecifiedConcern && !selectedConcern;

  const scrollToBottom = () => {
    window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const goLogin = () => {
    navigate("/hotel-login", { replace: true });
  };

  const goToProfile = () => {
    navigate(token ? "/hotel-profile" : "/hotel-login");
  };

  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  const fetchMessages = async () => {
    if (!token) {
      goLogin();
      return;
    }

    setLoadingMessages(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/chat/my/messages`, {
        headers: authHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        goLogin();
        return;
      }

      if (res.status === 403) {
        setMessages([]);
        setStatus({
          type: "error",
          message:
            data.message || "You must be logged in and ID verified before using chat.",
        });
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to load chat messages.");

      setMessages(Array.isArray(data.messages) ? data.messages : []);
      scrollToBottom();
    } catch (error) {
      console.error("fetchMessages error:", error);
      setStatus({ type: "error", message: error.message || "Failed to load chat." });
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!token) return;

    setLoadingBookings(true);

    try {
      const headers = authHeaders();
      const [resortRes, eventRes, hotelRes] = await Promise.all([
        fetch(`${API_BASE}/my-resort-bookings`, { headers }),
        fetch(`${API_BASE}/my-event-bookings`, { headers }),
        fetch(`${API_BASE}/my-hotel-room-bookings`, { headers }),
      ]);

      const [resortData, eventData, hotelData] = await Promise.all([
        resortRes.json().catch(() => ({})),
        eventRes.json().catch(() => ({})),
        hotelRes.json().catch(() => ({})),
      ]);

      const normalized = [
        ...extractArray(resortData, ["bookings", "resortBookings", "history"])
          .map((item) => normalizeBookingOption("resort", item))
          .filter(Boolean),
        ...extractArray(eventData, ["bookings", "eventBookings", "history"])
          .map((item) => normalizeBookingOption("event", item))
          .filter(Boolean),
        ...extractArray(hotelData, ["bookings", "hotelRoomBookings", "history"])
          .map((item) => normalizeBookingOption("hotel", item))
          .filter(Boolean),
      ].sort((a, b) => {
        const aTime = new Date(a.raw?.createdAt || a.bookingDate || 0).getTime();
        const bTime = new Date(b.raw?.createdAt || b.bookingDate || 0).getTime();
        return bTime - aTime;
      });

      setMyBookings(normalized);
    } catch (error) {
      console.error("fetchMyBookings error:", error);
      setStatus({
        type: "error",
        message: "Chat loaded, but your booking dropdown could not be loaded.",
      });
    } finally {
      setLoadingBookings(false);
    }
  };

  const selectConcern = (type) => {
    setSelectedConcern(type);
    setConcernForm({ ...(DEFAULT_FORMS[type] || {}) });
    setStatus({ type: "", message: "" });

    if (type === "reschedule" || type === "cancel") {
      fetchMyBookings();
    }
  };

  const updateConcernForm = (field, value) => {
    setConcernForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBookingSelect = (bookingId) => {
    const booking = myBookings.find((item) => item.id === bookingId);

    if (!booking) {
      setConcernForm((prev) => ({
        ...prev,
        bookingId: "",
        bookingType: "",
        bookingTitle: "",
        bookingDate: "",
        bookingTime: "",
      }));
      return;
    }

    setConcernForm((prev) => ({
      ...prev,
      bookingId: booking.id,
      bookingType: booking.bookingType,
      bookingTitle: booking.bookingTitle,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
    }));
  };

  const validateConcernForm = () => {
    if (!selectedConcern) return "Please choose your concern first.";

    if (selectedConcern === "reschedule") {
      if (!concernForm.bookingId) return "Please select your booking.";
      if (!concernForm.requestedDate) return "Please enter your requested new date.";
      if (!String(concernForm.requestedTime || "").trim()) {
        return "Please enter your requested time.";
      }
      if (!String(concernForm.reason || "").trim()) return "Please enter your reason.";
    }

    if (selectedConcern === "cancel") {
      if (!concernForm.bookingId) return "Please select your booking.";
      if (!String(concernForm.reason || "").trim()) {
        return "Please enter your cancellation reason.";
      }
    }

    if (selectedConcern === "others") {
      if (!String(concernForm.subject || "").trim()) return "Please enter your subject.";
      if (!String(concernForm.details || "").trim()) {
        return "Please enter your concern details.";
      }
    }

    return "";
  };

  const submitConcern = async (event) => {
    event?.preventDefault();
    if (sendingConcern) return;

    const error = validateConcernForm();
    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }

    setSendingConcern(true);
    setStatus({ type: "", message: "" });

    try {
      const details = {
        ...concernForm,
        bookingTitle: selectedBooking?.bookingTitle || concernForm.bookingTitle || "",
        bookingDate: selectedBooking?.bookingDate || concernForm.bookingDate || "",
        bookingTime: selectedBooking?.bookingTime || concernForm.bookingTime || "",
        bookingStatus: selectedBooking?.status || "",
        bookingAmount: selectedBooking?.amount || 0,
      };

      const res = await fetch(`${API_BASE}/chat/my/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          message: buildConcernMessage(selectedConcern, details),
          concernType: selectedConcern,
          concernDetails: {
            concernLabel: getConcernLabel(selectedConcern),
            ...details,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        goLogin();
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to send your concern.");

      setMessages((prev) =>
        addMessagesWithoutDuplicate(prev, [data.message, data.botMessage].filter(Boolean))
      );
      setSelectedConcern("");
      setConcernForm({});
      setStatus({
        type: "success",
        message: "Your concern was sent. You can now chat with hotel support.",
      });
      scrollToBottom();
    } catch (error) {
      console.error("submitConcern error:", error);
      setStatus({ type: "error", message: error.message || "Failed to send concern." });
    } finally {
      setSendingConcern(false);
    }
  };

  const sendMessage = async (event) => {
    event?.preventDefault();

    const text = messageText.trim();
    if (!text || sendingMessage) return;

    if (!canFreeChat) {
      setStatus({ type: "error", message: "Please specify your concern first." });
      return;
    }

    setSendingMessage(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/chat/my/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        goLogin();
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to send message.");

      setMessages((prev) =>
        addMessagesWithoutDuplicate(prev, [data.message, data.botMessage].filter(Boolean))
      );
      setMessageText("");
      scrollToBottom();
    } catch (error) {
      console.error("sendMessage error:", error);
      setStatus({ type: "error", message: error.message || "Failed to send message." });
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    if (!token) {
      goLogin();
      return undefined;
    }

    fetchMessages();
    fetchMyBookings();

    const socket = io(SOCKET_BASE, {
      transports: ["websocket", "polling"],
      auth: { token, role: "user" },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("hotelChat:joinMyConversation");
    });

    socket.on("hotelChat:message", (incoming) => {
      setMessages((prev) => addMessageWithoutDuplicate(prev, incoming));
      scrollToBottom();
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connect error:", error.message);
    });

    return () => {
      socket.off("connect");
      socket.off("hotelChat:message");
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderBookingDropdown = () => (
    <>
      <div>
        <FieldLabel>Booking ID</FieldLabel>
        <Select
          value={concernForm.bookingId || ""}
          onChange={(e) => handleBookingSelect(e.target.value)}
          disabled={loadingBookings}
        >
          <option value="">
            {loadingBookings
              ? "Loading your bookings..."
              : myBookings.length
              ? "Select your booking"
              : "No bookings found"}
          </option>
          {myBookings.map((booking) => (
            <option key={booking.id} value={booking.id}>
              {booking.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <FieldLabel>Booking Type</FieldLabel>
        <TextInput value={concernForm.bookingType || ""} readOnly />
      </div>

      {selectedBooking ? (
        <div className="md:col-span-2 rounded-2xl border border-[#355240]/15 bg-[#355240]/5 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#355240]/70">
            Selected Booking
          </p>
          <p className="mt-1 text-sm font-extrabold text-[#355240]">
            {selectedBooking.bookingTitle}
          </p>
          <div className="mt-2 grid gap-2 text-xs font-semibold text-black/55 sm:grid-cols-2">
            <p>Booking ID: {selectedBooking.id}</p>
            <p>Status: {selectedBooking.status || "No status"}</p>
            <p>Date: {formatDate(selectedBooking.bookingDate)}</p>
            <p>Time: {selectedBooking.bookingTime || "No time"}</p>
            <p>Amount: {peso(selectedBooking.amount)}</p>
          </div>
        </div>
      ) : null}
    </>
  );

  const renderConcernPicker = () => (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6f806d]">
            Required before chatting
          </p>
          <h3 className="text-lg font-extrabold text-[#355240]">
            What are your concerns / needs?
          </h3>
          <p className="text-sm font-semibold text-black/45">
            Choose one option so the admin can help you faster.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {CONCERNS.map((concern) => (
          <button
            key={concern.id}
            type="button"
            onClick={() => selectConcern(concern.id)}
            className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#355240]/40 hover:bg-[#355240]/5"
          >
            <div className="text-2xl">{concern.icon}</div>
            <p className="mt-2 text-sm font-extrabold text-[#355240]">
              {concern.label}
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-black/45">
              {concern.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderConcernForm = () => {
    if (!selectedConcern) return renderConcernPicker();

    return (
      <form onSubmit={submitConcern}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6f806d]">
              {getConcernLabel(selectedConcern)} Form
            </p>
            <h3 className="text-lg font-extrabold text-[#355240]">
              {getConcernLabel(selectedConcern)} Request
            </h3>
            <p className="text-sm font-semibold text-black/45">
              Complete the form, then your chat box will unlock.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedConcern("");
              setConcernForm({});
            }}
            className="mt-3 w-fit rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-extrabold text-[#355240] hover:bg-[#355240]/5 sm:mt-0"
          >
            BACK
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {selectedConcern !== "others" ? renderBookingDropdown() : null}

          {selectedConcern === "reschedule" ? (
            <>
              <div>
                <FieldLabel>Requested New Date</FieldLabel>
                <TextInput
                  type="date"
                  value={concernForm.requestedDate || ""}
                  onChange={(e) => updateConcernForm("requestedDate", e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Requested Time</FieldLabel>
                <TextInput
                  value={concernForm.requestedTime || ""}
                  onChange={(e) => updateConcernForm("requestedTime", e.target.value)}
                  placeholder="Example: 8:00 AM - 4:00 PM"
                />
              </div>
            </>
          ) : null}

          {selectedConcern === "others" ? (
            <>
              <div>
                <FieldLabel>Subject</FieldLabel>
                <TextInput
                  value={concernForm.subject || ""}
                  onChange={(e) => updateConcernForm("subject", e.target.value)}
                  placeholder="Example: Package inquiry"
                />
              </div>
              <div>
                <FieldLabel>Details</FieldLabel>
                <TextInput
                  value={concernForm.details || ""}
                  onChange={(e) => updateConcernForm("details", e.target.value)}
                  placeholder="Type your concern or question"
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <FieldLabel>Reason</FieldLabel>
              <TextInput
                value={concernForm.reason || ""}
                onChange={(e) => updateConcernForm("reason", e.target.value)}
                placeholder="Short reason"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={sendingConcern}
          className="mt-4 rounded-full bg-[#355240] px-6 py-2.5 text-xs font-extrabold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendingConcern ? "SENDING..." : `SEND ${getConcernLabel(selectedConcern).toUpperCase()} REQUEST`}
        </button>
      </form>
    );
  };

  return (
    <div className="ltc-chat-page" style={fontPontano}>
      <style>{pageStyles}</style>

      <Header
        navigate={navigate}
        goToProfile={goToProfile}
        openMenu={() => setIsOpen(true)}
      />

      <main>
        <section className="ltc-hero">
          <img
            src={HERO_IMAGES[0]}
            alt="Hotel support background"
            className="ltc-hero-slide"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ltc-container ltc-hero-content">
            <span className="ltc-eyebrow" style={fontMontserrat}>
              Hotel Support
            </span>

            <h1 className="ltc-hero-title" style={fontMontserrat}>
              My <span>Conversation</span>
            </h1>

            <p className="ltc-hero-text" style={fontPontano}>
              Send your concern form first, then continue chatting with hotel support in real time.
            </p>
          </div>
        </section>

        <section className="ltc-section ltc-chat-shell">
          <div className="ltc-container">
            {status.message ? (
              <div
                className={`ltc-status ${
                  status.type === "error" ? "ltc-status-error" : "ltc-status-success"
                }`}
                style={fontPoppins}
              >
                {status.message}
              </div>
            ) : null}

            <div className="ltc-chat-card">
              <div className="ltc-chat-card-header">
                <div>
                  <h2 style={fontMontserrat}>Hotel Admin Support</h2>
                  <p style={fontPoppins}>
                    Verified guests can message hotel support for reschedule requests, cancellations, and other booking concerns.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/hotel-profile")}
                  type="button"
                  className="ltc-secondary-button"
                  style={fontMontserrat}
                >
                  Back to Profile
                </button>
              </div>

              <div className="ltc-chat-form-wrap">{renderConcernForm()}</div>

              <div className="ltc-chat-window">
                {loadingMessages ? (
                  <div className="ltc-status ltc-status-info" style={fontPoppins}>
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="ltc-chat-empty">
                    <div>
                      <div className="ltc-chat-empty-icon">💬</div>
                      <h3 style={fontMontserrat}>No messages yet</h3>
                      <p style={fontPoppins}>Choose your concern above to start chatting.</p>
                    </div>
                  </div>
                ) : (
                  <div className="ltc-message-list">
                    {messages.map((msg, index) => {
                      const staff = msg.senderRole === "admin" || msg.senderRole === "bot";
                      const bot = msg.senderRole === "bot" || msg.isAutoReply;

                      return (
                        <div
                          key={msg._id || index}
                          className={`ltc-message-row ${staff ? "staff" : "guest"}`}
                        >
                          <div
                            className={`ltc-message-bubble ${
                              staff ? (bot ? "bot" : "staff") : "guest"
                            }`}
                          >
                            <div className="ltc-message-meta" style={fontMontserrat}>
                              <span>{bot ? "Hotel Support Bot" : staff ? "Hotel Admin" : "You"}</span>

                              {msg.concernType ? (
                                <span className="ltc-concern-pill">
                                  {getConcernLabel(msg.concernType)}
                                </span>
                              ) : null}
                            </div>

                            <p className="ltc-message-text" style={fontPoppins}>
                              {msg.message}
                            </p>

                            {shouldShowFaqButton(msg) ? (
                              <button
                                type="button"
                                onClick={() => navigate("/hotel-faqs")}
                                className="ltc-primary-button"
                                style={fontMontserrat}
                              >
                                Go to FAQs
                              </button>
                            ) : null}

                            <p className="ltc-message-time" style={fontPoppins}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <form onSubmit={sendMessage} className="ltc-compose-bar">
                <div className="ltc-compose-row">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                    placeholder={
                      canFreeChat
                        ? "Type your follow-up message..."
                        : "Please send a concern form first..."
                    }
                    rows={2}
                    disabled={!canFreeChat}
                    className="ltc-chat-textarea"
                    style={fontPoppins}
                  />

                  <button
                    type="submit"
                    disabled={sendingMessage || !messageText.trim() || !canFreeChat}
                    className="ltc-primary-button"
                    style={fontMontserrat}
                  >
                    {sendingMessage ? "Sending..." : "Send"}
                  </button>
                </div>
                <p className="ltc-chat-note" style={fontPoppins}>
                  {canFreeChat
                    ? "Press Enter to send. Shift + Enter for a new line."
                    : "The chat box unlocks after you send your concern form."}
                </p>
              </form>
            </div>
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
    <button
      onClick={onClick}
      type="button"
      className="ltc-footer-link"
      style={fontPontano}
    >
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

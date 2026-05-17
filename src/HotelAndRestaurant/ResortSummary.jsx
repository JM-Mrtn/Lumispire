import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BANK_QR_IMAGE = "/bank-transfer-qr.png";
const GCASH_QR_IMAGE = "/gcash-qr.png";
const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-resort-summary-page {
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

  .ltc-resort-summary-page * {
    box-sizing: border-box;
  }

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

  .ltc-hero-title span {
    color: var(--gold-soft);
  }

  .ltc-hero-text {
    max-width: 760px;
    margin: 18px auto 0;
    color: rgba(255,255,255,.80);
    font-size: 17px;
    line-height: 1.8;
  }

  .ltc-section {
    padding: 84px 0;
  }

  .ltc-form-shell {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius);
    background: var(--glass);
    border: 1px solid rgba(255,255,255,.76);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
    padding: 34px;
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

  .ltc-summary-section + .ltc-summary-section,
  .ltc-summary-section + .ltc-payment-section {
    margin-top: 34px;
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

  .ltc-fields-grid {
    margin-top: 24px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap: 18px 22px;
  }

  .ltc-booking-header {
    margin-bottom: 24px;
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 18px;
    flex-wrap: wrap;
  }

  .ltc-service-pill {
    min-height: 44px;
    min-width: 220px;
    border-radius: 999px;
    border: 1px solid rgba(35,95,62,.14);
    background: rgba(255,255,255,.84);
    color: var(--green-800);
    padding: 0 18px;
    font-size: 13px;
    font-weight: 900;
    outline: none;
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
  .ltc-select,
  .ltc-file-input {
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

  .ltc-file-input {
    padding: 11px 18px;
  }

  .ltc-file-input::file-selector-button {
    margin-right: 14px;
    border: 0;
    border-radius: 999px;
    background: rgba(35,95,62,.10);
    color: var(--green-800);
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .ltc-input::placeholder {
    color: rgba(102,112,133,.68);
  }

  .ltc-input:focus,
  .ltc-select:focus,
  .ltc-file-input:focus {
    border-color: var(--green-700);
    background: white;
    box-shadow: 0 0 0 4px rgba(35,95,62,.10);
  }

  .ltc-error-text {
    margin: 7px 0 0;
    color: #b42318;
    font-size: 12px;
    font-weight: 800;
  }

  .ltc-help-text {
    margin: 7px 0 0;
    color: var(--muted);
    font-size: 12px;
    font-weight: 800;
  }

  .ltc-info-box {
    margin-top: 18px;
    border-radius: 18px;
    background: rgba(35,95,62,.08);
    border: 1px solid rgba(35,95,62,.10);
    color: var(--green-800);
    padding: 14px 16px;
    font-size: 13px;
    line-height: 1.65;
    font-weight: 700;
  }

  .ltc-info-box p {
    margin: 0;
  }

  .ltc-info-box p + p {
    margin-top: 3px;
  }

  .ltc-payment-section {
    margin-top: 34px;
  }

  .ltc-payment-grid {
    margin-top: 24px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 18px;
  }

  .ltc-qr-card {
    position: relative;
    width: 100%;
    border-radius: 22px;
    border: 1px solid rgba(35,95,62,.12);
    background: white;
    padding: 18px;
    box-shadow: 0 16px 34px rgba(8,39,25,.08);
    cursor: pointer;
    transition: .25s var(--ease);
  }

  .ltc-qr-card:hover {
    transform: translateY(-4px);
    border-color: rgba(215,168,77,.55);
    box-shadow: 0 22px 44px rgba(8,39,25,.12);
  }

  .ltc-qr-card.selected {
    border-color: var(--green-700);
    box-shadow: 0 0 0 4px rgba(35,95,62,.12), 0 22px 44px rgba(8,39,25,.12);
  }

  .ltc-qr-card.error {
    border-color: rgba(239,68,68,.55);
    box-shadow: 0 0 0 4px rgba(239,68,68,.10), 0 16px 34px rgba(8,39,25,.08);
  }

  .ltc-selected-badge {
    position: absolute;
    right: 16px;
    top: 16px;
    border-radius: 999px;
    background: var(--green-800);
    color: white;
    padding: 7px 12px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    box-shadow: 0 10px 22px rgba(8,39,25,.16);
  }

  .ltc-qr-frame {
    display: grid;
    place-items: center;
    height: 230px;
    border-radius: 18px;
    background: rgba(35,95,62,.08);
    overflow: hidden;
  }

  .ltc-qr-frame img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .ltc-qr-title {
    margin: 14px 0 0;
    color: var(--green-800);
    text-align: center;
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-price-card {
    margin-top: 32px;
    border-radius: 20px;
    background: white;
    border: 1px solid rgba(35,95,62,.10);
    padding: 22px;
    box-shadow: 0 16px 34px rgba(8,39,25,.08);
  }

  .ltc-price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .ltc-price-label,
  .ltc-price-value {
    margin: 0;
    color: var(--green-950);
    font-size: clamp(22px,3vw,30px);
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .ltc-price-breakdown {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(3,minmax(0,1fr));
    gap: 10px;
    color: var(--muted);
    font-size: 12px;
    font-weight: 800;
  }

  .ltc-actions {
    margin-top: 32px;
    display: flex;
    justify-content: center;
    gap: 18px;
    flex-wrap: wrap;
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

  .ltc-secondary-button:active,
  .ltc-secondary-button:focus {
    transform: translateY(-1px) scale(.98);
    color: white;
    background: var(--footer-green);
    border-color: var(--footer-green);
  }

  .ltc-primary-button:disabled,
  .ltc-secondary-button:disabled {
    opacity: .6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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

  .ltc-footer-link:hover {
    color: white;
    text-decoration: underline;
  }

  .ltc-socials {
    display: flex;
    gap: 8px;
  }

  .ltc-socials span {
    width: 26px;
    height: 26px;
    border-radius: 999px;
    background: rgba(255,255,255,.13);
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
    .ltc-fields-grid,
    .ltc-price-breakdown,
    .ltc-payment-grid,
    .ltc-footer-grid {
      grid-template-columns: 1fr;
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

    .ltc-desktop-nav {
      display: none;
    }

    .ltc-menu-button {
      display: grid;
      place-items: center;
    }

    .ltc-hero {
      padding: 76px 0 74px;
    }

    .ltc-section {
      padding: 64px 0;
    }

    .ltc-form-shell {
      padding: 28px 22px;
    }

    .ltc-booking-header,
    .ltc-price-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .ltc-footer {
      padding: 28px 0 12px;
    }

    .ltc-footer-grid {
      gap: 18px;
      padding-bottom: 22px;
    }

    .ltc-footer .ltc-container {
      padding-left: 22px;
      padding-right: 22px;
    }

    .ltc-copyright {
      flex-direction: column;
    }
  }

  @media (max-width: 600px) {
    .ltc-header .ltc-container,
    .ltc-footer .ltc-container {
      padding-left: 16px;
      padding-right: 16px;
    }

    .ltc-logo h1 {
      font-size: 14px;
    }

    .ltc-logo p {
      font-size: 10px;
    }

    .ltc-hero-title {
      font-size: clamp(34px, 11vw, 46px);
      letter-spacing: -.045em;
    }

    .ltc-hero-text {
      font-size: 15px;
    }

    .ltc-form-shell {
      padding: 26px 18px;
    }

    .ltc-primary-button,
    .ltc-secondary-button {
      width: 100%;
    }
  }
`;

function getApiBase() {
  const raw = (
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel`;
  if (raw.includes("/api/hotel")) return raw;

  return `${raw}/api/hotel`;
}

function formatPeso(value) {
  const num = Number(value || 0);

  if (!num) return "₱ 0";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDateMMDDYYYY(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return value || "";
  }

  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}

function safeParseBookingDraft() {
  try {
    return JSON.parse(sessionStorage.getItem("resortBookingDraft") || "null");
  } catch {
    return null;
  }
}

export default function ResortSummary() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const API_BASE = useMemo(() => getApiBase(), []);
  const bookingData = state || safeParseBookingDraft();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isDownPayment, setIsDownPayment] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const fullTotalAmount = Number(
    bookingData?.price || bookingData?.totalAmount || 0
  );

  const amountToPay = isDownPayment
    ? Math.ceil(fullTotalAmount / 2)
    : fullTotalAmount;

  const balanceAmount = isDownPayment ? fullTotalAmount - amountToPay : 0;

  const goToProfile = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");
    navigate(token ? "/hotel-profile" : "/hotel-login");
  };

  const statusClass =
    status.type === "success"
      ? "ltc-status-success"
      : status.type === "error"
      ? "ltc-status-error"
      : "ltc-status-info";

  const handleProofChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setProofFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      setProofFile(null);
      setStatus({
        type: "error",
        message: "Only JPG, PNG, or PDF files are allowed.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProofFile(null);
      setStatus({
        type: "error",
        message: "File size must not exceed 5MB.",
      });
      return;
    }

    setStatus({ type: "", message: "" });
    setProofFile(file);
  };

  const submitBooking = async () => {
    setSubmitAttempted(true);
    setStatus({ type: "", message: "" });

    if (!paymentMethod) {
      setStatus({
        type: "error",
        message: "Please select a payment method by clicking a QR image or choosing from the dropdown.",
      });
      return;
    }

    if (!proofFile) {
      setStatus({
        type: "error",
        message: "Please upload proof of payment.",
      });
      return;
    }

    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) {
      navigate("/hotel-login");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("serviceType", bookingData.serviceType || "Resort & Venue");
      formData.append(
        "packageId",
        bookingData.packageId || bookingData.selectedPackageId || ""
      );
      formData.append(
        "venue",
        bookingData.venue || bookingData.selectedPackageTitle || ""
      );
      formData.append("date", bookingData.date || "");
      formData.append(
        "category",
        bookingData.category ||
          bookingData.selectedVariantLabel ||
          bookingData.selectedDuration ||
          ""
      );
      formData.append("time", bookingData.time || "");
      formData.append(
        "pax",
        String(bookingData.pax || bookingData.totalGuests || "")
      );
      formData.append(
        "totalGuests",
        String(bookingData.totalGuests || bookingData.pax || "")
      );

      formData.append("price", String(fullTotalAmount));
      formData.append("totalAmount", String(fullTotalAmount));
      formData.append("amountToPay", String(amountToPay));
      formData.append("paidAmount", String(amountToPay));
      formData.append("balanceAmount", String(balanceAmount));
      formData.append(
        "paymentTerm",
        isDownPayment ? "DOWN_PAYMENT" : "FULL_PAYMENT"
      );
      formData.append("paymentMethod", paymentMethod);
      formData.append("proof", proofFile);

      const response = await fetch(`${API_BASE}/resort-bookings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("hotelToken");
        navigate("/hotel-login");
        return;
      }

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.message || "Resort booking failed.",
        });
        return;
      }

      sessionStorage.removeItem("resortBookingDraft");

      setStatus({
        type: "success",
        message: "Submitted! Waiting for admin approval.",
      });

      setTimeout(() => {
        navigate("/booking-successful", {
          state: {
            serviceType: "Resort & Venue",
            booking: bookingData,
            amountPaid: amountToPay,
            totalAmount: fullTotalAmount,
            paymentTerm: isDownPayment ? "Down Payment" : "Full Payment",
            paymentMethod,
          },
        });
      }, 1000);
    } catch (error) {
      console.error("submit resort booking error:", error);

      setStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="ltc-resort-summary-page" style={fontPontano}>
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
              alt="Resort booking background"
              className="ltc-hero-slide"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <div className="ltc-container ltc-hero-content">
              <span className="ltc-eyebrow" style={fontMontserrat}>
                Resort & Venue Booking
              </span>

              <h1 className="ltc-hero-title" style={fontMontserrat}>
                No <span>Booking Data</span>
              </h1>

              <p className="ltc-hero-text" style={fontPontano}>
                Please complete the resort booking form first before reviewing your summary.
              </p>
            </div>
          </section>

          <section className="ltc-section">
            <div className="ltc-container">
              <div className="ltc-form-shell" style={{ textAlign: "center" }}>
                <h2 className="ltc-section-heading" style={fontMontserrat}>
                  No Booking Data Found
                </h2>

                <p className="ltc-info-box" style={{ ...fontPoppins, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
                  Please complete the booking form first.
                </p>

                <div className="ltc-actions">
                  <button
                    onClick={() => navigate("/resort-form")}
                    type="button"
                    className="ltc-primary-button"
                    style={fontMontserrat}
                  >
                    Back to Form
                  </button>
                </div>
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

  return (
    <div className="ltc-resort-summary-page" style={fontPontano}>
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
            alt="Resort booking background"
            className="ltc-hero-slide"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ltc-container ltc-hero-content">
            <span className="ltc-eyebrow" style={fontMontserrat}>
              Resort & Venue Booking
            </span>

            <h1 className="ltc-hero-title" style={fontMontserrat}>
              Booking <span>Summary</span>
            </h1>

            <p className="ltc-hero-text" style={fontPontano}>
              Review your resort and venue booking details, choose your payment option,
              and upload your proof of payment before submitting.
            </p>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-form-shell">
              <SummarySection title="Personal Information">
                <ReadOnlyField label="First Name" value={bookingData.firstName} />
                <ReadOnlyField label="Last Name" value={bookingData.lastName} />
                <ReadOnlyField label="Email" value={bookingData.email} />
                <ReadOnlyField label="Phone Number" value={bookingData.phone} />
              </SummarySection>

              <section className="ltc-summary-section">
                <div className="ltc-booking-header">
                  <div>
                    <h2 className="ltc-section-heading" style={fontMontserrat}>
                      Booking Details
                    </h2>
                    <div className="ltc-section-line" />
                  </div>

                  <input
                    value={bookingData.serviceType || "Resort & Venue"}
                    disabled
                    readOnly
                    className="ltc-service-pill"
                    style={fontPoppins}
                  />
                </div>

                <div className="ltc-fields-grid">
                  <ReadOnlyField
                    label="Package"
                    value={
                      bookingData.selectedPackageTitle ||
                      bookingData.selectedPackage ||
                      bookingData.venue
                    }
                  />

                  <ReadOnlyField
                    label="Venue"
                    value={bookingData.venue || bookingData.selectedVenue}
                  />

                  <ReadOnlyField
                    label="Choose Date"
                    value={formatDateMMDDYYYY(bookingData.date)}
                  />

                  <ReadOnlyField
                    label="Variation"
                    value={
                      bookingData.category ||
                      bookingData.selectedVariantLabel ||
                      bookingData.selectedDuration
                    }
                  />

                  <ReadOnlyField label="Time" value={bookingData.time} />

                  <ReadOnlyField
                    label="Number of Pax"
                    value={bookingData.pax || bookingData.totalGuests}
                  />
                </div>
              </section>

              <PaymentSection
                paymentMethod={paymentMethod}
                setPaymentMethod={(value) => {
                  setPaymentMethod(value);
                  setStatus({ type: "", message: "" });
                }}
                isDownPayment={isDownPayment}
                setIsDownPayment={setIsDownPayment}
                proofFile={proofFile}
                handleProofChange={handleProofChange}
                submitAttempted={submitAttempted}
              />

              <div className="ltc-price-card">
                <div className="ltc-price-row">
                  <p className="ltc-price-label" style={fontMontserrat}>
                    Total Amount:
                  </p>

                  <p className="ltc-price-value" style={fontMontserrat}>
                    {formatPeso(amountToPay)}
                  </p>
                </div>

                <div className="ltc-price-breakdown" style={fontPoppins}>
                  <p>Payment type: {isDownPayment ? "Down payment" : "Full payment"}</p>
                  <p>Amount to pay: {formatPeso(amountToPay)}</p>
                  <p>Total balance: {formatPeso(balanceAmount)}</p>
                </div>
              </div>

              {status.message ? (
                <div className={`ltc-status ${statusClass}`} style={fontPoppins}>
                  {status.type === "error" ? (
                    <p style={{ ...fontMontserrat, margin: "0 0 4px" }}>
                      Please fix this before submitting
                    </p>
                  ) : null}
                  <p style={{ margin: 0 }}>{status.message}</p>
                </div>
              ) : null}

              <div className="ltc-actions">
                <button
                  onClick={submitBooking}
                  disabled={loading}
                  type="button"
                  className="ltc-primary-button"
                  style={fontMontserrat}
                >
                  {loading ? "Submitting..." : "Submit Booking"}
                </button>

                <button
                  onClick={() => navigate("/resort-form", { state: bookingData })}
                  disabled={loading}
                  type="button"
                  className="ltc-secondary-button"
                  style={fontMontserrat}
                >
                  Cancel
                </button>
              </div>
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

function PaymentSection({
  paymentMethod,
  setPaymentMethod,
  isDownPayment,
  setIsDownPayment,
  proofFile,
  handleProofChange,
  submitAttempted,
}) {
  const showPaymentMethodError = submitAttempted && !paymentMethod;
  const showProofFileError = submitAttempted && !proofFile;

  return (
    <section className="ltc-payment-section">
      <div className="ltc-booking-header">
        <div>
          <h2 className="ltc-section-heading" style={fontMontserrat}>
            Payment Method
          </h2>
          <div className="ltc-section-line" />
        </div>

        <select
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value)}
          aria-invalid={showPaymentMethodError ? "true" : "false"}
          className="ltc-select"
          style={fontPoppins}
        >
          <option value="">Bank Transfer / GCASH</option>
          <option value="BANK TRANSFER">Bank Transfer</option>
          <option value="GCASH">GCASH</option>
        </select>
      </div>

      {showPaymentMethodError ? (
        <p className="ltc-error-text" style={fontPoppins}>
          Please select a payment method by clicking a QR image or choosing from the dropdown.
        </p>
      ) : null}

      <div className="ltc-info-box" style={fontPoppins}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900 }}>
          <input
            type="checkbox"
            checked={isDownPayment}
            onChange={(event) => setIsDownPayment(event.target.checked)}
            style={{ accentColor: "#174a30", width: 16, height: 16 }}
          />
          Down payment only 50%
        </label>
        <p>Leave unchecked for full payment.</p>
      </div>

      <p className="ltc-help-text" style={{ ...fontPoppins, marginTop: 20 }}>
        Click a QR image to select payment method.
      </p>

      <div className="ltc-payment-grid">
        <QrImageCard
          title="Bank Transfer QR"
          method="BANK TRANSFER"
          src={BANK_QR_IMAGE}
          selected={paymentMethod === "BANK TRANSFER"}
          hasValidationError={showPaymentMethodError}
          onSelect={setPaymentMethod}
        />

        <QrImageCard
          title="GCASH QR"
          method="GCASH"
          src={GCASH_QR_IMAGE}
          selected={paymentMethod === "GCASH"}
          hasValidationError={showPaymentMethodError}
          onSelect={setPaymentMethod}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <FileField
          label="Upload Proof of Payment"
          file={proofFile}
          onChange={handleProofChange}
          showError={showProofFileError}
        />
      </div>
    </section>
  );
}

function QrImageCard({ title, method, src, selected, hasValidationError, onSelect }) {
  const [hasError, setHasError] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(method)}
      className={`ltc-qr-card ${selected ? "selected" : ""} ${
        hasValidationError ? "error" : ""
      }`}
    >
      {selected ? (
        <span className="ltc-selected-badge">Selected</span>
      ) : null}

      <div className="ltc-qr-frame">
        {!hasError ? (
          <img
            src={src}
            alt={title}
            onError={() => setHasError(true)}
          />
        ) : (
          <div style={{ padding: 18, textAlign: "center" }}>
            <p style={{ ...fontMontserrat, margin: 0, color: "#174a30", fontWeight: 900 }}>
              {title}
            </p>
            <p style={{ ...fontPoppins, margin: "4px 0 0", color: "#667085", fontSize: 12 }}>
              Add image in public folder.
            </p>
          </div>
        )}
      </div>

      <p className="ltc-qr-title" style={fontMontserrat}>
        {title}
      </p>
    </button>
  );
}

function Header({ navigate, goToProfile, openMenu }) {
  return (
    <header className="ltc-header">
      <div className="ltc-container ltc-nav">
        <button
          onClick={() => navigate("/hotel-resort")}
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

function SummarySection({ title, children }) {
  return (
    <section className="ltc-summary-section">
      <h2 className="ltc-section-heading" style={fontMontserrat}>
        {title}
      </h2>
      <div className="ltc-section-line" />

      <div className="ltc-fields-grid">{children}</div>
    </section>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="ltc-field">
      <label style={fontMontserrat}>{label}</label>

      <input
        readOnly
        value={value ?? ""}
        placeholder="—"
        className="ltc-input"
        style={fontPoppins}
      />
    </div>
  );
}

function FileField({ label, file, onChange, showError }) {
  return (
    <div className="ltc-field">
      <label style={fontMontserrat}>{label}</label>

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={onChange}
        aria-invalid={showError ? "true" : "false"}
        className="ltc-file-input"
        style={fontPoppins}
      />

      {showError ? (
        <p className="ltc-error-text" style={fontPoppins}>
          Please upload proof of payment.
        </p>
      ) : (
        <p className="ltc-help-text" style={fontPoppins}>
          {file ? file.name : "Accepted: JPG, PNG, PDF. Max 5MB."}
        </p>
      )}
    </div>
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
          <FooterLink onClick={() => (window.location.href = "/hotel-resort")}>
            Home
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/virtual-tour")}>
            Virtual Tour
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-contact-us")}>
            Contact
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-faqs")}>
            FAQs
          </FooterLink>
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

        <MenuItem
          label="HOME"
          onClick={() => {
            onClose();
            navigate("/hotel-resort");
          }}
        />

        <MenuItem
          label="VIRTUAL TOUR"
          onClick={() => {
            onClose();
            navigate("/virtual-tour");
          }}
        />

        <MenuItem
          label="CONTACT"
          onClick={() => {
            onClose();
            navigate("/hotel-contact-us");
          }}
        />

        <MenuItem
          label="FAQS"
          onClick={() => {
            onClose();
            navigate("/hotel-faqs");
          }}
        />

        <MenuItem
          label="PROFILE"
          onClick={() => {
            onClose();
            goToProfile();
          }}
        />
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, active = false }) {
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

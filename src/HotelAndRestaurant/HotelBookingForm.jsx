import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const BOOKING_GAP_MINUTES = 60;
const BOOKING_GAP_MS = BOOKING_GAP_MINUTES * 60 * 1000;

const HOTEL_TIME_SLOTS_BY_DURATION = {
  "8 Hours": [
    "Daytime: 6:00 AM - 2:00 PM",
    "Daytime: 7:00 AM - 3:00 PM",
    "Daytime: 8:00 AM - 4:00 PM",
    "Daytime: 9:00 AM - 5:00 PM",
    "Daytime: 10:00 AM - 6:00 PM",
    "Daytime: 11:00 AM - 7:00 PM",
    "Daytime: 12:00 PM - 8:00 PM",
    "Nighttime: 3:00 PM - 11:00 PM",
    "Nighttime: 4:00 PM - 12:00 AM",
    "Nighttime: 5:00 PM - 1:00 AM next day",
    "Nighttime: 6:00 PM - 2:00 AM next day",
    "Nighttime: 7:00 PM - 3:00 AM next day",
    "Nighttime: 8:00 PM - 4:00 AM next day",
    "Nighttime: 9:00 PM - 5:00 AM next day",
  ],
  "12 Hours": [
    "7:00 AM - 7:00 PM",
    "8:00 AM - 8:00 PM",
    "9:00 AM - 9:00 PM",
    "10:00 AM - 10:00 PM",
    "11:00 AM - 11:00 PM",
    "12:00 PM - 12:00 AM",
    "1:00 PM - 1:00 AM next day",
    "2:00 PM - 2:00 AM next day",
    "3:00 PM - 3:00 AM next day",
    "4:00 PM - 4:00 AM next day",
    "5:00 PM - 5:00 AM next day",
  ],
  "22 Hours": [
    "6:00 AM - 4:00 AM next day",
    "7:00 AM - 5:00 AM next day",
    "8:00 AM - 6:00 AM next day",
  ],
};

const DEFAULT_HOTEL_PACKAGES = [
  {
    _id: "legacy-hotel-nature-8",
    title: "Nature Room - 8 Hours",
    duration: "8 Hours",
    price: 700,
    capacity: "5 pax max",
    displayOrder: 1,
    isActive: true,
    inclusions: ["Nature room", "8 hours stay", "5 pax max"],
  },
  {
    _id: "legacy-hotel-simple-8",
    title: "Simple Room - 8 Hours",
    duration: "8 Hours",
    price: 1500,
    capacity: "3 pax max",
    displayOrder: 2,
    isActive: true,
    inclusions: ["Simple room", "8 hours stay", "3 pax max"],
  },
  {
    _id: "legacy-hotel-nature-12",
    title: "Nature Room - 12 Hours",
    duration: "12 Hours",
    price: 1000,
    capacity: "5 pax max",
    displayOrder: 3,
    isActive: true,
    inclusions: ["Nature room", "12 hours stay", "5 pax max"],
  },
  {
    _id: "legacy-hotel-simple-12",
    title: "Simple Room - 12 Hours",
    duration: "12 Hours",
    price: 2000,
    capacity: "3 pax max",
    displayOrder: 4,
    isActive: true,
    inclusions: ["Simple room", "12 hours stay", "3 pax max"],
  },
  {
    _id: "legacy-hotel-nature-22",
    title: "Nature Room - 22 Hours",
    duration: "22 Hours",
    price: 1500,
    capacity: "5 pax max",
    displayOrder: 5,
    isActive: true,
    inclusions: ["Nature room", "22 hours stay", "5 pax max"],
  },
  {
    _id: "legacy-hotel-simple-22",
    title: "Simple Room - 22 Hours",
    duration: "22 Hours",
    price: 2500,
    capacity: "3 pax max",
    displayOrder: 6,
    isActive: true,
    inclusions: ["Simple room", "22 hours stay", "3 pax max"],
  },
];

const MAX_ADDITIONAL_PAX = 20;
const ADDITIONAL_PAX_RATE = 500;

const DEFAULT_ROOM_RATES = {
  Nature: {
    "8 Hours": 700,
    "12 Hours": 1000,
    "22 Hours": 1500,
  },
  Simple: {
    "8 Hours": 1500,
    "12 Hours": 2000,
    "22 Hours": 2500,
  },
};

const SEASONAL_MARKUP_PERCENT = 10;
const WEEKEND_MARKUP_PERCENT = 5;
const MONTHLY_BOOKING_MARKUP_PERCENT = 1;

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-hotel-booking-page {
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

  .ltc-hotel-booking-page * {
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
    margin-bottom: 22px;
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

  .ltc-form-section + .ltc-booking-section {
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
  .ltc-date-input {
    width: 100%;
    min-height: 50px;
    border-radius: 999px;
    border: 1px solid rgba(35,95,62,.16);
    background: rgba(255,255,255,.88);
    color: var(--dark);
    outline: none;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    padding: 0 18px;
    transition: .25s var(--ease);
    box-shadow: 0 10px 24px rgba(8,39,25,.05);
  }

  .ltc-input::placeholder,
  .ltc-date-input::placeholder {
    color: rgba(16,24,40,.62);
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    font-weight: 700;
    opacity: 1;
  }

  .ltc-input:focus,
  .ltc-select:focus,
  .ltc-date-input:focus {
    border-color: var(--green-700);
    background: white;
    box-shadow: 0 0 0 4px rgba(35,95,62,.10);
  }

  .ltc-select option:disabled {
    color: #b42318;
    background: #fff3f1;
  }

  .ltc-input:disabled,
  .ltc-select:disabled,
  .ltc-date-input:disabled {
    opacity: 1;
    cursor: not-allowed;
    color: rgba(16,24,40,.62);
    background: rgba(255,255,255,.88);
    -webkit-text-fill-color: rgba(16,24,40,.62);
  }

  .ltc-hotel-booking-page .react-datepicker-wrapper,
  .ltc-hotel-booking-page .react-datepicker__input-container {
    width: 100%;
  }

  .ltc-hotel-booking-page .react-datepicker-popper {
    z-index: 9999 !important;
  }

  .ltc-date-input {
    caret-color: transparent;
    cursor: pointer;
  }

  .ltc-error-text {
    margin: 7px 0 0;
    color: #b42318;
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

  .ltc-booked-pills {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ltc-booked-pill,
  .ltc-summary-pill {
    border-radius: 999px;
    background: rgba(35,95,62,.10);
    color: var(--green-800);
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 900;
  }

  .ltc-summary-card,
  .ltc-price-card,
  .ltc-package-card {
    margin-top: 24px;
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

  .ltc-dynamic-grid {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(5, minmax(0,1fr));
    gap: 10px;
  }

  .ltc-dynamic-item {
    border-radius: 16px;
    background: rgba(35,95,62,.08);
    padding: 13px 14px;
  }

  .ltc-dynamic-item p {
    margin: 0;
  }

  .ltc-dynamic-label {
    color: rgba(35,95,62,.72);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-dynamic-value {
    margin-top: 4px !important;
    color: var(--green-800);
    font-size: 14px;
    font-weight: 900;
  }

  .ltc-summary-pill-row {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .ltc-package-card h3,
  .ltc-summary-card h3 {
    margin: 0;
    color: var(--green-800);
    font-size: 16px;
    font-weight: 900;
  }

  .ltc-package-card p {
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
  }

  .ltc-package-card ul {
    margin: 14px 0 0;
    padding-left: 18px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 8px;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
  }

  .ltc-validation-box {
    margin-top: 22px;
    border-radius: 18px;
    border: 1px solid rgba(239,68,68,.22);
    background: rgba(239,68,68,.10);
    padding: 14px 18px;
    color: #b42318;
    font-size: 13px;
    font-weight: 800;
  }

  .ltc-validation-box p {
    margin: 0;
    color: #b42318;
    font-weight: 900;
  }

  .ltc-validation-box ul {
    margin: 8px 0 0;
    padding-left: 18px;
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
  .ltc-secondary-button.clicked {
    transform: translateY(-1px) scale(.98);
    color: white;
    background: var(--footer-green);
    border-color: var(--footer-green);
    box-shadow: 0 10px 24px rgba(8,39,25,.22);
  }

  .ltc-cancel-button {
    color: var(--green-800);
    background: #ffffff;
    border: 1px solid rgba(35,95,62,.2);
  }

  .ltc-cancel-button:hover {
    color: white;
    background: #235f3e;
    border-color: #235f3e;
  }

  .ltc-cancel-button:active,
  .ltc-cancel-button:focus {
    color: white;
    background: #082719;
    border-color: #082719;
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
    .ltc-fields-grid,
    .ltc-price-breakdown,
    .ltc-dynamic-grid,
    .ltc-footer-grid,
    .ltc-package-card ul {
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

function getFallbackRoomPrice(roomType = "", duration = "") {
  const normalizedRoom = normalizeRoomType(roomType);
  const normalizedDuration = normalizeDuration(duration);

  return Number(DEFAULT_ROOM_RATES?.[normalizedRoom]?.[normalizedDuration] || 0);
}

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

function normalizeRoomType(title = "") {
  const lower = String(title || "").toLowerCase();

  if (lower.includes("nature")) return "Nature";
  if (lower.includes("simple")) return "Simple";

  return (
    String(title || "Room")
      .replace(/\s*-\s*\d+\s*hours?/i, "")
      .replace(/\s+\d+\s*hours?/i, "")
      .trim() || "Room"
  );
}

function normalizeDuration(value = "") {
  const text = String(value || "").toLowerCase();

  if (text.includes("8")) return "8 Hours";
  if (text.includes("12")) return "12 Hours";
  if (text.includes("22")) return "22 Hours";

  return String(value || "").trim();
}

function parseMaxPax(capacity = "") {
  const matches = String(capacity || "").match(/\d+/g);
  if (!matches || !matches.length) return null;

  const numbers = matches
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);

  if (!numbers.length) return null;

  return Math.max(...numbers);
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

function toLocalISO(dateObj) {
  if (!dateObj) return "";

  const tz = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - tz).toISOString().slice(0, 10);
}

function getDatePartsFromISO(dateString = "") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateString || ""))) {
    return null;
  }

  const [year, month, day] = String(dateString).split("-").map(Number);

  if (!year || !month || !day) return null;

  return { year, month, day };
}

function getMonthKey(dateString = "") {
  const parts = getDatePartsFromISO(dateString);
  if (!parts) return "";

  return `${parts.year}-${String(parts.month).padStart(2, "0")}`;
}

function isJuneOrBerMonth(dateString = "") {
  const parts = getDatePartsFromISO(dateString);
  if (!parts) return false;

  return parts.month === 6 || parts.month >= 9;
}

function isWeekendDate(dateString = "") {
  const parts = getDatePartsFromISO(dateString);
  if (!parts) return false;

  const date = new Date(parts.year, parts.month - 1, parts.day);
  const day = date.getDay();

  return day === 0 || day === 6;
}

function countSameMonthBookings(bookings = [], dateString = "") {
  const targetMonth = getMonthKey(dateString);
  if (!targetMonth) return 0;

  return bookings.filter((booking) => {
    const status = String(booking?.status || "CONFIRMED").toUpperCase();
    if (status && status !== "CONFIRMED") return false;

    return getMonthKey(booking?.date) === targetMonth;
  }).length;
}

function calculateDynamicPrice({ basePrice = 0, date = "", monthlyBookingCount = 0 }) {
  const safeBasePrice = Number(basePrice || 0);
  const safeMonthlyCount = Math.max(0, Number(monthlyBookingCount || 0));

  const seasonalIncreasePercent = isJuneOrBerMonth(date)
    ? SEASONAL_MARKUP_PERCENT
    : 0;
  const weekendIncreasePercent = isWeekendDate(date)
    ? WEEKEND_MARKUP_PERCENT
    : 0;
  const monthlyBookingIncreasePercent = safeMonthlyCount * MONTHLY_BOOKING_MARKUP_PERCENT;
  const totalIncreasePercent =
    seasonalIncreasePercent + weekendIncreasePercent + monthlyBookingIncreasePercent;

  return {
    basePrice: safeBasePrice,
    finalPrice: safeBasePrice
      ? Math.round(safeBasePrice * (1 + totalIncreasePercent / 100))
      : 0,
    hasDate: Boolean(getDatePartsFromISO(date)),
    seasonalIncreasePercent,
    weekendIncreasePercent,
    monthlyBookingIncreasePercent,
    monthlyBookingCount: safeMonthlyCount,
    totalIncreasePercent,
    isSeasonalRate: seasonalIncreasePercent > 0,
    isWeekendRate: weekendIncreasePercent > 0,
  };
}

function PricingBreakdown({ pricing }) {
  if (!pricing?.basePrice) return null;

  const hasSelectedDate = Boolean(pricing.hasDate);

  return (
    <div className="ltc-summary-card">
      <div className="ltc-price-row">
        <div>
          <h3 style={fontMontserrat}>Dynamic Price</h3>
          <p className="ltc-info-box" style={fontPoppins}>
            June and Ber months add 10%, weekends add 5%, and every confirmed
            booking in the same month adds 1%.
          </p>
        </div>

        <div>
          <p className="ltc-price-label" style={fontMontserrat}>
            Total Amount
          </p>
          <p className="ltc-price-value" style={fontMontserrat}>
            {formatPeso(pricing.finalPrice)}
          </p>
        </div>
      </div>

      <div className="ltc-dynamic-grid">
        <DynamicItem label="Base Price" value={formatPeso(pricing.basePrice)} />
        <DynamicItem label="Seasonal" value={`+${pricing.seasonalIncreasePercent}%`} />
        <DynamicItem label="Weekend" value={`+${pricing.weekendIncreasePercent}%`} />
        <DynamicItem
          label="Monthly Demand"
          value={`+${pricing.monthlyBookingIncreasePercent}%`}
        />
        <DynamicItem label="Total Increase" value={`+${pricing.totalIncreasePercent}%`} />
      </div>

      {!hasSelectedDate ? (
        <p className="ltc-error-text" style={fontPoppins}>
          Select a date to see seasonal and weekend adjustments.
        </p>
      ) : null}
    </div>
  );
}

function DynamicItem({ label, value }) {
  return (
    <div className="ltc-dynamic-item">
      <p className="ltc-dynamic-label" style={fontMontserrat}>
        {label}
      </p>
      <p className="ltc-dynamic-value" style={fontPoppins}>
        {value}
      </p>
    </div>
  );
}

function isoToLocalDateObj(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function parseTimeToMinutes(value = "") {
  const clean = String(value)
    .replace(/next day/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (hour === 12) hour = 0;
  if (meridiem === "PM") hour += 12;

  return hour * 60 + minute;
}

function stripTimePrefix(value = "") {
  return String(value || "")
    .replace(/^daytime:\s*/i, "")
    .replace(/^nighttime:\s*/i, "")
    .replace(/^overnight:\s*/i, "")
    .replace(/^8 hours:\s*/i, "")
    .replace(/^12 hours:\s*/i, "")
    .replace(/^22 hours:\s*/i, "")
    .replace(/^full-day:\s*/i, "")
    .trim();
}

function parseTimeRange(value = "") {
  const clean = stripTimePrefix(value);
  const parts = clean.split(/\s*-\s*/);

  if (parts.length !== 2) return null;

  const startMinutes = parseTimeToMinutes(parts[0]);
  let endMinutes = parseTimeToMinutes(parts[1]);

  if (startMinutes === null || endMinutes === null) return null;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return {
    startMinutes,
    endMinutes,
  };
}

function dateToPhMidnight(dateString) {
  return new Date(`${dateString}T00:00:00+08:00`);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function buildInterval(date, time) {
  const range = parseTimeRange(time);

  if (!range) return null;

  const base = dateToPhMidnight(date);

  return {
    startDateTime: addMinutes(base, range.startMinutes),
    endDateTime: addMinutes(base, range.endMinutes),
  };
}

function intervalsOverlap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart < bEnd + BOOKING_GAP_MS && bStart < aEnd + BOOKING_GAP_MS;
}

function getDurationOrder(duration = "") {
  const normalized = normalizeDuration(duration);
  if (normalized === "8 Hours") return 1;
  if (normalized === "12 Hours") return 2;
  if (normalized === "22 Hours") return 3;
  return 99;
}

function normalizePackage(pkg = {}) {
  return {
    ...pkg,
    duration: normalizeDuration(pkg.duration),
    roomType: normalizeRoomType(pkg.title),
    maxPax: parseMaxPax(pkg.capacity),
    timeSlots:
      Array.isArray(pkg.timeSlots) && pkg.timeSlots.length
        ? pkg.timeSlots
        : HOTEL_TIME_SLOTS_BY_DURATION[normalizeDuration(pkg.duration)] || [],
  };
}

function expandHotelPackages(list = []) {
  const expanded = [];

  list.forEach((pkg) => {
    const activeVariants = Array.isArray(pkg.variants)
      ? pkg.variants.filter((variant) => variant?.isActive !== false)
      : [];

    if (activeVariants.length) {
      activeVariants.forEach((variant, index) => {
        const duration = normalizeDuration(variant.label);
        const timeSlots =
          Array.isArray(variant.timeSlots) && variant.timeSlots.length
            ? variant.timeSlots
            : HOTEL_TIME_SLOTS_BY_DURATION[duration] || [];

        expanded.push(
          normalizePackage({
            ...pkg,
            _id: pkg._id,
            variantId: variant._id || `${pkg._id}-${duration}`,
            title: pkg.title,
            duration,
            price: Number(variant.price || 0),
            displayOrder:
              Number(pkg.displayOrder || 0) * 100 +
              Number(variant.displayOrder || index + 1),
            timeSlots,
          })
        );
      });

      return;
    }

    expanded.push(normalizePackage(pkg));
  });

  return expanded;
}

export default function HotelBookingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = useMemo(() => getApiBase(), []);
  const presetAppliedRef = useRef(false);

  const presetPackageId = location.state?.selectedPackageId || "";
  const presetPackageTitle =
    location.state?.selectedPackage ||
    location.state?.selectedPackageTitle ||
    "";
  const presetRoomType =
    location.state?.selectedRoomType || presetPackageTitle
      ? normalizeRoomType(location.state?.selectedRoomType || presetPackageTitle)
      : "";

  const [packages, setPackages] = useState(
    expandHotelPackages(DEFAULT_HOTEL_PACKAGES)
  );
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [timeAvailabilityMap, setTimeAvailabilityMap] = useState({});
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceType: "Hotel & Condo",
    packageId: presetPackageId,
    packageTitle: presetPackageTitle,
    roomType: presetRoomType,
    duration: "",
    date: "",
    time: "",
    pax: "",
  });

  const todayLocalISO = useMemo(() => toLocalISO(new Date()), []);

  const oneYearAheadISO = useMemo(() => {
    const d = isoToLocalDateObj(todayLocalISO);
    d.setDate(d.getDate() + 365);
    return toLocalISO(d);
  }, [todayLocalISO]);

  const selectedDateObj = useMemo(() => isoToLocalDateObj(form.date), [form.date]);
  const minDateObj = useMemo(() => isoToLocalDateObj(todayLocalISO), [todayLocalISO]);

  const roomTypeOptions = useMemo(() => {
    return [
      ...new Set(
        packages
          .filter((item) => item?.isActive !== false)
          .map((item) => normalizeRoomType(item.title))
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [packages]);

  const roomPackages = useMemo(() => {
    return packages
      .filter((item) => item?.isActive !== false)
      .map(normalizePackage)
      .filter((item) => item.roomType === form.roomType)
      .sort(
        (a, b) =>
          getDurationOrder(a.duration) - getDurationOrder(b.duration) ||
          Number(a.displayOrder || 0) - Number(b.displayOrder || 0)
      );
  }, [packages, form.roomType]);

  const selectedPackage = useMemo(() => {
    if (!form.roomType || !form.duration) return null;

    return (
      roomPackages.find((item) => item.duration === normalizeDuration(form.duration)) ||
      roomPackages.find((item) => String(item._id) === String(form.packageId)) ||
      null
    );
  }, [roomPackages, form.roomType, form.duration, form.packageId]);

  const durationVariants = useMemo(() => {
    const seen = new Set();

    return roomPackages
      .filter((pkg) => {
        if (seen.has(pkg.duration)) return false;
        seen.add(pkg.duration);
        return true;
      })
      .map((pkg) => ({
        label: pkg.duration,
        package: pkg,
        price: Number(pkg.price || 0),
        maxPax: pkg.maxPax || parseMaxPax(pkg.capacity),
        timeSlots: pkg.timeSlots,
      }));
  }, [roomPackages]);

  const selectedVariant = useMemo(() => {
    if (!form.duration) return null;

    return (
      durationVariants.find((item) => item.label === normalizeDuration(form.duration)) ||
      null
    );
  }, [durationVariants, form.duration]);

  const basePrice =
    Number(selectedVariant?.price || selectedPackage?.price || 0) ||
    getFallbackRoomPrice(form.roomType, form.duration) ||
    0;

  const monthlyConfirmedBookingCount = useMemo(() => {
    return countSameMonthBookings(confirmedBookings, form.date);
  }, [confirmedBookings, form.date]);

  const dynamicPricing = useMemo(() => {
    return calculateDynamicPrice({
      basePrice,
      date: form.date,
      monthlyBookingCount: monthlyConfirmedBookingCount,
    });
  }, [basePrice, form.date, monthlyConfirmedBookingCount]);

  const baseAmount = dynamicPricing.finalPrice || null;
  const baseMaxPax =
    Number(selectedVariant?.maxPax || selectedPackage?.maxPax || 0) || null;
  const maxPax = baseMaxPax ? baseMaxPax + MAX_ADDITIONAL_PAX : null;
  const selectedAdditionalPax = Number(form.pax || 0);
  const additionalPax = Math.max(0, Math.min(MAX_ADDITIONAL_PAX, selectedAdditionalPax));
  const totalGuests = baseMaxPax ? baseMaxPax + additionalPax : additionalPax;
  const additionalPaxCharge = additionalPax * ADDITIONAL_PAX_RATE;
  const price = baseAmount ? baseAmount + additionalPaxCharge : null;

  const timeOptions = useMemo(() => {
    return (selectedVariant?.timeSlots || []).map((time) => ({
      value: time,
      label: time,
    }));
  }, [selectedVariant]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setStatus({ type: "", message: "" });
  };

  const setAdditionalPaxValue = (value) => {
    const numericValue = Number(value || 0);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
      setField("pax", "0");
      return;
    }

    if (numericValue > MAX_ADDITIONAL_PAX) {
      setField("pax", String(MAX_ADDITIONAL_PAX));
      return;
    }

    setField("pax", String(numericValue));
  };

  const applyRoomType = (roomType) => {
    const normalized = normalizeRoomType(roomType);

    setForm((prev) => ({
      ...prev,
      roomType: normalized,
      packageId: "",
      packageTitle: "",
      duration: "",
      date: "",
      time: "",
      pax: "",
    }));

    setErrors({});
    setStatus({ type: "", message: "" });
  };

  const isTimeOptionBlocked = (date, time) => {
    if (!date || !time) return false;

    const target = buildInterval(date, time);
    if (!target) return false;

    return confirmedBookings.some((booking) => {
      const booked =
        booking.startDateTime && booking.endDateTime
          ? {
              startDateTime: new Date(booking.startDateTime),
              endDateTime: new Date(booking.endDateTime),
            }
          : buildInterval(booking.date, booking.time);

      if (!booked?.startDateTime || !booked?.endDateTime) return false;

      return intervalsOverlap(
        target.startDateTime,
        target.endDateTime,
        booked.startDateTime,
        booked.endDateTime
      );
    });
  };

  const isVariantFullyBlocked = (variant, date) => {
    if (!date || !variant?.timeSlots?.length) return false;
    return variant.timeSlots.every((time) => isTimeOptionBlocked(date, time));
  };

  const isDateFullyBlocked = (date) => {
    if (!date || !form.roomType || !durationVariants.length) return false;
    return durationVariants.every((variant) => isVariantFullyBlocked(variant, date));
  };

  const variationOptions = useMemo(() => {
    return durationVariants.map((variant) => {
      const disabled = form.date ? isVariantFullyBlocked(variant, form.date) : false;

      return {
        value: variant.label,
        label: `${variant.label}${disabled ? " — FULLY BOOKED" : ""}`,
        disabled,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationVariants, form.date, confirmedBookings]);

  const selectedVariationFullyBlocked = useMemo(() => {
    if (!form.date || !selectedVariant) return false;
    return isVariantFullyBlocked(selectedVariant, form.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, selectedVariant, confirmedBookings]);

  const allVariationsFullyBlocked = useMemo(() => {
    if (!form.date || !durationVariants.length) return false;
    return durationVariants.every((variant) => isVariantFullyBlocked(variant, form.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, durationVariants, confirmedBookings]);

  const getTimeAvailabilityKey = (time) => {
    return [
      form.roomType || "",
      normalizeDuration(form.duration) || "",
      form.date || "",
      time || "",
    ].join("|");
  };

  const availableTimeOptions = useMemo(() => {
    return timeOptions.map((option) => {
      const key = getTimeAvailabilityKey(option.value);
      const backendBlocked = timeAvailabilityMap[key] === false;
      const localBlocked = isTimeOptionBlocked(form.date, option.value);
      const disabled = backendBlocked || localBlocked;

      return {
        ...option,
        disabled,
        label: `${option.label}${disabled ? " — BOOKED / TOO CLOSE" : ""}`,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeOptions, form.date, form.roomType, form.duration, confirmedBookings, timeAvailabilityMap]);

  const selectedTimeIsBlocked = useMemo(() => {
    if (!form.date || !form.time) return false;

    const key = getTimeAvailabilityKey(form.time);
    return timeAvailabilityMap[key] === false || isTimeOptionBlocked(form.date, form.time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, form.time, form.roomType, form.duration, confirmedBookings, timeAvailabilityMap]);

  const selectedDateBlockedBookings = useMemo(() => {
    if (!form.date) return [];

    return confirmedBookings.filter((booking) => {
      return durationVariants.some((variant) => {
        return variant.timeSlots.some((time) => {
          const target = buildInterval(form.date, time);
          const booked =
            booking.startDateTime && booking.endDateTime
              ? {
                  startDateTime: new Date(booking.startDateTime),
                  endDateTime: new Date(booking.endDateTime),
                }
              : buildInterval(booking.date, booking.time);

          if (!target || !booked) return false;

          return intervalsOverlap(
            target.startDateTime,
            target.endDateTime,
            booked.startDateTime,
            booked.endDateTime
          );
        });
      });
    });
  }, [form.date, durationVariants, confirmedBookings]);

  const fetchPackages = async () => {
    setLoadingPackages(true);

    try {
      const res = await fetch(`${API_BASE}/packages?type=hotel_condo`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || "Failed to load hotel packages.");

      const list = Array.isArray(data.packages)
        ? data.packages.filter((item) => item?.isActive !== false)
        : [];

      const sorted = expandHotelPackages(list.length ? list : DEFAULT_HOTEL_PACKAGES).sort(
        (a, b) =>
          Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
          String(a.title || "").localeCompare(String(b.title || ""))
      );

      setPackages(sorted);
    } catch (error) {
      console.error("fetch hotel packages error:", error);
      setPackages(expandHotelPackages(DEFAULT_HOTEL_PACKAGES));
      setStatus({
        type: "error",
        message:
          "Could not load updated Hotel & Condo packages. Showing default packages for now.",
      });
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) {
      navigate("/hotel-login");
      return;
    }

    setLoadingProfile(true);

    try {
      const res = await fetch(`${API_BASE}/hotel-user-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("hotelToken");
        navigate("/hotel-login");
        return;
      }

      const profile = data.user || data.hotelUser || data.profile || data;

      setForm((prev) => ({
        ...prev,
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || profile.contactNumber || "",
      }));
    } catch (error) {
      console.error("fetch profile error:", error);
      setStatus({
        type: "error",
        message: "Could not load profile. Please try again.",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchRoomCalendar = async (roomType) => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) {
      navigate("/hotel-login");
      return;
    }

    if (!roomType) {
      setConfirmedBookings([]);
      return;
    }

    setLoadingCalendar(true);

    try {
      const qs = new URLSearchParams({
        roomType,
        from: todayLocalISO,
        to: oneYearAheadISO,
      }).toString();

      const res = await fetch(`${API_BASE}/hotel-room-bookings/booked-dates?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setConfirmedBookings([]);
        return;
      }

      setConfirmedBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (error) {
      console.error("fetch hotel room calendar error:", error);
      setConfirmedBookings([]);
    } finally {
      setLoadingCalendar(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (presetAppliedRef.current || !packages.length) return;

    if (!presetRoomType && !presetPackageId && !presetPackageTitle) {
      setForm((prev) => ({
        ...prev,
        packageId: "",
        packageTitle: "",
        roomType: "",
        duration: "",
        date: "",
        time: "",
        pax: "",
      }));

      presetAppliedRef.current = true;
      return;
    }

    const matchedById = presetPackageId
      ? packages.find((item) => String(item._id) === String(presetPackageId))
      : null;

    const matchedByRoom = presetRoomType
      ? packages.find((item) => normalizeRoomType(item.title) === presetRoomType)
      : null;

    const matched = matchedById || matchedByRoom;

    setForm((prev) => ({
      ...prev,
      packageId: matched?._id || presetPackageId || "",
      packageTitle: matched?.title || presetPackageTitle || "",
      roomType: matched ? normalizeRoomType(matched.title) : presetRoomType,
      duration: "",
      date: "",
      time: "",
      pax: "",
    }));

    presetAppliedRef.current = true;
  }, [packages, presetPackageId, presetPackageTitle, presetRoomType]);

  useEffect(() => {
    if (!form.roomType) {
      setConfirmedBookings([]);
      setTimeAvailabilityMap({});
      return;
    }

    fetchRoomCalendar(form.roomType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.roomType]);

  useEffect(() => {
    const controller = new AbortController();

    const checkTimeSlots = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

      if (
        !token ||
        !form.roomType ||
        !form.duration ||
        !form.date ||
        !timeOptions.length
      ) {
        setTimeAvailabilityMap({});
        setLoadingTimeSlots(false);
        return;
      }

      setLoadingTimeSlots(true);

      try {
        const entries = await Promise.all(
          timeOptions.map(async (option) => {
            const key = [
              form.roomType || "",
              normalizeDuration(form.duration) || "",
              form.date || "",
              option.value || "",
            ].join("|");

            try {
              const qs = new URLSearchParams({
                packageId: selectedVariant?.package?._id || selectedPackage?._id || form.packageId || "",
                roomType: form.roomType,
                duration: normalizeDuration(form.duration),
                date: form.date,
                time: option.value,
              }).toString();

              const res = await fetch(`${API_BASE}/hotel-room-bookings/check?${qs}`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
              });

              const data = await res.json().catch(() => ({}));

              if (!res.ok) {
                return [key, false];
              }

              return [key, Boolean(data.available)];
            } catch (error) {
              if (error.name === "AbortError") return null;
              return [key, false];
            }
          })
        );

        const nextMap = {};

        entries.filter(Boolean).forEach(([key, available]) => {
          nextMap[key] = available;
        });

        setTimeAvailabilityMap(nextMap);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTimeSlots(false);
        }
      }
    };

    checkTimeSlots();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    API_BASE,
    form.roomType,
    form.duration,
    form.date,
    form.packageId,
    selectedPackage?._id,
    selectedVariant?.package?._id,
    timeOptions,
  ]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      time: "",
      pax: "",
    }));
    setErrors((prev) => ({ ...prev, time: "", pax: "" }));
  }, [form.duration, form.date]);

  useEffect(() => {
    if (!form.time || !selectedTimeIsBlocked) return;

    setForm((prev) => ({
      ...prev,
      time: "",
      pax: "",
    }));

    setErrors((prev) => ({
      ...prev,
      time:
        "That time slot is unavailable or too close to an approved booking. Please choose another time.",
      pax: "",
    }));
  }, [form.time, selectedTimeIsBlocked]);

  useEffect(() => {
    if (!form.date || !durationVariants.length) return;

    const current = durationVariants.find(
      (variant) => variant.label === normalizeDuration(form.duration)
    );

    if (!current || !isVariantFullyBlocked(current, form.date)) return;

    setForm((prev) => ({
      ...prev,
      packageId: "",
      packageTitle: "",
      duration: "",
      time: "",
      pax: "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, durationVariants, confirmedBookings]);

  const checkAvailability = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) return { ok: false, message: "Unauthorized." };

    const qs = new URLSearchParams({
      packageId: selectedPackage?._id || form.packageId || "",
      roomType: form.roomType,
      duration: normalizeDuration(form.duration),
      date: form.date,
      time: form.time,
    }).toString();

    const res = await fetch(`${API_BASE}/hotel-room-bookings/check?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        message: data.message || "Failed to check availability.",
      };
    }

    return {
      ok: true,
      available: Boolean(data.available),
      message: data.message || "",
    };
  };

  const validate = () => {
    const next = {};

    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";

    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Invalid email format.";
    }

    if (!form.phone.trim()) {
      next.phone = "Phone number is required.";
    } else if (!/^09\d{9}$/.test(form.phone)) {
      next.phone = "Phone must be 11 digits and start with 09.";
    }

    if (!form.roomType) next.roomType = "Select room.";

    if (!form.duration) {
      next.duration = "Select variation.";
    } else if (selectedVariationFullyBlocked) {
      next.duration = "This variation is fully booked for the selected date.";
    }

    if (!form.date) {
      next.date = "Choose a date.";
    } else if (form.date < todayLocalISO) {
      next.date = "Date cannot be in the past.";
    } else if (isDateFullyBlocked(form.date)) {
      next.date = "All variations are already booked for this date.";
    }

    if (!form.time) {
      next.time = selectedVariationFullyBlocked
        ? "This variation is fully booked. Please choose another variation."
        : "Choose time.";
    } else if (selectedTimeIsBlocked) {
      next.time =
        "This time slot is unavailable or too close to an approved booking. Please choose another time.";
    }

    const pax = Number(form.pax || 0);

    if (!form.time) {
      next.pax = "Choose a time before selecting additional pax.";
    } else if (form.pax === "") {
      next.pax = "Select additional pax.";
    } else if (!Number.isFinite(pax) || pax < 0) {
      next.pax = "Additional pax must be 0 or more.";
    } else if (pax > MAX_ADDITIONAL_PAX) {
      next.pax = `Additional pax is limited to ${MAX_ADDITIONAL_PAX}.`;
    }

    if (!price) next.price = "Price cannot be computed.";

    return next;
  };

  const handleProceed = async () => {
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    const validation = validate();
    setErrors(validation);

    if (Object.keys(validation).length) {
      setSubmitting(false);
      return;
    }

    try {
      const availability = await checkAvailability();

      if (!availability.ok) {
        setStatus({
          type: "error",
          message: availability.message || "Could not check availability.",
        });
        setSubmitting(false);
        return;
      }

      if (!availability.available) {
        setErrors((prev) => ({
          ...prev,
          time:
            availability.message ||
            "This time slot is unavailable or too close to an approved booking. Please choose another time.",
        }));

        setStatus({
          type: "error",
          message:
            availability.message ||
            "Selected room slot is not available. Please choose another time slot.",
        });

        setSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("availability error:", error);

      setStatus({
        type: "error",
        message: "Network error while checking availability.",
      });

      setSubmitting(false);
      return;
    }

    const payload = {
      ...form,
      packageId: selectedPackage?._id || form.packageId,
      selectedPackageId: selectedPackage?._id || form.packageId,
      selectedPackage: selectedPackage?.title || form.packageTitle,
      selectedPackageTitle: selectedPackage?.title || form.packageTitle,
      selectedCapacity: selectedPackage?.capacity || "",
      selectedInclusions: selectedPackage?.inclusions || [],
      roomType: form.roomType,
      duration: normalizeDuration(form.duration),
      pax: totalGuests,
      totalGuests,
      baseMaxPax,
      maxPax: maxPax || totalGuests,
      maxAdditionalPax: MAX_ADDITIONAL_PAX,
      additionalPax,
      additionalPaxRate: ADDITIONAL_PAX_RATE,
      additionalPaxCharge,
      basePrice,
      baseAmount,
      price,
      totalAmount: price,
      dynamicPricing,
      seasonalIncreasePercent: dynamicPricing.seasonalIncreasePercent,
      weekendIncreasePercent: dynamicPricing.weekendIncreasePercent,
      monthlyBookingIncreasePercent: dynamicPricing.monthlyBookingIncreasePercent,
      monthlyConfirmedBookings: dynamicPricing.monthlyBookingCount,
      totalIncreasePercent: dynamicPricing.totalIncreasePercent,
    };

    sessionStorage.setItem("hotelBookingDraft", JSON.stringify(payload));
    navigate("/hotel-booking-summary", { state: payload });

    setSubmitting(false);
  };

  const statusClass =
    status.type === "success"
      ? "ltc-status-success"
      : status.type === "error"
      ? "ltc-status-error"
      : "ltc-status-info";

  const bottomValidationMessages = useMemo(() => {
    const messages = Object.values(errors)
      .map((item) => String(item || "").trim())
      .filter(Boolean);

    return [...new Set(messages)];
  }, [errors]);

  const goToProfile = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");
    navigate(token ? "/hotel-profile" : "/hotel-login");
  };

  return (
    <div className="ltc-hotel-booking-page" style={fontPontano}>
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
            alt="Hotel booking background"
            className="ltc-hero-slide"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ltc-container ltc-hero-content">
            <span className="ltc-eyebrow" style={fontMontserrat}>
              Hotel & Condo Booking
            </span>

            <h1 className="ltc-hero-title" style={fontMontserrat}>
              Hotel <span>Booking</span>
            </h1>

            <p className="ltc-hero-text" style={fontPontano}>
              Complete your hotel and condo booking details, check room availability,
              and review your final amount before proceeding.
            </p>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-form-shell">
              {status.message ? (
                <div className={`ltc-status ${statusClass}`} style={fontPoppins}>
                  {status.message}
                </div>
              ) : null}

              <FormSection title="Personal Details">
                <Field
                  label="First Name"
                  value={form.firstName}
                  disabled={loadingProfile}
                  error={errors.firstName}
                  placeholder="Enter first name"
                  onChange={(v) =>
                    setField("firstName", v.replace(/[^A-Za-z\s]/g, "").slice(0, 30))
                  }
                />

                <Field
                  label="Last Name"
                  value={form.lastName}
                  disabled={loadingProfile}
                  error={errors.lastName}
                  placeholder="Enter last name"
                  onChange={(v) =>
                    setField("lastName", v.replace(/[^A-Za-z\s]/g, "").slice(0, 30))
                  }
                />

                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  disabled={loadingProfile}
                  error={errors.email}
                  placeholder="Enter email"
                  onChange={(v) => setField("email", v.replace(/\s/g, "").slice(0, 60))}
                />

                <Field
                  label="Phone Number"
                  value={form.phone}
                  disabled={loadingProfile}
                  error={errors.phone}
                  placeholder="09XXXXXXXXX"
                  inputMode="numeric"
                  onChange={(v) => setField("phone", v.replace(/\D/g, "").slice(0, 11))}
                />
              </FormSection>

              <div className="ltc-booking-section">
                <div className="ltc-booking-header">
                  <div>
                    <h2 className="ltc-section-heading" style={fontMontserrat}>
                      Booking Details
                    </h2>
                    <div className="ltc-section-line" />
                  </div>

                  <input
                    value="Hotel & Condo"
                    disabled
                    readOnly
                    className="ltc-service-pill"
                    style={fontPoppins}
                  />
                </div>

                <div className="ltc-fields-grid">
                  <SelectField
                    label="Choose Room Type"
                    value={form.roomType}
                    onChange={applyRoomType}
                    options={roomTypeOptions}
                    placeholder={loadingPackages ? "Loading rooms..." : "Select room"}
                    error={errors.roomType}
                    disabled={loadingPackages}
                  />

                  <DateField
                    label="Choose Date"
                    placeholder={
                      !form.roomType
                        ? "Select room first"
                        : loadingCalendar
                        ? "Loading available dates..."
                        : "Select date"
                    }
                    selectedDateObj={selectedDateObj}
                    minDateObj={minDateObj}
                    disabled={!form.roomType || loadingCalendar}
                    error={errors.date}
                    filterDate={(d) => !isDateFullyBlocked(toLocalISO(d))}
                    onChange={(d) => {
                      setForm((prev) => ({
                        ...prev,
                        date: d ? toLocalISO(d) : "",
                        duration: "",
                        time: "",
                        pax: "",
                      }));
                      setErrors((prev) => ({ ...prev, date: "", duration: "", time: "", pax: "" }));
                      setStatus({ type: "", message: "" });
                    }}
                  />

                  <SelectField
                    label="Variation"
                    value={form.duration}
                    onChange={(value) => {
                      const selected = durationVariants.find((item) => item.label === value);

                      setForm((prev) => ({
                        ...prev,
                        packageId: selected?.package?._id || "",
                        packageTitle: selected?.package?.title || "",
                        duration: value,
                        time: "",
                        pax: "",
                      }));

                      setErrors((prev) => ({ ...prev, duration: "", time: "", pax: "" }));
                      setStatus({ type: "", message: "" });
                    }}
                    options={variationOptions.map((item) => item.value)}
                    optionLabelMap={Object.fromEntries(
                      variationOptions.map((item) => [item.value, item.label])
                    )}
                    disabledOptions={variationOptions
                      .filter((item) => item.disabled)
                      .map((item) => item.value)}
                    placeholder={
                      !form.roomType
                        ? "Select room first"
                        : !form.date
                        ? "Select date first"
                        : allVariationsFullyBlocked
                        ? "Fully booked"
                        : "Select variation"
                    }
                    error={errors.duration}
                    disabled={!form.roomType || !form.date || !variationOptions.length || allVariationsFullyBlocked}
                  />

                  <SelectField
                    label="Time"
                    value={form.time}
                    onChange={(value) => {
                      const selected = availableTimeOptions.find(
                        (item) => item.value === value
                      );

                      if (selected?.disabled) {
                        setForm((prev) => ({ ...prev, time: "", pax: "" }));
                        setErrors((prev) => ({
                          ...prev,
                          time:
                            "That time slot is unavailable or too close to an approved booking. Please choose another time.",
                          pax: "",
                        }));
                        return;
                      }

                      setForm((prev) => ({ ...prev, time: value, pax: value ? "0" : "" }));
                      setErrors((prev) => ({ ...prev, time: "", pax: "" }));
                      setStatus({ type: "", message: "" });
                    }}
                    options={availableTimeOptions.map((item) => item.value)}
                    optionLabelMap={Object.fromEntries(
                      availableTimeOptions.map((item) => [item.value, item.label])
                    )}
                    disabledOptions={availableTimeOptions
                      .filter((item) => item.disabled)
                      .map((item) => item.value)}
                    placeholder={
                      !form.roomType
                        ? "Select room first"
                        : !form.date
                        ? "Select date first"
                        : !form.duration
                        ? "Select variation first"
                        : selectedVariationFullyBlocked
                        ? "This variation is fully booked"
                        : loadingTimeSlots
                        ? "Checking available times..."
                        : availableTimeOptions.length &&
                          availableTimeOptions.every((item) => item.disabled)
                        ? "No available time slots"
                        : "Choose time"
                    }
                    error={errors.time}
                    disabled={
                      !form.roomType ||
                      !form.duration ||
                      !form.date ||
                      selectedVariationFullyBlocked ||
                      loadingTimeSlots ||
                      (availableTimeOptions.length &&
                        availableTimeOptions.every((item) => item.disabled))
                    }
                  />

                  {loadingTimeSlots ? (
                    <p className="ltc-error-text" style={{ ...fontPoppins, color: "#475467" }}>
                      Checking backend availability for each time slot...
                    </p>
                  ) : null}

                  <SelectField
                    label="Additional Pax"
                    value={form.pax}
                    onChange={setAdditionalPaxValue}
                    options={Array.from({ length: MAX_ADDITIONAL_PAX + 1 }, (_, index) => String(index))}
                    optionLabelMap={Object.fromEntries(
                      Array.from({ length: MAX_ADDITIONAL_PAX + 1 }, (_, index) => [
                        String(index),
                        index === 0
                          ? "No additional pax"
                          : `${index} additional pax (+${formatPeso(index * ADDITIONAL_PAX_RATE)})`,
                      ])
                    )}
                    placeholder={
                      !form.roomType
                        ? "Select room first"
                        : !form.date
                        ? "Select date first"
                        : !form.duration
                        ? "Select variation first"
                        : !form.time
                        ? "Select time first"
                        : "Select additional pax"
                    }
                    error={errors.pax}
                    disabled={!form.roomType || !form.date || !form.duration || !form.time}
                  />
                </div>

                {maxPax ? (
                  <div className="ltc-info-box" style={fontPoppins}>
                    <p>Original pax / base room capacity: {baseMaxPax} pax</p>
                    <p>
                      Additional pax is optional and limited to {MAX_ADDITIONAL_PAX} pax at{" "}
                      {formatPeso(ADDITIONAL_PAX_RATE)} per person.
                    </p>
                    <p>
                      <strong>Total pax: {totalGuests || baseMaxPax} pax</strong>
                    </p>
                    {additionalPax > 0 ? (
                      <p>
                        Additional charge: {additionalPax} pax ×{" "}
                        {formatPeso(ADDITIONAL_PAX_RATE)} ={" "}
                        {formatPeso(additionalPaxCharge)}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="ltc-price-card">
                  <div className="ltc-price-row">
                    <p className="ltc-price-label" style={fontMontserrat}>
                      Total Amount:
                    </p>

                    <p className="ltc-price-value" style={fontMontserrat}>
                      {formatPeso(price)}
                    </p>
                  </div>

                  <div className="ltc-price-breakdown" style={fontPoppins}>
                    <p>Base price: {formatPeso(baseAmount)}</p>
                    <p>Additional pax: {additionalPax}</p>
                    <p>Additional charge: {formatPeso(additionalPaxCharge)}</p>
                  </div>
                </div>

                {errors.price ? (
                  <p className="ltc-error-text" style={fontPoppins}>
                    {errors.price}
                  </p>
                ) : null}

                {bottomValidationMessages.length ? (
                  <div className="ltc-validation-box" style={fontPoppins}>
                    <p style={fontMontserrat}>Please fix the following before proceeding:</p>
                    <ul>
                      {bottomValidationMessages.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="ltc-actions">
                  <button
                    onClick={handleProceed}
                    disabled={submitting || loadingProfile}
                    type="button"
                    className="ltc-primary-button"
                    style={fontMontserrat}
                  >
                    {submitting ? "Processing..." : "Proceed"}
                  </button>

                  <button
                    onClick={() => navigate("/hotel-condo")}
                    disabled={submitting}
                    type="button"
                    className="ltc-secondary-button ltc-cancel-button"
                    style={fontMontserrat}
                  >
                    Cancel
                  </button>
                </div>
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

function FormSection({ title, children }) {
  return (
    <section className="ltc-form-section">
      <h2 className="ltc-section-heading" style={fontMontserrat}>
        {title}
      </h2>
      <div className="ltc-section-line" />

      <div className="ltc-fields-grid">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  disabled,
  type = "text",
  inputMode,
  error,
}) {
  return (
    <div className="ltc-field">
      <label style={fontMontserrat}>{label}</label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? "true" : "false"}
        className="ltc-input"
        style={fontPoppins}
      />

      {error ? (
        <p className="ltc-error-text" style={fontPoppins}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  error,
  disabled,
  optionLabelMap,
  disabledOptions = [],
}) {
  return (
    <div className="ltc-field">
      <label style={fontMontserrat}>{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={error ? "true" : "false"}
        className="ltc-select"
        style={fontPoppins}
      >
        <option value="">{placeholder}</option>

        {options.map((option, index) => (
          <option
            key={`${option}-${index}`}
            value={option}
            disabled={disabledOptions.includes(option)}
          >
            {optionLabelMap?.[option] ?? option}
          </option>
        ))}
      </select>

      {error ? (
        <p className="ltc-error-text" style={fontPoppins}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DateField({
  label,
  placeholder = "Select date",
  selectedDateObj,
  minDateObj,
  disabled,
  error,
  filterDate,
  onChange,
}) {
  return (
    <div className="ltc-field">
      <label style={fontMontserrat}>{label}</label>

      {disabled ? (
        <input
          value={placeholder}
          disabled
          readOnly
          className="ltc-date-input"
          style={fontPoppins}
        />
      ) : (
        <DatePicker
          selected={selectedDateObj}
          onChange={onChange}
          minDate={minDateObj}
          filterDate={filterDate}
          placeholderText={placeholder}
          dateFormat="MM/dd/yyyy"
          autoComplete="off"
          onChangeRaw={(event) => event.preventDefault()}
          onKeyDown={(event) => event.preventDefault()}
          shouldCloseOnSelect
          showPopperArrow={false}
          popperPlacement="bottom-start"
          wrapperClassName="w-full"
          className="ltc-date-input"
          style={fontPoppins}
        />
      )}

      {error ? (
        <p className="ltc-error-text" style={fontPoppins}>
          {error}
        </p>
      ) : null}
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
          <FooterLink onClick={() => (window.location.href = "/resort-venue")}>
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

        <MenuItem
          label="HOME"
          onClick={() => {
            onClose();
            navigate("/resort-venue");
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
          label={
            localStorage.getItem("token") || localStorage.getItem("hotelToken")
              ? "PROFILE"
              : "SIGN IN"
          }
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
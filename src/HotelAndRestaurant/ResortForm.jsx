import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HotelFaqBot from "./HotelFaqBot";

const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const BOOKING_GAP_MINUTES = 60;
const BOOKING_GAP_MS = BOOKING_GAP_MINUTES * 60 * 1000;

const EIGHT_HOUR_TIME_SLOTS = [
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
];

const DEFAULT_TIME_SLOTS_BY_LABEL = {
  "8 Hours": EIGHT_HOUR_TIME_SLOTS,
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

const LEGACY_RESORT_PACKAGES = [
  {
    _id: "legacy-lorenzo-campsite",
    title: "Lorenzo Campsite",
    duration: "12 Hours / 22 Hours",
    price: 15000,
    variants: [
      {
        label: "12 Hours",
        price: 15000,
        timeSlots: DEFAULT_TIME_SLOTS_BY_LABEL["12 Hours"],
        displayOrder: 1,
        isActive: true,
      },
      {
        label: "22 Hours",
        price: 20000,
        timeSlots: DEFAULT_TIME_SLOTS_BY_LABEL["22 Hours"],
        displayOrder: 2,
        isActive: true,
      },
    ],
    capacity: "Maximum Capacity: 30 guests",
    displayOrder: 1,
    isActive: true,
    inclusions: [
      "Total Pax: Maximum 30 guests",
      "Availability: 12 Hours / 22 Hours",
      "Price range: ₱15,000 for 12 hours / ₱20,000 for 22 hours",
    ],
  },
  {
    _id: "legacy-lorenzo-veranda",
    title: "Lorenzo Veranda",
    duration: "8 Hours",
    price: 12000,
    variants: [
      {
        label: "8 Hours",
        price: 12000,
        timeSlots: EIGHT_HOUR_TIME_SLOTS,
        displayOrder: 1,
        isActive: true,
      },
    ],
    capacity: "Maximum Capacity: 100 guests",
    displayOrder: 2,
    isActive: true,
    inclusions: ["Total Pax: Maximum 100 guests"],
  },
  {
    _id: "legacy-lorenzo-hall",
    title: "Lorenzo Hall",
    duration: "8 Hours",
    price: 15000,
    variants: [
      {
        label: "8 Hours",
        price: 15000,
        timeSlots: EIGHT_HOUR_TIME_SLOTS,
        displayOrder: 1,
        isActive: true,
      },
    ],
    capacity: "Maximum Capacity: 100 guests",
    displayOrder: 3,
    isActive: true,
    inclusions: ["Total Pax: Maximum 100 guests"],
  },
  {
    _id: "legacy-lorenzo-cavanas",
    title: "Lorenzo Cavanas",
    duration: "12 Hours / 22 Hours",
    price: 15000,
    variants: [
      {
        label: "12 Hours",
        price: 15000,
        timeSlots: DEFAULT_TIME_SLOTS_BY_LABEL["12 Hours"],
        displayOrder: 1,
        isActive: true,
      },
      {
        label: "22 Hours",
        price: 20000,
        timeSlots: DEFAULT_TIME_SLOTS_BY_LABEL["22 Hours"],
        displayOrder: 2,
        isActive: true,
      },
    ],
    capacity: "Venue Capacity: 100 pax",
    displayOrder: 4,
    isActive: true,
    inclusions: ["Total Pax: Venue capacity 100 pax"],
  },
];

const SEASONAL_MARKUP_PERCENT = 10;
const WEEKEND_MARKUP_PERCENT = 5;
const MONTHLY_BOOKING_MARKUP_PERCENT = 1;
const MAX_ADDITIONAL_PAX = 20;
const ADDITIONAL_PAX_RATE = 500;

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-resort-form-page {
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

  .ltc-resort-form-page * {
    box-sizing: border-box;
  }

  .ltc-resort-form-page .react-datepicker-wrapper,
  .ltc-resort-form-page .react-datepicker__input-container {
    width: 100%;
  }

  .ltc-resort-form-page .react-datepicker-popper {
    z-index: 9999 !important;
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
    font-family: inherit;
    font-weight: 700;
    padding: 0 18px;
    transition: .25s var(--ease);
    box-shadow: 0 10px 24px rgba(8,39,25,.05);
  }

  .ltc-input::placeholder,
  .ltc-date-input::placeholder {
    color: rgba(102,112,133,.68);
  }

  .ltc-input:focus,
  .ltc-select:focus,
  .ltc-date-input:focus {
    border-color: var(--green-700);
    background: white;
    box-shadow: 0 0 0 4px rgba(35,95,62,.10);
  }

  .ltc-input:disabled,
  .ltc-select:disabled,
  .ltc-date-input:disabled {
    opacity: .68;
    cursor: not-allowed;
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

function normalizeText(value = "") {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, " ");
}

function normalizeVariationLabel(value = "") {
  const text = String(value || "").trim().toLowerCase();

  if (text.includes("8")) return "8 Hours";
  if (text.includes("12")) return "12 Hours";
  if (text.includes("22")) return "22 Hours";

  return String(value || "").trim();
}

function getDefaultTimeSlots(label = "") {
  return DEFAULT_TIME_SLOTS_BY_LABEL[normalizeVariationLabel(label)] || [];
}

function extractMaxCapacity(value = "") {
  const matches = String(value || "").match(/\d+/g);
  if (!matches || !matches.length) return null;

  const numbers = matches
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);

  if (!numbers.length) return null;

  return Math.max(...numbers);
}

function getPackageCapacityLimit(pkg) {
  const capacityFromField = extractMaxCapacity(pkg?.capacity);

  if (capacityFromField) return capacityFromField;

  if (Array.isArray(pkg?.inclusions)) {
    const capacityLines = pkg.inclusions.filter((item) =>
      /(capacity|pax|guest|guests)/i.test(String(item || ""))
    );

    const numbers = capacityLines
      .map((line) => extractMaxCapacity(line))
      .filter((num) => Number.isFinite(num) && num > 0);

    if (numbers.length) return Math.max(...numbers);
  }

  return null;
}

function parseDurationOptions(pkg) {
  if (Array.isArray(pkg?.variants) && pkg.variants.length) {
    return pkg.variants
      .filter((item) => item?.isActive !== false)
      .map((item) => normalizeVariationLabel(item.label))
      .filter(Boolean);
  }

  const raw = String(pkg?.duration || "").toLowerCase();
  const options = [];

  if (raw.includes("8")) options.push("8 Hours");
  if (raw.includes("12")) options.push("12 Hours");
  if (raw.includes("22")) options.push("22 Hours");

  if (options.length) return options;
  if (pkg?.duration) return [pkg.duration];

  return ["8 Hours"];
}

function normalizeVariant(variant = {}, index = 0) {
  const label = normalizeVariationLabel(variant.label || "");
  const manualSlots = Array.isArray(variant.timeSlots)
    ? variant.timeSlots.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  return {
    label,
    price: Number(variant.price || 0),
    timeSlots: manualSlots.length ? manualSlots : getDefaultTimeSlots(label),
    displayOrder: Number(variant.displayOrder || index + 1),
    isActive: variant.isActive === false ? false : true,
  };
}

function packageScore(pkg = {}) {
  const variants = Array.isArray(pkg.variants) ? pkg.variants : [];

  const usefulVariants = variants.filter((variant) => {
    const normalized = normalizeVariant(variant);
    return normalized.isActive && normalized.label && normalized.timeSlots.length;
  });

  return [
    usefulVariants.length ? 1 : 0,
    Number(pkg.isActive !== false),
    new Date(pkg.updatedAt || pkg.createdAt || 0).getTime(),
  ];
}

function isBetterPackage(candidate, current) {
  if (!current) return true;

  const a = packageScore(candidate);
  const b = packageScore(current);

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }

  return false;
}

function dedupePackagesByVenue(list = []) {
  const map = new Map();

  list
    .filter((item) => item?.isActive !== false)
    .forEach((pkg) => {
      const key = normalizeText(pkg.title);
      if (!key) return;

      const current = map.get(key);

      if (isBetterPackage(pkg, current)) {
        map.set(key, pkg);
      }
    });

  return [...map.values()].sort(
    (a, b) =>
      Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
      String(a.title || "").localeCompare(String(b.title || ""))
  );
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
  const monthlyBookingIncreasePercent =
    safeMonthlyCount * MONTHLY_BOOKING_MARKUP_PERCENT;

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

function isoToLocalDateObj(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getCategoryLabel(category = "") {
  const label = normalizeVariationLabel(category);

  if (label === "12 Hours") return "12-hour";
  if (label === "22 Hours") return "22-hour";

  return "8-hour";
}

export default function ResortForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = useMemo(() => getApiBase(), []);
  const presetAppliedRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);

  // Keep the form default blank. Users must choose a venue first.
  // This prevents a venue from being pre-selected when coming from another page.
  const presetPackageId = "";
  const presetPackage = "";

  const [packages, setPackages] = useState(LEGACY_RESORT_PACKAGES);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceType: "Resort & Venue",
    packageId: "",
    venue: "",
    date: "",
    category: "",
    time: "",
    additionalPax: "",
  });

  const todayLocalISO = useMemo(() => toLocalISO(new Date()), []);

  const oneYearAheadISO = useMemo(() => {
    const d = isoToLocalDateObj(todayLocalISO);
    d.setDate(d.getDate() + 365);
    return toLocalISO(d);
  }, [todayLocalISO]);

  const displayPackages = useMemo(() => dedupePackagesByVenue(packages), [packages]);

  const selectedPackage = useMemo(() => {
    return (
      displayPackages.find((item) => String(item._id) === String(form.packageId)) ||
      displayPackages.find(
        (item) => normalizeText(item.title) === normalizeText(form.venue)
      ) ||
      null
    );
  }, [displayPackages, form.packageId, form.venue]);

  const capacityLimit = useMemo(
    () => getPackageCapacityLimit(selectedPackage),
    [selectedPackage]
  );

  const baseCapacity = Number(capacityLimit || 0);

  const maxBookablePax = useMemo(() => {
    return baseCapacity ? baseCapacity + MAX_ADDITIONAL_PAX : null;
  }, [baseCapacity]);

  const venueOptions = useMemo(() => {
    return displayPackages.map((item) => ({
      value: normalizeText(item.title),
      label: item.title,
      packageId: item._id,
    }));
  }, [displayPackages]);

  const selectedVariants = useMemo(() => {
    if (!selectedPackage) return [];

    const variants = Array.isArray(selectedPackage.variants)
      ? selectedPackage.variants
          .map(normalizeVariant)
          .filter((item) => item.isActive && item.label && item.timeSlots.length)
          .sort(
            (a, b) =>
              Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
              String(a.label).localeCompare(String(b.label))
          )
      : [];

    if (variants.length) return variants;

    return parseDurationOptions(selectedPackage).map((label, index) => ({
      label,
      price: Number(selectedPackage.price || 0),
      timeSlots: getDefaultTimeSlots(label),
      displayOrder: index + 1,
      isActive: true,
    }));
  }, [selectedPackage]);

  const selectedVariant = useMemo(() => {
    if (!form.category) return null;

    return (
      selectedVariants.find(
        (item) => item.label === normalizeVariationLabel(form.category)
      ) || null
    );
  }, [selectedVariants, form.category]);

  const timeOptions = useMemo(() => {
    return (selectedVariant?.timeSlots || []).map((time) => ({
      value: time,
      label: time,
    }));
  }, [selectedVariant]);

  const basePrice = useMemo(() => {
    if (!selectedVariant) return 0;
    return Number(selectedVariant.price || selectedPackage?.price || 0) || 0;
  }, [selectedVariant, selectedPackage]);

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
  const additionalPax = Math.max(0, Math.min(MAX_ADDITIONAL_PAX, Number(form.additionalPax || 0)));
  const selectedPax = baseCapacity ? baseCapacity + additionalPax : 0;
  const additionalPaxCharge = additionalPax * ADDITIONAL_PAX_RATE;
  const price = baseAmount ? baseAmount + additionalPaxCharge : null;

  const selectedDateObj = useMemo(() => isoToLocalDateObj(form.date), [form.date]);
  const minDateObj = useMemo(() => isoToLocalDateObj(todayLocalISO), [todayLocalISO]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setStatus({ type: "", message: "" });
  };

  const setAdditionalPaxValue = (value) => {
    const numericValue = Math.max(0, Math.min(MAX_ADDITIONAL_PAX, Number(value || 0)));
    setField("additionalPax", String(numericValue));
  };

  const additionalPaxOptions = useMemo(
    () => Array.from({ length: MAX_ADDITIONAL_PAX + 1 }, (_, index) => String(index)),
    []
  );

  const additionalPaxLabelMap = useMemo(
    () =>
      Object.fromEntries(
        additionalPaxOptions.map((value) => [
          value,
          value === "0"
            ? "No additional pax"
            : `+${value} pax (${formatPeso(Number(value) * ADDITIONAL_PAX_RATE)})`,
        ])
      ),
    [additionalPaxOptions]
  );

  const isTimeOptionBlocked = (date, time) => {
    if (!date || !time) return false;

    const target = buildInterval(date, time);
    if (!target) return false;

    return confirmedBookings.some((booking) => {
      const start = booking.startDateTime
        ? new Date(booking.startDateTime)
        : buildInterval(booking.date, booking.time)?.startDateTime;

      const end = booking.endDateTime
        ? new Date(booking.endDateTime)
        : buildInterval(booking.date, booking.time)?.endDateTime;

      if (!start || !end) return false;

      return intervalsOverlap(target.startDateTime, target.endDateTime, start, end);
    });
  };

  const isVariantFullyBlocked = (variant, date) => {
    if (!date || !variant?.timeSlots?.length) return false;

    return variant.timeSlots.every((time) => isTimeOptionBlocked(date, time));
  };

  const isDateFullyBlocked = (date) => {
    if (!date || !form.venue || !selectedVariants.length) return false;

    return selectedVariants.every((variant) => isVariantFullyBlocked(variant, date));
  };

  const variationOptions = useMemo(() => {
    return selectedVariants.map((variant) => {
      const disabled = form.date ? isVariantFullyBlocked(variant, form.date) : false;

      return {
        value: variant.label,
        label: `${variant.label}${disabled ? " — FULLY BOOKED" : ""}`,
        disabled,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariants, form.date, confirmedBookings]);

  const categoryOptions = useMemo(
    () => variationOptions.map((item) => item.value),
    [variationOptions]
  );

  const disabledCategoryOptions = useMemo(
    () => variationOptions.filter((item) => item.disabled).map((item) => item.value),
    [variationOptions]
  );

  const categoryOptionLabelMap = useMemo(
    () =>
      Object.fromEntries(
        variationOptions.map((item) => [item.value, item.label])
      ),
    [variationOptions]
  );

  const selectedVariationFullyBlocked = useMemo(() => {
    if (!form.date || !selectedVariant) return false;
    return isVariantFullyBlocked(selectedVariant, form.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, selectedVariant, confirmedBookings]);

  const availableTimeOptions = useMemo(() => {
    return timeOptions.map((option) => ({
      ...option,
      disabled: isTimeOptionBlocked(form.date, option.value),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeOptions, form.date, confirmedBookings]);

  const fetchPackages = async () => {
    setLoadingPackages(true);

    try {
      const res = await fetch(`${API_BASE}/packages?type=resort_venue`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || "Failed to load resort packages.");

      const list = Array.isArray(data.packages)
        ? data.packages.filter((item) => item?.isActive !== false)
        : [];

      setPackages(list);
    } catch (error) {
      console.error("fetch resort packages error:", error);

      setPackages([]);
      setStatus({
        type: "error",
        message: "Could not load resort packages. Please try again later.",
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

  const fetchVenueCalendar = async (venue) => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) {
      navigate("/hotel-login");
      return;
    }

    if (!venue) {
      setConfirmedBookings([]);
      return;
    }

    setLoadingCalendar(true);

    try {
      const qs = new URLSearchParams({
        venue,
        from: todayLocalISO,
        to: oneYearAheadISO,
      }).toString();

      const res = await fetch(`${API_BASE}/resort-bookings/booked-dates?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setConfirmedBookings([]);
        return;
      }

      setConfirmedBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (error) {
      console.error("fetch venue calendar error:", error);
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
    // Keep the venue empty by default. Users must explicitly choose a venue.
    presetAppliedRef.current = true;
  }, []);

  useEffect(() => {
    if (!form.venue) {
      setConfirmedBookings([]);
      return;
    }

    const matched = displayPackages.find(
      (item) => normalizeText(item.title) === normalizeText(form.venue)
    );

    setForm((prev) => {
      const currentCategory = normalizeVariationLabel(prev.category);
      const options = parseDurationOptions(matched);
      const validCategory = options.includes(currentCategory) ? currentCategory : "";

      return {
        ...prev,
        packageId: matched?._id || prev.packageId,
        category: validCategory,
        date: "",
        time: "",
        additionalPax: "",
      };
    });

    fetchVenueCalendar(form.venue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.venue, displayPackages]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, time: "", additionalPax: "" }));
  }, [form.category, form.date]);

  useEffect(() => {
    if (!form.date || !selectedVariants.length || !form.category) return;

    const current = selectedVariants.find(
      (variant) => variant.label === normalizeVariationLabel(form.category)
    );

    if (!current || !isVariantFullyBlocked(current, form.date)) return;

    setForm((prev) => ({
      ...prev,
      category: "",
      time: "",
      additionalPax: "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, selectedVariants, confirmedBookings]);

  const checkAvailability = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) return { ok: false, message: "Unauthorized." };

    const qs = new URLSearchParams({
      venue: form.venue,
      date: form.date,
      category: normalizeVariationLabel(form.category),
      time: form.time,
    }).toString();

    const res = await fetch(`${API_BASE}/resort-bookings/check?${qs}`, {
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

    if (!form.venue) next.venue = "Choose a venue.";

    if (!form.date) {
      next.date = "Choose a date.";
    } else if (form.date < todayLocalISO) {
      next.date = "Date cannot be in the past.";
    } else if (isDateFullyBlocked(form.date)) {
      next.date = "All variations are already booked for this date.";
    }

    if (!form.category) {
      next.category = "Choose a variation.";
    } else if (selectedVariationFullyBlocked) {
      next.category = "This variation is fully booked for the selected date.";
    }

    if (!form.time) {
      next.time = selectedVariationFullyBlocked
        ? "This variation is fully booked. Please choose another variation."
        : "Choose a time.";
    } else if (isTimeOptionBlocked(form.date, form.time)) {
      next.time =
        "This time is blocked by a pending or approved booking. Please choose another slot.";
    }

    if (!baseCapacity) {
      next.pax = "This venue has no base capacity configured.";
    } else if (!/^\d+$/.test(String(form.additionalPax || "0"))) {
      next.pax = "Choose a valid additional pax value.";
    } else if (additionalPax > MAX_ADDITIONAL_PAX) {
      next.pax = `Additional pax can only be up to ${MAX_ADDITIONAL_PAX}.`;
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
            "Selected slot is not available. Please choose another slot.",
        }));

        setStatus({
          type: "error",
          message:
            availability.message ||
            "Selected slot is not available. Please choose another slot.",
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
      category: normalizeVariationLabel(form.category),
      packageId: selectedPackage?._id || form.packageId || "",
      selectedPackage: selectedPackage?.title || form.venue,
      selectedPackageTitle: selectedPackage?.title || form.venue,
      selectedCapacity: selectedPackage?.capacity || "",
      selectedCapacityLimit: capacityLimit || "",
      baseCapacity,
      maxBookablePax,
      maxAdditionalPax: MAX_ADDITIONAL_PAX,
      additionalPax,
      additionalPaxRate: ADDITIONAL_PAX_RATE,
      additionalPaxCharge,
      selectedInclusions: selectedPackage?.inclusions || [],
      selectedVariantLabel:
        selectedVariant?.label || normalizeVariationLabel(form.category),
      selectedVariantPrice: basePrice,
      selectedVariantTimeSlots: selectedVariant?.timeSlots || [],
      pax: selectedPax,
      totalGuests: selectedPax,
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

    sessionStorage.setItem("resortBookingDraft", JSON.stringify(payload));
    navigate("/resort-summary", { state: payload });

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

    if (status.type === "error" && status.message) {
      const cleanStatus = String(status.message).trim();

      if (cleanStatus && !messages.includes(cleanStatus)) {
        messages.unshift(cleanStatus);
      }
    }

    return [...new Set(messages)];
  }, [errors, status]);

  const goToProfile = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");
    navigate(token ? "/hotel-profile" : "/hotel-login");
  };

  return (
    <div className="ltc-resort-form-page" style={fontPontano}>
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
              Booking <span>Form</span>
            </h1>

            <p className="ltc-hero-text" style={fontPontano}>
              Complete your resort and venue booking details, check availability,
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

              <FormSection title="Personal Information">
                <Field
                  label="First Name"
                  placeholder="Enter first name"
                  value={form.firstName}
                  disabled={loadingProfile}
                  error={errors.firstName}
                  onChange={(v) =>
                    setField("firstName", v.replace(/[^A-Za-z\s]/g, "").slice(0, 30))
                  }
                />

                <Field
                  label="Last Name"
                  placeholder="Enter last name"
                  value={form.lastName}
                  disabled={loadingProfile}
                  error={errors.lastName}
                  onChange={(v) =>
                    setField("lastName", v.replace(/[^A-Za-z\s]/g, "").slice(0, 30))
                  }
                />

                <Field
                  label="Email"
                  placeholder="Enter email address"
                  type="email"
                  value={form.email}
                  disabled={loadingProfile}
                  error={errors.email}
                  onChange={(v) => setField("email", v.replace(/\s/g, "").slice(0, 60))}
                />

                <Field
                  label="Phone Number"
                  placeholder="09XXXXXXXXX"
                  value={form.phone}
                  disabled={loadingProfile}
                  error={errors.phone}
                  inputMode="numeric"
                  onChange={(v) =>
                    setField("phone", v.replace(/\D/g, "").slice(0, 11))
                  }
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
                    value="Resort & Venue"
                    disabled
                    readOnly
                    className="ltc-service-pill"
                    style={fontPoppins}
                  />
                </div>

                <div className="ltc-fields-grid">
                  <SelectField
                    label="Choose Venue"
                    value={form.venue}
                    error={errors.venue}
                    disabled={loadingPackages}
                    placeholder={loadingPackages ? "Loading venues..." : "Select venue"}
                    options={venueOptions.map((item) => item.value)}
                    optionLabelMap={Object.fromEntries(
                      venueOptions.map((item) => [item.value, item.label])
                    )}
                    onChange={(value) => setField("venue", value)}
                  />

                  <DateField
                    label="Choose Date"
                    placeholder="Select date"
                    selectedDateObj={selectedDateObj}
                    minDateObj={minDateObj}
                    disabled={!form.venue || loadingCalendar}
                    error={errors.date}
                    filterDate={(d) => !isDateFullyBlocked(toLocalISO(d))}
                    onChange={(d) => {
                      setField("date", d ? toLocalISO(d) : "");
                      setForm((prev) => ({
                        ...prev,
                        date: d ? toLocalISO(d) : "",
                        category: "",
                        time: "",
                        additionalPax: "",
                      }));
                    }}
                  />

                  <SelectField
                    label="Variation"
                    value={form.category}
                    error={errors.category}
                    disabled={!form.venue || !form.date}
                    placeholder={
                      !form.venue
                        ? "Select venue first"
                        : !form.date
                        ? "Select date first"
                        : "Select variation"
                    }
                    options={categoryOptions}
                    optionLabelMap={categoryOptionLabelMap}
                    disabledOptions={disabledCategoryOptions}
                    onChange={(value) => {
                      setField("category", normalizeVariationLabel(value));
                      setForm((prev) => ({
                        ...prev,
                        category: normalizeVariationLabel(value),
                        time: "",
                        additionalPax: "",
                      }));
                    }}
                  />

                  <SelectField
                    label="Time"
                    value={form.time}
                    error={errors.time}
                    disabled={
                      !form.venue ||
                      !form.category ||
                      !form.date ||
                      selectedVariationFullyBlocked
                    }
                    placeholder={
                      !form.venue
                        ? "Select venue first"
                        : !form.date
                        ? "Select date first"
                        : !form.category
                        ? "Select variation first"
                        : selectedVariationFullyBlocked
                        ? "Fully booked"
                        : `Select ${getCategoryLabel(form.category)} time`
                    }
                    options={availableTimeOptions.map((item) => item.value)}
                    optionLabelMap={Object.fromEntries(
                      availableTimeOptions.map((item) => [
                        item.value,
                        `${item.label}${item.disabled ? " — BOOKED" : ""}`,
                      ])
                    )}
                    disabledOptions={availableTimeOptions
                      .filter((item) => item.disabled)
                      .map((item) => item.value)}
                    onChange={(value) => {
                      setField("time", value);
                      setForm((prev) => ({ ...prev, time: value, additionalPax: "0" }));
                    }}
                  />

                  <SelectField
                    label="Additional Pax"
                    value={form.additionalPax}
                    error={errors.pax}
                    disabled={!form.venue || !form.date || !form.category || !form.time}
                    placeholder={
                      !form.venue
                        ? "Select venue first"
                        : !form.date
                        ? "Select date first"
                        : !form.category
                        ? "Select variation first"
                        : !form.time
                        ? "Select time first"
                        : "Select additional pax"
                    }
                    options={additionalPaxOptions}
                    optionLabelMap={additionalPaxLabelMap}
                    onChange={setAdditionalPaxValue}
                  />
                </div>

                {capacityLimit ? (
                  <div className="ltc-info-box" style={fontPoppins}>
                    <p>Original pax / base capacity: {baseCapacity} pax</p>
                    <p>
                      Additional pax is optional and limited to {MAX_ADDITIONAL_PAX} pax at{" "}
                      {formatPeso(ADDITIONAL_PAX_RATE)} per person.
                    </p>
                    <p>
                      <strong>Total pax: {selectedPax || baseCapacity} pax</strong>
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

                {errors.price ? (
                  <p className="ltc-error-text" style={fontPoppins}>
                    {errors.price}
                  </p>
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
                    <p>Total pax: {selectedPax || 0}</p>
                    <p>Additional pax: {additionalPax}</p>
                    <p>Additional charge: {formatPeso(additionalPaxCharge)}</p>
                  </div>
                </div>

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
                    onClick={() => navigate("/resort-venue")}
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

      <HotelFaqBot />
    </div>
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
  max,
}) {
  return (
    <div className="ltc-field">
      <label style={fontMontserrat}>{label}</label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        inputMode={inputMode}
        max={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
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
        className="ltc-select"
        style={fontPoppins}
      >
        <option value="" disabled>{placeholder}</option>

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

      <DatePicker
        selected={selectedDateObj}
        onChange={onChange}
        minDate={minDateObj}
        filterDate={filterDate}
        disabled={disabled}
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
      />

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
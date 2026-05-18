import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MENU_OPTIONS = {
  soup: [
    "Creamy Mushroom Soup",
    "Cream of Crab & Corn Soup",
    "Cream of Pumpkin Soup",
  ],
  rice: ["Plain Rice", "Yang Chow Rice", "Java Rice"],
  pasta: [
    "Spaghetti",
    "Baked Macaroni",
    "Chicken Alfredo Pasta",
    "Baked Lasagna",
    "Creamy Carbonara",
  ],
  chicken: [
    "Chicken Cordon Bleu",
    "Chicken Teriyaki",
    "Crispy Fried Chicken",
    "Oriental Honey Buttered Chicken",
    "Grilled Chicken BBQ",
  ],
  pork: [
    "Roast Pork",
    "Grilled Pork BBQ",
    "Pork Hamonado",
    "Pork Asado",
    "Sweet & Sour Pork",
  ],
  vegetable: ["Chopsuey", "Buttered Mixed Vegetables"],
  dessert: [
    "Creamy Mango Solei",
    "Coffee Jelly",
    "Buko Pandan",
    "Buco Fruit Salad",
    "Leche Jella",
  ],
  drinks: ["Water", "Juice"],
};

const EVENT_TIME_SLOTS_8H = [
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

const EVENT_TIME_SLOTS_12H = [
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
];

const EVENT_TIME_SLOTS_22H = [
  "6:00 AM - 4:00 AM next day",
  "7:00 AM - 5:00 AM next day",
  "8:00 AM - 6:00 AM next day",
];

const DEFAULT_EVENT_VENUE_CAPACITY = {
  "LORENZO CAMPSITE": 30,
  "LORENZO VERANDA": 100,
  "LORENZO HALL": 100,
  "LORENZO CAVANAS": 100,
};

const ADDITIONAL_PAX_RATE = 500;
const MAX_ADDITIONAL_PAX = 20;
const MAX_MENU_CHOICES_PER_CATEGORY = 2;

const MENU_CATEGORY_KEYS = [
  "soup",
  "rice",
  "pasta",
  "chicken",
  "pork",
  "vegetable",
  "dessert",
  "drinks",
];

const MAIN_MENU_KEYS = ["pasta", "chicken", "pork", "vegetable"];

const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-event-form-page {
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

  .ltc-event-form-page * {
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
    background: linear-gradient(
      120deg,
      rgba(2,18,11,.96) 0%,
      rgba(5,37,23,.88) 42%,
      rgba(12,64,39,.76) 100%
    );
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
    font-size: clamp(36px,5vw,62px);
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
    overflow: visible;
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

  .ltc-form-section + .ltc-booking-section,
  .ltc-booking-section + .ltc-form-section {
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
    grid-template-columns: repeat(3,minmax(0,1fr));
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

  .ltc-field-full {
    grid-column: 1 / -1;
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
  .ltc-date-input,
  .ltc-textarea {
    width: 100%;
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

  .ltc-input,
  .ltc-select,
  .ltc-date-input {
    min-height: 50px;
  }

  .ltc-textarea {
    min-height: 120px;
    border-radius: 22px;
    padding: 16px 18px;
    resize: vertical;
  }

  .ltc-input::placeholder,
  .ltc-date-input::placeholder,
  .ltc-textarea::placeholder {
    color: rgba(16,24,40,.62);
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    font-weight: 700;
    opacity: 1;
  }

  .ltc-input:focus,
  .ltc-select:focus,
  .ltc-date-input:focus,
  .ltc-textarea:focus {
    border-color: var(--green-700);
    background: white;
    box-shadow: 0 0 0 4px rgba(35,95,62,.10);
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

  .react-datepicker-wrapper,
  .react-datepicker__input-container {
    width: 100%;
  }

  .react-datepicker-popper {
    z-index: 9999 !important;
  }

  .react-datepicker {
    font-family: "Inter", Arial, sans-serif;
    border: 1px solid rgba(35,95,62,.18);
    box-shadow: 0 18px 45px rgba(8,39,25,.18);
    border-radius: 16px;
    overflow: hidden;
  }

  .ltc-error-text {
    margin: 7px 0 0;
    color: #b42318;
    font-size: 12px;
    font-weight: 800;
  }

  .ltc-help-text,
  .ltc-menu-text {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
  }

  .ltc-rate-card,
  .ltc-price-card {
    margin-top: 24px;
    border-radius: 20px;
    background: white;
    border: 1px solid rgba(35,95,62,.10);
    padding: 22px;
    box-shadow: 0 16px 34px rgba(8,39,25,.08);
  }

  .ltc-info-grid {
    display: grid;
    grid-template-columns: repeat(4,minmax(0,1fr));
    gap: 14px;
  }

  .ltc-info-tile {
    border-radius: 16px;
    background: rgba(35,95,62,.08);
    padding: 14px;
  }

  .ltc-info-label {
    margin: 0;
    color: rgba(35,95,62,.72);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-info-value {
    margin: 4px 0 0;
    color: var(--green-800);
    font-size: 14px;
    font-weight: 900;
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

  .ltc-menu-header {
    margin-top: 34px;
  }

  .ltc-menu-grid {
    margin-top: 24px;
    display: grid;
    grid-template-columns: repeat(3,minmax(0,1fr));
    gap: 18px;
  }

  .ltc-checkbox-card {
    border-radius: 20px;
    background: white;
    border: 1px solid rgba(35,95,62,.12);
    padding: 20px;
    box-shadow: 0 14px 30px rgba(8,39,25,.07);
    transition: .25s var(--ease);
  }

  .ltc-checkbox-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 42px rgba(8,39,25,.12);
    border-color: rgba(215,168,77,.45);
  }

  .ltc-checkbox-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;
  }

  .ltc-checkbox-title {
    margin: 0;
    color: var(--green-950);
    font-size: 15px;
    font-weight: 900;
  }

  .ltc-checkbox-subtitle {
    margin: 4px 0 0;
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
  }

  .ltc-choice-count {
    border-radius: 999px;
    padding: 7px 10px;
    font-size: 11px;
    font-weight: 900;
    background: rgba(16,185,129,.10);
    color: #047857;
    white-space: nowrap;
  }

  .ltc-choice-count.max {
    background: rgba(245,158,11,.14);
    color: #b45309;
  }

  .ltc-checkbox-list {
    display: grid;
    gap: 10px;
  }

  .ltc-checkbox-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: var(--green-800);
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
  }

  .ltc-checkbox-row.disabled {
    cursor: not-allowed;
    opacity: .45;
  }

  .ltc-checkbox-row input {
    margin-top: 4px;
    accent-color: var(--green-800);
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
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 16px 35px rgba(215,168,77,.22);
  }

  .ltc-primary-button:hover {
    transform: translateY(-4px);
    background: linear-gradient(135deg,#f7dc93,#c99634);
    box-shadow: 0 22px 45px rgba(215,168,77,.32);
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

  .ltc-primary-button:active,
  .ltc-secondary-button:active,
  .ltc-secondary-button:focus {
    transform: translateY(-1px) scale(.98);
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
    width: min(310px,86vw);
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
    .ltc-info-grid,
    .ltc-menu-grid,
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
      font-size: clamp(34px,11vw,46px);
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

function getHotelToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
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

function isoToLocalDateObj(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(dateObj, days) {
  const copy = new Date(dateObj);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function inferEventType(title = "") {
  const lower = String(title || "").toLowerCase();

  if (lower.includes("wedding")) return "Wedding";
  if (lower.includes("debut")) return "Debut";
  if (lower.includes("birthday")) return "Birthday";
  if (lower.includes("corporate")) return "Corporate";

  return "Event";
}

function parseMoney(value = "") {
  const num = String(value || "").replace(/[^0-9.]/g, "");
  return Number(num || 0);
}

function parsePax(value = "") {
  const match = String(value || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function normalizeTimeLabel(value = "") {
  const text = String(value || "").trim().toLowerCase();

  if (text.includes("22")) return "22 Hours";
  if (text.includes("12")) return "12 Hours";
  if (text.includes("8")) return "8 Hours";

  return String(value || "").trim() || "8 Hours";
}

function getDefaultTimeSlots(label = "8 Hours") {
  const normalized = normalizeTimeLabel(label);

  if (normalized === "22 Hours") return EVENT_TIME_SLOTS_22H;
  if (normalized === "12 Hours") return EVENT_TIME_SLOTS_12H;
  return EVENT_TIME_SLOTS_8H;
}

function inferTimeLabelFromSlots(slots = []) {
  const normalized = Array.isArray(slots)
    ? slots.map((slot) => String(slot || "").trim()).filter(Boolean)
    : [];

  const labels = ["8 Hours", "12 Hours", "22 Hours"];

  for (const label of labels) {
    const defaults = getDefaultTimeSlots(label);

    if (
      defaults.length === normalized.length &&
      defaults.every((slot) => normalized.includes(slot))
    ) {
      return label;
    }
  }

  return normalized.length ? "Custom Time" : "8 Hours";
}

function makeVariantKey(option = {}) {
  return String(
    option._id ||
      option.id ||
      option.variantId ||
      `${option.pax || "pax"}-${option.timeLabel || "time"}-${
        option.displayOrder || 0
      }`
  );
}

function normalizeVenue(value = "") {
  const text = String(value || "").trim().toUpperCase().replace(/\s+/g, " ");

  if (text.includes("LORENZO HALL")) return "LORENZO HALL";
  if (text.includes("LORENZO VERANDA")) return "LORENZO VERANDA";
  if (text.includes("LORENZO CABANAS") || text.includes("LORENZO CAVANAS")) {
    return "LORENZO CAVANAS";
  }
  if (text.includes("LORENZO CAMPSITE")) return "LORENZO CAMPSITE";

  return text;
}

function parseMaxCapacity(value = "") {
  const matches = String(value || "").match(/\d+/g);
  if (!matches?.length) return null;

  const numbers = matches
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);

  return numbers.length ? Math.max(...numbers) : null;
}

function getVenueCapacity(pkg = {}) {
  const normalizedTitle = normalizeVenue(pkg.title || pkg.venue || "");
  const capacityFromField = parseMaxCapacity(pkg.capacity);

  if (capacityFromField) return capacityFromField;

  const capacityFromInclusions = Array.isArray(pkg.inclusions)
    ? Math.max(
        ...pkg.inclusions
          .filter((line) =>
            /(capacity|pax|guest|guests)/i.test(String(line || ""))
          )
          .map(parseMaxCapacity)
          .filter(Boolean),
        0
      )
    : 0;

  return (
    capacityFromInclusions ||
    DEFAULT_EVENT_VENUE_CAPACITY[normalizedTitle] ||
    0
  );
}

function getVariantTimeSlots(variant = {}) {
  const manual = Array.isArray(variant.timeSlots)
    ? variant.timeSlots.map((slot) => String(slot || "").trim()).filter(Boolean)
    : [];

  if (manual.length) return manual;

  return getDefaultTimeSlots(
    variant.timeVariationLabel ||
      variant.duration ||
      variant.timeLabel ||
      variant.label ||
      "8 Hours"
  );
}

function getTextPriceFallback(pkg = {}, pax = 0) {
  const lines = [
    pkg.subtitle,
    pkg.description,
    pkg.capacity,
    ...(Array.isArray(pkg.inclusions) ? pkg.inclusions : []),
  ]
    .filter(Boolean)
    .join("\n");

  const safePax = Number(pax || 0);
  if (!safePax || !lines) return 0;

  const regex = new RegExp(
    `(?:₱|P|PHP)?\\s*([0-9][0-9,]*(?:\\.\\d+)?)\\s*(?:-|–|—|for|/)\\s*${safePax}\\s*(?:pax|persons|guests)|${safePax}\\s*(?:pax|persons|guests)\\s*(?:-|–|—|for|/)\\s*(?:₱|P|PHP)?\\s*([0-9][0-9,]*(?:\\.\\d+)?)`,
    "i"
  );

  const match = lines.match(regex);
  if (!match) return 0;

  return parseMoney(match[1] || match[2] || "");
}

function parsePriceOptions(pkg) {
  if (!pkg) return [];

  if (Array.isArray(pkg.variants) && pkg.variants.length > 0) {
    return pkg.variants
      .filter((variant) => variant?.isActive !== false)
      .map((variant, index) => {
        const label = String(variant.label || "").trim();
        const pax = Number(variant.pax || parsePax(label));
        const timeSlots = getVariantTimeSlots(variant);
        const timeLabel =
          variant.timeVariationLabel || inferTimeLabelFromSlots(timeSlots);

        const directPrice = Number(variant.price || 0);
        const fallbackPrice = getTextPriceFallback(pkg, pax);
        const price = directPrice > 0 ? directPrice : fallbackPrice;

        const option = {
          _id: variant._id || variant.id || "",
          variantId: variant._id || variant.id || "",
          pax,
          label: label || `${pax} Pax - ${timeLabel}`,
          timeLabel,
          timeSlots,
          price: Number(price || 0),
          hasConfiguredPrice: Number(price || 0) > 0,
          displayOrder: Number(variant.displayOrder || index + 1),
        };

        return {
          ...option,
          key: makeVariantKey(option),
        };
      })
      .filter((item) => item.pax > 0 && item.timeSlots.length > 0)
      .sort(
        (a, b) =>
          Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
          Number(a.pax || 0) - Number(b.pax || 0) ||
          String(a.timeLabel || "").localeCompare(String(b.timeLabel || ""))
      );
  }

  const out = [];

  (pkg?.inclusions || []).forEach((line) => {
    const text = String(line || "");

    if (!/price|₱|php|p\s*\d/i.test(text)) return;

    const pax = parsePax(text);
    const price = parseMoney(text);

    if (pax) {
      const option = {
        pax,
        label: `${pax} PAX - 8 Hours`,
        price,
        hasConfiguredPrice: price > 0,
        timeLabel: "8 Hours",
        timeSlots: EVENT_TIME_SLOTS_8H,
      };

      out.push({ ...option, key: makeVariantKey(option) });
    }
  });

  if (!out.length && pkg?.capacity) {
    const pax = parsePax(pkg.capacity);

    if (pax) {
      const option = {
        pax,
        label: `${pkg.capacity || "Package Rate"} - 8 Hours`,
        price: Number(pkg.price || 0),
        hasConfiguredPrice: Number(pkg.price || 0) > 0,
        timeLabel: "8 Hours",
        timeSlots: EVENT_TIME_SLOTS_8H,
      };

      out.push({ ...option, key: makeVariantKey(option) });
    }
  }

  if (!out.length && pkg?.price) {
    const option = {
      pax: 1,
      label: "Package Rate - 8 Hours",
      price: Number(pkg.price || 0),
      hasConfiguredPrice: Number(pkg.price || 0) > 0,
      timeLabel: "8 Hours",
      timeSlots: EVENT_TIME_SLOTS_8H,
    };

    out.push({ ...option, key: makeVariantKey(option) });
  }

  return out;
}

function normalizePackage(pkg = {}) {
  return {
    ...pkg,
    _id: pkg._id || pkg.id || "",
    title: pkg.title || pkg.name || "Event Package",
    priceOptions: parsePriceOptions(pkg),
  };
}

function normalizeVenuePackage(pkg = {}) {
  const title = pkg.title || pkg.name || "";
  const normalizedTitle = normalizeVenue(title);
  const capacity = getVenueCapacity(pkg);
  const maxBookablePax = capacity ? capacity + MAX_ADDITIONAL_PAX : 0;

  return {
    ...pkg,
    _id: pkg._id || pkg.id || normalizedTitle,
    title,
    normalizedTitle,
    capacity,
    maxBookablePax,
    label: `${title}${
      capacity
        ? ` - Max ${capacity} pax + ${MAX_ADDITIONAL_PAX} additional pax`
        : ""
    }`,
  };
}

function getSavedDraft() {
  try {
    return JSON.parse(sessionStorage.getItem("eventBookingDraft") || "null");
  } catch {
    return null;
  }
}

function getBestRateForPax(options = [], pax = 0, selectedTime = "") {
  const safePax = Number(pax || 0);

  if (!safePax) return null;

  const eligible = options.filter((option) => {
    const optionPax = Number(option.pax || 0);
    const optionMax = optionPax + MAX_ADDITIONAL_PAX;
    const timeOk = selectedTime ? option.timeSlots.includes(selectedTime) : true;

    return optionPax > 0 && optionMax >= safePax && timeOk;
  });

  if (!eligible.length) return null;

  const exact = eligible.find((option) => Number(option.pax) === safePax);
  if (exact) return exact;

  const baseCoversPax = eligible
    .filter((option) => Number(option.pax) >= safePax)
    .sort(
      (a, b) =>
        Number(a.pax || 0) - Number(b.pax || 0) ||
        Number(a.price || 0) - Number(b.price || 0)
    );

  if (baseCoversPax.length) return baseCoversPax[0];

  return eligible.sort(
    (a, b) =>
      Number(b.pax || 0) - Number(a.pax || 0) ||
      Number(a.price || 0) - Number(b.price || 0)
  )[0];
}

function getBaseRateForTime(options = [], selectedTime = "") {
  const eligible = options
    .filter((option) => {
      const optionPax = Number(option.pax || 0);
      const timeOk = selectedTime ? option.timeSlots.includes(selectedTime) : true;

      return optionPax > 0 && timeOk;
    })
    .sort(
      (a, b) =>
        Number(a.pax || 0) - Number(b.pax || 0) ||
        Number(a.price || 0) - Number(b.price || 0)
    );

  return eligible[0] || null;
}

function buildTimeOptionsForRates(rates = [], blockedSlots = []) {
  const blocked = new Set(blockedSlots);
  const map = new Map();

  rates.forEach((rate) => {
    const timeLabel = rate.timeLabel || inferTimeLabelFromSlots(rate.timeSlots);

    rate.timeSlots.forEach((slot) => {
      const isBlocked = blocked.has(slot);

      if (!map.has(slot)) {
        map.set(slot, {
          value: slot,
          label: `${slot} (${timeLabel})${isBlocked ? " — BOOKED" : ""}`,
          timeLabel,
          disabled: isBlocked,
        });
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    const order = { "8 Hours": 1, "12 Hours": 2, "22 Hours": 3 };
    const orderA = order[a.timeLabel] || 99;
    const orderB = order[b.timeLabel] || 99;

    if (orderA !== orderB) return orderA - orderB;

    return a.label.localeCompare(b.label);
  });
}

export default function EventForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const incomingDraft = location.state || getSavedDraft() || {};

  const API_BASE = useMemo(() => getApiBase(), []);
  const presetAppliedRef = useRef(false);

  const presetPackageId =
    incomingDraft.selectedPackageId || incomingDraft.packageId || "";
  const presetPackageTitle =
    incomingDraft.selectedPackage ||
    incomingDraft.selectedPackageTitle ||
    incomingDraft.eventPackage ||
    "";

  const [packages, setPackages] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingDates, setLoadingDates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});
  const [bookedDates, setBookedDates] = useState([]);
  const [blockedTimeSlotsByDate, setBlockedTimeSlotsByDate] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    firstName: incomingDraft.firstName || "",
    lastName: incomingDraft.lastName || "",
    email: incomingDraft.email || "",
    phone: incomingDraft.phone || "",
    serviceType: "Event Package",
    packageId: "",
    eventPackage: "",
    eventDate: incomingDraft.eventDate || "",
    venue: incomingDraft.venue || "",
    time: incomingDraft.time || "",
    basePax: incomingDraft.basePax ? String(incomingDraft.basePax) : "",
    selectedVariantId: incomingDraft.selectedVariantId || incomingDraft.variantId || "",
    pax: incomingDraft.pax ? String(incomingDraft.pax) : "",
    eventTheme: incomingDraft.eventTheme || "",
    eventType: incomingDraft.eventType || "",
    foodAllergy: incomingDraft.foodAllergy || "",
    specialRequest: incomingDraft.specialRequest || "",
    soup: Array.isArray(incomingDraft.soup)
      ? incomingDraft.soup
      : Array.isArray(incomingDraft.appetizer)
      ? incomingDraft.appetizer
      : [],
    rice: Array.isArray(incomingDraft.rice) ? incomingDraft.rice : [],
    pasta: Array.isArray(incomingDraft.pasta) ? incomingDraft.pasta : [],
    chicken: Array.isArray(incomingDraft.chicken) ? incomingDraft.chicken : [],
    pork: Array.isArray(incomingDraft.pork) ? incomingDraft.pork : [],
    vegetable: Array.isArray(incomingDraft.vegetable) ? incomingDraft.vegetable : [],
    dessert: Array.isArray(incomingDraft.dessert) ? incomingDraft.dessert : [],
    drinks: Array.isArray(incomingDraft.drinks) ? incomingDraft.drinks : [],
  });

  const todayLocalISO = useMemo(() => toLocalISO(new Date()), []);
  const oneYearAheadISO = useMemo(() => toLocalISO(addDays(new Date(), 365)), []);

  const selectedDateObj = useMemo(
    () => isoToLocalDateObj(form.eventDate),
    [form.eventDate]
  );

  const minDateObj = useMemo(
    () => isoToLocalDateObj(todayLocalISO),
    [todayLocalISO]
  );

  const excludeDateObjects = useMemo(
    () => bookedDates.map(isoToLocalDateObj).filter(Boolean),
    [bookedDates]
  );

  const selectedPackage = useMemo(() => {
    return (
      packages.find((item) => String(item._id) === String(form.packageId)) ||
      packages.find(
        (item) =>
          String(item.title || "").toLowerCase() ===
          String(form.eventPackage || "").toLowerCase()
      ) ||
      null
    );
  }, [packages, form.packageId, form.eventPackage]);

  const selectedVenue = useMemo(() => {
    return (
      venues.find((item) => item.normalizedTitle === normalizeVenue(form.venue)) ||
      null
    );
  }, [venues, form.venue]);

  const priceOptions = useMemo(
    () => parsePriceOptions(selectedPackage),
    [selectedPackage]
  );

  const venueCapacity = Number(selectedVenue?.capacity || 0);
  const venueMaxBookablePax = venueCapacity
    ? venueCapacity + MAX_ADDITIONAL_PAX
    : 0;

  const packageMaxBookablePax = useMemo(() => {
    if (!priceOptions.length) return 0;

    return Math.max(
      ...priceOptions.map((item) => Number(item.pax || 0) + MAX_ADDITIONAL_PAX)
    );
  }, [priceOptions]);

  const maxAllowedPax = useMemo(() => {
    if (venueMaxBookablePax && packageMaxBookablePax) {
      return Math.min(venueMaxBookablePax, packageMaxBookablePax);
    }

    return venueMaxBookablePax || packageMaxBookablePax || 0;
  }, [venueMaxBookablePax, packageMaxBookablePax]);

  const additionalPax = Number(form.pax || 0);

  const eligibleRatesForSelectedPax = useMemo(() => priceOptions, [priceOptions]);

  const basePaxOptions = useMemo(() => priceOptions, [priceOptions]);

  const selectedBaseOption = useMemo(() => {
    if (!form.selectedVariantId) return null;

    return (
      priceOptions.find((option) => makeVariantKey(option) === form.selectedVariantId) ||
      null
    );
  }, [priceOptions, form.selectedVariantId]);

  const packageBasePax = Number(selectedBaseOption?.pax || 0);
  const foodIncludedPax = packageBasePax;
  const selectedPax = packageBasePax + additionalPax;

  const chargeableFoodPax = additionalPax;

  const foodChargePerExtraPax = ADDITIONAL_PAX_RATE;
  const foodCharge = chargeableFoodPax * foodChargePerExtraPax;

  const additionalPaxCharge = foodCharge;
  const baseAmount = Number(selectedBaseOption?.price || 0);
  const totalAmount = baseAmount + foodCharge;

  const additionalPaxOptions = useMemo(() => {
    if (!form.time || !selectedBaseOption) return [];

    const venueExtraLimit = venueMaxBookablePax
      ? Math.max(0, venueMaxBookablePax - packageBasePax)
      : MAX_ADDITIONAL_PAX;
    const packageExtraLimit = packageMaxBookablePax
      ? Math.max(0, packageMaxBookablePax - packageBasePax)
      : MAX_ADDITIONAL_PAX;
    const maxExtra = Math.min(
      MAX_ADDITIONAL_PAX,
      venueExtraLimit,
      packageExtraLimit
    );

    return Array.from({ length: maxExtra + 1 }, (_, index) => index);
  }, [form.time, selectedBaseOption, venueMaxBookablePax, packageMaxBookablePax, packageBasePax]);

  const selectedDateBlockedTimeSlots = useMemo(() => {
    if (!form.eventDate) return [];

    const slots = blockedTimeSlotsByDate?.[form.eventDate];
    return Array.isArray(slots) ? slots : [];
  }, [blockedTimeSlotsByDate, form.eventDate]);

  const availableTimeOptions = useMemo(() => {
    return buildTimeOptionsForRates(
      selectedBaseOption ? [selectedBaseOption] : [],
      form.eventDate ? selectedDateBlockedTimeSlots : []
    );
  }, [selectedBaseOption, form.eventDate, selectedDateBlockedTimeSlots]);

  const availableEventTimeSlots = useMemo(
    () =>
      availableTimeOptions
        .filter((item) => !item.disabled)
        .map((item) => item.value),
    [availableTimeOptions]
  );

  const disabledTimeOptions = useMemo(
    () =>
      availableTimeOptions
        .filter((item) => item.disabled)
        .map((item) => item.value),
    [availableTimeOptions]
  );

  const selectedTimeVariationLabel = useMemo(() => {
    if (selectedBaseOption?.timeLabel) return selectedBaseOption.timeLabel;

    const matched = availableTimeOptions.find((item) => item.value === form.time);
    return matched?.timeLabel || "All Time Variations";
  }, [selectedBaseOption, availableTimeOptions, form.time]);

  const selectedVariationTimeSlots = useMemo(() => {
    if (selectedBaseOption?.timeSlots?.length) return selectedBaseOption.timeSlots;

    return availableEventTimeSlots;
  }, [selectedBaseOption, availableEventTimeSlots]);

  const selectedDateIsBooked = Boolean(
    form.eventDate && bookedDates.includes(form.eventDate)
  );

  const selectedVenueBlockedByPax = Boolean(
    selectedVenue &&
      packageBasePax &&
      venueMaxBookablePax &&
      packageBasePax > venueMaxBookablePax
  );

  const hasAnyPackageRates = priceOptions.length > 0;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setStatus({ type: "", message: "" });
  };

  const applyPackage = (pkg) => {
    if (!pkg) {
      setForm((prev) => ({
        ...prev,
        packageId: "",
        eventPackage: "",
        selectedVariantId: "",
        basePax: "",
        pax: "",
        venue: "",
        eventDate: "",
        time: "",
      }));

      setBookedDates([]);
      setBlockedTimeSlotsByDate({});
      setErrors((prev) => ({
        ...prev,
        packageId: "",
        pax: "",
        venue: "",
        eventDate: "",
        time: "",
        totalAmount: "",
      }));
      setStatus({ type: "", message: "" });
      return;
    }

    setForm((prev) => ({
      ...prev,
      packageId: pkg._id || "",
      eventPackage: pkg.title || "",
      selectedVariantId: "",
      basePax: "",
      pax: "",
      venue: "",
      eventDate: "",
      time: "",
    }));

    setBookedDates([]);
    setBlockedTimeSlotsByDate({});
    setErrors((prev) => ({
      ...prev,
      packageId: "",
      pax: "",
      venue: "",
      eventDate: "",
      time: "",
      totalAmount: "",
    }));
    setStatus({ type: "", message: "" });
  };

  const applyVenue = (value) => {
    const venue = venues.find((item) => item.normalizedTitle === normalizeVenue(value));

    if (
      packageBasePax &&
      venue?.maxBookablePax &&
      packageBasePax > venue.maxBookablePax
    ) {
      setErrors((prev) => ({
        ...prev,
        venue: `This venue can only handle up to ${venue.maxBookablePax} pax (${venue.capacity} base + ${MAX_ADDITIONAL_PAX} additional), but the selected variation is for ${packageBasePax} pax.`,
      }));

      setStatus({
        type: "error",
        message: `${venue.title} cannot accommodate the selected ${packageBasePax}-pax package variation. Choose another venue.`,
      });

      return;
    }

    setForm((prev) => ({
      ...prev,
      venue: value,
      eventDate: "",
      time: "",
    }));

    setBookedDates([]);
    setBlockedTimeSlotsByDate({});
    setErrors((prev) => ({ ...prev, venue: "", eventDate: "", time: "" }));
    setStatus({ type: "", message: "" });
  };

  const setBasePaxValue = (value) => {
    const selected = priceOptions.find((option) => makeVariantKey(option) === value) || null;

    setForm((prev) => ({
      ...prev,
      selectedVariantId: selected ? makeVariantKey(selected) : "",
      basePax: selected ? String(selected.pax || "") : "",
      venue: "",
      eventDate: "",
      time: "",
      pax: "",
    }));

    setBookedDates([]);
    setBlockedTimeSlotsByDate({});
    setErrors((prev) => ({
      ...prev,
      basePax: "",
      selectedVariantId: "",
      venue: "",
      eventDate: "",
      time: "",
      pax: "",
      totalAmount: "",
    }));
    setStatus({ type: "", message: "" });
  };

  const setPaxValue = (value) => {
    const nextAdditionalPax = String(value || "0");

    setForm((prev) => ({
      ...prev,
      pax: nextAdditionalPax,
    }));

    setErrors((prev) => ({
      ...prev,
      pax: "",
      totalAmount: "",
    }));
    setStatus({ type: "", message: "" });
  };

  const setTimeValue = (value) => {
    setForm((prev) => ({
      ...prev,
      time: value,
      pax: "0",
    }));

    setErrors((prev) => ({ ...prev, time: "", pax: "", totalAmount: "" }));
    setStatus({ type: "", message: "" });
  };

  const toggleCheckboxValue = (key, value) => {
    const current = Array.isArray(form[key]) ? form[key] : [];
    const alreadySelected = current.includes(value);

    if (!alreadySelected && current.length >= MAX_MENU_CHOICES_PER_CATEGORY) {
      setErrors((prev) => ({
        ...prev,
        [key]: `Maximum of ${MAX_MENU_CHOICES_PER_CATEGORY} choices only.`,
      }));

      setStatus({
        type: "error",
        message: `You can select up to ${MAX_MENU_CHOICES_PER_CATEGORY} choices only per food category.`,
      });

      return;
    }

    setForm((prev) => ({
      ...prev,
      [key]: alreadySelected
        ? current.filter((item) => item !== value)
        : [...current, value],
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
      ...(MAIN_MENU_KEYS.includes(key) ? { mainMenu: "" } : {}),
    }));

    setStatus({ type: "", message: "" });
  };

  const fetchPackages = async () => {
    setLoadingPackages(true);

    try {
      const res = await fetch(`${API_BASE}/packages?type=event_package`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to load event packages.");
      }

      const list = Array.isArray(data.packages)
        ? data.packages.filter((item) => item?.isActive !== false)
        : [];

      const normalized = list
        .map(normalizePackage)
        .sort((a, b) => {
          const orderA = Number(a.displayOrder || 0);
          const orderB = Number(b.displayOrder || 0);

          if (orderA !== orderB) return orderA - orderB;

          return String(a.title || "").localeCompare(String(b.title || ""));
        });

      setPackages(normalized);
    } catch (error) {
      console.error("fetch event packages error:", error);
      setStatus({
        type: "error",
        message: "Could not load Event Packages. Please check your backend.",
      });
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchVenues = async () => {
    setLoadingVenues(true);

    try {
      const res = await fetch(`${API_BASE}/packages?type=resort_venue`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to load resort venues.");
      }

      const list = Array.isArray(data.packages)
        ? data.packages.filter((item) => item?.isActive !== false)
        : [];

      const normalized = list
        .map(normalizeVenuePackage)
        .filter((item) => item.title && item.capacity > 0)
        .sort((a, b) => {
          const orderA = Number(a.displayOrder || 0);
          const orderB = Number(b.displayOrder || 0);

          if (orderA !== orderB) return orderA - orderB;

          return String(a.title || "").localeCompare(String(b.title || ""));
        });

      setVenues(normalized);
    } catch (error) {
      console.error("fetch resort venues error:", error);
      setStatus({
        type: "error",
        message: "Could not load available venues. Please check your backend.",
      });
      setVenues([]);
    } finally {
      setLoadingVenues(false);
    }
  };

  const fetchBookedDates = async (venue) => {
    const token = getHotelToken();

    if (!token || !venue) return;

    setLoadingDates(true);

    try {
      const query = new URLSearchParams({
        venue,
        from: todayLocalISO,
        to: oneYearAheadISO,
        packageId: form.packageId || "",
        eventPackage: form.eventPackage || "",
      });

      const res = await fetch(`${API_BASE}/event-bookings/booked-dates?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("hotelToken");
        navigate("/hotel-login");
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to load booked dates.");
      }

      const fullyBookedDates = Array.isArray(data.fullBookedDates)
        ? data.fullBookedDates
        : Array.isArray(data.bookedDates)
        ? data.bookedDates
        : [];

      setBookedDates(fullyBookedDates);
      setBlockedTimeSlotsByDate(
        data.blockedTimeSlotsByDate && typeof data.blockedTimeSlotsByDate === "object"
          ? data.blockedTimeSlotsByDate
          : {}
      );
    } catch (error) {
      console.error("fetch event booked dates error:", error);
      setBookedDates([]);
      setBlockedTimeSlotsByDate({});
    } finally {
      setLoadingDates(false);
    }
  };

  const fetchProfile = async () => {
    const token = getHotelToken();

    if (!token) {
      navigate("/hotel-login");
      return;
    }

    setLoadingProfile(true);

    try {
      const res = await fetch(`${API_BASE}/hotel-user-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        firstName: prev.firstName || profile.firstName || "",
        lastName: prev.lastName || profile.lastName || "",
        email: prev.email || profile.email || "",
        phone: prev.phone || profile.phone || profile.contactNumber || "",
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

  useEffect(() => {
    fetchPackages();
    fetchVenues();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!form.venue) return;
    fetchBookedDates(form.venue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.venue, form.packageId]);

  useEffect(() => {
    if (presetAppliedRef.current || !packages.length) return;

    if (!presetPackageId && !presetPackageTitle) {
      setForm((prev) => ({
        ...prev,
        packageId: "",
        eventPackage: "",
        selectedVariantId: "",
        basePax: "",
        pax: "",
        venue: "",
        eventDate: "",
        time: "",
      }));

      setBookedDates([]);
      setBlockedTimeSlotsByDate({});
      presetAppliedRef.current = true;
      return;
    }

    const matchedById = presetPackageId
      ? packages.find((item) => String(item._id) === String(presetPackageId))
      : null;

    const matchedByTitle = presetPackageTitle
      ? packages.find(
          (item) =>
            String(item.title || "").trim().toLowerCase() ===
            String(presetPackageTitle || "").trim().toLowerCase()
        )
      : null;

    const matched = matchedById || matchedByTitle;

    if (!matched) return;

    setForm((prev) => ({
      ...prev,
      packageId: matched._id || presetPackageId || "",
      eventPackage: matched.title || presetPackageTitle || "",
      selectedVariantId: "",
      basePax: "",
      pax: "",
      venue: "",
      eventDate: "",
      time: "",
    }));

    setBookedDates([]);
    setBlockedTimeSlotsByDate({});
    presetAppliedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages, presetPackageId, presetPackageTitle]);

  useEffect(() => {
    if (!form.time) return;

    if (!availableEventTimeSlots.includes(form.time)) {
      setForm((prev) => ({ ...prev, time: "", pax: "" }));
      setErrors((prev) => ({
        ...prev,
        time: "This time is already booked. Please choose another time.",
        pax: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableEventTimeSlots.join("|")]);

  const checkAvailability = async () => {
    const token = getHotelToken();

    if (!token) {
      navigate("/hotel-login");
      return { ok: false, available: false, message: "Please log in again." };
    }

    const query = new URLSearchParams({
      venue: form.venue,
      eventDate: form.eventDate,
      time: form.time,
      packageId: form.packageId || "",
      eventPackage: form.eventPackage || "",
      variantId: selectedBaseOption?.variantId || "",
      basePax: selectedBaseOption?.pax || "",
    });

    const res = await fetch(`${API_BASE}/event-bookings/check?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("hotelToken");
      navigate("/hotel-login");
      return { ok: false, available: false, message: "Please log in again." };
    }

    if (!res.ok) {
      return {
        ok: false,
        available: false,
        message: data.message || "Could not check event availability.",
      };
    }

    return data;
  };

  const validate = () => {
    const next = {};

    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";

    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Invalid email format.";
    }

    if (!form.phone.trim()) next.phone = "Phone number is required.";
    else if (!/^09\d{9}$/.test(form.phone)) {
      next.phone = "Phone must be 11 digits and start with 09.";
    }

    if (!form.packageId) next.packageId = "Select package.";

    if (!hasAnyPackageRates) {
      next.packageId =
        "This package has no active pax/time rates. Please edit this package in admin.";
    }

    if (!selectedBaseOption) next.basePax = "Choose number of pax.";

    if (!form.venue) next.venue = "Choose a venue.";

    if (selectedVenueBlockedByPax) {
      next.venue = `This venue allows only up to ${venueMaxBookablePax} pax, but the selected variation is for ${packageBasePax} pax.`;
    }

    if (!form.eventDate) next.eventDate = "Choose a date.";
    else if (form.eventDate < todayLocalISO) {
      next.eventDate = "Date cannot be in the past.";
    } else if (bookedDates.includes(form.eventDate)) {
      next.eventDate = "This venue is fully booked for this date.";
    }

    const pax = Number(form.pax || 0);

    if (form.pax === "") next.pax = "Choose additional pax.";
    else if (!Number.isFinite(pax) || pax < 0) {
      next.pax = "Additional pax must be 0 or higher.";
    } else if (pax > MAX_ADDITIONAL_PAX) {
      next.pax = `Maximum additional pax is ${MAX_ADDITIONAL_PAX}.`;
    } else if (maxAllowedPax && selectedPax > maxAllowedPax) {
      next.pax = `Maximum ${maxAllowedPax} total pax only for this package and venue.`;
    } else if (!selectedBaseOption) {
      next.pax = "No package rate can support the selected time.";
    }

    if (!form.time) next.time = "Choose a time.";
    else if (!availableEventTimeSlots.includes(form.time)) {
      next.time =
        "This time is blocked by a pending or approved booking. Please choose another slot.";
    }

    if (!form.eventTheme.trim()) next.eventTheme = "Event theme is required.";
    if (!form.eventType.trim()) next.eventType = "Event type is required.";

    if (!form.soup.length) next.soup = "Choose at least one soup.";
    if (!form.rice.length) next.rice = "Choose at least one rice.";

    const hasMain =
      form.pasta.length ||
      form.chicken.length ||
      form.pork.length ||
      form.vegetable.length;

    if (!hasMain) next.mainMenu = "Choose at least one main menu item.";
    if (!form.dessert.length) next.dessert = "Choose at least one dessert.";
    if (!form.drinks.length) next.drinks = "Choose at least one drink.";

    MENU_CATEGORY_KEYS.forEach((key) => {
      const selected = Array.isArray(form[key]) ? form[key] : [];

      if (selected.length > MAX_MENU_CHOICES_PER_CATEGORY) {
        next[key] = `Maximum of ${MAX_MENU_CHOICES_PER_CATEGORY} choices only.`;
      }
    });

    if (!totalAmount || totalAmount <= 0) {
      next.totalAmount =
        "Total amount cannot be computed. Please check package price, pax, and food charge.";
    }

    return next;
  };

  const buildMenuPayload = () => ({
    appetizer: [...form.soup],
    mainDish: [
      ...form.rice.map((item) => `Rice - ${item}`),
      ...form.pasta.map((item) => `Pasta - ${item}`),
      ...form.chicken.map((item) => `Chicken - ${item}`),
      ...form.pork.map((item) => `Pork - ${item}`),
      ...form.vegetable.map((item) => `Vegetable - ${item}`),
    ],
    dessert: [...form.dessert],
    drinks: [...form.drinks],
  });

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

      if (!availability.ok && availability.success !== true) {
        setStatus({
          type: "error",
          message: availability.message || "Could not check event availability.",
        });
        setSubmitting(false);
        return;
      }

      if (!availability.available) {
        setErrors((prev) => ({
          ...prev,
          time:
            availability.message ||
            "This event time slot is already blocked by a pending or approved booking.",
        }));

        setStatus({
          type: "error",
          message:
            availability.message ||
            "Selected event time is not available for this venue.",
        });

        setSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("event availability error:", error);
      setStatus({
        type: "error",
        message: "Network error while checking event availability.",
      });
      setSubmitting(false);
      return;
    }

    const payload = {
      ...form,
      ...buildMenuPayload(),
      packageId: selectedPackage?._id || form.packageId,
      selectedPackageId: selectedPackage?._id || form.packageId,
      selectedVariantId: selectedBaseOption?.variantId || makeVariantKey(selectedBaseOption),
      variantId: selectedBaseOption?.variantId || makeVariantKey(selectedBaseOption),
      selectedVariantLabel: selectedBaseOption?.label || "",
      timeVariationLabel: selectedTimeVariationLabel,
      selectedTimeSlots: selectedVariationTimeSlots,
      eventPackage: selectedPackage?.title || form.eventPackage,
      selectedPackageTitle: selectedPackage?.title || form.eventPackage,
      basePax: Number(packageBasePax),
      pax: Number(selectedPax),
      totalGuests: Number(selectedPax),
      venue: normalizeVenue(form.venue),
      venueDisplayName: selectedVenue?.title || form.venue,
      venueCapacity,
      venueMaxBookablePax,
      maxAdditionalPax: MAX_ADDITIONAL_PAX,
      foodIncludedPax,
      chargeableFoodPax,
      foodChargePerExtraPax,
      foodCharge,
      additionalPax,
      additionalPaxRate: ADDITIONAL_PAX_RATE,
      baseAmount,
      additionalPaxCharge,
      totalAmount,
      selectedCapacity: `${packageBasePax} Pax`,
      selectedInclusions: selectedPackage?.inclusions || [],
      packageMeta: selectedPackage,
    };

    sessionStorage.setItem("eventBookingDraft", JSON.stringify(payload));
    navigate("/event-summary", { state: payload });
    setSubmitting(false);
  };

  const bottomValidationMessages = useMemo(() => {
    const messages = Object.values(errors)
      .map((item) => String(item || "").trim())
      .filter(Boolean);

    if (status.type === "error" && status.message) {
      const cleanStatus = String(status.message).trim();

      if (
        cleanStatus &&
        cleanStatus !== "Please complete the required fields." &&
        !messages.includes(cleanStatus)
      ) {
        messages.unshift(cleanStatus);
      }
    }

    return [...new Set(messages)];
  }, [errors, status]);

  const goToProfile = () => {
    const token = getHotelToken();
    navigate(token ? "/hotel-profile" : "/hotel-login");
  };

  const statusClass =
    status.type === "success"
      ? "ltc-status-success"
      : status.type === "error"
      ? "ltc-status-error"
      : "ltc-status-info";

  return (
    <div className="ltc-event-form-page" style={fontPontano}>
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
            alt="Event booking background"
            className="ltc-hero-slide"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ltc-container ltc-hero-content">
            <span className="ltc-eyebrow" style={fontMontserrat}>
              Event Package Booking
            </span>

            <h1 className="ltc-hero-title" style={fontMontserrat}>
              Booking <span>Form</span>
            </h1>

            <p className="ltc-hero-text" style={fontPontano}>
              Complete your event package details, choose your menu, check venue
              availability, and review your final amount before proceeding.
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

              <Section title="Personal Details">
                <Field
                  label="First Name"
                  value={form.firstName}
                  disabled={loadingProfile}
                  error={errors.firstName}
                  placeholder="Enter first name"
                  onChange={(value) =>
                    setField(
                      "firstName",
                      value.replace(/[^A-Za-z\s]/g, "").slice(0, 30)
                    )
                  }
                />

                <Field
                  label="Last Name"
                  value={form.lastName}
                  disabled={loadingProfile}
                  error={errors.lastName}
                  placeholder="Enter last name"
                  onChange={(value) =>
                    setField(
                      "lastName",
                      value.replace(/[^A-Za-z\s]/g, "").slice(0, 30)
                    )
                  }
                />

                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  disabled={loadingProfile}
                  error={errors.email}
                  placeholder="Enter email"
                  onChange={(value) =>
                    setField("email", value.replace(/\s/g, "").slice(0, 60))
                  }
                />

                <Field
                  label="Phone Number"
                  value={form.phone}
                  disabled={loadingProfile}
                  error={errors.phone}
                  placeholder="09XXXXXXXXX"
                  inputMode="numeric"
                  onChange={(value) =>
                    setField("phone", value.replace(/\D/g, "").slice(0, 11))
                  }
                />
              </Section>

              <div className="ltc-booking-section">
                <div className="ltc-booking-header">
                  <div>
                    <h2 className="ltc-section-heading" style={fontMontserrat}>
                      Booking Details
                    </h2>
                    <div className="ltc-section-line" />
                  </div>

                  <input
                    value="Event Package"
                    disabled
                    readOnly
                    className="ltc-service-pill"
                    style={fontPoppins}
                  />
                </div>

                <div className="ltc-fields-grid">
                  <SelectField
                    label="Choose Package"
                    value={form.packageId}
                    onChange={(value) => {
                      applyPackage(
                        packages.find((item) => String(item._id) === String(value))
                      );
                    }}
                    options={packages.map((pkg) => ({
                      value: pkg._id,
                      label: pkg.title,
                    }))}
                    placeholder={loadingPackages ? "Loading packages..." : "Select package"}
                    error={errors.packageId}
                    disabled={loadingPackages}
                  />

                  <SelectField
                    label="Number of Pax"
                    value={form.selectedVariantId}
                    onChange={setBasePaxValue}
                    options={basePaxOptions.map((option) => ({
                      value: makeVariantKey(option),
                      label: `${option.pax} pax - ${option.timeLabel} (${formatPeso(option.price)})`,
                    }))}
                    placeholder={
                      !selectedPackage
                        ? "Select package first"
                        : hasAnyPackageRates
                        ? "Select number of pax"
                        : "No active pax rates in package"
                    }
                    error={errors.basePax || errors.selectedVariantId}
                    disabled={!selectedPackage || !hasAnyPackageRates}
                  />

                  <SelectField
                    label="Choose Venue"
                    value={form.venue}
                    onChange={applyVenue}
                    options={venues.map((item) => ({
                      value: item.normalizedTitle,
                      label:
                        packageBasePax && item.maxBookablePax && packageBasePax > item.maxBookablePax
                          ? `${item.label} - cannot accommodate ${packageBasePax} pax`
                          : item.label,
                    }))}
                    disabledOptions={venues
                      .filter(
                        (item) =>
                          packageBasePax &&
                          item.maxBookablePax &&
                          packageBasePax > item.maxBookablePax
                      )
                      .map((item) => item.normalizedTitle)}
                    placeholder={
                      !selectedPackage
                        ? "Select package first"
                        : !selectedBaseOption
                        ? "Select number of pax first"
                        : loadingVenues
                        ? "Loading venues..."
                        : "Select venue"
                    }
                    error={errors.venue}
                    disabled={loadingVenues || !selectedBaseOption}
                  />

                  <DateField
                    label="Choose Date"
                    selectedDateObj={selectedDateObj}
                    minDateObj={minDateObj}
                    excludeDates={excludeDateObjects}
                    disabled={!form.venue || loadingDates}
                    placeholder={
                      !selectedPackage
                        ? "Select package first"
                        : !selectedBaseOption
                        ? "Select number of pax first"
                        : !form.venue
                        ? "Select venue first"
                        : loadingDates
                        ? "Loading available dates..."
                        : "Select date"
                    }
                    error={errors.eventDate}
                    onChange={(date) => {
                      setField("eventDate", date ? toLocalISO(date) : "");
                      setField("time", "");
                      setField("pax", "");
                    }}
                  />

                  <SelectField
                    label="Time"
                    value={form.time}
                    onChange={setTimeValue}
                    options={availableTimeOptions}
                    disabledOptions={disabledTimeOptions}
                    placeholder={
                      !selectedPackage
                        ? "Select package first"
                        : !selectedBaseOption
                        ? "Select number of pax first"
                        : !form.venue
                        ? "Select venue first"
                        : !form.eventDate
                        ? "Select date first"
                        : selectedDateIsBooked
                        ? "Date is fully booked"
                        : availableEventTimeSlots.length
                        ? "Select time"
                        : "No time slots available"
                    }
                    error={errors.time}
                    disabled={
                      !selectedBaseOption ||
                      !form.venue ||
                      !form.eventDate ||
                      selectedDateIsBooked ||
                      availableEventTimeSlots.length === 0
                    }
                  />

                  <SelectField
                    label="Additional Pax"
                    value={form.pax}
                    onChange={setPaxValue}
                    options={additionalPaxOptions.map((item) => ({
                      value: String(item),
                      label:
                        item === 0
                          ? "No additional pax"
                          : `+${item} pax (${formatPeso(item * ADDITIONAL_PAX_RATE)})`,
                    }))}
                    placeholder={
                      !selectedPackage
                        ? "Select package first"
                        : !selectedBaseOption
                        ? "Select number of pax first"
                        : !form.venue
                        ? "Select venue first"
                        : !form.eventDate
                        ? "Select date first"
                        : !form.time
                        ? "Select time first"
                        : hasAnyPackageRates
                        ? "Select additional pax"
                        : "No active rates in package"
                    }
                    error={errors.pax}
                    disabled={!form.time || !additionalPaxOptions.length}
                  />
                </div>

                {form.venue ? (
                  <p className="ltc-help-text" style={fontPoppins}>
                    Dates stay open while at least one time slot is available.
                  </p>
                ) : null}

                {selectedVenue || selectedBaseOption ? (
                  <div className="ltc-rate-card">
                    <div className="ltc-info-grid">
                      <InfoBox
                        label="Selected Base Rate"
                        value={
                          selectedBaseOption
                            ? `${selectedBaseOption.pax} pax - ${selectedBaseOption.timeLabel}`
                            : "Choose pax and time"
                        }
                      />

                      <InfoBox
                        label="Venue Base Capacity"
                        value={venueCapacity ? `${venueCapacity} pax` : "Not set"}
                      />

                      <InfoBox
                        label="Venue Max Bookable"
                        value={
                          venueMaxBookablePax
                            ? `${venueMaxBookablePax} pax`
                            : "Choose venue"
                        }
                      />

                      <InfoBox
                        label="Extra Food Rate"
                        value={`${formatPeso(ADDITIONAL_PAX_RATE)} / pax`}
                      />
                    </div>

                    <div className="ltc-price-card">
                      <div className="ltc-price-row">
                        <p className="ltc-price-label" style={fontMontserrat}>
                          Total Amount:
                        </p>

                        <p className="ltc-price-value" style={fontMontserrat}>
                          {formatPeso(totalAmount)}
                        </p>
                      </div>

                      <div className="ltc-price-breakdown" style={fontPoppins}>
                        <p>
                          Base package food price: {formatPeso(baseAmount)} for{" "}
                          {foodIncludedPax || 0} pax
                        </p>
                        <p>Additional pax: {additionalPax}</p>
                        <p>Additional charge: {formatPeso(foodCharge)}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <Section title="Customize Package">
                <Field
                  label="Event Type"
                  value={form.eventType}
                  error={errors.eventType}
                  placeholder="Type event type"
                  onChange={(value) => setField("eventType", value.slice(0, 40))}
                />

                <Field
                  label="Event Theme"
                  value={form.eventTheme}
                  error={errors.eventTheme}
                  placeholder="Type event theme"
                  onChange={(value) => setField("eventTheme", value.slice(0, 60))}
                />

                <Field
                  label="Food Allergy"
                  value={form.foodAllergy}
                  placeholder="Type food allergy"
                  onChange={(value) => setField("foodAllergy", value.slice(0, 80))}
                />

                <div className="ltc-field ltc-field-full">
                  <label style={fontMontserrat}>Special Request</label>

                  <textarea
                    value={form.specialRequest}
                    onChange={(event) =>
                      setField("specialRequest", event.target.value.slice(0, 300))
                    }
                    placeholder="Type special request"
                    rows={4}
                    className="ltc-textarea"
                    style={fontPoppins}
                  />
                </div>
              </Section>

              <div className="ltc-menu-header">
                <h2 className="ltc-section-heading" style={fontMontserrat}>
                  Food Menu Choices
                </h2>
                <div className="ltc-section-line" />

                <p className="ltc-menu-text" style={fontPoppins}>
                  You can choose a maximum of {MAX_MENU_CHOICES_PER_CATEGORY} items
                  per food category.
                </p>

                {errors.mainMenu ? (
                  <p className="ltc-error-text" style={fontPoppins}>
                    {errors.mainMenu}
                  </p>
                ) : null}

                <div className="ltc-menu-grid">
                  {MENU_CATEGORY_KEYS.map((key) => (
                    <CheckboxGroup
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      options={MENU_OPTIONS[key]}
                      selectedValues={form[key]}
                      onToggle={(value) => toggleCheckboxValue(key, value)}
                      error={errors[key]}
                      maxChoices={MAX_MENU_CHOICES_PER_CATEGORY}
                    />
                  ))}
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
                  className="ltc-primary-button"
                  style={fontMontserrat}
                  type="button"
                >
                  {submitting ? "Processing..." : "Proceed"}
                </button>

                <button
                  onClick={() => navigate("/event-package")}
                  disabled={submitting}
                  className="ltc-secondary-button ltc-cancel-button"
                  style={fontMontserrat}
                  type="button"
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

function Section({ title, children }) {
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
  disabledOptions = [],
}) {
  return (
    <div className="ltc-field">
      <label style={fontMontserrat}>{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? "true" : "false"}
        className="ltc-select"
        style={fontPoppins}
      >
        <option value="" disabled>{placeholder}</option>

        {options.map((option, index) => {
          const optionValue = typeof option === "object" ? option.value : option;
          const optionLabel = typeof option === "object" ? option.label : option;

          return (
            <option
              key={`${optionValue}-${index}`}
              value={optionValue}
              disabled={disabledOptions.includes(optionValue)}
            >
              {optionLabel}
            </option>
          );
        })}
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
  excludeDates = [],
  disabled,
  error,
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
          excludeDates={excludeDates}
          placeholderText={placeholder}
          dateFormat="MM/dd/yyyy"
          wrapperClassName="w-full"
          popperClassName="ltc-datepicker-popper"
          popperPlacement="bottom-start"
          shouldCloseOnSelect
          onKeyDown={(event) => event.preventDefault()}
          onPaste={(event) => event.preventDefault()}
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

function CheckboxGroup({
  label,
  options,
  selectedValues = [],
  onToggle,
  error,
  maxChoices = MAX_MENU_CHOICES_PER_CATEGORY,
}) {
  const safeSelectedValues = Array.isArray(selectedValues) ? selectedValues : [];
  const selectedCount = safeSelectedValues.length;
  const maxReached = selectedCount >= maxChoices;

  return (
    <div className="ltc-checkbox-card">
      <div className="ltc-checkbox-top">
        <div>
          <p className="ltc-checkbox-title" style={fontMontserrat}>
            {label}
          </p>

          <p className="ltc-checkbox-subtitle" style={fontPoppins}>
            Choose up to {maxChoices} only.
          </p>
        </div>

        <span className={`ltc-choice-count ${maxReached ? "max" : ""}`}>
          {selectedCount}/{maxChoices}
        </span>
      </div>

      <div className="ltc-checkbox-list">
        {options.map((option) => {
          const checked = safeSelectedValues.includes(option);
          const disabled = !checked && maxReached;

          return (
            <label
              key={option}
              className={`ltc-checkbox-row ${disabled ? "disabled" : ""}`}
              style={fontPoppins}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => onToggle(option)}
              />

              <span>{option}</span>
            </label>
          );
        })}
      </div>

      {error ? (
        <p className="ltc-error-text" style={fontPoppins}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="ltc-info-tile">
      <p className="ltc-info-label" style={fontMontserrat}>
        {label}
      </p>
      <p className="ltc-info-value" style={fontPoppins}>
        {value}
      </p>
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
            <p style={fontPontano}>
              Resort, venue, hotel, and events booking services.
            </p>
          </div>
        </button>

        <nav className="ltc-desktop-nav" style={fontPoppins}>
          <NavButton label="Home" onClick={() => navigate("/resort-venue")} />
          <NavButton label="Virtual Tour" onClick={() => navigate("/virtual-tour")} />
          <NavButton label="Contact" onClick={() => navigate("/hotel-contact-us")} />
          <NavButton label="FAQs" onClick={() => navigate("/hotel-faqs")} />
          <NavButton
            label={getHotelToken() ? "Profile" : "Sign In"}
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
              window.location.href = getHotelToken()
                ? "/hotel-profile"
                : "/hotel-login";
            }}
          >
            {getHotelToken() ? "Profile" : "Sign In"}
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
        <span style={fontPontano}>
          © 2026 LTC GROUP OF COMPANIES. All rights reserved.
        </span>
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
          label={getHotelToken() ? "PROFILE" : "SIGN IN"}
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
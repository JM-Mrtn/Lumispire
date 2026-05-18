// HotelRecommendations.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelChatbot from "./HotelChatbot";

const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const SERVICE_OPTIONS = ["Any", "Hotel", "Resort & Venue", "Event Package"];
const VIBE_OPTIONS = [
  "Any",
  "nature",
  "family",
  "overnight",
  "budget",
  "formal",
  "birthday",
  "wedding",
  "corporate",
];
const DURATION_OPTIONS = ["Any", "8 Hours", "12 Hours", "22 Hours"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-recommendations-page {
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

  .ltc-recommendations-page * { box-sizing: border-box; }

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
`;

const HotelRecommendations = () => {
  const navigate = useNavigate();

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
      /\/+$/,
      ""
    );
    if (raw.includes("/api/hotel")) return raw;
    if (raw.includes("/api/")) return raw;
    return `${raw}/api/hotel`;
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    preferredService: "Any",
    preferredVibe: "Any",
    duration: "Any",
    eventType: "",
    pax: "",
    budget: "",
  });

  const [loading, setLoading] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });

  const goToProfile = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");
    navigate(token ? "/hotel-profile" : "/hotel-login");
  };

  const setField = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setStatus({ type: "", message: "" });
  };

  const buildQuery = () => {
    const q = new URLSearchParams();

    if (filters.preferredService && filters.preferredService !== "Any") {
      q.set("preferredService", filters.preferredService);
    }

    if (filters.preferredVibe && filters.preferredVibe !== "Any") {
      q.set("preferredVibe", filters.preferredVibe);
    }

    if (filters.duration && filters.duration !== "Any") {
      q.set("duration", filters.duration);
    }

    if (filters.eventType.trim()) {
      q.set("eventType", filters.eventType.trim());
    }

    if (filters.pax) {
      q.set("pax", filters.pax);
    }

    if (filters.budget) {
      q.set("budget", filters.budget);
    }

    return q.toString();
  };

  const fetchRecommendations = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/hotel-login");
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const qs = buildQuery();
      const url = `${API_BASE}/recommendations${qs ? `?${qs}` : ""}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        navigate("/hotel-login");
        return;
      }

      if (!res.ok) {
        setRecommendations([]);
        setStatus({
          type: "error",
          message: data.message || "Failed to load recommendations.",
        });
        return;
      }

      setHistoryCount(Number(data.historyCount || 0));
      setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
    } catch (err) {
      console.error(err);
      setRecommendations([]);
      setStatus({
        type: "error",
        message: "Network error while loading recommendations.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusClass =
    status.type === "success"
      ? "ltc-status-success"
      : status.type === "error"
      ? "ltc-status-error"
      : "ltc-status-info";

  return (
    <div className="ltc-recommendations-page" style={fontPontano}>
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
            alt="Hotel recommendations background"
            className="ltc-hero-slide"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ltc-container ltc-hero-content">
            <span className="ltc-eyebrow" style={fontMontserrat}>
              Smart Recommendations
            </span>

            <h1 className="ltc-hero-title" style={fontMontserrat}>
              Recommended <span>for You</span>
            </h1>

            <p className="ltc-hero-text" style={fontPontano}>
              Suggestions are based on your selected preferences and your previous
              hotel, resort, and event bookings.
            </p>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-form-shell">
              <div className="ltc-filter-header">
                <div>
                  <h2 className="ltc-section-heading" style={fontMontserrat}>
                    Find Your Best Match
                  </h2>
                  <div className="ltc-section-line" />
                  <p className="ltc-muted-text" style={fontPoppins}>
                    Adjust the filters below to get booking recommendations that fit your service, vibe, duration, pax, and budget.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/hotel-resort")}
                  className="ltc-secondary-button"
                  style={fontMontserrat}
                >
                  Back to Services
                </button>
              </div>

              <div className="ltc-filter-grid">
                <SelectField
                  label="Preferred Service"
                  value={filters.preferredService}
                  onChange={(v) => setField("preferredService", v)}
                  options={SERVICE_OPTIONS}
                />

                <SelectField
                  label="Vibe / Purpose"
                  value={filters.preferredVibe}
                  onChange={(v) => setField("preferredVibe", v)}
                  options={VIBE_OPTIONS}
                />

                <SelectField
                  label="Duration"
                  value={filters.duration}
                  onChange={(v) => setField("duration", v)}
                  options={DURATION_OPTIONS}
                />

                <Field
                  label="Event Type"
                  value={filters.eventType}
                  onChange={(v) => setField("eventType", v.slice(0, 40))}
                  placeholder="Wedding, birthday..."
                />

                <Field
                  label="Pax"
                  value={filters.pax}
                  onChange={(v) => setField("pax", v.replace(/\D/g, "").slice(0, 3))}
                  placeholder="e.g. 5"
                  inputMode="numeric"
                />

                <Field
                  label="Budget"
                  value={filters.budget}
                  onChange={(v) => setField("budget", v.replace(/\D/g, "").slice(0, 7))}
                  placeholder="e.g. 5000"
                  inputMode="numeric"
                />
              </div>

              <div className="ltc-filter-actions">
                <span className="ltc-history-pill" style={fontPoppins}>
                  Booking history used: {historyCount} record(s)
                </span>

                <button
                  type="button"
                  onClick={fetchRecommendations}
                  disabled={loading}
                  className="ltc-primary-button"
                  style={fontMontserrat}
                >
                  {loading ? "Loading..." : "Update Recommendations"}
                </button>
              </div>

              {status.message ? (
                <div className={`ltc-status ${statusClass}`} style={fontPoppins}>
                  {status.message}
                </div>
              ) : null}
            </div>

            <div className="ltc-recommendations-grid">
              {recommendations.map((item) => (
                <RecommendationCard key={item.id} item={item} navigate={navigate} />
              ))}
            </div>

            {!loading && recommendations.length === 0 && !status.message ? (
              <div className="ltc-form-shell ltc-empty-state">
                <h2 className="ltc-section-heading" style={fontMontserrat}>
                  No Recommendations Found
                </h2>
                <div className="ltc-section-line" style={{ marginLeft: "auto", marginRight: "auto" }} />
                <p className="ltc-muted-text" style={fontPoppins}>
                  Try lowering the budget filter or selecting “Any” service.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
      <HotelChatbot />

      {isOpen ? (
        <MobileMenu
          onClose={() => setIsOpen(false)}
          navigate={navigate}
          goToProfile={goToProfile}
        />
      ) : null}
    </div>
  );
};

function RecommendationCard({ item, navigate }) {
  const typeLabel =
    item.type === "hotel"
      ? "Hotel Room"
      : item.type === "resort"
      ? "Resort & Venue"
      : "Event Package";

  const formatPeso = (n) =>
    typeof n === "number" ? `₱${n.toLocaleString("en-PH")}` : "—";

  return (
    <article className="ltc-recommendation-card">
      <div className="ltc-card-top">
        <div className="ltc-card-top-inner">
          <div>
            <p className="ltc-card-eyebrow" style={fontMontserrat}>
              {typeLabel}
            </p>
            <h3 className="ltc-card-title" style={fontMontserrat}>
              {item.title}
            </h3>
          </div>

          <div className="ltc-match-badge" style={fontMontserrat}>
            <span>Match</span>
            <strong>{item.matchPercent}%</strong>
          </div>
        </div>
      </div>

      <div className="ltc-card-body">
        <div className="ltc-info-grid">
          <Info label="Price" value={formatPeso(item.price)} />
          <Info label="Max Pax" value={item.paxMax || "—"} />
          <Info label="Service" value={item.serviceType} />
          <Info label="Duration" value={item.duration || "Flexible"} />
        </div>

        <p className="ltc-reason-title" style={fontMontserrat}>
          Why this is recommended
        </p>

        <ul className="ltc-reason-list" style={fontPoppins}>
          {(item.reasons || []).map((reason) => (
            <li key={reason}>
              <span className="ltc-reason-dot" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        <div className="ltc-tag-row">
          {(item.tags || []).slice(0, 4).map((tag) => (
            <span key={tag} className="ltc-tag" style={fontPoppins}>
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate(item.route || "/hotel-resort")}
          className="ltc-primary-button ltc-card-button"
          style={fontMontserrat}
        >
          Book / View Details
        </button>
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div className="ltc-info-box">
      <p className="ltc-info-label" style={fontMontserrat}>
        {label}
      </p>
      <p className="ltc-info-value" style={fontPoppins}>
        {value}
      </p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, inputMode }) {
  return (
    <div className="ltc-field">
      <label style={fontMontserrat}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="ltc-input"
        style={fontPoppins}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="ltc-field">
      <label style={fontMontserrat}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ltc-select"
        style={fontPoppins}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "Any" ? "Any" : option}
          </option>
        ))}
      </select>
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

export default HotelRecommendations;

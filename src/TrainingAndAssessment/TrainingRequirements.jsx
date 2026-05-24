// src/TrainingAndAssessment/TrainingRequirements.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TrainingChatbot from "./TrainingChatbot";

const LOGO_IMAGE = "/logo.png";
const HERO_IMAGE = "/tamsi-banner.jpg";

const TRAINING_HOME_ROUTE = "/training";
const TRAINING_ENROLL_ROUTE = "/training-enroll";
const TRAINING_COURSE_ROUTE = "/training-course";
const TRAINING_REQUIREMENTS_ROUTE = "/training-requirements";
const TRAINING_LOGIN_ROUTE = "/training-login";
const TRAINING_CONTACT_ROUTE = "/training-contact-us";
const TRAINING_FAQS_ROUTE = "/training-faqs";

const TRAINING_CONTACT_INFO = {
  email1: "ltc.tamsi@gmail.com",
  email2: "training@ltcmultiservices.com",
  phone: "09959808051 / 09516281271",
  addressLine1: "2/F 544 Curie Street,",
  addressLine2: "Palanan, Makati City",
};

const TRAINING_NAV_ITEMS = [
  { key: "home", label: "Home", path: TRAINING_HOME_ROUTE },
  { key: "course", label: "Course", path: TRAINING_COURSE_ROUTE },
  { key: "requirements", label: "Requirements", path: TRAINING_REQUIREMENTS_ROUTE },
  { key: "contact", label: "Contact", path: TRAINING_CONTACT_ROUTE },
  { key: "faqs", label: "FAQs", path: TRAINING_FAQS_ROUTE },
];

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

const fallbackCourses = [
  {
    name: "HouseKeeping",
    imageUrl: "/housekeeping-course.jpg",
    description: "Training and assessment course.",
  },
  {
    name: "Event Management",
    imageUrl: "/event-management-course.jpg",
    description: "Training and assessment course.",
  },
];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-training-home {
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

  .ltc-training-home * { box-sizing: border-box; }
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
    text-decoration: none;
  }

  .ltc-logo-icon {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    background: white;
    object-fit: contain;
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
    text-decoration: none;
  }

  .ltc-nav-link:hover,
  .ltc-nav-link.active {
    color: white;
    background: rgba(255,255,255,.13);
    transform: translateY(-1px);
  }

  .ltc-sign-in-button {
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
    animation: ltcAppleReveal .9s var(--ease) both;
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
    transition: .25s var(--ease);
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
    grid-template-columns: repeat(3, minmax(0, 260px));
    justify-content: start;
    justify-items: stretch;
    gap: 22px;
  }

  .ltc-quick-card {
    position: relative;
    overflow: hidden;
    min-height: 248px;
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
    transition: .25s var(--ease);
  }

  .ltc-icon-frame svg { width: 58px; height: 58px; }

  .ltc-quick-card:hover .ltc-icon-frame {
    transform: translateY(-4px) scale(1.04);
    color: var(--green-950);
    background: linear-gradient(145deg,#fff7dc,#ffffff);
    box-shadow: inset 0 0 0 1px rgba(215,168,77,.35), 0 18px 34px rgba(8,39,25,.12);
  }

  .ltc-quick-title {
    margin: 18px 0 0;
    color: var(--green-950);
    font-size: 21px;
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: -.03em;
  }

  .ltc-quick-subtitle {
    margin: 8px auto 0;
    min-height: 36px;
    max-width: 190px;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.4;
  }

  .ltc-card-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 130px;
    min-height: 42px;
    margin-top: 18px;
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

  .ltc-highlight-shell {
    margin-top: 34px;
    position: relative;
    overflow: hidden;
    border-radius: var(--radius);
    background: linear-gradient(135deg,rgba(7,31,20,.98),rgba(35,95,62,.93));
    color: white;
    box-shadow: var(--shadow-lg);
    padding: 34px;
  }

  .ltc-highlight-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: .13;
    background-image: radial-gradient(rgba(255,255,255,.9) 1px, transparent 1px);
    background-size: 22px 22px;
  }

  .ltc-highlight-header {
    position: relative;
    text-align: center;
  }

  .ltc-highlight-header h2 {
    margin: 0;
    font-size: clamp(28px, 4vw, 46px);
    line-height: 1.08;
    letter-spacing: -.055em;
    font-weight: 900;
  }

  .ltc-highlight-line {
    width: 170px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
    margin: 14px auto 0;
  }

  .ltc-highlight-carousel {
    position: relative;
    margin-top: 30px;
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .ltc-carousel-button {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    flex: 0 0 auto;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.24);
    background: rgba(255,255,255,.1);
    color: white;
    font-size: 34px;
    line-height: 1;
    cursor: pointer;
    transition: .25s var(--ease);
  }

  .ltc-carousel-button:hover {
    transform: translateY(-3px);
    background: rgba(255,255,255,.18);
  }

  .ltc-highlight-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap: 18px;
    width: 100%;
  }

  .ltc-highlight-card {
    overflow: hidden;
    border-radius: 20px;
    background: rgba(255,255,255,.11);
    box-shadow: 0 16px 38px rgba(0,0,0,.18);
    border: 1px solid rgba(255,255,255,.12);
    transition: .25s var(--ease);
  }

  .ltc-highlight-card:hover { transform: translateY(-5px); }
  .ltc-highlight-card img { width: 100%; height: 190px; object-fit: cover; display: block; transition: .3s var(--ease); }
  .ltc-highlight-card:hover img { transform: scale(1.04); }

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
    text-decoration: none;
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
  }

  .ltc-footer-brand img {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    object-fit: contain;
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
    text-decoration: none;
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
  .ltc-sidebar-link { display: block; width: 100%; border: 0; background: transparent; color: #101828; text-align: left; border-radius: 14px; padding: 13px 14px; font-weight: 800; margin-bottom: 8px; cursor: pointer; text-decoration: none; }
  .ltc-sidebar-link:hover,
  .ltc-sidebar-link.active { background: var(--green-800); color: white; }

  .training-floating-home {
    position: fixed;
    right: 24px;
    bottom: 104px;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.25);
    background: white;
    color: var(--green-800);
    box-shadow: 0 14px 35px rgba(0,0,0,.24);
    transition: .25s var(--ease);
    cursor: pointer;
  }

  .training-floating-home:hover {
    transform: translateY(-4px) scale(1.05);
    background: var(--green-800);
    color: white;
  }

  .training-floating-home span {
    position: absolute;
    right: 62px;
    white-space: nowrap;
    border-radius: 999px;
    background: var(--green-950);
    padding: 6px 12px;
    color: white;
    font-size: 12px;
    font-weight: 800;
    opacity: 0;
    pointer-events: none;
    transition: .25s var(--ease);
  }

  .training-floating-home:hover span { opacity: 1; }

  @keyframes ltcAppleReveal {
    from { opacity: 0; transform: translateY(34px) scale(.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ltc-training-home *, .ltc-training-home *::before, .ltc-training-home *::after {
      animation-duration: .001ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: .001ms !important;
    }
  }

  @media (max-width: 1180px) {
    .ltc-footer-grid { grid-template-columns: 1fr 1fr; }
    .ltc-quick-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  @media (max-width: 900px) {
    .ltc-header .ltc-container { padding-left: 22px; padding-right: 22px; }
    .ltc-nav { min-height: auto; padding: 18px 0; }
    .ltc-desktop-nav,
    .ltc-profile-wrap { display: none; }
    .ltc-menu-button { display: grid; place-items: center; }
    .ltc-hero { padding: 76px 0 74px; }
    .ltc-section { padding: 58px 0; }
    .ltc-home-shell,
    .ltc-highlight-shell { padding: 28px 22px; }
    .ltc-quick-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
    .ltc-highlight-carousel { gap: 10px; }
    .ltc-highlight-grid { grid-template-columns: 1fr; }
    .ltc-highlight-card img { height: 220px; }
    .ltc-footer { padding: 28px 0 12px; }
    .ltc-footer-grid { grid-template-columns: 1fr; gap: 18px; padding-bottom: 22px; }
    .ltc-footer .ltc-container { padding-left: 22px; padding-right: 22px; }
    .ltc-copyright { flex-direction: column; }
  }

  @media (max-width: 600px) {
    .ltc-header .ltc-container,
    .ltc-footer .ltc-container { padding-left: 16px; padding-right: 16px; }
    .ltc-logo h1 { font-size: 14px; }
    .ltc-logo p { font-size: 10px; }
    .ltc-hero-title { font-size: clamp(34px, 11vw, 46px); letter-spacing: -.045em; }
    .ltc-hero-text { font-size: 15px; }
    .ltc-home-shell,
    .ltc-highlight-shell { padding: 26px 18px; }
    .ltc-quick-grid { grid-template-columns: 1fr; }
    .ltc-carousel-button { width: 40px; height: 40px; font-size: 30px; }
  }


  .ltc-course-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    border-radius: 999px;
    background: rgba(35,95,62,.08);
    color: var(--green-800);
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .1em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .ltc-course-image-frame {
    overflow: hidden;
    width: 76px;
    height: 76px;
    border-radius: 22px;
    background: rgba(35,95,62,.08);
  }

  .ltc-course-image-frame img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: .3s var(--ease);
  }

  .ltc-quick-card:hover .ltc-course-image-frame img { transform: scale(1.08); }

  .ltc-empty-card {
    margin-top: 32px;
    border-radius: 22px;
    border: 1px dashed rgba(35,95,62,.22);
    background: rgba(255,255,255,.74);
    padding: 28px;
    color: var(--muted);
    font-size: 14px;
    font-weight: 700;
    text-align: center;
  }

  .ltc-section-heading-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  @media (max-width: 900px) {
    .ltc-section-heading-row { flex-direction: column; }
  }

  @media (max-width: 600px) {
    .ltc-course-status { width: 100%; }
  }

  .ltc-requirements-grid {
    margin-top: 32px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 22px;
  }

  .ltc-requirement-card {
    position: relative;
    overflow: hidden;
    min-height: 150px;
    border: 1px solid rgba(35,95,62,.12);
    border-radius: 22px;
    background: white;
    padding: 24px;
    box-shadow: 0 16px 34px rgba(8,39,25,.08);
    transition: .25s var(--ease);
  }

  .ltc-requirement-card::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 5px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
    opacity: .92;
  }

  .ltc-requirement-card:hover {
    transform: translateY(-6px);
    border-color: rgba(215,168,77,.55);
    box-shadow: 0 22px 44px rgba(8,39,25,.14);
  }

  .ltc-requirement-icon {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 18px;
    color: var(--green-800);
    background: rgba(35,95,62,.08);
    box-shadow: inset 0 0 0 1px rgba(35,95,62,.08);
    transition: .25s var(--ease);
  }

  .ltc-requirement-card:hover .ltc-requirement-icon {
    transform: translateY(-3px) scale(1.04);
    color: var(--green-950);
    background: linear-gradient(145deg,#fff7dc,#ffffff);
    box-shadow: inset 0 0 0 1px rgba(215,168,77,.35), 0 16px 28px rgba(8,39,25,.1);
  }

  .ltc-requirement-icon svg {
    width: 34px;
    height: 34px;
  }

  .ltc-requirement-title {
    margin: 18px 0 0;
    color: var(--green-950);
    font-size: 20px;
    line-height: 1.25;
    font-weight: 900;
    letter-spacing: -.03em;
  }

  .ltc-requirement-note {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.45;
  }

  @media (max-width: 900px) {
    .ltc-requirements-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 600px) {
    .ltc-requirements-grid { grid-template-columns: 1fr; }
    .ltc-requirement-card { min-height: 138px; }
  }

`;

function CourseIcon() {
  return (
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M23 22H60C65 22 69 26 69 31V69H30C26 69 23 66 23 62V22Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M23 62C23 58 26 55 30 55H69" stroke="currentColor" strokeWidth="3" />
      <path d="M34 34H56M34 43H52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 69V55" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

function Header({ goTo, onOpenMenu }) {
  return (
    <header className="ltc-header">
      <div className="ltc-container">
        <div className="ltc-nav">
          <button
            type="button"
            onClick={() => goTo(TRAINING_HOME_ROUTE)}
            className="ltc-logo"
            aria-label="Training and Assessment Home"
          >
            <img
              src={LOGO_IMAGE}
              alt="TAMSI Logo"
              className="ltc-logo-icon"
              onError={(event) => {
                event.currentTarget.src = "https://placehold.co/80x80/ffffff/45674b?text=T";
              }}
            />
            <div>
              <h1 style={fontMontserrat}>TRAINING & ASSESSMENT</h1>
              <p style={fontPontano}>Training and assessment portal.</p>
            </div>
          </button>

          <nav className="ltc-desktop-nav" aria-label="Training navigation">
            {TRAINING_NAV_ITEMS.map((item) => (
              <HeaderNavButton
                key={item.key}
                label={item.label}
                active={item.key === "requirements"}
                onClick={() => goTo(item.path)}
              />
            ))}
          </nav>

          <div className="ltc-profile-wrap">
            <HeaderNavButton
              label="Sign In"
              className="ltc-sign-in-button"
              onClick={() => goTo(TRAINING_LOGIN_ROUTE)}
            />
          </div>

          <button
            type="button"
            onClick={onOpenMenu}
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

function Footer({ goTo }) {
  return (
    <footer className="ltc-footer">
      <div className="ltc-container ltc-footer-grid">
        <div>
          <button
            type="button"
            onClick={() => goTo(TRAINING_HOME_ROUTE)}
            className="ltc-footer-brand"
          >
            <img
              src={LOGO_IMAGE}
              alt="TAMSI Logo"
              onError={(event) => {
                event.currentTarget.src = "https://placehold.co/80x80/ffffff/4d6f55?text=T";
              }}
            />
            <h4 style={fontMontserrat}>TAMSI</h4>
          </button>
        </div>

        <FooterColumn title="Menu">
          {TRAINING_NAV_ITEMS.map((item) => (
            <FooterLink key={item.key} onClick={() => goTo(item.path)}>
              {item.label}
            </FooterLink>
          ))}
          <FooterLink onClick={() => goTo(TRAINING_LOGIN_ROUTE)}>Sign In</FooterLink>
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

function MobileMenu({ onClose, goTo }) {
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

        {TRAINING_NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => goTo(item.path)}
            className={`ltc-sidebar-link ${item.key === "requirements" ? "active" : ""}`}
            style={fontPoppins}
          >
            {item.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => goTo(TRAINING_LOGIN_ROUTE)}
          className="ltc-sidebar-link"
          style={fontPoppins}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

function FloatingHomeIconButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Back to Home"
      aria-label="Back to Home"
      className="training-floating-home"
    >
      <span>LTC GROUP OF COMPANIES</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 24, height: 24 }}
      >
        <path d="m3 10.5 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    </button>
  );
}



export default function TrainingRequirements() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const requirements = useMemo(
    () => [
      "Birth Certificate",
      "Form 137/138",
      "Diploma/TOR",
      "2X2 Picture with Name",
      "Application Form",
      "Marriage Contract (Optional)",
    ],
    []
  );

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  return (
    <div className="ltc-training-home">
      <style>{pageStyles}</style>

      <Header goTo={goTo} onOpenMenu={() => setMobileOpen(true)} />

      <main>
        <section className="ltc-hero">
          <img
            src={HERO_IMAGE}
            alt="Training and Assessment Banner"
            className="ltc-hero-slide"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ltc-container ltc-hero-content">
            <h2 className="ltc-hero-title" style={fontMontserrat}>
              Training & Assessment <span>Requirements</span>
            </h2>
            <p className="ltc-hero-text" style={fontPontano}>
              Prepare these documents before submitting your enrollment application.
            </p>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-home-shell">
              <h2 className="ltc-section-heading" style={fontMontserrat}>
                List of Requirements
              </h2>
              <div className="ltc-section-line" />
              <p className="ltc-section-intro" style={fontPoppins}>
                Complete and organize the following requirements for a smoother TAMSI enrollment process.
              </p>

              <div className="ltc-requirements-grid">
                {requirements.map((item) => (
                  <article key={item} className="ltc-requirement-card">
                    <span className="ltc-requirement-icon" aria-hidden="true">
                      <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M28 18H58L68 28V68C68 70.2 66.2 72 64 72H28C25.8 72 24 70.2 24 68V22C24 19.8 25.8 18 28 18Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                        <path d="M58 18V29H68" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                        <path d="M34 42H55M34 52H55M34 62H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        <path d="M30 42L32 44L36 39M30 52L32 54L36 49M30 62L32 64L36 59" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <h3 className="ltc-requirement-title" style={fontMontserrat}>{item}</h3>
                    <p className="ltc-requirement-note" style={fontPontano}>Required document for your application.</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer goTo={goTo} />

      {mobileOpen ? (
        <MobileMenu onClose={() => setMobileOpen(false)} goTo={goTo} />
      ) : null}

      <FloatingHomeIconButton onClick={() => navigate("/")} />
      <TrainingChatbot />
    </div>
  );
}

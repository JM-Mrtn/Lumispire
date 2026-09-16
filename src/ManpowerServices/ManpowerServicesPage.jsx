import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE, manpowerUrl } from "./manpowerApi";

const MANPOWER_PUBLIC_THEME = `
  /* =========================================================
     LTC MANPOWER - UNIFIED PUBLIC UI
     Shared visual system for the public manpower pages.
     ========================================================= */

  .ltc-manpower-page,
  .ltc-about,
  .mp-about-style,
  .mp-contact-page,
  .mp-faq-page,
  .ltc-enrollment-page,
  .manpower-exam-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --green-600: #2f754c;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --surface: rgba(255,255,255,.94);
    --surface-soft: rgba(248,251,249,.92);
    --line: rgba(35,95,62,.14);
    --shadow-sm: 0 10px 28px rgba(8,39,25,.08);
    --shadow-md: 0 18px 45px rgba(8,39,25,.12);
    --shadow-lg: 0 30px 76px rgba(8,39,25,.17);
    --radius: 26px;
    --ease: cubic-bezier(.22,1,.36,1);

    min-height: 100vh;
    color: var(--dark);
    background:
      radial-gradient(circle at 10% 0%, rgba(215,168,77,.12), transparent 28%),
      radial-gradient(circle at 92% 10%, rgba(35,95,62,.12), transparent 30%),
      linear-gradient(180deg,#f7fbf8 0%,#ffffff 42%,#f4f9f6 100%) !important;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
    line-height: 1.65;
    letter-spacing: -.01em;
    overflow-x: hidden;
  }

  .ltc-manpower-page *,
  .ltc-about *,
  .mp-about-style *,
  .mp-contact-page *,
  .mp-faq-page *,
  .ltc-enrollment-page *,
  .manpower-exam-page * {
    box-sizing: border-box;
  }

  .ltc-manpower-page h1,
  .ltc-manpower-page h2,
  .ltc-manpower-page h3,
  .ltc-manpower-page h4,
  .ltc-manpower-page h5,
  .ltc-about h1,
  .ltc-about h2,
  .ltc-about h3,
  .ltc-about h4,
  .ltc-about h5,
  .mp-about-style h1,
  .mp-about-style h2,
  .mp-about-style h3,
  .mp-about-style h4,
  .mp-about-style h5,
  .mp-contact-page h1,
  .mp-contact-page h2,
  .mp-contact-page h3,
  .mp-contact-page h4,
  .mp-contact-page h5,
  .mp-faq-page h1,
  .mp-faq-page h2,
  .mp-faq-page h3,
  .mp-faq-page h4,
  .mp-faq-page h5,
  .ltc-enrollment-page h1,
  .ltc-enrollment-page h2,
  .ltc-enrollment-page h3,
  .ltc-enrollment-page h4,
  .ltc-enrollment-page h5,
  .manpower-exam-page h1,
  .manpower-exam-page h2,
  .manpower-exam-page h3,
  .manpower-exam-page h4,
  .manpower-exam-page h5 {
    font-family: Montserrat, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
  }

  .mp-container,
  .ltc-container {
    width: min(1180px, calc(100% - 48px)) !important;
    margin-inline: auto !important;
  }

  /* Header */
  .mp-header,
  .ltc-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 70 !important;
    width: 100% !important;
    margin: 0 !important;
    background: rgba(8,39,25,.985) !important;
    border-bottom: 1px solid rgba(255,255,255,.10) !important;
    box-shadow: 0 10px 34px rgba(7,31,20,.18) !important;
    backdrop-filter: blur(16px);
  }

  .mp-header .mp-container,
  .ltc-header .ltc-container {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding-inline: 32px !important;
  }

  .mp-nav,
  .ltc-nav {
    min-height: 76px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 20px !important;
  }

  .mp-logo,
  .ltc-logo {
    min-width: 0;
    display: flex !important;
    align-items: center !important;
    gap: 13px !important;
    border: 0 !important;
    padding: 0 !important;
    background: transparent !important;
    color: #fff !important;
    text-align: left !important;
    text-decoration: none !important;
    cursor: pointer;
  }

  .mp-logo-icon,
  .ltc-logo-icon {
    width: 42px !important;
    height: 42px !important;
    min-width: 42px !important;
    flex: 0 0 42px !important;
    border-radius: 999px !important;
    object-fit: cover !important;
    background: linear-gradient(145deg,#fff,#e3f4ea) !important;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.14) !important;
  }

  .mp-logo h1,
  .ltc-logo h1 {
    margin: 0 !important;
    color: #fff !important;
    font-size: 18px !important;
    font-weight: 900 !important;
    line-height: 1 !important;
    letter-spacing: -.04em !important;
    text-transform: uppercase !important;
    white-space: nowrap;
  }

  .mp-logo p,
  .ltc-logo p {
    margin: 4px 0 0 !important;
    color: rgba(255,255,255,.70) !important;
    font-size: 11px !important;
    line-height: 1.25 !important;
  }

  .mp-desktop-nav,
  .ltc-desktop-nav {
    margin-left: auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 8px !important;
  }

  .mp-nav-link,
  .ltc-nav-link {
    min-height: 40px;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 10px 14px !important;
    border: 0 !important;
    border-radius: 999px !important;
    color: rgba(255,255,255,.78) !important;
    background: transparent !important;
    font-size: 12px !important;
    font-weight: 800 !important;
    line-height: 1.2 !important;
    letter-spacing: .08em !important;
    text-transform: uppercase !important;
    text-decoration: none !important;
    white-space: nowrap !important;
    cursor: pointer;
    transition: background .22s ease, color .22s ease, transform .22s ease !important;
  }

  .mp-nav-link:hover,
  .mp-nav-link.active,
  .ltc-nav-link:hover,
  .ltc-nav-link.active {
    color: #fff !important;
    background: rgba(255,255,255,.13) !important;
    transform: translateY(-1px);
  }

  .mp-sign-in,
  .mp-profile-button,
  .ltc-sign-in {
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 14px 30px rgba(215,168,77,.20) !important;
  }

  .mp-sign-in:hover,
  .mp-profile-button:hover,
  .ltc-sign-in:hover {
    color: #102418 !important;
    background: linear-gradient(135deg,#ffe39a,#d7a84d) !important;
  }

  .mp-menu-button,
  .ltc-menu-button {
    display: none !important;
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    min-height: 44px !important;
    place-items: center !important;
    padding: 0 !important;
    border: 1px solid rgba(255,255,255,.12) !important;
    border-radius: 14px !important;
    color: #fff !important;
    background: rgba(255,255,255,.10) !important;
    cursor: pointer !important;
  }

  .mp-menu-button svg,
  .ltc-menu-button svg {
    width: 24px !important;
    height: 24px !important;
  }

  /* Mobile drawer */
  .mp-sidebar-overlay,
  .ltc-sidebar-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 100 !important;
    background: rgba(0,0,0,.48) !important;
    backdrop-filter: blur(5px);
  }

  .mp-sidebar-panel,
  .ltc-sidebar-panel {
    position: absolute !important;
    top: 0 !important;
    right: 0 !important;
    width: min(320px,88vw) !important;
    height: 100% !important;
    overflow-y: auto !important;
    padding: 22px !important;
    background: #fff !important;
    box-shadow: -24px 0 70px rgba(0,0,0,.28) !important;
  }

  .mp-sidebar-top,
  .ltc-sidebar-top {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 14px !important;
    margin-bottom: 16px !important;
    padding-bottom: 16px !important;
    border-bottom: 1px solid rgba(16,24,40,.10) !important;
  }

  .mp-sidebar-title,
  .ltc-sidebar-title {
    margin: 0 !important;
    color: var(--green-950) !important;
    font-size: 12px !important;
    font-weight: 900 !important;
    letter-spacing: .14em !important;
  }

  .mp-sidebar-close,
  .ltc-sidebar-close {
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    border: 0 !important;
    border-radius: 13px !important;
    color: #101828 !important;
    background: #f2f4f7 !important;
    cursor: pointer !important;
  }

  .mp-sidebar-link,
  .ltc-sidebar-link {
    display: block !important;
    width: 100% !important;
    min-height: 46px !important;
    margin: 0 0 8px !important;
    padding: 13px 14px !important;
    border: 0 !important;
    border-radius: 14px !important;
    color: #101828 !important;
    background: transparent !important;
    font-size: 13px !important;
    font-weight: 800 !important;
    line-height: 1.3 !important;
    text-align: left !important;
    text-transform: uppercase !important;
    text-decoration: none !important;
    cursor: pointer !important;
  }

  .mp-sidebar-link:hover,
  .mp-sidebar-link.active,
  .ltc-sidebar-link:hover,
  .ltc-sidebar-link.active {
    color: #fff !important;
    background: var(--green-800) !important;
  }

  /* Hero - identical size and alignment on every public page */
  .mp-hero,
  .mp-contact-hero,
  .ltc-about-hero {
    position: relative !important;
    min-height: 430px !important;
    display: flex !important;
    align-items: center !important;
    overflow: hidden !important;
    isolation: isolate !important;
    padding: 0 !important;
    color: #fff !important;
    background: linear-gradient(120deg,#03180f 0%,#082719 46%,#155f3b 100%) !important;
  }

  .mp-hero-bg,
  .mp-contact-hero-image,
  .ltc-hero-bg {
    position: absolute !important;
    inset: 0 !important;
    z-index: -4 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    object-position: center !important;
    transform: none !important;
    opacity: 1 !important;
  }

  .mp-hero::before,
  .mp-contact-hero::before,
  .ltc-about-hero::before {
    content: "" !important;
    position: absolute !important;
    inset: 0 !important;
    z-index: -3 !important;
    background: linear-gradient(120deg,rgba(2,18,11,.96) 0%,rgba(5,37,23,.90) 46%,rgba(12,64,39,.77) 100%) !important;
    opacity: .98 !important;
    pointer-events: none !important;
  }

  .mp-hero::after,
  .mp-contact-hero::after,
  .ltc-about-hero::after {
    content: "" !important;
    position: absolute !important;
    inset: -14% -8% -20% !important;
    z-index: -2 !important;
    background:
      radial-gradient(circle at 18% 82%, rgba(19,120,72,.30), transparent 25%),
      radial-gradient(circle at 78% 18%, rgba(35,95,62,.25), transparent 30%),
      radial-gradient(circle at 90% 50%, rgba(244,212,132,.13), transparent 26%) !important;
    filter: blur(24px) !important;
    pointer-events: none !important;
  }

  .mp-hero-content,
  .mp-contact-hero-content,
  .ltc-about-hero-content {
    position: relative !important;
    z-index: 2 !important;
    width: min(960px, calc(100% - 48px)) !important;
    max-width: 960px !important;
    margin: 0 auto !important;
    padding: 82px 0 86px !important;
    text-align: center !important;
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }

  .mp-eyebrow,
  .ltc-eyebrow,
  .mp-contact-hero .eyebrow,
  .mp-exam-eyebrow {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    margin: 0 auto !important;
    padding: 8px 14px !important;
    border: 1px solid rgba(255,255,255,.18) !important;
    border-radius: 999px !important;
    color: var(--gold-soft) !important;
    background: rgba(255,255,255,.10) !important;
    font-size: 11px !important;
    font-weight: 900 !important;
    line-height: 1.2 !important;
    letter-spacing: .18em !important;
    text-transform: uppercase !important;
    backdrop-filter: blur(10px);
  }

  .mp-hero h2,
  .mp-contact-hero h2,
  .ltc-about-hero h2 {
    max-width: 940px !important;
    margin: 16px auto 0 !important;
    color: #fff !important;
    font-size: clamp(40px,5.4vw,68px) !important;
    font-weight: 900 !important;
    line-height: 1 !important;
    letter-spacing: -.06em !important;
    text-align: center !important;
    text-shadow: 0 8px 26px rgba(0,0,0,.22) !important;
  }

  .mp-hero h2 span,
  .mp-contact-hero h2 span,
  .ltc-about-hero h2 span {
    color: var(--gold-soft) !important;
  }

  .mp-hero p,
  .mp-contact-hero p,
  .ltc-about-hero p {
    max-width: 740px !important;
    margin: 20px auto 0 !important;
    color: rgba(255,255,255,.80) !important;
    font-size: 17px !important;
    line-height: 1.75 !important;
    text-align: center !important;
  }

  .mp-hero-actions,
  .ltc-hero-actions {
    margin-top: 30px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-wrap: wrap !important;
    gap: 12px !important;
  }

  /* Common sections/cards */
  .mp-section,
  .ltc-section,
  .ltc-cta-section {
    padding-block: 76px !important;
  }

  .mp-section-title,
  .ltc-section-title {
    margin-bottom: 36px !important;
    text-align: center !important;
  }

  .mp-section-title > span,
  .ltc-section-title > span {
    color: var(--green-700) !important;
    font-size: 11px !important;
    font-weight: 900 !important;
    letter-spacing: .18em !important;
    text-transform: uppercase !important;
  }

  .mp-section-title h2,
  .mp-section-title h3,
  .ltc-section-title h2,
  .ltc-section-title h3 {
    margin: 10px 0 0 !important;
    color: var(--green-950) !important;
    font-size: clamp(30px,3.8vw,48px) !important;
    font-weight: 900 !important;
    line-height: 1.08 !important;
    letter-spacing: -.05em !important;
  }

  .mp-section-title p,
  .ltc-section-title p {
    max-width: 740px !important;
    margin: 14px auto 0 !important;
    color: var(--muted) !important;
    line-height: 1.75 !important;
  }

  .mp-search-panel,
  .mp-requirement-panel,
  .mp-faq-card,
  .mp-summary-card,
  .mp-contact-card,
  .mp-map-card,
  .ltc-card,
  .exam-panel,
  .exam-card {
    border: 1px solid var(--line) !important;
    border-radius: var(--radius) !important;
    background: var(--surface) !important;
    box-shadow: var(--shadow-md) !important;
  }

  .mp-search-panel,
  .mp-requirement-panel,
  .mp-faq-card,
  .mp-contact-card,
  .mp-map-card,
  .exam-panel {
    position: relative !important;
    overflow: hidden !important;
  }

  .mp-search-panel::before,
  .mp-requirement-panel::before,
  .mp-faq-card::before,
  .mp-contact-card::before,
  .mp-map-card::before,
  .exam-panel::before {
    content: "" !important;
    position: absolute !important;
    inset: 0 0 auto !important;
    z-index: 3 !important;
    height: 6px !important;
    background: linear-gradient(90deg,var(--green-700),var(--gold)) !important;
  }

  .mp-job-card,
  .mp-requirement-card,
  .mp-faq-item,
  .mp-summary-card,
  .ltc-card,
  .exam-card {
    transition: transform .26s var(--ease), box-shadow .26s var(--ease), border-color .26s var(--ease) !important;
  }

  .mp-job-card:hover,
  .mp-requirement-card:hover,
  .mp-faq-item:hover,
  .mp-summary-card:hover,
  .ltc-card:hover,
  .exam-card:hover {
    transform: translateY(-5px) !important;
    border-color: rgba(215,168,77,.42) !important;
    box-shadow: var(--shadow-lg) !important;
  }

  /* Common buttons */
  .mp-btn,
  .ltc-btn,
  .mp-submit-button,
  .mp-map-button,
  .mp-help-button,
  .exam-primary-button,
  .exam-secondary-button {
    min-height: 48px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    padding: 0 22px !important;
    border-radius: 999px !important;
    font-size: 13px !important;
    font-weight: 900 !important;
    line-height: 1.2 !important;
    text-decoration: none !important;
    cursor: pointer !important;
    transition: transform .22s ease, box-shadow .22s ease, background .22s ease !important;
  }

  .mp-btn-primary,
  .ltc-btn-primary,
  .mp-submit-button,
  .mp-map-button,
  .mp-help-button,
  .exam-primary-button {
    border: 0 !important;
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 15px 34px rgba(215,168,77,.25) !important;
  }

  .mp-btn-outline,
  .ltc-btn-outline,
  .exam-secondary-button {
    border: 1px solid rgba(35,95,62,.18) !important;
    color: var(--green-950) !important;
    background: #fff !important;
    box-shadow: var(--shadow-sm) !important;
  }

  .mp-btn:hover,
  .ltc-btn:hover,
  .mp-submit-button:hover,
  .mp-map-button:hover,
  .mp-help-button:hover,
  .exam-primary-button:hover,
  .exam-secondary-button:hover {
    transform: translateY(-2px) !important;
  }

  /* Forms */
  .ltc-enrollment-page input,
  .ltc-enrollment-page select,
  .ltc-enrollment-page textarea,
  .mp-contact-page input,
  .mp-contact-page select,
  .mp-contact-page textarea,
  .manpower-exam-page textarea {
    border-radius: 16px !important;
    border-color: rgba(35,95,62,.18) !important;
    background: #fbfdfb !important;
  }

  .ltc-enrollment-page input:focus,
  .ltc-enrollment-page select:focus,
  .ltc-enrollment-page textarea:focus,
  .mp-contact-page input:focus,
  .mp-contact-page select:focus,
  .mp-contact-page textarea:focus,
  .manpower-exam-page textarea:focus {
    border-color: var(--green-700) !important;
    background: #fff !important;
    box-shadow: 0 0 0 4px rgba(35,95,62,.10) !important;
    outline: none !important;
  }

  /* Apply page: neutralize the legacy first/second-child layout selectors */
  .ltc-enrollment-page main > section.mp-hero {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .ltc-enrollment-page main > section.mp-hero > .mp-hero-content {
    min-height: 0 !important;
    border-radius: 0 !important;
    overflow: visible !important;
    background: transparent !important;
    display: block !important;
  }

  .ltc-enrollment-page main > section.mp-hero > .mp-hero-content::before,
  .ltc-enrollment-page main > section.mp-hero > .mp-hero-content::after {
    content: none !important;
  }

  /* Apply page content */
  .ltc-enrollment-page main > .application-content-wrap {
    width: min(1180px, calc(100% - 48px)) !important;
    margin: -54px auto 0 !important;
    padding: 0 0 76px !important;
    position: relative !important;
    z-index: 4 !important;
  }

  .ltc-enrollment-page main > .application-content-wrap > .application-form-shell {
    position: relative !important;
    overflow: hidden !important;
    padding: 28px !important;
    border: 1px solid var(--line) !important;
    border-radius: 30px !important;
    background: rgba(255,255,255,.96) !important;
    box-shadow: var(--shadow-lg) !important;
  }

  .ltc-enrollment-page main > .application-content-wrap > .application-form-shell::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 6px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
  }

  .ltc-enrollment-page main > .application-content-wrap > .application-form-shell form > section {
    border: 1px solid rgba(35,95,62,.12) !important;
    border-radius: 24px !important;
    background: #fff !important;
    box-shadow: 0 12px 28px rgba(8,39,25,.06) !important;
  }

  /* Exam */
  .manpower-exam-page .exam-content-section {
    width: min(1180px, calc(100% - 48px)) !important;
    max-width: 1180px !important;
    min-height: 0 !important;
    margin: -44px auto 0 !important;
    padding: 0 0 76px !important;
    position: relative !important;
    z-index: 4 !important;
  }

  .manpower-exam-page .exam-main-shell {
    padding: 28px !important;
    border: 1px solid var(--line) !important;
    border-radius: 30px !important;
    background: rgba(255,255,255,.96) !important;
    box-shadow: var(--shadow-lg) !important;
  }

  .manpower-exam-page .exam-card {
    background: #fff !important;
  }

  .manpower-exam-page .exam-progress-track {
    background: #e9efeb !important;
  }

  .manpower-exam-page .exam-progress-fill {
    background: linear-gradient(90deg,var(--green-700),var(--green-600)) !important;
  }

  /* Footer */
  .mp-footer,
  .ltc-footer {
    width: 100% !important;
    margin: 0 !important;
    padding: 30px 0 12px !important;
    color: #fff !important;
    background: var(--footer-green) !important;
  }

  .mp-footer .mp-container,
  .ltc-footer .ltc-container {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding-inline: 32px !important;
  }

  .mp-footer-grid,
  .ltc-footer-grid {
    width: 100% !important;
    display: grid !important;
    grid-template-columns: 1.45fr .85fr 1.15fr 1fr .8fr !important;
    gap: 22px !important;
    padding-bottom: 24px !important;
    border-bottom: 1px solid rgba(255,255,255,.10) !important;
  }

  .mp-footer h4,
  .ltc-footer h4 {
    margin: 0 0 10px !important;
    color: #fff !important;
    font-size: 18px !important;
    font-weight: 900 !important;
    line-height: 1.2 !important;
  }

  .mp-footer h5,
  .ltc-footer h5 {
    margin: 0 0 10px !important;
    color: var(--gold-soft) !important;
    font-size: 12px !important;
    font-weight: 900 !important;
    line-height: 1.2 !important;
    letter-spacing: .14em !important;
    text-transform: uppercase !important;
  }

  .mp-footer p,
  .mp-footer a,
  .mp-footer-link,
  .ltc-footer p,
  .ltc-footer a,
  .ltc-footer-link {
    display: block;
    margin: 5px 0 !important;
    color: rgba(255,255,255,.68) !important;
    font-size: 13px !important;
    line-height: 1.55 !important;
    text-decoration: none !important;
  }

  .mp-footer a:hover,
  .mp-footer-link:hover,
  .ltc-footer a:hover,
  .ltc-footer-link:hover {
    color: #fff !important;
    text-decoration: underline !important;
  }

  .mp-copyright,
  .ltc-copyright {
    width: 100% !important;
    display: flex !important;
    justify-content: space-between !important;
    gap: 12px !important;
    padding-top: 14px !important;
    color: rgba(255,255,255,.52) !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
  }

  /* Floating LTC home button */
  .ltc-floating-home-button {
    right: 20px !important;
    bottom: 22px !important;
    width: 56px !important;
    height: 56px !important;
    border-radius: 999px !important;
    border: 1px solid rgba(35,95,62,.14) !important;
    background: #fff !important;
    box-shadow: 0 18px 42px rgba(0,0,0,.22) !important;
  }

  .ltc-floating-home-button {
    position: fixed !important;
    z-index: 10000 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    color: var(--green-800) !important;
    cursor: pointer !important;
    transition: transform .22s ease, background .22s ease, box-shadow .22s ease !important;
  }

  .ltc-floating-home-button:hover,
  .ltc-floating-home-button:focus-visible {
    transform: translateY(-3px) scale(1.04) !important;
    background: var(--green-800) !important;
    box-shadow: 0 24px 54px rgba(0,0,0,.28) !important;
    outline: none !important;
  }

  .ltc-floating-home-button img {
    width: 100% !important;
    height: 100% !important;
    border-radius: 999px !important;
    object-fit: cover !important;
  }

  .ltc-floating-home-tooltip {
    position: absolute !important;
    top: 50% !important;
    right: 62px !important;
    transform: translateY(-50%) translateX(8px) !important;
    padding: 7px 12px !important;
    border-radius: 999px !important;
    color: #fff !important;
    background: #102816 !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    letter-spacing: .04em !important;
    white-space: nowrap !important;
    opacity: 0 !important;
    pointer-events: none !important;
    box-shadow: 0 12px 28px rgba(0,0,0,.22) !important;
    transition: opacity .22s ease, transform .22s ease !important;
  }

  .ltc-floating-home-button:hover .ltc-floating-home-tooltip,
  .ltc-floating-home-button:focus-visible .ltc-floating-home-tooltip {
    opacity: 1 !important;
    transform: translateY(-50%) translateX(0) !important;
  }

  /* Accessibility */
  .mp-menu-button:focus-visible,
  .ltc-menu-button:focus-visible,
  .mp-sidebar-close:focus-visible,
  .ltc-sidebar-close:focus-visible,
  .mp-nav-link:focus-visible,
  .ltc-nav-link:focus-visible,
  .mp-btn:focus-visible,
  .ltc-btn:focus-visible,
  .exam-primary-button:focus-visible,
  .exam-secondary-button:focus-visible {
    outline: 3px solid rgba(244,212,132,.95) !important;
    outline-offset: 3px !important;
  }

  @media (max-width: 1100px) {
    .mp-footer-grid,
    .ltc-footer-grid {
      grid-template-columns: repeat(2,minmax(0,1fr)) !important;
    }
  }

  @media (max-width: 1000px) {
    .mp-header .mp-container,
    .ltc-header .ltc-container,
    .mp-footer .mp-container,
    .ltc-footer .ltc-container {
      padding-inline: 22px !important;
    }

    .mp-desktop-nav,
    .ltc-desktop-nav,
    .ltc-header-signin {
      display: none !important;
    }

    .mp-menu-button,
    .ltc-menu-button {
      display: grid !important;
    }

    .mp-hero,
    .mp-contact-hero,
    .ltc-about-hero {
      min-height: 390px !important;
    }

    .mp-footer-grid,
    .ltc-footer-grid {
      grid-template-columns: 1fr !important;
      gap: 18px !important;
    }
  }

  @media (max-width: 700px) {
    .mp-container,
    .ltc-container {
      width: min(100% - 32px,1180px) !important;
    }

    .mp-header .mp-container,
    .ltc-header .ltc-container,
    .mp-footer .mp-container,
    .ltc-footer .ltc-container {
      width: 100% !important;
      padding-inline: 16px !important;
    }

    .mp-nav,
    .ltc-nav {
      min-height: 68px !important;
    }

    .mp-logo h1,
    .ltc-logo h1 {
      font-size: 14px !important;
    }

    .mp-logo p,
    .ltc-logo p {
      display: none !important;
    }

    .mp-hero,
    .mp-contact-hero,
    .ltc-about-hero {
      min-height: 340px !important;
    }

    .mp-hero-content,
    .mp-contact-hero-content,
    .ltc-about-hero-content {
      width: min(100% - 32px,960px) !important;
      padding: 66px 0 70px !important;
    }

    .mp-hero h2,
    .mp-contact-hero h2,
    .ltc-about-hero h2 {
      font-size: clamp(36px,11vw,50px) !important;
      letter-spacing: -.045em !important;
    }

    .mp-hero p,
    .mp-contact-hero p,
    .ltc-about-hero p {
      font-size: 15px !important;
      line-height: 1.7 !important;
    }

    .mp-section,
    .ltc-section,
    .ltc-cta-section {
      padding-block: 60px !important;
    }

    .mp-hero-actions,
    .ltc-hero-actions,
    .mp-btn,
    .ltc-btn,
    .mp-submit-button,
    .mp-map-button,
    .mp-help-button,
    .exam-primary-button,
    .exam-secondary-button {
      width: 100% !important;
    }

    .ltc-enrollment-page main > .application-content-wrap,
    .manpower-exam-page .exam-content-section {
      width: calc(100% - 24px) !important;
      margin-top: -28px !important;
      padding-bottom: 60px !important;
    }

    .ltc-enrollment-page main > .application-content-wrap > .application-form-shell,
    .manpower-exam-page .exam-main-shell {
      padding: 18px !important;
      border-radius: 24px !important;
    }

    .mp-copyright,
    .ltc-copyright {
      flex-direction: column !important;
    }

    .ltc-floating-home-button {
      right: 16px !important;
      bottom: 16px !important;
      width: 52px !important;
      height: 52px !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ltc-manpower-page *,
    .ltc-about *,
    .mp-about-style *,
    .mp-contact-page *,
    .mp-faq-page *,
    .ltc-enrollment-page *,
    .manpower-exam-page * {
      animation-duration: .001ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: .001ms !important;
    }
  }

  /* ===== Exact unified public header lock ===== */
  .mp-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 100 !important;
    width: 100% !important;
    height: 76px !important;
    min-height: 76px !important;
    margin: 0 !important;
    background: #082719 !important;
    border-bottom: 1px solid rgba(255,255,255,.10) !important;
    box-shadow: 0 10px 34px rgba(7,31,20,.18) !important;
  }

  .mp-header .mp-container.mp-nav {
    width: 100% !important;
    max-width: none !important;
    height: 76px !important;
    min-height: 76px !important;
    margin: 0 !important;
    padding: 0 32px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 20px !important;
  }

  .mp-header .mp-logo {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    display: flex !important;
    align-items: center !important;
    gap: 13px !important;
    padding: 0 !important;
    margin: 0 !important;
    border: 0 !important;
    background: transparent !important;
    color: #fff !important;
    text-decoration: none !important;
  }

  .mp-header .mp-logo-icon {
    width: 42px !important;
    height: 42px !important;
    min-width: 42px !important;
    flex: 0 0 42px !important;
    border-radius: 999px !important;
    object-fit: cover !important;
    background: #fff !important;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.14) !important;
  }

  .mp-header .mp-logo h1 {
    margin: 0 !important;
    color: #fff !important;
    font-family: Montserrat, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
    font-size: 18px !important;
    font-weight: 900 !important;
    line-height: 1 !important;
    letter-spacing: -.04em !important;
    text-transform: uppercase !important;
    white-space: nowrap !important;
  }

  .mp-header .mp-logo p {
    margin: 4px 0 0 !important;
    color: rgba(255,255,255,.70) !important;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
    font-size: 11px !important;
    font-weight: 400 !important;
    line-height: 1.25 !important;
    white-space: nowrap !important;
  }

  .mp-header .mp-desktop-nav {
    margin-left: auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 8px !important;
  }

  .mp-header .mp-nav-link {
    min-height: 40px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 10px 14px !important;
    margin: 0 !important;
    border: 0 !important;
    border-radius: 999px !important;
    color: rgba(255,255,255,.78) !important;
    background: transparent !important;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
    font-size: 12px !important;
    font-weight: 800 !important;
    line-height: 1.2 !important;
    letter-spacing: .08em !important;
    text-transform: uppercase !important;
    text-decoration: none !important;
    white-space: nowrap !important;
  }

  .mp-header .mp-nav-link:hover,
  .mp-header .mp-nav-link.active {
    color: #fff !important;
    background: rgba(255,255,255,.13) !important;
    transform: translateY(-1px) !important;
  }

  .mp-header .mp-nav-link.mp-sign-in {
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 14px 30px rgba(215,168,77,.20) !important;
  }

  .mp-header .mp-nav-link.mp-sign-in:hover {
    color: #102418 !important;
    background: linear-gradient(135deg,#ffe39a,#d7a84d) !important;
  }

  .mp-header .mp-menu-button {
    display: none !important;
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    min-height: 44px !important;
    place-items: center !important;
    padding: 0 !important;
    border: 1px solid rgba(255,255,255,.12) !important;
    border-radius: 14px !important;
    color: #fff !important;
    background: rgba(255,255,255,.10) !important;
  }

  @media (max-width: 900px) {
    .mp-header,
    .mp-header .mp-container.mp-nav {
      height: 72px !important;
      min-height: 72px !important;
    }
    .mp-header .mp-container.mp-nav { padding: 0 22px !important; }
    .mp-header .mp-desktop-nav { display: none !important; }
    .mp-header .mp-menu-button { display: grid !important; margin-left: auto !important; }
  }

  @media (max-width: 600px) {
    .mp-header .mp-container.mp-nav { padding: 0 16px !important; }
    .mp-header .mp-logo h1 { font-size: 14px !important; }
    .mp-header .mp-logo p { display: none !important; }
  }

`;


const LOGO_IMAGE = "/ManpowerLogo.webp";
const HERO_IMAGE = "/ManpowerBanner.webp";
const HERO_IMAGE_1440 = "/ManpowerBanner-1440.webp";
const HERO_IMAGE_960 = "/ManpowerBanner-960.webp";

const MANPOWER_HOME_ROUTE = "/manpower-services";
const API_ORIGIN = API_BASE.replace(/\/api$/i, "");

const fontMontserrat = { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' };
const fontPontano = { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' };
const fontPoppins = { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' };


const FALLBACK_HIGHLIGHTS = [
  {
    _id: "fallback-1",
    title: "Reliable Staffing Support",
    subtitle: "Dependable workforce solutions that help businesses operate with confidence.",
    imageUrl: "",
  },
  {
    _id: "fallback-2",
    title: "Skilled People, Better Results",
    subtitle: "Connecting companies with qualified workers who are ready to contribute.",
    imageUrl: "",
  },
  {
    _id: "fallback-3",
    title: "Professional Workforce Assistance",
    subtitle: "Responsive manpower support built around the needs of every client.",
    imageUrl: "",
  },
];

function resolveImageSource(value = "") {
  const raw = String(value || "").trim();

  if (!raw) return "";

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  if (raw.startsWith("/api/")) {
    return `${API_ORIGIN}${raw}`;
  }

  if (raw.startsWith("/manpower/files/")) {
    return manpowerUrl(raw);
  }

  return raw;
}

function DocumentPenIcon(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M17 10h25l8 8v35a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M42 10v10h10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M22 28h18M22 36h15M22 44h10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="m39 51 10.5-10.5a3.2 3.2 0 0 0-4.5-4.5L34.5 46.5V52h4.5Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true" focusable="false" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 6 6 6-6 6" />
    </svg>
  );
}


function FloatingHomeIconButton({ onClick }) {
  return (
    <>
      <style>{`.ltc-floating-home-button{position:fixed;right:20px;bottom:88px;z-index:10000;width:56px;height:56px;border:1px solid rgba(255,255,255,.38);border-radius:999px;background:#ffffff;color:#214f35;display:flex;align-items:center;justify-content:center;box-shadow:0 18px 42px rgba(0,0,0,.24);cursor:pointer;transition:transform .25s ease,background .25s ease,color .25s ease,box-shadow .25s ease}.ltc-floating-home-button:hover,.ltc-floating-home-button:focus-visible{transform:translateY(-4px) scale(1.06);background:#214f35;color:#ffffff;box-shadow:0 24px 55px rgba(0,0,0,.3);outline:none}.ltc-floating-home-tooltip{position:absolute;right:62px;top:50%;transform:translateY(-50%) translateX(8px);padding:7px 12px;border-radius:999px;background:#102816;color:#ffffff;font-size:12px;font-weight:800;letter-spacing:.04em;white-space:nowrap;opacity:0;pointer-events:none;box-shadow:0 12px 28px rgba(0,0,0,.24);transition:opacity .25s ease,transform .25s ease}.ltc-floating-home-button:hover .ltc-floating-home-tooltip,.ltc-floating-home-button:focus-visible .ltc-floating-home-tooltip{opacity:1;transform:translateY(-50%) translateX(0)}.ltc-floating-home-button img{width:100%;height:100%;border-radius:999px;object-fit:cover}@media (max-width:640px){.ltc-floating-home-button{right:20px;bottom:88px;width:56px;height:56px}.ltc-floating-home-tooltip{right:58px}}`}</style>

      <button
        type="button"
        onClick={onClick}
        className="ltc-floating-home-button"
        title="Back to Home"
        aria-label="Back to Home"
      >
        <span className="ltc-floating-home-tooltip">LTC GROUP OF COMPANIES</span>
        <img src="/LTCLogo.webp" alt="" aria-hidden="true" width="160" height="160" decoding="async" />
      </button>
    </>
  );
}

function FooterLink({ children, to, onClick }) {
  return (
    <li>
      {to ? (
        <Link to={to} className="ltc-footer-link">
          {children}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className="ltc-footer-link">
          {children}
        </button>
      )}
    </li>
  );
}

function ServiceCard({ title, description, to }) {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate(to)} className="ltc-card">
      <div className="ltc-icon">
        <DocumentPenIcon className="ltc-svg-icon" />
      </div>

      <h4 style={fontMontserrat}>{title}</h4>
      <p style={fontPontano}>{description}</p>
      <span className="ltc-card-link" style={fontPoppins}>
        Open <ArrowIcon />
      </span>
    </button>
  );
}

function HighlightCard({ highlight, index }) {
  const imageSrc = resolveImageSource(highlight?.imageUrl);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageSrc) && !imageFailed;

  return (
    <article className="ltc-highlight-card">
      <div className={`ltc-highlight-media ${showImage ? "" : "is-css-only"}`}>
        {showImage ? (
          <img
            src={imageSrc}
            alt={highlight?.title || `Manpower highlight ${index + 1}`}
            width="480"
            height="320"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="ltc-highlight-empty" aria-hidden="true">
            <span className="ltc-highlight-mark">LTC</span>
            <span>MANPOWER</span>
          </div>
        )}
      </div>

      <div className="ltc-highlight-content">
        <p className="ltc-highlight-label" style={fontPoppins}>Highlight {index + 1}</p>
        {highlight?.title ? <h4 style={fontMontserrat}>{highlight.title}</h4> : null}
        {highlight?.subtitle ? <p style={fontPontano}>{highlight.subtitle}</p> : null}
      </div>
    </article>
  );
}

export default function ManpowerServicesPage() {
  const [highlights, setHighlights] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: "Home", to: MANPOWER_HOME_ROUTE },
    { label: "Job Offer", to: "/manpower-positions" },
    { label: "Requirements", to: "/manpower-requirements" },
    { label: "Contact", to: "/manpower-contact" },
    { label: "FAQs", to: "/manpower-faqs" },
  ];

  const serviceCards = [
    {
      title: "Apply Now",
      description: "Start your journey here at manpower and submit your application details.",
      to: "/manpower-apply",
    },
    {
      title: "Job Offer",
      description: "See the list of jobs we offer and find the right opportunity for you.",
      to: "/manpower-positions",
    },
    {
      title: "Requirements",
      description: "Review all requirements you need to submit before applying.",
      to: "/manpower-requirements",
    },
  ];

  const goTo = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    let ignore = false;

    async function loadHighlights() {
      try {
        const res = await fetch(manpowerUrl("manpower/highlights"));
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data?.message || "Failed to load highlights.");

        if (!ignore) {
          const list = Array.isArray(data?.highlights) ? data.highlights : [];
          setHighlights(list.filter((item) => item?.imageUrl));
        }
      } catch {
        if (!ignore) setHighlights([]);
      }
    }

    const start = () => {
      if (!ignore) loadHighlights();
    };

    let idleId = null;
    let timerId = null;
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(start, { timeout: 2500 });
    } else {
      timerId = window.setTimeout(start, 1400);
    }

    return () => {
      ignore = true;
      if (idleId !== null && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timerId !== null) window.clearTimeout(timerId);
    };
  }, []);

  const displayHighlights = highlights.length ? highlights : FALLBACK_HIGHLIGHTS;

  const visibleHighlights = useMemo(() => {
    if (displayHighlights.length <= 3) return displayHighlights;

    return [0, 1, 2].map((offset) => {
      const nextIndex = (highlightIndex + offset) % displayHighlights.length;
      return displayHighlights[nextIndex];
    });
  }, [displayHighlights, highlightIndex]);

  function goPreviousHighlight() {
    setHighlightIndex((current) => {
      if (!displayHighlights.length) return 0;
      return (current - 1 + displayHighlights.length) % displayHighlights.length;
    });
  }

  function goNextHighlight() {
    setHighlightIndex((current) => {
      if (!displayHighlights.length) return 0;
      return (current + 1) % displayHighlights.length;
    });
  }

  return (
    <div className="ltc-about ltc-manpower-page" style={fontPontano}>
      <style>{`.ltc-about{--green-950:#071f14;--green-900:#0e3321;--green-800:#174a30;--green-700:#235f3e;--green-600:#2f754c;--footer-green:#082719;--gold:#d7a84d;--gold-soft:#f4d484;--dark:#101828;--muted:#667085;--glass:rgba(255,255,255,.78);--shadow-md:0 18px 45px rgba(8,39,25,.12);--shadow-lg:0 32px 80px rgba(8,39,25,.18);--radius:24px;--ease:cubic-bezier(.22,1,.36,1);min-height:100vh;color:var(--dark);background:radial-gradient(circle at 12% 0%,rgba(215,168,77,.12),transparent 28%),radial-gradient(circle at 92% 12%,rgba(35,95,62,.12),transparent 30%),linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%);line-height:1.65;letter-spacing:-.01em;overflow-x:hidden;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}.ltc-about *{box-sizing:border-box}.ltc-container{width:min(1180px,92%);margin:auto}.ltc-header{position:sticky;top:0;z-index:50;width:100%;background:var(--footer-green);border-bottom:1px solid rgba(255,255,255,.1);box-shadow:0 10px 34px rgba(7,31,20,.14);margin:0}.ltc-header .ltc-container{width:100%;max-width:none;margin:0;padding-left:32px;padding-right:32px}.ltc-nav{min-height:76px;display:flex;justify-content:space-between;align-items:center;gap:24px}.ltc-logo{display:flex;align-items:center;gap:13px;color:white;border:0;background:transparent;cursor:pointer;text-align:left;padding:0;text-decoration:none}.ltc-logo-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:50%;background:linear-gradient(145deg,#fff,#e3f4ea);color:var(--green-800);font-weight:900;box-shadow:0 0 0 5px rgba(255,255,255,.08),0 12px 24px rgba(0,0,0,.12);object-fit:cover}.ltc-logo h1{font-size:18px;line-height:1;font-weight:900;text-transform:uppercase;letter-spacing:-.04em;margin:0}.ltc-logo p{font-size:11px;color:rgba(255,255,255,.72);margin:3px 0 0}.ltc-desktop-nav{margin-left:auto;display:flex;align-items:center;justify-content:flex-end;gap:8px}.ltc-nav-link{color:rgba(255,255,255,.78);font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:10px 14px;border-radius:999px;transition:.25s var(--ease);border:0;background:transparent;cursor:pointer;text-decoration:none}.ltc-nav-link:hover,.ltc-nav-link.active{color:white;background:rgba(255,255,255,.13);transform:translateY(-1px)}.ltc-sign-in{color:#102418;background:linear-gradient(135deg,#f4d484,#d7a84d);box-shadow:0 16px 35px rgba(215,168,77,.18)}.ltc-sign-in:hover{color:#102418;background:linear-gradient(135deg,#ffe39a,#d7a84d)}.ltc-menu-button{display:none;color:white;border:0;background:rgba(255,255,255,.1);border-radius:12px;padding:10px;cursor:pointer}.ltc-menu-button svg{width:24px;height:24px}.ltc-sidebar-overlay{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.42)}.ltc-sidebar-panel{position:absolute;right:0;top:0;height:100%;width:min(310px,86vw);background:white;box-shadow:-20px 0 60px rgba(0,0,0,.25);padding:20px}.ltc-sidebar-top{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(16,24,40,.1);padding-bottom:16px;margin-bottom:16px}.ltc-sidebar-title{color:var(--green-950);font-weight:900;letter-spacing:.14em;font-size:12px}.ltc-sidebar-close{width:44px;height:44px;border-radius:12px;border:0;background:#f2f4f7;color:#101828;cursor:pointer}.ltc-sidebar-close svg{width:22px;height:22px;margin:auto}.ltc-sidebar-link{display:block;width:100%;border:0;background:transparent;color:#101828;text-align:left;border-radius:14px;padding:13px 14px;font-weight:800;margin-bottom:8px;cursor:pointer}.ltc-sidebar-link:hover,.ltc-sidebar-link.active{background:var(--green-800);color:white}.ltc-about-hero{position:relative;overflow:hidden;isolation:isolate;color:white;padding:112px 0 96px;background:linear-gradient(120deg,#03180f 0%,#082719 42%,#155f3b 100%)}.ltc-hero-bg{position:absolute;inset:0;z-index:-4;width:100%;height:100%;object-fit:cover;object-position:center;aspect-ratio:16 / 9}.ltc-about-hero::before{content:"";position:absolute;inset:0;z-index:-3;background:linear-gradient(120deg,rgba(2,18,11,.96),rgba(5,37,23,.89),rgba(12,64,39,.78));opacity:.98}.ltc-about-hero::after{content:none}.ltc-about-hero-content{position:relative;width:min(960px,92%);margin:0 auto;text-align:center}.ltc-eyebrow{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.1);padding:8px 14px;color:#f4d484;font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;backdrop-filter:blur(10px)}.ltc-about-hero h2{margin:18px auto 0;max-width:980px;font-size:clamp(42px,6vw,76px);line-height:.98;font-weight:900;letter-spacing:-.065em;text-shadow:0 8px 26px rgba(0,0,0,.22)}.ltc-about-hero h2 span{color:var(--gold-soft)}.ltc-about-hero p{max-width:720px;margin:24px auto 0;color:rgba(255,255,255,.82);font-size:18px;line-height:1.8}.ltc-hero-actions{margin-top:34px;display:flex;justify-content:center;flex-wrap:wrap;gap:14px}.ltc-btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 24px;border-radius:999px;font-size:14px;font-weight:900;transition:.28s var(--ease);border:0;cursor:pointer;text-decoration:none}.ltc-btn:hover{transform:translateY(-3px)}.ltc-btn-primary{color:#102418;background:linear-gradient(135deg,#f4d484,#d7a84d);box-shadow:0 16px 35px rgba(215,168,77,.28)}.ltc-btn-outline{color:white;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(8px)}.ltc-section{padding:84px 0}.ltc-section,.ltc-cta-section,.ltc-footer{content-visibility:auto;contain-intrinsic-size:1px 760px}.ltc-section-title{text-align:center;margin-bottom:42px}.ltc-section-title span{color:var(--green-700);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.18em}.ltc-section-title h3{margin:10px 0 0;color:var(--green-950);font-size:clamp(32px,4vw,50px);line-height:1.08;letter-spacing:-.055em;font-weight:900}.ltc-section-title p{max-width:720px;margin:15px auto 0;color:var(--muted)}.ltc-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.ltc-card{position:relative;overflow:hidden;padding:32px;min-height:250px;border-radius:var(--radius);background:var(--glass);border:1px solid rgba(255,255,255,.76);box-shadow:var(--shadow-md);transition:transform .38s var(--ease),box-shadow .38s var(--ease),border-color .38s var(--ease),background .38s var(--ease);backdrop-filter:blur(18px);text-align:left;cursor:pointer}.ltc-card::before{content:"";position:absolute;inset:0 0 auto;height:6px;background:linear-gradient(90deg,var(--green-700),var(--gold));transition:height .35s var(--ease),opacity .35s var(--ease)}.ltc-card::after{content:"";position:absolute;width:190px;height:190px;right:-86px;bottom:-86px;border-radius:50%;background:radial-gradient(circle,rgba(215,168,77,.22),transparent 58%),radial-gradient(circle,rgba(47,117,76,.18),transparent 66%);opacity:.9;transition:transform .45s var(--ease),opacity .45s var(--ease)}.ltc-card:hover,.ltc-card:focus-visible{transform:translateY(-12px) scale(1.015);box-shadow:0 34px 85px rgba(8,39,25,.22);border-color:rgba(215,168,77,.54);background:rgba(255,255,255,.92);outline:none}.ltc-card:hover::before,.ltc-card:focus-visible::before{height:9px}.ltc-card:hover::after,.ltc-card:focus-visible::after{transform:translate(-20px,-18px) scale(1.18)}.ltc-icon{width:56px;height:56px;display:grid;place-items:center;color:var(--green-800);border-radius:18px;background:linear-gradient(145deg,#eef8f2,#fff);box-shadow:inset 0 0 0 1px rgba(35,95,62,.12),0 12px 24px rgba(8,39,25,.08);position:relative;z-index:1;transition:transform .38s var(--ease),background .38s var(--ease),color .38s var(--ease),box-shadow .38s var(--ease)}.ltc-svg-icon{width:28px;height:28px;stroke:currentColor;stroke-width:2.2;fill:none;stroke-linecap:round;stroke-linejoin:round}.ltc-card:hover .ltc-icon,.ltc-card:focus-visible .ltc-icon{transform:translateY(-5px) scale(1.08) rotate(-2deg);color:var(--green-950);background:linear-gradient(145deg,#fff7dc,#ffffff);box-shadow:inset 0 0 0 1px rgba(215,168,77,.35),0 18px 34px rgba(8,39,25,.16)}.ltc-card h4{margin:22px 0 0;color:var(--green-950);font-size:22px;font-weight:900;letter-spacing:-.04em;position:relative;z-index:1;transition:color .3s var(--ease)}.ltc-card p{margin:12px 0 0;color:var(--muted);font-size:14px;position:relative;z-index:1;transition:color .3s var(--ease)}.ltc-card-link{position:relative;z-index:1;margin-top:20px;display:inline-flex;align-items:center;gap:8px;color:var(--green-700);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.ltc-card-link svg{width:16px;height:16px;transition:transform .28s var(--ease)}.ltc-card:hover .ltc-card-link svg{transform:translateX(4px)}.ltc-band{position:relative;overflow:hidden;color:white;background:linear-gradient(135deg,rgba(7,31,20,.98),rgba(35,95,62,.93)),radial-gradient(circle at 10% 0%,rgba(215,168,77,.34),transparent 34%)}.ltc-band::before{content:"";position:absolute;inset:0;opacity:.13;background-image:radial-gradient(rgba(255,255,255,.9) 1px,transparent 1px);background-size:22px 22px}.ltc-band-content{position:relative;display:grid;grid-template-columns:1fr;gap:34px;align-items:center}.ltc-band-heading{display:flex;align-items:end;justify-content:space-between;gap:24px}.ltc-band h3{margin:12px 0 0;font-size:clamp(32px,4vw,50px);line-height:1.08;letter-spacing:-.055em;font-weight:900}.ltc-band p{margin:15px 0 0;color:rgba(255,255,255,.75);max-width:650px}.ltc-highlight-buttons{display:flex;gap:10px}.ltc-circle-btn{width:48px;height:48px;display:grid;place-items:center;border-radius:999px;border:1px solid rgba(255,255,255,.2);color:white;background:rgba(255,255,255,.1);cursor:pointer;transition:.25s var(--ease)}.ltc-circle-btn:hover:not(:disabled){transform:translateY(-3px);background:rgba(255,255,255,.18)}.ltc-circle-btn:disabled{opacity:.35;cursor:not-allowed}.ltc-highlight-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.ltc-highlight-card{overflow:hidden;border-radius:var(--radius);background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);box-shadow:0 26px 70px rgba(0,0,0,.22);transition:transform .38s var(--ease),box-shadow .38s var(--ease),border-color .38s var(--ease)}.ltc-highlight-card:hover{transform:translateY(-10px);border-color:rgba(244,212,132,.45);box-shadow:0 34px 90px rgba(0,0,0,.30)}.ltc-highlight-media{height:250px;overflow:hidden;background:rgba(255,255,255,.1)}.ltc-highlight-media img,.ltc-highlight-empty{width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s var(--ease)}.ltc-highlight-empty{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:rgba(255,255,255,.84);font-size:12px;font-weight:900;letter-spacing:.18em;background:radial-gradient(circle at 24% 28%,rgba(244,212,132,.28),transparent 22%),radial-gradient(circle at 76% 72%,rgba(255,255,255,.10),transparent 28%),linear-gradient(135deg,#0e3321,#235f3e)}.ltc-highlight-mark{display:grid;place-items:center;width:76px;height:76px;margin-bottom:8px;border:1px solid rgba(255,255,255,.22);border-radius:50%;color:var(--gold-soft);background:rgba(255,255,255,.08);font-size:25px;letter-spacing:-.04em;box-shadow:0 18px 40px rgba(0,0,0,.18)}.ltc-highlight-card:hover img{transform:scale(1.08)}.ltc-highlight-content{padding:22px}.ltc-highlight-label{margin:0 0 8px !important;color:var(--gold-soft) !important;font-size:11px !important;font-weight:900 !important;letter-spacing:.18em;text-transform:uppercase}.ltc-highlight-content h4{margin:0;color:white;font-size:20px;font-weight:900;letter-spacing:-.04em}.ltc-highlight-content p{margin:8px 0 0;color:rgba(255,255,255,.78);font-size:13px}.ltc-cta-section{padding:84px 0}.ltc-cta-box{display:flex;align-items:center;justify-content:space-between;gap:28px;padding:clamp(30px,5vw,48px);border-radius:32px;color:white;background:radial-gradient(circle at 88% 18%,rgba(244,212,132,.22),transparent 28%),radial-gradient(circle at 12% 90%,rgba(255,255,255,.08),transparent 30%),linear-gradient(135deg,rgba(14,51,33,.98),rgba(47,117,76,.94));box-shadow:var(--shadow-lg)}.ltc-cta-box h3{margin:0;font-size:clamp(30px,4vw,46px);line-height:1.1;letter-spacing:-.055em;font-weight:900}.ltc-cta-box p{margin:12px 0 0;color:rgba(255,255,255,.76)}.ltc-footer{width:100%;background:var(--footer-green);color:white;padding:30px 0 12px;margin:0}.ltc-footer .ltc-container{width:100%;max-width:none;margin:0;padding-left:32px;padding-right:32px}.ltc-footer-grid{width:100%;display:grid;grid-template-columns:1.5fr .9fr 1fr 1.65fr;gap:22px;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,.1)}.ltc-footer h4{color:white;font-weight:900;font-size:18px;line-height:1.2;margin:0 0 10px}.ltc-footer h5{color:#f4d484;font-size:12px;line-height:1.2;font-weight:900;text-transform:uppercase;letter-spacing:.14em;margin:0 0 10px}.ltc-footer p,.ltc-footer-link{display:block;color:rgba(255,255,255,.68);font-size:13px;line-height:1.55;margin:5px 0;text-decoration:none}.ltc-footer-link{border:0;background:transparent;padding:0;cursor:pointer;text-align:left}.ltc-footer-link:hover{color:white;text-decoration:underline}.ltc-copyright{width:100%;padding-top:14px;display:flex;justify-content:space-between;gap:12px;color:rgba(255,255,255,.52);font-size:12px;line-height:1.4}@media (prefers-reduced-motion:reduce){.ltc-about *,.ltc-about *::before,.ltc-about *::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;scroll-behavior:auto !important;transition-duration:.001ms !important}}@media (max-width:900px){.ltc-header .ltc-container{padding-left:22px;padding-right:22px}.ltc-nav{min-height:auto;padding:18px 0}.ltc-desktop-nav,.ltc-header-signin{display:none}.ltc-menu-button{display:grid;place-items:center}.ltc-grid-3,.ltc-highlight-grid,.ltc-footer-grid{grid-template-columns:1fr}.ltc-about-hero{padding:84px 0 76px}.ltc-band-heading,.ltc-cta-box{flex-direction:column;align-items:flex-start}.ltc-highlight-buttons{align-self:stretch}.ltc-circle-btn{flex:1}.ltc-footer{padding:28px 0 12px}.ltc-footer-grid{gap:18px;padding-bottom:22px}.ltc-footer .ltc-container{padding-left:22px;padding-right:22px}.ltc-copyright{flex-direction:column}}@media (max-width:600px){.ltc-header .ltc-container,.ltc-footer .ltc-container{padding-left:16px;padding-right:16px}.ltc-logo h1{font-size:14px}.ltc-logo p{font-size:10px}.ltc-about-hero h2{font-size:clamp(34px,11vw,46px);letter-spacing:-.045em}.ltc-about-hero p{font-size:15px}.ltc-section,.ltc-cta-section{padding:64px 0}.ltc-hero-actions,.ltc-btn{width:100%}.ltc-card{padding:26px}}.ltc-manpower-page{--green-950:#071f14;--green-900:#0e3321;--green-800:#174a30;--green-700:#235f3e;--green-600:#2f754c;--footer-green:#082719;--gold:#d7a84d;--gold-soft:#f4d484;--dark:#101828;--muted:#667085;--glass:rgba(255,255,255,.86);--shadow-sm:0 10px 28px rgba(8,39,25,.08);--shadow-md:0 18px 45px rgba(8,39,25,.12);--shadow-lg:0 32px 80px rgba(8,39,25,.18);--ease:cubic-bezier(.22,1,.36,1);min-height:100vh;color:var(--dark);background:radial-gradient(circle at 12% 0%,rgba(215,168,77,.12),transparent 28%),radial-gradient(circle at 92% 12%,rgba(35,95,62,.12),transparent 30%),linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif !important;line-height:1.65;letter-spacing:-.01em}.ltc-manpower-page *,.ltc-manpower-page *::before,.ltc-manpower-page *::after{box-sizing:border-box}.ltc-manpower-page h1,.ltc-manpower-page h2,.ltc-manpower-page h3,.ltc-manpower-page h4,.ltc-manpower-page h5{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif !important}.ltc-container{width:min(1180px,92%) !important;margin-inline:auto !important}.ltc-header{position:sticky !important;top:0;z-index:50;width:100%;margin:0 !important;background:rgba(8,39,25,.97) !important;border-bottom:1px solid rgba(255,255,255,.10) !important;box-shadow:0 10px 34px rgba(7,31,20,.18) !important;backdrop-filter:blur(16px)}.ltc-header .ltc-container,.ltc-footer .ltc-container{width:100% !important;max-width:none !important;margin:0 !important;padding-inline:32px !important}.ltc-nav{min-height:76px !important;display:flex !important;align-items:center !important;justify-content:space-between !important;gap:20px !important}.ltc-logo{display:flex !important;align-items:center !important;gap:13px !important;color:#fff !important;text-decoration:none !important}.ltc-logo-icon{width:42px !important;height:42px !important;flex:0 0 42px;border-radius:50% !important;object-fit:cover !important;background:linear-gradient(145deg,#fff,#e3f4ea) !important;box-shadow:0 0 0 5px rgba(255,255,255,.08),0 12px 24px rgba(0,0,0,.14) !important}.ltc-logo h1{margin:0 !important;color:#fff !important;font-size:18px !important;font-weight:900 !important;line-height:1 !important;letter-spacing:-.04em !important;text-transform:uppercase !important}.ltc-logo p{margin:4px 0 0 !important;color:rgba(255,255,255,.70) !important;font-size:11px !important}.ltc-desktop-nav{display:flex !important;align-items:center !important;gap:8px !important;margin-left:auto}.ltc-nav-link{color:rgba(255,255,255,.78) !important;background:transparent !important;padding:10px 14px !important;border:0 !important;border-radius:999px !important;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif !important;font-size:12px !important;font-weight:800 !important;line-height:1.2 !important;letter-spacing:.08em !important;text-transform:uppercase !important;text-decoration:none !important;white-space:nowrap;transition:.25s var(--ease) !important}.ltc-nav-link:hover,.ltc-nav-link.active{color:#fff !important;background:rgba(255,255,255,.13) !important;transform:translateY(-1px)}.ltc-sign-in{color:#102418 !important;background:linear-gradient(135deg,#f4d484,#d7a84d) !important;box-shadow:0 16px 35px rgba(215,168,77,.22) !important}.ltc-menu-button{display:none;width:44px;height:44px;place-items:center;padding:0 !important;border:1px solid rgba(255,255,255,.12) !important;border-radius:14px !important;color:#fff !important;background:rgba(255,255,255,.10) !important}.ltc-menu-button svg{width:24px;height:24px}.ltc-sidebar-overlay{position:fixed !important;inset:0 !important;z-index:80 !important;background:rgba(0,0,0,.48) !important;backdrop-filter:blur(5px)}.ltc-sidebar-panel{position:absolute !important;top:0 !important;right:0 !important;width:min(320px,88vw) !important;height:100% !important;padding:22px !important;background:#fff !important;box-shadow:-24px 0 70px rgba(0,0,0,.28) !important}.ltc-sidebar-top{display:flex !important;align-items:center !important;justify-content:space-between !important;margin-bottom:16px !important;padding-bottom:16px !important;border-bottom:1px solid rgba(16,24,40,.10) !important}.ltc-sidebar-title{margin:0 !important;color:var(--green-950) !important;font-size:12px !important;font-weight:900 !important;letter-spacing:.14em !important}.ltc-sidebar-close{width:44px !important;height:44px !important;border:0 !important;border-radius:13px !important;color:#101828 !important;background:#f2f4f7 !important}.ltc-sidebar-close svg{width:20px;height:20px}.ltc-sidebar-link{display:block !important;width:100% !important;margin:0 0 8px !important;padding:13px 14px !important;border:0 !important;border-radius:14px !important;color:#101828 !important;background:transparent !important;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif !important;font-size:13px !important;font-weight:800 !important;text-align:left !important;text-transform:uppercase}.ltc-sidebar-link:hover,.ltc-sidebar-link.active{color:#fff !important;background:var(--green-800) !important}.ltc-about-hero{position:relative !important;min-height:540px !important;display:flex !important;align-items:center !important;overflow:hidden !important;color:#fff !important;background-color:#082719 !important}.ltc-about-hero-content{width:min(960px,100%) !important;padding-block:88px 100px !important}.ltc-about-hero h2{max-width:940px;margin:12px 0 0 !important;color:#fff !important;font-size:clamp(42px,6vw,76px) !important;font-weight:900 !important;line-height:.98 !important;letter-spacing:-.065em !important;text-shadow:0 8px 26px rgba(0,0,0,.22)}.ltc-about-hero p{max-width:700px;margin-top:24px !important;color:rgba(255,255,255,.80) !important;font-size:18px !important;line-height:1.8 !important}.ltc-eyebrow{color:var(--gold-soft) !important;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif !important;font-size:12px !important;font-weight:900 !important;letter-spacing:.18em !important;text-transform:uppercase !important}.ltc-btn,.ltc-card-link{display:inline-flex !important;align-items:center !important;justify-content:center !important;min-height:50px !important;padding:0 24px !important;border-radius:999px !important;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif !important;font-size:13px !important;font-weight:900 !important;text-decoration:none !important;transition:transform .28s var(--ease),box-shadow .28s var(--ease) !important}.ltc-btn-primary{border:0 !important;color:#102418 !important;background:linear-gradient(135deg,#f4d484,#d7a84d) !important;box-shadow:0 16px 35px rgba(215,168,77,.26) !important}.ltc-btn-outline{color:var(--green-950) !important;background:#fff !important;border:1px solid rgba(35,95,62,.16) !important;box-shadow:var(--shadow-sm) !important}.ltc-btn:hover{transform:translateY(-3px) !important}.ltc-section{padding-block:84px !important}.ltc-section-title{margin-bottom:36px !important;text-align:center !important}.ltc-section-title span{color:var(--green-700) !important;font-size:12px !important;font-weight:900 !important;letter-spacing:.18em !important;text-transform:uppercase !important}.ltc-section-title h2,.ltc-section-title h3{margin:10px 0 0 !important;color:var(--green-950) !important;font-size:clamp(32px,4vw,50px) !important;line-height:1.08 !important;letter-spacing:-.055em !important;font-weight:900 !important}.ltc-section-title p{max-width:720px;margin:15px auto 0 !important;color:var(--muted) !important}.ltc-card{border:1px solid rgba(35,95,62,.12) !important;border-radius:26px !important;background:rgba(255,255,255,.94) !important;box-shadow:var(--shadow-md) !important;transition:transform .28s var(--ease),box-shadow .28s var(--ease),border-color .28s var(--ease) !important}.ltc-card:hover{transform:translateY(-6px) !important;border-color:rgba(215,168,77,.42) !important;box-shadow:var(--shadow-lg) !important}.ltc-highlight-card{border:1px solid rgba(255,255,255,.18) !important;border-radius:26px !important;background:rgba(255,255,255,.12) !important;box-shadow:0 26px 70px rgba(0,0,0,.22) !important}.ltc-highlight-card:hover{transform:translateY(-6px) !important;border-color:rgba(244,212,132,.45) !important;box-shadow:0 34px 90px rgba(0,0,0,.30) !important}.ltc-highlight-content h4{color:#fff !important}.ltc-highlight-content > p:not(.ltc-highlight-label){color:rgba(255,255,255,.78) !important}.ltc-cta-box{border:1px solid rgba(255,255,255,.16) !important;border-radius:32px !important;color:#fff !important;background:radial-gradient(circle at 88% 18%,rgba(244,212,132,.22),transparent 28%),radial-gradient(circle at 12% 90%,rgba(255,255,255,.08),transparent 30%),linear-gradient(135deg,rgba(14,51,33,.98),rgba(47,117,76,.94)) !important;box-shadow:var(--shadow-lg) !important}.ltc-cta-box h3{color:#fff !important}.ltc-cta-box p{color:rgba(255,255,255,.78) !important}.ltc-footer{width:100% !important;margin:0 !important;padding:30px 0 12px !important;color:#fff !important;background:var(--footer-green) !important}.ltc-footer-grid{width:100%;display:grid !important;grid-template-columns:1.5fr .9fr 1fr 1.4fr .8fr !important;gap:22px !important;padding-bottom:24px !important;border-bottom:1px solid rgba(255,255,255,.10) !important}.ltc-footer h4{margin:0 0 10px !important;color:#fff !important;font-size:18px !important;font-weight:900 !important}.ltc-footer h5{margin:0 0 10px !important;color:var(--gold-soft) !important;font-size:12px !important;font-weight:900 !important;letter-spacing:.14em !important;text-transform:uppercase !important}.ltc-footer p,.ltc-footer a,.ltc-footer-link{display:block;margin:5px 0 !important;color:rgba(255,255,255,.68) !important;font-size:13px !important;line-height:1.55 !important;text-decoration:none !important}.ltc-footer a:hover,.ltc-footer-link:hover{color:#fff !important;text-decoration:underline !important}.ltc-copyright{width:100%;display:flex !important;justify-content:space-between !important;gap:12px !important;padding-top:14px !important;color:rgba(255,255,255,.52) !important;font-size:12px !important;line-height:1.4 !important}@media (max-width:1000px){.ltc-header .ltc-container,.ltc-footer .ltc-container{padding-inline:22px !important}.ltc-desktop-nav,.ltc-header-signin{display:none !important}.ltc-menu-button{display:grid !important}.ltc-footer-grid{grid-template-columns:1fr 1fr !important}}@media (max-width:700px){.ltc-header .ltc-container,.ltc-footer .ltc-container{padding-inline:16px !important}.ltc-logo h1{font-size:14px !important}.ltc-logo p{display:none !important}.ltc-about-hero h2{font-size:clamp(38px,12vw,54px) !important;letter-spacing:-.045em !important}.ltc-about-hero p{font-size:16px !important}.ltc-section{padding-block:62px !important}.ltc-hero-actions,.ltc-btn{width:100%}.ltc-footer-grid{grid-template-columns:1fr !important;gap:18px !important}.ltc-copyright{flex-direction:column !important}}`}</style>
      <style>{MANPOWER_PUBLIC_THEME}</style>
      <header className="mp-header">
        <div className="mp-container mp-nav">
          <Link to={MANPOWER_HOME_ROUTE} className="mp-logo">
            <img
              src={LOGO_IMAGE}
              alt="Manpower Logo"
              className="mp-logo-icon"
              width="42"
              height="42"
              decoding="async"
            />
            <div>
              <h1 style={fontMontserrat}>LTC MANPOWER SERVICES</h1>
              <p style={fontPontano}>Professional staffing and workforce solutions.</p>
            </div>
          </Link>

          <nav className="mp-desktop-nav" style={fontPoppins} aria-label="Manpower navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;

              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`mp-nav-link ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link to="/manpower-employee-login" className="mp-nav-link mp-sign-in">
              Sign In
            </Link>
          </nav>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mp-menu-button"
            aria-label="Open menu"
            aria-expanded={isSidebarOpen}
            aria-controls="manpower-mobile-menu"
            type="button"
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

      {isSidebarOpen && (
        <div className="mp-sidebar-overlay">
          <div
            style={{ position: "absolute", inset: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />

          <aside
            id="manpower-mobile-menu"
            className="mp-sidebar-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Manpower navigation menu"
          >
            <div className="mp-sidebar-top">
              <p className="mp-sidebar-title" style={fontPoppins}>MENU</p>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="mp-sidebar-close"
                aria-label="Close menu"
                type="button"
              >
                ✕
              </button>
            </div>

            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`mp-sidebar-link ${isActive ? "active" : ""}`}
                  onClick={() => setIsSidebarOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/manpower-employee-login"
              className="mp-sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              Sign In
            </Link>
          </aside>
        </div>
      )}

      <main>
        <section className="ltc-about-hero">
          <img
            src={HERO_IMAGE_1440}
            srcSet={`${HERO_IMAGE_960} 960w, ${HERO_IMAGE_1440} 1440w, ${HERO_IMAGE} 1672w`}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            className="ltc-hero-bg"
            width="1440"
            height="810"
            loading="eager"
            fetchPriority="high"
          />
          <div className="ltc-container ltc-about-hero-content">
            <h2 style={fontMontserrat}>
              Begin your journey with <span>LTC Manpower Services</span> today.
            </h2>
            <p style={fontPontano}>
              Explore job opportunities, submit your requirements, and start your application with reliable staffing support from LTC Manpower Services.
            </p>
            <div className="ltc-hero-actions">
              <button
                type="button"
                className="ltc-btn ltc-btn-primary"
                style={fontMontserrat}
                onClick={() => goTo("/manpower-apply")}
              >
                Apply Now
              </button>
              <button
                type="button"
                className="ltc-btn ltc-btn-outline"
                style={fontMontserrat}
                onClick={() => goTo("/manpower-positions")}
              >
                View Job Offers
              </button>
            </div>
          </div>
        </section>

        <section id="services" className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-section-title">
              <span>Quick Access</span>
              <h3 style={fontMontserrat}>Manpower solutions made easier</h3>
              <p style={fontPontano}>
                Use these shortcuts to apply, view available job offers, and prepare your requirements.
              </p>
            </div>

            <div className="ltc-grid-3">
              {serviceCards.map((card) => (
                <ServiceCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  to={card.to}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="ltc-section ltc-band">
          <div className="ltc-container ltc-band-content">
            <div className="ltc-band-heading">
              <div>
                <div className="ltc-eyebrow" style={fontPoppins}>Our Highlights</div>
                <h3 style={fontMontserrat}>Workforce stories and service highlights.</h3>
                <p style={fontPontano}>
                  Browse the latest manpower highlights uploaded by the admin team.
                </p>
              </div>

              <div className="ltc-highlight-buttons">
                <button
                  type="button"
                  aria-label="Previous highlight"
                  onClick={goPreviousHighlight}
                  disabled={displayHighlights.length <= 3}
                  className="ltc-circle-btn"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M15 18 9 12l6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next highlight"
                  onClick={goNextHighlight}
                  disabled={displayHighlights.length <= 3}
                  className="ltc-circle-btn"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="ltc-highlight-grid">
              {visibleHighlights.map((highlight, index) => (
                <HighlightCard
                  key={highlight?._id || `${highlight?.imageUrl}-${index}`}
                  highlight={highlight}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="ltc-cta-section">
          <div className="ltc-container">
            <div className="ltc-cta-box">
              <div>
                <h3 style={fontMontserrat}>Ready to start your manpower application?</h3>
                <p style={fontPontano}>
                  Submit your details, check requirements, and connect with opportunities from LTC Manpower Services.
                </p>
              </div>

              <button
                type="button"
                onClick={() => goTo("/manpower-apply")}
                className="ltc-btn ltc-btn-primary"
                style={fontMontserrat}
              >
                Apply Now
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="ltc-footer">
        <div className="ltc-container ltc-footer-grid">
          <div>
            <Link to={MANPOWER_HOME_ROUTE} className="ltc-logo">
              <img src={LOGO_IMAGE} alt="Manpower Logo" className="ltc-logo-icon" width="128" height="128" decoding="async" />
              <div>
                <h4 style={fontMontserrat}>LTC Manpower</h4>
                <p style={fontPontano}>Professional staffing and workforce support solutions.</p>
              </div>
            </Link>
          </div>

          <div>
            <h5 style={fontMontserrat}>Menu</h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, ...fontPontano }}>
              <FooterLink to={MANPOWER_HOME_ROUTE}>Home</FooterLink>
              <FooterLink to="/manpower-positions">Job Offer</FooterLink>
              <FooterLink to="/manpower-requirements">Requirements</FooterLink>
              <FooterLink to="/manpower-employee-login">Profile</FooterLink>
            </ul>
          </div>

          <div>
            <h5 style={fontMontserrat}>Contact Information</h5>
            <p style={fontPontano}><a href="mailto:ltc.tamsi@gmail.com">ltc.tamsi@gmail.com</a></p>
            <p style={fontPontano}><a href="mailto:lorengladius@ltcmultiservices.com">lorengladius@ltcmultiservices.com</a></p>
            <p style={fontPontano}><a href="tel:+639516281271">+639516281271</a></p>
            <p style={fontPontano}><a href="tel:+639959808051">+639959808051</a></p>
          </div>

          <div>
            <h5 style={fontMontserrat}>Address</h5>
            <p style={fontPontano}>2/F 5441 Currie Street,</p>
            <p style={fontPontano}>Palanan, Makati City</p>
          </div>

          <div>
            <h5 style={fontMontserrat}>Follow Us</h5>
            <p style={fontPontano}><a href={"https://www.facebook.com/profile.php?id=61571746334920&rdid=3bcMsbFVo3PBobtd&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1D1g1d614L#"} target="_blank" rel="noopener noreferrer">Facebook</a></p>
            <p style={fontPontano}><a href="mailto:lorengladius@ltcmultiservices.com">Email</a></p>
          </div>
        </div>

        <div className="ltc-container ltc-copyright">
          <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
        </div>
      </footer>

      <FloatingHomeIconButton onClick={() => navigate("/")} />
    </div>
  );
}

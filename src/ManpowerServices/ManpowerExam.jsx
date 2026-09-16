import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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


function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

function toNumber(value = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function formatScore(score = 0, max = 0) {
  return `${toNumber(score).toFixed(2)} / ${toNumber(max).toFixed(2)}`;
}

const MANPOWER_HOME_ROUTE = "/manpower-services";

const EXAM_NAV_LINKS = [
  { label: "Home", to: MANPOWER_HOME_ROUTE },
  { label: "Job Offer", to: "/manpower-positions" },
  { label: "Requirements", to: "/manpower-requirements" },
  { label: "Contact", to: "/manpower-contact" },
  { label: "FAQs", to: "/manpower-faqs" },
];

function FloatingHomeIconButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ltc-floating-home-button"
      title="Back to LTC Group Home"
      aria-label="Back to LTC Group Home"
    >
      <span className="ltc-floating-home-tooltip">LTC GROUP OF COMPANIES</span>
      <img src="/LTCLogo.webp" alt="" aria-hidden="true" width="56" height="56" decoding="async" />
    </button>
  );
}

function ExamLayout({ children }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="manpower-exam-page">
      <style>{`
        .manpower-exam-page .exam-question-options label:has(input:checked) {
          border-color: #8fb59c !important;
          background: #f1f8f3 !important;
          box-shadow: 0 0 0 3px rgba(35,95,62,.07);
        }
        .manpower-exam-page .exam-question-options input {
          accent-color: #235f3e;
        }
      `}</style>
      <style>{MANPOWER_PUBLIC_THEME}</style>

      <header className="mp-header">
        <div className="mp-container mp-nav">
          <Link to={MANPOWER_HOME_ROUTE} className="mp-logo">
            <img src="/ManpowerLogo.webp" alt="Manpower Logo" className="mp-logo-icon" width="42" height="42" decoding="async" />
            <div>
              <h1>LTC MANPOWER SERVICES</h1>
              <p>Professional staffing and workforce solutions.</p>
            </div>
          </Link>

          <nav className="mp-desktop-nav" aria-label="Manpower navigation">
            {EXAM_NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="mp-nav-link">
                {link.label}
              </Link>
            ))}
            <Link to="/manpower-employee-login" className="mp-nav-link mp-sign-in">
              Sign In
            </Link>
          </nav>

          <button
            type="button"
            className="mp-menu-button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="mp-sidebar-overlay">
          <div style={{ position: "absolute", inset: 0 }} onClick={() => setMobileOpen(false)} />
          <aside className="mp-sidebar-panel" role="dialog" aria-modal="true" aria-label="Manpower navigation menu">
            <div className="mp-sidebar-top">
              <p className="mp-sidebar-title">MENU</p>
              <button type="button" className="mp-sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
            </div>
            {EXAM_NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="mp-sidebar-link" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link to="/manpower-employee-login" className="mp-sidebar-link" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
          </aside>
        </div>
      ) : null}

      <main>{children}</main>

      <footer className="mp-footer">
        <div className="mp-container mp-footer-grid">
          <div>
            <Link to={MANPOWER_HOME_ROUTE} className="mp-logo">
              <img src="/ManpowerLogo.webp" alt="Manpower Logo" className="mp-logo-icon" width="42" height="42" loading="lazy" decoding="async" />
              <div>
                <h4>LTC Manpower</h4>
                <p>Professional staffing and workforce support solutions.</p>
              </div>
            </Link>
          </div>

          <div>
            <h5>Menu</h5>
            <Link to={MANPOWER_HOME_ROUTE}>Home</Link>
            <Link to="/manpower-positions">Job Offer</Link>
            <Link to="/manpower-requirements">Requirements</Link>
            <Link to="/manpower-employee-login">Profile</Link>
          </div>

          <div>
            <h5>Contact Information</h5>
            <a href="mailto:ltc.tamsi@gmail.com">ltc.tamsi@gmail.com</a>
            <a href="mailto:lorengladius@ltcmultiservices.com">lorengladius@ltcmultiservices.com</a>
            <a href="tel:+639516281271">+639516281271</a>
            <a href="tel:+639959808051">+639959808051</a>
          </div>

          <div>
            <h5>Address</h5>
            <p>2/F 5441 Currie Street,</p>
            <p>Palanan, Makati City</p>
          </div>

          <div>
            <h5>Follow Us</h5>
            <a href="https://www.facebook.com/profile.php?id=61571746334920" target="_blank" rel="noreferrer">Facebook</a>
            <a href="mailto:lorengladius@ltcmultiservices.com">Email</a>
          </div>
        </div>

        <div className="mp-container mp-copyright">
          <span>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span>Developed by CRMS Tech Alliance</span>
        </div>
      </footer>

      <FloatingHomeIconButton onClick={() => navigate("/")} />
    </div>
  );
}

function ExamHero({ title = "Qualifying Exam", subtitle = "Complete your manpower screening assessment to continue your application." }) {
  return (
    <section className="mp-hero">
      <img
        src="/ManpowerBanner.webp"
        alt=""
        aria-hidden="true"
        className="mp-hero-bg"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      <div className="mp-container mp-hero-content">
        <span className="mp-exam-eyebrow">Manpower Assessment</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}

function InfoCard({ label, value, status }) {
  return (
    <div className="exam-card rounded-2xl border border-[#d7ddd5] bg-white/80 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5f6f61]">
        {label}
      </p>
      <p
        className={`mt-2 text-lg font-black ${
          status === "success"
            ? "text-[#1f6b38]"
            : status === "danger"
            ? "text-[#912f2f]"
            : "text-[#24352c]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function ManpowerExam() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadExam() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/manpower/applications/${applicationId}/exam`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load qualifying exam.");
        }

        if (!active) return;

        setExamData(data);

        if (data?.existingAssessment) {
          setResult(data.existingAssessment);
        }
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load qualifying exam.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (applicationId) {
      loadExam();
    }

    return () => {
      active = false;
    };
  }, [applicationId]);

  const questions = useMemo(() => examData?.exam?.questions || [], [examData]);

  const answeredCount = useMemo(() => questions.filter((question) =>
    String(answers[question.id] || "").trim()
  ).length, [questions, answers]);

  const unansweredQuestions = useMemo(() => questions.filter((question) =>
    !String(answers[question.id] || "").trim()
  ), [questions, answers]);

  useEffect(() => {
    if (result || answeredCount === 0) return undefined;
    function warnBeforeLeave(event) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [answeredCount, result]);

  function updateAnswer(questionId, value) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  function submitExam(e) {
    e.preventDefault();
    setError("");

    if (unansweredQuestions.length > 0) {
      const first = unansweredQuestions[0];
      const firstIndex = questions.findIndex((question) => question.id === first.id);
      setError(`Please answer question ${firstIndex + 1}. All questions are required before submission.`);
      document.getElementById(`exam-question-${first.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setShowSubmitConfirm(true);
  }

  async function performSubmitExam() {
    setShowSubmitConfirm(false);
    setError("");
    const payloadAnswers = questions.map((question) => ({
      questionId: question.id,
      answer: String(answers[question.id] || "").trim(),
    }));

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/manpower/applications/${applicationId}/exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payloadAnswers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to submit qualifying exam.");
      setResult(data?.assessment || null);
    } catch (err) {
      setError(err?.message || "Failed to submit qualifying exam.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <ExamLayout>
        <ExamHero title="Qualifying Exam" subtitle="Preparing your manpower assessment." />
        <section className="exam-content-section mx-auto max-w-7xl px-4 pb-10 pt-4 md:px-6">
          <div
            className="exam-main-shell exam-panel p-8 text-[#24372d]"
            role="status"
            aria-live="polite"
          >
            Loading qualifying exam...
          </div>
        </section>
      </ExamLayout>
    );
  }

  if (error && !examData) {
    return (
      <ExamLayout>
        <ExamHero title="Qualifying Exam" subtitle="We could not load your assessment right now." />
        <section className="exam-content-section mx-auto max-w-7xl px-4 pb-10 pt-4 md:px-6">
          <div className="exam-main-shell exam-panel p-8">
            <p className="text-sm font-semibold text-[#912f2f]" role="alert">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/manpower-services")}
              className="exam-secondary-button mt-5"
            >
              Back to Manpower Services
            </button>
          </div>
        </section>
      </ExamLayout>
    );
  }

  if (result) {
    return (
      <ExamLayout>
        <ExamHero
          title={result?.examTitle || examData?.exam?.title || "Exam Result"}
          subtitle="Your manpower qualifying exam result has been recorded."
        />

        <section className="exam-content-section mx-auto max-w-7xl px-4 pb-10 pt-4 md:px-6">
          <div className="exam-main-shell">
            <section>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2f5a45]">
                Manpower Qualifying Exam
              </p>
              <h3 className="mt-2 text-[28px] font-black tracking-tight text-[#071f14] md:text-[42px]">
                Assessment Result
              </h3>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoCard label="Job Offer" value={result?.vacancy || examData?.vacancy || "-"} />
                <InfoCard
                  label="Result"
                  value={result?.passed ? "Passed" : "Did Not Reach Passing Score"}
                  status={result?.passed ? "success" : "danger"}
                />
                <InfoCard label="Total Score" value={formatScore(result?.totalScore, result?.maxScore)} />
                <InfoCard label="Percentage" value={`${toNumber(result?.percentage).toFixed(2)}%`} />
                <InfoCard label="Passing Score" value={`${toNumber(result?.passingScore).toFixed(2)}%`} />
                <InfoCard
                  label="Submitted"
                  value={result?.submittedAt ? new Date(result.submittedAt).toLocaleString() : "-"}
                />
              </div>
            </section>

            <div className="mx-auto my-8 h-[2px] w-[90%] bg-[#617b6a]" />

            <section>
              <h3 className="text-[26px] font-black tracking-tight text-[#071f14] md:text-[34px]">
                Answer Review
              </h3>
              <div className="mt-6 space-y-4">
                {(result?.answers || []).map((row, index) => (
                  <div
                    key={`${row?.questionId || index}`}
                    className="exam-card rounded-2xl border border-[#d7decf] bg-white p-5 shadow-sm"
                  >
                    <p className="text-sm font-bold text-[#24352c]">
                      {index + 1}. {row?.questionText || "-"}
                    </p>
                    <p className="mt-3 text-sm text-[#56695b]">
                      <span className="font-semibold text-[#24352c]">Your Answer:</span>{" "}
                      {row?.applicantAnswer || "-"}
                    </p>
                    <p className="mt-2 text-sm text-[#56695b]">
                      <span className="font-semibold text-[#24352c]">Score:</span>{" "}
                      {formatScore(row?.earnedPoints, row?.maxPoints)}
                    </p>
                    <p className="mt-2 text-sm text-[#56695b]">
                      <span className="font-semibold text-[#24352c]">Feedback:</span>{" "}
                      {row?.feedback || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/manpower-services")}
                className="exam-secondary-button"
              >
                Back to Manpower Services
              </button>
            </div>
          </div>
        </section>
      </ExamLayout>
    );
  }

  return (
    <ExamLayout>
      <ExamHero
        title={examData?.exam?.title || "Qualifying Exam"}
        subtitle="Answer the questions below and submit your assessment to continue your application."
      />

      <section className="exam-content-section mx-auto max-w-7xl px-4 pb-10 pt-4 md:px-6">
        <div className="exam-main-shell">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2f5a45]">
              Manpower Qualifying Exam
            </p>
            <h3 className="mt-2 text-[28px] font-black tracking-tight text-[#071f14] md:text-[42px]">
              Exam Details
            </h3>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <InfoCard label="Applicant" value={examData?.applicantName || "-"} />
              <InfoCard label="Job Offer" value={examData?.vacancy || "-"} />
              <InfoCard
                label="Passing Score"
                value={`${toNumber(examData?.exam?.passingScore).toFixed(2)}%`}
              />
            </div>
          </section>

          <div className="mx-auto my-8 h-[2px] w-[90%] bg-[#617b6a]" />

          <div className="exam-card mb-6 rounded-2xl border border-[#d7decf] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5f6f61]">Exam progress</p>
                <strong className="mt-1 block text-xl text-[#24352c]">{answeredCount} of {questions.length} answered</strong>
              </div>
              <span className={`rounded-full px-4 py-2 text-xs font-black ${unansweredQuestions.length ? "bg-[#fff4df] text-[#7a5311]" : "bg-[#e8f5ec] text-[#1f6b38]"}`}>
                {unansweredQuestions.length ? `${unansweredQuestions.length} remaining` : "Ready to submit"}
              </span>
            </div>
            <div
              className="exam-progress-track mt-4 h-3 overflow-hidden rounded-full"
              role="progressbar"
              aria-label="Exam completion progress"
              aria-valuemin={0}
              aria-valuemax={questions.length}
              aria-valuenow={answeredCount}
              aria-valuetext={`${answeredCount} of ${questions.length} questions answered`}
            >
              <div
                className="exam-progress-fill h-full rounded-full transition-all"
                style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <form onSubmit={submitExam} className="space-y-6">
            <section>
              <h3 className="text-[28px] font-black tracking-tight text-[#071f14] md:text-[38px]">
                Questions
              </h3>

              <div className="mt-6 space-y-5">
                {questions.map((question, index) => (
                  <section
                    key={question.id}
                    id={`exam-question-${question.id}`}
                    className={`exam-card rounded-2xl border bg-white p-5 shadow-sm ${String(answers[question.id] || "").trim() ? "border-[#9ac2a8]" : "border-[#d7decf]"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2
                        id={`exam-question-label-${question.id}`}
                        className="font-semibold text-[#24352c]"
                      >
                        {index + 1}. {question.questionText}
                      </h2>
                      <span className="shrink-0 rounded-full bg-[#eef3ea] px-3 py-1 text-xs font-semibold text-[#395345]">
                        {question.maxPoints} pts
                      </span>
                    </div>

                    {question.questionType === "multiple_choice" ||
                    question.questionType === "true_false" ? (
                      <div
                        className="exam-question-options mt-4 grid gap-3 md:grid-cols-2"
                        role="radiogroup"
                        aria-labelledby={`exam-question-label-${question.id}`}
                      >
                        {(question.choices || []).map((choice) => (
                          <label
                            key={choice}
                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#d7decf] bg-[#fbfdf9] px-4 py-3 text-sm font-semibold text-[#24352c] transition hover:border-[#91a691] hover:bg-white"
                          >
                            <input
                              type="radio"
                              name={`exam-question-${question.id}`}
                              value={choice}
                              checked={answers[question.id] === choice}
                              onChange={(e) => updateAnswer(question.id, e.target.value)}
                              className="accent-[#395345]"
                            />
                            <span>{choice}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        id={`exam-answer-${question.id}`}
                        name={`exam-answer-${question.id}`}
                        rows={5}
                        value={answers[question.id] || ""}
                        onChange={(e) => updateAnswer(question.id, e.target.value)}
                        aria-labelledby={`exam-question-label-${question.id}`}
                        className="mt-4 w-full rounded-xl border border-[#c6ccb9] bg-[#fbfdf9] px-4 py-3 text-sm outline-none transition focus:border-[#395345] focus:bg-white"
                        placeholder="Type your answer here..."
                      />
                    )}
                  </section>
                ))}
              </div>
            </section>

            {error ? (
              <div
                className="rounded-md border border-[#efc9c9] bg-[#fff2f2] px-4 py-3 text-sm text-[#912f2f]"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            ) : null}

            <div className="flex flex-col items-center justify-center gap-4 pt-2 md:flex-row md:gap-16">
              <button
                type="submit"
                disabled={submitting || unansweredQuestions.length > 0}
                className="exam-primary-button min-w-[210px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting Exam..." : "Submit Qualifying Exam"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/manpower-services")}
                className="exam-secondary-button min-w-[210px]"
              >
                Back to Manpower Services
              </button>
            </div>
          </form>
        </div>
      </section>

      {showSubmitConfirm ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-5 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exam-submit-dialog-title"
            aria-describedby="exam-submit-dialog-description"
            className="w-full max-w-lg rounded-[26px] bg-white p-7 shadow-2xl"
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b1812f]">Final submission</p>
            <h2 id="exam-submit-dialog-title" className="mt-2 text-2xl font-black text-[#24352c]">Submit your qualifying exam?</h2>
            <p id="exam-submit-dialog-description" className="mt-3 text-sm leading-6 text-[#56695b]">You answered all {questions.length} questions. After submission, your answers cannot be changed.</p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setShowSubmitConfirm(false)} className="exam-secondary-button">Review Answers</button>
              <button type="button" onClick={performSubmitExam} disabled={submitting} className="exam-primary-button disabled:opacity-60">{submitting ? "Submitting..." : "Confirm Submission"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </ExamLayout>
  );
}

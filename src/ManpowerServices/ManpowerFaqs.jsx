import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
const MANPOWER_HOME_ROUTE = "/manpower-services";

const FAQS = [
  {
    question: "How can I apply for Manpower Services?",
    answer:
      "You can apply by going to the Apply Now page, completing the application form, and submitting all required information.",
  },
  {
    question: "What requirements do I need to submit?",
    answer:
      "Applicants are usually required to submit documents such as Birth Certificate, Form 137/138, Diploma or TOR, 2x2 picture, Barangay Clearance, NBI, SSS ID, Pag-Ibig ID, PhilHealth ID, and TIN.",
  },
  {
    question: "Where can I see the available job offers?",
    answer:
      "You can view all available job offers by opening the Job Offer page from the Manpower navigation menu.",
  },
  {
    question: "How will I know if my application is accepted?",
    answer:
      "You will be notified through the contact details you provided during your application. Make sure your email address and mobile number are correct.",
  },
  {
    question: "Can I update my submitted application?",
    answer:
      "If you need to update your submitted application, contact the Manpower office directly using the contact information provided on the Contact page.",
  },
  {
    question: "Do I need to create an account before applying?",
    answer:
      "You can start the application process from the public Apply Now page. If you are already an employee, you can sign in to access your employee profile and payroll information.",
  },
  {
    question: "Where is the Manpower office located?",
    answer:
      "The office is located at 2/F 5441 Currie Street, Palanan, Makati City.",
  },
  {
    question: "Who can I contact for more questions?",
    answer:
      "You may contact the office through ltc.tamsi@gmail.com, lorengladius@ltcmultiservices.com, or call +639516281271 / +639959808051.",
  },
];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Inter', sans-serif" };
const fontPoppins = { fontFamily: "'Inter', sans-serif" };

const RevealOnScroll = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);


function FloatingHomeIconButton({ onClick }) {
  return (
    <>
      <style>{`
        .ltc-floating-home-button {
          position: fixed;
          right: 20px;
          bottom: 88px;
          z-index: 10000;
          width: 56px;
          height: 56px;
          border: 1px solid rgba(255,255,255,.38);
          border-radius: 999px;
          background: #ffffff;
          color: #214f35;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 18px 42px rgba(0,0,0,.24);
          cursor: pointer;
          transition: transform .25s ease, background .25s ease, color .25s ease, box-shadow .25s ease;
        }

        .ltc-floating-home-button:hover,
        .ltc-floating-home-button:focus-visible {
          transform: translateY(-4px) scale(1.06);
          background: #214f35;
          color: #ffffff;
          box-shadow: 0 24px 55px rgba(0,0,0,.3);
          outline: none;
        }

        .ltc-floating-home-tooltip {
          position: absolute;
          right: 62px;
          top: 50%;
          transform: translateY(-50%) translateX(8px);
          padding: 7px 12px;
          border-radius: 999px;
          background: #102816;
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .04em;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          box-shadow: 0 12px 28px rgba(0,0,0,.24);
          transition: opacity .25s ease, transform .25s ease;
        }

        .ltc-floating-home-button:hover .ltc-floating-home-tooltip,
        .ltc-floating-home-button:focus-visible .ltc-floating-home-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        .ltc-floating-home-button img {
          width: 100%;
          height: 100%;
          border-radius: 999px;
          object-fit: cover;
        }

        @media (max-width: 640px) {
          .ltc-floating-home-button {
            right: 20px;
            bottom: 88px;
            width: 56px;
            height: 56px;
          }

          .ltc-floating-home-tooltip {
            right: 58px;
          }
        }
      `}</style>

      <button
        type="button"
        onClick={onClick}
        className="ltc-floating-home-button"
        title="Back to Home"
        aria-label="Back to Home"
      >
        <span className="ltc-floating-home-tooltip">LTC GROUP OF COMPANIES</span>
        <img src="/LTCLogo.webp" alt="" aria-hidden="true" width="160" height="113" decoding="async" />
      </button>
    </>
  );
}

export default function ManpowerFaqs() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <div className="mp-faq-page" style={fontPontano}>
      <style>{`
        .mp-faq-page {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
          --footer-green: #082719;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --dark: #101828;
          --muted: #667085;
          --glass: rgba(255,255,255,.78);
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

        .mp-faq-page * { box-sizing: border-box; }

        .mp-container {
          width: min(1180px, 92%);
          margin: auto;
        }

        .mp-header {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          background: var(--footer-green);
          border-bottom: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 10px 34px rgba(7,31,20,.14);
          margin: 0;
        }

        .mp-header .mp-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding-left: 32px;
          padding-right: 32px;
        }

        .mp-nav {
          min-height: 76px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .mp-logo {
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

        .mp-logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background: white;
          object-fit: cover;
          box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
        }

        .mp-logo h1 {
          font-size: 18px;
          line-height: 1;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -.04em;
          margin: 0;
        }

        .mp-logo p {
          font-size: 11px;
          color: rgba(255,255,255,.72);
          margin: 3px 0 0;
        }

        .mp-desktop-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mp-nav-link {
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
          text-decoration: none;
        }

        .mp-nav-link:hover,
        .mp-nav-link.active {
          color: white;
          background: rgba(255,255,255,.13);
          transform: translateY(-1px);
        }

        .mp-profile-button {
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 14px 28px rgba(215,168,77,.18);
        }

        .mp-menu-button {
          display: none;
          color: white;
          border: 0;
          background: rgba(255,255,255,.1);
          border-radius: 12px;
          padding: 10px;
          cursor: pointer;
        }

        .mp-menu-button svg {
          width: 24px;
          height: 24px;
        }

        .mp-sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(0,0,0,.42);
        }

        .mp-sidebar-panel {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: min(310px, 86vw);
          background: white;
          box-shadow: -20px 0 60px rgba(0,0,0,.25);
          padding: 20px;
        }

        .mp-sidebar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(16,24,40,.1);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .mp-sidebar-title {
          color: var(--green-950);
          font-weight: 900;
          letter-spacing: .14em;
          font-size: 12px;
          margin: 0;
        }

        .mp-sidebar-close {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 0;
          background: #f2f4f7;
          color: #101828;
          cursor: pointer;
        }

        .mp-sidebar-link {
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

        .mp-sidebar-link:hover,
        .mp-sidebar-link.active {
          background: var(--green-800);
          color: white;
        }

        .mp-hero {
          position: relative;
          overflow: hidden;
          color: white;
          isolation: isolate;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
          padding: 100px 0 96px;
        }

        .mp-hero-bg {
          position: absolute;
          inset: 0;
          z-index: -4;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 1;
        }

        .mp-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -3;
          background: linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.88) 42%, rgba(12,64,39,.76) 100%);
          opacity: .98;
        }

        .mp-hero::after {
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

        .mp-hero-content {
          position: relative;
          z-index: 2;
          max-width: 920px;
          margin: 0 auto;
          text-align: center;
        }

        .mp-hero h2 {
          margin: 0;
          color: white;
          font-size: clamp(36px, 5vw, 62px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.055em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .mp-hero h2 span { color: var(--gold-soft); }

        .mp-hero p {
          max-width: 760px;
          margin: 18px auto 0;
          color: rgba(255,255,255,.80);
          font-size: 17px;
          line-height: 1.8;
        }

        .mp-section { padding: 84px 0; }

        .mp-section-title {
          text-align: center;
          margin-bottom: 42px;
        }

        .mp-section-title span {
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .mp-section-title h3 {
          margin: 10px 0 0;
          color: var(--green-950);
          font-size: clamp(32px,4vw,50px);
          line-height: 1.08;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .mp-section-title p {
          max-width: 760px;
          margin: 15px auto 0;
          color: var(--muted);
        }

        .mp-faq-wrapper {
          max-width: 980px;
          margin: 0 auto;
        }

        .mp-faq-card {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(18px);
          padding: 34px;
          transition: .38s var(--ease);
        }

        .mp-faq-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          z-index: 3;
        }

        .mp-faq-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(215,168,77,.45);
        }

        .mp-faq-list {
          display: grid;
          gap: 14px;
        }

        .mp-faq-item {
          overflow: hidden;
          border-radius: 20px;
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(35,95,62,.10);
          box-shadow: 0 10px 24px rgba(8,39,25,.055);
          transition: .28s var(--ease);
        }

        .mp-faq-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 38px rgba(8,39,25,.10);
        }

        .mp-faq-question {
          width: 100%;
          min-height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border: 0;
          cursor: pointer;
          text-align: left;
          padding: 18px 22px;
          background: white;
          color: var(--green-950);
          transition: .25s var(--ease);
        }

        .mp-faq-question.active {
          color: white;
          background: linear-gradient(135deg, var(--green-800), var(--green-700));
        }

        .mp-faq-question:hover { background: rgba(35,95,62,.08); }
        .mp-faq-question.active:hover { background: linear-gradient(135deg, var(--green-800), var(--green-700)); }

        .mp-faq-question span:first-child {
          font-size: 15px;
          line-height: 1.35;
          font-weight: 900;
          letter-spacing: -.02em;
        }

        .mp-faq-icon {
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(35,95,62,.08);
          color: var(--green-800);
          font-size: 22px;
          font-weight: 900;
          line-height: 1;
          transition: .25s var(--ease);
        }

        .mp-faq-question.active .mp-faq-icon {
          background: rgba(255,255,255,.18);
          color: var(--gold-soft);
        }

        .mp-faq-answer {
          padding: 18px 22px 20px;
          color: var(--muted);
          background: rgba(255,255,255,.72);
          font-size: 14px;
          line-height: 1.8;
        }

        .mp-help-card {
          margin-top: 26px;
          position: relative;
          overflow: hidden;
          border-radius: var(--radius);
          background: linear-gradient(135deg, var(--green-900), var(--green-700));
          box-shadow: var(--shadow-md);
          padding: 30px;
          color: white;
        }

        .mp-help-card::after {
          content: "";
          position: absolute;
          inset: -40% -20% auto auto;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          background: rgba(244,212,132,.16);
          filter: blur(10px);
        }

        .mp-help-card-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
        }

        .mp-help-visual {
          width: 260px;
          min-height: 190px;
          align-self: stretch;
          flex: 0 0 260px;
          margin: -30px 4px -30px -30px;
          overflow: hidden;
        }

        .mp-help-visual {
          position: relative;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 28% 28%, rgba(244,212,132,.30), transparent 22%),
            radial-gradient(circle at 72% 66%, rgba(255,255,255,.14), transparent 30%),
            linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.02));
        }

        .mp-help-visual::before {
          content: "?";
          width: 96px;
          height: 96px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          color: var(--green-950);
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 18px 45px rgba(0,0,0,.22), 0 0 0 12px rgba(255,255,255,.08);
          font-family: "Montserrat", "Inter", Arial, sans-serif;
          font-size: 52px;
          font-weight: 900;
          line-height: 1;
        }

        .mp-help-visual::after {
          content: "SUPPORT";
          position: absolute;
          left: 50%;
          bottom: 24px;
          transform: translateX(-50%);
          color: rgba(255,255,255,.78);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .18em;
        }

        .mp-help-copy { flex: 1 1 auto; }

        .mp-help-card h4 {
          margin: 0;
          color: white;
          font-size: 24px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -.04em;
        }

        .mp-help-card p {
          margin: 8px 0 0;
          color: rgba(255,255,255,.74);
          font-size: 14px;
          line-height: 1.7;
        }

        .mp-help-button {
          flex: 0 0 auto;
          min-height: 48px;
          border: 0;
          border-radius: 999px;
          padding: 0 22px;
          cursor: pointer;
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.22);
          font-size: 13px;
          font-weight: 900;
          transition: .28s var(--ease);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .mp-help-button:hover { transform: translateY(-3px); }

        .mp-footer {
          width: 100%;
          background: var(--footer-green);
          color: white;
          padding: 30px 0 12px;
          margin: 0;
        }

        .mp-footer .mp-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding-left: 32px;
          padding-right: 32px;
        }

        .mp-footer-grid {
          width: 100%;
          display: grid;
          grid-template-columns: 1.2fr .8fr 1.2fr 1fr .8fr;
          gap: 22px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .mp-footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .mp-footer-brand img {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          object-fit: cover;
          background: white;
        }

        .mp-footer h4 {
          color: white;
          font-weight: 900;
          font-size: 20px;
          line-height: 1.2;
          margin: 0;
          text-transform: uppercase;
        }

        .mp-footer h5 {
          color: #f4d484;
          font-size: 12px;
          line-height: 1.2;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .14em;
          margin: 0 0 10px;
        }

        .mp-footer p,
        .mp-footer-link {
          display: block;
          color: rgba(255,255,255,.68);
          font-size: 13px;
          line-height: 1.55;
          margin: 5px 0;
        }

        .mp-footer-link {
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          text-align: left;
          text-decoration: none;
        }

        .mp-footer-link:hover {
          color: white;
          text-decoration: underline;
        }

        .mp-socials {
          display: flex;
          gap: 8px;
        }

        .mp-socials span {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: rgba(255,255,255,.13);
        }

        .mp-copyright {
          width: 100%;
          padding-top: 14px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: rgba(255,255,255,.52);
          font-size: 12px;
          line-height: 1.4;
        }

        @media (max-width: 1100px) {
          .mp-footer-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 900px) {
          .mp-header .mp-container { padding-left: 22px; padding-right: 22px; }
          .mp-nav { min-height: auto; padding: 18px 0; }
          .mp-desktop-nav { display: none; }
          .mp-menu-button { display: grid; place-items: center; }
          .mp-footer { padding: 28px 0 12px; }
          .mp-footer-grid { gap: 18px; padding-bottom: 22px; }
          .mp-footer .mp-container { padding-left: 22px; padding-right: 22px; }
          .mp-copyright { flex-direction: column; }
          .mp-help-card-content { flex-wrap: wrap; align-items: center; }
          .mp-help-visual {
            width: 220px;
            min-height: 180px;
            flex-basis: 220px;
          }
          .mp-help-copy { min-width: 260px; }
        }

        @media (max-width: 600px) {
          .mp-header .mp-container,
          .mp-footer .mp-container { padding-left: 16px; padding-right: 16px; }
          .mp-logo h1 { font-size: 14px; }
          .mp-logo p { font-size: 10px; }
          .mp-hero { padding: 76px 0 74px; }
          .mp-hero h2 { font-size: clamp(34px, 11vw, 46px); letter-spacing: -.045em; }
          .mp-hero p { font-size: 15px; }
          .mp-section { padding: 64px 0; }
          .mp-faq-card { padding: 24px 18px; }
          .mp-faq-question { min-height: 62px; padding: 16px; }
          .mp-faq-answer { padding: 16px; }
          .mp-help-card { padding: 0 24px 24px; }
          .mp-help-card-content {
            flex-direction: column;
            align-items: stretch;
            gap: 22px;
          }
          .mp-help-visual {
            width: calc(100% + 48px);
            min-height: 210px;
            flex-basis: 210px;
            margin: 0 -24px;
          }
          .mp-help-copy { min-width: 0; }
          .mp-help-button { width: 100%; }
        }


        /* ===== Unified LTC Manpower public-page design ===== */
        .mp-about-style,
        .mp-contact-page,
        .mp-faq-page {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
          --green-600: #2f754c;
          --footer-green: #082719;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --white: #ffffff;
          --dark: #101828;
          --muted: #667085;
          --glass: rgba(255,255,255,.86);
          --shadow-sm: 0 10px 28px rgba(8,39,25,.08);
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
          font-family: "Inter", Arial, sans-serif !important;
          line-height: 1.65;
          letter-spacing: -.01em;
          overflow-x: hidden;
        }

        .mp-about-style *,
        .mp-contact-page *,
        .mp-faq-page * { box-sizing: border-box; }

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
        .mp-faq-page h5 {
          font-family: "Montserrat", "Inter", Arial, sans-serif !important;
        }

        .mp-container { width: min(1180px, 92%); margin-inline: auto; }

        .mp-header {
          position: sticky !important;
          top: 0;
          z-index: 50;
          width: 100%;
          margin: 0 !important;
          background: rgba(8,39,25,.97) !important;
          border-bottom: 1px solid rgba(255,255,255,.10) !important;
          box-shadow: 0 10px 34px rgba(7,31,20,.18) !important;
          backdrop-filter: blur(16px);
        }

        .mp-header .mp-container {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding-inline: 32px !important;
        }

        .mp-nav {
          min-height: 76px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 24px !important;
        }

        .mp-logo,
        .mp-footer-brand {
          display: flex !important;
          align-items: center !important;
          gap: 13px !important;
          border: 0 !important;
          background: transparent !important;
          color: #fff !important;
          padding: 0 !important;
          text-align: left !important;
          text-decoration: none !important;
          cursor: pointer;
        }

        .mp-logo-icon,
        .mp-footer-brand img {
          width: 42px !important;
          height: 42px !important;
          flex: 0 0 42px;
          border-radius: 50% !important;
          object-fit: cover !important;
          background: linear-gradient(145deg,#fff,#e3f4ea) !important;
          box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.14) !important;
        }

        .mp-logo h1 {
          margin: 0 !important;
          color: #fff !important;
          font-size: 18px !important;
          line-height: 1 !important;
          font-weight: 900 !important;
          letter-spacing: -.04em !important;
          text-transform: uppercase !important;
        }

        .mp-logo p {
          margin: 4px 0 0 !important;
          color: rgba(255,255,255,.70) !important;
          font-size: 11px !important;
          line-height: 1.35 !important;
        }

        .mp-desktop-nav { display: flex !important; align-items: center !important; gap: 8px !important; }

        .mp-nav-link {
          appearance: none;
          border: 0 !important;
          color: rgba(255,255,255,.78) !important;
          background: transparent !important;
          padding: 10px 14px !important;
          border-radius: 999px !important;
          font-family: "Inter", Arial, sans-serif !important;
          font-size: 12px !important;
          font-weight: 800 !important;
          letter-spacing: .08em !important;
          line-height: 1.2 !important;
          text-transform: uppercase !important;
          text-decoration: none !important;
          white-space: nowrap;
          cursor: pointer;
          transition: color .25s var(--ease), background .25s var(--ease), transform .25s var(--ease) !important;
        }

        .mp-nav-link:hover,
        .mp-nav-link.active {
          color: #fff !important;
          background: rgba(255,255,255,.13) !important;
          transform: translateY(-1px);
        }

        .mp-sign-in,
        .mp-profile-button {
          color: #102418 !important;
          background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
          box-shadow: 0 16px 35px rgba(215,168,77,.22) !important;
        }

        .mp-sign-in:hover,
        .mp-profile-button:hover {
          color: #102418 !important;
          background: linear-gradient(135deg,#f8dc8c,#d7a84d) !important;
        }

        .mp-menu-button {
          display: none;
          width: 44px;
          height: 44px;
          place-items: center;
          padding: 0 !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          border-radius: 14px !important;
          color: #fff !important;
          background: rgba(255,255,255,.10) !important;
          cursor: pointer;
        }
        .mp-menu-button svg { width: 24px; height: 24px; }

        .mp-sidebar-overlay {
          position: fixed !important;
          inset: 0 !important;
          z-index: 80 !important;
          background: rgba(0,0,0,.48) !important;
          backdrop-filter: blur(5px);
        }

        .mp-sidebar-panel {
          position: absolute !important;
          top: 0 !important;
          right: 0 !important;
          width: min(320px, 88vw) !important;
          height: 100% !important;
          padding: 22px !important;
          border-left: 1px solid rgba(35,95,62,.10);
          background: #fff !important;
          box-shadow: -24px 0 70px rgba(0,0,0,.28) !important;
        }

        .mp-sidebar-top {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin-bottom: 16px !important;
          padding-bottom: 16px !important;
          border-bottom: 1px solid rgba(16,24,40,.10) !important;
        }

        .mp-sidebar-title {
          margin: 0 !important;
          color: var(--green-950) !important;
          font-size: 12px !important;
          font-weight: 900 !important;
          letter-spacing: .14em !important;
        }

        .mp-sidebar-close {
          width: 44px !important;
          height: 44px !important;
          border: 0 !important;
          border-radius: 13px !important;
          color: #101828 !important;
          background: #f2f4f7 !important;
          cursor: pointer;
        }

        .mp-sidebar-link {
          display: block !important;
          width: 100% !important;
          margin: 0 0 8px !important;
          padding: 13px 14px !important;
          border: 0 !important;
          border-radius: 14px !important;
          color: #101828 !important;
          background: transparent !important;
          font-family: "Inter", Arial, sans-serif !important;
          font-size: 13px !important;
          font-weight: 800 !important;
          text-align: left !important;
          text-transform: uppercase;
          cursor: pointer;
        }

        .mp-sidebar-link:hover,
        .mp-sidebar-link.active { color: #fff !important; background: var(--green-800) !important; }

        .mp-hero,
        .mp-contact-hero {
          position: relative !important;
          min-height: 520px !important;
          display: flex !important;
          align-items: center !important;
          overflow: hidden !important;
          isolation: isolate;
          color: #fff !important;
          background-color: #082719 !important;
        }

        .mp-contact-hero {
          background:
            linear-gradient(120deg, rgba(2,18,11,.95) 0%, rgba(5,37,23,.88) 44%, rgba(12,64,39,.72) 100%),
            var(--hero-image) center center / cover no-repeat !important;
        }

        .mp-hero-content,
        .mp-contact-hero-content {
          position: relative;
          z-index: 2;
          width: min(960px, 100%);
          padding-block: 88px 100px !important;
        }

        .mp-hero h2,
        .mp-contact-hero h2 {
          max-width: 940px;
          margin: 12px 0 0 !important;
          color: #fff !important;
          font-size: clamp(42px, 6vw, 76px) !important;
          font-weight: 900 !important;
          line-height: .98 !important;
          letter-spacing: -.065em !important;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .mp-hero p,
        .mp-contact-hero p {
          max-width: 700px;
          margin-top: 24px !important;
          color: rgba(255,255,255,.80) !important;
          font-size: 18px !important;
          line-height: 1.8 !important;
        }

        .mp-eyebrow,
        .eyebrow {
          color: var(--gold-soft) !important;
          font-family: "Inter", Arial, sans-serif !important;
          font-size: 12px !important;
          font-weight: 900 !important;
          letter-spacing: .18em !important;
          text-transform: uppercase !important;
        }

        .mp-btn,
        .mp-submit-button,
        .mp-map-button,
        .mp-help-button {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 50px !important;
          padding: 0 24px !important;
          border-radius: 999px !important;
          font-family: "Inter", Arial, sans-serif !important;
          font-size: 13px !important;
          font-weight: 900 !important;
          letter-spacing: .04em;
          text-decoration: none !important;
          cursor: pointer;
          transition: transform .28s var(--ease), box-shadow .28s var(--ease), filter .28s var(--ease) !important;
        }

        .mp-btn-primary,
        .mp-submit-button,
        .mp-help-button {
          border: 0 !important;
          color: #102418 !important;
          background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
          box-shadow: 0 16px 35px rgba(215,168,77,.26) !important;
        }

        .mp-btn-outline,
        .mp-map-button {
          color: var(--green-950) !important;
          background: #fff !important;
          border: 1px solid rgba(35,95,62,.16) !important;
          box-shadow: var(--shadow-sm) !important;
        }

        .mp-btn:hover,
        .mp-submit-button:hover,
        .mp-map-button:hover,
        .mp-help-button:hover { transform: translateY(-3px) !important; }

        .mp-section { padding-block: 84px !important; }

        .mp-section-title { margin-bottom: 36px !important; text-align: center !important; }
        .mp-section-title span {
          color: var(--green-700) !important;
          font-size: 12px !important;
          font-weight: 900 !important;
          letter-spacing: .18em !important;
          text-transform: uppercase !important;
        }
        .mp-section-title h2,
        .mp-section-title h3 {
          margin: 10px 0 0 !important;
          color: var(--green-950) !important;
          font-size: clamp(32px,4vw,50px) !important;
          line-height: 1.08 !important;
          letter-spacing: -.055em !important;
          font-weight: 900 !important;
        }
        .mp-section-title p { max-width: 720px; margin: 15px auto 0 !important; color: var(--muted) !important; }

        .mp-search-panel,
        .mp-requirement-panel,
        .mp-contact-card,
        .mp-map-card,
        .mp-faq-card {
          border: 1px solid rgba(255,255,255,.82) !important;
          border-radius: 30px !important;
          background: var(--glass) !important;
          box-shadow: var(--shadow-md) !important;
          backdrop-filter: blur(18px);
        }

        .mp-summary-card,
        .mp-requirement-card,
        .mp-job-card,
        .mp-faq-item {
          border: 1px solid rgba(35,95,62,.12) !important;
          border-radius: 22px !important;
          background: rgba(255,255,255,.94) !important;
          box-shadow: var(--shadow-sm) !important;
          transition: transform .28s var(--ease), box-shadow .28s var(--ease), border-color .28s var(--ease) !important;
        }

        .mp-summary-card:hover,
        .mp-requirement-card:hover,
        .mp-job-card:hover {
          transform: translateY(-6px) !important;
          border-color: rgba(215,168,77,.42) !important;
          box-shadow: var(--shadow-md) !important;
        }

        .mp-contact-page input,
        .mp-contact-page select,
        .mp-contact-page textarea {
          width: 100%;
          min-height: 54px;
          padding: 0 17px !important;
          border: 1px solid rgba(35,95,62,.18) !important;
          border-radius: 16px !important;
          color: var(--green-950) !important;
          background: #fff !important;
          font-family: "Inter", Arial, sans-serif !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          outline: none !important;
          box-shadow: 0 8px 20px rgba(8,39,25,.04) !important;
        }
        .mp-contact-page textarea { min-height: 130px; padding-top: 14px !important; resize: vertical; }
        .mp-contact-page input:focus,
        .mp-contact-page select:focus,
        .mp-contact-page textarea:focus {
          border-color: rgba(215,168,77,.78) !important;
          box-shadow: 0 0 0 4px rgba(215,168,77,.14) !important;
        }

        .mp-footer {
          width: 100% !important;
          margin: 0 !important;
          padding: 30px 0 12px !important;
          color: #fff !important;
          background: var(--footer-green) !important;
        }

        .mp-footer .mp-container {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding-inline: 32px !important;
        }

        .mp-footer-grid {
          width: 100%;
          display: grid !important;
          grid-template-columns: 1.5fr .9fr 1fr 1.4fr .8fr !important;
          gap: 22px !important;
          padding-bottom: 24px !important;
          border-bottom: 1px solid rgba(255,255,255,.10) !important;
        }

        .mp-footer h4 { margin: 0 0 10px !important; color: #fff !important; font-size: 18px !important; font-weight: 900 !important; }
        .mp-footer h5 {
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
        .mp-footer-link {
          display: block;
          margin: 5px 0 !important;
          color: rgba(255,255,255,.68) !important;
          font-size: 13px !important;
          line-height: 1.55 !important;
          text-decoration: none !important;
        }
        .mp-footer a:hover,
        .mp-footer-link:hover { color: #fff !important; text-decoration: underline !important; }

        .mp-copyright {
          width: 100%;
          display: flex !important;
          justify-content: space-between !important;
          gap: 12px !important;
          padding-top: 14px !important;
          color: rgba(255,255,255,.52) !important;
          font-size: 12px !important;
          line-height: 1.4 !important;
        }

        @media (max-width: 1100px) {
          .mp-footer-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
        }

        @media (max-width: 900px) {
          .mp-header .mp-container,
          .mp-footer .mp-container { padding-inline: 22px !important; }
          .mp-nav { min-height: 72px !important; }
          .mp-desktop-nav { display: none !important; }
          .mp-menu-button { display: grid !important; }
          .mp-hero,
          .mp-contact-hero { min-height: 500px !important; }
          .mp-footer-grid { grid-template-columns: 1fr !important; gap: 18px !important; }
          .mp-copyright { flex-direction: column !important; }
        }

        @media (max-width: 600px) {
          .mp-header .mp-container,
          .mp-footer .mp-container { padding-inline: 16px !important; }
          .mp-logo h1 { font-size: 14px !important; }
          .mp-logo p { display: none !important; }
          .mp-hero h2,
          .mp-contact-hero h2 { font-size: clamp(38px,12vw,54px) !important; letter-spacing: -.045em !important; }
          .mp-hero p,
          .mp-contact-hero p { font-size: 16px !important; }
          .mp-section { padding-block: 62px !important; }
          .mp-btn,
          .mp-submit-button,
          .mp-map-button,
          .mp-help-button { width: 100%; }
          .mp-footer-grid { padding-bottom: 20px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mp-faq-page *,
          .mp-faq-page *::before,
          .mp-faq-page *::after {
            scroll-behavior: auto !important;
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }

      `}</style>
      <style>{MANPOWER_PUBLIC_THEME}</style>

      <Header openMenu={() => setMobileOpen(true)} />

      <main>
        <section className="mp-hero">
          <img
            src={HERO_IMAGE}
            alt=""
            aria-hidden="true"
            className="mp-hero-bg"
            width="1672"
            height="941"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="mp-container mp-hero-content">
            <h2 style={fontMontserrat}>
              Frequently Asked <span>Questions</span>
            </h2>

            <p style={fontPontano}>
              Find answers to common questions about applications, job offers, requirements, and employee access.
            </p>
          </div>
        </section>

        <section className="mp-section">
          <div className="mp-container">
            <RevealOnScroll className="mp-section-title">
              <span style={fontPoppins}>FAQs</span>
              <h3 style={fontMontserrat}>How can we help you?</h3>
              <p style={fontPontano}>Select a question below to view the answer.</p>
            </RevealOnScroll>

            <div className="mp-faq-wrapper">
              <RevealOnScroll className="mp-faq-card">
                <div className="mp-faq-list">
                  {FAQS.map((item, index) => {
                    const isActive = openIndex === index;

                    return (
                      <article key={item.question} className="mp-faq-item">
                        <button
                          type="button"
                          id={`faq-question-${index}`}
                          aria-expanded={isActive}
                          aria-controls={`faq-answer-${index}`}
                          onClick={() => setOpenIndex(isActive ? -1 : index)}
                          className={`mp-faq-question ${isActive ? "active" : ""}`}
                        >
                          <span style={fontMontserrat}>{item.question}</span>
                          <span className="mp-faq-icon">{isActive ? "−" : "+"}</span>
                        </button>

                        {isActive ? (
                          <div
                            id={`faq-answer-${index}`}
                            role="region"
                            aria-labelledby={`faq-question-${index}`}
                            className="mp-faq-answer"
                            style={fontPontano}
                          >
                            {item.answer}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </RevealOnScroll>

              <RevealOnScroll className="mp-help-card" delay={80}>
                <div className="mp-help-card-content">
                  <div className="mp-help-visual" aria-hidden="true" />

                  <div className="mp-help-copy">
                    <h4 style={fontMontserrat}>Still need assistance?</h4>
                    <p style={fontPontano}>
                      Contact our manpower office for applications, job offer questions, and requirement concerns.
                    </p>
                  </div>

                  <Link to="/manpower-contact" className="mp-help-button" style={fontMontserrat}>
                    Contact Us
                  </Link>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <FloatingHomeIconButton onClick={() => navigate("/")} />

      {mobileOpen ? <MobileMenu onClose={() => setMobileOpen(false)} /> : null}
    </div>
  );
}

function Header({ openMenu }) {
  return (
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
          <Link to={MANPOWER_HOME_ROUTE} className="mp-nav-link">Home</Link>
          <Link to="/manpower-positions" className="mp-nav-link">Job Offer</Link>
          <Link to="/manpower-requirements" className="mp-nav-link">Requirements</Link>
          <Link to="/manpower-contact" className="mp-nav-link">Contact</Link>
          <Link to="/manpower-faqs" className="mp-nav-link active" aria-current="page">FAQs</Link>
          <Link to="/manpower-employee-login" className="mp-nav-link mp-sign-in">Sign In</Link>
        </nav>

        <button onClick={openMenu} type="button" aria-label="Open menu" className="mp-menu-button">
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

function Footer() {
  return (
    <footer className="mp-footer">
      <div className="mp-container mp-footer-grid">
        <div>
          <Link to={MANPOWER_HOME_ROUTE} className="mp-logo">
            <img src={LOGO_IMAGE} alt="Manpower Logo" className="mp-logo-icon" width="156" height="132" loading="lazy" decoding="async" />
            <div>
              <h4 style={fontMontserrat}>LTC Manpower</h4>
              <p style={fontPontano}>Professional staffing and workforce support solutions.</p>
            </div>
          </Link>
        </div>

        <FooterColumn title="Menu">
          <Link to={MANPOWER_HOME_ROUTE}>Home</Link>
          <Link to="/manpower-positions">Job Offer</Link>
          <Link to="/manpower-requirements">Requirements</Link>
          <Link to="/manpower-employee-login">Profile</Link>
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <p><a href="mailto:ltc.tamsi@gmail.com">ltc.tamsi@gmail.com</a></p>
          <p><a href="mailto:lorengladius@ltcmultiservices.com">lorengladius@ltcmultiservices.com</a></p>
          <p><a href="tel:+639516281271">+639516281271</a></p>
          <p><a href="tel:+639959808051">+639959808051</a></p>
        </FooterColumn>

        <FooterColumn title="Address">
          <p>2/F 5441 Currie Street,</p>
          <p>Palanan, Makati City</p>
        </FooterColumn>

        <FooterColumn title="Follow Us">
          <p><a href={"https://www.facebook.com/profile.php?id=61571746334920&rdid=3bcMsbFVo3PBobtd&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1D1g1d614L#"} target="_blank" rel="noopener noreferrer">Facebook</a></p>
          <p><a href="mailto:lorengladius@ltcmultiservices.com">Email</a></p>
        </FooterColumn>
      </div>

      <div className="mp-container mp-copyright">
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
      <div className="mp-footer-list" style={fontPontano}>
        {children}
      </div>
    </div>
  );
}

function MobileMenu({ onClose }) {
  return (
    <div className="mp-sidebar-overlay">
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <aside className="mp-sidebar-panel" role="dialog" aria-modal="true" aria-label="Manpower navigation menu">
        <div className="mp-sidebar-top">
          <p className="mp-sidebar-title" style={fontPoppins}>MENU</p>
          <button onClick={onClose} className="mp-sidebar-close" aria-label="Close menu" type="button">
            ✕
          </button>
        </div>

        <Link to={MANPOWER_HOME_ROUTE} className="mp-sidebar-link" onClick={onClose}>Home</Link>
        <Link to="/manpower-positions" className="mp-sidebar-link" onClick={onClose}>Job Offer</Link>
        <Link to="/manpower-requirements" className="mp-sidebar-link" onClick={onClose}>Requirements</Link>
        <Link to="/manpower-contact" className="mp-sidebar-link" onClick={onClose}>Contact</Link>
        <Link to="/manpower-faqs" className="mp-sidebar-link active" onClick={onClose} aria-current="page">FAQs</Link>
        <Link to="/manpower-employee-login" className="mp-sidebar-link" onClick={onClose}>Sign In</Link>
      </aside>
    </div>
  );
}

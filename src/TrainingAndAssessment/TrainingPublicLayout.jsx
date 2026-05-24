// src/TrainingAndAssessment/TrainingPublicLayout.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export const TRAINING_CONTACT_INFO = {
  addressLine1: "2/F 5441 Curie Street,",
  addressLine2: "Palanan, Makati City",
  addressFull: "2/F 5441 Curie Street, Palanan, Makati City",
  phone: "09959808051 / 09516281271",
  email1: "ltc.tamsi@gmail.com",
  email2: "lorengladis@ltcmultiservices.com",
  hours: "Monday - Thursday 8:00 AM - 5:00 PM",
};

const TRAINING_MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  TRAINING_CONTACT_INFO.addressFull
)}&output=embed`;

const NAV_ITEMS = [
  { key: "home", label: "Home", path: "/training" },
  { key: "course", label: "Course", path: "/training-course" },
  { key: "requirements", label: "Requirements", path: "/training-requirements" },
  { key: "contact", label: "Contact", path: "/training-contact-us" },
  { key: "faqs", label: "FAQs", path: "/training-faqs" },
];

const layoutStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@600;700;800;900&display=swap");

  .ltc-training-layout {
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

  .ltc-training-layout * { box-sizing: border-box; }

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
    font-family: "Montserrat", sans-serif;
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
    white-space: nowrap;
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
    padding: 10px 14px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-mobile-panel {
    display: none;
    border-top: 1px solid rgba(255,255,255,.1);
    background: #0a2b1c;
    padding: 12px 20px 18px;
  }

  .ltc-mobile-card {
    display: grid;
    gap: 8px;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 20px;
    background: rgba(255,255,255,.06);
    padding: 10px;
  }

  .ltc-mobile-link {
    width: 100%;
    border: 0;
    border-radius: 14px;
    background: transparent;
    color: rgba(255,255,255,.82);
    padding: 12px 14px;
    text-align: left;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: .04em;
    text-transform: uppercase;
    cursor: pointer;
    transition: .25s var(--ease);
  }

  .ltc-mobile-link:hover,
  .ltc-mobile-link.active {
    color: white;
    background: rgba(255,255,255,.12);
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
    opacity: .38;
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
    max-width: 920px;
    margin: 0 auto;
    text-align: center;
  }

  .ltc-kicker {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    border: 1px solid rgba(244,212,132,.36);
    border-radius: 999px;
    background: rgba(255,255,255,.08);
    color: var(--gold-soft);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .16em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }

  .ltc-kicker::before,
  .ltc-kicker::after {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--gold-soft);
  }

  .ltc-hero h2 {
    font-family: "Montserrat", sans-serif;
    font-size: clamp(40px, 7vw, 82px);
    line-height: .96;
    font-weight: 900;
    letter-spacing: -.06em;
    margin: 0;
    text-shadow: 0 24px 60px rgba(0,0,0,.24);
  }

  .ltc-hero p {
    max-width: 720px;
    margin: 20px auto 0;
    color: rgba(255,255,255,.82);
    font-size: clamp(15px, 1.9vw, 18px);
    font-weight: 600;
  }

  .ltc-title-section {
    position: relative;
    overflow: hidden;
    padding: 54px 0 42px;
    background: linear-gradient(180deg,#ffffff 0%,#f4faf6 100%);
  }

  .ltc-title-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(8,39,25,.1);
    border-radius: 30px;
    background: rgba(255,255,255,.86);
    box-shadow: var(--shadow-md);
    padding: clamp(28px, 4vw, 46px);
    text-align: center;
  }

  .ltc-title-card::before,
  .ltc-title-card::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    background: rgba(215,168,77,.18);
    pointer-events: none;
  }

  .ltc-title-card::before {
    width: 130px;
    height: 130px;
    left: -42px;
    top: -46px;
  }

  .ltc-title-card::after {
    width: 160px;
    height: 160px;
    right: -54px;
    bottom: -70px;
  }

  .ltc-title-card h2 {
    position: relative;
    z-index: 2;
    color: var(--green-900);
    font-family: "Montserrat", sans-serif;
    font-size: clamp(30px, 4vw, 52px);
    line-height: 1.05;
    font-weight: 900;
    letter-spacing: -.05em;
    margin: 0;
  }

  .ltc-title-line {
    position: relative;
    z-index: 2;
    width: min(520px, 75%);
    height: 4px;
    border-radius: 999px;
    margin: 18px auto 0;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
  }

  .ltc-title-card p {
    position: relative;
    z-index: 2;
    max-width: 760px;
    margin: 18px auto 0;
    color: var(--muted);
    font-size: 15px;
    font-weight: 700;
  }

  .ltc-content-wrap {
    position: relative;
    padding: 18px 0 62px;
  }

  .ltc-content-wrap > .ltc-container > * {
    animation: ltcFadeUp .65s var(--ease) both;
  }



  .ltc-section {
    position: relative;
    padding: 64px 0;
  }

  .ltc-contact-section {
    padding-top: 18px;
  }

  .ltc-section-title {
    margin: 0 auto 34px;
    text-align: center;
    max-width: 820px;
  }

  .ltc-section-title > span {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(215,168,77,.14);
    color: var(--green-800);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .13em;
    text-transform: uppercase;
  }

  .ltc-section-title > span::before,
  .ltc-section-title > span::after {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--gold);
  }

  .ltc-section-title h3 {
    margin: 14px 0 0;
    color: var(--green-950);
    font-family: "Montserrat", sans-serif;
    font-size: clamp(32px,4vw,50px);
    line-height: 1.08;
    letter-spacing: -.055em;
    font-weight: 900;
  }

  .ltc-section-title p {
    max-width: 760px;
    margin: 15px auto 0;
    color: var(--muted);
    font-size: 15px;
    font-weight: 600;
  }

  .ltc-contact-layout {
    display: grid;
    grid-template-columns: .92fr 1.08fr;
    gap: 28px;
    align-items: stretch;
  }

  .ltc-contact-card,
  .ltc-message-card,
  .ltc-map-card {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius);
    background: var(--glass);
    border: 1px solid rgba(255,255,255,.76);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
    transition: .38s var(--ease);
  }

  .ltc-contact-card::before,
  .ltc-message-card::before,
  .ltc-map-card::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 6px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
    z-index: 3;
  }

  .ltc-contact-card:hover,
  .ltc-message-card:hover,
  .ltc-map-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
    border-color: rgba(215,168,77,.45);
  }

  .ltc-contact-card,
  .ltc-message-card {
    min-height: 540px;
    padding: 34px;
  }

  .ltc-card-heading {
    margin: 0;
    color: var(--green-950);
    font-family: "Montserrat", sans-serif;
    font-size: clamp(28px, 4vw, 42px);
    line-height: 1.08;
    letter-spacing: -.055em;
    font-weight: 900;
  }

  .ltc-card-heading span {
    color: var(--gold);
  }

  .ltc-card-subtext {
    margin: 14px 0 0;
    color: var(--muted);
    font-size: 15px;
    line-height: 1.8;
    font-weight: 600;
  }

  .ltc-contact-list {
    margin-top: 26px;
    display: grid;
    gap: 16px;
  }

  .ltc-contact-row {
    display: grid;
    grid-template-columns: 46px minmax(0, 1fr);
    gap: 14px;
    align-items: start;
    padding: 16px;
    border-radius: 20px;
    background: rgba(35,95,62,.07);
    border: 1px solid rgba(35,95,62,.08);
    transition: .25s var(--ease);
  }

  .ltc-contact-row:hover {
    transform: translateX(4px);
    background: rgba(35,95,62,.1);
  }

  .ltc-contact-icon {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    background: rgba(255,255,255,.86);
    color: var(--green-800);
    display: grid;
    place-items: center;
    box-shadow: 0 10px 24px rgba(8,39,25,.08);
  }

  .ltc-contact-icon svg {
    width: 22px;
    height: 22px;
  }

  .ltc-contact-row h4 {
    margin: 0;
    color: var(--green-950);
    font-family: "Montserrat", sans-serif;
    font-size: 14px;
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: -.02em;
  }

  .ltc-contact-row p {
    margin: 5px 0 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.55;
    font-weight: 600;
  }

  .ltc-message-form {
    margin-top: 26px;
    display: grid;
    gap: 14px;
  }

  .ltc-field {
    display: grid;
    gap: 7px;
  }

  .ltc-field span {
    color: var(--green-950);
    font-family: "Montserrat", sans-serif;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .08em;
  }

  .ltc-input,
  .ltc-textarea {
    width: 100%;
    border: 1px solid rgba(35,95,62,.16);
    background: rgba(255,255,255,.82);
    color: var(--dark);
    outline: none;
    font-size: 14px;
    font-family: inherit;
    transition: .25s var(--ease);
    box-shadow: 0 10px 24px rgba(8,39,25,.05);
  }

  .ltc-input {
    height: 52px;
    border-radius: 999px;
    padding: 0 18px;
  }

  .ltc-textarea {
    min-height: 132px;
    resize: none;
    border-radius: 20px;
    padding: 14px 18px;
    line-height: 1.6;
  }

  .ltc-input:focus,
  .ltc-textarea:focus {
    border-color: var(--green-700);
    background: white;
    box-shadow: 0 0 0 4px rgba(35,95,62,.1);
  }

  .ltc-submit-button {
    margin-top: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 52px;
    width: 100%;
    border-radius: 999px;
    border: 0;
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 16px 35px rgba(215,168,77,.28);
    font-size: 14px;
    font-family: "Montserrat", sans-serif;
    font-weight: 900;
    cursor: pointer;
    transition: .28s var(--ease);
  }

  .ltc-submit-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(215,168,77,.34);
  }

  .ltc-map-section {
    padding: 0 0 20px;
  }

  .ltc-map-card {
    padding: 14px;
  }

  .ltc-map-frame {
    width: 100%;
    height: 460px;
    border: 0;
    display: block;
    border-radius: 20px;
    background: #e4e7ec;
  }

  .ltc-footer {
    background: var(--footer-green);
    color: rgba(255,255,255,.75);
    padding: 34px 0 18px;
    border-top: 1px solid rgba(255,255,255,.08);
  }

  .ltc-footer-grid {
    display: grid;
    grid-template-columns: 1.05fr 1.05fr 1.35fr 1fr .75fr;
    gap: 28px;
    align-items: start;
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
    background: white;
    object-fit: contain;
  }

  .ltc-footer-brand h3,
  .ltc-footer h4 {
    color: white;
    margin: 0;
    font-family: "Montserrat", sans-serif;
    font-weight: 900;
  }

  .ltc-footer-brand h3 {
    font-size: 22px;
    letter-spacing: -.04em;
  }

  .ltc-footer h4 {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .ltc-footer p {
    margin: 3px 0;
    font-size: 12px;
    line-height: 1.45;
  }

  .ltc-footer-links {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px 16px;
  }

  .ltc-footer-button {
    width: fit-content;
    border: 0;
    background: transparent;
    color: rgba(255,255,255,.7);
    padding: 0;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: .25s var(--ease);
  }

  .ltc-footer-button:hover {
    color: var(--gold-soft);
    transform: translateX(2px);
  }

  .ltc-footer-bottom {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    margin-top: 28px;
    border-top: 1px solid rgba(255,255,255,.1);
    padding-top: 16px;
    color: rgba(255,255,255,.55);
    font-size: 11px;
    font-weight: 700;
  }

  .ltc-paper-icon {
    color: #8a936e;
    flex-shrink: 0;
  }

  @keyframes ltcFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 1050px) {
    .ltc-desktop-nav { display: none; }
    .ltc-menu-button { display: inline-flex; }
    .ltc-mobile-panel.is-open { display: block; }
    .ltc-header .ltc-container { padding-left: 20px; padding-right: 20px; }
    .ltc-footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ltc-contact-layout { grid-template-columns: 1fr; }
    .ltc-contact-card, .ltc-message-card { min-height: auto; }
  }

  @media (max-width: 700px) {
    .ltc-nav { min-height: 68px; }
    .ltc-logo h1 { font-size: 16px; }
    .ltc-logo p { display: none; }
    .ltc-logo-icon { width: 38px; height: 38px; }
    .ltc-hero { padding: 68px 0 64px; }
    .ltc-title-section { padding: 34px 0 26px; }
    .ltc-content-wrap { padding: 14px 0 42px; }
    .ltc-section { padding: 44px 0; }
    .ltc-section-title { margin-bottom: 24px; }
    .ltc-contact-card, .ltc-message-card { padding: 24px; }
    .ltc-contact-row { grid-template-columns: 42px minmax(0, 1fr); padding: 14px; }
    .ltc-contact-icon { width: 42px; height: 42px; border-radius: 14px; }
    .ltc-map-frame { height: 340px; }
    .ltc-footer-grid { grid-template-columns: 1fr; gap: 20px; }
    .ltc-footer-bottom { flex-direction: column; }
  }
`;

function getProfilePath() {
  const token = localStorage.getItem("trainingToken");
  return token ? "/trainee-profile" : "/trainee-login";
}


function RevealOnScroll({ children, className = "", delay = 0, y = 18 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0px)" : `translateY(${y}px)`,
        transition: "opacity 650ms ease, transform 650ms ease",
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

export function TrainingPublicShell({
  active = "home",
  title = "Training & Assessment",
  subtitle = "Begin your journey with TAMSI today",
  children,
  showHero = true,
  showTitle = true,
}) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <div className="ltc-training-layout">
      <style>{layoutStyles}</style>

      <TrainingPublicHeader
        active={active}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        goTo={goTo}
      />

      <main>
        {showHero ? <TrainingHero /> : null}

        {showTitle && active !== "contact" ? (
          <TrainingPageTitle title={title} subtitle={subtitle} />
        ) : null}

        <section className="ltc-content-wrap">
          <div className="ltc-container">
            {active === "contact" ? (
              <TrainingContactContent />
            ) : typeof children === "function" ? (
              children({ goTo })
            ) : (
              children
            )}
          </div>
        </section>
      </main>

      <TrainingPublicFooter goTo={goTo} />
    </div>
  );
}

export function TrainingPublicHeader({
  active,
  mobileOpen,
  setMobileOpen,
  goTo,
}) {
  const profilePath = getProfilePath();
  const profileLabel = localStorage.getItem("trainingToken")
    ? "Profile"
    : "Sign In";

  return (
    <header className="ltc-header">
      <div className="ltc-container">
        <div className="ltc-nav">
          <button
            type="button"
            onClick={() => goTo("/training")}
            className="ltc-logo"
            aria-label="TAMSI Home"
          >
            <img
              src="/TamsiLogo.png"
              alt="TAMSI Logo"
              className="ltc-logo-icon"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/80x80/ffffff/45674b?text=T";
              }}
            />

            <span>
              <h1>TAMSI</h1>
              <p>Training And Assessment</p>
            </span>
          </button>

          <nav className="ltc-desktop-nav" aria-label="Training navigation">
            {NAV_ITEMS.map((item) => (
              <HeaderNavButton
                key={item.key}
                label={item.label}
                active={active === item.key}
                onClick={() => goTo(item.path)}
              />
            ))}

            <HeaderNavButton
              label={profileLabel}
              onClick={() => goTo(profilePath)}
              variant="profile"
            />
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="ltc-menu-button"
            aria-expanded={mobileOpen}
          >
            Menu
          </button>
        </div>
      </div>

      <div className={`ltc-mobile-panel ${mobileOpen ? "is-open" : ""}`}>
        <div className="ltc-mobile-card">
          {NAV_ITEMS.map((item) => (
            <MobileHeaderButton
              key={item.key}
              label={item.label}
              active={active === item.key}
              onClick={() => goTo(item.path)}
            />
          ))}

          <MobileHeaderButton
            label={profileLabel}
            onClick={() => goTo(profilePath)}
          />
        </div>
      </div>
    </header>
  );
}

export function TrainingHero() {
  return (
    <section className="ltc-hero">
      <img
        src="/TrainingBanner.png"
        alt="TAMSI Training Banner"
        className="ltc-hero-slide"
        onError={(e) => {
          e.currentTarget.src =
            "https://placehold.co/1600x520/082719/f4d484?text=TAMSI+Training+And+Assessment";
        }}
      />

      <div className="ltc-container">
        <div className="ltc-hero-content">
          <span className="ltc-kicker">TAMSI Programs</span>
          <h2>TAMSI Training And Assessment</h2>
          <p>
            Professional training support, clear requirements, and accessible
            service for every trainee journey.
          </p>
        </div>
      </div>
    </section>
  );
}

export function TrainingPageTitle({ title, subtitle = "" }) {
  return (
    <section className="ltc-title-section">
      <div className="ltc-container">
        <div className="ltc-title-card">
          <h2>{title}</h2>
          <div className="ltc-title-line" />

          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
    </section>
  );
}


export function TrainingContactContent() {
  return (
    <>
      <section className="ltc-section ltc-contact-section">
        <RevealOnScroll className="ltc-section-title">
          <span>Get In Touch</span>
          <h3>We are ready to assist you</h3>
          <p>
            Send us a message or use the contact details below for faster inquiries about training,
            requirements, assessment schedules, and enrollment support.
          </p>
        </RevealOnScroll>

        <div className="ltc-contact-layout">
          <RevealOnScroll className="ltc-contact-card">
            <h3 className="ltc-card-heading">
              Contact <span>Information</span>
            </h3>

            <p className="ltc-card-subtext">
              Our team will help you with course questions, requirement details, training schedules,
              and other TAMSI-related concerns.
            </p>

            <div className="ltc-contact-list">
              <TrainingContactRow icon="pin" title="Address">
                {TRAINING_CONTACT_INFO.addressFull}
              </TrainingContactRow>

              <TrainingContactRow icon="phone" title="Phone">
                {TRAINING_CONTACT_INFO.phone}
              </TrainingContactRow>

              <TrainingContactRow icon="mail" title="Email">
                {TRAINING_CONTACT_INFO.email1}
                <br />
                {TRAINING_CONTACT_INFO.email2}
              </TrainingContactRow>

              <TrainingContactRow icon="clock" title="Operating Hours">
                {TRAINING_CONTACT_INFO.hours}
              </TrainingContactRow>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="ltc-message-card" delay={90}>
            <h3 className="ltc-card-heading">
              Send us <span>Message</span>
            </h3>

            <p className="ltc-card-subtext">
              Fill out the form and we will get back to you as soon as possible.
            </p>

            <form
              className="ltc-message-form"
              onSubmit={(event) => {
                event.preventDefault();
                event.currentTarget.reset();
              }}
            >
              <TrainingField label="Your Name" name="name" type="text" />
              <TrainingField label="Email Address" name="email" type="email" />
              <TrainingField label="Subject" name="subject" type="text" />

              <label className="ltc-field">
                <span>Message</span>
                <textarea name="message" rows={4} className="ltc-textarea" />
              </label>

              <button type="submit" className="ltc-submit-button">
                Submit
              </button>
            </form>
          </RevealOnScroll>
        </div>
      </section>

      <section className="ltc-map-section">
        <RevealOnScroll className="ltc-section-title">
          <span>Location Guide</span>
          <h3>Our Location Guide Map</h3>
          <p>Use the map below to locate TAMSI and plan your visit.</p>
        </RevealOnScroll>

        <RevealOnScroll className="ltc-map-card">
          <iframe
            title="TAMSI location map"
            src={TRAINING_MAP_EMBED_URL}
            width="100%"
            height="100%"
            className="ltc-map-frame"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </RevealOnScroll>
      </section>
    </>
  );
}

export function TrainingPublicFooter({ goTo }) {
  return (
    <footer className="ltc-footer">
      <div className="ltc-container">
        <div className="ltc-footer-grid">
          <div>
            <div className="ltc-footer-brand">
              <img
                src="/TamsiLogo.png"
                alt="TAMSI Logo"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/80x80/ffffff/4d6f55?text=T";
                }}
              />
              <h3>TAMSI</h3>
            </div>
          </div>

          <div>
            <h4>Menu</h4>
            <div className="ltc-footer-links">
              <FooterButton label="Home" onClick={() => goTo("/training")} />
              <FooterButton
                label="Course"
                onClick={() => goTo("/training-course")}
              />
              <FooterButton
                label="Requirements"
                onClick={() => goTo("/training-requirements")}
              />
              <FooterButton
                label="Contact"
                onClick={() => goTo("/training-contact-us")}
              />
              <FooterButton label="FAQs" onClick={() => goTo("/training-faqs")} />
              <FooterButton
                label="Profile"
                onClick={() => goTo(getProfilePath())}
              />
            </div>
          </div>

          <div>
            <h4>Contact Information</h4>
            <p>{TRAINING_CONTACT_INFO.email1}</p>
            <p>{TRAINING_CONTACT_INFO.email2}</p>
            <p>{TRAINING_CONTACT_INFO.phone}</p>
          </div>

          <div>
            <h4>Address</h4>
            <p>{TRAINING_CONTACT_INFO.addressLine1}</p>
            <p>{TRAINING_CONTACT_INFO.addressLine2}</p>
          </div>

          <div>
            <h4>Follow Us</h4>
            <p>Stay connected with TAMSI.</p>
          </div>
        </div>

        <div className="ltc-footer-bottom">
          <span>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span>Developed by CRMS Tech Alliance</span>
        </div>
      </div>
    </footer>
  );
}

export function PaperIcon({ className = "h-14 w-14" }) {
  return (
    <svg
      viewBox="0 0 90 90"
      className={`ltc-paper-icon ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28 18H58L68 28V68C68 70.2 66.2 72 64 72H28C25.8 72 24 70.2 24 68V22C24 19.8 25.8 18 28 18Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M58 18V29H68"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M19 25H53L61 33V75"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <path
        d="M34 36H55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M34 46H55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M34 56H50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M29 36L31 38L34 34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29 46L31 48L34 44"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29 56L31 58L34 54"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeaderNavButton({ label, active = false, onClick, variant = "default" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ltc-nav-link ${active ? "active" : ""} ${
        variant === "profile" ? "ltc-profile-button" : ""
      }`}
    >
      {label}
    </button>
  );
}

function MobileHeaderButton({ label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ltc-mobile-link ${active ? "active" : ""}`}
    >
      {label}
    </button>
  );
}


function TrainingField({ label, name, type = "text" }) {
  return (
    <label className="ltc-field">
      <span>{label}</span>
      <input name={name} type={type} className="ltc-input" />
    </label>
  );
}

function TrainingContactRow({ icon, title, children }) {
  return (
    <div className="ltc-contact-row">
      <span className="ltc-contact-icon">
        <TrainingContactIcon type={icon} />
      </span>

      <div>
        <h4>{title}</h4>
        <p>{children}</p>
      </div>
    </div>
  );
}

function TrainingContactIcon({ type }) {
  if (type === "pin") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
      </svg>
    );
  }

  if (type === "phone") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24c1.1.36 2.3.56 3.55.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.56 3.55a1 1 0 0 1-.24 1l-2.2 2.24Z" />
      </svg>
    );
  }

  if (type === "mail") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1.75A10.25 10.25 0 1 0 22.25 12 10.26 10.26 0 0 0 12 1.75Zm.75 10.56 3.73 2.15-.75 1.3-4.48-2.59V6h1.5v6.31Z" />
    </svg>
  );
}

function FooterButton({ label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="ltc-footer-button">
      {label}
    </button>
  );
}

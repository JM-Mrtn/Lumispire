// src/TrainingAndAssessment/TrainingEnrollmentForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TrainingChatbot from "./TrainingChatbot";


const COMMON_HEADER_LOGO_IMAGE = "/TamsiLogo.png";
const COMMON_FOOTER_LOGO_IMAGE = "/TrainingLumispireLogo.png";
const COMMON_HERO_IMAGE = "/tamsi-banner.jpg";

const COMMON_TRAINING_ROUTES = {
  home: "/training",
  enroll: "/training-enroll",
  course: "/training-course",
  requirements: "/training-requirements",
  contact: "/training-contact-us",
  faqs: "/training-faqs",
  certificate: "/training-certificate-validation",
  login: "/training-login",
};

const COMMON_TRAINING_NAV_ITEMS = [
  { key: "home", label: "Home", path: COMMON_TRAINING_ROUTES.home },
  { key: "course", label: "Course", path: COMMON_TRAINING_ROUTES.course },
  { key: "requirements", label: "Requirements", path: COMMON_TRAINING_ROUTES.requirements },
  { key: "contact", label: "Contact", path: COMMON_TRAINING_ROUTES.contact },
  { key: "faqs", label: "FAQs", path: COMMON_TRAINING_ROUTES.faqs },
  {
    key: "certificate",
    label: "Certificate Validation",
    path: COMMON_TRAINING_ROUTES.certificate,
  },
];

const COMMON_TRAINING_CONTACT_INFO = {
  email1: "lorengladius@ltcmultiservices.com",
  email2: "ltc.tamsi@gmail.com",
  phone: "+639516281271 / +639959808051",
  addressLine1: "2/F 5441 CURRIE STREET,",
  addressLine2: "PALANAN, MAKATI CITY",
};

const commonPublicStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .training-public-header,
  .training-public-footer,
  .training-public-hero,
  .training-public-mobile-menu {
    font-family: "Inter", Arial, Helvetica, sans-serif !important;
    box-sizing: border-box;
  }

  .training-public-header *,
  .training-public-footer *,
  .training-public-hero *,
  .training-public-mobile-menu * {
    box-sizing: border-box;
    font-family: inherit !important;
  }

  .training-public-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 80 !important;
    width: 100% !important;
    background: #082719 !important;
    border-bottom: 1px solid rgba(255,255,255,.1) !important;
    box-shadow: 0 10px 34px rgba(7,31,20,.14) !important;
  }

  .training-public-header-inner {
    width: 100% !important;
    max-width: none !important;
    min-height: 76px !important;
    margin: 0 !important;
    padding: 0 clamp(20px, 3vw, 48px) !important;
    display: flex !important;
    align-items: center !important;
    gap: 22px !important;
  }

  .training-public-brand {
    display: flex !important;
    align-items: center !important;
    gap: 13px !important;
    flex: 0 0 auto !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    color: white !important;
    text-align: left !important;
    cursor: pointer !important;
  }

  .training-public-brand img {
    width: 42px !important;
    height: 42px !important;
    flex: 0 0 42px !important;
    border-radius: 999px !important;
    background: white !important;
    object-fit: contain !important;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12) !important;
  }

  .training-public-brand-title {
    display: block !important;
    margin: 0 !important;
    color: white !important;
    font-size: 18px !important;
    line-height: 1 !important;
    font-weight: 900 !important;
    letter-spacing: -.04em !important;
    text-transform: uppercase !important;
    white-space: nowrap !important;
  }

  .training-public-brand-subtitle {
    display: block !important;
    margin-top: 5px !important;
    color: rgba(255,255,255,.68) !important;
    font-size: 11px !important;
    line-height: 1.2 !important;
    font-weight: 600 !important;
  }

  .training-public-nav {
    margin-left: auto !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }

  .training-public-nav-button,
  .training-public-account-button {
    min-height: 44px !important;
    border: 0 !important;
    border-radius: 999px !important;
    padding: 0 14px !important;
    font-size: 12px !important;
    line-height: 1 !important;
    font-weight: 800 !important;
    letter-spacing: .08em !important;
    text-transform: uppercase !important;
    cursor: pointer !important;
    transition: transform .2s ease, background .2s ease, color .2s ease !important;
    white-space: nowrap !important;
  }

  .training-public-nav-button {
    color: rgba(255,255,255,.78) !important;
    background: transparent !important;
  }

  .training-public-nav-button:hover,
  .training-public-nav-button.is-active {
    color: white !important;
    background: rgba(255,255,255,.13) !important;
    transform: translateY(-1px) !important;
  }

  .training-public-account-button {
    margin-left: 6px !important;
    padding: 0 18px !important;
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 14px 28px rgba(215,168,77,.18) !important;
  }

  .training-public-account-button:hover {
    transform: translateY(-1px) !important;
    filter: brightness(1.04) !important;
  }

  .training-public-menu-button {
    display: none !important;
    width: 44px !important;
    height: 44px !important;
    flex: 0 0 44px !important;
    margin-left: auto !important;
    place-items: center !important;
    border: 1px solid rgba(255,255,255,.14) !important;
    border-radius: 12px !important;
    background: rgba(255,255,255,.10) !important;
    color: white !important;
    cursor: pointer !important;
  }

  .training-public-hero {
    position: relative !important;
    isolation: isolate !important;
    overflow: hidden !important;
    width: 100% !important;
    color: white !important;
    background: linear-gradient(120deg,#03180f 0%,#082719 44%,#155f3b 100%) !important;
  }

  .training-public-hero-image {
    position: absolute !important;
    inset: 0 !important;
    z-index: -3 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    opacity: .32 !important;
  }

  .training-public-hero-overlay {
    position: absolute !important;
    inset: 0 !important;
    z-index: -2 !important;
    background: linear-gradient(120deg,rgba(2,18,11,.96) 0%,rgba(5,37,23,.88) 45%,rgba(12,64,39,.76) 100%) !important;
  }

  .training-public-hero-glow {
    position: absolute !important;
    inset: -20% -10% -28% -10% !important;
    z-index: -1 !important;
    pointer-events: none !important;
    background:
      radial-gradient(circle at 16% 82%, rgba(19,120,72,.38), transparent 25%),
      radial-gradient(circle at 72% 18%, rgba(28,108,68,.28), transparent 30%),
      radial-gradient(circle at 88% 44%, rgba(244,212,132,.16), transparent 28%) !important;
    filter: blur(30px) !important;
  }

  .training-public-hero-inner {
    width: min(1180px, 92%) !important;
    max-width: 1180px !important;
    margin: 0 auto !important;
    padding: 88px 0 84px !important;
    text-align: center !important;
  }

  .training-public-hero-kicker {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-height: 34px !important;
    margin-bottom: 18px !important;
    padding: 8px 16px !important;
    border: 1px solid rgba(255,255,255,.20) !important;
    border-radius: 999px !important;
    background: rgba(255,255,255,.09) !important;
    color: #f4d484 !important;
    font-size: 11px !important;
    font-weight: 900 !important;
    letter-spacing: .18em !important;
    text-transform: uppercase !important;
    backdrop-filter: blur(8px) !important;
  }

  .training-public-hero-title {
    max-width: 980px !important;
    margin: 0 auto !important;
    color: white !important;
    font-size: clamp(40px, 6vw, 72px) !important;
    line-height: 1.02 !important;
    font-weight: 900 !important;
    letter-spacing: -.055em !important;
    text-shadow: 0 8px 26px rgba(0,0,0,.22) !important;
  }

  .training-public-hero-title span {
    color: #f4d484 !important;
  }

  .training-public-hero-description {
    max-width: 760px !important;
    margin: 18px auto 0 !important;
    color: rgba(255,255,255,.82) !important;
    font-size: 16px !important;
    line-height: 1.75 !important;
    font-weight: 600 !important;
  }

  .training-public-footer {
    width: 100% !important;
    margin: 0 !important;
    padding: 30px 0 12px !important;
    color: white !important;
    background: #082719 !important;
    border-top: 1px solid rgba(255,255,255,.08) !important;
  }

  .training-public-footer-inner {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 clamp(20px, 3vw, 48px) !important;
  }

  .training-public-footer-grid {
    display: grid !important;
    grid-template-columns: 1.35fr .75fr 1.05fr 1fr .7fr !important;
    gap: 22px clamp(28px,4vw,72px) !important;
    padding-bottom: 24px !important;
    border-bottom: 1px solid rgba(255,255,255,.10) !important;
  }

  .training-public-footer-brand {
    display: flex !important;
    align-items: center !important;
    gap: 14px !important;
    width: 100% !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    color: white !important;
    text-align: left !important;
    cursor: pointer !important;
  }

  .training-public-footer-brand img {
    width: 110px !important;
    height: auto !important;
    flex: 0 0 auto !important;
    border-radius: 0 !important;
    background: transparent !important;
    object-fit: contain !important;
    box-shadow: none !important;
  }

  .training-public-footer-brand-title {
    display: block !important;
    margin: 0 !important;
    color: white !important;
    font-size: 20px !important;
    line-height: 1.2 !important;
    font-weight: 900 !important;
    letter-spacing: -.02em !important;
    text-transform: uppercase !important;
  }

  .training-public-footer-brand-description {
    display: block !important;
    max-width: 300px !important;
    margin-top: 7px !important;
    color: rgba(255,255,255,.68) !important;
    font-size: 13px !important;
    line-height: 1.55 !important;
    font-weight: 600 !important;
  }

  .training-public-footer-title {
    margin: 0 0 10px !important;
    color: #f4d484 !important;
    font-size: 12px !important;
    line-height: 1.2 !important;
    font-weight: 900 !important;
    letter-spacing: .14em !important;
    text-transform: uppercase !important;
  }

  .training-public-footer-text,
  .training-public-footer-link {
    display: block !important;
    margin: 5px 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    color: rgba(255,255,255,.68) !important;
    font-size: 13px !important;
    line-height: 1.55 !important;
    font-weight: 600 !important;
    text-align: left !important;
    text-decoration: none !important;
  }

  .training-public-footer-link {
    cursor: pointer !important;
  }

  .training-public-footer-link:hover {
    color: white !important;
    text-decoration: underline !important;
  }

  .training-public-footer-bottom {
    display: flex !important;
    justify-content: space-between !important;
    gap: 12px !important;
    padding-top: 14px !important;
    color: rgba(255,255,255,.50) !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    font-weight: 600 !important;
  }

  .training-public-mobile-menu {
    position: fixed !important;
    inset: 0 !important;
    z-index: 120 !important;
  }

  .training-public-mobile-backdrop {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    border: 0 !important;
    background: rgba(0,0,0,.46) !important;
    cursor: pointer !important;
  }

  .training-public-mobile-panel {
    position: absolute !important;
    top: 0 !important;
    right: 0 !important;
    width: min(330px, 88vw) !important;
    height: 100% !important;
    padding: 20px !important;
    background: white !important;
    box-shadow: -20px 0 60px rgba(0,0,0,.24) !important;
  }

  .training-public-mobile-top {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 16px !important;
    padding-bottom: 16px !important;
    margin-bottom: 14px !important;
    border-bottom: 1px solid rgba(16,24,40,.10) !important;
  }

  .training-public-mobile-title {
    margin: 0 !important;
    color: #174a30 !important;
    font-size: 12px !important;
    font-weight: 900 !important;
    letter-spacing: .16em !important;
    text-transform: uppercase !important;
  }

  .training-public-mobile-close {
    width: 44px !important;
    height: 44px !important;
    border: 0 !important;
    border-radius: 12px !important;
    background: #f2f4f2 !important;
    color: #071f14 !important;
    font-size: 18px !important;
    font-weight: 900 !important;
    cursor: pointer !important;
  }

  .training-public-mobile-link {
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
    min-height: 48px !important;
    margin-bottom: 7px !important;
    padding: 0 14px !important;
    border: 0 !important;
    border-radius: 13px !important;
    background: transparent !important;
    color: #071f14 !important;
    font-size: 14px !important;
    font-weight: 800 !important;
    text-align: left !important;
    cursor: pointer !important;
  }

  .training-public-mobile-link:hover,
  .training-public-mobile-link.is-active {
    color: white !important;
    background: #174a30 !important;
  }

  .training-public-mobile-link.is-account {
    margin-top: 10px !important;
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
  }

  .training-public-floating-home {
    position: fixed !important;
    right: 24px !important;
    bottom: 104px !important;
    z-index: 90 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 64px !important;
    height: 64px !important;
    padding: 6px !important;
    border: 1px solid rgba(7,31,20,.12) !important;
    border-radius: 999px !important;
    background: white !important;
    box-shadow: 0 14px 35px rgba(0,0,0,.20) !important;
    cursor: pointer !important;
    transition: transform .2s ease !important;
  }

  .training-public-floating-home:hover {
    transform: translateY(-4px) scale(1.04) !important;
  }

  .training-public-floating-home img {
    width: 100% !important;
    height: 100% !important;
    border-radius: 999px !important;
    object-fit: contain !important;
  }

  .training-public-floating-home-label {
    position: absolute !important;
    right: 62px !important;
    width: max-content !important;
    padding: 7px 12px !important;
    border-radius: 999px !important;
    background: #071f14 !important;
    color: white !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    opacity: 0 !important;
    pointer-events: none !important;
    transform: translateX(5px) !important;
    transition: opacity .2s ease, transform .2s ease !important;
  }

  .training-public-floating-home:hover .training-public-floating-home-label {
    opacity: 1 !important;
    transform: translateX(0) !important;
  }

  @media (max-width: 1180px) {
    .training-public-footer-grid {
      grid-template-columns: 1fr 1fr !important;
    }
  }

  @media (max-width: 1020px) {
    .training-public-header-inner {
      padding: 0 22px !important;
    }

    .training-public-nav,
    .training-public-account-button {
      display: none !important;
    }

    .training-public-menu-button {
      display: grid !important;
    }
  }

  @media (max-width: 760px) {
    .training-public-header-inner {
      min-height: 70px !important;
      padding: 0 16px !important;
    }

    .training-public-brand-title {
      font-size: 14px !important;
    }

    .training-public-brand-subtitle {
      display: none !important;
    }

    .training-public-hero-inner {
      width: min(100% - 32px, 1180px) !important;
      padding: 68px 0 66px !important;
    }

    .training-public-hero-kicker {
      margin-bottom: 14px !important;
      padding: 7px 13px !important;
      font-size: 10px !important;
    }

    .training-public-hero-title {
      font-size: clamp(34px, 11vw, 48px) !important;
      letter-spacing: -.045em !important;
    }

    .training-public-hero-description {
      margin-top: 15px !important;
      font-size: 15px !important;
      line-height: 1.65 !important;
    }

    .training-public-footer {
      padding-top: 26px !important;
    }

    .training-public-footer-inner {
      padding: 0 20px !important;
    }

    .training-public-footer-grid {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
    }

    .training-public-footer-bottom {
      flex-direction: column !important;
    }

    .training-public-floating-home {
      right: 16px !important;
      bottom: 96px !important;
      width: 58px !important;
      height: 58px !important;
    }
  }
`;

function commonNavigateAndClose(navigate, setMobileOpen, path) {
  setMobileOpen(false);
  navigate(path);
}

function TrainingPublicHeader({
  active = "",
  accountLabel = "Sign In",
  onAccountClick,
  extraMobileItems = [],
}) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleAccount = () => {
    setMobileOpen(false);
    if (onAccountClick) {
      onAccountClick();
      return;
    }
    navigate(COMMON_TRAINING_ROUTES.login);
  };

  return (
    <>
      <style>{commonPublicStyles}</style>
      <header className="training-public-header">
        <div className="training-public-header-inner">
          <button
            type="button"
            className="training-public-brand"
            onClick={() => commonNavigateAndClose(navigate, setMobileOpen, COMMON_TRAINING_ROUTES.home)}
            aria-label="Training and Assessment Home"
          >
            <img src={COMMON_HEADER_LOGO_IMAGE} alt="TAMSI Logo" width="42" height="42" decoding="async" />
            <span>
              <span className="training-public-brand-title">TRAINING &amp; ASSESSMENT</span>
              <span className="training-public-brand-subtitle">Training and assessment portal.</span>
            </span>
          </button>

          <nav className="training-public-nav" aria-label="Training navigation">
            {COMMON_TRAINING_NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`training-public-nav-button ${active === item.key ? "is-active" : ""}`}
                onClick={() => commonNavigateAndClose(navigate, setMobileOpen, item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button type="button" className="training-public-account-button" onClick={handleAccount}>
            {accountLabel}
          </button>

          <button
            type="button"
            className="training-public-menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="training-public-mobile-menu">
          <button
            type="button"
            aria-label="Close menu"
            className="training-public-mobile-backdrop"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="training-public-mobile-panel" aria-label="Training mobile navigation">
            <div className="training-public-mobile-top">
              <p className="training-public-mobile-title">Menu</p>
              <button
                type="button"
                className="training-public-mobile-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {COMMON_TRAINING_NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`training-public-mobile-link ${active === item.key ? "is-active" : ""}`}
                onClick={() => commonNavigateAndClose(navigate, setMobileOpen, item.path)}
              >
                {item.label}
              </button>
            ))}

            {extraMobileItems.map((item) => (
              <button
                key={item.key || item.label}
                type="button"
                className="training-public-mobile-link"
                onClick={() => {
                  setMobileOpen(false);
                  item.onClick?.();
                }}
              >
                {item.label}
              </button>
            ))}

            <button
              type="button"
              className="training-public-mobile-link is-account"
              onClick={handleAccount}
            >
              {accountLabel}
            </button>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function TrainingPublicHero({
  title,
  accent = "",
  description,
  kicker = "TAMSI Training & Assessment",
  image = COMMON_HERO_IMAGE,
}) {
  return (
    <section className="training-public-hero">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        width="1600"
        height="560"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="training-public-hero-image"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      <div className="training-public-hero-overlay" aria-hidden="true" />
      <div className="training-public-hero-glow" aria-hidden="true" />
      <div className="training-public-hero-inner">
        {kicker ? <div className="training-public-hero-kicker">{kicker}</div> : null}
        <h1 className="training-public-hero-title">
          {title}{accent ? <> <span>{accent}</span></> : null}
        </h1>
        {description ? (
          <p className="training-public-hero-description">{description}</p>
        ) : null}
      </div>
    </section>
  );
}

function CommonPublicFooterColumn({ title, children }) {
  return (
    <div>
      <h2 className="training-public-footer-title">{title}</h2>
      <div>{children}</div>
    </div>
  );
}

function TrainingPublicFooter() {
  const navigate = useNavigate();

  return (
    <footer className="training-public-footer" aria-label="Training and Assessment footer">
      <div className="training-public-footer-inner">
        <div className="training-public-footer-grid">
          <div>
            <button
              type="button"
              className="training-public-footer-brand"
              onClick={() => navigate(COMMON_TRAINING_ROUTES.home)}
            >
              <img
                src={COMMON_FOOTER_LOGO_IMAGE}
                alt="Training Lumispire Logo"
                width="110"
                height="80"
                loading="lazy"
                decoding="async"
              />
              <span>
                <span className="training-public-footer-brand-title">TRAINING &amp; ASSESSMENT</span>
                <span className="training-public-footer-brand-description">
                  Practical training, assessment, and learner support.
                </span>
              </span>
            </button>
          </div>

          <CommonPublicFooterColumn title="Menu">
            <button type="button" className="training-public-footer-link" onClick={() => navigate(COMMON_TRAINING_ROUTES.home)}>Home</button>
            <button type="button" className="training-public-footer-link" onClick={() => navigate(COMMON_TRAINING_ROUTES.course)}>Course</button>
            <button type="button" className="training-public-footer-link" onClick={() => navigate(COMMON_TRAINING_ROUTES.certificate)}>Certificate Validation</button>
            <button type="button" className="training-public-footer-link" onClick={() => navigate(COMMON_TRAINING_ROUTES.login)}>Sign In</button>
          </CommonPublicFooterColumn>

          <CommonPublicFooterColumn title="Contact Information">
            <p className="training-public-footer-text">{COMMON_TRAINING_CONTACT_INFO.email1}</p>
            <p className="training-public-footer-text">{COMMON_TRAINING_CONTACT_INFO.email2}</p>
            <p className="training-public-footer-text">{COMMON_TRAINING_CONTACT_INFO.phone}</p>
          </CommonPublicFooterColumn>

          <CommonPublicFooterColumn title="Address">
            <p className="training-public-footer-text">{COMMON_TRAINING_CONTACT_INFO.addressLine1}</p>
            <p className="training-public-footer-text">{COMMON_TRAINING_CONTACT_INFO.addressLine2}</p>
          </CommonPublicFooterColumn>

          <CommonPublicFooterColumn title="Follow Us">
            <a
              className="training-public-footer-link"
              href="https://www.facebook.com/profile.php?id=61571746334920"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
          </CommonPublicFooterColumn>
        </div>

        <div className="training-public-footer-bottom">
          <span>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span>Developed by CRMS Tech Alliance</span>
        </div>
      </div>
    </footer>
  );
}

function TrainingFloatingHomeButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="training-public-floating-home"
      onClick={() => navigate("/")}
      title="Back to LTC Group home"
      aria-label="Back to LTC Group home"
    >
      <span className="training-public-floating-home-label">LTC GROUP OF COMPANIES</span>
      <img src={COMMON_HEADER_LOGO_IMAGE} alt="" aria-hidden="true" width="52" height="52" />
    </button>
  );
}

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";

  const r = String(raw).replace(/\/+$/, "");

  if (r.endsWith("/api/hotel")) {
    return r.replace(/\/api\/hotel$/i, "/api");
  }

  if (r.endsWith("/api")) return r;

  if (r.includes("/api/")) {
    return r.replace(/\/api\/hotel.*$/i, "/api");
  }

  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const TERMS_AND_CONDITIONS_TEXT = `# LUMISPIRE TERMS AND CONDITIONS

**LUMISPIRE: An AI-Enabled Service Management System for Hospitality, Training, and Manpower Services of the LTC Group**
These Terms and Conditions govern your access to and use of LUMISPIRE and the services offered through the platform. By accessing, registering for, or using LUMISPIRE, you agree to comply with and be bound by these Terms and Conditions.

### 1. Acceptance of Terms

By accessing and using LUMISPIRE, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
If you do not agree with any part of these Terms and Conditions, you should discontinue your use of the system.

### 2. Use of the System

LUMISPIRE is provided for authorized users who access hospitality, training, manpower, administrative, and related services offered by the LTC Group.
Users are granted limited permission to access and use the system for legitimate and authorized purposes only.
You may not:

- Modify, reproduce, copy, distribute, or duplicate system materials without authorization
- Use LUMISPIRE for unlawful, fraudulent, or unauthorized purposes
- Attempt to reverse engineer, decompile, or gain unauthorized access to the system or its software
- Circumvent security features or access restrictions
- Copy, reproduce, or redistribute proprietary content without permission
- Attempt to access another user's account
- Upload malicious software, viruses, or harmful code
- Interfere with the normal operation or security of LUMISPIRE
- Remove copyright, ownership, or proprietary notices from system materials

### 3. User Registration

Certain features of LUMISPIRE may require users to create an account.
During registration, you must provide accurate, current, and complete information. You are responsible for updating your information whenever necessary.
You are also responsible for maintaining the confidentiality of your account credentials, including your username and password.
Any activities performed through your account may be considered your responsibility unless unauthorized access is reported promptly to the LUMISPIRE administration.

### 4. Account and Identity Verification

LUMISPIRE may require users to verify their identity, email address, contact number, or other submitted information before certain services or features can be accessed.
Registration or application processes may not be considered complete until the required verification has been successfully completed.
Providing false, misleading, incomplete, or fraudulent information may result in account restriction, rejection, suspension, or termination.

### 5. User Roles and Access

Access to LUMISPIRE may vary depending on the user's assigned role, service category, department, or authorization level.
Users may be provided access to specific functions related to:

- Hospitality services
- Training services
- Manpower services
- Applicant or employee management
- Client service requests
- Administrative functions
- Reports and records
- Other services authorized by the LTC Group

Users must not attempt to access system features, records, or information outside their authorized role or permission level.

### 6. Privacy and Data Protection

LUMISPIRE collects and processes personal information in accordance with its Privacy Policy and applicable Philippine data privacy laws.
Personal information may be collected and processed for purposes including account management, service delivery, bookings, training registration, manpower applications, employee or applicant management, communications, reporting, and system administration.
By using LUMISPIRE, you acknowledge that your personal information may be processed as described in the LUMISPIRE Privacy Policy.

### 7. User Conduct

You agree to use LUMISPIRE responsibly and professionally.
You must not use the system to:

- Upload, submit, or transmit harmful, abusive, threatening, discriminatory, defamatory, obscene, or unlawful content
- Violate applicable laws or regulations
- Impersonate another person, organization, employee, applicant, or client
- Submit false or misleading information
- Harass, threaten, or harm other users
- Attempt unauthorized access to records or accounts
- Manipulate system information or records
- Disrupt system operations, servers, databases, or networks
- Use automated tools, bots, or scripts without authorization
- Exploit system vulnerabilities or security weaknesses

Any misuse of LUMISPIRE may result in restricted access, account suspension, account termination, or other appropriate action.

### 8. Hospitality Services, Reservations, and Bookings

Hospitality-related reservations, bookings, inquiries, and service requests submitted through LUMISPIRE are subject to availability, confirmation, and applicable LTC Group policies.
Submitting a booking request does not automatically guarantee confirmation.
The LTC Group reserves the right to approve, reject, reschedule, modify, or cancel bookings when necessary due to availability, operational requirements, emergencies, incorrect information, or other reasonable circumstances.
Users are responsible for reviewing booking details before confirming their requests.

### 9. Training Services

Training registrations, schedules, attendance, assessments, certifications, and other training-related services may be managed through LUMISPIRE.
Enrollment in a training program is subject to availability, eligibility requirements, payment requirements when applicable, and approval by authorized LTC Group personnel.
Training schedules, instructors, venues, requirements, or program arrangements may be modified when necessary.
Users are responsible for complying with applicable training rules, attendance requirements, and program policies.

### 10. Manpower Services

LUMISPIRE may be used for manpower-related services including applicant registration, recruitment, screening, assignment, employee or personnel management, service requests, and related administrative activities.
Submission of an application or profile through LUMISPIRE does not guarantee employment, placement, deployment, assignment, or acceptance.
The LTC Group may evaluate applicants based on qualifications, experience, skills, availability, client requirements, screening results, and other legitimate criteria.
Users must ensure that all documents, qualifications, employment records, and information submitted through the system are accurate and authentic.

### 11. AI-Enabled Features

LUMISPIRE may use artificial intelligence or automated technologies to assist with certain system functions, such as:

- Organizing and retrieving information
- Processing service requests
- Generating recommendations
- Supporting administrative workflows
- Summarizing or analyzing records
- Assisting with scheduling or resource management
- Identifying relevant applicants, services, or information
- Supporting reporting and operational decision-making

AI-generated outputs are intended to assist users and authorized personnel and should not always be considered final or independently authoritative.
Where appropriate, significant administrative, employment, financial, training, or service-related decisions may be reviewed or confirmed by authorized LTC Group personnel.
Users should report suspected errors, inaccurate recommendations, or unexpected AI-generated results to the system administrator.

### 12. Payments and Fees

Certain hospitality, training, manpower, or other services available through LUMISPIRE may require payment.
Applicable fees, payment schedules, methods, and conditions will be communicated to users before or during the relevant transaction.
Users are responsible for providing accurate payment information and completing required payments within the specified period.
Failure to make required payments may result in cancellation, suspension, or delay of the requested service.
Any applicable refund, cancellation, or rescheduling rules will be governed by the relevant LTC Group service policies.

### 13. Accuracy of Information

While the LTC Group makes reasonable efforts to maintain accurate and updated information within LUMISPIRE, the system may occasionally contain technical, typographical, administrative, or other errors.
Information such as schedules, availability, prices, training details, assignments, applicant status, or service information may change.
The LTC Group reserves the right to correct errors, update information, or modify system content when necessary.

### 14. System Availability

LUMISPIRE may occasionally become unavailable due to maintenance, upgrades, technical problems, cybersecurity measures, Internet disruptions, or circumstances beyond the LTC Group's reasonable control.
The LTC Group does not guarantee uninterrupted or error-free access to the system at all times.
Scheduled maintenance or system updates may temporarily affect access to certain services.

### 15. Limitation of Liability

To the extent permitted by applicable law, the LTC Group shall not be liable for indirect, incidental, special, or consequential damages arising from the use of or inability to use LUMISPIRE.
This may include losses resulting from system interruptions, Internet connectivity issues, unauthorized account access, inaccurate information provided by users, or circumstances beyond the reasonable control of the LTC Group.
Nothing in these Terms and Conditions excludes liabilities that cannot legally be excluded under applicable law.

### 16. Intellectual Property

The LUMISPIRE system, including its interface, design, software, graphics, databases, documentation, branding, content, and other materials, may be protected by applicable intellectual property laws.
Unless otherwise stated, these materials are owned by or licensed to the LTC Group.
Users may not reproduce, distribute, modify, publish, sell, license, or commercially exploit any portion of LUMISPIRE without prior authorization.

### 17. Account Suspension and Termination

The LTC Group reserves the right to suspend, restrict, or terminate a user's access to LUMISPIRE when there is reasonable basis to believe that the user:

- Violated these Terms and Conditions
- Submitted fraudulent or misleading information
- Attempted unauthorized access
- Misused the platform
- Compromised the security of the system
- Harmed or attempted to harm other users or the LTC Group
- Violated applicable laws or organizational policies

Where appropriate, users may be notified regarding account restrictions or termination.

### 18. Third-Party Services

LUMISPIRE may integrate with or rely on third-party technologies and service providers for functions such as hosting, communications, payment processing, analytics, security, or AI-enabled services.
The availability and operation of third-party services may be subject to their own terms, conditions, and privacy policies.
The LTC Group is not responsible for disruptions or failures caused solely by third-party platforms outside its reasonable control.

### 19. Changes to the Terms and Conditions

The LTC Group may revise or update these Terms and Conditions when necessary to reflect changes in services, system functions, policies, technologies, or legal requirements.
Significant changes may be communicated through LUMISPIRE or other appropriate communication channels.
Your continued use of LUMISPIRE after updated Terms and Conditions take effect indicates your acknowledgment of the revised terms, subject to applicable laws.

### 20. Governing Law

These Terms and Conditions shall be governed by and interpreted in accordance with the laws of the **Republic of the Philippines**.
Any dispute arising from the use of LUMISPIRE shall be handled in accordance with applicable Philippine laws and appropriate legal procedures.

### 21. Contact Information

If you have questions, concerns, or requests regarding these Terms and Conditions, please contact:
**LTC Group – LUMISPIRE Administration**
Email: **Admin@ltcmultiservices.com**
Contact Email: **lorengladius@ltcmultiservices.com**
You may also contact the LTC Group through the official inquiry or support features available within LUMISPIRE.
By clicking **“I Understand,” “I Agree,”** creating an account, or continuing to use LUMISPIRE, you acknowledge that you have read, understood, and agree to be bound by these **LUMISPIRE Terms and Conditions**.`;

const PRIVACY_POLICY_TEXT = `# LUMISPIRE PRIVACY POLICY

**LUMISPIRE: An AI-Enabled Service Management System for Hospitality, Training, and Manpower Services of the LTC Group**
LUMISPIRE and the LTC Group value your privacy and are committed to protecting the personal information you provide while using the system. This Privacy Policy explains what information may be collected, how it is used, and the measures taken to protect it.

### 1. Information We Collect

We may collect personal information that you provide directly when you register for an account, submit an inquiry, request or book a service, enroll in a training program, apply for manpower-related opportunities, complete forms, upload documents, or communicate with the LTC Group through LUMISPIRE.
The information collected may include your:

- Full name
- Email address
- Contact number
- Address
- Account and login information
- Service or booking details
- Training and enrollment information
- Employment or manpower application information
- Educational background, qualifications, skills, and work experience
- Documents submitted through the system
- Payment and transaction information, when applicable
- Messages, inquiries, feedback, and other information voluntarily provided through LUMISPIRE

We may also collect limited technical information related to your use of the system, such as device information, browser type, login activity, and system usage data.

### 2. How We Use Your Information

We use the information collected through LUMISPIRE to:

- Create and manage user accounts
- Process inquiries, bookings, reservations, and service requests
- Manage hospitality-related services and customer transactions
- Process training registrations, schedules, attendance, and related records
- Manage manpower applications, applicant information, personnel records, assignments, and service requests
- Communicate important notices, confirmations, schedules, and service updates
- Assist authorized LTC Group personnel in managing operations and responding to users
- Support LUMISPIRE's AI-enabled features in organizing, processing, retrieving, and analyzing relevant information
- Improve the functionality, performance, security, and overall user experience of the system
- Generate administrative reports and operational insights
- Prevent unauthorized access, fraud, misuse, and other security threats
- Comply with applicable legal and regulatory requirements

AI-enabled features within LUMISPIRE may assist in processing and organizing information, generating recommendations, identifying relevant records, and supporting administrative tasks. Where appropriate, important decisions involving users remain subject to review by authorized personnel.

### 3. Information Sharing

LUMISPIRE and the LTC Group do not sell, trade, or rent your personal information to third parties.
Personal information may only be shared with authorized LTC Group personnel and trusted service providers when necessary to operate, maintain, secure, or support the system and its services.
Information may also be disclosed when required by applicable law, regulation, court order, or lawful request from government authorities.
Access to personal information is limited to individuals who require such information to perform legitimate and authorized functions.

### 4. Data Security

We implement reasonable administrative, technical, and organizational security measures to protect personal information against unauthorized access, alteration, loss, misuse, disclosure, or destruction.
These measures may include access controls, account authentication, secure data storage, system monitoring, and appropriate restrictions on access to personal information.
However, no electronic system or method of transmitting information over the Internet can be guaranteed to be completely secure. Users are also responsible for keeping their account credentials and passwords confidential.

### 5. Cookies and System Usage Data

LUMISPIRE may use cookies or similar technologies to improve system functionality and user experience.
Cookies are small files stored on your device that may help the system maintain login sessions, remember user preferences, improve system performance, and understand how users interact with LUMISPIRE.
You may manage or disable cookies through your browser settings; however, certain system features may not function properly when cookies are disabled.

### 6. Data Retention

Personal information will only be retained for as long as necessary to fulfill the purposes for which it was collected, provide the requested services, maintain appropriate business and administrative records, and comply with applicable legal or regulatory requirements.
When personal information is no longer required, appropriate measures may be taken to securely delete, anonymize, or dispose of the information in accordance with applicable policies and laws.

### 7. Your Rights

Subject to applicable data privacy laws and regulations, you may have the right to:

- Request access to your personal information
- Request correction of inaccurate or incomplete information
- Request deletion or removal of personal information when legally permitted
- Object to or restrict certain types of personal information processing
- Withdraw consent when processing is based on your consent
- Request information regarding how your personal data is being processed
- Raise concerns regarding the handling or protection of your personal information

To exercise these rights, you may contact the LTC Group through its official contact information.

### 8. Third-Party Services

LUMISPIRE may use authorized third-party technologies or service providers to support functions such as hosting, communications, payment processing, system security, analytics, or AI-enabled services.
When third-party services are used, only information reasonably necessary for the intended function should be processed, subject to appropriate privacy and security safeguards.
LUMISPIRE is not responsible for the privacy practices of external websites or services that users independently access through third-party links.

### 9. Changes to This Privacy Policy

LUMISPIRE and the LTC Group may update this Privacy Policy when necessary to reflect changes in the system, services, operational practices, technologies, or applicable legal requirements.
Users may be notified of significant changes through LUMISPIRE or other appropriate communication channels. Continued use of the system following an updated Privacy Policy constitutes acknowledgment of the revised policy, subject to applicable laws.

### 10. Contact Us

If you have questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, please contact:
**LTC Group – LUMISPIRE Administration**
Email: **Admin@ltcmultiservices.com**
Contact Email: **lorengladius@ltcmultiservices.com**
By clicking **“I Understand,” “I Agree,”** or by continuing to use LUMISPIRE, you acknowledge that you have read and understood this Privacy Policy and consent to the collection and processing of your personal information in accordance with this policy and applicable data privacy laws.`;

async function loadOpenBatches(apiBase) {
  const res = await fetch(`${apiBase}/enrollments/open-batches`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || "Failed to load open batches.");
  }

  return Array.isArray(data?.batches) ? data.batches : [];
}

function normalizeCourseName(value = "") {
  return String(value || "").trim();
}

const MAX_LENGTHS = {
  firstName: 50,
  lastName: 50,
  middleName: 50,
  email: 100,
  completeAddress: 200,
  otherEducationText: 80,
};

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const NAME_REGEX = /^[A-Za-zÀ-ÿ]+(?: [A-Za-zÀ-ÿ]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PH_PHONE_REGEX = /^(09\d{9}|\+639\d{9})$/;

const enrollmentPageStyles = `
.ltc-enrollment-page {
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
    color: var(--dark) !important;
    background:
      radial-gradient(circle at 12% 0%, rgba(215,168,77,.12), transparent 28%),
      radial-gradient(circle at 92% 12%, rgba(35,95,62,.12), transparent 30%),
      linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%) !important;
    line-height: 1.65;
    letter-spacing: -.01em;
    overflow-x: hidden;
    font-family: "Inter", Arial, Helvetica, sans-serif;
  }

  .ltc-enrollment-page * { box-sizing: border-box; font-family: inherit !important; }

  .ltc-enrollment-page header {
    position: sticky;
    top: 0;
    z-index: 50;
    width: 100%;
    background: var(--footer-green) !important;
    border-bottom: 1px solid rgba(255,255,255,.1) !important;
    box-shadow: 0 10px 34px rgba(7,31,20,.14) !important;
  }

  .ltc-enrollment-page header > div:first-child {
    width: 100% !important;
    max-width: none !important;
    min-height: 76px !important;
    padding-left: 32px !important;
    padding-right: 32px !important;
  }

  .ltc-enrollment-page header > div:first-child {
    justify-content: flex-start !important;
    gap: 14px !important;
  }

  .ltc-enrollment-page header nav {
    margin-left: auto !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
  }

  .ltc-enrollment-page header > div:first-child > button:last-of-type {
    margin-left: 10px !important;
  }

  .ltc-enrollment-page header button { transition: .25s var(--ease); }
  .ltc-enrollment-page header button:hover { transform: translateY(-1px); }

  .ltc-enrollment-page header img {
    width: 42px !important;
    height: 42px !important;
    border-radius: 999px;
    background: white;
    object-fit: contain;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
  }

  .ltc-enrollment-page header span {
    color: white !important;
    font-size: 18px !important;
    line-height: 1 !important;
    font-weight: 900 !important;
    text-transform: uppercase;
    letter-spacing: -.04em !important;
  }

  .ltc-enrollment-page header nav button,
  .ltc-enrollment-page header > div:first-child > button:last-child,
  .ltc-enrollment-page header > div:first-child > button:nth-last-child(2) {
    color: rgba(255,255,255,.78) !important;
    font-size: 12px !important;
    font-weight: 800 !important;
    letter-spacing: .08em !important;
    text-transform: uppercase !important;
    padding: 9px 12px !important;
    border-radius: 999px !important;
    border: 0 !important;
    background: transparent !important;
  }

  .ltc-enrollment-page header nav button:hover,
  .ltc-enrollment-page header > div:first-child > button:nth-last-child(2):hover {
    color: white !important;
    background: rgba(255,255,255,.13) !important;
    border-bottom: 0 !important;
  }

  .ltc-enrollment-page header > div:first-child > button:nth-last-child(2) {
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 14px 28px rgba(215,168,77,.18) !important;
  }

  .ltc-enrollment-page header > div:last-child {
    background: var(--footer-green) !important;
    border-top: 1px solid rgba(255,255,255,.1) !important;
  }

  .ltc-enrollment-page header > div:last-child > div {
    background: rgba(255,255,255,.08) !important;
    border: 1px solid rgba(255,255,255,.1) !important;
  }

  .ltc-enrollment-page header > div:last-child button {
    color: rgba(255,255,255,.82) !important;
    background: transparent !important;
  }

  .ltc-enrollment-page header > div:last-child button:hover {
    color: white !important;
    background: rgba(255,255,255,.12) !important;
  }

  .ltc-enrollment-page main > section:first-child {
    display: none !important;
  }

  .ltc-enrollment-page main > section:nth-child(2) {
    position: relative;
    overflow: hidden;
    color: white !important;
    isolation: isolate;
    padding: 82px 0 78px !important;
    background: linear-gradient(120deg, #03180f 0%, #082719 44%, #155f3b 100%) !important;
  }

  .ltc-enrollment-page main > section:nth-child(2)::before,
  .ltc-enrollment-page main > section:nth-child(2)::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
  }

  .ltc-enrollment-page main > section:nth-child(2)::before {
    width: 360px;
    height: 360px;
    right: -90px;
    top: -130px;
    background: radial-gradient(circle, rgba(244,212,132,.20), transparent 68%);
    z-index: -1;
  }

  .ltc-enrollment-page main > section:nth-child(2)::after {
    width: 420px;
    height: 420px;
    left: -160px;
    bottom: -220px;
    background: radial-gradient(circle, rgba(255,255,255,.13), transparent 67%);
    z-index: -1;
  }

  .ltc-enrollment-page main > section:nth-child(2) h1 {
    font-size: clamp(48px, 8vw, 84px) !important;
    line-height: .95 !important;
    font-weight: 900 !important;
    letter-spacing: -.065em !important;
    color: white !important;
    text-shadow: none !important;
  }

  .ltc-enrollment-page main > section:nth-child(2) h1::after {
    content: " Application";
    color: var(--gold-soft);
  }

  .ltc-enrollment-page main > section:nth-child(2) h1 {
    font-size: 0 !important;
  }

  .ltc-enrollment-page main > section:nth-child(2) h1::before {
    content: "Training Enrollment";
    font-size: clamp(48px, 8vw, 84px) !important;
    line-height: .95 !important;
    font-weight: 900 !important;
    letter-spacing: -.065em !important;
  }

  .ltc-enrollment-page main > section:nth-child(2) h1::after {
    font-size: clamp(48px, 8vw, 84px) !important;
    line-height: .95 !important;
    font-weight: 900 !important;
    letter-spacing: -.065em !important;
  }

  .ltc-enrollment-page main > section:nth-child(2) h1 + div {
    width: 118px !important;
    height: 4px !important;
    margin-top: 26px !important;
    background: linear-gradient(90deg, transparent, var(--gold-soft), transparent) !important;
    opacity: .96;
  }

  .ltc-enrollment-page main > section:nth-child(3) {
    background:
      radial-gradient(circle at 10% 10%, rgba(215,168,77,.12), transparent 28%),
      linear-gradient(180deg,#f8fbf9 0%,#eef7f2 100%) !important;
    padding: 58px 20px 72px !important;
  }

  .ltc-enrollment-page main > section:nth-child(3) > div {
    width: min(1180px, 94%) !important;
    max-width: 1180px !important;
    margin: 0 auto !important;
    background: #ffffff;
    border: 1px solid rgba(14,51,33,.10);
    border-radius: 30px;
    box-shadow: var(--shadow-lg);
    padding: clamp(22px, 4vw, 46px);
    position: relative;
    overflow: hidden;
  }

  .ltc-enrollment-page main > section:nth-child(3) > div::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 0% 0%, rgba(244,212,132,.22), transparent 26%),
      radial-gradient(circle at 100% 0%, rgba(35,95,62,.08), transparent 30%);
    pointer-events: none;
  }

  .ltc-enrollment-page form,
  .ltc-enrollment-page main > section:nth-child(3) > div > div {
    position: relative;
    z-index: 1;
  }

  .ltc-enrollment-page form { display: grid; gap: 28px; }

  .ltc-enrollment-page form > section {
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(14,51,33,.10);
    border-radius: 24px;
    padding: clamp(18px, 3vw, 30px);
    box-shadow: 0 16px 34px rgba(8,39,25,.08);
    transition: box-shadow .2s ease, border-color .2s ease;
  }

  .ltc-enrollment-page form > section:hover {
    border-color: rgba(215,168,77,.34);
    box-shadow: 0 20px 42px rgba(8,39,25,.10);
  }

  .ltc-enrollment-page h2 {
    color: var(--green-900) !important;
    font-size: clamp(22px, 3vw, 30px) !important;
    font-weight: 900 !important;
    letter-spacing: -.04em !important;
  }

  .ltc-enrollment-page h2 + div {
    background: linear-gradient(90deg, var(--gold), transparent) !important;
    height: 3px !important;
    opacity: 1 !important;
  }

  .ltc-enrollment-page label,
  .ltc-enrollment-page form p,
  .ltc-enrollment-page form span {
    color: #334f3c !important;
  }

  .ltc-enrollment-page label {
    font-weight: 900 !important;
    letter-spacing: .02em !important;
  }

  .ltc-enrollment-page input,
  .ltc-enrollment-page select {
    min-height: 46px !important;
    border-radius: 15px !important;
    border: 1px solid rgba(14,51,33,.14) !important;
    background: rgba(255,255,255,.94) !important;
    color: #193826 !important;
    box-shadow: 0 10px 24px rgba(8,39,25,.06) !important;
    transition: border-color .25s var(--ease), box-shadow .25s var(--ease), transform .25s var(--ease) !important;
  }

  .ltc-enrollment-page input:focus,
  .ltc-enrollment-page select:focus {
    border-color: rgba(215,168,77,.78) !important;
    box-shadow: 0 0 0 4px rgba(215,168,77,.16), 0 12px 30px rgba(8,39,25,.10) !important;
    transform: translateY(-1px);
  }

  .ltc-enrollment-page input[type="checkbox"] {
    min-height: auto !important;
    width: 18px !important;
    height: 18px !important;
    accent-color: var(--green-800) !important;
    box-shadow: none !important;
  }

  .ltc-enrollment-page input[type="file"] {
    padding-top: 8px !important;
    height: auto !important;
  }

  .ltc-enrollment-page input::file-selector-button {
    background: linear-gradient(135deg, var(--green-800), var(--green-700)) !important;
    color: white !important;
    border: 0 !important;
    border-radius: 999px !important;
    padding: 7px 12px !important;
    margin-right: 10px !important;
    font-weight: 900 !important;
  }

  .ltc-enrollment-page form a {
    color: var(--green-900) !important;
    background: rgba(215,168,77,.16);
    border: 1px solid rgba(215,168,77,.34);
    border-radius: 999px;
    padding: 12px 18px;
    text-decoration: none;
  }

  .ltc-enrollment-page form a:hover {
    background: rgba(215,168,77,.26);
    transform: translateY(-1px);
  }

  .ltc-enrollment-page form button[type="submit"],
  .ltc-enrollment-page form button[type="button"] {
    min-height: 48px !important;
    min-width: 210px !important;
    border-radius: 999px !important;
    border: 0 !important;
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 18px 34px rgba(215,168,77,.24) !important;
    font-size: 12px !important;
    font-weight: 900 !important;
    letter-spacing: .08em !important;
  }

  .ltc-enrollment-page form button[type="button"] {
    color: var(--green-900) !important;
    background: white !important;
    border: 1px solid rgba(14,51,33,.14) !important;
    box-shadow: 0 12px 26px rgba(8,39,25,.08) !important;
  }

  .ltc-enrollment-page form button:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    filter: brightness(1.02);
  }

  .ltc-enrollment-page [class*="text-red"] { color: #b42318 !important; }
  .ltc-enrollment-page [class*="text-green"] { color: #027a48 !important; }
  .ltc-enrollment-page [class*="text-yellow"] { color: #854a0e !important; }

  .ltc-enrollment-page footer {
    background: var(--footer-green) !important;
    color: rgba(255,255,255,.78) !important;
    position: relative;
    overflow: hidden;
  }

  .ltc-enrollment-page footer::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 8% 10%, rgba(215,168,77,.12), transparent 28%),
      radial-gradient(circle at 88% 80%, rgba(255,255,255,.08), transparent 24%);
    pointer-events: none;
  }

  .ltc-enrollment-page footer > div { position: relative; z-index: 1; }
  .ltc-enrollment-page footer h2,
  .ltc-enrollment-page footer h3 { color: white !important; }
  .ltc-enrollment-page footer p,
  .ltc-enrollment-page footer button,
  .ltc-enrollment-page footer div { color: rgba(255,255,255,.74) !important; }
  .ltc-enrollment-page footer button:hover { color: var(--gold-soft) !important; }
  .ltc-enrollment-page footer [class*="border"] { border-color: rgba(255,255,255,.10) !important; }

  .ltc-training-policy-box {
    border: 1px solid rgba(14,51,33,.12);
    border-radius: 18px;
    background: rgba(255,255,255,.88);
    padding: 16px 18px;
    box-shadow: 0 12px 28px rgba(8,39,25,.07);
  }

  .ltc-training-policy-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .ltc-training-policy-check {
    flex: 0 0 auto;
    margin-top: 2px;
  }

  .ltc-training-policy-check.error {
    outline: 3px solid rgba(217,45,32,.18);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .ltc-training-policy-text {
    color: #334f3c !important;
    font-size: 12px;
    line-height: 1.55;
    font-weight: 700;
  }

  .ltc-enrollment-page form button.ltc-training-policy-link {
    min-height: auto !important;
    min-width: 0 !important;
    display: inline !important;
    padding: 0 !important;
    margin: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    color: #9b6a16 !important;
    font-size: inherit !important;
    font-weight: 900 !important;
    letter-spacing: normal !important;
    text-transform: none !important;
    vertical-align: baseline;
    cursor: pointer;
  }

  .ltc-enrollment-page form button.ltc-training-policy-link:hover {
    transform: none !important;
    filter: none !important;
    color: var(--green-800) !important;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .ltc-training-policy-error {
    margin: 7px 0 0 28px;
    color: #b42318 !important;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 800;
  }

  .ltc-training-policy-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    padding: 18px;
    background: rgba(2,18,11,.72);
    backdrop-filter: blur(7px);
  }

  .ltc-training-policy-modal {
    width: min(900px, 100%);
    height: min(84vh, 820px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.72);
    border-radius: 24px;
    background: white;
    box-shadow: 0 30px 90px rgba(0,0,0,.32);
  }

  .ltc-training-policy-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 18px 20px;
    background: var(--footer-green);
    border-bottom: 1px solid rgba(255,255,255,.1);
  }

  .ltc-training-policy-kicker {
    margin: 0 0 4px;
    color: var(--gold-soft) !important;
    font-size: 10px;
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .ltc-training-policy-title {
    margin: 0;
    color: white !important;
    font-size: 24px !important;
    line-height: 1.2;
    font-weight: 900 !important;
  }

  .ltc-training-policy-close {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    border: 0;
    border-radius: 999px;
    background: rgba(255,255,255,.12);
    color: white;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
  }

  .ltc-training-policy-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 24px 28px 32px;
    background: white;
  }

  .ltc-training-policy-document {
    width: min(760px, 100%);
    margin: 0 auto;
    color: #25352d;
    font-size: 13.5px;
    line-height: 1.72;
  }

  .ltc-training-policy-document h1 {
    margin: 0 0 16px;
    color: var(--green-950) !important;
    font-size: clamp(23px, 3vw, 31px) !important;
    line-height: 1.15 !important;
    font-weight: 900 !important;
  }

  .ltc-training-policy-document h3 {
    margin: 24px 0 8px;
    color: var(--green-800) !important;
    font-size: 16px !important;
    line-height: 1.35 !important;
    font-weight: 900 !important;
  }

  .ltc-training-policy-document p {
    margin: 0 0 12px;
    color: #25352d !important;
  }

  .ltc-training-policy-document strong {
    color: #13281d !important;
    font-weight: 900;
  }

  .ltc-training-policy-document ul {
    margin: 4px 0 16px;
    padding-left: 24px;
  }

  .ltc-training-policy-document li {
    margin: 4px 0;
    color: #25352d;
  }

  .ltc-training-policy-document li::marker {
    color: var(--gold);
  }

  .ltc-training-policy-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 12px 18px 16px;
    border-top: 1px solid rgba(14,51,33,.10);
    background: #f8fbf9;
  }

  .ltc-training-policy-done {
    min-width: 118px;
    min-height: 42px;
    border: 0;
    border-radius: 999px;
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .ltc-enrollment-page header > div:first-child {
      padding-left: 18px !important;
      padding-right: 18px !important;
    }

    .ltc-enrollment-page main > section:nth-child(2) {
      padding: 58px 18px 56px !important;
    }

    .ltc-enrollment-page main > section:nth-child(2) h1::before,
    .ltc-enrollment-page main > section:nth-child(2) h1::after {
      font-size: 42px !important;
    }

    .ltc-enrollment-page main > section:nth-child(3) {
      padding: 34px 10px 48px !important;
    }

    .ltc-enrollment-page main > section:nth-child(3) > div {
      width: min(100%, 94%) !important;
      border-radius: 22px;
      padding: 18px;
    }

    .ltc-enrollment-page form > section { padding: 18px; }
  }
`;


const FILE_RULES = {
  birthCertificate: {
    label: "Birth Certificate",
    required: true,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    accept: ".pdf,.jpg,.jpeg,.png,.webp",
    allowedLabel: "PDF, JPG, JPEG, PNG, or WEBP",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
    allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
  },
  form137138: {
    label: "Form 137/138",
    required: false,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    accept: ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx",
    allowedLabel: "PDF, JPG, JPEG, PNG, WEBP, DOC, or DOCX",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".doc",
      ".docx",
    ],
  },
  diplomaTor: {
    label: "Diploma/TOR",
    required: true,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    accept: ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx",
    allowedLabel: "PDF, JPG, JPEG, PNG, WEBP, DOC, or DOCX",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".doc",
      ".docx",
    ],
  },
  picture2x2: {
    label: "2X2 Picture with Name",
    required: true,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    accept: ".jpg,.jpeg,.png,.webp",
    allowedLabel: "JPG, JPEG, PNG, or WEBP",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
  marriageContract: {
    label: "Marriage Contract",
    required: false,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    accept: ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx",
    allowedLabel: "PDF, JPG, JPEG, PNG, WEBP, DOC, or DOCX",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".doc",
      ".docx",
    ],
  },
  applicationForm: {
    label: "Application Form",
    required: true,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    accept: ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx",
    allowedLabel: "PDF, JPG, JPEG, PNG, WEBP, DOC, or DOCX",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".doc",
      ".docx",
    ],
  },
};

function sanitizeNameInput(value = "") {
  return String(value)
    .replace(/[^A-Za-zÀ-ÿ ]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/g, "");
}

function sanitizePhoneInput(value = "") {
  let cleaned = String(value).replace(/[^0-9+]/g, "");

  if (cleaned.includes("+")) {
    cleaned = `+${cleaned.replace(/\+/g, "")}`;
  }

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(0, 13);
  } else {
    cleaned = cleaned.slice(0, 11);
  }

  return cleaned;
}

function getFileExtension(filename = "") {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
}

function calculateAge(birthDate) {
  if (!birthDate) return null;

  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}

function isFutureDate(dateString) {
  if (!dateString) return false;

  const picked = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(picked.getTime())) return false;

  const today = new Date();
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return picked.getTime() > todayOnly.getTime();
}

function validateFileValue(file, rule) {
  if (!file) {
    return rule.required ? `${rule.label} is required.` : "";
  }

  const fileType = String(file.type || "").toLowerCase();
  const fileExt = getFileExtension(file.name || "");

  const mimeMatched = rule.allowedMimeTypes.includes(fileType);
  const extMatched = rule.allowedExtensions.includes(fileExt);

  if (!mimeMatched && !extMatched) {
    return `${rule.label} must be ${rule.allowedLabel}.`;
  }

  if (file.size > rule.maxSizeBytes) {
    return `${rule.label} must be ${MAX_FILE_SIZE_MB}MB or less.`;
  }

  return "";
}

function getInitialForm() {
  return {
    firstName: "",
    lastName: "",
    middleName: "",
    phoneNumber: "",
    email: "",
    birthDate: "",
    gender: "",
    status: "",
    completeAddress: "",
    course: "",
    batchId: "",

    educationAttainment: {
      elementaryGraduate: false,
      highSchoolGraduate: false,
      tvetGraduate: false,
      collegeLevel: false,
      collegeGraduate: false,
      others: false,
    },
    otherEducationText: "",

    employmentStatus: {
      casual: false,
      jobOrder: false,
      probationary: false,
      permanent: false,
      ofw: false,
      selfEmployed: false,
    },

    birthCertificate: null,
    form137138: null,
    diplomaTor: null,
    picture2x2: null,
    marriageContract: null,
    applicationForm: null,
  };
}

function getInitialTouched() {
  return {
    firstName: false,
    lastName: false,
    middleName: false,
    phoneNumber: false,
    email: false,
    birthDate: false,
    gender: false,
    status: false,
    completeAddress: false,
    course: false,
    batchId: false,
    educationAttainment: false,
    otherEducationText: false,
    employmentStatus: false,
    birthCertificate: false,
    form137138: false,
    diplomaTor: false,
    picture2x2: false,
    marriageContract: false,
    applicationForm: false,
  };
}

function getValidationErrors(form, options = {}) {
  const { emailDuplicate = false, availableBatches = [] } = options;
  const errors = {};
  const age = calculateAge(form.birthDate);

  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const middleNameRaw = form.middleName;
  const middleName = form.middleName.trim();
  const phoneNumber = form.phoneNumber.trim();
  const email = form.email.trim().toLowerCase();
  const completeAddress = form.completeAddress.trim();
  const course = form.course.trim();
  const batchId = form.batchId.trim();
  const otherEducationTextRaw = form.otherEducationText;
  const otherEducationText = form.otherEducationText.trim();

  if (!firstName) {
    errors.firstName = "First name is required.";
  } else if (firstName.length > MAX_LENGTHS.firstName) {
    errors.firstName = `First name must be ${MAX_LENGTHS.firstName} characters or less.`;
  } else if (!NAME_REGEX.test(firstName)) {
    errors.firstName = "First name must contain letters only.";
  }

  if (!lastName) {
    errors.lastName = "Last name is required.";
  } else if (lastName.length > MAX_LENGTHS.lastName) {
    errors.lastName = `Last name must be ${MAX_LENGTHS.lastName} characters or less.`;
  } else if (!NAME_REGEX.test(lastName)) {
    errors.lastName = "Last name must contain letters only.";
  }

  if (middleNameRaw && !middleName) {
    errors.middleName = "Middle name cannot contain spaces only.";
  } else if (middleName.length > MAX_LENGTHS.middleName) {
    errors.middleName = `Middle name must be ${MAX_LENGTHS.middleName} characters or less.`;
  } else if (middleName && !NAME_REGEX.test(middleName)) {
    errors.middleName = "Middle name must contain letters only.";
  }

  if (!phoneNumber) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!PH_PHONE_REGEX.test(phoneNumber)) {
    errors.phoneNumber =
      "Use a valid PH mobile number like 09XXXXXXXXX or +639XXXXXXXXX.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (email.length > MAX_LENGTHS.email) {
    errors.email = `Email must be ${MAX_LENGTHS.email} characters or less.`;
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Please enter a valid email address.";
  } else if (emailDuplicate) {
    errors.email = "This email is already used.";
  }

  if (!form.birthDate) {
    errors.birthDate = "Birth date is required.";
  } else if (isFutureDate(form.birthDate)) {
    errors.birthDate = "Birth date cannot be in the future.";
  } else if (age === null) {
    errors.birthDate = "Please enter a valid birth date.";
  } else if (age < 18) {
    errors.birthDate = "Applicant must be 18 years old and above.";
  }

  if (!form.gender) {
    errors.gender = "Gender is required.";
  }

  if (!form.status) {
    errors.status = "Status is required.";
  }

  if (!completeAddress) {
    errors.completeAddress = "Complete address is required.";
  } else if (completeAddress.length > MAX_LENGTHS.completeAddress) {
    errors.completeAddress = `Complete address must be ${MAX_LENGTHS.completeAddress} characters or less.`;
  }

  if (!course) {
    errors.course = "Course is required.";
  }

  if (!batchId) {
    errors.batchId = "No open batch selected for this course.";
  } else {
    const matchedBatch = availableBatches.find(
      (item) => String(item._id) === batchId
    );

    if (!matchedBatch) {
      errors.batchId = "Selected batch is not currently open.";
    } else if (
      normalizeCourseName(matchedBatch.course) !== normalizeCourseName(course)
    ) {
      errors.batchId = "Selected batch does not match the chosen course.";
    }
  }

  const educationSelectedCount = Object.values(form.educationAttainment).filter(
    Boolean
  ).length;

  if (educationSelectedCount === 0) {
    errors.educationAttainment = "Please select one educational attainment.";
  } else if (educationSelectedCount > 1) {
    errors.educationAttainment =
      "Please select only one educational attainment.";
  }

  if (form.educationAttainment.others) {
    if (!otherEducationTextRaw || !otherEducationText) {
      errors.otherEducationText =
        "Please specify the other educational attainment.";
    } else if (otherEducationText.length > MAX_LENGTHS.otherEducationText) {
      errors.otherEducationText = `Other educational attainment must be ${MAX_LENGTHS.otherEducationText} characters or less.`;
    }
  }

  const employmentSelectedCount = Object.values(form.employmentStatus).filter(
    Boolean
  ).length;

  if (employmentSelectedCount === 0) {
    errors.employmentStatus = "Please select at least one employment status.";
  }

  Object.entries(FILE_RULES).forEach(([fieldName, rule]) => {
    const fileError = validateFileValue(form[fieldName], rule);
    if (fileError) {
      errors[fieldName] = fileError;
    }
  });

  return errors;
}

async function checkDuplicateEmail(apiBase, email) {
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanEmail) {
    return { checked: false, exists: false };
  }

  const possibleEndpoints = [
    `${apiBase}/enrollments/check-email?email=${encodeURIComponent(cleanEmail)}`,
    `${apiBase}/enrollments/check-email/${encodeURIComponent(cleanEmail)}`,
  ];

  for (const url of possibleEndpoints) {
    try {
      const res = await fetch(url);

      if (res.status === 404) continue;

      if (res.status === 409) {
        return { checked: true, exists: true };
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) continue;

      if (
        data?.exists === true ||
        data?.isDuplicate === true ||
        data?.available === false
      ) {
        return { checked: true, exists: true };
      }

      if (
        data?.exists === false ||
        data?.isDuplicate === false ||
        data?.available === true
      ) {
        return { checked: true, exists: false };
      }

      return { checked: true, exists: false };
    } catch {
      // ignore unavailable duplicate-check endpoint
    }
  }

  return { checked: false, exists: false };
}

export default function TrainingEnrollmentForm() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState(getInitialForm());
  const [touched, setTouched] = useState(getInitialTouched());
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(true);
  const [openBatches, setOpenBatches] = useState([]);
  const [fileResetKey, setFileResetKey] = useState(0);
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const [policyTouched, setPolicyTouched] = useState(false);
  const [policyModal, setPolicyModal] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [emailState, setEmailState] = useState({
    checking: false,
    duplicate: false,
    checked: false,
  });

  useEffect(() => {
    const run = async () => {
      try {
        setBatchLoading(true);

        const batches = await loadOpenBatches(API_BASE);
        setOpenBatches(batches);
      } catch (error) {
        setOpenBatches([]);

        setMsg({
          type: "error",
          text: error.message || "Failed to load open batches.",
        });
      } finally {
        setBatchLoading(false);
      }
    };

    run();
  }, []);

  useEffect(() => {
    if (!policyModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setPolicyModal(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [policyModal]);

  const age = useMemo(() => calculateAge(form.birthDate), [form.birthDate]);

  const availableCourseOptions = useMemo(() => {
    return [
      ...new Set(
        openBatches
          .map((item) => normalizeCourseName(item.course))
          .filter(Boolean)
      ),
    ];
  }, [openBatches]);

  const batchesForSelectedCourse = useMemo(() => {
    const selectedCourse = normalizeCourseName(form.course);

    return openBatches.filter(
      (item) => normalizeCourseName(item.course) === selectedCourse
    );
  }, [form.course, openBatches]);

  const selectedBatch = useMemo(() => {
    return openBatches.find((item) => String(item._id) === String(form.batchId));
  }, [openBatches, form.batchId]);

  const errors = useMemo(() => {
    return getValidationErrors(form, {
      emailDuplicate: emailState.duplicate,
      availableBatches: openBatches,
    });
  }, [form, emailState.duplicate, openBatches]);

  const selectedEducation = useMemo(() => {
    return Object.entries(form.educationAttainment)
      .filter(([, value]) => value)
      .map(([key]) => key);
  }, [form.educationAttainment]);

  const selectedEmployment = useMemo(() => {
    return Object.entries(form.employmentStatus)
      .filter(([, value]) => value)
      .map(([key]) => key);
  }, [form.employmentStatus]);

  const submitDisabled =
    loading ||
    batchLoading ||
    !openBatches.length ||
    (form.course && !batchesForSelectedCourse.length);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const goToProfile = () => {
    const token = localStorage.getItem("trainingToken");
    goTo(token ? "/trainee-profile" : "/trainee-login");
  };

  const clearMessage = () => {
    if (msg.type) setMsg({ type: "", text: "" });
  };

  const markTouched = (name) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const markAllTouched = () => {
    setTouched(
      Object.keys(getInitialTouched()).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (["firstName", "lastName", "middleName"].includes(name)) {
      nextValue = sanitizeNameInput(value);
    }

    if (name === "phoneNumber") {
      nextValue = sanitizePhoneInput(value);
    }

    setForm((prev) => {
      if (name === "course") {
        const matchingBatches = openBatches.filter(
          (item) => normalizeCourseName(item.course) === normalizeCourseName(nextValue)
        );

        return {
          ...prev,
          course: nextValue,
          batchId: matchingBatches[0]?._id ? String(matchingBatches[0]._id) : "",
        };
      }

      return {
        ...prev,
        [name]: nextValue,
      };
    });

    if (name === "email") {
      setEmailState({
        checking: false,
        duplicate: false,
        checked: false,
      });
    }

    markTouched(name);
    clearMessage();
  };

  const onEducationChange = (key) => {
    setForm((prev) => {
      const willEnable = !prev.educationAttainment[key];

      const resetEducation = Object.keys(prev.educationAttainment).reduce(
        (acc, currentKey) => {
          acc[currentKey] = false;
          return acc;
        },
        {}
      );

      const nextEducation = willEnable
        ? { ...resetEducation, [key]: true }
        : resetEducation;

      return {
        ...prev,
        educationAttainment: nextEducation,
        otherEducationText:
          willEnable && key === "others" ? prev.otherEducationText : "",
      };
    });

    markTouched("educationAttainment");

    if (key === "others") {
      markTouched("otherEducationText");
    }

    clearMessage();
  };

  const onEmploymentChange = (key) => {
    setForm((prev) => ({
      ...prev,
      employmentStatus: {
        ...prev.employmentStatus,
        [key]: !prev.employmentStatus[key],
      },
    }));

    markTouched("employmentStatus");
    clearMessage();
  };

  const onFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;

    setForm((prev) => ({
      ...prev,
      [name]: file,
    }));

    markTouched(name);
    clearMessage();
  };

  const handleEmailBlur = async () => {
    markTouched("email");

    const emailValue = form.email.trim().toLowerCase();

    if (!emailValue || !EMAIL_REGEX.test(emailValue)) {
      setEmailState({
        checking: false,
        duplicate: false,
        checked: false,
      });
      return;
    }

    setEmailState((prev) => ({
      ...prev,
      checking: true,
    }));

    const result = await checkDuplicateEmail(API_BASE, emailValue);

    setEmailState({
      checking: false,
      duplicate: result.exists,
      checked: result.checked,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    markAllTouched();
    setPolicyTouched(true);
    setMsg({ type: "", text: "" });

    if (!agreedToPolicies) {
      setMsg({
        type: "error",
        text: "Please review the highlighted fields before submitting.",
      });
      return;
    }

    let duplicateFromPrecheck = emailState.duplicate;

    const preCheckErrors = getValidationErrors(form, {
      emailDuplicate: duplicateFromPrecheck,
      availableBatches: openBatches,
    });

    if (Object.keys(preCheckErrors).length > 0) {
      setMsg({
        type: "error",
        text: "Please review the highlighted fields before submitting.",
      });
      return;
    }

    try {
      setLoading(true);

      const cleanEmail = form.email.trim().toLowerCase();

      if (cleanEmail && EMAIL_REGEX.test(cleanEmail)) {
        const duplicateCheck = await checkDuplicateEmail(API_BASE, cleanEmail);

        if (duplicateCheck.checked) {
          duplicateFromPrecheck = duplicateCheck.exists;

          setEmailState({
            checking: false,
            duplicate: duplicateCheck.exists,
            checked: duplicateCheck.checked,
          });
        }
      }

      const submitErrors = getValidationErrors(form, {
        emailDuplicate: duplicateFromPrecheck,
        availableBatches: openBatches,
      });

      if (Object.keys(submitErrors).length > 0) {
        setMsg({
          type: "error",
          text: "Please review the highlighted fields before submitting.",
        });
        return;
      }

      const body = new FormData();

      body.append("firstName", form.firstName.trim());
      body.append("lastName", form.lastName.trim());
      body.append("middleName", form.middleName.trim());
      body.append("phoneNumber", form.phoneNumber.trim());
      body.append("email", cleanEmail);
      body.append("birthDate", form.birthDate);
      body.append("age", String(age || ""));
      body.append("gender", form.gender);
      body.append("status", form.status);
      body.append("completeAddress", form.completeAddress.trim());
      body.append("course", form.course.trim());
      body.append("batchId", form.batchId.trim());
      body.append("educationAttainment", JSON.stringify(selectedEducation));
      body.append("otherEducationText", form.otherEducationText.trim());
      body.append("employmentStatus", JSON.stringify(selectedEmployment));

      if (form.birthCertificate) {
        body.append("birthCertificate", form.birthCertificate);
      }

      if (form.form137138) {
        body.append("form137138", form.form137138);
      }

      if (form.diplomaTor) {
        body.append("diplomaTor", form.diplomaTor);
      }

      if (form.picture2x2) {
        body.append("picture2x2", form.picture2x2);
      }

      if (form.marriageContract) {
        body.append("marriageContract", form.marriageContract);
      }

      if (form.applicationForm) {
        body.append("applicationForm", form.applicationForm);
      }

      const res = await fetch(`${API_BASE}/enrollments`, {
        method: "POST",
        body,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const serverMessage = data?.message || "Failed to submit application.";

        if (
          /email/i.test(serverMessage) &&
          /(exist|already|used|taken|registered)/i.test(serverMessage)
        ) {
          setEmailState({
            checking: false,
            duplicate: true,
            checked: true,
          });
        }

        throw new Error(serverMessage);
      }

      setMsg({
        type: "success",
        text: data?.message || "Application submitted successfully.",
      });

      const nextState = {
        firstName: form.firstName.trim(),
        email: cleanEmail,
        course: form.course.trim(),
        emailNoticeSent: Boolean(data?.emailNoticeSent),
      };

      setForm(getInitialForm());
      setTouched(getInitialTouched());
      setEmailState({
        checking: false,
        duplicate: false,
        checked: false,
      });
      setFileResetKey((prev) => prev + 1);
      setAgreedToPolicies(false);
      setPolicyTouched(false);
      setPolicyModal(null);

      setTimeout(() => {
        navigate("/training-submit", {
          replace: true,
          state: nextState,
        });
      }, 1200);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Submission failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fbf9]">
      <style>{enrollmentPageStyles}</style>
      <TrainingPublicHeader
        extraMobileItems={[
          { key: "profile", label: "Profile", onClick: goToProfile },
        ]}
      />

      <TrainingPublicHero
        title="Training Enrollment"
        accent="Application"
        description="Complete your details and submit the required documents for an open TAMSI training batch."
      />

      <div className="ltc-enrollment-page">
      <main>
        {/* Reserved first child: kept only so the existing nth-child layout stays stable. */}
        <section className="hidden" aria-hidden="true" />

        {/* Reserved second child: keeps the form-body nth-child styles stable. */}
        <section className="hidden" aria-hidden="true" />

        {/* FORM BODY */}
        <section className="bg-[#2e5038] px-5 pb-9 pt-7 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1280px]">
            <div
              className="mb-6 min-h-[58px]"
              aria-live="polite"
              aria-atomic="true"
            >
              {msg.text ? (
                <div
                  role={msg.type === "error" ? "alert" : "status"}
                  className={[
                    "min-h-[58px] rounded-xl px-4 py-4 text-sm font-semibold",
                    msg.type === "success"
                      ? "bg-green-50 text-green-800 ring-1 ring-green-200"
                      : "bg-red-50 text-red-800 ring-1 ring-red-200",
                  ].join(" ")}
                >
                  {msg.text}
                </div>
              ) : batchLoading ? (
                <div className="min-h-[58px] rounded-xl bg-white/80 px-4 py-4 text-sm font-semibold text-[#45674b] ring-1 ring-[#dce5da]">
                  Checking enrollment availability...
                </div>
              ) : !openBatches.length ? (
                <div className="min-h-[58px] rounded-xl bg-yellow-50 px-4 py-4 text-sm font-semibold text-yellow-900 ring-1 ring-yellow-200">
                  Enrollment is currently closed. Please wait for the professor to open a new batch.
                </div>
              ) : (
                <div className="min-h-[58px] rounded-xl bg-green-50 px-4 py-4 text-sm font-semibold text-green-800 ring-1 ring-green-200">
                  Enrollment is open. Select an available course and complete the form below.
                </div>
              )}
            </div>

            <form onSubmit={submit} className="space-y-8">
              {/* PERSONAL INFO */}
              <section>
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <SectionTitle title="Personal Information" />

                  <div className="w-full md:w-[360px]">
                    <label
                      htmlFor="training-enroll-course"
                      className="mb-1 block text-[11px] font-extrabold text-white/90"
                    >
                      Course
                    </label>

                    <Select
                      name="course"
                      value={form.course}
                      onChange={onChange}
                      onBlur={() => markTouched("course")}
                      error={
                        touched.course || touched.batchId
                          ? errors.course || errors.batchId
                          : ""
                      }
                      options={[
                        {
                          value: "",
                          label: batchLoading
                            ? "Loading courses..."
                            : "Choose Course",
                        },
                        ...availableCourseOptions.map((course) => ({
                          value: course,
                          label: course,
                        })),
                      ]}
                    />

                    <p className="mt-1 min-h-[16px] text-[10px] font-semibold text-[#45674b]">
                      {selectedBatch
                        ? `Open batch: ${selectedBatch.batchName}${
                            selectedBatch.batchCode
                              ? ` (${selectedBatch.batchCode})`
                              : ""
                          }`
                        : "\u00A0"}
                    </p>

                    <p
                      id="training-enroll-course-error"
                      className="mt-1 min-h-[16px] text-[10px] font-semibold text-[#b42318]"
                    >
                      {(touched.course || touched.batchId) &&
                      (errors.course || errors.batchId)
                        ? errors.course || errors.batchId
                        : "\u00A0"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
                  <Field
                    label="First Name"
                    htmlFor="training-enroll-firstName"
                    error={touched.firstName ? errors.firstName : ""}
                  >
                    <Input
                      name="firstName"
                      value={form.firstName}
                      onChange={onChange}
                      onBlur={() => markTouched("firstName")}
                      maxLength={MAX_LENGTHS.firstName}
                      error={touched.firstName ? errors.firstName : ""}
                    />
                  </Field>

                  <Field
                    label="Last Name"
                    htmlFor="training-enroll-lastName"
                    error={touched.lastName ? errors.lastName : ""}
                  >
                    <Input
                      name="lastName"
                      value={form.lastName}
                      onChange={onChange}
                      onBlur={() => markTouched("lastName")}
                      maxLength={MAX_LENGTHS.lastName}
                      error={touched.lastName ? errors.lastName : ""}
                    />
                  </Field>

                  <Field
                    label="Middle Name"
                    htmlFor="training-enroll-middleName"
                    error={touched.middleName ? errors.middleName : ""}
                  >
                    <Input
                      name="middleName"
                      value={form.middleName}
                      onChange={onChange}
                      onBlur={() => markTouched("middleName")}
                      maxLength={MAX_LENGTHS.middleName}
                      error={touched.middleName ? errors.middleName : ""}
                    />
                  </Field>

                  <Field
                    label="Phone Number"
                    htmlFor="training-enroll-phoneNumber"
                    error={touched.phoneNumber ? errors.phoneNumber : ""}
                  >
                    <Input
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={onChange}
                      onBlur={() => markTouched("phoneNumber")}
                      maxLength={13}
                      error={touched.phoneNumber ? errors.phoneNumber : ""}
                      inputMode="numeric"
                    />
                  </Field>

                  <Field label="Email" htmlFor="training-enroll-email" error={touched.email ? errors.email : ""}>
                    <>
                      <Input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        onBlur={handleEmailBlur}
                        maxLength={MAX_LENGTHS.email}
                        error={touched.email ? errors.email : ""}
                      />
                      {emailState.checking && (
                        <p className="mt-1 text-[10px] font-semibold text-white/70">
                          Checking email...
                        </p>
                      )}
                    </>
                  </Field>

                  <Field
                    label="Date of Birth"
                    htmlFor="training-enroll-birthDate"
                    error={touched.birthDate ? errors.birthDate : ""}
                  >
                    <Input
                      type="date"
                      name="birthDate"
                      value={form.birthDate}
                      onChange={onChange}
                      onBlur={() => markTouched("birthDate")}
                      error={touched.birthDate ? errors.birthDate : ""}
                    />
                  </Field>

                  <Field label="Age" htmlFor="training-enroll-age">
                    <Input id="training-enroll-age" value={age ?? ""} readOnly />
                  </Field>

                  <Field
                    label="Gender"
                    htmlFor="training-enroll-gender"
                    error={touched.gender ? errors.gender : ""}
                  >
                    <Select
                      name="gender"
                      value={form.gender}
                      onChange={onChange}
                      onBlur={() => markTouched("gender")}
                      error={touched.gender ? errors.gender : ""}
                      options={[
                        { value: "", label: "" },
                        { value: "Male", label: "Male" },
                        { value: "Female", label: "Female" },
                      ]}
                    />
                  </Field>

                  <Field
                    label="Status"
                    htmlFor="training-enroll-status"
                    error={touched.status ? errors.status : ""}
                  >
                    <Select
                      name="status"
                      value={form.status}
                      onChange={onChange}
                      onBlur={() => markTouched("status")}
                      error={touched.status ? errors.status : ""}
                      options={[
                        { value: "", label: "" },
                        { value: "Single", label: "Single" },
                        { value: "Married", label: "Married" },
                        { value: "Widowed", label: "Widowed" },
                        { value: "Separated", label: "Separated" },
                      ]}
                    />
                  </Field>

                  <div className="md:col-span-3">
                    <Field
                      label="Complete Address"
                    htmlFor="training-enroll-completeAddress"
                      error={
                        touched.completeAddress ? errors.completeAddress : ""
                      }
                    >
                      <Input
                        name="completeAddress"
                        value={form.completeAddress}
                        onChange={onChange}
                        onBlur={() => markTouched("completeAddress")}
                        maxLength={MAX_LENGTHS.completeAddress}
                        error={
                          touched.completeAddress ? errors.completeAddress : ""
                        }
                      />
                    </Field>
                  </div>
                </div>
              </section>

              {/* EDUCATION */}
              <section>
                <SectionTitle title="Highest Educational Attainment" />

                <div className="mt-5 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                  <CheckItem
                    label="Elementary Graduate"
                    checked={form.educationAttainment.elementaryGraduate}
                    onChange={() => onEducationChange("elementaryGraduate")}
                  />

                  <CheckItem
                    label="High School Graduate"
                    checked={form.educationAttainment.highSchoolGraduate}
                    onChange={() => onEducationChange("highSchoolGraduate")}
                  />

                  <CheckItem
                    label="TVET Graduate"
                    checked={form.educationAttainment.tvetGraduate}
                    onChange={() => onEducationChange("tvetGraduate")}
                  />

                  <CheckItem
                    label="College Level"
                    checked={form.educationAttainment.collegeLevel}
                    onChange={() => onEducationChange("collegeLevel")}
                  />

                  <CheckItem
                    label="College Graduate"
                    checked={form.educationAttainment.collegeGraduate}
                    onChange={() => onEducationChange("collegeGraduate")}
                  />

                  <div className="flex items-center gap-2">
                    <CheckItem
                      label="Others:"
                      checked={form.educationAttainment.others}
                      onChange={() => onEducationChange("others")}
                    />

                    <label
                      htmlFor="training-enroll-otherEducationText"
                      className="sr-only"
                    >
                      Other educational attainment
                    </label>

                    <input
                      id="training-enroll-otherEducationText"
                      type="text"
                      name="otherEducationText"
                      value={form.otherEducationText}
                      onChange={onChange}
                      onBlur={() => markTouched("otherEducationText")}
                      maxLength={MAX_LENGTHS.otherEducationText}
                      className="min-h-[44px] w-[180px] border-b border-[#45674b]/40 bg-white/90 px-2 text-xs font-bold text-[#263d2c] outline-none"
                    />
                  </div>
                </div>

                {touched.educationAttainment && errors.educationAttainment && (
                  <p className="mt-3 text-xs font-semibold text-red-200">
                    {errors.educationAttainment}
                  </p>
                )}

                {touched.otherEducationText && errors.otherEducationText && (
                  <p className="mt-2 text-xs font-semibold text-red-200">
                    {errors.otherEducationText}
                  </p>
                )}
              </section>

              {/* EMPLOYMENT STATUS */}
              <section>
                <SectionTitle title="Employment Status" />

                <div className="mt-5 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  <CheckItem
                    label="Casual"
                    checked={form.employmentStatus.casual}
                    onChange={() => onEmploymentChange("casual")}
                  />

                  <CheckItem
                    label="Job Order"
                    checked={form.employmentStatus.jobOrder}
                    onChange={() => onEmploymentChange("jobOrder")}
                  />

                  <CheckItem
                    label="Probationary"
                    checked={form.employmentStatus.probationary}
                    onChange={() => onEmploymentChange("probationary")}
                  />

                  <CheckItem
                    label="Permanent"
                    checked={form.employmentStatus.permanent}
                    onChange={() => onEmploymentChange("permanent")}
                  />

                  <CheckItem
                    label="OFW"
                    checked={form.employmentStatus.ofw}
                    onChange={() => onEmploymentChange("ofw")}
                  />

                  <CheckItem
                    label="Self-Employed"
                    checked={form.employmentStatus.selfEmployed}
                    onChange={() => onEmploymentChange("selfEmployed")}
                  />
                </div>

                {touched.employmentStatus && errors.employmentStatus && (
                  <p className="mt-3 text-xs font-semibold text-red-200">
                    {errors.employmentStatus}
                  </p>
                )}
              </section>

              {/* UPLOAD REQUIREMENTS */}
              <section>
                <SectionTitle title="Upload Requirements" />

                <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
                  <UploadField
                    label="Birth Certificate"
                    name="birthCertificate"
                    onChange={onFileChange}
                    fileValue={form.birthCertificate}
                    inputKey={`birthCertificate-${fileResetKey}`}
                    accept={FILE_RULES.birthCertificate.accept}
                    error={
                      touched.birthCertificate ? errors.birthCertificate : ""
                    }
                  />

                  <UploadField
                    label="Form 137/138 (Optional)"
                    name="form137138"
                    onChange={onFileChange}
                    fileValue={form.form137138}
                    inputKey={`form137138-${fileResetKey}`}
                    accept={FILE_RULES.form137138.accept}
                    error={touched.form137138 ? errors.form137138 : ""}
                  />

                  <UploadField
                    label="Diploma/TOR"
                    name="diplomaTor"
                    onChange={onFileChange}
                    fileValue={form.diplomaTor}
                    inputKey={`diplomaTor-${fileResetKey}`}
                    accept={FILE_RULES.diplomaTor.accept}
                    error={touched.diplomaTor ? errors.diplomaTor : ""}
                  />

                  <UploadField
                    label="2X2 Picture with Name"
                    name="picture2x2"
                    onChange={onFileChange}
                    fileValue={form.picture2x2}
                    inputKey={`picture2x2-${fileResetKey}`}
                    accept={FILE_RULES.picture2x2.accept}
                    error={touched.picture2x2 ? errors.picture2x2 : ""}
                  />

                  <UploadField
                    label="Marriage Contract (Optional)"
                    name="marriageContract"
                    onChange={onFileChange}
                    fileValue={form.marriageContract}
                    inputKey={`marriageContract-${fileResetKey}`}
                    accept={FILE_RULES.marriageContract.accept}
                    error={
                      touched.marriageContract ? errors.marriageContract : ""
                    }
                  />

                  <UploadField
                    label="Application Form"
                    name="applicationForm"
                    onChange={onFileChange}
                    fileValue={form.applicationForm}
                    inputKey={`applicationForm-${fileResetKey}`}
                    accept={FILE_RULES.applicationForm.accept}
                    error={touched.applicationForm ? errors.applicationForm : ""}
                  />
                </div>

                <a
                  href="/TAMSI_APPLICATION_FORM.docx"
                  download="TAMSI_APPLICATION_FORM.docx"
                  className="mt-8 inline-block text-[14px] font-extrabold text-white transition hover:opacity-80 sm:text-[16px]"
                >
                  Click here to Download the Form
                </a>
              </section>

              <div className="ltc-training-policy-box">
                <div className="ltc-training-policy-row">
                  <input
                    id="training-policy-consent"
                    type="checkbox"
                    checked={agreedToPolicies}
                    onChange={(event) => {
                      setAgreedToPolicies(event.target.checked);
                      setPolicyTouched(true);
                      clearMessage();
                    }}
                    className={`ltc-training-policy-check ${
                      policyTouched && !agreedToPolicies ? "error" : ""
                    }`}
                    aria-required="true"
                    aria-invalid={policyTouched && !agreedToPolicies}
                    aria-describedby={
                      policyTouched && !agreedToPolicies
                        ? "training-policy-consent-error"
                        : undefined
                    }
                  />

                  <div className="ltc-training-policy-text">
                    <label htmlFor="training-policy-consent">
                      I agree to the{" "}
                    </label>

                    <button
                      type="button"
                      className="ltc-training-policy-link"
                      onClick={() => setPolicyModal("terms")}
                    >
                      Terms &amp; Conditions
                    </button>

                    <span> and </span>

                    <button
                      type="button"
                      className="ltc-training-policy-link"
                      onClick={() => setPolicyModal("privacy")}
                    >
                      Privacy Policy
                    </button>
                  </div>
                </div>

                {policyTouched && !agreedToPolicies ? (
                  <p
                    id="training-policy-consent-error"
                    className="ltc-training-policy-error"
                  >
                    You must agree to the Terms &amp; Conditions and Privacy Policy before submitting your application.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-5 pt-2">
                <button
                  type="submit"
                  disabled={submitDisabled}
                  className="h-[32px] min-w-[190px] rounded-full bg-white px-8 text-[10px] font-extrabold uppercase text-[#45674b] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f5f8f2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Submitting..."
                    : batchLoading
                    ? "Loading Batches..."
                    : "Submit Application"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/training")}
                  className="h-[32px] min-w-[190px] rounded-full bg-white px-8 text-[10px] font-extrabold uppercase text-[#45674b] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f5f8f2]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {policyModal ? (
        <TrainingPolicyModal
          type={policyModal}
          onClose={() => setPolicyModal(null)}
        />
      ) : null}

      </div>

      <TrainingPublicFooter />
      <TrainingFloatingHomeButton />
    </div>
  );
}

function renderPolicyInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

function TrainingPolicyDocument({ content }) {
  const lines = content.split("\n");
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;

    elements.push(
      <ul key={`policy-list-${elements.length}`}>
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderPolicyInline(item)}</li>
        ))}
      </ul>
    );

    listItems = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={`policy-h1-${index}`}>
          {renderPolicyInline(line.slice(2))}
        </h1>
      );
      return;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`policy-h3-${index}`}>
          {renderPolicyInline(line.slice(4))}
        </h3>
      );
      return;
    }

    elements.push(
      <p key={`policy-p-${index}`}>{renderPolicyInline(line)}</p>
    );
  });

  flushList();

  return <div className="ltc-training-policy-document">{elements}</div>;
}

function TrainingPolicyModal({ type, onClose }) {
  const isTerms = type === "terms";
  const title = isTerms ? "Terms & Conditions" : "Privacy Policy";
  const content = isTerms
    ? TERMS_AND_CONDITIONS_TEXT
    : PRIVACY_POLICY_TEXT;

  return (
    <div
      className="ltc-training-policy-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="ltc-training-policy-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="training-policy-title"
      >
        <div className="ltc-training-policy-header">
          <div>
            <p className="ltc-training-policy-kicker">
              LUMISPIRE TRAINING &amp; ASSESSMENT
            </p>
            <h2
              id="training-policy-title"
              className="ltc-training-policy-title"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            className="ltc-training-policy-close"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            ×
          </button>
        </div>

        <div className="ltc-training-policy-body">
          <TrainingPolicyDocument content={content} />
        </div>

        <div className="ltc-training-policy-footer">
          <button
            type="button"
            className="ltc-training-policy-done"
            onClick={onClose}
          >
            DONE
          </button>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div className="flex w-full flex-col">
      <h2 className="text-[24px] font-extrabold text-white/85 sm:text-[28px]">
        {title}
      </h2>
      <div className="mt-1 h-[2px] w-full max-w-[310px] rounded-full bg-white/30" />
    </div>
  );
}

function Field({ label, htmlFor, children, error = "" }) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-[11px] font-extrabold text-white/90"
      >
        {label}
      </label>

      {children}

      {error && (
        <p
          id={errorId}
          className="mt-1 text-[10px] font-semibold text-red-200"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function Input({
  id,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  error = "",
  readOnly = false,
  maxLength,
  placeholder = "",
  inputMode,
}) {
  const inputId = id || (name ? `training-enroll-${name}` : undefined);
  return (
    <input
      id={inputId}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      readOnly={readOnly}
      maxLength={maxLength}
      placeholder={placeholder}
      inputMode={inputMode}
      aria-invalid={!!error}
      aria-describedby={error && inputId ? `${inputId}-error` : undefined}
      className={[
        "h-12 w-full rounded-md border bg-white px-3 text-[12px] font-semibold text-[#263d2c] outline-none shadow-sm",
        readOnly ? "cursor-default bg-white/95" : "",
        error ? "border-red-300" : "border-white/80 focus:border-white",
      ].join(" ")}
    />
  );
}

function Select({ id, name, value, onChange, onBlur, error = "", options = [] }) {
  const selectId = id || (name ? `training-enroll-${name}` : undefined);
  return (
    <select
      id={selectId}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      aria-invalid={!!error}
      aria-describedby={error && selectId ? `${selectId}-error` : undefined}
      className={[
        "h-12 w-full rounded-md border bg-white px-3 text-[12px] font-semibold text-[#263d2c] outline-none shadow-sm",
        error ? "border-red-300" : "border-white/80 focus:border-white",
      ].join(" ")}
    >
      {options.map((option) => (
        <option key={`${name}-${option.value}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function CheckItem({ label, checked, onChange }) {
  return (
    <label className="flex min-h-[44px] items-center gap-2 text-[11px] font-extrabold text-white/90">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 accent-[#235f3e]"
      />
      <span>{label}</span>
    </label>
  );
}

function UploadField({
  label,
  name,
  onChange,
  fileValue,
  inputKey,
  accept,
  error = "",
}) {
  return (
    <div>
      <label
        htmlFor={`training-enroll-${name}`}
        className="mb-1 block text-[11px] font-extrabold text-white/90"
      >
        {label}
      </label>

      <input
        key={inputKey}
        id={`training-enroll-${name}`}
        type="file"
        name={name}
        accept={accept}
        onChange={(e) => onChange(e)}
        aria-invalid={!!error}
        aria-describedby={error ? `training-enroll-${name}-error` : undefined}
        className={[
          "block min-h-12 w-full rounded-md border bg-white px-2 py-2 text-[10px] font-semibold text-[#263d2c] shadow-sm file:mr-2 file:rounded file:border-0 file:bg-[#45674b] file:px-2 file:py-0.5 file:text-[10px] file:font-bold file:text-white",
          error ? "border-red-300" : "border-white/80",
        ].join(" ")}
      />

      {fileValue?.name && (
        <p className="mt-1 truncate text-[10px] font-semibold text-white/70">
          {fileValue.name}
        </p>
      )}

      {error && (
        <p
          id={`training-enroll-${name}-error`}
          className="mt-1 text-[10px] font-semibold text-red-200"
        >
          {error}
        </p>
      )}
    </div>
  );
}

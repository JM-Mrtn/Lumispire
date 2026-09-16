// src/TrainingAndAssessment/TrainingSubmit.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const HEADER_LOGO_IMAGE = "/TamsiLogo.webp";
const FOOTER_LOGO_IMAGE = "/TrainingLumispireLogo.webp";
const HERO_IMAGE = "/tamsi-banner.jpg";

const NAV_ITEMS = [
  { label: "Home", path: "/training" },
  { label: "Course", path: "/training-course" },
  { label: "Requirements", path: "/training-requirements" },
  { label: "Contact", path: "/training-contact-us" },
  { label: "FAQs", path: "/training-faqs" },
  { label: "Certificate Validation", path: "/training-certificate-validation" },
];

export default function TrainingSubmit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const state = location.state || {};
  const firstName = state.firstName || "Applicant";
  const email = state.email || "";
  const course = state.course || "";
  const emailNoticeSent = Boolean(state.emailNoticeSent);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fbf9] font-sans text-[#071f14]" style={{ fontFamily: "Inter, Arial, Helvetica, sans-serif" }}>
      <TrainingPublicHeader />

      <main>
        <TrainingPublicHero
          title="Application"
          accent="Submitted"
          description="Your enrollment request has been sent to TAMSI for review."
        />

                <section className="bg-[#f6f8f4] px-5 py-14 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] border border-[#dfe7df] border-t-4 border-t-[#d7a84d] bg-white p-6 text-[#173d27] shadow-[0_18px_46px_rgba(8,39,25,.10)] sm:p-8">
              <div className="inline-flex rounded-full bg-[#fff7dc] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#2f4536]">
                Success
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-[#071f14] sm:text-4xl">
                Thank you, {firstName}!
              </h2>

              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#405247] sm:text-base">
                Your TAMSI enrollment application was submitted successfully.
                Please wait while the training admin reviews your information and
                uploaded requirements.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard label="Submitted Name" value={firstName} />
                <InfoCard label="Course" value={course || "Not specified"} />
                <InfoCard label="Email" value={email || "Not specified"} />
                <InfoCard
                  label="Email Notice"
                  value={emailNoticeSent ? "Sent" : "Recorded"}
                />
              </div>

              <div className="mt-8 rounded-2xl bg-[#f7faf7] p-5 ring-1 ring-[#dfe7df]">
                <h3 className="text-xl font-black text-[#173d27]">
                  What happens next?
                </h3>

                <ul className="mt-4 space-y-3 text-sm font-semibold leading-7 text-[#405247]">
                  <li>• Your submitted documents will be reviewed by the training admin.</li>
                  <li>• Wait for an update regarding your application approval.</li>
                  <li>• Once approved, your trainee account details will be sent to your email.</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/training")}
                  className="min-h-[48px] rounded-full bg-gradient-to-r from-[#f4d484] to-[#d7a84d] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#102418] shadow-[0_12px_28px_rgba(215,168,77,.22)] transition hover:-translate-y-0.5"
                >
                  Back to Training
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/training-login")}
                  className="min-h-[48px] rounded-full border border-[#b8c7bb] bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#235f3e] transition hover:bg-[#f0f6f1]"
                >
                  Go to Sign In
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#dfe7df] border-t-4 border-t-[#235f3e] bg-white p-6 shadow-[0_18px_46px_rgba(8,39,25,.10)] sm:p-8">
              <div className="inline-flex rounded-full bg-[#eef3e9] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#2f4536]">
                Reminder
              </div>

              <h3 className="mt-5 text-2xl font-black text-[#071f14]">
                Keep your email active
              </h3>

              <p className="mt-4 text-sm font-semibold leading-7 text-[#405247]">
                Make sure the email you used in your enrollment form stays active,
                because TAMSI will use it for updates and approval notices.
              </p>

              <div className="mt-6 rounded-2xl bg-[#f7faf7] p-5 ring-1 ring-[#dfe7df]">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-[#334f3c]">
                  Note
                </div>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#405247]">
                  {emailNoticeSent
                    ? "A confirmation email has been sent to your submitted email address."
                    : "Your application was saved successfully. If no confirmation email arrives, your submission is still recorded in the system."}
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-[#f7faf7] p-5 ring-1 ring-[#dfe7df]">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-[#334f3c]">
                  Support
                </div>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#405247]">
                  If you need help with your application, contact the TAMSI training
                  office through the contact details on the training pages.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <TrainingPublicFooter />
      <TrainingFloatingHomeButton />

      <TrainingChatbot />
    </div>
  );
}

function SubmitHeader({ navigate, onOpenMenu }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#082719] shadow-[0_10px_34px_rgba(7,31,20,.14)]">
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => navigate("/training")}
          className="flex min-h-[44px] items-center gap-3 text-left text-white"
          aria-label="Training and Assessment Home"
        >
          <img
            src={HEADER_LOGO_IMAGE}
            alt="TAMSI Logo"
            width="42"
            height="42"
            decoding="async"
            className="h-[42px] w-[42px] rounded-full bg-white object-contain"
          />
          <span>
            <span className="block text-[18px] font-black uppercase leading-none tracking-tight">
              TRAINING &amp; ASSESSMENT
            </span>
            <span className="mt-1 block text-[11px] font-semibold text-white/70">
              Training and assessment portal.
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Training navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="min-h-[44px] rounded-full px-4 text-[12px] font-extrabold uppercase tracking-wide text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate("/training-login")}
            className="ml-2 min-h-[44px] rounded-full bg-gradient-to-r from-[#f4d484] to-[#d7a84d] px-5 text-[12px] font-black uppercase tracking-wide text-[#102418]"
          >
            Sign In
          </button>
        </nav>

        <button
          type="button"
          onClick={onOpenMenu}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white lg:hidden"
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function SubmitMobileMenu({ navigate, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <aside className="absolute right-0 top-0 h-full w-[310px] max-w-[86vw] bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174a30]">
            Menu
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2f4f2] text-lg font-black text-[#071f14]"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="mt-4 grid gap-2" aria-label="Mobile training navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                onClose();
                navigate(item.path);
              }}
              className="min-h-[48px] rounded-xl px-4 text-left text-sm font-extrabold text-[#071f14] hover:bg-[#eef3e9]"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/training-login");
            }}
            className="min-h-[48px] rounded-xl bg-[#f4d484] px-4 text-left text-sm font-black text-[#102418]"
          >
            Sign In
          </button>
        </nav>
      </aside>
    </div>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-[0.14em] text-[#f4d484]">
        {title}
      </div>
      <div className="mt-3 space-y-1.5 text-[13px] font-semibold leading-5 text-white/70">
        {children}
      </div>
    </div>
  );
}

function SubmitFooter({ navigate }) {
  return (
    <footer
      className="border-t border-white/10 bg-[#082719] text-white"
      aria-label="Training and Assessment footer"
    >
      <div className="mx-auto grid w-full max-w-[1440px] gap-7 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_1.2fr_1fr_.7fr] lg:px-10">
        <button
          type="button"
          onClick={() => navigate("/training")}
          className="flex min-h-[44px] items-center gap-4 text-left"
        >
          <img
            src={FOOTER_LOGO_IMAGE}
            alt="Training Lumispire Logo"
            width="110"
            height="80"
            loading="lazy"
            decoding="async"
            className="h-auto w-[110px] object-contain"
          />
          <span>
            <span className="block text-lg font-black uppercase leading-tight">
              TRAINING &amp; ASSESSMENT
            </span>
            <span className="mt-2 block max-w-[280px] text-[13px] font-semibold leading-5 text-white/70">
              Practical training, assessment, and learner support.
            </span>
          </span>
        </button>

        <FooterColumn title="Menu">
          <button type="button" onClick={() => navigate("/training")} className="block min-h-[44px] text-left hover:text-white">Home</button>
          <button type="button" onClick={() => navigate("/training-course")} className="block min-h-[44px] text-left hover:text-white">Course</button>
          <button type="button" onClick={() => navigate("/training-certificate-validation")} className="block min-h-[44px] text-left hover:text-white">Certificate Validation</button>
          <button type="button" onClick={() => navigate("/training-login")} className="block min-h-[44px] text-left hover:text-white">Sign In</button>
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <p>lorengladius@ltcmultiservices.com</p>
          <p>ltc.tamsi@gmail.com</p>
          <p>+639516281271 / +639959808051</p>
        </FooterColumn>

        <FooterColumn title="Address">
          <p>2/F 5441 CURRIE STREET,</p>
          <p>PALANAN, MAKATI CITY</p>
        </FooterColumn>

        <FooterColumn title="Follow Us">
          <a
            href="https://www.facebook.com/profile.php?id=61571746334920"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center hover:text-white"
          >
            Facebook
          </a>
        </FooterColumn>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-1 border-t border-white/10 px-4 py-4 text-[11px] font-semibold text-white/50 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
        <span>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
        <span>Developed by CRMS Tech Alliance</span>
      </div>
    </footer>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f7faf7] p-4 ring-1 ring-[#dfe7df]">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-[#334f3c]">
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-bold text-[#173d27]">
        {value}
      </div>
    </div>
  );
}

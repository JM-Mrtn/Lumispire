// src/TrainingAndAssessment/TrainingAndAssessmentPage.jsx
import React, { useState } from "react";
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

const HEADER_LOGO_IMAGE = "/TamsiLogo.png";
const FOOTER_LOGO_IMAGE = "/TrainingLumispireLogo.png";
const HERO_IMAGE = "/tamsi-banner.jpg";

const TRAINING_HOME_ROUTE = "/training";
const TRAINING_ENROLL_ROUTE = "/training-enroll";
const TRAINING_COURSE_ROUTE = "/training-course";
const TRAINING_REQUIREMENTS_ROUTE = "/training-requirements";
const TRAINING_CONTACT_ROUTE = "/training-contact-us";
const TRAINING_FAQS_ROUTE = "/training-faqs";
const TRAINING_LOGIN_ROUTE = "/training-login";
const TRAINING_CERTIFICATE_VALIDATION_ROUTE = "/training-certificate-validation";

const TRAINING_CONTACT_INFO = {
  email1: "lorengladius@ltcmultiservices.com",
  email2: "ltc.tamsi@gmail.com",
  phone: "+639516281271 / +639959808051",
  addressLine1: "2/F 5441 CURRIE STREET,",
  addressLine2: "PALANAN, MAKATI CITY",
};

const TRAINING_NAV_ITEMS = [
  { key: "home", label: "Home", path: TRAINING_HOME_ROUTE },
  { key: "course", label: "Course", path: TRAINING_COURSE_ROUTE },
  { key: "requirements", label: "Requirements", path: TRAINING_REQUIREMENTS_ROUTE },
  { key: "contact", label: "Contact", path: TRAINING_CONTACT_ROUTE },
  { key: "faqs", label: "FAQs", path: TRAINING_FAQS_ROUTE },
  {
    key: "certificate-validation",
    label: "Certificate Validation",
    path: TRAINING_CERTIFICATE_VALIDATION_ROUTE,
  },
];

const TRAINING_FOOTER_NAV_ITEMS = [
  { key: "home", label: "Home", path: TRAINING_HOME_ROUTE },
  { key: "course", label: "Course", path: TRAINING_COURSE_ROUTE },
  {
    key: "certificate-validation",
    label: "Certificate Validation",
    path: TRAINING_CERTIFICATE_VALIDATION_ROUTE,
  },
  { key: "sign-in", label: "Sign In", path: TRAINING_LOGIN_ROUTE },
];

const highlights = [
  {
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85",
    fallback: "https://placehold.co/1200x760/173f2b/ffffff?text=Training+Classroom",
    alt: "Students participating in a professional training session",
  },
  {
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=85",
    fallback: "https://placehold.co/1200x760/235f3e/ffffff?text=Hospitality+Lounge",
    alt: "Modern hospitality lounge and dining facility",
  },
  {
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85",
    fallback: "https://placehold.co/1200x760/c49a45/ffffff?text=Guest+Room",
    alt: "Professionally prepared hotel guest room",
  },
];

const quickCards = [
  {
    title: "Enroll Now",
    subtitle: "Start your journey here at TAMSI",
    buttonLabel: "Enroll",
    route: TRAINING_ENROLL_ROUTE,
    icon: "enroll",
  },
  {
    title: "Course Offer",
    subtitle: "See the list of courses we offer",
    buttonLabel: "View",
    route: TRAINING_COURSE_ROUTE,
    icon: "course",
  },
  {
    title: "Requirements",
    subtitle: "See all requirements you need to submit",
    buttonLabel: "View",
    route: TRAINING_REQUIREMENTS_ROUTE,
    icon: "requirements",
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
    margin-left: auto;
    margin-right: auto;
    padding-left: 40px;
    padding-right: 40px;
    box-sizing: border-box;
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
    grid-template-columns: 1.35fr .75fr 1.05fr 1fr .7fr;
    column-gap: clamp(28px, 4vw, 76px);
    row-gap: 22px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255,255,255,.1);
  }

  .ltc-footer-brand {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 14px;
    width: 100%;
    text-decoration: none;
    text-align: left;
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
  }

  .ltc-footer-brand img {
    flex: 0 0 auto;
    width: 110px;
    height: auto;
    border-radius: 0;
    object-fit: contain;
    background: transparent;
    display: block;
  }

  .ltc-footer-brand-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .ltc-footer-brand-description {
    max-width: 300px;
    margin: 0 !important;
    color: rgba(255,255,255,.72) !important;
  }

  .ltc-footer .ltc-footer-brand-title {
    color: white;
    font-weight: 900;
    font-size: 20px;
    line-height: 1.2;
    margin: 0;
    text-transform: uppercase;
  }

  .ltc-footer .ltc-footer-column-title {
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
    width: 64px;
    height: 64px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.25);
    background: white;
    padding: 6px;
    box-shadow: 0 14px 35px rgba(0,0,0,.24);
    transition: .25s var(--ease);
    cursor: pointer;
  }

  .training-floating-home:hover {
    transform: translateY(-4px) scale(1.05);
    background: white;
  }

  .training-floating-home img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 999px;
    object-fit: contain;
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
`;

function TrainingIcon({ type = "document" }) {
  if (type === "enroll") {
    return (
      <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M24 18H56L66 28V72H24V18Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M56 18V29H66" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M34 42H56M34 53H48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M30 68L35 62L42 68L52 56L64 68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "course") {
    return (
      <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M23 22H60C65 22 69 26 69 31V69H30C26 69 23 66 23 62V22Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M23 62C23 58 26 55 30 55H69" stroke="currentColor" strokeWidth="3" />
        <path d="M34 34H56M34 43H52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 69V55" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M28 18H58L68 28V68C68 70.2 66.2 72 64 72H28C25.8 72 24 70.2 24 68V22C24 19.8 25.8 18 28 18Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M58 18V29H68" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M34 38H55M34 48H55M34 58H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M29 38L31 40L35 35M29 48L31 50L35 45M29 58L31 60L35 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
              src={HEADER_LOGO_IMAGE}
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
                active={item.key === "home"}
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

function ActionCard({ title, subtitle, buttonLabel, onClick, icon }) {
  return (
    <button type="button" onClick={onClick} className="ltc-quick-card">
      <span className="ltc-icon-frame">
        <TrainingIcon type={icon} />
      </span>
      <h3 className="ltc-quick-title" style={fontMontserrat}>{title}</h3>
      <p className="ltc-quick-subtitle" style={fontPontano}>{subtitle}</p>
      <span className="ltc-card-action" style={fontPoppins}>{buttonLabel}</span>
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
              src={FOOTER_LOGO_IMAGE}
              alt="Training Lumispire Logo"
              onError={(event) => {
                event.currentTarget.src = "https://placehold.co/80x80/ffffff/4d6f55?text=T";
              }}
            />
            <div className="ltc-footer-brand-copy">
              <h3 className="ltc-footer-brand-title" style={fontMontserrat}>TRAINING &amp; ASSESSMENT</h3>
              <p className="ltc-footer-brand-description" style={fontPontano}>
                Practical training, assessment, and learner support.
              </p>
            </div>
          </button>
        </div>

        <FooterColumn title="Menu">
          {TRAINING_FOOTER_NAV_ITEMS.map((item) => (
            <FooterLink key={item.key} onClick={() => goTo(item.path)}>
              {item.label}
            </FooterLink>
          ))}
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
          <a
            className="ltc-footer-link"
            href="https://www.facebook.com/profile.php?id=61571746334920&rdid=3bcMsbFVo3PBobtd&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1D1g1d614L#"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
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
      <h3 className="ltc-footer-column-title" style={fontMontserrat}>{title}</h3>
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
            className={`ltc-sidebar-link ${item.key === "home" ? "active" : ""}`}
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
      <img src={HEADER_LOGO_IMAGE} alt="" aria-hidden="true" />
    </button>
  );
}

export default function TrainingAndAssessmentPage() {
  const navigate = useNavigate();
  const [activeHighlight, setActiveHighlight] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleHighlights = [
    highlights[activeHighlight % highlights.length],
    highlights[(activeHighlight + 1) % highlights.length],
    highlights[(activeHighlight + 2) % highlights.length],
  ];

  const nextHighlight = () => {
    setActiveHighlight((prev) => (prev + 1) % highlights.length);
  };

  const prevHighlight = () => {
    setActiveHighlight((prev) => (prev === 0 ? highlights.length - 1 : prev - 1));
  };

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  return (
    <div className="ltc-training-home">
      <style>{pageStyles}</style>

      <TrainingPublicHeader active="home" />

      <main>
        <TrainingPublicHero
          title="Welcome to"
          accent="Training & Assessment"
          description="Enroll, explore courses, prepare your training requirements, and continue your TAMSI training journey."
        />

                <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-home-shell">
              <h2 className="ltc-section-heading" style={fontMontserrat}>
                Training & Assessment Services
              </h2>
              <div className="ltc-section-line" />
              <p className="ltc-section-intro" style={fontPoppins}>
               
              </p>

              <div className="ltc-quick-grid">
                {quickCards.map((card) => (
                  <ActionCard
                    key={card.title}
                    title={card.title}
                    subtitle={card.subtitle}
                    buttonLabel={card.buttonLabel}
                    icon={card.icon}
                    onClick={() => navigate(card.route)}
                  />
                ))}
              </div>
            </div>

            <div className="ltc-highlight-shell">
              <div className="ltc-highlight-header">
                <h2 style={fontMontserrat}>Our Highlights</h2>
                <div className="ltc-highlight-line" />
              </div>

              <div className="ltc-highlight-carousel">
                <button
                  type="button"
                  onClick={prevHighlight}
                  className="ltc-carousel-button"
                  aria-label="Previous highlight"
                >
                  ‹
                </button>

                <div className="ltc-highlight-grid">
                  {visibleHighlights.map((item, index) => (
                    <div key={`${item.image}-${index}`} className="ltc-highlight-card">
                      <img
                        src={item.image}
                        alt={item.alt}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = item.fallback;
                        }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={nextHighlight}
                  className="ltc-carousel-button"
                  aria-label="Next highlight"
                >
                  ›
                </button>
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

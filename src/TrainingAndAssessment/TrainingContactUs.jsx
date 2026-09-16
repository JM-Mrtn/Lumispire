// src/TrainingAndAssessment/TrainingContactUs.jsx
import React, { useMemo, useState } from "react";
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
const TRAINING_COURSE_ROUTE = "/training-course";
const TRAINING_REQUIREMENTS_ROUTE = "/training-requirements";
const TRAINING_LOGIN_ROUTE = "/training-login";
const TRAINING_CONTACT_ROUTE = "/training-contact-us";
const TRAINING_FAQS_ROUTE = "/training-faqs";
const TRAINING_CERTIFICATE_VALIDATION_ROUTE = "/training-certificate-validation";

const TRAINING_CONTACT_INFO = {
  email1: "lorengladius@ltcmultiservices.com",
  email2: "ltc.tamsi@gmail.com",
  phone: "+639516281271 / +639959808051",
  addressLine1: "2/F 5441 CURRIE STREET,",
  addressLine2: "PALANAN, MAKATI CITY",
  addressFull: "2/F 5441 CURRIE STREET, PALANAN, MAKATI CITY",
  hours: "Monday to Friday, 8:00 AM to 5:00 PM",
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

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const publicChromeStyles = `
  .ltc-training-home { --green-950:#071f14; --green-800:#174a30; --footer-green:#082719; --gold-soft:#f4d484; min-height:100vh; overflow-x:hidden; font-family:"Inter",Arial,sans-serif; }
  .ltc-training-home * { box-sizing:border-box; }
  .ltc-container { width:min(1180px,92%); margin:auto; }
  .ltc-header { position:sticky; top:0; z-index:50; width:100%; background:var(--footer-green); border-bottom:1px solid rgba(255,255,255,.1); box-shadow:0 10px 34px rgba(7,31,20,.14); }
  .ltc-header .ltc-container { width:100%; max-width:none; margin:0; padding:0 32px; }
  .ltc-nav { min-height:76px; display:flex; justify-content:space-between; align-items:center; gap:24px; }
  .ltc-logo { display:flex; align-items:center; gap:13px; color:white; border:0; background:transparent; cursor:pointer; text-align:left; padding:0; }
  .ltc-logo-icon { width:42px; height:42px; border-radius:999px; background:white; object-fit:contain; box-shadow:0 0 0 5px rgba(255,255,255,.08),0 12px 24px rgba(0,0,0,.12); }
  .ltc-logo h1 { margin:0; color:white; font-size:18px; line-height:1; font-weight:900; text-transform:uppercase; letter-spacing:-.04em; }
  .ltc-logo p { margin:5px 0 0; color:rgba(255,255,255,.62); font-size:11px; line-height:1.2; }
  .ltc-desktop-nav { display:flex; align-items:center; gap:8px; margin-left:auto; }
  .ltc-nav-link { position:relative; border:0; background:transparent; color:rgba(255,255,255,.78); padding:27px 14px 25px; cursor:pointer; font-size:12px; font-weight:800; }
  .ltc-nav-link::after { content:""; position:absolute; left:14px; right:14px; bottom:19px; height:2px; border-radius:999px; background:var(--gold-soft); transform:scaleX(0); transition:.25s; }
  .ltc-nav-link:hover,.ltc-nav-link.active { color:white; }
  .ltc-nav-link:hover::after,.ltc-nav-link.active::after { transform:scaleX(1); }
  .ltc-profile-wrap { display:flex; align-items:center; }
  .ltc-sign-in-button { border:1px solid rgba(255,255,255,.22); border-radius:999px; padding:10px 18px; background:rgba(255,255,255,.08); }
  .ltc-sign-in-button::after { display:none; }
  .ltc-menu-button { display:none; width:44px; height:44px; border-radius:12px; border:1px solid rgba(255,255,255,.16); background:rgba(255,255,255,.08); color:white; cursor:pointer; }
  .ltc-menu-button svg { width:22px; height:22px; }
  .ltc-footer { width:100%; background:var(--footer-green); color:white; padding:30px 0 12px; }
  .ltc-footer .ltc-container { width:100%; max-width:none; padding-left:40px; padding-right:40px; }
  .ltc-footer-grid { display:grid; grid-template-columns:1.35fr .75fr 1.05fr 1fr .7fr; column-gap:clamp(28px,4vw,76px); row-gap:22px; padding-bottom:24px; border-bottom:1px solid rgba(255,255,255,.1); }
  .ltc-footer-brand { display:flex; align-items:center; gap:14px; width:100%; color:white; text-align:left; border:0; background:transparent; padding:0; cursor:pointer; }
  .ltc-footer-brand img { width:110px; height:auto; object-fit:contain; display:block; }
  .ltc-footer-brand-copy { min-width:0; display:flex; flex-direction:column; align-items:flex-start; gap:6px; }
  .ltc-footer-brand-title { margin:0; color:white; font-size:20px; line-height:1.2; font-weight:900; text-transform:uppercase; }
  .ltc-footer-brand-description { max-width:300px; margin:0!important; color:rgba(255,255,255,.72)!important; }
  .ltc-footer-column-title { margin:0 0 10px; color:var(--gold-soft); font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:.14em; }
  .ltc-footer p,.ltc-footer-link { display:block; margin:5px 0; color:rgba(255,255,255,.68); font-size:13px; line-height:1.55; text-decoration:none; }
  .ltc-footer-link { border:0; background:transparent; padding:0; cursor:pointer; text-align:left; }
  .ltc-footer-link:hover { color:white; text-decoration:underline; }
  .ltc-copyright { padding-top:14px; display:flex; justify-content:space-between; gap:12px; color:rgba(255,255,255,.52); font-size:12px; }
  .ltc-sidebar-overlay { position:fixed; inset:0; z-index:80; background:rgba(0,0,0,.42); }
  .ltc-sidebar-panel { position:absolute; right:0; top:0; height:100%; width:min(310px,86vw); background:white; box-shadow:-20px 0 60px rgba(0,0,0,.25); padding:20px; }
  .ltc-sidebar-top { display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(16,24,40,.1); padding-bottom:16px; margin-bottom:16px; }
  .ltc-sidebar-title { color:var(--green-950); font-weight:900; letter-spacing:.14em; font-size:12px; margin:0; }
  .ltc-sidebar-close { width:44px; height:44px; border-radius:12px; border:0; background:#f2f4f7; cursor:pointer; }
  .ltc-sidebar-link { display:block; width:100%; border:0; background:transparent; color:#101828; text-align:left; border-radius:14px; padding:13px 14px; font-weight:800; margin-bottom:8px; cursor:pointer; }
  .ltc-sidebar-link:hover,.ltc-sidebar-link.active { background:var(--green-800); color:white; }
  @media (max-width:900px) { .ltc-desktop-nav,.ltc-profile-wrap { display:none; } .ltc-menu-button { display:grid; place-items:center; } .ltc-footer-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
  @media (max-width:640px) { .ltc-header .ltc-container { padding:0 18px; } .ltc-logo h1 { font-size:15px; } .ltc-logo p { display:none; } .ltc-footer .ltc-container { padding-left:20px; padding-right:20px; } .ltc-footer-grid { grid-template-columns:1fr; } .ltc-copyright { flex-direction:column; } }
`;

export default function TrainingContactUs() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  const API_BASE = useMemo(() => {
    const raw = (
      import.meta.env.VITE_TRAINING_API_BASE ||
      import.meta.env.VITE_API_BASE ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000"
    ).replace(/\/+$/, "");

    if (raw.endsWith("/api/training")) return raw;
    if (raw.endsWith("/api/hotel")) return raw.replace(/\/hotel$/, "/training");
    if (raw.endsWith("/api")) return `${raw}/training`;
    return `${raw}/api/training`;
  }, []);

  const validateField = (name, value) => {
    const cleanValue = String(value || "").trim();

    if (name === "name") {
      if (!cleanValue) return "Name is required.";
      if (cleanValue.length < 2) return "Name must be at least 2 characters.";
      if (!/^[A-Za-zÑñ .'-]+$/.test(cleanValue)) {
        return "Name can only contain letters, spaces, apostrophes, periods, and hyphens.";
      }
    }

    if (name === "email") {
      if (!cleanValue) return "Email address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue)) {
        return "Please enter a valid email address.";
      }
    }

    if (name === "subject") {
      if (!cleanValue) return "Subject is required.";
      if (cleanValue.length < 3) return "Subject must be at least 3 characters.";
    }

    if (name === "message") {
      if (!cleanValue) return "Message is required.";
      if (cleanValue.length < 10) return "Message must be at least 10 characters.";
    }

    return "";
  };

  const errors = {
    name: validateField("name", formData.name),
    email: validateField("email", formData.email),
    subject: validateField("subject", formData.subject),
    message: validateField("message", formData.message),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus({ type: "", message: "" });
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTouched({ name: false, email: false, subject: false, message: false });
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });

    if (Object.values(errors).some(Boolean)) {
      setStatus({ type: "error", message: "Please fix the highlighted fields before sending." });
      return;
    }

    setIsSending(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(`${API_BASE}/contact-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Failed to send message.");

      resetForm();
      setStatus({ type: "success", message: "Your message was sent successfully." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Failed to send message." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="ltc-training-home">
      <style>{publicChromeStyles}</style>
      <style>{contactPageStyleFixes}</style>

      <TrainingPublicHeader active="contact" />

      <main>
        <TrainingPublicHero
          title="Contact"
          accent="Us"
          description="Reach our training and assessment team for inquiries and assistance."
        />

                <section className="ta-contact-section">
          <div className="ta-contact-grid">
            <article className="ta-contact-card">
              <p className="ta-contact-eyebrow" style={fontPoppins}>Contact Information</p>
              <h2 className="ta-contact-title" style={fontMontserrat}>Get in touch</h2>
              <p className="ta-contact-copy" style={fontPontano}>
                Reach the TAMSI team for enrollment questions, course information, requirements,
                scheduling, and other Training &amp; Assessment concerns.
              </p>

              <div className="ta-contact-list">
                <ContactItem icon={<LocationIcon />} label="Training Center">
                  <span>{TRAINING_CONTACT_INFO.addressFull}</span>
                </ContactItem>

                <ContactItem icon={<PhoneIcon />} label="Phone">
                  <span>{TRAINING_CONTACT_INFO.phone}</span>
                </ContactItem>

                <ContactItem icon={<MailIcon />} label="Email">
                  <span>{TRAINING_CONTACT_INFO.email1}</span>
                  <span>{TRAINING_CONTACT_INFO.email2}</span>
                </ContactItem>

                <ContactItem icon={<ClockIcon />} label="Office Hours">
                  <span>{TRAINING_CONTACT_INFO.hours}</span>
                </ContactItem>
              </div>
            </article>

            <section className="ta-contact-card" aria-labelledby="training-contact-form-title">
              <p className="ta-contact-eyebrow" style={fontPoppins}>Send a Message</p>
              <h2 id="training-contact-form-title" className="ta-contact-title" style={fontMontserrat}>
                How can we help?
              </h2>
              <p className="ta-contact-copy" style={fontPontano}>
                Complete the form below and our Training &amp; Assessment team will review your message.
              </p>

              <form onSubmit={handleSubmit} className="ta-contact-form" noValidate>
                <ContactField
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name ? errors.name : ""}
                  required
                />

                <ContactField
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email ? errors.email : ""}
                  required
                />

                <ContactField
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.subject ? errors.subject : ""}
                  required
                />

                <div className="ta-contact-field">
                  <label htmlFor="training-contact-message" className="ta-contact-label">
                    Message <span aria-hidden="true">*</span>
                  </label>

                  <textarea
                    id="training-contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={5}
                    required
                    aria-invalid={Boolean(touched.message && errors.message)}
                    aria-describedby={
                      touched.message && errors.message
                        ? "training-contact-message-error"
                        : undefined
                    }
                    className={`ta-contact-textarea ${
                      touched.message && errors.message ? "is-error" : ""
                    }`}
                  />

                  {touched.message && errors.message ? (
                    <p id="training-contact-message-error" className="ta-contact-error">
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                {status.message ? (
                  <div
                    role={status.type === "success" ? "status" : "alert"}
                    aria-live={status.type === "success" ? "polite" : "assertive"}
                    className={`ta-contact-status ${
                      status.type === "success" ? "success" : "error"
                    }`}
                  >
                    {status.message}
                  </div>
                ) : null}

                <div className="ta-contact-actions">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="ta-contact-button primary"
                  >
                    {isSending ? "Sending..." : "Submit"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSending}
                    className="ta-contact-button secondary"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </section>
          </div>
        </section>

        <section className="ta-map-section" aria-labelledby="training-map-title">
          <div className="ta-map-card">
            <div className="ta-map-header">
              <p className="ta-contact-eyebrow" style={fontPoppins}>Visit TAMSI</p>
              <h2 id="training-map-title" className="ta-map-title" style={fontMontserrat}>
                Our Location Guide Map
              </h2>
              <p className="ta-map-subtitle" style={fontPontano}>
                2/F 5441 Curie Street, Palanan, Makati City
              </p>
            </div>

            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.6479398832357!2d120.99862151086919!3d14.562114277958653!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c991472da61b%3A0x3a4930acd0ee798d!2s5441%20Curie%20St%2C%20Makati%20City%2C%201235%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1774615488486!5m2!1sen!2sph"
              title="TAMSI Location Guide Map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="ta-map-frame"
            />
          </div>
        </section>
      </main>

      <TrainingPublicFooter />

      <TrainingFloatingHomeButton />
      <TrainingChatbot />
    </div>
  );
}

function Header({ goTo, onOpenMenu }) {
  return (
    <header className="ltc-header">
      <div className="ltc-container">
        <div className="ltc-nav">
          <button type="button" onClick={() => goTo(TRAINING_HOME_ROUTE)} className="ltc-logo" aria-label="Training and Assessment Home">
            <img src={HEADER_LOGO_IMAGE} alt="TAMSI Logo" width="42" height="42" decoding="async" className="ltc-logo-icon" />
            <div>
              <h1 style={fontMontserrat}>TRAINING &amp; ASSESSMENT</h1>
              <p style={fontPontano}>Training and assessment portal.</p>
            </div>
          </button>

          <nav className="ltc-desktop-nav" aria-label="Training navigation">
            {TRAINING_NAV_ITEMS.map((item) => (
              <HeaderNavButton
                key={item.key}
                label={item.label}
                active={item.key === "contact"}
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

          <button type="button" onClick={onOpenMenu} className="ltc-menu-button" aria-label="Open menu">
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
    <footer className="ltc-footer" aria-label="Training and Assessment footer">
      <div className="ltc-container ltc-footer-grid">
        <div>
          <button type="button" onClick={() => goTo(TRAINING_HOME_ROUTE)} className="ltc-footer-brand">
            <img src={FOOTER_LOGO_IMAGE} alt="Training Lumispire Logo" width="110" loading="lazy" decoding="async" />
            <div className="ltc-footer-brand-copy">
              <span className="ltc-footer-brand-title" style={fontMontserrat}>TRAINING &amp; ASSESSMENT</span>
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
      <div className="ltc-footer-column-title" style={fontMontserrat}>{title}</div>
      <div>{children}</div>
    </div>
  );
}

function FooterLink({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="ltc-footer-link" style={fontPontano}>
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
      <button type="button" aria-label="Close menu" style={{ position: "absolute", inset: 0, border: 0, background: "transparent", padding: 0 }} onClick={onClose} />
      <div className="ltc-sidebar-panel">
        <div className="ltc-sidebar-top">
          <p className="ltc-sidebar-title" style={fontPoppins}>MENU</p>
          <button type="button" onClick={onClose} className="ltc-sidebar-close" aria-label="Close menu">✕</button>
        </div>

        {TRAINING_NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => goTo(item.path)}
            className={`ltc-sidebar-link ${item.key === "contact" ? "active" : ""}`}
            style={fontPoppins}
          >
            {item.label}
          </button>
        ))}

        <button type="button" onClick={() => goTo(TRAINING_LOGIN_ROUTE)} className="ltc-sidebar-link" style={fontPoppins}>
          Sign In
        </button>
      </div>
    </div>
  );
}

const contactPageStyleFixes = `
  .ta-contact-section {
    background:
      radial-gradient(circle at 12% 0%, rgba(215,168,77,.10), transparent 28%),
      radial-gradient(circle at 92% 10%, rgba(35,95,62,.08), transparent 26%),
      #f6f8f4;
    padding: 72px 0;
  }

  .ta-contact-grid {
    width: min(1180px, 92%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
    gap: 26px;
    align-items: stretch;
  }

  .ta-contact-card {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    border: 1px solid rgba(16,24,40,.07);
    background: rgba(255,255,255,.96);
    box-shadow: 0 18px 46px rgba(8,39,25,.10);
    padding: 32px;
  }

  .ta-contact-card::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 5px;
    background: linear-gradient(90deg,#235f3e,#d7a84d);
  }

  .ta-contact-eyebrow {
    margin: 0;
    color: #45674b;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .18em;
    text-transform: uppercase;
  }

  .ta-contact-title {
    margin: 8px 0 0;
    color: #071f14;
    font-size: clamp(28px, 3vw, 38px);
    line-height: 1.08;
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .ta-contact-copy {
    margin: 12px 0 0;
    max-width: 620px;
    color: #53655a;
    font-size: 14px;
    line-height: 1.7;
    font-weight: 650;
  }

  .ta-contact-list {
    margin-top: 28px;
    display: grid;
    gap: 14px;
  }

  .ta-contact-item {
    display: grid;
    grid-template-columns: 48px minmax(0,1fr);
    gap: 14px;
    align-items: center;
    min-height: 76px;
    border-radius: 20px;
    border: 1px solid rgba(35,95,62,.10);
    background: #f8faf7;
    padding: 14px 16px;
  }

  .ta-contact-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 16px;
    background: rgba(35,95,62,.09);
    color: #235f3e;
  }

  .ta-contact-item-label {
    margin: 0 0 3px;
    color: #6a766d;
    font-size: 10px;
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: .15em;
    text-transform: uppercase;
  }

  .ta-contact-item-value {
    display: grid;
    gap: 2px;
    color: #173d27;
    font-size: 14px;
    line-height: 1.45;
    font-weight: 800;
    overflow-wrap: anywhere;
  }

  .ta-contact-form {
    margin-top: 26px;
    display: grid;
    gap: 17px;
  }

  .ta-contact-field {
    display: grid;
    gap: 7px;
  }

  .ta-contact-label {
    color: #264d33;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 900;
    letter-spacing: .04em;
  }

  .ta-contact-input,
  .ta-contact-textarea {
    width: 100%;
    border: 1px solid rgba(35,95,62,.18);
    background: #f8faf7;
    color: #101828;
    border-radius: 16px;
    outline: none;
    font: inherit;
    font-size: 14px;
    font-weight: 650;
    transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
  }

  .ta-contact-input {
    min-height: 50px;
    padding: 0 16px;
  }

  .ta-contact-textarea {
    min-height: 150px;
    resize: vertical;
    padding: 14px 16px;
    line-height: 1.55;
  }

  .ta-contact-input:focus,
  .ta-contact-textarea:focus {
    border-color: #235f3e;
    background: white;
    box-shadow: 0 0 0 4px rgba(35,95,62,.10);
  }

  .ta-contact-input.is-error,
  .ta-contact-textarea.is-error {
    border-color: #b42318;
    background: #fff8f7;
  }

  .ta-contact-error {
    margin: 0;
    color: #b42318;
    font-size: 12px;
    line-height: 1.4;
    font-weight: 800;
  }

  .ta-contact-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding-top: 2px;
  }

  .ta-contact-button {
    min-height: 48px;
    border-radius: 999px;
    padding: 0 22px;
    font-size: 12px;
    line-height: 1;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform .2s ease, opacity .2s ease, background .2s ease;
  }

  .ta-contact-button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .ta-contact-button:disabled {
    cursor: not-allowed;
    opacity: .6;
  }

  .ta-contact-button.primary {
    border: 0;
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 12px 28px rgba(215,168,77,.22);
  }

  .ta-contact-button.secondary {
    border: 1px solid rgba(35,95,62,.22);
    color: #235f3e;
    background: white;
  }

  .ta-contact-status {
    border-radius: 16px;
    padding: 12px 14px;
    font-size: 13px;
    line-height: 1.45;
    font-weight: 800;
  }

  .ta-contact-status.success {
    border: 1px solid rgba(16,185,129,.22);
    background: #effbf5;
    color: #047857;
  }

  .ta-contact-status.error {
    border: 1px solid rgba(239,68,68,.22);
    background: #fff4f4;
    color: #b42318;
  }

  .ta-map-section {
    background: #f6f8f4;
    padding: 0 0 76px;
  }

  .ta-map-card {
    width: min(1180px,92%);
    margin: 0 auto;
    overflow: hidden;
    border-radius: 28px;
    border: 1px solid rgba(16,24,40,.07);
    background: white;
    box-shadow: 0 18px 46px rgba(8,39,25,.10);
  }

  .ta-map-header {
    padding: 26px 28px 22px;
    border-bottom: 1px solid rgba(16,24,40,.07);
    background: linear-gradient(135deg,#f8fbf9,#eef3e9);
  }

  .ta-map-title {
    margin: 0;
    color: #071f14;
    font-size: clamp(24px,2.5vw,34px);
    line-height: 1.1;
    font-weight: 900;
    letter-spacing: -.035em;
  }

  .ta-map-subtitle {
    margin: 8px 0 0;
    color: #53655a;
    font-size: 13px;
    font-weight: 700;
  }

  .ta-map-frame {
    display: block;
    width: 100%;
    height: 420px;
    border: 0;
  }

  @media (max-width: 900px) {
    .ta-contact-section { padding: 56px 0; }
    .ta-contact-grid { grid-template-columns: 1fr; }
    .ta-map-section { padding-bottom: 58px; }
  }

  @media (max-width: 600px) {
    .ta-contact-section { padding: 42px 0; }
    .ta-contact-card { padding: 26px 20px; border-radius: 24px; }
    .ta-contact-actions { grid-template-columns: 1fr; }
    .ta-map-card { border-radius: 24px; }
    .ta-map-frame { height: 360px; }
  }
`;

function FloatingHomeIconButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Back to Home"
      aria-label="Back to Home"
      className="group fixed bottom-28 right-6 z-[80] flex h-[74px] w-[74px] items-center justify-center rounded-full border-2 border-white/80 bg-[#2e5038] text-white shadow-2xl transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#21442d] focus:outline-none focus:ring-4 focus:ring-white/30"
    >
      <span className="pointer-events-none absolute right-[86px] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-[#123a20] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white shadow-xl group-hover:block">
        Back to Home
      </span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-9 w-9"
      >
        <path d="m3 10.5 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    </button>
  );
}

function ContactField({ label, type = "text", name, value, onChange, onBlur, error = "", required = false }) {
  const inputId = `training-contact-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="ta-contact-field">
      <label htmlFor={inputId} className="ta-contact-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>

      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`ta-contact-input ${error ? "is-error" : ""}`}
      />

      {error ? (
        <p id={errorId} className="ta-contact-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ContactItem({ icon, label, children }) {
  return (
    <div className="ta-contact-item">
      <div className="ta-contact-icon" aria-hidden="true">
        {icon}
      </div>

      <div>
        <p className="ta-contact-item-label" style={fontPoppins}>{label}</p>
        <div className="ta-contact-item-value" style={fontPontano}>
          {children}
        </div>
      </div>
    </div>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M12 21C12 21 18 15.6 18 10.5C18 7.186 15.314 4.5 12 4.5C8.686 4.5 6 7.186 6 10.5C6 15.6 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M6.6 10.8C8.2 13.9 10.7 16.4 13.8 18L16.2 15.6C16.5 15.3 17 15.2 17.4 15.3C18.7 15.7 20.1 16 21.5 16C22.1 16 22.5 16.4 22.5 17V21C22.5 21.6 22.1 22 21.5 22C10.7 22 2 13.3 2 2.5C2 1.9 2.4 1.5 3 1.5H7C7.6 1.5 8 1.9 8 2.5C8 3.9 8.3 5.3 8.7 6.6C8.8 7 8.7 7.5 8.4 7.8L6.6 10.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 7L12 13L20 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7V12L15.5 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

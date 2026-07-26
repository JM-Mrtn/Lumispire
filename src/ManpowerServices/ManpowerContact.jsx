import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGO_IMAGE = "/ManpowerLogo.png";
const HERO_IMAGE = "/ManpowerBanner.png";
const MANPOWER_HOME_ROUTE = "/manpower-services";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Inter', sans-serif" };
const fontPoppins = { fontFamily: "'Inter', sans-serif" };

const mapUrl =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d965.431002803793!2d121.00279826952298!3d14.55776879716882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90045cecd85%3A0xffb8e8e0364e81e7!2sLTC%20Properties%20and%20Services%20Group%20of%20Companies%20OPC!5e0!3m2!1sen!2sph!4v1775494820080!5m2!1sen!2sph";

const navLinks = [
  { label: "HOME", to: MANPOWER_HOME_ROUTE },
  { label: "JOB OFFER", to: "/manpower-positions" },
  { label: "REQUIREMENTS", to: "/manpower-requirements" },
  { label: "CONTACT", to: "/manpower-contact" },
  { label: "FAQS", to: "/manpower-faqs" },
];

const RevealOnScroll = ({ children, className = "", delay = 0, y = 18 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
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
};

function HeaderNavLink({ to, children, active = false }) {
  return (
    <Link to={to} className={`mp-nav-link ${active ? "active" : ""}`}>
      {children}
    </Link>
  );
}

const FooterLink = ({ children, to }) => (
  <Link to={to} className="mp-footer-link">
    {children}
  </Link>
);

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

const ContactIcon = ({ type }) => {
  if (type === "location") {
    return (
      <svg viewBox="0 0 24 24" className="mp-svg-icon">
        <path d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (type === "mail") {
    return (
      <svg viewBox="0 0 24 24" className="mp-svg-icon">
        <path d="M4 6h16v12H4V6z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (type === "phone") {
    return (
      <svg viewBox="0 0 24 24" className="mp-svg-icon">
        <path d="M7.8 4.8c.6-.6 1.6-.7 2.3-.2l1.9 1.4c.7.5 1 1.4.6 2.2l-.8 1.9c-.2.4-.1.9.2 1.3l.9 1.2c.3.3.8.5 1.3.3l2-.6c.8-.2 1.7.1 2.2.8l1.3 1.8c.5.7.4 1.7-.3 2.3l-1 .9c-1.4 1.2-3.2 1.5-4.9.8-2.7-1.1-5.2-3.4-7.6-6.8C4.7 10 4.2 8 5.2 6.5l2.6-1.7Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="mp-svg-icon">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
};

const ContactInfoItem = ({ icon, title, children }) => (
  <div className="mp-contact-item">
    <div className="mp-contact-icon">
      <ContactIcon type={icon} />
    </div>

    <div className="mp-contact-item-content">
      <h4 style={fontMontserrat}>{title}</h4>
      <div className="mp-contact-item-text" style={fontPontano}>
        {children}
      </div>
    </div>
  </div>
);


function FloatingHomeIconButton({ onClick }) {
  return (
    <>
      <style>{`
        .ltc-floating-home-button {
          position: fixed;
          right: 24px;
          bottom: 104px;
          z-index: 10000;
          width: 52px;
          height: 52px;
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

        .ltc-floating-home-button svg {
          width: 25px;
          height: 25px;
        }

        @media (max-width: 640px) {
          .ltc-floating-home-button {
            right: 18px;
            bottom: 96px;
            width: 48px;
            height: 48px;
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m3 10.5 9-7 9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      </button>
    </>
  );
}

export default function ManpowerContactPage({ onSubmitMessage }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    success: "",
    error: "",
  });

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  function updateField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setStatus({ loading: false, success: "", error: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      setStatus({ loading: false, success: "", error: "Please complete all fields." });
      return;
    }

    try {
      setStatus({ loading: true, success: "", error: "" });

      if (typeof onSubmitMessage === "function") {
        await onSubmitMessage(payload);
      }

      setForm({ name: "", email: "", subject: "", message: "" });
      setStatus({ loading: false, success: "Message sent successfully.", error: "" });
    } catch (error) {
      setStatus({
        loading: false,
        success: "",
        error: error?.message || "Failed to send message.",
      });
    }
  }

  return (
    <div className="mp-contact-page" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap");

        .mp-contact-page {
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

        .mp-contact-page * { box-sizing: border-box; }

        .mp-container { width: min(1180px, 92%); margin: auto; }

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
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(145deg,#fff,#e3f4ea);
          box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
          object-fit: cover;
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

        .mp-desktop-nav { display: flex; align-items: center; gap: 8px; }

        .mp-nav-link {
          color: rgba(255,255,255,.78);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 10px 14px;
          border-radius: 999px;
          transition: .25s var(--ease);
          text-decoration: none;
        }

        .mp-nav-link:hover,
        .mp-nav-link.active {
          color: white;
          background: rgba(255,255,255,.13);
          transform: translateY(-1px);
        }

        .mp-sign-in {
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.22);
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

        .mp-menu-button svg { width: 24px; height: 24px; }

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
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 0;
          background: #f2f4f7;
          color: #101828;
          cursor: pointer;
          font-weight: 900;
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
        .mp-sidebar-link.active { background: var(--green-800); color: white; }

        .mp-contact-hero {
          position: relative;
          overflow: hidden;
          color: white;
          isolation: isolate;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
          padding: 82px 0 78px;
        }

        .mp-contact-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -3;
          background:
            linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.88) 42%, rgba(12,64,39,.76) 100%),
            var(--hero-image) center center / cover no-repeat;
          background-blend-mode: multiply;
          opacity: .96;
          transform: scale(1.02);
        }

        .mp-contact-hero::after {
          content: "";
          position: absolute;
          inset: -16% -10% -24% -10%;
          z-index: -2;
          background:
            radial-gradient(circle at 16% 82%, rgba(19,120,72,.36), transparent 24%),
            radial-gradient(circle at 36% 92%, rgba(7,76,47,.46), transparent 30%),
            radial-gradient(circle at 72% 18%, rgba(28,108,68,.28), transparent 30%),
            radial-gradient(circle at 88% 44%, rgba(244,212,132,.14), transparent 28%),
            radial-gradient(circle at 90% 84%, rgba(22,108,66,.30), transparent 26%),
            linear-gradient(135deg, rgba(3,24,15,.34), rgba(8,56,34,.08));
          filter: blur(30px);
          pointer-events: none;
        }

        .mp-contact-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .mp-contact-hero h2 {
          margin: 0;
          color: white;
          font-size: clamp(34px, 5vw, 58px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.055em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .mp-contact-hero h2 span { color: var(--gold-soft); }

        .mp-contact-hero p {
          max-width: 760px;
          margin: 18px auto 0;
          color: rgba(255,255,255,.80);
          font-size: 17px;
          line-height: 1.8;
        }

        .mp-section { padding: 84px 0; }

        .mp-section-title { text-align: center; margin-bottom: 42px; }

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

        .mp-section-title p { max-width: 760px; margin: 15px auto 0; color: var(--muted); }

        .mp-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .mp-summary-card,
        .mp-contact-card,
        .mp-map-card {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(18px);
          transition: .38s var(--ease);
        }

        .mp-summary-card::before,
        .mp-contact-card::before,
        .mp-map-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          z-index: 3;
        }

        .mp-summary-card:hover,
        .mp-contact-card:hover,
        .mp-map-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(215,168,77,.45);
        }

        .mp-summary-card { padding: 26px; min-height: 140px; }

        .mp-summary-card h4 {
          margin: 0;
          color: var(--green-950);
          font-size: 18px;
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: -.035em;
        }

        .mp-summary-card p {
          margin: 10px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.65;
        }

        .mp-main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: stretch;
        }

        .mp-contact-card { min-height: 520px; padding: 34px; }

        .mp-contact-card h3,
        .mp-map-card h3 {
          margin: 0;
          color: var(--green-950);
          font-size: clamp(26px, 3vw, 38px);
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -.055em;
        }

        .mp-contact-card .eyebrow,
        .mp-map-card .eyebrow {
          margin: 0 0 10px;
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .mp-card-description {
          margin: 14px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .mp-contact-list { display: grid; gap: 14px; margin-top: 24px; }

        .mp-contact-item {
          display: flex;
          gap: 14px;
          padding: 18px;
          border-radius: 20px;
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(35,95,62,.12);
          transition: .3s var(--ease);
        }

        .mp-contact-item:hover {
          transform: translateY(-4px);
          background: white;
          box-shadow: 0 18px 36px rgba(8,39,25,.1);
        }

        .mp-contact-icon {
          flex: 0 0 auto;
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          color: white;
          background: linear-gradient(160deg, var(--footer-green), var(--green-800));
          box-shadow: 0 12px 24px rgba(8,39,25,.14);
        }

        .mp-svg-icon {
          width: 22px;
          height: 22px;
          stroke: currentColor;
          stroke-width: 1.9;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .mp-contact-item-content h4 {
          margin: 0;
          color: var(--green-950);
          font-size: 15px;
          line-height: 1.25;
          font-weight: 900;
          letter-spacing: -.02em;
        }

        .mp-contact-item-text {
          margin-top: 6px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.55;
          overflow-wrap: anywhere;
        }

        .mp-contact-item-text p { margin: 0; }
        .mp-contact-item-text p + p { margin-top: 3px; }

        .mp-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 24px;
        }

        .mp-field { display: flex; flex-direction: column; gap: 8px; }
        .mp-field.full { grid-column: 1 / -1; margin-top: 16px; }

        .mp-field label { color: var(--green-800); font-size: 13px; font-weight: 900; }

        .mp-field input,
        .mp-field textarea {
          width: 100%;
          border: 1px solid rgba(35,95,62,.18);
          background: rgba(248,250,247,.88);
          color: var(--dark);
          border-radius: 18px;
          padding: 13px 16px;
          font-size: 14px;
          outline: none;
          transition: .25s var(--ease);
          font-family: inherit;
        }

        .mp-field textarea { min-height: 180px; resize: none; line-height: 1.65; }

        .mp-field input:focus,
        .mp-field textarea:focus {
          border-color: var(--green-700);
          background: white;
          box-shadow: 0 0 0 4px rgba(35,95,62,.1);
        }

        .mp-status-error,
        .mp-status-success {
          margin-top: 16px;
          border-radius: 18px;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 800;
        }

        .mp-status-error { border: 1px solid #fecaca; background: #fef2f2; color: #991b1b; }
        .mp-status-success { border: 1px solid #bbf7d0; background: #f0fdf4; color: #166534; }

        .mp-form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          margin-top: 18px;
        }

        .mp-form-footer p { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.5; }

        .mp-submit-button,
        .mp-map-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 24px;
          border-radius: 999px;
          border: 0;
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.28);
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          text-decoration: none;
          transition: .28s var(--ease);
          white-space: nowrap;
        }

        .mp-submit-button:hover,
        .mp-map-button:hover { transform: translateY(-3px); }
        .mp-submit-button:disabled { cursor: not-allowed; opacity: .72; transform: none; }

        .mp-map-card { margin-top: 24px; padding: 34px; }

        .mp-map-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }

        .mp-map-frame {
          height: 360px;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(35,95,62,.16);
          background: rgba(248,250,247,.9);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.55);
        }

        .mp-map-frame iframe { width: 100%; height: 100%; border: 0; display: block; }

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
          grid-template-columns: 1.5fr .9fr 1fr 1.65fr .9fr;
          gap: 22px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .mp-footer h4 {
          color: white;
          font-weight: 900;
          font-size: 18px;
          line-height: 1.2;
          margin: 0 0 10px;
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
          text-decoration: none;
        }

        .mp-footer-link:hover { color: white; text-decoration: underline; }

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

        @keyframes mpAppleReveal {
          from { opacity: 0; transform: translateY(34px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .mp-contact-page *, .mp-contact-page *::before, .mp-contact-page *::after {
            animation-duration: .001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .001ms !important;
          }
        }

        @media (max-width: 1100px) {
          .mp-footer-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 900px) {
          .mp-header .mp-container { padding-left: 22px; padding-right: 22px; }
          .mp-nav { min-height: auto; padding: 18px 0; }
          .mp-desktop-nav { display: none; }
          .mp-menu-button { display: grid; place-items: center; }
          .mp-contact-hero { padding: 72px 0; }
          .mp-contact-hero h2 { font-size: clamp(34px, 12vw, 52px); }
          .mp-contact-hero p { font-size: 15px; }
          .mp-summary-grid, .mp-main-grid { grid-template-columns: 1fr; }
          .mp-contact-card { min-height: auto; }
          .mp-map-header { flex-direction: column; align-items: flex-start; }
          .mp-footer { padding: 28px 0 12px; }
          .mp-footer-grid { grid-template-columns: 1fr; gap: 18px; padding-bottom: 22px; }
          .mp-footer .mp-container { padding-left: 22px; padding-right: 22px; }
          .mp-copyright { flex-direction: column; }
        }

        @media (max-width: 600px) {
          .mp-header .mp-container { padding-left: 16px; padding-right: 16px; }
          .mp-logo h1 { font-size: 14px; }
          .mp-logo p { font-size: 10px; }
          .mp-section { padding: 62px 0; }
          .mp-contact-card, .mp-map-card { padding: 24px; }
          .mp-form-grid { grid-template-columns: 1fr; }
          .mp-form-footer { flex-direction: column; align-items: stretch; }
          .mp-submit-button, .mp-map-button { width: 100%; }
          .mp-map-frame { height: 320px; }
          .mp-footer .mp-container { padding-left: 16px; padding-right: 16px; }
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
          width: 40px !important;
          height: 40px !important;
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
        .mp-faq-card,
        .mp-help-card {
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

      `}</style>

      <header className="mp-header">
        <div className="mp-container mp-nav">
          <Link to={MANPOWER_HOME_ROUTE} className="mp-logo">
            <img src={LOGO_IMAGE} alt="Manpower Logo" className="mp-logo-icon" />
            <div>
              <h1 style={fontMontserrat}>LTC MANPOWER SERVICES</h1>
              <p style={fontPontano}>Professional staffing and workforce solutions.</p>
            </div>
          </Link>

          <nav className="mp-desktop-nav" style={fontPoppins}>
            <HeaderNavLink to={MANPOWER_HOME_ROUTE}>Home</HeaderNavLink>
            <HeaderNavLink to="/manpower-positions">Job Offer</HeaderNavLink>
            <HeaderNavLink to="/manpower-requirements">Requirements</HeaderNavLink>
            <HeaderNavLink to="/manpower-contact" active>Contact</HeaderNavLink>
            <HeaderNavLink to="/manpower-faqs">FAQs</HeaderNavLink>
            <Link to="/manpower-employee-login" className="mp-nav-link mp-sign-in">Sign In</Link>
          </nav>

          <button
            onClick={() => setMobileOpen(true)}
            className="mp-menu-button"
            aria-label="Open menu"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="mp-sidebar-overlay">
          <div style={{ position: "absolute", inset: 0 }} onClick={() => setMobileOpen(false)} />
          <aside className="mp-sidebar-panel">
            <div className="mp-sidebar-top">
              <p className="mp-sidebar-title" style={fontPoppins}>MENU</p>
              <button onClick={() => setMobileOpen(false)} className="mp-sidebar-close" aria-label="Close menu" type="button">
                ✕
              </button>
            </div>

            <div style={fontPoppins}>
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => goTo(link.to)}
                  className={`mp-sidebar-link ${link.to === "/manpower-contact" ? "active" : ""}`}
                >
                  {link.label}
                </button>
              ))}
              <button type="button" onClick={() => goTo("/manpower-employee-login")} className="mp-sidebar-link">
                SIGN IN
              </button>
            </div>
          </aside>
        </div>
      )}

      <main>
        <section
          className="mp-contact-hero"
          style={{ "--hero-image": `url('${HERO_IMAGE}')` }}
        >
          <div className="mp-container mp-contact-hero-content">
            <RevealOnScroll>
              <h2 style={fontMontserrat}>
                Contact <span>Manpower</span>
              </h2>
              <p style={fontPontano}>
                Reach out to LTC Manpower Services for inquiries, applications, requirements, and employment concerns.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        <section className="mp-section">
          <div className="mp-container">
            <RevealOnScroll className="mp-section-title">
              <span style={fontPoppins}>Let&apos;s Connect</span>
              <h3 style={fontMontserrat}>We are ready to assist you</h3>
              <p style={fontPontano}>
                Send us your message or visit our office location for manpower applications, requirements, and staffing support.
              </p>
            </RevealOnScroll>

            <div className="mp-summary-grid">
              <RevealOnScroll delay={60}>
                <div className="mp-summary-card">
                  <h4 style={fontMontserrat}>Main Office</h4>
                  <p style={fontPontano}>2/F 5441 Currie Street, Palanan, Makati City</p>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={120}>
                <div className="mp-summary-card">
                  <h4 style={fontMontserrat}>Business Hours</h4>
                  <p style={fontPontano}>Monday - Thursday, 8:00 AM - 5:00 PM</p>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={180}>
                <div className="mp-summary-card">
                  <h4 style={fontMontserrat}>Support</h4>
                  <p style={fontPontano}>Email or call us for manpower service inquiries.</p>
                </div>
              </RevealOnScroll>
            </div>

            <div className="mp-main-grid">
              <RevealOnScroll delay={80}>
                <section className="mp-contact-card">
                  <p className="eyebrow" style={fontMontserrat}>Contact Information</p>
                  <h3 style={fontMontserrat}>Get in Touch</h3>
                  <p className="mp-card-description" style={fontPontano}>
                    Contact our manpower support team using the details below for applications, requirements, and workforce solutions.
                  </p>

                  <div className="mp-contact-list">
                    <ContactInfoItem icon="location" title="Office Address">
                      <p>2/F 5441 Currie Street, Palanan, Makati City</p>
                    </ContactInfoItem>

                    <ContactInfoItem icon="phone" title="Phone Numbers">
                      <p><a href="tel:+639516281271">+639516281271</a></p>
            <p><a href="tel:+639959808051">+639959808051</a></p>
                    </ContactInfoItem>

                    <ContactInfoItem icon="mail" title="Email Contacts">
                      <p><a href="mailto:ltc.tamsi@gmail.com">ltc.tamsi@gmail.com</a></p>
                      <p><a href="mailto:lorengladius@ltcmultiservices.com">lorengladius@ltcmultiservices.com</a></p>
                    </ContactInfoItem>

                    <ContactInfoItem icon="time" title="Operating Hours">
                      <p>Monday - Thursday | 8:00 AM - 5:00 PM</p>
                    </ContactInfoItem>
                  </div>
                </section>
              </RevealOnScroll>

              <RevealOnScroll delay={140}>
                <section className="mp-contact-card">
                  <form onSubmit={handleSubmit}>
                    <p className="eyebrow" style={fontMontserrat}>Message Form</p>
                    <h3 style={fontMontserrat}>Send Us a Message</h3>
                    <p className="mp-card-description" style={fontPontano}>
                      Fill out the form below and our manpower team will get back to you as soon as possible.
                    </p>

                    <div className="mp-form-grid">
                      <div className="mp-field">
                        <label htmlFor="name" style={fontMontserrat}>Your Name</label>
                        <input
                          id="name"
                          type="text"
                          value={form.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="mp-field">
                        <label htmlFor="email" style={fontMontserrat}>Email Address</label>
                        <input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    <div className="mp-field full">
                      <label htmlFor="subject" style={fontMontserrat}>Subject</label>
                      <input
                        id="subject"
                        type="text"
                        value={form.subject}
                        onChange={(e) => updateField("subject", e.target.value)}
                        placeholder="Enter your message subject"
                      />
                    </div>

                    <div className="mp-field full">
                      <label htmlFor="message" style={fontMontserrat}>Message</label>
                      <textarea
                        id="message"
                        rows={4}
                        value={form.message}
                        onChange={(e) => updateField("message", e.target.value)}
                        placeholder="How can we help you?"
                      />
                    </div>

                    {status.error ? <div className="mp-status-error">{status.error}</div> : null}
                    {status.success ? <div className="mp-status-success">{status.success}</div> : null}

                    <div className="mp-form-footer">
                      <p style={fontPontano}>Please make sure your contact details are correct.</p>
                      <button type="submit" disabled={status.loading} className="mp-submit-button" style={fontMontserrat}>
                        {status.loading ? "Sending..." : "Submit Message"}
                      </button>
                    </div>
                  </form>
                </section>
              </RevealOnScroll>
            </div>

            <RevealOnScroll delay={160}>
              <section className="mp-map-card">
                <div className="mp-map-header">
                  <div>
                    <p className="eyebrow" style={fontMontserrat}>Location</p>
                    <h3 style={fontMontserrat}>Our Location Guide Map</h3>
                    <p className="mp-card-description" style={fontPontano}>
                      2/F 5441 Currie Street, Palanan, Makati City.
                    </p>
                  </div>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=2%2FF%205441%20Currie%20Street%20Palanan%20Makati%20City"
                    target="_blank"
                    rel="noreferrer"
                    className="mp-map-button"
                    style={fontMontserrat}
                  >
                    Open Map
                  </a>
                </div>

                <div className="mp-map-frame">
                  <iframe
                    title="LTC Manpower Location Map"
                    src={mapUrl}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </section>
            </RevealOnScroll>
          </div>
        </section>
      </main>

      <footer className="mp-footer">
        <div className="mp-container mp-footer-grid">
          <div>
            <Link to={MANPOWER_HOME_ROUTE} className="mp-logo">
              <img src={LOGO_IMAGE} alt="Manpower Logo" className="mp-logo-icon" />
              <div>
                <h4 style={fontMontserrat}>LTC Manpower</h4>
                <p style={fontPontano}>Professional staffing and workforce support solutions.</p>
              </div>
            </Link>
          </div>

          <FooterColumn title="Menu">
            <FooterLink to={MANPOWER_HOME_ROUTE}>Home</FooterLink>
            <FooterLink to="/manpower-positions">Job Offer</FooterLink>
            <FooterLink to="/manpower-requirements">Requirements</FooterLink>
            <FooterLink to="/manpower-employee-login">Profile</FooterLink>
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

      <FloatingHomeIconButton onClick={() => navigate("/")} />
    </div>
  );
}

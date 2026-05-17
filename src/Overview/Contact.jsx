import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";

const LOGO = "/LTCLogo.jpg";
const BANNER_SRC = "/LTCBanner.png";
const CONTACT_ROUTE = "/contact";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const mapUrl =
  "https://www.google.com/maps?q=5411%20Light%20Tower%20Center%20Curie%20Street%20Palanan%20Makati%20City&output=embed";

const navLinks = [
  { label: "HOME", to: "/" },
  { label: "ABOUT US", to: "/about-us" },
  { label: "TEAM", to: "/team" },
  { label: "CONTACT", to: CONTACT_ROUTE },
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
};

const ContactIcon = ({ type }) => {
  if (type === "location") {
    return (
      <svg viewBox="0 0 24 24" className="ltc-svg-icon">
        <path d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (type === "mail") {
    return (
      <svg viewBox="0 0 24 24" className="ltc-svg-icon">
        <path d="M4 6h16v12H4V6z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="ltc-svg-icon">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
};

const ContactInfoItem = ({ icon, title, children }) => (
  <div className="ltc-contact-item">
    <div className="ltc-contact-icon">
      <ContactIcon type={icon} />
    </div>

    <div className="ltc-contact-item-content">
      <h4 style={fontMontserrat}>{title}</h4>

      <div className="ltc-contact-item-text" style={fontPontano}>
        {children}
      </div>
    </div>
  </div>
);

const FooterLink = ({ children, onClick }) => (
  <li>
    <button type="button" onClick={onClick} className="ltc-footer-link">
      {children}
    </button>
  </li>
);

const Contact = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const goTo = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="ltc-contact-page" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .ltc-contact-page {
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

        .ltc-contact-page * {
          box-sizing: border-box;
        }

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
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(145deg,#fff,#e3f4ea);
          color: var(--green-800);
          font-weight: 900;
          box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
          object-fit: cover;
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
        }

        .ltc-nav-link:hover,
        .ltc-nav-link.active {
          color: white;
          background: rgba(255,255,255,.13);
          transform: translateY(-1px);
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

        .ltc-menu-button svg {
          width: 24px;
          height: 24px;
        }

        .ltc-sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(0,0,0,.42);
        }

        .ltc-sidebar-panel {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: min(310px, 86vw);
          background: white;
          box-shadow: -20px 0 60px rgba(0,0,0,.25);
          padding: 20px;
        }

        .ltc-sidebar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(16,24,40,.1);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .ltc-sidebar-title {
          color: var(--green-950);
          font-weight: 900;
          letter-spacing: .14em;
          font-size: 12px;
          margin: 0;
        }

        .ltc-sidebar-close {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 0;
          background: #f2f4f7;
          color: #101828;
          cursor: pointer;
        }

        .ltc-sidebar-close svg {
          width: 22px;
          height: 22px;
          margin: auto;
        }

        .ltc-sidebar-link {
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

        .ltc-sidebar-link:hover,
        .ltc-sidebar-link.active {
          background: var(--green-800);
          color: white;
        }

        .ltc-contact-hero {
          position: relative;
          overflow: hidden;
          color: white;
          isolation: isolate;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
          padding: 82px 0 78px;
        }

        .ltc-contact-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -3;
          background:
            linear-gradient(
              120deg,
              rgba(2, 18, 11, 0.96) 0%,
              rgba(5, 37, 23, 0.88) 42%,
              rgba(12, 64, 39, 0.76) 100%
            ),
            var(--hero-image) center center / cover no-repeat;
          background-blend-mode: multiply;
          opacity: 0.96;
          transform: scale(1.02);
        }

        .ltc-contact-hero::after {
          content: "";
          position: absolute;
          inset: -16% -10% -24% -10%;
          z-index: -2;
          background:
            radial-gradient(circle at 16% 82%, rgba(19, 120, 72, 0.36), transparent 24%),
            radial-gradient(circle at 36% 92%, rgba(7, 76, 47, 0.46), transparent 30%),
            radial-gradient(circle at 72% 18%, rgba(28, 108, 68, 0.28), transparent 30%),
            radial-gradient(circle at 88% 44%, rgba(244, 212, 132, 0.14), transparent 28%),
            radial-gradient(circle at 90% 84%, rgba(22, 108, 66, 0.30), transparent 26%),
            linear-gradient(135deg, rgba(3, 24, 15, 0.34), rgba(8, 56, 34, 0.08));
          filter: blur(30px);
          pointer-events: none;
        }

        .ltc-contact-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .ltc-contact-hero h2 {
          margin: 0;
          color: white;
          font-size: clamp(34px, 5vw, 58px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.055em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .ltc-contact-hero h2 span {
          color: var(--gold-soft);
        }

        .ltc-contact-hero p {
          max-width: 760px;
          margin: 18px auto 0;
          color: rgba(255,255,255,.80);
          font-size: 17px;
          line-height: 1.8;
        }

        .ltc-section {
          padding: 84px 0;
        }

        .ltc-section-title {
          text-align: center;
          margin-bottom: 42px;
        }

        .ltc-section-title span {
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .ltc-section-title h3 {
          margin: 10px 0 0;
          color: var(--green-950);
          font-size: clamp(32px,4vw,50px);
          line-height: 1.08;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .ltc-section-title p {
          max-width: 760px;
          margin: 15px auto 0;
          color: var(--muted);
        }

        .ltc-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .ltc-summary-card,
        .ltc-contact-card,
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

        .ltc-summary-card::before,
        .ltc-contact-card::before,
        .ltc-map-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          z-index: 3;
        }

        .ltc-summary-card:hover,
        .ltc-contact-card:hover,
        .ltc-map-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(215,168,77,.45);
        }

        .ltc-summary-card {
          padding: 26px;
          min-height: 140px;
        }

        .ltc-summary-card h4 {
          margin: 0;
          color: var(--green-950);
          font-size: 18px;
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: -.035em;
        }

        .ltc-summary-card p {
          margin: 10px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.65;
        }

        .ltc-main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: stretch;
        }

        .ltc-contact-card {
          min-height: 520px;
          padding: 34px;
        }

        .ltc-contact-card h3,
        .ltc-map-card h3 {
          margin: 0;
          color: var(--green-950);
          font-size: clamp(26px, 3vw, 38px);
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -.055em;
        }

        .ltc-contact-card .eyebrow,
        .ltc-map-card .eyebrow {
          margin: 0 0 10px;
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .ltc-card-description {
          margin: 14px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .ltc-contact-list {
          display: grid;
          gap: 14px;
          margin-top: 24px;
        }

        .ltc-contact-item {
          display: flex;
          gap: 14px;
          padding: 18px;
          border-radius: 20px;
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(35,95,62,.12);
          transition: .3s var(--ease);
        }

        .ltc-contact-item:hover {
          transform: translateY(-4px);
          background: white;
          box-shadow: 0 18px 36px rgba(8,39,25,.1);
        }

        .ltc-contact-icon {
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

        .ltc-svg-icon {
          width: 22px;
          height: 22px;
          stroke: currentColor;
          stroke-width: 1.9;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .ltc-contact-item-content h4 {
          margin: 0;
          color: var(--green-950);
          font-size: 15px;
          line-height: 1.25;
          font-weight: 900;
          letter-spacing: -.02em;
        }

        .ltc-contact-item-text {
          margin-top: 6px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.55;
          overflow-wrap: anywhere;
        }

        .ltc-contact-item-text p {
          margin: 0;
        }

        .ltc-contact-item-text p + p {
          margin-top: 3px;
        }

        .ltc-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 24px;
        }

        .ltc-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ltc-field.full {
          grid-column: 1 / -1;
          margin-top: 16px;
        }

        .ltc-field label {
          color: var(--green-800);
          font-size: 13px;
          font-weight: 900;
        }

        .ltc-field input,
        .ltc-field textarea {
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

        .ltc-field textarea {
          min-height: 180px;
          resize: none;
          line-height: 1.65;
        }

        .ltc-field input:focus,
        .ltc-field textarea:focus {
          border-color: var(--green-700);
          background: white;
          box-shadow: 0 0 0 4px rgba(35,95,62,.1);
        }

        .ltc-form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          margin-top: 18px;
        }

        .ltc-form-footer p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .ltc-submit-button,
        .ltc-map-button {
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

        .ltc-submit-button:hover,
        .ltc-map-button:hover {
          transform: translateY(-3px);
        }

        .ltc-map-card {
          margin-top: 24px;
          padding: 34px;
        }

        .ltc-map-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }

        .ltc-map-frame {
          height: 360px;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(35,95,62,.16);
          background: rgba(248,250,247,.9);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.55);
        }

        .ltc-map-frame iframe {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }

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
          grid-template-columns: 1.5fr .9fr 1fr 1.65fr;
          gap: 22px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .ltc-footer h4 {
          color: white;
          font-weight: 900;
          font-size: 18px;
          line-height: 1.2;
          margin: 0 0 10px;
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
        }

        .ltc-footer-link {
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          text-align: left;
        }

        .ltc-footer-link:hover {
          color: white;
          text-decoration: underline;
        }

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

        @media (max-width: 900px) {
          .ltc-header .ltc-container {
            padding-left: 22px;
            padding-right: 22px;
          }

          .ltc-nav {
            min-height: auto;
            padding: 18px 0;
          }

          .ltc-desktop-nav {
            display: none;
          }

          .ltc-menu-button {
            display: grid;
            place-items: center;
          }

          .ltc-summary-grid,
          .ltc-main-grid,
          .ltc-footer-grid {
            grid-template-columns: 1fr;
          }

          .ltc-map-header,
          .ltc-form-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .ltc-footer {
            padding: 28px 0 12px;
          }

          .ltc-footer-grid {
            gap: 18px;
            padding-bottom: 22px;
          }

          .ltc-footer .ltc-container {
            padding-left: 22px;
            padding-right: 22px;
          }

          .ltc-copyright {
            flex-direction: column;
          }
        }

        @media (max-width: 600px) {
          .ltc-header .ltc-container,
          .ltc-footer .ltc-container {
            padding-left: 16px;
            padding-right: 16px;
          }

          .ltc-logo h1 {
            font-size: 14px;
          }

          .ltc-logo p {
            font-size: 10px;
          }

          .ltc-contact-hero {
            padding: 70px 0 66px;
          }

          .ltc-contact-hero h2 {
            font-size: clamp(34px, 11vw, 46px);
            letter-spacing: -.045em;
          }

          .ltc-contact-hero p {
            font-size: 15px;
          }

          .ltc-section {
            padding: 64px 0;
          }

          .ltc-contact-card,
          .ltc-map-card {
            padding: 24px 20px;
          }

          .ltc-form-grid {
            grid-template-columns: 1fr;
          }

          .ltc-submit-button,
          .ltc-map-button {
            width: 100%;
          }

          .ltc-map-frame {
            height: 300px;
          }
        }
      `}</style>

      <header className="ltc-header">
        <div className="ltc-container ltc-nav">
          <button
            type="button"
            onClick={() => goTo("/")}
            className="ltc-logo"
            aria-label="Go to home page"
          >
            <img src={LOGO} alt="LTC Logo" className="ltc-logo-icon" />

            <div>
              <h1 style={fontMontserrat}>
                LTC Group of Companies
                <span style={{ fontSize: "10px", verticalAlign: "super" }}>®</span>
              </h1>
              <p style={fontPontano}>Providing quality services and training solutions.</p>
            </div>
          </button>

          <nav className="ltc-desktop-nav" style={fontPoppins}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;

              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => goTo(link.to)}
                  className={`ltc-nav-link ${isActive ? "active" : ""}`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            className="ltc-menu-button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {isSidebarOpen && (
        <div className="ltc-sidebar-overlay">
          <div
            style={{ position: "absolute", inset: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />

          <aside className="ltc-sidebar-panel">
            <div className="ltc-sidebar-top">
              <p className="ltc-sidebar-title" style={fontPoppins}>
                MENU
              </p>

              <button
                type="button"
                className="ltc-sidebar-close"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close menu"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={fontPoppins}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;

                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => goTo(link.to)}
                    className={`ltc-sidebar-link ${isActive ? "active" : ""}`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      <main>
        <section
          className="ltc-contact-hero"
          style={{
            "--hero-image": `url('${BANNER_SRC}')`,
          }}
        >
          <div className="ltc-container ltc-contact-hero-content">
            <RevealOnScroll>
              <h2 style={fontMontserrat}>
                Contact <span>Us</span>
              </h2>

              <p style={fontPontano}>
                Reach out to LTC Group of Companies for inquiries, partnerships, service concerns,
                or training and business assistance.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <RevealOnScroll className="ltc-section-title">
              <span>Let&apos;s Connect</span>
              <h3 style={fontMontserrat}>We are ready to assist you</h3>
              <p style={fontPontano}>
                Send us your message or visit our office location for company services, training,
                manpower, and business inquiries.
              </p>
            </RevealOnScroll>

            <div className="ltc-summary-grid">
              <RevealOnScroll delay={60}>
                <div className="ltc-summary-card">
                  <h4 style={fontMontserrat}>Main Office</h4>
                  <p style={fontPontano}>Palanan, Makati City</p>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={120}>
                <div className="ltc-summary-card">
                  <h4 style={fontMontserrat}>Business Hours</h4>
                  <p style={fontPontano}>Monday to Friday, 8:00 AM - 5:00 PM</p>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={180}>
                <div className="ltc-summary-card">
                  <h4 style={fontMontserrat}>Support</h4>
                  <p style={fontPontano}>Email us for service and training inquiries.</p>
                </div>
              </RevealOnScroll>
            </div>

            <div className="ltc-main-grid">
              <RevealOnScroll delay={80}>
                <section className="ltc-contact-card">
                  <p className="eyebrow" style={fontMontserrat}>
                    Contact Information
                  </p>

                  <h3 style={fontMontserrat}>Get in Touch</h3>

                  <p className="ltc-card-description" style={fontPontano}>
                    Reach us through the contact information below. Our team will assist you with
                    questions about company services, training, manpower, and business inquiries.
                  </p>

                  <div className="ltc-contact-list">
                    <ContactInfoItem icon="location" title="Main Office">
                      <p>
                        5411 Light Tower Center &amp; Realty Development, Inc., Building II, Curie
                        Street, Palanan, Makati City.
                      </p>
                    </ContactInfoItem>

                    <ContactInfoItem icon="location" title="Additional Address">
                      <p>Light Tower Center, 1730 Dian Street, Palanan, Makati City.</p>
                    </ContactInfoItem>

                    <ContactInfoItem icon="mail" title="Email Contacts">
                      <p>lornacastigador@ltcmultiservices.com</p>
                      <p>lorengladius@ltcmultiservices.com</p>
                      <p>Admin@ltcmultiservices.com</p>
                    </ContactInfoItem>

                    <ContactInfoItem icon="time" title="Operating Hours">
                      <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                      <p>Saturday: 9:00 AM - 12:00 PM</p>
                      <p>Sunday: Closed</p>
                    </ContactInfoItem>
                  </div>
                </section>
              </RevealOnScroll>

              <RevealOnScroll delay={140}>
                <section className="ltc-contact-card">
                  <form onSubmit={handleSubmit}>
                    <p className="eyebrow" style={fontMontserrat}>
                      Message Form
                    </p>

                    <h3 style={fontMontserrat}>Send Us a Message</h3>

                    <p className="ltc-card-description" style={fontPontano}>
                      Fill out the form below and we will get back to you as soon as possible.
                    </p>

                    <div className="ltc-form-grid">
                      <div className="ltc-field">
                        <label htmlFor="name" style={fontMontserrat}>
                          Name
                        </label>

                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="ltc-field">
                        <label htmlFor="email" style={fontMontserrat}>
                          Email Address
                        </label>

                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    <div className="ltc-field full">
                      <label htmlFor="message" style={fontMontserrat}>
                        Your Message
                      </label>

                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                      />
                    </div>

                    <div className="ltc-form-footer">
                      <p style={fontPontano}>
                        Please make sure your contact details are correct.
                      </p>

                      <button type="submit" className="ltc-submit-button" style={fontMontserrat}>
                        Send Message
                      </button>
                    </div>
                  </form>
                </section>
              </RevealOnScroll>
            </div>

            <RevealOnScroll delay={160}>
              <section className="ltc-map-card">
                <div className="ltc-map-header">
                  <div>
                    <p className="eyebrow" style={fontMontserrat}>
                      Location
                    </p>

                    <h3 style={fontMontserrat}>Find Us on Map</h3>

                    <p className="ltc-card-description" style={fontPontano}>
                      5411 Light Tower Center &amp; Realty Development, Inc., Building II, Curie
                      Street, Palanan, Makati City.
                    </p>
                  </div>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=5411%20Light%20Tower%20Center%20Curie%20Street%20Palanan%20Makati%20City"
                    target="_blank"
                    rel="noreferrer"
                    className="ltc-map-button"
                    style={fontMontserrat}
                  >
                    Open Map
                  </a>
                </div>

                <div className="ltc-map-frame">
                  <iframe
                    title="LTC Group of Companies Location Map"
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

      <footer className="ltc-footer">
        <div className="ltc-container ltc-footer-grid">
          <div>
            <h4 style={fontMontserrat}>LTC Group of Companies</h4>
            <p style={fontPontano}>
              Professional training, assessment, manpower, hotel and restaurant service solutions.
            </p>
          </div>

          <div>
            <h5 style={fontMontserrat}>Menu</h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, ...fontPontano }}>
              <FooterLink onClick={() => goTo("/")}>Home</FooterLink>
              <FooterLink onClick={() => goTo("/about-us")}>About Us</FooterLink>
              <FooterLink onClick={() => goTo("/team")}>Team</FooterLink>
              <FooterLink onClick={() => goTo("/contact")}>Contact Us</FooterLink>
            </ul>
          </div>

          <div>
            <h5 style={fontMontserrat}>Contact</h5>
            <p style={fontPontano}>lornacastigador@ltcmultiservices.com</p>
            <p style={fontPontano}>lorengladius@ltcmultiservices.com</p>
            <p style={fontPontano}>Admin@ltcmultiservices.com</p>
          </div>

          <div>
            <h5 style={fontMontserrat}>Address</h5>
            <p style={fontPontano}>
              5411 Light Tower Center &amp; Realty Development, Inc., Building II, Curie Street,
              Palanan, Makati City.
            </p>
            <p style={fontPontano}>Light Tower Center, 1730 Dian Street, Palanan, Makati City.</p>
          </div>
        </div>

        <div className="ltc-container ltc-copyright">
          <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
        </div>
      </footer>

      <ChatbotWidget />
    </div>
  );
};

export default Contact;
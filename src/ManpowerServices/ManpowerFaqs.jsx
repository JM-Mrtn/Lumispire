import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGO_IMAGE = "/ManpowerLogo.png";
const HERO_IMAGE = "/ManpowerBanner.png";
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
      "The office is located at 2/F 544 Curie Street, Palanan, Makati City.",
  },
  {
    question: "Who can I contact for more questions?",
    answer:
      "You may contact the office through ltc.tamis@gmail.com, lorengladisu@ltcmultiservices.com, or call 09959808051 / 09516281271.",
  },
];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

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
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

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
          width: 38px;
          height: 38px;
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
          .mp-help-card-content { flex-direction: column; align-items: flex-start; }
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
          .mp-help-card { padding: 24px; }
          .mp-help-button { width: 100%; }
        }
      `}</style>

      <Header goTo={goTo} openMenu={() => setMobileOpen(true)} />

      <main>
        <section className="mp-hero">
          <img
            src={HERO_IMAGE}
            alt="Manpower services background"
            className="mp-hero-bg"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="mp-container mp-hero-content">
            <RevealOnScroll>
              <h2 style={fontMontserrat}>
                Frequently Asked <span>Questions</span>
              </h2>

              <p style={fontPontano}>
                Find answers to common questions about applications, job offers, requirements, and employee access.
              </p>
            </RevealOnScroll>
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
                          onClick={() => setOpenIndex(isActive ? -1 : index)}
                          className={`mp-faq-question ${isActive ? "active" : ""}`}
                        >
                          <span style={fontMontserrat}>{item.question}</span>
                          <span className="mp-faq-icon">{isActive ? "−" : "+"}</span>
                        </button>

                        {isActive ? (
                          <div className="mp-faq-answer" style={fontPontano}>
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
                  <div>
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

      {mobileOpen ? <MobileMenu onClose={() => setMobileOpen(false)} goTo={goTo} /> : null}
    </div>
  );
}

function Header({ goTo, openMenu }) {
  return (
    <header className="mp-header">
      <div className="mp-container mp-nav">
        <button
          onClick={() => goTo(MANPOWER_HOME_ROUTE)}
          type="button"
          className="mp-logo"
          aria-label="Go to manpower home"
        >
          <img
            src={LOGO_IMAGE}
            alt="Manpower logo"
            className="mp-logo-icon"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div>
            <h1 style={fontMontserrat}>LTC MANPOWER SERVICES</h1>
            <p style={fontPontano}>Professional staffing and workforce solutions.</p>
          </div>
        </button>

        <nav className="mp-desktop-nav" style={fontPoppins}>
          <NavButton label="Home" onClick={() => goTo(MANPOWER_HOME_ROUTE)} />
          <NavButton label="Job Offer" onClick={() => goTo("/manpower-positions")} />
          <NavButton label="Requirements" onClick={() => goTo("/manpower-requirements")} />
          <NavButton label="Contact" onClick={() => goTo("/manpower-contact")} />
          <NavButton active label="FAQs" onClick={() => goTo("/manpower-faqs")} />
          <NavButton
            label="Sign In"
            onClick={() => goTo("/manpower-employee-login")}
            className="mp-profile-button"
          />
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

function NavButton({ label, onClick, active = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`mp-nav-link ${active ? "active" : ""} ${className}`}
    >
      {label}
    </button>
  );
}

function Footer() {
  return (
    <footer className="mp-footer">
      <div className="mp-container mp-footer-grid">
        <div>
          <Link to={MANPOWER_HOME_ROUTE} className="mp-footer-brand">
            <img
              src={LOGO_IMAGE}
              alt="Manpower logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <h4 style={fontMontserrat}>LTC Manpower</h4>
          </Link>
        </div>

        <FooterColumn title="Menu">
          <FooterLink to={MANPOWER_HOME_ROUTE}>Home</FooterLink>
          <FooterLink to="/manpower-positions">Job Offer</FooterLink>
          <FooterLink to="/manpower-requirements">Requirements</FooterLink>
          <FooterLink to="/manpower-employee-login">Profile</FooterLink>
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>ltc.tamis@gmail.com</FooterText>
          <FooterText>lorengladisu@ltcmultiservices.com</FooterText>
          <FooterText>09959808051 / 09516281271</FooterText>
        </FooterColumn>

        <FooterColumn title="Address">
          <FooterText>2/F 544 Curie Street,</FooterText>
          <FooterText>Palanan, Makati City</FooterText>
        </FooterColumn>

        <FooterColumn title="Follow Us">
          <div className="mp-socials">
            <span />
            <span />
            <span />
          </div>
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
      <div>{children}</div>
    </div>
  );
}

function FooterLink({ children, to }) {
  return (
    <Link to={to} className="mp-footer-link" style={fontPontano}>
      {children}
    </Link>
  );
}

function FooterText({ children }) {
  return <p style={fontPontano}>{children}</p>;
}

function MobileMenu({ onClose, goTo }) {
  return (
    <div className="mp-sidebar-overlay">
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <div className="mp-sidebar-panel">
        <div className="mp-sidebar-top">
          <p className="mp-sidebar-title" style={fontPoppins}>MENU</p>

          <button
            onClick={onClose}
            className="mp-sidebar-close"
            aria-label="Close menu"
            type="button"
          >
            ✕
          </button>
        </div>

        <MenuItem label="HOME" onClick={() => goTo(MANPOWER_HOME_ROUTE)} />
        <MenuItem label="JOB OFFER" onClick={() => goTo("/manpower-positions")} />
        <MenuItem label="REQUIREMENTS" onClick={() => goTo("/manpower-requirements")} />
        <MenuItem label="CONTACT" onClick={() => goTo("/manpower-contact")} />
        <MenuItem label="FAQS" active onClick={() => goTo("/manpower-faqs")} />
        <MenuItem label="SIGN IN" onClick={() => goTo("/manpower-employee-login")} />
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`mp-sidebar-link ${active ? "active" : ""}`}
      style={fontPoppins}
    >
      {label}
    </button>
  );
}

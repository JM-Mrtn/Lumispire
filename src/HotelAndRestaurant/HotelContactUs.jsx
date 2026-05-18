import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3863.765198406772!2d120.96799167484153!3d14.440690780972236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d30043932aff%3A0x196265023d83cdf4!2sPatio%20de%20lorenzo!5e0!3m2!1sen!2sph!4v1778489406858!5m2!1sen!2sph";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

function getHotelToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
}

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

export default function HotelContactUs() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [contactSending, setContactSending] = useState(false);
  const [contactStatus, setContactStatus] = useState({ type: "", message: "" });
  const [contactTouched, setContactTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  const API_BASE = useMemo(() => {
    const raw = (
      import.meta.env.VITE_HOTEL_API_BASE ||
      import.meta.env.VITE_API_BASE ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000"
    ).replace(/\/+$/, "");

    if (raw.endsWith("/api/hotel")) return raw;
    if (raw.endsWith("/api")) return `${raw}/hotel`;
    if (raw.includes("/api/hotel")) return raw;

    return `${raw}/api/hotel`;
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const goToProfile = () => {
    navigate(getHotelToken() ? "/hotel-profile" : "/hotel-login");
  };

  const validateContactField = (key, value) => {
    const cleanValue = String(value || "").trim();

    if (key === "name") {
      if (!cleanValue) return "Name is required.";
      if (cleanValue.length < 2) return "Name must be at least 2 characters.";
      if (!/^[A-Za-zÑñ .'-]+$/.test(cleanValue)) {
        return "Name can only contain letters, spaces, apostrophes, periods, and hyphens.";
      }
      return "";
    }

    if (key === "email") {
      if (!cleanValue) return "Email address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue)) {
        return "Please enter a valid email address.";
      }
      return "";
    }

    if (key === "subject") {
      if (!cleanValue) return "Subject is required.";
      if (cleanValue.length < 3) return "Subject must be at least 3 characters.";
      return "";
    }

    if (key === "message") {
      if (!cleanValue) return "Message is required.";
      if (cleanValue.length < 10) return "Message must be at least 10 characters.";
      return "";
    }

    return "";
  };

  const contactErrors = {
    name: validateContactField("name", contactForm.name),
    email: validateContactField("email", contactForm.email),
    subject: validateContactField("subject", contactForm.subject),
    message: validateContactField("message", contactForm.message),
  };

  const hasContactErrors = Object.values(contactErrors).some(Boolean);

  const setContactField = (key, value) => {
    setContactForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setContactStatus({ type: "", message: "" });
  };

  const setContactFieldTouched = (key) => {
    setContactTouched((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const handleSendContactMessage = async (event) => {
    event.preventDefault();

    const name = contactForm.name.trim();
    const email = contactForm.email.trim();
    const subject = contactForm.subject.trim();
    const message = contactForm.message.trim();

    setContactTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
    });

    if (hasContactErrors) {
      setContactStatus({
        type: "error",
        message: "Please fix the highlighted fields before sending.",
      });
      return;
    }

    setContactSending(true);
    setContactStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/contact-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to send message.");
      }

      setContactStatus({
        type: "success",
        message: "Your message was sent successfully.",
      });

      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setContactTouched({
        name: false,
        email: false,
        subject: false,
        message: false,
      });
    } catch (error) {
      setContactStatus({
        type: "error",
        message: error.message || "Failed to send message.",
      });
    } finally {
      setContactSending(false);
    }
  };

  return (
    <div className="ltc-hotel-contact-page" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .ltc-hotel-contact-page {
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

        .ltc-hotel-contact-page * {
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
          border-radius: 999px;
          background: white;
          object-fit: cover;
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

        .ltc-hero {
          position: relative;
          overflow: hidden;
          color: white;
          isolation: isolate;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
          padding: 100px 0 96px;
        }

        .ltc-hero-slide {
          position: absolute;
          inset: 0;
          z-index: -4;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 1000ms ease;
        }

        .ltc-hero-slide.active {
          opacity: 1;
        }

        .ltc-hero::before {
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
            );
          opacity: .98;
        }

        .ltc-hero::after {
          content: "";
          position: absolute;
          inset: -16% -10% -24% -10%;
          z-index: -2;
          background:
            radial-gradient(circle at 16% 82%, rgba(19, 120, 72, 0.36), transparent 24%),
            radial-gradient(circle at 36% 92%, rgba(7, 76, 47, 0.46), transparent 30%),
            radial-gradient(circle at 72% 18%, rgba(28, 108, 68, 0.28), transparent 30%),
            radial-gradient(circle at 88% 44%, rgba(244, 212, 132, 0.14), transparent 28%),
            radial-gradient(circle at 90% 84%, rgba(22, 108, 66, 0.30), transparent 26%);
          filter: blur(30px);
          pointer-events: none;
        }

        .ltc-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .ltc-hero h2 {
          margin: 0;
          color: white;
          font-size: clamp(34px, 5vw, 58px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.055em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .ltc-hero h2 span {
          color: var(--gold-soft);
        }

        .ltc-hero p {
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
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .ltc-field-error {
          min-height: 17px;
          color: #b42318;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.35;
          margin: -1px 0 0;
        }

        .ltc-input.invalid,
        .ltc-textarea.invalid {
          border-color: rgba(180,35,24,.55);
          background: rgba(254,242,242,.92);
          box-shadow: 0 0 0 4px rgba(180,35,24,.08);
        }

        .ltc-input.valid,
        .ltc-textarea.valid {
          border-color: rgba(35,95,62,.38);
          background: rgba(240,253,244,.72);
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

        .ltc-contact-status {
          border-radius: 14px;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 800;
        }

        .ltc-contact-status.success {
          color: #047857;
          background: rgba(16,185,129,.10);
          border: 1px solid rgba(16,185,129,.25);
        }

        .ltc-contact-status.error {
          color: #b42318;
          background: rgba(239,68,68,.10);
          border: 1px solid rgba(239,68,68,.22);
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
          font-weight: 900;
          cursor: pointer;
          transition: .28s var(--ease);
        }

        .ltc-submit-button:hover {
          transform: translateY(-3px);
        }

        .ltc-submit-button:disabled {
          opacity: .65;
          cursor: not-allowed;
          transform: none;
        }

        .ltc-map-section {
          padding: 0 0 84px;
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
          grid-template-columns: 1.1fr .75fr 1.1fr 1.1fr 1fr;
          gap: 22px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,.1);
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
          object-fit: cover;
        }

        .ltc-footer h4 {
          color: white;
          font-weight: 900;
          font-size: 20px;
          line-height: 1.2;
          margin: 0;
          text-transform: uppercase;
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

        .ltc-footer-small-text {
          font-size: 12px !important;
          line-height: 1.42 !important;
          margin: 4px 0 !important;
        }

        .ltc-footer-small-text strong {
          font-size: 12px !important;
          line-height: 1.42 !important;
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

        .ltc-facebook-link {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 999px;
          background: rgba(255,255,255,.10);
          color: white;
          cursor: pointer;
          transition: .25s var(--ease);
          margin-top: 6px;
        }

        .ltc-facebook-link:hover {
          color: #f4d484;
          border-color: rgba(244,212,132,.42);
          background: rgba(244,212,132,.12);
          transform: translateY(-2px);
        }

        .ltc-facebook-link svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }

        .ltc-socials {
          display: flex;
          gap: 8px;
        }

        .ltc-socials span {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: rgba(255,255,255,.13);
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

        @media (max-width: 1100px) {
          .ltc-contact-layout,
          .ltc-footer-grid {
            grid-template-columns: 1fr;
          }

          .ltc-contact-card,
          .ltc-message-card {
            min-height: auto;
          }
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

          .ltc-map-frame {
            height: 390px;
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

          .ltc-hero {
            padding: 76px 0 74px;
          }

          .ltc-hero h2 {
            font-size: clamp(34px, 11vw, 46px);
            letter-spacing: -.045em;
          }

          .ltc-hero p {
            font-size: 15px;
          }

          .ltc-section {
            padding: 64px 0;
          }

          .ltc-contact-card,
          .ltc-message-card {
            padding: 24px;
          }

          .ltc-contact-row {
            grid-template-columns: 42px minmax(0, 1fr);
            padding: 14px;
          }

          .ltc-contact-icon {
            width: 42px;
            height: 42px;
          }

          .ltc-map-section {
            padding-bottom: 64px;
          }

          .ltc-map-frame {
            height: 330px;
          }
        }
      `}</style>

      <Header navigate={navigate} goToProfile={goToProfile} openMenu={() => setIsOpen(true)} />

      <main>
        <section className="ltc-hero">
          {HERO_IMAGES.map((image, index) => (
            <img
              key={image}
              src={image}
              alt="Hotel and resort background"
              className={`ltc-hero-slide ${heroIndex === index ? "active" : ""}`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ))}

          <div className="ltc-container ltc-hero-content">
            <RevealOnScroll>
              <h2 style={fontMontserrat}>
                Contact <span>Us</span>
              </h2>

              <p style={fontPontano}>
                Reach out to our Hotel &amp; Resort team for inquiries, bookings, and assistance.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <RevealOnScroll className="ltc-section-title">
              <span>Get In Touch</span>
              <h3 style={fontMontserrat}>We are ready to assist you</h3>
              <p style={fontPontano}>
                Send us a message or use the contact details below for faster inquiries about rooms,
                venues, events, and reservations.
              </p>
            </RevealOnScroll>

            <div className="ltc-contact-layout">
              <RevealOnScroll className="ltc-contact-card">
                <h3 className="ltc-card-heading" style={fontMontserrat}>
                  Contact <span>Information</span>
                </h3>

                <p className="ltc-card-subtext" style={fontPontano}>
                  Our team will help you with booking requests, package questions, venue details,
                  and other hotel and resort concerns.
                </p>

                <div className="ltc-contact-list">
                  <ContactRow icon="pin" title="Resort Address">
                    Ecotrend Subdivision San Nicolas, Bacoor Cavite
                  </ContactRow>

                  <ContactRow icon="pin" title="Hotel Address">
                    2/F 5441 Currie Street, Palanan, Makati City
                  </ContactRow>

                  <ContactRow icon="phone" title="Resort Contact No.">
                    +63 9953781962
                    <br />
                    +63 9064191405
                    <br />
                    +63 9338699988
                  </ContactRow>

                  <ContactRow icon="phone" title="Hotel Contact No.">
                    +63 9064191405
                    <br />
                    +63 9338699988
                  </ContactRow>

                  <ContactRow icon="mail" title="Email">
                    recruitment@ltcmultiservices.com
                    <br />
                    marketing@ltcmultiservices.com
                    <br />
                    lorenzoeventandvenue@gmail.com
                  </ContactRow>

                  <ContactRow icon="clock" title="Working Hours">
                    8AM - 5PM (Daily)
                  </ContactRow>
                </div>
              </RevealOnScroll>

              <RevealOnScroll className="ltc-message-card" delay={90}>
                <h3 className="ltc-card-heading" style={fontMontserrat}>
                  Send us <span>Message</span>
                </h3>

                <p className="ltc-card-subtext" style={fontPontano}>
                  Fill out the form and we will get back to you as soon as possible.
                </p>

                <form className="ltc-message-form" onSubmit={handleSendContactMessage}>
                  <Field
                    label="Your Name"
                    name="name"
                    type="text"
                    value={contactForm.name}
                    error={contactErrors.name}
                    touched={contactTouched.name}
                    onBlur={() => setContactFieldTouched("name")}
                    onChange={(value) => setContactField("name", value)}
                  />

                  <Field
                    label="Email Address"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    error={contactErrors.email}
                    touched={contactTouched.email}
                    onBlur={() => setContactFieldTouched("email")}
                    onChange={(value) => setContactField("email", value)}
                  />

                  <Field
                    label="Subject"
                    name="subject"
                    type="text"
                    value={contactForm.subject}
                    error={contactErrors.subject}
                    touched={contactTouched.subject}
                    onBlur={() => setContactFieldTouched("subject")}
                    onChange={(value) => setContactField("subject", value)}
                  />

                  <label className="ltc-field">
                    <span style={fontMontserrat}>Message</span>
                    <textarea
                      name="message"
                      rows={4}
                      className={`ltc-textarea ${
                        contactTouched.message
                          ? contactErrors.message
                            ? "invalid"
                            : "valid"
                          : ""
                      }`}
                      style={fontPoppins}
                      value={contactForm.message}
                      onBlur={() => setContactFieldTouched("message")}
                      onChange={(event) => setContactField("message", event.target.value)}
                    />

                    {contactTouched.message && contactErrors.message ? (
                      <p className="ltc-field-error" style={fontPoppins}>
                        {contactErrors.message}
                      </p>
                    ) : (
                      <p className="ltc-field-error" aria-hidden="true">
                        {" "}
                      </p>
                    )}
                  </label>

                  {contactStatus.message ? (
                    <div
                      className={
                        contactStatus.type === "success"
                          ? "ltc-contact-status success"
                          : "ltc-contact-status error"
                      }
                      style={fontPoppins}
                    >
                      {contactStatus.message}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    className="ltc-submit-button"
                    style={fontMontserrat}
                    disabled={contactSending}
                  >
                    {contactSending ? "Sending..." : "Submit"}
                  </button>
                </form>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="ltc-map-section">
          <div className="ltc-container">
            <RevealOnScroll className="ltc-section-title">
              <span>Location Guide</span>
              <h3 style={fontMontserrat}>Our Location Guide Map</h3>
              <p style={fontPontano}>
                Use the map below to locate Patio de Lorenzo and plan your visit.
              </p>
            </RevealOnScroll>

            <RevealOnScroll className="ltc-map-card">
              <iframe
                title="Hotel location map"
                src={MAP_EMBED_URL}
                width="100%"
                height="100%"
                className="ltc-map-frame"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </RevealOnScroll>
          </div>
        </section>

        <Footer />
      </main>

      {isOpen && (
        <MobileMenu onClose={() => setIsOpen(false)} navigate={navigate} goToProfile={goToProfile} />
      )}
    </div>
  );
}

function Header({ navigate, goToProfile, openMenu }) {
  const signedIn = getHotelToken();

  return (
    <header className="ltc-header">
      <div className="ltc-container ltc-nav">
        <button
          onClick={() => navigate("/resort-venue")}
          type="button"
          className="ltc-logo"
          aria-label="Go to home"
        >
          <img
            src={HOTEL_LOGO}
            alt="Hotel logo"
            className="ltc-logo-icon"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div>
            <h1 style={fontMontserrat}>Hotel &amp; Resort</h1>
            <p style={fontPontano}>Resort, venue, hotel, and events booking services.</p>
          </div>
        </button>

        <nav className="ltc-desktop-nav" style={fontPoppins}>
          <NavButton label="Home" onClick={() => navigate("/resort-venue")} />
          <NavButton label="Virtual Tour" onClick={() => navigate("/virtual-tour")} />
          <NavButton active label="Contact" onClick={() => navigate("/hotel-contact-us")} />
          <NavButton label="FAQs" onClick={() => navigate("/hotel-faqs")} />
          <NavButton
            label={signedIn ? "Profile" : "Sign In"}
            onClick={goToProfile}
            className="ltc-profile-button"
          />
        </nav>

        <button onClick={openMenu} type="button" aria-label="Open menu" className="ltc-menu-button">
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
      className={`ltc-nav-link ${active ? "active" : ""} ${className}`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  name,
  type,
  value,
  error = "",
  touched = false,
  onBlur,
  onChange,
}) {
  return (
    <label className="ltc-field">
      <span style={fontMontserrat}>{label}</span>
      <input
        name={name}
        type={type}
        className={`ltc-input ${touched ? (error ? "invalid" : "valid") : ""}`}
        style={fontPoppins}
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
      />

      {touched && error ? (
        <p className="ltc-field-error" style={fontPoppins}>
          {error}
        </p>
      ) : (
        <p className="ltc-field-error" aria-hidden="true">
          {" "}
        </p>
      )}
    </label>
  );
}

function ContactRow({ icon, title, children }) {
  return (
    <div className="ltc-contact-row">
      <span className="ltc-contact-icon">
        <ContactIcon type={icon} />
      </span>

      <div>
        <h4 style={fontMontserrat}>{title}</h4>
        <p style={fontPontano}>{children}</p>
      </div>
    </div>
  );
}

function ContactIcon({ type }) {
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

function Footer() {
  return (
    <footer className="ltc-footer">
      <div className="ltc-container ltc-footer-grid">
        <div>
          <div className="ltc-footer-brand">
            <img
              src={LUMISPIRE_LOGO}
              alt="Lumispire logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <h4 style={fontMontserrat}>Lumispire</h4>
          </div>
        </div>

        <FooterColumn title="Menu">
          <FooterLink onClick={() => (window.location.href = "/resort-venue")}>Home</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/virtual-tour")}>
            Virtual Tour
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-contact-us")}>
            Contact
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-faqs")}>FAQs</FooterLink>
          <FooterLink
            onClick={() => {
              window.location.href = getHotelToken() ? "/hotel-profile" : "/hotel-login";
            }}
          >
            {getHotelToken() ? "Profile" : "Sign In"}
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Resort">
          <FooterText className="ltc-footer-small-text">
            <strong>Address:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">
            Ecotrend Subdivision San Nicolas, Bacoor Cavite
          </FooterText>

          <FooterText className="ltc-footer-small-text">
            <strong>Contact No.:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">+63 9953781962</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9064191405</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9338699988</FooterText>

        </FooterColumn>

        <FooterColumn title="Hotel">
          <FooterText className="ltc-footer-small-text">
            <strong>Address:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">
            2/F 5441 Currie Street, Palanan, Makati City
          </FooterText>

          <FooterText className="ltc-footer-small-text">
            <strong>Contact No.:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">+63 9064191405</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9338699988</FooterText>

        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>recruitment@ltcmultiservices.com</FooterText>
          <FooterText>marketing@ltcmultiservices.com</FooterText>
          <FooterText>lorenzoeventandvenue@gmail.com</FooterText>
          <FacebookLink />
        </FooterColumn>
      </div>

      <div className="ltc-container ltc-copyright">
        <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
        <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
      </div>
    </footer>
  );
}

function FacebookLink() {
  return (
    <button
      type="button"
      className="ltc-facebook-link"
      aria-label="Open Facebook page"
      title="Facebook"
      onClick={() => {
        window.open(
          "https://www.facebook.com/4delorenzo?rdid=2DsYHS1ll77JUW6K&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18wf6uHcfv%2F#",
          "_blank",
          "noopener,noreferrer"
        );
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.9h2.77l-.44 2.91h-2.33V22c4.78-.76 8.45-4.92 8.45-9.94Z" />
      </svg>
    </button>
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

function FooterLink({ children, onClick }) {
  return (
    <button onClick={onClick} type="button" className="ltc-footer-link" style={fontPontano}>
      {children}
    </button>
  );
}

function FooterText({ children, className = "" }) {
  return (
    <p className={className} style={fontPontano}>
      {children}
    </p>
  );
}

function MobileMenu({ onClose, navigate, goToProfile }) {
  const signedIn = getHotelToken();

  return (
    <div className="ltc-sidebar-overlay">
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <div className="ltc-sidebar-panel">
        <div className="ltc-sidebar-top">
          <p className="ltc-sidebar-title" style={fontPoppins}>
            MENU
          </p>

          <button
            onClick={onClose}
            className="ltc-sidebar-close"
            aria-label="Close menu"
            type="button"
          >
            ✕
          </button>
        </div>

        <MenuItem
          label="HOME"
          onClick={() => {
            onClose();
            navigate("/resort-venue");
          }}
        />

        <MenuItem
          label="VIRTUAL TOUR"
          onClick={() => {
            onClose();
            navigate("/virtual-tour");
          }}
        />

        <MenuItem
          label="CONTACT"
          active
          onClick={() => {
            onClose();
            navigate("/hotel-contact-us");
          }}
        />

        <MenuItem
          label="FAQS"
          onClick={() => {
            onClose();
            navigate("/hotel-faqs");
          }}
        />

        <MenuItem
          label={signedIn ? "PROFILE" : "SIGN IN"}
          onClick={() => {
            onClose();
            goToProfile();
          }}
        />
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`ltc-sidebar-link ${active ? "active" : ""}`}
      style={fontPoppins}
    >
      {label}
    </button>
  );
}
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";
import { getPublicLtcContent, pickPublicLtcImage } from "./ltcContentApi";

const CONTACT_ROUTE = "/contact";
const PROMO_SESSION_KEY = "ltc_home_promo_seen_session";

const LOGO_SRC = "/LTCLogo.jpg";
const BANNER_SRC = "/LTCBanner.png";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const FooterLink = ({ children, onClick }) => (
  <li>
    <button type="button" onClick={onClick} className="ltc-footer-link">
      {children}
    </button>
  </li>
);

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(() => {
    try {
      return sessionStorage.getItem(PROMO_SESSION_KEY) !== "true";
    } catch {
      return true;
    }
  });
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [ltcContent, setLtcContent] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const promoItems = [
    {
      image: "/HotelAds.png",
      title: "Hotel & Resort Services",
      description:
        "Discover hospitality-focused services designed to deliver excellent guest experiences.",
      buttonText: "View Hotel & Resort",
      route: "/hotel-resort",
    },
    {
      image: "/TrainingAds.png",
      title: "Training & Assessment",
      description:
        "Explore skills training, development programs, and assessment services for learners and professionals.",
      buttonText: "View Training & Assessment",
      route: "/training-assessment",
    },
    {
      image: "/ManpowerAds.png",
      title: "Manpower Services",
      description:
        "Find reliable staffing and workforce support solutions tailored for your organization.",
      buttonText: "View Manpower Services",
      route: "/manpower-services",
    },
  ];

  const navLinks = [
    { label: "HOME", to: "/" },
    { label: "ABOUT US", to: "/about-us" },
    { label: "TEAM", to: "/team" },
    { label: "CONTACT", to: CONTACT_ROUTE },
  ];

  const defaultValues = [
    {
      title: "INTEGRITY",
      body:
        "We honor our word and keep our commitments. We keep ourselves objective, honest and balanced in making decisions and actions for the common good of our stakeholders.",
    },
    {
      title: "GOD-FEARING",
      body:
        "We put GOD first in everything that we do. We respect individual differences and take control to overcome issues that may affect a harmonious working relationship.",
    },
    {
      title: "HARDWORK",
      body:
        "We convert ideas into action, tackle tasks without delay as we respond rapidly to changing information or business needs.",
    },
  ];

  const goTo = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const closePromo = () => {
    try {
      sessionStorage.setItem(PROMO_SESSION_KEY, "true");
    } catch {}

    setIsPromoOpen(false);
  };

  const goToPromoRoute = () => {
    const activePromo = promoItems[currentPromoIndex];

    if (!activePromo?.route) return;

    closePromo();
    navigate(activePromo.route);
  };

  useEffect(() => {
    let mounted = true;

    getPublicLtcContent()
      .then((data) => {
        if (mounted) setLtcContent(data.content || null);
      })
      .catch(() => {
        if (mounted) setLtcContent(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isPromoOpen || promoItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPromoOpen, promoItems.length]);

  useEffect(() => {
    document.body.style.overflow = isPromoOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isPromoOpen]);

  const company = ltcContent?.company || {};
  const logoSrc = pickPublicLtcImage(company.logoUrl, LOGO_SRC);
  const bannerSrc = pickPublicLtcImage(company.bannerUrl, BANNER_SRC);

  const heroTitle =
    company.heroTitle ||
    "We specialize in Training, Assessment, Manpower and Hospitality Services.";

  const heroSubtitle =
    company.heroSubtitle ||
    "Delivering excellence and professional solutions for your business needs";

  const values =
    Array.isArray(company.values) && company.values.length
      ? company.values
      : defaultValues;

  const ServiceIconHotel = () => (
    <svg viewBox="0 0 24 24" className="ltc-svg-icon">
      <path d="M4 20V9.5L12 4l8 5.5V20"></path>
      <path d="M9 20v-6h6v6"></path>
      <path d="M7 11h.01M17 11h.01"></path>
    </svg>
  );

  const ServiceIconTraining = () => (
    <svg viewBox="0 0 24 24" className="ltc-svg-icon">
      <path d="M5 19.5V5.8A2.3 2.3 0 0 1 7.3 3.5H19v15H7.3A2.3 2.3 0 0 0 5 20.5Z"></path>
      <path d="M8 7h7"></path>
      <path d="M8 10h5"></path>
    </svg>
  );

  const ServiceIconManpower = () => (
    <svg viewBox="0 0 24 24" className="ltc-svg-icon">
      <path d="M16 19v-1.5a4 4 0 0 0-8 0V19"></path>
      <path d="M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"></path>
      <path d="M19 19v-1a3 3 0 0 0-2.3-2.9"></path>
    </svg>
  );

  const serviceCards = [
    {
      title: "Hotel & Resort",
      description:
        "Professional hospitality services tailored to meet the highest industry standards. Our team ensures exceptional customer experiences.",
      route: "/hotel-resort",
      Icon: ServiceIconHotel,
    },
    {
      title: "Training & Assessment",
      description:
        "Comprehensive training programs designed to develop and enhance professional skills for individuals and organizations.",
      route: "/training-assessment",
      Icon: ServiceIconTraining,
    },
    {
      title: "Manpower Services",
      description:
        "Quality staffing solutions to meet your organization's personnel requirements. We connect you with skilled professionals.",
      route: "/manpower-services",
      Icon: ServiceIconManpower,
    },
  ];

  const getValueCardClass = (index, total) => {
    const baseClass = "ltc-card";

    if (total === 1) {
      return `${baseClass} ltc-card-center`;
    }

    if (total > 3 && total % 3 === 1 && index === total - 1) {
      return `${baseClass} ltc-card-center`;
    }

    return baseClass;
  };

  return (
    <div className="ltc-home" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .ltc-home {
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

        .ltc-home * {
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

        .ltc-hero {
          min-height: 570px;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          color: white;
          isolation: isolate;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
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
            ),
            var(--hero-image) center center / cover no-repeat;
          background-blend-mode: multiply;
          opacity: 0.96;
          transform: scale(1.02);
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
            radial-gradient(circle at 90% 84%, rgba(22, 108, 66, 0.30), transparent 26%),
            linear-gradient(135deg, rgba(3, 24, 15, 0.34), rgba(8, 56, 34, 0.08));
          filter: blur(30px);
          pointer-events: none;
        }

        .ltc-hero-content {
          position: relative;
          z-index: 2;
          width: min(960px, 100%);
          padding: 88px 0 100px;
          animation: ltcAppleReveal 0.9s var(--ease) both;
        }

        .ltc-hero h2 {
          margin: 0;
          max-width: 940px;
          font-size: clamp(42px, 6vw, 76px);
          line-height: .98;
          font-weight: 900;
          letter-spacing: -.065em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .ltc-hero h2 span {
          color: var(--gold-soft);
        }

        .ltc-hero p {
          max-width: 680px;
          margin: 24px 0 0;
          color: rgba(255,255,255,.80);
          font-size: 18px;
          line-height: 1.8;
        }

        .ltc-hero-actions {
          margin-top: 34px;
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .ltc-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
          padding: 0 24px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 900;
          transition: .28s var(--ease);
          border: 0;
          cursor: pointer;
          text-decoration: none;
        }

        .ltc-btn:hover {
          transform: translateY(-3px);
        }

        .ltc-btn-primary {
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.28);
        }

        .ltc-btn-outline {
          color: white;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.2);
          backdrop-filter: blur(8px);
        }

        .ltc-section {
          padding: 84px 0;
        }

        .ltc-section-title {
          text-align: center;
          margin-bottom: 42px;
          animation: ltcAppleReveal .7s var(--ease) both;
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
          max-width: 720px;
          margin: 15px auto 0;
          color: var(--muted);
        }

        .ltc-grid-3 {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 24px;
        }

        .ltc-card {
          position: relative;
          overflow: hidden;
          padding: 32px;
          min-height: 235px;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          transition:
            transform .38s var(--ease),
            box-shadow .38s var(--ease),
            border-color .38s var(--ease),
            background .38s var(--ease);
          animation: ltcAppleReveal .7s var(--ease) both;
          backdrop-filter: blur(18px);
        }

        button.ltc-card {
          text-align: left;
          cursor: pointer;
        }

        .ltc-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          transition: height .35s var(--ease), opacity .35s var(--ease);
        }

        .ltc-card::after {
          content: "";
          position: absolute;
          width: 190px;
          height: 190px;
          right: -86px;
          bottom: -86px;
          border-radius: 50%;
          background:
            radial-gradient(circle, rgba(215,168,77,.22), transparent 58%),
            radial-gradient(circle, rgba(47,117,76,.18), transparent 66%);
          opacity: .9;
          transition: transform .45s var(--ease), opacity .45s var(--ease);
        }

        .ltc-card:hover,
        .ltc-card:focus-visible {
          transform: translateY(-12px) scale(1.015);
          box-shadow: 0 34px 85px rgba(8,39,25,.22);
          border-color: rgba(215,168,77,.54);
          background: rgba(255,255,255,.92);
          outline: none;
        }

        .ltc-card:hover::before,
        .ltc-card:focus-visible::before {
          height: 9px;
          opacity: 1;
        }

        .ltc-card:hover::after,
        .ltc-card:focus-visible::after {
          transform: translate(-20px, -18px) scale(1.18);
          opacity: 1;
        }

        .ltc-card:hover .ltc-icon,
        .ltc-card:focus-visible .ltc-icon {
          transform: translateY(-5px) scale(1.08) rotate(-2deg);
          color: var(--green-950);
          background: linear-gradient(145deg,#fff7dc,#ffffff);
          box-shadow:
            inset 0 0 0 1px rgba(215,168,77,.35),
            0 18px 34px rgba(8,39,25,.16);
        }

        .ltc-card:hover h4,
        .ltc-card:focus-visible h4 {
          color: var(--green-700);
        }

        .ltc-card:hover p,
        .ltc-card:focus-visible p {
          color: #475467;
        }

        .ltc-icon {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          color: var(--green-800);
          border-radius: 18px;
          background: linear-gradient(145deg,#eef8f2,#fff);
          box-shadow: inset 0 0 0 1px rgba(35,95,62,.12),0 12px 24px rgba(8,39,25,.08);
          position: relative;
          z-index: 1;
          transition:
            transform .38s var(--ease),
            background .38s var(--ease),
            color .38s var(--ease),
            box-shadow .38s var(--ease);
        }

        .ltc-svg-icon {
          width: 25px;
          height: 25px;
          stroke: currentColor;
          stroke-width: 1.9;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .ltc-card h4 {
          margin: 22px 0 0;
          color: var(--green-950);
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -.04em;
          position: relative;
          z-index: 1;
          transition: color .3s var(--ease);
        }

        .ltc-card p {
          margin: 12px 0 0;
          color: var(--muted);
          font-size: 14px;
          position: relative;
          z-index: 1;
          transition: color .3s var(--ease);
        }

        .ltc-band {
          position: relative;
          overflow: hidden;
          color: white;
          background:
            linear-gradient(135deg,rgba(7,31,20,.98),rgba(35,95,62,.93)),
            radial-gradient(circle at 10% 0%,rgba(215,168,77,.34),transparent 34%);
        }

        .ltc-band::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .13;
          background-image: radial-gradient(rgba(255,255,255,.9) 1px, transparent 1px);
          background-size: 22px 22px;
        }

        .ltc-band-content {
          position: relative;
          display: grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 36px;
          align-items: center;
        }

        .ltc-band h3 {
          margin: 0;
          font-size: clamp(32px,4vw,50px);
          line-height: 1.08;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .ltc-band p {
          margin: 15px 0 0;
          color: rgba(255,255,255,.75);
          max-width: 650px;
        }

        .ltc-stats {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 14px;
        }

        .ltc-stat {
          padding: 22px;
          border-radius: 20px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.16);
          animation: ltcAppleReveal .7s var(--ease) both;
        }

        .ltc-stat strong {
          display: block;
          color: #f4d484;
          font-size: 31px;
          font-weight: 900;
          letter-spacing: -.05em;
        }

        .ltc-stat span {
          display: block;
          color: rgba(255,255,255,.72);
          font-size: 13px;
          font-weight: 700;
          margin-top: 4px;
        }

        .ltc-cta-section {
          padding: 84px 0;
          filter: none !important;
        }

        .ltc-cta-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          padding: clamp(30px,5vw,48px);
          border-radius: 32px;
          color: white;
          background:
            linear-gradient(135deg,rgba(14,51,33,.96),rgba(47,117,76,.9)),
            url("https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1500&q=80") center/cover;
          box-shadow: var(--shadow-lg);
          filter: none !important;
          transform: none;
          animation: none;
        }

        .ltc-cta-box h3 {
          margin: 0;
          font-size: clamp(30px,4vw,46px);
          line-height: 1.1;
          letter-spacing: -.055em;
          font-weight: 900;
          filter: none !important;
        }

        .ltc-cta-box p {
          margin: 12px 0 0;
          color: rgba(255,255,255,.76);
          filter: none !important;
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

        .ltc-promo-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,.72);
          padding: 16px;
        }

        .ltc-promo-card {
          position: relative;
          width: min(100%, 1024px);
          overflow: hidden;
          border-radius: 28px;
          background: white;
          box-shadow: 0 32px 90px rgba(0,0,0,.34);
        }

        .ltc-promo-close {
          position: absolute;
          right: 14px;
          top: 14px;
          z-index: 3;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          border: 0;
          background: rgba(0,0,0,.62);
          color: white;
          cursor: pointer;
        }

        .ltc-promo-close svg {
          width: 24px;
          height: 24px;
        }

        .ltc-promo-media {
          position: relative;
          height: min(500px, 70vh);
          background: #e4e7ec;
        }

        .ltc-promo-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ltc-promo-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,.68), rgba(0,0,0,.18), rgba(0,0,0,.08));
        }

        .ltc-promo-content {
          position: absolute;
          left: clamp(24px, 5vw, 42px);
          right: clamp(24px, 5vw, 42px);
          bottom: 70px;
          color: white;
        }

        .ltc-promo-content h2 {
          margin: 0;
          font-size: clamp(28px,4vw,44px);
          line-height: 1.08;
          font-weight: 900;
        }

        .ltc-promo-content p {
          max-width: 670px;
          margin: 10px 0 0;
          color: rgba(255,255,255,.88);
        }

        .ltc-promo-dots {
          position: absolute;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 9px;
          padding: 9px 12px;
          border-radius: 999px;
          background: rgba(0,0,0,.28);
          backdrop-filter: blur(8px);
        }

        .ltc-promo-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          border: 0;
          background: rgba(255,255,255,.48);
          cursor: pointer;
          transition: .2s var(--ease);
        }

        .ltc-promo-dot.active {
          background: white;
          transform: scale(1.25);
        }

        @keyframes ltcAppleReveal {
          from {
            opacity: 0;
            transform: translateY(34px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ltc-home *,
          .ltc-home *::before,
          .ltc-home *::after {
            animation-duration: .001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .001ms !important;
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

          .ltc-grid-3,
          .ltc-band-content {
            grid-template-columns: 1fr;
          }

          .ltc-footer {
            padding: 28px 0 12px;
          }

          .ltc-footer-grid {
            grid-template-columns: 1fr;
            gap: 18px;
            padding-bottom: 22px;
          }

          .ltc-footer .ltc-container {
            padding-left: 22px;
            padding-right: 22px;
          }

          .ltc-cta-box {
            flex-direction: column;
            align-items: flex-start;
          }

          .ltc-copyright {
            flex-direction: column;
          }

          .ltc-card-center {
            grid-column: auto;
          }
        }

        @media (min-width: 901px) {
          .ltc-card-center {
            grid-column-start: 2;
          }
        }

        @media (max-width: 600px) {
          .ltc-header .ltc-container {
            padding-left: 16px;
            padding-right: 16px;
          }

          .ltc-hero {
            min-height: 620px;
          }

          .ltc-hero h2 {
            font-size: clamp(38px, 12vw, 54px);
            letter-spacing: -.045em;
          }

          .ltc-hero-actions,
          .ltc-btn {
            width: 100%;
          }

          .ltc-stats {
            grid-template-columns: 1fr;
          }

          .ltc-card {
            padding: 26px;
          }

          .ltc-logo h1 {
            font-size: 14px;
          }

          .ltc-logo p {
            font-size: 10px;
          }

          .ltc-promo-media {
            height: 420px;
          }

          .ltc-footer .ltc-container {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
      `}</style>

      {isPromoOpen && (
        <div className="ltc-promo-overlay">
          <div className="ltc-promo-card">
            <button
              onClick={closePromo}
              className="ltc-promo-close"
              aria-label="Close promotional popup"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="ltc-promo-media">
              <img
                src={promoItems[currentPromoIndex].image}
                alt={promoItems[currentPromoIndex].title}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/1600x900/355E3B/FFFFFF?text=Promotional+Ad";
                }}
              />

              <div className="ltc-promo-shade" />

              <div className="ltc-promo-content">
                <h2 style={fontMontserrat}>{promoItems[currentPromoIndex].title}</h2>
                <p style={fontPontano}>{promoItems[currentPromoIndex].description}</p>

                <button
                  type="button"
                  onClick={goToPromoRoute}
                  className="ltc-btn ltc-btn-primary"
                  style={{ ...fontMontserrat, marginTop: "22px" }}
                >
                  {promoItems[currentPromoIndex].buttonText}
                </button>
              </div>

              <div className="ltc-promo-dots">
                {promoItems.map((item, index) => (
                  <button
                    key={item.title}
                    onClick={() => setCurrentPromoIndex(index)}
                    aria-label={`Go to ${item.title}`}
                    className={`ltc-promo-dot ${
                      currentPromoIndex === index ? "active" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="ltc-header">
        <div className="ltc-container ltc-nav">
          <button type="button" onClick={() => goTo("/")} className="ltc-logo">
            <img src={logoSrc} alt="LTC Logo" className="ltc-logo-icon" />

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
                  onClick={() => goTo(link.to)}
                  className={`ltc-nav-link ${isActive ? "active" : ""}`}
                  type="button"
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="ltc-menu-button"
            aria-label="Open menu"
            type="button"
          >
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

      {isSidebarOpen && (
        <div className="ltc-sidebar-overlay">
          <div
            style={{ position: "absolute", inset: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />

          <div className="ltc-sidebar-panel">
            <div className="ltc-sidebar-top">
              <p className="ltc-sidebar-title" style={fontPoppins}>
                MENU
              </p>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="ltc-sidebar-close"
                aria-label="Close menu"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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
                    onClick={() => goTo(link.to)}
                    className={`ltc-sidebar-link ${isActive ? "active" : ""}`}
                    type="button"
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main>
        <section
          className="ltc-hero"
          style={{
            "--hero-image": `url('${bannerSrc}')`,
          }}
        >
          <div className="ltc-container ltc-hero-content">
            <h2 style={fontMontserrat}>{heroTitle}</h2>

            <p style={fontPontano}>{heroSubtitle}</p>

            <div className="ltc-hero-actions">
              <button
                type="button"
                className="ltc-btn ltc-btn-primary"
                style={fontMontserrat}
                onClick={() => {
                  document.getElementById("services")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                Explore Services
              </button>

              <button
                type="button"
                className="ltc-btn ltc-btn-outline"
                style={fontMontserrat}
                onClick={() => goTo(CONTACT_ROUTE)}
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>

        <section id="services" className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-section-title">
              <span>Our Services</span>
              <h3 style={fontMontserrat}>Professional solutions for every business need</h3>
              <p style={fontPontano}>
                Our comprehensive range of services is designed to meet your business needs and
                exceed expectations.
              </p>
            </div>

            <div className="ltc-grid-3">
              {serviceCards.map(({ title, description, route, Icon }) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => navigate(route)}
                  className="ltc-card"
                >
                  <div className="ltc-icon">
                    <Icon />
                  </div>

                  <h4 style={fontMontserrat}>{title}</h4>
                  <p style={fontPontano}>{description}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="ltc-section ltc-band">
          <div className="ltc-container ltc-band-content">
            <div>
              <div className="ltc-eyebrow">Let’s Meet Our Loyalty</div>

              <h3 style={fontMontserrat}>
                Built on integrity, service excellence, and dependable partnership.
              </h3>

              <p style={fontPontano}>
                We support companies with reliable service teams, practical training, and
                professional assessment solutions aligned with real business operations.
              </p>
            </div>

            <div className="ltc-stats">
              <div className="ltc-stat">
                <strong>3+</strong>
                <span>Core Service Areas</span>
              </div>

              <div className="ltc-stat">
                <strong>100%</strong>
                <span>Client-Focused Approach</span>
              </div>

              <div className="ltc-stat">
                <strong>24/7</strong>
                <span>Support Mindset</span>
              </div>

              <div className="ltc-stat">
                <strong>PRO</strong>
                <span>Professional Standards</span>
              </div>
            </div>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-section-title">
              <span>Work With Us</span>
              <h3 style={fontMontserrat}>Values that guide every service</h3>
              <p style={fontPontano}>
                Our work is shaped by principles that help us build trust with clients, partners,
                and professionals.
              </p>
            </div>

            <div className="ltc-grid-3">
              {values.map((value, index) => (
                <article key={value.title} className={getValueCardClass(index, values.length)}>
                  <div className="ltc-icon">
                    {index === 0 ? (
                      <svg viewBox="0 0 24 24" className="ltc-svg-icon">
                        <path d="M12 3 4.5 6v5.8c0 4.7 3.2 7.4 7.5 9.2 4.3-1.8 7.5-4.5 7.5-9.2V6L12 3Z"></path>
                        <path d="m8.8 12.2 2.1 2.1 4.6-4.8"></path>
                      </svg>
                    ) : index === 1 ? (
                      <svg viewBox="0 0 24 24" className="ltc-svg-icon">
                        <path d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11Z"></path>
                        <path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="ltc-svg-icon">
                        <path d="M13 3 4 14h7l-1 7 10-12h-7V3Z"></path>
                      </svg>
                    )}
                  </div>

                  <h4 style={fontMontserrat}>{value.title}</h4>
                  <p style={fontPontano}>{value.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ltc-cta-section">
          <div className="ltc-container">
            <div className="ltc-cta-box">
              <div>
                <h3 style={fontMontserrat}>Ready to experience our services?</h3>
                <p style={fontPontano}>
                  Join our growing list of satisfied clients and experience our exceptional services
                  firsthand.
                </p>
              </div>

              <button
                type="button"
                onClick={() => goTo(CONTACT_ROUTE)}
                className="ltc-btn ltc-btn-primary"
                style={fontMontserrat}
              >
                Contact Us Today
              </button>
            </div>
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
              <FooterLink onClick={() => goTo(CONTACT_ROUTE)}>Contact Us</FooterLink>
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

export default Home;
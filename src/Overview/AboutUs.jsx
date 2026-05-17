import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";
import { getPublicLtcContent, pickPublicLtcImage } from "./ltcContentApi";

const LOGO = "/LTCLogo.jpg";
const BANNER_SRC = "/LTCBanner.png";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontActor = { fontFamily: "'Actor', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const RevealOnScroll = ({ children, className = "", delay = 0, y = 20 }) => {
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

const EyeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="ltc-svg-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
    />
    <circle cx="12" cy="12" r="2.75" />
  </svg>
);

const FlagIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="ltc-svg-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h12l-1.5 3L17 10H5V4z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" className="ltc-star-icon" fill="currentColor">
    <path d="M12 2.5l2.86 6.12 6.64.57-5.03 4.35 1.52 6.46L12 16.9 6.01 20l1.52-6.46L2.5 9.19l6.64-.57L12 2.5z" />
  </svg>
);

const FooterLink = ({ children, onClick }) => (
  <li>
    <button type="button" onClick={onClick} className="ltc-footer-link">
      {children}
    </button>
  </li>
);

const AboutUs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Photos");
  const [ltcContent, setLtcContent] = useState(null);

  const goTo = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const logoSrc = pickPublicLtcImage(ltcContent?.company?.logoUrl, LOGO);
  const bannerSrc = pickPublicLtcImage(ltcContent?.company?.bannerUrl, BANNER_SRC);

  const navLinks = [
    { label: "HOME", to: "/" },
    { label: "ABOUT US", to: "/about-us" },
    { label: "TEAM", to: "/team" },
    { label: "CONTACT", to: "/contact" },
  ];

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

  const defaultTimeline = [
    {
      side: "right",
      date: "May 1989",
      title: "LTC Staffing Center, Inc.",
      body:
        "Started as LTC Staffing Center, Inc., duly authorized under DOLE Department Order Number 174 with License Number NCR-MFPO-7B10-041223-499-R.",
    },
    {
      side: "left",
      date: "January 2013",
      title: "LTC-Multi Services and Training Center, Inc.",
      body:
        "By majority vote of the Board of Directors and Stock Holders, the corporate name was changed to provide different business sectors a total solution for HR support services and quality training.",
    },
    {
      side: "right",
      date: "September 24, 2019",
      title: "LTC Training Assessment and Multi Services, Inc.",
      body: [
        "The company again considered amending its name to assist the country's nation building and economic recovery, now with different business models spearheaded by competent managers.",
        "1. Manpower Services",
        "2. Training & Assessment",
        "3. System Services",
        "4. Hotel & Resort",
      ],
    },
    {
      side: "left",
      date: "Present Day",
      title: "Strategic Location",
      body:
        "Our business office is strategically located at 5411 Light Tower Center & Realty Development, Inc., Building II, Curie Street, Palanan, Makati City.",
    },
  ];

  const timeline = ltcContent?.timeline?.length ? ltcContent.timeline : defaultTimeline;

  const lightCards = [
    {
      letter: "L",
      title: "LOYALTY",
      body:
        "We take pride in recognizing our employees as our most valuable assets for they are the ones who remain with us for a lengthy period because they are valued, appreciated, and contribute to the company's overall mission and success.",
    },
    {
      letter: "I",
      title: "INTEGRITY",
      body:
        "We honor our word and keep our commitments. We keep ourselves a reliable source of information because it is the foundation of our individual and corporate actions that drives the organization of which we are proud.",
    },
    {
      letter: "G",
      title: "GOD-FEARING",
      body:
        "We put GOD first in everything that we do. We respect individual differences and take control to overcome issues that may affect a harmonious working relationship.",
    },
    {
      letter: "H",
      title: "HARDWORK",
      body:
        "We convert ideas into action, tackle tasks without delay as we respond rapidly to changing information or business needs. In order to achieve true success, we all need the strength of mind and body to struggle and work hard to reach our fullest potential.",
    },
    {
      letter: "T",
      title: "TRUSTWORTHINESS",
      body:
        "We take accountability for our actions and required results. We work using our intelligent judgment to execute actions and decisions that need to be made. It is an essential moral value that ensures dependability, credibility, and truthfulness.",
    },
  ];

  const defaultAchievements = [
    {
      title: "NUMBER ONE PLACEMENT AGENCY (2012)",
      body:
        "For having most number of local placements during the 2012 Labor Day Job & Livelihood Fair",
      footer:
        "Awarded by: Department of Labor & Employment (DOLE)\nGiven: May 1, 2012 | World Trade Center, Pasay City",
    },
    {
      title: "GINTONG LANDAS PROJECT SUPPORT",
      body: "For generous support to Gintong Landas Project 2018 & 2022",
      footer:
        "Awarded by: Create a Job for Disabled Association, Inc.\nGiven: 2018 & 2022 | City of Manila",
    },
    {
      title: "APPRECIATION TO MS. LORNA T. CASTIGADOR",
      body:
        "For her unselfish devotion, continuous support and efforts to help members attain professional, spiritual, economic & social goals",
      footer:
        "Awarded by: Philippine Cocoa Corporation\nGiven: July 17, 1996 | LTC Staffing Center, Inc.",
    },
  ];

  const defaultHighlightCategories = [
    "All Photos",
    "Hotel & Resort",
    "Training & Assessment",
    "Manpower",
  ];

  const defaultHighlightItems = [
    {
      title: "Training Facility",
      subtitle: "Skills development and classroom sessions",
      category: "Training & Assessment",
      image: "/training-facility.png",
    },
    {
      title: "Hotel Operations",
      subtitle: "Hospitality and guest service area",
      category: "Hotel & Resort",
      image: "/hotel-resort.png",
    },
    {
      title: "Manpower Deployment",
      subtitle: "Reliable staffing support solutions",
      category: "Manpower",
      image: "/manpower-services.png",
    },
    {
      title: "Assessment Center",
      subtitle: "Evaluation and certification support",
      category: "Training & Assessment",
      image: "/assessment-center.png",
    },
    {
      title: "Workforce Support",
      subtitle: "Professional business assistance",
      category: "Manpower",
      image: "/workforce-support.png",
    },
    {
      title: "Guest Experience",
      subtitle: "Hospitality-focused operations",
      category: "Hotel & Resort",
      image: "/guest-experience.png",
    },
  ];

  const apiAchievements = Array.isArray(ltcContent?.achievements)
    ? ltcContent.achievements
    : [];
  const achievements = apiAchievements.length ? apiAchievements : defaultAchievements;

  const apiHighlights = Array.isArray(ltcContent?.highlights)
    ? ltcContent.highlights.map((item) => ({
        ...item,
        image: pickPublicLtcImage(item.image),
      }))
    : [];
  const highlightItems = apiHighlights.length ? apiHighlights : defaultHighlightItems;

  const highlightCategories = useMemo(() => {
    const categories = [
      "All Photos",
      ...Array.from(new Set(highlightItems.map((item) => item.category).filter(Boolean))),
    ];

    return categories.length > 1 ? categories : defaultHighlightCategories;
  }, [highlightItems]);

  useEffect(() => {
    if (selectedCategory === "All Photos") return;

    const exists = highlightCategories.includes(selectedCategory);

    if (!exists) setSelectedCategory("All Photos");
  }, [highlightCategories, selectedCategory]);

  const visibleHighlights = useMemo(() => {
    if (selectedCategory === "All Photos") return highlightItems;

    return highlightItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, highlightItems]);

  return (
    <div className="ltc-about" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .ltc-about {
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

        .ltc-about * {
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

        .ltc-about-hero {
          position: relative;
          overflow: hidden;
          color: white;
          isolation: isolate;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
          padding: 82px 0 78px;
        }

        .ltc-about-hero::before {
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

        .ltc-about-hero::after {
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

        .ltc-about-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .ltc-about-hero h2 {
          margin: 0;
          color: white;
          font-size: clamp(34px, 5vw, 58px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.055em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .ltc-about-hero h2 span {
          color: var(--gold-soft);
        }

        .ltc-about-hero p {
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

        .ltc-timeline {
          position: relative;
          max-width: 1060px;
          margin: 0 auto;
        }

        .ltc-timeline::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          background: linear-gradient(var(--green-700), var(--gold));
          transform: translateX(-50%);
          opacity: .65;
        }

        .ltc-timeline-row {
          position: relative;
          display: flex;
          min-height: 180px;
          align-items: center;
        }

        .ltc-timeline-row.left {
          justify-content: flex-start;
        }

        .ltc-timeline-row.right {
          justify-content: flex-end;
        }

        .ltc-timeline-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: var(--gold-soft);
          border: 4px solid var(--green-800);
          transform: translate(-50%, -50%);
          z-index: 2;
          box-shadow: 0 10px 22px rgba(8,39,25,.18);
        }

        .ltc-timeline-card {
          width: 43%;
          position: relative;
          overflow: hidden;
          padding: 28px;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(18px);
          transition: .38s var(--ease);
        }

        .ltc-timeline-card::before,
        .ltc-info-card::before,
        .ltc-value-card::before,
        .ltc-achievement-card::before,
        .ltc-highlight-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
        }

        .ltc-timeline-card:hover,
        .ltc-info-card:hover,
        .ltc-value-card:hover,
        .ltc-achievement-card:hover,
        .ltc-highlight-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(215,168,77,.45);
        }

        .ltc-timeline-card .date {
          color: var(--green-700);
          font-size: 14px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .ltc-timeline-card h4 {
          margin: 8px 0 0;
          color: var(--green-950);
          font-size: 24px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -.04em;
        }

        .ltc-timeline-card p,
        .ltc-timeline-body {
          margin: 12px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .ltc-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        .ltc-info-card,
        .ltc-value-card,
        .ltc-achievement-card,
        .ltc-highlight-card {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(18px);
          transition: .38s var(--ease);
        }

        .ltc-info-card {
          padding: 34px;
          text-align: center;
        }

        .ltc-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto;
          display: grid;
          place-items: center;
          color: var(--green-800);
          border-radius: 20px;
          background: linear-gradient(145deg,#eef8f2,#fff);
          box-shadow: inset 0 0 0 1px rgba(35,95,62,.12),0 12px 24px rgba(8,39,25,.08);
          transition: .35s var(--ease);
        }

        .ltc-info-card:hover .ltc-icon,
        .ltc-achievement-card:hover .ltc-icon {
          transform: translateY(-4px) scale(1.06);
          background: linear-gradient(145deg,#fff7dc,#ffffff);
        }

        .ltc-svg-icon {
          width: 30px;
          height: 30px;
          stroke: currentColor;
          stroke-width: 1.9;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .ltc-info-card h4 {
          margin: 22px 0 0;
          color: var(--green-950);
          font-size: 28px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -.04em;
        }

        .ltc-info-card p {
          max-width: 520px;
          margin: 14px auto 0;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.75;
        }

        .ltc-values-wrap {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .ltc-value-card {
          display: grid;
          grid-template-columns: 92px 1fr;
          min-height: 132px;
        }

        .ltc-value-letter {
          display: grid;
          place-items: center;
          background: rgba(35,95,62,.08);
          color: var(--green-800);
          font-size: 54px;
          font-weight: 900;
          border-right: 1px solid rgba(35,95,62,.14);
        }

        .ltc-value-content {
          padding: 26px 28px;
        }

        .ltc-value-content h4 {
          margin: 0;
          color: var(--green-950);
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -.04em;
        }

        .ltc-value-content p {
          margin: 10px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.7;
        }

        .ltc-quote {
          max-width: 820px;
          margin: 36px auto 0;
          color: var(--green-700);
          text-align: center;
          font-size: clamp(22px, 3vw, 32px);
          line-height: 1.45;
          font-style: italic;
        }

        .ltc-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          align-items: stretch;
        }

        .ltc-achievement-card {
          height: 100%;
          min-height: 245px;
          padding: 26px 22px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }

        .ltc-achievement-card .ltc-icon {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          flex: 0 0 auto;
        }

        .ltc-star-icon {
          width: 28px;
          height: 28px;
          color: var(--gold-soft);
          filter: drop-shadow(0 8px 12px rgba(215,168,77,.24));
        }

        .ltc-achievement-card h4 {
          margin: 16px 0 0;
          color: var(--green-950);
          font-size: 14px;
          line-height: 1.3;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .035em;
          max-width: 95%;
        }

        .ltc-achievement-card p {
          margin: 12px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.55;
        }

        .ltc-achievement-footer {
          white-space: pre-line;
          color: rgba(102,112,133,.86) !important;
          font-size: 11.5px !important;
          line-height: 1.45 !important;
          margin-top: 12px !important;
        }

        .ltc-filter-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-bottom: 34px;
        }

        .ltc-filter-button {
          min-height: 42px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(35,95,62,.18);
          background: rgba(255,255,255,.78);
          color: var(--green-800);
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(8,39,25,.08);
          transition: .28s var(--ease);
        }

        .ltc-filter-button:hover,
        .ltc-filter-button.active {
          transform: translateY(-2px);
          background: var(--green-800);
          color: white;
          border-color: var(--green-800);
        }

        .ltc-highlight-card {
          padding: 0;
        }

        .ltc-highlight-media {
          height: 220px;
          overflow: hidden;
          background: #e4e7ec;
        }

        .ltc-highlight-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: .45s var(--ease);
        }

        .ltc-highlight-card:hover img {
          transform: scale(1.06);
        }

        .ltc-highlight-content {
          padding: 22px;
        }

        .ltc-highlight-content h4 {
          margin: 0;
          color: var(--green-950);
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -.03em;
        }

        .ltc-highlight-content p {
          margin: 6px 0 0;
          color: var(--muted);
          font-size: 13px;
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

          .ltc-grid-2,
          .ltc-grid-3,
          .ltc-footer-grid {
            grid-template-columns: 1fr;
          }

          .ltc-timeline::before {
            left: 9px;
          }

          .ltc-timeline-row,
          .ltc-timeline-row.left,
          .ltc-timeline-row.right {
            justify-content: flex-start;
            padding-left: 34px;
            min-height: auto;
            margin-bottom: 22px;
          }

          .ltc-timeline-dot {
            left: 9px;
          }

          .ltc-timeline-card {
            width: 100%;
          }

          .ltc-achievement-card {
            min-height: 230px;
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

          .ltc-about-hero {
            padding: 70px 0 66px;
          }

          .ltc-about-hero h2 {
            font-size: clamp(34px, 11vw, 46px);
            letter-spacing: -.045em;
          }

          .ltc-about-hero p {
            font-size: 15px;
          }

          .ltc-section {
            padding: 64px 0;
          }

          .ltc-value-card {
            grid-template-columns: 70px 1fr;
          }

          .ltc-value-letter {
            font-size: 42px;
          }

          .ltc-value-content {
            padding: 22px 20px;
          }
        }
      `}</style>

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
          className="ltc-about-hero"
          style={{
            "--hero-image": `url('${bannerSrc}')`,
          }}
        >
          <div className="ltc-container ltc-about-hero-content">
            <RevealOnScroll>
              <h2 style={fontMontserrat}>
                About <span>Us</span>
              </h2>

              <p style={fontPontano}>
                Learn about our history, mission, vision, corporate values, achievements, and
                highlights.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <RevealOnScroll className="ltc-section-title">
              <span>Our Company</span>
              <h3 style={fontMontserrat}>A legacy of service, training, and support</h3>
              <p style={fontPontano}>
                From staffing services to multi-service training and assessment, LTC continues to
                support professionals, business partners, and communities.
              </p>
            </RevealOnScroll>

            <div className="ltc-timeline">
              {timeline.map((item, index) => {
                const isLeft = item.side === "left";
                const bodyLines = Array.isArray(item.body)
                  ? item.body
                  : String(item.body || "")
                      .split(/\r?\n/)
                      .map((line) => line.trim())
                      .filter(Boolean);

                return (
                  <RevealOnScroll
                    key={`${item.title}-${index}`}
                    delay={index * 90}
                    className={`ltc-timeline-row ${isLeft ? "left" : "right"}`}
                  >
                    <div className="ltc-timeline-dot" />

                    <article className="ltc-timeline-card">
                      <p className="date" style={fontPoppins}>
                        {item.date}
                      </p>

                      <h4 style={fontMontserrat}>{item.title}</h4>

                      {bodyLines.length === 1 ? (
                        <p style={fontPontano}>{bodyLines[0]}</p>
                      ) : (
                        <div className="ltc-timeline-body" style={fontPontano}>
                          {bodyLines.map((line, lineIndex) => (
                            <p key={lineIndex}>{line}</p>
                          ))}
                        </div>
                      )}
                    </article>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </section>

        <section className="ltc-section" style={{ paddingTop: 0 }}>
          <div className="ltc-container">
            <div className="ltc-grid-2">
              <RevealOnScroll>
                <article className="ltc-info-card">
                  <div className="ltc-icon">
                    <EyeIcon />
                  </div>

                  <h4 style={fontMontserrat}>Our Vision</h4>

                  <p style={fontActor}>
                    "To be the most reliable partner of government and corporate industry in
                    providing quality technical vocational training, hospitality services,
                    assessment, and job services Globally."
                  </p>
                </article>
              </RevealOnScroll>

              <RevealOnScroll delay={100}>
                <article className="ltc-info-card">
                  <div className="ltc-icon">
                    <FlagIcon />
                  </div>

                  <h4 style={fontMontserrat}>Our Mission</h4>

                  <p style={fontActor}>
                    "To be the Top of the Mind provider of training, assessment and job services
                    for professionals and business partners that value high level of technical
                    proficiency, competence, and reliability without compromising workforce
                    quality."
                  </p>
                </article>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="ltc-section" style={{ paddingTop: 0 }}>
          <div className="ltc-container">
            <RevealOnScroll className="ltc-section-title">
              <span>Our Corporate Values</span>
              <h3 style={fontMontserrat}>Values that guide every service</h3>
              <p style={fontPontano}>
                Values are the principles or standards of behavior that are considered important in
                life. Our values are the rules by which we operate. We carry out our business in
                Quality Relationship, which are honest, ethical, caring and God-Fearing.
              </p>
            </RevealOnScroll>

            <div className="ltc-values-wrap">
              {lightCards.map((card, index) => (
                <RevealOnScroll key={card.title} delay={index * 80}>
                  <article className="ltc-value-card">
                    <div className="ltc-value-letter" style={fontMontserrat}>
                      {card.letter}
                    </div>

                    <div className="ltc-value-content">
                      <h4 style={fontMontserrat}>{card.title}</h4>
                      <p style={fontPontano}>{card.body}</p>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll delay={100}>
              <p className="ltc-quote" style={fontActor}>
                A symbol of holiness, goodness, knowledge, wisdom, grace, hope, and God&apos;s
                revelation.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        <section className="ltc-section" style={{ paddingTop: 0 }}>
          <div className="ltc-container">
            <RevealOnScroll className="ltc-section-title">
              <span>Recognition</span>
              <h3 style={fontMontserrat}>Our Achievements</h3>
              <p style={fontPontano}>
                These recognitions represent the company&apos;s continued dedication to professional
                service, placements, support, and community partnership.
              </p>
            </RevealOnScroll>

            <div className="ltc-grid-3">
              {achievements.map((item, index) => (
                <RevealOnScroll key={`${item.title}-${index}`} delay={index * 80}>
                  <article className="ltc-achievement-card">
                    <div className="ltc-icon">
                      <StarIcon />
                    </div>

                    <h4 style={fontMontserrat}>{item.title}</h4>
                    <p style={fontPontano}>{item.body}</p>
                    <p className="ltc-achievement-footer" style={fontActor}>
                      {item.footer}
                    </p>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        <section className="ltc-section" style={{ paddingTop: 0 }}>
          <div className="ltc-container">
            <RevealOnScroll className="ltc-section-title">
              <span>Gallery</span>
              <h3 style={fontMontserrat}>Our Highlights</h3>
              <p style={fontPontano}>
                Explore highlights across our services, facilities, manpower support, and
                hospitality-focused operations.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={60}>
              <div className="ltc-filter-row" style={fontPoppins}>
                {highlightCategories.map((category) => {
                  const active = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`ltc-filter-button ${active ? "active" : ""}`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </RevealOnScroll>

            <div className="ltc-grid-3">
              {visibleHighlights.slice(0, 6).map((item, index) => (
                <RevealOnScroll key={`${item.title}-${index}`} delay={index * 70}>
                  <article className="ltc-highlight-card">
                    <div className="ltc-highlight-media">
                      <img
                        src={item.image}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/900x600/355E3B/FFFFFF?text=LTC+Highlight";
                        }}
                      />
                    </div>

                    <div className="ltc-highlight-content">
                      <h4 style={fontMontserrat}>{item.title}</h4>
                      <p style={fontPontano}>{item.subtitle}</p>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
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

export default AboutUs;
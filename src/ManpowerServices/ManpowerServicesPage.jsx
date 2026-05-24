import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE, manpowerUrl } from "./manpowerApi";

const LOGO_IMAGE = "/ManpowerLogo.png";
const HERO_IMAGE = "/ManpowerBanner.png";

const MANPOWER_HOME_ROUTE = "/manpower-services";
const API_ORIGIN = API_BASE.replace(/\/api$/i, "");

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const FALLBACK_HIGHLIGHTS = [
  {
    _id: "fallback-1",
    title: "Manpower Highlight 1",
    subtitle: "Reliable staffing support for business operations.",
    imageUrl: "/manpower-highlight-1.jpg",
  },
  {
    _id: "fallback-2",
    title: "Manpower Highlight 2",
    subtitle: "Connecting companies with skilled workers.",
    imageUrl: "/manpower-highlight-2.jpg",
  },
  {
    _id: "fallback-3",
    title: "Manpower Highlight 3",
    subtitle: "Professional workforce assistance you can trust.",
    imageUrl: "/manpower-highlight-3.jpg",
  },
];

function resolveImageSource(value = "") {
  const raw = String(value || "").trim();

  if (!raw) return "";

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  if (raw.startsWith("/api/")) {
    return `${API_ORIGIN}${raw}`;
  }

  if (raw.startsWith("/manpower/files/")) {
    return manpowerUrl(raw);
  }

  return raw;
}

function DocumentPenIcon(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <path
        d="M17 10h25l8 8v35a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M42 10v10h10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M22 28h18M22 36h15M22 44h10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="m39 51 10.5-10.5a3.2 3.2 0 0 0-4.5-4.5L34.5 46.5V52h4.5Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 6 6 6-6 6" />
    </svg>
  );
}


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

function FooterLink({ children, to, onClick }) {
  return (
    <li>
      {to ? (
        <Link to={to} className="ltc-footer-link">
          {children}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className="ltc-footer-link">
          {children}
        </button>
      )}
    </li>
  );
}

function ServiceCard({ title, description, to }) {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate(to)} className="ltc-card">
      <div className="ltc-icon">
        <DocumentPenIcon className="ltc-svg-icon" />
      </div>

      <h4 style={fontMontserrat}>{title}</h4>
      <p style={fontPontano}>{description}</p>
      <span className="ltc-card-link" style={fontPoppins}>
        Open <ArrowIcon />
      </span>
    </button>
  );
}

function HighlightCard({ highlight, index }) {
  const imageSrc = resolveImageSource(highlight?.imageUrl);

  return (
    <article className="ltc-highlight-card">
      <div className="ltc-highlight-media">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={highlight?.title || `Manpower highlight ${index + 1}`}
            onError={(event) => {
              event.currentTarget.src =
                "https://placehold.co/900x600/235F3E/FFFFFF?text=Manpower+Highlight";
            }}
          />
        ) : (
          <div className="ltc-highlight-empty">No image</div>
        )}
      </div>

      <div className="ltc-highlight-content">
        <p className="ltc-highlight-label" style={fontPoppins}>Highlight {index + 1}</p>
        {highlight?.title ? <h4 style={fontMontserrat}>{highlight.title}</h4> : null}
        {highlight?.subtitle ? <p style={fontPontano}>{highlight.subtitle}</p> : null}
      </div>
    </article>
  );
}

export default function ManpowerServicesPage() {
  const [highlights, setHighlights] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: "Home", to: MANPOWER_HOME_ROUTE },
    { label: "Job Offer", to: "/manpower-positions" },
    { label: "Requirements", to: "/manpower-requirements" },
    { label: "Contact", to: "/manpower-contact" },
    { label: "FAQs", to: "/manpower-faqs" },
  ];

  const serviceCards = [
    {
      title: "Apply Now",
      description: "Start your journey here at manpower and submit your application details.",
      to: "/manpower-apply",
    },
    {
      title: "Job Offer",
      description: "See the list of jobs we offer and find the right opportunity for you.",
      to: "/manpower-positions",
    },
    {
      title: "Requirements",
      description: "Review all requirements you need to submit before applying.",
      to: "/manpower-requirements",
    },
  ];

  const goTo = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    let ignore = false;

    async function loadHighlights() {
      try {
        const res = await fetch(manpowerUrl("manpower/highlights"));
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load highlights.");
        }

        if (!ignore) {
          const list = Array.isArray(data?.highlights) ? data.highlights : [];
          setHighlights(list.filter((item) => item?.imageUrl));
        }
      } catch {
        if (!ignore) {
          setHighlights([]);
        }
      }
    }

    loadHighlights();

    return () => {
      ignore = true;
    };
  }, []);

  const displayHighlights = highlights.length ? highlights : FALLBACK_HIGHLIGHTS;

  const visibleHighlights = useMemo(() => {
    if (displayHighlights.length <= 3) return displayHighlights;

    return [0, 1, 2].map((offset) => {
      const nextIndex = (highlightIndex + offset) % displayHighlights.length;
      return displayHighlights[nextIndex];
    });
  }, [displayHighlights, highlightIndex]);

  function goPreviousHighlight() {
    setHighlightIndex((current) => {
      if (!displayHighlights.length) return 0;
      return (current - 1 + displayHighlights.length) % displayHighlights.length;
    });
  }

  function goNextHighlight() {
    setHighlightIndex((current) => {
      if (!displayHighlights.length) return 0;
      return (current + 1) % displayHighlights.length;
    });
  }

  return (
    <div className="ltc-about ltc-manpower-page" style={fontPontano}>
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

        .ltc-about * { box-sizing: border-box; }

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
          text-decoration: none;
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
          margin-left: auto;
          display: flex;
          align-items: center;
          justify-content: flex-end;
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
          text-decoration: none;
        }

        .ltc-nav-link:hover,
        .ltc-nav-link.active {
          color: white;
          background: rgba(255,255,255,.13);
          transform: translateY(-1px);
        }

        .ltc-sign-in {
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.18);
        }

        .ltc-sign-in:hover {
          color: #102418;
          background: linear-gradient(135deg,#ffe39a,#d7a84d);
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
          isolation: isolate;
          color: white;
          padding: 112px 0 96px;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
        }

        .ltc-about-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -3;
          background:
            linear-gradient(120deg, rgba(2,18,11,.96), rgba(5,37,23,.89), rgba(12,64,39,.78)),
            var(--hero-image) center center / cover no-repeat;
          background-blend-mode: multiply;
          opacity: .98;
        }

        .ltc-about-hero::after {
          content: "";
          position: absolute;
          inset: -18% -12% -25% -12%;
          z-index: -2;
          background:
            radial-gradient(circle at 16% 82%, rgba(19,120,72,.36), transparent 24%),
            radial-gradient(circle at 72% 18%, rgba(28,108,68,.28), transparent 30%),
            radial-gradient(circle at 88% 44%, rgba(244,212,132,.14), transparent 28%);
          filter: blur(28px);
        }

        .ltc-about-hero-content {
          position: relative;
          width: min(960px, 92%);
          margin: 0 auto;
          text-align: center;
          animation: ltcAppleReveal .8s var(--ease) both;
        }

        .ltc-eyebrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.18);
          background: rgba(255,255,255,.1);
          padding: 8px 14px;
          color: #f4d484;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }

        .ltc-about-hero h2 {
          margin: 18px auto 0;
          max-width: 980px;
          font-size: clamp(42px, 6vw, 76px);
          line-height: .98;
          font-weight: 900;
          letter-spacing: -.065em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .ltc-about-hero h2 span {
          color: var(--gold-soft);
        }

        .ltc-about-hero p {
          max-width: 720px;
          margin: 24px auto 0;
          color: rgba(255,255,255,.82);
          font-size: 18px;
          line-height: 1.8;
        }

        .ltc-hero-actions {
          margin-top: 34px;
          display: flex;
          justify-content: center;
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
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .ltc-card {
          position: relative;
          overflow: hidden;
          padding: 32px;
          min-height: 250px;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          transition: transform .38s var(--ease), box-shadow .38s var(--ease), border-color .38s var(--ease), background .38s var(--ease);
          animation: ltcAppleReveal .7s var(--ease) both;
          backdrop-filter: blur(18px);
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
          background: radial-gradient(circle, rgba(215,168,77,.22), transparent 58%), radial-gradient(circle, rgba(47,117,76,.18), transparent 66%);
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
        }

        .ltc-card:hover::after,
        .ltc-card:focus-visible::after {
          transform: translate(-20px, -18px) scale(1.18);
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
          transition: transform .38s var(--ease), background .38s var(--ease), color .38s var(--ease), box-shadow .38s var(--ease);
        }

        .ltc-svg-icon {
          width: 28px;
          height: 28px;
          stroke: currentColor;
          stroke-width: 2.2;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .ltc-card:hover .ltc-icon,
        .ltc-card:focus-visible .ltc-icon {
          transform: translateY(-5px) scale(1.08) rotate(-2deg);
          color: var(--green-950);
          background: linear-gradient(145deg,#fff7dc,#ffffff);
          box-shadow: inset 0 0 0 1px rgba(215,168,77,.35), 0 18px 34px rgba(8,39,25,.16);
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

        .ltc-card-link {
          position: relative;
          z-index: 1;
          margin-top: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .12em;
        }

        .ltc-card-link svg {
          width: 16px;
          height: 16px;
          transition: transform .28s var(--ease);
        }

        .ltc-card:hover .ltc-card-link svg {
          transform: translateX(4px);
        }

        .ltc-band {
          position: relative;
          overflow: hidden;
          color: white;
          background: linear-gradient(135deg,rgba(7,31,20,.98),rgba(35,95,62,.93)), radial-gradient(circle at 10% 0%,rgba(215,168,77,.34),transparent 34%);
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
          grid-template-columns: 1fr;
          gap: 34px;
          align-items: center;
        }

        .ltc-band-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 24px;
        }

        .ltc-band h3 {
          margin: 12px 0 0;
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

        .ltc-highlight-buttons {
          display: flex;
          gap: 10px;
        }

        .ltc-circle-btn {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.2);
          color: white;
          background: rgba(255,255,255,.1);
          cursor: pointer;
          transition: .25s var(--ease);
        }

        .ltc-circle-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          background: rgba(255,255,255,.18);
        }

        .ltc-circle-btn:disabled {
          opacity: .35;
          cursor: not-allowed;
        }

        .ltc-highlight-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .ltc-highlight-card {
          overflow: hidden;
          border-radius: var(--radius);
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.18);
          box-shadow: 0 26px 70px rgba(0,0,0,.22);
          animation: ltcAppleReveal .7s var(--ease) both;
          transition: transform .38s var(--ease), box-shadow .38s var(--ease), border-color .38s var(--ease);
        }

        .ltc-highlight-card:hover {
          transform: translateY(-10px);
          border-color: rgba(244,212,132,.45);
          box-shadow: 0 34px 90px rgba(0,0,0,.30);
        }

        .ltc-highlight-media {
          height: 250px;
          overflow: hidden;
          background: rgba(255,255,255,.1);
        }

        .ltc-highlight-media img,
        .ltc-highlight-empty {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .45s var(--ease);
        }

        .ltc-highlight-empty {
          display: grid;
          place-items: center;
          color: rgba(255,255,255,.7);
          font-weight: 900;
        }

        .ltc-highlight-card:hover img {
          transform: scale(1.08);
        }

        .ltc-highlight-content {
          padding: 22px;
        }

        .ltc-highlight-label {
          margin: 0 0 8px !important;
          color: var(--gold-soft) !important;
          font-size: 11px !important;
          font-weight: 900 !important;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .ltc-highlight-content h4 {
          margin: 0;
          color: white;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -.04em;
        }

        .ltc-highlight-content p {
          margin: 8px 0 0;
          color: rgba(255,255,255,.78);
          font-size: 13px;
        }

        .ltc-cta-section {
          padding: 84px 0;
        }

        .ltc-cta-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          padding: clamp(30px,5vw,48px);
          border-radius: 32px;
          color: white;
          background: linear-gradient(135deg,rgba(14,51,33,.96),rgba(47,117,76,.9)), url("https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1500&q=80") center/cover;
          box-shadow: var(--shadow-lg);
        }

        .ltc-cta-box h3 {
          margin: 0;
          font-size: clamp(30px,4vw,46px);
          line-height: 1.1;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .ltc-cta-box p {
          margin: 12px 0 0;
          color: rgba(255,255,255,.76);
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
          text-decoration: none;
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

        @keyframes ltcAppleReveal {
          from { opacity: 0; transform: translateY(34px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ltc-about *,
          .ltc-about *::before,
          .ltc-about *::after {
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

          .ltc-desktop-nav,
          .ltc-header-signin {
            display: none;
          }

          .ltc-menu-button {
            display: grid;
            place-items: center;
          }

          .ltc-grid-3,
          .ltc-highlight-grid,
          .ltc-footer-grid {
            grid-template-columns: 1fr;
          }

          .ltc-about-hero {
            padding: 84px 0 76px;
          }

          .ltc-band-heading,
          .ltc-cta-box {
            flex-direction: column;
            align-items: flex-start;
          }

          .ltc-highlight-buttons {
            align-self: stretch;
          }

          .ltc-circle-btn {
            flex: 1;
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

          .ltc-about-hero h2 {
            font-size: clamp(34px, 11vw, 46px);
            letter-spacing: -.045em;
          }

          .ltc-about-hero p {
            font-size: 15px;
          }

          .ltc-section,
          .ltc-cta-section {
            padding: 64px 0;
          }

          .ltc-hero-actions,
          .ltc-btn {
            width: 100%;
          }

          .ltc-card {
            padding: 26px;
          }
        }
      `}</style>

      <header className="ltc-header">
        <div className="ltc-container ltc-nav">
          <Link to={MANPOWER_HOME_ROUTE} className="ltc-logo">
            <img src={LOGO_IMAGE} alt="Manpower Logo" className="ltc-logo-icon" />
            <div>
              <h1 style={fontMontserrat}>LTC Manpower Services</h1>
              <p style={fontPontano}>Reliable staffing and workforce solutions.</p>
            </div>
          </Link>

          <nav className="ltc-desktop-nav" style={fontPoppins}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;

              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`ltc-nav-link ${isActive ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/manpower-employee-login"
            className="ltc-nav-link ltc-sign-in ltc-header-signin"
          >
            Sign In
          </Link>

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
              <p className="ltc-sidebar-title" style={fontPoppins}>MENU</p>
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

              <button
                onClick={() => goTo("/manpower-employee-login")}
                className="ltc-sidebar-link"
                type="button"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        <section
          className="ltc-about-hero"
          style={{
            "--hero-image": `url('${HERO_IMAGE}')`,
          }}
        >
          <div className="ltc-container ltc-about-hero-content">
            <h2 style={fontMontserrat}>
              Begin your journey with <span>LTC Manpower Services</span> today.
            </h2>
            <p style={fontPontano}>
              Explore job opportunities, submit your requirements, and start your application with reliable staffing support from LTC Manpower Services.
            </p>
            <div className="ltc-hero-actions">
              <button
                type="button"
                className="ltc-btn ltc-btn-primary"
                style={fontMontserrat}
                onClick={() => goTo("/manpower-apply")}
              >
                Apply Now
              </button>
              <button
                type="button"
                className="ltc-btn ltc-btn-outline"
                style={fontMontserrat}
                onClick={() => goTo("/manpower-positions")}
              >
                View Job Offers
              </button>
            </div>
          </div>
        </section>

        <section id="services" className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-section-title">
              <span>Quick Access</span>
              <h3 style={fontMontserrat}>Manpower solutions made easier</h3>
              <p style={fontPontano}>
                Use these shortcuts to apply, view available job offers, and prepare your requirements.
              </p>
            </div>

            <div className="ltc-grid-3">
              {serviceCards.map((card) => (
                <ServiceCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  to={card.to}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="ltc-section ltc-band">
          <div className="ltc-container ltc-band-content">
            <div className="ltc-band-heading">
              <div>
                <div className="ltc-eyebrow" style={fontPoppins}>Our Highlights</div>
                <h3 style={fontMontserrat}>Workforce stories and service highlights.</h3>
                <p style={fontPontano}>
                  Browse the latest manpower highlights uploaded by the admin team.
                </p>
              </div>

              <div className="ltc-highlight-buttons">
                <button
                  type="button"
                  aria-label="Previous highlight"
                  onClick={goPreviousHighlight}
                  disabled={displayHighlights.length <= 3}
                  className="ltc-circle-btn"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M15 18 9 12l6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next highlight"
                  onClick={goNextHighlight}
                  disabled={displayHighlights.length <= 3}
                  className="ltc-circle-btn"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="ltc-highlight-grid">
              {visibleHighlights.map((highlight, index) => (
                <HighlightCard
                  key={highlight?._id || `${highlight?.imageUrl}-${index}`}
                  highlight={highlight}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="ltc-cta-section">
          <div className="ltc-container">
            <div className="ltc-cta-box">
              <div>
                <h3 style={fontMontserrat}>Ready to start your manpower application?</h3>
                <p style={fontPontano}>
                  Submit your details, check requirements, and connect with opportunities from LTC Manpower Services.
                </p>
              </div>

              <button
                type="button"
                onClick={() => goTo("/manpower-apply")}
                className="ltc-btn ltc-btn-primary"
                style={fontMontserrat}
              >
                Apply Now
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="ltc-footer">
        <div className="ltc-container ltc-footer-grid">
          <div>
            <h4 style={fontMontserrat}>LTC Manpower Services</h4>
            <p style={fontPontano}>
              Quality staffing solutions and workforce support for companies and applicants.
            </p>
          </div>

          <div>
            <h5 style={fontMontserrat}>Menu</h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, ...fontPontano }}>
              <FooterLink to={MANPOWER_HOME_ROUTE}>Home</FooterLink>
              <FooterLink to="/manpower-positions">Job Offer</FooterLink>
              <FooterLink to="/manpower-requirements">Requirements</FooterLink>
              <FooterLink to="/manpower-employee-login">Profile</FooterLink>
            </ul>
          </div>

          <div>
            <h5 style={fontMontserrat}>Contact</h5>
            <p style={fontPontano}>ltc.tamis@gmail.com</p>
            <p style={fontPontano}>lorengladisu@ltcmultiservices.com</p>
            <p style={fontPontano}>09959808051 / 09516281271</p>
          </div>

          <div>
            <h5 style={fontMontserrat}>Address</h5>
            <p style={fontPontano}>2/F 544 Curie Street, Palanan, Makati City.</p>
            <p style={fontPontano}>Light Tower Center, 1730 Dian Street, Palanan, Makati City.</p>
          </div>
        </div>

        <div className="ltc-container ltc-copyright">
          <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
        </div>
      </footer>

      <FloatingHomeIconButton onClick={() => navigate("/")} />
    </div>
  );
}

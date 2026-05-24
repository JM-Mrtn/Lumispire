import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGO_IMAGE = "/ManpowerLogo.png";
const HERO_IMAGE = "/ManpowerBanner.png";

const MANPOWER_HOME_ROUTE = "/manpower-services";

const DEFAULT_VACANCIES = [
  "Accounting Clerk",
  "General Clerk",
  "Money Sorter",
  "Data Encoder",
  "Admin Assistant",
  "HR Assistant",
  "Production Worker",
  "Warehouseman",
  "Stockman",
  "Sales Coordinator",
  "Financial Advisor",
  "Engineer",
  "Driver",
  "Promodiser",
  "Merchandiser",
  "Messenger",
  "Forklift Operator",
  "Janitor",
];

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);
const API_ORIGIN = API_BASE.replace(/\/api$/i, "");

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
    return `${API_BASE}${raw}`;
  }

  return raw;
}

function getFallbackDescription(title = "this position") {
  return `This position is currently open under LTC Manpower Services. Click Apply Now to submit your application and complete the required screening process for ${title}.`;
}

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const RevealOnScroll = ({ children, className = "", delay = 0, y = 22 }) => {
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

const JobIcon = () => (
  <svg viewBox="0 0 24 24" className="mp-svg-icon" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="mp-search-icon" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path strokeLinecap="round" d="m21 21-4.35-4.35" />
  </svg>
);

function VacancyCard({ job, index, onOpen }) {
  const imageSrc = resolveImageSource(job?.imageUrl);

  return (
    <RevealOnScroll delay={index * 55}>
      <button
        type="button"
        onClick={() => onOpen(job)}
        title={`View ${job.title}`}
        className="mp-job-card"
      >
        <div className="mp-card-media">
          {imageSrc ? (
            <img src={imageSrc} alt={job.title} />
          ) : (
            <div className="mp-empty-media">
              <JobIcon />
            </div>
          )}

          <div className="mp-card-shade" />
          <span className="mp-card-badge">Available Position</span>
        </div>

        <div className="mp-card-body">
          <div className="mp-card-icon">
            <JobIcon />
          </div>
          <h3 style={fontMontserrat}>{job.title}</h3>
          <p style={fontPontano}>Click to view details and qualifications</p>
        </div>
      </button>
    </RevealOnScroll>
  );
}

function JobModal({ job, onClose, onApply }) {
  if (!job) return null;

  const imageSrc = resolveImageSource(job.imageUrl);

  const qualifications = Array.isArray(job.qualifications)
    ? job.qualifications.filter(Boolean)
    : [];

  return (
    <div className="mp-modal-overlay">
      <div className="mp-modal-card">
        <button
          type="button"
          onClick={onClose}
          className="mp-modal-close"
          aria-label="Close job details"
        >
          ✕
        </button>

        <div className="mp-modal-scroll">
          <div className="mp-modal-hero">
            {imageSrc ? (
              <img src={imageSrc} alt={job.title} />
            ) : (
              <div className="mp-modal-empty">
                <JobIcon />
                <span>Available Position</span>
              </div>
            )}

            <div className="mp-modal-title">
              <p style={fontPoppins}>Position Details</p>
              <h2 style={fontMontserrat}>{job.title}</h2>
            </div>
          </div>

          <div className="mp-modal-content">
            <section>
              <h3 style={fontMontserrat}>Job Description</h3>
              <p style={fontPontano}>{job.description || getFallbackDescription(job.title)}</p>
            </section>

            <section>
              <h3 style={fontMontserrat}>Qualifications</h3>
              {qualifications.length ? (
                <ul className="mp-qualification-list" style={fontPontano}>
                  {qualifications.map((qualification, itemIndex) => (
                    <li key={`${qualification}-${itemIndex}`}>{qualification}</li>
                  ))}
                </ul>
              ) : (
                <p style={fontPontano}>Qualifications will be discussed during application screening.</p>
              )}
            </section>

            <div className="mp-modal-actions">
              <button type="button" onClick={onClose} className="mp-btn mp-btn-outline">
                Close
              </button>

              <button type="button" onClick={() => onApply(job)} className="mp-btn mp-btn-primary">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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

export default function ManpowerPositions() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [search, setSearch] = useState("");
  const [letterFilter, setLetterFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("az");
  const [visibleLimit, setVisibleLimit] = useState(8);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      try {
        setLoadingJobs(true);

        const res = await fetch(`${API_BASE}/manpower/vacancies`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load job vacancies.");
        }

        if (active) {
          setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        }
      } catch (error) {
        console.error("loadManpowerJobs error:", error);

        if (active) {
          setJobs([]);
        }
      } finally {
        if (active) {
          setLoadingJobs(false);
        }
      }
    }

    loadJobs();

    return () => {
      active = false;
    };
  }, []);

  const displayJobs =
    jobs.length > 0
      ? jobs
      : DEFAULT_VACANCIES.map((title) => ({
          _id: title,
          title,
          description: "",
          qualifications: [],
          imageUrl: "",
          active: true,
        }));

  const availableLetters = useMemo(() => {
    const letters = displayJobs
      .map((job) => String(job?.title || "").trim().charAt(0).toUpperCase())
      .filter((letter) => /^[A-Z]$/.test(letter));

    return Array.from(new Set(letters)).sort((a, b) => a.localeCompare(b));
  }, [displayJobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matchedJobs = displayJobs.filter((job) => {
      const title = String(job?.title || "");
      const titleLower = title.toLowerCase();
      const description = String(job?.description || "").toLowerCase();
      const qualifications = Array.isArray(job?.qualifications)
        ? job.qualifications.join(" ").toLowerCase()
        : "";

      const matchesSearch =
        !query ||
        titleLower.includes(query) ||
        description.includes(query) ||
        qualifications.includes(query);

      const matchesLetter =
        letterFilter === "all" ||
        title.trim().toUpperCase().startsWith(letterFilter);

      return matchesSearch && matchesLetter;
    });

    return [...matchedJobs].sort((a, b) => {
      const firstTitle = String(a?.title || "");
      const secondTitle = String(b?.title || "");

      return sortOrder === "za"
        ? secondTitle.localeCompare(firstTitle)
        : firstTitle.localeCompare(secondTitle);
    });
  }, [displayJobs, search, letterFilter, sortOrder]);

  const visibleJobs = useMemo(() => {
    return filteredJobs.slice(0, visibleLimit);
  }, [filteredJobs, visibleLimit]);

  useEffect(() => {
    setVisibleLimit(8);
  }, [search, letterFilter, sortOrder]);

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  function applyForJob(job) {
    navigate(`/manpower-apply?vacancy=${encodeURIComponent(job.title)}`);
  }

  return (
    <div className="mp-about-style" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .mp-about-style {
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
          --glass: rgba(255,255,255,.82);
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

        .mp-about-style * { box-sizing: border-box; }

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
          min-height: 540px;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          color: white;
          isolation: isolate;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
        }

        .mp-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -3;
          background:
            linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.88) 42%, rgba(12,64,39,.72) 100%),
            url("${HERO_IMAGE}") center center / cover no-repeat;
          background-blend-mode: multiply;
          opacity: .96;
          transform: scale(1.02);
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
            linear-gradient(135deg, rgba(3,24,15,.34), rgba(8,56,34,.08));
          filter: blur(30px);
          pointer-events: none;
        }

        .mp-hero-content {
          position: relative;
          z-index: 2;
          width: min(960px, 100%);
          padding: 88px 0 100px;
          animation: mpAppleReveal .9s var(--ease) both;
        }

        .mp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: var(--gold-soft);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .mp-hero h2 {
          margin: 12px 0 0;
          max-width: 940px;
          font-size: clamp(42px, 6vw, 76px);
          line-height: .98;
          font-weight: 900;
          letter-spacing: -.065em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .mp-hero h2 span { color: var(--gold-soft); }

        .mp-hero p {
          max-width: 680px;
          margin: 24px 0 0;
          color: rgba(255,255,255,.80);
          font-size: 18px;
          line-height: 1.8;
        }

        .mp-hero-actions {
          margin-top: 34px;
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .mp-btn {
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

        .mp-btn:hover { transform: translateY(-3px); }

        .mp-btn-primary {
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.28);
        }

        .mp-btn-outline {
          color: var(--green-950);
          background: #ffffff;
          border: 1px solid rgba(35,95,62,.16);
        }

        .mp-section { padding: 84px 0; }

        .mp-section-title {
          text-align: center;
          margin-bottom: 34px;
          animation: mpAppleReveal .7s var(--ease) both;
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
          max-width: 720px;
          margin: 15px auto 0;
          color: var(--muted);
        }

        .mp-search-panel {
          position: relative;
          overflow: hidden;
          padding: 28px;
          border-radius: 32px;
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(18px);
          margin-bottom: 34px;
        }

        .mp-search-panel::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
        }

        .mp-search-grid {
          display: grid;
          grid-template-columns: 1fr minmax(180px, .38fr) minmax(180px, .38fr) auto;
          gap: 18px;
          align-items: center;
        }

        .mp-search-box { position: relative; }

        .mp-search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          width: 22px;
          height: 22px;
          transform: translateY(-50%);
          color: #7b8c80;
          pointer-events: none;
        }

        .mp-search-box input {
          width: 100%;
          min-height: 58px;
          border: 1px solid rgba(35,95,62,.18);
          border-radius: 999px;
          background: #fff;
          padding: 0 20px 0 52px;
          font-size: 14px;
          font-weight: 700;
          color: var(--green-950);
          outline: none;
          transition: .28s var(--ease);
          box-shadow: 0 12px 24px rgba(8,39,25,.06);
        }

        .mp-search-box input:focus {
          border-color: rgba(215,168,77,.72);
          box-shadow: 0 16px 34px rgba(8,39,25,.11);
          transform: translateY(-1px);
        }

        .mp-filter-select {
          width: 100%;
          min-height: 58px;
          border: 1px solid rgba(35,95,62,.18);
          border-radius: 999px;
          background: #fff;
          padding: 0 18px;
          color: var(--green-950);
          font-size: 14px;
          font-weight: 800;
          outline: none;
          cursor: pointer;
          box-shadow: 0 12px 24px rgba(8,39,25,.06);
          transition: .28s var(--ease);
        }

        .mp-filter-select:focus,
        .mp-filter-select:hover {
          border-color: rgba(215,168,77,.72);
          box-shadow: 0 16px 34px rgba(8,39,25,.11);
          transform: translateY(-1px);
        }

        .mp-count-pill {
          display: inline-flex;
          min-height: 58px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: var(--green-950);
          color: white;
          padding: 0 24px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
          white-space: nowrap;
          box-shadow: 0 16px 34px rgba(8,39,25,.18);
        }

        .mp-jobs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .mp-job-card {
          position: relative;
          display: block;
          width: 100%;
          min-height: 328px;
          overflow: hidden;
          text-align: left;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,.76);
          border-radius: var(--radius);
          background: var(--glass);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(18px);
          transition: transform .38s var(--ease), box-shadow .38s var(--ease), border-color .38s var(--ease), background .38s var(--ease);
        }

        .mp-job-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          z-index: 3;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          transition: height .35s var(--ease);
        }

        .mp-job-card::after {
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

        .mp-job-card:hover,
        .mp-job-card:focus-visible {
          transform: translateY(-12px) scale(1.015);
          box-shadow: 0 34px 85px rgba(8,39,25,.22);
          border-color: rgba(215,168,77,.54);
          background: rgba(255,255,255,.92);
          outline: none;
        }

        .mp-job-card:hover::before,
        .mp-job-card:focus-visible::before { height: 9px; }
        .mp-job-card:hover::after,
        .mp-job-card:focus-visible::after { transform: translate(-20px, -18px) scale(1.18); }
        .mp-job-card:hover .mp-card-media img { transform: scale(1.08); }
        .mp-job-card:hover h3 { color: var(--green-700); }
        .mp-job-card:hover .mp-card-icon { transform: translateY(-5px) scale(1.08) rotate(-2deg); color: var(--green-950); background: linear-gradient(145deg,#fff7dc,#ffffff); }

        .mp-card-media {
          position: relative;
          height: 172px;
          overflow: hidden;
          background: linear-gradient(135deg,#eef8f2,#fff7dc);
        }

        .mp-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .45s var(--ease);
        }

        .mp-card-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(7,31,20,.46), rgba(7,31,20,.02));
        }

        .mp-card-badge {
          position: absolute;
          left: 18px;
          bottom: 16px;
          border-radius: 999px;
          background: rgba(255,255,255,.88);
          color: var(--green-800);
          padding: 9px 14px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .09em;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
        }

        .mp-empty-media {
          height: 100%;
          display: grid;
          place-items: center;
          color: var(--green-800);
        }

        .mp-empty-media .mp-svg-icon { width: 48px; height: 48px; opacity: .55; }

        .mp-card-body {
          position: relative;
          z-index: 2;
          padding: 24px;
        }

        .mp-card-icon {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          color: var(--green-800);
          border-radius: 18px;
          background: linear-gradient(145deg,#eef8f2,#fff);
          box-shadow: inset 0 0 0 1px rgba(35,95,62,.12),0 12px 24px rgba(8,39,25,.08);
          transition: transform .38s var(--ease), background .38s var(--ease), color .38s var(--ease), box-shadow .38s var(--ease);
        }

        .mp-svg-icon { width: 24px; height: 24px; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }

        .mp-card-body h3 {
          margin: 18px 0 0;
          color: var(--green-950);
          font-size: 21px;
          font-weight: 900;
          letter-spacing: -.04em;
          line-height: 1.15;
          transition: color .3s var(--ease);
        }

        .mp-card-body p {
          margin: 10px 0 0;
          color: var(--muted);
          font-size: 14px;
        }

        .mp-empty-results {
          border-radius: 32px;
          border: 1px solid rgba(255,255,255,.76);
          background: var(--glass);
          box-shadow: var(--shadow-md);
          padding: 56px 28px;
          text-align: center;
          backdrop-filter: blur(18px);
        }

        .mp-empty-results h3 {
          color: var(--green-950);
          font-size: 26px;
          font-weight: 900;
          margin: 0;
        }

        .mp-empty-results p { color: var(--muted); margin: 8px 0 0; }

        .mp-list-actions {
          margin-top: 34px;
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .mp-show-more-note {
          width: 100%;
          text-align: center;
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
        }

        .mp-band {
          position: relative;
          overflow: hidden;
          color: white;
          background: linear-gradient(135deg,rgba(7,31,20,.98),rgba(35,95,62,.93)), radial-gradient(circle at 10% 0%,rgba(215,168,77,.34),transparent 34%);
        }

        .mp-band::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .13;
          background-image: radial-gradient(rgba(255,255,255,.9) 1px, transparent 1px);
          background-size: 22px 22px;
        }

        .mp-band-content {
          position: relative;
          display: grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 36px;
          align-items: center;
        }

        .mp-band h3 {
          margin: 0;
          font-size: clamp(32px,4vw,50px);
          line-height: 1.08;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .mp-band p {
          margin: 15px 0 0;
          color: rgba(255,255,255,.75);
          max-width: 650px;
        }

        .mp-stats {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 14px;
        }

        .mp-stat {
          padding: 22px;
          border-radius: 20px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.16);
        }

        .mp-stat strong {
          display: block;
          color: #f4d484;
          font-size: 31px;
          font-weight: 900;
          letter-spacing: -.05em;
        }

        .mp-stat span {
          display: block;
          color: rgba(255,255,255,.72);
          font-size: 13px;
          font-weight: 700;
          margin-top: 4px;
        }

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
        .mp-footer a {
          display: block;
          color: rgba(255,255,255,.68);
          font-size: 13px;
          line-height: 1.55;
          margin: 5px 0;
          text-decoration: none;
        }

        .mp-footer a:hover { color: white; text-decoration: underline; }

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

        .mp-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,.66);
          padding: 16px;
        }

        .mp-modal-card {
          position: relative;
          width: min(100%, 880px);
          max-height: 92vh;
          overflow: hidden;
          border-radius: 32px;
          background: white;
          box-shadow: 0 32px 90px rgba(0,0,0,.34);
        }

        .mp-modal-close {
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
          font-weight: 900;
        }

        .mp-modal-scroll { max-height: 92vh; overflow-y: auto; }

        .mp-modal-hero {
          position: relative;
          height: 330px;
          background: linear-gradient(135deg,#eef8f2,#fff7dc);
        }

        .mp-modal-hero img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .mp-modal-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,.74), rgba(0,0,0,.12));
        }

        .mp-modal-empty {
          height: 100%;
          display: grid;
          place-items: center;
          color: var(--green-800);
          text-align: center;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .12em;
        }

        .mp-modal-title {
          position: absolute;
          left: clamp(24px,5vw,42px);
          right: clamp(24px,5vw,42px);
          bottom: 30px;
          z-index: 2;
          color: white;
        }

        .mp-modal-title p {
          margin: 0 0 8px;
          color: var(--gold-soft);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .mp-modal-title h2 {
          margin: 0;
          font-size: clamp(30px,4vw,48px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.05em;
        }

        .mp-modal-content { padding: clamp(24px,4vw,40px); }
        .mp-modal-content section + section { margin-top: 28px; }
        .mp-modal-content h3 { margin: 0; color: var(--green-950); font-size: 18px; font-weight: 900; }
        .mp-modal-content p { margin: 10px 0 0; color: var(--muted); font-size: 15px; line-height: 1.8; font-weight: 600; }

        .mp-qualification-list {
          list-style: none;
          padding: 0;
          margin: 14px 0 0;
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(2, minmax(0,1fr));
        }

        .mp-qualification-list li {
          border-radius: 18px;
          border: 1px solid rgba(35,95,62,.14);
          background: #f7fbf8;
          color: #52695a;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 700;
        }

        .mp-modal-actions {
          margin-top: 32px;
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid rgba(35,95,62,.12);
          padding-top: 24px;
        }

        @keyframes mpAppleReveal {
          from { opacity: 0; transform: translateY(34px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .mp-about-style *, .mp-about-style *::before, .mp-about-style *::after {
            animation-duration: .001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .001ms !important;
          }
        }

        @media (max-width: 1100px) {
          .mp-jobs-grid { grid-template-columns: repeat(3,1fr); }
          .mp-footer-grid { grid-template-columns: repeat(2,1fr); }
        }

        @media (max-width: 900px) {
          .mp-header .mp-container { padding-left: 22px; padding-right: 22px; }
          .mp-nav { min-height: auto; padding: 18px 0; }
          .mp-desktop-nav { display: none; }
          .mp-menu-button { display: grid; place-items: center; }
          .mp-hero { min-height: 620px; }
          .mp-jobs-grid, .mp-band-content { grid-template-columns: 1fr; }
          .mp-search-grid { grid-template-columns: 1fr; }
          .mp-count-pill { width: 100%; }
          .mp-footer { padding: 28px 0 12px; }
          .mp-footer-grid { grid-template-columns: 1fr; gap: 18px; padding-bottom: 22px; }
          .mp-footer .mp-container { padding-left: 22px; padding-right: 22px; }
          .mp-copyright { flex-direction: column; }
        }

        @media (max-width: 600px) {
          .mp-header .mp-container { padding-left: 16px; padding-right: 16px; }
          .mp-logo h1 { font-size: 14px; }
          .mp-logo p { font-size: 10px; }
          .mp-hero h2 { font-size: clamp(38px, 12vw, 54px); letter-spacing: -.045em; }
          .mp-hero-actions, .mp-btn { width: 100%; }
          .mp-section { padding: 62px 0; }
          .mp-search-panel { padding: 20px; }
          .mp-qualification-list, .mp-stats { grid-template-columns: 1fr; }
          .mp-modal-hero { height: 280px; }
          .mp-footer .mp-container { padding-left: 16px; padding-right: 16px; }
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
            <HeaderNavLink to="/manpower-positions" active>Job Offer</HeaderNavLink>
            <HeaderNavLink to="/manpower-requirements">Requirements</HeaderNavLink>
            <HeaderNavLink to="/manpower-contact">Contact</HeaderNavLink>
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
          <div className="mp-sidebar-panel">
            <div className="mp-sidebar-top">
              <p className="mp-sidebar-title" style={fontPoppins}>MENU</p>
              <button onClick={() => setMobileOpen(false)} className="mp-sidebar-close" aria-label="Close menu" type="button">
                ✕
              </button>
            </div>

            <div style={fontPoppins}>
              <button type="button" onClick={() => goTo(MANPOWER_HOME_ROUTE)} className="mp-sidebar-link">Home</button>
              <button type="button" onClick={() => goTo("/manpower-positions")} className="mp-sidebar-link active">Job Offer</button>
              <button type="button" onClick={() => goTo("/manpower-requirements")} className="mp-sidebar-link">Requirements</button>
              <button type="button" onClick={() => goTo("/manpower-contact")} className="mp-sidebar-link">Contact</button>
              <button type="button" onClick={() => goTo("/manpower-faqs")} className="mp-sidebar-link">FAQs</button>
              <button type="button" onClick={() => goTo("/manpower-employee-login")} className="mp-sidebar-link">Sign In</button>
            </div>
          </div>
        </div>
      )}

      <main>
        <section className="mp-hero">
          <div className="mp-container mp-hero-content">
            <div className="mp-eyebrow" style={fontPoppins}>Manpower Services</div>
            <h2 style={fontMontserrat}>
              Discover <span>job opportunities</span> that match your skills.
            </h2>
            <p style={fontPontano}>
              Browse available positions, view job details, and apply for the role that fits your qualifications.
            </p>

            <div className="mp-hero-actions">
              <button
                type="button"
                className="mp-btn mp-btn-primary"
                style={fontMontserrat}
                onClick={() => {
                  document.getElementById("job-offers")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                View Job Offers
              </button>

              <button
                type="button"
                className="mp-btn mp-btn-primary"
                style={fontMontserrat}
                onClick={() => goTo("/manpower-requirements")}
              >
                View Requirements
              </button>
            </div>

            {loadingJobs && (
              <p className="mt-5 text-[13px] font-bold text-white/85" style={fontPontano}>
                Loading job offers...
              </p>
            )}
          </div>
        </section>

        <section id="job-offers" className="mp-section">
          <div className="mp-container">
            <div className="mp-section-title">
              <span style={fontPoppins}>Job Offer</span>
              <h3 style={fontMontserrat}>Available manpower positions</h3>
              <p style={fontPontano}>
                Search through available roles and open each position to review its description and qualifications.
              </p>
            </div>

            <RevealOnScroll>
              <div className="mp-search-panel">
                <div className="mp-search-grid">
                  <div className="mp-search-box">
                    <SearchIcon />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by title, description, or qualification..."
                      style={fontPontano}
                    />
                  </div>

                  <select
                    value={letterFilter}
                    onChange={(event) => setLetterFilter(event.target.value)}
                    className="mp-filter-select"
                    style={fontPoppins}
                    aria-label="Filter jobs by first letter"
                  >
                    <option value="all">All Letters</option>
                    {availableLetters.map((letter) => (
                      <option key={letter} value={letter}>
                        Starts with {letter}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    className="mp-filter-select"
                    style={fontPoppins}
                    aria-label="Sort jobs"
                  >
                    <option value="az">Sort A to Z</option>
                    <option value="za">Sort Z to A</option>
                  </select>

                  <div className="mp-count-pill" style={fontPoppins}>
                    Showing {visibleJobs.length} of {filteredJobs.length}
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {filteredJobs.length ? (
              <>
                <div className="mp-jobs-grid">
                  {visibleJobs.map((job, index) => (
                    <VacancyCard
                      key={job._id || job.title}
                      job={job}
                      index={index}
                      onOpen={setSelectedJob}
                    />
                  ))}
                </div>

                <div className="mp-list-actions">
                  <p className="mp-show-more-note" style={fontPontano}>
                    Showing {visibleJobs.length} job offer{visibleJobs.length === 1 ? "" : "s"} only. Use search, letter filter, or A-Z sorting to narrow the list.
                  </p>

                  {visibleJobs.length < filteredJobs.length ? (
                    <button
                      type="button"
                      className="mp-btn mp-btn-primary"
                      style={fontMontserrat}
                      onClick={() => setVisibleLimit((prev) => prev + 8)}
                    >
                      Show More Jobs
                    </button>
                  ) : null}

                  {visibleJobs.length > 8 ? (
                    <button
                      type="button"
                      className="mp-btn mp-btn-outline"
                      style={fontMontserrat}
                      onClick={() => setVisibleLimit(8)}
                    >
                      Show Less
                    </button>
                  ) : null}
                </div>
              </>
            ) : (
              <RevealOnScroll>
                <div className="mp-empty-results">
                  <h3 style={fontMontserrat}>No jobs found</h3>
                  <p style={fontPontano}>Try a different search keyword.</p>
                </div>
              </RevealOnScroll>
            )}
          </div>
        </section>

        <section className="mp-section mp-band">
          <div className="mp-container mp-band-content">
            <RevealOnScroll>
              <div>
                <div className="mp-eyebrow" style={fontPoppins}>Application Guide</div>
                <h3 style={fontMontserrat}>Ready to apply for your next opportunity?</h3>
                <p style={fontPontano}>
                  Select a position, review its details, then continue to the application form with your chosen vacancy already prepared.
                </p>
              </div>
            </RevealOnScroll>

            <div className="mp-stats">
              <RevealOnScroll delay={80}>
                <div className="mp-stat">
                  <strong>{displayJobs.length}</strong>
                  <span>Open Positions</span>
                </div>
              </RevealOnScroll>
              <RevealOnScroll delay={140}>
                <div className="mp-stat">
                  <strong>{filteredJobs.length}</strong>
                  <span>Search Results</span>
                </div>
              </RevealOnScroll>
              <RevealOnScroll delay={200}>
                <div className="mp-stat">
                  <strong>1</strong>
                  <span>Click to Apply</span>
                </div>
              </RevealOnScroll>
              <RevealOnScroll delay={260}>
                <div className="mp-stat">
                  <strong>LTC</strong>
                  <span>Manpower Support</span>
                </div>
              </RevealOnScroll>
            </div>
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
            <Link to={MANPOWER_HOME_ROUTE}>Home</Link>
            <Link to="/manpower-positions">Job Offer</Link>
            <Link to="/manpower-requirements">Requirements</Link>
            <Link to="/manpower-employee-login">Profile</Link>
          </FooterColumn>

          <FooterColumn title="Contact Information">
            <p>ltc.tamis@gmail.com</p>
            <p>lorengladisu@ltcmultiservices.com</p>
            <p>09959808051 / 09516281271</p>
          </FooterColumn>

          <FooterColumn title="Address">
            <p>2/F 544 Curie Street,</p>
            <p>Palanan, Makati City</p>
          </FooterColumn>

          <FooterColumn title="Follow Us">
            <p>Facebook</p>
            <p>Email</p>
            <p>LinkedIn</p>
          </FooterColumn>
        </div>

        <div className="mp-container mp-copyright">
          <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
        </div>
      </footer>

      <FloatingHomeIconButton onClick={() => navigate("/")} />

      <JobModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={applyForJob}
      />
    </div>
  );
}

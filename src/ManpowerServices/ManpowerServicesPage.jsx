import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE, manpowerUrl } from "./manpowerApi";

const LOGO_IMAGE = "/ManpowerLogo.png";
const HERO_IMAGE = "/ManpowerBanner.png";

const MANPOWER_HOME_ROUTE = "/manpower-services";
const API_ORIGIN = API_BASE.replace(/\/api$/i, "");

const FALLBACK_HIGHLIGHTS = [
  {
    _id: "fallback-1",
    title: "Manpower Highlight 1",
    subtitle: "",
    imageUrl: "/manpower-highlight-1.jpg",
  },
  {
    _id: "fallback-2",
    title: "Manpower Highlight 2",
    subtitle: "",
    imageUrl: "/manpower-highlight-2.jpg",
  },
  {
    _id: "fallback-3",
    title: "Manpower Highlight 3",
    subtitle: "",
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

function HeaderNavLink({ to, children, active = false }) {
  return (
    <Link
      to={to}
      className={`relative pb-1 transition hover:text-[#6f8a66] ${
        active
          ? "text-[#315b42] after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[#315b42]"
          : "text-[#405549]"
      }`}
    >
      {children}
    </Link>
  );
}

function ShortcutCard({ title, description, to }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="group flex min-h-[92px] w-full items-center gap-4 rounded-md bg-white px-5 py-4 text-left shadow-[0_1px_4px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
    >
      <DocumentPenIcon className="h-12 w-12 shrink-0 text-[#78906f]" />

      <div>
        <h3 className="text-[19px] font-black leading-tight text-[#3b5d49]">
          {title}
        </h3>
        <p className="mt-1 max-w-[190px] text-[12px] font-semibold leading-snug text-[#52695a]">
          {description}
        </p>
      </div>
    </button>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div className="border-[#d8ded5] md:border-l md:pl-5">
      <h4 className="text-[14px] font-black text-[#315b42]">{title}</h4>
      <div className="mt-2 space-y-1 text-[11px] font-semibold leading-snug text-[#496252]">
        {children}
      </div>
    </div>
  );
}

function HighlightCard({ highlight, index }) {
  const imageSrc = resolveImageSource(highlight?.imageUrl);

  return (
    <div className="group relative h-[135px] overflow-hidden rounded-md bg-[#d8e0d5] shadow-[0_4px_12px_rgba(0,0,0,0.28)] sm:h-[150px]">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={highlight?.title || `Manpower highlight ${index + 1}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#d8e0d5] text-sm font-bold text-[#315b42]">
          No image
        </div>
      )}

      {(highlight?.title || highlight?.subtitle) && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-left">
          {highlight?.title ? (
            <h3 className="text-sm font-black text-white">{highlight.title}</h3>
          ) : null}

          {highlight?.subtitle ? (
            <p className="mt-1 line-clamp-1 text-xs font-semibold text-white/85">
              {highlight.subtitle}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function ManpowerServicesPage() {
  const [highlights, setHighlights] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(0);

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
    <div className="min-h-screen bg-[#eef2ea] font-sans text-[#24372d]">
      <header className="sticky top-0 z-50 border-b border-[#d5ddd2] bg-[#f7f9f5]/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={MANPOWER_HOME_ROUTE} className="flex items-center gap-3">
            <img
              src={LOGO_IMAGE}
              alt="Manpower Logo"
              className="h-12 w-12 shrink-0 rounded-full object-contain"
            />

            <span className="text-[24px] font-black tracking-wide text-[#315b42] sm:text-[28px]">
              MANPOWER
            </span>
          </Link>

          <nav className="hidden items-center gap-9 text-[12px] font-black uppercase tracking-wide lg:flex">
            <HeaderNavLink to={MANPOWER_HOME_ROUTE} active>
              Home
            </HeaderNavLink>

            <HeaderNavLink to="/manpower-positions">Job Offer</HeaderNavLink>

            <HeaderNavLink to="/manpower-requirements">
              Requirements
            </HeaderNavLink>

            <HeaderNavLink to="/manpower-contact">Contact</HeaderNavLink>

            <HeaderNavLink to="/manpower-faqs">FAQs</HeaderNavLink>
          </nav>

          <Link
            to="/manpower-employee-login"
            className="text-[12px] font-black uppercase tracking-wide text-[#405549] transition hover:text-[#6f8a66]"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main>
        <section
          className="relative flex h-[300px] items-center justify-center bg-[#526b5a] bg-cover bg-center px-4 text-center sm:h-[360px] md:h-[430px] lg:h-[500px]"
          style={{
            backgroundImage: `url(${HERO_IMAGE})`,
          }}
        >
          <div className="absolute inset-0 bg-black/35" />

          <div className="relative z-10 mx-auto max-w-5xl">
            <h1 className="text-[30px] font-black leading-tight text-white drop-shadow-lg sm:text-[42px] md:text-[54px]">
              Begin your journey with Manpower Services today
            </h1>

            <div className="mx-auto mt-5 h-[3px] max-w-[760px] bg-white/60" />

            <p className="mx-auto mt-5 max-w-2xl text-[14px] font-semibold leading-relaxed text-white/95 sm:text-[16px] md:text-[18px]">
              Explore job opportunities, submit your requirements, and start
              your application with LTC Manpower Services.
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0f3a1e]">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#9ab987] to-transparent opacity-75" />

          <div className="pointer-events-none absolute left-4 top-4 h-10 w-10 rounded-full bg-white/20" />
          <div className="pointer-events-none absolute left-8 top-9 h-12 w-12 rounded-full bg-white/20" />
          <div className="pointer-events-none absolute left-3 top-20 h-9 w-9 rounded-full bg-white/20" />

          <div className="pointer-events-none absolute right-7 top-7 h-12 w-12 rounded-full bg-white/20" />
          <div className="pointer-events-none absolute right-3 top-16 h-9 w-9 rounded-full bg-white/20" />
          <div className="pointer-events-none absolute right-11 top-11 h-12 w-12 rounded-full bg-white/20" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 md:gap-16">
              <ShortcutCard
                title="Apply Now"
                description="Start your journey here at manpower"
                to="/manpower-apply"
              />

              <ShortcutCard
                title="Job Offer"
                description="See here the list of job we offer"
                to="/manpower-positions"
              />

              <ShortcutCard
                title="Requirements"
                description="See all requirements you need to submit"
                to="/manpower-requirements"
              />
            </div>
          </div>

          <div className="relative z-0 h-[70px] overflow-hidden">
            <div className="absolute -bottom-[78px] left-1/2 h-[150px] w-[120%] -translate-x-1/2 rounded-[50%_50%_0_0] bg-gradient-to-b from-[#cfe9bc] via-[#789d6b] to-[#244e31]" />
          </div>
        </section>

        <section className="bg-[#244e31] py-9">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-[30px] font-black leading-none text-white drop-shadow sm:text-[38px]">
                Our Highlights
              </h2>
              <div className="mx-auto mt-4 h-[3px] w-[310px] max-w-[70%] bg-white/35" />
            </div>

            <div className="relative mt-14 flex items-center justify-center gap-5 sm:gap-8 lg:gap-16">
              <button
                type="button"
                aria-label="Previous highlight"
                onClick={goPreviousHighlight}
                disabled={displayHighlights.length <= 3}
                className="hidden text-white/90 transition hover:scale-110 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 sm:block"
              >
                <svg
                  className="h-12 w-12"
                  viewBox="0 0 48 48"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M30 8 14 24l16 16"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="grid w-full max-w-5xl gap-7 md:grid-cols-3">
                {visibleHighlights.map((highlight, index) => (
                  <HighlightCard
                    key={highlight?._id || `${highlight?.imageUrl}-${index}`}
                    highlight={highlight}
                    index={index}
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label="Next highlight"
                onClick={goNextHighlight}
                disabled={displayHighlights.length <= 3}
                className="hidden text-white/90 transition hover:scale-110 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 sm:block"
              >
                <svg
                  className="h-12 w-12"
                  viewBox="0 0 48 48"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m18 8 16 16-16 16"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d8ded5] bg-[#f7f9f5]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.75fr_1.35fr_1.05fr_0.85fr] md:items-start">
            <div>
              <Link
                to={MANPOWER_HOME_ROUTE}
                className="flex items-center gap-2.5"
              >
                <img
                  src={LOGO_IMAGE}
                  alt="Manpower Logo"
                  className="h-12 w-12 shrink-0 rounded-full object-contain"
                />

                <h3 className="text-[24px] font-black tracking-wide text-[#315b42]">
                  MANPOWER
                </h3>
              </Link>
            </div>

            <FooterColumn title="Menu">
              <Link
                className="block hover:text-[#315b42]"
                to={MANPOWER_HOME_ROUTE}
              >
                Home
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to="/manpower-positions"
              >
                Job Offer
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to="/manpower-requirements"
              >
                Requirements
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to="/manpower-employee-login"
              >
                Profile
              </Link>
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

          <div className="mt-2 flex flex-col gap-1 border-t border-[#d8ded5] pt-1.5 text-[10px] font-semibold text-[#4c6556] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
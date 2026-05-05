import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const HERO_IMAGE = "/images/manpower-hero.jpg";
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

function BrandSeal({ small = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border-[3px] border-[#315b42] bg-white text-center font-black leading-none text-[#315b42] ${
        small ? "h-9 w-9 text-[9px]" : "h-12 w-12 text-[10px]"
      }`}
    >
      LTC
    </div>
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

function VacancyCard({ title, index, onApply }) {
  const backgrounds = [
    "linear-gradient(135deg, #eaf2e6 0%, #b9ceb5 100%)",
    "linear-gradient(135deg, #f2eee6 0%, #d0c2ab 100%)",
    "linear-gradient(135deg, #e6eef2 0%, #b7c8d3 100%)",
    "linear-gradient(135deg, #eee4dc 0%, #cbb8aa 100%)",
    "linear-gradient(135deg, #e4f0e9 0%, #bdd3c7 100%)",
    "linear-gradient(135deg, #f0eedf 0%, #d2c9ad 100%)",
  ];

  return (
    <button
      type="button"
      onClick={onApply}
      title={`Apply for ${title}`}
      className="group w-full text-left"
    >
      <div className="overflow-hidden rounded-[16px] border border-white/20 bg-white shadow-[0_8px_18px_rgba(0,0,0,0.22)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.28)]">
        <div
          className="relative h-[145px] w-full overflow-hidden sm:h-[160px]"
          style={{ background: backgrounds[index % backgrounds.length] }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(0,0,0,0.12))]" />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="rounded-full bg-white/80 px-5 py-2 text-center text-[12px] font-black uppercase tracking-wide text-[#315b42] backdrop-blur-sm">
              Available Position
            </div>
          </div>
        </div>

        <div className="px-4 py-4 text-center">
          <h3 className="text-[18px] font-black leading-snug text-[#315b42]">
            {title}
          </h3>
          <p className="mt-1 text-[12px] font-semibold text-[#52695a]">
            Click to apply
          </p>
        </div>
      </div>
    </button>
  );
}

export default function ManpowerPositions() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

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
        }));

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  return (
    <div className="min-h-screen bg-[#0f3a1e] font-sans text-[#24372d]">
      <header className="sticky top-0 z-50 border-b border-[#d5ddd2] bg-[#f7f9f5]/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={MANPOWER_HOME_ROUTE} className="flex items-center gap-3">
            <BrandSeal />
            <span className="text-[24px] font-black tracking-wide text-[#315b42] sm:text-[28px]">
              MANPOWER
            </span>
          </Link>

          <nav className="hidden items-center gap-9 text-[12px] font-black uppercase tracking-wide lg:flex">
            <HeaderNavLink to={MANPOWER_HOME_ROUTE}>Home</HeaderNavLink>

            <HeaderNavLink to="/manpower-positions" active>
              Job Offer
            </HeaderNavLink>

            <HeaderNavLink to="/manpower-requirements">
              Requirements
            </HeaderNavLink>

            <HeaderNavLink to="/manpower-contact">Contact</HeaderNavLink>

            <HeaderNavLink to="/manpower-faqs">FAQs</HeaderNavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/manpower-employee-login"
              className="hidden text-[12px] font-black uppercase tracking-wide text-[#405549] transition hover:text-[#6f8a66] lg:inline-block"
            >
              Sign In
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="rounded-md border border-[#cfd6ca] px-3 py-2 text-xs font-black uppercase tracking-wide text-[#405549] lg:hidden"
            >
              Menu
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#dde2db] bg-[#f7f9f5] lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 text-sm font-bold text-[#405549] sm:px-6">
              <button
                type="button"
                onClick={() => goTo(MANPOWER_HOME_ROUTE)}
                className="py-2 text-left"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-positions")}
                className="py-2 text-left text-[#315b42] underline underline-offset-4"
              >
                Job Offer
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-requirements")}
                className="py-2 text-left"
              >
                Requirements
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-contact")}
                className="py-2 text-left"
              >
                Contact
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-faqs")}
                className="py-2 text-left"
              >
                FAQs
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-employee-login")}
                className="py-2 text-left"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section
          className="relative h-[165px] bg-[#526b5a] bg-cover bg-center sm:h-[195px] md:h-[250px]"
          style={{
            backgroundImage: `url(${HERO_IMAGE})`,
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
        </section>

        <section className="relative overflow-hidden bg-[#0f3a1e]">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#9ab987] to-transparent opacity-80" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-11 text-center sm:px-6 lg:px-8">
            <h1 className="text-[28px] font-black leading-tight text-white drop-shadow sm:text-[34px] md:text-[38px]">
              Jobs We Offer
            </h1>
            <div className="mx-auto mt-4 h-[3px] w-[310px] max-w-[80%] bg-white/45" />

            <p className="mx-auto mt-4 max-w-3xl text-[14px] font-semibold leading-relaxed text-white/90 sm:text-[15px]">
              Here are the jobs available for Manpower Services. Apply now and
              be one of the Manpower Services employees.
            </p>

            {loadingJobs && (
              <p className="mt-4 text-[13px] font-bold text-white/80">
                Loading job offers...
              </p>
            )}
          </div>
        </section>

        <section className="bg-[#294f35] py-12 sm:py-14 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayJobs.map((job, index) => (
                <VacancyCard
                  key={job._id || job.title}
                  title={job.title}
                  index={index}
                  onApply={() =>
                    navigate(
                      `/manpower-apply?vacancy=${encodeURIComponent(job.title)}`
                    )
                  }
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d8ded5] bg-[#f7f9f5]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.75fr_1.35fr_1.05fr_0.85fr] md:items-start">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-[#c7a23a]">
                  <span className="text-[28px] leading-none">♛</span>
                </div>
                <h3 className="text-[24px] font-black tracking-wide text-[#315b42]">
                  LUMISPIRE
                </h3>
              </div>
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
                Course
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
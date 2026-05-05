import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const HERO_IMAGE = "/images/manpower-hero.jpg";
const MANPOWER_HOME_ROUTE = "/manpower-services";

const REQUIREMENTS = [
  "Birth Certificate",
  "Form 137/138",
  "Diploma/TOR",
  "2X2 Picture with Name",
  "Barangay Clearance",
  "NBI",
  "SSS ID",
  "Pag-Ibig ID",
  "Philhealth ID",
  "TIN",
];

function BrandSeal() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-[#315b42] bg-white text-[9px] font-black leading-none text-[#315b42]">
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

export default function ManpowerRequirements() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#eef2ea] font-sans text-[#24372d]">
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

            <HeaderNavLink to="/manpower-positions">
              Job Offer
            </HeaderNavLink>

            <HeaderNavLink to="/manpower-requirements" active>
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
                className="py-2 text-left"
              >
                Job Offer
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-requirements")}
                className="py-2 text-left text-[#315b42] underline underline-offset-4"
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
              List of Requirements
            </h1>
            <div className="mx-auto mt-4 h-[3px] w-[290px] max-w-[80%] bg-white/45" />
          </div>
        </section>

        <section className="bg-[#294f35] py-14 sm:py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-8 sm:px-10 lg:px-12">
            <div className="grid gap-x-14 gap-y-8 text-white sm:grid-cols-2 lg:grid-cols-3">
              {REQUIREMENTS.map((item) => (
                <div key={item} className="flex items-start gap-5">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                  <p className="text-[17px] font-black leading-snug sm:text-[18px]">
                    {item}
                  </p>
                </div>
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
              <Link className="block hover:text-[#315b42]" to={MANPOWER_HOME_ROUTE}>
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
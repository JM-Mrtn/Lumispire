import React from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGO_IMAGE = "/ManpowerLogo.png";
const HERO_IMAGE = "/ManpowerBanner.png";

const EMPLOYEE_HOME_ROUTE = "/manpower-employee-home";
const EMPLOYEE_PAYROLL_ROUTE = "/manpower-employee-payroll";
const EMPLOYEE_LEAVE_ROUTE = "/manpower-employee-leave";
const EMPLOYEE_PROFILE_ROUTE = "/manpower-employee-profile";

function getEmployeeUser() {
  try {
    return JSON.parse(localStorage.getItem("manpowerEmployeeUser") || "null");
  } catch {
    return null;
  }
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

function DocumentIcon(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <path
        d="M18 10h26l8 9v34a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M44 10v11h10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M25 29h17M25 37h17M25 45h13"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle cx="21" cy="29" r="2.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="21" cy="37" r="2.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="21" cy="45" r="2.2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ActionCard({ title, subtitle, buttonLabel, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full max-w-[240px] rounded-2xl bg-white px-6 py-7 text-center shadow-[0_10px_22px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.28)]"
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center text-[#8a9777]">
        <DocumentIcon className="h-full w-full" />
      </div>

      <h3 className="mt-3 text-[20px] font-black text-[#315b42]">
        {title}
      </h3>

      <p className="mt-1 text-[12px] font-semibold text-[#71806f]">
        {subtitle}
      </p>

      <span className="mt-6 inline-flex w-full items-center justify-center rounded-full border-2 border-[#315b42] px-6 py-2 text-[13px] font-black uppercase tracking-wide text-[#315b42] transition group-hover:bg-[#315b42] group-hover:text-white">
        {buttonLabel}
      </span>
    </button>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div className="border-[#d8ded5] md:border-l md:pl-4">
      <h4 className="text-[12px] font-black text-[#315b42]">{title}</h4>

      <div className="mt-1 space-y-0.5 text-[10px] font-semibold leading-snug text-[#496252]">
        {children}
      </div>
    </div>
  );
}

export default function ManpowerEmployeeHome() {
  const navigate = useNavigate();
  const employee = getEmployeeUser();

  const fullName = [
    employee?.firstName || "",
    employee?.middleName || "",
    employee?.lastName || "",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const displayName = fullName || "Employee";

  return (
    <div className="min-h-screen bg-[#eef2ea] font-sans text-[#24372d]">
      <header className="sticky top-0 z-50 border-b border-[#d5ddd2] bg-[#f7f9f5]/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={EMPLOYEE_HOME_ROUTE} className="flex items-center gap-3">
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
            <HeaderNavLink to={EMPLOYEE_HOME_ROUTE} active>
              Home
            </HeaderNavLink>

            <HeaderNavLink to={EMPLOYEE_PAYROLL_ROUTE}>
              Payroll
            </HeaderNavLink>

            <HeaderNavLink to={EMPLOYEE_LEAVE_ROUTE}>
              Leave
            </HeaderNavLink>
          </nav>

          <Link
            to={EMPLOYEE_PROFILE_ROUTE}
            className="text-[12px] font-black uppercase tracking-wide text-[#405549] transition hover:text-[#6f8a66]"
          >
            Profile
          </Link>
        </div>

        <div className="border-t border-[#e1e7de] bg-[#f7f9f5] px-4 py-3 lg:hidden">
          <nav className="mx-auto flex max-w-7xl items-center justify-center gap-7 text-[11px] font-black uppercase tracking-wide">
            <HeaderNavLink to={EMPLOYEE_HOME_ROUTE} active>
              Home
            </HeaderNavLink>

            <HeaderNavLink to={EMPLOYEE_PAYROLL_ROUTE}>
              Payroll
            </HeaderNavLink>

            <HeaderNavLink to={EMPLOYEE_LEAVE_ROUTE}>
              Leave
            </HeaderNavLink>
          </nav>
        </div>
      </header>

      <main>
        <section
          className="relative flex min-h-[250px] items-center justify-center bg-[#526b5a] bg-cover bg-center px-4 text-center sm:min-h-[290px] lg:min-h-[330px]"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        >
          <div className="absolute inset-0 bg-black/40" />

          <div className="pointer-events-none absolute left-7 top-8 h-8 w-8 rounded-full bg-white/20" />
          <div className="pointer-events-none absolute left-12 top-16 h-10 w-10 rounded-full bg-white/20" />
          <div className="pointer-events-none absolute right-8 top-12 h-10 w-10 rounded-full bg-white/20" />
          <div className="pointer-events-none absolute right-16 top-24 h-9 w-9 rounded-full bg-white/20" />

          <div className="relative z-10 mx-auto max-w-5xl">
            <h1 className="text-[28px] font-black leading-tight text-white drop-shadow-lg sm:text-[36px] md:text-[44px]">
              Welcome to Manpower Services
            </h1>

            <div className="mx-auto mt-4 h-[3px] w-[520px] max-w-[75%] bg-white/60" />

            <p className="mx-auto mt-4 max-w-3xl text-[14px] font-semibold leading-relaxed text-white/95 sm:text-[16px]">
              Hello, {displayName}
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0f3a1e]">
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#9ab987] to-transparent opacity-80" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
            <div className="grid justify-items-center gap-8 md:grid-cols-2 md:gap-10">
              <ActionCard
                title="Payroll"
                subtitle="View your payroll history"
                buttonLabel="View"
                onClick={() => navigate(EMPLOYEE_PAYROLL_ROUTE)}
              />

              <ActionCard
                title="File Leave"
                subtitle="Submit and monitor leave requests"
                buttonLabel="Submit"
                onClick={() => navigate(EMPLOYEE_LEAVE_ROUTE)}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d8ded5] bg-[#f7f9f5]">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="grid gap-2 md:grid-cols-[1fr_0.7fr_1.2fr_0.9fr_0.75fr] md:items-start">
            <div>
              <Link
                to={EMPLOYEE_HOME_ROUTE}
                className="flex items-center gap-2"
              >
                <img
                  src={LOGO_IMAGE}
                  alt="Manpower Logo"
                  className="h-9 w-9 shrink-0 rounded-full object-contain"
                />

                <h3 className="text-[18px] font-black tracking-wide text-[#315b42]">
                  MANPOWER
                </h3>
              </Link>
            </div>

            <FooterColumn title="Menu">
              <Link
                className="block hover:text-[#315b42]"
                to={EMPLOYEE_HOME_ROUTE}
              >
                Home
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to={EMPLOYEE_PAYROLL_ROUTE}
              >
                Payroll
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to={EMPLOYEE_LEAVE_ROUTE}
              >
                Leave
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to={EMPLOYEE_PROFILE_ROUTE}
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

          <div className="mt-1 flex flex-col gap-0.5 border-t border-[#d8ded5] pt-1 text-[9px] font-semibold text-[#4c6556] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
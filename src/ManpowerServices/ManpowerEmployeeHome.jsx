import React from "react";
import { useNavigate } from "react-router-dom";
import ManpowerEmployeeShell from "./ManpowerEmployeeShell";

const HERO_IMAGE = "/images/manpower-hero.jpg";

function getEmployeeUser() {
  try {
    return JSON.parse(localStorage.getItem("manpowerEmployeeUser") || "null");
  } catch {
    return null;
  }
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
      className="group w-full max-w-[220px] rounded-2xl bg-white px-6 py-7 text-center shadow-[0_10px_22px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.28)]"
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center text-[#8a9777]">
        <DocumentIcon className="h-full w-full" />
      </div>

      <h3 className="mt-3 text-[20px] font-black text-[#315b42]">{title}</h3>
      <p className="mt-1 text-[12px] font-semibold text-[#71806f]">{subtitle}</p>

      <span className="mt-6 inline-flex w-full items-center justify-center rounded-full border-2 border-[#315b42] px-6 py-2 text-[13px] font-black uppercase tracking-wide text-[#315b42] transition group-hover:bg-[#315b42] group-hover:text-white">
        {buttonLabel}
      </span>
    </button>
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
    <ManpowerEmployeeShell active="home">
      <section
        className="relative h-[190px] bg-[#526b5a] bg-cover bg-center sm:h-[230px] md:h-[275px]"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-black/15" />
      </section>

      <section className="relative overflow-hidden bg-[#0f3a1e]">
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#9ab987] to-transparent opacity-80" />

        <div className="pointer-events-none absolute left-7 top-5 h-11 w-11 rounded-full bg-white/20" />
        <div className="pointer-events-none absolute left-12 top-10 h-14 w-14 rounded-full bg-white/20" />
        <div className="pointer-events-none absolute left-8 top-20 h-10 w-10 rounded-full bg-white/20" />

        <div className="pointer-events-none absolute right-8 top-7 h-14 w-14 rounded-full bg-white/20" />
        <div className="pointer-events-none absolute right-3 top-17 h-8 w-8 rounded-full bg-white/20" />
        <div className="pointer-events-none absolute right-14 top-12 h-14 w-14 rounded-full bg-white/20" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-9 text-center sm:px-6 lg:px-8">
          <h1 className="text-[28px] font-black leading-tight text-white drop-shadow sm:text-[34px] md:text-[40px]">
            Welcome to Manpower Services
          </h1>
          <div className="mx-auto mt-4 h-[3px] w-[620px] max-w-[80%] bg-white/45" />

          <p className="mt-4 text-[14px] font-semibold text-white/85 sm:text-[15px]">
            Hello, {displayName}
          </p>
        </div>
      </section>

      <section className="bg-[#294f35] py-12 sm:py-14 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid justify-items-center gap-8 md:grid-cols-3 md:gap-10">
            <ActionCard
              title="Payroll"
              subtitle="View your payroll history"
              buttonLabel="View"
              onClick={() => navigate("/manpower-employee-payroll")}
            />

            <ActionCard
              title="File Leave"
              subtitle="Submit and monitor leave requests"
              buttonLabel="Submit"
              onClick={() => navigate("/manpower-employee-leave")}
            />

            <ActionCard
              title="Profile"
              subtitle="Open your employee account"
              buttonLabel="View"
              onClick={() => navigate("/manpower-employee-profile")}
            />
          </div>
        </div>
      </section>
    </ManpowerEmployeeShell>
  );
}

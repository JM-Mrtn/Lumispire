import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGO_IMAGE = "/ManpowerLogo.png";

export const EMPLOYEE_ROUTES = {
  home: "/manpower-employee-home",
  payroll: "/manpower-employee-payroll",
  leave: "/manpower-employee-leave",
  profile: "/manpower-employee-profile",
  login: "/manpower-employee-login",
};

function clearEmployeeSession() {
  localStorage.removeItem("manpowerEmployeeToken");
  localStorage.removeItem("manpowerEmployeeUser");
}

function NavItem({ label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pb-1 transition hover:text-[#6f8a66] ${
        active
          ? "text-[#315b42] after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[#315b42]"
          : "text-[#405549]"
      }`}
    >
      {label}
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

export default function ManpowerEmployeeShell({ active = "home", children }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function goTo(path) {
    setMenuOpen(false);
    navigate(path);
  }

  function logout() {
    clearEmployeeSession();
    setMenuOpen(false);
    navigate(EMPLOYEE_ROUTES.login, { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#0f3a1e] font-sans text-[#24372d]">
      <header className="sticky top-0 z-50 border-b border-[#d5ddd2] bg-[#f7f9f5]/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={EMPLOYEE_ROUTES.home} className="flex items-center gap-3">
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
            <NavItem
              label="Home"
              active={active === "home"}
              onClick={() => goTo(EMPLOYEE_ROUTES.home)}
            />

            <NavItem
              label="Payroll"
              active={active === "payroll"}
              onClick={() => goTo(EMPLOYEE_ROUTES.payroll)}
            />

            <NavItem
              label="Leave"
              active={active === "leave"}
              onClick={() => goTo(EMPLOYEE_ROUTES.leave)}
            />

            <NavItem
              label="Profile"
              active={active === "profile"}
              onClick={() => goTo(EMPLOYEE_ROUTES.profile)}
            />
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={logout}
              className="hidden rounded-full bg-[#315b42] px-5 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#254934] lg:inline-flex"
            >
              Logout
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-md border border-[#cfd6ca] px-3 py-2 text-xs font-black uppercase tracking-wide text-[#405549] lg:hidden"
            >
              Menu
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-[#dde2db] bg-[#f7f9f5] lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 text-sm font-bold text-[#405549] sm:px-6">
              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_ROUTES.home)}
                className={`py-2 text-left ${
                  active === "home"
                    ? "text-[#315b42] underline underline-offset-4"
                    : ""
                }`}
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_ROUTES.payroll)}
                className={`py-2 text-left ${
                  active === "payroll"
                    ? "text-[#315b42] underline underline-offset-4"
                    : ""
                }`}
              >
                Payroll
              </button>

              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_ROUTES.leave)}
                className={`py-2 text-left ${
                  active === "leave"
                    ? "text-[#315b42] underline underline-offset-4"
                    : ""
                }`}
              >
                Leave
              </button>

              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_ROUTES.profile)}
                className={`py-2 text-left ${
                  active === "profile"
                    ? "text-[#315b42] underline underline-offset-4"
                    : ""
                }`}
              >
                Profile
              </button>

              <button
                type="button"
                onClick={logout}
                className="py-2 text-left text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-[#d8ded5] bg-[#f7f9f5]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.75fr_1.35fr_1.05fr_0.85fr] md:items-start">
            <div>
              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_ROUTES.home)}
                className="flex items-center gap-2.5 text-left"
              >
                <img
                  src={LOGO_IMAGE}
                  alt="Manpower Logo"
                  className="h-12 w-12 shrink-0 rounded-full object-contain"
                />

                <h3 className="text-[24px] font-black tracking-wide text-[#315b42]">
                  MANPOWER
                </h3>
              </button>
            </div>

            <FooterColumn title="Menu">
              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_ROUTES.home)}
                className="block text-left hover:text-[#315b42]"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_ROUTES.payroll)}
                className="block text-left hover:text-[#315b42]"
              >
                Payroll
              </button>

              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_ROUTES.leave)}
                className="block text-left hover:text-[#315b42]"
              >
                Leave
              </button>

              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_ROUTES.profile)}
                className="block text-left hover:text-[#315b42]"
              >
                Profile
              </button>
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
import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" />
  </svg>
);

const IconBatch = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);

const IconAttendance = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 11h14v10H5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 16 2 2 4-5" />
  </svg>
);

const IconAssessment = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="3" width="14" height="18" rx="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h6M9 16h4" />
  </svg>
);

const IconBook = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 19.5V5a2 2 0 0 1 2-2h12v16H7a2 2 0 0 0-2 2.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6M9 11h5" />
  </svg>
);

const IconChart = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5M4 19h16" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m7 15 4-4 3 3 5-7" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m16 17 5-5-5-5M21 12H9" />
  </svg>
);

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/professor-dashboard", Icon: IconDashboard },
  { key: "batches", label: "Batch Records", path: "/professor-batches", Icon: IconBatch },
  { key: "attendance", label: "Attendance", path: "/professor-attendance", Icon: IconAttendance },
  { key: "assignment", label: "Assessments", path: "/professor-assessments", Icon: IconAssessment },
  { key: "modules", label: "Modules", path: "/professor-modules", Icon: IconBook },
  { key: "progress", label: "Progress", path: "/professor-progress", Icon: IconChart },
];

function getProfessorUser() {
  try {
    return (
      JSON.parse(localStorage.getItem("professorUser") || "null") ||
      JSON.parse(localStorage.getItem("professor") || "null") ||
      JSON.parse(localStorage.getItem("storedProfessor") || "null")
    );
  } catch {
    return null;
  }
}

function getProfessorName(user) {
  return (
    user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.username ||
    user?.email ||
    "Professor"
  );
}

function clearProfessorSession() {
  localStorage.removeItem("professorToken");
  localStorage.removeItem("professor");
  localStorage.removeItem("professorUser");
  localStorage.removeItem("storedProfessor");
}

export default function ProfessorLayout({
  title,
  subtitle,
  activePage = "",
  actions = null,
  children,
  maxWidth = "max-w-7xl",
  contentClassName = "",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const professor = getProfessorUser();
  const currentPath = location.pathname.replace(/\/+$/, "") || "/";

  const handleSignOut = () => {
    clearProfessorSession();
    navigate("/professor-login", { replace: true });
  };

  const SidebarContent = () => (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="shrink-0 px-1 pb-7 pt-3 text-center">
        <p className="truncate text-[12px] font-extrabold uppercase leading-none tracking-[0.24em] text-[#f4d484]">
          Professor Portal
        </p>
        <p className="mt-4 truncate text-[19px] font-extrabold leading-tight text-white">
          {getProfessorName(professor)}
        </p>
        <p className="mt-2 break-words text-[13px] font-bold leading-5 text-white/72">
          {professor?.email || "professor@tamsi.com"}
        </p>
      </div>

      <nav className="flex shrink-0 flex-col items-center gap-2.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.Icon;
          const itemPath = item.path.replace(/\/+$/, "") || "/";
          const isActive = currentPath === itemPath || activePage === item.key;

          return (
            <NavLink
              key={item.key}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={() =>
                `flex min-h-[48px] w-full max-w-[250px] items-center justify-start gap-3 rounded-[24px] px-5 text-left text-[14px] font-extrabold leading-tight transition duration-200 ${
                  isActive
                    ? "bg-[#f8fbf9] text-[#071f14] shadow-sm"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center opacity-95">
                <Icon />
              </span>
              <span className="block min-w-0 flex-1 truncate text-left">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 pb-1 pt-7">
        <div className="mb-6 h-px w-full bg-white/18" />
        <button
          type="button"
          onClick={handleSignOut}
          className="mx-auto flex min-h-[48px] w-full max-w-[250px] items-center justify-start gap-3 rounded-[24px] bg-white/10 px-5 text-left text-[14px] font-extrabold text-white transition hover:bg-white/16"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            <IconLogout />
          </span>
          <span className="block min-w-0 flex-1 truncate text-left">Sign out</span>
        </button>
        <p className="mt-7 w-full truncate text-center text-[12px] font-semibold text-white/58">
          © LTC Training & Assessment
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fbf9] text-[#071f14] lg:flex">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] shrink-0 overflow-hidden bg-[#082719] px-5 py-7 lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/45"
          />
          <aside className="relative z-10 flex h-full w-[280px] max-w-[88vw] flex-col overflow-hidden bg-[#082719] px-5 py-7 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      ) : null}

      <section className="min-w-0 flex-1 lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
          <div className={`mx-auto flex ${maxWidth} flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between`}>
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white text-lg font-extrabold lg:hidden"
                aria-label="Open menu"
              >
                ☰
              </button>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#235f3e]">
                  Professor Workspace
                </p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#071f14] md:text-5xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#071f14]/65">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>

            {actions ? <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div> : null}
          </div>
        </header>

        <main className={`mx-auto ${maxWidth} px-4 py-6 sm:px-6 ${contentClassName}`}>
          {children}
        </main>
      </section>
    </div>
  );
}

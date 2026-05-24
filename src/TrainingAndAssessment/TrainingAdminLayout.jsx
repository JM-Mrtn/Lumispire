import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const IconEnrollments = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);

const IconCourses = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 19.5V5.8A2.3 2.3 0 0 1 7.3 3.5H19v15H7.3A2.3 2.3 0 0 0 5 20.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h7M8 10h5" />
  </svg>
);

const IconCompetencies = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4.5 6v5.8c0 4.7 3.2 7.4 7.5 9.2 4.3-1.8 7.5-4.5 7.5-9.2V6L12 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.8 12.2 2.1 2.1 4.6-4.8" />
  </svg>
);

const IconBatches = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const IconProfessors = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-8 0v2" />
    <circle cx="12" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87M2 21v-2a4 4 0 0 1 3-3.87" />
  </svg>
);

const IconRfid = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 9h5M7 13h4M16 9h1M16 13h1" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m16 17 5-5-5-5M21 12H9" />
  </svg>
);

const NAV_ITEMS = [
  { key: "enrollments", label: "Enrollments", path: "/training-admin-enrollments", Icon: IconEnrollments },
  { key: "courses", label: "Courses", path: "/training-admin-courses", Icon: IconCourses },
  { key: "roadmap", label: "Roadmap", path: "/training-admin-roadmap", Icon: IconCompetencies },
  { key: "batches", label: "Batches", path: "/training-admin-batches", Icon: IconBatches },
  { key: "professors", label: "Professors", path: "/training-admin-professors", Icon: IconProfessors },
  { key: "rfid", label: "Register RFID", path: "/training-admin-register-rfid", Icon: IconRfid },
];

const COLORS = {
  sidebar: "#082719",
  cream: "#f8fbf9",
  dark: "#071f14",
  green: "#235f3e",
  gold: "#f4d484",
};

export default function TrainingAdminLayout({
  title,
  subtitle,
  active = "enrollments",
  activePage,
  actions = null,
  children,
  maxWidth = "max-w-7xl",
  contentClassName = "",
}) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentActive = activePage || active;

  const handleLogout = () => {
    localStorage.removeItem("trainingAdminToken");
    localStorage.removeItem("trainingAdmin");
    localStorage.removeItem("trainingToken");
    navigate("/training-admin-login", { replace: true });
  };

  const SidebarContent = () => (
    <div className="flex h-full min-h-0 w-full flex-col">
      <button
        type="button"
        onClick={() => navigate("/training-admin-enrollments")}
        className="flex w-full shrink-0 flex-col items-center justify-center rounded-[26px] px-4 py-4 text-center transition hover:bg-white/5"
      >
        <img
          src="/LTCLogo.jpg"
          alt="LTC Training Logo"
          className="mb-3 h-16 w-16 shrink-0 rounded-full bg-white object-cover shadow-sm ring-2 ring-white/10"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <p className="w-full text-center text-[10px] font-extrabold uppercase leading-tight tracking-[0.2em] text-[#f4d484]">
          Training Admin
        </p>
        <p className="mt-2 w-full text-center text-[14px] font-extrabold leading-tight text-white">
          LTC Training
        </p>
      </button>

      <nav className="mt-7 flex shrink-0 flex-col gap-3 px-0">
        {NAV_ITEMS.map((item) => {
          const isActive = currentActive === item.key;
          const Icon = item.Icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate(item.path);
              }}
              className={`flex min-h-[48px] w-full items-center justify-start gap-3 rounded-[22px] px-5 text-left text-[13px] font-extrabold leading-tight transition duration-200 ${
                isActive
                  ? "bg-[#f8fbf9] text-[#071f14] shadow-sm"
                  : "text-white/88 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center opacity-95">
                <Icon />
              </span>
              <span className="block min-w-0 flex-1 truncate text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 px-0 pb-1 pt-6">
        <div className="mb-5 h-px w-full bg-white/18" />
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-12 w-full items-center justify-start gap-3 rounded-[22px] bg-white/10 px-5 text-left text-[13px] font-extrabold text-white transition hover:bg-white/16"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            <IconLogout />
          </span>
          <span className="block min-w-0 flex-1 truncate text-left">Sign out</span>
        </button>
        <p className="mt-5 w-full truncate text-center text-[11px] font-semibold text-white/55">
          © LTC Training
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fbf9] text-[#071f14] lg:flex">
      <aside
        className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] shrink-0 overflow-hidden px-6 py-6 lg:flex"
        style={{ backgroundColor: COLORS.sidebar }}
      >
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
          <aside
            className="relative z-10 flex h-full w-[300px] max-w-[86vw] flex-col overflow-hidden px-6 py-6 shadow-2xl"
            style={{ backgroundColor: COLORS.sidebar }}
          >
            <SidebarContent />
          </aside>
        </div>
      ) : null}

      <section className="min-w-0 flex-1 lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
          <div
            className={`mx-auto flex ${maxWidth} flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between`}
          >
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
                  Training Center
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

            {actions ? (
              <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div>
            ) : null}
          </div>
        </header>

        <main className={`mx-auto ${maxWidth} px-4 py-6 sm:px-6 ${contentClassName}`}>
          {children}
        </main>
      </section>
    </div>
  );
}

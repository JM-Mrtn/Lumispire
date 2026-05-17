import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-8 0v2" />
    <circle cx="12" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87M2 21v-2a4 4 0 0 1 3-3.87" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const IconPackage = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 8-9-5-9 5 9 5 9-5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8v8l9 5 9-5V8M12 13v8" />
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.7 5.47 6.04.88-4.37 4.26 1.03 6.01L12 16.78l-5.4 2.84 1.03-6.01-4.37-4.26 6.04-.88L12 3Z" />
  </svg>
);

const IconChat = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
  </svg>
);

const IconId = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <circle cx="9" cy="12" r="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4M14 14h3M7 16c.7-1 1.5-1.5 2-1.5s1.3.5 2 1.5" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m16 17 5-5-5-5M21 12H9" />
  </svg>
);

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/hotel-admin-dashboard", Icon: IconDashboard },
  { key: "accounts", label: "Manage Accounts", path: "/hotel-admin-accounts", Icon: IconUsers },
  { key: "bookings", label: "Manage Bookings", path: "/hotel-admin-bookings", Icon: IconCalendar },
  { key: "packages", label: "Packages", path: "/hotel-admin-packages", Icon: IconPackage },
  { key: "reviews", label: "Guest Reviews", path: "/hotel-admin-reviews", Icon: IconStar },
  { key: "chat", label: "Chat Support", path: "/hotel-admin-chat", Icon: IconChat },
  { key: "idVerify", label: "ID Verification", path: "/hotel-admin-id-verify", Icon: IconId },
];

const COLORS = {
  dark: "#071f14",
  sidebar: "#082719",
  cream: "#f8fbf9",
};

export default function HotelAdminShell({
  title,
  subtitle,
  activePage = "dashboard",
  actions = null,
  children,
  maxWidth = "max-w-7xl",
  contentClassName = "",
}) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("hotelAdminToken");
    localStorage.removeItem("hotelAdmin");
    navigate("/hotel-admin-login", { replace: true });
  };

  const SidebarContent = ({ compact = false }) => (
    <div className="flex h-full min-h-0 flex-col">
      <button
        type="button"
        onClick={() => navigate("/hotel-admin-dashboard")}
        className="flex w-full shrink-0 flex-col items-center justify-center rounded-3xl px-4 py-3 text-center transition hover:bg-white/5"
      >
        <img
          src="/Logo.jpg"
          alt="Patio De Lorenzo Logo"
          className="mb-3 h-14 w-14 shrink-0 rounded-full bg-white object-cover shadow-sm ring-2 ring-white/10"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <p className="w-full truncate text-center text-[10px] font-extrabold uppercase leading-none tracking-[0.24em] text-[#f4d484]">
          Hotel & Resort Admin
        </p>
        <p className="mt-2 w-full truncate text-center text-[15px] font-extrabold leading-tight text-white">
          Patio De Lorenzo
        </p>
      </button>

      <nav className="mt-7 flex shrink-0 flex-col gap-3 px-0">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.key;
          const Icon = item.Icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate(item.path);
              }}
              className={`relative flex min-h-[46px] w-full items-center justify-center rounded-[24px] px-12 text-center text-[13px] font-extrabold leading-tight transition duration-200 ${
                isActive
                  ? "bg-[#f8fbf9] text-[#071f14] shadow-sm"
                  : "text-white/88 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="absolute left-5 top-1/2 flex -translate-y-1/2 items-center justify-center opacity-95">
                <Icon />
              </span>
              <span className="block w-full truncate text-center">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 px-0 pb-1 pt-6">
        <div className="mb-5 h-px w-full bg-white/18" />
        <button
          type="button"
          onClick={handleLogout}
          className="relative flex h-12 w-full items-center justify-center rounded-[24px] bg-white/10 px-12 text-center text-[13px] font-extrabold text-white transition hover:bg-white/16"
        >
          <span className="absolute left-5 top-1/2 flex -translate-y-1/2 items-center justify-center">
            <IconLogout />
          </span>
          <span className="block w-full truncate text-center">Sign out</span>
        </button>
        <p className="mt-5 w-full truncate text-center text-[11px] font-semibold text-white/55">
          © Patio De Lorenzo
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fbf9] text-[#071f14] lg:flex">
      <aside
        className="fixed left-0 top-0 z-40 hidden h-screen w-[256px] shrink-0 overflow-hidden px-6 py-6 lg:flex"
        style={{ backgroundColor: COLORS.sidebar }}
      >
        <SidebarContent compact />
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
            className="relative z-10 flex h-full w-[292px] flex-col overflow-hidden px-6 py-6 shadow-2xl"
            style={{ backgroundColor: COLORS.sidebar }}
          >
            <SidebarContent />
          </aside>
        </div>
      ) : null}

      <section className="min-w-0 flex-1 lg:pl-[256px]">
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
                  Hotel & Resort
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

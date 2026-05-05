import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/hotel-admin-dashboard" },
  { key: "accounts", label: "Manage Accounts", path: "/hotel-admin-accounts" },
  { key: "bookings", label: "Manage Bookings", path: "/hotel-admin-bookings" },
  { key: "packages", label: "Packages", path: "/hotel-admin-packages" },
  { key: "reviews", label: "Guest Reviews", path: "/hotel-admin-reviews" },
  { key: "chat", label: "Chat Support", path: "/hotel-admin-chat" },
  { key: "idVerify", label: "ID Verification", path: "/hotel-admin-id-verify" },
];

const COLORS = {
  dark: "#2A4F33",
  sidebar: "#2F4D36",
  cream: "#F6F6F1",
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

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-2 py-2">
        <img
          src="/Logo.jpg"
          alt="Patio De Lorenzo Logo"
          className="h-11 w-11 rounded-full bg-white object-cover shadow-sm"
        />
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/70">
            Hotel Admin
          </p>
          <p className="text-sm font-extrabold leading-tight text-white">
            Patio De Lorenzo
          </p>
        </div>
      </div>

      <nav className="mt-6 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate(item.path);
              }}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                isActive
                  ? "bg-[#E9EFE4] text-[#2A4F33] shadow-sm"
                  : "text-white/85 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pt-8">
        <div className="mb-4 h-px bg-white/15" />
        <button
          type="button"
          onClick={handleLogout}
          className="h-11 w-full rounded-2xl bg-white/10 text-sm font-extrabold text-white transition hover:bg-white/15"
        >
          Sign out
        </button>
        <p className="mt-4 text-xs font-semibold text-white/55">© Patio De Lorenzo</p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F6F6F1] text-[#2A4F33] lg:flex">
      <aside
        className="hidden min-h-screen w-[270px] shrink-0 flex-col px-4 py-5 lg:flex"
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
            className="relative z-10 flex h-full w-[290px] flex-col px-4 py-5 shadow-2xl"
            style={{ backgroundColor: COLORS.sidebar }}
          >
            <SidebarContent />
          </aside>
        </div>
      ) : null}

      <section className="min-w-0 flex-1">
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
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#6F806D]">
                  Hotel & Resort
                </p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#2A4F33] md:text-5xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#2A4F33]/65">
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

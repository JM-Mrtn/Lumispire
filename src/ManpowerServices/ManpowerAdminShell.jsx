import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10ZM13 21h8V11h-8v10ZM13 3v6h8V3h-8ZM3 21h8v-6H3v6Z" />
  </svg>
);

const IconAccounts = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-8 0v2" />
    <circle cx="12" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87M2 21v-2a4 4 0 0 1 3-3.87" />
  </svg>
);

const IconJobs = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
  </svg>
);

const IconHighlights = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2 7.5 14 3 9.6l6.2-.9L12 3Z" />
  </svg>
);

const IconDeductions = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8M8 12h8M8 16h4" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m16 17 5-5-5-5M21 12H9" />
  </svg>
);

const adminNavItems = [
  { key: "dashboard", label: "Dashboard", path: "/manpower-admin", Icon: IconDashboard },
  { key: "accounts", label: "Accounts", path: "/manpower-admin-accounts", Icon: IconAccounts },
  { key: "jobs", label: "Jobs", path: "/manpower-admin-jobs", Icon: IconJobs },
  { key: "highlights", label: "Highlights", path: "/manpower-admin-highlights", Icon: IconHighlights },
  { key: "deductions", label: "Deductions", path: "/manpower-admin-deductions", Icon: IconDeductions },
];

const COLORS = {
  sidebar: "#082719",
  cream: "#f8fbf9",
  dark: "#071f14",
  green: "#235f3e",
  gold: "#f4d484",
};

const toneClasses = {
  success: "bg-[#e8f4ed] text-[#246843]",
  danger: "bg-[#faecec] text-[#8b3232]",
  warning: "bg-[#fff4e8] text-[#b54708]",
  info: "bg-[#eaf3ff] text-[#244b92]",
  neutral: "bg-[#eef3ea] text-[#395345]",
  dark: "bg-[#395345] text-white",
};

const actionButtonClasses = {
  primary: "bg-[#395345] text-white hover:bg-[#2c4136] focus:ring-[#cbd8c6]",
  soft: "border border-[#cfd8c8] bg-[#eef3ea] text-[#395345] hover:bg-[#e3ebdd] focus:ring-[#dce7d8]",
  ghost: "border border-[#cfd8c8] bg-white text-[#395345] hover:bg-[#f3f7ef] focus:ring-[#dce7d8]",
  danger: "bg-[#faecec] text-[#8b3232] hover:bg-[#f4dddd] focus:ring-[#f0cccc]",
  warning: "bg-[#fff4e8] text-[#b54708] hover:bg-[#ffe8ca] focus:ring-[#f5d3aa]",
  success: "bg-[#e8f4ed] text-[#246843] hover:bg-[#d9ecdf] focus:ring-[#c9e1d1]",
  info: "bg-[#eaf3ff] text-[#244b92] hover:bg-[#dbeaff] focus:ring-[#c9ddff]",
};

export const inputClassName =
  "w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm text-[#24352c] shadow-sm outline-none transition placeholder:text-[#9aa79b] focus:border-[#395345] focus:ring-2 focus:ring-[#dce7d8] disabled:cursor-not-allowed disabled:bg-[#f3f6ef] disabled:text-[#7a867b]";

export const compactInputClassName =
  "w-full rounded-lg border border-[#c6ccb9] bg-white px-3 py-2 text-sm text-[#24352c] outline-none transition placeholder:text-[#9aa79b] focus:border-[#395345] focus:ring-2 focus:ring-[#dce7d8] disabled:cursor-not-allowed disabled:bg-[#f3f6ef]";

export function AdminShell({ current, title, subtitle, children, onLogout }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
      return;
    }

    localStorage.removeItem("manpowerAdminToken");
    localStorage.removeItem("manpowerAdmin");
    localStorage.removeItem("manpowerToken");
    navigate("/manpower-admin-login", { replace: true });
  };

  const SidebarContent = () => (
    <div className="flex h-full min-h-0 w-full flex-col">
      <button
        type="button"
        onClick={() => navigate("/manpower-admin")}
        className="flex w-full shrink-0 flex-col items-center justify-center rounded-[26px] px-4 py-4 text-center transition hover:bg-white/5"
      >
       
        <p className="w-full text-center text-[10px] font-extrabold uppercase leading-tight tracking-[0.2em] text-[#f4d484]">
          Manpower Services Admin
        </p>
        <p className="mt-2 w-full text-center text-[14px] font-extrabold leading-tight text-white">
          LTC Manpower Services
        </p>
      </button>

      <nav className="mt-7 flex shrink-0 flex-col gap-3 px-0">
        {adminNavItems.map((item) => {
          const isActive = current === item.key;
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
          © LTC Manpower Services
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
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
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
                  Manpower Center
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
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {children}
        </main>
      </section>
    </div>
  );
}

export function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f3] px-4 py-10 text-[#1f2a22]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#dfe9d8]/70 blur-3xl" />
        <div className="absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-[#eef3ea] blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}

export function SectionCard({ title, subtitle, action, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-[24px] border border-[#d7decf] bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    >
      {title || subtitle || action ? (
        <div className="flex flex-col gap-3 border-b border-[#eef2ea] bg-[#f7faf5] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            {title ? (
              <h2 className="font-montserrat text-xl font-bold text-[#24352c]">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-sm leading-6 text-[#5f6f61]">
                {subtitle}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({ title, value, subtitle, tone = "dark" }) {
  const textTone =
    tone === "success"
      ? "text-[#246843]"
      : tone === "danger"
      ? "text-[#8b3232]"
      : tone === "warning"
      ? "text-[#b54708]"
      : "text-[#24352c]";

  return (
    <div className="rounded-[22px] border border-[#d7decf] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#bfcdb8] hover:shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#68806e]">
        {title}
      </p>
      <p className={`mt-2 font-montserrat text-3xl font-bold ${textTone}`}>
        {value}
      </p>
      {subtitle ? (
        <p className="mt-2 text-xs leading-6 text-[#607062]">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function StatusPill({ children, tone = "neutral" }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.04em] ${
        toneClasses[tone] || toneClasses.neutral
      }`}
    >
      {children}
    </span>
  );
}

export function ActionButton({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const sizeClass = size === "sm" ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm";

  return (
    <button
      type={type}
      className={`rounded-xl font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClass} ${
        actionButtonClasses[variant] || actionButtonClasses.primary
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LoadingState({ children = "Loading..." }) {
  return (
    <div className="rounded-[24px] border border-[#d7decf] bg-white p-10 text-center text-sm font-medium text-[#6b7a6d] shadow-sm">
      {children}
    </div>
  );
}

export function EmptyState({ children = "No records found." }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#c6ccb9] bg-white p-10 text-center text-sm font-medium text-[#6b7a6d] shadow-sm">
      {children}
    </div>
  );
}

export function FieldLabel({ children }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#68806e]">
      {children}
    </span>
  );
}

export function CompactCell({ label, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#708071]">
        {label}
      </p>
      <div className="min-w-0 text-sm font-semibold text-[#24352c]">
        {children}
      </div>
    </div>
  );
}

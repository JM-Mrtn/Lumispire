import React from "react";
import { useNavigate } from "react-router-dom";

const adminNavItems = [
  { key: "dashboard", label: "Dashboard", path: "/manpower-admin" },
  { key: "accounts", label: "Accounts", path: "/manpower-admin-accounts" },
  { key: "jobs", label: "Jobs", path: "/manpower-admin-jobs" },
  { key: "highlights", label: "Highlights", path: "/manpower-admin-highlights" },
  { key: "deductions", label: "Deductions", path: "/manpower-admin-deductions" },
];

const toneClasses = {
  success: "bg-[#e8f4ed] text-[#246843]",
  danger: "bg-[#faecec] text-[#8b3232]",
  warning: "bg-[#fff4e8] text-[#b54708]",
  info: "bg-[#eaf3ff] text-[#244b92]",
  neutral: "bg-[#eef3ea] text-[#395345]",
  dark: "bg-[#395345] text-white",
};

const actionButtonClasses = {
  primary:
    "bg-[#395345] text-white hover:bg-[#2c4136] focus:ring-[#cbd8c6]",
  soft:
    "border border-[#cfd8c8] bg-[#eef3ea] text-[#395345] hover:bg-[#e3ebdd] focus:ring-[#dce7d8]",
  ghost:
    "border border-[#cfd8c8] bg-white text-[#395345] hover:bg-[#f3f7ef] focus:ring-[#dce7d8]",
  danger:
    "bg-[#faecec] text-[#8b3232] hover:bg-[#f4dddd] focus:ring-[#f0cccc]",
  warning:
    "bg-[#fff4e8] text-[#b54708] hover:bg-[#ffe8ca] focus:ring-[#f5d3aa]",
  success:
    "bg-[#e8f4ed] text-[#246843] hover:bg-[#d9ecdf] focus:ring-[#c9e1d1]",
  info:
    "bg-[#eaf3ff] text-[#244b92] hover:bg-[#dbeaff] focus:ring-[#c9ddff]",
};

export const inputClassName =
  "w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm text-[#24352c] shadow-sm outline-none transition placeholder:text-[#9aa79b] focus:border-[#395345] focus:ring-2 focus:ring-[#dce7d8] disabled:cursor-not-allowed disabled:bg-[#f3f6ef] disabled:text-[#7a867b]";

export const compactInputClassName =
  "w-full rounded-lg border border-[#c6ccb9] bg-white px-3 py-2 text-sm text-[#24352c] outline-none transition placeholder:text-[#9aa79b] focus:border-[#395345] focus:ring-2 focus:ring-[#dce7d8] disabled:cursor-not-allowed disabled:bg-[#f3f6ef]";

export function AdminShell({ current, title, subtitle, children, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f6f8f3] text-[#1f2a22]">
      <header className="sticky top-0 z-30 border-b border-[#d7decf] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#68806e]">
              LTC Group of Companies
            </p>
            <h1 className="mt-1 font-montserrat text-2xl font-bold text-[#24352c] md:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5f6f61]">
                {subtitle}
              </p>
            ) : null}
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {adminNavItems.map((item) => {
              const active = current === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#dce7d8] ${
                    active
                      ? "bg-[#395345] text-white shadow-sm"
                      : "bg-[#eef3ea] text-[#395345] hover:bg-[#e3ebdd]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-[#faecec] px-4 py-2 text-sm font-semibold text-[#8b3232] transition hover:bg-[#f4dddd] focus:outline-none focus:ring-2 focus:ring-[#f0cccc]"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
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
      className={`overflow-hidden rounded-[24px] border border-[#d7decf] bg-white shadow-sm ${className}`}
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
    <div className="rounded-[22px] border border-[#d7decf] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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
      className={`rounded-xl font-semibold shadow-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClass} ${
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

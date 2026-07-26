import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const IconDashboard = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10ZM13 21h8V11h-8v10ZM13 3v6h8V3h-8ZM3 21h8v-6H3v6Z" /></svg>;
const IconAccounts = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-8 0v2" /><circle cx="12" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87M2 21v-2a4 4 0 0 1 3-3.87" /></svg>;
const IconJobs = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></svg>;
const IconHighlights = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2 7.5 14 3 9.6l6.2-.9L12 3Z" /></svg>;
const IconDeductions = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8M8 12h8M8 16h4" /></svg>;
const IconLogout = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path strokeLinecap="round" strokeLinejoin="round" d="m16 17 5-5-5-5M21 12H9" /></svg>;
const IconExternal = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></svg>;

const adminNavItems = [
  { key: "dashboard", label: "Dashboard", path: "/manpower-admin", Icon: IconDashboard },
  { key: "accounts", label: "Accounts", path: "/manpower-admin-accounts", Icon: IconAccounts },
  { key: "jobs", label: "Jobs", path: "/manpower-admin-jobs", Icon: IconJobs },
  { key: "highlights", label: "Highlights", path: "/manpower-admin-highlights", Icon: IconHighlights },
  { key: "deductions", label: "Deductions", path: "/manpower-admin-deductions", Icon: IconDeductions },
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
  primary: "bg-[#395345] text-white hover:bg-[#2c4136] focus:ring-[#cbd8c6]",
  soft: "border border-[#cfd8c8] bg-[#eef3ea] text-[#395345] hover:bg-[#e3ebdd] focus:ring-[#dce7d8]",
  ghost: "border border-[#cfd8c8] bg-white text-[#395345] hover:bg-[#f3f7ef] focus:ring-[#dce7d8]",
  danger: "bg-[#faecec] text-[#8b3232] hover:bg-[#f4dddd] focus:ring-[#f0cccc]",
  warning: "bg-[#fff4e8] text-[#b54708] hover:bg-[#ffe8ca] focus:ring-[#f5d3aa]",
  success: "bg-[#e8f4ed] text-[#246843] hover:bg-[#d9ecdf] focus:ring-[#c9e1d1]",
  info: "bg-[#eaf3ff] text-[#244b92] hover:bg-[#dbeaff] focus:ring-[#c9ddff]",
};

export const inputClassName = "w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm text-[#24352c] shadow-sm outline-none transition placeholder:text-[#9aa79b] focus:border-[#395345] focus:ring-2 focus:ring-[#dce7d8] disabled:cursor-not-allowed disabled:bg-[#f3f6ef] disabled:text-[#7a867b]";
export const compactInputClassName = "w-full rounded-lg border border-[#c6ccb9] bg-white px-3 py-2 text-sm text-[#24352c] outline-none transition placeholder:text-[#9aa79b] focus:border-[#395345] focus:ring-2 focus:ring-[#dce7d8] disabled:cursor-not-allowed disabled:bg-[#f3f6ef]";

export function readAdminUser() {
  try {
    return JSON.parse(localStorage.getItem("manpowerAdminUser") || "null") || {};
  } catch {
    return {};
  }
}

export function clearAdminSession() {
  localStorage.removeItem("manpowerAdminToken");
  localStorage.removeItem("manpowerAdminUser");
  localStorage.removeItem("manpowerAdmin");
  localStorage.removeItem("manpowerToken");
}

export function recordAdminActivity(action, details = "") {
  try {
    const admin = readAdminUser();
    const current = JSON.parse(localStorage.getItem("manpowerAdminActivity") || "[]");
    const next = [{ id: `${Date.now()}-${Math.random()}`, action, details, at: new Date().toISOString(), admin: admin.email || admin.username || admin.name || "Administrator" }, ...current].slice(0, 80);
    localStorage.setItem("manpowerAdminActivity", JSON.stringify(next));
  } catch {
    // Activity logging must never interrupt an admin action.
  }
}

export function getAdminActivities(limit = 10) {
  try {
    const rows = JSON.parse(localStorage.getItem("manpowerAdminActivity") || "[]");
    return Array.isArray(rows) ? rows.slice(0, limit) : [];
  } catch {
    return [];
  }
}

export function formatDateTime(value, fallback = "-") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
}

export function downloadCsv(filename, headers, rows) {
  const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const content = [headers.map(escapeCell).join(","), ...rows.map((row) => row.map(escapeCell).join(","))].join("\n");
  const blob = new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function AdminShell({ current, title, subtitle, children, onLogout, actions }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const admin = useMemo(readAdminUser, []);
  const adminName = admin.fullName || admin.name || admin.username || "Administrator";
  const adminEmail = admin.email || admin.companyEmail || "System administrator";

  const completeLogout = () => {
    if (typeof onLogout === "function") onLogout();
    else {
      clearAdminSession();
      navigate("/manpower-admin-login", { replace: true });
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full min-h-0 w-full flex-col">
      <button type="button" onClick={() => navigate("/manpower-admin")} className="flex w-full shrink-0 flex-col items-center justify-center rounded-[26px] px-4 py-4 text-center transition hover:bg-white/5">
        <p className="w-full text-center text-[10px] font-extrabold uppercase leading-tight tracking-[0.2em] text-[#f4d484]">Manpower Services Admin</p>
        <p className="mt-2 w-full text-center text-[14px] font-extrabold leading-tight text-white">LTC Manpower Services</p>
      </button>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <p className="truncate text-sm font-extrabold text-white">{adminName}</p>
        <p className="mt-1 truncate text-[11px] font-semibold text-white/55">{adminEmail}</p>
      </div>

      <nav className="mt-6 flex shrink-0 flex-col gap-2">
        {adminNavItems.map((item) => {
          const isActive = current === item.key;
          const Icon = item.Icon;
          return <button key={item.key} type="button" onClick={() => { setMobileOpen(false); navigate(item.path); }} className={`flex min-h-[48px] w-full items-center gap-3 rounded-[20px] px-5 text-left text-[13px] font-extrabold transition ${isActive ? "bg-[#f8fbf9] text-[#071f14] shadow-sm" : "text-white/88 hover:bg-white/10 hover:text-white"}`}><span className="flex h-5 w-5 items-center justify-center"><Icon /></span><span className="truncate">{item.label}</span></button>;
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="mb-4 h-px bg-white/18" />
        <button type="button" onClick={() => window.open("/manpower-services", "_blank", "noopener,noreferrer")} className="mb-2 flex h-12 w-full items-center gap-3 rounded-[20px] px-5 text-[13px] font-extrabold text-white/85 transition hover:bg-white/10 hover:text-white"><IconExternal />View Public Website</button>
        <button type="button" onClick={() => setShowLogout(true)} className="flex h-12 w-full items-center gap-3 rounded-[20px] bg-white/10 px-5 text-[13px] font-extrabold text-white transition hover:bg-white/16"><IconLogout />Sign out</button>
        <p className="mt-5 text-center text-[11px] font-semibold text-white/55">© LTC Manpower Services</p>
      </div>
    </div>
  );

  return <div className="min-h-screen bg-[#f8fbf9] text-[#071f14] lg:flex">
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] overflow-hidden bg-[#082719] px-6 py-6 lg:flex"><SidebarContent /></aside>
    {mobileOpen ? <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/45" /><aside className="relative z-10 flex h-full w-[300px] max-w-[86vw] flex-col overflow-hidden bg-[#082719] px-6 py-6 shadow-2xl"><div className="mb-3 flex justify-end"><button type="button" onClick={() => setMobileOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white" aria-label="Close navigation">×</button></div><SidebarContent /></aside></div> : null}
    <section className="min-w-0 flex-1 lg:pl-[280px]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3"><button type="button" onClick={() => setMobileOpen(true)} className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white text-lg font-extrabold lg:hidden" aria-label="Open menu">☰</button><div><p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#235f3e]">Manpower Center</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#071f14] md:text-5xl">{title}</h1>{subtitle ? <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#071f14]/65">{subtitle}</p> : null}</div></div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </section>
    <AdminModal open={showLogout} title="Sign out of Admin?" description="You will need to enter your credentials again to access the Manpower Admin portal." onClose={() => setShowLogout(false)} footer={<><ActionButton variant="ghost" onClick={() => setShowLogout(false)}>Stay signed in</ActionButton><ActionButton variant="danger" onClick={completeLogout}>Sign out</ActionButton></>}><p className="text-sm leading-6 text-[#5f6f61]">Any unsaved form changes on the current page will be lost.</p></AdminModal>
  </div>;
}

export function AuthShell({ children }) { return <div className="flex min-h-screen items-center justify-center bg-[#f6f8f3] px-4 py-10 text-[#1f2a22]"><div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#dfe9d8]/70 blur-3xl" /><div className="absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-[#eef3ea] blur-3xl" /></div><div className="relative w-full max-w-md">{children}</div></div>; }

export function SectionCard({ title, subtitle, action, children, className = "" }) { return <section className={`overflow-hidden rounded-[24px] border border-[#d7decf] bg-white shadow-sm transition duration-300 hover:shadow-lg ${className}`}>{title || subtitle || action ? <div className="flex flex-col gap-3 border-b border-[#eef2ea] bg-[#f7faf5] px-5 py-4 md:flex-row md:items-center md:justify-between"><div>{title ? <h2 className="text-xl font-bold text-[#24352c]">{title}</h2> : null}{subtitle ? <p className="mt-1 text-sm leading-6 text-[#5f6f61]">{subtitle}</p> : null}</div>{action ? <div className="shrink-0">{action}</div> : null}</div> : null}<div className="p-5">{children}</div></section>; }

export function StatCard({ title, value, subtitle, tone = "dark" }) { const textTone = tone === "success" ? "text-[#246843]" : tone === "danger" ? "text-[#8b3232]" : tone === "warning" ? "text-[#b54708]" : "text-[#24352c]"; return <div className="rounded-[22px] border border-[#d7decf] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#68806e]">{title}</p><p className={`mt-2 text-3xl font-bold ${textTone}`}>{value}</p>{subtitle ? <p className="mt-2 text-xs leading-6 text-[#607062]">{subtitle}</p> : null}</div>; }
export function StatusPill({ children, tone = "neutral" }) { return <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.04em] ${toneClasses[tone] || toneClasses.neutral}`}>{children}</span>; }
export function ActionButton({ children, type = "button", variant = "primary", size = "md", className = "", loading = false, disabled, ...props }) { const sizeClass = size === "sm" ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm"; return <button type={type} disabled={disabled || loading} className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClass} ${actionButtonClasses[variant] || actionButtonClasses.primary} ${className}`} {...props}>{loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" /> : null}{children}</button>; }
export function LoadingState({ children = "Loading..." }) { return <div className="rounded-[24px] border border-[#d7decf] bg-white p-10 text-center text-sm font-medium text-[#6b7a6d] shadow-sm"><span className="mx-auto mb-3 block h-7 w-7 animate-spin rounded-full border-2 border-[#395345] border-r-transparent" />{children}</div>; }
export function EmptyState({ children = "No records found." }) { return <div className="rounded-[24px] border border-dashed border-[#c6ccb9] bg-white p-10 text-center text-sm font-medium text-[#6b7a6d] shadow-sm">{children}</div>; }
export function ErrorState({ message = "Something went wrong.", onRetry }) { return <div className="rounded-[24px] border border-[#efcaca] bg-[#fff8f8] p-8 text-center shadow-sm"><p className="font-bold text-[#8b3232]">Unable to load this page</p><p className="mt-2 text-sm text-[#8b3232]/75">{message}</p>{onRetry ? <ActionButton className="mt-4" variant="danger" onClick={onRetry}>Retry</ActionButton> : null}</div>; }
export function FieldLabel({ children }) { return <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#68806e]">{children}</span>; }
export function CompactCell({ label, children, className = "" }) { return <div className={`min-w-0 ${className}`}><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#708071]">{label}</p><div className="min-w-0 text-sm font-semibold text-[#24352c]">{children}</div></div>; }

export function InlineNotice({ tone = "info", title, children, className = "" }) { const map = { success: "border-[#b9dec7] bg-[#eef9f2] text-[#246843]", danger: "border-[#efcaca] bg-[#fff4f4] text-[#8b3232]", warning: "border-[#f2d39f] bg-[#fff8ec] text-[#9a5b08]", info: "border-[#cbdcf7] bg-[#f3f7ff] text-[#244b92]" }; return <div className={`rounded-2xl border px-4 py-3 text-sm ${map[tone] || map.info} ${className}`}>{title ? <p className="font-extrabold">{title}</p> : null}<div className={title ? "mt-1 leading-6" : "leading-6"}>{children}</div></div>; }

export function Toast({ notice, onClose }) { if (!notice) return null; const tone = notice.tone || "success"; const map = { success: "border-[#b9dec7] bg-[#eef9f2] text-[#246843]", danger: "border-[#efcaca] bg-[#fff4f4] text-[#8b3232]", warning: "border-[#f2d39f] bg-[#fff8ec] text-[#9a5b08]", info: "border-[#cbdcf7] bg-[#f3f7ff] text-[#244b92]" }; return <div className={`fixed right-4 top-4 z-[90] w-[min(420px,calc(100vw-2rem))] rounded-2xl border p-4 shadow-2xl ${map[tone] || map.success}`} role="status"><div className="flex items-start justify-between gap-4"><div><p className="font-extrabold">{notice.title || (tone === "danger" ? "Action failed" : "Success")}</p>{notice.message ? <p className="mt-1 text-sm leading-6 opacity-85">{notice.message}</p> : null}</div><button type="button" className="text-xl leading-none opacity-60 hover:opacity-100" onClick={onClose} aria-label="Close notification">×</button></div></div>; }

export function AdminModal({ open, title, description, children, footer, onClose, maxWidth = "max-w-lg" }) { if (!open) return null; return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><button type="button" className="absolute inset-0 bg-[#071f14]/60 backdrop-blur-sm" onClick={onClose} aria-label="Close modal" /><section className={`relative z-10 max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-[26px] border border-white/70 bg-white shadow-2xl`} role="dialog" aria-modal="true"><div className="flex items-start justify-between gap-4 border-b border-[#e8eee7] px-6 py-5"><div><h2 className="text-xl font-black text-[#071f14]">{title}</h2>{description ? <p className="mt-1 text-sm leading-6 text-[#5f6f61]">{description}</p> : null}</div><button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef3ea] text-xl text-[#395345] hover:bg-[#e3ebdd]" aria-label="Close">×</button></div><div className="px-6 py-5">{children}</div>{footer ? <div className="flex flex-wrap justify-end gap-2 border-t border-[#e8eee7] bg-[#f8faf6] px-6 py-4">{footer}</div> : null}</section></div>; }

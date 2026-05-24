import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const DEFAULT_VACANCIES = [
  "Accounting Clerk",
  "General Clerk",
  "Money Sorter",
  "Data Encoder",
  "Admin Assistant",
  "HR Assistant",
  "Production Worker",
  "Warehouseman",
  "Stockman",
  "Sales Coordinator",
  "Financial Advisor",
  "Engineer",
  "Driver",
  "Promodiser",
  "Merchandiser",
  "Messenger",
  "Forklift Operator",
  "Janitor",
];

const ATTENDANCE_FIELDS = [
  { key: "regularHours", label: "Regular Hours" },
  { key: "overtimeHours", label: "OT Hours" },
  { key: "restDayHours", label: "Rest Day Hours" },
  { key: "restDayOtHours", label: "Rest Day OT Hours" },
  { key: "specialHolidayHours", label: "Special Holiday Hours" },
  { key: "specialHolidayOtHours", label: "Special Holiday OT Hours" },
  {
    key: "specialHolidayRestDayHours",
    label: "Special Holiday + Rest Day Hours",
  },
  {
    key: "specialHolidayRestDayOtHours",
    label: "Special Holiday + Rest Day OT Hours",
  },
  { key: "regularHolidayHours", label: "Regular Holiday Hours" },
  { key: "regularHolidayOtHours", label: "Regular Holiday OT Hours" },
  {
    key: "regularHolidayRestDayHours",
    label: "Regular Holiday + Rest Day Hours",
  },
  {
    key: "regularHolidayRestDayOtHours",
    label: "Regular Holiday + Rest Day OT Hours",
  },
  { key: "nightDiffHours", label: "Night Diff Hours" },
  { key: "sundayHours", label: "Sunday Hours" },
  { key: "sundayOtHours", label: "Sunday OT Hours" },
  { key: "lateHours", label: "Late Hours" },
  { key: "undertimeHours", label: "Undertime Hours" },
  { key: "absentDays", label: "Absent Days" },
];

const HIDDEN_COMPUTED_KEYS = new Set([
  "baseFromDays",
  "baseFromHours",
  "manualAllowance",
  "manualBonus",
  "sssEmployee",
  "philhealthEmployee",
  "pagibigEmployee",
  "withholdingTax",
  "cashAdvance",
  "loanDeduction",
  "otherDeduction",
]);

function getHrToken() {
  return localStorage.getItem("manpowerHrToken") || "";
}

function getHrUser() {
  try {
    return JSON.parse(localStorage.getItem("manpowerHrUser") || "null");
  } catch {
    return null;
  }
}

function clearHrSession() {
  localStorage.removeItem("manpowerHrToken");
  localStorage.removeItem("manpowerHrUser");
}

function hrHeaders(extra = {}) {
  const token = getHrToken();

  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

function toNumber(value = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function formatMoney(value = 0) {
  return toNumber(value).toFixed(2);
}

function formatDateInput(date) {
  const safeDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(safeDate.getTime())) return "";

  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, "0");
  const day = String(safeDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLastDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
}

function getEmployeeName(employee) {
  return (
    employee?.fullName ||
    [employee?.firstName, employee?.middleName, employee?.lastName]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() ||
    "Full name of the Employee"
  );
}

function createAttendanceDefaults() {
  return {
    regularHours: 0,
    overtimeHours: 0,
    restDayHours: 0,
    restDayOtHours: 0,
    specialHolidayHours: 0,
    specialHolidayOtHours: 0,
    specialHolidayRestDayHours: 0,
    specialHolidayRestDayOtHours: 0,
    regularHolidayHours: 0,
    regularHolidayOtHours: 0,
    regularHolidayRestDayHours: 0,
    regularHolidayRestDayOtHours: 0,
    nightDiffHours: 0,
    sundayHours: 0,
    sundayOtHours: 0,
    lateHours: 0,
    undertimeHours: 0,
    absentDays: 0,
  };
}

function createEmptyPayrollForm() {
  return {
    cutoffStart: "",
    cutoffEnd: "",
    attendance: createAttendanceDefaults(),
    adjustments: {
      allowAutoGovernmentDeductions: true,
    },
  };
}

function createDualPayrollForms(baseDate = new Date()) {
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const fifteenth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 15);
  const sixteenth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 16);
  const lastDay = getLastDayOfMonth(baseDate);

  return {
    firstHalf: {
      ...createEmptyPayrollForm(),
      cutoffStart: formatDateInput(firstDay),
      cutoffEnd: formatDateInput(fifteenth),
    },
    secondHalf: {
      ...createEmptyPayrollForm(),
      cutoffStart: formatDateInput(sixteenth),
      cutoffEnd: formatDateInput(lastDay),
    },
  };
}

function prettifyKey(key = "") {
  return String(key || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function getVisibleComputedItems(items = {}) {
  return Object.entries(items).filter(([key]) => !HIDDEN_COMPUTED_KEYS.has(key));
}

function getCutoffKey(start, end) {
  return `${String(start || "")}__${String(end || "")}`;
}

function getCutoffKeyFromRecord(record) {
  return getCutoffKey(
    formatDateInput(record?.cutoffStart),
    formatDateInput(record?.cutoffEnd)
  );
}

function getRowTimestamp(row) {
  const updatedAt = row?.updatedAt ? new Date(row.updatedAt).getTime() : 0;
  const createdAt = row?.createdAt ? new Date(row.createdAt).getTime() : 0;

  return Math.max(updatedAt || 0, createdAt || 0);
}

function dedupePayrollRows(rows = []) {
  const map = new Map();

  for (const row of rows) {
    const key = [
      String(row?.employeeId?._id || row?.employeeId || ""),
      getCutoffKeyFromRecord(row),
    ].join("__");

    if (!key) continue;

    const existing = map.get(key);

    if (!existing || getRowTimestamp(row) >= getRowTimestamp(existing)) {
      map.set(key, row);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const aStart = a?.cutoffStart ? new Date(a.cutoffStart).getTime() : 0;
    const bStart = b?.cutoffStart ? new Date(b.cutoffStart).getTime() : 0;

    if (bStart !== aStart) return bStart - aStart;

    return getRowTimestamp(b) - getRowTimestamp(a);
  });
}

function buildFormFromPayroll(record) {
  return {
    cutoffStart: formatDateInput(record?.cutoffStart),
    cutoffEnd: formatDateInput(record?.cutoffEnd),
    attendance: {
      ...createAttendanceDefaults(),
      ...(record?.attendance || {}),
    },
    adjustments: {
      allowAutoGovernmentDeductions:
        record?.adjustments?.allowAutoGovernmentDeductions !== false,
    },
  };
}

function findPayrollForForm(payrollRows, form) {
  const targetKey = getCutoffKey(form?.cutoffStart, form?.cutoffEnd);

  return (
    payrollRows.find((row) => getCutoffKeyFromRecord(row) === targetKey) || null
  );
}

function upsertPayrollRow(rows, row) {
  return dedupePayrollRows([...(Array.isArray(rows) ? rows : []), row]);
}

function getPhilHealthRule(result) {
  return result?.computed?.philhealthRule || null;
}

function getWithholdingTaxRule(result) {
  return result?.computed?.withholdingTaxRule || null;
}


function SidebarIcon({ type }) {
  const common = "h-4 w-4";

  if (type === "applicants") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-8 0v2" />
        <circle cx="12" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 8v6M23 11h-6" />
      </svg>
    );
  }

  if (type === "payroll") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h4M15 15h2" />
      </svg>
    );
  }

  if (type === "leave") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4M16 2v4M3 10h18" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m8 15 2.4 2.4L16 12" />
      </svg>
    );
  }

  if (type === "billing") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6M9 11h6M9 15h3" />
      </svg>
    );
  }

  if (type === "logout") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m16 17 5-5-5-5M21 12H9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}


function RefreshIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 0 1-15.3 6.36L3 15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15v6h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12A9 9 0 0 1 18.3 5.64L21 9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 9V3h-6" />
    </svg>
  );
}

function OpenPayrollIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 15h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 15h1" />
    </svg>
  );
}

function SidebarButton({ active = false, children, onClick, icon = "dashboard" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[46px] w-full items-center gap-3 rounded-[23px] px-5 text-left text-[12px] font-black tracking-tight transition duration-300 ${
        active
          ? "bg-white text-[#071f14] shadow-[0_18px_38px_rgba(0,0,0,0.20)]"
          : "text-white hover:translate-x-1 hover:bg-white/10"
      }`}
    >
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center transition duration-300 ${
          active ? "text-[#071f14]" : "text-white/85 group-hover:text-[#f4d484]"
        }`}
      >
        <SidebarIcon type={icon} />
      </span>
      <span className="min-w-0 flex-1 leading-tight">{children}</span>
    </button>
  );
}

function PayrollStatCard({ title, value, note, tone = "green" }) {
  const valueColor = tone === "red" ? "text-[#9d2f2f]" : tone === "gold" ? "text-[#bd6b00]" : "text-[#071f14]";

  return (
    <div className="group relative min-h-[132px] overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(8,39,25,0.16)]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-14 -right-12 h-36 w-36 rounded-full bg-[#f4d484]/20 blur-2xl transition group-hover:scale-110" />
      <p className="relative text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
        {title}
      </p>
      <p className={`relative mt-4 text-4xl font-black leading-none tracking-tight ${valueColor}`}>
        {value}
      </p>
      {note ? (
        <p className="relative mt-3 text-sm font-semibold text-[#071f14]/55">
          {note}
        </p>
      ) : null}
    </div>
  );
}

function SectionCard({ eyebrow, title, children, className = "", right = null }) {
  return (
    <section className={`relative overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 ${className}`}>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-[#f4d484]/20 blur-2xl" />
      <div className="relative p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071f14]">
                {title}
              </h2>
            ) : null}
          </div>
          {right}
        </div>
        <div className={title || eyebrow ? "mt-5" : ""}>{children}</div>
      </div>
    </section>
  );
}

function EmployeeInitials({ employee }) {
  const name = getEmployeeName(employee).split(/\s+/).filter(Boolean);
  const first = name[0]?.charAt(0) || "E";
  const last = name.length > 1 ? name[name.length - 1].charAt(0) : "M";
  return `${first}${last}`.toUpperCase();
}

function HalfPayrollTable({
  title,
  form,
  result,
  isEditing,
  isLoading,
  onEdit,
  onTopLevelChange,
  onAttendanceChange,
  onToggleAuto,
  onSave,
}) {
  const visibleItems = getVisibleComputedItems(result?.computed?.items || {});
  const philhealthRule = getPhilHealthRule(result);
  const withholdingTaxRule = getWithholdingTaxRule(result);
  const hasSavedRecord = Boolean(result?._id || result?.id);

  return (
    <section className="min-w-0 rounded-2xl border border-[#d7decf] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-[#24352c]">{title}</h3>
          <p className="text-xs text-[#6a7b6d]">
            {hasSavedRecord
              ? isEditing
                ? "Editing saved payroll record"
                : "Saved payroll loaded"
              : "New payroll encoding"}
          </p>

          {hasSavedRecord ? (
            <p className="mt-1 text-[11px] text-[#7a897c]">
              Last updated: {formatDateTime(result?.updatedAt || result?.createdAt)}
            </p>
          ) : null}
        </div>

        {hasSavedRecord && !isEditing ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-[#eef3ea] px-3 py-2 text-xs font-black text-[#395345]"
          >
            Edit
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mb-4 rounded-xl border border-[#d9e3d5] bg-[#f8faf6] px-3 py-3 text-xs text-[#5f7365]">
          Loading saved payroll...
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-xl border border-[#d9e3d5]">
            <div className="border-b border-[#e8eee4] bg-[#f6faf3] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#5f7365]">
              Cutoff Details
            </div>

            <div className="grid gap-3 p-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.12em] text-[#68806e]">
                  Cutoff Start
                </label>

                <input
                  type="date"
                  value={form.cutoffStart}
                  disabled={hasSavedRecord && !isEditing}
                  onChange={(event) =>
                    onTopLevelChange("cutoffStart", event.target.value)
                  }
                  className="w-full rounded-lg border border-[#c6ccb9] px-3 py-2 text-xs outline-none focus:border-[#395345] disabled:bg-[#f3f5f1] disabled:text-[#6c7b6e]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.12em] text-[#68806e]">
                  Cutoff End
                </label>

                <input
                  type="date"
                  value={form.cutoffEnd}
                  disabled={hasSavedRecord && !isEditing}
                  onChange={(event) =>
                    onTopLevelChange("cutoffEnd", event.target.value)
                  }
                  className="w-full rounded-lg border border-[#c6ccb9] px-3 py-2 text-xs outline-none focus:border-[#395345] disabled:bg-[#f3f5f1] disabled:text-[#6c7b6e]"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-[#d9e3d5]">
            <div className="border-b border-[#e8eee4] bg-[#f6faf3] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#5f7365]">
              Attendance Table
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              <table className="min-w-full text-xs">
                <tbody>
                  {ATTENDANCE_FIELDS.map((field) => (
                    <tr key={field.key} className="border-b border-[#eef2ea]">
                      <td className="px-3 py-2 font-medium text-[#395345]">
                        {field.label}
                      </td>

                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.25"
                          value={form.attendance[field.key]}
                          disabled={hasSavedRecord && !isEditing}
                          onChange={(event) =>
                            onAttendanceChange(field.key, event.target.value)
                          }
                          className="w-full rounded-lg border border-[#c6ccb9] px-3 py-2 text-xs outline-none focus:border-[#395345] disabled:bg-[#f3f5f1] disabled:text-[#6c7b6e]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="overflow-hidden rounded-xl border border-[#d9e3d5]">
            <div className="border-b border-[#e8eee4] bg-[#f6faf3] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#5f7365]">
              Government Deductions
            </div>

            <div className="p-3 text-xs text-[#31443a]">
              <label className="flex items-center gap-2 rounded-lg border border-[#d9e3d5] bg-[#fbfdf9] px-3 py-2">
                <input
                  type="checkbox"
                  checked={Boolean(form.adjustments.allowAutoGovernmentDeductions)}
                  disabled={hasSavedRecord && !isEditing}
                  onChange={(event) => onToggleAuto(event.target.checked)}
                />

                <span className="font-medium text-[#395345]">
                  Auto Government Deductions
                </span>
              </label>

              <p className="mt-2 text-[11px] leading-5 text-[#6b7a6d]">
                When enabled, the system computes SSS, PhilHealth, Pag-IBIG,
                and withholding tax automatically.
              </p>
            </div>
          </div>

          {!hasSavedRecord || isEditing ? (
            <button
              type="button"
              onClick={onSave}
              className="mt-4 w-full rounded-xl bg-[#395345] px-4 py-3 text-xs font-black text-white transition hover:bg-[#2c4136]"
            >
              {hasSavedRecord ? `Update ${title}` : `Save ${title}`}
            </button>
          ) : null}

          <div className="mt-4 overflow-hidden rounded-xl border border-[#d9e3d5]">
            <div className="border-b border-[#e8eee4] bg-[#f6faf3] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#5f7365]">
              Computed Result
            </div>

            {result?.computed ? (
              <div className="space-y-3 p-3 text-xs text-[#31443a]">
                <div className="rounded-lg border border-[#d9e3d5] bg-[#fbfdf9] p-3">
                  <p>
                    Payroll Cycle:{" "}
                    <span className="font-black">
                      {result.computed.payrollCycleLabel ||
                        result.computed.payrollCycle ||
                        (title.includes("1st") ? "1st Half" : "2nd Half")}
                    </span>
                  </p>
                  <p>Rate Per Day: {formatMoney(result.computed.ratePerDay)}</p>
                  <p>Hourly Rate: {formatMoney(result.computed.hourlyRate)}</p>
                  <p>Gross Pay: {formatMoney(result.computed.grossPay)}</p>
                  <p>
                    Total Deductions:{" "}
                    {formatMoney(result.computed.totalDeductions)}
                  </p>
                  <p className="font-black text-[#1d6b39]">
                    Net Pay: {formatMoney(result.computed.netPay)}
                  </p>
                </div>

                <div className="rounded-lg border border-[#d9e3d5] bg-[#fbfdf9] p-3">
                  <p className="mb-2 font-black text-[#24352c]">
                    Government Deductions
                  </p>
                  <p>SSS: {formatMoney(result.computed.items?.sssEmployee)}</p>
                  <p>
                    PhilHealth:{" "}
                    {formatMoney(result.computed.items?.philhealthEmployee)}
                  </p>
                  <p>
                    Pag-IBIG: {formatMoney(result.computed.items?.pagibigEmployee)}
                  </p>
                  <p>
                    Withholding Tax:{" "}
                    {formatMoney(result.computed.items?.withholdingTax)}
                  </p>
                </div>

                {withholdingTaxRule ? (
                  <div className="rounded-lg border border-[#d9e3d5] bg-[#fbfdf9] p-3">
                    <p className="mb-2 font-black text-[#24352c]">
                      Philippine Withholding Tax
                    </p>
                    <p>
                      Method:{" "}
                      {withholdingTaxRule.method ||
                        "BIR_SEMI_MONTHLY_2023_ONWARD"}
                    </p>
                    <p>
                      Taxable Compensation:{" "}
                      {formatMoney(withholdingTaxRule.taxableCompensation)}
                    </p>
                    <p>Bracket: {withholdingTaxRule.bracket || "-"}</p>
                    <p>Base Tax: {formatMoney(withholdingTaxRule.baseTax)}</p>
                    <p>Excess Over: {formatMoney(withholdingTaxRule.excessOver)}</p>
                    <p>
                      Rate:{" "}
                      {formatMoney(Number(withholdingTaxRule.rate || 0) * 100)}%
                    </p>
                    <p className="font-black text-[#8b3232]">
                      Withholding Tax:{" "}
                      {formatMoney(withholdingTaxRule.withholdingTax)}
                    </p>
                  </div>
                ) : null}

                {philhealthRule ? (
                  <div className="rounded-lg border border-[#d9e3d5] bg-[#fbfdf9] p-3">
                    <p className="mb-2 font-black text-[#24352c]">
                      Custom PhilHealth Rule
                    </p>
                    <p>
                      Whole Month Salary:{" "}
                      {formatMoney(philhealthRule?.wholeMonthSalary)}
                    </p>
                    <p>
                      Total PhilHealth:{" "}
                      {formatMoney(philhealthRule?.totalPhilHealth)}
                    </p>
                    <p>
                      Employee Monthly Share:{" "}
                      {formatMoney(philhealthRule?.employeeMonthlyShare)}
                    </p>
                    <p>
                      1st Half Deduction:{" "}
                      {formatMoney(philhealthRule?.firstHalfDeduction)}
                    </p>
                    <p>
                      2nd Half Deduction:{" "}
                      {formatMoney(philhealthRule?.secondHalfDeduction)}
                    </p>
                  </div>
                ) : null}

                <div className="max-h-[220px] overflow-y-auto rounded-lg border border-[#d9e3d5] bg-[#fbfdf9]">
                  <table className="min-w-full text-[11px]">
                    <tbody>
                      {visibleItems.map(([key, value]) => (
                        <tr key={key} className="border-b border-[#eef2ea]">
                          <td className="px-3 py-2 font-medium text-[#68806e]">
                            {prettifyKey(key)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatMoney(value || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="p-3 text-xs leading-6 text-[#5a6d5f]">
                Save this half to show the computed result here.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ManpowerHrPayroll() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [token, setToken] = useState(getHrToken());
  const [hrUser] = useState(getHrUser());

  const [employees, setEmployees] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loadingSelectedPayroll, setLoadingSelectedPayroll] = useState(false);

  const [payrollForms, setPayrollForms] = useState(() =>
    createDualPayrollForms()
  );

  const [payrollResults, setPayrollResults] = useState({
    firstHalf: null,
    secondHalf: null,
  });

  const [editMode, setEditMode] = useState({
    firstHalf: true,
    secondHalf: true,
  });

  const [employeePayrollRows, setEmployeePayrollRows] = useState([]);

  const itemsPerPage = 5;

  const vacancies = jobs.length ? jobs.map((job) => job.title) : DEFAULT_VACANCIES;

  const hrEmail =
    hrUser?.email ||
    hrUser?.companyEmail ||
    hrUser?.username ||
    "traineeemail@tamsi.com";

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      try {
        const res = await fetch(`${API_BASE}/manpower/vacancies`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load job vacancies.");
        }

        if (active) {
          setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        }
      } catch (error) {
        console.error("loadManpowerJobs error:", error);

        if (active) {
          setJobs([]);
        }
      }
    }

    loadJobs();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/manpower-hr-login", { replace: true });
      return;
    }

    loadEmployees();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, employeeFilter, navigate]);

  function logout() {
    clearHrSession();
    setToken("");
    navigate("/manpower-hr-login", { replace: true });
  }

  async function loadEmployees() {
    setLoadingEmployees(true);

    try {
      const query = new URLSearchParams();

      if (employeeFilter) {
        query.set("vacancy", employeeFilter);
      }

      const queryString = query.toString();

      const url = queryString
        ? `${API_BASE}/manpower/hr/employees?${queryString}`
        : `${API_BASE}/manpower/hr/employees`;

      const res = await fetch(url, {
        headers: hrHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (res.ok) {
        setEmployees(Array.isArray(data.employees) ? data.employees : []);
        setPage(1);
      }
    } finally {
      setLoadingEmployees(false);
    }
  }

  const filteredEmployees = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch = !keyword
        ? true
        : [
            getEmployeeName(employee),
            employee?.companyEmail,
            employee?.email,
            employee?.personalEmail,
            employee?.vacancy,
            employee?.deploymentSite,
            employee?.dailyRate,
            employee?.active === false ? "inactive" : "active",
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(keyword);

      return matchesSearch;
    });
  }, [employees, searchValue]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / itemsPerPage)
  );

  const pagedEmployees = filteredEmployees.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  function updatePayrollTopLevel(halfKey, key, value) {
    setPayrollForms((prev) => ({
      ...prev,
      [halfKey]: {
        ...prev[halfKey],
        [key]: value,
      },
    }));
  }

  function updatePayrollField(halfKey, group, key, value) {
    setPayrollForms((prev) => ({
      ...prev,
      [halfKey]: {
        ...prev[halfKey],
        [group]: {
          ...prev[halfKey][group],
          [key]:
            typeof prev[halfKey][group][key] === "boolean"
              ? value
              : value === ""
              ? ""
              : Number.isNaN(Number(value))
              ? value
              : Number(value),
        },
      },
    }));
  }

  async function loadPayrollForEmployee(employee, baseForms) {
    try {
      setLoadingSelectedPayroll(true);

      const query = new URLSearchParams({
        employeeId: employee._id,
      });

      const res = await fetch(
        `${API_BASE}/manpower/hr/payroll?${query.toString()}`,
        {
          headers: hrHeaders(),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load saved payroll.");
      }

      const rows = dedupePayrollRows(data?.payrolls || []);

      setEmployeePayrollRows(rows);

      const firstSaved = findPayrollForForm(rows, baseForms.firstHalf);
      const secondSaved = findPayrollForForm(rows, baseForms.secondHalf);

      setPayrollForms({
        firstHalf: firstSaved ? buildFormFromPayroll(firstSaved) : baseForms.firstHalf,
        secondHalf: secondSaved
          ? buildFormFromPayroll(secondSaved)
          : baseForms.secondHalf,
      });

      setPayrollResults({
        firstHalf: firstSaved || null,
        secondHalf: secondSaved || null,
      });

      setEditMode({
        firstHalf: !firstSaved,
        secondHalf: !secondSaved,
      });
    } catch (error) {
      alert(error?.message || "Failed to load saved payroll.");

      setPayrollForms(baseForms);

      setPayrollResults({
        firstHalf: null,
        secondHalf: null,
      });

      setEditMode({
        firstHalf: true,
        secondHalf: true,
      });

      setEmployeePayrollRows([]);
    } finally {
      setLoadingSelectedPayroll(false);
    }
  }

  function openPayrollModal(employee) {
    const baseForms = createDualPayrollForms(new Date());

    setSelectedEmployee(employee);

    setPayrollForms(baseForms);

    setPayrollResults({
      firstHalf: null,
      secondHalf: null,
    });

    setEditMode({
      firstHalf: true,
      secondHalf: true,
    });

    setEmployeePayrollRows([]);

    loadPayrollForEmployee(employee, baseForms);
  }

  async function savePayroll(halfKey) {
    if (!selectedEmployee?._id) return;

    const currentForm = payrollForms[halfKey];

    const payload = {
      cutoffStart: currentForm.cutoffStart,
      cutoffEnd: currentForm.cutoffEnd,
      wholeMonthSalary: 0,
      attendance: currentForm.attendance,
      adjustments: {
        allowAutoGovernmentDeductions:
          currentForm.adjustments.allowAutoGovernmentDeductions,
      },
    };

    const res = await fetch(
      `${API_BASE}/manpower/hr/payroll/${selectedEmployee._id}`,
      {
        method: "POST",
        headers: {
          ...hrHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data?.message || `Failed to save ${halfKey}.`);
      return;
    }

    const savedPayroll = data.payroll;

    setPayrollResults((prev) => ({
      ...prev,
      [halfKey]: savedPayroll,
    }));

    setPayrollForms((prev) => ({
      ...prev,
      [halfKey]: buildFormFromPayroll(savedPayroll),
    }));

    setEditMode((prev) => ({
      ...prev,
      [halfKey]: false,
    }));

    setEmployeePayrollRows((prev) => upsertPayrollRow(prev, savedPayroll));

    alert(`${halfKey === "firstHalf" ? "1st Half" : "2nd Half"} payroll saved.`);
  }

  return (
    <div className="min-h-screen bg-[#edf3ee] font-sans text-[#071f14]">
      <div className="grid min-h-screen lg:grid-cols-[270px_1fr]">
        <aside className="sticky top-0 flex h-screen min-h-screen w-full flex-col overflow-hidden bg-[#082719] px-7 py-9 text-white shadow-[18px_0_55px_rgba(7,31,20,0.28)]">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#f4d484]">
              Manpower Services HR
            </p>
            <h1 className="mt-3 text-[17px] font-black leading-tight tracking-tight text-white">
              LTC Manpower Services
            </h1>
          </div>

          <nav className="mt-12 flex-1 space-y-4">
            <SidebarButton icon="dashboard" onClick={() => navigate("/manpower-hr")}>
              Dashboard
            </SidebarButton>

            <SidebarButton
              icon="applicants"
              onClick={() => navigate("/manpower-hr-applications")}
            >
              Manage Applicants
            </SidebarButton>

            <SidebarButton active icon="payroll" onClick={() => navigate("/manpower-hr-payroll")}>
              Manage Payroll
            </SidebarButton>

            <SidebarButton icon="leave" onClick={() => navigate("/manpower-hr-leaves")}>
              Manage File Leave
            </SidebarButton>

            <SidebarButton icon="billing" onClick={() => navigate("/manpower-hr-billing")}>
              Manage Billing
            </SidebarButton>
          </nav>

          <div className="border-t border-white/15 pt-7">
            <button
              type="button"
              onClick={logout}
              className="group flex min-h-[46px] w-full items-center gap-3 rounded-[23px] bg-white/10 px-5 text-left text-[12px] font-black capitalize tracking-tight text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#f4d484] hover:text-[#071f14]"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center text-white/90 transition duration-300 group-hover:text-[#071f14]">
                <SidebarIcon type="logout" />
              </span>
              <span>Sign out</span>
            </button>
            <p className="mt-7 text-center text-[11px] font-bold text-white/55">
              © LTC Manpower Services
            </p>
          </div>
        </aside>

        <main className="min-w-0 px-5 py-6 lg:px-8">
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#071f14] via-[#174a30] to-[#315b42] p-7 text-white shadow-[0_30px_80px_rgba(8,39,25,0.18)] md:p-10">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#f4d484]/20 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f4d484]">
                  Manpower Payroll Center
                </p>
                <h1 className="mt-3 max-w-3xl text-[38px] font-black leading-[0.98] tracking-[-0.055em] md:text-[56px]">
                  Manage Payroll Records
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] font-semibold leading-7 text-white/75">
                  Select manpower employees, encode cutoff attendance, compute payroll deductions, and manage saved payroll cycles.
                </p>
              </div>

              <button
                type="button"
                onClick={loadEmployees}
                disabled={loadingEmployees}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-7 text-[13px] font-black uppercase tracking-[0.08em] text-[#071f14] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:bg-[#f4d484] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingEmployees ? "Refreshing..." : "Refresh Employees"}
              </button>
            </div>
          </section>

          <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <PayrollStatCard
              title="Employees"
              value={employees.length}
              note="Loaded payroll accounts"
            />
            <PayrollStatCard
              title="Showing"
              value={filteredEmployees.length}
              note="Filtered employee records"
            />
            <PayrollStatCard
              title="Active"
              value={employees.filter((item) => item.active !== false).length}
              note="Accounts ready for payroll"
            />
            <PayrollStatCard
              title="Page"
              value={`${page}/${totalPages}`}
              note="Employee list page"
              tone="gold"
            />
          </section>

          <SectionCard
            eyebrow="Payroll Tools"
            title="Employee Payroll Selection"
            className="mt-7"
            right={
              <div className="grid w-full gap-3 xl:w-auto xl:grid-cols-[230px_280px_auto]">
                <select
                  value={employeeFilter}
                  onChange={(event) => {
                    setEmployeeFilter(event.target.value);
                    setPage(1);
                  }}
                  className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[12px] font-black text-[#071f14] outline-none transition focus:border-[#d7a84d] focus:bg-white focus:shadow-[0_12px_28px_rgba(8,39,25,0.08)]"
                >
                  <option value="">All Jobs</option>
                  {vacancies.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => {
                    setSearchValue(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search employee, email, vacancy..."
                  className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[13px] font-bold text-[#071f14] outline-none transition placeholder:text-[#071f14]/45 focus:border-[#d7a84d] focus:bg-white focus:shadow-[0_12px_28px_rgba(8,39,25,0.08)]"
                />

                <button
                  type="button"
                  onClick={loadEmployees}
                  disabled={loadingEmployees}
                  className="group inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#174a30] text-white shadow-[0_12px_26px_rgba(8,39,25,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#d7a84d] hover:text-[#071f14] disabled:cursor-not-allowed disabled:opacity-70"
                  title={loadingEmployees ? "Loading employees" : "Refresh employee list"}
                  aria-label={loadingEmployees ? "Loading employees" : "Refresh employee list"}
                >
                  <RefreshIcon className={`h-4 w-4 transition duration-300 ${loadingEmployees ? "animate-spin" : "group-hover:rotate-180"}`} />
                </button>
              </div>
            }
          >
            <div className="overflow-hidden rounded-3xl border border-[#d7e2da] bg-[#f8fbf9]">
              {pagedEmployees.length ? (
                <div className="divide-y divide-[#d7e2da]">
                  {pagedEmployees.map((employee) => {
                    const employeeId = employee._id || employee.id;
                    const active = employee.active !== false;

                    return (
                      <article
                        key={employeeId || employee.companyEmail}
                        className="grid gap-4 bg-white/70 px-5 py-4 transition duration-300 hover:bg-white hover:shadow-[0_16px_40px_rgba(8,39,25,0.08)] md:min-h-[92px] md:grid-cols-[52px_minmax(190px,1.15fr)_minmax(250px,1.35fr)_minmax(160px,0.85fr)_minmax(98px,0.45fr)_56px] md:items-center md:gap-5"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#082719] text-[14px] font-black text-[#f4d484] shadow-[0_12px_26px_rgba(8,39,25,0.18)]">
                          <EmployeeInitials employee={employee} />
                        </div>

                        <div>
                          <p className="line-clamp-2 text-[14px] font-black leading-5 text-[#071f14]">
                            {getEmployeeName(employee)}
                          </p>
                          <p className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#071f14]/35">
                            Employee
                          </p>
                        </div>

                        <p className="min-w-0 truncate text-[13px] font-extrabold text-[#071f14]/70">
                          {employee.companyEmail ||
                            employee.email ||
                            employee.personalEmail ||
                            "traineeemail@tamsi.com"}
                        </p>

                        <p className="min-w-0 text-[13px] font-black leading-5 text-[#071f14]">
                          {employee.vacancy || employee.jobPosition || "Job"}
                        </p>

                        <span
                          className={`inline-flex w-fit justify-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] md:mx-auto ${
                            active
                              ? "bg-[#e7f7ec] text-[#0f6b35]"
                              : "bg-[#fee2e2] text-[#9d2f2f]"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>

                        <div className="flex justify-start md:justify-center">
                          <button
                            type="button"
                            onClick={() => openPayrollModal(employee)}
                            className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#082719] text-white shadow-[0_10px_24px_rgba(8,39,25,0.16)] ring-1 ring-[#082719]/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#d7a84d] hover:text-[#071f14] focus:outline-none focus:ring-4 focus:ring-[#d7a84d]/25"
                            title={`Open payroll for ${getEmployeeName(employee)}`}
                            aria-label={`Open payroll for ${getEmployeeName(employee)}`}
                          >
                            <OpenPayrollIcon className="h-4 w-4 transition duration-300 group-hover:scale-110" />
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  <div className="flex flex-col gap-4 border-t border-[#d7e2da] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[12px] font-bold text-[#071f14]/55">
                      Showing <b className="text-[#071f14]">{filteredEmployees.length ? (page - 1) * itemsPerPage + 1 : 0}</b> to <b className="text-[#071f14]">{Math.min(page * itemsPerPage, filteredEmployees.length)}</b> of <b className="text-[#071f14]">{filteredEmployees.length}</b> employees
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={page <= 1}
                        className="rounded-full border border-[#d7e2da] bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#071f14] transition hover:-translate-y-0.5 hover:border-[#d7a84d] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                      >
                        Prev
                      </button>
                      <span className="rounded-full bg-[#082719] px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-white">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                        disabled={page >= totalPages}
                        className="rounded-full border border-[#d7e2da] bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#071f14] transition hover:-translate-y-0.5 hover:border-[#d7a84d] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-14 text-center text-[14px] font-bold text-[#071f14]/55">
                  {loadingEmployees ? "Loading employees..." : "No employees found."}
                </div>
              )}
            </div>
          </SectionCard>
        </main>
      </div>

      {selectedEmployee ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071f14]/70 px-3 py-5 backdrop-blur-sm">
          <div className="mx-auto max-w-[1500px] animate-[payrollModalIn_0.35s_ease-out] overflow-hidden rounded-[32px] bg-[#edf3ee] text-[#071f14] shadow-[0_35px_100px_rgba(0,0,0,0.35)] ring-1 ring-white/40">
            <style>{`
              @keyframes payrollModalIn {
                from { opacity: 0; transform: translateY(24px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>

            <div className="relative overflow-hidden bg-gradient-to-br from-[#071f14] via-[#174a30] to-[#315b42] px-6 py-6 text-white md:px-8">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#f4d484]/20 blur-3xl" />
              <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f4d484]">
                    Manpower HR Payroll Action
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                    Payroll - {selectedEmployee.lastName}, {selectedEmployee.firstName}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/75">
                    {selectedEmployee.vacancy} • {selectedEmployee.companyEmail}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-white px-6 text-[12px] font-black uppercase tracking-[0.08em] text-[#071f14] transition hover:-translate-y-0.5 hover:bg-[#f4d484]"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {employeePayrollRows.length ? (
                <div className="mb-5 rounded-2xl border border-[#d7e2da] bg-white px-5 py-4 text-sm font-bold text-[#174a30] shadow-[0_12px_28px_rgba(8,39,25,0.06)]">
                  Saved payroll records found: {employeePayrollRows.length}
                </div>
              ) : null}

              <div className="grid gap-5 2xl:grid-cols-2">
                <HalfPayrollTable
                  title="1st Half Payroll"
                  form={payrollForms.firstHalf}
                  result={payrollResults.firstHalf}
                  isEditing={editMode.firstHalf}
                  isLoading={loadingSelectedPayroll}
                  onEdit={() =>
                    setEditMode((prev) => ({
                      ...prev,
                      firstHalf: true,
                    }))
                  }
                  onTopLevelChange={(key, value) =>
                    updatePayrollTopLevel("firstHalf", key, value)
                  }
                  onAttendanceChange={(key, value) =>
                    updatePayrollField("firstHalf", "attendance", key, value)
                  }
                  onToggleAuto={(checked) =>
                    updatePayrollField(
                      "firstHalf",
                      "adjustments",
                      "allowAutoGovernmentDeductions",
                      checked
                    )
                  }
                  onSave={() => savePayroll("firstHalf")}
                />

                <HalfPayrollTable
                  title="2nd Half Payroll"
                  form={payrollForms.secondHalf}
                  result={payrollResults.secondHalf}
                  isEditing={editMode.secondHalf}
                  isLoading={loadingSelectedPayroll}
                  onEdit={() =>
                    setEditMode((prev) => ({
                      ...prev,
                      secondHalf: true,
                    }))
                  }
                  onTopLevelChange={(key, value) =>
                    updatePayrollTopLevel("secondHalf", key, value)
                  }
                  onAttendanceChange={(key, value) =>
                    updatePayrollField("secondHalf", "attendance", key, value)
                  }
                  onToggleAuto={(checked) =>
                    updatePayrollField(
                      "secondHalf",
                      "adjustments",
                      "allowAutoGovernmentDeductions",
                      checked
                    )
                  }
                  onSave={() => savePayroll("secondHalf")}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

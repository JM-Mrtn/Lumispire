import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
  "Construction Worker",
];

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

function formatPeso(value = 0) {
  return Number(toNumber(value)).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCount(value) {
  return String(value || 0).padStart(2, "0");
}

function formatMonthInput(date) {
  const safeDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(safeDate.getTime())) return "";

  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function formatMonthDisplay(monthKey = "") {
  const [year, month] = String(monthKey || "").split("-");

  if (!year || !month) return monthKey || "-";

  const date = new Date(Number(year), Number(month) - 1, 1);

  if (Number.isNaN(date.getTime())) return monthKey || "-";

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
  });
}

function formatDateRange(start, end) {
  const startText = start ? new Date(start).toLocaleDateString() : "-";
  const endText = end ? new Date(end).toLocaleDateString() : "-";

  return `${startText} - ${endText}`;
}

function formatDateInput(date) {
  const safeDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(safeDate.getTime())) return "";

  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, "0");
  const day = String(safeDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

function getMonthKey(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function getEmployeeInfoFromRow(row) {
  const employee = row?.employeeId || {};

  const fullName =
    employee?.fullName ||
    [employee?.firstName, employee?.middleName, employee?.lastName]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() ||
    "Employee";

  return {
    id: String(employee?._id || row?.employeeId || ""),
    fullName,
    companyEmail: employee?.companyEmail || employee?.email || "-",
  };
}

function buildBillingGroups(
  rows = [],
  monthKey = "",
  vacancyFilter = "",
  vacancyList = DEFAULT_VACANCIES
) {
  const filteredRows = rows.filter((row) => {
    const rowMonth = getMonthKey(row?.cutoffEnd || row?.cutoffStart);

    if (!rowMonth || rowMonth !== monthKey) return false;

    const vacancy = String(row?.vacancy || row?.employeeId?.vacancy || "").trim();

    if (vacancyFilter && vacancy !== vacancyFilter) return false;

    return true;
  });

  const grouped = new Map();

  for (const row of filteredRows) {
    const vacancy = String(row?.vacancy || row?.employeeId?.vacancy || "").trim();

    if (!vacancy) continue;

    const employeeInfo = getEmployeeInfoFromRow(row);

    const servicesAmount = toNumber(
      row?.computed?.grossPay ??
        row?.grossPay ??
        row?.computed?.netPay ??
        row?.netPay
    );

    if (!grouped.has(vacancy)) {
      grouped.set(vacancy, {
        vacancy,
        monthKey,
        rows: [],
        employeeIds: new Set(),
        totalServicesRendered: 0,
      });
    }

    const group = grouped.get(vacancy);

    group.rows.push({
      employeeId: employeeInfo.id,
      employeeName: employeeInfo.fullName,
      companyEmail: employeeInfo.companyEmail,
      cutoffLabel: formatDateRange(row?.cutoffStart, row?.cutoffEnd),
      grossPay: toNumber(row?.computed?.grossPay ?? row?.grossPay),
      netPay: toNumber(row?.computed?.netPay ?? row?.netPay),
      servicesAmount,
    });

    if (employeeInfo.id) {
      group.employeeIds.add(employeeInfo.id);
    }

    group.totalServicesRendered += servicesAmount;
  }

  const vacancyOrder = new Map(
    (Array.isArray(vacancyList) ? vacancyList : DEFAULT_VACANCIES).map(
      (item, index) => [item, index]
    )
  );

  return Array.from(grouped.values())
    .map((group) => {
      const totalServicesRendered = toNumber(group.totalServicesRendered);
      const vatAmount = totalServicesRendered * 0.12;
      const totalBilling = totalServicesRendered + vatAmount;

      return {
        vacancy: group.vacancy,
        monthKey: group.monthKey,
        employeeCount: group.employeeIds.size,
        payrollEntryCount: group.rows.length,
        rows: group.rows.sort((a, b) =>
          a.employeeName.localeCompare(b.employeeName)
        ),
        totalServicesRendered,
        vatAmount,
        totalBilling,
      };
    })
    .sort((a, b) => {
      const aOrder = vacancyOrder.has(a.vacancy)
        ? vacancyOrder.get(a.vacancy)
        : 999;

      const bOrder = vacancyOrder.has(b.vacancy)
        ? vacancyOrder.get(b.vacancy)
        : 999;

      if (aOrder !== bOrder) return aOrder - bOrder;

      return a.vacancy.localeCompare(b.vacancy);
    });
}

function createBasePdf() {
  return new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
}

function drawBillingHeader(doc, group) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("LTC Manpower Services", 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("2/F 544 Curie Street, Palanan, Makati City", 14, 22);
  doc.text("09959808051 / 09516281271", 14, 27);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Monthly Billing Statement", 14, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Billing Month: ${formatMonthDisplay(group.monthKey)}`, 14, 45);
  doc.text(`Vacancy: ${group.vacancy}`, 14, 50);
  doc.text(`Employees: ${group.employeeCount}`, 14, 55);
  doc.text(`Payroll Entries Included: ${group.payrollEntryCount}`, 14, 60);
}

function drawBillingTotals(doc, group, startY) {
  const pageRight = 196;
  const boxLeft = 112;
  const labelX = boxLeft;
  const valueX = pageRight;
  const labelMaxWidth = 50;

  let y = startY;

  doc.setDrawColor(60, 83, 69);
  doc.setLineWidth(0.35);
  doc.line(boxLeft, y, pageRight, y);

  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);

  doc.text("TOTAL SERVICES RENDERED", labelX, y, {
    maxWidth: labelMaxWidth,
  });
  doc.text(formatPeso(group.totalServicesRendered), valueX, y, {
    align: "right",
  });

  y += 8;

  doc.text("PLUS: 12% VAT", labelX, y, {
    maxWidth: labelMaxWidth,
  });
  doc.text(formatPeso(group.vatAmount), valueX, y, {
    align: "right",
  });

  y += 10;

  doc.setDrawColor(60, 83, 69);
  doc.setLineWidth(0.35);
  doc.line(boxLeft, y - 4, pageRight, y - 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);

  doc.text("TOTAL BILLING", labelX, y, {
    maxWidth: labelMaxWidth,
  });
  doc.text(formatPeso(group.totalBilling), valueX, y, {
    align: "right",
  });

  return y + 10;
}

function addBillingSectionToPdf(doc, group, withPageBreak = false) {
  if (withPageBreak) {
    doc.addPage();
  }

  drawBillingHeader(doc, group);

  autoTable(doc, {
    startY: 66,
    head: [
      ["#", "Employee", "Company Email", "Cutoff Covered", "Services Amount"],
    ],
    body: group.rows.map((row, index) => [
      String(index + 1),
      row.employeeName,
      row.companyEmail,
      row.cutoffLabel,
      formatPeso(row.servicesAmount),
    ]),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2.6,
      valign: "middle",
      lineColor: [215, 222, 207],
      lineWidth: 0.2,
      textColor: [31, 42, 34],
    },
    headStyles: {
      fillColor: [238, 243, 234],
      textColor: [36, 53, 44],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { cellWidth: 48 },
      2: { cellWidth: 48 },
      3: { cellWidth: 46 },
      4: { halign: "right", cellWidth: 30 },
    },
    margin: {
      left: 14,
      right: 14,
    },
  });

  let finalY = doc.lastAutoTable?.finalY || 66;

  finalY += 10;

  if (finalY > 235) {
    doc.addPage();
    finalY = 20;
  }

  finalY = drawBillingTotals(doc, group, finalY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Billing basis used in this statement: total payroll gross pay for the selected month and vacancy.",
    14,
    finalY + 4,
    {
      maxWidth: 182,
    }
  );
}

function applyPageNumbers(doc) {
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Page ${i} of ${pageCount}`, 196, 287, {
      align: "right",
    });
  }
}

function downloadBillingForVacancy(group) {
  const safeVacancy = group.vacancy
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  const doc = createBasePdf();

  addBillingSectionToPdf(doc, group, false);
  applyPageNumbers(doc);

  doc.save(`billing-${safeVacancy}-${group.monthKey}.pdf`);
}

function downloadAllBillings(groups, monthKey) {
  if (!groups.length) return;

  const doc = createBasePdf();

  groups.forEach((group, index) => {
    addBillingSectionToPdf(doc, group, index > 0);
  });

  applyPageNumbers(doc);

  doc.save(`all-billings-${monthKey}.pdf`);
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

function ExportIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m7 10 5 5 5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 21h14" />
    </svg>
  );
}

function ViewIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
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

function BillingStatCard({ title, value, note, tone = "green" }) {
  const valueColor = tone === "red" ? "text-[#9d2f2f]" : tone === "gold" ? "text-[#bd6b00]" : "text-[#071f14]";

  return (
    <div className="group relative flex min-h-[112px] min-w-0 flex-col justify-between overflow-hidden rounded-[24px] border border-white/80 bg-white px-5 py-5 shadow-[0_14px_35px_rgba(8,39,25,0.09)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(8,39,25,0.14)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-16 -right-14 h-32 w-32 rounded-full bg-[#f4d484]/18 blur-2xl transition duration-300 group-hover:scale-110" />
      <div className="relative min-w-0">
        <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#071f14]/45">
          {title}
        </p>
        <p className={`mt-3 truncate text-[clamp(1.65rem,2.4vw,2.35rem)] font-black leading-none tracking-tight ${valueColor}`}>
          {value}
        </p>
        {note ? (
          <p className="mt-2 truncate text-[12px] font-semibold text-[#071f14]/55">
            {note}
          </p>
        ) : null}
      </div>
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

function BillingAmountRow({ label, value }) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-2xl border border-[#d7e2da] bg-white px-5 py-4 text-[#071f14] shadow-[0_10px_24px_rgba(8,39,25,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d7a84d] hover:shadow-[0_18px_40px_rgba(8,39,25,0.11)]">
      <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#071f14]/50">
        {label}
      </p>
      <p className="text-[18px] font-black text-[#071f14]">₱{formatPeso(value)}</p>
    </div>
  );
}

function VacancyBillingModal({ group, onClose, onDownload }) {
  if (!group) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl animate-[billingModalPop_0.35s_ease-out] overflow-hidden rounded-[32px] border border-white/80 bg-[#edf3ee] text-[#071f14] shadow-[0_34px_90px_rgba(0,0,0,0.32)]">
        <style>{`
          @keyframes billingModalPop {
            from { opacity: 0; transform: translateY(20px) scale(.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        <div className="relative overflow-hidden bg-gradient-to-br from-[#071f14] via-[#174a30] to-[#315b42] px-6 py-6 text-white">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#f4d484]/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f4d484]">
                Billing Details
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                {group.vacancy}
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/75">
                {formatMonthDisplay(group.monthKey)} • Employees: {group.employeeCount} • Payroll entries: {group.payrollEntryCount}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#f4d484] px-5 text-[12px] font-black uppercase tracking-[0.08em] text-[#071f14] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                <ExportIcon />
                Download PDF
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-12 items-center justify-center rounded-full bg-white/12 px-5 text-[12px] font-black uppercase tracking-[0.08em] text-white ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-white hover:text-[#071f14]"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <section className="grid gap-5 md:grid-cols-3">
            <BillingStatCard title="Total Services" value={`₱${formatPeso(group.totalServicesRendered)}`} note="Gross services rendered" />
            <BillingStatCard title="12% VAT" value={`₱${formatPeso(group.vatAmount)}`} note="Value added tax" tone="gold" />
            <BillingStatCard title="Total Billing" value={`₱${formatPeso(group.totalBilling)}`} note="Final billing amount" />
          </section>

          <SectionCard eyebrow="Payroll Entries" title="Included Payroll Records" className="mt-6">
            <div className="overflow-hidden rounded-3xl border border-[#d7e2da] bg-[#f8fbf9]">
              <div className="hidden grid-cols-[1.2fr_1.4fr_1fr_.8fr_.8fr_1fr] gap-4 border-b border-[#d7e2da] bg-[#eef4ef] px-5 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-[#071f14]/50 lg:grid">
                <span>Employee</span>
                <span>Company Email</span>
                <span>Cutoff</span>
                <span className="text-right">Gross</span>
                <span className="text-right">Net</span>
                <span className="text-right">Services</span>
              </div>

              <div className="max-h-[55vh] overflow-auto divide-y divide-[#d7e2da]">
                {group.rows.map((row, index) => (
                  <article
                    key={`${row.employeeId}-${index}-${row.cutoffLabel}`}
                    className="grid gap-3 bg-white/70 px-5 py-4 text-[13px] font-bold transition duration-300 hover:bg-white lg:grid-cols-[1.2fr_1.4fr_1fr_.8fr_.8fr_1fr] lg:items-center lg:gap-4"
                  >
                    <p className="font-black text-[#071f14]">{row.employeeName}</p>
                    <p className="break-all text-[#071f14]/65">{row.companyEmail}</p>
                    <p className="text-[#071f14]/70">{row.cutoffLabel}</p>
                    <p className="lg:text-right">₱{formatPeso(row.grossPay)}</p>
                    <p className="lg:text-right">₱{formatPeso(row.netPay)}</p>
                    <p className="font-black text-[#174a30] lg:text-right">₱{formatPeso(row.servicesAmount)}</p>
                  </article>
                ))}

                {!group.rows.length ? (
                  <div className="px-5 py-12 text-center text-sm font-bold text-[#071f14]/55">
                    No payroll entries found.
                  </div>
                ) : null}
              </div>
            </div>
          </SectionCard>

          <div className="mt-6 rounded-3xl border border-[#d7e2da] bg-white p-5 text-sm font-semibold leading-7 text-[#071f14]/65 shadow-[0_14px_30px_rgba(8,39,25,0.07)]">
            <p className="font-black text-[#071f14]">Billing Basis</p>
            <p className="mt-2">
              This billing uses the saved payroll <strong>gross pay</strong> totals for the selected month and vacancy, then adds 12% VAT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManpowerHrBilling() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [token, setToken] = useState(getHrToken());
  const [hrUser] = useState(getHrUser());

  const [billingMonth, setBillingMonth] = useState(() =>
    formatMonthInput(new Date())
  );

  const [vacancyFilter, setVacancyFilter] = useState("");
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [allPayrollRows, setAllPayrollRows] = useState([]);
  const [selectedBillingGroup, setSelectedBillingGroup] = useState(null);

  const vacancies = useMemo(() => {
    const dbVacancies = jobs
      .map((job) => String(job?.title || "").trim())
      .filter(Boolean);

    return dbVacancies.length ? dbVacancies : DEFAULT_VACANCIES;
  }, [jobs]);

  const hrEmail =
    hrUser?.email ||
    hrUser?.companyEmail ||
    hrUser?.username ||
    "traineeemail@tamsi.com";

  function logout() {
    clearHrSession();
    setToken("");
    navigate("/manpower-hr-login", {
      replace: true,
    });
  }

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
      navigate("/manpower-hr-login", {
        replace: true,
      });
      return;
    }

    loadAllPayrollRows();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  async function loadAllPayrollRows() {
    try {
      setLoadingBilling(true);

      const res = await fetch(`${API_BASE}/manpower/hr/payroll`, {
        headers: hrHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load payroll records.");
      }

      setAllPayrollRows(dedupePayrollRows(data?.payrolls || []));
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to load billing records.");
    } finally {
      setLoadingBilling(false);
    }
  }

  const billingGroups = useMemo(() => {
    return buildBillingGroups(
      allPayrollRows,
      billingMonth,
      vacancyFilter,
      vacancies
    );
  }, [allPayrollRows, billingMonth, vacancyFilter, vacancies]);

  const overallTotals = useMemo(() => {
    return billingGroups.reduce(
      (acc, group) => {
        acc.totalServicesRendered += toNumber(group.totalServicesRendered);
        acc.vatAmount += toNumber(group.vatAmount);
        acc.totalBilling += toNumber(group.totalBilling);
        acc.employeeCount += toNumber(group.employeeCount);
        acc.payrollEntryCount += toNumber(group.payrollEntryCount);

        return acc;
      },
      {
        totalServicesRendered: 0,
        vatAmount: 0,
        totalBilling: 0,
        employeeCount: 0,
        payrollEntryCount: 0,
      }
    );
  }, [billingGroups]);

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

            <SidebarButton icon="applicants" onClick={() => navigate("/manpower-hr-applications")}>
              Manage Applicants
            </SidebarButton>

            <SidebarButton icon="payroll" onClick={() => navigate("/manpower-hr-payroll")}>
              Manage Payroll
            </SidebarButton>

            <SidebarButton icon="leave" onClick={() => navigate("/manpower-hr-leaves")}>
              Manage File Leave
            </SidebarButton>

            <SidebarButton active icon="billing" onClick={() => navigate("/manpower-hr-billing")}>
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
                  Manpower Billing Center
                </p>
                <h1 className="mt-3 max-w-3xl text-[38px] font-black leading-[0.98] tracking-[-0.055em] md:text-[56px]">
                  Manage Billing Records
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] font-semibold leading-7 text-white/75">
                  Review monthly manpower billing, compute services rendered, export billing summaries, and inspect vacancy payroll records.
                </p>
              </div>

              <button
                type="button"
                onClick={loadAllPayrollRows}
                disabled={loadingBilling}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-7 text-[13px] font-black uppercase tracking-[0.08em] text-[#071f14] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:bg-[#f4d484] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingBilling ? "Refreshing..." : "Refresh Billing"}
              </button>
            </div>
          </section>

          <section className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            <BillingStatCard title="Vacancies" value={formatCount(billingGroups.length)} note="Billing groups found" />
            <BillingStatCard title="Employees" value={formatCount(overallTotals.employeeCount)} note="Included employees" />
            <BillingStatCard title="Payroll Entries" value={formatCount(overallTotals.payrollEntryCount)} note="Saved payroll rows" />
            <BillingStatCard title="Total Services" value={`₱${formatPeso(overallTotals.totalServicesRendered)}`} note="Gross services amount" tone="gold" />
            <BillingStatCard title="Total Billing" value={`₱${formatPeso(overallTotals.totalBilling)}`} note="With 12% VAT" />
          </section>

          <SectionCard
            eyebrow="Billing Tools"
            title="Monthly Billing Filters"
            className="mt-7"
            right={
              <div className="grid w-full gap-3 xl:w-auto xl:grid-cols-[240px_180px_auto_auto]">
                <select
                  value={vacancyFilter}
                  onChange={(event) => setVacancyFilter(event.target.value)}
                  className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[12px] font-black text-[#071f14] outline-none transition focus:border-[#d7a84d] focus:bg-white focus:shadow-[0_12px_28px_rgba(8,39,25,0.08)]"
                >
                  <option value="">All Job Offers</option>
                  {vacancies.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <input
                  type="month"
                  value={billingMonth}
                  onChange={(event) => setBillingMonth(event.target.value)}
                  className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[12px] font-black text-[#071f14] outline-none transition focus:border-[#d7a84d] focus:bg-white focus:shadow-[0_12px_28px_rgba(8,39,25,0.08)]"
                />

                <button
                  type="button"
                  onClick={loadAllPayrollRows}
                  disabled={loadingBilling}
                  className="group inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#174a30] text-white shadow-[0_12px_26px_rgba(8,39,25,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#d7a84d] hover:text-[#071f14] disabled:cursor-not-allowed disabled:opacity-70"
                  title={loadingBilling ? "Loading billing records" : "Refresh billing records"}
                  aria-label={loadingBilling ? "Loading billing records" : "Refresh billing records"}
                >
                  <RefreshIcon className={`h-4 w-4 transition duration-300 ${loadingBilling ? "animate-spin" : "group-hover:rotate-180"}`} />
                </button>

                <button
                  type="button"
                  onClick={() => downloadAllBillings(billingGroups, billingMonth)}
                  disabled={!billingGroups.length}
                  className="group inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#082719] text-white shadow-[0_12px_26px_rgba(8,39,25,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#d7a84d] hover:text-[#071f14] disabled:cursor-not-allowed disabled:opacity-40"
                  title="Export all billing"
                  aria-label="Export all billing"
                >
                  <ExportIcon className="h-4 w-4 transition duration-300 group-hover:scale-110" />
                </button>
              </div>
            }
          >
            <div className="rounded-3xl border border-[#d7e2da] bg-[#f8fbf9] px-5 py-4 text-[13px] font-bold text-[#071f14]/60">
              Showing billing records for <span className="font-black text-[#071f14]">{formatMonthDisplay(billingMonth)}</span>
              {vacancyFilter ? (
                <span> • Vacancy: <span className="font-black text-[#071f14]">{vacancyFilter}</span></span>
              ) : (
                <span> • All job offers</span>
              )}
            </div>
          </SectionCard>

          <SectionCard eyebrow="Billing Records" title="Vacancy Billing List" className="mt-7">
            {loadingBilling ? (
              <div className="rounded-3xl border border-[#d7e2da] bg-[#f8fbf9] px-6 py-14 text-center text-[14px] font-semibold text-[#071f14]/60">
                Loading billing records...
              </div>
            ) : null}

            {!loadingBilling && !billingGroups.length ? (
              <div className="rounded-3xl border border-[#d7e2da] bg-[#f8fbf9] px-6 py-14 text-center text-[14px] font-semibold text-[#071f14]/60">
                No billing records found for {formatMonthDisplay(billingMonth)}.
              </div>
            ) : null}

            {!loadingBilling && billingGroups.length ? (
              <div className="overflow-hidden rounded-3xl border border-[#d7e2da] bg-[#f8fbf9]">
                <div className="hidden grid-cols-[1.4fr_.8fr_.8fr_1fr_1fr_56px] gap-4 border-b border-[#d7e2da] bg-[#eef4ef] px-5 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-[#071f14]/50 lg:grid">
                  <span>Vacancy</span>
                  <span>Employees</span>
                  <span>Payroll Rows</span>
                  <span>Total Services</span>
                  <span>Total Billing</span>
                  <span className="text-center">View</span>
                </div>

                <div className="divide-y divide-[#d7e2da]">
                  {billingGroups.map((group) => (
                    <article
                      key={`${group.vacancy}-${group.monthKey}`}
                      className="grid gap-4 bg-white/70 px-5 py-4 transition duration-300 hover:bg-white hover:shadow-[0_16px_40px_rgba(8,39,25,0.08)] lg:grid-cols-[1.4fr_.8fr_.8fr_1fr_1fr_56px] lg:items-center"
                    >
                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedBillingGroup(group)}
                          className="text-left text-[15px] font-black leading-5 text-[#071f14] transition hover:text-[#174a30]"
                        >
                          {group.vacancy}
                        </button>
                        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#071f14]/35">
                          {formatMonthDisplay(group.monthKey)}
                        </p>
                      </div>

                      <span className="inline-flex w-fit rounded-full bg-[#eef4ef] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#174a30]">
                        {group.employeeCount} employees
                      </span>

                      <span className="inline-flex w-fit rounded-full bg-[#eef4ef] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#174a30]">
                        {group.payrollEntryCount} entries
                      </span>

                      <p className="text-[14px] font-black text-[#071f14]">₱{formatPeso(group.totalServicesRendered)}</p>
                      <p className="text-[14px] font-black text-[#174a30]">₱{formatPeso(group.totalBilling)}</p>

                      <div className="flex justify-start lg:justify-center">
                        <button
                          type="button"
                          onClick={() => setSelectedBillingGroup(group)}
                          className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#082719] text-white shadow-[0_10px_24px_rgba(8,39,25,0.16)] ring-1 ring-[#082719]/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#d7a84d] hover:text-[#071f14] focus:outline-none focus:ring-4 focus:ring-[#d7a84d]/25"
                          title={`View billing for ${group.vacancy}`}
                          aria-label={`View billing for ${group.vacancy}`}
                        >
                          <ViewIcon className="h-4 w-4 transition duration-300 group-hover:scale-110" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </SectionCard>
        </main>
      </div>

      <VacancyBillingModal
        group={selectedBillingGroup}
        onClose={() => setSelectedBillingGroup(null)}
        onDownload={() => {
          if (!selectedBillingGroup) return;
          downloadBillingForVacancy(selectedBillingGroup);
        }}
      />
    </div>
  );
}
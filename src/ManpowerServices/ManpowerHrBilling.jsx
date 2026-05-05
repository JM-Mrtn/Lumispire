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

function BrandLogo() {
  return (
    <div className="flex items-center gap-5">
      <img
        src="/logo.png"
        alt="Manpower Logo"
        className="h-16 w-16 rounded-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      <h1 className="text-[28px] font-black uppercase tracking-wide text-[#315b42] sm:text-[34px]">
        MANPOWER SERVICES
      </h1>
    </div>
  );
}

function SidebarButton({ active = false, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-6 py-4 text-center text-[16px] font-black uppercase transition ${
        active
          ? "bg-[#d5ddd6] text-[#244b35]"
          : "text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function DashboardSummaryCard({ label, value }) {
  return (
    <div className="rounded-lg border-[3px] border-[#718575] bg-[#456650] px-4 py-4 text-white shadow-sm">
      <p className="text-[13px] font-black uppercase leading-tight">{label}</p>
      <p className="mt-3 text-center text-[22px] font-black leading-none">
        {value}
      </p>
    </div>
  );
}

function BillingAmountRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border-[3px] border-[#718575] bg-[#637a68] px-5 py-3 text-white">
      <p className="text-[15px] font-black uppercase">{label}</p>
      <p className="text-[17px] font-black">{formatPeso(value)}</p>
    </div>
  );
}

function VacancyBillingModal({ group, onClose, onDownload }) {
  if (!group) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto max-w-6xl rounded-[24px] bg-[#f6f8f3] p-5 text-[#24352c] shadow-2xl">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-white px-4 py-4">
          <div>
            <h2 className="text-2xl font-black text-[#24352c]">
              {group.vacancy} Billing Details
            </h2>

            <p className="mt-1 text-sm font-semibold text-[#5f6f61]">
              {formatMonthDisplay(group.monthKey)} • Employees:{" "}
              {group.employeeCount} • Payroll entries: {group.payrollEntryCount}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onDownload}
              className="rounded-xl bg-[#395345] px-4 py-3 text-sm font-black text-white"
            >
              Download Billing PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#eef3ea] px-4 py-3 text-sm font-black text-[#395345]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <DashboardSummaryCard
            label="Total Services"
            value={formatPeso(group.totalServicesRendered)}
          />

          <DashboardSummaryCard label="12% VAT" value={formatPeso(group.vatAmount)} />

          <DashboardSummaryCard
            label="Total Billing"
            value={formatPeso(group.totalBilling)}
          />
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#d7decf] bg-white shadow-sm">
          <div className="border-b border-[#eef2ea] bg-[#f7faf5] px-5 py-4">
            <h3 className="text-xl font-black text-[#24352c]">
              Included Payroll Entries
            </h3>
          </div>

          <div className="max-h-[65vh] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-[#f8faf6] text-[#395345]">
                <tr>
                  <th className="px-4 py-3 text-left font-black">Employee</th>
                  <th className="px-4 py-3 text-left font-black">
                    Company Email
                  </th>
                  <th className="px-4 py-3 text-left font-black">Cutoff</th>
                  <th className="px-4 py-3 text-right font-black">Gross Pay</th>
                  <th className="px-4 py-3 text-right font-black">Net Pay</th>
                  <th className="px-4 py-3 text-right font-black">
                    Services Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {group.rows.map((row, index) => (
                  <tr
                    key={`${row.employeeId}-${index}-${row.cutoffLabel}`}
                    className="border-t border-[#eef2ea]"
                  >
                    <td className="px-4 py-3">{row.employeeName}</td>
                    <td className="px-4 py-3">{row.companyEmail}</td>
                    <td className="px-4 py-3">{row.cutoffLabel}</td>
                    <td className="px-4 py-3 text-right">
                      {formatPeso(row.grossPay)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatPeso(row.netPay)}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-[#24352c]">
                      {formatPeso(row.servicesAmount)}
                    </td>
                  </tr>
                ))}

                {!group.rows.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-[#6b7a6d]"
                    >
                      No payroll entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#d9e3d5] bg-[#fbfdf9] p-5 text-sm text-[#5f6f61]">
          <p className="font-black text-[#24352c]">Billing Basis</p>

          <p className="mt-2 leading-7">
            This billing uses the saved payroll <strong>gross pay</strong>{" "}
            totals for the selected month and vacancy, then adds 12% VAT.
          </p>
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
    <div className="min-h-screen bg-[#0f3a1e] font-sans text-white">
      <header className="border-b border-[#d7decf] bg-[#f7f9f5]">
        <div className="flex h-[90px] items-center px-8">
          <BrandLogo />
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-90px)] lg:grid-cols-[265px_1fr]">
        <aside className="flex bg-[#294f35] lg:min-h-[calc(100vh-90px)]">
          <div className="flex w-full flex-col">
            <div className="border-b border-white/15 px-6 py-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#9ca59d] bg-white text-[28px] font-black text-[#315b42]">
                HR
              </div>

              <h2 className="mt-5 text-[17px] font-black uppercase leading-tight text-white">
                Human Resources
              </h2>

              <p className="mt-2 break-all text-[11px] font-bold text-white">
                {hrEmail}
              </p>
            </div>

            <nav className="border-t border-white/5">
              <SidebarButton onClick={() => navigate("/manpower-hr")}>
                Dashboard
              </SidebarButton>

              <SidebarButton
                onClick={() => navigate("/manpower-hr-applications")}
              >
                Manage Applicants
              </SidebarButton>

              <SidebarButton onClick={() => navigate("/manpower-hr-payroll")}>
                Manage Payroll
              </SidebarButton>

              <SidebarButton onClick={() => navigate("/manpower-hr-leaves")}>
                Manage File Leave
              </SidebarButton>

              <SidebarButton active onClick={() => navigate("/manpower-hr-billing")}>
                Manage Billing
              </SidebarButton>
            </nav>

            <div className="mt-auto px-6 py-8">
              <button
                type="button"
                onClick={logout}
                className="w-full rounded-full px-5 py-3 text-[16px] font-black uppercase text-white transition hover:bg-white/10"
              >
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        <main className="bg-[#0f3a1e] px-6 py-6 lg:px-8">
          <section>
            <h1 className="text-[32px] font-black uppercase leading-tight text-white md:text-[38px]">
              Manage Billing
            </h1>
            <div className="mt-2 h-[4px] w-[330px] max-w-full bg-white/65" />
          </section>

          <section className="mt-8 rounded-lg bg-[#294f35] px-6 py-6">
            <div className="grid gap-5 lg:grid-cols-[280px_280px_1fr_120px_170px] lg:items-end">
              <label className="block">
                <span className="mb-2 block text-[15px] font-black uppercase text-white">
                  All Job Offers
                </span>

                <select
                  value={vacancyFilter}
                  onChange={(event) => setVacancyFilter(event.target.value)}
                  className="h-[32px] w-full rounded-full border border-white bg-white px-4 text-[13px] font-black text-[#294f35] outline-none"
                >
                  <option value="">All Job Offers</option>

                  {vacancies.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[15px] font-black uppercase text-white">
                  Date
                </span>

                <input
                  type="month"
                  value={billingMonth}
                  onChange={(event) => setBillingMonth(event.target.value)}
                  className="h-[32px] w-full rounded-full border border-white bg-white px-4 text-[13px] font-black text-[#294f35] outline-none"
                />
              </label>

              <div />

              <button
                type="button"
                onClick={loadAllPayrollRows}
                disabled={loadingBilling}
                className="h-[36px] rounded-md bg-white px-5 text-[13px] font-black text-[#294f35] transition hover:bg-[#e7eee3] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingBilling ? "Loading..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={() => downloadAllBillings(billingGroups, billingMonth)}
                disabled={!billingGroups.length}
                className="h-[36px] rounded-md bg-white px-5 text-[13px] font-black text-[#294f35] transition hover:bg-[#e7eee3] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Export Billing
              </button>
            </div>
          </section>

          <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <DashboardSummaryCard
              label="Vacancies"
              value={formatCount(billingGroups.length)}
            />

            <DashboardSummaryCard
              label="Employees"
              value={formatCount(overallTotals.employeeCount)}
            />

            <DashboardSummaryCard
              label="Payroll Entries"
              value={formatCount(overallTotals.payrollEntryCount)}
            />

            <DashboardSummaryCard
              label="Total Services"
              value={formatPeso(overallTotals.totalServicesRendered)}
            />

            <DashboardSummaryCard
              label="Total Billing"
              value={formatPeso(overallTotals.totalBilling)}
            />
          </section>

          <section className="mt-10 space-y-6">
            {loadingBilling ? (
              <div className="rounded-lg bg-[#294f35] px-6 py-14 text-center text-[14px] font-semibold text-white/80">
                Loading billing records...
              </div>
            ) : null}

            {!loadingBilling && !billingGroups.length ? (
              <div className="rounded-lg bg-[#294f35] px-6 py-14 text-center text-[14px] font-semibold text-white/80">
                No billing records found for {formatMonthDisplay(billingMonth)}.
              </div>
            ) : null}

            {!loadingBilling &&
              billingGroups.map((group) => (
                <article
                  key={`${group.vacancy}-${group.monthKey}`}
                  className="overflow-hidden rounded-lg bg-[#294f35]"
                >
                  <div className="flex flex-col gap-4 rounded-t-lg bg-white px-4 py-4 text-[#294f35] lg:flex-row lg:items-center lg:justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedBillingGroup(group)}
                      className="text-left text-[21px] font-black transition hover:text-[#1d3f2a]"
                    >
                      {group.vacancy}
                    </button>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <span className="inline-flex h-[24px] min-w-[205px] items-center justify-center rounded-full border border-[#294f35] px-5 text-[14px] font-black text-[#294f35]">
                        {group.employeeCount} employees
                      </span>

                      <span className="inline-flex h-[24px] min-w-[205px] items-center justify-center rounded-full border border-[#294f35] px-5 text-[14px] font-black text-[#294f35]">
                        {group.payrollEntryCount} payroll entries
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedBillingGroup(group)}
                    className="block w-full px-5 py-6 text-left transition hover:bg-white/5"
                  >
                    <div className="space-y-8">
                      <BillingAmountRow
                        label="Total Services Rendered"
                        value={group.totalServicesRendered}
                      />

                      <BillingAmountRow label="12% VAT" value={group.vatAmount} />

                      <BillingAmountRow
                        label="Total Billing"
                        value={group.totalBilling}
                      />
                    </div>
                  </button>
                </article>
              ))}
          </section>
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
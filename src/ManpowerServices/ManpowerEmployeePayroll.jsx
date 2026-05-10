import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const LOGO_IMAGE = "/ManpowerLogo.png";

const EMPLOYEE_LOGIN_ROUTE = "/manpower-employee-login";
const EMPLOYEE_HOME_ROUTE = "/manpower-employee-home";
const EMPLOYEE_PAYROLL_ROUTE = "/manpower-employee-payroll";
const EMPLOYEE_LEAVE_ROUTE = "/manpower-employee-leave";
const EMPLOYEE_PROFILE_ROUTE = "/manpower-employee-profile";

const COMPANY_NAME = "LTC Manpower Services";
const COMPANY_ADDRESS = "2/F 544 Curie Street, Palanan, Makati City";

const ATTENDANCE_FIELDS = [
  { key: "regularDays", label: "Regular Days", unit: "day/s" },
  { key: "regularHours", label: "Regular Hours", unit: "hour/s" },
  { key: "overtimeHours", label: "Overtime Hours", unit: "hour/s" },
  { key: "restDayHours", label: "Rest Day Hours", unit: "hour/s" },
  { key: "restDayOtHours", label: "Rest Day OT Hours", unit: "hour/s" },
  { key: "specialHolidayHours", label: "Special Holiday Hours", unit: "hour/s" },
  {
    key: "specialHolidayOtHours",
    label: "Special Holiday OT Hours",
    unit: "hour/s",
  },
  {
    key: "specialHolidayRestDayHours",
    label: "Special Holiday Rest Day Hours",
    unit: "hour/s",
  },
  {
    key: "specialHolidayRestDayOtHours",
    label: "Special Holiday Rest Day OT Hours",
    unit: "hour/s",
  },
  {
    key: "regularHolidayHours",
    label: "Regular Holiday Hours",
    unit: "hour/s",
  },
  {
    key: "regularHolidayOtHours",
    label: "Regular Holiday OT Hours",
    unit: "hour/s",
  },
  {
    key: "regularHolidayRestDayHours",
    label: "Regular Holiday Rest Day Hours",
    unit: "hour/s",
  },
  {
    key: "regularHolidayRestDayOtHours",
    label: "Regular Holiday Rest Day OT Hours",
    unit: "hour/s",
  },
  { key: "nightDiffHours", label: "Night Differential Hours", unit: "hour/s" },
  { key: "sundayHours", label: "Sunday Hours", unit: "hour/s" },
  { key: "sundayOtHours", label: "Sunday OT Hours", unit: "hour/s" },
  { key: "lateHours", label: "Late Hours", unit: "hour/s" },
  { key: "undertimeHours", label: "Undertime Hours", unit: "hour/s" },
  { key: "absentDays", label: "Absent Days", unit: "day/s" },
];

function HeaderNavLink({ to, children, active = false }) {
  return (
    <Link
      to={to}
      className={`relative pb-1 transition hover:text-[#6f8a66] ${
        active
          ? "text-[#315b42] after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[#315b42]"
          : "text-[#405549]"
      }`}
    >
      {children}
    </Link>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div className="border-[#d8ded5] md:border-l md:pl-4">
      <h4 className="text-[12px] font-black text-[#315b42]">{title}</h4>

      <div className="mt-1 space-y-0.5 text-[10px] font-semibold leading-snug text-[#496252]">
        {children}
      </div>
    </div>
  );
}

function getEmployeeToken() {
  return localStorage.getItem("manpowerEmployeeToken") || "";
}

function getEmployeeUser() {
  try {
    return JSON.parse(localStorage.getItem("manpowerEmployeeUser") || "null");
  } catch {
    return null;
  }
}

function clearEmployeeSession() {
  localStorage.removeItem("manpowerEmployeeToken");
  localStorage.removeItem("manpowerEmployeeUser");
}

function toNumber(value = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function round2(value = 0) {
  return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

function formatMoney(value = 0) {
  return `₱${toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPlainMoney(value = 0) {
  return toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatAttendanceNumber(value = 0) {
  return toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateKey(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRowsFromResponse(data) {
  if (Array.isArray(data?.payrolls)) return data.payrolls;
  if (Array.isArray(data?.history)) return data.history;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.records)) return data.records;

  return [];
}

function getComputed(row) {
  return row?.computed || row?.summary || row?.payrollSummary || {};
}

function getDisplayDate(row) {
  return row?.cutoffEnd || row?.cutoffStart || row?.payDate || row?.createdAt || null;
}

function getPayrollDate(row) {
  return formatDate(
    row?.payDate || row?.cutoffEnd || row?.cutoffStart || row?.createdAt
  );
}

function getCutoffPeriod(row) {
  return `${formatDate(row?.cutoffStart)} - ${formatDate(row?.cutoffEnd)}`;
}

function getRowTimestamp(row) {
  const updatedAt = row?.updatedAt ? new Date(row.updatedAt).getTime() : 0;
  const createdAt = row?.createdAt ? new Date(row.createdAt).getTime() : 0;

  return Math.max(updatedAt, createdAt);
}

function getRowKey(row) {
  return `${formatDateKey(row?.cutoffStart)}__${formatDateKey(row?.cutoffEnd)}`;
}

function dedupePayrollRows(rows = []) {
  const map = new Map();

  for (const row of rows) {
    const key = getRowKey(row);
    if (!key) continue;

    const existing = map.get(key);

    if (!existing || getRowTimestamp(row) >= getRowTimestamp(existing)) {
      map.set(key, row);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const aDate = a?.cutoffStart ? new Date(a.cutoffStart).getTime() : 0;
    const bDate = b?.cutoffStart ? new Date(b.cutoffStart).getTime() : 0;

    if (bDate !== aDate) return bDate - aDate;

    return getRowTimestamp(b) - getRowTimestamp(a);
  });
}

function escapeHtml(value = "") {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return map[char] || char;
  });
}

function downloadHtmlFile(filename, html) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function numberToWordsBelowThousand(number) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const n = Math.floor(number);

  if (n < 20) return ones[n];

  if (n < 100) {
    const ten = Math.floor(n / 10);
    const one = n % 10;

    return `${tens[ten]}${one ? ` ${ones[one]}` : ""}`.trim();
  }

  const hundred = Math.floor(n / 100);
  const rest = n % 100;

  return `${ones[hundred]} Hundred${
    rest ? ` ${numberToWordsBelowThousand(rest)}` : ""
  }`.trim();
}

function numberToWords(number) {
  const n = Math.floor(Math.abs(toNumber(number)));

  if (n === 0) return "Zero";

  const parts = [];

  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const hundreds = n % 1_000;

  if (millions) {
    parts.push(`${numberToWordsBelowThousand(millions)} Million`);
  }

  if (thousands) {
    parts.push(`${numberToWordsBelowThousand(thousands)} Thousand`);
  }

  if (hundreds) {
    parts.push(numberToWordsBelowThousand(hundreds));
  }

  return parts.join(" ").trim();
}

function amountToWords(value = 0) {
  const amount = round2(value);
  const pesos = Math.floor(amount);
  const cents = Math.round((amount - pesos) * 100);

  const pesoWords = `${numberToWords(pesos)} Peso${pesos === 1 ? "" : "s"}`;

  if (cents > 0) {
    return `${pesoWords} and ${String(cents).padStart(2, "0")}/100 Only`;
  }

  return `${pesoWords} Only`;
}

function getEmployeePosition(employee, row) {
  return (
    employee?.position ||
    employee?.vacancy ||
    employee?.designation ||
    row?.position ||
    row?.vacancy ||
    row?.designation ||
    "-"
  );
}

function getDeploymentSite(employee, row) {
  return (
    employee?.deploymentSite ||
    employee?.site ||
    employee?.assignedSite ||
    employee?.workLocation ||
    employee?.location ||
    row?.deploymentSite ||
    row?.site ||
    row?.assignedSite ||
    row?.workLocation ||
    row?.location ||
    "-"
  );
}

function addAmount(rows, label, value) {
  const amount = round2(value);

  if (Math.abs(amount) > 0) {
    rows.push({ label, value: amount });
  }
}

function getAttendanceRows(row) {
  const attendance = row?.attendance || {};

  return ATTENDANCE_FIELDS.map((field) => ({
    label: field.label,
    value: `${formatAttendanceNumber(attendance?.[field.key] || 0)} ${field.unit}`,
  }));
}

function getSalarySlipData(row) {
  const computed = getComputed(row);
  const items = computed?.items || row?.items || {};
  const adjustments = row?.adjustments || {};

  const earnings = [];
  const deductions = [];

  addAmount(earnings, "Basic Pay", items.basePay);
  addAmount(earnings, "Overtime Pay", items.otPay);
  addAmount(earnings, "Rest Day Pay", items.restDayPay);
  addAmount(earnings, "Rest Day OT Pay", items.restDayOtPay);
  addAmount(earnings, "Special Holiday Pay", items.specialPay);
  addAmount(earnings, "Special Holiday OT Pay", items.specialOtPay);
  addAmount(earnings, "Special Holiday Rest Day Pay", items.specialRestDayPay);
  addAmount(
    earnings,
    "Special Holiday Rest Day OT Pay",
    items.specialRestDayOtPay ?? items.specialHolidayRestDayOtPay
  );
  addAmount(earnings, "Regular Holiday Pay", items.regularHolidayPay);
  addAmount(earnings, "Regular Holiday OT Pay", items.regularHolidayOtPay);
  addAmount(earnings, "Regular Holiday Rest Day Pay", items.regularHolidayRestDayPay);
  addAmount(
    earnings,
    "Regular Holiday Rest Day OT Pay",
    items.regularHolidayRestDayOtPay
  );
  addAmount(earnings, "Sunday Pay", items.sundayPay);
  addAmount(earnings, "Sunday OT Pay", items.sundayOtPay);
  addAmount(earnings, "Night Differential", items.nightDiffPay);
  addAmount(earnings, "Allowance", adjustments.manualAllowance);
  addAmount(earnings, "Bonus", adjustments.manualBonus);

  addAmount(deductions, "SSS", items.sssEmployee);
  addAmount(deductions, "PhilHealth", items.philhealthEmployee);
  addAmount(deductions, "Pag-IBIG", items.pagibigEmployee);
  addAmount(deductions, "Withholding Tax", items.withholdingTax);
  addAmount(deductions, "Cash Advance", adjustments.cashAdvance);
  addAmount(deductions, "Loan Deduction", adjustments.loanDeduction);
  addAmount(deductions, "Other Deduction", adjustments.otherDeduction);
  addAmount(deductions, "Late Deduction", items.lateDeduction);
  addAmount(deductions, "Undertime Deduction", items.undertimeDeduction);
  addAmount(deductions, "Absent Deduction", items.absentDeduction);

  const grossPay = round2(computed?.grossPay ?? row?.grossPay ?? 0);
  const totalDeductions = round2(
    computed?.totalDeductions ?? row?.totalDeductions ?? 0
  );
  const netPay = round2(
    computed?.netPay ?? row?.netPay ?? grossPay - totalDeductions
  );

  if (!earnings.length && grossPay > 0) {
    earnings.push({ label: "Gross Earnings", value: grossPay });
  }

  if (!deductions.length && totalDeductions > 0) {
    deductions.push({ label: "Total Deductions", value: totalDeductions });
  }

  return {
    earnings,
    deductions,
    grossPay,
    totalDeductions,
    netPay,
  };
}

function getPayslipTableRows(row) {
  const attendanceRows = getAttendanceRows(row);
  const salarySlip = getSalarySlipData(row);

  const leftRows = [
    ...attendanceRows.map((item) => ({
      label: item.label,
      value: item.value,
    })),
    ...salarySlip.earnings.map((item) => ({
      label: item.label,
      value: formatPlainMoney(item.value),
    })),
  ];

  const rightRows = salarySlip.deductions.map((item) => ({
    label: item.label,
    value: formatPlainMoney(item.value),
  }));

  if (!salarySlip.earnings.length && salarySlip.grossPay <= 0) {
    leftRows.push({
      label: "No earnings encoded",
      value: "0.00",
    });
  }

  if (!salarySlip.deductions.length && salarySlip.totalDeductions <= 0) {
    rightRows.push({
      label: "No deductions encoded",
      value: "0.00",
    });
  }

  const length = Math.max(leftRows.length, rightRows.length, 3);

  return Array.from({ length }, (_, index) => ({
    earning: leftRows[index] || null,
    deduction: rightRows[index] || null,
  }));
}

function PayslipDetailsTable({ row }) {
  const salarySlip = getSalarySlipData(row);
  const tableRows = getPayslipTableRows(row);

  return (
    <div className="mt-8 overflow-hidden border border-black">
      <table className="w-full border-collapse text-[12px] sm:text-[13px]">
        <thead>
          <tr className="bg-[#bfbfbf]">
            <th className="border border-black px-2 py-2 text-left font-black">
              Earnings
            </th>
            <th className="border border-black px-2 py-2 text-right font-black">
              Amount
            </th>
            <th className="border border-black px-2 py-2 text-left font-black">
              Deductions
            </th>
            <th className="border border-black px-2 py-2 text-right font-black">
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          {tableRows.map((item, index) => (
            <tr key={`payslip-row-${index}`}>
              <td className="h-7 border border-black px-2">
                {item.earning?.label || ""}
              </td>
              <td className="h-7 border border-black bg-[#eeeeee] px-2 text-right">
                {item.earning?.value || ""}
              </td>
              <td className="h-7 border border-black px-2">
                {item.deduction?.label || ""}
              </td>
              <td className="h-7 border border-black bg-[#eeeeee] px-2 text-right">
                {item.deduction?.value || ""}
              </td>
            </tr>
          ))}

          <tr>
            <td className="h-8 border border-black px-2 font-bold">
              Total Addition
            </td>
            <td className="h-8 border border-black bg-[#eeeeee] px-2 text-right font-bold">
              {formatPlainMoney(salarySlip.grossPay)}
            </td>
            <td className="h-8 border border-black px-2 font-bold">
              Total Deduction
            </td>
            <td className="h-8 border border-black bg-[#eeeeee] px-2 text-right font-bold">
              {formatPlainMoney(salarySlip.totalDeductions)}
            </td>
          </tr>

          <tr>
            <td className="h-8 border border-black px-2" />
            <td className="h-8 border border-black bg-[#eeeeee] px-2" />
            <td className="h-9 border border-black px-2 font-black">
              NET Salary
            </td>
            <td className="h-9 border border-black bg-[#d9d9d9] px-2 text-right font-black">
              {formatPlainMoney(salarySlip.netPay)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SalarySlipPaper({
  row,
  employee,
  employeeName,
  employeeEmail,
  compact = false,
}) {
  const computed = getComputed(row);
  const salarySlip = getSalarySlipData(row);

  const payrollDate = getPayrollDate(row);
  const cutoff = getCutoffPeriod(row);
  const position = getEmployeePosition(employee, row);
  const deploymentSite = getDeploymentSite(employee, row);

  return (
    <div
      className={`mx-auto bg-white text-black ${
        compact
          ? "w-full max-w-[860px] p-5 sm:p-8"
          : "w-[860px] min-h-[1080px] p-10"
      }`}
    >
      <div className="text-center">
        <h1 className="font-serif text-[34px] font-black leading-none sm:text-[44px]">
          {COMPANY_NAME}
        </h1>
        <p className="mt-2 text-[13px] font-medium">[{COMPANY_ADDRESS}]</p>
        <h2 className="mt-8 text-[26px] font-black">Salary Slip</h2>
      </div>

      <div className="mx-auto mt-10 max-w-[620px] text-[14px] font-bold leading-7">
        <div className="grid grid-cols-[150px_1fr] items-end">
          <span>Employee Name:</span>
          <span className="border-b border-dashed border-black px-2 font-semibold">
            {employeeName}
          </span>
        </div>

        <div className="grid grid-cols-[150px_1fr] items-end">
          <span>Position:</span>
          <span className="border-b border-dashed border-black px-2 font-semibold">
            {position}
          </span>
        </div>

        <div className="grid grid-cols-[150px_1fr] items-end">
          <span>Deployment Site:</span>
          <span className="border-b border-dashed border-black px-2 font-semibold">
            {deploymentSite}
          </span>
        </div>

        <div className="grid grid-cols-[150px_1fr] items-end">
          <span>Payroll Date:</span>
          <span className="border-b border-dashed border-black px-2 font-semibold">
            {payrollDate}
          </span>
        </div>

        <div className="grid grid-cols-[150px_1fr] items-end">
          <span>Cutoff Period:</span>
          <span className="border-b border-dashed border-black px-2 font-semibold">
            {cutoff}
          </span>
        </div>
      </div>

      <PayslipDetailsTable row={row} />

      <p className="mt-8 text-[13px] font-bold">
        {amountToWords(salarySlip.netPay)}
      </p>

      <div className="mt-24 grid gap-12 text-center text-[13px] font-bold sm:grid-cols-2">
        <div>
          <div className="mx-auto w-[260px] border-b border-dashed border-black" />
          <p className="mt-1 italic">Employee Signature</p>
        </div>

        <div>
          <div className="mx-auto w-[260px] border-b border-dashed border-black" />
          <p className="mt-1 italic">Director</p>
        </div>
      </div>

      <div className="mt-10 border-t border-dashed border-gray-400 pt-3 text-[11px] text-gray-600">
        <p>Email: {employeeEmail || "-"}</p>
        <p>
          Payroll Cycle:{" "}
          {computed?.payrollCycleLabel || computed?.payrollCycle || "-"} • Rate
          Per Day: {formatMoney(computed?.ratePerDay || row?.ratePerDay)}
        </p>
      </div>
    </div>
  );
}

function buildSalarySlipHtml({ row, employee, employeeName, employeeEmail }) {
  const computed = getComputed(row);
  const salarySlip = getSalarySlipData(row);
  const tableRows = getPayslipTableRows(row);

  const payrollDate = getPayrollDate(row);
  const cutoff = getCutoffPeriod(row);
  const position = getEmployeePosition(employee, row);
  const deploymentSite = getDeploymentSite(employee, row);

  const rowsHtml = tableRows
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.earning?.label || "")}</td>
          <td class="amount">${escapeHtml(item.earning?.value || "")}</td>
          <td>${escapeHtml(item.deduction?.label || "")}</td>
          <td class="amount">${escapeHtml(item.deduction?.value || "")}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Salary Slip - ${escapeHtml(employeeName)}</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #f3f3f3;
            color: #000;
            font-family: Arial, sans-serif;
          }

          .page {
            width: 850px;
            min-height: 1100px;
            margin: 24px auto;
            background: #fff;
            padding: 54px 42px;
            border: 1px solid #cfcfcf;
          }

          .company {
            text-align: center;
          }

          .company h1 {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 46px;
            line-height: 1;
            font-weight: 900;
          }

          .company p {
            margin: 8px 0 0;
            font-size: 13px;
          }

          .company h2 {
            margin: 32px 0 0;
            font-size: 28px;
            font-weight: 900;
          }

          .details {
            width: 620px;
            margin: 38px auto 24px;
            font-size: 14px;
            font-weight: 700;
            line-height: 1.9;
          }

          .line {
            display: grid;
            grid-template-columns: 150px 1fr;
            align-items: end;
          }

          .blank {
            display: inline-block;
            min-height: 20px;
            border-bottom: 1px dashed #000;
            padding: 0 8px;
            font-weight: 600;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 28px;
            border: 1px solid #000;
            font-size: 13px;
          }

          th {
            border: 1px solid #000;
            background: #bfbfbf;
            padding: 7px 8px;
            text-align: left;
            font-weight: 900;
          }

          td {
            height: 29px;
            border: 1px solid #000;
            padding: 6px 8px;
          }

          .amount {
            background: #eeeeee;
            text-align: right;
          }

          .total {
            font-weight: 800;
          }

          .net {
            background: #d9d9d9;
            font-weight: 900;
          }

          .words {
            margin-top: 28px;
            font-size: 13px;
            font-weight: 800;
          }

          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            margin-top: 110px;
            text-align: center;
            font-size: 13px;
            font-weight: 800;
          }

          .signature-line {
            width: 270px;
            margin: 0 auto 5px;
            border-bottom: 1px dashed #000;
          }

          .signature-label {
            font-style: italic;
          }

          .footer-note {
            margin-top: 46px;
            padding-top: 10px;
            border-top: 1px dashed #999;
            color: #555;
            font-size: 11px;
            line-height: 1.5;
          }

          @media print {
            body {
              background: #fff;
            }

            .page {
              width: 100%;
              min-height: auto;
              margin: 0;
              border: 0;
              padding: 36px;
            }
          }
        </style>
      </head>

      <body>
        <div class="page">
          <div class="company">
            <h1>${escapeHtml(COMPANY_NAME)}</h1>
            <p>[${escapeHtml(COMPANY_ADDRESS)}]</p>
            <h2>Salary Slip</h2>
          </div>

          <div class="details">
            <div class="line">
              <span>Employee Name:</span>
              <span class="blank">${escapeHtml(employeeName)}</span>
            </div>

            <div class="line">
              <span>Position:</span>
              <span class="blank">${escapeHtml(position)}</span>
            </div>

            <div class="line">
              <span>Deployment Site:</span>
              <span class="blank">${escapeHtml(deploymentSite)}</span>
            </div>

            <div class="line">
              <span>Payroll Date:</span>
              <span class="blank">${escapeHtml(payrollDate)}</span>
            </div>

            <div class="line">
              <span>Cutoff Period:</span>
              <span class="blank">${escapeHtml(cutoff)}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Earnings</th>
                <th style="text-align:right;">Amount</th>
                <th>Deductions</th>
                <th style="text-align:right;">Amount</th>
              </tr>
            </thead>

            <tbody>
              ${rowsHtml}

              <tr>
                <td class="total">Total Addition</td>
                <td class="amount total">${escapeHtml(formatPlainMoney(salarySlip.grossPay))}</td>
                <td class="total">Total Deduction</td>
                <td class="amount total">${escapeHtml(formatPlainMoney(salarySlip.totalDeductions))}</td>
              </tr>

              <tr>
                <td></td>
                <td class="amount"></td>
                <td class="total">NET Salary</td>
                <td class="amount net">${escapeHtml(formatPlainMoney(salarySlip.netPay))}</td>
              </tr>
            </tbody>
          </table>

          <p class="words">${escapeHtml(amountToWords(salarySlip.netPay))}</p>

          <div class="signatures">
            <div>
              <div class="signature-line"></div>
              <div class="signature-label">Employee Signature</div>
            </div>

            <div>
              <div class="signature-line"></div>
              <div class="signature-label">Director</div>
            </div>
          </div>

          <div class="footer-note">
            <div>Email: ${escapeHtml(employeeEmail || "-")}</div>
            <div>
              Payroll Cycle:
              ${escapeHtml(computed?.payrollCycleLabel || computed?.payrollCycle || "-")}
              • Rate Per Day:
              ${escapeHtml(formatMoney(computed?.ratePerDay || row?.ratePerDay))}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function PayrollModal({
  row,
  employee,
  employeeName,
  employeeEmail,
  onClose,
  onDownload,
}) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/60 px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#24372d]">
              Salary Slip Preview
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#52695a]">
              {getPayrollDate(row)}
            </p>
            <p className="text-xs font-semibold text-[#52695a]">
              Cutoff: {getCutoffPeriod(row)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onDownload(row)}
              className="rounded-xl bg-[#315b42] px-5 py-2 text-sm font-black text-white transition hover:bg-[#254934]"
            >
              Download Payslip
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border-2 border-[#315b42] px-5 py-2 text-sm font-black text-[#315b42] transition hover:bg-[#315b42] hover:text-white"
              aria-label="Close payroll details"
            >
              Close
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-[#e8e8e8] p-3 shadow-2xl">
          <SalarySlipPaper
            row={row}
            employee={employee}
            employeeName={employeeName}
            employeeEmail={employeeEmail}
            compact
          />
        </div>
      </div>
    </div>
  );
}

export default function ManpowerEmployeePayroll() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(() => getEmployeeUser());
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const employeeName = useMemo(() => {
    const fullName = [
      employee?.firstName || "",
      employee?.middleName || "",
      employee?.lastName || "",
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return fullName || "Employee";
  }, [employee]);

  const employeeEmail =
    employee?.companyEmail || employee?.personalEmail || employee?.email || "";

  async function loadPayroll(showRefresh = false) {
    const token = getEmployeeToken();

    if (!token) {
      navigate(EMPLOYEE_LOGIN_ROUTE, { replace: true });
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/payroll`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        clearEmployeeSession();
        navigate(EMPLOYEE_LOGIN_ROUTE, { replace: true });
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load payroll history.");
      }

      if (data?.employee) {
        localStorage.setItem("manpowerEmployeeUser", JSON.stringify(data.employee));
        setEmployee(data.employee);
      }

      setRows(dedupePayrollRows(getRowsFromResponse(data)));
    } catch (err) {
      setError(err?.message || "Failed to load payroll history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadPayroll(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter((row) => {
      const computed = getComputed(row);

      const haystack = [
        formatDate(row?.cutoffStart),
        formatDate(row?.cutoffEnd),
        formatDate(getDisplayDate(row)),
        getPayrollDate(row),
        getCutoffPeriod(row),
        computed?.payrollCycle,
        computed?.payrollCycleLabel,
        employeeName,
        employeeEmail,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [rows, searchValue, employeeName, employeeEmail]);

  function handleDownload(row) {
    const fileDate = formatDateKey(getDisplayDate(row)) || "payroll";

    const html = buildSalarySlipHtml({
      row,
      employee,
      employeeName,
      employeeEmail,
    });

    downloadHtmlFile(`manpower-salary-slip-${fileDate}.html`, html);
  }

  return (
    <div className="min-h-screen bg-[#eef2ea] font-sans text-[#24372d]">
      <header className="sticky top-0 z-50 border-b border-[#d5ddd2] bg-[#f7f9f5]/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={EMPLOYEE_HOME_ROUTE} className="flex items-center gap-3">
            <img
              src={LOGO_IMAGE}
              alt="Manpower Logo"
              className="h-12 w-12 shrink-0 rounded-full object-contain"
            />

            <span className="text-[24px] font-black tracking-wide text-[#315b42] sm:text-[28px]">
              MANPOWER
            </span>
          </Link>

          <nav className="hidden items-center gap-9 text-[12px] font-black uppercase tracking-wide lg:flex">
            <HeaderNavLink to={EMPLOYEE_HOME_ROUTE}>Home</HeaderNavLink>

            <HeaderNavLink to={EMPLOYEE_PAYROLL_ROUTE} active>
              Payroll
            </HeaderNavLink>

            <HeaderNavLink to={EMPLOYEE_LEAVE_ROUTE}>Leave</HeaderNavLink>
          </nav>

          <Link
            to={EMPLOYEE_PROFILE_ROUTE}
            className="text-[12px] font-black uppercase tracking-wide text-[#405549] transition hover:text-[#6f8a66]"
          >
            Profile
          </Link>
        </div>

        <div className="border-t border-[#e1e7de] bg-[#f7f9f5] px-4 py-3 lg:hidden">
          <nav className="mx-auto flex max-w-7xl items-center justify-center gap-7 text-[11px] font-black uppercase tracking-wide">
            <HeaderNavLink to={EMPLOYEE_HOME_ROUTE}>Home</HeaderNavLink>

            <HeaderNavLink to={EMPLOYEE_PAYROLL_ROUTE} active>
              Payroll
            </HeaderNavLink>

            <HeaderNavLink to={EMPLOYEE_LEAVE_ROUTE}>Leave</HeaderNavLink>
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-[#0f3a1e] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/60">
                  Payroll
                </p>

                <h1 className="mt-3 text-3xl font-black uppercase leading-tight text-white sm:text-4xl">
                  {employeeName}
                </h1>

                {employeeEmail ? (
                  <p className="mt-1 text-sm font-bold text-white/80">
                    {employeeEmail}
                  </p>
                ) : null}

                <div className="mt-3 h-[2px] w-[420px] max-w-full bg-white/45" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search payroll date"
                  className="h-10 w-full rounded-full border border-white bg-white px-4 text-sm font-semibold text-[#315b42] outline-none placeholder:text-[#52695a] sm:w-[280px]"
                />

                <button
                  type="button"
                  onClick={() => loadPayroll(true)}
                  disabled={refreshing}
                  className="h-10 rounded-full border-2 border-white bg-white px-6 text-xs font-black uppercase tracking-wide text-[#315b42] transition hover:bg-[#e7eee3] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            <section className="mt-8 min-h-[520px] rounded-3xl bg-[#294f35] p-5 shadow-xl sm:p-7">
              {loading ? (
                <div className="rounded-2xl bg-white px-5 py-10 text-center text-sm font-semibold text-[#52695a]">
                  Loading payroll history...
                </div>
              ) : null}

              {!loading && error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-sm font-bold text-red-700">
                  {error}
                </div>
              ) : null}

              {!loading && !error && filteredRows.length === 0 ? (
                <div className="rounded-2xl bg-white px-5 py-10 text-center text-sm font-semibold text-[#52695a]">
                  No payroll history found.
                </div>
              ) : null}

              {!loading && !error && filteredRows.length > 0 ? (
                <div className="space-y-4">
                  {filteredRows.map((row, index) => (
                    <div
                      key={row?._id || `${getRowKey(row)}-${index}`}
                      className="flex flex-col gap-4 rounded-2xl bg-[#f3f6f1] p-5 shadow-md sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h2 className="text-xl font-black text-[#315b42]">
                          Salary Slip - {getPayrollDate(row)}
                        </h2>

                        <p className="mt-1 text-sm font-semibold text-[#52695a]">
                          Cutoff: {getCutoffPeriod(row)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedRow(row)}
                          className="rounded-xl bg-[#315b42] px-6 py-2 text-sm font-black text-white transition hover:bg-[#254934]"
                        >
                          View Salary Slip
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(row)}
                          className="rounded-xl border-2 border-[#315b42] px-6 py-2 text-sm font-black text-[#315b42] transition hover:bg-[#315b42] hover:text-white"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d8ded5] bg-[#f7f9f5]">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="grid gap-2 md:grid-cols-[1fr_0.7fr_1.2fr_0.9fr_0.75fr] md:items-start">
            <div>
              <Link
                to={EMPLOYEE_HOME_ROUTE}
                className="flex items-center gap-2"
              >
                <img
                  src={LOGO_IMAGE}
                  alt="Manpower Logo"
                  className="h-9 w-9 shrink-0 rounded-full object-contain"
                />

                <h3 className="text-[18px] font-black tracking-wide text-[#315b42]">
                  MANPOWER
                </h3>
              </Link>
            </div>

            <FooterColumn title="Menu">
              <Link
                className="block hover:text-[#315b42]"
                to={EMPLOYEE_HOME_ROUTE}
              >
                Home
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to={EMPLOYEE_PAYROLL_ROUTE}
              >
                Payroll
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to={EMPLOYEE_LEAVE_ROUTE}
              >
                Leave
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to={EMPLOYEE_PROFILE_ROUTE}
              >
                Profile
              </Link>
            </FooterColumn>

            <FooterColumn title="Contact Information">
              <p>ltc.tamis@gmail.com</p>
              <p>lorengladisu@ltcmultiservices.com</p>
              <p>09959808051 / 09516281271</p>
            </FooterColumn>

            <FooterColumn title="Address">
              <p>2/F 544 Curie Street,</p>
              <p>Palanan, Makati City</p>
            </FooterColumn>

            <FooterColumn title="Follow Us">
              <p>Facebook</p>
              <p>Email</p>
              <p>LinkedIn</p>
            </FooterColumn>
          </div>

          <div className="mt-1 flex flex-col gap-0.5 border-t border-[#d8ded5] pt-1 text-[9px] font-semibold text-[#4c6556] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>

      {selectedRow ? (
        <PayrollModal
          row={selectedRow}
          employee={employee}
          employeeName={employeeName}
          employeeEmail={employeeEmail}
          onClose={() => setSelectedRow(null)}
          onDownload={handleDownload}
        />
      ) : null}
    </div>
  );
}
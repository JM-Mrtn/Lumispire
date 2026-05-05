import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManpowerEmployeeShell from "./ManpowerEmployeeShell";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);
const EMPLOYEE_LOGIN_ROUTE = "/manpower-employee-login";

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

function formatMoney(value = 0) {
  return `₱${toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

function prettifyKey(key = "") {
  return String(key || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
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

function getComputationRows(row) {
  const computed = getComputed(row);
  const items = computed?.items || row?.items || {};

  return Object.entries(items)
    .filter(([, value]) => Math.abs(toNumber(value)) > 0)
    .map(([key, value]) => ({
      label: prettifyKey(key),
      value: toNumber(value),
    }));
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

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f5f7f3] p-4">
      <p className="text-xs font-black uppercase tracking-wide text-[#6b7c6f]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#315b42]">{value}</p>
    </div>
  );
}

function PayrollModal({ row, employeeName, employeeEmail, onClose, onDownload }) {
  const computed = getComputed(row);
  const rows = getComputationRows(row);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-[#315b42] px-6 py-5 text-white">
          <div>
            <h2 className="text-2xl font-black">Payroll Details</h2>
            <p className="mt-1 text-sm font-semibold text-white/80">
              {formatDate(row?.cutoffStart)} - {formatDate(row?.cutoffEnd)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-white/10"
            aria-label="Close payroll details"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Gross Pay"
              value={formatMoney(computed?.grossPay || row?.grossPay)}
            />
            <SummaryCard
              label="Total Deductions"
              value={formatMoney(computed?.totalDeductions || row?.totalDeductions)}
            />
            <SummaryCard
              label="Net Pay"
              value={formatMoney(computed?.netPay || row?.netPay)}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-2xl border border-[#dde5d9] p-5">
              <h3 className="text-lg font-black text-[#315b42]">Employee</h3>

              <div className="mt-4 space-y-2 text-sm font-semibold text-[#52695a]">
                <p><span className="text-[#24372d]">Name:</span> {employeeName}</p>
                <p><span className="text-[#24372d]">Email:</span> {employeeEmail}</p>
                <p>
                  <span className="text-[#24372d]">Payroll Cycle:</span>{" "}
                  {computed?.payrollCycleLabel || computed?.payrollCycle || "-"}
                </p>
                <p>
                  <span className="text-[#24372d]">Rate Per Day:</span>{" "}
                  {formatMoney(computed?.ratePerDay || row?.ratePerDay)}
                </p>
                <p>
                  <span className="text-[#24372d]">Hourly Rate:</span>{" "}
                  {formatMoney(computed?.hourlyRate || row?.hourlyRate)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onDownload(row)}
                className="mt-6 w-full rounded-full bg-[#315b42] px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#254934]"
              >
                Download Payslip
              </button>
            </section>

            <section className="rounded-2xl border border-[#dde5d9] p-5">
              <h3 className="text-lg font-black text-[#315b42]">Computation Breakdown</h3>

              <div className="mt-4 overflow-hidden rounded-xl border border-[#dce5d8]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#eef4ea] text-xs uppercase tracking-wide text-[#315b42]">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e1e8de]">
                    {rows.length ? (
                      rows.map((item) => (
                        <tr key={item.label}>
                          <td className="px-4 py-3 font-semibold text-[#52695a]">{item.label}</td>
                          <td className="px-4 py-3 text-right font-black text-[#315b42]">
                            {formatMoney(item.value)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="px-4 py-6 text-center font-semibold text-[#6b7c6f]">
                          No computation breakdown available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
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
    const computed = getComputed(row);
    const computationRows = getComputationRows(row);

    const cutoff = `${formatDate(row?.cutoffStart)} - ${formatDate(row?.cutoffEnd)}`;
    const fileDate = formatDateKey(getDisplayDate(row)) || "payroll";

    const computationHtml = computationRows.length
      ? computationRows
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(item.label)}</td>
                <td style="text-align:right">${escapeHtml(formatMoney(item.value))}</td>
              </tr>
            `
          )
          .join("")
      : `<tr><td colspan="2">No computation details available.</td></tr>`;

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Payroll Payslip</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #24372d;
              padding: 32px;
              line-height: 1.5;
            }
            .header {
              background: #315b42;
              color: white;
              padding: 24px;
              border-radius: 16px;
              margin-bottom: 24px;
            }
            h1, h2, p {
              margin: 0;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin: 20px 0;
            }
            .card {
              border: 1px solid #dce5d8;
              border-radius: 14px;
              padding: 16px;
              background: #f5f7f3;
            }
            .label {
              font-size: 12px;
              text-transform: uppercase;
              color: #6b7c6f;
              font-weight: 700;
            }
            .value {
              font-size: 24px;
              font-weight: 900;
              color: #315b42;
              margin-top: 6px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }
            th, td {
              border: 1px solid #dce5d8;
              padding: 10px;
              font-size: 14px;
            }
            th {
              background: #eef4ea;
              text-align: left;
              color: #315b42;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LTC Manpower Services</h1>
            <p>Employee Payroll Payslip</p>
          </div>

          <h2>${escapeHtml(employeeName)}</h2>
          <p>${escapeHtml(employeeEmail)}</p>
          <p><strong>Cutoff:</strong> ${escapeHtml(cutoff)}</p>
          <p><strong>Payroll Cycle:</strong> ${escapeHtml(
            computed?.payrollCycleLabel || computed?.payrollCycle || "-"
          )}</p>

          <div class="grid">
            <div class="card">
              <div class="label">Gross Pay</div>
              <div class="value">${escapeHtml(formatMoney(computed?.grossPay || row?.grossPay))}</div>
            </div>
            <div class="card">
              <div class="label">Total Deductions</div>
              <div class="value">${escapeHtml(formatMoney(computed?.totalDeductions || row?.totalDeductions))}</div>
            </div>
            <div class="card">
              <div class="label">Net Pay</div>
              <div class="value">${escapeHtml(formatMoney(computed?.netPay || row?.netPay))}</div>
            </div>
          </div>

          <h2>Computation Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${computationHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    downloadHtmlFile(`manpower-payslip-${fileDate}.html`, html);
  }

  return (
    <ManpowerEmployeeShell active="payroll">
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
              {employeeEmail && (
                <p className="mt-1 text-sm font-bold text-white/80">{employeeEmail}</p>
              )}
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
            {loading && (
              <div className="rounded-2xl bg-white px-5 py-10 text-center text-sm font-semibold text-[#52695a]">
                Loading payroll history...
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && filteredRows.length === 0 && (
              <div className="rounded-2xl bg-white px-5 py-10 text-center text-sm font-semibold text-[#52695a]">
                No payroll history found.
              </div>
            )}

            {!loading && !error && filteredRows.length > 0 && (
              <div className="space-y-4">
                {filteredRows.map((row, index) => {
                  const computed = getComputed(row);

                  return (
                    <div
                      key={row?._id || `${getRowKey(row)}-${index}`}
                      className="flex flex-col gap-4 rounded-2xl bg-[#f3f6f1] p-5 shadow-md sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h2 className="text-xl font-black text-[#315b42]">
                          {formatDate(getDisplayDate(row))}
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-[#52695a]">
                          {formatDate(row?.cutoffStart)} - {formatDate(row?.cutoffEnd)}
                        </p>
                        <p className="mt-2 text-sm font-black text-[#315b42]">
                          Net Pay: {formatMoney(computed?.netPay || row?.netPay)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedRow(row)}
                          className="rounded-xl bg-[#315b42] px-6 py-2 text-sm font-black text-white transition hover:bg-[#254934]"
                        >
                          View
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
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>

      {selectedRow && (
        <PayrollModal
          row={selectedRow}
          employeeName={employeeName}
          employeeEmail={employeeEmail}
          onClose={() => setSelectedRow(null)}
          onDownload={handleDownload}
        />
      )}
    </ManpowerEmployeeShell>
  );
}

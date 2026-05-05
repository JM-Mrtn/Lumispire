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

              <SidebarButton active onClick={() => navigate("/manpower-hr-payroll")}>
                Manage Payroll
              </SidebarButton>

              <SidebarButton onClick={() => navigate("/manpower-hr-leaves")}>
                Manage File Leave
              </SidebarButton>

              <SidebarButton onClick={() => navigate("/manpower-hr-billing")}>
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
              Manage Payroll
            </h1>
            <div className="mt-2 h-[4px] w-[310px] max-w-full bg-white/65" />
          </section>

          <section className="mt-8 rounded-lg bg-[#294f35] px-6 py-7">
            <div className="grid gap-4 lg:grid-cols-[280px_280px_1fr_auto] lg:items-center">
              <select
                value={employeeFilter}
                onChange={(event) => {
                  setEmployeeFilter(event.target.value);
                  setPage(1);
                }}
                className="h-[32px] rounded-full border border-white bg-white px-4 text-[13px] font-black text-[#294f35] outline-none"
              >
                <option value="">Type of Job</option>
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
                placeholder="Search Employee"
                className="h-[32px] rounded-full border border-white bg-white px-4 text-[13px] font-black text-[#294f35] outline-none placeholder:text-[#294f35]"
              />

              <div />

              <button
                type="button"
                onClick={loadEmployees}
                disabled={loadingEmployees}
                className="h-[38px] min-w-[112px] rounded-md bg-white px-6 text-[13px] font-black text-[#294f35] transition hover:bg-[#e7eee3] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingEmployees ? "Loading..." : "Refresh"}
              </button>
            </div>
          </section>

          <section className="mt-7 overflow-hidden rounded-lg bg-[#294f35]">
            <div className="rounded-t-lg bg-white px-4 py-4 text-[#294f35]">
              <h2 className="text-[18px] font-black">List of Employee</h2>
            </div>

            <div className="min-h-[380px]">
              {pagedEmployees.length ? (
                pagedEmployees.map((employee) => {
                  const employeeId = employee._id || employee.id;
                  const active = employee.active !== false;

                  return (
                    <div
                      key={employeeId || employee.companyEmail}
                      className="grid gap-4 border-b border-white/25 px-4 py-5 text-white md:grid-cols-[64px_1.35fr_1.45fr_0.8fr_0.75fr_1fr] md:items-center"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[15px] font-black text-[#315b42]">
                        {getEmployeeName(employee).charAt(0).toUpperCase()}
                      </div>

                      <p className="text-[16px] font-black">
                        {getEmployeeName(employee)}
                      </p>

                      <p className="break-all text-[15px] font-black">
                        {employee.companyEmail ||
                          employee.email ||
                          employee.personalEmail ||
                          "traineeemail@tamsi.com"}
                      </p>

                      <p className="text-[16px] font-black">
                        ₱{formatMoney(employee.dailyRate)}
                      </p>

                      <p className="text-[16px] font-black">
                        {active ? "Active" : "Inactive"}
                      </p>

                      <div className="flex justify-start md:justify-end">
                        <button
                          type="button"
                          onClick={() => openPayrollModal(employee)}
                          className="min-w-[96px] rounded-full bg-white px-4 py-1 text-[11px] font-black text-[#294f35] transition hover:bg-[#e7eee3]"
                        >
                          Open Payroll
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-14 text-center text-[14px] font-semibold text-white/80">
                  {loadingEmployees ? "Loading employees..." : "No employees found."}
                </div>
              )}
            </div>
          </section>

          <div className="mt-4 flex items-center justify-between text-white">
            <p className="text-[16px] font-black">
              Page {page} / {totalPages}
            </p>

            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="text-[28px] leading-none text-white transition hover:text-white/70 disabled:opacity-30"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className="text-[16px] font-black text-white transition hover:text-white/70 disabled:opacity-30"
              >
                Next Page
              </button>

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className="text-[28px] leading-none text-white transition hover:text-white/70 disabled:opacity-30"
              >
                ›
              </button>
            </div>
          </div>
        </main>
      </div>

      {selectedEmployee ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/50 p-3">
          <div className="mx-auto max-w-[1500px] rounded-[24px] bg-[#f6f8f3] p-4 text-[#24352c] shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-3">
              <div>
                <h2 className="text-xl font-black text-[#24352c]">
                  Payroll - {selectedEmployee.lastName},{" "}
                  {selectedEmployee.firstName}
                </h2>

                <p className="mt-1 text-xs text-[#5f6f61]">
                  {selectedEmployee.vacancy} • {selectedEmployee.companyEmail}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="rounded-full bg-[#eef3ea] px-3 py-2 text-xs font-black text-[#395345]"
              >
                Close
              </button>
            </div>

            {employeePayrollRows.length ? (
              <div className="mb-4 rounded-2xl border border-[#d7decf] bg-white px-4 py-3 text-xs text-[#5f6f61]">
                Saved payroll records found: {employeePayrollRows.length}
              </div>
            ) : null}

            <div className="grid gap-4 2xl:grid-cols-2">
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
      ) : null}
    </div>
  );
}
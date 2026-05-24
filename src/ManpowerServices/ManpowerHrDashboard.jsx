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

const VACANCIES = [
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

function formatMoney(value = 0) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
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

function BrandLogo() {
  return (
    <div className="flex items-center gap-4">
      <img
        src="/logo.png"
        alt="Manpower Logo"
        className="h-14 w-14 rounded-full bg-white object-cover ring-4 ring-white/15"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      <div>
        <h1 className="text-[20px] font-black uppercase tracking-tight text-white">
          LTC Manpower
        </h1>
        <p className="text-[11px] font-bold text-white/65">
          Human resource management
        </p>
      </div>
    </div>
  );
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

function SidebarButton({ active = false, children, onClick, icon = "dashboard" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[52px] w-full items-center gap-4 rounded-[26px] px-6 text-left text-[13px] font-black tracking-tight transition duration-300 ${
        active
          ? "bg-white text-[#071f14] shadow-[0_18px_38px_rgba(0,0,0,0.20)]"
          : "text-white hover:translate-x-1 hover:bg-white/10"
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center transition duration-300 ${
          active
            ? "text-[#071f14]"
            : "text-white/85 group-hover:text-[#f4d484]"
        }`}
      >
        <SidebarIcon type={icon} />
      </span>
      <span className="min-w-0 flex-1 leading-tight">{children}</span>
    </button>
  );
}

function NotificationBar({ label, value }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#d9e5dc] bg-[#f8fbf9] px-5 py-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(8,39,25,0.10)]">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#235f3e] to-[#d7a84d]" />
      <div className="flex items-center justify-between gap-4 pl-2">
        <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#071f14]/55">
          {label}
        </p>
        <p className="text-[28px] font-black leading-none text-[#071f14]">
          {value}
        </p>
      </div>
    </div>
  );
}

function CalendarPanel() {
  const today = new Date();

  return (
    <div className="relative h-full min-h-[285px] overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-[#071f14] via-[#174a30] to-[#315b42] p-6 text-white shadow-[0_18px_45px_rgba(8,39,25,0.14)]">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#f4d484]/20 blur-2xl" />
      <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex h-full min-h-[237px] flex-col items-center justify-center text-center">
        <p className="text-[12px] font-black uppercase tracking-[0.24em] text-[#f4d484]">
          Calendar
        </p>

        <div className="mt-5 rounded-3xl border border-white/15 bg-white/10 px-8 py-6 backdrop-blur">
          <p className="text-[13px] font-black uppercase tracking-widest text-white/75">
            {today.toLocaleDateString("en-US", { month: "long" })}
          </p>
          <p className="mt-2 text-[56px] font-black leading-none">
            {today.getDate()}
          </p>
          <p className="mt-3 text-[13px] font-bold text-white/80">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, note, tone = "green" }) {
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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

export default function ManpowerHrDashboard() {
  const navigate = useNavigate();

  const [token, setToken] = useState(getHrToken());
  const [hrUser] = useState(getHrUser());
  const [applications, setApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vacancyFilter, setVacancyFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("name-az");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const hrEmail =
    hrUser?.email ||
    hrUser?.companyEmail ||
    hrUser?.username ||
    "traineeemail@tamsi.com";

  function logout() {
    clearHrSession();
    setToken("");
    navigate("/manpower-hr-login", { replace: true });
  }

  async function loadApplications() {
    const res = await fetch(`${API_BASE}/manpower/hr/applications`, {
      headers: hrHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      logout();
      return;
    }

    if (res.ok) {
      setApplications(Array.isArray(data.applications) ? data.applications : []);
    }
  }

  async function loadEmployees() {
    const res = await fetch(`${API_BASE}/manpower/hr/employees`, {
      headers: hrHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      logout();
      return;
    }

    if (res.ok) {
      setEmployees(Array.isArray(data.employees) ? data.employees : []);
    }
  }

  async function refreshDashboard() {
    setLoading(true);
    setStatusMessage("");

    try {
      await Promise.all([loadApplications(), loadEmployees()]);
    } catch (error) {
      setStatusMessage(error?.message || "Failed to refresh dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      navigate("/manpower-hr-login", { replace: true });
      return;
    }

    refreshDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const summary = useMemo(() => {
    const pending = applications.filter((row) => row.status === "PENDING").length;

    const forReview = applications.filter(
      (row) => row.status === "FOR_REVIEW"
    ).length;

    const interviewScheduled = applications.filter(
      (row) => row.status === "INTERVIEW_SCHEDULED"
    ).length;

    const interviewed = applications.filter(
      (row) => row.status === "INTERVIEWED"
    ).length;

    const hired = applications.filter((row) => row.status === "HIRED").length;

    const rejected = applications.filter(
      (row) => row.status === "REJECTED"
    ).length;

    return {
      totalApplications: applications.length,
      pending,
      forReview,
      interviewScheduled,
      interviewed,
      hired,
      rejected,
      totalEmployees: employees.length,
      activeEmployees: employees.filter((item) => item.active !== false).length,
      inactiveEmployees: employees.filter((item) => item.active === false).length,
    };
  }, [applications, employees]);

  const vacancyRows = useMemo(() => {
    return VACANCIES.map((vacancy) => {
      const applicants = applications.filter(
        (row) => row.vacancy === vacancy
      ).length;

      const hired = employees.filter((row) => row.vacancy === vacancy).length;

      return {
        vacancy,
        applicants,
        hired,
      };
    }).filter((row) => row.applicants > 0 || row.hired > 0);
  }, [applications, employees]);

  const availableVacancies = useMemo(() => {
    const vacancies = employees
      .map((employee) => employee?.vacancy || employee?.jobPosition || "")
      .filter(Boolean);

    return Array.from(new Set(vacancies)).sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    const matchedEmployees = employees.filter((employee) => {
      const active = employee.active !== false;
      const vacancy = employee?.vacancy || employee?.jobPosition || "";
      const haystack = [
        getEmployeeName(employee),
        employee?.companyEmail,
        employee?.personalEmail,
        employee?.email,
        employee?.vacancy,
        employee?.jobPosition,
        employee?.deploymentSite,
        employee?.contactNo,
        employee?.phoneNumber,
        active ? "active" : "inactive",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "inactive" && !active);
      const matchesVacancy =
        vacancyFilter === "all" || String(vacancy) === vacancyFilter;

      return matchesKeyword && matchesStatus && matchesVacancy;
    });

    return [...matchedEmployees].sort((a, b) => {
      const firstName = getEmployeeName(a);
      const secondName = getEmployeeName(b);
      const firstVacancy = String(a?.vacancy || a?.jobPosition || "");
      const secondVacancy = String(b?.vacancy || b?.jobPosition || "");
      const firstStatus = a.active === false ? 1 : 0;
      const secondStatus = b.active === false ? 1 : 0;

      if (sortOrder === "name-za") {
        return secondName.localeCompare(firstName);
      }

      if (sortOrder === "vacancy-az") {
        return (
          firstVacancy.localeCompare(secondVacancy) ||
          firstName.localeCompare(secondName)
        );
      }

      if (sortOrder === "status") {
        return firstStatus - secondStatus || firstName.localeCompare(secondName);
      }

      return firstName.localeCompare(secondName);
    });
  }, [employees, searchValue, statusFilter, vacancyFilter, sortOrder]);

  const totalEmployeePages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / rowsPerPage)
  );

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredEmployees, currentPage, rowsPerPage]);

  const employeeStart = filteredEmployees.length
    ? (currentPage - 1) * rowsPerPage + 1
    : 0;

  const employeeEnd = Math.min(currentPage * rowsPerPage, filteredEmployees.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, statusFilter, vacancyFilter, sortOrder, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalEmployeePages) {
      setCurrentPage(totalEmployeePages);
    }
  }, [currentPage, totalEmployeePages]);

  function updateEmployeeStatus(employee, active) {
    setEmployees((prev) =>
      prev.map((item) =>
        item._id === employee._id || item.id === employee.id
          ? {
              ...item,
              active,
            }
          : item
      )
    );

    setStatusMessage(
      active
        ? "Employee marked as active on this dashboard."
        : "Employee marked as inactive on this dashboard."
    );
  }

  const averageDailyRate = employees.length
    ? formatMoney(
        employees.reduce(
          (sum, row) => sum + Number(row.dailyRate || 0),
          0
        ) / employees.length
      )
    : "0.00";

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
            <SidebarButton active icon="dashboard" onClick={() => navigate("/manpower-hr")}>
              Dashboard
            </SidebarButton>

            <SidebarButton
              icon="applicants"
              onClick={() => navigate("/manpower-hr-applications")}
            >
              Manage Applicants
            </SidebarButton>

            <SidebarButton icon="payroll" onClick={() => navigate("/manpower-hr-payroll")}>
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
              className="group flex min-h-[52px] w-full items-center gap-4 rounded-[26px] bg-white/10 px-6 text-left text-[13px] font-black capitalize tracking-tight text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#f4d484] hover:text-[#071f14]"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center text-white/90 transition duration-300 group-hover:text-[#071f14]">
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
                  Manpower HR Center
                </p>
                <h1 className="mt-3 max-w-3xl text-[38px] font-black leading-[0.98] tracking-[-0.055em] md:text-[56px]">
                  Human Resources Dashboard
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] font-semibold leading-7 text-white/75">
                  Monitor applicants, employee records, vacancy movement, and workforce status in one professional dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={refreshDashboard}
                disabled={loading}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-7 text-[13px] font-black uppercase tracking-[0.08em] text-[#071f14] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:bg-[#f4d484] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Refreshing..." : "Refresh Dashboard"}
              </button>
            </div>
          </section>

          <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Applications"
              value={summary.totalApplications}
              note="Total manpower applicants"
            />
            <StatCard
              title="Pending"
              value={summary.pending}
              note="Applicants awaiting action"
              tone="gold"
            />
            <StatCard
              title="Employees"
              value={summary.totalEmployees}
              note="Total manpower employees"
            />
            <StatCard
              title="Inactive"
              value={summary.inactiveEmployees}
              note="Employees marked inactive"
              tone="red"
            />
          </section>

          <section className="mt-7 grid gap-6 xl:grid-cols-[1fr_0.92fr]">
            <SectionCard eyebrow="Alerts" title="Notification Overview">
              <div className="space-y-4">
                <NotificationBar
                  label="Pending Applications"
                  value={summary.pending}
                />
                <NotificationBar
                  label="Interview Scheduled"
                  value={summary.interviewScheduled}
                />
                <NotificationBar
                  label="Total Employees"
                  value={summary.totalEmployees}
                />
              </div>
            </SectionCard>

            <CalendarPanel />
          </section>

          <SectionCard
            eyebrow="Employee Records"
            title="List of Employee"
            className="mt-7"
            right={
              <div className="flex w-full flex-col gap-3 xl:w-auto xl:items-end">
                <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[260px_160px_170px_160px_auto]">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search employee, email, vacancy..."
                    className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[13px] font-bold text-[#071f14] outline-none transition focus:border-[#d7a84d] focus:bg-white focus:shadow-[0_12px_28px_rgba(8,39,25,0.08)]"
                  />

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[12px] font-black text-[#071f14] outline-none transition focus:border-[#d7a84d] focus:bg-white focus:shadow-[0_12px_28px_rgba(8,39,25,0.08)]"
                    aria-label="Filter employees by status"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>

                  <select
                    value={vacancyFilter}
                    onChange={(event) => setVacancyFilter(event.target.value)}
                    className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[12px] font-black text-[#071f14] outline-none transition focus:border-[#d7a84d] focus:bg-white focus:shadow-[0_12px_28px_rgba(8,39,25,0.08)]"
                    aria-label="Filter employees by vacancy"
                  >
                    <option value="all">All Vacancies</option>
                    {availableVacancies.map((vacancy) => (
                      <option key={vacancy} value={vacancy}>
                        {vacancy}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    className="min-h-[48px] w-full rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-5 text-[12px] font-black text-[#071f14] outline-none transition focus:border-[#d7a84d] focus:bg-white focus:shadow-[0_12px_28px_rgba(8,39,25,0.08)]"
                    aria-label="Sort employees"
                  >
                    <option value="name-az">Name A-Z</option>
                    <option value="name-za">Name Z-A</option>
                    <option value="vacancy-az">Vacancy A-Z</option>
                    <option value="status">Active First</option>
                  </select>

                  <button
                    type="button"
                    onClick={refreshDashboard}
                    disabled={loading}
                    className="min-h-[48px] rounded-full bg-[#174a30] px-6 text-[12px] font-black uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:bg-[#082719] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Loading..." : "Refresh"}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[12px] font-black uppercase tracking-[0.12em] text-[#071f14]/45">
                  <span>
                    Showing {employeeStart}-{employeeEnd} of {filteredEmployees.length}
                  </span>
                  <span className="hidden h-1 w-1 rounded-full bg-[#071f14]/25 sm:inline-block" />
                  <span>{rowsPerPage} per page</span>
                </div>
              </div>
            }
          >
            {statusMessage ? (
              <div className="mb-5 rounded-2xl border border-[#d7e2da] bg-[#f8fbf9] px-5 py-3 text-[13px] font-bold text-[#174a30]">
                {statusMessage}
              </div>
            ) : null}

            <div className="overflow-hidden rounded-3xl border border-[#d7e2da] bg-[#f8fbf9]">
              {paginatedEmployees.length ? (
                <div className="divide-y divide-[#d7e2da]">
                  {paginatedEmployees.map((employee) => {
                    const employeeId = employee._id || employee.id;
                    const active = employee.active !== false;

                    return (
                      <article
                        key={employeeId || employee.companyEmail}
                        className="grid gap-4 bg-white/70 px-5 py-5 transition duration-300 hover:bg-white hover:shadow-[0_16px_40px_rgba(8,39,25,0.08)] md:grid-cols-[58px_1.3fr_1.5fr_0.8fr_0.75fr_1.35fr] md:items-center"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#082719] text-[15px] font-black text-[#f4d484] shadow-[0_12px_26px_rgba(8,39,25,0.18)]">
                          {getEmployeeName(employee).charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-[15px] font-black text-[#071f14]">
                            {getEmployeeName(employee)}
                          </p>
                          <p className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#071f14]/35">
                            Employee
                          </p>
                        </div>

                        <p className="break-all text-[13px] font-extrabold text-[#071f14]/70">
                          {employee.companyEmail ||
                            employee.email ||
                            employee.personalEmail ||
                            "traineeemail@tamsi.com"}
                        </p>

                        <p className="text-[13px] font-black text-[#071f14]">
                          {employee.vacancy || employee.jobPosition || "Job"}
                        </p>

                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${
                            active
                              ? "bg-[#e7f7ec] text-[#0f6b35]"
                              : "bg-[#fee2e2] text-[#9d2f2f]"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>

                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <button
                            type="button"
                            onClick={() => updateEmployeeStatus(employee, true)}
                            className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.05em] transition ${
                              active
                                ? "bg-[#dff5e6] text-[#0f6b35]"
                                : "bg-[#eef4ef] text-[#174a30] hover:bg-[#dff5e6] hover:text-[#0f6b35]"
                            }`}
                          >
                            Activate
                          </button>

                          <button
                            type="button"
                            onClick={() => updateEmployeeStatus(employee, false)}
                            className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.05em] transition ${
                              !active
                                ? "bg-[#fee2e2] text-[#9d2f2f]"
                                : "bg-[#fff1f1] text-[#9d2f2f] hover:bg-[#fee2e2]"
                            }`}
                          >
                            Deactivate
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  <div className="flex flex-col gap-4 border-t border-[#d7e2da] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3 text-[12px] font-bold text-[#071f14]/55">
                      <span>
                        Showing <b className="text-[#071f14]">{employeeStart}</b> to <b className="text-[#071f14]">{employeeEnd}</b> of <b className="text-[#071f14]">{filteredEmployees.length}</b> employees
                      </span>
                      <label className="flex items-center gap-2">
                        <span>Rows:</span>
                        <select
                          value={rowsPerPage}
                          onChange={(event) => setRowsPerPage(Number(event.target.value))}
                          className="rounded-full border border-[#d7e2da] bg-[#f8fbf9] px-3 py-2 text-[12px] font-black text-[#071f14] outline-none focus:border-[#d7a84d]"
                          aria-label="Rows per page"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={15}>15</option>
                        </select>
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                        className="rounded-full border border-[#d7e2da] bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#071f14] transition hover:-translate-y-0.5 hover:border-[#d7a84d] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                      >
                        Prev
                      </button>
                      <span className="rounded-full bg-[#082719] px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-white">
                        Page {currentPage} of {totalEmployeePages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((page) => Math.min(totalEmployeePages, page + 1))}
                        disabled={currentPage === totalEmployeePages}
                        className="rounded-full border border-[#d7e2da] bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#071f14] transition hover:-translate-y-0.5 hover:border-[#d7a84d] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-14 text-center text-[14px] font-bold text-[#071f14]/55">
                  {loading ? "Loading employees..." : "No employees found."}
                </div>
              )}
            </div>
          </SectionCard>

          <section className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <SectionCard eyebrow="Reports" title="Vacancy Overview">
              <div className="overflow-x-auto rounded-3xl border border-[#d7e2da] bg-[#f8fbf9]">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[#eef4ef] text-[#071f14]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#071f14]/55">
                        Vacancy
                      </th>
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#071f14]/55">
                        Applicants
                      </th>
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#071f14]/55">
                        Hired
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#d7e2da] bg-white/70">
                    {vacancyRows.map((row) => (
                      <tr key={row.vacancy} className="transition hover:bg-white">
                        <td className="px-5 py-4 font-black text-[#071f14]">
                          {row.vacancy}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#174a30]">
                          {row.applicants}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#174a30]">
                          {row.hired}
                        </td>
                      </tr>
                    ))}

                    {!vacancyRows.length ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-10 text-center font-bold text-[#071f14]/55"
                        >
                          No vacancy records yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard eyebrow="Summary" title="Quick Summary">
              <div className="grid gap-3 text-[14px] font-bold text-[#071f14]">
                <div className="rounded-2xl bg-[#f8fbf9] px-4 py-3">
                  Total Applications: {summary.totalApplications}
                </div>
                <div className="rounded-2xl bg-[#f8fbf9] px-4 py-3">
                  For Review: {summary.forReview}
                </div>
                <div className="rounded-2xl bg-[#f8fbf9] px-4 py-3">
                  Interviewed: {summary.interviewed}
                </div>
                <div className="rounded-2xl bg-[#f8fbf9] px-4 py-3">
                  Hired: {summary.hired}
                </div>
                <div className="rounded-2xl bg-[#f8fbf9] px-4 py-3">
                  Rejected: {summary.rejected}
                </div>
                <div className="rounded-2xl bg-[#f8fbf9] px-4 py-3">
                  Average Daily Rate: {averageDailyRate}
                </div>
              </div>
            </SectionCard>
          </section>
        </main>
      </div>
    </div>
  );
}

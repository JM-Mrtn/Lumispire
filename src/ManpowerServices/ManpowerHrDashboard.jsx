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

function NotificationBar({ label, value }) {
  return (
    <div className="rounded-lg bg-[#c7d0c6] px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] font-black uppercase text-[#294f35]">
          {label}
        </p>
        <p className="text-[22px] font-black text-[#294f35]">{value}</p>
      </div>
    </div>
  );
}

function CalendarPanel() {
  const today = new Date();

  return (
    <div className="flex h-full min-h-[285px] flex-col items-center justify-center rounded-lg bg-[#637a68] px-6 py-8 text-white">
      <p className="text-[18px] font-black uppercase">Calendar</p>

      <div className="mt-5 rounded-2xl bg-white/10 px-7 py-5 text-center">
        <p className="text-[13px] font-bold uppercase tracking-widest text-white/80">
          {today.toLocaleDateString("en-US", { month: "long" })}
        </p>
        <p className="mt-1 text-[48px] font-black leading-none">
          {today.getDate()}
        </p>
        <p className="mt-2 text-[13px] font-semibold text-white/85">
          {today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}

export default function ManpowerHrDashboard() {
  const navigate = useNavigate();

  const [token, setToken] = useState(getHrToken());
  const [hrUser] = useState(getHrUser());
  const [applications, setApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchValue, setSearchValue] = useState("");
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

  const filteredEmployees = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) return employees;

    return employees.filter((employee) => {
      const haystack = [
        getEmployeeName(employee),
        employee?.companyEmail,
        employee?.personalEmail,
        employee?.email,
        employee?.vacancy,
        employee?.deploymentSite,
        employee?.contactNo,
        employee?.phoneNumber,
        employee?.active === false ? "inactive" : "active",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [employees, searchValue]);

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
              <SidebarButton active onClick={() => navigate("/manpower-hr")}>
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
              Human Resources Dashboard
            </h1>
            <div className="mt-2 h-[4px] w-[560px] max-w-full bg-white/65" />
          </section>

          <section className="mt-5 grid gap-7 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-lg bg-[#637a68] p-3">
              <h2 className="px-1 text-[17px] font-black uppercase text-white">
                Notification
              </h2>

              <div className="mt-4 space-y-6">
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
            </div>

            <CalendarPanel />
          </section>

          <section className="mt-7 overflow-hidden rounded-lg bg-[#294f35]">
            <div className="flex flex-col gap-4 rounded-t-lg bg-white px-4 py-4 text-[#294f35] lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-[18px] font-black">List of Employee</h2>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search Employee"
                  className="h-[26px] w-full rounded-full border border-[#aab5aa] bg-white px-4 text-[13px] font-semibold text-[#294f35] outline-none sm:w-[270px]"
                />

                <button
                  type="button"
                  onClick={refreshDashboard}
                  disabled={loading}
                  className="h-[26px] min-w-[110px] rounded-full bg-[#174322] px-5 text-[12px] font-black text-white transition hover:bg-[#0f3319] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
              </div>
            </div>

            {statusMessage ? (
              <div className="border-b border-white/10 bg-[#203f2b] px-4 py-2 text-[12px] font-semibold text-white/85">
                {statusMessage}
              </div>
            ) : null}

            <div className="min-h-[300px]">
              {filteredEmployees.length ? (
                filteredEmployees.map((employee) => {
                  const employeeId = employee._id || employee.id;
                  const active = employee.active !== false;

                  return (
                    <div
                      key={employeeId || employee.companyEmail}
                      className="grid gap-4 border-b border-white/25 px-4 py-5 text-white md:grid-cols-[64px_1.3fr_1.4fr_0.75fr_0.75fr_1.3fr] md:items-center"
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
                        {employee.vacancy || employee.jobPosition || "Job"}
                      </p>

                      <p className="text-[16px] font-black">
                        {active ? "Active" : "Inactive"}
                      </p>

                      <div className="flex flex-wrap gap-4 md:justify-end">
                        <button
                          type="button"
                          onClick={() => updateEmployeeStatus(employee, true)}
                          className={`min-w-[86px] rounded-full px-4 py-1 text-[11px] font-black transition ${
                            active
                              ? "bg-[#bdf0a8] text-[#294f35]"
                              : "bg-white/80 text-[#294f35] hover:bg-[#bdf0a8]"
                          }`}
                        >
                          Activate
                        </button>

                        <button
                          type="button"
                          onClick={() => updateEmployeeStatus(employee, false)}
                          className={`min-w-[86px] rounded-full px-4 py-1 text-[11px] font-black transition ${
                            !active
                              ? "bg-[#f2d2d2] text-[#7c3232]"
                              : "bg-white text-[#294f35] hover:bg-[#f2d2d2] hover:text-[#7c3232]"
                          }`}
                        >
                          Deactivate
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-14 text-center text-[14px] font-semibold text-white/80">
                  {loading ? "Loading employees..." : "No employees found."}
                </div>
              )}
            </div>
          </section>

          <section className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg bg-[#294f35] p-5">
              <h2 className="text-[18px] font-black uppercase text-white">
                Vacancy Overview
              </h2>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white text-[#294f35]">
                    <tr>
                      <th className="px-4 py-3 font-black">Vacancy</th>
                      <th className="px-4 py-3 font-black">Applicants</th>
                      <th className="px-4 py-3 font-black">Hired</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vacancyRows.map((row) => (
                      <tr
                        key={row.vacancy}
                        className="border-b border-white/15 text-white"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {row.vacancy}
                        </td>
                        <td className="px-4 py-3">{row.applicants}</td>
                        <td className="px-4 py-3">{row.hired}</td>
                      </tr>
                    ))}

                    {!vacancyRows.length ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-white/75"
                        >
                          No vacancy records yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg bg-[#637a68] p-5">
              <h2 className="text-[18px] font-black uppercase text-white">
                Quick Summary
              </h2>

              <div className="mt-4 grid gap-3 text-[14px] font-bold text-white">
                <div className="rounded-lg bg-white/10 px-4 py-3">
                  Total Applications: {summary.totalApplications}
                </div>

                <div className="rounded-lg bg-white/10 px-4 py-3">
                  For Review: {summary.forReview}
                </div>

                <div className="rounded-lg bg-white/10 px-4 py-3">
                  Interviewed: {summary.interviewed}
                </div>

                <div className="rounded-lg bg-white/10 px-4 py-3">
                  Hired: {summary.hired}
                </div>

                <div className="rounded-lg bg-white/10 px-4 py-3">
                  Rejected: {summary.rejected}
                </div>

                <div className="rounded-lg bg-white/10 px-4 py-3">
                  Average Daily Rate:{" "}
                  {employees.length
                    ? formatMoney(
                        employees.reduce(
                          (sum, row) => sum + Number(row.dailyRate || 0),
                          0
                        ) / employees.length
                      )
                    : "0.00"}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
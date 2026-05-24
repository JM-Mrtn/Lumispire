import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell, LoadingState } from "./ManpowerAdminShell";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getAdminToken() {
  return localStorage.getItem("manpowerAdminToken") || "";
}

function clearAdminSession() {
  localStorage.removeItem("manpowerAdminToken");
  localStorage.removeItem("manpowerAdminUser");
}

function adminHeaders(extra = {}) {
  const token = getAdminToken();
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

function buildMonthlyApplicantRows(rows = []) {
  return MONTH_LABELS.map((month) => {
    const found = rows.find((row) => row?.month === month);

    return {
      month,
      total: Number(found?.total || 0),
    };
  });
}

function DashboardStatCard({ title, value, subtitle, tone = "default" }) {
  const toneClass =
    {
      default: "text-[#071f14] from-[#235f3e] via-[#2f754c] to-[#d7a84d]",
      success: "text-[#17663b] from-[#17663b] via-[#2f754c] to-[#d7a84d]",
      danger: "text-[#8b3232] from-[#8b3232] via-[#b85d5d] to-[#f4d484]",
      warning: "text-[#b54708] from-[#b54708] via-[#d7a84d] to-[#f4d484]",
    }[tone] || "text-[#071f14] from-[#235f3e] via-[#2f754c] to-[#d7a84d]";

  return (
    <article className="group relative min-h-[138px] overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(8,39,25,0.16)]">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${toneClass}`} />
      <div className="absolute -right-12 -top-16 h-36 w-36 rounded-full bg-[#f4d484]/20 blur-2xl transition duration-300 group-hover:scale-125" />
      <div className="absolute -bottom-14 -left-14 h-32 w-32 rounded-full bg-[#235f3e]/10 blur-2xl transition duration-300 group-hover:scale-110" />
      <div className="relative">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
          {title}
        </p>
        <p
          className={`mt-4 text-4xl font-black leading-none tracking-tight ${
            toneClass.split(" ")[0]
          }`}
        >
          {value}
        </p>
        {subtitle ? (
          <p className="mt-3 text-sm font-semibold leading-6 text-[#071f14]/55">
            {subtitle}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function DashboardSectionCard({ eyebrow, title, subtitle, children }) {
  const hasHeader = Boolean(eyebrow || title || subtitle);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5">
      {hasHeader ? (
        <>
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#f4d484]/20 blur-2xl" />
          <div className="relative border-b border-black/5 bg-[#fbfcf8] px-6 py-6">
            {eyebrow ? (
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
                {eyebrow}
              </p>
            ) : null}
            <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                {title ? (
                  <h2 className="text-2xl font-black tracking-tight text-[#071f14]">
                    {title}
                  </h2>
                ) : null}
                {subtitle ? (
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#071f14]/60">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}
      <div className={hasHeader ? "relative p-6" : "relative"}>{children}</div>
    </section>
  );
}

export default function ManpowerAdminDashboard() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [token, setToken] = useState(getAdminToken());
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState([currentYear]);
  const [monthlyApplicants, setMonthlyApplicants] = useState(
    buildMonthlyApplicantRows()
  );
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    mustChangePasswordCount: 0,
    readyAccountsCount: 0,
    hiredApplications: 0,
  });
  const [vacancyBreakdown, setVacancyBreakdown] = useState([]);

  function logout() {
    clearAdminSession();
    setToken("");
    navigate("/manpower-admin-login", { replace: true });
  }

  useEffect(() => {
    if (!token) {
      navigate("/manpower-admin-login", { replace: true });
      return;
    }

    loadDashboard(selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate, selectedYear]);

  async function loadDashboard(year = selectedYear) {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/manpower/admin/dashboard?year=${encodeURIComponent(year)}`,
        {
          headers: adminHeaders(),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load admin dashboard.");
      }

      const apiSelectedYear = Number(data?.selectedYear || year || currentYear);
      const apiYears = Array.isArray(data?.availableYears)
        ? data.availableYears.map((item) => Number(item)).filter(Number.isFinite)
        : [];
      const nextYears = apiYears.length ? apiYears : [apiSelectedYear];

      if (!nextYears.includes(apiSelectedYear)) {
        nextYears.unshift(apiSelectedYear);
      }

      setSummary(data?.summary || {});
      setVacancyBreakdown(data?.vacancyBreakdown || []);
      setMonthlyApplicants(buildMonthlyApplicantRows(data?.monthlyApplicants));
      setSelectedYear(apiSelectedYear);
      setAvailableYears(nextYears);
    } catch (error) {
      alert(error?.message || "Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const totalRows = useMemo(() => vacancyBreakdown.length, [vacancyBreakdown]);

  return (
    <AdminShell
      current="dashboard"
      title="Manpower Admin Dashboard"
      subtitle="Monitor employee accounts, hired applications, and vacancy account status."
      onLogout={logout}
    >
      {loading ? (
        <LoadingState>Loading admin dashboard...</LoadingState>
      ) : (
        <div className="animate-[fadeUp_0.6s_ease-out] space-y-8">
          <style>{`
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(18px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <section className="relative overflow-hidden rounded-[32px] border border-white/80 bg-[#082719] px-6 py-7 shadow-[0_24px_70px_rgba(8,39,25,0.18)] ring-1 ring-black/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,212,132,0.25),transparent_35%),linear-gradient(135deg,rgba(35,95,62,0.96),rgba(8,39,25,1))]" />
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#f4d484]/20 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-[#f4d484]">
                  Manpower Center
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                  Account Monitoring Overview
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">
                  Review manpower account status, hired applications, monthly applicants, and vacancy breakdowns in one dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadDashboard(selectedYear)}
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-extrabold text-[#082719] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#f4d484]"
              >
                Refresh Dashboard
              </button>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <DashboardStatCard
              title="Total Accounts"
              value={summary.totalEmployees || 0}
              subtitle="All manpower employee accounts"
            />
            <DashboardStatCard
              title="Active Accounts"
              value={summary.activeEmployees || 0}
              subtitle="Accounts that can currently log in"
              tone="success"
            />
            <DashboardStatCard
              title="Inactive Accounts"
              value={summary.inactiveEmployees || 0}
              subtitle="Accounts blocked from login"
              tone="danger"
            />
            <DashboardStatCard
              title="Must Change Password"
              value={summary.mustChangePasswordCount || 0}
              subtitle="Accounts that still require password change"
              tone="warning"
            />
            <DashboardStatCard
              title="Ready Accounts"
              value={summary.readyAccountsCount || 0}
              subtitle="Active accounts with no forced password change"
              tone="success"
            />
            <DashboardStatCard
              title="Hired Applications"
              value={summary.hiredApplications || 0}
              subtitle="Applicants already marked as hired"
            />
          </section>

          <DashboardSectionCard
            eyebrow="Applicant Analytics"
            title="Total Monthly Applicants"
            subtitle="Applicant count from January to December with a year filter."
          >
            <div className="mb-5 flex flex-col gap-4 rounded-[24px] border border-[#dce8dc] bg-[#f7faf6] p-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#071f14]/45">
                  Filter by Year
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#071f14]/60">
                  Select a year to view the total monthly applicants.
                </p>
              </div>

              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="w-full rounded-2xl border border-[#dce8dc] bg-white px-4 py-3 text-sm font-extrabold text-[#071f14] shadow-sm outline-none transition focus:border-[#235f3e] focus:ring-4 focus:ring-[#235f3e]/10 sm:w-48"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-[390px] rounded-[28px] border border-[#dce8dc] bg-white p-4 shadow-[0_12px_30px_rgba(8,39,25,0.07)]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyApplicants}
                  margin={{ top: 20, right: 24, left: 0, bottom: 12 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    interval={0}
                    tick={{ fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                    height={78}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} applicants`, "Total"]}
                    labelFormatter={(label) => `${label} ${selectedYear}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Applicants"
                    stroke="#235f3e"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard>
            <div className="overflow-hidden rounded-[30px] border border-[#dce8dc] bg-[#f7faf6] shadow-[0_18px_45px_rgba(8,39,25,0.08)]">
              <div className="relative overflow-hidden bg-[#082719] px-6 py-6 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,212,132,0.24),transparent_34%),linear-gradient(135deg,rgba(35,95,62,0.96),rgba(8,39,25,1))]" />
                <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#f4d484]/20 blur-3xl" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#f4d484]">
                      Detailed Breakdown
                    </p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                      Vacancy Performance Summary
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
                      Account count per manpower vacancy, including active,
                      inactive, and password-change status.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/60">
                        Rows
                      </p>
                      <p className="mt-1 text-2xl font-black text-white">
                        {totalRows}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/60">
                        Active
                      </p>
                      <p className="mt-1 text-2xl font-black text-[#f4d484]">
                        {summary.activeEmployees || 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/60">
                        Pending
                      </p>
                      <p className="mt-1 text-2xl font-black text-[#f4d484]">
                        {summary.mustChangePasswordCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="overflow-hidden rounded-[24px] border border-[#dce8dc] bg-white shadow-[0_12px_30px_rgba(8,39,25,0.07)]">
                  <div className="hidden grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_1.25fr] gap-4 border-b border-[#e7eee6] bg-[#eef5ee] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#5d7163] md:grid">
                    <span>Vacancy</span>
                    <span>Total</span>
                    <span>Active</span>
                    <span>Inactive</span>
                    <span>Must Change Password</span>
                  </div>

                  <div className="divide-y divide-[#edf2eb]">
                    {vacancyBreakdown.map((row) => (
                      <div
                        key={row.vacancy}
                        className="group grid gap-3 px-5 py-4 transition duration-300 hover:bg-[#f8fbf6] md:grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_1.25fr] md:items-center"
                      >
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] md:hidden">
                            Vacancy
                          </p>
                          <p className="text-base font-black text-[#071f14] transition duration-300 group-hover:translate-x-1">
                            {row.vacancy || "-"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between md:block">
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] md:hidden">
                            Total
                          </span>
                          <span className="inline-flex min-w-12 justify-center rounded-full bg-[#eef4ef] px-3 py-1.5 text-sm font-black text-[#071f14]/70">
                            {row.totalAccounts || 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between md:block">
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] md:hidden">
                            Active
                          </span>
                          <span className="inline-flex min-w-12 justify-center rounded-full bg-[#e8f7ee] px-3 py-1.5 text-sm font-black text-[#17663b]">
                            {row.activeAccounts || 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between md:block">
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] md:hidden">
                            Inactive
                          </span>
                          <span className="inline-flex min-w-12 justify-center rounded-full bg-[#fdeeee] px-3 py-1.5 text-sm font-black text-[#8b3232]">
                            {row.inactiveAccounts || 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between md:block">
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] md:hidden">
                            Must Change Password
                          </span>
                          <span className="inline-flex min-w-12 justify-center rounded-full bg-[#fff3df] px-3 py-1.5 text-sm font-black text-[#b54708]">
                            {row.mustChangePasswordCount || 0}
                          </span>
                        </div>
                      </div>
                    ))}

                    {!totalRows ? (
                      <div className="px-5 py-14 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef4ef] text-2xl">
                          📊
                        </div>
                        <p className="mt-4 text-sm font-black text-[#071f14]">
                          No account records found yet.
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#071f14]/50">
                          Vacancy data will appear here once accounts are available.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </DashboardSectionCard>
        </div>
      )}
    </AdminShell>
  );
}

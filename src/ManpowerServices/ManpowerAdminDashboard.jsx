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
import {
  AdminShell,
  LoadingState,
  SectionCard,
  StatCard,
} from "./ManpowerAdminShell";

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
        <div className="space-y-8">
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Total Accounts"
              value={summary.totalEmployees || 0}
              subtitle="All manpower employee accounts"
            />
            <StatCard
              title="Active Accounts"
              value={summary.activeEmployees || 0}
              subtitle="Accounts that can currently log in"
              tone="success"
            />
            <StatCard
              title="Inactive Accounts"
              value={summary.inactiveEmployees || 0}
              subtitle="Accounts blocked from login"
              tone="danger"
            />
            <StatCard
              title="Must Change Password"
              value={summary.mustChangePasswordCount || 0}
              subtitle="Accounts that still require password change"
              tone="warning"
            />
            <StatCard
              title="Ready Accounts"
              value={summary.readyAccountsCount || 0}
              subtitle="Active accounts with no forced password change"
              tone="success"
            />
            <StatCard
              title="Hired Applications"
              value={summary.hiredApplications || 0}
              subtitle="Applicants already marked as hired"
            />
          </section>

          <SectionCard
            title="Total Monthly Applicants"
            subtitle="Applicant count from January to December."
          >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#24352c]">
                  Filter by Year
                </p>
                <p className="text-xs text-[#6b7a6d]">
                  Select a year to view the total monthly applicants.
                </p>
              </div>

              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="w-full rounded-xl border border-[#cfdac8] bg-white px-4 py-3 text-sm font-semibold text-[#24352c] outline-none transition focus:border-[#6f7d49] focus:ring-4 focus:ring-[#6f7d49]/10 sm:w-48"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-[380px] rounded-2xl border border-[#d9e3d5] bg-white p-4">
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
                    stroke="#1f5f3b"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Vacancy Account Overview"
            subtitle="Account count per manpower vacancy."
          >
            <div className="overflow-x-auto rounded-xl border border-[#d9e3d5]">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f0f4ec] text-[#395345]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Vacancy</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Active</th>
                    <th className="px-4 py-3 font-semibold">Inactive</th>
                    <th className="px-4 py-3 font-semibold">
                      Must Change Password
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vacancyBreakdown.map((row) => (
                    <tr
                      key={row.vacancy}
                      className="border-t border-[#eef2ea] hover:bg-[#fbfcf8]"
                    >
                      <td className="px-4 py-3 font-semibold text-[#24352c]">
                        {row.vacancy || "-"}
                      </td>
                      <td className="px-4 py-3 text-[#5f6f61]">
                        {row.totalAccounts || 0}
                      </td>
                      <td className="px-4 py-3 text-[#246843]">
                        {row.activeAccounts || 0}
                      </td>
                      <td className="px-4 py-3 text-[#8b3232]">
                        {row.inactiveAccounts || 0}
                      </td>
                      <td className="px-4 py-3 text-[#b54708]">
                        {row.mustChangePasswordCount || 0}
                      </td>
                    </tr>
                  ))}

                  {!totalRows ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-[#6b7a6d]"
                      >
                        No account records found yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}
    </AdminShell>
  );
}

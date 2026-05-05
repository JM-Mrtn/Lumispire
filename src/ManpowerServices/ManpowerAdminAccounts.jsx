import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ActionButton,
  AdminShell,
  CompactCell,
  EmptyState,
  LoadingState,
  SectionCard,
  StatusPill,
  inputClassName,
} from "./ManpowerAdminShell";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
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

function formatMoney(value = 0) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
}

function clampPage(page, totalPages) {
  const safeTotal = Math.max(Number(totalPages || 1), 1);
  const safePage = Number(page || 1);

  if (safePage < 1) return 1;
  if (safePage > safeTotal) return safeTotal;

  return safePage;
}

function buildVisiblePages(currentPage, totalPages) {
  const pages = [];
  const safeTotal = Math.max(totalPages, 1);

  let start = Math.max(currentPage - 2, 1);
  let end = Math.min(start + 4, safeTotal);

  if (end - start < 4) {
    start = Math.max(end - 4, 1);
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}

export default function ManpowerAdminAccounts() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const vacancies = jobs.length ? jobs.map((job) => job.title) : DEFAULT_VACANCIES;

  const [token, setToken] = useState(getAdminToken());
  const [search, setSearch] = useState("");
  const [vacancyFilter, setVacancyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
        console.error("loadJobs error:", error);
        if (active) setJobs([]);
      }
    }

    loadJobs();

    return () => {
      active = false;
    };
  }, []);

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

    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, search, vacancyFilter, statusFilter, navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, vacancyFilter, statusFilter, rowsPerPage]);

  async function loadAccounts() {
    try {
      setLoading(true);

      const query = new URLSearchParams();

      if (search.trim()) query.set("search", search.trim());
      if (vacancyFilter) query.set("vacancy", vacancyFilter);
      if (statusFilter) query.set("status", statusFilter);

      const url = query.toString()
        ? `${API_BASE}/manpower/admin/accounts?${query.toString()}`
        : `${API_BASE}/manpower/admin/accounts`;

      const res = await fetch(url, {
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load accounts.");
      }

      setEmployees(Array.isArray(data?.employees) ? data.employees : []);
    } catch (error) {
      alert(error?.message || "Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  }

  async function updateDailyRate(employee) {
    const currentRate = formatMoney(employee?.dailyRate || 0);

    const input = window.prompt(
      `Enter new daily rate for ${employee.fullName || employee.companyEmail}:`,
      currentRate
    );

    if (input == null) return;

    const dailyRate = Number(String(input).replace(/,/g, "").trim());

    if (!Number.isFinite(dailyRate) || dailyRate < 0) {
      alert("Please enter a valid daily rate.");
      return;
    }

    const confirmed = window.confirm(
      `Update daily rate for ${employee.fullName || employee.companyEmail} from ₱${currentRate} to ₱${formatMoney(dailyRate)}?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `${API_BASE}/manpower/admin/accounts/${employee._id}/daily-rate`,
        {
          method: "PATCH",
          headers: {
            ...adminHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dailyRate }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update daily rate.");
      }

      alert(data?.message || "Daily rate updated successfully.");
      await loadAccounts();
    } catch (error) {
      alert(error?.message || "Failed to update daily rate.");
    }
  }

  async function updateAccountStatus(employee, active) {
    const confirmed = window.confirm(
      active
        ? `Activate ${employee.fullName || employee.companyEmail}?`
        : `Deactivate ${employee.fullName || employee.companyEmail}?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `${API_BASE}/manpower/admin/accounts/${employee._id}/status`,
        {
          method: "PATCH",
          headers: {
            ...adminHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update account status.");
      }

      alert(data?.message || "Account status updated.");
      await loadAccounts();
    } catch (error) {
      alert(error?.message || "Failed to update account status.");
    }
  }

  async function resetPassword(employee) {
    const confirmed = window.confirm(
      `Reset password for ${employee.fullName || employee.companyEmail}?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `${API_BASE}/manpower/admin/accounts/${employee._id}/reset-password`,
        {
          method: "POST",
          headers: {
            ...adminHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to reset password.");
      }

      alert(
        `Temporary password for ${employee.fullName || employee.companyEmail}:\n\n${data?.temporaryPassword || "-"}`
      );

      await loadAccounts();
    } catch (error) {
      alert(error?.message || "Failed to reset password.");
    }
  }

  const totalAccounts = employees.length;
  const totalPages = Math.max(Math.ceil(totalAccounts / rowsPerPage), 1);
  const safeCurrentPage = clampPage(currentPage, totalPages);

  const paginatedEmployees = useMemo(() => {
    const start = (safeCurrentPage - 1) * rowsPerPage;
    return employees.slice(start, start + rowsPerPage);
  }, [employees, safeCurrentPage, rowsPerPage]);

  const visiblePages = useMemo(() => {
    return buildVisiblePages(safeCurrentPage, totalPages);
  }, [safeCurrentPage, totalPages]);

  const startItem = totalAccounts === 0 ? 0 : (safeCurrentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * rowsPerPage, totalAccounts);

  return (
    <AdminShell
      current="accounts"
      title="Manpower Admin Accounts"
      subtitle="Search, filter, update rates, reset passwords, and control employee account access."
      onLogout={logout}
    >
      <div className="space-y-6">
        <SectionCard>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, company email, contact, deployment..."
              className={inputClassName}
            />

            <select
              value={vacancyFilter}
              onChange={(event) => setVacancyFilter(event.target.value)}
              className={inputClassName}
            >
              <option value="">All vacancies</option>
              {vacancies.map((vacancy) => (
                <option key={vacancy} value={vacancy}>
                  {vacancy}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={inputClassName}
            >
              <option value="">All account status</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm text-[#5f6f61] md:flex-row md:items-center md:justify-between">
            <p>
              Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
              <strong>{totalAccounts}</strong> account{totalAccounts === 1 ? "" : "s"}.
            </p>

            <label className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(event) => setRowsPerPage(Number(event.target.value))}
                className="rounded-lg border border-[#c6ccb9] bg-white px-3 py-2 text-sm outline-none focus:border-[#395345] focus:ring-2 focus:ring-[#dce7d8]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </label>
          </div>
        </SectionCard>

        <section className="space-y-3">
          {loading ? (
            <LoadingState>Loading accounts...</LoadingState>
          ) : paginatedEmployees.length ? (
            paginatedEmployees.map((employee) => (
              <article
                key={employee._id}
                className="rounded-[22px] border border-[#d7decf] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1.45fr_0.9fr_0.85fr_0.85fr_0.9fr_1.8fr] lg:items-center">
                  <CompactCell label="Employee">
                    <p className="truncate">{employee.fullName || "-"}</p>
                    <p className="mt-1 text-xs font-medium text-[#5f6f61]">
                      {employee.contactNo || "-"}
                    </p>
                  </CompactCell>

                  <CompactCell label="Company Email">
                    <p className="truncate">{employee.companyEmail || "-"}</p>
                  </CompactCell>

                  <CompactCell label="Vacancy">
                    <p className="line-clamp-2">{employee.vacancy || "-"}</p>
                  </CompactCell>

                  <CompactCell label="Deployment">
                    <p className="truncate">{employee.deploymentSite || "-"}</p>
                  </CompactCell>

                  <CompactCell label="Daily Rate">
                    <p className="whitespace-nowrap">₱{formatMoney(employee.dailyRate)}</p>
                  </CompactCell>

                  <CompactCell label="Status">
                    <StatusPill tone={employee.active ? "success" : "danger"}>
                      {employee.active ? "Active" : "Inactive"}
                    </StatusPill>
                  </CompactCell>

                  <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                    <ActionButton
                      size="sm"
                      variant="info"
                      onClick={() => updateDailyRate(employee)}
                    >
                      Edit Rate
                    </ActionButton>

                    {employee.active ? (
                      <ActionButton
                        size="sm"
                        variant="danger"
                        onClick={() => updateAccountStatus(employee, false)}
                      >
                        Deactivate
                      </ActionButton>
                    ) : (
                      <ActionButton
                        size="sm"
                        variant="success"
                        onClick={() => updateAccountStatus(employee, true)}
                      >
                        Activate
                      </ActionButton>
                    )}

                    <ActionButton
                      size="sm"
                      variant="soft"
                      onClick={() => resetPassword(employee)}
                    >
                      Reset Password
                    </ActionButton>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <EmptyState>No accounts found.</EmptyState>
          )}
        </section>

        <SectionCard>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[#5f6f61]">
              Page <strong>{safeCurrentPage}</strong> of <strong>{totalPages}</strong>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <ActionButton
                variant="ghost"
                size="sm"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((prev) => clampPage(prev - 1, totalPages))}
              >
                Previous
              </ActionButton>

              {visiblePages.map((page) => (
                <ActionButton
                  key={page}
                  size="sm"
                  variant={page === safeCurrentPage ? "primary" : "ghost"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </ActionButton>
              ))}

              <ActionButton
                variant="ghost"
                size="sm"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => clampPage(prev + 1, totalPages))}
              >
                Next
              </ActionButton>
            </div>
          </div>
        </SectionCard>
      </div>
    </AdminShell>
  );
}

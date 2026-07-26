import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ActionButton,
  AdminModal,
  AdminShell,
  CompactCell,
  EmptyState,
  ErrorState,
  FieldLabel,
  InlineNotice,
  LoadingState,
  SectionCard,
  StatusPill,
  Toast,
  clearAdminSession,
  downloadCsv,
  formatDateTime,
  inputClassName,
  recordAdminActivity,
} from "./ManpowerAdminShell";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);
const DEFAULT_VACANCIES = ["Accounting Clerk", "General Clerk", "Money Sorter", "Data Encoder", "Admin Assistant", "HR Assistant", "Production Worker", "Warehouseman", "Stockman", "Sales Coordinator", "Financial Advisor", "Engineer", "Driver", "Promodiser", "Merchandiser", "Messenger", "Forklift Operator", "Janitor", "Construction Worker"];

function getAdminToken() { return localStorage.getItem("manpowerAdminToken") || ""; }
function adminHeaders(extra = {}) { return { Authorization: `Bearer ${getAdminToken()}`, ...extra }; }
function formatMoney(value = 0) { const num = Number(value || 0); return Number.isFinite(num) ? num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"; }
function clampPage(page, totalPages) { return Math.min(Math.max(Number(page || 1), 1), Math.max(Number(totalPages || 1), 1)); }
function buildVisiblePages(currentPage, totalPages) { const pages = []; let start = Math.max(currentPage - 2, 1); let end = Math.min(start + 4, Math.max(totalPages, 1)); if (end - start < 4) start = Math.max(end - 4, 1); for (let page = start; page <= end; page += 1) pages.push(page); return pages; }
function employeeName(employee) { return employee?.fullName || employee?.name || employee?.companyEmail || "Employee"; }
function fieldValue(employee, keys, fallback = "-") { for (const key of keys) if (employee?.[key] !== undefined && employee?.[key] !== null && employee?.[key] !== "") return employee[key]; return fallback; }

export default function ManpowerAdminAccounts() {
  const navigate = useNavigate();
  const [token, setToken] = useState(getAdminToken());
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [vacancyFilter, setVacancyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deploymentFilter, setDeploymentFilter] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [notice, setNotice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [rateEmployee, setRateEmployee] = useState(null);
  const [rateValue, setRateValue] = useState("");
  const [rateError, setRateError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState(null);

  const vacancies = jobs.length ? jobs.map((job) => job.title).filter(Boolean) : DEFAULT_VACANCIES;

  function logout() {
    clearAdminSession();
    setToken("");
    navigate("/manpower-admin-login", { replace: true });
  }

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/manpower/vacancies`).then((res) => res.json().then((data) => ({ res, data }))).then(({ res, data }) => {
      if (active && res.ok) setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
    }).catch(() => { if (active) setJobs([]); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!token) { navigate("/manpower-admin-login", { replace: true }); return; }
    const timer = window.setTimeout(() => loadAccounts(), 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, search, vacancyFilter, statusFilter, navigate]);

  useEffect(() => { setCurrentPage(1); }, [search, vacancyFilter, statusFilter, deploymentFilter, sortBy, rowsPerPage]);
  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(null), 4500); return () => window.clearTimeout(timer); }, [notice]);

  async function loadAccounts() {
    try {
      setLoading(true);
      setLoadError("");
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (vacancyFilter) query.set("vacancy", vacancyFilter);
      if (statusFilter) query.set("status", statusFilter);
      const url = query.toString() ? `${API_BASE}/manpower/admin/accounts?${query}` : `${API_BASE}/manpower/admin/accounts`;
      const res = await fetch(url, { headers: adminHeaders() });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) throw new Error(data?.message || "Failed to load accounts.");
      setEmployees(Array.isArray(data?.employees) ? data.employees : []);
    } catch (error) {
      setLoadError(error?.message || "Failed to load accounts.");
    } finally { setLoading(false); }
  }

  function openRateModal(employee) {
    setRateEmployee(employee);
    setRateValue(String(Number(employee?.dailyRate || 0)));
    setRateError("");
  }

  async function saveDailyRate() {
    if (!rateEmployee) return;
    const dailyRate = Number(String(rateValue).replace(/,/g, "").trim());
    if (!Number.isFinite(dailyRate) || dailyRate < 0) { setRateError("Enter a valid non-negative daily rate."); return; }
    try {
      setActionLoading(`rate-${rateEmployee._id}`);
      const oldRate = Number(rateEmployee?.dailyRate || 0);
      const res = await fetch(`${API_BASE}/manpower/admin/accounts/${rateEmployee._id}/daily-rate`, { method: "PATCH", headers: adminHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ dailyRate }) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) throw new Error(data?.message || "Failed to update daily rate.");
      recordAdminActivity("Updated employee daily rate", `${employeeName(rateEmployee)}: ₱${formatMoney(oldRate)} to ₱${formatMoney(dailyRate)}`);
      setNotice({ tone: "success", title: "Daily rate updated", message: data?.message || `${employeeName(rateEmployee)} now has a daily rate of ₱${formatMoney(dailyRate)}.` });
      setRateEmployee(null);
      await loadAccounts();
    } catch (error) { setRateError(error?.message || "Failed to update daily rate."); }
    finally { setActionLoading(""); }
  }

  function requestStatusChange(employee, active) {
    setConfirmAction({ type: "status", employee, active, title: active ? "Activate employee account?" : "Deactivate employee account?", description: active ? `${employeeName(employee)} will be able to sign in again.` : `${employeeName(employee)} will be blocked from signing in until reactivated.` });
  }

  function requestPasswordReset(employee) {
    setConfirmAction({ type: "password", employee, title: "Reset employee password?", description: `A new temporary password will be generated for ${employeeName(employee)}.` });
  }

  async function runConfirmedAction() {
    if (!confirmAction) return;
    const { type, employee, active } = confirmAction;
    const loadingKey = `${type}-${employee._id}`;
    try {
      setActionLoading(loadingKey);
      if (type === "status") {
        const res = await fetch(`${API_BASE}/manpower/admin/accounts/${employee._id}/status`, { method: "PATCH", headers: adminHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ active }) });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403) { logout(); return; }
        if (!res.ok) throw new Error(data?.message || "Failed to update account status.");
        recordAdminActivity(active ? "Activated employee account" : "Deactivated employee account", employeeName(employee));
        setNotice({ tone: "success", title: active ? "Account activated" : "Account deactivated", message: data?.message || `${employeeName(employee)} was updated successfully.` });
      } else {
        const res = await fetch(`${API_BASE}/manpower/admin/accounts/${employee._id}/reset-password`, { method: "POST", headers: adminHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({}) });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403) { logout(); return; }
        if (!res.ok) throw new Error(data?.message || "Failed to reset password.");
        recordAdminActivity("Reset employee password", employeeName(employee));
        setTemporaryPassword({ employee, value: data?.temporaryPassword || "" });
      }
      setConfirmAction(null);
      await loadAccounts();
    } catch (error) { setNotice({ tone: "danger", title: "Action failed", message: error?.message || "The account could not be updated." }); }
    finally { setActionLoading(""); }
  }

  async function copyTemporaryPassword() {
    const value = temporaryPassword?.value || "";
    if (!value) return;
    try { await navigator.clipboard.writeText(value); }
    catch {
      const textarea = document.createElement("textarea"); textarea.value = value; document.body.appendChild(textarea); textarea.select(); document.execCommand("copy"); textarea.remove();
    }
    setNotice({ tone: "success", title: "Password copied", message: "The temporary password is ready to paste into a secure message." });
  }

  const deployments = useMemo(() => [...new Set(employees.map((item) => item.deploymentSite).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b))), [employees]);
  const processedEmployees = useMemo(() => {
    const rows = deploymentFilter ? employees.filter((item) => String(item.deploymentSite || "") === deploymentFilter) : [...employees];
    return rows.sort((a, b) => {
      if (sortBy === "name-desc") return employeeName(b).localeCompare(employeeName(a));
      if (sortBy === "rate-high") return Number(b.dailyRate || 0) - Number(a.dailyRate || 0);
      if (sortBy === "rate-low") return Number(a.dailyRate || 0) - Number(b.dailyRate || 0);
      if (sortBy === "hired-new") return new Date(fieldValue(b, ["dateHired", "hiredAt", "createdAt"], 0)).getTime() - new Date(fieldValue(a, ["dateHired", "hiredAt", "createdAt"], 0)).getTime();
      if (sortBy === "hired-old") return new Date(fieldValue(a, ["dateHired", "hiredAt", "createdAt"], 0)).getTime() - new Date(fieldValue(b, ["dateHired", "hiredAt", "createdAt"], 0)).getTime();
      return employeeName(a).localeCompare(employeeName(b));
    });
  }, [employees, deploymentFilter, sortBy]);

  const totalAccounts = processedEmployees.length;
  const totalPages = Math.max(Math.ceil(totalAccounts / rowsPerPage), 1);
  const safeCurrentPage = clampPage(currentPage, totalPages);
  const paginatedEmployees = useMemo(() => processedEmployees.slice((safeCurrentPage - 1) * rowsPerPage, safeCurrentPage * rowsPerPage), [processedEmployees, safeCurrentPage, rowsPerPage]);
  const visiblePages = useMemo(() => buildVisiblePages(safeCurrentPage, totalPages), [safeCurrentPage, totalPages]);
  const startItem = totalAccounts === 0 ? 0 : (safeCurrentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * rowsPerPage, totalAccounts);

  function exportAccounts() {
    downloadCsv(`manpower-accounts-${new Date().toISOString().slice(0, 10)}.csv`, ["Employee", "Company Email", "Contact", "Vacancy", "Deployment Site", "Daily Rate", "Status", "Must Change Password", "Last Login", "Date Hired"], processedEmployees.map((employee) => [employeeName(employee), employee.companyEmail || "", employee.contactNo || "", employee.vacancy || "", employee.deploymentSite || "", Number(employee.dailyRate || 0).toFixed(2), employee.active ? "Active" : "Inactive", fieldValue(employee, ["mustChangePassword", "passwordChangeRequired"], false) ? "Yes" : "No", formatDateTime(fieldValue(employee, ["lastLoginAt", "lastLogin"], ""), ""), formatDateTime(fieldValue(employee, ["dateHired", "hiredAt", "createdAt"], ""), "") ]));
    recordAdminActivity("Exported employee accounts", `${processedEmployees.length} record(s)`);
    setNotice({ tone: "success", title: "CSV exported", message: `${processedEmployees.length} account record(s) were downloaded.` });
  }

  return <AdminShell current="accounts" title="Manpower Admin Accounts" subtitle="Search, review, export, update rates, reset passwords, and control employee access." onLogout={logout} actions={<ActionButton variant="ghost" onClick={exportAccounts} disabled={!processedEmployees.length}>Export CSV</ActionButton>}>
    <Toast notice={notice} onClose={() => setNotice(null)} />
    <div className="space-y-6">
      <SectionCard title="Account filters" subtitle="Use the filters and sorting controls to narrow the account list.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, contact..." className={inputClassName} />
          <select value={vacancyFilter} onChange={(event) => setVacancyFilter(event.target.value)} className={inputClassName}><option value="">All vacancies</option>{vacancies.map((vacancy) => <option key={vacancy} value={vacancy}>{vacancy}</option>)}</select>
          <select value={deploymentFilter} onChange={(event) => setDeploymentFilter(event.target.value)} className={inputClassName}><option value="">All deployment sites</option>{deployments.map((site) => <option key={site} value={site}>{site}</option>)}</select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClassName}><option value="">All statuses</option><option value="active">Active only</option><option value="inactive">Inactive only</option></select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className={inputClassName}><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="rate-high">Highest daily rate</option><option value="rate-low">Lowest daily rate</option><option value="hired-new">Newest hired</option><option value="hired-old">Oldest hired</option></select>
        </div>
        <div className="mt-4 flex flex-col gap-3 text-sm text-[#5f6f61] md:flex-row md:items-center md:justify-between"><p>Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalAccounts}</strong> account{totalAccounts === 1 ? "" : "s"}.</p><label className="flex items-center gap-2"><span>Rows:</span><select value={rowsPerPage} onChange={(event) => setRowsPerPage(Number(event.target.value))} className="rounded-lg border border-[#c6ccb9] bg-white px-3 py-2 text-sm outline-none"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></label></div>
      </SectionCard>

      {loading ? <LoadingState>Loading accounts...</LoadingState> : loadError ? <ErrorState message={loadError} onRetry={loadAccounts} /> : paginatedEmployees.length ? <section className="space-y-3">{paginatedEmployees.map((employee) => {
        const mustChangePassword = Boolean(fieldValue(employee, ["mustChangePassword", "passwordChangeRequired"], false));
        return <article key={employee._id} className="rounded-[22px] border border-[#d7decf] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1.35fr_0.9fr_0.9fr_0.8fr_1fr_1.75fr] lg:items-center">
          <CompactCell label="Employee"><p className="truncate">{employeeName(employee)}</p><p className="mt-1 text-xs font-medium text-[#5f6f61]">{employee.contactNo || "-"}</p></CompactCell>
          <CompactCell label="Company Email"><p className="truncate">{employee.companyEmail || "-"}</p></CompactCell>
          <CompactCell label="Vacancy"><p className="line-clamp-2">{employee.vacancy || "-"}</p></CompactCell>
          <CompactCell label="Deployment"><p className="truncate">{employee.deploymentSite || "-"}</p></CompactCell>
          <CompactCell label="Daily Rate"><p className="whitespace-nowrap">₱{formatMoney(employee.dailyRate)}</p></CompactCell>
          <CompactCell label="Access"><div className="flex flex-wrap gap-1"><StatusPill tone={employee.active ? "success" : "danger"}>{employee.active ? "Active" : "Inactive"}</StatusPill>{mustChangePassword ? <StatusPill tone="warning">Temp Password</StatusPill> : null}</div></CompactCell>
          <div className="flex flex-wrap justify-start gap-2 lg:justify-end"><ActionButton size="sm" variant="ghost" onClick={() => setSelectedEmployee(employee)}>View</ActionButton><ActionButton size="sm" variant="info" onClick={() => openRateModal(employee)} disabled={Boolean(actionLoading)}>Edit Rate</ActionButton>{employee.active ? <ActionButton size="sm" variant="danger" onClick={() => requestStatusChange(employee, false)} loading={actionLoading === `status-${employee._id}`}>Deactivate</ActionButton> : <ActionButton size="sm" variant="success" onClick={() => requestStatusChange(employee, true)} loading={actionLoading === `status-${employee._id}`}>Activate</ActionButton>}<ActionButton size="sm" variant="soft" onClick={() => requestPasswordReset(employee)} loading={actionLoading === `password-${employee._id}`}>Reset Password</ActionButton></div>
        </div></article>;
      })}</section> : <EmptyState>No accounts match the selected filters.</EmptyState>}

      {!loading && !loadError && totalAccounts > 0 ? <SectionCard><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><p className="text-sm text-[#5f6f61]">Page <strong>{safeCurrentPage}</strong> of <strong>{totalPages}</strong></p><div className="flex flex-wrap items-center gap-2"><ActionButton variant="ghost" size="sm" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage((prev) => clampPage(prev - 1, totalPages))}>Previous</ActionButton>{visiblePages.map((page) => <ActionButton key={page} size="sm" variant={page === safeCurrentPage ? "primary" : "ghost"} onClick={() => setCurrentPage(page)}>{page}</ActionButton>)}<ActionButton variant="ghost" size="sm" disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage((prev) => clampPage(prev + 1, totalPages))}>Next</ActionButton></div></div></SectionCard> : null}
    </div>

    <AdminModal open={Boolean(selectedEmployee)} title="Employee account details" description="Complete information currently returned by the employee account API." onClose={() => setSelectedEmployee(null)} maxWidth="max-w-2xl" footer={<ActionButton variant="ghost" onClick={() => setSelectedEmployee(null)}>Close</ActionButton>}>
      {selectedEmployee ? <div className="grid gap-4 sm:grid-cols-2">{[
        ["Full name", employeeName(selectedEmployee)], ["Company email", selectedEmployee.companyEmail || "-"], ["Contact number", selectedEmployee.contactNo || "-"], ["Vacancy", selectedEmployee.vacancy || "-"], ["Deployment site", selectedEmployee.deploymentSite || "-"], ["Daily rate", `₱${formatMoney(selectedEmployee.dailyRate)}`], ["Account status", selectedEmployee.active ? "Active" : "Inactive"], ["Password status", fieldValue(selectedEmployee, ["mustChangePassword", "passwordChangeRequired"], false) ? "Temporary password must be changed" : "Password ready"], ["Date hired", formatDateTime(fieldValue(selectedEmployee, ["dateHired", "hiredAt", "createdAt"], ""))], ["Last login", formatDateTime(fieldValue(selectedEmployee, ["lastLoginAt", "lastLogin"], ""))]
      ].map(([label, value]) => <div key={label} className="rounded-2xl bg-[#f6f9f4] p-4"><FieldLabel>{label}</FieldLabel><p className="mt-2 break-words text-sm font-bold text-[#24352c]">{value}</p></div>)}</div> : null}
    </AdminModal>

    <AdminModal open={Boolean(rateEmployee)} title="Edit daily rate" description={rateEmployee ? `Update the daily rate for ${employeeName(rateEmployee)}.` : ""} onClose={() => !actionLoading && setRateEmployee(null)} footer={<><ActionButton variant="ghost" onClick={() => setRateEmployee(null)} disabled={Boolean(actionLoading)}>Cancel</ActionButton><ActionButton onClick={saveDailyRate} loading={actionLoading.startsWith("rate-")}>Save rate</ActionButton></>}>
      <label className="block"><FieldLabel>New daily rate</FieldLabel><div className="mt-2 flex items-center rounded-xl border border-[#c6ccb9] bg-white px-4 focus-within:border-[#395345] focus-within:ring-2 focus-within:ring-[#dce7d8]"><span className="font-bold text-[#395345]">₱</span><input value={rateValue} onChange={(event) => { setRateValue(event.target.value); setRateError(""); }} type="number" min="0" step="0.01" className="w-full bg-transparent px-3 py-3 text-sm outline-none" /></div></label>{rateEmployee ? <p className="mt-3 text-sm text-[#5f6f61]">Current rate: <strong>₱{formatMoney(rateEmployee.dailyRate)}</strong></p> : null}{rateError ? <InlineNotice tone="danger" className="mt-4">{rateError}</InlineNotice> : null}
    </AdminModal>

    <AdminModal open={Boolean(confirmAction)} title={confirmAction?.title || "Confirm action"} description={confirmAction?.description} onClose={() => !actionLoading && setConfirmAction(null)} footer={<><ActionButton variant="ghost" onClick={() => setConfirmAction(null)} disabled={Boolean(actionLoading)}>Cancel</ActionButton><ActionButton variant={confirmAction?.type === "status" && confirmAction?.active ? "success" : "danger"} onClick={runConfirmedAction} loading={Boolean(actionLoading)}>{confirmAction?.type === "password" ? "Reset password" : confirmAction?.active ? "Activate account" : "Deactivate account"}</ActionButton></>}>
      <InlineNotice tone={confirmAction?.type === "password" ? "warning" : "info"}>{confirmAction?.type === "password" ? "Share the generated password through a secure channel. The password will only be shown after the reset succeeds." : "This change takes effect immediately."}</InlineNotice>
    </AdminModal>

    <AdminModal open={Boolean(temporaryPassword)} title="Temporary password generated" description={temporaryPassword ? `For ${employeeName(temporaryPassword.employee)}` : ""} onClose={() => setTemporaryPassword(null)} footer={<><ActionButton variant="ghost" onClick={() => setTemporaryPassword(null)}>Close</ActionButton><ActionButton onClick={copyTemporaryPassword}>Copy password</ActionButton></>}>
      <InlineNotice tone="warning" title="Keep this password secure">The employee should sign in and change this temporary password as soon as possible.</InlineNotice><div className="mt-4 rounded-2xl border border-dashed border-[#d7a84d] bg-[#fffaf0] p-5 text-center"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#9a5b08]">Temporary password</p><p className="mt-3 break-all font-mono text-xl font-black text-[#071f14]">{temporaryPassword?.value || "Not returned by the server"}</p></div>
    </AdminModal>
  </AdminShell>;
}

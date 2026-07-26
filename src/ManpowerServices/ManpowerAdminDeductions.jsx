import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ActionButton,
  AdminModal,
  AdminShell,
  ErrorState,
  FieldLabel,
  InlineNotice,
  LoadingState,
  Toast,
  compactInputClassName,
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

function getAdminToken() {
  return localStorage.getItem("manpowerAdminToken") || "";
}

function clearAdminSession() {
  localStorage.removeItem("manpowerAdminToken");
  localStorage.removeItem("manpowerAdminUser");
  localStorage.removeItem("manpowerAdmin");
  localStorage.removeItem("manpowerToken");
}

function adminHeaders(extra = {}) {
  const token = getAdminToken();
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

function emptySssRow() {
  return {
    min: 0,
    max: "",
    employeeShare: 0,
  };
}

function emptyTaxRow() {
  return {
    min: 0,
    max: "",
    baseTax: 0,
    excessOver: 0,
    rate: 0,
    bracket: "",
  };
}

function normalizeConfig(config = {}) {
  return {
    sss: {
      enabled: config?.sss?.enabled !== false,
      table: Array.isArray(config?.sss?.table) ? config.sss.table : [],
    },
    philhealth: {
      enabled: config?.philhealth?.enabled !== false,
      monthlyRate: Number(config?.philhealth?.monthlyRate ?? 0.02),
      employeeShareRate: Number(config?.philhealth?.employeeShareRate ?? 0.5),
      firstHalfFixedDeduction: Number(
        config?.philhealth?.firstHalfFixedDeduction ?? 250
      ),
    },
    pagibig: {
      enabled: config?.pagibig?.enabled !== false,
      fixedEmployeeShare: Number(config?.pagibig?.fixedEmployeeShare ?? 100),
    },
    withholdingTax: {
      enabled: config?.withholdingTax?.enabled !== false,
      payrollType: "semi-monthly",
      table: Array.isArray(config?.withholdingTax?.table)
        ? config.withholdingTax.table
        : [],
    },
  };
}

function Toggle({ checked, onChange, label = "Enabled" }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-[#d7decf] bg-white px-4 py-2 text-sm font-semibold text-[#395345] shadow-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#395345]"
      />
      {label}
    </label>
  );
}


function DashboardStatCard({ title, value, subtitle, tone = "default" }) {
  const toneClasses = {
    default: "from-[#235f3e] via-[#2f754c] to-[#d7a84d] text-[#071f14]",
    success: "from-[#17663b] via-[#2f754c] to-[#d7a84d] text-[#17663b]",
    warning: "from-[#b54708] via-[#d7a84d] to-[#f4d484] text-[#b54708]",
    danger: "from-[#8b3232] via-[#b85d5d] to-[#f4d484] text-[#8b3232]",
  }[tone] || "from-[#235f3e] via-[#2f754c] to-[#d7a84d] text-[#071f14]";

  const valueColor = toneClasses.split(" ").find((item) => item.startsWith("text-"));

  return (
    <article className="group relative min-h-[138px] overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(8,39,25,0.16)]">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${toneClasses}`} />
      <div className="absolute -right-12 -top-16 h-36 w-36 rounded-full bg-[#f4d484]/20 blur-2xl transition duration-300 group-hover:scale-125" />
      <div className="absolute -bottom-14 -left-14 h-32 w-32 rounded-full bg-[#235f3e]/10 blur-2xl transition duration-300 group-hover:scale-110" />
      <div className="relative">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
          {title}
        </p>
        <p className={`mt-4 text-4xl font-black leading-none tracking-tight ${valueColor}`}>
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

function DashboardPanel({ eyebrow, title, subtitle, action, children }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 transition duration-300 hover:shadow-[0_28px_70px_rgba(8,39,25,0.13)]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#f4d484]/20 blur-2xl" />
      <div className="relative border-b border-black/5 bg-[#fbfcf8] px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071f14]">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#071f14]/60">
                {subtitle}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
      <div className="relative p-5 sm:p-6">{children}</div>
    </section>
  );
}

function DashboardTableShell({ children }) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-[#dce8dc] bg-[#f7faf6] shadow-[0_18px_45px_rgba(8,39,25,0.08)]">
      <div className="overflow-x-auto p-3 sm:p-4">
        <div className="min-w-full overflow-hidden rounded-[20px] border border-[#dce8dc] bg-white shadow-[0_12px_30px_rgba(8,39,25,0.07)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function validateDeductionConfig(config) {
  const errors = [];
  const validateRows = (rows, label, extraFields = []) => {
    const normalized = rows.map((row, index) => ({ ...row, index, min: Number(row.min), max: row.max === "" || row.max == null ? null : Number(row.max) })).sort((a, b) => a.min - b.min);
    normalized.forEach((row) => {
      if (!Number.isFinite(row.min) || row.min < 0) errors.push(`${label} row ${row.index + 1}: minimum must be a non-negative number.`);
      if (row.max !== null && (!Number.isFinite(row.max) || row.max < row.min)) errors.push(`${label} row ${row.index + 1}: maximum must be greater than or equal to minimum.`);
      extraFields.forEach(([key, display, maxValue]) => {
        const value = Number(row[key]);
        if (!Number.isFinite(value) || value < 0 || (maxValue != null && value > maxValue)) errors.push(`${label} row ${row.index + 1}: ${display} is invalid.`);
      });
    });
    for (let index = 1; index < normalized.length; index += 1) {
      const previous = normalized[index - 1];
      const current = normalized[index];
      if (previous.max === null) errors.push(`${label}: an open-ended bracket must be the final row.`);
      else if (Number.isFinite(previous.max) && current.min <= previous.max) errors.push(`${label}: row ${current.index + 1} overlaps another bracket.`);
    }
  };

  validateRows(config.sss.table, "SSS", [["employeeShare", "employee share"]]);
  validateRows(config.withholdingTax.table, "Withholding tax", [["baseTax", "base tax"], ["excessOver", "excess over"], ["rate", "rate", 1]]);
  const numericRules = [
    [config.philhealth.monthlyRate, "PhilHealth monthly rate", 1],
    [config.philhealth.employeeShareRate, "PhilHealth employee share rate", 1],
    [config.philhealth.firstHalfFixedDeduction, "PhilHealth first-half deduction"],
    [config.pagibig.fixedEmployeeShare, "Pag-IBIG employee share"],
  ];
  numericRules.forEach(([raw, label, max]) => { const value = Number(raw); if (!Number.isFinite(value) || value < 0 || (max != null && value > max)) errors.push(`${label} is invalid.`); });
  return [...new Set(errors)];
}

function estimateDeductions(config, gross) {
  const salary = Math.max(Number(gross || 0), 0);
  const findRow = (rows) => rows.find((row) => salary >= Number(row.min || 0) && (row.max === "" || row.max == null || salary <= Number(row.max)));
  const sssRow = findRow(config.sss.table);
  const taxRow = findRow(config.withholdingTax.table);
  const sss = config.sss.enabled ? Number(sssRow?.employeeShare || 0) : 0;
  const philhealth = config.philhealth.enabled ? salary * Number(config.philhealth.monthlyRate || 0) * Number(config.philhealth.employeeShareRate || 0) : 0;
  const pagibig = config.pagibig.enabled ? Number(config.pagibig.fixedEmployeeShare || 0) : 0;
  const withholdingTax = config.withholdingTax.enabled && taxRow ? Number(taxRow.baseTax || 0) + Math.max(0, salary - Number(taxRow.excessOver || 0)) * Number(taxRow.rate || 0) : 0;
  return { sss, philhealth, pagibig, withholdingTax, total: sss + philhealth + pagibig + withholdingTax };
}

function readDeductionHistory() {
  try { const value = JSON.parse(localStorage.getItem("manpowerDeductionHistory") || "[]"); return Array.isArray(value) ? value : []; } catch { return []; }
}

export default function ManpowerAdminDeductions() {
  const navigate = useNavigate();
  const [token, setToken] = useState(getAdminToken());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [previewSalary, setPreviewSalary] = useState(20000);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState("");
  const [history, setHistory] = useState(readDeductionHistory);

  const [config, setConfig] = useState(() =>
    normalizeConfig({
      sss: { table: [] },
      withholdingTax: { table: [] },
    })
  );

  const currentSnapshot = useMemo(() => JSON.stringify(config), [config]);
  const hasUnsavedChanges = Boolean(savedSnapshot && currentSnapshot !== savedSnapshot);
  const preview = useMemo(() => estimateDeductions(config, previewSalary), [config, previewSalary]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const warn = (event) => { if (hasUnsavedChanges) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges]);

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

    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  async function loadConfig() {
    try {
      setLoading(true);
      setLoadError("");

      const res = await fetch(`${API_BASE}/manpower/admin/deductions`, {
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(
          data?.message || "Failed to load government deduction settings."
        );
      }

      const nextConfig = normalizeConfig(data?.config || data?.defaults || {});
      setConfig(nextConfig);
      setSavedSnapshot(JSON.stringify(nextConfig));
      setValidationErrors([]);
    } catch (error) {
      setLoadError(error?.message || "Failed to load government deduction settings.");
    } finally {
      setLoading(false);
    }
  }

  function setSectionEnabled(section, enabled) {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        enabled,
      },
    }));
  }

  function updatePhilHealthField(key, value) {
    setConfig((prev) => ({
      ...prev,
      philhealth: {
        ...prev.philhealth,
        [key]: value === "" ? "" : Number(value),
      },
    }));
  }

  function updatePagibigField(key, value) {
    setConfig((prev) => ({
      ...prev,
      pagibig: {
        ...prev.pagibig,
        [key]: value === "" ? "" : Number(value),
      },
    }));
  }

  function updateSssRow(index, key, value) {
    setConfig((prev) => ({
      ...prev,
      sss: {
        ...prev.sss,
        table: prev.sss.table.map((row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                [key]: value === "" ? "" : Number(value),
              }
            : row
        ),
      },
    }));
  }

  function updateTaxRow(index, key, value) {
    setConfig((prev) => ({
      ...prev,
      withholdingTax: {
        ...prev.withholdingTax,
        table: prev.withholdingTax.table.map((row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                [key]: key === "bracket" ? value : value === "" ? "" : Number(value),
              }
            : row
        ),
      },
    }));
  }

  function addSssRow() {
    setConfig((prev) => ({
      ...prev,
      sss: {
        ...prev.sss,
        table: [...prev.sss.table, emptySssRow()],
      },
    }));
  }

  function removeSssRow(index) {
    setConfig((prev) => ({
      ...prev,
      sss: {
        ...prev.sss,
        table: prev.sss.table.filter((_, rowIndex) => rowIndex !== index),
      },
    }));
  }

  function addTaxRow() {
    setConfig((prev) => ({
      ...prev,
      withholdingTax: {
        ...prev.withholdingTax,
        table: [...prev.withholdingTax.table, emptyTaxRow()],
      },
    }));
  }

  function removeTaxRow(index) {
    setConfig((prev) => ({
      ...prev,
      withholdingTax: {
        ...prev.withholdingTax,
        table: prev.withholdingTax.table.filter((_, rowIndex) => rowIndex !== index),
      },
    }));
  }

  async function saveConfig() {
    const errors = validateDeductionConfig(config);
    setValidationErrors(errors);
    if (errors.length) {
      setNotice({ tone: "danger", title: "Fix validation errors", message: `${errors.length} issue${errors.length === 1 ? "" : "s"} must be corrected before saving.` });
      return;
    }
    try {
      setSaving(true);
      const previous = savedSnapshot ? JSON.parse(savedSnapshot) : null;
      const res = await fetch(`${API_BASE}/manpower/admin/deductions`, { method: "PUT", headers: { ...adminHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(config) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) throw new Error(data?.message || "Failed to save government deduction settings.");
      const nextConfig = normalizeConfig(data?.config || config);
      if (previous) {
        const nextHistory = [{ id: `${Date.now()}`, savedAt: new Date().toISOString(), effectiveDate, config: previous }, ...history].slice(0, 10);
        localStorage.setItem("manpowerDeductionHistory", JSON.stringify(nextHistory));
        setHistory(nextHistory);
      }
      setConfig(nextConfig);
      setSavedSnapshot(JSON.stringify(nextConfig));
      setValidationErrors([]);
      recordAdminActivity("Updated government deduction settings", `Effective ${effectiveDate}`);
      setNotice({ tone: "success", title: "Deduction settings saved", message: data?.message || "The payroll deduction configuration was updated successfully." });
    } catch (error) { setNotice({ tone: "danger", title: "Save failed", message: error?.message || "Failed to save government deduction settings." }); }
    finally { setSaving(false); }
  }

  async function resetConfig() {
    if (resetText.trim().toUpperCase() !== "RESET") return;
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/manpower/admin/deductions/reset`, { method: "POST", headers: adminHeaders() });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) throw new Error(data?.message || "Failed to reset government deduction settings.");
      const nextConfig = normalizeConfig(data?.config || {});
      setConfig(nextConfig);
      setSavedSnapshot(JSON.stringify(nextConfig));
      setValidationErrors([]);
      setResetOpen(false);
      setResetText("");
      recordAdminActivity("Reset government deduction settings", "Restored server defaults");
      setNotice({ tone: "success", title: "Defaults restored", message: data?.message || "Government deduction settings were reset." });
    } catch (error) { setNotice({ tone: "danger", title: "Reset failed", message: error?.message || "Failed to reset government deduction settings." }); }
    finally { setSaving(false); }
  }

  return (
    <AdminShell
      current="deductions"
      title="Government Deductions Settings"
      subtitle="Configure SSS, PhilHealth, Pag-IBIG, and withholding tax rules used by payroll."
      onLogout={logout}
    >
      <Toast notice={notice} onClose={() => setNotice(null)} />
      {loading ? (
        <LoadingState>Loading government deduction settings...</LoadingState>
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={loadConfig} />
      ) : (
        <div className="animate-[deductionsFadeUp_0.6s_ease-out] space-y-8">
          <style>{`
            @keyframes deductionsFadeUp {
              from { opacity: 0; transform: translateY(18px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .deduction-input {
              transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
            }
            .deduction-input:focus,
            .deduction-input:focus-visible {
              transform: translateY(-1px);
              box-shadow: 0 14px 26px rgba(8, 39, 25, .08);
            }
            .deduction-table thead {
              background: #eef5ee;
              color: #5d7163;
            }
            .deduction-table th {
              padding: 14px 14px;
              text-align: left;
              font-size: 11px;
              font-weight: 900;
              letter-spacing: .16em;
              text-transform: uppercase;
            }
            .deduction-table td {
              padding: 10px 14px;
            }
            .deduction-table tbody tr {
              border-top: 1px solid #edf2eb;
              transition: background-color .2s ease;
            }
            .deduction-table tbody tr:hover {
              background: #f8fbf6;
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
                  Government Deduction Control
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">
                  
                </p>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[340px]">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/60">
                    SSS Rows
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#f4d484]">
                    {config.sss.table.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/60">
                    Tax Rows
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#f4d484]">
                    {config.withholdingTax.table.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              title="SSS Status"
              value={config.sss.enabled ? "On" : "Off"}
              subtitle={`${config.sss.table.length} salary bracket${config.sss.table.length === 1 ? "" : "s"}`}
              tone={config.sss.enabled ? "success" : "danger"}
            />
            <DashboardStatCard
              title="PhilHealth"
              value={config.philhealth.enabled ? "On" : "Off"}
              subtitle={`Monthly rate: ${config.philhealth.monthlyRate}`}
              tone={config.philhealth.enabled ? "success" : "danger"}
            />
            <DashboardStatCard
              title="Pag-IBIG"
              value={config.pagibig.enabled ? "On" : "Off"}
              subtitle={`Employee share: ₱${config.pagibig.fixedEmployeeShare}`}
              tone={config.pagibig.enabled ? "success" : "danger"}
            />
            <DashboardStatCard
              title="Tax Table"
              value={config.withholdingTax.table.length}
              subtitle="Semi-monthly tax brackets"
              tone="warning"
            />
          </section>

          {hasUnsavedChanges ? <InlineNotice tone="warning" title="Unsaved changes">Review the validation panel and save before leaving this page.</InlineNotice> : null}
          {validationErrors.length ? <InlineNotice tone="danger" title="Validation errors"><ul className="list-disc space-y-1 pl-5">{validationErrors.slice(0, 8).map((error) => <li key={error}>{error}</li>)}</ul>{validationErrors.length > 8 ? <p className="mt-2 font-bold">And {validationErrors.length - 8} more issue(s).</p> : null}</InlineNotice> : null}

          <section className="grid gap-6 lg:grid-cols-2">
            <DashboardPanel eyebrow="Change Control" title="Effective Date" subtitle="This date is stored in the local change history for reference. The existing API continues receiving only the supported deduction configuration.">
              <label className="block"><FieldLabel>Effective date</FieldLabel><input type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} className={`mt-2 ${inputClassName}`} /></label>
            </DashboardPanel>
            <DashboardPanel eyebrow="Calculation Preview" title="Estimate Employee Deductions" subtitle="Use a sample gross amount to verify the active brackets before saving.">
              <label className="block"><FieldLabel>Sample gross amount</FieldLabel><input type="number" min="0" step="0.01" value={previewSalary} onChange={(event) => setPreviewSalary(event.target.value)} className={`mt-2 ${inputClassName}`} /></label>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-[#f7faf6] p-3">SSS <strong className="float-right">₱{preview.sss.toFixed(2)}</strong></div><div className="rounded-2xl bg-[#f7faf6] p-3">PhilHealth <strong className="float-right">₱{preview.philhealth.toFixed(2)}</strong></div><div className="rounded-2xl bg-[#f7faf6] p-3">Pag-IBIG <strong className="float-right">₱{preview.pagibig.toFixed(2)}</strong></div><div className="rounded-2xl bg-[#f7faf6] p-3">Tax <strong className="float-right">₱{preview.withholdingTax.toFixed(2)}</strong></div></div>
              <div className="mt-3 rounded-2xl bg-[#082719] p-4 text-white"><span className="text-sm font-bold">Estimated total</span><strong className="float-right text-xl text-[#f4d484]">₱{preview.total.toFixed(2)}</strong></div>
            </DashboardPanel>
          </section>

          <DashboardPanel
            eyebrow="Deduction Table"
            title="SSS Table"
        
            action={
              <Toggle
                checked={config.sss.enabled}
                onChange={(event) => setSectionEnabled("sss", event.target.checked)}
              />
            }
          >
            <DashboardTableShell>
              <table className="deduction-table min-w-full text-sm">
                <thead>
                  <tr>
                    <th>Min Salary</th>
                    <th>Max Salary</th>
                    <th>Employee Share</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {config.sss.table.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="number"
                          value={row.min}
                          onChange={(event) => updateSssRow(index, "min", event.target.value)}
                          className={`${compactInputClassName} deduction-input`}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.max ?? ""}
                          placeholder="No max"
                          onChange={(event) => updateSssRow(index, "max", event.target.value)}
                          className={`${compactInputClassName} deduction-input`}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={row.employeeShare}
                          onChange={(event) =>
                            updateSssRow(index, "employeeShare", event.target.value)
                          }
                          className={`${compactInputClassName} deduction-input`}
                        />
                      </td>
                      <td>
                        <ActionButton
                          size="sm"
                          variant="danger"
                          onClick={() => removeSssRow(index)}
                        >
                          Remove
                        </ActionButton>
                      </td>
                    </tr>
                  ))}

                  {!config.sss.table.length ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-[#6b7a6d]">
                        No SSS brackets yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </DashboardTableShell>

            <ActionButton type="button" variant="soft" onClick={addSssRow} className="mt-4">
              Add SSS Bracket
            </ActionButton>
          </DashboardPanel>

          <section className="grid gap-6 lg:grid-cols-2">
            <DashboardPanel
              eyebrow="Deduction Rule"
              title="PhilHealth Rule"
              subtitle="Editable rates for PhilHealth computation."
              action={
                <Toggle
                  checked={config.philhealth.enabled}
                  onChange={(event) =>
                    setSectionEnabled("philhealth", event.target.checked)
                  }
                />
              }
            >
              <div className="grid gap-4">
                <label className="block rounded-2xl border border-[#dce8dc] bg-[#f8fbf6] p-4">
                  <FieldLabel>Monthly Rate</FieldLabel>
                  <input
                    type="number"
                    step="0.001"
                    value={config.philhealth.monthlyRate}
                    onChange={(event) =>
                      updatePhilHealthField("monthlyRate", event.target.value)
                    }
                    className={`mt-2 ${inputClassName} deduction-input`}
                  />
                </label>

                <label className="block rounded-2xl border border-[#dce8dc] bg-[#f8fbf6] p-4">
                  <FieldLabel>Employee Share Rate</FieldLabel>
                  <input
                    type="number"
                    step="0.001"
                    value={config.philhealth.employeeShareRate}
                    onChange={(event) =>
                      updatePhilHealthField("employeeShareRate", event.target.value)
                    }
                    className={`mt-2 ${inputClassName} deduction-input`}
                  />
                </label>

                <label className="block rounded-2xl border border-[#dce8dc] bg-[#f8fbf6] p-4">
                  <FieldLabel>1st Half Fixed Deduction</FieldLabel>
                  <input
                    type="number"
                    step="0.01"
                    value={config.philhealth.firstHalfFixedDeduction}
                    onChange={(event) =>
                      updatePhilHealthField(
                        "firstHalfFixedDeduction",
                        event.target.value
                      )
                    }
                    className={`mt-2 ${inputClassName} deduction-input`}
                  />
                </label>
              </div>
            </DashboardPanel>

            <DashboardPanel
              eyebrow="Deduction Rule"
              title="Pag-IBIG Rule"
              subtitle="Editable fixed employee share."
              action={
                <Toggle
                  checked={config.pagibig.enabled}
                  onChange={(event) => setSectionEnabled("pagibig", event.target.checked)}
                />
              }
            >
              <label className="block rounded-2xl border border-[#dce8dc] bg-[#f8fbf6] p-4">
                <FieldLabel>Fixed Employee Share</FieldLabel>
                <input
                  type="number"
                  step="0.01"
                  value={config.pagibig.fixedEmployeeShare}
                  onChange={(event) =>
                    updatePagibigField("fixedEmployeeShare", event.target.value)
                  }
                  className={`mt-2 ${inputClassName} deduction-input`}
                />
              </label>
            </DashboardPanel>
          </section>

          <DashboardPanel
            eyebrow="Deduction Table"
            title="Withholding Tax Table"
          
            action={
              <Toggle
                checked={config.withholdingTax.enabled}
                onChange={(event) =>
                  setSectionEnabled("withholdingTax", event.target.checked)
                }
              />
            }
          >
            <DashboardTableShell>
              <table className="deduction-table min-w-full text-sm">
                <thead>
                  <tr>
                    <th>Bracket Label</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Base Tax</th>
                    <th>Excess Over</th>
                    <th>Rate</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {config.withholdingTax.table.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          value={row.bracket || ""}
                          onChange={(event) =>
                            updateTaxRow(index, "bracket", event.target.value)
                          }
                          className={`${compactInputClassName} deduction-input min-w-[220px]`}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.min}
                          onChange={(event) => updateTaxRow(index, "min", event.target.value)}
                          className={`${compactInputClassName} deduction-input`}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.max ?? ""}
                          placeholder="No max"
                          onChange={(event) => updateTaxRow(index, "max", event.target.value)}
                          className={`${compactInputClassName} deduction-input`}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={row.baseTax}
                          onChange={(event) =>
                            updateTaxRow(index, "baseTax", event.target.value)
                          }
                          className={`${compactInputClassName} deduction-input`}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={row.excessOver}
                          onChange={(event) =>
                            updateTaxRow(index, "excessOver", event.target.value)
                          }
                          className={`${compactInputClassName} deduction-input`}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.001"
                          value={row.rate}
                          onChange={(event) => updateTaxRow(index, "rate", event.target.value)}
                          className={`${compactInputClassName} deduction-input`}
                        />
                      </td>
                      <td>
                        <ActionButton
                          size="sm"
                          variant="danger"
                          onClick={() => removeTaxRow(index)}
                        >
                          Remove
                        </ActionButton>
                      </td>
                    </tr>
                  ))}

                  {!config.withholdingTax.table.length ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[#6b7a6d]">
                        No withholding tax brackets yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </DashboardTableShell>

            <ActionButton type="button" variant="soft" onClick={addTaxRow} className="mt-4">
              Add Withholding Tax Bracket
            </ActionButton>
          </DashboardPanel>

          <section className="relative overflow-hidden rounded-[26px] border border-[#d7e2d1] bg-white p-4 shadow-[0_14px_34px_rgba(8,39,25,0.08)] ring-1 ring-black/5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <ActionButton type="button" variant="danger" onClick={() => setResetOpen(true)} disabled={saving}>Reset Defaults</ActionButton>
              <ActionButton type="button" onClick={saveConfig} loading={saving}>Save Deduction Settings</ActionButton>
            </div>
          </section>

          <DashboardPanel eyebrow="Local History" title="Recent Deduction Changes" subtitle="Up to ten previous configurations saved from this browser. A complete organization-wide audit log requires backend support.">
            {history.length ? <div className="divide-y divide-[#e8eee7] overflow-hidden rounded-2xl border border-[#dce8dc]">{history.map((entry) => <div key={entry.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-extrabold text-[#071f14]">Settings replaced</p><p className="text-xs font-semibold text-[#5f6f61]">Effective date: {entry.effectiveDate || "Not specified"}</p></div><p className="text-xs font-bold text-[#7a897c]">{formatDateTime(entry.savedAt)}</p></div>)}</div> : <div className="rounded-2xl border border-dashed border-[#cfd8c8] p-8 text-center text-sm font-semibold text-[#68786b]">Previous configurations will appear after the first successful update.</div>}
          </DashboardPanel>
        </div>
      )}

      <AdminModal open={resetOpen} title="Reset all deduction settings?" description="This restores the server defaults and replaces the current SSS, PhilHealth, Pag-IBIG, and withholding-tax configuration." onClose={() => !saving && setResetOpen(false)} footer={<><ActionButton variant="ghost" onClick={() => { setResetOpen(false); setResetText(""); }} disabled={saving}>Cancel</ActionButton><ActionButton variant="danger" onClick={resetConfig} loading={saving} disabled={resetText.trim().toUpperCase() !== "RESET"}>Reset defaults</ActionButton></>}>
        <InlineNotice tone="danger" title="High-impact action">Type <strong>RESET</strong> below to confirm.</InlineNotice><input value={resetText} onChange={(event) => setResetText(event.target.value)} placeholder="Type RESET" className={`mt-4 ${inputClassName}`} autoComplete="off" />
      </AdminModal>
    </AdminShell>
  );
}

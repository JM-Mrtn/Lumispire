import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ActionButton,
  AdminShell,
  FieldLabel,
  LoadingState,
  SectionCard,
  compactInputClassName,
  inputClassName,
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

export default function ManpowerAdminDeductions() {
  const navigate = useNavigate();
  const [token, setToken] = useState(getAdminToken());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState(() =>
    normalizeConfig({
      sss: { table: [] },
      withholdingTax: { table: [] },
    })
  );

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

      setConfig(normalizeConfig(data?.config || data?.defaults || {}));
    } catch (error) {
      alert(error?.message || "Failed to load government deduction settings.");
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
    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/manpower/admin/deductions`, {
        method: "PUT",
        headers: {
          ...adminHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(
          data?.message || "Failed to save government deduction settings."
        );
      }

      setConfig(normalizeConfig(data?.config || {}));
      alert(data?.message || "Government deduction settings saved.");
    } catch (error) {
      alert(error?.message || "Failed to save government deduction settings.");
    } finally {
      setSaving(false);
    }
  }

  async function resetConfig() {
    const confirmed = window.confirm(
      "Reset all government deduction settings to default?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/manpower/admin/deductions/reset`, {
        method: "POST",
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(
          data?.message || "Failed to reset government deduction settings."
        );
      }

      setConfig(normalizeConfig(data?.config || {}));
      alert(data?.message || "Government deduction settings reset.");
    } catch (error) {
      alert(error?.message || "Failed to reset government deduction settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      current="deductions"
      title="Government Deductions Settings"
      subtitle="Configure SSS, PhilHealth, Pag-IBIG, and withholding tax rules used by payroll."
      onLogout={logout}
    >
      {loading ? (
        <LoadingState>Loading government deduction settings...</LoadingState>
      ) : (
        <div className="space-y-6">
          <SectionCard
            title="SSS Table"
            subtitle="Admin can update salary brackets and employee share."
            action={
              <Toggle
                checked={config.sss.enabled}
                onChange={(event) => setSectionEnabled("sss", event.target.checked)}
              />
            }
          >
            <div className="overflow-x-auto rounded-xl border border-[#d9e3d5]">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f0f4ec] text-[#395345]">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold">Min Salary</th>
                    <th className="px-3 py-3 text-left font-semibold">Max Salary</th>
                    <th className="px-3 py-3 text-left font-semibold">Employee Share</th>
                    <th className="px-3 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {config.sss.table.map((row, index) => (
                    <tr key={index} className="border-t border-[#eef2ea] hover:bg-[#fbfcf8]">
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.min}
                          onChange={(event) => updateSssRow(index, "min", event.target.value)}
                          className={compactInputClassName}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.max ?? ""}
                          placeholder="No max"
                          onChange={(event) => updateSssRow(index, "max", event.target.value)}
                          className={compactInputClassName}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={row.employeeShare}
                          onChange={(event) =>
                            updateSssRow(index, "employeeShare", event.target.value)
                          }
                          className={compactInputClassName}
                        />
                      </td>
                      <td className="px-3 py-2">
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
                      <td colSpan={4} className="px-4 py-8 text-center text-[#6b7a6d]">
                        No SSS brackets yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <ActionButton type="button" variant="soft" onClick={addSssRow} className="mt-4">
              Add SSS Bracket
            </ActionButton>
          </SectionCard>

          <section className="grid gap-6 lg:grid-cols-2">
            <SectionCard
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
              <div className="space-y-4">
                <label className="block">
                  <FieldLabel>Monthly Rate</FieldLabel>
                  <input
                    type="number"
                    step="0.001"
                    value={config.philhealth.monthlyRate}
                    onChange={(event) =>
                      updatePhilHealthField("monthlyRate", event.target.value)
                    }
                    className={`mt-2 ${inputClassName}`}
                  />
                </label>

                <label className="block">
                  <FieldLabel>Employee Share Rate</FieldLabel>
                  <input
                    type="number"
                    step="0.001"
                    value={config.philhealth.employeeShareRate}
                    onChange={(event) =>
                      updatePhilHealthField("employeeShareRate", event.target.value)
                    }
                    className={`mt-2 ${inputClassName}`}
                  />
                </label>

                <label className="block">
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
                    className={`mt-2 ${inputClassName}`}
                  />
                </label>
              </div>
            </SectionCard>

            <SectionCard
              title="Pag-IBIG Rule"
              subtitle="Editable fixed employee share."
              action={
                <Toggle
                  checked={config.pagibig.enabled}
                  onChange={(event) => setSectionEnabled("pagibig", event.target.checked)}
                />
              }
            >
              <label className="block">
                <FieldLabel>Fixed Employee Share</FieldLabel>
                <input
                  type="number"
                  step="0.01"
                  value={config.pagibig.fixedEmployeeShare}
                  onChange={(event) =>
                    updatePagibigField("fixedEmployeeShare", event.target.value)
                  }
                  className={`mt-2 ${inputClassName}`}
                />
              </label>
            </SectionCard>
          </section>

          <SectionCard
            title="Withholding Tax Table"
            subtitle="Semi-monthly withholding tax brackets."
            action={
              <Toggle
                checked={config.withholdingTax.enabled}
                onChange={(event) =>
                  setSectionEnabled("withholdingTax", event.target.checked)
                }
              />
            }
          >
            <div className="overflow-x-auto rounded-xl border border-[#d9e3d5]">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f0f4ec] text-[#395345]">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold">Bracket Label</th>
                    <th className="px-3 py-3 text-left font-semibold">Min</th>
                    <th className="px-3 py-3 text-left font-semibold">Max</th>
                    <th className="px-3 py-3 text-left font-semibold">Base Tax</th>
                    <th className="px-3 py-3 text-left font-semibold">Excess Over</th>
                    <th className="px-3 py-3 text-left font-semibold">Rate</th>
                    <th className="px-3 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {config.withholdingTax.table.map((row, index) => (
                    <tr key={index} className="border-t border-[#eef2ea] hover:bg-[#fbfcf8]">
                      <td className="px-3 py-2">
                        <input
                          value={row.bracket || ""}
                          onChange={(event) =>
                            updateTaxRow(index, "bracket", event.target.value)
                          }
                          className={`${compactInputClassName} min-w-[220px]`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.min}
                          onChange={(event) => updateTaxRow(index, "min", event.target.value)}
                          className={compactInputClassName}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.max ?? ""}
                          placeholder="No max"
                          onChange={(event) => updateTaxRow(index, "max", event.target.value)}
                          className={compactInputClassName}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={row.baseTax}
                          onChange={(event) =>
                            updateTaxRow(index, "baseTax", event.target.value)
                          }
                          className={compactInputClassName}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={row.excessOver}
                          onChange={(event) =>
                            updateTaxRow(index, "excessOver", event.target.value)
                          }
                          className={compactInputClassName}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.001"
                          value={row.rate}
                          onChange={(event) => updateTaxRow(index, "rate", event.target.value)}
                          className={compactInputClassName}
                        />
                      </td>
                      <td className="px-3 py-2">
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
                      <td colSpan={7} className="px-4 py-8 text-center text-[#6b7a6d]">
                        No withholding tax brackets yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <ActionButton type="button" variant="soft" onClick={addTaxRow} className="mt-4">
              Add Withholding Tax Bracket
            </ActionButton>
          </SectionCard>

          <div className="sticky bottom-4 flex flex-wrap justify-end gap-3 rounded-[24px] border border-[#d7decf] bg-white/95 p-4 shadow-lg backdrop-blur">
            <ActionButton type="button" variant="danger" onClick={resetConfig} disabled={saving}>
              Reset Defaults
            </ActionButton>

            <ActionButton type="button" onClick={saveConfig} disabled={saving}>
              {saving ? "Saving..." : "Save Deduction Settings"}
            </ActionButton>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

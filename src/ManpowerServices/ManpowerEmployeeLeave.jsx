import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManpowerEmployeeShell from "./ManpowerEmployeeShell";

const EMPLOYEE_LOGIN_ROUTE = "/manpower-employee-login";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const LEAVE_TYPES = [
  "Vacation Leave",
  "Sick Leave",
  "Emergency Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Bereavement Leave",
  "Other",
];

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

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeStatus(status) {
  return String(status || "PENDING").toUpperCase();
}

function StatusBadge({ status }) {
  const value = normalizeStatus(status);

  const className =
    value === "APPROVED"
      ? "border-[#b9d8bb] bg-[#edf8ee] text-[#25633c]"
      : value === "REJECTED"
      ? "border-[#efc9c9] bg-[#fff2f2] text-[#912f2f]"
      : "border-[#ead28d] bg-[#fff7df] text-[#7a5b0b]";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wide ${className}`}>
      {value}
    </span>
  );
}

function SummaryCard({ label, value, tone = "default" }) {
  const styles = {
    default: "border-white/15 bg-white text-[#315b42]",
    pending: "border-[#ead28d] bg-[#fff7df] text-[#7a5b0b]",
    approved: "border-[#b9d8bb] bg-[#edf8ee] text-[#25633c]",
    rejected: "border-[#efc9c9] bg-[#fff2f2] text-[#912f2f]",
  };

  return (
    <div className={`rounded-lg border p-5 shadow-sm ${styles[tone]}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] opacity-80">{label}</p>
      <p className="mt-2 text-[34px] font-black leading-none">{value}</p>
    </div>
  );
}

export default function ManpowerEmployeeLeave() {
  const navigate = useNavigate();

  const [token, setToken] = useState(getEmployeeToken());
  const [employee, setEmployee] = useState(getEmployeeUser());
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [message, setMessage] = useState({ success: "", error: "" });
  const [form, setForm] = useState({
    leaveType: "Vacation Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const fullName = useMemo(() => {
    return [
      employee?.firstName || "",
      employee?.middleName || "",
      employee?.lastName || "",
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }, [employee]);

  const displayName = fullName || "Employee Full Name";
  const displayEmail = employee?.companyEmail || employee?.email || "employeeemail@manpower.com";

  const summary = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter((item) => normalizeStatus(item.status) === "PENDING").length,
      approved: leaves.filter((item) => normalizeStatus(item.status) === "APPROVED").length,
      rejected: leaves.filter((item) => normalizeStatus(item.status) === "REJECTED").length,
    };
  }, [leaves]);

  function logout() {
    clearEmployeeSession();
    setToken("");
    setEmployee(null);
    navigate(EMPLOYEE_LOGIN_ROUTE, { replace: true });
  }

  async function loadProfile() {
    try {
      const res = await fetch(`${API_BASE}/manpower/employee/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load employee profile.");
      }

      setEmployee(data.employee || null);
      localStorage.setItem("manpowerEmployeeUser", JSON.stringify(data.employee || null));
    } catch (error) {
      setMessage({
        success: "",
        error: error?.message || "Failed to load employee profile.",
      });
    }
  }

  async function loadLeaves() {
    setLeaveLoading(true);

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/leaves`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load leave requests.");
      }

      setLeaves(Array.isArray(data.leaves) ? data.leaves : []);
    } catch (error) {
      setMessage({
        success: "",
        error: error?.message || "Failed to load leave requests.",
      });
    } finally {
      setLeaveLoading(false);
    }
  }

  async function initPage() {
    setLoading(true);
    await Promise.all([loadProfile(), loadLeaves()]);
    setLoading(false);
  }

  useEffect(() => {
    if (!token) {
      navigate(EMPLOYEE_LOGIN_ROUTE, { replace: true });
      return;
    }

    initPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  async function submitLeave(event) {
    event.preventDefault();

    setMessage({ success: "", error: "" });

    if (!form.startDate) {
      setMessage({ success: "", error: "Please select a start date." });
      return;
    }

    if (!form.endDate) {
      setMessage({ success: "", error: "Please select an end date." });
      return;
    }

    if (new Date(form.endDate).getTime() < new Date(form.startDate).getTime()) {
      setMessage({ success: "", error: "End date must not be earlier than start date." });
      return;
    }

    if (!form.reason.trim() || form.reason.trim().length < 5) {
      setMessage({
        success: "",
        error: "Please enter a reason with at least 5 characters.",
      });
      return;
    }

    setLeaveLoading(true);

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/leaves`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaveType: form.leaveType,
          startDate: form.startDate,
          endDate: form.endDate,
          reason: form.reason.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit leave request.");
      }

      setMessage({
        success: data?.message || "Leave request submitted successfully.",
        error: "",
      });

      setForm({
        leaveType: "Vacation Leave",
        startDate: "",
        endDate: "",
        reason: "",
      });

      await loadLeaves();
    } catch (error) {
      setMessage({
        success: "",
        error: error?.message || "Failed to submit leave request.",
      });
    } finally {
      setLeaveLoading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-[#315b42] outline-none ring-0 placeholder:text-[#67776d] focus:border-[#d9e2d5]";

  return (
    <ManpowerEmployeeShell active="leave">
      <section className="bg-[#0f3a1e]">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h1 className="text-[28px] font-black uppercase leading-none text-white sm:text-[34px]">
                File Leave Request
              </h1>
              <p className="mt-1 text-[13px] font-bold text-white">
                {displayName} • {displayEmail}
              </p>
              <div className="mt-3 h-[2px] w-[420px] max-w-full bg-white/45" />
            </div>

            <button
              type="button"
              onClick={loadLeaves}
              disabled={leaveLoading}
              className="h-[34px] min-w-[145px] rounded-full border-2 border-white bg-white px-6 text-[12px] font-black uppercase tracking-wide text-[#315b42] shadow-[0_2px_0_rgba(0,0,0,0.35)] transition hover:bg-[#e7eee3] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {leaveLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <section className="mt-7 rounded-lg bg-[#294f35] p-7">
              <div className="rounded-lg bg-white px-5 py-8 text-center text-[13px] font-semibold text-[#52695a]">
                Loading leave page...
              </div>
            </section>
          ) : (
            <div className="mt-7 space-y-7">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard label="Total" value={summary.total} />
                <SummaryCard label="Pending" value={summary.pending} tone="pending" />
                <SummaryCard label="Approved" value={summary.approved} tone="approved" />
                <SummaryCard label="Rejected" value={summary.rejected} tone="rejected" />
              </div>

              {message.success && (
                <div className="rounded-lg border border-[#b9d8bb] bg-[#edf8ee] px-5 py-4 text-sm font-semibold text-[#25633c]">
                  {message.success}
                </div>
              )}

              {message.error && (
                <div className="rounded-lg border border-[#efc9c9] bg-[#fff2f2] px-5 py-4 text-sm font-semibold text-[#912f2f]">
                  {message.error}
                </div>
              )}

              <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr]">
                <form
                  onSubmit={submitLeave}
                  className="rounded-lg bg-[#294f35] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.18)] sm:p-7"
                >
                  <h2 className="text-[24px] font-black text-white">New Leave Request</h2>
                  <p className="mt-1 text-[13px] font-semibold text-white/80">
                    Complete the form below. HR will review your request.
                  </p>

                  <div className="mt-6 grid gap-4">
                    <label className="text-sm font-black text-white">
                      Leave Type
                      <select
                        value={form.leaveType}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            leaveType: event.target.value,
                          }))
                        }
                        className={inputClass}
                      >
                        {LEAVE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-sm font-black text-white">
                        Start Date
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              startDate: event.target.value,
                            }))
                          }
                          className={inputClass}
                          required
                        />
                      </label>

                      <label className="text-sm font-black text-white">
                        End Date
                        <input
                          type="date"
                          value={form.endDate}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              endDate: event.target.value,
                            }))
                          }
                          className={inputClass}
                          required
                        />
                      </label>
                    </div>

                    <label className="text-sm font-black text-white">
                      Reason
                      <textarea
                        value={form.reason}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            reason: event.target.value,
                          }))
                        }
                        rows={6}
                        className={`${inputClass} resize-none`}
                        placeholder="Write your reason for leave..."
                        required
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={leaveLoading}
                      className="rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-wide text-[#315b42] transition hover:bg-[#e7eee3] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {leaveLoading ? "Submitting..." : "Submit Leave Request"}
                    </button>
                  </div>
                </form>

                <section className="overflow-hidden rounded-lg bg-[#294f35] shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
                  <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-[24px] font-black text-white">My Leave History</h2>
                      <p className="mt-1 text-[13px] font-semibold text-white/80">
                        Track pending, approved, and rejected leave requests.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto p-4">
                    <table className="min-w-full overflow-hidden rounded-lg text-left text-sm">
                      <thead className="bg-[#f3f6f1] text-[#315b42]">
                        <tr>
                          <th className="px-4 py-3 font-black">Type</th>
                          <th className="px-4 py-3 font-black">Dates</th>
                          <th className="px-4 py-3 font-black">Days</th>
                          <th className="px-4 py-3 font-black">Status</th>
                          <th className="px-4 py-3 font-black">HR Remarks</th>
                          <th className="px-4 py-3 font-black">Filed</th>
                        </tr>
                      </thead>

                      <tbody className="bg-white">
                        {leaves.map((row) => (
                          <tr key={row._id} className="border-t border-[#e7eee3] align-top">
                            <td className="px-4 py-3 font-black text-[#315b42]">
                              {row.leaveType || "-"}
                            </td>
                            <td className="px-4 py-3 font-semibold text-[#34483b]">
                              {formatDate(row.startDate)} - {formatDate(row.endDate)}
                            </td>
                            <td className="px-4 py-3 font-semibold text-[#34483b]">
                              {row.totalDays || 0}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={row.status} />
                            </td>
                            <td className="max-w-[260px] px-4 py-3 font-semibold text-[#5f6f61]">
                              {row.hrRemarks || "-"}
                            </td>
                            <td className="px-4 py-3 font-semibold text-[#5f6f61]">
                              {formatDateTime(row.createdAt)}
                            </td>
                          </tr>
                        ))}

                        {!leaveLoading && leaves.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-10 text-center font-semibold text-[#6b7a6d]">
                              No leave requests yet.
                            </td>
                          </tr>
                        )}

                        {leaveLoading && (
                          <tr>
                            <td colSpan={6} className="px-4 py-10 text-center font-semibold text-[#6b7a6d]">
                              Loading leave requests...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </section>
    </ManpowerEmployeeShell>
  );
}

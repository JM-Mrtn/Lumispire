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

function formatCount(value) {
  return String(value || 0).padStart(2, "0");
}

function getEmployeeName(row) {
  return (
    row?.employeeName ||
    row?.fullName ||
    [row?.firstName, row?.middleName, row?.lastName]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() ||
    "Full name"
  );
}

function normalizeStatus(status) {
  return String(status || "PENDING").toUpperCase();
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

function SummaryCard({ title, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border-[3px] border-[#718575] bg-[#456650] px-4 py-3 text-left text-white shadow-sm transition hover:bg-[#506f5a]"
    >
      <h3 className="text-[15px] font-black uppercase leading-tight">
        {title}
      </h3>
      <p className="mt-3 text-center text-[32px] font-black leading-none">
        {formatCount(value)}
      </p>
    </button>
  );
}

function StatusBadge({ status }) {
  const value = normalizeStatus(status);

  const className =
    value === "APPROVED"
      ? "bg-[#bdf0a8] text-[#244b35]"
      : value === "REJECTED"
      ? "bg-[#f4c8c8] text-[#7c3232]"
      : "bg-[#fff0ba] text-[#73520d]";

  return (
    <span
      className={`inline-flex justify-center rounded-full px-3 py-1 text-[11px] font-black ${className}`}
    >
      {value}
    </span>
  );
}

export default function ManpowerHrLeaves() {
  const navigate = useNavigate();

  const [token, setToken] = useState(getHrToken());
  const [hrUser] = useState(getHrUser());

  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [hrRemarks, setHrRemarks] = useState("");

  const [message, setMessage] = useState({
    success: "",
    error: "",
  });

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

  async function loadLeaves() {
    setLoading(true);

    setMessage((prev) => ({
      ...prev,
      error: "",
    }));

    try {
      const params = new URLSearchParams();

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const query = params.toString();

      const url = query
        ? `${API_BASE}/manpower/hr/leaves?${query}`
        : `${API_BASE}/manpower/hr/leaves`;

      const res = await fetch(url, {
        headers: hrHeaders(),
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
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      navigate("/manpower-hr-login", { replace: true });
      return;
    }

    loadLeaves();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate, statusFilter]);

  const filteredLeaves = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return leaves;

    return leaves.filter((row) => {
      const haystack = [
        getEmployeeName(row),
        row.companyEmail,
        row.contactNo,
        row.vacancy,
        row.job,
        row.deploymentSite,
        row.leaveType,
        row.reason,
        row.status,
        row.hrRemarks,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [leaves, search]);

  const summary = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter((item) => normalizeStatus(item.status) === "PENDING")
        .length,
      approved: leaves.filter((item) => normalizeStatus(item.status) === "APPROVED")
        .length,
      rejected: leaves.filter((item) => normalizeStatus(item.status) === "REJECTED")
        .length,
    };
  }, [leaves]);

  function openReviewModal(leave) {
    setSelectedLeave(leave);
    setHrRemarks(leave?.hrRemarks || "");

    setMessage({
      success: "",
      error: "",
    });
  }

  function closeReviewModal() {
    setSelectedLeave(null);
    setHrRemarks("");
  }

  async function reviewLeave(action) {
    if (!selectedLeave?._id) return;

    const normalizedAction = String(action || "").toLowerCase();

    if (!["approve", "reject"].includes(normalizedAction)) return;

    if (normalizedAction === "reject" && hrRemarks.trim().length < 3) {
      setMessage({
        success: "",
        error: "Please enter HR remarks before rejecting the leave request.",
      });
      return;
    }

    setActionLoading(true);

    setMessage({
      success: "",
      error: "",
    });

    try {
      const res = await fetch(
        `${API_BASE}/manpower/hr/leaves/${selectedLeave._id}/${normalizedAction}`,
        {
          method: "PATCH",
          headers: {
            ...hrHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hrRemarks: hrRemarks.trim(),
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(
          data?.message || `Failed to ${normalizedAction} leave request.`
        );
      }

      closeReviewModal();
      await loadLeaves();

      setMessage({
        success: data?.message || "Leave request updated successfully.",
        error: "",
      });
    } catch (error) {
      setMessage({
        success: "",
        error: error?.message || `Failed to ${normalizedAction} leave request.`,
      });
    } finally {
      setActionLoading(false);
    }
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

              <SidebarButton onClick={() => navigate("/manpower-hr-payroll")}>
                Manage Payroll
              </SidebarButton>

              <SidebarButton active onClick={() => navigate("/manpower-hr-leaves")}>
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
              Manage File Leave
            </h1>
            <div className="mt-2 h-[4px] w-[345px] max-w-full bg-white/65" />
          </section>

          <section className="mt-6 grid max-w-[760px] gap-7 sm:grid-cols-3">
            <SummaryCard
              title="Total Leave"
              value={summary.total}
              onClick={() => setStatusFilter("")}
            />

            <SummaryCard
              title="Pending Approval"
              value={summary.pending}
              onClick={() => setStatusFilter("PENDING")}
            />

            <SummaryCard
              title="Total Rejected"
              value={summary.rejected}
              onClick={() => setStatusFilter("REJECTED")}
            />
          </section>

          <section className="mt-12 overflow-hidden rounded-lg bg-[#294f35]">
            <div className="flex flex-col gap-4 rounded-t-lg bg-white px-4 py-4 text-[#294f35] lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-[18px] font-black">List of Employee</h2>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search Employee"
                  className="h-[26px] w-full rounded-full border border-[#aab5aa] bg-white px-4 text-[13px] font-semibold text-[#294f35] outline-none sm:w-[270px]"
                />

                <button
                  type="button"
                  onClick={loadLeaves}
                  disabled={loading}
                  className="h-[26px] min-w-[110px] rounded-full bg-[#174322] px-5 text-[12px] font-black text-white transition hover:bg-[#0f3319] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
              </div>
            </div>

            {message.success ? (
              <div className="border-b border-white/10 bg-[#203f2b] px-4 py-2 text-[12px] font-semibold text-white/85">
                {message.success}
              </div>
            ) : null}

            {message.error ? (
              <div className="border-b border-red-300/30 bg-[#4b2424] px-4 py-2 text-[12px] font-semibold text-red-100">
                {message.error}
              </div>
            ) : null}

            <div className="min-h-[380px]">
              {filteredLeaves.length ? (
                filteredLeaves.map((leave) => (
                  <div
                    key={leave._id}
                    className="grid gap-4 border-b border-white/25 px-4 py-5 text-white md:grid-cols-[64px_1.25fr_1.45fr_0.8fr_1fr_0.75fr_0.75fr] md:items-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[15px] font-black text-[#315b42]">
                      {getEmployeeName(leave).charAt(0).toUpperCase()}
                    </div>

                    <p className="text-[16px] font-black">
                      {getEmployeeName(leave)}
                    </p>

                    <p className="break-all text-[15px] font-black">
                      {leave.companyEmail ||
                        leave.email ||
                        "traineeemail@tamsi.com"}
                    </p>

                    <p className="text-[16px] font-black">
                      {leave.vacancy || leave.job || "Job"}
                    </p>

                    <p className="text-[16px] font-black">
                      {leave.deploymentSite || leave.deployment || "-"}
                    </p>

                    <div>
                      <StatusBadge status={leave.status} />
                    </div>

                    <div className="flex justify-start md:justify-end">
                      <button
                        type="button"
                        onClick={() => openReviewModal(leave)}
                        className="min-w-[86px] rounded-full bg-white px-4 py-1 text-[11px] font-black text-[#294f35] transition hover:bg-[#e7eee3]"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-14 text-center text-[14px] font-semibold text-white/80">
                  {loading ? "Loading leave requests..." : "No leave requests found."}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {selectedLeave ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[24px] bg-white p-6 text-[#24352c] shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-[#24352c]">
                  Review Leave Request
                </h3>

                <p className="mt-1 text-sm font-semibold text-[#6b7a6d]">
                  {getEmployeeName(selectedLeave)} ·{" "}
                  {selectedLeave.leaveType || "Leave"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                className="rounded-full bg-[#eef3ea] px-4 py-2 text-sm font-black text-[#395345]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 rounded-2xl bg-[#f7faf5] p-4 text-sm text-[#395345] md:grid-cols-2">
              <p>
                <span className="font-black">Employee:</span>{" "}
                {getEmployeeName(selectedLeave)}
              </p>

              <p>
                <span className="font-black">Email:</span>{" "}
                {selectedLeave.companyEmail || "-"}
              </p>

              <p>
                <span className="font-black">Contact:</span>{" "}
                {selectedLeave.contactNo || "-"}
              </p>

              <p>
                <span className="font-black">Job:</span>{" "}
                {selectedLeave.vacancy || selectedLeave.job || "-"}
              </p>

              <p>
                <span className="font-black">Deployment:</span>{" "}
                {selectedLeave.deploymentSite || selectedLeave.deployment || "-"}
              </p>

              <p>
                <span className="font-black">Leave Type:</span>{" "}
                {selectedLeave.leaveType || "-"}
              </p>

              <p>
                <span className="font-black">Status:</span>{" "}
                <StatusBadge status={selectedLeave.status} />
              </p>

              <p>
                <span className="font-black">Dates:</span>{" "}
                {formatDate(selectedLeave.startDate)} -{" "}
                {formatDate(selectedLeave.endDate)}
              </p>

              <p>
                <span className="font-black">Total Days:</span>{" "}
                {selectedLeave.totalDays || 0}
              </p>

              <p>
                <span className="font-black">Filed:</span>{" "}
                {formatDateTime(selectedLeave.createdAt)}
              </p>

              <p className="md:col-span-2">
                <span className="font-black">Reason:</span>{" "}
                {selectedLeave.reason || "-"}
              </p>

              {selectedLeave.reviewedBy ? (
                <p>
                  <span className="font-black">Reviewed By:</span>{" "}
                  {selectedLeave.reviewedBy}
                </p>
              ) : null}

              {selectedLeave.reviewedAt ? (
                <p>
                  <span className="font-black">Reviewed At:</span>{" "}
                  {formatDateTime(selectedLeave.reviewedAt)}
                </p>
              ) : null}
            </div>

            <label className="mt-5 block text-sm font-black text-[#395345]">
              HR Remarks
              <textarea
                value={hrRemarks}
                onChange={(event) => setHrRemarks(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-[14px] border border-[#cbd8c5] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
                placeholder="Add approval or rejection remarks..."
              />
            </label>

            {message.error ? (
              <div className="mt-4 rounded-[14px] border border-[#efc9c9] bg-[#fff2f2] px-4 py-3 text-sm font-semibold text-[#912f2f]">
                {message.error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end">
              <button
                type="button"
                disabled={actionLoading || normalizeStatus(selectedLeave.status) !== "PENDING"}
                onClick={() => reviewLeave("reject")}
                className="rounded-full bg-[#eae1e1] px-6 py-3 text-sm font-black text-[#7c3232] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? "Saving..." : "Reject"}
              </button>

              <button
                type="button"
                disabled={actionLoading || normalizeStatus(selectedLeave.status) !== "PENDING"}
                onClick={() => reviewLeave("approve")}
                className="rounded-full bg-[#395345] px-6 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? "Saving..." : "Approve"}
              </button>
            </div>

            {normalizeStatus(selectedLeave.status) !== "PENDING" ? (
              <p className="mt-3 text-right text-xs font-semibold text-[#7a5b0b]">
                This leave request was already reviewed.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
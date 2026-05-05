import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ActionButton,
  AdminShell,
  FieldLabel,
  SectionCard,
  StatCard,
  StatusPill,
  compactInputClassName,
  inputClassName,
} from "./ManpowerAdminShell";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const emptyForm = {
  title: "",
  active: true,
};

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

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
}

export default function ManpowerAdminJobs() {
  const navigate = useNavigate();

  const [token, setToken] = useState(getAdminToken());
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);

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

    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, search, status, navigate]);

  async function loadJobs() {
    try {
      setLoading(true);

      const query = new URLSearchParams();

      if (search.trim()) query.set("search", search.trim());
      if (status) query.set("status", status);

      const url = query.toString()
        ? `${API_BASE}/manpower/admin/jobs?${query.toString()}`
        : `${API_BASE}/manpower/admin/jobs`;

      const res = await fetch(url, {
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load job vacancies.");
      }

      setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
    } catch (error) {
      alert(error?.message || "Failed to load job vacancies.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingJob(null);
    setForm(emptyForm);
  }

  function startEdit(job) {
    setEditingJob(job);

    setForm({
      title: job.title || "",
      active: job.active !== false,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitJob(event) {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: "",
        qualifications: [],
        active: Boolean(form.active),
      };

      const url = editingJob
        ? `${API_BASE}/manpower/admin/jobs/${editingJob._id}`
        : `${API_BASE}/manpower/admin/jobs`;

      const res = await fetch(url, {
        method: editingJob ? "PUT" : "POST",
        headers: {
          ...adminHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save job vacancy.");
      }

      alert(data?.message || "Job vacancy saved successfully.");
      resetForm();
      await loadJobs();
    } catch (error) {
      alert(error?.message || "Failed to save job vacancy.");
    } finally {
      setSaving(false);
    }
  }

  async function updateJobStatus(job, active) {
    const confirmed = window.confirm(
      active ? `Activate ${job.title}?` : `Deactivate ${job.title}?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/manpower/admin/jobs/${job._id}/status`, {
        method: "PATCH",
        headers: {
          ...adminHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update job status.");
      }

      await loadJobs();
    } catch (error) {
      alert(error?.message || "Failed to update job status.");
    }
  }

  async function deleteJob(job) {
    const confirmed = window.confirm(
      `Delete ${job.title}?\n\nIf this job already has applicants, it will be deactivated instead.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/manpower/admin/jobs/${job._id}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete job vacancy.");
      }

      alert(data?.message || "Job vacancy deleted successfully.");
      await loadJobs();
    } catch (error) {
      alert(error?.message || "Failed to delete job vacancy.");
    }
  }

  const summary = useMemo(() => {
    return {
      total: jobs.length,
      active: jobs.filter((job) => job.active !== false).length,
      inactive: jobs.filter((job) => job.active === false).length,
    };
  }, [jobs]);

  return (
    <AdminShell
      current="jobs"
      title="Job Vacancy Management"
      subtitle="Add, edit, deactivate, or delete manpower job offers shown to applicants."
      onLogout={logout}
    >
      <div className="space-y-6">
        <section className="grid gap-5 md:grid-cols-3">
          <StatCard title="Total Jobs" value={summary.total} subtitle="All stored vacancies" />
          <StatCard
            title="Active Jobs"
            value={summary.active}
            subtitle="Visible to applicants"
            tone="success"
          />
          <StatCard
            title="Inactive Jobs"
            value={summary.inactive}
            subtitle="Hidden or disabled vacancies"
            tone="danger"
          />
        </section>

        <SectionCard
          title={editingJob ? "Edit Job Vacancy" : "Add New Job Vacancy"}
          subtitle="These jobs will appear on the applicant side automatically."
        >
          <form onSubmit={submitJob} className="grid gap-4">
            <label className="block">
              <FieldLabel>Job Title</FieldLabel>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                className={`mt-2 ${inputClassName}`}
                placeholder="Example: Security Guard"
                required
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-[#d7decf] bg-[#f7faf5] px-4 py-3 text-sm font-semibold text-[#395345]">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    active: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[#395345]"
              />
              Active job vacancy
            </label>

            <div className="flex flex-wrap justify-end gap-2">
              {editingJob ? (
                <ActionButton type="button" variant="ghost" onClick={resetForm}>
                  Cancel Edit
                </ActionButton>
              ) : null}

              <ActionButton type="submit" disabled={saving}>
                {saving ? "Saving..." : editingJob ? "Update Job" : "Add Job"}
              </ActionButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Job Vacancy List"
          subtitle="Manage all database-stored job offers."
          action={
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={compactInputClassName}
                placeholder="Search job..."
              />

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={compactInputClassName}
              >
                <option value="">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          }
        >
          <div className="overflow-x-auto rounded-xl border border-[#d9e3d5]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f0f4ec] text-[#395345]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Job Title</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job._id}
                    className="border-t border-[#eef2ea] hover:bg-[#fbfcf8]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#24352c]">{job.title}</div>
                    </td>

                    <td className="px-4 py-3">
                      <StatusPill tone={job.active ? "success" : "danger"}>
                        {job.active ? "Active" : "Inactive"}
                      </StatusPill>
                    </td>

                    <td className="px-4 py-3 text-[#5f6f61]">
                      {formatDateTime(job.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <ActionButton size="sm" variant="soft" onClick={() => startEdit(job)}>
                          Edit
                        </ActionButton>

                        {job.active ? (
                          <ActionButton
                            size="sm"
                            variant="warning"
                            onClick={() => updateJobStatus(job, false)}
                          >
                            Deactivate
                          </ActionButton>
                        ) : (
                          <ActionButton
                            size="sm"
                            variant="success"
                            onClick={() => updateJobStatus(job, true)}
                          >
                            Activate
                          </ActionButton>
                        )}

                        <ActionButton size="sm" variant="danger" onClick={() => deleteJob(job)}>
                          Delete
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}

                {!jobs.length ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-[#6b7a6d]">
                      {loading ? "Loading jobs..." : "No job vacancies found."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </AdminShell>
  );
}

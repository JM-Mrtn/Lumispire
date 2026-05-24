import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ActionButton,
  AdminShell,
  FieldLabel,
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
const API_ORIGIN = API_BASE.replace(/\/api$/i, "");

const emptyForm = {
  title: "",
  description: "",
  qualifications: "",
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

function resolveImageSource(value = "") {
  const raw = String(value || "").trim();

  if (!raw) return "";

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  if (raw.startsWith("/api/")) {
    return `${API_ORIGIN}${raw}`;
  }

  if (raw.startsWith("/manpower/files/")) {
    return `${API_BASE}${raw}`;
  }

  return raw;
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
        <p className={`mt-4 text-4xl font-black leading-none tracking-tight ${toneClass.split(" ")[0]}`}>
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

function DashboardSectionCard({ eyebrow, title, subtitle, action, children }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#f4d484]/20 blur-2xl" />
      <div className="relative overflow-hidden border-b border-black/5 bg-[#082719] px-6 py-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,212,132,0.24),transparent_34%),linear-gradient(135deg,rgba(35,95,62,0.96),rgba(8,39,25,1))]" />
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#f4d484]/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#f4d484]">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
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

function InfoChip({ label, value, tone = "default" }) {
  const toneMap = {
    default: "bg-white/10 text-white border-white/15",
    gold: "bg-[#f4d484]/15 text-[#f4d484] border-[#f4d484]/20",
    green: "bg-[#17663b]/20 text-[#d8f5e5] border-white/15",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-center backdrop-blur ${toneMap[tone] || toneMap.default}`}>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

export default function ManpowerAdminJobs() {
  const navigate = useNavigate();
  const previewObjectUrlRef = useRef("");

  const [token, setToken] = useState(getAdminToken());
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");

  function logout() {
    clearAdminSession();
    setToken("");
    navigate("/manpower-admin-login", { replace: true });
  }

  function revokePreviewUrl() {
    if (previewObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      } catch {
        // ignore cleanup error
      }

      previewObjectUrlRef.current = "";
    }
  }

  useEffect(() => {
    return () => {
      revokePreviewUrl();
    };
  }, []);

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
    revokePreviewUrl();
    setEditingJob(null);
    setForm(emptyForm);
    setImageFile(null);
    setPreviewUrl("");
    setImageInputKey((current) => current + 1);
  }

  function startEdit(job) {
    revokePreviewUrl();
    setEditingJob(job);

    setForm({
      title: job.title || "",
      description: job.description || "",
      qualifications: Array.isArray(job.qualifications)
        ? job.qualifications.join("\n")
        : "",
      active: job.active !== false,
    });

    setImageFile(null);
    setPreviewUrl(resolveImageSource(job.imageUrl));
    setImageInputKey((current) => current + 1);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;

    revokePreviewUrl();

    if (!file) {
      setImageFile(null);
      setPreviewUrl(editingJob ? resolveImageSource(editingJob.imageUrl) : "");
      return;
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowed.includes(String(file.type || "").toLowerCase())) {
      alert("Please upload JPG, JPEG, PNG, or WEBP only.");
      setImageFile(null);
      setPreviewUrl(editingJob ? resolveImageSource(editingJob.imageUrl) : "");
      setImageInputKey((current) => current + 1);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;

    setImageFile(file);
    setPreviewUrl(objectUrl);
  }

  async function submitJob(event) {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("qualifications", form.qualifications.trim());
      payload.append("active", String(Boolean(form.active)));

      if (imageFile) {
        payload.append("image", imageFile);
      }

      const url = editingJob
        ? `${API_BASE}/manpower/admin/jobs/${editingJob._id}`
        : `${API_BASE}/manpower/admin/jobs`;

      const res = await fetch(url, {
        method: editingJob ? "PUT" : "POST",
        headers: adminHeaders(),
        body: payload,
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
      const res = await fetch(
        `${API_BASE}/manpower/admin/jobs/${job._id}/status`,
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

      if (editingJob?._id === job._id) {
        resetForm();
      }

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
                Job Vacancy Management
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">
               
              </p>
            </div>

            <button
              type="button"
              onClick={loadJobs}
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-extrabold text-[#082719] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#f4d484]"
            >
              Refresh Jobs
            </button>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <DashboardStatCard
            title="Total Jobs"
            value={summary.total}
            subtitle="All stored vacancies"
          />
          <DashboardStatCard
            title="Active Jobs"
            value={summary.active}
            subtitle="Visible to applicants"
            tone="success"
          />
          <DashboardStatCard
            title="Inactive Jobs"
            value={summary.inactive}
            subtitle="Hidden or disabled vacancies"
            tone="danger"
          />
        </section>

        <DashboardSectionCard
          eyebrow="Job Form"
          title={editingJob ? "Edit Job Vacancy" : "Add New Job Vacancy"}
      
          action={
            editingJob ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-extrabold text-[#082719] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#f4d484]"
              >
                Cancel Edit
              </button>
            ) : null
          }
        >
          <form onSubmit={submitJob} className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[28px] border border-[#dce8dc] bg-[#f8fbf6] p-5 shadow-[0_12px_30px_rgba(8,39,25,0.06)]">
                <div className="grid gap-4">
                  <label className="block">
                    <FieldLabel>Job Title</FieldLabel>
                    <input
                      value={form.title}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      className={`mt-2 ${inputClassName}`}
                      placeholder="Example: Security Guard"
                      required
                    />
                  </label>

                  <label className="block">
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      className={`mt-2 min-h-[130px] ${inputClassName}`}
                      placeholder="Describe the job responsibilities and work details."
                    />
                  </label>

                  <label className="block">
                    <FieldLabel>Qualifications</FieldLabel>
                    <textarea
                      value={form.qualifications}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          qualifications: event.target.value,
                        }))
                      }
                      className={`mt-2 min-h-[110px] ${inputClassName}`}
                      placeholder={`One qualification per line\nExample:\nAt least high school graduate\nWith related experience\nWilling to work shifting schedules`}
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-[#d7decf] bg-white px-4 py-3 text-sm font-bold text-[#395345] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
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
                </div>
              </div>

              <div className="rounded-[28px] border border-[#dce8dc] bg-white p-5 shadow-[0_12px_30px_rgba(8,39,25,0.06)]">
                <FieldLabel>
                  Job Photo {editingJob ? "(optional change)" : ""}
                </FieldLabel>

                <div className="mt-2 overflow-hidden rounded-[24px] border border-[#d7decf] bg-[#f7faf5] shadow-inner">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Job preview"
                      className="h-[265px] w-full object-cover transition duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-[265px] items-center justify-center px-5 text-center text-sm font-semibold text-[#6b7a6d]">
                      Upload a job photo to show it on the public Job Offer page.
                    </div>
                  )}
                </div>

                <input
                  key={imageInputKey}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="mt-4 block w-full text-sm font-semibold text-[#395345] file:mr-4 file:rounded-full file:border-0 file:bg-[#082719] file:px-5 file:py-2.5 file:text-sm file:font-extrabold file:text-white hover:file:bg-[#2f754c]"
                />

                <p className="mt-3 text-xs font-semibold leading-5 text-[#6b7a6d]">
                  Accepted files: JPG, JPEG, PNG, WEBP.
                </p>
              </div>
            </div>

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
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow="Vacancy Records"
          title="Job Vacancy List"
          
          action={
            <div className="grid min-w-[280px] gap-2 sm:grid-cols-2 lg:min-w-[440px]">
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
          <div className="overflow-hidden rounded-[30px] border border-[#dce8dc] bg-[#f7faf6] shadow-[0_18px_45px_rgba(8,39,25,0.08)]">
            <div className="relative overflow-hidden bg-[#082719] px-6 py-6 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,212,132,0.24),transparent_34%),linear-gradient(135deg,rgba(35,95,62,0.96),rgba(8,39,25,1))]" />
              <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#f4d484]/20 blur-3xl" />
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#f4d484]">
                    Detailed Job Breakdown
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                    Vacancy Publishing Summary
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
                    
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
                  <InfoChip label="Total" value={summary.total} />
                  <InfoChip label="Active" value={summary.active} tone="gold" />
                  <InfoChip label="Inactive" value={summary.inactive} tone="green" />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="overflow-hidden rounded-[24px] border border-[#dce8dc] bg-white shadow-[0_12px_30px_rgba(8,39,25,0.07)]">
                <div className="hidden grid-cols-[0.85fr_2fr_0.75fr_1fr_1.35fr] gap-4 border-b border-[#e7eee6] bg-[#eef5ee] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#5d7163] lg:grid">
                  <span>Photo</span>
                  <span>Job Details</span>
                  <span>Status</span>
                  <span>Created</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y divide-[#edf2eb]">
                  {jobs.map((job) => (
                    <article
                      key={job._id}
                      className="group grid gap-4 px-5 py-5 transition duration-300 hover:bg-[#f8fbf6] lg:grid-cols-[0.85fr_2fr_0.75fr_1fr_1.35fr] lg:items-center"
                    >
                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] lg:hidden">
                          Photo
                        </p>
                        <div className="h-24 w-full overflow-hidden rounded-2xl bg-[#eef3ea] shadow-sm lg:h-20 lg:w-28">
                          {job.imageUrl ? (
                            <img
                              src={resolveImageSource(job.imageUrl)}
                              alt={job.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs font-bold text-[#6b7a6d]">
                              No photo
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] lg:hidden">
                          Job Details
                        </p>
                        <h4 className="text-base font-black text-[#071f14] transition duration-300 group-hover:translate-x-1">
                          {job.title}
                        </h4>

                        <p className="mt-1 line-clamp-2 max-w-xl text-xs font-semibold leading-5 text-[#5f6f61]">
                          {job.description || "No description added."}
                        </p>

                        {Array.isArray(job.qualifications) && job.qualifications.length ? (
                          <p className="mt-2 inline-flex rounded-full bg-[#eef4ef] px-3 py-1 text-xs font-black text-[#395345]">
                            {job.qualifications.length} qualification{job.qualifications.length > 1 ? "s" : ""}
                          </p>
                        ) : (
                          <p className="mt-2 text-xs font-semibold text-[#9aa79b]">
                            No qualifications added.
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] lg:hidden">
                          Status
                        </p>
                        <StatusPill tone={job.active ? "success" : "danger"}>
                          {job.active ? "Active" : "Inactive"}
                        </StatusPill>
                      </div>

                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] lg:hidden">
                          Created
                        </p>
                        <p className="text-sm font-semibold leading-6 text-[#5f6f61]">
                          {formatDateTime(job.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] lg:hidden">
                          Actions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <ActionButton size="sm" variant="soft" onClick={() => startEdit(job)}>
                            Edit
                          </ActionButton>

                          {job.active ? (
                            <ActionButton size="sm" variant="warning" onClick={() => updateJobStatus(job, false)}>
                              Deactivate
                            </ActionButton>
                          ) : (
                            <ActionButton size="sm" variant="success" onClick={() => updateJobStatus(job, true)}>
                              Activate
                            </ActionButton>
                          )}

                          <ActionButton size="sm" variant="danger" onClick={() => deleteJob(job)}>
                            Delete
                          </ActionButton>
                        </div>
                      </div>
                    </article>
                  ))}

                  {!jobs.length ? (
                    <div className="px-5 py-14 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef4ef] text-2xl">
                        💼
                      </div>
                      <p className="mt-4 text-sm font-black text-[#071f14]">
                        {loading ? "Loading jobs..." : "No job vacancies found."}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#071f14]/50">
                        Job vacancy data will appear here once records are available.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </DashboardSectionCard>
      </div>
    </AdminShell>
  );
}
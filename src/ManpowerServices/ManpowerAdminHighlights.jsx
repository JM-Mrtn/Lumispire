import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ActionButton,
  AdminShell,
  FieldLabel,
  StatusPill,
  inputClassName,
} from "./ManpowerAdminShell";
import { API_BASE, manpowerUrl } from "./manpowerApi";

const API_ORIGIN = API_BASE.replace(/\/api$/i, "");
const HIGHLIGHTS_API = `${API_BASE}/manpower/highlights`;

const emptyForm = {
  title: "",
  subtitle: "",
  sortOrder: 0,
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
    return manpowerUrl(raw);
  }

  return raw;
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
}

function DashboardStatCard({ title, value, subtitle, tone = "default" }) {
  const toneMap = {
    default: {
      value: "text-[#071f14]",
      line: "from-[#235f3e] via-[#2f754c] to-[#d7a84d]",
    },
    success: {
      value: "text-[#17663b]",
      line: "from-[#17663b] via-[#2f754c] to-[#d7a84d]",
    },
    danger: {
      value: "text-[#8b3232]",
      line: "from-[#8b3232] via-[#b85d5d] to-[#f4d484]",
    },
    warning: {
      value: "text-[#b54708]",
      line: "from-[#b54708] via-[#d7a84d] to-[#f4d484]",
    },
  };

  const styles = toneMap[tone] || toneMap.default;

  return (
    <article className="group relative min-h-[138px] overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:border-[#235f3e]/30 hover:shadow-[0_28px_70px_rgba(8,39,25,0.16)]">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${styles.line}`} />
      <div className="absolute -right-12 -top-16 h-36 w-36 rounded-full bg-[#f4d484]/20 blur-2xl transition duration-300 group-hover:scale-125" />
      <div className="absolute -bottom-14 -left-14 h-32 w-32 rounded-full bg-[#235f3e]/10 blur-2xl transition duration-300 group-hover:scale-110" />
      <div className="relative">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
          {title}
        </p>
        <p className={`mt-4 text-4xl font-black leading-none tracking-tight ${styles.value}`}>
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
    <section className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5">
      <div className="manpower-dashboard-card-header px-5 py-6 sm:px-6 lg:px-7">
        <div className="manpower-dashboard-card-header-content flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#f4d484]">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
                {subtitle}
              </p>
            ) : null}
          </div>
          {action ? <div className="relative z-10">{action}</div> : null}
        </div>
      </div>
      <div className="relative p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function ManpowerAdminHighlights() {
  const navigate = useNavigate();
  const previewObjectUrlRef = useRef("");

  const [token, setToken] = useState(getAdminToken());
  const [highlights, setHighlights] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingHighlight, setEditingHighlight] = useState(null);
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
        // Ignore cleanup error.
      }

      previewObjectUrlRef.current = "";
    }
  }

  function resetForm() {
    revokePreviewUrl();
    setEditingHighlight(null);
    setForm(emptyForm);
    setImageFile(null);
    setPreviewUrl("");
    setImageInputKey((current) => current + 1);
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

    loadHighlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, search, status, navigate]);

  async function loadHighlights() {
    try {
      setLoading(true);

      const query = new URLSearchParams();

      if (search.trim()) query.set("search", search.trim());
      if (status) query.set("status", status);

      const url = query.toString()
        ? `${HIGHLIGHTS_API}?${query.toString()}`
        : HIGHLIGHTS_API;

      const res = await fetch(url, {
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load highlights.");
      }

      setHighlights(Array.isArray(data?.highlights) ? data.highlights : []);
    } catch (error) {
      alert(error?.message || "Failed to load highlights.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(highlight) {
    revokePreviewUrl();

    setEditingHighlight(highlight);
    setForm({
      title: highlight?.title || "",
      subtitle: highlight?.subtitle || "",
      sortOrder: Number(highlight?.sortOrder || 0),
      active: highlight?.active !== false,
    });
    setImageFile(null);
    setPreviewUrl(resolveImageSource(highlight?.imageUrl));
    setImageInputKey((current) => current + 1);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateFormField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: key === "sortOrder" ? Number(value) : value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;

    revokePreviewUrl();

    if (!file) {
      setImageFile(null);
      setPreviewUrl(
        editingHighlight ? resolveImageSource(editingHighlight.imageUrl) : ""
      );
      return;
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowed.includes(String(file.type || "").toLowerCase())) {
      alert("Please upload JPG, JPEG, PNG, or WEBP only.");
      setImageFile(null);
      setPreviewUrl(
        editingHighlight ? resolveImageSource(editingHighlight.imageUrl) : ""
      );
      setImageInputKey((current) => current + 1);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;

    setImageFile(file);
    setPreviewUrl(objectUrl);
  }

  async function submitHighlight(event) {
    event.preventDefault();

    if (!editingHighlight && !imageFile) {
      alert("Please upload a highlight image.");
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("subtitle", form.subtitle.trim());
      payload.append("sortOrder", String(Number(form.sortOrder || 0)));
      payload.append("active", String(Boolean(form.active)));

      if (imageFile) {
        payload.append("image", imageFile);
      }

      const url = editingHighlight
        ? `${HIGHLIGHTS_API}/${editingHighlight._id}`
        : HIGHLIGHTS_API;

      const res = await fetch(url, {
        method: editingHighlight ? "PUT" : "POST",
        headers: adminHeaders(),
        body: payload,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save highlight.");
      }

      alert(data?.message || "Highlight saved successfully.");
      resetForm();
      await loadHighlights();
    } catch (error) {
      alert(error?.message || "Failed to save highlight.");
    } finally {
      setSaving(false);
    }
  }

  async function updateHighlightStatus(highlight, active) {
    const confirmed = window.confirm(
      active
        ? `Activate "${highlight.title || "this highlight"}"?`
        : `Deactivate "${highlight.title || "this highlight"}"?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${HIGHLIGHTS_API}/${highlight._id}/status`, {
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
        throw new Error(data?.message || "Failed to update highlight status.");
      }

      await loadHighlights();
    } catch (error) {
      alert(error?.message || "Failed to update highlight status.");
    }
  }

  async function deleteHighlight(highlight) {
    const confirmed = window.confirm(
      `Delete "${
        highlight.title || "this highlight"
      }"?\n\nThis will also remove the uploaded image from storage.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${HIGHLIGHTS_API}/${highlight._id}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete highlight.");
      }

      alert(data?.message || "Highlight deleted successfully.");

      if (editingHighlight?._id === highlight._id) {
        resetForm();
      }

      await loadHighlights();
    } catch (error) {
      alert(error?.message || "Failed to delete highlight.");
    }
  }

  const summary = useMemo(() => {
    return {
      total: highlights.length,
      active: highlights.filter((item) => item.active !== false).length,
      inactive: highlights.filter((item) => item.active === false).length,
    };
  }, [highlights]);

  return (
    <AdminShell
      current="highlights"
      title="Manpower Highlight Management"
    
      onLogout={logout}
    >
      <style>{`
        @keyframes manpowerFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .manpower-highlights-animate {
          animation: manpowerFadeUp .58s ease both;
        }
        .manpower-dashboard-card-header {
          position: relative;
          overflow: hidden;
          background: #082719;
          color: white;
        }
        .manpower-dashboard-card-header::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at top right, rgba(244, 212, 132, .28), transparent 34%),
            linear-gradient(135deg, rgba(35, 95, 62, .98), rgba(8, 39, 25, 1));
        }
        .manpower-dashboard-card-header::after {
          content: "";
          position: absolute;
          right: -60px;
          top: -90px;
          width: 220px;
          height: 220px;
          border-radius: 999px;
          background: rgba(244, 212, 132, .18);
          filter: blur(28px);
        }
        .manpower-dashboard-card-header-content {
          position: relative;
          z-index: 1;
        }
        .manpower-highlight-control {
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
        }
        .manpower-highlight-control:focus,
        .manpower-highlight-control:focus-visible {
          transform: translateY(-1px);
          box-shadow: 0 14px 26px rgba(8, 39, 25, .08);
        }
        .manpower-highlight-card {
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }
        .manpower-highlight-card:hover {
          transform: translateY(-4px);
          border-color: rgba(35, 95, 62, .28);
          box-shadow: 0 22px 45px rgba(8, 39, 25, .12);
        }
      `}</style>

      <div className="manpower-highlights-animate space-y-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/80 bg-[#082719] px-6 py-7 shadow-[0_24px_70px_rgba(8,39,25,0.18)] ring-1 ring-black/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,212,132,0.25),transparent_35%),linear-gradient(135deg,rgba(35,95,62,0.96),rgba(8,39,25,1))]" />
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#f4d484]/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-[#f4d484]">
                Manpower Center
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                Highlight Management Overview
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              
              </p>
            </div>

            <button
              type="button"
              onClick={loadHighlights}
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-extrabold text-[#082719] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#f4d484]"
            >
              Refresh Highlights
            </button>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <DashboardStatCard
            title="Total Highlights"
            value={summary.total}
            subtitle="All uploaded highlight records"
          />

          <DashboardStatCard
            title="Active Highlights"
            value={summary.active}
            subtitle="Visible on public services page"
            tone="success"
          />

          <DashboardStatCard
            title="Inactive Highlights"
            value={summary.inactive}
            subtitle="Hidden from public services page"
            tone="danger"
          />
        </section>

        <DashboardSectionCard
          eyebrow="Content Editor"
          title={editingHighlight ? "Edit Highlight" : "Add New Highlight"}
        
        >
          <form onSubmit={submitHighlight} className="grid gap-5">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[24px] border border-[#dce8dc] bg-[#f7faf6] p-5 shadow-[0_12px_30px_rgba(8,39,25,0.06)]">
                <div className="grid gap-4">
                  <label className="block">
                    <FieldLabel>Title</FieldLabel>
                    <input
                      value={form.title}
                      onChange={(event) =>
                        updateFormField("title", event.target.value)
                      }
                      className={`mt-2 manpower-highlight-control ${inputClassName}`}
                      placeholder="Example: Successful deployment"
                    />
                  </label>

                  <label className="block">
                    <FieldLabel>Subtitle</FieldLabel>
                    <textarea
                      value={form.subtitle}
                      onChange={(event) =>
                        updateFormField("subtitle", event.target.value)
                      }
                      className={`mt-2 min-h-[104px] manpower-highlight-control ${inputClassName}`}
                      placeholder="Optional short description"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <label className="block">
                      <FieldLabel>Sort Order</FieldLabel>
                      <input
                        type="number"
                        value={form.sortOrder}
                        onChange={(event) =>
                          updateFormField("sortOrder", event.target.value)
                        }
                        className={`mt-2 manpower-highlight-control ${inputClassName}`}
                        placeholder="0"
                      />
                    </label>

                    <label className="flex min-h-[50px] items-center gap-3 rounded-2xl border border-[#d7decf] bg-white px-4 py-3 text-sm font-extrabold text-[#395345] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#235f3e]/35">
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
                      Active highlight
                    </label>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#dce8dc] bg-white p-5 shadow-[0_12px_30px_rgba(8,39,25,0.06)]">
                <FieldLabel>
                  Highlight Image {editingHighlight ? "(optional change)" : ""}
                </FieldLabel>

                <div className="mt-2 overflow-hidden rounded-[22px] border border-[#d7decf] bg-[#f7faf5] shadow-inner">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Highlight preview"
                      className="h-[245px] w-full object-cover transition duration-500 hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-[245px] items-center justify-center px-5 text-center text-sm font-semibold text-[#6b7a6d]">
                  
                    </div>
                  )}
                </div>

                <input
                  key={imageInputKey}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="mt-3 block w-full text-sm font-semibold text-[#395345] file:mr-4 file:rounded-full file:border-0 file:bg-[#082719] file:px-5 file:py-2.5 file:text-sm file:font-extrabold file:text-white hover:file:bg-[#235f3e]"
                />

                <p className="mt-2 text-xs font-semibold leading-5 text-[#6b7a6d]">
                  Accepted files: JPG, JPEG, PNG, WEBP. Recommended ratio:
                  landscape image.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {editingHighlight ? (
                <ActionButton type="button" variant="ghost" onClick={resetForm}>
                  Cancel Edit
                </ActionButton>
              ) : null}

              <ActionButton type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingHighlight
                  ? "Update Highlight"
                  : "Add Highlight"}
              </ActionButton>
            </div>
          </form>
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow="Highlight Records"
          title="Highlight List"

          action={
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[480px]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white placeholder:text-white/55 outline-none backdrop-blur transition duration-300 focus:border-[#f4d484] focus:bg-white/15"
                placeholder="Search highlight..."
              />

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-12 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white outline-none backdrop-blur transition duration-300 focus:border-[#f4d484] focus:bg-[#123a27]"
              >
                <option value="">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          }
        >
          <div className="overflow-hidden rounded-[24px] border border-[#dce8dc] bg-[#f7faf6] shadow-[0_12px_30px_rgba(8,39,25,0.07)]">
            <div className="hidden grid-cols-[160px_1.5fr_100px_120px_150px_210px] gap-4 border-b border-[#e7eee6] bg-[#eef5ee] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#5d7163] xl:grid">
              <span>Preview</span>
              <span>Details</span>
              <span>Order</span>
              <span>Status</span>
              <span>Updated</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-[#edf2eb] bg-white">
              {highlights.map((highlight, index) => (
                <article
                  key={highlight._id}
                  className="manpower-highlight-card grid gap-4 px-5 py-5 xl:grid-cols-[160px_1.5fr_100px_120px_150px_210px] xl:items-center"
                  style={{ animationDelay: `${0.08 + index * 0.03}s` }}
                >
                  <div className="h-24 overflow-hidden rounded-2xl bg-[#eef3ea] shadow-sm xl:h-20 xl:w-32">
                    {highlight.imageUrl ? (
                      <img
                        src={resolveImageSource(highlight.imageUrl)}
                        alt={highlight.title || "Highlight"}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#6b7a6d]">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] xl:hidden">
                      Details
                    </p>
                    <div className="truncate text-base font-black text-[#071f14]">
                      {highlight.title || "Untitled highlight"}
                    </div>

                    {highlight.subtitle ? (
                      <p className="mt-1 max-w-xl text-xs font-semibold leading-5 text-[#5f6f61]">
                        {highlight.subtitle}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs font-semibold text-[#9aa79b]">
                        No subtitle
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between xl:block">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] xl:hidden">
                      Order
                    </span>
                    <span className="inline-flex min-w-12 justify-center rounded-full bg-[#eef4ef] px-3 py-1.5 text-sm font-black text-[#071f14]/70">
                      {Number(highlight.sortOrder || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between xl:block">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] xl:hidden">
                      Status
                    </span>
                    <StatusPill tone={highlight.active ? "success" : "danger"}>
                      {highlight.active ? "Active" : "Inactive"}
                    </StatusPill>
                  </div>

                  <div className="flex items-center justify-between text-sm font-semibold text-[#5f6f61] xl:block">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8e80] xl:hidden">
                      Updated
                    </span>
                    {formatDateTime(highlight.updatedAt)}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <ActionButton
                      size="sm"
                      variant="soft"
                      onClick={() => startEdit(highlight)}
                    >
                      Edit
                    </ActionButton>

                    {highlight.active ? (
                      <ActionButton
                        size="sm"
                        variant="warning"
                        onClick={() => updateHighlightStatus(highlight, false)}
                      >
                        Deactivate
                      </ActionButton>
                    ) : (
                      <ActionButton
                        size="sm"
                        variant="success"
                        onClick={() => updateHighlightStatus(highlight, true)}
                      >
                        Activate
                      </ActionButton>
                    )}

                    <ActionButton
                      size="sm"
                      variant="danger"
                      onClick={() => deleteHighlight(highlight)}
                    >
                      Delete
                    </ActionButton>
                  </div>
                </article>
              ))}

              {!highlights.length ? (
                <div className="px-5 py-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef4ef] text-2xl">
                    🖼️
                  </div>
                  <p className="mt-4 text-sm font-black text-[#071f14]">
                    {loading ? "Loading highlights..." : "No highlights found."}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#071f14]/50">
                    Highlight images will appear here once records are available.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </DashboardSectionCard>
      </div>
    </AdminShell>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
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
      subtitle="Add, edit, activate, deactivate, or delete homepage highlight images shown on the public Manpower Services page."
      onLogout={logout}
    >
      <div className="space-y-6">
        <section className="grid gap-5 md:grid-cols-3">
          <StatCard
            title="Total Highlights"
            value={summary.total}
            subtitle="All uploaded highlight records"
          />

          <StatCard
            title="Active Highlights"
            value={summary.active}
            subtitle="Visible on public services page"
            tone="success"
          />

          <StatCard
            title="Inactive Highlights"
            value={summary.inactive}
            subtitle="Hidden from public services page"
            tone="danger"
          />
        </section>

        <SectionCard
          title={editingHighlight ? "Edit Highlight" : "Add New Highlight"}
          subtitle="Upload image highlights that will appear under Our Highlights."
        >
          <form onSubmit={submitHighlight} className="grid gap-5">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <label className="block">
                  <FieldLabel>Title</FieldLabel>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      updateFormField("title", event.target.value)
                    }
                    className={`mt-2 ${inputClassName}`}
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
                    className={`mt-2 min-h-[96px] ${inputClassName}`}
                    placeholder="Optional short description"
                  />
                </label>

                <label className="block">
                  <FieldLabel>Sort Order</FieldLabel>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(event) =>
                      updateFormField("sortOrder", event.target.value)
                    }
                    className={`mt-2 ${inputClassName}`}
                    placeholder="0"
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
                  Active highlight
                </label>
              </div>

              <div>
                <FieldLabel>
                  Highlight Image {editingHighlight ? "(optional change)" : ""}
                </FieldLabel>

                <div className="mt-2 overflow-hidden rounded-2xl border border-[#d7decf] bg-[#f7faf5]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Highlight preview"
                      className="h-[230px] w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[230px] items-center justify-center px-5 text-center text-sm font-semibold text-[#6b7a6d]">
                      Upload an image to preview it here.
                    </div>
                  )}
                </div>

                <input
                  key={imageInputKey}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="mt-3 block w-full text-sm text-[#395345] file:mr-4 file:rounded-lg file:border-0 file:bg-[#395345] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#2c4136]"
                />

                <p className="mt-2 text-xs leading-5 text-[#6b7a6d]">
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
        </SectionCard>

        <SectionCard
          title="Highlight List"
          subtitle="Manage all homepage highlight images."
          action={
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={compactInputClassName}
                placeholder="Search highlight..."
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
                  <th className="px-4 py-3 font-semibold">Preview</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {highlights.map((highlight) => (
                  <tr
                    key={highlight._id}
                    className="border-t border-[#eef2ea] align-top hover:bg-[#fbfcf8]"
                  >
                    <td className="px-4 py-3">
                      <div className="h-20 w-32 overflow-hidden rounded-xl bg-[#eef3ea]">
                        {highlight.imageUrl ? (
                          <img
                            src={resolveImageSource(highlight.imageUrl)}
                            alt={highlight.title || "Highlight"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#6b7a6d]">
                            No image
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-[#24352c]">
                        {highlight.title || "Untitled highlight"}
                      </div>

                      {highlight.subtitle ? (
                        <p className="mt-1 max-w-xs text-xs leading-5 text-[#5f6f61]">
                          {highlight.subtitle}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-[#9aa79b]">
                          No subtitle
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 font-semibold text-[#5f6f61]">
                      {Number(highlight.sortOrder || 0)}
                    </td>

                    <td className="px-4 py-3">
                      <StatusPill
                        tone={highlight.active ? "success" : "danger"}
                      >
                        {highlight.active ? "Active" : "Inactive"}
                      </StatusPill>
                    </td>

                    <td className="px-4 py-3 text-[#5f6f61]">
                      {formatDateTime(highlight.updatedAt)}
                    </td>

                    <td className="px-4 py-3">
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
                            onClick={() =>
                              updateHighlightStatus(highlight, false)
                            }
                          >
                            Deactivate
                          </ActionButton>
                        ) : (
                          <ActionButton
                            size="sm"
                            variant="success"
                            onClick={() =>
                              updateHighlightStatus(highlight, true)
                            }
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
                    </td>
                  </tr>
                ))}

                {!highlights.length ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-[#6b7a6d]"
                    >
                      {loading ? "Loading highlights..." : "No highlights found."}
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
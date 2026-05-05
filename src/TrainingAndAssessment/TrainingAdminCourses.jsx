import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TrainingAdminLayout from "./TrainingAdminLayout";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const emptyForm = { name: "", description: "", imageUrl: "" };
const ROWS_PER_PAGE = 5;

function getAdminToken() {
  return localStorage.getItem("trainingAdminToken") || "";
}

async function readJsonSafe(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || "Invalid server response.");
  }
}

function ModalShell({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 py-6" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] bg-white text-[#395345] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#e8ece2] px-6 py-4">
          <h3 className="text-xl font-black">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full border border-[#d7ddd0] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#395345]">Close</button>
        </div>
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export default function TrainingAdminCourses() {
  const navigate = useNavigate();
  const adminToken = getAdminToken();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actingId, setActingId] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [credentials, setCredentials] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const authHeaders = (extra = {}) => ({ ...extra, Authorization: `Bearer ${adminToken}` });

  async function loadCourses() {
    try {
      setLoading(true);
      setMsg({ type: "", text: "" });
      const res = await fetch(`${API_BASE}/admin/courses`, { headers: authHeaders() });
      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data?.message || "Failed to load courses.");
      setCourses(Array.isArray(data?.courses) ? data.courses : []);
    } catch (error) {
      setMsg({ type: "error", text: error.message || "Failed to load courses." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!adminToken) {
      navigate("/training-admin-login", { replace: true });
      return;
    }
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken, navigate]);

  const filteredCourses = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return [...courses]
      .filter((course) => {
        if (!keyword) return true;
        return [course.name, course.description, course.imageUrl]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      })
      .sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }, [courses, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ROWS_PER_PAGE));
  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredCourses.slice(start, start + ROWS_PER_PAGE);
  }, [filteredCourses, page]);

  useEffect(() => setPage(1), [search]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function openCreate() {
    setEditingId("");
    setForm(emptyForm);
    setCredentials(null);
    setModalOpen(true);
  }

  function startEdit(course) {
    setEditingId(String(course?._id || ""));
    setForm({
      name: course?.name || "",
      description: course?.description || "",
      imageUrl: course?.imageUrl || "",
    });
    setCredentials(null);
    setModalOpen(true);
  }

  function closeModal() {
    setEditingId("");
    setForm(emptyForm);
    setModalOpen(false);
  }

  async function submitCourse(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMsg({ type: "", text: "" });
      setCredentials(null);

      if (!form.name.trim()) throw new Error("Course name is required.");

      const url = editingId ? `${API_BASE}/admin/courses/${editingId}` : `${API_BASE}/admin/courses`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          imageUrl: form.imageUrl.trim(),
          active: true,
        }),
      });

      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data?.message || "Failed to save course.");

      setMsg({ type: "success", text: data?.message || "Course saved successfully." });
      if (data?.professorCredentials) setCredentials(data.professorCredentials);
      closeModal();
      await loadCourses();
    } catch (error) {
      setMsg({ type: "error", text: error.message || "Failed to save course." });
    } finally {
      setSubmitting(false);
    }
  }

  async function deactivateCourse(course) {
    if (!window.confirm(`Deactivate/delete ${course.name}?`)) return;

    try {
      setActingId(String(course?._id || ""));
      setMsg({ type: "", text: "" });
      const res = await fetch(`${API_BASE}/admin/courses/${course._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data?.message || "Failed to delete course.");
      setMsg({ type: "success", text: data?.message || "Course updated." });
      await loadCourses();
    } catch (error) {
      setMsg({ type: "error", text: error.message || "Failed to delete course." });
    } finally {
      setActingId("");
    }
  }

  return (
    <TrainingAdminLayout
      active="courses"
      title="Manage Training Courses"
      subtitle="Create course records and manage the professor account generated for each course."
    >
      {msg.text ? (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-bold ring-1 ${msg.type === "success" ? "bg-green-50 text-green-800 ring-green-200" : "bg-red-50 text-red-800 ring-red-200"}`}>
          {msg.text}
        </div>
      ) : null}

      {credentials ? (
        <div className="mb-5 rounded-xl bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-900 ring-1 ring-yellow-200">
          Professor credentials: {credentials.email || credentials.username || "-"} / {credentials.temporaryPassword || credentials.password || "-"}
        </div>
      ) : null}

      <div className="mb-7 rounded-lg bg-[#2d5038] px-5 py-4 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div>
            <label className="text-base font-black uppercase text-white">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 h-8 w-full max-w-[360px] rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none"
              placeholder="Search course"
            />
          </div>

          <button type="button" onClick={loadCourses} disabled={loading} className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button type="button" onClick={openCreate} className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7]">
            Create Course
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-[#2d5038] shadow-sm">
        <div className="bg-white px-4 py-4">
          <h3 className="text-lg font-black text-[#2d5038]">Training Courses</h3>
        </div>

        <div className="min-h-[372px] divide-y divide-white/25">
          {loading ? (
            [1, 2].map((item) => (
              <div key={item} className="grid gap-4 px-3 py-4 md:grid-cols-[64px_1.2fr_1.4fr_.8fr_100px_160px] md:items-center">
                <div className="h-11 w-11 rounded-full bg-white" />
                <div className="h-4 rounded-full bg-white/35" />
                <div className="h-4 rounded-full bg-white/35" />
                <div className="h-4 rounded-full bg-white/35" />
                <div className="h-5 rounded-full bg-[#bdf0a4]" />
                <div className="h-5 rounded-full bg-white" />
              </div>
            ))
          ) : paginatedCourses.length ? (
            paginatedCourses.map((course) => (
              <div key={course._id} className="grid gap-4 px-3 py-4 text-sm font-black md:grid-cols-[64px_1.2fr_1.4fr_.8fr_100px_160px] md:items-center">
                <div className="h-11 w-11 rounded-full bg-white" />
                <div className="text-white">{course.name || "Course"}</div>
                <div className="line-clamp-1 text-white/90">{course.description || "No description"}</div>
                <div className="text-white/90">Course</div>
                <div>
                  <span className={`inline-flex min-w-[84px] justify-center rounded-full px-3 py-1 text-[10px] font-black ${course.active !== false ? "bg-[#bdf0a4] text-[#2d5038]" : "bg-white text-[#2d5038]"}`}>
                    {course.active !== false ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => startEdit(course)} className="inline-flex min-w-[64px] justify-center rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#2d5038] transition hover:bg-[#eef1e7]">
                    Edit
                  </button>
                  <button type="button" onClick={() => deactivateCourse(course)} disabled={actingId === course._id} className="inline-flex min-w-[72px] justify-center rounded-full bg-[#bdf0a4] px-3 py-1 text-[10px] font-black text-[#2d5038] transition hover:bg-[#a9e790] disabled:opacity-60">
                    {actingId === course._id ? "..." : "Remove"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-12 text-center text-sm font-bold text-white/80">No courses found.</div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between px-2 text-base font-bold">
        <div>Page {page} / {totalPages}</div>
        <div className="flex items-center gap-5">
          <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1} className="text-3xl leading-none text-white disabled:opacity-30">‹</button>
          <button type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page >= totalPages} className="font-black text-white disabled:opacity-30">Next Page</button>
          <button type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page >= totalPages} className="text-3xl leading-none text-white disabled:opacity-30">›</button>
        </div>
      </div>

      <ModalShell open={modalOpen} onClose={closeModal} title={editingId ? "Edit Course" : "Create Course"}>
        <form onSubmit={submitCourse} className="grid gap-4">
          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">Course Name</label>
            <input name="name" value={form.name} onChange={onChange} className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]" placeholder="Enter course name" />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">Description</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={4} className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]" placeholder="Enter course description" />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">Image URL</label>
            <input name="imageUrl" value={form.imageUrl} onChange={onChange} className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]" placeholder="Optional image URL" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="rounded-xl border border-[#c6ccb9] bg-white px-5 py-3 text-sm font-black text-[#395345]">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-[#395345] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{submitting ? "Saving..." : editingId ? "Update Course" : "Create Course"}</button>
          </div>
        </form>
      </ModalShell>
    </TrainingAdminLayout>
  );
}

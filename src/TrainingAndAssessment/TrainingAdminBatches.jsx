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

const emptyForm = {
  batchName: "",
  course: "",
  description: "",
  startDate: "",
  endDate: "",
  enrollmentOpenAt: "",
  enrollmentCloseAt: "",
  maxTrainees: 25,
  status: "open",
};

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

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function toDateTimeInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function ModalShell({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 py-6" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[28px] bg-white text-[#395345] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#e8ece2] px-6 py-4">
          <h3 className="text-xl font-black">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full border border-[#d7ddd0] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#395345]">Close</button>
        </div>
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

function BatchStatusPill({ batch }) {
  const status = batch?.status || "open";
  const cls =
    status === "archived"
      ? "bg-white text-[#2d5038]"
      : status === "closed"
      ? "bg-red-100 text-red-800"
      : batch?.isOpenNow
      ? "bg-[#bdf0a4] text-[#2d5038]"
      : "bg-yellow-100 text-yellow-800";

  return (
    <span className={`inline-flex min-w-[84px] justify-center rounded-full px-3 py-1 text-[10px] font-black ${cls}`}>
      {status === "open" ? (batch?.isOpenNow ? "Open" : "Pending") : status}
    </span>
  );
}

export default function TrainingAdminBatches() {
  const navigate = useNavigate();
  const adminToken = getAdminToken();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [view, setView] = useState("current");
  const [courseFilter, setCourseFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actingId, setActingId] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const authHeaders = (extra = {}) => ({ ...extra, Authorization: `Bearer ${adminToken}` });
  const activeCourses = useMemo(() => courses.filter((course) => course.active !== false), [courses]);

  async function loadCourses() {
    const res = await fetch(`${API_BASE}/admin/courses`, { headers: authHeaders() });
    const data = await readJsonSafe(res);
    if (!res.ok) throw new Error(data?.message || "Failed to load courses.");
    setCourses(Array.isArray(data?.courses) ? data.courses : []);
  }

  async function loadBatches() {
    try {
      setLoading(true);
      setMsg({ type: "", text: "" });
      const params = new URLSearchParams();
      params.set("view", view);
      if (courseFilter && courseFilter !== "All") params.set("course", courseFilter);

      const res = await fetch(`${API_BASE}/admin/batches?${params.toString()}`, {
        headers: authHeaders(),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data?.message || "Failed to load batches.");
      setBatches(Array.isArray(data?.batches) ? data.batches : []);
    } catch (error) {
      setMsg({ type: "error", text: error.message || "Failed to load batches." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!adminToken) {
      navigate("/training-admin-login", { replace: true });
      return;
    }
    (async () => {
      try {
        await loadCourses();
      } catch (error) {
        setMsg({ type: "error", text: error.message || "Failed to load courses." });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken, navigate]);

  useEffect(() => {
    if (!adminToken) return;
    loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken, view, courseFilter]);

  useEffect(() => {
    if (form.course || !activeCourses.length) return;
    setForm((prev) => ({ ...prev, course: activeCourses[0]?.name || "" }));
  }, [activeCourses, form.course]);

  const filteredBatches = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return [...batches].filter((batch) => {
      if (!keyword) return true;
      return [batch.batchName, batch.batchCode, batch.course, batch.description, batch.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [batches, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / ROWS_PER_PAGE));
  const paginatedBatches = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredBatches.slice(start, start + ROWS_PER_PAGE);
  }, [filteredBatches, page]);

  useEffect(() => setPage(1), [view, courseFilter, search]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function openCreate() {
    setEditingId("");
    setForm({ ...emptyForm, course: activeCourses[0]?.name || "" });
    setModalOpen(true);
  }

  function closeModal() {
    setEditingId("");
    setForm({ ...emptyForm, course: activeCourses[0]?.name || "" });
    setModalOpen(false);
  }

  function startEdit(batch) {
    setEditingId(String(batch?._id || ""));
    setForm({
      batchName: batch?.batchName || "",
      course: batch?.course || "",
      description: batch?.description || "",
      startDate: toDateInput(batch?.startDate),
      endDate: toDateInput(batch?.endDate),
      enrollmentOpenAt: toDateTimeInput(batch?.enrollmentOpenAt),
      enrollmentCloseAt: toDateTimeInput(batch?.enrollmentCloseAt),
      maxTrainees: batch?.maxTrainees || 25,
      status: batch?.status || "open",
    });
    setModalOpen(true);
  }

  async function submitBatch(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMsg({ type: "", text: "" });

      if (!form.batchName.trim() || !form.course.trim()) throw new Error("Batch name and course are required.");
      if (!form.enrollmentOpenAt || !form.enrollmentCloseAt) throw new Error("Please set enrollment open and close date/time.");
      if (new Date(form.enrollmentCloseAt).getTime() <= new Date(form.enrollmentOpenAt).getTime()) {
        throw new Error("Enrollment close date/time must be later than the open date/time.");
      }

      const url = editingId ? `${API_BASE}/admin/batches/${editingId}` : `${API_BASE}/admin/batches`;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          batchName: form.batchName.trim(),
          course: form.course,
          description: form.description.trim(),
          startDate: form.startDate || "",
          endDate: form.endDate || "",
          enrollmentOpenAt: form.enrollmentOpenAt,
          enrollmentCloseAt: form.enrollmentCloseAt,
          maxTrainees: Number(form.maxTrainees || 25),
          status: form.status || "open",
        }),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data?.message || "Failed to save batch.");
      setMsg({ type: "success", text: data?.message || "Batch saved successfully." });
      closeModal();
      setView("current");
      await loadBatches();
    } catch (error) {
      setMsg({ type: "error", text: error.message || "Failed to save batch." });
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(batch, status) {
    try {
      setActingId(String(batch?._id || ""));
      setMsg({ type: "", text: "" });
      const res = await fetch(`${API_BASE}/admin/batches/${batch._id}/status`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status }),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data?.message || "Failed to update batch.");
      setMsg({ type: "success", text: data?.message || "Batch updated." });
      if (status === "archived") setView("past");
      await loadBatches();
    } catch (error) {
      setMsg({ type: "error", text: error.message || "Failed to update batch." });
    } finally {
      setActingId("");
    }
  }

  async function deleteBatch(batch) {
    if (!window.confirm(`Delete/archive ${batch.batchName}?`)) return;
    try {
      setActingId(String(batch?._id || ""));
      setMsg({ type: "", text: "" });
      const res = await fetch(`${API_BASE}/admin/batches/${batch._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data?.message || "Failed to delete batch.");
      setMsg({ type: "success", text: data?.message || "Batch deleted." });
      await loadBatches();
    } catch (error) {
      setMsg({ type: "error", text: error.message || "Failed to delete batch." });
    } finally {
      setActingId("");
    }
  }

  return (
    <TrainingAdminLayout active="batches" title="Manage Training Batches" subtitle="Create enrollment windows and manage current or past training batches.">
      {msg.text ? (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-bold ring-1 ${msg.type === "success" ? "bg-green-50 text-green-800 ring-green-200" : "bg-red-50 text-red-800 ring-red-200"}`}>{msg.text}</div>
      ) : null}

      <div className="mb-7 rounded-lg bg-[#2d5038] px-5 py-4 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_220px_160px_auto_auto] lg:items-end">
          <div>
            <label className="text-base font-black uppercase text-white">Search</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="mt-1 h-8 w-full rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none" placeholder="Search batch" />
          </div>
          <div>
            <label className="text-base font-black uppercase text-white">Course</label>
            <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="mt-1 h-8 w-full rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none">
              <option value="All">All</option>
              {courses.map((course) => <option key={course._id} value={course.name}>{course.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-base font-black uppercase text-white">View</label>
            <select value={view} onChange={(e) => setView(e.target.value)} className="mt-1 h-8 w-full rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none">
              <option value="current">Current</option>
              <option value="past">Past</option>
              <option value="all">All</option>
            </select>
          </div>
          <button type="button" onClick={loadBatches} disabled={loading} className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:opacity-60">{loading ? "Loading..." : "Refresh"}</button>
          <button type="button" onClick={openCreate} disabled={!activeCourses.length} className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:opacity-60">Create Batch</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-[#2d5038] shadow-sm">
        <div className="bg-white px-4 py-4"><h3 className="text-lg font-black text-[#2d5038]">Training Batches</h3></div>
        <div className="min-h-[372px] divide-y divide-white/25">
          {loading ? (
            [1, 2].map((item) => <div key={item} className="grid gap-4 px-3 py-4 md:grid-cols-[64px_1.3fr_1fr_.8fr_1fr_100px_170px] md:items-center"><div className="h-11 w-11 rounded-full bg-white" /><div className="h-4 rounded-full bg-white/35" /><div className="h-4 rounded-full bg-white/35" /><div className="h-4 rounded-full bg-white/35" /><div className="h-4 rounded-full bg-white/35" /><div className="h-5 rounded-full bg-[#bdf0a4]" /><div className="h-5 rounded-full bg-white" /></div>)
          ) : paginatedBatches.length ? (
            paginatedBatches.map((batch) => (
              <div key={batch._id} className="grid gap-4 px-3 py-4 text-sm font-black md:grid-cols-[64px_1.3fr_1fr_.8fr_1fr_100px_170px] md:items-center">
                <div className="h-11 w-11 rounded-full bg-white" />
                <div className="text-white"><div>{batch.batchName}</div><div className="text-xs text-white/70">{batch.batchCode || "-"}</div></div>
                <div className="text-white/90">{batch.course}</div>
                <div className="text-white/90">{batch.traineeCount || 0} / {batch.maxTrainees || 0}</div>
                <div className="text-white/90">{formatDateTime(batch.enrollmentCloseAt)}</div>
                <BatchStatusPill batch={batch} />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => startEdit(batch)} className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#2d5038]">Edit</button>
                  {batch.status === "open" ? <button type="button" onClick={() => updateStatus(batch, "closed")} disabled={actingId === batch._id} className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black text-red-800 disabled:opacity-60">Close</button> : <button type="button" onClick={() => updateStatus(batch, "open")} disabled={actingId === batch._id} className="rounded-full bg-[#bdf0a4] px-3 py-1 text-[10px] font-black text-[#2d5038] disabled:opacity-60">Open</button>}
                  <button type="button" onClick={() => deleteBatch(batch)} disabled={actingId === batch._id} className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#2d5038] disabled:opacity-60">Remove</button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-12 text-center text-sm font-bold text-white/80">No batches found.</div>
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

      <ModalShell open={modalOpen} onClose={closeModal} title={editingId ? "Edit Batch" : "Create Batch"}>
        <form onSubmit={submitBatch} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">Batch Name</label><input name="batchName" value={form.batchName} onChange={onChange} placeholder="Example: Cookery Batch 2026-A" className="mt-2 w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]" /></div>
          <div><label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">Course</label><select name="course" value={form.course} onChange={onChange} className="mt-2 w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"><option value="">Select course</option>{activeCourses.map((course) => <option key={course._id} value={course.name}>{course.name}</option>)}</select></div>
          <div><label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">Status</label><select name="status" value={form.status} onChange={onChange} className="mt-2 w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"><option value="open">Open</option><option value="closed">Closed</option><option value="archived">Archived</option></select></div>
          <div className="md:col-span-2"><label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">Description</label><textarea name="description" value={form.description} onChange={onChange} rows={3} className="mt-2 w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]" /></div>
          <div><label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">Start Date</label><input type="date" name="startDate" value={form.startDate} onChange={onChange} className="mt-2 w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]" /></div>
          <div><label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">End Date</label><input type="date" name="endDate" value={form.endDate} onChange={onChange} className="mt-2 w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]" /></div>
          <div><label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">Enrollment Opens</label><input type="datetime-local" name="enrollmentOpenAt" value={form.enrollmentOpenAt} onChange={onChange} className="mt-2 w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]" /></div>
          <div><label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">Enrollment Closes</label><input type="datetime-local" name="enrollmentCloseAt" value={form.enrollmentCloseAt} onChange={onChange} className="mt-2 w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]" /></div>
          <div><label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">Max Trainees</label><input type="number" name="maxTrainees" min="1" max="25" value={form.maxTrainees} onChange={onChange} className="mt-2 w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]" /></div>
          <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={closeModal} className="rounded-xl border border-[#c6ccb9] bg-white px-5 py-3 text-sm font-black text-[#395345]">Cancel</button><button type="submit" disabled={submitting || !activeCourses.length} className="rounded-xl bg-[#395345] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{submitting ? "Saving..." : editingId ? "Update Batch" : "Create Batch"}</button></div>
        </form>
      </ModalShell>
    </TrainingAdminLayout>
  );
}

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


function BatchStatCard({ title, value, note }) {
  return (
    <article className="ta-batch-card ta-batch-stat">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-black/40">{title}</p>
      <strong className="mt-3 block text-4xl font-black tracking-tight text-[#082719]">{value}</strong>
      {note ? <span className="mt-3 block text-sm font-semibold text-black/45">{note}</span> : null}
    </article>
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

  const batchStats = useMemo(() => {
    const open = batches.filter((batch) => (batch.status || "open") === "open").length;
    const closed = batches.filter((batch) => batch.status === "closed").length;
    const archived = batches.filter((batch) => batch.status === "archived").length;

    return {
      total: batches.length,
      open,
      closed,
      archived,
      visible: filteredBatches.length,
    };
  }, [batches, filteredBatches]);

  return (
    <TrainingAdminLayout active="batches" title="Manage Training Batches" subtitle="Create enrollment windows and manage current or past training batches.">
      <style>{`
        .ta-batches {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --muted: #667085;
          --card: rgba(255, 255, 255, 0.86);
          --ease: cubic-bezier(.22, 1, .36, 1);
          color: #102418;
        }

        .ta-batch-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.78);
          background: var(--card);
          box-shadow: 0 18px 45px rgba(8, 39, 25, 0.10);
          backdrop-filter: blur(18px);
        }

        .ta-batch-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 5px;
          background: linear-gradient(90deg, var(--green-700), var(--gold));
        }

        .ta-batch-card::after {
          content: "";
          position: absolute;
          right: -78px;
          bottom: -82px;
          width: 170px;
          height: 170px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(215, 168, 77, 0.20), transparent 62%);
          pointer-events: none;
        }

        .ta-batch-stat {
          min-height: 118px;
          padding: 24px;
          transition: transform .25s var(--ease), box-shadow .25s var(--ease);
        }

        .ta-batch-stat:hover {
          transform: translateY(-3px);
          box-shadow: 0 22px 50px rgba(8, 39, 25, 0.14);
        }

        .ta-batch-pill {
          min-height: 42px;
          border-radius: 999px;
          padding: 0 18px;
          font-size: 12px;
          font-weight: 900;
          transition: transform .2s var(--ease), background .2s var(--ease), color .2s var(--ease);
        }

        .ta-batch-pill:hover:not(:disabled) {
          transform: translateY(-1px);
        }



        .ta-batch-filter-card {
          padding: 24px;
        }

        .ta-batch-filter-head {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .ta-batch-filter-copy {
          max-width: 680px;
        }

        .ta-batch-filter-copy h2 {
          margin-top: 8px;
          color: var(--green-900);
          font-size: clamp(24px, 2.6vw, 34px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .ta-batch-filter-copy p:last-child {
          max-width: 560px;
          margin-top: 8px;
          color: rgba(16, 24, 40, 0.52);
          font-size: 14px;
          line-height: 1.55;
          font-weight: 700;
        }

        .ta-batch-filter-count {
          flex: 0 0 auto;
          border-radius: 999px;
          background: rgba(244, 212, 132, 0.35);
          border: 1px solid rgba(215, 168, 77, 0.36);
          color: var(--green-900);
          padding: 9px 14px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .ta-batch-filter-controls {
          position: relative;
          z-index: 1;
          margin-top: 22px;
          display: grid;
          grid-template-columns: minmax(280px, 1fr) 220px 170px 124px 160px;
          gap: 12px;
          align-items: center;
        }

        .ta-batch-control {
          height: 48px;
          width: 100%;
          border-radius: 999px;
          border: 1px solid rgba(8, 39, 25, 0.12);
          background: rgba(255, 255, 255, 0.78);
          color: var(--green-900);
          padding: 0 18px;
          font-size: 13px;
          font-weight: 800;
          outline: none;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
          transition: border .2s var(--ease), box-shadow .2s var(--ease), background .2s var(--ease);
        }

        .ta-batch-control::placeholder {
          color: rgba(35, 95, 62, 0.52);
        }

        .ta-batch-control:focus {
          border-color: rgba(35, 95, 62, 0.42);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(35, 95, 62, 0.10);
        }

        .ta-batch-filter-button {
          height: 48px;
          width: 100%;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
          transition: transform .2s var(--ease), box-shadow .2s var(--ease), background .2s var(--ease), opacity .2s var(--ease);
        }

        .ta-batch-filter-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 30px rgba(8, 39, 25, 0.14);
        }

        .ta-batch-refresh {
          background: var(--green-800);
          color: #fff;
          box-shadow: 0 12px 24px rgba(8, 39, 25, 0.14);
        }

        .ta-batch-create {
          background: linear-gradient(135deg, var(--gold-soft), var(--gold));
          color: #102418;
          box-shadow: 0 12px 24px rgba(215, 168, 77, 0.22);
        }

        .ta-batch-table-scroll {
          overflow-x: auto;
          scrollbar-width: thin;
        }

        .ta-batch-table {
          min-width: 1120px;
        }

        .ta-batch-row {
          display: grid;
          grid-template-columns: 72px 1.35fr 1fr .8fr 1.3fr 112px 210px;
          gap: 18px;
          align-items: center;
        }

        .ta-batch-data-row {
          border-top: 1px solid rgba(16, 24, 40, 0.08);
          transition: background .22s var(--ease);
        }

        .ta-batch-data-row:hover {
          background: rgba(246, 246, 241, 0.82);
        }

        .ta-batch-thumb {
          width: 48px;
          height: 48px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: linear-gradient(145deg, #eef8f2, #fff);
          color: var(--green-800);
          box-shadow: inset 0 0 0 1px rgba(35, 95, 62, .12), 0 10px 20px rgba(8, 39, 25, .08);
        }

        .ta-batch-action-grid {
          display: grid;
          grid-template-columns: repeat(3, 64px);
          gap: 8px;
          justify-content: center;
        }

        .ta-batch-action {
          width: 64px;
          height: 36px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          transition: transform .2s var(--ease), box-shadow .2s var(--ease), background .2s var(--ease), color .2s var(--ease);
        }

        .ta-batch-action:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(8, 39, 25, 0.12);
        }

        .ta-action-edit {
          background: #ffffff;
          color: #082719;
          border-color: rgba(8, 39, 25, 0.14);
          box-shadow: 0 8px 18px rgba(8, 39, 25, 0.08);
        }

        .ta-action-open {
          background: #e9f5ee;
          color: #174a30;
          border-color: rgba(35, 95, 62, 0.24);
        }

        .ta-action-close {
          background: #fff6dc;
          color: #6f4a00;
          border-color: rgba(215, 168, 77, 0.48);
        }

        .ta-action-remove {
          background: #fff1f3;
          color: #b42318;
          border-color: rgba(244, 63, 94, 0.24);
        }

        .ta-batch-action:disabled {
          cursor: not-allowed;
          opacity: .62;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 1200px) {
          .ta-batch-filter-controls {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 700px) {
          .ta-batch-filter-card {
            padding: 20px;
          }

          .ta-batch-filter-head {
            flex-direction: column;
          }

          .ta-batch-filter-controls {
            grid-template-columns: 1fr;
          }

          .ta-batch-filter-count {
            width: 100%;
            text-align: center;
          }
        }

        @media (max-width: 900px) {
          .ta-batch-stat {
            min-height: 102px;
            padding: 20px;
          }
        }
      `}</style>

      <div className="ta-batches">
        {msg.text ? (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-bold ${
              msg.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {msg.text}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BatchStatCard title="All Batches" value={batchStats.total} note="Created batch records" />
          <BatchStatCard title="Open" value={batchStats.open} note="Available or scheduled windows" />
          <BatchStatCard title="Closed" value={batchStats.closed} note="Enrollment ended" />
          <BatchStatCard title="Visible" value={batchStats.visible} note="Current search results" />
        </div>

        <section className="ta-batch-card ta-batch-filter-card mt-6">
          <div className="ta-batch-filter-head">
            <div className="ta-batch-filter-copy">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-black/40">
                Search Records
              </p>
              <h2>Batch Queue</h2>
              <p>
                Search batches, filter by course or view, then refresh the latest training batch list.
              </p>
            </div>

            <span className="ta-batch-filter-count">
              {filteredBatches.length} Result{filteredBatches.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="ta-batch-filter-controls">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ta-batch-control"
              placeholder="Search batch name, code, course, or status"
            />

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="ta-batch-control"
            >
              <option value="All">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>

            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="ta-batch-control"
            >
              <option value="current">Current</option>
              <option value="past">Past</option>
              <option value="all">All</option>
            </select>

            <button
              type="button"
              onClick={loadBatches}
              disabled={loading}
              className="ta-batch-filter-button ta-batch-refresh disabled:opacity-60"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={openCreate}
              disabled={!activeCourses.length}
              className="ta-batch-filter-button ta-batch-create disabled:opacity-60"
            >
              Create Batch
            </button>
          </div>
        </section>

        <section className="ta-batch-card mt-6">
          <div className="flex flex-col gap-3 px-5 pb-4 pt-6 md:flex-row md:items-center md:justify-between md:px-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-black/40">
                Training Batches
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-[#2A4F33]">
                Batch Records
              </h3>
              <p className="mt-1 text-sm font-semibold text-black/45">
                Showing {filteredBatches.length} batch{filteredBatches.length === 1 ? "" : "es"}.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-[#E9F1D9] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-[#2F5E3A]">
              Page {page} of {totalPages}
            </span>
          </div>

          <div className="ta-batch-table-scroll">
            <div className="ta-batch-table px-5 pb-5 md:px-6">
              <div className="ta-batch-row rounded-2xl bg-[#F6F6F1] px-4 py-4 text-xs font-extrabold uppercase tracking-[0.18em] text-black/45">
                <div>Icon</div>
                <div>Batch</div>
                <div>Course</div>
                <div>Trainees</div>
                <div>Enrollment Closes</div>
                <div>Status</div>
                <div className="text-center">Actions</div>
              </div>

              <div className="mt-3 overflow-hidden rounded-2xl border border-black/5 bg-white">
                {loading ? (
                  [1, 2].map((item) => (
                    <div key={item} className="ta-batch-row ta-batch-data-row px-4 py-5">
                      <div className="h-12 w-12 rounded-[18px] bg-black/10" />
                      <div className="h-4 rounded-full bg-black/10" />
                      <div className="h-4 rounded-full bg-black/10" />
                      <div className="h-4 rounded-full bg-black/10" />
                      <div className="h-4 rounded-full bg-black/10" />
                      <div className="h-6 rounded-full bg-black/10" />
                      <div className="h-8 rounded-full bg-black/10" />
                    </div>
                  ))
                ) : paginatedBatches.length ? (
                  paginatedBatches.map((batch) => (
                    <div key={batch._id} className="ta-batch-row ta-batch-data-row px-4 py-5 text-sm font-bold text-[#102418]">
                      <div>
                        <div className="ta-batch-thumb">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
                          </svg>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-base font-extrabold text-[#082719]">{batch.batchName}</div>
                        <div className="mt-1 text-xs font-bold text-black/45">{batch.batchCode || "-"}</div>
                      </div>

                      <div className="text-black/65">{batch.course}</div>
                      <div className="text-black/65">{batch.traineeCount || 0} / {batch.maxTrainees || 0}</div>
                      <div className="text-black/65">{formatDateTime(batch.enrollmentCloseAt)}</div>
                      <div><BatchStatusPill batch={batch} /></div>

                      <div className="ta-batch-action-grid">
                        <button type="button" onClick={() => startEdit(batch)} className="ta-batch-action ta-action-edit">
                          Edit
                        </button>
                        {batch.status === "open" ? (
                          <button
                            type="button"
                            onClick={() => updateStatus(batch, "closed")}
                            disabled={actingId === batch._id}
                            className="ta-batch-action ta-action-close"
                          >
                            Close
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateStatus(batch, "open")}
                            disabled={actingId === batch._id}
                            className="ta-batch-action ta-action-open"
                          >
                            Open
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteBatch(batch)}
                          disabled={actingId === batch._id}
                          className="ta-batch-action ta-action-remove"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-12 text-center text-sm font-bold text-black/45">
                    No batches found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between px-2 text-sm font-bold text-white/80">
          <div>Page {page} / {totalPages}</div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="rounded-full bg-white/10 px-4 py-2 text-white transition hover:bg-white/20 disabled:opacity-30"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="rounded-full bg-white/10 px-4 py-2 text-white transition hover:bg-white/20 disabled:opacity-30"
            >
              Next
            </button>
          </div>
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

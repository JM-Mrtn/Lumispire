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

  const courseStats = useMemo(() => {
    const active = courses.filter((course) => course.active !== false).length;
    const inactive = courses.length - active;

    return {
      total: courses.length,
      active,
      inactive,
      visible: filteredCourses.length,
    };
  }, [courses, filteredCourses]);

  return (
    <TrainingAdminLayout
      active="courses"
      title="Manage Training Courses"
      subtitle="Create course records and manage the professor account generated for each course."
    >
      <style>{`
        .ta-courses {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --soft-bg: #f6f6f1;
          --muted: #667085;
          color: #101828;
        }

        .ta-course-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(16, 24, 40, 0.06);
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 14px 34px rgba(8, 39, 25, 0.08);
        }

        .ta-course-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 5px;
          background: linear-gradient(90deg, var(--green-700), var(--gold));
        }

        .ta-course-card::after {
          content: "";
          position: absolute;
          width: 170px;
          height: 170px;
          right: -86px;
          bottom: -86px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(215, 168, 77, 0.20), transparent 60%);
          pointer-events: none;
        }

        .ta-course-stat {
          min-height: 118px;
          padding: 24px;
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .ta-course-stat:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 42px rgba(8, 39, 25, 0.12);
        }

        .ta-course-pill {
          min-height: 42px;
          border-radius: 999px;
          padding: 0 18px;
          font-size: 12px;
          font-weight: 900;
          transition: transform .2s ease, background .2s ease, color .2s ease;
        }

        .ta-course-pill:hover {
          transform: translateY(-1px);
        }

        .ta-course-table-scroll {
          overflow-x: auto;
          scrollbar-width: thin;
        }

        .ta-course-table {
          min-width: 980px;
        }

        .ta-course-row {
          display: grid;
          grid-template-columns: 72px 1.2fr 1.7fr .85fr 180px;
          gap: 18px;
          align-items: center;
        }

        .ta-course-data-row {
          border-top: 1px solid rgba(16, 24, 40, 0.08);
          transition: background .22s ease;
        }

        .ta-course-data-row:hover {
          background: rgba(246, 246, 241, 0.82);
        }

        .ta-course-thumb {
          width: 48px;
          height: 48px;
          border-radius: 18px;
          overflow: hidden;
          display: grid;
          place-items: center;
          background: linear-gradient(145deg, #eef8f2, #fff);
          color: var(--green-800);
          box-shadow: inset 0 0 0 1px rgba(35, 95, 62, .12), 0 10px 20px rgba(8, 39, 25, .08);
          font-weight: 900;
        }

        .ta-course-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ta-course-actions {
          width: 164px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          align-items: center;
          justify-items: stretch;
          margin-left: auto;
          margin-right: auto;
        }

        .ta-course-action {
          width: 78px;
          height: 38px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease, color .2s ease;
        }

        .ta-course-action:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(8, 39, 25, 0.12);
        }

        .ta-action-edit {
          background: #ffffff;
          color: #082719;
          border-color: rgba(8, 39, 25, 0.14);
          box-shadow: 0 8px 18px rgba(8, 39, 25, 0.08);
        }

        .ta-action-edit:hover:not(:disabled) {
          background: #f6f8f5;
          border-color: rgba(8, 39, 25, 0.26);
        }

        .ta-action-remove {
          background: #fff6dc;
          color: #6f4a00;
          border-color: rgba(215, 168, 77, 0.48);
          box-shadow: 0 8px 18px rgba(215, 168, 77, 0.12);
        }

        .ta-action-remove:hover:not(:disabled) {
          background: #f4d484;
          color: #102418;
          border-color: #d7a84d;
        }

        .ta-course-action:disabled {
          cursor: not-allowed;
          opacity: .62;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 900px) {
          .ta-course-stat {
            min-height: 102px;
            padding: 20px;
          }
        }
      `}</style>

      <div className="ta-courses">
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

        {credentials ? (
          <div className="mb-5 rounded-2xl border border-[#d7a84d]/30 bg-[#fff6dc] px-4 py-3 text-sm font-bold text-[#6f4a00]">
            Professor credentials: {credentials.email || credentials.username || "-"} / {credentials.temporaryPassword || credentials.password || "-"}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CourseStatCard title="All Courses" value={courseStats.total} note="Created course records" />
          <CourseStatCard title="Active" value={courseStats.active} note="Available for enrollment" />
          <CourseStatCard title="Inactive" value={courseStats.inactive} note="Hidden or removed courses" />
          <CourseStatCard title="Visible" value={courseStats.visible} note="Current search results" />
        </div>

        <section className="ta-course-card mt-6 p-5 md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-black/40">
                Search Records
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#2A4F33]">
                Course Queue
              </h2>
              <p className="mt-1 text-sm font-semibold text-black/45">
                Search course names, descriptions, image links, or refresh the latest course list.
              </p>
            </div>

            <div className="grid w-full gap-3 xl:max-w-4xl xl:grid-cols-[1fr_auto_auto]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-2xl border border-black/10 bg-[#F6F6F1] px-4 text-sm font-bold text-[#2A4F33] outline-none transition focus:border-[#2A4F33]/40 focus:bg-white focus:ring-4 focus:ring-[#2A4F33]/10"
                placeholder="Search course name, description, or image URL"
              />

              <button
                type="button"
                onClick={loadCourses}
                disabled={loading}
                className="ta-course-pill bg-[#2A4F33] px-6 text-white shadow-sm hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="ta-course-pill bg-[#f4d484] px-6 text-[#102418] shadow-sm hover:bg-[#d7a84d]"
              >
                Create Course
              </button>
            </div>
          </div>
        </section>

        <section className="ta-course-card mt-6">
          <div className="flex flex-col gap-3 px-5 pb-4 pt-6 md:flex-row md:items-center md:justify-between md:px-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-black/40">
                Training Courses
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-[#2A4F33]">
                Course Records
              </h3>
              <p className="mt-1 text-sm font-semibold text-black/45">
                Showing {filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"}.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-[#E9F1D9] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-[#2F5E3A]">
              Page {page} of {totalPages}
            </span>
          </div>

          <div className="ta-course-table-scroll">
            <div className="ta-course-table px-5 pb-5 md:px-6">
              <div className="ta-course-row rounded-2xl bg-[#F6F6F1] px-4 py-4 text-xs font-extrabold uppercase tracking-[0.18em] text-black/45">
                <div>Image</div>
                <div>Course</div>
                <div>Description</div>
                <div>Status</div>
                <div className="text-center">Actions</div>
              </div>

              <div className="mt-3 overflow-hidden rounded-2xl border border-black/5 bg-white">
                {loading ? (
                  [1, 2].map((item) => (
                    <div key={item} className="ta-course-row ta-course-data-row px-4 py-5">
                      <div className="h-12 w-12 rounded-[18px] bg-black/10" />
                      <div className="h-4 rounded-full bg-black/10" />
                      <div className="h-4 rounded-full bg-black/10" />
                      <div className="h-6 rounded-full bg-black/10" />
                      <div className="h-8 rounded-full bg-black/10" />
                    </div>
                  ))
                ) : paginatedCourses.length ? (
                  paginatedCourses.map((course) => (
                    <div key={course._id} className="ta-course-row ta-course-data-row px-4 py-5 text-sm font-bold text-[#102418]">
                      <div>
                        <div className="ta-course-thumb">
                          {course.imageUrl ? (
                            <img
                              src={course.imageUrl}
                              alt={course.name || "Course"}
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span>{String(course.name || "C").charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="font-extrabold text-[#2A4F33]">{course.name || "Course"}</div>
                        <div className="mt-1 text-xs font-semibold text-black/45">Training Course</div>
                      </div>

                      <div className="line-clamp-2 text-black/65">{course.description || "No description"}</div>

                      <div>
                        <span
                          className={`inline-flex min-w-[92px] justify-center rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${
                            course.active !== false
                              ? "bg-[#bdf0a4] text-[#2d5038]"
                              : "bg-[#F6F6F1] text-black/55"
                          }`}
                        >
                          {course.active !== false ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="ta-course-actions">
                        <button
                          type="button"
                          onClick={() => startEdit(course)}
                          className="ta-course-action ta-action-edit"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deactivateCourse(course)}
                          disabled={actingId === course._id}
                          className="ta-course-action ta-action-remove"
                        >
                          {actingId === course._id ? "..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-12 text-center text-sm font-bold text-black/45">
                    No courses found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-black/5 bg-white px-5 py-4 text-sm font-bold shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-black/50">
            Page <span className="font-extrabold text-[#2A4F33]">{page}</span> / {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="h-10 rounded-2xl border border-black/10 bg-white px-4 text-xs font-extrabold text-[#2A4F33] hover:bg-[#F6F6F1] disabled:opacity-30"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="h-10 rounded-2xl bg-[#2A4F33] px-5 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-30"
            >
              Next Page
            </button>
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

      </div>
    </TrainingAdminLayout>
  );
}


function CourseStatCard({ title, value, note }) {
  return (
    <article className="ta-course-card ta-course-stat">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-black/40">
        {title}
      </p>
      <div className="mt-4 text-4xl font-extrabold leading-none text-[#082719]">
        {value}
      </div>
      {note ? (
        <p className="mt-4 text-sm font-semibold text-black/45">{note}</p>
      ) : null}
    </article>
  );
}

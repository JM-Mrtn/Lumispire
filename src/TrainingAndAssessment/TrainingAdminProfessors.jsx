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
const ROWS_PER_PAGE = 5;

function getAdminToken() {
  return localStorage.getItem("trainingAdminToken") || "";
}

async function readJsonSafe(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 160) || "Invalid server response.");
  }
}

function statusClass(active) {
  return active
    ? "bg-[#E9F1D9] text-[#2A4F33] border-[#2A4F33]/15"
    : "bg-[#FFF6DC] text-[#7A5200] border-[#D7A84D]/35";
}

function StatCard({ title, value, note }) {
  return (
    <article className="ta-prof-card ta-prof-stat">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-black/40">
        {title}
      </p>
      <strong className="mt-4 block text-4xl font-extrabold leading-none text-[#082719]">
        {value}
      </strong>
      {note ? (
        <p className="mt-4 text-sm font-semibold text-black/45">{note}</p>
      ) : null}
    </article>
  );
}

export default function TrainingAdminProfessors() {
  const navigate = useNavigate();
  const adminToken = getAdminToken();
  const [professors, setProfessors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [resetResult, setResetResult] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const authHeaders = (extra = {}) => ({ ...extra, Authorization: `Bearer ${adminToken}` });

  async function loadProfessors() {
    try {
      setLoading(true);
      setMsg({ type: "", text: "" });
      const [profRes, courseRes] = await Promise.all([
        fetch(`${API_BASE}/admin/professors`, { headers: authHeaders() }),
        fetch(`${API_BASE}/admin/courses`, { headers: authHeaders() }),
      ]);
      const profData = await readJsonSafe(profRes);
      const courseData = await readJsonSafe(courseRes);
      if (!profRes.ok) throw new Error(profData?.message || "Failed to load professors.");
      if (!courseRes.ok) throw new Error(courseData?.message || "Failed to load courses.");
      setProfessors(Array.isArray(profData?.professors) ? profData.professors : []);
      setCourses(Array.isArray(courseData?.courses) ? courseData.courses : []);
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to load professors." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!adminToken) {
      navigate("/training-admin-login", { replace: true });
      return;
    }
    loadProfessors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken, navigate]);

  const sortedProfessors = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return [...professors]
      .filter((professor) => {
        if (!keyword) return true;
        return [
          professor.firstName,
          professor.lastName,
          professor.username,
          professor.email,
          ...(professor.courseAssignments || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      })
      .sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1;
        return `${a.lastName || ""} ${a.firstName || ""}`.localeCompare(`${b.lastName || ""} ${b.firstName || ""}`);
      });
  }, [professors, search]);

  const totalPages = Math.max(1, Math.ceil(sortedProfessors.length / ROWS_PER_PAGE));
  const paginatedProfessors = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return sortedProfessors.slice(start, start + ROWS_PER_PAGE);
  }, [sortedProfessors, page]);

  const professorStats = useMemo(() => {
    const active = professors.filter((professor) => professor.active).length;
    const inactive = professors.length - active;

    return {
      total: professors.length,
      active,
      inactive,
      courses: courses.length,
    };
  }, [professors, courses]);

  useEffect(() => setPage(1), [search]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  async function setProfessorActive(professor, active) {
    try {
      setActingId(String(professor?._id || ""));
      setMsg({ type: "", text: "" });
      const res = await fetch(`${API_BASE}/admin/professors/${professor._id}/${active ? "activate" : "deactivate"}`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data?.message || "Failed to update professor.");
      setMsg({ type: "success", text: data?.message || "Professor updated." });
      await loadProfessors();
    } catch (error) {
      setMsg({ type: "error", text: error.message || "Failed to update professor." });
    } finally {
      setActingId("");
    }
  }

  async function resetPassword(professor) {
    if (!window.confirm(`Reset password for ${professor.firstName} ${professor.lastName}?`)) return;
    try {
      setActingId(String(professor?._id || ""));
      setMsg({ type: "", text: "" });
      setResetResult(null);
      const res = await fetch(`${API_BASE}/admin/professors/${professor._id}/reset-password`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({}),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data?.message || "Failed to reset password.");
      setMsg({ type: "success", text: data?.message || "Password reset." });
      setResetResult({
        professor: `${professor.firstName} ${professor.lastName}`,
        username: professor.username,
        email: professor.email,
        temporaryPassword: data?.temporaryPassword,
      });
      await loadProfessors();
    } catch (error) {
      setMsg({ type: "error", text: error.message || "Failed to reset password." });
    } finally {
      setActingId("");
    }
  }

  return (
    <TrainingAdminLayout
      active="professors"
      title="Manage Professors"
      subtitle="Review professor accounts created from course records and reset credentials when needed."
    >
      <style>{`
        .ta-professors {
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

        .ta-prof-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(16, 24, 40, 0.06);
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 14px 34px rgba(8, 39, 25, 0.08);
        }

        .ta-prof-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 5px;
          background: linear-gradient(90deg, var(--green-700), var(--gold));
        }

        .ta-prof-card::after {
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

        .ta-prof-stat {
          min-height: 118px;
          padding: 24px;
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .ta-prof-stat:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 42px rgba(8, 39, 25, 0.12);
        }

        .ta-prof-pill {
          min-height: 42px;
          border-radius: 999px;
          padding: 0 18px;
          font-size: 12px;
          font-weight: 900;
          transition: transform .2s ease, background .2s ease, color .2s ease;
        }

        .ta-prof-pill:hover {
          transform: translateY(-1px);
        }

        .ta-prof-table-scroll {
          overflow-x: auto;
          scrollbar-width: thin;
        }

        .ta-prof-table {
          min-width: 1120px;
        }

        .ta-prof-row {
          display: grid;
          grid-template-columns: 1.35fr 1fr 1.55fr 1.5fr .75fr 178px;
          gap: 18px;
          align-items: center;
        }

        .ta-prof-data-row {
          border-top: 1px solid rgba(16, 24, 40, 0.08);
          transition: background .22s ease;
        }

        .ta-prof-data-row:hover {
          background: rgba(246, 246, 241, 0.82);
        }

        .ta-prof-avatar {
          display: inline-flex;
          height: 38px;
          width: 38px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: linear-gradient(145deg, #f8fbf9, #e9f1d9);
          color: var(--green-900);
          font-size: 13px;
          font-weight: 900;
          box-shadow: inset 0 0 0 1px rgba(35, 95, 62, 0.12);
        }

        .ta-prof-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          align-items: center;
          justify-items: stretch;
        }

        .ta-prof-action {
          height: 38px;
          min-width: 82px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease, color .2s ease;
        }

        .ta-prof-action:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(8, 39, 25, 0.12);
        }

        .ta-action-reset {
          background: #ffffff;
          color: #082719;
          border-color: rgba(8, 39, 25, 0.14);
          box-shadow: 0 8px 18px rgba(8, 39, 25, 0.08);
        }

        .ta-action-reset:hover:not(:disabled) {
          background: #f6f8f5;
          border-color: rgba(8, 39, 25, 0.26);
        }

        .ta-action-enable {
          background: #082719;
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 10px 22px rgba(8, 39, 25, 0.18);
        }

        .ta-action-enable:hover:not(:disabled) {
          background: #0e3321;
        }

        .ta-action-disable {
          background: #fff6dc;
          color: #6f4a00;
          border-color: rgba(215, 168, 77, 0.48);
          box-shadow: 0 8px 18px rgba(215, 168, 77, 0.12);
        }

        .ta-action-disable:hover:not(:disabled) {
          background: #f4d484;
          color: #102418;
          border-color: #d7a84d;
        }

        .ta-prof-action:disabled {
          cursor: not-allowed;
          opacity: .62;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 900px) {
          .ta-prof-stat {
            min-height: 102px;
            padding: 20px;
          }
        }
      `}</style>

      <div className="ta-professors">
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

        {resetResult ? (
          <div className="mb-5 rounded-2xl border border-[#D7A84D]/35 bg-[#FFF6DC] px-4 py-3 text-sm font-bold text-[#6F4A00]">
            Temporary password for {resetResult.professor}: {resetResult.temporaryPassword || "-"} | Username: {resetResult.username || "-"} | Email: {resetResult.email || "-"}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="All Professors" value={professorStats.total} note="Registered instructor accounts" />
          <StatCard title="Active" value={professorStats.active} note="Can access professor portal" />
          <StatCard title="Inactive" value={professorStats.inactive} note="Disabled account access" />
          <StatCard title="Courses" value={professorStats.courses} note="Available course records" />
        </div>

        <section className="ta-prof-card mt-6 p-5 md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-black/40">
                Search Records
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#2A4F33]">
                Professor Queue
              </h2>
              <p className="mt-1 text-sm font-semibold text-black/45">
                Search professor names, usernames, email addresses, or course assignments.
              </p>
            </div>

            <div className="grid w-full gap-3 xl:max-w-3xl xl:grid-cols-[1fr_auto_auto]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-2xl border border-black/10 bg-[#F6F6F1] px-4 text-sm font-bold text-[#2A4F33] outline-none transition focus:border-[#2A4F33]/40 focus:bg-white focus:ring-4 focus:ring-[#2A4F33]/10"
                placeholder="Search professor, username, email, or course"
              />

              <button
                type="button"
                onClick={loadProfessors}
                disabled={loading}
                className="ta-prof-pill bg-[#2A4F33] px-6 text-white shadow-sm hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>

              <div className="ta-prof-pill inline-flex items-center justify-center border border-black/10 bg-white px-6 text-[#2A4F33]">
                {courses.length} Courses
              </div>
            </div>
          </div>
        </section>

        <section className="ta-prof-card mt-6">
          <div className="flex flex-col gap-3 px-5 pb-4 pt-6 md:flex-row md:items-center md:justify-between md:px-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-black/40">
                Professor Accounts
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-[#2A4F33]">
                Instructor Access
              </h3>
              <p className="mt-1 text-sm font-semibold text-black/45">
                Showing {sortedProfessors.length} professor record{sortedProfessors.length === 1 ? "" : "s"}.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-[#E9F1D9] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-[#2F5E3A]">
              Page {page} of {totalPages}
            </span>
          </div>

          <div className="ta-prof-table-scroll">
            <div className="ta-prof-table px-5 pb-5 md:px-6">
              <div className="ta-prof-row rounded-2xl bg-[#F6F6F1] px-4 py-4 text-xs font-extrabold uppercase tracking-[0.18em] text-black/45">
                <div>Name</div>
                <div>Username</div>
                <div>Email</div>
                <div>Assignments</div>
                <div>Status</div>
                <div className="text-center">Actions</div>
              </div>

              <div className="mt-3 overflow-hidden rounded-2xl border border-black/5 bg-white">
                {loading ? (
                  [1, 2].map((item) => (
                    <div key={item} className="ta-prof-row ta-prof-data-row px-4 py-5">
                      <div className="h-4 rounded-full bg-black/10" />
                      <div className="h-4 rounded-full bg-black/10" />
                      <div className="h-4 rounded-full bg-black/10" />
                      <div className="h-4 rounded-full bg-black/10" />
                      <div className="h-6 rounded-full bg-black/10" />
                      <div className="h-8 rounded-full bg-black/10" />
                    </div>
                  ))
                ) : paginatedProfessors.length ? (
                  paginatedProfessors.map((professor) => {
                    const fullName = `${professor.firstName || ""} ${professor.lastName || ""}`.trim() || "Professor";
                    const initials = `${professor.firstName?.[0] || "P"}${professor.lastName?.[0] || ""}`.toUpperCase();
                    const id = String(professor?._id || "");

                    return (
                      <div key={professor._id} className="ta-prof-row ta-prof-data-row px-4 py-5 text-sm font-bold text-[#102418]">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="ta-prof-avatar">{initials}</span>
                          <div className="min-w-0">
                            <div className="truncate font-extrabold text-[#2A4F33]">{fullName}</div>
                            <div className="mt-1 text-xs font-semibold text-black/45">Professor Account</div>
                          </div>
                        </div>

                        <div className="break-words text-black/65">{professor.username || "-"}</div>

                        <div className="break-words text-black/65">{professor.email || "-"}</div>

                        <div className="text-black/65">
                          {(professor.courseAssignments || []).length ? (professor.courseAssignments || []).join(", ") : "-"}
                        </div>

                        <div>
                          <span className={`inline-flex min-w-[92px] justify-center rounded-full border px-3 py-1.5 text-[10px] font-black uppercase ${statusClass(professor.active)}`}>
                            {professor.active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="ta-prof-actions">
                          <button
                            type="button"
                            onClick={() => resetPassword(professor)}
                            disabled={actingId === id}
                            className="ta-prof-action ta-action-reset"
                          >
                            Reset
                          </button>

                          {professor.active ? (
                            <button
                              type="button"
                              onClick={() => setProfessorActive(professor, false)}
                              disabled={actingId === id}
                              className="ta-prof-action ta-action-disable"
                            >
                              Disable
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setProfessorActive(professor, true)}
                              disabled={actingId === id}
                              className="ta-prof-action ta-action-enable"
                            >
                              Enable
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-5 py-12 text-center text-sm font-bold text-black/45">
                    No professor accounts found. Create a course first.
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
      </div>
    </TrainingAdminLayout>
  );
}

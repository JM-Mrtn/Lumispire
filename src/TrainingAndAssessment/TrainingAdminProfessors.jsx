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
    <TrainingAdminLayout active="professors" title="Manage Professors" subtitle="Review professor accounts created from course records and reset credentials when needed.">
      {msg.text ? (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-bold ring-1 ${msg.type === "success" ? "bg-green-50 text-green-800 ring-green-200" : "bg-red-50 text-red-800 ring-red-200"}`}>{msg.text}</div>
      ) : null}

      {resetResult ? (
        <div className="mb-5 rounded-xl bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-900 ring-1 ring-yellow-200">
          Temporary password for {resetResult.professor}: {resetResult.temporaryPassword || "-"} | Username: {resetResult.username || "-"} | Email: {resetResult.email || "-"}
        </div>
      ) : null}

      <div className="mb-7 rounded-lg bg-[#2d5038] px-5 py-4 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div>
            <label className="text-base font-black uppercase text-white">Search</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="mt-1 h-8 w-full max-w-[360px] rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none" placeholder="Search professor" />
          </div>
          <button type="button" onClick={loadProfessors} disabled={loading} className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:opacity-60">{loading ? "Loading..." : "Refresh"}</button>
          <div className="h-8 rounded-md bg-white px-8 py-2 text-xs font-black text-[#2d5038]">{courses.length} Courses</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-[#2d5038] shadow-sm">
        <div className="bg-white px-4 py-4"><h3 className="text-lg font-black text-[#2d5038]">Professor Accounts</h3></div>
        <div className="min-h-[372px] divide-y divide-white/25">
          {loading ? (
            [1, 2].map((item) => <div key={item} className="grid gap-4 px-3 py-4 md:grid-cols-[64px_1.1fr_1fr_1.3fr_1.2fr_100px_170px] md:items-center"><div className="h-11 w-11 rounded-full bg-white" /><div className="h-4 rounded-full bg-white/35" /><div className="h-4 rounded-full bg-white/35" /><div className="h-4 rounded-full bg-white/35" /><div className="h-4 rounded-full bg-white/35" /><div className="h-5 rounded-full bg-[#bdf0a4]" /><div className="h-5 rounded-full bg-white" /></div>)
          ) : paginatedProfessors.length ? (
            paginatedProfessors.map((professor) => (
              <div key={professor._id} className="grid gap-4 px-3 py-4 text-sm font-black md:grid-cols-[64px_1.1fr_1fr_1.3fr_1.2fr_100px_170px] md:items-center">
                <div className="h-11 w-11 rounded-full bg-white" />
                <div className="text-white">{professor.firstName} {professor.lastName}</div>
                <div className="text-white/90">{professor.username || "-"}</div>
                <div className="break-words text-white/90">{professor.email || "-"}</div>
                <div className="text-white/90">{(professor.courseAssignments || []).join(", ") || "-"}</div>
                <div><span className={`inline-flex min-w-[84px] justify-center rounded-full px-3 py-1 text-[10px] font-black ${professor.active ? "bg-[#bdf0a4] text-[#2d5038]" : "bg-white text-[#2d5038]"}`}>{professor.active ? "Active" : "Inactive"}</span></div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => resetPassword(professor)} disabled={actingId === professor._id} className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#2d5038] disabled:opacity-60">Reset</button>
                  {professor.active ? <button type="button" onClick={() => setProfessorActive(professor, false)} disabled={actingId === professor._id} className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black text-red-800 disabled:opacity-60">Disable</button> : <button type="button" onClick={() => setProfessorActive(professor, true)} disabled={actingId === professor._id} className="rounded-full bg-[#bdf0a4] px-3 py-1 text-[10px] font-black text-[#2d5038] disabled:opacity-60">Enable</button>}
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-12 text-center text-sm font-bold text-white/80">No professor accounts found. Create a course first.</div>
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
    </TrainingAdminLayout>
  );
}

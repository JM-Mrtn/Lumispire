import React, { useEffect, useMemo, useState } from "react";
import ProfessorLayout from "./ProfessorLayout";
import {
  API_BASE,
  fetchJson,
  getStoredProfessor,
  normalizeCourseAssignments,
  professorAuthHeaders,
} from "./professorSession";

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

function BatchStatusPill({ status, isOpenNow }) {
  const tone =
    status === "archived"
      ? "bg-gray-100 text-gray-700 ring-gray-200"
      : status === "closed"
      ? "bg-red-50 text-red-700 ring-red-200"
      : isOpenNow
      ? "bg-green-50 text-green-700 ring-green-200"
      : "bg-yellow-50 text-yellow-700 ring-yellow-200";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ring-1 ${tone}`}>
      {status === "open" ? (isOpenNow ? "Open Now" : "Open Pending") : status}
    </span>
  );
}

export default function ProfessorBatches() {
  const storedProfessor = getStoredProfessor();
  const [allowedCourses] = useState(() => normalizeCourseAssignments(storedProfessor?.courseAssignments || []));
  const [courseFilter, setCourseFilter] = useState("");
  const [view, setView] = useState("current");
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const courseOptions = useMemo(() => {
    if (!allowedCourses.length) return [];
    return allowedCourses.length > 1 ? ["All", ...allowedCourses] : [...allowedCourses];
  }, [allowedCourses]);

  useEffect(() => {
    if (!allowedCourses.length) return;
    setCourseFilter((prev) => {
      if (prev && (prev === "All" || allowedCourses.includes(prev))) return prev;
      return allowedCourses.length > 1 ? "All" : allowedCourses[0];
    });
  }, [allowedCourses]);

  async function loadBatches() {
    try {
      if (!allowedCourses.length || !courseFilter) {
        setBatches([]);
        return;
      }

      setLoading(true);
      setMsg({ type: "", text: "" });
      const params = new URLSearchParams();
      params.set("view", view);
      if (courseFilter && courseFilter !== "All") params.set("course", courseFilter);

      const data = await fetchJson(`${API_BASE}/professors/batches?${params.toString()}`, {
        headers: professorAuthHeaders(),
      });

      setBatches(Array.isArray(data?.batches) ? data.batches : []);
    } catch (error) {
      setBatches([]);
      setMsg({ type: "error", text: error.message || "Failed to load batches." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!allowedCourses.length || !courseFilter) return;
    loadBatches();
  }, [allowedCourses.length, courseFilter, view]);

  return (
    <ProfessorLayout title="Batch Records" subtitle="Batch creation and editing are now handled by the Training Admin. Professors can view assigned course batches here.">
      {msg.text ? <div className={`mb-5 rounded-2xl px-4 py-3 text-sm font-semibold ${msg.type === "success" ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-red-50 text-red-800 ring-1 ring-red-200"}`}>{msg.text}</div> : null}

      <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-[#e2e8da]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#395345]">Assigned Batch Records</h2>
            <p className="mt-1 text-sm text-[#647166]">Use this page only for viewing current and past batches assigned to your course.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setView("current")} className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${view === "current" ? "bg-[#395345] text-white" : "bg-white text-[#395345] ring-1 ring-[#d7ddd0]"}`}>Current</button>
            <button type="button" onClick={() => setView("past")} className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${view === "past" ? "bg-[#395345] text-white" : "bg-white text-[#395345] ring-1 ring-[#d7ddd0]"}`}>Past</button>
            <button type="button" onClick={() => setView("all")} className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${view === "all" ? "bg-[#395345] text-white" : "bg-white text-[#395345] ring-1 ring-[#d7ddd0]"}`}>All</button>
          </div>
        </div>

        <div className="mt-4 w-full md:max-w-[280px]">
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f7c71]">Filter by Course</label>
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]">
            {courseOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div className="mt-5 space-y-4">
          {loading ? <div className="rounded-2xl bg-[#f9fbf7] px-4 py-5 text-sm text-[#647166] ring-1 ring-[#e2e8da]">Loading batches...</div> : null}
          {!loading && !batches.length ? <div className="rounded-2xl bg-[#f9fbf7] px-4 py-5 text-sm text-[#647166] ring-1 ring-[#e2e8da]">No batch records found.</div> : null}
          {!loading && batches.map((batch) => (
            <div key={batch._id} className="rounded-2xl bg-[#f9fbf7] p-4 ring-1 ring-[#e2e8da]">
              <div className="flex flex-wrap items-center gap-2">
                <BatchStatusPill status={batch.status} isOpenNow={batch.isOpenNow} />
                <span className="rounded-full bg-[#eef1e7] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#395345]">{batch.course}</span>
              </div>
              <div className="mt-3 text-lg font-extrabold text-[#395345]">{batch.batchName}</div>
              <div className="mt-1 text-sm font-semibold text-[#627165]">{batch.batchCode}</div>
              {batch.description ? <p className="mt-3 text-sm leading-6 text-[#647166]">{batch.description}</p> : null}
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-white p-3 ring-1 ring-[#e2e8da]"><div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6f7c71]">Capacity</div><div className="mt-1 text-sm font-semibold text-[#395345]">{batch.traineeCount} / {batch.maxTrainees}</div></div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-[#e2e8da]"><div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6f7c71]">Available Slots</div><div className="mt-1 text-sm font-semibold text-[#395345]">{batch.availableSlots}</div></div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-[#e2e8da]"><div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6f7c71]">Enrollment Opens</div><div className="mt-1 text-sm text-[#395345]">{formatDateTime(batch.enrollmentOpenAt)}</div></div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-[#e2e8da]"><div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6f7c71]">Enrollment Closes</div><div className="mt-1 text-sm text-[#395345]">{formatDateTime(batch.enrollmentCloseAt)}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProfessorLayout>
  );
}

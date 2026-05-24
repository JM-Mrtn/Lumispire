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
  const label = status === "open" ? (isOpenNow ? "Open Now" : "Open Pending") : status;

  const tone =
    status === "archived"
      ? "border-slate-200 bg-slate-50 text-slate-700"
      : status === "closed"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : isOpenNow
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-[#f4d484]/70 bg-[#fff7db] text-[#9a6800]";

  return (
    <span
      className={`inline-flex h-8 items-center justify-center rounded-full border px-3 text-[11px] font-extrabold uppercase tracking-[0.16em] ${tone}`}
    >
      {label}
    </span>
  );
}

function StatCard({ title, value, note }) {
  return (
    <article className="group relative min-h-[122px] overflow-hidden rounded-[24px] border border-white/80 bg-white p-5 shadow-[0_16px_40px_rgba(8,39,25,0.10)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(8,39,25,0.16)]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-16 -right-14 h-40 w-40 rounded-full bg-[#f4d484]/20 blur-2xl transition duration-300 group-hover:scale-110" />
      <p className="relative text-xs font-black uppercase tracking-[0.24em] text-[#071f14]/45">
        {title}
      </p>
      <p className="relative mt-4 text-4xl font-black leading-none tracking-tight text-[#071f14]">
        {value}
      </p>
      {note ? (
        <p className="relative mt-3 text-sm font-semibold leading-5 text-[#071f14]/55">
          {note}
        </p>
      ) : null}
    </article>
  );
}

function SectionCard({ eyebrow, title, description, children, className = "" }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-[#f4d484]/20 blur-2xl" />
      <div className="relative">
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#071f14]/45">
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071f14]">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#071f14]/55">
            {description}
          </p>
        ) : null}
        <div className={title || eyebrow || description ? "mt-5" : ""}>{children}</div>
      </div>
    </section>
  );
}

function ViewButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 min-w-[92px] items-center justify-center rounded-full px-4 text-xs font-black uppercase tracking-[0.12em] transition duration-200 ${
        active
          ? "bg-[#082719] text-white shadow-[0_14px_30px_rgba(8,39,25,0.22)]"
          : "border border-[#dbe4dc] bg-white text-[#071f14]/70 hover:border-[#235f3e]/40 hover:text-[#071f14]"
      }`}
    >
      {children}
    </button>
  );
}

export default function ProfessorBatches() {
  const storedProfessor = getStoredProfessor();
  const [allowedCourses] = useState(() =>
    normalizeCourseAssignments(storedProfessor?.courseAssignments || [])
  );
  const [courseFilter, setCourseFilter] = useState("");
  const [view, setView] = useState("current");
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const courseOptions = useMemo(() => {
    if (!allowedCourses.length) return [];
    return allowedCourses.length > 1 ? ["All", ...allowedCourses] : [...allowedCourses];
  }, [allowedCourses]);

  const batchStats = useMemo(() => {
    const openNow = batches.filter((batch) => batch.status === "open" && batch.isOpenNow).length;
    const openPending = batches.filter((batch) => batch.status === "open" && !batch.isOpenNow).length;
    const closed = batches.filter((batch) => batch.status === "closed").length;
    const archived = batches.filter((batch) => batch.status === "archived").length;

    return {
      total: batches.length,
      openNow,
      openPending,
      closed,
      archived,
    };
  }, [batches]);

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
    <ProfessorLayout
      title="Batch Records"
      subtitle="Batch creation and editing are now handled by the Training Admin. Professors can view assigned course batches here."
    >
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap");

        .professor-batches-page,
        .professor-batches-page button,
        .professor-batches-page input,
        .professor-batches-page select {
          font-family: "Open Sans", Arial, sans-serif;
        }
      `}</style>

      <div className="professor-batches-page space-y-6">
        {msg.text ? (
          <div
            className={`rounded-[22px] px-5 py-4 text-sm font-bold shadow-[0_14px_32px_rgba(8,39,25,0.08)] ring-1 ${
              msg.type === "success"
                ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                : "bg-rose-50 text-rose-800 ring-rose-200"
            }`}
          >
            {msg.text}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Batches" value={batchStats.total} note="Assigned records" />
          <StatCard title="Open Now" value={batchStats.openNow} note="Available for enrollment" />
          <StatCard title="Open Pending" value={batchStats.openPending} note="Scheduled batches" />
          <StatCard title="Closed / Archived" value={batchStats.closed + batchStats.archived} note="Past records" />
        </div>

        <SectionCard
          eyebrow="Search Records"
          title="Assigned Batch Records"
          description="Use this page only for viewing current and past batches assigned to your course."
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="grid gap-4 md:grid-cols-[minmax(220px,320px)_1fr] md:items-end">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#071f14]/60">
                  Filter by Course
                </span>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="mt-2 h-12 w-full rounded-full border border-[#dbe4dc] bg-[#fbfcfa] px-5 text-sm font-bold text-[#071f14] outline-none transition focus:border-[#235f3e] focus:bg-white focus:shadow-[0_0_0_4px_rgba(35,95,62,0.10)]"
                >
                  {courseOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#071f14]/60">
                  Batch View
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ViewButton active={view === "current"} onClick={() => setView("current")}>
                    Current
                  </ViewButton>
                  <ViewButton active={view === "past"} onClick={() => setView("past")}>
                    Past
                  </ViewButton>
                  <ViewButton active={view === "all"} onClick={() => setView("all")}>
                    All
                  </ViewButton>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={loadBatches}
              disabled={loading}
              className="inline-flex h-12 min-w-[112px] items-center justify-center rounded-full bg-[#235f3e] px-5 text-sm font-black text-white shadow-[0_16px_34px_rgba(8,39,25,0.22)] transition hover:-translate-y-0.5 hover:bg-[#174a30] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Batch Queue" title="Course Batch List">
          {loading ? (
            <div className="rounded-[20px] border border-[#dbe4dc] bg-[#fbfcfa] px-5 py-5 text-sm font-bold text-[#071f14]/60">
              Loading batches...
            </div>
          ) : null}

          {!loading && !batches.length ? (
            <div className="rounded-[20px] border border-[#dbe4dc] bg-[#fbfcfa] px-5 py-5 text-sm font-bold text-[#071f14]/60">
              No batch records found.
            </div>
          ) : null}

          {!loading && batches.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {batches.map((batch) => (
                <article
                  key={batch._id}
                  className="group relative overflow-hidden rounded-[24px] border border-[#dbe4dc] bg-[#fbfcfa] p-5 shadow-[0_14px_32px_rgba(8,39,25,0.07)] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_55px_rgba(8,39,25,0.13)]"
                >
                  <div className="absolute -bottom-16 -right-14 h-40 w-40 rounded-full bg-[#f4d484]/20 blur-2xl transition group-hover:scale-110" />
                  <div className="relative flex flex-wrap items-center gap-2">
                    <BatchStatusPill status={batch.status} isOpenNow={batch.isOpenNow} />
                    <span className="inline-flex h-8 items-center rounded-full bg-[#edf4ee] px-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#235f3e]">
                      {batch.course}
                    </span>
                  </div>

                  <div className="relative mt-4">
                    <h3 className="break-words text-xl font-black leading-tight tracking-tight text-[#071f14]">
                      {batch.batchName}
                    </h3>
                    <p className="mt-1 break-words text-sm font-extrabold uppercase tracking-[0.10em] text-[#071f14]/50">
                      {batch.batchCode}
                    </p>
                    {batch.description ? (
                      <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-[#071f14]/60">
                        {batch.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-[#dbe4dc] bg-white px-4 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#071f14]/45">
                        Capacity
                      </p>
                      <p className="mt-1 text-sm font-black text-[#071f14]">
                        {batch.traineeCount} / {batch.maxTrainees}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-[#dbe4dc] bg-white px-4 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#071f14]/45">
                        Available Slots
                      </p>
                      <p className="mt-1 text-sm font-black text-[#071f14]">
                        {batch.availableSlots}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-[#dbe4dc] bg-white px-4 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#071f14]/45">
                        Enrollment Opens
                      </p>
                      <p className="mt-1 text-sm font-bold leading-5 text-[#071f14]/70">
                        {formatDateTime(batch.enrollmentOpenAt)}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-[#dbe4dc] bg-white px-4 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#071f14]/45">
                        Enrollment Closes
                      </p>
                      <p className="mt-1 text-sm font-bold leading-5 text-[#071f14]/70">
                        {formatDateTime(batch.enrollmentCloseAt)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </SectionCard>
      </div>
    </ProfessorLayout>
  );
}

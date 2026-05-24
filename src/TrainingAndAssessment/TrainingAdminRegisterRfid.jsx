import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TrainingAdminLayout from "./TrainingAdminLayout";

function normalizeApiOrigin(raw) {
  const fallback = "http://localhost:5000";
  const r = String(raw || fallback).replace(/\/+$/, "");
  if (r.endsWith("/api")) return r.replace(/\/api$/i, "");
  return r;
}

const API_ORIGIN = normalizeApiOrigin(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const ROWS_PER_PAGE = 5;

function getAdminToken() {
  return localStorage.getItem("trainingAdminToken") || "";
}

function normalizeUid(value = "") {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-F0-9]/g, "");
}

export default function TrainingAdminRegisterRfid() {
  const navigate = useNavigate();

  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTraineeId, setSelectedTraineeId] = useState("");
  const [uid, setUid] = useState("");
  const [message, setMessage] = useState(
    "Select a trainee, then tap the RFID card."
  );
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!getAdminToken()) {
      navigate("/training-admin-login", { replace: true });
      return;
    }

    fetchTrainees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tag = document.activeElement?.tagName;
      const isTypingField =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (event.key === "Enter" || isTypingField) return;

      if (event.key.length === 1) {
        setUid((prev) => normalizeUid(prev + event.key));

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
          setMessage("RFID UID captured. Click Register RFID.");
        }, 250);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function fetchTrainees() {
    const token = getAdminToken();

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${API_ORIGIN}/api/training/rfid/trainees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTrainees(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load trainees.");
    } finally {
      setLoading(false);
    }
  }

  const courseOptions = useMemo(() => {
    const courses = trainees
      .map((trainee) => String(trainee?.course || "").trim())
      .filter(Boolean);

    return ["All", ...new Set(courses)];
  }, [trainees]);

  const filteredTrainees = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const selectedCourse = String(courseFilter || "All").trim();

    return trainees.filter((trainee) => {
      const fullName = String(trainee?.fullName || "").toLowerCase();
      const email = String(trainee?.email || "").toLowerCase();
      const rfidUid = String(trainee?.rfidUid || "").toLowerCase();
      const course = String(trainee?.course || "").toLowerCase();

      const matchesKeyword =
        !keyword ||
        fullName.includes(keyword) ||
        email.includes(keyword) ||
        rfidUid.includes(keyword) ||
        course.includes(keyword);

      const matchesCourse =
        selectedCourse === "All" ||
        String(trainee?.course || "").trim() === selectedCourse;

      return matchesKeyword && matchesCourse;
    });
  }, [trainees, search, courseFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTrainees.length / ROWS_PER_PAGE)
  );

  const paginatedTrainees = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredTrainees.slice(start, start + ROWS_PER_PAGE);
  }, [filteredTrainees, page]);

  useEffect(() => {
    setPage(1);
  }, [search, courseFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const selectedTrainee = trainees.find(
    (trainee) => String(trainee._id) === String(selectedTraineeId)
  );

  const registeredCount = trainees.filter((trainee) => trainee?.rfidUid).length;
  const unregisteredCount = trainees.length - registeredCount;

  function handleSelectTrainee(trainee) {
    setSelectedTraineeId(trainee._id);
    setMessage(
      `Selected ${trainee.fullName || "trainee"} from ${
        trainee.course || "No Course"
      }. Now tap the RFID card.`
    );
  }

  async function handleRegister() {
    const token = getAdminToken();
    const cleanUid = normalizeUid(uid);

    if (!selectedTraineeId) {
      setMessage("Please select a trainee first.");
      return;
    }

    if (!cleanUid) {
      setMessage("Please tap the RFID card first.");
      return;
    }

    try {
      setSubmitting(true);

      const { data } = await axios.post(
        `${API_ORIGIN}/api/training/rfid/register`,
        {
          traineeId: selectedTraineeId,
          uid: cleanUid,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(data?.message || "RFID card registered successfully.");
      setUid("");
      await fetchTrainees();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to register RFID card."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(traineeId) {
    const token = getAdminToken();

    try {
      const { data } = await axios.delete(
        `${API_ORIGIN}/api/training/rfid/remove/${traineeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(data?.message || "RFID card removed successfully.");

      if (String(selectedTraineeId) === String(traineeId)) {
        setUid("");
      }

      await fetchTrainees();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to remove RFID card."
      );
    }
  }

  const statCards = [
    { label: "All Trainees", value: trainees.length, note: "Available trainee records" },
    { label: "Registered RFID", value: registeredCount, note: "With assigned card UID" },
    { label: "Unregistered", value: unregisteredCount, note: "Waiting for card assignment" },
    { label: "Visible Records", value: filteredTrainees.length, note: "Matching current filters" },
  ];

  return (
    <TrainingAdminLayout
      active="rfid"
      title="Register RFID"
      subtitle="Select a trainee, capture the RFID card UID, then register or remove card assignments."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(8,39,25,.10)] before:absolute before:inset-x-0 before:top-0 before:h-[5px] before:bg-gradient-to-r before:from-[#235f3e] before:to-[#f4d484]"
            >
              <p className="text-[12px] font-extrabold uppercase tracking-[0.24em] text-[#8b9198]">
                {card.label}
              </p>
              <h3 className="mt-4 text-4xl font-extrabold leading-none text-[#071f14]">
                {card.value}
              </h3>
              <p className="mt-4 text-sm font-semibold text-[#071f14]/55">
                {card.note}
              </p>
            </article>
          ))}
        </section>

        <div className="rounded-[24px] border border-[#235f3e]/15 bg-[#f8fbf9] px-5 py-4 text-sm font-extrabold text-[#235f3e] shadow-[0_12px_28px_rgba(8,39,25,.08)]">
          {message}
        </div>

        <section className="relative overflow-hidden rounded-[26px] border border-white/75 bg-white/90 px-6 py-5 shadow-[0_16px_38px_rgba(8,39,25,.09)] before:absolute before:inset-x-0 before:top-0 before:h-[5px] before:bg-gradient-to-r before:from-[#235f3e] before:to-[#f4d484] sm:px-7 lg:px-8">
          <div className="grid gap-5 xl:grid-cols-[230px_minmax(0,1fr)] xl:items-end">
            <div className="max-w-[230px]">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.24em] text-[#8b9198]">
                Search Records
              </p>
              <h2 className="mt-2 text-[26px] font-extrabold leading-none text-[#235f3e]">
                RFID Queue
              </h2>
              <p className="mt-2 text-[13px] font-semibold leading-5 text-[#071f14]/55">
                Search trainees, filter by course, capture the UID, then refresh the latest RFID list.
              </p>
            </div>

            <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-[minmax(170px,1fr)_145px_minmax(170px,1fr)_auto_auto] xl:items-end">
              <label className="block">
                <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#235f3e]">
                  Search
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 w-full rounded-[15px] border border-[#071f14]/10 bg-[#fbfbf8] px-4 text-sm font-bold text-[#071f14] outline-none transition focus:border-[#235f3e] focus:bg-white focus:ring-4 focus:ring-[#235f3e]/10"
                  placeholder="Search name, email, course, or UID"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#235f3e]">
                  Course
                </span>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="h-11 w-full rounded-[15px] border border-[#071f14]/10 bg-[#fbfbf8] px-4 text-sm font-bold text-[#071f14] outline-none transition focus:border-[#235f3e] focus:bg-white focus:ring-4 focus:ring-[#235f3e]/10"
                >
                  {courseOptions.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#235f3e]">
                  Captured UID
                </span>
                <input
                  value={uid}
                  onChange={(e) => setUid(normalizeUid(e.target.value))}
                  className="h-11 w-full rounded-[15px] border border-[#071f14]/10 bg-[#fbfbf8] px-4 font-mono text-sm font-bold text-[#071f14] outline-none transition focus:border-[#235f3e] focus:bg-white focus:ring-4 focus:ring-[#235f3e]/10"
                  placeholder="Tap card or type UID"
                />
              </label>

              <button
                type="button"
                onClick={fetchTrainees}
                disabled={loading}
                className="h-11 w-full rounded-[15px] bg-[#235f3e] px-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(8,39,25,.16)] transition hover:-translate-y-0.5 hover:bg-[#174a30] disabled:cursor-not-allowed disabled:opacity-60 md:col-span-1 xl:w-[108px] xl:justify-self-start"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={handleRegister}
                disabled={submitting}
                className="h-11 w-full rounded-[15px] bg-gradient-to-r from-[#f4d484] to-[#d7a84d] px-4 text-sm font-extrabold leading-tight text-[#071f14] shadow-[0_10px_20px_rgba(215,168,77,.20)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-1 xl:w-[118px] xl:justify-self-start"
              >
                {submitting ? "Registering..." : "Register RFID"}
              </button>
            </div>
          </div>

          {selectedTrainee ? (
            <div className="mt-5 rounded-[20px] border border-[#235f3e]/12 bg-[#f8fbf9] px-5 py-4 text-sm font-bold leading-6 text-[#071f14]/70">
              <span className="font-extrabold text-[#235f3e]">Selected:</span>{" "}
              {selectedTrainee.fullName || "-"} • {selectedTrainee.email || "-"} • Course:{" "}
              {selectedTrainee.course || "No Course"} • Current RFID:{" "}
              {selectedTrainee.rfidUid || "None"}
            </div>
          ) : null}
        </section>

        <section className="relative overflow-hidden rounded-[28px] border border-white/75 bg-white/90 shadow-[0_18px_45px_rgba(8,39,25,.10)] before:absolute before:inset-x-0 before:top-0 before:h-[5px] before:bg-gradient-to-r before:from-[#235f3e] before:to-[#f4d484]">
          <div className="px-6 pb-5 pt-8">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.24em] text-[#8b9198]">
              RFID Requests
            </p>
            <h3 className="mt-3 text-3xl font-extrabold text-[#235f3e]">
              Trainee RFID List
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1080px] w-full border-collapse">
              <thead>
                <tr className="border-y border-[#071f14]/10 bg-[#f8fbf9] text-left text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#667085]">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">RFID UID</th>
                  <th className="w-[220px] px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#071f14]/8">
                {loading ? (
                  [1, 2, 3].map((item) => (
                    <tr key={item}>
                      <td className="px-6 py-5"><div className="h-4 w-40 rounded-full bg-[#071f14]/10" /></td>
                      <td className="px-6 py-5"><div className="h-4 w-52 rounded-full bg-[#071f14]/10" /></td>
                      <td className="px-6 py-5"><div className="h-7 w-32 rounded-full bg-[#235f3e]/10" /></td>
                      <td className="px-6 py-5"><div className="h-7 w-24 rounded-full bg-[#f4d484]/45" /></td>
                      <td className="px-6 py-5"><div className="h-4 w-36 rounded-full bg-[#071f14]/10" /></td>
                      <td className="px-5 py-4"><div className="mx-auto h-9 w-44 rounded-full bg-[#071f14]/10" /></td>
                    </tr>
                  ))
                ) : paginatedTrainees.length ? (
                  paginatedTrainees.map((trainee) => {
                    const isSelected = String(selectedTraineeId) === String(trainee._id);

                    return (
                      <tr
                        key={trainee._id}
                        className={`text-sm font-bold text-[#071f14] transition hover:bg-[#f8fbf9] ${
                          isSelected ? "bg-[#f8fbf9]" : "bg-white/60"
                        }`}
                      >
                        <td className="px-6 py-4 align-middle">
                          <div className="font-extrabold text-[#071f14]">
                            {trainee.fullName || "Full name of the trainee"}
                          </div>
                        </td>

                        <td className="break-words px-6 py-4 align-middle text-[#071f14]/70">
                          {trainee.email || "traineeemail@tamsi.com"}
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <span className="inline-flex rounded-full bg-[#235f3e]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#235f3e]">
                            {trainee.course || "No Course"}
                          </span>
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <span
                            className={`inline-flex min-w-[92px] justify-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                              trainee.active !== false
                                ? "bg-[#235f3e]/10 text-[#235f3e]"
                                : "bg-[#f4d484]/40 text-[#8a5b00]"
                            }`}
                          >
                            {trainee.active !== false ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4 align-middle font-mono text-[#071f14]/70">
                          {trainee.rfidUid || "-"}
                        </td>

                        <td className="w-[220px] px-5 py-4 align-middle">
                          <div className="mx-auto flex w-full max-w-[190px] flex-wrap items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectTrainee(trainee)}
                              className={`inline-flex h-9 w-[88px] items-center justify-center rounded-full text-[11px] font-extrabold transition hover:-translate-y-0.5 ${
                                isSelected
                                  ? "bg-gradient-to-r from-[#f4d484] to-[#d7a84d] text-[#071f14] shadow-[0_10px_24px_rgba(215,168,77,.22)]"
                                  : "border border-[#235f3e]/18 bg-white text-[#235f3e] shadow-[0_8px_18px_rgba(8,39,25,.08)] hover:bg-[#f8fbf9]"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </button>

                            {trainee.rfidUid ? (
                              <button
                                type="button"
                                onClick={() => handleRemove(trainee._id)}
                                className="inline-flex h-9 w-[88px] items-center justify-center rounded-full border border-[#d7a84d]/45 bg-[#fff4d7] text-[11px] font-extrabold text-[#8a5b00] shadow-[0_8px_18px_rgba(215,168,77,.12)] transition hover:-translate-y-0.5 hover:bg-[#f4d484]/45"
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-14 text-center text-sm font-bold text-[#071f14]/55">
                      No trainees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col gap-3 rounded-[22px] border border-white/70 bg-white/85 px-5 py-4 text-sm font-bold text-[#071f14]/70 shadow-[0_12px_28px_rgba(8,39,25,.07)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            Page <span className="font-extrabold text-[#235f3e]">{page}</span> / {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="h-10 rounded-full border border-[#071f14]/10 bg-white px-5 text-sm font-extrabold text-[#235f3e] transition hover:bg-[#f8fbf9] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="h-10 rounded-full bg-[#235f3e] px-5 text-sm font-extrabold text-white transition hover:bg-[#174a30] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
    </TrainingAdminLayout>
  );
}

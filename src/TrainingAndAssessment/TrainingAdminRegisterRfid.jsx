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

  return (
    <TrainingAdminLayout
      active="rfid"
      title="Register Trainee RFID"
      subtitle="Select a trainee, tap the RFID card, then register or remove the UID."
    >
      <div className="mb-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800 ring-1 ring-blue-200">
        {message}
      </div>

      <div className="mb-7 rounded-lg bg-[#2d5038] px-5 py-4 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_220px_1fr_auto_auto] lg:items-end">
          <div>
            <label className="text-base font-black uppercase text-white">
              Search
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 h-8 w-full rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none"
              placeholder="Search by name, email, course, or UID"
            />
          </div>

          <div>
            <label className="text-base font-black uppercase text-white">
              Course
            </label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="mt-1 h-8 w-full rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none"
            >
              {courseOptions.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-base font-black uppercase text-white">
              Captured UID
            </label>
            <input
              value={uid}
              onChange={(e) => setUid(normalizeUid(e.target.value))}
              className="mt-1 h-8 w-full rounded-lg border-0 bg-white px-4 font-mono text-sm font-bold text-[#2d5038] outline-none"
              placeholder="Tap card or type UID"
            />
          </div>

          <button
            type="button"
            onClick={fetchTrainees}
            disabled={loading}
            className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={handleRegister}
            disabled={submitting}
            className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:opacity-60"
          >
            {submitting ? "Registering..." : "Register RFID"}
          </button>
        </div>

        {selectedTrainee ? (
          <div className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white">
            Selected: {selectedTrainee.fullName || "-"} •{" "}
            {selectedTrainee.email || "-"} • Course:{" "}
            {selectedTrainee.course || "No Course"} • Current RFID:{" "}
            {selectedTrainee.rfidUid || "None"}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg bg-[#2d5038] shadow-sm">
        <div className="bg-white px-4 py-4">
          <h3 className="text-lg font-black text-[#2d5038]">
            Trainee RFID List
          </h3>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1050px]">
            <div className="grid gap-4 border-b border-white/20 px-3 py-3 text-xs font-black uppercase tracking-wide text-white/80 md:grid-cols-[56px_1.15fr_1.25fr_1fr_92px_1fr_160px] md:items-center">
              <div />
              <div>Name</div>
              <div>Email</div>
              <div>Course</div>
              <div>Status</div>
              <div>RFID UID</div>
              <div>Action</div>
            </div>

            <div className="min-h-[372px] divide-y divide-white/25">
              {loading ? (
                [1, 2].map((item) => (
                  <div
                    key={item}
                    className="grid gap-4 px-3 py-4 md:grid-cols-[56px_1.15fr_1.25fr_1fr_92px_1fr_160px] md:items-center"
                  >
                    <div className="h-11 w-11 rounded-full bg-white" />
                    <div className="h-4 rounded-full bg-white/35" />
                    <div className="h-4 rounded-full bg-white/35" />
                    <div className="h-4 rounded-full bg-white/35" />
                    <div className="h-5 rounded-full bg-[#bdf0a4]" />
                    <div className="h-4 rounded-full bg-white/35" />
                    <div className="h-5 rounded-full bg-white" />
                  </div>
                ))
              ) : paginatedTrainees.length ? (
                paginatedTrainees.map((trainee) => (
                  <div
                    key={trainee._id}
                    className="grid gap-4 px-3 py-4 text-sm font-black md:grid-cols-[56px_1.15fr_1.25fr_1fr_92px_1fr_160px] md:items-center"
                  >
                    <div className="h-11 w-11 rounded-full bg-white" />

                    <div className="text-white">
                      {trainee.fullName || "Full name of the trainee"}
                    </div>

                    <div className="break-words text-white/90">
                      {trainee.email || "traineeemail@tamsi.com"}
                    </div>

                    <div>
                      <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-black text-white ring-1 ring-white/25">
                        {trainee.course || "No Course"}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`inline-flex min-w-[84px] justify-center rounded-full px-3 py-1 text-[10px] font-black ${
                          trainee.active !== false
                            ? "bg-[#bdf0a4] text-[#2d5038]"
                            : "bg-white text-[#2d5038]"
                        }`}
                      >
                        {trainee.active !== false ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="font-mono text-white/90">
                      {trainee.rfidUid || "-"}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectTrainee(trainee)}
                        className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#2d5038]"
                      >
                        Select
                      </button>

                      {trainee.rfidUid ? (
                        <button
                          type="button"
                          onClick={() => handleRemove(trainee._id)}
                          className="rounded-full bg-[#bdf0a4] px-3 py-1 text-[10px] font-black text-[#2d5038]"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-12 text-center text-sm font-bold text-white/80">
                  No trainees found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between px-2 text-base font-bold">
        <div>
          Page {page} / {totalPages}
        </div>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="text-3xl leading-none text-white disabled:opacity-30"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="font-black text-white disabled:opacity-30"
          >
            Next Page
          </button>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="text-3xl leading-none text-white disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>
    </TrainingAdminLayout>
  );
}
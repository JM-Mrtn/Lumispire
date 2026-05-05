import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  API_BASE,
  fetchJson,
  getStoredProfessor,
  normalizeCourseAssignments,
  professorAuthHeaders,
} from "./professorSession";

const ROWS_PER_PAGE = 5;

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

function getProfessorName(professor) {
  return (
    professor?.name ||
    `${professor?.firstName || ""} ${professor?.lastName || ""}`.trim() ||
    professor?.username ||
    professor?.email ||
    "Professor Name"
  );
}

function getTraineeId(trainee) {
  return String(trainee?._id || trainee?.traineeUserId || "").trim();
}

function getTraineeName(trainee) {
  return (
    `${trainee?.firstName || ""} ${trainee?.lastName || ""}`.trim() ||
    trainee?.fullName ||
    trainee?.name ||
    "Full name of the trainee"
  );
}

function getTraineeEmail(trainee) {
  return trainee?.email || "traineeemail@tamsi.com";
}

function getTraineeCourse(trainee) {
  return trainee?.course || trainee?.courseName || "Course";
}

function getProgressTone(progress) {
  if (!progress) return "default";
  if (progress.isEligibleForCompletion) return "green";
  if (Number(progress.progressPercent || 0) >= 70) return "blue";
  if (Number(progress.progressPercent || 0) >= 35) return "yellow";
  return "default";
}

function progressPillClass(progress) {
  const tone = getProgressTone(progress);

  if (tone === "green") return "bg-[#bdf0a4] text-[#2d5038]";
  if (tone === "blue") return "bg-blue-100 text-blue-800";
  if (tone === "yellow") return "bg-yellow-100 text-yellow-800";

  return "bg-white text-[#2d5038]";
}

function statusPillClass(status = "") {
  const clean = String(status || "").toLowerCase();

  if (clean === "issued" || clean === "completed" || clean === "passed") {
    return "bg-[#bdf0a4] text-[#2d5038]";
  }

  if (clean === "enrolled" || clean === "active") {
    return "bg-blue-100 text-blue-800";
  }

  return "bg-yellow-100 text-yellow-800";
}

function Badge({ tone = "default", children }) {
  const cls =
    tone === "green"
      ? "bg-green-50 text-green-700 ring-green-200"
      : tone === "blue"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : tone === "yellow"
      ? "bg-yellow-50 text-yellow-700 ring-yellow-200"
      : tone === "red"
      ? "bg-red-50 text-red-700 ring-red-200"
      : "bg-[#eef1e7] text-[#395345] ring-[#d7ddd0]";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-black ring-1 ${cls}`}
    >
      {children}
    </span>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e2e8da]">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-[#6f7c71]">
        {label}
      </div>

      <div className="mt-2 text-lg font-black text-[#395345]">{value}</div>
    </div>
  );
}

function ModalShell({ open, onClose, title, children, maxWidth = "max-w-6xl" }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} max-h-[90vh] overflow-hidden rounded-[28px] bg-white text-[#395345] shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e8ece2] px-6 py-4">
          <h3 className="text-xl font-black">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d7ddd0] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#395345]"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function getCompetencyCompleted(progress) {
  return Number(progress?.competencyCounts?.completed || 0);
}

function getCompetencyTotal(progress) {
  return Number(progress?.competencyCounts?.total || 0);
}

function getIncompleteReasons(progress) {
  return Array.isArray(progress?.incompleteReasons)
    ? progress.incompleteReasons
    : [];
}

function normalizeLearningPath(value = "") {
  const clean = String(value || "").trim().toLowerCase();

  if (clean === "advanced") return "advanced";
  if (clean === "intermediate") return "intermediate";

  return "beginner";
}

function learningPathLabel(value = "") {
  const clean = normalizeLearningPath(value);

  if (clean === "advanced") return "Advanced";
  if (clean === "intermediate") return "Intermediate";

  return "Beginner";
}

function learningPathBadgeClass(value = "") {
  const clean = normalizeLearningPath(value);

  if (clean === "advanced") return "bg-green-50 text-green-700 ring-green-200";
  if (clean === "intermediate") return "bg-blue-50 text-blue-700 ring-blue-200";

  return "bg-yellow-50 text-yellow-700 ring-yellow-200";
}

function PretestEvaluationModal({ open, onClose, trainee, progress }) {
  const pretest = progress?.pretest || null;
  const results = Array.isArray(pretest?.results) ? pretest.results : [];
  const incorrectResults = results.filter((item) => item?.isCorrect !== true);
  const correctCount = results.filter((item) => item?.isCorrect === true).length;
  const evaluation = pretest?.evaluation || {};

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={`Pre-Test Evaluation${
        trainee ? ` • ${getTraineeName(trainee)}` : ""
      }`}
      maxWidth="max-w-7xl"
    >
      {!pretest?.completed ? (
        <div className="rounded-2xl bg-[#f7f8f3] px-5 py-6 text-sm text-[#647166] ring-1 ring-[#e2e8da]">
          This trainee has not completed the pre-test yet.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              label="Score"
              value={`${Number(pretest?.scorePercent || 0)}%`}
            />

            <div className="rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e2e8da]">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[#6f7c71]">
                Learning Path
              </div>

              <div className="mt-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${learningPathBadgeClass(
                    pretest?.learningPathLevel
                  )}`}
                >
                  {learningPathLabel(pretest?.learningPathLevel)}
                </span>
              </div>
            </div>

            <SummaryCard label="Correct" value={correctCount} />
            <SummaryCard label="Incorrect" value={incorrectResults.length} />
            <SummaryCard
              label="Last Taken"
              value={formatDateTime(pretest?.lastTakenAt)}
            />
          </div>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
            <div className="text-sm font-black text-[#395345]">
              Evaluation Summary
            </div>

            <p className="mt-2 text-sm leading-7 text-[#647166]">
              {evaluation?.summary || "No summary generated yet."}
            </p>

            {pretest?.learningGoal ? (
              <div className="mt-4 rounded-2xl bg-[#f9fbf7] p-4 ring-1 ring-[#e2e8da]">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-[#6f7c71]">
                  Trainee Learning Goal
                </div>

                <div className="mt-2 text-sm text-[#395345]">
                  {pretest.learningGoal}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
              <div className="text-sm font-black text-[#395345]">Strengths</div>

              <div className="mt-3 space-y-2 text-sm text-[#647166]">
                {Array.isArray(evaluation?.strengths) &&
                evaluation.strengths.length ? (
                  evaluation.strengths.map((item, index) => (
                    <div key={`strength-${index}`}>• {item}</div>
                  ))
                ) : (
                  <div>No strength summary yet.</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
              <div className="text-sm font-black text-[#395345]">Weaknesses</div>

              <div className="mt-3 space-y-2 text-sm text-[#647166]">
                {Array.isArray(evaluation?.weaknesses) &&
                evaluation.weaknesses.length ? (
                  evaluation.weaknesses.map((item, index) => (
                    <div key={`weakness-${index}`}>• {item}</div>
                  ))
                ) : (
                  <div>No weakness summary yet.</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
              <div className="text-sm font-black text-[#395345]">
                Suggested Focus Areas
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {Array.isArray(evaluation?.suggestedFocusAreas) &&
                evaluation.suggestedFocusAreas.length ? (
                  evaluation.suggestedFocusAreas.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-black text-yellow-700 ring-1 ring-yellow-200"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <div className="text-sm text-[#647166]">
                    No focus areas yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
              <div className="text-sm font-black text-[#395345]">
                Recommendations
              </div>

              <div className="mt-3 space-y-2 text-sm text-[#647166]">
                {Array.isArray(evaluation?.recommendations) &&
                evaluation.recommendations.length ? (
                  evaluation.recommendations.map((item, index) => (
                    <div key={`recommendation-${index}`}>• {item}</div>
                  ))
                ) : (
                  <div>No recommendations yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
            <div className="text-sm font-black text-[#395345]">
              Professor Action Plan
            </div>

            <div className="mt-3 space-y-2 text-sm text-[#647166]">
              {Array.isArray(evaluation?.professorActions) &&
              evaluation.professorActions.length ? (
                evaluation.professorActions.map((item, index) => (
                  <div key={`action-${index}`}>• {item}</div>
                ))
              ) : (
                <div>No action plan generated yet.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
            <div className="text-sm font-black text-[#395345]">
              Incorrect Answers Breakdown
            </div>

            {!incorrectResults.length ? (
              <div className="mt-3 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 ring-1 ring-green-200">
                No incorrect answers recorded for this pre-test.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {incorrectResults.map((item, index) => (
                  <div
                    key={`${item?.questionId || "incorrect"}-${index}`}
                    className="rounded-2xl bg-[#f9fbf7] p-4 ring-1 ring-[#e2e8da]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="red">Incorrect</Badge>
                      {item?.category ? (
                        <Badge tone="yellow">{item.category}</Badge>
                      ) : null}
                    </div>

                    <div className="mt-3 text-base font-black text-[#395345]">
                      {item?.prompt || "Untitled question"}
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl bg-white p-3 ring-1 ring-[#e2e8da]">
                        <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6f7c71]">
                          Trainee Answer
                        </div>

                        <div className="mt-2 text-sm text-[#395345]">
                          {item?.selectedAnswer || "-"}
                        </div>
                      </div>

                      <div className="rounded-xl bg-white p-3 ring-1 ring-[#e2e8da]">
                        <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6f7c71]">
                          Correct Answer
                        </div>

                        <div className="mt-2 text-sm text-[#395345]">
                          {item?.correctAnswer || "-"}
                        </div>
                      </div>
                    </div>

                    {item?.explanation ? (
                      <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-[#e2e8da]">
                        <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6f7c71]">
                          Explanation
                        </div>

                        <div className="mt-2 text-sm leading-6 text-[#647166]">
                          {item.explanation}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  );
}

export default function ProfessorProgress() {
  const navigate = useNavigate();
  const storedProfessor = useMemo(() => getStoredProfessor(), []);

  const [allowedCourses] = useState(() =>
    normalizeCourseAssignments(storedProfessor?.courseAssignments || [])
  );

  const [course, setCourse] = useState("");
  const [search, setSearch] = useState("");
  const [trainees, setTrainees] = useState([]);
  const [progressById, setProgressById] = useState({});
  const [passRemarksById, setPassRemarksById] = useState({});
  const [competencySavingId, setCompetencySavingId] = useState("");
  const [passingId, setPassingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [selectedPretestTraineeId, setSelectedPretestTraineeId] = useState("");
  const [selectedDetailTraineeId, setSelectedDetailTraineeId] = useState("");
  const [page, setPage] = useState(1);

  const professorName = getProfessorName(storedProfessor);
  const professorEmail = storedProfessor?.email || "traineemail@tamsi.com";

  const menuItems = [
    { label: "Dashboard", path: "/professor-dashboard" },
    { label: "Manage Attendance", path: "/professor-attendance" },
    { label: "Manage Assignment", path: "/professor-assessments" },
    { label: "Manage Modules", path: "/professor-modules" },
    { label: "Manage Progress", path: "/professor-progress" },
  ];

  const courseOptions = useMemo(() => {
    if (!allowedCourses.length) return [];
    return allowedCourses.length > 1 ? ["All", ...allowedCourses] : allowedCourses;
  }, [allowedCourses]);

  useEffect(() => {
    if (!allowedCourses.length) return;

    setCourse((prev) => {
      if (prev && (prev === "All" || allowedCourses.includes(prev))) return prev;
      return allowedCourses.length > 1 ? "All" : allowedCourses[0];
    });
  }, [allowedCourses]);

  const courseQuery = useMemo(
    () =>
      course && course !== "All"
        ? `?course=${encodeURIComponent(course)}`
        : "",
    [course]
  );

  async function loadProgressForTrainees(traineeList = []) {
    const entries = await Promise.all(
      traineeList.map(async (trainee) => {
        const traineeId = getTraineeId(trainee);

        if (!traineeId) return [traineeId, null];

        try {
          const result = await fetchJson(
            `${API_BASE}/professors/trainees/${traineeId}/progress`,
            {
              headers: professorAuthHeaders(),
            }
          );

          return [traineeId, result?.progress || null];
        } catch {
          return [traineeId, null];
        }
      })
    );

    return Object.fromEntries(entries.filter(([key]) => key));
  }

  async function loadAll() {
    try {
      if (!allowedCourses.length || !course) {
        setTrainees([]);
        setProgressById({});
        return;
      }

      setLoading(true);
      setMsg({ type: "", text: "" });

      const traineeData = await fetchJson(
        `${API_BASE}/professors/trainees${courseQuery}`,
        {
          headers: professorAuthHeaders(),
        }
      );

      const traineeList = Array.isArray(traineeData?.trainees)
        ? traineeData.trainees
        : [];

      setTrainees(traineeList);

      const nextProgress = await loadProgressForTrainees(traineeList);
      setProgressById(nextProgress);
    } catch (error) {
      setTrainees([]);
      setProgressById({});
      setMsg({
        type: "error",
        text: error.message || "Failed to load progress.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!allowedCourses.length || !course) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedCourses.length, course, courseQuery]);

  async function handleToggleCompetency(traineeId, code, checked) {
    try {
      const current = new Set(
        progressById?.[traineeId]?.completedCompetencyCodes || []
      );

      if (checked) current.add(code);
      else current.delete(code);

      setCompetencySavingId(`${traineeId}:${code}`);
      setMsg({ type: "", text: "" });

      const result = await fetchJson(
        `${API_BASE}/professors/trainees/${traineeId}/competencies`,
        {
          method: "PATCH",
          headers: professorAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            completedCompetencyCodes: Array.from(current),
            remarks: passRemarksById[traineeId] || "",
          }),
        }
      );

      setProgressById((prev) => ({
        ...prev,
        [traineeId]: result?.progress || prev?.[traineeId] || null,
      }));

      setMsg({
        type: "success",
        text: "Competency checklist updated successfully.",
      });
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to update competency checklist.",
      });
    } finally {
      setCompetencySavingId("");
    }
  }

  async function handleMarkPassed(trainee) {
    try {
      const traineeId = getTraineeId(trainee);

      if (!traineeId) throw new Error("Trainee id is missing.");

      setPassingId(traineeId);
      setMsg({ type: "", text: "" });

      const result = await fetchJson(
        `${API_BASE}/professors/trainees/${traineeId}/pass`,
        {
          method: "PATCH",
          headers: professorAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            remarks: passRemarksById[traineeId] || "",
          }),
        }
      );

      setMsg({
        type: "success",
        text:
          result?.message ||
          "Trainee marked as completed and certificate issued successfully.",
      });

      await loadAll();
    } catch (error) {
      const traineeId = getTraineeId(trainee);
      const fallbackReasons = getIncompleteReasons(progressById?.[traineeId]);

      setMsg({
        type: "error",
        text:
          error.message ||
          (fallbackReasons.length
            ? fallbackReasons.join(" ")
            : "Failed to mark trainee as passed."),
      });
    } finally {
      setPassingId("");
    }
  }

  const sortedTrainees = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return [...trainees]
      .filter((trainee) => {
        if (!keyword) return true;

        const traineeId = getTraineeId(trainee);
        const progress = progressById[traineeId];

        const haystack = [
          getTraineeName(trainee),
          getTraineeEmail(trainee),
          getTraineeCourse(trainee),
          trainee?.trainingStatus,
          trainee?.certificateStatus,
          `${Number(progress?.progressPercent || 0)}%`,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(keyword);
      })
      .sort((a, b) => getTraineeName(a).localeCompare(getTraineeName(b)));
  }, [trainees, progressById, search]);

  const totalPages = Math.max(1, Math.ceil(sortedTrainees.length / ROWS_PER_PAGE));

  const paginatedTrainees = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return sortedTrainees.slice(start, start + ROWS_PER_PAGE);
  }, [sortedTrainees, page]);

  useEffect(() => {
    setPage(1);
  }, [course, search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const selectedTrainee = useMemo(() => {
    return (
      sortedTrainees.find(
        (item) => String(item?._id || "") === selectedPretestTraineeId
      ) || null
    );
  }, [sortedTrainees, selectedPretestTraineeId]);

  const selectedProgress = selectedPretestTraineeId
    ? progressById[selectedPretestTraineeId] || null
    : null;

  const detailTrainee = useMemo(() => {
    return (
      sortedTrainees.find(
        (item) => getTraineeId(item) === selectedDetailTraineeId
      ) || null
    );
  }, [sortedTrainees, selectedDetailTraineeId]);

  const detailProgress = selectedDetailTraineeId
    ? progressById[selectedDetailTraineeId] || null
    : null;

  function handleLogout() {
    localStorage.removeItem("professorToken");
    localStorage.removeItem("professor");
    localStorage.removeItem("professorUser");
    localStorage.removeItem("storedProfessor");

    navigate("/professor-login");
  }

  return (
    <div className="min-h-screen bg-[#12391f] font-sans text-white">
      <header className="flex h-[88px] items-center bg-white px-6 shadow-sm md:px-10">
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#2d5238] bg-white text-sm font-black text-[#2d5238]">
            LC
          </div>

          <h1 className="text-xl font-black uppercase tracking-wide text-[#2d5238] md:text-3xl">
            Training &amp; Assessment
          </h1>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-88px)] flex-col lg:flex-row">
        <aside className="flex w-full flex-col bg-[#2d5038] lg:w-[267px]">
          <div className="border-b border-white/15 px-6 py-8 text-center">
            <div className="mx-auto h-[76px] w-[76px] rounded-full border-4 border-[#b7bbb6] bg-white shadow-sm" />

            <h2 className="mt-5 text-base font-black uppercase leading-tight">
              {professorName}
            </h2>

            <p className="mt-1 break-words text-xs font-semibold text-white/80">
              {professorEmail}
            </p>
          </div>

          <nav className="flex-1 py-6">
            {menuItems.map((item) => {
              const active = item.label === "Manage Progress";

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`block w-full px-11 py-4 text-left text-sm font-black uppercase transition ${
                    active
                      ? "bg-[#d8e0da] text-[#1e3e2a]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="px-20 pb-10">
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-black uppercase text-white transition hover:text-[#d8e0da]"
            >
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 bg-[#12391f] px-5 py-6 md:px-8 lg:px-8">
          <section className="mx-auto max-w-[1040px]">
            <div className="mb-7">
              <h2 className="text-3xl font-black uppercase tracking-tight md:text-[34px]">
                Manage Trainee Progress
              </h2>

              <div className="mt-1 h-1 w-full max-w-[500px] bg-white/60" />
            </div>

            {msg.text ? (
              <div
                className={`mb-5 rounded-xl px-4 py-3 text-sm font-bold ring-1 ${
                  msg.type === "success"
                    ? "bg-green-50 text-green-800 ring-green-200"
                    : "bg-red-50 text-red-800 ring-red-200"
                }`}
              >
                {msg.text}
              </div>
            ) : null}

            <div className="mb-9 rounded-lg bg-[#2d5038] px-5 py-4 shadow-sm">
              <div className="grid gap-5 lg:grid-cols-[260px_1fr_auto] lg:items-end">
                <div>
                  <label className="text-base font-black uppercase text-white">
                    Course
                  </label>

                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    disabled={courseOptions.length <= 1}
                    className="mt-1 h-8 w-full rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none disabled:bg-white/80"
                  >
                    {!courseOptions.length ? (
                      <option value="">No assigned course</option>
                    ) : (
                      courseOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-base font-black uppercase text-white">
                    Search
                  </label>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mt-1 h-8 w-full rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none"
                    placeholder=""
                  />
                </div>

                <button
                  type="button"
                  onClick={loadAll}
                  disabled={loading || !course}
                  className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-[#2d5038] shadow-sm">
              <div className="bg-white px-4 py-4">
                <h3 className="text-lg font-black text-[#2d5038]">
                  Trainee Progress
                </h3>
              </div>

              <div className="min-h-[372px] divide-y divide-white/25">
                {loading ? (
                  [1, 2].map((item) => (
                    <div
                      key={item}
                      className="grid gap-4 px-3 py-4 md:grid-cols-[64px_1.25fr_1.25fr_.85fr_.8fr_110px_90px] md:items-center"
                    >
                      <div className="h-11 w-11 rounded-full bg-white" />
                      <div className="h-4 rounded-full bg-white/35" />
                      <div className="h-4 rounded-full bg-white/35" />
                      <div className="h-4 rounded-full bg-white/35" />
                      <div className="h-4 rounded-full bg-white/35" />
                      <div className="h-5 rounded-full bg-[#bdf0a4]" />
                      <div className="h-5 rounded-full bg-white" />
                    </div>
                  ))
                ) : paginatedTrainees.length ? (
                  paginatedTrainees.map((trainee) => {
                    const traineeId = getTraineeId(trainee);
                    const progress = progressById[traineeId];
                    const progressPercent = Number(progress?.progressPercent || 0);
                    const status =
                      trainee?.certificateStatus === "issued"
                        ? "Certificate Issued"
                        : trainee?.trainingStatus || "Enrolled";

                    return (
                      <div
                        key={traineeId}
                        className="grid gap-4 px-3 py-4 text-sm font-black md:grid-cols-[64px_1.25fr_1.25fr_.85fr_.8fr_110px_90px] md:items-center"
                      >
                        <div className="h-11 w-11 rounded-full bg-white" />

                        <div className="text-white">{getTraineeName(trainee)}</div>

                        <div className="break-words text-white/90">
                          {getTraineeEmail(trainee)}
                        </div>

                        <div className="text-white/90">
                          {getTraineeCourse(trainee)}
                        </div>

                        <div className="text-white/90">Progress</div>

                        <div>
                          <span
                            className={`inline-flex min-w-[92px] justify-center rounded-full px-3 py-1 text-[10px] font-black ${progressPillClass(
                              progress
                            )}`}
                          >
                            {progressPercent}%
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedDetailTraineeId(traineeId)}
                          className="inline-flex min-w-[84px] justify-center rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#2d5038] transition hover:bg-[#eef1e7]"
                          title={status}
                        >
                          View
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-5 py-12 text-center text-sm font-bold text-white/80">
                    No trainees found for the current course filter.
                  </div>
                )}
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
                  aria-label="Previous page"
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
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      <ModalShell
        open={Boolean(detailTrainee)}
        onClose={() => setSelectedDetailTraineeId("")}
        title={detailTrainee ? `${getTraineeName(detailTrainee)} Progress` : "Progress Details"}
        maxWidth="max-w-7xl"
      >
        {detailTrainee ? (
          (() => {
            const trainee = detailTrainee;
            const traineeId = getTraineeId(trainee);
            const progress = detailProgress;
            const completedCodes = new Set(
              progress?.completedCompetencyCodes || []
            );

            const competencies = Array.isArray(progress?.competencyGroups)
              ? progress.competencyGroups
              : [];

            const competencyCompleted = getCompetencyCompleted(progress);
            const competencyTotal = getCompetencyTotal(progress);
            const incompleteReasons = getIncompleteReasons(progress);
            const pretest = progress?.pretest || null;
            const evaluation = pretest?.evaluation || null;
            const hasPretestDetails =
              Array.isArray(pretest?.results) && pretest.results.length > 0;

            return (
              <div className="space-y-6">
                <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-2xl font-black text-[#395345]">
                        {getTraineeName(trainee)}
                      </div>

                      <div className="mt-1 text-sm text-[#647166]">
                        {getTraineeEmail(trainee)}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge tone={getProgressTone(progress)}>
                          Progress {Number(progress?.progressPercent || 0)}%
                        </Badge>

                        <Badge
                          tone={
                            trainee?.certificateStatus === "issued"
                              ? "blue"
                              : "default"
                          }
                        >
                          {trainee?.certificateStatus === "issued"
                            ? "Certificate Issued"
                            : trainee?.trainingStatus || "Enrolled"}
                        </Badge>

                        <Badge tone={pretest?.completed ? "green" : "yellow"}>
                          {pretest?.completed
                            ? `Pre-test ${Number(pretest?.scorePercent || 0)}%`
                            : "Pre-test Pending"}
                        </Badge>

                        {pretest?.completed ? (
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-black ring-1 ${learningPathBadgeClass(
                              pretest?.learningPathLevel
                            )}`}
                          >
                            {learningPathLabel(pretest?.learningPathLevel)}
                          </span>
                        ) : null}

                        <Badge
                          tone={
                            progress?.isEligibleForCompletion
                              ? "green"
                              : "yellow"
                          }
                        >
                          {progress?.isEligibleForCompletion
                            ? "Eligible for Completion"
                            : "Not Yet Complete"}
                        </Badge>
                      </div>
                    </div>

                    <div className="w-full lg:max-w-[260px]">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-[#e2e8da]">
                        <div className="text-xs font-black uppercase tracking-[0.14em] text-[#6f7c71]">
                          Completion Action
                        </div>

                        <div className="mt-3 text-sm leading-6 text-[#647166]">
                          Mark this trainee as completed and issue the certificate
                          once all requirements are satisfied.
                        </div>

                        <button
                          type="button"
                          onClick={() => handleMarkPassed(trainee)}
                          disabled={passingId === traineeId}
                          className="mt-4 w-full rounded-2xl bg-[#395345] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {passingId === traineeId
                            ? "Issuing..."
                            : "Mark as Passed"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <SummaryCard
                    label="Competencies"
                    value={`${competencyCompleted} / ${competencyTotal}`}
                  />

                  <SummaryCard
                    label="Pre-Test Taken"
                    value={formatDateTime(pretest?.lastTakenAt)}
                  />

                  <SummaryCard
                    label="Issued / Completed"
                    value={formatDateTime(trainee?.passedAt || trainee?.completedAt)}
                  />
                </div>

                {pretest?.completed ? (
                  <div className="rounded-2xl bg-[#f9fbf7] p-4 ring-1 ring-[#e2e8da]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="text-xs font-black uppercase tracking-[0.14em] text-[#6f7c71]">
                          Pre-Test Evaluation
                        </div>

                        <div className="mt-2 text-sm text-[#647166]">
                          {evaluation?.summary ||
                            "Detailed pre-test evaluation is available for this trainee."}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedPretestTraineeId(traineeId)}
                        disabled={!hasPretestDetails}
                        className="rounded-2xl bg-[#395345] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {hasPretestDetails
                          ? "View Pre-Test Evaluation"
                          : "No Detailed Results Yet"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {incompleteReasons.length ? (
                  <div className="rounded-2xl bg-[#fff8e8] p-4 ring-1 ring-[#f0dfab]">
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-[#8a6b00]">
                      Remaining Requirements
                    </div>

                    <div className="mt-2 space-y-1 text-sm text-[#6f5b17]">
                      {incompleteReasons.map((reason, index) => (
                        <div key={`${traineeId}-reason-${index}`}>• {reason}</div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-4">
                  {competencies.length ? (
                    competencies.map((group, groupIndex) => (
                      <div
                        key={`${traineeId}-${group?.title || groupIndex}`}
                        className="rounded-2xl bg-[#f9fbf7] p-4 ring-1 ring-[#e2e8da]"
                      >
                        <div className="text-sm font-black text-[#395345]">
                          {group?.title || "Competencies"}
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {(group?.items || []).map((item) => {
                            const checked = completedCodes.has(item.code);
                            const savingKey = `${traineeId}:${item.code}`;

                            return (
                              <label
                                key={item.code}
                                className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-[#e2e8da]"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) =>
                                    handleToggleCompetency(
                                      traineeId,
                                      item.code,
                                      e.target.checked
                                    )
                                  }
                                  disabled={competencySavingId === savingKey}
                                  className="mt-1 h-4 w-4"
                                />

                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-[#395345]">
                                    {item.label}
                                  </div>

                                  <div className="mt-1 text-xs text-[#647166]">
                                    {item.code}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-[#f9fbf7] px-5 py-4 text-sm text-[#647166] ring-1 ring-[#e2e8da]">
                      No competency checklist available for this trainee yet.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-[#f9fbf7] p-4 ring-1 ring-[#e2e8da]">
                  <label className="text-xs font-black uppercase tracking-[0.14em] text-[#6f7c71]">
                    Professor Remarks / Completion Note
                  </label>

                  <textarea
                    rows={3}
                    value={passRemarksById[traineeId] || ""}
                    onChange={(e) =>
                      setPassRemarksById((prev) => ({
                        ...prev,
                        [traineeId]: e.target.value,
                      }))
                    }
                    placeholder="Add remarks, coaching notes, or completion note"
                    className="mt-2 w-full rounded-xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
                  />
                </div>
              </div>
            );
          })()
        ) : null}
      </ModalShell>

      <PretestEvaluationModal
        open={Boolean(selectedPretestTraineeId)}
        onClose={() => setSelectedPretestTraineeId("")}
        trainee={selectedTrainee}
        progress={selectedProgress}
      />
    </div>
  );
}
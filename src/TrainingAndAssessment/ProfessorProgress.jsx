import React, { useEffect, useMemo, useState } from "react";
import ProfessorLayout from "./ProfessorLayout";
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

  const modalMaxWidth = maxWidth === "max-w-7xl" ? "1180px" : "1040px";

  return (
    <div className="prof-modal-overlay" onClick={onClose}>
      <div
        className="prof-modal-box"
        style={{ maxWidth: modalMaxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="prof-modal-top">
          <h3 className="prof-modal-title">{title}</h3>

          <button type="button" onClick={onClose} className="prof-modal-close">
            Close
          </button>
        </div>

        <div className="prof-modal-body">{children}</div>
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



  return (
    <ProfessorLayout
      title="Manage Trainee Progress"
      subtitle="Track trainee completion, review pre-test results, update competency checks, and issue certificates from one clean dashboard."
      activePage="progress"
      actions={
        <button
          type="button"
          onClick={loadAll}
          disabled={loading || !course}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#082719] px-5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#071f14] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      <div className="prof-progress-page">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap");

        .prof-progress-page {
          --green-950: #071f14;
          --green-900: #082719;
          --green-800: #12391f;
          --green-700: #2d5038;
          --green-600: #637967;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --paper: #f6f6f1;
          --card: rgba(255,255,255,.96);
          --muted: #667085;
          --line: rgba(45,80,56,.16);
          width: 100%;
          color: #102418;
          font-family: "Open Sans", Arial, sans-serif;
        }

        .prof-progress-page * { box-sizing: border-box; }

        .prof-top-header {
          height: 86px;
          display: flex;
          align-items: center;
          padding: 0 40px;
          background: #ffffff;
          box-shadow: 0 3px 16px rgba(0,0,0,.08);
        }

        .prof-top-brand {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .prof-top-logo {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 999px;
          border: 2px solid var(--green-700);
          background: #fff;
          color: var(--green-700);
          font-size: 13px;
          font-weight: 900;
        }

        .prof-top-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .prof-top-title {
          margin: 0;
          color: var(--green-700);
          font-size: clamp(20px, 2.4vw, 30px);
          line-height: 1;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .025em;
        }

        .prof-shell {
          min-height: calc(100vh - 86px);
          display: grid;
          grid-template-columns: 264px minmax(0, 1fr);
          background: var(--green-800);
        }

        .prof-sidebar {
          position: sticky;
          top: 86px;
          height: calc(100vh - 86px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--green-700);
          color: #fff;
        }

        .prof-brand {
          padding: 32px 24px 28px;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,.15);
        }

        .prof-brand-logo {
          display: block;
          width: 74px;
          height: 74px;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 999px;
          border: 4px solid #b7bbb6;
          background: white;
          object-fit: cover;
          box-shadow: 0 10px 20px rgba(0,0,0,.12);
        }

        .prof-brand-kicker,
        .prof-brand-title,
        .prof-user-label { display: none; }

        .prof-user-card {
          margin: 18px 0 0;
          padding: 0;
          text-align: center;
          background: transparent;
          border: 0;
        }

        .prof-user-name {
          margin: 0;
          color: #fff;
          font-size: 16px;
          line-height: 1.25;
          font-weight: 900;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }

        .prof-user-email {
          margin: 6px auto 0;
          max-width: 210px;
          color: rgba(255,255,255,.82);
          font-size: 12px;
          line-height: 1.35;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .prof-nav {
          flex: 1;
          display: block;
          margin: 0;
          padding: 24px 0;
        }

        .prof-nav-btn {
          width: 100%;
          min-height: 52px;
          display: block;
          border: 0;
          border-radius: 0;
          padding: 0 48px;
          background: transparent;
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 900;
          text-align: left;
          text-transform: uppercase;
          cursor: pointer;
          transition: background .2s ease, color .2s ease;
        }

        .prof-nav-btn:hover {
          background: rgba(255,255,255,.10);
        }

        .prof-nav-btn.active {
          background: #d8e0da;
          color: #1e3e2a;
        }

        .prof-nav-icon,
        .prof-nav-svg { display: none; }

        .prof-sidebar-footer {
          padding: 0 48px 40px;
          border-top: 0;
        }

        .prof-signout {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0;
          border: 0;
          background: transparent;
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 900;
          text-align: left;
          text-transform: uppercase;
          cursor: pointer;
          transition: color .2s ease;
        }

        .prof-signout:hover { color: #d8e0da; }
        .prof-copy { display: none; }

        .prof-progress-content {
          min-width: 0;
          color: #102418;
        }

        .prof-page-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          max-width: 1040px;
          margin: 0 auto 20px;
        }

        .prof-eyebrow {
          display: none;
        }

        .prof-title {
          margin: 0;
          color: #fff;
          font-size: clamp(28px, 3.4vw, 34px);
          line-height: 1.1;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -.02em;
        }

        .prof-title::after {
          content: "";
          display: block;
          width: min(430px, 100%);
          height: 4px;
          margin-top: 6px;
          background: rgba(255,255,255,.60);
        }

        .prof-subtitle {
          margin: 18px 0 0;
          max-width: 760px;
          color: rgba(255,255,255,.86);
          font-size: 14px;
          font-weight: 700;
          line-height: 1.65;
        }

        .prof-alert {
          margin: 0 0 18px;
          border-radius: 14px;
          padding: 14px 16px;
          font-size: 13px;
          font-weight: 800;
          border: 1px solid rgba(255,255,255,.2);
        }
        .prof-alert.success { background: #effaf1; color: #1f7a3d; }
        .prof-alert.error { background: #fff1f2; color: #b42318; }

        .prof-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .prof-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          background: #fff;
          border: 1px solid rgba(255,255,255,.80);
          box-shadow: 0 18px 45px rgba(8,39,25,.10);
          ring: 1px solid rgba(0,0,0,.05);
        }

        .prof-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 5px;
          background: linear-gradient(90deg, var(--green-700), var(--gold));
        }

        .prof-stat {
          min-height: 132px;
          padding: 24px;
        }
        .prof-stat-label {
          margin: 0;
          color: rgba(16,24,40,.46);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }
        .prof-stat-value {
          margin: 12px 0 0;
          color: var(--green-950);
          font-size: 32px;
          line-height: 1;
          font-weight: 900;
        }
        .prof-stat-note {
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
        }

        .prof-filter-card { padding: 24px; margin-bottom: 24px; }
        .prof-filter-row {
          display: grid;
          grid-template-columns: minmax(190px, .7fr) minmax(280px, 1fr) auto;
          gap: 14px;
          align-items: end;
        }
        .prof-field label {
          display: block;
          margin-bottom: 8px;
          color: var(--green-950);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }
        .prof-input, .prof-select {
          width: 100%;
          height: 46px;
          border: 1px solid rgba(45,80,56,.16);
          border-radius: 999px;
          background: rgba(246,246,241,.9);
          color: var(--green-950);
          padding: 0 18px;
          font-size: 13px;
          font-weight: 800;
          outline: none;
          font-family: inherit;
          transition: .22s ease;
        }
        .prof-input:focus, .prof-select:focus {
          background: #fff;
          border-color: var(--green-700);
          box-shadow: 0 0 0 4px rgba(45,80,56,.10);
        }

        .prof-btn {
          min-height: 38px;
          border: 0;
          border-radius: 999px;
          padding: 0 18px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
          transition: .22s ease;
          white-space: nowrap;
        }
        .prof-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .prof-btn:disabled { opacity: .58; cursor: not-allowed; }
        .prof-btn-green { background: var(--green-700); color: #fff; }
        .prof-btn-gold { background: linear-gradient(135deg, #f4d484, #d7a84d); color: #102418; }
        .prof-btn-light { background: #fff; color: var(--green-700); border: 1px solid rgba(45,80,56,.18); }

        .prof-table-card { padding: 0; }
        .prof-table-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 22px 24px 16px;
        }
        .prof-table-title p {
          margin: 0;
          color: rgba(16,24,40,.46);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }
        .prof-table-title h2 {
          margin: 8px 0 0;
          color: var(--green-950);
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -.025em;
        }
        .prof-table-wrap { overflow-x: auto; }
        .prof-table { width: 100%; min-width: 960px; border-collapse: separate; border-spacing: 0; }
        .prof-table th {
          padding: 15px 18px;
          background: #f8f7f2;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          color: rgba(16,24,40,.52);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .16em;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .prof-table td {
          padding: 16px 18px;
          border-bottom: 1px solid var(--line);
          color: #25372c;
          font-size: 13px;
          font-weight: 700;
          vertical-align: middle;
        }
        .prof-table tbody tr:hover { background: rgba(45,80,56,.04); }
        .prof-avatar {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background: linear-gradient(145deg, #eef8f2, #fff);
          border: 1px solid rgba(45,80,56,.14);
          color: var(--green-700);
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 900;
        }
        .prof-name { color: var(--green-950); font-size: 14px; font-weight: 900; }
        .prof-muted { margin-top: 4px; color: var(--muted); font-size: 12px; font-weight: 700; overflow-wrap: anywhere; }
        .prof-progress-track { width: 100%; min-width: 120px; height: 10px; border-radius: 999px; background: #e9eee8; overflow: hidden; }
        .prof-progress-bar { height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--green-700), var(--gold)); }
        .prof-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          min-width: 74px;
          border-radius: 999px;
          border: 1px solid rgba(45,80,56,.14);
          background: #f6f8f4;
          color: var(--green-700);
          padding: 0 12px;
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
        }
        .prof-action-btn {
          width: 78px;
          height: 34px;
          border: 1px solid rgba(45,80,56,.18);
          border-radius: 999px;
          background: #fff;
          color: var(--green-700);
          font-family: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
          transition: .2s ease;
        }
        .prof-action-btn:hover { background: var(--green-700); color: #fff; transform: translateY(-1px); }
        .prof-empty, .prof-loading-row { padding: 42px 20px; color: var(--muted); text-align: center; font-size: 14px; font-weight: 700; }
        .prof-skeleton { height: 14px; border-radius: 999px; background: linear-gradient(90deg, #edf1ec, #fff, #edf1ec); }
        .prof-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 24px;
          color: var(--muted);
          font-size: 13px;
          font-weight: 800;
        }
        .prof-page-actions { display: flex; gap: 8px; }

        .prof-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,.58);
          padding: 20px;
        }
        .prof-modal-box {
          width: min(100%, 1040px);
          max-height: 90vh;
          overflow: hidden;
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 30px 90px rgba(0,0,0,.34);
        }
        .prof-modal-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(45,80,56,.12);
          background: rgba(248,250,247,.92);
        }
        .prof-modal-title { margin: 0; color: var(--green-950); font-size: 20px; font-weight: 900; }
        .prof-modal-close {
          min-width: 92px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid rgba(45,80,56,.18);
          background: #fff;
          color: var(--green-700);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .14em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .prof-modal-close:hover { background: var(--green-700); color: #fff; }
        .prof-modal-body { max-height: calc(90vh - 75px); overflow-y: auto; padding: 22px; color: #102418; }

        .prof-detail-shell { display: grid; gap: 18px; }
        .prof-detail-hero,
        .prof-detail-card,
        .prof-detail-panel,
        .prof-competency-card,
        .prof-remarks-card {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          background: rgba(255,255,255,.96);
          border: 1px solid rgba(16,24,40,.08);
          box-shadow: 0 12px 30px rgba(8,39,25,.07);
        }
        .prof-detail-hero::before,
        .prof-detail-panel::before,
        .prof-detail-card::before,
        .prof-competency-card::before,
        .prof-remarks-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 5px;
          background: linear-gradient(90deg, var(--green-700), var(--gold));
        }
        .prof-detail-hero { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 20px; padding: 24px; align-items: stretch; }
        .prof-detail-name { margin: 0; color: var(--green-950); font-size: clamp(24px, 3vw, 34px); line-height: 1.05; font-weight: 900; }
        .prof-detail-email { margin: 8px 0 0; color: var(--muted); font-size: 14px; font-weight: 700; }
        .prof-detail-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .prof-detail-action-card { border-radius: 18px; background: #f8faf7; border: 1px solid rgba(45,80,56,.12); padding: 18px; }
        .prof-detail-small-title, .prof-detail-section-title { margin: 0; color: rgba(16,24,40,.52); font-size: 11px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; }
        .prof-detail-action-card p, .prof-detail-panel p { margin: 10px 0 0; color: var(--muted); font-size: 13px; font-weight: 700; line-height: 1.65; }
        .prof-detail-action-btn, .prof-detail-view-btn { min-height: 40px; border: 0; border-radius: 999px; padding: 0 16px; background: var(--green-700); color: #fff; font-family: inherit; font-size: 12px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; }
        .prof-detail-action-btn { width: 100%; margin-top: 16px; }
        .prof-detail-view-btn { min-width: 180px; }
        .prof-detail-action-btn:disabled, .prof-detail-view-btn:disabled { opacity: .58; cursor: not-allowed; }
        .prof-detail-stat-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .prof-detail-card { min-height: 108px; padding: 24px 22px 18px; }
        .prof-detail-card-value { margin: 12px 0 0; color: var(--green-950); font-size: 21px; line-height: 1.15; font-weight: 900; overflow-wrap: anywhere; }
        .prof-detail-panel { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 22px 24px; }
        .prof-remaining { background: #fff8e8; border-color: rgba(215,168,77,.32); }
        .prof-remaining .prof-detail-section-title { color: #8a6b00; }
        .prof-remaining-list { margin-top: 10px; display: grid; gap: 6px; color: #6f5b17; font-size: 13px; font-weight: 700; }
        .prof-competency-stack { display: grid; gap: 16px; }
        .prof-competency-card { padding: 22px 24px 24px; }
        .prof-competency-title { margin: 0; color: var(--green-950); font-size: 17px; font-weight: 900; }
        .prof-competency-grid { margin-top: 14px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .prof-competency-item { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 12px; align-items: start; min-height: 58px; border-radius: 16px; background: #f8faf7; border: 1px solid rgba(45,80,56,.12); padding: 13px 14px; }
        .prof-competency-check { width: 16px; height: 16px; margin-top: 3px; accent-color: var(--green-700); }
        .prof-competency-label { color: var(--green-950); font-size: 13px; font-weight: 800; line-height: 1.45; overflow-wrap: anywhere; }
        .prof-competency-code { display: block; margin-top: 4px; color: rgba(16,24,40,.50); font-size: 11px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; overflow-wrap: anywhere; }
        .prof-remarks-card { padding: 22px 24px 24px; }
        .prof-remarks-area { margin-top: 12px; width: 100%; min-height: 96px; resize: vertical; border: 1px solid rgba(45,80,56,.16); border-radius: 18px; background: #f8faf7; color: var(--green-950); padding: 14px 16px; font-size: 13px; font-weight: 700; line-height: 1.6; outline: none; font-family: inherit; }
        .prof-detail-empty { border-radius: 20px; background: rgba(255,255,255,.96); border: 1px solid rgba(16,24,40,.08); padding: 24px; color: var(--muted); font-size: 14px; font-weight: 700; text-align: center; }

        @media (max-width: 1100px) {
          .prof-shell { grid-template-columns: 1fr; }
          .prof-sidebar { position: static; height: auto; }
          .prof-nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .prof-nav-btn { padding: 0 24px; }
          .prof-sidebar-footer { padding: 16px 24px 28px; }
          .prof-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .prof-filter-row { grid-template-columns: 1fr; }
        }

        @media (max-width: 720px) {
          .prof-top-header { height: auto; padding: 18px 20px; }
          .prof-shell { min-height: auto; }
          .prof-progress-content { padding: 20px 16px; }
          .prof-page-head { flex-direction: column; align-items: stretch; }
          .prof-stats-grid { grid-template-columns: 1fr; }
          .prof-nav { grid-template-columns: 1fr; }
          .prof-detail-hero, .prof-detail-panel { grid-template-columns: 1fr; }
          .prof-detail-stat-grid { grid-template-columns: 1fr; }
          .prof-detail-view-btn { width: 100%; min-width: 0; }
          .prof-competency-grid { grid-template-columns: 1fr; }
          .prof-modal-top { flex-direction: column; align-items: stretch; }
          .prof-modal-close { width: 100%; }
        }

      `}</style>


        <div className="prof-progress-content">
          {msg.text ? (
            <div className={`prof-alert ${msg.type === "success" ? "success" : "error"}`}>
              {msg.text}
            </div>
          ) : null}

          <section className="prof-stats-grid">
            <article className="prof-card prof-stat">
              <p className="prof-stat-label">Trainees</p>
              <p className="prof-stat-value">{trainees.length}</p>
              <p className="prof-stat-note">Loaded records</p>
            </article>

            <article className="prof-card prof-stat">
              <p className="prof-stat-label">Visible</p>
              <p className="prof-stat-value">{sortedTrainees.length}</p>
              <p className="prof-stat-note">After search filter</p>
            </article>

            <article className="prof-card prof-stat">
              <p className="prof-stat-label">Eligible</p>
              <p className="prof-stat-value">
                {Object.values(progressById).filter((item) => item?.isEligibleForCompletion).length}
              </p>
              <p className="prof-stat-note">Ready for completion</p>
            </article>

            <article className="prof-card prof-stat">
              <p className="prof-stat-label">Courses</p>
              <p className="prof-stat-value">{courseOptions.length || 0}</p>
              <p className="prof-stat-note">Assigned course filters</p>
            </article>
          </section>

          <section className="prof-card prof-filter-card">
            <div className="prof-filter-row">
              <div className="prof-field">
                <label>Course</label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  disabled={courseOptions.length <= 1}
                  className="prof-select"
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

              <div className="prof-field">
                <label>Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="prof-input"
                  placeholder="Search trainee, email, course, status, or progress"
                />
              </div>

              <button
                type="button"
                onClick={loadAll}
                disabled={loading || !course}
                className="prof-btn prof-btn-gold"
              >
                {loading ? "Loading..." : "Update List"}
              </button>
            </div>
          </section>

          <section className="prof-card prof-table-card">
            <div className="prof-table-head">
              <div className="prof-table-title">
                <p>Trainee Records</p>
                <h2>Trainee Progress</h2>
              </div>
              <span className="prof-pill">{sortedTrainees.length} Record{sortedTrainees.length === 1 ? "" : "s"}</span>
            </div>

            <div className="prof-table-wrap">
              <table className="prof-table">
                <thead>
                  <tr>
                    <th style={{ width: "70px" }}>Photo</th>
                    <th>Trainee</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th style={{ textAlign: "center", width: "120px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3].map((item) => (
                      <tr key={item}>
                        <td><div className="prof-avatar" /></td>
                        <td><div className="prof-skeleton" /></td>
                        <td><div className="prof-skeleton" /></td>
                        <td><div className="prof-skeleton" /></td>
                        <td><div className="prof-skeleton" /></td>
                        <td><div className="prof-skeleton" /></td>
                        <td><div className="prof-skeleton" /></td>
                      </tr>
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
                      const traineeName = getTraineeName(trainee);

                      return (
                        <tr key={traineeId}>
                          <td>
                            <div className="prof-avatar">
                              {traineeName
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase() || "T"}
                            </div>
                          </td>
                          <td>
                            <div className="prof-name">{traineeName}</div>
                          </td>
                          <td>
                            <div className="prof-muted">{getTraineeEmail(trainee)}</div>
                          </td>
                          <td>{getTraineeCourse(trainee)}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="prof-progress-track">
                                <div
                                  className="prof-progress-bar"
                                  style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
                                />
                              </div>
                              <span className="prof-pill">{progressPercent}%</span>
                            </div>
                          </td>
                          <td>
                            <span className="prof-pill">{status}</span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => setSelectedDetailTraineeId(traineeId)}
                              className="prof-action-btn"
                              title={status}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="prof-empty">
                        No trainees found for the current course filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="prof-pagination">
              <span>Page {page} of {totalPages}</span>
              <div className="prof-page-actions">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="prof-btn prof-btn-light"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="prof-btn prof-btn-green"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
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
              <div className="prof-detail-shell">
                <section className="prof-detail-hero">
                  <div>
                    <h2 className="prof-detail-name">{getTraineeName(trainee)}</h2>
                    <p className="prof-detail-email">{getTraineeEmail(trainee)}</p>

                    <div className="prof-detail-badges">
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

                  <aside className="prof-detail-action-card">
                    <p className="prof-detail-small-title">Completion Action</p>
                    <p>
                      Mark this trainee as completed and issue the certificate once all
                      requirements are satisfied.
                    </p>

                    <button
                      type="button"
                      onClick={() => handleMarkPassed(trainee)}
                      disabled={passingId === traineeId}
                      className="prof-detail-action-btn"
                    >
                      {passingId === traineeId ? "Issuing..." : "Mark as Passed"}
                    </button>
                  </aside>
                </section>

                <section className="prof-detail-stat-grid">
                  <div className="prof-detail-card">
                    <p className="prof-detail-small-title">Competencies</p>
                    <p className="prof-detail-card-value">
                      {competencyCompleted} / {competencyTotal}
                    </p>
                  </div>

                  <div className="prof-detail-card">
                    <p className="prof-detail-small-title">Pre-Test Taken</p>
                    <p className="prof-detail-card-value">
                      {formatDateTime(pretest?.lastTakenAt)}
                    </p>
                  </div>

                  <div className="prof-detail-card">
                    <p className="prof-detail-small-title">Issued / Completed</p>
                    <p className="prof-detail-card-value">
                      {formatDateTime(trainee?.passedAt || trainee?.completedAt)}
                    </p>
                  </div>
                </section>

                {pretest?.completed ? (
                  <section className="prof-detail-panel">
                    <div>
                      <p className="prof-detail-section-title">Pre-Test Evaluation</p>
                      <p>
                        {evaluation?.summary ||
                          "Detailed pre-test evaluation is available for this trainee."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPretestTraineeId(traineeId)}
                      disabled={!hasPretestDetails}
                      className="prof-detail-view-btn"
                    >
                      {hasPretestDetails
                        ? "View Evaluation"
                        : "No Detailed Results"}
                    </button>
                  </section>
                ) : null}

                {incompleteReasons.length ? (
                  <section className="prof-detail-panel prof-remaining">
                    <div>
                      <p className="prof-detail-section-title">Remaining Requirements</p>
                      <div className="prof-remaining-list">
                        {incompleteReasons.map((reason, index) => (
                          <span key={`${traineeId}-reason-${index}`}>• {reason}</span>
                        ))}
                      </div>
                    </div>
                  </section>
                ) : null}

                <section className="prof-competency-stack">
                  {competencies.length ? (
                    competencies.map((group, groupIndex) => (
                      <article
                        key={`${traineeId}-${group?.title || groupIndex}`}
                        className="prof-competency-card"
                      >
                        <h3 className="prof-competency-title">
                          {group?.title || "Competencies"}
                        </h3>

                        <div className="prof-competency-grid">
                          {(group?.items || []).map((item) => {
                            const checked = completedCodes.has(item.code);
                            const savingKey = `${traineeId}:${item.code}`;

                            return (
                              <label key={item.code} className="prof-competency-item">
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
                                  className="prof-competency-check"
                                />

                                <span>
                                  <span className="prof-competency-label">
                                    {item.label}
                                  </span>
                                  <span className="prof-competency-code">
                                    {item.code}
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="prof-detail-empty">
                      No competency checklist available for this trainee yet.
                    </div>
                  )}
                </section>

                <section className="prof-remarks-card">
                  <label className="prof-detail-section-title">
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
                    className="prof-remarks-area"
                  />
                </section>
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
    </ProfessorLayout>
  );
}
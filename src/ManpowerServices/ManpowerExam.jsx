import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

function toNumber(value = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function formatScore(score = 0, max = 0) {
  return `${toNumber(score).toFixed(2)} / ${toNumber(max).toFixed(2)}`;
}

export default function ManpowerExam() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadExam() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/manpower/applications/${applicationId}/exam`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load qualifying exam.");
        }

        if (!active) return;

        setExamData(data);

        if (data?.existingAssessment) {
          setResult(data.existingAssessment);
        }
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load qualifying exam.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (applicationId) {
      loadExam();
    }

    return () => {
      active = false;
    };
  }, [applicationId]);

  const questions = useMemo(() => examData?.exam?.questions || [], [examData]);

  function updateAnswer(questionId, value) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  async function submitExam(e) {
    e.preventDefault();

    setError("");

    const payloadAnswers = questions.map((question) => ({
      questionId: question.id,
      answer: answers[question.id] || "",
    }));

    if (payloadAnswers.every((row) => !String(row.answer || "").trim())) {
      setError("Please answer the qualifying exam before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/manpower/applications/${applicationId}/exam`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: payloadAnswers,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit qualifying exam.");
      }

      setResult(data?.assessment || null);
    } catch (err) {
      setError(err?.message || "Failed to submit qualifying exam.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8f3] px-4 py-10 text-[#1f2a22]">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-[#d7decf] bg-white p-8 shadow-sm">
          Loading qualifying exam...
        </div>
      </div>
    );
  }

  if (error && !examData) {
    return (
      <div className="min-h-screen bg-[#f6f8f3] px-4 py-10 text-[#1f2a22]">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-[#efc9c9] bg-white p-8 shadow-sm">
          <p className="text-sm text-[#912f2f]">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/manpower-services")}
            className="mt-5 rounded-2xl bg-[#395345] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Manpower Services
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#f6f8f3] px-4 py-10 text-[#1f2a22]">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-[#d7decf] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#68806e]">
            Manpower Qualifying Exam
          </p>
          <h1 className="mt-2 font-montserrat text-3xl font-bold text-[#24352c]">
            {result?.examTitle || examData?.exam?.title || "Exam Result"}
          </h1>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[#f8faf6] p-5">
              <p className="text-sm text-[#5f6f61]">Job Offer</p>
              <p className="mt-1 font-semibold text-[#24352c]">
                {result?.vacancy || examData?.vacancy || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf6] p-5">
              <p className="text-sm text-[#5f6f61]">Result</p>
              <p
                className={`mt-1 font-semibold ${
                  result?.passed ? "text-[#1f6b38]" : "text-[#912f2f]"
                }`}
              >
                {result?.passed ? "Passed" : "Did Not Reach Passing Score"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf6] p-5">
              <p className="text-sm text-[#5f6f61]">Total Score</p>
              <p className="mt-1 font-semibold text-[#24352c]">
                {formatScore(result?.totalScore, result?.maxScore)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf6] p-5">
              <p className="text-sm text-[#5f6f61]">Percentage</p>
              <p className="mt-1 font-semibold text-[#24352c]">
                {toNumber(result?.percentage).toFixed(2)}%
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf6] p-5">
              <p className="text-sm text-[#5f6f61]">Passing Score</p>
              <p className="mt-1 font-semibold text-[#24352c]">
                {toNumber(result?.passingScore).toFixed(2)}%
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf6] p-5">
              <p className="text-sm text-[#5f6f61]">Submitted</p>
              <p className="mt-1 font-semibold text-[#24352c]">
                {result?.submittedAt
                  ? new Date(result.submittedAt).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {(result?.answers || []).map((row, index) => (
              <div
                key={`${row?.questionId || index}`}
                className="rounded-2xl border border-[#d7decf] bg-[#fbfdf9] p-5"
              >
                <p className="text-sm font-semibold text-[#24352c]">
                  {index + 1}. {row?.questionText || "-"}
                </p>
                <p className="mt-3 text-sm text-[#56695b]">
                  <span className="font-semibold text-[#24352c]">Your Answer:</span>{" "}
                  {row?.applicantAnswer || "-"}
                </p>
                <p className="mt-2 text-sm text-[#56695b]">
                  <span className="font-semibold text-[#24352c]">Score:</span>{" "}
                  {formatScore(row?.earnedPoints, row?.maxPoints)}
                </p>
                <p className="mt-2 text-sm text-[#56695b]">
                  <span className="font-semibold text-[#24352c]">Feedback:</span>{" "}
                  {row?.feedback || "-"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/manpower-services")}
              className="rounded-2xl bg-[#395345] px-5 py-3 text-sm font-semibold text-white"
            >
              Back to Manpower Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f3] px-4 py-10 text-[#1f2a22]">
      <div className="mx-auto max-w-5xl rounded-[28px] border border-[#d7decf] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#68806e]">
          Manpower Qualifying Exam
        </p>
        <h1 className="mt-2 font-montserrat text-3xl font-bold text-[#24352c]">
          {examData?.exam?.title || "Qualifying Exam"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#5a6d5f]">
          Applicant: {examData?.applicantName || "-"} <br />
          Job Offer: {examData?.vacancy || "-"} <br />
          Passing Score: {toNumber(examData?.exam?.passingScore).toFixed(2)}%
        </p>

        <form onSubmit={submitExam} className="mt-8 space-y-6">
          {questions.map((question, index) => (
            <section
              key={question.id}
              className="rounded-2xl border border-[#d7decf] bg-[#fbfdf9] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-[#24352c]">
                  {index + 1}. {question.questionText}
                </h2>
                <span className="rounded-full bg-[#eef3ea] px-3 py-1 text-xs font-semibold text-[#395345]">
                  {question.maxPoints} pts
                </span>
              </div>

              {question.questionType === "multiple_choice" ||
              question.questionType === "true_false" ? (
                <div className="mt-4 space-y-3">
                  {(question.choices || []).map((choice) => (
                    <label
                      key={choice}
                      className="flex items-center gap-3 rounded-xl border border-[#d7decf] bg-white px-4 py-3 text-sm text-[#24352c]"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={choice}
                        checked={answers[question.id] === choice}
                        onChange={(e) => updateAnswer(question.id, e.target.value)}
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  rows={5}
                  value={answers[question.id] || ""}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="mt-4 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
                  placeholder="Type your answer here..."
                />
              )}
            </section>
          ))}

          {error ? (
            <div className="rounded-xl border border-[#efc9c9] bg-[#fff2f2] px-4 py-3 text-sm text-[#912f2f]">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-[#395345] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#2c4136] disabled:cursor-not-allowed disabled:bg-[#91a194]"
          >
            {submitting ? "Submitting Exam..." : "Submit Qualifying Exam"}
          </button>
        </form>
      </div>
    </div>
  );
}
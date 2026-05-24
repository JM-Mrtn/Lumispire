import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/ManpowerLogo.png"
        alt="Manpower Logo"
        className="h-10 w-10 rounded-full object-cover"
      />
      <h1 className="text-[22px] font-black tracking-wide text-[#2f5a45] md:text-[28px]">
        LTC MANPOWER
      </h1>
    </div>
  );
}

function FooterLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/ManpowerLogo.png"
        alt="Manpower Logo"
        className="h-9 w-9 rounded-full object-cover"
      />
      <p className="text-2xl font-black tracking-wide text-white">LTC MANPOWER</p>
    </div>
  );
}

function ExamLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#efefed] text-[#24372d]">
      <header className="border-b border-[#d7ddd5] bg-[#f7f7f5]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link to="/manpower-services" className="no-underline">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-6 text-[11px] font-bold uppercase tracking-wide text-[#647467] lg:flex">
            <Link to="/manpower-services" className="hover:text-[#2f5a45]">
              Home
            </Link>
            <Link to="/manpower-positions" className="hover:text-[#2f5a45]">
              Job Offer
            </Link>
            <Link to="/manpower-requirements" className="hover:text-[#2f5a45]">
              Requirements
            </Link>
            <Link to="/manpower-contact" className="hover:text-[#2f5a45]">
              Contact
            </Link>
            <Link to="/manpower-faqs" className="hover:text-[#2f5a45]">
              FAQs
            </Link>
          </nav>

          <Link
            to="/manpower-employee-login"
            className="text-[11px] font-bold uppercase tracking-wide text-[#647467] hover:text-[#2f5a45]"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bg-[#456b56] text-white">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
          <div className="grid gap-5 md:grid-cols-5 md:items-start">
            <div className="md:pr-4">
              <FooterLogo />
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Menu</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <Link to="/manpower-services" className="block hover:text-white">
                  Home
                </Link>
                <Link to="/manpower-positions" className="block hover:text-white">
                  Job Offer
                </Link>
                <Link to="/manpower-requirements" className="block hover:text-white">
                  Requirements
                </Link>
                <Link to="/manpower-employee-login" className="block hover:text-white">
                  Profile
                </Link>
              </div>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Contact Information</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p>ltc.tamis@gmail.com</p>
                <p>lorengladisu@ltcmultiservices.com</p>
                <p>09959808051 / 09516281271</p>
              </div>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Address</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p>2/F 544 Curie Street,</p>
                <p>Palanan, Makati City</p>
              </div>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Follow Us</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p>Facebook</p>
                <p>Email</p>
                <p>LinkedIn</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-2 border-t border-white/15 pt-3 text-[10px] text-white/80 md:flex-row">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ExamHero({ title = "Qualifying Exam", subtitle = "Complete your manpower screening assessment to continue your application." }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-0 md:px-6">
      <div
        className="relative min-h-[180px] overflow-hidden md:min-h-[230px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(42,82,61,0.9) 0%, rgba(64,94,77,0.66) 38%, rgba(64,94,77,0.24) 100%), url('/images/application-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#64766c",
        }}
      >
        <div className="flex min-h-[180px] items-center px-5 py-8 md:min-h-[230px] md:px-8">
          <div className="text-white">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-white/85">
              Manpower Assessment
            </p>
            <h2 className="mt-2 font-serif text-4xl leading-none md:text-6xl">
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-base text-white/95 md:text-xl">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ label, value, status }) {
  return (
    <div className="rounded-2xl border border-[#d7ddd5] bg-white/80 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5f6f61]">
        {label}
      </p>
      <p
        className={`mt-2 text-lg font-black ${
          status === "success"
            ? "text-[#1f6b38]"
            : status === "danger"
            ? "text-[#912f2f]"
            : "text-[#24352c]"
        }`}
      >
        {value}
      </p>
    </div>
  );
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
      <ExamLayout>
        <ExamHero title="Qualifying Exam" subtitle="Preparing your manpower assessment." />
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-4 md:px-6">
          <div className="rounded-[28px] border border-[#d7decf] bg-[#f4f4f1] p-8 text-[#24372d] shadow-sm">
            Loading qualifying exam...
          </div>
        </section>
      </ExamLayout>
    );
  }

  if (error && !examData) {
    return (
      <ExamLayout>
        <ExamHero title="Qualifying Exam" subtitle="We could not load your assessment right now." />
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-4 md:px-6">
          <div className="rounded-[28px] border border-[#efc9c9] bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-[#912f2f]">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/manpower-services")}
              className="mt-5 rounded-[10px] border border-[#91a691] bg-gradient-to-b from-[#e8f0e7] to-[#bccdbb] px-6 py-2.5 text-sm font-semibold text-[#345240] shadow-sm transition hover:brightness-95"
            >
              Back to Manpower Services
            </button>
          </div>
        </section>
      </ExamLayout>
    );
  }

  if (result) {
    return (
      <ExamLayout>
        <ExamHero
          title={result?.examTitle || examData?.exam?.title || "Exam Result"}
          subtitle="Your manpower qualifying exam result has been recorded."
        />

        <section className="mx-auto max-w-7xl px-4 pb-10 pt-4 md:px-6">
          <div className="bg-[#f4f4f1] px-4 py-5 md:px-6 md:py-6">
            <section>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2f5a45]">
                Manpower Qualifying Exam
              </p>
              <h3 className="mt-2 font-serif text-[28px] text-[#3f5e4d] md:text-[42px]">
                Assessment Result
              </h3>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoCard label="Job Offer" value={result?.vacancy || examData?.vacancy || "-"} />
                <InfoCard
                  label="Result"
                  value={result?.passed ? "Passed" : "Did Not Reach Passing Score"}
                  status={result?.passed ? "success" : "danger"}
                />
                <InfoCard label="Total Score" value={formatScore(result?.totalScore, result?.maxScore)} />
                <InfoCard label="Percentage" value={`${toNumber(result?.percentage).toFixed(2)}%`} />
                <InfoCard label="Passing Score" value={`${toNumber(result?.passingScore).toFixed(2)}%`} />
                <InfoCard
                  label="Submitted"
                  value={result?.submittedAt ? new Date(result.submittedAt).toLocaleString() : "-"}
                />
              </div>
            </section>

            <div className="mx-auto my-8 h-[2px] w-[90%] bg-[#617b6a]" />

            <section>
              <h3 className="font-serif text-[26px] text-[#3f5e4d] md:text-[34px]">
                Answer Review
              </h3>
              <div className="mt-6 space-y-4">
                {(result?.answers || []).map((row, index) => (
                  <div
                    key={`${row?.questionId || index}`}
                    className="rounded-2xl border border-[#d7decf] bg-white p-5 shadow-sm"
                  >
                    <p className="text-sm font-bold text-[#24352c]">
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
            </section>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/manpower-services")}
                className="rounded-[10px] border border-[#91a691] bg-gradient-to-b from-[#e8f0e7] to-[#bccdbb] px-6 py-2.5 text-sm font-semibold text-[#345240] shadow-sm transition hover:brightness-95"
              >
                Back to Manpower Services
              </button>
            </div>
          </div>
        </section>
      </ExamLayout>
    );
  }

  return (
    <ExamLayout>
      <ExamHero
        title={examData?.exam?.title || "Qualifying Exam"}
        subtitle="Answer the questions below and submit your assessment to continue your application."
      />

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-4 md:px-6">
        <div className="bg-[#f4f4f1] px-4 py-5 md:px-6 md:py-6">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2f5a45]">
              Manpower Qualifying Exam
            </p>
            <h3 className="mt-2 font-serif text-[28px] text-[#3f5e4d] md:text-[42px]">
              Exam Details
            </h3>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <InfoCard label="Applicant" value={examData?.applicantName || "-"} />
              <InfoCard label="Job Offer" value={examData?.vacancy || "-"} />
              <InfoCard
                label="Passing Score"
                value={`${toNumber(examData?.exam?.passingScore).toFixed(2)}%`}
              />
            </div>
          </section>

          <div className="mx-auto my-8 h-[2px] w-[90%] bg-[#617b6a]" />

          <form onSubmit={submitExam} className="space-y-6">
            <section>
              <h3 className="font-serif text-[28px] text-[#3f5e4d] md:text-[38px]">
                Questions
              </h3>

              <div className="mt-6 space-y-5">
                {questions.map((question, index) => (
                  <section
                    key={question.id}
                    className="rounded-2xl border border-[#d7decf] bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold text-[#24352c]">
                        {index + 1}. {question.questionText}
                      </h2>
                      <span className="shrink-0 rounded-full bg-[#eef3ea] px-3 py-1 text-xs font-semibold text-[#395345]">
                        {question.maxPoints} pts
                      </span>
                    </div>

                    {question.questionType === "multiple_choice" ||
                    question.questionType === "true_false" ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {(question.choices || []).map((choice) => (
                          <label
                            key={choice}
                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#d7decf] bg-[#fbfdf9] px-4 py-3 text-sm font-semibold text-[#24352c] transition hover:border-[#91a691] hover:bg-white"
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={choice}
                              checked={answers[question.id] === choice}
                              onChange={(e) => updateAnswer(question.id, e.target.value)}
                              className="accent-[#395345]"
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
                        className="mt-4 w-full rounded-xl border border-[#c6ccb9] bg-[#fbfdf9] px-4 py-3 text-sm outline-none transition focus:border-[#395345] focus:bg-white"
                        placeholder="Type your answer here..."
                      />
                    )}
                  </section>
                ))}
              </div>
            </section>

            {error ? (
              <div className="rounded-md border border-[#efc9c9] bg-[#fff2f2] px-4 py-3 text-sm text-[#912f2f]">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col items-center justify-center gap-4 pt-2 md:flex-row md:gap-16">
              <button
                type="submit"
                disabled={submitting}
                className="min-w-[210px] rounded-[10px] border border-[#91a691] bg-gradient-to-b from-[#e8f0e7] to-[#bccdbb] px-6 py-3 text-sm font-semibold text-[#345240] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Submitting Exam..." : "Submit Qualifying Exam"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/manpower-services")}
                className="min-w-[210px] rounded-[10px] border border-[#91a691] bg-gradient-to-b from-[#e8f0e7] to-[#bccdbb] px-6 py-3 text-sm font-semibold text-[#345240] shadow-sm transition hover:brightness-95"
              >
                Back to Manpower Services
              </button>
            </div>
          </form>
        </div>
      </section>
    </ExamLayout>
  );
}

// src/TrainingAndAssessment/TraineeProgress.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  isTrainingAuthResponse,
  redirectToTraineeLogin,
} from "./trainingSession";
import { buildTrainingFileUrl } from "./trainingFileUrl";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";

  const r = String(raw).replace(/\/+$/, "");

  if (r.endsWith("/api/hotel")) {
    return r.replace(/\/api\/hotel$/i, "/api");
  }

  if (r.endsWith("/api")) return r;

  if (r.includes("/api/")) {
    return r.replace(/\/api\/hotel.*$/i, "/api");
  }

  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const API_ORIGIN = API_BASE.replace(/\/api$/i, "");

function getToken() {
  return localStorage.getItem("trainingToken") || "";
}

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 180) || "Invalid server response.");
  }
}

function normalizeSlashes(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/");
}

function getObjectIdString(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    if (value.$oid) return String(value.$oid);

    if (value.toString && value.toString() !== "[object Object]") {
      return String(value.toString());
    }
  }

  return "";
}

function getFilePath(file) {
  if (!file) return "";

  if (typeof file === "string") {
    return normalizeSlashes(file);
  }

  if (typeof file === "object") {
    return normalizeSlashes(
      file.filePath ||
        file.path ||
        file.url ||
        file.secure_url ||
        file.location ||
        file.file ||
        ""
    );
  }

  return "";
}

function getFileId(file) {
  if (!file || typeof file !== "object") return "";
  return getObjectIdString(file.fileId);
}

function buildFileUrl(file) {
  const fileId = getFileId(file);

  if (fileId) {
    return buildTrainingFileUrl(fileId);
  }

  const filePath = getFilePath(file);

  if (!filePath) return "";

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const fileIdMatch = filePath.match(/(?:^|\/)api\/training-files\/([^/?#]+)/i);

  if (fileIdMatch?.[1]) {
    return buildTrainingFileUrl(fileIdMatch[1]);
  }

  return `${API_ORIGIN}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
}

function percentage(completed, required) {
  if (!required) return 100;

  return Math.min(
    100,
    Math.round((Number(completed || 0) / Number(required || 1)) * 100)
  );
}

function getFullName(user) {
  const direct =
    user?.fullName ||
    user?.name ||
    user?.traineeName ||
    user?.studentName ||
    "";

  if (direct) return direct;

  return [user?.firstName, user?.middleName, user?.lastName]
    .filter(Boolean)
    .join(" ");
}

function getEmail(user) {
  return user?.email || user?.traineeEmail || user?.studentEmail || "";
}

function ProgressBar({ completed, required, label }) {
  const pct = percentage(completed, required);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-[#d9dfd2]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-['Montserrat',sans-serif] text-[17px] font-extrabold text-[#45674b]">
            {label}
          </p>

          <p className="mt-1 text-sm font-semibold text-[#45674b]/70">
            {completed} of {required} completed
          </p>
        </div>

        <div className="rounded-full bg-[#eef1e7] px-3 py-1 text-xs font-extrabold text-[#45674b] ring-1 ring-[#d9dfd2]">
          {pct}%
        </div>
      </div>

      <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-[#d9ddd1]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#5c745f] to-[#a8c39f]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext = "" }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-xl ring-1 ring-[#d9dfd2]">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#647165]">
        {label}
      </p>

      <p className="mt-2 font-['Montserrat',sans-serif] text-xl font-extrabold text-[#45674b]">
        {value}
      </p>

      {subtext ? (
        <p className="mt-1 text-xs font-semibold text-[#45674b]/70">
          {subtext}
        </p>
      ) : null}
    </div>
  );
}

function CompetencySection({ title, items = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-[#d9dfd2]">
      <div className="bg-white px-5 py-4">
        <p className="font-['Montserrat',sans-serif] text-lg font-extrabold text-[#45674b]">
          {title}
        </p>
      </div>

      <div className="bg-[#2e5038] p-5">
        {items.length ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.code}
                className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-[#e2e8da]"
              >
                <div
                  className={[
                    "mt-0.5 flex h-5 w-5 items-center justify-center rounded border text-[11px] font-bold",
                    item.completed
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-[#b6c0b2] bg-white text-transparent",
                  ].join(" ")}
                >
                  ✓
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-[#45674b]">
                    {item.label}
                  </p>

                  <p className="mt-1 text-[11px] text-[#647165]">
                    {item.code}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white px-4 py-4 text-sm font-semibold text-[#45674b]">
            No competencies listed yet.
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistRow({ label, checked }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "flex h-5 w-5 items-center justify-center rounded border text-[11px] font-bold",
          checked
            ? "border-green-600 bg-green-600 text-white"
            : "border-[#b6c0b2] bg-white text-transparent",
        ].join(" ")}
      >
        ✓
      </div>

      <span>{label}</span>
    </div>
  );
}

function FeatureCard({ title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-left text-white ring-1 ring-white/15 transition hover:bg-white/15"
    >
      <PaperIcon small />

      <div>
        <p className="font-['Montserrat',sans-serif] text-sm font-extrabold uppercase">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] font-semibold text-white/75">
          {subtitle}
        </p>
      </div>
    </button>
  );
}

export default function TraineeProgress() {
  const navigate = useNavigate();
  const token = useMemo(() => getToken(), []);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trainingUser") || "null");
    } catch {
      return null;
    }
  });
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const loadProgress = async () => {
      if (!token) {
        setLoading(false);
        redirectToTraineeLogin(navigate);
        return;
      }

      try {
        setLoading(true);
        setMsg({ type: "", text: "" });

        const res = await fetch(`${API_BASE}/training/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await readJsonSafe(res);

        if (!res.ok) {
          if (isTrainingAuthResponse(res, data)) {
            redirectToTraineeLogin(navigate, {
              message: data?.message || "Please login again.",
            });
            return;
          }

          throw new Error(data?.message || "Failed to load trainee progress.");
        }

        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("trainingUser", JSON.stringify(data.user));
        }

        setProgress(data?.progress || null);
      } catch (err) {
        setMsg({
          type: "error",
          text: err.message || "Failed to load trainee progress.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [token, navigate]);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const goToProfile = () => {
    const savedToken = localStorage.getItem("trainingToken");
    goTo(savedToken ? "/trainee-profile" : "/trainee-login");
  };

  const profilePhotoUrl = buildFileUrl(user?.profilePhoto);
  const fullName = getFullName(user) || "Trainee Full Name";
  const email = getEmail(user) || "traineeemail@tamsi.com";

  const progressPercent = Number(progress?.progressPercent || 0);

  return (
    <div className="min-h-screen bg-[#123a20] text-[#395345]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#d7ddcf] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => goTo("/trainee-home")}
            className="flex items-center gap-3"
            aria-label="TAMSI Home"
          >
            <img
              src="/TamsiLogo.png"
              alt="TAMSI Logo"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/80x80/d7ddd4/45674b?text=T";
              }}
            />

            <span className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b] sm:text-[28px]">
              TAMSI
            </span>
          </button>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
            <button
              type="button"
              onClick={() => goTo("/trainee-home")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-roadmap")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Roadmap
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-attendance")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Attendance
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-modules")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Modules
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-assignment")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Assignment
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-progress")}
              className="border-b-2 border-[#45674b] pb-1 text-[11px] font-bold uppercase tracking-wide text-[#173d25] xl:text-[12px]"
            >
              Progress
            </button>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={goToProfile}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Profile
            </button>

            <button
              type="button"
              onClick={goToProfile}
              className="h-10 w-10 overflow-hidden rounded-full bg-[#d8d8d8] ring-2 ring-[#45674b]/20"
              aria-label="Profile"
            >
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/80x80/d7ddd4/45674b?text=P";
                  }}
                />
              ) : (
                <img
                  src="https://placehold.co/80x80/d7ddd4/45674b?text=P"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-md border border-[#45674b]/20 bg-[#f7faf2] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#45674b] lg:hidden"
          >
            Menu
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#d7ddcf] bg-white px-5 py-3 lg:hidden">
            <div className="space-y-1 rounded-xl bg-[#f4f7ef] p-2">
              <button
                type="button"
                onClick={() => goTo("/trainee-home")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-roadmap")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Roadmap
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-attendance")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Attendance
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-modules")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Modules
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-assignment")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Assignment
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-progress")}
                className="block w-full rounded-lg bg-white px-4 py-3 text-left text-sm font-bold text-[#173d25]"
              >
                Progress
              </button>

              <button
                type="button"
                onClick={goToProfile}
                className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                <span>Profile</span>

                <span className="h-8 w-8 overflow-hidden rounded-full bg-[#d8d8d8]">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/80x80/d7ddd4/45674b?text=P";
                      }}
                    />
                  ) : (
                    <img
                      src="https://placehold.co/80x80/d7ddd4/45674b?text=P"
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* TRAINING BANNER */}
        <section className="relative flex h-[260px] items-center justify-center overflow-hidden bg-[#d7ded3] px-5 text-center sm:h-[310px] md:h-[360px] lg:h-[390px]">
          <img
            src="/TrainingBanner.png"
            alt="TAMSI Training Banner"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/1600x420/d7ddd4/45674b?text=TAMSI+Training+And+Assessment";
            }}
          />

          <div className="absolute inset-0 bg-[#d7ded3]/55" />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            <h1 className="font-['Montserrat',sans-serif] text-4xl font-extrabold leading-tight tracking-wide text-[#45674b] drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl">
              TAMSI Training And Assessment
            </h1>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section className="bg-gradient-to-b from-[#486b4b] via-[#123a20] to-[#123a20] px-5 py-7 text-white sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              title="Modules"
              subtitle="Track them"
              onClick={() => goTo("/trainee-modules")}
            />

            <FeatureCard
              title="Training Status"
              subtitle="Track them"
              onClick={() => goTo("/trainee-progress")}
            />

            <FeatureCard
              title="Overall Progress"
              subtitle="Track them"
              onClick={() => goTo("/trainee-progress")}
            />

            <FeatureCard
              title="Certification"
              subtitle="Track them"
              onClick={() => goTo("/trainee-certificate")}
            />
          </div>
        </section>

        {/* PROGRESS CONTENT */}
        <section className="bg-[#2e5038] px-5 py-10 text-white sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1280px]">
            {msg.text && (
              <div
                className={[
                  "mb-6 rounded-xl px-4 py-3 text-sm font-semibold",
                  msg.type === "success"
                    ? "bg-green-50 text-green-800 ring-1 ring-green-200"
                    : "bg-red-50 text-red-800 ring-1 ring-red-200",
                ].join(" ")}
              >
                {msg.text}
              </div>
            )}

            {loading ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl">
                Loading progress...
              </div>
            ) : (
              <div className="space-y-8">
                <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                  <div className="px-6 py-5 text-[#45674b]">
                    <h1 className="font-['Montserrat',sans-serif] text-2xl font-extrabold uppercase">
                      {fullName}
                    </h1>

                    <p className="mt-1 text-sm font-semibold text-[#45674b]/75">
                      {email}
                    </p>
                  </div>

                  <div className="bg-[#2e5038] p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-['Montserrat',sans-serif] text-xl font-extrabold text-white">
                          Current Progress
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white/75">
                          Your pre-test and competency completion.
                        </p>
                      </div>

                      <p className="text-sm font-extrabold text-white">
                        {progressPercent}% Completed
                      </p>
                    </div>

                    <div className="mt-4 h-5 w-full overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-[#a8c39f]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <StatCard
                        label="Course"
                        value={progress?.course || user?.course || "Not assigned"}
                      />

                      <StatCard
                        label="Training Status"
                        value={
                          progress?.trainingStatus ||
                          user?.trainingStatus ||
                          "Enrolled"
                        }
                      />

                      <StatCard
                        label="Overall Progress"
                        value={`${progressPercent}%`}
                      />

                      <StatCard
                        label="Completion"
                        value={progress?.isEligibleForCompletion ? "Ready" : "Ongoing"}
                        subtext={
                          progress?.certificateStatus === "issued"
                            ? "Certificate issued"
                            : ""
                        }
                      />
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <ProgressBar
                        label="Competencies"
                        completed={progress?.competencyCounts?.completed || 0}
                        required={progress?.competencyCounts?.total || 0}
                      />

                      <ProgressBar
                        label="Pre-Test"
                        completed={progress?.pretestCompleted ? 1 : 0}
                        required={1}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.1fr]">
                  <div className="space-y-6">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                      <div className="bg-white px-5 py-4">
                        <p className="font-['Montserrat',sans-serif] text-lg font-extrabold text-[#45674b]">
                          Completion Checklist
                        </p>
                      </div>

                      <div className="bg-[#2e5038] p-5">
                        <div className="space-y-3 text-sm font-semibold text-white">
                          <ChecklistRow
                            label="Pre-test completed"
                            checked={Boolean(progress?.pretestCompleted)}
                          />

                          <ChecklistRow
                            label="All competencies completed"
                            checked={
                              Number(progress?.competencyCounts?.completed || 0) >=
                              Number(progress?.competencyCounts?.total || 0)
                            }
                          />
                        </div>

                        {!progress?.isEligibleForCompletion &&
                        Array.isArray(progress?.incompleteReasons) &&
                        progress.incompleteReasons.length ? (
                          <div className="mt-5 rounded-2xl bg-red-50 p-4 ring-1 ring-red-200">
                            <p className="text-sm font-bold text-red-800">
                              Remaining requirements
                            </p>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                              {progress.incompleteReasons.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="mt-5 rounded-2xl bg-green-50 p-4 ring-1 ring-green-200">
                            <p className="text-sm font-bold text-green-800">
                              You are ready for course completion review.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {(progress?.competencyGroups || []).length ? (
                      (progress?.competencyGroups || []).map((group) => (
                        <CompetencySection
                          key={group.title}
                          title={group.title}
                          items={group.items || []}
                        />
                      ))
                    ) : (
                      <CompetencySection title="Competencies" items={[]} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="h-[55px] bg-[#123a20]" />
      </main>

      {/* SMALLER FOOTER */}
      <footer className="bg-white text-[#4d6f55]">
        <div className="mx-auto max-w-[1440px] px-5 py-3 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.05fr_1.05fr_1.3fr_1fr_0.65fr]">
            <div className="border-[#d6ded2] md:border-r md:pr-5">
              <div className="flex items-center gap-3">
                <img
                  src="/TamsiLogo.png"
                  alt="TAMSI Logo"
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/80x80/ffffff/4d6f55?text=T";
                  }}
                />

                <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b]">
                  TAMSI
                </h2>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">Menu</h3>

              <div className="mt-1 grid grid-cols-2 gap-x-5 gap-y-0.5 text-[11px] font-semibold text-[#6b776d]">
                <button
                  type="button"
                  onClick={() => goTo("/trainee-home")}
                  className="text-left hover:text-[#173d25]"
                >
                  Home
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-roadmap")}
                  className="text-left hover:text-[#173d25]"
                >
                  Roadmap
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-attendance")}
                  className="text-left hover:text-[#173d25]"
                >
                  Attendance
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-modules")}
                  className="text-left hover:text-[#173d25]"
                >
                  Modules
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-assignment")}
                  className="text-left hover:text-[#173d25]"
                >
                  Assignment
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-progress")}
                  className="text-left hover:text-[#173d25]"
                >
                  Progress
                </button>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Contact Information
              </h3>

              <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
                <p>ltc.tamsi@gmail.com</p>
                <p>lorengladis@ltcmultiservices.com</p>
                <p>09959808051 / 09516281271</p>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Address
              </h3>

              <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
                <p>2/F 5441 Curie Street,</p>
                <p>Palanan, Makati City</p>
              </div>
            </div>

            <div className="md:pl-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Follow Us
              </h3>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-1 border-t border-[#d6ded2] pt-2 text-[9px] font-bold text-[#7b897e] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PaperIcon({ small = false }) {
  return (
    <svg
      viewBox="0 0 90 90"
      className={`${small ? "h-9 w-9" : "h-16 w-16"} shrink-0 text-[#8a936e]`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28 18H58L68 28V68C68 70.2 66.2 72 64 72H28C25.8 72 24 70.2 24 68V22C24 19.8 25.8 18 28 18Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M58 18V29H68"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M19 25H53L61 33V75"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.75"
      />

      <path
        d="M34 36H55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M34 46H55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M34 56H50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M29 36L31 38L34 34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M29 46L31 48L34 44"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M29 56L31 58L34 54"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
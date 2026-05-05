// src/TrainingAndAssessment/TraineeModules.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearTrainingSession,
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

function formatBytes(bytes = 0) {
  const size = Number(bytes || 0);

  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isPreviewableImage(mime = "", name = "") {
  const lowerMime = String(mime || "").toLowerCase();
  const lowerName = String(name || "").toLowerCase();

  return (
    lowerMime.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/.test(lowerName)
  );
}

function isPreviewablePdf(mime = "", name = "") {
  const lowerMime = String(mime || "").toLowerCase();
  const lowerName = String(name || "").toLowerCase();

  return lowerMime === "application/pdf" || lowerName.endsWith(".pdf");
}

function getModuleFiles(module) {
  if (Array.isArray(module?.files) && module.files.length) {
    return module.files.map((file) => ({
      fileId: getObjectIdString(file?.fileId),
      originalName: file?.originalName || file?.filename || "Module File",
      filename: file?.filename || file?.originalName || "Module File",
      mimetype: file?.mimetype || file?.mimeType || "",
      size: Number(file?.size || 0),
    }));
  }

  const legacyId =
    module?.fileId ||
    module?.moduleFileId ||
    module?.file?.fileId ||
    module?.moduleFile?.fileId ||
    "";

  if (!legacyId) return [];

  return [
    {
      fileId: getObjectIdString(legacyId),
      originalName:
        module?.fileName ||
        module?.originalName ||
        module?.filename ||
        module?.file?.originalName ||
        module?.file?.filename ||
        "Module File",
      filename:
        module?.filename ||
        module?.fileName ||
        module?.file?.filename ||
        "Module File",
      mimetype:
        module?.mimeType ||
        module?.mimetype ||
        module?.file?.mimetype ||
        "",
      size: Number(module?.fileSize || module?.size || module?.file?.size || 0),
    },
  ];
}

function getFileUrl(file) {
  const fileId = getObjectIdString(file?.fileId);

  if (!fileId) return "";

  return buildTrainingFileUrl(fileId);
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

  if (clean === "advanced") {
    return "bg-green-50 text-green-700 ring-green-200";
  }

  if (clean === "intermediate") {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }

  return "bg-yellow-50 text-yellow-700 ring-yellow-200";
}

function getModulePathLevel(module) {
  return normalizeLearningPath(
    module?.learningPathLevel ||
      module?.recommendedLevel ||
      module?.level ||
      module?.audienceLevel ||
      "beginner"
  );
}

function ModuleModal({ open, onClose, title, children, maxWidth = "max-w-6xl" }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        className={`max-h-[90vh] w-full ${maxWidth} overflow-hidden rounded-[28px] bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e8ece2] px-6 py-4">
          <h3 className="text-xl font-extrabold text-[#395345]">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d7ddd0] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#395345] transition hover:bg-[#eef1e7]"
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

export default function TraineeModules() {
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

  const [course, setCourse] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lockedByPretest, setLockedByPretest] = useState(false);
  const [learningPath, setLearningPath] = useState("beginner");

  useEffect(() => {
    const loadAll = async () => {
      if (!token) {
        setLoading(false);
        redirectToTraineeLogin(navigate);
        return;
      }

      try {
        setLoading(true);
        setMsg({ type: "", text: "" });

        const profileRes = await fetch(`${API_BASE}/training/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const profileData = await readJsonSafe(profileRes);

        if (!profileRes.ok) {
          if (isTrainingAuthResponse(profileRes, profileData)) {
            redirectToTraineeLogin(navigate, {
              message: profileData?.message || "Please login again.",
            });
            return;
          }

          throw new Error(profileData?.message || "Failed to load profile.");
        }

        const fetchedUser = profileData?.user || null;

        setUser(fetchedUser);

        if (fetchedUser) {
          localStorage.setItem("trainingUser", JSON.stringify(fetchedUser));
          setCourse(fetchedUser.course || "");
          setLearningPath(
            normalizeLearningPath(
              fetchedUser.learningPathLevel ||
                fetchedUser.learningPath ||
                "beginner"
            )
          );
        }

        const modulesRes = await fetch(`${API_BASE}/training/modules`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const modulesData = await readJsonSafe(modulesRes);

        if (!modulesRes.ok) {
          if (isTrainingAuthResponse(modulesRes, modulesData)) {
            redirectToTraineeLogin(navigate, {
              message: modulesData?.message || "Please login again.",
            });
            return;
          }

          throw new Error(modulesData?.message || "Failed to load modules.");
        }

        setModules(Array.isArray(modulesData?.modules) ? modulesData.modules : []);
        setLockedByPretest(Boolean(modulesData?.lockedByPretest));

        if (modulesData?.course) setCourse(modulesData.course);

        if (modulesData?.learningPathLevel) {
          setLearningPath(normalizeLearningPath(modulesData.learningPathLevel));
        }
      } catch (err) {
        setMsg({
          type: "error",
          text: err.message || "Failed to load modules.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [token, navigate]);

  const visibleModules = useMemo(() => {
    const q = search.trim().toLowerCase();

    return [...modules].filter((item) => {
      const level = getModulePathLevel(item);

      if (category !== "all" && level !== category) {
        return false;
      }

      const moduleFiles = getModuleFiles(item);
      const fileNames = moduleFiles
        .map((file) => file.originalName || file.filename || "")
        .join(" ");

      const text =
        `${item.title} ${item.description} ${item.course} ${item.uploadedByProfessorName} ${fileNames} ${level}`.toLowerCase();

      return !q || text.includes(q);
    });
  }, [modules, search, category]);

  const profilePhotoUrl = buildFileUrl(user?.profilePhoto);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const goToProfile = () => {
    const savedToken = localStorage.getItem("trainingToken");
    goTo(savedToken ? "/trainee-profile" : "/trainee-login");
  };

  const logout = () => {
    clearTrainingSession();
    navigate("/trainee-login", { replace: true });
  };

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
              src="/TAMSILogoTransparent.png"
              alt="TAMSI Logo"
              className="h-12 w-12 object-contain"
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
              className="border-b-2 border-[#45674b] pb-1 text-[11px] font-bold uppercase tracking-wide text-[#173d25] xl:text-[12px]"
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
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
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
                className="block w-full rounded-lg bg-white px-4 py-3 text-left text-sm font-bold text-[#173d25]"
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
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
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

              <button
                type="button"
                onClick={logout}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* BANNER IMAGE */}
        <section className="h-[180px] overflow-hidden bg-[#cad1c5] sm:h-[230px] md:h-[290px]">
          <img
            src="/tamsi-building.jpg"
            alt="TAMSI Building"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/1600x420/d7ddd4/45674b?text=TAMSI+Training+And+Assessment";
            }}
          />
        </section>

        {/* MODULE TITLE + FILTERS */}
        <section className="bg-gradient-to-b from-[#486b4b] via-[#123a20] to-[#123a20] px-5 py-9 text-white sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="font-['Montserrat',sans-serif] text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                TAMSI Online Modules
              </h1>

              <div className="mt-3 h-[3px] w-[460px] max-w-full rounded-full bg-white/55" />

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                  Course: {course || "Not assigned"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${learningPathBadgeClass(
                    learningPath
                  )}`}
                >
                  Learning Path: {learningPathLabel(learningPath)}
                </span>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-[620px]">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={lockedByPretest}
                className="h-[34px] rounded-full border border-white/70 bg-white px-4 text-xs font-bold text-[#45674b] outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="all">Category</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Module"
                disabled={lockedByPretest}
                className="h-[34px] rounded-full border border-white/70 bg-white px-4 text-xs font-bold text-[#45674b] outline-none placeholder:text-[#45674b]/70 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>
        </section>

        {/* MODULE CARDS */}
        <section className="bg-[#2e5038] px-5 py-12 text-white sm:px-8 lg:px-12">
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

            {lockedByPretest ? (
              <div className="mb-6 rounded-2xl bg-white px-5 py-5 text-[#45674b] shadow-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold">
                      Modules are locked until you finish the pre-test
                    </h2>

                    <p className="mt-1 text-sm font-semibold text-[#45674b]/75">
                      The pre-test is inside the Assignment page. Finish it first,
                      then your modules will appear here.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => goTo("/trainee-assignment")}
                    className="rounded-full bg-[#45674b] px-6 py-3 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-[#2f463a]"
                  >
                    Go to Assignment
                  </button>
                </div>
              </div>
            ) : null}

            {loading ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl">
                Loading modules...
              </div>
            ) : !course ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-red-700 shadow-xl">
                No course assigned to this trainee account yet.
              </div>
            ) : lockedByPretest ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl">
                Complete the pre-test in the Assignment page first.
              </div>
            ) : visibleModules.length === 0 ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl">
                No modules found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleModules.map((module, index) => {
                  const files = getModuleFiles(module);
                  const level = getModulePathLevel(module);

                  return (
                    <button
                      key={module.id || module._id || `${module.title}-${index}`}
                      type="button"
                      onClick={() => setSelectedModule(module)}
                      className="group mx-auto flex w-full max-w-[205px] flex-col items-center rounded-lg bg-white px-5 py-7 text-center text-[#45674b] shadow-xl transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                    >
                      <PaperIcon />

                      <h2 className="mt-3 font-['Montserrat',sans-serif] text-[19px] font-extrabold text-[#45674b]">
                        {module.title || `Module #${index + 1}`}
                      </h2>

                      <div className="mt-2 flex flex-wrap justify-center gap-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ring-1 ${learningPathBadgeClass(
                            level
                          )}`}
                        >
                          {learningPathLabel(level)}
                        </span>

                        <span className="rounded-full bg-[#eef1e7] px-2 py-0.5 text-[9px] font-extrabold uppercase text-[#45674b] ring-1 ring-[#d9dfd2]">
                          Files: {files.length}
                        </span>
                      </div>

                      <span className="mt-6 flex h-[32px] w-full max-w-[150px] items-center justify-center rounded-full border-[3px] border-[#45674b] bg-white font-['Montserrat',sans-serif] text-[12px] font-extrabold uppercase text-[#45674b] transition group-hover:bg-[#45674b] group-hover:text-white">
                        View
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="h-[55px] bg-[#123a20]" />
      </main>

      <ModuleModal
        open={Boolean(selectedModule)}
        onClose={() => setSelectedModule(null)}
        title={selectedModule?.title || "Module Details"}
      >
        {selectedModule ? (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#395345] ring-1 ring-[#d7ddd0]">
                  {selectedModule.course || course}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ring-1 ${learningPathBadgeClass(
                    getModulePathLevel(selectedModule)
                  )}`}
                >
                  {learningPathLabel(getModulePathLevel(selectedModule))}
                </span>
              </div>

              <div className="mt-4 text-2xl font-extrabold text-[#395345]">
                {selectedModule.title || "Untitled Module"}
              </div>

              <p className="mt-3 text-sm leading-7 text-[#647166]">
                {selectedModule.description ||
                  "No description available for this module."}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                    Uploaded By
                  </div>

                  <div className="mt-2 text-sm text-[#395345]">
                    {selectedModule.uploadedByProfessorName || "Professor"}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                    Uploaded At
                  </div>

                  <div className="mt-2 text-sm text-[#395345]">
                    {formatDateTime(selectedModule.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
              <div className="text-sm font-bold text-[#395345]">
                Module Files
              </div>

              <p className="mt-1 text-xs text-[#647166]">
                Open or preview the files attached to this module.
              </p>

              <div className="mt-4 space-y-4">
                {getModuleFiles(selectedModule).length ? (
                  getModuleFiles(selectedModule).map((file, index) => {
                    const fileUrl = getFileUrl(file);
                    const fileName =
                      file?.originalName ||
                      file?.filename ||
                      `Module File ${index + 1}`;

                    return (
                      <div
                        key={`${file.fileId || fileName}-${index}`}
                        className="rounded-2xl border border-[#dde3d6] bg-[#f7f8f3] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-[#395345]">
                              {index + 1}. {fileName}
                            </div>

                            <div className="mt-1 text-xs text-[#647166]">
                              {formatBytes(file.size)}
                            </div>
                          </div>

                          {fileUrl ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-[#c6ccb9] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#395345] transition hover:bg-[#eef1e7]"
                            >
                              Open
                            </a>
                          ) : null}
                        </div>

                        {fileUrl && isPreviewableImage(file.mimetype, fileName) ? (
                          <img
                            src={fileUrl}
                            alt={fileName}
                            className="mt-4 max-h-[320px] w-full rounded-xl object-contain ring-1 ring-[#dde3d6]"
                          />
                        ) : fileUrl && isPreviewablePdf(file.mimetype, fileName) ? (
                          <iframe
                            src={fileUrl}
                            title={fileName}
                            className="mt-4 h-[420px] w-full rounded-xl border border-[#dde3d6]"
                          />
                        ) : (
                          <div className="mt-4 rounded-xl border border-[#dde3d6] bg-white px-4 py-3 text-sm text-[#627165]">
                            Preview is not available for this file type. Use the
                            Open button above.
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3 text-sm text-[#647166]">
                    No files attached to this module.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </ModuleModal>

      {/* SMALLER FOOTER */}
      <footer className="bg-white text-[#4d6f55]">
        <div className="mx-auto max-w-[1440px] px-5 py-3 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.05fr_1.05fr_1.3fr_1fr_0.65fr]">
            <div className="border-[#d6ded2] md:border-r md:pr-5">
              <div className="flex items-center gap-3">
                <img
                  src="/LTCLogo.png"
                  alt="Lumispire Logo"
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/80x80/ffffff/4d6f55?text=L";
                  }}
                />

                <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b]">
                  LUMISPIRE
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
                <p>0995906805 / 09516281271</p>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">Address</h3>

              <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
                <p>2/F 5441 Currie Street,</p>
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

function PaperIcon() {
  return (
    <svg
      viewBox="0 0 90 90"
      className="h-20 w-20 text-[#8a936e]"
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
// src/TrainingAndAssessment/TraineeAssignment.jsx
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

const MAX_SUBMISSION_FILES = 5;
const MAX_SUBMISSION_FILE_SIZE = 25 * 1024 * 1024;

const ALLOWED_SUBMISSION_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".txt",
  ".xls",
  ".xlsx",
]);

function getToken() {
  return localStorage.getItem("trainingToken") || "";
}

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || "Invalid server response.");
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

    if (
      typeof value.toString === "function" &&
      value.toString() !== "[object Object]"
    ) {
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

function formatCardDate(value) {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatCardTime(value) {
  if (!value) return "9AM";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "9AM";

  return d.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
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

function getTabLabel(tab) {
  if (tab === "completed") return "Completed";
  if (tab === "pastDue") return "Past Due";

  return "Upcoming";
}

function getStatusClasses(tab) {
  if (tab === "completed") return "bg-green-50 text-green-700 ring-green-200";
  if (tab === "pastDue") return "bg-red-50 text-red-700 ring-red-200";

  return "bg-yellow-50 text-yellow-700 ring-yellow-200";
}

function isTurnInLateItem(item) {
  return Boolean(
    item?.canSubmitLate ||
      (item?.canSubmit && item?.isPastDue) ||
      (item?.canSubmit && item?.tab === "pastDue")
  );
}

function getAssessmentActionLabel(item) {
  if (!item?.canSubmit) return "View";
  if (isTurnInLateItem(item)) return "Turn In Late";
  return "Answer";
}

function getSubmitButtonLabel(item, submitting) {
  if (submitting) return isTurnInLateItem(item) ? "Turning in late..." : "Submitting...";
  return isTurnInLateItem(item) ? "Turn In Late" : "Submit Assignment";
}

function getSubmissionHelperText(item) {
  if (isTurnInLateItem(item)) {
    return "This assignment is already past due. You can still upload your files, but your submission will be marked as Turned In Late.";
  }

  return "Add files one at a time. Up to 5 files. Submitting again will replace your old submission.";
}

function getClosedSubmissionMessage(item) {
  if (item?.score != null) {
    return "This assignment is already graded and can no longer be resubmitted.";
  }

  if (item?.isPastDue || item?.tab === "pastDue") {
    return "This assignment is past due. Late submission is not available for this assignment.";
  }

  return "This assignment is no longer open for submission.";
}

function getDaysMeta(deadline, tab) {
  if (!deadline) return "No deadline";

  const d = new Date(deadline);

  if (Number.isNaN(d.getTime())) return "No deadline";

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (tab === "completed") return "Submission recorded";
  if (diffMs < 0) return `${Math.abs(diffDays)} day(s) overdue`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";

  return `${diffDays} day(s) left`;
}

function sortAssessments(list, activeTab) {
  const items = [...list];

  items.sort((a, b) => {
    const aDue = a?.dueDate
      ? new Date(a.dueDate).getTime()
      : Number.MAX_SAFE_INTEGER;
    const bDue = b?.dueDate
      ? new Date(b.dueDate).getTime()
      : Number.MAX_SAFE_INTEGER;

    if (activeTab === "completed") {
      if (bDue !== aDue) return bDue - aDue;
    } else if (aDue !== bDue) {
      return aDue - bDue;
    }

    return String(a?.title || "").localeCompare(String(b?.title || ""));
  });

  return items;
}

function getFileExtension(name = "") {
  const idx = String(name || "").lastIndexOf(".");
  return idx >= 0 ? String(name).slice(idx).toLowerCase() : "";
}

function validateSubmissionFile(file) {
  if (!file) return "No file selected.";

  const ext = getFileExtension(file.name);

  if (!ALLOWED_SUBMISSION_EXTENSIONS.has(ext)) {
    return "Only PDF, image, DOC, DOCX, PPT, PPTX, TXT, XLS, and XLSX files are allowed.";
  }

  if (file.size > MAX_SUBMISSION_FILE_SIZE) {
    return "Each submission file must be 25MB or less.";
  }

  return "";
}

function isSamePickedFile(a, b) {
  if (!a || !b) return false;

  return (
    a.name === b.name &&
    a.size === b.size &&
    a.type === b.type &&
    a.lastModified === b.lastModified
  );
}

function addSingleFileToQueue(currentFiles, pickedFile) {
  if (!pickedFile) {
    return {
      files: currentFiles,
      error: "No file selected.",
    };
  }

  if (currentFiles.length >= MAX_SUBMISSION_FILES) {
    return {
      files: currentFiles,
      error: `You can upload up to ${MAX_SUBMISSION_FILES} files only.`,
    };
  }

  const validationError = validateSubmissionFile(pickedFile);

  if (validationError) {
    return {
      files: currentFiles,
      error: validationError,
    };
  }

  const alreadyExists = currentFiles.some((file) =>
    isSamePickedFile(file, pickedFile)
  );

  if (alreadyExists) {
    return {
      files: currentFiles,
      error: "That file is already added.",
    };
  }

  return {
    files: [...currentFiles, pickedFile],
    error: "",
  };
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

function getFilesFromItem(item) {
  if (Array.isArray(item?.files) && item.files.length) {
    return item.files.map((file) => ({
      fileId: getObjectIdString(file?.fileId),
      originalName: file?.originalName || file?.filename || "File",
      filename: file?.filename || file?.originalName || "File",
      mimetype: file?.mimetype || file?.mimeType || "",
      size: Number(file?.size || 0),
    }));
  }

  const legacyId =
    item?.fileId ||
    item?.assignmentFileId ||
    item?.moduleFileId ||
    item?.file?.fileId ||
    "";

  if (!legacyId) return [];

  return [
    {
      fileId: getObjectIdString(legacyId),
      originalName:
        item?.fileName ||
        item?.originalName ||
        item?.filename ||
        item?.file?.originalName ||
        item?.file?.filename ||
        "File",
      filename:
        item?.filename ||
        item?.fileName ||
        item?.file?.filename ||
        "File",
      mimetype: item?.mimeType || item?.mimetype || item?.file?.mimetype || "",
      size: Number(item?.fileSize || item?.size || item?.file?.size || 0),
    },
  ];
}

function getFileUrl(file) {
  const fileId = getObjectIdString(file?.fileId);

  if (!fileId) return "";

  return buildTrainingFileUrl(fileId);
}

function ModalShell({ open, onClose, title, children, maxWidth = "max-w-5xl" }) {
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

function PretestModal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#e8ece2] px-6 py-4">
          <div>
            <h3 className="text-xl font-extrabold text-[#395345]">
              Course Pre-Test
            </h3>

            <p className="mt-1 text-sm text-[#627165]">
              Complete this first before accessing assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d7ddd0] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#395345] transition hover:bg-[#eef1e7]"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(92vh-86px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
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

function getStoredPretestState() {
  try {
    return JSON.parse(localStorage.getItem("trainingPretestState") || "null");
  } catch {
    return null;
  }
}

function saveStoredPretestState(value) {
  if (!value) {
    localStorage.removeItem("trainingPretestState");
    return;
  }

  localStorage.setItem("trainingPretestState", JSON.stringify(value));
}

function isPretestLockResponse(res, data) {
  return res?.status === 403 && /pre-?test/i.test(String(data?.message || ""));
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

export default function TraineeAssignment() {
  const navigate = useNavigate();
  const token = getToken();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trainingUser") || "null");
    } catch {
      return null;
    }
  });

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [submissionFiles, setSubmissionFiles] = useState([]);

  const [pretestModalOpen, setPretestModalOpen] = useState(false);
  const [pretestLoading, setPretestLoading] = useState(true);
  const [pretestSubmitting, setPretestSubmitting] = useState(false);
  const [pretestError, setPretestError] = useState("");
  const [pretest, setPretest] = useState(() => getStoredPretestState());
  const [pretestAnswers, setPretestAnswers] = useState({});
  const [pretestResult, setPretestResult] = useState(null);

  async function loadInitialData() {
    if (!token) {
      redirectToTraineeLogin(navigate);
      return;
    }

    try {
      setLoading(true);
      setPretestLoading(true);
      setMsg({ type: "", text: "" });

      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, pretestRes, assessmentsRes] = await Promise.all([
        fetch(`${API_BASE}/training/profile`, { headers }),
        fetch(`${API_BASE}/training/pretest`, { headers }).catch(() => null),
        fetch(`${API_BASE}/training/assessments`, { headers }).catch(() => null),
      ]);

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

      if (fetchedUser) {
        setUser(fetchedUser);
        localStorage.setItem("trainingUser", JSON.stringify(fetchedUser));
      }

      if (pretestRes) {
        if (pretestRes.status === 404) {
          setPretest(null);
          setPretestResult(null);
          saveStoredPretestState(null);
        } else {
          const pretestData = await readJsonSafe(pretestRes);

          if (!pretestRes.ok) {
            if (isTrainingAuthResponse(pretestRes, pretestData)) {
              redirectToTraineeLogin(navigate, {
                message: pretestData?.message || "Please login again.",
              });
              return;
            }

            throw new Error(pretestData?.message || "Failed to load pre-test.");
          }

          const normalizedState = {
            ...pretestData,
            pretest:
              pretestData?.pretest ||
              pretestData?.exam ||
              pretestData?.data ||
              null,
            latestAttempt:
              pretestData?.latestAttempt ||
              pretestData?.result ||
              pretestData?.latestResult ||
              null,
            completed: Boolean(pretestData?.completed),
            requiresPretest: Boolean(pretestData?.requiresPretest ?? true),
          };

          setPretest(normalizedState);
          saveStoredPretestState(normalizedState);

          if (normalizedState?.latestAttempt?.submittedAt) {
            setPretestResult(normalizedState.latestAttempt);
          } else {
            setPretestResult(null);
          }
        }
      } else {
        setPretest(null);
        setPretestResult(null);
      }

      if (assessmentsRes) {
        const assessmentsData = await readJsonSafe(assessmentsRes);

        if (assessmentsRes.ok) {
          setAssessments(
            Array.isArray(assessmentsData?.assessments)
              ? assessmentsData.assessments
              : []
          );
        } else if (isTrainingAuthResponse(assessmentsRes, assessmentsData)) {
          redirectToTraineeLogin(navigate, {
            message: assessmentsData?.message || "Please login again.",
          });
          return;
        } else if (isPretestLockResponse(assessmentsRes, assessmentsData)) {
          setAssessments([]);
        } else {
          throw new Error(
            assessmentsData?.message || "Failed to load assignments."
          );
        }
      } else {
        setAssessments([]);
      }
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to load trainee assignment data.",
      });
    } finally {
      setLoading(false);
      setPretestLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, [token, navigate]);

  const activePretest = pretest?.pretest || null;
  const latestAttempt = pretestResult || pretest?.latestAttempt || null;

  const pretestRequired = Boolean(
    pretest?.requiresPretest ?? pretest?.pretestRequired ?? activePretest
  );

  const pretestCompleted = Boolean(
    latestAttempt?.submittedAt ||
      pretest?.completed ||
      pretest?.alreadyCompleted
  );

  const assignmentLocked = Boolean(pretestRequired && !pretestCompleted);

  const learningPath = normalizeLearningPath(
    latestAttempt?.learningPathLevel ||
      latestAttempt?.learningPath ||
      pretest?.pretest?.learningPathLevel ||
      pretest?.learningPath ||
      user?.learningPathLevel ||
      "beginner"
  );

  const counts = useMemo(() => {
    const source = assignmentLocked ? [] : assessments;

    return {
      upcoming: source.filter((item) => item.tab === "upcoming").length,
      completed: source.filter((item) => item.tab === "completed").length,
      pastDue: source.filter((item) => item.tab === "pastDue").length,
    };
  }, [assessments, assignmentLocked]);

  const filteredAssessments = useMemo(() => {
    if (assignmentLocked) return [];

    const q = search.trim().toLowerCase();
    const base = assessments.filter((item) => item.tab === activeTab);

    const searched = base.filter((item) => {
      const assignmentFiles = getFilesFromItem(item);
      const fileNames = assignmentFiles
        .map((file) => file.originalName || file.filename || "")
        .join(" ");

      const haystack = [
        item.title,
        item.description,
        item.course,
        item.statusText,
        item.deadline,
        fileNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !q || haystack.includes(q);
    });

    return sortAssessments(searched, activeTab);
  }, [assessments, activeTab, search, assignmentLocked]);

  const courseLabel = useMemo(() => user?.course || "Not assigned", [user]);

  const questionCount = Array.isArray(activePretest?.questions)
    ? activePretest.questions.length
    : 0;

  const answeredCount = useMemo(() => {
    return Object.keys(pretestAnswers).filter(
      (key) =>
        typeof pretestAnswers[key] === "string" &&
        pretestAnswers[key].trim()
    ).length;
  }, [pretestAnswers]);

  const traineeName = getFullName(user) || "Trainee Full Name";
  const traineeEmail = getEmail(user) || "traineeemail@tamsi.com";
  const profilePhotoUrl = buildFileUrl(user?.profilePhoto);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const goToProfile = () => {
    if (token) goTo("/trainee-profile");
    else goTo("/trainee-login");
  };

  const handleSignOut = () => {
    clearTrainingSession();
    navigate("/trainee-login", { replace: true });
  };

  function openAssessment(item) {
    if (assignmentLocked) {
      setMsg({
        type: "error",
        text: "Please take and complete the pre-test before opening professor assignments.",
      });
      return;
    }

    setSelectedAssessment(item);
    setSubmissionFiles([]);
  }

  function closeAssessment() {
    setSelectedAssessment(null);
    setSubmissionFiles([]);
  }

  function handleAddSubmissionFile(event) {
    const pickedFile = event.target.files?.[0] || null;
    const result = addSingleFileToQueue(submissionFiles, pickedFile);

    if (result.error) {
      setMsg({ type: "error", text: result.error });
    } else {
      setMsg({ type: "", text: "" });
      setSubmissionFiles(result.files);
    }

    event.target.value = "";
  }

  function removeQueuedSubmissionFile(indexToRemove) {
    setSubmissionFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  }

  function handlePickPretestAnswer(questionId, answerText) {
    setPretestAnswers((prev) => ({
      ...prev,
      [String(questionId)]: answerText,
    }));
  }

  function openPretestModal() {
    setPretestError("");
    setPretestModalOpen(true);
  }

  function closePretestModal() {
    if (pretestSubmitting) return;
    setPretestModalOpen(false);
  }

  async function handleSubmitPretest() {
    if (!activePretest?.questions?.length) {
      setPretestError("No pre-test questions found.");
      return;
    }

    if (answeredCount !== activePretest.questions.length) {
      setPretestError("Please answer all questions before submitting.");
      return;
    }

    try {
      setPretestSubmitting(true);
      setPretestError("");

      const answers = activePretest.questions.map((item) => ({
        questionId: String(item.id),
        answer: String(pretestAnswers[String(item.id)] || "").trim(),
      }));

      const learningGoalValue =
        typeof user?.learningGoal === "string" ? user.learningGoal : "";

      const res = await fetch(`${API_BASE}/training/pretest/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers,
          learningGoal: learningGoalValue,
        }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Failed to submit pre-test.");
      }

      const result = data?.pretest || null;

      setPretestResult(result);

      const nextState = {
        ...(pretest || {}),
        requiresPretest: true,
        completed: true,
        latestAttempt: result,
        pretest: {
          ...(pretest?.pretest || {}),
          questions: [],
        },
      };

      setPretest(nextState);
      saveStoredPretestState(nextState);
      setPretestModalOpen(false);

      setMsg({
        type: "success",
        text: `Pre-test submitted. Your learning path is ${learningPathLabel(
          result?.learningPathLevel
        )}. Assignments are now unlocked.`,
      });

      await loadInitialData();
    } catch (err) {
      setPretestError(err.message || "Failed to submit pre-test.");
    } finally {
      setPretestSubmitting(false);
    }
  }

  async function submitAssignment() {
    try {
      if (assignmentLocked) {
        throw new Error("Please complete the pre-test before submitting assignments.");
      }

      if (!selectedAssessment?.assessmentId && !selectedAssessment?.id) {
        throw new Error("Assignment id is missing.");
      }

      if (!submissionFiles.length) {
        throw new Error("Please add at least 1 submission file.");
      }

      setSubmitting(true);
      setMsg({ type: "", text: "" });

      const formData = new FormData();

      submissionFiles.forEach((file) => {
        formData.append("submissionFiles", file);
      });

      const assessmentId =
        selectedAssessment.assessmentId || selectedAssessment.id;

      const res = await fetch(
        `${API_BASE}/training/assessments/${assessmentId}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Failed to submit assignment.");
      }

      setMsg({
        type: "success",
        text: data?.message || "Assignment submitted successfully.",
      });

      setSubmissionFiles([]);
      await loadInitialData();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to submit assignment.",
      });
    } finally {
      setSubmitting(false);
    }
  }

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
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Modules
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-assignment")}
              className="border-b-2 border-[#45674b] pb-1 text-[11px] font-bold uppercase tracking-wide text-[#173d25] xl:text-[12px]"
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
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Modules
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-assignment")}
                className="block w-full rounded-lg bg-white px-4 py-3 text-left text-sm font-bold text-[#173d25]"
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
                onClick={handleSignOut}
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

        {/* TRAINEE + FILTER BAR */}
        <section className="bg-gradient-to-b from-[#486b4b] via-[#123a20] to-[#123a20] px-5 py-9 text-white sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-['Montserrat',sans-serif] text-2xl font-extrabold uppercase leading-tight text-white">
                {traineeName}
              </h1>

              <p className="mt-1 text-sm font-semibold text-white/85">
                {traineeEmail}
              </p>

              <div className="mt-3 h-[2px] w-[250px] max-w-full rounded-full bg-white/45" />

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                  Course: {courseLabel}
                </span>

                {pretestCompleted ? (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${learningPathBadgeClass(
                      learningPath
                    )}`}
                  >
                    Learning Path: {learningPathLabel(learningPath)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:w-[560px]">
              <FilterButton
                active={activeTab === "upcoming"}
                label="Upcoming"
                count={counts.upcoming}
                onClick={() => setActiveTab("upcoming")}
              />

              <FilterButton
                active={activeTab === "pastDue"}
                label="Past Due"
                count={counts.pastDue}
                onClick={() => setActiveTab("pastDue")}
              />

              <FilterButton
                active={activeTab === "completed"}
                label="Completed"
                count={counts.completed}
                onClick={() => setActiveTab("completed")}
              />
            </div>
          </div>
        </section>

        {/* ASSIGNMENT CARDS */}
        <section className="bg-[#2e5038] px-5 py-14 text-white sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1280px]">
            {msg.text ? (
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
            ) : null}

            {pretestCompleted && latestAttempt ? (
              <div className="mb-6 rounded-2xl bg-white px-5 py-4 text-[#45674b] shadow-xl">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-lg font-extrabold">
                      Pre-Test Completed
                    </div>

                    <div className="mt-1 text-sm font-semibold text-[#45674b]/75">
                      Assignments are now unlocked for your account.
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#eef1e7] px-3 py-1 text-xs font-bold text-[#395345] ring-1 ring-[#355345]/10">
                      Score: {Number(latestAttempt?.scorePercent || 0)}%
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${learningPathBadgeClass(
                        latestAttempt?.learningPathLevel ||
                          latestAttempt?.learningPath
                      )}`}
                    >
                      Path:{" "}
                      {learningPathLabel(
                        latestAttempt?.learningPathLevel ||
                          latestAttempt?.learningPath
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {assignmentLocked ? (
              <div className="mb-6 rounded-2xl bg-white px-6 py-6 text-[#45674b] shadow-xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold">
                      Pre-Test Required
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#45674b]/75">
                      You need to take and submit the course pre-test before you
                      can open or answer assignments uploaded by your professor.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-full bg-[#eef1e7] px-3 py-1 ring-1 ring-[#d9dfd2]">
                        Course: {courseLabel}
                      </span>

                      <span className="rounded-full bg-yellow-50 px-3 py-1 text-yellow-700 ring-1 ring-yellow-200">
                        Assignments Locked
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openPretestModal}
                    disabled={pretestLoading}
                    className="rounded-full bg-[#45674b] px-8 py-3 font-['Montserrat',sans-serif] text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-[#2f463a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pretestLoading ? "Loading..." : "Take Pre-Test"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assignment"
                  className="h-[34px] w-full rounded-full border border-white/70 bg-white px-4 text-xs font-bold text-[#45674b] outline-none placeholder:text-[#45674b]/70 md:w-[340px]"
                />

                <div className="flex flex-wrap gap-2 text-xs font-semibold text-white/85">
                  <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
                    Upcoming: {counts.upcoming}
                  </span>

                  <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
                    Past Due: {counts.pastDue}
                  </span>

                  <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
                    Completed: {counts.completed}
                  </span>
                </div>
              </div>
            )}

            {loading || pretestLoading ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl">
                Loading assignments...
              </div>
            ) : assignmentLocked ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl">
                Professor assignments are hidden until you finish the pre-test.
              </div>
            ) : filteredAssessments.length === 0 ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl">
                No assignments found in this tab.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
                {filteredAssessments.map((item) => {
                  const fileCount = getFilesFromItem(item).length;
                  const submittedCount = item.submission
                    ? getFilesFromItem(item.submission).length
                    : 0;

                  return (
                    <button
                      key={item.id || item.assessmentId}
                      type="button"
                      onClick={() => openAssessment(item)}
                      className="flex min-h-[120px] items-center gap-5 rounded-lg bg-white px-6 py-5 text-left text-[#45674b] shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <PaperIcon />

                      <div className="min-w-0 flex-1">
                        <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold uppercase leading-none text-[#45674b]">
                          Assignment
                        </h2>

                        <p className="mt-1 text-sm font-extrabold text-[#45674b]/85">
                          {formatCardDate(item.dueDate)}
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#45674b]/75">
                          {getDaysMeta(item.dueDate, item.tab)}{" "}
                          {item.dueDate ? formatCardTime(item.dueDate) : ""}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ring-1 ${getStatusClasses(
                              item.tab
                            )}`}
                          >
                            {item.statusText || getTabLabel(item.tab)}
                          </span>

                          <span className="rounded-full bg-[#eef1e7] px-3 py-1 text-[10px] font-extrabold uppercase text-[#45674b] ring-1 ring-[#d9dfd2]">
                            Files: {fileCount}
                          </span>

                          {submittedCount ? (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-extrabold uppercase text-green-700 ring-1 ring-green-200">
                              Submitted: {submittedCount}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="self-end">
                        <span className="flex min-w-[100px] items-center justify-center rounded-full border-[3px] border-[#45674b] bg-white px-5 py-1 font-['Montserrat',sans-serif] text-xs font-extrabold uppercase text-[#45674b] transition hover:bg-[#45674b] hover:text-white">
                          {getAssessmentActionLabel(item)}
                        </span>
                      </div>
                    </button>
                  );
                })}
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
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Address
              </h3>

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

      <PretestModal open={pretestModalOpen} onClose={closePretestModal}>
        {activePretest ? (
          <div>
            <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
              <div className="text-lg font-extrabold text-[#395345]">
                {activePretest.title || "Course Pre-Test"}
              </div>

              <p className="mt-2 text-sm text-[#627165]">
                {activePretest.description ||
                  "Answer all questions before submitting."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#eef1e7] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#395345]">
                  {questionCount} questions
                </span>

                <span className="rounded-full bg-[#eef1e7] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#395345]">
                  Passing Score{" "}
                  {Number(activePretest.passingScorePercent || 60)}%
                </span>
              </div>
            </div>

            {pretestError ? (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 ring-1 ring-red-200">
                {pretestError}
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              {(activePretest.questions || []).map((question, index) => {
                const questionId = String(question.id);
                const selectedAnswer = pretestAnswers[questionId] || "";

                return (
                  <div
                    key={questionId}
                    className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]"
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                      Question {index + 1}
                    </div>

                    <div className="mt-2 text-base font-semibold text-[#395345]">
                      {question.prompt}
                    </div>

                    <div className="mt-4 grid gap-3">
                      {(question.options || []).map((option, optionIndex) => {
                        const optionText =
                          typeof option === "string"
                            ? option
                            : option?.label ||
                              option?.text ||
                              option?.value ||
                              "";

                        const checked = selectedAnswer === optionText;

                        return (
                          <label
                            key={`${questionId}-${optionIndex}`}
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                              checked
                                ? "border-[#395345] bg-[#eef1e7]"
                                : "border-[#dde3d6] bg-[#f7f8f3]"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`pretest-${questionId}`}
                              checked={checked}
                              onChange={() =>
                                handlePickPretestAnswer(questionId, optionText)
                              }
                              className="mt-1 h-4 w-4"
                            />

                            <span className="text-sm text-[#395345]">
                              {optionText}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da] md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-[#627165]">
                Answered {answeredCount} of {questionCount}
              </div>

              <button
                type="button"
                onClick={handleSubmitPretest}
                disabled={pretestSubmitting}
                className="rounded-2xl bg-[#395345] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white disabled:opacity-60"
              >
                {pretestSubmitting ? "Submitting..." : "Submit Pre-Test"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#f7f8f3] px-5 py-6 text-sm text-[#627165] ring-1 ring-[#e2e8da]">
            No pre-test is configured for this course yet.
          </div>
        )}
      </PretestModal>

      <ModalShell
        open={Boolean(selectedAssessment)}
        onClose={closeAssessment}
        title={selectedAssessment?.title || "Assignment Details"}
        maxWidth="max-w-6xl"
      >
        {selectedAssessment ? (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ring-1 ${getStatusClasses(
                      selectedAssessment.tab
                    )}`}
                  >
                    {selectedAssessment.statusText ||
                      getTabLabel(selectedAssessment.tab)}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#395345] ring-1 ring-[#d7ddd0]">
                    {selectedAssessment.course || "-"}
                  </span>
                </div>

                <div className="mt-4 text-2xl font-extrabold text-[#395345]">
                  {selectedAssessment.title}
                </div>

                <p className="mt-3 text-sm leading-7 text-[#647166]">
                  {selectedAssessment.description ||
                    "No description provided."}
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <DetailBox
                    label="Upload Opens"
                    value={formatDateTime(selectedAssessment.uploadOpenAt)}
                  />

                  <DetailBox
                    label="Due Date"
                    value={formatDateTime(selectedAssessment.dueDate)}
                  />

                  <DetailBox
                    label="Total Points"
                    value={Number(selectedAssessment.totalPoints || 0)}
                    strong
                  />

                  <DetailBox
                    label="Score"
                    value={
                      selectedAssessment.score != null
                        ? `${selectedAssessment.score}/${selectedAssessment.totalPoints}`
                        : "Not graded yet"
                    }
                    strong
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
                <div className="text-sm font-bold text-[#395345]">
                  Assignment Files
                </div>

                <p className="mt-1 text-xs text-[#647166]">
                  Review the files attached by your professor.
                </p>

                <div className="mt-4 space-y-4">
                  {getFilesFromItem(selectedAssessment).length ? (
                    getFilesFromItem(selectedAssessment).map((file, index) => {
                      const fileUrl = getFileUrl(file);
                      const fileName =
                        file?.originalName ||
                        file?.filename ||
                        `Assignment File ${index + 1}`;

                      return (
                        <FilePreviewCard
                          key={`${file.fileId || fileName}-${index}`}
                          file={file}
                          index={index}
                          fileUrl={fileUrl}
                          fileName={fileName}
                        />
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3 text-sm text-[#647166]">
                      No assignment files attached.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
              <div className="text-sm font-bold text-[#395345]">
                Your Submission
              </div>

              <p className="mt-1 text-xs text-[#647166]">
                You can upload up to 5 files for the professor to grade.
              </p>

              {selectedAssessment.submission ? (
                <div className="mt-4">
                  <div className="rounded-xl bg-[#eef1e7] px-4 py-3 text-sm font-semibold text-[#395345]">
                    Submitted at:{" "}
                    {formatDateTime(selectedAssessment.submission.submittedAt)}
                  </div>

                  <div className="mt-4 space-y-3">
                    {getFilesFromItem(selectedAssessment.submission).map(
                      (file, index) => {
                        const fileUrl = getFileUrl(file);
                        const fileName =
                          file?.originalName ||
                          file?.filename ||
                          `Submission File ${index + 1}`;

                        return (
                          <div
                            key={`${file.fileId || fileName}-${index}`}
                            className="flex items-center justify-between rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3"
                          >
                            <div className="min-w-0 pr-4">
                              <div className="truncate text-sm font-semibold text-[#395345]">
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
                                className="rounded-xl border border-[#c6ccb9] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#395345]"
                              >
                                Open
                              </a>
                            ) : null}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3 text-sm text-[#647166]">
                  No submission yet.
                </div>
              )}

              {selectedAssessment.canSubmit ? (
                <div className="mt-5">
                  <div className="text-sm font-bold text-[#395345]">
                    Add Submission Files
                  </div>

                  <p className="mt-1 text-xs text-[#647166]">
                    {getSubmissionHelperText(selectedAssessment)}
                  </p>

                  <input
                    type="file"
                    onChange={handleAddSubmissionFile}
                    className="mt-4 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                  />

                  {submissionFiles.length ? (
                    <div className="mt-4 space-y-2">
                      {submissionFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${file.size}-${index}`}
                          className="flex items-center justify-between rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3"
                        >
                          <div className="min-w-0 pr-4">
                            <div className="truncate text-sm font-semibold text-[#395345]">
                              {index + 1}. {file.name}
                            </div>

                            <div className="mt-1 text-xs text-[#647166]">
                              {formatBytes(file.size)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeQueuedSubmissionFile(index)}
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={submitAssignment}
                      disabled={submitting}
                      className="rounded-2xl bg-[#395345] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#2f463a] disabled:opacity-60"
                    >
                      {getSubmitButtonLabel(selectedAssessment, submitting)}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3 text-sm text-[#647166]">
                  {getClosedSubmissionMessage(selectedAssessment)}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </ModalShell>
    </div>
  );
}

function FilterButton({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-[30px] rounded-full border-2 px-5 font-['Montserrat',sans-serif] text-xs font-extrabold uppercase transition",
        active
          ? "border-white bg-white text-[#45674b] shadow-md"
          : "border-white bg-white/95 text-[#45674b] hover:bg-white",
      ].join(" ")}
    >
      {label} {count ? `(${count})` : ""}
    </button>
  );
}

function PaperIcon() {
  return (
    <svg
      viewBox="0 0 90 90"
      className="h-16 w-16 shrink-0 text-[#8a936e]"
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

function DetailBox({ label, value, strong = false }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
        {label}
      </div>

      <div
        className={[
          "mt-2 text-sm text-[#395345]",
          strong ? "font-semibold" : "",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function FilePreviewCard({ file, index, fileUrl, fileName }) {
  return (
    <div className="rounded-2xl border border-[#dde3d6] bg-[#f7f8f3] p-4">
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
            className="rounded-xl border border-[#c6ccb9] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#395345]"
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
          Preview is not available for this file type. Use the Open button
          above.
        </div>
      )}
    </div>
  );
}
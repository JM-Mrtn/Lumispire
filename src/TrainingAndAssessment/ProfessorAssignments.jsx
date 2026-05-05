// src/TrainingAndAssessment/ProfessorAssignments.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildTrainingFileUrl } from "./trainingFileUrl";
import {
  API_BASE,
  fetchJson,
  getStoredProfessor,
  normalizeCourseAssignments,
  professorAuthHeaders,
  readJsonSafe,
} from "./professorSession";

const MAX_ASSIGNMENT_FILES = 5;
const MAX_ASSIGNMENT_FILE_SIZE = 25 * 1024 * 1024;
const FIXED_TOTAL_POINTS = 100;
const ROWS_PER_PAGE = 5;

const ALLOWED_ASSIGNMENT_EXTENSIONS = new Set([
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

function toDateTimeLocalValue(value) {
  if (!value) return "";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatBytes(bytes = 0) {
  const size = Number(bytes || 0);

  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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

function getAssignmentId(item) {
  return item?._id || item?.id || item?.assessmentId || "";
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

function getFileExtension(name = "") {
  const idx = String(name || "").lastIndexOf(".");
  return idx >= 0 ? String(name).slice(idx).toLowerCase() : "";
}

function validateAssignmentFile(file) {
  if (!file) return "No file selected.";

  const ext = getFileExtension(file.name);

  if (!ALLOWED_ASSIGNMENT_EXTENSIONS.has(ext)) {
    return "Only PDF, image, DOC, DOCX, PPT, PPTX, TXT, XLS, and XLSX files are allowed.";
  }

  if (file.size > MAX_ASSIGNMENT_FILE_SIZE) {
    return "Each assignment file must be 25MB or less.";
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

function addSingleFileToQueue(
  currentFiles,
  pickedFile,
  maxCount = MAX_ASSIGNMENT_FILES
) {
  if (!pickedFile) {
    return { files: currentFiles, error: "No file selected." };
  }

  if (currentFiles.length >= maxCount) {
    return {
      files: currentFiles,
      error: `You can upload up to ${maxCount} assignment files only.`,
    };
  }

  const validationError = validateAssignmentFile(pickedFile);

  if (validationError) {
    return { files: currentFiles, error: validationError };
  }

  const alreadyExists = currentFiles.some((file) =>
    isSamePickedFile(file, pickedFile)
  );

  if (alreadyExists) {
    return { files: currentFiles, error: "That file is already added." };
  }

  return {
    files: [...currentFiles, pickedFile],
    error: "",
  };
}

function getStatusLabel(item) {
  const now = new Date();

  if (item?.uploadOpenAt) {
    const openAt = new Date(item.uploadOpenAt);

    if (!Number.isNaN(openAt.getTime()) && now.getTime() < openAt.getTime()) {
      return "Scheduled";
    }
  }

  if (item?.dueDate) {
    const due = new Date(item.dueDate);

    if (!Number.isNaN(due.getTime()) && due.getTime() < now.getTime()) {
      return "Past Due";
    }
  }

  return "Open";
}

function getSubmissionCount(item) {
  return (
    item?.totalSubmissions ??
    item?.submissionCount ??
    item?.submissionsCount ??
    item?.submittedCount ??
    item?.submissions?.length ??
    0
  );
}

function statusPillClass(label) {
  const clean = String(label || "").toLowerCase();

  if (clean === "open") return "bg-[#bdf0a4] text-[#2d5038]";
  if (clean === "scheduled") return "bg-blue-100 text-blue-800";
  if (clean === "past due") return "bg-yellow-100 text-yellow-800";

  return "bg-[#bdf0a4] text-[#2d5038]";
}

function getStatusClasses(label) {
  if (label === "Open") return "bg-green-50 text-green-700 ring-green-200";
  if (label === "Scheduled") return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-yellow-50 text-yellow-700 ring-yellow-200";
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

function getAssignmentFiles(item) {
  if (Array.isArray(item?.files) && item.files.length) {
    return item.files.map((file) => ({
      fileId: getObjectIdString(file?.fileId),
      originalName: file?.originalName || file?.filename || "Assignment File",
      filename: file?.filename || file?.originalName || "Assignment File",
      mimetype: file?.mimetype || file?.mimeType || "",
      size: Number(file?.size || 0),
    }));
  }

  const legacyId =
    item?.fileId ||
    item?.assignmentFileId ||
    item?.file?.fileId ||
    item?.assignmentFile?.fileId ||
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
        "Assignment File",
      filename:
        item?.filename ||
        item?.fileName ||
        item?.file?.filename ||
        "Assignment File",
      mimetype: item?.mimeType || item?.mimetype || item?.file?.mimetype || "",
      size: Number(item?.fileSize || item?.size || item?.file?.size || 0),
    },
  ];
}

function getSubmissionFiles(item) {
  if (Array.isArray(item?.files) && item.files.length) {
    return item.files.map((file) => ({
      fileId: getObjectIdString(file?.fileId),
      originalName: file?.originalName || file?.filename || "Submission File",
      filename: file?.filename || file?.originalName || "Submission File",
      mimetype: file?.mimetype || file?.mimeType || "",
      size: Number(file?.size || 0),
    }));
  }

  const legacyId = item?.fileId || item?.submissionFileId || item?.file?.fileId || "";

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
        "Submission File",
      filename:
        item?.filename ||
        item?.fileName ||
        item?.file?.filename ||
        "Submission File",
      mimetype: item?.mimeType || item?.mimetype || item?.file?.mimetype || "",
      size: Number(item?.fileSize || item?.size || item?.file?.size || 0),
    },
  ];
}

function getAssignmentFileUrl(file) {
  const fileId = getObjectIdString(file?.fileId);

  if (!fileId) return "";

  return buildTrainingFileUrl(fileId);
}

function ModalShell({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-5xl",
}) {
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

export default function ProfessorAssignments() {
  const navigate = useNavigate();
  const storedProfessor = useMemo(() => getStoredProfessor(), []);

  const [professor] = useState(() => storedProfessor);
  const [allowedCourses, setAllowedCourses] = useState(() =>
    normalizeCourseAssignments(storedProfessor?.courseAssignments || [])
  );

  const [items, setItems] = useState([]);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    course: "",
    totalPoints: FIXED_TOTAL_POINTS,
    uploadOpenAt: "",
    dueDate: "",
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    course: "",
    totalPoints: FIXED_TOTAL_POINTS,
    uploadOpenAt: "",
    dueDate: "",
  });

  const [createFiles, setCreateFiles] = useState([]);
  const [editExistingFiles, setEditExistingFiles] = useState([]);
  const [removedExistingFileIds, setRemovedExistingFileIds] = useState([]);
  const [editNewFiles, setEditNewFiles] = useState([]);

  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const [gradeDrafts, setGradeDrafts] = useState({});
  const [gradeSavingKey, setGradeSavingKey] = useState("");

  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [courseFilter, setCourseFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const editOpen = Boolean(editingId);

  const professorName = getProfessorName(professor);
  const professorEmail = professor?.email || "traineemail@tamsi.com";

  const menuItems = [
    { label: "Dashboard", path: "/professor-dashboard" },
    { label: "Manage Attendance", path: "/professor-attendance" },
    { label: "Manage Assignment", path: "/professor-assessments" },
    { label: "Manage Modules", path: "/professor-modules" },
    { label: "Manage Progress", path: "/professor-progress" },
  ];

  const courseOptions = useMemo(() => {
    if (!allowedCourses.length) return [];
    return allowedCourses;
  }, [allowedCourses]);

  const courseFilterOptions = useMemo(() => {
    if (!allowedCourses.length) return [];
    return allowedCourses.length > 1 ? ["All", ...allowedCourses] : allowedCourses;
  }, [allowedCourses]);

  useEffect(() => {
    if (!allowedCourses.length) return;

    setCreateForm((prev) => ({
      ...prev,
      course:
        allowedCourses.includes(prev.course) && prev.course
          ? prev.course
          : allowedCourses[0],
      totalPoints: FIXED_TOTAL_POINTS,
    }));

    setEditForm((prev) => ({
      ...prev,
      course:
        allowedCourses.includes(prev.course) && prev.course
          ? prev.course
          : allowedCourses[0],
      totalPoints: FIXED_TOTAL_POINTS,
    }));

    setCourseFilter((prev) => {
      if (prev === "All" && allowedCourses.length > 1) return prev;
      if (allowedCourses.includes(prev)) return prev;
      return allowedCourses.length > 1 ? "All" : allowedCourses[0];
    });
  }, [allowedCourses]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setMsg({ type: "", text: "" });

      const assignmentData = await fetchJson(`${API_BASE}/professors/assessments`, {
        headers: professorAuthHeaders(),
      });

      const nextAllowedCourses = normalizeCourseAssignments(
        storedProfessor?.courseAssignments || assignmentData?.allowedCourses || []
      );

      const nextItems = Array.isArray(assignmentData?.assessments)
        ? assignmentData.assessments
        : [];

      setAllowedCourses(nextAllowedCourses);
      setItems(nextItems);

      setSelectedItem((prev) => {
        const prevId = getAssignmentId(prev);

        if (!prevId) return prev;

        return nextItems.find((item) => getAssignmentId(item) === prevId) || prev;
      });
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to load assignments.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(() => {
    return [...items]
      .filter((item) => courseFilter === "All" || item.course === courseFilter)
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
  }, [items, courseFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ROWS_PER_PAGE));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredItems.slice(start, start + ROWS_PER_PAGE);
  }, [filteredItems, page]);

  useEffect(() => {
    setPage(1);
  }, [courseFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function updateCreateForm(key, value) {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateEditForm(key, value) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateGradeDraft(traineeUserId, key, value) {
    const id = String(traineeUserId || "");

    setGradeDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [key]: value,
      },
    }));
  }

  function resetCreateForm() {
    setCreateForm({
      title: "",
      description: "",
      course: allowedCourses[0] || "",
      totalPoints: FIXED_TOTAL_POINTS,
      uploadOpenAt: "",
      dueDate: "",
    });
    setCreateFiles([]);
  }

  function closeCreateModal() {
    setCreateModalOpen(false);
    resetCreateForm();
  }

  function closeEditModal() {
    setEditingId("");
    setEditForm({
      title: "",
      description: "",
      course: allowedCourses[0] || "",
      totalPoints: FIXED_TOTAL_POINTS,
      uploadOpenAt: "",
      dueDate: "",
    });
    setEditExistingFiles([]);
    setRemovedExistingFileIds([]);
    setEditNewFiles([]);
  }

  function closeDetailsModal() {
    setSelectedItem(null);
    setAssignmentSubmissions([]);
    setSubmissionError("");
    setGradeDrafts({});
    setGradeSavingKey("");
  }

  async function loadAssignmentSubmissions(assignmentId) {
    try {
      if (!assignmentId) {
        setAssignmentSubmissions([]);
        setGradeDrafts({});
        return;
      }

      setSubmissionLoading(true);
      setSubmissionError("");

      const data = await fetchJson(
        `${API_BASE}/professors/assessments/${assignmentId}/submissions`,
        {
          headers: professorAuthHeaders(),
        }
      );

      const submissions = Array.isArray(data?.submissions) ? data.submissions : [];
      setAssignmentSubmissions(submissions);

      const nextDrafts = {};

      submissions.forEach((submission) => {
        const key = String(submission?.traineeUserId || "");

        nextDrafts[key] = {
          score:
            submission?.score != null && !Number.isNaN(Number(submission.score))
              ? String(submission.score)
              : "",
        };
      });

      setGradeDrafts(nextDrafts);
    } catch (err) {
      setAssignmentSubmissions([]);
      setGradeDrafts({});
      setSubmissionError(err.message || "Failed to load trainee submissions.");
    } finally {
      setSubmissionLoading(false);
    }
  }

  async function openAssignmentDetails(item) {
    setSelectedItem(item);
    setAssignmentSubmissions([]);
    setSubmissionError("");
    setGradeDrafts({});
    setGradeSavingKey("");

    await loadAssignmentSubmissions(getAssignmentId(item));
  }

  function handleAddCreateFile(event) {
    const pickedFile = event.target.files?.[0] || null;
    const result = addSingleFileToQueue(
      createFiles,
      pickedFile,
      MAX_ASSIGNMENT_FILES
    );

    if (result.error) {
      setMsg({ type: "error", text: result.error });
    } else {
      setMsg({ type: "", text: "" });
      setCreateFiles(result.files);
    }

    event.target.value = "";
  }

  function removeQueuedCreateFile(indexToRemove) {
    setCreateFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  function handleAddEditFile(event) {
    const pickedFile = event.target.files?.[0] || null;
    const keptExistingCount = editExistingFiles.filter(
      (file) => !removedExistingFileIds.includes(String(file.fileId || ""))
    ).length;

    const remainingSlots = MAX_ASSIGNMENT_FILES - keptExistingCount;
    const result = addSingleFileToQueue(editNewFiles, pickedFile, remainingSlots);

    if (result.error) {
      setMsg({ type: "error", text: result.error });
    } else {
      setMsg({ type: "", text: "" });
      setEditNewFiles(result.files);
    }

    event.target.value = "";
  }

  function removeQueuedEditFile(indexToRemove) {
    setEditNewFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  function toggleRemoveExistingFile(fileId) {
    const id = String(fileId || "");

    if (!id) return;

    setRemovedExistingFileIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function validateSchedule(uploadOpenAt, dueDate) {
    if (uploadOpenAt) {
      const openAtDate = new Date(uploadOpenAt);

      if (Number.isNaN(openAtDate.getTime())) {
        throw new Error("Upload open date/time is invalid.");
      }
    }

    if (dueDate) {
      const dueDateValue = new Date(dueDate);

      if (Number.isNaN(dueDateValue.getTime())) {
        throw new Error("Due date/time is invalid.");
      }
    }

    if (uploadOpenAt && dueDate) {
      const openAtDate = new Date(uploadOpenAt);
      const dueDateValue = new Date(dueDate);

      if (openAtDate.getTime() > dueDateValue.getTime()) {
        throw new Error("Due date/time must be later than the upload open date/time.");
      }
    }
  }

  async function submitCreate(e) {
    e.preventDefault();

    try {
      setSavingCreate(true);
      setMsg({ type: "", text: "" });

      if (!String(createForm.title || "").trim()) {
        throw new Error("Assignment title is required.");
      }

      if (!String(createForm.course || "").trim()) {
        throw new Error("Course is required.");
      }

      validateSchedule(createForm.uploadOpenAt, createForm.dueDate);

      if (createFiles.length > MAX_ASSIGNMENT_FILES) {
        throw new Error(
          `You can upload up to ${MAX_ASSIGNMENT_FILES} assignment files only.`
        );
      }

      const formData = new FormData();
      formData.append("title", String(createForm.title || "").trim());
      formData.append("description", String(createForm.description || "").trim());
      formData.append("course", createForm.course);
      formData.append("totalPoints", String(FIXED_TOTAL_POINTS));
      formData.append("uploadOpenAt", createForm.uploadOpenAt || "");
      formData.append("dueDate", createForm.dueDate || "");

      createFiles.forEach((file) => {
        formData.append("assessmentFiles", file);
      });

      const res = await fetch(`${API_BASE}/professors/assessments`, {
        method: "POST",
        headers: professorAuthHeaders(),
        body: formData,
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create assignment.");
      }

      setMsg({
        type: "success",
        text: "Assignment created successfully.",
      });

      closeCreateModal();
      await loadItems();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to create assignment.",
      });
    } finally {
      setSavingCreate(false);
    }
  }

  async function submitEdit(e) {
    e.preventDefault();

    try {
      setSavingEdit(true);
      setMsg({ type: "", text: "" });

      if (!editingId) {
        throw new Error("Assignment id is missing.");
      }

      if (!String(editForm.title || "").trim()) {
        throw new Error("Assignment title is required.");
      }

      if (!String(editForm.course || "").trim()) {
        throw new Error("Course is required.");
      }

      validateSchedule(editForm.uploadOpenAt, editForm.dueDate);

      const keptExistingCount = editExistingFiles.filter(
        (file) => !removedExistingFileIds.includes(String(file.fileId || ""))
      ).length;

      const finalCount = keptExistingCount + editNewFiles.length;

      if (finalCount > MAX_ASSIGNMENT_FILES) {
        throw new Error(
          `An assignment can only have up to ${MAX_ASSIGNMENT_FILES} files.`
        );
      }

      const formData = new FormData();
      formData.append("title", String(editForm.title || "").trim());
      formData.append("description", String(editForm.description || "").trim());
      formData.append("course", editForm.course);
      formData.append("totalPoints", String(FIXED_TOTAL_POINTS));
      formData.append("uploadOpenAt", editForm.uploadOpenAt || "");
      formData.append("dueDate", editForm.dueDate || "");
      formData.append("removedFileIds", JSON.stringify(removedExistingFileIds));

      editNewFiles.forEach((file) => {
        formData.append("assessmentFiles", file);
      });

      const res = await fetch(`${API_BASE}/professors/assessments/${editingId}`, {
        method: "PUT",
        headers: professorAuthHeaders(),
        body: formData,
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update assignment.");
      }

      setMsg({
        type: "success",
        text: "Assignment updated successfully.",
      });

      closeEditModal();
      await loadItems();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to update assignment.",
      });
    } finally {
      setSavingEdit(false);
    }
  }

  async function saveSubmissionGrade(submission) {
    try {
      const traineeUserId = String(submission?.traineeUserId || "");
      const assessmentId = String(getAssignmentId(selectedItem));

      if (!traineeUserId || !assessmentId) {
        throw new Error("Missing trainee or assignment id.");
      }

      const draft = gradeDrafts[traineeUserId] || {};
      const numericScore = Number(draft.score);

      if (draft.score === "" || Number.isNaN(numericScore)) {
        throw new Error("Please enter a valid score.");
      }

      if (!Number.isInteger(numericScore)) {
        throw new Error("Score must be a whole number.");
      }

      if (numericScore < 0 || numericScore > 100) {
        throw new Error("Score must be between 0 and 100.");
      }

      setGradeSavingKey(`${assessmentId}-${traineeUserId}`);
      setMsg({ type: "", text: "" });

      const res = await fetch(`${API_BASE}/professors/scores`, {
        method: "POST",
        headers: professorAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          traineeUserId,
          assessmentId,
          score: numericScore,
          remarks: "",
        }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save score.");
      }

      setMsg({
        type: "success",
        text: "Score saved successfully.",
      });

      await loadAssignmentSubmissions(assessmentId);
      await loadItems();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to save score.",
      });
    } finally {
      setGradeSavingKey("");
    }
  }

  function startEdit(item) {
    setEditingId(getAssignmentId(item));
    setEditForm({
      title: item.title || "",
      description: item.description || "",
      course: item.course || allowedCourses[0] || "",
      totalPoints: FIXED_TOTAL_POINTS,
      uploadOpenAt: toDateTimeLocalValue(item.uploadOpenAt),
      dueDate: toDateTimeLocalValue(item.dueDate),
    });
    setEditExistingFiles(getAssignmentFiles(item));
    setRemovedExistingFileIds([]);
    setEditNewFiles([]);
    setSelectedItem(null);
    setAssignmentSubmissions([]);
    setSubmissionError("");
    setGradeDrafts({});
    setGradeSavingKey("");
  }

  async function removeItem(id) {
    const ok = window.confirm("Delete this assignment?");

    if (!ok) return;

    try {
      await fetchJson(`${API_BASE}/professors/assessments/${id}`, {
        method: "DELETE",
        headers: professorAuthHeaders(),
      });

      setMsg({
        type: "success",
        text: "Assignment deleted successfully.",
      });

      if (getAssignmentId(selectedItem) === id) {
        closeDetailsModal();
      }

      if (editingId === id) {
        closeEditModal();
      }

      await loadItems();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to delete assignment.",
      });
    }
  }

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
              const active = item.label === "Manage Assignment";

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
                Manage Trainee Assignment
              </h2>
              <div className="mt-1 h-1 w-full max-w-[530px] bg-white/60" />
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
              <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                <div>
                  <label className="text-base font-black uppercase text-white">
                    Course
                  </label>

                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    disabled={courseFilterOptions.length <= 1}
                    className="mt-1 h-8 w-full max-w-[270px] rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none disabled:bg-white/80"
                  >
                    {!courseFilterOptions.length ? (
                      <option value="">No assigned course</option>
                    ) : (
                      courseFilterOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={loadItems}
                  disabled={loading}
                  className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>

                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  disabled={!allowedCourses.length}
                  className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Create Assignment
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-[#2d5038] shadow-sm">
              <div className="bg-white px-4 py-4">
                <h3 className="text-lg font-black text-[#2d5038]">
                  Trainee Assignment
                </h3>
              </div>

              <div className="min-h-[372px] divide-y divide-white/25">
                {loading ? (
                  [1, 2].map((item) => (
                    <div
                      key={item}
                      className="grid gap-4 px-3 py-4 md:grid-cols-[80px_1.4fr_1.2fr_.9fr_.9fr_100px_90px] md:items-center"
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
                ) : paginatedItems.length ? (
                  paginatedItems.map((item) => {
                    const statusLabel = getStatusLabel(item);

                    return (
                      <div
                        key={getAssignmentId(item)}
                        className="grid gap-4 px-3 py-4 text-sm font-black md:grid-cols-[80px_1.4fr_1.2fr_.9fr_.9fr_100px_90px] md:items-center"
                      >
                        <div className="h-11 w-11 rounded-full bg-white" />

                        <div className="text-white">
                          {item.title || "Title of Assignment"}
                        </div>

                        <div className="text-white/90">
                          {getSubmissionCount(item)} Submission
                        </div>

                        <div className="text-white/90">
                          {item.totalPoints || FIXED_TOTAL_POINTS}
                        </div>

                        <div className="text-white/90">
                          {item.dueDate ? formatDateTime(item.dueDate) : "Deadline"}
                        </div>

                        <div>
                          <span
                            className={`inline-flex min-w-[84px] justify-center rounded-full px-3 py-1 text-[10px] font-black ${statusPillClass(
                              statusLabel
                            )}`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => openAssignmentDetails(item)}
                          className="inline-flex min-w-[84px] justify-center rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#2d5038] transition hover:bg-[#eef1e7]"
                        >
                          View
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-5 py-12 text-center text-sm font-bold text-white/80">
                    No assignments found for this course.
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
        open={createModalOpen}
        onClose={closeCreateModal}
        title="Create Assignment"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={submitCreate} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
              Assignment Title
            </label>

            <input
              type="text"
              value={createForm.title}
              onChange={(e) => updateCreateForm("title", e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
              placeholder="Enter assignment title"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
              Course
            </label>

            <select
              value={createForm.course}
              onChange={(e) => updateCreateForm("course", e.target.value)}
              disabled={courseOptions.length <= 1}
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345] disabled:bg-[#f7f8f3]"
            >
              {courseOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
              Total Points
            </label>

            <input
              type="number"
              value={FIXED_TOTAL_POINTS}
              readOnly
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-[#f7f8f3] px-4 py-3 text-sm font-semibold text-[#395345] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
              Upload Open Date &amp; Time
            </label>

            <input
              type="datetime-local"
              value={createForm.uploadOpenAt}
              onChange={(e) => updateCreateForm("uploadOpenAt", e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
              Due Date
            </label>

            <input
              type="datetime-local"
              value={createForm.dueDate}
              onChange={(e) => updateCreateForm("dueDate", e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
              Description
            </label>

            <textarea
              value={createForm.description}
              onChange={(e) => updateCreateForm("description", e.target.value)}
              rows="4"
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
              placeholder="Enter assignment description"
            />
          </div>

          <div className="md:col-span-2 rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#dfe4d8]">
            <div className="text-sm font-black text-[#395345]">
              Add Assignment Files
            </div>

            <p className="mt-1 text-xs text-[#647166]">
              Add files one at a time. Up to 5 files. Optional.
            </p>

            <input
              type="file"
              onChange={handleAddCreateFile}
              className="mt-4 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
            />

            {createFiles.length ? (
              <div className="mt-4 space-y-2">
                {createFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-[#dde3d6] bg-white px-4 py-3"
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
                      onClick={() => removeQueuedCreateFile(index)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeCreateModal}
              className="rounded-xl border border-[#c6ccb9] bg-white px-5 py-3 text-sm font-black text-[#395345]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={savingCreate}
              className="rounded-xl bg-[#395345] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingCreate ? "Creating..." : "Submit Assignment"}
            </button>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        open={!!selectedItem}
        onClose={closeDetailsModal}
        title={selectedItem?.title || "Assignment Details"}
      >
        {selectedItem ? (
          <div>
            <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
              <div className="flex flex-wrap gap-3">
                <span
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ring-1 ${getStatusClasses(
                    getStatusLabel(selectedItem)
                  )}`}
                >
                  {getStatusLabel(selectedItem)}
                </span>

                <span className="rounded-full bg-[#eef1e7] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#395345]">
                  {selectedItem.course}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <SummaryCard
                  label="Total Points"
                  value={selectedItem.totalPoints || FIXED_TOTAL_POINTS}
                />

                <SummaryCard
                  label="Total Submission"
                  value={getSubmissionCount(selectedItem)}
                />

                <SummaryCard
                  label="Upload Opens"
                  value={formatDateTime(selectedItem.uploadOpenAt)}
                />

                <SummaryCard
                  label="Due Date"
                  value={formatDateTime(selectedItem.dueDate)}
                />

                <SummaryCard
                  label="Created By"
                  value={selectedItem.createdByName || "-"}
                />

                <SummaryCard
                  label="Created At"
                  value={formatDateTime(selectedItem.createdAt)}
                />
              </div>

              <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-[#e6ebde]">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-[#748175]">
                  Description
                </div>

                <p className="mt-3 text-sm leading-7 text-[#647166]">
                  {selectedItem.description || "No description provided."}
                </p>
              </div>

              <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-[#e6ebde]">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-[#748175]">
                  Files
                </div>

                <div className="mt-4 space-y-4">
                  {getAssignmentFiles(selectedItem).length ? (
                    getAssignmentFiles(selectedItem).map((file, index) => {
                      const fileUrl = getAssignmentFileUrl(file);
                      const fileName =
                        file?.originalName ||
                        file?.filename ||
                        `Assignment File ${index + 1}`;
                      const mimeType = file?.mimetype || "";

                      return (
                        <div
                          key={`${file.fileId || fileName}-${index}`}
                          className="overflow-hidden rounded-2xl border border-[#e3e9db] bg-[#f8faf5]"
                        >
                          <div className="border-b border-[#e3e9db] bg-white px-5 py-4">
                            <div className="text-sm font-black text-[#395345]">
                              {index + 1}. {fileName}
                            </div>

                            <div className="mt-1 text-xs text-[#627165]">
                              Size: {formatBytes(file?.size || 0)}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                              {fileUrl ? (
                                <>
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-full border border-[#c8ccbf] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#395345]"
                                  >
                                    Open File
                                  </a>

                                  <a
                                    href={fileUrl}
                                    download={fileName}
                                    className="rounded-full bg-[#395345] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white"
                                  >
                                    Download
                                  </a>
                                </>
                              ) : null}
                            </div>
                          </div>

                          {fileUrl ? (
                            isPreviewableImage(mimeType, fileName) ? (
                              <img
                                src={fileUrl}
                                alt={fileName}
                                className="max-h-[72vh] w-full bg-white object-contain"
                              />
                            ) : isPreviewablePdf(mimeType, fileName) ? (
                              <iframe
                                title={fileName}
                                src={fileUrl}
                                className="h-[72vh] w-full bg-white"
                              />
                            ) : (
                              <div className="p-8 text-sm text-[#627165]">
                                This file type cannot be previewed inside the modal.
                                Use the buttons above to open or download it.
                              </div>
                            )
                          ) : (
                            <div className="p-8 text-sm text-[#627165]">
                              File link is not available for this item.
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3 text-sm text-[#647166]">
                      No files attached.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-[#e6ebde]">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-[#748175]">
                  Trainee Submissions
                </div>

                {submissionLoading ? (
                  <div className="mt-4 rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3 text-sm text-[#647166]">
                    Loading trainee submissions...
                  </div>
                ) : submissionError ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submissionError}
                  </div>
                ) : assignmentSubmissions.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3 text-sm text-[#647166]">
                    No trainee submissions yet.
                  </div>
                ) : (
                  <div className="mt-4 space-y-5">
                    {assignmentSubmissions.map((submission, submissionIndex) => {
                      const files = getSubmissionFiles(submission);
                      const traineeUserId = String(
                        submission?.traineeUserId || ""
                      );
                      const savingKey = `${getAssignmentId(
                        selectedItem
                      )}-${traineeUserId}`;

                      return (
                        <div
                          key={
                            submission.submissionId ||
                            submission.id ||
                            `${traineeUserId}-${submissionIndex}`
                          }
                          className="rounded-2xl border border-[#dde3d6] bg-[#fbfcf8] p-4"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="text-lg font-black text-[#395345]">
                                {submission.traineeName || "Unnamed Trainee"}
                              </div>

                              <div className="mt-1 text-sm text-[#647166]">
                                Submitted: {formatDateTime(submission.submittedAt)}
                              </div>

                              {submission.score != null ? (
                                <div className="mt-1 text-sm font-semibold text-[#395345]">
                                  Score: {submission.score}
                                  {submission.percentage != null
                                    ? ` (${submission.percentage}%)`
                                    : ""}
                                </div>
                              ) : (
                                <div className="mt-1 text-sm text-[#647166]">
                                  Not graded yet
                                </div>
                              )}
                            </div>

                            <div className="rounded-full bg-[#eef1e7] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#395345]">
                              {files.length} file(s)
                            </div>
                          </div>

                          <div className="mt-4 rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e2e8da]">
                            <div className="text-xs font-black uppercase tracking-[0.14em] text-[#748175]">
                              Grade Submission
                            </div>

                            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end">
                              <div className="w-full md:max-w-[220px]">
                                <label className="text-xs font-black uppercase tracking-[0.14em] text-[#748175]">
                                  Score (0-100)
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={gradeDrafts[traineeUserId]?.score || ""}
                                  onChange={(e) =>
                                    updateGradeDraft(
                                      traineeUserId,
                                      "score",
                                      e.target.value
                                    )
                                  }
                                  className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
                                  placeholder="Enter score"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => saveSubmissionGrade(submission)}
                                disabled={gradeSavingKey === savingKey}
                                className="rounded-2xl bg-[#395345] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#2f463a] disabled:opacity-60"
                              >
                                {gradeSavingKey === savingKey
                                  ? "Saving..."
                                  : "Save Grade"}
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 space-y-4">
                            {files.length ? (
                              files.map((file, fileIndex) => {
                                const fileUrl = getAssignmentFileUrl(file);
                                const fileName =
                                  file?.originalName ||
                                  file?.filename ||
                                  `Submission File ${fileIndex + 1}`;
                                const mimeType = file?.mimetype || "";

                                return (
                                  <div
                                    key={`${file.fileId || fileName}-${fileIndex}`}
                                    className="overflow-hidden rounded-2xl border border-[#e3e9db] bg-white"
                                  >
                                    <div className="border-b border-[#e3e9db] px-4 py-4">
                                      <div className="text-sm font-black text-[#395345]">
                                        {fileIndex + 1}. {fileName}
                                      </div>

                                      <div className="mt-1 text-xs text-[#627165]">
                                        Size: {formatBytes(file?.size || 0)}
                                      </div>

                                      <div className="mt-4 flex flex-wrap gap-3">
                                        {fileUrl ? (
                                          <>
                                            <a
                                              href={fileUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="rounded-full border border-[#c8ccbf] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#395345]"
                                            >
                                              Open File
                                            </a>

                                            <a
                                              href={fileUrl}
                                              download={fileName}
                                              className="rounded-full bg-[#395345] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white"
                                            >
                                              Download
                                            </a>
                                          </>
                                        ) : null}
                                      </div>
                                    </div>

                                    {fileUrl ? (
                                      isPreviewableImage(mimeType, fileName) ? (
                                        <img
                                          src={fileUrl}
                                          alt={fileName}
                                          className="max-h-[72vh] w-full bg-white object-contain"
                                        />
                                      ) : isPreviewablePdf(mimeType, fileName) ? (
                                        <iframe
                                          title={fileName}
                                          src={fileUrl}
                                          className="h-[72vh] w-full bg-white"
                                        />
                                      ) : (
                                        <div className="p-8 text-sm text-[#627165]">
                                          This file type cannot be previewed inside
                                          the modal. Use the buttons above to open
                                          or download it.
                                        </div>
                                      )
                                    ) : (
                                      <div className="p-8 text-sm text-[#627165]">
                                        File link is not available for this item.
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3 text-sm text-[#647166]">
                                No files submitted.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => startEdit(selectedItem)}
                  className="rounded-2xl border border-[#c6ccb9] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#395345] transition hover:bg-[#f2f5ee]"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => removeItem(getAssignmentId(selectedItem))}
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </ModalShell>

      <ModalShell
        open={editOpen}
        onClose={closeEditModal}
        title="Edit Assignment"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={submitEdit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
              Assignment Title
            </label>

            <input
              type="text"
              value={editForm.title}
              onChange={(e) => updateEditForm("title", e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
              placeholder="Enter assignment title"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
              Course
            </label>

            <select
              value={editForm.course}
              onChange={(e) => updateEditForm("course", e.target.value)}
              disabled={courseOptions.length <= 1}
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345] disabled:bg-[#f7f8f3]"
            >
              {courseOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
              Total Points
            </label>

            <input
              type="number"
              value={FIXED_TOTAL_POINTS}
              readOnly
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-[#f7f8f3] px-4 py-3 text-sm font-semibold text-[#395345] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
              Upload Open Date &amp; Time
            </label>

            <input
              type="datetime-local"
              value={editForm.uploadOpenAt}
              onChange={(e) => updateEditForm("uploadOpenAt", e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
              Due Date
            </label>

            <input
              type="datetime-local"
              value={editForm.dueDate}
              onChange={(e) => updateEditForm("dueDate", e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
              Description
            </label>

            <textarea
              value={editForm.description}
              onChange={(e) => updateEditForm("description", e.target.value)}
              rows="4"
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
              placeholder="Enter assignment description"
            />
          </div>

          <div className="md:col-span-2 rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#dfe4d8]">
            <div className="text-sm font-black text-[#395345]">Current Files</div>

            <p className="mt-1 text-xs text-[#647166]">
              Keep the files you still need. Remove only the files you want to
              delete.
            </p>

            <div className="mt-4 space-y-2">
              {editExistingFiles.length ? (
                editExistingFiles.map((file, index) => {
                  const fileId = String(file.fileId || "");
                  const willBeRemoved = removedExistingFileIds.includes(fileId);

                  return (
                    <div
                      key={`${fileId || file.originalName}-${index}`}
                      className={[
                        "flex items-center justify-between rounded-xl border px-4 py-3",
                        willBeRemoved
                          ? "border-red-200 bg-red-50"
                          : "border-[#dde3d6] bg-white",
                      ].join(" ")}
                    >
                      <div className="min-w-0 pr-4">
                        <div className="truncate text-sm font-semibold text-[#395345]">
                          {index + 1}.{" "}
                          {file.originalName || file.filename || "Assignment File"}
                        </div>

                        <div className="mt-1 text-xs text-[#647166]">
                          {formatBytes(file.size || 0)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleRemoveExistingFile(fileId)}
                        className={[
                          "rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em]",
                          willBeRemoved
                            ? "border border-[#c6ccb9] bg-white text-[#395345]"
                            : "border border-red-200 bg-red-50 text-red-700",
                        ].join(" ")}
                      >
                        {willBeRemoved ? "Undo Remove" : "Remove"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-[#dde3d6] bg-white px-4 py-3 text-sm text-[#647166]">
                  No existing files.
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#dfe4d8]">
            <div className="text-sm font-black text-[#395345]">Add New Files</div>

            <p className="mt-1 text-xs text-[#647166]">
              Add replacement or additional files one at a time. Up to 5 files
              total per assignment.
            </p>

            <input
              type="file"
              onChange={handleAddEditFile}
              className="mt-4 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
            />

            {editNewFiles.length ? (
              <div className="mt-4 space-y-2">
                {editNewFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-[#dde3d6] bg-white px-4 py-3"
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
                      onClick={() => removeQueuedEditFile(index)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeEditModal}
              className="rounded-xl border border-[#c6ccb9] bg-white px-5 py-3 text-sm font-black text-[#395345]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={savingEdit}
              className="rounded-xl bg-[#395345] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingEdit ? "Updating..." : "Update Assignment"}
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}
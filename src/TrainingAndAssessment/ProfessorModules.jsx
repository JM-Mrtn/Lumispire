// src/TrainingAndAssessment/ProfessorModules.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildTrainingFileUrl } from "./trainingFileUrl";
import ProfessorLayout from "./ProfessorLayout";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const ALLOWED_MODULE_EXTENSIONS = new Set([
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

const MAX_MODULE_FILE_SIZE = 25 * 1024 * 1024;
const MAX_MODULE_FILES = 5;
const ROWS_PER_PAGE = 5;

function professorAuthHeaders(extra = {}) {
  const token = localStorage.getItem("professorToken") || "";

  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  };
}

function normalizeCourseName(value = "") {
  const raw = String(value || "").trim();
  const clean = raw.toLowerCase();

  if (clean === "event management") return "Event Management";
  if (clean === "housekeeping") return "Housekeeping";

  return raw;
}

function getProfessorUser() {
  try {
    return JSON.parse(localStorage.getItem("professorUser") || "null");
  } catch {
    return null;
  }
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

function normalizeCourseAssignments(values = []) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((item) => normalizeCourseName(item))
        .filter(Boolean)
    ),
  ];
}

function getFileExtension(name = "") {
  const idx = String(name || "").lastIndexOf(".");
  return idx >= 0 ? String(name).slice(idx).toLowerCase() : "";
}

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || "Invalid server response.");
  }
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

function getModuleId(module) {
  return module?.id || module?._id || "";
}

function getModuleFiles(module) {
  if (Array.isArray(module?.files) && module.files.length) {
    return module.files;
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
      fileId: legacyId,
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
      size: module?.fileSize || module?.size || module?.file?.size || 0,
    },
  ];
}

function ModuleModal({ open, onClose, title, children, maxWidth = "max-w-6xl" }) {
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

function DashboardStatCard({ title, value, note }) {
  return (
    <article className="group relative min-h-[118px] overflow-hidden rounded-[24px] border border-white/80 bg-white p-5 shadow-[0_16px_40px_rgba(8,39,25,0.10)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(8,39,25,0.16)]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-16 -right-14 h-40 w-40 rounded-full bg-[#f4d484]/20 blur-2xl transition duration-300 group-hover:scale-110" />
      <p className="relative text-xs font-black uppercase tracking-[0.22em] text-[#071f14]/45">{title}</p>
      <p className="relative mt-4 text-4xl font-black leading-none tracking-tight text-[#071f14]">{value}</p>
      {note ? <p className="relative mt-3 text-sm font-semibold leading-5 text-[#071f14]/55">{note}</p> : null}
    </article>
  );
}

function DashboardSection({ eyebrow, title, description, children, className = "" }) {
  return (
    <section className={`relative overflow-hidden rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 ${className}`}>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-[#f4d484]/20 blur-2xl" />
      <div className="relative">
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.24em] text-[#071f14]/45">{eyebrow}</p> : null}
        {title ? <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071f14]">{title}</h2> : null}
        {description ? <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#071f14]/55">{description}</p> : null}
        <div className={title || eyebrow || description ? "mt-5" : ""}>{children}</div>
      </div>
    </section>
  );
}

function DashboardButton({ children, onClick, disabled, variant = "primary", className = "", type = "button" }) {
  const styles =
    variant === "gold"
      ? "bg-[#f4d484] text-[#071f14] shadow-[0_14px_30px_rgba(215,168,77,0.22)] hover:bg-[#efd075]"
      : variant === "outline"
      ? "border border-[#dbe4dc] bg-white text-[#071f14]/75 hover:border-[#235f3e]/45 hover:text-[#071f14]"
      : variant === "danger"
      ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
      : "bg-[#235f3e] text-white shadow-[0_14px_30px_rgba(8,39,25,0.22)] hover:bg-[#174a30]";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 min-w-[96px] items-center justify-center rounded-full px-4 text-[11px] font-black uppercase tracking-[0.12em] transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

function validateModuleFile(file) {
  if (!file) return "No file selected.";

  const ext = getFileExtension(file.name);

  if (!ALLOWED_MODULE_EXTENSIONS.has(ext)) {
    return "Only PDF, image, DOC, DOCX, PPT, PPTX, TXT, XLS, and XLSX files are allowed.";
  }

  if (file.size > MAX_MODULE_FILE_SIZE) {
    return "Each module file must be 25MB or less.";
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
    return { files: currentFiles, error: "No file selected." };
  }

  if (currentFiles.length >= MAX_MODULE_FILES) {
    return {
      files: currentFiles,
      error: `You can upload up to ${MAX_MODULE_FILES} module files only.`,
    };
  }

  const validationError = validateModuleFile(pickedFile);

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

export default function ProfessorModules() {
  const navigate = useNavigate();
  const professor = getProfessorUser();

  const [allowedCourses, setAllowedCourses] = useState(() =>
    normalizeCourseAssignments(professor?.courseAssignments || [])
  );

  const courseOptions = useMemo(() => allowedCourses, [allowedCourses]);

  const [course, setCourse] = useState(courseOptions[0] || "");
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moduleFiles, setModuleFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [modules, setModules] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [selectedModule, setSelectedModule] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCourse, setEditCourse] = useState(courseOptions[0] || "");
  const [editExistingFiles, setEditExistingFiles] = useState([]);
  const [removedExistingFileIds, setRemovedExistingFileIds] = useState([]);
  const [editNewFiles, setEditNewFiles] = useState([]);

  const [page, setPage] = useState(1);

  const professorName = getProfessorName(professor);
  const professorEmail = professor?.email || "traineemail@tamsi.com";

  const menuItems = [
    { label: "Dashboard", path: "/professor-dashboard" },
    { label: "Manage Attendance", path: "/professor-attendance" },
    { label: "Manage Assignment", path: "/professor-assessments" },
    { label: "Manage Modules", path: "/professor-modules" },
    { label: "Manage Progress", path: "/professor-progress" },
  ];

  useEffect(() => {
    if (!course && courseOptions.length) {
      setCourse(courseOptions[0]);
    }
  }, [course, courseOptions]);

  async function loadProfessorCourses() {
    try {
      const res = await fetch(`${API_BASE}/professors/me`, {
        headers: professorAuthHeaders(),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load professor profile.");
      }

      const nextProfessor = data?.professor || null;
      const nextAllowedCourses = normalizeCourseAssignments(
        nextProfessor?.courseAssignments || []
      );

      if (nextProfessor) {
        localStorage.setItem("professorUser", JSON.stringify(nextProfessor));
      }

      setAllowedCourses(nextAllowedCourses);

      if (!course && nextAllowedCourses.length) {
        setCourse(nextAllowedCourses[0]);
      } else if (course && !nextAllowedCourses.includes(course)) {
        setCourse(nextAllowedCourses[0] || "");
      }

      return nextAllowedCourses;
    } catch {
      const fallback = normalizeCourseAssignments(
        getProfessorUser()?.courseAssignments || []
      );

      setAllowedCourses(fallback);
      return fallback;
    }
  }

  async function loadModules(selectedCourse = course) {
    try {
      if (!selectedCourse) {
        setModules([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setMsg({ type: "", text: "" });

      const res = await fetch(
        `${API_BASE}/professors/modules?course=${encodeURIComponent(
          selectedCourse
        )}`,
        {
          headers: professorAuthHeaders(),
        }
      );

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load modules.");
      }

      setModules(Array.isArray(data?.modules) ? data.modules : []);
      setMsg({ type: "", text: "" });
    } catch (error) {
      setModules([]);
      setMsg({
        type: "error",
        text: error.message || "Failed to load modules.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfessorCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (course) {
      loadModules(course);
    } else {
      setModules([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course]);

  function resetCreateForm() {
    setTitle("");
    setDescription("");
    setModuleFiles([]);

    const input = document.getElementById("professor-module-file");
    if (input) input.value = "";
  }

  function openCreateModal() {
    resetCreateForm();
    setCreateModalOpen(true);
  }

  function closeCreateModal() {
    setCreateModalOpen(false);
    resetCreateForm();
  }

  function handleAddModuleFile(event) {
    const pickedFile = event.target.files?.[0] || null;
    const result = addSingleFileToQueue(moduleFiles, pickedFile);

    if (result.error) {
      setMsg({ type: "error", text: result.error });
    } else {
      setMsg({ type: "", text: "" });
      setModuleFiles(result.files);
    }

    event.target.value = "";
  }

  function removeQueuedModuleFile(indexToRemove) {
    setModuleFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  function handleAddEditFile(event) {
    const pickedFile = event.target.files?.[0] || null;
    const keptExistingCount = editExistingFiles.filter(
      (file) => !removedExistingFileIds.includes(String(file.fileId || ""))
    ).length;

    if (keptExistingCount + editNewFiles.length >= MAX_MODULE_FILES) {
      setMsg({
        type: "error",
        text: `A module can only have up to ${MAX_MODULE_FILES} files.`,
      });
      event.target.value = "";
      return;
    }

    const result = addSingleFileToQueue(editNewFiles, pickedFile);

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

  async function uploadModule() {
    try {
      setSaving(true);
      setMsg({ type: "", text: "" });

      if (!title.trim()) throw new Error("Please enter the module title.");
      if (!course.trim()) throw new Error("Please select a course.");
      if (!moduleFiles.length) throw new Error("Please add at least 1 module file.");

      if (moduleFiles.length > MAX_MODULE_FILES) {
        throw new Error(`You can upload up to ${MAX_MODULE_FILES} module files only.`);
      }

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("course", course);

      moduleFiles.forEach((file) => {
        formData.append("moduleFiles", file);
      });

      const res = await fetch(`${API_BASE}/professors/modules`, {
        method: "POST",
        headers: professorAuthHeaders(),
        body: formData,
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Failed to upload module. Make sure there is a current active batch for this course."
        );
      }

      setMsg({
        type: "success",
        text: data?.message || "Module uploaded successfully.",
      });

      closeCreateModal();
      await loadModules(course);
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to upload module.",
      });
    } finally {
      setSaving(false);
    }
  }

  function openEditModule(module) {
    const existingFiles = getModuleFiles(module);

    setSelectedModule(module);
    setEditTitle(module?.title || "");
    setEditDescription(module?.description || "");
    setEditCourse(module?.course || courseOptions[0] || "");
    setEditExistingFiles(existingFiles);
    setRemovedExistingFileIds([]);
    setEditNewFiles([]);
    setEditing(true);
  }

  function closeModuleModal() {
    setSelectedModule(null);
    setEditing(false);
    setEditTitle("");
    setEditDescription("");
    setEditCourse(courseOptions[0] || "");
    setEditExistingFiles([]);
    setRemovedExistingFileIds([]);
    setEditNewFiles([]);
  }

  async function updateModule() {
    try {
      const moduleId = getModuleId(selectedModule);

      if (!moduleId) throw new Error("Module id is missing.");
      if (!editTitle.trim()) throw new Error("Please enter the module title.");
      if (!editCourse.trim()) throw new Error("Please select a course.");

      const keptExistingFiles = editExistingFiles.filter(
        (file) => !removedExistingFileIds.includes(String(file.fileId || ""))
      );
      const finalCount = keptExistingFiles.length + editNewFiles.length;

      if (!finalCount) {
        throw new Error("A module must have at least 1 file.");
      }

      if (finalCount > MAX_MODULE_FILES) {
        throw new Error(`A module can only have up to ${MAX_MODULE_FILES} files.`);
      }

      setUpdating(true);
      setMsg({ type: "", text: "" });

      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("description", editDescription.trim());
      formData.append("course", editCourse);
      formData.append("removedFileIds", JSON.stringify(removedExistingFileIds));

      editNewFiles.forEach((file) => {
        formData.append("moduleFiles", file);
      });

      const res = await fetch(`${API_BASE}/professors/modules/${moduleId}`, {
        method: "PUT",
        headers: professorAuthHeaders(),
        body: formData,
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Failed to update module. Make sure there is a current active batch for this course."
        );
      }

      setMsg({
        type: "success",
        text: data?.message || "Module updated successfully.",
      });

      setEditing(false);
      setEditExistingFiles([]);
      setRemovedExistingFileIds([]);
      setEditNewFiles([]);
      await loadModules(editCourse);

      if (data?.module) {
        setSelectedModule(data.module);
      }

      setCourse(editCourse);
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to update module.",
      });
    } finally {
      setUpdating(false);
    }
  }

  async function deleteModule(moduleId) {
    const ok = window.confirm("Delete this module?");

    if (!ok) return;

    try {
      setDeletingId(moduleId);
      setMsg({ type: "", text: "" });

      const res = await fetch(`${API_BASE}/professors/modules/${moduleId}`, {
        method: "DELETE",
        headers: professorAuthHeaders(),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete module. Make sure there is a current active batch for this course."
        );
      }

      setMsg({
        type: "success",
        text: data?.message || "Module deleted successfully.",
      });

      if (getModuleId(selectedModule) === moduleId) {
        closeModuleModal();
      }

      await loadModules(course);
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to delete module.",
      });
    } finally {
      setDeletingId("");
    }
  }

  const sortedModules = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return [...modules]
      .filter((module) => {
        if (!keyword) return true;

        const fileNames = getModuleFiles(module)
          .map((file) => file?.originalName || file?.filename || "")
          .join(" ");

        const haystack = [
          module?.title,
          module?.description,
          module?.course,
          fileNames,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(keyword);
      })
      .sort((a, b) => {
        const aTime = new Date(a?.createdAt || 0).getTime();
        const bTime = new Date(b?.createdAt || 0).getTime();
        return bTime - aTime;
      });
  }, [modules, search]);

  const totalPages = Math.max(1, Math.ceil(sortedModules.length / ROWS_PER_PAGE));

  const paginatedModules = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return sortedModules.slice(start, start + ROWS_PER_PAGE);
  }, [sortedModules, page]);

  useEffect(() => {
    setPage(1);
  }, [course, search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function handleLogout() {
    localStorage.removeItem("professorToken");
    localStorage.removeItem("professor");
    localStorage.removeItem("professorUser");
    localStorage.removeItem("storedProfessor");

    navigate("/professor-login");
  }

  return (
    <ProfessorLayout
      title="Manage Trainee Modules"
      subtitle="Upload, review, update, and organize learning modules for your assigned courses."
      activePage="modules"
    >
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap");

        .professor-modules-page,
        .professor-modules-page button,
        .professor-modules-page input,
        .professor-modules-page select,
        .professor-modules-page textarea {
          font-family: "Open Sans", Arial, sans-serif;
        }

        .pm-table-card {
          width: 100%;
          overflow: hidden;
          border-radius: 22px;
          border: 1px solid #dbe4dc;
          background: rgba(255,255,255,0.92);
        }

        .pm-module-grid {
          display: grid;
          grid-template-columns: minmax(260px, 1.45fr) 170px 160px 90px 110px;
          column-gap: 22px;
          align-items: center;
        }

        .pm-table-head {
          padding: 16px 22px;
          background: #f7f8f3;
          border-bottom: 1px solid #dbe4dc;
          color: rgba(7,31,20,.48);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .pm-table-row {
          min-height: 96px;
          padding: 18px 22px;
          border-bottom: 1px solid #e4ebe4;
          color: rgba(7,31,20,.72);
          font-size: 14px;
          font-weight: 700;
          transition: background .2s ease;
        }

        .pm-table-row:last-child {
          border-bottom: 0;
        }

        .pm-table-row:hover {
          background: rgba(247,248,243,.72);
        }

        .pm-action-cell {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pm-action-button {
          width: 78px !important;
          min-width: 78px !important;
          height: 34px !important;
          padding: 0 12px !important;
          border-radius: 999px !important;
          font-size: 10px !important;
          letter-spacing: .12em !important;
          box-shadow: 0 8px 18px rgba(8,39,25,.08) !important;
        }

        @media (max-width: 1023px) {
          .pm-module-grid {
            grid-template-columns: 1fr;
            row-gap: 12px;
          }

          .pm-table-head {
            display: none;
          }

          .pm-table-row {
            padding: 18px;
          }

          .pm-action-cell {
            justify-content: flex-start;
          }
        }
      `}</style>

      <div className="professor-modules-page space-y-6">
        {msg.text ? (
          <div
            className={`rounded-[22px] px-5 py-4 text-sm font-bold shadow-[0_14px_32px_rgba(8,39,25,0.08)] ring-1 ${
              msg.type === "success"
                ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                : "bg-rose-50 text-rose-800 ring-rose-200"
            }`}
          >
            {msg.text}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard title="Total Modules" value={modules.length} note="Uploaded records" />
          <DashboardStatCard title="Visible Results" value={sortedModules.length} note="After search filter" />
          <DashboardStatCard title="Assigned Courses" value={courseOptions.length} note="Professor access" />
          <DashboardStatCard
            title="Module Files"
            value={modules.reduce((total, item) => total + getModuleFiles(item).length, 0)}
            note="Attached materials"
          />
        </div>

        <DashboardSection
          eyebrow="Search Records"
          title="Module Queue"
          description="Filter by course, search module details, refresh records, or upload a new training module."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(220px,300px)_1fr_auto_auto] lg:items-end">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[#071f14]/60">Course</span>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                disabled={courseOptions.length <= 1}
                className="mt-2 h-12 w-full rounded-full border border-[#dbe4dc] bg-[#fbfcfa] px-5 text-sm font-bold text-[#071f14] outline-none transition focus:border-[#235f3e] focus:bg-white focus:shadow-[0_0_0_4px_rgba(35,95,62,0.10)] disabled:opacity-60"
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
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[#071f14]/60">Search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-2 h-12 w-full rounded-full border border-[#dbe4dc] bg-[#fbfcfa] px-5 text-sm font-bold text-[#071f14] outline-none transition placeholder:text-[#071f14]/38 focus:border-[#235f3e] focus:bg-white focus:shadow-[0_0_0_4px_rgba(35,95,62,0.10)]"
                placeholder="Search module title, description, course, or file name"
              />
            </label>

            <DashboardButton onClick={() => loadModules(course)} disabled={loading || !course}>
              {loading ? "Loading..." : "Refresh"}
            </DashboardButton>

            <DashboardButton
              variant="gold"
              onClick={openCreateModal}
              disabled={!courseOptions.length || !course}
            >
              Create Module
            </DashboardButton>
          </div>
        </DashboardSection>

        <DashboardSection
          eyebrow="Module Records"
          title="Training Modules"
          description="View learning material details, attached files, upload dates, and manage module records."
        >
          <div className="pm-table-card">
            <div className="pm-table-head pm-module-grid hidden lg:grid">
              <span>Module</span>
              <span>Uploaded</span>
              <span>Course</span>
              <span>Files</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-[#e4ebe4]">
              {loading ? (
                [1, 2, 3].map((item) => (
                  <div key={item} className="pm-table-row pm-module-grid">
                    <div className="h-5 rounded-full bg-[#e7eee8]" />
                    <div className="h-5 rounded-full bg-[#e7eee8]" />
                    <div className="h-5 rounded-full bg-[#e7eee8]" />
                    <div className="h-5 rounded-full bg-[#e7eee8]" />
                    <div className="h-9 rounded-full bg-[#e7eee8]" />
                  </div>
                ))
              ) : paginatedModules.length ? (
                paginatedModules.map((module) => {
                  const moduleId = getModuleId(module);
                  const fileCount = getModuleFiles(module).length;

                  return (
                    <div key={moduleId} className="pm-table-row pm-module-grid">
                      <div className="min-w-0">
                        <p className="break-words text-base font-black leading-6 text-[#071f14]">
                          {module.title || "Title of Module"}
                        </p>
                        <p className="mt-1 line-clamp-2 break-words text-xs font-semibold leading-5 text-[#071f14]/50">
                          {module.description || "No description provided."}
                        </p>
                      </div>

                      <div className="leading-5">
                        <span className="lg:hidden text-[11px] font-black uppercase tracking-[0.14em] text-[#071f14]/40">Uploaded: </span>
                        {formatDateTime(module.createdAt)}
                      </div>

                      <div className="break-words">
                        <span className="lg:hidden text-[11px] font-black uppercase tracking-[0.14em] text-[#071f14]/40">Course: </span>
                        {module.course || "Course"}
                      </div>

                      <div>
                        <span className="lg:hidden text-[11px] font-black uppercase tracking-[0.14em] text-[#071f14]/40">Files: </span>
                        {fileCount} file{fileCount === 1 ? "" : "s"}
                      </div>

                      <div className="pm-action-cell">
                        <DashboardButton
                          variant="outline"
                          onClick={() => setSelectedModule(module)}
                          className="pm-action-button"
                        >
                          View
                        </DashboardButton>

                        <DashboardButton
                          variant="danger"
                          onClick={() => deleteModule(moduleId)}
                          disabled={deletingId === moduleId}
                          className="pm-action-button"
                        >
                          {deletingId === moduleId ? "..." : "Remove"}
                        </DashboardButton>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-5 py-12 text-center text-sm font-bold text-[#071f14]/55">
                  No modules found for this course.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 text-sm font-bold text-[#071f14]/60 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Page {page} / {totalPages}
            </span>

            <div className="flex gap-2">
              <DashboardButton
                variant="outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
              >
                Previous
              </DashboardButton>

              <DashboardButton
                variant="outline"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
              >
                Next
              </DashboardButton>
            </div>
          </div>
        </DashboardSection>
      </div>

      <ModuleModal
        open={createModalOpen}
        onClose={closeCreateModal}
        title="Create Module"
        maxWidth="max-w-4xl"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-black text-[#395345]">
              Course
            </label>

            {courseOptions.length <= 1 ? (
              <div className="w-full rounded-2xl border border-[#d7ddd0] bg-[#f7f8f3] px-4 py-3 text-sm font-semibold text-[#395345]">
                {course || "No assigned course"}
              </div>
            ) : (
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full rounded-2xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none"
              >
                {courseOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-[#395345]">
              Module Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter module title"
              className="w-full rounded-2xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-black text-[#395345]">
              Add Module File
            </label>

            <input
              id="professor-module-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
              onChange={handleAddModuleFile}
              className="w-full rounded-2xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none"
            />

            <p className="mt-2 text-xs text-[#627165]">
              Add files one at a time. Allowed: PDF, image, DOC, DOCX, PPT,
              PPTX, TXT, XLS, XLSX. Max 25MB each. Up to 5 files only.
            </p>

            {moduleFiles.length ? (
              <div className="mt-3 space-y-2">
                {moduleFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-[#d7ddd0] bg-[#f7f8f3] px-4 py-3"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="truncate text-sm font-semibold text-[#395345]">
                        {index + 1}. {file.name}
                      </div>

                      <div className="mt-1 text-xs text-[#627165]">
                        {formatBytes(file.size)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeQueuedModuleFile(index)}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-black text-[#395345]">
              Description
            </label>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a short module description"
              className="w-full rounded-2xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={closeCreateModal}
            className="rounded-xl border border-[#c6ccb9] bg-white px-5 py-3 text-sm font-black text-[#395345]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={uploadModule}
            disabled={saving || !courseOptions.length || !course}
            className="rounded-xl bg-[#395345] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2f463a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Uploading..." : "Upload Module"}
          </button>
        </div>
      </ModuleModal>

      <ModuleModal
        open={!!selectedModule}
        onClose={closeModuleModal}
        title={editing ? "Edit Module" : selectedModule?.title || "Module Details"}
      >
        {selectedModule ? (
          <div className="space-y-6">
            {editing ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-black text-[#395345]">
                      Course
                    </label>

                    {courseOptions.length <= 1 ? (
                      <div className="w-full rounded-2xl border border-[#d7ddd0] bg-[#f7f8f3] px-4 py-3 text-sm font-semibold text-[#395345]">
                        {editCourse || "No assigned course"}
                      </div>
                    ) : (
                      <select
                        value={editCourse}
                        onChange={(e) => setEditCourse(e.target.value)}
                        className="w-full rounded-2xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none"
                      >
                        {courseOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-[#395345]">
                      Module Title
                    </label>

                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-2xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-[#395345]">
                    Description
                  </label>

                  <textarea
                    rows={5}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full rounded-2xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div className="rounded-[22px] bg-[#f7f8f3] p-5 ring-1 ring-[#e3e9db]">
                  <div className="text-sm font-black text-[#395345]">
                    Current Files
                  </div>

                  <p className="mt-1 text-xs text-[#627165]">
                    Keep the files you still want. Remove only the files you want
                    to delete.
                  </p>

                  <div className="mt-4 space-y-3">
                    {editExistingFiles.length ? (
                      editExistingFiles.map((file, index) => {
                        const fileId = String(file?.fileId || "");
                        const willBeRemoved =
                          removedExistingFileIds.includes(fileId);

                        return (
                          <div
                            key={`${fileId || file.originalName}-${index}`}
                            className={[
                              "flex items-center justify-between rounded-2xl border px-4 py-3",
                              willBeRemoved
                                ? "border-red-200 bg-red-50"
                                : "border-[#d7ddd0] bg-white",
                            ].join(" ")}
                          >
                            <div className="min-w-0 pr-4">
                              <div className="truncate text-sm font-semibold text-[#395345]">
                                {index + 1}.{" "}
                                {file.originalName ||
                                  file.filename ||
                                  "Module File"}
                              </div>

                              <div className="mt-1 text-xs text-[#627165]">
                                {formatBytes(file.size || 0)}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleRemoveExistingFile(fileId)}
                              className={[
                                "rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em]",
                                willBeRemoved
                                  ? "border border-[#cfd6c7] bg-white text-[#395345]"
                                  : "border border-red-200 bg-red-50 text-red-700",
                              ].join(" ")}
                            >
                              {willBeRemoved ? "Undo Remove" : "Remove"}
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-[#627165]">
                        No existing files.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[22px] bg-[#f7f8f3] p-5 ring-1 ring-[#e3e9db]">
                  <div className="text-sm font-black text-[#395345]">
                    Add New Files
                  </div>

                  <p className="mt-1 text-xs text-[#627165]">
                    Add replacement or additional files one at a time. Maximum of
                    5 files total per module.
                  </p>

                  <div className="mt-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                      onChange={handleAddEditFile}
                      className="w-full rounded-2xl border border-[#d7ddd0] bg-white px-4 py-3 text-sm outline-none"
                    />
                  </div>

                  {editNewFiles.length ? (
                    <div className="mt-4 space-y-3">
                      {editNewFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${file.size}-${index}`}
                          className="flex items-center justify-between rounded-2xl border border-[#d7ddd0] bg-white px-4 py-3"
                        >
                          <div className="min-w-0 pr-4">
                            <div className="truncate text-sm font-semibold text-[#395345]">
                              {index + 1}. {file.name}
                            </div>

                            <div className="mt-1 text-xs text-[#627165]">
                              {formatBytes(file.size)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeQueuedEditFile(index)}
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={updateModule}
                    disabled={updating}
                    className="rounded-full bg-[#395345] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setEditExistingFiles(getModuleFiles(selectedModule));
                      setRemovedExistingFileIds([]);
                      setEditNewFiles([]);
                    }}
                    className="rounded-full border border-[#cfd6c7] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#395345]"
                  >
                    Cancel Edit
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] bg-[#f7f8f3] p-5 ring-1 ring-[#e3e9db]">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
                      Course
                    </div>

                    <div className="mt-2 text-lg font-black text-[#395345]">
                      {selectedModule.course || "-"}
                    </div>
                  </div>

                  <div className="rounded-[22px] bg-[#f7f8f3] p-5 ring-1 ring-[#e3e9db]">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
                      Uploaded
                    </div>

                    <div className="mt-2 text-lg font-black text-[#395345]">
                      {formatDateTime(selectedModule.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] bg-[#f7f8f3] p-5 ring-1 ring-[#e3e9db]">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
                    Description
                  </div>

                  <div className="mt-2 text-sm leading-7 text-[#395345]">
                    {selectedModule.description || "No description provided."}
                  </div>
                </div>

                <div className="rounded-[22px] bg-[#f7f8f3] p-5 ring-1 ring-[#e3e9db]">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-[#6f7c71]">
                    Files
                  </div>

                  <div className="mt-4 space-y-3">
                    {getModuleFiles(selectedModule).length ? (
                      getModuleFiles(selectedModule).map((file, index) => {
                        const fileId = file?.fileId ? String(file.fileId) : "";
                        const fileName =
                          file?.originalName ||
                          file?.filename ||
                          `Module File ${index + 1}`;
                        const fileUrl = fileId ? buildTrainingFileUrl(fileId) : "";
                        const fileMime = file?.mimetype || file?.mimeType || "";
                        const canPreviewImage = isPreviewableImage(
                          fileMime,
                          fileName
                        );
                        const canPreviewPdf = isPreviewablePdf(fileMime, fileName);

                        return (
                          <div
                            key={`${fileId || fileName}-${index}`}
                            className="rounded-2xl border border-[#d7ddd0] bg-white p-4"
                          >
                            <div className="text-sm font-semibold text-[#395345]">
                              {fileName}
                            </div>

                            <div className="mt-1 text-xs text-[#627165]">
                              Size: {formatBytes(file?.size || 0)}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                              {fileUrl ? (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full border border-[#cfd6c7] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#395345]"
                                >
                                  Open File
                                </a>
                              ) : null}
                            </div>

                            {fileUrl ? (
                              <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e3e9db] bg-[#f8faf5]">
                                {canPreviewImage ? (
                                  <img
                                    src={fileUrl}
                                    alt={fileName}
                                    className="max-h-[60vh] w-full bg-white object-contain"
                                  />
                                ) : canPreviewPdf ? (
                                  <iframe
                                    title={fileName}
                                    src={fileUrl}
                                    className="h-[60vh] w-full bg-white"
                                  />
                                ) : (
                                  <div className="p-6 text-sm text-[#627165]">
                                    This file type does not support inline preview.
                                    Use{" "}
                                    <span className="font-semibold text-[#395345]">
                                      Open File
                                    </span>{" "}
                                    to view or download it.
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-[#627165]">
                        No files available for this module.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openEditModule(selectedModule)}
                      className="rounded-full border border-[#cfd6c7] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#395345]"
                    >
                      Edit Module
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteModule(getModuleId(selectedModule))}
                      disabled={deletingId === getModuleId(selectedModule)}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === getModuleId(selectedModule)
                        ? "Deleting..."
                        : "Delete Module"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </ModuleModal>
    </ProfessorLayout>
  );
}
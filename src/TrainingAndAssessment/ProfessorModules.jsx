// src/TrainingAndAssessment/ProfessorModules.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildTrainingFileUrl } from "./trainingFileUrl";

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
    <div className="min-h-screen bg-[#12391f] font-sans text-white">
      <header className="flex h-[76px] items-center bg-white px-6 shadow-sm md:px-10">
        <div className="flex items-center gap-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#2d5238] bg-white text-xs font-black text-[#2d5238]">
            LC
          </div>

          <h1 className="text-xl font-black uppercase tracking-wide text-[#2d5238] md:text-2xl">
            Training &amp; Assessment
          </h1>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-76px)] flex-col lg:flex-row">
        <aside className="flex w-full flex-col bg-[#2d5038] lg:w-[228px]">
          <div className="border-b border-white/15 px-6 py-8 text-center">
            <div className="mx-auto h-[66px] w-[66px] rounded-full border-4 border-[#b7bbb6] bg-white shadow-sm" />

            <h2 className="mt-5 text-sm font-black uppercase leading-tight">
              {professorName}
            </h2>

            <p className="mt-1 break-words text-[11px] font-semibold text-white/80">
              {professorEmail}
            </p>
          </div>

          <nav className="flex-1 py-6">
            {menuItems.map((item) => {
              const active = item.label === "Manage Modules";

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`block w-full px-9 py-4 text-left text-sm font-black uppercase transition ${
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

          <div className="px-16 pb-10">
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-black uppercase text-white transition hover:text-[#d8e0da]"
            >
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 bg-[#12391f] px-5 py-5 md:px-7 lg:px-7">
          <section className="mx-auto max-w-[856px] xl:max-w-[880px]">
            <div className="mb-7">
              <h2 className="text-2xl font-black uppercase tracking-tight md:text-[28px]">
                Manage Trainee Modules
              </h2>
              <div className="mt-1 h-1 w-full max-w-[402px] bg-white/60" />
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

            <div className="mb-8 rounded-lg bg-[#2d5038] px-4 py-4 shadow-sm">
              <div className="grid gap-5 lg:grid-cols-[240px_1fr_auto_auto] lg:items-end">
                <div>
                  <label className="text-sm font-black uppercase text-white">
                    Course
                  </label>

                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    disabled={courseOptions.length <= 1}
                    className="mt-1 h-7 w-full rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none disabled:bg-white/80"
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
                  <label className="text-sm font-black uppercase text-white">
                    Search
                  </label>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mt-1 h-7 w-full rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => loadModules(course)}
                  disabled={loading || !course}
                  className="h-7 rounded-md bg-white px-8 text-[11px] font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>

                <button
                  type="button"
                  onClick={openCreateModal}
                  disabled={!courseOptions.length || !course}
                  className="h-7 rounded-md bg-white px-8 text-[11px] font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Create Module
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-[#2d5038] shadow-sm">
              <div className="bg-white px-4 py-4">
                <h3 className="text-base font-black text-[#2d5038]">
                  Trainee Modules
                </h3>
              </div>

              <div className="min-h-[316px] divide-y divide-white/25">
                {loading ? (
                  [1, 2].map((item) => (
                    <div
                      key={item}
                      className="grid gap-4 px-2 py-4 md:grid-cols-[84px_1.3fr_1fr_1fr_92px_80px] md:items-center"
                    >
                      <div className="h-10 w-10 rounded-full bg-white" />
                      <div className="h-4 rounded-full bg-white/35" />
                      <div className="h-4 rounded-full bg-white/35" />
                      <div className="h-4 rounded-full bg-white/35" />
                      <div className="h-5 rounded-full bg-[#bdf0a4]" />
                      <div className="h-5 rounded-full bg-white" />
                    </div>
                  ))
                ) : paginatedModules.length ? (
                  paginatedModules.map((module) => (
                    <div
                      key={getModuleId(module)}
                      className="grid gap-4 px-2 py-4 text-sm font-black md:grid-cols-[84px_1.3fr_1fr_1fr_92px_80px] md:items-center"
                    >
                      <div className="h-10 w-10 rounded-full bg-white" />

                      <div className="text-white">
                        {module.title || "Title of Module"}
                      </div>

                      <div className="text-white/90">
                        {formatDateTime(module.createdAt)}
                      </div>

                      <div className="text-white/90">{module.course || "Course"}</div>

                      <button
                        type="button"
                        onClick={() => deleteModule(getModuleId(module))}
                        disabled={deletingId === getModuleId(module)}
                        className="inline-flex min-w-[72px] justify-center rounded-full bg-[#bdf0a4] px-3 py-1 text-[10px] font-black text-[#2d5038] transition hover:bg-[#a9e790] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === getModuleId(module) ? "..." : "Remove"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedModule(module)}
                        className="inline-flex min-w-[72px] justify-center rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#2d5038] transition hover:bg-[#eef1e7]"
                      >
                        View
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-12 text-center text-sm font-bold text-white/80">
                    No modules found for this course.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-base font-bold">
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
    </div>
  );
}
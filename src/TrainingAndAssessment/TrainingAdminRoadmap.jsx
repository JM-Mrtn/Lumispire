import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TrainingAdminLayout from "./TrainingAdminLayout";

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

function getAdminToken() {
  return localStorage.getItem("trainingAdminToken") || "";
}

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || "Invalid server response.");
  }
}

function clean(value = "") {
  return String(value ?? "").trim();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function toLines(values = []) {
  return safeArray(values).join("\n");
}

function fromLines(value = "") {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toCodePrefix(courseName = "Course") {
  return (
    String(courseName || "Course")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 16) || "COURSE"
  );
}

function newQuestion(label = "this competency") {
  const competency = clean(label) || "this competency";

  return {
    prompt: `What is the main purpose of ${competency}?`,
    options: [
      "To build the required skill correctly",
      "To skip practical activities",
      "To ignore workplace standards",
      "To avoid professor checking",
    ],
    answer: "To build the required skill correctly",
    explanation:
      "This question checks the trainee's understanding of the competency.",
    keywords: [],
  };
}

function newCompetency(groupIndex = 0, itemIndex = 0, courseName = "Course") {
  const codePrefix = toCodePrefix(courseName);
  const code = `${codePrefix}-${String(groupIndex + 1).padStart(
    2,
    "0"
  )}-${String(itemIndex + 1).padStart(2, "0")}`;

  return {
    code,
    label: "New competency",
    description: "",
    studyPoints: [
      "Understand the purpose of this competency.",
      "Practice the correct procedure with guidance.",
      "Prepare to demonstrate this skill during professor checking.",
    ],
    studyModuleOverview:
      "Write the full overview that the trainee should study before taking the exam.",
    learningObjectives: [
      "Understand the competency.",
      "Apply the skill correctly.",
      "Prepare for the exam and professor checking.",
    ],
    lessonDiscussion: [
      "Explain the lesson here. Add clear details, examples, and reminders that help the trainee study accurately.",
    ],
    stepByStepProcedure: [
      "Read the module.",
      "Review the lesson points.",
      "Practice the competency.",
      "Take the exam.",
    ],
    workplaceScenario:
      "Describe a realistic workplace or training scenario where this competency is applied.",
    practiceActivity:
      "Write or perform a short activity that helps the trainee practice this competency.",
    keyTerms: ["Competency", "Skill", "Training", "Assessment"],
    readinessChecklist: [
      "I reviewed the module.",
      "I understand the lesson.",
      "I am ready for the exam.",
    ],
    examQuestions: [newQuestion("this competency")],
    sequence: itemIndex + 1,
    active: true,
  };
}

function newGroup(groupIndex = 0, courseName = "Course") {
  return {
    title: `Competency Group ${groupIndex + 1}`,
    sequence: groupIndex + 1,
    items: [newCompetency(groupIndex, 0, courseName)],
  };
}

function normalizeQuestion(question = {}, label = "this competency") {
  const fallback = newQuestion(label);

  return {
    ...fallback,
    ...question,
    prompt: clean(question.prompt) || fallback.prompt,
    options: safeArray(question.options).length
      ? safeArray(question.options)
      : fallback.options,
    answer: clean(question.answer || question.correctAnswer) || fallback.answer,
    explanation: clean(question.explanation) || fallback.explanation,
    keywords: safeArray(question.keywords),
  };
}

function normalizeItem(
  item = {},
  groupIndex = 0,
  itemIndex = 0,
  courseName = "Course"
) {
  const fallback = newCompetency(groupIndex, itemIndex, courseName);
  const label = clean(item.label) || fallback.label;

  return {
    ...fallback,
    ...item,
    code: clean(item.code) || fallback.code,
    label,
    description: clean(item.description),
    studyPoints: safeArray(item.studyPoints),
    studyModuleOverview:
      clean(item.studyModuleOverview || item.overview) ||
      fallback.studyModuleOverview,
    learningObjectives: safeArray(item.learningObjectives),
    lessonDiscussion: safeArray(item.lessonDiscussion),
    stepByStepProcedure: safeArray(item.stepByStepProcedure),
    workplaceScenario: clean(item.workplaceScenario),
    practiceActivity: clean(item.practiceActivity),
    keyTerms: safeArray(item.keyTerms),
    readinessChecklist: safeArray(item.readinessChecklist),
    examQuestions: safeArray(item.examQuestions).map((question) =>
      normalizeQuestion(question, label)
    ),
    sequence: Number(item.sequence || itemIndex + 1),
    active: item.active !== false,
  };
}

function normalizeGroup(group = {}, groupIndex = 0, courseName = "Course") {
  const items = safeArray(group.items).map((item, itemIndex) =>
    normalizeItem(item, groupIndex, itemIndex, courseName)
  );

  return {
    title: clean(group.title) || `Competency Group ${groupIndex + 1}`,
    sequence: Number(group.sequence || groupIndex + 1),
    items,
  };
}

function normalizeRoadmapPayload(roadmap, courseName = "Course") {
  return {
    // Attendance/certificate-template settings are intentionally hidden from the admin
    // competency screen. Progress is based only on competencies + pre-test.
    requiredOnlineClasses: 0,
    requiredFaceToFaceClasses: 0,
    onlineAttendanceBasis: "verified_professor_attendance",
    faceToFaceAttendanceBasis: "none",
    certificatePreviewImage: "",
    progressWeights: {
      online: 0,
      faceToFace: 0,
      competencies: Number(roadmap?.progressWeights?.competencies ?? 70),
      pretest: Number(roadmap?.progressWeights?.pretest ?? 30),
    },
    competencyGroups: safeArray(roadmap?.competencyGroups).map(
      (group, groupIndex) => normalizeGroup(group, groupIndex, courseName)
    ),
  };
}

function buildSavePayload(roadmap) {
  return {
    ...roadmap,
    requiredOnlineClasses: 0,
    requiredFaceToFaceClasses: 0,
    onlineAttendanceBasis: "verified_professor_attendance",
    faceToFaceAttendanceBasis: "none",
    certificatePreviewImage: "",
    progressWeights: {
      online: 0,
      faceToFace: 0,
      competencies: Number(roadmap?.progressWeights?.competencies ?? 70),
      pretest: Number(roadmap?.progressWeights?.pretest ?? 30),
    },
  };
}

function countCompetencies(groups = []) {
  return safeArray(groups).reduce(
    (sum, group) => sum + safeArray(group.items).length,
    0
  );
}

function flattenCompetencyRefs(groups = []) {
  return safeArray(groups).flatMap((group, groupIndex) =>
    safeArray(group.items).map((item, itemIndex) => ({
      groupIndex,
      itemIndex,
      group,
      item,
    }))
  );
}

function Field({ label, children, hint = "" }) {
  return (
    <label className="block text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#235f3e]">
      {label}
      {children}
      {hint ? (
        <p className="mt-2 text-xs font-semibold normal-case tracking-normal text-[#071f14]/55">{hint}</p>
      ) : null}
    </label>
  );
}

function inputClass(extra = "") {
  return `mt-2 w-full rounded-[18px] border border-[#dfe5dd] bg-white/95 px-4 py-3 text-sm font-normal leading-relaxed text-[#1f2d27] outline-none shadow-sm transition focus:border-[#235f3e] focus:ring-4 focus:ring-[#235f3e]/10 ${extra}`;
}

export default function TrainingAdminRoadmap() {
  const navigate = useNavigate();
  const adminToken = getAdminToken();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [roadmap, setRoadmap] = useState(normalizeRoadmapPayload(null));
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [activeEditorTab, setActiveEditorTab] = useState("study");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const authHeaders = (extra = {}) => ({
    ...extra,
    Authorization: `Bearer ${adminToken}`,
  });

  const activeCourses = useMemo(
    () => courses.filter((course) => course.active !== false),
    [courses]
  );

  const selectedCourse = useMemo(
    () =>
      courses.find((course) => String(course._id) === String(selectedCourseId)) ||
      null,
    [courses, selectedCourseId]
  );

  const competencyRefs = useMemo(
    () => flattenCompetencyRefs(roadmap.competencyGroups),
    [roadmap.competencyGroups]
  );

  const currentGroup = roadmap.competencyGroups?.[selectedGroupIndex] || null;
  const currentItem = currentGroup?.items?.[selectedItemIndex] || null;

  const currentFlatIndex = competencyRefs.findIndex(
    (ref) =>
      ref.groupIndex === selectedGroupIndex &&
      ref.itemIndex === selectedItemIndex
  );

  async function loadCourses() {
    const res = await fetch(`${API_BASE}/admin/courses`, {
      headers: authHeaders(),
    });
    const data = await readJsonSafe(res);

    if (!res.ok) throw new Error(data?.message || "Failed to load courses.");

    const list = Array.isArray(data?.courses) ? data.courses : [];
    setCourses(list);
    setSelectedCourseId((current) => current || list[0]?._id || "");
  }

  async function loadRoadmap(courseId) {
    if (!courseId) return;

    try {
      setLoadingRoadmap(true);
      setMsg({ type: "", text: "" });

      const course = courses.find((row) => String(row._id) === String(courseId));

      const res = await fetch(`${API_BASE}/admin/roadmap/${courseId}`, {
        headers: authHeaders(),
      });
      const data = await readJsonSafe(res);

      if (!res.ok) throw new Error(data?.message || "Failed to load roadmap.");

      setRoadmap(
        normalizeRoadmapPayload(data?.roadmap || null, course?.name || "Course")
      );
      setSelectedGroupIndex(0);
      setSelectedItemIndex(0);
      setActiveEditorTab("study");
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to load roadmap.",
      });
    } finally {
      setLoadingRoadmap(false);
    }
  }

  useEffect(() => {
    if (!adminToken) {
      navigate("/training-admin-login", { replace: true });
      return;
    }

    (async () => {
      try {
        setLoadingCourses(true);
        await loadCourses();
      } catch (error) {
        setMsg({
          type: "error",
          text: error.message || "Failed to load courses.",
        });
      } finally {
        setLoadingCourses(false);
      }
    })();
  }, [adminToken, navigate]);

  useEffect(() => {
    if (selectedCourseId) loadRoadmap(selectedCourseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  useEffect(() => {
    const groups = roadmap.competencyGroups || [];

    if (!groups.length) {
      setSelectedGroupIndex(0);
      setSelectedItemIndex(0);
      return;
    }

    if (selectedGroupIndex > groups.length - 1) {
      setSelectedGroupIndex(groups.length - 1);
      setSelectedItemIndex(0);
      return;
    }

    const items = groups[selectedGroupIndex]?.items || [];

    if (!items.length) {
      setSelectedItemIndex(0);
      return;
    }

    if (selectedItemIndex > items.length - 1) {
      setSelectedItemIndex(items.length - 1);
    }
  }, [roadmap.competencyGroups, selectedGroupIndex, selectedItemIndex]);

  function updateWeight(name, value) {
    setRoadmap((prev) => ({
      ...prev,
      progressWeights: {
        ...prev.progressWeights,
        [name]: Number(value || 0),
      },
    }));
  }

  function updateGroup(groupIndex, patch) {
    setRoadmap((prev) => ({
      ...prev,
      competencyGroups: prev.competencyGroups.map((group, index) =>
        index === groupIndex ? { ...group, ...patch } : group
      ),
    }));
  }

  function addGroup() {
    setRoadmap((prev) => {
      const nextGroup = newGroup(
        prev.competencyGroups.length,
        selectedCourse?.name || "Course"
      );
      const nextGroups = [...prev.competencyGroups, nextGroup];

      setSelectedGroupIndex(nextGroups.length - 1);
      setSelectedItemIndex(0);
      setActiveEditorTab("study");

      return {
        ...prev,
        competencyGroups: nextGroups,
      };
    });
  }

  function deleteGroup(groupIndex) {
    if (
      !window.confirm(
        "Delete this competency group and all competencies inside it?"
      )
    ) {
      return;
    }

    setRoadmap((prev) => {
      const nextGroups = prev.competencyGroups.filter(
        (_, index) => index !== groupIndex
      );

      setSelectedGroupIndex(Math.max(0, Math.min(groupIndex, nextGroups.length - 1)));
      setSelectedItemIndex(0);
      setActiveEditorTab("study");

      return {
        ...prev,
        competencyGroups: nextGroups,
      };
    });
  }

  function updateCompetency(groupIndex, itemIndex, patch) {
    setRoadmap((prev) => ({
      ...prev,
      competencyGroups: prev.competencyGroups.map(
        (group, currentGroupIndex) => {
          if (currentGroupIndex !== groupIndex) return group;

          return {
            ...group,
            items: (group.items || []).map((item, currentItemIndex) =>
              currentItemIndex === itemIndex ? { ...item, ...patch } : item
            ),
          };
        }
      ),
    }));
  }

  function addCompetency(groupIndex = selectedGroupIndex) {
    setRoadmap((prev) => ({
      ...prev,
      competencyGroups: prev.competencyGroups.map(
        (group, currentGroupIndex) => {
          if (currentGroupIndex !== groupIndex) return group;

          const nextItems = group.items || [];
          const nextItem = newCompetency(
            groupIndex,
            nextItems.length,
            selectedCourse?.name || "Course"
          );

          setSelectedGroupIndex(groupIndex);
          setSelectedItemIndex(nextItems.length);
          setActiveEditorTab("study");

          return {
            ...group,
            items: [...nextItems, nextItem],
          };
        }
      ),
    }));
  }

  function deleteCompetency(
    groupIndex = selectedGroupIndex,
    itemIndex = selectedItemIndex
  ) {
    if (!window.confirm("Delete this competency?")) return;

    setRoadmap((prev) => ({
      ...prev,
      competencyGroups: prev.competencyGroups.map(
        (group, currentGroupIndex) => {
          if (currentGroupIndex !== groupIndex) return group;

          const nextItems = (group.items || []).filter(
            (_, currentItemIndex) => currentItemIndex !== itemIndex
          );

          setSelectedItemIndex(
            Math.max(0, Math.min(itemIndex, nextItems.length - 1))
          );
          setActiveEditorTab("study");

          return {
            ...group,
            items: nextItems,
          };
        }
      ),
    }));
  }

  function updateQuestion(groupIndex, itemIndex, questionIndex, patch) {
    setRoadmap((prev) => ({
      ...prev,
      competencyGroups: prev.competencyGroups.map(
        (group, currentGroupIndex) => {
          if (currentGroupIndex !== groupIndex) return group;

          return {
            ...group,
            items: (group.items || []).map((item, currentItemIndex) => {
              if (currentItemIndex !== itemIndex) return item;

              return {
                ...item,
                examQuestions: (item.examQuestions || []).map(
                  (question, currentQuestionIndex) =>
                    currentQuestionIndex === questionIndex
                      ? { ...question, ...patch }
                      : question
                ),
              };
            }),
          };
        }
      ),
    }));
  }

  function addQuestion(groupIndex = selectedGroupIndex, itemIndex = selectedItemIndex) {
    const item = roadmap.competencyGroups?.[groupIndex]?.items?.[itemIndex];

    setRoadmap((prev) => ({
      ...prev,
      competencyGroups: prev.competencyGroups.map(
        (group, currentGroupIndex) => {
          if (currentGroupIndex !== groupIndex) return group;

          return {
            ...group,
            items: (group.items || []).map((row, currentItemIndex) => {
              if (currentItemIndex !== itemIndex) return row;

              return {
                ...row,
                examQuestions: [
                  ...(row.examQuestions || []),
                  newQuestion(item?.label || "this competency"),
                ],
              };
            }),
          };
        }
      ),
    }));
  }

  function deleteQuestion(groupIndex, itemIndex, questionIndex) {
    setRoadmap((prev) => ({
      ...prev,
      competencyGroups: prev.competencyGroups.map(
        (group, currentGroupIndex) => {
          if (currentGroupIndex !== groupIndex) return group;

          return {
            ...group,
            items: (group.items || []).map((item, currentItemIndex) => {
              if (currentItemIndex !== itemIndex) return item;

              return {
                ...item,
                examQuestions: (item.examQuestions || []).filter(
                  (_, currentQuestionIndex) => currentQuestionIndex !== questionIndex
                ),
              };
            }),
          };
        }
      ),
    }));
  }

  function goToFlatIndex(nextIndex) {
    const safeIndex = Math.max(0, Math.min(nextIndex, competencyRefs.length - 1));
    const target = competencyRefs[safeIndex];

    if (!target) return;

    setSelectedGroupIndex(target.groupIndex);
    setSelectedItemIndex(target.itemIndex);
    setActiveEditorTab("study");
  }

  async function saveRoadmap() {
    if (!selectedCourseId) return;

    try {
      setSaving(true);
      setMsg({ type: "", text: "" });

      const payload = buildSavePayload(roadmap);

      const res = await fetch(`${API_BASE}/admin/roadmap/${selectedCourseId}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      const data = await readJsonSafe(res);

      if (!res.ok) throw new Error(data?.message || "Failed to save roadmap.");

      setRoadmap(
        normalizeRoadmapPayload(data?.roadmap || payload, selectedCourse?.name)
      );
      setMsg({
        type: "success",
        text: data?.message || "Roadmap saved successfully.",
      });
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to save roadmap.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function resetRoadmap() {
    if (!selectedCourseId || !window.confirm("Reset this course roadmap to default?")) {
      return;
    }

    try {
      setSaving(true);
      setMsg({ type: "", text: "" });

      const res = await fetch(`${API_BASE}/admin/roadmap/${selectedCourseId}/reset`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await readJsonSafe(res);

      if (!res.ok) throw new Error(data?.message || "Failed to reset roadmap.");

      setRoadmap(normalizeRoadmapPayload(data?.roadmap || null, selectedCourse?.name));
      setSelectedGroupIndex(0);
      setSelectedItemIndex(0);
      setActiveEditorTab("study");
      setMsg({
        type: "success",
        text: data?.message || "Roadmap reset successfully.",
      });
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to reset roadmap.",
      });
    } finally {
      setSaving(false);
    }
  }

  const totalCompetencies = countCompetencies(roadmap.competencyGroups);

  return (
    <TrainingAdminLayout
      active="competencies"
      title="Manage Training Competencies"
      subtitle="Configure competency groups, study content, and exam questions for each course."
      maxWidth="max-w-7xl"
    >
      <div className="ta-roadmap-compact-buttons">
        <style>{`
          @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap");

          .ta-roadmap-compact-buttons,
          .ta-roadmap-compact-buttons * {
            font-family: "Open Sans", Arial, Helvetica, sans-serif !important;
          }

          .ta-roadmap-compact-buttons p,
          .ta-roadmap-compact-buttons span,
          .ta-roadmap-compact-buttons input,
          .ta-roadmap-compact-buttons select,
          .ta-roadmap-compact-buttons textarea {
            letter-spacing: 0 !important;
          }

          .ta-roadmap-compact-buttons textarea {
            font-family: "Open Sans", Arial, Helvetica, sans-serif !important;
            font-weight: 400 !important;
            line-height: 1.65 !important;
            letter-spacing: 0 !important;
            color: #1f2d27 !important;
            resize: vertical;
          }

          .ta-roadmap-compact-buttons input,
          .ta-roadmap-compact-buttons select {
            font-family: "Open Sans", Arial, Helvetica, sans-serif !important;
            font-weight: 600 !important;
            letter-spacing: 0 !important;
          }

          .ta-roadmap-compact-buttons button {
            min-height: 36px !important;
            padding: 0 14px !important;
            border-radius: 999px !important;
            font-size: 12px !important;
            line-height: 1 !important;
            font-weight: 800 !important;
            letter-spacing: 0.02em !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            white-space: nowrap !important;
            box-shadow: 0 8px 18px rgba(8, 39, 25, 0.10) !important;
          }

          .ta-roadmap-compact-buttons label {
            font-family: "Open Sans", Arial, Helvetica, sans-serif !important;
            letter-spacing: 0.08em !important;
            font-weight: 700 !important;
          }

          .ta-roadmap-compact-buttons button:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          .ta-roadmap-compact-buttons button:disabled {
            cursor: not-allowed;
            opacity: 0.55 !important;
            transform: none !important;
          }

          .ta-roadmap-compact-buttons button.w-full {
            width: 100% !important;
          }

          .ta-roadmap-compact-buttons .roadmap-button-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
          }

          .ta-roadmap-compact-buttons {
            font-family: "Open Sans", Arial, Helvetica, sans-serif;
          }

          .ta-roadmap-competency-grid {
            display: grid;
            grid-template-columns: minmax(360px, 390px) minmax(0, 1fr);
            gap: 22px;
            align-items: start;
          }

          .ta-roadmap-group-list {
            width: 100%;
            min-width: 0;
          }

          .ta-competency-group-card {
            width: 100%;
            min-width: 0;
            overflow: hidden;
            border-radius: 22px;
            background: rgba(255, 255, 255, 0.97);
            padding: 16px;
            box-shadow: 0 12px 30px rgba(8, 39, 25, 0.08);
            border: 1px solid #dfe5dd;
          }

          .ta-group-title-button {
            max-width: 100%;
            min-width: 0;
            min-height: 34px !important;
            padding: 8px 13px !important;
            border-radius: 999px !important;
            background: #ffffff !important;
            text-align: left !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
            word-break: normal !important;
            box-shadow: 0 8px 18px rgba(8, 39, 25, 0.06) !important;
            font-family: "Open Sans", Arial, Helvetica, sans-serif !important;
            font-size: 12px !important;
            line-height: 1.25 !important;
          }

          .ta-roadmap-compact-buttons .ta-competency-item-btn {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            min-height: 60px !important;
            padding: 11px 13px !important;
            border-radius: 16px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            justify-content: center !important;
            gap: 5px !important;
            text-align: left !important;
            white-space: normal !important;
            overflow: hidden !important;
            box-shadow: 0 8px 20px rgba(8, 39, 25, 0.07) !important;
          }

          .ta-roadmap-compact-buttons .ta-competency-code {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            overflow: visible !important;
            text-overflow: clip !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
            font-family: "Open Sans", Arial, Helvetica, sans-serif !important;
            font-size: 11px !important;
            line-height: 1.25 !important;
            font-weight: 800 !important;
            letter-spacing: 0.02em !important;
          }

          .ta-roadmap-compact-buttons .ta-competency-label {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            margin-top: 0 !important;
            overflow: visible !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
            word-break: normal !important;
            font-family: "Open Sans", Arial, Helvetica, sans-serif !important;
            font-size: 12px !important;
            line-height: 1.35 !important;
            font-weight: 700 !important;
            letter-spacing: 0 !important;
          }

          .ta-group-action-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .ta-group-action-row button {
            min-height: 34px !important;
            padding: 0 12px !important;
            font-size: 11px !important;
          }

          .ta-editor-panel {
            min-width: 0;
          }

          .ta-roadmap-compact-buttons input,
          .ta-roadmap-compact-buttons select,
          .ta-roadmap-compact-buttons textarea {
            font-family: "Open Sans", Arial, Helvetica, sans-serif;
          }

          @media (max-width: 1024px) {
            .ta-roadmap-competency-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 640px) {
            .ta-roadmap-compact-buttons button {
              width: 100%;
              min-height: 36px !important;
            }

            .ta-roadmap-compact-buttons .ta-competency-item-btn {
              min-height: 64px !important;
              gap: 5px !important;
            }

            .ta-roadmap-compact-buttons .ta-competency-code {
              white-space: normal !important;
              overflow: visible !important;
              text-overflow: clip !important;
            }

            .ta-group-action-row {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

      <section className="overflow-hidden rounded-[28px] border-t-4 border-[#d7a84d] bg-white/95 p-6 shadow-[0_18px_45px_rgba(8,39,25,.12)] ring-1 ring-black/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9aa0a6]">
              Course Competency CRUD
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">
              Competency Roadmap Manager
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#071f14]/60">
              Manage the roadmap one competency at a time. Each competency has
              its own study module, study points, checklist, and exam questions
              for trainees.
            </p>
          </div>

          <div className="roadmap-button-row flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => loadRoadmap(selectedCourseId)}
              disabled={!selectedCourseId || loadingRoadmap}
              className="rounded-full border border-[#dfe5dd] bg-white px-5 py-3 text-sm font-extrabold text-[#071f14] shadow-sm disabled:opacity-60"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={saveRoadmap}
              disabled={!selectedCourseId || saving || loadingRoadmap}
              className="rounded-full bg-[#235f3e] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_14px_30px_rgba(35,95,62,.22)] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Roadmap"}
            </button>
          </div>
        </div>

        {msg.text ? (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm font-semibold ${
              msg.type === "success"
                ? "bg-green-50 text-green-800 ring-1 ring-green-200"
                : "bg-red-50 text-red-800 ring-1 ring-red-200"
            }`}
          >
            {msg.text}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-[#dfe5dd]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9aa0a6]">Active Courses</p>
            <p className="mt-3 text-4xl font-extrabold text-[#071f14]">{activeCourses.length}</p>
            <p className="mt-1 text-sm font-semibold text-[#071f14]/55">Available for roadmap setup</p>
          </div>
          <div className="rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-[#dfe5dd]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9aa0a6]">Groups</p>
            <p className="mt-3 text-4xl font-extrabold text-[#071f14]">{roadmap.competencyGroups.length}</p>
            <p className="mt-1 text-sm font-semibold text-[#071f14]/55">Competency groups</p>
          </div>
          <div className="rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-[#dfe5dd]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9aa0a6]">Competencies</p>
            <p className="mt-3 text-4xl font-extrabold text-[#071f14]">{totalCompetencies}</p>
            <p className="mt-1 text-sm font-semibold text-[#071f14]/55">Editable study modules</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-[#dfe5dd]">
            <Field label="Select Course">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={loadingCourses}
                className={inputClass("font-semibold")}
              >
                {activeCourses.length ? (
                  activeCourses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))
                ) : (
                  <option value="">No active course</option>
                )}
              </select>
            </Field>

            <div className="mt-5 grid gap-3 rounded-2xl bg-[#f8fbf9] p-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9aa0a6]">
                  Selected Course
                </p>
                <p className="mt-1 text-lg font-extrabold">
                  {selectedCourse?.name || "No course selected"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#9aa0a6]">
                <div className="rounded-[18px] bg-white p-4 shadow-sm ring-1 ring-[#dfe5dd]">
                  <p>Groups</p>
                  <p className="mt-1 text-xl text-[#235f3e]">
                    {roadmap.competencyGroups.length}
                  </p>
                </div>

                <div className="rounded-[18px] bg-white p-4 shadow-sm ring-1 ring-[#dfe5dd]">
                  <p>Competencies</p>
                  <p className="mt-1 text-xl text-[#235f3e]">
                    {totalCompetencies}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={resetRoadmap}
              disabled={!selectedCourseId || saving}
              className="mt-4 w-full rounded-full border border-[#f0c36a] bg-[#fff7df] px-4 py-3 text-sm font-extrabold text-[#8a5a00] disabled:opacity-60"
            >
              Reset to Default
            </button>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-[#dfe5dd]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold">Progress Weights</h2>
                <p className="mt-1 text-sm text-[#071f14]/60">
                  Progress is now based only on competency completion and
                  pre-test completion. Attendance and certificate preview fields
                  were removed from this admin screen.
                </p>
              </div>

              <button
                type="button"
                onClick={addGroup}
                className="rounded-full bg-[#235f3e] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_14px_30px_rgba(35,95,62,.22)]"
              >
                Add Group
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["competencies", "Competencies %"],
                ["pretest", "Pre-test %"],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={roadmap.progressWeights[key]}
                    onChange={(e) => updateWeight(key, e.target.value)}
                    className={inputClass()}
                  />
                </Field>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[28px] border-t-4 border-[#d7a84d] bg-white/95 p-6 shadow-[0_18px_45px_rgba(8,39,25,.12)] ring-1 ring-black/5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Per-Competency Editor</h2>
            <p className="mt-1 text-sm text-[#071f14]/60">
              Select a competency on the left, then edit only that competency on
              the right.
            </p>
          </div>

          <div className="roadmap-button-row flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => goToFlatIndex(currentFlatIndex - 1)}
              disabled={currentFlatIndex <= 0}
              className="rounded-full border border-[#dfe5dd] bg-white px-4 py-2.5 text-sm font-extrabold text-[#071f14] shadow-sm disabled:opacity-50"
            >
              Previous Competency
            </button>
            <button
              type="button"
              onClick={() => goToFlatIndex(currentFlatIndex + 1)}
              disabled={
                currentFlatIndex < 0 ||
                currentFlatIndex >= competencyRefs.length - 1
              }
              className="rounded-full bg-[#235f3e] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(35,95,62,.22)] disabled:opacity-50"
            >
              Next Competency
            </button>
          </div>
        </div>

        {loadingRoadmap ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-center text-sm font-semibold text-[#071f14]/60">
            Loading roadmap...
          </div>
        ) : roadmap.competencyGroups.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-center">
            <p className="text-sm font-semibold text-[#071f14]/60">
              No competency groups yet. Click Add Group.
            </p>
            <button
              type="button"
              onClick={addGroup}
              className="mt-4 rounded-full bg-[#235f3e] px-5 py-3 text-sm font-extrabold text-white shadow-sm"
            >
              Add First Group
            </button>
          </div>
        ) : (
          <div className="ta-roadmap-competency-grid mt-6">
            <aside className="ta-roadmap-group-list space-y-4 lg:sticky lg:top-28 lg:self-start">
              {roadmap.competencyGroups.map((group, groupIndex) => {
                const isGroupSelected = groupIndex === selectedGroupIndex;

                return (
                  <div
                    key={`${group.title}-${groupIndex}`}
                    className="ta-competency-group-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGroupIndex(groupIndex);
                          setSelectedItemIndex(0);
                        }}
                        className={`ta-group-title-button text-left text-sm font-extrabold ${
                          isGroupSelected ? "text-[#235f3e]" : "text-[#071f14]/60"
                        }`}
                      >
                        {group.title || `Group ${groupIndex + 1}`}
                      </button>

                      <span className="rounded-full bg-[#f8fbf9] px-3 py-1 text-xs font-bold text-[#071f14]/60">
                        {safeArray(group.items).length}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {safeArray(group.items).length ? (
                        group.items.map((item, itemIndex) => {
                          const active =
                            selectedGroupIndex === groupIndex &&
                            selectedItemIndex === itemIndex;

                          return (
                            <button
                              key={`${item.code}-${itemIndex}`}
                              type="button"
                              onClick={() => {
                                setSelectedGroupIndex(groupIndex);
                                setSelectedItemIndex(itemIndex);
                                setActiveEditorTab("study");
                              }}
                              className={`ta-competency-item-btn w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                                active
                                  ? "bg-[#235f3e] text-white"
                                  : "bg-[#f8fbf9] text-[#235f3e] hover:bg-[#f8fbf9]"
                              }`}
                            >
                              <span className="ta-competency-code block text-xs font-bold uppercase tracking-[0.12em] opacity-80">
                                {item.code || "No Code"}
                              </span>
                              <span className="ta-competency-label mt-1 block font-bold">
                                {item.label || "Untitled competency"}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="rounded-xl bg-[#f8fbf9] p-3 text-sm font-semibold text-[#071f14]/60">
                          No competencies in this group.
                        </p>
                      )}
                    </div>

                    <div className="ta-group-action-row mt-3">
                      <button
                        type="button"
                        onClick={() => addCompetency(groupIndex)}
                        className="rounded-xl border border-[#dfe5dd] px-3 py-2 text-xs font-bold"
                      >
                        Add Skill
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGroup(groupIndex)}
                        className="rounded-full bg-[#fff7df] px-3 py-2 text-xs font-extrabold text-[#8a5a00] ring-1 ring-[#f0c36a]"
                      >
                        Delete Group
                      </button>
                    </div>
                  </div>
                );
              })}
            </aside>

            <div className="ta-editor-panel rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#dfe5dd]">
              {!currentGroup ? (
                <div className="rounded-2xl bg-[#f8fbf9] p-6 text-center text-sm font-semibold text-[#071f14]/60">
                  Select or add a competency group.
                </div>
              ) : !currentItem ? (
                <div className="rounded-2xl bg-[#f8fbf9] p-6 text-center">
                  <p className="text-sm font-semibold text-[#071f14]/60">
                    This group has no competencies yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => addCompetency(selectedGroupIndex)}
                    className="mt-4 rounded-full bg-[#235f3e] px-5 py-3 text-sm font-extrabold text-white shadow-sm"
                  >
                    Add Competency
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9aa0a6]">
                        Competency {currentFlatIndex + 1} of{" "}
                        {competencyRefs.length}
                      </p>
                      <h3 className="mt-2 text-2xl font-extrabold">
                        {currentItem.label || "Untitled competency"}
                      </h3>
                      <p className="mt-1 text-sm text-[#071f14]/60">
                        Group:{" "}
                        {currentGroup.title || `Group ${selectedGroupIndex + 1}`}
                      </p>
                    </div>

                    <div className="roadmap-button-row flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => addCompetency(selectedGroupIndex)}
                        className="rounded-xl border border-[#dfe5dd] px-4 py-3 text-sm font-bold"
                      >
                        Add Competency Here
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          deleteCompetency(selectedGroupIndex, selectedItemIndex)
                        }
                        className="rounded-full bg-[#fff7df] px-4 py-2.5 text-sm font-extrabold text-[#8a5a00] ring-1 ring-[#f0c36a]"
                      >
                        Delete This Competency
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#f8fbf9] p-4 ring-1 ring-[#dfe5dd]">
                    <div className="grid gap-4 lg:grid-cols-[1fr_120px]">
                      <Field label="Group Title">
                        <input
                          value={currentGroup.title}
                          onChange={(e) =>
                            updateGroup(selectedGroupIndex, {
                              title: e.target.value,
                            })
                          }
                          className={inputClass()}
                        />
                      </Field>
                      <Field label="Group Sequence">
                        <input
                          type="number"
                          min="1"
                          value={currentGroup.sequence || selectedGroupIndex + 1}
                          onChange={(e) =>
                            updateGroup(selectedGroupIndex, {
                              sequence: e.target.value,
                            })
                          }
                          className={inputClass()}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[180px_1fr_120px_120px]">
                    <Field label="Code">
                      <input
                        value={currentItem.code}
                        onChange={(e) =>
                          updateCompetency(selectedGroupIndex, selectedItemIndex, {
                            code: e.target.value,
                          })
                        }
                        className={inputClass()}
                      />
                    </Field>
                    <Field label="Competency Label">
                      <input
                        value={currentItem.label}
                        onChange={(e) =>
                          updateCompetency(selectedGroupIndex, selectedItemIndex, {
                            label: e.target.value,
                          })
                        }
                        className={inputClass()}
                      />
                    </Field>
                    <Field label="Sequence">
                      <input
                        type="number"
                        min="1"
                        value={currentItem.sequence || selectedItemIndex + 1}
                        onChange={(e) =>
                          updateCompetency(selectedGroupIndex, selectedItemIndex, {
                            sequence: e.target.value,
                          })
                        }
                        className={inputClass()}
                      />
                    </Field>
                    <Field label="Active">
                      <select
                        value={currentItem.active === false ? "false" : "true"}
                        onChange={(e) =>
                          updateCompetency(selectedGroupIndex, selectedItemIndex, {
                            active: e.target.value === "true",
                          })
                        }
                        className={inputClass()}
                      >
                        <option value="true">Active</option>
                        <option value="false">Hidden</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Short Description">
                    <textarea
                      value={currentItem.description || ""}
                      onChange={(e) =>
                        updateCompetency(selectedGroupIndex, selectedItemIndex, {
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className={inputClass()}
                    />
                  </Field>

                  <div className="mt-6 flex flex-wrap gap-2 border-b border-[#dfe5dd] pb-3">
                    {[
                      ["study", "Study Module"],
                      ["exam", "Exam Questions"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveEditorTab(key)}
                        className={`rounded-full px-4 py-2 text-sm font-extrabold ${
                          activeEditorTab === key
                            ? "bg-[#235f3e] text-white"
                            : "bg-[#f8fbf9] text-[#235f3e]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {activeEditorTab === "study" ? (
                    <div className="mt-5 space-y-5">
                      <Field label="Module Overview">
                        <textarea
                          value={currentItem.studyModuleOverview || ""}
                          onChange={(e) =>
                            updateCompetency(
                              selectedGroupIndex,
                              selectedItemIndex,
                              { studyModuleOverview: e.target.value }
                            )
                          }
                          rows={4}
                          className={inputClass()}
                        />
                      </Field>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <Field
                          label="Learning Objectives"
                          hint="One objective per line."
                        >
                          <textarea
                            value={toLines(currentItem.learningObjectives)}
                            onChange={(e) =>
                              updateCompetency(
                                selectedGroupIndex,
                                selectedItemIndex,
                                {
                                  learningObjectives: fromLines(e.target.value),
                                }
                              )
                            }
                            rows={5}
                            className={inputClass()}
                          />
                        </Field>
                        <Field
                          label="Study Points / Module Summary"
                          hint="One study point per line."
                        >
                          <textarea
                            value={toLines(currentItem.studyPoints)}
                            onChange={(e) =>
                              updateCompetency(
                                selectedGroupIndex,
                                selectedItemIndex,
                                { studyPoints: fromLines(e.target.value) }
                              )
                            }
                            rows={5}
                            className={inputClass()}
                          />
                        </Field>
                      </div>

                      <Field
                        label="Lesson Discussion"
                        hint="One paragraph per line."
                      >
                        <textarea
                          value={toLines(currentItem.lessonDiscussion)}
                          onChange={(e) =>
                            updateCompetency(
                              selectedGroupIndex,
                              selectedItemIndex,
                              {
                                lessonDiscussion: fromLines(e.target.value),
                              }
                            )
                          }
                          rows={7}
                          className={inputClass()}
                        />
                      </Field>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <Field
                          label="Step-by-Step Procedure"
                          hint="One step per line."
                        >
                          <textarea
                            value={toLines(currentItem.stepByStepProcedure)}
                            onChange={(e) =>
                              updateCompetency(
                                selectedGroupIndex,
                                selectedItemIndex,
                                {
                                  stepByStepProcedure: fromLines(e.target.value),
                                }
                              )
                            }
                            rows={6}
                            className={inputClass()}
                          />
                        </Field>
                        <Field label="Real Workplace Scenario">
                          <textarea
                            value={currentItem.workplaceScenario || ""}
                            onChange={(e) =>
                              updateCompetency(
                                selectedGroupIndex,
                                selectedItemIndex,
                                {
                                  workplaceScenario: e.target.value,
                                }
                              )
                            }
                            rows={6}
                            className={inputClass()}
                          />
                        </Field>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <Field label="Practice Activity">
                          <textarea
                            value={currentItem.practiceActivity || ""}
                            onChange={(e) =>
                              updateCompetency(
                                selectedGroupIndex,
                                selectedItemIndex,
                                {
                                  practiceActivity: e.target.value,
                                }
                              )
                            }
                            rows={5}
                            className={inputClass()}
                          />
                        </Field>
                        <Field label="Key Terms" hint="One term per line.">
                          <textarea
                            value={toLines(currentItem.keyTerms)}
                            onChange={(e) =>
                              updateCompetency(
                                selectedGroupIndex,
                                selectedItemIndex,
                                { keyTerms: fromLines(e.target.value) }
                              )
                            }
                            rows={5}
                            className={inputClass()}
                          />
                        </Field>
                      </div>

                      <Field
                        label="Readiness Checklist"
                        hint="One checklist item per line."
                      >
                        <textarea
                          value={toLines(currentItem.readinessChecklist)}
                          onChange={(e) =>
                            updateCompetency(
                              selectedGroupIndex,
                              selectedItemIndex,
                              {
                                readinessChecklist: fromLines(e.target.value),
                              }
                            )
                          }
                          rows={5}
                          className={inputClass()}
                        />
                      </Field>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl bg-[#f8fbf9] p-4 ring-1 ring-[#dfe5dd]">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="font-extrabold">Exam Questions</h4>
                          <p className="mt-1 text-sm text-[#071f14]/60">
                            These are the questions shown when the trainee takes
                            the exam for this competency.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            addQuestion(selectedGroupIndex, selectedItemIndex)
                          }
                          className="rounded-xl border border-[#dfe5dd] bg-white px-4 py-2 text-sm font-bold"
                        >
                          Add Question
                        </button>
                      </div>

                      <div className="mt-4 space-y-4">
                        {safeArray(currentItem.examQuestions).length ? (
                          currentItem.examQuestions.map((question, questionIndex) => (
                            <div
                              key={questionIndex}
                              className="rounded-2xl border border-[#dfe4d7] bg-white p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-extrabold">
                                  Question {questionIndex + 1}
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteQuestion(
                                      selectedGroupIndex,
                                      selectedItemIndex,
                                      questionIndex
                                    )
                                  }
                                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 ring-1 ring-red-200"
                                >
                                  Delete
                                </button>
                              </div>

                              <Field label="Prompt">
                                <textarea
                                  value={question.prompt || ""}
                                  onChange={(e) =>
                                    updateQuestion(
                                      selectedGroupIndex,
                                      selectedItemIndex,
                                      questionIndex,
                                      { prompt: e.target.value }
                                    )
                                  }
                                  rows={2}
                                  className={inputClass()}
                                />
                              </Field>

                              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                                <Field label="Options" hint="One option per line.">
                                  <textarea
                                    value={toLines(question.options)}
                                    onChange={(e) =>
                                      updateQuestion(
                                        selectedGroupIndex,
                                        selectedItemIndex,
                                        questionIndex,
                                        {
                                          options: fromLines(e.target.value),
                                        }
                                      )
                                    }
                                    rows={5}
                                    className={inputClass()}
                                  />
                                </Field>

                                <div className="space-y-3">
                                  <Field label="Correct Answer">
                                    <input
                                      value={question.answer || ""}
                                      onChange={(e) =>
                                        updateQuestion(
                                          selectedGroupIndex,
                                          selectedItemIndex,
                                          questionIndex,
                                          { answer: e.target.value }
                                        )
                                      }
                                      className={inputClass()}
                                    />
                                  </Field>
                                  <Field label="Explanation">
                                    <textarea
                                      value={question.explanation || ""}
                                      onChange={(e) =>
                                        updateQuestion(
                                          selectedGroupIndex,
                                          selectedItemIndex,
                                          questionIndex,
                                          { explanation: e.target.value }
                                        )
                                      }
                                      rows={3}
                                      className={inputClass()}
                                    />
                                  </Field>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl bg-white p-5 text-center">
                            <p className="text-sm font-semibold text-[#071f14]/60">
                              No questions yet for this competency.
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                addQuestion(selectedGroupIndex, selectedItemIndex)
                              }
                              className="mt-4 rounded-full bg-[#235f3e] px-4 py-2 text-sm font-extrabold text-white shadow-sm"
                            >
                              Add First Question
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#f8fbf9] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-[#071f14]/60">
                      Save after editing this competency so trainees can see the
                      updated study module and exam.
                    </p>
                    <button
                      type="button"
                      onClick={saveRoadmap}
                      disabled={!selectedCourseId || saving || loadingRoadmap}
                      className="rounded-full bg-[#235f3e] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_14px_30px_rgba(35,95,62,.22)] disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save Roadmap"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>
      </div>
    </TrainingAdminLayout>
  );
}

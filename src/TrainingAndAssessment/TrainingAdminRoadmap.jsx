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
    <label className="block text-sm font-bold text-[#263d32]">
      {label}
      {children}
      {hint ? (
        <p className="mt-1 text-xs font-medium text-[#758173]">{hint}</p>
      ) : null}
    </label>
  );
}

function inputClass(extra = "") {
  return `mt-2 w-full rounded-xl border border-[#c8ccbf] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345] ${extra}`;
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
      active="roadmap"
      title="Manage Training Competencies"
      subtitle="Configure competency groups, study content, and exam questions for each course."
      maxWidth="max-w-7xl"
    >
      <section className="rounded-3xl bg-[#f7f8f3] p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#79836f]">
              Course Competency CRUD
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">
              Competency Roadmap Manager
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#647166]">
              Manage the roadmap one competency at a time. Each competency has
              its own study module, study points, checklist, and exam questions
              for trainees.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => loadRoadmap(selectedCourseId)}
              disabled={!selectedCourseId || loadingRoadmap}
              className="rounded-2xl border border-[#c8ccbf] bg-white px-5 py-3 text-sm font-bold text-[#395345] disabled:opacity-60"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={saveRoadmap}
              disabled={!selectedCourseId || saving || loadingRoadmap}
              className="rounded-2xl bg-[#395345] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60"
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

        <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e1e5da]">
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

            <div className="mt-5 grid gap-3 rounded-2xl bg-[#eef1e7] p-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6d7668]">
                  Selected Course
                </p>
                <p className="mt-1 text-lg font-extrabold">
                  {selectedCourse?.name || "No course selected"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#6d7668]">
                <div className="rounded-xl bg-white p-3">
                  <p>Groups</p>
                  <p className="mt-1 text-xl text-[#395345]">
                    {roadmap.competencyGroups.length}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <p>Competencies</p>
                  <p className="mt-1 text-xl text-[#395345]">
                    {totalCompetencies}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={resetRoadmap}
              disabled={!selectedCourseId || saving}
              className="mt-4 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 disabled:opacity-60"
            >
              Reset to Default
            </button>
          </div>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e1e5da]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold">Progress Weights</h2>
                <p className="mt-1 text-sm text-[#647166]">
                  Progress is now based only on competency completion and
                  pre-test completion. Attendance and certificate preview fields
                  were removed from this admin screen.
                </p>
              </div>

              <button
                type="button"
                onClick={addGroup}
                className="rounded-2xl bg-[#395345] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
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

      <section className="mt-6 rounded-3xl bg-[#f7f8f3] p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Per-Competency Editor</h2>
            <p className="mt-1 text-sm text-[#647166]">
              Select a competency on the left, then edit only that competency on
              the right.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => goToFlatIndex(currentFlatIndex - 1)}
              disabled={currentFlatIndex <= 0}
              className="rounded-xl border border-[#c8ccbf] bg-white px-4 py-3 text-sm font-bold disabled:opacity-50"
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
              className="rounded-xl bg-[#395345] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              Next Competency
            </button>
          </div>
        </div>

        {loadingRoadmap ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-center text-sm font-semibold text-[#647166]">
            Loading roadmap...
          </div>
        ) : roadmap.competencyGroups.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-center">
            <p className="text-sm font-semibold text-[#647166]">
              No competency groups yet. Click Add Group.
            </p>
            <button
              type="button"
              onClick={addGroup}
              className="mt-4 rounded-2xl bg-[#395345] px-5 py-3 text-sm font-bold text-white"
            >
              Add First Group
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              {roadmap.competencyGroups.map((group, groupIndex) => {
                const isGroupSelected = groupIndex === selectedGroupIndex;

                return (
                  <div
                    key={`${group.title}-${groupIndex}`}
                    className="rounded-2xl bg-white p-4 ring-1 ring-[#e1e5da]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGroupIndex(groupIndex);
                          setSelectedItemIndex(0);
                        }}
                        className={`text-left text-sm font-extrabold ${
                          isGroupSelected ? "text-[#395345]" : "text-[#647166]"
                        }`}
                      >
                        {group.title || `Group ${groupIndex + 1}`}
                      </button>

                      <span className="rounded-full bg-[#eef1e7] px-3 py-1 text-xs font-bold text-[#647166]">
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
                              className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                                active
                                  ? "bg-[#395345] text-white"
                                  : "bg-[#f7f8f3] text-[#395345] hover:bg-[#eef1e7]"
                              }`}
                            >
                              <span className="block text-xs font-bold uppercase tracking-[0.12em] opacity-80">
                                {item.code || "No Code"}
                              </span>
                              <span className="mt-1 block font-bold">
                                {item.label || "Untitled competency"}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="rounded-xl bg-[#f7f8f3] p-3 text-sm font-semibold text-[#647166]">
                          No competencies in this group.
                        </p>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => addCompetency(groupIndex)}
                        className="rounded-xl border border-[#c8ccbf] px-3 py-2 text-xs font-bold"
                      >
                        Add Skill
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGroup(groupIndex)}
                        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 ring-1 ring-red-200"
                      >
                        Delete Group
                      </button>
                    </div>
                  </div>
                );
              })}
            </aside>

            <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e1e5da]">
              {!currentGroup ? (
                <div className="rounded-2xl bg-[#f7f8f3] p-6 text-center text-sm font-semibold text-[#647166]">
                  Select or add a competency group.
                </div>
              ) : !currentItem ? (
                <div className="rounded-2xl bg-[#f7f8f3] p-6 text-center">
                  <p className="text-sm font-semibold text-[#647166]">
                    This group has no competencies yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => addCompetency(selectedGroupIndex)}
                    className="mt-4 rounded-2xl bg-[#395345] px-5 py-3 text-sm font-bold text-white"
                  >
                    Add Competency
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6d7668]">
                        Competency {currentFlatIndex + 1} of{" "}
                        {competencyRefs.length}
                      </p>
                      <h3 className="mt-2 text-2xl font-extrabold">
                        {currentItem.label || "Untitled competency"}
                      </h3>
                      <p className="mt-1 text-sm text-[#647166]">
                        Group:{" "}
                        {currentGroup.title || `Group ${selectedGroupIndex + 1}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => addCompetency(selectedGroupIndex)}
                        className="rounded-xl border border-[#c8ccbf] px-4 py-3 text-sm font-bold"
                      >
                        Add Competency Here
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          deleteCompetency(selectedGroupIndex, selectedItemIndex)
                        }
                        className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-200"
                      >
                        Delete This Competency
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e1e5da]">
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

                  <div className="mt-6 flex flex-wrap gap-2 border-b border-[#e1e5da] pb-3">
                    {[
                      ["study", "Study Module"],
                      ["exam", "Exam Questions"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveEditorTab(key)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold ${
                          activeEditorTab === key
                            ? "bg-[#395345] text-white"
                            : "bg-[#eef1e7] text-[#395345]"
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
                    <div className="mt-5 rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e1e5da]">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="font-extrabold">Exam Questions</h4>
                          <p className="mt-1 text-sm text-[#647166]">
                            These are the questions shown when the trainee takes
                            the exam for this competency.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            addQuestion(selectedGroupIndex, selectedItemIndex)
                          }
                          className="rounded-xl border border-[#c8ccbf] bg-white px-4 py-2 text-sm font-bold"
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
                            <p className="text-sm font-semibold text-[#647166]">
                              No questions yet for this competency.
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                addQuestion(selectedGroupIndex, selectedItemIndex)
                              }
                              className="mt-4 rounded-xl bg-[#395345] px-4 py-2 text-sm font-bold text-white"
                            >
                              Add First Question
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#eef1e7] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-[#647166]">
                      Save after editing this competency so trainees can see the
                      updated study module and exam.
                    </p>
                    <button
                      type="button"
                      onClick={saveRoadmap}
                      disabled={!selectedCourseId || saving || loadingRoadmap}
                      className="rounded-2xl bg-[#395345] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60"
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
    </TrainingAdminLayout>
  );
}

function normalizeCourseName(value = "") {
  const raw = String(value || "").trim();
  const clean = raw.toLowerCase();
  if (clean === "housekeeping") return "Housekeeping";
  if (clean === "event management") return "Event Management";
  return raw;
}

function courseKeyFromName(value = "") {
  return normalizeCourseName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const HOUSEKEEPING_COMPETENCY_GROUPS = [
  {
    title: "Basic Competencies",
    items: [
      { code: "HK-BASIC-01", label: "Participate in workplace communication" },
      { code: "HK-BASIC-02", label: "Work in team environment" },
      { code: "HK-BASIC-03", label: "Practice career professionalism" },
      { code: "HK-BASIC-04", label: "Practice occupational health and safety procedures" },
    ],
  },
  {
    title: "Common Competencies",
    items: [
      { code: "HK-COMMON-01", label: "Develop and update industry knowledge" },
      { code: "HK-COMMON-02", label: "Observe workplace hygiene procedures" },
      { code: "HK-COMMON-03", label: "Perform computer operations" },
      { code: "HK-COMMON-04", label: "Perform workplace and safety practices" },
      { code: "HK-COMMON-05", label: "Provide effective customer service" },
    ],
  },
  {
    title: "Core Competencies",
    items: [
      { code: "HK-CORE-01", label: "Provide housekeeping services to guests" },
      { code: "HK-CORE-02", label: "Clean and prepare rooms for incoming guests" },
      { code: "HK-CORE-03", label: "Provide valet/butler service" },
      { code: "HK-CORE-04", label: "Laundry linen and guest clothes" },
      { code: "HK-CORE-05", label: "Clean public areas, facilities and equipment" },
      { code: "HK-CORE-06", label: "Deal with/Handle intoxicated guests" },
    ],
  },
];

export const EVENT_MANAGEMENT_COMPETENCY_GROUPS = [
  {
    title: "Basic Competencies",
    items: [
      { code: "EMS-BASIC-01", label: "Lead workplace communication" },
      { code: "EMS-BASIC-02", label: "Lead small teams" },
      { code: "EMS-BASIC-03", label: "Develop and practice negotiation skills" },
      { code: "EMS-BASIC-04", label: "Solve problems related to work activities" },
      { code: "EMS-BASIC-05", label: "Use mathematical concepts and techniques" },
      { code: "EMS-BASIC-06", label: "Use relevant technologies" },
    ],
  },
  {
    title: "Common Competencies",
    items: [
      { code: "EMS-COMMON-01", label: "Roster staff" },
      { code: "EMS-COMMON-02", label: "Control and order stock" },
      { code: "EMS-COMMON-03", label: "Train small groups" },
      { code: "EMS-COMMON-04", label: "Establish and conduct business relationships" },
    ],
  },
  {
    title: "Core Competencies",
    items: [
      { code: "EMS-CORE-01", label: "Plan and develop event proposal or bid" },
      { code: "EMS-CORE-02", label: "Develop an event concept" },
      { code: "EMS-CORE-03", label: "Develop event program" },
      { code: "EMS-CORE-04", label: "Select event venue and site" },
      { code: "EMS-CORE-05", label: "Develop and update event industry knowledge" },
      { code: "EMS-CORE-06", label: "Provide on-site event management services" },
      { code: "EMS-CORE-07", label: "Manage contractors for indoor events" },
      { code: "EMS-CORE-08", label: "Develop and update knowledge on protocol" },
    ],
  },
];

export function buildGenericCompetencyGroups(course = "") {
  const courseName = normalizeCourseName(course) || "Training";
  const key = courseKeyFromName(courseName).toUpperCase() || "GEN";

  return [
    {
      title: "Basic Competencies",
      items: [
        { code: `${key}-BASIC-01`, label: "Participate in workplace communication" },
        { code: `${key}-BASIC-02`, label: "Work in a team environment" },
        { code: `${key}-BASIC-03`, label: "Practice career professionalism" },
        { code: `${key}-BASIC-04`, label: "Practice occupational health and safety procedures" },
      ],
    },
    {
      title: "Common Competencies",
      items: [
        { code: `${key}-COMMON-01`, label: `Understand ${courseName} workplace standards` },
        { code: `${key}-COMMON-02`, label: `Use tools, materials, and resources for ${courseName}` },
        { code: `${key}-COMMON-03`, label: "Follow quality and service procedures" },
        { code: `${key}-COMMON-04`, label: "Apply customer service and reporting standards" },
      ],
    },
    {
      title: "Core Competencies",
      items: [
        { code: `${key}-CORE-01`, label: `Perform basic ${courseName} tasks` },
        { code: `${key}-CORE-02`, label: `Apply intermediate ${courseName} procedures` },
        { code: `${key}-CORE-03`, label: `Handle common problems in ${courseName}` },
        { code: `${key}-CORE-04`, label: `Complete practical ${courseName} activities` },
        { code: `${key}-CORE-05`, label: `Demonstrate readiness for ${courseName} assessment` },
      ],
    },
  ];
}

export const TRAINING_PROGRESS_CATALOG = {
  Housekeeping: {
    course: "Housekeeping",
    courseKey: "housekeeping",
    requiredOnlineClasses: 37,
    requiredFaceToFaceClasses: 18,
    onlineAttendanceBasis: "verified_professor_attendance",
    faceToFaceAttendanceBasis: "rfid",
    certificatePreviewImage: "/certificates/housekeeping-ncii.png",
    competencyGroups: HOUSEKEEPING_COMPETENCY_GROUPS,
    weights: {
      online: 30,
      faceToFace: 30,
      competencies: 25,
      pretest: 15,
    },
  },
  "Event Management": {
    course: "Event Management",
    courseKey: "event-management",
    requiredOnlineClasses: 15,
    requiredFaceToFaceClasses: 0,
    onlineAttendanceBasis: "verified_professor_attendance",
    faceToFaceAttendanceBasis: "none",
    certificatePreviewImage: "",
    competencyGroups: EVENT_MANAGEMENT_COMPETENCY_GROUPS,
    weights: {
      online: 40,
      faceToFace: 0,
      competencies: 40,
      pretest: 20,
    },
  },
};

export function buildDynamicCourseProgressConfig(course = "") {
  const normalized = normalizeCourseName(course);
  const courseKey = courseKeyFromName(normalized);
  if (!normalized || !courseKey) return null;

  return {
    course: normalized,
    courseKey,
    requiredOnlineClasses: 0,
    requiredFaceToFaceClasses: 0,
    onlineAttendanceBasis: "verified_professor_attendance",
    faceToFaceAttendanceBasis: "none",
    certificatePreviewImage: "",
    competencyGroups: buildGenericCompetencyGroups(normalized),
    weights: {
      online: 0,
      faceToFace: 0,
      competencies: 70,
      pretest: 30,
    },
  };
}

export function getCourseProgressConfig(course = "") {
  const normalized = normalizeCourseName(course);
  return TRAINING_PROGRESS_CATALOG[normalized] || buildDynamicCourseProgressConfig(normalized);
}

export function getCourseCompetencyGroups(course = "") {
  return getCourseProgressConfig(course)?.competencyGroups || [];
}

export function getCourseCompetencies(course = "") {
  return getCourseCompetencyGroups(course).flatMap((group) => group.items || []);
}

export function getCourseCompetencyCodes(course = "") {
  return getCourseCompetencies(course).map((item) => item.code);
}

export function getCourseCertificatePreviewImage(course = "") {
  return getCourseProgressConfig(course)?.certificatePreviewImage || "";
}

export function normalizeTrainingCourseName(value = "") {
  return normalizeCourseName(value);
}

export default {
  TRAINING_PROGRESS_CATALOG,
  HOUSEKEEPING_COMPETENCY_GROUPS,
  EVENT_MANAGEMENT_COMPETENCY_GROUPS,
  buildGenericCompetencyGroups,
  buildDynamicCourseProgressConfig,
  getCourseProgressConfig,
  getCourseCompetencyGroups,
  getCourseCompetencies,
  getCourseCompetencyCodes,
  getCourseCertificatePreviewImage,
  normalizeTrainingCourseName,
};

import TrainingCourse from "../models/TrainingCourse.js";
import ProfessorUser from "../models/ProfessorUser.js";
import TrainingBatch from "../models/TrainingBatch.js";
import EnrollmentRequest from "../models/EnrollmentRequest.js";
import { buildDefaultRoadmapForCourse } from "./trainingRoadmapService.js";

function clean(value = "") {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function slugify(value = "") {
  return (
    clean(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "course"
  );
}

async function getKnownCourseNames() {
  const [professors, batchCourses, enrollmentCourses] = await Promise.all([
    ProfessorUser.find({}).select("courseAssignments").lean(),
    TrainingBatch.distinct("course"),
    EnrollmentRequest.distinct("course"),
  ]);

  return [
    ...new Set(
      [
        ...batchCourses,
        ...enrollmentCourses,
        ...professors.flatMap((professor) => professor.courseAssignments || []),
      ]
        .map(clean)
        .filter(Boolean)
    ),
  ];
}

export async function seedTrainingCoursesFromExistingRecords() {
  const courseNames = await getKnownCourseNames();
  if (!courseNames.length) {
    console.log("[training] No existing course records found to seed.");
    return [];
  }

  const seeded = [];

  for (const courseName of courseNames) {
    const professor = await ProfessorUser.findOne({
      courseAssignments: courseName,
      active: { $ne: false },
    }).lean();

    const existing = await TrainingCourse.findOne({ name: courseName });

    if (!existing) {
      const defaultRoadmap = buildDefaultRoadmapForCourse(courseName);
      const course = await TrainingCourse.create({
        name: courseName,
        slug: slugify(courseName),
        description: "",
        imageUrl: "",
        certificatePreviewImage: defaultRoadmap.certificatePreviewImage || "",
        requiredOnlineClasses: defaultRoadmap.requiredOnlineClasses,
        requiredFaceToFaceClasses: defaultRoadmap.requiredFaceToFaceClasses,
        onlineAttendanceBasis: defaultRoadmap.onlineAttendanceBasis,
        faceToFaceAttendanceBasis: defaultRoadmap.faceToFaceAttendanceBasis,
        progressWeights: defaultRoadmap.progressWeights,
        competencyGroups: defaultRoadmap.competencyGroups,
        active: true,
        professorUserId: professor?._id || null,
        professorUsername: professor?.username || "",
        professorEmail: professor?.email || "",
        createdByAdminId: "system-seed",
        createdByAdminName: "System Seed",
      });

      seeded.push({ name: course.name, action: "created" });
      continue;
    }

    let changed = false;

    if (professor && !existing.professorUserId) {
      existing.professorUserId = professor._id;
      existing.professorUsername = professor.username || "";
      existing.professorEmail = professor.email || "";
      changed = true;
    }

    if (!Array.isArray(existing.competencyGroups) || existing.competencyGroups.length === 0) {
      const defaultRoadmap = buildDefaultRoadmapForCourse(existing.name);
      existing.certificatePreviewImage = existing.certificatePreviewImage || defaultRoadmap.certificatePreviewImage || "";
      existing.requiredOnlineClasses = Number(existing.requiredOnlineClasses || defaultRoadmap.requiredOnlineClasses || 0);
      existing.requiredFaceToFaceClasses = Number(existing.requiredFaceToFaceClasses || defaultRoadmap.requiredFaceToFaceClasses || 0);
      existing.onlineAttendanceBasis = existing.onlineAttendanceBasis || defaultRoadmap.onlineAttendanceBasis;
      existing.faceToFaceAttendanceBasis = existing.faceToFaceAttendanceBasis || defaultRoadmap.faceToFaceAttendanceBasis;
      existing.progressWeights = existing.progressWeights || defaultRoadmap.progressWeights;
      existing.competencyGroups = defaultRoadmap.competencyGroups;
      changed = true;
    }

    if (changed) {
      await existing.save();
      seeded.push({ name: existing.name, action: "updated" });
    }
  }

  console.log(`[training] Course seed checked. Updated/created ${seeded.length} course record(s).`);
  return seeded;
}

export default { seedTrainingCoursesFromExistingRecords };

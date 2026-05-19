// src/TrainingAndAssessment/TrainingCourse.jsx
import React, { useEffect, useMemo, useState } from "react";
import { TrainingPublicShell } from "./TrainingPublicLayout";

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

const fallbackCourses = [
  {
    name: "Housekeeping",
    imageUrl: "/housekeeping-course.jpg",
    description:
      "The Housekeeping course prepares trainees with practical skills in room preparation, cleaning standards, sanitation, guest service, and workplace safety.",
    requirements: [
      "Must be 18 years old and above",
      "Valid personal email address",
      "Valid PH mobile number",
      "Birth Certificate",
      "Diploma / TOR",
      "2x2 picture with name",
      "Completed application form",
    ],
    howToEnroll: [
      "Click Proceed to Enrollment.",
      "Fill out the enrollment form completely.",
      "Select your preferred open batch.",
      "Upload all required documents.",
      "Wait for admin approval and login credentials.",
    ],
  },
  {
    name: "Event Management",
    imageUrl: "/event-management-course.jpg",
    description:
      "The Event Management course trains students in event planning, coordination, program flow, venue logistics, client handling, and on-site event operations.",
    requirements: [
      "Must be 18 years old and above",
      "Valid personal email address",
      "Valid PH mobile number",
      "Birth Certificate",
      "Diploma / TOR",
      "2x2 picture with name",
      "Completed application form",
    ],
    howToEnroll: [
      "Click Proceed to Enrollment.",
      "Fill out the enrollment form completely.",
      "Select your preferred open batch.",
      "Upload all required documents.",
      "Wait for admin approval and login credentials.",
    ],
  },
];

const defaultRequirements = [
  "Must be 18 years old and above",
  "Valid personal email address",
  "Valid PH mobile number",
  "Birth Certificate",
  "Diploma / TOR",
  "2x2 picture with name",
  "Completed application form",
];

const defaultHowToEnroll = [
  "Click Proceed to Enrollment.",
  "Fill out the enrollment form completely.",
  "Select your preferred open batch.",
  "Upload all required documents.",
  "Wait for admin approval and login credentials.",
];

export default function TrainingCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/enrollments/courses`);
        const data = await res.json().catch(() => ({}));

        if (!active) return;

        const nextCourses = Array.isArray(data?.courses)
          ? data.courses
          : Array.isArray(data)
          ? data
          : [];

        setCourses(nextCourses);
      } catch {
        if (active) setCourses([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  const visibleCourses = courses.length ? courses : fallbackCourses;

  const getCourseName = (course) => {
    return course?.name || course?.title || "Training Course";
  };

  const getCourseImage = (course) => {
    return (
      course?.imageUrl ||
      course?.image ||
      course?.thumbnail ||
      course?.photoUrl ||
      (String(getCourseName(course)).toLowerCase().includes("event")
        ? "/event-management-course.jpg"
        : "/housekeeping-course.jpg")
    );
  };

  const getCourseDescription = (course) => {
    const name = String(getCourseName(course)).toLowerCase();

    if (course?.description) return course.description;

    if (name.includes("event")) {
      return "This course trains students in planning, organizing, coordinating, and managing events professionally.";
    }

    if (name.includes("house")) {
      return "This course prepares trainees with practical housekeeping skills, cleaning standards, sanitation, and guest-service readiness.";
    }

    return "Training and assessment course designed to develop practical skills and workplace readiness.";
  };

  const modalCourse = useMemo(() => {
    if (!selectedCourse) return null;

    return {
      ...selectedCourse,
      name: getCourseName(selectedCourse),
      imageUrl: getCourseImage(selectedCourse),
      description: getCourseDescription(selectedCourse),
      requirements:
        Array.isArray(selectedCourse?.requirements) &&
        selectedCourse.requirements.length
          ? selectedCourse.requirements
          : defaultRequirements,
      howToEnroll:
        Array.isArray(selectedCourse?.howToEnroll) &&
        selectedCourse.howToEnroll.length
          ? selectedCourse.howToEnroll
          : defaultHowToEnroll,
    };
  }, [selectedCourse]);

  return (
    <TrainingPublicShell
      active="course"
      title="List of Course"
      subtitle="Choose a course and begin your training journey with TAMSI."
    >
      {({ goTo }) => (
        <>
          <section className="bg-[#2e5038] px-5 py-12 text-white sm:px-8 lg:px-12">
            <div className="mx-auto max-w-[1280px]">
              {loading ? (
                <p className="mb-6 text-center text-sm font-semibold text-white/80">
                  Loading courses...
                </p>
              ) : null}

              <div className="mx-auto grid max-w-[920px] grid-cols-1 gap-12 sm:grid-cols-2">
                {visibleCourses.map((course, index) => (
                  <button
                    key={
                      course._id ||
                      course.id ||
                      course.name ||
                      course.title ||
                      index
                    }
                    type="button"
                    onClick={() => setSelectedCourse(course)}
                    className="group mx-auto w-full max-w-[315px] text-center"
                  >
                    <div className="overflow-hidden rounded-xl bg-[#dce4d9] shadow-xl ring-1 ring-white/10">
                      <img
                        src={getCourseImage(course)}
                        alt={getCourseName(course)}
                        className="h-[150px] w-full object-cover transition duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/520x320/d7ddd4/45674b?text=Course";
                        }}
                      />
                    </div>

                    <h2 className="mt-4 font-['Montserrat',sans-serif] text-2xl font-extrabold leading-tight text-white">
                      {getCourseName(course)}
                    </h2>

                    {course.description ? (
                      <p className="mt-2 text-sm font-semibold leading-6 text-white/75">
                        {course.description}
                      </p>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {modalCourse ? (
            <div
              className="fixed inset-0 z-[999] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              onClick={() => setSelectedCourse(null)}
            >
              <div
                className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-[#f8faf4] text-[#243b2e] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative bg-gradient-to-r from-[#2e5038] to-[#6f7d49] px-6 py-6 text-white sm:px-8">
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
                    className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xl font-bold text-white transition hover:bg-white/25"
                    aria-label="Close course details"
                  >
                    ×
                  </button>

                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                    Training Course Details
                  </p>
                  <h2 className="mt-2 pr-12 font-['Montserrat',sans-serif] text-3xl font-extrabold">
                    {modalCourse.name}
                  </h2>
                </div>

                <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-['Montserrat',sans-serif] text-xl font-extrabold text-[#2e5038]">
                        Description
                      </h3>
                      <p className="mt-3 text-sm font-semibold leading-7 text-[#536756]">
                        {modalCourse.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-['Montserrat',sans-serif] text-xl font-extrabold text-[#2e5038]">
                        Requirements
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm font-semibold text-[#536756]">
                        {modalCourse.requirements.map((item, index) => (
                          <li
                            key={`${item}-${index}`}
                            className="flex gap-2 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-[#dfe7dc]"
                          >
                            <span className="font-extrabold text-[#6f7d49]">
                              ✓
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-['Montserrat',sans-serif] text-xl font-extrabold text-[#2e5038]">
                        Picture
                      </h3>
                      <div className="mt-3 overflow-hidden rounded-2xl bg-[#dce4d9] shadow-lg ring-1 ring-[#dfe7dc]">
                        <img
                          src={modalCourse.imageUrl}
                          alt={modalCourse.name}
                          className="h-[240px] w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/720x420/d7ddd4/45674b?text=Course";
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-['Montserrat',sans-serif] text-xl font-extrabold text-[#2e5038]">
                        How to Enroll
                      </h3>
                      <ol className="mt-3 space-y-2 text-sm font-semibold text-[#536756]">
                        {modalCourse.howToEnroll.map((item, index) => (
                          <li
                            key={`${item}-${index}`}
                            className="flex gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-[#dfe7dc]"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6f7d49] text-xs font-extrabold text-white">
                              {index + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#dfe7dc] bg-white px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
                    className="rounded-full border border-[#9aaa91] px-6 py-3 text-sm font-extrabold text-[#2e5038] transition hover:bg-[#f1f4ee]"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse(null);
                      goTo("/training-enroll");
                    }}
                    className="rounded-full bg-[#2e5038] px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#243f2c]"
                  >
                    Proceed to Enrollment
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </TrainingPublicShell>
  );
}
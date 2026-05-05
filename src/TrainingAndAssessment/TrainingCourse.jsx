// src/TrainingAndAssessment/TrainingCourse.jsx
import React, { useEffect, useState } from "react";
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
    name: "HouseKeeping",
    imageUrl: "/housekeeping-course.jpg",
    description: "Training and assessment course.",
  },
  {
    name: "Event Management",
    imageUrl: "/event-management-course.jpg",
    description: "Training and assessment course.",
  },
];

export default function TrainingCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getCourseImage = (course) => {
    return (
      course?.imageUrl ||
      course?.image ||
      course?.thumbnail ||
      course?.photoUrl ||
      (String(course?.name || course?.title || "")
        .toLowerCase()
        .includes("event")
        ? "/event-management-course.jpg"
        : "/housekeeping-course.jpg")
    );
  };

  return (
    <TrainingPublicShell
      active="course"
      title="List of Course"
      subtitle="Choose a course and begin your training journey with TAMSI."
    >
      {({ goTo }) => (
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
                  key={course._id || course.id || course.name || course.title || index}
                  type="button"
                  onClick={() => goTo("/training-enroll")}
                  className="group mx-auto w-full max-w-[315px] text-center"
                >
                  <div className="overflow-hidden rounded-xl bg-[#dce4d9] shadow-xl ring-1 ring-white/10">
                    <img
                      src={getCourseImage(course)}
                      alt={course.name || course.title || "Training course"}
                      className="h-[150px] w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/520x320/d7ddd4/45674b?text=Course";
                      }}
                    />
                  </div>

                  <h2 className="mt-4 font-['Montserrat',sans-serif] text-2xl font-extrabold leading-tight text-white">
                    {course.name || course.title || "Training Course"}
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
      )}
    </TrainingPublicShell>
  );
}

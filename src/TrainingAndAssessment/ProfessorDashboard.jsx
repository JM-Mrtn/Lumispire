import React, { useCallback, useEffect, useMemo, useState } from "react";
import ProfessorLayout from "./ProfessorLayout";
import {
  API_BASE,
  fetchJson,
  getStoredProfessor,
  normalizeCourseAssignments,
} from "./professorSession";

function todayLocalISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

function getStudentName(student) {
  return (
    student?.fullName ||
    student?.traineeName ||
    student?.name ||
    `${student?.firstName || ""} ${student?.lastName || ""}`.trim() ||
    "Full name of the trainee"
  );
}

function getStudentEmail(student) {
  return (
    student?.email ||
    student?.traineeEmail ||
    student?.userEmail ||
    "traineeemail@tamsi.com"
  );
}

function getStudentCourse(student) {
  return (
    student?.course ||
    student?.courseName ||
    student?.assignedCourse ||
    student?.program ||
    "Course"
  );
}

function getStudentStatus(student) {
  return student?.status || student?.enrollmentStatus || "Enrolled";
}

function getStudentId(student, index) {
  return student?._id || student?.id || student?.traineeId || `student-${index}`;
}

function buildCalendarDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const blanks = Array.from({ length: firstDay }, () => null);
  const days = Array.from({ length: totalDays }, (_, index) => index + 1);

  return [...blanks, ...days];
}

function StatCard({ title, value, note }) {
  return (
    <div className="group relative min-h-[132px] overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(8,39,25,0.16)]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-14 -right-12 h-36 w-36 rounded-full bg-[#f4d484]/20 blur-2xl transition group-hover:scale-110" />
      <p className="relative text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
        {title}
      </p>
      <p className="relative mt-4 text-4xl font-black leading-none tracking-tight text-[#071f14]">
        {value}
      </p>
      {note ? (
        <p className="relative mt-3 text-sm font-semibold text-[#071f14]/55">
          {note}
        </p>
      ) : null}
    </div>
  );
}

function SectionCard({ eyebrow, title, children, className = "" }) {
  return (
    <section className={`relative overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(8,39,25,0.10)] ring-1 ring-black/5 ${className}`}>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#235f3e] via-[#2f754c] to-[#d7a84d]" />
      <div className="absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-[#f4d484]/20 blur-2xl" />
      <div className="relative">
        {eyebrow ? (
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#071f14]/45">
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071f14]">
            {title}
          </h2>
        ) : null}
        <div className={title || eyebrow ? "mt-5" : ""}>{children}</div>
      </div>
    </section>
  );
}

export default function ProfessorDashboard() {
  const storedProfessor = useMemo(() => getStoredProfessor(), []);
  const [professor] = useState(() => storedProfessor);

  const [allowedCourses, setAllowedCourses] = useState(() =>
    normalizeCourseAssignments(storedProfessor?.courseAssignments || [])
  );

  const [stats, setStats] = useState({
    totalTrainees: 0,
    activeAssessments: 0,
    todayAttendance: 0,
  });

  const [students, setStudents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setMsg("");

      const dashboardData = await fetchJson(`${API_BASE}/professors/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("professorToken") || ""}`,
        },
      });

      setAllowedCourses(
        normalizeCourseAssignments(
          storedProfessor?.courseAssignments ||
            dashboardData?.allowedCourses ||
            dashboardData?.courseAssignments ||
            []
        )
      );

      setStats({
        totalTrainees: dashboardData?.stats?.totalTrainees ?? 0,
        activeAssessments: dashboardData?.stats?.activeAssessments ?? 0,
        todayAttendance: dashboardData?.stats?.todayAttendance ?? 0,
      });

      setStudents(
        dashboardData?.students ||
          dashboardData?.trainees ||
          dashboardData?.enrolledTrainees ||
          dashboardData?.recentTrainees ||
          []
      );

      setNotifications(
        dashboardData?.notifications ||
          dashboardData?.recentNotifications ||
          dashboardData?.announcements ||
          []
      );
    } catch (err) {
      setMsg(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [storedProfessor]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!active) return;
      await loadDashboard();
    };

    run();

    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return students;

    return students.filter((student) => {
      const name = getStudentName(student).toLowerCase();
      const email = getStudentEmail(student).toLowerCase();
      const course = getStudentCourse(student).toLowerCase();

      return name.includes(keyword) || email.includes(keyword) || course.includes(keyword);
    });
  }, [search, students]);

  const displayNotifications = useMemo(() => {
    if (notifications.length) return notifications.slice(0, 3);

    return [
      { message: `Active trainees: ${stats.totalTrainees}` },
      { message: `Active assessments: ${stats.activeAssessments}` },
      { message: `Attendance today: ${stats.todayAttendance}` },
    ];
  }, [notifications, stats]);

  const calendarDate = new Date();
  const calendarDays = useMemo(() => buildCalendarDays(calendarDate), []);
  const monthName = calendarDate.toLocaleString("default", { month: "long" });
  const today = calendarDate.getDate();

  return (
    <ProfessorLayout
      title="Professor Dashboard"
      subtitle="Monitor assigned trainees, attendance activity, course notifications, and current training records."
      activePage="dashboard"
      actions={
        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#082719] px-5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#071f14]"
        >
          Refresh
        </button>
      }
    >
      {msg ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {msg}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard title="Total Trainees" value={stats.totalTrainees} note="Assigned learners" />
        <StatCard title="Assessments" value={stats.activeAssessments} note="Active assessment records" />
        <StatCard title="Attendance Today" value={stats.todayAttendance} note={todayLocalISO()} />
      </div>


      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <SectionCard eyebrow="Updates" title="Notifications">
          <div className="grid gap-3">
            {displayNotifications.map((item, index) => (
              <div
                key={item?._id || item?.id || index}
                className="rounded-2xl border border-black/5 bg-[#f8fbf9] px-4 py-4 text-sm font-bold leading-6 text-[#071f14]/75 shadow-sm"
              >
                {loading ? "Loading..." : item?.message || item?.title || "No new notification"}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Calendar" title={`${monthName} ${calendarDate.getFullYear()}`}>
          <div className="rounded-2xl border border-black/5 bg-[#f8fbf9] p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase text-[#071f14]/45">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div key={`${day}-${index}`}>{day}</div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-bold">
              {calendarDays.map((day, index) => (
                <div
                  key={`${day || "blank"}-${index}`}
                  className={`flex aspect-square items-center justify-center rounded-xl ${
                    day === today
                      ? "bg-[#082719] text-white shadow-sm"
                      : day
                      ? "bg-white text-[#071f14]/75 ring-1 ring-black/5"
                      : "bg-transparent"
                  }`}
                >
                  {day || ""}
                </div>
              ))}
            </div>

            <p className="mt-4 text-center text-xs font-bold text-[#071f14]/55">
              Today: {todayLocalISO()}
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard eyebrow="Student Records" title="My Students" className="mt-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-md text-sm font-semibold leading-6 text-[#071f14]/60">
            Search assigned trainees by name, email, or course.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Student"
              className="h-11 w-full rounded-full border border-black/10 bg-[#f8fbf9] px-5 text-sm font-bold text-[#071f14] outline-none transition placeholder:text-[#071f14]/35 focus:border-[#235f3e] focus:bg-white focus:ring-4 focus:ring-[#235f3e]/10 sm:w-[300px]"
            />

            <button
              type="button"
              onClick={loadDashboard}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#082719] px-5 text-sm font-extrabold text-white transition hover:bg-[#071f14]"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-black/5 bg-white">
          <div className="hidden grid-cols-[72px_1.2fr_1.3fr_1fr_120px_110px] gap-4 bg-[#f8fbf9] px-5 py-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[#071f14]/45 lg:grid">
            <span />
            <span>Name</span>
            <span>Email</span>
            <span>Course</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          <div className="divide-y divide-black/5">
            {loading ? (
              [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[72px_1.2fr_1.3fr_1fr_120px_110px] lg:items-center"
                >
                  <div className="h-11 w-11 rounded-full bg-[#f8fbf9] ring-1 ring-black/5" />
                  <div className="h-4 rounded-full bg-[#f8fbf9]" />
                  <div className="h-4 rounded-full bg-[#f8fbf9]" />
                  <div className="h-4 rounded-full bg-[#f8fbf9]" />
                  <div className="h-7 rounded-full bg-[#f8fbf9]" />
                  <div className="h-8 rounded-full bg-[#f8fbf9]" />
                </div>
              ))
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <div
                  key={getStudentId(student, index)}
                  className="grid gap-3 px-5 py-5 text-sm font-bold text-[#071f14] transition hover:bg-[#f8fbf9] lg:grid-cols-[72px_1.2fr_1.3fr_1fr_120px_110px] lg:items-center"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8fbf9] text-xs font-black text-[#235f3e] ring-1 ring-black/5">
                    {String(getStudentName(student)).slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-extrabold">{getStudentName(student)}</p>
                  </div>

                  <div className="min-w-0 break-words text-[#071f14]/65">
                    {getStudentEmail(student)}
                  </div>

                  <div className="min-w-0 text-[#071f14]/65">
                    {getStudentCourse(student)}
                  </div>

                  <div>
                    <span className="inline-flex min-h-8 min-w-[92px] items-center justify-center rounded-full border border-[#235f3e]/10 bg-[#eaf5ee] px-3 text-[11px] font-extrabold text-[#235f3e]">
                      {getStudentStatus(student)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="inline-flex h-9 min-w-[92px] cursor-not-allowed items-center justify-center rounded-full border border-black/10 bg-white px-4 text-xs font-extrabold text-[#071f14]/50 shadow-sm"
                    title="Connect this button to your remove trainee endpoint if needed."
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="px-5 py-12 text-center text-sm font-bold text-[#071f14]/55">
                No enrolled trainees found.
              </div>
            )}
          </div>
        </div>
      </SectionCard>
    </ProfessorLayout>
  );
}

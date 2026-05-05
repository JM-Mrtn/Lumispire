import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ProfessorDashboard() {
  const navigate = useNavigate();

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

  const professorName = getProfessorName(professor);
  const professorEmail = professor?.email || "traineemail@tamsi.com";

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return students;

    return students.filter((student) => {
      const name = getStudentName(student).toLowerCase();
      const email = getStudentEmail(student).toLowerCase();
      const course = getStudentCourse(student).toLowerCase();

      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        course.includes(keyword)
      );
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

  const menuItems = [
    { label: "Dashboard", path: "/professor-dashboard" },
    { label: "Manage Attendance", path: "/professor-attendance" },
    { label: "Manage Assignment", path: "/professor-assessments" },
    { label: "Manage Modules", path: "/professor-modules" },
    { label: "Manage Progress", path: "/professor-progress" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("professorToken");
    localStorage.removeItem("professor");
    localStorage.removeItem("professorUser");
    localStorage.removeItem("storedProfessor");
    navigate("/professor-login");
  };

  return (
    <div className="min-h-screen bg-[#12391f] font-sans text-white">
      <header className="flex h-[86px] items-center bg-white px-6 shadow-sm md:px-10">
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#2d5238] bg-white text-sm font-black text-[#2d5238]">
            LC
          </div>

          <h1 className="text-xl font-black uppercase tracking-wide text-[#2d5238] md:text-3xl">
            Training &amp; Assessment
          </h1>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-86px)] flex-col lg:flex-row">
        <aside className="flex w-full flex-col bg-[#2d5038] lg:w-[264px]">
          <div className="border-b border-white/15 px-6 py-8 text-center">
            <div className="mx-auto h-[74px] w-[74px] rounded-full border-4 border-[#b7bbb6] bg-white shadow-sm" />

            <h2 className="mt-5 text-base font-black uppercase leading-tight">
              {professorName}
            </h2>

            <p className="mt-1 break-words text-xs font-semibold text-white/80">
              {professorEmail}
            </p>

            {allowedCourses.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {allowedCourses.map((course) => (
                  <span
                    key={course}
                    className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                  >
                    {course}
                  </span>
                ))}
              </div>
            )}
          </div>

          <nav className="flex-1 py-6">
            {menuItems.map((item) => {
              const active = item.label === "Dashboard";

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`block w-full px-12 py-4 text-left text-sm font-black uppercase transition ${
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

          <div className="px-12 pb-10">
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
            <div className="mb-5">
              <h2 className="text-3xl font-black uppercase tracking-tight md:text-[34px]">
                Professor Dashboard
              </h2>
              <div className="mt-1 h-1 w-full max-w-[430px] bg-white/60" />
            </div>

            {msg && (
              <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800 ring-1 ring-red-200">
                {msg}
              </div>
            )}

            <div className="grid gap-7 lg:grid-cols-2">
              <div className="rounded-lg bg-[#637967] p-3 shadow-sm">
                <h3 className="mb-4 text-base font-black uppercase">
                  Notification
                </h3>

                <div className="space-y-6">
                  {displayNotifications.map((item, index) => (
                    <div
                      key={item?._id || item?.id || index}
                      className="flex min-h-[48px] items-center rounded-lg bg-[#c8d1c8] px-4 py-3 text-sm font-bold text-[#2d5038]"
                    >
                      {loading ? "Loading..." : item?.message || item?.title || "No new notification"}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-[#637967] p-6 shadow-sm">
                <div className="flex h-full min-h-[250px] flex-col justify-center">
                  <h3 className="mb-4 text-center text-base font-black uppercase">
                    Calendar
                  </h3>

                  <div className="mx-auto w-full max-w-[330px] rounded-xl bg-white/10 p-4">
                    <div className="mb-3 text-center text-sm font-black uppercase tracking-widest">
                      {monthName} {calendarDate.getFullYear()}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-white/80">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                        <div key={`${day}-${index}`}>{day}</div>
                      ))}
                    </div>

                    <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs font-bold">
                      {calendarDays.map((day, index) => (
                        <div
                          key={`${day || "blank"}-${index}`}
                          className={`flex aspect-square items-center justify-center rounded-md ${
                            day === today
                              ? "bg-white text-[#2d5038]"
                              : day
                              ? "bg-white/10 text-white"
                              : "bg-transparent"
                          }`}
                        >
                          {day || ""}
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-center text-xs font-bold text-white/80">
                      Today: {todayLocalISO()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 overflow-hidden rounded-lg bg-[#2d5038] shadow-sm">
              <div className="flex flex-col gap-3 bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-black text-[#2d5038]">
                  My Students
                </h3>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Student"
                    className="h-6 w-full rounded-full border border-[#9aa69a] px-4 text-xs font-bold text-[#2d5038] outline-none focus:border-[#12391f] sm:w-[265px]"
                  />

                  <button
                    type="button"
                    onClick={loadDashboard}
                    className="h-6 rounded-full bg-[#12391f] px-8 text-xs font-black text-white transition hover:bg-[#2d5038]"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="divide-y divide-white/20">
                {loading ? (
                  [1, 2].map((item) => (
                    <div
                      key={item}
                      className="grid gap-4 px-3 py-4 md:grid-cols-[64px_1.3fr_1.3fr_1fr_100px_90px] md:items-center"
                    >
                      <div className="h-11 w-11 rounded-full bg-white" />
                      <div className="h-4 rounded-full bg-white/40" />
                      <div className="h-4 rounded-full bg-white/40" />
                      <div className="h-4 rounded-full bg-white/40" />
                      <div className="h-5 rounded-full bg-[#bdf0a4]" />
                      <div className="h-5 rounded-full bg-white" />
                    </div>
                  ))
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <div
                      key={getStudentId(student, index)}
                      className="grid gap-4 px-3 py-4 text-sm font-black md:grid-cols-[64px_1.3fr_1.3fr_1fr_100px_90px] md:items-center"
                    >
                      <div className="h-11 w-11 rounded-full bg-white" />

                      <div className="text-white">
                        {getStudentName(student)}
                      </div>

                      <div className="break-words text-white/90">
                        {getStudentEmail(student)}
                      </div>

                      <div className="text-white/90">
                        {getStudentCourse(student)}
                      </div>

                      <div>
                        <span className="inline-flex min-w-[84px] justify-center rounded-full bg-[#bdf0a4] px-3 py-1 text-[10px] font-black text-[#2d5038]">
                          {getStudentStatus(student)}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled
                        className="inline-flex min-w-[84px] cursor-not-allowed justify-center rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#2d5038] opacity-95"
                        title="Connect this button to your remove trainee endpoint if needed."
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center text-sm font-bold text-white/80">
                    No enrolled trainees found.
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
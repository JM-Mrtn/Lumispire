import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Enrollments", path: "/training-admin-enrollments", key: "enrollments" },
  { label: "Courses", path: "/training-admin-courses", key: "courses" },
  { label: "Competencies", path: "/training-admin-roadmap", key: "roadmap" },
  { label: "Batches", path: "/training-admin-batches", key: "batches" },
  { label: "Professors", path: "/training-admin-professors", key: "professors" },
  { label: "Register RFID", path: "/training-admin-register-rfid", key: "rfid" },
];

function getStoredAdmin() {
  try {
    return JSON.parse(localStorage.getItem("trainingAdminUser") || "null");
  } catch {
    return null;
  }
}

export default function TrainingAdminLayout({
  active = "enrollments",
  title = "Training Admin",
  subtitle = "",
  children,
  maxWidth = "max-w-[1040px]",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = getStoredAdmin();

  const adminName =
    admin?.name ||
    `${admin?.firstName || ""} ${admin?.lastName || ""}`.trim() ||
    admin?.username ||
    "Training Admin";

  const adminEmail = admin?.email || "admin@tamsi.com";

  function handleLogout() {
    localStorage.removeItem("trainingAdminToken");
    localStorage.removeItem("trainingAdminUser");
    navigate("/training-admin-login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#12391f] font-sans text-white">
      <header className="flex h-[88px] items-center bg-white px-6 shadow-sm md:px-10">
        <Link to="/training" className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#2d5238] bg-white text-sm font-black text-[#2d5238]">
            LC
          </div>
          <h1 className="text-xl font-black uppercase tracking-wide text-[#2d5238] md:text-3xl">
            Training &amp; Assessment
          </h1>
        </Link>
      </header>

      <div className="flex min-h-[calc(100vh-88px)] flex-col lg:flex-row">
        <aside className="flex w-full flex-col bg-[#2d5038] lg:w-[267px]">
          <div className="border-b border-white/15 px-6 py-8 text-center">
            <div className="mx-auto h-[76px] w-[76px] rounded-full border-4 border-[#b7bbb6] bg-white shadow-sm" />
            <h2 className="mt-5 text-base font-black uppercase leading-tight">
              {adminName}
            </h2>
            <p className="mt-1 break-words text-xs font-semibold text-white/80">
              {adminEmail}
            </p>
          </div>

          <nav className="flex-1 py-6">
            {NAV_ITEMS.map((item) => {
              const selected = active === item.key || location.pathname === item.path;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`block w-full px-11 py-4 text-left text-sm font-black uppercase transition ${
                    selected
                      ? "bg-[#d8e0da] text-[#1e3e2a]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="px-20 pb-10">
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
          <section className={`mx-auto ${maxWidth}`}>
            <div className="mb-7">
              <h2 className="text-3xl font-black uppercase tracking-tight md:text-[34px]">
                {title}
              </h2>
              <div className="mt-1 h-1 w-full max-w-[560px] bg-white/60" />
              {subtitle ? (
                <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/75">
                  {subtitle}
                </p>
              ) : null}
            </div>
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}

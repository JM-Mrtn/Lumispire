import { NavLink, useNavigate } from "react-router-dom";

function getProfessorUser() {
  try {
    return JSON.parse(localStorage.getItem("professorUser") || "null");
  } catch {
    return null;
  }
}

function clearProfessorSession() {
  localStorage.removeItem("professorToken");
  localStorage.removeItem("professorUser");
}

const navBase = "block rounded-xl px-4 py-3 text-sm font-semibold transition";
const navIdle = "text-[#395345] hover:bg-[#e8ece1]";
const navActive = "bg-[#395345] text-white shadow-sm";

export default function ProfessorLayout({ title, subtitle, children }) {
  const navigate = useNavigate();
  const professor = getProfessorUser();

  const handleSignOut = () => {
    clearProfessorSession();
    navigate("/professor-login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#cfd3c5] text-[#395345]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col lg:flex-row">
        <aside className="w-full border-b border-black/5 bg-[#f7f8f3] p-5 lg:min-h-screen lg:w-[290px] lg:border-b-0 lg:border-r">
          <button
            onClick={() => navigate("/professor")}
            className="flex items-center gap-3"
          >
            <img
              src="/TAMSILogoTransparent.png"
              alt="TAMSI Logo"
              className="h-11 w-11 rounded-full border border-[#c8ccbf] object-cover"
            />
            <div className="text-left">
              <div className="font-['Montserrat',sans-serif] text-[28px] font-extrabold leading-none text-[#395345]">
                TAMSI
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f7c71]">
                Professor Side
              </div>
            </div>
          </button>

          <div className="mt-6 rounded-2xl bg-[#eef1e7] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b887d]">
              Signed in as
            </div>
            <div className="mt-2 text-base font-bold text-[#395345]">
              {professor?.name ||
                `${professor?.firstName || ""} ${professor?.lastName || ""}`.trim() ||
                "Professor"}
            </div>
            <div className="text-sm text-[#5d6b61]">
              {professor?.email || "-"}
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            <NavLink
              to="/professor-dashboard"
              className={({ isActive }) =>
                `${navBase} ${isActive ? navActive : navIdle}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/professor-batches"
              className={({ isActive }) =>
                `${navBase} ${isActive ? navActive : navIdle}`
              }
            >
              Batch Records
            </NavLink>

            <NavLink
              to="/professor-attendance"
              className={({ isActive }) =>
                `${navBase} ${isActive ? navActive : navIdle}`
              }
            >
              Attendance Management
            </NavLink>

            <NavLink
              to="/professor-progress"
              className={({ isActive }) =>
                `${navBase} ${isActive ? navActive : navIdle}`
              }
            >
              Progress Management
            </NavLink>

            <NavLink
              to="/professor-assessments"
              className={({ isActive }) =>
                `${navBase} ${isActive ? navActive : navIdle}`
              }
            >
              Assessments Management
            </NavLink>

            <NavLink
              to="/professor-modules"
              className={({ isActive }) =>
                `${navBase} ${isActive ? navActive : navIdle}`
              }
            >
              Modules Management
            </NavLink>
          </nav>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate("/training")}
              className="w-full rounded-xl border border-[#c7d0bf] bg-white px-4 py-3 text-sm font-semibold text-[#395345] transition hover:bg-[#f2f5ee]"
            >
              Back to Training
            </button>

            <button
              onClick={handleSignOut}
              className="w-full rounded-xl bg-[#395345] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2f463a]"
            >
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="rounded-[28px] bg-[#f7f8f3] p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="mb-6">
              <h1 className="font-['Montserrat',sans-serif] text-3xl font-extrabold text-[#395345]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-sm text-[#647166]">{subtitle}</p>
              ) : null}
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
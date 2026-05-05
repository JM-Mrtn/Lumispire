// src/TrainingAndAssessment/TraineeHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildTrainingFileUrl } from "./trainingFileUrl";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";

  const r = String(raw).replace(/\/+$/, "");

  if (r.endsWith("/api/hotel")) {
    return r.replace(/\/api\/hotel$/i, "/api");
  }

  if (r.endsWith("/api")) return r;

  if (r.includes("/api/")) {
    return r.replace(/\/api\/hotel.*$/i, "/api");
  }

  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const API_ORIGIN = API_BASE.replace(/\/api$/i, "");

function getToken() {
  return localStorage.getItem("trainingToken") || "";
}

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 180) || "Invalid server response.");
  }
}

function normalizeSlashes(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/");
}

function getObjectIdString(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    if (value.$oid) return String(value.$oid);

    if (value.toString && value.toString() !== "[object Object]") {
      return String(value.toString());
    }
  }

  return "";
}

function getFilePath(file) {
  if (!file) return "";

  if (typeof file === "string") {
    return normalizeSlashes(file);
  }

  if (typeof file === "object") {
    return normalizeSlashes(
      file.filePath ||
        file.path ||
        file.url ||
        file.secure_url ||
        file.location ||
        file.file ||
        ""
    );
  }

  return "";
}

function getFileId(file) {
  if (!file || typeof file !== "object") return "";
  return getObjectIdString(file.fileId);
}

function buildFileUrl(file) {
  const fileId = getFileId(file);

  if (fileId) {
    return buildTrainingFileUrl(fileId);
  }

  const filePath = getFilePath(file);

  if (!filePath) return "";

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const fileIdMatch = filePath.match(/(?:^|\/)api\/training-files\/([^/?#]+)/i);

  if (fileIdMatch?.[1]) {
    return buildTrainingFileUrl(fileIdMatch[1]);
  }

  return `${API_ORIGIN}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
}

const TraineeHome = () => {
  const navigate = useNavigate();
  const token = useMemo(() => getToken(), []);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trainingUser") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        navigate("/trainee-login", { replace: true });
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/training/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await readJsonSafe(res);

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("trainingToken");
          localStorage.removeItem("trainingUser");
          localStorage.removeItem("trainingPretestState");
          navigate("/trainee-login", { replace: true });
          return;
        }

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load profile.");
        }

        const fetchedUser = data?.user || null;

        if (fetchedUser) {
          setUser(fetchedUser);
          localStorage.setItem("trainingUser", JSON.stringify(fetchedUser));
        }
      } catch (error) {
        console.error("Failed to load trainee profile:", error);
      }
    };

    loadProfile();
  }, [token, navigate]);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const goToProfile = () => {
    const savedToken = localStorage.getItem("trainingToken");
    goTo(savedToken ? "/trainee-profile" : "/trainee-login");
  };

  const profilePhotoUrl = buildFileUrl(user?.profilePhoto);

  const quickCards = [
    {
      title: "Roadmap",
      action: "View",
      route: "/trainee-roadmap",
    },
    {
      title: "Attendance",
      action: "Submit",
      route: "/trainee-attendance",
    },
    {
      title: "Modules",
      action: "View",
      route: "/trainee-modules",
    },
    {
      title: "Assignment",
      action: "Answer",
      route: "/trainee-assignment",
    },
    {
      title: "Progress",
      action: "View",
      route: "/trainee-progress",
    },
  ];

  return (
    <div className="min-h-screen bg-[#123a20] text-[#395345]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#d7ddcf] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => goTo("/trainee-home")}
            className="flex items-center gap-3"
            aria-label="TAMSI Home"
          >
            <img
              src="/TAMSILogoTransparent.png"
              alt="TAMSI Logo"
              className="h-12 w-12 object-contain"
            />

            <span className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b] sm:text-[28px]">
              TAMSI
            </span>
          </button>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
            <button
              type="button"
              onClick={() => goTo("/trainee-home")}
              className="border-b-2 border-[#45674b] pb-1 text-[11px] font-bold uppercase tracking-wide text-[#173d25] xl:text-[12px]"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-roadmap")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Roadmap
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-attendance")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Attendance
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-modules")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Modules
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-assignment")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Assignment
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-progress")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Progress
            </button>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={goToProfile}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Profile
            </button>

            <button
              type="button"
              onClick={goToProfile}
              className="h-10 w-10 overflow-hidden rounded-full bg-[#d8d8d8] ring-2 ring-[#45674b]/20"
              aria-label="Profile"
            >
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/80x80/d7ddd4/45674b?text=P";
                  }}
                />
              ) : (
                <img
                  src="https://placehold.co/80x80/d7ddd4/45674b?text=P"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-md border border-[#45674b]/20 bg-[#f7faf2] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#45674b] lg:hidden"
          >
            Menu
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#d7ddcf] bg-white px-5 py-3 lg:hidden">
            <div className="space-y-1 rounded-xl bg-[#f4f7ef] p-2">
              <button
                type="button"
                onClick={() => goTo("/trainee-home")}
                className="block w-full rounded-lg bg-white px-4 py-3 text-left text-sm font-bold text-[#173d25]"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-roadmap")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Roadmap
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-attendance")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Attendance
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-modules")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Modules
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-assignment")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Assignment
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-progress")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Progress
              </button>

              <button
                type="button"
                onClick={goToProfile}
                className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                <span>Profile</span>

                <span className="h-8 w-8 overflow-hidden rounded-full bg-[#d8d8d8]">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/80x80/d7ddd4/45674b?text=P";
                      }}
                    />
                  ) : (
                    <img
                      src="https://placehold.co/80x80/d7ddd4/45674b?text=P"
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* BANNER IMAGE */}
        <section className="h-[180px] overflow-hidden bg-[#cad1c5] sm:h-[230px] md:h-[290px]">
          <img
            src="/tamsi-building.jpg"
            alt="TAMSI Building"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/1600x420/d7ddd4/45674b?text=TAMSI+Training+And+Assessment";
            }}
          />
        </section>

        {/* TITLE SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#486b4b] via-[#123a20] to-[#123a20] px-5 py-10 text-white sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute left-8 top-7 opacity-35">
            <span className="absolute left-0 top-0 h-11 w-11 rounded-full bg-[#a8c39f]" />
            <span className="absolute left-7 top-3 h-12 w-12 rounded-full bg-[#a8c39f]" />
            <span className="absolute left-0 top-16 h-9 w-9 rounded-full bg-[#a8c39f]" />
          </div>

          <div className="pointer-events-none absolute right-20 top-7 opacity-35">
            <span className="absolute left-0 top-0 h-12 w-12 rounded-full bg-[#a8c39f]" />
            <span className="absolute left-7 top-9 h-14 w-14 rounded-full bg-[#a8c39f]" />
            <span className="absolute left-20 top-20 h-8 w-8 rounded-full bg-[#a8c39f]" />
          </div>

          <div className="relative mx-auto max-w-[1280px]">
            <h1 className="text-center font-['Montserrat',sans-serif] text-3xl font-extrabold drop-shadow-md sm:text-4xl md:text-5xl">
              Welcome to Training &amp; Assessment
            </h1>

            <div className="mx-auto mt-4 h-[3px] max-w-[760px] rounded-full bg-white/45" />
          </div>
        </section>

        {/* QUICK CARDS */}
        <section className="bg-[#2e5038] px-5 py-12 text-white sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-[1250px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {quickCards.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => goTo(item.route)}
                className="group mx-auto flex w-full max-w-[205px] flex-col items-center rounded-lg bg-white px-5 py-7 text-center shadow-xl transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              >
                <PaperIcon />

                <h2 className="mt-3 font-['Montserrat',sans-serif] text-[19px] font-extrabold text-[#45674b]">
                  {item.title}
                </h2>

                <span className="mt-6 flex h-[32px] w-full max-w-[150px] items-center justify-center rounded-full border-[3px] border-[#45674b] bg-white font-['Montserrat',sans-serif] text-[12px] font-extrabold uppercase text-[#45674b] transition group-hover:bg-[#45674b] group-hover:text-white">
                  {item.action}
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* SMALLER FOOTER */}
      <footer className="bg-white text-[#4d6f55]">
        <div className="mx-auto max-w-[1440px] px-5 py-3 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.05fr_1.05fr_1.3fr_1fr_0.65fr]">
            <div className="border-[#d6ded2] md:border-r md:pr-5">
              <div className="flex items-center gap-3">
                <img
                  src="/LTCLogo.png"
                  alt="Lumispire Logo"
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/80x80/ffffff/4d6f55?text=L";
                  }}
                />

                <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b]">
                  LUMISPIRE
                </h2>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">Menu</h3>

              <div className="mt-1 grid grid-cols-2 gap-x-5 gap-y-0.5 text-[11px] font-semibold text-[#6b776d]">
                <button
                  type="button"
                  onClick={() => goTo("/trainee-home")}
                  className="text-left hover:text-[#173d25]"
                >
                  Home
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-roadmap")}
                  className="text-left hover:text-[#173d25]"
                >
                  Roadmap
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-attendance")}
                  className="text-left hover:text-[#173d25]"
                >
                  Attendance
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-modules")}
                  className="text-left hover:text-[#173d25]"
                >
                  Modules
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-assignment")}
                  className="text-left hover:text-[#173d25]"
                >
                  Assignment
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-progress")}
                  className="text-left hover:text-[#173d25]"
                >
                  Progress
                </button>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Contact Information
              </h3>

              <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
                <p>ltc.tamsi@gmail.com</p>
                <p>lorengladis@ltcmultiservices.com</p>
                <p>0995906805 / 09516281271</p>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">Address</h3>

              <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
                <p>2/F 5441 Currie Street,</p>
                <p>Palanan, Makati City</p>
              </div>
            </div>

            <div className="md:pl-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Follow Us
              </h3>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-1 border-t border-[#d6ded2] pt-2 text-[9px] font-bold text-[#7b897e] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function PaperIcon() {
  return (
    <svg
      viewBox="0 0 90 90"
      className="h-20 w-20 text-[#8a936e]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28 18H58L68 28V68C68 70.2 66.2 72 64 72H28C25.8 72 24 70.2 24 68V22C24 19.8 25.8 18 28 18Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M58 18V29H68"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M19 25H53L61 33V75"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.75"
      />

      <path
        d="M34 36H55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M34 46H55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M34 56H50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M29 36L31 38L34 34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M29 46L31 48L34 44"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M29 56L31 58L34 54"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default TraineeHome;
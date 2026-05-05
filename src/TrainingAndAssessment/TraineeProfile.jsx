// src/TrainingAndAssessment/TraineeProfile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearTrainingSession,
  isTrainingAuthResponse,
  redirectToTraineeLogin,
} from "./trainingSession";
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

function getFullName(user) {
  const direct =
    user?.fullName ||
    user?.name ||
    user?.traineeName ||
    user?.studentName ||
    "";

  if (direct) return direct;

  return [user?.firstName, user?.middleName, user?.lastName]
    .filter(Boolean)
    .join(" ");
}

function getPhoneNumber(user, enrollment) {
  return (
    user?.phoneNumber ||
    user?.phone ||
    user?.contactNumber ||
    enrollment?.phoneNumber ||
    enrollment?.phone ||
    "—"
  );
}

export default function TraineeProfile() {
  const navigate = useNavigate();
  const token = useMemo(() => getToken(), []);
  const fileInputRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trainingUser") || "null");
    } catch {
      return null;
    }
  });
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchProfile = async () => {
    setMsg({ type: "", text: "" });

    if (!token) {
      redirectToTraineeLogin(navigate);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/training/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Failed to load profile.");
      }

      const fetchedUser = data?.user || null;
      const fetchedEnrollment = data?.enrollment || null;

      setUser(fetchedUser);
      setEnrollment(fetchedEnrollment);

      if (fetchedUser) {
        localStorage.setItem("trainingUser", JSON.stringify(fetchedUser));
      }
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to load profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const logout = () => {
    clearTrainingSession();
    navigate("/trainee-login", { replace: true });
  };

  const fullName = getFullName(user) || "Trainee Full Name";
  const profilePhotoUrl = buildFileUrl(user?.profilePhoto);

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    if (!token) {
      e.target.value = "";
      redirectToTraineeLogin(navigate);
      return;
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      setMsg({
        type: "error",
        text: "Only JPG, JPEG, PNG, and WEBP files are allowed.",
      });
      e.target.value = "";
      return;
    }

    try {
      setUploadingPhoto(true);
      setMsg({ type: "", text: "" });

      const formData = new FormData();
      formData.append("profilePhoto", file);

      const res = await fetch(`${API_BASE}/training/profile/photo`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Failed to upload profile photo.");
      }

      const nextUser = data?.user || null;

      if (nextUser) {
        setUser(nextUser);
        localStorage.setItem("trainingUser", JSON.stringify(nextUser));
      }

      setMsg({
        type: "success",
        text: data?.message || "Profile photo uploaded successfully.",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to upload profile photo.",
      });
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

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
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/80x80/d7ddd4/45674b?text=T";
              }}
            />

            <span className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b] sm:text-[28px]">
              TAMSI
            </span>
          </button>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
            <NavButton label="Home" onClick={() => goTo("/trainee-home")} />
            <NavButton
              label="Roadmap"
              onClick={() => goTo("/trainee-roadmap")}
            />
            <NavButton
              label="Attendance"
              onClick={() => goTo("/trainee-attendance")}
            />
            <NavButton
              label="Modules"
              onClick={() => goTo("/trainee-modules")}
            />
            <NavButton
              label="Assignment"
              onClick={() => goTo("/trainee-assignment")}
            />
            <NavButton
              label="Progress"
              onClick={() => goTo("/trainee-progress")}
            />
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => goTo("/trainee-profile")}
              className="border-b-2 border-[#45674b] pb-1 text-[11px] font-bold uppercase tracking-wide text-[#173d25] xl:text-[12px]"
            >
              Profile
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-profile")}
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
              <MobileNavButton
                label="Home"
                onClick={() => goTo("/trainee-home")}
              />
              <MobileNavButton
                label="Roadmap"
                onClick={() => goTo("/trainee-roadmap")}
              />
              <MobileNavButton
                label="Attendance"
                onClick={() => goTo("/trainee-attendance")}
              />
              <MobileNavButton
                label="Modules"
                onClick={() => goTo("/trainee-modules")}
              />
              <MobileNavButton
                label="Assignment"
                onClick={() => goTo("/trainee-assignment")}
              />
              <MobileNavButton
                label="Progress"
                onClick={() => goTo("/trainee-progress")}
              />
              <MobileNavButton
                label="Profile"
                active
                onClick={() => goTo("/trainee-profile")}
              />
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

        {/* PAGE TITLE */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#486b4b] via-[#123a20] to-[#123a20] px-5 py-9 text-white sm:px-8 lg:px-12">
          <DecorativeCircles position="left" />
          <DecorativeCircles position="right" />

          <div className="relative mx-auto max-w-[1280px] text-center">
            <h1 className="font-['Montserrat',sans-serif] text-3xl font-extrabold drop-shadow-md sm:text-4xl">
              My Profile
            </h1>

            <div className="mx-auto mt-3 h-[3px] max-w-[360px] rounded-full bg-white/45" />
          </div>
        </section>

        {/* MESSAGE */}
        <section className="bg-[#2e5038] px-5 pt-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1280px]">
            {msg.text ? (
              <div
                className={[
                  "rounded-xl px-4 py-3 text-sm font-semibold",
                  msg.type === "success"
                    ? "bg-green-50 text-green-800 ring-1 ring-green-200"
                    : "bg-red-50 text-red-800 ring-1 ring-red-200",
                ].join(" ")}
              >
                {msg.text}
              </div>
            ) : null}
          </div>
        </section>

        {/* PROFILE BODY */}
        <section className="bg-[#2e5038] px-5 py-10 text-white sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-none bg-[#2e5038] shadow-xl ring-1 ring-white/10 lg:grid lg:grid-cols-[0.85fr_1.35fr]">
            {/* LEFT PANEL */}
            <div className="flex flex-col items-center justify-center bg-[#3c7648] px-6 py-10 text-center">
              <div className="h-[150px] w-[150px] overflow-hidden rounded-full bg-white ring-4 ring-white/20 sm:h-[170px] sm:w-[170px]">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/240x240/ffffff/45674b?text=P";
                    }}
                  />
                ) : (
                  <img
                    src="https://placehold.co/240x240/ffffff/45674b?text=P"
                    alt="Profile placeholder"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />

              <h2 className="mt-8 font-['Montserrat',sans-serif] text-2xl font-extrabold uppercase leading-tight text-white sm:text-3xl">
                {fullName}
              </h2>

              <p className="mt-2 text-sm font-semibold text-white/85">
                {user?.email || "traineeemail@tamsi.com"}
              </p>

              <button
                type="button"
                onClick={handleChoosePhoto}
                disabled={uploadingPhoto}
                className="mt-7 h-10 min-w-[230px] rounded-full bg-white px-7 text-xs font-extrabold uppercase tracking-wide text-[#45674b] transition hover:bg-[#eef1e7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingPhoto ? "Uploading..." : "Upload Photo"}
              </button>
            </div>

            {/* RIGHT PANEL */}
            <div className="bg-[#2e5038] px-6 py-10 sm:px-10">
              {loading ? (
                <div className="rounded-2xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl">
                  Loading profile...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-y-9 md:grid-cols-3 md:gap-x-8">
                    <ProfileInfo
                      title="Your Name"
                      label="First name"
                      value={user?.firstName || "—"}
                    />

                    <ProfileInfo
                      title="Your Name"
                      label="Last name"
                      value={user?.lastName || "—"}
                      withDivider
                    />

                    <ProfileInfo
                      title="Your Name"
                      label="Middle name"
                      value={user?.middleName || "—"}
                      withDivider
                    />

                    <ProfileInfo
                      title="Your Email"
                      label="Email Address"
                      value={user?.email || "—"}
                    />

                    <ProfileInfo
                      title="Your Number"
                      label="Contact Number"
                      value={getPhoneNumber(user, enrollment)}
                      withDivider
                    />

                    <ProfileInfo
                      title="Your Course"
                      label="Course"
                      value={user?.course || enrollment?.course || "—"}
                      withDivider
                    />
                  </div>

                  <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => goTo("/training-change-password")}
                      className="h-11 rounded-full border-[3px] border-white bg-transparent px-5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-white hover:text-[#45674b]"
                    >
                      Change Password
                    </button>

                    <button
                      type="button"
                      onClick={() => goTo("/trainee-certificate")}
                      className="h-11 rounded-full bg-white px-5 text-xs font-extrabold uppercase tracking-wide text-[#45674b] transition hover:bg-[#eef1e7]"
                    >
                      Certificate
                    </button>

                    <button
                      type="button"
                      onClick={logout}
                      className="h-11 rounded-full bg-white px-5 text-xs font-extrabold uppercase tracking-wide text-[#45674b] transition hover:bg-[#eef1e7]"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <div className="h-[55px] bg-[#123a20]" />
      </main>

      {/* SMALL FOOTER */}
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
                <FooterButton label="Home" onClick={() => goTo("/trainee-home")} />
                <FooterButton
                  label="Roadmap"
                  onClick={() => goTo("/trainee-roadmap")}
                />
                <FooterButton
                  label="Attendance"
                  onClick={() => goTo("/trainee-attendance")}
                />
                <FooterButton
                  label="Modules"
                  onClick={() => goTo("/trainee-modules")}
                />
                <FooterButton
                  label="Assignment"
                  onClick={() => goTo("/trainee-assignment")}
                />
                <FooterButton
                  label="Progress"
                  onClick={() => goTo("/trainee-progress")}
                />
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
                <p>2/F 5441 Curie Street,</p>
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
}

function NavButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
    >
      {label}
    </button>
  );
}

function MobileNavButton({ label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "block w-full rounded-lg px-4 py-3 text-left text-sm",
        active
          ? "bg-white font-bold text-[#173d25]"
          : "font-semibold text-[#45674b] hover:bg-white",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function FooterButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left hover:text-[#173d25]"
    >
      {label}
    </button>
  );
}

function ProfileInfo({ title, label, value, withDivider = false }) {
  return (
    <div className={`relative text-center ${withDivider ? "md:pl-7" : ""}`}>
      {withDivider ? (
        <div className="absolute left-0 top-0 hidden h-full w-[3px] rounded-full bg-white/15 md:block" />
      ) : null}

      <h3 className="font-['Montserrat',sans-serif] text-lg font-extrabold leading-tight text-white">
        {title}
      </h3>

      <p className="text-xs font-extrabold text-white/90">{label}</p>

      <p className="mt-3 break-words text-sm font-semibold text-white/80">
        {value || "—"}
      </p>
    </div>
  );
}

function DecorativeCircles({ position }) {
  const isLeft = position === "left";

  return (
    <div
      className={[
        "pointer-events-none absolute top-6 opacity-35",
        isLeft ? "left-8" : "right-20",
      ].join(" ")}
    >
      <span className="absolute left-0 top-0 h-11 w-11 rounded-full bg-[#a8c39f]" />
      <span className="absolute left-7 top-3 h-12 w-12 rounded-full bg-[#a8c39f]" />
      <span className="absolute left-0 top-16 h-9 w-9 rounded-full bg-[#a8c39f]" />
    </div>
  );
}
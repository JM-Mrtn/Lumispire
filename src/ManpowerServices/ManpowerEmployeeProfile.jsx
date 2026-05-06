import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGO_IMAGE = "/ManpowerLogo.png";
const HERO_IMAGE = "/ManpowerBanner.png";

const EMPLOYEE_HOME_ROUTE = "/manpower-employee-home";
const EMPLOYEE_PAYROLL_ROUTE = "/manpower-employee-payroll";
const EMPLOYEE_LEAVE_ROUTE = "/manpower-employee-leave";
const EMPLOYEE_PROFILE_ROUTE = "/manpower-employee-profile";
const EMPLOYEE_LOGIN_ROUTE = "/manpower-employee-login";
const EMPLOYEE_CHANGE_PASSWORD_ROUTE = "/manpower-employee-change-password";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

function getEmployeeToken() {
  return localStorage.getItem("manpowerEmployeeToken") || "";
}

function getEmployeeUser() {
  try {
    return JSON.parse(localStorage.getItem("manpowerEmployeeUser") || "null");
  } catch {
    return null;
  }
}

function saveEmployeeSession(token, employee) {
  localStorage.setItem("manpowerEmployeeToken", token);
  localStorage.setItem("manpowerEmployeeUser", JSON.stringify(employee || null));
}

function clearEmployeeSession() {
  localStorage.removeItem("manpowerEmployeeToken");
  localStorage.removeItem("manpowerEmployeeUser");
}

function HeaderNavLink({ to, children, active = false, onClick }) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`relative pb-1 transition hover:text-[#6f8a66] ${
          active
            ? "text-[#315b42] after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[#315b42]"
            : "text-[#405549]"
        }`}
      >
        {children}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`relative pb-1 transition hover:text-[#6f8a66] ${
        active
          ? "text-[#315b42] after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[#315b42]"
          : "text-[#405549]"
      }`}
    >
      {children}
    </Link>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div className="border-[#d8ded5] md:border-l md:pl-5">
      <h4 className="text-[14px] font-black text-[#315b42]">{title}</h4>
      <div className="mt-2 space-y-1 text-[11px] font-semibold leading-snug text-[#496252]">
        {children}
      </div>
    </div>
  );
}

function ProfileInfoBlock({ value, label }) {
  return (
    <div className="text-center">
      <h3 className="text-[17px] font-black leading-tight text-white sm:text-[18px]">
        {value || "-"}
      </h3>

      <p className="mt-1 text-[11px] font-black leading-tight text-white">
        {label}
      </p>
    </div>
  );
}

export default function ManpowerEmployeeProfile() {
  const navigate = useNavigate();
  const photoObjectUrlRef = useRef("");

  const [token, setToken] = useState(getEmployeeToken());
  const [employee, setEmployee] = useState(getEmployeeUser());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoState, setPhotoState] = useState({
    loading: false,
    success: "",
    error: "",
  });

  const fullName = useMemo(() => {
    return [
      employee?.firstName || "",
      employee?.middleName || "",
      employee?.lastName || "",
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }, [employee]);

  const firstName = employee?.firstName || "Your Name";
  const lastName = employee?.lastName || "Your Name";
  const middleName = employee?.middleName || "Your Name";

  const displayName = fullName || "Employee Full Name";
  const displayEmail =
    employee?.companyEmail || employee?.email || "employeeemail@manpower.com";

  const contactNumber =
    employee?.contactNo || employee?.phoneNumber || "Your Number";

  const statusLabel =
    employee?.active === false ? "Inactive Employee" : "Active Employee";

  const profileInitial = (employee?.firstName || employee?.lastName || "E")
    .charAt(0)
    .toUpperCase();

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  function logout() {
    clearEmployeeSession();
    setToken("");
    setEmployee(null);
    navigate(EMPLOYEE_LOGIN_ROUTE, { replace: true });
  }

  function revokePhotoUrl() {
    if (photoObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(photoObjectUrlRef.current);
      } catch {
        // ignore cleanup error
      }

      photoObjectUrlRef.current = "";
    }
  }

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load employee profile.");
      }

      const nextEmployee = data?.employee || null;

      setEmployee(nextEmployee);
      saveEmployeeSession(token, nextEmployee);
    } catch (err) {
      setError(err?.message || "Failed to load employee profile.");
    } finally {
      setLoading(false);
    }
  }

  async function loadProfilePhoto() {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/profile-photo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        revokePhotoUrl();
        setPhotoUrl("");
        return;
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      revokePhotoUrl();

      photoObjectUrlRef.current = objectUrl;
      setPhotoUrl(objectUrl);
    } catch {
      revokePhotoUrl();
      setPhotoUrl("");
    }
  }

  useEffect(() => {
    if (!token) {
      navigate(EMPLOYEE_LOGIN_ROUTE, { replace: true });
      return;
    }

    loadProfile();
    loadProfilePhoto();

    return () => {
      revokePhotoUrl();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  async function handlePhotoUpload(event) {
    const file = event.target.files?.[0] || null;

    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowed.includes(String(file.type || "").toLowerCase())) {
      setPhotoState({
        loading: false,
        success: "",
        error: "Please upload JPG, JPEG, PNG, or WEBP only.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("profilePhoto", file);

    setPhotoState({
      loading: true,
      success: "",
      error: "",
    });

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/profile-photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to upload profile photo.");
      }

      const updatedEmployee = data?.employee || employee;

      setEmployee(updatedEmployee);
      saveEmployeeSession(token, updatedEmployee);

      await loadProfilePhoto();

      setPhotoState({
        loading: false,
        success: data?.message || "Profile photo uploaded successfully.",
        error: "",
      });
    } catch (err) {
      setPhotoState({
        loading: false,
        success: "",
        error: err?.message || "Failed to upload profile photo.",
      });
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-[#0f3a1e] font-sans text-[#24372d]">
      <header className="sticky top-0 z-50 border-b border-[#d5ddd2] bg-[#f7f9f5]/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={EMPLOYEE_HOME_ROUTE} className="flex items-center gap-3">
            <img
              src={LOGO_IMAGE}
              alt="Manpower Logo"
              className="h-12 w-12 shrink-0 rounded-full object-contain"
            />

            <span className="text-[24px] font-black tracking-wide text-[#315b42] sm:text-[28px]">
              MANPOWER
            </span>
          </Link>

          <nav className="hidden items-center gap-9 text-[12px] font-black uppercase tracking-wide lg:flex">
            <HeaderNavLink to={EMPLOYEE_HOME_ROUTE}>Home</HeaderNavLink>

            <HeaderNavLink to={EMPLOYEE_PAYROLL_ROUTE}>
              Payroll
            </HeaderNavLink>

            <HeaderNavLink to={EMPLOYEE_LEAVE_ROUTE}>Leave</HeaderNavLink>

            <HeaderNavLink to={EMPLOYEE_PROFILE_ROUTE} active>
              Profile
            </HeaderNavLink>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={logout}
              className="hidden rounded-full bg-[#315b42] px-5 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#254934] lg:inline-flex"
            >
              Logout
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="rounded-md border border-[#cfd6ca] px-3 py-2 text-xs font-black uppercase tracking-wide text-[#405549] lg:hidden"
            >
              Menu
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#dde2db] bg-[#f7f9f5] lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 text-sm font-bold text-[#405549] sm:px-6">
              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_HOME_ROUTE)}
                className="py-2 text-left"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_PAYROLL_ROUTE)}
                className="py-2 text-left"
              >
                Payroll
              </button>

              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_LEAVE_ROUTE)}
                className="py-2 text-left"
              >
                Leave
              </button>

              <button
                type="button"
                onClick={() => goTo(EMPLOYEE_PROFILE_ROUTE)}
                className="py-2 text-left text-[#315b42] underline underline-offset-4"
              >
                Profile
              </button>

              <button
                type="button"
                onClick={logout}
                className="py-2 text-left text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section
          className="relative flex min-h-[300px] items-center justify-center bg-[#526b5a] bg-cover bg-center px-4 text-center sm:min-h-[360px] md:min-h-[430px] lg:min-h-[500px]"
          style={{
            backgroundImage: `url(${HERO_IMAGE})`,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 mx-auto max-w-5xl">
            <h1 className="text-[32px] font-black leading-tight text-white drop-shadow-lg sm:text-[42px] md:text-[54px]">
              My Profile
            </h1>

            <div className="mx-auto mt-5 h-[3px] w-[280px] max-w-[80%] bg-white/60" />

            <p className="mx-auto mt-5 max-w-3xl text-[14px] font-semibold leading-relaxed text-white/95 sm:text-[16px] md:text-[18px]">
              View your employee information, upload your profile photo, and
              manage your account settings.
            </p>
          </div>
        </section>

        <section className="bg-[#294f35]">
          <div className="mx-auto max-w-7xl">
            {loading && (
              <div className="px-4 py-10 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white px-5 py-8 text-center text-[13px] font-semibold text-[#52695a]">
                  Loading employee profile...
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="px-4 py-10 sm:px-6 lg:px-8">
                <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-[13px] font-semibold text-red-700">
                  {error}
                </div>
              </div>
            )}

            {!loading && !error && (
              <div className="grid lg:grid-cols-[0.95fr_1.55fr]">
                <aside className="flex flex-col items-center justify-center bg-[#37764b] px-6 py-10 text-center text-white lg:min-h-[285px]">
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white text-[44px] font-black text-[#315b42]">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Employee profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      profileInitial
                    )}
                  </div>

                  <h2 className="mt-6 text-[24px] font-black uppercase leading-tight sm:text-[26px]">
                    {displayName}
                  </h2>

                  <p className="mt-1 max-w-full break-all text-[14px] font-semibold text-white/95">
                    {displayEmail}
                  </p>

                  <label className="mt-5 inline-flex min-w-[210px] cursor-pointer items-center justify-center rounded-full bg-white px-6 py-2 text-[12px] font-black uppercase tracking-wide text-[#315b42] transition hover:bg-[#e7eee3]">
                    {photoState.loading ? "Uploading..." : "Upload Photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      disabled={photoState.loading}
                      className="hidden"
                    />
                  </label>

                  {photoState.success && (
                    <p className="mt-3 text-[12px] font-bold text-white">
                      {photoState.success}
                    </p>
                  )}

                  {photoState.error && (
                    <p className="mt-3 text-[12px] font-bold text-red-100">
                      {photoState.error}
                    </p>
                  )}
                </aside>

                <section className="bg-[#294f35] px-6 py-9 text-white sm:px-8 lg:px-12">
                  <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:border-r md:border-white/20 md:pr-8">
                      <ProfileInfoBlock value={firstName} label="First name" />

                      <div className="mt-10">
                        <ProfileInfoBlock
                          value={displayEmail}
                          label="Email Address"
                        />
                      </div>
                    </div>

                    <div className="md:border-r md:border-white/20 md:px-8">
                      <ProfileInfoBlock value={lastName} label="Last name" />

                      <div className="mt-10">
                        <ProfileInfoBlock
                          value={contactNumber}
                          label="Contact Number"
                        />
                      </div>
                    </div>

                    <div className="md:pl-8">
                      <ProfileInfoBlock
                        value={middleName}
                        label="Middle name"
                      />

                      <div className="mt-10">
                        <ProfileInfoBlock value={statusLabel} label="Status" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => navigate(EMPLOYEE_CHANGE_PASSWORD_ROUTE)}
                      className="min-w-[210px] rounded-full border-2 border-white bg-transparent px-6 py-2 text-[12px] font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-[#315b42]"
                    >
                      Change Password
                    </button>

                    <button
                      type="button"
                      onClick={logout}
                      className="min-w-[210px] rounded-full bg-white px-6 py-2 text-[12px] font-black uppercase tracking-wide text-[#315b42] transition hover:bg-[#e7eee3]"
                    >
                      Sign Out
                    </button>
                  </div>
                </section>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d8ded5] bg-[#f7f9f5]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.75fr_1.35fr_1.05fr_0.85fr] md:items-start">
            <div>
              <Link
                to={EMPLOYEE_HOME_ROUTE}
                className="flex items-center gap-2.5"
              >
                <img
                  src={LOGO_IMAGE}
                  alt="Manpower Logo"
                  className="h-12 w-12 shrink-0 rounded-full object-contain"
                />

                <h3 className="text-[24px] font-black tracking-wide text-[#315b42]">
                  MANPOWER
                </h3>
              </Link>
            </div>

            <FooterColumn title="Menu">
              <Link
                className="block hover:text-[#315b42]"
                to={EMPLOYEE_HOME_ROUTE}
              >
                Home
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to={EMPLOYEE_PAYROLL_ROUTE}
              >
                Payroll
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to={EMPLOYEE_LEAVE_ROUTE}
              >
                Leave
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to={EMPLOYEE_PROFILE_ROUTE}
              >
                Profile
              </Link>
            </FooterColumn>

            <FooterColumn title="Contact Information">
              <p>ltc.tamis@gmail.com</p>
              <p>lorengladisu@ltcmultiservices.com</p>
              <p>09959808051 / 09516281271</p>
            </FooterColumn>

            <FooterColumn title="Address">
              <p>2/F 544 Curie Street,</p>
              <p>Palanan, Makati City</p>
            </FooterColumn>

            <FooterColumn title="Follow Us">
              <p>Facebook</p>
              <p>Email</p>
              <p>LinkedIn</p>
            </FooterColumn>
          </div>

          <div className="mt-2 flex flex-col gap-1 border-t border-[#d8ded5] pt-1.5 text-[10px] font-semibold text-[#4c6556] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
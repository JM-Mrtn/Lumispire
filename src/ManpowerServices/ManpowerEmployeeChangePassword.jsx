import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
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

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Manpower Logo"
        className="h-10 w-10 rounded-full object-cover"
      />
      <h1 className="text-[22px] font-black tracking-wide text-[#2f5a45] md:text-[28px]">
        MANPOWER
      </h1>
    </div>
  );
}

function FooterLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Lumispire Logo"
        className="h-9 w-9 rounded-full object-cover"
      />
      <p className="text-2xl font-black tracking-wide text-white">LUMISPIRE</p>
    </div>
  );
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 10V8a4 4 0 1 1 8 0v2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 7h16v10H4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m5 8 7 6 7-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ManpowerEmployeeChangePassword() {
  const navigate = useNavigate();

  const [token, setToken] = useState(getEmployeeToken());
  const [employee, setEmployee] = useState(getEmployeeUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });

  const [otpState, setOtpState] = useState({
    loading: false,
    success: "",
    error: "",
  });

  const [passwordState, setPasswordState] = useState({
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

  function logout() {
    clearEmployeeSession();
    setToken("");
    setEmployee(null);
    navigate("/manpower-employee-login", { replace: true });
  }

  useEffect(() => {
    if (!token) {
      navigate("/manpower-employee-login", { replace: true });
      return;
    }

    let active = true;

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

        if (!active) return;

        const nextEmployee = data?.employee || null;
        setEmployee(nextEmployee);
        saveEmployeeSession(token, nextEmployee);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load employee profile.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [token, navigate]);

  function validateBeforeOtp() {
    const currentPassword = String(passwordForm.currentPassword || "");
    const newPassword = String(passwordForm.newPassword || "");
    const confirmPassword = String(passwordForm.confirmPassword || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return "Please complete current password, new password, and confirm password first.";
    }

    if (newPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }

    if (newPassword !== confirmPassword) {
      return "New password and confirm password do not match.";
    }

    return "";
  }

  async function sendOtp(e) {
    e.preventDefault();

    setOtpState({
      loading: false,
      success: "",
      error: "",
    });

    setPasswordState((prev) => ({
      ...prev,
      success: "",
      error: "",
    }));

    const validationError = validateBeforeOtp();

    if (validationError) {
      setOtpState({
        loading: false,
        success: "",
        error: validationError,
      });
      return;
    }

    setOtpState({
      loading: true,
      success: "",
      error: "",
    });

    try {
      const res = await fetch(
        `${API_BASE}/manpower/employee/change-password/request-otp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to send OTP.");
      }

      setOtpState({
        loading: false,
        success: data?.message || "OTP sent successfully.",
        error: "",
      });
    } catch (err) {
      setOtpState({
        loading: false,
        success: "",
        error: err?.message || "Failed to send OTP.",
      });
    }
  }

  async function changePassword(e) {
    e.preventDefault();

    setPasswordState({
      loading: false,
      success: "",
      error: "",
    });

    setOtpState((prev) => ({
      ...prev,
      error: "",
    }));

    const currentPassword = String(passwordForm.currentPassword || "");
    const newPassword = String(passwordForm.newPassword || "");
    const confirmPassword = String(passwordForm.confirmPassword || "");
    const otp = String(passwordForm.otp || "").trim();

    if (!currentPassword || !newPassword || !confirmPassword || !otp) {
      setPasswordState({
        loading: false,
        success: "",
        error: "Please complete all password fields and enter the OTP.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordState({
        loading: false,
        success: "",
        error: "New password must be at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordState({
        loading: false,
        success: "",
        error: "New password and confirm password do not match.",
      });
      return;
    }

    setPasswordState({
      loading: true,
      success: "",
      error: "",
    });

    try {
      const res = await fetch(`${API_BASE}/manpower/employee/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          otp,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to change password.");
      }

      const updatedEmployee = {
        ...(employee || {}),
        mustChangePassword: false,
      };

      setEmployee(updatedEmployee);
      saveEmployeeSession(token, updatedEmployee);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        otp: "",
      });

      setOtpState({
        loading: false,
        success: "",
        error: "",
      });

      setPasswordState({
        loading: false,
        success: data?.message || "Password updated successfully.",
        error: "",
      });
    } catch (err) {
      setPasswordState({
        loading: false,
        success: "",
        error: err?.message || "Failed to change password.",
      });
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-[12px] border border-[#8b9387] bg-[#f7f7f2] px-4 py-3 text-sm text-[#2f5a45] outline-none transition focus:border-[#355e48]";

  return (
    <div className="min-h-screen bg-[#efefed] text-[#24372d]">
      <header className="border-b border-[#d7ddd5] bg-[#f7f7f5]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <BrandLogo />

          <nav className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-wide text-[#647467]">
            <button
              type="button"
              onClick={() => navigate("/manpower-employee-home")}
              className="hover:text-[#2f5a45]"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => navigate("/manpower-employee-profile")}
              className="hover:text-[#2f5a45]"
            >
              Profile
            </button>

            <button
              type="button"
              onClick={() => navigate("/manpower-employee-payroll")}
              className="hover:text-[#2f5a45]"
            >
              Payroll
            </button>

            <button
              type="button"
              onClick={logout}
              className="hover:text-[#2f5a45]"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 pt-0 md:px-6">
          <div
            className="relative min-h-[210px] overflow-hidden md:min-h-[300px]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(42,82,61,0.88) 0%, rgba(64,94,77,0.62) 38%, rgba(64,94,77,0.18) 100%), url('/images/manpower-hero.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "#64766c",
            }}
          >
            <div className="flex min-h-[210px] items-center px-5 py-8 md:min-h-[300px] md:px-8">
              <div className="max-w-4xl text-white">
                <h2 className="text-4xl font-black uppercase leading-tight md:text-7xl">
                  Change Password
                </h2>

                <p className="mt-2 text-2xl italic text-white/95 md:text-5xl md:leading-none">
                  {fullName || "Employee Account"}
                </p>

                <div className="mt-8">
                  <p className="text-2xl font-semibold leading-none md:text-4xl">
                    Makati City
                  </p>
                  <p className="mt-1 text-[11px] text-white/90 md:text-xs">
                    2/F 544 Curie Street, Palanan, Makati City
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
          {loading ? (
            <div className="rounded-[24px] border border-[#d7decf] bg-white p-8 text-center text-[#6b7a6d] shadow-sm">
              Loading employee account...
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-[24px] border border-[#efc9c9] bg-[#fff2f2] p-6 text-sm text-[#912f2f] shadow-sm">
              {error}
            </div>
          ) : null}

          {!loading && !error ? (
            <section className="rounded-[26px] border border-[#cfd7cb] bg-[#d8ddd1] p-6 shadow-[4px_6px_0_rgba(0,0,0,0.14)] md:p-8">
              <div className="flex items-center gap-3">
                <LockIcon className="h-8 w-8 text-[#2f5a45]" />
                <h3 className="text-2xl font-extrabold text-[#2f5a45] md:text-3xl">
                  Change Password
                </h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#4f6658]">
                Enter your current password, choose a new password, request an
                OTP, then verify it to complete the password change.
              </p>

              <div className="mt-4 rounded-[14px] border border-[#d7ddd3] bg-white px-4 py-3 text-sm text-[#4f6658]">
                <div className="flex items-center gap-2 font-semibold text-[#355e48]">
                  <MailIcon className="h-5 w-5" />
                  <span>
                    OTP will be sent to:{" "}
                    {employee?.personalEmail || employee?.companyEmail || "-"}
                  </span>
                </div>
              </div>

              <form onSubmit={changePassword} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[15px] font-extrabold text-[#355e48]">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-extrabold text-[#355e48]">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-extrabold text-[#355e48]">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-extrabold text-[#355e48]">
                    OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={passwordForm.otp}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    className={inputClass}
                    placeholder="Enter 6-digit OTP"
                  />
                </div>

                {otpState.error ? (
                  <div className="rounded-[10px] border border-[#e2b6b6] bg-[#fff2f2] px-4 py-3 text-sm text-[#9b2c2c]">
                    {otpState.error}
                  </div>
                ) : null}

                {otpState.success ? (
                  <div className="rounded-[10px] border border-[#b9d8bb] bg-[#edf8ee] px-4 py-3 text-sm text-[#25633c]">
                    {otpState.success}
                  </div>
                ) : null}

                {passwordState.error ? (
                  <div className="rounded-[10px] border border-[#e2b6b6] bg-[#fff2f2] px-4 py-3 text-sm text-[#9b2c2c]">
                    {passwordState.error}
                  </div>
                ) : null}

                {passwordState.success ? (
                  <div className="rounded-[10px] border border-[#b9d8bb] bg-[#edf8ee] px-4 py-3 text-sm text-[#25633c]">
                    {passwordState.success}
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={otpState.loading}
                    className="w-full rounded-full border border-[#6f886f] bg-gradient-to-b from-[#dfe8da] to-[#bccbb8] px-8 py-3 text-sm font-bold text-[#2f5a45] shadow-sm transition hover:brightness-95 disabled:opacity-70"
                  >
                    {otpState.loading ? "Sending OTP..." : "Send OTP"}
                  </button>

                  <button
                    type="submit"
                    disabled={passwordState.loading}
                    className="w-full rounded-full border border-[#6f886f] bg-gradient-to-b from-[#5d7a63] to-[#355e48] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95 disabled:opacity-70"
                  >
                    {passwordState.loading
                      ? "Updating..."
                      : "Verify OTP & Update Password"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/manpower-employee-profile")}
                  className="w-full rounded-full border-2 border-[#2f5a45] bg-transparent px-8 py-3 text-sm font-bold text-[#2f5a45] transition hover:bg-[#edf3ed]"
                >
                  Back to Profile
                </button>
              </form>
            </section>
          ) : null}
        </section>
      </main>

      <footer className="bg-[#456b56] text-white">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
          <div className="grid gap-5 md:grid-cols-5 md:items-start">
            <div className="md:pr-4">
              <FooterLogo />
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Menu</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p>Home</p>
                <p>Profile</p>
                <p>Payroll</p>
                <p>Contact</p>
              </div>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Contact Information</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p>ltc.tamis@gmail.com</p>
                <p>lorengladisu@ltcmultiservices.com</p>
                <p>09959808051 / 09516281271</p>
              </div>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Address</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p>2/F 544 Curie Street,</p>
                <p>Palanan, Makati City</p>
              </div>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Follow Us</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p>Facebook</p>
                <p>Email</p>
                <p>LinkedIn</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-2 border-t border-white/15 pt-3 text-[10px] text-white/80 md:flex-row">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
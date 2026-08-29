// HotelAndRestaurant/HotelResetPassword.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function getHotelApiBase() {
  const raw = (
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel`;
  if (raw.includes("/api/hotel")) return raw;

  return `${raw}/api/hotel`;
}

const API_BASE = getHotelApiBase();
const HOTEL_LOGO = "/HotelLogo.webp";

function EyeIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7z"
      />
      <circle cx="12" cy="12" r="2.75" />
      {!open ? <path strokeLinecap="round" d="M4 20L20 4" /> : null}
    </svg>
  );
}

const HotelResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (!token) return "Reset token is missing.";
    if (!cleanPassword) return "New password is required.";
    if (cleanPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }
    if (!cleanConfirmPassword) return "Confirm password is required.";
    if (cleanConfirmPassword !== cleanPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const clearError = () => {
    if (status.type === "error") {
      setStatus({ type: "", message: "" });
    }
  };

  const submit = async () => {
    setStatus({ type: "", message: "" });

    const validationMessage = validate();
    if (validationMessage) {
      setStatus({ type: "error", message: validationMessage });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/hotel-reset-password/${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token,
            password: password.trim(),
            newPassword: password.trim(),
            confirmPassword: confirmPassword.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to reset password.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: data.message || "Password reset successfully. Redirecting...",
      });

      window.setTimeout(() => {
        navigate("/hotel-login", { replace: true });
      }, 1200);
    } catch (error) {
      console.error("reset password error:", error);
      setStatus({
        type: "error",
        message: "Network error. Please check if the backend server is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f3f7f4] font-sans text-[#101828]">
      <main className="grid min-h-screen place-items-center p-4 sm:p-6">
        <section
          className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_28px_70px_rgba(8,39,25,0.14)] lg:grid-cols-2"
          aria-labelledby="hotel-reset-password-title"
        >
          <aside className="relative hidden min-h-[600px] overflow-hidden bg-[#082719] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[#d7a84d]/10"
              aria-hidden="true"
            />

            <div className="relative z-10 flex items-center gap-4">
              <img
                src={HOTEL_LOGO}
                width="56"
                height="56"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                alt=""
                aria-hidden="true"
                className="h-14 w-14 rounded-full bg-white object-cover ring-[6px] ring-white/10"
              />
              <div>
                <p className="m-0 text-lg font-black uppercase leading-none tracking-tight">
                  Hotel &amp; Resort
                </p>
                <p className="mt-1 text-xs font-semibold text-white/60">
                  Patio de Lorenzo
                </p>
              </div>
            </div>

            <div className="relative z-10">
              <p className="inline-flex min-h-9 items-center rounded-full border border-white/15 bg-white/10 px-4 text-[11px] font-black uppercase tracking-[0.16em] text-[#f4d484]">
                Account Security
              </p>
              <h2 className="mt-5 max-w-sm text-5xl font-black leading-[1.02] tracking-[-0.055em]">
                Create a new <span className="text-[#f4d484]">password.</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm font-semibold leading-7 text-white/70">
                Choose a strong password you have not used before. After saving,
                you can sign in again to manage your Hotel &amp; Resort account.
              </p>
            </div>

            <p className="relative z-10 m-0 text-[11px] font-semibold text-white/40">
              © 2026 LTC Group of Companies · CRMS Tech Alliance
            </p>
          </aside>

          <div className="flex min-h-[600px] items-center bg-white px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <img
                  src={HOTEL_LOGO}
                  width="48"
                  height="48"
                  loading="eager"
                  decoding="async"
                  alt="Hotel & Resort logo"
                  className="h-12 w-12 rounded-full bg-white object-cover ring-4 ring-[#174a30]/10"
                />
                <div>
                  <p className="m-0 text-base font-black leading-none text-[#071f14]">
                    Hotel &amp; Resort
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-[#667085]">
                    Patio de Lorenzo
                  </p>
                </div>
              </div>

              <h1
                id="hotel-reset-password-title"
                className="m-0 text-4xl font-black leading-tight tracking-[-0.05em] text-[#071f14] sm:text-[42px]"
              >
                Reset Password
              </h1>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#667085]">
                Enter and confirm your new password to restore access to your account.
              </p>

              <form
                className="mt-8 grid gap-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!loading) submit();
                }}
              >
                <div className="grid gap-2">
                  <label
                    htmlFor="hotel-reset-password"
                    className="text-xs font-black uppercase tracking-[0.08em] text-[#0e3321]"
                  >
                    New Password
                  </label>

                  <div className="grid grid-cols-[minmax(0,1fr)_48px] items-center gap-2">
                    <input
                      id="hotel-reset-password"
                      type={showPw ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        clearError();
                      }}
                      autoComplete="new-password"
                      disabled={loading}
                      aria-invalid={status.type === "error" ? "true" : "false"}
                      aria-describedby={status.message ? "hotel-reset-status" : undefined}
                      className="h-12 min-w-0 rounded-2xl border border-[#235f3e]/15 bg-[#f8fbf9] px-4 text-sm font-semibold text-[#101828] outline-none transition focus:border-[#235f3e] focus:bg-white focus:ring-4 focus:ring-[#235f3e]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPw((value) => !value)}
                      disabled={loading}
                      aria-label={showPw ? "Hide new password" : "Show new password"}
                      aria-controls="hotel-reset-password"
                      className="grid h-12 w-12 place-items-center rounded-2xl border border-[#235f3e]/15 bg-[#f8fbf9] text-[#235f3e] transition hover:border-[#235f3e]/30 hover:bg-white hover:text-[#071f14] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7a84d]/35 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="hotel-reset-confirm-password"
                    className="text-xs font-black uppercase tracking-[0.08em] text-[#0e3321]"
                  >
                    Confirm Password
                  </label>

                  <div className="grid grid-cols-[minmax(0,1fr)_48px] items-center gap-2">
                    <input
                      id="hotel-reset-confirm-password"
                      type={showCpw ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        clearError();
                      }}
                      autoComplete="new-password"
                      disabled={loading}
                      aria-invalid={status.type === "error" ? "true" : "false"}
                      aria-describedby={status.message ? "hotel-reset-status" : undefined}
                      className="h-12 min-w-0 rounded-2xl border border-[#235f3e]/15 bg-[#f8fbf9] px-4 text-sm font-semibold text-[#101828] outline-none transition focus:border-[#235f3e] focus:bg-white focus:ring-4 focus:ring-[#235f3e]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowCpw((value) => !value)}
                      disabled={loading}
                      aria-label={showCpw ? "Hide confirm password" : "Show confirm password"}
                      aria-controls="hotel-reset-confirm-password"
                      className="grid h-12 w-12 place-items-center rounded-2xl border border-[#235f3e]/15 bg-[#f8fbf9] text-[#235f3e] transition hover:border-[#235f3e]/30 hover:bg-white hover:text-[#071f14] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7a84d]/35 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <EyeIcon open={showCpw} />
                    </button>
                  </div>
                </div>

                {status.message ? (
                  <div
                    id="hotel-reset-status"
                    role={status.type === "error" ? "alert" : "status"}
                    aria-live="polite"
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold leading-5 ${
                      status.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {status.message}
                  </div>
                ) : null}

                <div className="mt-1 grid gap-3 sm:grid-cols-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="min-h-12 rounded-full bg-gradient-to-r from-[#f4d484] to-[#d7a84d] px-5 text-sm font-black text-[#102418] shadow-[0_12px_26px_rgba(215,168,77,0.2)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7a84d]/35 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                  >
                    {loading ? "Saving..." : "Save Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/hotel-login", { replace: true })}
                    disabled={loading}
                    className="min-h-12 rounded-full border border-[#235f3e]/15 bg-white px-5 text-sm font-black text-[#174a30] transition hover:-translate-y-0.5 hover:border-[#235f3e]/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7a84d]/35 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Back to Login
                  </button>
                </div>
              </form>

              <p className="mt-5 text-xs font-semibold leading-5 text-[#667085]">
                For your security, this reset link may expire. If it no longer works,
                request a new password-reset email from the login page.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HotelResetPassword;
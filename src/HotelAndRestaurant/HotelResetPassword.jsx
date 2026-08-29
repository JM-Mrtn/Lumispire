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
const BACKGROUND_IMAGE = "/HotelLanding1.webp";

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
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
      />
      <circle cx="12" cy="12" r="2.75" />
      {!open ? <path strokeLinecap="round" d="M4 20L20 4" /> : null}
    </svg>
  );
}

export default function HotelResetPassword() {
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f4f8f5] text-[#101828]">
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={BACKGROUND_IMAGE}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover opacity-[0.10]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,248,245,0.90),rgba(244,248,245,0.97))]" />
        <div className="absolute -left-16 top-10 h-52 w-52 rounded-full bg-[#d7a84d]/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#235f3e]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#174a30]/8 blur-3xl" />
      </div>

      <main className="relative z-10 grid min-h-screen place-items-center px-4 py-8 sm:px-6 sm:py-10">
        <section
          className="w-full max-w-4xl overflow-hidden rounded-[30px] border border-[#dfe9e2] bg-white/95 shadow-[0_24px_60px_rgba(8,39,25,0.10)] backdrop-blur-[2px]"
          aria-labelledby="hotel-reset-password-title"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-[#235f3e] via-[#3c7d54] to-[#d7a84d]" />

          <div className="grid lg:grid-cols-[1.08fr_1fr]">
            <div className="relative hidden overflow-hidden border-r border-[#e7efe9] lg:block">
              <div className="absolute inset-0" aria-hidden="true">
                <img
                  src={BACKGROUND_IMAGE}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover opacity-[0.14]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,251,249,0.78),rgba(255,255,255,0.97))]" />
              </div>

              <div className="relative flex h-full flex-col justify-between p-10">
                <div>
                  <div className="flex items-center gap-3">
                    <img
                      src={HOTEL_LOGO}
                      width="56"
                      height="56"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      alt="Hotel & Resort logo"
                      className="h-14 w-14 rounded-full object-cover ring-4 ring-[#174a30]/10"
                    />
                    <div>
                      <p className="m-0 text-[11px] font-black uppercase tracking-[0.18em] text-[#174a30]">
                        Hotel &amp; Resort
                      </p>
                      <p className="m-0 mt-1 text-sm font-bold text-[#2f5e3a]">
                        Patio de Lorenzo
                      </p>
                    </div>
                  </div>

                  <span className="mt-8 inline-flex min-h-9 items-center rounded-full border border-[#d7a84d]/40 bg-[#fff8e8] px-4 text-[11px] font-black uppercase tracking-[0.14em] text-[#6e4f13]">
                    Account Security
                  </span>

                  <h2 className="mt-6 mb-0 max-w-sm text-[34px] font-black leading-[1.05] tracking-[-0.05em] text-[#071f14]">
                    Reset your password securely.
                  </h2>

                  <p className="mt-4 mb-0 max-w-md text-sm font-semibold leading-6 text-[#365044]">
                    Create a new password to protect your account and continue booking with ease.
                    Use at least 8 characters for better security.
                  </p>
                </div>

                <div className="rounded-[24px] border border-[#e5ece6] bg-white/95 p-5 shadow-[0_12px_28px_rgba(8,39,25,0.06)]">
                  <p className="m-0 text-xs font-black uppercase tracking-[0.10em] text-[#174a30]">
                    Quick reminder
                  </p>
                  <p className="mt-2 mb-0 text-sm font-semibold leading-6 text-[#475467]">
                    After saving your new password, you will be redirected to the login page.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              <div className="mx-auto w-full max-w-xl">
                <div className="flex flex-col items-center text-center lg:hidden">
                  <img
                    src={HOTEL_LOGO}
                    width="60"
                    height="60"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    alt="Hotel & Resort logo"
                    className="h-15 w-15 rounded-full object-cover ring-4 ring-[#174a30]/10"
                  />
                  <p className="mt-4 mb-0 text-sm font-black uppercase tracking-[0.12em] text-[#174a30]">
                    Hotel &amp; Resort
                  </p>
                  <p className="mt-1 mb-0 text-xs font-semibold text-[#475467]">
                    Patio de Lorenzo
                  </p>
                </div>

                <span className="mt-6 inline-flex min-h-9 items-center rounded-full border border-[#d7a84d]/35 bg-[#fff8e7] px-4 text-[11px] font-black uppercase tracking-[0.14em] text-[#6e4f13] lg:mt-0">
                  Create a New Password
                </span>

                <h1
                  id="hotel-reset-password-title"
                  className="mt-5 mb-0 text-4xl font-black leading-tight tracking-[-0.05em] text-[#071f14] sm:text-[42px]"
                >
                  Set your new password
                </h1>

                <p className="mt-3 mb-0 max-w-lg text-sm font-semibold leading-6 text-[#475467]">
                  Choose a strong password you have not used before. Once saved, you can sign in
                  again to your Hotel &amp; Resort account.
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
                        className="h-12 min-w-0 rounded-2xl border border-[#b8cbbf] bg-[#f8fbf9] px-4 text-sm font-semibold text-[#101828] outline-none transition focus:border-[#235f3e] focus:bg-white focus:ring-4 focus:ring-[#235f3e]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPw((value) => !value)}
                        disabled={loading}
                        aria-label={showPw ? "Hide new password" : "Show new password"}
                        aria-controls="hotel-reset-password"
                        className="grid h-12 w-12 place-items-center rounded-2xl border border-[#b8cbbf] bg-[#f8fbf9] text-[#174a30] transition hover:bg-white hover:text-[#071f14] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7a84d]/35 disabled:cursor-not-allowed disabled:opacity-50"
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
                        className="h-12 min-w-0 rounded-2xl border border-[#b8cbbf] bg-[#f8fbf9] px-4 text-sm font-semibold text-[#101828] outline-none transition focus:border-[#235f3e] focus:bg-white focus:ring-4 focus:ring-[#235f3e]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() => setShowCpw((value) => !value)}
                        disabled={loading}
                        aria-label={showCpw ? "Hide confirm password" : "Show confirm password"}
                        aria-controls="hotel-reset-confirm-password"
                        className="grid h-12 w-12 place-items-center rounded-2xl border border-[#b8cbbf] bg-[#f8fbf9] text-[#174a30] transition hover:bg-white hover:text-[#071f14] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7a84d]/35 disabled:cursor-not-allowed disabled:opacity-50"
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
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border-rose-300 bg-rose-50 text-rose-800"
                      }`}
                    >
                      {status.message}
                    </div>
                  ) : null}

                  <div className="mt-1 grid gap-3 sm:grid-cols-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="min-h-12 rounded-full bg-gradient-to-r from-[#f4d484] to-[#d7a84d] px-5 text-sm font-black text-[#102418] shadow-[0_10px_22px_rgba(215,168,77,0.18)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7a84d]/35 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                    >
                      {loading ? "Saving..." : "Save Password"}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/hotel-login", { replace: true })}
                      disabled={loading}
                      className="min-h-12 rounded-full border border-[#9db4a5] bg-white px-5 text-sm font-black text-[#174a30] transition hover:-translate-y-0.5 hover:bg-[#f8fbf9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7a84d]/35 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>

                <div className="mt-7 border-t border-[#e4ebe6] pt-5 text-center">
                  <p className="m-0 text-xs font-semibold leading-5 text-[#475467]">
                    For your security, this reset link may expire. If it no longer works,
                    request a new password-reset email from the login page.
                  </p>
                  <p className="mt-4 mb-0 text-[11px] font-semibold text-[#475467]">
                    © 2026 LTC Group of Companies · CRMS Tech Alliance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

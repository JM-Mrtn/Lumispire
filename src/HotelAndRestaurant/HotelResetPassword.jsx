// HotelAndRestaurant/HotelResetPassword.jsx
import React, { useMemo, useState } from "react";
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

const HotelResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const API_BASE = useMemo(() => getHotelApiBase(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const COLORS = useMemo(
    () => ({
      page: "#E9E6DC",
      green: "#2F5E3A",
      border: "#9CB6A7",
    }),
    []
  );

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

      setTimeout(() => {
        navigate("/hotel-login", { replace: true });
      }, 1200);
    } catch (error) {
      console.error("reset password error:", error);

      setStatus({
        type: "error",
        message:
          "Network error. Please check if the backend server is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  const statusClass =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  const EyeIcon = ({ open }) => (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
      />
      <circle cx="12" cy="12" r="2.75" />
      {!open && <path strokeLinecap="round" d="M4 20L20 4" />}
    </svg>
  );

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-6"
      style={{ background: COLORS.page }}
    >
      <div className="w-full max-w-5xl rounded-3xl bg-white px-6 py-12 shadow-[0_18px_40px_rgba(0,0,0,0.12)] sm:px-14 sm:py-16">
        <div className="flex flex-col items-center text-center">
          <img
            src="/ForgetPasswordBG.jpg"
            alt="Reset password"
            className="h-auto w-[150px] sm:w-[180px]"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <h1
            className="mt-8 text-3xl font-extrabold sm:text-4xl"
            style={{ color: COLORS.green }}
          >
            Reset Password?
          </h1>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!loading) submit();
            }}
            className="mt-10 w-full max-w-xl"
          >
            <div className="text-left">
              <label
                className="mb-3 block text-lg font-medium"
                style={{ color: COLORS.green }}
              >
                New Password
              </label>

              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="h-12 w-full rounded-full bg-transparent px-6 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-[#2F5E3A]/20"
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.green,
                  }}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPw((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2F5E3A] hover:opacity-80"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <div className="mt-6 text-left">
              <label
                className="mb-3 block text-lg font-medium"
                style={{ color: COLORS.green }}
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showCpw ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className="h-12 w-full rounded-full bg-transparent px-6 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-[#2F5E3A]/20"
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.green,
                  }}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowCpw((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2F5E3A] hover:opacity-80"
                  aria-label={
                    showCpw ? "Hide confirm password" : "Show confirm password"
                  }
                  disabled={loading}
                >
                  <EyeIcon open={showCpw} />
                </button>
              </div>
            </div>

            {status.message && (
              <div
                className={`mt-4 rounded-lg border px-3 py-2 text-sm font-semibold ${statusClass}`}
              >
                {status.message}
              </div>
            )}

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="h-11 w-[180px] rounded-full font-semibold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: COLORS.green }}
              >
                {loading ? "Saving..." : "Continue"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/hotel-login", { replace: true })}
                disabled={loading}
                className="h-11 w-[180px] rounded-full font-semibold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: COLORS.green }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HotelResetPassword;
// HotelAndRestaurant/HotelResetPassword.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const HotelResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // ✅ API base (works if VITE_API_URL is "http://localhost:5000/api/hotel")
  const API_BASE = useMemo(() => {
    return (import.meta.env.VITE_API_URL || "http://localhost:5000/api/hotel").replace(/\/+$/, "");
  }, []);

  const COLORS = useMemo(
    () => ({
      page: "#E9E6DC",
      green: "#2F5E3A",
      border: "#9CB6A7",
    }),
    []
  );

  const validate = () => {
    if (!token) return "Reset token is missing.";
    if (!password) return "New password is required.";
    if (password.length < 6 || password.length > 20) return "Password must be 6–20 characters.";
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) return "Must include uppercase & lowercase letters.";
    if (!/[^A-Za-z0-9]/.test(password)) return "Must contain at least 1 symbol.";
    if (!confirmPassword) return "Confirm password is required.";
    if (confirmPassword !== password) return "Passwords do not match.";
    return "";
  };

  const submit = async () => {
    setStatus({ type: "", message: "" });

    const msg = validate();
    if (msg) {
      setStatus({ type: "error", message: msg });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/hotel-reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus({ type: "error", message: data.message || "Failed to reset password." });
        return;
      }

      setStatus({ type: "success", message: data.message || "Password reset successfully!" });
      setTimeout(() => navigate("/hotel-login"), 1200);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const statusClass =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "";

  const EyeIcon = ({ open }) => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
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
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: COLORS.page }}>
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_18px_40px_rgba(0,0,0,0.12)] px-6 py-12 sm:px-14 sm:py-16">
        <div className="flex flex-col items-center text-center">
          {/* ✅ Use ForgetPassword.jpg */}
          <img
            src="/ForgetPasswordBG.jpg"
            alt="Reset password"
            className="w-[150px] sm:w-[180px] h-auto"
          />

          <h1 className="mt-8 text-3xl sm:text-4xl font-extrabold" style={{ color: COLORS.green }}>
            Reset Password?
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading) submit();
            }}
            className="mt-10 w-full max-w-xl"
          >
            {/* New Password */}
            <div className="text-left">
              <label className="block text-lg font-medium mb-3" style={{ color: COLORS.green }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="w-full h-12 rounded-full bg-transparent px-6 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-[#2F5E3A]/20"
                  style={{ border: `1px solid ${COLORS.border}`, color: COLORS.green }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2F5E3A] hover:opacity-80"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="text-left mt-6">
              <label className="block text-lg font-medium mb-3" style={{ color: COLORS.green }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showCpw ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full h-12 rounded-full bg-transparent px-6 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-[#2F5E3A]/20"
                  style={{ border: `1px solid ${COLORS.border}`, color: COLORS.green }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCpw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2F5E3A] hover:opacity-80"
                  aria-label={showCpw ? "Hide confirm password" : "Show confirm password"}
                >
                  <EyeIcon open={showCpw} />
                </button>
              </div>
            </div>

            {status.message && (
              <div className={`mt-4 rounded-lg border px-3 py-2 text-sm font-semibold ${statusClass}`}>
                {status.message}
              </div>
            )}

            {/* Buttons row like screenshot */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="h-11 w-[180px] rounded-full text-white font-semibold shadow-sm hover:opacity-95 disabled:opacity-60"
                style={{ backgroundColor: COLORS.green }}
              >
                {loading ? "Saving..." : "Continue"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/hotel-login")}
                className="h-11 w-[180px] rounded-full text-white font-semibold shadow-sm hover:opacity-95"
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
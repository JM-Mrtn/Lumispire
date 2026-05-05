// HotelAndRestaurant/HotelForgotPassword.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const HotelForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // ✅ API base (works if VITE_API_URL is "http://localhost:5000/api/hotel" OR with trailing slash)
  const API_BASE = useMemo(() => {
    return (import.meta.env.VITE_API_URL || "http://localhost:5000/api/hotel").replace(/\/+$/, "");
  }, []);

  const COLORS = useMemo(
    () => ({
      page: "#E9E6DC",
      panel: "#FFFFFF",
      green: "#2F5E3A",
      border: "#9CB6A7",
      muted: "#6B7C74",
    }),
    []
  );

  const submit = async () => {
    setStatus({ type: "", message: "" });

    const e = email.trim().toLowerCase();
    if (!e) {
      setStatus({ type: "error", message: "Please enter your email." });
      return;
    }

    setLoading(true);
    try {
      // ✅ FIXED ENDPOINT (matches your backend)
      const res = await fetch(`${API_BASE}/hotel-forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus({ type: "error", message: data.message || "Failed to send reset link." });
        return;
      }

      setStatus({
        type: "success",
        message: data.message || "Reset link sent! Please check your email.",
      });

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

  return (
    <div className="min-h-screen w-full bg-[#E9E6DC] flex items-center justify-center p-6">
      {/* Big centered card like screenshot */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_18px_40px_rgba(0,0,0,0.12)] px-6 py-12 sm:px-14 sm:py-16">
        <div className="flex flex-col items-center text-center">
          <img
            src="/ForgetPasswordBG.jpg"
            alt="Forget password"
            className="w-[150px] sm:w-[180px] h-auto"
          />

          <h1 className="mt-8 text-3xl sm:text-4xl font-extrabold" style={{ color: COLORS.green }}>
            Forget Password?
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading) submit();
            }}
            className="mt-10 w-full max-w-xl"
          >
            <div className="text-left">
              <label className="block text-lg font-medium mb-3" style={{ color: COLORS.green }}>
                Enter Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-12 rounded-full bg-transparent px-6 text-base focus:outline-none focus:ring-2 focus:ring-[#2F5E3A]/20"
                style={{ border: `1px solid ${COLORS.border}`, color: COLORS.green }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {status.message && (
              <div className={`mt-4 rounded-lg border px-3 py-2 text-sm font-semibold ${statusClass}`}>
                {status.message}
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="h-11 w-[280px] rounded-full text-white font-semibold shadow-sm hover:opacity-95 disabled:opacity-60"
                style={{ backgroundColor: COLORS.green }}
              >
                {loading ? "SENDING..." : "Reset Password"}
              </button>
            </div>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/hotel-login")}
                className="text-sm font-semibold underline underline-offset-4 hover:opacity-80"
                style={{ color: COLORS.green }}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HotelForgotPassword;
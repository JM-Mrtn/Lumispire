// HotelAndRestaurant/HotelForgotPassword.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function getHotelApiBase() {
  const raw = (
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel`;

  return `${raw}/api/hotel`;
}

const HotelForgotPassword = () => {
  const navigate = useNavigate();

  const API_BASE = useMemo(() => getHotelApiBase(), []);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

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

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setStatus({ type: "error", message: "Please enter your email." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/hotel-forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to send reset link.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: data.message || "Reset link sent! Please check your email.",
      });

      setTimeout(() => {
        navigate("/hotel-login", { replace: true });
      }, 1500);
    } catch (err) {
      console.error("forgot password error:", err);

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
      : "";

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-6"
      style={{ backgroundColor: COLORS.page }}
    >
      <div className="w-full max-w-5xl rounded-3xl bg-white px-6 py-12 shadow-[0_18px_40px_rgba(0,0,0,0.12)] sm:px-14 sm:py-16">
        <div className="flex flex-col items-center text-center">
          <img
            src="/ForgetPasswordBG.jpg"
            alt="Forget password"
            className="h-auto w-[150px] sm:w-[180px]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          <h1
            className="mt-8 text-3xl font-extrabold sm:text-4xl"
            style={{ color: COLORS.green }}
          >
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
              <label
                className="mb-3 block text-lg font-medium"
                style={{ color: COLORS.green }}
              >
                Enter Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="h-12 w-full rounded-full bg-transparent px-6 text-base focus:outline-none focus:ring-2 focus:ring-[#2F5E3A]/20"
                style={{
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.green,
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {status.message && (
              <div
                className={`mt-4 rounded-lg border px-3 py-2 text-sm font-semibold ${statusClass}`}
              >
                {status.message}
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="h-11 w-[280px] rounded-full font-semibold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
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
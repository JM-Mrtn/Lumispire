// ManpowerHrLogin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

function getHrToken() {
  return localStorage.getItem("manpowerHrToken") || "";
}

function saveHrSession(token, hrUser) {
  localStorage.setItem("manpowerHrToken", token);
  localStorage.setItem("manpowerHrUser", JSON.stringify(hrUser || null));
}

export default function ManpowerHrLogin() {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getHrToken()) {
      navigate("/manpower-hr", { replace: true });
    }
  }, [navigate]);

  async function hrLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/manpower/hr/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Login failed.");

      saveHrSession(data.token, data.hrUser);
      setLoginForm({ username: "", password: "" });
      navigate("/manpower-hr", { replace: true });
    } catch (error) {
      setLoginError(error?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f3] px-4">
      <form
        onSubmit={hrLogin}
        className="w-full max-w-md rounded-[28px] border border-[#d7decf] bg-white p-8 shadow-sm"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#68806e]">
          HR Side
        </p>

        <h1 className="mt-2 font-montserrat text-3xl font-bold text-[#24352c]">
          Manpower HR Login
        </h1>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#395345]">
              Username
            </label>
            <input
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] px-4 py-3 text-sm outline-none focus:border-[#395345]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#395345]">
              Password
            </label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-[#c6ccb9] px-4 py-3 text-sm outline-none focus:border-[#395345]"
            />
          </div>
        </div>

        {loginError ? (
          <div className="mt-4 rounded-xl border border-[#efc9c9] bg-[#fff2f2] px-4 py-3 text-sm text-[#912f2f]">
            {loginError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-[#395345] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#2c4136] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
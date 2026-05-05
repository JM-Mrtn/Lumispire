import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActionButton, AuthShell, inputClassName } from "./ManpowerAdminShell";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

function getAdminToken() {
  return localStorage.getItem("manpowerAdminToken") || "";
}

function saveAdminSession(token, adminUser) {
  localStorage.setItem("manpowerAdminToken", token);
  localStorage.setItem("manpowerAdminUser", JSON.stringify(adminUser || null));
}

export default function ManpowerAdminLogin() {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAdminToken()) {
      navigate("/manpower-admin", { replace: true });
    }
  }, [navigate]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/manpower/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Login failed.");
      }

      saveAdminSession(data.token, data.adminUser);
      setLoginForm({ username: "", password: "" });
      navigate("/manpower-admin", { replace: true });
    } catch (error) {
      setLoginError(error?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <form
        onSubmit={handleLogin}
        className="overflow-hidden rounded-[28px] border border-[#d7decf] bg-white shadow-xl shadow-[#dce7d8]/50"
      >
        <div className="border-b border-[#eef2ea] bg-[#f7faf5] px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#68806e]">
            LTC Group of Companies
          </p>
          <h1 className="mt-2 font-montserrat text-3xl font-bold text-[#24352c]">
            Manpower Admin Login
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#5f6f61]">
            Sign in to manage employee accounts, jobs, and payroll deduction settings.
          </p>
        </div>

        <div className="space-y-4 px-8 py-7">
          <label className="block">
            <span className="text-sm font-semibold text-[#395345]">Username</span>
            <input
              value={loginForm.username}
              onChange={(event) =>
                setLoginForm((prev) => ({
                  ...prev,
                  username: event.target.value,
                }))
              }
              className={`mt-2 ${inputClassName}`}
              placeholder="Enter admin username"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[#395345]">Password</span>
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
              className={`mt-2 ${inputClassName}`}
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
            />
          </label>

          {loginError ? (
            <div className="rounded-xl border border-[#efc9c9] bg-[#fff2f2] px-4 py-3 text-sm font-medium text-[#912f2f]">
              {loginError}
            </div>
          ) : null}

          <ActionButton
            type="submit"
            disabled={loading}
            className="w-full justify-center py-4"
          >
            {loading ? "Signing In..." : "Sign In"}
          </ActionButton>
        </div>
      </form>
    </AuthShell>
  );
}

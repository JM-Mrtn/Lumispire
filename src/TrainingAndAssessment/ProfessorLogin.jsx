// src/TrainingAndAssessment/ProfessorLogin.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return r + "/api";
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

async function readJsonSafe(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || "Invalid server response.");
  }
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const data = await readJsonSafe(res);
  if (!res.ok) {
    throw new Error(data?.message || "Request failed.");
  }
  return data;
}

function setProfessorSession(token, user) {
  localStorage.setItem("professorToken", token);
  localStorage.setItem("professorUser", JSON.stringify(user || null));
}

export default function ProfessorLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const canSubmit = useMemo(
    () => form.username.trim().length >= 3 && form.password.length >= 3,
    [form]
  );

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!canSubmit) {
      setMsg({ type: "error", text: "Enter your username/email and password." });
      return;
    }

    try {
      setLoading(true);

      const data = await fetchJson(`${API_BASE}/professors/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const token = data?.professorToken || data?.token;
      const user = data?.professor || null;

      if (!token) {
        throw new Error("No professor token returned.");
      }

      setProfessorSession(token, user);
      setMsg({ type: "success", text: "Professor login successful." });

      navigate("/professor-dashboard", { replace: true });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Professor login failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#cfd3c5] text-[#395345]">
      <header className="bg-[#f7f8f3] shadow-sm">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/professor" className="flex items-center gap-3">
            <img
              src="/TAMSILogoTransparent.png"
              alt="TAMSI Logo"
              className="h-11 w-11 rounded-full border border-[#c8ccbf] object-cover"
            />
            <span className="font-['Montserrat',sans-serif] text-[34px] font-extrabold leading-none text-[#395345]">
              TAMSI
            </span>
          </Link>

          <Link
            to="/training"
            className="rounded-full border border-[#c6ccb9] bg-white px-5 py-2 text-sm font-semibold text-[#395345] transition hover:bg-[#f0f3ea]"
          >
            Training Home
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1280px] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[34px] bg-[#f7f8f3] shadow-sm ring-1 ring-black/5 lg:grid-cols-[1fr_420px]">
          <div className="bg-[#dbe2d1] p-8 lg:p-10">
            <div className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#6d7a70]">
              Professor Side
            </div>

            <h1 className="mt-5 font-['Montserrat',sans-serif] text-4xl font-extrabold leading-tight text-[#395345]">
              Sign in to manage your training class records
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#5f6e63]">
              Use your professor credentials to access attendance, assessments,
              scores, feedback, and attendance export tools.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Attendance recording and export",
                "Assessment creation and updates",
                "Score encoding and performance tracking",
                "Feedback documentation for trainees",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-[#395345] shadow-sm ring-1 ring-black/5"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 lg:p-10">
            <h2 className="text-2xl font-extrabold text-[#395345]">
              Professor Sign In
            </h2>
            <p className="mt-2 text-sm text-[#647166]">
              Enter your professor username or email and password.
            </p>

            {msg.text ? (
              <div
                className={[
                  "mt-5 rounded-2xl px-4 py-3 text-sm font-semibold",
                  msg.type === "success"
                    ? "bg-green-50 text-green-800 ring-1 ring-green-200"
                    : "bg-red-50 text-red-800 ring-1 ring-red-200",
                ].join(" ")}
              >
                {msg.text}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f7c71]">
                  Username or Email
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => onChange("username", e.target.value)}
                  placeholder="Enter professor username or email"
                  className="mt-2 w-full rounded-2xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f7c71]">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => onChange("password", e.target.value)}
                  placeholder="Enter password"
                  className="mt-2 w-full rounded-2xl border border-[#c6ccb9] bg-white px-4 py-3 text-sm outline-none focus:border-[#395345]"
                />
              </div>

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full rounded-2xl bg-[#395345] px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#2f463a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
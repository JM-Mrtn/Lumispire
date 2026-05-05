import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

async function readJsonSafe(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 160) || "Invalid server response.");
  }
}

export default function TrainingAdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const canSubmit = useMemo(
    () => username.trim().length >= 3 && password.length >= 3,
    [username, password]
  );

  async function submit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!canSubmit) {
      setMsg({
        type: "error",
        text: "Enter your training admin username and password.",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data?.message || "Training admin login failed.");

      const token = data?.trainingAdminToken || data?.token || "";
      if (!token) throw new Error("No training admin token returned by server.");

      localStorage.setItem("trainingAdminToken", token);
      if (data?.admin) {
        localStorage.setItem("trainingAdminUser", JSON.stringify(data.admin));
      } else {
        localStorage.setItem(
          "trainingAdminUser",
          JSON.stringify({ username: username.trim(), email: "admin@tamsi.com" })
        );
      }

      setMsg({ type: "success", text: "Training admin login successful!" });
      navigate("/training-admin-enrollments", { replace: true });
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Training admin login failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#12391f] font-sans text-white">
      <header className="flex h-[88px] items-center bg-white px-6 shadow-sm md:px-10">
        <Link to="/training" className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#2d5238] bg-white text-sm font-black text-[#2d5238]">
            LC
          </div>
          <h1 className="text-xl font-black uppercase tracking-wide text-[#2d5238] md:text-3xl">
            Training &amp; Assessment
          </h1>
        </Link>
      </header>

      <main className="flex min-h-[calc(100vh-88px)] items-center justify-center px-5 py-10">
        <section className="w-full max-w-[460px] rounded-[28px] bg-white p-7 text-[#2d5038] shadow-2xl ring-1 ring-white/10">
          <div className="text-center">
            <div className="mx-auto h-[76px] w-[76px] rounded-full border-4 border-[#b7bbb6] bg-white shadow-sm" />
            <h1 className="mt-5 text-2xl font-black uppercase tracking-tight">
              Training Admin Login
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#647166]">
              Login to manage enrollments, courses, batches, professors, RFID, and competencies.
            </p>
          </div>

          {msg.text ? (
            <div
              className={`mt-5 rounded-xl px-4 py-3 text-sm font-bold ring-1 ${
                msg.type === "success"
                  ? "bg-green-50 text-green-800 ring-green-200"
                  : "bg-red-50 text-red-800 ring-red-200"
              }`}
            >
              {msg.text}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.16em] text-[#6f7c71]">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 text-sm font-semibold text-[#2d5038] outline-none focus:border-[#12391f]"
                placeholder="Enter training admin username"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.16em] text-[#6f7c71]">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mt-2 h-11 w-full rounded-xl border border-[#c6ccb9] bg-white px-4 text-sm font-semibold text-[#2d5038] outline-none focus:border-[#12391f]"
                placeholder="Enter training admin password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full rounded-xl bg-[#12391f] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#2d5038] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="text-center text-sm font-semibold text-[#647166]">
              Go back to{" "}
              <Link to="/training" className="font-black text-[#2d5038] hover:underline">
                Training Home
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

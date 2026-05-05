// HotelAdminLogIn.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HotelAdminLogIn() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    if (raw.includes("/api/hotel")) return raw;
    if (raw.includes("/api/")) return raw;
    return `${raw}/api/hotel`;
  }, []);

  const handleAdminLogin = async () => {
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage("Please enter your admin username and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.message || "Invalid admin credentials.");
        return;
      }

      if (!data?.token) {
        setErrorMessage("Login succeeded but token is missing.");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("hotelAdminToken", data.token);
      navigate("/hotel-admin-dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F1] px-4 py-8 text-[#2A4F33]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-xl lg:grid-cols-[1fr_440px]">
          <div className="hidden bg-[#2F4D36] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <img
                src="/Logo.jpg"
                alt="Patio De Lorenzo Logo"
                className="h-16 w-16 rounded-full bg-white object-cover shadow-sm"
              />
              <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.28em] text-white/60">
                Hotel & Resort Admin
              </p>
              <h1 className="mt-4 text-5xl font-extrabold leading-tight">
                Patio De Lorenzo
              </h1>
              <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-white/70">
                Sign in to manage accounts, bookings, packages, guest reviews, chat support, and ID verification.
              </p>
            </div>

            <p className="text-xs font-semibold text-white/55">© Patio De Lorenzo</p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img
                src="/Logo.jpg"
                alt="Patio De Lorenzo Logo"
                className="h-12 w-12 rounded-full bg-white object-cover shadow-sm"
              />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#6F806D]">
                  Hotel Admin
                </p>
                <p className="text-lg font-extrabold text-[#2A4F33]">Patio De Lorenzo</p>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-[#2A4F33]">
              Admin Login
            </h2>
            <p className="mt-2 text-sm font-semibold text-black/50">
              Enter your admin credentials to continue.
            </p>

            {errorMessage ? (
              <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            <form
              className="mt-7 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!loading) handleAdminLogin();
              }}
            >
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wide text-black/50">
                  Username
                </label>
                <input
                  className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 text-sm font-semibold outline-none focus:border-[#2A4F33] disabled:opacity-60"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="admin username"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs font-extrabold uppercase tracking-wide text-black/50">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    className="h-12 w-full rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 pr-14 text-sm font-semibold outline-none focus:border-[#2A4F33] disabled:opacity-60"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="admin password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((value) => !value)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-extrabold text-[#2A4F33] hover:bg-black/5"
                    disabled={loading}
                  >
                    {showPw ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-2xl bg-[#2A4F33] text-sm font-extrabold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const HotelLogIn = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    if (raw.includes("/api/hotel")) return raw;
    if (raw.includes("/api/")) return raw;
    return `${raw}/api/hotel`;
  }, []);

  const handleLogin = async () => {
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Please enter your username and password.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/hotel-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        localStorage.setItem("token", data.token);

        if (data.user) {
          localStorage.setItem("hotelUser", JSON.stringify(data.user));
        }

        navigate("/resort-venue");
      } else {
        setErrorMessage(data.message || "There was an error logging in.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Unable to connect to the server.");
    }
  };

  const goToSignUp = () => navigate("/hotel-signup");
  const goToHome = () => navigate("/");
  const goToContact = () => navigate("/contact-us");
  const goToForgotPassword = () => navigate("/hotel-forgot-password");

  const UserIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );

  const LockIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );

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

  const PinIcon = () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );

  const CrownLogo = () => (
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#F0D47A]/80 bg-black/20 backdrop-blur-sm">
        <svg viewBox="0 0 64 64" className="h-9 w-9 text-[#F0D47A]" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M14 44l4-18 14 10 14-10 4 18H14Z" />
          <path d="M18 44c3 5 9 8 14 8s11-3 14-8" />
          <circle cx="18" cy="22" r="3" />
          <circle cx="32" cy="14" r="3" />
          <circle cx="46" cy="22" r="3" />
        </svg>
      </div>

      <div className="leading-tight text-white">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.28em]"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Lumispire
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="relative min-h-screen overflow-hidden text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://placehold.co/10x10')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "scale(1.08)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,26,38,0.25),rgba(12,16,24,0.35))]" />
      <div className="absolute inset-0 bg-black/15" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 pt-5 sm:px-10 sm:pt-7">
        <CrownLogo />

        <nav
          className="flex items-center gap-6 text-sm font-semibold tracking-wide text-white sm:gap-8 sm:text-[26px]"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          <button onClick={goToHome} className="transition hover:opacity-80">
            HOME
          </button>
          <button onClick={goToContact} className="transition hover:opacity-80">
            CONTACT
          </button>
        </nav>
      </header>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-24 sm:px-6">
        <div className="w-full max-w-[760px]">
          <div
            className="mx-auto w-full max-w-[500px] rounded-[26px] border border-white/65 bg-white/10 px-6 pb-5 pt-7 shadow-[0_10px_45px_rgba(0,0,0,0.28)] backdrop-blur-[10px] sm:px-10 sm:pb-6 sm:pt-8"
          >
            <div className="text-center">
              <p
                className="text-[26px] leading-none tracking-[0.08em] text-white sm:text-[34px]"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
              >
                PATIO DE
              </p>
              <h1
                className="-mt-1 text-[42px] leading-none tracking-[0.03em] text-white sm:text-[58px]"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}
              >
                LORENZO
              </h1>
            </div>

            {errorMessage ? (
              <div
                className="mt-5 rounded-xl border border-red-200/70 bg-red-500/15 px-4 py-3 text-center text-sm text-white"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {errorMessage}
              </div>
            ) : null}

            <form
              className="mt-8 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/90">
                  <UserIcon />
                </span>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="h-[54px] w-full rounded-full border border-white/80 bg-white/18 pl-14 pr-5 text-[15px] text-white placeholder:text-white/85 focus:outline-none focus:ring-2 focus:ring-white/30"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/90">
                  <LockIcon />
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-[54px] w-full rounded-full border border-white/80 bg-white/18 pl-14 pr-14 text-[15px] text-white placeholder:text-white/85 focus:outline-none focus:ring-2 focus:ring-white/30"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/95 transition hover:opacity-80"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="mx-auto block h-[50px] w-full max-w-[220px] rounded-full bg-[linear-gradient(180deg,#355E3B_0%,#163126_100%)] text-[15px] font-bold tracking-[0.06em] text-white shadow-[0_8px_20px_rgba(14,30,23,0.35)] transition hover:scale-[1.01] hover:opacity-95"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  SIGN IN
                </button>
              </div>

              <div
                className="flex items-center justify-center gap-2 pt-1 text-center text-[13px] text-white"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <button
                  type="button"
                  onClick={goToForgotPassword}
                  className="font-medium transition hover:opacity-80"
                >
                  Forget Password?
                </button>
                <span className="opacity-90">|</span>
                <button
                  type="button"
                  onClick={goToSignUp}
                  className="font-semibold transition hover:opacity-80"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 z-20 flex items-start gap-2 text-white sm:bottom-7 sm:left-7">
        <div className="pt-0.5">
          <PinIcon />
        </div>
        <div className="leading-tight">
          <p
            className="text-[18px] font-bold sm:text-[28px]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Bacoor, Cavite
          </p>
          <p
            className="text-[12px] sm:text-[18px]"
            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
          >
            Eco Trend Subdivision
          </p>
        </div>
      </div>
    </div>
  );
};

export default HotelLogIn;
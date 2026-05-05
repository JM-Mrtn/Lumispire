import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearTrainingSession } from "./trainingSession";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";

  const r = String(raw).replace(/\/+$/, "");

  if (r.endsWith("/api/hotel")) {
    return r.replace(/\/api\/hotel$/i, "/api");
  }

  if (r.endsWith("/api")) return r;

  if (r.includes("/api/")) {
    return r.replace(/\/api\/hotel.*$/i, "/api");
  }

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

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 12C3.8 8.5 7.4 6 12 6C16.6 6 20.2 8.5 22 12C20.2 15.5 16.6 18 12 18C7.4 18 3.8 15.5 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.6 6.2C11.05 6.07 11.52 6 12 6C16.6 6 20.2 8.5 22 12C21.22 13.52 20.16 14.84 18.9 15.88"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.12 14.12C13.58 14.66 12.83 15 12 15C10.34 15 9 13.66 9 12C9 11.17 9.34 10.42 9.88 9.88"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.1 8.12C4.84 9.16 3.78 10.48 3 12C4.8 15.5 8.4 18 13 18C13.48 18 13.95 17.93 14.4 17.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TrainingLogIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [msg, setMsg] = useState({
    type: "",
    text: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const validateForm = () => {
    const nextErrors = {
      email: "",
      password: "",
    };

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      nextErrors.email = "TAMSI email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!cleanPassword) {
      nextErrors.password = "Password is required.";
    } else if (cleanPassword.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!validateForm()) {
      setMsg({
        type: "error",
        text: "Please fix the highlighted fields.",
      });
      return;
    }

    try {
      setLoading(true);

      const loginRes = await fetch(`${API_BASE}/training/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const loginData = await readJsonSafe(loginRes);

      if (!loginRes.ok) {
        throw new Error(loginData?.message || "Login failed.");
      }

      const token = String(loginData?.token || "").trim();
      const user = loginData?.user || null;

      if (!token) {
        throw new Error("Login succeeded but no token was returned.");
      }

      clearTrainingSession();
      localStorage.setItem("trainingToken", token);

      if (user) {
        localStorage.setItem("trainingUser", JSON.stringify(user));
      }

      const profileRes = await fetch(`${API_BASE}/training/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profileData = await readJsonSafe(profileRes);

      if (!profileRes.ok) {
        clearTrainingSession();
        throw new Error(
          profileData?.message ||
            "Login worked, but your trainee session could not be verified."
        );
      }

      if (profileData?.user) {
        localStorage.setItem("trainingUser", JSON.stringify(profileData.user));
      }

      setMsg({
        type: "success",
        text: "Login successful!",
      });

      navigate("/trainee-home", { replace: true });
    } catch (err) {
      clearTrainingSession();

      setMsg({
        type: "error",
        text: err.message || "Login failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#e8e8e2] text-white">
      {/* HEADER */}
      <header className="relative z-40 h-[90px] bg-white text-[#45674b] shadow-sm">
        <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-6 sm:px-10 lg:px-12">
          <button
            type="button"
            onClick={() => goTo("/training")}
            className="flex items-center gap-5"
            aria-label="TAMSI Home"
          >
            <img
              src="/TAMSILogoTransparent.png"
              alt="TAMSI Logo"
              className="h-14 w-14 object-contain"
            />

            <span className="font-['Montserrat',sans-serif] text-[28px] font-extrabold tracking-wide text-[#45674b] sm:text-[34px]">
              TAMSI
            </span>
          </button>

          <nav className="hidden items-center gap-8 lg:flex">
            <button
              type="button"
              onClick={() => goTo("/training")}
              className="font-['Montserrat',sans-serif] text-[15px] font-extrabold uppercase tracking-wide text-[#4c6252] transition hover:text-[#173d25]"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => goTo("/training-course")}
              className="font-['Montserrat',sans-serif] text-[15px] font-extrabold uppercase tracking-wide text-[#4c6252] transition hover:text-[#173d25]"
            >
              Course
            </button>

            <button
              type="button"
              onClick={() => goTo("/training-requirements")}
              className="font-['Montserrat',sans-serif] text-[15px] font-extrabold uppercase tracking-wide text-[#4c6252] transition hover:text-[#173d25]"
            >
              Requirements
            </button>

            <button
              type="button"
              onClick={() => goTo("/training-contact-us")}
              className="font-['Montserrat',sans-serif] text-[15px] font-extrabold uppercase tracking-wide text-[#4c6252] transition hover:text-[#173d25]"
            >
              Contact
            </button>

            <button
              type="button"
              onClick={() => goTo("/training-contact-us")}
              className="font-['Montserrat',sans-serif] text-[15px] font-extrabold uppercase tracking-wide text-[#4c6252] transition hover:text-[#173d25]"
            >
              FAQs
            </button>
          </nav>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="hidden font-['Montserrat',sans-serif] text-[15px] font-extrabold uppercase tracking-wide text-[#4c6252] transition hover:text-[#173d25] lg:block"
          >
            Back
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-lg border border-[#45674b]/20 bg-[#f7faf2] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-[#45674b] lg:hidden"
          >
            Menu
          </button>
        </div>

        {mobileOpen && (
          <div className="absolute left-4 right-4 top-[96px] z-50 overflow-hidden rounded-2xl border border-[#45674b]/10 bg-white shadow-xl lg:hidden">
            <button
              type="button"
              onClick={() => goTo("/training")}
              className="block w-full px-5 py-3 text-left text-sm font-bold text-[#45674b] hover:bg-[#f0f5eb]"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => goTo("/training-course")}
              className="block w-full px-5 py-3 text-left text-sm font-bold text-[#45674b] hover:bg-[#f0f5eb]"
            >
              Course
            </button>

            <button
              type="button"
              onClick={() => goTo("/training-requirements")}
              className="block w-full px-5 py-3 text-left text-sm font-bold text-[#45674b] hover:bg-[#f0f5eb]"
            >
              Requirements
            </button>

            <button
              type="button"
              onClick={() => goTo("/training-contact-us")}
              className="block w-full px-5 py-3 text-left text-sm font-bold text-[#45674b] hover:bg-[#f0f5eb]"
            >
              Contact
            </button>

            <button
              type="button"
              onClick={() => goTo("/training-contact-us")}
              className="block w-full px-5 py-3 text-left text-sm font-bold text-[#45674b] hover:bg-[#f0f5eb]"
            >
              FAQs
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="block w-full px-5 py-3 text-left text-sm font-bold text-[#45674b] hover:bg-[#f0f5eb]"
            >
              Back
            </button>
          </div>
        )}
      </header>

      {/* MAIN LOGIN BACKGROUND */}
      <main className="h-[calc(100vh-90px)] overflow-hidden">
        <section className="relative flex h-full items-center justify-center overflow-hidden px-5 py-8">
          <img
            src="/tamsi-building.jpg"
            alt="TAMSI Building"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/1600x900/d7ddd4/45674b?text=TAMSI+Training+And+Assessment";
            }}
          />

          <div className="absolute inset-0 bg-black/20" />

          {/* LOGIN CARD */}
          <div className="relative z-10 w-full max-w-[610px] rounded-[24px] border-[3px] border-white/90 bg-[#173d25]/45 px-8 py-8 shadow-[0_15px_60px_rgba(0,0,0,0.35)] backdrop-blur-[5px] sm:px-16 sm:py-10">
            <h1 className="text-center font-['Montserrat',sans-serif] text-[38px] font-extrabold uppercase leading-none text-white drop-shadow-md sm:text-[48px]">
              Welcome
            </h1>

            {msg.text && (
              <div
                className={[
                  "mt-6 rounded-xl border px-4 py-3 text-center text-sm font-bold",
                  msg.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700",
                ].join(" ")}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={submit} className="mt-8 space-y-6">
              <div>
                <label className="mb-2 block font-['Montserrat',sans-serif] text-[20px] font-extrabold text-white drop-shadow-sm">
                  TAMSI Email:
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (errors.email) {
                      setErrors((prev) => ({
                        ...prev,
                        email: "",
                      }));
                    }
                  }}
                  autoComplete="email"
                  className={[
                    "h-[45px] w-full rounded-full border-[3px] bg-white/10 px-5 text-base font-semibold text-white outline-none placeholder:text-white/60 focus:ring-2 focus:ring-white/40",
                    errors.email ? "border-red-300" : "border-white",
                  ].join(" ")}
                />

                {errors.email && (
                  <p className="mt-2 text-sm font-semibold text-red-100">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block font-['Montserrat',sans-serif] text-[20px] font-extrabold text-white drop-shadow-sm">
                  Password:
                </label>

                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);

                      if (errors.password) {
                        setErrors((prev) => ({
                          ...prev,
                          password: "",
                        }));
                      }
                    }}
                    autoComplete="current-password"
                    className={[
                      "h-[45px] w-full rounded-full border-[3px] bg-white/10 px-5 pr-14 text-base font-semibold text-white outline-none placeholder:text-white/60 focus:ring-2 focus:ring-white/40",
                      errors.password ? "border-red-300" : "border-white",
                    ].join(" ")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw((prev) => !prev)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white transition hover:opacity-75"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-sm font-semibold text-red-100">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="pt-1 text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-[52px] w-full max-w-[260px] rounded-full bg-white font-['Montserrat',sans-serif] text-[22px] font-extrabold text-[#45674b] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f5f8f2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>

              <div className="space-y-2 text-center">
                <Link
                  to="/trainee-forgot-password"
                  className="block text-[15px] font-extrabold text-white drop-shadow-sm transition hover:opacity-80"
                >
                  Forget Password?
                </Link>

                <p className="text-[15px] font-bold text-white drop-shadow-sm">
                  Don&apos;t have account?{" "}
                  <Link
                    to="/training-enroll"
                    className="font-extrabold transition hover:opacity-80"
                  >
                    Enroll Now
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
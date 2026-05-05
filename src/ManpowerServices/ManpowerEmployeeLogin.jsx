import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const HERO_IMAGE = "/images/manpower-hero.jpg";

const MANPOWER_HOME_ROUTE = "/manpower-services";
const EMPLOYEE_HOME_ROUTE = "/manpower-employee-home";
const EMPLOYEE_CHANGE_PASSWORD_ROUTE = "/manpower-employee-change-password";
const EMPLOYEE_FORGOT_PASSWORD_ROUTE = "/manpower-employee-forgot-password";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

function BrandSeal({ small = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border-[3px] border-[#315b42] bg-white text-center font-black leading-none text-[#315b42] ${
        small ? "h-9 w-9 text-[9px]" : "h-12 w-12 text-[10px]"
      }`}
    >
      LTC
    </div>
  );
}

function HeaderNavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="relative pb-1 text-[#405549] transition hover:text-[#6f8a66]"
    >
      {children}
    </Link>
  );
}

export default function ManpowerEmployeeLogin({ onLogin }) {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
  });

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  function updateField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setStatus({
      loading: false,
      error: "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      email: form.email.trim(),
      password: form.password,
    };

    if (!payload.email || !payload.password) {
      setStatus({
        loading: false,
        error: "Please enter your employee email and password.",
      });
      return;
    }

    try {
      setStatus({
        loading: true,
        error: "",
      });

      const res = await fetch(`${API_BASE}/manpower/employee/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Invalid employee email or password.");
      }

      const token = data?.token || data?.employeeToken || "";
      const employee = data?.employee || data?.user || null;

      if (!token) {
        throw new Error("Login succeeded, but no employee token was returned.");
      }

      localStorage.setItem("manpowerEmployeeToken", token);
      localStorage.setItem("manpowerEmployeeUser", JSON.stringify(employee));

      if (typeof onLogin === "function") {
        onLogin({
          token,
          employee,
        });
      }

      if (employee?.mustChangePassword) {
        navigate(EMPLOYEE_CHANGE_PASSWORD_ROUTE, { replace: true });
        return;
      }

      navigate(EMPLOYEE_HOME_ROUTE, { replace: true });
    } catch (error) {
      setStatus({
        loading: false,
        error: error?.message || "Failed to sign in.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#0f3a1e] font-sans text-[#24372d]">
      <header className="sticky top-0 z-50 border-b border-[#d5ddd2] bg-[#f7f9f5]/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={MANPOWER_HOME_ROUTE} className="flex items-center gap-3">
            <BrandSeal />
            <span className="text-[24px] font-black tracking-wide text-[#315b42] sm:text-[28px]">
              MANPOWER
            </span>
          </Link>

          <nav className="hidden items-center gap-9 text-[12px] font-black uppercase tracking-wide lg:flex">
            <HeaderNavLink to={MANPOWER_HOME_ROUTE}>Home</HeaderNavLink>

            <HeaderNavLink to="/manpower-positions">
              Job Offer
            </HeaderNavLink>

            <HeaderNavLink to="/manpower-requirements">
              Requirements
            </HeaderNavLink>

            <HeaderNavLink to="/manpower-contact">Contact</HeaderNavLink>

            <HeaderNavLink to="/manpower-faqs">FAQs</HeaderNavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to={MANPOWER_HOME_ROUTE}
              className="hidden text-[12px] font-black uppercase tracking-wide text-[#405549] transition hover:text-[#6f8a66] lg:inline-block"
            >
              Back
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="rounded-md border border-[#cfd6ca] px-3 py-2 text-xs font-black uppercase tracking-wide text-[#405549] lg:hidden"
            >
              Menu
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#dde2db] bg-[#f7f9f5] lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 text-sm font-bold text-[#405549] sm:px-6">
              <button
                type="button"
                onClick={() => goTo(MANPOWER_HOME_ROUTE)}
                className="py-2 text-left"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-positions")}
                className="py-2 text-left"
              >
                Job Offer
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-requirements")}
                className="py-2 text-left"
              >
                Requirements
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-contact")}
                className="py-2 text-left"
              >
                Contact
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-faqs")}
                className="py-2 text-left"
              >
                FAQs
              </button>

              <button
                type="button"
                onClick={() => goTo(MANPOWER_HOME_ROUTE)}
                className="py-2 text-left"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </header>

      <main
        className="relative min-h-[calc(100vh-74px)] bg-cover bg-center"
        style={{
          backgroundImage: `url(${HERO_IMAGE})`,
        }}
      >
        <div className="absolute inset-0 bg-black/25" />

        <section className="relative z-10 flex min-h-[calc(100vh-74px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-[540px] rounded-[18px] border-2 border-white/90 bg-[#173d25]/65 px-7 py-8 text-white shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-[3px] sm:px-12">
            <h1 className="text-center text-[36px] font-black uppercase leading-none tracking-wide sm:text-[44px]">
              Welcome
            </h1>

            <form onSubmit={handleSubmit} className="mt-9 space-y-7">
              <div>
                <label
                  htmlFor="employee-email"
                  className="block text-[18px] font-black leading-tight"
                >
                  Employee Email:
                </label>

                <input
                  id="employee-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  autoComplete="email"
                  className="mt-2 h-[39px] w-full rounded-full border-[3px] border-white bg-white/10 px-5 text-[14px] font-semibold text-white outline-none placeholder:text-white/60 focus:border-[#cfe6c2]"
                />
              </div>

              <div>
                <label
                  htmlFor="employee-password"
                  className="block text-[18px] font-black leading-tight"
                >
                  Password:
                </label>

                <input
                  id="employee-password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  autoComplete="current-password"
                  className="mt-2 h-[39px] w-full rounded-full border-[3px] border-white bg-white/10 px-5 text-[14px] font-semibold text-white outline-none placeholder:text-white/60 focus:border-[#cfe6c2]"
                />
              </div>

              {status.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-[12px] font-bold text-red-700">
                  {status.error}
                </div>
              )}

              <div className="flex justify-center pt-1">
                <button
                  type="submit"
                  disabled={status.loading}
                  className="min-w-[230px] rounded-full bg-white px-8 py-3 text-[20px] font-black text-[#315b42] transition hover:bg-[#e7eee3] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status.loading ? "Signing In..." : "Sign In"}
                </button>
              </div>

              <div className="space-y-2 text-center text-[13px] font-black">
                <Link
                  to={EMPLOYEE_FORGOT_PASSWORD_ROUTE}
                  className="inline-block text-white transition hover:text-[#d8ead2]"
                >
                  Forget Password?
                </Link>

                <p>
                  Don&apos;t have account?{" "}
                  <Link
                    to="/manpower-apply"
                    className="font-black text-white underline-offset-4 transition hover:underline"
                  >
                    Apply Now
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
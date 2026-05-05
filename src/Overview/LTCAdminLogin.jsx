import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginLtcAdmin, setLtcAdminToken } from "./ltcContentApi";

const LOGO = "/LTCLogo.jpg";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const LTCAdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginLtcAdmin(form);
      setLtcAdminToken(data.token);
      navigate("/ltc-admin-dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-gray-900" style={fontPontano}>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#355E3B] text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_38%),linear-gradient(135deg,#355E3B,#173B26)]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <Link to="/" className="flex items-center gap-4">
              <img src={LOGO} alt="LTC Logo" className="h-16 w-16 rounded-full bg-white object-cover" />
              <div>
                <h1 className="text-4xl font-black uppercase leading-none" style={fontMontserrat}>
                  LTC
                </h1>
                <p className="mt-1 text-sm tracking-[0.28em] text-white/80" style={fontPoppins}>
                  ADMIN PORTAL
                </p>
              </div>
            </Link>

            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70" style={fontPoppins}>
                Website Management
              </p>
              <h2 className="mt-5 text-5xl font-black leading-tight" style={fontMontserrat}>
                Manage LTC website content from one dashboard.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/80">
                Update the company profile, achievements, highlights, and team members without changing frontend code.
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm leading-relaxed text-white/85">
                Changes are saved in MongoDB and are automatically shown on your public pages.
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <img src={LOGO} alt="LTC Logo" className="h-14 w-14 rounded-full bg-white object-cover shadow" />
              <div>
                <h1 className="text-3xl font-black uppercase text-[#355E3B]" style={fontMontserrat}>
                  LTC
                </h1>
                <p className="text-xs tracking-[0.25em] text-gray-500" style={fontPoppins}>
                  ADMIN PORTAL
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.13)] sm:p-8">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#355E3B]" style={fontPoppins}>
                  Secure Login
                </p>
                <h2 className="mt-3 text-3xl font-black text-gray-950" style={fontMontserrat}>
                  LTC Admin
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Sign in to update company information and website sections.
                </p>
              </div>

              {error ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-7 space-y-5">
                <label className="block">
                  <span className="text-sm font-bold text-gray-700" style={fontPoppins}>
                    Username
                  </span>
                  <input
                    value={form.username}
                    onChange={(event) => updateField("username", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#355E3B] focus:bg-white focus:ring-4 focus:ring-[#355E3B]/10"
                    placeholder="ltcadmin"
                    autoComplete="username"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-gray-700" style={fontPoppins}>
                    Password
                  </span>
                  <div className="mt-2 flex overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-[#355E3B] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#355E3B]/10">
                    <input
                      value={form.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
                      placeholder="Enter admin password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="px-4 text-xs font-bold uppercase tracking-wide text-[#355E3B] hover:bg-[#355E3B]/10"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-7 w-full rounded-2xl bg-[#355E3B] px-5 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-[#355E3B]/20 transition hover:-translate-y-0.5 hover:bg-[#2C4F32] disabled:cursor-not-allowed disabled:opacity-60"
                style={fontPoppins}
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              <Link
                to="/"
                className="mt-5 block text-center text-sm font-semibold text-gray-500 hover:text-[#355E3B]"
              >
                Back to website
              </Link>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LTCAdminLogin;

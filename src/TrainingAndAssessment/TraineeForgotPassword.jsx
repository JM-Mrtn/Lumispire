// src/TrainingAndAssessment/TraineeForgotPassword.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return r + "/api";
}

const TraineeForgotPassword = () => {
  const navigate = useNavigate();

  const API_BASE = useMemo(
    () =>
      normalizeApiBase(
        import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
      ),
    []
  );

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [step, setStep] = useState("FORM");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => {
      setCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const validateForm = () => {
    if (!email.trim()) return "Trainee email is required.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid trainee email.";
    if (!newPassword) return "New password is required.";
    if (newPassword.length < 6 || newPassword.length > 20) {
      return "Password must be 6–20 characters.";
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
      return "Must include uppercase and lowercase letters.";
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return "Must contain at least 1 symbol.";
    }
    if (!confirmPassword) return "Confirm password is required.";
    if (confirmPassword !== newPassword) return "Passwords do not match.";
    return "";
  };

  const validateOtp = () => {
    const code = otp.trim();
    if (!code) return "OTP is required.";
    if (!/^\d{6}$/.test(code)) return "OTP must be 6 digits.";
    return "";
  };

  const sendOtp = async () => {
    setStatus({ type: "", message: "" });

    const msg = validateForm();
    if (msg) {
      setStatus({ type: "error", message: msg });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/training/forgot-password/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setCooldown(Number(data.retryAfterSeconds || 60));
        setStatus({
          type: "error",
          message: data.message || "Please wait before requesting OTP again.",
        });
        return;
      }

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to send OTP.",
        });
        return;
      }

      setStep("OTP");
      setCooldown(Number(data.cooldownSeconds || 60));
      setStatus({
        type: "success",
        message: data.message || "OTP sent to your email.",
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const resendOtp = async () => {
    setStatus({ type: "", message: "" });

    if (!email.trim()) {
      setStatus({ type: "error", message: "Trainee email is required." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/training/forgot-password/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setCooldown(Number(data.retryAfterSeconds || 60));
        setStatus({
          type: "error",
          message: data.message || "Please wait before resending OTP.",
        });
        return;
      }

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to resend OTP.",
        });
        return;
      }

      setCooldown(Number(data.cooldownSeconds || 60));
      setStatus({
        type: "success",
        message: data.message || "OTP resent to your email.",
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Network error while resending OTP.",
      });
    } finally {
      setSaving(false);
    }
  };

  const verifyOtpAndSave = async () => {
    setStatus({ type: "", message: "" });

    const msg1 = validateForm();
    if (msg1) {
      setStatus({ type: "error", message: msg1 });
      return;
    }

    const msg2 = validateOtp();
    if (msg2) {
      setStatus({ type: "error", message: msg2 });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/training/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.message || "OTP verification failed.";
        setStatus({ type: "error", message });

        if (String(message).toLowerCase().includes("no otp request")) {
          setStep("FORM");
          setOtp("");
        }
        return;
      }

      setStatus({
        type: "success",
        message: data.message || "Password reset successfully.",
      });

      setTimeout(() => navigate("/trainee-login"), 700);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Network error while verifying OTP.",
      });
    } finally {
      setSaving(false);
    }
  };

  const statusStyles =
    status.type === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status.type === "error"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  const fmt = (s) => String(s).padStart(2, "0");
  const mmss = `${fmt(Math.floor(cooldown / 60))}:${fmt(cooldown % 60)}`;

  return (
    <div className="min-h-screen bg-[#f6f6f1] text-[#2f4d36]">
      <header className="bg-white border-b border-black/10">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-[#3f5b44]">
            Forgot Password
          </h1>
          <button
            onClick={() => navigate("/trainee-login")}
            className="text-xs font-bold tracking-wide hover:opacity-80 text-[#3f5b44]"
          >
            BACK
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="rounded-2xl shadow-lg border border-black/5 bg-[#f3f2ea] p-8">
          {status.message && (
            <div className={`mb-5 border rounded-xl px-4 py-3 text-sm ${statusStyles}`}>
              {status.message}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Trainee Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-full bg-white/60 border border-[#2f4d36]/30 px-4 focus:outline-none focus:ring-2 focus:ring-[#2f4d36]/25"
                placeholder="Enter your trainee email"
                autoComplete="email"
                disabled={step === "OTP"}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value.slice(0, 20))}
                  className="w-full h-11 rounded-full bg-white/60 border border-[#2f4d36]/30 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#2f4d36]/25"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/5"
                >
                  👁
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showCpw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value.slice(0, 20))}
                  className="w-full h-11 rounded-full bg-white/60 border border-[#2f4d36]/30 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#2f4d36]/25"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCpw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/5"
                >
                  👁
                </button>
              </div>
            </div>

            {step === "FORM" ? (
              <button
                onClick={sendOtp}
                disabled={saving}
                className="w-full h-11 rounded-full bg-[#3f5b44] text-white font-semibold shadow-sm hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "SENDING..." : "SEND OTP"}
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Enter OTP (6 digits)
                  </label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full h-11 rounded-full bg-white/60 border border-[#2f4d36]/30 px-4 focus:outline-none focus:ring-2 focus:ring-[#2f4d36]/25"
                    placeholder="123456"
                    inputMode="numeric"
                  />
                </div>

                <button
                  onClick={verifyOtpAndSave}
                  disabled={saving}
                  className="w-full h-11 rounded-full bg-[#3f5b44] text-white font-semibold shadow-sm hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "VERIFYING..." : "VERIFY OTP & RESET PASSWORD"}
                </button>

                <button
                  onClick={resendOtp}
                  disabled={saving || cooldown > 0}
                  className="w-full h-11 rounded-full bg-[#7f907f] text-white font-semibold shadow-sm hover:opacity-90 disabled:opacity-60"
                >
                  {cooldown > 0 ? `RESEND OTP (${mmss})` : "RESEND OTP"}
                </button>

                <button
                  onClick={() => {
                    setStep("FORM");
                    setOtp("");
                    setStatus({ type: "", message: "" });
                  }}
                  disabled={saving}
                  className="w-full h-11 rounded-full bg-[#3f5b44] text-white font-semibold shadow-sm hover:opacity-90 disabled:opacity-60"
                >
                  BACK TO FORM
                </button>
              </>
            )}

            <p className="text-xs text-[#2f4d36]/70 text-center">
              OTP expires in 10 minutes. Password must include uppercase, lowercase,
              and at least 1 symbol.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TraineeForgotPassword;
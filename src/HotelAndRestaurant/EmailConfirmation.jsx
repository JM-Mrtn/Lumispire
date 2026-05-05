// EmailConfirmation.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "your email";
  const [name, domain] = email.split("@");
  const maskedName =
    name.length <= 2 ? `${name[0] || ""}*` : `${name.slice(0, 2)}***${name.slice(-1)}`;
  return `${maskedName}@${domain}`;
};

const EmailConfirmation = () => {
  const { verificationToken } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get email automatically (no input)
  const email =
    location.state?.email ||
    sessionStorage.getItem("pendingVerificationEmail") ||
    "";

  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState({
    type: "info",
    message: "Check your email for the verification link.",
  });

  useEffect(() => {
    let timer;

    const verify = async () => {
      if (!verificationToken) return;

      setLoading(true);
      setStatus({ type: "info", message: "Verifying your email…" });

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/verify-email/${verificationToken}`,
          { method: "GET" }
        );

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          setStatus({
            type: "success",
            message: "Email verified! Redirecting to login…",
          });

          sessionStorage.removeItem("pendingVerificationEmail");
          timer = setTimeout(() => navigate("/hotel-login"), 900);
        } else {
          setStatus({
            type: "error",
            message: data.message || "Verification failed.",
          });
        }
      } catch (err) {
        console.error(err);
        setStatus({ type: "error", message: "Network error. Please try again." });
      } finally {
        setLoading(false);
      }
    };

    verify();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [verificationToken, navigate]);

  const handleResend = async () => {
    if (!email) {
      setStatus({
        type: "error",
        message: "No signup email found. Please sign up again.",
      });
      return;
    }

    setResending(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setStatus({
          type: "success",
          message: data.message || "Verification email resent!",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Could not resend verification email.",
        });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Network error while resending." });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#e9e4d7] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_18px_40px_rgba(0,0,0,0.12)] px-6 py-12 sm:px-14 sm:py-16">
        <div className="flex flex-col items-center text-center">
          {/* ✅ Use AccountVerification.jpg */}
          <img
            src="/AccountVerification.jpg"
            alt="Account verification"
            className="w-[200px] sm:w-[240px] h-auto"
          />

          <h1 className="mt-8 text-3xl sm:text-4xl font-extrabold text-[#2F5E3A]">
            Verify your email address
          </h1>

          <p className="mt-5 max-w-xl text-[#2F5E3A] font-semibold leading-relaxed">
            An email with your account confirmation link has been <br />
            sent to your email{" "}
            <span className="font-extrabold">{maskedEmail}</span>
          </p>

          <p className="mt-4 text-[#2F5E3A] font-semibold">
            Check your email and come back to proceed!
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/hotel-login")}
              disabled={loading}
              className="h-11 w-40 rounded-full text-white font-semibold shadow-sm hover:opacity-95 disabled:opacity-60"
              style={{ backgroundColor: "#2F5E3A" }}
            >
              {loading ? "Please wait…" : "Proceed"}
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="h-11 w-40 rounded-full text-white font-semibold shadow-sm hover:opacity-95 disabled:opacity-60"
              style={{ backgroundColor: "#2F5E3A" }}
            >
              {resending ? "Resending…" : "Resend Email"}
            </button>
          </div>

          {/* Optional subtle status line */}
          {status?.message && (
            <p
              className={`mt-6 text-sm font-semibold ${
                status.type === "error"
                  ? "text-red-600"
                  : status.type === "success"
                  ? "text-emerald-700"
                  : "text-[#2F5E3A]/80"
              }`}
            >
              {status.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
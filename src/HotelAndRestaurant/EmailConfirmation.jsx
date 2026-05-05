// src/Frontend/HotelAndRestaurant/EmailConfirmation.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function getHotelApiBase() {
  const raw = (
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel`;

  return `${raw}/api/hotel`;
}

const API_BASE = getHotelApiBase();

function maskEmail(email = "") {
  if (!email || !email.includes("@")) return "your email";

  const [local, domain] = email.split("@");

  const maskedLocal =
    local.length <= 2
      ? `${local.charAt(0)}*`
      : `${local.slice(0, 2)}***${local.slice(-1)}`;

  return `${maskedLocal}@${domain}`;
}

export default function EmailConfirmation() {
  const { verificationToken, token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const finalToken = verificationToken || token || "";

  const email =
    location.state?.email ||
    sessionStorage.getItem("pendingVerificationEmail") ||
    "";

  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  const [loading, setLoading] = useState(Boolean(finalToken));
  const [resending, setResending] = useState(false);

  const [status, setStatus] = useState({
    type: "info",
    message: finalToken
      ? "Verifying your email..."
      : "Please check your email and click the verification button.",
  });

  useEffect(() => {
    let redirectTimer;

    async function verifyEmail() {
      if (!finalToken) return;

      setLoading(true);
      setStatus({
        type: "info",
        message: "Verifying your email...",
      });

      try {
        const response = await fetch(
          `${API_BASE}/verify-email/${encodeURIComponent(finalToken)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setStatus({
            type: "error",
            message:
              data.message ||
              "Verification failed. The link may be invalid or expired.",
          });
          return;
        }

        sessionStorage.removeItem("pendingVerificationEmail");

        setStatus({
          type: "success",
          message: "Email verified successfully. Redirecting to login...",
        });

        redirectTimer = setTimeout(() => {
          navigate("/hotel-login", { replace: true });
        }, 1200);
      } catch (error) {
        console.error("verifyEmail error:", error);

        setStatus({
          type: "error",
          message:
            "Network error while verifying your email. Please make sure the backend server is running.",
        });
      } finally {
        setLoading(false);
      }
    }

    verifyEmail();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [finalToken, navigate]);

  const handleProceed = () => {
    navigate("/hotel-login", { replace: true });
  };

  const handleResend = async () => {
    if (!email) {
      setStatus({
        type: "error",
        message: "No email found. Please sign up or log in again.",
      });
      return;
    }

    setResending(true);
    setStatus({
      type: "info",
      message: "Resending verification email...",
    });

    try {
      const response = await fetch(`${API_BASE}/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to resend verification email.",
        });
        return;
      }

      setStatus({
        type: "success",
        message:
          data.message || "Verification email has been sent successfully.",
      });
    } catch (error) {
      console.error("resend verification error:", error);

      setStatus({
        type: "error",
        message:
          "Network error while resending verification email. Please make sure the backend server is running.",
      });
    } finally {
      setResending(false);
    }
  };

  const statusClass =
    status.type === "success"
      ? "text-emerald-700"
      : status.type === "error"
      ? "text-red-600"
      : "text-[#2F5E3A]/80";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#e9e4d7] px-4 py-10">
      <div className="w-full max-w-4xl rounded-[32px] bg-white px-6 py-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.14)] sm:px-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <img
            src="/AccountVerification.jpg"
            alt="Account verification"
            className="h-auto w-[210px] sm:w-[250px]"
          />

          <h1 className="mt-8 text-3xl font-extrabold text-[#2F5E3A] sm:text-4xl">
            Verify your email address
          </h1>

          <p className="mt-5 max-w-xl font-semibold leading-relaxed text-[#2F5E3A]">
            {finalToken
              ? "Please wait while we verify your account."
              : "A verification link has been sent to"}{" "}
            {!finalToken && (
              <span className="font-extrabold">{maskedEmail}</span>
            )}
          </p>

          {status?.message && (
            <p className={`mt-6 text-sm font-semibold ${statusClass}`}>
              {status.message}
            </p>
          )}

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={handleProceed}
              disabled={loading}
              className="h-11 w-44 rounded-full bg-[#2F5E3A] font-semibold text-white shadow-sm transition hover:bg-[#24492d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Proceed to Login"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading || resending}
              className="h-11 w-44 rounded-full bg-[#2F5E3A] font-semibold text-white shadow-sm transition hover:bg-[#24492d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? "Resending..." : "Resend Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
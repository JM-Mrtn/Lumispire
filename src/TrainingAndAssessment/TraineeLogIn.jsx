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


const traineeResortStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@600;700;800;900&display=swap");

  .ltc-trainee-login-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --glass: rgba(255, 255, 255, 0.86);
    --shadow-md: 0 18px 45px rgba(8, 39, 25, 0.12);
    --shadow-lg: 0 32px 80px rgba(8, 39, 25, 0.2);
    --radius: 24px;
    --ease: cubic-bezier(.22, 1, .36, 1);

    min-height: 100vh;
    color: var(--dark);
    background:
      radial-gradient(circle at 12% 0%, rgba(215,168,77,.12), transparent 28%),
      radial-gradient(circle at 92% 12%, rgba(35,95,62,.12), transparent 30%),
      linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%);
    line-height: 1.65;
    letter-spacing: -.01em;
    overflow-x: hidden;
    font-family: "Inter", Arial, sans-serif;
  }

  .ltc-trainee-login-page * {
    box-sizing: border-box;
  }

  .ltc-trainee-login-container {
    width: min(1180px, 92%);
    margin: auto;
  }

  .ltc-trainee-login-header {
    position: sticky;
    top: 0;
    z-index: 50;
    width: 100%;
    background: var(--footer-green);
    border-bottom: 1px solid rgba(255,255,255,.1);
    box-shadow: 0 10px 34px rgba(7,31,20,.14);
    margin: 0;
  }

  .ltc-trainee-login-header .ltc-trainee-login-container {
    width: 100%;
    max-width: none;
    margin: 0;
    padding-left: 32px;
    padding-right: 32px;
  }

  .ltc-trainee-login-nav {
    min-height: 76px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }

  .ltc-trainee-login-logo {
    display: flex;
    align-items: center;
    gap: 13px;
    color: white;
    border: 0;
    background: transparent;
    cursor: pointer;
    text-align: left;
    padding: 0;
  }

  .ltc-trainee-login-logo-icon {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    background: white;
    object-fit: contain;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
  }

  .ltc-trainee-login-logo h1 {
    font-size: 18px;
    line-height: 1;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -.04em;
    margin: 0;
  }

  .ltc-trainee-login-logo p {
    font-size: 11px;
    color: rgba(255,255,255,.72);
    margin: 3px 0 0;
  }

  .ltc-trainee-login-desktop-nav {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ltc-trainee-login-nav-link {
    color: rgba(255,255,255,.78);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
    padding: 10px 14px;
    border-radius: 999px;
    transition: .25s var(--ease);
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .ltc-trainee-login-nav-link:hover,
  .ltc-trainee-login-nav-link.active {
    color: white;
    background: rgba(255,255,255,.13);
    transform: translateY(-1px);
  }

  .ltc-trainee-login-back-button {
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 14px 28px rgba(215,168,77,.18);
  }

  .ltc-trainee-login-menu-button {
    display: none;
    color: white;
    border: 0;
    background: rgba(255,255,255,.1);
    border-radius: 12px;
    padding: 10px 14px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-trainee-login-mobile-nav {
    display: none;
    border-top: 1px solid rgba(255,255,255,.1);
    padding: 8px 18px 18px;
    background: var(--footer-green);
  }

  .ltc-trainee-login-mobile-nav button {
    display: block;
    width: 100%;
    border: 0;
    background: transparent;
    color: rgba(255,255,255,.82);
    text-align: left;
    padding: 12px 14px;
    border-radius: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .08em;
  }

  .ltc-trainee-login-mobile-nav button:hover {
    color: white;
    background: rgba(255,255,255,.11);
  }

  .ltc-trainee-login-hero {
    position: relative;
    min-height: calc(100vh - 76px);
    overflow: hidden;
    isolation: isolate;
    display: flex;
    align-items: center;
    padding: 54px 0;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
  }

  .ltc-trainee-login-hero-bg {
    position: absolute;
    inset: 0;
    z-index: -4;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .32;
  }

  .ltc-trainee-login-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -3;
    background:
      linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.88) 42%, rgba(12,64,39,.76) 100%);
  }

  .ltc-trainee-login-hero::after {
    content: "";
    position: absolute;
    inset: -16% -10% -24%;
    z-index: -2;
    background:
      radial-gradient(circle at 16% 82%, rgba(19, 120, 72, 0.36), transparent 24%),
      radial-gradient(circle at 36% 92%, rgba(7, 76, 47, 0.46), transparent 30%),
      radial-gradient(circle at 72% 18%, rgba(28, 108, 68, 0.28), transparent 30%),
      radial-gradient(circle at 88% 44%, rgba(244, 212, 132, 0.14), transparent 28%),
      radial-gradient(circle at 90% 84%, rgba(22, 108, 66, 0.30), transparent 26%);
    filter: blur(30px);
    pointer-events: none;
  }

  .ltc-trainee-login-grid {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(380px, .78fr);
    align-items: center;
    gap: 44px;
  }

  .ltc-trainee-login-eyebrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(255,255,255,.11);
    color: var(--gold-soft);
    border-radius: 999px;
    padding: 12px 24px;
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .28em;
    text-transform: uppercase;
    backdrop-filter: blur(10px);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.14);
  }

  .ltc-trainee-login-title {
    margin: 22px 0 16px;
    max-width: 720px;
    color: white;
    font-size: clamp(48px, 6vw, 86px);
    line-height: .92;
    font-weight: 950;
    letter-spacing: -.075em;
  }

  .ltc-trainee-login-title span {
    color: var(--gold-soft);
  }

  .ltc-trainee-login-copy {
    max-width: 620px;
    color: rgba(255,255,255,.84);
    font-size: 18px;
    line-height: 1.75;
    margin: 0;
  }

  .ltc-trainee-login-points {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 30px;
    max-width: 700px;
  }

  .ltc-trainee-login-point {
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 20px;
    background: rgba(255,255,255,.09);
    padding: 16px;
    backdrop-filter: blur(10px);
  }

  .ltc-trainee-login-point strong {
    display: block;
    color: white;
    font-size: 14px;
    font-weight: 900;
    margin-bottom: 2px;
  }

  .ltc-trainee-login-point span {
    display: block;
    color: rgba(255,255,255,.66);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.45;
  }

  .ltc-trainee-login-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 30px;
    background: rgba(255,255,255,.92);
    box-shadow: var(--shadow-lg);
    padding: 34px;
    color: var(--dark);
    backdrop-filter: blur(18px);
  }

  .ltc-trainee-login-card::before {
    content: "";
    position: absolute;
    top: -90px;
    right: -90px;
    width: 190px;
    height: 190px;
    background: radial-gradient(circle, rgba(244,212,132,.36), transparent 66%);
    pointer-events: none;
  }

  .ltc-trainee-login-card-header {
    position: relative;
    text-align: center;
    margin-bottom: 24px;
  }


  .ltc-trainee-login-card-title {
    margin: 0;
    color: var(--green-950);
    font-size: 34px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -.05em;
  }

  .ltc-trainee-login-card-subtitle {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: 14px;
    font-weight: 700;
  }

  .ltc-trainee-login-alert {
    position: relative;
    border-radius: 18px;
    border: 1px solid rgba(8,39,25,.12);
    padding: 13px 15px;
    text-align: center;
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 18px;
  }

  .ltc-trainee-login-alert.success {
    border-color: rgba(16,185,129,.25);
    background: rgba(236,253,245,.95);
    color: #047857;
  }

  .ltc-trainee-login-alert.error {
    border-color: rgba(239,68,68,.22);
    background: rgba(254,242,242,.95);
    color: #b91c1c;
  }

  .ltc-trainee-login-form {
    position: relative;
    display: grid;
    gap: 18px;
  }

  .ltc-trainee-login-field label {
    display: block;
    margin-bottom: 8px;
    color: var(--green-950);
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-trainee-login-input-wrap {
    position: relative;
  }

  .ltc-trainee-login-input {
    width: 100%;
    min-height: 54px;
    border: 1px solid rgba(8,39,25,.14);
    border-radius: 18px;
    background: rgba(255,255,255,.9);
    color: var(--dark);
    outline: none;
    padding: 0 18px;
    font-size: 15px;
    font-weight: 700;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
    transition: .22s var(--ease);
  }

  .ltc-trainee-login-input.password {
    padding-right: 58px;
  }

  .ltc-trainee-login-input:focus {
    border-color: rgba(215,168,77,.8);
    box-shadow: 0 0 0 4px rgba(215,168,77,.16);
    transform: translateY(-1px);
  }

  .ltc-trainee-login-input.error {
    border-color: rgba(239,68,68,.55);
    box-shadow: 0 0 0 4px rgba(239,68,68,.10);
  }

  .ltc-trainee-login-eye-button {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    color: var(--green-800);
    cursor: pointer;
    padding: 6px;
    border-radius: 999px;
    transition: .22s var(--ease);
  }

  .ltc-trainee-login-eye-button:hover {
    background: rgba(8,39,25,.08);
  }

  .ltc-trainee-login-error-text {
    margin: 7px 0 0;
    color: #b91c1c;
    font-size: 12px;
    font-weight: 800;
  }

  .ltc-trainee-login-submit {
    width: 100%;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--gold-soft), var(--gold));
    color: #102418;
    min-height: 56px;
    padding: 0 24px;
    font-size: 15px;
    font-weight: 950;
    letter-spacing: .12em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 18px 34px rgba(215,168,77,.28);
    transition: .25s var(--ease);
  }

  .ltc-trainee-login-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 22px 42px rgba(215,168,77,.34);
  }

  .ltc-trainee-login-submit:disabled {
    cursor: not-allowed;
    opacity: .62;
  }

  .ltc-trainee-login-links {
    display: grid;
    gap: 8px;
    text-align: center;
    margin-top: 3px;
  }

  .ltc-trainee-login-links a {
    color: var(--green-800);
    font-weight: 900;
    text-decoration: none;
    transition: .22s var(--ease);
  }

  .ltc-trainee-login-links a:hover {
    color: var(--gold);
  }

  .ltc-trainee-login-links p {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
    font-weight: 700;
  }

  @media (max-width: 1024px) {
    .ltc-trainee-login-desktop-nav {
      display: none;
    }

    .ltc-trainee-login-menu-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .ltc-trainee-login-mobile-nav.open {
      display: block;
    }

    .ltc-trainee-login-grid {
      grid-template-columns: 1fr;
      gap: 32px;
      max-width: 760px;
      margin: 0 auto;
    }

    .ltc-trainee-login-hero-copy {
      text-align: center;
    }

    .ltc-trainee-login-title,
    .ltc-trainee-login-copy {
      margin-left: auto;
      margin-right: auto;
    }

    .ltc-trainee-login-points {
      margin-left: auto;
      margin-right: auto;
    }
  }

  @media (max-width: 680px) {
    .ltc-trainee-login-header .ltc-trainee-login-container {
      padding-left: 18px;
      padding-right: 18px;
    }

    .ltc-trainee-login-nav {
      min-height: 68px;
    }

    .ltc-trainee-login-logo-icon {
      width: 38px;
      height: 38px;
    }

    .ltc-trainee-login-logo h1 {
      font-size: 16px;
    }

    .ltc-trainee-login-logo p {
      display: none;
    }

    .ltc-trainee-login-hero {
      min-height: calc(100vh - 68px);
      padding: 32px 0;
    }

    .ltc-trainee-login-eyebrow {
      padding: 10px 16px;
      font-size: 10px;
      letter-spacing: .18em;
    }

    .ltc-trainee-login-title {
      font-size: clamp(40px, 12vw, 58px);
    }

    .ltc-trainee-login-copy {
      font-size: 15px;
    }

    .ltc-trainee-login-points {
      grid-template-columns: 1fr;
    }

    .ltc-trainee-login-card {
      border-radius: 24px;
      padding: 26px 20px;
    }

    .ltc-trainee-login-card-title {
      font-size: 28px;
    }
  }
`;

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
    <div className="ltc-trainee-login-page">
      <style>{traineeResortStyles}</style>

      <header className="ltc-trainee-login-header">
        <div className="ltc-trainee-login-container">
          <div className="ltc-trainee-login-nav">
            <button
              type="button"
              onClick={() => goTo("/training")}
              className="ltc-trainee-login-logo"
              aria-label="TAMSI Home"
            >
              <img
                src="/TAMSILogoTransparent.png"
                alt="TAMSI Logo"
                className="ltc-trainee-login-logo-icon"
              />

              <span>
                <h1>TAMSI</h1>
                <p>Training & Assessment</p>
              </span>
            </button>

            <nav className="ltc-trainee-login-desktop-nav">
              <button
                type="button"
                onClick={() => goTo("/training")}
                className="ltc-trainee-login-nav-link"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo("/training-course")}
                className="ltc-trainee-login-nav-link"
              >
                Course
              </button>

              <button
                type="button"
                onClick={() => goTo("/training-requirements")}
                className="ltc-trainee-login-nav-link"
              >
                Requirements
              </button>

              <button
                type="button"
                onClick={() => goTo("/training-contact-us")}
                className="ltc-trainee-login-nav-link"
              >
                Contact
              </button>

              <button
                type="button"
                onClick={() => goTo("/training-contact-us")}
                className="ltc-trainee-login-nav-link"
              >
                FAQs
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="ltc-trainee-login-nav-link ltc-trainee-login-back-button"
              >
                Back
              </button>
            </nav>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="ltc-trainee-login-menu-button"
            >
              Menu
            </button>
          </div>
        </div>

        <div
          className={`ltc-trainee-login-mobile-nav ${mobileOpen ? "open" : ""}`}
        >
          <button type="button" onClick={() => goTo("/training")}>
            Home
          </button>
          <button type="button" onClick={() => goTo("/training-course")}>
            Course
          </button>
          <button type="button" onClick={() => goTo("/training-requirements")}>
            Requirements
          </button>
          <button type="button" onClick={() => goTo("/training-contact-us")}>
            Contact
          </button>
          <button type="button" onClick={() => goTo("/training-contact-us")}>
            FAQs
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </header>

      <main>
        <section className="ltc-trainee-login-hero">
          <img
            src="/tamsi-building.jpg"
            alt="TAMSI Building"
            className="ltc-trainee-login-hero-bg"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/1600x900/d7ddd4/45674b?text=TAMSI+Training+And+Assessment";
            }}
          />

          <div className="ltc-trainee-login-container ltc-trainee-login-grid">
            <div className="ltc-trainee-login-hero-copy">
              <div className="ltc-trainee-login-eyebrow">Trainee Portal</div>

              <h2 className="ltc-trainee-login-title">
                Welcome <span>Back</span>
              </h2>

              <p className="ltc-trainee-login-copy">
                Sign in to access your TAMSI training dashboard, track your
                enrollment, and continue your assessment journey.
              </p>

              <div className="ltc-trainee-login-points" aria-hidden="true">
                <div className="ltc-trainee-login-point">
                  <strong>Secure Login</strong>
                  <span>Protected trainee access</span>
                </div>
                <div className="ltc-trainee-login-point">
                  <strong>Training Status</strong>
                  <span>Monitor progress easily</span>
                </div>
                <div className="ltc-trainee-login-point">
                  <strong>Fast Access</strong>
                  <span>Continue where you left off</span>
                </div>
              </div>
            </div>

            <div className="ltc-trainee-login-card">
              <div className="ltc-trainee-login-card-header">
                <h1 className="ltc-trainee-login-card-title">Trainee Login</h1>
                <p className="ltc-trainee-login-card-subtitle">
                  Enter your TAMSI email and password to continue.
                </p>
              </div>

              {msg.text && (
                <div
                  className={`ltc-trainee-login-alert ${
                    msg.type === "success" ? "success" : "error"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              <form onSubmit={submit} className="ltc-trainee-login-form">
                <div className="ltc-trainee-login-field">
                  <label>TAMSI Email</label>

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
                    className={`ltc-trainee-login-input ${
                      errors.email ? "error" : ""
                    }`}
                  />

                  {errors.email && (
                    <p className="ltc-trainee-login-error-text">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="ltc-trainee-login-field">
                  <label>Password</label>

                  <div className="ltc-trainee-login-input-wrap">
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
                      className={`ltc-trainee-login-input password ${
                        errors.password ? "error" : ""
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPw((prev) => !prev)}
                      className="ltc-trainee-login-eye-button"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="ltc-trainee-login-error-text">
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="ltc-trainee-login-submit"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>

                <div className="ltc-trainee-login-links">
                  <Link to="/trainee-forgot-password">Forgot Password?</Link>

                  <p>
                    Don&apos;t have account? <Link to="/training-enroll">Enroll Now</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

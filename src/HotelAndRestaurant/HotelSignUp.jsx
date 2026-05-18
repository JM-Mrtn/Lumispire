import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKGROUND_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const PHONE_PLACEHOLDER = "Phone Number";
const USERNAME_MIN_LENGTH = 5;
const USERNAME_MAX_LENGTH = 20;

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

function getHotelToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
}

const HotelSignUp = () => {
  const navigate = useNavigate();

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    if (raw.includes("/api/hotel")) return raw;
    if (raw.includes("/api/")) return raw;
    return `${raw}/api/hotel`;
  }, []);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);

  const nameRegex = /^[A-Za-z\s]+$/;
  const usernameRegex = /^[A-Za-z0-9]+$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setTouched((p) => ({ ...p, [key]: true }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const validateFirstName = (v) => {
    if (!v) return "First name is required";
    if (v.length > 20) return "First name must be max 20 characters";
    if (!nameRegex.test(v)) return "First name must contain letters only";
    return "";
  };

  const validateMiddleName = (v) => {
    if (!v) return "";
    if (v.length > 20) return "Middle name must be max 20 characters";
    if (!nameRegex.test(v)) return "Middle name must contain letters only";
    return "";
  };

  const validateLastName = (v) => {
    if (!v) return "Last name is required";
    if (v.length > 20) return "Last name must be max 20 characters";
    if (!nameRegex.test(v)) return "Last name must contain letters only";
    return "";
  };

  const validateUsername = (v) => {
    if (!v) return "Username is required";
    if (v.length < USERNAME_MIN_LENGTH) {
      return `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
    }
    if (v.length > USERNAME_MAX_LENGTH) {
      return `Username must be max ${USERNAME_MAX_LENGTH} characters`;
    }
    if (!usernameRegex.test(v)) return "Username must be letters/numbers only";
    return "";
  };

  const validateEmail = (v) => {
    if (!v) return "Email is required";
    if (v.length > 50) return "Email must be max 50 characters";
    if (!emailRegex.test(v)) return "Invalid email format";
    return "";
  };

  const validatePhone = (v) => {
    if (!v) return "Phone number is required";
    if (!/^\d+$/.test(v)) return "Phone number must be numeric only";
    if (!/^09\d{9}$/.test(v)) {
      return "Phone number must start with 09 and be exactly 11 digits.";
    }

    return "";
  };

  const validatePassword = (v) => {
    if (!v) return "Password is required";
    if (v.length < 6 || v.length > 20) return "Password must be 6–20 characters";
    if (!/[A-Z]/.test(v) || !/[a-z]/.test(v)) {
      return "Password must include uppercase and lowercase letters";
    }
    if (!/\d/.test(v)) return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(v)) return "Password must contain at least one symbol";
    if (form.username && v === form.username) return "Password must not match the username";
    return "";
  };

  const validateConfirmPassword = (v) => {
    if (!v) return "Confirm password is required";
    if (v !== form.password) return "Passwords do not match";
    return "";
  };

  const runAllValidation = () => {
    const next = {
      firstName: validateFirstName(form.firstName),
      middleName: validateMiddleName(form.middleName),
      lastName: validateLastName(form.lastName),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      username: validateUsername(form.username),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.confirmPassword),
    };

    if (!next.username && usernameAvailable === false) next.username = "Username already taken";
    if (!next.email && emailAvailable === false) next.email = "Email already exists";

    setErrors(next);
    return next;
  };

  const onNameChange = (key, raw) => {
    setField(key, raw.replace(/[^A-Za-z\s]/g, "").slice(0, 20));
  };

  const onUsernameChange = (raw) => {
    setField("username", raw.replace(/[^A-Za-z0-9]/g, "").slice(0, USERNAME_MAX_LENGTH));
    setUsernameAvailable(null);
  };

  const onEmailChange = (raw) => {
    setField("email", raw.replace(/\s/g, "").slice(0, 50));
    setEmailAvailable(null);
  };

  const onPhoneChange = (raw) => {
    setField("phone", raw.replace(/\D/g, "").slice(0, 11));
  };


  const onBlurTrim = (key) => {
    setForm((p) => ({ ...p, [key]: (p[key] || "").trim() }));
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const u = form.username.trim();
    const localErr = validateUsername(u);

    if (!u || localErr) {
      setCheckingUsername(false);
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/check-username?username=${encodeURIComponent(u)}`);

        if (!res.ok) {
          setUsernameAvailable(null);
          return;
        }

        const data = await res.json();
        setUsernameAvailable(data.available === true);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 450);

    return () => clearTimeout(t);
  }, [form.username, API_BASE]);

  useEffect(() => {
    const e = form.email.toLowerCase().trim();
    const localErr = validateEmail(e);

    if (!e || localErr) {
      setCheckingEmail(false);
      setEmailAvailable(null);
      return;
    }

    setCheckingEmail(true);

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/check-email?email=${encodeURIComponent(e)}`);

        if (!res.ok) {
          setEmailAvailable(null);
          return;
        }

        const data = await res.json();
        setEmailAvailable(data.available === true);
      } catch {
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 450);

    return () => clearTimeout(t);
  }, [form.email, API_BASE]);

  useEffect(() => {
    if (Object.keys(touched).length === 0) return;
    runAllValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, usernameAvailable, emailAvailable]);

  const canSubmit = useMemo(() => {
    const localErrors = {
      firstName: validateFirstName(form.firstName),
      middleName: validateMiddleName(form.middleName),
      lastName: validateLastName(form.lastName),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      username: validateUsername(form.username),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.confirmPassword),
    };

    const localOk = Object.values(localErrors).every((x) => !x);
    const uniqueOk = usernameAvailable !== false && emailAvailable !== false;
    const doneChecking = !checkingUsername && !checkingEmail;

    return localOk && uniqueOk && doneChecking && !isSubmitting;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, usernameAvailable, emailAvailable, checkingUsername, checkingEmail, isSubmitting]);

  const fieldError = (key) => (touched[key] ? errors[key] : "");

  const getStatusColor = (type) => {
    if (type === "ok") return "ltc-status-ok";
    if (type === "bad") return "ltc-status-bad";
    return "ltc-status-neutral";
  };

  const handleSignUp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    setTouched({
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      phone: true,
      username: true,
      password: true,
      confirmPassword: true,
    });

    const v = runAllValidation();
    const hasErrors = Object.values(v).some(Boolean);

    if (hasErrors || !canSubmit) {
      setIsSubmitting(false);
      return;
    }

    try {
      const signupEmail = form.email.toLowerCase().trim();

      const response = await fetch(`${API_BASE}/hotel-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          middleName: form.middleName.trim(),
          lastName: form.lastName.trim(),
          username: form.username.trim(),
          email: signupEmail,
          phone: form.phone,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 201) {
        sessionStorage.setItem("pendingVerificationEmail", signupEmail);
        setSuccessMessage("Account created successfully.");
        navigate("/email-confirmation", { state: { email: signupEmail } });
        return;
      }

      setErrorMessage(data.message || "There was an error during sign-up.");
    } catch (err) {
      console.error(err);
      setErrorMessage("There was an error signing up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToHome = () => navigate("/resort-venue");
  const goToContact = () => navigate("/hotel-contact-us");
  const goToLogIn = () => navigate("/hotel-login");

  const UserIcon = () => (
    <svg viewBox="0 0 24 24" className="ltc-input-icon-svg" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );

  const LockIcon = () => (
    <svg viewBox="0 0 24 24" className="ltc-input-icon-svg" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );

  const MailIcon = () => (
    <svg viewBox="0 0 24 24" className="ltc-input-icon-svg" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 8 8 6 8-6" />
    </svg>
  );

  const PhoneIcon = () => (
    <svg viewBox="0 0 24 24" className="ltc-input-icon-svg" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.68 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.25a2 2 0 0 1 2.11-.45c.84.33 1.72.56 2.62.68A2 2 0 0 1 22 16.92Z"
      />
    </svg>
  );

  const EyeIcon = ({ open }) => (
    <svg viewBox="0 0 24 24" className="ltc-input-icon-svg" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
      />
      <circle cx="12" cy="12" r="2.75" />
      {!open && <path strokeLinecap="round" d="M4 20L20 4" />}
    </svg>
  );

  const CrownLogo = () => (
    <button type="button" onClick={() => navigate("/resort-venue")} className="ltc-logo" aria-label="Go to hotel home">
      <img
        src="/HotelLogo.png"
        alt="Hotel logo"
        className="ltc-logo-icon"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      <div>
        <h1 style={fontMontserrat}>Hotel &amp; Resort</h1>
        <p style={fontPontano}>Resort, venue, hotel, and events booking services.</p>
      </div>
    </button>
  );


  return (
    <div className="ltc-hotel-signup-page" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .ltc-hotel-signup-page {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
          --footer-green: #082719;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --dark: #101828;
          --muted: #667085;
          --shadow-lg: 0 28px 70px rgba(8,39,25,.18);
          --radius: 24px;
          --ease: cubic-bezier(.22,1,.36,1);

          min-height: 100vh;
          color: var(--dark);
          overflow-x: hidden;
          font-family: "Inter", Arial, sans-serif;
        }

        .ltc-hotel-signup-page * {
          box-sizing: border-box;
        }

        .ltc-signup-shell {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          isolation: isolate;
          color: white;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
        }

        .ltc-login-bg {
          position: absolute;
          inset: 0;
          z-index: -4;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 1000ms ease;
        }

        .ltc-login-bg.active {
          opacity: 1;
        }

        .ltc-signup-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -3;
          background:
            linear-gradient(
              120deg,
              rgba(2, 18, 11, 0.96) 0%,
              rgba(5, 37, 23, 0.88) 42%,
              rgba(12, 64, 39, 0.76) 100%
            );
          opacity: .98;
        }

        .ltc-signup-shell::after {
          content: "";
          position: absolute;
          inset: -16% -10% -24% -10%;
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

        .ltc-container {
          width: min(1180px, 92%);
          margin: auto;
        }

        .ltc-header {
          position: relative;
          z-index: 20;
          width: 100%;
          background: var(--footer-green);
          border-bottom: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 10px 34px rgba(7,31,20,.14);
          margin: 0;
        }

        .ltc-header .ltc-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding-left: 32px;
          padding-right: 32px;
        }

        .ltc-nav {
          min-height: 76px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .ltc-logo {
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

        .ltc-logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background: white;
          object-fit: cover;
          box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
        }

        .ltc-logo h1 {
          font-size: 18px;
          line-height: 1;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -.04em;
          margin: 0;
        }

        .ltc-logo p {
          font-size: 11px;
          color: rgba(255,255,255,.72);
          margin: 3px 0 0;
        }

        .ltc-desktop-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ltc-nav-link {
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

        .ltc-nav-link:hover,
        .ltc-nav-link.active {
          color: white;
          background: rgba(255,255,255,.13);
          transform: translateY(-1px);
        }

        .ltc-profile-button {
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 14px 28px rgba(215,168,77,.18);
        }

        .ltc-menu-button {
          display: none;
          color: white;
          border: 0;
          background: rgba(255,255,255,.1);
          border-radius: 12px;
          padding: 10px;
          cursor: pointer;
        }

        .ltc-menu-button svg {
          width: 24px;
          height: 24px;
        }

        .ltc-sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(0,0,0,.42);
        }

        .ltc-sidebar-panel {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: min(310px, 86vw);
          background: white;
          box-shadow: -20px 0 60px rgba(0,0,0,.25);
          padding: 20px;
        }

        .ltc-sidebar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(16,24,40,.1);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .ltc-sidebar-title {
          color: var(--green-950);
          font-weight: 900;
          letter-spacing: .14em;
          font-size: 12px;
          margin: 0;
        }

        .ltc-sidebar-close {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 0;
          background: #f2f4f7;
          color: #101828;
          cursor: pointer;
        }

        .ltc-sidebar-link {
          display: block;
          width: 100%;
          border: 0;
          background: transparent;
          color: #101828;
          text-align: left;
          border-radius: 14px;
          padding: 13px 14px;
          font-weight: 800;
          margin-bottom: 8px;
          cursor: pointer;
        }

        .ltc-sidebar-link:hover,
        .ltc-sidebar-link.active {
          background: var(--green-800);
          color: white;
        }

        .ltc-signup-main {
          position: relative;
          z-index: 5;
          min-height: calc(100vh - 76px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 44px 0;
        }

        .ltc-login-card {
          position: relative;
          overflow: hidden;
          width: min(720px, 100%);
          border-radius: 28px;
          background: rgba(231,238,233,.88);
          border: 1px solid rgba(255,255,255,.78);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(18px);
          padding: 28px 34px 30px;
        }

        .ltc-login-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 5px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          z-index: 3;
        }

        .ltc-card-title {
          text-align: center;
          margin-bottom: 24px;
        }

        .ltc-card-title p {
          margin: 0;
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .2em;
        }

        .ltc-card-title h1 {
          margin: 8px 0 0;
          color: var(--green-950);
          font-size: clamp(36px, 4vw, 50px);
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: -.055em;
        }

        .ltc-card-title h1 span {
          color: var(--gold);
        }

        .ltc-error-alert,
        .ltc-success-alert {
          margin-bottom: 14px;
          border-radius: 14px;
          padding: 10px 14px;
          text-align: center;
          font-size: 12px;
          line-height: 1.45;
          font-weight: 700;
        }

        .ltc-error-alert {
          border: 1px solid rgba(239,68,68,.22);
          background: rgba(239,68,68,.10);
          color: #b42318;
        }

        .ltc-success-alert {
          border: 1px solid rgba(16,185,129,.25);
          background: rgba(16,185,129,.10);
          color: #047857;
        }

        .ltc-login-form {
          display: grid;
          gap: 12px;
        }

        .ltc-form-grid {
          display: grid;
          gap: 12px;
        }

        .ltc-form-grid.three {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .ltc-form-grid.two {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .ltc-field-wrap {
          display: grid;
          grid-template-rows: 46px minmax(14px, auto);
          gap: 5px;
          min-width: 0;
          align-content: start;
        }

        .ltc-input-shell {
          position: relative;
          min-width: 0;
          height: 46px;
          min-height: 46px;
          flex: 0 0 46px;
        }

        .ltc-input-icon {
          pointer-events: none;
          position: absolute;
          left: 15px;
          top: 23px;
          transform: translateY(-50%);
          color: var(--green-700);
          display: grid;
          place-items: center;
          z-index: 2;
        }

        .ltc-input-icon-svg {
          width: 18px;
          height: 18px;
        }

        .ltc-eye-button {
          position: absolute;
          right: 15px;
          top: 23px;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: var(--green-700);
          cursor: pointer;
          display: grid;
          place-items: center;
          padding: 0;
          transition: .25s var(--ease);
          z-index: 2;
        }

        .ltc-eye-button:hover {
          color: var(--green-950);
          transform: translateY(-50%) scale(1.05);
        }

        .ltc-input,
        .ltc-select {
          display: block;
          width: 100%;
          height: 46px;
          min-height: 46px;
          max-height: 46px;
          border: 1px solid rgba(35,95,62,.10);
          background: rgba(255,255,255,.92);
          color: var(--dark);
          border-radius: 999px;
          font-size: 13.5px;
          line-height: 46px;
          outline: none;
          transition: .25s var(--ease);
          font-family: inherit;
          box-shadow: 0 8px 18px rgba(8,39,25,.045);
        }

        .ltc-input {
          padding: 0 15px 0 45px;
        }

        .ltc-select {
          padding: 0 16px;
          cursor: pointer;
          appearance: auto;
        }

        .ltc-input.has-eye {
          padding-right: 48px;
        }

        .ltc-input::placeholder {
          color: rgba(102,112,133,.74);
        }

        .ltc-input:focus,
        .ltc-select:focus {
          border-color: var(--green-700);
          background: white;
          box-shadow: 0 0 0 4px rgba(35,95,62,.10);
        }

        .ltc-input.error,
        .ltc-select.error {
          border-color: rgba(239,68,68,.55);
          box-shadow: 0 0 0 4px rgba(239,68,68,.08);
        }

        .ltc-field-error,
        .ltc-status-text {
          min-height: 14px;
          margin: 0;
          padding: 0 14px;
          font-size: 10.5px;
          line-height: 1.35;
        }

        .ltc-field-error,
        .ltc-status-bad {
          color: #b42318;
        }

        .ltc-status-ok {
          color: #047857;
        }

        .ltc-status-neutral {
          color: var(--muted);
        }

        .ltc-submit-button {
          margin: 8px auto 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          width: 100%;
          border-radius: 999px;
          border: 0;
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 14px 30px rgba(215,168,77,.25);
          font-size: 13.5px;
          font-weight: 900;
          cursor: pointer;
          transition: .28s var(--ease);
        }

        .ltc-submit-button:hover {
          transform: translateY(-2px);
        }

        .ltc-submit-button:disabled {
          cursor: not-allowed;
          opacity: .6;
          transform: none;
        }

        .ltc-auth-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.5;
          text-align: center;
        }

        .ltc-auth-links button {
          border: 0;
          background: transparent;
          color: var(--green-800);
          font-weight: 900;
          cursor: pointer;
          padding: 0;
          transition: .25s var(--ease);
        }

        .ltc-auth-links button:hover {
          color: var(--green-950);
          text-decoration: underline;
          text-underline-offset: 4px;
        }


        .ltc-footer {
          width: 100%;
          background: var(--footer-green);
          color: white;
          padding: 30px 0 12px;
          margin: 0;
        }

        .ltc-footer .ltc-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding-left: 32px;
          padding-right: 32px;
        }

        .ltc-footer-grid {
          width: 100%;
          display: grid;
          grid-template-columns: 1.1fr .75fr 1.1fr 1.1fr 1fr;
          gap: 22px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .ltc-footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ltc-footer-brand img {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          object-fit: cover;
        }

        .ltc-footer h4 {
          color: white;
          font-weight: 900;
          font-size: 20px;
          line-height: 1.2;
          margin: 0;
          text-transform: uppercase;
        }

        .ltc-footer h5 {
          color: #f4d484;
          font-size: 12px;
          line-height: 1.2;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .14em;
          margin: 0 0 10px;
        }

        .ltc-footer p,
        .ltc-footer-link {
          display: block;
          color: rgba(255,255,255,.68);
          font-size: 13px;
          line-height: 1.55;
          margin: 5px 0;
        }

        .ltc-footer-small-text {
          font-size: 12px !important;
          line-height: 1.42 !important;
          margin: 4px 0 !important;
        }

        .ltc-footer-small-text strong {
          font-size: 12px !important;
          line-height: 1.42 !important;
        }

        .ltc-footer-link {
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          text-align: left;
        }

        .ltc-footer-link:hover {
          color: white;
          text-decoration: underline;
        }

        .ltc-facebook-link {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 999px;
          background: rgba(255,255,255,.10);
          color: white;
          cursor: pointer;
          transition: .25s var(--ease);
          margin-top: 6px;
        }

        .ltc-facebook-link:hover {
          color: #f4d484;
          border-color: rgba(244,212,132,.42);
          background: rgba(244,212,132,.12);
          transform: translateY(-2px);
        }

        .ltc-facebook-link svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }

        .ltc-copyright {
          width: 100%;
          padding-top: 14px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: rgba(255,255,255,.52);
          font-size: 12px;
          line-height: 1.4;
        }

        @media (max-width: 900px) {
          .ltc-header .ltc-container {
            padding-left: 22px;
            padding-right: 22px;
          }

          .ltc-nav {
            min-height: auto;
            padding: 18px 0;
          }

          .ltc-desktop-nav {
            display: none;
          }

          .ltc-menu-button {
            display: grid;
            place-items: center;
          }

          .ltc-footer {
            padding: 28px 0 12px;
          }

          .ltc-footer-grid {
            grid-template-columns: 1fr;
            gap: 18px;
            padding-bottom: 22px;
          }

          .ltc-footer .ltc-container {
            padding-left: 22px;
            padding-right: 22px;
          }

          .ltc-copyright {
            flex-direction: column;
          }

          .ltc-form-grid.three,
          .ltc-form-grid.two {
            grid-template-columns: 1fr;
          }

          .ltc-login-card {
            width: min(520px, 100%);
          }
        }

        @media (max-width: 600px) {
          .ltc-header .ltc-container,
          .ltc-footer .ltc-container {
            padding-left: 16px;
            padding-right: 16px;
          }

          .ltc-logo h1 {
            font-size: 14px;
          }

          .ltc-logo p {
            font-size: 10px;
          }



          .ltc-signup-main {
            min-height: auto;
            padding: 32px 0 44px;
          }

          .ltc-login-card {
            padding: 24px 18px;
            border-radius: 24px;
          }

          .ltc-card-title h1 {
            font-size: 36px;
          }

          .ltc-auth-links {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="ltc-signup-shell">
        {BACKGROUND_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`ltc-login-bg ${bgIndex === index ? "active" : ""}`}
            style={{
              backgroundImage: `url('${image}')`,
            }}
          />
        ))}

        <header className="ltc-header">
          <div className="ltc-container ltc-nav">
            <CrownLogo />

            <nav className="ltc-desktop-nav" style={fontPoppins}>
              <button type="button" onClick={goToHome} className="ltc-nav-link">
                HOME
              </button>

              <button
                type="button"
                onClick={() => navigate("/virtual-tour")}
                className="ltc-nav-link"
              >
                VIRTUAL TOUR
              </button>

              <button type="button" onClick={goToContact} className="ltc-nav-link">
                CONTACT
              </button>

              <button
                type="button"
                onClick={() => navigate("/hotel-faqs")}
                className="ltc-nav-link"
              >
                FAQS
              </button>

              <button
                type="button"
                onClick={goToLogIn}
                className="ltc-nav-link ltc-profile-button"
              >
                SIGN IN
              </button>
            </nav>

            <button
              onClick={() => setIsOpen(true)}
              type="button"
              aria-label="Open menu"
              className="ltc-menu-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <main className="ltc-container ltc-signup-main">
          <section className="ltc-login-card">
            <div className="ltc-card-title">
              <p style={fontMontserrat}>Create Your Account</p>

              <h1 style={fontMontserrat}>
                 <span></span>
              </h1>
            </div>

            {errorMessage ? (
              <div className="ltc-error-alert" style={fontPoppins}>
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="ltc-success-alert" style={fontPoppins}>
                {successMessage}
              </div>
            ) : null}

            <form
              className="ltc-login-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!isSubmitting) handleSignUp();
              }}
            >
              <div className="ltc-form-grid three">
                <div className="ltc-field-wrap">
                  <div className="ltc-input-shell">
                    <span className="ltc-input-icon">
                      <UserIcon />
                    </span>

                    <input
                      type="text"
                      maxLength={20}
                      placeholder="First Name"
                      className={`ltc-input ${fieldError("firstName") ? "error" : ""}`}
                      style={fontPoppins}
                      value={form.firstName}
                      onChange={(e) => onNameChange("firstName", e.target.value)}
                      onBlur={() => onBlurTrim("firstName")}
                    />
                  </div>

                  {fieldError("firstName") ? (
                    <p className="ltc-field-error" style={fontPoppins}>
                      {fieldError("firstName")}
                    </p>
                  ) : null}
                </div>

                <div className="ltc-field-wrap">
                  <div className="ltc-input-shell">
                    <span className="ltc-input-icon">
                      <UserIcon />
                    </span>

                    <input
                      type="text"
                      maxLength={20}
                      placeholder="Middle Name"
                      className={`ltc-input ${fieldError("middleName") ? "error" : ""}`}
                      style={fontPoppins}
                      value={form.middleName}
                      onChange={(e) => onNameChange("middleName", e.target.value)}
                      onBlur={() => onBlurTrim("middleName")}
                    />
                  </div>

                  {fieldError("middleName") ? (
                    <p className="ltc-field-error" style={fontPoppins}>
                      {fieldError("middleName")}
                    </p>
                  ) : null}
                </div>

                <div className="ltc-field-wrap">
                  <div className="ltc-input-shell">
                    <span className="ltc-input-icon">
                      <UserIcon />
                    </span>

                    <input
                      type="text"
                      maxLength={20}
                      placeholder="Last Name"
                      className={`ltc-input ${fieldError("lastName") ? "error" : ""}`}
                      style={fontPoppins}
                      value={form.lastName}
                      onChange={(e) => onNameChange("lastName", e.target.value)}
                      onBlur={() => onBlurTrim("lastName")}
                    />
                  </div>

                  {fieldError("lastName") ? (
                    <p className="ltc-field-error" style={fontPoppins}>
                      {fieldError("lastName")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="ltc-form-grid two">
                <div className="ltc-field-wrap">
                  <div className="ltc-input-shell">
                    <span className="ltc-input-icon">
                      <PhoneIcon />
                    </span>

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder={PHONE_PLACEHOLDER}
                      className={`ltc-input ${fieldError("phone") ? "error" : ""}`}
                      style={fontPoppins}
                      value={form.phone}
                      onChange={(e) => onPhoneChange(e.target.value)}
                    />
                  </div>

                  {fieldError("phone") ? (
                    <p className="ltc-field-error" style={fontPoppins}>
                      {fieldError("phone")}
                    </p>
                  ) : null}
                </div>

                <div className="ltc-field-wrap">
                  <div className="ltc-input-shell">
                    <span className="ltc-input-icon">
                      <UserIcon />
                    </span>

                    <input
                      type="text"
                      maxLength={USERNAME_MAX_LENGTH}
                      placeholder="Username"
                      className={`ltc-input ${fieldError("username") ? "error" : ""}`}
                      style={fontPoppins}
                      value={form.username}
                      onChange={(e) => onUsernameChange(e.target.value)}
                      onBlur={() => onBlurTrim("username")}
                    />
                  </div>

                  {fieldError("username") ? (
                    <p className="ltc-field-error" style={fontPoppins}>
                      {fieldError("username")}
                    </p>
                  ) : null}

                  {!errors.username && usernameAvailable === false ? (
                    <p className={`ltc-status-text ${getStatusColor("bad")}`} style={fontPoppins}>
                      Username already taken
                    </p>
                  ) : null}

                  {!errors.username && usernameAvailable === true ? (
                    <p className={`ltc-status-text ${getStatusColor("ok")}`} style={fontPoppins}>
                      Username is available
                    </p>
                  ) : null}

                  {checkingUsername ? (
                    <p className={`ltc-status-text ${getStatusColor("neutral")}`} style={fontPoppins}>
                      Checking...
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="ltc-form-grid two">
                <div className="ltc-field-wrap">
                  <div className="ltc-input-shell">
                    <span className="ltc-input-icon">
                      <LockIcon />
                    </span>

                    <input
                      type={showPassword ? "text" : "password"}
                      maxLength={20}
                      placeholder="Password"
                      className={`ltc-input has-eye ${fieldError("password") ? "error" : ""}`}
                      style={fontPoppins}
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="ltc-eye-button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>

                  {fieldError("password") ? (
                    <p className="ltc-field-error" style={fontPoppins}>
                      {fieldError("password")}
                    </p>
                  ) : null}
                </div>

                <div className="ltc-field-wrap">
                  <div className="ltc-input-shell">
                    <span className="ltc-input-icon">
                      <LockIcon />
                    </span>

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      maxLength={20}
                      placeholder="Confirm Password"
                      className={`ltc-input has-eye ${fieldError("confirmPassword") ? "error" : ""}`}
                      style={fontPoppins}
                      value={form.confirmPassword}
                      onChange={(e) => setField("confirmPassword", e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="ltc-eye-button"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      <EyeIcon open={showConfirmPassword} />
                    </button>
                  </div>

                  {fieldError("confirmPassword") ? (
                    <p className="ltc-field-error" style={fontPoppins}>
                      {fieldError("confirmPassword")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="ltc-field-wrap">
                <div className="ltc-input-shell">
                  <span className="ltc-input-icon">
                    <MailIcon />
                  </span>

                  <input
                    type="email"
                    maxLength={50}
                    placeholder="Email"
                    className={`ltc-input ${fieldError("email") ? "error" : ""}`}
                    style={fontPoppins}
                    value={form.email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    onBlur={() => onBlurTrim("email")}
                  />
                </div>

                {fieldError("email") ? (
                  <p className="ltc-field-error" style={fontPoppins}>
                    {fieldError("email")}
                  </p>
                ) : null}

                {!errors.email && emailAvailable === false ? (
                  <p className={`ltc-status-text ${getStatusColor("bad")}`} style={fontPoppins}>
                    Email already exists
                  </p>
                ) : null}

                {!errors.email && emailAvailable === true ? (
                  <p className={`ltc-status-text ${getStatusColor("ok")}`} style={fontPoppins}>
                    Email is available
                  </p>
                ) : null}

                {checkingEmail ? (
                  <p className={`ltc-status-text ${getStatusColor("neutral")}`} style={fontPoppins}>
                    Checking...
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="ltc-submit-button"
                style={fontMontserrat}
              >
                {isSubmitting ? "CREATING..." : "SIGN UP"}
              </button>

              <div className="ltc-auth-links" style={fontPoppins}>
                <span>Already have an account?</span>

                <button type="button" onClick={goToLogIn}>
                  Sign In
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>

      {isOpen ? (
        <MobileMenu
          onClose={() => setIsOpen(false)}
          navigate={navigate}
          goToProfile={() => navigate(getHotelToken() ? "/hotel-profile" : "/hotel-login")}
        />
      ) : null}

      <Footer />
    </div>
  );
};


function Footer() {
  return (
    <footer className="ltc-footer">
      <div className="ltc-container ltc-footer-grid">
        <div>
          <div className="ltc-footer-brand">
            <img
              src="/HotelLumispireLogo.png"
              alt="Lumispire logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <h4 style={fontMontserrat}>Lumispire</h4>
          </div>
        </div>

        <FooterColumn title="Menu">
          <FooterLink onClick={() => (window.location.href = "/resort-venue")}>Home</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/virtual-tour")}>
            Virtual Tour
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-contact-us")}>
            Contact
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-faqs")}>FAQs</FooterLink>
          <FooterLink
            onClick={() => {
              window.location.href = getHotelToken() ? "/hotel-profile" : "/hotel-login";
            }}
          >
            {getHotelToken() ? "Profile" : "Sign In"}
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Resort">
          <FooterText className="ltc-footer-small-text">
            <strong>Address:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">
            Ecotrend Subdivision San Nicolas, Bacoor Cavite
          </FooterText>

          <FooterText className="ltc-footer-small-text">
            <strong>Contact No.:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">+63 9953781962</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9064191405</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9338699988</FooterText>
        </FooterColumn>

        <FooterColumn title="Hotel">
          <FooterText className="ltc-footer-small-text">
            <strong>Address:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">
            2/F 5441 Currie Street, Palanan, Makati City
          </FooterText>

          <FooterText className="ltc-footer-small-text">
            <strong>Contact No.:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">+63 9064191405</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9338699988</FooterText>
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>recruitment@ltcmultiservices.com</FooterText>
          <FooterText>marketing@ltcmultiservices.com</FooterText>
          <FooterText>lorenzoeventandvenue@gmail.com</FooterText>
          <FacebookLink />
        </FooterColumn>
      </div>

      <div className="ltc-container ltc-copyright">
        <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
        <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
      </div>
    </footer>
  );
}

function FacebookLink() {
  return (
    <button
      type="button"
      className="ltc-facebook-link"
      aria-label="Open Facebook page"
      title="Facebook"
      onClick={() => {
        window.open(
          "https://www.facebook.com/4delorenzo?rdid=2DsYHS1ll77JUW6K&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18wf6uHcfv%2F#",
          "_blank",
          "noopener,noreferrer"
        );
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.9h2.77l-.44 2.91h-2.33V22c4.78-.76 8.45-4.92 8.45-9.94Z" />
      </svg>
    </button>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h5 style={fontMontserrat}>{title}</h5>
      <div>{children}</div>
    </div>
  );
}

function FooterLink({ children, onClick }) {
  return (
    <button onClick={onClick} type="button" className="ltc-footer-link" style={fontPontano}>
      {children}
    </button>
  );
}

function FooterText({ children, className = "" }) {
  return (
    <p className={className} style={fontPontano}>
      {children}
    </p>
  );
}

function MobileMenu({ onClose, navigate, goToProfile }) {
  const signedIn = getHotelToken();

  return (
    <div className="ltc-sidebar-overlay">
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <div className="ltc-sidebar-panel">
        <div className="ltc-sidebar-top">
          <p className="ltc-sidebar-title" style={fontPoppins}>
            MENU
          </p>

          <button
            onClick={onClose}
            className="ltc-sidebar-close"
            aria-label="Close menu"
            type="button"
          >
            ✕
          </button>
        </div>

        <MenuItem
          label="HOME"
          onClick={() => {
            onClose();
            navigate("/resort-venue");
          }}
        />

        <MenuItem
          label="VIRTUAL TOUR"
          onClick={() => {
            onClose();
            navigate("/virtual-tour");
          }}
        />

        <MenuItem
          label="CONTACT"
          onClick={() => {
            onClose();
            navigate("/hotel-contact-us");
          }}
        />

        <MenuItem
          label="FAQS"
          onClick={() => {
            onClose();
            navigate("/hotel-faqs");
          }}
        />

        <MenuItem
          label={signedIn ? "PROFILE" : "SIGN IN"}
          active={!signedIn}
          onClick={() => {
            onClose();
            goToProfile();
          }}
        />
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`ltc-sidebar-link ${active ? "active" : ""}`}
      style={fontPoppins}
    >
      {label}
    </button>
  );
}


export default HotelSignUp;
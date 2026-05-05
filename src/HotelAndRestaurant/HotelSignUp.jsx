import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setTouched((p) => ({ ...p, [key]: true }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const nameRegex = /^[A-Za-z\s]+$/;
  const usernameRegex = /^[A-Za-z0-9]+$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateFirstName = (v) => {
    if (!v) return "First name is required";
    if (v.length > 20) return "First name must be max 20 characters";
    if (!nameRegex.test(v)) return "First name must contain letters only";
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
    if (v.length > 20) return "Username must be max 20 characters";
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
    if (v.length !== 11) return "Phone number must be 11 digits";
    if (!v.startsWith("09")) return "Phone number must start with 09";
    return "";
  };

  const passwordChecks = useMemo(() => {
    const pw = form.password || "";
    const u = form.username || "";
    return {
      lenOK: pw.length >= 6 && pw.length <= 20,
      hasUpper: /[A-Z]/.test(pw),
      hasLower: /[a-z]/.test(pw),
      hasSymbol: /[^A-Za-z0-9]/.test(pw),
      notUsername: pw && u ? pw !== u : true,
    };
  }, [form.password, form.username]);

  const validatePassword = (v) => {
    if (!v) return "Password is required";
    if (v.length < 6 || v.length > 20) return "Password must be 6–20 characters";
    if (!/[A-Z]/.test(v) || !/[a-z]/.test(v)) {
      return "Password must include uppercase and lowercase letters";
    }
    if (!/[^A-Za-z0-9]/.test(v)) {
      return "Password must contain at least one symbol";
    }
    if (form.username && v === form.username) {
      return "Password must not match the username";
    }
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
      lastName: validateLastName(form.lastName),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      username: validateUsername(form.username),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.confirmPassword),
    };

    if (!next.username && usernameAvailable === false) {
      next.username = "Username already taken";
    }
    if (!next.email && emailAvailable === false) {
      next.email = "Email already exists";
    }

    setErrors(next);
    return next;
  };

  const onNameChange = (key, raw) => {
    setField(key, raw.replace(/[^A-Za-z\s]/g, "").slice(0, 20));
  };

  const onUsernameChange = (raw) => {
    setField("username", raw.replace(/[^A-Za-z0-9]/g, "").slice(0, 20));
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
        const res = await fetch(
          `${API_BASE}/check-username?username=${encodeURIComponent(u)}`
        );

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
        const res = await fetch(
          `${API_BASE}/check-email?email=${encodeURIComponent(e)}`
        );

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
  }, [form, usernameAvailable, emailAvailable]);

  const canSubmit = useMemo(() => {
    const localErrors = {
      firstName: validateFirstName(form.firstName),
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
  }, [form, usernameAvailable, emailAvailable, checkingUsername, checkingEmail, isSubmitting]);

  const fieldError = (key) => (touched[key] ? errors[key] : "");

  const getStatusColor = (type) => {
    if (type === "ok") return "text-emerald-200";
    if (type === "bad") return "text-red-200";
    return "text-white/80";
  };

  const reqItem = (ok, text) => (
    <li className={`flex items-center gap-2 ${ok ? "text-emerald-200" : "text-red-200"}`}>
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-emerald-300" : "bg-red-300"}`} />
      {text}
    </li>
  );

  const handleSignUp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    setTouched({
      firstName: true,
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

  const goToHome = () => navigate("/");
  const goToContact = () => navigate("/contact-us");
  const goToLogIn = () => navigate("/hotel-login");

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

  const MailIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 8 8 6 8-6" />
    </svg>
  );

  const PhoneIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.68 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.25a2 2 0 0 1 2.11-.45c.84.33 1.72.56 2.62.68A2 2 0 0 1 22 16.92Z"
      />
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

  const inputBase =
    "h-[46px] w-full rounded-full border border-white/80 bg-white/18 pl-12 pr-5 text-[15px] text-white placeholder:text-white/85 focus:outline-none focus:ring-2 focus:ring-white/30";

  const fieldBorder = (key) =>
    fieldError(key) ? "border-red-300" : "border-white/80";

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
        <div className="w-full max-w-[900px]">
          <div className="mx-auto w-full max-w-[620px] rounded-[26px] border border-white/65 bg-white/10 px-5 pb-5 pt-6 shadow-[0_10px_45px_rgba(0,0,0,0.28)] backdrop-blur-[10px] sm:px-8 sm:pb-6 sm:pt-7">
            <div className="text-center">
              <p
                className="text-[24px] leading-none tracking-[0.08em] text-white sm:text-[34px]"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
              >
                PATIO DE
              </p>
              <h1
                className="-mt-1 text-[40px] leading-none tracking-[0.03em] text-white sm:text-[58px]"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}
              >
                LORENZO
              </h1>
            </div>

            {errorMessage ? (
              <div
                className="mt-4 rounded-xl border border-red-200/70 bg-red-500/15 px-4 py-3 text-center text-sm text-white"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div
                className="mt-4 rounded-xl border border-emerald-200/70 bg-emerald-500/15 px-4 py-3 text-center text-sm text-white"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {successMessage}
              </div>
            ) : null}

            <form
              className="mt-6 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!isSubmitting) handleSignUp();
              }}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/90">
                      <UserIcon />
                    </span>
                    <input
                      type="text"
                      maxLength={20}
                      placeholder="First Name"
                      className={`${inputBase} ${fieldBorder("firstName")}`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                      value={form.firstName}
                      onChange={(e) => onNameChange("firstName", e.target.value)}
                      onBlur={() => onBlurTrim("firstName")}
                    />
                  </div>
                  {!!fieldError("firstName") && (
                    <p className="mt-1 px-3 text-[11px] text-red-200">{fieldError("firstName")}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/90">
                      <UserIcon />
                    </span>
                    <input
                      type="text"
                      maxLength={20}
                      placeholder="Last Name"
                      className={`${inputBase} ${fieldBorder("lastName")}`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                      value={form.lastName}
                      onChange={(e) => onNameChange("lastName", e.target.value)}
                      onBlur={() => onBlurTrim("lastName")}
                    />
                  </div>
                  {!!fieldError("lastName") && (
                    <p className="mt-1 px-3 text-[11px] text-red-200">{fieldError("lastName")}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/90">
                      <PhoneIcon />
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="Phone Number"
                      className={`${inputBase} ${fieldBorder("phone")}`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                      value={form.phone}
                      onChange={(e) => onPhoneChange(e.target.value)}
                    />
                  </div>
                  {!!fieldError("phone") && (
                    <p className="mt-1 px-3 text-[11px] text-red-200">{fieldError("phone")}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/90">
                      <UserIcon />
                    </span>
                    <input
                      type="text"
                      maxLength={20}
                      placeholder="Username"
                      className={`${inputBase} ${fieldBorder("username")}`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                      value={form.username}
                      onChange={(e) => onUsernameChange(e.target.value)}
                      onBlur={() => onBlurTrim("username")}
                    />
                  </div>
                  <div className="mt-1 px-3 text-[11px]">
                    {!!fieldError("username") && (
                      <p className="text-red-200">{fieldError("username")}</p>
                    )}
                    {!errors.username && usernameAvailable === false && (
                      <p className={getStatusColor("bad")}>Username already taken</p>
                    )}
                    {!errors.username && usernameAvailable === true && (
                      <p className={getStatusColor("ok")}>Username is available</p>
                    )}
                    {checkingUsername && (
                      <p className={getStatusColor("neutral")}>Checking…</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/90">
                      <LockIcon />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      maxLength={20}
                      placeholder="Password"
                      className={`${inputBase} ${fieldBorder("password")} pr-14`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/95 transition hover:opacity-80"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {!!fieldError("password") && (
                    <p className="mt-1 px-3 text-[11px] text-red-200">{fieldError("password")}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/90">
                      <LockIcon />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      maxLength={20}
                      placeholder="Confirm Password"
                      className={`${inputBase} ${fieldBorder("confirmPassword")} pr-14`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                      value={form.confirmPassword}
                      onChange={(e) => setField("confirmPassword", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/95 transition hover:opacity-80"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      <EyeIcon open={showConfirmPassword} />
                    </button>
                  </div>
                  {!!fieldError("confirmPassword") && (
                    <p className="mt-1 px-3 text-[11px] text-red-200">{fieldError("confirmPassword")}</p>
                  )}
                </div>
              </div>

              <div className="mx-auto max-w-[360px]">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/90">
                    <MailIcon />
                  </span>
                  <input
                    type="email"
                    maxLength={50}
                    placeholder="Email"
                    className={`${inputBase} ${fieldBorder("email")}`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    value={form.email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    onBlur={() => onBlurTrim("email")}
                  />
                </div>
                <div className="mt-1 px-3 text-[11px]">
                  {!!fieldError("email") && (
                    <p className="text-red-200">{fieldError("email")}</p>
                  )}
                  {!errors.email && emailAvailable === false && (
                    <p className={getStatusColor("bad")}>Email already exists</p>
                  )}
                  {!errors.email && emailAvailable === true && (
                    <p className={getStatusColor("ok")}>Email is available</p>
                  )}
                  {checkingEmail && (
                    <p className={getStatusColor("neutral")}>Checking…</p>
                  )}
                </div>
              </div>

              

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mx-auto block h-[50px] w-full max-w-[220px] rounded-full bg-[linear-gradient(180deg,#355E3B_0%,#163126_100%)] text-[15px] font-bold tracking-[0.06em] text-white shadow-[0_8px_20px_rgba(14,30,23,0.35)] transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {isSubmitting ? "CREATING..." : "SIGN UP"}
                </button>
              </div>

              <div
                className="flex items-center justify-center gap-1 pt-1 text-center text-[13px] text-white"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span className="font-medium">Already Have Account?</span>
                <button
                  type="button"
                  onClick={goToLogIn}
                  className="font-semibold transition hover:opacity-80"
                >
                  Sign In
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
            className="text-[18px] font-bold italic sm:text-[28px]"
            style={{ fontFamily: "'Montagu Slab', serif" }}
          >
            Bacoor Cavite
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

export default HotelSignUp;
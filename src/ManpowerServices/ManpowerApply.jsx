import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const DEFAULT_VACANCIES = [
  "Accounting Clerk",
  "General Clerk",
  "Money Sorter",
  "Data Encoder",
  "Admin Assistant",
  "HR Assistant",
  "Production Worker",
  "Warehouseman",
  "Stockman",
  "Sales Coordinator",
  "Financial Advisor",
  "Engineer",
  "Driver",
  "Promodiser",
  "Merchandiser",
  "Messenger",
  "Forklift Operator",
  "Janitor",
];

const CIVIL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Widowed",
  "Divorced",
  "Separated",
  "Annulled",
];

const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"];

const REQUIREMENT_FIELDS = [
  { key: "validId", label: "Valid ID", accept: ".jpg,.jpeg,.png,.webp,.pdf" },
  { key: "resume", label: "Resume", accept: ".pdf,.txt,.jpg,.jpeg,.png,.webp" },
  { key: "nbi", label: "NBI", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx" },
  {
    key: "barangayClearance",
    label: "Barangay Clearance",
    accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  },
  { key: "sss", label: "SSS", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx" },
  {
    key: "philhealth",
    label: "PhilHealth",
    accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  },
  { key: "pagibig", label: "Pag-IBIG", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx" },
  { key: "tin", label: "TIN", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx" },
  {
    key: "transcriptOfRecords",
    label: "Transcript of Records",
    accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  },
  { key: "diploma", label: "Diploma", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx" },
  {
    key: "birthCertificate",
    label: "Birth Certificate",
    accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  },
  { key: "photo1x1", label: "1x1 Picture", accept: ".jpg,.jpeg,.png,.pdf" },
  { key: "photo2x2", label: "2x2 Picture", accept: ".jpg,.jpeg,.png,.pdf" },
];

function digitsOnly(value = "") {
  return String(value || "").replace(/\D/g, "");
}

function sanitizeName(value = "") {
  return String(value || "").replace(/[^A-Za-zÀ-ÿ\s.'-]/g, "");
}

function sanitizeAlphaText(value = "") {
  return String(value || "").replace(/[^A-Za-zÀ-ÿ\s.'-]/g, "");
}

function sanitizeBirthPlace(value = "") {
  return String(value || "").replace(/[^A-Za-zÀ-ÿ\s,.'-]/g, "");
}

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isValidName(value = "") {
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,49}$/.test(String(value || "").trim());
}

function isValidOptionalName(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return true;
  return isValidName(trimmed);
}

function isValidContact(value = "") {
  const digits = digitsOnly(value);
  return digits.length === 11;
}

function isValidTin(value = "") {
  const digits = digitsOnly(value);
  return digits.length === 9 || digits.length === 12;
}

function isValidBirthPlace(value = "") {
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s,.'-]{1,99}$/.test(
    String(value || "").trim()
  );
}

function isValidReligion(value = "") {
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,59}$/.test(
    String(value || "").trim()
  );
}

function isValidNationality(value = "") {
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,59}$/.test(
    String(value || "").trim()
  );
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Manpower Logo"
        className="h-10 w-10 rounded-full object-cover"
      />
      <h1 className="text-[22px] font-black tracking-wide text-[#2f5a45] md:text-[28px]">
        MANPOWER
      </h1>
    </div>
  );
}

function FooterLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Lumispire Logo"
        className="h-9 w-9 rounded-full object-cover"
      />
      <p className="text-2xl font-black tracking-wide text-white">LUMISPIRE</p>
    </div>
  );
}

export default function ManpowerApplyPage() {
  const [jobs, setJobs] = useState([]);
  const vacancies = jobs.length ? jobs.map((job) => job.title) : DEFAULT_VACANCIES;

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      try {
        const res = await fetch(`${API_BASE}/manpower/vacancies`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load job vacancies.");
        }

        if (active) {
          setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        }
      } catch (error) {
        console.error("loadManpowerJobs error:", error);
        if (active) setJobs([]);
      }
    }

    loadJobs();

    return () => {
      active = false;
    };
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedVacancy = searchParams.get("vacancy") || "";

  const [form, setForm] = useState({
    vacancy: selectedVacancy,
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    completeAddress: "",
    contactNo: "",
    age: "",
    gender: "",
    sssNumber: "",
    tinNumber: "",
    pagibigNumber: "",
    philhealthNumber: "",
    birthPlace: "",
    civilStatus: "",
    religion: "",
    nationality: "",
  });

  const [files, setFiles] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [emailCheck, setEmailCheck] = useState({
    state: "idle",
    message: "",
  });

  function getFieldError(key, currentForm, currentFiles) {
    switch (key) {
      case "vacancy":
        return !currentForm.vacancy ? "Required" : "";

      case "firstName":
        if (!currentForm.firstName.trim()) return "Required";
        return !isValidName(currentForm.firstName) ? "Letters only" : "";

      case "lastName":
        if (!currentForm.lastName.trim()) return "Required";
        return !isValidName(currentForm.lastName) ? "Letters only" : "";

      case "middleName":
        return !isValidOptionalName(currentForm.middleName) ? "Letters only" : "";

      case "email":
        if (!currentForm.email.trim()) return "Required";
        if (!isValidEmail(currentForm.email)) return "Invalid email";
        if (emailCheck.state === "taken") return "Already used";
        if (emailCheck.state === "error") return emailCheck.message || "Check failed";
        return "";

      case "completeAddress":
        if (!currentForm.completeAddress.trim()) return "Required";
        return currentForm.completeAddress.trim().length < 5 ? "Too short" : "";

      case "contactNo":
        if (!currentForm.contactNo.trim()) return "Required";
        return !isValidContact(currentForm.contactNo) ? "11 digits only" : "";

      case "age": {
        if (!currentForm.age.trim()) return "Required";
        const age = Number(currentForm.age);
        return !Number.isFinite(age) || age < 18 || age > 60 ? "18-60 only" : "";
      }

      case "gender":
        return !GENDER_OPTIONS.includes(currentForm.gender) ? "Required" : "";

      case "sssNumber":
        if (!currentForm.sssNumber.trim()) return "Required";
        return digitsOnly(currentForm.sssNumber).length !== 10 ? "10 digits" : "";

      case "tinNumber":
        if (!currentForm.tinNumber.trim()) return "Required";
        return !isValidTin(currentForm.tinNumber) ? "9 or 12 digits" : "";

      case "pagibigNumber":
        if (!currentForm.pagibigNumber.trim()) return "Required";
        return digitsOnly(currentForm.pagibigNumber).length !== 12 ? "12 digits" : "";

      case "philhealthNumber":
        if (!currentForm.philhealthNumber.trim()) return "Required";
        return digitsOnly(currentForm.philhealthNumber).length !== 12 ? "12 digits" : "";

      case "birthPlace":
        if (!currentForm.birthPlace.trim()) return "Required";
        return !isValidBirthPlace(currentForm.birthPlace) ? "Invalid text" : "";

      case "civilStatus":
        return !CIVIL_STATUS_OPTIONS.includes(currentForm.civilStatus) ? "Required" : "";

      case "religion":
        if (!currentForm.religion.trim()) return "Required";
        return !isValidReligion(currentForm.religion) ? "Letters only" : "";

      case "nationality":
        if (!currentForm.nationality.trim()) return "Required";
        return !isValidNationality(currentForm.nationality) ? "Letters only" : "";

      default:
        if (REQUIREMENT_FIELDS.some((field) => field.key === key)) {
          return !currentFiles[key] ? "Required" : "";
        }
        return "";
    }
  }

  const formErrors = useMemo(() => {
    const keys = [
      "vacancy",
      "firstName",
      "lastName",
      "middleName",
      "email",
      "completeAddress",
      "contactNo",
      "age",
      "gender",
      "sssNumber",
      "tinNumber",
      "pagibigNumber",
      "philhealthNumber",
      "birthPlace",
      "civilStatus",
      "religion",
      "nationality",
      ...REQUIREMENT_FIELDS.map((field) => field.key),
    ];

    const errors = {};
    for (const key of keys) {
      const error = getFieldError(key, form, files);
      if (error) errors[key] = error;
    }
    return errors;
  }, [form, files, emailCheck]);

  useEffect(() => {
    const email = String(form.email || "").trim();

    if (!email) {
      setEmailCheck({ state: "idle", message: "" });
      return;
    }

    if (!isValidEmail(email)) {
      setEmailCheck({ state: "idle", message: "" });
      return;
    }

    setEmailCheck({ state: "checking", message: "Checking..." });

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/manpower/check-email?email=${encodeURIComponent(email)}`,
          { signal: controller.signal }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Failed to check email.");
        }

        if (data?.available) {
          setEmailCheck({ state: "available", message: "Available" });
        } else {
          setEmailCheck({
            state: "taken",
            message: "This email is already used.",
          });
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        setEmailCheck({
          state: "error",
          message: error?.message || "Failed to check email.",
        });
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.email]);

  function shouldShowError(key) {
    return Boolean(touched[key] && formErrors[key]);
  }

  function hasError(key) {
    return Boolean(shouldShowError(key));
  }

  function baseInputClass(key) {
    return `mt-1.5 w-full rounded-[6px] border bg-[#f7f7f4] px-3 py-2.5 text-sm text-[#30463a] outline-none transition ${
      hasError(key)
        ? "border-[#d92d20] bg-[#fff5f5] focus:border-[#d92d20]"
        : "border-[#b9bdb5] focus:border-[#456b56]"
    }`;
  }

  function fileInputClass(key) {
    return `mt-1.5 block w-full rounded-[6px] border bg-[#f7f7f4] px-3 py-2 text-sm text-[#30463a] transition ${
      hasError(key) ? "border-[#d92d20] bg-[#fff5f5]" : "border-[#b9bdb5]"
    }`;
  }

  function updateField(key, value) {
    let nextValue = value;

    if (["firstName", "lastName", "middleName"].includes(key)) {
      nextValue = sanitizeName(value).slice(0, 50);
    } else if (key === "religion" || key === "nationality") {
      nextValue = sanitizeAlphaText(value).slice(0, 60);
    } else if (key === "birthPlace") {
      nextValue = sanitizeBirthPlace(value).slice(0, 100);
    } else if (key === "contactNo") {
      nextValue = digitsOnly(value).slice(0, 11);
    } else if (key === "sssNumber") {
      nextValue = digitsOnly(value).slice(0, 10);
    } else if (key === "tinNumber") {
      nextValue = digitsOnly(value).slice(0, 12);
    } else if (key === "pagibigNumber" || key === "philhealthNumber") {
      nextValue = digitsOnly(value).slice(0, 12);
    } else if (key === "age") {
      nextValue = digitsOnly(value).slice(0, 2);
    }

    setForm((prev) => ({ ...prev, [key]: nextValue }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    setStatus((prev) => ({ ...prev, error: "", success: "" }));
  }

  function updateFile(key, file) {
    setFiles((prev) => ({ ...prev, [key]: file || null }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    setStatus((prev) => ({ ...prev, error: "", success: "" }));
  }

  async function submitApplication(e) {
    e.preventDefault();

    const allTouched = {
      vacancy: true,
      firstName: true,
      lastName: true,
      middleName: true,
      email: true,
      completeAddress: true,
      contactNo: true,
      age: true,
      gender: true,
      sssNumber: true,
      tinNumber: true,
      pagibigNumber: true,
      philhealthNumber: true,
      birthPlace: true,
      civilStatus: true,
      religion: true,
      nationality: true,
    };

    for (const field of REQUIREMENT_FIELDS) {
      allTouched[field.key] = true;
    }

    setTouched((prev) => ({ ...prev, ...allTouched }));
    setStatus({ loading: false, error: "", success: "" });

    if (Object.keys(formErrors).length > 0 || emailCheck.state === "checking") {
      setStatus({
        loading: false,
        error:
          emailCheck.state === "checking"
            ? "Please wait while checking the email."
            : "Please fix the highlighted fields.",
        success: "",
      });
      return;
    }

    setStatus({ loading: true, error: "", success: "" });

    try {
      const payload = new FormData();
      payload.append("vacancy", form.vacancy);
      payload.append("firstName", form.firstName.trim());
      payload.append("lastName", form.lastName.trim());
      payload.append("middleName", form.middleName.trim());
      payload.append("email", form.email.trim());
      payload.append("completeAddress", form.completeAddress.trim());
      payload.append("contactNo", digitsOnly(form.contactNo));
      payload.append("age", form.age);
      payload.append("gender", form.gender);
      payload.append("sssNumber", digitsOnly(form.sssNumber));
      payload.append("tinNumber", digitsOnly(form.tinNumber));
      payload.append("pagibigNumber", digitsOnly(form.pagibigNumber));
      payload.append("philhealthNumber", digitsOnly(form.philhealthNumber));
      payload.append("birthPlace", form.birthPlace.trim());
      payload.append("civilStatus", form.civilStatus);
      payload.append("religion", form.religion.trim());
      payload.append("nationality", form.nationality.trim());

      for (const field of REQUIREMENT_FIELDS) {
        payload.append(field.key, files[field.key]);
      }

      const res = await fetch(`${API_BASE}/manpower/apply`, {
        method: "POST",
        body: payload,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit application.");
      }

      const applicationId = data?.application?._id;

      if (!applicationId) {
        throw new Error("Application was saved but no application ID was returned.");
      }

      navigate(`/manpower-exam/${applicationId}`);
      return;
    } catch (error) {
      setStatus({
        loading: false,
        error: error?.message || "Failed to submit application.",
        success: "",
      });
    }
  }

  function labelRow(label, key) {
    let message = "";

    if (key === "email" && touched.email && !formErrors.email) {
      if (emailCheck.state === "checking") message = "Checking...";
      if (emailCheck.state === "available") message = "Available";
    }

    if (shouldShowError(key)) {
      message = formErrors[key];
    }

    const messageColor =
      key === "email" && touched.email && !formErrors.email && emailCheck.state === "available"
        ? "text-[#1f6b38]"
        : key === "email" && touched.email && !formErrors.email && emailCheck.state === "checking"
        ? "text-[#667085]"
        : "text-[#b42318]";

    return (
      <div className="flex items-center justify-between gap-3">
        <label className="text-[13px] font-medium text-[#45604f]">{label}</label>
        {message ? (
          <span className={`text-[11px] font-semibold ${messageColor}`}>{message}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efefed] text-[#24372d]">
      <header className="border-b border-[#d7ddd5] bg-[#f7f7f5]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <BrandLogo />

          <nav className="hidden items-center gap-6 text-[11px] font-bold uppercase tracking-wide text-[#647467] lg:flex">
            <Link to="/manpower-services" className="hover:text-[#2f5a45]">
              Home
            </Link>
            <Link to="/manpower-positions" className="hover:text-[#2f5a45]">
              Job Offer
            </Link>
            <Link to="/manpower-requirements" className="hover:text-[#2f5a45]">
              Requirements
            </Link>
            <Link to="/manpower-services" className="hover:text-[#2f5a45]">
              FAQs
            </Link>
          </nav>

          <Link
            to="/manpower-employee-login"
            className="text-[11px] font-bold uppercase tracking-wide text-[#647467] hover:text-[#2f5a45]"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 pt-0 md:px-6">
          <div
            className="relative min-h-[180px] overflow-hidden md:min-h-[230px]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(42,82,61,0.88) 0%, rgba(64,94,77,0.58) 38%, rgba(64,94,77,0.18) 100%), url('/images/application-hero.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "#64766c",
            }}
          >
            <div className="flex min-h-[180px] items-center px-5 py-8 md:min-h-[230px] md:px-8">
              <div className="text-white">
                <h2 className="font-serif text-4xl leading-none md:text-6xl">
                  Application Form
                </h2>
                <p className="mt-4 text-base text-white/95 md:text-xl">
                  Begin your journey with Manpower Services today
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-10 pt-4 md:px-6">
          <div className="bg-[#f4f4f1] px-4 py-5 md:px-6 md:py-6">
            <form onSubmit={submitApplication} className="space-y-10">
              <section>
                <h3 className="font-serif text-[28px] text-[#3f5e4d] md:text-[38px]">
                  Personal Information
                </h3>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-3">
                    {labelRow("Job Offer", "vacancy")}
                    <select
                      value={form.vacancy}
                      onChange={(e) => updateField("vacancy", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, vacancy: true }))}
                      className={baseInputClass("vacancy")}
                    >
                      <option value="">Select Job Offer</option>
                      {vacancies.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    {labelRow("First Name", "firstName")}
                    <input
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, firstName: true }))}
                      maxLength={50}
                      className={baseInputClass("firstName")}
                    />
                  </div>

                  <div>
                    {labelRow("Last Name", "lastName")}
                    <input
                      value={form.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, lastName: true }))}
                      maxLength={50}
                      className={baseInputClass("lastName")}
                    />
                  </div>

                  <div>
                    {labelRow("Middle Name", "middleName")}
                    <input
                      value={form.middleName}
                      onChange={(e) => updateField("middleName", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, middleName: true }))}
                      maxLength={50}
                      className={baseInputClass("middleName")}
                    />
                  </div>

                  <div>
                    {labelRow("Phone Number", "contactNo")}
                    <input
                      value={form.contactNo}
                      onChange={(e) => updateField("contactNo", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, contactNo: true }))}
                      maxLength={11}
                      placeholder="09123456789"
                      className={baseInputClass("contactNo")}
                    />
                  </div>

                  <div>
                    {labelRow("Email", "email")}
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                      className={baseInputClass("email")}
                    />
                  </div>

                  <div>
                    {labelRow("Birth Place", "birthPlace")}
                    <input
                      value={form.birthPlace}
                      onChange={(e) => updateField("birthPlace", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, birthPlace: true }))}
                      maxLength={100}
                      className={baseInputClass("birthPlace")}
                    />
                  </div>

                  <div>
                    {labelRow("Age", "age")}
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.age}
                      onChange={(e) => updateField("age", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, age: true }))}
                      maxLength={2}
                      className={baseInputClass("age")}
                    />
                  </div>

                  <div>
                    {labelRow("Gender", "gender")}
                    <select
                      value={form.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, gender: true }))}
                      className={baseInputClass("gender")}
                    >
                      <option value="">Select gender</option>
                      {GENDER_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    {labelRow("Status", "civilStatus")}
                    <select
                      value={form.civilStatus}
                      onChange={(e) => updateField("civilStatus", e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, civilStatus: true }))
                      }
                      className={baseInputClass("civilStatus")}
                    >
                      <option value="">Select status</option>
                      {CIVIL_STATUS_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    {labelRow("Complete Address", "completeAddress")}
                    <textarea
                      rows={3}
                      value={form.completeAddress}
                      onChange={(e) => updateField("completeAddress", e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, completeAddress: true }))
                      }
                      className={baseInputClass("completeAddress")}
                    />
                  </div>

                  <div>
                    {labelRow("SSS Number", "sssNumber")}
                    <input
                      value={form.sssNumber}
                      onChange={(e) => updateField("sssNumber", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, sssNumber: true }))}
                      maxLength={10}
                      className={baseInputClass("sssNumber")}
                    />
                  </div>

                  <div>
                    {labelRow("Pag-Ibig Number", "pagibigNumber")}
                    <input
                      value={form.pagibigNumber}
                      onChange={(e) => updateField("pagibigNumber", e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, pagibigNumber: true }))
                      }
                      maxLength={12}
                      className={baseInputClass("pagibigNumber")}
                    />
                  </div>

                  <div>
                    {labelRow("PhilHealth Number", "philhealthNumber")}
                    <input
                      value={form.philhealthNumber}
                      onChange={(e) => updateField("philhealthNumber", e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, philhealthNumber: true }))
                      }
                      maxLength={12}
                      className={baseInputClass("philhealthNumber")}
                    />
                  </div>

                  <div>
                    {labelRow("TIN Number", "tinNumber")}
                    <input
                      value={form.tinNumber}
                      onChange={(e) => updateField("tinNumber", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, tinNumber: true }))}
                      maxLength={12}
                      className={baseInputClass("tinNumber")}
                    />
                  </div>

                  <div>
                    {labelRow("Religion", "religion")}
                    <input
                      value={form.religion}
                      onChange={(e) => updateField("religion", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, religion: true }))}
                      maxLength={60}
                      className={baseInputClass("religion")}
                    />
                  </div>

                  <div>
                    {labelRow("Nationality", "nationality")}
                    <input
                      value={form.nationality}
                      onChange={(e) => updateField("nationality", e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, nationality: true }))
                      }
                      maxLength={60}
                      className={baseInputClass("nationality")}
                    />
                  </div>
                </div>
              </section>

              <div className="mx-auto h-[2px] w-[90%] bg-[#617b6a]" />

              <section>
                <h3 className="font-serif text-[28px] text-[#3f5e4d] md:text-[38px]">
                  Upload Documents
                </h3>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {REQUIREMENT_FIELDS.map((field) => (
                    <div key={field.key}>
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[13px] font-medium text-[#45604f]">
                          {field.label}
                        </label>
                        {shouldShowError(field.key) ? (
                          <span className="text-[11px] font-semibold text-[#b42318]">
                            {formErrors[field.key]}
                          </span>
                        ) : null}
                      </div>

                      <input
                        type="file"
                        accept={field.accept}
                        onChange={(e) =>
                          updateFile(field.key, e.target.files?.[0] || null)
                        }
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, [field.key]: true }))
                        }
                        className={fileInputClass(field.key)}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {status.error ? (
                <div className="rounded-md border border-[#efc9c9] bg-[#fff2f2] px-4 py-3 text-sm text-[#912f2f]">
                  {status.error}
                </div>
              ) : null}

              {status.success ? (
                <div className="rounded-md border border-[#cbe0ca] bg-[#eff9ef] px-4 py-3 text-sm text-[#1f6b38]">
                  {status.success}
                </div>
              ) : null}

              <div className="flex flex-col items-center justify-center gap-4 pt-2 md:flex-row md:gap-16">
                <button
                  type="submit"
                  disabled={status.loading}
                  className="min-w-[170px] rounded-[10px] border border-[#91a691] bg-gradient-to-b from-[#e8f0e7] to-[#bccdbb] px-6 py-2.5 text-sm font-semibold text-[#345240] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status.loading ? "Submitting..." : "Submit Application"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="min-w-[170px] rounded-[10px] border border-[#91a691] bg-gradient-to-b from-[#e8f0e7] to-[#bccdbb] px-6 py-2.5 text-sm font-semibold text-[#345240] shadow-sm transition hover:brightness-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-[#456b56] text-white">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
          <div className="grid gap-5 md:grid-cols-5 md:items-start">
            <div className="md:pr-4">
              <FooterLogo />
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Menu</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p>Home</p>
                <p>Course</p>
                <p>Requirements</p>
                <p>Profile</p>
              </div>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Contact Information</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p>ltc.tamis@gmail.com</p>
                <p>lorengladisu@ltcmultiservices.com</p>
                <p>09959808051 / 09516281271</p>
              </div>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Address</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p>2/F 544 Curie Street,</p>
                <p>Palanan, Makati City</p>
              </div>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Follow Us</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p>Facebook</p>
                <p>Email</p>
                <p>LinkedIn</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-2 border-t border-white/15 pt-3 text-[10px] text-white/80 md:flex-row">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
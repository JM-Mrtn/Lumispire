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
        src="/ManpowerLogo.png"
        alt="Manpower Logo"
        className="h-10 w-10 rounded-full object-cover"
      />
      <h1 className="text-[22px] font-black tracking-wide text-[#2f5a45] md:text-[28px]">
        LTC MANPOWER
      </h1>
    </div>
  );
}

function FooterLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/ManpowerLogo.png"
        alt="Lumispire Logo"
        className="h-9 w-9 rounded-full object-cover"
      />
      <p className="text-2xl font-black tracking-wide text-white">LTC MANPOWER</p>
    </div>
  );
}


const manpowerApplyEnrollmentStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-enrollment-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --green-600: #2f754c;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --white: #ffffff;
    --dark: #101828;
    --muted: #667085;
    --glass: rgba(255,255,255,.84);
    --shadow-md: 0 18px 45px rgba(8,39,25,.12);
    --shadow-lg: 0 32px 80px rgba(8,39,25,.18);
    --radius: 24px;
    --ease: cubic-bezier(.22,1,.36,1);
    min-height: 100vh;
    color: var(--dark);
    background:
      radial-gradient(circle at 12% 0%, rgba(215,168,77,.12), transparent 28%),
      radial-gradient(circle at 92% 12%, rgba(35,95,62,.12), transparent 30%),
      linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%) !important;
    line-height: 1.65;
    letter-spacing: -.01em;
    overflow-x: hidden;
    font-family: "Inter", Arial, sans-serif;
  }

  .ltc-enrollment-page * { box-sizing: border-box; }


  .ltc-enrollment-page .mp-header {
    position: sticky;
    top: 0;
    z-index: 50;
    width: 100%;
    background: var(--footer-green) !important;
    border-bottom: 1px solid rgba(255,255,255,.1) !important;
    box-shadow: 0 10px 34px rgba(7,31,20,.14) !important;
    margin: 0 !important;
  }

  .ltc-enrollment-page .mp-header .mp-container {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding-left: 32px !important;
    padding-right: 32px !important;
  }

  .ltc-enrollment-page .mp-nav {
    min-height: 76px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 24px !important;
  }

  .ltc-enrollment-page .mp-logo {
    display: flex !important;
    align-items: center !important;
    gap: 13px !important;
    color: white !important;
    border: 0 !important;
    background: transparent !important;
    cursor: pointer !important;
    text-align: left !important;
    padding: 0 !important;
    text-decoration: none !important;
    flex-shrink: 0 !important;
  }

  .ltc-enrollment-page .mp-logo-icon {
    width: 42px !important;
    height: 42px !important;
    display: grid !important;
    place-items: center !important;
    border-radius: 50% !important;
    background: linear-gradient(145deg,#fff,#e3f4ea) !important;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12) !important;
    object-fit: cover !important;
  }

  .ltc-enrollment-page .mp-logo h1 {
    color: white !important;
    font-size: 18px !important;
    line-height: 1 !important;
    font-weight: 900 !important;
    text-transform: uppercase !important;
    letter-spacing: -.04em !important;
    margin: 0 !important;
  }

  .ltc-enrollment-page .mp-logo p {
    font-size: 11px !important;
    color: rgba(255,255,255,.72) !important;
    margin: 3px 0 0 !important;
  }

  .ltc-enrollment-page .mp-desktop-nav {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    margin-left: auto !important;
  }

  .ltc-enrollment-page .mp-nav-link {
    color: rgba(255,255,255,.78) !important;
    font-size: 12px !important;
    font-weight: 800 !important;
    letter-spacing: .08em !important;
    text-transform: uppercase !important;
    padding: 10px 14px !important;
    border-radius: 999px !important;
    transition: .25s var(--ease) !important;
    text-decoration: none !important;
    white-space: nowrap !important;
  }

  .ltc-enrollment-page .mp-nav-link:hover,
  .ltc-enrollment-page .mp-nav-link.active {
    color: white !important;
    background: rgba(255,255,255,.13) !important;
    transform: translateY(-1px) !important;
  }

  .ltc-enrollment-page .mp-sign-in {
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 16px 35px rgba(215,168,77,.22) !important;
  }

  .ltc-enrollment-page .mp-sign-in:hover {
    color: #102418 !important;
    background: linear-gradient(135deg,#f8dc8c,#d7a84d) !important;
  }

  .ltc-enrollment-page main > section:first-child {
    width: 100% !important;
    max-width: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .ltc-enrollment-page main > section:first-child > div {
    position: relative;
    min-height: 420px !important;
    border-radius: 0 !important;
    overflow: hidden;
    color: white !important;
    isolation: isolate;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%) !important;
  }

  .ltc-enrollment-page main > section:first-child > div::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(circle at 12% 20%, rgba(244,212,132,.16), transparent 28%),
      radial-gradient(circle at 90% 18%, rgba(35,95,62,.48), transparent 32%),
      linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.90) 46%, rgba(12,64,39,.76) 100%);
  }

  .ltc-enrollment-page main > section:first-child > div::after {
    content: "";
    position: absolute;
    inset: -16% -10% -24% -10%;
    z-index: 1;
    background:
      radial-gradient(circle at 16% 82%, rgba(19,120,72,.36), transparent 24%),
      radial-gradient(circle at 88% 44%, rgba(244,212,132,.14), transparent 28%),
      linear-gradient(135deg, rgba(3,24,15,.34), rgba(8,56,34,.08));
    filter: blur(30px);
    pointer-events: none;
  }

  .ltc-enrollment-page main > section:first-child > div > div {
    position: relative;
    z-index: 2;
    width: min(1180px, 92%);
    margin: 0 auto;
    min-height: 420px !important;
    padding: 76px 0 84px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
  }

  .ltc-enrollment-page main > section:first-child h2 {
    margin: 0 auto !important;
    max-width: 940px;
    color: white !important;
    font-size: clamp(42px, 6vw, 76px) !important;
    line-height: .98 !important;
    font-weight: 900 !important;
    letter-spacing: -.065em !important;
    text-shadow: 0 8px 26px rgba(0,0,0,.22);
    font-family: "Inter", Arial, sans-serif !important;
  }

  .ltc-enrollment-page main > section:first-child h2::after {
    content: " Now";
    color: var(--gold-soft);
  }

  .ltc-enrollment-page main > section:first-child p {
    max-width: 720px;
    margin: 24px auto 0 !important;
    color: rgba(255,255,255,.80) !important;
    font-size: 18px !important;
    line-height: 1.8 !important;
  }

  .ltc-enrollment-page main > section:nth-child(2) {
    width: min(1180px, 92%) !important;
    max-width: 1180px !important;
    margin: -68px auto 0 !important;
    padding: 0 0 84px !important;
    position: relative;
    z-index: 4;
  }

  .ltc-enrollment-page main > section:nth-child(2) > div {
    position: relative;
    overflow: hidden;
    border-radius: 32px !important;
    background: var(--glass) !important;
    border: 1px solid rgba(255,255,255,.82) !important;
    box-shadow: var(--shadow-lg) !important;
    backdrop-filter: blur(18px);
    padding: 30px !important;
    animation: ltcEnrollmentReveal .75s var(--ease) both;
  }

  .ltc-enrollment-page main > section:nth-child(2) > div::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 7px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
  }

  .ltc-enrollment-page form > section {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(35,95,62,.12);
    box-shadow: 0 12px 28px rgba(8,39,25,.06);
    padding: 26px;
  }

  .ltc-enrollment-page form > section h3 {
    margin: 0 !important;
    color: var(--green-950) !important;
    font-size: clamp(28px, 4vw, 42px) !important;
    line-height: 1.08 !important;
    font-weight: 900 !important;
    letter-spacing: -.055em !important;
    font-family: "Inter", Arial, sans-serif !important;
  }

  .ltc-enrollment-page form > section h3::before {
    content: "MANPOWER APPLICATION";
    display: block;
    margin-bottom: 10px;
    color: var(--green-700);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .18em;
  }

  .ltc-enrollment-page form > section:nth-of-type(2) h3::before {
    content: "REQUIREMENTS";
  }

  .ltc-enrollment-page form label {
    color: #506656 !important;
    font-size: 12px !important;
    font-weight: 900 !important;
    letter-spacing: .06em;
    text-transform: uppercase;
  }

  .ltc-enrollment-page input,
  .ltc-enrollment-page select,
  .ltc-enrollment-page textarea {
    min-height: 54px;
    border: 1px solid rgba(35,95,62,.18) !important;
    border-radius: 18px !important;
    background: #fff !important;
    padding: 0 18px !important;
    color: var(--green-950) !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    outline: none !important;
    transition: .28s var(--ease) !important;
    box-shadow: 0 10px 22px rgba(8,39,25,.05) !important;
  }

  .ltc-enrollment-page textarea {
    padding-top: 14px !important;
    min-height: 106px;
  }

  .ltc-enrollment-page input[type="file"] {
    padding: 13px 16px 13px 48px !important;
    min-height: 54px;
  }

  .ltc-enrollment-page .mp-file-field {
    position: relative;
    margin-top: 8px;
  }

  .ltc-enrollment-page .mp-attachment-icon {
    position: absolute;
    left: 18px;
    top: 50%;
    width: 19px;
    height: 19px;
    transform: translateY(-50%);
    color: var(--green-700);
    pointer-events: none;
    z-index: 2;
    opacity: .9;
    transition: transform .28s var(--ease), color .28s var(--ease);
  }

  .ltc-enrollment-page .mp-file-field:focus-within .mp-attachment-icon,
  .ltc-enrollment-page .mp-file-field:hover .mp-attachment-icon {
    color: var(--gold);
    transform: translateY(-50%) rotate(-8deg) scale(1.06);
  }

  .ltc-enrollment-page input:focus,
  .ltc-enrollment-page select:focus,
  .ltc-enrollment-page textarea:focus {
    border-color: rgba(215,168,77,.72) !important;
    box-shadow: 0 16px 34px rgba(8,39,25,.10) !important;
    transform: translateY(-1px);
  }

  .ltc-enrollment-page form > div[class*="h-[2px]"] {
    height: 0 !important;
    background: transparent !important;
  }

  .ltc-enrollment-page button[type="submit"],
  .ltc-enrollment-page form button[type="button"] {
    min-height: 50px;
    min-width: 190px;
    border: 0 !important;
    border-radius: 999px !important;
    padding: 0 24px !important;
    font-size: 13px !important;
    font-weight: 900 !important;
    letter-spacing: .08em;
    text-transform: uppercase;
    transition: .28s var(--ease) !important;
  }

  .ltc-enrollment-page button[type="submit"] {
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 16px 35px rgba(215,168,77,.28) !important;
  }

  .ltc-enrollment-page form button[type="button"] {
    color: var(--green-950) !important;
    background: white !important;
    border: 1px solid rgba(35,95,62,.16) !important;
  }

  .ltc-enrollment-page button[type="submit"]:hover,
  .ltc-enrollment-page form button[type="button"]:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 45px rgba(8,39,25,.14);
  }

  .ltc-enrollment-page footer {
    width: 100%;
    background: var(--footer-green) !important;
    color: white !important;
    padding: 30px 0 12px !important;
    margin: 0 !important;
  }

  .ltc-enrollment-page footer > div:first-child,
  .ltc-enrollment-page footer > div:last-child {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding-left: 32px !important;
    padding-right: 32px !important;
  }

  .ltc-enrollment-page footer h3 {
    color: #f4d484 !important;
    font-size: 12px !important;
    line-height: 1.2;
    font-weight: 900 !important;
    text-transform: uppercase;
    letter-spacing: .14em;
    margin: 0 0 10px !important;
  }

  .ltc-enrollment-page footer p {
    color: rgba(255,255,255,.68) !important;
    font-size: 13px !important;
    line-height: 1.55;
    margin: 5px 0 !important;
  }

  @keyframes ltcEnrollmentReveal {
    from { opacity: 0; transform: translateY(34px) scale(.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 900px) {
    .ltc-enrollment-page .mp-header .mp-container { padding-left: 22px !important; padding-right: 22px !important; }
    .ltc-enrollment-page .mp-desktop-nav { display: none !important; }
    .ltc-enrollment-page main > section:first-child > div,
    .ltc-enrollment-page main > section:first-child > div > div { min-height: 360px !important; }
    .ltc-enrollment-page main > section:nth-child(2) { margin-top: -46px !important; }
    .ltc-enrollment-page main > section:nth-child(2) > div { padding: 20px !important; border-radius: 26px !important; }
    .ltc-enrollment-page form > section { padding: 20px; }
    .ltc-enrollment-page footer > div:first-child { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 600px) {
    .ltc-enrollment-page .mp-header .mp-container { padding-left: 16px !important; padding-right: 16px !important; }
    .ltc-enrollment-page .mp-logo h1 { font-size: 14px !important; }
    .ltc-enrollment-page .mp-logo p { font-size: 10px !important; }
    .ltc-enrollment-page main > section:first-child h2 { font-size: clamp(38px, 12vw, 54px) !important; }
    .ltc-enrollment-page main > section:first-child p { font-size: 15px !important; }
    .ltc-enrollment-page button[type="submit"], .ltc-enrollment-page form button[type="button"] { width: 100%; }
    .ltc-enrollment-page footer > div:first-child,
    .ltc-enrollment-page footer > div:last-child { padding-left: 16px !important; padding-right: 16px !important; }
  }
`;

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
    <div className="ltc-enrollment-page min-h-screen bg-[#efefed] text-[#24372d]">
      <style>{manpowerApplyEnrollmentStyles}</style>
      <header className="mp-header">
        <div className="mp-container mp-nav">
          <Link to="/manpower-services" className="mp-logo">
            <img src="/ManpowerLogo.png" alt="Manpower Logo" className="mp-logo-icon" />
            <div>
              <h1>LTC MANPOWER SERVICES</h1>
              <p>Professional staffing and workforce solutions.</p>
            </div>
          </Link>

          <nav className="mp-desktop-nav">
            <Link to="/manpower-services" className="mp-nav-link">
              Home
            </Link>
            <Link to="/manpower-positions" className="mp-nav-link active">
              Job Offer
            </Link>
            <Link to="/manpower-requirements" className="mp-nav-link">
              Requirements
            </Link>
            <Link to="/manpower-contact" className="mp-nav-link">
              Contact
            </Link>
            <Link to="/manpower-faqs" className="mp-nav-link">
              FAQs
            </Link>
            <Link to="/manpower-employee-login" className="mp-nav-link mp-sign-in">
              Sign In
            </Link>
          </nav>
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

                      <div className="mp-file-field">
                        <svg
                          className="mp-attachment-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>

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
// src/TrainingAndAssessment/TrainingEnrollmentForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

async function loadOpenBatches(apiBase) {
  const res = await fetch(`${apiBase}/enrollments/open-batches`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || "Failed to load open batches.");
  }

  return Array.isArray(data?.batches) ? data.batches : [];
}

function normalizeCourseName(value = "") {
  return String(value || "").trim();
}

const MAX_LENGTHS = {
  firstName: 50,
  lastName: 50,
  middleName: 50,
  email: 100,
  completeAddress: 200,
  otherEducationText: 80,
};

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const NAME_REGEX = /^[A-Za-zÀ-ÿ]+(?: [A-Za-zÀ-ÿ]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PH_PHONE_REGEX = /^(09\d{9}|\+639\d{9})$/;

const enrollmentPageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap");

  .ltc-enrollment-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --glass: rgba(255,255,255,.84);
    --shadow-md: 0 18px 45px rgba(8,39,25,.12);
    --shadow-lg: 0 32px 80px rgba(8,39,25,.18);
    --radius: 24px;
    --ease: cubic-bezier(.22,1,.36,1);
    min-height: 100vh;
    color: var(--dark) !important;
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

  .ltc-enrollment-page header {
    position: sticky;
    top: 0;
    z-index: 50;
    width: 100%;
    background: var(--footer-green) !important;
    border-bottom: 1px solid rgba(255,255,255,.1) !important;
    box-shadow: 0 10px 34px rgba(7,31,20,.14) !important;
    backdrop-filter: blur(14px);
  }

  .ltc-enrollment-page header > div:first-child {
    width: 100% !important;
    max-width: none !important;
    min-height: 76px !important;
    padding-left: 32px !important;
    padding-right: 32px !important;
  }

  .ltc-enrollment-page header > div:first-child {
    justify-content: flex-start !important;
    gap: 14px !important;
  }

  .ltc-enrollment-page header nav {
    margin-left: auto !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
  }

  .ltc-enrollment-page header > div:first-child > button:last-of-type {
    margin-left: 10px !important;
  }

  .ltc-enrollment-page header button { transition: .25s var(--ease); }
  .ltc-enrollment-page header button:hover { transform: translateY(-1px); }

  .ltc-enrollment-page header img {
    width: 42px !important;
    height: 42px !important;
    border-radius: 999px;
    background: white;
    object-fit: cover;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
  }

  .ltc-enrollment-page header span {
    color: white !important;
    font-size: 18px !important;
    line-height: 1 !important;
    font-weight: 900 !important;
    text-transform: uppercase;
    letter-spacing: -.04em !important;
  }

  .ltc-enrollment-page header nav button,
  .ltc-enrollment-page header > div:first-child > button:last-child,
  .ltc-enrollment-page header > div:first-child > button:nth-last-child(2) {
    color: rgba(255,255,255,.78) !important;
    font-size: 12px !important;
    font-weight: 800 !important;
    letter-spacing: .08em !important;
    text-transform: uppercase !important;
    padding: 9px 12px !important;
    border-radius: 999px !important;
    border: 0 !important;
    background: transparent !important;
  }

  .ltc-enrollment-page header nav button:hover,
  .ltc-enrollment-page header nav button:nth-child(3),
  .ltc-enrollment-page header > div:first-child > button:nth-last-child(2):hover {
    color: white !important;
    background: rgba(255,255,255,.13) !important;
    border-bottom: 0 !important;
  }

  .ltc-enrollment-page header > div:first-child > button:nth-last-child(2) {
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 14px 28px rgba(215,168,77,.18) !important;
  }

  .ltc-enrollment-page header > div:last-child {
    background: var(--footer-green) !important;
    border-top: 1px solid rgba(255,255,255,.1) !important;
  }

  .ltc-enrollment-page header > div:last-child > div {
    background: rgba(255,255,255,.08) !important;
    border: 1px solid rgba(255,255,255,.1) !important;
  }

  .ltc-enrollment-page header > div:last-child button {
    color: rgba(255,255,255,.82) !important;
    background: transparent !important;
  }

  .ltc-enrollment-page header > div:last-child button:hover {
    color: white !important;
    background: rgba(255,255,255,.12) !important;
  }

  .ltc-enrollment-page main > section:first-child {
    display: none !important;
  }

  .ltc-enrollment-page main > section:nth-child(2) {
    position: relative;
    overflow: hidden;
    color: white !important;
    isolation: isolate;
    padding: 82px 0 78px !important;
    background:
      linear-gradient(90deg, rgba(3,24,15,.94) 0%, rgba(8,39,25,.88) 42%, rgba(21,95,59,.72) 100%),
      url('/tamsi-building.jpg') center/cover no-repeat !important;
  }

  .ltc-enrollment-page main > section:nth-child(2)::before,
  .ltc-enrollment-page main > section:nth-child(2)::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
  }

  .ltc-enrollment-page main > section:nth-child(2)::before {
    width: 360px;
    height: 360px;
    right: -90px;
    top: -130px;
    background: radial-gradient(circle, rgba(244,212,132,.20), transparent 68%);
    z-index: -1;
  }

  .ltc-enrollment-page main > section:nth-child(2)::after {
    width: 420px;
    height: 420px;
    left: -160px;
    bottom: -220px;
    background: radial-gradient(circle, rgba(255,255,255,.13), transparent 67%);
    z-index: -1;
  }

  .ltc-enrollment-page main > section:nth-child(2) h1 {
    font-size: clamp(48px, 8vw, 84px) !important;
    line-height: .95 !important;
    font-weight: 900 !important;
    letter-spacing: -.065em !important;
    color: white !important;
    text-shadow: none !important;
  }

  .ltc-enrollment-page main > section:nth-child(2) h1::after {
    content: " Application";
    color: var(--gold-soft);
  }

  .ltc-enrollment-page main > section:nth-child(2) h1 {
    font-size: 0 !important;
  }

  .ltc-enrollment-page main > section:nth-child(2) h1::before {
    content: "Training Enrollment";
    font-size: clamp(48px, 8vw, 84px) !important;
    line-height: .95 !important;
    font-weight: 900 !important;
    letter-spacing: -.065em !important;
  }

  .ltc-enrollment-page main > section:nth-child(2) h1::after {
    font-size: clamp(48px, 8vw, 84px) !important;
    line-height: .95 !important;
    font-weight: 900 !important;
    letter-spacing: -.065em !important;
  }

  .ltc-enrollment-page main > section:nth-child(2) h1 + div {
    width: 118px !important;
    height: 4px !important;
    margin-top: 26px !important;
    background: linear-gradient(90deg, transparent, var(--gold-soft), transparent) !important;
    opacity: .96;
  }

  .ltc-enrollment-page main > section:nth-child(3) {
    background:
      radial-gradient(circle at 10% 10%, rgba(215,168,77,.12), transparent 28%),
      linear-gradient(180deg,#f8fbf9 0%,#eef7f2 100%) !important;
    padding: 58px 20px 72px !important;
  }

  .ltc-enrollment-page main > section:nth-child(3) > div {
    width: min(1180px, 94%) !important;
    max-width: 1180px !important;
    margin: 0 auto !important;
    background: rgba(255,255,255,.9);
    border: 1px solid rgba(14,51,33,.10);
    border-radius: 30px;
    box-shadow: var(--shadow-lg);
    padding: clamp(22px, 4vw, 46px);
    backdrop-filter: blur(18px);
    position: relative;
    overflow: hidden;
  }

  .ltc-enrollment-page main > section:nth-child(3) > div::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 0% 0%, rgba(244,212,132,.22), transparent 26%),
      radial-gradient(circle at 100% 0%, rgba(35,95,62,.08), transparent 30%);
    pointer-events: none;
  }

  .ltc-enrollment-page form,
  .ltc-enrollment-page main > section:nth-child(3) > div > div {
    position: relative;
    z-index: 1;
  }

  .ltc-enrollment-page form { display: grid; gap: 28px; }

  .ltc-enrollment-page form > section {
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(14,51,33,.10);
    border-radius: 24px;
    padding: clamp(18px, 3vw, 30px);
    box-shadow: 0 16px 34px rgba(8,39,25,.08);
    transition: transform .28s var(--ease), box-shadow .28s var(--ease), border-color .28s var(--ease);
  }

  .ltc-enrollment-page form > section:hover {
    transform: translateY(-3px);
    border-color: rgba(215,168,77,.34);
    box-shadow: 0 24px 48px rgba(8,39,25,.12);
  }

  .ltc-enrollment-page h2 {
    color: var(--green-900) !important;
    font-size: clamp(22px, 3vw, 30px) !important;
    font-weight: 900 !important;
    letter-spacing: -.04em !important;
  }

  .ltc-enrollment-page h2 + div {
    background: linear-gradient(90deg, var(--gold), transparent) !important;
    height: 3px !important;
    opacity: 1 !important;
  }

  .ltc-enrollment-page label,
  .ltc-enrollment-page form p,
  .ltc-enrollment-page form span {
    color: #334f3c !important;
  }

  .ltc-enrollment-page label {
    font-weight: 900 !important;
    letter-spacing: .02em !important;
  }

  .ltc-enrollment-page input,
  .ltc-enrollment-page select {
    min-height: 46px !important;
    border-radius: 15px !important;
    border: 1px solid rgba(14,51,33,.14) !important;
    background: rgba(255,255,255,.94) !important;
    color: #193826 !important;
    box-shadow: 0 10px 24px rgba(8,39,25,.06) !important;
    transition: border-color .25s var(--ease), box-shadow .25s var(--ease), transform .25s var(--ease) !important;
  }

  .ltc-enrollment-page input:focus,
  .ltc-enrollment-page select:focus {
    border-color: rgba(215,168,77,.78) !important;
    box-shadow: 0 0 0 4px rgba(215,168,77,.16), 0 12px 30px rgba(8,39,25,.10) !important;
    transform: translateY(-1px);
  }

  .ltc-enrollment-page input[type="checkbox"] {
    min-height: auto !important;
    width: 18px !important;
    height: 18px !important;
    accent-color: var(--green-800) !important;
    box-shadow: none !important;
  }

  .ltc-enrollment-page input[type="file"] {
    padding-top: 8px !important;
    height: auto !important;
  }

  .ltc-enrollment-page input::file-selector-button {
    background: linear-gradient(135deg, var(--green-800), var(--green-700)) !important;
    color: white !important;
    border: 0 !important;
    border-radius: 999px !important;
    padding: 7px 12px !important;
    margin-right: 10px !important;
    font-weight: 900 !important;
  }

  .ltc-enrollment-page form a {
    color: var(--green-900) !important;
    background: rgba(215,168,77,.16);
    border: 1px solid rgba(215,168,77,.34);
    border-radius: 999px;
    padding: 12px 18px;
    text-decoration: none;
  }

  .ltc-enrollment-page form a:hover {
    background: rgba(215,168,77,.26);
    transform: translateY(-1px);
  }

  .ltc-enrollment-page form button[type="submit"],
  .ltc-enrollment-page form button[type="button"] {
    min-height: 48px !important;
    min-width: 210px !important;
    border-radius: 999px !important;
    border: 0 !important;
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 18px 34px rgba(215,168,77,.24) !important;
    font-size: 12px !important;
    font-weight: 900 !important;
    letter-spacing: .08em !important;
  }

  .ltc-enrollment-page form button[type="button"] {
    color: var(--green-900) !important;
    background: white !important;
    border: 1px solid rgba(14,51,33,.14) !important;
    box-shadow: 0 12px 26px rgba(8,39,25,.08) !important;
  }

  .ltc-enrollment-page form button:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    filter: brightness(1.02);
  }

  .ltc-enrollment-page [class*="text-red"] { color: #b42318 !important; }
  .ltc-enrollment-page [class*="text-green"] { color: #027a48 !important; }
  .ltc-enrollment-page [class*="text-yellow"] { color: #854a0e !important; }

  .ltc-enrollment-page footer {
    background: var(--footer-green) !important;
    color: rgba(255,255,255,.78) !important;
    position: relative;
    overflow: hidden;
  }

  .ltc-enrollment-page footer::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 8% 10%, rgba(215,168,77,.12), transparent 28%),
      radial-gradient(circle at 88% 80%, rgba(255,255,255,.08), transparent 24%);
    pointer-events: none;
  }

  .ltc-enrollment-page footer > div { position: relative; z-index: 1; }
  .ltc-enrollment-page footer h2,
  .ltc-enrollment-page footer h3 { color: white !important; }
  .ltc-enrollment-page footer p,
  .ltc-enrollment-page footer button,
  .ltc-enrollment-page footer div { color: rgba(255,255,255,.74) !important; }
  .ltc-enrollment-page footer button:hover { color: var(--gold-soft) !important; }
  .ltc-enrollment-page footer [class*="border"] { border-color: rgba(255,255,255,.10) !important; }

  @media (max-width: 768px) {
    .ltc-enrollment-page header > div:first-child {
      padding-left: 18px !important;
      padding-right: 18px !important;
    }

    .ltc-enrollment-page main > section:nth-child(2) {
      padding: 58px 18px 56px !important;
    }

    .ltc-enrollment-page main > section:nth-child(2) h1::before,
    .ltc-enrollment-page main > section:nth-child(2) h1::after {
      font-size: 42px !important;
    }

    .ltc-enrollment-page main > section:nth-child(3) {
      padding: 34px 10px 48px !important;
    }

    .ltc-enrollment-page main > section:nth-child(3) > div {
      width: min(100%, 94%) !important;
      border-radius: 22px;
      padding: 18px;
    }

    .ltc-enrollment-page form > section { padding: 18px; }
  }
`;


const FILE_RULES = {
  birthCertificate: {
    label: "Birth Certificate",
    required: true,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    accept: ".pdf,.jpg,.jpeg,.png,.webp",
    allowedLabel: "PDF, JPG, JPEG, PNG, or WEBP",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
    allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
  },
  form137138: {
    label: "Form 137/138",
    required: false,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    accept: ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx",
    allowedLabel: "PDF, JPG, JPEG, PNG, WEBP, DOC, or DOCX",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".doc",
      ".docx",
    ],
  },
  diplomaTor: {
    label: "Diploma/TOR",
    required: true,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    accept: ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx",
    allowedLabel: "PDF, JPG, JPEG, PNG, WEBP, DOC, or DOCX",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".doc",
      ".docx",
    ],
  },
  picture2x2: {
    label: "2X2 Picture with Name",
    required: true,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    accept: ".jpg,.jpeg,.png,.webp",
    allowedLabel: "JPG, JPEG, PNG, or WEBP",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
  marriageContract: {
    label: "Marriage Contract",
    required: false,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    accept: ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx",
    allowedLabel: "PDF, JPG, JPEG, PNG, WEBP, DOC, or DOCX",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".doc",
      ".docx",
    ],
  },
  applicationForm: {
    label: "Application Form",
    required: true,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    accept: ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx",
    allowedLabel: "PDF, JPG, JPEG, PNG, WEBP, DOC, or DOCX",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".doc",
      ".docx",
    ],
  },
};

function sanitizeNameInput(value = "") {
  return String(value)
    .replace(/[^A-Za-zÀ-ÿ ]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/g, "");
}

function sanitizePhoneInput(value = "") {
  let cleaned = String(value).replace(/[^0-9+]/g, "");

  if (cleaned.includes("+")) {
    cleaned = `+${cleaned.replace(/\+/g, "")}`;
  }

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(0, 13);
  } else {
    cleaned = cleaned.slice(0, 11);
  }

  return cleaned;
}

function getFileExtension(filename = "") {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
}

function calculateAge(birthDate) {
  if (!birthDate) return null;

  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}

function isFutureDate(dateString) {
  if (!dateString) return false;

  const picked = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(picked.getTime())) return false;

  const today = new Date();
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return picked.getTime() > todayOnly.getTime();
}

function validateFileValue(file, rule) {
  if (!file) {
    return rule.required ? `${rule.label} is required.` : "";
  }

  const fileType = String(file.type || "").toLowerCase();
  const fileExt = getFileExtension(file.name || "");

  const mimeMatched = rule.allowedMimeTypes.includes(fileType);
  const extMatched = rule.allowedExtensions.includes(fileExt);

  if (!mimeMatched && !extMatched) {
    return `${rule.label} must be ${rule.allowedLabel}.`;
  }

  if (file.size > rule.maxSizeBytes) {
    return `${rule.label} must be ${MAX_FILE_SIZE_MB}MB or less.`;
  }

  return "";
}

function getInitialForm() {
  return {
    firstName: "",
    lastName: "",
    middleName: "",
    phoneNumber: "",
    email: "",
    birthDate: "",
    gender: "",
    status: "",
    completeAddress: "",
    course: "",
    batchId: "",

    educationAttainment: {
      elementaryGraduate: false,
      highSchoolGraduate: false,
      tvetGraduate: false,
      collegeLevel: false,
      collegeGraduate: false,
      others: false,
    },
    otherEducationText: "",

    employmentStatus: {
      casual: false,
      jobOrder: false,
      probationary: false,
      permanent: false,
      ofw: false,
      selfEmployed: false,
    },

    birthCertificate: null,
    form137138: null,
    diplomaTor: null,
    picture2x2: null,
    marriageContract: null,
    applicationForm: null,
  };
}

function getInitialTouched() {
  return {
    firstName: false,
    lastName: false,
    middleName: false,
    phoneNumber: false,
    email: false,
    birthDate: false,
    gender: false,
    status: false,
    completeAddress: false,
    course: false,
    batchId: false,
    educationAttainment: false,
    otherEducationText: false,
    employmentStatus: false,
    birthCertificate: false,
    form137138: false,
    diplomaTor: false,
    picture2x2: false,
    marriageContract: false,
    applicationForm: false,
  };
}

function getValidationErrors(form, options = {}) {
  const { emailDuplicate = false, availableBatches = [] } = options;
  const errors = {};
  const age = calculateAge(form.birthDate);

  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const middleNameRaw = form.middleName;
  const middleName = form.middleName.trim();
  const phoneNumber = form.phoneNumber.trim();
  const email = form.email.trim().toLowerCase();
  const completeAddress = form.completeAddress.trim();
  const course = form.course.trim();
  const batchId = form.batchId.trim();
  const otherEducationTextRaw = form.otherEducationText;
  const otherEducationText = form.otherEducationText.trim();

  if (!firstName) {
    errors.firstName = "First name is required.";
  } else if (firstName.length > MAX_LENGTHS.firstName) {
    errors.firstName = `First name must be ${MAX_LENGTHS.firstName} characters or less.`;
  } else if (!NAME_REGEX.test(firstName)) {
    errors.firstName = "First name must contain letters only.";
  }

  if (!lastName) {
    errors.lastName = "Last name is required.";
  } else if (lastName.length > MAX_LENGTHS.lastName) {
    errors.lastName = `Last name must be ${MAX_LENGTHS.lastName} characters or less.`;
  } else if (!NAME_REGEX.test(lastName)) {
    errors.lastName = "Last name must contain letters only.";
  }

  if (middleNameRaw && !middleName) {
    errors.middleName = "Middle name cannot contain spaces only.";
  } else if (middleName.length > MAX_LENGTHS.middleName) {
    errors.middleName = `Middle name must be ${MAX_LENGTHS.middleName} characters or less.`;
  } else if (middleName && !NAME_REGEX.test(middleName)) {
    errors.middleName = "Middle name must contain letters only.";
  }

  if (!phoneNumber) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!PH_PHONE_REGEX.test(phoneNumber)) {
    errors.phoneNumber =
      "Use a valid PH mobile number like 09XXXXXXXXX or +639XXXXXXXXX.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (email.length > MAX_LENGTHS.email) {
    errors.email = `Email must be ${MAX_LENGTHS.email} characters or less.`;
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Please enter a valid email address.";
  } else if (emailDuplicate) {
    errors.email = "This email is already used.";
  }

  if (!form.birthDate) {
    errors.birthDate = "Birth date is required.";
  } else if (isFutureDate(form.birthDate)) {
    errors.birthDate = "Birth date cannot be in the future.";
  } else if (age === null) {
    errors.birthDate = "Please enter a valid birth date.";
  } else if (age < 18) {
    errors.birthDate = "Applicant must be 18 years old and above.";
  }

  if (!form.gender) {
    errors.gender = "Gender is required.";
  }

  if (!form.status) {
    errors.status = "Status is required.";
  }

  if (!completeAddress) {
    errors.completeAddress = "Complete address is required.";
  } else if (completeAddress.length > MAX_LENGTHS.completeAddress) {
    errors.completeAddress = `Complete address must be ${MAX_LENGTHS.completeAddress} characters or less.`;
  }

  if (!course) {
    errors.course = "Course is required.";
  }

  if (!batchId) {
    errors.batchId = "No open batch selected for this course.";
  } else {
    const matchedBatch = availableBatches.find(
      (item) => String(item._id) === batchId
    );

    if (!matchedBatch) {
      errors.batchId = "Selected batch is not currently open.";
    } else if (
      normalizeCourseName(matchedBatch.course) !== normalizeCourseName(course)
    ) {
      errors.batchId = "Selected batch does not match the chosen course.";
    }
  }

  const educationSelectedCount = Object.values(form.educationAttainment).filter(
    Boolean
  ).length;

  if (educationSelectedCount === 0) {
    errors.educationAttainment = "Please select one educational attainment.";
  } else if (educationSelectedCount > 1) {
    errors.educationAttainment =
      "Please select only one educational attainment.";
  }

  if (form.educationAttainment.others) {
    if (!otherEducationTextRaw || !otherEducationText) {
      errors.otherEducationText =
        "Please specify the other educational attainment.";
    } else if (otherEducationText.length > MAX_LENGTHS.otherEducationText) {
      errors.otherEducationText = `Other educational attainment must be ${MAX_LENGTHS.otherEducationText} characters or less.`;
    }
  }

  const employmentSelectedCount = Object.values(form.employmentStatus).filter(
    Boolean
  ).length;

  if (employmentSelectedCount === 0) {
    errors.employmentStatus = "Please select at least one employment status.";
  }

  Object.entries(FILE_RULES).forEach(([fieldName, rule]) => {
    const fileError = validateFileValue(form[fieldName], rule);
    if (fileError) {
      errors[fieldName] = fileError;
    }
  });

  return errors;
}

async function checkDuplicateEmail(apiBase, email) {
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanEmail) {
    return { checked: false, exists: false };
  }

  const possibleEndpoints = [
    `${apiBase}/enrollments/check-email?email=${encodeURIComponent(cleanEmail)}`,
    `${apiBase}/enrollments/check-email/${encodeURIComponent(cleanEmail)}`,
  ];

  for (const url of possibleEndpoints) {
    try {
      const res = await fetch(url);

      if (res.status === 404) continue;

      if (res.status === 409) {
        return { checked: true, exists: true };
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) continue;

      if (
        data?.exists === true ||
        data?.isDuplicate === true ||
        data?.available === false
      ) {
        return { checked: true, exists: true };
      }

      if (
        data?.exists === false ||
        data?.isDuplicate === false ||
        data?.available === true
      ) {
        return { checked: true, exists: false };
      }

      return { checked: true, exists: false };
    } catch {
      // ignore unavailable duplicate-check endpoint
    }
  }

  return { checked: false, exists: false };
}

export default function TrainingEnrollmentForm() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState(getInitialForm());
  const [touched, setTouched] = useState(getInitialTouched());
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(true);
  const [openBatches, setOpenBatches] = useState([]);
  const [fileResetKey, setFileResetKey] = useState(0);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [emailState, setEmailState] = useState({
    checking: false,
    duplicate: false,
    checked: false,
  });

  useEffect(() => {
    const run = async () => {
      try {
        setBatchLoading(true);

        const batches = await loadOpenBatches(API_BASE);
        setOpenBatches(batches);
      } catch (error) {
        setOpenBatches([]);

        setMsg({
          type: "error",
          text: error.message || "Failed to load open batches.",
        });
      } finally {
        setBatchLoading(false);
      }
    };

    run();
  }, []);

  const age = useMemo(() => calculateAge(form.birthDate), [form.birthDate]);

  const availableCourseOptions = useMemo(() => {
    return [
      ...new Set(
        openBatches
          .map((item) => normalizeCourseName(item.course))
          .filter(Boolean)
      ),
    ];
  }, [openBatches]);

  const batchesForSelectedCourse = useMemo(() => {
    const selectedCourse = normalizeCourseName(form.course);

    return openBatches.filter(
      (item) => normalizeCourseName(item.course) === selectedCourse
    );
  }, [form.course, openBatches]);

  const selectedBatch = useMemo(() => {
    return openBatches.find((item) => String(item._id) === String(form.batchId));
  }, [openBatches, form.batchId]);

  const errors = useMemo(() => {
    return getValidationErrors(form, {
      emailDuplicate: emailState.duplicate,
      availableBatches: openBatches,
    });
  }, [form, emailState.duplicate, openBatches]);

  const selectedEducation = useMemo(() => {
    return Object.entries(form.educationAttainment)
      .filter(([, value]) => value)
      .map(([key]) => key);
  }, [form.educationAttainment]);

  const selectedEmployment = useMemo(() => {
    return Object.entries(form.employmentStatus)
      .filter(([, value]) => value)
      .map(([key]) => key);
  }, [form.employmentStatus]);

  const submitDisabled =
    loading ||
    batchLoading ||
    !openBatches.length ||
    (form.course && !batchesForSelectedCourse.length);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const goToProfile = () => {
    const token = localStorage.getItem("trainingToken");
    goTo(token ? "/trainee-profile" : "/trainee-login");
  };

  const clearMessage = () => {
    if (msg.type) setMsg({ type: "", text: "" });
  };

  const markTouched = (name) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const markAllTouched = () => {
    setTouched(
      Object.keys(getInitialTouched()).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (["firstName", "lastName", "middleName"].includes(name)) {
      nextValue = sanitizeNameInput(value);
    }

    if (name === "phoneNumber") {
      nextValue = sanitizePhoneInput(value);
    }

    setForm((prev) => {
      if (name === "course") {
        const matchingBatches = openBatches.filter(
          (item) => normalizeCourseName(item.course) === normalizeCourseName(nextValue)
        );

        return {
          ...prev,
          course: nextValue,
          batchId: matchingBatches[0]?._id ? String(matchingBatches[0]._id) : "",
        };
      }

      return {
        ...prev,
        [name]: nextValue,
      };
    });

    if (name === "email") {
      setEmailState({
        checking: false,
        duplicate: false,
        checked: false,
      });
    }

    markTouched(name);
    clearMessage();
  };

  const onEducationChange = (key) => {
    setForm((prev) => {
      const willEnable = !prev.educationAttainment[key];

      const resetEducation = Object.keys(prev.educationAttainment).reduce(
        (acc, currentKey) => {
          acc[currentKey] = false;
          return acc;
        },
        {}
      );

      const nextEducation = willEnable
        ? { ...resetEducation, [key]: true }
        : resetEducation;

      return {
        ...prev,
        educationAttainment: nextEducation,
        otherEducationText:
          willEnable && key === "others" ? prev.otherEducationText : "",
      };
    });

    markTouched("educationAttainment");

    if (key === "others") {
      markTouched("otherEducationText");
    }

    clearMessage();
  };

  const onEmploymentChange = (key) => {
    setForm((prev) => ({
      ...prev,
      employmentStatus: {
        ...prev.employmentStatus,
        [key]: !prev.employmentStatus[key],
      },
    }));

    markTouched("employmentStatus");
    clearMessage();
  };

  const onFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;

    setForm((prev) => ({
      ...prev,
      [name]: file,
    }));

    markTouched(name);
    clearMessage();
  };

  const handleEmailBlur = async () => {
    markTouched("email");

    const emailValue = form.email.trim().toLowerCase();

    if (!emailValue || !EMAIL_REGEX.test(emailValue)) {
      setEmailState({
        checking: false,
        duplicate: false,
        checked: false,
      });
      return;
    }

    setEmailState((prev) => ({
      ...prev,
      checking: true,
    }));

    const result = await checkDuplicateEmail(API_BASE, emailValue);

    setEmailState({
      checking: false,
      duplicate: result.exists,
      checked: result.checked,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    markAllTouched();
    setMsg({ type: "", text: "" });

    let duplicateFromPrecheck = emailState.duplicate;

    const preCheckErrors = getValidationErrors(form, {
      emailDuplicate: duplicateFromPrecheck,
      availableBatches: openBatches,
    });

    if (Object.keys(preCheckErrors).length > 0) {
      setMsg({
        type: "error",
        text: "Please review the highlighted fields before submitting.",
      });
      return;
    }

    try {
      setLoading(true);

      const cleanEmail = form.email.trim().toLowerCase();

      if (cleanEmail && EMAIL_REGEX.test(cleanEmail)) {
        const duplicateCheck = await checkDuplicateEmail(API_BASE, cleanEmail);

        if (duplicateCheck.checked) {
          duplicateFromPrecheck = duplicateCheck.exists;

          setEmailState({
            checking: false,
            duplicate: duplicateCheck.exists,
            checked: duplicateCheck.checked,
          });
        }
      }

      const submitErrors = getValidationErrors(form, {
        emailDuplicate: duplicateFromPrecheck,
        availableBatches: openBatches,
      });

      if (Object.keys(submitErrors).length > 0) {
        setMsg({
          type: "error",
          text: "Please review the highlighted fields before submitting.",
        });
        return;
      }

      const body = new FormData();

      body.append("firstName", form.firstName.trim());
      body.append("lastName", form.lastName.trim());
      body.append("middleName", form.middleName.trim());
      body.append("phoneNumber", form.phoneNumber.trim());
      body.append("email", cleanEmail);
      body.append("birthDate", form.birthDate);
      body.append("age", String(age || ""));
      body.append("gender", form.gender);
      body.append("status", form.status);
      body.append("completeAddress", form.completeAddress.trim());
      body.append("course", form.course.trim());
      body.append("batchId", form.batchId.trim());
      body.append("educationAttainment", JSON.stringify(selectedEducation));
      body.append("otherEducationText", form.otherEducationText.trim());
      body.append("employmentStatus", JSON.stringify(selectedEmployment));

      if (form.birthCertificate) {
        body.append("birthCertificate", form.birthCertificate);
      }

      if (form.form137138) {
        body.append("form137138", form.form137138);
      }

      if (form.diplomaTor) {
        body.append("diplomaTor", form.diplomaTor);
      }

      if (form.picture2x2) {
        body.append("picture2x2", form.picture2x2);
      }

      if (form.marriageContract) {
        body.append("marriageContract", form.marriageContract);
      }

      if (form.applicationForm) {
        body.append("applicationForm", form.applicationForm);
      }

      const res = await fetch(`${API_BASE}/enrollments`, {
        method: "POST",
        body,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const serverMessage = data?.message || "Failed to submit application.";

        if (
          /email/i.test(serverMessage) &&
          /(exist|already|used|taken|registered)/i.test(serverMessage)
        ) {
          setEmailState({
            checking: false,
            duplicate: true,
            checked: true,
          });
        }

        throw new Error(serverMessage);
      }

      setMsg({
        type: "success",
        text: data?.message || "Application submitted successfully.",
      });

      const nextState = {
        firstName: form.firstName.trim(),
        email: cleanEmail,
        course: form.course.trim(),
        emailNoticeSent: Boolean(data?.emailNoticeSent),
      };

      setForm(getInitialForm());
      setTouched(getInitialTouched());
      setEmailState({
        checking: false,
        duplicate: false,
        checked: false,
      });
      setFileResetKey((prev) => prev + 1);

      setTimeout(() => {
        navigate("/training-submit", {
          replace: true,
          state: nextState,
        });
      }, 1200);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Submission failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ltc-enrollment-page">
      <style>{enrollmentPageStyles}</style>
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#d7ddcf] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-[62px] max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => goTo("/training")}
            className="flex items-center gap-3"
            aria-label="TAMSI Home"
          >
            <img
              src="/TamsiLogo.png"
              alt="TAMSI Logo"
              className="h-11 w-11 object-contain"
            />

            <span className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b]">
              TAMSI
            </span>
          </button>

          <nav className="ml-auto hidden items-center gap-3 md:flex lg:gap-4">
            <button
              type="button"
              onClick={() => goTo("/training")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25]"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => goTo("/training-course")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25]"
            >
              Course
            </button>

            <button
              type="button"
              onClick={() => goTo("/training-requirements")}
              className="border-b-2 border-[#45674b] pb-1 text-[11px] font-bold uppercase tracking-wide text-[#173d25]"
            >
              Requirements
            </button>

            <button
              type="button"
              onClick={() => goTo("/training-contact-us")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25]"
            >
              Contact
            </button>

            <button
              type="button"
              onClick={() => goTo("/training-contact-us")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25]"
            >
              FAQs
            </button>
          </nav>

          <button
            type="button"
            onClick={() => goTo("/trainee-login")}
            className="ml-3 hidden text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] md:block lg:ml-4"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-md border border-[#45674b]/20 bg-[#f7faf2] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#45674b] md:hidden"
          >
            Menu
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#d7ddcf] bg-white px-5 py-3 md:hidden">
            <div className="space-y-1 rounded-xl bg-[#f4f7ef] p-2">
              <button
                type="button"
                onClick={() => goTo("/training")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo("/training-course")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Course
              </button>

              <button
                type="button"
                onClick={() => goTo("/training-requirements")}
                className="block w-full rounded-lg bg-white px-4 py-3 text-left text-sm font-bold text-[#173d25]"
              >
                Requirements
              </button>

              <button
                type="button"
                onClick={() => goTo("/training-contact-us")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Contact / FAQs
              </button>

              <button
                type="button"
                onClick={goToProfile}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Profile
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-login")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* BANNER IMAGE */}
        <section className="h-[160px] overflow-hidden bg-[#cad1c5] sm:h-[210px] md:h-[260px]">
          <img
            src="/tamsi-building.jpg"
            alt="TAMSI Building"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/1600x420/d7ddd4/45674b?text=TAMSI+Training+And+Assessment";
            }}
          />
        </section>

        {/* FORM TITLE */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#486b4b] via-[#123a20] to-[#123a20] px-5 py-6 text-white sm:px-8 lg:px-12">
          <div className="relative mx-auto max-w-[1280px]">
            <h1 className="text-center font-['Montserrat',sans-serif] text-3xl font-extrabold drop-shadow-md sm:text-4xl">
              Enrollment Form
            </h1>

            <div className="mx-auto mt-3 h-[3px] max-w-[300px] rounded-full bg-white/45" />
          </div>
        </section>

        {/* FORM BODY */}
        <section className="bg-[#2e5038] px-5 pb-9 pt-7 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1280px]">
            {msg.text && (
              <div
                className={[
                  "mb-6 rounded-lg px-4 py-3 text-sm font-semibold",
                  msg.type === "success"
                    ? "bg-green-50 text-green-800 ring-1 ring-green-200"
                    : "bg-red-50 text-red-800 ring-1 ring-red-200",
                ].join(" ")}
              >
                {msg.text}
              </div>
            )}

            {!batchLoading && !openBatches.length ? (
              <div className="mb-6 rounded-xl bg-yellow-50 px-4 py-4 text-sm font-semibold text-yellow-900 ring-1 ring-yellow-200">
                Enrollment is currently closed. Please wait for the professor to
                open a new batch.
              </div>
            ) : null}

            <form onSubmit={submit} className="space-y-8">
              {/* PERSONAL INFO */}
              <section>
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <SectionTitle title="Personal Information" />

                  <div className="w-full md:w-[360px]">
                    <Select
                      name="course"
                      value={form.course}
                      onChange={onChange}
                      onBlur={() => markTouched("course")}
                      error={
                        touched.course || touched.batchId
                          ? errors.course || errors.batchId
                          : ""
                      }
                      options={[
                        {
                          value: "",
                          label: batchLoading
                            ? "Loading courses..."
                            : "Choose Course",
                        },
                        ...availableCourseOptions.map((course) => ({
                          value: course,
                          label: course,
                        })),
                      ]}
                    />

                    {selectedBatch ? (
                      <p className="mt-1 text-[10px] font-semibold text-white/70">
                        Open batch: {selectedBatch.batchName}{" "}
                        {selectedBatch.batchCode
                          ? `(${selectedBatch.batchCode})`
                          : ""}
                      </p>
                    ) : null}

                    {(touched.course || touched.batchId) &&
                      (errors.course || errors.batchId) && (
                        <p className="mt-1 text-[10px] font-semibold text-red-200">
                          {errors.course || errors.batchId}
                        </p>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
                  <Field
                    label="First Name"
                    error={touched.firstName ? errors.firstName : ""}
                  >
                    <Input
                      name="firstName"
                      value={form.firstName}
                      onChange={onChange}
                      onBlur={() => markTouched("firstName")}
                      maxLength={MAX_LENGTHS.firstName}
                      error={touched.firstName ? errors.firstName : ""}
                    />
                  </Field>

                  <Field
                    label="Last Name"
                    error={touched.lastName ? errors.lastName : ""}
                  >
                    <Input
                      name="lastName"
                      value={form.lastName}
                      onChange={onChange}
                      onBlur={() => markTouched("lastName")}
                      maxLength={MAX_LENGTHS.lastName}
                      error={touched.lastName ? errors.lastName : ""}
                    />
                  </Field>

                  <Field
                    label="Middle Name"
                    error={touched.middleName ? errors.middleName : ""}
                  >
                    <Input
                      name="middleName"
                      value={form.middleName}
                      onChange={onChange}
                      onBlur={() => markTouched("middleName")}
                      maxLength={MAX_LENGTHS.middleName}
                      error={touched.middleName ? errors.middleName : ""}
                    />
                  </Field>

                  <Field
                    label="Phone Number"
                    error={touched.phoneNumber ? errors.phoneNumber : ""}
                  >
                    <Input
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={onChange}
                      onBlur={() => markTouched("phoneNumber")}
                      maxLength={13}
                      error={touched.phoneNumber ? errors.phoneNumber : ""}
                      inputMode="numeric"
                    />
                  </Field>

                  <Field label="Email" error={touched.email ? errors.email : ""}>
                    <>
                      <Input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        onBlur={handleEmailBlur}
                        maxLength={MAX_LENGTHS.email}
                        error={touched.email ? errors.email : ""}
                      />
                      {emailState.checking && (
                        <p className="mt-1 text-[10px] font-semibold text-white/70">
                          Checking email...
                        </p>
                      )}
                    </>
                  </Field>

                  <Field
                    label="Date of Birth"
                    error={touched.birthDate ? errors.birthDate : ""}
                  >
                    <Input
                      type="date"
                      name="birthDate"
                      value={form.birthDate}
                      onChange={onChange}
                      onBlur={() => markTouched("birthDate")}
                      error={touched.birthDate ? errors.birthDate : ""}
                    />
                  </Field>

                  <Field label="Age">
                    <Input value={age ?? ""} readOnly />
                  </Field>

                  <Field
                    label="Gender"
                    error={touched.gender ? errors.gender : ""}
                  >
                    <Select
                      name="gender"
                      value={form.gender}
                      onChange={onChange}
                      onBlur={() => markTouched("gender")}
                      error={touched.gender ? errors.gender : ""}
                      options={[
                        { value: "", label: "" },
                        { value: "Male", label: "Male" },
                        { value: "Female", label: "Female" },
                      ]}
                    />
                  </Field>

                  <Field
                    label="Status"
                    error={touched.status ? errors.status : ""}
                  >
                    <Select
                      name="status"
                      value={form.status}
                      onChange={onChange}
                      onBlur={() => markTouched("status")}
                      error={touched.status ? errors.status : ""}
                      options={[
                        { value: "", label: "" },
                        { value: "Single", label: "Single" },
                        { value: "Married", label: "Married" },
                        { value: "Widowed", label: "Widowed" },
                        { value: "Separated", label: "Separated" },
                      ]}
                    />
                  </Field>

                  <div className="md:col-span-3">
                    <Field
                      label="Complete Address"
                      error={
                        touched.completeAddress ? errors.completeAddress : ""
                      }
                    >
                      <Input
                        name="completeAddress"
                        value={form.completeAddress}
                        onChange={onChange}
                        onBlur={() => markTouched("completeAddress")}
                        maxLength={MAX_LENGTHS.completeAddress}
                        error={
                          touched.completeAddress ? errors.completeAddress : ""
                        }
                      />
                    </Field>
                  </div>
                </div>
              </section>

              {/* EDUCATION */}
              <section>
                <SectionTitle title="Highest Educational Attainment" />

                <div className="mt-5 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                  <CheckItem
                    label="Elementary Graduate"
                    checked={form.educationAttainment.elementaryGraduate}
                    onChange={() => onEducationChange("elementaryGraduate")}
                  />

                  <CheckItem
                    label="High School Graduate"
                    checked={form.educationAttainment.highSchoolGraduate}
                    onChange={() => onEducationChange("highSchoolGraduate")}
                  />

                  <CheckItem
                    label="TVET Graduate"
                    checked={form.educationAttainment.tvetGraduate}
                    onChange={() => onEducationChange("tvetGraduate")}
                  />

                  <CheckItem
                    label="College Level"
                    checked={form.educationAttainment.collegeLevel}
                    onChange={() => onEducationChange("collegeLevel")}
                  />

                  <CheckItem
                    label="College Graduate"
                    checked={form.educationAttainment.collegeGraduate}
                    onChange={() => onEducationChange("collegeGraduate")}
                  />

                  <div className="flex items-center gap-2">
                    <CheckItem
                      label="Others:"
                      checked={form.educationAttainment.others}
                      onChange={() => onEducationChange("others")}
                    />

                    <input
                      type="text"
                      name="otherEducationText"
                      value={form.otherEducationText}
                      onChange={onChange}
                      onBlur={() => markTouched("otherEducationText")}
                      maxLength={MAX_LENGTHS.otherEducationText}
                      className="h-[20px] w-[120px] border-b border-white/80 bg-transparent text-xs font-bold text-white outline-none"
                    />
                  </div>
                </div>

                {touched.educationAttainment && errors.educationAttainment && (
                  <p className="mt-3 text-xs font-semibold text-red-200">
                    {errors.educationAttainment}
                  </p>
                )}

                {touched.otherEducationText && errors.otherEducationText && (
                  <p className="mt-2 text-xs font-semibold text-red-200">
                    {errors.otherEducationText}
                  </p>
                )}
              </section>

              {/* EMPLOYMENT STATUS */}
              <section>
                <SectionTitle title="Employment Status" />

                <div className="mt-5 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  <CheckItem
                    label="Casual"
                    checked={form.employmentStatus.casual}
                    onChange={() => onEmploymentChange("casual")}
                  />

                  <CheckItem
                    label="Job Order"
                    checked={form.employmentStatus.jobOrder}
                    onChange={() => onEmploymentChange("jobOrder")}
                  />

                  <CheckItem
                    label="Probationary"
                    checked={form.employmentStatus.probationary}
                    onChange={() => onEmploymentChange("probationary")}
                  />

                  <CheckItem
                    label="Permanent"
                    checked={form.employmentStatus.permanent}
                    onChange={() => onEmploymentChange("permanent")}
                  />

                  <CheckItem
                    label="OFW"
                    checked={form.employmentStatus.ofw}
                    onChange={() => onEmploymentChange("ofw")}
                  />

                  <CheckItem
                    label="Self-Employed"
                    checked={form.employmentStatus.selfEmployed}
                    onChange={() => onEmploymentChange("selfEmployed")}
                  />
                </div>

                {touched.employmentStatus && errors.employmentStatus && (
                  <p className="mt-3 text-xs font-semibold text-red-200">
                    {errors.employmentStatus}
                  </p>
                )}
              </section>

              {/* UPLOAD REQUIREMENTS */}
              <section>
                <SectionTitle title="Upload Requirements" />

                <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
                  <UploadField
                    label="Birth Certificate"
                    name="birthCertificate"
                    onChange={onFileChange}
                    fileValue={form.birthCertificate}
                    inputKey={`birthCertificate-${fileResetKey}`}
                    accept={FILE_RULES.birthCertificate.accept}
                    error={
                      touched.birthCertificate ? errors.birthCertificate : ""
                    }
                  />

                  <UploadField
                    label="Form 137/138 (Optional)"
                    name="form137138"
                    onChange={onFileChange}
                    fileValue={form.form137138}
                    inputKey={`form137138-${fileResetKey}`}
                    accept={FILE_RULES.form137138.accept}
                    error={touched.form137138 ? errors.form137138 : ""}
                  />

                  <UploadField
                    label="Diploma/TOR"
                    name="diplomaTor"
                    onChange={onFileChange}
                    fileValue={form.diplomaTor}
                    inputKey={`diplomaTor-${fileResetKey}`}
                    accept={FILE_RULES.diplomaTor.accept}
                    error={touched.diplomaTor ? errors.diplomaTor : ""}
                  />

                  <UploadField
                    label="2X2 Picture with Name"
                    name="picture2x2"
                    onChange={onFileChange}
                    fileValue={form.picture2x2}
                    inputKey={`picture2x2-${fileResetKey}`}
                    accept={FILE_RULES.picture2x2.accept}
                    error={touched.picture2x2 ? errors.picture2x2 : ""}
                  />

                  <UploadField
                    label="Marriage Contract (Optional)"
                    name="marriageContract"
                    onChange={onFileChange}
                    fileValue={form.marriageContract}
                    inputKey={`marriageContract-${fileResetKey}`}
                    accept={FILE_RULES.marriageContract.accept}
                    error={
                      touched.marriageContract ? errors.marriageContract : ""
                    }
                  />

                  <UploadField
                    label="Application Form"
                    name="applicationForm"
                    onChange={onFileChange}
                    fileValue={form.applicationForm}
                    inputKey={`applicationForm-${fileResetKey}`}
                    accept={FILE_RULES.applicationForm.accept}
                    error={touched.applicationForm ? errors.applicationForm : ""}
                  />
                </div>

                <a
                  href="/TAMSI_APPLICATION_FORM.docx"
                  download="TAMSI_APPLICATION_FORM.docx"
                  className="mt-8 inline-block font-['Montserrat',sans-serif] text-[14px] font-extrabold text-white transition hover:opacity-80 sm:text-[16px]"
                >
                  Click here to Download the Form
                </a>
              </section>

              <div className="flex flex-wrap items-center justify-center gap-5 pt-2">
                <button
                  type="submit"
                  disabled={submitDisabled}
                  className="h-[32px] min-w-[190px] rounded-full bg-white px-8 font-['Montserrat',sans-serif] text-[10px] font-extrabold uppercase text-[#45674b] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f5f8f2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Submitting..."
                    : batchLoading
                    ? "Loading Batches..."
                    : "Submit Application"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/training")}
                  className="h-[32px] min-w-[190px] rounded-full bg-white px-8 font-['Montserrat',sans-serif] text-[10px] font-extrabold uppercase text-[#45674b] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f5f8f2]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white text-[#4d6f55]">
        <div className="w-full px-0 py-3">
          <div className="grid grid-cols-1 gap-3 px-4 sm:px-6 md:grid-cols-[1.25fr_0.7fr_1.1fr_0.9fr_0.65fr] lg:px-8">
            <div className="border-[#d6ded2] md:border-r md:pr-4">
              <div className="flex items-center gap-4">
                <img
                  src="/TamsiLogo.png"
                  alt="Lumispire Logo"
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/80x80/ffffff/4d6f55?text=L";
                  }}
                />

                <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b]">
                  LUMISPIRE
                </h2>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-4">
              <h3 className="text-xs font-extrabold text-[#45674b]">Menu</h3>

              <div className="mt-1 space-y-0.5 text-[11px] font-semibold text-[#6b776d]">
                <button
                  type="button"
                  onClick={() => goTo("/training")}
                  className="block hover:text-[#173d25]"
                >
                  Home
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/training-course")}
                  className="block hover:text-[#173d25]"
                >
                  Course
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/training-requirements")}
                  className="block hover:text-[#173d25]"
                >
                  Requirements
                </button>

                <button
                  type="button"
                  onClick={goToProfile}
                  className="block hover:text-[#173d25]"
                >
                  Profile
                </button>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-4">
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Contact Information
              </h3>

              <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
                <p>ltc.tamsi@gmail.com</p>
                <p>lorengladis@ltcmultiservices.com</p>
                <p>0995906805 / 09516281271</p>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-4">
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Address
              </h3>

              <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
                <p>2/F 5441 Currie Street,</p>
                <p>Palanan, Makati City</p>
              </div>
            </div>

            <div className="md:pl-4">
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Follow Us
              </h3>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1 border-t border-[#d6ded2] px-4 pt-2 text-[9px] font-bold text-[#7b897e] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div className="flex w-full flex-col">
      <h2 className="font-['Montserrat',sans-serif] text-[24px] font-extrabold text-white/85 sm:text-[28px]">
        {title}
      </h2>
      <div className="mt-1 h-[2px] w-full max-w-[310px] rounded-full bg-white/30" />
    </div>
  );
}

function Field({ label, children, error = "" }) {
  return (
    <div>
      <label className="mb-1 block font-['Montserrat',sans-serif] text-[11px] font-extrabold text-white/90">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-[10px] font-semibold text-red-200">{error}</p>
      )}
    </div>
  );
}

function Input({
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  error = "",
  readOnly = false,
  maxLength,
  placeholder = "",
  inputMode,
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      readOnly={readOnly}
      maxLength={maxLength}
      placeholder={placeholder}
      inputMode={inputMode}
      aria-invalid={!!error}
      className={[
        "h-[31px] w-full rounded-md border bg-white px-3 font-['Inter',sans-serif] text-[12px] font-semibold text-[#263d2c] outline-none shadow-sm",
        readOnly ? "cursor-default bg-white/95" : "",
        error ? "border-red-300" : "border-white/80 focus:border-white",
      ].join(" ")}
    />
  );
}

function Select({ name, value, onChange, onBlur, error = "", options = [] }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      aria-invalid={!!error}
      className={[
        "h-[31px] w-full rounded-md border bg-white px-3 font-['Inter',sans-serif] text-[12px] font-semibold text-[#263d2c] outline-none shadow-sm",
        error ? "border-red-300" : "border-white/80 focus:border-white",
      ].join(" ")}
    >
      {options.map((option) => (
        <option key={`${name}-${option.value}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function CheckItem({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 font-['Montserrat',sans-serif] text-[11px] font-extrabold text-white/90">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-white"
      />
      <span>{label}</span>
    </label>
  );
}

function UploadField({
  label,
  name,
  onChange,
  fileValue,
  inputKey,
  accept,
  error = "",
}) {
  return (
    <div>
      <label className="mb-1 block font-['Montserrat',sans-serif] text-[11px] font-extrabold text-white/90">
        {label}
      </label>

      <input
        key={inputKey}
        type="file"
        name={name}
        accept={accept}
        onChange={(e) => onChange(e)}
        aria-invalid={!!error}
        className={[
          "block h-[31px] w-full rounded-md border bg-white px-2 py-1 font-['Inter',sans-serif] text-[10px] font-semibold text-[#263d2c] shadow-sm file:mr-2 file:rounded file:border-0 file:bg-[#45674b] file:px-2 file:py-0.5 file:text-[10px] file:font-bold file:text-white",
          error ? "border-red-300" : "border-white/80",
        ].join(" ")}
      />

      {fileValue?.name && (
        <p className="mt-1 truncate text-[10px] font-semibold text-white/70">
          {fileValue.name}
        </p>
      )}

      {error && (
        <p className="mt-1 text-[10px] font-semibold text-red-200">{error}</p>
      )}
    </div>
  );
}
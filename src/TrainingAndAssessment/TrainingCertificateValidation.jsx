// src/TrainingAndAssessment/TrainingCertificateValidation.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TrainingChatbot from "./TrainingChatbot";


const HEADER_LOGO_IMAGE = "/TamsiLogo.png";
const FOOTER_LOGO_IMAGE = "/TrainingLumispireLogo.png";
const HERO_IMAGE = "/tamsi-banner.jpg";

const TRAINING_HOME_ROUTE = "/training";
const TRAINING_COURSE_ROUTE = "/training-course";
const TRAINING_REQUIREMENTS_ROUTE = "/training-requirements";
const TRAINING_CONTACT_ROUTE = "/training-contact-us";
const TRAINING_FAQS_ROUTE = "/training-faqs";
const TRAINING_LOGIN_ROUTE = "/training-login";
const TRAINING_CERTIFICATE_VALIDATION_ROUTE = "/training-certificate-validation";

const TRAINING_NAV_ITEMS = [
  { key: "home", label: "Home", path: TRAINING_HOME_ROUTE },
  { key: "course", label: "Course", path: TRAINING_COURSE_ROUTE },
  { key: "requirements", label: "Requirements", path: TRAINING_REQUIREMENTS_ROUTE },
  { key: "contact", label: "Contact", path: TRAINING_CONTACT_ROUTE },
  { key: "faqs", label: "FAQs", path: TRAINING_FAQS_ROUTE },
  { key: "certificate-validation", label: "Certificate Validation", path: TRAINING_CERTIFICATE_VALIDATION_ROUTE },
];

const TRAINING_CONTACT_INFO = {
  email1: "lorengladius@ltcmultiservices.com",
  email2: "ltc.tamsi@gmail.com",
  phone: "+639516281271 / +639959808051",
  addressLine1: "2/F 5441 CURRIE STREET,",
  addressLine2: "PALANAN, MAKATI CITY",
};

function CertificateHeader({ navigate, onOpenMenu }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#082719] shadow-[0_10px_34px_rgba(7,31,20,.14)]">
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => navigate(TRAINING_HOME_ROUTE)}
          className="flex min-h-[44px] items-center gap-3 text-left text-white"
          aria-label="Training and Assessment Home"
        >
          <img
            src={HEADER_LOGO_IMAGE}
            alt="TAMSI Logo"
            width="42"
            height="42"
            decoding="async"
            className="h-[42px] w-[42px] rounded-full bg-white object-contain"
          />
          <span>
            <span className="block text-[18px] font-black uppercase leading-none tracking-tight">
              TRAINING &amp; ASSESSMENT
            </span>
            <span className="mt-1 block text-[11px] font-semibold text-white/70">
              Training and assessment portal.
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Training navigation">
          {TRAINING_NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className={`min-h-[44px] rounded-full px-4 text-[12px] font-extrabold uppercase tracking-wide transition ${
                item.key === "certificate-validation"
                  ? "bg-white/15 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate(TRAINING_LOGIN_ROUTE)}
            className="ml-2 min-h-[44px] rounded-full bg-gradient-to-r from-[#f4d484] to-[#d7a84d] px-5 text-[12px] font-black uppercase tracking-wide text-[#102418]"
          >
            Sign In
          </button>
        </nav>

        <button
          type="button"
          onClick={onOpenMenu}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white lg:hidden"
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function CertificateMobileMenu({ navigate, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <aside className="absolute right-0 top-0 h-full w-[310px] max-w-[86vw] bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174a30]">Menu</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2f4f2] text-lg font-black text-[#071f14]"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="mt-4 grid gap-2" aria-label="Mobile training navigation">
          {TRAINING_NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onClose();
                navigate(item.path);
              }}
              className={`min-h-[48px] rounded-xl px-4 text-left text-sm font-extrabold ${
                item.key === "certificate-validation"
                  ? "bg-[#174a30] text-white"
                  : "text-[#071f14] hover:bg-[#eef3e9]"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(TRAINING_LOGIN_ROUTE);
            }}
            className="min-h-[48px] rounded-xl bg-[#f4d484] px-4 text-left text-sm font-black text-[#102418]"
          >
            Sign In
          </button>
        </nav>
      </aside>
    </div>
  );
}

function CertificateFooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[#f4d484]">{title}</h3>
      <div className="mt-3 space-y-1.5 text-[13px] font-semibold leading-5 text-white/70">{children}</div>
    </div>
  );
}

function CertificateFooter({ navigate }) {
  return (
    <footer className="border-t border-white/10 bg-[#082719] text-white">
      <div className="mx-auto grid w-full max-w-[1440px] gap-7 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_1.2fr_1fr_.7fr] lg:px-10">
        <button
          type="button"
          onClick={() => navigate(TRAINING_HOME_ROUTE)}
          className="flex min-h-[44px] items-center gap-4 text-left"
        >
          <img
            src={FOOTER_LOGO_IMAGE}
            alt="Training Lumispire Logo"
            width="110"
            height="72"
            loading="lazy"
            decoding="async"
            className="h-auto w-[110px] object-contain"
          />
          <span>
            <span className="block text-lg font-black uppercase leading-tight">TRAINING &amp; ASSESSMENT</span>
            <span className="mt-2 block max-w-[280px] text-[13px] font-semibold leading-5 text-white/70">
              Practical training, assessment, and learner support.
            </span>
          </span>
        </button>

        <CertificateFooterColumn title="Menu">
          <button type="button" onClick={() => navigate(TRAINING_HOME_ROUTE)} className="block min-h-[44px] text-left hover:text-white">Home</button>
          <button type="button" onClick={() => navigate(TRAINING_COURSE_ROUTE)} className="block min-h-[44px] text-left hover:text-white">Course</button>
          <button type="button" onClick={() => navigate(TRAINING_CERTIFICATE_VALIDATION_ROUTE)} className="block min-h-[44px] text-left hover:text-white">Certificate Validation</button>
          <button type="button" onClick={() => navigate(TRAINING_LOGIN_ROUTE)} className="block min-h-[44px] text-left hover:text-white">Sign In</button>
        </CertificateFooterColumn>

        <CertificateFooterColumn title="Contact Information">
          <p>{TRAINING_CONTACT_INFO.email1}</p>
          <p>{TRAINING_CONTACT_INFO.email2}</p>
          <p>{TRAINING_CONTACT_INFO.phone}</p>
        </CertificateFooterColumn>

        <CertificateFooterColumn title="Address">
          <p>{TRAINING_CONTACT_INFO.addressLine1}</p>
          <p>{TRAINING_CONTACT_INFO.addressLine2}</p>
        </CertificateFooterColumn>

        <CertificateFooterColumn title="Follow Us">
          <a
            href="https://www.facebook.com/profile.php?id=61571746334920"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center hover:text-white"
          >
            Facebook
          </a>
        </CertificateFooterColumn>
      </div>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-1 border-t border-white/10 px-4 py-4 text-[11px] font-semibold text-white/50 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
        <span>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
        <span>Developed by CRMS Tech Alliance</span>
      </div>
    </footer>
  );
}

function CertificateStandaloneShell({ children }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fbf9] font-sans text-[#071f14]">
      <CertificateHeader navigate={navigate} onOpenMenu={() => setMobileOpen(true)} />

      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-r from-[#03180f] via-[#082719] to-[#155f3b] text-white">
          <img
            src={HERO_IMAGE}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#02120bf5] via-[#052517e8] to-[#0c4027c2]" aria-hidden="true" />
          <div className="mx-auto w-[92%] max-w-[1180px] px-1 py-20 text-center sm:py-24">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">Certificate Validation</h1>
            <p className="mx-auto mt-5 max-w-3xl text-base font-semibold leading-7 text-white/80">
              Search and validate issued TAMSI training certificates using the trainee name and certificate number.
            </p>
          </div>
        </section>

        {children}
      </main>

      <CertificateFooter navigate={navigate} />

      {mobileOpen ? (
        <CertificateMobileMenu navigate={navigate} onClose={() => setMobileOpen(false)} />
      ) : null}

      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Back to LTC Group home"
        title="Back to Home"
        className="fixed bottom-[104px] right-6 z-[80] inline-flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-white p-1.5 shadow-xl transition hover:-translate-y-1"
      >
        <img src={HEADER_LOGO_IMAGE} alt="" aria-hidden="true" width="52" height="52" className="h-full w-full rounded-full object-contain" />
      </button>

      <TrainingChatbot />
    </div>
  );
}

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const initialFilters = {
  lastName: "",
  firstName: "",
  firstFour: "",
  lastFour: "",
};

function clean(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildCertificateSearchUrl(filters) {
  const params = new URLSearchParams();

  Object.entries(filters || {}).forEach(([key, value]) => {
    const cleanValue = clean(value);
    if (cleanValue) params.set(key, cleanValue);
  });

  return `${API_BASE}/training/certificate/search?${params.toString()}`;
}

export default function TrainingCertificateValidation() {
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [certificates, setCertificates] = useState([]);

  const hasSearchValue = useMemo(() => {
    return Object.values(filters).some((value) => clean(value));
  }, [filters]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: name === "firstFour" || name === "lastFour"
        ? value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 8).toUpperCase()
        : value,
    }));
  };

  const resetSearch = () => {
    setFilters(initialFilters);
    setCertificates([]);
    setError("");
    setSearched(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSearched(true);
    setError("");
    setCertificates([]);

    if (!hasSearchValue) {
      setError("Please enter a name or certificate number filter first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(buildCertificateSearchUrl(filters));
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Certificate validation failed.");
      }

      const list = Array.isArray(data?.certificates)
        ? data.certificates
        : data?.certificate
        ? [data.certificate]
        : [];

      setCertificates(list);

      if (!list.length) {
        setError(data?.message || "No matching certificate record was found.");
      }
    } catch (err) {
      setError(err?.message || "Certificate validation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CertificateStandaloneShell>
      <section className="bg-[#f4f7ef] px-5 py-10 text-[#243b2e] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[28px] border border-[#d9e2d1] bg-white shadow-xl">
          <div className="border-b border-[#e1e8dc] bg-[#eef3e9] px-6 py-6 sm:px-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#3f552f]">
              Registry Search
            </p>
            <h2 className="mt-2 font-['Montserrat',sans-serif] text-3xl font-extrabold text-[#1f4329] sm:text-4xl">
              Registry of Certified Trainees
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#405247]">
              Enter the exact name and certificate number details shown on the certificate. You may use only the name fields or combine them with the first and last characters of the certificate number for a more accurate result.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-7 sm:px-8">
            <ValidationField
              label="Search by:"
              name="lastName"
              placeholder="Last Name"
              value={filters.lastName}
              onChange={handleChange}
            />

            <ValidationField
              label="Search by:"
              name="firstName"
              placeholder="First Name"
              value={filters.firstName}
              onChange={handleChange}
            />

            <ValidationField
              label="and/or Filter by:"
              name="firstFour"
              placeholder="First Four of Certificate No."
              value={filters.firstFour}
              onChange={handleChange}
            />

            <ValidationField
              label="and/or Filter by:"
              name="lastFour"
              placeholder="Last Four of Certificate No."
              value={filters.lastFour}
              onChange={handleChange}
            />

            {error ? (
              <div className="rounded-2xl border border-[#f2c6c6] bg-[#fff4f4] px-4 py-3 text-sm font-bold text-[#9b2d2d]">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-xl bg-[#f7c735] px-8 text-sm font-extrabold uppercase tracking-wide text-[#1f2d22] shadow-md transition hover:bg-[#f2bd1e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Searching..." : "Search"}
              </button>

              <button
                type="button"
                onClick={resetSearch}
                className="h-12 rounded-xl border border-[#cfd9c8] bg-white px-8 text-sm font-extrabold uppercase tracking-wide text-[#45674b] transition hover:bg-[#f4f7ef]"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="mx-auto mt-8 max-w-[1280px]">
          {certificates.length ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#b9d9bd] bg-[#edf8ee] px-5 py-4 text-sm font-bold text-[#23592e]">
                {certificates.length === 1
                  ? "1 valid certificate record found."
                  : `${certificates.length} valid certificate records found.`}
              </div>

              {certificates.map((certificate) => (
                <CertificateResultCard
                  key={certificate?._id || certificate?.verificationCode || certificate?.certificateNo}
                  certificate={certificate}
                />
              ))}
            </div>
          ) : searched && !loading && !error ? (
            <div className="rounded-2xl border border-[#e1e8dc] bg-white px-5 py-5 text-sm font-bold text-[#66756a] shadow-sm">
              No matching certificate record was found.
            </div>
          ) : null}
        </div>
      </section>
    </CertificateStandaloneShell>
  );
}

function ValidationField({ label, name, placeholder, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-base font-extrabold text-[#1f2d22]">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-14 w-full rounded-lg border border-[#dce3d8] bg-white px-4 text-sm font-semibold text-[#243b2e] outline-none transition placeholder:text-[#68768c] focus:border-[#6f7d49] focus:ring-4 focus:ring-[#6f7d49]/15"
      />
    </div>
  );
}

function CertificateResultCard({ certificate }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[#d9e2d1] bg-white shadow-lg">
      <div className="flex flex-col gap-4 border-b border-[#edf1e9] bg-gradient-to-r from-[#123a20] to-[#45674b] px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/75">
            Valid Certificate
          </p>
          <h3 className="mt-1 font-['Montserrat',sans-serif] text-2xl font-extrabold">
            {certificate?.traineeName || "Certified Trainee"}
          </h3>
        </div>

        <span className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold uppercase tracking-wide">
          {certificate?.status || "issued"}
        </span>
      </div>

      <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-3">
        <ResultItem label="Course" value={certificate?.courseDisplayName || certificate?.course} />
        <ResultItem label="Qualification" value={certificate?.qualificationTitle} />
        <ResultItem label="Certificate No." value={certificate?.certificateNo} />
        <ResultItem label="Serial No." value={certificate?.serialNo} />
        <ResultItem label="Batch" value={certificate?.batchCode || certificate?.batchName} />
        <ResultItem label="Issued Date" value={formatDate(certificate?.issuedAt)} />
      </div>

      <div className="border-t border-[#edf1e9] bg-[#f8faf5] px-6 py-4 text-xs font-bold text-[#66756a]">
        Verification Code: {certificate?.verificationCode || "-"}
      </div>
    </article>
  );
}

function ResultItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#e1e8dc] bg-[#fbfcf8] px-4 py-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#6f7d49]">
        {label}
      </p>
      <p className="mt-2 text-sm font-extrabold text-[#243b2e]">
        {value || "-"}
      </p>
    </div>
  );
}

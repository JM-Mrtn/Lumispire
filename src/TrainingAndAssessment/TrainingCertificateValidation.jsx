// src/TrainingAndAssessment/TrainingCertificateValidation.jsx
import React, { useMemo, useState } from "react";
import { TrainingPublicShell } from "./TrainingPublicLayout";

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
    <TrainingPublicShell
      active="certificate-validation"
      title="Certificate Validation"
      subtitle="Search and validate issued TAMSI training certificates using the trainee name and certificate number."
    >
      <section className="bg-[#f4f7ef] px-5 py-10 text-[#243b2e] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[28px] border border-[#d9e2d1] bg-white shadow-xl">
          <div className="border-b border-[#e1e8dc] bg-[#eef3e9] px-6 py-6 sm:px-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#6f7d49]">
              Registry Search
            </p>
            <h2 className="mt-2 font-['Montserrat',sans-serif] text-3xl font-extrabold text-[#1f4329] sm:text-4xl">
              Registry of Certified Trainees
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#66756a]">
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
    </TrainingPublicShell>
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

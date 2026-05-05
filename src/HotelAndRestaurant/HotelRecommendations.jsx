// HotelRecommendations.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVICE_OPTIONS = ["Any", "Hotel", "Resort & Venue", "Event Package"];
const VIBE_OPTIONS = [
  "Any",
  "nature",
  "family",
  "overnight",
  "budget",
  "formal",
  "birthday",
  "wedding",
  "corporate",
];
const DURATION_OPTIONS = ["Any", "8 Hours", "12 Hours", "22 Hours"];

const HotelRecommendations = () => {
  const navigate = useNavigate();

  const COLORS = useMemo(
    () => ({
      green: "#3f5b44",
      greenDark: "#2f4d36",
      border: "rgba(63, 91, 68, 0.35)",
      soft: "#ECE9E1",
      card: "#ffffff",
    }),
    []
  );

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
      /\/+$/,
      ""
    );
    if (raw.includes("/api/hotel")) return raw;
    if (raw.includes("/api/")) return raw;
    return `${raw}/api/hotel`;
  }, []);

  const [filters, setFilters] = useState({
    preferredService: "Any",
    preferredVibe: "Any",
    duration: "Any",
    eventType: "",
    pax: "",
    budget: "",
  });

  const [loading, setLoading] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });

  const setField = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setStatus({ type: "", message: "" });
  };

  const buildQuery = () => {
    const q = new URLSearchParams();

    if (filters.preferredService && filters.preferredService !== "Any") {
      q.set("preferredService", filters.preferredService);
    }

    if (filters.preferredVibe && filters.preferredVibe !== "Any") {
      q.set("preferredVibe", filters.preferredVibe);
    }

    if (filters.duration && filters.duration !== "Any") {
      q.set("duration", filters.duration);
    }

    if (filters.eventType.trim()) {
      q.set("eventType", filters.eventType.trim());
    }

    if (filters.pax) {
      q.set("pax", filters.pax);
    }

    if (filters.budget) {
      q.set("budget", filters.budget);
    }

    return q.toString();
  };

  const fetchRecommendations = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/hotel-login");
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const qs = buildQuery();
      const url = `${API_BASE}/recommendations${qs ? `?${qs}` : ""}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        navigate("/hotel-login");
        return;
      }

      if (!res.ok) {
        setRecommendations([]);
        setStatus({
          type: "error",
          message: data.message || "Failed to load recommendations.",
        });
        return;
      }

      setHistoryCount(Number(data.historyCount || 0));
      setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
    } catch (err) {
      console.error(err);
      setRecommendations([]);
      setStatus({
        type: "error",
        message: "Network error while loading recommendations.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusStyles =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className="min-h-screen" style={{ background: COLORS.soft }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[#3f5b44]/70">
              Smart Recommendations
            </p>
            <h1
              className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl"
              style={{ color: COLORS.green }}
            >
              Recommended for You
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
              Suggestions are based on your selected preferences and your previous
              hotel, resort, and event bookings.
            </p>
          </div>

          <button
            onClick={() => navigate("/hotel-resort")}
            className="h-10 rounded-full px-6 text-sm font-bold text-white shadow-sm hover:opacity-90"
            style={{ background: COLORS.green }}
          >
            Back to Services
          </button>
        </div>

        <div
          className="mt-8 rounded-3xl border bg-white p-5 shadow-sm"
          style={{ borderColor: COLORS.border }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <SelectField
              label="Preferred Service"
              value={filters.preferredService}
              onChange={(v) => setField("preferredService", v)}
              options={SERVICE_OPTIONS}
            />

            <SelectField
              label="Vibe / Purpose"
              value={filters.preferredVibe}
              onChange={(v) => setField("preferredVibe", v)}
              options={VIBE_OPTIONS}
            />

            <SelectField
              label="Duration"
              value={filters.duration}
              onChange={(v) => setField("duration", v)}
              options={DURATION_OPTIONS}
            />

            <Field
              label="Event Type"
              value={filters.eventType}
              onChange={(v) => setField("eventType", v.slice(0, 40))}
              placeholder="Wedding, birthday..."
            />

            <Field
              label="Pax"
              value={filters.pax}
              onChange={(v) => setField("pax", v.replace(/\D/g, "").slice(0, 3))}
              placeholder="e.g. 5"
              inputMode="numeric"
            />

            <Field
              label="Budget"
              value={filters.budget}
              onChange={(v) => setField("budget", v.replace(/\D/g, "").slice(0, 7))}
              placeholder="e.g. 5000"
              inputMode="numeric"
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs font-semibold text-black/50">
              Booking history used:{" "}
              <span className="font-extrabold text-[#3f5b44]">{historyCount}</span>{" "}
              record(s)
            </p>

            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="h-10 rounded-full px-8 text-sm font-extrabold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
              style={{ background: COLORS.green }}
            >
              {loading ? "LOADING..." : "UPDATE RECOMMENDATIONS"}
            </button>
          </div>
        </div>

        {status.message ? (
          <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${statusStyles}`}>
            {status.message}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((item) => (
            <RecommendationCard key={item.id} item={item} navigate={navigate} />
          ))}
        </div>

        {!loading && recommendations.length === 0 && !status.message ? (
          <div className="mt-8 rounded-3xl border bg-white p-8 text-center shadow-sm">
            <p className="font-bold text-[#3f5b44]">No recommendations found.</p>
            <p className="mt-2 text-sm text-black/50">
              Try lowering the budget filter or selecting “Any” service.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

function RecommendationCard({ item, navigate }) {
  const typeLabel =
    item.type === "hotel"
      ? "Hotel Room"
      : item.type === "resort"
      ? "Resort & Venue"
      : "Event Package";

  const formatPeso = (n) =>
    typeof n === "number" ? `₱${n.toLocaleString("en-PH")}` : "—";

  return (
    <div className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="bg-gradient-to-br from-[#3f5b44] to-[#7d8f74] p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">
              {typeLabel}
            </p>
            <h3 className="mt-2 text-2xl font-extrabold leading-tight">
              {item.title}
            </h3>
          </div>

          <div className="rounded-2xl bg-white/15 px-3 py-2 text-center">
            <p className="text-[10px] font-bold uppercase text-white/70">Match</p>
            <p className="text-lg font-extrabold">{item.matchPercent}%</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Price" value={formatPeso(item.price)} />
          <Info label="Max Pax" value={item.paxMax || "—"} />
          <Info label="Service" value={item.serviceType} />
          <Info label="Duration" value={item.duration || "Flexible"} />
        </div>

        <div className="mt-5">
          <p className="text-xs font-extrabold uppercase tracking-wide text-black/45">
            Why this is recommended
          </p>

          <ul className="mt-2 space-y-2 text-sm text-black/65">
            {(item.reasons || []).map((reason) => (
              <li key={reason} className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#3f5b44]" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(item.tags || []).slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#3f5b44]/10 px-3 py-1 text-xs font-bold text-[#3f5b44]"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => navigate(item.route || "/hotel-resort")}
          className="mt-6 h-10 w-full rounded-full bg-[#3f5b44] text-sm font-extrabold text-white shadow-sm hover:opacity-90"
        >
          BOOK / VIEW DETAILS
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-black/[0.035] p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-black/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold text-[#3f5b44]">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, inputMode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-extrabold text-[#3f5b44]">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="h-10 w-full rounded-full border border-[#3f5b44]/30 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#3f5b44]/20"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-extrabold text-[#3f5b44]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-full border border-[#3f5b44]/30 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#3f5b44]/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "Any" ? "Any" : option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default HotelRecommendations;
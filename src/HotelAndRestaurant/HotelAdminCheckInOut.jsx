import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_NAV = [
  ["Dashboard", "/hotel-admin-dashboard"],
  ["Manage Accounts", "/hotel-admin-accounts"],
  ["Manage Bookings", "/hotel-admin-bookings"],
  ["Check In / Out", "/hotel-admin-check-in-out"],
  ["Packages", "/hotel-admin-packages"],
  ["Guest Reviews", "/hotel-admin-reviews"],
  ["Chat Support", "/hotel-admin-chat"],
  ["ID Verification", "/hotel-admin-id-verify"],
];

const STATUS_OPTIONS = [
  ["ALL", "All Statuses"],
  ["CHECKED_IN", "Checked In"],
  ["CHECKED_OUT", "Checked Out"],
  ["NOT_CHECKED_IN", "Not Checked In"],
];

const TYPE_OPTIONS = [
  ["ALL", "All Booking Types"],
  ["resort", "Resort & Venue"],
  ["room", "Hotel & Condo"],
  ["event", "Event Package"],
];

const PAGE_SIZE = 12;

function getHotelApiBase() {
  const raw = (
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api/hotel-admin")) {
    return raw.replace(/\/api\/hotel-admin$/, "/api/hotel");
  }
  if (raw.endsWith("/api")) return `${raw}/hotel`;
  if (raw.includes("/api/hotel-admin")) {
    return raw.replace("/api/hotel-admin", "/api/hotel");
  }
  if (raw.includes("/api/hotel")) return raw;
  return `${raw}/api/hotel`;
}

function getAdminToken() {
  return (
    localStorage.getItem("hotelAdminToken") ||
    localStorage.getItem("adminToken") ||
    ""
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBookingDate(value) {
  if (!value) return "—";
  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [year, month, day] = text.split("-");
    return `${month}/${day}/${year}`;
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getTypeLabel(type) {
  if (type === "room") return "Hotel & Condo";
  if (type === "event") return "Event Package";
  return "Resort & Venue";
}

function getStatusLabel(status) {
  if (status === "CHECKED_IN") return "Checked In";
  if (status === "CHECKED_OUT") return "Checked Out";
  return "Not Checked In";
}

function getStatusClass(status) {
  if (status === "CHECKED_IN") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (status === "CHECKED_OUT") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function getTypeClass(type) {
  if (type === "event") return "border-violet-200 bg-violet-50 text-violet-800";
  if (type === "room") return "border-blue-200 bg-blue-50 text-blue-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function HotelAdminCheckInOut() {
  const navigate = useNavigate();
  const API_BASE = useMemo(() => getHotelApiBase(), []);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search);

  const signOut = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("hotelAdminToken");
    localStorage.removeItem("hotelAdmin");
    navigate("/hotel-admin-login", { replace: true });
  };

  const handleAuthFailure = () => {
    signOut();
  };

  const fetchRecords = async () => {
    const token = getAdminToken();
    if (!token) {
      handleAuthFailure();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/checkinandouts/admin/records?limit=500`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        handleAuthFailure();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load check-in/out records.");
      }

      setRecords(Array.isArray(data.records) ? data.records : []);
    } catch (fetchError) {
      console.error("Admin check-in/out fetch error:", fetchError);
      setError(fetchError.message || "Unable to load check-in/out records.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRecords = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return records.filter((record) => {
      if (statusFilter !== "ALL" && record.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && record.bookingType !== typeFilter) return false;

      if (!query) return true;

      const guest = record.guest || {};
      const booking = record.booking || {};
      const haystack = [
        guest.fullName,
        guest.username,
        guest.email,
        guest.phone,
        record.bookingId,
        getTypeLabel(record.bookingType),
        booking.label,
        booking.venue,
        booking.roomType,
        booking.packageTitle,
        booking.date,
        booking.time,
        getStatusLabel(record.status),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [records, deferredSearch, statusFilter, typeFilter]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: records.length,
      checkedIn: records.filter((item) => item.status === "CHECKED_IN").length,
      checkedOut: records.filter((item) => item.status === "CHECKED_OUT").length,
      today: records.filter(
        (item) => isToday(item.checkInAt) || isToday(item.checkOutAt)
      ).length,
    };
  }, [records]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredRecords.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F8F6] text-slate-900 lg:flex">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 bg-[#082719] p-6 lg:block">
        <div className="flex h-full flex-col">
          <button
            type="button"
            onClick={() => navigate("/hotel-admin-dashboard")}
            className="mb-7 text-center text-white"
          >
            <img
              src="/HotelLogo.webp"
              width="56"
              height="56"
              loading="eager"
              decoding="async"
              alt="Hotel & Resort logo"
              className="mx-auto mb-3 h-14 w-14 rounded-full object-cover"
            />
            <div className="text-xs font-extrabold tracking-[0.18em] text-[#F4D484]">
              HOTEL & RESORT ADMIN
            </div>
            <div className="mt-2 text-base font-extrabold text-white">
              Patio De Lorenzo
            </div>
          </button>

          <nav className="space-y-2" aria-label="Hotel admin navigation">
            {ADMIN_NAV.map(([label, path]) => {
              const active = path === "/hotel-admin-check-in-out";
              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => navigate(path)}
                  className={`flex min-h-11 w-full items-center rounded-2xl px-5 text-left text-sm font-bold transition-colors ${
                    active
                      ? "bg-[#F4D484] text-[#082719]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={signOut}
            className="mt-auto min-h-11 rounded-2xl bg-white/10 px-5 text-left text-sm font-bold text-white hover:bg-white/15"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:pl-64">
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="m-0 text-xs font-extrabold uppercase tracking-[0.2em] text-[#2F754C]">
                Mobile Guest Activity
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#082719] sm:text-4xl">
                Check In / Out
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600">
                View guest check-in and check-out activity submitted from the hotel mobile app.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchRecords}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#082719] px-6 text-sm font-extrabold text-white shadow-sm hover:bg-[#174A30] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh Records"}
            </button>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Check-in and check-out summary">
            <StatCard label="Total Records" value={stats.total} note="Mobile activity records" />
            <StatCard label="Checked In" value={stats.checkedIn} note="Guests currently checked in" />
            <StatCard label="Checked Out" value={stats.checkedOut} note="Completed stays / visits" />
            <StatCard label="Today" value={stats.today} note="Activity recorded today" />
          </section>

          <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4 sm:p-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_220px]">
                <label className="block">
                  <span className="sr-only">Search check-in and check-out records</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search guest, booking, email, phone..."
                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-[#F8FBF9] px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#2F754C] focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="block">
                  <span className="sr-only">Filter by status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-[#F8FBF9] px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#2F754C] focus:ring-4 focus:ring-emerald-100"
                  >
                    {STATUS_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="sr-only">Filter by booking type</span>
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-[#F8FBF9] px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#2F754C] focus:ring-4 focus:ring-emerald-100"
                  >
                    {TYPE_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {error ? (
              <div className="m-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800" role="alert">
                {error}
              </div>
            ) : null}

            {loading && records.length === 0 ? (
              <div className="p-10 text-center text-sm font-bold text-slate-500">
                Loading mobile check-in/out records...
              </div>
            ) : pageRows.length === 0 ? (
              <div className="p-10 text-center">
                <p className="m-0 text-base font-extrabold text-[#082719]">No records found</p>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  New mobile check-ins will appear here after a guest checks in.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1050px] border-collapse text-left">
                    <thead className="bg-[#F8FBF9] text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                      <tr>
                        <th className="px-5 py-4">Guest</th>
                        <th className="px-5 py-4">Booking</th>
                        <th className="px-5 py-4">Schedule</th>
                        <th className="px-5 py-4">Check In</th>
                        <th className="px-5 py-4">Check Out</th>
                        <th className="px-5 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((record) => (
                        <RecordTableRow key={record.id} record={record} />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 p-4 lg:hidden">
                  {pageRows.map((record) => (
                    <RecordMobileCard key={record.id} record={record} />
                  ))}
                </div>
              </>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="m-0 text-xs font-bold text-slate-500">
                Showing {filteredRecords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
                -{Math.min(safePage * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={safePage <= 1}
                  className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="min-w-20 text-center text-xs font-extrabold text-slate-600">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={safePage >= totalPages}
                  className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, note }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="m-0 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black tracking-tight text-[#174A30]">{value}</p>
      <p className="mt-2 text-xs font-semibold text-slate-500">{note}</p>
    </article>
  );
}

function RecordTableRow({ record }) {
  const guest = record.guest || {};
  const booking = record.booking || {};

  return (
    <tr className="border-t border-slate-100 align-top hover:bg-[#FBFDFC]">
      <td className="px-5 py-4">
        <p className="m-0 text-sm font-extrabold text-[#082719]">{guest.fullName || "Hotel Guest"}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">{guest.email || "—"}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-500">{guest.phone || "—"}</p>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${getTypeClass(record.bookingType)}`}>
          {getTypeLabel(record.bookingType)}
        </span>
        <p className="mt-2 max-w-[260px] text-sm font-extrabold text-slate-800">{booking.label || "—"}</p>
        <p className="mt-1 max-w-[260px] truncate font-mono text-[10px] font-semibold text-slate-400" title={record.bookingId}>
          {record.bookingId || "—"}
        </p>
      </td>
      <td className="px-5 py-4 text-xs font-semibold text-slate-600">
        <p className="m-0">{formatBookingDate(booking.date)}</p>
        <p className="mt-1">{booking.time || "—"}</p>
        <p className="mt-1">{booking.pax ? `${booking.pax} pax` : "—"}</p>
      </td>
      <td className="px-5 py-4 text-xs font-bold text-slate-600">{formatDateTime(record.checkInAt)}</td>
      <td className="px-5 py-4 text-xs font-bold text-slate-600">{formatDateTime(record.checkOutAt)}</td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-black ${getStatusClass(record.status)}`}>
          {getStatusLabel(record.status)}
        </span>
      </td>
    </tr>
  );
}

function RecordMobileCard({ record }) {
  const guest = record.guest || {};
  const booking = record.booking || {};

  return (
    <article className="rounded-2xl border border-slate-200 bg-[#FBFDFC] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="m-0 text-sm font-extrabold text-[#082719]">{guest.fullName || "Hotel Guest"}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{guest.email || guest.phone || "—"}</p>
        </div>
        <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black ${getStatusClass(record.status)}`}>
          {getStatusLabel(record.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Info label="Booking" value={`${getTypeLabel(record.bookingType)} · ${booking.label || "—"}`} />
        <Info label="Schedule" value={`${formatBookingDate(booking.date)} · ${booking.time || "—"}`} />
        <Info label="Check In" value={formatDateTime(record.checkInAt)} />
        <Info label="Check Out" value={formatDateTime(record.checkOutAt)} />
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="m-0 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-bold text-slate-700">{value}</p>
    </div>
  );
}

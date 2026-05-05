// HotelAdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelAdminShell from "./HotelAdminShell";

const GREEN_DARK = "#2A4F33";
const GREEN_MID = "#355E3B";
const SOFT_BG = "#F6F6F1";

const STATUS_FILTERS = [
  { value: "BOOKED", label: "Booked Dates" },
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getApiBases() {
  const raw = (
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel-admin")) {
    return {
      adminBase: raw,
      hotelBase: raw.replace(/\/api\/hotel-admin$/, "/api/hotel"),
    };
  }

  if (raw.endsWith("/api/hotel")) {
    return {
      adminBase: raw.replace(/\/api\/hotel$/, "/api/hotel-admin"),
      hotelBase: raw,
    };
  }

  if (raw.endsWith("/api")) {
    return {
      adminBase: `${raw}/hotel-admin`,
      hotelBase: `${raw}/hotel`,
    };
  }

  return {
    adminBase: `${raw}/api/hotel-admin`,
    hotelBase: `${raw}/api/hotel`,
  };
}

function getAdminToken() {
  return (
    localStorage.getItem("adminToken") ||
    localStorage.getItem("hotelAdminToken") ||
    ""
  );
}

function getAdminHeaders() {
  const token = getAdminToken();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function normalizeStatus(value = "") {
  const status = String(value || "PENDING").toUpperCase();

  if (status === "APPROVED" || status === "CONFIRMED") return "CONFIRMED";

  if (
    status === "CANCELLED" ||
    status === "CANCELED" ||
    status === "REJECTED" ||
    status === "DECLINED"
  ) {
    return "CANCELLED";
  }

  return "PENDING";
}

function getNestedUser(booking = {}) {
  const user = booking.userId || booking.user || booking.hotelUser || {};
  return typeof user === "object" && user !== null ? user : {};
}

function getCustomerName(booking = {}) {
  const user = getNestedUser(booking);

  const firstName = booking.firstName || user.firstName || "";
  const lastName = booking.lastName || user.lastName || "";

  return (
    booking.customerName ||
    booking.fullName ||
    user.fullName ||
    user.name ||
    `${firstName} ${lastName}`.trim() ||
    booking.email ||
    user.email ||
    "Hotel Guest"
  );
}

function getCustomerEmail(booking = {}) {
  const user = getNestedUser(booking);
  return booking.email || user.email || "";
}

function getCustomerPhone(booking = {}) {
  const user = getNestedUser(booking);
  return booking.phone || user.phone || user.contactNumber || "";
}

function normalizeBooking(booking = {}, fallbackType = "") {
  const bookingType = booking.bookingType || fallbackType || "resort";

  if (bookingType === "event") {
    return {
      _id: String(booking._id || booking.id || ""),
      bookingType: "event",
      serviceLabel: booking.serviceLabel || "Event Package",
      title:
        booking.title ||
        booking.eventPackage ||
        booking.packageTitle ||
        "Event Package Booking",
      customerName: getCustomerName(booking),
      email: getCustomerEmail(booking) || "—",
      phone: getCustomerPhone(booking) || "—",
      date: booking.date || booking.eventDate || "",
      time: booking.time || "",
      category:
        booking.category ||
        booking.timeVariationLabel ||
        booking.selectedVariantLabel ||
        booking.eventType ||
        "Event Package",
      location: booking.location || booking.venue || "",
      pax: Number(booking.pax || booking.totalGuests || booking.guests || 0),
      paymentMethod: booking.paymentMethod || "",
      totalAmount: Number(booking.totalAmount || booking.price || 0),
      status: normalizeStatus(booking.status),
      isActive: booking.isActive !== false,
      createdAt: booking.createdAt || booking.eventDate || booking.date || "",
      raw: booking.raw || booking,
    };
  }

  if (bookingType === "hotel_room") {
    const roomType =
      booking.roomType ||
      booking.location ||
      booking.packageTitle ||
      "Hotel Room";

    const duration = booking.duration || booking.category || "";

    return {
      _id: String(booking._id || booking.id || ""),
      bookingType: "hotel_room",
      serviceLabel: booking.serviceLabel || "Hotel & Condo",
      title:
        booking.title ||
        `${roomType}${duration ? ` - ${duration}` : ""}`,
      customerName: getCustomerName(booking),
      email: getCustomerEmail(booking) || "—",
      phone: getCustomerPhone(booking) || "—",
      date: booking.date || "",
      time: booking.time || "",
      category: duration || "Hotel Room",
      location: roomType,
      pax: Number(booking.pax || booking.totalGuests || booking.guests || 0),
      paymentMethod: booking.paymentMethod || "",
      totalAmount: Number(booking.totalAmount || booking.price || 0),
      status: normalizeStatus(booking.status),
      isActive: booking.isActive !== false,
      createdAt: booking.createdAt || booking.date || "",
      raw: booking.raw || booking,
    };
  }

  return {
    _id: String(booking._id || booking.id || ""),
    bookingType: "resort",
    serviceLabel: booking.serviceLabel || "Resort & Venue",
    title:
      booking.title ||
      booking.venue ||
      booking.packageTitle ||
      "Resort & Venue Booking",
    customerName: getCustomerName(booking),
    email: getCustomerEmail(booking) || "—",
    phone: getCustomerPhone(booking) || "—",
    date: booking.date || "",
    time: booking.time || "",
    category: booking.category || booking.duration || "",
    location: booking.location || booking.venue || "",
    pax:
      Number(
        booking.pax ||
          booking.totalGuests ||
          Number(booking.adults || 0) + Number(booking.kids || 0)
      ) || 0,
    paymentMethod: booking.paymentMethod || "",
    totalAmount: Number(booking.totalAmount || booking.price || 0),
    status: normalizeStatus(booking.status),
    isActive: booking.isActive !== false,
    createdAt: booking.createdAt || booking.date || "",
    raw: booking.raw || booking,
  };
}

function extractBookings(data, fallbackType = "") {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeBooking(item, fallbackType));
  }

  if (Array.isArray(data?.bookings)) {
    return data.bookings.map((item) => normalizeBooking(item, fallbackType));
  }

  if (Array.isArray(data?.data)) {
    return data.data.map((item) => normalizeBooking(item, fallbackType));
  }

  if (Array.isArray(data?.rows)) {
    return data.rows.map((item) => normalizeBooking(item, fallbackType));
  }

  return [];
}

function uniqueBookings(rows = []) {
  const map = new Map();

  rows.forEach((booking) => {
    if (!booking?._id || !booking?.bookingType) return;
    map.set(`${booking.bookingType}:${booking._id}`, booking);
  });

  return Array.from(map.values());
}

function todayLocalISO() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function toLocalISO(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function parseISODate(value = "") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null;

  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value) {
  if (!value) return "—";

  const parsed = parseISODate(value) || new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatPeso(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) return "—";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getServiceShortLabel(type) {
  if (type === "event") return "Event";
  if (type === "hotel_room") return "Hotel";
  return "Resort";
}

function getServiceDotClass(type) {
  if (type === "event") return "bg-violet-500";
  if (type === "hotel_room") return "bg-sky-500";
  return "bg-emerald-500";
}

function getServicePillClass(type) {
  if (type === "event") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  if (type === "hotel_room") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getStatusPillClass(status) {
  if (status === "CONFIRMED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "PENDING") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "CANCELLED") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function getStatusDotClass(status) {
  if (status === "CONFIRMED") return "bg-emerald-500";
  if (status === "PENDING") return "bg-amber-500";
  if (status === "CANCELLED") return "bg-rose-500";
  return "bg-slate-400";
}

function getCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      iso: toLocalISO(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function StatCard({ title, value, note }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-[#E9F1D9] p-6 shadow-sm">
      <p className="text-sm font-extrabold text-[#2F5E3A]/75">{title}</p>
      <p className="mt-3 text-4xl font-extrabold leading-none text-[#2F5E3A]">
        {value}
      </p>
      <p className="mt-3 text-xs font-semibold text-[#2F5E3A]/55">{note}</p>
    </div>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
        active
          ? "border-[#2A4F33] bg-[#2A4F33] text-white"
          : "border-black/10 bg-white text-black/55 hover:border-[#2A4F33]/40 hover:text-[#2A4F33]"
      }`}
    >
      {children}
    </button>
  );
}

export default function HotelAdminDashboard() {
  const navigate = useNavigate();
  const { adminBase, hotelBase } = useMemo(() => getApiBases(), []);

  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("BOOKED");

  const [monthDate, setMonthDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(todayLocalISO());

  const kickToAdminLogin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("hotelAdminToken");
    localStorage.removeItem("hotelAdmin");
    navigate("/hotel-admin-login", { replace: true });
  };

  const fetchJson = async (url) => {
    const token = getAdminToken();

    if (!token) {
      kickToAdminLogin();
      return {
        ok: false,
        authFailed: true,
        data: null,
      };
    }

    const res = await fetch(url, {
      method: "GET",
      headers: getAdminHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
      kickToAdminLogin();

      return {
        ok: false,
        authFailed: true,
        data: null,
      };
    }

    return {
      ok: res.ok,
      authFailed: false,
      data,
      message: data?.message || "",
    };
  };

  const fetchAllBookings = async () => {
    const combinedUrls = [
      `${adminBase}/admin/bookings`,
      `${hotelBase}/admin/bookings`,
    ];

    for (const url of combinedUrls) {
      try {
        const result = await fetchJson(url);

        if (result.authFailed) return [];

        if (result.ok) {
          const rows = extractBookings(result.data);

          if (rows.length) {
            return rows;
          }
        }
      } catch (error) {
        console.error("combined bookings fetch error:", error);
      }
    }

    try {
      const [resortResult, eventResult, hotelRoomResult] = await Promise.all([
        fetchJson(`${hotelBase}/admin/resort-bookings`),
        fetchJson(`${hotelBase}/admin/event-bookings`),
        fetchJson(`${hotelBase}/admin/hotel-room-bookings`),
      ]);

      if (
        resortResult.authFailed ||
        eventResult.authFailed ||
        hotelRoomResult.authFailed
      ) {
        return [];
      }

      return [
        ...(resortResult.ok ? extractBookings(resortResult.data, "resort") : []),
        ...(eventResult.ok ? extractBookings(eventResult.data, "event") : []),
        ...(hotelRoomResult.ok
          ? extractBookings(hotelRoomResult.data, "hotel_room")
          : []),
      ];
    } catch (error) {
      console.error("separate bookings fetch error:", error);
      return [];
    }
  };

  const fetchUsers = async () => {
    const urls = [`${adminBase}/hotel-users`, `${hotelBase}/hotel-users`];

    for (const url of urls) {
      try {
        const result = await fetchJson(url);

        if (result.authFailed) return [];

        if (result.ok && Array.isArray(result.data)) {
          return result.data;
        }
      } catch (error) {
        console.error("users fetch error:", error);
      }
    }

    return [];
  };

  const loadDashboard = async () => {
    const token = getAdminToken();

    if (!token) {
      kickToAdminLogin();
      return;
    }

    setLoading(true);
    setStatusMessage("");

    try {
      const [bookingRows, userRows] = await Promise.all([
        fetchAllBookings(),
        fetchUsers(),
      ]);

      const normalizedBookings = uniqueBookings(bookingRows)
        .filter((booking) => booking._id && booking.date)
        .sort((a, b) => {
          const bTime = new Date(b.date || b.createdAt || 0).getTime();
          const aTime = new Date(a.date || a.createdAt || 0).getTime();
          return aTime - bTime;
        });

      setBookings(normalizedBookings);
      setUsers(Array.isArray(userRows) ? userRows : []);

      if (!normalizedBookings.length) {
        setStatusMessage(
          "No bookings found yet. Once guests submit bookings, their dates will appear in the calendar."
        );
      }
    } catch (error) {
      console.error("loadDashboard error:", error);
      setStatusMessage(
        "Failed to load dashboard data. Make sure your backend is running and VITE_API_URL is correct."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const result = {
      total: bookings.length,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      resort: 0,
      event: 0,
      hotel_room: 0,
      upcoming: 0,
      bookedDatesThisMonth: 0,
    };

    const today = todayLocalISO();
    const bookedDatesThisMonth = new Set();

    bookings.forEach((booking) => {
      const status = normalizeStatus(booking.status);

      if (status === "PENDING") result.pending += 1;
      if (status === "CONFIRMED") result.confirmed += 1;
      if (status === "CANCELLED") result.cancelled += 1;

      if (result[booking.bookingType] !== undefined) {
        result[booking.bookingType] += 1;
      }

      if (
        booking.date >= today &&
        booking.isActive !== false &&
        ["PENDING", "CONFIRMED"].includes(status)
      ) {
        result.upcoming += 1;
      }

      const parsed = parseISODate(booking.date);

      if (
        parsed &&
        parsed.getFullYear() === monthDate.getFullYear() &&
        parsed.getMonth() === monthDate.getMonth() &&
        ["PENDING", "CONFIRMED"].includes(status)
      ) {
        bookedDatesThisMonth.add(booking.date);
      }
    });

    result.bookedDatesThisMonth = bookedDatesThisMonth.size;

    return result;
  }, [bookings, monthDate]);

  const filteredCalendarBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (!booking.date || booking.isActive === false) return false;

      const status = normalizeStatus(booking.status);

      if (statusFilter === "BOOKED") {
        return status === "PENDING" || status === "CONFIRMED";
      }

      if (statusFilter === "ALL") return true;

      return status === statusFilter;
    });
  }, [bookings, statusFilter]);

  const bookingsByDate = useMemo(() => {
    const map = new Map();

    filteredCalendarBookings.forEach((booking) => {
      if (!booking.date) return;

      const current = map.get(booking.date) || [];
      current.push(booking);
      map.set(booking.date, current);
    });

    return map;
  }, [filteredCalendarBookings]);

  const calendarDays = useMemo(() => getCalendarDays(monthDate), [monthDate]);

  const selectedDateBookings = useMemo(() => {
    return bookingsByDate.get(selectedDate) || [];
  }, [bookingsByDate, selectedDate]);

  const upcomingBookings = useMemo(() => {
    const today = todayLocalISO();

    return filteredCalendarBookings
      .filter((booking) => booking.date >= today)
      .sort((a, b) => {
        const aTime = `${a.date || ""} ${a.time || ""}`;
        const bTime = `${b.date || ""} ${b.time || ""}`;
        return aTime.localeCompare(bTime);
      })
      .slice(0, 6);
  }, [filteredCalendarBookings]);

  const goPreviousMonth = () => {
    setMonthDate((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() - 1);
      return new Date(next.getFullYear(), next.getMonth(), 1);
    });
  };

  const goNextMonth = () => {
    setMonthDate((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + 1);
      return new Date(next.getFullYear(), next.getMonth(), 1);
    });
  };

  const goToday = () => {
    const today = new Date();
    const iso = todayLocalISO();

    setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(iso);
  };

  const monthTitle = `${MONTH_NAMES[monthDate.getMonth()]} ${monthDate.getFullYear()}`;

  return (
    <HotelAdminShell
      title="Dashboard"
      subtitle="Monitor hotel activity, booking updates, guest conversations, and booked dates from one place."
      activePage="dashboard"
      maxWidth="max-w-7xl"
      actions={
        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="h-10 rounded-2xl bg-[#2A4F33] px-5 text-xs font-extrabold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "REFRESHING..." : "REFRESH"}
        </button>
      }
    >
      {statusMessage ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          title="Total Users"
          value={users.length}
          note="Registered hotel and restaurant guests"
        />
        <StatCard
          title="Total Bookings"
          value={counts.total}
          note="Resort, event, and hotel room reservations"
        />
        <StatCard
          title="Confirmed"
          value={counts.confirmed}
          note="Approved reservations"
        />
        <StatCard
          title="Pending"
          value={counts.pending}
          note="Waiting for admin review"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate("/hotel-admin-bookings")}
          className="rounded-3xl border border-black/5 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-black/40">
            Booking Queue
          </p>
          <h2
            className="mt-3 text-2xl font-extrabold"
            style={{ color: GREEN_DARK }}
          >
            Manage Bookings
          </h2>
          <p className="mt-2 text-sm font-semibold text-black/45">
            Review pending resort, event, hotel, and condo reservations.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/hotel-admin-id-verify")}
          className="rounded-3xl border border-black/5 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-black/40">
            Verification
          </p>
          <h2
            className="mt-3 text-2xl font-extrabold"
            style={{ color: GREEN_DARK }}
          >
            ID Requests
          </h2>
          <p className="mt-2 text-sm font-semibold text-black/45">
            Approve or reject guest identity verification submissions.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/hotel-admin-chat")}
          className="rounded-3xl border border-black/5 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-black/40">
            Support
          </p>
          <h2
            className="mt-3 text-2xl font-extrabold"
            style={{ color: GREEN_DARK }}
          >
            Guest Chat
          </h2>
          <p className="mt-2 text-sm font-semibold text-black/45">
            Respond to guest concerns, reschedules, cancellations, and questions.
          </p>
        </button>
      </div>

      <section className="mt-6 rounded-3xl border border-black/5 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-black/40">
              Booking Calendar
            </p>
            <h2
              className="mt-2 text-3xl font-extrabold"
              style={{ color: GREEN_DARK }}
            >
              All Booked Dates
            </h2>
            <p className="mt-1 text-sm font-semibold text-black/45">
              Dates with pending or confirmed bookings are marked on the calendar.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((item) => (
              <FilterButton
                key={item.value}
                active={statusFilter === item.value}
                onClick={() => setStatusFilter(item.value)}
              >
                {item.label}
              </FilterButton>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-3xl border border-black/5 bg-[#F6F6F1] p-4 md:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3
                  className="text-2xl font-extrabold"
                  style={{ color: GREEN_DARK }}
                >
                  {monthTitle}
                </h3>
                <p className="mt-1 text-xs font-bold text-black/45">
                  {counts.bookedDatesThisMonth} booked date
                  {counts.bookedDatesThisMonth === 1 ? "" : "s"} this month
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={goPreviousMonth}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-extrabold text-[#2A4F33] hover:bg-[#2A4F33]/5"
                >
                  Prev
                </button>

                <button
                  type="button"
                  onClick={goToday}
                  className="rounded-xl border border-[#2A4F33]/20 bg-white px-4 py-2 text-xs font-extrabold text-[#2A4F33] hover:bg-[#2A4F33]/5"
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={goNextMonth}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-extrabold text-[#2A4F33] hover:bg-[#2A4F33]/5"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="px-2 py-2 text-center text-xs font-extrabold uppercase tracking-wide text-black/45"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((day) => {
                const dayBookings = bookingsByDate.get(day.iso) || [];
                const isSelected = selectedDate === day.iso;
                const isToday = day.iso === todayLocalISO();

                return (
                  <button
                    key={day.iso}
                    type="button"
                    onClick={() => setSelectedDate(day.iso)}
                    className={`min-h-[120px] rounded-2xl border p-2 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                      isSelected
                        ? "border-[#2A4F33] bg-white shadow-md"
                        : "border-black/5 bg-white"
                    } ${!day.isCurrentMonth ? "opacity-45" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${
                          isToday
                            ? "bg-[#2A4F33] text-white"
                            : "bg-[#F6F6F1] text-[#2A4F33]"
                        }`}
                      >
                        {day.day}
                      </span>

                      {dayBookings.length ? (
                        <span className="rounded-full bg-[#E9F1D9] px-2 py-1 text-[10px] font-extrabold text-[#2F5E3A]">
                          {dayBookings.length}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 space-y-1">
                      {dayBookings.slice(0, 3).map((booking) => (
                        <div
                          key={`${booking.bookingType}-${booking._id}`}
                          className="truncate rounded-lg border border-black/5 bg-[#F6F6F1] px-2 py-1 text-[10px] font-bold text-black/60"
                          title={`${booking.serviceLabel} - ${booking.customerName}`}
                        >
                          <span
                            className={`mr-1 inline-block h-2 w-2 rounded-full ${getStatusDotClass(
                              booking.status
                            )}`}
                          />
                          {getServiceShortLabel(booking.bookingType)}
                        </div>
                      ))}

                      {dayBookings.length > 3 ? (
                        <p className="px-1 text-[10px] font-extrabold text-[#2A4F33]">
                          +{dayBookings.length - 3} more
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="rounded-3xl border border-black/5 bg-[#F6F6F1] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-black/40">
                  Selected Date
                </p>
                <h3
                  className="mt-2 text-2xl font-extrabold"
                  style={{ color: GREEN_DARK }}
                >
                  {formatDate(selectedDate)}
                </h3>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#2A4F33]">
                {selectedDateBookings.length} booking
                {selectedDateBookings.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {selectedDateBookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#2A4F33]/20 bg-white p-5 text-center">
                  <p className="text-sm font-extrabold text-[#2A4F33]">
                    No bookings on this date
                  </p>
                  <p className="mt-1 text-xs font-semibold text-black/45">
                    Choose another highlighted date from the calendar.
                  </p>
                </div>
              ) : (
                selectedDateBookings.map((booking) => (
                  <div
                    key={`${booking.bookingType}-${booking._id}`}
                    className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-extrabold ${getServicePillClass(
                          booking.bookingType
                        )}`}
                      >
                        {booking.serviceLabel}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-extrabold ${getStatusPillClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <h4 className="mt-3 text-sm font-extrabold text-[#2A4F33]">
                      {booking.title}
                    </h4>

                    <p className="mt-1 text-xs font-semibold text-black/50">
                      {booking.category || booking.location || "—"}
                    </p>

                    <div className="mt-3 space-y-1 text-xs font-semibold text-black/55">
                      <p>
                        <span className="font-extrabold text-black/65">
                          Guest:
                        </span>{" "}
                        {booking.customerName}
                      </p>
                      <p>
                        <span className="font-extrabold text-black/65">
                          Time:
                        </span>{" "}
                        {booking.time || "—"}
                      </p>
                      <p>
                        <span className="font-extrabold text-black/65">
                          Pax:
                        </span>{" "}
                        {booking.pax || "—"}
                      </p>
                      <p>
                        <span className="font-extrabold text-black/65">
                          Total:
                        </span>{" "}
                        {formatPeso(booking.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-black/40">
            Booking Summary
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-[#F6F6F1] px-4 py-3">
              <span className="text-sm font-bold text-black/55">
                Resort & Venue
              </span>
              <span className="font-extrabold text-[#2A4F33]">
                {counts.resort}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#F6F6F1] px-4 py-3">
              <span className="text-sm font-bold text-black/55">
                Event Package
              </span>
              <span className="font-extrabold text-[#2A4F33]">
                {counts.event}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#F6F6F1] px-4 py-3">
              <span className="text-sm font-bold text-black/55">
                Hotel & Condo
              </span>
              <span className="font-extrabold text-[#2A4F33]">
                {counts.hotel_room}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-black/40">
            Status Overview
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
              <span className="text-sm font-bold text-amber-700">Pending</span>
              <span className="font-extrabold text-amber-700">
                {counts.pending}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
              <span className="text-sm font-bold text-emerald-700">
                Confirmed
              </span>
              <span className="font-extrabold text-emerald-700">
                {counts.confirmed}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3">
              <span className="text-sm font-bold text-rose-700">
                Cancelled
              </span>
              <span className="font-extrabold text-rose-700">
                {counts.cancelled}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-black/40">
                Upcoming
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-[#2A4F33]">
                Next Bookings
              </h3>
            </div>

            <span className="rounded-full bg-[#E9F1D9] px-3 py-1 text-xs font-extrabold text-[#2F5E3A]">
              {counts.upcoming}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {upcomingBookings.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#2A4F33]/20 bg-[#F6F6F1] p-4 text-sm font-semibold text-black/45">
                No upcoming booked dates.
              </p>
            ) : (
              upcomingBookings.map((booking) => (
                <button
                  key={`${booking.bookingType}-${booking._id}`}
                  type="button"
                  onClick={() => {
                    setSelectedDate(booking.date);
                    const parsed = parseISODate(booking.date);
                    if (parsed) {
                      setMonthDate(
                        new Date(parsed.getFullYear(), parsed.getMonth(), 1)
                      );
                    }
                  }}
                  className="w-full rounded-2xl bg-[#F6F6F1] p-4 text-left transition hover:bg-[#E9F1D9]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-[#2A4F33]">
                      {booking.title}
                    </p>

                    <span
                      className={`h-2.5 w-2.5 rounded-full ${getServiceDotClass(
                        booking.bookingType
                      )}`}
                    />
                  </div>

                  <p className="mt-1 text-xs font-semibold text-black/50">
                    {formatDate(booking.date)} • {booking.time || "No time"}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-black/45">
                    {booking.customerName}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </section>
    </HotelAdminShell>
  );
}
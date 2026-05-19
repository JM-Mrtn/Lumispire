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

const CHART_SERVICE_FILTERS = [
  { value: "ALL", label: "All Services" },
  { value: "resort", label: "Resort" },
  { value: "hotel_room", label: "Hotel" },
  { value: "event", label: "Event" },
];

const CHART_STATUS_FILTERS = [
  { value: "ALL", label: "All Status" },
  { value: "BOOKED", label: "Booked Only" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function getCurrentYear() {
  return new Date().getFullYear();
}

function getYearOptions(backYears = 5, forwardYears = 1) {
  const currentYear = getCurrentYear();
  const startYear = currentYear - backYears;
  const endYear = currentYear + forwardYears;

  return Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => endYear - index
  );
}

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

function getMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthShortLabel(monthKey = "") {
  const [year, month] = String(monthKey).split("-").map(Number);

  if (!year || !month) return monthKey || "—";

  return new Date(year, month - 1, 1).toLocaleDateString("en-PH", {
    month: "short",
  });
}

function getYearMonthKeys(year = getCurrentYear()) {
  const selectedYear = Number(year) || getCurrentYear();

  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    return `${selectedYear}-${month}`;
  });
}

function bookingMatchesSearch(booking = {}, search = "") {
  const term = String(search || "").trim().toLowerCase();

  if (!term) return true;

  const raw = booking.raw || {};
  const searchable = [
    booking._id,
    booking.bookingType,
    booking.serviceLabel,
    booking.title,
    booking.customerName,
    booking.email,
    booking.phone,
    booking.date,
    booking.time,
    booking.category,
    booking.location,
    booking.paymentMethod,
    booking.status,
    booking.totalAmount,
    raw.firstName,
    raw.lastName,
    raw.email,
    raw.phone,
    raw.roomType,
    raw.venue,
    raw.eventPackage,
    raw.packageTitle,
    raw.selectedPackageTitle,
    raw.selectedPackage,
    raw.paymentTerm,
  ]
    .filter((value) => value !== undefined && value !== null)
    .join(" ")
    .toLowerCase();

  return searchable.includes(term);
}

function normalizeChartStatusFilter(status = "ALL") {
  const value = String(status || "ALL").toUpperCase();

  if (value === "BOOKED") return "BOOKED";
  if (value === "PENDING") return "PENDING";
  if (value === "CONFIRMED") return "CONFIRMED";
  if (value === "CANCELLED") return "CANCELLED";

  return "ALL";
}

function buildLinePath(points = []) {
  if (!points.length) return "";

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function buildAreaPath(points = [], baseline = 0) {
  if (!points.length) return "";

  const line = buildLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];

  return `${line} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
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
    <div className="ltc-admin-stat-card">
      <p className="ltc-admin-stat-title">{title}</p>
      <p className="ltc-admin-stat-value">{value}</p>
      <p className="ltc-admin-stat-note">{note}</p>
    </div>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ltc-admin-filter ${active ? "active" : ""}`}
    >
      {children}
    </button>
  );
}

function BookingLineChart({ data = [], activeService = "ALL" }) {
  const width = 860;
  const height = 330;
  const padding = { top: 34, right: 34, bottom: 54, left: 56 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const yAxisMax = 100;

  const visibleSeries = [
    {
      key: "resort",
      label: "Resort",
      stroke: "#2563eb",
      dotClassName: "resort",
      active: activeService === "ALL" || activeService === "resort",
    },
    {
      key: "hotel_room",
      label: "Hotel",
      stroke: "#38bdf8",
      dotClassName: "hotel",
      active: activeService === "ALL" || activeService === "hotel_room",
    },
    {
      key: "event",
      label: "Event",
      stroke: "#ef4444",
      dotClassName: "event",
      active: activeService === "ALL" || activeService === "event",
    },
  ].filter((item) => item.active);

  const ySteps = [100, 75, 50, 25, 0];
  const clampToAxis = (value) => Math.min(yAxisMax, Math.max(0, Number(value || 0)));

  const getPoints = (key) =>
    data.map((item, index) => {
      const x =
        padding.left +
        (data.length === 1 ? chartWidth / 2 : (chartWidth / (data.length - 1)) * index);
      const value = clampToAxis(item[key]);
      const y = padding.top + chartHeight - (value / yAxisMax) * chartHeight;

      return {
        ...item,
        x,
        y,
        value,
        rawValue: Number(item[key] || 0),
        serviceKey: key,
      };
    });

  return (
    <div className="ltc-admin-chart-wrap">
      <h3 className="ltc-admin-chart-title">Booking Sources by Month</h3>

      <div className="ltc-admin-chart-legend">
        {[
          { key: "resort", label: "Resort", className: "resort" },
          { key: "hotel_room", label: "Hotel", className: "hotel" },
          { key: "event", label: "Event", className: "event" },
        ]
          .filter((item) => activeService === "ALL" || activeService === item.key)
          .map((item) => (
            <span key={item.key} className="ltc-admin-chart-legend-item">
              <i className={item.className} />
              {item.label}
            </span>
          ))}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="12 month resort, hotel, and event booking line chart"
        className="ltc-admin-line-chart"
      >
        {ySteps.map((step) => {
          const y = padding.top + chartHeight - (step / yAxisMax) * chartHeight;

          return (
            <g key={`grid-${step}`}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                className="ltc-admin-chart-grid"
              />
              <text
                x={padding.left - 15}
                y={y + 4}
                textAnchor="end"
                className="ltc-admin-chart-label"
              >
                {step}
              </text>
            </g>
          );
        })}

        {visibleSeries.map((series) => {
          const points = getPoints(series.key);
          const linePath = buildLinePath(points);

          return (
            <g key={series.key}>
              {linePath ? (
                <path
                  d={linePath}
                  fill="none"
                  stroke={series.stroke}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ltc-admin-chart-line"
                />
              ) : null}

              {points.map((point) => (
                <g key={`${series.key}-${point.monthKey}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    className={`ltc-admin-chart-dot ${series.dotClassName}`}
                  />
                  <title>{`${series.label} ${point.label}: ${point.rawValue}`}</title>
                </g>
              ))}
            </g>
          );
        })}

        {data.map((item, index) => {
          const x =
            padding.left +
            (data.length === 1 ? chartWidth / 2 : (chartWidth / (data.length - 1)) * index);

          return (
            <text
              key={item.monthKey}
              x={x}
              y={height - 18}
              textAnchor="middle"
              className="ltc-admin-chart-month"
            >
              {item.label}
            </text>
          );
        })}
      </svg>

      <div className="ltc-admin-chart-table">
        {data.map((item) => (
          <div key={item.monthKey} className="ltc-admin-chart-stat">
            <span>{item.label}</span>
            <strong>{item.total}</strong>
            <small>
              R {item.resort} - H {item.hotel_room} - E {item.event}
            </small>
          </div>
        ))}
      </div>
    </div>
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
  const [chartServiceFilter, setChartServiceFilter] = useState("ALL");
  const [chartStatusFilter, setChartStatusFilter] = useState("BOOKED");
  const [chartYear, setChartYear] = useState(getCurrentYear());
  const [chartSearch, setChartSearch] = useState("");

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

  const chartFilteredBookings = useMemo(() => {
    const serviceFilter = String(chartServiceFilter || "ALL");
    const statusFilterValue = normalizeChartStatusFilter(chartStatusFilter);

    return bookings.filter((booking) => {
      if (!booking.date && !booking.createdAt) return false;

      if (serviceFilter !== "ALL" && booking.bookingType !== serviceFilter) {
        return false;
      }

      const normalizedStatus = normalizeStatus(booking.status);

      if (statusFilterValue === "BOOKED") {
        if (!["PENDING", "CONFIRMED"].includes(normalizedStatus)) return false;
      } else if (statusFilterValue !== "ALL" && normalizedStatus !== statusFilterValue) {
        return false;
      }

      return bookingMatchesSearch(booking, chartSearch);
    });
  }, [bookings, chartServiceFilter, chartStatusFilter, chartSearch]);

  const bookingTrendData = useMemo(() => {
    const monthKeys = getYearMonthKeys(chartYear);
    const monthMap = new Map(
      monthKeys.map((monthKey) => [
        monthKey,
        {
          monthKey,
          label: getMonthShortLabel(monthKey),
          total: 0,
          resort: 0,
          hotel_room: 0,
          event: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
        },
      ])
    );

    chartFilteredBookings.forEach((booking) => {
      const parsed =
        parseISODate(booking.date) ||
        (booking.createdAt ? new Date(booking.createdAt) : null);

      if (!parsed || Number.isNaN(parsed.getTime())) return;

      const monthKey = getMonthKey(parsed);
      const row = monthMap.get(monthKey);

      if (!row) return;

      const status = normalizeStatus(booking.status);

      row.total += 1;

      if (row[booking.bookingType] !== undefined) {
        row[booking.bookingType] += 1;
      }

      if (status === "PENDING") row.pending += 1;
      if (status === "CONFIRMED") row.confirmed += 1;
      if (status === "CANCELLED") row.cancelled += 1;
    });

    return Array.from(monthMap.values());
  }, [chartFilteredBookings, chartYear]);

  const bookingTrendTotal = useMemo(
    () => chartFilteredBookings.length,
    [chartFilteredBookings]
  );

  const chartStats = useMemo(() => {
    return chartFilteredBookings.reduce(
      (result, booking) => {
        result.total += 1;

        if (result[booking.bookingType] !== undefined) {
          result[booking.bookingType] += 1;
        }

        const status = normalizeStatus(booking.status);
        if (status === "PENDING") result.pending += 1;
        if (status === "CONFIRMED") result.confirmed += 1;
        if (status === "CANCELLED") result.cancelled += 1;

        return result;
      },
      {
        total: 0,
        resort: 0,
        hotel_room: 0,
        event: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
      }
    );
  }, [chartFilteredBookings]);

  const chartSearchResults = useMemo(() => {
    return [...chartFilteredBookings]
      .sort((a, b) => {
        const bTime = new Date(b.date || b.createdAt || 0).getTime();
        const aTime = new Date(a.date || a.createdAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 8);
  }, [chartFilteredBookings]);

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
          className="ltc-admin-refresh"
        >
          {loading ? "REFRESHING..." : "REFRESH"}
        </button>
      }
    >
      <div className="ltc-admin-dashboard">
        <style>{`
          @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

          .ltc-admin-dashboard {
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
            --glass: rgba(255,255,255,.78);
            --shadow-md: 0 18px 45px rgba(8,39,25,.12);
            --shadow-lg: 0 32px 80px rgba(8,39,25,.18);
            --radius: 24px;
            --ease: cubic-bezier(.22,1,.36,1);

            min-height: calc(100vh - 120px);
            margin: -8px;
            padding: clamp(18px, 2.2vw, 28px);
            border-radius: 30px;
            color: var(--dark);
            background:
              radial-gradient(circle at 12% 0%, rgba(215,168,77,.12), transparent 28%),
              radial-gradient(circle at 92% 12%, rgba(35,95,62,.12), transparent 30%),
              linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%);
            line-height: 1.65;
            letter-spacing: -.01em;
            overflow: hidden;
            font-family: "Inter", Arial, sans-serif;
          }

          .ltc-admin-dashboard * {
            box-sizing: border-box;
          }

          .ltc-admin-hero {
            position: relative;
            overflow: hidden;
            display: grid;
            grid-template-columns: 1.4fr .8fr;
            align-items: center;
            gap: 24px;
            margin-bottom: 22px;
            padding: clamp(28px, 4vw, 44px);
            border-radius: 32px;
            color: white;
            isolation: isolate;
            background:
              linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%),
              radial-gradient(circle at 86% 18%, rgba(244,212,132,.18), transparent 30%);
            box-shadow: var(--shadow-lg);
            animation: ltcAppleReveal .8s var(--ease) both;
          }

          .ltc-admin-hero::before {
            content: "";
            position: absolute;
            inset: -20% -12%;
            z-index: -1;
            background:
              radial-gradient(circle at 16% 82%, rgba(19,120,72,.36), transparent 24%),
              radial-gradient(circle at 70% 16%, rgba(244,212,132,.16), transparent 28%),
              radial-gradient(circle at 90% 84%, rgba(22,108,66,.32), transparent 26%);
            filter: blur(24px);
          }

          .ltc-admin-eyebrow,
          .ltc-admin-card-eyebrow {
            color: var(--gold-soft);
            font-size: 12px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: .2em;
            margin: 0;
          }

          .ltc-admin-hero h2 {
            margin: 10px 0 0;
            max-width: 860px;
            font-size: clamp(34px, 4.8vw, 62px);
            line-height: 1;
            font-weight: 900;
            letter-spacing: -.06em;
            text-shadow: 0 8px 26px rgba(0,0,0,.22);
          }

          .ltc-admin-hero h2 span {
            color: var(--gold-soft);
          }

          .ltc-admin-hero p:last-child {
            max-width: 720px;
            margin: 16px 0 0;
            color: rgba(255,255,255,.80);
            font-size: 15px;
          }

          .ltc-admin-hero-metrics {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .ltc-admin-hero-metric {
            min-height: 118px;
            padding: 20px;
            border-radius: 22px;
            background: rgba(255,255,255,.10);
            border: 1px solid rgba(255,255,255,.16);
            backdrop-filter: blur(8px);
          }

          .ltc-admin-hero-metric strong {
            display: block;
            color: var(--gold-soft);
            font-size: 32px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -.05em;
          }

          .ltc-admin-hero-metric span {
            display: block;
            margin-top: 8px;
            color: rgba(255,255,255,.76);
            font-size: 12px;
            font-weight: 800;
          }

          .ltc-admin-refresh,
          .ltc-admin-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 42px;
            border-radius: 999px;
            border: 0;
            color: #102418;
            background: linear-gradient(135deg,#f4d484,#d7a84d);
            box-shadow: 0 16px 35px rgba(215,168,77,.24);
            padding: 0 22px;
            font-size: 12px;
            font-weight: 900;
            cursor: pointer;
            transition: .28s var(--ease);
          }

          .ltc-admin-refresh:hover,
          .ltc-admin-btn:hover {
            transform: translateY(-3px);
          }

          .ltc-admin-refresh:disabled {
            cursor: not-allowed;
            opacity: .6;
            transform: none;
          }

          .ltc-admin-alert {
            margin-bottom: 18px;
            border-radius: 20px;
            border: 1px solid rgba(215,168,77,.32);
            background: rgba(244,212,132,.18);
            color: var(--green-900);
            padding: 14px 18px;
            font-size: 14px;
            font-weight: 800;
          }

          .ltc-admin-stats-grid,
          .ltc-admin-shortcut-grid,
          .ltc-admin-summary-grid {
            display: grid;
            gap: 18px;
          }

          .ltc-admin-stats-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .ltc-admin-shortcut-grid,
          .ltc-admin-summary-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            margin-top: 22px;
          }

          .ltc-admin-summary-grid {
            align-items: start;
          }

          .ltc-admin-stat-card,
          .ltc-admin-card,
          .ltc-admin-panel,
          .ltc-admin-day,
          .ltc-admin-side-card,
          .ltc-admin-list-card,
          .ltc-admin-empty {
            position: relative;
            overflow: hidden;
            border-radius: var(--radius);
            background: var(--glass);
            border: 1px solid rgba(255,255,255,.76);
            box-shadow: var(--shadow-md);
            backdrop-filter: blur(18px);
          }

          .ltc-admin-stat-card,
          .ltc-admin-card,
          .ltc-admin-panel {
            animation: ltcAppleReveal .7s var(--ease) both;
          }

          .ltc-admin-stat-card,
          .ltc-admin-card {
            padding: 26px;
          }

          .ltc-admin-summary-card {
            padding: 18px 20px;
            height: 245px;
            max-height: 245px;
            display: flex;
            flex-direction: column;
          }

          .ltc-admin-stat-card::before,
          .ltc-admin-card::before,
          .ltc-admin-panel::before,
          .ltc-admin-summary-card::before {
            content: "";
            position: absolute;
            inset: 0 0 auto;
            height: 6px;
            background: linear-gradient(90deg,var(--green-700),var(--gold));
          }

          .ltc-admin-stat-card::after,
          .ltc-admin-card::after,
          .ltc-admin-summary-card::after {
            content: "";
            position: absolute;
            width: 170px;
            height: 170px;
            right: -80px;
            bottom: -80px;
            border-radius: 50%;
            background:
              radial-gradient(circle, rgba(215,168,77,.22), transparent 58%),
              radial-gradient(circle, rgba(47,117,76,.18), transparent 66%);
            opacity: .85;
            transition: transform .45s var(--ease), opacity .45s var(--ease);
          }

          .ltc-admin-card {
            width: 100%;
            text-align: left;
            cursor: pointer;
            transition: transform .38s var(--ease), box-shadow .38s var(--ease), border-color .38s var(--ease), background .38s var(--ease);
          }

          .ltc-admin-card:hover,
          .ltc-admin-card:focus-visible,
          .ltc-admin-stat-card:hover,
          .ltc-admin-summary-card:hover {
            transform: translateY(-10px) scale(1.01);
            box-shadow: 0 34px 85px rgba(8,39,25,.20);
            border-color: rgba(215,168,77,.54);
            background: rgba(255,255,255,.92);
            outline: none;
          }

          .ltc-admin-card:hover::after,
          .ltc-admin-stat-card:hover::after,
          .ltc-admin-summary-card:hover::after {
            transform: translate(-18px, -16px) scale(1.18);
          }

          .ltc-admin-stat-title,
          .ltc-admin-card-kicker,
          .ltc-admin-panel-kicker {
            position: relative;
            z-index: 1;
            margin: 0;
            color: rgba(16,24,40,.46);
            font-size: 12px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: .18em;
          }

          .ltc-admin-stat-value {
            position: relative;
            z-index: 1;
            margin: 12px 0 0;
            color: var(--green-800);
            font-size: 42px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -.055em;
          }

          .ltc-admin-stat-note,
          .ltc-admin-card-text,
          .ltc-admin-muted {
            position: relative;
            z-index: 1;
            margin: 10px 0 0;
            color: var(--muted);
            font-size: 13px;
            font-weight: 700;
          }

          .ltc-admin-card-title,
          .ltc-admin-panel-title {
            position: relative;
            z-index: 1;
            margin: 10px 0 0;
            color: var(--green-950);
            font-size: 26px;
            line-height: 1.1;
            font-weight: 900;
            letter-spacing: -.045em;
            transition: color .3s var(--ease);
          }

          .ltc-admin-card:hover .ltc-admin-card-title {
            color: var(--green-700);
          }

          .ltc-admin-panel {
            margin-top: 22px;
            padding: 24px;
          }

          .ltc-admin-chart-panel {
            margin-top: 22px;
          }

          .ltc-admin-chart-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 18px;
            margin-bottom: 18px;
          }

          .ltc-admin-chart-total {
            min-width: 135px;
            border-radius: 18px;
            background: rgba(35,95,62,.08);
            border: 1px solid rgba(35,95,62,.10);
            color: var(--green-800);
            padding: 14px 16px;
            text-align: right;
          }

          .ltc-admin-chart-total span {
            display: block;
            color: rgba(16,24,40,.50);
            font-size: 11px;
            font-weight: 900;
            letter-spacing: .12em;
            text-transform: uppercase;
          }

          .ltc-admin-chart-total strong {
            display: block;
            margin-top: 3px;
            font-size: 28px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -.045em;
          }

          .ltc-admin-chart-controls {
            display: grid;
            grid-template-columns: minmax(260px, 1.4fr) repeat(3, minmax(130px, .55fr)) auto;
            gap: 12px;
            align-items: end;
            margin-bottom: 16px;
          }

          .ltc-admin-search-wrap,
          .ltc-admin-chart-select-wrap {
            display: grid;
            gap: 6px;
          }

          .ltc-admin-search-wrap span,
          .ltc-admin-chart-select-wrap span {
            color: rgba(16,24,40,.52);
            font-size: 10px;
            font-weight: 900;
            letter-spacing: .12em;
            text-transform: uppercase;
          }

          .ltc-admin-chart-search,
          .ltc-admin-chart-select {
            width: 100%;
            min-height: 42px;
            border-radius: 999px;
            border: 1px solid rgba(35,95,62,.14);
            background: rgba(255,255,255,.86);
            color: var(--dark);
            outline: none;
            padding: 0 15px;
            font-size: 12px;
            font-weight: 800;
            transition: .25s var(--ease);
          }

          .ltc-admin-chart-search:focus,
          .ltc-admin-chart-select:focus {
            border-color: rgba(215,168,77,.66);
            box-shadow: 0 0 0 4px rgba(215,168,77,.15);
            background: white;
          }

          .ltc-admin-chart-clear {
            min-height: 42px;
            border-radius: 999px;
            border: 1px solid rgba(35,95,62,.14);
            background: white;
            color: var(--green-800);
            padding: 0 18px;
            font-size: 12px;
            font-weight: 900;
            cursor: pointer;
            transition: .25s var(--ease);
          }

          .ltc-admin-chart-clear:hover {
            color: white;
            background: var(--green-800);
            transform: translateY(-2px);
          }

          .ltc-admin-chart-mini-grid {
            display: grid;
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 16px;
          }

          .ltc-admin-chart-mini-card {
            border-radius: 18px;
            border: 1px solid rgba(35,95,62,.08);
            background: rgba(255,255,255,.84);
            padding: 12px 14px;
            box-shadow: 0 12px 26px rgba(8,39,25,.05);
          }

          .ltc-admin-chart-mini-card span {
            display: block;
            color: rgba(16,24,40,.48);
            font-size: 10px;
            font-weight: 900;
            letter-spacing: .08em;
            text-transform: uppercase;
          }

          .ltc-admin-chart-mini-card strong {
            display: block;
            margin-top: 3px;
            font-size: 24px;
            line-height: 1;
            font-weight: 900;
          }

          .ltc-admin-chart-mini-card.resort strong { color: #10b981; }
          .ltc-admin-chart-mini-card.hotel strong { color: #0ea5e9; }
          .ltc-admin-chart-mini-card.event strong { color: #8b5cf6; }
          .ltc-admin-chart-mini-card.pending strong { color: #f59e0b; }
          .ltc-admin-chart-mini-card.confirmed strong { color: #047857; }
          .ltc-admin-chart-mini-card.cancelled strong { color: #be123c; }

          .ltc-admin-chart-wrap {
            border-radius: 10px;
            border: 1px solid rgba(16,24,40,.08);
            background: #ffffff;
            padding: 18px 18px 14px;
            box-shadow: 0 12px 26px rgba(8,39,25,.06);
          }

          .ltc-admin-chart-title {
            margin: 0 0 10px;
            color: rgba(16,24,40,.82);
            font-size: 16px;
            font-weight: 800;
            letter-spacing: -.02em;
          }

          .ltc-admin-chart-legend {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 14px;
            margin-bottom: 10px;
          }

          .ltc-admin-chart-legend-item {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: rgba(16,24,40,.68);
            font-size: 11px;
            font-weight: 800;
          }

          .ltc-admin-chart-legend-item i {
            width: 10px;
            height: 10px;
            border-radius: 999px;
          }

          .ltc-admin-chart-legend-item i.resort { background: #2563eb; }
          .ltc-admin-chart-legend-item i.hotel { background: #38bdf8; }
          .ltc-admin-chart-legend-item i.event { background: #ef4444; }

          .ltc-admin-line-chart {
            width: 100%;
            min-height: 300px;
            display: block;
          }

          .ltc-admin-chart-grid {
            stroke: rgba(16,24,40,.10);
            stroke-width: 1;
          }

          .ltc-admin-chart-label,
          .ltc-admin-chart-month {
            fill: rgba(16,24,40,.46);
            font-size: 11px;
            font-weight: 700;
          }

          .ltc-admin-chart-month {
            fill: rgba(16,24,40,.50);
            font-weight: 800;
          }

          .ltc-admin-chart-line {
            filter: none;
          }

          .ltc-admin-chart-dot {
            fill: #ffffff;
            stroke-width: 3;
          }

          .ltc-admin-chart-dot.resort {
            stroke: #2563eb;
          }

          .ltc-admin-chart-dot.hotel {
            stroke: #38bdf8;
          }

          .ltc-admin-chart-dot.event {
            stroke: #ef4444;
          }

          .ltc-admin-chart-table {
            margin-top: 12px;
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
            gap: 9px;
          }

          .ltc-admin-chart-stat {
            border-radius: 16px;
            background: rgba(255,255,255,.84);
            border: 1px solid rgba(35,95,62,.08);
            padding: 10px 12px;
            text-align: center;
          }

          .ltc-admin-chart-stat span {
            display: block;
            color: rgba(16,24,40,.48);
            font-size: 10px;
            font-weight: 900;
            letter-spacing: .08em;
            text-transform: uppercase;
          }

          .ltc-admin-chart-stat strong {
            display: block;
            margin-top: 2px;
            color: var(--green-800);
            font-size: 20px;
            line-height: 1;
            font-weight: 900;
          }

          .ltc-admin-chart-stat small {
            display: block;
            margin-top: 5px;
            color: rgba(16,24,40,.50);
            font-size: 10px;
            line-height: 1.25;
            font-weight: 800;
          }

          .ltc-admin-chart-results {
            margin-top: 18px;
            border-radius: 26px;
            border: 1px solid rgba(35,95,62,.08);
            background: rgba(246,250,247,.72);
            padding: 18px;
          }

          .ltc-admin-chart-results-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 14px;
            margin-bottom: 14px;
          }

          .ltc-admin-chart-result-list {
            display: grid;
            gap: 10px;
            max-height: 360px;
            overflow-y: auto;
            padding-right: 6px;
          }

          .ltc-admin-chart-result {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            width: 100%;
            border: 1px solid rgba(35,95,62,.08);
            border-radius: 20px;
            background: rgba(255,255,255,.88);
            box-shadow: 0 12px 26px rgba(8,39,25,.05);
            padding: 13px 14px;
            text-align: left;
            cursor: pointer;
            transition: .25s var(--ease);
          }

          .ltc-admin-chart-result:hover {
            transform: translateY(-3px);
            background: rgba(244,212,132,.22);
            border-color: rgba(215,168,77,.36);
          }

          .ltc-admin-chart-result-pills {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 7px;
          }

          .ltc-admin-panel-head {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 18px;
            margin-bottom: 18px;
          }

          .ltc-admin-filter-row,
          .ltc-admin-calendar-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 9px;
          }

          .ltc-admin-filter,
          .ltc-admin-calendar-action {
            min-height: 38px;
            border-radius: 999px;
            border: 1px solid rgba(35,95,62,.14);
            background: rgba(255,255,255,.8);
            color: rgba(16,24,40,.58);
            padding: 0 15px;
            font-size: 12px;
            font-weight: 900;
            cursor: pointer;
            transition: .25s var(--ease);
          }

          .ltc-admin-filter:hover,
          .ltc-admin-calendar-action:hover,
          .ltc-admin-filter.active {
            color: #102418;
            border-color: rgba(215,168,77,.54);
            background: linear-gradient(135deg,#f4d484,#d7a84d);
            transform: translateY(-2px);
          }

          .ltc-admin-calendar-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.6fr) minmax(320px, .9fr);
            gap: 18px;
          }

          .ltc-admin-calendar-box,
          .ltc-admin-side-panel {
            border-radius: 26px;
            border: 1px solid rgba(35,95,62,.08);
            background:
              radial-gradient(circle at 100% 0%, rgba(215,168,77,.12), transparent 26%),
              rgba(246,250,247,.88);
            padding: 20px;
          }

          .ltc-admin-month-head,
          .ltc-admin-side-head,
          .ltc-admin-next-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 14px;
            margin-bottom: 16px;
          }

          .ltc-admin-month-title,
          .ltc-admin-side-title,
          .ltc-admin-next-title {
            margin: 0;
            color: var(--green-950);
            font-size: 25px;
            line-height: 1.1;
            font-weight: 900;
            letter-spacing: -.04em;
          }

          .ltc-admin-calendar-days {
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
            gap: 9px;
          }

          .ltc-admin-weekday {
            padding: 8px 4px;
            text-align: center;
            color: rgba(16,24,40,.46);
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: .08em;
          }

          .ltc-admin-day {
            min-height: 118px;
            padding: 10px;
            text-align: left;
            cursor: pointer;
            transition: .28s var(--ease);
          }

          .ltc-admin-day:hover,
          .ltc-admin-day.selected {
            transform: translateY(-4px);
            border-color: rgba(215,168,77,.54);
            box-shadow: 0 18px 45px rgba(8,39,25,.15);
            background: rgba(255,255,255,.96);
          }

          .ltc-admin-day.muted {
            opacity: .45;
          }

          .ltc-admin-day-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px;
          }

          .ltc-admin-day-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            border-radius: 999px;
            background: #eef8f2;
            color: var(--green-800);
            font-size: 12px;
            font-weight: 900;
          }

          .ltc-admin-day-number.today {
            background: var(--green-800);
            color: white;
          }

          .ltc-admin-count-badge,
          .ltc-admin-pill-light {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: rgba(244,212,132,.42);
            color: var(--green-800);
            padding: 5px 9px;
            font-size: 10px;
            font-weight: 900;
          }

          .ltc-admin-day-items,
          .ltc-admin-side-list,
          .ltc-admin-summary-list {
            margin-top: 12px;
            display: grid;
            gap: 8px;
          }

          .ltc-admin-day-chip {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            border-radius: 10px;
            border: 1px solid rgba(35,95,62,.08);
            background: rgba(246,246,241,.88);
            padding: 5px 8px;
            color: rgba(16,24,40,.66);
            font-size: 10px;
            font-weight: 800;
          }

          .ltc-status-dot,
          .ltc-service-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            margin-right: 5px;
            border-radius: 999px;
            vertical-align: middle;
          }

          .ltc-service-dot {
            width: 10px;
            height: 10px;
            margin-right: 0;
          }

          .bg-violet-500 { background: #8b5cf6; }
          .bg-sky-500 { background: #0ea5e9; }
          .bg-emerald-500 { background: #10b981; }
          .bg-amber-500 { background: #f59e0b; }
          .bg-rose-500 { background: #f43f5e; }
          .bg-slate-400 { background: #94a3b8; }

          .ltc-admin-more {
            margin: 2px 0 0;
            padding: 0 5px;
            color: var(--green-800);
            font-size: 10px;
            font-weight: 900;
          }

          .ltc-admin-booking-card,
          .ltc-admin-empty,
          .ltc-admin-upcoming-card,
          .ltc-admin-row {
            border-radius: 20px;
            border: 1px solid rgba(35,95,62,.08);
            background: rgba(255,255,255,.88);
            box-shadow: 0 12px 26px rgba(8,39,25,.06);
          }

          .ltc-admin-booking-card,
          .ltc-admin-empty {
            padding: 18px;
          }

          .ltc-admin-empty {
            border-style: dashed;
            text-align: center;
          }

          .ltc-admin-empty-title {
            margin: 0;
            color: var(--green-800);
            font-size: 14px;
            font-weight: 900;
          }

          .ltc-admin-booking-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .ltc-admin-service-pill,
          .ltc-admin-status-pill {
            border-radius: 999px;
            border: 1px solid rgba(35,95,62,.12);
            background: rgba(238,248,242,.86);
            color: var(--green-800);
            padding: 5px 10px;
            font-size: 10px;
            font-weight: 900;
          }

          .ltc-admin-status-pill.pending { background: #fffbeb; color: #b45309; border-color: #fde68a; }
          .ltc-admin-status-pill.confirmed { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
          .ltc-admin-status-pill.cancelled { background: #fff1f2; color: #be123c; border-color: #fecdd3; }

          .ltc-admin-booking-title {
            margin: 12px 0 0;
            color: var(--green-800);
            font-size: 14px;
            font-weight: 900;
          }

          .ltc-admin-booking-sub {
            margin: 4px 0 0;
            color: rgba(16,24,40,.55);
            font-size: 12px;
            font-weight: 800;
          }

          .ltc-admin-details {
            margin-top: 12px;
            display: grid;
            gap: 4px;
            color: rgba(16,24,40,.56);
            font-size: 12px;
            font-weight: 700;
          }

          .ltc-admin-details strong {
            color: rgba(16,24,40,.70);
            font-weight: 900;
          }

          .ltc-admin-summary-card {
            position: relative;
            overflow: hidden;
            border-radius: var(--radius);
            background: var(--glass);
            border: 1px solid rgba(255,255,255,.76);
            box-shadow: var(--shadow-md);
            backdrop-filter: blur(18px);
          }

          .ltc-admin-row,
          .ltc-admin-upcoming-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            width: 100%;
            padding: 10px 13px;
            text-align: left;
          }

          .ltc-admin-upcoming-card {
            border: 0;
            cursor: pointer;
            transition: .25s var(--ease);
            flex: 0 0 auto;
          }

          .ltc-admin-upcoming-card:hover {
            transform: translateY(-3px);
            background: rgba(244,212,132,.22);
          }

          .ltc-admin-row span:first-child,
          .ltc-admin-upcoming-title {
            color: rgba(16,24,40,.62);
            font-size: 12px;
            font-weight: 800;
          }

          .ltc-admin-row strong {
            color: var(--green-800);
            font-weight: 900;
          }

          .ltc-admin-upcoming-title {
            margin: 0;
            color: var(--green-800);
            font-weight: 900;
          }

          .ltc-admin-upcoming-meta {
            margin: 3px 0 0;
            color: rgba(16,24,40,.52);
            font-size: 10px;
            line-height: 1.35;
            font-weight: 700;
          }

          .ltc-admin-next-head + .ltc-admin-summary-list {
            overflow-y: auto;
            overflow-x: hidden;
            flex: 1;
            min-height: 0;
            padding-right: 6px;
            scrollbar-width: thin;
            scrollbar-color: rgba(35,95,62,.35) rgba(35,95,62,.08);
          }

          .ltc-admin-next-head + .ltc-admin-summary-list::-webkit-scrollbar {
            width: 6px;
          }

          .ltc-admin-next-head + .ltc-admin-summary-list::-webkit-scrollbar-track {
            border-radius: 999px;
            background: rgba(35,95,62,.08);
          }

          .ltc-admin-next-head + .ltc-admin-summary-list::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background: rgba(35,95,62,.35);
          }

          @keyframes ltcAppleReveal {
            from { opacity: 0; transform: translateY(34px) scale(.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @media (max-width: 1120px) {
            .ltc-admin-hero,
            .ltc-admin-calendar-grid {
              grid-template-columns: 1fr;
            }

            .ltc-admin-stats-grid,
            .ltc-admin-summary-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .ltc-admin-chart-table {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }

            .ltc-admin-chart-controls {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .ltc-admin-chart-mini-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 900px) {
            .ltc-admin-shortcut-grid {
              grid-template-columns: 1fr;
            }

            .ltc-admin-panel-head {
              flex-direction: column;
            }
          }

          @media (max-width: 680px) {
            .ltc-admin-dashboard {
              margin: -12px;
              padding: 14px;
              border-radius: 20px;
            }

            .ltc-admin-hero,
            .ltc-admin-panel,
            .ltc-admin-calendar-box,
            .ltc-admin-side-panel,
            .ltc-admin-stat-card,
            .ltc-admin-card,
            .ltc-admin-summary-card {
              border-radius: 20px;
            }

            .ltc-admin-stats-grid,
            .ltc-admin-summary-grid,
            .ltc-admin-hero-metrics,
            .ltc-admin-chart-table {
              grid-template-columns: 1fr;
            }

            .ltc-admin-chart-header {
              flex-direction: column;
            }

            .ltc-admin-chart-total {
              width: 100%;
              text-align: left;
            }

            .ltc-admin-chart-controls,
            .ltc-admin-chart-mini-grid {
              grid-template-columns: 1fr;
            }

            .ltc-admin-chart-result,
            .ltc-admin-chart-results-head {
              flex-direction: column;
              align-items: flex-start;
            }

            .ltc-admin-chart-result-pills {
              justify-content: flex-start;
            }

            .ltc-admin-calendar-days {
              gap: 6px;
            }

            .ltc-admin-day {
              min-height: 96px;
              padding: 8px;
            }

            .ltc-admin-weekday {
              font-size: 10px;
            }
          }
        `}</style>

        {statusMessage ? (
          <div className="ltc-admin-alert">
            {statusMessage}
          </div>
        ) : null}

        <div className="ltc-admin-stats-grid">
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

        <section className="ltc-admin-panel ltc-admin-chart-panel">
          <div className="ltc-admin-chart-header">
            <div>
              <p className="ltc-admin-panel-kicker">Booking Trend</p>
              <h2 className="ltc-admin-panel-title">January-December Booking Line Graph</h2>
              <p className="ltc-admin-muted">
                Tracks Resort, Hotel, and Event bookings using three separate lines with a fixed 0-100 Y-axis.
              </p>
            </div>

            <div className="ltc-admin-chart-total">
              <span>{chartYear} Total</span>
              <strong>{bookingTrendTotal}</strong>
            </div>
          </div>

          <div className="ltc-admin-chart-controls">
            <div className="ltc-admin-search-wrap">
              <span>Search</span>
              <input
                type="search"
                value={chartSearch}
                onChange={(event) => setChartSearch(event.target.value)}
                placeholder="Search guest, booking, room, venue, email, phone, date..."
                className="ltc-admin-chart-search"
              />
            </div>

            <div className="ltc-admin-chart-select-wrap">
              <span>Service</span>
              <select
                value={chartServiceFilter}
                onChange={(event) => setChartServiceFilter(event.target.value)}
                className="ltc-admin-chart-select"
              >
                {CHART_SERVICE_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ltc-admin-chart-select-wrap">
              <span>Status</span>
              <select
                value={chartStatusFilter}
                onChange={(event) => setChartStatusFilter(event.target.value)}
                className="ltc-admin-chart-select"
              >
                {CHART_STATUS_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ltc-admin-chart-select-wrap">
              <span>Year</span>
              <select
                value={chartYear}
                onChange={(event) => setChartYear(Number(event.target.value))}
                className="ltc-admin-chart-select"
              >
                {getYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="ltc-admin-chart-clear"
              onClick={() => {
                setChartSearch("");
                setChartServiceFilter("ALL");
                setChartStatusFilter("BOOKED");
                setChartYear(getCurrentYear());
              }}
            >
              Refresh
            </button>
          </div>

          <div className="ltc-admin-chart-mini-grid">
            <div className="ltc-admin-chart-mini-card resort">
              <span>Resort</span>
              <strong>{chartStats.resort}</strong>
            </div>
            <div className="ltc-admin-chart-mini-card hotel">
              <span>Hotel</span>
              <strong>{chartStats.hotel_room}</strong>
            </div>
            <div className="ltc-admin-chart-mini-card event">
              <span>Event</span>
              <strong>{chartStats.event}</strong>
            </div>
            <div className="ltc-admin-chart-mini-card pending">
              <span>Pending</span>
              <strong>{chartStats.pending}</strong>
            </div>
            <div className="ltc-admin-chart-mini-card confirmed">
              <span>Confirmed</span>
              <strong>{chartStats.confirmed}</strong>
            </div>
            <div className="ltc-admin-chart-mini-card cancelled">
              <span>Cancelled</span>
              <strong>{chartStats.cancelled}</strong>
            </div>
          </div>

          <BookingLineChart
            data={bookingTrendData}
            activeService={chartServiceFilter}
          />

          <div className="ltc-admin-chart-results">
            <div className="ltc-admin-chart-results-head">
              <div>
                <p className="ltc-admin-panel-kicker">Matching Records</p>
                <h3 className="ltc-admin-next-title">
                  {chartSearchResults.length ? "Filtered Bookings" : "No Matching Bookings"}
                </h3>
              </div>

              <span className="ltc-admin-pill-light">
                Showing {chartSearchResults.length} of {chartStats.total}
              </span>
            </div>

            <div className="ltc-admin-chart-result-list">
              {chartSearchResults.length === 0 ? (
                <div className="ltc-admin-empty">
                  <p className="ltc-admin-empty-title">No bookings match these filters</p>
                  <p className="ltc-admin-muted">
                    Try clearing the search, changing service, status, or selecting a different year.
                  </p>
                </div>
              ) : (
                chartSearchResults.map((booking) => (
                  <button
                    key={`chart-${booking.bookingType}-${booking._id}`}
                    type="button"
                    className="ltc-admin-chart-result"
                    onClick={() => {
                      setSelectedDate(booking.date);
                      const parsed = parseISODate(booking.date);
                      if (parsed) {
                        setMonthDate(
                          new Date(parsed.getFullYear(), parsed.getMonth(), 1)
                        );
                      }
                    }}
                  >
                    <div>
                      <p className="ltc-admin-upcoming-title">{booking.title}</p>
                      <p className="ltc-admin-upcoming-meta">
                        {booking.customerName} • {formatDate(booking.date)} • {booking.time || "No time"}
                      </p>
                      <p className="ltc-admin-upcoming-meta">
                        {booking.email || "No email"} • {booking.phone || "No phone"}
                      </p>
                    </div>

                    <div className="ltc-admin-chart-result-pills">
                      <span className={`ltc-admin-service-pill ${getServicePillClass(booking.bookingType)}`}>
                        {booking.serviceLabel}
                      </span>
                      <span className={`ltc-admin-status-pill ${String(booking.status || "").toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="ltc-admin-panel">
          <div className="ltc-admin-panel-head">
            <div>
              <p className="ltc-admin-panel-kicker">Booking Calendar</p>
              <h2 className="ltc-admin-panel-title">All Booked Dates</h2>
              <p className="ltc-admin-muted">
                Dates with pending or confirmed bookings are marked on the calendar.
              </p>
            </div>

            <div className="ltc-admin-filter-row">
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

          <div className="ltc-admin-calendar-grid">
            <div className="ltc-admin-calendar-box">
              <div className="ltc-admin-month-head">
                <div>
                  <h3 className="ltc-admin-month-title">{monthTitle}</h3>
                  <p className="ltc-admin-muted">
                    {counts.bookedDatesThisMonth} booked date
                    {counts.bookedDatesThisMonth === 1 ? "" : "s"} this month
                  </p>
                </div>

                <div className="ltc-admin-calendar-actions">
                  <button type="button" onClick={goPreviousMonth} className="ltc-admin-calendar-action">
                    Prev
                  </button>
                  <button type="button" onClick={goToday} className="ltc-admin-calendar-action">
                    Today
                  </button>
                  <button type="button" onClick={goNextMonth} className="ltc-admin-calendar-action">
                    Next
                  </button>
                </div>
              </div>

              <div className="ltc-admin-calendar-days">
                {WEEK_DAYS.map((day) => (
                  <div key={day} className="ltc-admin-weekday">
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
                      className={`ltc-admin-day ${isSelected ? "selected" : ""} ${!day.isCurrentMonth ? "muted" : ""}`}
                    >
                      <div className="ltc-admin-day-top">
                        <span className={`ltc-admin-day-number ${isToday ? "today" : ""}`}>
                          {day.day}
                        </span>

                        {dayBookings.length ? (
                          <span className="ltc-admin-count-badge">{dayBookings.length}</span>
                        ) : null}
                      </div>

                      <div className="ltc-admin-day-items">
                        {dayBookings.slice(0, 3).map((booking) => (
                          <div
                            key={`${booking.bookingType}-${booking._id}`}
                            className="ltc-admin-day-chip"
                            title={`${booking.serviceLabel} - ${booking.customerName}`}
                          >
                            <span className={`ltc-status-dot ${getStatusDotClass(booking.status)}`} />
                            {getServiceShortLabel(booking.bookingType)}
                          </div>
                        ))}

                        {dayBookings.length > 3 ? (
                          <p className="ltc-admin-more">+{dayBookings.length - 3} more</p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="ltc-admin-side-panel">
              <div className="ltc-admin-side-head">
                <div>
                  <p className="ltc-admin-panel-kicker">Selected Date</p>
                  <h3 className="ltc-admin-side-title">{formatDate(selectedDate)}</h3>
                </div>

                <span className="ltc-admin-pill-light">
                  {selectedDateBookings.length} booking
                  {selectedDateBookings.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="ltc-admin-side-list">
                {selectedDateBookings.length === 0 ? (
                  <div className="ltc-admin-empty">
                    <p className="ltc-admin-empty-title">No bookings on this date</p>
                    <p className="ltc-admin-muted">
                      Choose another highlighted date from the calendar.
                    </p>
                  </div>
                ) : (
                  selectedDateBookings.map((booking) => (
                    <div
                      key={`${booking.bookingType}-${booking._id}`}
                      className="ltc-admin-booking-card"
                    >
                      <div className="ltc-admin-booking-pills">
                        <span className="ltc-admin-service-pill">
                          {booking.serviceLabel}
                        </span>

                        <span className={`ltc-admin-status-pill ${String(booking.status || "").toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </div>

                      <h4 className="ltc-admin-booking-title">{booking.title}</h4>

                      <p className="ltc-admin-booking-sub">
                        {booking.category || booking.location || "—"}
                      </p>

                      <div className="ltc-admin-details">
                        <p><strong>Guest:</strong> {booking.customerName}</p>
                        <p><strong>Time:</strong> {booking.time || "—"}</p>
                        <p><strong>Pax:</strong> {booking.pax || "—"}</p>
                        <p><strong>Total:</strong> {formatPeso(booking.totalAmount)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        </section>

        <section className="ltc-admin-summary-grid">
          <div className="ltc-admin-summary-card">
            <p className="ltc-admin-card-kicker">Booking Summary</p>

            <div className="ltc-admin-summary-list">
              <div className="ltc-admin-row">
                <span>Resort & Venue</span>
                <strong>{counts.resort}</strong>
              </div>

              <div className="ltc-admin-row">
                <span>Event Package</span>
                <strong>{counts.event}</strong>
              </div>

              <div className="ltc-admin-row">
                <span>Hotel & Condo</span>
                <strong>{counts.hotel_room}</strong>
              </div>
            </div>
          </div>

          <div className="ltc-admin-summary-card">
            <p className="ltc-admin-card-kicker">Status Overview</p>

            <div className="ltc-admin-summary-list">
              <div className="ltc-admin-row">
                <span>Pending</span>
                <strong>{counts.pending}</strong>
              </div>

              <div className="ltc-admin-row">
                <span>Confirmed</span>
                <strong>{counts.confirmed}</strong>
              </div>

              <div className="ltc-admin-row">
                <span>Cancelled</span>
                <strong>{counts.cancelled}</strong>
              </div>
            </div>
          </div>

          <div className="ltc-admin-summary-card">
            <div className="ltc-admin-next-head">
              <div>
                <p className="ltc-admin-card-kicker">Upcoming</p>
                <h3 className="ltc-admin-next-title">Next Bookings</h3>
              </div>

              <span className="ltc-admin-pill-light">{counts.upcoming}</span>
            </div>

            <div className="ltc-admin-summary-list">
              {upcomingBookings.length === 0 ? (
                <p className="ltc-admin-empty">
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
                    className="ltc-admin-upcoming-card"
                  >
                    <div>
                      <p className="ltc-admin-upcoming-title">{booking.title}</p>

                      <p className="ltc-admin-upcoming-meta">
                        {formatDate(booking.date)} • {booking.time || "No time"}
                      </p>

                      <p className="ltc-admin-upcoming-meta">
                        {booking.customerName}
                      </p>
                    </div>

                    <span className={`ltc-service-dot ${getServiceDotClass(booking.bookingType)}`} />
                  </button>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </HotelAdminShell>
  );
}

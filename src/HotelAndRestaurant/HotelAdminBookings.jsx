// HotelAndRestaurant/HotelAdminBookings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelAdminShell from "./HotelAdminShell";

const GREEN_DARK = "#2A4F33";
const SIDEBAR_BG = "#3A5F3C";
const CARD_BG = "#EDEADF";

const SERVICE_FILTERS = [
  { id: "ALL", label: "All Services" },
  { id: "resort", label: "Resort & Venue" },
  { id: "event", label: "Event Package" },
  { id: "hotel_room", label: "Hotel & Condo" },
];

const STATUS_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "CANCELLED", label: "Cancelled" },
];

function getApiBase() {
  const raw = (
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel`;
  if (raw.includes("/api/hotel")) return raw;

  return `${raw}/api/hotel`;
}

function getAdminToken() {
  return (
    localStorage.getItem("adminToken") ||
    localStorage.getItem("hotelAdminToken") ||
    ""
  );
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

function formatDateMMDDYYYY(value) {
  if (!value) return "—";

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [year, month, day] = text.split("-");
    return `${month}/${day}/${year}`;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;

  return parsed.toLocaleDateString("en-PH", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function normalizeStatus(value) {
  const status = String(value || "PENDING").toUpperCase();

  if (status === "APPROVED") return "CONFIRMED";
  if (status === "CANCELED" || status === "REJECTED" || status === "DECLINED") {
    return "CANCELLED";
  }

  if (["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) return status;

  return "PENDING";
}

function getServiceLabel(type) {
  if (type === "resort") return "Resort & Venue";
  if (type === "event") return "Event Package";
  if (type === "hotel_room") return "Hotel & Condo";
  return "Booking";
}

function getServiceBadgeClass(type) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold";

  if (type === "resort") {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
  }

  if (type === "event") {
    return `${base} border-violet-200 bg-violet-50 text-violet-700`;
  }

  if (type === "hotel_room") {
    return `${base} border-sky-200 bg-sky-50 text-sky-700`;
  }

  return `${base} border-slate-200 bg-slate-50 text-slate-700`;
}

function getStatusChipClass(status) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold";

  if (status === "PENDING") {
    return `${base} border-amber-200 bg-amber-50 text-amber-700`;
  }

  if (status === "CONFIRMED") {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
  }

  if (status === "CANCELLED") {
    return `${base} border-rose-200 bg-rose-50 text-rose-700`;
  }

  return `${base} border-slate-200 bg-slate-50 text-slate-700`;
}

function getStatusBoxClass(type) {
  if (type === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (type === "error") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (type === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function normalizeResortBooking(booking = {}) {
  return {
    _id: String(booking._id || ""),
    bookingType: "resort",
    serviceLabel: "Resort & Venue",
    title: booking.venue || booking.packageName || "Resort & Venue Booking",
    customerName: `${booking.firstName || ""} ${booking.lastName || ""}`.trim(),
    firstName: booking.firstName || "",
    lastName: booking.lastName || "",
    email: booking.email || "",
    phone: booking.phone || "",
    date: booking.date || "",
    time: booking.time || "",
    category: booking.category || "",
    location: booking.venue || "",
    pax:
      Number(
        booking.pax ||
          booking.totalGuests ||
          Number(booking.adults || 0) + Number(booking.kids || 0)
      ) || 0,
    paymentMethod: booking.paymentMethod || "",
    totalAmount: Number(booking.price || booking.totalAmount || 0),
    status: normalizeStatus(booking.status),
    createdAt: booking.createdAt || "",
    raw: booking,
  };
}

function normalizeEventBooking(booking = {}) {
  return {
    _id: String(booking._id || ""),
    bookingType: "event",
    serviceLabel: "Event Package",
    title:
      booking.eventPackage ||
      booking.packageName ||
      booking.eventType ||
      "Event Package Booking",
    customerName: `${booking.firstName || ""} ${booking.lastName || ""}`.trim(),
    firstName: booking.firstName || "",
    lastName: booking.lastName || "",
    email: booking.email || "",
    phone: booking.phone || "",
    date: booking.eventDate || booking.date || "",
    time: booking.time || "",
    category: booking.eventType || "Event Package",
    location: booking.venue || "",
    pax: Number(booking.pax || booking.guests || 0),
    paymentMethod: booking.paymentMethod || "",
    totalAmount: Number(booking.totalAmount || booking.price || 0),
    status: normalizeStatus(booking.status),
    createdAt: booking.createdAt || "",
    raw: booking,
  };
}

function normalizeHotelRoomBooking(booking = {}) {
  const roomType = booking.roomType || "Hotel Room";
  const duration = booking.duration || "";

  return {
    _id: String(booking._id || ""),
    bookingType: "hotel_room",
    serviceLabel: "Hotel & Condo",
    title: `${roomType}${duration ? ` - ${duration}` : ""}`,
    customerName: `${booking.firstName || ""} ${booking.lastName || ""}`.trim(),
    firstName: booking.firstName || "",
    lastName: booking.lastName || "",
    email: booking.email || "",
    phone: booking.phone || "",
    date: booking.date || "",
    time: booking.time || "",
    category: duration || "Hotel Room",
    location: roomType,
    pax: Number(booking.pax || booking.guests || 0),
    paymentMethod: booking.paymentMethod || "",
    totalAmount: Number(booking.price || booking.totalAmount || 0),
    status: normalizeStatus(booking.status),
    createdAt: booking.createdAt || "",
    raw: booking,
  };
}

function getProofEndpoint(API_BASE, booking) {
  if (booking.bookingType === "resort") {
    return `${API_BASE}/admin/resort-bookings/${booking._id}/proof`;
  }

  if (booking.bookingType === "event") {
    return `${API_BASE}/admin/event-bookings/${booking._id}/proof`;
  }

  return `${API_BASE}/admin/hotel-room-bookings/${booking._id}/proof`;
}

function getStatusEndpoint(API_BASE, booking) {
  if (booking.bookingType === "resort") {
    return `${API_BASE}/admin/resort-bookings/${booking._id}/status`;
  }

  if (booking.bookingType === "event") {
    return `${API_BASE}/admin/event-bookings/${booking._id}/status`;
  }

  return `${API_BASE}/admin/hotel-room-bookings/${booking._id}/status`;
}


function getRescheduleEndpoint(API_BASE, booking) {
  if (booking.bookingType === "resort") {
    return `${API_BASE}/admin/resort-bookings/${booking._id}/reschedule`;
  }

  if (booking.bookingType === "event") {
    return `${API_BASE}/admin/event-bookings/${booking._id}/reschedule`;
  }

  return `${API_BASE}/admin/hotel-room-bookings/${booking._id}/reschedule`;
}

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function addDaysISO(dateString, days) {
  const [year, month, day] = String(dateString || todayISO()).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + Number(days || 0)));
  return date.toISOString().slice(0, 10);
}

function getRescheduleOptionsEndpoint(API_BASE, booking) {
  const from = todayISO();
  const to = addDaysISO(from, 365);
  const query = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

  if (booking.bookingType === "resort") {
    return `${API_BASE}/admin/resort-bookings/${booking._id}/reschedule-options?${query}`;
  }

  if (booking.bookingType === "event") {
    return `${API_BASE}/admin/event-bookings/${booking._id}/reschedule-options?${query}`;
  }

  return `${API_BASE}/admin/hotel-room-bookings/${booking._id}/reschedule-options?${query}`;
}

function getFallbackRescheduleTimes(booking) {
  const raw = booking?.raw || {};
  const candidates = [
    ...(Array.isArray(raw.selectedTimeSlots) ? raw.selectedTimeSlots : []),
    ...(Array.isArray(raw.timeSlots) ? raw.timeSlots : []),
    ...(Array.isArray(raw.availableTimeSlots) ? raw.availableTimeSlots : []),
    booking?.time,
  ];

  return [...new Set(candidates.map((item) => String(item || "").trim()).filter(Boolean))];
}

function getRescheduleTimeOptions(booking, options, date) {
  const selectedDate = String(date || "").trim();

  if (selectedDate && options?.availableTimeSlotsByDate?.[selectedDate]) {
    return options.availableTimeSlotsByDate[selectedDate] || [];
  }

  if (Array.isArray(options?.timeSlots) && options.timeSlots.length) {
    return options.timeSlots;
  }

  return getFallbackRescheduleTimes(booking);
}

function getBlockedTimeOptions(options, date) {
  return options?.blockedTimeSlotsByDate?.[date] || [];
}

function isRescheduleDateFullyBooked(options, date) {
  return Boolean(
    date && Array.isArray(options?.fullBookedDates) && options.fullBookedDates.includes(date)
  );
}

function getBlockedDatesForCalendar(options) {
  /*
    Only FULLY booked dates should be disabled in the calendar.

    Previous behavior also added every date from blockedTimeSlotsByDate,
    so a date with only one unavailable time became grey and unclickable.
    That made it look like too many dates were blocked.

    Now:
    - fullBookedDates/bookedDates = disabled grey date
    - partiallyBlockedDates/blockedTimeSlotsByDate = date is still clickable,
      but unavailable times are removed from the time dropdown
  */
  const blocked = new Set();

  if (Array.isArray(options?.fullBookedDates)) {
    options.fullBookedDates.forEach((date) => blocked.add(String(date || "")));
  }

  if (Array.isArray(options?.bookedDates)) {
    options.bookedDates.forEach((date) => blocked.add(String(date || "")));
  }

  blocked.delete("");
  return [...blocked];
}

function getRescheduleDateDisabledReason(options, date) {
  const iso = String(date || "").trim();
  if (!iso) return "Invalid date";

  if (iso < todayISO()) return "Past date";

  if (isRescheduleDateFullyBooked(options, iso)) {
    return "Fully booked";
  }

  if (Array.isArray(options?.bookedDates) && options.bookedDates.includes(iso)) {
    return "Fully booked";
  }

  return "";
}

function formatBlockedDatePreview(dates = []) {
  const list = Array.isArray(dates) ? dates.slice(0, 8) : [];
  if (!list.length) return "No blocked dates in the loaded range.";
  const suffix = dates.length > list.length ? ` +${dates.length - list.length} more` : "";
  return `${list.map(formatDateMMDDYYYY).join(", ")}${suffix}`;
}

function makeLocalDateFromISO(value = "") {
  const fallback = todayISO();
  const source = /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))
    ? String(value)
    : fallback;
  const [year, month, day] = source.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCalendarMonth(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function buildCalendarDays(monthDate) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const item = new Date(gridStart);
    item.setDate(gridStart.getDate() + index);

    return {
      date: item,
      iso: dateToISO(item),
      day: item.getDate(),
      isCurrentMonth: item.getMonth() === monthDate.getMonth(),
    };
  });
}

function normalizeMonthDate(value) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function normalizeUpdatedBooking(bookingType, booking) {
  if (bookingType === "resort") return normalizeResortBooking(booking);
  if (bookingType === "event") return normalizeEventBooking(booking);
  return normalizeHotelRoomBooking(booking);
}

export default function HotelAdminBookings() {
  const navigate = useNavigate();
  const API_BASE = useMemo(() => getApiBase(), []);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [bookings, setBookings] = useState([]);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Recent");

  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const [rescheduleSaving, setRescheduleSaving] = useState(false);
  const [rescheduleOptions, setRescheduleOptions] = useState(null);
  const [rescheduleOptionsLoading, setRescheduleOptionsLoading] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    normalizeMonthDate(makeLocalDateFromISO(todayISO()))
  );

  const pageSize = 10;
  const [page, setPage] = useState(1);

  const adminHeaders = () => {
    const token = getAdminToken();

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const kickToAdminLogin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("hotelAdminToken");
    navigate("/hotel-admin-login", { replace: true });
  };

  useEffect(() => {
    if (!getAdminToken()) kickToAdminLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJson = async (url) => {
    const response = await fetch(url, {
      method: "GET",
      headers: adminHeaders(),
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      return {
        kicked: true,
        ok: false,
        data: [],
        message: data.message || "Unauthorized.",
      };
    }

    return {
      kicked: false,
      ok: response.ok,
      data,
      message: data.message || "",
    };
  };

  const loadRescheduleOptions = async (booking, dateValue = "") => {
    if (!booking?._id) return null;

    setRescheduleOptionsLoading(true);

    try {
      const response = await fetch(
        getRescheduleOptionsEndpoint(API_BASE, booking),
        {
          method: "GET",
          headers: adminHeaders(),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        kickToAdminLogin();
        return null;
      }

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to load blocked dates for rescheduling.",
        });
        setRescheduleOptions(null);
        return null;
      }

      setRescheduleOptions(data);
      return data;
    } catch (error) {
      console.error("loadRescheduleOptions error:", error);
      setStatus({
        type: "error",
        message: "Network error while loading blocked dates for rescheduling.",
      });
      setRescheduleOptions(null);
      return null;
    } finally {
      setRescheduleOptionsLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!getAdminToken()) {
      kickToAdminLogin();
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const [resortResult, eventResult, hotelResult] = await Promise.all([
        fetchJson(`${API_BASE}/admin/resort-bookings`),
        fetchJson(`${API_BASE}/admin/event-bookings`),
        fetchJson(`${API_BASE}/admin/hotel-room-bookings`),
      ]);

      if (resortResult.kicked || eventResult.kicked || hotelResult.kicked) {
        kickToAdminLogin();
        return;
      }

      const resortRows = Array.isArray(resortResult.data)
        ? resortResult.data
        : Array.isArray(resortResult.data.bookings)
        ? resortResult.data.bookings
        : [];

      const eventRows = Array.isArray(eventResult.data)
        ? eventResult.data
        : Array.isArray(eventResult.data.bookings)
        ? eventResult.data.bookings
        : [];

      const hotelRows = Array.isArray(hotelResult.data)
        ? hotelResult.data
        : Array.isArray(hotelResult.data.bookings)
        ? hotelResult.data.bookings
        : [];

      const merged = [
        ...resortRows.map(normalizeResortBooking),
        ...eventRows.map(normalizeEventBooking),
        ...hotelRows.map(normalizeHotelRoomBooking),
      ]
        .filter((booking) => booking._id)
        .sort((a, b) => {
          const bTime = new Date(b.createdAt || b.date || 0).getTime();
          const aTime = new Date(a.createdAt || a.date || 0).getTime();
          return bTime - aTime;
        });

      setBookings(merged);

      if (!resortResult.ok || !eventResult.ok || !hotelResult.ok) {
        setStatus({
          type: "warning",
          message:
            "Some booking types could not be loaded. Please check the backend server and refresh.",
        });
      }
    } catch (error) {
      console.error("fetchBookings error:", error);
      setBookings([]);
      setStatus({
        type: "error",
        message: "Network error while loading bookings.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const result = {
      total: bookings.length,
      PENDING: 0,
      CONFIRMED: 0,
      CANCELLED: 0,
      resort: 0,
      event: 0,
      hotel_room: 0,
    };

    bookings.forEach((booking) => {
      const bookingStatus = normalizeStatus(booking.status);

      if (result[bookingStatus] !== undefined) {
        result[bookingStatus] += 1;
      }

      if (result[booking.bookingType] !== undefined) {
        result[booking.bookingType] += 1;
      }
    });

    return result;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();

    let rows = bookings.slice();

    if (statusFilter !== "ALL") {
      rows = rows.filter((booking) => booking.status === statusFilter);
    }

    if (serviceFilter !== "ALL") {
      rows = rows.filter((booking) => booking.bookingType === serviceFilter);
    }

    if (q) {
      rows = rows.filter((booking) => {
        const haystack = [
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
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(q);
      });
    }

    rows.sort((a, b) => {
      if (sortBy === "Oldest") {
        return new Date(a.createdAt || a.date || 0) - new Date(b.createdAt || b.date || 0);
      }

      if (sortBy === "PriceHigh") {
        return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
      }

      if (sortBy === "PriceLow") {
        return Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
      }

      return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
    });

    return rows;
  }, [bookings, statusFilter, serviceFilter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const pageSafe = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, pageSafe]);

  const showActionsColumn = useMemo(() => {
    return pageRows.some((booking) =>
      ["PENDING", "CONFIRMED"].includes(normalizeStatus(booking.status))
    );
  }, [pageRows]);

  const tableColSpan = showActionsColumn ? 10 : 9;

  useEffect(() => {
    setPage(1);
  }, [statusFilter, serviceFilter, search, sortBy]);

  const openProof = async (booking) => {
    if (!booking?._id) return;

    setStatus({ type: "", message: "" });

    try {
      const token = getAdminToken();

      if (!token) {
        kickToAdminLogin();
        return;
      }

      const response = await fetch(getProofEndpoint(API_BASE, booking), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        kickToAdminLogin();
        return;
      }

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        setStatus({
          type: "error",
          message: text || "Failed to load proof of payment.",
        });
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60_000);
    } catch (error) {
      console.error("openProof error:", error);
      setStatus({
        type: "error",
        message: "Network error while opening proof of payment.",
      });
    }
  };

  const updateStatus = async (booking, nextStatus) => {
    if (!booking?._id) return;

    setBusyId(`${booking.bookingType}:${booking._id}`);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(getStatusEndpoint(API_BASE, booking), {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        kickToAdminLogin();
        return;
      }

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to update booking status.",
        });
        return;
      }

      setBookings((prev) =>
        prev.map((item) =>
          item.bookingType === booking.bookingType && item._id === booking._id
            ? { ...item, status: nextStatus }
            : item
        )
      );

      setStatus({
        type: "success",
        message: `${getServiceLabel(booking.bookingType)} booking updated successfully.`,
      });
    } catch (error) {
      console.error("updateStatus error:", error);
      setStatus({
        type: "error",
        message: "Network error while updating booking status.",
      });
    } finally {
      setBusyId("");
    }
  };

  const confirmApprove = (booking) => {
    updateStatus(booking, "CONFIRMED");
  };

  const confirmCancel = (booking) => {
    const isPending = booking?.status === "PENDING";
    const isConfirmed = booking?.status === "CONFIRMED";

    const message = isPending
      ? "Reject this pending booking? The slot will open again."
      : isConfirmed
      ? "Cancel this approved booking? The slot will open again."
      : "Cancel this booking?";

    const ok = window.confirm(message);
    if (!ok) return;

    updateStatus(booking, "CANCELLED");
  };

  const openRescheduleModal = (booking) => {
    if (!booking || booking.status !== "CONFIRMED") {
      setStatus({
        type: "error",
        message: "Only approved bookings can be rescheduled.",
      });
      return;
    }

    const initialDate = booking.date || todayISO();

    setRescheduleBooking(booking);
    setRescheduleOptions(null);
    setCalendarMonth(normalizeMonthDate(makeLocalDateFromISO(initialDate)));
    setRescheduleForm({
      date: initialDate,
      time: booking.time || "",
    });
    setStatus({ type: "", message: "" });
    loadRescheduleOptions(booking, initialDate);
  };

  const closeRescheduleModal = () => {
    if (rescheduleSaving) return;
    setRescheduleBooking(null);
    setRescheduleForm({ date: "", time: "" });
    setRescheduleOptions(null);
  };

  const submitReschedule = async (event) => {
    event.preventDefault();

    if (!rescheduleBooking?._id) return;

    const date = String(rescheduleForm.date || "").trim();
    const time = String(rescheduleForm.time || "").trim();

    if (!date || !time) {
      setStatus({
        type: "error",
        message: "Please provide the new date and time.",
      });
      return;
    }

    const dateDisabledReason = getRescheduleDateDisabledReason(rescheduleOptions, date);
    const availableSlots = getRescheduleTimeOptions(rescheduleBooking, rescheduleOptions, date);

    if (dateDisabledReason) {
      setStatus({
        type: "error",
        message: `This date is blocked (${dateDisabledReason}). Please choose another date.`,
      });
      return;
    }

    if (!availableSlots.length) {
      setStatus({
        type: "error",
        message: "This date has no available time slots. Please choose another date.",
      });
      return;
    }

    if (!availableSlots.includes(time)) {
      setStatus({
        type: "error",
        message: "This time is already blocked or not allowed for this booking. Please choose an available time.",
      });
      return;
    }

    const busyKey = `${rescheduleBooking.bookingType}:${rescheduleBooking._id}`;
    setBusyId(busyKey);
    setRescheduleSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(getRescheduleEndpoint(API_BASE, rescheduleBooking), {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify({ date, time }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        kickToAdminLogin();
        return;
      }

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to reschedule booking.",
        });
        return;
      }

      const updated = data.booking
        ? normalizeUpdatedBooking(rescheduleBooking.bookingType, data.booking)
        : {
            ...rescheduleBooking,
            date,
            time,
          };

      setBookings((prev) =>
        prev.map((item) =>
          item.bookingType === rescheduleBooking.bookingType &&
          item._id === rescheduleBooking._id
            ? updated
            : item
        )
      );

      setStatus({
        type: "success",
        message: `${getServiceLabel(rescheduleBooking.bookingType)} booking rescheduled successfully.`,
      });

      closeRescheduleModal();
    } catch (error) {
      console.error("submitReschedule error:", error);
      setStatus({
        type: "error",
        message: "Network error while rescheduling booking.",
      });
    } finally {
      setBusyId("");
      setRescheduleSaving(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("hotelAdminToken");
    navigate("/hotel-admin-login", { replace: true });
  };

  return (
    <HotelAdminShell
      title="Manage Bookings"
      subtitle="View and manage resort, event package, and hotel room bookings in one unified table."
      activePage="bookings"
      maxWidth="max-w-7xl"
      actions={
        <button
          type="button"
          onClick={fetchBookings}
          disabled={loading}
          className="h-10 rounded-2xl bg-[#2A4F33] px-5 text-xs font-extrabold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "REFRESHING..." : "REFRESH"}
        </button>
      }
    >
          {status.message ? (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${getStatusBoxClass(
                status.type
              )}`}
            >
              {status.message}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard label="All Bookings" value={counts.total} />
            <StatCard label="Pending" value={counts.PENDING} />
            <StatCard label="Confirmed" value={counts.CONFIRMED} />
            <StatCard label="Cancelled" value={counts.CANCELLED} />
          </div>

          <div
            className="mt-6 rounded-2xl border border-black/5 p-5 shadow-sm md:p-6"
            style={{ backgroundColor: CARD_BG }}
          >
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/50">
                Filter by booking status
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {STATUS_FILTERS.map((item) => (
                  <FilterButton
                    key={item.id}
                    label={
                      item.id === "ALL"
                        ? `${item.label} (${bookings.length})`
                        : `${item.label} (${counts[item.id] || 0})`
                    }
                    active={statusFilter === item.id}
                    onClick={() => setStatusFilter(item.id)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/50">
                Filter by service
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {SERVICE_FILTERS.map((item) => {
                  const count =
                    item.id === "ALL" ? bookings.length : counts[item.id] || 0;

                  return (
                    <FilterButton
                      key={item.id}
                      label={`${item.label} (${count})`}
                      active={serviceFilter === item.id}
                      onClick={() => setServiceFilter(item.id)}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-bold text-black/60">
                  Search
                </label>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customer, email, service, package, date, time, payment..."
                  className="h-10 w-full rounded-full border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2A4F33]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-black/60">
                  Sort
                </label>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-10 w-full rounded-full border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2A4F33]/20"
                >
                  <option value="Recent">Recent</option>
                  <option value="Oldest">Oldest</option>
                  <option value="PriceHigh">Price High to Low</option>
                  <option value="PriceLow">Price Low to High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 shadow-sm">
            <div className="overflow-x-auto bg-white">
              <table className={`w-full text-sm ${showActionsColumn ? "min-w-[1180px]" : "min-w-[1060px]"}`}>
                <thead>
                  <tr className="bg-black/5 text-left">
                    <Th>Service</Th>
                    <Th>Customer</Th>
                    <Th>Booking</Th>
                    <Th>Date</Th>
                    <Th>Time</Th>
                    <Th>Pax</Th>
                    <Th>Payment</Th>
                    <Th>Total</Th>
                    <Th>Status</Th>
                    {showActionsColumn ? <Th className="text-right">Actions</Th> : null}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={tableColSpan} className="p-8 text-center text-black/50">
                        Loading bookings...
                      </td>
                    </tr>
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={tableColSpan} className="p-8 text-center text-black/50">
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((booking) => {
                      const busyKey = `${booking.bookingType}:${booking._id}`;
                      const isBusy = busyId === busyKey;
                      const isPending = booking.status === "PENDING";
                      const isConfirmed = booking.status === "CONFIRMED";
                      const isCancelled = booking.status === "CANCELLED";

                      return (
                        <tr
                          key={busyKey}
                          className="border-t border-black/10 align-top"
                        >
                          <td className="p-4">
                            <span className={getServiceBadgeClass(booking.bookingType)}>
                              {booking.serviceLabel}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-black/80">
                              {booking.customerName || "No name"}
                            </div>
                            <div className="mt-1 text-xs text-black/50">
                              {booking.email || "No email"}
                            </div>
                            <div className="text-xs text-black/50">
                              {booking.phone || "No phone"}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-extrabold text-black/75">
                              {booking.title}
                            </div>
                            <div className="mt-1 text-xs text-black/50">
                              {booking.location || "—"}
                            </div>
                            <div className="text-xs text-black/50">
                              {booking.category || "—"}
                            </div>
                          </td>

                          <td className="p-4 font-semibold text-black/70">
                            {formatDateMMDDYYYY(booking.date)}
                          </td>

                          <td className="p-4 text-black/70">
                            {booking.time || "—"}
                          </td>

                          <td className="p-4">
                            <span className="font-extrabold text-black/75">
                              {booking.pax || 0}
                            </span>{" "}
                            pax
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-black/70">
                              {booking.paymentMethod || "—"}
                            </div>

                            <button
                              type="button"
                              onClick={() => openProof(booking)}
                              className="mt-2 h-8 rounded-full border border-black/10 bg-white px-3 text-xs font-extrabold hover:bg-black/5"
                            >
                              View Proof
                            </button>
                          </td>

                          <td
                            className="p-4 font-extrabold"
                            style={{ color: GREEN_DARK }}
                          >
                            {formatPeso(booking.totalAmount)}
                          </td>

                          <td className="p-4">
                            <span className={getStatusChipClass(booking.status)}>
                              {booking.status}
                            </span>
                          </td>

                          {showActionsColumn ? (
                            <td className="p-4">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                {isPending ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => confirmApprove(booking)}
                                      disabled={isBusy}
                                      className="h-9 rounded-full px-4 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
                                      style={{ backgroundColor: GREEN_DARK }}
                                    >
                                      {isBusy ? "..." : "Approve"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => confirmCancel(booking)}
                                      disabled={isBusy}
                                      className="h-9 rounded-full border border-rose-200 bg-rose-50 px-4 text-xs font-extrabold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                                    >
                                      {isBusy ? "..." : "Reject"}
                                    </button>
                                  </>
                                ) : null}

                                {isConfirmed ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openRescheduleModal(booking)}
                                      disabled={isBusy}
                                      className="h-9 rounded-full border border-[#2A4F33]/20 bg-[#2A4F33]/10 px-4 text-xs font-extrabold text-[#2A4F33] hover:bg-[#2A4F33]/15 disabled:opacity-50"
                                    >
                                      Resched
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => confirmCancel(booking)}
                                      disabled={isBusy}
                                      className="h-9 rounded-full border border-rose-200 bg-rose-50 px-4 text-xs font-extrabold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                                    >
                                      {isBusy ? "..." : "Cancel"}
                                    </button>
                                  </>
                                ) : null}
                              </div>
                            </td>
                          ) : null}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-black/10 bg-white px-4 py-3">
              <p className="text-xs text-black/50">
                Showing{" "}
                <span className="font-bold text-black/70">
                  {filteredBookings.length === 0 ? 0 : (pageSafe - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-black/70">
                  {Math.min(pageSafe * pageSize, filteredBookings.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-black/70">
                  {filteredBookings.length}
                </span>{" "}
                bookings
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pageSafe <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="h-9 rounded-full border border-black/10 bg-white px-4 text-xs font-extrabold hover:bg-black/5 disabled:opacity-50"
                >
                  Prev
                </button>

                <div className="text-xs font-bold text-black/60">
                  Page <span className="text-black/80">{pageSafe}</span> /{" "}
                  {totalPages}
                </div>

                <button
                  type="button"
                  disabled={pageSafe >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="h-9 rounded-full border border-black/10 bg-white px-4 text-xs font-extrabold hover:bg-black/5 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-black/50">
            Tip: This table now combines Resort & Venue, Event Package, and Hotel
            & Condo bookings. Click <b>View Proof</b> to open the uploaded payment
            proof.
          </p>

          {rescheduleBooking ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
              <form
                onSubmit={submitReschedule}
                className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/45">
                      Reschedule Approved Booking
                    </p>
                    <h3 className="mt-1 text-xl font-black text-[#2A4F33]">
                      {rescheduleBooking.title}
                    </h3>
                    <p className="mt-1 text-sm text-black/55">
                      {rescheduleBooking.customerName || "No customer name"} • {rescheduleBooking.serviceLabel}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeRescheduleModal}
                    disabled={rescheduleSaving}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs font-extrabold text-black/55 hover:bg-black/5 disabled:opacity-50"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-5 rounded-2xl bg-black/[0.03] p-4 text-sm text-black/65">
                  <p>
                    Current: <b>{formatDateMMDDYYYY(rescheduleBooking.date)}</b> •{" "}
                    <b>{rescheduleBooking.time || "No time"}</b>
                  </p>
                  <p className="mt-1 text-xs text-black/45">
                    Rescheduling is available only for approved bookings. The backend will still check conflicts and the 1-hour interval rule.
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-black/50">
                      New Date
                    </span>

                    <RescheduleCalendar
                      value={rescheduleForm.date}
                      month={calendarMonth}
                      options={rescheduleOptions}
                      loading={rescheduleOptionsLoading}
                      onMonthChange={setCalendarMonth}
                      onSelect={(nextDate) => {
                        setRescheduleForm((prev) => ({
                          ...prev,
                          date: nextDate,
                          time: "",
                        }));
                      }}
                    />

                    {getRescheduleDateDisabledReason(rescheduleOptions, rescheduleForm.date) ? (
                      <p className="mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                        Selected date is blocked: {getRescheduleDateDisabledReason(rescheduleOptions, rescheduleForm.date)}.
                      </p>
                    ) : null}
                  </div>

                  <label className="block">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-black/50">
                      New Time
                    </span>
                    <select
                      value={rescheduleForm.time}
                      onChange={(e) =>
                        setRescheduleForm((prev) => ({ ...prev, time: e.target.value }))
                      }
                      disabled={
                        rescheduleOptionsLoading ||
                        Boolean(getRescheduleDateDisabledReason(rescheduleOptions, rescheduleForm.date))
                      }
                      className="mt-2 h-11 w-full rounded-2xl border border-black/10 px-4 text-sm font-semibold outline-none focus:border-[#2A4F33] disabled:bg-black/5 disabled:text-black/35"
                      required
                    >
                      <option value="">
                        {rescheduleOptionsLoading
                          ? "Loading available times..."
                          : getRescheduleDateDisabledReason(rescheduleOptions, rescheduleForm.date)
                          ? "Date is blocked"
                          : "Select available time"}
                      </option>
                      {getRescheduleTimeOptions(
                        rescheduleBooking,
                        rescheduleOptions,
                        rescheduleForm.date
                      ).map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>

                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                      <p className="font-black uppercase tracking-wide">Blocked dates</p>
                      <p className="mt-1">
                        {formatBlockedDatePreview(getBlockedDatesForCalendar(rescheduleOptions))}
                      </p>

                      {getBlockedTimeOptions(rescheduleOptions, rescheduleForm.date).length ? (
                        <p className="mt-2">
                          Blocked times for selected date:{" "}
                          <b>{getBlockedTimeOptions(rescheduleOptions, rescheduleForm.date).join(", ")}</b>
                        </p>
                      ) : (
                        <p className="mt-2">No blocked times for the selected date.</p>
                      )}

                      <p className="mt-2 text-amber-700/80">
                        Grey dates are fully booked and cannot be clicked. Dates with only some blocked times are still clickable, and unavailable times are removed from the time dropdown. The current booking is excluded from the check.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeRescheduleModal}
                    disabled={rescheduleSaving}
                    className="h-11 rounded-full border border-black/10 bg-white px-5 text-xs font-extrabold text-black/65 hover:bg-black/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={rescheduleSaving}
                    className="h-11 rounded-full bg-[#2A4F33] px-6 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {rescheduleSaving ? "SAVING..." : "SAVE RESCHEDULE"}
                  </button>
                </div>
              </form>
            </div>
          ) : null}
    </HotelAdminShell>
  );
}

function RescheduleCalendar({
  value,
  month,
  options,
  loading,
  onMonthChange,
  onSelect,
}) {
  const days = buildCalendarDays(month);
  const selectedValue = String(value || "");
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const goToPreviousMonth = () => {
    onMonthChange((current) =>
      normalizeMonthDate(new Date(current.getFullYear(), current.getMonth() - 1, 1))
    );
  };

  const goToNextMonth = () => {
    onMonthChange((current) =>
      normalizeMonthDate(new Date(current.getFullYear(), current.getMonth() + 1, 1))
    );
  };

  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-black/10 bg-black/[0.03] px-3 py-2">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-black text-black/35 hover:bg-black/5 hover:text-black/70"
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="text-sm font-black text-black/85">
          {formatCalendarMonth(month)}
        </div>

        <button
          type="button"
          onClick={goToNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-black text-black/35 hover:bg-black/5 hover:text-black/70"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 px-3 pt-3 text-center text-[11px] font-black text-black/75">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 p-3 pt-2">
        {days.map((day) => {
          const reason = getRescheduleDateDisabledReason(options, day.iso);
          const isOutsideMonth = !day.isCurrentMonth;
          const isSelected = selectedValue === day.iso;
          const isToday = todayISO() === day.iso;
          const disabled = loading || isOutsideMonth || Boolean(reason);

          return (
            <button
              key={day.iso}
              type="button"
              disabled={disabled}
              title={reason || day.iso}
              onClick={() => onSelect(day.iso)}
              className={`relative flex h-9 items-center justify-center rounded-lg text-xs font-extrabold transition ${
                isOutsideMonth
                  ? "text-black/20"
                  : disabled
                  ? "cursor-not-allowed bg-slate-100 text-slate-300 line-through"
                  : isSelected
                  ? "bg-blue-100 text-blue-800 ring-2 ring-blue-200"
                  : "text-black/85 hover:bg-blue-50 hover:text-blue-800"
              } ${isToday && !isSelected && !disabled ? "ring-1 ring-[#2A4F33]/30" : ""}`}
            >
              {day.day}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/10 px-3 py-2 text-[11px] font-bold text-black/45">
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-blue-100 ring-1 ring-blue-200" />
          Selected
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-slate-100" />
          Fully booked / not clickable
        </span>
      </div>
    </div>
  );
}

function MenuButton({ label, to, active = false }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={`w-full rounded-md px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10 ${
        active ? "bg-[#E9EFE4] !text-[#2F5E3A]" : ""
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-[#E9F1D9] p-5 shadow-sm">
      <p className="text-sm font-semibold text-[#2F5E3A]">{label}</p>
      <p className="mt-2 text-4xl font-extrabold leading-none text-[#2F5E3A]">
        {value}
      </p>
    </div>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-full border px-5 text-xs font-extrabold transition ${
        active
          ? "border-[#2A4F33] bg-[#2A4F33] text-white"
          : "border-black/10 bg-white text-black/70 hover:bg-black/5"
      }`}
    >
      {label}
    </button>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`px-4 py-3 text-xs font-extrabold text-black/60 ${className}`}>
      {children}
    </th>
  );
}
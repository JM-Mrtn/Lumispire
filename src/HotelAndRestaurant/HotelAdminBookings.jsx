// HotelAdminBookings.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const GREEN_DARK = "#082719";
const GREEN_SOFT = "#174A30";
const GOLD = "#D7A84D";
const CARD_BG = "#F8FBF9";

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

const BLOCK_DATE_SERVICES = [
  { id: "resort_venue", label: "Resort & Venue" },
  { id: "event_package", label: "Event Package" },
  { id: "hotel_condo", label: "Hotel & Condo" },
];

const BLOCK_DATE_REASONS = [
  { id: "WALK_IN", label: "Walk-in Reservation" },
  { id: "MAINTENANCE", label: "Maintenance" },
  { id: "PRIVATE_EVENT", label: "Private Event" },
  { id: "OTHER", label: "Other" },
];

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

function getAdminHeaders() {
  const token = getAdminToken();

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;

  const amount = Number(String(value).replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(amount)) return fallback;

  return amount;
}

function firstMoneyValue(...values) {
  for (const value of values) {
    const amount = toNumber(value, NaN);
    if (Number.isFinite(amount) && amount > 0) return amount;
  }

  return 0;
}

function firstDefinedValue(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") return value;
  }

  return "";
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

function formatDate(value) {
  if (!value) return "—";

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [year, month, day] = text.split("-");
    return `${month}/${day}/${year}`;
  }

  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) return text;

  return parsed.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function todayLocalISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function getBlockedServiceLabel(serviceType = "") {
  return (
    BLOCK_DATE_SERVICES.find((item) => item.id === serviceType)?.label ||
    "Booking Service"
  );
}

function getBlockedReasonLabel(reason = "OTHER") {
  return BLOCK_DATE_REASONS.find((item) => item.id === reason)?.label || "Other";
}


function getBlockedTimeLabel(timeSlot = "ALL_DAY") {
  return String(timeSlot || "ALL_DAY").toUpperCase() === "ALL_DAY"
    ? "All Day"
    : String(timeSlot || "");
}

function getPackageTimeSlots(pkg = null) {
  if (!pkg) return [];

  const variants = Array.isArray(pkg.variants)
    ? pkg.variants.filter((variant) => variant?.isActive !== false)
    : [];

  return Array.from(
    new Set(
      variants.flatMap((variant) =>
        Array.isArray(variant?.timeSlots)
          ? variant.timeSlots.map((slot) => String(slot || "").trim()).filter(Boolean)
          : []
      )
    )
  );
}

function bookingTypeToBlockedServiceType(type = "") {
  if (type === "resort") return "resort_venue";
  if (type === "event") return "event_package";
  if (type === "hotel_room") return "hotel_condo";
  return "";
}

function normalizePackageIdValue(value) {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || value.id || "").trim();
  }

  return String(value).trim();
}

function normalizeComparableTitle(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function packageMatchesSelection(row = {}, packageId = "", packageTitle = "") {
  const rowPackageId = normalizePackageIdValue(row.packageId || row.raw?.packageId);
  const selectedPackageId = normalizePackageIdValue(packageId);

  if (rowPackageId && selectedPackageId && rowPackageId === selectedPackageId) {
    return true;
  }

  const rowTitle = normalizeComparableTitle(
    row.packageTitle ||
      row.eventPackage ||
      row.raw?.packageTitle ||
      row.raw?.eventPackage ||
      row.title ||
      ""
  );
  const selectedTitle = normalizeComparableTitle(packageTitle);

  return Boolean(rowTitle && selectedTitle && rowTitle === selectedTitle);
}

function parseClockMinutes(hourText, minuteText, meridiemText) {
  let hour = Number(hourText);
  const minute = Number(minuteText || 0);
  const meridiem = String(meridiemText || "").toUpperCase();

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 1 ||
    hour > 12 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  if (hour === 12) hour = 0;
  if (meridiem === "PM") hour += 12;

  return hour * 60 + minute;
}

function parseAdminTimeRange(value = "") {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return null;

  if (text.toUpperCase().replace(/[\s-]+/g, "_") === "ALL_DAY") {
    return { startMinutes: 0, endMinutes: 24 * 60, allDay: true };
  }

  const matches = [...text.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi)];
  if (matches.length < 2) return null;

  const startMinutes = parseClockMinutes(matches[0][1], matches[0][2], matches[0][3]);
  let endMinutes = parseClockMinutes(matches[1][1], matches[1][2], matches[1][3]);

  if (startMinutes === null || endMinutes === null) return null;

  if (/next\s+day/i.test(text) || endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return { startMinutes, endMinutes, allDay: false };
}

function buildAdminTimeInterval(dateValue = "", timeValue = "") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateValue || ""))) return null;

  const range = parseAdminTimeRange(timeValue);
  if (!range) return null;

  const baseMs = new Date(`${dateValue}T00:00:00+08:00`).getTime();

  if (!Number.isFinite(baseMs)) return null;

  return {
    start: baseMs + range.startMinutes * 60 * 1000,
    end: baseMs + range.endMinutes * 60 * 1000,
    allDay: range.allDay,
  };
}

function getBookingAdminInterval(booking = {}) {
  const rawStart = booking.raw?.startDateTime || booking.startDateTime;
  const rawEnd = booking.raw?.endDateTime || booking.endDateTime;
  const startMs = rawStart ? new Date(rawStart).getTime() : NaN;
  const endMs = rawEnd ? new Date(rawEnd).getTime() : NaN;

  if (Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs) {
    return { start: startMs, end: endMs, allDay: false };
  }

  return buildAdminTimeInterval(booking.date || booking.eventDate || "", booking.time || "");
}

function intervalsOverlapWithAdminGap(a, b, gapMinutes = 0) {
  if (!a || !b) return false;

  const gapMs = Number(gapMinutes || 0) * 60 * 1000;
  return a.start < b.end + gapMs && b.start < a.end + gapMs;
}

function manualBlockMatchesSelection(row = {}, serviceType = "", packageId = "", packageTitle = "") {
  if (String(row.serviceType || "") !== String(serviceType || "")) return false;
  return packageMatchesSelection(row, packageId, packageTitle);
}

function normalizeStatus(value) {
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

function normalizePaymentTerm(value = "", paidAmount = 0, totalAmount = 0) {
  const raw = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (
    raw.includes("DOWN") ||
    raw.includes("PARTIAL") ||
    raw === "DP" ||
    raw === "DEPOSIT"
  ) {
    return "DOWN_PAYMENT";
  }

  if (
    raw.includes("FULL") ||
    raw === "PAID" ||
    raw === "FULLY_PAID" ||
    raw === "FULL_PAYMENT"
  ) {
    return "FULL_PAYMENT";
  }

  if (paidAmount > 0 && totalAmount > 0 && paidAmount < totalAmount) {
    return "DOWN_PAYMENT";
  }

  if (paidAmount > 0 && totalAmount > 0 && paidAmount >= totalAmount) {
    return "FULL_PAYMENT";
  }

  return raw || "";
}

function getPaymentTermLabel(term = "") {
  if (term === "DOWN_PAYMENT") return "Downpayment";
  if (term === "FULL_PAYMENT") return "Full Payment";
  return "Not recorded";
}

function getPaymentChipClass(term = "") {
  const base =
    "inline-flex rounded-full border px-3 py-1 text-[11px] font-extrabold";

  if (term === "DOWN_PAYMENT") {
    return `${base} border-amber-200 bg-amber-50 text-amber-700`;
  }

  if (term === "FULL_PAYMENT") {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
  }

  return `${base} border-slate-200 bg-slate-50 text-slate-600`;
}

function getStatusChipClass(status) {
  const base =
    "inline-flex rounded-full border px-3 py-1 text-[11px] font-extrabold";

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

function getServiceBadgeClass(type) {
  const base =
    "inline-flex rounded-full border px-3 py-1 text-[11px] font-extrabold";

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

function getStatusBoxClass(type) {
  if (type === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (type === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (type === "error") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
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

function getBookingSourceType(booking = {}) {
  return booking.sourceType || booking.bookingType || "hotel_room";
}

function getProofEndpoint(apiBase, booking) {
  const sourceType = getBookingSourceType(booking);

  if (sourceType === "resort") {
    return `${apiBase}/admin/resort-bookings/${booking._id}/proof`;
  }

  if (sourceType === "event") {
    return `${apiBase}/admin/event-bookings/${booking._id}/proof`;
  }

  return `${apiBase}/admin/hotel-room-bookings/${booking._id}/proof`;
}

function getStatusEndpoint(apiBase, booking) {
  const sourceType = getBookingSourceType(booking);

  if (sourceType === "resort") {
    return `${apiBase}/admin/resort-bookings/${booking._id}/status`;
  }

  if (sourceType === "event") {
    return `${apiBase}/admin/event-bookings/${booking._id}/status`;
  }

  return `${apiBase}/admin/hotel-room-bookings/${booking._id}/status`;
}

function extractPaymentInfo(booking = {}) {
  const raw = booking.raw || booking;

  const totalAmount = firstMoneyValue(
    booking.totalAmount,
    booking.price,
    booking.amount,
    booking.fullTotalAmount,
    raw.totalAmount,
    raw.price,
    raw.amount,
    raw.fullTotalAmount,
    raw.payment?.totalAmount
  );

  const explicitPaidAmount = firstMoneyValue(
    booking.paidAmount,
    booking.amountToPay,
    booking.payment?.paidAmount,
    booking.payment?.amountToPay,
    raw.paidAmount,
    raw.amountToPay,
    raw.payment?.paidAmount,
    raw.payment?.amountToPay
  );

  const explicitBalanceAmount = firstMoneyValue(
    booking.balanceAmount,
    booking.remainingBalance,
    booking.balance,
    booking.unpaidAmount,
    booking.payment?.balanceAmount,
    raw.balanceAmount,
    raw.remainingBalance,
    raw.balance,
    raw.unpaidAmount,
    raw.payment?.balanceAmount
  );

  const explicitPaymentStatus = String(
    firstDefinedValue(
      booking.paymentStatus,
      booking.payment?.paymentStatus,
      raw.paymentStatus,
      raw.payment?.paymentStatus
    ) || ""
  )
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const explicitPaymentTermRaw = firstDefinedValue(
    booking.paymentTerm,
    booking.paymentType,
    booking.payment?.paymentTerm,
    raw.paymentTerm,
    raw.paymentType,
    raw.payment?.paymentTerm
  );

  let paymentTerm = normalizePaymentTerm(
    explicitPaymentTermRaw,
    explicitPaidAmount,
    totalAmount
  );

  let paidAmount = explicitPaidAmount;
  let balanceAmount = explicitBalanceAmount;
  let isPaymentInferred = false;

  // paymentStatus is the strongest signal. A FULLY_PAID booking must never be
  // displayed/count as Down Payment even if an older paymentTerm is stale.
  if (explicitPaymentStatus === "FULLY_PAID") {
    paymentTerm = "FULL_PAYMENT";
    if (totalAmount > 0) {
      paidAmount = totalAmount;
      balanceAmount = 0;
    }
  } else if (explicitPaymentStatus === "PARTIALLY_PAID") {
    paymentTerm = "DOWN_PAYMENT";

    if (totalAmount > 0 && paidAmount <= 0) {
      paidAmount = Math.ceil(totalAmount / 2);
      isPaymentInferred = true;
    }

    if (totalAmount > 0) {
      balanceAmount = Math.max(0, totalAmount - paidAmount);
    }
  } else if (totalAmount > 0 && paidAmount >= totalAmount) {
    paymentTerm = "FULL_PAYMENT";
    paidAmount = totalAmount;
    balanceAmount = 0;
  } else if (totalAmount > 0 && (balanceAmount > 0 || (paidAmount > 0 && paidAmount < totalAmount))) {
    paymentTerm = "DOWN_PAYMENT";
    balanceAmount = Math.max(0, totalAmount - paidAmount);
  } else if (totalAmount > 0 && paymentTerm === "DOWN_PAYMENT") {
    if (paidAmount <= 0) {
      paidAmount = Math.ceil(totalAmount / 2);
      isPaymentInferred = true;
    }
    balanceAmount = Math.max(0, totalAmount - paidAmount);
  } else if (totalAmount > 0 && paymentTerm === "FULL_PAYMENT") {
    if (paidAmount <= 0) {
      paidAmount = totalAmount;
      isPaymentInferred = true;
    }
    balanceAmount = 0;
  }

  // Never guess an unspecified legacy booking as a down payment.
  if (!paymentTerm || !["DOWN_PAYMENT", "FULL_PAYMENT"].includes(paymentTerm)) {
    paymentTerm = "";
  }

  return {
    paymentTerm,
    paymentTermLabel: getPaymentTermLabel(paymentTerm),
    paidAmount,
    amountToPay: paidAmount,
    balanceAmount,
    totalAmount,
    paymentStatus: explicitPaymentStatus,
    isPaymentInferred,
  };
}

function resolveSemanticBookingType(booking = {}, fallbackType = "") {
  const raw = booking.raw || booking;
  const serviceText = String(
    booking.serviceType || raw.serviceType || booking.serviceLabel || raw.serviceLabel || ""
  )
    .trim()
    .toLowerCase();

  if (serviceText.includes("hotel") || serviceText.includes("condo")) {
    return "hotel_room";
  }

  if (serviceText.includes("event")) {
    return "event";
  }

  if (serviceText.includes("resort") || serviceText.includes("venue")) {
    return "resort";
  }

  const explicitType = String(booking.bookingType || raw.bookingType || "").toLowerCase();
  if (["resort", "event", "hotel_room"].includes(explicitType)) {
    return explicitType;
  }

  return fallbackType || "resort";
}

function normalizeBooking(booking = {}, fallbackType = "") {
  const raw = booking.raw || booking;
  const sourceType = fallbackType || booking.sourceType || booking.bookingType || "resort";
  const bookingType = resolveSemanticBookingType(booking, sourceType);

  if (bookingType === "event") {
    const normalized = {
      _id: String(booking._id || booking.id || ""),
      bookingType: "event",
      sourceType,
      serviceLabel: "Event Package",
      packageId: String(booking.packageId || raw.packageId || ""),
      packageTitle: booking.eventPackage || raw.eventPackage || booking.packageTitle || raw.packageTitle || "Event Package",
      title:
        booking.title ||
        booking.eventPackage ||
        booking.packageTitle ||
        booking.packageName ||
        raw.eventPackage ||
        raw.packageTitle ||
        "Event Package Booking",
      customerName: getCustomerName(booking),
      email: getCustomerEmail(booking) || "—",
      phone: getCustomerPhone(booking) || "—",
      date: booking.date || booking.eventDate || raw.eventDate || "",
      time: booking.time || raw.time || "",
      category:
        booking.category ||
        booking.timeVariationLabel ||
        booking.selectedVariantLabel ||
        booking.eventType ||
        raw.timeVariationLabel ||
        raw.selectedVariantLabel ||
        raw.eventType ||
        "Event Package",
      location: booking.location || booking.venue || raw.venue || "",
      pax: Number(booking.pax || booking.totalGuests || booking.guests || raw.pax || 0),
      paymentMethod: booking.paymentMethod || raw.paymentMethod || "",
      status: normalizeStatus(booking.status || raw.status),
      isActive: booking.isActive !== false && raw.isActive !== false,
      createdAt: booking.createdAt || raw.createdAt || booking.date || "",
      raw,
    };

    const payment = extractPaymentInfo({ ...booking, raw });

    return {
      ...normalized,
      ...payment,
    };
  }

  if (bookingType === "hotel_room") {
    const roomType =
      booking.roomType ||
      booking.location ||
      booking.packageTitle ||
      raw.roomType ||
      raw.packageTitle ||
      "Hotel Room";

    const duration = booking.duration || booking.category || raw.duration || "";

    const normalized = {
      _id: String(booking._id || booking.id || ""),
      bookingType: "hotel_room",
      sourceType,
      serviceLabel: "Hotel & Condo",
      packageId: String(booking.packageId || raw.packageId || ""),
      packageTitle: booking.packageTitle || raw.packageTitle || roomType,
      title:
        booking.title ||
        `${roomType}${duration ? ` - ${duration}` : ""}`,
      customerName: getCustomerName(booking),
      email: getCustomerEmail(booking) || "—",
      phone: getCustomerPhone(booking) || "—",
      date: booking.date || raw.date || "",
      time: booking.time || raw.time || "",
      category: duration || "Hotel Room",
      location: roomType,
      pax: Number(booking.pax || booking.totalGuests || booking.guests || raw.pax || 0),
      paymentMethod: booking.paymentMethod || raw.paymentMethod || "",
      status: normalizeStatus(booking.status || raw.status),
      isActive: booking.isActive !== false && raw.isActive !== false,
      createdAt: booking.createdAt || raw.createdAt || booking.date || "",
      raw,
    };

    const payment = extractPaymentInfo({ ...booking, raw });

    return {
      ...normalized,
      ...payment,
    };
  }

  const normalized = {
    _id: String(booking._id || booking.id || ""),
    bookingType: "resort",
    sourceType,
    serviceLabel: "Resort & Venue",
    packageId: String(booking.packageId || raw.packageId || ""),
    packageTitle: booking.packageTitle || raw.packageTitle || booking.venue || raw.venue || "Resort & Venue",
    title:
      booking.title ||
      booking.venue ||
      booking.packageTitle ||
      raw.venue ||
      raw.packageTitle ||
      "Resort & Venue Booking",
    customerName: getCustomerName(booking),
    email: getCustomerEmail(booking) || "—",
    phone: getCustomerPhone(booking) || "—",
    date: booking.date || raw.date || "",
    time: booking.time || raw.time || "",
    category: booking.category || booking.duration || raw.category || raw.duration || "",
    location: booking.location || booking.venue || raw.venue || "",
    pax:
      Number(
        booking.pax ||
          booking.totalGuests ||
          raw.pax ||
          raw.totalGuests ||
          Number(booking.adults || raw.adults || 0) +
            Number(booking.kids || raw.kids || 0)
      ) || 0,
    paymentMethod: booking.paymentMethod || raw.paymentMethod || "",
    status: normalizeStatus(booking.status || raw.status),
    isActive: booking.isActive !== false && raw.isActive !== false,
    createdAt: booking.createdAt || raw.createdAt || booking.date || "",
    raw,
  };

  const payment = extractPaymentInfo({ ...booking, raw });

  return {
    ...normalized,
    ...payment,
  };
}

function uniqueBookings(rows = []) {
  const map = new Map();

  rows.forEach((item) => {
    if (!item?._id) return;
    map.set(`${item.bookingType}:${item._id}`, item);
  });

  return Array.from(map.values());
}

function extractBookings(data, fallbackType = "") {
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.bookings)
    ? data.bookings
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.rows)
    ? data.rows
    : [];

  // The endpoint tells us where the record is physically stored (sourceType),
  // while serviceType tells us which service tab it belongs to. Keeping both
  // prevents cross-service display bugs without breaking Proof/Approve/Reject.
  return rows.map((item) => normalizeBooking(item, fallbackType));
}

function isImageMime(mimeType = "") {
  return String(mimeType || "").startsWith("image/");
}

function isPdfMime(mimeType = "") {
  return String(mimeType || "").toLowerCase().includes("application/pdf");
}

function getProofTitle(booking) {
  if (!booking) return "Proof of Payment";

  return `${booking.serviceLabel || "Booking"} Proof`;
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-5 py-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[#667085] ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`border-t border-[#082719]/10 px-5 py-5 align-top text-[13px] font-semibold text-[#102418] ${className}`}>
      {children}
    </td>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
        active
          ? "border-[#082719] bg-[#082719] text-white"
          : "border-black/10 bg-white text-black/55 hover:border-[#082719]/40 hover:text-[#082719]"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value, helper = "" }) {
  return (
    <div className="group relative h-full min-h-[128px] overflow-hidden rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(8,39,25,0.12)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#D7A84D]/50 hover:shadow-[0_28px_70px_rgba(8,39,25,0.18)]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#082719] via-[#235F3E] to-[#D7A84D]" />
      <div className="absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(215,168,77,0.24),transparent_62%)] transition duration-300 group-hover:scale-110" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/42">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#082719]">
            {value}
          </p>
        </div>

        {helper ? (
          <p className="mt-3 text-xs font-semibold text-black/48">{helper}</p>
        ) : null}
      </div>
    </div>
  );
}

function PaymentSummary({ booking, compact = false }) {
  const paymentTerm = booking?.paymentTerm || "";
  const paidAmount = Number(booking?.paidAmount || booking?.amountToPay || 0);
  const balanceAmount = Number(booking?.balanceAmount || 0);
  const totalAmount = Number(booking?.totalAmount || 0);

  if (compact) {
    return (
      <div className="space-y-1">
        <span className={getPaymentChipClass(paymentTerm)}>
          {getPaymentTermLabel(paymentTerm)}
        </span>

        {booking?.isPaymentInferred ? (
          <p className="mt-1 text-[11px] font-bold text-amber-700">
            Computed as 50/50 because this booking has no saved payment-term fields.
          </p>
        ) : null}

        <p className="text-xs font-extrabold text-[#082719]">
          Paid: {formatPeso(paidAmount)}
        </p>

        <p className="text-xs font-semibold text-black/55">
          Balance: {formatPeso(balanceAmount)}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
      <div className="rounded-xl bg-white p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-black/40">
          Payment Type
        </p>

        <p className="mt-1 text-sm font-extrabold text-[#082719]">
          {getPaymentTermLabel(paymentTerm)}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-black/40">
          Amount Paid
        </p>

        <p className="mt-1 text-sm font-extrabold text-[#082719]">
          {formatPeso(paidAmount)}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-black/40">
          Balance
        </p>

        <p className="mt-1 text-sm font-extrabold text-[#082719]">
          {formatPeso(balanceAmount)}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-black/40">
          Total
        </p>

        <p className="mt-1 text-sm font-extrabold text-[#082719]">
          {formatPeso(totalAmount)}
        </p>
      </div>
    </div>
  );
}

function ProofPreviewModal({
  booking,
  url,
  mimeType,
  loading,
  error,
  onClose,
}) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="max-h-full w-full max-w-4xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-['Montserrat',sans-serif] text-xl font-extrabold text-[#355E3B]">
              {getProofTitle(booking)}
            </h2>

            <p className="mt-1 text-sm font-semibold text-[#355E3B]/80">
              {booking.customerName}
            </p>

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span
                className={`rounded-full border px-3 py-1 font-bold ${getServiceBadgeClass(
                  booking.bookingType
                )}`}
              >
                {booking.serviceLabel}
              </span>

              <span
                className={`rounded-full border px-3 py-1 font-bold ${getStatusChipClass(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>

              <span className={getPaymentChipClass(booking.paymentTerm)}>
                {getPaymentTermLabel(booking.paymentTerm)}
              </span>

              {booking.isPaymentInferred ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-bold text-amber-700">
                  50/50 computed
                </span>
              ) : null}

              <span className="rounded-full bg-[#f6f6f3] px-3 py-1 font-bold text-[#355E3B]">
                {formatDate(booking.date)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#355E3B] px-4 py-2 text-sm font-semibold text-[#355E3B] hover:bg-[#355E3B]/5"
          >
            Close
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-[#d7dbd2] bg-[#f6f6f3] p-4 text-sm text-[#355E3B]">
          <p className="font-extrabold">Booking Details</p>

          <div className="mt-2 grid grid-cols-1 gap-2 text-xs font-semibold text-[#355E3B]/80 sm:grid-cols-2">
            <p>
              <span className="font-extrabold">Booking:</span>{" "}
              {booking.title || "—"}
            </p>

            <p>
              <span className="font-extrabold">Category:</span>{" "}
              {booking.category || "—"}
            </p>

            <p>
              <span className="font-extrabold">Time:</span>{" "}
              {booking.time || "—"}
            </p>

            <p>
              <span className="font-extrabold">Payment Method:</span>{" "}
              {booking.paymentMethod || "—"}
            </p>
          </div>

          <div className="mt-4">
            <PaymentSummary booking={booking} />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl bg-[#f6f6f3] p-8 text-center text-sm font-semibold text-[#355E3B]/80">
            Loading proof of payment...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : !url ? (
          <div className="rounded-xl bg-[#f6f6f3] p-8 text-center text-sm font-semibold text-[#355E3B]/80">
            No proof file found.
          </div>
        ) : isImageMime(mimeType) ? (
          <img
            src={url}
            alt="Proof of payment"
            className="max-h-[75vh] w-full rounded-xl bg-[#f6f6f3] object-contain"
          />
        ) : isPdfMime(mimeType) ? (
          <iframe
            src={url}
            title="Proof of payment PDF"
            className="h-[75vh] w-full rounded-xl border border-black/10 bg-[#f6f6f3]"
          />
        ) : (
          <div className="rounded-xl bg-[#f6f6f3] p-8 text-center text-sm font-semibold text-[#355E3B]/80">
            Preview is not supported for this file type.
          </div>
        )}
      </div>
    </div>
  );
}

export default function HotelAdminBookings() {
  const navigate = useNavigate();
  const API_BASE = useMemo(() => getHotelApiBase(), []);

  const objectUrlsRef = useRef([]);
  const initialFetchStartedRef = useRef(false);
  const fetchRunRef = useRef(0);
  const activeFetchControllerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [bookings, setBookings] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockedDatesLoading, setBlockedDatesLoading] = useState(false);
  const [blockedDateBusyId, setBlockedDateBusyId] = useState("");
  const [servicePackages, setServicePackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [blockedDateForm, setBlockedDateForm] = useState({
    date: "",
    serviceType: "event_package",
    packageId: "",
    timeSlot: "",
    reason: "WALK_IN",
    note: "",
  });

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const [proofModal, setProofModal] = useState({
    open: false,
    booking: null,
    url: "",
    mimeType: "",
    loading: false,
    error: "",
  });

  const registerObjectUrl = (url) => {
    if (url) objectUrlsRef.current.push(url);
  };

  const revokeProofUrl = (url) => {
    if (!url) return;

    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  const cleanupObjectUrls = () => {
    objectUrlsRef.current.forEach((url) => revokeProofUrl(url));
    objectUrlsRef.current = [];
  };

  useEffect(() => {
    return () => {
      cleanupObjectUrls();
    };
  }, []);

  const kickToAdminLogin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("hotelAdminToken");
    localStorage.removeItem("hotelAdmin");
    navigate("/hotel-admin-login", { replace: true });
  };

  const fetchJson = async (url, signal) => {
    const response = await fetch(url, {
      method: "GET",
      headers: getAdminHeaders(),
      signal,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      kickToAdminLogin();
      return {
        authFailed: true,
        ok: false,
        data: null,
        status: response.status,
      };
    }

    return {
      authFailed: false,
      ok: response.ok,
      data,
      status: response.status,
      message: data?.message || "",
    };
  };

  const getBlockedDateEndpointCandidates = (blockedDateId = "") => {
    const hotelBase = String(API_BASE || "").replace(/\/+$/, "");
    const adminBase = hotelBase.includes("/api/hotel")
      ? hotelBase.replace(/\/api\/hotel(?:$|\/.*)/, "/api/hotel-admin")
      : hotelBase;
    const suffix = blockedDateId
      ? `/${encodeURIComponent(blockedDateId)}`
      : "";

    return Array.from(
      new Set([
        `${hotelBase}/admin/blocked-dates${suffix}`,
        `${hotelBase}/blocked-dates${suffix}`,
        `${adminBase}/admin/blocked-dates${suffix}`,
        `${adminBase}/blocked-dates${suffix}`,
      ])
    );
  };

  const requestBlockedDateApi = async ({
    blockedDateId = "",
    query = "",
    method = "GET",
    body,
  } = {}) => {
    const candidates = getBlockedDateEndpointCandidates(blockedDateId);
    let lastResult = null;

    for (const baseUrl of candidates) {
      const url = query ? `${baseUrl}?${query}` : baseUrl;
      const response = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });

      const data = await response.json().catch(() => ({}));
      const routeMissing =
        response.status === 404 &&
        (!data?.message || /route not found|cannot\s+(get|post|delete)/i.test(data.message));

      lastResult = { response, data, url };

      if (routeMissing) {
        continue;
      }

      return lastResult;
    }

    return lastResult;
  };

  const fetchServicePackages = async () => {
    const token = getAdminToken();

    if (!token) {
      kickToAdminLogin();
      return;
    }

    setPackagesLoading(true);

    try {
      const response = await fetch(`${API_BASE}/admin/packages`, {
        method: "GET",
        headers: getAdminHeaders(),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        kickToAdminLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load packages.");
      }

      setServicePackages(
        Array.isArray(data.packages)
          ? data.packages
              .filter((item) => item?.isActive !== false)
              .sort((a, b) => {
                const orderA = Number(a.displayOrder || 0);
                const orderB = Number(b.displayOrder || 0);

                if (orderA !== orderB) return orderA - orderB;

                return String(a.title || "").localeCompare(String(b.title || ""));
              })
          : []
      );
    } catch (error) {
      console.error("fetchServicePackages error:", error);
      setStatus({
        type: "error",
        message: error.message || "Network error while loading packages.",
      });
    } finally {
      setPackagesLoading(false);
    }
  };

  const blockablePackages = useMemo(() => {
    return servicePackages.filter(
      (item) => String(item.type || "") === blockedDateForm.serviceType
    );
  }, [servicePackages, blockedDateForm.serviceType]);

  const selectedBlockedPackage = useMemo(() => {
    return (
      servicePackages.find(
        (item) => String(item._id) === String(blockedDateForm.packageId)
      ) || null
    );
  }, [servicePackages, blockedDateForm.packageId]);


  const blockableTimeSlots = useMemo(
    () => getPackageTimeSlots(selectedBlockedPackage),
    [selectedBlockedPackage]
  );

  const sortBookingsByRecent = (rows = []) =>
    uniqueBookings(rows)
      .filter((item) => item._id)
      .sort((a, b) => {
        const bTime = new Date(b.createdAt || b.date || 0).getTime();
        const aTime = new Date(a.createdAt || a.date || 0).getTime();
        return bTime - aTime;
      });

  const replaceSourceBookings = (sourceType, sourceRows, runId) => {
    if (runId !== fetchRunRef.current) return;

    setBookings((current) => {
      const otherSources = current.filter(
        (booking) => getBookingSourceType(booking) !== sourceType
      );

      return sortBookingsByRecent([...otherSources, ...sourceRows]);
    });
  };

  const fetchBlockedDates = async () => {
    const token = getAdminToken();

    if (!token) {
      kickToAdminLogin();
      return;
    }

    setBlockedDatesLoading(true);

    try {
      const query = new URLSearchParams({ from: todayLocalISO() }).toString();
      const result = await requestBlockedDateApi({ query, method: "GET" });
      const response = result?.response;
      const data = result?.data || {};

      if (!response) {
        throw new Error("Blocked-date API is unavailable.");
      }

      if (response.status === 401 || response.status === 403) {
        kickToAdminLogin();
        return;
      }

      if (!response.ok) {
        const missingRoute =
          response.status === 404 &&
          (!data?.message || /route not found|cannot\s+get/i.test(data.message));

        throw new Error(
          missingRoute
            ? "Blocked-date API route is not registered on the running backend. Restart the updated backend server, then refresh this page."
            : data.message || "Failed to load disabled dates."
        );
      }

      setBlockedDates(
        Array.isArray(data.blockedDates)
          ? data.blockedDates.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)))
          : []
      );
    } catch (error) {
      console.error("fetchBlockedDates error:", error);
      setStatus({
        type: "error",
        message: error.message || "Network error while loading disabled dates.",
      });
    } finally {
      setBlockedDatesLoading(false);
    }
  };

  const disableBookingDate = async () => {
    const token = getAdminToken();

    if (!token) {
      kickToAdminLogin();
      return;
    }

    if (!blockedDateForm.date) {
      setStatus({ type: "error", message: "Please choose a date to disable." });
      return;
    }

    if (!blockedDateForm.serviceType) {
      setStatus({ type: "error", message: "Please choose a service." });
      return;
    }

    if (!blockedDateForm.packageId || !selectedBlockedPackage) {
      setStatus({
        type: "error",
        message: "Please choose the specific package you want to disable.",
      });
      return;
    }

    if (!blockedDateForm.timeSlot) {
      setStatus({
        type: "error",
        message: "Please choose the specific time slot, or choose All Day.",
      });
      return;
    }

    const conflict = findSelectedSlotConflict(blockedDateForm.timeSlot);

    if (conflict) {
      setStatus({
        type: "error",
        message:
          conflict.kind === "BOOKED"
            ? `This package/time is already booked by ${conflict.detail}. Choose another available time slot.`
            : `This package/time is already manually disabled (${conflict.detail}). Choose another available time slot.`,
      });
      return;
    }

    setBlockedDateBusyId("CREATE");
    setStatus({ type: "", message: "" });

    try {
      const result = await requestBlockedDateApi({
        method: "POST",
        body: {
          ...blockedDateForm,
          packageTitle: selectedBlockedPackage.title || "",
        },
      });
      const response = result?.response;
      const data = result?.data || {};

      if (!response) {
        throw new Error("Blocked-date API is unavailable.");
      }

      if (response.status === 401 || response.status === 403) {
        kickToAdminLogin();
        return;
      }

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to disable this date.",
        });
        return;
      }

      setBlockedDateForm((current) => ({
        date: "",
        serviceType: current.serviceType || "event_package",
        packageId: "",
        timeSlot: "",
        reason: "WALK_IN",
        note: "",
      }));

      await fetchBlockedDates();
      setStatus({
        type: "success",
        message:
          data.message ||
          "Booking slot disabled successfully. Non-overlapping time slots remain available online.",
      });
    } catch (error) {
      console.error("disableBookingDate error:", error);
      setStatus({
        type: "error",
        message: "Network error while disabling this date.",
      });
    } finally {
      setBlockedDateBusyId("");
    }
  };

  const enableBookingDate = async (blockedDate) => {
    if (!blockedDate?._id) return;

    if (
      !window.confirm(
        `Enable ${formatDate(blockedDate.date)} — ${getBlockedTimeLabel(blockedDate.timeSlot)} for online booking again?`
      )
    ) {
      return;
    }

    setBlockedDateBusyId(String(blockedDate._id));
    setStatus({ type: "", message: "" });

    try {
      const result = await requestBlockedDateApi({
        blockedDateId: blockedDate._id,
        method: "DELETE",
      });
      const response = result?.response;
      const data = result?.data || {};

      if (!response) {
        throw new Error("Blocked-date API is unavailable.");
      }

      if (response.status === 401 || response.status === 403) {
        kickToAdminLogin();
        return;
      }

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to enable this date.",
        });
        return;
      }

      setBlockedDates((current) =>
        current.filter((item) => String(item._id) !== String(blockedDate._id))
      );
      setStatus({
        type: "success",
        message: data.message || "Date enabled for online booking again.",
      });
    } catch (error) {
      console.error("enableBookingDate error:", error);
      setStatus({
        type: "error",
        message: "Network error while enabling this date.",
      });
    } finally {
      setBlockedDateBusyId("");
    }
  };

  const refreshManageBookings = async () => {
    await Promise.all([fetchBookings(), fetchBlockedDates(), fetchServicePackages()]);
  };

  const fetchBookings = async () => {
    const token = getAdminToken();

    if (!token) {
      kickToAdminLogin();
      return;
    }

    // Cancel an older refresh before starting a new one. This prevents manual
    // refreshes or route remounts from stacking multiple expensive API reads.
    activeFetchControllerRef.current?.abort();

    const runId = fetchRunRef.current + 1;
    fetchRunRef.current = runId;

    const controller = new AbortController();
    activeFetchControllerRef.current = controller;

    // Do not allow one slow service (usually Resort) to freeze the entire page.
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    setLoading(true);
    setStatus({ type: "", message: "" });

    const endpoints = [
      {
        sourceType: "resort",
        label: "Resort & Venue",
        url: `${API_BASE}/admin/resort-bookings`,
      },
      {
        sourceType: "event",
        label: "Event Package",
        url: `${API_BASE}/admin/event-bookings`,
      },
      {
        sourceType: "hotel_room",
        label: "Hotel & Condo",
        url: `${API_BASE}/admin/hotel-room-bookings`,
      },
    ];

    const failedServices = [];
    const successfulRows = [];
    let authFailed = false;

    try {
      // Load all services in parallel, but merge each successful response into
      // the table immediately instead of waiting for the slowest endpoint.
      const tasks = endpoints.map(async ({ sourceType, label, url }) => {
        try {
          const result = await fetchJson(url, controller.signal);

          if (runId !== fetchRunRef.current) return;

          if (result.authFailed) {
            authFailed = true;
            return;
          }

          if (!result.ok) {
            failedServices.push(label);
            return;
          }

          const rows = extractBookings(result.data, sourceType);
          rows.forEach((row) => successfulRows.push(row));
          replaceSourceBookings(sourceType, rows, runId);
        } catch (error) {
          if (runId !== fetchRunRef.current) return;

          if (error?.name === "AbortError") {
            failedServices.push(`${label} (timed out)`);
            return;
          }

          console.error(`${label} bookings load error:`, error);
          failedServices.push(label);
        }
      });

      await Promise.allSettled(tasks);

      if (runId !== fetchRunRef.current || authFailed) return;

      if (failedServices.length) {
        setStatus({
          type: "warning",
          message: `Loaded available bookings, but ${failedServices.join(
            ", "
          )} could not finish loading. Try Refresh again.`,
        });
      } else if (!successfulRows.length) {
        setStatus({
          type: "warning",
          message:
            "No bookings found. If a user already submitted a booking, check MongoDB and confirm the booking was saved successfully.",
        });
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("fetchBookings error:", error);
      }

      if (runId === fetchRunRef.current) {
        setStatus({
          type: "error",
          message:
            "Network error while loading bookings. Check that the backend API is reachable, then try Refresh again.",
        });
      }
    } finally {
      window.clearTimeout(timeoutId);

      if (runId === fetchRunRef.current) {
        setLoading(false);

        if (activeFetchControllerRef.current === controller) {
          activeFetchControllerRef.current = null;
        }
      }
    }
  };

  useEffect(() => {
    // React StrictMode intentionally runs effects twice in local development.
    // Guard the initial request so localhost does not hit all three admin APIs
    // twice at the same time. Production behavior remains the same.
    if (initialFetchStartedRef.current) return;

    initialFetchStartedRef.current = true;
    fetchBookings();
    fetchBlockedDates();
    fetchServicePackages();
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
      downPaymentBookings: 0,
      fullPaymentBookings: 0,
      totalPaid: 0,
      totalBalance: 0,
    };

    bookings.forEach((booking) => {
      const normalizedStatus = normalizeStatus(booking.status);

      if (result[normalizedStatus] !== undefined) {
        result[normalizedStatus] += 1;
      }

      if (result[booking.bookingType] !== undefined) {
        result[booking.bookingType] += 1;
      }

      if (booking.paymentTerm === "DOWN_PAYMENT") {
        result.downPaymentBookings += 1;
      }

      if (booking.paymentTerm === "FULL_PAYMENT") {
        result.fullPaymentBookings += 1;
      }

      result.totalPaid += Number(booking.paidAmount || booking.amountToPay || 0);
      result.totalBalance += Number(booking.balanceAmount || 0);
    });

    return result;
  }, [bookings]);

  const upcomingScheduleEntries = useMemo(() => {
    const today = todayLocalISO();

    const manualEntries = blockedDates
      .filter((item) => String(item.date || "") >= today)
      .map((item) => ({
        key: `manual-${item._id}`,
        kind: "MANUAL",
        date: item.date,
        time: getBlockedTimeLabel(item.timeSlot),
        serviceType: item.serviceType,
        serviceLabel: getBlockedServiceLabel(item.serviceType),
        packageTitle: item.packageTitle || "Specific package",
        status: "DISABLED",
        detail: getBlockedReasonLabel(item.reason),
        note: item.note || "",
        blockedDate: item,
      }));

    const bookingEntries = bookings
      .filter((booking) => {
        const date = String(booking.date || "");
        return date >= today && booking.isActive !== false && normalizeStatus(booking.status) !== "CANCELLED";
      })
      .map((booking) => ({
        key: `booking-${booking.bookingType}-${booking._id}`,
        kind: "BOOKING",
        date: booking.date,
        time: booking.time || "—",
        serviceType: bookingTypeToBlockedServiceType(booking.bookingType),
        serviceLabel: booking.serviceLabel,
        packageTitle: booking.packageTitle || booking.title || "Booking",
        status: normalizeStatus(booking.status),
        detail: booking.customerName || "Online guest",
        note: booking.category || "",
        booking,
      }));

    return [...manualEntries, ...bookingEntries].sort((a, b) => {
      const dateCompare = String(a.date || "").localeCompare(String(b.date || ""));
      if (dateCompare !== 0) return dateCompare;
      return String(a.time || "").localeCompare(String(b.time || ""));
    });
  }, [blockedDates, bookings]);

  const selectedServiceScheduleEntries = useMemo(() => {
    return upcomingScheduleEntries.filter(
      (entry) => String(entry.serviceType || "") === String(blockedDateForm.serviceType || "")
    );
  }, [upcomingScheduleEntries, blockedDateForm.serviceType]);

  const selectedServiceDateGroups = useMemo(() => {
    const grouped = new Map();

    selectedServiceScheduleEntries.forEach((entry) => {
      const date = String(entry.date || "");
      if (!date) return;

      if (!grouped.has(date)) {
        grouped.set(date, {
          date,
          booked: 0,
          disabled: 0,
          entries: [],
        });
      }

      const group = grouped.get(date);
      group.entries.push(entry);
      if (entry.kind === "MANUAL") group.disabled += 1;
      else group.booked += 1;
    });

    return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedServiceScheduleEntries]);

  const selectedDateServiceEntries = useMemo(() => {
    if (!blockedDateForm.date) return [];

    return selectedServiceScheduleEntries.filter(
      (entry) => String(entry.date || "") === String(blockedDateForm.date || "")
    );
  }, [selectedServiceScheduleEntries, blockedDateForm.date]);

  const findSelectedSlotConflict = (timeSlot) => {
    if (
      !blockedDateForm.date ||
      !blockedDateForm.serviceType ||
      !blockedDateForm.packageId ||
      !selectedBlockedPackage ||
      !timeSlot
    ) {
      return null;
    }

    const candidate = buildAdminTimeInterval(blockedDateForm.date, timeSlot);
    if (!candidate) return null;

    const packageTitle = selectedBlockedPackage.title || "";

    const manualConflict = blockedDates.find((row) => {
      if (
        !manualBlockMatchesSelection(
          row,
          blockedDateForm.serviceType,
          blockedDateForm.packageId,
          packageTitle
        )
      ) {
        return false;
      }

      const interval = buildAdminTimeInterval(row.date, row.timeSlot || "ALL_DAY");
      return intervalsOverlapWithAdminGap(candidate, interval, 0);
    });

    if (manualConflict) {
      return {
        kind: "DISABLED",
        label: `Already disabled: ${getBlockedTimeLabel(manualConflict.timeSlot)}`,
        detail: getBlockedReasonLabel(manualConflict.reason),
        row: manualConflict,
      };
    }

    const bookingConflict = bookings.find((booking) => {
      if (booking.isActive === false || normalizeStatus(booking.status) === "CANCELLED") {
        return false;
      }

      if (
        bookingTypeToBlockedServiceType(booking.bookingType) !==
        blockedDateForm.serviceType
      ) {
        return false;
      }

      if (
        !packageMatchesSelection(
          booking,
          blockedDateForm.packageId,
          packageTitle
        )
      ) {
        return false;
      }

      const interval = getBookingAdminInterval(booking);
      return intervalsOverlapWithAdminGap(candidate, interval, 60);
    });

    if (bookingConflict) {
      return {
        kind: "BOOKED",
        label: `Booked: ${bookingConflict.time || "existing reservation"}`,
        detail: bookingConflict.customerName || "Online guest",
        booking: bookingConflict,
      };
    }

    return null;
  };

  const timeSlotOptions = useMemo(() => {
    if (!blockedDateForm.date || !blockedDateForm.packageId || !selectedBlockedPackage) {
      return [];
    }

    return blockableTimeSlots.map((slot) => ({
      slot,
      conflict: findSelectedSlotConflict(slot),
    }));
    // findSelectedSlotConflict intentionally reads the current booking/block state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    blockableTimeSlots,
    blockedDateForm.date,
    blockedDateForm.packageId,
    blockedDateForm.serviceType,
    selectedBlockedPackage,
    blockedDates,
    bookings,
  ]);

  const allDayConflict = useMemo(() => {
    if (!blockedDateForm.date || !blockedDateForm.packageId || !selectedBlockedPackage) {
      return null;
    }

    return findSelectedSlotConflict("ALL_DAY");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    blockedDateForm.date,
    blockedDateForm.packageId,
    blockedDateForm.serviceType,
    selectedBlockedPackage,
    blockedDates,
    bookings,
  ]);

  const selectedTimeConflict = blockedDateForm.timeSlot
    ? findSelectedSlotConflict(blockedDateForm.timeSlot)
    : null;

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();

    let rows = bookings.slice();

    if (statusFilter !== "ALL") {
      rows = rows.filter(
        (booking) => normalizeStatus(booking.status) === statusFilter
      );
    }

    if (serviceFilter !== "ALL") {
      rows = rows.filter((booking) => booking.bookingType === serviceFilter);
    }

    if (q) {
      rows = rows.filter((booking) => {
        const text = [
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
          booking.paymentTermLabel,
          booking.status,
          booking.totalAmount,
          booking.paidAmount,
          booking.balanceAmount,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(q);
      });
    }

    rows.sort((a, b) => {
      if (sortBy === "Oldest") {
        return (
          new Date(a.createdAt || a.date || 0).getTime() -
          new Date(b.createdAt || b.date || 0).getTime()
        );
      }

      if (sortBy === "PriceHigh") {
        return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
      }

      if (sortBy === "PriceLow") {
        return Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
      }

      if (sortBy === "PaidHigh") {
        return Number(b.paidAmount || 0) - Number(a.paidAmount || 0);
      }

      if (sortBy === "BalanceHigh") {
        return Number(b.balanceAmount || 0) - Number(a.balanceAmount || 0);
      }

      return (
        new Date(b.createdAt || b.date || 0).getTime() -
        new Date(a.createdAt || a.date || 0).getTime()
      );
    });

    return rows;
  }, [bookings, statusFilter, serviceFilter, search, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / recordsPerPage)
  );

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return filteredBookings.slice(startIndex, startIndex + recordsPerPage);
  }, [filteredBookings, currentPage, recordsPerPage]);

  const paginationStart =
    filteredBookings.length === 0
      ? 0
      : (currentPage - 1) * recordsPerPage + 1;

  const paginationEnd = Math.min(
    currentPage * recordsPerPage,
    filteredBookings.length
  );

  const visiblePageNumbers = useMemo(() => {
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from(
      { length: end - start + 1 },
      (_, index) => start + index
    );
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, serviceFilter, search, sortBy, recordsPerPage]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const closeProofModal = () => {
    setProofModal((prev) => {
      revokeProofUrl(prev.url);

      return {
        open: false,
        booking: null,
        url: "",
        mimeType: "",
        loading: false,
        error: "",
      };
    });
  };

  const openProof = async (booking) => {
    if (!booking?._id) return;

    const token = getAdminToken();

    if (!token) {
      kickToAdminLogin();
      return;
    }

    setStatus({ type: "", message: "" });

    setProofModal((prev) => {
      revokeProofUrl(prev.url);

      return {
        open: true,
        booking,
        url: "",
        mimeType: "",
        loading: true,
        error: "",
      };
    });

    try {
      const response = await fetch(getProofEndpoint(API_BASE, booking), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        closeProofModal();
        kickToAdminLogin();
        return;
      }

      if (!response.ok) {
        let message = "Failed to load proof of payment.";

        try {
          const data = await response.json();
          message = data.message || message;
        } catch {
          const text = await response.text().catch(() => "");
          message = text || message;
        }

        setProofModal((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));

        return;
      }

      const blob = await response.blob();
      const mimeType =
        response.headers.get("Content-Type") ||
        blob.type ||
        "application/octet-stream";

      const url = URL.createObjectURL(blob);
      registerObjectUrl(url);

      setProofModal((prev) => ({
        ...prev,
        url,
        mimeType,
        loading: false,
        error: "",
      }));
    } catch (error) {
      console.error("openProof error:", error);

      setProofModal((prev) => ({
        ...prev,
        loading: false,
        error: "Network error while loading proof of payment.",
      }));
    }
  };

  const updateStatus = async (booking, nextStatus) => {
    if (!booking?._id) return;

    const token = getAdminToken();

    if (!token) {
      kickToAdminLogin();
      return;
    }

    const busyKey = `${booking.bookingType}:${booking._id}`;
    setBusyId(busyKey);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(getStatusEndpoint(API_BASE, booking), {
        method: "PUT",
        headers: getAdminHeaders(),
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

      await fetchBookings();

      setStatus({
        type: "success",
        message: `${booking.serviceLabel} booking updated successfully.`,
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

  const handleCancel = (booking) => {
    const message =
      booking.status === "PENDING"
        ? "Reject this pending booking? The slot will open again."
        : "Cancel this approved booking? The slot will open again.";

    if (!window.confirm(message)) return;

    updateStatus(booking, "CANCELLED");
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f8fbf9] lg:flex">
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
              const active = path === "/hotel-admin-bookings";

              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => navigate(path)}
                  aria-current={active ? "page" : undefined}
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
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("hotelAdminToken");
              localStorage.removeItem("hotelAdmin");
              navigate("/hotel-admin-login", { replace: true });
            }}
            className="mt-auto min-h-11 rounded-2xl bg-white/10 px-5 text-left text-sm font-bold text-white hover:bg-white/15"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 h-screen w-full overflow-hidden lg:pl-64">
        <div className="h-full w-full overflow-x-hidden overflow-y-auto">
          <div className="min-h-full w-full p-[clamp(18px,2.2vw,28px)] text-[#101828]">
            <style>{`
              @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

              .ltc-bookings-page {
                font-family: "Inter", Arial, sans-serif;
                border-radius: 30px;
                background:
                  radial-gradient(circle at 12% 0%, rgba(215,168,77,.12), transparent 28%),
                  radial-gradient(circle at 92% 12%, rgba(35,95,62,.12), transparent 30%),
                  linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%);
              }

              .ltc-bookings-page * { box-sizing: border-box; }
            `}</style>

            <div className="ltc-bookings-page min-h-full overflow-hidden p-0 sm:p-0">
              <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(8,39,25,0.12)] backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-6">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#D7A84D]">
                    Hotel & Resort Admin
                  </p>
                  <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#082719]">
                    Manage Bookings
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm font-semibold text-black/55">
                    Manage online reservations, payments, proof of payment, and dates reserved for walk-ins or maintenance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={refreshManageBookings}
                  disabled={loading || blockedDatesLoading || packagesLoading}
                  className="h-10 shrink-0 rounded-full bg-gradient-to-br from-[#F4D484] to-[#D7A84D] px-6 text-xs font-extrabold text-[#102418] shadow-[0_16px_35px_rgba(215,168,77,.24)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                >
                  {loading || blockedDatesLoading || packagesLoading ? "REFRESHING..." : "REFRESH"}
                </button>
              </div>

              {status.message ? (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${getStatusBoxClass(
            status.type
          )}`}
        >
          {status.message}
        </div>
      ) : null}

      <section className="relative mb-6 overflow-hidden rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(8,39,25,0.12)] backdrop-blur-xl md:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#082719] via-[#235F3E] to-[#D7A84D]" />

        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#D7A84D]">
              Availability Control
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#082719]">
              Disable Booking Dates
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold text-black/55">
              Disable one specific package and time slot for a walk-in reservation, maintenance, private event, or another offline booking. Morning and night remain independent unless their times overlap. Choose All Day only when the whole date must be unavailable.
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full border border-[#082719]/10 bg-[#F8FBF9] px-4 py-2 text-xs font-extrabold text-[#174A30]">
            {blockedDates.length} disabled slot{blockedDates.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,.9fr)_minmax(0,2.7fr)]">
          <div>
            <label className="mb-2 block text-xs font-bold text-black/60">Service</label>
            <select
              value={blockedDateForm.serviceType}
              onChange={(event) =>
                setBlockedDateForm((current) => ({
                  ...current,
                  serviceType: event.target.value,
                  date: "",
                  packageId: "",
                  timeSlot: "",
                }))
              }
              className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-bold text-[#082719] outline-none focus:ring-2 focus:ring-[#082719]/20"
            >
              {BLOCK_DATE_SERVICES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-[#082719]/10 bg-[#F8FBF9]/80 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-black/45">
                  Booked / Disabled Dates for {getBlockedServiceLabel(blockedDateForm.serviceType)}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-black/45">
                  Select the service first. Dates with reservations are shown here before you choose the date.
                </p>
              </div>
              <span className="rounded-full border border-[#082719]/10 bg-white px-3 py-1 text-[10px] font-extrabold text-[#174A30]">
                {selectedServiceDateGroups.length} date{selectedServiceDateGroups.length === 1 ? "" : "s"}
              </span>
            </div>

            {selectedServiceDateGroups.length === 0 ? (
              <p className="mt-3 text-xs font-semibold text-black/45">
                No upcoming online bookings or manual blocks for this service.
              </p>
            ) : (
              <div className="mt-3 flex max-h-[104px] flex-wrap gap-2 overflow-auto pr-1">
                {selectedServiceDateGroups.map((group) => (
                  <button
                    key={group.date}
                    type="button"
                    onClick={() =>
                      setBlockedDateForm((current) => ({
                        ...current,
                        date: group.date,
                        packageId: "",
                        timeSlot: "",
                      }))
                    }
                    className={`rounded-xl border px-3 py-2 text-left text-[11px] font-bold transition ${
                      blockedDateForm.date === group.date
                        ? "border-[#082719] bg-[#082719] text-white"
                        : "border-[#082719]/10 bg-white text-[#174A30] hover:border-[#D7A84D]"
                    }`}
                    title="Click to inspect this date. Booked time slots will be unavailable below."
                  >
                    <span className="block font-extrabold">{formatDate(group.date)}</span>
                    <span className={`mt-0.5 block ${blockedDateForm.date === group.date ? "text-white/75" : "text-black/45"}`}>
                      {group.booked ? `${group.booked} booked` : ""}
                      {group.booked && group.disabled ? " • " : ""}
                      {group.disabled ? `${group.disabled} disabled` : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-6">
          <div>
            <label className="mb-2 block text-xs font-bold text-black/60">Date</label>
            <input
              type="date"
              min={todayLocalISO()}
              value={blockedDateForm.date}
              onChange={(event) =>
                setBlockedDateForm((current) => ({
                  ...current,
                  date: event.target.value,
                  packageId: "",
                  timeSlot: "",
                }))
              }
              className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-bold text-[#082719] outline-none focus:ring-2 focus:ring-[#082719]/20"
            />
            {blockedDateForm.date && selectedDateServiceEntries.length ? (
              <p className="mt-1 text-[10px] font-bold leading-4 text-amber-700">
                This service already has {selectedDateServiceEntries.length} scheduled item{selectedDateServiceEntries.length === 1 ? "" : "s"} on this date. Occupied package/time slots are blocked below.
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-black/60">Specific Package</label>
            <select
              value={blockedDateForm.packageId}
              disabled={!blockedDateForm.date || packagesLoading}
              onChange={(event) =>
                setBlockedDateForm((current) => ({
                  ...current,
                  packageId: event.target.value,
                  timeSlot: "",
                }))
              }
              className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-bold text-[#082719] outline-none focus:ring-2 focus:ring-[#082719]/20 disabled:opacity-60"
            >
              <option value="">
                {packagesLoading
                  ? "Loading packages..."
                  : !blockedDateForm.date
                  ? "Choose date first"
                  : blockablePackages.length
                  ? "Select specific package"
                  : "No active packages"}
              </option>
              {blockablePackages.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-black/60">Time Slot</label>
            <select
              value={blockedDateForm.timeSlot}
              disabled={!blockedDateForm.packageId || packagesLoading}
              onChange={(event) =>
                setBlockedDateForm((current) => ({
                  ...current,
                  timeSlot: event.target.value,
                }))
              }
              className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-bold text-[#082719] outline-none focus:ring-2 focus:ring-[#082719]/20 disabled:opacity-60"
            >
              <option value="">Select available time slot</option>
              <option value="ALL_DAY" disabled={Boolean(allDayConflict)}>
                {allDayConflict
                  ? `All Day — ${allDayConflict.kind === "BOOKED" ? "BOOKED" : "DISABLED"}`
                  : "All Day (block every time)"}
              </option>
              {timeSlotOptions.map(({ slot, conflict }) => (
                <option key={slot} value={slot} disabled={Boolean(conflict)}>
                  {conflict
                    ? `${slot} — ${conflict.kind === "BOOKED" ? "BOOKED" : "DISABLED"}`
                    : slot}
                </option>
              ))}
            </select>
            {selectedTimeConflict ? (
              <p className="mt-1 text-[10px] font-bold leading-4 text-rose-700">
                {selectedTimeConflict.label} ({selectedTimeConflict.detail})
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-black/60">Reason</label>
            <select
              value={blockedDateForm.reason}
              onChange={(event) =>
                setBlockedDateForm((current) => ({ ...current, reason: event.target.value }))
              }
              className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-bold text-[#082719] outline-none focus:ring-2 focus:ring-[#082719]/20"
            >
              {BLOCK_DATE_REASONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-black/60">Note (optional)</label>
            <input
              value={blockedDateForm.note}
              maxLength={500}
              onChange={(event) =>
                setBlockedDateForm((current) => ({ ...current, note: event.target.value }))
              }
              placeholder="e.g. Walk-in guest / pool maintenance"
              className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#082719]/20"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={disableBookingDate}
              disabled={
                !blockedDateForm.serviceType ||
                !blockedDateForm.date ||
                !blockedDateForm.packageId ||
                !blockedDateForm.timeSlot ||
                Boolean(selectedTimeConflict) ||
                blockedDateBusyId === "CREATE"
              }
              className="h-11 w-full rounded-2xl bg-[#082719] px-5 text-xs font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#174A30] disabled:translate-y-0 disabled:opacity-50"
            >
              {blockedDateBusyId === "CREATE" ? "DISABLING..." : "DISABLE SLOT"}
            </button>
          </div>
        </div>

        <div className="mt-5 border-t border-[#082719]/10 pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/50">
              Manually Disabled Slots
            </p>
          </div>

          {blockedDatesLoading ? (
            <div className="rounded-2xl bg-[#F8FBF9] px-4 py-5 text-sm font-semibold text-black/50">
              Loading disabled dates...
            </div>
          ) : blockedDates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#082719]/15 bg-[#F8FBF9]/70 px-4 py-5 text-sm font-semibold text-black/50">
              No future package/time slots are manually disabled.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {blockedDates.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-[#082719]/10 bg-[#F8FBF9] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black tracking-[-0.03em] text-[#082719]">
                        {formatDate(item.date)}
                      </p>
                      <p className="mt-1 text-xs font-extrabold text-[#174A30]">
                        {getBlockedServiceLabel(item.serviceType)}
                      </p>
                      <p className="mt-1 text-sm font-black text-[#082719]">
                        {item.packageTitle || "Specific package"}
                      </p>
                      <p className="mt-2 text-xs font-extrabold text-[#7A5A13]">
                        {getBlockedTimeLabel(item.timeSlot)}
                      </p>
                    </div>

                    <span className="rounded-full border border-[#D7A84D]/50 bg-[#FFF7DC] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#7A5A13]">
                      {getBlockedReasonLabel(item.reason)}
                    </span>
                  </div>

                  {item.note ? (
                    <p className="mt-3 text-xs font-semibold leading-5 text-black/55">
                      {item.note}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    disabled={blockedDateBusyId === String(item._id)}
                    onClick={() => enableBookingDate(item)}
                    className="mt-4 h-9 w-full rounded-full border border-[#235F3E] bg-white text-xs font-extrabold text-[#174A30] transition hover:bg-[#235F3E] hover:text-white disabled:opacity-50"
                  >
                    {blockedDateBusyId === String(item._id) ? "ENABLING..." : "ENABLE SLOT"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-[#082719]/10 pt-5">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/50">
                Upcoming Disabled / Booked Schedule
              </p>
              <p className="mt-1 text-xs font-semibold text-black/45">
                Manual blocks and pending/confirmed online bookings are shown together with their exact time.
              </p>
            </div>
            <span className="w-fit rounded-full border border-[#082719]/10 bg-white px-3 py-1 text-[11px] font-extrabold text-[#174A30]">
              {upcomingScheduleEntries.length} upcoming
            </span>
          </div>

          {upcomingScheduleEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#082719]/15 bg-[#F8FBF9]/70 px-4 py-5 text-sm font-semibold text-black/50">
              No upcoming disabled slots or active bookings.
            </div>
          ) : (
            <div className="max-h-[430px] overflow-auto rounded-2xl border border-[#082719]/10 bg-white">
              <table className="w-full min-w-[860px] text-left text-xs">
                <thead className="sticky top-0 bg-[#F6F3EA] text-black/55">
                  <tr>
                    <th className="px-4 py-3 font-extrabold uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 font-extrabold uppercase tracking-wide">Time</th>
                    <th className="px-4 py-3 font-extrabold uppercase tracking-wide">Service</th>
                    <th className="px-4 py-3 font-extrabold uppercase tracking-wide">Package</th>
                    <th className="px-4 py-3 font-extrabold uppercase tracking-wide">Source / Guest</th>
                    <th className="px-4 py-3 font-extrabold uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingScheduleEntries.map((entry) => (
                    <tr key={entry.key} className="border-t border-[#082719]/10">
                      <td className="px-4 py-3 font-extrabold text-[#082719]">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3 font-bold text-[#174A30]">{entry.time}</td>
                      <td className="px-4 py-3 font-bold">{entry.serviceLabel}</td>
                      <td className="px-4 py-3">
                        <p className="font-extrabold text-[#082719]">{entry.packageTitle}</p>
                        {entry.note ? <p className="mt-1 text-[11px] font-semibold text-black/45">{entry.note}</p> : null}
                      </td>
                      <td className="px-4 py-3 font-semibold text-black/60">
                        {entry.kind === "MANUAL" ? `Manual: ${entry.detail}` : entry.detail}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold ${
                          entry.kind === "MANUAL"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : entry.status === "CONFIRMED"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-sky-200 bg-sky-50 text-sky-700"
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="All Bookings" value={counts.total} />
        <StatCard label="Pending" value={counts.PENDING} />
        <StatCard label="Confirmed" value={counts.CONFIRMED} />
        <StatCard label="Cancelled" value={counts.CANCELLED} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          label="Downpayment Bookings"
          value={counts.downPaymentBookings}
          helper="Partial payments"
        />
        <StatCard
          label="Full Payment Bookings"
          value={counts.fullPaymentBookings}
          helper="Fully paid bookings"
        />
        <StatCard
          label="Total Paid / Collected"
          value={formatPeso(counts.totalPaid)}
          helper="Amount paid by guests"
        />
        <StatCard
          label="Remaining Balance"
          value={formatPeso(counts.totalBalance)}
          helper="Unpaid balance"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Resort & Venue" value={counts.resort} />
        <StatCard label="Event Package" value={counts.event} />
        <StatCard label="Hotel & Condo" value={counts.hotel_room} />
      </div>

      <div className="relative mt-6 overflow-hidden rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(8,39,25,0.12)] backdrop-blur-xl md:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#082719] via-[#235F3E] to-[#D7A84D]" />
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/50">
            Filter by booking status
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {STATUS_FILTERS.map((item) => (
              <FilterButton
                key={item.id}
                label={item.label}
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
              placeholder="Search customer, email, service, package, payment, downpayment, balance..."
              className="h-10 w-full rounded-full border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#082719]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-black/60">
              Sort
            </label>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-10 w-full rounded-full border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#082719]/20"
            >
              <option value="Recent">Recent</option>
              <option value="Oldest">Oldest</option>
              <option value="PriceHigh">Total High to Low</option>
              <option value="PriceLow">Total Low to High</option>
              <option value="PaidHigh">Paid High to Low</option>
              <option value="BalanceHigh">Balance High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_18px_45px_rgba(8,39,25,0.12)] backdrop-blur-xl">
        <div className="h-1.5 bg-gradient-to-r from-[#082719] via-[#235F3E] to-[#D7A84D]" />

        <div className="flex flex-col gap-2 border-b border-[#082719]/10 bg-[#F8FBF9]/90 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#D7A84D]">
              Booking Records
            </p>
            <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#082719]">
              Reservation Payments
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-full border border-[#082719]/10 bg-white px-3 py-2 text-xs font-bold text-black/55 shadow-sm">
              <span>Rows</span>
              <select
                value={recordsPerPage}
                onChange={(event) => setRecordsPerPage(Number(event.target.value))}
                className="bg-transparent font-extrabold text-[#174A30] outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>

            <p className="rounded-full border border-[#082719]/10 bg-white px-4 py-2 text-xs font-extrabold text-[#174A30] shadow-sm">
              {filteredBookings.length} record{filteredBookings.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto bg-white/70">
          <table className="w-full min-w-[1380px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-[#F6F3EA] text-left">
                <Th>Service</Th>
                <Th>User</Th>
                <Th>Booking</Th>
                <Th>Date</Th>
                <Th>Time</Th>
                <Th>Pax</Th>
                <Th>Method</Th>
                <Th>Payment</Th>
                <Th>Paid</Th>
                <Th>Balance</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#082719]/5">
              {loading ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-black/50">
                    Loading user bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-black/50">
                    <p className="font-bold text-[#082719]">
                      No bookings found.
                    </p>
                    <p className="mt-1 text-xs">
                      Try clicking Refresh, clearing filters, or checking if the
                      booking was saved in the database.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => {
                  const busy =
                    busyId === `${booking.bookingType}:${booking._id}`;

                  return (
                    <tr key={`${booking.bookingType}-${booking._id}`} className="group transition hover:bg-[#F8FBF9]">
                      <Td>
                        <span
                          className={getServiceBadgeClass(booking.bookingType)}
                        >
                          {booking.serviceLabel}
                        </span>
                      </Td>

                      <Td>
                        <p className="font-extrabold text-[#082719]">
                          {booking.customerName}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-black/55">
                          {booking.email || "—"}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-black/55">
                          {booking.phone || "—"}
                        </p>
                      </Td>

                      <Td>
                        <p className="font-extrabold text-black/75">
                          {booking.title}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-black/50">
                          {booking.category || "—"}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-black/50">
                          {booking.location || "—"}
                        </p>
                      </Td>

                      <Td>{formatDate(booking.date)}</Td>
                      <Td>{booking.time || "—"}</Td>
                      <Td>{booking.pax || "—"}</Td>
                      <Td>{booking.paymentMethod || "—"}</Td>

                      <Td>
                        <span className={getPaymentChipClass(booking.paymentTerm)}>
                          {booking.paymentTermLabel}
                        </span>
                      </Td>

                      <Td className="font-extrabold text-[#082719]">
                        {formatPeso(booking.paidAmount)}
                      </Td>

                      <Td
                        className={`font-extrabold ${
                          Number(booking.balanceAmount || 0) > 0
                            ? "text-amber-700"
                            : "text-[#082719]"
                        }`}
                      >
                        {formatPeso(booking.balanceAmount)}
                      </Td>

                      <Td className="font-extrabold text-[#082719]">
                        {formatPeso(booking.totalAmount)}
                      </Td>

                      <Td>
                        <span className={getStatusChipClass(booking.status)}>
                          {booking.status}
                        </span>
                      </Td>

                      <Td className="text-right">
                        <div className="flex flex-col items-end justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openProof(booking)}
                            className="inline-flex h-10 w-[96px] items-center justify-center rounded-full border border-[#D7A84D]/70 bg-white text-xs font-extrabold text-[#082719] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#FFF7DC] hover:shadow-md"
                          >
                            Proof
                          </button>

                          {booking.status === "PENDING" ? (
                            <>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  updateStatus(booking, "CONFIRMED")
                                }
                                className="inline-flex h-10 w-[96px] items-center justify-center rounded-full border border-[#235F3E] bg-[#235F3E] text-xs font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#174A30] hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
                              >
                                {busy ? "Saving..." : "Approve"}
                              </button>

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleCancel(booking)}
                                className="inline-flex h-10 w-[96px] items-center justify-center rounded-full border border-[#D7A84D] bg-[#D7A84D] text-xs font-extrabold text-[#082719] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F4D484] hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
                              >
                                {busy ? "Saving..." : "Reject"}
                              </button>
                            </>
                          ) : null}

                          {booking.status === "CONFIRMED" ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleCancel(booking)}
                              className="inline-flex h-10 w-[96px] items-center justify-center rounded-full border border-[#D7A84D] bg-[#D7A84D] text-xs font-extrabold text-[#082719] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F4D484] hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
                            >
                              {busy ? "Saving..." : "Cancel"}
                            </button>
                          ) : null}
                        </div>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredBookings.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-[#082719]/10 bg-[#F8FBF9]/85 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold text-black/50">
              Showing{" "}
              <span className="font-extrabold text-[#082719]">
                {paginationStart}-{paginationEnd}
              </span>{" "}
              of{" "}
              <span className="font-extrabold text-[#082719]">
                {filteredBookings.length}
              </span>{" "}
              records
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="h-9 rounded-full border border-[#082719]/15 bg-white px-4 text-xs font-extrabold text-[#174A30] transition hover:border-[#082719]/35 hover:bg-[#082719] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#174A30]"
              >
                Previous
              </button>

              {visiblePageNumbers[0] > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    className="h-9 min-w-9 rounded-full border border-[#082719]/15 bg-white px-3 text-xs font-extrabold text-[#174A30] transition hover:border-[#082719]/35 hover:bg-[#082719] hover:text-white"
                  >
                    1
                  </button>
                  {visiblePageNumbers[0] > 2 ? (
                    <span className="px-1 text-xs font-bold text-black/35">...</span>
                  ) : null}
                </>
              ) : null}

              {visiblePageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  aria-current={currentPage === page ? "page" : undefined}
                  className={`h-9 min-w-9 rounded-full border px-3 text-xs font-extrabold transition ${
                    currentPage === page
                      ? "border-[#082719] bg-[#082719] text-white"
                      : "border-[#082719]/15 bg-white text-[#174A30] hover:border-[#082719]/35 hover:bg-[#082719] hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}

              {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages ? (
                <>
                  {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages - 1 ? (
                    <span className="px-1 text-xs font-bold text-black/35">...</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    className="h-9 min-w-9 rounded-full border border-[#082719]/15 bg-white px-3 text-xs font-extrabold text-[#174A30] transition hover:border-[#082719]/35 hover:bg-[#082719] hover:text-white"
                  >
                    {totalPages}
                  </button>
                </>
              ) : null}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="h-9 rounded-full border border-[#082719]/15 bg-white px-4 text-xs font-extrabold text-[#174A30] transition hover:border-[#082719]/35 hover:bg-[#082719] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#174A30]"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

              {proofModal.open ? (
                <ProofPreviewModal
                  booking={proofModal.booking}
                  url={proofModal.url}
                  mimeType={proofModal.mimeType}
                  loading={proofModal.loading}
                  error={proofModal.error}
                  onClose={closeProofModal}
                />
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

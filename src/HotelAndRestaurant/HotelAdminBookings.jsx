// HotelAdminBookings.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelAdminShell from "./HotelAdminShell";

const GREEN_DARK = "#082719";
const GREEN_SOFT = "#174A30";
const GOLD = "#D7A84D";
const CARD_BG = "#F8FBF9";

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

function getProofEndpoint(apiBase, booking) {
  if (booking.bookingType === "resort") {
    return `${apiBase}/admin/resort-bookings/${booking._id}/proof`;
  }

  if (booking.bookingType === "event") {
    return `${apiBase}/admin/event-bookings/${booking._id}/proof`;
  }

  return `${apiBase}/admin/hotel-room-bookings/${booking._id}/proof`;
}

function getStatusEndpoint(apiBase, booking) {
  if (booking.bookingType === "resort") {
    return `${apiBase}/admin/resort-bookings/${booking._id}/status`;
  }

  if (booking.bookingType === "event") {
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
    booking.downPaymentAmount,
    booking.downpaymentAmount,
    booking.downPayment,
    booking.downpayment,
    booking.depositAmount,
    booking.deposit,
    booking.payment?.paidAmount,
    booking.payment?.amountToPay,
    booking.payment?.downPaymentAmount,
    raw.paidAmount,
    raw.amountToPay,
    raw.downPaymentAmount,
    raw.downpaymentAmount,
    raw.downPayment,
    raw.downpayment,
    raw.depositAmount,
    raw.deposit,
    raw.payment?.paidAmount,
    raw.payment?.amountToPay,
    raw.payment?.downPaymentAmount
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

  const explicitPaymentTermRaw = firstDefinedValue(
    booking.paymentTerm,
    booking.paymentType,
    booking.paymentStatus,
    booking.payment?.paymentTerm,
    raw.paymentTerm,
    raw.paymentType,
    raw.paymentStatus,
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

  /*
    IMPORTANT FIX:
    Older records in your database may only have paymentMethod + totalAmount.
    Your summary pages submit amountToPay / paidAmount / balanceAmount / paymentTerm,
    but if the backend model/controller did not save those fields yet, the admin page
    receives no downpayment info. In that case, show the expected 50/50 downpayment
    instead of "Not recorded".
  */
  if (totalAmount > 0 && !paymentTerm && paidAmount <= 0 && balanceAmount <= 0) {
    paymentTerm = "DOWN_PAYMENT";
    paidAmount = Math.ceil(totalAmount / 2);
    balanceAmount = Math.max(0, totalAmount - paidAmount);
    isPaymentInferred = true;
  }

  if (totalAmount > 0 && paymentTerm === "DOWN_PAYMENT" && paidAmount <= 0) {
    paidAmount = Math.ceil(totalAmount / 2);
    balanceAmount = Math.max(0, totalAmount - paidAmount);
    isPaymentInferred = true;
  }

  if (totalAmount > 0 && paymentTerm === "FULL_PAYMENT" && paidAmount <= 0) {
    paidAmount = totalAmount;
    balanceAmount = 0;
    isPaymentInferred = true;
  }

  if (totalAmount > 0 && paidAmount > 0 && balanceAmount <= 0) {
    balanceAmount = Math.max(0, totalAmount - paidAmount);
  }

  if (!paymentTerm) {
    paymentTerm = normalizePaymentTerm("", paidAmount, totalAmount);
  }

  return {
    paymentTerm,
    paymentTermLabel: getPaymentTermLabel(paymentTerm),
    paidAmount,
    amountToPay: paidAmount,
    balanceAmount,
    totalAmount,
    isPaymentInferred,
  };
}

function normalizeBooking(booking = {}, fallbackType = "") {
  const raw = booking.raw || booking;
  const bookingType = booking.bookingType || fallbackType || "resort";

  if (bookingType === "event") {
    const normalized = {
      _id: String(booking._id || booking.id || ""),
      bookingType: "event",
      serviceLabel: booking.serviceLabel || "Event Package",
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
      serviceLabel: booking.serviceLabel || "Hotel & Condo",
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
    serviceLabel: booking.serviceLabel || "Resort & Venue",
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

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [bookings, setBookings] = useState([]);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Recent");

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

  const fetchJson = async (url) => {
    const response = await fetch(url, {
      method: "GET",
      headers: getAdminHeaders(),
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

  const fetchBookings = async () => {
    const token = getAdminToken();

    if (!token) {
      kickToAdminLogin();
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const combined = await fetchJson(`${API_BASE}/admin/bookings`);

      if (combined.authFailed) return;

      let loadedBookings = [];

      if (combined.ok) {
        loadedBookings = extractBookings(combined.data);
      }

      if (!loadedBookings.length) {
        const [resortResult, eventResult, hotelResult] = await Promise.all([
          fetchJson(`${API_BASE}/admin/resort-bookings`),
          fetchJson(`${API_BASE}/admin/event-bookings`),
          fetchJson(`${API_BASE}/admin/hotel-room-bookings`),
        ]);

        if (
          resortResult.authFailed ||
          eventResult.authFailed ||
          hotelResult.authFailed
        ) {
          return;
        }

        const resortBookings = resortResult.ok
          ? extractBookings(resortResult.data, "resort")
          : [];

        const eventBookings = eventResult.ok
          ? extractBookings(eventResult.data, "event")
          : [];

        const hotelBookings = hotelResult.ok
          ? extractBookings(hotelResult.data, "hotel_room")
          : [];

        loadedBookings = [
          ...resortBookings,
          ...eventBookings,
          ...hotelBookings,
        ];
      }

      const normalized = uniqueBookings(loadedBookings)
        .filter((item) => item._id)
        .sort((a, b) => {
          const bTime = new Date(b.createdAt || b.date || 0).getTime();
          const aTime = new Date(a.createdAt || a.date || 0).getTime();
          return bTime - aTime;
        });

      setBookings(normalized);

      if (!normalized.length) {
        setStatus({
          type: "warning",
          message:
            "No bookings found. If a user already submitted a booking, check MongoDB and confirm the booking was saved successfully.",
        });
      }
    } catch (error) {
      console.error("fetchBookings error:", error);

      setBookings([]);
      setStatus({
        type: "error",
        message:
          "Network error while loading bookings. Make sure backend is running and VITE_API_URL is http://localhost:5000.",
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
    <HotelAdminShell
      title="Manage Bookings"
      subtitle="View payment terms, downpayments, balances, and proof of payment for all bookings."
      activePage="bookings"
      maxWidth="max-w-7xl"
      actions={
        <button
          type="button"
          onClick={fetchBookings}
          disabled={loading}
          className="h-10 rounded-2xl bg-[#082719] px-5 text-xs font-extrabold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
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

          <p className="rounded-full border border-[#082719]/10 bg-white px-4 py-2 text-xs font-extrabold text-[#174A30] shadow-sm">
            {filteredBookings.length} record{filteredBookings.length === 1 ? "" : "s"}
          </p>
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
                filteredBookings.map((booking) => {
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
    </HotelAdminShell>
  );
}

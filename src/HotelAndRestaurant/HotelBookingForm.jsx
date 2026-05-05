import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BOOKING_GAP_MINUTES = 60;
const BOOKING_GAP_MS = BOOKING_GAP_MINUTES * 60 * 1000;

const HOTEL_TIME_SLOTS_BY_DURATION = {
  "8 Hours": [
    "Daytime: 6:00 AM - 2:00 PM",
    "Daytime: 7:00 AM - 3:00 PM",
    "Daytime: 8:00 AM - 4:00 PM",
    "Daytime: 9:00 AM - 5:00 PM",
    "Daytime: 10:00 AM - 6:00 PM",
    "Daytime: 11:00 AM - 7:00 PM",
    "Daytime: 12:00 PM - 8:00 PM",
    "Nighttime: 3:00 PM - 11:00 PM",
    "Nighttime: 4:00 PM - 12:00 AM",
    "Nighttime: 5:00 PM - 1:00 AM next day",
    "Nighttime: 6:00 PM - 2:00 AM next day",
    "Nighttime: 7:00 PM - 3:00 AM next day",
    "Nighttime: 8:00 PM - 4:00 AM next day",
    "Nighttime: 9:00 PM - 5:00 AM next day",
  ],

  "12 Hours": [
    "7:00 AM - 7:00 PM",
    "8:00 AM - 8:00 PM",
    "9:00 AM - 9:00 PM",
    "10:00 AM - 10:00 PM",
    "11:00 AM - 11:00 PM",
    "12:00 PM - 12:00 AM",
    "1:00 PM - 1:00 AM next day",
    "2:00 PM - 2:00 AM next day",
    "3:00 PM - 3:00 AM next day",
    "4:00 PM - 4:00 AM next day",
    "5:00 PM - 5:00 AM next day",
  ],

  "22 Hours": [
    "6:00 AM - 4:00 AM next day",
    "7:00 AM - 5:00 AM next day",
    "8:00 AM - 6:00 AM next day",
  ],
};

const DEFAULT_HOTEL_PACKAGES = [
  {
    _id: "legacy-hotel-nature-8",
    title: "Nature Room - 8 Hours",
    duration: "8 Hours",
    price: 700,
    capacity: "5 pax max",
    displayOrder: 1,
    isActive: true,
    inclusions: ["Nature room", "8 hours stay", "5 pax max"],
  },
  {
    _id: "legacy-hotel-simple-8",
    title: "Simple Room - 8 Hours",
    duration: "8 Hours",
    price: 1500,
    capacity: "3 pax max",
    displayOrder: 2,
    isActive: true,
    inclusions: ["Simple room", "8 hours stay", "3 pax max"],
  },
  {
    _id: "legacy-hotel-nature-12",
    title: "Nature Room - 12 Hours",
    duration: "12 Hours",
    price: 1000,
    capacity: "5 pax max",
    displayOrder: 3,
    isActive: true,
    inclusions: ["Nature room", "12 hours stay", "5 pax max"],
  },
  {
    _id: "legacy-hotel-simple-12",
    title: "Simple Room - 12 Hours",
    duration: "12 Hours",
    price: 2000,
    capacity: "3 pax max",
    displayOrder: 4,
    isActive: true,
    inclusions: ["Simple room", "12 hours stay", "3 pax max"],
  },
  {
    _id: "legacy-hotel-nature-22",
    title: "Nature Room - 22 Hours",
    duration: "22 Hours",
    price: 1500,
    capacity: "5 pax max",
    displayOrder: 5,
    isActive: true,
    inclusions: ["Nature room", "22 hours stay", "5 pax max"],
  },
  {
    _id: "legacy-hotel-simple-22",
    title: "Simple Room - 22 Hours",
    duration: "22 Hours",
    price: 2500,
    capacity: "3 pax max",
    displayOrder: 6,
    isActive: true,
    inclusions: ["Simple room", "22 hours stay", "3 pax max"],
  },
];

const COLORS = {
  green: "#3f5b44",
  greenDark: "#2f4d36",
  border: "rgba(63, 91, 68, 0.35)",
  bg: "#ffffff",
  fieldBg: "rgba(255,255,255,0.55)",
};

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

function normalizeRoomType(title = "") {
  const lower = String(title || "").toLowerCase();

  if (lower.includes("nature")) return "Nature";
  if (lower.includes("simple")) return "Simple";

  return (
    String(title || "Room")
      .replace(/\s*-\s*\d+\s*hours?/i, "")
      .replace(/\s+\d+\s*hours?/i, "")
      .trim() || "Room"
  );
}

function normalizeDuration(value = "") {
  const text = String(value || "").toLowerCase();

  if (text.includes("8")) return "8 Hours";
  if (text.includes("12")) return "12 Hours";
  if (text.includes("22")) return "22 Hours";

  return String(value || "").trim();
}

function parseMaxPax(capacity = "") {
  const matches = String(capacity || "").match(/\d+/g);
  if (!matches || !matches.length) return null;

  const numbers = matches
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);

  if (!numbers.length) return null;

  return Math.max(...numbers);
}

function formatPeso(value) {
  const num = Number(value || 0);
  if (!num) return "—";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(num);
}

function toLocalISO(dateObj) {
  if (!dateObj) return "";

  const tz = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - tz).toISOString().slice(0, 10);
}


const SEASONAL_MARKUP_PERCENT = 10;
const WEEKEND_MARKUP_PERCENT = 5;
const MONTHLY_BOOKING_MARKUP_PERCENT = 1;

function getDatePartsFromISO(dateString = "") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateString || ""))) {
    return null;
  }

  const [year, month, day] = String(dateString).split("-").map(Number);

  if (!year || !month || !day) return null;

  return { year, month, day };
}

function getMonthKey(dateString = "") {
  const parts = getDatePartsFromISO(dateString);
  if (!parts) return "";

  return `${parts.year}-${String(parts.month).padStart(2, "0")}`;
}

function isJuneOrBerMonth(dateString = "") {
  const parts = getDatePartsFromISO(dateString);
  if (!parts) return false;

  return parts.month === 6 || parts.month >= 9;
}

function isWeekendDate(dateString = "") {
  const parts = getDatePartsFromISO(dateString);
  if (!parts) return false;

  const date = new Date(parts.year, parts.month - 1, parts.day);
  const day = date.getDay();

  return day === 0 || day === 6;
}

function countSameMonthBookings(bookings = [], dateString = "") {
  const targetMonth = getMonthKey(dateString);
  if (!targetMonth) return 0;

  return bookings.filter((booking) => {
    const status = String(booking?.status || "CONFIRMED").toUpperCase();
    if (status && status !== "CONFIRMED") return false;

    return getMonthKey(booking?.date) === targetMonth;
  }).length;
}

function calculateDynamicPrice({ basePrice = 0, date = "", monthlyBookingCount = 0 }) {
  const safeBasePrice = Number(basePrice || 0);
  const safeMonthlyCount = Math.max(0, Number(monthlyBookingCount || 0));

  const seasonalIncreasePercent = isJuneOrBerMonth(date)
    ? SEASONAL_MARKUP_PERCENT
    : 0;
  const weekendIncreasePercent = isWeekendDate(date)
    ? WEEKEND_MARKUP_PERCENT
    : 0;
  const monthlyBookingIncreasePercent = safeMonthlyCount * MONTHLY_BOOKING_MARKUP_PERCENT;
  const totalIncreasePercent =
    seasonalIncreasePercent + weekendIncreasePercent + monthlyBookingIncreasePercent;

  return {
    basePrice: safeBasePrice,
    finalPrice: safeBasePrice
      ? Math.round(safeBasePrice * (1 + totalIncreasePercent / 100))
      : 0,
    hasDate: Boolean(getDatePartsFromISO(date)),
    seasonalIncreasePercent,
    weekendIncreasePercent,
    monthlyBookingIncreasePercent,
    monthlyBookingCount: safeMonthlyCount,
    totalIncreasePercent,
    isSeasonalRate: seasonalIncreasePercent > 0,
    isWeekendRate: weekendIncreasePercent > 0,
  };
}

function PricingBreakdown({ pricing }) {
  if (!pricing?.basePrice) return null;

  const hasSelectedDate = Boolean(pricing.hasDate);

  return (
    <div className="mt-6 rounded-2xl border border-[#3f5b44]/20 bg-white p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-[#3f5b44]">Dynamic Price</p>
          <p className="mt-1 text-xs font-semibold text-white/75">
            June and Ber months add 10%, weekends add 5%, and every confirmed booking in the same month adds 1%.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs font-bold text-black/45">Total Amount</p>
          <p className="text-2xl font-extrabold text-[#3f5b44]">
            {formatPeso(pricing.finalPrice)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl bg-[#3f5b44]/10 px-4 py-3">
          <p className="text-[11px] font-bold uppercase text-[#3f5b44]/70">Base Price</p>
          <p className="mt-1 text-sm font-extrabold text-[#3f5b44]">
            {formatPeso(pricing.basePrice)}
          </p>
        </div>

        <div className="rounded-2xl bg-[#3f5b44]/10 px-4 py-3">
          <p className="text-[11px] font-bold uppercase text-[#3f5b44]/70">Seasonal</p>
          <p className="mt-1 text-sm font-extrabold text-[#3f5b44]">
            +{pricing.seasonalIncreasePercent}%
          </p>
        </div>

        <div className="rounded-2xl bg-[#3f5b44]/10 px-4 py-3">
          <p className="text-[11px] font-bold uppercase text-[#3f5b44]/70">Weekend</p>
          <p className="mt-1 text-sm font-extrabold text-[#3f5b44]">
            +{pricing.weekendIncreasePercent}%
          </p>
        </div>

        <div className="rounded-2xl bg-[#3f5b44]/10 px-4 py-3">
          <p className="text-[11px] font-bold uppercase text-[#3f5b44]/70">Monthly Demand</p>
          <p className="mt-1 text-sm font-extrabold text-[#3f5b44]">
            +{pricing.monthlyBookingIncreasePercent}%
          </p>
        </div>

        <div className="rounded-2xl bg-[#3f5b44]/10 px-4 py-3">
          <p className="text-[11px] font-bold uppercase text-[#3f5b44]/70">Total Increase</p>
          <p className="mt-1 text-sm font-extrabold text-[#3f5b44]">
            +{pricing.totalIncreasePercent}%
          </p>
        </div>
      </div>

      {!hasSelectedDate ? (
        <p className="mt-3 text-xs font-semibold text-black/50">
          Select a date to see seasonal and weekend adjustments.
        </p>
      ) : null}
    </div>
  );
}


function isoToLocalDateObj(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function parseTimeToMinutes(value = "") {
  const clean = String(value)
    .replace(/next day/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (hour === 12) hour = 0;
  if (meridiem === "PM") hour += 12;

  return hour * 60 + minute;
}

function stripTimePrefix(value = "") {
  return String(value || "")
    .replace(/^daytime:\s*/i, "")
    .replace(/^nighttime:\s*/i, "")
    .replace(/^overnight:\s*/i, "")
    .replace(/^8 hours:\s*/i, "")
    .replace(/^12 hours:\s*/i, "")
    .replace(/^22 hours:\s*/i, "")
    .replace(/^full-day:\s*/i, "")
    .trim();
}

function parseTimeRange(value = "") {
  const clean = stripTimePrefix(value);
  const parts = clean.split(/\s*-\s*/);

  if (parts.length !== 2) return null;

  const startMinutes = parseTimeToMinutes(parts[0]);
  let endMinutes = parseTimeToMinutes(parts[1]);

  if (startMinutes === null || endMinutes === null) return null;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return {
    startMinutes,
    endMinutes,
  };
}

function dateToPhMidnight(dateString) {
  return new Date(`${dateString}T00:00:00+08:00`);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function buildInterval(date, time) {
  const range = parseTimeRange(time);

  if (!range) return null;

  const base = dateToPhMidnight(date);

  return {
    startDateTime: addMinutes(base, range.startMinutes),
    endDateTime: addMinutes(base, range.endMinutes),
  };
}

function intervalsOverlap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart < bEnd + BOOKING_GAP_MS && bStart < aEnd + BOOKING_GAP_MS;
}

function getDurationOrder(duration = "") {
  const normalized = normalizeDuration(duration);
  if (normalized === "8 Hours") return 1;
  if (normalized === "12 Hours") return 2;
  if (normalized === "22 Hours") return 3;
  return 99;
}

function normalizePackage(pkg = {}) {
  return {
    ...pkg,
    duration: normalizeDuration(pkg.duration),
    roomType: normalizeRoomType(pkg.title),
    maxPax: parseMaxPax(pkg.capacity),
    timeSlots:
      Array.isArray(pkg.timeSlots) && pkg.timeSlots.length
        ? pkg.timeSlots
        : HOTEL_TIME_SLOTS_BY_DURATION[normalizeDuration(pkg.duration)] || [],
  };
}

function expandHotelPackages(list = []) {
  const expanded = [];

  list.forEach((pkg) => {
    const activeVariants = Array.isArray(pkg.variants)
      ? pkg.variants.filter((variant) => variant?.isActive !== false)
      : [];

    if (activeVariants.length) {
      activeVariants.forEach((variant, index) => {
        const duration = normalizeDuration(variant.label);
        const timeSlots =
          Array.isArray(variant.timeSlots) && variant.timeSlots.length
            ? variant.timeSlots
            : HOTEL_TIME_SLOTS_BY_DURATION[duration] || [];

        expanded.push(
          normalizePackage({
            ...pkg,
            _id: pkg._id,
            variantId: variant._id || `${pkg._id}-${duration}`,
            title: pkg.title,
            duration,
            price: Number(variant.price || 0),
            displayOrder:
              Number(pkg.displayOrder || 0) * 100 +
              Number(variant.displayOrder || index + 1),
            timeSlots,
          })
        );
      });

      return;
    }

    expanded.push(normalizePackage(pkg));
  });

  return expanded;
}

export default function HotelBookingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = useMemo(() => getApiBase(), []);
  const presetAppliedRef = useRef(false);

  const presetPackageId = location.state?.selectedPackageId || "";
  const presetPackageTitle =
    location.state?.selectedPackage ||
    location.state?.selectedPackageTitle ||
    "";

  const presetRoomType = normalizeRoomType(
    location.state?.selectedRoomType || presetPackageTitle
  );

  const presetDuration = normalizeDuration(location.state?.selectedDuration || "");

  const [packages, setPackages] = useState(
    expandHotelPackages(DEFAULT_HOTEL_PACKAGES)
  );
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceType: "Hotel & Condo",
    packageId: presetPackageId,
    packageTitle: presetPackageTitle,
    roomType: presetRoomType,
    duration: presetDuration,
    date: "",
    time: "",
    pax: "",
  });

  const todayLocalISO = useMemo(() => toLocalISO(new Date()), []);

  const oneYearAheadISO = useMemo(() => {
    const d = isoToLocalDateObj(todayLocalISO);
    d.setDate(d.getDate() + 365);
    return toLocalISO(d);
  }, [todayLocalISO]);

  const selectedDateObj = useMemo(() => isoToLocalDateObj(form.date), [form.date]);
  const minDateObj = useMemo(() => isoToLocalDateObj(todayLocalISO), [todayLocalISO]);

  const roomTypeOptions = useMemo(() => {
    return [
      ...new Set(
        packages
          .filter((item) => item?.isActive !== false)
          .map((item) => normalizeRoomType(item.title))
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [packages]);

  const roomPackages = useMemo(() => {
    return packages
      .filter((item) => item?.isActive !== false)
      .map(normalizePackage)
      .filter((item) => item.roomType === form.roomType)
      .sort(
        (a, b) =>
          getDurationOrder(a.duration) - getDurationOrder(b.duration) ||
          Number(a.displayOrder || 0) - Number(b.displayOrder || 0)
      );
  }, [packages, form.roomType]);

  const selectedPackage = useMemo(() => {
    return (
      roomPackages.find((item) => item.duration === normalizeDuration(form.duration)) ||
      roomPackages.find((item) => String(item._id) === String(form.packageId)) ||
      null
    );
  }, [roomPackages, form.duration, form.packageId]);

  const durationVariants = useMemo(() => {
    const seen = new Set();

    return roomPackages
      .filter((pkg) => {
        if (seen.has(pkg.duration)) return false;
        seen.add(pkg.duration);
        return true;
      })
      .map((pkg) => ({
        label: pkg.duration,
        package: pkg,
        price: Number(pkg.price || 0),
        maxPax: pkg.maxPax || parseMaxPax(pkg.capacity),
        timeSlots: pkg.timeSlots,
      }));
  }, [roomPackages]);

  const selectedVariant = useMemo(() => {
    return (
      durationVariants.find((item) => item.label === normalizeDuration(form.duration)) ||
      durationVariants[0] ||
      null
    );
  }, [durationVariants, form.duration]);

  const basePrice = Number(selectedVariant?.price || selectedPackage?.price || 0) || 0;

  const monthlyConfirmedBookingCount = useMemo(() => {
    return countSameMonthBookings(confirmedBookings, form.date);
  }, [confirmedBookings, form.date]);

  const dynamicPricing = useMemo(() => {
    return calculateDynamicPrice({
      basePrice,
      date: form.date,
      monthlyBookingCount: monthlyConfirmedBookingCount,
    });
  }, [basePrice, form.date, monthlyConfirmedBookingCount]);

  const price = dynamicPricing.finalPrice || null;
  const maxPax =
    Number(selectedVariant?.maxPax || selectedPackage?.maxPax || 0) || null;

  const timeOptions = useMemo(() => {
    return (selectedVariant?.timeSlots || []).map((time) => ({
      value: time,
      label: time,
    }));
  }, [selectedVariant]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setStatus({ type: "", message: "" });
  };

  const setPaxValue = (rawValue) => {
    const clean = String(rawValue || "").replace(/\D/g, "").slice(0, 3);

    if (!clean) {
      setField("pax", "");
      return;
    }

    const numericValue = Number(clean);

    if (maxPax && numericValue > maxPax) {
      setField("pax", String(maxPax));
      return;
    }

    setField("pax", clean);
  };

  const applyRoomType = (roomType) => {
    const normalized = normalizeRoomType(roomType);
    const firstPackage = packages
      .map(normalizePackage)
      .filter((pkg) => pkg.roomType === normalized)
      .sort(
        (a, b) =>
          getDurationOrder(a.duration) - getDurationOrder(b.duration) ||
          Number(a.displayOrder || 0) - Number(b.displayOrder || 0)
      )[0];

    setForm((prev) => ({
      ...prev,
      roomType: normalized,
      packageId: firstPackage?._id || "",
      packageTitle: firstPackage?.title || "",
      duration: firstPackage?.duration || "",
      date: "",
      time: "",
      pax: "",
    }));

    setErrors({});
    setStatus({ type: "", message: "" });
  };

  const applyPackage = (pkg) => {
    const normalized = normalizePackage(pkg || {});
    if (!normalized?._id) return;

    setForm((prev) => ({
      ...prev,
      packageId: normalized._id || "",
      packageTitle: normalized.title || "",
      roomType: normalized.roomType || "",
      duration: normalized.duration || "",
      date: "",
      time: "",
      pax: "",
    }));

    setErrors({});
    setStatus({ type: "", message: "" });
  };

  const isTimeOptionBlocked = (date, time) => {
    if (!date || !time) return false;

    const target = buildInterval(date, time);
    if (!target) return false;

    return confirmedBookings.some((booking) => {
      const booked =
        booking.startDateTime && booking.endDateTime
          ? {
              startDateTime: new Date(booking.startDateTime),
              endDateTime: new Date(booking.endDateTime),
            }
          : buildInterval(booking.date, booking.time);

      if (!booked?.startDateTime || !booked?.endDateTime) return false;

      return intervalsOverlap(
        target.startDateTime,
        target.endDateTime,
        booked.startDateTime,
        booked.endDateTime
      );
    });
  };

  const isVariantFullyBlocked = (variant, date) => {
    if (!date || !variant?.timeSlots?.length) return false;
    return variant.timeSlots.every((time) => isTimeOptionBlocked(date, time));
  };

  const isDateFullyBlocked = (date) => {
    if (!date || !form.roomType || !durationVariants.length) return false;
    return durationVariants.every((variant) => isVariantFullyBlocked(variant, date));
  };

  const variationOptions = useMemo(() => {
    return durationVariants.map((variant) => {
      const disabled = form.date ? isVariantFullyBlocked(variant, form.date) : false;

      return {
        value: variant.label,
        label: `${variant.label}${disabled ? " — FULLY BOOKED" : ""}`,
        disabled,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationVariants, form.date, confirmedBookings]);

  const selectedVariationFullyBlocked = useMemo(() => {
    if (!form.date || !selectedVariant) return false;
    return isVariantFullyBlocked(selectedVariant, form.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, selectedVariant, confirmedBookings]);

  const allVariationsFullyBlocked = useMemo(() => {
    if (!form.date || !durationVariants.length) return false;
    return durationVariants.every((variant) => isVariantFullyBlocked(variant, form.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, durationVariants, confirmedBookings]);

  const availableTimeOptions = useMemo(() => {
    return timeOptions.map((option) => ({
      ...option,
      disabled: isTimeOptionBlocked(form.date, option.value),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeOptions, form.date, confirmedBookings]);

  const selectedDateBlockedBookings = useMemo(() => {
    if (!form.date) return [];

    return confirmedBookings.filter((booking) => {
      return durationVariants.some((variant) => {
        return variant.timeSlots.some((time) => {
          const target = buildInterval(form.date, time);
          const booked =
            booking.startDateTime && booking.endDateTime
              ? {
                  startDateTime: new Date(booking.startDateTime),
                  endDateTime: new Date(booking.endDateTime),
                }
              : buildInterval(booking.date, booking.time);

          if (!target || !booked) return false;

          return intervalsOverlap(
            target.startDateTime,
            target.endDateTime,
            booked.startDateTime,
            booked.endDateTime
          );
        });
      });
    });
  }, [form.date, durationVariants, confirmedBookings]);

  const fetchPackages = async () => {
    setLoadingPackages(true);

    try {
      const res = await fetch(`${API_BASE}/packages?type=hotel_condo`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || "Failed to load hotel packages.");

      const list = Array.isArray(data.packages)
        ? data.packages.filter((item) => item?.isActive !== false)
        : [];

      const sorted = expandHotelPackages(list.length ? list : DEFAULT_HOTEL_PACKAGES).sort(
        (a, b) =>
          Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
          String(a.title || "").localeCompare(String(b.title || ""))
      );

      setPackages(sorted);
    } catch (error) {
      console.error("fetch hotel packages error:", error);
      setPackages(expandHotelPackages(DEFAULT_HOTEL_PACKAGES));
      setStatus({
        type: "error",
        message:
          "Could not load updated Hotel & Condo packages. Showing default packages for now.",
      });
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) {
      navigate("/hotel-login");
      return;
    }

    setLoadingProfile(true);

    try {
      const res = await fetch(`${API_BASE}/hotel-user-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("hotelToken");
        navigate("/hotel-login");
        return;
      }

      const profile = data.user || data.hotelUser || data.profile || data;

      setForm((prev) => ({
        ...prev,
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || profile.contactNumber || "",
      }));
    } catch (error) {
      console.error("fetch profile error:", error);
      setStatus({
        type: "error",
        message: "Could not load profile. Please try again.",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchRoomCalendar = async (roomType) => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) {
      navigate("/hotel-login");
      return;
    }

    if (!roomType) {
      setConfirmedBookings([]);
      return;
    }

    setLoadingCalendar(true);

    try {
      const qs = new URLSearchParams({
        roomType,
        from: todayLocalISO,
        to: oneYearAheadISO,
      }).toString();

      const res = await fetch(`${API_BASE}/hotel-room-bookings/booked-dates?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setConfirmedBookings([]);
        return;
      }

      setConfirmedBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (error) {
      console.error("fetch hotel room calendar error:", error);
      setConfirmedBookings([]);
    } finally {
      setLoadingCalendar(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (presetAppliedRef.current || !packages.length) return;

    const matched =
      packages.find((item) => String(item._id) === String(presetPackageId)) ||
      packages.find(
        (item) =>
          String(item.title || "").toLowerCase() ===
          String(presetPackageTitle || "").toLowerCase()
      );

    if (matched) {
      applyPackage(matched);
    } else if (!form.roomType && roomTypeOptions.length) {
      applyRoomType(roomTypeOptions[0]);
    } else if (presetRoomType) {
      applyRoomType(presetRoomType);
    }

    presetAppliedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages, roomTypeOptions]);

  useEffect(() => {
    if (!form.roomType) {
      setConfirmedBookings([]);
      return;
    }

    fetchRoomCalendar(form.roomType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.roomType]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      time: "",
    }));
  }, [form.duration, form.date]);

  useEffect(() => {
    if (!form.roomType || !roomPackages.length) return;

    const currentPackage = roomPackages.find(
      (pkg) => pkg.duration === normalizeDuration(form.duration)
    );

    if (currentPackage) return;

    const firstPackage = roomPackages[0];

    setForm((prev) => ({
      ...prev,
      packageId: firstPackage?._id || "",
      packageTitle: firstPackage?.title || "",
      duration: firstPackage?.duration || "",
      time: "",
      pax: "",
    }));
  }, [form.roomType, roomPackages, form.duration]);

  useEffect(() => {
    if (!form.date || !durationVariants.length) return;

    const current = durationVariants.find(
      (variant) => variant.label === normalizeDuration(form.duration)
    );

    if (!current || !isVariantFullyBlocked(current, form.date)) return;

    const firstAvailable = durationVariants.find(
      (variant) => !isVariantFullyBlocked(variant, form.date)
    );

    if (!firstAvailable) return;

    setForm((prev) => ({
      ...prev,
      packageId: firstAvailable.package?._id || "",
      packageTitle: firstAvailable.package?.title || "",
      duration: firstAvailable.label,
      time: "",
      pax: "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, durationVariants, confirmedBookings]);

  useEffect(() => {
    if (maxPax && Number(form.pax || 0) > maxPax) {
      setForm((prev) => ({ ...prev, pax: String(maxPax) }));
    }
  }, [maxPax, form.pax]);

  const checkAvailability = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) return { ok: false, message: "Unauthorized." };

    const qs = new URLSearchParams({
      packageId: selectedPackage?._id || form.packageId || "",
      roomType: form.roomType,
      duration: normalizeDuration(form.duration),
      date: form.date,
      time: form.time,
    }).toString();

    const res = await fetch(`${API_BASE}/hotel-room-bookings/check?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        message: data.message || "Failed to check availability.",
      };
    }

    return {
      ok: true,
      available: Boolean(data.available),
      message: data.message || "",
    };
  };

  const validate = () => {
    const next = {};

    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";

    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Invalid email format.";
    }

    if (!form.phone.trim()) {
      next.phone = "Phone number is required.";
    } else if (!/^09\d{9}$/.test(form.phone)) {
      next.phone = "Phone must be 11 digits and start with 09.";
    }

    if (!form.roomType) next.roomType = "Choose a room type.";

    if (!form.duration) {
      next.duration = "Choose a variation.";
    } else if (selectedVariationFullyBlocked) {
      next.duration = "This variation is fully booked for the selected date.";
    }

    if (!selectedPackage?._id && !form.packageId) {
      next.packageId = "Choose a package.";
    }

    if (!form.date) {
      next.date = "Choose a date.";
    } else if (form.date < todayLocalISO) {
      next.date = "Date cannot be in the past.";
    } else if (isDateFullyBlocked(form.date)) {
      next.date = "All variations are already booked for this date.";
    }

    if (!form.time) {
      next.time = selectedVariationFullyBlocked
        ? "This variation is fully booked. Please choose another variation."
        : "Choose time.";
    } else if (isTimeOptionBlocked(form.date, form.time)) {
      next.time =
        "This time is too close to an approved booking. Please keep at least 1 hour gap.";
    }

    const pax = Number(form.pax || 0);

    if (!form.pax) {
      next.pax = "Pax is required.";
    } else if (!Number.isFinite(pax) || pax <= 0) {
      next.pax = "Pax must be at least 1.";
    } else if (maxPax && pax > maxPax) {
      next.pax = `Maximum ${maxPax} pax only for this room.`;
    }

    if (!price) next.price = "Price cannot be computed.";

    return next;
  };

  const handleProceed = async () => {
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    const validation = validate();
    setErrors(validation);

    if (Object.keys(validation).length) {
      setStatus({
        type: "error",
        message: "Please complete the required fields.",
      });
      setSubmitting(false);
      return;
    }

    try {
      const availability = await checkAvailability();

      if (!availability.ok) {
        setStatus({
          type: "error",
          message: availability.message || "Could not check availability.",
        });
        setSubmitting(false);
        return;
      }

      if (!availability.available) {
        setErrors((prev) => ({
          ...prev,
          time:
            availability.message ||
            "This time is too close to an approved booking. Please keep at least 1 hour gap.",
        }));

        setStatus({
          type: "error",
          message:
            availability.message ||
            "Selected room slot is not available. Please choose another slot.",
        });

        setSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("availability error:", error);

      setStatus({
        type: "error",
        message: "Network error while checking availability.",
      });

      setSubmitting(false);
      return;
    }

    const payload = {
      ...form,
      packageId: selectedPackage?._id || form.packageId,
      selectedPackageId: selectedPackage?._id || form.packageId,
      selectedPackage: selectedPackage?.title || form.packageTitle,
      selectedPackageTitle: selectedPackage?.title || form.packageTitle,
      selectedCapacity: selectedPackage?.capacity || "",
      selectedInclusions: selectedPackage?.inclusions || [],
      roomType: form.roomType,
      duration: normalizeDuration(form.duration),
      pax: Number(form.pax),
      maxPax: maxPax || Number(form.pax),
      basePrice,
      price,
      totalAmount: price,
      dynamicPricing,
      seasonalIncreasePercent: dynamicPricing.seasonalIncreasePercent,
      weekendIncreasePercent: dynamicPricing.weekendIncreasePercent,
      monthlyBookingIncreasePercent: dynamicPricing.monthlyBookingIncreasePercent,
      monthlyConfirmedBookings: dynamicPricing.monthlyBookingCount,
      totalIncreasePercent: dynamicPricing.totalIncreasePercent,
    };

    sessionStorage.setItem("hotelBookingDraft", JSON.stringify(payload));
    navigate("/hotel-booking-summary", { state: payload });

    setSubmitting(false);
  };

  const statusStyles =
    status.type === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status.type === "error"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  const goToProfile = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");
    navigate(token ? "/hotel-profile" : "/hotel-login");
  };

  return (
    <div className="min-h-screen bg-[#2f523d] font-['Inter',sans-serif]">
      <Header
        navigate={navigate}
        goToProfile={goToProfile}
        openMenu={() => setIsOpen(true)}
      />

      <main className="bg-[#2f523d] px-4 pb-7 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-5 text-center">
            <h1 className="font-['Montserrat',sans-serif] text-[34px] font-extrabold leading-tight text-white sm:text-[42px]">
              Hotel Booking
            </h1>
            <div className="mx-auto mt-2 h-[2px] w-[270px] bg-white/80" />
          </div>

          <div className="rounded-md bg-white/15 px-5 py-8 shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur-[1px] sm:px-7 lg:px-8">
            {status.message ? (
          <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${statusStyles}`}>
            {status.message}
          </div>
        ) : null}

        <Section title="Personal Details">
          <Field
            label="First Name"
            value={form.firstName}
            disabled={loadingProfile}
            error={errors.firstName}
            placeholder="Enter first name"
            onChange={(v) =>
              setField("firstName", v.replace(/[^A-Za-z\s]/g, "").slice(0, 30))
            }
          />

          <Field
            label="Last Name"
            value={form.lastName}
            disabled={loadingProfile}
            error={errors.lastName}
            placeholder="Enter last name"
            onChange={(v) =>
              setField("lastName", v.replace(/[^A-Za-z\s]/g, "").slice(0, 30))
            }
          />

          <Field
            label="Email"
            type="email"
            value={form.email}
            disabled={loadingProfile}
            error={errors.email}
            placeholder="Enter email"
            onChange={(v) => setField("email", v.replace(/\s/g, "").slice(0, 60))}
          />

          <Field
            label="Phone Number"
            value={form.phone}
            disabled={loadingProfile}
            error={errors.phone}
            placeholder="09XXXXXXXXX"
            inputMode="numeric"
            onChange={(v) => setField("phone", v.replace(/\D/g, "").slice(0, 11))}
          />
        </Section>

        <div className="mt-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <h2 className="font-['Montserrat',sans-serif] text-[25px] font-semibold text-white sm:text-[30px]">
              Booking Details
            </h2>

            <input
              value="Hotel & Condo"
              disabled
              readOnly
              className="h-8 w-full rounded-md border-0 bg-white px-3 text-[12px] font-semibold text-[#3f5b44] outline-none sm:w-[250px]"
            />

            <div className="text-sm font-bold text-white md:ml-auto">
              Price: {formatPeso(price)}
              <span className="ml-3 font-semibold opacity-80">
                • Pax: {form.pax || 0}
              </span>

              {maxPax ? (
                <span className="ml-3 font-semibold opacity-80">
                  • Max: {maxPax}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#3f5b44]/20 bg-[#3f5b44]/5 p-4">
            <p className="text-sm font-extrabold text-[#3f5b44]">
              Hotel room calendar rules
            </p>

            <p className="mt-1 text-sm text-black/55">
              Approved bookings block the exact time range plus a required 1-hour
              gap before and after every booking. If a booking ends the next day,
              that next-day time is also blocked automatically.
            </p>

            {maxPax ? (
              <p className="mt-2 text-sm font-bold text-[#3f5b44]">
                Maximum capacity: {maxPax} pax
              </p>
            ) : null}

            {form.date && allVariationsFullyBlocked ? (
              <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">
                All variations are fully booked for this date. Please choose another date.
              </p>
            ) : null}

            {form.date && selectedDateBlockedBookings.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedDateBlockedBookings.map((booking) => (
                  <span
                    key={booking._id}
                    className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#3f5b44]"
                  >
                    Booked: {booking.duration} • {stripTimePrefix(booking.time)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-3">
            <SelectField
              label="Choose Room Type"
              value={form.roomType}
              onChange={applyRoomType}
              options={roomTypeOptions.map((room) => ({
                value: room,
                label: room,
              }))}
              placeholder={loadingPackages ? "Loading rooms..." : "Select room type"}
              error={errors.roomType}
              disabled={loadingPackages}
            />

            <div>
              <label className="mb-2 block text-[13px] font-extrabold text-white">Choose Date</label>

              <div className="relative">
                <DatePicker
                  selected={selectedDateObj}
                  onChange={(d) => setField("date", d ? toLocalISO(d) : "")}
                  minDate={minDateObj}
                  filterDate={(d) => !isDateFullyBlocked(toLocalISO(d))}
                  disabled={!form.roomType || loadingCalendar}
                  placeholderText="mm/dd/yyyy"
                  dateFormat="MM/dd/yyyy"
                  className="h-10 w-full rounded-full border px-4 pr-11 focus:outline-none focus:ring-2"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80">
                  📅
                </span>
              </div>

              {loadingCalendar && form.roomType ? (
                <p className="mt-1 text-xs text-black/50">
                  Loading calendar for selected room...
                </p>
              ) : null}

              {errors.date ? (
                <p className="mt-1 text-xs font-semibold text-rose-100">{errors.date}</p>
              ) : null}
            </div>

            <SelectField
              label="Variation"
              value={form.duration}
              onChange={(value) => {
                const selected = durationVariants.find((item) => item.label === value);

                setForm((prev) => ({
                  ...prev,
                  packageId: selected?.package?._id || "",
                  packageTitle: selected?.package?.title || "",
                  duration: value,
                  time: "",
                  pax: "",
                }));

                setErrors((prev) => ({ ...prev, duration: "", time: "", pax: "" }));
                setStatus({ type: "", message: "" });
              }}
              options={variationOptions.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              disabledOptions={variationOptions
                .filter((item) => item.disabled)
                .map((item) => item.value)}
              placeholder={form.roomType ? "Select variation" : "Select room first"}
              error={errors.duration}
              disabled={!form.roomType || variationOptions.length <= 1}
            />

            <SelectField
              label="Time"
              value={form.time}
              onChange={(value) => setField("time", value)}
              options={availableTimeOptions.map((item) => ({
                value: item.value,
                label: `${item.label}${item.disabled ? " — BOOKED" : ""}`,
              }))}
              disabledOptions={availableTimeOptions
                .filter((item) => item.disabled)
                .map((item) => item.value)}
              placeholder={
                !form.roomType
                  ? "Select room first"
                  : !form.duration
                  ? "Select variation first"
                  : !form.date
                  ? "Select date first"
                  : selectedVariationFullyBlocked
                  ? "This variation is fully booked"
                  : "Choose time"
              }
              error={errors.time}
              disabled={
                !form.roomType ||
                !form.duration ||
                !form.date ||
                selectedVariationFullyBlocked
              }
            />

            <Field
              label="Number of Pax"
              value={form.pax}
              error={errors.pax}
              placeholder={maxPax ? `Max ${maxPax} pax` : "Enter pax"}
              inputMode="numeric"
              onChange={setPaxValue}
            />

            <Field
              label="Selected Package"
              value={selectedPackage?.title || form.packageTitle || ""}
              disabled
              error={errors.packageId}
              onChange={() => {}}
            />
          </div>

          {selectedVariant ? (
            <div className="mt-6 rounded-2xl border border-[#3f5b44]/20 bg-white p-5">
              <p className="text-sm font-extrabold text-[#3f5b44]">
                Selected Variation
              </p>

              <div className="mt-3 flex flex-wrap gap-3">
                <span className="rounded-full bg-[#3f5b44]/10 px-4 py-2 text-xs font-extrabold text-[#3f5b44]">
                  {form.roomType}
                </span>

                <span className="rounded-full bg-[#3f5b44]/10 px-4 py-2 text-xs font-extrabold text-[#3f5b44]">
                  {selectedVariant.label}
                </span>

                <span className="rounded-full bg-[#3f5b44]/10 px-4 py-2 text-xs font-extrabold text-[#3f5b44]">
                  Base: {formatPeso(basePrice)}
                </span>

                <span className="rounded-full bg-[#3f5b44]/10 px-4 py-2 text-xs font-extrabold text-[#3f5b44]">
                  {selectedVariant.timeSlots?.length || 0} time slot(s)
                </span>

                {maxPax ? (
                  <span className="rounded-full bg-[#3f5b44]/10 px-4 py-2 text-xs font-extrabold text-[#3f5b44]">
                    Max {maxPax} pax
                  </span>
                ) : null}

                {form.date && selectedVariationFullyBlocked ? (
                  <span className="rounded-full bg-rose-100 px-4 py-2 text-xs font-extrabold text-rose-700">
                    Fully booked
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          <PricingBreakdown pricing={dynamicPricing} />

          {selectedPackage ? (
            <div className="mt-6 rounded-2xl border border-[#3f5b44]/20 bg-[#f7f7f5] p-5">
              <p className="text-sm font-extrabold text-[#3f5b44]">
                {selectedPackage.title} Details
              </p>

              <p className="mt-1 text-sm text-black/60">
                {selectedPackage.description || selectedPackage.subtitle || ""}
              </p>

              {selectedPackage.capacity ? (
                <p className="mt-3 text-sm font-extrabold text-[#3f5b44]">
                  {selectedPackage.capacity}
                </p>
              ) : null}

              {Array.isArray(selectedPackage.inclusions) &&
              selectedPackage.inclusions.length ? (
                <ul className="mt-4 grid gap-2 text-sm font-semibold text-black/60 md:grid-cols-2">
                  {selectedPackage.inclusions.map((item, index) => (
                    <li key={`${item}-${index}`}>• {item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {errors.price ? (
            <p className="mt-4 text-center text-sm font-semibold text-rose-700">
              {errors.price}
            </p>
          ) : null}
        </div>

        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            onClick={handleProceed}
            disabled={submitting || loadingProfile}
            className="h-8 w-full rounded-full bg-white px-12 font-['Montserrat',sans-serif] text-[10px] font-extrabold uppercase text-[#3f5b44] shadow-sm transition hover:bg-[#fffde9] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[220px]"
          >
            {submitting ? "PROCESSING..." : "PROCEED"}
          </button>

          <button
            onClick={() => navigate("/hotel-condo")}
            disabled={submitting}
            className="h-8 w-full rounded-full bg-white px-12 font-['Montserrat',sans-serif] text-[10px] font-extrabold uppercase text-[#3f5b44] shadow-sm transition hover:bg-[#fffde9] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[220px]"
          >
            CANCEL
          </button>
        </div>
          </div>
        </div>
      </main>

      <Footer />

      {isOpen && (
        <MobileMenu
          onClose={() => setIsOpen(false)}
          navigate={navigate}
          goToProfile={goToProfile}
        />
      )}
    </div>
  );
}


function Section({ title, children }) {
  return (
    <section className="mt-9">
      <h2 className="font-['Montserrat',sans-serif] text-[25px] font-semibold text-white sm:text-[30px]">
        {title}
      </h2>
      <div className="mt-1 h-[2px] w-[260px] bg-white/60" />

      <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  disabled,
  type = "text",
  inputMode,
  error,
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-extrabold text-white">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold text-[#3f5b44] outline-none transition placeholder:text-[#3f5b44]/45 focus:ring-2 focus:ring-white/70 disabled:opacity-70"
      />

      {error ? (
        <p className="mt-1 text-xs font-semibold text-rose-100">{error}</p>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  error,
  disabled,
  disabledOptions = [],
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-extrabold text-white">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`h-9 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-white/70 disabled:opacity-70 ${
          value ? "text-[#3f5b44]" : "text-[#3f5b44]/45"
        }`}
      >
        <option value="">{placeholder}</option>

        {options.map((option, index) => (
          <option
            key={`${option.value}-${index}`}
            value={option.value}
            disabled={disabledOptions.includes(option.value)}
            className="text-[#3f5b44]"
          >
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="mt-1 text-xs font-semibold text-rose-100">{error}</p>
      ) : null}
    </div>
  );
}


function Header({ navigate, goToProfile, openMenu }) {
  return (
    <header className="relative z-30 w-full bg-white shadow-[0_3px_0_rgba(0,0,0,0.18)]">
      <div className="flex h-[78px] w-full items-center justify-between px-5 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/")}
          type="button"
          className="flex items-center gap-4"
          aria-label="Go to home"
        >
          <img
            src="/Logo.jpg"
            alt="Hotel logo"
            className="h-[52px] w-[52px] rounded-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <span className="font-['Montserrat',sans-serif] text-[20px] font-extrabold uppercase tracking-wide text-[#385541] sm:text-[24px]">
            Hotel &amp; Resort
          </span>
        </button>

        <nav className="hidden items-center gap-9 md:flex">
          <NavButton label="Home" onClick={() => navigate("/")} />
          <NavButton label="Virtual Tour" onClick={() => navigate("/virtual-tour")} />
          <NavButton label="Contact" onClick={() => navigate("/hotel-contact-us")} />
        </nav>

        <button
          onClick={goToProfile}
          type="button"
          className="hidden font-['Montserrat',sans-serif] text-[14px] font-bold uppercase tracking-wide text-[#385541] transition hover:text-[#1f3528] md:block"
        >
          Profile
        </button>

        <button
          onClick={openMenu}
          type="button"
          aria-label="Open menu"
          className="rounded-md p-2 text-[#385541] md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function NavButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="font-['Montserrat',sans-serif] text-[14px] font-bold uppercase tracking-wide text-[#385541] transition hover:text-[#1f3528]"
    >
      {label}
    </button>
  );
}

function Footer() {
  return (
    <footer className="bg-[#f7f7f2] text-[#2f523d]">
      <div className="mx-auto grid max-w-[1280px] gap-5 px-5 py-4 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.25fr_0.6fr_1.2fr_1fr_0.85fr] lg:gap-6 lg:px-10">
        <div className="flex items-center gap-3">
          <img
            src="/Logo.jpg"
            alt="Lumispire logo"
            className="h-[42px] w-[42px] rounded-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <h2 className="font-['Montserrat',sans-serif] text-[25px] font-extrabold uppercase tracking-wide sm:text-[29px]">
            Lumispire
          </h2>
        </div>

        <FooterColumn title="Menu">
          <FooterLink>Home</FooterLink>
          <FooterLink>Course</FooterLink>
          <FooterLink>Requirements</FooterLink>
          <FooterLink>Profile</FooterLink>
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>ltc.amsi@gmail.com</FooterText>
          <FooterText>lorengladius@ltcmultiservices.com</FooterText>
          <FooterText>09959808051 / 09516281271</FooterText>
        </FooterColumn>

        <FooterColumn title="Address">
          <FooterText>2/F 5441 Currie Street,</FooterText>
          <FooterText>Palanan, Makati City</FooterText>
        </FooterColumn>

        <FooterColumn title="Follow Us">
          <div className="mt-2 flex gap-2">
            <span className="h-6 w-6 rounded-full bg-[#2f523d]/15" />
            <span className="h-6 w-6 rounded-full bg-[#2f523d]/15" />
            <span className="h-6 w-6 rounded-full bg-[#2f523d]/15" />
          </div>
        </FooterColumn>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-1 px-5 pb-2 text-[9px] font-bold tracking-wide text-[#2f523d]/80 sm:px-8 md:flex-row md:justify-between lg:px-10">
        <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
        <p>Developed by CRMS Tech Alliance</p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div className="border-[#2f523d]/20 lg:border-l lg:pl-5">
      <h3 className="font-['Montserrat',sans-serif] text-[14px] font-extrabold leading-tight">
        {title}
      </h3>

      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}

function FooterLink({ children }) {
  return (
    <button
      type="button"
      className="block text-left text-[10px] font-bold leading-4 text-[#2f523d]/85 transition hover:text-[#2f523d]"
    >
      {children}
    </button>
  );
}

function FooterText({ children }) {
  return (
    <p className="text-[10px] font-bold leading-4 text-[#2f523d]/85">
      {children}
    </p>
  );
}

function MobileMenu({ onClose, navigate, goToProfile }) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-[300px] bg-white p-5 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="font-['Montserrat',sans-serif] text-lg font-bold text-[#385541]">
            MENU
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-black/5"
            aria-label="Close menu"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <MenuItem
            label="HOME"
            onClick={() => {
              onClose();
              navigate("/");
            }}
          />

          <MenuItem
            label="VIRTUAL TOUR"
            onClick={() => {
              onClose();
              navigate("/virtual-tour");
            }}
          />

          <MenuItem
            label="CONTACT"
            onClick={() => {
              onClose();
              navigate("/hotel-contact-us");
            }}
          />

          <MenuItem
            label="PROFILE"
            onClick={() => {
              onClose();
              goToProfile();
            }}
          />
        </div>
      </div>
    </div>
  );
}

function MenuItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="w-full rounded-xl bg-[#385541]/10 py-4 font-['Montserrat',sans-serif] text-sm font-semibold tracking-wide text-[#385541] transition hover:bg-[#385541]/20"
    >
      {label}
    </button>
  );
}

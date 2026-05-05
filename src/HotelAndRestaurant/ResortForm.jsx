import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HotelFaqBot from "./HotelFaqBot";

const BOOKING_GAP_MINUTES = 60;
const BOOKING_GAP_MS = BOOKING_GAP_MINUTES * 60 * 1000;

const EIGHT_HOUR_TIME_SLOTS = [
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
];

const DEFAULT_TIME_SLOTS_BY_LABEL = {
  "8 Hours": EIGHT_HOUR_TIME_SLOTS,
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

const LEGACY_RESORT_PACKAGES = [
  {
    _id: "legacy-lorenzo-campsite",
    title: "Lorenzo Campsite",
    duration: "12 Hours / 22 Hours",
    price: 15000,
    variants: [
      {
        label: "12 Hours",
        price: 15000,
        timeSlots: DEFAULT_TIME_SLOTS_BY_LABEL["12 Hours"],
        displayOrder: 1,
        isActive: true,
      },
      {
        label: "22 Hours",
        price: 20000,
        timeSlots: DEFAULT_TIME_SLOTS_BY_LABEL["22 Hours"],
        displayOrder: 2,
        isActive: true,
      },
    ],
    capacity: "Maximum Capacity: 30 guests",
    displayOrder: 1,
    isActive: true,
    inclusions: [
      "Total Pax: Maximum 30 guests",
      "Availability: 12 Hours / 22 Hours",
      "Price range: ₱15,000 for 12 hours / ₱20,000 for 22 hours",
    ],
  },
  {
    _id: "legacy-lorenzo-veranda",
    title: "Lorenzo Veranda",
    duration: "8 Hours",
    price: 12000,
    variants: [
      {
        label: "8 Hours",
        price: 12000,
        timeSlots: EIGHT_HOUR_TIME_SLOTS,
        displayOrder: 1,
        isActive: true,
      },
    ],
    capacity: "Maximum Capacity: 100 guests",
    displayOrder: 2,
    isActive: true,
    inclusions: ["Total Pax: Maximum 100 guests"],
  },
  {
    _id: "legacy-lorenzo-hall",
    title: "Lorenzo Hall",
    duration: "8 Hours",
    price: 15000,
    variants: [
      {
        label: "8 Hours",
        price: 15000,
        timeSlots: EIGHT_HOUR_TIME_SLOTS,
        displayOrder: 1,
        isActive: true,
      },
    ],
    capacity: "Maximum Capacity: 100 guests",
    displayOrder: 3,
    isActive: true,
    inclusions: ["Total Pax: Maximum 100 guests"],
  },
  {
    _id: "legacy-lorenzo-cavanas",
    title: "Lorenzo Cavanas",
    duration: "12 Hours / 22 Hours",
    price: 15000,
    variants: [
      {
        label: "12 Hours",
        price: 15000,
        timeSlots: DEFAULT_TIME_SLOTS_BY_LABEL["12 Hours"],
        displayOrder: 1,
        isActive: true,
      },
      {
        label: "22 Hours",
        price: 20000,
        timeSlots: DEFAULT_TIME_SLOTS_BY_LABEL["22 Hours"],
        displayOrder: 2,
        isActive: true,
      },
    ],
    capacity: "Venue Capacity: 100 pax",
    displayOrder: 4,
    isActive: true,
    inclusions: ["Total Pax: Venue capacity 100 pax"],
  },
];

const SEASONAL_MARKUP_PERCENT = 10;
const WEEKEND_MARKUP_PERCENT = 5;
const MONTHLY_BOOKING_MARKUP_PERCENT = 1;

const MAX_ADDITIONAL_PAX = 20;
const ADDITIONAL_PAX_RATE = 250;

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

function normalizeText(value = "") {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, " ");
}

function normalizeVariationLabel(value = "") {
  const text = String(value || "").trim().toLowerCase();

  if (text.includes("8")) return "8 Hours";
  if (text.includes("12")) return "12 Hours";
  if (text.includes("22")) return "22 Hours";

  return String(value || "").trim();
}

function getDefaultTimeSlots(label = "") {
  return DEFAULT_TIME_SLOTS_BY_LABEL[normalizeVariationLabel(label)] || [];
}

function extractMaxCapacity(value = "") {
  const matches = String(value || "").match(/\d+/g);
  if (!matches || !matches.length) return null;

  const numbers = matches
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);

  if (!numbers.length) return null;

  return Math.max(...numbers);
}

function getPackageCapacityLimit(pkg) {
  const capacityFromField = extractMaxCapacity(pkg?.capacity);

  if (capacityFromField) return capacityFromField;

  if (Array.isArray(pkg?.inclusions)) {
    const capacityLines = pkg.inclusions.filter((item) =>
      /(capacity|pax|guest|guests)/i.test(String(item || ""))
    );

    const numbers = capacityLines
      .map((line) => extractMaxCapacity(line))
      .filter((num) => Number.isFinite(num) && num > 0);

    if (numbers.length) return Math.max(...numbers);
  }

  return null;
}

function parseDurationOptions(pkg) {
  if (Array.isArray(pkg?.variants) && pkg.variants.length) {
    return pkg.variants
      .filter((item) => item?.isActive !== false)
      .map((item) => normalizeVariationLabel(item.label))
      .filter(Boolean);
  }

  const raw = String(pkg?.duration || "").toLowerCase();
  const options = [];

  if (raw.includes("8")) options.push("8 Hours");
  if (raw.includes("12")) options.push("12 Hours");
  if (raw.includes("22")) options.push("22 Hours");

  if (options.length) return options;
  if (pkg?.duration) return [pkg.duration];

  return ["8 Hours"];
}

function normalizeVariant(variant = {}, index = 0) {
  const label = normalizeVariationLabel(variant.label || "");
  const manualSlots = Array.isArray(variant.timeSlots)
    ? variant.timeSlots.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  return {
    label,
    price: Number(variant.price || 0),
    timeSlots: manualSlots.length ? manualSlots : getDefaultTimeSlots(label),
    displayOrder: Number(variant.displayOrder || index + 1),
    isActive: variant.isActive === false ? false : true,
  };
}

function packageScore(pkg = {}) {
  const variants = Array.isArray(pkg.variants) ? pkg.variants : [];

  const usefulVariants = variants.filter((variant) => {
    const normalized = normalizeVariant(variant);
    return normalized.isActive && normalized.label && normalized.timeSlots.length;
  });

  return [
    usefulVariants.length ? 1 : 0,
    Number(pkg.isActive !== false),
    new Date(pkg.updatedAt || pkg.createdAt || 0).getTime(),
  ];
}

function isBetterPackage(candidate, current) {
  if (!current) return true;

  const a = packageScore(candidate);
  const b = packageScore(current);

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }

  return false;
}

function dedupePackagesByVenue(list = []) {
  const map = new Map();

  list
    .filter((item) => item?.isActive !== false)
    .forEach((pkg) => {
      const key = normalizeText(pkg.title);
      if (!key) return;

      const current = map.get(key);

      if (isBetterPackage(pkg, current)) {
        map.set(key, pkg);
      }
    });

  return [...map.values()].sort(
    (a, b) =>
      Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
      String(a.title || "").localeCompare(String(b.title || ""))
  );
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

function formatPeso(value) {
  const num = Number(value || 0);
  if (!num) return "₱ 0";

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
  const monthlyBookingIncreasePercent =
    safeMonthlyCount * MONTHLY_BOOKING_MARKUP_PERCENT;

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

function isoToLocalDateObj(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getCategoryLabel(category = "") {
  const label = normalizeVariationLabel(category);

  if (label === "12 Hours") return "12-hour";
  if (label === "22 Hours") return "22-hour";

  return "8-hour";
}

export default function ResortForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = useMemo(() => getApiBase(), []);
  const presetAppliedRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);

  const presetPackageId = location.state?.selectedPackageId || "";
  const presetPackage =
    location.state?.selectedPackage || location.state?.selectedVenue || "";

  const [packages, setPackages] = useState(LEGACY_RESORT_PACKAGES);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceType: "Resort & Venue",
    packageId: presetPackageId,
    venue: normalizeText(presetPackage),
    date: "",
    category: "",
    time: "",
    pax: "",
  });

  const todayLocalISO = useMemo(() => toLocalISO(new Date()), []);

  const oneYearAheadISO = useMemo(() => {
    const d = isoToLocalDateObj(todayLocalISO);
    d.setDate(d.getDate() + 365);
    return toLocalISO(d);
  }, [todayLocalISO]);

  const displayPackages = useMemo(() => dedupePackagesByVenue(packages), [packages]);

  const selectedPackage = useMemo(() => {
    return (
      displayPackages.find((item) => String(item._id) === String(form.packageId)) ||
      displayPackages.find(
        (item) => normalizeText(item.title) === normalizeText(form.venue)
      ) ||
      null
    );
  }, [displayPackages, form.packageId, form.venue]);

  const capacityLimit = useMemo(
    () => getPackageCapacityLimit(selectedPackage),
    [selectedPackage]
  );

  const baseCapacity = Number(capacityLimit || 0);

  const maxBookablePax = useMemo(() => {
    return baseCapacity ? baseCapacity + MAX_ADDITIONAL_PAX : null;
  }, [baseCapacity]);

  const venueOptions = useMemo(() => {
    return displayPackages.map((item) => ({
      value: normalizeText(item.title),
      label: item.title,
      packageId: item._id,
    }));
  }, [displayPackages]);

  const selectedVariants = useMemo(() => {
    if (!selectedPackage) return [];

    const variants = Array.isArray(selectedPackage.variants)
      ? selectedPackage.variants
          .map(normalizeVariant)
          .filter((item) => item.isActive && item.label && item.timeSlots.length)
          .sort(
            (a, b) =>
              Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
              String(a.label).localeCompare(String(b.label))
          )
      : [];

    if (variants.length) return variants;

    return parseDurationOptions(selectedPackage).map((label, index) => ({
      label,
      price: Number(selectedPackage.price || 0),
      timeSlots: getDefaultTimeSlots(label),
      displayOrder: index + 1,
      isActive: true,
    }));
  }, [selectedPackage]);

  const selectedVariant = useMemo(() => {
    if (!form.category) return null;

    return (
      selectedVariants.find(
        (item) => item.label === normalizeVariationLabel(form.category)
      ) || null
    );
  }, [selectedVariants, form.category]);

  const timeOptions = useMemo(() => {
    return (selectedVariant?.timeSlots || []).map((time) => ({
      value: time,
      label: time,
    }));
  }, [selectedVariant]);

  const basePrice = useMemo(() => {
    if (!selectedVariant) return 0;
    return Number(selectedVariant.price || selectedPackage?.price || 0) || 0;
  }, [selectedVariant, selectedPackage]);

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

  const baseAmount = dynamicPricing.finalPrice || null;
  const selectedPax = Number(form.pax || 0);
  const additionalPax = baseCapacity
    ? Math.max(0, selectedPax - baseCapacity)
    : 0;
  const additionalPaxCharge = additionalPax * ADDITIONAL_PAX_RATE;
  const price = baseAmount ? baseAmount + additionalPaxCharge : null;

  const selectedDateObj = useMemo(() => isoToLocalDateObj(form.date), [form.date]);
  const minDateObj = useMemo(() => isoToLocalDateObj(todayLocalISO), [todayLocalISO]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setStatus({ type: "", message: "" });
  };

  const setPaxValue = (rawValue) => {
    const clean = String(rawValue || "").replace(/\D/g, "").slice(0, 4);

    if (!clean) {
      setField("pax", "");
      return;
    }

    const numericValue = Number(clean);

    if (maxBookablePax && numericValue > maxBookablePax) {
      setField("pax", String(maxBookablePax));
      return;
    }

    setField("pax", clean);
  };

  const isTimeOptionBlocked = (date, time) => {
    if (!date || !time) return false;

    const target = buildInterval(date, time);
    if (!target) return false;

    return confirmedBookings.some((booking) => {
      const start = booking.startDateTime
        ? new Date(booking.startDateTime)
        : buildInterval(booking.date, booking.time)?.startDateTime;

      const end = booking.endDateTime
        ? new Date(booking.endDateTime)
        : buildInterval(booking.date, booking.time)?.endDateTime;

      if (!start || !end) return false;

      return intervalsOverlap(target.startDateTime, target.endDateTime, start, end);
    });
  };

  const isVariantFullyBlocked = (variant, date) => {
    if (!date || !variant?.timeSlots?.length) return false;

    return variant.timeSlots.every((time) => isTimeOptionBlocked(date, time));
  };

  const isDateFullyBlocked = (date) => {
    if (!date || !form.venue || !selectedVariants.length) return false;

    return selectedVariants.every((variant) => isVariantFullyBlocked(variant, date));
  };

  const variationOptions = useMemo(() => {
    return selectedVariants.map((variant) => {
      const disabled = form.date ? isVariantFullyBlocked(variant, form.date) : false;

      return {
        value: variant.label,
        label: `${variant.label}${disabled ? " — FULLY BOOKED" : ""}`,
        disabled,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariants, form.date, confirmedBookings]);

  const categoryOptions = useMemo(
    () => variationOptions.map((item) => item.value),
    [variationOptions]
  );

  const disabledCategoryOptions = useMemo(
    () => variationOptions.filter((item) => item.disabled).map((item) => item.value),
    [variationOptions]
  );

  const categoryOptionLabelMap = useMemo(
    () =>
      Object.fromEntries(
        variationOptions.map((item) => [item.value, item.label])
      ),
    [variationOptions]
  );

  const selectedVariationFullyBlocked = useMemo(() => {
    if (!form.date || !selectedVariant) return false;
    return isVariantFullyBlocked(selectedVariant, form.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, selectedVariant, confirmedBookings]);

  const availableTimeOptions = useMemo(() => {
    return timeOptions.map((option) => ({
      ...option,
      disabled: isTimeOptionBlocked(form.date, option.value),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeOptions, form.date, confirmedBookings]);

  const fetchPackages = async () => {
    setLoadingPackages(true);

    try {
      const res = await fetch(`${API_BASE}/packages?type=resort_venue`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || "Failed to load resort packages.");

      const list = Array.isArray(data.packages)
        ? data.packages.filter((item) => item?.isActive !== false)
        : [];

      setPackages(list.length ? list : LEGACY_RESORT_PACKAGES);
    } catch (error) {
      console.error("fetch resort packages error:", error);

      setPackages(LEGACY_RESORT_PACKAGES);
      setStatus({
        type: "error",
        message:
          "Could not load updated resort packages. Showing default venues for now.",
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

  const fetchVenueCalendar = async (venue) => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) {
      navigate("/hotel-login");
      return;
    }

    if (!venue) {
      setConfirmedBookings([]);
      return;
    }

    setLoadingCalendar(true);

    try {
      const qs = new URLSearchParams({
        venue,
        from: todayLocalISO,
        to: oneYearAheadISO,
      }).toString();

      const res = await fetch(`${API_BASE}/resort-bookings/booked-dates?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setConfirmedBookings([]);
        return;
      }

      setConfirmedBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (error) {
      console.error("fetch venue calendar error:", error);
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
    if (presetAppliedRef.current || !displayPackages.length) return;

    const matched =
      displayPackages.find((item) => String(item._id) === String(presetPackageId)) ||
      displayPackages.find(
        (item) => normalizeText(item.title) === normalizeText(presetPackage)
      );

    if (matched) {
      setForm((prev) => ({
        ...prev,
        packageId: matched._id,
        venue: normalizeText(matched.title),
        category: "",
        time: "",
      }));
    }

    presetAppliedRef.current = true;
  }, [displayPackages, presetPackage, presetPackageId]);

  useEffect(() => {
    if (!form.venue) {
      setConfirmedBookings([]);
      return;
    }

    const matched = displayPackages.find(
      (item) => normalizeText(item.title) === normalizeText(form.venue)
    );

    setForm((prev) => {
      const currentCategory = normalizeVariationLabel(prev.category);
      const options = parseDurationOptions(matched);
      const validCategory = options.includes(currentCategory) ? currentCategory : "";

      const currentPax = Number(prev.pax || 0);
      const nextCapacity = getPackageCapacityLimit(matched);
      const nextPax =
        nextCapacity && currentPax > nextCapacity ? String(nextCapacity) : prev.pax;

      return {
        ...prev,
        packageId: matched?._id || prev.packageId,
        category: validCategory,
        date: "",
        time: "",
        pax: nextPax,
      };
    });

    fetchVenueCalendar(form.venue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.venue, displayPackages]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, time: "" }));
  }, [form.category, form.date]);

  useEffect(() => {
    if (!form.date || !selectedVariants.length || !form.category) return;

    const current = selectedVariants.find(
      (variant) => variant.label === normalizeVariationLabel(form.category)
    );

    if (!current || !isVariantFullyBlocked(current, form.date)) return;

    setForm((prev) => ({
      ...prev,
      category: "",
      time: "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, selectedVariants, confirmedBookings]);

  const checkAvailability = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) return { ok: false, message: "Unauthorized." };

    const qs = new URLSearchParams({
      venue: form.venue,
      date: form.date,
      category: normalizeVariationLabel(form.category),
      time: form.time,
    }).toString();

    const res = await fetch(`${API_BASE}/resort-bookings/check?${qs}`, {
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

    if (!form.venue) next.venue = "Choose a venue.";

    if (!form.category) {
      next.category = "Choose a variation.";
    } else if (selectedVariationFullyBlocked) {
      next.category = "This variation is fully booked for the selected date.";
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
        : "Choose a time.";
    } else if (isTimeOptionBlocked(form.date, form.time)) {
      next.time =
        "This time is blocked by a pending or approved booking. Please choose another slot.";
    }

    if (!form.pax) {
      next.pax = "Pax is required.";
    } else if (!/^\d+$/.test(form.pax) || Number(form.pax) <= 0) {
      next.pax = "Pax must be at least 1.";
    } else if (maxBookablePax && Number(form.pax) > maxBookablePax) {
      next.pax = `Maximum bookable pax is ${maxBookablePax} pax (${baseCapacity} base + ${MAX_ADDITIONAL_PAX} additional).`;
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
            "Selected slot is not available. Please choose another slot.",
        }));

        setStatus({
          type: "error",
          message:
            availability.message ||
            "Selected slot is not available. Please choose another slot.",
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
      category: normalizeVariationLabel(form.category),
      packageId: selectedPackage?._id || form.packageId || "",
      selectedPackage: selectedPackage?.title || form.venue,
      selectedPackageTitle: selectedPackage?.title || form.venue,
      selectedCapacity: selectedPackage?.capacity || "",
      selectedCapacityLimit: capacityLimit || "",
      baseCapacity,
      maxBookablePax,
      maxAdditionalPax: MAX_ADDITIONAL_PAX,
      additionalPax,
      additionalPaxRate: ADDITIONAL_PAX_RATE,
      additionalPaxCharge,
      selectedInclusions: selectedPackage?.inclusions || [],
      selectedVariantLabel:
        selectedVariant?.label || normalizeVariationLabel(form.category),
      selectedVariantPrice: basePrice,
      selectedVariantTimeSlots: selectedVariant?.timeSlots || [],
      pax: Number(form.pax),
      totalGuests: Number(form.pax),
      basePrice,
      baseAmount,
      price,
      totalAmount: price,
      dynamicPricing,
      seasonalIncreasePercent: dynamicPricing.seasonalIncreasePercent,
      weekendIncreasePercent: dynamicPricing.weekendIncreasePercent,
      monthlyBookingIncreasePercent: dynamicPricing.monthlyBookingIncreasePercent,
      monthlyConfirmedBookings: dynamicPricing.monthlyBookingCount,
      totalIncreasePercent: dynamicPricing.totalIncreasePercent,
    };

    sessionStorage.setItem("resortBookingDraft", JSON.stringify(payload));
    navigate("/resort-summary", { state: payload });

    setSubmitting(false);
  };

  const statusStyles =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

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
              Booking Form
            </h1>
            <div className="mx-auto mt-2 h-[2px] w-[270px] bg-white/80" />
          </div>

          <div className="rounded-md bg-white/15 px-5 py-8 shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur-[1px] sm:px-7 lg:px-8">
            {status.message ? (
              <div className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${statusStyles}`}>
                {status.message}
              </div>
            ) : null}

            <FormSection title="Personal Information">
              <Field
                label="First Name"
                placeholder="Enter first name"
                value={form.firstName}
                disabled={loadingProfile}
                error={errors.firstName}
                onChange={(v) =>
                  setField("firstName", v.replace(/[^A-Za-z\s]/g, "").slice(0, 30))
                }
              />

              <Field
                label="Last Name"
                placeholder="Enter last name"
                value={form.lastName}
                disabled={loadingProfile}
                error={errors.lastName}
                onChange={(v) =>
                  setField("lastName", v.replace(/[^A-Za-z\s]/g, "").slice(0, 30))
                }
              />

              <Field
                label="Email"
                placeholder="Enter email address"
                type="email"
                value={form.email}
                disabled={loadingProfile}
                error={errors.email}
                onChange={(v) => setField("email", v.replace(/\s/g, "").slice(0, 60))}
              />

              <Field
                label="Phone Number"
                placeholder="09XXXXXXXXX"
                value={form.phone}
                disabled={loadingProfile}
                error={errors.phone}
                inputMode="numeric"
                onChange={(v) =>
                  setField("phone", v.replace(/\D/g, "").slice(0, 11))
                }
              />
            </FormSection>

            <div className="mt-9">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-['Montserrat',sans-serif] text-[25px] font-semibold text-white sm:text-[30px]">
                    Booking Details
                  </h2>
                  <div className="mt-1 h-[2px] w-[210px] bg-white/60" />
                </div>

                <input
                  value="Resort & Venue"
                  disabled
                  readOnly
                  className="h-8 w-full rounded-md border-0 bg-white px-3 text-[12px] font-semibold text-[#3f5b44] outline-none sm:w-[250px]"
                />
              </div>

              <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-3">
                <SelectField
                  label="Choose Venue"
                  value={form.venue}
                  error={errors.venue}
                  disabled={loadingPackages}
                  placeholder={loadingPackages ? "Loading venues..." : "Select venue"}
                  options={venueOptions.map((item) => item.value)}
                  optionLabelMap={Object.fromEntries(
                    venueOptions.map((item) => [item.value, item.label])
                  )}
                  onChange={(value) => setField("venue", value)}
                />

                <DateField
                  label="Choose Date"
                  placeholder="Select date"
                  selectedDateObj={selectedDateObj}
                  minDateObj={minDateObj}
                  disabled={!form.venue || loadingCalendar}
                  error={errors.date}
                  filterDate={(d) => !isDateFullyBlocked(toLocalISO(d))}
                  onChange={(d) => setField("date", d ? toLocalISO(d) : "")}
                />

                <SelectField
                  label="Variation"
                  value={form.category}
                  error={errors.category}
                  disabled={!form.venue}
                  placeholder="Select variation"
                  options={categoryOptions}
                  optionLabelMap={categoryOptionLabelMap}
                  disabledOptions={disabledCategoryOptions}
                  onChange={(value) =>
                    setField("category", normalizeVariationLabel(value))
                  }
                />

                <SelectField
                  label="Time"
                  value={form.time}
                  error={errors.time}
                  disabled={
                    !form.venue ||
                    !form.category ||
                    !form.date ||
                    selectedVariationFullyBlocked
                  }
                  placeholder={
                    !form.venue
                      ? "Select venue first"
                      : !form.category
                      ? "Select variation first"
                      : !form.date
                      ? "Select date first"
                      : selectedVariationFullyBlocked
                      ? "Fully booked"
                      : `Select ${getCategoryLabel(form.category)} time`
                  }
                  options={availableTimeOptions.map((item) => item.value)}
                  optionLabelMap={Object.fromEntries(
                    availableTimeOptions.map((item) => [
                      item.value,
                      `${item.label}${item.disabled ? " — BOOKED" : ""}`,
                    ])
                  )}
                  disabledOptions={availableTimeOptions
                    .filter((item) => item.disabled)
                    .map((item) => item.value)}
                  onChange={(value) => setField("time", value)}
                />

                <Field
                  label="Number of Pax"
                  placeholder={maxBookablePax ? `Max ${maxBookablePax} pax` : "Enter number of pax"}
                  value={form.pax}
                  error={errors.pax}
                  inputMode="numeric"
                  max={maxBookablePax || undefined}
                  onChange={setPaxValue}
                />
              </div>

              {capacityLimit ? (
                <div className="mt-3 rounded-xl bg-white/15 px-4 py-3 text-xs font-semibold text-white/90">
                  <p>Base capacity: {baseCapacity} pax</p>
                  <p>
                    Additional pax allowed: up to {MAX_ADDITIONAL_PAX} pax at{" "}
                    {formatPeso(ADDITIONAL_PAX_RATE)} per person
                  </p>
                  <p className="font-extrabold">
                    Maximum bookable pax: {maxBookablePax} pax
                  </p>
                  {additionalPax > 0 ? (
                    <p className="mt-1 text-amber-100">
                      Additional charge: {additionalPax} pax ×{" "}
                      {formatPeso(ADDITIONAL_PAX_RATE)} ={" "}
                      {formatPeso(additionalPaxCharge)}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {errors.price ? (
                <p className="mt-3 text-xs font-semibold text-rose-100">
                  {errors.price}
                </p>
              ) : null}

              <div className="mt-9 rounded-md bg-[#f7f7f2] px-4 py-4 text-[#52675b]">
                <div className="flex items-center justify-between">
                  <p className="font-['Montserrat',sans-serif] text-[20px] font-extrabold sm:text-[25px]">
                    Total Amount:
                  </p>

                  <p className="font-['Montserrat',sans-serif] text-[20px] font-extrabold sm:text-[25px]">
                    {formatPeso(price)}
                  </p>
                </div>

                <div className="mt-3 grid gap-2 text-xs font-bold text-[#52675b]/80 sm:grid-cols-3">
                  <p>Base price: {formatPeso(baseAmount)}</p>
                  <p>Additional pax: {additionalPax}</p>
                  <p>Additional charge: {formatPeso(additionalPaxCharge)}</p>
                </div>
              </div>

              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={handleProceed}
                  disabled={submitting || loadingProfile}
                  type="button"
                  className="h-8 w-full rounded-full bg-white px-12 font-['Montserrat',sans-serif] text-[10px] font-extrabold uppercase text-[#3f5b44] shadow-sm transition hover:bg-[#fffde9] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[220px]"
                >
                  {submitting ? "Processing..." : "Proceed"}
                </button>

                <button
                  onClick={() => navigate("/resort-venue")}
                  disabled={submitting}
                  type="button"
                  className="h-8 w-full rounded-full bg-white px-12 font-['Montserrat',sans-serif] text-[10px] font-extrabold uppercase text-[#3f5b44] shadow-sm transition hover:bg-[#fffde9] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[220px]"
                >
                  Cancel
                </button>
              </div>
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
      <HotelFaqBot />
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
          <NavButton label="FAQs" onClick={() => navigate("/hotel-faqs")} />
          <NavButton label="FAQs" onClick={() => navigate("/hotel-faqs")} />
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

function FormSection({ title, children }) {
  return (
    <section>
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
  max,
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
        max={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
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
  optionLabelMap,
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
            key={`${option}-${index}`}
            value={option}
            disabled={disabledOptions.includes(option)}
            className="text-[#3f5b44]"
          >
            {optionLabelMap?.[option] ?? option}
          </option>
        ))}
      </select>

      {error ? (
        <p className="mt-1 text-xs font-semibold text-rose-100">{error}</p>
      ) : null}
    </div>
  );
}

function DateField({
  label,
  placeholder = "Select date",
  selectedDateObj,
  minDateObj,
  disabled,
  error,
  filterDate,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-extrabold text-white">
        {label}
      </label>

      <DatePicker
        selected={selectedDateObj}
        onChange={onChange}
        minDate={minDateObj}
        filterDate={filterDate}
        disabled={disabled}
        placeholderText={placeholder}
        dateFormat="MM/dd/yyyy"
        wrapperClassName="w-full"
        className="h-9 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold text-[#3f5b44] outline-none transition placeholder:text-[#3f5b44]/45 focus:ring-2 focus:ring-white/70 disabled:opacity-70"
      />

      {error ? (
        <p className="mt-1 text-xs font-semibold text-rose-100">{error}</p>
      ) : null}
    </div>
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
  return <p className="text-[10px] font-bold leading-4 text-[#2f523d]/85">{children}</p>;
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
            label="FAQS"
            onClick={() => {
              onClose();
              navigate("/hotel-faqs");
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
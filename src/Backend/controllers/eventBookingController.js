// src/Backend/controllers/eventBookingController.js
import EventBooking from "../models/EventBooking.js";
import ResortBooking from "../models/ResortBooking.js";
import HotelUser from "../models/hotelUser.js";
import HotelServicePackage from "../models/HotelServicePackage.js";
import {
  requireHotelUserAuth,
  requireHotelAdminAuth,
  isValidObjectId,
} from "../utils/hotelAuthHelpers.js";

const BOOKING_GAP_MINUTES = 60;
const BOOKING_GAP_MS = BOOKING_GAP_MINUTES * 60 * 1000;

const ADDITIONAL_PAX_RATE = 500;
const MAX_ADDITIONAL_PAX = 20;
const MAX_MENU_CHOICES_PER_CATEGORY = 2;

const MAIN_MENU_PREFIXES = ["Rice", "Pasta", "Chicken", "Pork", "Vegetable"];

const EVENT_TIME_SLOTS_8H = [
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

const EVENT_TIME_SLOTS_12H = [
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
];

const EVENT_TIME_SLOTS_22H = [
  "6:00 AM - 4:00 AM next day",
  "7:00 AM - 5:00 AM next day",
  "8:00 AM - 6:00 AM next day",
];

const EVENT_TIME_SLOTS_ALL = [
  ...EVENT_TIME_SLOTS_8H,
  ...EVENT_TIME_SLOTS_12H,
  ...EVENT_TIME_SLOTS_22H,
];

const DEFAULT_EVENT_VENUE_CAPACITY = {
  "LORENZO CAMPSITE": 30,
  "LORENZO VERANDA": 100,
  "LORENZO HALL": 100,
  "LORENZO CAVANAS": 100,
};

function getUserIdFromDecoded(decoded = {}) {
  return decoded.userId || decoded.id || decoded.hotelUserId || decoded._id || "";
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function splitMenuChoices(value = "") {
  return String(value || "")
    .split(",")
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function getMenuValidationError({ appetizer = "", mainDish = "", dessert = "", drinks = "" }) {
  const appetizerItems = splitMenuChoices(appetizer);
  const mainDishItems = splitMenuChoices(mainDish);
  const dessertItems = splitMenuChoices(dessert);
  const drinksItems = splitMenuChoices(drinks);

  if (!appetizerItems.length || !mainDishItems.length || !dessertItems.length || !drinksItems.length) {
    return "Please complete the food menu choices.";
  }

  if (appetizerItems.length > MAX_MENU_CHOICES_PER_CATEGORY) {
    return `Soup has a maximum of ${MAX_MENU_CHOICES_PER_CATEGORY} choices only.`;
  }

  if (dessertItems.length > MAX_MENU_CHOICES_PER_CATEGORY) {
    return `Dessert has a maximum of ${MAX_MENU_CHOICES_PER_CATEGORY} choices only.`;
  }

  if (drinksItems.length > MAX_MENU_CHOICES_PER_CATEGORY) {
    return `Drinks has a maximum of ${MAX_MENU_CHOICES_PER_CATEGORY} choices only.`;
  }

  for (const prefix of MAIN_MENU_PREFIXES) {
    const count = mainDishItems.filter((item) =>
      item.toLowerCase().startsWith(`${prefix.toLowerCase()} -`)
    ).length;

    if (count > MAX_MENU_CHOICES_PER_CATEGORY) {
      return `${prefix} has a maximum of ${MAX_MENU_CHOICES_PER_CATEGORY} choices only.`;
    }
  }

  return "";
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parsePaxFromLabel(label = "") {
  const match = String(label || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function todayLocalISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function normalizeVenue(value = "") {
  const text = cleanText(value).toUpperCase().replace(/\s+/g, " ");

  if (text.includes("LORENZO HALL")) return "LORENZO HALL";
  if (text.includes("LORENZO VERANDA")) return "LORENZO VERANDA";
  if (text.includes("LORENZO CABANAS") || text.includes("LORENZO CAVANAS")) {
    return "LORENZO CAVANAS";
  }
  if (text.includes("LORENZO CAMPSITE")) return "LORENZO CAMPSITE";

  return text;
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

function getPackageCapacityLimit(pkg, venue = "") {
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

  return DEFAULT_EVENT_VENUE_CAPACITY[normalizeVenue(venue)] || 0;
}

function normalizeTimeLabel(value = "") {
  const text = cleanText(value).toLowerCase();

  if (text.includes("22")) return "22 Hours";
  if (text.includes("12")) return "12 Hours";
  if (text.includes("8")) return "8 Hours";

  return cleanText(value) || "8 Hours";
}

function getDefaultEventTimeSlots(label = "8 Hours") {
  const normalized = normalizeTimeLabel(label);

  if (normalized === "22 Hours") return EVENT_TIME_SLOTS_22H;
  if (normalized === "12 Hours") return EVENT_TIME_SLOTS_12H;
  return EVENT_TIME_SLOTS_8H;
}

function cleanTimeSlots(value, fallbackLabel = "8 Hours") {
  const manual = Array.isArray(value)
    ? value.map((slot) => cleanText(slot)).filter(Boolean)
    : [];

  return manual.length ? manual : getDefaultEventTimeSlots(fallbackLabel);
}

function inferTimeLabelFromSlots(slots = []) {
  const normalized = Array.isArray(slots)
    ? slots.map((slot) => cleanText(slot)).filter(Boolean)
    : [];

  for (const label of ["8 Hours", "12 Hours", "22 Hours"]) {
    const defaults = getDefaultEventTimeSlots(label);
    if (
      defaults.length === normalized.length &&
      defaults.every((slot) => normalized.includes(slot))
    ) {
      return label;
    }
  }

  return normalized.length ? "Custom Time" : "8 Hours";
}

function isValidEventTimeSlot(time = "", allowedSlots = EVENT_TIME_SLOTS_ALL) {
  const clean = cleanText(time);
  return Array.isArray(allowedSlots) && allowedSlots.includes(clean);
}

function stripTimePrefix(value = "") {
  return String(value || "")
    .replace(/^daytime:\s*/i, "")
    .replace(/^nighttime:\s*/i, "")
    .replace(/^overnight:\s*/i, "")
    .replace(/^8 hours:\s*/i, "")
    .replace(/^full-day:\s*/i, "")
    .trim();
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

function addDaysToISO(dateString, days) {
  const [year, month, day] = String(dateString).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function buildBookingInterval(eventDate, time) {
  const range = parseTimeRange(time);

  if (!range) return null;

  const base = dateToPhMidnight(eventDate);

  return {
    startDateTime: addMinutes(base, range.startMinutes),
    endDateTime: addMinutes(base, range.endMinutes),
  };
}

function intervalsOverlapWithGap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart < bEnd + BOOKING_GAP_MS && bStart < aEnd + BOOKING_GAP_MS;
}

function normalizeBookingInterval(booking) {
  if (booking.startDateTime && booking.endDateTime) {
    return {
      startDateTime: new Date(booking.startDateTime),
      endDateTime: new Date(booking.endDateTime),
    };
  }

  const bookingDate = booking.eventDate || booking.date || "";
  return buildBookingInterval(bookingDate, booking.time);
}

async function findEventPackage({ packageId = "", eventPackage = "" }) {
  if (packageId && isValidObjectId(packageId)) {
    const found = await HotelServicePackage.findOne({
      _id: packageId,
      type: "event_package",
      isActive: true,
    }).lean();

    if (found) return found;
  }

  const title = cleanText(eventPackage);

  if (!title) return null;

  const packages = await HotelServicePackage.find({
    type: "event_package",
    isActive: true,
  }).lean();

  return (
    packages.find(
      (item) => cleanText(item.title).toLowerCase() === title.toLowerCase()
    ) || null
  );
}

async function findActiveResortVenue(venue = "") {
  const normalizedVenue = normalizeVenue(venue);

  if (!normalizedVenue) return null;

  const packages = await HotelServicePackage.find({
    type: "resort_venue",
    isActive: true,
  }).lean();

  return (
    packages.find((item) => normalizeVenue(item.title) === normalizedVenue) ||
    null
  );
}

function getActiveEventVariants(selectedPackage = {}) {
  return Array.isArray(selectedPackage.variants)
    ? selectedPackage.variants
        .filter((variant) => variant?.isActive !== false)
        .map((variant, index) => {
          const pax = Number(variant?.pax || parsePaxFromLabel(variant?.label));
          const timeSlots = cleanTimeSlots(
            variant?.timeSlots,
            variant?.timeVariationLabel || variant?.duration || variant?.label || "8 Hours"
          );
          const timeVariationLabel = inferTimeLabelFromSlots(timeSlots);
          const label =
            cleanText(variant?.label) ||
            (pax ? `${pax} Pax - ${timeVariationLabel}` : "");

          return {
            _id: variant?._id ? String(variant._id) : "",
            id: variant?._id ? String(variant._id) : "",
            label,
            pax,
            price: Number(variant.price || 0),
            timeVariationLabel,
            timeSlots,
            displayOrder: Number(variant.displayOrder || index + 1),
          };
        })
        .filter(
          (variant) =>
            variant.label &&
            variant.pax > 0 &&
            variant.price > 0 &&
            Array.isArray(variant.timeSlots) &&
            variant.timeSlots.length > 0
        )
        .sort(
          (a, b) =>
            Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
            Number(a.pax || 0) - Number(b.pax || 0) ||
            String(a.timeVariationLabel || "").localeCompare(
              String(b.timeVariationLabel || "")
            )
        )
    : [];
}

async function resolveEventPrice({
  packageId = "",
  eventPackage = "",
  venue = "",
  pax = 0,
  basePax = 0,
  variantId = "",
}) {
  const selectedPackage = await findEventPackage({
    packageId,
    eventPackage,
  });

  if (!selectedPackage) {
    return {
      ok: false,
      status: 400,
      message: "Selected event package was not found or is inactive.",
    };
  }

  const normalizedVenue = normalizeVenue(venue);
  const venuePackage = await findActiveResortVenue(normalizedVenue);

  if (!venuePackage) {
    return {
      ok: false,
      status: 400,
      message: "Selected venue is not active or does not exist in Resort & Venue packages.",
    };
  }

  const venueCapacity = getPackageCapacityLimit(venuePackage, normalizedVenue) || 0;

  if (!Number.isFinite(pax) || pax <= 0) {
    return {
      ok: false,
      status: 400,
      message: "Pax must be at least 1.",
    };
  }

  const activeVariants = getActiveEventVariants(selectedPackage);
  let selectedVariant = null;
  const cleanVariantId = cleanText(variantId);

  if (activeVariants.length) {
    if (cleanVariantId) {
      selectedVariant = activeVariants.find(
        (variant) => String(variant._id || variant.id) === cleanVariantId
      );
    }

    if (!selectedVariant && basePax && basePax > 0) {
      selectedVariant = activeVariants.find(
        (variant) => Number(variant.pax) === Number(basePax)
      );
    }

    if (!selectedVariant && activeVariants.length === 1) {
      selectedVariant = activeVariants[0];
    }

    if (!selectedVariant) {
      return {
        ok: false,
        status: 400,
        message: "Please select a valid package capacity and time variation.",
      };
    }
  }

  const baseAmount = Number(
    selectedVariant?.price || selectedPackage.price || 0
  );

  if (!baseAmount) {
    return {
      ok: false,
      status: 400,
      message: "This event package has no valid price.",
    };
  }

  const finalBasePax = Number(
    selectedVariant?.pax || basePax || extractMaxCapacity(selectedPackage.capacity) || pax
  );

  if (!finalBasePax || finalBasePax <= 0) {
    return {
      ok: false,
      status: 400,
      message: "This event package has no valid base pax configured.",
    };
  }

  const maxAllowedPax = finalBasePax + MAX_ADDITIONAL_PAX;

  if (pax > maxAllowedPax) {
    return {
      ok: false,
      status: 400,
      message: `Maximum pax for this package capacity is ${maxAllowedPax} (${finalBasePax} base pax plus ${MAX_ADDITIONAL_PAX} additional pax only).`,
    };
  }

  // Food is included in the selected package pax tier.
  // Example: 50 Pax variation = package food price for 50 pax.
  // If the user books more than the selected variation pax, charge per extra pax.
  const foodIncludedPax = finalBasePax;
  const chargeableFoodPax = Math.max(0, pax - foodIncludedPax);
  const foodChargePerExtraPax = ADDITIONAL_PAX_RATE;
  const foodCharge = chargeableFoodPax * foodChargePerExtraPax;

  const additionalPax = chargeableFoodPax;
  const additionalPaxCharge = foodCharge;
  const totalAmount = baseAmount + foodCharge;

  return {
    ok: true,
    selectedPackage,
    selectedVariant,
    venuePackage,
    normalizedVenue,
    eventPackage: selectedPackage.title,
    selectedVariantId: selectedVariant?._id || cleanVariantId || "",
    selectedVariantLabel: selectedVariant?.label || "",
    timeVariationLabel: selectedVariant?.timeVariationLabel || "8 Hours",
    timeSlots: selectedVariant?.timeSlots?.length
      ? selectedVariant.timeSlots
      : EVENT_TIME_SLOTS_8H,
    basePax: finalBasePax,
    foodIncludedPax,
    chargeableFoodPax,
    foodChargePerExtraPax,
    foodCharge,
    venueCapacity,
    maxAdditionalPax: MAX_ADDITIONAL_PAX,
    additionalPax,
    additionalPaxRate: ADDITIONAL_PAX_RATE,
    baseAmount,
    additionalPaxCharge,
    totalAmount,
  };
}

async function getEventBookingsForAvailability({ venue, from, to }) {
  const normalizedVenue = normalizeVenue(venue);
  const eventDateQuery = {};
  const resortDateQuery = {};

  if (from) {
    eventDateQuery.$gte = addDaysToISO(from, -1);
    resortDateQuery.$gte = addDaysToISO(from, -1);
  }

  if (to) {
    eventDateQuery.$lte = addDaysToISO(to, 1);
    resortDateQuery.$lte = addDaysToISO(to, 1);
  }

  const eventQuery = {
    venue: normalizedVenue,
    isActive: true,
    status: { $in: ["PENDING", "CONFIRMED"] },
  };

  const resortQuery = {
    venue: normalizedVenue,
    isActive: true,
    status: { $in: ["PENDING", "CONFIRMED"] },
  };

  if (Object.keys(eventDateQuery).length) eventQuery.eventDate = eventDateQuery;
  if (Object.keys(resortDateQuery).length) resortQuery.date = resortDateQuery;

  const [eventRows, resortRows] = await Promise.all([
    EventBooking.find(eventQuery)
      .select("_id eventPackage eventDate venue time status startDateTime endDateTime createdAt")
      .lean(),
    ResortBooking.find(resortQuery)
      .select("_id venue date category time status startDateTime endDateTime createdAt")
      .lean(),
  ]);

  return [
    ...eventRows.map((booking) => ({
      ...booking,
      bookingType: "event",
      sourceLabel: "Event Package",
      date: booking.eventDate,
      title: booking.eventPackage || "Event Package Booking",
    })),
    ...resortRows.map((booking) => ({
      ...booking,
      bookingType: "resort",
      sourceLabel: "Resort & Venue",
      eventDate: booking.date,
      title: booking.category || "Resort & Venue Booking",
    })),
  ].sort((a, b) => {
    const aTime = new Date(a.startDateTime || a.createdAt || 0).getTime();
    const bTime = new Date(b.startDateTime || b.createdAt || 0).getTime();
    return aTime - bTime;
  });
}

function getBlockedTimeSlotsForDate(bookings = [], eventDate, candidateSlots = EVENT_TIME_SLOTS_ALL) {
  return candidateSlots.filter((slot) => {
    const candidate = buildBookingInterval(eventDate, slot);
    if (!candidate) return true;

    return bookings.some((booking) => {
      const existing = normalizeBookingInterval(booking);
      if (!existing?.startDateTime || !existing?.endDateTime) return false;

      return intervalsOverlapWithGap(
        existing.startDateTime,
        existing.endDateTime,
        candidate.startDateTime,
        candidate.endDateTime
      );
    });
  });
}

function getAvailableTimeSlotsForDate(bookings = [], eventDate, candidateSlots = EVENT_TIME_SLOTS_ALL) {
  const blocked = new Set(getBlockedTimeSlotsForDate(bookings, eventDate, candidateSlots));
  return candidateSlots.filter((slot) => !blocked.has(slot));
}

async function findEventTimeConflict({ venue, eventDate, time, excludeBookingId = "" }) {
  const interval = buildBookingInterval(eventDate, time);

  if (!interval) return null;

  const candidates = await getEventBookingsForAvailability({
    venue,
    from: eventDate,
    to: eventDate,
  });

  return (
    candidates.find((booking) => {
      if (excludeBookingId && String(booking._id) === String(excludeBookingId)) {
        return false;
      }

      const existing = normalizeBookingInterval(booking);
      if (!existing?.startDateTime || !existing?.endDateTime) return false;

      return intervalsOverlapWithGap(
        existing.startDateTime,
        existing.endDateTime,
        interval.startDateTime,
        interval.endDateTime
      );
    }) || null
  );
}

async function resolveEventTimeOptionsFromRequest(query = {}) {
  const packageId = cleanText(query.packageId || query.selectedPackageId || "");
  const eventPackage = cleanText(query.eventPackage || query.selectedPackageTitle || "");
  const variantId = cleanText(query.variantId || query.selectedVariantId || "");
  const basePax = toNumber(query.basePax);

  if (!packageId && !eventPackage) {
    return {
      timeSlots: EVENT_TIME_SLOTS_ALL,
      timeVariationLabel: "All Event Time Variations",
      selectedVariant: null,
    };
  }

  const selectedPackage = await findEventPackage({ packageId, eventPackage });
  const variants = getActiveEventVariants(selectedPackage || {});

  let selectedVariant = null;

  if (variantId) {
    selectedVariant = variants.find(
      (variant) => String(variant._id || variant.id) === variantId
    );
  }

  if (!selectedVariant && basePax > 0) {
    selectedVariant = variants.find((variant) => Number(variant.pax) === basePax);
  }

  if (!selectedVariant && variants.length === 1) {
    selectedVariant = variants[0];
  }

  if (selectedVariant) {
    return {
      timeSlots: selectedVariant.timeSlots,
      timeVariationLabel: selectedVariant.timeVariationLabel,
      selectedVariant,
    };
  }

  return {
    timeSlots: EVENT_TIME_SLOTS_ALL,
    timeVariationLabel: "All Event Time Variations",
    selectedVariant: null,
  };
}

/* ===================== USER: EVENT BOOKED DATES ===================== */
export const getEventBookedDates = async (req, res) => {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  try {
    const venue = normalizeVenue(req.query.venue || "");
    const from = cleanText(req.query.from || "");
    const to = cleanText(req.query.to || "");

    if (!venue || !from || !to) {
      return res.status(400).json({
        success: false,
        message: "venue, from, and to are required.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range format.",
      });
    }

    const venuePackage = await findActiveResortVenue(venue);

    if (!venuePackage) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive venue.",
      });
    }

    const timeOptions = await resolveEventTimeOptionsFromRequest(req.query);
    const candidateSlots = timeOptions.timeSlots?.length
      ? timeOptions.timeSlots
      : EVENT_TIME_SLOTS_ALL;

    const rows = await getEventBookingsForAvailability({ venue, from, to });
    const fullBookedDates = [];
    const blockedTimeSlotsByDate = {};
    const availableTimeSlotsByDate = {};

    const startDate = new Date(`${from}T00:00:00+08:00`);
    const endDate = new Date(`${to}T00:00:00+08:00`);

    for (let cursor = new Date(startDate); cursor <= endDate; cursor.setDate(cursor.getDate() + 1)) {
      const iso = cursor.toISOString().slice(0, 10);
      const blocked = getBlockedTimeSlotsForDate(rows, iso, candidateSlots);
      const available = candidateSlots.filter((slot) => !blocked.includes(slot));

      if (blocked.length) blockedTimeSlotsByDate[iso] = blocked;
      if (available.length !== candidateSlots.length) {
        availableTimeSlotsByDate[iso] = available;
      }
      if (available.length === 0) fullBookedDates.push(iso);
    }

    return res.status(200).json({
      success: true,
      bookedDates: fullBookedDates,
      fullBookedDates,
      blockedTimeSlotsByDate,
      availableTimeSlotsByDate,
      bookings: rows,
      timeSlots: candidateSlots,
      timeVariationLabel: timeOptions.timeVariationLabel,
      selectedVariant: timeOptions.selectedVariant,
    });
  } catch (err) {
    console.error("getEventBookedDates error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching booked event dates and resort venue conflicts.",
    });
  }
};

/* ===================== USER: CHECK EVENT AVAILABILITY ===================== */
export const checkEventAvailability = async (req, res) => {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  try {
    const venue = normalizeVenue(req.query.venue || "");
    const eventDate = cleanText(req.query.eventDate || req.query.date || "");
    const time = cleanText(req.query.time || "");

    if (!venue || !eventDate) {
      return res.status(400).json({
        success: false,
        available: false,
        message: "venue and eventDate are required.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      return res.status(400).json({
        success: false,
        available: false,
        message: "Invalid eventDate format.",
      });
    }

    if (eventDate < todayLocalISO()) {
      return res.status(400).json({
        success: false,
        available: false,
        message: "Event date cannot be in the past.",
      });
    }

    const venuePackage = await findActiveResortVenue(venue);

    if (!venuePackage) {
      return res.status(400).json({
        success: false,
        available: false,
        message: "Invalid or inactive venue.",
      });
    }

    const timeOptions = await resolveEventTimeOptionsFromRequest(req.query);
    const candidateSlots = timeOptions.timeSlots?.length
      ? timeOptions.timeSlots
      : EVENT_TIME_SLOTS_ALL;

    if (time) {
      if (!isValidEventTimeSlot(time, candidateSlots)) {
        return res.status(400).json({
          success: false,
          available: false,
          message: `Invalid event time slot for ${timeOptions.timeVariationLabel}.`,
        });
      }

      const conflict = await findEventTimeConflict({ venue, eventDate, time });

      return res.status(200).json({
        success: true,
        available: !conflict,
        message: conflict
          ? "This time slot is already blocked by a pending or approved Resort & Venue / Event Package booking, including the required 1-hour gap. If the admin rejects or cancels that booking, the slot will open again."
          : "Event time slot is available.",
        conflict: conflict || null,
        timeSlots: candidateSlots,
        timeVariationLabel: timeOptions.timeVariationLabel,
        selectedVariant: timeOptions.selectedVariant,
      });
    }

    const rows = await getEventBookingsForAvailability({
      venue,
      from: eventDate,
      to: eventDate,
    });
    const blockedTimeSlots = getBlockedTimeSlotsForDate(rows, eventDate, candidateSlots);
    const availableTimeSlots = candidateSlots.filter(
      (slot) => !blockedTimeSlots.includes(slot)
    );

    return res.status(200).json({
      success: true,
      available: availableTimeSlots.length > 0,
      message: availableTimeSlots.length
        ? "This date still has available event time slots."
        : "This date is fully booked for this venue.",
      blockedTimeSlots,
      availableTimeSlots,
      timeSlots: candidateSlots,
      timeVariationLabel: timeOptions.timeVariationLabel,
      selectedVariant: timeOptions.selectedVariant,
    });
  } catch (err) {
    console.error("checkEventAvailability error:", err);

    return res.status(500).json({
      success: false,
      available: false,
      message: "Error checking event availability.",
    });
  }
};

/* ===================== USER: CREATE EVENT BOOKING ===================== */
export const createEventBooking = async (req, res) => {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  try {
    const userId = getUserIdFromDecoded(auth.decoded);

    if (!isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token userId.",
      });
    }

    const user = await HotelUser.findById(userId).select(
      "firstName lastName email phone active"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated.",
      });
    }

    const serviceType = cleanText(req.body.serviceType || "Event Package");
    const packageId = cleanText(req.body.packageId);
    const eventPackage = cleanText(req.body.eventPackage);
    const variantId = cleanText(req.body.variantId || req.body.selectedVariantId);
    const eventDate = cleanText(req.body.eventDate);
    const venue = normalizeVenue(req.body.venue);
    const time = cleanText(req.body.time);
    const pax = toNumber(req.body.pax);
    const basePax = toNumber(req.body.basePax);
    const eventTheme = cleanText(req.body.eventTheme);
    const eventType = cleanText(req.body.eventType);
    const foodAllergy = cleanText(req.body.foodAllergy);
    const specialRequest = cleanText(req.body.specialRequest);
    const appetizer = cleanText(req.body.appetizer);
    const mainDish = cleanText(req.body.mainDish);
    const dessert = cleanText(req.body.dessert);
    const drinks = cleanText(req.body.drinks);
    const paymentMethod = cleanText(req.body.paymentMethod).toUpperCase();

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Proof of payment is required.",
      });
    }

    if (!["BANK TRANSFER", "GCASH"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    if (!eventPackage || !eventDate || !venue || !time) {
      return res.status(400).json({
        success: false,
        message: "Event package, date, venue, and time are required.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date format.",
      });
    }

    if (eventDate < todayLocalISO()) {
      return res.status(400).json({
        success: false,
        message: "Event date cannot be in the past.",
      });
    }

    if (!eventTheme || !eventType) {
      return res.status(400).json({
        success: false,
        message: "Event theme and event type are required.",
      });
    }

    const menuError = getMenuValidationError({
      appetizer,
      mainDish,
      dessert,
      drinks,
    });

    if (menuError) {
      return res.status(400).json({
        success: false,
        message: menuError,
      });
    }

    const priceResult = await resolveEventPrice({
      packageId,
      eventPackage,
      venue,
      pax,
      basePax,
      variantId,
    });

    if (!priceResult.ok) {
      return res.status(priceResult.status || 400).json({
        success: false,
        message: priceResult.message,
      });
    }

    if (!isValidEventTimeSlot(time, priceResult.timeSlots)) {
      return res.status(400).json({
        success: false,
        message: `Invalid event time slot for ${priceResult.timeVariationLabel}.`,
      });
    }

    const bookingInterval = buildBookingInterval(eventDate, time);

    if (!bookingInterval) {
      return res.status(400).json({
        success: false,
        message: "Invalid event time range.",
      });
    }

    const conflict = await findEventTimeConflict({ venue, eventDate, time });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message:
          "This event time slot is already blocked by a pending or approved Resort & Venue / Event Package booking, including the required 1-hour gap. If the admin rejects or cancels that booking, the slot will open again.",
      });
    }

    const booking = await EventBooking.create({
      userId: user._id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",

      serviceType,
      packageId: priceResult.selectedPackage?._id
        ? String(priceResult.selectedPackage._id)
        : packageId,
      eventPackage: priceResult.eventPackage || eventPackage,
      selectedVariantId: priceResult.selectedVariantId,
      selectedVariantLabel: priceResult.selectedVariantLabel,
      timeVariationLabel: priceResult.timeVariationLabel,
      selectedTimeSlots: priceResult.timeSlots,
      eventDate,
      venue: priceResult.normalizedVenue,
      time,
      startDateTime: bookingInterval.startDateTime,
      endDateTime: bookingInterval.endDateTime,
      pax,
      basePax: priceResult.basePax,
      venueCapacity: priceResult.venueCapacity,
      maxAdditionalPax: priceResult.maxAdditionalPax,
      additionalPax: priceResult.additionalPax,
      additionalPaxRate: priceResult.additionalPaxRate,
      foodIncludedPax: priceResult.foodIncludedPax,
      chargeableFoodPax: priceResult.chargeableFoodPax,
      foodChargePerExtraPax: priceResult.foodChargePerExtraPax,
      foodCharge: priceResult.foodCharge,
      baseAmount: priceResult.baseAmount,
      additionalPaxCharge: priceResult.additionalPaxCharge,
      eventTheme,
      eventType,
      foodAllergy,
      specialRequest,
      appetizer,
      mainDish,
      dessert,
      drinks,
      paymentMethod,
      totalAmount: priceResult.totalAmount,

      proof: {
        data: req.file.buffer,
        contentType: req.file.mimetype || "",
        filename: req.file.originalname || "",
        size: req.file.size || 0,
      },

      status: "PENDING",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Event booking submitted successfully. Waiting for admin approval.",
      booking: {
        _id: booking._id,
        serviceType: booking.serviceType,
        eventPackage: booking.eventPackage,
        selectedVariantId: booking.selectedVariantId,
        selectedVariantLabel: booking.selectedVariantLabel,
        timeVariationLabel: booking.timeVariationLabel,
        eventDate: booking.eventDate,
        venue: booking.venue,
        time: booking.time,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
        pax: booking.pax,
        basePax: booking.basePax,
        venueCapacity: booking.venueCapacity,
        additionalPax: booking.additionalPax,
        additionalPaxRate: booking.additionalPaxRate,
        foodIncludedPax: booking.foodIncludedPax,
        chargeableFoodPax: booking.chargeableFoodPax,
        foodChargePerExtraPax: booking.foodChargePerExtraPax,
        foodCharge: booking.foodCharge,
        baseAmount: booking.baseAmount,
        additionalPaxCharge: booking.additionalPaxCharge,
        totalAmount: booking.totalAmount,
        paymentMethod: booking.paymentMethod,
        status: booking.status,
        createdAt: booking.createdAt,
      },
    });
  } catch (err) {
    console.error("createEventBooking error:", err);

    return res.status(500).json({
      success: false,
      message: "Error creating event booking.",
    });
  }
};

/* ===================== USER: MY EVENT BOOKINGS ===================== */
export const getMyEventBookings = async (req, res) => {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  try {
    const userId = getUserIdFromDecoded(auth.decoded);

    const rows = await EventBooking.find({ userId })
      .select("-proof.data")
      .sort({ createdAt: -1 });

    return res.status(200).json(rows);
  } catch (err) {
    console.error("getMyEventBookings error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching event bookings.",
    });
  }
};

/* ===================== ADMIN: LIST EVENT BOOKINGS ===================== */
export const adminGetAllEventBookings = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({
      success: false,
      message: guard.message,
    });
  }

  try {
    const rows = await EventBooking.find()
      .select("-proof.data")
      .sort({ createdAt: -1 });

    return res.status(200).json(rows);
  } catch (err) {
    console.error("adminGetAllEventBookings error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching event bookings.",
    });
  }
};

/* ===================== ADMIN: VIEW PROOF ===================== */
export const adminGetEventBookingProof = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({
      success: false,
      message: guard.message,
    });
  }

  const { bookingId } = req.params;

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bookingId.",
    });
  }

  try {
    const booking = await EventBooking.findById(bookingId).select("+proof.data");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Event booking not found.",
      });
    }

    if (!booking.proof?.data) {
      return res.status(404).json({
        success: false,
        message: "No proof uploaded.",
      });
    }

    res.setHeader(
      "Content-Type",
      booking.proof.contentType || "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(
        booking.proof.filename || "event-proof"
      )}"`
    );

    return res.status(200).send(booking.proof.data);
  } catch (err) {
    console.error("adminGetEventBookingProof error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching event booking proof.",
    });
  }
};

/* ===================== ADMIN: UPDATE STATUS ===================== */
export const adminUpdateEventBookingStatus = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({
      success: false,
      message: guard.message,
    });
  }

  const { bookingId } = req.params;
  const nextStatus = cleanText(req.body.status).toUpperCase();

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bookingId.",
    });
  }

  if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(nextStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status.",
    });
  }

  try {
    const booking = await EventBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Event booking not found.",
      });
    }

    booking.venue = normalizeVenue(booking.venue);

    if (nextStatus === "PENDING" || nextStatus === "CONFIRMED") {
      const interval = buildBookingInterval(booking.eventDate, booking.time);

      if (!interval) {
        return res.status(400).json({
          success: false,
          message: "Invalid event booking time range.",
        });
      }

      const conflict = await findEventTimeConflict({
        venue: booking.venue,
        eventDate: booking.eventDate,
        time: booking.time,
        excludeBookingId: bookingId,
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message:
            "Cannot activate/approve. This time is blocked by another pending or approved Resort & Venue / Event Package booking. If the other booking is rejected/cancelled, the slot will open again.",
        });
      }

      booking.startDateTime = interval.startDateTime;
      booking.endDateTime = interval.endDateTime;
      booking.isActive = true;
    }

    if (nextStatus === "CANCELLED") {
      booking.isActive = false;
    }

    booking.status = nextStatus;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Event booking status updated.",
      booking,
    });
  } catch (err) {
    console.error("adminUpdateEventBookingStatus error:", err);

    return res.status(500).json({
      success: false,
      message: "Error updating event booking status.",
    });
  }
};

/* ===================== ADMIN: RESCHEDULE APPROVED EVENT BOOKING ===================== */
export const adminRescheduleEventBooking = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({
      success: false,
      message: guard.message,
    });
  }

  const { bookingId } = req.params;
  const eventDate = cleanText(req.body.eventDate || req.body.date || "");
  const time = cleanText(req.body.time || "");

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bookingId.",
    });
  }

  if (!eventDate || !time) {
    return res.status(400).json({
      success: false,
      message: "date and time are required.",
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid event date format.",
    });
  }

  if (eventDate < todayLocalISO()) {
    return res.status(400).json({
      success: false,
      message: "Event date cannot be in the past.",
    });
  }

  try {
    const booking = await EventBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Event booking not found.",
      });
    }

    if (String(booking.status || "").toUpperCase() !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Only approved event bookings can be rescheduled.",
      });
    }

    booking.venue = normalizeVenue(booking.venue);

    const allowedSlots = Array.isArray(booking.selectedTimeSlots) && booking.selectedTimeSlots.length
      ? booking.selectedTimeSlots.map((slot) => cleanText(slot)).filter(Boolean)
      : EVENT_TIME_SLOTS_ALL;

    if (!isValidEventTimeSlot(time, allowedSlots)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event time slot for this selected package variation.",
      });
    }

    const interval = buildBookingInterval(eventDate, time);

    if (!interval) {
      return res.status(400).json({
        success: false,
        message: "Invalid event time range.",
      });
    }

    const conflict = await findEventTimeConflict({
      venue: booking.venue,
      eventDate,
      time,
      excludeBookingId: bookingId,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message:
          "This time is blocked by another pending or approved Resort & Venue / Event Package booking. Please keep at least 1 hour gap.",
        conflict,
      });
    }

    booking.eventDate = eventDate;
    booking.time = time;
    booking.startDateTime = interval.startDateTime;
    booking.endDateTime = interval.endDateTime;
    booking.isActive = true;
    booking.status = "CONFIRMED";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Event booking rescheduled successfully.",
      booking,
    });
  } catch (err) {
    console.error("adminRescheduleEventBooking error:", err);

    return res.status(500).json({
      success: false,
      message: "Error rescheduling event booking.",
    });
  }
};



function getAdminRescheduleRange(query = {}) {
  const from = cleanText(query.from || todayLocalISO());
  const days = Math.min(365, Math.max(1, Number(query.days || 180)));
  const to = cleanText(query.to || addDaysToISO(from, days));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return { ok: false, message: "Invalid date range format." };
  }

  if (to < from) {
    return { ok: false, message: "The to date must be after the from date." };
  }

  return { ok: true, from, to };
}

function listIsoDatesBetween(from, to, maxDays = 370) {
  const dates = [];
  let cursor = from;

  while (cursor <= to && dates.length < maxDays) {
    dates.push(cursor);
    cursor = addDaysToISO(cursor, 1);
  }

  return dates;
}

/* ===================== ADMIN: EVENT RESCHEDULE BLOCKED DATES/TIMES ===================== */
export const adminGetEventRescheduleOptions = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({
      success: false,
      message: guard.message,
    });
  }

  const { bookingId } = req.params;

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bookingId.",
    });
  }

  const range = getAdminRescheduleRange(req.query);
  if (!range.ok) {
    return res.status(400).json({
      success: false,
      message: range.message,
    });
  }

  try {
    const booking = await EventBooking.findById(bookingId).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Event booking not found.",
      });
    }

    if (String(booking.status || "").toUpperCase() !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Only approved event bookings can be rescheduled.",
      });
    }

    const venue = normalizeVenue(booking.venue);
    const timeSlots = Array.isArray(booking.selectedTimeSlots) && booking.selectedTimeSlots.length
      ? booking.selectedTimeSlots.map((slot) => cleanText(slot)).filter(Boolean)
      : EVENT_TIME_SLOTS_ALL;

    const rows = await getEventBookingsForAvailability({
      venue,
      from: range.from,
      to: range.to,
    });

    const candidates = rows.filter((row) => {
      return !(row.bookingType === "event" && String(row._id) === String(bookingId));
    });

    const blockedTimeSlotsByDate = {};
    const availableTimeSlotsByDate = {};
    const fullBookedDates = [];
    const partiallyBlockedDates = [];

    for (const date of listIsoDatesBetween(range.from, range.to)) {
      const blocked = getBlockedTimeSlotsForDate(candidates, date, timeSlots);
      const available = timeSlots.filter((slot) => !blocked.includes(slot));

      if (blocked.length) {
        blockedTimeSlotsByDate[date] = blocked;
        partiallyBlockedDates.push(date);
      }

      availableTimeSlotsByDate[date] = available;

      if (!available.length) {
        fullBookedDates.push(date);
      }
    }

    return res.status(200).json({
      success: true,
      bookingType: "event",
      bookingId,
      excludedBookingId: bookingId,
      venue,
      from: range.from,
      to: range.to,
      timeSlots,
      timeVariationLabel: booking.timeVariationLabel || "Event Time Variation",
      bookedDates: fullBookedDates,
      fullBookedDates,
      partiallyBlockedDates,
      blockedTimeSlotsByDate,
      availableTimeSlotsByDate,
      bookings: candidates,
      requiredGapMinutes: BOOKING_GAP_MINUTES,
    });
  } catch (err) {
    console.error("adminGetEventRescheduleOptions error:", err);
    return res.status(500).json({
      success: false,
      message: "Error loading event reschedule blocked dates.",
    });
  }
};

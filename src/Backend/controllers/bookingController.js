import HotelUser from "../models/hotelUser.js";
import ResortBooking from "../models/ResortBooking.js";
import EventBooking from "../models/EventBooking.js";
import HotelServicePackage from "../models/HotelServicePackage.js";
import {
  requireHotelUserAuth,
  requireHotelAdminAuth,
  isValidObjectId,
} from "../utils/hotelAuthHelpers.js";

const BOOKING_GAP_MINUTES = 60;
const BOOKING_GAP_MS = BOOKING_GAP_MINUTES * 60 * 1000;


const SEASONAL_MARKUP_PERCENT = 10;
const WEEKEND_MARKUP_PERCENT = 5;
const MONTHLY_BOOKING_MARKUP_PERCENT = 1;

function getDatePartsFromISO(dateString = "") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateString || ""))) return null;

  const [year, month, day] = String(dateString).split("-").map(Number);
  if (!year || !month || !day) return null;

  return { year, month, day };
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

function getMonthRange(dateString = "") {
  const parts = getDatePartsFromISO(dateString);
  if (!parts) return null;

  const lastDay = new Date(parts.year, parts.month, 0).getDate();

  return {
    from: `${parts.year}-${String(parts.month).padStart(2, "0")}-01`,
    to: `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
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
    seasonalIncreasePercent,
    weekendIncreasePercent,
    monthlyBookingIncreasePercent,
    monthlyConfirmedBookings: safeMonthlyCount,
    totalIncreasePercent,
  };
}


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

const DEFAULT_VARIANTS_BY_VENUE = {
  "LORENZO HALL": [
    {
      label: "8 Hours",
      price: 15000,
      timeSlots: EIGHT_HOUR_TIME_SLOTS,
      displayOrder: 1,
      isActive: true,
    },
  ],

  "LORENZO VERANDA": [
    {
      label: "8 Hours",
      price: 12000,
      timeSlots: EIGHT_HOUR_TIME_SLOTS,
      displayOrder: 1,
      isActive: true,
    },
  ],

  "LORENZO CAMPSITE": [
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

  "LORENZO CAVANAS": [
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
};

const DEFAULT_CAPACITY_BY_VENUE = {
  "LORENZO HALL": 100,
  "LORENZO VERANDA": 100,
  "LORENZO CAMPSITE": 30,
  "LORENZO CAVANAS": 100,
};

function getUserIdFromDecoded(decoded = {}) {
  return decoded.userId || decoded.id || decoded.hotelUserId || decoded._id || "";
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function normalizeVenue(value = "") {
  const v = cleanText(value).toUpperCase().replace(/\s+/g, " ");

  if (v.includes("LORENZO HALL")) return "LORENZO HALL";
  if (v.includes("LORENZO VERANDA")) return "LORENZO VERANDA";

  if (v.includes("LORENZO CABANAS") || v.includes("LORENZO CAVANAS")) {
    return "LORENZO CAVANAS";
  }

  if (v.includes("LORENZO CAMPSITE")) return "LORENZO CAMPSITE";

  return v;
}

function normalizeVariationLabel(value = "") {
  const text = cleanText(value).toLowerCase();

  if (text.includes("8")) return "8 Hours";
  if (text.includes("12")) return "12 Hours";
  if (text.includes("22")) return "22 Hours";

  return cleanText(value);
}

function getDefaultTimeSlots(label = "") {
  return DEFAULT_TIME_SLOTS_BY_LABEL[normalizeVariationLabel(label)] || [];
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

function normalizeSubmittedTime(_venue, time) {
  const clean = cleanText(time);

  if (/^(12 hours|22 hours|full-day):/i.test(clean)) {
    return stripTimePrefix(clean);
  }

  return clean;
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

  return DEFAULT_CAPACITY_BY_VENUE[normalizeVenue(venue)] || null;
}

function normalizeVariant(item = {}, index = 0) {
  const label = normalizeVariationLabel(item.label || "");
  const manualSlots = Array.isArray(item.timeSlots)
    ? item.timeSlots.map((slot) => cleanText(slot)).filter(Boolean)
    : [];

  return {
    label,
    price: Number(item.price || 0),
    timeSlots: manualSlots.length ? manualSlots : getDefaultTimeSlots(label),
    displayOrder: Number(item.displayOrder || index + 1),
    isActive: item.isActive === false ? false : true,
  };
}

function inferVariantsFromPackage(pkg = {}) {
  const duration = cleanText(pkg.duration);
  const labels = [];

  if (/8/i.test(duration)) labels.push("8 Hours");
  if (/12/i.test(duration)) labels.push("12 Hours");
  if (/22/i.test(duration)) labels.push("22 Hours");

  return labels.map((label, index) => ({
    label,
    price: Number(pkg.price || 0),
    timeSlots: getDefaultTimeSlots(label),
    displayOrder: index + 1,
    isActive: true,
  }));
}

function packageScore(pkg = {}) {
  const variants = Array.isArray(pkg.variants) ? pkg.variants : [];
  const activeVariants = variants.filter((item) => item?.isActive !== false);

  const hasUsefulVariants = activeVariants.some((item) => {
    const normalized = normalizeVariant(item);
    return normalized.label && normalized.timeSlots.length;
  });

  return [
    hasUsefulVariants ? 1 : 0,
    Number(pkg.isActive !== false),
    Number(pkg.displayOrder || 0) * -1,
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

async function findPackageForVenue(venue) {
  const normalizedVenue = normalizeVenue(venue);

  const packages = await HotelServicePackage.find({
    type: "resort_venue",
    isActive: true,
  }).lean();

  let chosen = null;

  for (const pkg of packages) {
    if (normalizeVenue(pkg.title) === normalizedVenue && isBetterPackage(pkg, chosen)) {
      chosen = pkg;
    }
  }

  return chosen;
}

async function getVenueVariants(venue) {
  const normalizedVenue = normalizeVenue(venue);
  const pkg = await findPackageForVenue(normalizedVenue);

  const dbVariants = Array.isArray(pkg?.variants)
    ? pkg.variants
        .map(normalizeVariant)
        .filter((item) => item.isActive && item.label && item.timeSlots.length)
        .sort(
          (a, b) =>
            Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
            String(a.label).localeCompare(String(b.label))
        )
    : [];

  if (dbVariants.length) return dbVariants;

  const inferred = pkg ? inferVariantsFromPackage(pkg) : [];
  if (inferred.length) return inferred;

  return DEFAULT_VARIANTS_BY_VENUE[normalizedVenue] || [];
}

async function getVariantForCategory(venue, category) {
  const variants = await getVenueVariants(venue);
  const normalizedCategory = normalizeVariationLabel(category);

  return variants.find((item) => item.label === normalizedCategory) || null;
}

async function getCategoryOptions(venue) {
  const variants = await getVenueVariants(venue);
  return variants.map((item) => item.label);
}

async function getTimeOptions(venue, category) {
  const variant = await getVariantForCategory(venue, category);
  return variant?.timeSlots || [];
}

async function isValidVenueFromPackages(venue) {
  const variants = await getVenueVariants(venue);
  return variants.length > 0;
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

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function dateToPhMidnight(dateString) {
  return new Date(`${dateString}T00:00:00+08:00`);
}

function addDaysToISO(dateString, days) {
  const [year, month, day] = String(dateString).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function getPreviousDateString(dateString) {
  return addDaysToISO(dateString, -1);
}

function getNextDateString(dateString) {
  return addDaysToISO(dateString, 1);
}

function buildBookingInterval(date, time) {
  const range = parseTimeRange(time);

  if (!range) return null;

  const base = dateToPhMidnight(date);

  return {
    startDateTime: addMinutes(base, range.startMinutes),
    endDateTime: addMinutes(base, range.endMinutes),
    startMinutes: range.startMinutes,
    endMinutes: range.endMinutes,
  };
}

function getSlotPeriod(category, time) {
  const clean = cleanText(time);
  const normalizedCategory = normalizeVariationLabel(category);

  if (normalizedCategory === "22 Hours") return "FULLDAY";
  if (/^daytime:/i.test(clean)) return "DAYTIME";
  if (/^(nighttime|overnight):/i.test(clean)) return "OVERNIGHT";

  const range = parseTimeRange(clean);
  if (range && range.endMinutes > 24 * 60) return "OVERNIGHT";

  return "DAYTIME";
}

function intervalsOverlapWithGap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart < bEnd + BOOKING_GAP_MS && bStart < aEnd + BOOKING_GAP_MS;
}

async function computePrice(venue, category) {
  const variant = await getVariantForCategory(venue, category);
  if (!variant) return null;

  return Number(variant.price || 0);
}

async function countMonthlyConfirmedResortBookings({ venue, date, excludeBookingId = "" }) {
  const range = getMonthRange(date);
  if (!range) return 0;

  const query = {
    venue: normalizeVenue(venue),
    status: "CONFIRMED",
    isActive: true,
    date: { $gte: range.from, $lte: range.to },
  };

  if (excludeBookingId && isValidObjectId(excludeBookingId)) {
    query._id = { $ne: excludeBookingId };
  }

  return ResortBooking.countDocuments(query);
}


function todayLocalISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function getBookingPaxFromBody(body = {}) {
  const directPax =
    body.pax !== undefined && body.pax !== null && body.pax !== ""
      ? Number(body.pax)
      : null;

  if (Number.isFinite(directPax)) return directPax;

  const totalGuests =
    body.totalGuests !== undefined &&
    body.totalGuests !== null &&
    body.totalGuests !== ""
      ? Number(body.totalGuests)
      : null;

  if (Number.isFinite(totalGuests)) return totalGuests;

  return Number(body.adults || 0) + Number(body.kids || 0);
}

function normalizeBookingInterval(booking) {
  if (booking.startDateTime && booking.endDateTime) {
    return {
      startDateTime: new Date(booking.startDateTime),
      endDateTime: new Date(booking.endDateTime),
    };
  }

  const bookingDate = booking.date || booking.eventDate || "";
  return buildBookingInterval(bookingDate, booking.time);
}

async function findConfirmedTimeConflict({
  venue,
  startDateTime,
  endDateTime,
  excludeBookingId = "",
}) {
  const normalizedVenue = normalizeVenue(venue);

  const resortQuery = {
    venue: normalizedVenue,
    status: { $in: ["PENDING", "CONFIRMED"] },
    isActive: true,
  };

  const eventQuery = {
    venue: normalizedVenue,
    status: { $in: ["PENDING", "CONFIRMED"] },
    isActive: true,
  };

  if (excludeBookingId && isValidObjectId(excludeBookingId)) {
    resortQuery._id = { $ne: excludeBookingId };
    eventQuery._id = { $ne: excludeBookingId };
  }

  const [resortCandidates, eventCandidates] = await Promise.all([
    ResortBooking.find(resortQuery)
      .select("_id venue date category time status startDateTime endDateTime")
      .lean(),
    EventBooking.find(eventQuery)
      .select("_id eventPackage eventDate venue time status startDateTime endDateTime")
      .lean(),
  ]);

  const candidates = [
    ...resortCandidates.map((booking) => ({
      ...booking,
      bookingType: "resort",
      sourceLabel: "Resort & Venue",
    })),
    ...eventCandidates.map((booking) => ({
      ...booking,
      date: booking.eventDate,
      category: "Event Package",
      bookingType: "event",
      sourceLabel: "Event Package",
    })),
  ];

  return (
    candidates.find((booking) => {
      const existing = normalizeBookingInterval(booking);
      if (!existing?.startDateTime || !existing?.endDateTime) return false;

      return intervalsOverlapWithGap(
        existing.startDateTime,
        existing.endDateTime,
        startDateTime,
        endDateTime
      );
    }) || null
  );
}

function buildCalendarSummary(rows = []) {
  const bookings = rows
    .map((row) => {
      const interval = normalizeBookingInterval(row);

      return {
        _id: row._id,
        venue: row.venue,
        date: row.date,
        category: row.category,
        time: normalizeSubmittedTime(row.venue, row.time),
        slotPeriod: row.slotPeriod || getSlotPeriod(row.category, row.time),
        status: row.status,
        startDateTime: interval?.startDateTime || null,
        endDateTime: interval?.endDateTime || null,
      };
    })
    .filter((item) => item.startDateTime && item.endDateTime);

  const affectedDates = new Set();

  bookings.forEach((booking) => {
    affectedDates.add(String(booking.date).slice(0, 10));
  });

  return {
    bookedDates: [...affectedDates],
    bookings,
  };
}

export const getBookedDates = async (req, res) => {
  const auth = requireHotelUserAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  try {
    const venue = normalizeVenue(req.query.venue || "");
    const from = cleanText(req.query.from || "");
    const to = cleanText(req.query.to || "");

    if (!venue || !from || !to) {
      return res.status(400).json({
        message: "venue, from, and to are required.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({ message: "Invalid date range format." });
    }

    const validVenue = await isValidVenueFromPackages(venue);
    if (!validVenue) {
      return res.status(400).json({
        message:
          "Invalid venue. Please make sure this resort package has at least one active variation.",
      });
    }

    const previousFrom = getPreviousDateString(from);
    const nextTo = getNextDateString(to);

    const [resortRows, eventRows] = await Promise.all([
      ResortBooking.find({
        venue,
        status: { $in: ["PENDING", "CONFIRMED"] },
        isActive: true,
        date: { $gte: previousFrom, $lte: nextTo },
      })
        .select("_id venue date category time slotPeriod status startDateTime endDateTime")
        .lean(),

      EventBooking.find({
        venue,
        status: { $in: ["PENDING", "CONFIRMED"] },
        isActive: true,
        eventDate: { $gte: previousFrom, $lte: nextTo },
      })
        .select("_id eventPackage eventDate venue time status startDateTime endDateTime")
        .lean(),
    ]);

    const rows = [
      ...resortRows.map((booking) => ({
        ...booking,
        bookingType: "resort",
        sourceLabel: "Resort & Venue",
      })),
      ...eventRows.map((booking) => ({
        ...booking,
        date: booking.eventDate,
        category: "Event Package",
        slotPeriod: getSlotPeriod("Event Package", booking.time),
        bookingType: "event",
        sourceLabel: "Event Package",
      })),
    ];

    return res.status(200).json(buildCalendarSummary(rows));
  } catch (err) {
    console.error("getBookedDates error:", err);
    return res.status(500).json({ message: "Error fetching booked dates." });
  }
};

export const createResortBooking = async (req, res) => {
  const auth = requireHotelUserAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  try {
    const userId = getUserIdFromDecoded(auth.decoded);

    if (!isValidObjectId(userId)) {
      return res.status(401).json({ message: "Invalid token userId" });
    }

    const user = await HotelUser.findById(userId).select(
      "firstName lastName email phone active"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.active === false) {
      return res.status(403).json({ message: "Account is deactivated." });
    }

    const venue = normalizeVenue(req.body.venue || "");
    const date = cleanText(req.body.date || "");
    const category = normalizeVariationLabel(req.body.category || "");
    const time = normalizeSubmittedTime(venue, req.body.time || "");
    const paymentMethod = cleanText(req.body.paymentMethod || "").toUpperCase();
    const pax = getBookingPaxFromBody(req.body);

    if (!req.file) {
      return res.status(400).json({ message: "Proof of payment is required." });
    }

    if (!["BANK TRANSFER", "GCASH"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    if (!venue || !date || !category || !time) {
      return res.status(400).json({ message: "Missing required booking fields." });
    }

    const validVenue = await isValidVenueFromPackages(venue);
    if (!validVenue) {
      return res.status(400).json({
        message:
          "Invalid venue. Please make sure this resort package has at least one active variation.",
      });
    }

    const selectedPackage = await findPackageForVenue(venue);
    const capacityLimit = getPackageCapacityLimit(selectedPackage, venue);

    if (!Number.isFinite(pax) || pax <= 0) {
      return res.status(400).json({ message: "Pax must be at least 1." });
    }

    if (capacityLimit && pax > capacityLimit) {
      return res.status(400).json({
        message: `Maximum capacity for this venue is ${capacityLimit} pax.`,
      });
    }

    const categoryOptions = await getCategoryOptions(venue);

    if (!categoryOptions.includes(category)) {
      return res.status(400).json({ message: "Invalid variation for venue." });
    }

    const timeOptions = await getTimeOptions(venue, category);

    if (!timeOptions.includes(time)) {
      return res.status(400).json({
        message: "Invalid time slot for venue/variation.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    if (date < todayLocalISO()) {
      return res.status(400).json({ message: "Date cannot be in the past." });
    }

    const interval = buildBookingInterval(date, time);
    if (!interval) {
      return res.status(400).json({ message: "Invalid time range." });
    }

    const basePrice = await computePrice(venue, category);
    if (basePrice === null) {
      return res.status(400).json({ message: "Price cannot be computed." });
    }

    const monthlyConfirmedBookings = await countMonthlyConfirmedResortBookings({
      venue,
      date,
    });

    const dynamicPricing = calculateDynamicPrice({
      basePrice,
      date,
      monthlyBookingCount: monthlyConfirmedBookings,
    });

    const price = dynamicPricing.finalPrice;

    const conflict = await findConfirmedTimeConflict({
      venue,
      startDateTime: interval.startDateTime,
      endDateTime: interval.endDateTime,
    });

    if (conflict) {
      return res.status(409).json({
        message:
          "This time is blocked by a pending or approved Resort & Venue / Event Package booking. Please keep at least 1 hour gap before or after another booking. If the admin rejects or cancels that booking, the slot will open again.",
      });
    }

    const booking = await ResortBooking.create({
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      serviceType: "Resort & Venue",
      venue,
      date,
      category,
      time,
      slotPeriod: getSlotPeriod(category, time),
      startDateTime: interval.startDateTime,
      endDateTime: interval.endDateTime,
      pax,
      totalGuests: pax,
      adults: 0,
      kids: 0,
      price,
      basePrice: dynamicPricing.basePrice,
      seasonalIncreasePercent: dynamicPricing.seasonalIncreasePercent,
      weekendIncreasePercent: dynamicPricing.weekendIncreasePercent,
      monthlyBookingIncreasePercent: dynamicPricing.monthlyBookingIncreasePercent,
      monthlyConfirmedBookings: dynamicPricing.monthlyConfirmedBookings,
      totalIncreasePercent: dynamicPricing.totalIncreasePercent,
      paymentMethod,
      proof: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname,
        size: req.file.size,
      },
      status: "PENDING",
      isActive: true,
    });

    return res.status(201).json({
      message: "Booking created successfully! Waiting for admin approval.",
      booking: {
        _id: booking._id,
        userId: booking.userId,
        venue: booking.venue,
        date: booking.date,
        category: booking.category,
        time: booking.time,
        slotPeriod: booking.slotPeriod,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
        pax: booking.pax,
        totalGuests: booking.totalGuests,
        price: booking.price,
        basePrice: booking.basePrice,
        seasonalIncreasePercent: booking.seasonalIncreasePercent,
        weekendIncreasePercent: booking.weekendIncreasePercent,
        monthlyBookingIncreasePercent: booking.monthlyBookingIncreasePercent,
        monthlyConfirmedBookings: booking.monthlyConfirmedBookings,
        totalIncreasePercent: booking.totalIncreasePercent,
        paymentMethod: booking.paymentMethod,
        status: booking.status,
        isActive: booking.isActive,
        createdAt: booking.createdAt,
      },
    });
  } catch (err) {
    console.error("createResortBooking error:", err);
    return res.status(500).json({ message: "Error creating booking." });
  }
};

export const checkResortAvailability = async (req, res) => {
  const auth = requireHotelUserAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  try {
    const venue = normalizeVenue(req.query.venue || "");
    const date = cleanText(req.query.date || "");
    const category = normalizeVariationLabel(req.query.category || "");
    const time = normalizeSubmittedTime(venue, req.query.time || "");

    if (!venue || !date || !category || !time) {
      return res.status(400).json({
        message: "venue, date, variation, and time are required.",
      });
    }

    const validVenue = await isValidVenueFromPackages(venue);
    if (!validVenue) {
      return res.status(400).json({
        message:
          "Invalid venue. Please make sure this resort package has at least one active variation.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    const validTimes = await getTimeOptions(venue, category);

    if (!validTimes.includes(time)) {
      return res.status(400).json({
        message: "Invalid time slot for venue/variation.",
      });
    }

    const interval = buildBookingInterval(date, time);
    if (!interval) {
      return res.status(400).json({ message: "Invalid time range." });
    }

    const conflict = await findConfirmedTimeConflict({
      venue,
      startDateTime: interval.startDateTime,
      endDateTime: interval.endDateTime,
    });

    const basePrice = await computePrice(venue, category);
    const monthlyConfirmedBookings = await countMonthlyConfirmedResortBookings({
      venue,
      date,
    });
    const dynamicPricing = calculateDynamicPrice({
      basePrice: basePrice || 0,
      date,
      monthlyBookingCount: monthlyConfirmedBookings,
    });

    return res.status(200).json({
      available: !conflict,
      basePrice,
      price: dynamicPricing.finalPrice,
      dynamicPricing,
      startDateTime: interval.startDateTime,
      endDateTime: interval.endDateTime,
      slotPeriod: getSlotPeriod(category, time),
      requiredGapMinutes: BOOKING_GAP_MINUTES,
      message: conflict
        ? "This time is blocked by a pending or approved Resort & Venue / Event Package booking. Please keep at least 1 hour gap before or after another booking. If the admin rejects or cancels that booking, the slot will open again."
        : "Slot is available.",
    });
  } catch (err) {
    console.error("checkResortAvailability error:", err);
    return res.status(500).json({ message: "Error checking availability." });
  }
};

export const getMyResortBookings = async (req, res) => {
  const auth = requireHotelUserAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  try {
    const userId = getUserIdFromDecoded(auth.decoded);

    const rows = await ResortBooking.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(rows);
  } catch (err) {
    console.error("getMyResortBookings error:", err);
    return res.status(500).json({ message: "Error fetching bookings." });
  }
};

export const adminGetAllResortBookings = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  try {
    const rows = await ResortBooking.find().sort({ createdAt: -1 });
    return res.status(200).json(rows);
  } catch (err) {
    console.error("adminGetAllResortBookings error:", err);
    return res.status(500).json({ message: "Error fetching bookings." });
  }
};

export const adminGetResortBookingProof = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const { bookingId } = req.params;

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({ message: "Invalid bookingId" });
  }

  try {
    const booking = await ResortBooking.findById(bookingId).select("+proof.data");

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (!booking.proof?.data) {
      return res.status(404).json({ message: "No proof uploaded." });
    }

    res.setHeader(
      "Content-Type",
      booking.proof.contentType || "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(
        booking.proof.filename || "proof"
      )}"`
    );

    return res.status(200).send(booking.proof.data);
  } catch (err) {
    console.error("adminGetResortBookingProof error:", err);
    return res.status(500).json({ message: "Error fetching proof." });
  }
};

export const adminUpdateResortBookingStatus = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const { bookingId } = req.params;

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({ message: "Invalid bookingId" });
  }

  const nextStatus = cleanText(req.body.status || "").toUpperCase();

  if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(nextStatus)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  try {
    const booking = await ResortBooking.findById(bookingId);

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    booking.venue = normalizeVenue(booking.venue);
    booking.category = normalizeVariationLabel(booking.category);
    booking.time = normalizeSubmittedTime(booking.venue, booking.time);

    const interval = buildBookingInterval(booking.date, booking.time);
    if (!interval) {
      return res.status(400).json({ message: "Invalid booking time range." });
    }

    if (nextStatus === "PENDING" || nextStatus === "CONFIRMED") {
      const conflict = await findConfirmedTimeConflict({
        venue: booking.venue,
        startDateTime: interval.startDateTime,
        endDateTime: interval.endDateTime,
        excludeBookingId: bookingId,
      });

      if (conflict) {
        return res.status(409).json({
          message:
            "Cannot activate/approve. This time is blocked by another pending or approved Resort & Venue / Event Package booking. Please keep at least 1 hour gap. If the other booking is rejected/cancelled, the slot will open again.",
        });
      }

      booking.isActive = true;
    }

    if (nextStatus === "CANCELLED") {
      booking.isActive = false;
    }

    if (nextStatus === "PENDING") {
      booking.isActive = true;
    }

    booking.status = nextStatus;
    booking.slotPeriod = getSlotPeriod(booking.category, booking.time);
    booking.startDateTime = interval.startDateTime;
    booking.endDateTime = interval.endDateTime;

    await booking.save();

    return res.status(200).json({
      message: "Status updated.",
      booking,
    });
  } catch (err) {
    console.error("adminUpdateResortBookingStatus error:", err);
    return res.status(500).json({ message: "Error updating booking status." });
  }
};

export const adminRescheduleResortBooking = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const { bookingId } = req.params;

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({ message: "Invalid bookingId" });
  }

  const date = cleanText(req.body.date || "");

  try {
    const booking = await ResortBooking.findById(bookingId);

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (
      booking.isActive === false ||
      String(booking.status || "").toUpperCase() === "CANCELLED"
    ) {
      return res.status(400).json({
        message: "Cannot reschedule a cancelled booking.",
      });
    }

    booking.venue = normalizeVenue(booking.venue);
    booking.category = normalizeVariationLabel(booking.category);

    const time = normalizeSubmittedTime(booking.venue, req.body.time || "");

    if (!date || !time) {
      return res.status(400).json({ message: "date and time are required." });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    if (date < todayLocalISO()) {
      return res.status(400).json({ message: "Date cannot be in the past." });
    }

    const validTimes = await getTimeOptions(booking.venue, booking.category);
    if (!validTimes.includes(time)) {
      return res.status(400).json({
        message: "Invalid time slot for this venue/variation.",
      });
    }

    const interval = buildBookingInterval(date, time);
    if (!interval) {
      return res.status(400).json({ message: "Invalid time range." });
    }

    if (String(booking.status || "").toUpperCase() === "CONFIRMED") {
      const conflict = await findConfirmedTimeConflict({
        venue: booking.venue,
        startDateTime: interval.startDateTime,
        endDateTime: interval.endDateTime,
        excludeBookingId: bookingId,
      });

      if (conflict) {
        return res.status(409).json({
          message:
            "This time is blocked by another pending or approved Resort & Venue / Event Package booking. Please keep at least 1 hour gap. If the other booking is rejected/cancelled, the slot will open again.",
        });
      }
    }

    booking.date = date;
    booking.time = time;
    booking.slotPeriod = getSlotPeriod(booking.category, time);
    booking.startDateTime = interval.startDateTime;
    booking.endDateTime = interval.endDateTime;

    await booking.save();

    return res.status(200).json({
      message: "Booking rescheduled successfully.",
      booking,
    });
  } catch (err) {
    console.error("adminRescheduleResortBooking error:", err);
    return res.status(500).json({ message: "Error rescheduling booking." });
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

function getBlockedResortTimeSlotsForDate(bookings = [], date, candidateSlots = []) {
  return candidateSlots.filter((slot) => {
    const candidate = buildBookingInterval(date, slot);
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

/* ===================== ADMIN: RESORT RESCHEDULE BLOCKED DATES/TIMES ===================== */
export const adminGetResortRescheduleOptions = async (req, res) => {
  const guard = requireHotelAdminAuth(req);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const { bookingId } = req.params;

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({ success: false, message: "Invalid bookingId." });
  }

  const range = getAdminRescheduleRange(req.query);
  if (!range.ok) {
    return res.status(400).json({ success: false, message: range.message });
  }

  try {
    const booking = await ResortBooking.findById(bookingId).lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (String(booking.status || "").toUpperCase() !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Only approved Resort & Venue bookings can be rescheduled.",
      });
    }

    const venue = normalizeVenue(booking.venue);
    const category = normalizeVariationLabel(booking.category);
    const timeSlots = await getTimeOptions(venue, category);

    const [resortRows, eventRows] = await Promise.all([
      ResortBooking.find({
        _id: { $ne: bookingId },
        venue,
        status: { $in: ["PENDING", "CONFIRMED"] },
        isActive: true,
        date: { $gte: addDaysToISO(range.from, -1), $lte: addDaysToISO(range.to, 1) },
      })
        .select("_id venue date category time slotPeriod status startDateTime endDateTime")
        .lean(),
      EventBooking.find({
        venue,
        status: { $in: ["PENDING", "CONFIRMED"] },
        isActive: true,
        eventDate: { $gte: addDaysToISO(range.from, -1), $lte: addDaysToISO(range.to, 1) },
      })
        .select("_id eventPackage eventDate venue time status startDateTime endDateTime")
        .lean(),
    ]);

    const candidates = [
      ...resortRows.map((row) => ({ ...row, bookingType: "resort", sourceLabel: "Resort & Venue" })),
      ...eventRows.map((row) => ({
        ...row,
        date: row.eventDate,
        category: "Event Package",
        bookingType: "event",
        sourceLabel: "Event Package",
      })),
    ];

    const blockedTimeSlotsByDate = {};
    const availableTimeSlotsByDate = {};
    const fullBookedDates = [];
    const partiallyBlockedDates = [];

    for (const date of listIsoDatesBetween(range.from, range.to)) {
      const blocked = getBlockedResortTimeSlotsForDate(candidates, date, timeSlots);
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
      bookingType: "resort",
      bookingId,
      excludedBookingId: bookingId,
      venue,
      category,
      from: range.from,
      to: range.to,
      timeSlots,
      bookedDates: fullBookedDates,
      fullBookedDates,
      partiallyBlockedDates,
      blockedTimeSlotsByDate,
      availableTimeSlotsByDate,
      bookings: candidates,
      requiredGapMinutes: BOOKING_GAP_MINUTES,
    });
  } catch (err) {
    console.error("adminGetResortRescheduleOptions error:", err);
    return res.status(500).json({
      success: false,
      message: "Error loading Resort & Venue reschedule blocked dates.",
    });
  }
};

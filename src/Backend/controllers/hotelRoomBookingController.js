// src/Backend/controllers/hotelRoomBookingController.js
import HotelRoomBooking from "../models/HotelRoomBooking.js";
import HotelUser from "../models/hotelUser.js";
import HotelServicePackage from "../models/HotelServicePackage.js";
import {
  requireHotelUserAuth,
  requireHotelAdminAuth,
  isValidObjectId,
} from "../utils/hotelAuthHelpers.js";

const BOOKING_GAP_MINUTES = 60;
const BOOKING_GAP_MS = BOOKING_GAP_MINUTES * 60 * 1000;
const BLOCKING_STATUSES = ["PENDING", "CONFIRMED"];


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


const DEFAULT_ROOM_RATES = {
  "8 Hours": {
    Nature: { price: 700, maxPax: 5 },
    Simple: { price: 1500, maxPax: 3 },
  },
  "12 Hours": {
    Nature: { price: 1000, maxPax: 5 },
    Simple: { price: 2000, maxPax: 3 },
  },
  "22 Hours": {
    Nature: { price: 1500, maxPax: 5 },
    Simple: { price: 2500, maxPax: 3 },
  },
};

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

function getUserIdFromDecoded(decoded = {}) {
  return decoded.userId || decoded.id || decoded.hotelUserId || decoded._id || "";
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeDuration(value = "") {
  const text = cleanText(value).toLowerCase();

  if (text.includes("8")) return "8 Hours";
  if (text.includes("12")) return "12 Hours";
  if (text.includes("22")) return "22 Hours";

  return cleanText(value);
}

function normalizeRoomType(value = "") {
  const text = cleanText(value);
  const lower = text.toLowerCase();

  if (lower.includes("nature")) return "Nature";
  if (lower.includes("simple")) return "Simple";

  return text
    .replace(/\s*-\s*\d+\s*hours?/i, "")
    .replace(/\s+\d+\s*hours?/i, "")
    .trim();
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

function normalizeSubmittedTime(_duration, time = "") {
  const clean = cleanText(time);

  if (/^(8 hours|12 hours|22 hours|full-day):/i.test(clean)) {
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

function todayLocalISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
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

function buildBookingInterval(date, time) {
  const range = parseTimeRange(time);

  if (!range) return null;

  const base = dateToPhMidnight(date);

  return {
    startDateTime: addMinutes(base, range.startMinutes),
    endDateTime: addMinutes(base, range.endMinutes),
  };
}

function addDaysToISO(dateString, days) {
  const [year, month, day] = String(dateString).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function intervalsOverlapWithGap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart < bEnd + BOOKING_GAP_MS && bStart < aEnd + BOOKING_GAP_MS;
}

function getTimeOptions(duration) {
  return HOTEL_TIME_SLOTS_BY_DURATION[normalizeDuration(duration)] || [];
}

function normalizeBookingInterval(booking) {
  if (booking.startDateTime && booking.endDateTime) {
    return {
      startDateTime: new Date(booking.startDateTime),
      endDateTime: new Date(booking.endDateTime),
    };
  }

  return buildBookingInterval(booking.date, booking.time);
}

async function countMonthlyConfirmedHotelBookings({ roomType, date, excludeBookingId = "" }) {
  const range = getMonthRange(date);
  if (!range) return 0;

  const query = {
    roomType: normalizeRoomType(roomType),
    status: "CONFIRMED",
    isActive: true,
    date: { $gte: range.from, $lte: range.to },
  };

  if (excludeBookingId && isValidObjectId(excludeBookingId)) {
    query._id = { $ne: excludeBookingId };
  }

  return HotelRoomBooking.countDocuments(query);
}


async function findPackageByIdOrTitle({ packageId = "", packageTitle = "" }) {
  if (packageId && isValidObjectId(packageId)) {
    const found = await HotelServicePackage.findOne({
      _id: packageId,
      type: "hotel_condo",
      isActive: true,
    }).lean();

    if (found) return found;
  }

  const cleanTitle = cleanText(packageTitle);
  if (!cleanTitle) return null;

  const packages = await HotelServicePackage.find({
    type: "hotel_condo",
    isActive: true,
  }).lean();

  return (
    packages.find(
      (item) =>
        cleanText(item.title).toLowerCase() === cleanTitle.toLowerCase()
    ) || null
  );
}

async function resolveHotelRoomRate(body = {}) {
  const packageId = cleanText(body.packageId || body.selectedPackageId || "");
  const packageTitle = cleanText(
    body.packageTitle ||
      body.selectedPackageTitle ||
      body.selectedPackage ||
      ""
  );

  const selectedPackage = await findPackageByIdOrTitle({
    packageId,
    packageTitle,
  });

  const requestedDuration = normalizeDuration(body.duration || "");
  const activeVariants = Array.isArray(selectedPackage?.variants)
    ? selectedPackage.variants
        .filter((variant) => variant?.isActive !== false)
        .map((variant, index) => ({
          ...variant,
          label: normalizeDuration(variant.label),
          displayOrder: Number(variant.displayOrder || index + 1),
        }))
        .sort(
          (a, b) =>
            Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
            String(a.label || "").localeCompare(String(b.label || ""))
        )
    : [];

  const selectedVariant =
    activeVariants.find((variant) => variant.label === requestedDuration) ||
    activeVariants[0] ||
    null;

  const duration = normalizeDuration(
    selectedVariant?.label || selectedPackage?.duration || body.duration || ""
  );

  const roomType = normalizeRoomType(selectedPackage?.title || body.roomType || "");

  const variantTimeSlots = Array.isArray(selectedVariant?.timeSlots)
    ? selectedVariant.timeSlots.map((item) => cleanText(item)).filter(Boolean)
    : [];

  const timeSlots = variantTimeSlots.length
    ? variantTimeSlots
    : getTimeOptions(duration);

  const fallback = DEFAULT_ROOM_RATES?.[duration]?.[roomType] || null;

  const priceFromVariant = Number(selectedVariant?.price || 0);
  const priceFromPackage = Number(selectedPackage?.price || 0);
  const maxPaxFromPackage = extractMaxCapacity(selectedPackage?.capacity);

  const price = priceFromVariant || priceFromPackage || fallback?.price || 0;
  const maxPax = maxPaxFromPackage || fallback?.maxPax || 0;

  if (!duration || !roomType || !price || !maxPax || !timeSlots.length) {
    return null;
  }

  return {
    selectedPackage,
    selectedVariant,
    packageId: selectedPackage?._id || null,
    packageTitle: selectedPackage?.title || packageTitle,
    duration,
    roomType,
    price,
    maxPax,
    timeSlots,
  };
}

async function findConfirmedTimeConflict({
  roomType,
  startDateTime,
  endDateTime,
  excludeBookingId = "",
}) {
  const query = {
    roomType: normalizeRoomType(roomType),
    status: { $in: BLOCKING_STATUSES },
    isActive: true,
  };

  if (excludeBookingId && isValidObjectId(excludeBookingId)) {
    query._id = { $ne: excludeBookingId };
  }

  const candidates = await HotelRoomBooking.find(query).select(
    "_id date time status isActive startDateTime endDateTime"
  );

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
        roomType: row.roomType,
        duration: row.duration,
        date: row.date,
        time: row.time,
        status: row.status,
        startDateTime: interval?.startDateTime || null,
        endDateTime: interval?.endDateTime || null,
      };
    })
    .filter((item) => item.startDateTime && item.endDateTime);

  const bookedDates = new Set();

  bookings.forEach((booking) => {
    bookedDates.add(String(booking.date).slice(0, 10));
  });

  return {
    bookedDates: [...bookedDates],
    bookings,
  };
}

/* ===================== USER: BOOKED DATES ===================== */
export const getHotelRoomBookedDates = async (req, res) => {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  try {
    const roomType = normalizeRoomType(req.query.roomType || "");
    const from = cleanText(req.query.from || "");
    const to = cleanText(req.query.to || "");

    if (!roomType || !from || !to) {
      return res.status(400).json({
        success: false,
        message: "roomType, from, and to are required.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range format.",
      });
    }

    const rows = await HotelRoomBooking.find({
      roomType,
      status: "CONFIRMED",
      isActive: true,
      date: {
        $gte: addDaysToISO(from, -1),
        $lte: addDaysToISO(to, 1),
      },
    }).select("_id roomType duration date time status startDateTime endDateTime");

    return res.status(200).json({
      success: true,
      ...buildCalendarSummary(rows),
    });
  } catch (err) {
    console.error("getHotelRoomBookedDates error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching booked hotel room dates.",
    });
  }
};

/* ===================== USER: CREATE HOTEL ROOM BOOKING ===================== */
export const createHotelRoomBooking = async (req, res) => {
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

    const resolved = await resolveHotelRoomRate(req.body);

    if (!resolved) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel package, room type, or duration.",
      });
    }

    const date = cleanText(req.body.date);
    const time = normalizeSubmittedTime(resolved.duration, req.body.time || "");
    const pax = toNumber(req.body.pax);
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

    if (!resolved.roomType || !resolved.duration || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Room type, duration, date, and time are required.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format.",
      });
    }

    if (date < todayLocalISO()) {
      return res.status(400).json({
        success: false,
        message: "Date cannot be in the past.",
      });
    }

    if (!Number.isFinite(pax) || pax <= 0) {
      return res.status(400).json({
        success: false,
        message: "Pax must be at least 1.",
      });
    }

    if (pax > resolved.maxPax) {
      return res.status(400).json({
        success: false,
        message: `${resolved.roomType} room allows maximum ${resolved.maxPax} pax only.`,
      });
    }

    if (!resolved.timeSlots.includes(time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot for this duration.",
      });
    }

    const interval = buildBookingInterval(date, time);
    if (!interval) {
      return res.status(400).json({
        success: false,
        message: "Invalid time range.",
      });
    }

    const conflict = await findConfirmedTimeConflict({
      roomType: resolved.roomType,
      startDateTime: interval.startDateTime,
      endDateTime: interval.endDateTime,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message:
          "This time is too close to an approved booking. Please keep at least 1 hour gap before or after another booking.",
      });
    }

    const monthlyConfirmedBookings = await countMonthlyConfirmedHotelBookings({
      roomType: resolved.roomType,
      date,
    });

    const dynamicPricing = calculateDynamicPrice({
      basePrice: resolved.price,
      date,
      monthlyBookingCount: monthlyConfirmedBookings,
    });

    const booking = await HotelRoomBooking.create({
      userId: user._id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",

      serviceType: "Hotel",
      packageId: resolved.packageId,
      packageTitle: resolved.packageTitle,

      roomType: resolved.roomType,
      duration: resolved.duration,
      date,
      time,
      startDateTime: interval.startDateTime,
      endDateTime: interval.endDateTime,

      pax,
      maxPax: resolved.maxPax,
      price: dynamicPricing.finalPrice,
      basePrice: dynamicPricing.basePrice,
      seasonalIncreasePercent: dynamicPricing.seasonalIncreasePercent,
      weekendIncreasePercent: dynamicPricing.weekendIncreasePercent,
      monthlyBookingIncreasePercent: dynamicPricing.monthlyBookingIncreasePercent,
      monthlyConfirmedBookings: dynamicPricing.monthlyConfirmedBookings,
      totalIncreasePercent: dynamicPricing.totalIncreasePercent,
      paymentMethod,

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
      message: "Hotel booking submitted successfully. Waiting for admin approval.",
      booking: {
        _id: booking._id,
        serviceType: booking.serviceType,
        packageId: booking.packageId,
        packageTitle: booking.packageTitle,
        roomType: booking.roomType,
        duration: booking.duration,
        date: booking.date,
        time: booking.time,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
        pax: booking.pax,
        maxPax: booking.maxPax,
        price: booking.price,
        basePrice: booking.basePrice,
        seasonalIncreasePercent: booking.seasonalIncreasePercent,
        weekendIncreasePercent: booking.weekendIncreasePercent,
        monthlyBookingIncreasePercent: booking.monthlyBookingIncreasePercent,
        monthlyConfirmedBookings: booking.monthlyConfirmedBookings,
        totalIncreasePercent: booking.totalIncreasePercent,
        paymentMethod: booking.paymentMethod,
        status: booking.status,
        createdAt: booking.createdAt,
      },
    });
  } catch (err) {
    console.error("createHotelRoomBooking error:", err);

    return res.status(500).json({
      success: false,
      message: "Error creating hotel booking.",
    });
  }
};

/* ===================== USER: CHECK AVAILABILITY ===================== */
export const checkHotelRoomAvailability = async (req, res) => {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  try {
    const roomType = normalizeRoomType(req.query.roomType);
    const duration = normalizeDuration(req.query.duration);
    const date = cleanText(req.query.date);
    const time = normalizeSubmittedTime(duration, req.query.time || "");

    if (!roomType || !duration || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "roomType, duration, date, and time are required.",
      });
    }

    const validTimes = getTimeOptions(duration);

    if (!validTimes.includes(time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot for this duration.",
      });
    }

    const interval = buildBookingInterval(date, time);
    if (!interval) {
      return res.status(400).json({
        success: false,
        message: "Invalid time range.",
      });
    }

    const conflict = await findConfirmedTimeConflict({
      roomType,
      startDateTime: interval.startDateTime,
      endDateTime: interval.endDateTime,
    });

    const monthlyConfirmedBookings = await countMonthlyConfirmedHotelBookings({
      roomType,
      date,
    });
    const fallback = DEFAULT_ROOM_RATES?.[duration]?.[roomType] || null;
    const basePrice = Number(fallback?.price || 0);
    const dynamicPricing = calculateDynamicPrice({
      basePrice,
      date,
      monthlyBookingCount: monthlyConfirmedBookings,
    });

    return res.status(200).json({
      success: true,
      available: !conflict,
      basePrice,
      price: dynamicPricing.finalPrice,
      dynamicPricing,
      startDateTime: interval.startDateTime,
      endDateTime: interval.endDateTime,
      requiredGapMinutes: BOOKING_GAP_MINUTES,
      message: conflict
        ? "This time is too close to an approved booking. Please keep at least 1 hour gap before or after another booking."
        : "Room slot is available.",
    });
  } catch (err) {
    console.error("checkHotelRoomAvailability error:", err);

    return res.status(500).json({
      success: false,
      message: "Error checking hotel availability.",
    });
  }
};

/* ===================== USER: MY HOTEL BOOKINGS ===================== */
export const getMyHotelRoomBookings = async (req, res) => {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  try {
    const userId = getUserIdFromDecoded(auth.decoded);

    const rows = await HotelRoomBooking.find({ userId })
      .select("-proof.data")
      .sort({ createdAt: -1 });

    return res.status(200).json(rows);
  } catch (err) {
    console.error("getMyHotelRoomBookings error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching hotel bookings.",
    });
  }
};

/* ===================== ADMIN: LIST HOTEL BOOKINGS ===================== */
export const adminGetAllHotelRoomBookings = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({
      success: false,
      message: guard.message,
    });
  }

  try {
    const rows = await HotelRoomBooking.find()
      .select("-proof.data")
      .sort({ createdAt: -1 });

    return res.status(200).json(rows);
  } catch (err) {
    console.error("adminGetAllHotelRoomBookings error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching hotel bookings.",
    });
  }
};

/* ===================== ADMIN: VIEW PROOF ===================== */
export const adminGetHotelRoomBookingProof = async (req, res) => {
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
    const booking = await HotelRoomBooking.findById(bookingId).select("+proof.data");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Hotel booking not found.",
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
        booking.proof.filename || "hotel-proof"
      )}"`
    );

    return res.status(200).send(booking.proof.data);
  } catch (err) {
    console.error("adminGetHotelRoomBookingProof error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching hotel booking proof.",
    });
  }
};

/* ===================== ADMIN: UPDATE STATUS ===================== */
export const adminUpdateHotelRoomBookingStatus = async (req, res) => {
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
    const booking = await HotelRoomBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Hotel booking not found.",
      });
    }

    const interval = buildBookingInterval(booking.date, booking.time);
    if (!interval) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking time range.",
      });
    }

    if (nextStatus === "PENDING" || nextStatus === "CONFIRMED") {
      const conflict = await findConfirmedTimeConflict({
        roomType: booking.roomType,
        startDateTime: interval.startDateTime,
        endDateTime: interval.endDateTime,
        excludeBookingId: bookingId,
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message:
            "Cannot activate/approve. This time is blocked by another pending or approved Hotel & Condo booking. Please keep at least 1 hour gap.",
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
    booking.startDateTime = interval.startDateTime;
    booking.endDateTime = interval.endDateTime;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Hotel booking status updated.",
      booking,
    });
  } catch (err) {
    console.error("adminUpdateHotelRoomBookingStatus error:", err);

    return res.status(500).json({
      success: false,
      message: "Error updating hotel booking status.",
    });
  }
};

/* ===================== ADMIN: RESCHEDULE APPROVED HOTEL ROOM BOOKING ===================== */
export const adminRescheduleHotelRoomBooking = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({
      success: false,
      message: guard.message,
    });
  }

  const { bookingId } = req.params;
  const date = cleanText(req.body.date || "");
  const submittedTime = cleanText(req.body.time || "");

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bookingId.",
    });
  }

  if (!date || !submittedTime) {
    return res.status(400).json({
      success: false,
      message: "date and time are required.",
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format.",
    });
  }

  if (date < todayLocalISO()) {
    return res.status(400).json({
      success: false,
      message: "Date cannot be in the past.",
    });
  }

  try {
    const booking = await HotelRoomBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Hotel booking not found.",
      });
    }

    if (String(booking.status || "").toUpperCase() !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Only approved Hotel & Condo bookings can be rescheduled.",
      });
    }

    const roomType = normalizeRoomType(booking.roomType);
    const duration = normalizeDuration(booking.duration);
    const time = normalizeSubmittedTime(duration, submittedTime);
    const validTimes = getTimeOptions(duration);

    if (!validTimes.includes(time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot for this duration.",
      });
    }

    const interval = buildBookingInterval(date, time);

    if (!interval) {
      return res.status(400).json({
        success: false,
        message: "Invalid time range.",
      });
    }

    const conflict = await findConfirmedTimeConflict({
      roomType,
      startDateTime: interval.startDateTime,
      endDateTime: interval.endDateTime,
      excludeBookingId: bookingId,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message:
          "This time is blocked by another pending or approved Hotel & Condo booking. Please keep at least 1 hour gap.",
        conflict,
      });
    }

    booking.roomType = roomType;
    booking.duration = duration;
    booking.date = date;
    booking.time = time;
    booking.startDateTime = interval.startDateTime;
    booking.endDateTime = interval.endDateTime;
    booking.status = "CONFIRMED";
    booking.isActive = true;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Hotel & Condo booking rescheduled successfully.",
      booking,
    });
  } catch (err) {
    console.error("adminRescheduleHotelRoomBooking error:", err);

    return res.status(500).json({
      success: false,
      message: "Error rescheduling Hotel & Condo booking.",
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

function getBlockedHotelRoomTimeSlotsForDate(bookings = [], date, candidateSlots = []) {
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

/* ===================== ADMIN: HOTEL ROOM RESCHEDULE BLOCKED DATES/TIMES ===================== */
export const adminGetHotelRoomRescheduleOptions = async (req, res) => {
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
    const booking = await HotelRoomBooking.findById(bookingId).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Hotel booking not found.",
      });
    }

    if (String(booking.status || "").toUpperCase() !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Only approved Hotel & Condo bookings can be rescheduled.",
      });
    }

    const roomType = normalizeRoomType(booking.roomType);
    const duration = normalizeDuration(booking.duration);
    const timeSlots = getTimeOptions(duration);

    const rows = await HotelRoomBooking.find({
      _id: { $ne: bookingId },
      roomType,
      status: { $in: BLOCKING_STATUSES },
      isActive: true,
      date: {
        $gte: addDaysToISO(range.from, -1),
        $lte: addDaysToISO(range.to, 1),
      },
    })
      .select("_id roomType duration date time status isActive startDateTime endDateTime")
      .lean();

    const blockedTimeSlotsByDate = {};
    const availableTimeSlotsByDate = {};
    const fullBookedDates = [];
    const partiallyBlockedDates = [];

    for (const date of listIsoDatesBetween(range.from, range.to)) {
      const blocked = getBlockedHotelRoomTimeSlotsForDate(rows, date, timeSlots);
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
      bookingType: "hotel_room",
      bookingId,
      excludedBookingId: bookingId,
      roomType,
      duration,
      from: range.from,
      to: range.to,
      timeSlots,
      bookedDates: fullBookedDates,
      fullBookedDates,
      partiallyBlockedDates,
      blockedTimeSlotsByDate,
      availableTimeSlotsByDate,
      bookings: rows,
      requiredGapMinutes: BOOKING_GAP_MINUTES,
    });
  } catch (err) {
    console.error("adminGetHotelRoomRescheduleOptions error:", err);
    return res.status(500).json({
      success: false,
      message: "Error loading Hotel & Condo reschedule blocked dates.",
    });
  }
};

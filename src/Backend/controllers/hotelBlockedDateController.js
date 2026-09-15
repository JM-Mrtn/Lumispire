import mongoose from "mongoose";
import HotelBlockedDate from "../models/HotelBlockedDate.js";
import HotelServicePackage from "../models/HotelServicePackage.js";
import ResortBooking from "../models/ResortBooking.js";
import EventBooking from "../models/EventBooking.js";
import HotelRoomBooking from "../models/HotelRoomBooking.js";
import { requireHotelAdminAuth } from "../utils/hotelAuthHelpers.js";
import {
  ALL_DAY_BLOCK,
  blockedDateConflictsWithTime,
  getBlockedDateReasonLabel,
  getBlockedServiceLabel,
  getBlockedTimeLabel,
  normalizeBlockedServiceType,
  normalizeBlockedTimeSlot,
  parseBlockedTimeRange,
} from "../utils/hotelBlockedDates.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_REASONS = new Set(["WALK_IN", "MAINTENANCE", "PRIVATE_EVENT", "OTHER"]);

let legacyIndexChecked = false;

function todayLocalISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function normalizeReason(value = "OTHER") {
  const reason = String(value || "OTHER")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  return ALLOWED_REASONS.has(reason) ? reason : "OTHER";
}

function getPackageTimeSlots(pkg = {}) {
  const variants = Array.isArray(pkg.variants)
    ? pkg.variants.filter((variant) => variant?.isActive !== false)
    : [];

  return Array.from(
    new Set(
      variants.flatMap((variant) =>
        Array.isArray(variant?.timeSlots)
          ? variant.timeSlots.map((slot) => normalizeBlockedTimeSlot(slot)).filter(Boolean)
          : []
      )
    )
  );
}

function addDaysISO(dateString, days) {
  if (!DATE_RE.test(String(dateString || ""))) return "";
  const [year, month, day] = String(dateString).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + Number(days || 0)))
    .toISOString()
    .slice(0, 10);
}

function buildDateTimeInterval(date = "", timeSlot = "") {
  if (!DATE_RE.test(String(date || ""))) return null;

  const range = parseBlockedTimeRange(timeSlot);
  if (!range) return null;

  const base = new Date(`${date}T00:00:00+08:00`).getTime();

  return {
    start: base + range.startMinutes * 60 * 1000,
    end: base + range.endMinutes * 60 * 1000,
  };
}

function getBookingInterval(row = {}, dateField = "date") {
  const start = row.startDateTime ? new Date(row.startDateTime).getTime() : NaN;
  const end = row.endDateTime ? new Date(row.endDateTime).getTime() : NaN;

  if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
    return { start, end };
  }

  return buildDateTimeInterval(row[dateField], row.time);
}

function intervalsOverlapWithGap(a, b, gapMinutes = 60) {
  if (!a || !b) return false;
  const gapMs = Number(gapMinutes || 0) * 60 * 1000;
  return a.start < b.end + gapMs && b.start < a.end + gapMs;
}

function normalizeComparableTitle(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getRowPackageId(row = {}) {
  const value = row.packageId;
  if (!value) return "";
  if (typeof value === "object") return String(value._id || value.id || value);
  return String(value);
}

function bookingMatchesPackage(row = {}, selectedPackage = {}, serviceType = "") {
  const selectedId = String(selectedPackage._id || "");
  const rowId = getRowPackageId(row);

  if (selectedId && rowId && selectedId === rowId) return true;

  const selectedTitle = normalizeComparableTitle(selectedPackage.title);
  let rowTitle = "";

  if (serviceType === "event_package") {
    rowTitle = row.eventPackage || row.packageTitle || "";
  } else if (serviceType === "hotel_condo") {
    rowTitle = row.packageTitle || "";
  } else {
    rowTitle = row.packageTitle || row.venue || "";
  }

  return Boolean(
    selectedTitle &&
      normalizeComparableTitle(rowTitle) &&
      selectedTitle === normalizeComparableTitle(rowTitle)
  );
}

function getBookingGuestName(row = {}) {
  return (
    `${String(row.firstName || "").trim()} ${String(row.lastName || "").trim()}`.trim() ||
    row.email ||
    "an existing guest"
  );
}

async function findConflictingActiveBooking({
  serviceType = "",
  date = "",
  timeSlot = "",
  selectedPackage = null,
} = {}) {
  if (!selectedPackage || !DATE_RE.test(date) || !timeSlot) return null;

  const candidate = buildDateTimeInterval(date, timeSlot);
  if (!candidate) return null;

  const dates = [addDaysISO(date, -1), date, addDaysISO(date, 1)].filter(Boolean);
  const common = {
    status: { $in: ["PENDING", "CONFIRMED"] },
    isActive: { $ne: false },
  };

  let rows = [];
  let dateField = "date";

  if (serviceType === "event_package") {
    dateField = "eventDate";
    rows = await EventBooking.find({
      ...common,
      eventDate: { $in: dates },
    })
      .select(
        "_id packageId eventPackage eventDate time startDateTime endDateTime firstName lastName email status isActive"
      )
      .lean();
  } else if (serviceType === "hotel_condo") {
    rows = await HotelRoomBooking.find({
      ...common,
      date: { $in: dates },
    })
      .select(
        "_id packageId packageTitle roomType date time startDateTime endDateTime firstName lastName email status isActive"
      )
      .lean();
  } else if (serviceType === "resort_venue") {
    rows = await ResortBooking.find({
      ...common,
      date: { $in: dates },
    })
      .select(
        "_id packageId packageTitle venue date time startDateTime endDateTime firstName lastName email status isActive"
      )
      .lean();
  } else {
    return null;
  }

  return (
    rows.find((row) => {
      if (!bookingMatchesPackage(row, selectedPackage, serviceType)) return false;
      const bookingInterval = getBookingInterval(row, dateField);
      return intervalsOverlapWithGap(candidate, bookingInterval, 60);
    }) || null
  );
}

async function ensurePackageSpecificIndexes() {
  if (legacyIndexChecked) return;

  try {
    const indexes = await HotelBlockedDate.collection.indexes();
    const obsoleteIndexes = indexes.filter((index) =>
      ["date_1_scope_1", "date_1_serviceType_1_packageId_1"].includes(index?.name)
    );

    for (const index of obsoleteIndexes) {
      try {
        await HotelBlockedDate.collection.dropIndex(index.name);
      } catch (error) {
        if (![26, 27].includes(error?.code)) throw error;
      }
    }
  } catch (error) {
    const safeCodes = new Set([26, 27]);
    if (!safeCodes.has(error?.code)) {
      console.warn("blocked-date legacy index cleanup warning:", error?.message || error);
    }
  } finally {
    legacyIndexChecked = true;
  }
}

function serializeBlockedDate(row = {}) {
  const serviceType = normalizeBlockedServiceType(row.serviceType || "");
  const timeSlot = normalizeBlockedTimeSlot(row.timeSlot || ALL_DAY_BLOCK) || ALL_DAY_BLOCK;

  return {
    _id: row._id,
    date: row.date,
    serviceType,
    serviceLabel: getBlockedServiceLabel(serviceType),
    packageId: row.packageId || "",
    packageTitle: row.packageTitle || "",
    timeSlot,
    timeLabel: getBlockedTimeLabel(timeSlot),
    allDay: timeSlot === ALL_DAY_BLOCK,
    scope: row.scope || "",
    reason: row.reason,
    reasonLabel: getBlockedDateReasonLabel(row.reason),
    note: row.note || "",
    createdBy: row.createdBy || "Hotel Admin",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const adminGetBlockedDates = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({
      success: false,
      message: guard.message,
      blockedDates: [],
    });
  }

  try {
    await ensurePackageSpecificIndexes();

    const from = String(req.query.from || "").trim();
    const to = String(req.query.to || "").trim();
    const query = {};

    if (from || to) {
      query.date = {};
      if (DATE_RE.test(from)) query.date.$gte = from;
      if (DATE_RE.test(to)) query.date.$lte = to;
      if (!Object.keys(query.date).length) delete query.date;
    }

    const rows = await HotelBlockedDate.find(query)
      .sort({ date: 1, timeSlot: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      blockedDates: rows.map(serializeBlockedDate),
    });
  } catch (error) {
    console.error("adminGetBlockedDates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load disabled booking slots.",
      blockedDates: [],
    });
  }
};

export const adminCreateBlockedDate = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({
      success: false,
      message: guard.message,
    });
  }

  try {
    await ensurePackageSpecificIndexes();

    const date = String(req.body.date || "").trim();
    const serviceType = normalizeBlockedServiceType(req.body.serviceType || "");
    const packageId = String(req.body.packageId || "").trim();
    const timeSlot = normalizeBlockedTimeSlot(req.body.timeSlot || "");
    const reason = normalizeReason(req.body.reason || "OTHER");
    const note = String(req.body.note || "").trim().slice(0, 500);

    if (!DATE_RE.test(date)) {
      return res.status(400).json({ success: false, message: "A valid date is required." });
    }

    if (date < todayLocalISO()) {
      return res.status(400).json({ success: false, message: "Past dates cannot be disabled." });
    }

    if (!serviceType) {
      return res.status(400).json({ success: false, message: "Please choose a valid service." });
    }

    if (!mongoose.isValidObjectId(packageId)) {
      return res.status(400).json({ success: false, message: "Please choose a valid package." });
    }

    if (!timeSlot) {
      return res.status(400).json({ success: false, message: "Please choose a time slot or All Day." });
    }

    if (!parseBlockedTimeRange(timeSlot)) {
      return res.status(400).json({ success: false, message: "The selected time slot is invalid." });
    }

    const selectedPackage = await HotelServicePackage.findOne({
      _id: packageId,
      type: serviceType,
      isActive: { $ne: false },
    })
      .select("_id type title variants isActive")
      .lean();

    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        message: "The selected package was not found or does not belong to this service.",
      });
    }

    const packageTimeSlots = getPackageTimeSlots(selectedPackage);
    if (timeSlot !== ALL_DAY_BLOCK && !packageTimeSlots.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: "The selected time slot does not belong to this package.",
      });
    }

    const existingRows = await HotelBlockedDate.find({
      date,
      serviceType,
      packageId: String(selectedPackage._id),
    }).lean();

    const overlapping = existingRows.find((row) => {
      const rowTime = normalizeBlockedTimeSlot(row.timeSlot || ALL_DAY_BLOCK) || ALL_DAY_BLOCK;
      if (rowTime === ALL_DAY_BLOCK || timeSlot === ALL_DAY_BLOCK) return true;
      return blockedDateConflictsWithTime(row, date, timeSlot, 0);
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: `${selectedPackage.title} already has a disabled slot overlapping ${getBlockedTimeLabel(timeSlot)} on ${date}.`,
        blockedDate: serializeBlockedDate(overlapping),
      });
    }

    const conflictingBooking = await findConflictingActiveBooking({
      serviceType,
      date,
      timeSlot,
      selectedPackage,
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        code: "BOOKING_SLOT_ALREADY_RESERVED",
        message: `${selectedPackage.title} already has a pending or confirmed booking that overlaps ${getBlockedTimeLabel(timeSlot)} on ${date}. Choose another available time slot.`,
        booking: {
          _id: conflictingBooking._id,
          guestName: getBookingGuestName(conflictingBooking),
          time: conflictingBooking.time || "",
          status: conflictingBooking.status || "",
        },
      });
    }

    const createdBy =
      guard.decoded?.email ||
      guard.decoded?.username ||
      guard.decoded?.name ||
      "Hotel Admin";

    const blockedDate = await HotelBlockedDate.create({
      date,
      serviceType,
      packageId: String(selectedPackage._id),
      packageTitle: selectedPackage.title,
      timeSlot,
      scope: "",
      reason,
      note,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: `${selectedPackage.title} is unavailable on ${date} during ${getBlockedTimeLabel(timeSlot)}. Other non-overlapping time slots remain bookable.`,
      blockedDate: serializeBlockedDate(blockedDate.toObject()),
    });
  } catch (error) {
    console.error("adminCreateBlockedDate error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to disable this booking slot.",
    });
  }
};

export const adminDeleteBlockedDate = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({ success: false, message: guard.message });
  }

  try {
    const blockedDateId = String(req.params.blockedDateId || "").trim();
    const deleted = await HotelBlockedDate.findByIdAndDelete(blockedDateId).lean();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Disabled booking slot record was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `${deleted.packageTitle || "This package"} is available again on ${deleted.date} during ${getBlockedTimeLabel(deleted.timeSlot)}.`,
      blockedDate: serializeBlockedDate(deleted),
    });
  } catch (error) {
    console.error("adminDeleteBlockedDate error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to enable this booking slot.",
    });
  }
};

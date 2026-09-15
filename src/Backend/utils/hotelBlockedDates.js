import HotelBlockedDate from "../models/HotelBlockedDate.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const ALL_DAY_BLOCK = "ALL_DAY";
const BOOKING_GAP_MINUTES = 60;

export function normalizeBlockedDateScope(value = "ALL") {
  const text = String(value || "ALL")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (["VENUE", "RESORT", "EVENT", "RESORT_EVENT", "RESORT_AND_EVENT"].includes(text)) {
    return "VENUE";
  }

  if (["HOTEL", "HOTEL_ROOM", "HOTEL_CONDO", "CONDO"].includes(text)) {
    return "HOTEL_ROOM";
  }

  return "ALL";
}

export function normalizeBlockedServiceType(value = "") {
  const text = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (["resort", "resort_venue", "venue"].includes(text)) {
    return "resort_venue";
  }

  if (["event", "event_package"].includes(text)) {
    return "event_package";
  }

  if (["hotel", "hotel_room", "hotel_condo", "condo"].includes(text)) {
    return "hotel_condo";
  }

  return "";
}

export function getBlockedServiceLabel(value = "") {
  const serviceType = normalizeBlockedServiceType(value);

  if (serviceType === "resort_venue") return "Resort & Venue";
  if (serviceType === "event_package") return "Event Package";
  if (serviceType === "hotel_condo") return "Hotel & Condo";

  return "Booking service";
}

export function normalizeBookingBlockScope(serviceType = "") {
  const normalized = normalizeBlockedServiceType(serviceType);

  if (["resort_venue", "event_package"].includes(normalized)) {
    return "VENUE";
  }

  if (normalized === "hotel_condo") {
    return "HOTEL_ROOM";
  }

  return "ALL";
}

export function getBlockedDateReasonLabel(reason = "") {
  const normalized = String(reason || "OTHER").trim().toUpperCase();

  if (normalized === "WALK_IN") return "Walk-in reservation";
  if (normalized === "MAINTENANCE") return "Maintenance";
  if (normalized === "PRIVATE_EVENT") return "Private event";
  return "Unavailable";
}

export function normalizeBlockedTimeSlot(value = "ALL_DAY") {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";

  const upper = text.toUpperCase().replace(/[\s-]+/g, "_");
  if (["ALL_DAY", "ALLDAY", "FULL_DAY", "FULLDAY"].includes(upper)) {
    return ALL_DAY_BLOCK;
  }

  return text;
}

export function getBlockedTimeLabel(value = "ALL_DAY") {
  const normalized = normalizeBlockedTimeSlot(value);
  return normalized === ALL_DAY_BLOCK ? "All Day" : normalized || "All Day";
}

function parseClockToMinutes(hourText, minuteText, meridiemText) {
  let hour = Number(hourText);
  const minute = Number(minuteText || 0);
  const meridiem = String(meridiemText || "").toUpperCase();

  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  if (hour === 12) hour = 0;
  if (meridiem === "PM") hour += 12;

  return hour * 60 + minute;
}

export function parseBlockedTimeRange(value = "") {
  const normalized = normalizeBlockedTimeSlot(value);

  if (!normalized) return null;
  if (normalized === ALL_DAY_BLOCK) {
    return { startMinutes: 0, endMinutes: 24 * 60, allDay: true };
  }

  const matches = [
    ...normalized.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi),
  ];

  if (matches.length < 2) return null;

  const startMinutes = parseClockToMinutes(matches[0][1], matches[0][2], matches[0][3]);
  let endMinutes = parseClockToMinutes(matches[1][1], matches[1][2], matches[1][3]);

  if (startMinutes === null || endMinutes === null) return null;

  if (/next\s+day/i.test(normalized) || endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return { startMinutes, endMinutes, allDay: false };
}

function addDaysToISO(dateString, days) {
  if (!DATE_RE.test(String(dateString || ""))) return "";
  const [year, month, day] = String(dateString).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function dateToPhMidnight(dateString) {
  return new Date(`${dateString}T00:00:00+08:00`);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + Number(minutes || 0) * 60 * 1000);
}

export function buildBlockedDateInterval(blockedDate = {}) {
  const date = String(blockedDate.date || "").trim();
  if (!DATE_RE.test(date)) return null;

  const range = parseBlockedTimeRange(blockedDate.timeSlot || ALL_DAY_BLOCK);
  if (!range) return null;

  const base = dateToPhMidnight(date);
  return {
    startDateTime: addMinutes(base, range.startMinutes),
    endDateTime: addMinutes(base, range.endMinutes),
    allDay: range.allDay,
  };
}

function buildCandidateInterval(date, timeSlot) {
  if (!DATE_RE.test(String(date || ""))) return null;
  const range = parseBlockedTimeRange(timeSlot);
  if (!range) return null;

  const base = dateToPhMidnight(date);
  return {
    startDateTime: addMinutes(base, range.startMinutes),
    endDateTime: addMinutes(base, range.endMinutes),
  };
}

function intervalsOverlapWithGap(startA, endA, startB, endB, gapMinutes = BOOKING_GAP_MINUTES) {
  const gapMs = Number(gapMinutes || 0) * 60 * 1000;
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart < bEnd + gapMs && bStart < aEnd + gapMs;
}

export function blockedDateConflictsWithTime(blockedDate = {}, date = "", timeSlot = "", gapMinutes = BOOKING_GAP_MINUTES) {
  const blocked = buildBlockedDateInterval(blockedDate);
  const candidate = buildCandidateInterval(date, timeSlot);
  if (!blocked || !candidate) return false;

  return intervalsOverlapWithGap(
    blocked.startDateTime,
    blocked.endDateTime,
    candidate.startDateTime,
    candidate.endDateTime,
    gapMinutes
  );
}

export function buildBlockedDateMessage(blockedDate = {}) {
  const reasonLabel = getBlockedDateReasonLabel(blockedDate.reason);
  const packageTitle = String(blockedDate.packageTitle || "").trim();
  const note = String(blockedDate.note || "").trim();
  const timeLabel = getBlockedTimeLabel(blockedDate.timeSlot);
  const target = packageTitle ? ` for ${packageTitle}` : "";
  const when = timeLabel === "All Day" ? "this date" : `the ${timeLabel} time slot`;

  return note
    ? `${when.charAt(0).toUpperCase() + when.slice(1)} is unavailable${target} because of ${reasonLabel.toLowerCase()}: ${note}`
    : `${when.charAt(0).toUpperCase() + when.slice(1)} is unavailable${target} because of ${reasonLabel.toLowerCase()}.`;
}

function normalizeTitle(value = "") {
  return String(value || "").trim().toLowerCase();
}

function isLegacyBroadBlock(row = {}, serviceType = "") {
  if (String(row.packageId || "").trim()) return false;

  const legacyScope = normalizeBookingBlockScope(serviceType);
  return ["ALL", legacyScope].includes(String(row.scope || "").toUpperCase());
}

function matchesSpecificPackage(row = {}, { serviceType = "", packageId = "", packageTitle = "" } = {}) {
  const normalizedService = normalizeBlockedServiceType(serviceType);
  const rowService = normalizeBlockedServiceType(row.serviceType);

  if (!row.packageId || !rowService || rowService !== normalizedService) {
    return false;
  }

  const requestedPackageId = String(packageId || "").trim();
  const rowPackageId = String(row.packageId || "").trim();

  if (requestedPackageId && requestedPackageId === rowPackageId) {
    return true;
  }

  const requestedTitle = normalizeTitle(packageTitle);
  const rowTitle = normalizeTitle(row.packageTitle);

  return Boolean(requestedTitle && rowTitle && requestedTitle === rowTitle);
}

function rowAppliesToBooking(row = {}, params = {}) {
  if (matchesSpecificPackage(row, params)) return true;
  return isLegacyBroadBlock(row, params.serviceType);
}

export async function findActiveBlockedDate({
  date = "",
  time = "",
  serviceType = "",
  packageId = "",
  packageTitle = "",
} = {}) {
  const cleanDate = String(date || "");
  if (!DATE_RE.test(cleanDate)) return null;

  // Include the previous date because an overnight manual block can continue
  // into the requested morning of the next calendar day.
  const previousDate = addDaysToISO(cleanDate, -1);
  const rows = await HotelBlockedDate.find({
    date: { $in: [previousDate, cleanDate].filter(Boolean) },
  })
    .sort({ createdAt: -1 })
    .lean();

  return (
    rows.find((row) => {
      if (!rowAppliesToBooking(row, { serviceType, packageId, packageTitle })) {
        return false;
      }

      if (!time) {
        return row.date === cleanDate;
      }

      return blockedDateConflictsWithTime(row, cleanDate, time);
    }) || null
  );
}

export async function getActiveBlockedDates({
  from = "",
  to = "",
  serviceType = "",
  packageId = "",
  packageTitle = "",
} = {}) {
  if (!DATE_RE.test(String(from || "")) || !DATE_RE.test(String(to || ""))) {
    return [];
  }

  const rows = await HotelBlockedDate.find({
    // Include previous day so overnight blocks can affect the first requested day.
    date: { $gte: addDaysToISO(String(from), -1), $lte: String(to) },
  })
    .sort({ date: 1, createdAt: 1 })
    .lean();

  return rows.filter((row) =>
    rowAppliesToBooking(row, { serviceType, packageId, packageTitle })
  );
}

// src/Backend/controllers/hotelAdminBookingController.js
import ResortBooking from "../models/ResortBooking.js";
import EventBooking from "../models/EventBooking.js";
import HotelRoomBooking from "../models/HotelRoomBooking.js";
import { requireHotelAdminAuth } from "../utils/hotelAuthHelpers.js";

const ADMIN_BOOKINGS_PER_SERVICE_LIMIT = 500;

const ADMIN_RESORT_LIST_INDEX = "admin_resort_booking_list_v1";
const ADMIN_RESORT_LIST_PROJECTION = {
  _id: 1,
  firstName: 1,
  lastName: 1,
  email: 1,
  phone: 1,
  venue: 1,
  date: 1,
  category: 1,
  time: 1,
  pax: 1,
  totalGuests: 1,
  adults: 1,
  kids: 1,
  price: 1,
  paymentMethod: 1,
  status: 1,
  isActive: 1,
  createdAt: 1,
};

async function readAdminBookingRows(Model) {
  if (Model === ResortBooking) {
    return Model.collection
      .find({}, { projection: ADMIN_RESORT_LIST_PROJECTION })
      .hint(ADMIN_RESORT_LIST_INDEX)
      .sort({ _id: -1 })
      .limit(ADMIN_BOOKINGS_PER_SERVICE_LIMIT)
      .toArray();
  }
  // Keep embedded payment proof binaries out of list responses. Using the
  // native collection cursor also avoids Mongoose hydration/populate issues
  // with legacy rows. _id is always indexed by MongoDB.
  return Model.collection
    .find({}, { projection: { "proof.data": 0 } })
    .sort({ _id: -1 })
    .limit(ADMIN_BOOKINGS_PER_SERVICE_LIMIT)
    .toArray();
}

function normalizeStatus(value = "") {
  const status = String(value || "PENDING").toUpperCase();

  if (status === "APPROVED") return "CONFIRMED";
  if (["REJECTED", "DECLINED", "CANCELED"].includes(status)) return "CANCELLED";
  if (["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) return status;

  return "PENDING";
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
    booking.fullName ||
    booking.customerName ||
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

function normalizeResortBooking(booking = {}) {
  return {
    _id: booking._id,
    bookingType: "resort",
    serviceLabel: "Resort & Venue",

    title: booking.venue || "Resort & Venue Booking",
    category: booking.category || booking.duration || "",
    location: booking.venue || "",

    customerName: getCustomerName(booking),
    email: getCustomerEmail(booking),
    phone: getCustomerPhone(booking),

    date: booking.date || "",
    time: booking.time || "",
    pax:
      Number(
        booking.pax ||
          booking.totalGuests ||
          Number(booking.adults || 0) + Number(booking.kids || 0)
      ) || 0,

    paymentMethod: booking.paymentMethod || "",
    totalAmount: Number(booking.price || booking.totalAmount || 0),
    status: normalizeStatus(booking.status),
    isActive: booking.isActive !== false,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    raw: booking,
  };
}

function normalizeEventBooking(booking = {}) {
  return {
    _id: booking._id,
    bookingType: "event",
    serviceLabel: "Event Package",

    title: booking.eventPackage || booking.packageTitle || "Event Package Booking",
    category:
      booking.timeVariationLabel ||
      booking.selectedVariantLabel ||
      booking.eventType ||
      "Event Package",
    location: booking.venue || "",

    customerName: getCustomerName(booking),
    email: getCustomerEmail(booking),
    phone: getCustomerPhone(booking),

    date: booking.eventDate || booking.date || "",
    time: booking.time || "",
    pax: Number(booking.pax || booking.totalGuests || booking.guests || 0),

    paymentMethod: booking.paymentMethod || "",
    totalAmount: Number(booking.totalAmount || booking.price || 0),
    status: normalizeStatus(booking.status),
    isActive: booking.isActive !== false,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    raw: booking,
  };
}

function normalizeHotelRoomBooking(booking = {}) {
  const roomType = booking.roomType || booking.packageTitle || "Hotel Room";
  const duration = booking.duration || "";

  return {
    _id: booking._id,
    bookingType: "hotel_room",
    serviceLabel: "Hotel & Condo",

    title: `${roomType}${duration ? ` - ${duration}` : ""}`,
    category: duration || "Hotel Room",
    location: roomType,

    customerName: getCustomerName(booking),
    email: getCustomerEmail(booking),
    phone: getCustomerPhone(booking),

    date: booking.date || "",
    time: booking.time || "",
    pax: Number(booking.pax || booking.totalGuests || booking.guests || 0),

    paymentMethod: booking.paymentMethod || "",
    totalAmount: Number(booking.price || booking.totalAmount || 0),
    status: normalizeStatus(booking.status),
    isActive: booking.isActive !== false,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    raw: booking,
  };
}

function buildCounts(bookings = []) {
  const counts = {
    total: bookings.length,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    resort: 0,
    event: 0,
    hotel_room: 0,
  };

  bookings.forEach((booking) => {
    const status = normalizeStatus(booking.status).toLowerCase();

    if (counts[status] !== undefined) counts[status] += 1;
    if (counts[booking.bookingType] !== undefined) counts[booking.bookingType] += 1;
  });

  return counts;
}

export const adminGetAllHotelBookings = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({
      success: false,
      message: guard.message,
      bookings: [],
    });
  }

  try {
    // Read bounded metadata-only lists. This is intentionally done with the
    // native driver so embedded proof buffers and legacy Mongoose refs cannot
    // make the Manage Bookings list fail.
    const results = await Promise.allSettled([
      readAdminBookingRows(ResortBooking),
      readAdminBookingRows(EventBooking),
      readAdminBookingRows(HotelRoomBooking),
    ]);

    const serviceResults = [
      { key: "resort", result: results[0], normalize: normalizeResortBooking },
      { key: "event", result: results[1], normalize: normalizeEventBooking },
      { key: "hotel_room", result: results[2], normalize: normalizeHotelRoomBooking },
    ];

    const failedServices = [];
    const bookings = [];

    serviceResults.forEach(({ key, result, normalize }) => {
      if (result.status !== "fulfilled") {
        failedServices.push(key);
        console.error(`adminGetAllHotelBookings ${key} query error:`, result.reason);
        return;
      }

      // Avoid spreading a potentially large array into push(), which can hit
      // V8's maximum argument count. Normalize rows one at a time instead.
      for (const row of result.value) {
        try {
          bookings.push(normalize(row));
        } catch (normalizeError) {
          console.error(
            `adminGetAllHotelBookings ${key} row normalize error:`,
            normalizeError
          );
        }
      }
    });

    if (failedServices.length === serviceResults.length) {
      return res.status(500).json({
        success: false,
        message: "Failed to load hotel bookings.",
        bookings: [],
        failedServices,
      });
    }

    bookings.sort((a, b) => {
      const bTime = new Date(b.createdAt || b.date || 0).getTime();
      const aTime = new Date(a.createdAt || a.date || 0).getTime();
      return bTime - aTime;
    });

    return res.status(200).json({
      success: true,
      message: failedServices.length
        ? "Bookings loaded, but one or more booking sources could not be read."
        : "Hotel bookings loaded successfully.",
      bookings,
      counts: buildCounts(bookings),
      failedServices,
    });
  } catch (error) {
    console.error("adminGetAllHotelBookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load hotel bookings.",
      bookings: [],
    });
  }
};

// Compatibility alias for admin routes expecting the generic booking loader name
export const adminGetAllBookings = adminGetAllHotelBookings;

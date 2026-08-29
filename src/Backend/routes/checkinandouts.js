import express from "express";
import mongoose from "mongoose";
import HotelCheckInOut from "../models/HotelCheckInOut.js";
import HotelUser from "../models/hotelUser.js";
import ResortBooking from "../models/ResortBooking.js";
import HotelRoomBooking from "../models/HotelRoomBooking.js";
import EventBooking from "../models/EventBooking.js";
import {
  requireHotelAdminAuth,
  requireHotelUserAuth,
} from "../utils/hotelAuthHelpers.js";

const router = express.Router();

function getTokenUserId(decoded = {}) {
  return String(
    decoded.id ||
      decoded.userId ||
      decoded.hotelUserId ||
      decoded._id ||
      decoded.uid ||
      ""
  ).trim();
}

function requireUser(req, res) {
  const guard = requireHotelUserAuth(req);

  if (!guard.ok) {
    res.status(guard.status).json({
      success: false,
      message: guard.message,
    });
    return null;
  }

  const userId = getTokenUserId(guard.decoded);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(401).json({
      success: false,
      message: "Invalid token payload. User ID is missing or invalid.",
    });
    return null;
  }

  return userId;
}

function requireAdmin(req, res) {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    res.status(guard.status).json({
      success: false,
      message: guard.message,
    });
    return false;
  }

  return true;
}

async function getOwnedBooking(bookingId, userId) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) return null;
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  const query = {
    _id: bookingId,
    userId,
    isActive: { $ne: false },
  };

  const resort = await ResortBooking.findOne(query).lean();
  if (resort) return { booking: resort, bookingType: "resort" };

  const room = await HotelRoomBooking.findOne(query).lean();
  if (room) return { booking: room, bookingType: "room" };

  const event = await EventBooking.findOne(query).lean();
  if (event) return { booking: event, bookingType: "event" };

  return null;
}

function isApprovedBooking(booking = {}) {
  const status = String(booking.status || "").trim().toUpperCase();
  return ["APPROVED", "AUTO_APPROVED", "CONFIRMED"].includes(status);
}

function getBookingLabel(booking = {}, type = "") {
  if (type === "room") {
    return (
      booking.packageTitle ||
      booking.roomType ||
      booking.duration ||
      "Hotel Room"
    );
  }

  if (type === "event") {
    return booking.eventPackage || booking.venue || "Event Package";
  }

  return booking.venue || booking.category || "Resort & Venue";
}

function getBookingDate(booking = {}, type = "") {
  if (type === "event") return booking.eventDate || booking.date || "";
  return booking.date || "";
}

function serializeBooking(booking = {}, type = "") {
  return {
    id: booking?._id ? String(booking._id) : "",
    label: getBookingLabel(booking, type),
    date: getBookingDate(booking, type),
    time: booking.time || "",
    pax: Number(booking.pax || booking.totalGuests || 0),
    status: booking.status || "",
    serviceType:
      booking.serviceType ||
      (type === "room"
        ? "Hotel & Condo"
        : type === "event"
        ? "Event Package"
        : "Resort & Venue"),
    venue: booking.venue || "",
    roomType: booking.roomType || "",
    packageTitle: booking.packageTitle || booking.eventPackage || "",
  };
}

function serializeUser(user = {}) {
  const fullName =
    user.fullName ||
    [user.firstName, user.middleName, user.lastName]
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join(" ") ||
    user.username ||
    user.email ||
    "Hotel Guest";

  return {
    id: user?._id ? String(user._id) : "",
    fullName,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    username: user.username || "",
    email: user.email || "",
    phone: user.phone || user.phoneNumber || "",
  };
}

async function enrichAdminRecords(records = []) {
  if (!records.length) return [];

  const userIds = [...new Set(records.map((item) => String(item.userId || "")).filter(Boolean))];
  const resortIds = [];
  const roomIds = [];
  const eventIds = [];

  records.forEach((item) => {
    const id = String(item.bookingId || "");
    if (!id) return;

    if (item.bookingType === "room") roomIds.push(id);
    else if (item.bookingType === "event") eventIds.push(id);
    else resortIds.push(id);
  });

  const [users, resortBookings, roomBookings, eventBookings] = await Promise.all([
    HotelUser.find({ _id: { $in: userIds } })
      .select("firstName middleName lastName fullName username email phone phoneNumber")
      .lean(),
    resortIds.length
      ? ResortBooking.find({ _id: { $in: resortIds } })
          .select("firstName lastName email phone serviceType venue category date time pax totalGuests status")
          .lean()
      : [],
    roomIds.length
      ? HotelRoomBooking.find({ _id: { $in: roomIds } })
          .select("firstName lastName email phone serviceType packageTitle roomType duration date time pax totalGuests status")
          .lean()
      : [],
    eventIds.length
      ? EventBooking.find({ _id: { $in: eventIds } })
          .select("firstName lastName email phone serviceType eventPackage venue eventDate time pax totalGuests status")
          .lean()
      : [],
  ]);

  const userMap = new Map(users.map((user) => [String(user._id), user]));
  const resortMap = new Map(resortBookings.map((item) => [String(item._id), item]));
  const roomMap = new Map(roomBookings.map((item) => [String(item._id), item]));
  const eventMap = new Map(eventBookings.map((item) => [String(item._id), item]));

  return records.map((record) => {
    const bookingId = String(record.bookingId || "");
    const userId = String(record.userId || "");
    const bookingType = record.bookingType || "resort";

    let booking = {};
    if (bookingType === "room") booking = roomMap.get(bookingId) || {};
    else if (bookingType === "event") booking = eventMap.get(bookingId) || {};
    else booking = resortMap.get(bookingId) || {};

    const savedUser = userMap.get(userId) || {};
    const fallbackUser = {
      ...savedUser,
      firstName: savedUser.firstName || booking.firstName || "",
      lastName: savedUser.lastName || booking.lastName || "",
      email: savedUser.email || booking.email || "",
      phone: savedUser.phone || savedUser.phoneNumber || booking.phone || "",
    };

    return {
      id: String(record._id),
      bookingId,
      bookingType,
      status: record.status,
      checkInAt: record.checkInAt,
      checkOutAt: record.checkOutAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      guest: serializeUser(fallbackUser),
      booking: serializeBooking(booking, bookingType),
    };
  });
}

/* ===================== ADMIN ===================== */
router.get("/admin/records", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const requestedLimit = Number(req.query.limit || 300);
    const limit = Math.min(Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 300, 1), 500);

    const query = {};
    const status = String(req.query.status || "").trim().toUpperCase();
    const bookingType = String(req.query.bookingType || "").trim().toLowerCase();

    if (["NOT_CHECKED_IN", "CHECKED_IN", "CHECKED_OUT"].includes(status)) {
      query.status = status;
    }

    if (["resort", "room", "event"].includes(bookingType)) {
      query.bookingType = bookingType;
    }

    const records = await HotelCheckInOut.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    const enriched = await enrichAdminRecords(records);

    const summary = {
      total: enriched.length,
      checkedIn: enriched.filter((item) => item.status === "CHECKED_IN").length,
      checkedOut: enriched.filter((item) => item.status === "CHECKED_OUT").length,
      notCheckedIn: enriched.filter((item) => item.status === "NOT_CHECKED_IN").length,
    };

    return res.status(200).json({
      success: true,
      records: enriched,
      summary,
    });
  } catch (error) {
    console.error("Admin get check-in/out records error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch check-in/out records.",
    });
  }
});

/* ===================== MOBILE / HOTEL USER ===================== */
router.get("/:bookingId/status", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  try {
    const { bookingId } = req.params;
    const found = await getOwnedBooking(bookingId, userId);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const checkInOut = await HotelCheckInOut.findOne({ bookingId, userId }).lean();

    if (!checkInOut) {
      return res.status(200).json({
        success: true,
        bookingId,
        bookingType: found.bookingType,
        status: "NOT_CHECKED_IN",
        checkInAt: null,
        checkOutAt: null,
      });
    }

    return res.status(200).json({
      success: true,
      bookingId,
      bookingType: checkInOut.bookingType || found.bookingType,
      status: checkInOut.status,
      checkInAt: checkInOut.checkInAt,
      checkOutAt: checkInOut.checkOutAt,
    });
  } catch (error) {
    console.error("Get check-in/out status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch check-in/out status.",
    });
  }
});

router.post("/:bookingId/checkin", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  try {
    const { bookingId } = req.params;
    const found = await getOwnedBooking(bookingId, userId);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (!isApprovedBooking(found.booking)) {
      return res.status(400).json({
        success: false,
        message: "Booking is not approved for check-in.",
      });
    }

    const existing = await HotelCheckInOut.findOne({ bookingId, userId });

    if (existing?.status === "CHECKED_OUT") {
      return res.status(400).json({
        success: false,
        message: "This booking is already checked out.",
      });
    }

    if (existing?.status === "CHECKED_IN") {
      return res.status(200).json({
        success: true,
        message: "Already checked in.",
        bookingId,
        bookingType: existing.bookingType,
        status: existing.status,
        checkInAt: existing.checkInAt,
        checkOutAt: existing.checkOutAt,
      });
    }

    const now = new Date();
    const checkInOut = await HotelCheckInOut.findOneAndUpdate(
      { bookingId, userId },
      {
        $set: {
          bookingId,
          userId,
          bookingType: found.bookingType,
          status: "CHECKED_IN",
          checkInAt: now,
          checkOutAt: null,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Checked in successfully.",
      bookingId,
      bookingType: checkInOut.bookingType,
      status: checkInOut.status,
      checkInAt: checkInOut.checkInAt,
      checkOutAt: checkInOut.checkOutAt,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check in.",
    });
  }
});

router.post("/:bookingId/checkout", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  try {
    const { bookingId } = req.params;
    const found = await getOwnedBooking(bookingId, userId);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const existing = await HotelCheckInOut.findOne({ bookingId, userId });

    if (!existing || existing.status !== "CHECKED_IN") {
      return res.status(400).json({
        success: false,
        message: "Booking is not currently checked in.",
      });
    }

    existing.status = "CHECKED_OUT";
    existing.checkOutAt = new Date();
    await existing.save();

    return res.status(200).json({
      success: true,
      message: "Checked out successfully.",
      bookingId,
      bookingType: existing.bookingType || found.bookingType,
      status: existing.status,
      checkInAt: existing.checkInAt,
      checkOutAt: existing.checkOutAt,
    });
  } catch (error) {
    console.error("Check-out error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check out.",
    });
  }
});

export default router;

// src/Backend/controllers/hotelGuestReviewController.js
import mongoose from "mongoose";
import ResortBooking from "../models/ResortBooking.js";
import EventBooking from "../models/EventBooking.js";
import HotelRoomBooking from "../models/HotelRoomBooking.js";
import HotelGuestReview from "../models/HotelGuestReview.js";
import {
  requireHotelUserAuth,
  requireHotelAdminAuth,
  isValidObjectId,
} from "../utils/hotelAuthHelpers.js";

function getUserIdFromDecoded(decoded = {}) {
  return decoded.userId || decoded.id || decoded.hotelUserId || decoded._id || "";
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function toPositiveInt(value, fallback = 1) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.floor(number);
}

function getPagination(query = {}) {
  const page = Math.max(1, toPositiveInt(query.page, 1));
  const limit = Math.min(50, Math.max(1, toPositiveInt(query.limit, 6)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function buildPaginationPayload({ page, limit, totalItems }) {
  const safeTotal = Math.max(0, Number(totalItems || 0));
  const totalPages = Math.max(1, Math.ceil(safeTotal / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);

  return {
    page: safePage,
    limit,
    totalItems: safeTotal,
    totalPages,
    hasPrevPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };
}

function getAdminReviewFilter(rawFilter = "ALL") {
  const filter = cleanText(rawFilter).toUpperCase();

  if (filter === "LOW") {
    return { rating: { $lte: 2 } };
  }

  if (filter === "MID") {
    return { rating: 3 };
  }

  if (filter === "HIGH") {
    return { rating: { $gte: 4 } };
  }

  if (filter === "NO_REPLY") {
    return {
      $or: [
        { adminReply: { $exists: false } },
        { adminReply: null },
        { adminReply: "" },
      ],
    };
  }

  return {};
}

function getBookingModel(bookingType) {
  if (bookingType === "resort") return ResortBooking;
  if (bookingType === "event") return EventBooking;
  if (bookingType === "hotel_room") return HotelRoomBooking;
  return null;
}

function formatBookingTitle(bookingType, booking = {}) {
  if (bookingType === "resort") {
    return booking.venue || "Resort & Venue Booking";
  }

  if (bookingType === "event") {
    return booking.eventPackage || "Event Package Booking";
  }

  if (bookingType === "hotel_room") {
    const room = booking.roomType || "Hotel Room";
    const duration = booking.duration || "";
    return `${room}${duration ? ` - ${duration}` : ""}`;
  }

  return "Booking";
}

function getBookingDate(bookingType, booking = {}) {
  if (bookingType === "event") return booking.eventDate || "";
  return booking.date || "";
}

function normalizeBooking(bookingType, booking, reviewMap) {
  const id = String(booking._id);
  const review = reviewMap.get(`${bookingType}:${id}`) || null;

  return {
    _id: id,
    bookingType,
    serviceType:
      booking.serviceType ||
      (bookingType === "resort"
        ? "Resort & Venue"
        : bookingType === "event"
        ? "Event Package"
        : "Hotel"),
    bookingTitle: formatBookingTitle(bookingType, booking),
    bookingDate: getBookingDate(bookingType, booking),
    bookingTime: booking.time || "",
    status: booking.status || "",
    paymentMethod: booking.paymentMethod || "",
    amount: booking.price || booking.totalAmount || booking.amount || 0,
    pax:
      booking.pax ||
      booking.totalGuests ||
      Number(booking.adults || 0) + Number(booking.kids || 0) ||
      0,
    reviewed: Boolean(review),
    review,
    raw: booking,
  };
}

export const getApprovedBookingHistoryForReview = async (req, res) => {
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

    const [resortBookings, eventBookings, hotelRoomBookings, reviews] =
      await Promise.all([
        ResortBooking.find({ userId, status: "CONFIRMED" })
          .select("-proof.data")
          .sort({ createdAt: -1 })
          .lean(),

        EventBooking.find({ userId, status: "CONFIRMED" })
          .select("-proof.data")
          .sort({ createdAt: -1 })
          .lean(),

        HotelRoomBooking.find({ userId, status: "CONFIRMED" })
          .select("-proof.data")
          .sort({ createdAt: -1 })
          .lean(),

        HotelGuestReview.find({ userId }).sort({ createdAt: -1 }).lean(),
      ]);

    const reviewMap = new Map(
      reviews.map((review) => [
        `${review.bookingType}:${String(review.bookingId)}`,
        {
          _id: review._id,
          rating: review.rating,
          reviewText: review.reviewText,
          adminReply: review.adminReply,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        },
      ])
    );

    const history = [
      ...resortBookings.map((booking) =>
        normalizeBooking("resort", booking, reviewMap)
      ),
      ...eventBookings.map((booking) =>
        normalizeBooking("event", booking, reviewMap)
      ),
      ...hotelRoomBookings.map((booking) =>
        normalizeBooking("hotel_room", booking, reviewMap)
      ),
    ].sort((a, b) => {
      const aDate = new Date(a.raw?.createdAt || 0).getTime();
      const bDate = new Date(b.raw?.createdAt || 0).getTime();
      return bDate - aDate;
    });

    return res.status(200).json({
      success: true,
      history,
      totalApproved: history.length,
      totalReviewed: history.filter((item) => item.reviewed).length,
    });
  } catch (err) {
    console.error("getApprovedBookingHistoryForReview error:", err);

    return res.status(500).json({
      success: false,
      message: "Error loading approved booking history.",
    });
  }
};

export const createGuestReview = async (req, res) => {
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

    const bookingType = cleanText(req.body.bookingType);
    const bookingId = cleanText(req.body.bookingId);
    const rating = Number(req.body.rating);
    const reviewText = cleanText(req.body.reviewText);

    if (!["resort", "event", "hotel_room"].includes(bookingType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking type.",
      });
    }

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id.",
      });
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be from 1 to 5.",
      });
    }

    if (!reviewText || reviewText.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Review must be at least 5 characters.",
      });
    }

    const BookingModel = getBookingModel(bookingType);

    if (!BookingModel) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking type.",
      });
    }

    const booking = await BookingModel.findOne({
      _id: bookingId,
      userId,
    }).select("-proof.data");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (String(booking.status || "").toUpperCase() !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Only approved bookings can be reviewed.",
      });
    }

    const existing = await HotelGuestReview.findOne({
      userId,
      bookingType,
      bookingId,
    }).select("_id");

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You already submitted a review for this booking.",
      });
    }

    const review = await HotelGuestReview.create({
      userId,
      bookingType,
      bookingId: new mongoose.Types.ObjectId(bookingId),
      serviceType: booking.serviceType || "",
      bookingTitle: formatBookingTitle(bookingType, booking),
      bookingDate: getBookingDate(bookingType, booking),
      bookingTime: booking.time || "",
      firstName: booking.firstName || "",
      lastName: booking.lastName || "",
      email: booking.email || "",
      rating,
      reviewText,
      isVisible: true,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already submitted a review for this booking.",
      });
    }

    console.error("createGuestReview error:", err);

    return res.status(500).json({
      success: false,
      message: "Error submitting review.",
    });
  }
};

export const getMyGuestReviews = async (req, res) => {
  const auth = requireHotelUserAuth(req);

  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  try {
    const userId = getUserIdFromDecoded(auth.decoded);
    const { page, limit, skip } = getPagination(req.query);

    const [totalItems, reviews] = await Promise.all([
      HotelGuestReview.countDocuments({ userId }),
      HotelGuestReview.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      reviews,
      pagination: buildPaginationPayload({ page, limit, totalItems }),
    });
  } catch (err) {
    console.error("getMyGuestReviews error:", err);

    return res.status(500).json({
      success: false,
      message: "Error loading your reviews.",
    });
  }
};

export const adminGetAllGuestReviews = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({
      success: false,
      message: guard.message,
    });
  }

  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = getAdminReviewFilter(req.query.filter || req.query.tab || "ALL");

    const [summaryStats, totalReviews, filteredTotal, lowRatings, noReply, reviews] =
      await Promise.all([
        HotelGuestReview.aggregate([
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$rating" },
            },
          },
        ]),
        HotelGuestReview.countDocuments({}),
        HotelGuestReview.countDocuments(filter),
        HotelGuestReview.countDocuments({ rating: { $lte: 2 } }),
        HotelGuestReview.countDocuments({
          $or: [
            { adminReply: { $exists: false } },
            { adminReply: null },
            { adminReply: "" },
          ],
        }),
        HotelGuestReview.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
      ]);

    const averageRating = Number(
      Number(summaryStats?.[0]?.averageRating || 0).toFixed(2)
    );

    return res.status(200).json({
      success: true,
      totalReviews,
      averageRating,
      lowRatings,
      noReply,
      filteredTotal,
      reviews,
      pagination: buildPaginationPayload({
        page,
        limit,
        totalItems: filteredTotal,
      }),
    });
  } catch (err) {
    console.error("adminGetAllGuestReviews error:", err);

    return res.status(500).json({
      success: false,
      message: "Error loading guest reviews.",
    });
  }
};

export const adminReplyToGuestReview = async (req, res) => {
  const guard = requireHotelAdminAuth(req);

  if (!guard.ok) {
    return res.status(guard.status).json({
      success: false,
      message: guard.message,
    });
  }

  try {
    const { reviewId } = req.params;
    const adminReply = cleanText(req.body.adminReply);

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review id.",
      });
    }

    const review = await HotelGuestReview.findByIdAndUpdate(
      reviewId,
      { adminReply },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reply saved successfully.",
      review,
    });
  } catch (err) {
    console.error("adminReplyToGuestReview error:", err);

    return res.status(500).json({
      success: false,
      message: "Error saving reply.",
    });
  }
};

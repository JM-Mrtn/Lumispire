// src/Backend/controllers/hotelRecommendationController.js
import ResortBooking from "../models/ResortBooking.js";
import EventBooking from "../models/EventBooking.js";
import HotelRoomBooking from "../models/HotelRoomBooking.js";
import {
  requireHotelUserAuth,
  isValidObjectId,
} from "../utils/hotelAuthHelpers.js";

function getUserIdFromDecoded(decoded = {}) {
  return decoded.userId || decoded.id || decoded.hotelUserId || decoded._id || "";
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const HOTEL_ROOM_OPTIONS = [
  {
    id: "hotel-nature-8",
    type: "hotel",
    title: "Nature Room - 8 Hours",
    serviceType: "Hotel",
    roomType: "Nature",
    duration: "8 Hours",
    paxMax: 5,
    price: 700,
    route: "/hotel-booking-form",
    tags: ["nature", "budget", "family", "short stay", "hotel"],
    reason: "Best low-budget hotel option for up to 5 pax.",
  },
  {
    id: "hotel-nature-12",
    type: "hotel",
    title: "Nature Room - 12 Hours",
    serviceType: "Hotel",
    roomType: "Nature",
    duration: "12 Hours",
    paxMax: 5,
    price: 1000,
    route: "/hotel-booking-form",
    tags: ["nature", "family", "relaxing", "hotel"],
    reason: "Good for guests who want longer stay time with a nature-style room.",
  },
  {
    id: "hotel-nature-22",
    type: "hotel",
    title: "Nature Room - 22 Hours",
    serviceType: "Hotel",
    roomType: "Nature",
    duration: "22 Hours",
    paxMax: 5,
    price: 1500,
    route: "/hotel-booking-form",
    tags: ["nature", "overnight", "family", "hotel"],
    reason: "Recommended for overnight or long-stay guests with up to 5 pax.",
  },
  {
    id: "hotel-simple-8",
    type: "hotel",
    title: "Simple Room - 8 Hours",
    serviceType: "Hotel",
    roomType: "Simple",
    duration: "8 Hours",
    paxMax: 3,
    price: 1500,
    route: "/hotel-booking-form",
    tags: ["simple", "couple", "short stay", "hotel"],
    reason: "Good for smaller groups who prefer a simple private room.",
  },
  {
    id: "hotel-simple-12",
    type: "hotel",
    title: "Simple Room - 12 Hours",
    serviceType: "Hotel",
    roomType: "Simple",
    duration: "12 Hours",
    paxMax: 3,
    price: 2000,
    route: "/hotel-booking-form",
    tags: ["simple", "couple", "relaxing", "hotel"],
    reason: "Recommended for small groups who want a longer simple-room stay.",
  },
  {
    id: "hotel-simple-22",
    type: "hotel",
    title: "Simple Room - 22 Hours",
    serviceType: "Hotel",
    roomType: "Simple",
    duration: "22 Hours",
    paxMax: 3,
    price: 2500,
    route: "/hotel-booking-form",
    tags: ["simple", "overnight", "couple", "hotel"],
    reason: "Best Simple Room option for overnight or almost full-day stay.",
  },
];

const RESORT_OPTIONS = [
  {
    id: "resort-lorenzo-hall",
    type: "resort",
    title: "Lorenzo Hall",
    serviceType: "Resort & Venue",
    venue: "LORENZO HALL",
    duration: "8 Hours",
    paxMax: 100,
    price: 15000,
    route: "/resort-form",
    tags: ["venue", "event", "large group", "hall", "resort"],
    reason: "Recommended for larger gatherings or formal celebrations.",
  },
  {
    id: "resort-lorenzo-veranda",
    type: "resort",
    title: "Lorenzo Veranda",
    serviceType: "Resort & Venue",
    venue: "LORENZO VERANDA",
    duration: "8 Hours",
    paxMax: 100,
    price: 12000,
    route: "/resort-form",
    tags: ["venue", "veranda", "outdoor", "family", "resort"],
    reason: "Good venue choice for semi-outdoor family gatherings.",
  },
  {
    id: "resort-lorenzo-cavanas-12",
    type: "resort",
    title: "Lorenzo Cavanas - 12 Hours",
    serviceType: "Resort & Venue",
    venue: "LORENZO CAVANAS",
    duration: "12 Hours",
    paxMax: 100,
    price: 15000,
    route: "/resort-form",
    tags: ["cavanas", "daytime", "family", "resort"],
    reason: "Recommended for relaxing group stay and daytime resort use.",
  },
  {
    id: "resort-lorenzo-campsite-22",
    type: "resort",
    title: "Lorenzo Campsite - 22 Hours",
    serviceType: "Resort & Venue",
    venue: "LORENZO CAMPSITE",
    duration: "22 Hours",
    paxMax: 30,
    price: 18000,
    route: "/resort-form",
    tags: ["campsite", "overnight", "nature", "group", "resort"],
    reason: "Best for nature-style overnight group experiences.",
  },
];

const EVENT_OPTIONS = [
  {
    id: "event-wedding",
    type: "event",
    title: "Wedding Package",
    serviceType: "Event Package",
    eventPackage: "Wedding Package",
    paxMax: 100,
    price: 85000,
    route: "/event-package",
    tags: ["wedding", "formal", "celebration", "event"],
    reason: "Recommended for formal wedding celebrations with full package inclusions.",
  },
  {
    id: "event-debut",
    type: "event",
    title: "Debut Package",
    serviceType: "Event Package",
    eventPackage: "Debut Package",
    paxMax: 100,
    price: 85000,
    route: "/event-package",
    tags: ["debut", "birthday", "celebration", "event"],
    reason: "Recommended for debut celebrations with host, setup, and program support.",
  },
  {
    id: "event-birthday",
    type: "event",
    title: "Birthday Theme Package",
    serviceType: "Event Package",
    eventPackage: "Birthday Theme Package",
    paxMax: 100,
    price: 80000,
    route: "/event-package",
    tags: ["birthday", "theme", "kids", "family", "event"],
    reason: "Recommended for themed birthdays and family celebrations.",
  },
  {
    id: "event-corporate",
    type: "event",
    title: "Corporate Package",
    serviceType: "Event Package",
    eventPackage: "Corporate Package",
    paxMax: 100,
    price: 80000,
    route: "/event-package",
    tags: ["corporate", "meeting", "formal", "event"],
    reason: "Recommended for company events, meetings, and formal programs.",
  },
];

const ALL_OPTIONS = [...HOTEL_ROOM_OPTIONS, ...RESORT_OPTIONS, ...EVENT_OPTIONS];

function normalizeHistoryText(bookings = []) {
  return bookings
    .map((item) =>
      [
        item.serviceType,
        item.roomType,
        item.duration,
        item.venue,
        item.eventPackage,
        item.eventType,
        item.eventTheme,
      ]
        .filter(Boolean)
        .join(" ")
    )
    .join(" ")
    .toLowerCase();
}

function scoreOption(option, preferences, historyText) {
  let score = 0;
  const reasons = [];

  const preferredService = cleanText(preferences.preferredService).toLowerCase();
  const preferredVibe = cleanText(preferences.preferredVibe).toLowerCase();
  const duration = cleanText(preferences.duration).toLowerCase();
  const eventType = cleanText(preferences.eventType).toLowerCase();

  const pax = toNumber(preferences.pax);
  const budget = toNumber(preferences.budget);

  const optionText = [
    option.title,
    option.serviceType,
    option.roomType,
    option.duration,
    option.venue,
    option.eventPackage,
    ...(option.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (preferredService && option.serviceType.toLowerCase().includes(preferredService)) {
    score += 35;
    reasons.push(`Matches your preferred service: ${preferences.preferredService}.`);
  }

  if (preferredVibe && optionText.includes(preferredVibe)) {
    score += 20;
    reasons.push(`Matches your preferred vibe: ${preferences.preferredVibe}.`);
  }

  if (duration && option.duration && option.duration.toLowerCase() === duration) {
    score += 18;
    reasons.push(`Matches your preferred duration: ${preferences.duration}.`);
  }

  if (eventType && optionText.includes(eventType)) {
    score += 18;
    reasons.push(`Matches your event type: ${preferences.eventType}.`);
  }

  if (pax > 0) {
    if (option.paxMax >= pax) {
      score += 15;
      reasons.push(`Fits your ${pax} pax requirement.`);
    } else {
      score -= 35;
      reasons.push(`May not fit because max pax is ${option.paxMax}.`);
    }
  }

  if (budget > 0) {
    if (option.price <= budget) {
      score += 15;
      reasons.push(`Fits your budget of ₱${budget.toLocaleString("en-PH")}.`);
    } else {
      const over = option.price - budget;
      score -= Math.min(25, Math.ceil(over / 1000) * 3);
      reasons.push(`Over your budget by ₱${over.toLocaleString("en-PH")}.`);
    }
  }

  for (const tag of option.tags || []) {
    if (historyText.includes(tag.toLowerCase())) {
      score += 8;
    }
  }

  if (historyText.includes(option.serviceType.toLowerCase())) {
    score += 10;
    reasons.push("Similar to your previous booking history.");
  }

  if (score <= 0) {
    reasons.push(option.reason);
  }

  return {
    ...option,
    score,
    matchPercent: Math.max(5, Math.min(100, Math.round(score))),
    reasons: [...new Set(reasons)].slice(0, 4),
  };
}

export const getHotelSmartRecommendations = async (req, res) => {
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

    const preferences = {
      preferredService: cleanText(req.query.preferredService || "Any"),
      preferredVibe: cleanText(req.query.preferredVibe || ""),
      duration: cleanText(req.query.duration || ""),
      eventType: cleanText(req.query.eventType || ""),
      pax: toNumber(req.query.pax),
      budget: toNumber(req.query.budget),
    };

    const [resortBookings, eventBookings, hotelBookings] = await Promise.all([
      ResortBooking.find({ userId }).select("-proof.data").sort({ createdAt: -1 }).limit(8),
      EventBooking.find({ userId }).select("-proof.data").sort({ createdAt: -1 }).limit(8),
      HotelRoomBooking.find({ userId }).select("-proof.data").sort({ createdAt: -1 }).limit(8),
    ]);

    const bookingHistory = [...resortBookings, ...eventBookings, ...hotelBookings];
    const historyText = normalizeHistoryText(bookingHistory);

    const scored = ALL_OPTIONS.map((option) =>
      scoreOption(option, preferences, historyText)
    ).sort((a, b) => b.score - a.score || a.price - b.price);

    const recommendations = scored.slice(0, 6);

    return res.status(200).json({
      success: true,
      preferences,
      historyCount: bookingHistory.length,
      recommendations,
    });
  } catch (err) {
    console.error("getHotelSmartRecommendations error:", err);

    return res.status(500).json({
      success: false,
      message: "Error generating recommendations.",
    });
  }
};
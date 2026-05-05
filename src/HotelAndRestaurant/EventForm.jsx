import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MENU_OPTIONS = {
  soup: [
    "Creamy Mushroom Soup",
    "Cream of Crab & Corn Soup",
    "Cream of Pumpkin Soup",
  ],
  rice: ["Plain Rice", "Yang Chow Rice", "Java Rice"],
  pasta: [
    "Spaghetti",
    "Baked Macaroni",
    "Chicken Alfredo Pasta",
    "Baked Lasagna",
    "Creamy Carbonara",
  ],
  chicken: [
    "Chicken Cordon Bleu",
    "Chicken Teriyaki",
    "Crispy Fried Chicken",
    "Oriental Honey Buttered Chicken",
    "Grilled Chicken BBQ",
  ],
  pork: [
    "Roast Pork",
    "Grilled Pork BBQ",
    "Pork Hamonado",
    "Pork Asado",
    "Sweet & Sour Pork",
  ],
  vegetable: ["Chopsuey", "Buttered Mixed Vegetables"],
  dessert: [
    "Creamy Mango Solei",
    "Coffee Jelly",
    "Buko Pandan",
    "Buco Fruit Salad",
    "Leche Jella",
  ],
  drinks: ["Water", "Juice"],
};

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

const DEFAULT_EVENT_VENUE_CAPACITY = {
  "LORENZO CAMPSITE": 30,
  "LORENZO VERANDA": 100,
  "LORENZO HALL": 100,
  "LORENZO CAVANAS": 100,
};

const ADDITIONAL_PAX_RATE = 500;
const MAX_ADDITIONAL_PAX = 20;
const MAX_MENU_CHOICES_PER_CATEGORY = 2;

const MENU_CATEGORY_KEYS = [
  "soup",
  "rice",
  "pasta",
  "chicken",
  "pork",
  "vegetable",
  "dessert",
  "drinks",
];

const MAIN_MENU_KEYS = ["pasta", "chicken", "pork", "vegetable"];

const COLORS = {
  green: "#3f5b44",
  greenDark: "#2f4d36",
  border: "rgba(63, 91, 68, 0.35)",
  bg: "#ffffff",
  fieldBg: "rgba(255,255,255,0.55)",
};

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

function formatPeso(value) {
  const num = Number(value || 0);

  if (!num) return "—";

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

function isoToLocalDateObj(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(dateObj, days) {
  const copy = new Date(dateObj);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function inferEventType(title = "") {
  const lower = String(title || "").toLowerCase();

  if (lower.includes("wedding")) return "Wedding";
  if (lower.includes("debut")) return "Debut";
  if (lower.includes("birthday")) return "Birthday";
  if (lower.includes("corporate")) return "Corporate";

  return "Event";
}

function parseMoney(value = "") {
  const num = String(value || "").replace(/[^0-9.]/g, "");
  return Number(num || 0);
}

function parsePax(value = "") {
  const match = String(value || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function normalizeTimeLabel(value = "") {
  const text = String(value || "").trim().toLowerCase();

  if (text.includes("22")) return "22 Hours";
  if (text.includes("12")) return "12 Hours";
  if (text.includes("8")) return "8 Hours";

  return String(value || "").trim() || "8 Hours";
}

function getDefaultTimeSlots(label = "8 Hours") {
  const normalized = normalizeTimeLabel(label);

  if (normalized === "8 Hours") return EVENT_TIME_SLOTS_8H;

  if (normalized === "12 Hours") {
    return [
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
  }

  if (normalized === "22 Hours") {
    return [
      "6:00 AM - 4:00 AM next day",
      "7:00 AM - 5:00 AM next day",
      "8:00 AM - 6:00 AM next day",
    ];
  }

  return EVENT_TIME_SLOTS_8H;
}

function inferTimeLabelFromSlots(slots = []) {
  const normalized = Array.isArray(slots)
    ? slots.map((slot) => String(slot || "").trim()).filter(Boolean)
    : [];

  const labels = ["8 Hours", "12 Hours", "22 Hours"];

  for (const label of labels) {
    const defaults = getDefaultTimeSlots(label);
    if (
      defaults.length === normalized.length &&
      defaults.every((slot) => normalized.includes(slot))
    ) {
      return label;
    }
  }

  return normalized.length ? "Custom Time" : "8 Hours";
}

function makeVariantKey(option = {}) {
  return String(
    option._id ||
      option.id ||
      option.variantId ||
      `${option.pax || "pax"}-${option.timeLabel || "time"}-${option.displayOrder || 0}`
  );
}

function normalizeVenue(value = "") {
  const text = String(value || "").trim().toUpperCase().replace(/\s+/g, " ");

  if (text.includes("LORENZO HALL")) return "LORENZO HALL";
  if (text.includes("LORENZO VERANDA")) return "LORENZO VERANDA";
  if (text.includes("LORENZO CABANAS") || text.includes("LORENZO CAVANAS")) {
    return "LORENZO CAVANAS";
  }
  if (text.includes("LORENZO CAMPSITE")) return "LORENZO CAMPSITE";

  return text;
}

function parseMaxCapacity(value = "") {
  const matches = String(value || "").match(/\d+/g);
  if (!matches?.length) return null;

  const numbers = matches
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);

  return numbers.length ? Math.max(...numbers) : null;
}

function getVenueCapacity(pkg = {}) {
  const normalizedTitle = normalizeVenue(pkg.title || pkg.venue || "");
  const capacityFromField = parseMaxCapacity(pkg.capacity);

  if (capacityFromField) return capacityFromField;

  const capacityFromInclusions = Array.isArray(pkg.inclusions)
    ? Math.max(
        ...pkg.inclusions
          .filter((line) => /(capacity|pax|guest|guests)/i.test(String(line || "")))
          .map(parseMaxCapacity)
          .filter(Boolean),
        0
      )
    : 0;

  return capacityFromInclusions || DEFAULT_EVENT_VENUE_CAPACITY[normalizedTitle] || 0;
}

function parsePriceOptions(pkg) {
  if (Array.isArray(pkg?.variants) && pkg.variants.length > 0) {
    return pkg.variants
      .filter((variant) => variant?.isActive !== false)
      .map((variant, index) => {
        const label = String(variant.label || "").trim();
        const pax = Number(variant.pax || parsePax(label));
        const timeSlots = Array.isArray(variant.timeSlots) && variant.timeSlots.length
          ? variant.timeSlots.map((slot) => String(slot || "").trim()).filter(Boolean)
          : getDefaultTimeSlots(variant.timeVariationLabel || variant.duration || "8 Hours");
        const timeLabel = inferTimeLabelFromSlots(timeSlots);
        const option = {
          _id: variant._id || variant.id || "",
          variantId: variant._id || variant.id || "",
          pax,
          label: label || `${pax} Pax - ${timeLabel}`,
          timeLabel,
          timeSlots,
          price: Number(variant.price || 0),
          displayOrder: Number(variant.displayOrder || index + 1),
        };

        return {
          ...option,
          key: makeVariantKey(option),
        };
      })
      .filter((item) => item.pax > 0 && item.price > 0 && item.timeSlots.length > 0)
      .sort(
        (a, b) =>
          Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
          Number(a.pax || 0) - Number(b.pax || 0) ||
          String(a.timeLabel || "").localeCompare(String(b.timeLabel || ""))
      );
  }

  const out = [];

  (pkg?.inclusions || []).forEach((line) => {
    const text = String(line || "");

    if (!/price|₱|php/i.test(text)) return;

    const pax = parsePax(text);
    const price = parseMoney(text);

    if (pax && price) {
      const option = {
        pax,
        label: `${pax} PAX - 8 Hours`,
        price,
        timeLabel: "8 Hours",
        timeSlots: EVENT_TIME_SLOTS_8H,
      };
      out.push({ ...option, key: makeVariantKey(option) });
    }
  });

  if (!out.length && pkg?.capacity && pkg?.price) {
    const pax = parsePax(pkg.capacity);
    const option = {
      pax: pax || 1,
      label: `${pkg.capacity || "Package Rate"} - 8 Hours`,
      price: Number(pkg.price || 0),
      timeLabel: "8 Hours",
      timeSlots: EVENT_TIME_SLOTS_8H,
    };
    out.push({ ...option, key: makeVariantKey(option) });
  }

  if (!out.length && pkg?.price) {
    const option = {
      pax: 1,
      label: "Package Rate - 8 Hours",
      price: Number(pkg.price || 0),
      timeLabel: "8 Hours",
      timeSlots: EVENT_TIME_SLOTS_8H,
    };
    out.push({ ...option, key: makeVariantKey(option) });
  }

  return out;
}

function normalizePackage(pkg = {}) {
  return {
    ...pkg,
    _id: pkg._id || pkg.id || "",
    title: pkg.title || pkg.name || "Event Package",
    priceOptions: parsePriceOptions(pkg),
  };
}

function normalizeVenuePackage(pkg = {}) {
  const title = pkg.title || pkg.name || "";
  const normalizedTitle = normalizeVenue(title);
  const capacity = getVenueCapacity(pkg);

  return {
    ...pkg,
    _id: pkg._id || pkg.id || normalizedTitle,
    title,
    normalizedTitle,
    capacity,
    label: `${title}${capacity ? ` - Max ${capacity} pax` : ""}`,
  };
}

function getSavedDraft() {
  try {
    return JSON.parse(sessionStorage.getItem("eventBookingDraft") || "null");
  } catch {
    return null;
  }
}

export default function EventForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const incomingDraft = location.state || getSavedDraft() || {};

  const API_BASE = useMemo(() => getApiBase(), []);
  const presetAppliedRef = useRef(false);

  const presetPackageId =
    incomingDraft.selectedPackageId || incomingDraft.packageId || "";
  const presetPackageTitle =
    incomingDraft.selectedPackage ||
    incomingDraft.selectedPackageTitle ||
    incomingDraft.eventPackage ||
    "";

  const [packages, setPackages] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingDates, setLoadingDates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});
  const [bookedDates, setBookedDates] = useState([]);
  const [blockedTimeSlotsByDate, setBlockedTimeSlotsByDate] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    firstName: incomingDraft.firstName || "",
    lastName: incomingDraft.lastName || "",
    email: incomingDraft.email || "",
    phone: incomingDraft.phone || "",
    serviceType: "Event Package",
    packageId: presetPackageId,
    eventPackage: presetPackageTitle,
    eventDate: incomingDraft.eventDate || "",
    venue: incomingDraft.venue || "",
    time: incomingDraft.time || "",
    basePax: incomingDraft.basePax ? String(incomingDraft.basePax) : "",
    selectedVariantId: incomingDraft.selectedVariantId || incomingDraft.variantId || "",
    pax: incomingDraft.pax ? String(incomingDraft.pax) : "",
    eventTheme: incomingDraft.eventTheme || "",
    eventType: incomingDraft.eventType || inferEventType(presetPackageTitle),
    foodAllergy: incomingDraft.foodAllergy || "",
    specialRequest: incomingDraft.specialRequest || "",
    soup: Array.isArray(incomingDraft.soup)
      ? incomingDraft.soup
      : Array.isArray(incomingDraft.appetizer)
      ? incomingDraft.appetizer
      : [],
    rice: [],
    pasta: [],
    chicken: [],
    pork: [],
    vegetable: [],
    dessert: Array.isArray(incomingDraft.dessert) ? incomingDraft.dessert : [],
    drinks: Array.isArray(incomingDraft.drinks) ? incomingDraft.drinks : [],
  });

  const todayLocalISO = useMemo(() => toLocalISO(new Date()), []);
  const oneYearAheadISO = useMemo(() => toLocalISO(addDays(new Date(), 365)), []);
  const selectedDateObj = useMemo(
    () => isoToLocalDateObj(form.eventDate),
    [form.eventDate]
  );
  const minDateObj = useMemo(() => isoToLocalDateObj(todayLocalISO), [todayLocalISO]);

  const excludeDateObjects = useMemo(
    () => bookedDates.map(isoToLocalDateObj).filter(Boolean),
    [bookedDates]
  );

  const selectedPackage = useMemo(() => {
    return (
      packages.find((item) => String(item._id) === String(form.packageId)) ||
      packages.find(
        (item) =>
          String(item.title || "").toLowerCase() ===
          String(form.eventPackage || "").toLowerCase()
      ) ||
      null
    );
  }, [packages, form.packageId, form.eventPackage]);

  const selectedVenue = useMemo(() => {
    return (
      venues.find((item) => item.normalizedTitle === normalizeVenue(form.venue)) ||
      null
    );
  }, [venues, form.venue]);

  const priceOptions = useMemo(
    () => parsePriceOptions(selectedPackage),
    [selectedPackage]
  );

  const selectedBaseOption = useMemo(() => {
    if (form.selectedVariantId) {
      return priceOptions.find((item) => makeVariantKey(item) === String(form.selectedVariantId)) || null;
    }

    const basePax = Number(form.basePax || 0);
    return priceOptions.find((item) => Number(item.pax) === basePax) || null;
  }, [form.basePax, form.selectedVariantId, priceOptions]);

  const venueCapacity = Number(selectedVenue?.capacity || 0);
  const packageBasePax = Number(selectedBaseOption?.pax || form.basePax || 0);
  const maxAllowedPax = packageBasePax ? packageBasePax + MAX_ADDITIONAL_PAX : 0;
  const selectedPax = Number(form.pax || 0);
  const foodIncludedPax = packageBasePax;
  const chargeableFoodPax = packageBasePax
    ? Math.max(0, selectedPax - packageBasePax)
    : 0;
  const foodChargePerExtraPax = ADDITIONAL_PAX_RATE;
  const foodCharge = chargeableFoodPax * foodChargePerExtraPax;

  // Keep old names for EventSummary/backend compatibility.
  const additionalPax = chargeableFoodPax;
  const additionalPaxCharge = foodCharge;
  const baseAmount = Number(selectedBaseOption?.price || 0);
  const totalAmount = baseAmount + foodCharge;

  const paxOptions = useMemo(() => {
    const max = maxAllowedPax || 0;
    if (!max) return [];

    return Array.from({ length: max }, (_, index) => index + 1);
  }, [maxAllowedPax]);

  const selectedVariationTimeSlots = useMemo(() => {
    return selectedBaseOption?.timeSlots?.length
      ? selectedBaseOption.timeSlots
      : EVENT_TIME_SLOTS_8H;
  }, [selectedBaseOption]);

  const selectedTimeVariationLabel = useMemo(() => {
    return selectedBaseOption?.timeLabel || inferTimeLabelFromSlots(selectedVariationTimeSlots);
  }, [selectedBaseOption, selectedVariationTimeSlots]);

  const selectedDateBlockedTimeSlots = useMemo(() => {
    if (!form.eventDate) return [];

    const slots = blockedTimeSlotsByDate?.[form.eventDate];
    return Array.isArray(slots) ? slots : [];
  }, [blockedTimeSlotsByDate, form.eventDate]);

  const availableEventTimeSlots = useMemo(() => {
    if (!form.eventDate) return selectedVariationTimeSlots;

    const blocked = new Set(selectedDateBlockedTimeSlots);
    return selectedVariationTimeSlots.filter((slot) => !blocked.has(slot));
  }, [form.eventDate, selectedDateBlockedTimeSlots, selectedVariationTimeSlots]);

  const selectedDateIsBooked = Boolean(
    form.eventDate && bookedDates.includes(form.eventDate)
  );

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setStatus({ type: "", message: "" });
  };

  const applyPackage = (pkg) => {
    if (!pkg) return;

    const options = parsePriceOptions(pkg);
    const defaultOption = options.length === 1 ? options[0] : null;
    const defaultBasePax = defaultOption ? String(defaultOption.pax || "") : "";
    const defaultVariantId = defaultOption ? makeVariantKey(defaultOption) : "";

    setForm((prev) => ({
      ...prev,
      packageId: pkg._id || "",
      eventPackage: pkg.title || "",
      eventType: prev.eventType?.trim() ? prev.eventType : inferEventType(pkg.title),
      selectedVariantId: defaultVariantId,
      basePax: defaultBasePax,
      pax: defaultBasePax,
      time: "",
    }));
  };

  const applyVenue = (value) => {
    setForm((prev) => ({
      ...prev,
      venue: value,
      eventDate: "",
      time: "",
      pax: "",
    }));
    setBookedDates([]);
    setErrors((prev) => ({ ...prev, venue: "", eventDate: "", time: "", pax: "" }));
    setStatus({ type: "", message: "" });
  };

  const toggleCheckboxValue = (key, value) => {
    const current = Array.isArray(form[key]) ? form[key] : [];
    const alreadySelected = current.includes(value);

    if (!alreadySelected && current.length >= MAX_MENU_CHOICES_PER_CATEGORY) {
      setErrors((prev) => ({
        ...prev,
        [key]: `Maximum of ${MAX_MENU_CHOICES_PER_CATEGORY} choices only.`,
      }));

      setStatus({
        type: "error",
        message: `You can select up to ${MAX_MENU_CHOICES_PER_CATEGORY} choices only per food category.`,
      });

      return;
    }

    setForm((prev) => ({
      ...prev,
      [key]: alreadySelected
        ? current.filter((item) => item !== value)
        : [...current, value],
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
      ...(MAIN_MENU_KEYS.includes(key) ? { mainMenu: "" } : {}),
    }));

    setStatus({ type: "", message: "" });
  };

  const fetchPackages = async () => {
    setLoadingPackages(true);

    try {
      const res = await fetch(`${API_BASE}/packages?type=event_package`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to load event packages.");
      }

      const list = Array.isArray(data.packages)
        ? data.packages.filter((item) => item?.isActive !== false)
        : [];

      const normalized = list
        .map(normalizePackage)
        .sort((a, b) => {
          const orderA = Number(a.displayOrder || 0);
          const orderB = Number(b.displayOrder || 0);

          if (orderA !== orderB) return orderA - orderB;

          return String(a.title || "").localeCompare(String(b.title || ""));
        });

      setPackages(normalized);
    } catch (error) {
      console.error("fetch event packages error:", error);
      setStatus({
        type: "error",
        message: "Could not load Event Packages. Please check your backend.",
      });
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchVenues = async () => {
    setLoadingVenues(true);

    try {
      const res = await fetch(`${API_BASE}/packages?type=resort_venue`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to load resort venues.");
      }

      const list = Array.isArray(data.packages)
        ? data.packages.filter((item) => item?.isActive !== false)
        : [];

      const normalized = list
        .map(normalizeVenuePackage)
        .filter((item) => item.title && item.capacity > 0)
        .sort((a, b) => {
          const orderA = Number(a.displayOrder || 0);
          const orderB = Number(b.displayOrder || 0);

          if (orderA !== orderB) return orderA - orderB;

          return String(a.title || "").localeCompare(String(b.title || ""));
        });

      setVenues(normalized);
    } catch (error) {
      console.error("fetch resort venues error:", error);
      setStatus({
        type: "error",
        message: "Could not load available venues. Please check your backend.",
      });
      setVenues([]);
    } finally {
      setLoadingVenues(false);
    }
  };

  const fetchBookedDates = async (venue) => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token || !venue) return;

    setLoadingDates(true);

    try {
      const query = new URLSearchParams({
        venue,
        from: todayLocalISO,
        to: oneYearAheadISO,
        packageId: form.packageId || "",
        eventPackage: form.eventPackage || "",
        variantId: form.selectedVariantId || "",
        basePax: form.basePax || "",
      });

      const res = await fetch(`${API_BASE}/event-bookings/booked-dates?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("hotelToken");
        navigate("/hotel-login");
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to load booked dates.");
      }

      const fullyBookedDates = Array.isArray(data.fullBookedDates)
        ? data.fullBookedDates
        : Array.isArray(data.bookedDates)
        ? data.bookedDates
        : [];

      setBookedDates(fullyBookedDates);
      setBlockedTimeSlotsByDate(
        data.blockedTimeSlotsByDate && typeof data.blockedTimeSlotsByDate === "object"
          ? data.blockedTimeSlotsByDate
          : {}
      );
    } catch (error) {
      console.error("fetch event booked dates error:", error);
      setBookedDates([]);
      setBlockedTimeSlotsByDate({});
    } finally {
      setLoadingDates(false);
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        firstName: prev.firstName || profile.firstName || "",
        lastName: prev.lastName || profile.lastName || "",
        email: prev.email || profile.email || "",
        phone: prev.phone || profile.phone || profile.contactNumber || "",
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

  useEffect(() => {
    fetchPackages();
    fetchVenues();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!form.venue) return;
    fetchBookedDates(form.venue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.venue, form.packageId, form.selectedVariantId, form.basePax]);

  useEffect(() => {
    if (presetAppliedRef.current || !packages.length) return;

    const matched =
      packages.find((item) => String(item._id) === String(presetPackageId)) ||
      packages.find(
        (item) =>
          String(item.title || "").toLowerCase() ===
          String(presetPackageTitle || "").toLowerCase()
      );

    if (matched) {
      const options = parsePriceOptions(matched);

      const defaultOption = options.length === 1 ? options[0] : null;

      setForm((prev) => ({
        ...prev,
        packageId: matched._id || "",
        eventPackage: matched.title || "",
        eventType: prev.eventType?.trim() ? prev.eventType : inferEventType(matched.title),
        selectedVariantId: prev.selectedVariantId || (defaultOption ? makeVariantKey(defaultOption) : ""),
        basePax: prev.basePax || (defaultOption ? String(defaultOption.pax || "") : ""),
        pax: prev.pax || (defaultOption ? String(defaultOption.pax || "") : ""),
      }));
    }

    presetAppliedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages]);

  const checkAvailability = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) {
      navigate("/hotel-login");
      return { ok: false, available: false, message: "Please log in again." };
    }

    const query = new URLSearchParams({
      venue: form.venue,
      eventDate: form.eventDate,
      time: form.time,
      packageId: form.packageId || "",
      eventPackage: form.eventPackage || "",
      variantId: form.selectedVariantId || "",
      basePax: form.basePax || "",
    });

    const res = await fetch(`${API_BASE}/event-bookings/check?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("hotelToken");
      navigate("/hotel-login");
      return { ok: false, available: false, message: "Please log in again." };
    }

    if (!res.ok) {
      return {
        ok: false,
        available: false,
        message: data.message || "Could not check event availability.",
      };
    }

    return data;
  };

  const validate = () => {
    const next = {};

    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";

    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Invalid email format.";
    }

    if (!form.phone.trim()) next.phone = "Phone number is required.";
    else if (!/^09\d{9}$/.test(form.phone)) {
      next.phone = "Phone must be 11 digits and start with 09.";
    }

    if (!form.packageId) next.packageId = "Choose an event package.";
    if (!form.basePax) next.basePax = "Choose a package capacity.";

    if (!form.venue) next.venue = "Choose a venue.";

    if (!form.eventDate) next.eventDate = "Choose a date.";
    else if (form.eventDate < todayLocalISO) {
      next.eventDate = "Date cannot be in the past.";
    } else if (bookedDates.includes(form.eventDate)) {
      next.eventDate = "This venue is fully booked for this date.";
    }

    if (!form.time) next.time = "Choose time.";
    else if (!selectedVariationTimeSlots.includes(form.time)) {
      next.time = `Choose a valid ${selectedTimeVariationLabel} event time slot.`;
    } else if (!availableEventTimeSlots.includes(form.time)) {
      next.time = "This time slot is blocked by a pending or approved Resort & Venue / Event Package booking and the required 1-hour gap. If admin rejects or cancels that booking, the slot will open again.";
    }

    const pax = Number(form.pax || 0);

    if (!form.pax) next.pax = "Choose number of pax.";
    else if (!Number.isFinite(pax) || pax <= 0) {
      next.pax = "Pax must be at least 1.";
    } else if (!packageBasePax) {
      next.pax = "Choose a package capacity first.";
    } else if (maxAllowedPax && pax > maxAllowedPax) {
      next.pax = `Maximum ${maxAllowedPax} pax only for the selected package capacity (${packageBasePax} pax + ${MAX_ADDITIONAL_PAX} additional pax).`;
    }

    if (!form.eventTheme.trim()) next.eventTheme = "Event theme is required.";
    if (!form.eventType.trim()) next.eventType = "Event type is required.";

    if (!form.soup.length) next.soup = "Choose at least one soup.";
    if (!form.rice.length) next.rice = "Choose at least one rice.";

    const hasMain =
      form.pasta.length ||
      form.chicken.length ||
      form.pork.length ||
      form.vegetable.length;

    if (!hasMain) next.mainMenu = "Choose at least one main menu item.";
    if (!form.dessert.length) next.dessert = "Choose at least one dessert.";
    if (!form.drinks.length) next.drinks = "Choose at least one drink.";

    MENU_CATEGORY_KEYS.forEach((key) => {
      const selected = Array.isArray(form[key]) ? form[key] : [];

      if (selected.length > MAX_MENU_CHOICES_PER_CATEGORY) {
        next[key] = `Maximum of ${MAX_MENU_CHOICES_PER_CATEGORY} choices only.`;
      }
    });

    if (!baseAmount) next.totalAmount = "Package price cannot be computed.";

    return next;
  };

  const buildMenuPayload = () => ({
    appetizer: [...form.soup],
    mainDish: [
      ...form.rice.map((item) => `Rice - ${item}`),
      ...form.pasta.map((item) => `Pasta - ${item}`),
      ...form.chicken.map((item) => `Chicken - ${item}`),
      ...form.pork.map((item) => `Pork - ${item}`),
      ...form.vegetable.map((item) => `Vegetable - ${item}`),
    ],
    dessert: [...form.dessert],
    drinks: [...form.drinks],
  });

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

      if (!availability.ok && availability.success !== true) {
        setStatus({
          type: "error",
          message: availability.message || "Could not check event availability.",
        });
        setSubmitting(false);
        return;
      }

      if (!availability.available) {
        setErrors((prev) => ({
          ...prev,
          eventDate:
            availability.message ||
            "This event time slot is already blocked by a pending or approved Resort & Venue / Event Package booking.",
        }));

        setStatus({
          type: "error",
          message:
            availability.message ||
            "Selected event time is not available for this venue.",
        });

        setSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("event availability error:", error);
      setStatus({
        type: "error",
        message: "Network error while checking event availability.",
      });
      setSubmitting(false);
      return;
    }

    const payload = {
      ...form,
      ...buildMenuPayload(),
      packageId: selectedPackage?._id || form.packageId,
      selectedPackageId: selectedPackage?._id || form.packageId,
      selectedVariantId: form.selectedVariantId,
      variantId: form.selectedVariantId,
      selectedVariantLabel: selectedBaseOption?.label || "",
      timeVariationLabel: selectedTimeVariationLabel,
      selectedTimeSlots: selectedVariationTimeSlots,
      eventPackage: selectedPackage?.title || form.eventPackage,
      selectedPackageTitle: selectedPackage?.title || form.eventPackage,
      basePax: Number(form.basePax),
      pax: Number(form.pax),
      venue: normalizeVenue(form.venue),
      venueDisplayName: selectedVenue?.title || form.venue,
      venueCapacity,
      maxAdditionalPax: MAX_ADDITIONAL_PAX,
      foodIncludedPax,
      chargeableFoodPax,
      foodChargePerExtraPax,
      foodCharge,
      additionalPax,
      additionalPaxRate: ADDITIONAL_PAX_RATE,
      baseAmount,
      additionalPaxCharge,
      totalAmount,
      selectedCapacity: `${form.basePax} Pax`,
      selectedInclusions: selectedPackage?.inclusions || [],
      packageMeta: selectedPackage,
    };

    sessionStorage.setItem("eventBookingDraft", JSON.stringify(payload));
    navigate("/event-summary", { state: payload });
    setSubmitting(false);
  };

  const statusStyles =
    status.type === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status.type === "error"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

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
          <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${statusStyles}`}>
            {status.message}
          </div>
        ) : null}

        <Section title="Personal Details">
          <Field
            label="First Name"
            value={form.firstName}
            disabled={loadingProfile}
            error={errors.firstName}
            placeholder="Enter first name"
            onChange={(value) =>
              setField("firstName", value.replace(/[^A-Za-z\s]/g, "").slice(0, 30))
            }
          />

          <Field
            label="Last Name"
            value={form.lastName}
            disabled={loadingProfile}
            error={errors.lastName}
            placeholder="Enter last name"
            onChange={(value) =>
              setField("lastName", value.replace(/[^A-Za-z\s]/g, "").slice(0, 30))
            }
          />

          <Field
            label="Email"
            type="email"
            value={form.email}
            disabled={loadingProfile}
            error={errors.email}
            placeholder="Enter email"
            onChange={(value) =>
              setField("email", value.replace(/\s/g, "").slice(0, 60))
            }
          />

          <Field
            label="Phone Number"
            value={form.phone}
            disabled={loadingProfile}
            error={errors.phone}
            placeholder="09XXXXXXXXX"
            inputMode="numeric"
            onChange={(value) =>
              setField("phone", value.replace(/\D/g, "").slice(0, 11))
            }
          />
        </Section>

        <div className="mt-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <h2 className="font-['Montserrat',sans-serif] text-[25px] font-semibold text-white sm:text-[30px]">
              Booking Details
            </h2>

            <input
              value="Event Package"
              disabled
              readOnly
              className="h-8 w-full rounded-md border-0 bg-white px-3 text-[12px] font-semibold text-[#3f5b44] outline-none sm:w-[250px]"
            />

            <div className="text-sm font-bold text-white md:ml-auto">
              Total: {formatPeso(totalAmount)}
              <span className="ml-3 font-semibold opacity-80">
                • Package: {form.eventPackage || "—"}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-3">
            <SelectField
              label="Choose Package"
              value={form.packageId}
              onChange={(value) =>
                applyPackage(packages.find((item) => String(item._id) === String(value)))
              }
              options={packages.map((pkg) => ({
                value: pkg._id,
                label: pkg.title,
              }))}
              placeholder={loadingPackages ? "Loading packages..." : "Select package"}
              error={errors.packageId}
              disabled={loadingPackages}
            />

            <SelectField
              label="Package Capacity / Time / Base Price"
              value={form.selectedVariantId || (selectedBaseOption ? makeVariantKey(selectedBaseOption) : "")}
              onChange={(value) => {
                const selected = priceOptions.find((item) => makeVariantKey(item) === String(value));

                setForm((prev) => ({
                  ...prev,
                  selectedVariantId: value,
                  basePax: selected ? String(selected.pax || "") : "",
                  pax: selected ? String(selected.pax || "") : "",
                  time: "",
                }));

                setErrors((prev) => ({ ...prev, basePax: "", pax: "", time: "", totalAmount: "" }));
                setStatus({ type: "", message: "" });
              }}
              options={priceOptions.map((item) => ({
                value: makeVariantKey(item),
                label: `${item.label || `${item.pax} PAX`} - ${formatPeso(item.price)}`,
              }))}
              placeholder="Select package rate and time variation"
              error={errors.basePax}
              disabled={!selectedPackage || priceOptions.length === 0}
            />

            <SelectField
              label="Choose Venue"
              value={form.venue}
              onChange={applyVenue}
              options={venues.map((item) => ({
                value: item.normalizedTitle,
                label: item.label,
              }))}
              placeholder={loadingVenues ? "Loading venues..." : "Venue type"}
              error={errors.venue}
              disabled={loadingVenues}
            />

            <div>
              <label className="mb-2 block text-[13px] font-extrabold text-white">Choose Date</label>

              <div className="relative">
                <DatePicker
                  selected={selectedDateObj}
                  onChange={(date) => {
                    setField("eventDate", date ? toLocalISO(date) : "");
                    setField("time", "");
                  }}
                  minDate={minDateObj}
                  excludeDates={excludeDateObjects}
                  placeholderText={
                    !form.venue
                      ? "Choose venue first"
                      : loadingDates
                      ? "Loading dates..."
                      : "mm/dd/yyyy"
                  }
                  dateFormat="MM/dd/yyyy"
                  disabled={!form.venue || loadingDates}
                  className="h-9 w-full rounded-md border border-black/10 bg-white px-3 pr-11 text-sm font-semibold text-[#3f5b44] outline-none transition placeholder:text-[#3f5b44]/45 focus:ring-2 focus:ring-white/70 disabled:opacity-70"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80">
                  📅
                </span>
              </div>

              {errors.eventDate ? (
                <p className="mt-1 text-xs font-semibold text-rose-100">{errors.eventDate}</p>
              ) : null}

              {form.venue ? (
                <p className="mt-1 text-xs font-semibold text-white/75">
                  Dates stay open while at least one selected time-variation slot is available. Pending or approved Resort & Venue / Event Package bookings block matching slots with a required 1-hour gap. Rejected or cancelled bookings open the slot again.
                </p>
              ) : null}
            </div>

            <SelectField
              label="Time"
              value={form.time}
              onChange={(value) => setField("time", value)}
              options={availableEventTimeSlots.map((item) => ({
                value: item,
                label: item,
              }))}
              placeholder={
                selectedDateIsBooked
                  ? "Date is fully booked"
                  : availableEventTimeSlots.length
                  ? `Choose ${selectedTimeVariationLabel} slot`
                  : "No time slots available"
              }
              error={errors.time}
              disabled={!form.eventDate || !form.selectedVariantId || selectedDateIsBooked || availableEventTimeSlots.length === 0}
            />

            <SelectField
              label="Number of Pax"
              value={form.pax}
              onChange={(value) => setField("pax", value)}
              options={paxOptions.map((item) => ({
                value: String(item),
                label:
                  packageBasePax && item > packageBasePax
                    ? `${item} pax (+${formatPeso((item - packageBasePax) * ADDITIONAL_PAX_RATE)})`
                    : `${item} pax`,
              }))}
              placeholder={
                form.basePax
                  ? `Select pax, max ${maxAllowedPax}`
                  : "Choose package capacity first"
              }
              error={errors.pax}
              disabled={!form.basePax || !form.selectedVariantId}
            />

            <Field
              label="Event Type"
              value={form.eventType}
              error={errors.eventType}
              placeholder="Type event type"
              onChange={(value) => setField("eventType", value.slice(0, 40))}
            />
          </div>

          {selectedVenue ? (
            <div className="mt-5 rounded-2xl border border-[#3f5b44]/20 bg-[#f7f7f4] p-5">
              <div className="grid gap-4 md:grid-cols-4">
                <InfoBox label="Food Included Pax" value={`${foodIncludedPax || 0} pax`} />
                <InfoBox label="Time Variation" value={selectedTimeVariationLabel || "8 Hours"} />
                <InfoBox label="Venue Maximum Capacity" value={venueCapacity ? `${venueCapacity} pax` : "Not set"} />
                <InfoBox label="Extra Food Rate" value={`${formatPeso(ADDITIONAL_PAX_RATE)} / pax`} />
                <InfoBox label="Max Bookable Pax" value={`${maxAllowedPax || 0} pax`} />
              </div>

              <div className="mt-4 rounded-xl bg-white p-4 text-sm font-semibold text-[#2f4d36]">
                <p>Base package food price: {formatPeso(baseAmount)} for {foodIncludedPax || 0} pax</p>
                <p>
                  Extra food pax charge: {chargeableFoodPax} × {formatPeso(foodChargePerExtraPax)} = {formatPeso(foodCharge)}
                </p>
                <p className="mt-2 text-lg font-extrabold">Total: {formatPeso(totalAmount)}</p>
              </div>
            </div>
          ) : null}

          {errors.totalAmount ? (
            <p className="mt-4 text-center text-sm font-semibold text-rose-700">
              {errors.totalAmount}
            </p>
          ) : null}
        </div>

        <Section title="Customize Package">
          <Field
            label="Event Theme"
            value={form.eventTheme}
            error={errors.eventTheme}
            placeholder="Type event theme"
            onChange={(value) => setField("eventTheme", value.slice(0, 60))}
          />

          <Field
            label="Food Allergy"
            value={form.foodAllergy}
            placeholder="Type food allergy"
            onChange={(value) => setField("foodAllergy", value.slice(0, 80))}
          />

          <div className="md:col-span-3">
            <label className="mb-2 block text-[13px] font-extrabold text-white">Special Request</label>

            <textarea
              value={form.specialRequest}
              onChange={(event) =>
                setField("specialRequest", event.target.value.slice(0, 300))
              }
              placeholder="Type special request"
              rows={4}
              className="w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.border, background: COLORS.fieldBg }}
            />
          </div>
        </Section>

        <div className="mt-10">
          <h2 className="font-['Montserrat',sans-serif] text-[25px] font-semibold text-white sm:text-[30px]">
            Food Menu Choices
          </h2>

          <p className="mt-2 text-sm font-semibold text-black/50">
            You can choose a maximum of {MAX_MENU_CHOICES_PER_CATEGORY} items per food category.
          </p>

          {errors.mainMenu ? (
            <p className="mt-2 text-sm font-semibold text-rose-700">
              {errors.mainMenu}
            </p>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <CheckboxGroup
              label="Soup"
              options={MENU_OPTIONS.soup}
              selectedValues={form.soup}
              onToggle={(value) => toggleCheckboxValue("soup", value)}
              error={errors.soup}
              maxChoices={MAX_MENU_CHOICES_PER_CATEGORY}
            />

            <CheckboxGroup
              label="Rice"
              options={MENU_OPTIONS.rice}
              selectedValues={form.rice}
              onToggle={(value) => toggleCheckboxValue("rice", value)}
              error={errors.rice}
              maxChoices={MAX_MENU_CHOICES_PER_CATEGORY}
            />

            <CheckboxGroup
              label="Pasta"
              options={MENU_OPTIONS.pasta}
              selectedValues={form.pasta}
              onToggle={(value) => toggleCheckboxValue("pasta", value)}
              error={errors.pasta}
              maxChoices={MAX_MENU_CHOICES_PER_CATEGORY}
            />

            <CheckboxGroup
              label="Chicken"
              options={MENU_OPTIONS.chicken}
              selectedValues={form.chicken}
              onToggle={(value) => toggleCheckboxValue("chicken", value)}
              error={errors.chicken}
              maxChoices={MAX_MENU_CHOICES_PER_CATEGORY}
            />

            <CheckboxGroup
              label="Pork"
              options={MENU_OPTIONS.pork}
              selectedValues={form.pork}
              onToggle={(value) => toggleCheckboxValue("pork", value)}
              error={errors.pork}
              maxChoices={MAX_MENU_CHOICES_PER_CATEGORY}
            />

            <CheckboxGroup
              label="Vegetable"
              options={MENU_OPTIONS.vegetable}
              selectedValues={form.vegetable}
              onToggle={(value) => toggleCheckboxValue("vegetable", value)}
              error={errors.vegetable}
              maxChoices={MAX_MENU_CHOICES_PER_CATEGORY}
            />

            <CheckboxGroup
              label="Dessert"
              options={MENU_OPTIONS.dessert}
              selectedValues={form.dessert}
              onToggle={(value) => toggleCheckboxValue("dessert", value)}
              error={errors.dessert}
              maxChoices={MAX_MENU_CHOICES_PER_CATEGORY}
            />

            <CheckboxGroup
              label="Drinks"
              options={MENU_OPTIONS.drinks}
              selectedValues={form.drinks}
              onToggle={(value) => toggleCheckboxValue("drinks", value)}
              error={errors.drinks}
              maxChoices={MAX_MENU_CHOICES_PER_CATEGORY}
            />
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            onClick={handleProceed}
            disabled={submitting || loadingProfile}
            className="h-8 w-full rounded-full bg-white px-12 font-['Montserrat',sans-serif] text-[10px] font-extrabold uppercase text-[#3f5b44] shadow-sm transition hover:bg-[#fffde9] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[220px]"
            type="button"
          >
            {submitting ? "PROCESSING..." : "PROCEED"}
          </button>

          <button
            onClick={() => navigate("/event-package")}
            disabled={submitting}
            className="h-8 w-full rounded-full bg-white px-12 font-['Montserrat',sans-serif] text-[10px] font-extrabold uppercase text-[#3f5b44] shadow-sm transition hover:bg-[#fffde9] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[220px]"
            type="button"
          >
            CANCEL
          </button>
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
    </div>
  );
}


function Section({ title, children }) {
  return (
    <section className="mt-9">
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
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
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
  disabledOptions = [],
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-extrabold text-white">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`h-9 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-white/70 disabled:opacity-70 ${
          value ? "text-[#3f5b44]" : "text-[#3f5b44]/45"
        }`}
      >
        <option value="">{placeholder}</option>

        {options.map((option, index) => {
          const optionValue = typeof option === "object" ? option.value : option;
          const optionLabel = typeof option === "object" ? option.label : option;

          return (
            <option
              key={`${optionValue}-${index}`}
              value={optionValue}
              disabled={disabledOptions.includes(optionValue)}
              className="text-[#3f5b44]"
            >
              {optionLabel}
            </option>
          );
        })}
      </select>

      {error ? (
        <p className="mt-1 text-xs font-semibold text-rose-100">{error}</p>
      ) : null}
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  selectedValues = [],
  onToggle,
  error,
  maxChoices = MAX_MENU_CHOICES_PER_CATEGORY,
}) {
  const safeSelectedValues = Array.isArray(selectedValues) ? selectedValues : [];
  const selectedCount = safeSelectedValues.length;
  const maxReached = selectedCount >= maxChoices;

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        error ? "border-rose-300" : "border-white/70"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-[#3f5b44]">{label}</p>

          <p className="mt-1 text-xs font-semibold text-[#3f5b44]/55">
            Choose up to {maxChoices} only.
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
            maxReached
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {selectedCount}/{maxChoices}
        </span>
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const checked = safeSelectedValues.includes(option);
          const disabled = !checked && maxReached;

          return (
            <label
              key={option}
              className={`flex items-start gap-2 text-sm font-semibold text-[#3f5b44] ${
                disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => onToggle(option)}
                className="mt-1 accent-[#3f5b44]"
              />

              <span>{option}</span>
            </label>
          );
        })}
      </div>

      {error ? <p className="mt-2 text-xs font-semibold text-rose-700">{error}</p> : null}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-black/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold text-[#2f4d36]">{value}</p>
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
  return (
    <p className="text-[10px] font-bold leading-4 text-[#2f523d]/85">
      {children}
    </p>
  );
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

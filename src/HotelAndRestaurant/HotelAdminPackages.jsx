import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelAdminShell from "./HotelAdminShell";

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

const API_BASE = getApiBase();

const PACKAGE_TYPES = [
  { value: "resort_venue", label: "Resort & Venue" },
  { value: "hotel_condo", label: "Hotel & Condo" },
  { value: "event_package", label: "Event Package" },
];

const EVENT_PACKAGE_PRESETS = [
  { title: "Wedding Package", subtitle: "Wedding celebration package" },
  { title: "Debut Package", subtitle: "Debut celebration package" },
  { title: "Birthday Theme Package", subtitle: "Birthday celebration package" },
  { title: "Corporate Package", subtitle: "Corporate event package" },
];

const DEFAULT_TIME_SLOTS_BY_LABEL = {
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

const EMPTY_FORM = {
  type: "resort_venue",
  title: "",
  subtitle: "",
  description: "",
  duration: "",
  price: "",
  capacity: "",
  availableVenues: [],
  inclusions: "",
  imageFile: null,
  imagePreview: "",
  removePackageImage: false,
  displayOrder: 0,
  variants: [],
};

function getAdminToken() {
  return (
    localStorage.getItem("hotelAdminToken") ||
    localStorage.getItem("adminToken") ||
    ""
  );
}

function formatPeso(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function sanitizePrice(value) {
  const clean = String(value || "").replace(/[^\d.]/g, "");
  const parts = clean.split(".");

  if (parts.length <= 1) return clean;

  return `${parts[0]}.${parts.slice(1).join("")}`;
}

function normalizeVenueName(value = "") {
  const text = String(value || "").trim().toUpperCase().replace(/\s+/g, " ");

  if (text.includes("LORENZO HALL")) return "LORENZO HALL";
  if (text.includes("LORENZO VERANDA")) return "LORENZO VERANDA";
  if (text.includes("LORENZO CABANAS") || text.includes("LORENZO CAVANAS")) {
    return "LORENZO CAVANAS";
  }
  if (text.includes("LORENZO CAMPSITE")) return "LORENZO CAMPSITE";

  return text;
}

function uniqueVenueNames(values = []) {
  const seen = new Set();
  const result = [];

  values.forEach((value) => {
    const normalized = normalizeVenueName(value);
    if (!normalized || seen.has(normalized)) return;

    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

function normalizeTimeLabel(value = "") {
  const text = String(value || "").toLowerCase();

  if (text.includes("8")) return "8 Hours";
  if (text.includes("12")) return "12 Hours";
  if (text.includes("22")) return "22 Hours";

  return String(value || "").trim();
}

function normalizeCapacityLabel(value = "") {
  const text = String(value || "").trim();
  const match = text.match(/(\d+)/);

  if (!match) return text;

  return `${Number(match[1])} Pax`;
}

function parsePaxFromLabel(value = "") {
  const match = String(value || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function getDefaultTimeSlots(label = "") {
  return DEFAULT_TIME_SLOTS_BY_LABEL[normalizeTimeLabel(label)] || [];
}

function inferTimeLabelFromSlots(slots = []) {
  const normalized = Array.isArray(slots)
    ? slots.map((slot) => String(slot || "").trim()).filter(Boolean)
    : [];

  for (const label of ["8 Hours", "12 Hours", "22 Hours"]) {
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

function isEventPackage(type) {
  return type === "event_package";
}

function isTimeBasedPackage(type) {
  return type === "resort_venue" || type === "hotel_condo";
}

function hasVariations(type) {
  return (
    type === "resort_venue" ||
    type === "hotel_condo" ||
    type === "event_package"
  );
}

function getTypeLabel(type) {
  return PACKAGE_TYPES.find((item) => item.value === type)?.label || type;
}

function makeEventLabel(pax, timeLabel) {
  const safePax = Number(pax || 0);
  const safeTimeLabel = normalizeTimeLabel(timeLabel || "8 Hours");

  return safePax ? `${safePax} Pax - ${safeTimeLabel}` : "";
}

function makeEventVariant({
  pax = "",
  timeVariationLabel = "8 Hours",
  price = "",
  displayOrder = 1,
  isActive = true,
} = {}) {
  const cleanPax = String(pax || "").replace(/[^0-9]/g, "");
  const cleanTime = normalizeTimeLabel(timeVariationLabel || "8 Hours");

  return {
    label: makeEventLabel(cleanPax, cleanTime),
    pax: cleanPax,
    timeVariationLabel: cleanTime,
    timeSlots: getDefaultTimeSlots(cleanTime),
    price,
    displayOrder,
    isActive,
  };
}

function makeDefaultVariants(type) {
  if (type === "hotel_condo") {
    return [
      { label: "8 Hours", price: "", displayOrder: 1, isActive: true },
      { label: "12 Hours", price: "", displayOrder: 2, isActive: true },
      { label: "22 Hours", price: "", displayOrder: 3, isActive: true },
    ];
  }

  if (type === "event_package") {
    return [
      makeEventVariant({
        pax: "50",
        timeVariationLabel: "8 Hours",
        price: "",
        displayOrder: 1,
      }),
      makeEventVariant({
        pax: "80",
        timeVariationLabel: "8 Hours",
        price: "",
        displayOrder: 2,
      }),
      makeEventVariant({
        pax: "100",
        timeVariationLabel: "8 Hours",
        price: "",
        displayOrder: 3,
      }),
    ];
  }

  return [{ label: "8 Hours", price: "", displayOrder: 1, isActive: true }];
}

function normalizeVariantForForm(variant = {}, index = 0, type = "resort_venue") {
  if (isEventPackage(type)) {
    const pax = Number(variant.pax || parsePaxFromLabel(variant.label) || 0);
    const timeSlots =
      Array.isArray(variant.timeSlots) && variant.timeSlots.length
        ? variant.timeSlots
        : getDefaultTimeSlots(
            variant.timeVariationLabel ||
              variant.duration ||
              variant.label ||
              "8 Hours"
          );

    const timeVariationLabel =
      variant.timeVariationLabel || inferTimeLabelFromSlots(timeSlots);

    return makeEventVariant({
      pax: pax ? String(pax) : "",
      timeVariationLabel,
      price: variant.price ?? "",
      displayOrder: Number(variant.displayOrder || index + 1),
      isActive: variant.isActive === false ? false : true,
    });
  }

  const label = normalizeTimeLabel(variant.label || "8 Hours");

  return {
    label,
    pax: "",
    timeVariationLabel: "",
    timeSlots: getDefaultTimeSlots(label),
    price: variant.price ?? "",
    displayOrder: Number(variant.displayOrder || index + 1),
    isActive: variant.isActive === false ? false : true,
  };
}

function normalizeVariantForPayload(variant = {}, index = 0, type = "resort_venue") {
  if (isEventPackage(type)) {
    const eventPax = Number(variant.pax || parsePaxFromLabel(variant.label) || 0);
    const timeVariationLabel = normalizeTimeLabel(
      variant.timeVariationLabel || inferTimeLabelFromSlots(variant.timeSlots) || "8 Hours"
    );

    const timeSlots =
      Array.isArray(variant.timeSlots) && variant.timeSlots.length
        ? variant.timeSlots
        : getDefaultTimeSlots(timeVariationLabel);

    const finalTimeLabel = inferTimeLabelFromSlots(timeSlots) || timeVariationLabel;
    const capacityLabel = normalizeCapacityLabel(
      eventPax ? `${eventPax} Pax` : variant.label
    );

    return {
      label: `${capacityLabel} - ${finalTimeLabel}`,
      pax: eventPax,
      price: Number(variant.price || 0),
      timeSlots,
      timeVariationLabel: finalTimeLabel,
      displayOrder: Number(variant.displayOrder || index + 1),
      isActive: variant.isActive === false ? false : true,
    };
  }

  const label = normalizeTimeLabel(variant.label || "8 Hours");

  return {
    label,
    pax: 0,
    price: Number(variant.price || 0),
    timeSlots: getDefaultTimeSlots(label),
    displayOrder: Number(variant.displayOrder || index + 1),
    isActive: variant.isActive === false ? false : true,
  };
}

function getPackageCounts(packages = []) {
  return packages.reduce(
    (acc, item) => {
      acc.all += 1;
      if (acc[item.type] !== undefined) acc[item.type] += 1;
      return acc;
    },
    {
      all: 0,
      resort_venue: 0,
      hotel_condo: 0,
      event_package: 0,
    }
  );
}

function sortVariants(variants = [], type = "") {
  return [...variants].sort((a, b) => {
    const orderA = Number(a.displayOrder || 0);
    const orderB = Number(b.displayOrder || 0);

    if (orderA !== orderB) return orderA - orderB;

    if (isEventPackage(type)) {
      const paxA = Number(a.pax || parsePaxFromLabel(a.label) || 0);
      const paxB = Number(b.pax || parsePaxFromLabel(b.label) || 0);

      if (paxA !== paxB) return paxA - paxB;

      return String(a.label || "").localeCompare(String(b.label || ""));
    }

    return String(a.label || "").localeCompare(String(b.label || ""));
  });
}

export default function HotelAdminPackages() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [activeType, setActiveType] = useState("all");
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    variants: makeDefaultVariants("resort_venue"),
  });

  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const token = getAdminToken();

  const adminHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const jsonHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const packageCounts = useMemo(() => getPackageCounts(packages), [packages]);

  const filteredPackages = useMemo(() => {
    const rows = activeType === "all"
      ? packages
      : packages.filter((item) => item.type === activeType);

    return [...rows].sort((a, b) => {
      const orderA = Number(a.displayOrder || 0);
      const orderB = Number(b.displayOrder || 0);

      if (orderA !== orderB) return orderA - orderB;

      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }, [packages, activeType]);

  const resortVenueOptions = useMemo(() => {
    return packages
      .filter((item) => item?.type === "resort_venue" && item?.isActive !== false)
      .sort((a, b) => {
        const orderA = Number(a.displayOrder || 0);
        const orderB = Number(b.displayOrder || 0);

        if (orderA !== orderB) return orderA - orderB;

        return String(a.title || "").localeCompare(String(b.title || ""));
      })
      .map((item) => item.title)
      .filter(Boolean);
  }, [packages]);

  const availableVenueOptions = useMemo(() => {
    return uniqueVenueNames([
      ...resortVenueOptions,
      ...(Array.isArray(form.availableVenues) ? form.availableVenues : []),
    ]);
  }, [resortVenueOptions, form.availableVenues]);

  const sortedFormVariants = useMemo(() => {
    return sortVariants(form.variants, form.type);
  }, [form.variants, form.type]);

  const goLogin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("hotelAdminToken");
    navigate("/hotel-admin-login", { replace: true });
  };

  const fetchPackages = async () => {
    if (!token) {
      goLogin();
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/admin/packages`, {
        headers: adminHeaders,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to load packages.");
      }

      setPackages(Array.isArray(data.packages) ? data.packages : []);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to load packages.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
      variants: makeDefaultVariants("resort_venue"),
    });

    setEditingId("");
    setShowForm(false);
  };

  const startCreate = (type = "resort_venue") => {
    setForm({
      ...EMPTY_FORM,
      type,
      variants: makeDefaultVariants(type),
    });

    setEditingId("");
    setShowForm(true);
    setStatus({ type: "", message: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEdit = (pkg) => {
    const type = pkg.type || "resort_venue";

    setEditingId(pkg._id);
    setForm({
      type,
      title: pkg.title || "",
      subtitle: pkg.subtitle || "",
      description: pkg.description || "",
      duration: pkg.duration || "",
      price: pkg.price ?? "",
      capacity: pkg.capacity || "",
      availableVenues: uniqueVenueNames(
        Array.isArray(pkg.availableVenues) ? pkg.availableVenues : []
      ),
      inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join("\n") : "",
      imageFile: null,
      imagePreview: pkg.imageUrl || "",
      removePackageImage: false,
      displayOrder: Number(pkg.displayOrder || 0),
      variants:
        Array.isArray(pkg.variants) && pkg.variants.length
          ? pkg.variants.map((variant, index) =>
              normalizeVariantForForm(variant, index, type)
            )
          : makeDefaultVariants(type),
    });

    setShowForm(true);
    setStatus({ type: "", message: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateForm = (field, value) => {
    setForm((prev) => {
      if (field === "type") {
        return {
          ...prev,
          type: value,
          variants: makeDefaultVariants(value),
          availableVenues: value === "event_package" ? prev.availableVenues || [] : [],
        };
      }

      return {
        ...prev,
        [field]: field === "price" ? sanitizePrice(value) : value,
      };
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setStatus({
        type: "error",
        message: "Only JPG, JPEG, PNG, and WEBP images are allowed.",
      });
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus({
        type: "error",
        message: "Package image must be 5MB or smaller.",
      });
      event.target.value = "";
      return;
    }

    setStatus({ type: "", message: "" });

    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
      removePackageImage: false,
    }));
  };

  const removeSelectedImage = () => {
    setForm((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: "",
      removePackageImage: true,
    }));
  };

  const updateVariant = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) => {
        if (i !== index) return variant;

        if (field === "price") {
          return {
            ...variant,
            price: sanitizePrice(value),
          };
        }

        if (field === "pax" && isEventPackage(prev.type)) {
          const cleanPax = String(value || "").replace(/[^0-9]/g, "");
          const timeLabel = normalizeTimeLabel(
            variant.timeVariationLabel ||
              inferTimeLabelFromSlots(variant.timeSlots) ||
              "8 Hours"
          );

          return {
            ...variant,
            pax: cleanPax,
            label: makeEventLabel(cleanPax, timeLabel),
          };
        }

        if (field === "timeVariationLabel" && isEventPackage(prev.type)) {
          const timeLabel = normalizeTimeLabel(value);
          const cleanPax = String(
            variant.pax || parsePaxFromLabel(variant.label) || ""
          ).replace(/[^0-9]/g, "");

          return {
            ...variant,
            timeVariationLabel: timeLabel,
            timeSlots: getDefaultTimeSlots(timeLabel),
            label: makeEventLabel(cleanPax, timeLabel),
          };
        }

        if (field === "label" && isTimeBasedPackage(prev.type)) {
          const label = normalizeTimeLabel(value);

          return {
            ...variant,
            label,
            timeSlots: getDefaultTimeSlots(label),
          };
        }

        return {
          ...variant,
          [field]: value,
        };
      }),
    }));
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        isEventPackage(prev.type)
          ? makeEventVariant({
              pax: "",
              timeVariationLabel: "8 Hours",
              price: "",
              displayOrder: prev.variants.length + 1,
            })
          : {
              label: "8 Hours",
              price: "",
              displayOrder: prev.variants.length + 1,
              isActive: true,
            },
      ],
    }));
  };

  const removeVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const quickHotelPreset = (roomType) => {
    if (roomType === "Nature Room") {
      setForm((prev) => ({
        ...prev,
        type: "hotel_condo",
        title: "Nature Room",
        subtitle: "Good for up to 5 pax",
        duration: "",
        price: "",
        capacity: "5 pax max",
        variants: [
          { label: "8 Hours", price: "700", displayOrder: 1, isActive: true },
          { label: "12 Hours", price: "1000", displayOrder: 2, isActive: true },
          { label: "22 Hours", price: "1500", displayOrder: 3, isActive: true },
        ],
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      type: "hotel_condo",
      title: "Simple Room",
      subtitle: "Good for up to 3 pax",
      duration: "",
      price: "",
      capacity: "3 pax max",
      variants: [
        { label: "8 Hours", price: "1500", displayOrder: 1, isActive: true },
        { label: "12 Hours", price: "2000", displayOrder: 2, isActive: true },
        { label: "22 Hours", price: "2500", displayOrder: 3, isActive: true },
      ],
    }));
  };

  const quickEventPreset = () => {
    setForm((prev) => ({
      ...prev,
      type: "event_package",
      capacity: "50 / 80 / 100 pax",
      availableVenues: Array.isArray(prev.availableVenues)
        ? prev.availableVenues
        : [],
      variants: [
        makeEventVariant({
          pax: "50",
          timeVariationLabel: "8 Hours",
          price: "60000",
          displayOrder: 1,
        }),
        makeEventVariant({
          pax: "80",
          timeVariationLabel: "8 Hours",
          price: "75000",
          displayOrder: 2,
        }),
        makeEventVariant({
          pax: "100",
          timeVariationLabel: "8 Hours",
          price: "85000",
          displayOrder: 3,
        }),
      ],
    }));
  };

  const applyEventPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      type: "event_package",
      title: preset.title,
      subtitle: preset.subtitle,
      capacity: prev.capacity || "50 / 80 / 100 pax",
      availableVenues: Array.isArray(prev.availableVenues)
        ? prev.availableVenues
        : [],
      variants:
        Array.isArray(prev.variants) && prev.variants.length
          ? prev.variants
          : makeDefaultVariants("event_package"),
    }));
  };

  const toggleAvailableVenue = (venue) => {
    const normalizedVenue = normalizeVenueName(venue);

    setForm((prev) => {
      const current = uniqueVenueNames(
        Array.isArray(prev.availableVenues) ? prev.availableVenues : []
      );

      return {
        ...prev,
        availableVenues: current.includes(normalizedVenue)
          ? current.filter((item) => item !== normalizedVenue)
          : [...current, normalizedVenue],
      };
    });
  };

  const selectAllVenues = () => {
    setForm((prev) => ({
      ...prev,
      availableVenues: uniqueVenueNames(availableVenueOptions),
    }));
  };

  const clearAllVenues = () => {
    setForm((prev) => ({
      ...prev,
      availableVenues: [],
    }));
  };

  const submitForm = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setStatus({ type: "error", message: "Package title is required." });
      return;
    }

    if (form.type === "event_package" && !form.availableVenues.length) {
      setStatus({
        type: "error",
        message:
          "Please select at least one available venue for this event package.",
      });
      return;
    }

    const variants = form.variants
      .map((variant, index) =>
        normalizeVariantForPayload(variant, index, form.type)
      )
      .filter((variant) => variant.label);

    if (hasVariations(form.type)) {
      if (!variants.length) {
        setStatus({
          type: "error",
          message: "At least one variation is required.",
        });
        return;
      }

      const invalidVariant = variants.find((variant) => {
        const invalidPrice =
          Number.isNaN(Number(variant.price)) || Number(variant.price) < 0;

        if (isEventPackage(form.type)) {
          return (
            !variant.label ||
            invalidPrice ||
            !Number(variant.pax || parsePaxFromLabel(variant.label)) ||
            !Array.isArray(variant.timeSlots) ||
            !variant.timeSlots.length
          );
        }

        return !variant.label || invalidPrice || !variant.timeSlots.length;
      });

      if (invalidVariant) {
        setStatus({
          type: "error",
          message: isEventPackage(form.type)
            ? "Each event rate must have pax, time variation, and a valid price."
            : "Each variation must use 8 Hours, 12 Hours, or 22 Hours with a valid price.",
        });
        return;
      }
    }

    setSaving(true);
    setStatus({ type: "", message: "" });

    const payload = {
      type: form.type,
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      duration:
        form.duration.trim() ||
        variants.map((variant) => variant.label).join(" / "),
      price:
        form.price !== ""
          ? Number(form.price || 0)
          : Number(variants[0]?.price || 0),
      capacity: form.capacity.trim(),
      availableVenues:
        form.type === "event_package" ? uniqueVenueNames(form.availableVenues) : [],
      inclusions: String(form.inclusions || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      displayOrder: Number(form.displayOrder || 0),
      variants,
      isActive: true,
    };

    const formData = new FormData();

    formData.append("type", payload.type);
    formData.append("title", payload.title);
    formData.append("subtitle", payload.subtitle);
    formData.append("description", payload.description);
    formData.append("duration", payload.duration);
    formData.append("price", String(payload.price));
    formData.append("capacity", payload.capacity);
    formData.append("availableVenues", JSON.stringify(payload.availableVenues));
    formData.append("inclusions", JSON.stringify(payload.inclusions));
    formData.append("displayOrder", String(payload.displayOrder));
    formData.append("variants", JSON.stringify(payload.variants));
    formData.append("isActive", "true");

    if (form.imageFile) {
      formData.append("packageImage", form.imageFile);
    }

    if (editingId && form.removePackageImage) {
      formData.append("removePackageImage", "true");
    }

    try {
      const url = editingId
        ? `${API_BASE}/admin/packages/${editingId}`
        : `${API_BASE}/admin/packages`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: adminHeaders,
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to save package.");
      }

      setStatus({
        type: "success",
        message: editingId
          ? "Package updated successfully."
          : "Package added successfully.",
      });

      resetForm();
      await fetchPackages();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to save package.",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (pkg) => {
    const nextStatus = !pkg.isActive;

    try {
      const res = await fetch(`${API_BASE}/admin/packages/${pkg._id}/status`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ isActive: nextStatus }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to update package status.");
      }

      setPackages((prev) =>
        prev.map((item) =>
          item._id === pkg._id ? { ...item, isActive: nextStatus } : item
        )
      );

      setStatus({
        type: "success",
        message: nextStatus
          ? "Package activated successfully."
          : "Package deactivated successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to update package status.",
      });
    }
  };

  const deletePackage = async (pkg) => {
    const confirmed = window.confirm(
      `Delete "${pkg.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/admin/packages/${pkg._id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete package.");
      }

      setPackages((prev) => prev.filter((item) => item._id !== pkg._id));
      setStatus({ type: "success", message: "Package deleted successfully." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to delete package.",
      });
    }
  };

  return (
    <HotelAdminShell
      title="Package Management"
      subtitle="Manage resort, hotel, condo, and event package rates in a cleaner layout."
      activePage="packages"
      maxWidth="max-w-7xl"
      actions={
        <button
          type="button"
          onClick={() =>
            startCreate(activeType === "all" ? "resort_venue" : activeType)
          }
          className="h-10 rounded-2xl bg-[#2A4F33] px-5 text-xs font-extrabold text-white shadow-sm hover:opacity-90"
        >
          ADD PACKAGE
        </button>
      }
    >
      {status.message ? (
        <div
          className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-bold ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-2">
        <TypeButton
          active={activeType === "all"}
          onClick={() => setActiveType("all")}
          label={`ALL (${packageCounts.all})`}
        />

        {PACKAGE_TYPES.map((type) => (
          <TypeButton
            key={type.value}
            active={activeType === type.value}
            onClick={() => setActiveType(type.value)}
            label={`${type.label} (${packageCounts[type.value] || 0})`}
          />
        ))}
      </div>

      {showForm ? (
        <form
          onSubmit={submitForm}
          className="mb-6 rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#355240]">
                {editingId ? "Edit Package" : "Add Package"}
              </h2>
              <p className="text-sm font-semibold text-black/45">
                {form.type === "event_package"
                  ? "Event packages are arranged by package details, available venues, and capacity rates."
                  : "Set your package details and time-based rates."}
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="w-fit rounded-full border border-black/10 px-4 py-2 text-xs font-extrabold text-black/50 hover:bg-black/5"
            >
              CANCEL
            </button>
          </div>

          <SectionCard
            title={
              form.type === "event_package"
                ? "1. Event Package Details"
                : "Package Details"
            }
            description={
              form.type === "event_package"
                ? "Choose the event type, title, basic description, and display order."
                : "Fill the general package information."
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <InputLabel>Type</InputLabel>
                <select
                  value={form.type}
                  onChange={(e) => updateForm("type", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                >
                  {PACKAGE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <InputLabel>Display Order</InputLabel>
                <input
                  type="number"
                  min="0"
                  value={form.displayOrder}
                  onChange={(e) => updateForm("displayOrder", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                />
              </label>

              {form.type === "event_package" ? (
                <div className="md:col-span-2">
                  <InputLabel>Quick Event Type</InputLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {EVENT_PACKAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.title}
                        type="button"
                        onClick={() => applyEventPreset(preset)}
                        className="rounded-full border border-[#355240]/20 bg-[#355240]/5 px-4 py-2 text-xs font-extrabold text-[#355240] hover:bg-[#355240]/10"
                      >
                        {preset.title}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <label className="block">
                <InputLabel>Title</InputLabel>
                <input
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder={
                    form.type === "event_package"
                      ? "Example: Wedding Package"
                      : form.type === "hotel_condo"
                      ? "Example: Nature Room"
                      : "Example: Lorenzo Cavanas"
                  }
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                />
              </label>

              <label className="block">
                <InputLabel>Subtitle</InputLabel>
                <input
                  value={form.subtitle}
                  onChange={(e) => updateForm("subtitle", e.target.value)}
                  placeholder="Short description"
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                />
              </label>

              <label className="block">
                <InputLabel>
                  {form.type === "event_package"
                    ? "Summary Duration"
                    : "Duration"}
                </InputLabel>
                <input
                  value={form.duration}
                  onChange={(e) => updateForm("duration", e.target.value)}
                  placeholder="Auto from variations"
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                />
              </label>

              <label className="block">
                <InputLabel>
                  {form.type === "event_package"
                    ? "Capacity Summary"
                    : "Capacity"}
                </InputLabel>
                <input
                  value={form.capacity}
                  onChange={(e) => updateForm("capacity", e.target.value)}
                  placeholder={
                    form.type === "event_package"
                      ? "Example: 50 / 80 / 100 pax"
                      : "Example: 70 pax"
                  }
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                />
              </label>

              <label className="block">
                <InputLabel>Default Price</InputLabel>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  placeholder="Auto from first rate"
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                />
              </label>

              <label className="block md:col-span-2">
                <InputLabel>Description</InputLabel>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={4}
                  placeholder={
                    form.type === "event_package"
                      ? "Describe the event package inclusions, setup, service, and package purpose..."
                      : "Write package details..."
                  }
                  className="mt-1 w-full resize-none rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                />
              </label>
            </div>
          </SectionCard>

          {form.type === "event_package" ? (
            <SectionCard
              title="2. Available Venues"
              description="Select the Resort & Venue locations where this event package can be booked."
            >
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selectAllVenues}
                  disabled={!availableVenueOptions.length}
                  className="rounded-full bg-[#355240] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50"
                >
                  SELECT ALL VENUES
                </button>

                <button
                  type="button"
                  onClick={clearAllVenues}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-extrabold text-black/55 hover:bg-black/5"
                >
                  CLEAR
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableVenueOptions.map((venue) => {
                  const checked = uniqueVenueNames(
                    form.availableVenues || []
                  ).includes(venue);

                  return (
                    <label
                      key={venue}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                        checked
                          ? "border-[#355240] bg-[#355240] text-white"
                          : "border-black/10 bg-white text-[#355240] hover:border-[#355240]/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAvailableVenue(venue)}
                        className="h-4 w-4"
                      />
                      <span>{venue}</span>
                    </label>
                  );
                })}
              </div>

              {!availableVenueOptions.length ? (
                <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
                  No active Resort & Venue packages found. Add a Resort & Venue
                  package first, then return here.
                </p>
              ) : !form.availableVenues.length ? (
                <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
                  Select at least one venue for this event package.
                </p>
              ) : (
                <p className="mt-3 text-xs font-bold text-[#355240]/70">
                  Selected venues: {uniqueVenueNames(form.availableVenues).join(", ")}
                </p>
              )}
            </SectionCard>
          ) : null}

          {form.type === "hotel_condo" ? (
            <PresetBox
              title="Quick Hotel Room Preset"
              description="Quickly fill Nature Room or Simple Room prices."
              buttons={[
                {
                  label: "NATURE ROOM",
                  onClick: () => quickHotelPreset("Nature Room"),
                },
                {
                  label: "SIMPLE ROOM",
                  onClick: () => quickHotelPreset("Simple Room"),
                },
              ]}
            />
          ) : null}

          {form.type === "event_package" ? (
            <SectionCard
              title="3. Capacity / Time / Price Rates"
              description="Each row is one selectable rate in the customer Event Booking form. Keep it simple: Pax + Time + Price."
              action={
                <button
                  type="button"
                  onClick={quickEventPreset}
                  className="rounded-full bg-[#355240] px-5 py-2 text-xs font-extrabold text-white"
                >
                  USE 50 / 80 / 100 PAX PRESET
                </button>
              }
            >
              <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                <div className="grid grid-cols-12 gap-3 border-b border-black/10 bg-[#355240] px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-white">
                  <div className="col-span-12 sm:col-span-2">Pax</div>
                  <div className="col-span-12 sm:col-span-3">Time Variation</div>
                  <div className="col-span-12 sm:col-span-2">Price</div>
                  <div className="col-span-12 sm:col-span-2">Order</div>
                  <div className="col-span-12 sm:col-span-1">Active</div>
                  <div className="col-span-12 sm:col-span-2 text-right">Action</div>
                </div>

                <div className="divide-y divide-black/10">
                  {form.variants.map((variant, index) => {
                    const pax = variant.pax || parsePaxFromLabel(variant.label) || "";
                    const timeLabel =
                      variant.timeVariationLabel ||
                      inferTimeLabelFromSlots(variant.timeSlots) ||
                      "8 Hours";
                    const timeSlots =
                      variant.timeSlots?.length
                        ? variant.timeSlots
                        : getDefaultTimeSlots(timeLabel);

                    return (
                      <div key={`${index}-${variant.label}`} className="p-4">
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-12 sm:col-span-2">
                            <InputLabel>Pax</InputLabel>
                            <input
                              type="number"
                              min="1"
                              value={pax}
                              onChange={(e) =>
                                updateVariant(index, "pax", e.target.value)
                              }
                              placeholder="50"
                              className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                            />
                          </div>

                          <div className="col-span-12 sm:col-span-3">
                            <InputLabel>Time</InputLabel>
                            <select
                              value={timeLabel}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "timeVariationLabel",
                                  e.target.value
                                )
                              }
                              className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                            >
                              <option value="8 Hours">8 Hours</option>
                              <option value="12 Hours">12 Hours</option>
                              <option value="22 Hours">22 Hours</option>
                            </select>
                          </div>

                          <div className="col-span-12 sm:col-span-2">
                            <InputLabel>Price</InputLabel>
                            <input
                              type="number"
                              min="0"
                              value={variant.price}
                              onChange={(e) =>
                                updateVariant(index, "price", e.target.value)
                              }
                              placeholder="85000"
                              className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                            />
                          </div>

                          <div className="col-span-12 sm:col-span-2">
                            <InputLabel>Order</InputLabel>
                            <input
                              type="number"
                              min="0"
                              value={variant.displayOrder}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "displayOrder",
                                  e.target.value
                                )
                              }
                              className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                            />
                          </div>

                          <div className="col-span-6 flex items-end sm:col-span-1">
                            <label className="flex h-[46px] items-center gap-2 text-xs font-bold text-black/60">
                              <input
                                type="checkbox"
                                checked={variant.isActive}
                                onChange={(e) =>
                                  updateVariant(
                                    index,
                                    "isActive",
                                    e.target.checked
                                  )
                                }
                              />
                              Yes
                            </label>
                          </div>

                          <div className="col-span-6 flex items-end justify-end sm:col-span-2">
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="h-[46px] rounded-2xl bg-rose-100 px-4 text-xs font-extrabold text-rose-700 hover:bg-rose-200"
                            >
                              REMOVE
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 rounded-2xl border border-[#355240]/10 bg-[#f6f6f1] p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-extrabold text-[#355240]">
                                {makeEventLabel(pax, timeLabel) || "Incomplete Rate"}
                              </p>
                              <p className="text-xs font-semibold text-black/50">
                                Shows in booking form as:{" "}
                                <span className="font-extrabold">
                                  {makeEventLabel(pax, timeLabel) || "Set pax first"}
                                </span>
                              </p>
                            </div>

                            <p className="text-lg font-extrabold text-[#355240]">
                              {formatPeso(variant.price)}
                            </p>
                          </div>

                          <details className="mt-3">
                            <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-wide text-black/45">
                              View automatic time slots ({timeSlots.length})
                            </summary>

                            <div className="mt-3 grid gap-2 md:grid-cols-2">
                              {timeSlots.map((slot) => (
                                <div
                                  key={slot}
                                  className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-black/60"
                                >
                                  {slot}
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="mt-4 rounded-full bg-[#355240] px-5 py-2 text-xs font-extrabold text-white"
              >
                ADD ANOTHER RATE
              </button>
            </SectionCard>
          ) : hasVariations(form.type) ? (
            <SectionCard
              title="Time Variations"
              description="Set duration and price. Time slots are generated automatically."
              action={
                <button
                  type="button"
                  onClick={addVariant}
                  className="rounded-full bg-[#355240] px-5 py-2 text-xs font-extrabold text-white"
                >
                  ADD VARIATION
                </button>
              }
            >
              <div className="grid gap-4">
                {form.variants.map((variant, index) => (
                  <div
                    key={`${index}-${variant.label}`}
                    className="rounded-3xl border border-black/10 bg-white p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-extrabold text-[#355240]">
                        Variation #{index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="rounded-full bg-rose-100 px-4 py-2 text-xs font-extrabold text-rose-700"
                      >
                        REMOVE
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <label className="block">
                        <InputLabel>Duration</InputLabel>
                        <select
                          value={variant.label}
                          onChange={(e) =>
                            updateVariant(index, "label", e.target.value)
                          }
                          className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                        >
                          <option value="8 Hours">8 Hours</option>
                          <option value="12 Hours">12 Hours</option>
                          <option value="22 Hours">22 Hours</option>
                        </select>
                      </label>

                      <label className="block">
                        <InputLabel>Price</InputLabel>
                        <input
                          type="number"
                          min="0"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(index, "price", e.target.value)
                          }
                          placeholder="15000"
                          className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                        />
                      </label>

                      <label className="block">
                        <InputLabel>Display Order</InputLabel>
                        <input
                          type="number"
                          min="0"
                          value={variant.displayOrder}
                          onChange={(e) =>
                            updateVariant(index, "displayOrder", e.target.value)
                          }
                          className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                        />
                      </label>

                      <label className="flex items-center gap-2 pt-7">
                        <input
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(e) =>
                            updateVariant(index, "isActive", e.target.checked)
                          }
                        />
                        <span className="text-sm font-bold text-black/60">
                          Active
                        </span>
                      </label>
                    </div>

                    <details className="mt-4 rounded-2xl border border-[#355240]/15 bg-[#f6f6f1] p-4">
                      <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-wide text-black/45">
                        View automatic time slots
                      </summary>

                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {getDefaultTimeSlots(variant.label).map((slot) => (
                          <div
                            key={slot}
                            className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-black/60"
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard
            title={form.type === "event_package" ? "4. Package Image" : "Package Image"}
            description="Upload one image for this package."
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="h-40 w-full overflow-hidden rounded-2xl border border-black/10 bg-white md:w-64">
                {form.imagePreview ? (
                  <img
                    src={form.imagePreview}
                    alt="Package preview"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-extrabold uppercase tracking-wide text-black/35">
                    No image selected
                  </div>
                )}
              </div>

              <div className="flex-1">
                <InputLabel>Package Image Upload</InputLabel>

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-bold outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[#355240] file:px-4 file:py-2 file:text-xs file:font-extrabold file:text-white focus:border-[#355240]"
                />

                <p className="mt-2 text-xs font-semibold text-black/45">
                  Upload JPG, PNG, or WEBP only. Maximum file size: 5MB.
                </p>

                {form.imagePreview ? (
                  <button
                    type="button"
                    onClick={removeSelectedImage}
                    className="mt-3 rounded-full bg-rose-100 px-4 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-200"
                  >
                    REMOVE IMAGE
                  </button>
                ) : null}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title={form.type === "event_package" ? "5. Inclusions" : "Inclusions"}
            description="Put one inclusion per line."
          >
            <textarea
              value={form.inclusions}
              onChange={(e) => updateForm("inclusions", e.target.value)}
              rows={5}
              placeholder={
                form.type === "event_package"
                  ? "Event coordination\nBasic sound system\nTables and chairs\nFood package inclusions"
                  : "One inclusion per line\nTables and chairs\nEvent coordination"
              }
              className="w-full resize-none rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
            />
          </SectionCard>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-full border border-black/10 bg-white px-7 py-3 text-xs font-extrabold text-black/55 hover:bg-black/5 disabled:opacity-50"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#355240] px-7 py-3 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "SAVING..." : editingId ? "SAVE CHANGES" : "ADD PACKAGE"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="rounded-3xl border border-black/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-black/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#355240]">
              Package List
            </h2>
            <p className="text-sm font-semibold text-black/45">
              {filteredPackages.length} item(s)
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              startCreate(activeType === "all" ? "resort_venue" : activeType)
            }
            className="w-fit rounded-full bg-[#355240] px-5 py-2 text-xs font-extrabold text-white hover:opacity-90"
          >
            ADD PACKAGE
          </button>
        </div>

        {loading ? (
          <div className="p-5 text-sm font-bold text-black/50">
            Loading packages...
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-2xl font-extrabold text-[#355240]">
              No packages yet
            </h3>
            <p className="mt-2 text-sm font-semibold text-black/45">
              Add your first package.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-5 lg:grid-cols-2">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                onEdit={() => startEdit(pkg)}
                onToggleStatus={() => toggleStatus(pkg)}
                onDelete={() => deletePackage(pkg)}
              />
            ))}
          </div>
        )}
      </div>
    </HotelAdminShell>
  );
}

function TypeButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-xs font-extrabold ${
        active
          ? "bg-[#355240] text-white"
          : "border border-black/10 bg-white text-[#355240]"
      }`}
    >
      {label}
    </button>
  );
}

function InputLabel({ children }) {
  return (
    <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
      {children}
    </span>
  );
}

function SectionCard({ title, description, action, children }) {
  return (
    <div className="mt-5 rounded-3xl border border-[#355240]/15 bg-[#355240]/5 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-[#355240]">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm font-semibold text-black/50">
              {description}
            </p>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {children}
    </div>
  );
}

function PresetBox({ title, description, buttons }) {
  return (
    <div className="mt-5 rounded-2xl border border-[#355240]/15 bg-[#355240]/5 p-4">
      <p className="text-sm font-extrabold text-[#355240]">{title}</p>
      <p className="mt-1 text-sm font-semibold text-black/50">{description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {buttons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={button.onClick}
            className="rounded-full bg-[#355240] px-5 py-2 text-xs font-extrabold text-white"
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PackageCard({ pkg, onEdit, onToggleStatus, onDelete }) {
  const variants = Array.isArray(pkg.variants)
    ? sortVariants(pkg.variants, pkg.type)
    : [];

  return (
    <div
      className={`rounded-3xl border p-5 ${
        pkg.isActive
          ? "border-black/10 bg-[#fafaf7]"
          : "border-rose-100 bg-rose-50/50"
      }`}
    >
      {pkg.imageUrl ? (
        <div className="mb-4 h-44 overflow-hidden rounded-2xl border border-black/10 bg-white">
          <img
            src={pkg.imageUrl}
            alt={pkg.title || "Package"}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#355240]/10 px-3 py-1 text-[11px] font-extrabold text-[#355240]">
          {getTypeLabel(pkg.type)}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
            pkg.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {pkg.isActive ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>

      <h3 className="mt-3 text-xl font-extrabold text-[#355240]">
        {pkg.title}
      </h3>

      {pkg.subtitle ? (
        <p className="mt-1 text-sm font-bold text-black/50">{pkg.subtitle}</p>
      ) : null}

      {pkg.type === "event_package" ? (
        <EventPackageSummary pkg={pkg} variants={variants} />
      ) : variants.length ? (
        <TimePackageSummary variants={variants} />
      ) : (
        <p className="mt-4 text-2xl font-extrabold text-[#355240]">
          {formatPeso(pkg.price)}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-extrabold text-black/50">
        {pkg.duration ? (
          <span className="rounded-full bg-white px-3 py-1">
            {pkg.duration}
          </span>
        ) : null}

        {pkg.capacity ? (
          <span className="rounded-full bg-white px-3 py-1">
            {pkg.capacity}
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-[#355240]/20 bg-white px-4 py-2 text-xs font-extrabold text-[#355240] hover:bg-[#355240]/5"
        >
          EDIT
        </button>

        <button
          type="button"
          onClick={onToggleStatus}
          className={`rounded-full px-4 py-2 text-xs font-extrabold ${
            pkg.isActive
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          }`}
        >
          {pkg.isActive ? "DEACTIVATE" : "ACTIVATE"}
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-full bg-rose-100 px-4 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-200"
        >
          DELETE
        </button>
      </div>
    </div>
  );
}

function EventPackageSummary({ pkg, variants }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl border border-[#355240]/15 bg-white p-4">
        <p className="text-xs font-extrabold uppercase tracking-wide text-black/45">
          Capacity Rates
        </p>

        <div className="mt-3 overflow-hidden rounded-2xl border border-black/10">
          <div className="grid grid-cols-4 bg-[#355240] px-3 py-2 text-[11px] font-extrabold uppercase tracking-wide text-white">
            <div>Pax</div>
            <div>Time</div>
            <div>Price</div>
            <div>Status</div>
          </div>

          {variants.length ? (
            variants.map((variant) => {
              const pax = Number(variant.pax || parsePaxFromLabel(variant.label));
              const timeLabel =
                variant.timeVariationLabel ||
                inferTimeLabelFromSlots(variant.timeSlots);

              return (
                <div
                  key={variant._id || variant.label}
                  className={`grid grid-cols-4 border-t border-black/10 px-3 py-2 text-xs font-bold ${
                    variant.isActive === false ? "opacity-50" : ""
                  }`}
                >
                  <div className="text-[#355240]">{pax || "—"} Pax</div>
                  <div className="text-black/60">{timeLabel}</div>
                  <div className="text-[#355240]">{formatPeso(variant.price)}</div>
                  <div
                    className={
                      variant.isActive === false
                        ? "text-rose-700"
                        : "text-emerald-700"
                    }
                  >
                    {variant.isActive === false ? "Inactive" : "Active"}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-3 py-3 text-xs font-bold text-black/50">
              No capacity rates configured.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#355240]/15 bg-white p-4">
        <p className="text-xs font-extrabold uppercase tracking-wide text-black/45">
          Available Venues
        </p>

        {Array.isArray(pkg.availableVenues) && pkg.availableVenues.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {pkg.availableVenues.map((venue) => (
              <span
                key={venue}
                className="rounded-full bg-[#355240]/10 px-3 py-1 text-xs font-extrabold text-[#355240]"
              >
                {venue}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs font-bold text-rose-700">
            No venues selected.
          </p>
        )}
      </div>
    </div>
  );
}

function TimePackageSummary({ variants }) {
  return (
    <div className="mt-4 grid gap-2">
      {variants.map((variant) => (
        <div
          key={variant._id || variant.label}
          className={`rounded-2xl border border-[#355240]/15 bg-white p-4 ${
            variant.isActive === false ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-extrabold text-[#355240]">
              {variant.label}
            </p>

            <p className="text-lg font-extrabold text-[#355240]">
              {formatPeso(variant.price)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
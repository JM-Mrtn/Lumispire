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

function normalizeVenueName(value = "") {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
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
  return String(value || "").replace(/[^\d.]/g, "");
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

function getTypeLabel(type) {
  return PACKAGE_TYPES.find((item) => item.value === type)?.label || type;
}

function isEventPackage(type) {
  return type === "event_package";
}

function isTimeBasedPackage(type) {
  return type === "resort_venue" || type === "hotel_condo";
}

function hasVariations(type) {
  return type === "resort_venue" || type === "hotel_condo" || type === "event_package";
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
      { label: "50 Pax - 8 Hours", pax: "50", timeVariationLabel: "8 Hours", timeSlots: getDefaultTimeSlots("8 Hours"), price: "", displayOrder: 1, isActive: true },
      { label: "80 Pax - 8 Hours", pax: "80", timeVariationLabel: "8 Hours", timeSlots: getDefaultTimeSlots("8 Hours"), price: "", displayOrder: 2, isActive: true },
      { label: "100 Pax - 8 Hours", pax: "100", timeVariationLabel: "8 Hours", timeSlots: getDefaultTimeSlots("8 Hours"), price: "", displayOrder: 3, isActive: true },
    ];
  }

  return [{ label: "8 Hours", price: "", displayOrder: 1, isActive: true }];
}

function normalizeVariantForForm(variant = {}, index = 0, type = "resort_venue") {
  const pax = isEventPackage(type)
    ? Number(variant.pax || parsePaxFromLabel(variant.label) || 0)
    : 0;

  const timeSlots = Array.isArray(variant.timeSlots) && variant.timeSlots.length
    ? variant.timeSlots
    : getDefaultTimeSlots(variant.timeVariationLabel || variant.duration || variant.label || "8 Hours");

  const timeVariationLabel = isEventPackage(type)
    ? inferTimeLabelFromSlots(timeSlots)
    : normalizeTimeLabel(variant.label);

  return {
    label: isEventPackage(type)
      ? `${normalizeCapacityLabel(pax ? `${pax} Pax` : variant.label)} - ${timeVariationLabel}`
      : normalizeTimeLabel(variant.label),
    pax: isEventPackage(type) ? String(pax || "") : "",
    timeVariationLabel: isEventPackage(type) ? timeVariationLabel : "",
    timeSlots: isEventPackage(type) ? timeSlots : getDefaultTimeSlots(variant.label),
    price: variant.price ?? "",
    displayOrder: Number(variant.displayOrder || index + 1),
    isActive: variant.isActive === false ? false : true,
  };
}

function normalizeVariantForPayload(variant = {}, index = 0, type = "resort_venue") {
  const eventPax = isEventPackage(type)
    ? Number(variant.pax || parsePaxFromLabel(variant.label) || 0)
    : 0;

  if (isEventPackage(type)) {
    const timeVariationLabel = normalizeTimeLabel(variant.timeVariationLabel || "8 Hours");
    const timeSlots = Array.isArray(variant.timeSlots) && variant.timeSlots.length
      ? variant.timeSlots
      : getDefaultTimeSlots(timeVariationLabel);
    const finalTimeLabel = inferTimeLabelFromSlots(timeSlots) || timeVariationLabel;
    const capacityLabel = normalizeCapacityLabel(eventPax ? `${eventPax} Pax` : variant.label);

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

  const label = normalizeTimeLabel(variant.label);

  return {
    label,
    pax: 0,
    price: Number(variant.price || 0),
    timeSlots: getDefaultTimeSlots(label),
    displayOrder: Number(variant.displayOrder || index + 1),
    isActive: variant.isActive === false ? false : true,
  };
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

  const filteredPackages = useMemo(() => {
    if (activeType === "all") return packages;
    return packages.filter((item) => item.type === activeType);
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
      availableVenues: uniqueVenueNames(Array.isArray(pkg.availableVenues) ? pkg.availableVenues : []),
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

    if (!file) {
      return;
    }

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

        let nextValue = value;

        if (field === "price") nextValue = sanitizePrice(value);
        if (field === "pax") nextValue = String(value || "").replace(/[^0-9]/g, "");
        if (field === "label" && isTimeBasedPackage(prev.type)) {
          nextValue = normalizeTimeLabel(value);
        }

        if (field === "pax" && isEventPackage(prev.type)) {
          return {
            ...variant,
            pax: nextValue,
            label: nextValue ? `${Number(nextValue)} Pax` : "",
          };
        }

        return {
          ...variant,
          [field]: nextValue,
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
          ? {
              label: "",
              pax: "",
              price: "",
              displayOrder: prev.variants.length + 1,
              isActive: true,
            }
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
      availableVenues: Array.isArray(prev.availableVenues) ? prev.availableVenues : [],
      variants: [
        { label: "50 Pax - 8 Hours", pax: "50", timeVariationLabel: "8 Hours", timeSlots: getDefaultTimeSlots("8 Hours"), price: "60000", displayOrder: 1, isActive: true },
        { label: "80 Pax - 8 Hours", pax: "80", timeVariationLabel: "8 Hours", timeSlots: getDefaultTimeSlots("8 Hours"), price: "75000", displayOrder: 2, isActive: true },
        { label: "100 Pax - 8 Hours", pax: "100", timeVariationLabel: "8 Hours", timeSlots: getDefaultTimeSlots("8 Hours"), price: "85000", displayOrder: 3, isActive: true },
      ],
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

  const submitForm = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setStatus({ type: "error", message: "Package title is required." });
      return;
    }

    if (form.type === "event_package" && !form.availableVenues.length) {
      setStatus({
        type: "error",
        message: "Please select at least one available venue for this event package.",
      });
      return;
    }

    const variants = form.variants
      .map((variant, index) => normalizeVariantForPayload(variant, index, form.type))
      .filter((variant) => variant.label);

    if (hasVariations(form.type)) {
      if (!variants.length) {
        setStatus({ type: "error", message: "At least one variation is required." });
        return;
      }

      const invalidVariant = variants.find((variant) => {
        const invalidPrice =
          Number.isNaN(Number(variant.price)) || Number(variant.price) < 0;

        if (isEventPackage(form.type)) {
          return !variant.label || invalidPrice || !parsePaxFromLabel(variant.label) || !variant.timeSlots.length;
        }

        return !variant.label || invalidPrice || !variant.timeSlots.length;
      });

      if (invalidVariant) {
        setStatus({
          type: "error",
          message: isEventPackage(form.type)
            ? "Each event variation must have pax, time variation, and a valid price."
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
      availableVenues: form.type === "event_package" ? uniqueVenueNames(form.availableVenues) : [],
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
        message: editingId ? "Package updated successfully." : "Package added successfully.",
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
        message: nextStatus ? "Package activated successfully." : "Package deactivated successfully.",
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
      subtitle="Manage resort, hotel, condo, and event package variations using one consistent admin layout."
      activePage="packages"
      maxWidth="max-w-7xl"
      actions={
        <button
          type="button"
          onClick={() => startCreate(activeType === "all" ? "resort_venue" : activeType)}
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
          <button
            type="button"
            onClick={() => setActiveType("all")}
            className={`rounded-full px-5 py-2 text-xs font-extrabold ${
              activeType === "all"
                ? "bg-[#355240] text-white"
                : "border border-black/10 bg-white text-[#355240]"
            }`}
          >
            ALL
          </button>

          {PACKAGE_TYPES.map((type) => (
            <button
              type="button"
              key={type.value}
              onClick={() => setActiveType(type.value)}
              className={`rounded-full px-5 py-2 text-xs font-extrabold ${
                activeType === type.value
                  ? "bg-[#355240] text-white"
                  : "border border-black/10 bg-white text-[#355240]"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {showForm ? (
          <form
            onSubmit={submitForm}
            className="mb-6 rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-[#355240]">
                  {editingId ? "Edit Package" : "Add Package"}
                </h2>
                <p className="text-sm font-semibold text-black/45">
                  Event Package variations are pax + time based.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-black/10 px-4 py-2 text-xs font-extrabold text-black/50 hover:bg-black/5"
              >
                CANCEL
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                  Type
                </span>
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
                <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                  Default Price
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  placeholder="Auto from first variation"
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                  Title
                </span>
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
                <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                  Subtitle
                </span>
                <input
                  value={form.subtitle}
                  onChange={(e) => updateForm("subtitle", e.target.value)}
                  placeholder="Short description"
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                  Duration
                </span>
                <input
                  value={form.duration}
                  onChange={(e) => updateForm("duration", e.target.value)}
                  placeholder="Auto from variations"
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                  Capacity
                </span>
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

              {form.type === "event_package" ? (
                <div className="md:col-span-2 rounded-3xl border border-[#355240]/15 bg-[#355240]/5 p-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#355240]">
                    Available Venues
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-black/50">
                    Select where this event package can be booked. This list comes from your active Resort & Venue packages, so new resort venues you add will appear here automatically.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {availableVenueOptions.map((venue) => (
                      <label
                        key={venue}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-bold text-[#355240]"
                      >
                        <input
                          type="checkbox"
                          checked={uniqueVenueNames(form.availableVenues || []).includes(venue)}
                          onChange={() => toggleAvailableVenue(venue)}
                        />
                        <span>{venue}</span>
                      </label>
                    ))}
                  </div>

                  {!availableVenueOptions.length ? (
                    <p className="mt-3 text-xs font-bold text-rose-700">
                      No active Resort & Venue packages found. Add a Resort & Venue package first, then return here.
                    </p>
                  ) : !form.availableVenues.length ? (
                    <p className="mt-3 text-xs font-bold text-rose-700">
                      Select at least one venue for this event package.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {form.type === "hotel_condo" ? (
                <PresetBox
                  title="Quick Hotel Room Preset"
                  description="Quickly fill Nature Room or Simple Room prices."
                  buttons={[
                    { label: "NATURE ROOM", onClick: () => quickHotelPreset("Nature Room") },
                    { label: "SIMPLE ROOM", onClick: () => quickHotelPreset("Simple Room") },
                  ]}
                />
              ) : null}

              {form.type === "event_package" ? (
                <PresetBox
                  title="Quick Event Capacity Preset"
                  description="Adds 50 Pax, 80 Pax, and 100 Pax price variations with default 8-hour time slots."
                  buttons={[{ label: "50 / 80 / 100 PAX", onClick: quickEventPreset }]}
                />
              ) : null}

              <div className="md:col-span-2 rounded-3xl border border-[#355240]/15 bg-[#355240]/5 p-4">
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
                    <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                      Package Image Upload
                    </span>

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
              </div>

              <label className="block md:col-span-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                  Description
                </span>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={4}
                  placeholder="Write package details..."
                  className="mt-1 w-full resize-none rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                  Inclusions
                </span>
                <textarea
                  value={form.inclusions}
                  onChange={(e) => updateForm("inclusions", e.target.value)}
                  rows={4}
                  placeholder={"One inclusion per line\nTables and chairs\nEvent coordination"}
                  className="mt-1 w-full resize-none rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                />
              </label>
            </div>

            {hasVariations(form.type) ? (
              <div className="mt-6 rounded-3xl border border-[#355240]/15 bg-[#355240]/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#355240]">
                      {form.type === "event_package"
                        ? "Event Pax + Time Variations"
                        : "Time Variations"}
                    </h3>
                    <p className="text-sm font-semibold text-black/50">
                      {form.type === "event_package"
                        ? "The price changes depending on selected pax and time variation."
                        : "Time slots are automatic based on duration."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addVariant}
                    className="w-fit rounded-full bg-[#355240] px-5 py-2 text-xs font-extrabold text-white"
                  >
                    ADD VARIATION
                  </button>
                </div>

                <div className="mt-4 grid gap-4">
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

                      <div className="grid gap-4 md:grid-cols-3">
                        <label className="block">
                          <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                            {form.type === "event_package" ? "Pax Included in Package" : "Duration"}
                          </span>

                          {form.type === "event_package" ? (
                            <input
                              type="number"
                              min="1"
                              value={variant.pax || parsePaxFromLabel(variant.label) || ""}
                              onChange={(e) => updateVariant(index, "pax", e.target.value)}
                              placeholder="Example: 50"
                              className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                            />
                          ) : (
                            <select
                              value={variant.label}
                              onChange={(e) => updateVariant(index, "label", e.target.value)}
                              className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                            >
                              <option value="8 Hours">8 Hours</option>
                              <option value="12 Hours">12 Hours</option>
                              <option value="22 Hours">22 Hours</option>
                            </select>
                          )}
                        </label>

                        {form.type === "event_package" ? (
                          <label className="block">
                            <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                              Time Variation
                            </span>
                            <select
                              value={variant.timeVariationLabel || inferTimeLabelFromSlots(variant.timeSlots) || "8 Hours"}
                              onChange={(e) => updateVariant(index, "timeVariationLabel", e.target.value)}
                              className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                            >
                              <option value="8 Hours">8 Hours</option>
                              <option value="12 Hours">12 Hours</option>
                              <option value="22 Hours">22 Hours</option>
                            </select>
                          </label>
                        ) : null}

                        <label className="block">
                          <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                            Price
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, "price", e.target.value)}
                            placeholder="60000"
                            className="mt-1 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm font-bold outline-none focus:border-[#355240]"
                          />
                        </label>

                        <label className="block">
                          <span className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                            Display Order
                          </span>
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

                        <label className="flex items-center gap-2 md:col-span-3">
                          <input
                            type="checkbox"
                            checked={variant.isActive}
                            onChange={(e) =>
                              updateVariant(index, "isActive", e.target.checked)
                            }
                          />
                          <span className="text-sm font-bold text-black/60">
                            Variation active
                          </span>
                        </label>

                        <div className="md:col-span-3 rounded-2xl border border-[#355240]/15 bg-[#f6f6f1] p-4">
                          {form.type === "event_package" ? (
                            <>
                              <p className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                                Automatic Event Time Slots
                              </p>
                              <p className="mt-1 text-sm font-semibold text-black/55">
                                This pax value and time variation appear in the Event Booking form. The selected variation price includes food for this pax count. Extra pax are charged separately per head.
                              </p>
                              <div className="mt-3 grid gap-2 md:grid-cols-2">
                                {(variant.timeSlots?.length
                                  ? variant.timeSlots
                                  : getDefaultTimeSlots(variant.timeVariationLabel || "8 Hours")
                                ).map((slot) => (
                                  <div
                                    key={slot}
                                    className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-black/60"
                                  >
                                    {slot}
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-xs font-extrabold uppercase tracking-wide text-black/45">
                                Automatic Time Slots
                              </p>
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
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

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
              onClick={() => startCreate(activeType === "all" ? "resort_venue" : activeType)}
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
                <div
                  key={pkg._id}
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
                    <p className="mt-1 text-sm font-bold text-black/50">
                      {pkg.subtitle}
                    </p>
                  ) : null}

                  {Array.isArray(pkg.variants) && pkg.variants.length ? (
                    <div className="mt-4 grid gap-2">
                      {pkg.variants.map((variant) => (
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
                            <div className="text-right">
                              <p className="text-lg font-extrabold text-[#355240]">
                                {formatPeso(variant.price)}
                              </p>
                              {pkg.type === "event_package" ? (
                                <p className="text-xs font-bold uppercase tracking-wide text-black/45">
                                  {inferTimeLabelFromSlots(variant.timeSlots)}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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

                    {pkg.type === "event_package" && Array.isArray(pkg.availableVenues) && pkg.availableVenues.length ? (
                      <span className="rounded-full bg-white px-3 py-1">
                        Venues: {pkg.availableVenues.join(", ")}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(pkg)}
                      className="rounded-full border border-[#355240]/20 bg-white px-4 py-2 text-xs font-extrabold text-[#355240] hover:bg-[#355240]/5"
                    >
                      EDIT
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStatus(pkg)}
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
                      onClick={() => deletePackage(pkg)}
                      className="rounded-full bg-rose-100 px-4 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-200"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </HotelAdminShell>
  );
}

function PresetBox({ title, description, buttons }) {
  return (
    <div className="md:col-span-2 rounded-2xl border border-[#355240]/15 bg-[#355240]/5 p-4">
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
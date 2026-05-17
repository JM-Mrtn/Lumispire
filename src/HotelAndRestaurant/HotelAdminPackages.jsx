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
  type: "",
  title: "",
  subtitle: "",
  description: "",
  capacityNumber: "",
  availableVenues: [],
  inclusions: "",
  imageFile: null,
  imagePreview: "",
  removePackageImage: false,
  displayOrder: 1,
  variants: [],
};

function getAdminToken() {
  return (
    localStorage.getItem("hotelAdminToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
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

function onlyDigits(value) {
  return String(value || "").replace(/[^0-9]/g, "");
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
  if (text.includes("LORENZO CABANAS") || text.includes("LORENZO CAVANAS")) return "LORENZO CAVANAS";
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

function getTypeLabel(type) {
  return PACKAGE_TYPES.find((item) => item.value === type)?.label || "Unknown Type";
}

function makeEventLabel(pax, timeLabel) {
  const safePax = Number(pax || 0);
  const safeTimeLabel = normalizeTimeLabel(timeLabel || "8 Hours");
  return safePax ? `${safePax} Pax - ${safeTimeLabel}` : "";
}

function makeEventVariant({ pax = "", timeVariationLabel = "8 Hours", price = "", isActive = true } = {}) {
  const cleanPax = onlyDigits(pax);
  const cleanTime = normalizeTimeLabel(timeVariationLabel || "8 Hours");
  return {
    label: makeEventLabel(cleanPax, cleanTime),
    pax: cleanPax,
    timeVariationLabel: cleanTime,
    timeSlots: getDefaultTimeSlots(cleanTime),
    price,
    isActive,
  };
}

function makeDefaultVariants(type) {
  if (type === "hotel_condo") {
    return [
      { label: "8 Hours", price: "", isActive: true },
      { label: "12 Hours", price: "", isActive: true },
      { label: "22 Hours", price: "", isActive: true },
    ];
  }

  if (type === "event_package") {
    return [
      makeEventVariant({ pax: "50", timeVariationLabel: "8 Hours", price: "" }),
      makeEventVariant({ pax: "80", timeVariationLabel: "8 Hours", price: "" }),
      makeEventVariant({ pax: "100", timeVariationLabel: "8 Hours", price: "" }),
    ];
  }

  if (type === "resort_venue") {
    return [{ label: "8 Hours", price: "", isActive: true }];
  }

  return [];
}

function normalizeVariantForForm(variant = {}, type = "resort_venue") {
  if (isEventPackage(type)) {
    const pax = Number(variant.pax || parsePaxFromLabel(variant.label) || 0);
    const timeSlots =
      Array.isArray(variant.timeSlots) && variant.timeSlots.length
        ? variant.timeSlots
        : getDefaultTimeSlots(variant.timeVariationLabel || variant.duration || variant.label || "8 Hours");
    const timeVariationLabel = variant.timeVariationLabel || inferTimeLabelFromSlots(timeSlots);
    return makeEventVariant({
      pax: pax ? String(pax) : "",
      timeVariationLabel,
      price: variant.price ?? "",
      isActive: variant.isActive === false ? false : true,
    });
  }

  const label = normalizeTimeLabel(variant.label || "8 Hours");
  return {
    label,
    timeSlots: getDefaultTimeSlots(label),
    price: variant.price ?? "",
    isActive: variant.isActive === false ? false : true,
  };
}

function normalizeVariantForPayload(variant = {}, index = 0, type = "resort_venue") {
  if (isEventPackage(type)) {
    const eventPax = Number(variant.pax || parsePaxFromLabel(variant.label) || 0);
    const timeVariationLabel = normalizeTimeLabel(variant.timeVariationLabel || "8 Hours");
    const timeSlots = getDefaultTimeSlots(timeVariationLabel);
    return {
      label: `${eventPax} Pax - ${timeVariationLabel}`,
      pax: eventPax,
      price: Number(variant.price || 0),
      timeSlots,
      timeVariationLabel,
      displayOrder: index + 1,
      isActive: variant.isActive === false ? false : true,
    };
  }

  const label = normalizeTimeLabel(variant.label || "8 Hours");
  return {
    label,
    pax: 0,
    price: Number(variant.price || 0),
    timeSlots: getDefaultTimeSlots(label),
    displayOrder: index + 1,
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
    { all: 0, resort_venue: 0, hotel_condo: 0, event_package: 0 }
  );
}

function getPackageImageUrl(imageUrl = "") {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) return imageUrl;
  const serverBase = API_BASE.replace(/\/api\/hotel.*$/i, "");
  return `${serverBase}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

function getDurationSummary(variants = []) {
  const labels = variants
    .map((variant) => normalizeTimeLabel(variant.timeVariationLabel || variant.label || ""))
    .filter(Boolean);
  return [...new Set(labels)].join(" / ");
}

function getCapacitySummary(type, capacityNumber, variants = []) {
  if (isEventPackage(type)) {
    const paxValues = variants
      .map((variant) => Number(variant.pax || parsePaxFromLabel(variant.label) || 0))
      .filter((num) => num > 0)
      .sort((a, b) => a - b);
    return paxValues.length ? `${[...new Set(paxValues)].join(" / ")} pax` : "";
  }

  const safeCapacity = onlyDigits(capacityNumber);
  return safeCapacity ? `${safeCapacity} pax max` : "";
}

function getDefaultPrice(variants = []) {
  const firstWithPrice = variants.find((variant) => Number(variant.price || 0) > 0);
  return Number(firstWithPrice?.price || 0);
}

function extractCapacityNumber(capacity = "") {
  const match = String(capacity || "").match(/\d+/);
  return match ? match[0] : "";
}

function buildNextDisplayOrder(packages = [], activeType = "") {
  const relevant = activeType && activeType !== "all"
    ? packages.filter((pkg) => pkg.type === activeType)
    : packages;
  const max = relevant.reduce((acc, pkg) => Math.max(acc, Number(pkg.displayOrder || 0)), 0);
  return max + 1;
}

export default function HotelAdminPackages() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [activeType, setActiveType] = useState("all");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const token = getAdminToken();

  const adminHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const jsonHeaders = useMemo(
    () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }),
    [token]
  );

  const packageCounts = useMemo(() => getPackageCounts(packages), [packages]);

  const filteredPackages = useMemo(() => {
    const rows = activeType === "all" ? packages : packages.filter((item) => item.type === activeType);
    return [...rows].sort((a, b) => {
      const orderA = Number(a.displayOrder || 0);
      const orderB = Number(b.displayOrder || 0);
      if (orderA !== orderB) return orderA - orderB;
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }, [packages, activeType]);

  const availableVenueOptions = useMemo(() => {
    const resortVenues = packages
      .filter((item) => item?.type === "resort_venue" && item?.isActive !== false)
      .map((item) => item.title)
      .filter(Boolean);

    return uniqueVenueNames(resortVenues);
  }, [packages]);

  const durationSummary = useMemo(() => getDurationSummary(form.variants), [form.variants]);
  const capacitySummary = useMemo(
    () => getCapacitySummary(form.type, form.capacityNumber, form.variants),
    [form.type, form.capacityNumber, form.variants]
  );
  const defaultPrice = useMemo(() => getDefaultPrice(form.variants), [form.variants]);

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
      const res = await fetch(`${API_BASE}/admin/packages`, { headers: adminHeaders });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to load packages.");
      setPackages(Array.isArray(data.packages) ? data.packages : []);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Failed to load packages." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId("");
    setShowForm(false);
  };

  const startCreate = () => {
    setForm({
      ...EMPTY_FORM,
      displayOrder: buildNextDisplayOrder(packages, activeType),
    });
    setEditingId("");
    setShowForm(true);
    setStatus({ type: "", message: "" });
  };

  const startEdit = (pkg) => {
    const type = pkg.type || "";
    setEditingId(pkg._id);
    setForm({
      type,
      title: pkg.title || "",
      subtitle: pkg.subtitle || "",
      description: pkg.description || "",
      capacityNumber: extractCapacityNumber(pkg.capacity),
      availableVenues: uniqueVenueNames(Array.isArray(pkg.availableVenues) ? pkg.availableVenues : []),
      inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join("\n") : "",
      imageFile: null,
      imagePreview: pkg.imageUrl || "",
      removePackageImage: false,
      displayOrder: Number(pkg.displayOrder || buildNextDisplayOrder(packages, type)),
      variants:
        Array.isArray(pkg.variants) && pkg.variants.length
          ? pkg.variants.map((variant) => normalizeVariantForForm(variant, type))
          : makeDefaultVariants(type),
    });
    setShowForm(true);
    setStatus({ type: "", message: "" });
  };

  const updateForm = (field, value) => {
    setForm((prev) => {
      if (field === "type") {
        return {
          ...prev,
          type: value,
          title: "",
          capacityNumber: "",
          availableVenues: value === "event_package" ? [] : [],
          variants: makeDefaultVariants(value),
          displayOrder: buildNextDisplayOrder(packages, value),
        };
      }

      if (field === "capacityNumber") {
        return { ...prev, capacityNumber: onlyDigits(value).slice(0, 5) };
      }

      return { ...prev, [field]: value };
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setStatus({ type: "error", message: "Only JPG, JPEG, PNG, and WEBP images are allowed." });
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", message: "Package image must be 5MB or smaller." });
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
    setForm((prev) => ({ ...prev, imageFile: null, imagePreview: "", removePackageImage: true }));
  };

  const updateVariant = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) => {
        if (i !== index) return variant;

        if (field === "price") return { ...variant, price: sanitizePrice(value) };

        if (field === "pax" && isEventPackage(prev.type)) {
          const cleanPax = onlyDigits(value).slice(0, 5);
          const timeLabel = normalizeTimeLabel(variant.timeVariationLabel || "8 Hours");
          return { ...variant, pax: cleanPax, label: makeEventLabel(cleanPax, timeLabel) };
        }

        if (field === "timeVariationLabel" && isEventPackage(prev.type)) {
          const timeLabel = normalizeTimeLabel(value);
          const cleanPax = onlyDigits(variant.pax || parsePaxFromLabel(variant.label) || "");
          return {
            ...variant,
            timeVariationLabel: timeLabel,
            timeSlots: getDefaultTimeSlots(timeLabel),
            label: makeEventLabel(cleanPax, timeLabel),
          };
        }

        if (field === "label" && isTimeBasedPackage(prev.type)) {
          const label = normalizeTimeLabel(value);
          return { ...variant, label, timeSlots: getDefaultTimeSlots(label) };
        }

        return { ...variant, [field]: value };
      }),
    }));
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        isEventPackage(prev.type)
          ? makeEventVariant({ pax: "", timeVariationLabel: "8 Hours", price: "" })
          : { label: "8 Hours", price: "", isActive: true },
      ],
    }));
  };

  const removeVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const toggleAvailableVenue = (venue) => {
    const normalizedVenue = normalizeVenueName(venue);
    setForm((prev) => {
      const current = uniqueVenueNames(prev.availableVenues || []);
      return {
        ...prev,
        availableVenues: current.includes(normalizedVenue)
          ? current.filter((item) => item !== normalizedVenue)
          : [...current, normalizedVenue],
      };
    });
  };

  const selectAllVenues = () => {
    setForm((prev) => ({ ...prev, availableVenues: uniqueVenueNames(availableVenueOptions) }));
  };

  const submitForm = async (event) => {
    event.preventDefault();

    if (!form.type) {
      setStatus({ type: "error", message: "Please select a package type first." });
      return;
    }

    if (!form.title.trim()) {
      setStatus({ type: "error", message: "Package title is required." });
      return;
    }

    if (isTimeBasedPackage(form.type) && !form.capacityNumber) {
      setStatus({ type: "error", message: "Capacity must be a number only." });
      return;
    }

    if (isEventPackage(form.type) && !form.availableVenues.length) {
      setStatus({ type: "error", message: "Please select at least one available venue for this event package." });
      return;
    }

    const variants = form.variants
      .map((variant, index) => normalizeVariantForPayload(variant, index, form.type))
      .filter((variant) => variant.label);

    if (!variants.length) {
      setStatus({ type: "error", message: "At least one variation/rate is required." });
      return;
    }

    const invalidVariant = variants.find((variant) => {
      const invalidPrice = Number.isNaN(Number(variant.price)) || Number(variant.price) <= 0;
      if (isEventPackage(form.type)) {
        return !variant.pax || !variant.timeSlots?.length || invalidPrice;
      }
      return !variant.label || !variant.timeSlots?.length || invalidPrice;
    });

    if (invalidVariant) {
      setStatus({
        type: "error",
        message: isEventPackage(form.type)
          ? "Each event rate must have pax, time variation, and price greater than 0."
          : "Each variation must have a duration and price greater than 0.",
      });
      return;
    }

    setSaving(true);
    setStatus({ type: "", message: "" });

    const payload = {
      type: form.type,
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      duration: getDurationSummary(form.variants),
      price: getDefaultPrice(form.variants),
      capacity: getCapacitySummary(form.type, form.capacityNumber, form.variants),
      availableVenues: isEventPackage(form.type) ? uniqueVenueNames(form.availableVenues) : [],
      inclusions: String(form.inclusions || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      displayOrder: Number(form.displayOrder || buildNextDisplayOrder(packages, form.type)),
      variants,
      isActive: true,
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value) || typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    if (form.imageFile) formData.append("packageImage", form.imageFile);
    if (editingId && form.removePackageImage) formData.append("removePackageImage", "true");

    try {
      const url = editingId ? `${API_BASE}/admin/packages/${editingId}` : `${API_BASE}/admin/packages`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: adminHeaders, body: formData });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to save package.");

      setStatus({ type: "success", message: editingId ? "Package updated successfully." : "Package added successfully." });
      resetForm();
      await fetchPackages();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Failed to save package." });
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
      if (!res.ok) throw new Error(data.message || "Failed to update package status.");

      setPackages((prev) => prev.map((item) => (item._id === pkg._id ? { ...item, isActive: nextStatus } : item)));
      setStatus({ type: "success", message: nextStatus ? "Package activated successfully." : "Package deactivated successfully." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Failed to update package status." });
    }
  };

  const deletePackage = async (pkg) => {
    const confirmed = window.confirm(`Delete "${pkg.title}"? This action cannot be undone.`);
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
      if (!res.ok) throw new Error(data.message || "Failed to delete package.");
      setPackages((prev) => prev.filter((item) => item._id !== pkg._id));
      setStatus({ type: "success", message: "Package deleted successfully." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Failed to delete package." });
    }
  };

  return (
    <HotelAdminShell
      title="Package Management"
      subtitle="Manage resort, hotel, condo, and event package rates with a simpler modal form."
      activePage="packages"
      maxWidth="max-w-7xl"
      actions={
        <button type="button" onClick={startCreate} className="ltc-admin-btn">
          ADD PACKAGE
        </button>
      }
    >
      <div className="ltc-admin-packages-surface">
        <style>{adminPackageStyles}</style>

        {status.message ? (
          <div className={`ltc-admin-alert ${status.type === "success" ? "" : "error"}`}>{status.message}</div>
        ) : null}

        <div className="ltc-admin-package-topbar">
          <TypeButton active={activeType === "all"} onClick={() => setActiveType("all")} label={`ALL (${packageCounts.all})`} />
          {PACKAGE_TYPES.map((type) => (
            <TypeButton
              key={type.value}
              active={activeType === type.value}
              onClick={() => setActiveType(type.value)}
              label={`${type.label} (${packageCounts[type.value] || 0})`}
            />
          ))}
        </div>

        <section className="ltc-admin-panel">
          <div className="ltc-admin-panel-head">
            <div>
              <p className="ltc-admin-kicker">Saved Packages</p>
              <h2 className="ltc-admin-panel-title">Package List</h2>
              <p className="ltc-admin-muted">Display order is automatic. Use filters above to view each package group.</p>
            </div>
          </div>

          {loading ? (
            <div className="ltc-admin-empty-state">Loading packages...</div>
          ) : filteredPackages.length ? (
            <div className="ltc-admin-package-list-grid">
              {filteredPackages.map((pkg) => (
                <PackageCard
                  key={pkg._id}
                  pkg={pkg}
                  onEdit={() => startEdit(pkg)}
                  onToggle={() => toggleStatus(pkg)}
                  onDelete={() => deletePackage(pkg)}
                />
              ))}
            </div>
          ) : (
            <div className="ltc-admin-empty-state">
              <h3>No packages found.</h3>
              <p>Click ADD PACKAGE to create your first package.</p>
            </div>
          )}
        </section>

        {showForm ? (
          <PackageModal
            form={form}
            editingId={editingId}
            saving={saving}
            availableVenueOptions={availableVenueOptions}
            durationSummary={durationSummary}
            capacitySummary={capacitySummary}
            defaultPrice={defaultPrice}
            updateForm={updateForm}
            updateVariant={updateVariant}
            addVariant={addVariant}
            removeVariant={removeVariant}
            toggleAvailableVenue={toggleAvailableVenue}
            selectAllVenues={selectAllVenues}
            handleImageChange={handleImageChange}
            removeSelectedImage={removeSelectedImage}
            resetForm={resetForm}
            submitForm={submitForm}
          />
        ) : null}
      </div>
    </HotelAdminShell>
  );
}

function PackageModal({
  form,
  editingId,
  saving,
  availableVenueOptions,
  durationSummary,
  capacitySummary,
  defaultPrice,
  updateForm,
  updateVariant,
  addVariant,
  removeVariant,
  toggleAvailableVenue,
  selectAllVenues,
  handleImageChange,
  removeSelectedImage,
  resetForm,
  submitForm,
}) {
  return (
    <div className="ltc-modal-backdrop" role="dialog" aria-modal="true">
      <div className="ltc-modal-panel">
        <form onSubmit={submitForm}>
          <div className="ltc-modal-head">
            <div>
              <p className="ltc-admin-kicker">{editingId ? "Edit Package" : "Add Package"}</p>
              <h2 className="ltc-admin-panel-title">Package Setup</h2>
              <p className="ltc-admin-muted">
                Type, duration, price, display order, and capacity summaries are simplified to avoid duplicate inputs.
              </p>
            </div>
            <button type="button" onClick={resetForm} className="ltc-admin-mini-btn neutral">CLOSE</button>
          </div>

          <div className="ltc-modal-body">
            <SectionCard title="1. Package Details" description="Start by selecting the type. Duration and default price are auto-generated from variations.">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <InputLabel>Type</InputLabel>
                  <select
                    value={form.type}
                    onChange={(e) => updateForm("type", e.target.value)}
                    className="ltc-admin-input"
                  >
                    <option value="">Please Select A Type</option>
                    {PACKAGE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </label>

                {form.type ? (
                  <>
                    <label className="block">
                      <InputLabel>Title</InputLabel>
                      <input
                        value={form.title}
                        onChange={(e) => updateForm("title", e.target.value)}
                        placeholder={
                          form.type === "event_package" ? "Example: Wedding Package" :
                          form.type === "hotel_condo" ? "Example: Nature Room" :
                          "Example: Lorenzo Cavanas"
                        }
                        className="ltc-admin-input"
                      />
                    </label>

                    <label className="block">
                      <InputLabel>Subtitle</InputLabel>
                      <input
                        value={form.subtitle}
                        onChange={(e) => updateForm("subtitle", e.target.value)}
                        placeholder="Short description"
                        className="ltc-admin-input"
                      />
                    </label>

                    <ReadOnlyInfo label="Display Order" value={`Auto: ${form.displayOrder}`} help="This is assigned automatically based on existing packages." />
                    <ReadOnlyInfo label="Duration" value={durationSummary || "Add a variation first"} help="Generated from Time Variations below." />
                    <ReadOnlyInfo label="Default Price" value={defaultPrice ? formatPeso(defaultPrice) : "Auto from first priced variation"} help="No need to type this twice." />

                    {isEventPackage(form.type) ? (
                      <ReadOnlyInfo label="Capacity" value={capacitySummary || "Auto from event pax rates"} help="Generated from event pax rates below." />
                    ) : (
                      <label className="block">
                        <InputLabel>Capacity Number</InputLabel>
                        <input
                          inputMode="numeric"
                          value={form.capacityNumber}
                          onChange={(e) => updateForm("capacityNumber", e.target.value)}
                          placeholder="Example: 100"
                          className="ltc-admin-input"
                        />
                        <p className="ltc-admin-help">Numbers only. It will save as: {capacitySummary || "0 pax max"}</p>
                      </label>
                    )}

                    <label className="block md:col-span-2">
                      <InputLabel>Description</InputLabel>
                      <textarea
                        value={form.description}
                        onChange={(e) => updateForm("description", e.target.value)}
                        rows={4}
                        placeholder="Write package details..."
                        className="ltc-admin-input resize-none"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <InputLabel>Inclusions</InputLabel>
                      <textarea
                        value={form.inclusions}
                        onChange={(e) => updateForm("inclusions", e.target.value)}
                        rows={5}
                        placeholder="One inclusion per line"
                        className="ltc-admin-input resize-none"
                      />
                    </label>
                  </>
                ) : (
                  <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                    Please select a type before filling out package details.
                  </div>
                )}
              </div>
            </SectionCard>

            {form.type ? (
              <>
                {form.type === "event_package" ? (
                  <SectionCard title="2. Available Venues" description="These venues come only from your active Resort & Venue packages.">
                    {availableVenueOptions.length ? (
                      <>
                        <div className="mb-4 flex flex-wrap gap-2">
                          <button type="button" onClick={selectAllVenues} className="ltc-admin-mini-btn green">SELECT ALL VENUES</button>
                          <button type="button" onClick={() => updateForm("availableVenues", [])} className="ltc-admin-mini-btn neutral">CLEAR</button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {availableVenueOptions.map((venue) => {
                            const checked = uniqueVenueNames(form.availableVenues || []).includes(venue);
                            return (
                              <label key={venue} className={`ltc-venue-toggle ${checked ? "active" : ""}`}>
                                <input type="checkbox" checked={checked} onChange={() => toggleAvailableVenue(venue)} />
                                <span>{venue}</span>
                              </label>
                            );
                          })}
                        </div>

                        {!form.availableVenues.length ? (
                          <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">Select at least one venue for this event package.</p>
                        ) : null}
                      </>
                    ) : (
                      <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                        Add at least one active Resort & Venue package first. Event packages can only use venues from your Resort & Venue packages.
                      </p>
                    )}
                  </SectionCard>
                ) : null}

                <SectionCard
                  title={form.type === "event_package" ? "3. Pax / Time / Price Rates" : "2. Time Variations"}
                  description={form.type === "event_package" ? "Each row creates one customer-selectable event rate." : "Duration and price are controlled here. The package duration and default price come from these rows."}
                  action={
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={addVariant} className="ltc-admin-mini-btn green">ADD VARIATION</button>
                    </div>
                  }
                >
                  <div className="grid gap-4">
                    {form.variants.map((variant, index) => (
                      <VariationRow
                        key={`${index}-${variant.label}-${variant.timeVariationLabel}`}
                        type={form.type}
                        variant={variant}
                        index={index}
                        updateVariant={updateVariant}
                        removeVariant={removeVariant}
                        canRemove={form.variants.length > 1}
                      />
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Package Image" description="Upload an optional package image.">
                  <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                    <div className="ltc-image-preview">
                      {form.imagePreview ? <img src={getPackageImageUrl(form.imagePreview)} alt="Package preview" /> : <span>No Image</span>}
                    </div>
                    <div className="space-y-3">
                      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleImageChange} className="ltc-admin-file" />
                      {form.imagePreview ? (
                        <button type="button" onClick={removeSelectedImage} className="ltc-admin-mini-btn danger">REMOVE IMAGE</button>
                      ) : null}
                      <p className="ltc-admin-help">JPG, PNG, or WEBP. Maximum 5MB.</p>
                    </div>
                  </div>
                </SectionCard>
              </>
            ) : null}
          </div>

          <div className="ltc-modal-actions">
            <button type="button" onClick={resetForm} className="ltc-admin-mini-btn neutral">CANCEL</button>
            <button type="submit" disabled={saving} className="ltc-admin-btn">{saving ? "SAVING..." : editingId ? "UPDATE PACKAGE" : "SAVE PACKAGE"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VariationRow({ type, variant, index, updateVariant, removeVariant, canRemove }) {
  const timeLabel = isEventPackage(type) ? (variant.timeVariationLabel || "8 Hours") : (variant.label || "8 Hours");
  const timeSlots = getDefaultTimeSlots(timeLabel);
  const pax = variant.pax || parsePaxFromLabel(variant.label) || "";

  return (
    <div className="ltc-variation-card">
      <div className="ltc-variation-head">
        <div>
          <p className="ltc-admin-section-title">Variation #{index + 1}</p>
          <p className="ltc-admin-muted">Order is automatic: #{index + 1}</p>
        </div>
        <button type="button" onClick={() => removeVariant(index)} disabled={!canRemove} className="ltc-admin-mini-btn danger">REMOVE</button>
      </div>

      <div className={isEventPackage(type) ? "grid gap-4 md:grid-cols-4" : "grid gap-4 md:grid-cols-3"}>
        {isEventPackage(type) ? (
          <label className="block">
            <InputLabel>Pax</InputLabel>
            <input inputMode="numeric" value={pax} onChange={(e) => updateVariant(index, "pax", e.target.value)} placeholder="50" className="ltc-admin-input" />
          </label>
        ) : null}

        <label className="block">
          <InputLabel>{isEventPackage(type) ? "Time Variation" : "Duration"}</InputLabel>
          <select value={timeLabel} onChange={(e) => updateVariant(index, isEventPackage(type) ? "timeVariationLabel" : "label", e.target.value)} className="ltc-admin-input">
            <option value="8 Hours">8 Hours</option>
            <option value="12 Hours">12 Hours</option>
            <option value="22 Hours">22 Hours</option>
          </select>
        </label>

        <label className="block">
          <InputLabel>Price</InputLabel>
          <input inputMode="decimal" value={variant.price} onChange={(e) => updateVariant(index, "price", e.target.value)} placeholder="15000" className="ltc-admin-input" />
        </label>

        <label className="ltc-active-toggle">
          <input type="checkbox" checked={variant.isActive !== false} onChange={(e) => updateVariant(index, "isActive", e.target.checked)} />
          <span>Active</span>
        </label>
      </div>

      <div className="ltc-rate-preview">
        <div>
          <strong>{isEventPackage(type) ? makeEventLabel(pax, timeLabel) || "Incomplete Event Rate" : timeLabel}</strong>
          <span>{timeSlots.length} automatic time slots</span>
        </div>
        <strong>{formatPeso(variant.price)}</strong>
      </div>
    </div>
  );
}

function PackageCard({ pkg, onEdit, onToggle, onDelete }) {
  const imageUrl = getPackageImageUrl(pkg.imageUrl || "");
  const variants = Array.isArray(pkg.variants) ? pkg.variants : [];

  return (
    <article className={`ltc-admin-package-card ${pkg.isActive === false ? "inactive" : ""}`}>
      <div className="ltc-admin-package-image">
        {imageUrl ? <img src={imageUrl} alt={pkg.title || "Package"} /> : <span>No Image</span>}
      </div>

      <div className="ltc-admin-chip-row">
        <span className="ltc-admin-chip gold">{getTypeLabel(pkg.type)}</span>
        <span className={`ltc-admin-chip ${pkg.isActive === false ? "danger" : "success"}`}>{pkg.isActive === false ? "Inactive" : "Active"}</span>
        <span className="ltc-admin-chip">Order {pkg.displayOrder || 0}</span>
      </div>

      <h3 className="ltc-admin-package-title">{pkg.title || "Untitled Package"}</h3>
      <p className="ltc-admin-muted">{pkg.subtitle || pkg.description || "No subtitle."}</p>

      <div className="ltc-admin-package-summary">
        <div className="ltc-admin-inner-box">
          <p><strong>Duration:</strong> {pkg.duration || "-"}</p>
          <p><strong>Capacity:</strong> {pkg.capacity || "-"}</p>
          <p><strong>Default Price:</strong> {formatPeso(pkg.price)}</p>
        </div>
        {variants.length ? (
          <div className="ltc-admin-inner-box">
            <strong>Rates</strong>
            {variants.map((variant, index) => (
              <p key={`${variant.label}-${index}`}>{variant.label}: {formatPeso(variant.price)}</p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="ltc-admin-package-actions">
        <button type="button" onClick={onEdit} className="ltc-admin-mini-btn green">EDIT</button>
        <button type="button" onClick={onToggle} className="ltc-admin-mini-btn warning">{pkg.isActive === false ? "ACTIVATE" : "DEACTIVATE"}</button>
        <button type="button" onClick={onDelete} className="ltc-admin-mini-btn danger">DELETE</button>
      </div>
    </article>
  );
}

function TypeButton({ active, onClick, label }) {
  return <button type="button" onClick={onClick} className={`ltc-admin-filter ${active ? "active" : ""}`}>{label}</button>;
}

function InputLabel({ children }) {
  return <span className="ltc-admin-input-label">{children}</span>;
}

function ReadOnlyInfo({ label, value, help }) {
  return (
    <div className="ltc-readonly-info">
      <InputLabel>{label}</InputLabel>
      <div>{value}</div>
      {help ? <p>{help}</p> : null}
    </div>
  );
}

function SectionCard({ title, description, action, children }) {
  return (
    <section className="ltc-admin-section-card">
      <div className="ltc-admin-section-head">
        <div>
          <h3 className="ltc-admin-section-title">{title}</h3>
          {description ? <p className="ltc-admin-muted">{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

const adminPackageStyles = `
  .ltc-admin-packages-surface {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --muted: #667085;
    --glass: rgba(255,255,255,.82);
    --shadow-md: 0 18px 45px rgba(8,39,25,.10);
    --shadow-lg: 0 32px 80px rgba(8,39,25,.16);
    --radius: 24px;
    --ease: cubic-bezier(.22,1,.36,1);
  }

  .ltc-admin-packages-surface * { box-sizing: border-box; }

  .ltc-admin-package-topbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
  }

  .ltc-admin-btn,
  .ltc-admin-filter,
  .ltc-admin-mini-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid rgba(35,95,62,.14);
    font-weight: 900;
    cursor: pointer;
    transition: transform .25s var(--ease), box-shadow .25s var(--ease), background .25s var(--ease), border-color .25s var(--ease), color .25s var(--ease);
    white-space: nowrap;
  }

  .ltc-admin-btn {
    min-height: 42px;
    padding: 0 18px;
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 16px 35px rgba(215,168,77,.22);
    font-size: 12px;
    letter-spacing: .08em;
  }

  .ltc-admin-btn:hover,
  .ltc-admin-filter:hover,
  .ltc-admin-mini-btn:hover { transform: translateY(-2px); }

  .ltc-admin-btn:disabled,
  .ltc-admin-mini-btn:disabled {
    cursor: not-allowed;
    opacity: .58;
    transform: none;
  }

  .ltc-admin-filter {
    min-height: 40px;
    padding: 0 16px;
    color: rgba(16,24,40,.58);
    background: rgba(255,255,255,.82);
    font-size: 12px;
  }

  .ltc-admin-filter.active {
    color: #102418;
    border-color: rgba(215,168,77,.56);
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 12px 28px rgba(215,168,77,.20);
  }

  .ltc-admin-alert {
    margin-bottom: 18px;
    border-radius: 20px;
    border: 1px solid rgba(215,168,77,.32);
    background: rgba(244,212,132,.18);
    color: var(--green-900);
    padding: 14px 18px;
    font-size: 14px;
    font-weight: 800;
  }

  .ltc-admin-alert.error {
    border-color: rgba(244,63,94,.25);
    background: rgba(255,241,242,.90);
    color: #be123c;
  }

  .ltc-admin-panel,
  .ltc-admin-section-card,
  .ltc-admin-package-card,
  .ltc-admin-preset-box {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius);
    background: var(--glass);
    border: 1px solid rgba(255,255,255,.76);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
  }

  .ltc-admin-panel::before,
  .ltc-admin-section-card::before,
  .ltc-admin-package-card::before,
  .ltc-admin-preset-box::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 6px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
  }

  .ltc-admin-panel { padding: 22px; }

  .ltc-admin-panel-head,
  .ltc-modal-head {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(35,95,62,.08);
  }

  @media (min-width: 640px) {
    .ltc-admin-panel-head,
    .ltc-modal-head {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
    }
  }

  .ltc-admin-kicker {
    margin: 0;
    color: rgba(16,24,40,.46);
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .18em;
  }

  .ltc-admin-panel-title,
  .ltc-admin-section-title,
  .ltc-admin-package-title {
    position: relative;
    z-index: 1;
    margin: 0;
    color: var(--green-950);
    font-weight: 900;
    letter-spacing: -.045em;
  }

  .ltc-admin-panel-title { font-size: 25px; line-height: 1.1; }
  .ltc-admin-section-title { font-size: 20px; line-height: 1.15; }
  .ltc-admin-package-title { margin-top: 12px; font-size: 21px; line-height: 1.12; }

  .ltc-admin-muted {
    margin: 6px 0 0;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.65;
  }

  .ltc-admin-section-card,
  .ltc-admin-preset-box {
    margin-top: 18px;
    padding: 20px;
    background: radial-gradient(circle at 100% 0%, rgba(215,168,77,.11), transparent 25%), rgba(255,255,255,.78);
  }

  .ltc-admin-section-head {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  @media (min-width: 640px) {
    .ltc-admin-section-head {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
    }
  }

  .ltc-admin-input-label {
    display: inline-block;
    margin-bottom: 6px;
    color: rgba(16,24,40,.46);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .15em;
  }

  .ltc-admin-input,
  .ltc-admin-file {
    width: 100%;
    margin-top: 4px;
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.14) !important;
    background: rgba(255,255,255,.82) !important;
    color: var(--green-950) !important;
    padding: 12px 14px;
    font-size: 14px;
    font-weight: 800;
    outline: none;
    box-shadow: none;
    transition: border-color .25s var(--ease), box-shadow .25s var(--ease), background .25s var(--ease);
  }

  .ltc-admin-input:focus,
  .ltc-admin-file:focus {
    border-color: var(--green-700) !important;
    background: white !important;
    box-shadow: 0 0 0 4px rgba(35,95,62,.10) !important;
  }

  .ltc-admin-help {
    margin: 7px 0 0;
    color: rgba(16,24,40,.48);
    font-size: 12px;
    font-weight: 700;
  }

  .ltc-readonly-info {
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.10);
    background: rgba(255,255,255,.70);
    padding: 13px 14px;
  }

  .ltc-readonly-info div {
    color: var(--green-950);
    font-size: 15px;
    font-weight: 900;
  }

  .ltc-readonly-info p {
    margin: 5px 0 0;
    color: rgba(16,24,40,.48);
    font-size: 12px;
    font-weight: 700;
  }

  .ltc-admin-mini-btn {
    min-height: 38px;
    padding: 0 15px;
    font-size: 11px;
    letter-spacing: .06em;
  }

  .ltc-admin-mini-btn.neutral { color: rgba(16,24,40,.62); background: rgba(255,255,255,.86); }
  .ltc-admin-mini-btn.green { color: white; border-color: rgba(35,95,62,.28); background: var(--green-800); }
  .ltc-admin-mini-btn.danger { color: #be123c; border-color: rgba(244,63,94,.18); background: #fff1f2; }
  .ltc-admin-mini-btn.warning { color: #92400e; border-color: rgba(245,158,11,.18); background: #fffbeb; }

  .ltc-admin-package-list-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    align-items: stretch;
    gap: 18px;
    padding-top: 18px;
  }

  @media (min-width: 1280px) {
    .ltc-admin-package-list-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  .ltc-admin-package-card {
    display: flex;
    flex-direction: column;
    min-height: 430px;
    padding: 16px;
    transition: transform .38s var(--ease), box-shadow .38s var(--ease), border-color .38s var(--ease), background .38s var(--ease);
  }

  .ltc-admin-package-card:hover {
    transform: translateY(-6px) scale(1.006);
    box-shadow: 0 34px 85px rgba(8,39,25,.18);
    border-color: rgba(215,168,77,.54);
    background: rgba(255,255,255,.94);
  }

  .ltc-admin-package-card.inactive {
    border-color: rgba(244,63,94,.18);
    background: rgba(255,241,242,.78);
  }

  .ltc-admin-package-image {
    position: relative;
    z-index: 1;
    margin-bottom: 12px;
    height: 112px;
    overflow: hidden;
    border-radius: 17px;
    border: 1px solid rgba(35,95,62,.09);
    background: white;
    display: grid;
    place-items: center;
    color: rgba(16,24,40,.40);
    font-weight: 900;
  }

  .ltc-admin-package-image img,
  .ltc-image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .ltc-admin-chip-row {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .ltc-admin-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 22px;
    border-radius: 999px;
    padding: 0 9px;
    background: rgba(35,95,62,.08);
    color: var(--green-800);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: .055em;
    text-transform: uppercase;
  }

  .ltc-admin-chip.success { background: rgba(16,185,129,.12); color: #047857; }
  .ltc-admin-chip.danger { background: rgba(244,63,94,.12); color: #be123c; }
  .ltc-admin-chip.gold { background: rgba(244,212,132,.40); color: var(--green-800); }

  .ltc-admin-package-summary {
    position: relative;
    z-index: 1;
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
    margin-top: 12px;
    scrollbar-width: thin;
  }

  .ltc-admin-inner-box {
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.10);
    background: rgba(255,255,255,.82);
    padding: 12px;
  }

  .ltc-admin-inner-box + .ltc-admin-inner-box { margin-top: 10px; }
  .ltc-admin-inner-box p { margin: 4px 0; color: rgba(16,24,40,.66); font-size: 12px; font-weight: 700; }
  .ltc-admin-inner-box strong { color: var(--green-950); }

  .ltc-admin-package-actions {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 12px;
  }

  .ltc-admin-empty-state {
    position: relative;
    z-index: 1;
    padding: 38px 18px;
    text-align: center;
    color: rgba(16,24,40,.62);
    font-weight: 800;
  }

  .ltc-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    background: rgba(2, 18, 11, .58);
    backdrop-filter: blur(8px);
  }

  .ltc-modal-panel {
    width: min(1040px, 96vw);
    max-height: 88vh;
    overflow: hidden;
    border-radius: 26px;
    border: 1px solid rgba(255,255,255,.80);
    background: #f8fbf9;
    box-shadow: 0 32px 90px rgba(0,0,0,.30);
    display: flex;
    flex-direction: column;
  }

  .ltc-modal-panel form {
    min-height: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .ltc-modal-head {
    flex-shrink: 0;
    padding: 22px;
    background: rgba(255,255,255,.88);
  }

  .ltc-modal-body {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    padding: 0 22px 22px;
  }

  .ltc-modal-actions {
    position: sticky;
    bottom: 0;
    z-index: 8;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 22px;
    border-top: 1px solid rgba(35,95,62,.10);
    background: rgba(255,255,255,.96);
    box-shadow: 0 -12px 30px rgba(8,39,25,.08);
  }

  .ltc-venue-toggle {
    display: flex;
    cursor: pointer;
    align-items: center;
    gap: 12px;
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.12);
    background: white;
    color: var(--green-800);
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 900;
  }

  .ltc-venue-toggle.active {
    border-color: var(--green-800);
    background: var(--green-800);
    color: white;
  }

  .ltc-variation-card {
    border-radius: 22px;
    border: 1px solid rgba(35,95,62,.12);
    background: white;
    padding: 16px;
  }

  .ltc-variation-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .ltc-active-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 28px;
    color: rgba(16,24,40,.62);
    font-size: 13px;
    font-weight: 900;
  }

  .ltc-rate-preview {
    margin-top: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.10);
    background: #f6f6f1;
    padding: 12px 14px;
  }

  .ltc-rate-preview strong { display: block; color: var(--green-950); font-weight: 900; }
  .ltc-rate-preview span { display: block; color: rgba(16,24,40,.48); font-size: 12px; font-weight: 800; }

  .ltc-image-preview {
    height: 140px;
    overflow: hidden;
    border-radius: 18px;
    border: 1px solid rgba(35,95,62,.12);
    background: white;
    display: grid;
    place-items: center;
    color: rgba(16,24,40,.40);
    font-weight: 900;
  }

  @media (max-width: 640px) {
    .ltc-admin-panel,
    .ltc-admin-section-card,
    .ltc-admin-preset-box,
    .ltc-admin-package-card { padding: 16px; }
    .ltc-modal-backdrop { padding: 8px; }
    .ltc-modal-panel { width: 100%; max-height: 96vh; border-radius: 20px; }
    .ltc-modal-body { max-height: calc(96vh - 166px); padding: 0 14px 14px; }
    .ltc-modal-head, .ltc-modal-actions { padding: 16px; }
    .ltc-modal-actions { flex-direction: column-reverse; }
    .ltc-admin-btn, .ltc-admin-mini-btn { width: 100%; }
  }
`;

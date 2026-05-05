import mongoose from "mongoose";
import HotelServicePackage from "../models/HotelServicePackage.js";

const PACKAGE_TYPES = new Set(["resort_venue", "hotel_condo", "event_package"]);

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

function cleanText(value = "") {
  return String(value || "").trim();
}

function parseBoolean(value, fallback = false) {
  if (value === true) return true;
  if (value === false) return false;

  const text = cleanText(value).toLowerCase();

  if (["true", "1", "yes", "on"].includes(text)) return true;
  if (["false", "0", "no", "off"].includes(text)) return false;

  return fallback;
}

function parseJsonIfNeeded(value) {
  if (typeof value !== "string") return value;

  const text = cleanText(value);
  if (!text) return value;

  if (!text.startsWith("[") && !text.startsWith("{")) return value;

  try {
    return JSON.parse(text);
  } catch {
    return value;
  }
}

function toArray(value) {
  const parsed = parseJsonIfNeeded(value);

  if (Array.isArray(parsed)) return parsed;
  if (parsed === undefined || parsed === null || parsed === "") return [];

  if (typeof parsed === "string") {
    return parsed
      .split(/\r?\n|,/)
      .map((item) => cleanText(item))
      .filter(Boolean);
  }

  return [];
}

function normalizeVenue(value = "") {
  const text = cleanText(value).toUpperCase().replace(/\s+/g, " ");

  if (text.includes("LORENZO HALL")) return "LORENZO HALL";
  if (text.includes("LORENZO VERANDA")) return "LORENZO VERANDA";
  if (text.includes("LORENZO CABANAS") || text.includes("LORENZO CAVANAS")) {
    return "LORENZO CAVANAS";
  }
  if (text.includes("LORENZO CAMPSITE")) return "LORENZO CAMPSITE";
  return text;
}

function cleanVenues(value) {
  const venues = toArray(value);

  return [
    ...new Set(
      venues
        .map((item) => normalizeVenue(item))
        .filter(Boolean)
    ),
  ];
}

function cleanNumber(value, fallback = 0) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return num;
}

function normalizeTimeLabel(value = "") {
  const text = cleanText(value).toLowerCase();

  if (text.includes("8")) return "8 Hours";
  if (text.includes("12")) return "12 Hours";
  if (text.includes("22")) return "22 Hours";

  return cleanText(value);
}

function normalizeCapacityLabel(value = "") {
  const text = cleanText(value);
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

function cleanStringArray(value) {
  return toArray(value)
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function cleanTimeSlots(value, fallbackLabel = "8 Hours") {
  const manual = cleanStringArray(value);
  if (manual.length) return manual;

  return getDefaultTimeSlots(fallbackLabel).length
    ? getDefaultTimeSlots(fallbackLabel)
    : DEFAULT_TIME_SLOTS_BY_LABEL["8 Hours"];
}

function inferTimeLabelFromSlots(slots = []) {
  const normalized = Array.isArray(slots)
    ? slots.map((slot) => cleanText(slot)).filter(Boolean)
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

function isEventPackage(type = "") {
  return type === "event_package";
}

function usesVariations(type = "") {
  return type === "resort_venue" || type === "hotel_condo" || type === "event_package";
}

function cleanVariants(value, type = "") {
  const variants = toArray(value);
  if (!Array.isArray(variants)) return [];

  return variants
    .map((item, index) => {
      const price = cleanNumber(item?.price, 0);

      if (isEventPackage(type)) {
        const eventPax = cleanNumber(item?.pax || parsePaxFromLabel(item?.label), 0);
        const timeVariationLabel = normalizeTimeLabel(
          item?.timeVariationLabel || item?.duration || item?.timeLabel || "8 Hours"
        );
        const timeSlots = cleanTimeSlots(item?.timeSlots, timeVariationLabel);
        const finalTimeLabel = inferTimeLabelFromSlots(timeSlots) || timeVariationLabel;
        const capacityLabel = normalizeCapacityLabel(
          eventPax ? `${eventPax} Pax` : item?.label
        );
        const label = `${capacityLabel} - ${finalTimeLabel}`;

        return {
          label,
          pax: eventPax,
          price,
          timeSlots,
          displayOrder: Number.isFinite(Number(item?.displayOrder))
            ? Number(item.displayOrder)
            : index + 1,
          isActive: item?.isActive === false || item?.isActive === "false" ? false : true,
        };
      }

      const label = normalizeTimeLabel(item?.label);

      return {
        label,
        pax: 0,
        price,
        timeSlots: getDefaultTimeSlots(label),
        displayOrder: Number.isFinite(Number(item?.displayOrder))
          ? Number(item.displayOrder)
          : index + 1,
        isActive: item?.isActive === false || item?.isActive === "false" ? false : true,
      };
    })
    .filter((item) => item.label);
}

function getPackageImageUrl(req, packageId) {
  const protocol = req.protocol || "http";
  const host = req.get("host");

  if (!host || !packageId) return "";

  return `${protocol}://${host}/api/hotel/packages/${packageId}/image`;
}

function hasStoredPackageImage(pkg = {}) {
  return Boolean(
    pkg?.packageImage &&
      pkg.packageImage.contentType &&
      Number(pkg.packageImage.size || 0) > 0
  );
}

function withImageUrl(req, pkg) {
  const plain = typeof pkg?.toObject === "function" ? pkg.toObject() : { ...pkg };

  if (plain.packageImage?.data) {
    delete plain.packageImage.data;
  }

  if (hasStoredPackageImage(plain)) {
    plain.imageUrl = getPackageImageUrl(req, plain._id);
  } else {
    plain.imageUrl = "";
  }

  return plain;
}

function uploadedImagePayload(file) {
  if (!file) return null;

  return {
    data: file.buffer,
    contentType: file.mimetype || "",
    filename: file.originalname || "package-image",
    size: Number(file.size || 0),
    uploadedAt: new Date(),
  };
}

function buildPayload(body = {}) {
  const type = cleanText(body.type) || "resort_venue";
  const variants = cleanVariants(body.variants, type);

  return {
    type,
    title: cleanText(body.title),
    subtitle: cleanText(body.subtitle),
    description: cleanText(body.description),
    duration:
      cleanText(body.duration) ||
      variants.map((item) => item.label).join(" / "),
    price:
      body.price !== undefined && body.price !== null && body.price !== ""
        ? cleanNumber(body.price, 0)
        : variants[0]?.price || 0,
    variants,
    capacity: cleanText(body.capacity),
    availableVenues: isEventPackage(type) ? cleanVenues(body.availableVenues) : [],
    inclusions: cleanStringArray(body.inclusions),
    imageUrl: "",
    displayOrder: Number.isFinite(Number(body.displayOrder))
      ? Number(body.displayOrder)
      : 0,
    isActive: parseBoolean(body.isActive, true),
  };
}

function validatePayload(payload) {
  if (!PACKAGE_TYPES.has(payload.type)) return "Invalid package type.";
  if (!payload.title) return "Package title is required.";

  if (isEventPackage(payload.type) && !payload.availableVenues.length) {
    return "Please select at least one available venue for this event package.";
  }

  if (usesVariations(payload.type)) {
    if (!payload.variants.length) {
      return "At least one variation is required.";
    }

    for (const variant of payload.variants) {
      if (!variant.label) return "Each variation must have a label.";

      if (!Number.isFinite(Number(variant.price)) || Number(variant.price) < 0) {
        return `Invalid price for variation ${variant.label}.`;
      }

      if (isEventPackage(payload.type)) {
        if (!Number(variant.pax || parsePaxFromLabel(variant.label))) {
          return `Invalid event pax for variation "${variant.label}". Enter a pax number like 50, 80, or 100.`;
        }

        if (!Array.isArray(variant.timeSlots) || !variant.timeSlots.length) {
          return `Invalid event time variation for "${variant.label}". Choose 8 Hours, 12 Hours, 22 Hours, or provide time slots.`;
        }
      } else if (!variant.timeSlots.length) {
        return `Invalid time variation "${variant.label}". Use 8 Hours, 12 Hours, or 22 Hours.`;
      }
    }
  }

  return "";
}

export const getPublicHotelServicePackages = async (req, res) => {
  try {
    const type = cleanText(req.query.type || "");
    const query = { isActive: true };

    if (type) query.type = type;

    const packages = await HotelServicePackage.find(query).sort({
      type: 1,
      displayOrder: 1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      packages: packages.map((pkg) => withImageUrl(req, pkg)),
    });
  } catch (error) {
    console.error("getPublicHotelServicePackages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load packages.",
    });
  }
};

export const getAdminHotelServicePackages = async (req, res) => {
  try {
    const packages = await HotelServicePackage.find().sort({
      type: 1,
      displayOrder: 1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      packages: packages.map((pkg) => withImageUrl(req, pkg)),
    });
  } catch (error) {
    console.error("getAdminHotelServicePackages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load packages.",
    });
  }
};

export const getHotelServicePackageImage = async (req, res) => {
  try {
    const { packageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID.",
      });
    }

    const pkg = await HotelServicePackage.findById(packageId).select(
      "+packageImage.data packageImage.contentType packageImage.filename packageImage.size"
    );

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: "Package not found.",
      });
    }

    if (!pkg.packageImage?.data) {
      return res.status(404).json({
        success: false,
        message: "No package image uploaded.",
      });
    }

    res.setHeader("Content-Type", pkg.packageImage.contentType || "image/jpeg");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(pkg.packageImage.filename || "package-image")}"`
    );
    res.setHeader("Cache-Control", "public, max-age=86400");

    return res.send(pkg.packageImage.data);
  } catch (error) {
    console.error("getHotelServicePackageImage error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load package image.",
    });
  }
};

export const createHotelServicePackage = async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    const imagePayload = uploadedImagePayload(req.file);

    if (imagePayload) {
      payload.packageImage = imagePayload;
    }

    const error = validatePayload(payload);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const createdPackage = await HotelServicePackage.create(payload);

    return res.status(201).json({
      success: true,
      message: "Package created successfully.",
      package: withImageUrl(req, createdPackage),
    });
  } catch (error) {
    console.error("createHotelServicePackage error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create package.",
    });
  }
};

export const updateHotelServicePackage = async (req, res) => {
  try {
    const { packageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID.",
      });
    }

    const payload = buildPayload(req.body);
    const imagePayload = uploadedImagePayload(req.file);
    const removePackageImage = parseBoolean(req.body.removePackageImage, false);

    if (imagePayload) {
      payload.packageImage = imagePayload;
      payload.imageUrl = "";
    } else if (removePackageImage) {
      payload.packageImage = {
        data: null,
        contentType: "",
        filename: "",
        size: 0,
        uploadedAt: null,
      };
      payload.imageUrl = "";
    }

    const error = validatePayload(payload);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const updatedPackage = await HotelServicePackage.findByIdAndUpdate(
      packageId,
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found.",
      });
    }

    return res.json({
      success: true,
      message: "Package updated successfully.",
      package: withImageUrl(req, updatedPackage),
    });
  } catch (error) {
    console.error("updateHotelServicePackage error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update package.",
    });
  }
};

export const setHotelServicePackageStatus = async (req, res) => {
  try {
    const { packageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID.",
      });
    }

    const updatedPackage = await HotelServicePackage.findByIdAndUpdate(
      packageId,
      { $set: { isActive: parseBoolean(req.body.isActive, false) } },
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found.",
      });
    }

    return res.json({
      success: true,
      message: updatedPackage.isActive
        ? "Package activated successfully."
        : "Package deactivated successfully.",
      package: withImageUrl(req, updatedPackage),
    });
  } catch (error) {
    console.error("setHotelServicePackageStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update package status.",
    });
  }
};

export const deleteHotelServicePackage = async (req, res) => {
  try {
    const { packageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID.",
      });
    }

    const deletedPackage = await HotelServicePackage.findByIdAndDelete(packageId);

    if (!deletedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found.",
      });
    }

    return res.json({
      success: true,
      message: "Package deleted successfully.",
    });
  } catch (error) {
    console.error("deleteHotelServicePackage error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete package.",
    });
  }
};

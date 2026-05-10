import mongoose from "mongoose";
import ManpowerHighlight from "../models/ManpowerHighlight.js";
import {
  uploadBufferToManpowerGridFS,
  deleteFileFromManpowerGridFS,
} from "../utils/manpowerGridfs.js";

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseBoolean(value, fallback = true) {
  if (typeof value === "boolean") return value;

  const text = String(value ?? "").trim().toLowerCase();

  if (["true", "1", "yes", "active", "on"].includes(text)) return true;
  if (["false", "0", "no", "inactive", "off"].includes(text)) return false;

  return fallback;
}

function parseSortOrder(value = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function isValidObjectId(value = "") {
  return mongoose.Types.ObjectId.isValid(String(value || "").trim());
}

function buildImageUrl(image = {}) {
  const fileId = image?.fileId ? String(image.fileId) : "";
  return fileId ? `/manpower/files/${fileId}` : "";
}

function buildHighlightPayload(row) {
  if (!row) return null;

  return {
    _id: row._id,
    title: row.title || "",
    subtitle: row.subtitle || "",
    active: row.active !== false,
    sortOrder: Number(row.sortOrder || 0),
    image: row.image || null,
    imageUrl: buildImageUrl(row.image),
    createdBy: row.createdBy || "",
    updatedBy: row.updatedBy || "",
    createdAt: row.createdAt || null,
    updatedAt: row.updatedAt || null,
  };
}

async function uploadHighlightImage(file) {
  if (!file?.buffer) return null;

  const mimetype = String(file.mimetype || "").toLowerCase();

  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowed.includes(mimetype)) {
    const error = new Error("Highlight image must be JPG, JPEG, PNG, or WEBP.");
    error.status = 400;
    throw error;
  }

  return uploadBufferToManpowerGridFS({
    buffer: file.buffer,
    filename: `manpower-highlight-${Date.now()}-${file.originalname}`,
    originalName: file.originalname || "highlight-image",
    contentType: mimetype,
    mimetype,
    size: Number(file.size || 0),
    folder: "manpower-highlights",
  });
}

async function safeDeleteHighlightImage(image = {}) {
  const fileId = image?.fileId ? String(image.fileId) : "";

  if (!fileId) return;

  try {
    await deleteFileFromManpowerGridFS(fileId);
  } catch (error) {
    console.error("Failed to delete old highlight image:", error);
  }
}

export async function listPublicManpowerHighlights(_req, res) {
  try {
    const highlights = await ManpowerHighlight.find({ active: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return res.json({
      highlights: highlights.map(buildHighlightPayload),
    });
  } catch (error) {
    console.error("listPublicManpowerHighlights error:", error);

    return res.status(500).json({
      message: "Failed to load manpower highlights.",
    });
  }
}

export async function listAdminManpowerHighlights(req, res) {
  try {
    const search = cleanText(req.query?.search);
    const status = cleanText(req.query?.status).toLowerCase();

    const query = {};

    if (status === "active") query.active = true;
    if (status === "inactive") query.active = false;

    if (search) {
      const regex = new RegExp(
        String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      query.$or = [{ title: regex }, { subtitle: regex }];
    }

    const highlights = await ManpowerHighlight.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return res.json({
      highlights: highlights.map(buildHighlightPayload),
    });
  } catch (error) {
    console.error("listAdminManpowerHighlights error:", error);

    return res.status(500).json({
      message: "Failed to load highlights.",
    });
  }
}

export async function createManpowerHighlight(req, res) {
  try {
    const title = cleanText(req.body?.title);
    const subtitle = cleanText(req.body?.subtitle);
    const active = parseBoolean(req.body?.active, true);
    const sortOrder = parseSortOrder(req.body?.sortOrder);

    if (!req.file?.buffer) {
      return res.status(400).json({
        message: "Please upload a highlight image.",
      });
    }

    const uploadedImage = await uploadHighlightImage(req.file);

    const highlight = await ManpowerHighlight.create({
      title,
      subtitle,
      active,
      sortOrder,
      image: uploadedImage,
      createdBy: req.manpowerAdmin?.username || "admin",
      updatedBy: req.manpowerAdmin?.username || "admin",
    });

    return res.status(201).json({
      message: "Highlight created successfully.",
      highlight: buildHighlightPayload(highlight),
    });
  } catch (error) {
    console.error("createManpowerHighlight error:", error);

    return res.status(error?.status || 500).json({
      message: error?.message || "Failed to create highlight.",
    });
  }
}

export async function updateManpowerHighlight(req, res) {
  try {
    const highlightId = cleanText(req.params?.highlightId);

    if (!isValidObjectId(highlightId)) {
      return res.status(400).json({
        message: "Invalid highlight id.",
      });
    }

    const highlight = await ManpowerHighlight.findById(highlightId);

    if (!highlight) {
      return res.status(404).json({
        message: "Highlight not found.",
      });
    }

    const previousImage = highlight.image?.fileId
      ? highlight.image.toObject?.() || highlight.image
      : null;

    highlight.title = cleanText(req.body?.title);
    highlight.subtitle = cleanText(req.body?.subtitle);
    highlight.active = parseBoolean(req.body?.active, highlight.active !== false);
    highlight.sortOrder = parseSortOrder(req.body?.sortOrder);
    highlight.updatedBy = req.manpowerAdmin?.username || "admin";

    if (req.file?.buffer) {
      const uploadedImage = await uploadHighlightImage(req.file);
      highlight.image = uploadedImage;
    }

    await highlight.save();

    if (req.file?.buffer && previousImage?.fileId) {
      await safeDeleteHighlightImage(previousImage);
    }

    return res.json({
      message: "Highlight updated successfully.",
      highlight: buildHighlightPayload(highlight),
    });
  } catch (error) {
    console.error("updateManpowerHighlight error:", error);

    return res.status(error?.status || 500).json({
      message: error?.message || "Failed to update highlight.",
    });
  }
}

export async function updateManpowerHighlightStatus(req, res) {
  try {
    const highlightId = cleanText(req.params?.highlightId);

    if (!isValidObjectId(highlightId)) {
      return res.status(400).json({
        message: "Invalid highlight id.",
      });
    }

    const active = req.body?.active;

    if (typeof active !== "boolean") {
      return res.status(400).json({
        message: "Active status must be true or false.",
      });
    }

    const highlight = await ManpowerHighlight.findByIdAndUpdate(
      highlightId,
      {
        active,
        updatedBy: req.manpowerAdmin?.username || "admin",
      },
      { new: true }
    ).lean();

    if (!highlight) {
      return res.status(404).json({
        message: "Highlight not found.",
      });
    }

    return res.json({
      message: active
        ? "Highlight activated successfully."
        : "Highlight deactivated successfully.",
      highlight: buildHighlightPayload(highlight),
    });
  } catch (error) {
    console.error("updateManpowerHighlightStatus error:", error);

    return res.status(500).json({
      message: "Failed to update highlight status.",
    });
  }
}

export async function deleteManpowerHighlight(req, res) {
  try {
    const highlightId = cleanText(req.params?.highlightId);

    if (!isValidObjectId(highlightId)) {
      return res.status(400).json({
        message: "Invalid highlight id.",
      });
    }

    const highlight = await ManpowerHighlight.findById(highlightId);

    if (!highlight) {
      return res.status(404).json({
        message: "Highlight not found.",
      });
    }

    const imageToDelete = highlight.image?.fileId
      ? highlight.image.toObject?.() || highlight.image
      : null;

    await ManpowerHighlight.findByIdAndDelete(highlightId);

    if (imageToDelete?.fileId) {
      await safeDeleteHighlightImage(imageToDelete);
    }

    return res.json({
      message: "Highlight deleted successfully.",
    });
  } catch (error) {
    console.error("deleteManpowerHighlight error:", error);

    return res.status(500).json({
      message: "Failed to delete highlight.",
    });
  }
}
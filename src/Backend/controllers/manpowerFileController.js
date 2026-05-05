import mongoose from "mongoose";
import ManpowerApplication from "../models/ManpowerApplication.js";
import {
  findManpowerFileById,
  openManpowerGridFSDownloadStream,
} from "../utils/manpowerGridfs.js";

const ALLOWED_REQUIREMENT_KEYS = [
  "validId",
  "resume",
  "nbi",
  "barangayClearance",
  "sss",
  "philhealth",
  "pagibig",
  "tin",
  "transcriptOfRecords",
  "diploma",
  "birthCertificate",
  "photo1x1",
  "photo2x2",
];

function isValidObjectId(value = "") {
  return mongoose.Types.ObjectId.isValid(String(value || "").trim());
}

function buildInlineDisposition(filename = "file") {
  const safeAscii = String(filename || "file").replace(/["\\\r\n]/g, "_");
  const utf8 = encodeURIComponent(String(filename || "file"));
  return `inline; filename="${safeAscii}"; filename*=UTF-8''${utf8}`;
}

export async function getManpowerApplicationRequirementFile(req, res) {
  try {
    const applicationId = String(req.params?.id || "").trim();
    const requirementKey = String(req.params?.key || "").trim();

    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({ message: "Invalid application id." });
    }

    if (!ALLOWED_REQUIREMENT_KEYS.includes(requirementKey)) {
      return res.status(400).json({ message: "Invalid requirement key." });
    }

    const application = await ManpowerApplication.findById(applicationId)
      .select("requirements firstName lastName email vacancy")
      .lean();

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    const fileMeta = application?.requirements?.[requirementKey];
    const fileId = fileMeta?.fileId ? String(fileMeta.fileId) : "";

    if (!fileId || !isValidObjectId(fileId)) {
      return res.status(404).json({ message: "Uploaded file not found." });
    }

    const fileDoc = await findManpowerFileById(fileId);

    if (!fileDoc) {
      return res.status(404).json({ message: "File data not found." });
    }

    const contentType =
      fileMeta?.mimetype ||
      fileDoc?.contentType ||
      fileDoc?.metadata?.mimetype ||
      "application/octet-stream";

    const originalName =
      fileMeta?.originalName ||
      fileDoc?.metadata?.originalName ||
      fileDoc?.filename ||
      `${requirementKey}-file`;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", buildInlineDisposition(originalName));

    const downloadStream = openManpowerGridFSDownloadStream(fileId);

    downloadStream.on("error", (error) => {
      console.error("getManpowerApplicationRequirementFile stream error:", error);

      if (!res.headersSent) {
        return res.status(404).json({ message: "File data not found." });
      }

      res.end();
    });

    return downloadStream.pipe(res);
  } catch (error) {
    console.error("getManpowerApplicationRequirementFile error:", error);
    return res.status(500).json({
      message: "Failed to load uploaded requirement file.",
    });
  }
}

export async function streamManpowerFileById(req, res) {
  try {
    const fileId = String(req.params?.fileId || "").trim();

    if (!isValidObjectId(fileId)) {
      return res.status(400).json({ message: "Invalid file id." });
    }

    const fileDoc = await findManpowerFileById(fileId);

    if (!fileDoc) {
      return res.status(404).json({ message: "File not found." });
    }

    const contentType =
      fileDoc?.contentType ||
      fileDoc?.metadata?.mimetype ||
      "application/octet-stream";

    const originalName =
      fileDoc?.metadata?.originalName ||
      fileDoc?.filename ||
      "file";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", buildInlineDisposition(originalName));

    const downloadStream = openManpowerGridFSDownloadStream(fileId);

    downloadStream.on("error", (error) => {
      console.error("streamManpowerFileById stream error:", error);

      if (!res.headersSent) {
        return res.status(404).json({ message: "Error streaming file." });
      }

      res.end();
    });

    return downloadStream.pipe(res);
  } catch (error) {
    console.error("streamManpowerFileById error:", error);
    return res.status(500).json({
      message: "Failed to stream file.",
    });
  }
}
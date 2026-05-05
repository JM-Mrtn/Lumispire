import { ObjectId } from "mongodb";
import { getTrainingGridFSBucket } from "../utils/trainingGridfs.js";
import {
  isTrainingProtectedFolder,
  resolveTrainingViewer,
} from "../utils/trainingViewerAccess.js";

async function findFileInBucket(bucket, id) {
  return bucket.find({ _id: new ObjectId(id) }).toArray();
}

function buildInlineDisposition(filename = "file") {
  const safeAscii = String(filename || "file").replace(/["\\\r\n]/g, "_");
  const utf8 = encodeURIComponent(String(filename || "file"));
  return `inline; filename="${safeAscii}"; filename*=UTF-8''${utf8}`;
}

function getContentType(file) {
  return (
    file.contentType ||
    file.metadata?.mimetype ||
    file.metadata?.mimeType ||
    "application/octet-stream"
  );
}

function getOriginalName(file) {
  return file.metadata?.originalName || file.filename || "file";
}

function clearFrameBlockingHeaders(res) {
  // Helmet can add these globally. Training files must be embeddable in the
  // React module modal so PDFs/images can be viewed without opening a new tab.
  res.removeHeader("X-Frame-Options");
  res.removeHeader("Content-Security-Policy");
  res.removeHeader("Cross-Origin-Embedder-Policy");
  res.removeHeader("Cross-Origin-Opener-Policy");
}

function setCommonStreamHeaders(req, res, file) {
  const origin = String(req.headers.origin || "").trim();
  const contentType = getContentType(file);
  const originalName = getOriginalName(file);

  clearFrameBlockingHeaders(res);

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", buildInlineDisposition(originalName));
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Vary", "Origin");
  res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

function parseRangeHeader(rangeHeader = "", fileLength = 0) {
  const range = String(rangeHeader || "").trim();
  if (!range || !range.startsWith("bytes=")) return null;

  const [rawStart = "", rawEnd = ""] = range.replace("bytes=", "").split("-");
  let start = rawStart ? Number(rawStart) : 0;
  let end = rawEnd ? Number(rawEnd) : fileLength - 1;

  if (!Number.isFinite(start) || start < 0) start = 0;
  if (!Number.isFinite(end) || end >= fileLength) end = fileLength - 1;

  if (start > end || start >= fileLength) return null;

  return { start, end };
}

export async function streamTrainingUploadedFile(req, res) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid training file id.",
      });
    }

    const trainingBucket = getTrainingGridFSBucket();
    const files = await findFileInBucket(trainingBucket, id);

    if (!files.length) {
      return res.status(404).json({
        success: false,
        message: "Training file not found.",
      });
    }

    const file = files[0];
    const folder = String(file?.metadata?.folder || "").trim();

    if (isTrainingProtectedFolder(folder)) {
      const viewer = await resolveTrainingViewer(req);

      if (!viewer) {
        return res.status(401).json({
          success: false,
          message: "Authorized training access is required to view this file.",
        });
      }
    }

    const objectId = new ObjectId(id);
    const fileLength = Number(file.length || file.metadata?.size || 0);
    const requestedRange = parseRangeHeader(req.headers.range, fileLength);

    setCommonStreamHeaders(req, res, file);
    res.setHeader("Accept-Ranges", "bytes");

    let downloadStream;

    if (requestedRange && fileLength > 0) {
      const { start, end } = requestedRange;
      const chunkSize = end - start + 1;

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileLength}`);
      res.setHeader("Content-Length", String(chunkSize));

      downloadStream = trainingBucket.openDownloadStream(objectId, {
        start,
        end: end + 1,
      });
    } else {
      if (fileLength > 0) {
        res.setHeader("Content-Length", String(fileLength));
      }

      downloadStream = trainingBucket.openDownloadStream(objectId);
    }

    downloadStream.on("error", (err) => {
      console.error("Training GridFS download error:", err);

      if (!res.headersSent) {
        return res.status(404).json({
          success: false,
          message: "Error streaming training file.",
        });
      }

      res.end();
    });

    return downloadStream.pipe(res);
  } catch (error) {
    console.error("streamTrainingUploadedFile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to stream training file.",
    });
  }
}

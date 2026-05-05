import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".pdf"]);

function getFileExtension(filename = "") {
  return path.extname(String(filename || "")).toLowerCase();
}

function fileFilter(_req, file, cb) {
  const mime = String(file?.mimetype || "").toLowerCase();
  const ext = getFileExtension(file?.originalname || "");

  if (allowedMimeTypes.includes(mime) || allowedExtensions.has(ext)) {
    return cb(null, true);
  }

  return cb(new Error("Only JPG, JPEG, PNG, WEBP, and PDF files are allowed."));
}

const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
}).single("proofFile");

function getFriendlyMulterMessage(err) {
  if (!err) return "Attendance proof upload failed.";

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return `Attendance proof file must be ${MAX_FILE_SIZE_MB}MB or less.`;
      case "LIMIT_UNEXPECTED_FILE":
        return "Unexpected upload field.";
      default:
        return err.message || "Attendance proof upload failed.";
    }
  }

  return err.message || "Attendance proof upload failed.";
}

export function trainingAttendanceProofUpload(req, res, next) {
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: getFriendlyMulterMessage(err),
        field: "proofFile",
      });
    }

    return next();
  });
}

export default trainingAttendanceProofUpload;

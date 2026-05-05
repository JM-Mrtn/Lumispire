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
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
  ".doc",
  ".docx",
]);

function getFileExtension(filename = "") {
  return path.extname(String(filename || "")).toLowerCase();
}

function fileFilter(_req, file, cb) {
  const mime = String(file?.mimetype || "").toLowerCase();
  const ext = getFileExtension(file?.originalname || "");

  if (allowedMimeTypes.includes(mime) || allowedExtensions.has(ext)) {
    return cb(null, true);
  }

  return cb(
    new Error("Only JPG, JPEG, PNG, WEBP, PDF, DOC, and DOCX files are allowed.")
  );
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

const uploadFieldsMiddleware = upload.fields([
  { name: "birthCertificate", maxCount: 1 },
  { name: "form137138", maxCount: 1 },
  { name: "diplomaTor", maxCount: 1 },
  { name: "picture2x2", maxCount: 1 },
  { name: "marriageContract", maxCount: 1 },
  { name: "applicationForm", maxCount: 1 },
]);

function getFriendlyMulterMessage(err) {
  if (!err) return "File upload error.";

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return `Each file must be ${MAX_FILE_SIZE_MB}MB or less.`;
      case "LIMIT_UNEXPECTED_FILE":
        return err.field
          ? `Unexpected file field: ${err.field}.`
          : "Unexpected file upload field.";
      case "LIMIT_FILE_COUNT":
        return "Too many files uploaded.";
      case "LIMIT_PART_COUNT":
        return "Too many form parts were submitted.";
      case "LIMIT_FIELD_KEY":
        return "One of the form field names is too long.";
      case "LIMIT_FIELD_VALUE":
        return "One of the form field values is too long.";
      case "LIMIT_FIELD_COUNT":
        return "Too many non-file fields were submitted.";
      default:
        return err.message || "File upload error.";
    }
  }

  return err.message || "File upload error.";
}

export function trainingEnrollmentUpload(req, res, next) {
  uploadFieldsMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: getFriendlyMulterMessage(err),
        field: err.field || "",
      });
    }

    return next();
  });
}

export default trainingEnrollmentUpload;

import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function getFileExtension(filename = "") {
  return path.extname(String(filename || "")).toLowerCase();
}

function fileFilter(_req, file, cb) {
  const mime = String(file?.mimetype || "").toLowerCase();
  const ext = getFileExtension(file?.originalname || "");

  if (allowedMimeTypes.includes(mime) || allowedExtensions.has(ext)) {
    return cb(null, true);
  }

  return cb(new Error("Only JPG, JPEG, PNG, and WEBP image files are allowed."));
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

function getFriendlyMulterMessage(err) {
  if (!err) return "Profile photo upload failed.";

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return `Profile photo must be ${MAX_FILE_SIZE_MB}MB or less.`;
      case "LIMIT_UNEXPECTED_FILE":
        return "Unexpected upload field.";
      default:
        return err.message || "Profile photo upload failed.";
    }
  }

  return err.message || "Profile photo upload failed.";
}

const uploadSingle = upload.single("profilePhoto");

export function trainingProfilePhotoUpload(req, res, next) {
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: getFriendlyMulterMessage(err),
        field: "profilePhoto",
      });
    }

    return next();
  });
}

export default trainingProfilePhotoUpload;

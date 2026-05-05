import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILE_COUNT = 5;

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const allowedExtensions = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".txt",
  ".xls",
  ".xlsx",
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
    new Error(
      "Only PDF, JPG, JPEG, PNG, WEBP, GIF, DOC, DOCX, PPT, PPTX, TXT, XLS, and XLSX files are allowed."
    )
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
  { name: "submissionFiles", maxCount: MAX_FILE_COUNT },
  { name: "submissionFile", maxCount: MAX_FILE_COUNT }, // legacy support
]);

function getFriendlyMulterMessage(err) {
  if (!err) return "Assignment submission upload failed.";

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return `Each submission file must be ${MAX_FILE_SIZE_MB}MB or less.`;
      case "LIMIT_UNEXPECTED_FILE":
        return "Unexpected upload field.";
      case "LIMIT_FILE_COUNT":
        return `You can upload up to ${MAX_FILE_COUNT} submission files only.`;
      default:
        return err.message || "Assignment submission upload failed.";
    }
  }

  return err.message || "Assignment submission upload failed.";
}

export function trainingAssessmentSubmissionUpload(req, res, next) {
  uploadFieldsMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: getFriendlyMulterMessage(err),
        field: "submissionFiles",
      });
    }

    const files = [
      ...(req?.files?.submissionFiles || []),
      ...(req?.files?.submissionFile || []),
    ];

    if (files.length > MAX_FILE_COUNT) {
      return res.status(400).json({
        success: false,
        message: `You can upload up to ${MAX_FILE_COUNT} submission files only.`,
        field: "submissionFiles",
      });
    }

    return next();
  });
}

export default trainingAssessmentSubmissionUpload;

import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
]);

const profilePhotoMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function fileFilter(_req, file, cb) {
  const mimetype = String(file?.mimetype || "").toLowerCase();

  if (!allowedMimeTypes.has(mimetype)) {
    return cb(
      new Error(
        "Invalid file type. Please upload JPG, JPEG, PNG, WEBP, PDF, or TXT files only."
      )
    );
  }

  return cb(null, true);
}

function profilePhotoFilter(_req, file, cb) {
  const mimetype = String(file?.mimetype || "").toLowerCase();

  if (!profilePhotoMimeTypes.has(mimetype)) {
    return cb(
      new Error("Invalid profile photo. Please upload JPG, JPEG, PNG, or WEBP only.")
    );
  }

  return cb(null, true);
}

export const manpowerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 20,
  },
});

export const manpowerProfilePhotoUpload = multer({
  storage,
  fileFilter: profilePhotoFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

export const manpowerRequirementUpload = manpowerUpload.fields([
  { name: "validId", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "nbi", maxCount: 1 },
  { name: "barangayClearance", maxCount: 1 },
  { name: "sss", maxCount: 1 },
  { name: "philhealth", maxCount: 1 },
  { name: "pagibig", maxCount: 1 },
  { name: "tin", maxCount: 1 },
  { name: "transcriptOfRecords", maxCount: 1 },
  { name: "diploma", maxCount: 1 },
  { name: "birthCertificate", maxCount: 1 },
  { name: "photo1x1", maxCount: 1 },
  { name: "photo2x2", maxCount: 1 },
]);
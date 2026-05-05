import fs from "fs";
import path from "path";
import multer from "multer";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const profileDir = path.join(process.cwd(), "uploads", "profile-pictures");
const hotelIdDir = path.join(process.cwd(), "uploads", "hotel-id-verifications");

ensureDir(profileDir);
ensureDir(hotelIdDir);

function imageOnly(_req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."));
  }

  cb(null, true);
}

function imageOrPdf(_req, file, cb) {
  const ok =
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf";

  if (!ok) {
    return cb(new Error("Only image or PDF files are allowed."));
  }

  cb(null, true);
}

const profileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, profileDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const hotelIdStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, hotelIdDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `hotel-id-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const bookingProofStorage = multer.memoryStorage();

export const uploadHotelProfilePicture = multer({
  storage: profileStorage,
  fileFilter: imageOnly,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadHotelIdVerification = multer({
  storage: hotelIdStorage,
  fileFilter: imageOrPdf,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadHotelBookingProof = multer({
  storage: bookingProofStorage,
  fileFilter: imageOrPdf,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default {
  uploadHotelProfilePicture,
  uploadHotelIdVerification,
  uploadHotelBookingProof,
}; 
import multer from "multer";

const imageMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function fileFilter(_req, file, cb) {
  if (imageMimeTypes.has(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error("Only JPG, PNG, WEBP, and GIF images are allowed."));
}

const ltcUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
});

export default ltcUpload;

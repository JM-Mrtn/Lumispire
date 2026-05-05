import express from "express";
import multer from "multer";
import requireHotelAdmin from "../middleware/requireHotelAdmin.js";
import {
  getPublicHotelServicePackages,
  getAdminHotelServicePackages,
  getHotelServicePackageImage,
  createHotelServicePackage,
  updateHotelServicePackage,
  setHotelServicePackageStatus,
  deleteHotelServicePackage,
} from "../controllers/hotelServicePackageController.js";

const router = express.Router();

const uploadPackageImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."));
    }

    cb(null, true);
  },
});

/* Public active packages */
router.get("/packages", getPublicHotelServicePackages);
router.get("/packages/:packageId/image", getHotelServicePackageImage);

/* Admin package management */
router.get("/admin/packages", requireHotelAdmin, getAdminHotelServicePackages);
router.post(
  "/admin/packages",
  requireHotelAdmin,
  uploadPackageImage.single("packageImage"),
  createHotelServicePackage
);
router.put(
  "/admin/packages/:packageId",
  requireHotelAdmin,
  uploadPackageImage.single("packageImage"),
  updateHotelServicePackage
);
router.patch(
  "/admin/packages/:packageId/status",
  requireHotelAdmin,
  setHotelServicePackageStatus
);
router.delete(
  "/admin/packages/:packageId",
  requireHotelAdmin,
  deleteHotelServicePackage
);

/* Multer error handler */
router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Image must be 5MB or smaller.",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || "Upload error.",
    });
  }

  if (err?.message === "Only JPG, JPEG, PNG, and WEBP images are allowed.") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return next(err);
});

export default router;

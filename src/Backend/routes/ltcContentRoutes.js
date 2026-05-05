import express from "express";
import requireLtcAdmin from "../middleware/requireLtcAdmin.js";
import ltcUpload from "../middleware/ltcUpload.js";
import {
  getLtcAdminContent,
  getPublicLtcContent,
  ltcAdminLogin,
  updateLtcAdminContent,
  uploadLtcHighlightImage,
} from "../controllers/ltcContentController.js";

const router = express.Router();

router.get("/public-content", getPublicLtcContent);
router.post("/admin/login", ltcAdminLogin);
router.get("/admin/content", requireLtcAdmin, getLtcAdminContent);
router.put("/admin/content", requireLtcAdmin, updateLtcAdminContent);
router.post(
  "/admin/upload-highlight-image",
  requireLtcAdmin,
  ltcUpload.single("image"),
  uploadLtcHighlightImage
);

export default router;

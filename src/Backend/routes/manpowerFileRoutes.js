import express from "express";
import {
  getManpowerApplicationRequirementFile,
  streamManpowerFileById,
} from "../controllers/manpowerFileController.js";

const router = express.Router();

router.get("/applications/:id/requirement/:key", getManpowerApplicationRequirementFile);
router.get("/:fileId", streamManpowerFileById);

export default router;

import express from "express";
import verifyTrainingAdmin from "../middleware/verifyTrainingAdmin.js";
import {
  listAdminBatches,
  createAdminBatch,
  updateAdminBatch,
  updateAdminBatchStatus,
  deleteAdminBatch,
} from "../controllers/trainingBatchController.js";

const router = express.Router();

router.use(verifyTrainingAdmin);
router.get("/", listAdminBatches);
router.post("/", createAdminBatch);
router.put("/:id", updateAdminBatch);
router.patch("/:id", updateAdminBatch);
router.patch("/:id/status", updateAdminBatchStatus);
router.delete("/:id", deleteAdminBatch);

export default router;

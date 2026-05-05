import express from "express";
import verifyTrainingAdmin from "../middleware/verifyTrainingAdmin.js";
import {
  listAdminProfessors,
  createAdminProfessor,
  updateAdminProfessor,
  deactivateAdminProfessor,
  activateAdminProfessor,
  resetAdminProfessorPassword,
} from "../controllers/adminProfessorController.js";

const router = express.Router();

router.use(verifyTrainingAdmin);
router.get("/", listAdminProfessors);
router.post("/", createAdminProfessor);
router.put("/:id", updateAdminProfessor);
router.patch("/:id", updateAdminProfessor);
router.patch("/:id/reset-password", resetAdminProfessorPassword);
router.patch("/:id/deactivate", deactivateAdminProfessor);
router.patch("/:id/activate", activateAdminProfessor);

export default router;

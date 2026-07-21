import express from "express";
import {
  getLeads,
  updateLeadStatus,
  softDeleteLead,
  restoreLead,
  hardDeleteLead
} from "../controllers/lead.controller.js";

const router = express.Router();

router.get("/", getLeads);
router.put("/:id", updateLeadStatus);
router.delete("/:id/permanent", hardDeleteLead);
router.delete("/:id", softDeleteLead);
router.post("/:id/soft-delete", softDeleteLead);
router.patch("/:id/restore", restoreLead);
router.put("/:id/restore", restoreLead);
router.post("/:id/restore", restoreLead);

export default router;


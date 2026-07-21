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
router.delete("/:id", softDeleteLead);
router.patch("/:id/restore", restoreLead);
router.delete("/:id/permanent", hardDeleteLead);

export default router;


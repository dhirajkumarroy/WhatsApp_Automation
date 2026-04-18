import express from "express";
import {
  getLeads,
  updateLeadStatus
} from "../controllers/lead.controller.js";

const router = express.Router();

router.get("/", getLeads);
router.put("/:id", updateLeadStatus);

export default router;

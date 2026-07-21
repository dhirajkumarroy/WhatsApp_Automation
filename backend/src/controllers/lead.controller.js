import Lead from "../models/lead.model.js";
import {
  getLeadsService,
  softDeleteLeadService,
  restoreLeadService,
  hardDeleteLeadService
} from "../services/lead.service.js";

// GET all leads
export const getLeads = async (req, res) => {
  const { status, includeDeleted, onlyDeleted } = req.query;

  const showOnlyDeleted = onlyDeleted === "true" || status === "trash" || status === "deleted";
  const showIncludeDeleted = includeDeleted === "true";

  const leads = await getLeadsService({
    includeDeleted: showIncludeDeleted,
    onlyDeleted: showOnlyDeleted
  });

  res.json(leads);
};

// UPDATE status
export const updateLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const lead = await Lead.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  res.json(lead);
};

// SOFT DELETE lead
export const softDeleteLead = async (req, res) => {
  const { id } = req.params;
  const lead = await softDeleteLeadService(id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  res.json({ message: "Lead soft deleted successfully", lead });
};

// RESTORE lead
export const restoreLead = async (req, res) => {
  const { id } = req.params;
  const lead = await restoreLeadService(id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  res.json({ message: "Lead restored successfully", lead });
};

// HARD / PERMANENT DELETE lead
export const hardDeleteLead = async (req, res) => {
  const { id } = req.params;
  const lead = await hardDeleteLeadService(id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  res.json({ message: "Lead permanently deleted successfully", lead });
};
import mongoose from "mongoose";
import Lead from "../models/lead.model.js";
import {
  getLeadsService,
  softDeleteLeadService,
  restoreLeadService,
  hardDeleteLeadService
} from "../services/lead.service.js";

// GET all leads
export const getLeads = async (req, res, next) => {
  try {
    const { status, includeDeleted, onlyDeleted } = req.query;

    const showOnlyDeleted =
      onlyDeleted === "true" || status === "trash" || status === "deleted";
    const showIncludeDeleted = includeDeleted === "true";

    const leads = await getLeadsService({
      includeDeleted: showIncludeDeleted,
      onlyDeleted: showOnlyDeleted
    });

    res.json(leads);
  } catch (error) {
    next(error);
  }
};

// UPDATE status
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lead ID format" });
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    next(error);
  }
};

// DELETE lead (Soft delete by default, or permanent delete if ?permanent=true)
export const softDeleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lead ID format" });
    }

    if (permanent === "true") {
      const lead = await hardDeleteLeadService(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      return res.json({ message: "Lead permanently deleted successfully", lead });
    }

    const lead = await softDeleteLeadService(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead soft deleted successfully", lead });
  } catch (error) {
    next(error);
  }
};

// RESTORE lead
export const restoreLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lead ID format" });
    }

    const lead = await restoreLeadService(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead restored successfully", lead });
  } catch (error) {
    next(error);
  }
};

// HARD / PERMANENT DELETE lead
export const hardDeleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lead ID format" });
    }

    const lead = await hardDeleteLeadService(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead permanently deleted successfully", lead });
  } catch (error) {
    next(error);
  }
};

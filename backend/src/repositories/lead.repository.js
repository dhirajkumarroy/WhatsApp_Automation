import Lead from "../models/lead.model.js";

export const createLead = (data) => {
  return Lead.create(data);
};

export const findLeads = (query = {}) => {
  return Lead.find(query).sort({ createdAt: -1 });
};

export const findLeadById = (id) => {
  return Lead.findById(id);
};

export const softDeleteLeadById = (id) => {
  return Lead.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
};

export const restoreLeadById = (id) => {
  return Lead.findByIdAndUpdate(
    id,
    { isDeleted: false, deletedAt: null },
    { new: true }
  );
};

export const hardDeleteLeadById = (id) => {
  return Lead.findByIdAndDelete(id);
};
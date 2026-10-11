import {
  createLead,
  findLeads,
  findLeadById,
  softDeleteLeadById,
  restoreLeadById,
  hardDeleteLeadById,
} from "../repositories/lead.repository.js";

export const saveLead = async (data) => {
  return createLead(data);
};

export const getLeadsService = async ({
  includeDeleted = false,
  onlyDeleted = false,
} = {}) => {
  const query = {};
  if (onlyDeleted) {
    query.isDeleted = true;
  } else if (!includeDeleted) {
    query.isDeleted = { $ne: true };
  }
  return findLeads(query);
};

export const softDeleteLeadService = async (id) => {
  return softDeleteLeadById(id);
};

export const restoreLeadService = async (id) => {
  return restoreLeadById(id);
};

export const hardDeleteLeadService = async (id) => {
  return hardDeleteLeadById(id);
};

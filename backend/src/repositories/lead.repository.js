import Lead from "../models/lead.model.js";

export const createLead = (data) => {
  return Lead.create(data);
};
import Lead from "../models/lead.model.js";

export const saveLead = async (data) => {
  return Lead.create(data);
};

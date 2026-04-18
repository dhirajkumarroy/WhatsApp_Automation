import Lead from "../models/lead.model.js";

// GET all leads
export const getLeads = async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
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

  res.json(lead);
};
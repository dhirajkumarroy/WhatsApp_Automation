import Session from "../models/session.model.js";

export const getSession = (phone) => {
  return Session.findOne({ phone });
};

export const upsertSession = (phone, data) => {
  return Session.findOneAndUpdate(
    { phone },
    data,
    { upsert: true, new: true }
  );
};

export const deleteSession = (phone) => {
  return Session.deleteOne({ phone });
};
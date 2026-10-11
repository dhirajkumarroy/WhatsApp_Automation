import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  phone: String,
  step: String,
  name: String,
  address: String,
  intent: String,
  source: String,
  enquiryId: String,
  business: String,
  requirements: String,
  budget: String,
  timeline: String,
  referralSource: String,
  lastMessageId: String,
  lastResponse: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);

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
  language: { type: String, enum: ["en", "hinglish"] },
  choosingLanguage: Boolean,
  pendingMessage: String,
  pendingInteractive: Boolean,
  pendingProfileName: String,
  lastMessageId: String,
  lastResponse: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);

import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  phone: String,
  name: String,
  message: String,
  intent: String,
  source: String,
  enquiryId: { type: String, unique: true, sparse: true },
  business: String,
  budget: String,
  timeline: String,
  referralSource: String,
  language: { type: String, enum: ["en", "hinglish"] },
  requestType: { type: String, enum: ["quote", "callback"] },
  status: {
    type: String,
    enum: ["new", "contacted", "converted"],
    default: "new"
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

export default mongoose.model("Lead", leadSchema);

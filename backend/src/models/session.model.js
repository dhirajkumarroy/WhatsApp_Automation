import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  phone: String,
  step: String,
  name: String,
  address: String,
  intent: String,
  source: String
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);
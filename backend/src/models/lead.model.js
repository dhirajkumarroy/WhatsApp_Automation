import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  phone: String,
  name: String,
  message: String,
  intent: String,
  source: String,
  status: {
    type: String,
    enum: ["new", "contacted", "converted"],
    default: "new"
  }
}, { timestamps: true });

export default mongoose.model("Lead", leadSchema);
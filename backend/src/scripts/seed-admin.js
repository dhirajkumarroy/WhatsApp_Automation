/**
 * One-time script to create the admin user.
 * Run once: node src/scripts/seed-admin.js
 * Then delete or keep — running it again is safe (will skip if email exists).
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Admin from "../models/admin.model.js";

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@scaleforge.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@123";

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not configured in backend/.env");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const existing = await Admin.findOne({ email: ADMIN_EMAIL });

if (existing) {
  console.log(`Admin already exists: ${ADMIN_EMAIL}`);
} else {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await Admin.create({ email: ADMIN_EMAIL, password: hashed });
  console.log("✅ Admin created successfully!");
  console.log(`   Email   : ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
}

await mongoose.disconnect();
process.exit(0);

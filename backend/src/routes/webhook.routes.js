import express from "express";
import { handleWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

const getVerifyToken = () => (process.env.WEBHOOK_VERIFY_TOKEN || "mytoken123").trim();



// 🔥 Webhook verification (GET)
router.get("/", (req, res) => {
  // Use URLSearchParams to avoid qs dot-notation ambiguity
  const qs = new URLSearchParams(req.url.split("?")[1] || "");

  const mode = qs.get("hub.mode") || "";
  const token = (qs.get("hub.verify_token") || "").trim();
  const challenge = qs.get("hub.challenge") || "";
  const verifyToken = getVerifyToken();

  console.log("=== WEBHOOK VERIFY ===");
  console.log("raw url:", req.url);
  console.log("mode:", mode);
  console.log("token:", token);
  console.log("challenge:", challenge);
  console.log("expected token:", verifyToken);

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ Webhook verified successfully");
    return res.status(200).send(challenge);
  }

  console.log("❌ Verification failed — mode:", mode, "| token match:", token === verifyToken);
  return res.sendStatus(403);
});

// 🔥 Incoming messages (POST)
router.post("/", handleWebhook);

export default router;

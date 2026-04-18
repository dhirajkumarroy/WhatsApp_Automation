import { sendText } from "./whatsapp.service.js";

const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || "919304730973";

export const notifyNewLead = async (lead) => {
  const msg = `🔥 New Lead

📱 Phone: ${lead.phone}
🎯 Intent: ${lead.intent}
💬 Message: ${lead.message}

Reply fast 🚀`;

  try {
    await sendText(ADMIN_NUMBER, msg);
  } catch (error) {
    console.error("Admin lead notification failed", {
      message: error.message,
      adminNumber: ADMIN_NUMBER,
      leadPhone: lead.phone
    });
  }
};

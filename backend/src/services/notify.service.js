import { sendText } from "./whatsapp.service.js";

const normalizePhoneNumber = (phone = "") => phone.replace(/\D/g, "");

const getAdminNumber = () => {
  const adminNumber = normalizePhoneNumber(process.env.ADMIN_WHATSAPP_NUMBER);

  if (!adminNumber) {
    return "";
  }

  if (adminNumber.length < 10) {
    console.error("Admin lead notification skipped: ADMIN_WHATSAPP_NUMBER is invalid");
    return "";
  }

  return adminNumber;
};

export const notifyNewLead = async (lead) => {
  const adminNumber = getAdminNumber();

  if (!adminNumber) {
    console.error("Admin lead notification skipped: ADMIN_WHATSAPP_NUMBER is missing");
    return;
  }

  const msg = `🔥 New Lead

📱 Phone: ${lead.phone}
🎯 Intent: ${lead.intent}
💬 Message: ${lead.message}

Reply fast 🚀`;

  try {
    const response = await sendText(adminNumber, msg);

    console.log("Admin lead notification sent", {
      adminNumber,
      leadPhone: lead.phone,
      messageId: response?.messages?.[0]?.id
    });
  } catch (error) {
    console.error("Admin lead notification failed", {
      message: error.message,
      adminNumber,
      leadPhone: lead.phone,
      metaError: error.response?.data?.error,
      metaResponse: error.response?.data
    });
  }
};

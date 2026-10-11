import { sendText } from "./whatsapp.service.js";
import { BUSINESS_NAME, SERVICES } from "../config/business.js";

const normalizePhoneNumber = (phone = "") => phone.replace(/\D/g, "");

const getAdminNumber = () => {
  const adminNumber = normalizePhoneNumber(
    process.env.ADMIN_WHATSAPP_NUMBER || ""
  );

  if (!adminNumber) {
    return "";
  }

  if (!/^[1-9]\d{9,14}$/.test(adminNumber)) {
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

  const msg = `${BUSINESS_NAME} — New ${lead.requestType === "callback" ? "callback request" : "project enquiry"}

Name: ${lead.name || "Not provided"}
Phone: ${lead.phone}
Business: ${lead.business || "Not provided"}
Service: ${SERVICES[lead.intent]?.title || lead.intent || "General enquiry"}
Budget: ${lead.budget || "Not specified"}
Timeline: ${lead.timeline || "Not specified"}
Found us on: ${lead.referralSource || "WhatsApp"}

Requirements: ${lead.message || "Not provided"}

Follow up on WhatsApp: https://wa.me/${normalizePhoneNumber(lead.phone)}`.slice(0, 4096);

  try {
    console.log("Sending admin lead notification", {
      adminNumber,
      leadPhone: lead.phone
    });

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

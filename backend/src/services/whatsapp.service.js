import axios from "axios";

const getWhatsAppConfig = () => {
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const metaToken = process.env.META_TOKEN;

  if (!phoneNumberId || !metaToken) {
    throw new Error(
      "Missing WhatsApp config: set PHONE_NUMBER_ID and META_TOKEN in .env"
    );
  }

  return {
    baseUrl: `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
    headers: {
      Authorization: `Bearer ${metaToken}`,
      "Content-Type": "application/json"
    }
  };
};

const logWhatsAppError = (error, action) => {
  const status = error.response?.status;
  const data = error.response?.data;

  console.error(`WhatsApp ${action} failed`, {
    message: error.message,
    status,
    data
  });
};

// 🔹 Send Text
export const sendText = async (to, body) => {
  const { baseUrl, headers } = getWhatsAppConfig();

  try {
    const response = await axios.post(baseUrl, {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    }, { headers });

    return response.data;
  } catch (error) {
    logWhatsAppError(error, "text send");
    throw error;
  }
};

// 🔹 Send Buttons (Quick Reply)
export const sendButtons = async (to, body, buttons) => {
  const { baseUrl, headers } = getWhatsAppConfig();

  try {
    const response = await axios.post(baseUrl, {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body },
        action: {
          buttons: buttons.map((btn) => ({
            type: "reply",
            reply: {
              id: btn.id,
              title: btn.title
            }
          }))
        }
      }
    }, { headers });

    return response.data;
  } catch (error) {
    logWhatsAppError(error, "buttons send");
    throw error;
  }
};

// 🔹 Send List Menu
export const sendList = async (to, body, sections) => {
  const { baseUrl, headers } = getWhatsAppConfig();

  try {
    const response = await axios.post(baseUrl, {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: body },
        action: {
          button: "Select",
          sections
        }
      }
    }, { headers });

    return response.data;
  } catch (error) {
    logWhatsAppError(error, "list send");
    throw error;
  }
};

import processMessage from "../services/message.service.js";
import {
  sendText,
  sendButtons,
  sendList
} from "../services/whatsapp.service.js";

const getIncomingMessageText = (msg) => {
  if (!msg) return "";

  if (msg.type === "text") {
    return msg.text?.body?.trim() || "";
  }

  if (msg.type === "interactive") {
    return (
      msg.interactive?.button_reply?.id ||
      msg.interactive?.list_reply?.id ||
      ""
    ).trim();
  }

  return "";
};

export const handleWebhook = async (req, res) => {
  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];
    const statuses = value?.statuses;

    if (Array.isArray(statuses) && statuses.length > 0) {
      console.log("WhatsApp status update:", JSON.stringify(statuses[0], null, 2));
      return res.sendStatus(200);
    }

    if (!msg) {
      console.log("Webhook received no message payload:", JSON.stringify(req.body));
      return res.sendStatus(200);
    }

    const userMessage = getIncomingMessageText(msg);
    const from = msg.from;

    if (!from) {
      console.log("Webhook message missing sender:", JSON.stringify(msg, null, 2));
      return res.sendStatus(200);
    }

    if (!userMessage) {
      console.log(
        `Ignoring unsupported WhatsApp message type "${msg.type}" from ${from}:`,
        JSON.stringify(msg, null, 2)
      );
      return res.sendStatus(200);
    }

    console.log(`Incoming message from ${from}:`, userMessage);

    const response = await processMessage({
      message: userMessage,
      from
    });

    if (!response) {
      console.log(`No bot response generated for ${from}`);
      return res.sendStatus(200);
    }

    console.log(`Sending ${response.type} reply to ${from}`);

    if (response.type === "text") {
      await sendText(from, response.body);
    }

    if (response.type === "buttons") {
      await sendButtons(from, response.body, response.buttons);
    }

    if (response.type === "list") {
      await sendList(from, response.body, response.sections);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", {
      message: err.message,
      stack: err.stack,
      response: err.response?.data
    });

    return res.sendStatus(200);
  }
};

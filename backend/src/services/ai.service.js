const generateAIReply = async (message) => {
  // TODO: replace with OpenAI / Gemini

  if (message.toLowerCase().includes("price")) {
    return "Price is ₹299. Want to order?";
  }

  return "Hi 👋 How can I help you?";
};

export default generateAIReply;
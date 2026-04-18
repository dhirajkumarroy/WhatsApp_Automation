import { saveLead } from "./lead.service.js";
import { notifyNewLead } from "./notify.service.js";

const processMessage = async ({ message, from }) => {
  const text = message.toLowerCase().trim();

  // ================= GLOBAL START =================
  if (text === "hi" || text === "start" || text === "menu") {
    return {
      type: "buttons",
      body: `👋 Hi, I'm Dhiraj

I help build scalable backend systems & automation.

What would you like to do?`,
      buttons: [
        { id: "hire", title: "Hire Me" },
        { id: "services", title: "Services" }
      ]
    };
  }

  // ================= HIRE FLOW =================
  if (text === "hire") {
    return {
      type: "buttons",
      body: `👨‍💻 Great choice!

How can I help you?`,
      buttons: [
        { id: "project", title: "Discuss Project" },
        { id: "projects", title: "View Work" },
        { id: "menu", title: "Main Menu" }
      ]
    };
  }

  if (text === "project") {
    return {
      type: "text",
      body: `Awesome 👍

Tell me:
• What do you want to build?
• Timeline?
• Budget (optional)

I'll guide you further 🚀`
    };
  }

  // ================= PROJECT LIST =================
  if (text === "projects") {
    return {
      type: "list",
      body: "📂 Here are my projects:",
      sections: [
        {
          title: "Select Project",
          rows: [
            {
              id: "paperkart",
              title: "PaperKart",
              description: "E-commerce backend"
            },
            {
              id: "secure_api",
              title: "Secure API",
              description: "Auth + JWT system"
            },
            {
              id: "automation_bot",
              title: "Automation Bot",
              description: "WhatsApp system"
            }
          ]
        }
      ]
    };
  }

  if (text === "paperkart") {
    return {
      type: "buttons",
      body: `🛒 PaperKart

E-commerce backend system

👉 https://github.com/your-link`,
      buttons: [
        { id: "projects", title: "More Projects" },
        { id: "hire", title: "Hire Me" },
        { id: "menu", title: "Main Menu" }
      ]
    };
  }

  if (text === "secure_api") {
    return {
      type: "buttons",
      body: `🔐 Secure API

JWT Auth + Security

👉 https://github.com/your-link`,
      buttons: [
        { id: "projects", title: "More Projects" },
        { id: "hire", title: "Hire Me" },
        { id: "menu", title: "Main Menu" }
      ]
    };
  }

  // ================= SERVICES =================
  if (text === "services") {
    return {
      type: "buttons",
      body: `🚀 ScaleForge Services

We build production-grade systems.

What do you need?`,
      buttons: [
        { id: "demo", title: "Get Demo" },
        { id: "pricing", title: "Pricing" },
        { id: "why", title: "Why Us" }
      ]
    };
  }

  if (text === "demo") {
    return {
      type: "text",
      body: `Nice 👍

Tell me about your business:
• What do you sell?
• What problem do you face?

I'll suggest automation 🔥`
    };
  }

  if (text === "automation_bot") {
    return {
      type: "buttons",
      body: `🤖 Automation Bot

WhatsApp lead capture + notifications

👉 https://github.com/your-link`,
      buttons: [
        { id: "projects", title: "More Projects" },
        { id: "services", title: "Services" },
        { id: "menu", title: "Main Menu" }
      ]
    };
  }

  if (text === "pricing") {
    return {
      type: "buttons",
      body: `💰 Pricing

Setup: ₹2k
Monthly: ₹1k

Includes:
✔ Automation
✔ Lead capture
✔ WhatsApp bot`,
      buttons: [
        { id: "demo", title: "Get Demo" },
        { id: "services", title: "Services" },
        { id: "menu", title: "Main Menu" }
      ]
    };
  }

  if (text === "why") {
    return {
      type: "buttons",
      body: `💡 Why ScaleForge?

🔐 Secure APIs
⚡ Scalable systems
🧼 Clean code
🚀 Production-ready`,
      buttons: [
        { id: "pricing", title: "Pricing" },
        { id: "demo", title: "Get Demo" },
        { id: "menu", title: "Main Menu" }
      ]
    };
  }

  // ================= LEAD CAPTURE =================
  if (
    text.length > 10 &&
    ![
      "hi",
      "start",
      "menu",
      "hire",
      "project",
      "projects",
      "services",
      "demo",
      "pricing",
      "why",
      "paperkart",
      "secure_api",
      "automation_bot"
    ].includes(text)
  ) {
    const intent = text.includes("business") ? "automation" : "hire";

    const lead = await saveLead({
      phone: from,
      message,
      intent,
      source: intent === "automation" ? "scaleforge" : "dhirajroy"
    });

    await notifyNewLead(lead);

    return {
      type: "buttons",
      body: `✅ Got it!

I'll review and get back to you shortly.
Meanwhile, you can explore 👇`,
      buttons: [
        { id: "services", title: "Services" },
        { id: "projects", title: "Projects" },
        { id: "menu", title: "Main Menu" }
      ]
    };
  }

  // ================= FALLBACK =================
  return {
    type: "buttons",
    body: `🤔 Not sure what you mean.

Let's start fresh 👇`,
    buttons: [
      { id: "hire", title: "Hire Me" },
      { id: "services", title: "Services" },
      { id: "menu", title: "Restart" }
    ]
  };
};

export default processMessage;

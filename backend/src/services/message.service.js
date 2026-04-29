import { saveLead } from "./lead.service.js";
import { notifyNewLead } from "./notify.service.js";

const DEMO_LINK = "https://your-demo-link.com";

const MENU_IDS = {
  MAIN_MENU: "menu",
  VIEW_DEMO: "view_demo",
  GET_WEBSITE: "get_website",
  AUTOMATION: "automation",
  TALK_TO_ME: "talk_to_me",
  GET_STARTED: "get_started",
  PRICING: "pricing",
  COACHING: "coaching",
  GYM: "gym",
  PORTFOLIO: "portfolio",
  LIBRARY: "library"
};

const START_KEYWORDS = new Set(["hi", "hello", "start", "menu", "main menu"]);

const CONTROL_KEYWORDS = new Set([
  ...START_KEYWORDS,
  "view demo",
  "demo",
  "get website",
  "website",
  "automation",
  "talk to me",
  "get started",
  "pricing",
  "coaching",
  "gym",
  "portfolio",
  "library",
  ...Object.values(MENU_IDS)
]);

const mainMenuRows = [
  {
    id: MENU_IDS.VIEW_DEMO,
    title: "View Demo",
    description: "See website and automation demos"
  },
  {
    id: MENU_IDS.GET_WEBSITE,
    title: "Get Website",
    description: "Build a website for your business"
  },
  {
    id: MENU_IDS.AUTOMATION,
    title: "Automation",
    description: "Automate replies and lead capture"
  },
  {
    id: MENU_IDS.TALK_TO_ME,
    title: "Talk to Me",
    description: "Share your requirement with Dhiraj"
  }
];

const websiteRows = [
  {
    id: MENU_IDS.COACHING,
    title: "Coaching",
    description: "Website for coaching institutes"
  },
  {
    id: MENU_IDS.GYM,
    title: "Gym",
    description: "Website for gyms and fitness"
  },
  {
    id: MENU_IDS.PORTFOLIO,
    title: "Portfolio",
    description: "Personal portfolio website"
  },
  {
    id: MENU_IDS.LIBRARY,
    title: "Library",
    description: "Website for library businesses"
  }
];

const serviceDetails = {
  [MENU_IDS.COACHING]: {
    title: "📚 Coaching Website System",
    includes: [
      "Course & batch display",
      "Student enquiry system",
      "WhatsApp integration"
    ],
    price: "₹8,000"
  },
  [MENU_IDS.GYM]: {
    title: "🏋️ Gym Website System",
    includes: [
      "Plans & trainer display",
      "Member enquiry system",
      "WhatsApp integration"
    ],
    price: "₹7,000"
  },
  [MENU_IDS.PORTFOLIO]: {
    title: "👤 Portfolio Website",
    includes: [
      "Profile & skills section",
      "Work showcase",
      "Contact enquiry system"
    ],
    price: "₹4,000"
  },
  [MENU_IDS.LIBRARY]: {
    title: "📖 Library Website System",
    includes: [
      "Plans & facilities display",
      "Seat enquiry system",
      "WhatsApp integration"
    ],
    price: "₹6,000"
  }
};

const nextStepButtons = [
  { id: MENU_IDS.GET_STARTED, title: "Get Started" },
  { id: MENU_IDS.MAIN_MENU, title: "Main Menu" }
];

const mainMenuResponse = () => ({
  type: "list",
  body: `👋 Hi, I'm Dhiraj from ScaleforgeHQ

We help businesses build websites and automate operations.

What would you like to explore?`,
  sections: [
    {
      title: "Choose an option",
      rows: mainMenuRows
    }
  ]
});

const websiteServiceResponse = () => ({
  type: "list",
  body: `🌐 Website Solutions

We build websites for:
• Coaching Institutes
• Gyms & Fitness
• Libraries
• Personal Portfolio

Select your type:`,
  sections: [
    {
      title: "Website Type",
      rows: websiteRows
    }
  ]
});

const serviceDetailResponse = (service) => ({
  type: "buttons",
  body: `${service.title}

Includes:
${service.includes.map((item) => `• ${item}`).join("\n")}

💰 Starting from ${service.price}

👉 View Demo:
${DEMO_LINK}`,
  buttons: nextStepButtons
});

const automationResponse = () => ({
  type: "buttons",
  body: `🤖 WhatsApp Automation System

We help you:
• Auto-reply customers
• Capture leads
• Send follow-ups

💰 Starting from ₹3,000 setup + monthly

Want to see demo?`,
  buttons: [
    { id: MENU_IDS.VIEW_DEMO, title: "View Demo" },
    { id: MENU_IDS.GET_STARTED, title: "Get Started" },
    { id: MENU_IDS.MAIN_MENU, title: "Main Menu" }
  ]
});

const demoResponse = () => ({
  type: "buttons",
  body: `🔍 Here are live demos:

• Coaching Website
• Admin Dashboard
• Automation System

👉 ${DEMO_LINK}

Tell me what you need 👍`,
  buttons: [
    { id: MENU_IDS.GET_STARTED, title: "Get Started" },
    { id: MENU_IDS.GET_WEBSITE, title: "Get Website" },
    { id: MENU_IDS.MAIN_MENU, title: "Main Menu" }
  ]
});

const handoffResponse = () => ({
  type: "text",
  body: `Great 👍

Tell me:
• What type of business?
• What do you want to build?

I'll guide you step by step 🚀`
});

const pricingResponse = () => ({
  type: "buttons",
  body: `💰 Pricing depends on your requirements.

Typical range:
• Website: ₹6K – ₹12K
• Automation: ₹3K setup + monthly

Tell me your requirement 👍`,
  buttons: [
    { id: MENU_IDS.GET_STARTED, title: "Get Started" },
    { id: MENU_IDS.VIEW_DEMO, title: "View Demo" },
    { id: MENU_IDS.MAIN_MENU, title: "Main Menu" }
  ]
});

const fallbackResponse = () => ({
  type: "buttons",
  body: `I can help with websites and automation.

What would you like to do?`,
  buttons: [
    { id: MENU_IDS.GET_WEBSITE, title: "Get Website" },
    { id: MENU_IDS.AUTOMATION, title: "Automation" },
    { id: MENU_IDS.TALK_TO_ME, title: "Talk to Me" }
  ]
});

const detectIntent = (text) => {
  if (text.includes("website")) return "website";
  if (text.includes("automation")) return "automation";

  return "general";
};

const saveAndNotifyLead = async ({ from, message, text }) => {
  const lead = await saveLead({
    phone: from,
    message,
    intent: detectIntent(text),
    source: "scaleforgehq"
  });

  await notifyNewLead(lead);
};

const normalizeMessage = (message = "") => message.toLowerCase().trim();

const processMessage = async ({ message, from }) => {
  const text = normalizeMessage(message);

  // Entry flow: first contact and main menu navigation.
  if (START_KEYWORDS.has(text)) {
    return mainMenuResponse();
  }

  // Demo flow: show business-focused examples and move toward conversation.
  if (text === MENU_IDS.VIEW_DEMO || text === "view demo" || text === "demo") {
    return demoResponse();
  }

  // Website funnel: segment the lead by business type.
  if (
    text === MENU_IDS.GET_WEBSITE ||
    text === "get website" ||
    text === "website"
  ) {
    return websiteServiceResponse();
  }

  if (serviceDetails[text]) {
    return serviceDetailResponse(serviceDetails[text]);
  }

  // Automation funnel: explain the offer and push to demo or handoff.
  if (text === MENU_IDS.AUTOMATION || text === "automation") {
    return automationResponse();
  }

  // Pricing flow: keep pricing flexible and invite the user to share details.
  if (text === MENU_IDS.PRICING || text === "pricing") {
    return pricingResponse();
  }

  // Closing flow: human handoff prompt for warm leads.
  if (
    text === MENU_IDS.TALK_TO_ME ||
    text === MENU_IDS.GET_STARTED ||
    text === "talk to me" ||
    text === "get started"
  ) {
    return handoffResponse();
  }

  // Lead capture: any custom message becomes a lead and triggers notification.
  if (text.length >= 3 && !CONTROL_KEYWORDS.has(text)) {
    await saveAndNotifyLead({ from, message, text });

    return {
      type: "buttons",
      body: `✅ Got it!

I'll review your requirement and reply shortly.

You can also explore demos or pricing:`,
      buttons: [
        { id: MENU_IDS.VIEW_DEMO, title: "View Demo" },
        { id: MENU_IDS.PRICING, title: "Pricing" },
        { id: MENU_IDS.MAIN_MENU, title: "Main Menu" }
      ]
    };
  }

  return fallbackResponse();
};

export default processMessage;

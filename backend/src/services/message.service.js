import { randomUUID } from "node:crypto";
import {
  BUSINESS_NAME,
  SERVICES,
  getBusinessProfile,
} from "../config/business.js";
import {
  getSession,
  upsertSession,
} from "../repositories/session.repository.js";
import { saveLead } from "./lead.service.js";
import { notifyNewLead } from "./notify.service.js";

const MENU = { id: "menu", title: "Main Menu" };
const QUOTE = { id: "get_quote", title: "Get a Quote" };
const TEAM = { id: "talk_to_team", title: "Talk to Team" };
const START = new Set([
  "hi",
  "hello",
  "hey",
  "namaste",
  "start",
  "menu",
  "main menu",
  "services",
]);
const THANKS = new Set(["thanks", "thank you", "ok", "okay", "thankyou"]);
const QUOTES = new Set([
  "get_quote",
  "get_started",
  "get started",
  "quote",
  "get a quote",
]);
const HANDOFF = new Set([
  "talk_to_team",
  "talk_to_me",
  "talk to me",
  "talk to team",
  "human",
  "agent",
]);
const COMPANY = new Set([
  "company",
  "about",
  "about us",
  "linkedin",
  "company website",
  "view_demo",
  "view demo",
  "demo",
]);
const ALIASES = {
  get_website: "website",
  "get website": "website",
  websites: "website",
  coaching: "website",
  gym: "website",
  portfolio: "website",
  library: "website",
  apps: "app",
  "mobile app": "app",
  "app development": "app",
  "whatsapp automation": "automation",
  whatsapp: "automation",
  software: "custom",
  "custom software": "custom",
  domain: "infrastructure",
  server: "infrastructure",
  hosting: "infrastructure",
  "domain & server setup": "infrastructure",
  "complete setup": "complete",
};
const STEPS = ["name", "business", "requirements", "budget", "timeline"];
const PROMPTS = {
  name: "What is your name?",
  business:
    "What is your business or project name, and what does it do? If this is a personal project, tell us that.",
  requirements:
    "What would you like us to build or set up? Share the main features, the problem to solve, and any domain or hosting you already have.",
  budget:
    "Do you have an approximate project budget? You can reply 'skip' if you would like our guidance.",
  timeline:
    "When would you like to launch? You can reply 'skip' if you are still deciding.",
};
const LIMITS = {
  name: 120,
  business: 300,
  requirements: 3000,
  budget: 120,
  timeline: 120,
};
const buttons = (body, choices = [QUOTE, TEAM, MENU]) => ({
  type: "buttons",
  body,
  buttons: choices,
});
const prompt = (step) => ({
  type: "text",
  body: `${PROMPTS[step]}\n\nReply 'menu' to leave this enquiry, or 'human' to request a callback.`,
});
const serviceRows = () =>
  Object.entries(SERVICES).map(([id, { title, description }]) => ({
    id,
    title,
    description,
  }));

const mainMenu = () => ({
  type: "list",
  body: `Welcome to ${BUSINESS_NAME}!\n\nWe turn your ideas into websites, apps and business automations, with complete domain, server and launch setup.\n\nI'm the automated enquiry assistant. Choose a service, request a quote, or talk to our team.`,
  sections: [
    { title: "Our services", rows: serviceRows() },
    {
      title: "Let's talk",
      rows: [
        {
          ...QUOTE,
          description: "Share your requirements for a tailored proposal",
        },
        {
          id: "pricing",
          title: "Pricing & Process",
          description: "How we scope, build and launch your project",
        },
        {
          id: "company",
          title: "Website & LinkedIn",
          description: "Learn about Dhanush Technologies",
        },
        { ...TEAM, description: "Request a personal follow-up on WhatsApp" },
      ],
    },
  ],
});

const companyResponse = (profile) => {
  const links = [
    profile.website && `Website: ${profile.website}`,
    profile.linkedin && `LinkedIn: ${profile.linkedin}`,
  ].filter(Boolean);
  return buttons(
    `${BUSINESS_NAME}\n\nWe build websites, mobile and web apps, WhatsApp automations and custom software. We also handle domains, servers, deployment and project handover.\n\n${links.length ? links.join("\n\n") : "Our team can share our company website, work samples and LinkedIn details when you connect."}`,
  );
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
  ...Object.values(MENU_IDS),
]);

const mainMenuRows = [
  {
    id: MENU_IDS.VIEW_DEMO,
    title: "View Demo",
    description: "See website and automation demos",
  },
  {
    id: MENU_IDS.GET_WEBSITE,
    title: "Get Website",
    description: "Build a website for your business",
  },
  {
    id: MENU_IDS.AUTOMATION,
    title: "Automation",
    description: "Automate replies and lead capture",
  },
  {
    id: MENU_IDS.TALK_TO_ME,
    title: "Talk to Me",
    description: "Share your requirement with Dhiraj",
  },
];

const websiteRows = [
  {
    id: MENU_IDS.COACHING,
    title: "Coaching",
    description: "Website for coaching institutes",
  },
  {
    id: MENU_IDS.GYM,
    title: "Gym",
    description: "Website for gyms and fitness",
  },
  {
    id: MENU_IDS.PORTFOLIO,
    title: "Portfolio",
    description: "Personal portfolio website",
  },
  {
    id: MENU_IDS.LIBRARY,
    title: "Library",
    description: "Website for library businesses",
  },
];

const serviceDetails = {
  [MENU_IDS.COACHING]: {
    title: "📚 Coaching Website System",
    includes: [
      "Course & batch display",
      "Student enquiry system",
      "WhatsApp integration",
    ],
  },
  [MENU_IDS.GYM]: {
    title: "🏋️ Gym Website System",
    includes: [
      "Plans & trainer display",
      "Member enquiry system",
      "WhatsApp integration",
    ],
  },
  [MENU_IDS.PORTFOLIO]: {
    title: "👤 Portfolio Website",
    includes: [
      "Profile & skills section",
      "Work showcase",
      "Contact enquiry system",
    ],
  },
  [MENU_IDS.LIBRARY]: {
    title: "📖 Library Website System",
    includes: [
      "Plans & facilities display",
      "Seat enquiry system",
      "WhatsApp integration",
    ],
  },
};

const nextStepButtons = [
  { id: MENU_IDS.GET_STARTED, title: "Get Started" },
  { id: MENU_IDS.MAIN_MENU, title: "Main Menu" },
];

const mainMenuResponse = () => ({
  type: "list",
  body: `👋 Hi, I'm Dhiraj from ScaleforgeHQ

We help businesses build websites and automate operations.

What would you like to explore?`,
  sections: [
    {
      title: "Choose an option",
      rows: mainMenuRows,
    },
  ],
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
      rows: websiteRows,
    },
  ],
});

const serviceDetailResponse = (service) => ({
  type: "buttons",
  body: `${service.title}

Includes:
${service.includes.map((item) => `• ${item}`).join("\n")}

Share your specific business requirements and I'll send you a custom live demo & quote tailored for your business 👍`,
  buttons: nextStepButtons,
});

const automationResponse = () => ({
  type: "buttons",
  body: `🤖 WhatsApp Automation System

We help you:
• Auto-reply customers
• Capture leads
• Send follow-ups

Share your business requirements (what flows or features you need) and I'll send you a custom live demo & quote.`,
  buttons: [
    { id: MENU_IDS.GET_STARTED, title: "Get Started" },
    { id: MENU_IDS.MAIN_MENU, title: "Main Menu" },
  ],
});

const demoResponse = () => ({
  type: "buttons",
  body: `🔍 We prepare custom live demos based on your specific business requirements!

Tell me:
• What type of business do you run?
• What features or pages do you need?

Share your requirement and I'll send you a tailored live demo & pricing 👍`,
  buttons: [
    { id: MENU_IDS.GET_STARTED, title: "Get Started" },
    { id: MENU_IDS.GET_WEBSITE, title: "Get Website" },
    { id: MENU_IDS.MAIN_MENU, title: "Main Menu" },
  ],
});

const handoffResponse = () => ({
  type: "text",
  body: `Great 👍

Tell me:
• What type of business?
• What features or pages do you want?

I'll review your requirements and send you a custom live demo & price quote 🚀`,
});

const pricingResponse = () => ({
  type: "buttons",
  body: `💰 Pricing depends on your specific requirements — every project is different.

Tell me what you're looking to build and I'll get back to you with a custom live demo & price quote 👍`,
  buttons: [
    { id: MENU_IDS.GET_STARTED, title: "Get Started" },
    { id: MENU_IDS.MAIN_MENU, title: "Main Menu" },
  ],
});

const fallbackResponse = () => ({
  type: "buttons",
  body: `I can help with websites and automation.

What would you like to do?`,
  buttons: [
    { id: MENU_IDS.GET_WEBSITE, title: "Get Website" },
    { id: MENU_IDS.AUTOMATION, title: "Automation" },
    { id: MENU_IDS.TALK_TO_ME, title: "Talk to Me" },
  ],
});

const detectIntent = (text) => {
  if (text.includes("website")) return "website";
  if (text.includes("automation")) return "automation";
  if (
    text.includes("hire") ||
    text.includes("build") ||
    text.includes("business") ||
    text.includes("need") ||
    text.includes("want")
  ) {
    return "hire";
  }

  return "general";
};

const freshSession = () => ({
  step: "browse",
  enquiryId: randomUUID(),
  intent: "general",
  name: "",
  business: "",
  requirements: "",
  budget: "",
  timeline: "",
  source: "whatsapp",
  referralSource: "direct",
});

// Dependencies are injectable so complete conversations can be checked without sending messages.
export const createMessageProcessor = (dependencies = {}) => {
  const deps = {
    getSession,
    upsertSession,
    saveLead,
    notifyNewLead,
    getBusinessProfile,
    ...dependencies,
  };
  const pending = new Map();
  const process = async ({
    message = "",
    from,
    messageId,
    name: profileName = "",
    isInteractive = false,
  }) => {
    const original = typeof message === "string" ? message.trim() : "";
    const text = original.toLowerCase().replace(/\s+/g, " ");
    if (!from || !text) return mainMenu();

    const stored = await deps.getSession(from);
    if (messageId && stored?.lastMessageId === messageId)
      return stored.lastResponse;
    let session =
      stored?.enquiryId &&
      (!stored.updatedAt ||
        Date.now() - new Date(stored.updatedAt).getTime() < 86400000)
        ? { ...stored }
        : freshSession();
    const finish = async (response) => {
      const { _id, __v, createdAt, updatedAt, ...data } = session;
      await deps.upsertSession(from, {
        ...data,
        lastMessageId: messageId || "",
        lastResponse: response,
      });
      return response;
    };
    const submit = async (requestType) => {
      const lead = await deps.saveLead({
        enquiryId: session.enquiryId,
        phone: from,
        name: session.name || profileName,
        business: session.business,
        message: session.requirements || "Requested a team callback",
        intent: session.intent,
        budget: session.budget,
        timeline: session.timeline,
        source: "whatsapp",
        referralSource: session.referralSource,
        requestType,
      });
      await deps.notifyNewLead(lead);
      session.step = "done";
      return finish(
        buttons(
          requestType === "callback"
            ? `Your callback request is saved. The ${BUSINESS_NAME} team will follow up here on WhatsApp.`
            : `Thank you! Your ${SERVICES[session.intent]?.title.toLowerCase() || "project"} enquiry is saved. The ${BUSINESS_NAME} team will review your requirements and follow up here with next steps and a tailored quote.`,
          [MENU, { id: "company", title: "Website & LinkedIn" }],
        ),
      );
    };

    const referral = text.match(
      /^hi dhanush technologies[,.!]? i found you on (linkedin|your website)\.?$/,
    );
    if (START.has(text) || ["cancel", "restart"].includes(text) || referral) {
      session = {
        ...freshSession(),
        referralSource: referral
          ? referral[1] === "linkedin"
            ? "linkedin"
            : "website"
          : session.referralSource,
      };
      return finish(mainMenu());
    }
    if (COMPANY.has(text))
      return finish(companyResponse(deps.getBusinessProfile()));
    if (["pricing", "price", "cost"].includes(text)) {
      return finish(
        buttons(
          `Every project is scoped around your goals.\n\n1. Share your idea and requirements.\n2. We agree on features, timeline and a written quote.\n3. We design, build, test and launch.\n4. We hand over access and agree on any ongoing support.\n\nDevelopment, domain registration, hosting, third-party services and maintenance are itemised in the proposal. Request a quote to get started.`,
        ),
      );
    }
    if (HANDOFF.has(text)) {
      if (session.step === "done") session.enquiryId = randomUUID();
      return submit("callback");
    }

    if (QUOTES.has(text) && STEPS.includes(session.step))
      return finish(prompt(session.step));
    if (STEPS.includes(session.step) && !isInteractive) {
      const step = session.step;
      if (text === "skip" && !["budget", "timeline"].includes(step))
        return finish(prompt(step));
      if (original.length > LIMITS[step]) {
        return finish({
          type: "text",
          body: `Please keep this answer under ${LIMITS[step]} characters.\n\n${PROMPTS[step]}`,
        });
      }
      session[step] = text === "skip" ? "Not specified" : original;
      if (step === "requirements" && session.intent === "general")
        session.intent = detectIntent(original);
      if (step === "timeline") return submit("quote");
      session.step = STEPS[STEPS.indexOf(step) + 1];
      if (session.step === "requirements" && session.requirements)
        session.step = "budget";
      return finish(prompt(session.step));
    }

    const selectedService = Object.hasOwn(SERVICES, text)
      ? text
      : Object.hasOwn(ALIASES, text)
        ? ALIASES[text]
        : null;
    if (selectedService) {
      session = {
        ...freshSession(),
        intent: selectedService,
        referralSource: session.referralSource,
      };
      const service = SERVICES[selectedService];
      return finish(
        buttons(
          `${BUSINESS_NAME} — ${service.title}\n\n${service.details}\n\nWe will confirm the scope, costs and delivery timeline in your proposal.`,
        ),
      );
    }
    if (QUOTES.has(text)) {
      if (session.step === "done")
        session = { ...freshSession(), referralSource: session.referralSource };
      session.step = "name";
      return finish({
        type: "text",
        body: `Let's discuss your project with ${BUSINESS_NAME}. We'll collect a few details so our team can prepare a proposal and contact you here.\n\n${prompt("name").body}`,
      });
    }
    if (isInteractive)
      return finish(
        STEPS.includes(session.step) ? prompt(session.step) : mainMenu(),
      );
    if (THANKS.has(text))
      return finish(
        buttons(
          "You're welcome! You can explore our services or start a new project enquiry whenever you're ready.",
          [MENU, QUOTE],
        ),
      );
    if (text.length < 3) return finish(mainMenu());
    if (original.length > LIMITS.requirements)
      return finish({
        type: "text",
        body: "Please summarise your project in under 3000 characters, or reply 'human' to request a callback.",
      });

    // Keep the initial request while gathering the remaining details.
    const previousIntent =
      session.step === "browse" ? session.intent : "general";
    session = {
      ...freshSession(),
      referralSource: session.referralSource,
      requirements: original,
      intent:
        detectIntent(original) === "general"
          ? previousIntent
          : detectIntent(original),
      step: "name",
    };
    return finish({
      type: "text",
      body: `We can discuss this with you. I've noted your project details for the enquiry.\n\n${prompt("name").body}`,
    });
  };

  // Webhooks for the same conversation may arrive while its previous write is pending.
  return async (input) => {
    const previous = pending.get(input.from) || Promise.resolve();
    const current = previous.catch(() => {}).then(() => process(input));
    pending.set(input.from, current);
    try {
      return await current;
    } finally {
      if (pending.get(input.from) === current) pending.delete(input.from);
    }
  };
};

export default createMessageProcessor();

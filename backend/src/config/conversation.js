import { BUSINESS_NAME, SERVICES } from "./business.js";

export const LANGUAGE_LABELS = { en: "English", hinglish: "Hinglish" };
export const isSupportedLanguage = (language) => Object.hasOwn(LANGUAGE_LABELS, language || "");

const HINGLISH_SERVICES = {
  website: {
    title: "Website Banwayein",
    description: "Business website, online store ya portfolio banwayein",
    details: "Hum business websites, landing pages, portfolios aur online stores banate hain. Aapki zarurat ke hisaab se mobile-friendly design, enquiry forms, payments aur admin panel bhi bana sakte hain."
  },
  app: {
    title: "App Banwayein",
    description: "Apne business ke liye mobile ya web app banwayein",
    details: "Hum aapke business ke liye mobile aur web apps banate hain. Customer accounts, bookings, payments, dashboards aur doosre tools se connection jaise features add kar sakte hain."
  },
  automation: {
    title: "WhatsApp Automation",
    description: "Customer replies aur enquiries ko automatic banayein",
    details: "WhatsApp par automatic replies, service menu, enquiries save karna aur customer support ke flows bana sakte hain. CRM aur doosre business tools se connection bhi kar sakte hain."
  },
  custom: {
    title: "Custom Software",
    description: "Apne kaam ke hisaab se software aur business tools",
    details: "Aapke business ke kaam ke hisaab se CRM, management system, dashboard ya custom software bana sakte hain. Batayein ki aapka kaunsa kaam aasaan karna hai."
  },
  infrastructure: {
    title: "Domain Aur Server",
    description: "Domain, hosting, server aur website live karne ka setup",
    details: "Domain lene mein madad, DNS, hosting ya cloud server, SSL aur database ka setup karte hain. Aapki website ya app live karne, migration, backup aur maintenance ka scope bhi discuss kar sakte hain."
  },
  complete: {
    title: "Poora Project Setup",
    description: "Idea se website ya app banane aur live karne tak",
    details: "Planning, design, website ya app banana, automation, domain aur server setup, testing, launch aur handover: sab ek team ke saath. Launch ke baad support ko bhi aapke project ke scope mein include kar sakte hain."
  }
};

const COPY = {
  en: {
    buttons: { menu: "Main Menu", get_quote: "Get a Quote", talk_to_team: "Talk to Team", company: "Website & LinkedIn", pricing: "Pricing & Process", change_language: "Change Language" },
    navigation: "Reply 'menu' to leave this enquiry, 'human' for a callback, or 'language' to change language.",
    languageHint: "Type 'language' to change language anytime.",
    welcome: `Welcome to ${BUSINESS_NAME}!\n\nWe turn your ideas into websites, apps and business automations, with complete domain, server and launch setup.\n\nI'm the automated enquiry assistant. Choose a service to get a quote, or talk to our team.`,
    services: "Our services", next: "Let's talk", select: "Select",
    descriptions: { pricing: "How we scope, build and launch your project", company: "Learn about Dhanush Technologies", talk_to_team: "Request a personal follow-up on WhatsApp", change_language: "Continue in English or Hinglish" },
    prompts: {
      name: "What is your name?",
      business: "What is your business or project name, and what does it do? If this is a personal project, tell us that.",
      requirements: "What would you like us to build or set up? Share the main features, the problem to solve, and any domain or hosting you already have.",
      budget: "Do you have an approximate project budget? You can reply 'skip' if you would like our guidance.",
      timeline: "When would you like to launch? You can reply 'skip' if you are still deciding."
    },
    company: "We build websites, mobile and web apps, WhatsApp automations and custom software. We also handle domains, servers, deployment and project handover.",
    missingLinks: "Our team can share our company website, work samples and LinkedIn details when you connect.",
    proposal: "We will confirm the scope, costs and delivery timeline in your proposal.",
    pricing: "Every project is scoped around your goals.\n\n1. Share your idea and requirements.\n2. We agree on features, timeline and a written quote.\n3. We design, build, test and launch.\n4. We hand over access and agree on any ongoing support.\n\nDevelopment, domain registration, hosting, third-party services and maintenance are itemised in the proposal. Request a quote to get started.",
    quoteIntro: `Let's discuss your project with ${BUSINESS_NAME}. We'll collect a few details so our team can prepare a proposal and contact you here.`,
    noted: "We can discuss this with you. I've noted your project details for the enquiry.",
    thanks: "You're welcome! You can explore our services or start a new project enquiry whenever you're ready.",
    callback: `Your callback request is saved. The ${BUSINESS_NAME} team will follow up here on WhatsApp.`,
    complete: `Thank you! Your enquiry is saved. The ${BUSINESS_NAME} team will review your requirements and follow up here with next steps and a tailored quote.`,
    tooLong: (limit) => `Please keep this answer under ${limit} characters.`,
    longRequest: "Please summarise your project in under 3000 characters, or reply 'human' to request a callback."
  },
  hinglish: {
    buttons: { menu: "Main Menu", get_quote: "Quote Mangwayein", talk_to_team: "Team Se Baat Karein", company: "Website Aur LinkedIn", pricing: "Kharcha Aur Process", change_language: "Bhasha Badlein" },
    navigation: "Enquiry se bahar aane ke liye 'menu', team se baat ke liye 'human', ya bhasha badalne ke liye 'language' likhein.",
    languageHint: "Kabhi bhi bhasha badalne ke liye 'language' likhein.",
    welcome: `${BUSINESS_NAME} mein aapka swagat hai!\n\nHum websites, apps aur business automations banate hain. Domain, server aur launch ka poora setup bhi karte hain.\n\nMain aapka automated enquiry assistant hoon. Quote ke liye service chunein, ya hamari team se baat karein.`,
    services: "Hamari Services", next: "Aage Kya Karein?", select: "Chunein",
    descriptions: { pricing: "Project ka kharcha aur kaam kaise hoga, samjhein", company: "Dhanush Technologies ke baare mein jaanein", talk_to_team: "Hamari team se WhatsApp par baat karne ki request karein", change_language: "English ya Hinglish mein baat karein" },
    prompts: {
      name: "Aapka naam kya hai?",
      business: "Aapke business ya project ka naam kya hai aur aap kya kaam karte hain? Agar personal project hai toh woh batayein.",
      requirements: "Aap kya banwana ya setup karwana chahte hain? Kaunse features chahiye aur kya problem solve karni hai? Domain ya hosting pehle se hai toh woh bhi batayein.",
      budget: "Aapka approximate budget kya hai? Abhi decide nahi kiya toh 'skip' likhein.",
      timeline: "Aapko project kab tak chahiye? Abhi decide nahi kiya toh 'skip' likhein."
    },
    company: "Hum websites, mobile aur web apps, WhatsApp automation aur custom software banate hain. Domain, server, project live karne aur handover ka kaam bhi karte hain.",
    missingLinks: "Hamari team aapse baat karte waqt company website, kaam ke samples aur LinkedIn ki details share kar sakti hai.",
    proposal: "Kaunsa kaam hoga, kitna kharcha aayega aur kab tak milega: sab aapke proposal mein confirm karenge.",
    pricing: "Har project ka kharcha aapki zarurat par depend karta hai.\n\n1. Apna idea aur requirements batayein.\n2. Features, timeline aur likhit quote milkar tay karenge.\n3. Hum design, development, testing aur launch karenge.\n4. Aapko access denge aur aage ke support par baat karenge.\n\nDevelopment, domain, hosting, doosri services aur maintenance ka kharcha proposal mein alag se batayenge. Shuru karne ke liye quote mangwayein.",
    quoteIntro: `${BUSINESS_NAME} ke saath apna project discuss karein. Kuch details lenge taaki hamari team proposal bana sake aur aapse yahin baat kar sake.`,
    noted: "Aapki project ki baat note kar li hai. Enquiry ke liye kuch aur details batayein.",
    thanks: "Shukriya! Jab bhi zarurat ho, hamari services dekhein ya naye project ke liye enquiry karein.",
    callback: `Aapki team se baat karne ki request save ho gayi hai. ${BUSINESS_NAME} ki team WhatsApp par aapse contact karegi.`,
    complete: `Shukriya! Aapki enquiry save ho gayi hai. ${BUSINESS_NAME} ki team details dekhkar agle steps aur quote ke liye WhatsApp par aapse contact karegi.`,
    tooLong: (limit) => `Kripya apna jawab ${limit} characters se chhota rakhein.`,
    longRequest: "Kripya project ki baat 3000 characters se kam mein batayein, ya team se baat karne ke liye 'human' likhein."
  }
};

export const languageSelection = () => ({
  type: "buttons",
  body: `Welcome to ${BUSINESS_NAME}!\nAapka swagat hai!\n\nChoose your language / Aap kis language mein baat karna chahenge?`,
  buttons: [{ id: "language_en", title: "English" }, { id: "language_hinglish", title: "Hinglish" }]
});

export const getConversation = (language) => {
  const copy = COPY[isSupportedLanguage(language) ? language : "en"];
  const services = language === "hinglish" ? HINGLISH_SERVICES : SERVICES;
  const button = (id) => ({ id, title: copy.buttons[id] });
  const buttons = (body, ids = ["get_quote", "talk_to_team", "menu"]) => ({
    type: "buttons", body: `${body}\n\n${copy.languageHint}`, buttons: ids.map(button)
  });
  const prompt = (step) => ({ type: "text", body: `${copy.prompts[step]}\n\n${copy.navigation}` });
  return {
    mainMenu: () => ({
      type: "list", body: `${copy.welcome}\n\n${copy.languageHint}`, button: copy.select,
      sections: [
        { title: copy.services, rows: Object.entries(services).map(([id, { title, description }]) => ({ id, title, description })) },
        { title: copy.next, rows: ["pricing", "company", "talk_to_team", "change_language"].map((id) => ({ ...button(id), description: copy.descriptions[id] })) }
      ]
    }),
    prompt,
    service: (id) => buttons(`${BUSINESS_NAME} — ${services[id].title}\n\n${services[id].details}\n\n${copy.proposal}`),
    company: (profile) => {
      const links = [profile.website && `Website: ${profile.website}`, profile.linkedin && `LinkedIn: ${profile.linkedin}`].filter(Boolean);
      return buttons(`${BUSINESS_NAME}\n\n${copy.company}\n\n${links.length ? links.join("\n\n") : copy.missingLinks}`);
    },
    pricing: () => buttons(copy.pricing),
    quote: () => ({ type: "text", body: `${copy.quoteIntro}\n\n${prompt("name").body}` }),
    noted: () => ({ type: "text", body: `${copy.noted}\n\n${prompt("name").body}` }),
    thanks: () => buttons(copy.thanks, ["menu", "get_quote", "change_language"]),
    confirmation: (requestType) => buttons(requestType === "callback" ? copy.callback : copy.complete, ["menu", "company", "change_language"]),
    tooLong: (step, limit) => ({ type: "text", body: `${copy.tooLong(limit)}\n\n${prompt(step).body}` }),
    longRequest: () => ({ type: "text", body: `${copy.longRequest}\n\n${copy.languageHint}` })
  };
};

import { randomUUID } from "node:crypto";
import { SERVICES, getBusinessProfile } from "../config/business.js";
import { getConversation, isSupportedLanguage, languageSelection } from "../config/conversation.js";
import { getSession, upsertSession } from "../repositories/session.repository.js";
import { saveLead } from "./lead.service.js";
import { notifyNewLead } from "./notify.service.js";

const START = new Set(["hi", "hello", "hey", "namaste", "namaskar", "start", "menu", "main menu", "services"]);
const THANKS = new Set(["thanks", "thank you", "ok", "okay", "thankyou", "shukriya", "dhanyavaad"]);
const QUOTES = new Set(["get_quote", "get_started", "get started", "quote", "get a quote", "quote mangwayein"]);
const HANDOFF = new Set(["talk_to_team", "talk_to_me", "talk to me", "talk to team", "human", "agent", "team se baat", "team se baat karein"]);
const COMPANY = new Set(["company", "about", "about us", "linkedin", "company website", "view_demo", "view demo", "demo", "website aur linkedin"]);
const CHANGE_LANGUAGE = new Set(["change_language", "language", "change language", "bhasha", "bhasha badlein", "language badlo"]);
const LANGUAGE_CHOICES = { language_en: "en", language_hinglish: "hinglish", english: "en", hinglish: "hinglish" };
const ALIASES = {
  get_website: "website", "get website": "website", websites: "website",
  coaching: "website", gym: "website", portfolio: "website", library: "website",
  apps: "app", "mobile app": "app", "app development": "app",
  "whatsapp automation": "automation", whatsapp: "automation",
  software: "custom", "custom software": "custom",
  domain: "infrastructure", server: "infrastructure", hosting: "infrastructure",
  "domain & server setup": "infrastructure", "complete setup": "complete",
  "website banwayein": "website", "app banwayein": "app",
  "domain aur server": "infrastructure", "poora project setup": "complete"
};
const STEPS = ["name", "business", "requirements", "budget", "timeline"];
const LIMITS = { name: 120, business: 300, requirements: 3000, budget: 120, timeline: 120 };

export const detectIntent = (text) => {
  if (/\b(complete|end.to.end|everything|full setup|poora|pura|sab kuch)\b/i.test(text)) return "complete";
  if (/\b(whatsapp|automation|automate|bot|chatbot)\b/i.test(text)) return "automation";
  if (/\b(apps?|android|ios|mobile application)\b/i.test(text)) return "app";
  if (/\b(websites?|web site|ecommerce|e-commerce|landing page)\b/i.test(text)) return "website";
  if (/\b(domain|server|hosting|deployment|ssl|dns)\b/i.test(text)) return "infrastructure";
  if (/\b(software|crm|dashboard|integration)\b/i.test(text)) return "custom";
  return "general";
};

const freshSession = (previous = {}) => ({
  step: "browse", enquiryId: randomUUID(), intent: "general", name: "", business: "",
  requirements: "", budget: "", timeline: "", source: "whatsapp",
  referralSource: previous?.referralSource || "direct",
  language: isSupportedLanguage(previous?.language) ? previous.language : undefined,
  choosingLanguage: false, pendingMessage: "", pendingInteractive: false, pendingProfileName: ""
});
const normalize = (text) => text.toLowerCase().replace(/\s+/g, " ");

// Both languages use the same persisted enquiry flow and stable interactive IDs.
export const createMessageProcessor = (dependencies = {}) => {
  const deps = { getSession, upsertSession, saveLead, notifyNewLead, getBusinessProfile, ...dependencies };
  const pending = new Map();
  const process = async ({ message = "", from, messageId, name: profileName = "", isInteractive = false }) => {
    let original = typeof message === "string" ? message.trim() : "";
    let text = normalize(original);
    if (!from || !text) return languageSelection();

    const stored = await deps.getSession(from);
    if (messageId && stored?.lastMessageId === messageId) return stored.lastResponse;
    let session = stored?.enquiryId && (!stored.updatedAt || Date.now() - new Date(stored.updatedAt).getTime() < 86400000)
      ? { ...stored } : freshSession(stored);
    const finish = async (response) => {
      const { _id, __v, createdAt, updatedAt, ...data } = session;
      await deps.upsertSession(from, { ...data, lastMessageId: messageId || "", lastResponse: response });
      return response;
    };

    if (CHANGE_LANGUAGE.has(text)) {
      session.choosingLanguage = true;
      return finish(languageSelection());
    }
    const selectedLanguage = Object.hasOwn(LANGUAGE_CHOICES, text) ? LANGUAGE_CHOICES[text] : null;
    // Ordinary answers such as "English" remain answers unless selecting a language.
    if (selectedLanguage && (isInteractive || text.startsWith("language_") || session.choosingLanguage || !isSupportedLanguage(session.language) || !STEPS.includes(session.step))) {
      session.language = selectedLanguage;
      session.choosingLanguage = false;
      if (session.pendingMessage) {
        original = session.pendingMessage;
        text = normalize(original);
        isInteractive = session.pendingInteractive;
        profileName = session.pendingProfileName || profileName;
        session.pendingMessage = "";
        session.pendingInteractive = false;
        session.pendingProfileName = "";
      } else {
        const replies = getConversation(session.language);
        if (STEPS.includes(session.step)) return finish(replies.prompt(session.step));
        if (session.step === "browse" && Object.hasOwn(SERVICES, session.intent)) return finish(replies.service(session.intent));
        return finish(replies.mainMenu());
      }
    } else if (!isSupportedLanguage(session.language) || session.choosingLanguage || (isInteractive && text.startsWith("language_"))) {
      if (!session.choosingLanguage && !text.startsWith("language_")) {
        // Retain the first request, service selection or referral until language is chosen.
        session.pendingMessage = original.slice(0, LIMITS.requirements + 1);
        session.pendingInteractive = isInteractive;
        session.pendingProfileName = profileName;
      }
      session.choosingLanguage = true;
      return finish(languageSelection());
    }

    const replies = getConversation(session.language);
    const submit = async (requestType) => {
      const lead = await deps.saveLead({
        enquiryId: session.enquiryId, phone: from, name: session.name || profileName,
        business: session.business, message: session.requirements || "Requested a team callback",
        intent: session.intent, budget: session.budget, timeline: session.timeline,
        source: "whatsapp", referralSource: session.referralSource, language: session.language, requestType
      });
      await deps.notifyNewLead(lead);
      session.step = "done";
      return finish(replies.confirmation(requestType));
    };

    const referral = text.match(/^hi dhanush technologies[,.!]? i found you on (linkedin|your website)\.?$/);
    if (START.has(text) || ["cancel", "restart"].includes(text) || referral) {
      session = freshSession(session);
      if (referral) session.referralSource = referral[1] === "linkedin" ? "linkedin" : "website";
      return finish(replies.mainMenu());
    }
    if (COMPANY.has(text)) return finish(replies.company(deps.getBusinessProfile()));
    if (["pricing", "price", "cost", "kharcha", "kharcha aur process"].includes(text)) return finish(replies.pricing());
    if (HANDOFF.has(text)) {
      if (session.step === "done") session.enquiryId = randomUUID();
      return submit("callback");
    }
    if (QUOTES.has(text) && STEPS.includes(session.step)) return finish(replies.prompt(session.step));
    if (STEPS.includes(session.step) && !isInteractive) {
      const step = session.step;
      if (text === "skip" && !["budget", "timeline"].includes(step)) return finish(replies.prompt(step));
      if (original.length > LIMITS[step]) return finish(replies.tooLong(step, LIMITS[step]));
      session[step] = text === "skip" ? "Not specified" : original;
      if (step === "requirements" && session.intent === "general") session.intent = detectIntent(original);
      if (step === "timeline") return submit("quote");
      session.step = STEPS[STEPS.indexOf(step) + 1];
      if (session.step === "requirements" && session.requirements) session.step = "budget";
      return finish(replies.prompt(session.step));
    }
    const selectedService = Object.hasOwn(SERVICES, text) ? text : (Object.hasOwn(ALIASES, text) ? ALIASES[text] : null);
    if (selectedService) {
      session = { ...freshSession(session), intent: selectedService };
      return finish(replies.service(selectedService));
    }
    if (QUOTES.has(text)) {
      if (session.step === "done") session = freshSession(session);
      session.step = "name";
      return finish(replies.quote());
    }
    if (isInteractive) return finish(STEPS.includes(session.step) ? replies.prompt(session.step) : replies.mainMenu());
    if (THANKS.has(text)) return finish(replies.thanks());
    if (text.length < 3) return finish(replies.mainMenu());
    if (original.length > LIMITS.requirements) return finish(replies.longRequest());

    const previousIntent = session.step === "browse" ? session.intent : "general";
    const intent = detectIntent(original);
    session = { ...freshSession(session), requirements: original, intent: intent === "general" ? previousIntent : intent, step: "name" };
    return finish(replies.noted());
  };

  // Serialise updates to each conversation while allowing other clients to continue.
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

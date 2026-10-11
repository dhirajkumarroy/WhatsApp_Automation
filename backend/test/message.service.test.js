import test from "node:test";
import assert from "node:assert/strict";
import { createMessageProcessor, detectIntent } from "../src/services/message.service.js";
import { getBusinessProfile, SERVICES } from "../src/config/business.js";
import Lead from "../src/models/lead.model.js";

const createHarness = (overrides = {}) => {
  const sessions = new Map();
  const leads = [];
  const notifications = [];
  const dependencies = {
    getSession: async (phone) => structuredClone(sessions.get(phone)),
    upsertSession: async (phone, data) => sessions.set(phone, structuredClone({ ...data, updatedAt: new Date() })),
    saveLead: async (data) => {
      const existing = leads.find((lead) => lead.enquiryId === data.enquiryId);
      if (existing) return existing;
      const lead = { ...data, _id: `lead-${leads.length + 1}` };
      leads.push(lead);
      return lead;
    },
    notifyNewLead: async (lead) => notifications.push(lead),
    getBusinessProfile: () => ({ website: "", linkedin: "" }),
    ...overrides
  };
  let processor = createMessageProcessor(dependencies);
  const responses = [];
  const send = async (message, extra = {}) => {
    const response = await processor({ from: "919000000001", message, ...extra });
    responses.push(response);
    return response;
  };
  return { send, sessions, leads, notifications, responses, restart: () => { processor = createMessageProcessor(dependencies); } };
};

const assertValidResponse = (response) => {
  assert.ok(response.body.length <= (response.type === "text" ? 4096 : 1024));
  assert.doesNotMatch(response.body, /scaleforge|your-demo-link|₹/i);
  if (response.type === "buttons") {
    assert.ok(response.buttons.length <= 3);
    for (const button of response.buttons) assert.ok(button.title.length <= 20);
  }
  if (response.type === "list") {
    const rows = response.sections.flatMap((section) => section.rows);
    assert.ok(rows.length <= 10);
    assert.equal(new Set(rows.map((row) => row.id)).size, rows.length);
    for (const row of rows) {
      assert.ok(row.title.length <= 24);
      assert.ok(row.description.length <= 72);
    }
  }
};

test("company menu exposes all services and every action returns a WhatsApp-sized reply", async () => {
  const menu = await createHarness().send(" HI ");
  assert.match(menu.body, /Dhanush Technologies/);
  assertValidResponse(menu);
  const rows = menu.sections.flatMap((section) => section.rows);
  for (const service of Object.keys(SERVICES)) assert.ok(rows.some((row) => row.id === service));
  for (const row of rows) assertValidResponse(await createHarness().send(row.id, { isInteractive: true }));
});

for (const service of Object.keys(SERVICES)) {
  test(`${service} enquiry persists selected service and all client details`, async () => {
    const bot = createHarness();
    await bot.send(service);
    await bot.send("get_quote");
    await bot.send("Asha Sharma");
    await bot.send("Sunrise Bookings");
    await bot.send("Bookings and payments, including launch setup");
    await bot.send("INR 50000");
    const reply = await bot.send("Next month", { messageId: "final-message" });
    assert.match(reply.body, /enquiry is saved/);
    assert.equal(bot.leads.length, 1);
    assert.deepEqual({ ...bot.leads[0], enquiryId: "id", _id: "lead" }, {
      enquiryId: "id", _id: "lead", phone: "919000000001", name: "Asha Sharma", business: "Sunrise Bookings",
      message: "Bookings and payments, including launch setup", intent: service, budget: "INR 50000",
      timeline: "Next month", source: "whatsapp", referralSource: "direct", requestType: "quote"
    });
    assert.equal(bot.notifications.length, 1);
    assert.deepEqual(await bot.send("Next month", { messageId: "final-message" }), reply);
    assert.equal(bot.leads.length, 1);
    assert.equal(bot.notifications.length, 1);
    for (const response of bot.responses) assertValidResponse(response);
  });
}

test("freeform request survives a restart and optional answers can be skipped", async () => {
  const bot = createHarness();
  const requirement = "I want a mobile app for appointments";
  await bot.send(requirement);
  bot.restart();
  await bot.send("Ravi");
  const reply = await bot.send("Personal project");
  assert.match(reply.body, /budget/);
  await bot.send("skip");
  await bot.send("skip");
  assert.equal(bot.leads[0].message, requirement);
  assert.equal(bot.leads[0].intent, "app");
  assert.equal(bot.leads[0].budget, "Not specified");
  assert.equal(bot.leads[0].timeline, "Not specified");
});

test("callback works immediately and while collecting an enquiry", async () => {
  const immediate = createHarness();
  await immediate.send("talk_to_me", { name: "WhatsApp profile" });
  assert.equal(immediate.leads[0].name, "WhatsApp profile");
  assert.equal(immediate.leads[0].requestType, "callback");
  const bot = createHarness();
  await bot.send("I need hosting and DNS configured");
  await bot.send("Neha");
  await bot.send("human");
  assert.equal(bot.leads[0].intent, "infrastructure");
  assert.equal(bot.leads[0].name, "Neha");
  assert.match(bot.leads[0].message, /DNS/);
});

test("menu cancels draft answers and keeps enquiries from different phones separate", async () => {
  const bot = createHarness();
  await bot.send("website");
  await bot.send("quote");
  await bot.send("Old Name");
  await bot.send("menu");
  await bot.send("app", { from: "919000000002" });
  await bot.send("automation");
  await bot.send("human");
  assert.equal(bot.leads[0].intent, "automation");
  assert.equal(bot.leads[0].name, "");
  assert.equal(bot.sessions.get("919000000002").intent, "app");
});

test("LinkedIn and website entry messages preserve attribution through the funnel", async () => {
  for (const [entry, source] of [["LinkedIn", "linkedin"], ["your website", "website"]]) {
    const bot = createHarness();
    await bot.send(`Hi Dhanush Technologies, I found you on ${entry}.`);
    await bot.send("complete");
    await bot.send("human");
    assert.equal(bot.leads[0].referralSource, source);
  }
});

test("company links work without creating leads or inventing missing URLs", async () => {
  const bot = createHarness();
  const reply = await bot.send("company");
  assert.doesNotMatch(reply.body, /https?:/);
  assert.equal(bot.leads.length, 0);
  const linked = createHarness({ getBusinessProfile: () => ({ website: "https://example.com", linkedin: "https://www.linkedin.com/company/example" }) });
  assert.match((await linked.send("linkedin")).body, /https:\/\/example.com/);
});

test("business configuration rejects unsafe, invalid or oversized links", () => {
  const originals = { website: process.env.BUSINESS_WEBSITE_URL, linkedin: process.env.BUSINESS_LINKEDIN_URL };
  try {
    for (const value of ["", "not a url", "javascript:alert(1)", "https://user:secret@example.com", `https://example.com/${"x".repeat(300)}`]) {
      process.env.BUSINESS_WEBSITE_URL = value;
      assert.equal(getBusinessProfile().website, "");
    }
    process.env.BUSINESS_WEBSITE_URL = "https://example.com";
    process.env.BUSINESS_LINKEDIN_URL = "https://www.linkedin.com/company/example";
    assert.equal(getBusinessProfile().website, "https://example.com/");
    assert.match(getBusinessProfile().linkedin, /linkedin.com/);
  } finally {
    for (const [key, value] of [["BUSINESS_WEBSITE_URL", originals.website], ["BUSINESS_LINKEDIN_URL", originals.linkedin]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test("pricing and a repeated quote button resume an active question", async () => {
  const bot = createHarness();
  await bot.send("quote");
  await bot.send("Meera");
  await bot.send("pricing");
  assert.match((await bot.send("get_quote", { isInteractive: true })).body, /business or project name/);
  assert.equal(bot.sessions.get("919000000001").name, "Meera");
  await bot.send("Gym");
  assert.equal(bot.sessions.get("919000000001").business, "Gym");
});

test("stale interactive service selections change service without becoming an answer", async () => {
  const bot = createHarness();
  await bot.send("quote");
  await bot.send("website", { isInteractive: true });
  assert.equal(bot.sessions.get("919000000001").intent, "website");
  assert.equal(bot.sessions.get("919000000001").name, "");
});

test("required answers cannot be skipped and oversized answers keep the current question", async () => {
  const bot = createHarness();
  await bot.send("quote");
  await bot.send("skip");
  assert.equal(bot.sessions.get("919000000001").step, "name");
  assert.match((await bot.send("x".repeat(121))).body, /under 120/);
  assert.equal(bot.sessions.get("919000000001").step, "name");
});

test("expired drafts reset and thanks does not create a lead", async () => {
  const bot = createHarness();
  await bot.send("quote");
  bot.sessions.get("919000000001").updatedAt = new Date(Date.now() - 86400001);
  await bot.send("thanks");
  assert.equal(bot.sessions.get("919000000001").step, "browse");
  assert.equal(bot.leads.length, 0);
});

test("lead persistence failures do not send success or notify the admin", async () => {
  const bot = createHarness({ saveLead: async () => { throw new Error("Database unavailable"); } });
  await assert.rejects(() => bot.send("human"), /Database unavailable/);
  assert.equal(bot.notifications.length, 0);
});

test("intent detection distinguishes WhatsApp from mobile apps and handles infrastructure", () => {
  assert.equal(detectIntent("WhatsApp automation"), "automation");
  assert.equal(detectIntent("an Android app"), "app");
  assert.equal(detectIntent("domain and server"), "infrastructure");
  assert.equal(detectIntent("a CRM dashboard"), "custom");
  assert.equal(detectIntent("complete website setup"), "complete");
  assert.equal(detectIntent("happy to chat"), "general");
});

test("new enquiry fields survive Mongoose validation and legacy leads still validate", () => {
  const lead = new Lead({ phone: "919000000001", business: "Company", budget: "Discuss", timeline: "Soon", referralSource: "linkedin", requestType: "quote" });
  assert.equal(lead.validateSync(), undefined);
  assert.equal(lead.toObject().business, "Company");
  assert.equal(lead.status, "new");
  assert.equal(new Lead({ phone: "919000000001", intent: "hire" }).validateSync(), undefined);
});

test("overlapping messages from one sender advance the enquiry in order", async () => {
  const bot = createHarness();
  await bot.send("quote");
  await Promise.all([bot.send("Ravi"), bot.send("Ravi Studio")]);
  assert.equal(bot.sessions.get("919000000001").name, "Ravi");
  assert.equal(bot.sessions.get("919000000001").business, "Ravi Studio");
  assert.equal(bot.sessions.get("919000000001").step, "requirements");
});

test("a new quote after completion starts a separate clean enquiry", async () => {
  const bot = createHarness();
  await bot.send("human");
  await bot.send("quote");
  await bot.send("Second client request");
  await bot.send("Business");
  await bot.send("A website for appointments");
  await bot.send("skip");
  await bot.send("skip");
  assert.equal(bot.leads.length, 2);
  assert.notEqual(bot.leads[0].enquiryId, bot.leads[1].enquiryId);
  assert.equal(bot.leads[1].intent, "website");
});

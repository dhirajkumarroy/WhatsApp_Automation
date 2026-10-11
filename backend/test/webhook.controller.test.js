import test from "node:test";
import assert from "node:assert/strict";
import axios from "axios";
import Session from "../src/models/session.model.js";
import Lead from "../src/models/lead.model.js";
import { handleWebhook } from "../src/controllers/webhook.controller.js";

const invoke = async (message, id) => {
  let status;
  await handleWebhook({ body: { entry: [{ changes: [{ value: {
    contacts: [{ wa_id: "919000000001", profile: { name: "Profile Name" } }],
    messages: [{ from: "919000000001", id, ...message }]
  } }] }] } }, { sendStatus: (value) => { status = value; } });
  return status;
};

test("webhook preserves interactive IDs, profile name, notification fields and retry response", async (t) => {
  const environmentKeys = ["META_TOKEN", "PHONE_NUMBER_ID", "ADMIN_WHATSAPP_NUMBER"];
  const previous = environmentKeys.map((key) => process.env[key]);
  process.env.META_TOKEN = "test-only-token";
  process.env.PHONE_NUMBER_ID = "test-only-number";
  process.env.ADMIN_WHATSAPP_NUMBER = "919000000099";
  t.after(() => environmentKeys.forEach((key, index) => {
    if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index];
  }));
  t.mock.method(console, "log", () => {});
  let session;
  let lead;
  const outgoing = [];
  t.mock.method(Session, "findOne", () => ({ lean: async () => session }));
  t.mock.method(Session, "findOneAndUpdate", async (_filter, update) => {
    session = structuredClone(update.$set);
    return session;
  });
  t.mock.method(Lead, "findOneAndUpdate", async (_filter, update) => {
    lead = update.$setOnInsert;
    return lead;
  });
  t.mock.method(axios, "post", async (_url, payload) => {
    outgoing.push(payload);
    return { data: { messages: [{ id: "sent-id" }] } };
  });
  assert.equal(await invoke({ type: "text", text: { body: "hi" } }, "greeting"), 200);
  assert.equal(outgoing[0].interactive.type, "button");
  assert.deepEqual(outgoing[0].interactive.action.buttons.map((button) => button.reply.id), ["language_en", "language_hinglish"]);
  assert.equal(await invoke({ type: "interactive", interactive: { button_reply: { id: "language_hinglish" } } }, "language-choice"), 200);
  assert.equal(outgoing[1].interactive.type, "list");
  assert.equal(outgoing[1].interactive.action.button, "Chunein");
  assert.equal(await invoke({ type: "interactive", interactive: { list_reply: { id: "infrastructure" } } }, "one"), 200);
  assert.equal(await invoke({ type: "interactive", interactive: { button_reply: { id: "talk_to_team" } } }, "two"), 200);
  assert.equal(lead.intent, "infrastructure");
  assert.equal(lead.name, "Profile Name");
  assert.equal(lead.requestType, "callback");
  assert.equal(lead.language, "hinglish");
  const notification = outgoing.find((payload) => payload.to === "919000000099");
  assert.match(notification.text.body, /Dhanush Technologies/);
  assert.match(notification.text.body, /Domain & Server Setup/);
  assert.match(notification.text.body, /Preferred language: Hinglish/);
  assert.match(outgoing.at(-1).interactive.body.text, /request save ho gayi/);
  assert.equal(await invoke({ type: "interactive", interactive: { button_reply: { id: "talk_to_team" } } }, "two"), 200);
  assert.equal(outgoing.filter((payload) => payload.to === "919000000099").length, 1);
});

test("webhook returns a retryable failure when persistence is unavailable", async (t) => {
  t.mock.method(console, "log", () => {});
  t.mock.method(console, "error", () => {});
  t.mock.method(Session, "findOne", () => ({ lean: async () => { throw new Error("Database unavailable"); } }));
  assert.equal(await invoke({ type: "text", text: { body: "hi" } }, "failed-message"), 500);
});

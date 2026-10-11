# Dhanush Technologies — WhatsApp and company messaging

## Configure your real links

Add these values to `backend/.env`, then restart the backend:

```env
BUSINESS_WEBSITE_URL=
BUSINESS_LINKEDIN_URL=
ADMIN_WHATSAPP_NUMBER=
```

Use your existing website URL and the actual LinkedIn company-page URL. Leave a URL blank until it is available; the bot never substitutes a made-up company link. URLs must use HTTP or HTTPS and be no longer than 250 characters. The admin number must include its country code. No default recipient is used.

Keep the existing Meta token, phone number ID, webhook verification token, MongoDB URI and admin credentials. Do not overwrite an existing `.env` with the example file. Configure `FRONTEND_URL` for the dashboard and `VITE_API_URL` for its backend API. The default local backend port is 3000.

## Client journey

1. A client sends `hi` or opens WhatsApp from your website or LinkedIn page.
2. The bot introduces itself as the Dhanush Technologies automated enquiry assistant.
3. The client chooses Website Development, App Development, WhatsApp Automation, Custom Software, Domain & Server Setup, or Complete Project Setup.
4. `Get a Quote` collects name, business/project, requirements, budget and launch timeline. Budget and timeline support `skip`.
5. The completed enquiry appears in the admin dashboard and triggers an admin notification attempt. A client can also request a callback at any time using `human` or `Talk to Team`.
6. Your team reviews the request, agrees on scope and price, and manages the lead status.

Clients can type a project request directly; the bot keeps it while gathering the remaining details. `menu`, `cancel` and `restart` leave the draft enquiry. `pricing` and company information preserve the current question; `Get a Quote` resumes it. Drafts are stored in MongoDB and reset after 24 hours of inactivity. Drafts become dashboard leads when completed or when a callback is requested.

Old website-category menu IDs and `get_started`, `talk_to_me`, and `view_demo` remain supported. Older dashboard leads remain readable. The existing admin login and stored token key remain compatible.

## Connect website and LinkedIn enquiries

Use your **customer-facing bot number**, with country code and digits only, in a click-to-chat URL:

```text
https://wa.me/BOT_NUMBER?text=ENCODED_MESSAGE
```

For the website, encode this message with `encodeURIComponent`:

```text
Hi Dhanush Technologies, I found you on your website.
```

For LinkedIn:

```text
Hi Dhanush Technologies, I found you on LinkedIn.
```

Those exact starter messages open the menu and record `website` or `linkedin` as the enquiry's referral source. Other messages are recorded as direct WhatsApp enquiries. This is message-based attribution, not a LinkedIn API integration. Add the resulting link wherever your website or company page allows a contact link.

## LinkedIn company-page draft

Company name: **Dhanush Technologies**

Tagline:

> Websites, apps & business automation — from your idea to complete domain, server setup and launch.

About:

> Dhanush Technologies helps businesses and founders turn ideas into working digital products. We build business websites, online stores, mobile and web applications, WhatsApp automations, and custom software designed around your requirements.
>
> We also handle the technical setup needed to launch: domains, DNS, hosting, servers, SSL, databases and deployment. From planning and development to testing and handover, you can work with one team throughout your project.
>
> Have a new idea or an existing process you want to improve? Share your requirements with us. We will discuss your goals, scope, timeline and a tailored proposal, including any ongoing maintenance you need.
>
> Contact us through our website or WhatsApp to discuss your project.

Specialties: Website Development, Web Applications, Mobile Apps, E-commerce, WhatsApp Automation, Business Process Automation, Custom Software, API Integrations, Domain Setup, Cloud Hosting, Server Configuration, Deployment and Maintenance.

Use your real website, location and company details when publishing. This document is draft copy; it does not create or update an external LinkedIn page.

## Validation and operation

```bash
cd backend
npm test
```

```bash
cd frontend
npm run build
npm run lint
```

Automated flow tests use isolated in-memory substitutes for persistence and notifications. They do not contact customers or validate live Meta credentials. Before using the deployment, run a complete enquiry from your own WhatsApp number and confirm the dashboard entry and admin notification.

The service descriptions describe projects Dhanush Technologies offers to build. This repository implements incoming enquiries, quote collection and callback requests. It does not provision domains/servers, publish a LinkedIn page, schedule campaigns, or calculate binding quotes automatically.

Admin notifications use the existing free-form WhatsApp text sender. Delivery depends on Meta accepting the message; errors are logged while the lead remains saved. Where Meta requires an approved template to initiate a conversation with the admin, configure that delivery integration before relying on notifications. See the [WhatsApp messaging policy](https://business.whatsapp.com/policy).

Interactive replies are kept within the documented [body limits](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/types/InteractiveObject/), [button counts](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/types/ActionObject/) and [row text limits](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/types/RowObject/).

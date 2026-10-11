# Dhanush Technologies — WhatsApp Automation and Lead Management

This project is a MERN-style WhatsApp automation system for Dhanush Technologies. It receives WhatsApp messages through the Meta WhatsApp Cloud API, replies with menus/buttons, captures interested users as leads, notifies the admin WhatsApp number, and shows leads inside a protected admin dashboard.

Company setup, referral links and LinkedIn page copy: [Dhanush Technologies setup guide](docs/DHANUSH-SETUP.md).

## What This Project Does

The system works like a small sales assistant on WhatsApp.

1. A customer sends a message to your WhatsApp bot number.
2. Meta sends that message to this backend through the webhook.
3. The backend understands the message and replies with text, buttons, or list menus.
4. The bot collects project details and saves a lead when the enquiry is complete or the client requests a callback.
5. The backend attempts a detailed WhatsApp lead notification to the configured admin number.
6. The admin can log in to the frontend dashboard and manage the lead status.

Example admin notification:

```text
Dhanush Technologies — New project enquiry

Name: Asha
Phone: 91xxxxxxxxxx
Business: Asha Studio
Service: Website Development
Budget: To discuss
Timeline: Next month
Found us on: linkedin

Requirements: A business website with bookings and complete launch setup
```

## Main Features

- WhatsApp webhook verification for Meta setup.
- WhatsApp incoming message handling.
- Interactive WhatsApp replies using:
  - text messages
  - reply buttons
  - list menus
- English / Hinglish selection with saved language preference and language changes during an enquiry.
- Six service flows: websites, apps, WhatsApp automation, custom software, domain/server setup, and complete project setup.
- Guided enquiries with name, business, requirements, budget and launch timeline.
- Persistent draft sessions, callback requests, and website/LinkedIn referral tracking.
- Admin WhatsApp notification attempts for completed enquiries and callbacks.
- MongoDB lead storage.
- Protected admin dashboard using JWT login.
- Lead status update: `new`, `contacted`, `converted`.
- Swagger API documentation at `/api-docs`.

## Tech Stack

Backend:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs
- Axios
- WhatsApp Cloud API
- Swagger UI

Frontend:

- React
- Vite
- Axios
- Tailwind CSS

Infrastructure:

- Docker
- Docker Compose
- MongoDB container

## Project Structure

```text
whatsapp-automation/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   ├── env.js             # Loads backend/.env safely
│   │   │   └── swagger.js         # API docs config
│   │   ├── controllers/
│   │   │   ├── auth.controller.js # Admin login
│   │   │   ├── lead.controller.js # Lead list/update API
│   │   │   └── webhook.controller.js # WhatsApp webhook handler
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js # JWT protection
│   │   │   └── error.middleware.js
│   │   ├── models/
│   │   │   ├── admin.model.js
│   │   │   └── lead.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── lead.routes.js
│   │   │   └── webhook.routes.js
│   │   ├── scripts/
│   │   │   └── seed-admin.js      # Creates first admin user
│   │   ├── services/
│   │   │   ├── lead.service.js    # Saves leads
│   │   │   ├── message.service.js # Bot conversation logic
│   │   │   ├── notify.service.js  # Sends admin lead notifications
│   │   │   └── whatsapp.service.js # Sends WhatsApp API messages
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   └── main.jsx
│   └── package.json
└── docker-compose.yml
```

## How The WhatsApp Flow Works

### 1. Webhook receives user message

File:

```text
backend/src/controllers/webhook.controller.js
```

This file reads the incoming WhatsApp payload from Meta. It supports:

- normal text messages
- button replies
- list replies
- WhatsApp status updates

Then it sends the cleaned message to `message.service.js`.

### 2. Bot decides what to reply

File:

```text
backend/src/services/message.service.js
```

This is the main brain of the bot.

Current flows:

- First-time clients choose English or Hinglish before continuing; returning clients use their saved preference.
- `hi`, `hello`, `start`, `menu` show the Dhanush Technologies service menu in the selected language.
- `language` or the Change Language / Bhasha Badlein menu option changes language without losing draft answers.
- Six service choices explain the available work and offer a quote or team callback.
- `get_quote` collects name, business/project, requirements, budget and launch timeline.
- A custom project message is retained as requirements while the bot collects the remaining details.
- `skip` is supported for budget and timeline; `menu` or `cancel` leaves a draft.
- `human` or `talk_to_team` saves a callback request with any details already collected.
- `company` / `linkedin` share configured company links; missing links are omitted.
- `pricing` explains tailored proposals and separately scoped development, infrastructure and support costs.
- Exact website/LinkedIn starter messages in the setup guide record referral source.

Service intents: `website`, `app`, `automation`, `custom`, `infrastructure`, `complete`, or `general`. Legacy menu IDs remain supported.

### 3. Lead is saved

File:

```text
backend/src/services/lead.service.js
backend/src/models/lead.model.js
```

Lead data stored:

- phone
- name
- message
- intent (requested service)
- business
- budget
- timeline
- source
- referralSource
- language (`en` or `hinglish`)
- requestType (`quote` or `callback`)
- enquiryId
- status
- createdAt
- updatedAt

Default status is `new`.

### 4. Admin gets WhatsApp notification

File:

```text
backend/src/services/notify.service.js
```

When a lead is saved, the backend sends the lead details to:

```env
ADMIN_WHATSAPP_NUMBER=replace_with_admin_number_with_country_code
```

If this value is missing or invalid, the notification is skipped and logged. The enquiry is still saved. There is no fallback recipient.

### 5. Reply is sent back to the customer

File:

```text
backend/src/services/whatsapp.service.js
```

This file sends messages through the Meta WhatsApp Cloud API.

It uses:

```env
META_TOKEN=your_meta_token
PHONE_NUMBER_ID=your_phone_number_id
```

## Backend API Routes

Webhook routes:

```text
GET  /       # Meta webhook verification
POST /       # Incoming WhatsApp messages
```

Auth routes:

```text
POST /api/auth/login
```

Lead routes:

```text
GET /api/leads
PUT /api/leads/:id
```

Lead routes are protected by JWT.

API docs:

```text
GET /api-docs
```

Health check:

```text
GET /api/health
```

## Environment Variables

Create this file:

```text
backend/.env
```

Use this format:

```env
PORT=3000
HOST=0.0.0.0

MONGO_URI=mongodb://127.0.0.1:27017/whatsapp-ai-bot

JWT_SECRET=replace_with_strong_random_secret

WEBHOOK_VERIFY_TOKEN=replace_with_your_verify_token

META_TOKEN=replace_with_meta_access_token
PHONE_NUMBER_ID=replace_with_phone_number_id

ADMIN_WHATSAPP_NUMBER=replace_with_admin_number_with_country_code

FRONTEND_URL=http://localhost:5173
BUSINESS_WEBSITE_URL=
BUSINESS_LINKEDIN_URL=

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
```

Frontend env:

```text
frontend/.env
```

```env
VITE_API_URL=http://localhost:3000/api
```

Important:

- Do not commit real `.env` secrets.
- `META_TOKEN` must be valid.
- `PHONE_NUMBER_ID` must belong to the WhatsApp bot number.
- `ADMIN_WHATSAPP_NUMBER` must include country code, for example `91xxxxxxxxxx`.

## Run Locally

Start MongoDB first. You can use your local MongoDB installation or Docker.

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Backend URL:

```text
http://localhost:3000
```

## Run With Docker

From the project root:

```bash
docker-compose up -d --build
```

This starts:

- MongoDB
- Backend API

The frontend still needs to be run separately unless you add it to Docker Compose.

## Create Admin User

Run once:

```bash
cd backend
npm run seed:admin
```

Set these values explicitly in `.env` before seeding your company admin:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
```

After login, the frontend stores the JWT and uses it to call protected lead APIs.

## Meta WhatsApp Setup

In Meta Developer Console:

1. Create or open your WhatsApp app.
2. Add the webhook callback URL.
3. Use this backend endpoint:

```text
https://your-public-domain.com/
```

4. Set verify token equal to:

```env
WEBHOOK_VERIFY_TOKEN=replace_with_your_verify_token
```

5. Subscribe to WhatsApp message events.
6. Add the correct `PHONE_NUMBER_ID` and `META_TOKEN` in `backend/.env`.

For local testing, expose your backend using a tunnel like ngrok:

```bash
ngrok http 3000
```

Then use the generated HTTPS URL as the Meta webhook callback URL.

## Where To Update Things

Update WhatsApp menu options:

```text
backend/src/services/message.service.js
```

Update lead intent detection:

```text
backend/src/services/message.service.js
```

Update admin lead notification text:

```text
backend/src/services/notify.service.js
```

Update WhatsApp API sending logic:

```text
backend/src/services/whatsapp.service.js
```

Update lead fields:

```text
backend/src/models/lead.model.js
```

Update admin dashboard UI:

```text
frontend/src/App.jsx
frontend/src/Login.jsx
```

Update API documentation:

```text
backend/src/config/swagger.js
```

## Troubleshooting

Admin lead notification not coming:

- Check backend terminal logs.
- Look for `Sending admin lead notification`.
- If you see `Admin lead notification failed`, check the Meta error response.
- Confirm `META_TOKEN` is valid.
- Confirm `PHONE_NUMBER_ID` is correct.
- Confirm admin number is allowed for your WhatsApp Cloud API setup.
- If using a Meta test number, add the admin number as a test recipient.

Bot not replying:

- Check if Meta webhook verification is successful.
- Check if webhook URL points to the running backend.
- Check `WEBHOOK_VERIFY_TOKEN`.
- Check backend logs for `Webhook error`.

Dashboard cannot load leads:

- Confirm backend is running.
- Confirm MongoDB is running.
- Confirm login token exists.
- Confirm `VITE_API_URL` points to the backend `/api` URL.

MongoDB not connecting:

- Check `MONGO_URI`.
- If using Docker Compose, backend should use:

```env
MONGO_URI=mongodb://mongo:27017/whatsapp-ai-bot
```

## Current Lead Journey

1. Customer sends `Hi`, chooses English or Hinglish if new, and selects `Complete Project Setup` / `Poora Project Setup`.
2. The bot explains development, automation, domain/server setup, launch and handover.
3. Customer selects `Get a Quote` and shares their name, business and requirements.
4. Customer provides budget and launch timeline, or skips those optional questions.
5. Backend saves the completed enquiry and attempts an admin notification.
6. Customer receives confirmation that the team will follow up on WhatsApp.
7. Admin opens the dashboard, reviews the project details and updates the lead status.

Run flow tests with `cd backend && npm test`. Live delivery still requires a configured Meta webhook, MongoDB and working WhatsApp credentials.

## License

ISC

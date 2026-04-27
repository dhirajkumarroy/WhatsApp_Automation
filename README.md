# WhatsApp Automation & Lead Management System

## 🚀 Overview

The **WhatsApp Automation** project is a comprehensive MERN-stack application designed to automate WhatsApp conversations, capture incoming leads seamlessly, and manage them via a secure web dashboard. By integrating with the official **WhatsApp Cloud API**, the system acts as an intelligent conversational bot (ScaleForge) that guides users through various flows (e.g., Services, Hiring, Projects) using interactive messages like buttons and lists.

## ✨ Key Features

- **Interactive WhatsApp Bot**: Engages users with predefined conversational flows using WhatsApp's interactive UI elements (Buttons, Lists).
- **Automated Lead Capture**: Intelligently parses user messages to capture leads, determine their intent (`automation` vs. `hire`), and save them directly to the database.
- **ScaleForge Lead Dashboard**: A modern, responsive React-based admin dashboard to monitor, search, and manage captured leads.
- **Lead Pipeline Management**: Track lead statuses seamlessly (`New`, `Contacted`, `Converted`) directly from the dashboard.
- **Secure Authentication**: JWT-based authentication system to protect lead data and the API.
- **API Documentation**: Swagger UI integrated for clear and interactive backend API documentation.
- **Containerized Environment**: Easy local setup and deployment using Docker and Docker Compose.

## 🛠️ Tech Stack

### Backend
- **Framework**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Integrations**: WhatsApp Cloud API (via Webhooks & Axios)
- **Docs**: Swagger UI

### Frontend
- **Framework**: React 19, Vite
- **Styling**: Tailwind CSS 4
- **API Client**: Axios

### Infrastructure
- Docker & Docker Compose

## 📂 Project Structure

```
whatsapp-automation/
├── backend/                  # Express.js REST API & Webhook handler
│   ├── src/
│   │   ├── controllers/      # Webhook, Auth, and Lead controllers
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API Endpoints
│   │   ├── services/         # Core logic (WhatsApp API, Message parsing)
│   │   └── server.js         # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # React Dashboard
│   ├── src/
│   │   ├── App.jsx           # Main Dashboard UI
│   │   ├── Login.jsx         # Authentication UI
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
└── docker-compose.yml        # Docker configuration for Mongo & Backend
```

## ⚙️ How It Works

1. **Webhook Integration**: The Meta (WhatsApp) developer platform is configured to send HTTP POST requests to the backend's `/` webhook endpoint whenever a user sends a message.
2. **Message Processing**: The `webhook.controller.js` receives the message, and the `message.service.js` parses the content to determine the appropriate response or menu to send back.
3. **Automated Replies**: Using `axios`, the backend sends text, buttons, or list templates back to the user via the WhatsApp Cloud API.
4. **Lead Generation**: If a user types a custom message indicating a specific intent, they are saved to the MongoDB database as a Lead.
5. **Dashboard Management**: Admins log into the React frontend, fetching real-time data from the backend to track, contact, and convert those leads.

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- A Meta Developer Account (with WhatsApp Cloud API set up)

### 1. Environment Configuration

**Backend (`backend/.env`):**
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/whatsapp-ai-bot
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key

# WhatsApp Cloud API Credentials
WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_TOKEN=your_whatsapp_permanent_access_token
PHONE_NUMBER_ID=your_whatsapp_phone_number_id
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Running with Docker (Recommended)

To spin up the MongoDB database and the backend server simultaneously:

```bash
docker-compose up -d --build
```
The backend will be available at `http://localhost:3000`.

### 3. Running Locally (Without Docker)

**Start the Backend:**
```bash
cd backend
npm install
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```
The frontend dashboard will be available at `http://localhost:5173`.

### 4. Setting up Admin User
To access the dashboard, you need an admin user. Run the seed script inside the backend:
```bash
cd backend
npm run seed:admin
```

## 📝 License
ISC License

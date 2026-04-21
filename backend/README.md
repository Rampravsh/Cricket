# Cricket Backend API

A production-ready Node.js backend using Express and MongoDB. Built with scalability, performance, and best practices in mind to support the Cricket Scoring Application.

## 🚀 Tech Stack

- **Node.js + Express** (v5.x) - Server framework
- **MongoDB + Mongoose** - Database and ORM
- **Socket.IO** - Real-time active match updates
- **dotenv** - Environment variable management

## 📁 Architecture (MVC)

The codebase follows a modular clean architecture:

```text
src/
├── app.js                 # Express setups, body parsers, & security middlewares
├── server.js              # Server entry point & graceful shutdown handler
├── config/                # Central config variables (.env mapper) & DB connection
├── controllers/           # Business logic and request handling (e.g., matchController.js)
├── middleware/            # Custom Express middleware (e.g., global errorHandler)
├── models/                # Mongoose Database Schemas (e.g., Match.js)
├── routes/                # API route definitions
├── sockets/               # Real-time WebSocket connection handling & event broadcasting
└── utils/                 # Reusable utility scripts (logger, standardized response wrapper)
```

## 🔒 Security Implementations

- **Helmet**: Secures incoming HTTP headers.
- **CORS**: Enforces approved origins.
- **Rate-Limiting**: Prevents brute-force/DDoS attacks limit (configurable per IP).
- **Express Mongo Sanitize**: Prevents NoSQL Query Injection attacks.

## ✨ Key Features Built

1. **Global Error Handling**: Centralized error middleware. Eliminates repetitive try-catch blocks and properly intercepts Mongoose Validation/Duplicate key errors.
2. **Async Catch Wrapper**: The `catchAsync.js` utility automatically catches Promise rejections so the server never crashes on unhandled promise rejections.
3. **Standardized Responses**: The `response.js` utility forces all endpoints to reply with a uniform `{ success, message, data }` response format.
4. **WebSocket Foundation**: Pre-configured Socket.IO handling namespaces and rooms (via matchId) to enable instant score-board syncing logic.
5. **Robust Booting Process**: Handled `uncaughtException` and `unhandledRejection` process events for professional-grade graceful shutdown implementations.

## 🏁 Getting Started

Ensure MongoDB is running, create your `.env` file from `.env.example`, and:
```bash
npm install
npm run dev     # Runs with nodemon for hot-reloading
```

### Health Check Endpoint
To ensure the backend is active, ping the health route:
`GET http://localhost:5000/api/v1/matches/health`

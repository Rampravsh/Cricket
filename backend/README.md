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

## 📡 API Endpoints

All endpoints respond with the standardized format: `{ success: boolean, message: string, data: object }`.

### 🔑 Authentication
#### 1. Google Login
- **Route:** `POST /api/v1/auth/google`
- **Body Example:**
  ```json
  {
    "idToken": "GOOGLE_ID_TOKEN"
  }
  ```
- **Description:** Verifies the Google ID Token and returns a JWT for the user.

### 👤 User Management
#### 1. Get My Profile
- **Route:** `GET /api/v1/users/me`
- **Headers Needed:** `Authorization: Bearer <token>`
- **Description:** Returns the authenticated user's data.

#### 2. Update My Profile
- **Route:** `PATCH /api/v1/users/me`
- **Headers Needed:** `Authorization: Bearer <token>`
- **Body Example:** `{ "name": "New Name" }`

### 🏏 Match Flow
#### 1. Create a Match
- **Route:** `POST /api/v1/matches/create`
- **Headers Needed:**
  - `x-device-id`: Your unique device ID (used to identify host/scorer).
- **Body Example:**
  ```json
  {
    "matchId": "M123",
    "teams": [
      { "name": "Team A", "players": [{ "id": "p1", "name": "Player 1" }] },
      { "name": "Team B", "players": [{ "id": "p2", "name": "Player 2" }] }
    ],
    "isPublic": true,
    "toss": { "winner": "Team A", "decision": "bat" }
  }
  ```

#### 2. Start a Match
- **Route:** `PATCH /api/v1/matches/:matchId/start`
- **Description:** Transitions a match status from `waiting` to `live` and initializes the current on-field players. Emits the `match-started` socket event.

#### 3. Process a New Ball
- **Route:** `POST /api/v1/matches/:matchId/ball`
- **Headers Needed:**
  - `x-device-id`: Must match the `activeScorer` ID of the live match.
- **Body Example:**
  ```json
  {
    "runs": 2,
    "extra": null,
    "wicket": false,
    "strikerId": "p1",
    "bowlerId": "p2"
  }
  ```

#### 4. Get Public Matches
- **Route:** `GET /api/v1/matches/public`
- **Query Params:** `?page=1&limit=10`
- **Description:** Returns paginated live/waiting matches flagged as `isPublic: true`.

#### 5. Fetch a Specific Match
- **Route:** `GET /api/v1/matches/:matchId`
- **Description:** Returns the full comprehensive state of a match (score, ball logs, status).

## 🔌 WebSockets / Socket.IO
- **Connect:** Connect your socket instance to the server URL.
- **Join Room:** Emit `'join-match'` with `matchId` to get updates for that match.
- **Events Received:**
  - `'match-created'`: Triggers when a new match is generated.
  - `'match-started'`: Triggers when a match transitions to live.
  - `'score-updated'`: Triggers immediately after a new ball is processed successfully.


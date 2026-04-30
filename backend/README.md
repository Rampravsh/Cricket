# Cricket Backend API

A production-ready Node.js backend using Express and MongoDB. Built with scalability, performance, and best practices in mind to support the Cricket Scoring Application.

## 🚀 Tech Stack

- **Node.js + Express** (v5.x) - Server framework
- **MongoDB + Mongoose** - Database and ORM
- **Socket.IO** - Real-time active match updates
- **Firebase Admin SDK** - Push notifications (FCM)
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
5. **Push Notifications**: Integrated Firebase Cloud Messaging (FCM) for real-time alerts (match invites, scorer requests, and live updates).
6. **Robust Booting Process**: Handled `uncaughtException` and `unhandledRejection` process events for professional-grade graceful shutdown implementations.

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
    "toss": { "winner": "Team A", "decision": "bat" },
    "format": "T20",
    "overs": 20,
    "maxPlayers": 11,
    "players": [
      { "playerId": "USER_ID", "name": "Player Name" }
    ]
  }
  ```

#### 2. Get My Match History
- **Route:** `GET /api/v1/matches/my-history` (or `GET /api/v1/users/me/matches`)
- **Headers Needed:** `Authorization: Bearer <token>`
- **Description:** Returns a list of matches where the user participated as a player, host, or scorer, including their performance stats.

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
- **Note:** Only the `activeScorer` or authorized `scorers` can use this endpoint.

#### 5. Invite a Player
- **Route:** `POST /api/v1/matches/:matchId/invite-player`
- **Body Example:** `{ "userId": "ID", "name": "Name" }`
- **Description:** Invites a registered user to join a team in the match.

#### 6. Player Response
- **Route:** `PATCH /api/v1/matches/:matchId/player-response`
- **Body Example:** `{ "status": "accepted" }` // or "rejected"
- **Description:** Accept or reject a match invitation.

#### 7. Request to Score
- **Route:** `POST /api/v1/matches/:matchId/request-scorer`
- **Description:** Request permission to be a scorer for a specific match.

#### 8. Scorer Response (Host Only)
- **Route:** `PATCH /api/v1/matches/:matchId/scorer-response`
- **Body Example:** `{ "userId": "ID", "status": "accepted" }`
- **Description:** The match host can approve or reject scorer requests.

#### 4. Get Public Matches
- **Route:** `GET /api/v1/matches/public`
- **Query Params:** `?page=1&limit=10`
- **Description:** Returns paginated live/waiting matches flagged as `isPublic: true`.

#### 5. Fetch a Specific Match
- **Route:** `GET /api/v1/matches/:matchId`
- **Description:** Returns the full comprehensive state of a match (score, ball logs, status). Also includes a `roles` array for the authenticated user (e.g., `['host', 'scorer']`).

#### 6. Replace Player
- **Route:** `PATCH /api/v1/matches/:matchId/replace-player`
- **Body Example:** `{ "oldPlayerId": "ID1", "newPlayer": { "playerId": "ID2", "name": "Name" } }`
- **Description:** Replace a waiting/absent player in a match.

### 📊 Dashboard & Feed
#### 1. Get Dashboard
- **Route:** `GET /api/v1/users/me/dashboard`
- **Description:** Returns aggregated stats, active matches, and recent activity for the user.

#### 2. Social Feed
- **Route:** `GET /api/v1/feed`
- **Description:** Returns a global feed of recent match activities and milestones.

### 👥 Player & Search
#### 1. Search Players
- **Route:** `GET /api/v1/players/search?q=query`
- **Description:** Search for registered users to invite to matches.

#### 2. Player Stats
- **Route:** `GET /api/v1/players/:id`
- **Description:** Returns comprehensive career stats for a specific player.

### 🔔 Notifications
#### 1. Register FCM Token
- **Route:** `POST /api/v1/users/register-fcm-token`
- **Body:** `{ "token": "FCM_TOKEN" }`
- **Description:** Saves the user's device token for push notifications.

## 🔌 WebSockets / Socket.IO
- **Connect:** Connect your socket instance to the server URL.
- **Join Room:** Emit `'join-match'` with `matchId` to get updates for that match.
- **Events Received:**
  - `'match-created'`: Triggers when a new match is generated.
  - `'match-started'`: Triggers when a match transitions to live.
  - `'score-updated'`: Triggers immediately after a new ball is processed successfully.

## 🛡️ Middlewares

- **`protect`**: Ensures the user is authenticated via JWT.
- **`canScoreMatch`**: Ensures only the host or an approved scorer can perform scoring actions (start match, add ball).


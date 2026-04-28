# 🏏 Cricket Live — React Native App

A production-ready React Native (Expo) cricket scoring and live match tracking app. Built with clean, scalable architecture using JavaScript.

## 📁 Project Structure

```
Cricket/
├── frontend/          ← React Native (Expo) app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/       # Screen-level components
│   │   ├── navigation/    # Stack navigator
│   │   ├── hooks/         # Custom hooks (useTheme, useSocket)
│   │   ├── store/         # Redux Toolkit (match, user slices)
│   │   ├── services/      # Axios API service layer
│   │   ├── theme/         # Colors, spacing, typography, ThemeContext
│   │   ├── utils/         # Helper functions
│   │   └── constants/     # App-wide constants & env config
│   ├── App.js
│   └── package.json
└── backend/           ← Node.js/Express API & Socket.IO WebSockets
```

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo (Blank JS) |
| State Management | Redux Toolkit |
| Navigation | React Navigation v6 (Stack) |
| HTTP Client | Axios |
| Theme | React Context + useColorScheme |
| Architecture | Functional components + hooks only |

## 🚀 Getting Started

```bash
# Install dependencies
cd frontend
npm install

# Start Expo development server
npm run start       # or npx expo start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## 🎨 Features

- ✅ **Google Authentication** — Full integration with `@react-native-google-signin/google-signin` and backend JWT verification
- ✅ **Light / Dark mode** — auto-detects system preference via `useColorScheme()`
- ✅ **Reusable components** — Button (variants), ScoreButton, Header, Card, Input
- ✅ **Redux Toolkit store** — `matchSlice` + `userSlice` with selectors + Async Thunks
- ✅ **API service layer** — Active Axios integration connecting to `backend/` endpoints
- ✅ **Absolute imports** — `~/` maps to `src/` via `babel-plugin-module-resolver`
- ✅ **Stack navigation** — slide transition, custom Header per screen
- ✅ **Cricket scoring UI** — ScoreButton grid, over tracker, scoreboard
- ✅ **Multi-Scorer Support** — Multiple users can request to score; host can approve.
- ✅ **Match Invitations** — Invite players to matches via notifications.

## 🧩 Key Decisions

- **No TypeScript** — Pure JavaScript throughout
- **No inline styles** — All styling via `StyleSheet.create()` + theme tokens
- **Theme via Context** (not Redux) — UI concern, uses `useColorScheme()` for system detection
- **Each screen owns its Header** — Gives full layout control vs native navigator header

## 🛠 Environment Config

Edit `src/constants/index.js` to set your API/WebSocket URLs:

```js
export const ENV = {
  API_BASE_URL: 'http://YOUR_IP:5000/api/v1',
  SOCKET_URL:   'ws://YOUR_IP:5000',
};
```

## 🔮 Roadmap

- [x] Backend Node.js/Express server in `backend/`
- [x] API Integration for Match lifecycle (Create, Start)
- [x] Socket.IO integration for real-time scoring
- [x] Authentication flow (Google Sign-In integration)
- [x] Match history & stats (Backend API & Redux state)
- [ ] Scorecard screen
- [ ] Push notifications for wickets/milestones
- [ ] Tournament management


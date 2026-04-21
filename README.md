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
└── backend/           ← (coming soon)
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

- ✅ **Light / Dark mode** — auto-detects system preference via `useColorScheme()`
- ✅ **Reusable components** — Button (variants), ScoreButton, Header, Card, Input
- ✅ **Redux Toolkit store** — `matchSlice` + `userSlice` with selectors
- ✅ **API service layer** — Axios instance with interceptors (`src/services/api.js`)
- ✅ **Absolute imports** — `~/` maps to `src/` via `babel-plugin-module-resolver`
- ✅ **Stack navigation** — slide transition, custom Header per screen
- ✅ **useSocket hook** — placeholder ready for Socket.IO backend
- ✅ **Cricket scoring UI** — ScoreButton grid, over tracker, scoreboard

## 🧩 Key Decisions

- **No TypeScript** — Pure JavaScript throughout
- **No inline styles** — All styling via `StyleSheet.create()` + theme tokens
- **Theme via Context** (not Redux) — UI concern, uses `useColorScheme()` for system detection
- **Each screen owns its Header** — Gives full layout control vs native navigator header

## 🛠 Environment Config

Edit `src/constants/index.js` to set your API/WebSocket URLs:

```js
export const ENV = {
  API_BASE_URL: 'http://YOUR_IP:5000/api',
  SOCKET_URL:   'ws://YOUR_IP:5000',
};
```

## 🔮 Roadmap

- [ ] Backend Node.js/Express server in `backend/`
- [ ] Socket.IO integration for real-time scoring
- [ ] Authentication flow (login/register screens)
- [ ] Scorecard screen
- [ ] Match history & stats
- [ ] Push notifications for wickets/milestones

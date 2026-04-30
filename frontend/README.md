# Cricket Frontend — React Native App

A premium, high-performance cricket scoring mobile application built with React Native and Expo.

## 🚀 Tech Stack

- **Framework:** [Expo](https://expo.dev/) (SDK 54)
- **Navigation:** [React Navigation v7](https://reactnavigation.org/) (Stack & Bottom Tabs)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Authentication:** Google Sign-In (`@react-native-google-signin/google-signin`)
- **Real-time Updates:** [Socket.IO Client](https://socket.io/)
- **Push Notifications:** [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) & FCM
- **Styling:** `StyleSheet.create()` + Custom Theme Engine
- **Feedback:** Haptics (`expo-haptics`) and Audio (`expo-av`)

## 🛠 Features

- **Live Scoring:** Real-time match updates via WebSockets with haptic feedback.
- **Match Creation:** Comprehensive multi-step flow for configuring teams, toss, and match format.
- **Profile Hub:** Personalized dashboard showing stats (runs, wickets) and match history.
- **Invitations:** Manage match invitations and scorer requests from other users.
- **Dynamic Theming:** Auto-switching light/dark mode based on system preferences.
- **Interactive UI:** Premium motion design with scale animations and glassmorphism.
- **Push Alerts:** Integration with Firebase Cloud Messaging for match invites and critical updates.
- **Clean Architecture:** Service-based API layer and Redux-driven state.

## 📁 Directory Structure

```text
src/
├── components/    # Atomic UI components (Button, Card, Input, etc.)
├── screens/       # Full-page screen components
├── navigation/    # Root, Auth, and App navigators
├── store/         # Redux slices, thunks, and store configuration
├── services/      # Axios API and Socket.IO service classes
├── theme/         # Color palettes, typography, and ThemeProvider
├── hooks/         # Custom hooks (useAuth, useSocket, useTheme)
├── utils/         # Formatters, validators, and helpers
├── constants/     # Environment variables and app-wide constants
└── assets/        # Images, fonts, and sound files
```

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Expo Go app on your mobile device or an Emulator (Android Studio/Xcode)

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root of the `frontend` directory:
```env
API_BASE_URL=http://<YOUR_LOCAL_IP>:5000/api/v1
SOCKET_URL=ws://<YOUR_LOCAL_IP>:5000
GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
```

### 4. Running the App
```bash
# Start Expo development server
npm run start

# To run on specific platforms:
npm run android
npm run ios
```

## 🔌 API & Services

The app communicates with the backend via a centralized service layer:
- **apiService.js:** Handles all HTTP requests using Axios.
- **socketService.js:** Manages WebSocket connections and event listeners.
- **authService.js:** Integrates Google Sign-In and JWT handling.
- **notificationService.js:** Manages FCM token registration and notification listeners.

## 🎨 UI/UX Design

- **Haptics:** Physical feedback on score buttons and major events.
- **Sound:** Audio cues for boundaries, wickets, and match starts.
- **Glassmorphism:** Subtle blur effects and gradients for a modern look.

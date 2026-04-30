import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import store from '~/store';
import { ThemeProvider } from '~/theme';
import AppNavigator from '~/navigation/AppNavigator';

import { useDispatch, useSelector } from 'react-redux';
import authService from '~/services/authService';
import { connectSocket, joinUser, listenToNotifications } from '~/services/socket';
import { addNotification } from '~/store/notificationSlice';

import { registerForPushNotificationsAsync, setupNotificationListeners } from '~/utils/notifications';
import { listenToMatchUpdates } from '~/services/socket';
import { fetchMatchThunk } from '~/store/matchSlice';

/**
 * Main app content to handle initialization
 */
function AppContent() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  React.useEffect(() => {
    // Load persisted auth session on startup
    authService.loadAuthData();
  }, []);

  React.useEffect(() => {
    if (user?._id) {
      // Setup Socket
      connectSocket();
      joinUser(user._id);

      listenToNotifications((notification) => {
        dispatch(addNotification(notification));
      });

      listenToMatchUpdates((data) => {
        console.log('[Socket] Match updated:', data);
        // If we are tracking a match, refresh it
        if (data.matchId) {
          // You might want to refresh specific match if currently viewed
          // For now, we can just trigger a general refresh if needed
        }
      });

      // Setup Push Notifications
      registerForPushNotificationsAsync();
    }
  }, [user?._id, dispatch]);

  // Handle deep linking / navigation from notifications
  React.useEffect(() => {
    // Note: We need a navigation ref or use navigation within a component that has it.
    // AppContent is inside NavigationContainer (via AppNavigator), so we can't use useNavigation here directly if it's not a screen.
    // However, setupNotificationListeners can take a reference or we can handle it inside the navigator.
    // For now, let's just initialize it.
    const cleanup = setupNotificationListeners();
    return () => cleanup && cleanup();
  }, []);

  return <AppNavigator />;
}

/**
 * App — Root component
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

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
      connectSocket();
      joinUser(user._id);

      listenToNotifications((notification) => {
        dispatch(addNotification(notification));
      });
    }
  }, [user?._id, dispatch]);

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

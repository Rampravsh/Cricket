import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import store from '~/store';
import { ThemeProvider } from '~/theme';
import AppNavigator from '~/navigation/AppNavigator';

import authService from '~/services/authService';

/**
 * Main app content to handle initialization
 */
function AppContent() {
  React.useEffect(() => {
    // Load persisted auth session on startup
    authService.loadAuthData();
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

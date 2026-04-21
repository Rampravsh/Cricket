import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import store from '~/store';
import { ThemeProvider } from '~/theme';
import AppNavigator from '~/navigation/AppNavigator';

/**
 * App — Root component
 *
 * Provider hierarchy (outermost → innermost):
 *   GestureHandlerRootView   — required for react-navigation gestures
 *   SafeAreaProvider         — safe area insets
 *   Redux Provider           — global state
 *   ThemeProvider            — light/dark theme (auto system detection)
 *   AppNavigator             — navigation container + screens
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider>
            <AppNavigator />
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

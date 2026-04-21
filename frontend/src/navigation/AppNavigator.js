import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '~/hooks/useTheme';
import { SCREENS } from '~/constants';
import HomeScreen from '~/screens/HomeScreen';
import LiveMatchScreen from '~/screens/LiveMatchScreen';

const Stack = createStackNavigator();

/**
 * AppNavigator — Root navigation stack
 * All headers are hidden; each screen manages its own Header component
 * for full theme and layout control.
 */
function AppNavigator() {
  const { colors } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: colors.statusBar === 'light',
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.danger,
        },
      }}
    >
      <Stack.Navigator
        initialRouteName={SCREENS.HOME}
        screenOptions={{
          headerShown: false, // Custom Header component used per screen
          cardStyle: { backgroundColor: colors.background },
          // Smooth slide animation
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }),
        }}
      >
        <Stack.Screen name={SCREENS.HOME} component={HomeScreen} />
        <Stack.Screen name={SCREENS.LIVE_MATCH} component={LiveMatchScreen} />
        {/* Future screens — add here:
          <Stack.Screen name={SCREENS.MATCH_LIST} component={MatchListScreen} />
          <Stack.Screen name={SCREENS.SCORECARD}  component={ScorecardScreen} />
          <Stack.Screen name={SCREENS.SETTINGS}   component={SettingsScreen} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;

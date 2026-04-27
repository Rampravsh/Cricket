import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '~/hooks/useTheme';
import { SCREENS } from '~/constants';
import BottomTabs from './BottomTabs';
import NotificationScreen from '~/screens/NotificationScreen';

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
        initialRouteName={SCREENS.MAIN_TABS}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
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
        <Stack.Screen name={SCREENS.MAIN_TABS} component={BottomTabs} />
        <Stack.Screen name={SCREENS.NOTIFICATIONS} component={NotificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;

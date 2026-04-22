import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '~/hooks/useTheme';
import { SCREENS } from '~/constants';

// Target Screens
import HomeScreen from '~/screens/HomeScreen';
import LiveMatchScreen from '~/screens/LiveMatchScreen';
import QuickMatchScreen from '~/screens/QuickMatchScreen';
import HistoryScreen from '~/screens/HistoryScreen';
import ProfileScreen from '~/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Custom Center Button for QuickMatch
const CustomTabBarButton = ({ children, onPress, colors }) => (
  <View style={styles.centerButtonWrapper}>
    <TouchableOpacity
      style={[
        styles.centerButton,
        { backgroundColor: colors.primary, shadowColor: colors.primary }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  </View>
);

function BottomTabs() {
  const { colors, spacing } = useTheme();
  
  // Choose blur tint based on the theme
  const blurTint = colors.background === '#121212' ? 'dark' : 'light';

  return (
    <Tab.Navigator
      initialRouteName={SCREENS.HOME}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarStyle: {
          position: 'absolute',
          bottom: spacing[4],
          left: spacing[4],
          right: spacing[4],
          height: 64,
          borderRadius: 32,
          backgroundColor: Platform.OS === 'android' ? colors.card : 'transparent', // Android blur fallback
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              tint={blurTint}
              intensity={80}
              style={[StyleSheet.absoluteFill, { borderRadius: 32, overflow: 'hidden' }]}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { borderRadius: 32, backgroundColor: colors.surface }]} />
          )
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === SCREENS.HOME) {
            iconName = 'home';
          } else if (route.name === SCREENS.LIVE_MATCH) {
            iconName = 'radio';
          } else if (route.name === SCREENS.HISTORY) {
            iconName = 'clock';
          } else if (route.name === SCREENS.PROFILE) {
            iconName = 'user';
          }

          // We implement slight scale effect using manual styling or standard icon sizing
          const iconSize = focused ? size + 4 : size;

          return <Feather name={iconName} size={iconSize} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name={SCREENS.HOME} 
        component={HomeScreen} 
      />
      <Tab.Screen 
        name={SCREENS.LIVE_MATCH} 
        component={LiveMatchScreen} 
      />
      
      {/* Center Tab */}
      <Tab.Screen 
        name={SCREENS.QUICK_MATCH} 
        component={QuickMatchScreen} 
        options={{
          tabBarIcon: () => (
             <Feather name="plus" size={32} color="#fff" />
          ),
          tabBarButton: (props) => (
             <CustomTabBarButton {...props} colors={colors} />
          )
        }}
      />

      <Tab.Screen 
        name={SCREENS.HISTORY} 
        component={HistoryScreen} 
      />
      <Tab.Screen 
        name={SCREENS.PROFILE} 
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerButtonWrapper: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default BottomTabs;

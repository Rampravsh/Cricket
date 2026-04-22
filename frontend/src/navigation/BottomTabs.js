import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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

// Custom Center Button for QuickMatch — Neon Glow Ring
const CustomTabBarButton = ({ children, onPress, colors }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.8, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.centerButtonWrapper}>
      {/* Outer neon glow ring */}
      <Animated.View
        style={[
          styles.centerGlowRing,
          {
            opacity: glowAnim,
            borderColor: colors.primary,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <TouchableOpacity
        style={styles.centerButtonOuter}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.centerBtnGradStart, colors.centerBtnGradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.centerButtonGradient}
        >
          {children}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

function BottomTabs() {
  const { colors, spacing, isDark } = useTheme();

  const blurTint = isDark ? 'dark' : 'light';

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
          bottom: spacing[3],
          left: spacing[4],
          right: spacing[4],
          height: 64,
          borderRadius: 32,
          backgroundColor: Platform.OS === 'android' ? colors.tabBarBg : 'transparent',
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.tabBarBorder,
          elevation: 12,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.25 : 0.1,
          shadowRadius: 16,
          // Ensure icons are vertically centered
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint={blurTint}
              intensity={90}
              style={[StyleSheet.absoluteFill, { borderRadius: 32, overflow: 'hidden' }]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: 32,
                  backgroundColor: colors.tabBarBg,
                },
              ]}
            />
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

          const iconSize = focused ? size + 2 : size;

          return (
            <View style={styles.iconContainer}>
              <Feather name={iconName} size={iconSize} color={color} />
              {focused && (
                <View
                  style={[
                    styles.activeIndicator,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                    },
                  ]}
                />
              )}
            </View>
          );
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
            <Feather name="plus" size={28} color="#fff" />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} colors={colors} />
          ),
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
    top: -22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerGlowRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
  },
  centerButtonOuter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  centerButtonGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default BottomTabs;

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import * as Google from 'expo-auth-session/providers/google';

import { useTheme } from '~/hooks/useTheme';
import Header from '~/components/Header';
import {
  selectUser,
  selectIsLoggedIn,
  selectUserLoading,
  selectUserError,
} from '~/store/userSlice';
import authService from '~/services/authService';

// Client IDs - Replace with your actual IDs from Google Cloud Console
// For Expo Go, use the webClientId or create an Expo client
const GOOGLE_CONFIG = {
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

function ProfileScreen() {
  const { colors, spacing, borderRadius, isDark, toggleTheme } = useTheme();
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);

  const [request, response, promptAsync] = Google.useAuthRequest(GOOGLE_CONFIG);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const ringPulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 0.5, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, [isLoggedIn]); // Re-animate on login state change

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      authService.handleGoogleLogin(id_token);
    }
  }, [response]);

  const styles = createStyles(colors, spacing, borderRadius, isDark);

  const statsData = isLoggedIn
    ? [
        { icon: '🏟️', value: user?.stats?.matchesPlayed || 0, label: 'Played' },
        { icon: '🏗️', value: user?.stats?.matchesCreated || 0, label: 'Created' },
        { icon: '🏃', value: user?.stats?.runs || 0, label: 'Runs' },
        { icon: '🎯', value: user?.stats?.wickets || 0, label: 'Wickets' },
      ]
    : [];

  const settingsItems = [
    { icon: 'bell', label: 'Notifications', color: colors.accent },
    { icon: 'shield', label: 'Privacy', color: colors.primary },
    { icon: 'help-circle', label: 'Help & Support', color: colors.textSecondary },
    { icon: 'info', label: 'About', color: colors.textSecondary },
  ];

  const renderAuthContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Authenticating...</Text>
        </View>
      );
    }

    if (!isLoggedIn) {
      return (
        <View style={styles.loginContainer}>
          <View style={styles.loginIconContainer}>
            <Feather name="user" size={48} color={colors.textSecondary} />
          </View>
          <Text style={styles.loginTitle}>Welcome to Cricket Pro</Text>
          <Text style={styles.loginSubtitle}>
            Login to save your matches, track stats, and compete with friends.
          </Text>
          
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => promptAsync()}
            disabled={!request}
            activeOpacity={0.8}
          >
            <View style={styles.googleIconBg}>
              <Feather name="chrome" size={20} color="#EA4335" />
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      );
    }

    return (
      <>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Animated.View style={[styles.avatarRing, { opacity: ringPulse }]} />
          <View style={styles.avatarCircle}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>🏏</Text>
            )}
          </View>
          <Text style={styles.userName}>{user?.name || 'Cricket Player'}</Text>
          <Text style={styles.userTag}>{user?.email}</Text>

          {/* Theme Indicator */}
          <TouchableOpacity style={styles.themeBadge} onPress={toggleTheme} activeOpacity={0.7}>
            <Feather name={isDark ? 'moon' : 'sun'} size={12} color={colors.primary} />
            <Text style={styles.themeBadgeText}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings List */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsList}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.settingsItem,
                index < settingsItems.length - 1 && styles.settingsItemBorder,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.settingsItemLeft}>
                <View style={[styles.settingsIconBg, { borderColor: item.color + '30' }]}>
                  <Feather name={item.icon} size={18} color={item.color} />
                </View>
                <Text style={styles.settingsLabel}>{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textDisabled} />
            </TouchableOpacity>
          ))}
          
          {/* Logout Button */}
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => authService.logout()}
            activeOpacity={0.7}
          >
            <View style={styles.settingsItemLeft}>
              <View style={[styles.settingsIconBg, { borderColor: colors.error + '30' }]}>
                <Feather name="log-out" size={18} color={colors.error} />
              </View>
              <Text style={[styles.settingsLabel, { color: colors.error }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle={colors.statusBar === 'dark' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      <Header title="Profile" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            flex: 1,
          }}
        >
          {renderAuthContent()}
          <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors, spacing, borderRadius, isDark) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing[4],
      paddingTop: spacing[6],
    },

    // Avatar
    avatarSection: {
      alignItems: 'center',
      marginBottom: spacing[6],
    },
    avatarRing: {
      position: 'absolute',
      top: -4,
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 2,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.4 : 0.1,
      shadowRadius: 16,
    },
    avatarCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.glassBg,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[3],
      overflow: 'hidden',
    },
    avatarEmoji: {
      fontSize: 40,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    userName: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    userTag: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 2,
    },
    themeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
      marginTop: spacing[3],
      backgroundColor: colors.glassBg,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
    },
    themeBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.3,
    },

    // Auth Containers
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing[12],
    },
    loadingText: {
      marginTop: spacing[4],
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    loginContainer: {
      flex: 1,
      alignItems: 'center',
      paddingTop: spacing[8],
      paddingHorizontal: spacing[4],
    },
    loginIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.glassBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[6],
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    loginTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing[2],
    },
    loginSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: spacing[10],
      paddingHorizontal: spacing[6],
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#fff' : '#000',
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.xl,
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    googleIconBg: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[4],
    },
    googleButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? '#000' : '#fff',
    },
    errorText: {
      color: colors.error,
      fontSize: 13,
      fontWeight: '600',
      marginTop: spacing[4],
      textAlign: 'center',
    },

    // Stats
    statsGrid: {
      flexDirection: 'row',
      gap: spacing[2],
      marginBottom: spacing[6],
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.glassBg,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      paddingVertical: spacing[3],
      alignItems: 'center',
    },
    statIcon: {
      fontSize: 18,
      marginBottom: spacing[1],
    },
    statValue: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: -0.3,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 2,
      letterSpacing: 0.3,
    },

    // Settings
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: spacing[3],
    },
    settingsList: {
      backgroundColor: colors.glassBg,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: 'hidden',
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
    },
    settingsItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    settingsIconBg: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      backgroundColor: colors.glassBg,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },

    bottomSpacer: {
      height: 100,
    },
  });
}

export default ProfileScreen;

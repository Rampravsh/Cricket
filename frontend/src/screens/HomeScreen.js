import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { createMatchThunk, startMatchThunk, selectIsLoading } from '~/store/matchSlice';
import { matchApi } from '~/services/api';
import { useTheme } from '~/hooks/useTheme';
import { SCREENS } from '~/constants';
import Button from '~/components/Button';
import Card from '~/components/Card';
import Header from '~/components/Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * HomeScreen — App entry screen (Neon Glassy Gen-Z)
 * Fetches real match data from backend API
 */
function HomeScreen() {
  const { colors, spacing, borderRadius, isDark } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const unreadCount = useSelector(state => state.notifications.unreadCount);
  const styles = createStyles(colors, spacing, borderRadius, isDark);

  // Real match data from API
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  // Floating dots animation
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Hero entrance animation
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Floating dots
    const animateDot = (dot, duration) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration, useNativeDriver: true }),
        ])
      ).start();
    animateDot(dot1, 3000);
    animateDot(dot2, 4000);
    animateDot(dot3, 3500);
  }, []);

  // Fetch public matches from API on screen focus
  const fetchMatches = useCallback(async () => {
    try {
      setMatchesLoading(true);
      const res = await matchApi.getMatches();
      const data = res?.data || res;
      // Handle both paginated and direct array responses
      const matchList = data?.matches || (Array.isArray(data) ? data : []);
      setMatches(matchList);
    } catch (err) {
      console.warn('[HomeScreen] Failed to fetch matches:', err.message);
      setMatches([]);
    } finally {
      setMatchesLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [fetchMatches])
  );

  const handleGoToLiveMatch = async () => {
    try {
      const matchId = 'match-' + Date.now();
      const matchData = {
        matchId,
        teams: [
          { 
            name: 'India', 
            players: [
              { playerId: '000000000000000000000001', nameSnapshot: 'Batter 1' }, 
              { playerId: '000000000000000000000002', nameSnapshot: 'Batter 2' }
            ] 
          },
          { 
            name: 'Australia', 
            players: [
              { playerId: '000000000000000000000003', nameSnapshot: 'Bowler 1' }
            ] 
          }
        ],
        players: [
          { playerId: '000000000000000000000001', name: 'Batter 1', status: 'accepted' },
          { playerId: '000000000000000000000002', name: 'Batter 2', status: 'accepted' },
          { playerId: '000000000000000000000003', name: 'Bowler 1', status: 'accepted' }
        ],
        isPublic: true,
        toss: { winner: 'India', decision: 'bat' }
      };
      
      await dispatch(createMatchThunk(matchData)).unwrap();
      await dispatch(startMatchThunk(matchId)).unwrap();
      
      navigation.navigate(SCREENS.LIVE_MATCH, { matchId });
    } catch (error) {
      console.error('[HomeScreen] Error starting live match:', error);
    }
  };

  const handleMatchPress = (match) => {
    if (match.matchId) {
      navigation.navigate(SCREENS.LIVE_MATCH, { matchId: match.matchId });
    }
  };

  // Calculate stats from real data
  const totalMatches = matches.length;
  const liveMatches = matches.filter(m => m.status === 'live').length;
  const completedMatches = matches.filter(m => m.status === 'completed').length;
  const waitingMatches = matches.filter(m => m.status === 'waiting').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar
        barStyle={colors.statusBar === 'dark' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <Header 
        title="Cricket Live" 
        rightComponent={
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => navigation.navigate(SCREENS.NOTIFICATIONS)}
          >
            <Feather name="bell" size={22} color={colors.primary} />
            {unreadCount > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: colors.danger }]}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Hero Section with Gradient */}
        <Animated.View
          style={[
            styles.heroContainer,
            {
              opacity: heroFade,
              transform: [{ translateY: heroSlide }],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            {/* Floating Decoration Dots */}
            <Animated.View
              style={[
                styles.floatingDot,
                styles.dot1,
                {
                  opacity: dot1.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] }),
                  transform: [
                    { translateY: dot1.interpolate({ inputRange: [0, 1], outputRange: [0, -15] }) },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.floatingDot,
                styles.dot2,
                {
                  opacity: dot2.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.5] }),
                  transform: [
                    { translateY: dot2.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.floatingDot,
                styles.dot3,
                {
                  opacity: dot3.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.45] }),
                  transform: [
                    { translateY: dot3.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
                  ],
                },
              ]}
            />

            <Text style={styles.heroEmoji}>🏏</Text>
            <Text style={styles.heroTitle}>Cricket{'\n'}Scoring</Text>
            <Text style={styles.heroSubtitle}>
              Real-time match scoring, live commentary & stats — all in your pocket.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.sectionLine} />
        </View>
        <View style={styles.actionRow}>
          <Button
            title={isLoading ? "Starting..." : "⚡ Start Live Match"}
            onPress={handleGoToLiveMatch}
            disabled={isLoading}
            variant="primary"
            size="lg"
            style={styles.primaryAction}
          />
          <Button
            title="📊 View Scorecard"
            onPress={() => {}}
            variant="secondary"
            size="lg"
            style={styles.secondaryAction}
          />
        </View>

        {/* Matches from API */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Matches</Text>
          <View style={styles.sectionLine} />
        </View>

        {matchesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Loading matches...</Text>
          </View>
        ) : matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏟️</Text>
            <Text style={styles.emptyText}>No matches yet. Start one!</Text>
          </View>
        ) : (
          matches.map((match, index) => (
            <MatchQuickCard
              key={match.matchId || match._id || index}
              teamA={match.teams?.[0]?.name || 'Team A'}
              teamB={match.teams?.[1]?.name || 'Team B'}
              status={match.status?.toUpperCase() || 'WAITING'}
              score={
                match.status === 'live'
                  ? `${match.score?.runs || 0}/${match.score?.wickets || 0} (${match.score?.overs || 0}.${match.score?.balls || 0} Ov)`
                  : match.status === 'completed'
                    ? `Completed`
                    : 'Waiting to start'
              }
              onPress={() => handleMatchPress(match)}
              colors={colors}
              spacing={spacing}
              borderRadius={borderRadius}
              isDark={isDark}
            />
          ))
        )}

        {/* Quick Stats from Real Data */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.sectionLine} />
        </View>
        <View style={styles.statsGrid}>
          <QuickStatCard icon="🏟️" label="Total" value={String(totalMatches)} colors={colors} spacing={spacing} borderRadius={borderRadius} />
          <QuickStatCard icon="🔴" label="Live" value={String(liveMatches)} colors={colors} spacing={spacing} borderRadius={borderRadius} />
          <QuickStatCard icon="✅" label="Done" value={String(completedMatches)} colors={colors} spacing={spacing} borderRadius={borderRadius} />
          <QuickStatCard icon="⏳" label="Waiting" value={String(waitingMatches)} colors={colors} spacing={spacing} borderRadius={borderRadius} />
        </View>

        {/* Bottom spacer for floating tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Inline sub-component: Match Card ─────────────────────────────────────────
function MatchQuickCard({ teamA, teamB, status, score, onPress, colors, spacing, borderRadius, isDark }) {
  const isLive = status === 'LIVE';
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isLive]);

  const cardStyles = StyleSheet.create({
    card: {
      backgroundColor: colors.glassBg,
      borderRadius: borderRadius.xl,
      padding: spacing[4],
      marginBottom: spacing[3],
      borderWidth: 1,
      borderColor: isLive
        ? (isDark ? 'rgba(255, 59, 92, 0.30)' : 'rgba(229, 57, 80, 0.20)')
        : colors.glassBorder,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: isLive ? colors.danger : 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isLive ? (isDark ? 0.3 : 0.1) : 0,
      shadowRadius: isLive ? 16 : 0,
      elevation: isLive ? 4 : 2,
    },
    accentStrip: {
      position: 'absolute',
      left: 0,
      top: spacing[3],
      bottom: spacing[3],
      width: 3,
      borderRadius: 2,
      backgroundColor: isLive ? colors.danger : colors.primary,
    },
    teams: {
      flex: 1,
      marginLeft: spacing[3],
    },
    matchTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.2,
    },
    matchScore: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 3,
    },
    badge: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.full,
      backgroundColor: isLive ? colors.dangerContainer : colors.primaryContainer,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: isLive ? colors.danger : colors.primary,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: isLive ? colors.danger : colors.primary,
      letterSpacing: 0.8,
    },
  });

  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={cardStyles.accentStrip} />
      <View style={cardStyles.teams}>
        <Text style={cardStyles.matchTitle}>{teamA} vs {teamB}</Text>
        <Text style={cardStyles.matchScore}>{score}</Text>
      </View>
      <View style={cardStyles.badge}>
        {isLive && (
          <Animated.View style={[cardStyles.badgeDot, { opacity: pulseAnim }]} />
        )}
        <Text style={cardStyles.badgeText}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Inline sub-component: Quick Stat Card ────────────────────────────────────
function QuickStatCard({ icon, label, value, colors, spacing, borderRadius }) {
  const s = StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.glassBg,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      padding: spacing[3],
      alignItems: 'center',
      margin: spacing[1],
    },
    icon: {
      fontSize: 22,
      marginBottom: spacing[1],
    },
    value: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: -0.5,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 2,
      letterSpacing: 0.3,
    },
  });

  return (
    <View style={s.card}>
      <Text style={s.icon}>{icon}</Text>
      <Text style={s.value}>{value}</Text>
      <Text style={s.label}>{label}</Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
function createStyles(colors, spacing, borderRadius, isDark) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing[4],
      paddingTop: spacing[4],
    },

    // ── Hero ──────────────────────────────────────────────────────────────────
    heroContainer: {
      marginBottom: spacing[6],
    },
    heroGradient: {
      borderRadius: borderRadius['2xl'],
      padding: spacing[6],
      paddingTop: spacing[8],
      paddingBottom: spacing[8],
      overflow: 'hidden',
      position: 'relative',
    },
    heroEmoji: {
      fontSize: 48,
      marginBottom: spacing[3],
    },
    heroTitle: {
      fontSize: 38,
      fontWeight: '900',
      color: '#FFFFFF',
      lineHeight: 42,
      marginBottom: spacing[3],
      letterSpacing: -0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    heroSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.85)',
      lineHeight: 20,
      fontWeight: '500',
    },

    // Floating decoration dots
    floatingDot: {
      position: 'absolute',
      borderRadius: 999,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    dot1: { width: 80, height: 80, top: -20, right: -10 },
    dot2: { width: 50, height: 50, bottom: 20, right: 40 },
    dot3: { width: 35, height: 35, top: 30, right: 80 },

    // ── Sections ──────────────────────────────────────────────────────────────
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[3],
      marginTop: spacing[2],
      gap: spacing[2],
    },
    notificationBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.glassBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    notificationBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    notificationBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '900',
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    sectionLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.glassBorder,
    },

    // ── Actions ───────────────────────────────────────────────────────────────
    actionRow: {
      flexDirection: 'column',
      gap: spacing[3],
      marginBottom: spacing[6],
    },
    primaryAction: {
      width: '100%',
    },
    secondaryAction: {
      width: '100%',
    },

    // ── Loading / Empty ──────────────────────────────────────────────────────
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing[6],
      gap: spacing[2],
    },
    loadingText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing[6],
    },
    emptyEmoji: {
      fontSize: 32,
      marginBottom: spacing[2],
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },

    // ── Stats Grid ───────────────────────────────────────────────────────────
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -spacing[1],
      marginBottom: spacing[4],
    },

    // Extra bottom padding so content doesn't hide behind floating tab bar
    bottomSpacer: {
      height: 100,
    },
  });
}

export default HomeScreen;

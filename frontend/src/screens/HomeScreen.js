import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Animated, Dimensions, ActivityIndicator, ImageBackground } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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
        title="CRICKET LIVE" 
        showNotification
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Hero Section: Modern Local Vibe */}
        <Animated.View
          style={[
            styles.heroContainer,
            {
              opacity: heroFade,
              transform: [{ translateY: heroSlide }],
            },
          ]}
        >
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1589801258277-5074520423f1?q=80&w=1000&auto=format&fit=crop' }}
            style={styles.heroImage}
            imageStyle={{ borderRadius: borderRadius['2xl'] }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)']}
              style={styles.heroOverlay}
            >
              <View style={styles.heroContentModern}>
                <View style={styles.heroBadgeModern}>
                  <Feather name="zap" size={10} color="#FFD600" />
                  <Text style={styles.heroBadgeTextModern}>STREET LEGENDS</Text>
                </View>
                <Text style={styles.heroTitleModern}>BATTING{'\n'}STREETS</Text>
                <Text style={styles.heroSubtitleModern}>
                  Professional scoring for every street and gully. Track your journey to the top.
                </Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.sectionLine} />
        </View>
        <View style={styles.actionRow}>
          <Button
            title="Start Match"
            onPress={() => navigation.navigate(SCREENS.QUICK_MATCH)}
            variant="primary"
            size="md"
            style={styles.primaryAction}
            leftIcon={<Feather name="plus-circle" size={18} color="#fff" />}
          />
          <Button
            title="Scorecards"
            onPress={() => navigation.navigate(SCREENS.HISTORY)}
            variant="secondary"
            size="md"
            style={styles.secondaryAction}
            leftIcon={<Feather name="list" size={18} color={colors.primary} />}
          />
        </View>

        {/* horizontal Match Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Matches</Text>
          <View style={styles.sectionLine} />
        </View>

        {matchesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Loading matches...</Text>
          </View>
        ) : matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={32} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No matches scheduled yet.</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH - spacing[4] * 2 + spacing[3]}
            decelerationRate="fast"
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {matches.map((match, index) => (
              <MatchQuickCard
                key={`match-${match.matchId || match._id || index}-${index}`}
                teamA={match.teams?.[0]?.name || 'Team A'}
                teamB={match.teams?.[1]?.name || 'Team B'}
                status={
                  (match.status === 'completed' && (match.innings === 1 || !match.innings))
                    ? 'BREAK'
                    : match.status?.toUpperCase() || 'WAITING'
                }
                score={
                  match.status === 'live' || (match.status === 'completed' && (match.innings === 1 || !match.innings))
                    ? `${match.score?.runs || 0}/${match.score?.wickets || 0}`
                    : match.status === 'completed'
                      ? 'Final Result'
                      : 'Not Started'
                }
                overs={match.score?.overs ? `${match.score.overs}.${match.score.balls || 0} Ov` : null}
                onPress={() => handleMatchPress(match)}
                colors={colors}
                spacing={spacing}
                borderRadius={borderRadius}
                isDark={isDark}
              />
            ))}
          </ScrollView>
        )}

        {/* Quick Stats from Real Data */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.sectionLine} />
        </View>
        <View style={styles.statsGrid}>
          <QuickStatCard icon="activity" label="Total" value={String(totalMatches)} colors={colors} spacing={spacing} borderRadius={borderRadius} />
          <QuickStatCard icon="play-circle" label="Live" value={String(liveMatches)} colors={colors} spacing={spacing} borderRadius={borderRadius} />
          <QuickStatCard icon="check-circle" label="Done" value={String(completedMatches)} colors={colors} spacing={spacing} borderRadius={borderRadius} />
          <QuickStatCard icon="clock" label="Waiting" value={String(waitingMatches)} colors={colors} spacing={spacing} borderRadius={borderRadius} />
        </View>

        {/* Daily Stats Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Stats</Text>
          <View style={styles.sectionLine} />
        </View>
        <View style={styles.dailyStatsContainer}>
          <LinearGradient
            colors={isDark ? ['rgba(255, 214, 0, 0.1)', 'rgba(255, 214, 0, 0.02)'] : ['#FFFDE7', '#FFFFFF']}
            style={styles.dailyStatsCard}
          >
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="award" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>Top Scorer</Text>
                <Text style={styles.statValue}>Aryan Sharma (42 runs)</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="target" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>Best Spell</Text>
                <Text style={styles.statValue}>Rohit V. (3/12)</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="trending-up" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>Runs Today</Text>
                <Text style={styles.statValue}>842 Runs Today</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Bottom spacer for floating tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Inline sub-component: Match Card ─────────────────────────────────────────
function MatchQuickCard({ teamA, teamB, status, score, overs, onPress, colors, spacing, borderRadius, isDark }) {
  const isLive = status === 'LIVE';
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isLive]);

  const cardStyles = StyleSheet.create({
    card: {
      width: SCREEN_WIDTH * 0.82,
      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.8)' : '#FFFFFF',
      borderRadius: borderRadius['2xl'],
      padding: spacing[5],
      marginRight: spacing[4],
      borderWidth: 1.5,
      borderColor: isLive ? colors.danger + '40' : colors.glassBorder,
      shadowColor: isLive ? colors.danger : '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isLive ? 0.25 : 0.1,
      shadowRadius: 15,
      elevation: 8,
      overflow: 'hidden',
    },
    statusHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.danger + '15',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      gap: 6,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.danger,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '900',
      color: isLive ? colors.danger : colors.textSecondary,
      letterSpacing: 1.5,
    },
    formatText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textTertiary,
      textTransform: 'uppercase',
    },
    teamsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing[4],
    },
    teamBlock: {
      alignItems: 'center',
      flex: 1,
    },
    teamInitialContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    teamInitial: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    teamName: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    vsContainer: {
      paddingHorizontal: 12,
    },
    vsText: {
      fontSize: 14,
      fontWeight: '900',
      color: colors.textTertiary,
      fontStyle: 'italic',
    },
    scoreContainer: {
      alignItems: 'center',
      paddingTop: spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.glassBorder,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    scoreText: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.primary,
      letterSpacing: -0.5,
    },
    oversText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    venueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 12,
    },
    venueText: {
      fontSize: 10,
      color: colors.textTertiary,
      fontWeight: '600',
    },
  });

  const initials = (name) => (name || '?').substring(0, 2).toUpperCase();

  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={cardStyles.statusHeader}>
        {isLive ? (
          <View style={cardStyles.liveBadge}>
            <Animated.View style={[cardStyles.liveDot, { opacity: pulseAnim }]} />
            <Text style={cardStyles.statusText}>LIVE</Text>
          </View>
        ) : (
          <Text style={cardStyles.statusText}>{status}</Text>
        )}
        <Text style={cardStyles.formatText}>T20 GULLY</Text>
      </View>

      <View style={cardStyles.teamsRow}>
        <View style={cardStyles.teamBlock}>
          <View style={cardStyles.teamInitialContainer}>
            <Text style={cardStyles.teamInitial}>{initials(teamA)}</Text>
          </View>
          <Text style={cardStyles.teamName} numberOfLines={1}>{teamA}</Text>
        </View>

        <View style={cardStyles.vsContainer}>
          <Text style={cardStyles.vsText}>VS</Text>
        </View>

        <View style={cardStyles.teamBlock}>
          <View style={cardStyles.teamInitialContainer}>
            <Text style={cardStyles.teamInitial}>{initials(teamB)}</Text>
          </View>
          <Text style={cardStyles.teamName} numberOfLines={1}>{teamB}</Text>
        </View>
      </View>

      <View style={cardStyles.scoreContainer}>
        <Text style={cardStyles.scoreText}>{score}</Text>
        {overs && <Text style={cardStyles.oversText}>{overs}</Text>}
      </View>

      <View style={cardStyles.venueRow}>
        <Feather name="map-pin" size={10} color={colors.textTertiary} />
        <Text style={cardStyles.venueText}>Street Arena • Sector 42</Text>
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
      <Feather name={icon} size={22} color={colors.primary} style={{marginBottom: 6}} />
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
      paddingBottom: spacing[4],
    },
    horizontalScrollContent: {
      paddingLeft: 0,
      paddingRight: spacing[4],
      paddingBottom: spacing[4],
      paddingTop: spacing[2],
    },

    // ── Hero (Ultra Modern Edition) ──────────────────────────────────────────
    heroContainer: {
      marginBottom: spacing[6],
      height: 280,
    },
    heroImage: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      padding: spacing[6],
    },
    heroContentModern: {
      paddingBottom: spacing[2],
    },
    heroBadgeModern: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      gap: 6,
    },
    heroBadgeTextModern: {
      color: '#FFD600',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
    },
    heroTitleModern: {
      fontSize: 48,
      fontWeight: '900',
      color: '#FFFFFF',
      lineHeight: 46,
      marginBottom: spacing[2],
      letterSpacing: -1,
    },
    heroSubtitleModern: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: 20,
      fontWeight: '500',
      maxWidth: '85%',
    },

    // ── Venue Row ────────────────────────────────────────────────────────────
    venueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },

    // ── Sections ──────────────────────────────────────────────────────────────
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[4],
      marginTop: spacing[4],
      gap: spacing[3],
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.textSecondary,
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    sectionLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.glassBorder,
    },

    // ── Actions ───────────────────────────────────────────────────────────────
    actionRow: {
      flexDirection: 'row',
      gap: spacing[3],
      marginBottom: spacing[6],
    },
    primaryAction: {
      flex: 1.2,
    },
    secondaryAction: {
      flex: 1,
    },

    // ── Daily Stats ───────────────────────────────────────────────────────────
    dailyStatsContainer: {
      marginBottom: spacing[4],
    },
    dailyStatsCard: {
      borderRadius: borderRadius.xl,
      padding: spacing[4],
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statIcon: {
      fontSize: 18,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textPrimary,
      marginTop: 2,
    },
    statDivider: {
      height: 1,
      backgroundColor: colors.glassBorder,
      marginVertical: spacing[3],
      marginLeft: 50,
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
      height: 120,
    },
  });
}

export default HomeScreen;

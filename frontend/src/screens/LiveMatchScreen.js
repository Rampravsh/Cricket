import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '~/hooks/useTheme';
import useSocket from '~/hooks/useSocket';
import { selectScore, selectCurrentOver, selectTarget, fetchMatchThunk, addBallThunk, startMatchThunk, replacePlayerThunk, selectCurrentMatch, selectIsLoading } from '~/store/matchSlice';
import { playerApi } from '~/services/api';
import { formatOvers, calculateRunRate } from '~/utils/helpers';
import { SCORE_VALUES } from '~/constants';
import Header from '~/components/Header';
import Card from '~/components/Card';
import ScoreButton from '~/components/ScoreButton';

/**
 * LiveMatchScreen — Live cricket match scoring UI (Neon Glassy)
 */
function LiveMatchScreen() {
  const { colors, spacing, borderRadius, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const blinkAnim = useRef(new Animated.Value(1)).current;

  // Blinking dot animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [blinkAnim]);
  
  const score = useSelector(selectScore);
  const currentOver = useSelector(selectCurrentOver);
  const target = useSelector(selectTarget);
  const currentMatch = useSelector(selectCurrentMatch);
  const isLoading = useSelector(selectIsLoading);
  const styles = createStyles(colors, spacing, borderRadius, isDark);

  const matchId = route.params?.matchId || currentMatch?.matchId;

  // Setup real-time socket connection
  useSocket(matchId);

  const currentUser = useSelector(state => state.auth.user);
  const isCreator = currentMatch?.createdByUserId?._id === currentUser?._id || currentMatch?.createdByUserId === currentUser?._id;
  const isWaiting = currentMatch?.status === 'waiting';

  // Local state for demo — last pressed button
  const [lastPressed, setLastPressed] = useState(null);

  // Player replacement state
  const [replacingPlayer, setReplacingPlayer] = useState(null); // { id, name }
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (matchId) {
      dispatch(fetchMatchThunk(matchId));
    }
  }, [matchId, dispatch]);

  const handleScorePress = (value) => {
    setLastPressed(value);
    
    let runs = 0;
    let extra = null;
    let wicket = false;

    if (value === SCORE_VALUES.WICKET) {
      wicket = true;
    } else if (value === SCORE_VALUES.WIDE) {
      extra = 'wide';
      runs = 1;
    } else if (value === SCORE_VALUES.NO_BALL) {
      extra = 'noBall';
      runs = 1;
    } else if (typeof value === 'number') {
      runs = value;
    } else if (value === SCORE_VALUES.LEG_BYE || value === SCORE_VALUES.BYE) {
       runs = 1;
    }

    if (matchId) {
      dispatch(addBallThunk({ matchId, payload: { runs, extra, wicket } }));
    }
  };

  const handleStartMatch = () => {
    if (!currentMatch) return;

    const pendingPlayers = currentMatch.players?.filter(p => p.status === 'pending');
    
    if (pendingPlayers && pendingPlayers.length > 0) {
      const names = pendingPlayers.map(p => p.name).join(', ');
      Alert.alert(
        'Players Pending',
        `The following players have not accepted the invitation yet:\n\n${names}\n\nDo you want to start the match anyway or wait for them?`,
        [
          { text: 'Wait', style: 'cancel' },
          { 
            text: 'Start Anyway', 
            style: 'destructive',
            onPress: () => dispatch(startMatchThunk(matchId)) 
          },
        ]
      );
    } else {
      dispatch(startMatchThunk(matchId));
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await playerApi.searchPlayers(query);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReplacePlayer = async (newPlayer) => {
    if (!replacingPlayer || !matchId) return;

    try {
      const payload = {
        oldPlayerId: replacingPlayer.playerId,
        oldPlayerName: replacingPlayer.name,
        newPlayerId: newPlayer._id,
        newName: newPlayer.displayName
      };

      const res = await dispatch(replacePlayerThunk({ matchId, payload })).unwrap();
      if (res) {
        Alert.alert('Success', 'Player replaced successfully');
        setReplacingPlayer(null);
        setSearchQuery('');
        setSearchResults([]);
        dispatch(fetchMatchThunk(matchId));
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to replace player');
    }
  };

  const handleAddGuestReplacement = async () => {
    if (!replacingPlayer || !matchId || !searchQuery) return;

    try {
      const payload = {
        oldPlayerId: replacingPlayer.playerId,
        oldPlayerName: replacingPlayer.name,
        newPlayerId: null,
        newName: searchQuery
      };

      const res = await dispatch(replacePlayerThunk({ matchId, payload })).unwrap();
      if (res) {
        Alert.alert('Success', 'Guest player added as replacement');
        setReplacingPlayer(null);
        setSearchQuery('');
        setSearchResults([]);
        dispatch(fetchMatchThunk(matchId));
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to add guest replacement');
    }
  };

  const battingTeamScore = score.teamA;
  const bowlingTeamScore = score.teamB;
  const runRate = calculateRunRate(battingTeamScore.runs, battingTeamScore.balls);

  // Scoring buttons config
  const scoreButtons = [
    { score: SCORE_VALUES.DOT_BALL },
    { score: SCORE_VALUES.ONE },
    { score: SCORE_VALUES.TWO },
    { score: SCORE_VALUES.THREE },
    { score: SCORE_VALUES.FOUR },
    { score: SCORE_VALUES.SIX },
    { score: SCORE_VALUES.WICKET },
    { score: SCORE_VALUES.WIDE },
    { score: SCORE_VALUES.NO_BALL },
    { score: SCORE_VALUES.LEG_BYE },
    { score: SCORE_VALUES.BYE },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar
        barStyle={colors.statusBar === 'dark' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <Header
        title="Live Match"
        showBack
        onBack={() => navigation.goBack()}
        rightComponent={
          !isWaiting && (
            <View style={styles.liveBadge}>
              <Animated.View style={[styles.liveDot, { opacity: blinkAnim }]} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          )
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Scoreboard — Gradient Card */}
        <View style={styles.scoreboardWrapper}>
          <LinearGradient
            colors={isDark
              ? ['rgba(0, 240, 255, 0.08)', 'rgba(191, 90, 242, 0.06)', 'rgba(255, 45, 120, 0.04)']
              : ['rgba(0, 180, 216, 0.06)', 'rgba(123, 47, 240, 0.04)', 'rgba(255, 45, 120, 0.02)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreboardGradient}
          >
            {/* Teams Row */}
            <View style={styles.teamsRow}>
              {/* Batting Team */}
              <View style={styles.teamBlock}>
                <Text style={styles.teamName}>{battingTeamScore.name || 'Team A'}</Text>
                <Text style={styles.teamShort}>{battingTeamScore.shortName || 'TMA'}</Text>
                <View style={styles.scoreAnimWrapper}>
                  <AnimatedScore value={battingTeamScore.runs} textStyle={styles.scoreMain} />
                  <AnimatedScore value={`/${battingTeamScore.wickets}`} textStyle={styles.scoreWickets} />
                </View>
                <Text style={styles.scoreOvers}>
                  {formatOvers(battingTeamScore.balls)}
                </Text>
              </View>

              {/* VS Divider */}
              <View style={styles.vsDivider}>
                <View style={styles.vsCircle}>
                  <Text style={styles.vsText}>vs</Text>
                </View>
                {target ? (
                  <Text style={styles.targetText}>Target: {target}</Text>
                ) : null}
              </View>

              {/* Bowling Team */}
              <View style={[styles.teamBlock, styles.teamBlockRight]}>
                <Text style={[styles.teamName, styles.textRight]}>{bowlingTeamScore.name || 'Team B'}</Text>
                <Text style={[styles.teamShort, styles.textRight]}>{bowlingTeamScore.shortName || 'TMB'}</Text>
                <Text style={[styles.scoreMain, styles.textRight, styles.scoreSecondary]}>
                  {bowlingTeamScore.runs > 0
                    ? `${bowlingTeamScore.runs}/${bowlingTeamScore.wickets}`
                    : '—'}
                </Text>
                <Text style={[styles.scoreOvers, styles.textRight]}>
                  {bowlingTeamScore.balls > 0 ? formatOvers(bowlingTeamScore.balls) : 'Yet to bat'}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <StatChip label="CRR" value={runRate} colors={colors} spacing={spacing} borderRadius={borderRadius} isDark={isDark} />
              <StatChip label="Over" value={formatOvers(battingTeamScore.balls)} colors={colors} spacing={spacing} borderRadius={borderRadius} isDark={isDark} />
              {target && (
                <StatChip
                  label="Need"
                  value={`${target - battingTeamScore.runs} off ${Math.max(0, 120 - battingTeamScore.balls)} balls`}
                  colors={colors}
                  spacing={spacing}
                  borderRadius={borderRadius}
                  isDark={isDark}
                />
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Current Over Tracker */}
        <Card style={styles.overCard} padding="md">
          <View style={styles.overHeader}>
            <Text style={styles.overLabel}>Current Over</Text>
            <Text style={styles.overCount}>{currentOver.length}/6</Text>
          </View>
          <View style={styles.overBalls}>
            {currentOver.length === 0 ? (
              <Text style={styles.overEmpty}>No deliveries yet</Text>
            ) : (
              currentOver.map((delivery, index) => (
                <View key={index} style={[styles.ball, getBallStyle(delivery, colors, borderRadius, isDark)]}>
                  <Text style={[styles.ballText, getBallTextStyle(delivery, colors)]}>
                    {String(delivery)}
                  </Text>
                </View>
              ))
            )}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 6 - currentOver.length) }).map((_, i) => (
              <View key={`empty-${i}`} style={[styles.ball, styles.ballEmpty]} />
            ))}
          </View>
        </Card>

        {/* Last Pressed Feedback */}
        {lastPressed !== null && (
          <View style={styles.lastPressedRow}>
            <Text style={styles.lastPressedLabel}>Last:</Text>
            <Text style={styles.lastPressedValue}>{String(lastPressed)}</Text>
          </View>
        )}

        {/* Waiting State UI */}
        {isWaiting ? (
          <Card style={styles.waitingCard} padding="xl">
            <Ionicons name="hourglass-outline" size={60} color={colors.primary} style={styles.waitingIcon} />
            <Text style={styles.waitingTitle}>Match is Waiting</Text>
            <Text style={styles.waitingSubtitle}>
              Wait for all players to accept their invitations or start the match now.
            </Text>

            {/* Players Status List */}
            <View style={styles.playerStatusList}>
              <Text style={styles.statusSectionTitle}>Player Status</Text>
              {currentMatch.players?.map((p, idx) => (
                <View key={p.playerId || idx} style={styles.playerStatusItem}>
                  <View>
                    <Text style={styles.playerStatusName}>{p.name}</Text>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: p.status === 'accepted' ? colors.success + '20' : colors.warning + '20' }
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        { color: p.status === 'accepted' ? colors.success : colors.warning }
                      ]}>
                        {p.status === 'accepted' ? 'Accepted' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  
                  {isCreator && p.status !== 'accepted' && (
                    <TouchableOpacity 
                      style={styles.replaceBtn}
                      onPress={() => setReplacingPlayer(p)}
                    >
                      <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
                      <Text style={styles.replaceBtnText}>Replace</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {isCreator && (
              <TouchableOpacity 
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
                onPress={handleStartMatch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                  <>
                    <Ionicons name="play" size={20} color={colors.textOnPrimary} style={{ marginRight: 8 }} />
                    <Text style={styles.startBtnText}>Start Match</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </Card>
        ) : (
          <>
            {/* Score Buttons Grid */}
            <Card style={styles.scoringCard} padding="md">
              <Text style={styles.scoringTitle}>Scoring</Text>
              <View style={styles.scoreGrid}>
                {scoreButtons.map((btn) => (
                  <ScoreButton
                    key={String(btn.score)}
                    score={btn.score}
                    onPress={handleScorePress}
                    disabled={isLoading}
                  />
                ))}
              </View>
            </Card>

            {/* Batter / Bowler Info */}
            <View style={styles.playersRow}>
              <Card style={[styles.playerCard, styles.activeGlow]} padding="sm">
                <View style={styles.playerRoleRow}>
                  <Text style={styles.playerRoleIcon}>🏏</Text>
                  <Text style={styles.playerRole}>Batting</Text>
                </View>
                <Text style={[styles.playerName, { color: colors.primary }]}>
                  {currentMatch?.current?.strikerId ? (currentMatch.teams.flatMap(t => t.players).find(p => (p.playerId?._id || p.playerId) === currentMatch.current.strikerId)?.nameSnapshot || 'Striker') : 'Batter 1'}
                </Text>
                <Text style={styles.playerStat}>0 (0)</Text>
                <Text style={styles.playerName}>
                  {currentMatch?.current?.nonStrikerId ? (currentMatch.teams.flatMap(t => t.players).find(p => (p.playerId?._id || p.playerId) === currentMatch.current.nonStrikerId)?.nameSnapshot || 'Non-Striker') : 'Batter 2'}
                </Text>
                <Text style={styles.playerStat}>0 (0)</Text>
              </Card>
              <Card style={[styles.playerCard, styles.activeGlow]} padding="sm">
                <View style={styles.playerRoleRow}>
                  <Text style={styles.playerRoleIcon}>⚾</Text>
                  <Text style={styles.playerRole}>Bowling</Text>
                </View>
                <Text style={[styles.playerName, { color: colors.accent }]}>
                   {currentMatch?.current?.bowlerId ? (currentMatch.teams.flatMap(t => t.players).find(p => (p.playerId?._id || p.playerId) === currentMatch.current.bowlerId)?.nameSnapshot || 'Bowler') : 'Bowler 1'}
                </Text>
                <Text style={styles.playerStat}>0-0 (0.0)</Text>
              </Card>
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Replacement Modal */}
      {replacingPlayer && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setReplacingPlayer(null)} 
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Replace {replacingPlayer.name}</Text>
              <TouchableOpacity onPress={() => setReplacingPlayer(null)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color={colors.textTertiary} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search new player..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
            </View>

            {isSearching ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView style={styles.searchResults}>
                {searchResults.map(player => (
                  <TouchableOpacity 
                    key={player._id} 
                    style={styles.searchResultItem}
                    onPress={() => handleReplacePlayer(player)}
                  >
                    <View style={styles.playerAvatar}>
                      <Text style={styles.avatarText}>{player.displayName?.[0] || '?'}</Text>
                    </View>
                    <View>
                      <Text style={styles.playerName}>{player.displayName}</Text>
                      <Text style={styles.playerRole}>{player.role || 'Player'}</Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color={colors.primary} style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                ))}
                {searchQuery.length > 0 && searchResults.length === 0 && (
                  <TouchableOpacity 
                    style={styles.guestAddBtn}
                    onPress={handleAddGuestReplacement}
                  >
                    <Ionicons name="person-add" size={20} color={colors.primary} />
                    <Text style={styles.guestAddText}>Add "{searchQuery}" as guest</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function AnimatedScore({ value, textStyle }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 250, useNativeDriver: true })
      ]).start();
      prevValue.current = value;
    }
  }, [value]);

  return (
    <Animated.Text style={[textStyle, { transform: [{ scale: scaleAnim }] }]}>
      {value}
    </Animated.Text>
  );
}

function StatChip({ label, value, colors, spacing, borderRadius, isDark }) {
  const s = StyleSheet.create({
    chip: {
      backgroundColor: colors.glassBg,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      alignItems: 'center',
    },
    label: { fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 0.8 },
    value: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginTop: 1 },
  });
  return (
    <View style={s.chip}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

function getBallStyle(delivery, colors, borderRadius, isDark) {
  const base = { borderRadius: borderRadius.full };
  if (delivery === 'W') return {
    ...base,
    backgroundColor: colors.scoreWicket,
    borderColor: isDark ? 'rgba(255, 59, 92, 0.50)' : 'rgba(229, 57, 80, 0.35)',
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isDark ? 0.4 : 0.1,
    shadowRadius: 6,
  };
  if (delivery === 4) return {
    ...base,
    backgroundColor: colors.scoreFour,
    borderColor: isDark ? 'rgba(57, 255, 20, 0.50)' : 'rgba(46, 204, 64, 0.35)',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isDark ? 0.35 : 0.1,
    shadowRadius: 6,
  };
  if (delivery === 6) return {
    ...base,
    backgroundColor: colors.scoreSix,
    borderColor: isDark ? 'rgba(255, 214, 0, 0.50)' : 'rgba(255, 193, 7, 0.35)',
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isDark ? 0.35 : 0.1,
    shadowRadius: 6,
  };
  if (delivery === 'WD' || delivery === 'NB') return { ...base, backgroundColor: colors.scoreExtra, borderColor: colors.glassBorder };
  return { ...base, backgroundColor: colors.scoreDefault, borderColor: colors.glassBorder };
}

function getBallTextStyle(delivery, colors) {
  if (delivery === 'W')  return { color: colors.scoreWicketText };
  if (delivery === 4)    return { color: colors.scoreFourText };
  if (delivery === 6)    return { color: colors.scoreSixText };
  return { color: colors.scoreDefaultText };
}

// ── Main styles ────────────────────────────────────────────────────────────────
function createStyles(colors, spacing, borderRadius, isDark) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: spacing[4],
      paddingTop: spacing[4],
    },

    // ── Live badge in header ──────────────────────────────────────────────────
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.dangerContainer,
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 59, 92, 0.30)' : 'rgba(229, 57, 80, 0.15)',
      gap: 4,
      shadowColor: colors.danger,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.4 : 0.1,
      shadowRadius: 8,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.danger,
    },
    liveBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.danger,
      letterSpacing: 0.8,
    },

    // ── Scoreboard ────────────────────────────────────────────────────────────
    scoreboardWrapper: {
      marginBottom: spacing[3],
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.glassBorder,
      shadowColor: isDark ? colors.primary : colors.shadowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.15 : 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    scoreboardGradient: {
      padding: spacing[5],
    },
    teamsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing[4],
    },
    teamBlock: {
      flex: 2,
    },
    teamBlockRight: {
      alignItems: 'flex-end',
    },
    teamName: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 0.3,
    },
    teamShort: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: spacing[2],
      fontWeight: '600',
    },
    scoreAnimWrapper: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    scoreMain: {
      fontSize: 38,
      fontWeight: '900',
      color: colors.primary,
      letterSpacing: -1,
      textShadowColor: isDark ? 'rgba(0, 240, 255, 0.3)' : 'rgba(0, 180, 216, 0.2)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: isDark ? 12 : 4,
    },
    scoreSecondary: {
      color: colors.textSecondary,
      fontSize: 24,
    },
    scoreWickets: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    scoreOvers: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    textRight: {
      textAlign: 'right',
    },
    vsDivider: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    vsCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.glassBg,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    vsText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textDisabled,
    },
    targetText: {
      fontSize: 11,
      color: colors.accent,
      fontWeight: '700',
      marginTop: spacing[1],
      textAlign: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing[2],
    },

    // ── Over tracker ──────────────────────────────────────────────────────────
    overCard: {
      marginBottom: spacing[3],
    },
    overHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[3],
    },
    overLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    overCount: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    overBalls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    ball: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.glassBorder,
    },
    ballEmpty: {
      borderRadius: 19,
      borderStyle: 'dashed',
      backgroundColor: colors.surfaceVariant,
      borderColor: colors.glassBorder,
    },
    ballText: {
      fontSize: 13,
      fontWeight: '800',
    },
    overEmpty: {
      fontSize: 13,
      color: colors.textDisabled,
      fontStyle: 'italic',
    },

    // ── Last pressed ──────────────────────────────────────────────────────────
    lastPressedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[2],
      marginBottom: spacing[2],
      gap: spacing[2],
    },
    lastPressedLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    lastPressedValue: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.primary,
      textShadowColor: isDark ? colors.neonGlow : 'transparent',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: isDark ? 8 : 0,
    },

    // ── Scoring grid ──────────────────────────────────────────────────────────
    scoringCard: {
      marginBottom: spacing[3],
    },
    scoringTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 1,
      marginBottom: spacing[3],
      textTransform: 'uppercase',
    },
    scoreGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
    },

    // ── Player cards ──────────────────────────────────────────────────────────
    playersRow: {
      flexDirection: 'row',
      gap: spacing[3],
      marginBottom: spacing[3],
    },
    playerCard: {
      flex: 1,
    },
    playerRoleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
      marginBottom: spacing[2],
    },
    playerRoleIcon: {
      fontSize: 14,
    },
    playerRole: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    playerName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    playerStat: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: spacing[2],
      fontWeight: '500',
    },
    activeGlow: {
      borderColor: isDark ? 'rgba(0, 240, 255, 0.20)' : 'rgba(0, 180, 216, 0.15)',
      borderWidth: 1,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: isDark ? 12 : 6,
      elevation: 4,
    },

    bottomSpacer: { height: 100 },

    // ── Waiting State ────────────────────────────────────────────────────────
    waitingCard: {
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    waitingIcon: {
      marginBottom: spacing[4],
    },
    waitingTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: spacing[2],
    },
    waitingSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing[6],
      lineHeight: 20,
    },
    playerStatusList: {
      width: '100%',
      marginBottom: spacing[6],
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
    },
    statusSectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing[3],
    },
    playerStatusItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    playerStatusName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    startBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingVertical: spacing[4],
      borderRadius: borderRadius.xl,
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    startBtnText: {
      color: colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
    replaceBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary + '20',
    },
    replaceBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      marginLeft: 4,
    },

    // ── Modal ───────────────────────────────────────────────────────────────
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius['2xl'],
      borderTopRightRadius: borderRadius['2xl'],
      padding: spacing[6],
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing[3],
      borderWidth: 1,
      borderColor: colors.divider,
      marginBottom: spacing[4],
    },
    modalSearchInput: {
      flex: 1,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[2],
      color: colors.textPrimary,
      fontSize: 16,
    },
    searchResults: {
      maxHeight: 400,
    },
    searchResultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    playerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[3],
    },
    avatarText: {
      color: colors.primary,
      fontWeight: '800',
      fontSize: 16,
    },
    playerName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    playerRole: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    guestAddBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing[4],
      backgroundColor: colors.primary + '05',
      borderRadius: borderRadius.lg,
      marginTop: spacing[4],
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    guestAddText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      marginLeft: 8,
    },
  });
}

export default LiveMatchScreen;

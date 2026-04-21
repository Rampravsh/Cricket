import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTheme } from '~/hooks/useTheme';
import { selectScore, selectCurrentOver, selectTarget } from '~/store/matchSlice';
import { formatOvers, calculateRunRate } from '~/utils/helpers';
import { SCORE_VALUES } from '~/constants';
import Header from '~/components/Header';
import Card from '~/components/Card';
import ScoreButton from '~/components/ScoreButton';

/**
 * LiveMatchScreen — Live cricket match scoring UI
 * Layout only — no backend wiring yet
 */
function LiveMatchScreen() {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const score = useSelector(selectScore);
  const currentOver = useSelector(selectCurrentOver);
  const target = useSelector(selectTarget);
  const styles = createStyles(colors, spacing, borderRadius);

  // Local state for demo — last pressed button
  const [lastPressed, setLastPressed] = useState(null);

  const handleScorePress = (value) => {
    setLastPressed(value);
    // TODO: dispatch addDelivery({ value }) to Redux + emit to socket
    console.log('[LiveMatch] Score button pressed:', value);
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
        backgroundColor={colors.surface}
      />

      {/* Header */}
      <Header
        title="Live Match"
        showBack
        onBack={() => navigation.goBack()}
        rightComponent={
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Scoreboard */}
        <Card style={styles.scoreboard} padding="lg">
          {/* Teams Row */}
          <View style={styles.teamsRow}>
            {/* Batting Team */}
            <View style={styles.teamBlock}>
              <Text style={styles.teamName}>{battingTeamScore.name || 'Team A'}</Text>
              <Text style={styles.teamShort}>{battingTeamScore.shortName || 'TMA'}</Text>
              <Text style={styles.scoreMain}>
                {battingTeamScore.runs}
                <Text style={styles.scoreWickets}>/{battingTeamScore.wickets}</Text>
              </Text>
              <Text style={styles.scoreOvers}>
                {formatOvers(battingTeamScore.balls)}
              </Text>
            </View>

            {/* VS Divider */}
            <View style={styles.vsDivider}>
              <Text style={styles.vsText}>vs</Text>
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
            <StatChip label="CRR" value={runRate} colors={colors} spacing={spacing} borderRadius={borderRadius} />
            <StatChip label="Over" value={formatOvers(battingTeamScore.balls)} colors={colors} spacing={spacing} borderRadius={borderRadius} />
            {target && (
              <StatChip
                label="Need"
                value={`${target - battingTeamScore.runs} off ${Math.max(0, 120 - battingTeamScore.balls)} balls`}
                colors={colors}
                spacing={spacing}
                borderRadius={borderRadius}
              />
            )}
          </View>
        </Card>

        {/* Current Over Tracker */}
        <Card style={styles.overCard} padding="md">
          <Text style={styles.overLabel}>Current Over</Text>
          <View style={styles.overBalls}>
            {currentOver.length === 0 ? (
              <Text style={styles.overEmpty}>No deliveries yet</Text>
            ) : (
              currentOver.map((delivery, index) => (
                <View key={index} style={[styles.ball, getBallStyle(delivery, colors, borderRadius)]}>
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

        {/* Score Buttons Grid */}
        <Card style={styles.scoringCard} padding="md">
          <Text style={styles.scoringTitle}>Scoring</Text>
          <View style={styles.scoreGrid}>
            {scoreButtons.map((btn) => (
              <ScoreButton
                key={String(btn.score)}
                score={btn.score}
                onPress={handleScorePress}
              />
            ))}
          </View>
        </Card>

        {/* Batter / Bowler Info Placeholder */}
        <View style={styles.playersRow}>
          <Card style={styles.playerCard} padding="sm">
            <Text style={styles.playerRole}>Batting</Text>
            <Text style={styles.playerName}>Batter 1</Text>
            <Text style={styles.playerStat}>42 (38)</Text>
            <Text style={styles.playerName}>Batter 2</Text>
            <Text style={styles.playerStat}>18 (14)</Text>
          </Card>
          <Card style={styles.playerCard} padding="sm">
            <Text style={styles.playerRole}>Bowling</Text>
            <Text style={styles.playerName}>Bowler</Text>
            <Text style={styles.playerStat}>2-24 (3.2)</Text>
          </Card>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatChip({ label, value, colors, spacing, borderRadius }) {
  const s = StyleSheet.create({
    chip: {
      backgroundColor: colors.primaryContainer,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      alignItems: 'center',
    },
    label: { fontSize: 10, fontWeight: '700', color: colors.primary, letterSpacing: 0.8 },
    value: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginTop: 1 },
  });
  return (
    <View style={s.chip}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

function getBallStyle(delivery, colors, borderRadius) {
  const base = { borderRadius: borderRadius.full };
  if (delivery === 'W')  return { ...base, backgroundColor: colors.scoreWicket, borderColor: colors.danger };
  if (delivery === 4)    return { ...base, backgroundColor: colors.scoreFour, borderColor: colors.primary };
  if (delivery === 6)    return { ...base, backgroundColor: colors.scoreSix, borderColor: colors.accent };
  if (delivery === 'WD' || delivery === 'NB') return { ...base, backgroundColor: colors.scoreExtra };
  return { ...base, backgroundColor: colors.scoreDefault };
}

function getBallTextStyle(delivery, colors) {
  if (delivery === 'W')  return { color: colors.scoreWicketText };
  if (delivery === 4)    return { color: colors.scoreFourText };
  if (delivery === 6)    return { color: colors.scoreSixText };
  return { color: colors.scoreDefaultText };
}

// ── Main styles ────────────────────────────────────────────────────────────────
function createStyles(colors, spacing, borderRadius) {
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
      gap: 4,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.danger,
    },
    liveBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.danger,
      letterSpacing: 0.8,
    },

    // ── Scoreboard ────────────────────────────────────────────────────────────
    scoreboard: {
      marginBottom: spacing[3],
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
      fontWeight: '700',
      color: colors.textPrimary,
    },
    teamShort: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: spacing[2],
    },
    scoreMain: {
      fontSize: 36,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: -1,
    },
    scoreSecondary: {
      color: colors.textSecondary,
      fontSize: 24,
    },
    scoreWickets: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    scoreOvers: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    textRight: {
      textAlign: 'right',
    },
    vsDivider: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    vsText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textDisabled,
    },
    targetText: {
      fontSize: 11,
      color: colors.accent,
      fontWeight: '600',
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
    overLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.8,
      marginBottom: spacing[3],
      textTransform: 'uppercase',
    },
    overBalls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    ball: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    ballEmpty: {
      borderRadius: 18,
      borderStyle: 'dashed',
      backgroundColor: colors.surfaceVariant,
    },
    ballText: {
      fontSize: 13,
      fontWeight: '700',
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
    },
    lastPressedValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
    },

    // ── Scoring grid ──────────────────────────────────────────────────────────
    scoringCard: {
      marginBottom: spacing[3],
    },
    scoringTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.8,
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
    playerRole: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: spacing[2],
    },
    playerName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    playerStat: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: spacing[2],
    },

    bottomSpacer: { height: spacing[8] },
  });
}

export default LiveMatchScreen;

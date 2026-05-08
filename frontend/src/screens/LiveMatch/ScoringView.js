import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '~/components/Card';
import ScoreButton from '~/components/ScoreButton';
import { formatOvers } from '~/utils/helpers';

/**
 * ScoringView — Controls for Creators and Scorers to update match data
 */
const ScoringView = ({
  currentMatch,
  score,
  currentOver,
  lastPressed,
  isLoading,
  onAddBall,
  onExtraPress,
  onStartMatch,
  onReplacePlayer,
  onTakeBreak,
  onStartSecondInnings,
  colors,
  spacing,
  borderRadius,
  isDark
}) => {
  const isWaiting = currentMatch?.status === 'waiting';
  const isLive = currentMatch?.status === 'live';
  const isBreak = currentMatch?.status === 'break';
  const isCompleted = currentMatch?.status === 'completed';

  // Rate metrics from the backend engine (single source of truth)
  const crr = currentMatch?.computed?.crr ?? 0;
  const rrr = currentMatch?.computed?.rrr ?? null;

  if (isWaiting) {
    return (
      <View style={styles.waitingContainer}>
        <Card style={styles.waitingCard}>
          <MaterialCommunityIcons name="cricket" size={60} color={colors.primary} />
          <Text style={[styles.waitingTitle, { color: colors.textPrimary }]}>Match Ready!</Text>
          <Text style={[styles.waitingSubtitle, { color: colors.textSecondary }]}>Configure teams and players, then start the innings when ready.</Text>
          <TouchableOpacity 
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={onStartMatch}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.startBtnText}>START MATCH</Text>}
          </TouchableOpacity>
        </Card>
      </View>
    );
  }

  const isOldCompleted = isCompleted && (currentMatch?.innings === 1 || !currentMatch?.innings);
  const showCompleted = isCompleted && !isOldCompleted;

  if (showCompleted) {
    return (
      <View style={styles.waitingContainer}>
        <Card style={styles.waitingCard}>
          <MaterialCommunityIcons name="trophy" size={60} color={colors.accent} />
          <Text style={[styles.waitingTitle, { color: colors.textPrimary }]}>Match Completed!</Text>
          <Text style={[styles.waitingSubtitle, { color: colors.textSecondary }]}>The match has ended.</Text>
        </Card>
      </View>
    );
  }

  if (isBreak || isOldCompleted) {
    const isInningsBreak = (currentMatch?.innings === 1 || !currentMatch?.innings) && (currentMatch?.target || isOldCompleted);
    return (
      <View style={styles.waitingContainer}>
        <Card style={styles.waitingCard}>
          <MaterialCommunityIcons name="coffee" size={60} color={colors.primary} />
          <Text style={[styles.waitingTitle, { color: colors.textPrimary }]}>
            {isInningsBreak ? 'Innings Break' : 'Team Break'}
          </Text>
          <Text style={[styles.waitingSubtitle, { color: colors.textSecondary }]}>
            {isInningsBreak ? 'The first innings is over. Ready to start the second innings?' : 'The match is currently paused.'}
          </Text>
          <TouchableOpacity 
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={isInningsBreak ? onStartSecondInnings : onTakeBreak}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.startBtnText}>{isInningsBreak ? 'START 2ND INNINGS' : 'RESUME MATCH'}</Text>}
          </TouchableOpacity>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mini Scoreboard for Scorer */}
      <Card style={[styles.miniScoreCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
        <View style={styles.miniScoreRow}>
          <View style={styles.miniTeamInfo}>
            <Text style={[styles.miniTeamName, { color: colors.textSecondary }]}>
              {currentMatch?.battingTeam === 'teamB' ? score.teamB.name : score.teamA.name}
            </Text>
            <Text style={[styles.miniScoreMain, { color: colors.primary }]}>
              {currentMatch?.battingTeam === 'teamB' ? score.teamB.runs : score.teamA.runs}/
              {currentMatch?.battingTeam === 'teamB' ? score.teamB.wickets : score.teamA.wickets}
            </Text>
          </View>
          <View style={styles.miniOversInfo}>
            <Text style={[styles.miniOversText, { color: colors.textPrimary }]}>
              Overs: {currentMatch?.computed?.overs || '0.0'} Ov
            </Text>
            <View style={[styles.miniLiveBadge, { backgroundColor: colors.danger + '20' }]}>
              <Text style={[styles.miniLiveText, { color: colors.danger }]}>SCORING LIVE</Text>
            </View>
            {currentMatch?.current?.freeHit && (
              <View style={[styles.miniLiveBadge, { backgroundColor: colors.danger, marginTop: 8 }]}>
                <Text style={[styles.miniLiveText, { color: '#fff' }]}>FREE HIT ACTIVE</Text>
              </View>
            )}
          </View>
        </View>

        {/* CRR / RRR row */}
        <View style={styles.miniRateRow}>
          <View style={styles.miniRateItem}>
            <Text style={[styles.miniRateLabel, { color: colors.textSecondary }]}>CRR</Text>
            <Text style={[styles.miniRateValue, { color: colors.primary }]}>{crr.toFixed(2)}</Text>
          </View>
          {rrr !== null && (
            <View style={styles.miniRateItem}>
              <Text style={[styles.miniRateLabel, { color: colors.textSecondary }]}>RRR</Text>
              <Text style={[styles.miniRateValue, { color: rrr > crr ? colors.danger : colors.success || colors.primary }]}>
                {rrr.toFixed(2)}
              </Text>
            </View>
          )}
          {currentMatch?.overs && (
            <View style={styles.miniRateItem}>
              <Text style={[styles.miniRateLabel, { color: colors.textSecondary }]}>FORMAT</Text>
              <Text style={[styles.miniRateValue, { color: colors.textPrimary }]}>{currentMatch.overs} Ov</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Last Action Indicator */}
      <View style={styles.lastActionRow}>
        <Text style={[styles.lastActionLabel, { color: colors.textSecondary }]}>Last Ball:</Text>
        <Text style={[styles.lastActionValue, { color: colors.accent }]}>{lastPressed || '-'}</Text>
      </View>

      {/* Main Scoring Grid */}
      <Card style={styles.scoringCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Text style={[styles.cardTitle, { color: colors.primary, marginBottom: 0 }]}>QUICK SCORE</Text>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceVariant, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}
            onPress={onTakeBreak}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="coffee" size={14} color={colors.textSecondary} />
            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.textSecondary }}>TAKE BREAK</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.scoreGrid}>
          {[0, 1, 2, 3, 4, 6].map((val) => (
            <ScoreButton
              key={val}
              label={String(val)}
              value={val}
              onPress={() => onAddBall({ runs: val, extra: null, wicket: false })}
              disabled={isLoading}
            />
          ))}
        </View>
      </Card>

      {/* Extras & Wickets */}
      <View style={styles.specialGrid}>
        <TouchableOpacity 
          style={[styles.specialBtn, { borderColor: colors.warning }]} 
          onPress={() => onExtraPress('wide')}
          disabled={isLoading}
        >
          <Text style={[styles.specialBtnText, { color: colors.warning }]}>WIDE</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.specialBtn, { borderColor: colors.warning }]} 
          onPress={() => onExtraPress('noBall')}
          disabled={isLoading}
        >
          <Text style={[styles.specialBtnText, { color: colors.warning }]}>NO BALL</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.specialBtn, { backgroundColor: colors.danger, borderColor: colors.danger }]} 
          onPress={() => onAddBall({ runs: 0, extra: null, wicket: true })}
          disabled={isLoading}
        >
          <Text style={[styles.specialBtnText, { color: '#fff' }]}>WICKET</Text>
        </TouchableOpacity>
      </View>

      {/* Current Players Selection (In Scoring View) */}
      <Card style={styles.playerCard}>
        <Text style={[styles.cardTitle, { color: colors.accent }]}>ON FIELD</Text>
        <View style={styles.fieldRows}>
          <TouchableOpacity 
            style={[styles.fieldPlayer, { backgroundColor: colors.surfaceVariant, borderColor: colors.divider }]} 
            onPress={() => onReplacePlayer({ id: currentMatch?.current?.strikerId, name: currentMatch?.current?.strikerName, role: 'striker' })}
          >
            <View style={styles.fieldLabelRow}>
              <Ionicons name="flash" size={14} color={colors.primary} />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>STRIKER</Text>
            </View>
            <Text style={[styles.fieldName, { color: colors.textPrimary }]}>
              {currentMatch?.current?.strikerName || 'Select Striker'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.fieldPlayer, { backgroundColor: colors.surfaceVariant, borderColor: colors.divider }]}
            onPress={() => onReplacePlayer({ id: currentMatch?.current?.nonStrikerId, name: currentMatch?.current?.nonStrikerName, role: 'nonStriker' })}
          >
            <View style={styles.fieldLabelRow}>
              <View style={{ width: 14 }} />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>NON-STRIKER</Text>
            </View>
            <Text style={[styles.fieldName, { color: colors.textPrimary }]}>
              {currentMatch?.current?.nonStrikerName || 'Select Non-Striker'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.fieldPlayer, { backgroundColor: colors.surfaceVariant, borderColor: colors.divider }]}
            onPress={() => onReplacePlayer({ id: currentMatch?.current?.bowlerId, name: currentMatch?.current?.bowlerName, role: 'bowler' })}
          >
            <View style={styles.fieldLabelRow}>
              <MaterialCommunityIcons name="baseball" size={14} color={colors.accent} />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>BOWLER</Text>
            </View>
            <Text style={[styles.fieldName, { color: colors.textPrimary }]}>
              {currentMatch?.current?.bowlerName || 'Select Bowler'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  miniScoreCard: {
    marginBottom: 15,
    borderWidth: 1,
  },
  miniScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniTeamInfo: {
    flex: 1,
  },
  miniTeamName: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  miniScoreMain: {
    fontSize: 24,
    fontWeight: '900',
  },
  miniOversInfo: {
    alignItems: 'flex-end',
  },
  miniOversText: {
    fontSize: 14,
    fontWeight: '700',
  },
  miniLiveBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniLiveText: {
    fontSize: 8,
    fontWeight: '900',
  },
  miniRateRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    gap: 20,
  },
  miniRateItem: {
    alignItems: 'center',
  },
  miniRateLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  miniRateValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  waitingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingCard: {
    width: '100%',
    alignItems: 'center',
    padding: 30,
    borderRadius: 24,
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 15,
  },
  waitingSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  startBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  lastActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  lastActionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  lastActionValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 15,
  },
  scoringCard: {
    marginBottom: 15,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specialGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  specialBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialBtnText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  playerCard: {
    marginBottom: 15,
  },
  fieldRows: {
    gap: 12,
  },
  fieldPlayer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  fieldName: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ScoringView;

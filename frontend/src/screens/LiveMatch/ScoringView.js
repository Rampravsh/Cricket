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
import { SCORE_VALUES } from '~/constants';
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
  onStartMatch,
  onReplacePlayer,
  colors,
  spacing,
  borderRadius,
  isDark
}) => {
  const isWaiting = currentMatch?.status === 'waiting';
  const isLive = currentMatch?.status === 'live';

  if (isWaiting) {
    return (
      <View style={styles.waitingContainer}>
        <Card style={styles.waitingCard}>
          <MaterialCommunityIcons name="cricket" size={60} color={colors.primary} />
          <Text style={styles.waitingTitle}>Match Ready!</Text>
          <Text style={styles.waitingSubtitle}>Configure teams and players, then start the innings when ready.</Text>
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

  return (
    <View style={styles.container}>
      {/* Mini Scoreboard for Scorer */}
      <Card style={styles.miniScoreCard}>
        <View style={styles.miniScoreRow}>
          <View style={styles.miniTeamInfo}>
            <Text style={styles.miniTeamName}>{currentMatch?.battingTeam === 'teamB' ? score.teamB.name : score.teamA.name}</Text>
            <Text style={styles.miniScoreMain}>
              {currentMatch?.battingTeam === 'teamB' ? score.teamB.runs : score.teamA.runs}/
              {currentMatch?.battingTeam === 'teamB' ? score.teamB.wickets : score.teamA.wickets}
            </Text>
          </View>
          <View style={styles.miniOversInfo}>
            <Text style={styles.miniOversText}>
              Overs: {formatOvers(currentMatch?.battingTeam === 'teamB' ? score.teamB.balls : score.teamA.balls)}
            </Text>
            <View style={styles.miniLiveBadge}>
              <Text style={styles.miniLiveText}>SCORING LIVE</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Last Action Indicator */}
      <View style={styles.lastActionRow}>
        <Text style={styles.lastActionLabel}>Last Ball:</Text>
        <Text style={styles.lastActionValue}>{lastPressed || '-'}</Text>
      </View>

      {/* Main Scoring Grid */}
      <Card style={styles.scoringCard}>
        <Text style={styles.cardTitle}>QUICK SCORE</Text>
        <View style={styles.scoreGrid}>
          {SCORE_VALUES.map((val) => (
            <ScoreButton
              key={val.label}
              label={val.label}
              value={val.value}
              onPress={() => onAddBall({ runs: val.value, extra: null, wicket: false })}
              disabled={isLoading}
            />
          ))}
        </View>
      </Card>

      {/* Extras & Wickets */}
      <View style={styles.specialGrid}>
        <TouchableOpacity 
          style={[styles.specialBtn, { borderColor: colors.warning }]} 
          onPress={() => onAddBall({ runs: 0, extra: 'wide', wicket: false })}
          disabled={isLoading}
        >
          <Text style={[styles.specialBtnText, { color: colors.warning }]}>WIDE</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.specialBtn, { borderColor: colors.warning }]} 
          onPress={() => onAddBall({ runs: 0, extra: 'noBall', wicket: false })}
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
        <Text style={styles.cardTitle}>ON FIELD</Text>
        <View style={styles.fieldRows}>
          <TouchableOpacity 
            style={styles.fieldPlayer} 
            onPress={() => onReplacePlayer({ id: currentMatch?.current?.strikerId, name: currentMatch?.current?.strikerName, role: 'striker' })}
          >
            <View style={styles.fieldLabelRow}>
              <Ionicons name="flash" size={14} color={colors.primary} />
              <Text style={styles.fieldLabel}>STRIKER</Text>
            </View>
            <Text style={styles.fieldName}>{currentMatch?.current?.strikerName || 'Select Striker'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.fieldPlayer}
            onPress={() => onReplacePlayer({ id: currentMatch?.current?.nonStrikerId, name: currentMatch?.current?.nonStrikerName, role: 'nonStriker' })}
          >
            <View style={styles.fieldLabelRow}>
              <View style={{ width: 14 }} />
              <Text style={styles.fieldLabel}>NON-STRIKER</Text>
            </View>
            <Text style={styles.fieldName}>{currentMatch?.current?.nonStrikerName || 'Select Non-Striker'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.fieldPlayer}
            onPress={() => onReplacePlayer({ id: currentMatch?.current?.bowlerId, name: currentMatch?.current?.bowlerName, role: 'bowler' })}
          >
            <View style={styles.fieldLabelRow}>
              <MaterialCommunityIcons name="baseball" size={14} color={colors.secondary} />
              <Text style={styles.fieldLabel}>BOWLER</Text>
            </View>
            <Text style={styles.fieldName}>{currentMatch?.current?.bowlerName || 'Select Bowler'}</Text>
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
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderColor: 'rgba(0, 240, 255, 0.2)',
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
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  miniScoreMain: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00f0ff',
  },
  miniOversInfo: {
    alignItems: 'flex-end',
  },
  miniOversText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  miniLiveBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 45, 120, 0.2)',
    borderRadius: 4,
  },
  miniLiveText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#ff2d78',
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
    color: '#fff',
    marginTop: 15,
  },
  waitingSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
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
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
  },
  lastActionValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00f0ff',
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00f0ff',
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
  },
  fieldName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ScoringView;

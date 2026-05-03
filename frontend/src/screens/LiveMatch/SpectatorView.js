import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '~/components/Card';
import { formatOvers, calculateRunRate } from '~/utils/helpers';

/**
 * SpectatorView — Professional IPL-style scoreboard for public viewing
 */
const SpectatorView = ({ 
  currentMatch, 
  score, 
  currentOver, 
  target, 
  colors, 
  spacing, 
  borderRadius, 
  isDark,
  blinkAnim,
  onBack
}) => {
  const [selectedTeamTab, setSelectedTeamTab] = useState(0); // 0 for Team A, 1 for Team B

  const isLive = currentMatch?.status === 'live';
  const isCompleted = currentMatch?.status === 'completed';
  
  const teamAScore = score.teamA;
  const teamBScore = score.teamB;

  // Determine batting team for live view
  const battingTeamScore = currentMatch?.battingTeam === 'teamB' ? teamBScore : teamAScore;
  const bowlingTeamScore = currentMatch?.battingTeam === 'teamB' ? teamAScore : teamBScore;

  const runRate = calculateRunRate(battingTeamScore.runs, battingTeamScore.balls);

  const getBallStyle = (ball) => {
    if (ball.includes('W')) return { backgroundColor: colors.danger + '30', borderColor: colors.danger };
    if (ball.includes('WD') || ball.includes('NB')) return { backgroundColor: colors.warning + '30', borderColor: colors.warning };
    if (ball === '4' || ball === '6') return { backgroundColor: colors.primary + '30', borderColor: colors.primary };
    return { backgroundColor: colors.surfaceVariant, borderColor: colors.glassBorder };
  };

  const getBallTextStyle = (ball) => {
    if (ball.includes('W')) return { color: colors.danger };
    if (ball.includes('WD') || ball.includes('NB')) return { color: colors.warning };
    if (ball === '4' || ball === '6') return { color: colors.primary };
    return { color: colors.textPrimary };
  };

  return (
    <View style={styles.container}>
      {/* 1. Main Scoreboard (Professional IPL Style) */}
      <Card style={[styles.proScoreCard, { borderColor: colors.primary + '40' }]}>
        <LinearGradient
          colors={isDark 
            ? ['rgba(0, 240, 255, 0.15)', 'rgba(191, 90, 242, 0.1)'] 
            : [colors.primary + '10', colors.accent + '05']
          }
          style={styles.proGradient}
        >
          <View style={styles.proTopRow}>
            <View style={styles.proTeamInfo}>
              <Text style={[styles.proTeamName, { color: colors.textPrimary }]}>{battingTeamScore.name}</Text>
              <View style={styles.liveIndicatorRow}>
                <Animated.View style={[styles.liveDot, { opacity: blinkAnim, backgroundColor: colors.danger }]} />
                <Text style={[styles.liveText, { color: colors.textSecondary }]}>BATTING</Text>
              </View>
            </View>
            <View style={styles.proScoreContainer}>
              <Text style={[styles.proScoreMain, { color: colors.primary }]}>
                {battingTeamScore.runs}<Text style={[styles.proWicketText, { color: colors.textPrimary }]}>/{battingTeamScore.wickets}</Text>
              </Text>
              <Text style={[styles.proOversText, { color: colors.textSecondary }]}>({formatOvers(battingTeamScore.balls)})</Text>
            </View>
          </View>

          <View style={[styles.proDivider, { backgroundColor: colors.divider }]} />

          <View style={styles.proBottomRow}>
            <View style={styles.proStatItem}>
              <Text style={[styles.proStatLabel, { color: colors.textSecondary }]}>CRR</Text>
              <Text style={[styles.proStatValue, { color: colors.textPrimary }]}>{runRate}</Text>
            </View>
            {target && (
              <View style={styles.proStatItem}>
                <Text style={[styles.proStatLabel, { color: colors.textSecondary }]}>RRR</Text>
                <Text style={[styles.proStatValue, { color: colors.textPrimary }]}>
                  {calculateRunRate(target - battingTeamScore.runs, Math.max(1, 120 - battingTeamScore.balls))}
                </Text>
              </View>
            )}
            <View style={styles.proStatItem}>
              <Text style={[styles.proStatLabel, { color: colors.textSecondary }]}>OPPONENT</Text>
              <Text style={[styles.proStatValue, { color: colors.textPrimary }]}>{bowlingTeamScore.name}</Text>
            </View>
          </View>
        </LinearGradient>
      </Card>

      {/* 2. Current Players & Bowler (Live Data) */}
      {isLive && (
        <View style={styles.livePlayersSection}>
          <Card style={[styles.playerStatsCard, { borderColor: colors.primary + '20' }]}>
            <View style={styles.playerStatsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>CURRENT BATTING</Text>
              <MaterialCommunityIcons name="cricket" size={18} color={colors.primary} />
            </View>
            
            <View style={styles.battingRows}>
              {/* Striker */}
              <View style={styles.playerRow}>
                <View style={styles.playerNameCol}>
                  <Ionicons name="flash" size={14} color={colors.primary} />
                  <Text style={[styles.playerNameActive, { color: colors.textPrimary }]}>{currentMatch?.current?.strikerName || 'Striker'}</Text>
                </View>
                <Text style={[styles.playerRunsActive, { color: colors.primary }]}>
                  {currentMatch?.scorecard?.batting[currentMatch?.current?.strikerId]?.runs || 0}
                  ({currentMatch?.scorecard?.batting[currentMatch?.current?.strikerId]?.balls || 0})
                </Text>
              </View>
              
              {/* Non-Striker */}
              <View style={styles.playerRow}>
                <View style={styles.playerNameCol}>
                  <View style={{ width: 14 }} />
                  <Text style={[styles.playerNameInactive, { color: colors.textSecondary }]}>{currentMatch?.current?.nonStrikerName || 'Non-Striker'}</Text>
                </View>
                <Text style={[styles.playerRunsInactive, { color: colors.textTertiary }]}>
                  {currentMatch?.scorecard?.batting[currentMatch?.current?.nonStrikerId]?.runs || 0}
                  ({currentMatch?.scorecard?.batting[currentMatch?.current?.nonStrikerId]?.balls || 0})
                </Text>
              </View>
            </View>

            <View style={[styles.proDividerSmall, { backgroundColor: colors.divider }]} />

            <View style={styles.bowlerInfo}>
              <Text style={[styles.sectionTitleSmall, { color: colors.accent }]}>BOWLING</Text>
              <View style={styles.playerRow}>
                <View style={styles.playerNameCol}>
                  <MaterialCommunityIcons name="baseball" size={14} color={colors.accent} />
                  <Text style={[styles.playerNameActive, { color: colors.textPrimary }]}>{currentMatch?.current?.bowlerName || 'Bowler'}</Text>
                </View>
                <Text style={[styles.playerRunsActive, { color: colors.accent }]}>
                  {currentMatch?.scorecard?.bowling[currentMatch?.current?.bowlerId]?.wickets || 0}/
                  {currentMatch?.scorecard?.bowling[currentMatch?.current?.bowlerId]?.runs || 0} 
                  ({formatOvers(currentMatch?.scorecard?.bowling[currentMatch?.current?.bowlerId]?.balls || 0)})
                </Text>
              </View>
            </View>
          </Card>

          {/* 3. Current Over (Live Updates) */}
          <Card style={[styles.overCard, { borderColor: colors.accent + '20' }]}>
            <View style={styles.overHeader}>
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>THIS OVER</Text>
              <Text style={[styles.overSummary, { color: colors.textPrimary }]}>Runs: {currentOver.reduce((a, b) => a + (parseInt(b) || 0), 0)}</Text>
            </View>
            <View style={styles.ballList}>
              {[...Array(6)].map((_, i) => {
                const ball = currentOver[i];
                return (
                  <View key={i} style={[styles.ballCircle, ball ? getBallStyle(ball) : [styles.ballEmpty, { backgroundColor: colors.surfaceVariant, borderColor: colors.divider }]]}>
                    <Text style={[styles.ballText, ball ? getBallTextStyle(ball) : { color: colors.textDisabled }]}>
                      {ball || ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </View>
      )}

      {/* 4. Team Lineups (Toggleable Left/Right) */}
      <View style={styles.lineupSection}>
        <View style={[styles.tabBar, { backgroundColor: colors.surfaceVariant }]}>
          <TouchableOpacity 
            style={[styles.tab, selectedTeamTab === 0 && { backgroundColor: colors.primary + '20' }]} 
            onPress={() => setSelectedTeamTab(0)}
          >
            <Text style={[styles.tabText, selectedTeamTab === 0 && { color: colors.primary }]}>{teamAScore.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTeamTab === 1 && { backgroundColor: colors.primary + '20' }]} 
            onPress={() => setSelectedTeamTab(1)}
          >
            <Text style={[styles.tabText, selectedTeamTab === 1 && { color: colors.primary }]}>{teamBScore.name}</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.lineupCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lineupScroll}>
            <View style={styles.lineupTable}>
              <View style={[styles.tableHeader, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.headerText, { flex: 3, color: colors.textSecondary }]}>PLAYER</Text>
                <Text style={[styles.headerText, { flex: 1, textAlign: 'center', color: colors.textSecondary }]}>R</Text>
                <Text style={[styles.headerText, { flex: 1, textAlign: 'center', color: colors.textSecondary }]}>B</Text>
                <Text style={[styles.headerText, { flex: 2, textAlign: 'right', color: colors.textSecondary }]}>STATUS</Text>
              </View>
              
              {(currentMatch?.teams[selectedTeamTab]?.players || []).map((p, idx) => {
                const pId = p.playerId?._id || p.playerId || p.nameSnapshot;
                const stats = currentMatch?.scorecard?.batting[pId];
                const isOut = stats?.status !== 'not out' && stats?.status !== 'yet to bat' && stats;
                
                return (
                  <View key={idx} style={[styles.tableRow, { borderBottomColor: colors.divider }]}>
                    <View style={[styles.playerNameCol, { flex: 3 }]}>
                      <View style={[styles.avatarSmall, { backgroundColor: colors.primary + '10' }, isOut && { backgroundColor: colors.surfaceVariant }]}>
                        <Text style={[styles.avatarTextSmall, { color: colors.primary }, isOut && { color: colors.textDisabled }]}>{p.nameSnapshot?.[0]}</Text>
                      </View>
                      <View>
                        <Text style={[styles.lineupPlayerName, { color: colors.textPrimary }, isOut && { color: colors.textDisabled }]}>
                          {p.playerId?.displayName || p.nameSnapshot}
                        </Text>
                        <Text style={[styles.lineupPlayerRole, { color: colors.textTertiary }]}>{p.playerId?.role || 'All-Rounder'}</Text>
                      </View>
                    </View>
                    <Text style={[styles.lineupStat, { flex: 1, textAlign: 'center', color: colors.textPrimary }, isOut && { color: colors.textDisabled }]}>
                      {stats?.runs || 0}
                    </Text>
                    <Text style={[styles.lineupStat, { flex: 1, textAlign: 'center', color: colors.textPrimary }, isOut && { color: colors.textDisabled }]}>
                      {stats?.balls || 0}
                    </Text>
                    <Text style={[styles.lineupStatus, { flex: 2, textAlign: 'right', color: colors.primary }, isOut && { color: colors.danger }]}>
                      {isOut ? stats.status.toUpperCase() : (pId === currentMatch?.current?.strikerId || pId === currentMatch?.current?.nonStrikerId ? 'BATTING' : 'NOT OUT')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  proScoreCard: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 2,
    borderRadius: 24,
    marginBottom: 16,
  },
  proGradient: {
    padding: 20,
  },
  proTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  proTeamInfo: {
    flex: 1,
  },
  proTeamName: {
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  proScoreContainer: {
    alignItems: 'flex-end',
  },
  proScoreMain: {
    fontSize: 36,
    fontWeight: '900',
  },
  proWicketText: {
    fontSize: 24,
  },
  proOversText: {
    fontSize: 14,
    fontWeight: '700',
  },
  proDivider: {
    height: 1,
    marginVertical: 15,
  },
  proDividerSmall: {
    height: 1,
    marginVertical: 12,
  },
  proBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  proStatItem: {
    alignItems: 'center',
  },
  proStatLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 1,
  },
  proStatValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  livePlayersSection: {
    marginBottom: 20,
  },
  playerStatsCard: {
    marginBottom: 12,
    borderWidth: 1,
  },
  playerStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  sectionTitleSmall: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  battingRows: {
    gap: 8,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerNameCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerNameActive: {
    fontSize: 15,
    fontWeight: '700',
  },
  playerNameInactive: {
    fontSize: 15,
    fontWeight: '600',
  },
  playerRunsActive: {
    fontSize: 15,
    fontWeight: '800',
  },
  playerRunsInactive: {
    fontSize: 15,
    fontWeight: '600',
  },
  bowlerInfo: {
    marginTop: 4,
  },
  overCard: {
    borderWidth: 1,
  },
  overHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overSummary: {
    fontSize: 12,
    fontWeight: '700',
  },
  ballList: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  ballCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  ballEmpty: {
    borderStyle: 'dashed',
  },
  ballText: {
    fontSize: 13,
    fontWeight: '900',
  },
  lineupSection: {
    marginTop: 10,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  lineupCard: {
    padding: 0,
    overflow: 'hidden',
  },
  lineupScroll: {
    padding: 12,
  },
  lineupTable: {
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextSmall: {
    fontWeight: '800',
    fontSize: 12,
  },
  lineupPlayerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  lineupPlayerRole: {
    fontSize: 10,
    fontWeight: '600',
  },
  lineupStat: {
    fontSize: 14,
    fontWeight: '700',
  },
  lineupStatus: {
    fontSize: 10,
    fontWeight: '800',
  },
});

export default SpectatorView;

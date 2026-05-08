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
import { formatOvers } from '~/utils/helpers';

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
  const isBreak = currentMatch?.status === 'break';
  const isCompleted = currentMatch?.status === 'completed';
  const getBattingTeamIdx = () => {
    if (!currentMatch?.teams || currentMatch.teams.length < 2) return 0;
    const { toss, teams, innings } = currentMatch;
    let firstBattingIdx = 0;
    if (toss?.winner && toss?.decision) {
      const isWinnerBatting = toss.decision === 'bat';
      if (teams[1].name === toss.winner) firstBattingIdx = isWinnerBatting ? 1 : 0;
      else firstBattingIdx = isWinnerBatting ? 0 : 1;
    }
    return (innings === 2) ? (firstBattingIdx === 0 ? 1 : 0) : firstBattingIdx;
  };

  const battingIdx = getBattingTeamIdx();
  const bowlingIdx = battingIdx === 0 ? 1 : 0;

  const battingTeamName = currentMatch?.teams?.[battingIdx]?.name || 'Batting Team';
  const bowlingTeamName = currentMatch?.teams?.[bowlingIdx]?.name || 'Bowling Team';

  const currentRuns = currentMatch?.score?.runs || 0;
  const currentWickets = currentMatch?.score?.wickets || 0;

  // Read pre-computed rates from the backend engine snapshot
  const crr = currentMatch?.computed?.crr ?? 0;
  const rrr = currentMatch?.computed?.rrr ?? null; // null means 1st innings or not yet available

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
              <Text style={[styles.proTeamName, { color: colors.textPrimary }]}>{battingTeamName}</Text>
              <View style={styles.liveIndicatorRow}>
                <Animated.View style={[styles.liveDot, { opacity: blinkAnim, backgroundColor: colors.danger }]} />
                <Text style={[styles.liveText, { color: colors.textSecondary }]}>BATTING</Text>
              </View>
            </View>
            <View style={styles.proScoreContainer}>
              <Text style={[styles.proScoreMain, { color: colors.primary }]}>
                {currentRuns}<Text style={[styles.proWicketText, { color: colors.textPrimary }]}>/{currentWickets}</Text>
              </Text>
              <Text style={[styles.proOversText, { color: colors.textSecondary }]}>({currentMatch?.computed?.overs || '0.0'} Ov)</Text>
            </View>
          </View>

          <View style={[styles.proDivider, { backgroundColor: colors.divider }]} />

          <View style={styles.proBottomRow}>
            <View style={styles.proStatItem}>
              <Text style={[styles.proStatLabel, { color: colors.textSecondary }]}>CRR</Text>
              <Text style={[styles.proStatValue, { color: colors.textPrimary }]}>{crr.toFixed(2)}</Text>
            </View>
            {rrr !== null && (
              <View style={styles.proStatItem}>
                <Text style={[styles.proStatLabel, { color: colors.textSecondary }]}>RRR</Text>
                <Text style={[styles.proStatValue, { color: rrr > crr ? colors.danger : colors.success || colors.primary }]}>
                  {rrr.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.proStatItem}>
              <Text style={[styles.proStatLabel, { color: colors.textSecondary }]}>OPPONENT</Text>
              <Text style={[styles.proStatValue, { color: colors.textPrimary }]}>{bowlingTeamName}</Text>
            </View>
          </View>
        </LinearGradient>
      </Card>

      {/* Break Banner */}
      {isBreak && (
        <Card style={[styles.proScoreCard, { borderColor: colors.primary, padding: 20, alignItems: 'center', backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons name="coffee" size={40} color={colors.primary} />
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 10 }}>
            {currentMatch?.innings === 1 && currentMatch?.target ? 'INNINGS BREAK' : 'MATCH PAUSED (TEAM BREAK)'}
          </Text>
          {currentMatch?.innings === 1 && currentMatch?.target && (
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700', marginTop: 5 }}>
              Target: {currentMatch.target}
            </Text>
          )}
        </Card>
      )}

      {/* 2. Current Players & Bowler (Live Data) */}
      {isLive && (
        <View style={styles.livePlayersSection}>
          <Card style={[styles.playerStatsCard, { borderColor: colors.primary + '20' }]}>
            <View style={styles.playerStatsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>CURRENT BATTING</Text>
              <MaterialCommunityIcons name="cricket" size={18} color={colors.primary} />
            </View>
            
            <View style={styles.battingRows}>
              <View style={[styles.playerRow, { paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
                <Text style={[styles.playerNameActive, { color: colors.textSecondary, flex: 3, fontSize: 11 }]}>BATTER</Text>
                <Text style={[styles.playerRunsActive, { color: colors.textSecondary, flex: 1, textAlign: 'center', fontSize: 11 }]}>R(B)</Text>
                <Text style={[styles.playerRunsActive, { color: colors.textSecondary, flex: 1, textAlign: 'center', fontSize: 11 }]}>4s</Text>
                <Text style={[styles.playerRunsActive, { color: colors.textSecondary, flex: 1, textAlign: 'center', fontSize: 11 }]}>6s</Text>
                <Text style={[styles.playerRunsActive, { color: colors.textSecondary, flex: 1, textAlign: 'right', fontSize: 11 }]}>SR</Text>
              </View>
              {/* Striker */}
              <View style={styles.playerRow}>
                <View style={[styles.playerNameCol, { flex: 3 }]}>
                  <Ionicons name="flash" size={14} color={colors.primary} />
                  <Text style={[styles.playerNameActive, { color: colors.textPrimary }]} numberOfLines={1}>
                    {currentMatch?.current?.strikerName || 'Striker'}
                  </Text>
                </View>
                <Text style={[styles.playerRunsActive, { color: colors.primary, flex: 1, textAlign: 'center' }]}>
                  {currentMatch?.scorecard?.batting[currentMatch?.current?.strikerId]?.runs || 0}
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>({currentMatch?.scorecard?.batting[currentMatch?.current?.strikerId]?.balls || 0})</Text>
                </Text>
                <Text style={[styles.playerRunsInactive, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
                  {currentMatch?.scorecard?.batting[currentMatch?.current?.strikerId]?.fours || 0}
                </Text>
                <Text style={[styles.playerRunsInactive, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
                  {currentMatch?.scorecard?.batting[currentMatch?.current?.strikerId]?.sixes || 0}
                </Text>
                <Text style={[styles.playerRunsInactive, { color: colors.textPrimary, flex: 1, textAlign: 'right' }]}>
                  {((currentMatch?.scorecard?.batting[currentMatch?.current?.strikerId]?.runs || 0) / Math.max(1, currentMatch?.scorecard?.batting[currentMatch?.current?.strikerId]?.balls || 1) * 100).toFixed(1)}
                </Text>
              </View>
              
              {/* Non-Striker */}
              <View style={styles.playerRow}>
                <View style={[styles.playerNameCol, { flex: 3 }]}>
                  <View style={{ width: 14 }} />
                  <Text style={[styles.playerNameInactive, { color: colors.textSecondary }]} numberOfLines={1}>
                    {currentMatch?.current?.nonStrikerName || 'Non-Striker'}
                  </Text>
                </View>
                <Text style={[styles.playerRunsInactive, { color: colors.textTertiary, flex: 1, textAlign: 'center' }]}>
                  {currentMatch?.scorecard?.batting[currentMatch?.current?.nonStrikerId]?.runs || 0}
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>({currentMatch?.scorecard?.batting[currentMatch?.current?.nonStrikerId]?.balls || 0})</Text>
                </Text>
                <Text style={[styles.playerRunsInactive, { color: colors.textTertiary, flex: 1, textAlign: 'center' }]}>
                  {currentMatch?.scorecard?.batting[currentMatch?.current?.nonStrikerId]?.fours || 0}
                </Text>
                <Text style={[styles.playerRunsInactive, { color: colors.textTertiary, flex: 1, textAlign: 'center' }]}>
                  {currentMatch?.scorecard?.batting[currentMatch?.current?.nonStrikerId]?.sixes || 0}
                </Text>
                <Text style={[styles.playerRunsInactive, { color: colors.textTertiary, flex: 1, textAlign: 'right' }]}>
                  {((currentMatch?.scorecard?.batting[currentMatch?.current?.nonStrikerId]?.runs || 0) / Math.max(1, currentMatch?.scorecard?.batting[currentMatch?.current?.nonStrikerId]?.balls || 1) * 100).toFixed(1)}
                </Text>
              </View>
            </View>

            <View style={[styles.proDividerSmall, { backgroundColor: colors.divider }]} />

            <View style={styles.bowlerInfo}>
              <Text style={[styles.sectionTitleSmall, { color: colors.accent }]}>BOWLING</Text>
              <View style={[styles.playerRow, { paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
                <Text style={[styles.playerNameActive, { color: colors.textSecondary, flex: 3, fontSize: 11 }]}>BOWLER</Text>
                <Text style={[styles.playerRunsActive, { color: colors.textSecondary, flex: 1, textAlign: 'center', fontSize: 11 }]}>O</Text>
                <Text style={[styles.playerRunsActive, { color: colors.textSecondary, flex: 1, textAlign: 'center', fontSize: 11 }]}>M</Text>
                <Text style={[styles.playerRunsActive, { color: colors.textSecondary, flex: 1, textAlign: 'center', fontSize: 11 }]}>R</Text>
                <Text style={[styles.playerRunsActive, { color: colors.textSecondary, flex: 1, textAlign: 'center', fontSize: 11 }]}>W</Text>
                <Text style={[styles.playerRunsActive, { color: colors.textSecondary, flex: 1, textAlign: 'right', fontSize: 11 }]}>ECO</Text>
              </View>
              <View style={styles.playerRow}>
                <View style={[styles.playerNameCol, { flex: 3 }]}>
                  <MaterialCommunityIcons name="tennis-ball" size={14} color={colors.accent} />
                  <Text style={[styles.playerNameActive, { color: colors.textPrimary }]} numberOfLines={1}>
                    {currentMatch?.current?.bowlerName || 'Bowler'}
                  </Text>
                </View>
                <Text style={[styles.playerRunsActive, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
                  {formatOvers(currentMatch?.scorecard?.bowling[currentMatch?.current?.bowlerId]?.balls || 0)}
                </Text>
                <Text style={[styles.playerRunsInactive, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
                  {currentMatch?.scorecard?.bowling[currentMatch?.current?.bowlerId]?.maidens || 0}
                </Text>
                <Text style={[styles.playerRunsInactive, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
                  {currentMatch?.scorecard?.bowling[currentMatch?.current?.bowlerId]?.runs || 0}
                </Text>
                <Text style={[styles.playerRunsActive, { color: colors.accent, flex: 1, textAlign: 'center' }]}>
                  {currentMatch?.scorecard?.bowling[currentMatch?.current?.bowlerId]?.wickets || 0}
                </Text>
                <Text style={[styles.playerRunsInactive, { color: colors.textPrimary, flex: 1, textAlign: 'right' }]}>
                  {((currentMatch?.scorecard?.bowling[currentMatch?.current?.bowlerId]?.runs || 0) / Math.max(1, (currentMatch?.scorecard?.bowling[currentMatch?.current?.bowlerId]?.balls || 0) / 6)).toFixed(1)}
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
            <Text style={[styles.tabText, selectedTeamTab === 0 && { color: colors.primary }]}>{currentMatch?.teams?.[0]?.name || 'Team 1'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTeamTab === 1 && { backgroundColor: colors.primary + '20' }]} 
            onPress={() => setSelectedTeamTab(1)}
          >
            <Text style={[styles.tabText, selectedTeamTab === 1 && { color: colors.primary }]}>{currentMatch?.teams?.[1]?.name || 'Team 2'}</Text>
          </TouchableOpacity>
        </View>

        <Card style={[styles.lineupCard, { padding: 0 }]}>
          <View style={styles.lineupList}>
            {(currentMatch?.teams[selectedTeamTab]?.players || []).map((p, idx) => {
              const pId = p.playerId?._id || p.playerId || p.nameSnapshot;
              const stats = currentMatch?.scorecard?.batting[pId];
              const bowlStats = currentMatch?.scorecard?.bowling[pId];
              
              const isBatting = pId === currentMatch?.current?.strikerId || pId === currentMatch?.current?.nonStrikerId;
              const isBowling = pId === currentMatch?.current?.bowlerId;
              const isOut = stats?.status && stats.status !== 'not out' && stats.status !== 'yet to bat';
              
              let statusText = '';
              let statusColor = colors.textSecondary;
              
              if (isBatting) {
                statusText = 'BATTING';
                statusColor = colors.primary;
              } else if (isBowling) {
                statusText = 'BOWLING';
                statusColor = colors.accent;
              } else if (isOut) {
                statusText = stats.status.toUpperCase();
                statusColor = colors.danger;
              } else if (stats && stats.status === 'not out' && stats.balls > 0) {
                statusText = 'NOT OUT';
                statusColor = colors.textPrimary;
              } else if (stats && stats.status === 'yet to bat') {
                statusText = 'YET TO BAT';
                statusColor = colors.textDisabled;
              }
              
              return (
                <View key={idx} style={[styles.playerCardRow, { borderBottomColor: colors.divider, paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1 }]}>
                  <View style={styles.playerCardHeader}>
                    <View style={styles.playerNameCol}>
                      <View style={[styles.avatarSmall, { backgroundColor: colors.primary + '10' }, isOut && { backgroundColor: colors.surfaceVariant }]}>
                        <Text style={[styles.avatarTextSmall, { color: colors.primary }, isOut && { color: colors.textDisabled }]}>{p.nameSnapshot?.[0]}</Text>
                      </View>
                      <View>
                        <Text style={[styles.lineupPlayerName, { color: colors.textPrimary }, isOut && { color: colors.textDisabled }]}>
                          {p.playerId?.displayName || p.nameSnapshot}
                        </Text>
                        <Text style={[styles.lineupPlayerRole, { color: colors.textTertiary }]}>{p.playerId?.role || 'Player'}</Text>
                      </View>
                    </View>
                    {statusText ? (
                      <View style={styles.playerStatusBadge}>
                        <Text style={[styles.lineupStatus, { color: statusColor }]}>
                          {statusText}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.playerCardStats}>
                    {/* Batting Stats */}
                    {stats && (stats.balls > 0 || stats.runs > 0 || isBatting || isOut) && (
                      <View style={styles.statRow}>
                        <MaterialCommunityIcons name="cricket" size={14} color={colors.textSecondary} style={styles.statIcon} />
                        <Text style={[styles.statText, { color: colors.textPrimary }]}>
                          <Text style={{ fontWeight: '800' }}>{stats.runs || 0}</Text> ({stats.balls || 0}) 
                          <Text style={{ color: colors.textTertiary }}> • 4s: {stats.fours || 0} • 6s: {stats.sixes || 0} • SR: {((stats.runs || 0) / Math.max(1, stats.balls || 1) * 100).toFixed(1)}</Text>
                        </Text>
                      </View>
                    )}

                    {/* Bowling Stats */}
                    {bowlStats && (bowlStats.balls > 0) && (
                      <View style={[styles.statRow, { marginTop: 4 }]}>
                        <MaterialCommunityIcons name="tennis-ball" size={14} color={colors.accent} style={styles.statIcon} />
                        <Text style={[styles.statText, { color: colors.textPrimary }]}>
                          <Text style={{ fontWeight: '800', color: colors.accent }}>{bowlStats.wickets || 0}</Text>/{bowlStats.runs || 0}
                          <Text style={{ color: colors.textTertiary }}> • {formatOvers(bowlStats.balls)} O • {bowlStats.maidens || 0} M • Econ: {((bowlStats.runs || 0) / Math.max(1, bowlStats.balls / 6)).toFixed(1)}</Text>
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
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
  lineupList: {
    paddingBottom: 8,
  },
  playerCardRow: {
    flexDirection: 'column',
  },
  playerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerStatusBadge: {
    alignItems: 'flex-end',
  },
  playerCardStats: {
    paddingLeft: 42,
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 6,
    width: 16,
    textAlign: 'center',
  },
  statText: {
    fontSize: 13,
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextSmall: {
    fontWeight: '800',
    fontSize: 14,
  },
  lineupPlayerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  lineupPlayerRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  lineupStatus: {
    fontSize: 11,
    fontWeight: '800',
  },
});

export default SpectatorView;

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '~/hooks/useTheme';
import useSocket from '~/hooks/useSocket';
import { 
  selectScore, 
  selectCurrentOver, 
  selectTarget, 
  fetchMatchThunk, 
  addBallThunk, 
  startMatchThunk, 
  replacePlayerThunk, 
  requestScorerThunk,
  resetMatch,
  selectCurrentMatch, 
  selectIsLoading,
  setCurrentPlayersThunk,
} from '~/store/matchSlice';
import Header from '~/components/Header';
import NotificationIcon from '~/components/NotificationIcon';

// Modular Views
import ScoringView from './LiveMatch/ScoringView';
import SpectatorView from './LiveMatch/SpectatorView';

/**
 * LiveMatchScreen — Controller for live cricket match
 * Handles data fetching, socket events, and toggles between Scoring and Spectator views.
 */
function LiveMatchScreen() {
  const { colors, spacing, borderRadius, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const blinkAnim = useRef(new Animated.Value(1)).current;
  const currentMatch = useSelector(selectCurrentMatch);
  const score = useSelector(selectScore);
  const currentOver = useSelector(selectCurrentOver);
  const target = useSelector(selectTarget);
  const isLoading = useSelector(selectIsLoading);
  const currentUser = useSelector(state => state.auth.user);

  const matchId = route.params?.matchId || currentMatch?.matchId;

  // View state: 'spectator' (public) or 'scoring' (creators)
  const [viewMode, setViewMode] = useState('spectator');

  // Setup real-time socket connection
  useSocket(matchId);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [blinkAnim]);

  useEffect(() => {
    if (matchId) {
      dispatch(fetchMatchThunk(matchId));
    }
    // Cleanup match state on unmount to fix the "stale data" bug
    return () => {
      dispatch(resetMatch());
    };
  }, [dispatch, matchId]);

  // Role Detection
  const isCreator = currentMatch?.createdByUserId?._id === currentUser?._id || currentMatch?.createdByUserId === currentUser?._id;
  const isScorer = currentMatch?.scorers?.some(s => (s._id || s) === currentUser?._id);
  const canScore = isCreator || isScorer;

  // Set initial view mode based on permissions
  useEffect(() => {
    if (canScore) {
      setViewMode('scoring');
    } else {
      setViewMode('spectator');
    }
  }, [canScore]);

  const [lastPressed, setLastPressed] = useState(null);

  // Player replacement state
  const [replacingPlayer, setReplacingPlayer] = useState(null); // { role: 'striker' | 'nonStriker' | 'bowler' }

  // Get team players for the modal based on role
  // battingTeam index is derived from toss (same as backend logic)
  const getBattingTeamIdx = () => {
    if (!currentMatch?.teams || currentMatch.teams.length < 2) return 0;
    const { toss, teams } = currentMatch;
    if (toss?.winner && toss?.decision) {
      const isWinnerBatting = toss.decision === 'bat';
      if (teams[1].name === toss.winner) return isWinnerBatting ? 1 : 0;
      return isWinnerBatting ? 0 : 1; // teams[0] is winner
    }
    return 0; // default: teams[0] bats
  };

  const getPlayersForRole = (role) => {
    if (!currentMatch?.teams || currentMatch.teams.length < 2) return [];
    const battingTeamIdx = getBattingTeamIdx();
    const bowlingTeamIdx = battingTeamIdx === 0 ? 1 : 0;
    const teamIdx = role === 'bowler' ? bowlingTeamIdx : battingTeamIdx;
    return currentMatch.teams[teamIdx]?.players || [];
  };

  // Get team name for modal title
  const getTeamNameForRole = (role) => {
    if (!currentMatch?.teams || currentMatch.teams.length < 2) return '';
    const battingTeamIdx = getBattingTeamIdx();
    const bowlingTeamIdx = battingTeamIdx === 0 ? 1 : 0;
    const teamIdx = role === 'bowler' ? bowlingTeamIdx : battingTeamIdx;
    return currentMatch.teams[teamIdx]?.name || '';
  };

  // Get player's display ID (playerId or nameSnapshot)
  const getPlayerId = (player) => {
    return player.playerId?.toString() || player.nameSnapshot;
  };

  // Check if player is currently active (striker, non-striker, or bowler)
  const isCurrentPlayer = (player, role) => {
    const pid = getPlayerId(player);
    const cur = currentMatch?.current;
    if (role === 'striker') return pid === cur?.strikerId;
    if (role === 'nonStriker') return pid === cur?.nonStrikerId;
    if (role === 'bowler') return pid === cur?.bowlerId;
    return false;
  };

  // Check if player is already on field in a different role
  const isOnField = (player) => {
    const pid = getPlayerId(player);
    const cur = currentMatch?.current;
    return pid === cur?.strikerId || pid === cur?.nonStrikerId || pid === cur?.bowlerId;
  };

  const handleAddBall = async (ballData) => {
    if (!matchId) return;
    setLastPressed(ballData.wicket ? 'WICKET' : ballData.extra ? ballData.extra.toUpperCase() : ballData.runs);
    await dispatch(addBallThunk({ matchId, payload: ballData }));
  };

  const handleStartMatch = async () => {
    if (!matchId) return;
    await dispatch(startMatchThunk(matchId));
  };

  const handleRequestScorer = async () => {
    if (!matchId) return;
    await dispatch(requestScorerThunk(matchId));
  };

  const handleReplace = async (player) => {
    if (!matchId || !replacingPlayer) return;
    const playerId = getPlayerId(player);
    try {
      await dispatch(setCurrentPlayersThunk({
        matchId,
        payload: {
          role: replacingPlayer.role,
          playerId,
        }
      }));
      setReplacingPlayer(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to set player');
    }
  };

  if (isLoading && !currentMatch) {
    return (
      <View style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!currentMatch && !isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Match Not Found" showBack onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <MaterialCommunityIcons name="alert-circle-outline" size={80} color={colors.textDisabled} />
          <Text style={{ color: colors.textSecondary, marginTop: 20 }}>This match may have been deleted.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      <Header
        title={viewMode === 'scoring' ? "Scoring Center" : "Live Scoreboard"}
        showBack
        onBack={() => navigation.goBack()}
        rightComponent={
          <View style={styles.headerRight}>
            {canScore && (
              <TouchableOpacity 
                onPress={() => setViewMode(v => v === 'scoring' ? 'spectator' : 'scoring')}
                style={styles.toggleBtn}
              >
                <MaterialCommunityIcons 
                  name={viewMode === 'scoring' ? "eye-outline" : "pencil-outline"} 
                  size={24} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            )}
            <NotificationIcon />
          </View>
        }
      />

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'scoring' ? (
          <ScoringView 
            currentMatch={currentMatch}
            score={score}
            currentOver={currentOver}
            lastPressed={lastPressed}
            isLoading={isLoading}
            onAddBall={handleAddBall}
            onStartMatch={handleStartMatch}
            onReplacePlayer={setReplacingPlayer}
            colors={colors}
            spacing={spacing}
            borderRadius={borderRadius}
            isDark={isDark}
          />
        ) : (
          <SpectatorView 
            currentMatch={currentMatch}
            score={score}
            currentOver={currentOver}
            target={target}
            colors={colors}
            spacing={spacing}
            borderRadius={borderRadius}
            isDark={isDark}
            blinkAnim={blinkAnim}
          />
        )}
      </ScrollView>

      {/* Player Selection Modal — shows team roster */}
      <Modal
        visible={!!replacingPlayer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReplacingPlayer(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {replacingPlayer?.role === 'striker' ? '⚡ STRIKER' : 
                   replacingPlayer?.role === 'nonStriker' ? '🏏 NON-STRIKER' : 'BOWLER'}
                </Text>
                <Text style={[styles.modalTeamLabel, { color: colors.textSecondary }]}>
                  {getTeamNameForRole(replacingPlayer?.role)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReplacingPlayer(null)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={getPlayersForRole(replacingPlayer?.role)}
              keyExtractor={(item, index) => getPlayerId(item) || String(index)}
              renderItem={({ item }) => {
                const pid = getPlayerId(item);
                const isCurrent = isCurrentPlayer(item, replacingPlayer?.role);
                const onField = isOnField(item);
                return (
                  <TouchableOpacity 
                    style={[
                      styles.playerItem, 
                      { borderBottomColor: colors.divider },
                      isCurrent && { backgroundColor: colors.primary + '15' },
                    ]}
                    onPress={() => !isCurrent && handleReplace(item)}
                    disabled={isCurrent}
                  >
                    <View style={[
                      styles.avatar, 
                      { backgroundColor: isCurrent ? colors.primary + '30' : onField ? colors.accent + '20' : colors.surfaceVariant }
                    ]}>
                      <Text style={{ 
                        color: isCurrent ? colors.primary : onField ? colors.accent : colors.textSecondary, 
                        fontWeight: '900',
                        fontSize: 16,
                      }}>
                        {(item.nameSnapshot || '?')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.playerName, { color: isCurrent ? colors.primary : colors.textPrimary }]}>
                        {item.nameSnapshot || 'Unknown'}
                      </Text>
                      {isCurrent && (
                        <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
                          ✓ {replacingPlayer?.role === 'striker' ? 'Striker' : replacingPlayer?.role === 'nonStriker' ? 'Non-Striker' : 'Bowler'}
                        </Text>
                      )}
                      {!isCurrent && onField && (
                        <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700' }}>
                          • on field
                        </Text>
                      )}
                    </View>
                    {isCurrent && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                    {!isCurrent && (
                      <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="account-group-outline" size={50} color={colors.textDisabled} />
                  <Text style={[styles.emptyText, { color: colors.textDisabled }]}>
                    No players found in this team.
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  toggleBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalTeamLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
});

export default LiveMatchScreen;

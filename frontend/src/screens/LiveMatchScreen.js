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
  selectIsLoading 
} from '~/store/matchSlice';
import { playerApi } from '~/services/api';
import Header from '~/components/Header';
import NotificationIcon from '~/components/NotificationIcon';

// Modular Views
import ScoringView from './ScoringView';
import SpectatorView from './SpectatorView';

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

  // Local state for last action
  const [lastPressed, setLastPressed] = useState(null);

  // Player replacement state
  const [replacingPlayer, setReplacingPlayer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearchPlayers = async (text) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await playerApi.searchPlayers(text);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReplace = async (newPlayerId) => {
    if (!matchId || !replacingPlayer) return;
    try {
      await dispatch(replacePlayerThunk({
        matchId,
        payload: {
          role: replacingPlayer.role,
          playerId: newPlayerId
        }
      }));
      setReplacingPlayer(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to replace player');
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
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
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
        contentContainerStyle={styles.scrollContent}
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

      {/* Player Selection Modal */}
      <Modal
        visible={!!replacingPlayer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReplacingPlayer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Select New {replacingPlayer?.role?.toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => setReplacingPlayer(null)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary, borderColor: colors.divider }]}
              placeholder="Search by name..."
              placeholderTextColor={colors.textDisabled}
              value={searchQuery}
              onChangeText={handleSearchPlayers}
            />

            {isSearching ? (
              <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.playerItem}
                    onPress={() => handleReplace(item.userId)}
                  >
                    <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={{ color: colors.primary, fontWeight: '700' }}>{item.displayName[0]}</Text>
                    </View>
                    <View>
                      <Text style={[styles.playerName, { color: colors.textPrimary }]}>{item.displayName}</Text>
                      <Text style={{ color: colors.textTertiary, fontSize: 12 }}>{item.role}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {searchQuery.length < 2 ? 'Type at least 2 characters' : 'No players found'}
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050505',
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
    backgroundColor: 'rgba(0,0,0,0.8)',
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
    fontSize: 18,
    fontWeight: '800',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: 'rgba(255,255,255,0.3)',
  },
});

export default LiveMatchScreen;

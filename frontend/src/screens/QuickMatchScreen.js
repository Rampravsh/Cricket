import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '~/hooks/useTheme';
import Header from '~/components/Header';
import Button from '~/components/Button';
import { matchApi, playerApi } from '~/services/api';

const MATCH_FORMATS = [
  { id: 'T10', label: 'T10', overs: 10 },
  { id: 'T20', label: 'T20', overs: 20 },
  { id: 'ODI', label: 'ODI', overs: 50 },
  { id: 'custom', label: 'Custom', overs: 5 },
];

function QuickMatchScreen() {
  const { colors, spacing, borderRadius, isDark } = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(colors, spacing, borderRadius, isDark);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Match Config
  const [config, setConfig] = useState({
    format: 'T20',
    overs: '20',
    maxPlayers: '11',
    isPublic: true,
  });

  // Step 2: Team Setup
  const [teams, setTeams] = useState({
    teamA: { name: 'Team A', players: [] },
    teamB: { name: 'Team B', players: [] },
  });

  // Player Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeTeam, setActiveTeam] = useState('teamA');

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const nextStep = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setStep(2);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const prevStep = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setStep(1);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await playerApi.searchPlayers(query);
      if (response.success) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const addPlayer = (team, player) => {
    const currentPlayers = teams[team].players;
    if (currentPlayers.length >= parseInt(config.maxPlayers)) {
      Alert.alert('Max Players Reached', `This match allows only ${config.maxPlayers} players per team.`);
      return;
    }

    // Check if player already added
    const playerId = player._id || player.id;
    const exists = currentPlayers.find(p => (p._id || p.id || p.name) === (playerId || player.name));
    if (exists) {
      Alert.alert('Duplicate Player', 'This player is already in the team.');
      return;
    }

    setTeams({
      ...teams,
      [team]: {
        ...teams[team],
        players: [...currentPlayers, player],
      },
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const removePlayer = (team, identifier) => {
    setTeams({
      ...teams,
      [team]: {
        ...teams[team],
        players: teams[team].players.filter(p => (p._id || p.id || p.name) !== identifier),
      },
    });
  };

  const createMatch = async () => {
    if (teams.teamA.players.length === 0 || teams.teamB.players.length === 0) {
      Alert.alert('Error', 'Each team must have at least one player');
      return;
    }

    setLoading(true);
    try {
      const matchData = {
        matchId: `MATCH-${Math.floor(1000 + Math.random() * 9000)}`,
        format: config.format,
        overs: parseInt(config.overs),
        maxPlayers: parseInt(config.maxPlayers),
        isPublic: config.isPublic,
        teams: [
          {
            name: teams.teamA.name,
            players: teams.teamA.players.map(p => ({
              playerId: p._id || null,
              nameSnapshot: p.displayName || p.name
            }))
          },
          {
            name: teams.teamB.name,
            players: teams.teamB.players.map(p => ({
              playerId: p._id || null,
              nameSnapshot: p.displayName || p.name
            }))
          }
        ],
        players: [
          ...teams.teamA.players.filter(p => p._id).map(p => ({ playerId: p._id, name: p.displayName, status: 'pending' })),
          ...teams.teamB.players.filter(p => p._id).map(p => ({ playerId: p._id, name: p.displayName, status: 'pending' }))
        ]
      };

      const response = await matchApi.createMatch(matchData);
      if (response.success) {
        navigation.navigate('LiveMatch', { matchId: response.data.matchId });
      } else {
        Alert.alert('Error', response.message || 'Failed to create match');
      }
    } catch (error) {
      console.error('Create match error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Match Configuration</Text>
      
      <Text style={styles.label}>Match Format</Text>
      <View style={styles.formatGrid}>
        {MATCH_FORMATS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.formatBtn, config.format === f.id && styles.formatBtnActive]}
            onPress={() => setConfig({ ...config, format: f.id, overs: f.overs.toString() })}
          >
            <Text style={[styles.formatBtnText, config.format === f.id && styles.formatBtnTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: spacing[2] }}>
          <Text style={styles.label}>Overs</Text>
          <TextInput
            style={styles.input}
            value={config.overs}
            onChangeText={(v) => setConfig({ ...config, overs: v })}
            keyboardType="numeric"
            placeholder="e.g. 20"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        <View style={{ flex: 1, marginLeft: spacing[2] }}>
          <Text style={styles.label}>Players per Team</Text>
          <TextInput
            style={styles.input}
            value={config.maxPlayers}
            onChangeText={(v) => setConfig({ ...config, maxPlayers: v })}
            keyboardType="numeric"
            placeholder="e.g. 11"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.switchRow}
        onPress={() => setConfig({ ...config, isPublic: !config.isPublic })}
      >
        <View>
          <Text style={styles.switchLabel}>Public Match</Text>
          <Text style={styles.switchSublabel}>Anyone can see and request to score</Text>
        </View>
        <Ionicons
          name={config.isPublic ? 'checkbox' : 'square-outline'}
          size={24}
          color={config.isPublic ? colors.primary : colors.textTertiary}
        />
      </TouchableOpacity>

      <Button
        title="Next: Team Setup"
        onPress={nextStep}
        variant="primary"
        style={{ marginTop: spacing[8] }}
      />
    </ScrollView>
  );

  const renderStep2 = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>Team Setup</Text>

        {/* Team Selector */}
        <View style={styles.teamTabs}>
          <TouchableOpacity
            style={[styles.teamTab, activeTeam === 'teamA' && styles.teamTabActive]}
            onPress={() => setActiveTeam('teamA')}
          >
            <Text style={[styles.teamTabText, activeTeam === 'teamA' && styles.teamTabTextActive]}>
              {teams.teamA.name} ({teams.teamA.players.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.teamTab, activeTeam === 'teamB' && styles.teamTabActive]}
            onPress={() => setActiveTeam('teamB')}
          >
            <Text style={[styles.teamTabText, activeTeam === 'teamB' && styles.teamTabTextActive]}>
              {teams.teamB.name} ({teams.teamB.players.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.teamSection}>
          <TextInput
            style={[styles.input, { marginBottom: spacing[4] }]}
            value={teams[activeTeam].name}
            onChangeText={(v) => setTeams({ ...teams, [activeTeam]: { ...teams[activeTeam], name: v } })}
            placeholder="Team Name"
          />

          <Text style={styles.label}>Add Player</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Type name or search username..."
              placeholderTextColor={colors.textTertiary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  if (searchResults.length === 0) {
                    addPlayer(activeTeam, { name: searchQuery });
                  }
                }}
                style={styles.addGuestBtn}
              >
                <Text style={styles.addGuestText}>Add Guest</Text>
              </TouchableOpacity>
            )}
          </View>

          {searching && <ActivityIndicator color={colors.primary} style={{ marginTop: 10 }} />}

          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              {searchResults.map((player) => (
                <TouchableOpacity
                  key={player._id}
                  style={styles.resultItem}
                  onPress={() => addPlayer(activeTeam, player)}
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
            </View>
          )}

        <View style={styles.playersList}>
          {teams[activeTeam].players.map((p, index) => (
            <View key={p._id || p.id || `${p.name}-${index}`} style={styles.playerChip}>
              <Text style={styles.playerChipText}>{p.displayName || p.name}</Text>
                {p._id && <Ionicons name="checkmark-circle" size={14} color={colors.success} style={{ marginLeft: 4 }} />}
                <TouchableOpacity onPress={() => removePlayer(activeTeam, p._id || p.id || p.name)}>
                  <Ionicons name="close-circle" size={18} color={colors.textTertiary} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footerBtns}>
          <Button
            title="Back"
            onPress={prevStep}
            variant="secondary"
            style={{ flex: 1, marginRight: spacing[2] }}
          />
          <Button
            title={loading ? "Creating..." : "Create Match"}
            onPress={createMatch}
            variant="primary"
            disabled={loading}
            style={{ flex: 2, marginLeft: spacing[2] }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle={colors.statusBar === 'dark' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      <Header title="Match Creation" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {step === 1 ? renderStep1() : renderStep2()}
      </Animated.View>
    </SafeAreaView>
  );
}

function createStyles(colors, spacing, borderRadius, isDark) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    stepContainer: {
      padding: spacing[6],
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: spacing[6],
      letterSpacing: -0.5,
    },
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: spacing[2],
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.divider,
      fontSize: 16,
    },
    row: {
      flexDirection: 'row',
      marginBottom: spacing[4],
    },
    formatGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[2],
      marginBottom: spacing[6],
    },
    formatBtn: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.surface,
      paddingVertical: spacing[3],
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.divider,
      alignItems: 'center',
    },
    formatBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    formatBtnText: {
      color: colors.textSecondary,
      fontWeight: '700',
    },
    formatBtnTextActive: {
      color: colors.textOnPrimary,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      padding: spacing[4],
      borderRadius: borderRadius.lg,
      marginTop: spacing[2],
    },
    switchLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    switchSublabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },

    // Team Setup
    teamTabs: {
      flexDirection: 'row',
      marginBottom: spacing[4],
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.xl,
      padding: spacing[1],
    },
    teamTab: {
      flex: 1,
      paddingVertical: spacing[3],
      alignItems: 'center',
      borderRadius: borderRadius.lg,
    },
    teamTabActive: {
      backgroundColor: colors.surface,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    teamTabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    teamTabTextActive: {
      color: colors.primary,
      fontWeight: '800',
    },
    teamSection: {
      backgroundColor: colors.surface,
      padding: spacing[4],
      borderRadius: borderRadius.xl,
      marginBottom: spacing[6],
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.divider,
      paddingHorizontal: spacing[3],
    },
    searchIcon: {
      marginRight: spacing[2],
    },
    searchInput: {
      flex: 1,
      paddingVertical: spacing[3],
      color: colors.textPrimary,
      fontSize: 15,
    },
    addGuestBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.md,
    },
    addGuestText: {
      color: colors.textOnPrimary,
      fontSize: 12,
      fontWeight: '800',
    },
    resultsContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      marginTop: spacing[2],
      borderWidth: 1,
      borderColor: colors.divider,
      maxHeight: 200,
      overflow: 'hidden',
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[3],
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
    playersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[2],
      marginTop: spacing[4],
    },
    playerChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    playerChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    footerBtns: {
      flexDirection: 'row',
      marginTop: spacing[4],
      marginBottom: spacing[12],
    },
  });
}

export default QuickMatchScreen;

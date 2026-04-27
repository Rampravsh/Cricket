import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '~/hooks/useTheme';
import Header from '~/components/Header';
import { userApi, matchApi } from '~/services/api';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public' },
  { id: 'player', label: 'Played' },
  { id: 'scorer', label: 'Scored' },
  { id: 'creator', label: 'Created' },
];

function HistoryScreen() {
  const { colors, spacing, borderRadius, isDark } = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(colors, spacing, borderRadius, isDark);
  const currentUser = useSelector(state => state.auth.user);

  const [matches, setMatches] = useState([]);
  const [publicMatches, setPublicMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllMatches();
  }, []);

  const fetchAllMatches = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const [historyRes, publicRes] = await Promise.all([
        userApi.getMatchHistory(),
        matchApi.getMatches()
      ]);

      if (historyRes.success) {
        setMatches(historyRes.data);
      }
      if (publicRes.success) {
        setPublicMatches(publicRes.data.matches);
      }
    } catch (err) {
      console.error('[History] Error fetching matches:', err);
      setError('Failed to load matches. Please try again.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllMatches(false);
    setIsRefreshing(false);
  };

  const handleRequestScorer = async (matchId) => {
    try {
      const response = await matchApi.requestScorer(matchId);
      if (response.success) {
        Alert.alert('Success', 'Scorer request sent to the match owner!');
        fetchAllMatches(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to send request');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  const combinedMatches = useMemo(() => {
    const map = new Map();
    // Add history matches first (they have performance data)
    matches.forEach(m => map.set(m.matchId, m));
    // Add public matches if not already present
    publicMatches.forEach(m => {
      if (!map.has(m.matchId)) {
        map.set(m.matchId, m);
      }
    });
    
    let result = Array.from(map.values());
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (activeTab === 'all') return result;
    if (activeTab === 'public') return result.filter(m => m.isPublic);
    return result.filter(match => match.roles && match.roles.includes(activeTab));
  }, [matches, publicMatches, activeTab]);

  const bestPerformance = useMemo(() => {
    if (!matches.length) return null;
    let bestRunsMatch = null;
    let bestWicketsMatch = null;

    matches.forEach(m => {
      if (m.performance) {
        if (!bestRunsMatch || (m.performance.runs > (bestRunsMatch.performance?.runs || 0))) {
          bestRunsMatch = m;
        }
        if (!bestWicketsMatch || (m.performance.wickets > (bestWicketsMatch.performance?.wickets || 0))) {
          bestWicketsMatch = m;
        }
      }
    });

    return { bestRunsMatch, bestWicketsMatch };
  }, [matches]);

  const renderFilterTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab.id ? colors.textOnPrimary : colors.textSecondary }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMatchCard = ({ item }) => {
    const isBestRuns = bestPerformance?.bestRunsMatch?._id === item._id && (item.performance?.runs || 0) > 0;
    const isBestWickets = bestPerformance?.bestWicketsMatch?._id === item._id && (item.performance?.wickets || 0) > 0;

    const isOwner = item.createdByUserId?._id === currentUser?._id || item.createdByUserId === currentUser?._id;
    const isScorer = item.scorers?.some(s => (s._id || s) === currentUser?._id);
    const hasRequested = item.scorerRequests?.some(r => (r.userId?._id || r.userId) === currentUser?._id);

    return (
      <TouchableOpacity 
        style={styles.matchCard}
        onPress={() => navigation.navigate('LiveMatch', { matchId: item.matchId })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.matchTitle}>{item.matchId}</Text>
            <Text style={styles.matchOwner}>Owner: {item.createdByUserId?.name || 'Unknown'}</Text>
            <Text style={styles.matchStatus}>Status: {item.status?.toUpperCase()}</Text>
          </View>
          <View style={styles.rolesContainer}>
            {item.roles?.map(role => (
              <View key={role} style={[styles.roleBadge, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={[styles.roleText, { color: colors.primary }]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {item.performance && (
          <View style={styles.performanceRow}>
            <View style={styles.perfItem}>
              <Text style={styles.perfLabel}>Runs</Text>
              <View style={styles.perfValueContainer}>
                <Text style={styles.perfValue}>{item.performance.runs}</Text>
                {isBestRuns && <Text style={styles.highlightIcon}>🔥</Text>}
              </View>
            </View>
            <View style={styles.perfDivider} />
            <View style={styles.perfItem}>
              <Text style={styles.perfLabel}>Wickets</Text>
              <View style={styles.perfValueContainer}>
                <Text style={styles.perfValue}>{item.performance.wickets}</Text>
                {isBestWickets && <Text style={styles.highlightIcon}>🎯</Text>}
              </View>
            </View>
            <View style={styles.perfDivider} />
            <View style={styles.perfItem}>
              <Text style={styles.perfLabel}>S/R</Text>
              <Text style={styles.perfValue}>
                {item.performance.balls > 0 
                  ? ((item.performance.runs / item.performance.balls) * 100).toFixed(1) 
                  : '0.0'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.cardFooter}>
          {!isOwner && !isScorer && item.status !== 'completed' && (
            <TouchableOpacity 
              style={[styles.scorerRequestBtn, hasRequested && styles.scorerRequestBtnDisabled]}
              onPress={() => !hasRequested && handleRequestScorer(item.matchId)}
              disabled={hasRequested}
            >
              <Text style={styles.scorerRequestText}>
                {hasRequested ? 'Request Pending' : 'Request to Score'}
              </Text>
            </TouchableOpacity>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.viewDetailsText}>View Match</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <Text style={styles.emptyEmoji}>🏏</Text>
      </View>
      <Text style={styles.emptyTitle}>No matches yet</Text>
      <Text style={styles.emptySubtitle}>
        Matches you create or join will appear here. Public matches are also shown.
      </Text>
      <TouchableOpacity 
        style={[styles.ctaButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={[styles.ctaButtonText, { color: colors.textOnPrimary }]}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Header title="Match Explorer" />
      
      <View style={styles.container}>
        {renderFilterTabs()}

        {isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={60} color={colors.danger} />
            <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Oops!</Text>
            <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.ctaButton, { backgroundColor: colors.primary, marginTop: 24 }]}
              onPress={() => fetchAllMatches(true)}
            >
              <Text style={[styles.ctaButtonText, { color: colors.textOnPrimary }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={combinedMatches}
            renderItem={renderMatchCard}
            keyExtractor={item => item.matchId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
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
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 16,
      marginTop: 8,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    tabLabel: {
      fontSize: 14,
      fontWeight: '600',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    matchCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    matchTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    matchOwner: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    matchStatus: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.primary,
    },
    rolesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      maxWidth: '40%',
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginLeft: 4,
      marginBottom: 4,
    },
    roleText: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    performanceRow: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    perfItem: {
      flex: 1,
      alignItems: 'center',
    },
    perfLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginBottom: 4,
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    perfValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    perfValue: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    highlightIcon: {
      marginLeft: 4,
      fontSize: 14,
    },
    perfDivider: {
      width: 1,
      height: '60%',
      backgroundColor: colors.divider,
      opacity: 0.5,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    scorerRequestBtn: {
      backgroundColor: colors.primary + '15',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    scorerRequestBtnDisabled: {
      backgroundColor: colors.surfaceVariant,
    },
    scorerRequestText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
    },
    viewDetailsText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      marginRight: 4,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyIllustration: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyEmoji: {
      fontSize: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 40,
      marginBottom: 32,
      lineHeight: 20,
    },
    errorTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
    errorSubtitle: {
      fontSize: 14,
      textAlign: 'center',
      paddingHorizontal: 40,
      lineHeight: 20,
    },
    ctaButton: {
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 16,
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    ctaButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
}

export default HistoryScreen;

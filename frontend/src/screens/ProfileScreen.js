import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import { useTheme } from '~/hooks';
import { authService } from '~/services/authService';
import { userApi, matchApi, feedApi } from '~/services/api';
import {
  selectUser,
  selectIsLoggedIn,
  selectAuthLoading,
  selectAuthError,
  clearError,
  selectPlayerProfile
} from '~/store/authSlice';
import { ENV } from '~/constants';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: ENV.GOOGLE.WEB_CLIENT_ID,
  offlineAccess: true,
});

const { width } = Dimensions.get('window');

/**
 * ProfileScreen — Handles user profile display and Google Authentication
 * Features: Neon Glassy UI, Google OAuth, Profile Stats, Settings links
 */
const ProfileScreen = () => {
  const { colors, spacing, isDark } = useTheme();
  const user = useSelector(selectUser);
  const playerProfile = useSelector(selectPlayerProfile);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [matchHistory, setMatchHistory] = React.useState([]);
  const [feed, setFeed] = React.useState([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      loadProfileData();
    }
  }, [isLoggedIn]);

  const loadProfileData = async () => {
    setIsRefreshing(true);
    try {
      await authService.refreshProfile();
      const matchResponse = await userApi.getMatchHistory();
      if (matchResponse.success) {
        setMatchHistory(matchResponse.data);
      }
      const feedResponse = await feedApi.getFeed();
      if (feedResponse.success) {
        setFeed(feedResponse.data);
      }
    } catch (err) {
      console.error('[Profile] Error loading data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      const idToken = userInfo.data.idToken;
      if (idToken) {
        authService.handleGoogleLogin(idToken);
      } else {
        console.error('[GoogleAuth] No ID Token found');
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('[GoogleAuth] User cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('[GoogleAuth] Sign in in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error('[GoogleAuth] Play services not available');
      } else {
        console.error('[GoogleAuth] Error:', error);
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  // ─── Render Components ──────────────────────────────────────────────────────

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
        Profile
      </Text>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.surfaceVariant }]}
        onPress={() => {/* Open Settings */ }}
      >
        <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  const renderGuestState = () => (
    <View style={styles.centeredContent}>
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loginCardGlow}
      />
      <BlurView intensity={isDark ? 30 : 50} tint={isDark ? 'dark' : 'light'} style={styles.loginCard}>
        <View style={styles.loginIconContainer}>
          <Ionicons name="person-circle-outline" size={80} color={colors.primary} />
        </View>
        <Text style={[styles.loginTitle, { color: colors.textPrimary }]}>
          Cricket Identity
        </Text>
        <Text style={[styles.loginSubtitle, { color: colors.textSecondary }]}>
          Login to view your cricket profile, track matches, and earn achievements.
        </Text>

        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: colors.surface }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
                style={styles.googleIcon}
              />
              <Text style={[styles.googleButtonText, { color: colors.textPrimary }]}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </BlurView>
    </View>
  );

  const renderProfileState = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={loadProfileData} tintColor={colors.primary} />
      }
    >
      {/* Profile Card */}
      <View style={styles.profileCardContainer}>
        <LinearGradient
          colors={[colors.primary + '30', colors.accent + '30']}
          style={styles.profileCardBg}
        />
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user?.name }}
            style={[styles.avatar, { borderColor: colors.primary }]}
          />
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Ionicons name="shield-checkmark" size={12} color={colors.textOnPrimary} />
          </View>
        </View>

        <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'Cricketer'}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>

        <View style={styles.statsRow}>
          <StatItem label="Matches" value={playerProfile?.stats?.matchesPlayed || 0} color={colors.primary} />
          <StatItem label="Runs" value={playerProfile?.stats?.totalRuns || 0} color={colors.accent} />
          <StatItem label="Wickets" value={playerProfile?.stats?.totalWickets || 0} color={colors.danger} />
        </View>
        <View style={[styles.statsRow, { marginTop: 12 }]}>
          <StatItem label="Created" value={playerProfile?.stats?.matchesCreated || 0} color={colors.textPrimary} />
          <StatItem label="Scored" value={playerProfile?.stats?.matchesScored || 0} color={colors.textPrimary} />
        </View>
      </View>

        {/* Match History Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Matches</Text>
          <TouchableOpacity onPress={() => {/* Navigate to full history */}}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {matchHistory.length > 0 ? (
          matchHistory.slice(0, 3).map((match, index) => (
            <MatchHistoryItem key={match._id || index} match={match} colors={colors} user={user} playerProfile={playerProfile} />
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No matches played yet.</Text>
        )}

        {/* Achievements Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Achievements</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
          <AchievementBadge 
            icon="flash" 
            title="Run Machine" 
            subtitle="50+ Total Runs" 
            unlocked={(playerProfile?.stats?.totalRuns || 0) >= 50} 
            colors={colors} 
          />
          <AchievementBadge 
            icon="trophy" 
            title="Wicket King" 
            subtitle="5+ Total Wickets" 
            unlocked={(playerProfile?.stats?.totalWickets || 0) >= 5} 
            colors={colors} 
          />
          <AchievementBadge 
            icon="star" 
            title="Veteran" 
            subtitle="10+ Matches" 
            unlocked={(playerProfile?.stats?.matchesPlayed || 0) >= 10} 
            colors={colors} 
          />
          <AchievementBadge 
            icon="pencil" 
            title="Scorer" 
            subtitle="5+ Scored" 
            unlocked={(playerProfile?.stats?.matchesScored || 0) >= 5} 
            colors={colors} 
          />
        </ScrollView>

        <View style={{ height: 24 }} />

        {/* Activity Feed Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Activity Feed</Text>
        </View>
        <View style={styles.feedContainer}>
          {feed.length > 0 ? (
            feed.map((activity, index) => (
              <ActivityItem key={activity._id || index} activity={activity} colors={colors} />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recent activities.</Text>
          )}
        </View>

        <View style={{ height: 20 }} />

        {/* Menu Options */}
        <View style={styles.menuContainer}>
        <MenuOption
          icon="time-outline"
          title="Match History"
          subtitle="View your past performances"
          onPress={() => { }}
          colors={colors}
        />
        <MenuOption
          icon="trophy-outline"
          title="Achievements"
          subtitle="Milestones you've reached"
          onPress={() => { }}
          colors={colors}
        />
        <MenuOption
          icon="notifications-outline"
          title="Notifications"
          subtitle="Alerts and match updates"
          onPress={() => { }}
          colors={colors}
        />
        <MenuOption
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="FAQs and contact us"
          onPress={() => { }}
          colors={colors}
        />
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: colors.danger + '40' }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={[styles.versionText, { color: colors.textDisabled }]}>
        Version {ENV.APP_VERSION}
      </Text>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {renderHeader()}
      {isLoggedIn ? renderProfileState() : renderGuestState()}
    </View>
  );
};

const ActivityItem = ({ activity, colors }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'match_played': return 'trophy-outline';
      case 'fifty': return 'flash-outline';
      case 'wicket': return 'analytics-outline';
      case 'match_created': return 'add-circle-outline';
      default: return 'radio-button-on-outline';
    }
  };

  const getMessage = () => {
    const name = activity.userId?.name || 'Someone';
    switch (activity.type) {
      case 'match_played': return `${name} played a match`;
      case 'fifty': return `${name} scored a fifty!`;
      case 'wicket': return `${name} took ${activity.meta?.wickets || 3} wickets!`;
      case 'match_created': return `${name} created a new match`;
      default: return `${name} did something`;
    }
  };

  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIconBox, { backgroundColor: colors.surfaceVariant }]}>
        <Ionicons name={getIcon()} size={20} color={colors.primary} />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityMessage, { color: colors.textPrimary }]}>{getMessage()}</Text>
        <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
          {new Date(activity.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

const AchievementBadge = ({ icon, title, subtitle, unlocked, colors }) => (
  <View style={[styles.achievementBadge, { opacity: unlocked ? 1 : 0.4 }]}>
    <View style={[styles.achievementIconBox, { backgroundColor: unlocked ? colors.primary + '20' : colors.surfaceVariant }]}>
      <Ionicons name={icon} size={24} color={unlocked ? colors.primary : colors.textDisabled} />
    </View>
    <Text style={[styles.achievementTitle, { color: colors.textPrimary }]}>{title}</Text>
    <Text style={[styles.achievementSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    {!unlocked && <Ionicons name="lock-closed" size={12} color={colors.textDisabled} style={styles.lockIcon} />}
  </View>
);

const MatchHistoryItem = ({ match, colors, user, playerProfile }) => {
  const getRole = () => {
    if (match.createdByUserId === user?._id) return 'Creator';
    if (match.scorers.includes(user?._id)) return 'Scorer';
    return 'Player';
  };

  return (
    <TouchableOpacity style={[styles.matchItem, { backgroundColor: colors.surfaceVariant }]}>
      <View style={styles.matchInfo}>
        <Text style={[styles.matchName, { color: colors.textPrimary }]}>{match.matchId || 'Match'}</Text>
        <Text style={[styles.matchRole, { color: colors.primary }]}>{getRole()}</Text>
      </View>
      <View style={styles.matchScoreBox}>
        <Text style={[styles.matchScore, { color: colors.textPrimary }]}>
          {match.score?.runs || 0}/{match.score?.wickets || 0}
        </Text>
        <Text style={[styles.matchOvers, { color: colors.textSecondary }]}>
          ({match.score?.overs || 0}.{match.score?.balls || 0} ov)
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const StatItem = ({ label, value, color }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: color || colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
};

const MenuOption = ({ icon, title, subtitle, onPress, colors }) => (
  <TouchableOpacity style={[styles.menuOption, { borderBottomColor: colors.divider }]} onPress={onPress}>
    <View style={[styles.menuIconBox, { backgroundColor: colors.surfaceVariant }]}>
      <Ionicons name={icon} size={22} color={colors.primary} />
    </View>
    <View style={styles.menuTextBox}>
      <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loginCardGlow: {
    position: 'absolute',
    width: width * 0.8,
    height: 300,
    borderRadius: 40,
    opacity: 0.15,
    transform: [{ scale: 1.1 }],
  },
  loginCard: {
    width: '100%',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  loginIconContainer: {
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B5C',
    marginTop: 16,
    fontSize: 14,
  },
  profileCardContainer: {
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  profileCardBg: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextBox: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  matchRole: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  matchScoreBox: {
    alignItems: 'flex-end',
  },
  matchScore: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  matchOvers: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontStyle: 'italic',
  },
  achievementsScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  achievementBadge: {
    width: 110,
    alignItems: 'center',
    marginRight: 15,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  achievementIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementSubtitle: {
    fontSize: 10,
    textAlign: 'center',
  },
  lockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  feedContainer: {
    paddingHorizontal: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 12,
  },
  activityMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
  },
});

export default ProfileScreen;

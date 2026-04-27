import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '~/hooks/useTheme';
import Header from '~/components/Header';
import { fetchNotificationsThunk, markNotificationReadThunk } from '~/store/notificationSlice';
import { matchApi } from '~/services/api';

function NotificationScreen({ navigation }) {
  const { colors, spacing, borderRadius, isDark } = useTheme();
  const dispatch = useDispatch();
  const { notifications, isLoading } = useSelector((state) => state.notifications);
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(colors, spacing, borderRadius, isDark);

  useEffect(() => {
    dispatch(fetchNotificationsThunk());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchNotificationsThunk());
    setRefreshing(false);
  };

  const handleAction = async (notification, action) => {
    try {
      const matchId = notification.data?.matchId;
      if (!matchId) {
        Alert.alert('Error', 'Match ID not found in notification');
        return;
      }

      let response;
      if (notification.type === 'match_invitation') {
        response = await matchApi.respondInvitation(matchId, action === 'accept' ? 'accepted' : 'rejected');
      } else if (notification.type === 'scorer_request') {
        response = await matchApi.respondScorerRequest(matchId, {
          userId: notification.data.requesterId,
          status: action === 'accept' ? 'accepted' : 'rejected',
        });
      }

      if (response?.success) {
        Alert.alert('Success', `Invitation ${action}ed`);
        dispatch(markNotificationReadThunk(notification._id));
        dispatch(fetchNotificationsThunk());
      } else {
        Alert.alert('Error', response?.message || 'Action failed');
      }
    } catch (error) {
      console.error('Notification action error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const renderNotification = ({ item }) => {
    const isActionable = item.type === 'match_invitation' || item.type === 'scorer_request';
    
    return (
      <View style={[styles.card, !item.read && styles.unreadCard]}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={item.type === 'match_invitation' ? 'mail' : 'person-add'}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>

          {isActionable && !item.read && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => handleAction(item, 'accept')}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleAction(item, 'reject')}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Notifications" showBack onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        {isLoading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="notifications-off-outline" size={60} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            }
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
    list: {
      padding: spacing[4],
    },
    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[3],
      borderWidth: 1,
      borderColor: colors.divider,
    },
    unreadCard: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '05',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[3],
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    message: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    time: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    actions: {
      flexDirection: 'row',
      marginTop: spacing[3],
      gap: spacing[2],
    },
    actionBtn: {
      flex: 1,
      paddingVertical: spacing[2],
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    acceptBtn: {
      backgroundColor: colors.primary,
    },
    rejectBtn: {
      borderWidth: 1,
      borderColor: colors.divider,
    },
    acceptText: {
      color: colors.textOnPrimary,
      fontWeight: '700',
      fontSize: 13,
    },
    rejectText: {
      color: colors.textSecondary,
      fontWeight: '700',
      fontSize: 13,
    },
    empty: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 100,
    },
    emptyText: {
      marginTop: spacing[4],
      fontSize: 16,
      color: colors.textTertiary,
    },
  });
}

export default NotificationScreen;

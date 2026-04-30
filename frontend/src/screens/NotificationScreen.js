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
import { fetchNotificationsThunk, markNotificationReadThunk, handleNotificationActionThunk } from '~/store/notificationSlice';

function NotificationScreen({ navigation }) {
  const { colors, spacing, borderRadius, isDark } = useTheme();
  const dispatch = useDispatch();
  const { notifications, isLoading } = useSelector((state) => state.notifications);
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(colors, spacing, borderRadius, isDark);

  useEffect(() => {
    dispatch(fetchNotificationsThunk());
  }, [dispatch]);

  // Mark all as read when entering
  useEffect(() => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
    if (unreadIds.length > 0) {
      unreadIds.forEach(id => {
        dispatch(markNotificationReadThunk(id));
      });
    }
  }, [notifications.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchNotificationsThunk());
    setRefreshing(false);
  };

  const onAction = async (id, action) => {
    const resultAction = await dispatch(handleNotificationActionThunk({ id, action }));
    if (handleNotificationActionThunk.fulfilled.match(resultAction)) {
      Alert.alert('Success', `Invitation ${action}`);
    } else {
      Alert.alert('Error', resultAction.payload || 'Action failed');
    }
  };

  const renderNotification = ({ item }) => {
    const isActionable = (item.type === 'player_invite' || item.type === 'scorer_request') && item.status === 'pending';
    const isResponse = item.type === 'invite_response' || item.type === 'scorer_response';
    
    return (
      <View style={[styles.card, !item.read && styles.unreadCard]}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={item.type === 'player_invite' ? 'mail' : isResponse ? 'chatbubble-ellipses' : 'notifications'}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.message}>{item.message}</Text>
          
          {item.status !== 'none' && item.status !== 'pending' && (
             <Text style={[styles.statusText, { color: item.status === 'accepted' ? colors.success : colors.error }]}>
               Status: {item.status.toUpperCase()}
             </Text>
          )}

          <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>

          {isActionable && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => onAction(item._id, 'accepted')}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => onAction(item._id, 'rejected')}
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
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
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
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    message: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 4,
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

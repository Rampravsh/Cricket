import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '~/hooks/useTheme';
import { SCREENS } from '~/constants';

/**
 * NotificationIcon — Reusable bell icon with unread badge
 */
const NotificationIcon = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const unreadCount = useSelector(state => state.notifications.unreadCount);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate(SCREENS.NOTIFICATIONS)}
      activeOpacity={0.7}
    >
      <Feather name="bell" size={22} color={colors.primary} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.danger }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: 'transparent', // Will be filled by background
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
});

export default NotificationIcon;

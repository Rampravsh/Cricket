import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { userApi } from '~/services/api';
import logger from '~/utils/logger';
import { navigate } from '~/navigation/navigationRef';
import { SCREENS } from '~/constants';

// Configure how notifications are displayed when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and send token to backend
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      logger.warn('Failed to get push token for push notification!');
      return null;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      logger.info('Expo Push Token:', token);

      // Send to backend
      await userApi.registerFCMToken(token);
    } catch (error) {
      logger.error('Error getting push token:', error);
    }
  } else {
    logger.warn('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Handle notification click (Deep Linking)
 */
export function setupNotificationListeners() {
  // This listener is fired whenever a notification is received while the app is foregrounded
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    logger.info('Notification Received:', notification);
  });

  // This listener is fired whenever a user taps on or interacts with a notification 
  // (works when app is foregrounded, backgrounded, or killed)
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    logger.info('Notification Response:', response);
    // Navigate to Notifications screen
    navigate(SCREENS.NOTIFICATIONS);
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

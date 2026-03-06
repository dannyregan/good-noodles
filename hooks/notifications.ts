import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
        shouldShowBanner: true,
        shouldSetBadge: false,
        shouldPlaySound: true,
        shouldShowList: true,   
    }),
});

export async function setupNotifications() {
  // Ask permission
  const { status } = await Notifications.requestPermissionsAsync();
  console.log('Notification Status: ', status)
  if (status !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  // Android: notification channel (required)
  await Notifications.setNotificationChannelAsync('daily', {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  return true;
}

export async function scheduleDailyNotification() {
    console.log('notification schedule...')
  await Notifications.cancelAllScheduledNotificationsAsync(); // avoid duplicates

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Good Noodles",
      body: "Were you a GN today? ⭐",
    },
    // trigger: null,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: 20,
      minute: 0,
      repeats: true,
    },
  });
}
import Constants from 'expo-constants';
import * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Show alerts when the app is foregrounded
ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(
  memberId: string,
  currentToken: string | null
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await ExpoNotifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const projectId =
    (Constants.expoConfig?.extra as any)?.eas?.projectId ??
    (Constants as any).easConfig?.projectId;

  if (!projectId) return null;

  try {
    const { data: token } = await ExpoNotifications.getExpoPushTokenAsync({ projectId });

    if (token && token !== currentToken) {
      await supabase
        .from('members')
        .update({ push_token: token })
        .eq('id', memberId);
    }

    return token;
  } catch {
    return null;
  }
}

export async function sendLocalNotification(
  title: string,
  body: string
): Promise<void> {
  await ExpoNotifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}

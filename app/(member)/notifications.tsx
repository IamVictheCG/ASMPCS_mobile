import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenError } from '../../src/components/ScreenError';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { markNotificationRead } from '../../src/api';
import { useNotifications } from '../../src/hooks/useNotifications';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import type { Notification } from '../../src/types';
import { Colors, Fonts, FontSize, Radii } from '../../src/theme/tokens';

const ICON_BG: Record<string, string> = {
  green: 'rgba(26,122,74,0.20)',
  gold:  'rgba(232,160,32,0.20)',
  blue:  'rgba(21,101,168,0.25)',
  red:   'rgba(192,57,43,0.20)',
};

const ICON_TEXT: Record<string, string> = {
  green: Colors.green2,
  gold:  Colors.gold2,
  blue:  Colors.mint,
  red:   Colors.red2,
};

function NotificationsSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      {[...Array(6)].map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radii.md, padding: 16, marginBottom: 10 }}>
          <Skeleton width={44} height={44} borderRadius={22} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="70%" height={14} />
            <Skeleton width="95%" height={12} />
            <Skeleton width="40%" height={11} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export default function MemberNotifications() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => n.unread).length;

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  function handleTap(index: number, notif: Notification) {
    if (!notif.unread) return;
    queryClient.setQueryData<Notification[]>(['member', 'notifications'], (old = []) =>
      old.map((n, i) => (i === index ? { ...n, unread: false } : n))
    );
    markNotificationRead(index);
  }

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar
        title="Notifications"
        onNotifPress={() => router.push('/(member)/notifications' as any)}
      />
      {isLoading ? (
        <NotificationsSkeleton />
      ) : isError ? (
        <ScreenError onRetry={refetch} />
      ) : notifications.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <Text style={{ fontSize: 48 }}>🔔</Text>
          <Text style={{ fontFamily: Fonts.playfair, fontSize: 22, color: Colors.white }}>All caught up</Text>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted }}>No notifications at the moment</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.mint} />}
        >
          {unreadCount > 0 && (
            <Text style={{ fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.muted, marginBottom: 12 }}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Text>
          )}
          {notifications.map((notif, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleTap(i, notif)}
              activeOpacity={notif.unread ? 0.7 : 1}
            >
              <View
                style={{
                  flexDirection: 'row',
                  gap: 14,
                  backgroundColor: notif.unread ? 'rgba(0,198,216,0.06)' : 'rgba(255,255,255,0.05)',
                  borderWidth: 1,
                  borderColor: notif.unread ? 'rgba(0,198,216,0.18)' : 'rgba(255,255,255,0.08)',
                  borderLeftWidth: notif.unread ? 3 : 1,
                  borderLeftColor: notif.unread ? Colors.mint : 'rgba(255,255,255,0.08)',
                  borderRadius: Radii.md,
                  padding: 16,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: ICON_BG[notif.iconColor] ?? 'rgba(255,255,255,0.12)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{notif.icon}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 14, color: Colors.white, flex: 1 }} numberOfLines={1}>{notif.title}</Text>
                    {notif.unread && (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.mint }} />
                    )}
                  </View>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted, lineHeight: 18, marginBottom: 6 }}>
                    {notif.body}
                  </Text>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.xs, color: ICON_TEXT[notif.iconColor] ?? Colors.muted }}>
                    {notif.time}
                  </Text>
                  {notif.unread && (
                    <Text style={{ fontFamily: Fonts.sans, fontSize: 10, color: Colors.muted, marginTop: 3, opacity: 0.6 }}>
                      Tap to mark as read
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

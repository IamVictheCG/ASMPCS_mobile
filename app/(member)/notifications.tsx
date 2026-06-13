import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenError } from '../../src/components/ScreenError';
import { Skeleton } from '../../src/components/ui/Skeleton';
import type { DbNotification } from '../../src/hooks/useNotifications';
import { useNotifications } from '../../src/hooks/useNotifications';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Radii } from '../../src/theme/tokens';

// ─── Type → icon/colour mapping ───────────────────────────────

type IconColor = 'green' | 'gold' | 'blue' | 'red';

interface TypeMeta {
  emoji: string;
  color: IconColor;
}

const TYPE_META: Record<string, TypeMeta> = {
  loan_approved:         { emoji: '✅', color: 'green' },
  loan_rejected:         { emoji: '❌', color: 'red'   },
  contribution_recorded: { emoji: '💰', color: 'green' },
  new_commodity:         { emoji: '🛒', color: 'blue'  },
  loan_overdue:          { emoji: '⚠️', color: 'red'   },
  general:               { emoji: '📢', color: 'blue'  },
  order_placed:          { emoji: '📦', color: 'gold'  },
};

const ICON_BG: Record<IconColor, string> = {
  green: 'rgba(26,122,74,0.20)',
  gold:  'rgba(232,160,32,0.20)',
  blue:  'rgba(21,101,168,0.25)',
  red:   'rgba(192,57,43,0.20)',
};

const ICON_TEXT: Record<IconColor, string> = {
  green: Colors.green2,
  gold:  Colors.gold2,
  blue:  Colors.mint,
  red:   Colors.red2,
};

// ─── Helpers ──────────────────────────────────────────────────

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' });
}

// ─── Skeleton ─────────────────────────────────────────────────

function NotificationsSkeleton() {
  return (
    <View style={{ padding: 16, gap: 10 }}>
      {[...Array(6)].map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            gap: 14,
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: Radii.md,
            padding: 16,
          }}
        >
          <Skeleton width={44} height={44} borderRadius={22} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="70%" height={14} />
            <Skeleton width="95%" height={12} />
            <Skeleton width="40%" height={11} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Notification row ─────────────────────────────────────────

interface NotifRowProps {
  notif: DbNotification;
  onTap: () => void;
}

function NotifRow({ notif, onTap }: NotifRowProps) {
  const meta = TYPE_META[notif.type] ?? { emoji: '📋', color: 'blue' as IconColor };
  const unread = !notif.isRead;

  return (
    <TouchableOpacity onPress={onTap} activeOpacity={unread ? 0.7 : 1}>
      <View
        style={{
          flexDirection: 'row',
          gap: 14,
          backgroundColor: unread ? 'rgba(0,198,216,0.06)' : 'rgba(255,255,255,0.04)',
          borderWidth: 1,
          borderColor: unread ? 'rgba(0,198,216,0.18)' : 'rgba(255,255,255,0.07)',
          borderLeftWidth: unread ? 3 : 1,
          borderLeftColor: unread ? Colors.mint : 'rgba(255,255,255,0.07)',
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
            backgroundColor: ICON_BG[meta.color],
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 18 }}>{meta.emoji}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.sansSemibold,
                fontSize: 14,
                color: Colors.white,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {notif.title}
            </Text>
            {unread && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: Colors.mint,
                }}
              />
            )}
          </View>

          <Text
            style={{
              fontFamily: Fonts.sans,
              fontSize: 13,
              color: Colors.muted,
              lineHeight: 18,
              marginBottom: 6,
            }}
          >
            {notif.message}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: Fonts.mono,
                fontSize: FontSize.xs,
                color: ICON_TEXT[meta.color],
              }}
            >
              {fmtRelative(notif.createdAt)}
            </Text>
            {unread && (
              <Text
                style={{
                  fontFamily: Fonts.sans,
                  fontSize: 10,
                  color: Colors.muted,
                  opacity: 0.6,
                }}
              >
                Tap to mark as read
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────

export default function MemberNotifications() {
  const { data, isLoading, isError, refetch, markAsRead, markAllAsRead } =
    useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const insets = useSafeAreaInsets();

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  async function handleMarkAll() {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllAsRead();
    } finally {
      setMarkingAll(false);
    }
  }

  const ListHeader = (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.sansMedium,
          fontSize: FontSize.base,
          color: Colors.muted,
        }}
      >
        {unreadCount > 0
          ? `${unreadCount} unread`
          : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
      </Text>
      {unreadCount > 0 && (
        <TouchableOpacity
          onPress={handleMarkAll}
          disabled={markingAll}
          activeOpacity={0.7}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: Radii.full,
            backgroundColor: 'rgba(0,198,216,0.12)',
            borderWidth: 1,
            borderColor: 'rgba(0,198,216,0.25)',
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.sansSemibold,
              fontSize: FontSize.xs,
              color: Colors.mint,
            }}
          >
            {markingAll ? 'Marking…' : 'Mark all as read'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

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
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotifRow
              notif={item}
              onTap={() => {
                if (!item.isRead) markAsRead(item.id);
              }}
            />
          )}
          ListHeaderComponent={notifications.length > 0 ? ListHeader : null}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                padding: 32,
                paddingTop: 80,
              }}
            >
              <Text style={{ fontSize: 52 }}>✅</Text>
              <Text
                style={{ fontFamily: Fonts.playfair, fontSize: 22, color: Colors.white }}
              >
                You are all caught up
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.sans,
                  fontSize: FontSize.base,
                  color: Colors.muted,
                  textAlign: 'center',
                }}
              >
                No notifications at the moment. New activity will appear here instantly.
              </Text>
            </View>
          }
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 32 + insets.bottom,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.mint}
            />
          }
        />
      )}
    </View>
  );
}

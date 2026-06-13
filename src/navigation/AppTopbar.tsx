import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useDrawer } from '../context/DrawerContext';
import { useNotificationCount } from '../hooks/useNotificationCount';
import { Colors, Fonts, Surfaces } from '../theme/tokens';

interface AppTopbarProps {
  title: string;
  subtitle?: string;
  date?: string;
  portal?: 'member' | 'admin';
  roleBadge?: string;
  onNotifPress?: () => void;
  notifDot?: boolean;
}

function HamburgerIcon({ color }: { color: string }) {
  const lineStyle = {
    width: 22,
    height: 2.5,
    backgroundColor: color,
    borderRadius: 2,
  };
  return (
    <View style={{ gap: 5 }}>
      <View style={lineStyle} />
      <View style={lineStyle} />
      <View style={lineStyle} />
    </View>
  );
}

export function AppTopbar({ title, portal = 'member', onNotifPress }: AppTopbarProps) {
  const { member, displayName } = useAuth();
  const initials = (member?.full_name ?? displayName ?? '?')
    .split(' ').map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase() || '??';
  const { openDrawer } = useDrawer();
  const { hasUnread: hasUnreadNotifs } = useNotificationCount();
  const insets = useSafeAreaInsets();

  const hasUnread = portal === 'member' && hasUnreadNotifs;
  const bg = portal === 'admin' ? Surfaces.adminTopbarBg : Surfaces.topbarBg;
  const dotColor = portal === 'admin' ? Colors.red2 : Colors.gold;
  const avatarBg = portal === 'admin' ? Colors.crimson : Colors.teal;

  return (
    <View
      style={{
        height: 56 + insets.top,
        paddingTop: insets.top,
        backgroundColor: bg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
      }}
    >
      {/* Hamburger — left */}
      <TouchableOpacity
        onPress={openDrawer}
        style={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        activeOpacity={0.7}
      >
        <HamburgerIcon color={Colors.white} />
      </TouchableOpacity>

      {/* Title — centered absolutely */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.playfair,
            fontSize: 18,
            color: Colors.white,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* Right side */}
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {/* Notification bell */}
        <TouchableOpacity
          onPress={onNotifPress}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20 }}>🔔</Text>
          {hasUnread && (
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: dotColor,
                borderWidth: 2,
                borderColor: Colors.dark,
              }}
            />
          )}
        </TouchableOpacity>

        {/* Avatar */}
        {initials && (
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              backgroundColor: avatarBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 4,
            }}
          >
            <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 12, color: Colors.white }}>
              {initials}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

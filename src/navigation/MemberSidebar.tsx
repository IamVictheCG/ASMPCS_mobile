import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useDrawer } from '../context/DrawerContext';
import { Colors, Fonts, FontSize, Radii } from '../theme/tokens';
import { DRAWER_WIDTH, SCREEN_HEIGHT } from '../utils/responsive';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: string | number;
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Main',
    items: [
      { icon: '📊', label: 'Dashboard',     route: '/(member)/' },
      { icon: '💰', label: 'My Savings',    route: '/(member)/savings' },
      { icon: '🏦', label: 'Loans',         route: '/(member)/loans',  badge: 1 },
      { icon: '🛒', label: 'Commodities',   route: '/(member)/commodities' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: '🔔', label: 'Notifications', route: '/(member)/notifications', badge: 3 },
      { icon: '👤', label: 'My Profile',    route: '/(member)/profile' },
      { icon: '📄', label: 'Statements',    route: '/(member)/statements' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: '💬', label: 'Support Chat',  route: '/(member)/support' },
    ],
  },
];

export function MemberSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isOpen, closeDrawer } = useDrawer();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  function navigate(route: string) {
    closeDrawer();
    router.push(route as any);
  }

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          zIndex: 998,
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={closeDrawer} activeOpacity={1} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          backgroundColor: Colors.dark,
          borderRightWidth: 1,
          borderRightColor: 'rgba(255,255,255,0.06)',
          zIndex: 999,
          elevation: 999,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* Brand header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 48,
            paddingBottom: 18,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.07)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 11,
          }}
        >
          <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18 }}>✈</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize.md, color: Colors.white, lineHeight: 20 }}>ASMPCS</Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: 10, color: Colors.muted, marginTop: 1 }}>Member Portal</Text>
          </View>
          {/* Close button */}
          <TouchableOpacity
            onPress={closeDrawer}
            style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ fontSize: 20, color: Colors.muted, lineHeight: 22 }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Nav items */}
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {SECTIONS.map((section) => (
            <View key={section.title}>
              <Text
                style={{
                  fontFamily: Fonts.sansSemibold,
                  fontSize: 10,
                  color: 'rgba(127,168,201,0.50)',
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  paddingHorizontal: 8,
                  paddingTop: 12,
                  paddingBottom: 6,
                  marginTop: 8,
                }}
              >
                {section.title}
              </Text>
              {section.items.map((item) => {
                const isActive =
                  pathname === item.route ||
                  pathname.startsWith(item.route.replace(/\/$/, '') + '/');
                return (
                  <TouchableOpacity
                    key={item.route}
                    onPress={() => navigate(item.route)}
                    style={[
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 11,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        borderRadius: Radii.sm,
                        marginBottom: 2,
                        minHeight: 44,
                        borderLeftWidth: 3,
                        paddingLeft: 9,
                      },
                      isActive
                        ? { backgroundColor: 'rgba(21,101,168,0.30)', borderLeftColor: Colors.mint }
                        : { borderLeftColor: 'transparent' },
                    ]}
                    activeOpacity={0.75}
                  >
                    <Text style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</Text>
                    <Text
                      style={{
                        fontFamily: Fonts.sansMedium,
                        fontSize: FontSize.md,
                        color: isActive ? Colors.white : Colors.muted,
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </Text>
                    {item.badge != null && (
                      <View style={{ backgroundColor: Colors.gold, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 }}>
                        <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 10, color: Colors.dark }}>
                          {item.badge}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {/* User footer */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            paddingBottom: 32,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.07)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.sm, color: Colors.white }}>{user?.initials ?? '??'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 12.5, color: Colors.white }}>{user?.name ?? ''}</Text>
            <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.xs, color: Colors.muted }}>{user?.id ?? ''}</Text>
          </View>
          <TouchableOpacity onPress={logout} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontSize: 16, color: Colors.muted }}>⏻</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

import { ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, Slot } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { registerForPushNotifications } from '../../src/lib/notifications';
import { MemberSidebar } from '../../src/navigation/MemberSidebar';
import { Colors, Gradients } from '../../src/theme/tokens';

export default function MemberLayout() {
  const { isLoading, isAuthenticated, role, member } = useAuth();

  useEffect(() => {
    if (member?.id) {
      registerForPushNotifications(member.id, member.push_token ?? null);
    }
  }, [member?.id]);

  if (isLoading) {
    return (
      <LinearGradient
        colors={Gradients.mainBg as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <ActivityIndicator size="large" color={Colors.mint} />
      </LinearGradient>
    );
  }

  if (!isAuthenticated) return <Redirect href="/member-login" />;
  if (role === 'admin') return <Redirect href={'/(admin)/' as any} />;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={Gradients.mainBg as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={{ flex: 1 }}
      >
        <Slot />
      </LinearGradient>
      <MemberSidebar />
    </View>
  );
}

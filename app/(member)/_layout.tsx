import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, Slot } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { MemberSidebar } from '../../src/navigation/MemberSidebar';
import { Gradients } from '../../src/theme/tokens';

export default function MemberLayout() {
  const { isLoading, isAuthenticated, role } = useAuth();

  if (isLoading) return null;
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

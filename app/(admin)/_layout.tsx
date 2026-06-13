import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, Slot } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { AdminSidebar } from '../../src/navigation/AdminSidebar';
import { Gradients } from '../../src/theme/tokens';

export default function AdminLayout() {
  const { isLoading, isAuthenticated, role } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/admin-login" />;
  if (role === 'member') return <Redirect href={'/(member)/' as any} />;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={Gradients.adminMainBg as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={{ flex: 1 }}
      >
        <Slot />
      </LinearGradient>
      <AdminSidebar />
    </View>
  );
}

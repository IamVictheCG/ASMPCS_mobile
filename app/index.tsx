import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, FontSize, Gradients, Radii } from '../src/theme/tokens';

export default function PortalIndex() {
  return (
    <LinearGradient
      colors={['#061626', '#0A2342', '#0D3560']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}
    >
      <Text style={{ fontFamily: Fonts.playfair, fontSize: 32, color: Colors.white, textAlign: 'center', marginBottom: 8 }}>
        ASMPCS Digital Platform
      </Text>
      <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.md, color: Colors.muted, textAlign: 'center', marginBottom: 48 }}>
        Select your portal to continue
      </Text>

      <View style={{ gap: 16, width: '100%', maxWidth: 360 }}>
        <TouchableOpacity
          onPress={() => router.push('/member-login')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={Gradients.memberBtn as [string, string]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ borderRadius: Radii.md, padding: 24, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 32, marginBottom: 10 }}>✈</Text>
            <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['2xl'], color: Colors.white, marginBottom: 6 }}>
              Member Portal
            </Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: 'rgba(255,255,255,0.75)' }}>
              Access your savings, loans & more
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/admin-login')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={Gradients.adminPrimary as [string, string]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ borderRadius: Radii.md, padding: 24, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 32, marginBottom: 10 }}>🛡</Text>
            <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['2xl'], color: Colors.white, marginBottom: 6 }}>
              Admin Portal
            </Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: 'rgba(255,255,255,0.75)' }}>
              ASMPCS operations management
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

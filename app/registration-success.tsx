import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../src/components/ui/Button';
import { Colors, Fonts, FontSize, Gradients, Radii, Shadows, Surfaces } from '../src/theme/tokens';

export default function RegistrationSuccess() {
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <LinearGradient
      colors={Gradients.loginBg as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={{ position: 'absolute', width: 600, height: 600, borderRadius: 999, backgroundColor: 'rgba(0,198,216,0.07)', top: -200, right: -150 }} />
      <View style={{ position: 'absolute', width: 400, height: 400, borderRadius: 999, backgroundColor: 'rgba(21,101,168,0.08)', bottom: -100, left: -100 }} />

      <ScrollView
        contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: '100%' }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            {
              backgroundColor:   Surfaces.loginCard,
              borderWidth:       1,
              borderColor:       'rgba(255,255,255,0.12)',
              borderRadius:      Radii.xl,
              padding:           44,
              paddingHorizontal: 44,
              width:             420,
              maxWidth:          '100%',
              alignItems:        'center',
            },
            Shadows.loginCard,
          ]}
        >
          {/* Checkmark */}
          <View
            style={{
              width:           72,
              height:          72,
              borderRadius:    36,
              backgroundColor: 'rgba(0,198,216,0.15)',
              borderWidth:     2,
              borderColor:     Colors.mint,
              alignItems:      'center',
              justifyContent:  'center',
              marginBottom:    24,
            }}
          >
            <Text style={{ fontSize: 32, color: Colors.mint }}>✓</Text>
          </View>

          <Text
            style={{
              fontFamily:   Fonts.playfair,
              fontSize:     FontSize['4xl'],
              color:        Colors.white,
              textAlign:    'center',
              marginBottom: 20,
            }}
          >
            Account{'\n'}<Text style={{ color: Colors.mint }}>Created</Text>
          </Text>

          <Text
            style={{
              fontFamily: Fonts.sans,
              fontSize:   FontSize.base,
              color:      Colors.muted,
              textAlign:  'center',
              lineHeight: 22,
              marginBottom: 8,
            }}
          >
            Your account has been created successfully.
          </Text>

          <Text
            style={{
              fontFamily: Fonts.sans,
              fontSize:   FontSize.base,
              color:      Colors.muted,
              textAlign:  'center',
              lineHeight: 22,
              marginBottom: 8,
            }}
          >
            {'A verification email has been sent to '}
            <Text style={{ color: Colors.mint, fontFamily: Fonts.sansMedium }}>
              {email ?? 'your email address'}
            </Text>
            {'. Please verify your email address.'}
          </Text>

          <Text
            style={{
              fontFamily: Fonts.sans,
              fontSize:   FontSize.base,
              color:      Colors.muted,
              textAlign:  'center',
              lineHeight: 22,
              marginBottom: 32,
            }}
          >
            Your account is currently{' '}
            <Text style={{ color: Colors.gold, fontFamily: Fonts.sansMedium }}>pending activation</Text>
            {' by the cooperative administrator. You will receive a notification once your account is active and you can sign in.'}
          </Text>

          <Button
            variant="primary"
            label="Back to Sign In"
            fullWidth
            onPress={() => router.replace('/member-login' as any)}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

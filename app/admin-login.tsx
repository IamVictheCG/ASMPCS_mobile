import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { FormInput } from '../src/components/FormInput';
import { Button } from '../src/components/ui/Button';
import { useAuth } from '../src/context/AuthContext';
import { Colors, Fonts, FontSize, Gradients, Radii, Shadows, Surfaces } from '../src/theme/tokens';

export default function AdminLogin() {
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (isSubmitting) return;
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await loginAdmin(email.trim(), password);
      router.replace('/(admin)/' as any);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LinearGradient
      colors={Gradients.adminLoginBg as [string, string, string]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <LinearGradient
        colors={[Colors.teal, Colors.mint, Colors.gold, Colors.red2]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4 }}
      />

      <View style={{ position: 'absolute', width: 700, height: 700, borderRadius: 999, backgroundColor: 'rgba(0,198,216,0.05)', top: -300, right: -200 }} />
      <View style={{ position: 'absolute', width: 500, height: 500, borderRadius: 999, backgroundColor: 'rgba(21,101,168,0.07)', bottom: -200, left: -150 }} />

      <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: '100%' }}>
        <View style={[{ backgroundColor: Surfaces.adminLoginCard, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', borderRadius: Radii.xl, padding: 44, paddingHorizontal: 44, width: 440, maxWidth: '100%' }, Shadows.loginCard]}>

          {/* Logo */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <LinearGradient
              colors={[Colors.crimson, Colors.red]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 20 }}>🛡</Text>
            </LinearGradient>
            <View>
              <Text style={{ fontFamily: Fonts.playfair, fontSize: 18, color: Colors.white, lineHeight: 22 }}>ASMPCS</Text>
              <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginTop: 2 }}>Admin Control Panel</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, alignSelf: 'flex-start' }}>
            <View style={{ backgroundColor: 'rgba(192,57,43,0.18)', borderWidth: 1, borderColor: 'rgba(192,57,43,0.35)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 11, color: '#E88080', letterSpacing: 0.7, textTransform: 'uppercase' }}>🔒 Admin Access Only</Text>
            </View>
          </View>

          <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['4xl'], color: Colors.white, lineHeight: 36, marginBottom: 6 }}>
            Secure{'\n'}<Text style={{ color: Colors.mint }}>Admin Sign-In</Text>
          </Text>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted, marginBottom: 28 }}>
            Authorised personnel only. All actions are logged and audited.
          </Text>

          <FormInput
            label="Admin Email"
            placeholder="e.g. admin@asmpcs.gov.ng"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!isSubmitting}
          />
          <FormInput
            label="Password"
            placeholder="Enter admin password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
            onSubmitEditing={handleSubmit}
            returnKeyType="go"
          />

          {error && (
            <View style={{ backgroundColor: 'rgba(192,57,43,0.18)', borderWidth: 1, borderColor: 'rgba(192,57,43,0.35)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 }}>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: '#E88080' }}>{error}</Text>
            </View>
          )}

          <Button
            variant="admin-primary"
            label={isSubmitting ? 'Signing in…' : 'Access Admin Portal →'}
            fullWidth
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

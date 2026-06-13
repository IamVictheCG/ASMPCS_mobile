import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { FormInput } from '../src/components/FormInput';
import { Button } from '../src/components/ui/Button';
import { useAuth } from '../src/context/AuthContext';
import { authenticateWithBiometric, checkBiometricAvailability } from '../src/lib/biometric';
import { supabase } from '../src/lib/supabase';
import { Colors, Fonts, FontSize, Gradients, Radii, Shadows, Surfaces } from '../src/theme/tokens';

async function navigateAfterLogin() {
  const setupDone = await SecureStore.getItemAsync('setup_complete');
  if (!setupDone) {
    router.replace('/member-setup' as any);
  } else {
    router.replace('/(member)/' as any);
  }
}

export default function MemberLogin() {
  const { login } = useAuth();
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricPrompting, setBiometricPrompting] = useState(false);
  const biometricChecked = useRef(false);

  useEffect(() => {
    if (biometricChecked.current || Platform.OS === 'web') return;
    biometricChecked.current = true;

    (async () => {
      const [availability, biometricEnabled, { data: { session } }] = await Promise.all([
        checkBiometricAvailability(),
        SecureStore.getItemAsync('biometric_enabled'),
        supabase.auth.getSession(),
      ]);

      // Only prompt if device supports it, user has opted in, and a session already exists to unlock
      if (!availability.isAvailable || !availability.isEnrolled || biometricEnabled !== 'true' || !session) {
        return;
      }

      const typeLabel = availability.biometricType === 'facial' ? 'Face ID' : 'Fingerprint';
      setBiometricPrompting(true);
      const success = await authenticateWithBiometric(`Use ${typeLabel} to sign in`);
      setBiometricPrompting(false);

      if (success) {
        await navigateAfterLogin();
      }
    })();
  }, []);

  async function handleSubmit() {
    if (isSubmitting) return;
    if (!staffId.trim() || !password) {
      setError('Please enter your Staff ID and password.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await login(staffId.trim(), password);
      await navigateAfterLogin();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (biometricPrompting) {
    return (
      <LinearGradient
        colors={Gradients.loginBg as [string, string, string]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}
      >
        <ActivityIndicator size="large" color={Colors.mint} />
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted }}>
          Waiting for biometric…
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={Gradients.loginBg as [string, string, string]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={{ position: 'absolute', width: 600, height: 600, borderRadius: 999, backgroundColor: 'rgba(0,198,216,0.07)', top: -200, right: -150 }} />
      <View style={{ position: 'absolute', width: 400, height: 400, borderRadius: 999, backgroundColor: 'rgba(21,101,168,0.08)', bottom: -100, left: -100 }} />

      <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: '100%' }}>
        <View style={[{ backgroundColor: Surfaces.loginCard, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: Radii.xl, padding: 44, paddingHorizontal: 44, width: 420, maxWidth: '100%' }, Shadows.loginCard]}>

          {/* Logo */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <LinearGradient
              colors={Gradients.memberPrimary as [string, string]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 22 }}>✈</Text>
            </LinearGradient>
            <View>
              <Text style={{ fontFamily: Fonts.playfair, fontSize: 18, color: Colors.white, lineHeight: 22 }}>ASMPCS</Text>
              <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginTop: 2 }}>Digital Member Platform</Text>
            </View>
          </View>

          <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['4xl'], color: Colors.white, lineHeight: 36, marginBottom: 6 }}>
            Welcome{'\n'}<Text style={{ color: Colors.mint }}>Back, Member</Text>
          </Text>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted, marginBottom: 32 }}>
            Sign in to access your cooperative account
          </Text>

          <FormInput
            label="Staff ID / Member Number"
            placeholder="e.g. FAAN-2021-0472"
            autoCapitalize="none"
            value={staffId}
            onChangeText={setStaffId}
            editable={!isSubmitting}
          />
          <FormInput
            label="Password"
            placeholder="Enter your password"
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
            variant="primary"
            label={isSubmitting ? 'Signing in…' : 'Sign In to My Account →'}
            fullWidth
            onPress={handleSubmit}
            disabled={isSubmitting}
          />

          <TouchableOpacity
            onPress={() => router.push('/forgot-password' as any)}
            activeOpacity={0.7}
            style={{ alignItems: 'center', marginTop: 20 }}
          >
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>
              Forgot your password?{' '}
              <Text style={{ color: Colors.mint }}>Reset it here</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

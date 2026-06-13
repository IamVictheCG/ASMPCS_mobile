import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { FormInput } from '../src/components/FormInput';
import { Button } from '../src/components/ui/Button';
import { useAuth } from '../src/context/AuthContext';
import { Colors, Fonts, FontSize, Gradients, Radii, Shadows, Surfaces } from '../src/theme/tokens';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) return;
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LinearGradient
      colors={Gradients.loginBg as [string, string, string]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={{ position: 'absolute', width: 600, height: 600, borderRadius: 999, backgroundColor: 'rgba(0,198,216,0.07)', top: -200, right: -150 }} />

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

          {sent ? (
            <View style={{ alignItems: 'center', gap: 16 }}>
              <Text style={{ fontSize: 48 }}>📧</Text>
              <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['3xl'], color: Colors.white, textAlign: 'center' }}>
                Check Your Email
              </Text>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted, textAlign: 'center', lineHeight: 22 }}>
                {'We\'ve sent a password reset link to '}
                <Text style={{ color: Colors.mint }}>{email}</Text>
                {'.\n\nClick the link in the email to set a new password. It expires in 1 hour.'}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace('/member-login')}
                activeOpacity={0.7}
                style={{ marginTop: 8 }}
              >
                <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.mint }}>
                  ← Back to Sign In
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['4xl'], color: Colors.white, lineHeight: 36, marginBottom: 6 }}>
                Reset{'\n'}<Text style={{ color: Colors.mint }}>Your Password</Text>
              </Text>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted, marginBottom: 32, lineHeight: 22 }}>
                Enter the email address registered to your account. We'll send you a reset link.
              </Text>

              <FormInput
                label="Registered Email Address"
                placeholder="e.g. emeka.nwosu@faan.gov.ng"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
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
                label={isSubmitting ? 'Sending…' : 'Send Reset Link →'}
                fullWidth
                onPress={handleSubmit}
                disabled={isSubmitting}
              />

              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                style={{ alignItems: 'center', marginTop: 20 }}
              >
                <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>
                  ← Back to Sign In
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

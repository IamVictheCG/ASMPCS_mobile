import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { checkBiometricAvailability } from '../src/lib/biometric';
import { supabase } from '../src/lib/supabase';
import { Colors, Fonts, FontSize, Gradients, Radii, Shadows, Surfaces } from '../src/theme/tokens';

type NotifChoice = 'app' | 'app_email';

function RadioOption({
  selected,
  onPress,
  title,
  subtitle,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        borderWidth: 2,
        borderColor: selected ? Colors.mint : 'rgba(255,255,255,0.12)',
        borderRadius: Radii.md,
        padding: 18,
        marginBottom: 12,
        backgroundColor: selected ? 'rgba(0,198,216,0.10)' : 'rgba(255,255,255,0.04)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selected ? Colors.mint : Colors.muted, alignItems: 'center', justifyContent: 'center' }}>
          {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.mint }} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: Colors.white }}>{title}</Text>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 }}>{subtitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MemberSetup() {
  const { member } = useAuth();
  const [notifChoice, setNotifChoice] = useState<NotifChoice>('app');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkBiometricAvailability().then((avail) => {
      setBiometricAvailable(avail.isAvailable && avail.isEnrolled);
    });
  }, []);

  async function handleConfirm() {
    if (!member) return;
    setSaving(true);
    try {
      await supabase.from('notification_preferences').upsert(
        {
          member_id: member.id,
          email_notifications: notifChoice === 'app_email',
          push_notifications: true,
          loan_updates: true,
          contribution_updates: true,
          commodity_updates: true,
        },
        { onConflict: 'member_id' }
      );

      if (biometricEnabled) {
        await SecureStore.setItemAsync('biometric_enabled', 'true');
      }

      await SecureStore.setItemAsync('setup_complete', 'true');
      router.replace('/(member)/' as any);
    } catch {
      // Don't block the user if saving preferences fails
      await SecureStore.setItemAsync('setup_complete', 'true');
      router.replace('/(member)/' as any);
    } finally {
      setSaving(false);
    }
  }

  const firstName = member?.full_name?.split(' ')[0] ?? 'Member';

  return (
    <LinearGradient
      colors={Gradients.loginBg as [string, string, string]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: '100%' }}>
        <View style={[{ backgroundColor: Surfaces.loginCard, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: Radii.xl, padding: 44, width: 480, maxWidth: '100%' }, Shadows.loginCard]}>

          {/* Welcome header */}
          <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>🎉</Text>
          <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['4xl'], color: Colors.white, textAlign: 'center', lineHeight: 40, marginBottom: 8 }}>
            {'Welcome,\n'}<Text style={{ color: Colors.mint }}>{firstName}</Text>
          </Text>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted, textAlign: 'center', marginBottom: 36, lineHeight: 22 }}>
            Let's set up your account preferences to get the most out of the ASMPCS portal.
          </Text>

          {/* Notification preferences */}
          <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.sm, color: Colors.white, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.7 }}>
            Notification Preferences
          </Text>
          <RadioOption
            selected={notifChoice === 'app'}
            onPress={() => setNotifChoice('app')}
            title="App Notifications Only"
            subtitle="Receive updates in the app when you open it"
          />
          <RadioOption
            selected={notifChoice === 'app_email'}
            onPress={() => setNotifChoice('app_email')}
            title="App + Email Notifications"
            subtitle="Also receive important updates to your registered email"
          />

          {/* Biometric enrollment */}
          {biometricAvailable && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.sm, color: Colors.white, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.7 }}>
                Biometric Sign-In
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setBiometricEnabled(!biometricEnabled)}
                style={{
                  borderWidth: 2,
                  borderColor: biometricEnabled ? Colors.mint : 'rgba(255,255,255,0.12)',
                  borderRadius: Radii.md,
                  padding: 18,
                  backgroundColor: biometricEnabled ? 'rgba(0,198,216,0.10)' : 'rgba(255,255,255,0.04)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 24 }}>🔒</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: Colors.white }}>
                      Enable Fingerprint / Face ID
                    </Text>
                    <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 }}>
                      Skip password entry on future sign-ins using biometrics
                    </Text>
                  </View>
                  {/* Toggle switch */}
                  <View style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: biometricEnabled ? Colors.mint : 'rgba(255,255,255,0.15)', padding: 3, justifyContent: 'center' }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white, alignSelf: biometricEnabled ? 'flex-end' : 'flex-start' }} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Confirm button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleConfirm}
            disabled={saving}
            style={{
              marginTop: 32,
              backgroundColor: Colors.mint,
              borderRadius: Radii.md,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: Colors.white }}>
                Confirm & Go to Dashboard →
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

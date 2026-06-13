import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenError } from '../../src/components/ScreenError';
import { Toast, useToast } from '../../src/components/Toast';
import { InfoRow } from '../../src/components/FormInput';
import { FormInput } from '../../src/components/FormInput';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { changePassword, toggleTwoFactor } from '../../src/api';
import { useDividendHistory } from '../../src/hooks/useDividendHistory';
import { useMemberProfile } from '../../src/hooks/useMemberProfile';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Gradients, Radii } from '../../src/theme/tokens';

function ProfileSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Skeleton height={140} borderRadius={14} style={{ marginBottom: 16 }} />
      <Skeleton height={280} borderRadius={12} style={{ marginBottom: 16 }} />
      <Skeleton height={280} borderRadius={12} style={{ marginBottom: 16 }} />
      <Skeleton width={160} height={18} style={{ marginBottom: 14 }} />
      <Skeleton height={180} borderRadius={12} />
    </ScrollView>
  );
}

export default function MemberProfile() {
  const profileQuery = useMemberProfile();
  const dividendsQuery = useDividendHistory();
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [isSavingPw, setIsSavingPw] = useState(false);

  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [isTogglingTwoFa, setIsTogglingTwoFa] = useState(false);

  const isLoading = profileQuery.isLoading || dividendsQuery.isLoading;
  const isError = profileQuery.isError || dividendsQuery.isError;

  const handleRetry = () => {
    if (profileQuery.isError) profileQuery.refetch();
    if (dividendsQuery.isError) dividendsQuery.refetch();
  };

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([profileQuery.refetch(), dividendsQuery.refetch()]);
    setRefreshing(false);
  }

  async function handleChangePassword() {
    setPwError(null);
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return; }
    setIsSavingPw(true);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setShowPwForm(false);
      toast.show('Password updated successfully.');
    } catch (e: any) {
      setPwError(e?.message ?? 'Failed to update password.');
    } finally {
      setIsSavingPw(false);
    }
  }

  async function handleToggleTwoFa(value: boolean) {
    setIsTogglingTwoFa(true);
    try {
      await toggleTwoFactor(value);
      setTwoFaEnabled(value);
      toast.show(value ? '2FA enabled — your account is more secure.' : '2FA disabled.');
    } finally {
      setIsTogglingTwoFa(false);
    }
  }

  const member = profileQuery.data;
  const dividends = dividendsQuery.data ?? [];

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="My Profile" onNotifPress={() => router.push('/(member)/notifications' as any)} />
      {isLoading ? (
        <ProfileSkeleton />
      ) : isError ? (
        <ScreenError onRetry={handleRetry} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.mint} />}
        >
          {/* Profile hero */}
          <LinearGradient
            colors={['rgba(21,101,168,0.28)', 'rgba(0,198,216,0.08)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 20, borderWidth: 1, borderColor: 'rgba(0,198,216,0.22)', borderRadius: Radii.lg, padding: 20, marginBottom: 16 }}
          >
            <LinearGradient
              colors={Gradients.memberPrimary as [string, string]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <Text style={{ fontFamily: Fonts.playfair, fontSize: 26, color: Colors.white, fontWeight: '700' }}>{member?.initials}</Text>
            </LinearGradient>

            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: Fonts.playfair, fontSize: 20, color: Colors.white, fontWeight: '700' }} numberOfLines={1}>{member?.name}</Text>
              <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 2 }}>{member?.role} · {member?.station}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <Badge variant="active" label="Active Member" />
                <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.mint }}>{member?.memberId}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Personal Information */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader title="Personal Information" actionLabel="Request Edit" onAction={() => {}} />
            <CardBody>
              <InfoRow label="Full Name"    value={member?.name ?? ''} />
              <InfoRow label="Staff ID"      value={member?.staffId ?? ''} valueMono />
              <InfoRow label="Department"    value={member?.department ?? ''} />
              <InfoRow label="Station"       value={member?.station ?? ''} />
              <InfoRow label="Phone"         value={member?.phone ?? ''} valueMono />
              <InfoRow label="Email"         value={member?.email ?? ''} valueMono />
              <InfoRow label="Date of Birth" value={member?.dob ?? ''} valueMono />
            </CardBody>
          </Card>

          {/* Membership Details */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader title="Membership Details" />
            <CardBody>
              <InfoRow label="Member ID"    value={member?.memberId ?? ''} valueMono valueColor={Colors.mint} />
              <InfoRow label="Zone"         value={member?.zone ?? ''} />
              <InfoRow label="Role"         value={member?.role ?? ''} />
              <InfoRow label="Joined"       value={member?.joined ?? ''} />
              <InfoRow label="Duration"     value={member?.membership ?? ''} />
              <View style={{ marginBottom: 2, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', paddingBottom: 11, paddingTop: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.sm, color: Colors.muted }}>Status</Text>
                <Badge variant="active" label="Active" />
              </View>
              <InfoRow label="NOK Name"     value={member?.nokName ?? ''} />
              <InfoRow label="NOK Relation" value={member?.nokRel ?? ''} />
              <InfoRow label="NOK Phone"    value={member?.nokPhone ?? ''} valueMono />
            </CardBody>
          </Card>

          {/* Security settings */}
          <SectionTitle>Security Settings</SectionTitle>
          <Card style={{ marginBottom: 16 }}>
            <CardBody>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: showPwForm ? 18 : 0 }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 14, color: Colors.white }}>🔑 Change Password</Text>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 2 }}>Update your login password</Text>
                </View>
                <Button variant="view" size="sm" label={showPwForm ? 'Cancel' : 'Change'} onPress={() => { setShowPwForm((v) => !v); setPwError(null); }} />
              </View>

              {showPwForm && (
                <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', paddingTop: 18 }}>
                  <FormInput label="Current Password" placeholder="Enter current password" secureTextEntry value={currentPw} onChangeText={setCurrentPw} editable={!isSavingPw} />
                  <FormInput label="New Password" placeholder="Minimum 8 characters" secureTextEntry value={newPw} onChangeText={setNewPw} editable={!isSavingPw} />
                  <FormInput label="Confirm New Password" placeholder="Re-enter new password" secureTextEntry value={confirmPw} onChangeText={setConfirmPw} editable={!isSavingPw} />
                  {pwError && (
                    <View style={{ backgroundColor: 'rgba(192,57,43,0.18)', borderWidth: 1, borderColor: 'rgba(192,57,43,0.35)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 }}>
                      <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: '#E88080' }}>{pwError}</Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <Button variant="primary" label={isSavingPw ? 'Saving…' : 'Save New Password'} disabled={isSavingPw} onPress={handleChangePassword} />
                  </View>
                </View>
              )}

              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 18 }} />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 14, color: Colors.white }}>📱 Two-Factor Authentication</Text>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 2 }}>
                    {twoFaEnabled ? 'Enabled — requires verification code' : 'Disabled — enable for extra security'}
                  </Text>
                </View>
                <Switch
                  value={twoFaEnabled}
                  onValueChange={isTogglingTwoFa ? undefined : handleToggleTwoFa}
                  trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(0,198,216,0.50)' }}
                  thumbColor={twoFaEnabled ? Colors.mint : Colors.muted}
                />
              </View>

              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 18 }} />

              <View style={{ gap: 10 }}>
                <Button variant="view" label="📱 Update Phone Number" onPress={() => {}} />
                <Button variant="view" label="🔔 Notification Preferences" onPress={() => {}} />
                <Button variant="ghost" label="📄 Download Data Export" onPress={() => {}} />
              </View>
            </CardBody>
          </Card>

          {/* Dividend history */}
          <SectionTitle>Dividend History</SectionTitle>
          <Card>
            <CardBody noPad>
              {dividends.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
                      {['Year', 'Savings Dividend', 'Loan Patronage', 'Total Earned'].map((h) => (
                        <View key={h} style={{ width: 130, paddingHorizontal: 16, paddingVertical: 12 }}>
                          <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                        </View>
                      ))}
                    </View>
                    {dividends.map((row, i) => (
                      <View key={row.year} style={{ flexDirection: 'row', borderBottomWidth: i < dividends.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                        <View style={{ width: 130, paddingHorizontal: 16, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: Colors.white }}>{row.year}</Text>
                        </View>
                        <View style={{ width: 130, paddingHorizontal: 16, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.mint }}>{row.savings}</Text>
                        </View>
                        <View style={{ width: 130, paddingHorizontal: 16, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.gold }}>{row.loan}</Text>
                        </View>
                        <View style={{ width: 130, paddingHorizontal: 16, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.green2, fontWeight: '700' }}>{row.total}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 36, gap: 10 }}>
                  <Text style={{ fontSize: 32 }}>📈</Text>
                  <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.muted }}>No dividend history yet</Text>
                </View>
              )}
            </CardBody>
          </Card>
        </ScrollView>
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </View>
  );
}

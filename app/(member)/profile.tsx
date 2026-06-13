import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenError } from '../../src/components/ScreenError';
import { Toast, useToast } from '../../src/components/Toast';
import { FormInput, InfoRow } from '../../src/components/FormInput';
import { Badge } from '../../src/components/ui/Badge';
import type { BadgeVariant } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { Modal } from '../../src/components/ui/Modal';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { SUPPORT_EMAIL } from '../../src/constants/config';
import { useAuth } from '../../src/context/AuthContext';
import type { DbMember } from '../../src/context/AuthContext';
import { checkBiometricAvailability } from '../../src/lib/biometric';
import { useDividendHistory } from '../../src/hooks/useDividendHistory';
import { useProfile } from '../../src/hooks/useProfile';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Gradients, Radii } from '../../src/theme/tokens';

// ─── Helpers ──────────────────────────────────────────────────

function fmtMoney(n: number): string {
  return '₦' + n.toLocaleString('en-NG');
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function membershipDuration(dateJoined: string | null): string {
  if (!dateJoined) return 'N/A';
  const joined = new Date(dateJoined);
  const now = new Date();
  const years = now.getFullYear() - joined.getFullYear();
  const months =
    now.getMonth() -
    joined.getMonth() +
    (now.getDate() < joined.getDate() ? -1 : 0);
  const totalMonths = years * 12 + months;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} Year${y !== 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} Month${m !== 1 ? 's' : ''}`);
  return parts.join(' ') || 'Less than a month';
}

function statusVariant(s: DbMember['membership_status']): BadgeVariant {
  return s === 'active' ? 'active' : s === 'suspended' ? 'overdue' : 'inactive';
}

// ─── Skeleton ─────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <Skeleton height={130} borderRadius={Radii.lg} style={{ marginBottom: 16 }} />
      <Skeleton height={260} borderRadius={Radii.md} style={{ marginBottom: 16 }} />
      <Skeleton height={160} borderRadius={Radii.md} style={{ marginBottom: 16 }} />
      <Skeleton height={220} borderRadius={Radii.md} style={{ marginBottom: 16 }} />
      <Skeleton height={180} borderRadius={Radii.md} />
    </ScrollView>
  );
}

const BIOMETRIC_STORE_KEY = 'asmpcs_biometric_enabled';

// ─── Sign-out confirmation modal ──────────────────────────────

interface SignOutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function SignOutModal({ visible, onCancel, onConfirm }: SignOutModalProps) {
  return (
    <Modal visible={visible} title="Sign Out" onClose={onCancel}>
      <View style={{ gap: 16 }}>
        <Text
          style={{
            fontFamily: Fonts.sans,
            fontSize: FontSize.md,
            color: Colors.muted,
            lineHeight: 22,
          }}
        >
          Are you sure you want to sign out? You will need to enter your Staff ID and
          password to sign back in.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="view" label="Cancel" onPress={onCancel} />
          <Button variant="danger" label="Sign Out" onPress={onConfirm} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Toggle row ───────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  sublabel?: string;
  value: boolean;
  onToggle?: (v: boolean) => void;
  disabled?: boolean;
  lockedLabel?: string;
}

function ToggleRow({ label, sublabel, value, onToggle, disabled, lockedLabel }: ToggleRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text
          style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.white }}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text
            style={{
              fontFamily: Fonts.sans,
              fontSize: FontSize.xs,
              color: disabled ? Colors.muted : Colors.muted,
              marginTop: 2,
            }}
          >
            {sublabel}
          </Text>
        ) : null}
        {lockedLabel ? (
          <Text
            style={{
              fontFamily: Fonts.sans,
              fontSize: FontSize.xs,
              color: Colors.mint,
              marginTop: 2,
            }}
          >
            {lockedLabel}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={disabled ? undefined : onToggle}
        disabled={disabled}
        trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(0,198,216,0.50)' }}
        thumbColor={value ? Colors.mint : Colors.muted}
      />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────

export default function MemberProfile() {
  const { logout } = useAuth();
  const { member, prefsQuery, updateProfile, changePassword, updateNotifPrefs } =
    useProfile();
  const dividendsQuery = useDividendHistory();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // ── Personal info edit state ────────────────────────────────
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    full_name: '',
    phone: '',
    department: '',
    zone: '',
  });
  const [savingPersonal, setSavingPersonal] = useState(false);

  // ── Next of kin edit state ──────────────────────────────────
  const [editingNok, setEditingNok] = useState(false);
  const [nokForm, setNokForm] = useState({
    next_of_kin_name: '',
    next_of_kin_phone: '',
    next_of_kin_relationship: '',
  });
  const [savingNok, setSavingNok] = useState(false);

  // ── Password change state ───────────────────────────────────
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwErrors, setPwErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
    general?: string;
  }>({});
  const [savingPw, setSavingPw] = useState(false);

  // ── Biometric state ─────────────────────────────────────────
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // ── Sign-out modal ──────────────────────────────────────────
  const [showSignOut, setShowSignOut] = useState(false);

  const isError = prefsQuery.isError;

  // Biometric init
  useEffect(() => {
    if (Platform.OS === 'web') return;
    checkBiometricAvailability().then(({ isAvailable, isEnrolled }) => {
      setBiometricAvailable(isAvailable && isEnrolled);
    });
    SecureStore.getItemAsync(BIOMETRIC_STORE_KEY).then((val) => {
      setBiometricEnabled(val === 'true');
    });
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([prefsQuery.refetch(), dividendsQuery.refetch()]);
    setRefreshing(false);
  }

  // ── Personal save ───────────────────────────────────────────
  function enterEditPersonal() {
    setPersonalForm({
      full_name:  member?.full_name ?? '',
      phone:      member?.phone ?? '',
      department: member?.department ?? '',
      zone:       member?.zone ?? '',
    });
    setEditingPersonal(true);
  }

  async function savePersonal() {
    setSavingPersonal(true);
    try {
      await updateProfile({
        full_name:  personalForm.full_name.trim(),
        phone:      personalForm.phone.trim() || null,
        department: personalForm.department.trim() || null,
        zone:       personalForm.zone.trim() || null,
      });
      setEditingPersonal(false);
      toast.show('Profile updated.');
    } catch (e: any) {
      toast.show(e?.message ?? 'Failed to save.', 'error');
    } finally {
      setSavingPersonal(false);
    }
  }

  // ── NOK save ─────────────────────────────────────────────────
  function enterEditNok() {
    setNokForm({
      next_of_kin_name:         member?.next_of_kin_name ?? '',
      next_of_kin_phone:        member?.next_of_kin_phone ?? '',
      next_of_kin_relationship: member?.next_of_kin_relationship ?? '',
    });
    setEditingNok(true);
  }

  async function saveNok() {
    setSavingNok(true);
    try {
      await updateProfile({
        next_of_kin_name:         nokForm.next_of_kin_name.trim() || null,
        next_of_kin_phone:        nokForm.next_of_kin_phone.trim() || null,
        next_of_kin_relationship: nokForm.next_of_kin_relationship.trim() || null,
      });
      setEditingNok(false);
      toast.show('Next of kin updated.');
    } catch (e: any) {
      toast.show(e?.message ?? 'Failed to save.', 'error');
    } finally {
      setSavingNok(false);
    }
  }

  // ── Password change ──────────────────────────────────────────
  async function handleChangePassword() {
    const errors: typeof pwErrors = {};
    if (!currentPw) errors.current = 'Required';
    if (newPw.length < 8) errors.new = 'Must be at least 8 characters';
    if (newPw !== confirmPw) errors.confirm = 'Passwords do not match';
    if (Object.keys(errors).length > 0) { setPwErrors(errors); return; }

    setSavingPw(true);
    setPwErrors({});
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setShowPwForm(false);
      toast.show('Password updated successfully.');
    } catch (e: any) {
      setPwErrors({ general: e?.message ?? 'Failed to update password.' });
    } finally {
      setSavingPw(false);
    }
  }

  // ── Biometric toggle ─────────────────────────────────────────
  async function handleBiometricToggle(value: boolean) {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(BIOMETRIC_STORE_KEY, value ? 'true' : 'false');
    }
    setBiometricEnabled(value);
    toast.show(value ? 'Biometric sign-in enabled.' : 'Biometric sign-in disabled.');
  }

  // ── Notif prefs ──────────────────────────────────────────────
  async function handlePrefToggle(key: string, value: boolean) {
    try {
      await updateNotifPrefs({ [key]: value });
    } catch (e: any) {
      toast.show(e?.message ?? 'Failed to save preference.', 'error');
    }
  }

  // ── Support email ─────────────────────────────────────────────
  function openSupport() {
    const subject = encodeURIComponent(
      `ASMPCS Support Request - ${member?.staff_id ?? ''}`
    );
    const body = encodeURIComponent(
      `Member Name: ${member?.full_name ?? ''}\nStaff ID: ${member?.staff_id ?? ''}\nAgency: ${member?.agency ?? ''}\n\nPlease describe your issue below:\n`
    );
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
  }

  const prefs = prefsQuery.data;
  const dividends = dividendsQuery.data ?? [];
  const initials = getInitials(member?.full_name ?? '??');

  if (!member) return <ProfileSkeleton />;
  if (isError) return <ScreenError onRetry={() => prefsQuery.refetch()} />;

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar
        title="My Profile"
        onNotifPress={() => router.push('/(member)/notifications' as any)}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.mint} />
        }
      >
        {/* ── Profile hero ──────────────────────────────────── */}
        <LinearGradient
          colors={['rgba(21,101,168,0.28)', 'rgba(0,198,216,0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 20,
            borderWidth: 1,
            borderColor: 'rgba(0,198,216,0.22)',
            borderRadius: Radii.lg,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <LinearGradient
            colors={Gradients.memberPrimary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.playfair,
                fontSize: 26,
                color: Colors.white,
                fontWeight: '700',
              }}
            >
              {initials}
            </Text>
          </LinearGradient>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: Fonts.playfair,
                fontSize: 20,
                color: Colors.white,
                fontWeight: '700',
              }}
              numberOfLines={1}
            >
              {member.full_name}
            </Text>
            <Text
              style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 2 }}
            >
              {member.agency ?? '—'} · {member.zone ?? '—'}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                marginTop: 10,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Badge
                variant={statusVariant(member.membership_status)}
                label={member.membership_status.charAt(0).toUpperCase() + member.membership_status.slice(1)}
              />
              <Text
                style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.mint }}
              >
                {member.staff_id}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Personal Information ──────────────────────────── */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader
            title="Personal Information"
            actionLabel={editingPersonal ? 'Cancel' : 'Edit'}
            onAction={() => {
              if (editingPersonal) setEditingPersonal(false);
              else enterEditPersonal();
            }}
          />
          <CardBody>
            {editingPersonal ? (
              <View>
                <FormInput
                  label="Full Name"
                  value={personalForm.full_name}
                  onChangeText={(v) => setPersonalForm((f) => ({ ...f, full_name: v }))}
                />
                <FormInput
                  label="Phone Number"
                  value={personalForm.phone}
                  onChangeText={(v) => setPersonalForm((f) => ({ ...f, phone: v }))}
                  keyboardType="phone-pad"
                />
                <FormInput
                  label="Department"
                  value={personalForm.department}
                  onChangeText={(v) => setPersonalForm((f) => ({ ...f, department: v }))}
                />
                <FormInput
                  label="Zone"
                  value={personalForm.zone}
                  onChangeText={(v) => setPersonalForm((f) => ({ ...f, zone: v }))}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
                  <Button
                    variant="primary"
                    label={savingPersonal ? 'Saving…' : 'Save Changes'}
                    disabled={savingPersonal}
                    onPress={savePersonal}
                  />
                </View>
              </View>
            ) : (
              <>
                <InfoRow label="Full Name"   value={member.full_name} />
                <InfoRow label="Staff ID"    value={member.staff_id} valueMono />
                <InfoRow label="Email"       value={member.email} valueMono />
                <InfoRow label="Phone"       value={member.phone ?? '—'} valueMono />
                <InfoRow label="Agency"      value={member.agency ?? '—'} />
                <InfoRow label="Department"  value={member.department ?? '—'} />
                <InfoRow label="Zone"        value={member.zone ?? '—'} />
                <InfoRow
                  label="Joined"
                  value={
                    member.date_joined
                      ? new Date(member.date_joined).toLocaleDateString('en-NG', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })
                      : '—'
                  }
                  valueMono
                />
                <InfoRow label="Duration" value={membershipDuration(member.date_joined)} />
              </>
            )}
          </CardBody>
        </Card>

        {/* ── Next of Kin ───────────────────────────────────── */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader
            title="Next of Kin"
            actionLabel={editingNok ? 'Cancel' : 'Edit'}
            onAction={() => {
              if (editingNok) setEditingNok(false);
              else enterEditNok();
            }}
          />
          <CardBody>
            {editingNok ? (
              <View>
                <FormInput
                  label="Full Name"
                  value={nokForm.next_of_kin_name}
                  onChangeText={(v) => setNokForm((f) => ({ ...f, next_of_kin_name: v }))}
                />
                <FormInput
                  label="Phone Number"
                  value={nokForm.next_of_kin_phone}
                  onChangeText={(v) => setNokForm((f) => ({ ...f, next_of_kin_phone: v }))}
                  keyboardType="phone-pad"
                />
                <FormInput
                  label="Relationship"
                  value={nokForm.next_of_kin_relationship}
                  onChangeText={(v) => setNokForm((f) => ({ ...f, next_of_kin_relationship: v }))}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
                  <Button
                    variant="primary"
                    label={savingNok ? 'Saving…' : 'Save Changes'}
                    disabled={savingNok}
                    onPress={saveNok}
                  />
                </View>
              </View>
            ) : (
              <>
                <InfoRow label="Name"         value={member.next_of_kin_name ?? '—'} />
                <InfoRow label="Phone"        value={member.next_of_kin_phone ?? '—'} valueMono />
                <InfoRow label="Relationship" value={member.next_of_kin_relationship ?? '—'} />
              </>
            )}
          </CardBody>
        </Card>

        {/* ── Security ──────────────────────────────────────── */}
        <SectionTitle>Security</SectionTitle>
        <Card style={{ marginBottom: 16 }}>
          <CardBody>
            {/* Change Password */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: showPwForm ? 16 : 0,
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text
                  style={{ fontFamily: Fonts.sansSemibold, fontSize: 14, color: Colors.white }}
                >
                  🔑 Change Password
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.sans,
                    fontSize: 12,
                    color: Colors.muted,
                    marginTop: 2,
                  }}
                >
                  Update your login password
                </Text>
              </View>
              <Button
                variant="view"
                size="sm"
                label={showPwForm ? 'Cancel' : 'Change'}
                onPress={() => {
                  setShowPwForm((v) => !v);
                  setPwErrors({});
                  setCurrentPw(''); setNewPw(''); setConfirmPw('');
                }}
              />
            </View>

            {showPwForm && (
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255,255,255,0.07)',
                  paddingTop: 16,
                }}
              >
                <FormInput
                  label="Current Password"
                  placeholder="Enter current password"
                  secureTextEntry
                  value={currentPw}
                  onChangeText={setCurrentPw}
                  editable={!savingPw}
                  error={pwErrors.current}
                />
                <FormInput
                  label="New Password"
                  placeholder="Minimum 8 characters"
                  secureTextEntry
                  value={newPw}
                  onChangeText={setNewPw}
                  editable={!savingPw}
                  error={pwErrors.new}
                />
                <FormInput
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  secureTextEntry
                  value={confirmPw}
                  onChangeText={setConfirmPw}
                  editable={!savingPw}
                  error={pwErrors.confirm}
                />
                {pwErrors.general && (
                  <View
                    style={{
                      backgroundColor: 'rgba(192,57,43,0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(192,57,43,0.30)',
                      borderRadius: Radii.sm,
                      padding: 12,
                      marginBottom: 14,
                    }}
                  >
                    <Text
                      style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.red2 }}
                    >
                      {pwErrors.general}
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    label={savingPw ? 'Saving…' : 'Save New Password'}
                    disabled={savingPw}
                    onPress={handleChangePassword}
                  />
                </View>
              </View>
            )}

            <View
              style={{
                height: 1,
                backgroundColor: 'rgba(255,255,255,0.07)',
                marginVertical: 18,
              }}
            />

            {/* Biometric toggle — only shown if device supports it */}
            {biometricAvailable && (
              <>
                <ToggleRow
                  label="👆 Biometric Sign-In"
                  sublabel={
                    biometricEnabled
                      ? 'Fingerprint / Face ID is enabled'
                      : 'Use biometrics instead of password'
                  }
                  value={biometricEnabled}
                  onToggle={handleBiometricToggle}
                />
                <View
                  style={{
                    height: 1,
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    marginVertical: 18,
                  }}
                />
              </>
            )}

            {/* Sign out */}
            <Button
              variant="danger"
              label="Sign Out"
              fullWidth
              onPress={() => setShowSignOut(true)}
            />
          </CardBody>
        </Card>

        {/* ── Notification Preferences ─────────────────────── */}
        <SectionTitle>Notification Preferences</SectionTitle>
        <Card style={{ marginBottom: 16 }}>
          <CardBody>
            <ToggleRow
              label="Push Notifications"
              value
              disabled
              lockedLabel="Push notifications cannot be disabled"
            />
            <ToggleRow
              label="Email Notifications"
              sublabel="Receive updates via email"
              value={prefs?.emailNotifications ?? false}
              onToggle={(v) => handlePrefToggle('emailNotifications', v)}
            />
            <ToggleRow
              label="Loan Updates"
              sublabel="Approvals, rejections, overdue alerts"
              value={prefs?.loanUpdates ?? true}
              onToggle={(v) => handlePrefToggle('loanUpdates', v)}
            />
            <ToggleRow
              label="Contribution Updates"
              sublabel="Monthly deduction confirmations"
              value={prefs?.contributionUpdates ?? true}
              onToggle={(v) => handlePrefToggle('contributionUpdates', v)}
            />
            <ToggleRow
              label="Commodity Updates"
              sublabel="Order status and new items"
              value={prefs?.commodityUpdates ?? true}
              onToggle={(v) => handlePrefToggle('commodityUpdates', v)}
            />
          </CardBody>
        </Card>

        {/* ── Support ───────────────────────────────────────── */}
        <SectionTitle>Support</SectionTitle>
        <Card style={{ marginBottom: 16 }}>
          <CardBody>
            <Text
              style={{
                fontFamily: Fonts.sans,
                fontSize: FontSize.base,
                color: Colors.muted,
                marginBottom: 14,
                lineHeight: 20,
              }}
            >
              Need help? Send a support request to our team and we'll respond within
              one business day.
            </Text>
            <Button
              variant="view"
              label="✉ Contact Support"
              fullWidth
              onPress={openSupport}
            />
          </CardBody>
        </Card>

        {/* ── Dividend History ──────────────────────────────── */}
        <SectionTitle>Dividend History</SectionTitle>
        <Card>
          <CardBody noPad>
            {dividends.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderBottomWidth: 1,
                      borderBottomColor: 'rgba(255,255,255,0.07)',
                    }}
                  >
                    {['Year', 'Savings Div.', 'Loan Div.', 'Total', 'Status'].map((h) => (
                      <View
                        key={h}
                        style={{ width: 110, paddingHorizontal: 14, paddingVertical: 12 }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.sansSemibold,
                            fontSize: FontSize.xs,
                            color: Colors.muted,
                            textTransform: 'uppercase',
                            letterSpacing: 0.7,
                          }}
                        >
                          {h}
                        </Text>
                      </View>
                    ))}
                  </View>
                  {dividends.map((row, i) => (
                    <View
                      key={row.year}
                      style={{
                        flexDirection: 'row',
                        borderBottomWidth: i < dividends.length - 1 ? 1 : 0,
                        borderBottomColor: 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <View style={{ width: 110, paddingHorizontal: 14, paddingVertical: 13 }}>
                        <Text
                          style={{
                            fontFamily: Fonts.sansSemibold,
                            fontSize: FontSize.base,
                            color: Colors.white,
                          }}
                        >
                          {row.year}
                        </Text>
                      </View>
                      <View style={{ width: 110, paddingHorizontal: 14, paddingVertical: 13 }}>
                        <Text
                          style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.mint }}
                        >
                          {fmtMoney(row.savingsDividend)}
                        </Text>
                      </View>
                      <View style={{ width: 110, paddingHorizontal: 14, paddingVertical: 13 }}>
                        <Text
                          style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.gold }}
                        >
                          {fmtMoney(row.loanDividend)}
                        </Text>
                      </View>
                      <View style={{ width: 110, paddingHorizontal: 14, paddingVertical: 13 }}>
                        <Text
                          style={{
                            fontFamily: Fonts.mono,
                            fontSize: FontSize.base,
                            color: Colors.green2,
                            fontWeight: '700',
                          }}
                        >
                          {fmtMoney(row.totalDividend)}
                        </Text>
                      </View>
                      <View style={{ width: 110, paddingHorizontal: 14, paddingVertical: 13, justifyContent: 'center' }}>
                        <Badge
                          variant={
                            row.status === 'paid'
                              ? 'approved'
                              : row.status === 'approved'
                              ? 'active'
                              : 'pending'
                          }
                          label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 36, gap: 10 }}>
                <Text style={{ fontSize: 32 }}>📈</Text>
                <Text
                  style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.muted }}
                >
                  No dividend history yet
                </Text>
              </View>
            )}
          </CardBody>
        </Card>
      </ScrollView>

      {/* Sign-out confirmation */}
      <SignOutModal
        visible={showSignOut}
        onCancel={() => setShowSignOut(false)}
        onConfirm={async () => {
          setShowSignOut(false);
          await logout();
        }}
      />

      <Toast message={toast.message} visible={toast.visible} variant={toast.variant} />
    </View>
  );
}

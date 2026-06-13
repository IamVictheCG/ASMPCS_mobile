import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { ScreenError } from '../../../src/components/ScreenError';
import { Toast, useToast } from '../../../src/components/Toast';
import { FormInput, InfoRow } from '../../../src/components/FormInput';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../src/components/ui/Card';
import { SectionTitle } from '../../../src/components/ui/SectionTitle';
import { Skeleton } from '../../../src/components/ui/Skeleton';
import { addAuditEntry, getMemberById } from '../../../src/api';
import { useAuth } from '../../../src/context/AuthContext';
import { AppTopbar } from '../../../src/navigation/AppTopbar';
import type { MemberRecord } from '../../../src/types';
import { Colors, Fonts, FontSize, Radii } from '../../../src/theme/tokens';

// Static contribution history (per member)
const CONTRIB_HISTORY = [
  { month: 'May 2026', amount: '₦55,000', type: 'Payroll', status: 'credit' as const },
  { month: 'Apr 2026', amount: '₦55,000', type: 'Payroll', status: 'credit' as const },
  { month: 'Mar 2026', amount: '₦55,000', type: 'Payroll', status: 'credit' as const },
  { month: 'Feb 2026', amount: '₦55,000', type: 'Payroll', status: 'credit' as const },
  { month: 'Jan 2026', amount: '₦55,000', type: 'Payroll', status: 'credit' as const },
  { month: 'Dec 2025', amount: '₦52,000', type: 'Payroll', status: 'credit' as const },
];

// Static loan history (per member)
const LOAN_HISTORY = [
  { id: 'LN-2024-018', type: 'Short-Term', amount: '₦40,000', rate: '5%', disbursed: 'Jan 2024', status: 'approved' as const },
  { id: 'LN-2023-007', type: 'IOU',         amount: '₦15,000', rate: '0%', disbursed: 'Mar 2023', status: 'approved' as const },
];

function DetailSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Skeleton height={160} borderRadius={12} style={{ marginBottom: 24 }} />
      <View style={{ flexDirection: 'row', gap: 18, marginBottom: 24 }}>
        <Skeleton style={{ flex: 1 }} height={280} borderRadius={12} />
        <Skeleton style={{ flex: 1 }} height={280} borderRadius={12} />
      </View>
    </ScrollView>
  );
}

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { displayName } = useAuth();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: member, isLoading, isError, refetch } = useQuery<MemberRecord | null>({
    queryKey: ['admin', 'member', id],
    queryFn: async () => {
      const res = await getMemberById(id ?? '');
      return res.data;
    },
    enabled: !!id,
  });

  // Edit form state (seeded from member data on open)
  const [editDept, setEditDept] = useState('');
  const [editZone, setEditZone] = useState('');

  function openEdit() {
    setEditDept(member?.dept ?? '');
    setEditZone(member?.zone ?? '');
    setShowEdit(true);
  }

  async function handleSave() {
    if (!member) return;
    setIsSaving(true);
    try {
      await new Promise<void>((r) => setTimeout(r, 400));
      queryClient.setQueryData<MemberRecord | null>(['admin', 'member', id], (old) =>
        old ? { ...old, dept: editDept, zone: editZone } : old
      );
      addAuditEntry({
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        adminUsername: displayName ?? 'Admin',
        actionType: 'MEMBER_UPDATED',
        affectedId: member.id,
        description: `Updated profile for ${member.name} — dept: ${editDept}, zone: ${editZone}`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] });
      toast.show('Member profile updated.');
      setShowEdit(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Member Profile" subtitle={id ?? ''} portal="admin" />
      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !member ? (
        <ScreenError onRetry={refetch} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.red2} />}
        >
          {/* Hero */}
          <View style={{ backgroundColor: 'rgba(139,26,26,0.18)', borderWidth: 1, borderColor: 'rgba(192,57,43,0.28)', borderRadius: Radii.lg, padding: 28, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.crimson, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: Fonts.playfair, fontSize: 26, color: Colors.white, fontWeight: '700' }}>
                  {member.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                </Text>
              </View>
              <View>
                <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['4xl'], color: Colors.white, fontWeight: '700' }}>{member.name}</Text>
                <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.red2, marginTop: 3 }}>{member.id}</Text>
                <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 }}>{member.dept} · {member.zone}</Text>
                <View style={{ marginTop: 8 }}>
                  <Badge variant={member.status === 'overdue' ? 'overdue' : 'active'} label={member.status === 'overdue' ? 'Overdue' : 'Active Member'} />
                </View>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 12 }}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>Total Savings</Text>
                <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize['4xl'], color: Colors.green2, fontWeight: '700' }}>{member.savings}</Text>
              </View>
              {member.loan !== 'None' && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>Active Loan</Text>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize['2xl'], color: Colors.gold, fontWeight: '700' }}>{member.loan}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button variant="view" label="← Back" onPress={() => router.back()} />
                <Button variant="edit" label="✏ Edit Profile" onPress={openEdit} />
              </View>
            </View>
          </View>

          {/* Two columns */}
          <View style={{ flexDirection: 'row', gap: 18, marginBottom: 24 }}>
            <Card style={{ flex: 1 }}>
              <CardHeader title="Membership Details" />
              <CardBody>
                <InfoRow label="Member ID"    value={member.id}       valueMono valueColor={Colors.red2} />
                <InfoRow label="Department"   value={member.dept}     />
                <InfoRow label="Zone"         value={member.zone}     />
                <InfoRow label="Date Joined"  value={member.joined}   valueMono />
                <InfoRow label="Savings"      value={member.savings}  valueMono valueColor={Colors.green2} />
                <InfoRow label="Active Loan"  value={member.loan}     valueMono valueColor={member.loan === 'None' ? Colors.muted : Colors.gold} />
              </CardBody>
            </Card>

            {showEdit ? (
              <Card style={{ flex: 1 }}>
                <CardHeader title="Edit Member Profile" />
                <CardBody>
                  <FormInput label="Department / Station" value={editDept} onChangeText={setEditDept} placeholder="e.g. ATC · Abuja" />
                  <FormInput label="Zone" value={editZone} onChangeText={setEditZone} placeholder="Zone A or Zone B" />
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                    <Button variant="admin-primary" label={isSaving ? 'Saving…' : 'Save Changes'} disabled={isSaving} onPress={handleSave} />
                    <Button variant="ghost" label="Cancel" onPress={() => setShowEdit(false)} />
                  </View>
                </CardBody>
              </Card>
            ) : (
              <Card style={{ flex: 1 }}>
                <CardHeader title="Recent Contributions" />
                <CardBody noPad>
                  {CONTRIB_HISTORY.map((row, i) => (
                    <View key={row.month} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 13, borderBottomWidth: i < CONTRIB_HISTORY.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                      <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.muted }}>{row.month}</Text>
                      <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.white }}>{row.type}</Text>
                      <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.green2, fontWeight: '700' }}>{row.amount}</Text>
                    </View>
                  ))}
                </CardBody>
              </Card>
            )}
          </View>

          {/* Loan history */}
          <SectionTitle portal="admin">Loan History</SectionTitle>
          <Card>
            <CardBody noPad>
              {LOAN_HISTORY.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted }}>No loan history for this member</Text>
                </View>
              ) : (
                <>
                  <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
                    {['Loan ID', 'Type', 'Amount', 'Rate', 'Disbursed', 'Status'].map((h) => (
                      <View key={h} style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 11 }}>
                        <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                      </View>
                    ))}
                  </View>
                  {LOAN_HISTORY.map((row, i) => (
                    <View key={row.id} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: i < LOAN_HISTORY.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 13 }}><Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.red2 }}>{row.id}</Text></View>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 13 }}><Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white }}>{row.type}</Text></View>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 13 }}><Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.gold }}>{row.amount}</Text></View>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 13 }}><Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.muted }}>{row.rate}</Text></View>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 13 }}><Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.muted }}>{row.disbursed}</Text></View>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 13 }}><Badge variant={row.status} label="Approved" /></View>
                    </View>
                  ))}
                </>
              )}
            </CardBody>
          </Card>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  );
}

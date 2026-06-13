import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScreenError } from '../../src/components/ScreenError';
import { Toast, useToast } from '../../src/components/Toast';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody } from '../../src/components/ui/Card';
import { Modal } from '../../src/components/ui/Modal';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { addAuditEntry, approveLoan, rejectLoan } from '../../src/api';
import { useAuth } from '../../src/context/AuthContext';
import { useAdminLoans } from '../../src/hooks/useAdminLoans';
import { useAdminGuarantors } from '../../src/hooks/useAdminGuarantors';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import type { PendingLoan } from '../../src/types';
import { Colors, Fonts, FontSize, Radii, Surfaces } from '../../src/theme/tokens';

type Tab = 'pending' | 'guarantors';

const PIPELINE_COLORS: Record<string, string> = {
  pending: Colors.gold,
  review: Colors.red2,
  approved: Colors.green2,
  rejected: '#666',
};

const LOAN_COLS = ['Loan ID', 'Member', 'Staff ID', 'Type', 'Amount', 'Tenure', 'Submitted', 'Guarantors', 'Status', 'Actions'];

function LoansSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 14, marginBottom: 28 }}>
        {[...Array(4)].map((_, i) => <Skeleton key={i} style={{ flex: 1 }} height={110} borderRadius={Radii.md} />)}
      </View>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' }}>
        <Skeleton height={44} borderRadius={0} />
        {[...Array(7)].map((_, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' }}>
            {[120, 150, 140, 110, 110, 110, 110, 110, 110, 180].map((w, j) => <Skeleton key={j} width={w} height={14} />)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function statusLabel(s: PendingLoan['status']) {
  if (s === 'approved') return 'Approved';
  if (s === 'rejected') return 'Rejected';
  return 'Pending';
}

export default function AdminLoans() {
  const { pipeline, pending } = useAdminLoans();
  const { pending: guarantorsPending } = useAdminGuarantors();
  const queryClient = useQueryClient();
  const { displayName } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingLoan | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [reasonError, setReasonError] = useState<string | null>(null);

  const isLoading = pipeline.isLoading || pending.isLoading;
  const isError = pipeline.isError || pending.isError;
  const handleRetry = () => { if (pipeline.isError) pipeline.refetch(); if (pending.isError) pending.refetch(); };

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([pipeline.refetch(), pending.refetch()]);
    setRefreshing(false);
  }

  async function handleApprove(loan: PendingLoan) {
    if (approvingId) return;
    setApprovingId(loan.id);
    try {
      await approveLoan(loan.id);
      queryClient.setQueryData<PendingLoan[]>(['admin', 'loans', 'pending'], (old = []) =>
        old.map((l) => l.id === loan.id ? { ...l, status: 'approved' } : l)
      );
      addAuditEntry({
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        adminUsername: displayName ?? 'Admin',
        actionType: 'LOAN_APPROVED',
        affectedId: loan.id,
        description: `Approved ${loan.type} ${loan.amount} for ${loan.member}`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] });
      toast.show(`✅ ${loan.id} approved successfully.`);
    } catch {
      toast.show('Failed to approve loan. Please try again.');
    } finally {
      setApprovingId(null);
    }
  }

  async function handleRejectConfirm() {
    if (!rejectTarget) return;
    if (rejectReason.trim().length < 20) { setReasonError('Reason must be at least 20 characters.'); return; }
    setRejecting(true);
    setReasonError(null);
    try {
      await rejectLoan(rejectTarget.id, rejectReason.trim());
      queryClient.setQueryData<PendingLoan[]>(['admin', 'loans', 'pending'], (old = []) =>
        old.map((l) => l.id === rejectTarget.id ? { ...l, status: 'rejected', rejectionReason: rejectReason.trim() } : l)
      );
      addAuditEntry({
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        adminUsername: displayName ?? 'Admin',
        actionType: 'LOAN_REJECTED',
        affectedId: rejectTarget.id,
        description: `Rejected ${rejectTarget.type} ${rejectTarget.amount} for ${rejectTarget.member} — ${rejectReason.trim().slice(0, 80)}`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] });
      toast.show(`❌ ${rejectTarget.id} rejected.`);
      setRejectTarget(null);
      setRejectReason('');
    } catch {
      toast.show('Failed to reject loan. Please try again.');
    } finally {
      setRejecting(false);
    }
  }

  const pipelineData = pipeline.data ?? [];
  const pendingLoans = pending.data ?? [];
  const guarantors = guarantorsPending.data ?? [];

  const TAB_STYLE = (active: boolean) => ({
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: active ? 'rgba(192,57,43,0.25)' : 'transparent',
    borderWidth: 1,
    borderColor: active ? Colors.red2 : 'rgba(255,255,255,0.10)',
  });

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Loan Requests" subtitle="Review and process pending loan applications" portal="admin" onNotifPress={() => {}} />
      {isLoading ? (
        <LoansSkeleton />
      ) : isError ? (
        <ScreenError onRetry={handleRetry} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.red2} />}
        >
          <SectionTitle portal="admin">Pipeline Overview</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
            {pipelineData.map((stage) => (
              <View key={stage.label} style={{ width: '47%', backgroundColor: Surfaces.cardBg, borderWidth: 1, borderColor: Surfaces.cardBorder, borderRadius: Radii.md, padding: 16 }}>
                <Text style={{ fontFamily: Fonts.mono, fontSize: 28, color: PIPELINE_COLORS[stage.variant], fontWeight: '700' }}>{stage.count}</Text>
                <Text style={{ fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.white, marginTop: 5 }}>{stage.label}</Text>
                <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginTop: 4 }}>{stage.val}</Text>
              </View>
            ))}
          </View>

          {/* Tab switcher */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <TouchableOpacity style={TAB_STYLE(activeTab === 'pending')} onPress={() => setActiveTab('pending')} activeOpacity={0.7}>
              <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: activeTab === 'pending' ? Colors.white : Colors.muted }}>
                {`Pending Applications (${pendingLoans.filter(l => l.status === 'pending').length})`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={TAB_STYLE(activeTab === 'guarantors')} onPress={() => setActiveTab('guarantors')} activeOpacity={0.7}>
              <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: activeTab === 'guarantors' ? Colors.white : Colors.muted }}>
                {`Guarantor Tracking (${guarantors.length})`}
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'pending' && (
            <>
              <SectionTitle portal="admin">{`All Applications (${pendingLoans.length})`}</SectionTitle>
              <Card>
                <CardBody noPad>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                      <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
                        {LOAN_COLS.map((h) => {
                          const w = h === 'Actions' ? 210 : h === 'Member' ? 160 : h === 'Loan ID' ? 130 : h === 'Staff ID' ? 150 : h === 'Amount' ? 120 : 120;
                          return (
                            <View key={h} style={{ width: w, paddingHorizontal: 16, paddingVertical: 11 }}>
                              <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                            </View>
                          );
                        })}
                      </View>
                      {pendingLoans.map((loan, i) => {
                        const isProcessed = loan.status !== 'pending';
                        const isApproving = approvingId === loan.id;
                        return (
                          <View key={loan.id} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: i < pendingLoans.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)', opacity: isProcessed ? 0.6 : 1 }}>
                            <View style={{ width: 130, paddingHorizontal: 16, paddingVertical: 13 }}>
                              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.red2 }}>{loan.id}</Text>
                            </View>
                            <View style={{ width: 160, paddingHorizontal: 16, paddingVertical: 13 }}>
                              <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.white }}>{loan.member}</Text>
                            </View>
                            <View style={{ width: 150, paddingHorizontal: 16, paddingVertical: 13 }}>
                              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.muted }}>{loan.staffId}</Text>
                            </View>
                            <View style={{ width: 120, paddingHorizontal: 16, paddingVertical: 13 }}>
                              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white }}>{loan.type}</Text>
                            </View>
                            <View style={{ width: 120, paddingHorizontal: 16, paddingVertical: 13 }}>
                              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.gold, fontWeight: '700' }}>{loan.amount}</Text>
                            </View>
                            <View style={{ width: 120, paddingHorizontal: 16, paddingVertical: 13 }}>
                              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white }}>{loan.tenure}</Text>
                            </View>
                            <View style={{ width: 120, paddingHorizontal: 16, paddingVertical: 13 }}>
                              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.muted }}>{loan.submitted}</Text>
                            </View>
                            <View style={{ width: 120, paddingHorizontal: 16, paddingVertical: 13 }}>
                              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: loan.guarantors.includes('✅') ? Colors.green2 : Colors.gold }}>{loan.guarantors}</Text>
                            </View>
                            <View style={{ width: 120, paddingHorizontal: 16, paddingVertical: 13 }}>
                              <Badge variant={loan.status} label={statusLabel(loan.status)} />
                            </View>
                            <View style={{ width: 210, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', gap: 6 }}>
                              <Button variant="view" size="sm" label="View" onPress={() => router.push(`/(admin)/loans/${loan.id}` as any)} />
                              {!isProcessed && (
                                <>
                                  <Button variant="approve" size="sm" label={isApproving ? '…' : 'Approve'} disabled={!!approvingId} onPress={() => handleApprove(loan)} />
                                  <Button variant="reject"  size="sm" label="Reject"  onPress={() => { setRejectTarget(loan); setRejectReason(''); setReasonError(null); }} />
                                </>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                </CardBody>
              </Card>
            </>
          )}

          {activeTab === 'guarantors' && (
            <>
              <SectionTitle portal="admin">{`Pending Guarantor Consents (${guarantors.length})`}</SectionTitle>
              <Card>
                <CardBody noPad>
                  <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
                    {['Loan Ref', 'Applicant', 'Amount', 'Guarantor', 'Requested', 'Pending For', 'Action'].map((h) => (
                      <View key={h} style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 11 }}>
                        <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                      </View>
                    ))}
                  </View>
                  {guarantors.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 40, gap: 10 }}>
                      <Text style={{ fontSize: 36 }}>🤝</Text>
                      <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.muted }}>No pending guarantor consents</Text>
                    </View>
                  ) : guarantors.map((g, i) => (
                    <View key={g.loanId} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: i < guarantors.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 13 }}><Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.red2 }}>{g.loanId}</Text></View>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 13 }}><Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.white }}>{g.applicant}</Text></View>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 13 }}><Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.gold }}>{g.amount}</Text></View>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 13 }}><Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white }}>{g.guarantor}</Text></View>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 13 }}><Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.muted }}>{g.requested}</Text></View>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 13 }}><Badge variant="pending" label={g.daysPending} /></View>
                      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 10 }}><Button variant="view" size="sm" label="Send Reminder" onPress={() => toast.show(`Reminder sent to ${g.guarantor}.`)} /></View>
                    </View>
                  ))}
                </CardBody>
              </Card>
            </>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* Reject reason modal */}
      <Modal visible={rejectTarget !== null} onClose={() => { setRejectTarget(null); setRejectReason(''); setReasonError(null); }} title={`Reject Loan ${rejectTarget?.id ?? ''}`}>
        <View style={{ gap: 16 }}>
          <View style={{ backgroundColor: 'rgba(192,57,43,0.12)', borderWidth: 1, borderColor: 'rgba(192,57,43,0.25)', borderRadius: 8, padding: 14 }}>
            <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: Colors.white }}>{rejectTarget?.member}</Text>
            <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.gold, marginTop: 3 }}>{rejectTarget?.type} · {rejectTarget?.amount}</Text>
          </View>
          <View>
            <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.sm, color: Colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 }}>Rejection Reason (min 20 characters)</Text>
            <TextInput
              value={rejectReason}
              onChangeText={(t) => { setRejectReason(t); if (reasonError) setReasonError(null); }}
              placeholder="State the reason for rejection…"
              placeholderTextColor={Colors.muted}
              multiline
              numberOfLines={4}
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: reasonError ? Colors.red2 : 'rgba(255,255,255,0.12)', borderRadius: 8, padding: 12, fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white, minHeight: 100, textAlignVertical: 'top' }}
            />
            <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.xs, color: rejectReason.trim().length >= 20 ? Colors.green2 : Colors.muted, marginTop: 4 }}>
              {rejectReason.trim().length}/20 minimum
            </Text>
            {reasonError && (
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.red2, marginTop: 4 }}>{reasonError}</Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="ghost" label="Cancel" onPress={() => { setRejectTarget(null); setRejectReason(''); setReasonError(null); }} />
            <Button variant="danger" label={rejecting ? 'Rejecting…' : 'Confirm Rejection'} disabled={rejecting} onPress={handleRejectConfirm} />
          </View>
        </View>
      </Modal>

      <Toast message={toast.message} visible={toast.visible} variant="error" />
    </View>
  );
}

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScreenError } from '../../../src/components/ScreenError';
import { Toast, useToast } from '../../../src/components/Toast';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../src/components/ui/Card';
import { Modal } from '../../../src/components/ui/Modal';
import { SectionTitle } from '../../../src/components/ui/SectionTitle';
import { Skeleton } from '../../../src/components/ui/Skeleton';
import { addAuditEntry, approveLoan, getLoanById, rejectLoan } from '../../../src/api';
import { useAuth } from '../../../src/context/AuthContext';
import { AppTopbar } from '../../../src/navigation/AppTopbar';
import type { LoanDetail, PendingLoan } from '../../../src/types';
import { Colors, Fonts, FontSize, Radii, Surfaces } from '../../../src/theme/tokens';

const DOC_COLOR = { ok: Colors.green2, pending: Colors.gold, missing: Colors.red2 };
const DOC_ICON  = { ok: '✅', pending: '⏳', missing: '❌' };

function DetailSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Skeleton height={180} borderRadius={12} style={{ marginBottom: 24 }} />
      <View style={{ flexDirection: 'row', gap: 18, marginBottom: 24 }}>
        <Skeleton style={{ flex: 1 }} height={240} borderRadius={12} />
        <Skeleton style={{ flex: 1 }} height={240} borderRadius={12} />
      </View>
      <Skeleton height={200} borderRadius={12} />
    </ScrollView>
  );
}

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const toast = useToast();

  const { data: loan, isLoading, isError, refetch } = useQuery<LoanDetail | null>({
    queryKey: ['admin', 'loan', id],
    queryFn: async () => {
      const res = await getLoanById(id ?? '');
      return res.data;
    },
    enabled: !!id,
  });

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [reasonError, setReasonError] = useState<string | null>(null);

  async function handleApprove() {
    if (!loan || approvingId) return;
    setApprovingId(loan.id);
    try {
      await approveLoan(loan.id);
      queryClient.setQueryData<LoanDetail | null>(['admin', 'loan', id], (old) => old ? { ...old, status: 'approved' } : old);
      queryClient.setQueryData<PendingLoan[]>(['admin', 'loans', 'pending'], (old = []) =>
        old.map((l) => l.id === loan.id ? { ...l, status: 'approved' } : l)
      );
      addAuditEntry({
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        adminUsername: user?.name ?? 'Admin',
        actionType: 'LOAN_APPROVED',
        affectedId: loan.id,
        description: `Approved ${loan.type} ${loan.amount} for ${loan.member}`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] });
      toast.show(`✅ ${loan.id} approved.`);
    } catch {
      toast.show('Failed to approve. Please try again.');
    } finally {
      setApprovingId(null);
    }
  }

  async function handleRejectConfirm() {
    if (!loan) return;
    if (rejectReason.trim().length < 20) { setReasonError('Reason must be at least 20 characters.'); return; }
    setRejecting(true);
    setReasonError(null);
    try {
      await rejectLoan(loan.id, rejectReason.trim());
      queryClient.setQueryData<LoanDetail | null>(['admin', 'loan', id], (old) =>
        old ? { ...old, status: 'rejected', rejectionReason: rejectReason.trim() } : old
      );
      queryClient.setQueryData<PendingLoan[]>(['admin', 'loans', 'pending'], (old = []) =>
        old.map((l) => l.id === loan.id ? { ...l, status: 'rejected', rejectionReason: rejectReason.trim() } : l)
      );
      addAuditEntry({
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        adminUsername: user?.name ?? 'Admin',
        actionType: 'LOAN_REJECTED',
        affectedId: loan.id,
        description: `Rejected ${loan.type} ${loan.amount} for ${loan.member} — ${rejectReason.trim().slice(0, 80)}`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] });
      toast.show(`❌ ${loan.id} rejected.`);
      setShowReject(false);
      setRejectReason('');
    } catch {
      toast.show('Failed to reject. Please try again.');
    } finally {
      setRejecting(false);
    }
  }

  const isProcessed = loan?.status !== 'pending';

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Loan Application" subtitle={id ?? ''} portal="admin" />
      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !loan ? (
        <ScreenError onRetry={refetch} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

          {/* Header card */}
          <View style={{ backgroundColor: 'rgba(139,26,26,0.20)', borderWidth: 1, borderColor: 'rgba(192,57,43,0.30)', borderRadius: Radii.lg, padding: 28, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ gap: 10 }}>
              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.lg, color: Colors.red2 }}>{loan.id}</Text>
              <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['4xl'], color: Colors.white, fontWeight: '700' }}>{loan.member}</Text>
              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.muted }}>{loan.staffId}</Text>
              <Badge variant={loan.status} label={loan.status === 'pending' ? 'Pending Review' : loan.status === 'approved' ? 'Approved' : 'Rejected'} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>Loan Amount</Text>
              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize['5xl'], color: Colors.gold, fontWeight: '700' }}>{loan.amount}</Text>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>{loan.type} · {loan.tenure}</Text>
              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.xs, color: Colors.muted }}>Submitted {loan.submitted}</Text>
            </View>
          </View>

          {/* Action buttons */}
          {!isProcessed && (
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <Button variant="approve" label={approvingId ? 'Approving…' : '✅  Approve Loan'} disabled={!!approvingId} onPress={handleApprove} />
              <Button variant="danger"  label="❌  Reject Loan"  onPress={() => { setShowReject(true); setRejectReason(''); setReasonError(null); }} />
              <Button variant="ghost"   label="← Back to List"  onPress={() => router.back()} />
            </View>
          )}
          {isProcessed && (
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <Button variant="ghost" label="← Back to List" onPress={() => router.back()} />
            </View>
          )}
          {loan.status === 'rejected' && loan.rejectionReason && (
            <View style={{ backgroundColor: 'rgba(192,57,43,0.12)', borderWidth: 1, borderColor: 'rgba(192,57,43,0.30)', borderRadius: 8, padding: 14, marginBottom: 24 }}>
              <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.sm, color: Colors.red2 }}>Rejection Reason</Text>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white, marginTop: 6, lineHeight: 22 }}>{loan.rejectionReason}</Text>
            </View>
          )}

          {/* Two-column layout */}
          <View style={{ flexDirection: 'row', gap: 18, marginBottom: 24 }}>
            <Card style={{ flex: 1 }}>
              <CardHeader title="Loan Details" />
              <CardBody>
                {[
                  { label: 'Loan Type',      value: loan.type },
                  { label: 'Amount',         value: loan.amount,    mono: true, color: Colors.gold },
                  { label: 'Tenure',         value: loan.tenure,    mono: true },
                  { label: 'Guarantors',     value: loan.guarantors },
                  { label: 'Date Submitted', value: loan.submitted, mono: true },
                ].map(({ label, value, mono, color }) => (
                  <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                    <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>{label}</Text>
                    <Text style={{ fontFamily: mono ? Fonts.mono : Fonts.sansMedium, fontSize: FontSize.sm, color: color ?? Colors.white }}>{value}</Text>
                  </View>
                ))}
                <View style={{ paddingVertical: 10 }}>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted, marginBottom: 4 }}>Purpose of Loan</Text>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white, lineHeight: 21 }}>{loan.purpose}</Text>
                </View>
              </CardBody>
            </Card>

            <Card style={{ flex: 1 }}>
              <CardHeader title="Guarantor Information" />
              <CardBody>
                {[
                  { label: 'Guarantor 1', value: loan.guarantor1 },
                  { label: 'Guarantor 2', value: loan.guarantor2 ?? 'Not required' },
                ].map(({ label, value }) => (
                  <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                    <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>{label}</Text>
                    <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.sm, color: value === 'Not required' ? Colors.muted : Colors.white, maxWidth: '60%', textAlign: 'right' }}>{value}</Text>
                  </View>
                ))}
              </CardBody>
            </Card>
          </View>

          {/* Document checklist */}
          <SectionTitle portal="admin">Document Checklist</SectionTitle>
          <Card>
            <CardBody>
              <View style={{ gap: 14 }}>
                {loan.documents.map((doc) => (
                  <View key={doc.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: `${DOC_COLOR[doc.docStatus]}22`, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 14 }}>{DOC_ICON[doc.docStatus]}</Text>
                    </View>
                    <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: doc.docStatus === 'missing' ? Colors.red2 : Colors.white, flex: 1 }}>{doc.name}</Text>
                    <Badge variant={doc.docStatus === 'ok' ? 'approved' : doc.docStatus === 'pending' ? 'pending' : 'rejected'} label={doc.docStatus === 'ok' ? 'Received' : doc.docStatus === 'pending' ? 'Awaiting' : 'Missing'} />
                  </View>
                ))}
              </View>
            </CardBody>
          </Card>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      <Modal visible={showReject} onClose={() => { setShowReject(false); setRejectReason(''); setReasonError(null); }} title={`Reject ${loan?.id ?? ''}`}>
        <View style={{ gap: 16 }}>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted }}>
            Provide a clear reason for rejection. This will be recorded in the audit log.
          </Text>
          <TextInput
            value={rejectReason}
            onChangeText={(t) => { setRejectReason(t); if (reasonError) setReasonError(null); }}
            placeholder="State the reason for rejection (min 20 characters)…"
            placeholderTextColor={Colors.muted}
            multiline
            numberOfLines={4}
            style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: reasonError ? Colors.red2 : 'rgba(255,255,255,0.12)', borderRadius: 8, padding: 12, fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white, minHeight: 110, textAlignVertical: 'top' }}
          />
          <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.xs, color: rejectReason.trim().length >= 20 ? Colors.green2 : Colors.muted }}>
            {rejectReason.trim().length}/20 minimum
          </Text>
          {reasonError && <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.red2 }}>{reasonError}</Text>}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="ghost" label="Cancel" onPress={() => setShowReject(false)} />
            <Button variant="danger" label={rejecting ? 'Rejecting…' : 'Confirm Rejection'} disabled={rejecting} onPress={handleRejectConfirm} />
          </View>
        </View>
      </Modal>

      <Toast message={toast.message} visible={toast.visible} variant="error" />
    </View>
  );
}

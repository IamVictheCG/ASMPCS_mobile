import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScreenError } from '../../src/components/ScreenError';
import { Toast, useToast } from '../../src/components/Toast';
import { FormInput } from '../../src/components/FormInput';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { addAuditEntry, saveLoanParams, saveSocietySettings } from '../../src/api';
import { useAuth } from '../../src/context/AuthContext';
import { useLoanParams, useSocietySettings } from '../../src/hooks/useSettings';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import type { LoanParams, SocietySettings } from '../../src/types';
import { Colors, Fonts, FontSize } from '../../src/theme/tokens';

type Tab = 'society' | 'loans';

function SettingsSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
        <Skeleton width={160} height={40} borderRadius={8} />
        <Skeleton width={160} height={40} borderRadius={8} />
      </View>
      <Skeleton height={400} borderRadius={12} />
    </ScrollView>
  );
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { displayName } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('society');

  const settingsQuery   = useSocietySettings();
  const loanParamsQuery = useLoanParams();

  const isLoading = settingsQuery.isLoading || loanParamsQuery.isLoading;
  const isError   = settingsQuery.isError   || loanParamsQuery.isError;
  const handleRetry = () => {
    if (settingsQuery.isError)   settingsQuery.refetch();
    if (loanParamsQuery.isError) loanParamsQuery.refetch();
  };

  // Society form state
  const [soc, setSoc] = useState<SocietySettings>({ name: '', regNo: '', address: '', phone: '', email: '', bankName: '', accountNo: '' });
  const [isSavingSoc, setIsSavingSoc] = useState(false);

  // Loan params form state
  const [lp, setLp] = useState<LoanParams>({ maxMultiplier: 3, iouRate: 0, shortTermRate: 5, propertyRate: 7, carRate: 10, maxTenureMonths: 36 });
  const [isSavingLp, setIsSavingLp] = useState(false);

  useEffect(() => { if (settingsQuery.data) setSoc({ ...settingsQuery.data }); }, [settingsQuery.data]);
  useEffect(() => { if (loanParamsQuery.data) setLp({ ...loanParamsQuery.data }); }, [loanParamsQuery.data]);

  async function handleSaveSociety() {
    setIsSavingSoc(true);
    try {
      await saveSocietySettings(soc);
      queryClient.setQueryData(['admin', 'settings', 'society'], { ...soc });
      addAuditEntry({
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        adminUsername: displayName ?? 'Admin',
        actionType: 'SETTINGS_SAVED',
        affectedId: 'SOCIETY_INFO',
        description: 'Updated society information — name, contact details, banking info',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] });
      toast.show('Society information saved successfully.');
    } catch {
      toast.show('Failed to save. Please try again.');
    } finally {
      setIsSavingSoc(false);
    }
  }

  async function handleSaveLoanParams() {
    setIsSavingLp(true);
    try {
      await saveLoanParams(lp);
      queryClient.setQueryData(['admin', 'settings', 'loan-params'], { ...lp });
      addAuditEntry({
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        adminUsername: displayName ?? 'Admin',
        actionType: 'SETTINGS_SAVED',
        affectedId: 'LOAN_PARAMS',
        description: `Updated loan parameters — multiplier: ${lp.maxMultiplier}×, short-term: ${lp.shortTermRate}%, property: ${lp.propertyRate}%, car: ${lp.carRate}%`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] });
      toast.show('Loan parameters saved successfully.');
    } catch {
      toast.show('Failed to save. Please try again.');
    } finally {
      setIsSavingLp(false);
    }
  }

  const TAB_STYLE = (active: boolean) => ({
    paddingHorizontal: 24, paddingVertical: 9, borderRadius: 8,
    backgroundColor: active ? 'rgba(192,57,43,0.25)' : 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: active ? Colors.red2 : 'rgba(255,255,255,0.10)',
  });

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Settings" subtitle="System configuration and loan parameters" portal="admin" />
      {isLoading ? (
        <SettingsSkeleton />
      ) : isError ? (
        <ScreenError onRetry={handleRetry} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
            <TouchableOpacity style={TAB_STYLE(activeTab === 'society')} onPress={() => setActiveTab('society')} activeOpacity={0.7}>
              <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: activeTab === 'society' ? Colors.white : Colors.muted }}>🏢 Society Information</Text>
            </TouchableOpacity>
            <TouchableOpacity style={TAB_STYLE(activeTab === 'loans')} onPress={() => setActiveTab('loans')} activeOpacity={0.7}>
              <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: activeTab === 'loans' ? Colors.white : Colors.muted }}>🏦 Loan Parameters</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'society' && (
            <Card>
              <CardHeader title="Society Information" subtitle="Changes take effect immediately for all members" />
              <CardBody>
                <View style={{ flexDirection: 'row', gap: 18 }}>
                  <View style={{ flex: 1 }}>
                    <FormInput label="Society Name"       value={soc.name}      onChangeText={(v) => setSoc({ ...soc, name: v })}      placeholder="Full registered name" />
                    <FormInput label="Registration Number" value={soc.regNo}     onChangeText={(v) => setSoc({ ...soc, regNo: v })}     placeholder="e.g. RC-10274-FCT" />
                    <FormInput label="Registered Address"  value={soc.address}   onChangeText={(v) => setSoc({ ...soc, address: v })}   placeholder="Full postal address" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormInput label="Phone Number"       value={soc.phone}     onChangeText={(v) => setSoc({ ...soc, phone: v })}     placeholder="+234-..." />
                    <FormInput label="Email Address"      value={soc.email}     onChangeText={(v) => setSoc({ ...soc, email: v })}     placeholder="official@example.gov.ng" />
                    <FormInput label="Principal Bank"     value={soc.bankName}  onChangeText={(v) => setSoc({ ...soc, bankName: v })}  placeholder="Bank name" />
                    <FormInput label="Account Number"     value={soc.accountNo} onChangeText={(v) => setSoc({ ...soc, accountNo: v })} placeholder="10-digit account number" />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                  <Button variant="admin-primary" label={isSavingSoc ? 'Saving…' : 'Save Society Information'} disabled={isSavingSoc} onPress={handleSaveSociety} />
                </View>
              </CardBody>
            </Card>
          )}

          {activeTab === 'loans' && (
            <Card>
              <CardHeader title="Loan Parameters" subtitle="Applied to all new loan applications after saving" />
              <CardBody>
                <View style={{ flexDirection: 'row', gap: 18 }}>
                  <View style={{ flex: 1 }}>
                    <FormInput
                      label="Max Loan Multiplier (× savings)"
                      value={String(lp.maxMultiplier)}
                      onChangeText={(v) => setLp({ ...lp, maxMultiplier: Number(v) || 3 })}
                      placeholder="3"
                      keyboardType="numeric"
                    />
                    <FormInput
                      label="IOU Interest Rate (%)"
                      value={String(lp.iouRate)}
                      onChangeText={(v) => setLp({ ...lp, iouRate: Number(v) || 0 })}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                    <FormInput
                      label="Short-Term Loan Rate (% p.a.)"
                      value={String(lp.shortTermRate)}
                      onChangeText={(v) => setLp({ ...lp, shortTermRate: Number(v) || 5 })}
                      placeholder="5"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormInput
                      label="Property Loan Rate (% p.a.)"
                      value={String(lp.propertyRate)}
                      onChangeText={(v) => setLp({ ...lp, propertyRate: Number(v) || 7 })}
                      placeholder="7"
                      keyboardType="numeric"
                    />
                    <FormInput
                      label="Car Loan Rate (% p.a.)"
                      value={String(lp.carRate)}
                      onChangeText={(v) => setLp({ ...lp, carRate: Number(v) || 10 })}
                      placeholder="10"
                      keyboardType="numeric"
                    />
                    <FormInput
                      label="Maximum Loan Tenure (months)"
                      value={String(lp.maxTenureMonths)}
                      onChangeText={(v) => setLp({ ...lp, maxTenureMonths: Number(v) || 36 })}
                      placeholder="36"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={{ backgroundColor: 'rgba(192,57,43,0.10)', borderWidth: 1, borderColor: 'rgba(192,57,43,0.20)', borderRadius: 8, padding: 14, marginTop: 8, marginBottom: 16 }}>
                  <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.sm, color: Colors.red2 }}>⚠ Impact Warning</Text>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted, marginTop: 4 }}>
                    Changing these parameters affects eligibility checks and repayment schedule calculations for all future applications. Existing approved loans are not affected.
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <Button variant="admin-primary" label={isSavingLp ? 'Saving…' : 'Save Loan Parameters'} disabled={isSavingLp} onPress={handleSaveLoanParams} />
                </View>
              </CardBody>
            </Card>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  );
}

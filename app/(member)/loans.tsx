import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenError } from '../../src/components/ScreenError';
import { FormInput } from '../../src/components/FormInput';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { submitLoanApplication } from '../../src/api';
import { useLoanStatus } from '../../src/hooks/useLoanStatus';
import { useLoanTypes } from '../../src/hooks/useLoanTypes';
import { useSavings } from '../../src/hooks/useSavings';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import type { ActiveLoan } from '../../src/types';
import { Colors, Fonts, FontSize, Radii } from '../../src/theme/tokens';

type LoanTab = 'iou' | 'short-term' | 'property' | 'car';
const TABS: { key: LoanTab; label: string }[] = [
  { key: 'iou',        label: 'IOU (Emergency)' },
  { key: 'short-term', label: 'Short-Term'       },
  { key: 'property',   label: 'Property Loan'    },
  { key: 'car',        label: 'Car Loan'          },
];

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function parseMoney(str: string): number {
  return Number(str.replace(/[₦,\s]/g, '').replace('.00', '')) || 0;
}

function fmtMoney(n: number): string {
  return '₦' + n.toLocaleString('en-NG');
}

function addMonths(dateStr: string, months: number): string {
  const parts = dateStr.split(' ');
  const day = parseInt(parts[0]);
  const mIdx = MONTHS_SHORT.indexOf(parts[1]);
  const year = parseInt(parts[2]);
  const total = mIdx + months;
  const newMonth = ((total % 12) + 12) % 12;
  const newYear = year + Math.floor(total / 12);
  return `${String(day).padStart(2, '0')} ${MONTHS_SHORT[newMonth]} ${newYear}`;
}

function buildSchedule(loan: ActiveLoan) {
  const totalMonths = Math.round(parseMoney(loan.originalAmount) / parseMoney(loan.monthlyPayment));
  const paidMonths = Math.round((loan.percentRepaid / 100) * totalMonths);
  const rows: { date: string; amount: string; status: 'paid' | 'upcoming' | 'final' }[] = [];

  for (let i = 2; i >= 1; i--) {
    rows.push({ date: addMonths(loan.nextPaymentDate, -i), amount: loan.monthlyPayment, status: 'paid' });
  }
  for (let i = 0; i < loan.monthsRemaining; i++) {
    rows.push({
      date: addMonths(loan.nextPaymentDate, i),
      amount: loan.monthlyPayment,
      status: i === loan.monthsRemaining - 1 ? 'final' : 'upcoming',
    });
  }
  return { rows, totalMonths, paidMonths };
}

function LoansSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Skeleton height={140} borderRadius={Radii.md} style={{ marginBottom: 16 }} />
      <Skeleton width={220} height={18} style={{ marginBottom: 12 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} style={{ width: '47%' }} height={180} borderRadius={Radii.md} />
        ))}
      </View>
      <Skeleton width={220} height={18} style={{ marginBottom: 12 }} />
      <Skeleton height={300} borderRadius={Radii.md} />
    </ScrollView>
  );
}

export default function MemberLoans() {
  const loanQuery = useLoanStatus();
  const typesQuery = useLoanTypes();
  const { summary: savingsQuery } = useSavings();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<LoanTab>('iou');
  const [amount, setAmount] = useState('');
  const [tenure, setTenure] = useState('');
  const [purpose, setPurpose] = useState('');
  const [guarantor1, setGuarantor1] = useState('');
  const [guarantor2, setGuarantor2] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const isLoading = loanQuery.isLoading || typesQuery.isLoading || savingsQuery.isLoading;
  const isError = loanQuery.isError || typesQuery.isError;

  const handleRetry = () => {
    if (loanQuery.isError) loanQuery.refetch();
    if (typesQuery.isError) typesQuery.refetch();
  };

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([loanQuery.refetch(), typesQuery.refetch(), savingsQuery.refetch()]);
    setRefreshing(false);
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const tabLabel = TABS.find((t) => t.key === activeTab)?.label ?? activeTab;
      const res = await submitLoanApplication({ type: tabLabel, amount, tenure, purpose, guarantor1, guarantor2, notes });
      setSubmittedId(res.data.applicationId);
    } finally {
      setIsSubmitting(false);
    }
  }

  const loan = loanQuery.data;
  const loanTypes = typesQuery.data ?? [];

  const savings = parseMoney(savingsQuery.data?.totalBalance ?? '0');
  const maxLoan = savings * 3;

  const schedule = loan ? buildSchedule(loan) : null;

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Loans" onNotifPress={() => router.push('/(member)/notifications' as any)} />
      {isLoading ? (
        <LoansSkeleton />
      ) : isError ? (
        <ScreenError onRetry={handleRetry} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.mint} />}
        >
          {/* Eligibility checker */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader title="Loan Eligibility" subtitle="Max loan = 3× total savings" />
            <CardBody>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>Total Savings</Text>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.white }}>{fmtMoney(savings)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>Multiplier</Text>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.muted }}>× 3</Text>
                </View>
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 14, color: Colors.white }}>Maximum Loan</Text>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: 18, color: Colors.mint, fontWeight: '700' }}>{fmtMoney(maxLoan)}</Text>
                </View>
                <Badge variant="active" label="Eligible — Good standing" />
              </View>
            </CardBody>
          </Card>

          {/* Active loan card */}
          {loan && (
            <>
              <LinearGradient
                colors={['rgba(21,101,168,0.30)', 'rgba(0,198,216,0.10)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ borderWidth: 1, borderColor: 'rgba(0,198,216,0.25)', borderRadius: Radii.md, padding: 20, marginBottom: 16 }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <View>
                    <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.7 }}>ACTIVE LOAN</Text>
                    <Text style={{ fontFamily: Fonts.playfair, fontSize: 20, color: Colors.white, fontWeight: '700' }}>{loan.type}</Text>
                  </View>
                  <Badge variant={loan.status} label={`● ${loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}`} />
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Original Amount', val: loan.originalAmount,         color: Colors.gold   },
                    { label: 'Outstanding',      val: loan.outstanding,            color: Colors.red2   },
                    { label: 'Monthly Payment',  val: loan.monthlyPayment,         color: Colors.white  },
                    { label: 'Months Left',      val: String(loan.monthsRemaining), color: Colors.green2 },
                  ].map((item) => (
                    <View key={item.label} style={{ width: '47%' }}>
                      <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted }}>{item.label}</Text>
                      <Text style={{ fontFamily: Fonts.mono, fontSize: 16, color: item.color, fontWeight: '700', marginTop: 2 }}>{item.val}</Text>
                    </View>
                  ))}
                </View>

                <ProgressBar percent={loan.percentRepaid} height={8} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted }}>{loan.percentRepaid}% Repaid</Text>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted }}>Next: {loan.nextPaymentDate}</Text>
                </View>
              </LinearGradient>

              {/* Repayment schedule */}
              {schedule && (
                <>
                  <SectionTitle>Repayment Schedule</SectionTitle>
                  <Card style={{ marginBottom: 20 }}>
                    <CardBody noPad>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                          <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
                            {['#', 'Due Date', 'Amount', 'Status'].map((h) => (
                              <View key={h} style={{ width: h === '#' ? 60 : 120, paddingHorizontal: 14, paddingVertical: 11 }}>
                                <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                              </View>
                            ))}
                          </View>
                          {schedule.rows.map((row, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: i < schedule.rows.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                              <View style={{ width: 60, paddingHorizontal: 14, paddingVertical: 12 }}>
                                <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.muted }}>
                                  #{schedule.paidMonths - 1 + i + (row.status === 'paid' ? -1 : 0)}
                                </Text>
                              </View>
                              <View style={{ width: 120, paddingHorizontal: 14, paddingVertical: 12 }}>
                                <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.white }}>{row.date}</Text>
                              </View>
                              <View style={{ width: 120, paddingHorizontal: 14, paddingVertical: 12 }}>
                                <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.mint }}>{row.amount}</Text>
                              </View>
                              <View style={{ width: 120, paddingHorizontal: 14, paddingVertical: 12 }}>
                                {row.status === 'paid' ? (
                                  <Badge variant="approved" label="✓ Paid" />
                                ) : row.status === 'final' ? (
                                  <Badge variant="active" label="Final" />
                                ) : (
                                  <Badge variant="pending" label="Upcoming" />
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      </ScrollView>
                    </CardBody>
                  </Card>
                </>
              )}
            </>
          )}

          {/* Loan products — 2 per row */}
          <SectionTitle>Available Loan Products</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            {loanTypes.length > 0 ? loanTypes.map((lt) => (
              <TouchableOpacity
                key={lt.name}
                onPress={() => {
                  const key = lt.name.toLowerCase().includes('iou') ? 'iou'
                    : lt.name.toLowerCase().includes('short') ? 'short-term'
                    : lt.name.toLowerCase().includes('property') ? 'property'
                    : 'car';
                  setActiveTab(key);
                  setSubmittedId(null);
                }}
                style={{ width: '47%', backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: Radii.md, padding: 16 }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 28, marginBottom: 10 }}>{lt.icon}</Text>
                <Text style={{ fontFamily: Fonts.playfair, fontSize: 15, color: Colors.white, fontWeight: '600', marginBottom: 4 }}>{lt.name}</Text>
                <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, lineHeight: 17 }}>{lt.desc}</Text>
                <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted }}>{lt.maxLabel}</Text>
                    <Text style={{ fontFamily: Fonts.mono, fontSize: 11, color: Colors.mint, fontWeight: '700' }}>{lt.maxVal}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted }}>{lt.rateLabel}</Text>
                    <Text style={{ fontFamily: Fonts.mono, fontSize: 11, color: Colors.mint, fontWeight: '700' }}>{lt.rateVal}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )) : (
              <View style={{ flex: 1, alignItems: 'center', paddingVertical: 28 }}>
                <Text style={{ fontSize: 32 }}>🏦</Text>
                <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted, marginTop: 8 }}>No loan products available</Text>
              </View>
            )}
          </View>

          {/* Application form */}
          <SectionTitle>Apply for a New Loan</SectionTitle>
          {submittedId ? (
            <Card>
              <CardBody>
                <View style={{ alignItems: 'center', paddingVertical: 24, gap: 12 }}>
                  <Text style={{ fontSize: 40 }}>✅</Text>
                  <Text style={{ fontFamily: Fonts.playfair, fontSize: 22, color: Colors.white, textAlign: 'center' }}>
                    Application Submitted
                  </Text>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted, textAlign: 'center' }}>
                    Your loan application will be reviewed by the Credit Committee within 3–5 working days.
                  </Text>
                  <View style={{ backgroundColor: 'rgba(0,198,216,0.10)', borderWidth: 1, borderColor: 'rgba(0,198,216,0.25)', borderRadius: Radii.sm, paddingHorizontal: 16, paddingVertical: 10, marginTop: 6 }}>
                    <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.mint }}>ID: {submittedId}</Text>
                  </View>
                  <Button variant="ghost" label="Submit Another" onPress={() => { setSubmittedId(null); setAmount(''); setPurpose(''); setGuarantor1(''); setGuarantor2(''); setNotes(''); setTenure(''); }} />
                </View>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardHeader title="Loan Application Form" />
              <CardBody>
                {/* Tab selector */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {TABS.map((tab) => (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setActiveTab(tab.key)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8,
                        borderRadius: Radii.full, borderWidth: 1,
                        borderColor: activeTab === tab.key ? Colors.mint : 'rgba(255,255,255,0.15)',
                        backgroundColor: activeTab === tab.key ? 'rgba(0,198,216,0.15)' : 'transparent',
                        minHeight: 44, justifyContent: 'center',
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={{ fontFamily: Fonts.sansMedium, fontSize: 13, color: activeTab === tab.key ? Colors.white : Colors.muted }}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {activeTab === 'iou' && (
                  <View style={{ gap: 0 }}>
                    <FormInput label="Amount Requested (₦)" placeholder="Max ₦20,000" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                    <FormInput label="Purpose" placeholder="Describe the emergency" value={purpose} onChangeText={setPurpose} />
                  </View>
                )}

                {activeTab === 'short-term' && (
                  <View style={{ gap: 0 }}>
                    <FormInput label="Amount Requested (₦)" placeholder="Max ₦50,000" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                    <FormInput label="Repayment Tenure" placeholder="3 months (6 instalments)" value={tenure} onChangeText={setTenure} />
                    <FormInput label="Purpose" placeholder="Medical / consumer needs" value={purpose} onChangeText={setPurpose} />
                    <FormInput label="Guarantor (Member ID)" placeholder="e.g. FAAN-2019-0218" value={guarantor1} onChangeText={setGuarantor1} />
                  </View>
                )}

                {activeTab === 'property' && (
                  <View style={{ gap: 0 }}>
                    <FormInput label="Amount Requested (₦)" placeholder="e.g. 5,000,000" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                    <FormInput label="Property Address" placeholder="Plot number, street, city" value={purpose} onChangeText={setPurpose} />
                    <FormInput label="Guarantor 1 (Member ID)" placeholder="e.g. FAAN-2019-0218" value={guarantor1} onChangeText={setGuarantor1} />
                    <FormInput label="Guarantor 2 (Member ID)" placeholder="e.g. FAAN-2020-0145" value={guarantor2} onChangeText={setGuarantor2} />
                    <FormInput label="Additional Notes" placeholder="Title deed status, intended use…" multiline numberOfLines={3} value={notes} onChangeText={setNotes} />
                  </View>
                )}

                {activeTab === 'car' && (
                  <View style={{ gap: 0 }}>
                    <FormInput label="Amount Requested (₦)" placeholder="e.g. 3,000,000" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                    <FormInput label="Vehicle Make / Model" placeholder="e.g. Toyota Corolla 2022" value={purpose} onChangeText={setPurpose} />
                    <FormInput label="Guarantor 1 (Member ID)" placeholder="e.g. FAAN-2019-0218" value={guarantor1} onChangeText={setGuarantor1} />
                    <FormInput label="Guarantor 2 (Member ID)" placeholder="e.g. FAAN-2020-0145" value={guarantor2} onChangeText={setGuarantor2} />
                    <FormInput label="Additional Notes" placeholder="New or used vehicle, logbook status…" multiline numberOfLines={3} value={notes} onChangeText={setNotes} />
                  </View>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <Button variant="view" label="Clear" onPress={() => { setAmount(''); setPurpose(''); setGuarantor1(''); setGuarantor2(''); setNotes(''); setTenure(''); }} />
                  <Button
                    variant="primary"
                    label={isSubmitting ? 'Submitting…' : 'Submit →'}
                    disabled={isSubmitting}
                    onPress={handleSubmit}
                  />
                </View>
              </CardBody>
            </Card>
          )}
        </ScrollView>
      )}
    </View>
  );
}

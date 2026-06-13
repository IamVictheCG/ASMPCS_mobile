import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenError } from '../../src/components/ScreenError';
import { ChartBars } from '../../src/components/ChartBars';
import { Badge } from '../../src/components/ui/Badge';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { InfoRow } from '../../src/components/FormInput';
import { useContributionBars } from '../../src/hooks/useMemberStats';
import { useSavings } from '../../src/hooks/useSavings';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Gradients, Radii } from '../../src/theme/tokens';

function SavingsSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Skeleton height={160} borderRadius={16} style={{ marginBottom: 16 }} />
      <Skeleton height={140} borderRadius={12} style={{ marginBottom: 16 }} />
      <Skeleton height={220} borderRadius={12} style={{ marginBottom: 16 }} />
      <Skeleton height={220} borderRadius={12} style={{ marginBottom: 16 }} />
      <Skeleton width={200} height={18} style={{ marginBottom: 16 }} />
      <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' }}>
        <Skeleton height={44} borderRadius={0} />
        {[...Array(5)].map((_, i) => (
          <View key={i} style={{ padding: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' }}>
            <Skeleton width="80%" height={14} style={{ marginBottom: 6 }} />
            <Skeleton width="60%" height={12} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function MemberSavings() {
  const { summary: summaryQuery, statement: statementQuery } = useSavings();
  const barsQuery = useContributionBars();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const isLoading = summaryQuery.isLoading || statementQuery.isLoading || barsQuery.isLoading;
  const isError = summaryQuery.isError || statementQuery.isError || barsQuery.isError;

  const handleRetry = () => {
    if (summaryQuery.isError) summaryQuery.refetch();
    if (statementQuery.isError) statementQuery.refetch();
    if (barsQuery.isError) barsQuery.refetch();
  };

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([summaryQuery.refetch(), statementQuery.refetch(), barsQuery.refetch()]);
    setRefreshing(false);
  }

  const s = summaryQuery.data;
  const rows = statementQuery.data ?? [];
  const bars = barsQuery.data ?? [];

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="My Savings" onNotifPress={() => router.push('/(member)/notifications' as any)} />
      {isLoading ? (
        <SavingsSkeleton />
      ) : isError ? (
        <ScreenError onRetry={handleRetry} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.mint} />}
        >
          {/* Balance hero */}
          <LinearGradient
            colors={Gradients.balanceHero as [string, string]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ borderWidth: 1, borderColor: 'rgba(0,198,216,0.20)', borderRadius: 16, padding: 24, marginBottom: 16 }}
          >
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>
              Total Savings Balance
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: Fonts.playfair, fontSize: 20, color: Colors.mint, marginRight: 3 }}>₦</Text>
              <Text style={{ fontFamily: Fonts.playfair, fontSize: 28, color: Colors.white, fontWeight: '700', letterSpacing: -0.5 }}>
                {s?.totalBalance?.replace('₦', '') ?? '1,248,500.00'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
              {[
                { label: 'Monthly Deduction', val: s?.monthlyDeduction ?? '₦55,000',     color: Colors.white  },
                { label: 'YTD Savings',        val: s?.ytdSavings        ?? '+₦275,000 ↑', color: Colors.green2 },
                { label: 'Projected Year-End', val: s?.projectedYearEnd  ?? '₦1,633,500', color: Colors.white  },
                { label: 'Member Since',        val: s?.memberSince       ?? 'Jan 2021',    color: Colors.white  },
              ].map((item) => (
                <View key={item.label} style={{ minWidth: '40%' }}>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted }}>{item.label}</Text>
                  <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 14, color: item.color, marginTop: 2 }}>{item.val}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Contribution bar chart */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader title="Monthly Contributions (2026)" subtitle="Payroll deductions · Gold = additional" />
            <CardBody>
              {bars.length > 0 ? (
                <ChartBars data={bars} height={110} />
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <Text style={{ fontSize: 28 }}>📊</Text>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted, marginTop: 6 }}>No contribution data</Text>
                </View>
              )}
            </CardBody>
          </Card>

          {/* Investment Summary */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader title="Investment Summary" />
            <CardBody>
              <InfoRow label="Principal Savings"    value={s?.principalSavings ?? '₦1,083,500'} valueMono />
              <InfoRow label="Investment Fund"       value={s?.investmentFund   ?? '₦165,000'}   valueMono />
              <InfoRow label="Total Dividend (2025)" value={s?.totalDividend2025 ?? '₦87,395'}    valueColor={Colors.green2} valueMono />
              <InfoRow label="Max Loan Eligibility"  value={s?.maxLoanEligibility ?? '₦24,970,000'} valueColor={Colors.mint} valueMono />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 }}>
                <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.sm, color: Colors.muted }}>Account Status</Text>
                <Badge variant="active" label="Active" />
              </View>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader title="Quick Actions" />
            <CardBody>
              <View style={{ gap: 10 }}>
                {[
                  { label: '📥 Download Statement (PDF)', onPress: () => {} },
                  { label: '➕ Make Additional Deposit',   onPress: () => {} },
                  { label: '📧 Email Statement',           onPress: () => {} },
                  { label: '🏦 Apply for a Loan',          onPress: () => router.push('/(member)/loans' as any) },
                ].map((action) => (
                  <TouchableOpacity
                    key={action.label}
                    onPress={action.onPress}
                    style={{ padding: 12, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 6, alignItems: 'flex-start', minHeight: 44, justifyContent: 'center' }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 13, color: Colors.white }}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </CardBody>
          </Card>

          {/* Savings statement table */}
          <SectionTitle>Savings Statement (2026)</SectionTitle>
          <Card>
            <CardBody noPad>
              {rows.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
                      {['Date', 'Description', 'Reference', 'Credit (₦)', 'Debit (₦)', 'Balance (₦)', 'Status'].map((h) => (
                        <View key={h} style={{ width: h === 'Description' ? 180 : 120, paddingHorizontal: 14, paddingVertical: 11 }}>
                          <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                        </View>
                      ))}
                    </View>
                    {rows.map((row, i) => (
                      <View key={i} style={{ flexDirection: 'row', borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                        <View style={{ width: 120, paddingHorizontal: 14, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.muted }}>{row.date}</Text>
                        </View>
                        <View style={{ width: 180, paddingHorizontal: 14, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.white }}>{row.desc}</Text>
                        </View>
                        <View style={{ width: 120, paddingHorizontal: 14, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.muted }}>{row.ref}</Text>
                        </View>
                        <View style={{ width: 120, paddingHorizontal: 14, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.green2 }}>{row.credit}</Text>
                        </View>
                        <View style={{ width: 120, paddingHorizontal: 14, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.white }}>{row.debit}</Text>
                        </View>
                        <View style={{ width: 120, paddingHorizontal: 14, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.white }}>{row.balance}</Text>
                        </View>
                        <View style={{ width: 120, paddingHorizontal: 14, paddingVertical: 13 }}>
                          <Badge variant={row.status} label={row.status === 'credit' ? 'Credit' : 'Debit'} />
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 36, gap: 10 }}>
                  <Text style={{ fontSize: 32 }}>📄</Text>
                  <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.muted }}>No statement entries yet</Text>
                </View>
              )}
            </CardBody>
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

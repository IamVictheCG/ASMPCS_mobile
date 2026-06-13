import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory-native';
import { ScreenError } from '../../src/components/ScreenError';
import { Badge } from '../../src/components/ui/Badge';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { InfoRow } from '../../src/components/FormInput';
import { useAuth } from '../../src/context/AuthContext';
import { useSavings } from '../../src/hooks/useSavings';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Gradients } from '../../src/theme/tokens';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatMonthYear(month: number, year: number): string {
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

function formatMemberSince(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

function badgeVariant(status: string): 'approved' | 'pending' | 'rejected' {
  if (status === 'confirmed') return 'approved';
  if (status === 'pending') return 'pending';
  return 'rejected';
}

function badgeLabel(status: string): string {
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'pending') return 'Pending';
  return 'Reversed';
}

function SavingsSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Skeleton height={160} borderRadius={16} style={{ marginBottom: 16 }} />
      <Skeleton height={220} borderRadius={12} style={{ marginBottom: 16 }} />
      <Skeleton height={140} borderRadius={12} style={{ marginBottom: 16 }} />
      <Skeleton height={140} borderRadius={12} style={{ marginBottom: 16 }} />
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
  const { member } = useAuth();
  const savingsQuery = useSavings();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  async function onRefresh() {
    setRefreshing(true);
    await savingsQuery.refetch();
    setRefreshing(false);
  }

  const s = savingsQuery.data;
  const hasChartData = (s?.monthlyBars ?? []).some((b) => b.amount > 0);

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="My Savings" onNotifPress={() => router.push('/(member)/notifications' as any)} />
      {savingsQuery.isLoading ? (
        <SavingsSkeleton />
      ) : savingsQuery.isError ? (
        <ScreenError onRetry={() => savingsQuery.refetch()} />
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
                {(s?.totalSavings ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
              {[
                { label: 'YTD Savings', val: s ? `+${formatNaira(s.ytdSavings)} ↑` : '—', color: Colors.green2 },
                { label: 'Member Since', val: s ? formatMemberSince(s.memberSince) : '—', color: Colors.white },
              ].map((item) => (
                <View key={item.label} style={{ minWidth: '40%' }}>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted }}>{item.label}</Text>
                  <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 14, color: item.color, marginTop: 2 }}>{item.val}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Monthly contributions chart */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader title="Monthly Contributions (Last 12 Months)" subtitle="Payroll deductions · ₦ thousands" />
            <CardBody>
              {hasChartData ? (
                <VictoryChart
                  height={200}
                  domainPadding={{ x: 12 }}
                  padding={{ left: 52, top: 16, right: 16, bottom: 40 }}
                  style={{ parent: { backgroundColor: 'transparent' } }}
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: 'rgba(255,255,255,0.08)' },
                      tickLabels: { fill: Colors.muted, fontSize: 9, fontFamily: Fonts.mono },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={(t: number) => `${(t / 1000).toFixed(0)}k`}
                    style={{
                      axis: { stroke: 'rgba(255,255,255,0.08)' },
                      tickLabels: { fill: Colors.muted, fontSize: 9, fontFamily: Fonts.mono },
                      grid: { stroke: 'rgba(255,255,255,0.05)' },
                    }}
                  />
                  <VictoryBar
                    data={s?.monthlyBars ?? []}
                    x="month"
                    y="amount"
                    style={{ data: { fill: Colors.mint, width: 14 } }}
                    cornerRadius={{ top: 3 } as any}
                  />
                </VictoryChart>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 28, gap: 8 }}>
                  <Text style={{ fontSize: 32 }}>📊</Text>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted }}>
                    No contributions recorded yet
                  </Text>
                </View>
              )}
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

          {/* Contribution statement table */}
          <SectionTitle>Savings Statement</SectionTitle>
          <Card>
            <CardBody noPad>
              {(s?.statement ?? []).length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
                      {['Month / Year', 'Amount (₦)', 'Status', 'Reference'].map((h) => (
                        <View key={h} style={{ width: h === 'Reference' ? 160 : 130, paddingHorizontal: 14, paddingVertical: 11 }}>
                          <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                        </View>
                      ))}
                    </View>
                    {/* Rows */}
                    {(s?.statement ?? []).map((row, i, arr) => (
                      <View
                        key={row.id}
                        style={{ flexDirection: 'row', borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}
                      >
                        <View style={{ width: 130, paddingHorizontal: 14, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.white }}>
                            {formatMonthYear(row.month, row.year)}
                          </Text>
                        </View>
                        <View style={{ width: 130, paddingHorizontal: 14, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.green2 }}>
                            {formatNaira(row.amount)}
                          </Text>
                        </View>
                        <View style={{ width: 130, paddingHorizontal: 14, paddingVertical: 13 }}>
                          <Badge variant={badgeVariant(row.status)} label={badgeLabel(row.status)} />
                        </View>
                        <View style={{ width: 160, paddingHorizontal: 14, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.muted }}>
                            {row.referenceNumber ?? '—'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 36, gap: 10 }}>
                  <Text style={{ fontSize: 32 }}>📄</Text>
                  <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.muted }}>
                    No contributions recorded yet
                  </Text>
                </View>
              )}
            </CardBody>
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenError } from '../../src/components/ScreenError';
import { ChartBars } from '../../src/components/ChartBars';
import { TransactionList } from '../../src/components/TransactionList';
import type { Transaction } from '../../src/components/TransactionList';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { StatCard } from '../../src/components/ui/StatCard';
import { useMemberData } from '../../src/hooks/useMemberData';
import type { RecentContribution } from '../../src/hooks/useMemberData';
import { useAuth } from '../../src/context/AuthContext';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize } from '../../src/theme/tokens';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function todayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function contributionToTransaction(c: RecentContribution): Transaction {
  const label = `${MONTHS[c.month - 1]} ${c.year}`;
  const method = c.paymentMethod.replace(/_/g, ' ');
  const date = new Date(c.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  return {
    icon: '💰',
    iconColor: 'green',
    title: `Monthly Savings – ${label}`,
    sub: `${method} · ${date}`,
    amount: `+${formatNaira(c.amount)}`,
    type: 'credit',
  };
}

function DashboardSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={{ marginBottom: 20, gap: 10 }}>
        <Skeleton width="55%" height={26} />
        <Skeleton width="45%" height={14} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        {[...Array(4)].map((_, i) => (
          <View key={i} style={{ width: '47%', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, gap: 10 }}>
            <Skeleton width={36} height={36} borderRadius={8} />
            <Skeleton width="65%" height={20} />
            <Skeleton width="85%" height={12} />
          </View>
        ))}
      </View>
      <Skeleton style={{ marginBottom: 16 }} height={180} borderRadius={12} />
      <Skeleton height={180} borderRadius={12} style={{ marginBottom: 20 }} />
      <Skeleton width={180} height={18} style={{ marginBottom: 16 }} />
      <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, gap: 16 }}>
        {[...Array(5)].map((_, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <View style={{ flex: 1, gap: 7 }}>
              <Skeleton width="70%" height={14} />
              <Skeleton width="45%" height={11} />
            </View>
            <Skeleton width={80} height={14} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function MemberDashboard() {
  const { member } = useAuth();
  const dataQuery = useMemberData();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  async function onRefresh() {
    setRefreshing(true);
    await dataQuery.refetch();
    setRefreshing(false);
  }

  const d = dataQuery.data;
  const firstName = member?.full_name?.split(' ')[0] ?? '';
  const today = todayLabel();

  // Build stat cards from real data
  const stats = d
    ? [
        {
          icon: '💰',
          value: formatNaira(d.savingsBalance),
          label: 'Total Savings Balance',
          change: 'Updated just now',
          changeDir: 'up' as const,
          variant: 'blue' as const,
        },
        {
          icon: '🏦',
          value: d.activeLoan
            ? formatNaira(d.activeLoan.outstandingBalance)
            : 'No active loan',
          label: 'Active Loan Balance',
          change: d.activeLoan ? `${d.activeLoan.loanType}` : 'Clear',
          changeDir: d.activeLoan ? ('down' as const) : ('neutral' as const),
          variant: 'gold' as const,
        },
        {
          icon: '📈',
          value: d.dividendEarned != null
            ? formatNaira(d.dividendEarned)
            : 'Pending computation',
          label: `Dividend Earned (${new Date().getFullYear()})`,
          change: d.dividendEarned != null ? 'Current year' : 'Not yet declared',
          changeDir: 'up' as const,
          variant: 'green' as const,
        },
        {
          icon: '🛒',
          value: d.commodityCredit > 0 ? formatNaira(d.commodityCredit) : '₦0.00',
          label: 'Commodity Credit Used',
          change: 'Pending orders',
          changeDir: 'up' as const,
          variant: 'red' as const,
        },
      ]
    : [];

  const loan = d?.activeLoan ?? null;
  const percentRepaid = loan && loan.totalRepayable > 0
    ? Math.round((loan.amountRepaid / loan.totalRepayable) * 100)
    : 0;
  const monthsRemaining = loan && loan.monthlyInstallment > 0
    ? Math.ceil(loan.outstandingBalance / loan.monthlyInstallment)
    : 0;

  const recentTxns = (d?.recentContributions ?? []).map(contributionToTransaction);

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar
        title="Dashboard"
        onNotifPress={() => router.push('/(member)/notifications' as any)}
      />
      {dataQuery.isLoading ? (
        <DashboardSkeleton />
      ) : dataQuery.isError ? (
        <ScreenError onRetry={() => dataQuery.refetch()} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.mint} />}
        >
          {/* Greeting */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: Fonts.playfair, fontSize: 24, color: Colors.white }}>
              {getGreeting()},{' '}
              <Text style={{ color: Colors.mint }}>{firstName}</Text> 👋
            </Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 4 }}>
              {today}
            </Text>
          </View>

          {/* Stats grid — 2 per row */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            {stats.map((s, i) => (
              <View key={i} style={{ width: '47%' }}>
                <StatCard {...s} />
              </View>
            ))}
          </View>

          {/* Monthly contributions chart */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader
              title={`Monthly Contributions (${new Date().getFullYear()})`}
              actionLabel="View →"
              onAction={() => router.push('/(member)/savings' as any)}
            />
            <CardBody>
              {d && d.monthlyBars.some((b) => b.heightPct > 0) ? (
                <>
                  <ChartBars data={d.monthlyBars} height={100} />
                  <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, textAlign: 'right', marginTop: 8 }}>
                    Last 12 months · payroll deductions
                  </Text>
                </>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 20, gap: 6 }}>
                  <Text style={{ fontSize: 28 }}>📊</Text>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted }}>
                    No contributions recorded yet
                  </Text>
                </View>
              )}
            </CardBody>
          </Card>

          {/* Loan repayment progress */}
          <Card style={{ marginBottom: 20 }}>
            <CardHeader
              title="Loan Repayment"
              actionLabel="Manage →"
              onAction={() => router.push('/(member)/loans' as any)}
            />
            <CardBody>
              {loan ? (
                <View style={{ gap: 14 }}>
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 12, color: Colors.white }}>
                        {loan.loanType}
                      </Text>
                      <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.muted }}>
                        {formatNaira(loan.outstandingBalance)} / {formatNaira(loan.amountApproved)}
                      </Text>
                    </View>
                    <ProgressBar percent={percentRepaid} variant="teal" />
                    <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginTop: 4 }}>
                      {percentRepaid}% repaid · {monthsRemaining} months remaining
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
                  <Text style={{ fontSize: 32 }}>🏦</Text>
                  <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.muted }}>
                    No active loan
                  </Text>
                </View>
              )}
            </CardBody>
          </Card>

          {/* Recent transactions */}
          <SectionTitle>Recent Transactions</SectionTitle>
          <Card>
            <CardBody>
              {recentTxns.length > 0 ? (
                <TransactionList items={recentTxns} />
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
                  <Text style={{ fontSize: 32 }}>💳</Text>
                  <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.muted }}>
                    No transactions yet
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

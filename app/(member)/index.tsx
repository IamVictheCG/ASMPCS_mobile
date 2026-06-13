import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenError } from '../../src/components/ScreenError';
import { ChartBars } from '../../src/components/ChartBars';
import { TransactionList } from '../../src/components/TransactionList';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { StatCard } from '../../src/components/ui/StatCard';
import { useContributionBars, useMemberStats } from '../../src/hooks/useMemberStats';
import { useLoanStatus } from '../../src/hooks/useLoanStatus';
import { useMemberProfile } from '../../src/hooks/useMemberProfile';
import { useTransactions } from '../../src/hooks/useTransactions';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize } from '../../src/theme/tokens';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function todayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
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
  const profileQuery = useMemberProfile();
  const statsQuery = useMemberStats();
  const barsQuery = useContributionBars();
  const transactionsQuery = useTransactions();
  const loanQuery = useLoanStatus();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const isLoading = profileQuery.isLoading || statsQuery.isLoading || barsQuery.isLoading || transactionsQuery.isLoading;
  const isError = profileQuery.isError || statsQuery.isError || barsQuery.isError || transactionsQuery.isError;

  const handleRetry = () => {
    if (profileQuery.isError) profileQuery.refetch();
    if (statsQuery.isError) statsQuery.refetch();
    if (barsQuery.isError) barsQuery.refetch();
    if (transactionsQuery.isError) transactionsQuery.refetch();
    if (loanQuery.isError) loanQuery.refetch();
  };

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([
      profileQuery.refetch(),
      statsQuery.refetch(),
      barsQuery.refetch(),
      transactionsQuery.refetch(),
      loanQuery.refetch(),
    ]);
    setRefreshing(false);
  }

  const recentTxns = (transactionsQuery.data ?? []).slice(0, 5);
  const loan = loanQuery.data;
  const today = todayLabel();

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar
        title="Dashboard"
        onNotifPress={() => router.push('/(member)/notifications' as any)}
      />
      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <ScreenError onRetry={handleRetry} />
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
              Good Morning, <Text style={{ color: Colors.mint }}>{profileQuery.data?.firstName ?? ''}</Text> 👋
            </Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 4 }}>
              {today}
            </Text>
          </View>

          {/* Stats grid — 2 per row */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            {(statsQuery.data ?? []).map((s, i) => (
              <View key={i} style={{ width: '47%' }}>
                <StatCard {...s} />
              </View>
            ))}
          </View>

          {/* Monthly contributions chart */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader
              title="Monthly Contributions (2026)"
              actionLabel="View →"
              onAction={() => router.push('/(member)/savings' as any)}
            />
            <CardBody>
              <ChartBars data={barsQuery.data ?? []} height={100} />
              <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, textAlign: 'right', marginTop: 8 }}>
                ₦55,000/month · Gold = additional deposit
              </Text>
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
                      <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 12, color: Colors.white }}>{loan.type}</Text>
                      <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted }}>
                        {loan.outstanding} / {loan.originalAmount}
                      </Text>
                    </View>
                    <ProgressBar percent={loan.percentRepaid} variant="teal" />
                    <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginTop: 4 }}>
                      {loan.percentRepaid}% repaid · {loan.monthsRemaining} months left
                    </Text>
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 12, color: Colors.white }}>Loan Eligibility</Text>
                      <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted }}>Ready</Text>
                    </View>
                    <ProgressBar percent={90} variant="gold" />
                    <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.green2, marginTop: 4 }}>
                      ✓ 5 years · ✓ {loan.percentRepaid}%+ repaid · ✓ Good standing
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
                  <Text style={{ fontSize: 32 }}>🏦</Text>
                  <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.muted }}>No active loan</Text>
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
                  <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.muted }}>No transactions yet</Text>
                </View>
              )}
            </CardBody>
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

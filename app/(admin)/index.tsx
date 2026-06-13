import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenError } from '../../src/components/ScreenError';
import { ActivityFeed } from '../../src/components/ActivityFeed';
import { ChartBars } from '../../src/components/ChartBars';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { StatCard } from '../../src/components/ui/StatCard';
import { useAuth } from '../../src/context/AuthContext';
import { useAdminStats } from '../../src/hooks/useAdminStats';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Radii, Surfaces } from '../../src/theme/tokens';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function todayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const PIPELINE_COLORS: Record<string, string> = {
  pending:  Colors.gold,
  review:   Colors.mint,
  approved: Colors.green2,
  rejected: Colors.red2,
};

function AdminDashboardSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={{ marginBottom: 20, gap: 8 }}>
        <Skeleton width="50%" height={26} />
        <Skeleton width="40%" height={14} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {[...Array(4)].map((_, i) => (
          <View key={i} style={{ width: '47%', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, gap: 10 }}>
            <Skeleton width={36} height={36} borderRadius={8} />
            <Skeleton width="65%" height={20} />
            <Skeleton width="85%" height={12} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} style={{ flex: 1 }} height={68} borderRadius={Radii.md} />
        ))}
      </View>
      <Skeleton style={{ marginBottom: 14 }} height={180} borderRadius={12} />
      <Skeleton height={180} borderRadius={12} style={{ marginBottom: 20 }} />
      <Skeleton width={130} height={18} style={{ marginBottom: 14 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} style={{ width: '47%' }} height={100} borderRadius={Radii.md} />
        ))}
      </View>
      <Skeleton width={200} height={18} style={{ marginBottom: 14 }} />
      <Skeleton height={220} borderRadius={12} />
    </ScrollView>
  );
}

export default function AdminDashboard() {
  const { displayName } = useAuth();
  const firstName = displayName?.split(' ')[0] ?? 'Admin';
  const { stats, quickStats, collectionBars, activityFeed, recentDecisions, loanPipeline } = useAdminStats();
  const insets = useSafeAreaInsets();

  const isLoading = stats.isLoading || quickStats.isLoading || collectionBars.isLoading || activityFeed.isLoading || recentDecisions.isLoading || loanPipeline.isLoading;
  const isError = stats.isError || quickStats.isError || collectionBars.isError || activityFeed.isError || recentDecisions.isError || loanPipeline.isError;

  const handleRetry = () => {
    if (stats.isError) stats.refetch();
    if (quickStats.isError) quickStats.refetch();
    if (collectionBars.isError) collectionBars.refetch();
    if (activityFeed.isError) activityFeed.refetch();
    if (recentDecisions.isError) recentDecisions.refetch();
    if (loanPipeline.isError) loanPipeline.refetch();
  };

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar
        title="Admin Dashboard"
        portal="admin"
        onNotifPress={() => {}}
      />
      {isLoading ? (
        <AdminDashboardSkeleton />
      ) : isError ? (
        <ScreenError onRetry={handleRetry} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 + insets.bottom }} showsVerticalScrollIndicator={false}>

          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontFamily: Fonts.playfair, fontSize: 22, color: Colors.white, fontWeight: '700' }}>
              {`Good Morning, `}<Text style={{ color: Colors.red2 }}>{firstName}</Text>{` 👋`}
            </Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 4 }}>
              {todayLabel()}
            </Text>
          </View>

          {/* Main stats — 2 per row */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            {(stats.data ?? []).map((s, i) => (
              <View key={i} style={{ width: '47%' }}>
                <StatCard {...s} />
              </View>
            ))}
          </View>

          {/* Quick stats strip */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            {(quickStats.data ?? []).map((qs) => (
              <View
                key={qs.label}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Surfaces.cardBg, borderWidth: 1, borderColor: Surfaces.cardBorder, borderRadius: Radii.md, padding: 12 }}
              >
                <Text style={{ fontSize: 18 }}>{qs.icon}</Text>
                <View>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: 18, color: Colors.white, fontWeight: '700' }}>{qs.value}</Text>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: 10, color: Colors.muted }}>{qs.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Chart */}
          <Card style={{ marginBottom: 14 }}>
            <CardHeader title="Monthly Collections vs Disbursements" actionLabel="Report →" onAction={() => {}} />
            <CardBody>
              <ChartBars data={collectionBars.data ?? []} height={110} />
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: Colors.mint }} />
                  <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted }}>Savings</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: Colors.gold }} />
                  <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted }}>Disbursements</Text>
                </View>
              </View>
            </CardBody>
          </Card>

          {/* Activity feed */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader title="Live Activity Feed" actionLabel="View All →" onAction={() => {}} />
            <CardBody>
              <ActivityFeed items={(activityFeed.data ?? []).slice(0, 5)} />
            </CardBody>
          </Card>

          {/* Loan pipeline — 2 per row */}
          <SectionTitle>Loan Pipeline</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            {(loanPipeline.data ?? []).map((stage) => (
              <View
                key={stage.label}
                style={{ width: '47%', backgroundColor: Surfaces.cardBg, borderWidth: 1, borderColor: Surfaces.cardBorder, borderRadius: Radii.md, padding: 16 }}
              >
                <Text style={{ fontFamily: Fonts.mono, fontSize: 28, color: PIPELINE_COLORS[stage.variant], fontWeight: '700' }}>{stage.count}</Text>
                <Text style={{ fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.white, marginTop: 5 }}>{stage.label}</Text>
                <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginTop: 3 }}>{stage.val}</Text>
              </View>
            ))}
          </View>

          {/* Recent decisions */}
          <SectionTitle>Recent Loan Decisions</SectionTitle>
          <Card>
            <CardBody noPad>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
                    {['Member', 'Amount', 'Type', 'Status', 'Date', ''].map((h) => (
                      <View key={h} style={{ width: h === '' ? 80 : h === 'Member' ? 140 : 110, paddingHorizontal: 14, paddingVertical: 11 }}>
                        <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                      </View>
                    ))}
                  </View>
                  {(recentDecisions.data ?? []).map((row, i) => {
                    const all = recentDecisions.data ?? [];
                    return (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: i < all.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                        <View style={{ width: 140, paddingHorizontal: 14, paddingVertical: 12 }}>
                          <Text style={{ fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.white }}>{row.member}</Text>
                        </View>
                        <View style={{ width: 110, paddingHorizontal: 14, paddingVertical: 12 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 13, color: Colors.mint }}>{row.amount}</Text>
                        </View>
                        <View style={{ width: 110, paddingHorizontal: 14, paddingVertical: 12 }}>
                          <Text style={{ fontFamily: Fonts.sans, fontSize: 13, color: Colors.white }}>{row.type}</Text>
                        </View>
                        <View style={{ width: 110, paddingHorizontal: 14, paddingVertical: 12 }}>
                          <Badge variant={row.status} label={row.status.charAt(0).toUpperCase() + row.status.slice(1)} />
                        </View>
                        <View style={{ width: 110, paddingHorizontal: 14, paddingVertical: 12 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.muted }}>{row.date}</Text>
                        </View>
                        <View style={{ width: 80, paddingHorizontal: 14, paddingVertical: 10 }}>
                          <Button variant="view" label="View" onPress={() => router.push('/(admin)/loans' as any)} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </CardBody>
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

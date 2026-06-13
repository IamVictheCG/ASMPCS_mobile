import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { ScreenError } from '../../src/components/ScreenError';
import { ChartBars } from '../../src/components/ChartBars';
import { DataTable, Pagination } from '../../src/components/DataTable';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { StatCard } from '../../src/components/ui/StatCard';
import { useContributions } from '../../src/hooks/useContributions';
import { useCollectionBars } from '../../src/hooks/useAdminStats';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Radii } from '../../src/theme/tokens';

const PER_PAGE = 5;

function ContributionsSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 28 }}>
        {[...Array(4)].map((_, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 18, gap: 10 }}>
            <Skeleton width={36} height={36} borderRadius={8} />
            <Skeleton width="65%" height={22} />
            <Skeleton width="85%" height={12} />
          </View>
        ))}
      </View>
      <Skeleton height={180} borderRadius={12} style={{ marginBottom: 28 }} />
      <Skeleton height={320} borderRadius={12} />
    </ScrollView>
  );
}

export default function AdminContributions() {
  const { stats: statsQuery, rows: rowsQuery } = useContributions();
  const barsQuery = useCollectionBars();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const isLoading = statsQuery.isLoading || rowsQuery.isLoading || barsQuery.isLoading;
  const isError   = statsQuery.isError   || rowsQuery.isError   || barsQuery.isError;
  const handleRetry = () => {
    if (statsQuery.isError) statsQuery.refetch();
    if (rowsQuery.isError)  rowsQuery.refetch();
    if (barsQuery.isError)  barsQuery.refetch();
  };

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([statsQuery.refetch(), rowsQuery.refetch(), barsQuery.refetch()]);
    setRefreshing(false);
  }

  const allRows  = rowsQuery.data ?? [];
  const filtered = allRows.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const pages      = Array.from({ length: totalPages }, (_, i) => i + 1);

  function onSearch(v: string) { setSearch(v); setPage(1); }

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Contributions" subtitle="Monitor member savings and payroll deductions" portal="admin" onNotifPress={() => {}} />
      {isLoading ? (
        <ContributionsSkeleton />
      ) : isError ? (
        <ScreenError onRetry={handleRetry} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.red2} />}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            {(statsQuery.data ?? []).map((s, i) => (
              <View key={i} style={{ width: '47%' }}>
                <StatCard {...s} />
              </View>
            ))}
          </View>

          <Card style={{ marginBottom: 28 }}>
            <CardHeader title="Monthly Savings Collections (2026)" subtitle="Teal = savings collected · Gold = loan disbursements" actionLabel="Export →" onAction={() => {}} />
            <CardBody>
              <ChartBars data={barsQuery.data ?? []} height={120} />
            </CardBody>
          </Card>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 20 }}>
            <TextInput
              value={search}
              onChangeText={onSearch}
              placeholder="Search by member name or ID…"
              placeholderTextColor={Colors.muted}
              style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: Radii.sm, paddingHorizontal: 14, paddingVertical: 10, fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white }}
            />
            <Button variant="view" label="Export CSV" onPress={() => {}} />
          </View>

          <SectionTitle portal="admin">{`May 2026 Contributions (${filtered.length})`}</SectionTitle>
          <Card>
            <CardBody noPad>
              <DataTable
                columns={[
                  { key: 'id',      label: 'Member ID',      mono: true,  color: Colors.red2,   flex: 1.4 },
                  { key: 'name',    label: 'Full Name',                                          flex: 1.4 },
                  { key: 'dept',    label: 'Department',      color: Colors.muted,               flex: 1.5 },
                  { key: 'month',   label: 'Period',          mono: true,  color: Colors.muted,  flex: 1 },
                  { key: 'amount',  label: 'Amount',          mono: true,                        flex: 1,
                    renderCell: (v: string, row: any) => (
                      <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: row.status === 'credit' ? Colors.green2 : Colors.red2, fontWeight: '700' }}>{v}</Text>
                    ),
                  },
                  { key: 'type',    label: 'Type',            flex: 1 },
                  { key: 'balance', label: 'Running Balance', mono: true, flex: 1.3 },
                  { key: 'status',  label: 'Status',          flex: 1,
                    renderCell: (v: string) => <Badge variant={v as 'credit' | 'debit'} label={v === 'credit' ? 'Processed' : 'Failed'} />,
                  },
                ]}
                data={pageRows}
              />
              <Pagination
                info={`Showing ${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, filtered.length)} of ${filtered.length}`}
                pages={pages}
                current={safePage}
                onPage={setPage}
                portal="admin"
              />
            </CardBody>
          </Card>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

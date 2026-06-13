import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { ScreenError } from '../../src/components/ScreenError';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody } from '../../src/components/ui/Card';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { useLoanHistory } from '../../src/hooks/useLoanHistory';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Radii } from '../../src/theme/tokens';

const COLS = ['Loan ID', 'Member', 'Type', 'Amount', 'Interest', 'Approved By', 'Disbursed', 'Outstanding', 'Status', ''];

function LoanHistorySkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <Skeleton style={{ flex: 1 }} height={40} borderRadius={Radii.sm} />
        <Skeleton width={140} height={40} borderRadius={Radii.sm} />
        <Skeleton width={120} height={40} borderRadius={Radii.sm} />
      </View>
      <Skeleton width={200} height={18} style={{ marginBottom: 16 }} />
      <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' }}>
        <Skeleton height={44} borderRadius={0} />
        {[...Array(7)].map((_, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' }}>
            {[120, 150, 110, 110, 100, 140, 110, 130, 110, 70].map((w, j) => (
              <Skeleton key={String(j)} width={w} height={14} />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function AdminLoanHistory() {
  const { data, isLoading, isError, refetch } = useLoanHistory();
  const [search, setSearch] = useState('');

  const allRows = data ?? [];
  const filtered = allRows.filter((row) =>
    !search || row.member.toLowerCase().includes(search.toLowerCase()) || row.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Loan History" subtitle="Complete record of all loan decisions" portal="admin" notifDot onNotifPress={() => {}} />
      {isLoading ? (
        <LoanHistorySkeleton />
      ) : isError ? (
        <ScreenError onRetry={refetch} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 24 }}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by member name or loan ID…"
              placeholderTextColor={Colors.muted}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.07)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
                borderRadius: Radii.sm,
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontFamily: Fonts.sans,
                fontSize: FontSize.base,
                color: Colors.white,
              }}
            />
            <Button variant="view" label="Filter by Status" />
            <Button variant="view" label="Export CSV" />
          </View>

          <SectionTitle>{`All Loan Records (${filtered.length})`}</SectionTitle>
          <Card>
            <CardBody noPad>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
                    {COLS.map((h) => {
                      const w = h === '' ? 80 : h === 'Member' ? 160 : h === 'Loan ID' ? 130 : h === 'Approved By' ? 150 : h === 'Outstanding' ? 140 : 120;
                      return (
                        <View key={h + '_h'} style={{ width: w, paddingHorizontal: 16, paddingVertical: 11 }}>
                          <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                        </View>
                      );
                    })}
                  </View>

                  {filtered.map((row, i) => (
                    <View key={row.id} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: i < filtered.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                      <View style={{ width: 130, paddingHorizontal: 16, paddingVertical: 13 }}>
                        <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.mint }}>{row.id}</Text>
                      </View>
                      <View style={{ width: 160, paddingHorizontal: 16, paddingVertical: 13 }}>
                        <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.white }}>{row.member}</Text>
                      </View>
                      <View style={{ width: 120, paddingHorizontal: 16, paddingVertical: 13 }}>
                        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white }}>{row.type}</Text>
                      </View>
                      <View style={{ width: 120, paddingHorizontal: 16, paddingVertical: 13 }}>
                        <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.gold, fontWeight: '700' }}>{row.amount}</Text>
                      </View>
                      <View style={{ width: 120, paddingHorizontal: 16, paddingVertical: 13 }}>
                        <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.white }}>{row.interest}</Text>
                      </View>
                      <View style={{ width: 150, paddingHorizontal: 16, paddingVertical: 13 }}>
                        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>{row.approvedBy}</Text>
                      </View>
                      <View style={{ width: 120, paddingHorizontal: 16, paddingVertical: 13 }}>
                        <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.muted }}>{row.disbursed}</Text>
                      </View>
                      <View style={{ width: 140, paddingHorizontal: 16, paddingVertical: 13 }}>
                        <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: row.outstanding === '₦0' || row.outstanding === '—' ? Colors.muted : Colors.red2 }}>{row.outstanding}</Text>
                      </View>
                      <View style={{ width: 120, paddingHorizontal: 16, paddingVertical: 13 }}>
                        <Badge variant={row.status} label={row.status.charAt(0).toUpperCase() + row.status.slice(1)} />
                      </View>
                      <View style={{ width: 80, paddingHorizontal: 16, paddingVertical: 10 }}>
                        <Button variant="view" label="View" />
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </CardBody>
          </Card>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

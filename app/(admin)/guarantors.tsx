import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenError } from '../../src/components/ScreenError';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody } from '../../src/components/ui/Card';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { StatCard } from '../../src/components/ui/StatCard';
import { useAdminGuarantors } from '../../src/hooks/useAdminGuarantors';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Radii } from '../../src/theme/tokens';

function GuarantorsSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 28 }}>
        {[...Array(3)].map((_, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 18, gap: 10 }}>
            <Skeleton width={36} height={36} borderRadius={8} />
            <Skeleton width="65%" height={22} />
            <Skeleton width="80%" height={12} />
          </View>
        ))}
      </View>
      <Skeleton width={250} height={18} style={{ marginBottom: 16 }} />
      <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' }}>
        <Skeleton height={44} borderRadius={0} />
        {[...Array(3)].map((_, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, padding: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' }}>
            {[120, 150, 120, 150, 100, 90, 160].map((w, j) => (
              <Skeleton key={String(j)} width={w} height={14} />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function AdminGuarantors() {
  const { stats: statsQuery, pending: pendingQuery } = useAdminGuarantors();

  const isLoading = statsQuery.isLoading || pendingQuery.isLoading;
  const isError = statsQuery.isError || pendingQuery.isError;
  const handleRetry = () => {
    if (statsQuery.isError) statsQuery.refetch();
    if (pendingQuery.isError) pendingQuery.refetch();
  };

  const pendingGuarantors = pendingQuery.data ?? [];

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Guarantors" subtitle="Manage guarantor consents and active agreements" portal="admin" notifDot onNotifPress={() => {}} />
      {isLoading ? (
        <GuarantorsSkeleton />
      ) : isError ? (
        <ScreenError onRetry={handleRetry} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            {(statsQuery.data ?? []).map((s, i) => (
              <View key={i} style={{ width: '47%' }}>
                <StatCard {...s} />
              </View>
            ))}
          </View>

          <SectionTitle>{`Pending Guarantor Consents (${pendingGuarantors.length})`}</SectionTitle>
          <Card>
            <CardBody noPad>
              <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
                {['Loan ID', 'Applicant', 'Loan Amount', 'Guarantor', 'Requested', 'Pending', 'Actions'].map((h) => (
                  <View key={h} style={{ flex: h === 'Actions' ? 1.5 : 1, paddingHorizontal: 18, paddingVertical: 11 }}>
                    <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                  </View>
                ))}
              </View>
              {pendingGuarantors.map((row, i) => (
                <View key={row.loanId} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: i < pendingGuarantors.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                  <View style={{ flex: 1, paddingHorizontal: 18, paddingVertical: 13 }}>
                    <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.mint }}>{row.loanId}</Text>
                  </View>
                  <View style={{ flex: 1, paddingHorizontal: 18, paddingVertical: 13 }}>
                    <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.white }}>{row.applicant}</Text>
                  </View>
                  <View style={{ flex: 1, paddingHorizontal: 18, paddingVertical: 13 }}>
                    <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.gold, fontWeight: '700' }}>{row.amount}</Text>
                  </View>
                  <View style={{ flex: 1, paddingHorizontal: 18, paddingVertical: 13 }}>
                    <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white }}>{row.guarantor}</Text>
                  </View>
                  <View style={{ flex: 1, paddingHorizontal: 18, paddingVertical: 13 }}>
                    <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.muted }}>{row.requested}</Text>
                  </View>
                  <View style={{ flex: 1, paddingHorizontal: 18, paddingVertical: 13 }}>
                    <Badge variant="pending" label={row.daysPending} />
                  </View>
                  <View style={{ flex: 1.5, paddingHorizontal: 18, paddingVertical: 10, flexDirection: 'row', gap: 8 }}>
                    <Button variant="view"    label="Details" />
                    <Button variant="approve" label="Remind"  />
                  </View>
                </View>
              ))}
            </CardBody>
          </Card>

          <View style={{ marginTop: 24, backgroundColor: 'rgba(232,160,32,0.08)', borderWidth: 1, borderColor: 'rgba(232,160,32,0.25)', borderRadius: Radii.md, padding: 20 }}>
            <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.md, color: Colors.gold2, marginBottom: 6 }}>⚠️ Policy Reminder</Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted, lineHeight: 20 }}>
              Per ASMPCS bye-laws, all loan applications above ₦20,000 require two (2) guarantors who are active members in good standing. Guarantors must provide written or digital consent within 7 days of request. Failure to secure guarantor consent will result in automatic loan rejection.
            </Text>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

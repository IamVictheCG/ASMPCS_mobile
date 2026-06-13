import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { ScreenError } from '../../src/components/ScreenError';
import { Badge } from '../../src/components/ui/Badge';
import { Card, CardBody } from '../../src/components/ui/Card';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { useAuditLog } from '../../src/hooks/useAuditLog';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Radii } from '../../src/theme/tokens';

const ACTION_COLORS: Record<string, string> = {
  LOAN_APPROVED:    Colors.green2,
  LOAN_REJECTED:    Colors.red2,
  SETTINGS_SAVED:   Colors.gold,
  MEMBER_UPDATED:   Colors.sky,
  LOAN_PARAMS_SAVED: Colors.gold,
};

const ACTION_LABELS: Record<string, string> = {
  LOAN_APPROVED:    'Loan Approved',
  LOAN_REJECTED:    'Loan Rejected',
  SETTINGS_SAVED:   'Settings Saved',
  MEMBER_UPDATED:   'Member Updated',
  LOAN_PARAMS_SAVED: 'Params Saved',
};

function ACTION_BADGE_VARIANT(type: string): 'approved' | 'rejected' | 'pending' | 'active' {
  if (type === 'LOAN_APPROVED') return 'approved';
  if (type === 'LOAN_REJECTED') return 'rejected';
  if (type === 'MEMBER_UPDATED') return 'active';
  return 'pending';
}

function AuditSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' }}>
        <Skeleton height={44} borderRadius={0} />
        {[...Array(8)].map((_, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' }}>
            {[140, 160, 140, 130, 280].map((w, j) => <Skeleton key={j} width={w} height={14} />)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function AdminAudit() {
  const { data, isLoading, isError, refetch } = useAuditLog();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const entries = data ?? [];

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Audit Log" subtitle="Complete trail of all administrative actions" portal="admin" />
      {isLoading ? (
        <AuditSkeleton />
      ) : isError ? (
        <ScreenError onRetry={refetch} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.red2} />}
        >
          <SectionTitle portal="admin">{`Audit Trail (${entries.length} entries)`}</SectionTitle>

          {entries.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 64, gap: 12 }}>
              <Text style={{ fontSize: 48 }}>🔍</Text>
              <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['3xl'], color: Colors.white }}>No audit entries yet</Text>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted }}>Admin actions (approvals, rejections, settings changes) will appear here.</Text>
            </View>
          ) : (
            <Card>
              <CardBody noPad>
                <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
                  {['Timestamp', 'Admin', 'Action', 'Affected ID', 'Description'].map((h, i) => (
                    <View key={h} style={{ flex: i === 4 ? 2.5 : 1, paddingHorizontal: 16, paddingVertical: 11 }}>
                      <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                    </View>
                  ))}
                </View>
                {entries.map((entry, i) => (
                  <View key={entry.id} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: i < entries.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                    <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14 }}>
                      <Text style={{ fontFamily: Fonts.mono, fontSize: 11, color: Colors.muted }}>{entry.timestamp}</Text>
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14 }}>
                      <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.sm, color: Colors.white }}>{entry.adminUsername}</Text>
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14 }}>
                      <Badge variant={ACTION_BADGE_VARIANT(entry.actionType)} label={ACTION_LABELS[entry.actionType] ?? entry.actionType} />
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14 }}>
                      <Text style={{ fontFamily: Fonts.mono, fontSize: 11, color: ACTION_COLORS[entry.actionType] ?? Colors.muted }}>{entry.affectedId}</Text>
                    </View>
                    <View style={{ flex: 2.5, paddingHorizontal: 16, paddingVertical: 14 }}>
                      <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.white, lineHeight: 19 }}>{entry.description}</Text>
                    </View>
                  </View>
                ))}
              </CardBody>
            </Card>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

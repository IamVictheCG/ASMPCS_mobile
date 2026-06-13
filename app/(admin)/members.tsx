import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScreenError } from '../../src/components/ScreenError';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody } from '../../src/components/ui/Card';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { useAdminMembers } from '../../src/hooks/useAdminMembers';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Radii } from '../../src/theme/tokens';

const ZONES = ['All Zones', 'Zone A', 'Zone B'];
const MEMBER_COLS = ['Member ID', 'Full Name', 'Department', 'Zone', 'Savings', 'Active Loan', 'Joined', 'Status', 'Actions'];

function MembersSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 14, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => <Skeleton key={i} style={{ flex: 1 }} height={76} borderRadius={Radii.md} />)}
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <Skeleton style={{ flex: 1 }} height={40} borderRadius={Radii.sm} />
        <Skeleton width={200} height={40} borderRadius={Radii.sm} />
      </View>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' }}>
        <Skeleton height={44} borderRadius={0} />
        {[...Array(7)].map((_, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' }}>
            {[150, 150, 170, 120, 120, 120, 120, 110, 150].map((w, j) => <Skeleton key={j} width={w} height={14} />)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function AdminMembers() {
  const { data, isLoading, isError, refetch } = useAdminMembers();
  const [refreshing, setRefreshing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeZone, setActiveZone] = useState('All Zones');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(inputValue.trim()), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputValue]);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const allMembers = data ?? [];
  const filtered = allMembers.filter((m) => {
    const matchesSearch = !debouncedSearch ||
      m.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesZone = activeZone === 'All Zones' || m.zone === activeZone;
    return matchesSearch && matchesZone;
  });

  const CHIP_STYLE = (active: boolean) => ({
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999,
    backgroundColor: active ? 'rgba(192,57,43,0.25)' : 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: active ? Colors.red2 : 'rgba(255,255,255,0.12)',
  });

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Members" subtitle="Manage cooperative membership records" portal="admin" onNotifPress={() => {}} />
      {isLoading ? (
        <MembersSkeleton />
      ) : isError ? (
        <ScreenError onRetry={refetch} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.red2} />}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Total Members',  val: '1,247', color: Colors.red2   },
              { label: 'Active',         val: '1,224', color: Colors.green2 },
              { label: 'Overdue Loans',  val: '23',    color: Colors.gold   },
              { label: 'New This Month', val: '14',    color: Colors.white  },
            ].map((item) => (
              <View key={item.label} style={{ width: '47%', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: Radii.md, padding: 16 }}>
                <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize['3xl'], color: item.color, fontWeight: '700' }}>{item.val}</Text>
                <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginTop: 4 }}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Search by name or Staff ID… (300ms debounce)"
              placeholderTextColor={Colors.muted}
              style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: Radii.sm, paddingHorizontal: 14, paddingVertical: 10, fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white }}
            />
            <Button variant="admin-primary" label="+ Register New Member" onPress={() => router.push('/(admin)/register-member' as any)} />
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
            {ZONES.map((zone) => (
              <TouchableOpacity key={zone} style={CHIP_STYLE(activeZone === zone)} onPress={() => setActiveZone(zone)} activeOpacity={0.7}>
                <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.sm, color: activeZone === zone ? Colors.white : Colors.muted }}>{zone}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionTitle portal="admin">{`Members (${filtered.length} shown)`}</SectionTitle>
          <Card>
            <CardBody noPad>
              {filtered.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
                  <Text style={{ fontSize: 40 }}>🔍</Text>
                  <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.muted }}>No members match your search</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
                      {MEMBER_COLS.map((h) => {
                        const w = h === 'Actions' ? 160 : h === 'Full Name' ? 160 : h === 'Member ID' ? 160 : h === 'Department' ? 180 : 130;
                        return (
                          <View key={h} style={{ width: w, paddingHorizontal: 16, paddingVertical: 11 }}>
                            <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                          </View>
                        );
                      })}
                    </View>
                    {filtered.map((member, i) => (
                      <View key={member.id} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: i < filtered.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                        <View style={{ width: 160, paddingHorizontal: 16, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.red2 }}>{member.id}</Text>
                        </View>
                        <View style={{ width: 160, paddingHorizontal: 16, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.white }}>{member.name}</Text>
                        </View>
                        <View style={{ width: 180, paddingHorizontal: 16, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>{member.dept}</Text>
                        </View>
                        <View style={{ width: 130, paddingHorizontal: 16, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.white }}>{member.zone}</Text>
                        </View>
                        <View style={{ width: 130, paddingHorizontal: 16, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.green2 }}>{member.savings}</Text>
                        </View>
                        <View style={{ width: 130, paddingHorizontal: 16, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: member.loan === 'None' ? Colors.muted : Colors.gold }}>{member.loan}</Text>
                        </View>
                        <View style={{ width: 130, paddingHorizontal: 16, paddingVertical: 13 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.muted }}>{member.joined}</Text>
                        </View>
                        <View style={{ width: 130, paddingHorizontal: 16, paddingVertical: 13 }}>
                          <Badge variant={member.status === 'overdue' ? 'overdue' : 'active'} label={member.status === 'overdue' ? 'Overdue' : 'Active'} />
                        </View>
                        <View style={{ width: 160, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', gap: 8 }}>
                          <Button variant="view" label="View" onPress={() => router.push(`/(admin)/members/${member.id}` as any)} />
                          <Button variant="edit" label="Edit" onPress={() => router.push(`/(admin)/members/${member.id}` as any)} />
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </CardBody>
          </Card>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Radii, Surfaces } from '../../src/theme/tokens';

// Art. 10.2 — 6-way split (as % of distributable surplus)
const ALLOCATIONS = [
  { key: 'savings',   label: 'Savings Dividend',       desc: 'Distributed pro-rata to each member\'s savings balance',    pct: 40, color: Colors.green2 },
  { key: 'patronage', label: 'Loan Patronage Rebate',  desc: 'Distributed pro-rata to loan interest paid in the year',    pct: 25, color: Colors.gold   },
  { key: 'reserve',   label: 'Statutory Reserve Fund', desc: 'Mandatory reserve per Co-op Societies Act (10% minimum)',   pct: 15, color: Colors.red2   },
  { key: 'education', label: 'Education & Training',   desc: 'Member education programs and cooperative literacy',         pct: 10, color: Colors.mint    },
  { key: 'building',  label: 'Building Fund',          desc: 'Capital investment in society infrastructure',               pct:  5, color: Colors.sky     },
  { key: 'social',    label: 'Social & Charity Fund',  desc: 'Member welfare, benevolence, and community support',         pct:  5, color: Colors.purple  },
];

// Members with their savings balances (raw numbers for computation)
const MEMBERS_SAVINGS = [
  { id: 'FAAN-2018-0214', name: 'Emeka Nwosu',    savings: 980500  },
  { id: 'FAAN-2019-0218', name: 'Fatima Bello',   savings: 620000  },
  { id: 'NAMA-2020-0091', name: 'Aisha Mohammed', savings: 420000  },
  { id: 'FAAN-2014-0056', name: 'Bello Suleiman', savings: 1240000 },
  { id: 'FAAN-2017-0099', name: 'James Adeyemi',  savings: 1100000 },
  { id: 'FAAN-2021-0301', name: 'Chidinma Eze',   savings: 380000  },
  { id: 'NAMA-2023-0412', name: 'Musa Garba',     savings: 180000  },
];

const TOTAL_SAVINGS = MEMBERS_SAVINGS.reduce((s, m) => s + m.savings, 0);

function parseSurplus(raw: string): number {
  return Number(raw.replace(/[₦,\s]/g, '')) || 0;
}

function fmt(n: number) {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

function BarFill({ pct, color }: { pct: number; color: string }) {
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 8 }}>
      <View style={{ height: 6, borderRadius: 3, width: `${pct}%` as any, backgroundColor: color }} />
    </View>
  );
}

export default function AdminDividends() {
  const [surplusInput, setSurplusInput] = useState('15,000,000');

  const surplus = useMemo(() => parseSurplus(surplusInput), [surplusInput]);

  const allocations = useMemo(() =>
    ALLOCATIONS.map((a) => ({ ...a, amount: surplus * (a.pct / 100) })),
    [surplus]
  );

  const savingsDividendPool = surplus * 0.40;
  const memberAllocations = useMemo(() =>
    MEMBERS_SAVINGS.map((m) => ({
      ...m,
      share: TOTAL_SAVINGS > 0 ? (m.savings / TOTAL_SAVINGS) * savingsDividendPool : 0,
      sharePct: TOTAL_SAVINGS > 0 ? (m.savings / TOTAL_SAVINGS) * 100 : 0,
    })),
    [savingsDividendPool]
  );

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Dividend Engine" subtitle="Art. 10.2 — Annual surplus allocation" portal="admin" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

        {/* Input */}
        <View style={{ backgroundColor: 'rgba(139,26,26,0.16)', borderWidth: 1, borderColor: 'rgba(192,57,43,0.28)', borderRadius: Radii.lg, padding: 28, marginBottom: 28 }}>
          <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.sm, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>
            Total Distributable Surplus (₦)
          </Text>
          <TextInput
            value={surplusInput}
            onChangeText={setSurplusInput}
            placeholder="e.g. 15,000,000"
            placeholderTextColor={Colors.muted}
            keyboardType="numeric"
            style={{ fontFamily: Fonts.mono, fontSize: 36, color: Colors.green2, fontWeight: '700', paddingVertical: 4 }}
          />
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted, marginTop: 6 }}>
            Allocations update in real time as you type. No submit required.
          </Text>
        </View>

        {/* 6-way split */}
        <SectionTitle portal="admin">Bye-Law Art. 10.2 — Allocation Breakdown</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          {allocations.map((a) => (
            <View key={a.key} style={{ width: '30%', backgroundColor: Surfaces.cardBg, borderWidth: 1, borderColor: Surfaces.cardBorder, borderRadius: Radii.md, padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.sm, color: Colors.white, flex: 1 }}>{a.label}</Text>
                <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: a.color }}>{a.pct}%</Text>
              </View>
              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize['3xl'], color: a.color, fontWeight: '700', marginTop: 6 }}>
                {fmt(a.amount)}
              </Text>
              <BarFill pct={a.pct} color={a.color} />
              <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginTop: 8, lineHeight: 16 }}>{a.desc}</Text>
            </View>
          ))}
        </View>

        {/* Member allocation table */}
        <SectionTitle portal="admin">Member Savings Dividends (40% Pool)</SectionTitle>
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted, marginBottom: 16, marginTop: -8 }}>
          {`Pool: ${fmt(savingsDividendPool)} — allocated pro-rata to each member's cumulative savings balance.`}
        </Text>
        <Card>
          <CardBody noPad>
            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
              {['Member ID', 'Name', 'Savings Balance', 'Share (%)', 'Dividend Allocation'].map((h) => (
                <View key={h} style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 11 }}>
                  <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                </View>
              ))}
            </View>
            {memberAllocations.map((m, i) => (
              <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: i < memberAllocations.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14 }}>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.red2 }}>{m.id}</Text>
                </View>
                <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14 }}>
                  <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.white }}>{m.name}</Text>
                </View>
                <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14 }}>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.muted }}>{'₦' + m.savings.toLocaleString('en-NG')}</Text>
                </View>
                <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14 }}>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.base, color: Colors.gold }}>{m.sharePct.toFixed(2)}%</Text>
                </View>
                <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14 }}>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.lg, color: Colors.green2, fontWeight: '700' }}>{fmt(m.share)}</Text>
                </View>
              </View>
            ))}
            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.10)', paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: Colors.white, flex: 4 }}>Total — Savings Dividend Pool</Text>
              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.lg, color: Colors.green2, fontWeight: '700', flex: 1 }}>{fmt(savingsDividendPool)}</Text>
            </View>
          </CardBody>
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

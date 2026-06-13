import { ScrollView, Text, View } from 'react-native';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Radii, Surfaces } from '../../src/theme/tokens';

const INCOME = [
  { label: 'Loan Interest Income',       value: '₦18,420,000', pct: 65 },
  { label: 'Annual Membership Dues',     value: '₦3,114,000',  pct: 11 },
  { label: 'Commodities Trading Surplus',value: '₦2,840,000',  pct: 10 },
  { label: 'Investment & Fixed Deposit', value: '₦4,200,000',  pct: 15 },
];
const TOTAL_INCOME = '₦28,574,000';

const EXPENDITURE = [
  { label: 'Administrative & Staff Costs', value: '₦8,210,000',  pct: 61 },
  { label: 'Loan Write-offs',              value: '₦1,120,000',  pct: 8 },
  { label: 'Education & Training Fund',    value: '₦2,857,000',  pct: 21 },
  { label: 'Building & Infrastructure',   value: '₦1,400,000',  pct: 10 },
];
const TOTAL_EXPENDITURE = '₦13,587,000';
const NET_SURPLUS = '₦14,987,000';

const BANK_ACCOUNTS = [
  { bank: 'Zenith Bank Plc',   label: 'Main Operations Account',  acct: '1012345678', balance: '₦48,240,000',  icon: '🏦', color: Colors.red2   },
  { bank: 'Zenith Bank Plc',   label: 'Member Savings Account',   acct: '1098765432', balance: '₦320,540,000', icon: '💰', color: Colors.green2 },
  { bank: 'First Bank Nigeria', label: 'Investment Account',       acct: '2034567890', balance: '₦112,800,000', icon: '📈', color: Colors.gold   },
  { bank: 'UBA Nigeria',        label: 'Petty Cash / Operations',  acct: '3001234567', balance: '₦9,420,000',   icon: '🏧', color: Colors.white  },
];

function BarFill({ pct, color }: { pct: number; color: string }) {
  return (
    <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 8 }}>
      <View style={{ height: 4, borderRadius: 2, width: `${pct}%` as any, backgroundColor: color }} />
    </View>
  );
}

export default function AdminFinancials() {
  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Financials" subtitle="Income, expenditure and bank balances" portal="admin" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

        {/* Net surplus banner */}
        <View style={{ backgroundColor: 'rgba(26,122,74,0.18)', borderWidth: 1, borderColor: 'rgba(34,160,96,0.30)', borderRadius: Radii.lg, padding: 20, marginBottom: 16 }}>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>2026 Net Distributable Surplus (YTD)</Text>
          <Text style={{ fontFamily: Fonts.mono, fontSize: 28, color: Colors.green2, fontWeight: '700', marginTop: 4 }}>{NET_SURPLUS}</Text>
          <View style={{ flexDirection: 'row', gap: 24, marginTop: 14 }}>
            <View>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>Total Income</Text>
              <Text style={{ fontFamily: Fonts.mono, fontSize: 16, color: Colors.white, marginTop: 2 }}>{TOTAL_INCOME}</Text>
            </View>
            <View>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>Total Expenditure</Text>
              <Text style={{ fontFamily: Fonts.mono, fontSize: 16, color: Colors.red2, marginTop: 2 }}>{TOTAL_EXPENDITURE}</Text>
            </View>
          </View>
        </View>

        {/* Income */}
        <View style={{ marginBottom: 14 }}>
          <Card style={{ flex: 1 }}>
            <CardHeader title="Income Statement" subtitle="Jan – May 2026" />
            <CardBody>
              {INCOME.map((row) => (
                <View key={row.label} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted, flex: 1 }}>{row.label}</Text>
                    <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.green2 }}>{row.value}</Text>
                  </View>
                  <BarFill pct={row.pct} color={Colors.green2} />
                </View>
              ))}
              <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: Colors.white }}>Total Income</Text>
                <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.lg, color: Colors.green2, fontWeight: '700' }}>{TOTAL_INCOME}</Text>
              </View>
            </CardBody>
          </Card>
        </View>

        {/* Expenditure */}
        <View style={{ marginBottom: 16 }}>
          <Card style={{ flex: 1 }}>
            <CardHeader title="Expenditure Statement" subtitle="Jan – May 2026" />
            <CardBody>
              {EXPENDITURE.map((row) => (
                <View key={row.label} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted, flex: 1 }}>{row.label}</Text>
                    <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.red2 }}>{row.value}</Text>
                  </View>
                  <BarFill pct={row.pct} color={Colors.red2} />
                </View>
              ))}
              <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: Colors.white }}>Total Expenditure</Text>
                <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.lg, color: Colors.red2, fontWeight: '700' }}>{TOTAL_EXPENDITURE}</Text>
              </View>
            </CardBody>
          </Card>
        </View>

        {/* Bank balances */}
        <SectionTitle portal="admin">Bank Account Balances</SectionTitle>
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted, marginBottom: 16, marginTop: -8 }}>
          Live balances will sync via bank API integration. Values shown are as of last reconciliation.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {BANK_ACCOUNTS.map((acct) => (
            <View key={acct.acct} style={{ width: '47%', backgroundColor: Surfaces.cardBg, borderWidth: 1, borderColor: Surfaces.cardBorder, borderRadius: Radii.md, padding: 22 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Text style={{ fontSize: 24 }}>{acct.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: Colors.white }}>{acct.bank}</Text>
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted, marginTop: 1 }}>{acct.label}</Text>
                </View>
              </View>
              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.xs, color: Colors.muted, marginBottom: 4 }}>A/C: {acct.acct}</Text>
              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize['3xl'], color: acct.color, fontWeight: '700' }}>{acct.balance}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

import React from 'react';
import { Text, View } from 'react-native';
import { Colors, Fonts, FontSize } from '../theme/tokens';

export type TxnIconColor = 'green' | 'red' | 'blue' | 'gold';

export interface Transaction {
  icon: string;
  iconColor: TxnIconColor;
  title: string;
  sub: string;
  amount: string;
  type: 'credit' | 'debit';
}

const iconBg: Record<TxnIconColor, string> = {
  green: 'rgba(26,122,74,0.25)',
  red:   'rgba(192,57,43,0.25)',
  blue:  'rgba(21,101,168,0.25)',
  gold:  'rgba(232,160,32,0.25)',
};

export function TransactionList({ items }: { items: Transaction[] }) {
  return (
    <View style={{ gap: 12 }}>
      {items.map((txn, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            paddingHorizontal: 14,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 8,
          }}
        >
          <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: iconBg[txn.iconColor], alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text style={{ fontSize: 16 }}>{txn.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.md, color: Colors.white }}>{txn.title}</Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 }}>{txn.sub}</Text>
          </View>
          <Text
            style={{
              fontFamily: Fonts.mono,
              fontSize: FontSize.md,
              fontWeight: '500',
              color: txn.type === 'credit' ? Colors.green2 : Colors.red2,
            }}
          >
            {txn.amount}
          </Text>
        </View>
      ))}
    </View>
  );
}

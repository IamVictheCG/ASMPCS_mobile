import React from 'react';
import { Text, View } from 'react-native';
import { Colors, Fonts } from '../theme/tokens';

export interface BarData {
  label: string;
  heightPct: number; // 0–100
  variant?: 'teal' | 'gold';
  faded?: boolean;
}

interface ChartBarsProps {
  data: BarData[];
  height?: number;
}

export function ChartBars({ data, height = 120 }: ChartBarsProps) {
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height }}>
        {data.map((bar, i) => (
          <View key={i} style={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: '100%',
                height: `${bar.heightPct}%`,
                borderRadius: 4,
                backgroundColor: bar.variant === 'gold' ? Colors.gold : Colors.mint,
                opacity: bar.faded ? 0.35 : 1,
              }}
            />
          </View>
        ))}
      </View>
      {/* Labels row */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        {data.map((bar, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: Fonts.mono, fontSize: 10, color: Colors.muted }}>{bar.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

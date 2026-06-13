import React from 'react';
import { Text, View } from 'react-native';
import { Colors, Fonts, FontSize, Surfaces } from '../theme/tokens';

export type ActivityColor = 'green' | 'gold' | 'red' | 'blue' | 'purple';

export interface ActivityItem {
  color: ActivityColor;
  text: string;
  sub: string;
  time: string;
}

const dotColors: Record<ActivityColor, string> = {
  green:  Colors.green2,
  gold:   Colors.gold,
  red:    Colors.red2,
  blue:   Colors.mint,
  purple: Colors.purple,
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <View style={{ gap: 10 }}>
      {items.map((item, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            padding: 12,
            paddingHorizontal: 14,
            backgroundColor: Surfaces.cardBg2,
            borderRadius: 8,
          }}
        >
          <View style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: dotColors[item.color], marginTop: 4, flexShrink: 0 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.base, color: Colors.white, lineHeight: 20 }}>
              {item.text}
            </Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 }}>
              {item.sub}
            </Text>
          </View>
          <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.xs, color: 'rgba(127,168,201,0.5)', flexShrink: 0 }}>
            {item.time}
          </Text>
        </View>
      ))}
    </View>
  );
}

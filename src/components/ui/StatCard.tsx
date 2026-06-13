import React from 'react';
import { Text, View } from 'react-native';
import { Colors, Fonts, FontSize, Radii, Shadows, Surfaces } from '../../theme/tokens';

type StatVariant = 'blue' | 'gold' | 'green' | 'red' | 'purple';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  change?: string;
  changeDir?: 'up' | 'down' | 'warn' | 'neutral';
  variant?: StatVariant;
}

const accentColors: Record<StatVariant, string> = {
  blue:   Colors.mint,
  gold:   Colors.gold,
  green:  Colors.green2,
  red:    Colors.red2,
  purple: Colors.purple,
};

const changeColors = {
  up:      Colors.green2,
  down:    Colors.red2,
  warn:    Colors.gold,
  neutral: Colors.muted,
};

export function StatCard({ icon, value, label, change, changeDir = 'neutral', variant = 'blue' }: StatCardProps) {
  const accent = accentColors[variant];
  const changeFg = changeColors[changeDir];

  return (
    <View
      style={{
        backgroundColor: Surfaces.cardBg,
        borderWidth: 1,
        borderColor: Surfaces.cardBorder,
        borderRadius: Radii.md,
        padding: 20,
        paddingHorizontal: 22,
        overflow: 'hidden',
        flex: 1,
        ...Shadows.card,
      }}
    >
      {/* 3px top accent bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: accent }} />

      <Text style={{ fontSize: 22, marginBottom: 12, marginTop: 4 }}>{icon}</Text>
      <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize['4xl'], color: Colors.white, letterSpacing: -0.5 }}>
        {value}
      </Text>
      <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted, marginTop: 4 }}>
        {label}
      </Text>
      {change && (
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: changeFg, marginTop: 8 }}>
          {change}
        </Text>
      )}
    </View>
  );
}

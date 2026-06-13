import React from 'react';
import { View } from 'react-native';
import { Colors } from '../../theme/tokens';

type ProgressVariant = 'teal' | 'gold' | 'green' | 'red';

interface ProgressBarProps {
  percent: number; // 0–100
  variant?: ProgressVariant;
  height?: number;
}

const fillColors: Record<ProgressVariant, string> = {
  teal:  Colors.mint,
  gold:  Colors.gold,
  green: Colors.green2,
  red:   Colors.red2,
};

export function ProgressBar({ percent, variant = 'teal', height = 7 }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <View
      style={{
        height,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: 999,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${clamped}%`,
          backgroundColor: fillColors[variant],
          borderRadius: 999,
        }}
      />
    </View>
  );
}

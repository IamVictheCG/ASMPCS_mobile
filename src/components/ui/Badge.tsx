import React from 'react';
import { Text, View } from 'react-native';
import { BadgeColors } from '../../theme/tokens';

export type BadgeVariant =
  | 'credit' | 'debit' | 'pending' | 'approved' | 'rejected'
  | 'active' | 'inactive' | 'repaying' | 'overdue' | 'disbursed';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
}

export function Badge({ variant, label }: BadgeProps) {
  const { bg, text } = BadgeColors[variant];
  return (
    <View
      style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}
    >
      <Text style={{ color: text, fontSize: 11, fontFamily: 'DMSans_600SemiBold', letterSpacing: 0.2 }}>
        {label}
      </Text>
    </View>
  );
}

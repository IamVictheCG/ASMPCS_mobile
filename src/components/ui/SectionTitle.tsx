import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { Colors, Fonts, FontSize } from '../../theme/tokens';

interface SectionTitleProps {
  children: string;
  portal?: 'member' | 'admin';
  style?: ViewStyle;
}

export function SectionTitle({ children, portal = 'member', style }: SectionTitleProps) {
  const barColor = portal === 'admin' ? Colors.red2 : Colors.mint;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }, style]}>
      {/* 3px vertical accent bar — visual signature from source design */}
      <View style={{ width: 3, height: 18, backgroundColor: barColor, borderRadius: 999 }} />
      <Text style={{ fontFamily: Fonts.playfairSemibold, fontSize: FontSize.xl, color: Colors.white }}>
        {children}
      </Text>
    </View>
  );
}

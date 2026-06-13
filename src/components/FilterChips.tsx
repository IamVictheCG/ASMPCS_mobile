import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { Colors, Fonts, FontSize, Radii } from '../theme/tokens';

interface FilterChipsProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export function FilterChips({ options, value, onChange }: FilterChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={{
              paddingHorizontal: 18,
              paddingVertical: 7,
              borderRadius: Radii.full,
              borderWidth: 1,
              borderColor: active ? Colors.mint : 'rgba(255,255,255,0.15)',
              backgroundColor: active ? 'rgba(0,198,216,0.15)' : 'transparent',
            }}
            activeOpacity={0.75}
          >
            <Text
              style={{
                fontFamily: Fonts.sans,
                fontSize: FontSize.md,
                color: active ? Colors.white : Colors.muted,
              }}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

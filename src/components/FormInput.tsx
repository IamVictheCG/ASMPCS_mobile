import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { Colors, Fonts, FontSize, Radii } from '../theme/tokens';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function FormInput({ label, error, style, ...rest }: FormInputProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text
          style={{
            fontFamily: Fonts.sansSemibold,
            fontSize: FontSize.xs,
            color: Colors.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.7,
            marginBottom: 7,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          {
            width: '100%',
            paddingHorizontal: 16,
            paddingVertical: 13,
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderWidth: 1,
            borderColor: error ? Colors.red2 : 'rgba(255,255,255,0.10)',
            borderRadius: Radii.sm,
            color: Colors.white,
            fontFamily: Fonts.sans,
            fontSize: FontSize.md,
          },
          style,
        ]}
        placeholderTextColor="rgba(255,255,255,0.30)"
        {...rest}
      />
      {error ? (
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.red2, marginTop: 5 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// A select-style picker row (static UI — shows current value as text)
interface InfoRowProps {
  label: string;
  value: string;
  valueColor?: string;
  valueMono?: boolean;
}

export function InfoRow({ label, value, valueColor, valueMono }: InfoRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.sm, color: Colors.muted }}>{label}</Text>
      <Text
        style={{
          fontFamily: valueMono ? Fonts.mono : Fonts.sansMedium,
          fontSize: FontSize.base,
          color: valueColor ?? Colors.white,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

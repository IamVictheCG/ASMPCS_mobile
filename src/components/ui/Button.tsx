import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { Colors, Gradients, Radii } from '../../theme/tokens';

type ButtonVariant = 'primary' | 'admin-primary' | 'ghost' | 'approve' | 'reject' | 'view' | 'edit' | 'danger';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  label: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md';
}

const variantStyles: Record<ButtonVariant, { bg?: string; text: string; border?: string; gradient?: string[] }> = {
  'primary':       { gradient: Gradients.memberBtn,   text: Colors.white },
  'admin-primary': { gradient: Gradients.adminPrimary, text: Colors.white },
  'ghost':         { bg: 'transparent', text: Colors.muted,  border: 'rgba(255,255,255,0.10)' },
  'approve':       { bg: 'rgba(26,122,74,0.30)',  text: Colors.green2, border: 'rgba(26,122,74,0.40)' },
  'reject':        { bg: 'rgba(192,57,43,0.25)',  text: '#E88080',     border: 'rgba(192,57,43,0.35)' },
  'view':          { bg: 'rgba(255,255,255,0.07)', text: Colors.white,  border: 'rgba(255,255,255,0.10)' },
  'edit':          { bg: 'rgba(21,101,168,0.25)', text: Colors.mint,   border: 'rgba(21,101,168,0.35)' },
  'danger':        { bg: 'rgba(192,57,43,0.20)',  text: Colors.red2,   border: 'rgba(192,57,43,0.30)' },
};

export function Button({ variant = 'primary', label, fullWidth, size = 'md', style, ...rest }: ButtonProps) {
  const v = variantStyles[variant];
  const pad = size === 'sm' ? { paddingVertical: 5, paddingHorizontal: 10 } : { paddingVertical: 10, paddingHorizontal: 22 };
  const fontSize = size === 'sm' ? 11 : 13.5;

  const inner = (
    <Text style={{ color: v.text, fontSize, fontFamily: 'DMSans_600SemiBold', letterSpacing: 0.3 }}>
      {label}
    </Text>
  );

  if (v.gradient) {
    return (
      <TouchableOpacity style={[{ borderRadius: Radii.sm }, fullWidth && { width: '100%' }, style as any]} activeOpacity={0.85} {...rest}>
        <LinearGradient
          colors={v.gradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[{ borderRadius: Radii.sm, alignItems: 'center', justifyContent: 'center' }, pad]}
        >
          {inner}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: v.bg,
          borderRadius: Radii.sm,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        pad,
        fullWidth && { width: '100%' },
        style as any,
      ]}
      activeOpacity={0.75}
      {...rest}
    >
      {inner}
    </TouchableOpacity>
  );
}

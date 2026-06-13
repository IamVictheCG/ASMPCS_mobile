import React from 'react';
import { Text, TouchableOpacity, View, ViewProps } from 'react-native';
import { Fonts, FontSize, Colors, Surfaces, Radii, Shadows } from '../../theme/tokens';

// ─── Card shell ───────────────────────────────────────────────
interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...rest }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: Surfaces.cardBg,
          borderWidth: 1,
          borderColor: Surfaces.cardBorder,
          borderRadius: Radii.md,
          overflow: 'hidden',
          ...Shadows.card,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

// ─── Card header ──────────────────────────────────────────────
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function CardHeader({ title, subtitle, actionLabel, onAction }: CardHeaderProps) {
  return (
    <View
      style={{
        paddingHorizontal: 22,
        paddingTop: 18,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: Fonts.playfairSemibold, fontSize: FontSize.lg, color: Colors.white }}>
          {title}
        </Text>
        {actionLabel && onAction && (
          <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
            <Text style={{ fontFamily: Fonts.sansMedium, fontSize: FontSize.sm, color: Colors.mint }}>
              {actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {subtitle && (
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted, marginTop: 3 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// ─── Card body ────────────────────────────────────────────────
interface CardBodyProps extends ViewProps {
  children: React.ReactNode;
  noPad?: boolean;
}

export function CardBody({ children, noPad, style, ...rest }: CardBodyProps) {
  return (
    <View
      style={[!noPad && { paddingHorizontal: 22, paddingVertical: 18 }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

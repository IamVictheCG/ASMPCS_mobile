import { useState } from 'react';
import { Text, View } from 'react-native';
import { Colors, Fonts, FontSize, Radii } from '../theme/tokens';

export function useToast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<'success' | 'error'>('success');

  function show(msg: string, v: 'success' | 'error' = 'success') {
    setMessage(msg);
    setVariant(v);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  }

  return { message, visible, variant, show };
}

interface ToastProps {
  message: string;
  visible: boolean;
  variant?: 'success' | 'error';
}

export function Toast({ message, visible, variant = 'success' }: ToastProps) {
  if (!visible) return null;
  const isError = variant === 'error';
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: 28,
        alignSelf: 'center',
        backgroundColor: isError ? 'rgba(192,57,43,0.20)' : 'rgba(0,198,216,0.15)',
        borderWidth: 1,
        borderColor: isError ? 'rgba(192,57,43,0.40)' : 'rgba(0,198,216,0.40)',
        borderRadius: Radii.full,
        paddingHorizontal: 20,
        paddingVertical: 10,
        zIndex: 100,
      }}
    >
      <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.sm, color: isError ? Colors.red2 : Colors.mint }}>
        {isError ? '✕ ' : '✓ '}{message}
      </Text>
    </View>
  );
}

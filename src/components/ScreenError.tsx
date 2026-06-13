import { Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, FontSize, Radii } from '../theme/tokens';

interface ScreenErrorProps {
  message?: string;
  onRetry: () => void;
}

export function ScreenError({ message = 'Something went wrong. Please try again.', onRetry }: ScreenErrorProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
      <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['3xl'], color: Colors.white }}>
        ⚠️ Load Failed
      </Text>
      <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted, textAlign: 'center' }}>
        {message}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.75}
        style={{
          backgroundColor: 'rgba(0,198,216,0.15)',
          borderWidth: 1,
          borderColor: 'rgba(0,198,216,0.35)',
          borderRadius: Radii.sm,
          paddingHorizontal: 28,
          paddingVertical: 12,
        }}
      >
        <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.base, color: Colors.mint }}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
}

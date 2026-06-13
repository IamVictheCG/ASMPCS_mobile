import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize } from '../../src/theme/tokens';

export default function MemberSupport() {
  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Support" subtitle="Get help from the cooperative" notifDot onNotifPress={() => router.push('/(member)/notifications')} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 32, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['3xl'], color: Colors.white, marginBottom: 10 }}>Support Centre</Text>
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.md, color: Colors.muted }}>Help desk and member support — coming soon.</Text>
      </ScrollView>
    </View>
  );
}

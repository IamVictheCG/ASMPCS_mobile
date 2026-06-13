import { ScrollView, Text, View } from 'react-native';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize } from '../../src/theme/tokens';

export default function AdminBroadcast() {
  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Broadcast" subtitle="Send notifications and announcements to members" portal="admin" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['3xl'], color: Colors.white, marginBottom: 10 }}>Broadcast Centre</Text>
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.md, color: Colors.muted }}>Push notifications and email broadcast — coming soon.</Text>
      </ScrollView>
    </View>
  );
}

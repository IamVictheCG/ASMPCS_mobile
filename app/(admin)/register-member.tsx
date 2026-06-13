import { ScrollView, Text, View } from 'react-native';
import { FormInput } from '../../src/components/FormInput';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Radii } from '../../src/theme/tokens';

export default function AdminRegisterMember() {
  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Register New Member" subtitle="Enrol a new cooperative member" portal="admin" notifDot onNotifPress={() => {}} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

        {/* Personal info */}
        <SectionTitle>Personal Information</SectionTitle>
        <Card>
          <CardHeader title="Applicant Details" />
          <CardBody>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <View style={{ flex: 1 }}>
                <FormInput label="First Name"     placeholder="e.g. Emeka" />
                <FormInput label="Date of Birth"  placeholder="DD/MM/YYYY" />
                <FormInput label="Phone Number"   placeholder="+234 XXX XXX XXXX" keyboardType="phone-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput label="Last Name"       placeholder="e.g. Nwosu" />
                <FormInput label="Gender"          placeholder="Male / Female" />
                <FormInput label="Email Address"   placeholder="name@faan.gov.ng" keyboardType="email-address" />
              </View>
            </View>
            <FormInput label="Residential Address" placeholder="House No., Street, City, State" multiline numberOfLines={2} />
          </CardBody>
        </Card>

        {/* Employment details */}
        <SectionTitle style={{ marginTop: 24 }}>Employment Details</SectionTitle>
        <Card>
          <CardHeader title="Work Information" />
          <CardBody>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <View style={{ flex: 1 }}>
                <FormInput label="Staff ID"          placeholder="e.g. FAAN-2024-0501" />
                <FormInput label="Department"        placeholder="Air Traffic Control" />
                <FormInput label="Station / Airport" placeholder="e.g. Abuja International" />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput label="Organisation"    placeholder="FAAN / NAMA / NCAT" />
                <FormInput label="Grade Level"     placeholder="e.g. GL 10" />
                <FormInput label="Zone"            placeholder="Zone A / Zone B" />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <View style={{ flex: 1 }}>
                <FormInput label="Date of Employment"   placeholder="MM/YYYY" />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput label="Monthly Salary (₦)"   placeholder="e.g. 350,000" keyboardType="numeric" />
              </View>
            </View>
          </CardBody>
        </Card>

        {/* Next of kin */}
        <SectionTitle style={{ marginTop: 24 }}>Next of Kin</SectionTitle>
        <Card>
          <CardHeader title="NOK Details" />
          <CardBody>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <View style={{ flex: 1 }}>
                <FormInput label="NOK Full Name"      placeholder="e.g. Ngozi Nwosu" />
                <FormInput label="Relationship"       placeholder="e.g. Spouse" />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput label="NOK Phone Number"   placeholder="+234 XXX XXX XXXX" keyboardType="phone-pad" />
                <FormInput label="NOK Address"        placeholder="If different from member" />
              </View>
            </View>
          </CardBody>
        </Card>

        {/* Savings mandate */}
        <SectionTitle style={{ marginTop: 24 }}>Savings Mandate</SectionTitle>
        <Card>
          <CardHeader title="Monthly Deduction Setup" />
          <CardBody>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <View style={{ flex: 1 }}>
                <FormInput label="Monthly Savings (₦)"   placeholder="e.g. 55,000 (min ₦5,000)" keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput label="Investment Fund Opt-in" placeholder="Yes / No" />
              </View>
            </View>
            <View style={{ backgroundColor: 'rgba(0,198,216,0.08)', borderWidth: 1, borderColor: 'rgba(0,198,216,0.20)', borderRadius: Radii.sm, padding: 14, marginTop: 6 }}>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted, lineHeight: 20 }}>
                💡 Minimum monthly savings is <Text style={{ color: Colors.mint, fontFamily: Fonts.sansSemibold }}>₦5,000</Text>. Members can contribute more voluntarily. Deductions are processed automatically via FAAN/NAMA payroll each month.
              </Text>
            </View>
          </CardBody>
        </Card>

        {/* Submit */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <Button variant="ghost"         label="Cancel" />
          <Button variant="view"          label="Save as Draft" />
          <Button variant="admin-primary" label="Register Member →" />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { Button } from '../src/components/ui/Button';
import { FormInput } from '../src/components/FormInput';
import { useRegistration } from '../src/hooks/useRegistration';
import { Colors, Fonts, FontSize, Gradients, Radii, Shadows, Surfaces } from '../src/theme/tokens';

// ─── Validation schema ───────────────────────────────────────
const schema = z
  .object({
    staffId:         z.string().min(1, 'Staff ID is required'),
    fullName:        z.string().min(1, 'Full name is required'),
    agency:          z.string().min(1, 'Please select your agency'),
    dateJoined:      z
      .string()
      .min(1, 'Date joined is required')
      .regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Must be MM/YYYY format (e.g. 03/2021)'),
    email:           z.string().min(1, 'Email is required').email('Enter a valid email address'),
    phone:           z
      .string()
      .min(1, 'Phone number is required')
      .regex(
        /^(\+234|0)[789][01]\d{8}$/,
        'Enter a valid Nigerian number (e.g. 08012345678)'
      ),
    password:        z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/\d/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

// ─── Agency options ──────────────────────────────────────────
const AGENCIES = [
  { value: 'FAAN',         label: 'FAAN' },
  { value: 'NAAM',         label: 'NAAM' },
  { value: 'AIB',          label: 'AIB' },
  { value: 'STAFF_SCHOOL', label: 'Staff School' },
] as const;

// ─── Shared input label style ─────────────────────────────────
const labelStyle = {
  fontFamily: Fonts.sansSemibold,
  fontSize:   FontSize.xs,
  color:      Colors.muted,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.7,
  marginBottom:  7,
};

const inputBaseStyle = {
  width:             '100%' as const,
  paddingHorizontal: 16,
  paddingVertical:   13,
  backgroundColor:   'rgba(255,255,255,0.06)',
  borderWidth:       1,
  borderRadius:      Radii.sm,
  color:             Colors.white,
  fontFamily:        Fonts.sans,
  fontSize:          FontSize.md,
};

// ─── Agency dropdown ─────────────────────────────────────────
function AgencySelector({
  value,
  onChange,
  error,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const label = AGENCIES.find(a => a.value === value)?.label;

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={labelStyle}>AGENCY</Text>
      <TouchableOpacity
        onPress={() => !disabled && setOpen(o => !o)}
        activeOpacity={0.75}
        style={[
          inputBaseStyle,
          {
            flexDirection:  'row',
            justifyContent: 'space-between',
            alignItems:     'center',
            borderColor:    error ? Colors.red2 : 'rgba(255,255,255,0.10)',
          },
        ]}
      >
        <Text
          style={{
            fontFamily: Fonts.sans,
            fontSize:   FontSize.md,
            color:      label ? Colors.white : 'rgba(255,255,255,0.30)',
            flex:       1,
          }}
        >
          {label ?? 'Select your agency'}
        </Text>
        <Text style={{ color: Colors.muted, fontSize: 11 }}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      {open && (
        <View
          style={{
            backgroundColor: '#0D1F3C',
            borderWidth:     1,
            borderColor:     'rgba(255,255,255,0.15)',
            borderRadius:    Radii.sm,
            marginTop:       4,
            overflow:        'hidden',
          }}
        >
          {AGENCIES.map((a, i) => (
            <TouchableOpacity
              key={a.value}
              onPress={() => { onChange(a.value); setOpen(false); }}
              activeOpacity={0.7}
              style={{
                paddingHorizontal: 16,
                paddingVertical:   12,
                borderBottomWidth: i < AGENCIES.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(255,255,255,0.06)',
                backgroundColor:   value === a.value ? 'rgba(0,198,216,0.08)' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.sansMedium,
                  fontSize:   FontSize.md,
                  color:      value === a.value ? Colors.mint : Colors.white,
                }}
              >
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error ? (
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.red2, marginTop: 5 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Password input with show/hide toggle ────────────────────
function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={labelStyle}>{label.toUpperCase()}</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          secureTextEntry={!show}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.30)"
          editable={!disabled}
          style={[
            inputBaseStyle,
            {
              paddingRight: 48,
              borderColor: error ? Colors.red2 : 'rgba(255,255,255,0.10)',
            },
          ]}
        />
        <TouchableOpacity
          onPress={() => setShow(s => !s)}
          activeOpacity={0.7}
          style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 17 }}>{show ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      {error ? (
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.red2, marginTop: 5 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Step divider ─────────────────────────────────────────────
function StepDivider({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 20 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────
export default function MemberRegister() {
  const { register } = useRegistration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      staffId:         '',
      fullName:        '',
      agency:          '',
      dateJoined:      '',
      email:           '',
      phone:           '',
      password:        '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  // Show Step 2 only once all Step 1 fields are filled
  const [staffId, fullName, agency, dateJoined] = useWatch({
    control,
    name: ['staffId', 'fullName', 'agency', 'dateJoined'],
  });
  const showStep2 = Boolean(
    staffId?.trim() && fullName?.trim() && agency && dateJoined?.trim()
  );

  async function onSubmit(data: FormData) {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await register({
        staffId:  data.staffId,
        fullName: data.fullName,
        agency:   data.agency,
        email:    data.email,
        phone:    data.phone,
        password: data.password,
      });
      router.replace((`/registration-success?email=${encodeURIComponent(data.email)}`) as any);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LinearGradient
      colors={Gradients.loginBg as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Background circles */}
      <View style={{ position: 'absolute', width: 600, height: 600, borderRadius: 999, backgroundColor: 'rgba(0,198,216,0.07)', top: -200, right: -150 }} />
      <View style={{ position: 'absolute', width: 400, height: 400, borderRadius: 999, backgroundColor: 'rgba(21,101,168,0.08)', bottom: -100, left: -100 }} />

      <ScrollView
        contentContainerStyle={{ alignItems: 'center', padding: 24, paddingTop: 48, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <View style={{ width: 420, maxWidth: '100%', marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}
          >
            <Text style={{ color: Colors.mint, fontSize: 16 }}>←</Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted }}>
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View
          style={[
            {
              backgroundColor:  Surfaces.loginCard,
              borderWidth:      1,
              borderColor:      'rgba(255,255,255,0.12)',
              borderRadius:     Radii.xl,
              padding:          44,
              paddingHorizontal: 44,
              width:            420,
              maxWidth:         '100%',
            },
            Shadows.loginCard,
          ]}
        >
          {/* Logo */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <LinearGradient
              colors={Gradients.memberPrimary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 22 }}>✈</Text>
            </LinearGradient>
            <View>
              <Text style={{ fontFamily: Fonts.playfair, fontSize: 18, color: Colors.white, lineHeight: 22 }}>
                ASMPCS
              </Text>
              <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginTop: 2 }}>
                Digital Member Platform
              </Text>
            </View>
          </View>

          <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['4xl'], color: Colors.white, lineHeight: 36, marginBottom: 6 }}>
            Create Your{'\n'}<Text style={{ color: Colors.mint }}>Account</Text>
          </Text>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.base, color: Colors.muted, marginBottom: 28, lineHeight: 22 }}>
            Join the cooperative digital platform
          </Text>

          {/* ── Step 1: Identity ── */}
          <Controller
            control={control}
            name="staffId"
            render={({ field, fieldState }) => (
              <FormInput
                label="Staff ID"
                placeholder="e.g. FAAN-2021-0472"
                autoCapitalize="characters"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                editable={!isSubmitting}
              />
            )}
          />
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted, marginTop: -10, marginBottom: 14, lineHeight: 17 }}>
            Your staff ID as issued by your agency
          </Text>

          <Controller
            control={control}
            name="fullName"
            render={({ field, fieldState }) => (
              <FormInput
                label="Full Name"
                placeholder="As it appears on your membership record"
                autoCapitalize="words"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                editable={!isSubmitting}
              />
            )}
          />

          <Controller
            control={control}
            name="agency"
            render={({ field, fieldState }) => (
              <AgencySelector
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                disabled={isSubmitting}
              />
            )}
          />

          <Controller
            control={control}
            name="dateJoined"
            render={({ field, fieldState }) => (
              <FormInput
                label="Date Joined"
                placeholder="MM/YYYY (e.g. 03/2021)"
                keyboardType="numeric"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                editable={!isSubmitting}
              />
            )}
          />

          {/* ── Step 2: Account setup (shown when step 1 is complete) ── */}
          {showStep2 && (
            <>
              <StepDivider label="Account Setup" />

              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Email Address"
                    placeholder="e.g. emeka.nwosu@faan.gov.ng"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    editable={!isSubmitting}
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Phone Number"
                    placeholder="e.g. 08012345678 or +2348012345678"
                    keyboardType="phone-pad"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    editable={!isSubmitting}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <PasswordInput
                    label="Password"
                    placeholder="Min 8 characters, include a number"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    disabled={isSubmitting}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    disabled={isSubmitting}
                  />
                )}
              />

              {submitError && (
                <View
                  style={{
                    backgroundColor: 'rgba(192,57,43,0.18)',
                    borderWidth:     1,
                    borderColor:     'rgba(192,57,43,0.35)',
                    borderRadius:    8,
                    paddingHorizontal: 14,
                    paddingVertical:   10,
                    marginBottom:    16,
                  }}
                >
                  <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: '#E88080' }}>
                    {submitError}
                  </Text>
                </View>
              )}

              <Button
                variant="primary"
                label={isSubmitting ? 'Creating Account…' : 'Create Account →'}
                fullWidth
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              />

              {isSubmitting && (
                <ActivityIndicator
                  size="small"
                  color={Colors.mint}
                  style={{ marginTop: 12 }}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

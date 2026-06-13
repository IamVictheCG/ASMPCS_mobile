import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormInput } from '../../src/components/FormInput';
import { ScreenError } from '../../src/components/ScreenError';
import { Badge } from '../../src/components/ui/Badge';
import type { BadgeVariant } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody, CardHeader } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import {
  IouFormData,
  ShortTermFormData,
  PropertyFormData,
  CarFormData,
  LoanSubmitPayload,
  buildIouSchema,
  buildShortTermSchema,
  buildPropertySchema,
  buildCarSchema,
  parseMoney,
  useLoanApplication,
} from '../../src/hooks/useLoanApplication';
import {
  ActiveLoanData,
  MemberLoanRecord,
  RepaymentRecord,
  useActiveLoan,
  useLoanEligibility,
  useLoanHistory,
} from '../../src/hooks/useLoans';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Radii, Surfaces } from '../../src/theme/tokens';

// ─── Utilities ────────────────────────────────────────────────

function fmtMoney(n: number): string {
  return '₦' + n.toLocaleString('en-NG');
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function loanTypeLabel(type: string): string {
  return (
    { iou: 'IOU (Emergency)', short_term: 'Short-Term', property: 'Property', car: 'Car' }[type] ??
    type
  );
}

function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    active: 'repaying',
    repaying: 'repaying',
    completed: 'active',
    overdue: 'overdue',
    disbursed: 'disbursed',
  };
  return map[status] ?? 'pending';
}

// ─── Skeleton ─────────────────────────────────────────────────

function LoansSkeleton() {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <Skeleton height={120} borderRadius={Radii.md} style={{ marginBottom: 16 }} />
      <Skeleton width={200} height={18} style={{ marginBottom: 12 }} />
      <Skeleton height={300} borderRadius={Radii.md} style={{ marginBottom: 16 }} />
    </ScrollView>
  );
}

// ─── Eligibility banner ───────────────────────────────────────

interface EligibilityCardProps {
  totalSavings: number;
  maxEligible: number;
  alreadyBorrowed: number;
  availableToBorrow: number;
  isEligible: boolean;
}

function EligibilityCard({
  totalSavings,
  maxEligible,
  alreadyBorrowed,
  availableToBorrow,
  isEligible,
}: EligibilityCardProps) {
  const usedPct = maxEligible > 0 ? Math.min(100, (alreadyBorrowed / maxEligible) * 100) : 0;
  const barVariant = usedPct >= 100 ? 'red' : usedPct >= 60 ? 'gold' : 'teal';
  const limitColor =
    usedPct >= 100 ? Colors.red2 : usedPct >= 60 ? Colors.gold : Colors.mint;

  return (
    <Card style={{ marginBottom: 16 }}>
      <CardHeader title="Loan Eligibility" subtitle="Max = 3× total savings" />
      <CardBody>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>
              Total Savings
            </Text>
            <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.white }}>
              {fmtMoney(totalSavings)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>
              Max Eligible
            </Text>
            <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.white }}>
              {fmtMoney(maxEligible)}
            </Text>
          </View>
          {alreadyBorrowed > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>
                Outstanding
              </Text>
              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.red2 }}>
                −{fmtMoney(alreadyBorrowed)}
              </Text>
            </View>
          )}
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.md, color: Colors.white }}>
              Available to Borrow
            </Text>
            <Text style={{ fontFamily: Fonts.monoMedium, fontSize: 20, color: limitColor }}>
              {fmtMoney(availableToBorrow)}
            </Text>
          </View>
          <ProgressBar percent={usedPct} variant={barVariant} height={7} />
          <Badge
            variant={isEligible ? 'active' : 'inactive'}
            label={
              isEligible
                ? usedPct >= 60
                  ? '⚠ Partially utilised'
                  : '✓ Eligible — Good standing'
                : '✕ At borrowing limit'
            }
          />
        </View>
      </CardBody>
    </Card>
  );
}

// ─── Active loan tracker ──────────────────────────────────────

interface LoanTrackerProps {
  loan: ActiveLoanData;
}

function LoanTracker({ loan }: LoanTrackerProps) {
  const totalRepayable = loan.totalRepayable ?? loan.amountApproved;
  const paidPct =
    totalRepayable > 0 ? Math.min(100, Math.round((loan.amountRepaid / totalRepayable) * 100)) : 0;
  const outstanding = loan.outstandingBalance ?? totalRepayable - loan.amountRepaid;

  const today = new Date().toISOString().slice(0, 10);
  const nextDue = loan.repayments.find(
    (r) => r.status === 'unpaid' || r.status === 'overdue'
  );

  return (
    <>
      <LinearGradient
        colors={['rgba(21,101,168,0.30)', 'rgba(0,198,216,0.10)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderWidth: 1,
          borderColor: 'rgba(0,198,216,0.25)',
          borderRadius: Radii.md,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: Fonts.sans,
                fontSize: 11,
                color: Colors.muted,
                textTransform: 'uppercase',
                letterSpacing: 0.7,
                marginBottom: 3,
              }}
            >
              ACTIVE LOAN
            </Text>
            <Text
              style={{
                fontFamily: Fonts.playfair,
                fontSize: 20,
                color: Colors.white,
                fontWeight: '700',
              }}
            >
              {loanTypeLabel(loan.loanType)}
            </Text>
          </View>
          <Badge variant={statusVariant(loan.status)} label={`● ${loan.status}`} />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Approved',    val: fmtMoney(loan.amountApproved), color: Colors.gold   },
            { label: 'Outstanding', val: fmtMoney(outstanding),          color: Colors.red2   },
            { label: 'Monthly',     val: loan.monthlyInstallment ? fmtMoney(loan.monthlyInstallment) : '—', color: Colors.white },
            { label: 'Interest',    val: `${loan.interestRate}% p.a.`,   color: Colors.mint   },
          ].map((item) => (
            <View key={item.label} style={{ width: '47%' }}>
              <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted }}>
                {item.label}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.monoMedium,
                  fontSize: 16,
                  color: item.color,
                  marginTop: 2,
                }}
              >
                {item.val}
              </Text>
            </View>
          ))}
        </View>

        <ProgressBar percent={paidPct} height={8} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
          <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted }}>
            {paidPct}% Repaid
          </Text>
          {nextDue && (
            <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted }}>
              Next due: {fmtDate(nextDue.dueDate)}
            </Text>
          )}
        </View>
      </LinearGradient>

      {/* Outstanding balance callout */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(192,57,43,0.10)',
          borderWidth: 1,
          borderColor: 'rgba(192,57,43,0.20)',
          borderRadius: Radii.sm,
          padding: 14,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>
          Outstanding Balance
        </Text>
        <Text style={{ fontFamily: Fonts.monoMedium, fontSize: 20, color: Colors.red2 }}>
          {fmtMoney(outstanding)}
        </Text>
      </View>

      {/* Repayment schedule */}
      {loan.repayments.length > 0 && (
        <>
          <SectionTitle style={{ marginTop: 4 }}>Repayment Schedule</SectionTitle>
          <Card style={{ marginBottom: 20 }}>
            <CardBody noPad>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderBottomWidth: 1,
                      borderBottomColor: 'rgba(255,255,255,0.07)',
                    }}
                  >
                    {['#', 'Due Date', 'Amount', 'Status'].map((h, i) => (
                      <View
                        key={h}
                        style={{
                          width: i === 0 ? 50 : i === 3 ? 130 : 120,
                          paddingHorizontal: 14,
                          paddingVertical: 11,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.sansSemibold,
                            fontSize: FontSize.xs,
                            color: Colors.muted,
                            textTransform: 'uppercase',
                            letterSpacing: 0.7,
                          }}
                        >
                          {h}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {loan.repayments.map((row, i) => {
                    const isNextDue =
                      row.status !== 'paid' &&
                      loan.repayments
                        .filter((r) => r.status !== 'paid')
                        .indexOf(row) === 0;
                    const rowBg = row.status === 'overdue'
                      ? 'rgba(192,57,43,0.08)'
                      : row.status === 'paid'
                      ? 'rgba(26,122,74,0.06)'
                      : isNextDue
                      ? 'rgba(232,160,32,0.08)'
                      : 'transparent';

                    return (
                      <View
                        key={row.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: rowBg,
                          borderBottomWidth: i < loan.repayments.length - 1 ? 1 : 0,
                          borderBottomColor: 'rgba(255,255,255,0.04)',
                        }}
                      >
                        <View style={{ width: 50, paddingHorizontal: 14, paddingVertical: 12 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.muted }}>
                            {i + 1}
                          </Text>
                        </View>
                        <View style={{ width: 120, paddingHorizontal: 14, paddingVertical: 12 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.white }}>
                            {fmtDate(row.dueDate)}
                          </Text>
                        </View>
                        <View style={{ width: 120, paddingHorizontal: 14, paddingVertical: 12 }}>
                          <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.mint }}>
                            {fmtMoney(row.amount)}
                          </Text>
                        </View>
                        <View style={{ width: 130, paddingHorizontal: 14, paddingVertical: 12 }}>
                          {row.status === 'paid' ? (
                            <Badge variant="approved" label="✓ Paid" />
                          ) : row.status === 'overdue' ? (
                            <Badge variant="overdue" label="● Overdue" />
                          ) : isNextDue ? (
                            <Badge variant="pending" label="→ Next Due" />
                          ) : (
                            <Badge variant="inactive" label="Upcoming" />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </CardBody>
          </Card>
        </>
      )}
    </>
  );
}

// ─── IOU form ─────────────────────────────────────────────────

interface FormProps {
  availableToBorrow: number;
  onSuccess: (id: string) => void;
}

function IouForm({ availableToBorrow, onSuccess }: FormProps) {
  const schema = useMemo(() => buildIouSchema(availableToBorrow), [availableToBorrow]);
  const { control, handleSubmit, formState: { errors } } = useForm<IouFormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', purpose: '', repaymentDate: '' },
  });
  const { mutate, isPending, error: mutError } = useLoanApplication();

  function onSubmit(data: IouFormData) {
    const payload: LoanSubmitPayload = {
      loanType: 'iou',
      amountRequested: parseMoney(data.amount),
      purpose: data.purpose,
    };
    mutate(payload, { onSuccess });
  }

  return (
    <View>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Amount Requested (₦)"
            placeholder="Max ₦20,000"
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            error={errors.amount?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="purpose"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Emergency Description"
            placeholder="Describe the emergency"
            value={value}
            onChangeText={onChange}
            error={errors.purpose?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="repaymentDate"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Repayment Date (DD/MM/YYYY)"
            placeholder="e.g. 30/07/2026"
            keyboardType="numbers-and-punctuation"
            value={value}
            onChangeText={onChange}
            error={errors.repaymentDate?.message}
          />
        )}
      />
      {mutError && (
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.red2, marginBottom: 12 }}>
          {mutError.message}
        </Text>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
        <Button
          variant="primary"
          label={isPending ? 'Submitting…' : 'Submit Application →'}
          disabled={isPending}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
}

// ─── Short-Term form ──────────────────────────────────────────

function ShortTermForm({ availableToBorrow, onSuccess }: FormProps) {
  const schema = useMemo(() => buildShortTermSchema(availableToBorrow), [availableToBorrow]);
  const { control, handleSubmit, formState: { errors } } = useForm<ShortTermFormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', tenure: '', purpose: '' },
  });
  const { mutate, isPending, error: mutError } = useLoanApplication();

  function onSubmit(data: ShortTermFormData) {
    mutate(
      {
        loanType: 'short_term',
        amountRequested: parseMoney(data.amount),
        tenureMonths: parseInt(data.tenure, 10),
        purpose: data.purpose,
      },
      { onSuccess }
    );
  }

  return (
    <View>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Amount Requested (₦)"
            placeholder="Max ₦50,000"
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            error={errors.amount?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="tenure"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Tenure (months)"
            placeholder="3 – 12 months"
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            error={errors.tenure?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="purpose"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Purpose"
            placeholder="Medical, consumer needs, etc."
            value={value}
            onChangeText={onChange}
            error={errors.purpose?.message}
          />
        )}
      />
      {mutError && (
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.red2, marginBottom: 12 }}>
          {mutError.message}
        </Text>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
        <Button
          variant="primary"
          label={isPending ? 'Submitting…' : 'Submit Application →'}
          disabled={isPending}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
}

// ─── Property form ────────────────────────────────────────────

function PropertyForm({ availableToBorrow, onSuccess }: FormProps) {
  const schema = useMemo(() => buildPropertySchema(availableToBorrow), [availableToBorrow]);
  const { control, handleSubmit, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', tenure: '', purpose: '', propertyValue: '' },
  });
  const { mutate, isPending, error: mutError } = useLoanApplication();

  function onSubmit(data: PropertyFormData) {
    mutate(
      {
        loanType: 'property',
        amountRequested: parseMoney(data.amount),
        tenureMonths: parseInt(data.tenure, 10),
        purpose: `Address: ${data.purpose} | Value: ₦${parseMoney(data.propertyValue).toLocaleString('en-NG')}`,
      },
      { onSuccess }
    );
  }

  return (
    <View>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Amount Requested (₦)"
            placeholder="e.g. 5,000,000"
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            error={errors.amount?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="tenure"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Tenure (months)"
            placeholder="12 – 60 months"
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            error={errors.tenure?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="purpose"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Property Address"
            placeholder="Plot number, street, city"
            value={value}
            onChangeText={onChange}
            error={errors.purpose?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="propertyValue"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Property Value (₦)"
            placeholder="Estimated market value"
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            error={errors.propertyValue?.message}
          />
        )}
      />
      {mutError && (
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.red2, marginBottom: 12 }}>
          {mutError.message}
        </Text>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
        <Button
          variant="primary"
          label={isPending ? 'Submitting…' : 'Submit Application →'}
          disabled={isPending}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
}

// ─── Car form ─────────────────────────────────────────────────

function CarForm({ availableToBorrow, onSuccess }: FormProps) {
  const schema = useMemo(() => buildCarSchema(availableToBorrow), [availableToBorrow]);
  const { control, handleSubmit, formState: { errors } } = useForm<CarFormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', tenure: '', carDetails: '', dealerName: '' },
  });
  const { mutate, isPending, error: mutError } = useLoanApplication();

  function onSubmit(data: CarFormData) {
    mutate(
      {
        loanType: 'car',
        amountRequested: parseMoney(data.amount),
        tenureMonths: parseInt(data.tenure, 10),
        purpose: `Vehicle: ${data.carDetails} | Dealer: ${data.dealerName}`,
      },
      { onSuccess }
    );
  }

  return (
    <View>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Amount Requested (₦)"
            placeholder="e.g. 3,000,000"
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            error={errors.amount?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="tenure"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Tenure (months)"
            placeholder="12 – 48 months"
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            error={errors.tenure?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="carDetails"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Car Make / Model / Year"
            placeholder="e.g. Toyota Corolla 2023"
            value={value}
            onChangeText={onChange}
            error={errors.carDetails?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="dealerName"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Dealer Name"
            placeholder="e.g. Capitol Motors Ltd"
            value={value}
            onChangeText={onChange}
            error={errors.dealerName?.message}
          />
        )}
      />
      {mutError && (
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.red2, marginBottom: 12 }}>
          {mutError.message}
        </Text>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
        <Button
          variant="primary"
          label={isPending ? 'Submitting…' : 'Submit Application →'}
          disabled={isPending}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
}

// ─── Loan application form ────────────────────────────────────

type FormTab = 'iou' | 'short_term' | 'property' | 'car';
const FORM_TABS: { key: FormTab; label: string }[] = [
  { key: 'iou',        label: 'IOU'         },
  { key: 'short_term', label: 'Short-Term'  },
  { key: 'property',   label: 'Property'    },
  { key: 'car',        label: 'Car Loan'    },
];

interface ApplicationFormProps {
  availableToBorrow: number;
  onSuccess: (id: string) => void;
}

function ApplicationForm({ availableToBorrow, onSuccess }: ApplicationFormProps) {
  const [tab, setTab] = useState<FormTab>('iou');

  return (
    <Card>
      <CardHeader title="Apply for a Loan" subtitle="Select loan type below" />
      <CardBody>
        {/* Tab selector */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {FORM_TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: Radii.full,
                borderWidth: 1,
                borderColor: tab === t.key ? Colors.mint : 'rgba(255,255,255,0.15)',
                backgroundColor: tab === t.key ? 'rgba(0,198,216,0.15)' : 'transparent',
                minHeight: 44,
                justifyContent: 'center',
              }}
              activeOpacity={0.75}
            >
              <Text
                style={{
                  fontFamily: Fonts.sansMedium,
                  fontSize: 13,
                  color: tab === t.key ? Colors.white : Colors.muted,
                }}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'iou'        && <IouForm       availableToBorrow={availableToBorrow} onSuccess={onSuccess} />}
        {tab === 'short_term' && <ShortTermForm availableToBorrow={availableToBorrow} onSuccess={onSuccess} />}
        {tab === 'property'   && <PropertyForm  availableToBorrow={availableToBorrow} onSuccess={onSuccess} />}
        {tab === 'car'        && <CarForm       availableToBorrow={availableToBorrow} onSuccess={onSuccess} />}
      </CardBody>
    </Card>
  );
}

// ─── Success modal ────────────────────────────────────────────

interface SuccessModalProps {
  applicationId: string;
  onDone: () => void;
}

function SuccessModal({ applicationId, onDone }: SuccessModalProps) {
  return (
    <Modal visible transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.88)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <View
          style={{
            backgroundColor: Surfaces.modalBg,
            borderWidth: 1,
            borderColor: 'rgba(0,198,216,0.25)',
            borderRadius: Radii.xl,
            padding: 36,
            alignItems: 'center',
            gap: 16,
            maxWidth: 400,
            width: '100%',
          }}
        >
          <Text style={{ fontSize: 56 }}>✅</Text>
          <Text
            style={{
              fontFamily: Fonts.playfair,
              fontSize: FontSize['3xl'],
              color: Colors.white,
              textAlign: 'center',
            }}
          >
            Application Submitted
          </Text>
          <Text
            style={{
              fontFamily: Fonts.sans,
              fontSize: FontSize.base,
              color: Colors.muted,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            Your application has been received and will be reviewed by the Credit Committee
            within 3–5 working days.
          </Text>

          <View
            style={{
              backgroundColor: 'rgba(0,198,216,0.10)',
              borderWidth: 1,
              borderColor: 'rgba(0,198,216,0.25)',
              borderRadius: Radii.sm,
              paddingHorizontal: 20,
              paddingVertical: 12,
              alignItems: 'center',
              gap: 4,
              width: '100%',
            }}
          >
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted }}>
              APPLICATION REFERENCE
            </Text>
            <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.lg, color: Colors.mint }}>
              {applicationId.toUpperCase()}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: 'rgba(232,160,32,0.10)',
              borderWidth: 1,
              borderColor: 'rgba(232,160,32,0.20)',
              borderRadius: Radii.sm,
              paddingHorizontal: 16,
              paddingVertical: 10,
              width: '100%',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.sans,
                fontSize: FontSize.sm,
                color: Colors.gold,
                textAlign: 'center',
              }}
            >
              Expected review: 3–5 working days
            </Text>
          </View>

          <Button
            variant="primary"
            label="Back to Dashboard"
            fullWidth
            onPress={() => {
              onDone();
              router.replace('/(member)' as any);
            }}
          />
          <Button
            variant="ghost"
            label="View My Loans"
            fullWidth
            onPress={onDone}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── History tab ──────────────────────────────────────────────

function HistoryTab() {
  const historyQuery = useLoanHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (historyQuery.isLoading) {
    return (
      <View style={{ gap: 10 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height={72} borderRadius={Radii.md} />
        ))}
      </View>
    );
  }

  if (historyQuery.isError) {
    return (
      <ScreenError
        message="Could not load loan history."
        onRetry={() => historyQuery.refetch()}
      />
    );
  }

  const records = historyQuery.data ?? [];

  if (records.length === 0) {
    return (
      <Card>
        <CardBody>
          <View style={{ alignItems: 'center', paddingVertical: 32, gap: 10 }}>
            <Text style={{ fontSize: 36 }}>📋</Text>
            <Text
              style={{
                fontFamily: Fonts.playfairSemibold,
                fontSize: FontSize.xl,
                color: Colors.white,
                textAlign: 'center',
              }}
            >
              No Loan History
            </Text>
            <Text
              style={{
                fontFamily: Fonts.sans,
                fontSize: FontSize.base,
                color: Colors.muted,
                textAlign: 'center',
              }}
            >
              Your past and current loan applications will appear here.
            </Text>
          </View>
        </CardBody>
      </Card>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {records.map((rec) => {
        const isExpanded = expandedId === rec.id;
        const totalRepayable = rec.totalRepayable ?? rec.amountApproved ?? rec.amountRequested;
        const paidPct =
          totalRepayable > 0
            ? Math.min(100, Math.round((rec.amountRepaid / totalRepayable) * 100))
            : 0;

        return (
          <TouchableOpacity
            key={rec.id}
            onPress={() => setExpandedId(isExpanded ? null : rec.id)}
            activeOpacity={0.85}
          >
            <Card>
              <CardBody>
                {/* Row summary */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text
                      style={{
                        fontFamily: Fonts.sansSemibold,
                        fontSize: FontSize.md,
                        color: Colors.white,
                      }}
                    >
                      {loanTypeLabel(rec.loanType)}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text
                        style={{
                          fontFamily: Fonts.mono,
                          fontSize: FontSize.base,
                          color: Colors.gold,
                        }}
                      >
                        {fmtMoney(rec.amountRequested)}
                      </Text>
                      <Text
                        style={{
                          fontFamily: Fonts.sans,
                          fontSize: FontSize.xs,
                          color: Colors.muted,
                        }}
                      >
                        {fmtDate(rec.appliedAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Badge variant={statusVariant(rec.status)} label={rec.status} />
                    <Text
                      style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted }}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </Text>
                  </View>
                </View>

                {/* Expanded details */}
                {isExpanded && (
                  <View
                    style={{
                      marginTop: 16,
                      paddingTop: 14,
                      borderTopWidth: 1,
                      borderTopColor: 'rgba(255,255,255,0.07)',
                      gap: 10,
                    }}
                  >
                    {[
                      { label: 'Requested',   val: fmtMoney(rec.amountRequested) },
                      { label: 'Approved',    val: rec.amountApproved ? fmtMoney(rec.amountApproved) : '—' },
                      { label: 'Interest',    val: `${rec.interestRate}% p.a.` },
                      { label: 'Tenure',      val: rec.tenureMonths ? `${rec.tenureMonths} months` : '—' },
                      { label: 'Monthly',     val: rec.monthlyInstallment ? fmtMoney(rec.monthlyInstallment) : '—' },
                      { label: 'Total Repay', val: rec.totalRepayable ? fmtMoney(rec.totalRepayable) : '—' },
                      { label: 'Repaid',      val: fmtMoney(rec.amountRepaid) },
                      { label: 'Outstanding', val: rec.outstandingBalance != null ? fmtMoney(rec.outstandingBalance) : '—' },
                      { label: 'Applied',     val: fmtDate(rec.appliedAt) },
                      { label: 'Approved on', val: rec.approvedAt ? fmtDate(rec.approvedAt) : '—' },
                    ].map(({ label, val }) => (
                      <View
                        key={label}
                        style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.sans,
                            fontSize: FontSize.sm,
                            color: Colors.muted,
                          }}
                        >
                          {label}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Fonts.mono,
                            fontSize: FontSize.sm,
                            color: Colors.white,
                          }}
                        >
                          {val}
                        </Text>
                      </View>
                    ))}

                    {rec.status === 'active' || rec.status === 'overdue' ? (
                      <>
                        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
                        <Text
                          style={{
                            fontFamily: Fonts.sans,
                            fontSize: FontSize.xs,
                            color: Colors.muted,
                          }}
                        >
                          Repayment progress
                        </Text>
                        <ProgressBar
                          percent={paidPct}
                          variant={rec.status === 'overdue' ? 'red' : 'teal'}
                          height={6}
                        />
                        <Text
                          style={{
                            fontFamily: Fonts.sans,
                            fontSize: FontSize.xs,
                            color: Colors.muted,
                          }}
                        >
                          {paidPct}% repaid
                        </Text>
                      </>
                    ) : null}

                    {rec.status === 'rejected' && rec.rejectionReason ? (
                      <View
                        style={{
                          backgroundColor: 'rgba(192,57,43,0.10)',
                          borderWidth: 1,
                          borderColor: 'rgba(192,57,43,0.20)',
                          borderRadius: Radii.sm,
                          padding: 12,
                          gap: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.sansSemibold,
                            fontSize: FontSize.xs,
                            color: Colors.red2,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          Rejection Reason
                        </Text>
                        <Text
                          style={{
                            fontFamily: Fonts.sans,
                            fontSize: FontSize.base,
                            color: Colors.white,
                          }}
                        >
                          {rec.rejectionReason}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                )}
              </CardBody>
            </Card>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Screen tab toggle ────────────────────────────────────────

type ScreenTab = 'loan' | 'history';

function ScreenTabBar({
  active,
  onChange,
}: {
  active: ScreenTab;
  onChange: (t: ScreenTab) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: Radii.sm,
        padding: 3,
        marginBottom: 20,
      }}
    >
      {(['loan', 'history'] as const).map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => onChange(t)}
          style={{
            flex: 1,
            paddingVertical: 9,
            alignItems: 'center',
            borderRadius: Radii.sm - 2,
            backgroundColor: active === t ? 'rgba(0,198,216,0.18)' : 'transparent',
          }}
          activeOpacity={0.75}
        >
          <Text
            style={{
              fontFamily: Fonts.sansSemibold,
              fontSize: FontSize.sm,
              color: active === t ? Colors.white : Colors.muted,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
            }}
          >
            {t === 'loan' ? 'My Loan' : 'History'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────

export default function MemberLoans() {
  const eligibilityQuery = useLoanEligibility();
  const activeLoanQuery = useActiveLoan();
  const [screenTab, setScreenTab] = useState<ScreenTab>('loan');
  const [successId, setSuccessId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const isLoading = eligibilityQuery.isLoading || activeLoanQuery.isLoading;
  const isError = eligibilityQuery.isError || activeLoanQuery.isError;

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([eligibilityQuery.refetch(), activeLoanQuery.refetch()]);
    setRefreshing(false);
  }

  function handleRetry() {
    if (eligibilityQuery.isError) eligibilityQuery.refetch();
    if (activeLoanQuery.isError) activeLoanQuery.refetch();
  }

  const eligibility = eligibilityQuery.data;
  const activeLoan = activeLoanQuery.data;

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar
        title="Loans"
        onNotifPress={() => router.push('/(member)/notifications' as any)}
      />

      {isLoading ? (
        <LoansSkeleton />
      ) : isError ? (
        <ScreenError onRetry={handleRetry} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.mint}
            />
          }
        >
          {/* Eligibility banner — always visible */}
          {eligibility && (
            <EligibilityCard
              totalSavings={eligibility.totalSavings}
              maxEligible={eligibility.maxEligible}
              alreadyBorrowed={eligibility.alreadyBorrowed}
              availableToBorrow={eligibility.availableToBorrow}
              isEligible={eligibility.isEligible}
            />
          )}

          {/* Screen tab toggle */}
          <ScreenTabBar active={screenTab} onChange={setScreenTab} />

          {/* My Loan tab */}
          {screenTab === 'loan' && (
            <>
              {activeLoan ? (
                <LoanTracker loan={activeLoan} />
              ) : (
                <>
                  <SectionTitle style={{ marginBottom: 14 }}>Apply for a New Loan</SectionTitle>
                  <ApplicationForm
                    availableToBorrow={eligibility?.availableToBorrow ?? 0}
                    onSuccess={(id) => setSuccessId(id)}
                  />
                </>
              )}
            </>
          )}

          {/* History tab */}
          {screenTab === 'history' && (
            <>
              <SectionTitle style={{ marginBottom: 14 }}>Loan History</SectionTitle>
              <HistoryTab />
            </>
          )}
        </ScrollView>
      )}

      {/* Full-screen success overlay */}
      {successId && (
        <SuccessModal applicationId={successId} onDone={() => setSuccessId(null)} />
      )}
    </View>
  );
}

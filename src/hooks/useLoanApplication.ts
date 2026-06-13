import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export type LoanTypeKey = 'iou' | 'short_term' | 'property' | 'car';

function parseMoney(str: string): number {
  return Number(str.replace(/[₦,\s]/g, '')) || 0;
}

function fmtLimit(n: number): string {
  return `₦${n.toLocaleString('en-NG')}`;
}

export function buildIouSchema(limit: number) {
  return z.object({
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine((v) => parseMoney(v) > 0, 'Enter a valid amount')
      .refine((v) => parseMoney(v) <= 20000, 'IOU maximum is ₦20,000')
      .refine((v) => parseMoney(v) <= limit, `Exceeds your limit of ${fmtLimit(limit)}`),
    purpose: z.string().min(5, 'Describe the emergency (min 5 characters)'),
    repaymentDate: z.string().min(1, 'Repayment date is required'),
  });
}

export function buildShortTermSchema(limit: number) {
  return z.object({
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine((v) => parseMoney(v) > 0, 'Enter a valid amount')
      .refine((v) => parseMoney(v) <= 50000, 'Short-Term maximum is ₦50,000')
      .refine((v) => parseMoney(v) <= limit, `Exceeds your limit of ${fmtLimit(limit)}`),
    tenure: z
      .string()
      .min(1, 'Tenure is required')
      .refine((v) => {
        const n = parseInt(v, 10);
        return !isNaN(n) && n >= 3 && n <= 12;
      }, 'Tenure must be between 3 and 12 months'),
    purpose: z.string().min(5, 'Purpose is required (min 5 characters)'),
  });
}

export function buildPropertySchema(limit: number) {
  return z.object({
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine((v) => parseMoney(v) > 0, 'Enter a valid amount')
      .refine((v) => parseMoney(v) <= limit, `Exceeds your limit of ${fmtLimit(limit)}`),
    tenure: z
      .string()
      .min(1, 'Tenure is required')
      .refine((v) => {
        const n = parseInt(v, 10);
        return !isNaN(n) && n >= 12 && n <= 60;
      }, 'Tenure must be between 12 and 60 months'),
    purpose: z.string().min(10, 'Property address is required (min 10 characters)'),
    propertyValue: z
      .string()
      .min(1, 'Property value is required')
      .refine((v) => parseMoney(v) > 0, 'Enter a valid property value'),
  });
}

export function buildCarSchema(limit: number) {
  return z.object({
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine((v) => parseMoney(v) > 0, 'Enter a valid amount')
      .refine((v) => parseMoney(v) <= limit, `Exceeds your limit of ${fmtLimit(limit)}`),
    tenure: z
      .string()
      .min(1, 'Tenure is required')
      .refine((v) => {
        const n = parseInt(v, 10);
        return !isNaN(n) && n >= 12 && n <= 48;
      }, 'Tenure must be between 12 and 48 months'),
    carDetails: z.string().min(5, 'Car make, model and year are required'),
    dealerName: z.string().min(3, 'Dealer name is required'),
  });
}

export type IouFormData = z.infer<ReturnType<typeof buildIouSchema>>;
export type ShortTermFormData = z.infer<ReturnType<typeof buildShortTermSchema>>;
export type PropertyFormData = z.infer<ReturnType<typeof buildPropertySchema>>;
export type CarFormData = z.infer<ReturnType<typeof buildCarSchema>>;

export interface LoanSubmitPayload {
  loanType: LoanTypeKey;
  amountRequested: number;
  tenureMonths?: number;
  purpose: string;
}

export { parseMoney };

export function useLoanApplication() {
  const { member } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<string, Error, LoanSubmitPayload>({
    mutationFn: async (payload) => {
      if (!member?.id) throw new Error('Not authenticated');

      const { data: loan, error: loanErr } = await supabase
        .from('loans')
        .insert({
          member_id: member.id,
          loan_type: payload.loanType,
          amount_requested: payload.amountRequested,
          tenure_months: payload.tenureMonths ?? null,
          purpose: payload.purpose,
          status: 'pending',
        })
        .select('id')
        .single<{ id: string }>();

      if (loanErr) throw new Error(loanErr.message);

      await supabase.from('notifications').insert({
        member_id: member.id,
        type: 'general',
        title: 'Application Received',
        message: `Your ${payload.loanType.replace('_', ' ')} loan application for ₦${payload.amountRequested.toLocaleString('en-NG')} is pending review by the Credit Committee.`,
      });

      return loan!.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', 'loan'] });
      queryClient.invalidateQueries({ queryKey: ['member', 'loans'] });
    },
  });
}

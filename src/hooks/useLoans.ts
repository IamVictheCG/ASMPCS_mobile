import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type {
  LoanRow,
  LoanRepaymentRow,
  LoanWithRepayments,
  SavingsContributionRow,
} from '../types/database';

export interface RepaymentRecord {
  id: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'paid' | 'unpaid' | 'overdue';
  referenceNumber: string | null;
}

export interface ActiveLoanData {
  id: string;
  loanType: 'iou' | 'short_term' | 'property' | 'car';
  amountRequested: number;
  amountApproved: number;
  interestRate: number;
  tenureMonths: number | null;
  monthlyInstallment: number | null;
  totalRepayable: number | null;
  amountRepaid: number;
  outstandingBalance: number | null;
  status: 'approved' | 'active' | 'overdue';
  appliedAt: string;
  approvedAt: string | null;
  repayments: RepaymentRecord[];
}

export interface MemberLoanRecord {
  id: string;
  loanType: 'iou' | 'short_term' | 'property' | 'car';
  amountRequested: number;
  amountApproved: number | null;
  interestRate: number;
  tenureMonths: number | null;
  monthlyInstallment: number | null;
  totalRepayable: number | null;
  amountRepaid: number;
  outstandingBalance: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'overdue';
  appliedAt: string;
  approvedAt: string | null;
  rejectionReason: string | null;
}

export interface LoanEligibility {
  totalSavings: number;
  maxEligible: number;
  alreadyBorrowed: number;
  availableToBorrow: number;
  isEligible: boolean;
}

function mapRepayment(r: LoanRepaymentRow): RepaymentRecord {
  return {
    id: r.id,
    amount: Number(r.amount),
    dueDate: r.due_date,
    paidDate: r.paid_date,
    status: r.status,
    referenceNumber: r.reference_number,
  };
}

async function fetchActiveLoan(memberId: string): Promise<ActiveLoanData | null> {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      id, loan_type, amount_requested, amount_approved, interest_rate,
      tenure_months, monthly_installment, total_repayable, amount_repaid,
      outstanding_balance, status, applied_at, approved_at,
      loan_repayments (
        id, amount, due_date, paid_date, status, reference_number
      )
    `)
    .eq('member_id', memberId)
    .in('status', ['active', 'approved', 'overdue'])
    .order('applied_at', { ascending: false })
    .limit(1)
    .returns<LoanWithRepayments[]>()
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const repayments: RepaymentRecord[] = (data.loan_repayments ?? [])
    .map(mapRepayment)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return {
    id: data.id,
    loanType: data.loan_type,
    amountRequested: Number(data.amount_requested),
    amountApproved: Number(data.amount_approved ?? data.amount_requested),
    interestRate: Number(data.interest_rate ?? 5),
    tenureMonths: data.tenure_months ?? null,
    monthlyInstallment: data.monthly_installment ? Number(data.monthly_installment) : null,
    totalRepayable: data.total_repayable ? Number(data.total_repayable) : null,
    amountRepaid: Number(data.amount_repaid ?? 0),
    outstandingBalance: data.outstanding_balance ? Number(data.outstanding_balance) : null,
    status: data.status as ActiveLoanData['status'],
    appliedAt: data.applied_at,
    approvedAt: data.approved_at,
    repayments,
  };
}

type LoanSelectRow = Pick<
  LoanRow,
  | 'id' | 'loan_type' | 'amount_requested' | 'amount_approved' | 'interest_rate'
  | 'tenure_months' | 'monthly_installment' | 'total_repayable' | 'amount_repaid'
  | 'outstanding_balance' | 'status' | 'applied_at' | 'approved_at' | 'rejection_reason'
>;

async function fetchLoanHistory(memberId: string): Promise<MemberLoanRecord[]> {
  const { data, error } = await supabase
    .from('loans')
    .select(
      'id, loan_type, amount_requested, amount_approved, interest_rate, tenure_months, ' +
      'monthly_installment, total_repayable, amount_repaid, outstanding_balance, status, ' +
      'applied_at, approved_at, rejection_reason'
    )
    .eq('member_id', memberId)
    .order('applied_at', { ascending: false })
    .limit(20)
    .returns<LoanSelectRow[]>();

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    loanType: r.loan_type,
    amountRequested: Number(r.amount_requested),
    amountApproved: r.amount_approved ? Number(r.amount_approved) : null,
    interestRate: Number(r.interest_rate ?? 5),
    tenureMonths: r.tenure_months ?? null,
    monthlyInstallment: r.monthly_installment ? Number(r.monthly_installment) : null,
    totalRepayable: r.total_repayable ? Number(r.total_repayable) : null,
    amountRepaid: Number(r.amount_repaid ?? 0),
    outstandingBalance: r.outstanding_balance ? Number(r.outstanding_balance) : null,
    status: r.status,
    appliedAt: r.applied_at,
    approvedAt: r.approved_at,
    rejectionReason: r.rejection_reason ?? null,
  }));
}

type SavingsAmountRow = Pick<SavingsContributionRow, 'amount'>;
type LoanBalanceRow = Pick<LoanRow, 'outstanding_balance'>;

async function fetchEligibility(memberId: string): Promise<LoanEligibility> {
  const [savingsRes, loanRes] = await Promise.all([
    supabase
      .from('savings_contributions')
      .select('amount')
      .eq('member_id', memberId)
      .eq('status', 'confirmed')
      .returns<SavingsAmountRow[]>(),
    supabase
      .from('loans')
      .select('outstanding_balance')
      .eq('member_id', memberId)
      .in('status', ['active', 'approved', 'overdue'])
      .returns<LoanBalanceRow[]>()
      .maybeSingle(),
  ]);

  if (savingsRes.error) throw savingsRes.error;
  if (loanRes.error) throw loanRes.error;

  const totalSavings = (savingsRes.data ?? []).reduce(
    (sum, r) => sum + Number(r.amount),
    0
  );
  const maxEligible = totalSavings * 3;
  const alreadyBorrowed = loanRes.data?.outstanding_balance
    ? Number(loanRes.data.outstanding_balance)
    : 0;
  const availableToBorrow = Math.max(0, maxEligible - alreadyBorrowed);

  return {
    totalSavings,
    maxEligible,
    alreadyBorrowed,
    availableToBorrow,
    isEligible: availableToBorrow > 0 && totalSavings > 0,
  };
}

export function useActiveLoan() {
  const { member } = useAuth();
  return useQuery<ActiveLoanData | null>({
    queryKey: ['member', 'loan', 'active', member?.id],
    queryFn: () => {
      if (!member?.id) throw new Error('Not authenticated');
      return fetchActiveLoan(member.id);
    },
    enabled: !!member?.id,
  });
}

export function useLoanHistory() {
  const { member } = useAuth();
  return useQuery<MemberLoanRecord[]>({
    queryKey: ['member', 'loans', 'history', member?.id],
    queryFn: () => {
      if (!member?.id) throw new Error('Not authenticated');
      return fetchLoanHistory(member.id);
    },
    enabled: !!member?.id,
  });
}

export function useLoanEligibility() {
  const { member } = useAuth();
  return useQuery<LoanEligibility>({
    queryKey: ['member', 'loan', 'eligibility', member?.id],
    queryFn: () => {
      if (!member?.id) throw new Error('Not authenticated');
      return fetchEligibility(member.id);
    },
    enabled: !!member?.id,
  });
}

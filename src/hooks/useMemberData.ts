import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { BarData } from '../components/ChartBars';
import type { SavingsContributionRow, LoanRow, DividendRow, CommodityOrderRow } from '../types/database';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export interface RecentContribution {
  id: string;
  amount: number;
  month: number;
  year: number;
  paymentMethod: string;
  referenceNumber: string | null;
  status: string;
  createdAt: string;
}

export interface ActiveLoanData {
  loanType: string;
  amountApproved: number;
  outstandingBalance: number;
  monthlyInstallment: number;
  amountRepaid: number;
  totalRepayable: number;
  status: string;
}

export interface DashboardData {
  savingsBalance: number;
  activeLoan: ActiveLoanData | null;
  dividendEarned: number | null;
  commodityCredit: number;
  recentContributions: RecentContribution[];
  monthlyBars: BarData[];
}

type ContribSelectRow = Pick<
  SavingsContributionRow,
  'id' | 'amount' | 'month' | 'year' | 'payment_method' | 'reference_number' | 'status' | 'created_at'
>;

type LoanSelectRow = Pick<
  LoanRow,
  'loan_type' | 'amount_approved' | 'outstanding_balance' | 'monthly_installment' | 'amount_repaid' | 'total_repayable' | 'status'
>;

type DividendSelectRow = Pick<DividendRow, 'total_dividend'>;

type OrderAmountRow = Pick<CommodityOrderRow, 'total_amount'>;

async function fetchDashboardData(memberId: string): Promise<DashboardData> {
  const currentYear = new Date().getFullYear();

  const [contribRes, loanRes, dividendRes, ordersRes] = await Promise.all([
    supabase
      .from('savings_contributions')
      .select('id, amount, month, year, payment_method, reference_number, status, created_at')
      .eq('member_id', memberId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .returns<ContribSelectRow[]>(),
    supabase
      .from('loans')
      .select('loan_type, amount_approved, outstanding_balance, monthly_installment, amount_repaid, total_repayable, status')
      .eq('member_id', memberId)
      .in('status', ['active', 'approved'])
      .order('created_at', { ascending: false })
      .limit(1)
      .returns<LoanSelectRow[]>(),
    supabase
      .from('dividends')
      .select('total_dividend')
      .eq('member_id', memberId)
      .eq('year', currentYear)
      .returns<DividendSelectRow[]>()
      .maybeSingle(),
    supabase
      .from('commodity_orders')
      .select('total_amount')
      .eq('member_id', memberId)
      .in('status', ['pending', 'processing', 'ready'])
      .returns<OrderAmountRow[]>(),
  ]);

  if (contribRes.error) throw contribRes.error;
  if (loanRes.error) throw loanRes.error;

  const contributions = contribRes.data ?? [];

  const savingsBalance = contributions.reduce((sum, c) => sum + Number(c.amount), 0);

  const rawLoan = loanRes.data?.[0] ?? null;
  const activeLoan: ActiveLoanData | null = rawLoan
    ? {
        loanType: rawLoan.loan_type.replace(/_/g, ' '),
        amountApproved: Number(rawLoan.amount_approved ?? 0),
        outstandingBalance: Number(rawLoan.outstanding_balance ?? 0),
        monthlyInstallment: Number(rawLoan.monthly_installment ?? 0),
        amountRepaid: Number(rawLoan.amount_repaid ?? 0),
        totalRepayable: Number(rawLoan.total_repayable ?? 0),
        status: rawLoan.status,
      }
    : null;

  const dividendEarned =
    dividendRes.data?.total_dividend != null ? Number(dividendRes.data.total_dividend) : null;

  const commodityCredit = (ordersRes.data ?? []).reduce(
    (sum, o) => sum + Number(o.total_amount),
    0,
  );

  const recentContributions: RecentContribution[] = contributions.slice(0, 5).map((c) => ({
    id: c.id,
    amount: Number(c.amount),
    month: c.month,
    year: c.year,
    paymentMethod: c.payment_method,
    referenceNumber: c.reference_number,
    status: c.status,
    createdAt: c.created_at,
  }));

  // Build last-12-months bar chart data
  const now = new Date();
  const monthlyMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap.set(`${d.getFullYear()}-${d.getMonth() + 1}`, 0);
  }
  for (const c of contributions) {
    const key = `${c.year}-${c.month}`;
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(c.amount));
    }
  }
  const maxAmount = Math.max(...monthlyMap.values(), 1);
  const monthlyBars: BarData[] = Array.from(monthlyMap.entries()).map(([key, amount]) => {
    const month = parseInt(key.split('-')[1], 10);
    return {
      label: MONTH_LABELS[month - 1],
      heightPct: Math.round((amount / maxAmount) * 100),
      faded: amount === 0,
    };
  });

  return { savingsBalance, activeLoan, dividendEarned, commodityCredit, recentContributions, monthlyBars };
}

export function useMemberData() {
  const { member } = useAuth();
  return useQuery<DashboardData>({
    queryKey: ['member', 'dashboard', member?.id],
    queryFn: () => {
      if (!member?.id) throw new Error('Not authenticated');
      return fetchDashboardData(member.id);
    },
    enabled: !!member?.id,
  });
}

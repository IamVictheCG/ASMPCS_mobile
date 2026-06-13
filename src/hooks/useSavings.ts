import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { SavingsContributionRow } from '../types/database';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export interface MonthlyBar {
  month: string;
  amount: number;
}

export interface ContributionRecord {
  id: string;
  month: number;
  year: number;
  amount: number;
  status: 'confirmed' | 'pending' | 'reversed';
  referenceNumber: string | null;
  paymentMethod: string;
  createdAt: string;
}

export interface SavingsData {
  totalSavings: number;
  ytdSavings: number;
  monthlyBars: MonthlyBar[];
  statement: ContributionRecord[];
  memberSince: string | null;
}

type ContribSelectRow = Pick<
  SavingsContributionRow,
  'id' | 'amount' | 'month' | 'year' | 'status' | 'reference_number' | 'payment_method' | 'created_at'
>;

async function fetchSavingsData(memberId: string, memberSince: string | null): Promise<SavingsData> {
  const { data, error } = await supabase
    .from('savings_contributions')
    .select('id, amount, month, year, status, reference_number, payment_method, created_at')
    .eq('member_id', memberId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(50)
    .returns<ContribSelectRow[]>();

  if (error) throw error;

  const records = data ?? [];
  const currentYear = new Date().getFullYear();

  const totalSavings = records
    .filter((r) => r.status === 'confirmed')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const ytdSavings = records
    .filter((r) => r.status === 'confirmed' && r.year === currentYear)
    .reduce((sum, r) => sum + Number(r.amount), 0);

  // Build last-12-months bar data
  const now = new Date();
  const monthlyMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap.set(`${d.getFullYear()}-${d.getMonth() + 1}`, 0);
  }
  for (const r of records) {
    if (r.status !== 'confirmed') continue;
    const key = `${r.year}-${r.month}`;
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(r.amount));
    }
  }
  const monthlyBars: MonthlyBar[] = Array.from(monthlyMap.entries()).map(([key, amount]) => {
    const month = parseInt(key.split('-')[1], 10);
    return { month: MONTH_LABELS[month - 1], amount };
  });

  const statement: ContributionRecord[] = records.map((r) => ({
    id: r.id,
    month: r.month,
    year: r.year,
    amount: Number(r.amount),
    status: r.status,
    referenceNumber: r.reference_number,
    paymentMethod: r.payment_method,
    createdAt: r.created_at,
  }));

  return { totalSavings, ytdSavings, monthlyBars, statement, memberSince };
}

export function useSavings() {
  const { member } = useAuth();
  return useQuery<SavingsData>({
    queryKey: ['member', 'savings', member?.id],
    queryFn: () => {
      if (!member?.id) throw new Error('Not authenticated');
      return fetchSavingsData(member.id, member.date_joined ?? null);
    },
    enabled: !!member?.id,
  });
}

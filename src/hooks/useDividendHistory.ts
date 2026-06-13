import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { DividendRow } from '../types/database';

export interface DbDividendRecord {
  year: number;
  savingsDividend: number;
  loanDividend: number;
  totalDividend: number;
  status: 'computed' | 'approved' | 'paid';
}

type DividendSelectRow = Pick<
  DividendRow,
  'year' | 'savings_dividend' | 'loan_dividend' | 'total_dividend' | 'status'
>;

async function fetchDividends(memberId: string): Promise<DbDividendRecord[]> {
  const { data, error } = await supabase
    .from('dividends')
    .select('year, savings_dividend, loan_dividend, total_dividend, status')
    .eq('member_id', memberId)
    .order('year', { ascending: false })
    .returns<DividendSelectRow[]>();

  if (error) throw error;
  return (data ?? []).map((r) => ({
    year: r.year,
    savingsDividend: Number(r.savings_dividend),
    loanDividend: Number(r.loan_dividend),
    totalDividend: Number(r.total_dividend),
    status: r.status,
  }));
}

export function useDividendHistory() {
  const { member } = useAuth();
  return useQuery<DbDividendRecord[]>({
    queryKey: ['member', 'dividends', member?.id],
    queryFn: () => {
      if (!member?.id) throw new Error('Not authenticated');
      return fetchDividends(member.id);
    },
    enabled: !!member?.id,
  });
}

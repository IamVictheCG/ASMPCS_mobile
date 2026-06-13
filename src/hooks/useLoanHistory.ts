import { useQuery } from '@tanstack/react-query';
import { getLoanHistory } from '../api';
import type { LoanHistoryRecord } from '../types';

export function useLoanHistory() {
  return useQuery<LoanHistoryRecord[]>({
    queryKey: ['admin', 'loans', 'history'],
    queryFn: async () => {
      const res = await getLoanHistory();
      return res.data;
    },
  });
}

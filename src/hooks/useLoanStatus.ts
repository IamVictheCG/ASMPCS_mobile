import { useQuery } from '@tanstack/react-query';
import { getActiveLoan } from '../api';
import type { ActiveLoan } from '../types';

export function useLoanStatus() {
  return useQuery<ActiveLoan | null>({
    queryKey: ['member', 'loan', 'active'],
    queryFn: async () => {
      const res = await getActiveLoan();
      return res.data;
    },
  });
}

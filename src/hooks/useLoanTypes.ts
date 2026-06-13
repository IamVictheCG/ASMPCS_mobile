import { useQuery } from '@tanstack/react-query';
import { getLoanTypes } from '../api';
import type { LoanType } from '../types';

export function useLoanTypes() {
  return useQuery<LoanType[]>({
    queryKey: ['loans', 'types'],
    queryFn: async () => {
      const res = await getLoanTypes();
      return res.data;
    },
  });
}

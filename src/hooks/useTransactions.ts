import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../api';
import type { Transaction } from '../types';

export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ['member', 'transactions'],
    queryFn: async () => {
      const res = await getTransactions();
      return res.data;
    },
  });
}

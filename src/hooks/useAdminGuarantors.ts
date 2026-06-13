import { useQuery } from '@tanstack/react-query';
import { getGuarantorStats, getPendingGuarantors } from '../api';
import type { PendingGuarantor, StatItem } from '../types';

export function useGuarantorStats() {
  return useQuery<StatItem[]>({
    queryKey: ['admin', 'guarantors', 'stats'],
    queryFn: async () => {
      const res = await getGuarantorStats();
      return res.data;
    },
  });
}

export function usePendingGuarantors() {
  return useQuery<PendingGuarantor[]>({
    queryKey: ['admin', 'guarantors', 'pending'],
    queryFn: async () => {
      const res = await getPendingGuarantors();
      return res.data;
    },
  });
}

export function useAdminGuarantors() {
  const stats = useGuarantorStats();
  const pending = usePendingGuarantors();
  return { stats, pending };
}

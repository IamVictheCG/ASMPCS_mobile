import { useQuery } from '@tanstack/react-query';
import { getContributions, getContributionStats } from '../api';
import type { ContributionRow, StatItem } from '../types';

export function useContributionStats() {
  return useQuery<StatItem[]>({
    queryKey: ['admin', 'contributions', 'stats'],
    queryFn: async () => {
      const res = await getContributionStats();
      return res.data;
    },
  });
}

export function useContributionRows() {
  return useQuery<ContributionRow[]>({
    queryKey: ['admin', 'contributions', 'rows'],
    queryFn: async () => {
      const res = await getContributions();
      return res.data;
    },
  });
}

export function useContributions() {
  const stats = useContributionStats();
  const rows = useContributionRows();
  return { stats, rows };
}

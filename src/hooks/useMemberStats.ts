import { useQuery } from '@tanstack/react-query';
import { getContributionBars, getMemberStats } from '../api';
import type { BarData, StatItem } from '../types';

export function useMemberStats() {
  return useQuery<StatItem[]>({
    queryKey: ['member', 'stats'],
    queryFn: async () => {
      const res = await getMemberStats();
      return res.data;
    },
  });
}

export function useContributionBars() {
  return useQuery<BarData[]>({
    queryKey: ['member', 'contributionBars'],
    queryFn: async () => {
      const res = await getContributionBars();
      return res.data;
    },
  });
}

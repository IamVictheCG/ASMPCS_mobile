import { useQuery } from '@tanstack/react-query';
import {
  getActivityFeed,
  getAdminQuickStats,
  getAdminStats,
  getCollectionBars,
  getRecentDecisions,
} from '../api';
import { getLoanPipeline } from '../api';
import type { ActivityItem, BarData, LoanPipelineStage, QuickStat, RecentDecision, StatItem } from '../types';

export function useAdminMainStats() {
  return useQuery<StatItem[]>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await getAdminStats();
      return res.data;
    },
  });
}

export function useAdminQuickStats() {
  return useQuery<QuickStat[]>({
    queryKey: ['admin', 'quickStats'],
    queryFn: async () => {
      const res = await getAdminQuickStats();
      return res.data;
    },
  });
}

export function useCollectionBars() {
  return useQuery<BarData[]>({
    queryKey: ['admin', 'collectionBars'],
    queryFn: async () => {
      const res = await getCollectionBars();
      return res.data;
    },
  });
}

export function useActivityFeed() {
  return useQuery<ActivityItem[]>({
    queryKey: ['admin', 'activityFeed'],
    queryFn: async () => {
      const res = await getActivityFeed();
      return res.data;
    },
  });
}

export function useRecentDecisions() {
  return useQuery<RecentDecision[]>({
    queryKey: ['admin', 'recentDecisions'],
    queryFn: async () => {
      const res = await getRecentDecisions();
      return res.data;
    },
  });
}

export function useAdminLoanPipeline() {
  return useQuery<LoanPipelineStage[]>({
    queryKey: ['admin', 'loanPipeline'],
    queryFn: async () => {
      const res = await getLoanPipeline();
      return res.data;
    },
  });
}

export function useAdminStats() {
  const stats = useAdminMainStats();
  const quickStats = useAdminQuickStats();
  const collectionBars = useCollectionBars();
  const activityFeed = useActivityFeed();
  const recentDecisions = useRecentDecisions();
  const loanPipeline = useAdminLoanPipeline();
  return { stats, quickStats, collectionBars, activityFeed, recentDecisions, loanPipeline };
}

import { useQuery } from '@tanstack/react-query';
import { getLoanPipeline, getPendingLoans } from '../api';
import type { LoanPipelineStage, PendingLoan } from '../types';

export function useAdminLoanPendingList() {
  return useQuery<PendingLoan[]>({
    queryKey: ['admin', 'loans', 'pending'],
    queryFn: async () => {
      const res = await getPendingLoans();
      return res.data;
    },
  });
}

export function useAdminLoans() {
  const pipeline = useQuery<LoanPipelineStage[]>({
    queryKey: ['admin', 'loanPipeline'],
    queryFn: async () => {
      const res = await getLoanPipeline();
      return res.data;
    },
  });
  const pending = useAdminLoanPendingList();
  return { pipeline, pending };
}

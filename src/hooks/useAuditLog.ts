import { useQuery } from '@tanstack/react-query';
import { getAuditLog } from '../api';
import type { AuditEntry } from '../types';

export function useAuditLog() {
  return useQuery<AuditEntry[]>({
    queryKey: ['admin', 'audit'],
    queryFn: async () => {
      const res = await getAuditLog();
      return res.data;
    },
  });
}

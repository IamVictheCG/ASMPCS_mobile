import { useQuery } from '@tanstack/react-query';
import { getMembers } from '../api';
import type { MemberRecord } from '../types';

export function useAdminMembers() {
  return useQuery<MemberRecord[]>({
    queryKey: ['admin', 'members'],
    queryFn: async () => {
      const res = await getMembers();
      return res.data;
    },
  });
}

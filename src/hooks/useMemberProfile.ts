import { useQuery } from '@tanstack/react-query';
import { getMemberProfile } from '../api';
import type { Member } from '../types';

export function useMemberProfile() {
  return useQuery<Member>({
    queryKey: ['member', 'profile'],
    queryFn: async () => {
      const res = await getMemberProfile();
      return res.data;
    },
  });
}

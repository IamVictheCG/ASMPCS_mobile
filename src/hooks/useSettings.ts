import { useQuery } from '@tanstack/react-query';
import { getSocietySettings, getLoanParams } from '../api';
import type { LoanParams, SocietySettings } from '../types';

export function useSocietySettings() {
  return useQuery<SocietySettings>({
    queryKey: ['admin', 'settings', 'society'],
    queryFn: async () => {
      const res = await getSocietySettings();
      return res.data;
    },
  });
}

export function useLoanParams() {
  return useQuery<LoanParams>({
    queryKey: ['admin', 'settings', 'loan-params'],
    queryFn: async () => {
      const res = await getLoanParams();
      return res.data;
    },
  });
}

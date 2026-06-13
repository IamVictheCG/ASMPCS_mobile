import {
  CONTRIBUTION_BARS,
  DIVIDEND_HISTORY,
  MEMBER,
  MEMBER_STATS,
  TRANSACTIONS,
} from '../../data/member';
import type {
  ApiListResponse,
  ApiResponse,
  BarData,
  DividendRecord,
  Member,
  StatItem,
  Transaction,
} from '../../types';

const delay = () => new Promise<void>((r) => setTimeout(r, 200 + Math.random() * 200));

export async function getMemberProfile(): Promise<ApiResponse<Member>> {
  await delay();
  return { data: MEMBER };
}

export async function getMemberStats(): Promise<ApiListResponse<StatItem>> {
  await delay();
  return { data: MEMBER_STATS, meta: { total: MEMBER_STATS.length, page: 1, perPage: 10 } };
}

export async function getContributionBars(): Promise<ApiListResponse<BarData>> {
  await delay();
  return { data: CONTRIBUTION_BARS, meta: { total: CONTRIBUTION_BARS.length, page: 1, perPage: 12 } };
}

export async function getTransactions(): Promise<ApiListResponse<Transaction>> {
  await delay();
  return { data: TRANSACTIONS, meta: { total: TRANSACTIONS.length, page: 1, perPage: 10 } };
}

export async function getDividendHistory(): Promise<ApiListResponse<DividendRecord>> {
  await delay();
  return { data: DIVIDEND_HISTORY, meta: { total: DIVIDEND_HISTORY.length, page: 1, perPage: 10 } };
}

export async function changePassword(currentPassword: string, _newPassword: string): Promise<ApiResponse<null>> {
  await delay();
  if (currentPassword !== 'demo1234') {
    throw new Error('Current password is incorrect.');
  }
  return { data: null };
}

export async function toggleTwoFactor(_enabled: boolean): Promise<ApiResponse<null>> {
  await delay();
  return { data: null };
}

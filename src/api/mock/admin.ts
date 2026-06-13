import {
  ACTIVITY_FEED,
  ADMIN_QUICK_STATS,
  ADMIN_STATS,
  COLLECTION_BARS,
  CONTRIBUTION_STATS,
  GUARANTOR_STATS,
  MEMBERS,
  PENDING_GUARANTORS,
  RECENT_DECISIONS,
} from '../../data/admin';
import type {
  ActivityItem,
  ApiListResponse,
  ApiResponse,
  BarData,
  ContributionRow,
  LoanParams,
  MemberRecord,
  PendingGuarantor,
  QuickStat,
  RecentDecision,
  SocietySettings,
  StatItem,
} from '../../types';

const delay = () => new Promise<void>((r) => setTimeout(r, 200 + Math.random() * 200));

export async function getAdminStats(): Promise<ApiListResponse<StatItem>> {
  await delay();
  return { data: ADMIN_STATS, meta: { total: ADMIN_STATS.length, page: 1, perPage: 10 } };
}

export async function getAdminQuickStats(): Promise<ApiListResponse<QuickStat>> {
  await delay();
  return { data: ADMIN_QUICK_STATS, meta: { total: ADMIN_QUICK_STATS.length, page: 1, perPage: 10 } };
}

export async function getCollectionBars(): Promise<ApiListResponse<BarData>> {
  await delay();
  return { data: COLLECTION_BARS, meta: { total: COLLECTION_BARS.length, page: 1, perPage: 12 } };
}

export async function getActivityFeed(): Promise<ApiListResponse<ActivityItem>> {
  await delay();
  return { data: ACTIVITY_FEED, meta: { total: ACTIVITY_FEED.length, page: 1, perPage: 10 } };
}

export async function getRecentDecisions(): Promise<ApiListResponse<RecentDecision>> {
  await delay();
  return { data: RECENT_DECISIONS, meta: { total: RECENT_DECISIONS.length, page: 1, perPage: 10 } };
}

export async function getGuarantorStats(): Promise<ApiListResponse<StatItem>> {
  await delay();
  return { data: GUARANTOR_STATS, meta: { total: GUARANTOR_STATS.length, page: 1, perPage: 10 } };
}

export async function getPendingGuarantors(): Promise<ApiListResponse<PendingGuarantor>> {
  await delay();
  return { data: PENDING_GUARANTORS, meta: { total: PENDING_GUARANTORS.length, page: 1, perPage: 10 } };
}

export async function getMembers(): Promise<ApiListResponse<MemberRecord>> {
  await delay();
  return { data: MEMBERS, meta: { total: MEMBERS.length, page: 1, perPage: 20 } };
}

export async function getContributionStats(): Promise<ApiListResponse<StatItem>> {
  await delay();
  return { data: CONTRIBUTION_STATS, meta: { total: CONTRIBUTION_STATS.length, page: 1, perPage: 10 } };
}

export async function getMemberById(id: string): Promise<ApiResponse<MemberRecord | null>> {
  await delay();
  return { data: MEMBERS.find((m) => m.id === id) ?? null };
}

let _settings: SocietySettings = {
  name: 'Aerodrome Services Multi-Purpose Cooperative Society',
  regNo: 'RC-10274-FCT',
  address: 'FAAN HQ, Terminal 2, Nnamdi Azikiwe Intl Airport, Abuja',
  phone: '+234-9-523-4400',
  email: 'asmpcs@faan.gov.ng',
  bankName: 'Zenith Bank Plc',
  accountNo: '1012345678',
};

let _loanParams: LoanParams = {
  maxMultiplier: 3,
  iouRate: 0,
  shortTermRate: 5,
  propertyRate: 7,
  carRate: 10,
  maxTenureMonths: 36,
};

export async function getSocietySettings(): Promise<ApiResponse<SocietySettings>> {
  await delay();
  return { data: { ..._settings } };
}

export async function saveSocietySettings(data: SocietySettings): Promise<ApiResponse<null>> {
  await delay();
  _settings = { ...data };
  return { data: null };
}

export async function getLoanParams(): Promise<ApiResponse<LoanParams>> {
  await delay();
  return { data: { ..._loanParams } };
}

export async function saveLoanParams(data: LoanParams): Promise<ApiResponse<null>> {
  await delay();
  _loanParams = { ...data };
  return { data: null };
}

export async function getContributions(): Promise<ApiListResponse<ContributionRow>> {
  await delay();
  const rows: ContributionRow[] = [
    { id: 'FAAN-2021-0472', name: 'Aminu Okafor',   dept: 'ATC · Abuja',      month: 'May 2026', amount: '₦55,000', type: 'Payroll', balance: '₦1,248,500', status: 'credit' },
    { id: 'FAAN-2018-0214', name: 'Emeka Nwosu',    dept: 'ATC · Abuja',      month: 'May 2026', amount: '₦55,000', type: 'Payroll', balance: '₦980,500',   status: 'credit' },
    { id: 'FAAN-2019-0218', name: 'Fatima Bello',   dept: 'Pax Svc · Abuja', month: 'May 2026', amount: '₦40,000', type: 'Payroll', balance: '₦620,000',   status: 'credit' },
    { id: 'NAMA-2020-0091', name: 'Aisha Mohammed', dept: 'Nav · Abuja',      month: 'May 2026', amount: '₦30,000', type: 'Payroll', balance: '₦420,000',   status: 'credit' },
    { id: 'FAAN-2017-0099', name: 'James Adeyemi',  dept: 'Eng · Kano',       month: 'May 2026', amount: '₦60,000', type: 'Payroll', balance: '₦1,100,000', status: 'credit' },
    { id: 'FAAN-2014-0056', name: 'Bello Suleiman', dept: 'Security · Abuja', month: 'May 2026', amount: '—',       type: 'Failed',  balance: '₦1,240,000', status: 'debit'  },
    { id: 'FAAN-2021-0301', name: 'Chidinma Eze',   dept: 'Finance · Lagos',  month: 'May 2026', amount: '₦25,000', type: 'Payroll', balance: '₦380,000',   status: 'credit' },
  ];
  return { data: rows, meta: { total: rows.length, page: 1, perPage: 20 } };
}

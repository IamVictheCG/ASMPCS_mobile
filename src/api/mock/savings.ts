import { STATEMENT_ROWS } from '../../data/member';
import type { ApiListResponse, ApiResponse, SavingsSummary, StatementRow } from '../../types';

const delay = () => new Promise<void>((r) => setTimeout(r, 200 + Math.random() * 200));

export async function getSavingsSummary(): Promise<ApiResponse<SavingsSummary>> {
  await delay();
  return {
    data: {
      totalBalance: '₦1,248,500.00',
      monthlyDeduction: '₦55,000',
      ytdSavings: '+₦275,000 ↑',
      projectedYearEnd: '₦1,633,500',
      memberSince: 'Jan 2021',
      principalSavings: '₦1,083,500',
      investmentFund: '₦165,000',
      totalDividend2025: '₦87,395',
      maxLoanEligibility: '₦24,970,000',
      status: 'active',
    },
  };
}

export async function getStatementRows(): Promise<ApiListResponse<StatementRow>> {
  await delay();
  return { data: STATEMENT_ROWS, meta: { total: STATEMENT_ROWS.length, page: 1, perPage: 20 } };
}

import { LOAN_HISTORY, LOAN_PIPELINE, PENDING_LOANS } from '../../data/admin';
import type {
  ActiveLoan,
  ApiListResponse,
  ApiResponse,
  LoanDetail,
  LoanHistoryRecord,
  LoanPipelineStage,
  LoanType,
  PendingLoan,
} from '../../types';

const delay = () => new Promise<void>((r) => setTimeout(r, 200 + Math.random() * 200));

export async function getActiveLoan(): Promise<ApiResponse<ActiveLoan | null>> {
  await delay();
  return {
    data: {
      type: 'Property Loan',
      originalAmount: '₦1,000,000',
      outstanding: '₦150,000',
      monthlyPayment: '₦50,000',
      monthsRemaining: 3,
      percentRepaid: 85,
      nextPaymentDate: '09 Jun 2026',
      status: 'repaying',
    },
  };
}

export async function getLoanTypes(): Promise<ApiListResponse<LoanType>> {
  await delay();
  const types: LoanType[] = [
    { icon: '⚡', name: 'IOU (Emergency)',  desc: 'Quick emergency advance repayable within one month. Instant approval for eligible members.', maxLabel: 'Max Amount', maxVal: '₦20,000',      rateLabel: 'Tenure',        rateVal: '1 Month'    },
    { icon: '💳', name: 'Short-Term Loan',  desc: 'For consumer needs, medical, or personal emergencies. Repay over 3 months in 6 instalments.', maxLabel: 'Max Amount', maxVal: '₦50,000',      rateLabel: 'Interest Rate', rateVal: '5% p.a.'    },
    { icon: '🏠', name: 'Property Loan',    desc: 'For housing development or land purchase. Up to 2,000% of savings balance. Repayable over 36 months.', maxLabel: 'Max Amount', maxVal: '₦24,970,000', rateLabel: 'Interest Rate', rateVal: '7–10% p.a.' },
    { icon: '🚗', name: 'Car Loan',         desc: 'For new or used vehicle acquisition. Requires two guarantors and logbook as collateral.', maxLabel: 'Max Amount', maxVal: '₦5,000,000',   rateLabel: 'Interest Rate', rateVal: '10–15% p.a.' },
  ];
  return { data: types, meta: { total: types.length, page: 1, perPage: 10 } };
}

export interface LoanApplication {
  type: string;
  amount: string;
  tenure?: string;
  purpose: string;
  guarantor1?: string;
  guarantor2?: string;
  notes?: string;
}

export async function submitLoanApplication(application: LoanApplication): Promise<ApiResponse<{ applicationId: string }>> {
  await delay();
  const id = `LN-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  return { data: { applicationId: id } };
}

export async function getLoanPipeline(): Promise<ApiListResponse<LoanPipelineStage>> {
  await delay();
  return { data: LOAN_PIPELINE, meta: { total: LOAN_PIPELINE.length, page: 1, perPage: 10 } };
}

export async function getPendingLoans(): Promise<ApiListResponse<PendingLoan>> {
  await delay();
  return { data: PENDING_LOANS, meta: { total: PENDING_LOANS.length, page: 1, perPage: 20 } };
}

export async function getLoanHistory(): Promise<ApiListResponse<LoanHistoryRecord>> {
  await delay();
  return { data: LOAN_HISTORY, meta: { total: LOAN_HISTORY.length, page: 1, perPage: 20 } };
}

// ─── Admin loan actions ───────────────────────────────────────
const _statusMap = new Map<string, 'approved' | 'rejected'>();
const _reasonMap = new Map<string, string>();

const _EXTRA: Record<string, { purpose: string; guarantor1: string; guarantor2: string | null; documents: { name: string; docStatus: 'ok' | 'pending' | 'missing' }[] }> = {
  'LN-2026-041': { purpose: 'Purchase of residential land at Lugbe, FCT', guarantor1: 'Fatima Bello (FAAN-2019-0218)', guarantor2: null, documents: [{ name: 'Employment Verification Letter', docStatus: 'ok' }, { name: 'Payslips (last 3 months)', docStatus: 'ok' }, { name: 'Property Survey Plan', docStatus: 'pending' }, { name: 'Guarantor Form (G1)', docStatus: 'ok' }, { name: 'Guarantor Form (G2)', docStatus: 'missing' }] },
  'LN-2026-042': { purpose: 'Medical emergency — surgery for dependent', guarantor1: 'James Adeyemi (FAAN-2017-0099)', guarantor2: 'Musa Garba (NAMA-2023-0412)', documents: [{ name: 'Employment Verification Letter', docStatus: 'ok' }, { name: 'Payslips (last 3 months)', docStatus: 'ok' }, { name: 'Medical Report', docStatus: 'ok' }, { name: 'Guarantor Form (G1)', docStatus: 'ok' }, { name: 'Guarantor Form (G2)', docStatus: 'ok' }] },
  'LN-2026-043': { purpose: 'Purchase of 2023 Toyota Camry (used)', guarantor1: 'Fatima Bello (FAAN-2019-0218)', guarantor2: 'Aisha Mohammed (NAMA-2020-0091)', documents: [{ name: 'Employment Verification Letter', docStatus: 'ok' }, { name: 'Payslips (last 3 months)', docStatus: 'ok' }, { name: 'Vehicle Valuation Report', docStatus: 'ok' }, { name: 'Guarantor Form (G1)', docStatus: 'ok' }, { name: 'Guarantor Form (G2)', docStatus: 'ok' }] },
  'LN-2026-044': { purpose: 'Construction of 3-bedroom bungalow at Kuje', guarantor1: 'James Adeyemi (FAAN-2017-0099)', guarantor2: 'Emeka Nwosu (FAAN-2018-0214)', documents: [{ name: 'Employment Verification Letter', docStatus: 'ok' }, { name: 'Payslips (last 3 months)', docStatus: 'ok' }, { name: 'Approved Building Plan', docStatus: 'pending' }, { name: 'Land Certificate (C-of-O)', docStatus: 'ok' }, { name: 'Guarantor Form (G1)', docStatus: 'ok' }, { name: 'Guarantor Form (G2)', docStatus: 'ok' }] },
  'LN-2026-045': { purpose: 'Emergency travel — family bereavement', guarantor1: 'N/A (IOU — no guarantor required)', guarantor2: null, documents: [{ name: 'Employment Verification Letter', docStatus: 'ok' }, { name: 'Payslip (last month)', docStatus: 'ok' }] },
  'LN-2026-046': { purpose: 'School fees — tertiary institution', guarantor1: 'James Adeyemi (FAAN-2017-0099)', guarantor2: 'Chidinma Eze (FAAN-2021-0301)', documents: [{ name: 'Employment Verification Letter', docStatus: 'ok' }, { name: 'Payslips (last 3 months)', docStatus: 'ok' }, { name: 'Fees Invoice / Admission Letter', docStatus: 'ok' }, { name: 'Guarantor Form (G1)', docStatus: 'ok' }, { name: 'Guarantor Form (G2)', docStatus: 'ok' }] },
  'LN-2026-047': { purpose: 'Purchase of 2022 Honda CR-V (used)', guarantor1: 'Emeka Nwosu (FAAN-2018-0214)', guarantor2: null, documents: [{ name: 'Employment Verification Letter', docStatus: 'ok' }, { name: 'Payslips (last 3 months)', docStatus: 'ok' }, { name: 'Vehicle Valuation Report', docStatus: 'pending' }, { name: 'Guarantor Form (G1)', docStatus: 'ok' }, { name: 'Guarantor Form (G2)', docStatus: 'missing' }] },
};

export async function getLoanById(id: string): Promise<ApiResponse<LoanDetail | null>> {
  await delay();
  const base = PENDING_LOANS.find((l) => l.id === id);
  if (!base) return { data: null };
  const extra = _EXTRA[id] ?? { purpose: 'Personal loan purpose', guarantor1: 'N/A', guarantor2: null, documents: [] };
  const status = _statusMap.get(id) ?? base.status;
  const rejectionReason = _reasonMap.get(id);
  return { data: { ...base, ...extra, status, ...(rejectionReason ? { rejectionReason } : {}) } };
}

export async function approveLoan(id: string): Promise<ApiResponse<null>> {
  await delay();
  _statusMap.set(id, 'approved');
  return { data: null };
}

export async function rejectLoan(id: string, reason: string): Promise<ApiResponse<null>> {
  await delay();
  _statusMap.set(id, 'rejected');
  _reasonMap.set(id, reason);
  return { data: null };
}

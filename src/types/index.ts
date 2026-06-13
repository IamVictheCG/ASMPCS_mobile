// ─── API response wrappers ────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
  };
}

// ─── Member profile ───────────────────────────────────────────
export interface Member {
  name: string;
  firstName: string;
  initials: string;
  staffId: string;
  memberId: string;
  department: string;
  station: string;
  phone: string;
  email: string;
  dob: string;
  joined: string;
  membership: string;
  zone: string;
  role: string;
  nokName: string;
  nokRel: string;
  nokPhone: string;
}

// ─── Stat cards ───────────────────────────────────────────────
export interface StatItem {
  icon: string;
  value: string;
  label: string;
  change: string;
  changeDir: 'up' | 'down' | 'warn' | 'neutral';
  variant: 'blue' | 'gold' | 'green' | 'red' | 'purple';
}

export interface QuickStat {
  icon: string;
  iconColor: 'red' | 'green' | 'gold';
  label: string;
  value: string;
}

// ─── Chart bars ───────────────────────────────────────────────
export interface BarData {
  label: string;
  heightPct: number;
  variant?: 'teal' | 'gold';
  faded?: boolean;
}

// ─── Transactions ─────────────────────────────────────────────
export interface Transaction {
  icon: string;
  iconColor: 'green' | 'red' | 'blue' | 'gold';
  title: string;
  sub: string;
  amount: string;
  type: 'credit' | 'debit';
}

// ─── Savings ─────────────────────────────────────────────────
export interface SavingsSummary {
  totalBalance: string;
  monthlyDeduction: string;
  ytdSavings: string;
  projectedYearEnd: string;
  memberSince: string;
  principalSavings: string;
  investmentFund: string;
  totalDividend2025: string;
  maxLoanEligibility: string;
  status: 'active' | 'inactive';
}

export interface StatementRow {
  date: string;
  desc: string;
  ref: string;
  credit: string;
  debit: string;
  balance: string;
  status: 'credit' | 'debit';
}

export interface DividendRecord {
  year: string;
  savings: string;
  loan: string;
  total: string;
}

// ─── Loans ────────────────────────────────────────────────────
export interface ActiveLoan {
  type: string;
  originalAmount: string;
  outstanding: string;
  monthlyPayment: string;
  monthsRemaining: number;
  percentRepaid: number;
  nextPaymentDate: string;
  status: 'repaying' | 'approved' | 'overdue';
}

export interface LoanType {
  icon: string;
  name: string;
  desc: string;
  maxLabel: string;
  maxVal: string;
  rateLabel: string;
  rateVal: string;
}

export interface LoanPipelineStage {
  count: number;
  label: string;
  val: string;
  variant: 'pending' | 'review' | 'approved' | 'rejected';
}

export interface PendingLoan {
  id: string;
  member: string;
  staffId: string;
  type: string;
  amount: string;
  tenure: string;
  submitted: string;
  guarantors: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface LoanDetail extends PendingLoan {
  purpose: string;
  guarantor1: string;
  guarantor2: string | null;
  documents: { name: string; docStatus: 'ok' | 'pending' | 'missing' }[];
}

export interface LoanHistoryRecord {
  id: string;
  member: string;
  type: string;
  amount: string;
  interest: string;
  approvedBy: string;
  disbursed: string;
  outstanding: string;
  status: 'disbursed' | 'repaying' | 'rejected' | 'approved' | 'overdue';
}

// ─── Commodities ──────────────────────────────────────────────
export type StockLevel = 'high' | 'med' | 'low';

export interface Commodity {
  emoji: string;
  bg: string;
  name: string;
  price: string;
  stock: string;
  stockPct: number;
  stockLevel: StockLevel;
  category: string;
}

export interface CommoditySummary {
  creditLimit: string;
  creditUsed: string;
  availableCredit: string;
  pendingOrders: number;
}

// ─── Notifications ────────────────────────────────────────────
export interface Notification {
  icon: string;
  iconColor: 'green' | 'gold' | 'blue' | 'red';
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

// ─── Activity feed ────────────────────────────────────────────
export interface ActivityItem {
  color: 'green' | 'gold' | 'red' | 'blue' | 'purple';
  text: string;
  sub: string;
  time: string;
}

// ─── Admin ────────────────────────────────────────────────────
export interface RecentDecision {
  member: string;
  amount: string;
  type: string;
  status: 'approved' | 'rejected';
  date: string;
}

export interface PendingGuarantor {
  loanId: string;
  applicant: string;
  amount: string;
  guarantor: string;
  requested: string;
  daysPending: string;
}

export interface MemberRecord {
  id: string;
  name: string;
  dept: string;
  zone: string;
  savings: string;
  loan: string;
  joined: string;
  status: 'active' | 'overdue';
}

export interface ContributionRow {
  id: string;
  name: string;
  dept: string;
  month: string;
  amount: string;
  type: string;
  balance: string;
  status: 'credit' | 'debit';
}

// ─── Audit log ────────────────────────────────────────────────
export interface AuditEntry {
  id: string;
  timestamp: string;
  adminUsername: string;
  actionType: string;
  affectedId: string;
  description: string;
}

// ─── Settings ─────────────────────────────────────────────────
export interface SocietySettings {
  name: string;
  regNo: string;
  address: string;
  phone: string;
  email: string;
  bankName: string;
  accountNo: string;
}

export interface LoanParams {
  maxMultiplier: number;
  iouRate: number;
  shortTermRate: number;
  propertyRate: number;
  carRate: number;
  maxTenureMonths: number;
}

import type { ActivityItem } from '../components/ActivityFeed';
import type { BarData } from '../components/ChartBars';

// ─── Dashboard stats ──────────────────────────────────────────
export const ADMIN_STATS = [
  { icon: '👥', value: '1,247',    label: 'Total Active Members',     change: '↑ 14 new this month',   changeDir: 'up'   as const, variant: 'blue'   as const },
  { icon: '🏦', value: '₦284.7M', label: 'Total Loan Portfolio',     change: '7 pending approval',     changeDir: 'warn' as const, variant: 'gold'   as const },
  { icon: '💰', value: '₦612.4M', label: 'Total Savings Pool',       change: '↑ ₦68.6M this year',    changeDir: 'up'   as const, variant: 'green'  as const },
  { icon: '⚠️', value: '23',       label: 'Overdue Loan Accounts',    change: '↑ 3 from last month',   changeDir: 'down' as const, variant: 'red'    as const },
];

export const ADMIN_QUICK_STATS = [
  { icon: '🏦', iconColor: 'red'   as const, label: 'Pending Approvals',    value: '7'      },
  { icon: '✅', iconColor: 'green' as const, label: 'Approved This Month',  value: '42'     },
  { icon: '💳', iconColor: 'gold'  as const, label: 'Disbursed This Month', value: '₦38.2M' },
];

// ─── Monthly collections vs disbursements chart ───────────────
export const COLLECTION_BARS: BarData[] = [
  { label: 'Jan', heightPct: 75,  variant: 'teal' },
  { label: '',    heightPct: 45,  variant: 'gold' },
  { label: 'Feb', heightPct: 78,  variant: 'teal' },
  { label: '',    heightPct: 52,  variant: 'gold' },
  { label: 'Mar', heightPct: 72,  variant: 'teal' },
  { label: '',    heightPct: 48,  variant: 'gold' },
  { label: 'Apr', heightPct: 80,  variant: 'teal' },
  { label: '',    heightPct: 56,  variant: 'gold' },
  { label: 'May', heightPct: 82,  variant: 'teal' },
  { label: '',    heightPct: 55,  variant: 'gold' },
];

// ─── Live activity feed ───────────────────────────────────────
export const ACTIVITY_FEED: ActivityItem[] = [
  { color: 'red',    text: 'Emeka Nwosu submitted Property Loan ₦500,000',    sub: '4 mins ago · Awaiting review',           time: '09:41'    },
  { color: 'green',  text: 'May payroll deduction processed — 1,247 members',  sub: 'FAAN & NAMA · ₦68.6M total',            time: '08:30'    },
  { color: 'blue',   text: 'Fatima Bello loan disbursed — ₦200,000',           sub: 'Short-term · GTBank account',            time: '08:15'    },
  { color: 'gold',   text: '3 guarantor consents received',                     sub: 'Loan refs: LN-2026-044, -045, -046',    time: '07:52'    },
  { color: 'purple', text: 'New member registered — Aisha Mohammed',            sub: 'NAMA-2026-0091 · Zone B',               time: 'Yesterday'},
  { color: 'red',    text: 'Overdue alert — Bello Suleiman',                    sub: '₦85,000 overdue · 47 days',             time: 'Yesterday'},
  { color: 'green',  text: 'Rice restock confirmed — 600 bags',                 sub: 'Commodities store updated',             time: '14 May'   },
];

// ─── Recent loan decisions (dashboard) ───────────────────────
export const RECENT_DECISIONS = [
  { member: 'Fatima Bello',   amount: '₦200,000',   type: 'Short-Term', status: 'approved' as const, date: '15 May' },
  { member: 'James Adeyemi',  amount: '₦1,200,000', type: 'Property',   status: 'approved' as const, date: '14 May' },
  { member: 'Chidinma Eze',   amount: '₦800,000',   type: 'Car Loan',   status: 'rejected' as const, date: '14 May' },
  { member: 'Musa Garba',     amount: '₦20,000',    type: 'IOU',        status: 'approved' as const, date: '13 May' },
  { member: 'Ngozi Obi',      amount: '₦50,000',    type: 'Short-Term', status: 'approved' as const, date: '12 May' },
];

// ─── Loan pipeline ────────────────────────────────────────────
export const LOAN_PIPELINE = [
  { count: 7,  label: 'Awaiting Review',        val: '₦7,350,000 total',     variant: 'pending'  as const },
  { count: 3,  label: 'Under Committee Review', val: '₦2,800,000 total',     variant: 'review'   as const },
  { count: 42, label: 'Approved This Month',    val: '₦38,200,000 disbursed',variant: 'approved' as const },
  { count: 8,  label: 'Rejected This Month',    val: 'Bye-law conditions not met', variant: 'rejected' as const },
];

// ─── Pending loan applications ────────────────────────────────
export const PENDING_LOANS = [
  { id: 'LN-2026-041', member: 'Emeka Nwosu',      staffId: 'FAAN-2018-0214', type: 'Property',   amount: '₦500,000',   tenure: '18 Mo.', submitted: '12 May', guarantors: '1/2 ✅', status: 'pending' as const },
  { id: 'LN-2026-042', member: 'Aisha Mohammed',   staffId: 'NAMA-2020-0091', type: 'Short-Term', amount: '₦50,000',    tenure: '6 Mo.',  submitted: '13 May', guarantors: '2/2 ✅', status: 'pending' as const },
  { id: 'LN-2026-043', member: 'Chukwudi Okonkwo', staffId: 'FAAN-2015-0087', type: 'Car Loan',   amount: '₦1,200,000', tenure: '24 Mo.', submitted: '13 May', guarantors: '2/2 ✅', status: 'pending' as const },
  { id: 'LN-2026-044', member: 'Yetunde Adeola',   staffId: 'FAAN-2012-0033', type: 'Property',   amount: '₦2,000,000', tenure: '36 Mo.', submitted: '14 May', guarantors: '2/2 ✅', status: 'pending' as const },
  { id: 'LN-2026-045', member: 'Kabiru Yusuf',     staffId: 'NAMA-2022-0174', type: 'IOU',        amount: '₦20,000',    tenure: '1 Mo.',  submitted: '15 May', guarantors: 'N/A',    status: 'pending' as const },
  { id: 'LN-2026-046', member: 'Ngozi Eze',        staffId: 'FAAN-2019-0218', type: 'Short-Term', amount: '₦50,000',    tenure: '6 Mo.',  submitted: '15 May', guarantors: '2/2 ✅', status: 'pending' as const },
  { id: 'LN-2026-047', member: 'Suleiman Bala',    staffId: 'FAAN-2016-0142', type: 'Car Loan',   amount: '₦1,530,000', tenure: '30 Mo.', submitted: '16 May', guarantors: '1/2 ✅', status: 'pending' as const },
];

// ─── Loan history ─────────────────────────────────────────────
export const LOAN_HISTORY = [
  { id: 'LN-2026-040', member: 'Fatima Bello',   type: 'Short-Term', amount: '₦200,000',   interest: '5%',  approvedBy: 'Financial Sec.', disbursed: '15 May',  outstanding: '₦0',         status: 'disbursed' as const },
  { id: 'LN-2026-039', member: 'James Adeyemi',  type: 'Property',   amount: '₦1,200,000', interest: '7%',  approvedBy: 'President',      disbursed: '14 May',  outstanding: '₦1,200,000', status: 'repaying'  as const },
  { id: 'LN-2026-038', member: 'Chidinma Eze',   type: 'Car Loan',   amount: '₦800,000',   interest: '10%', approvedBy: 'Credit Comm.',   disbursed: '—',       outstanding: '—',          status: 'rejected'  as const },
  { id: 'LN-2026-037', member: 'Musa Garba',     type: 'IOU',        amount: '₦20,000',    interest: '0%',  approvedBy: 'Treasurer',      disbursed: '13 May',  outstanding: '₦0',         status: 'approved'  as const },
  { id: 'LN-2026-036', member: 'Ngozi Obi',      type: 'Short-Term', amount: '₦50,000',    interest: '5%',  approvedBy: 'Financial Sec.', disbursed: '12 May',  outstanding: '₦50,000',    status: 'repaying'  as const },
  { id: 'LN-2026-035', member: 'Bello Suleiman', type: 'Property',   amount: '₦3,000,000', interest: '7%',  approvedBy: 'President',      disbursed: '10 May',  outstanding: '₦2,915,000', status: 'overdue'   as const },
  { id: 'LN-2026-034', member: 'Aisha Ibrahim',  type: 'Short-Term', amount: '₦40,000',    interest: '5%',  approvedBy: 'Financial Sec.', disbursed: '08 May',  outstanding: '₦0',         status: 'approved'  as const },
];

// ─── Guarantors ───────────────────────────────────────────────
export const GUARANTOR_STATS = [
  { icon: '⏳', value: '3',   label: 'Awaiting Guarantor Consent',     change: 'Action required',       changeDir: 'warn' as const, variant: 'gold'  as const },
  { icon: '✅', value: '186', label: 'Active Guarantor Agreements',    change: 'All digitally signed',  changeDir: 'up'   as const, variant: 'green' as const },
  { icon: '⚠️', value: '4',   label: 'Guarantors on Defaulted Loans',  change: 'Recovery initiated',   changeDir: 'down' as const, variant: 'red'   as const },
];

export const PENDING_GUARANTORS = [
  { loanId: 'LN-2026-041', applicant: 'Emeka Nwosu',    amount: '₦500,000',   guarantor: 'Fatima Bello',      requested: '12 May', daysPending: '4 days' },
  { loanId: 'LN-2026-047', applicant: 'Suleiman Bala',  amount: '₦1,530,000', guarantor: 'Chukwudi Okonkwo',  requested: '15 May', daysPending: '1 day'  },
  { loanId: 'LN-2026-044', applicant: 'Yetunde Adeola', amount: '₦2,000,000', guarantor: 'Chidinma Eze',      requested: '14 May', daysPending: '2 days' },
];

// ─── Members ──────────────────────────────────────────────────
export const MEMBERS = [
  { id: 'FAAN-2018-0214', name: 'Emeka Nwosu',      dept: 'ATC · Abuja',        zone: 'Zone A', savings: '₦980,500',   loan: 'None',        joined: 'Mar 2018', status: 'active'  as const },
  { id: 'FAAN-2019-0218', name: 'Fatima Bello',     dept: 'Pax Svc · Abuja',   zone: 'Zone A', savings: '₦620,000',   loan: '₦200,000',    joined: 'Jun 2019', status: 'active'  as const },
  { id: 'NAMA-2020-0091', name: 'Aisha Mohammed',   dept: 'Navigation · Abuja', zone: 'Zone B', savings: '₦420,000',   loan: '₦50,000',     joined: 'Jan 2020', status: 'active'  as const },
  { id: 'FAAN-2014-0056', name: 'Bello Suleiman',   dept: 'Security · Abuja',   zone: 'Zone A', savings: '₦1,240,000', loan: '₦2,915,000',  joined: 'Sep 2014', status: 'overdue' as const },
  { id: 'FAAN-2017-0099', name: 'James Adeyemi',    dept: 'Engineering · Kano', zone: 'Zone A', savings: '₦1,100,000', loan: '₦1,200,000',  joined: 'Feb 2017', status: 'active'  as const },
  { id: 'FAAN-2021-0301', name: 'Chidinma Eze',     dept: 'Finance · Lagos',    zone: 'Zone A', savings: '₦380,000',   loan: 'None',        joined: 'Apr 2021', status: 'active'  as const },
  { id: 'NAMA-2023-0412', name: 'Musa Garba',       dept: 'Navigation · PHC',   zone: 'Zone B', savings: '₦180,000',   loan: 'None',        joined: 'Jan 2023', status: 'active'  as const },
];

// ─── Contributions ────────────────────────────────────────────
export const CONTRIBUTION_STATS = [
  { icon: '💰', value: '₦68.6M',  label: 'May 2026 Collections',       change: '↑ 2.4% from April',        changeDir: 'up'   as const, variant: 'green' as const },
  { icon: '👥', value: '1,247',   label: 'Members Deducted',            change: '100% payroll success',     changeDir: 'up'   as const, variant: 'blue'  as const },
  { icon: '⚠️', value: '6',       label: 'Failed Deductions',           change: 'Manual follow-up needed',  changeDir: 'warn' as const, variant: 'gold'  as const },
  { icon: '📊', value: '₦612.4M', label: 'Total Savings Pool (YTD)',    change: '↑ ₦68.6M this year',       changeDir: 'up'   as const, variant: 'green' as const },
];

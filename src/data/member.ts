import type { Transaction } from '../components/TransactionList';
import type { BarData } from '../components/ChartBars';
import type { ActivityItem } from '../components/ActivityFeed';

// ─── Member profile ───────────────────────────────────────────
export const MEMBER = {
  name:       'Aminu Okafor',
  firstName:  'Aminu',
  initials:   'AO',
  staffId:    'FAAN-2021-0472',
  memberId:   'ASMPCS-FAAN-2021-0472',
  department: 'Air Traffic Control',
  station:    'Abuja International Airport',
  phone:      '+234 803 ••• ••71',
  email:      'a.okafor@faan.gov.ng',
  dob:        '••/••/1988',
  joined:     'January 2021',
  membership: '5 Years 4 Months',
  zone:       'Zone A (FAAN)',
  role:       'Air Traffic Staff',
  nokName:    'Ngozi Okafor',
  nokRel:     'Spouse',
  nokPhone:   '+234 806 ••• ••55',
};

// ─── Dashboard stats ──────────────────────────────────────────
export const MEMBER_STATS = [
  { icon: '💰', value: '₦1,248,500', label: 'Total Savings Balance',  change: '↑ ₦55,000 this month', changeDir: 'up'  as const, variant: 'blue'  as const },
  { icon: '🏦', value: '₦850,000',   label: 'Active Loan Balance',    change: '₦150,000 repaid',      changeDir: 'down'as const, variant: 'gold'  as const },
  { icon: '📈', value: '₦87,395',    label: 'Dividend Earned (2025)', change: '↑ 7.2% from 2024',    changeDir: 'up'  as const, variant: 'green' as const },
  { icon: '🛒', value: '₦42,000',    label: 'Commodity Credit Used',  change: '2 orders this quarter', changeDir: 'up'  as const, variant: 'red'   as const },
];

// ─── Monthly contribution chart ───────────────────────────────
export const CONTRIBUTION_BARS: BarData[] = [
  { label: 'Jan', heightPct: 55 },
  { label: 'Feb', heightPct: 60 },
  { label: 'Mar', heightPct: 55 },
  { label: 'Apr', heightPct: 80, variant: 'gold' },
  { label: 'May', heightPct: 55 },
  { label: 'Jun', heightPct: 20, faded: true },
  { label: 'Jul', heightPct: 20, faded: true },
  { label: 'Aug', heightPct: 20, faded: true },
];

// ─── Recent transactions ──────────────────────────────────────
export const TRANSACTIONS: Transaction[] = [
  { icon: '💰', iconColor: 'green', title: 'Monthly Savings Deduction',       sub: 'FAAN Payroll · 09 May 2026',  amount: '+₦55,000',  type: 'credit' },
  { icon: '🏦', iconColor: 'red',   title: 'Loan Repayment — Property Loan',  sub: 'Auto-deduction · 09 May 2026', amount: '-₦50,000',  type: 'debit'  },
  { icon: '🛒', iconColor: 'gold',  title: 'Commodity Order — Rice (25kg × 2)',sub: 'ASMPCS Store · 28 Apr 2026',   amount: '-₦18,000',  type: 'debit'  },
  { icon: '📈', iconColor: 'blue',  title: '2025 Annual Dividend Disbursed',   sub: 'ASMPCS · 11 Mar 2026',          amount: '+₦87,395',  type: 'credit' },
  { icon: '💰', iconColor: 'green', title: 'Monthly Savings Deduction',        sub: 'FAAN Payroll · 22 Apr 2026',   amount: '+₦55,000',  type: 'credit' },
];

// ─── Savings statement rows ───────────────────────────────────
export const STATEMENT_ROWS = [
  { date: '09 May 2026', desc: 'Payroll Deduction – May',    ref: 'FAAN/MAY/0472',  credit: '55,000.00', debit: '—', balance: '1,248,500.00', status: 'credit' as const },
  { date: '22 Apr 2026', desc: 'Payroll Deduction – Apr',    ref: 'FAAN/APR/0472',  credit: '55,000.00', debit: '—', balance: '1,193,500.00', status: 'credit' as const },
  { date: '28 Apr 2026', desc: 'Additional Deposit',         ref: 'DEP/APR/00241',  credit: '30,000.00', debit: '—', balance: '1,138,500.00', status: 'credit' as const },
  { date: '11 Mar 2026', desc: 'Dividend Disbursement 2025', ref: 'DIV/2025/0472',  credit: '87,395.00', debit: '—', balance: '1,108,500.00', status: 'credit' as const },
  { date: '18 Mar 2026', desc: 'Payroll Deduction – Mar',    ref: 'FAAN/MAR/0472',  credit: '55,000.00', debit: '—', balance: '1,021,105.00', status: 'credit' as const },
  { date: '23 Feb 2026', desc: 'Payroll Deduction – Feb',    ref: 'FAAN/FEB/0472',  credit: '55,000.00', debit: '—', balance:   '966,105.00', status: 'credit' as const },
  { date: '29 Jan 2026', desc: 'Payroll Deduction – Jan',    ref: 'FAAN/JAN/0472',  credit: '55,000.00', debit: '—', balance:   '911,105.00', status: 'credit' as const },
];

// ─── Notifications ────────────────────────────────────────────
export const NOTIFICATIONS = [
  { icon: '✅', iconColor: 'green' as const, title: 'Loan Application Approved', body: 'Your short-term loan of ₦50,000 has been approved by the Credit Committee. Disbursement will be processed within 24 hours.', time: '2 hours ago · 11 May 2026', unread: true },
  { icon: '💰', iconColor: 'gold'  as const, title: 'Monthly Deduction Processed', body: 'Your May 2026 savings deduction of ₦55,000 has been successfully processed from your FAAN payroll. New balance: ₦1,248,500.', time: '6 hours ago · 09 May 2026', unread: true },
  { icon: '📢', iconColor: 'blue'  as const, title: 'AGM 2026 — Save the Date', body: 'The Annual General Meeting is scheduled for Saturday 18 July 2026 at the NAIA Conference Centre. Attendance is mandatory for all members.', time: 'Yesterday · 10 May 2026', unread: true },
  { icon: '🛒', iconColor: 'gold'  as const, title: 'New Stock Available — Rice & Oil', body: '600 bags of Marbeli Rice and 132 cartons of Max Oil have been restocked. Members can now order via the Commodities section.', time: '3 days ago · 08 May 2026', unread: false },
  { icon: '📈', iconColor: 'green' as const, title: '2025 Annual Dividend Disbursed', body: 'Your 2025 dividend of ₦87,395.00 has been credited to your savings account. This reflects your savings (35%) and loan patronage (23%).', time: '2 months ago · 11 Mar 2026', unread: false },
  { icon: '🏦', iconColor: 'blue'  as const, title: 'Loan Repayment Reminder', body: 'Your next property loan repayment of ₦50,000 is due on 09 Jun 2026. Outstanding balance: ₦150,000.', time: '2 weeks ago · 25 Apr 2026', unread: false },
  { icon: '⚠️', iconColor: 'red'   as const, title: 'Guarantor Request — Action Required', body: 'Member Fatima Bello (FAAN-2019-0218) has listed you as a guarantor for a loan of ₦200,000. Please review and approve within 7 days.', time: '3 weeks ago · 18 Apr 2026', unread: false },
];

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

export const COMMODITIES: Commodity[] = [
  { emoji: '🌾', bg: '#1a3a1a', name: 'Marbeli Rice (25kg)',   price: '₦18,000',  stock: '103 bags in stock',         stockPct: 78, stockLevel: 'high', category: 'Food & Staples'  },
  { emoji: '🫙', bg: '#3a2a00', name: 'Max Vegetable Oil (5L)',price: '₦8,500',   stock: '132 cartons in stock',      stockPct: 90, stockLevel: 'high', category: 'Food & Staples'  },
  { emoji: '💻', bg: '#0a1a3a', name: 'HP Laptop (Intel i5)',  price: '₦420,000', stock: '8 units available',         stockPct: 20, stockLevel: 'low',  category: 'Electronics'     },
  { emoji: '🧂', bg: '#3a0a0a', name: 'Seasoning Bundle Pack', price: '₦3,200',   stock: '200+ bundles available',    stockPct: 95, stockLevel: 'high', category: 'Food & Staples'  },
  { emoji: '📱', bg: '#0a1a3a', name: 'Samsung Galaxy A55',    price: '₦280,000', stock: '15 units available',        stockPct: 45, stockLevel: 'med',  category: 'Electronics'     },
  { emoji: '🧱', bg: '#1a3a1a', name: 'Blocks (per unit)',     price: '₦700',     stock: '4,500 blocks in stock',     stockPct: 82, stockLevel: 'high', category: 'Appliances'      },
  { emoji: '🧴', bg: '#3a2a00', name: 'Personal Care Bundle',  price: '₦4,800',   stock: '56 bundles available',      stockPct: 55, stockLevel: 'med',  category: 'Personal Care'   },
  { emoji: '🖨️', bg: '#0a1a3a', name: 'HP LaserJet Printer',  price: '₦185,000', stock: '3 units — Low stock!',      stockPct: 12, stockLevel: 'low',  category: 'Electronics'     },
];

export const COMMODITY_FILTERS = ['All Items', 'Food & Staples', 'Electronics', 'Appliances', 'Personal Care', 'My Orders'];

// ─── Dividend history (profile page) ─────────────────────────
export const DIVIDEND_HISTORY = [
  { year: '2025', savings: '₦54,221', loan: '₦33,174', total: '₦87,395' },
  { year: '2024', savings: '₦42,150', loan: '₦26,810', total: '₦68,960' },
  { year: '2023', savings: '₦38,400', loan: '₦21,330', total: '₦59,730' },
  { year: '2022', savings: '₦20,100', loan: '₦8,440',  total: '₦28,540' },
];

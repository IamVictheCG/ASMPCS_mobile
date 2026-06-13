// Hand-generated from supabase/migrations/001_initial_schema.sql
// Run `npx supabase gen types typescript --project-id 04b23819-2edb-424c-bb3d-830e4ee9849d > src/types/database.ts`
// after running `supabase login` to get the auto-generated version.

export type MembershipStatus = 'active' | 'inactive' | 'suspended';
export type Agency = 'FAAN' | 'NAAM' | 'AIB' | 'STAFF_SCHOOL';
export type ContributionStatus = 'confirmed' | 'pending' | 'reversed';
export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'overdue';
export type LoanType = 'iou' | 'short_term' | 'property' | 'car';
export type RepaymentStatus = 'paid' | 'unpaid' | 'overdue';
export type GuarantorStatus = 'pending' | 'accepted' | 'rejected';
export type CommodityCategory = 'food_staples' | 'electronics' | 'building_materials' | 'personal_care';
export type OrderStatus = 'pending' | 'processing' | 'ready' | 'collected' | 'cancelled';
export type NotificationType =
  | 'loan_approved'
  | 'loan_rejected'
  | 'contribution_recorded'
  | 'new_commodity'
  | 'loan_overdue'
  | 'general'
  | 'order_placed';
export type DividendStatus = 'computed' | 'approved' | 'paid';

// ─── Table row shapes ─────────────────────────────────────────

export interface MemberRow {
  id: string;
  auth_id: string | null;
  staff_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  agency: Agency | null;
  zone: string | null;
  department: string | null;
  date_joined: string | null;
  membership_status: MembershipStatus;
  next_of_kin_name: string | null;
  next_of_kin_phone: string | null;
  next_of_kin_relationship: string | null;
  avatar_url: string | null;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsContributionRow {
  id: string;
  member_id: string;
  amount: number;
  month: number;
  year: number;
  recorded_by: string | null;
  payment_method: string;
  reference_number: string | null;
  status: ContributionStatus;
  created_at: string;
}

export interface LoanRow {
  id: string;
  member_id: string;
  loan_type: LoanType;
  amount_requested: number;
  amount_approved: number | null;
  interest_rate: number;
  tenure_months: number | null;
  monthly_installment: number | null;
  total_repayable: number | null;
  amount_repaid: number;
  outstanding_balance: number | null;
  purpose: string | null;
  status: LoanStatus;
  applied_at: string;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanRepaymentRow {
  id: string;
  loan_id: string;
  member_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: RepaymentStatus;
  reference_number: string | null;
  created_at: string;
}

export interface CommodityRow {
  id: string;
  name: string;
  category: CommodityCategory;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommodityOrderRow {
  id: string;
  member_id: string;
  commodity_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: OrderStatus;
  ordered_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  member_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferencesRow {
  id: string;
  member_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  loan_updates: boolean;
  contribution_updates: boolean;
  commodity_updates: boolean;
  created_at: string;
  updated_at: string;
}

export interface DividendRow {
  id: string;
  member_id: string;
  year: number;
  savings_dividend: number;
  loan_dividend: number;
  total_dividend: number;
  status: DividendStatus;
  paid_at: string | null;
  created_at: string;
}

// ─── Supabase join shapes ─────────────────────────────────────

export interface LoanWithRepayments extends LoanRow {
  loan_repayments: LoanRepaymentRow[];
}

export interface OrderWithCommodity extends CommodityOrderRow {
  commodities: { name: string } | null;
}

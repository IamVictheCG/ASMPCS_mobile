-- ============================================================
-- ASMPCS Member Portal — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- MEMBERS
-- ============================================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_id VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  agency VARCHAR(20) CHECK (agency IN ('FAAN', 'NAAM', 'AIB', 'STAFF_SCHOOL')),
  zone VARCHAR(50),
  department VARCHAR(100),
  
  date_joined DATE DEFAULT CURRENT_DATE,
  membership_status VARCHAR(20) DEFAULT 'active'
    CHECK (membership_status IN ('active', 'inactive', 'suspended')),
  next_of_kin_name VARCHAR(100),
  next_of_kin_phone VARCHAR(20),
  next_of_kin_relationship VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVINGS CONTRIBUTIONS
-- ============================================================
CREATE TABLE savings_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  recorded_by UUID REFERENCES auth.users(id),
  payment_method VARCHAR(30) DEFAULT 'payroll_deduction',
  reference_number VARCHAR(50),
  status VARCHAR(20) DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'pending', 'reversed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOANS
-- ============================================================
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  loan_type VARCHAR(20) NOT NULL
    CHECK (loan_type IN ('iou', 'short_term', 'property', 'car')),
  amount_requested DECIMAL(12,2) NOT NULL,
  amount_approved DECIMAL(12,2),
  interest_rate DECIMAL(5,2) DEFAULT 5.00,
  tenure_months INTEGER,
  monthly_installment DECIMAL(12,2),
  total_repayable DECIMAL(12,2),
  amount_repaid DECIMAL(12,2) DEFAULT 0,
  outstanding_balance DECIMAL(12,2),
  purpose TEXT,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'overdue')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOAN REPAYMENTS
-- ============================================================
CREATE TABLE loan_repayments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'unpaid'
    CHECK (status IN ('paid', 'unpaid', 'overdue')),
  reference_number VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOAN GUARANTORS
-- ============================================================
CREATE TABLE loan_guarantors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  guarantor_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(loan_id, guarantor_member_id)
);

-- ============================================================
-- COMMODITIES
-- ============================================================
CREATE TABLE commodities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL
    CHECK (category IN ('food_staples', 'electronics', 'building_materials', 'personal_care')),
  description TEXT,
  price DECIMAL(12,2) NOT NULL CHECK (price > 0),
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMODITY ORDERS
-- ============================================================
CREATE TABLE commodity_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'ready', 'collected', 'cancelled')),
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL
    CHECK (type IN (
      'loan_approved', 'loan_rejected', 'contribution_recorded',
      'new_commodity', 'loan_overdue', 'general'
    )),
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATION PREFERENCES
-- ============================================================
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID UNIQUE NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  loan_updates BOOLEAN DEFAULT true,
  contribution_updates BOOLEAN DEFAULT true,
  commodity_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DIVIDENDS
-- ============================================================
CREATE TABLE dividends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  savings_dividend DECIMAL(12,2) DEFAULT 0,
  loan_dividend DECIMAL(12,2) DEFAULT 0,
  total_dividend DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'computed'
    CHECK (status IN ('computed', 'approved', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, year)
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES auth.users(id),
  actor_type VARCHAR(10) CHECK (actor_type IN ('member', 'admin')),
  action VARCHAR(50) NOT NULL,
  affected_table VARCHAR(50),
  affected_record_id UUID,
  description TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_contributions_member    ON savings_contributions(member_id);
CREATE INDEX idx_contributions_year_month ON savings_contributions(year, month);
CREATE INDEX idx_loans_member            ON loans(member_id);
CREATE INDEX idx_loans_status            ON loans(status);
CREATE INDEX idx_repayments_loan         ON loan_repayments(loan_id);
CREATE INDEX idx_repayments_due_date     ON loan_repayments(due_date);
CREATE INDEX idx_notifications_member    ON notifications(member_id);
CREATE INDEX idx_notifications_unread    ON notifications(member_id, is_read) WHERE is_read = false;
CREATE INDEX idx_orders_member           ON commodity_orders(member_id);
CREATE INDEX idx_audit_actor             ON audit_log(actor_id);
CREATE INDEX idx_audit_created           ON audit_log(created_at);

-- ============================================================
-- AUTO UPDATE updated_at TIMESTAMPS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER commodities_updated_at
  BEFORE UPDATE ON commodities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON commodity_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE members                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_contributions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_guarantors          ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodities              ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodity_orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividends                ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log                ENABLE ROW LEVEL SECURITY;

-- MEMBERS: can only read/update their own record
CREATE POLICY "members_read_own" ON members
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "members_update_own" ON members
  FOR UPDATE USING (auth.uid() = auth_id);

-- SAVINGS: members read their own contributions
CREATE POLICY "contributions_read_own" ON savings_contributions
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- LOANS: members read and insert their own loans
CREATE POLICY "loans_read_own" ON loans
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

CREATE POLICY "loans_insert_own" ON loans
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- LOAN REPAYMENTS: members read their own
CREATE POLICY "repayments_read_own" ON loan_repayments
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- LOAN GUARANTORS: guarantors can see requests addressed to them
CREATE POLICY "guarantors_read_own" ON loan_guarantors
  FOR SELECT USING (
    guarantor_member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

CREATE POLICY "guarantors_update_own" ON loan_guarantors
  FOR UPDATE USING (
    guarantor_member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- COMMODITIES: all authenticated users can browse
CREATE POLICY "commodities_read_all" ON commodities
  FOR SELECT USING (auth.role() = 'authenticated');

-- ORDERS: members read and insert their own
CREATE POLICY "orders_read_own" ON commodity_orders
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

CREATE POLICY "orders_insert_own" ON commodity_orders
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- NOTIFICATIONS: members read and update their own
CREATE POLICY "notifications_read_own" ON notifications
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- NOTIFICATION PREFERENCES: members manage their own
CREATE POLICY "preferences_all_own" ON notification_preferences
  FOR ALL USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- DIVIDENDS: members read their own
CREATE POLICY "dividends_read_own" ON dividends
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

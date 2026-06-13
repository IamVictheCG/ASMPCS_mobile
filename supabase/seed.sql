-- ============================================================
-- ASMPCS Member Portal — Development Seed Data
-- Run AFTER 001_initial_schema.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- NOTE: auth_id is NULL here — link real auth users after
--       creating them via Supabase Auth dashboard.
-- ============================================================

-- ============================================================
-- MEMBERS (5 sample members)
-- ============================================================
INSERT INTO members (id, staff_id, full_name, email, phone, agency, zone, department, date_joined, membership_status, next_of_kin_name, next_of_kin_phone, next_of_kin_relationship)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'FAAN-2018-0214',
    'Emeka Nwosu',
    'emeka.nwosu@faan.gov.ng',
    '+234-803-456-7890',
    'FAAN',
    'Zone A',
    'Air Traffic Control',
    '2018-03-15',
    'active',
    'Chioma Nwosu',
    '+234-803-111-2222',
    'Spouse'
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'FAAN-2019-0218',
    'Fatima Bello',
    'fatima.bello@faan.gov.ng',
    '+234-806-234-5678',
    'FAAN',
    'Zone B',
    'Finance & Accounts',
    '2019-06-01',
    'active',
    'Ibrahim Bello',
    '+234-806-333-4444',
    'Spouse'
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'NAAM-2020-0091',
    'Aisha Mohammed',
    'aisha.mohammed@naam.gov.ng',
    '+234-812-345-6789',
    'NAAM',
    'Zone A',
    'Engineering Services',
    '2020-01-10',
    'active',
    'Yusuf Mohammed',
    '+234-812-555-6666',
    'Sibling'
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'FAAN-2014-0056',
    'Bello Suleiman',
    'bello.suleiman@faan.gov.ng',
    '+234-805-678-9012',
    'FAAN',
    'Zone B',
    'Security Operations',
    '2014-09-22',
    'active',
    'Khadija Suleiman',
    '+234-805-777-8888',
    'Spouse'
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'FAAN-2017-0099',
    'James Adeyemi',
    'james.adeyemi@faan.gov.ng',
    '+234-817-890-1234',
    'FAAN',
    'Zone A',
    'Airport Operations',
    '2017-04-05',
    'active',
    'Grace Adeyemi',
    '+234-817-999-0000',
    'Spouse'
  );

-- ============================================================
-- SAVINGS CONTRIBUTIONS — 12 months per member (2025)
-- Amounts vary realistically between ₦5,000 and ₦15,000
-- ============================================================

-- Emeka Nwosu (member 001) — ₦12,000/month
INSERT INTO savings_contributions (member_id, amount, month, year, payment_method, status)
SELECT 'a1000000-0000-0000-0000-000000000001', 12000.00, m, 2025, 'payroll_deduction', 'confirmed'
FROM generate_series(1, 12) AS m;

-- Fatima Bello (member 002) — ₦8,500/month
INSERT INTO savings_contributions (member_id, amount, month, year, payment_method, status)
SELECT 'a1000000-0000-0000-0000-000000000002', 8500.00, m, 2025, 'payroll_deduction', 'confirmed'
FROM generate_series(1, 12) AS m;

-- Aisha Mohammed (member 003) — ₦6,000/month
INSERT INTO savings_contributions (member_id, amount, month, year, payment_method, status)
SELECT 'a1000000-0000-0000-0000-000000000003', 6000.00, m, 2025, 'payroll_deduction', 'confirmed'
FROM generate_series(1, 12) AS m;

-- Bello Suleiman (member 004) — ₦15,000/month
INSERT INTO savings_contributions (member_id, amount, month, year, payment_method, status)
SELECT 'a1000000-0000-0000-0000-000000000004', 15000.00, m, 2025, 'payroll_deduction', 'confirmed'
FROM generate_series(1, 12) AS m;

-- James Adeyemi (member 005) — ₦13,500/month
INSERT INTO savings_contributions (member_id, amount, month, year, payment_method, status)
SELECT 'a1000000-0000-0000-0000-000000000005', 13500.00, m, 2025, 'payroll_deduction', 'confirmed'
FROM generate_series(1, 12) AS m;

-- 2024 contributions (same members, same amounts)
INSERT INTO savings_contributions (member_id, amount, month, year, payment_method, status)
SELECT 'a1000000-0000-0000-0000-000000000001', 12000.00, m, 2024, 'payroll_deduction', 'confirmed'
FROM generate_series(1, 12) AS m;

INSERT INTO savings_contributions (member_id, amount, month, year, payment_method, status)
SELECT 'a1000000-0000-0000-0000-000000000004', 15000.00, m, 2024, 'payroll_deduction', 'confirmed'
FROM generate_series(1, 12) AS m;

-- ============================================================
-- LOANS (2 active loans in different statuses)
-- ============================================================
INSERT INTO loans (id, member_id, loan_type, amount_requested, amount_approved, interest_rate, tenure_months, monthly_installment, total_repayable, amount_repaid, outstanding_balance, purpose, status, applied_at, approved_at)
VALUES
  (
    'b2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'short_term',
    250000.00,
    250000.00,
    5.00,
    12,
    22291.67,
    267500.00,
    89166.68,
    178333.32,
    'Home renovation and roofing repair works',
    'active',
    '2025-01-15 09:00:00+01',
    '2025-01-20 10:30:00+01'
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000004',
    'property',
    500000.00,
    500000.00,
    7.00,
    24,
    23750.00,
    570000.00,
    0.00,
    570000.00,
    'Land documentation and fence construction in Kubwa, Abuja',
    'approved',
    '2026-05-10 08:15:00+01',
    '2026-05-18 11:00:00+01'
  );

-- ============================================================
-- LOAN REPAYMENTS — for Emeka's active short-term loan
-- 4 months paid, 8 months remaining
-- ============================================================
INSERT INTO loan_repayments (loan_id, member_id, amount, due_date, paid_date, status, reference_number)
VALUES
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 22291.67, '2025-02-20', '2025-02-20', 'paid',   'REP-2025-0210'),
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 22291.67, '2025-03-20', '2025-03-19', 'paid',   'REP-2025-0310'),
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 22291.67, '2025-04-20', '2025-04-20', 'paid',   'REP-2025-0410'),
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 22291.67, '2025-05-20', '2025-05-20', 'paid',   'REP-2025-0510'),
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 22291.67, '2025-06-20', NULL,         'unpaid', NULL),
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 22291.67, '2025-07-20', NULL,         'unpaid', NULL),
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 22291.67, '2025-08-20', NULL,         'unpaid', NULL),
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 22291.67, '2025-09-20', NULL,         'unpaid', NULL),
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 22291.67, '2025-10-20', NULL,         'unpaid', NULL),
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 22291.67, '2025-11-20', NULL,         'unpaid', NULL),
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 22291.67, '2025-12-20', NULL,         'unpaid', NULL),
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 22291.79, '2026-01-20', NULL,         'unpaid', NULL);

-- Guarantor for Emeka's loan
INSERT INTO loan_guarantors (loan_id, guarantor_member_id, status)
VALUES
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'accepted'),
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'accepted');

-- ============================================================
-- COMMODITIES (8 items across all 4 categories)
-- ============================================================
INSERT INTO commodities (id, name, category, description, price, stock_quantity, is_available)
VALUES
  (
    'c3000000-0000-0000-0000-000000000001',
    '50kg Bag of Rice (Tuwo/Parboiled)',
    'food_staples',
    'Premium Nigerian parboiled rice, 50kg bag. Sourced directly from mills.',
    42500.00,
    120,
    true
  ),
  (
    'c3000000-0000-0000-0000-000000000002',
    'Vegetable Cooking Oil (5 Litres)',
    'food_staples',
    'Refined vegetable oil, 5-litre container. Suitable for all cooking methods.',
    8200.00,
    85,
    true
  ),
  (
    'c3000000-0000-0000-0000-000000000003',
    'Semovita (10kg)',
    'food_staples',
    'Golden Penny Semovita, 10kg bag.',
    6500.00,
    200,
    true
  ),
  (
    'c3000000-0000-0000-0000-000000000004',
    'Rechargeable Standing Fan',
    'electronics',
    '16-inch rechargeable standing fan with built-in battery. Runs 6–8 hours off-grid.',
    38500.00,
    30,
    true
  ),
  (
    'c3000000-0000-0000-0000-000000000005',
    'Solar Inverter Lantern',
    'electronics',
    '30W solar lantern with USB charging port and 12-hour battery life.',
    15800.00,
    45,
    true
  ),
  (
    'c3000000-0000-0000-0000-000000000006',
    'Bags of Cement (Per Unit)',
    'building_materials',
    'Dangote 42.5R Portland Cement, 50kg bag. Per-unit pricing.',
    5200.00,
    500,
    true
  ),
  (
    'c3000000-0000-0000-0000-000000000007',
    'Corrugated Iron Sheet (Bundle of 10)',
    'building_materials',
    'Galvanised 0.55mm corrugated iron roofing sheets, 8ft × 3ft, bundle of 10.',
    72000.00,
    18,
    true
  ),
  (
    'c3000000-0000-0000-0000-000000000008',
    'Toiletry Bundle (Monthly)',
    'personal_care',
    'Monthly bundle: 2× Dettol soap, 1× Vaseline (400g), 1× Ariel 900g, 1× toothpaste.',
    7850.00,
    60,
    true
  );

-- ============================================================
-- NOTIFICATIONS (10 items — mixed read/unread for member 001)
-- ============================================================
INSERT INTO notifications (member_id, type, title, message, is_read, created_at)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'loan_approved',
    'Your Short-Term Loan Has Been Approved',
    'Congratulations! Your short-term loan application of ₦250,000 (LN-2025-001) has been approved. Disbursement will be processed within 3 working days.',
    true,
    '2025-01-20 10:30:00+01'
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'contribution_recorded',
    'February 2025 Contribution Recorded',
    'Your savings contribution of ₦12,000 for February 2025 has been recorded successfully. Running total for 2025: ₦24,000.',
    true,
    '2025-02-28 08:00:00+01'
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'contribution_recorded',
    'March 2025 Contribution Recorded',
    'Your savings contribution of ₦12,000 for March 2025 has been recorded successfully. Running total for 2025: ₦36,000.',
    true,
    '2025-03-31 08:00:00+01'
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'contribution_recorded',
    'April 2025 Contribution Recorded',
    'Your savings contribution of ₦12,000 for April 2025 has been recorded successfully. Running total for 2025: ₦48,000.',
    true,
    '2025-04-30 08:00:00+01'
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'contribution_recorded',
    'May 2025 Contribution Recorded',
    'Your savings contribution of ₦12,000 for May 2025 has been recorded successfully. Running total for 2025: ₦60,000.',
    true,
    '2025-05-31 08:00:00+01'
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'new_commodity',
    'New Item Available: Solar Inverter Lantern',
    'The cooperative store now stocks Solar Inverter Lanterns (₦15,800). Great for power outages — limited stock of 45 units.',
    false,
    '2025-10-05 09:15:00+01'
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'loan_overdue',
    'Loan Repayment Due — June 2025',
    'Your repayment of ₦22,292 for LN-2025-001 was due on 20 June 2025. Please ensure payment is made promptly to avoid penalty charges.',
    false,
    '2025-06-21 07:00:00+01'
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'general',
    'AGM Scheduled — 12 July 2025',
    'The Annual General Meeting of ASMPCS will hold on 12 July 2025 at FAAN Headquarters Conference Hall, Abuja. Attendance is compulsory for all active members.',
    false,
    '2025-06-25 10:00:00+01'
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'general',
    'New Loan Parameters Effective August 2026',
    'The Board of Directors has approved revised loan parameters effective 1 August 2026. Maximum multiplier increased to 4× savings. Full details shared at the next briefing.',
    false,
    '2026-06-10 11:30:00+01'
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'general',
    'Welcome to the ASMPCS Member Portal',
    'Your online member portal is now live. You can view your savings balance, track your loan repayments, browse cooperative commodities, and receive real-time notifications here.',
    true,
    '2025-01-01 08:00:00+01'
  );

-- ============================================================
-- NOTIFICATION PREFERENCES (for all 5 members)
-- ============================================================
INSERT INTO notification_preferences (member_id, email_notifications, push_notifications, loan_updates, contribution_updates, commodity_updates)
VALUES
  ('a1000000-0000-0000-0000-000000000001', false, true,  true,  true,  true),
  ('a1000000-0000-0000-0000-000000000002', true,  true,  true,  true,  false),
  ('a1000000-0000-0000-0000-000000000003', false, false, true,  true,  false),
  ('a1000000-0000-0000-0000-000000000004', false, true,  true,  false, false),
  ('a1000000-0000-0000-0000-000000000005', true,  true,  true,  true,  true);

-- ============================================================
-- DIVIDENDS — 2024 and 2025 for active members
-- Based on Art. 10.2 — 40% savings pool
-- ============================================================
INSERT INTO dividends (member_id, year, savings_dividend, loan_dividend, total_dividend, status, paid_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 2024, 87500.00,  22400.00, 109900.00, 'paid',     '2024-12-31 00:00:00+01'),
  ('a1000000-0000-0000-0000-000000000004', 2024, 114000.00, 0.00,     114000.00, 'paid',     '2024-12-31 00:00:00+01'),
  ('a1000000-0000-0000-0000-000000000001', 2025, 95200.00,  18600.00, 113800.00, 'approved', NULL),
  ('a1000000-0000-0000-0000-000000000002', 2025, 58400.00,  0.00,     58400.00,  'approved', NULL),
  ('a1000000-0000-0000-0000-000000000003', 2025, 39600.00,  0.00,     39600.00,  'approved', NULL),
  ('a1000000-0000-0000-0000-000000000004', 2025, 124800.00, 0.00,     124800.00, 'approved', NULL),
  ('a1000000-0000-0000-0000-000000000005', 2025, 112200.00, 0.00,     112200.00, 'approved', NULL);

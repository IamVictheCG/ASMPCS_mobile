-- ============================================================
-- ASMPCS Registration Helper Functions
-- Run AFTER 002_auth_helpers.sql
-- ============================================================

-- Allow 'pending' as a valid membership_status for newly registered
-- accounts awaiting admin activation.
ALTER TABLE members
  DROP CONSTRAINT IF EXISTS members_membership_status_check;

ALTER TABLE members
  ADD CONSTRAINT members_membership_status_check
  CHECK (membership_status IN ('active', 'inactive', 'suspended', 'pending'));

-- ============================================================
-- verify_member_for_registration
-- ============================================================
-- Pre-auth check: confirms a member record exists and has no
-- linked auth account before we allow signUp().
-- Returns JSON: { status: 'not_found' | 'already_registered' | 'ok', member_id?: uuid }
-- Callable by the anon key (no session required).
CREATE OR REPLACE FUNCTION verify_member_for_registration(
  p_staff_id  TEXT,
  p_full_name TEXT,
  p_agency    TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member members%ROWTYPE;
BEGIN
  SELECT * INTO v_member
  FROM members
  WHERE UPPER(TRIM(staff_id))  = UPPER(TRIM(p_staff_id))
    AND LOWER(TRIM(full_name)) = LOWER(TRIM(p_full_name))
    AND UPPER(TRIM(agency))    = UPPER(TRIM(p_agency))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_found');
  END IF;

  IF v_member.auth_id IS NOT NULL THEN
    RETURN json_build_object('status', 'already_registered');
  END IF;

  RETURN json_build_object('status', 'ok', 'member_id', v_member.id);
END;
$$;

GRANT EXECUTE ON FUNCTION verify_member_for_registration(TEXT, TEXT, TEXT) TO anon;

-- ============================================================
-- link_auth_to_member
-- ============================================================
-- Post-signUp: links the new auth.users record to the member row,
-- sets membership_status = 'pending', seeds notification_preferences,
-- and creates an activation notification for admin visibility.
-- Security: verifies the auth account email matches before linking
-- so callers cannot hijack another member's record.
CREATE OR REPLACE FUNCTION link_auth_to_member(
  p_member_id UUID,
  p_auth_id   UUID,
  p_email     TEXT,
  p_phone     TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member members%ROWTYPE;
BEGIN
  -- Verify the auth account exists and email matches
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = p_auth_id AND email = p_email
  ) THEN
    RAISE EXCEPTION 'Auth account not found or email mismatch';
  END IF;

  -- Lock and verify member row
  SELECT * INTO v_member FROM members WHERE id = p_member_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member record not found';
  END IF;

  IF v_member.auth_id IS NOT NULL THEN
    RAISE EXCEPTION 'Member already has a linked account';
  END IF;

  -- Link auth account and mark as pending
  UPDATE members
  SET
    auth_id           = p_auth_id,
    email             = p_email,
    phone             = COALESCE(NULLIF(TRIM(p_phone), ''), phone),
    membership_status = 'pending'
  WHERE id = p_member_id;

  -- Seed default notification preferences
  INSERT INTO notification_preferences (member_id)
  VALUES (p_member_id)
  ON CONFLICT (member_id) DO NOTHING;

  -- Create an activation-pending notification (admin queries members
  -- with membership_status = 'pending' to discover new registrations)
  INSERT INTO notifications (member_id, type, title, message)
  VALUES (
    p_member_id,
    'general',
    'New Account Registration',
    v_member.full_name || ' (' || v_member.staff_id || ') has registered and is awaiting activation'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION link_auth_to_member(UUID, UUID, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION link_auth_to_member(UUID, UUID, TEXT, TEXT) TO authenticated;

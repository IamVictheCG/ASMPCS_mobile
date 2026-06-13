-- ============================================================
-- ASMPCS Auth Helper Functions
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Resolves a staff_id to the member's email address.
-- Called by the mobile client before signInWithPassword so members
-- can log in with their staff_id rather than their email.
-- SECURITY DEFINER runs with the function owner's privileges,
-- bypassing RLS — safe because it only returns a single email
-- per exact staff_id match and exposes no other data.
CREATE OR REPLACE FUNCTION get_email_by_staff_id(p_staff_id TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email
  FROM   members
  WHERE  UPPER(staff_id) = UPPER(p_staff_id)
  LIMIT  1;
$$;

-- Allow unauthenticated callers (anon key) to invoke this function.
-- The function itself limits exposure to a single email field.
GRANT EXECUTE ON FUNCTION get_email_by_staff_id(TEXT) TO anon;

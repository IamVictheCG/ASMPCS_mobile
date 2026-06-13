-- ============================================================
-- Commodity order placement — atomic stock decrement
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Extend notifications type to include order confirmations
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'loan_approved', 'loan_rejected', 'contribution_recorded',
    'new_commodity', 'loan_overdue', 'general', 'order_placed'
  ));

-- ============================================================
-- place_commodity_order
-- Inserts the order and decrements stock in a single
-- transaction, preventing overselling via FOR UPDATE lock.
-- SECURITY DEFINER so the stock UPDATE bypasses member RLS.
-- ============================================================
CREATE OR REPLACE FUNCTION place_commodity_order(
  p_member_id    UUID,
  p_commodity_id UUID,
  p_quantity     INTEGER,
  p_unit_price   DECIMAL(12,2)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id      UUID;
  v_current_stock INTEGER;
BEGIN
  -- Lock the commodity row so concurrent orders queue up
  SELECT stock_quantity
    INTO v_current_stock
    FROM commodities
   WHERE id = p_commodity_id
     AND is_available = true
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Commodity not found or no longer available';
  END IF;

  IF v_current_stock < p_quantity THEN
    RAISE EXCEPTION 'Only % unit(s) remaining in stock', v_current_stock;
  END IF;

  INSERT INTO commodity_orders (
    member_id, commodity_id, quantity,
    unit_price, total_amount, status
  ) VALUES (
    p_member_id, p_commodity_id, p_quantity,
    p_unit_price, p_unit_price * p_quantity, 'pending'
  )
  RETURNING id INTO v_order_id;

  UPDATE commodities
     SET stock_quantity = stock_quantity - p_quantity,
         updated_at     = NOW()
   WHERE id = p_commodity_id;

  RETURN v_order_id;
END;
$$;

-- Only authenticated users may call this function
REVOKE ALL ON FUNCTION place_commodity_order(UUID, UUID, INTEGER, DECIMAL) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION place_commodity_order(UUID, UUID, INTEGER, DECIMAL) TO authenticated;

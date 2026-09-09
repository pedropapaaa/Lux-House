-- 1. Allow total_amount = 0 for 100% coupon orders
DROP POLICY IF EXISTS "orders_insert_anon" ON orders;

CREATE POLICY "orders_insert_anon" ON orders FOR INSERT
TO anon, authenticated
WITH CHECK (
  quantity = 1
  AND payment_status = 'pending'
  AND payment_id IS NULL
  AND qr_code IS NULL
  AND total_amount >= 0
  AND total_amount <= (
    SELECT lots.price
    FROM lots
    WHERE lots.id = orders.lot_id
      AND lots.status = 'active'
  )
);

-- 2. Allow authenticated (admin) to update payment_status on orders
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. RPC to approve a free order (total_amount = 0) safely from anon frontend
CREATE OR REPLACE FUNCTION public.approve_free_order(order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = order_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.total_amount != 0 THEN
    RAISE EXCEPTION 'Order is not free';
  END IF;

  IF v_order.payment_status != 'pending' THEN
    RAISE EXCEPTION 'Order already processed';
  END IF;

  UPDATE orders
  SET payment_status = 'approved', payment_id = 'FREE-' || order_id::text
  WHERE id = order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_free_order(uuid) TO anon, authenticated;

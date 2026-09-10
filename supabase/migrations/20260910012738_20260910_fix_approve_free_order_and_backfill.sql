/*
# Fix approve_free_order RPC and backfill missing event_id on tickets

## Purpose
1. The approve_free_order RPC was creating tickets with hardcoded event data
   (date "Sábado, 18 de Julho de 2025") and without setting event_id on the ticket.
   This made tickets invisible in the admin Participants list when filtering by event.
2. Backfill the 2 existing tickets that have event_id = NULL by copying from their
   parent order's event_id.
3. Preserve coupon_id and discount_amount that the frontend sets on the order insert
   (the RPC was not touching these, but the order insert policy was rejecting
   orders with coupon_id set — this migration also relaxes that if needed).

## Changes
- Replace approve_free_order to read event info from the events table via the order's
  event_id, and set event_id on the inserted ticket row.
- Backfill tickets.event_id from orders.event_id where NULL.
- Add a trigger or direct update is sufficient (one-time backfill).
*/

-- ============================================================
-- 1. Update approve_free_order to use real event data and set event_id
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_free_order(order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_lot_name text;
  v_code text;
  v_chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  v_event events%ROWTYPE;
  v_event_date text;
  v_event_time text;
  v_event_location text;
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

  SELECT l.name INTO v_lot_name FROM lots l WHERE l.id = v_order.lot_id;

  -- Fetch event data if the order has an event_id
  SELECT * INTO v_event FROM events WHERE id = v_order.event_id;

  IF FOUND THEN
    v_event_date := COALESCE(v_event.event_date::text, 'Data do evento');
    v_event_time := COALESCE(v_event.event_time, 'Consulte os detalhes');
    v_event_location := COALESCE(v_event.location, 'Local do evento');
  ELSE
    v_event_date := 'Data do evento';
    v_event_time := 'Consulte os detalhes';
    v_event_location := 'Local do evento';
  END IF;

  -- Generate ticket code: RLIO-XXXXXX
  v_code := 'RLIO-';
  FOR i IN 1..6 LOOP
    v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
  END LOOP;

  UPDATE orders
  SET payment_status = 'approved', payment_id = 'FREE-' || order_id::text
  WHERE id = order_id;

  INSERT INTO tickets (order_id, code, lot_name, buyer_name, buyer_email, event_date, event_time, event_location, event_id)
  VALUES (
    order_id,
    v_code,
    COALESCE(v_lot_name, 'Lote Único'),
    v_order.buyer_name,
    v_order.buyer_email,
    v_event_date,
    v_event_time,
    v_event_location,
    v_order.event_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_free_order(uuid) TO anon, authenticated;

-- ============================================================
-- 2. Backfill tickets with NULL event_id from their parent order
-- ============================================================
UPDATE tickets
SET event_id = (
  SELECT o.event_id FROM orders o WHERE o.id = tickets.order_id
)
WHERE event_id IS NULL
  AND EXISTS (
    SELECT 1 FROM orders o WHERE o.id = tickets.order_id AND o.event_id IS NOT NULL
  );

-- ============================================================
-- 3. Relax orders INSERT policy to allow coupon_id and discount_amount
--    (The original policy only checked total_amount <= lot price,
--     which is fine — coupon_id and discount_amount are nullable and
--     don't need to be in the WITH CHECK. But we need to make sure
--     the policy doesn't reject orders that have these fields set.)
-- ============================================================
-- The existing policy checks: quantity = 1, payment_status = 'pending',
-- payment_id IS NULL, qr_code IS NULL, total_amount >= 0,
-- total_amount <= (SELECT lots.price ...).
-- coupon_id and discount_amount are nullable columns, so they don't
-- affect the WITH CHECK. No policy change needed.

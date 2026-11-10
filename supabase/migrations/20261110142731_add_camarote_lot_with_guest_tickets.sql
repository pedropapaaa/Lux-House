/*
# Camarote lot: one purchase covers 10 guests, one ticket per guest

1. Modified Tables
- `lots`: new column `guests_per_unit` (integer, default 1). A lot with a value above 1 sells one unit that issues that many tickets, and the buyer must inform each guest's name and CPF.
- `orders`: new column `guests` (jsonb, default empty array). Holds the list of { name, cpf } for the guests covered by the order.
- `tickets`: new nullable columns `holder_name` and `holder_cpf`, identifying the guest who holds each ticket.

2. New Data
- Lot "Camarote" for the public event "Lux White" (slug `lux-white-2026`): price R$ 1.600,00, 10 units available, 10 guests per unit, sort order after the existing lots.

3. Security
- `orders_insert_anon` is rewritten with one extra rule: a group lot (guests_per_unit > 1) requires exactly that many guests, and any other lot requires none. All other checks are unchanged.
- `approve_free_order` issues one ticket per guest when the order has guests, so a camarote made free by a coupon still gets all its tickets.

4. Notes
- The rules keep the 4.50 service fee in sync with the existing policy.
- Tickets remain unique by code.
*/

ALTER TABLE lots ADD COLUMN IF NOT EXISTS guests_per_unit integer NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lots_guests_per_unit_range'
  ) THEN
    ALTER TABLE lots ADD CONSTRAINT lots_guests_per_unit_range CHECK (guests_per_unit BETWEEN 1 AND 50);
  END IF;
END $$;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS guests jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS holder_name text;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS holder_cpf text;

INSERT INTO lots (event_id, name, price, total_quantity, sold_quantity, status, sort_order, guests_per_unit)
SELECT e.id, 'Camarote', 1600.00, 10, 0, 'active', 40, 10
FROM events e
WHERE e.slug = 'lux-white-2026'
  AND NOT EXISTS (
    SELECT 1 FROM lots l WHERE l.event_id = e.id AND l.name = 'Camarote'
  );

DROP POLICY IF EXISTS "orders_insert_anon" ON orders;

CREATE POLICY "orders_insert_anon" ON orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  quantity = 1
  AND payment_status = 'pending'
  AND payment_id IS NULL
  AND qr_code IS NULL
  AND total_amount >= 0
  AND EXISTS (
    SELECT 1 FROM lots
    WHERE lots.id = orders.lot_id
      AND lots.status = 'active'
      AND lots.sold_quantity < lots.total_quantity
  )
  AND jsonb_array_length(orders.guests) = (
    SELECT CASE WHEN lots.guests_per_unit > 1 THEN lots.guests_per_unit ELSE 0 END
    FROM lots
    WHERE lots.id = orders.lot_id
  )
  AND (
    (coupon_id IS NOT NULL AND total_amount <= (
      SELECT lots.price + 4.50 FROM lots
      WHERE lots.id = orders.lot_id AND lots.status = 'active'
    ))
    OR
    (coupon_id IS NULL AND total_amount = (
      SELECT lots.price + 4.50 FROM lots
      WHERE lots.id = orders.lot_id AND lots.status = 'active'
    ))
  )
);

CREATE OR REPLACE FUNCTION public.approve_free_order(order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
#variable_conflict use_column
DECLARE
  v_order orders%ROWTYPE;
  v_lot_name text;
  v_code text;
  v_chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  v_event events%ROWTYPE;
  v_event_date text;
  v_event_time text;
  v_event_location text;
  v_tickets_count integer;
  v_guest jsonb;
  g integer;
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

  v_tickets_count := GREATEST(1, jsonb_array_length(v_order.guests));

  UPDATE orders
  SET payment_status = 'approved', payment_id = 'FREE-' || order_id::text
  WHERE id = order_id;

  FOR g IN 0..v_tickets_count - 1 LOOP
    v_code := 'RLIO-';
    FOR i IN 1..6 LOOP
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    END LOOP;

    v_guest := CASE WHEN jsonb_array_length(v_order.guests) > 0 THEN v_order.guests -> g ELSE NULL END;

    INSERT INTO tickets (order_id, code, lot_name, buyer_name, buyer_email, event_date, event_time, event_location, event_id, holder_name, holder_cpf)
    VALUES (
      order_id,
      v_code,
      COALESCE(v_lot_name, 'Lote Único'),
      v_order.buyer_name,
      v_order.buyer_email,
      v_event_date,
      v_event_time,
      v_event_location,
      v_order.event_id,
      v_guest ->> 'name',
      v_guest ->> 'cpf'
    );
  END LOOP;

  IF v_order.coupon_id IS NOT NULL THEN
    UPDATE coupons
    SET used_count = used_count + 1, updated_at = now()
    WHERE id = v_order.coupon_id;

    INSERT INTO coupon_usages (coupon_id, order_id, buyer_name, used_at)
    VALUES (v_order.coupon_id, order_id, v_order.buyer_name || ' ' || v_order.buyer_last_name, v_order.created_at)
    ON CONFLICT (order_id) DO NOTHING;
  END IF;
END;
$function$;

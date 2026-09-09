-- Update approve_free_order to also create the ticket
CREATE OR REPLACE FUNCTION public.approve_free_order(order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_lot_name text;
  v_code text;
  v_chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
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

  -- Generate ticket code: RLIO-XXXXXX
  v_code := 'RLIO-';
  FOR i IN 1..6 LOOP
    v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
  END LOOP;

  UPDATE orders
  SET payment_status = 'approved', payment_id = 'FREE-' || order_id::text
  WHERE id = order_id;

  INSERT INTO tickets (order_id, code, lot_name, buyer_name, buyer_email, event_date, event_time, event_location)
  VALUES (
    order_id,
    v_code,
    COALESCE(v_lot_name, 'Lote Único'),
    v_order.buyer_name,
    v_order.buyer_email,
    'Sábado, 18 de Julho de 2025',
    '21h00 — 03h30',
    'Vinhedo — São Paulo, SP'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_free_order(uuid) TO anon, authenticated;

-- Lote 1: active, 50 vagas, R$35
UPDATE lots SET
  price = 35,
  total_quantity = 50,
  sold_quantity = 0,
  status = 'active',
  updated_at = now()
WHERE sort_order = 1;

-- Lote 2: closed (locked until Lote 1 sells out), 100 vagas, R$45
UPDATE lots SET
  price = 45,
  total_quantity = 100,
  sold_quantity = 0,
  status = 'closed',
  updated_at = now()
WHERE sort_order = 2;

-- Lote 3: closed (locked until Lote 2 sells out), 100 vagas, R$55
UPDATE lots SET
  price = 55,
  total_quantity = 100,
  sold_quantity = 0,
  status = 'closed',
  updated_at = now()
WHERE sort_order = 3;

-- Update RPC: when a lot sells out, auto-activate the next closed lot
CREATE OR REPLACE FUNCTION increment_lot_sold(lot_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sold       integer;
  v_total      integer;
  v_sort_order integer;
BEGIN
  UPDATE lots
  SET sold_quantity = sold_quantity + 1,
      updated_at    = now()
  WHERE id = lot_id
  RETURNING sold_quantity, total_quantity, sort_order
    INTO v_sold, v_total, v_sort_order;

  IF v_sold >= v_total THEN
    UPDATE lots
    SET status     = 'sold_out',
        updated_at = now()
    WHERE id = lot_id;

    -- Unlock next lot in sequence
    UPDATE lots
    SET status     = 'active',
        updated_at = now()
    WHERE sort_order = v_sort_order + 1
      AND status = 'closed';
  END IF;
END;
$$;

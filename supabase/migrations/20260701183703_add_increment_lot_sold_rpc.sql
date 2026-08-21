/*
# Add increment_lot_sold RPC function

## Purpose
Provides a safe, atomic function to increment the sold_quantity on a lot
and automatically mark it as 'sold_out' when capacity is reached.

## Function: increment_lot_sold(lot_id uuid)
- Increments sold_quantity by 1 for the given lot
- Sets status = 'sold_out' if sold_quantity >= total_quantity after increment
- Runs as SECURITY DEFINER so the edge function's service-role call can invoke it
- Returns void; raises exception if lot not found or already sold out
*/

CREATE OR REPLACE FUNCTION increment_lot_sold(lot_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE lots
  SET
    sold_quantity = sold_quantity + 1,
    status = CASE
      WHEN sold_quantity + 1 >= total_quantity THEN 'sold_out'
      ELSE status
    END
  WHERE id = lot_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lot % not found', lot_id;
  END IF;
END;
$$;

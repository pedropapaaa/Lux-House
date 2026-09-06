/*
# Adicionar função RPC para incrementar uso de cupom

Cria a função `increment_coupon_usage` que incrementa atomicamente
o campo `used_count` de um cupom, evitando race conditions.
*/

CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE id = coupon_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION increment_coupon_usage(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_coupon_usage(uuid) TO authenticated, anon;

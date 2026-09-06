/*
# Fix Security Issues: Function Search Paths, RLS Policies, and EXECUTE Grants

## Summary
Fixes 15 security advisories:
1. Function Search Path Mutable — 3 functions had mutable search_path. All 4 SECURITY DEFINER functions now have `SET search_path TO public`, locking the search_path to a fixed schema.
2. RLS Policy Always True — 5 policies used `true` as their only predicate. Replaced with admin-scoped checks or dropped (redundant with existing admin policies).
3. Public/Signed-In Can Execute SECURITY DEFINER Functions — EXECUTE revoked from public, anon, and authenticated on all 4 functions.

## Functions Modified
- `apply_coupon` — `SET search_path TO public`, revoked EXECUTE from public/anon/authenticated
- `increment_coupon_usage` — `SET search_path TO public`, revoked EXECUTE from public/anon/authenticated
- `approve_free_order` — `SET search_path TO public`, revoked EXECUTE from public/anon/authenticated
- `update_updated_at` — `SET search_path TO public` (was `''`), revoked EXECUTE from public/anon/authenticated

## RLS Policies Modified
- `coupons` — dropped `auth_delete_coupons`, `auth_insert_coupons`, `auth_update_coupons` (all `true`, redundant with existing admin policies)
- `orders` — replaced `orders_update_admin` (`true`) with admin-scoped check
- `coupon_usages` — replaced `coupon_usages_insert_public` (`true`) with admin-scoped check

## Security Notes
1. SECURITY DEFINER functions now have fixed search_path `public`, preventing hijacking.
2. EXECUTE revoked from anon/authenticated — functions cannot be called via REST API.
3. Functions remain callable internally (triggers, other functions) via owner privileges.
4. coupon_usages INSERT is now admin-only; `apply_coupon` handles public inserts via SECURITY DEFINER (bypasses RLS).
*/

-- =============================================================
-- 1. Fix function search paths and revoke EXECUTE
-- =============================================================

CREATE OR REPLACE FUNCTION public.apply_coupon(p_code text, p_order_id uuid, p_buyer_name text)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO public
AS $function$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_discount numeric(10,2);
  v_order_amount numeric(10,2);
BEGIN
  SELECT * INTO v_coupon FROM coupons
  WHERE UPPER(code) = UPPER(p_code)
  AND is_active = true
  AND used_count < max_uses
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Cupom invalido ou esgotado.');
  END IF;

  SELECT total_amount INTO v_order_amount FROM orders WHERE id = p_order_id;

  IF v_coupon.discount_type = 'percent' THEN
    v_discount := ROUND(v_order_amount * v_coupon.discount_value / 100, 2);
  ELSE
    v_discount := LEAST(v_coupon.discount_value, v_order_amount);
  END IF;

  UPDATE orders
  SET coupon_id = v_coupon.id,
  discount_amount = v_discount,
  total_amount = GREATEST(0, v_order_amount - v_discount)
  WHERE id = p_order_id;

  UPDATE coupons SET used_count = used_count + 1 WHERE id = v_coupon.id;

  INSERT INTO coupon_usages (coupon_id, order_id, buyer_name)
  VALUES (v_coupon.id, p_order_id, p_buyer_name)
  ON CONFLICT (order_id) DO NOTHING;

  RETURN jsonb_build_object(
    'ok', true,
    'discount', v_discount,
    'new_total', GREATEST(0, v_order_amount - v_discount),
    'coupon_id', v_coupon.id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO public
AS $function$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1,
  updated_at = now()
  WHERE id = coupon_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.approve_free_order(order_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Revoke EXECUTE from public, anon, and authenticated on all SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.apply_coupon(p_code text, p_order_id uuid, p_buyer_name text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_coupon(p_code text, p_order_id uuid, p_buyer_name text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.apply_coupon(p_code text, p_order_id uuid, p_buyer_name text) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(coupon_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(coupon_id uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(coupon_id uuid) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.approve_free_order(order_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.approve_free_order(order_id uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.approve_free_order(order_id uuid) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM authenticated;

-- =============================================================
-- 2. Fix RLS Policies — coupons table
-- =============================================================

DROP POLICY IF EXISTS "auth_delete_coupons" ON public.coupons;
DROP POLICY IF EXISTS "auth_insert_coupons" ON public.coupons;
DROP POLICY IF EXISTS "auth_update_coupons" ON public.coupons;

-- =============================================================
-- 3. Fix RLS Policies — orders table
-- =============================================================

DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin" ON public.orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

-- =============================================================
-- 4. Fix RLS Policies — coupon_usages table
-- =============================================================

DROP POLICY IF EXISTS "coupon_usages_insert_public" ON public.coupon_usages;
CREATE POLICY "coupon_usages_insert_admin" ON public.coupon_usages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));
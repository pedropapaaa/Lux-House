-- ============================================================
-- 1. Fix mutable search_path on update_updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. Fix mutable search_path on increment_lot_sold
--    + keep next-lot unlock logic
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_lot_sold(lot_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_sold       integer;
  v_total      integer;
  v_sort_order integer;
BEGIN
  UPDATE public.lots
  SET sold_quantity = sold_quantity + 1,
      updated_at    = pg_catalog.now()
  WHERE id = lot_id
  RETURNING sold_quantity, total_quantity, sort_order
    INTO v_sold, v_total, v_sort_order;

  IF v_sold >= v_total THEN
    UPDATE public.lots
    SET status     = 'sold_out',
        updated_at = pg_catalog.now()
    WHERE id = lot_id;

    -- Unlock next lot in sequence
    UPDATE public.lots
    SET status     = 'active',
        updated_at = pg_catalog.now()
    WHERE sort_order = v_sort_order + 1
      AND status = 'closed';
  END IF;
END;
$$;

-- ============================================================
-- 3. Revoke public EXECUTE on increment_lot_sold
--    (only the service-role webhook should call this)
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.increment_lot_sold(uuid) FROM anon, authenticated;

-- ============================================================
-- 4. Harden orders INSERT policy — validate amount matches
--    real lot price so clients cannot manipulate the total
-- ============================================================
DROP POLICY IF EXISTS "orders_insert_anon" ON public.orders;
CREATE POLICY "orders_insert_anon" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    quantity = 1
    AND payment_status = 'pending'
    AND payment_id IS NULL
    AND qr_code IS NULL
    AND total_amount = (
      SELECT price FROM public.lots
      WHERE id = lot_id AND status = 'active'
    )
  );

-- ============================================================
-- 5. Add explicit deny policies for webhook_logs
--    (service_role bypasses RLS and can still write;
--     anon/authenticated are explicitly blocked)
-- ============================================================
DROP POLICY IF EXISTS "webhook_logs_deny_select" ON public.webhook_logs;
DROP POLICY IF EXISTS "webhook_logs_deny_insert" ON public.webhook_logs;
DROP POLICY IF EXISTS "webhook_logs_deny_update" ON public.webhook_logs;
DROP POLICY IF EXISTS "webhook_logs_deny_delete" ON public.webhook_logs;

CREATE POLICY "webhook_logs_deny_select" ON public.webhook_logs
  FOR SELECT TO anon, authenticated USING (false);

CREATE POLICY "webhook_logs_deny_insert" ON public.webhook_logs
  FOR INSERT TO anon, authenticated WITH CHECK (false);

CREATE POLICY "webhook_logs_deny_update" ON public.webhook_logs
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "webhook_logs_deny_delete" ON public.webhook_logs
  FOR DELETE TO anon, authenticated USING (false);

REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_lot_sold(uuid) FROM PUBLIC;

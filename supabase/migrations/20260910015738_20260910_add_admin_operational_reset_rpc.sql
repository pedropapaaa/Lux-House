/*
# Add protected operational database reset

1. Purpose
- Provide the Participants admin page with a server-enforced reset operation.
- Require an authenticated administrator before any operational data is deleted.

2. Function
- Add `public.reset_operational_data()` with no client-controlled filters.
- The function verifies that `auth.uid()` has a row in `admin_profiles`.
- It clears participants, purchase records, payment history, financial operations,
  cash activity, bar sales, stock movements, webhooks, and audit history.
- It resets every lot's sold quantity to zero.

3. Security
- The function runs as `SECURITY DEFINER` with a fixed `search_path`.
- Execution is revoked from `anon` and granted only to `authenticated`.
- Non-admin authenticated users receive an exception and cannot reset data.

4. Preserved data
- Events, lots, coupons, stock item definitions, and administrator profiles remain.
*/

CREATE OR REPLACE FUNCTION public.reset_operational_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  DELETE FROM public.tickets;
  DELETE FROM public.coupon_usages;
  DELETE FROM public.orders;
  DELETE FROM public.webhook_logs;
  DELETE FROM public.cash_transactions;
  DELETE FROM public.cash_sessions;
  DELETE FROM public.bar_orders;
  DELETE FROM public.stock_movements;
  DELETE FROM public.transactions;
  DELETE FROM public.audit_logs;

  UPDATE public.lots
  SET sold_quantity = 0,
      updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.reset_operational_data() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reset_operational_data() FROM anon;
GRANT EXECUTE ON FUNCTION public.reset_operational_data() TO authenticated;

-- Revoke from PUBLIC (covers anon + authenticated implicitly)
REVOKE EXECUTE ON FUNCTION public.increment_lot_sold(uuid) FROM PUBLIC;

-- Re-grant only to service_role (used by edge functions)
GRANT EXECUTE ON FUNCTION public.increment_lot_sold(uuid) TO service_role;

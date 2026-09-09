-- Fix: set immutable search_path on log_coupon_usage to prevent search path manipulation
CREATE OR REPLACE FUNCTION public.log_coupon_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NEW.used_count > OLD.used_count THEN
    INSERT INTO public.coupon_usages (coupon_id, used_at)
    VALUES (NEW.id, now());
  END IF;
  RETURN NEW;
END;
$$;
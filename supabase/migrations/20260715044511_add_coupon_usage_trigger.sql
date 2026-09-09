-- Create a trigger function that logs to coupon_usages when used_count increases
CREATE OR REPLACE FUNCTION log_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.used_count > OLD.used_count THEN
    INSERT INTO coupon_usages (coupon_id, used_at)
    VALUES (NEW.id, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on coupons table
CREATE TRIGGER coupons_usage_log
AFTER UPDATE OF used_count ON coupons
FOR EACH ROW
EXECUTE FUNCTION log_coupon_usage();
-- Make order_id and buyer_name nullable in coupon_usages, since usages can be tracked
-- even without a specific order (e.g. when incrementing used_count directly)
ALTER TABLE coupon_usages ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE coupon_usages ALTER COLUMN buyer_name DROP NOT NULL;
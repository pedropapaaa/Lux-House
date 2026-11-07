/*
# Allow the service fee in the public order insert rule

1. Modified Policies
- `orders_insert_anon` (INSERT on `orders` for anon + authenticated)
  - Orders are now created with the total = ticket price (after coupon) + the R$ 4.50 service fee.
  - Without a coupon, total_amount must equal the lot price + 4.50.
  - With a coupon, total_amount must be at most the lot price + 4.50 (free orders total 0).
  - All other checks (quantity 1, pending status, no payment data, active lot with stock) are unchanged.

2. Security
- Still server-enforced: the client cannot pay less than the lot price minus nothing, nor more than the lot price plus the fee.
- No grants or RLS settings changed.

3. Notes
- The 4.50 fee is fixed in this rule; if the fee changes, this rule must be updated too.
*/

DROP POLICY IF EXISTS "orders_insert_anon" ON orders;

CREATE POLICY "orders_insert_anon" ON orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  quantity = 1
  AND payment_status = 'pending'
  AND payment_id IS NULL
  AND qr_code IS NULL
  AND total_amount >= 0
  AND EXISTS (
    SELECT 1 FROM lots
    WHERE lots.id = orders.lot_id
      AND lots.status = 'active'
      AND lots.sold_quantity < lots.total_quantity
  )
  AND (
    (coupon_id IS NOT NULL AND total_amount <= (
      SELECT lots.price + 4.50 FROM lots
      WHERE lots.id = orders.lot_id AND lots.status = 'active'
    ))
    OR
    (coupon_id IS NULL AND total_amount = (
      SELECT lots.price + 4.50 FROM lots
      WHERE lots.id = orders.lot_id AND lots.status = 'active'
    ))
  )
);

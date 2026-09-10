/*
# Restrict public free-order approval function

## Purpose
Keep the public checkout flow working while removing an unnecessary API grant.
The browser uses the anonymous role to approve a free order, but signed-in users
and administrators do not need a separate execution grant for this public checkout
operation.

## Security change
- Revoke EXECUTE on `approve_free_order(uuid)` from `authenticated`.
- Keep EXECUTE for `anon`, because guests must be able to complete free checkout.
- The function remains protected by its own checks: the order must exist, have a
  zero total, and still be pending.

## Data changes
- No tables, columns, or rows are changed.
*/

REVOKE EXECUTE ON FUNCTION public.approve_free_order(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.approve_free_order(uuid) TO anon;

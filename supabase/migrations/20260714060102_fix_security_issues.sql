/*
# Fix Security Issues: Function Search Paths, RLS Policies, and EXECUTE Grants

## Summary
Fixes 15 security advisories across the database:
1. Function Search Path Mutable — 3 functions (apply_coupon, increment_coupon_usage, approve_free_order) had mutable search_path. Now all 4 SECURITY DEFINER functions have `SET search_path TO ''` forcing pg_catalog-only resolution.
2. RLS Policy Always True — 5 policies used `true` as their only predicate, bypassing row-level security. Replaced with admin-scoped checks or dropped (redundant with existing admin policies).
3. Public/Signed-In Can Execute SECURITY DEFINER Functions — 4 functions were executable by anon and authenticated roles. EXECUTE revoked from public, anon, and authenticated. The functions are only callable internally (by triggers or other SECURITY DEFINER functions with elevated privileges).

## Changes

### Functions (search_path + EXECUTE revocation)
- `apply_coupon` — added `SET search_path TO ''`, revoked EXECUTE from public/anon/authenticated
- `increment_coupon_usage` — added `SET search_path TO ''`, revoked EXECUTE from public/anon/authenticated
- `approve_free_order` — added `SET search_path TO ''`, revoked EXECUTE from public/anon/authenticated
- `update_updated_at` — already had `SET search_path TO ''`; revoked EXECUTE from public/anon/authenticated

### RLS Policies — coupons table
- Dropped `auth_delete_coupons` (always true, redundant with `coupons_delete_admin`)
- Dropped `auth_insert_coupons` (always true, redundant with `coupons_insert_admin`)
- Dropped `auth_update_coupons` (always true, redundant with `coupons_update_admin`)

### RLS Policies — orders table
- Replaced `orders_update_admin` (always true) with admin-scoped check using `admin_profiles`

### RLS Policies — coupon_usages table
- Replaced `coupon_usages_insert_public` (always true WITH CHECK) with admin-scoped check.
  The `apply_coupon` SECURITY DEFINER function inserts into coupon_usages internally (bypassing RLS),
  so anon no longer needs direct INSERT access.

## Security Notes
1. All SECURITY DEFINER functions now have immutable search_path (`SET search_path TO ''`), preventing search_path hijacking.
2. EXECUTE on all SECURITY DEFINER functions revoked from anon and authenticated — they cannot be called via the REST API (`/rest/v1/rpc/...`).
3. The functions are still callable internally by the database (triggers, other functions) because internal calls use the function owner's privileges.
4. RLS policies that were `true` are now scoped to admin users via `admin_profiles` table membership check.
5. coupon_usages INSERT is now admin-only; the `apply_coupon` function handles public inserts internally via SECURITY DEFINER (bypasses RLS).
*/
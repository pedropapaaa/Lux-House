/*
# Fix infinite RLS recursion on user_profiles and app_settings

## Problem
Several RLS policies on `user_profiles` checked for admin status by
querying `user_profiles` itself:
  EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')

Because RLS is enabled on `user_profiles`, that inner SELECT is itself
subject to RLS, which again tries to evaluate the admin check, which again
queries `user_profiles` ... producing an infinite recursion error:
  "infinite recursion detected in policy for relation user_profiles"

This blocked every operation that needed an admin check, including the
app_settings update that toggles sales on/off.

## Fix
Rewrite all admin-check policies to verify admin membership via the
`admin_profiles` table instead. `admin_profiles` has a simple, non-recursive
SELECT policy (`auth.uid() = id`), so the recursion is broken.

### Tables affected
1. `user_profiles` — 4 policies rewritten (SELECT/INSERT/UPDATE/DELETE admin checks)
2. `app_settings` — 2 policies rewritten (INSERT/UPDATE admin checks)
   The duplicate `app_settings_update_admin` (checking admin_profiles) is
   dropped to avoid redundancy, keeping a single clean policy per verb.

## Security
- No data is lost; only policy definitions change.
- Admin verification now uses `admin_profiles` (authoritative admin table).
- All policies remain scoped to `TO authenticated`.
- `user_profiles` SELECT keeps the non-admin self-read policy (`auth.uid() = id`).
*/

-- ── user_profiles: drop recursive admin policies ──
DROP POLICY IF EXISTS "admins_read_all_user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admins_insert_user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admins_update_user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admins_delete_user_profiles" ON user_profiles;

-- user_profiles: non-recursive admin check via admin_profiles
CREATE POLICY "admins_read_all_user_profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "admins_insert_user_profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "admins_update_user_profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_profiles ap WHERE ap.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "admins_delete_user_profiles"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

-- ── app_settings: drop recursive + duplicate policies ──
DROP POLICY IF EXISTS "admins_update_app_settings" ON app_settings;
DROP POLICY IF EXISTS "admins_insert_app_settings" ON app_settings;
DROP POLICY IF EXISTS "app_settings_update_admin" ON app_settings;

-- app_settings: clean non-recursive admin policies
CREATE POLICY "admins_insert_app_settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "admins_update_app_settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_profiles ap WHERE ap.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

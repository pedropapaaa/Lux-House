/*
# Fix RLS Policies and SECURITY DEFINER Function Permissions

## Purpose
Resolve security scanner findings:
1. audit_logs has a legacy INSERT policy (`authenticated_insert_audit_logs`) with `WITH CHECK (true)` — any signed-in user could insert audit entries. Also has an obsolete `admins_read_audit_logs` policy referencing the old `user_profiles` table. Both are replaced by the correct admin-scoped policies already present.
2. event_schedule has 4 policies all using `USING (true)` / `WITH CHECK (true)` — unrestricted access. Public read is intentional (the public site reads the schedule), but writes must be restricted to authenticated admins.
3. Four SECURITY DEFINER functions (`handle_new_user_profile`, `is_current_user_admin`, `record_user_login`, `update_last_login`) are executable by anon and authenticated roles. They should only be callable internally (by triggers or the service role), not via the REST API.

## Changes

### audit_logs (policies)
- DROP legacy `authenticated_insert_audit_logs` (WITH CHECK true).
- DROP obsolete `admins_read_audit_logs` (references old user_profiles table).
- The correct `admin_select_audit_logs` and `admin_insert_audit_logs` policies already exist and remain.

### event_schedule (policies)
- SELECT: keep public read (`TO anon, authenticated USING (true)`) — the public site reads the schedule.
- INSERT: restrict to authenticated admins (`WITH CHECK` against admin_profiles).
- UPDATE: restrict to authenticated admins (USING + WITH CHECK against admin_profiles).
- DELETE: restrict to authenticated admins (USING against admin_profiles).

### Functions
- `handle_new_user_profile()` — trigger function on auth.users. Revoke EXECUTE from public, anon, authenticated. Harden search_path to '' and qualify table references. Triggers invoke functions with owner privileges regardless of role grants.
- `is_current_user_admin()` — not used by the frontend (it queries admin_profiles directly). Revoke EXECUTE from public, anon, authenticated. Switch to SECURITY INVOKER since it only reads data the caller already has access to.
- `record_user_login()` — not used by the frontend. Revoke EXECUTE from public, anon, authenticated. Switch to SECURITY INVOKER.
- `update_last_login()` — not attached to any trigger. Revoke EXECUTE from public, anon, authenticated. Harden search_path.

## Security
- All writes to event_schedule now require an authenticated admin session.
- Audit log integrity restored — only admins can insert.
- SECURITY DEFINER functions are no longer callable via the public REST API by anon or authenticated roles.

## Important Notes
1. The admin frontend signs in via Supabase auth (useAdminGuard checks getSession), so admin writes run as `authenticated` and pass the admin_profiles check.
2. The public site uses the anon key and only reads event_schedule — SELECT remains open.
3. Trigger functions (handle_new_user_profile) still fire correctly because triggers execute with the function owner's privileges.
*/

-- ============================================================
-- 1. audit_logs — drop legacy/obsolete policies
-- ============================================================
DROP POLICY IF EXISTS "authenticated_insert_audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "admins_read_audit_logs" ON public.audit_logs;

-- ============================================================
-- 2. event_schedule — restrict writes to authenticated admins
-- ============================================================
DROP POLICY IF EXISTS "anon_select_event_schedule" ON public.event_schedule;
DROP POLICY IF EXISTS "anon_insert_event_schedule" ON public.event_schedule;
DROP POLICY IF EXISTS "anon_update_event_schedule" ON public.event_schedule;
DROP POLICY IF EXISTS "anon_delete_event_schedule" ON public.event_schedule;

-- Public read (the public site reads the schedule with the anon key)
CREATE POLICY "anon_select_event_schedule" ON public.event_schedule
  FOR SELECT TO anon, authenticated USING (true);

-- Only authenticated admins can insert
CREATE POLICY "admin_insert_event_schedule" ON public.event_schedule
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid())
  );

-- Only authenticated admins can update
CREATE POLICY "admin_update_event_schedule" ON public.event_schedule
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

-- Only authenticated admins can delete
CREATE POLICY "admin_delete_event_schedule" ON public.event_schedule
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

-- ============================================================
-- 3. SECURITY DEFINER functions — revoke public EXECUTE
-- ============================================================

-- handle_new_user_profile: trigger function, keep SECURITY DEFINER, harden search_path
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, is_active, allowed_modules)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'checkin_operator',
    true,
    '["checkin"]'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM PUBLIC, anon, authenticated;

-- is_current_user_admin: switch to SECURITY INVOKER (reads data caller already has access to)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon, authenticated;

-- record_user_login: switch to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.record_user_login()
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  UPDATE public.user_profiles SET last_login_at = now() WHERE id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.record_user_login() FROM PUBLIC, anon, authenticated;

-- update_last_login: keep SECURITY DEFINER (may be used as trigger), harden search_path
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.user_profiles
  SET last_login_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.update_last_login() FROM PUBLIC, anon, authenticated;
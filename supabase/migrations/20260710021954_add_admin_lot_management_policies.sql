-- ============================================================
-- Allow authenticated admins to UPDATE lots (total_quantity, status)
-- Scoped to users that have an admin_profiles record
-- ============================================================

DROP POLICY IF EXISTS "lots_update_admin" ON lots;
CREATE POLICY "lots_update_admin" ON lots
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  );

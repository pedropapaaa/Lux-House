-- Add used_at timestamp to tickets for check-in tracking
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS used_at timestamptz;

-- Allow authenticated admins to update ticket check-in state
-- Scoped to users that have an admin_profiles record
DROP POLICY IF EXISTS "tickets_update_admin" ON tickets;
CREATE POLICY "tickets_update_admin" ON tickets
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  );

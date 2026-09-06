/*
# Create Audit Log Module

## Purpose
Records every important administrative action for security and compliance.
Enables full traceability of who did what, when, and from where.

## New Table: `audit_logs`

Columns:
- id (uuid PK)
- event_id (FK → events, nullable — some actions are global)
- user_id (uuid, nullable) — admin who performed the action
- user_email (text) — denormalized for quick display
- action (text) — e.g. 'login', 'logout', 'price_change', 'lot_update',
  'coupon_create', 'coupon_delete', 'order_cancel', 'stock_change', 'settings_change'
- entity_type (text, nullable) — 'order', 'lot', 'coupon', 'ticket', 'promoter', etc.
- entity_id (uuid, nullable) — ID of the affected entity
- old_values (jsonb, nullable) — state before change
- new_values (jsonb, nullable) — state after change
- ip_address (text, nullable)
- user_agent (text, nullable)
- created_at (timestamptz)

## RLS
- Admin-only read (authenticated + admin_profiles check)
- Authenticated insert (so admin actions can log themselves)
- No update or delete — audit logs are immutable
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  user_id uuid,
  user_email text,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin can read audit logs
DROP POLICY IF EXISTS "admin_select_audit_logs" ON audit_logs;
CREATE POLICY "admin_select_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

-- Authenticated users (admins) can insert audit logs
DROP POLICY IF EXISTS "admin_insert_audit_logs" ON audit_logs;
CREATE POLICY "admin_insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

-- No UPDATE or DELETE policies — audit logs are immutable

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_id ON audit_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

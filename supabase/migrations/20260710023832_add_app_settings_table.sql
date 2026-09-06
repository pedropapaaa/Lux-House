-- ============================================================
-- App settings table (single-row key-value store)
-- Currently stores: show_remaining_tickets (boolean)
-- ============================================================

CREATE TABLE IF NOT EXISTS app_settings (
  id              text PRIMARY KEY DEFAULT 'main',
  show_remaining_tickets boolean NOT NULL DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings (anon + authenticated)
DROP POLICY IF EXISTS "app_settings_select_public" ON app_settings;
CREATE POLICY "app_settings_select_public" ON app_settings
  FOR SELECT TO anon, authenticated USING (true);

-- Only admins can update settings
DROP POLICY IF EXISTS "app_settings_update_admin" ON app_settings;
CREATE POLICY "app_settings_update_admin" ON app_settings
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

-- Seed default row
INSERT INTO app_settings (id, show_remaining_tickets)
VALUES ('main', false)
ON CONFLICT (id) DO NOTHING;

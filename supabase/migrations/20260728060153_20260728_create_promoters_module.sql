/*
# Create Promoters Module

## Purpose
Each promoter has a unique code, coupon, and commission tracking.
Promoters drive ticket sales and earn commissions. Rankings are automatic.

## New Tables

### 1. `promoters`
- id (uuid PK)
- event_id (FK → events)
- name (text)
- email (text)
- phone (text)
- code (text, unique per event) — short code e.g. "PROMO10"
- coupon_code (text) — linked coupon code for discount tracking
- commission_type (text: 'percent' | 'fixed')
- commission_value (numeric)
- goal (int) — ticket sales target
- is_active (boolean, default true)
- created_at, updated_at

### 2. `promoter_sales` (view-like aggregate — computed at query time)
Not a table. Sales are derived from orders that used the promoter's coupon.
This avoids data duplication.

## RLS
- Admin-only CRUD (authenticated + admin_profiles check)
- Public can read promoter names for ranking display (if desired)
*/

CREATE TABLE IF NOT EXISTS promoters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  code text NOT NULL,
  coupon_code text,
  commission_type text NOT NULL DEFAULT 'percent' CHECK (commission_type IN ('percent', 'fixed')),
  commission_value numeric NOT NULL DEFAULT 0,
  goal int DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, code)
);

ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_promoters" ON promoters;
CREATE POLICY "admin_select_promoters" ON promoters FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_insert_promoters" ON promoters;
CREATE POLICY "admin_insert_promoters" ON promoters FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_promoters" ON promoters;
CREATE POLICY "admin_update_promoters" ON promoters FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_delete_promoters" ON promoters;
CREATE POLICY "admin_delete_promoters" ON promoters FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_promoters_event_id ON promoters(event_id);
CREATE INDEX IF NOT EXISTS idx_promoters_code ON promoters(code);

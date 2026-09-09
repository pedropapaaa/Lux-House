/*
# Create Financial Module

## Purpose
Tracks all revenue, costs, sponsorships, expenses, and commissions
per event. Enables profit/loss analysis and cash flow tracking.

## New Tables

### 1. `transactions`
Unified financial ledger. Every money movement is a row.

Columns:
- id (uuid PK)
- event_id (FK → events)
- type (text: 'revenue' | 'expense' | 'sponsorship' | 'commission' | 'refund')
- category (text) — e.g. 'ticket_sales', 'bar_sales', 'staff', 'equipment', 'rent'
- description (text)
- amount (numeric, always positive — direction determined by type)
- payment_method (text, nullable) — 'cash', 'pix', 'card', 'transfer'
- reference_id (uuid, nullable) — links to orders.id or other source
- created_by (uuid, nullable) — admin who recorded it
- transaction_date (date) — when it occurred
- created_at, updated_at

### 2. `sponsors`
Sponsorship records per event.

Columns:
- id (uuid PK)
- event_id (FK → events)
- name (text)
- amount (numeric)
- tier (text: 'gold' | 'silver' | 'bronze' | 'custom')
- contact_name (text)
- contact_email (text)
- contact_phone (text)
- notes (text)
- created_at, updated_at

## RLS
- Admin-only CRUD on both tables
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('revenue', 'expense', 'sponsorship', 'commission', 'refund')),
  category text NOT NULL,
  description text,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text,
  reference_id uuid,
  created_by uuid,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_transactions" ON transactions;
CREATE POLICY "admin_select_transactions" ON transactions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_insert_transactions" ON transactions;
CREATE POLICY "admin_insert_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_transactions" ON transactions;
CREATE POLICY "admin_update_transactions" ON transactions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_delete_transactions" ON transactions;
CREATE POLICY "admin_delete_transactions" ON transactions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_transactions_event_id ON transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

-- ============================================================
-- SPONSORS
-- ============================================================
CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'custom' CHECK (tier IN ('gold', 'silver', 'bronze', 'custom')),
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_sponsors" ON sponsors;
CREATE POLICY "admin_select_sponsors" ON sponsors FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_insert_sponsors" ON sponsors;
CREATE POLICY "admin_insert_sponsors" ON sponsors FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_sponsors" ON sponsors;
CREATE POLICY "admin_update_sponsors" ON sponsors FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_delete_sponsors" ON sponsors;
CREATE POLICY "admin_delete_sponsors" ON sponsors FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_sponsors_event_id ON sponsors(event_id);

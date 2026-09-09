/*
# Create Events Table & Multi-Event Foundation

## Purpose
Transforms the single-event system into a multi-event platform where each event
has its own lots, orders, tickets, coupons, promoters, financials, and reports.
Data never mixes between events.

## Changes

### 1. New Table: `events`
Central registry for all events. Each event is self-contained with its own
configuration (name, date, location, status, branding).

Columns:
- id (uuid PK)
- name (text, not null) — event display name
- slug (text, unique) — URL-friendly identifier
- description (text) — optional long description
- event_date (date) — when the event happens
- event_time (text) — time range e.g. "21h00 — 03h30"
- location (text) — venue address
- status (text, default 'active') — draft|active|live|completed|cancelled
- banner_url (text) — optional banner image URL
- logo_url (text) — optional logo override
- capacity (int) — max people allowed
- created_at, updated_at (timestamps)

### 2. Multi-Event Columns (ADD COLUMN — no data loss)
Adds nullable `event_id` FK to: lots, orders, tickets, coupons.
Existing rows are backfilled to the default event so nothing breaks.

### 3. Default Event
Creates a "Lux House" default event and assigns all existing data to it.
This ensures backward compatibility — existing frontend code works unchanged.

### 4. RLS Policies
- `events`: admin-only CRUD (authenticated + admin_profiles check)
- New event_id columns inherit existing table policies (no policy changes needed)

### 5. Indexes
- Index on event_id for lots, orders, tickets, coupons for fast filtering
- Index on events.slug for lookups
- Index on events.status for active event queries
*/

-- ============================================================
-- 1. EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  event_date date,
  event_time text,
  location text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'live', 'completed', 'cancelled')),
  banner_url text,
  logo_url text,
  capacity int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Admin-only CRUD on events
DROP POLICY IF EXISTS "admin_select_events" ON events;
CREATE POLICY "admin_select_events" ON events FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_insert_events" ON events;
CREATE POLICY "admin_insert_events" ON events FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_events" ON events;
CREATE POLICY "admin_update_events" ON events FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_delete_events" ON events;
CREATE POLICY "admin_delete_events" ON events FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

-- Public can read active events (for landing page)
DROP POLICY IF EXISTS "public_select_active_events" ON events;
CREATE POLICY "public_select_active_events" ON events FOR SELECT
  TO anon, authenticated USING (status IN ('active', 'live'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- ============================================================
-- 2. ADD event_id TO EXISTING TABLES
-- ============================================================
ALTER TABLE lots ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE SET NULL;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lots_event_id ON lots(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_coupons_event_id ON coupons(event_id);

-- ============================================================
-- 3. CREATE DEFAULT EVENT & BACKFILL
-- ============================================================
INSERT INTO events (id, name, slug, event_date, event_time, location, status)
SELECT
  '00000000-0000-0000-0000-000000000001',
  'Lux House',
  'lux-house',
  '2026-07-18',
  '21h00 — 03h30',
  'Vinhedo — São Paulo, SP',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = '00000000-0000-0000-0000-000000000001');

-- Backfill existing rows
UPDATE lots SET event_id = '00000000-0000-0000-0000-000000000001' WHERE event_id IS NULL;
UPDATE orders SET event_id = '00000000-0000-0000-0000-000000000001' WHERE event_id IS NULL;
UPDATE tickets SET event_id = '00000000-0000-0000-0000-000000000001' WHERE event_id IS NULL;
UPDATE coupons SET event_id = '00000000-0000-0000-0000-000000000001' WHERE event_id IS NULL;

/*
# Event Planning Module — Schedule + Automation

## Purpose
Adds operational planning support to each event:
1. A per-event schedule (list of timed program entries — gates open, DJs, etc.)
   that the admin can create, edit, delete, and reorder.
2. Optional automatic status transitions: the admin can set a date/time at which
   the event should move from one phase to another without manual intervention.

## New Tables

### event_schedule
- `id` (uuid, primary key)
- `event_id` (uuid, references events.id ON DELETE CASCADE)
- `time_label` (text, not null) — the time as displayed to the public, e.g. "21:00"
- `title` (text, not null) — what happens at that time, e.g. "Abertura dos portões"
- `description` (text, nullable) — optional extra detail
- `sort_order` (integer, not null, default 0) — ordering for display
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Modified Tables

### events
New columns added (all nullable / optional):
- `coming_soon_message` (text, nullable) — configurable message shown when status is "coming_soon"
- `last_tickets_alert` (text, nullable) — configurable alert shown when status is "last_tickets"
- `live_info` (jsonb, nullable) — real-time info bundle for "live" status:
  { current_attraction, next_attraction, notices }
- `ended_info` (jsonb, nullable) — final info bundle for "ended" status:
  { final_message, next_event_name, next_event_date }
- `auto_transition_at` (timestamptz, nullable) — when to auto-change status
- `auto_transition_to` (text, nullable) — target status for auto-change

## Security
- RLS enabled on `event_schedule`.
- CRUD policies for `anon, authenticated` (single-tenant admin app, no sign-in gate on the data path).
- events table already has RLS; new columns inherit existing policies automatically.

## Important Notes
1. The schedule is scoped to a single event via `event_id` foreign key.
2. `sort_order` allows manual reordering by the admin.
3. Auto-transition columns are optional — when `auto_transition_at` is NULL, no automatic change occurs.
4. All new columns are nullable so existing event rows are unaffected.
*/

-- ============================================================
-- event_schedule table
-- ============================================================

CREATE TABLE IF NOT EXISTS event_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  time_label text NOT NULL,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE event_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_event_schedule" ON event_schedule;
CREATE POLICY "anon_select_event_schedule" ON event_schedule FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_event_schedule" ON event_schedule;
CREATE POLICY "anon_insert_event_schedule" ON event_schedule FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_event_schedule" ON event_schedule;
CREATE POLICY "anon_update_event_schedule" ON event_schedule FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_event_schedule" ON event_schedule;
CREATE POLICY "anon_delete_event_schedule" ON event_schedule FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- events: add planning columns
-- ============================================================

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN coming_soon_message text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN last_tickets_alert text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN live_info jsonb;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN ended_info jsonb;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN auto_transition_at timestamptz;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN auto_transition_to text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Index for schedule ordering lookups
CREATE INDEX IF NOT EXISTS idx_event_schedule_event_sort ON event_schedule(event_id, sort_order);
/*
# Extend Events for Full Multi-Event Platform

## Purpose
Evolves the events table to support full lifecycle management:
archiving, expected audience, photos, configurable status messages,
and the "last tickets" event state. Adds buyer_city to orders.

## Changes
1. Add columns: is_archived, expected_audience, photos, messages_config
2. Drop old status constraint, migrate values, add new constraint
3. Add buyer_city to orders
4. Indexes
*/

-- ============================================================
-- 1. ADD COLUMNS TO events
-- ============================================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS expected_audience int;
ALTER TABLE events ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS messages_config jsonb;

-- ============================================================
-- 2. DROP OLD CONSTRAINT FIRST, THEN MIGRATE, THEN ADD NEW
-- ============================================================
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

-- Now migrate old values (constraint is dropped, so any value is valid)
UPDATE events SET status = 'sales_open' WHERE status = 'active';
UPDATE events SET status = 'ended' WHERE status = 'completed';
UPDATE events SET status = 'coming_soon' WHERE status = 'draft';

-- Add new constraint with the full set of statuses
ALTER TABLE events ADD CONSTRAINT events_status_check
  CHECK (status IN ('coming_soon', 'sales_open', 'last_tickets', 'live', 'ended', 'cancelled'));

-- ============================================================
-- 3. DEFAULT MESSAGES CONFIG
-- ============================================================
UPDATE events SET messages_config = jsonb_build_object(
  'coming_soon', jsonb_build_object('title', 'Em breve', 'subtitle', 'Mais informações serão divulgadas. Inscrições ainda não abertas.'),
  'sales_open', jsonb_build_object('title', 'Ingressos à venda', 'subtitle', 'Garanta seu ingresso antes que esgote!'),
  'last_tickets', jsonb_build_object('title', 'Últimos ingressos', 'subtitle', 'Corra que está acabando!'),
  'live', jsonb_build_object('title', 'Acontecendo agora', 'subtitle', 'Bom evento!'),
  'ended', jsonb_build_object('title', 'Evento encerrado', 'subtitle', 'Obrigado a todos!')
) WHERE messages_config IS NULL;

-- ============================================================
-- 4. ADD buyer_city TO orders
-- ============================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_city text;

-- ============================================================
-- 5. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_is_archived ON events(is_archived);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_city ON orders(buyer_city);

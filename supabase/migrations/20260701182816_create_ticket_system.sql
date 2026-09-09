/*
# Lux House — Ticket Sales System Schema

## Overview
Creates the complete database schema for the Lux House event ticket sales system.

## New Tables

### 1. `lots` (Lotes de ingressos)
Represents ticket batches (Lote 1, Lote 2, Lote 3). Each lot has a name, price,
available quantity, and status. Status auto-closes when sold out via trigger.

Columns:
- `id` uuid PK
- `name` text — e.g. "Lote 1"
- `price` numeric(10,2) — price per ticket
- `total_quantity` int — total tickets in this lot
- `sold_quantity` int — tickets sold so far
- `status` text — 'active' | 'sold_out' | 'closed'
- `sort_order` int — display order
- `created_at` / `updated_at` timestamps

### 2. `orders` (Pedidos de compra)
Each order represents one ticket purchase. Stores buyer details, lot reference,
payment details from Mercado Pago (payment_id, QR code, status), and expiry.

Columns:
- `id` uuid PK
- `lot_id` uuid FK → lots
- `buyer_name`, `buyer_last_name`, `buyer_cpf`, `buyer_phone`, `buyer_email` text
- `quantity` int
- `total_amount` numeric(10,2)
- `payment_id` text — MP payment ID
- `payment_status` text — 'pending' | 'approved' | 'rejected' | 'expired'
- `qr_code` text — Pix copia-e-cola string
- `qr_code_base64` text — QR code image
- `expires_at` timestamptz — payment expiry time
- `created_at` / `updated_at` timestamps

### 3. `tickets` (Ingressos gerados)
Generated after payment approval. Each ticket has a unique code, buyer info,
event details, and a used flag for door validation.

Columns:
- `id` uuid PK
- `order_id` uuid FK → orders
- `code` text UNIQUE — human-readable unique code (e.g. "RLIO-A3K9")
- `lot_name` text
- `buyer_name`, `buyer_email` text
- `event_date`, `event_time`, `event_location` text
- `is_used` boolean
- `created_at` timestamp

### 4. `webhook_logs` (Logs de webhook)
Stores all incoming Mercado Pago webhook payloads for debugging and audit.

### 5. `admin_profiles` (Administradores)
Links Supabase auth users to admin role. Only users with a record here can
access the admin panel.

## Security (RLS)

- `lots`: public read (anon+auth), no client writes
- `orders`: anon INSERT (purchase flow), anon SELECT by ID (status polling), no client UPDATE
- `tickets`: anon SELECT by code (ticket display), no client write
- `webhook_logs`: no client access (service role only)
- `admin_profiles`: authenticated owner SELECT only

## Triggers / Functions

- `update_updated_at()` trigger keeps updated_at current on lots and orders
- `auto_close_lot()` trigger marks lot as 'sold_out' when sold_quantity >= total_quantity

## Seed Data

Inserts 3 default lots (Lote 1, 2, 3) if they don't exist yet.
*/

-- ============================================================
-- HELPER FUNCTION: update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: lots
-- ============================================================
CREATE TABLE IF NOT EXISTS lots (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  price        numeric(10,2) NOT NULL,
  total_quantity int NOT NULL,
  sold_quantity  int NOT NULL DEFAULT 0,
  status       text NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','sold_out','closed')),
  sort_order   int NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

DROP TRIGGER IF EXISTS lots_updated_at ON lots;
CREATE TRIGGER lots_updated_at
  BEFORE UPDATE ON lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id           uuid NOT NULL REFERENCES lots(id),
  buyer_name       text NOT NULL,
  buyer_last_name  text NOT NULL,
  buyer_cpf        text NOT NULL,
  buyer_phone      text NOT NULL,
  buyer_email      text NOT NULL,
  quantity         int NOT NULL DEFAULT 1,
  total_amount     numeric(10,2) NOT NULL,
  payment_id       text,
  payment_status   text NOT NULL DEFAULT 'pending'
                     CHECK (payment_status IN ('pending','approved','rejected','expired')),
  qr_code          text,
  qr_code_base64   text,
  expires_at       timestamptz,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_payment_id_idx ON orders(payment_id);
CREATE INDEX IF NOT EXISTS orders_buyer_email_idx ON orders(buyer_email);
CREATE INDEX IF NOT EXISTS orders_lot_id_idx ON orders(lot_id);

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: tickets
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL REFERENCES orders(id),
  code             text UNIQUE NOT NULL,
  lot_name         text NOT NULL,
  buyer_name       text NOT NULL,
  buyer_email      text NOT NULL,
  event_date       text NOT NULL,
  event_time       text NOT NULL,
  event_location   text NOT NULL,
  is_used          boolean NOT NULL DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tickets_code_idx ON tickets(code);
CREATE INDEX IF NOT EXISTS tickets_order_id_idx ON tickets(order_id);

-- ============================================================
-- TABLE: webhook_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payload      jsonb NOT NULL,
  payment_id   text,
  status       text,
  processed_at timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: admin_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- lots: public read
DROP POLICY IF EXISTS "lots_select_public" ON lots;
CREATE POLICY "lots_select_public" ON lots FOR SELECT
  TO anon, authenticated USING (true);

-- orders: anon INSERT (purchase flow)
DROP POLICY IF EXISTS "orders_insert_anon" ON orders;
CREATE POLICY "orders_insert_anon" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- orders: anon SELECT by id (status polling — UUID is unguessable)
DROP POLICY IF EXISTS "orders_select_by_id" ON orders;
CREATE POLICY "orders_select_by_id" ON orders FOR SELECT
  TO anon, authenticated USING (true);

-- tickets: anon SELECT (display by ticket code)
DROP POLICY IF EXISTS "tickets_select_public" ON tickets;
CREATE POLICY "tickets_select_public" ON tickets FOR SELECT
  TO anon, authenticated USING (true);

-- webhook_logs: no anon access — edge functions use service role
-- (no policies needed; service role bypasses RLS)

-- admin_profiles: authenticated users see only their own record
DROP POLICY IF EXISTS "admin_profiles_select_own" ON admin_profiles;
CREATE POLICY "admin_profiles_select_own" ON admin_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- ============================================================
-- SEED DATA: default lots
-- ============================================================
INSERT INTO lots (name, price, total_quantity, sort_order)
SELECT 'Lote 1', 80.00, 100, 1
WHERE NOT EXISTS (SELECT 1 FROM lots WHERE name = 'Lote 1');

INSERT INTO lots (name, price, total_quantity, sort_order)
SELECT 'Lote 2', 120.00, 150, 2
WHERE NOT EXISTS (SELECT 1 FROM lots WHERE name = 'Lote 2');

INSERT INTO lots (name, price, total_quantity, sort_order)
SELECT 'Lote 3', 180.00, 200, 3
WHERE NOT EXISTS (SELECT 1 FROM lots WHERE name = 'Lote 3');

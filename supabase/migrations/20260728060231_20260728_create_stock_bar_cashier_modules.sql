/*
# Create Stock, Bar, and Cash Register Modules

## Purpose
1. Stock: Track inventory items (drinks, food, cups, wristbands, ice) with
   quantities, suppliers, costs, margins, and movement history.
2. Bar: QR-based drink redemption system. Cashier sells → unique QR generated →
   bartender scans → QR expires permanently. Full traceability.
3. Cash Register: Each operator has login. Records sales, cancellations, refunds,
   discounts, payment method, responsible operator, timestamp.

## New Tables

### 1. `stock_items`
- id, event_id, name, category (drink/food/cup/wristband/ice/other),
  unit (un/l/kg/ml), initial_qty, current_qty, supplier, cost_price,
  sell_price, margin (computed), low_stock_threshold, created_at, updated_at

### 2. `stock_movements`
- id, stock_item_id (FK), type (in/out/adjust), quantity, reason,
  recorded_by, created_at

### 3. `bar_orders`
- id, event_id, stock_item_id (nullable — can be custom item),
  item_name, price, quantity, payment_method, cashier_id, cashier_name,
  qr_code (unique), status (pending/redeemed/cancelled),
  redeemed_by, redeemed_at, created_at

### 4. `cash_sessions`
- id, event_id, operator_id, operator_name, opening_balance,
  closing_balance, status (open/closed), opened_at, closed_at

### 5. `cash_transactions`
- id, cash_session_id (FK), type (sale/refund/cancel/discount/adjustment),
  amount, payment_method (cash/pix/card), description,
  operator_id, operator_name, created_at

## RLS
- All tables: admin-only CRUD
*/

-- ============================================================
-- STOCK ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('drink', 'food', 'cup', 'wristband', 'ice', 'other')),
  unit text NOT NULL DEFAULT 'un',
  initial_qty numeric NOT NULL DEFAULT 0,
  current_qty numeric NOT NULL DEFAULT 0,
  supplier text,
  cost_price numeric NOT NULL DEFAULT 0,
  sell_price numeric NOT NULL DEFAULT 0,
  low_stock_threshold numeric NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_stock_items" ON stock_items;
CREATE POLICY "admin_select_stock_items" ON stock_items FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_insert_stock_items" ON stock_items;
CREATE POLICY "admin_insert_stock_items" ON stock_items FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_stock_items" ON stock_items;
CREATE POLICY "admin_update_stock_items" ON stock_items FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_delete_stock_items" ON stock_items;
CREATE POLICY "admin_delete_stock_items" ON stock_items FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_stock_items_event_id ON stock_items(event_id);

-- ============================================================
-- STOCK MOVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_item_id uuid REFERENCES stock_items(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('in', 'out', 'adjust')),
  quantity numeric NOT NULL,
  reason text,
  recorded_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_stock_movements" ON stock_movements;
CREATE POLICY "admin_select_stock_movements" ON stock_movements FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_insert_stock_movements" ON stock_movements;
CREATE POLICY "admin_insert_stock_movements" ON stock_movements FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_delete_stock_movements" ON stock_movements;
CREATE POLICY "admin_delete_stock_movements" ON stock_movements FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(stock_item_id);

-- ============================================================
-- BAR ORDERS (QR-based drink redemption)
-- ============================================================
CREATE TABLE IF NOT EXISTS bar_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  stock_item_id uuid REFERENCES stock_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1,
  payment_method text CHECK (payment_method IN ('cash', 'pix', 'card')),
  cashier_id uuid,
  cashier_name text,
  qr_code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed', 'cancelled')),
  redeemed_by text,
  redeemed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bar_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_bar_orders" ON bar_orders;
CREATE POLICY "admin_select_bar_orders" ON bar_orders FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_insert_bar_orders" ON bar_orders;
CREATE POLICY "admin_insert_bar_orders" ON bar_orders FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_bar_orders" ON bar_orders;
CREATE POLICY "admin_update_bar_orders" ON bar_orders FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_delete_bar_orders" ON bar_orders;
CREATE POLICY "admin_delete_bar_orders" ON bar_orders FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_bar_orders_event_id ON bar_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_bar_orders_qr_code ON bar_orders(qr_code);
CREATE INDEX IF NOT EXISTS idx_bar_orders_status ON bar_orders(status);

-- ============================================================
-- CASH SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS cash_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  operator_id uuid,
  operator_name text NOT NULL,
  opening_balance numeric NOT NULL DEFAULT 0,
  closing_balance numeric,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_cash_sessions" ON cash_sessions;
CREATE POLICY "admin_select_cash_sessions" ON cash_sessions FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_insert_cash_sessions" ON cash_sessions;
CREATE POLICY "admin_insert_cash_sessions" ON cash_sessions FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_cash_sessions" ON cash_sessions;
CREATE POLICY "admin_update_cash_sessions" ON cash_sessions FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_delete_cash_sessions" ON cash_sessions;
CREATE POLICY "admin_delete_cash_sessions" ON cash_sessions FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_cash_sessions_event_id ON cash_sessions(event_id);

-- ============================================================
-- CASH TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS cash_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_session_id uuid REFERENCES cash_sessions(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('sale', 'refund', 'cancel', 'discount', 'adjustment')),
  amount numeric NOT NULL DEFAULT 0,
  payment_method text CHECK (payment_method IN ('cash', 'pix', 'card')),
  description text,
  operator_id uuid,
  operator_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_cash_transactions" ON cash_transactions;
CREATE POLICY "admin_select_cash_transactions" ON cash_transactions FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_insert_cash_transactions" ON cash_transactions;
CREATE POLICY "admin_insert_cash_transactions" ON cash_transactions FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_cash_transactions" ON cash_transactions;
CREATE POLICY "admin_update_cash_transactions" ON cash_transactions FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

DROP POLICY IF EXISTS "admin_delete_cash_transactions" ON cash_transactions;
CREATE POLICY "admin_delete_cash_transactions" ON cash_transactions FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_cash_transactions_session_id ON cash_transactions(cash_session_id);

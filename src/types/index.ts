export interface Lot {
  id: string;
  name: string;
  price: number;
  total_quantity: number;
  sold_quantity: number;
  status: 'active' | 'sold_out' | 'closed';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  lot_id: string;
  event_id: string | null;
  buyer_name: string;
  buyer_last_name: string;
  buyer_cpf: string;
  buyer_phone: string;
  buyer_email: string;
  buyer_city: string | null;
  quantity: number;
  total_amount: number;
  payment_id: string | null;
  payment_status: 'pending' | 'approved' | 'rejected' | 'expired';
  qr_code: string | null;
  qr_code_base64: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  lots?: Lot;
}

export interface Ticket {
  id: string;
  order_id: string;
  code: string;
  lot_name: string;
  buyer_name: string;
  buyer_email: string;
  event_date: string;
  event_time: string;
  event_location: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  created_at: string;
}

export interface AdminStats {
  totalSold: number;
  totalPending: number;
  totalRevenue: number;
  byLot: {
    lot_name: string;
    count: number;
    revenue: number;
  }[];
}

// ============================================================
// MULTI-EVENT TYPES
// ============================================================

export type EventStatus = 'coming_soon' | 'sales_open' | 'last_tickets' | 'live' | 'ended' | 'cancelled';

export interface EventMessagesConfig {
  coming_soon?: { title?: string; subtitle?: string };
  sales_open?: { title?: string; subtitle?: string };
  last_tickets?: { title?: string; subtitle?: string };
  live?: { title?: string; subtitle?: string };
  ended?: { title?: string; subtitle?: string };
}

export interface EventLiveInfo {
  current_attraction?: string;
  next_attraction?: string;
  notices?: string;
}

export interface EventEndedInfo {
  final_message?: string;
  next_event_name?: string;
  next_event_date?: string;
}

export interface Event {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  status: EventStatus;
  banner_url: string | null;
  logo_url: string | null;
  capacity: number | null;
  is_archived: boolean;
  expected_audience: number | null;
  photos: string[] | null;
  messages_config: EventMessagesConfig | null;
  coming_soon_message: string | null;
  last_tickets_alert: string | null;
  live_info: EventLiveInfo | null;
  ended_info: EventEndedInfo | null;
  auto_transition_at: string | null;
  auto_transition_to: EventStatus | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// EVENT SCHEDULE
// ============================================================

export interface EventScheduleItem {
  id: string;
  event_id: string;
  time_label: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// PROMOTERS
// ============================================================

export type CommissionType = 'percent' | 'fixed';

export interface Promoter {
  id: string;
  event_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  code: string;
  coupon_code: string | null;
  commission_type: CommissionType;
  commission_value: number;
  goal: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromoterWithStats extends Promoter {
  tickets_sold: number;
  revenue: number;
  commission_earned: number;
  conversion_rate: number;
  progress: number;
}

// ============================================================
// FINANCEIRO
// ============================================================

export type TransactionType = 'revenue' | 'expense' | 'sponsorship' | 'commission' | 'refund';

export interface Transaction {
  id: string;
  event_id: string;
  type: TransactionType;
  category: string;
  description: string | null;
  amount: number;
  payment_method: string | null;
  reference_id: string | null;
  created_by: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export type SponsorTier = 'gold' | 'silver' | 'bronze' | 'custom';

export interface Sponsor {
  id: string;
  event_id: string;
  name: string;
  amount: number;
  tier: SponsorTier;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// AUDIT LOG
// ============================================================

export interface AuditLog {
  id: string;
  event_id: string | null;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ============================================================
// STOCK
// ============================================================

export type StockCategory = 'drink' | 'food' | 'cup' | 'wristband' | 'ice' | 'other';

export interface StockItem {
  id: string;
  event_id: string;
  name: string;
  category: StockCategory;
  unit: string;
  initial_qty: number;
  current_qty: number;
  supplier: string | null;
  cost_price: number;
  sell_price: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export type StockMovementType = 'in' | 'out' | 'adjust';

export interface StockMovement {
  id: string;
  stock_item_id: string;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  recorded_by: string | null;
  created_at: string;
}

// ============================================================
// BAR
// ============================================================

export type BarOrderStatus = 'pending' | 'redeemed' | 'cancelled';

export interface BarOrder {
  id: string;
  event_id: string;
  stock_item_id: string | null;
  item_name: string;
  price: number;
  quantity: number;
  payment_method: string | null;
  cashier_id: string | null;
  cashier_name: string | null;
  qr_code: string;
  status: BarOrderStatus;
  redeemed_by: string | null;
  redeemed_at: string | null;
  created_at: string;
}

// ============================================================
// CASH REGISTER
// ============================================================

export type CashSessionStatus = 'open' | 'closed';

export interface CashSession {
  id: string;
  event_id: string;
  operator_id: string | null;
  operator_name: string;
  opening_balance: number;
  closing_balance: number | null;
  status: CashSessionStatus;
  opened_at: string;
  closed_at: string | null;
}

export type CashTransactionType = 'sale' | 'refund' | 'cancel' | 'discount' | 'adjustment';

export interface CashTransaction {
  id: string;
  cash_session_id: string;
  type: CashTransactionType;
  amount: number;
  payment_method: string | null;
  description: string | null;
  operator_id: string | null;
  operator_name: string | null;
  created_at: string;
}

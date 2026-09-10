/*
# Reset participant and financial operation data

1. Purpose
- Return the participant and financial operation areas to a clean starting point.
- Remove all registered buyers, orders, tickets, payment webhook records, coupon usage records, cash activity, bar sales, stock movement history, financial transactions, and audit history.

2. Data removed
- `tickets`: all issued participant tickets.
- `coupon_usages`: all coupon usage records.
- `orders`: all purchase and payment orders.
- `webhook_logs`: all payment webhook history.
- `cash_transactions`: all cash register entries.
- `cash_sessions`: all cash register sessions.
- `bar_orders`: all bar sales.
- `stock_movements`: all inventory movement history.
- `transactions`: all financial transactions.
- `audit_logs`: all operational history.

3. Data reset
- `lots.sold_quantity` is reset to zero.
- Event definitions, lots, coupons, stock item definitions, and administrator accounts are preserved.

4. Safety notes
- This migration intentionally deletes operational records because the owner requested a reset with no participants registered.
- No tables, columns, access rules, events, lots, coupons, or administrator profiles are dropped or changed.
- Deletes are ordered around existing foreign keys so child records are removed before their parent orders and cash sessions.
*/

DELETE FROM public.tickets;
DELETE FROM public.coupon_usages;
DELETE FROM public.orders;
DELETE FROM public.webhook_logs;
DELETE FROM public.cash_transactions;
DELETE FROM public.cash_sessions;
DELETE FROM public.bar_orders;
DELETE FROM public.stock_movements;
DELETE FROM public.transactions;
DELETE FROM public.audit_logs;

UPDATE public.lots
SET sold_quantity = 0,
    updated_at = now();

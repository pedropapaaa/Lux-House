/*
# Corrigir política RLS de INSERT em orders para permitir cupons de desconto

## Problema
A política `orders_insert_anon` verificava:
  total_amount = lots.price

Isso bloqueava inserções com cupom de desconto, onde total_amount < lots.price.

## Correção
Alterada para permitir:
  total_amount <= lots.price  AND  total_amount > 0

Garante que:
- Ninguém insere com valor maior que o preço original
- Ninguém insere com valor zero ou negativo
- Cupons de desconto funcionam normalmente
*/

DROP POLICY IF EXISTS "orders_insert_anon" ON orders;

CREATE POLICY "orders_insert_anon" ON orders FOR INSERT
TO anon, authenticated
WITH CHECK (
  quantity = 1
  AND payment_status = 'pending'
  AND payment_id IS NULL
  AND qr_code IS NULL
  AND total_amount > 0
  AND total_amount <= (
    SELECT lots.price
    FROM lots
    WHERE lots.id = orders.lot_id
      AND lots.status = 'active'
  )
);

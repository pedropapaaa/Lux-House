-- Add R$0,68 taxa to all lot prices
-- Lote 1: 35.00 -> 35.68
-- Lote 2: 45.00 -> 45.68
-- Lote 3: 55.00 -> 55.68
UPDATE lots SET price = 35.68, updated_at = now() WHERE sort_order = 1;
UPDATE lots SET price = 45.68, updated_at = now() WHERE sort_order = 2;
UPDATE lots SET price = 55.68, updated_at = now() WHERE sort_order = 3;

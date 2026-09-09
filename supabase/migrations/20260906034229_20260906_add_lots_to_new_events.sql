-- Add default lots to the two active events that currently have zero lots
INSERT INTO lots (event_id, name, price, total_quantity, sold_quantity, status, sort_order)
VALUES
  -- Sunset Lux 2026
  ('d84a07d3-6dff-4c06-a1c3-884d81d884a9', 'Lote 1', 35.68, 50,  0, 'active', 1),
  ('d84a07d3-6dff-4c06-a1c3-884d81d884a9', 'Lote 2', 45.68, 100, 0, 'closed', 2),
  ('d84a07d3-6dff-4c06-a1c3-884d81d884a9', 'Lote 3', 55.68, 100, 0, 'closed', 3),
  -- Lux Halloween Night
  ('660e8543-30e3-4f1e-aea4-9e32d2afed4f', 'Lote 1', 35.68, 50,  0, 'active', 1),
  ('660e8543-30e3-4f1e-aea4-9e32d2afed4f', 'Lote 2', 45.68, 100, 0, 'closed', 2),
  ('660e8543-30e3-4f1e-aea4-9e32d2afed4f', 'Lote 3', 55.68, 100, 0, 'closed', 3);

/*
# Adicionar RLS e índice à tabela coupons existente

A tabela já foi criada com as colunas: id, code, discount_type, discount_value,
max_uses, used_count, is_active, created_at, updated_at.

Esta migração adiciona:
- Índice único case-insensitive no campo `code`
- RLS habilitado
- Políticas de acesso para admins (autenticados) e checkout público (anônimos)
*/

CREATE UNIQUE INDEX IF NOT EXISTS coupons_code_unique ON coupons (lower(code));

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_coupons" ON coupons;
CREATE POLICY "auth_select_coupons" ON coupons FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_coupons" ON coupons;
CREATE POLICY "auth_insert_coupons" ON coupons FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_coupons" ON coupons;
CREATE POLICY "auth_update_coupons" ON coupons FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_coupons" ON coupons;
CREATE POLICY "auth_delete_coupons" ON coupons FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_active_coupons" ON coupons;
CREATE POLICY "anon_select_active_coupons" ON coupons FOR SELECT
  TO anon USING (is_active = true);

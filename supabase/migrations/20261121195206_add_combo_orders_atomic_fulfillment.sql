/*
# Combo orders and safe fulfillment
1. Add modality, ticket_subtotal and service_fee to orders without changing existing records.
2. Validate prices and coupons on insertion; reserve lot stock for 30 minutes; single fee per order.
3. Atomic fulfillment creates separate unique tickets and updates stock once under row locks.
4. Preserve read/admin policies; approval is service-role-only, except validated free orders.
*/
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS modality text NOT NULL DEFAULT 'individual';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ticket_subtotal numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS service_fee numeric;
CREATE INDEX IF NOT EXISTS orders_pending_lot_idx ON public.orders(lot_id,expires_at) WHERE payment_status='pending';
CREATE OR REPLACE FUNCTION public.validate_ticket_order() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l lots%ROWTYPE; c coupons%ROWTYPE; base numeric; discounted numeric; reserved integer;
BEGIN
SELECT * INTO l FROM lots WHERE id=NEW.lot_id FOR UPDATE;
IF NOT FOUND OR l.status<>'active' THEN RAISE EXCEPTION 'Lote indisponivel'; END IF;
IF NEW.quantity IS NULL OR NEW.quantity NOT BETWEEN 1 AND 3 OR (l.guests_per_unit>1 AND NEW.quantity<>1) THEN RAISE EXCEPTION 'Quantidade invalida'; END IF;
IF NEW.quantity>1 AND (l.guests_per_unit<>1 OR l.price<>59) THEN RAISE EXCEPTION 'Combo indisponivel'; END IF;
IF NEW.payment_status<>'pending' OR NEW.payment_id IS NOT NULL OR NEW.qr_code IS NOT NULL THEN RAISE EXCEPTION 'Pedido invalido'; END IF;
IF jsonb_typeof(NEW.guests)<>'array' OR jsonb_array_length(NEW.guests)<>(CASE WHEN l.guests_per_unit>1 THEN l.guests_per_unit ELSE 0 END) THEN RAISE EXCEPTION 'Participantes invalidos'; END IF;
SELECT COALESCE(sum(quantity),0) INTO reserved FROM orders WHERE lot_id=l.id AND payment_status='pending' AND expires_at>now();
IF l.sold_quantity+reserved+NEW.quantity>l.total_quantity THEN RAISE EXCEPTION 'Estoque insuficiente'; END IF;
base:=CASE NEW.quantity WHEN 2 THEN 110 WHEN 3 THEN 159 ELSE l.price END; discounted:=base;
IF NEW.coupon_id IS NOT NULL THEN
SELECT * INTO c FROM coupons WHERE id=NEW.coupon_id AND is_active FOR UPDATE;
IF NOT FOUND OR (c.max_uses IS NOT NULL AND c.used_count>=c.max_uses) THEN RAISE EXCEPTION 'Cupom indisponivel'; END IF;
discounted:=greatest(0,round(CASE WHEN c.discount_type='percent' THEN base*(1-c.discount_value/100) ELSE base-c.discount_value END,2));
END IF;
NEW.event_id:=l.event_id;
NEW.modality:=CASE WHEN l.guests_per_unit>1 THEN 'camarote' WHEN NEW.quantity=2 THEN 'double' WHEN NEW.quantity=3 THEN 'triple' ELSE 'individual' END;
NEW.ticket_subtotal:=discounted; NEW.service_fee:=CASE WHEN discounted=0 THEN 0 ELSE 4.5 END;
NEW.total_amount:=discounted+NEW.service_fee; NEW.discount_amount:=base-discounted; NEW.expires_at:=now()+interval '30 minutes'; RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.validate_ticket_order() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS validate_ticket_order ON public.orders;
CREATE TRIGGER validate_ticket_order BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.validate_ticket_order();
DROP POLICY IF EXISTS orders_insert_anon ON public.orders;
CREATE POLICY orders_insert_anon ON public.orders FOR INSERT TO anon,authenticated WITH CHECK(payment_status='pending' AND payment_id IS NULL AND quantity BETWEEN 1 AND 3 AND service_fee IN(0,4.5) AND total_amount=ticket_subtotal+service_fee);
CREATE OR REPLACE FUNCTION public.fulfill_ticket_order(p_order uuid,p_payment text,p_amount numeric) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o orders%ROWTYPE; l lots%ROWTYPE; e events%ROWTYPE; n integer; i integer; guest jsonb;
BEGIN
SELECT * INTO o FROM orders WHERE id=p_order FOR UPDATE;
IF NOT FOUND OR o.total_amount<>p_amount OR (o.payment_id IS NOT NULL AND o.payment_id<>p_payment) THEN RAISE EXCEPTION 'Pagamento invalido'; END IF;
IF o.payment_status='approved' THEN RETURN false; END IF;
IF o.payment_status<>'pending' THEN RAISE EXCEPTION 'Pedido indisponivel'; END IF;
SELECT * INTO l FROM lots WHERE id=o.lot_id FOR UPDATE;
IF l.sold_quantity+o.quantity>l.total_quantity THEN RAISE EXCEPTION 'Estoque insuficiente'; END IF;
SELECT * INTO e FROM events WHERE id=o.event_id;
n:=CASE WHEN l.guests_per_unit>1 THEN l.guests_per_unit ELSE o.quantity END;
UPDATE lots SET sold_quantity=sold_quantity+o.quantity,status=CASE WHEN sold_quantity+o.quantity>=total_quantity THEN 'sold_out' ELSE status END WHERE id=l.id;
UPDATE orders SET payment_status='approved',payment_id=p_payment WHERE id=o.id;
FOR i IN 0..n-1 LOOP
 guest:=o.guests->i;
 INSERT INTO tickets(order_id,code,lot_name,buyer_name,buyer_email,event_date,event_time,event_location,event_id,holder_name,holder_cpf)
 VALUES(o.id,'RLIO-'||upper(replace(gen_random_uuid()::text,'-','')),l.name,o.buyer_name||' '||o.buyer_last_name,o.buyer_email,coalesce(e.event_date::text,'Data do evento'),coalesce(e.event_time,'Consulte os detalhes'),coalesce(e.location,'Local do evento'),o.event_id,guest->>'name',guest->>'cpf');
END LOOP;
IF o.coupon_id IS NOT NULL THEN
UPDATE coupons SET used_count=used_count+1 WHERE id=o.coupon_id;
INSERT INTO coupon_usages(coupon_id,order_id,buyer_name,used_at) VALUES(o.coupon_id,o.id,o.buyer_name||' '||o.buyer_last_name,now()) ON CONFLICT(order_id) DO NOTHING;
END IF; RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.fulfill_ticket_order(uuid,text,numeric) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_ticket_order(uuid,text,numeric) TO service_role;
CREATE OR REPLACE FUNCTION public.approve_free_order(order_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
IF NOT EXISTS(SELECT 1 FROM orders WHERE id=order_id AND total_amount=0) THEN RAISE EXCEPTION 'Pedido nao gratuito'; END IF;
PERFORM fulfill_ticket_order(order_id,'FREE-'||order_id::text,0);
END $$;
GRANT EXECUTE ON FUNCTION public.approve_free_order(uuid) TO anon,authenticated;
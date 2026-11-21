/*
# Preserve automatic common-lot progression
1. Keep the existing automatic opening of the next common lot when one sells out.
2. Restrict progression to the same event and common-ticket category; never close or automatically change camarotes.
3. No records are removed. The internal trigger function is not exposed to client roles.
*/
CREATE OR REPLACE FUNCTION public.advance_common_ticket_lot() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
IF NEW.guests_per_unit=1 AND NEW.status='sold_out' AND OLD.status<>'sold_out' AND NOT EXISTS(SELECT 1 FROM lots WHERE event_id=NEW.event_id AND guests_per_unit=1 AND status='active' AND id<>NEW.id) THEN
UPDATE lots SET status='active' WHERE id=(SELECT id FROM lots WHERE event_id=NEW.event_id AND guests_per_unit=1 AND status='closed' AND sort_order>NEW.sort_order AND sold_quantity<total_quantity ORDER BY sort_order LIMIT 1);
END IF;
RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.advance_common_ticket_lot() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS advance_common_ticket_lot ON public.lots;
CREATE TRIGGER advance_common_ticket_lot AFTER UPDATE OF status ON public.lots FOR EACH ROW EXECUTE FUNCTION public.advance_common_ticket_lot();
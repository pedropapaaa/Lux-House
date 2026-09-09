import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { logAudit } from './useAuditLog';
import type { StockItem, StockMovement } from '../types';

export function useStockItems(eventId: string) {
  return useQuery<StockItem[]>({
    queryKey: ['stock-items', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .eq('event_id', eventId)
        .order('name', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateStockItem(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<StockItem, 'id' | 'created_at' | 'updated_at' | 'event_id' | 'current_qty'>) => {
      const payload = { ...input, event_id: eventId, current_qty: input.initial_qty };
      const { data, error } = await supabase
        .from('stock_items')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      await logAudit({ action: 'stock_create', event_id: eventId, entity_type: 'stock_item', entity_id: data.id, new_values: payload });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-items', eventId] });
    },
  });
}

export function useUpdateStockItem(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<StockItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('stock_items')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await logAudit({ action: 'stock_update', event_id: eventId, entity_type: 'stock_item', entity_id: id, new_values: patch });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-items', eventId] });
    },
  });
}

export function useDeleteStockItem(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stock_items').delete().eq('id', id);
      if (error) throw error;
      await logAudit({ action: 'stock_delete', event_id: eventId, entity_type: 'stock_item', entity_id: id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-items', eventId] });
    },
  });
}

export function useStockMovements(itemId: string | undefined) {
  return useQuery<StockMovement[]>({
    queryKey: ['stock-movements', itemId],
    enabled: !!itemId,
    queryFn: async () => {
      if (!itemId) return [];
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('stock_item_id', itemId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddStockMovement(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      stock_item_id: string;
      type: 'in' | 'out' | 'adjust';
      quantity: number;
      reason?: string;
    }) => {
      const { data: item } = await supabase
        .from('stock_items')
        .select('current_qty')
        .eq('id', input.stock_item_id)
        .maybeSingle();
      const current = item?.current_qty ?? 0;
      const delta = input.type === 'in' ? input.quantity : input.type === 'out' ? -input.quantity : 0;
      const newQty = input.type === 'adjust' ? input.quantity : current + delta;
      const { error: mErr } = await supabase
        .from('stock_movements')
        .insert({ ...input, reason: input.reason ?? null });
      if (mErr) throw mErr;
      const { error: uErr } = await supabase
        .from('stock_items')
        .update({ current_qty: newQty })
        .eq('id', input.stock_item_id);
      if (uErr) throw uErr;
      await logAudit({ action: 'stock_movement', event_id: eventId, entity_type: 'stock_item', entity_id: input.stock_item_id, new_values: { type: input.type, quantity: input.quantity, new_qty: newQty } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-items'] });
      qc.invalidateQueries({ queryKey: ['stock-movements'] });
    },
  });
}

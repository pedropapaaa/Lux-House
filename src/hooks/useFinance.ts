import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { logAudit } from './useAuditLog';
import type { Transaction, Sponsor } from '../types';

export function useTransactions(eventId: string) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('event_id', eventId)
        .order('transaction_date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateTransaction(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'event_id'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...input, event_id: eventId })
        .select()
        .single();
      if (error) throw error;
      await logAudit({ action: 'transaction_create', event_id: eventId, entity_type: 'transaction', entity_id: data.id, new_values: input });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions', eventId] });
    },
  });
}

export function useDeleteTransaction(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      await logAudit({ action: 'transaction_delete', event_id: eventId, entity_type: 'transaction', entity_id: id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions', eventId] });
    },
  });
}

export function useSponsors(eventId: string) {
  return useQuery<Sponsor[]>({
    queryKey: ['sponsors', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('event_id', eventId)
        .order('amount', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateSponsor(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Sponsor, 'id' | 'created_at' | 'updated_at' | 'event_id'>) => {
      const { data, error } = await supabase
        .from('sponsors')
        .insert({ ...input, event_id: eventId })
        .select()
        .single();
      if (error) throw error;
      await logAudit({ action: 'sponsor_create', event_id: eventId, entity_type: 'sponsor', entity_id: data.id, new_values: input });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sponsors', eventId] });
    },
  });
}

export function useDeleteSponsor(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sponsors').delete().eq('id', id);
      if (error) throw error;
      await logAudit({ action: 'sponsor_delete', event_id: eventId, entity_type: 'sponsor', entity_id: id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sponsors', eventId] });
    },
  });
}

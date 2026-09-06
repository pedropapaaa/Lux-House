import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { logAudit } from './useAuditLog';
import type { Event, EventStatus } from '../types';

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: ['events', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      slug: string;
      description?: string;
      event_date?: string;
      event_time?: string;
      location?: string;
      capacity?: number;
      expected_audience?: number;
      banner_url?: string;
      status?: EventStatus;
    }) => {
      const { data, error } = await supabase
        .from('events')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      await logAudit({ action: 'event_create', entity_type: 'event', entity_id: data.id, new_values: input });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Event> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await logAudit({ action: 'event_update', entity_type: 'event', entity_id: id, new_values: patch });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useArchiveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .update({ is_archived: true })
        .eq('id', id);
      if (error) throw error;
      await logAudit({ action: 'event_archive', entity_type: 'event', entity_id: id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUnarchiveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .update({ is_archived: false })
        .eq('id', id);
      if (error) throw error;
      await logAudit({ action: 'event_unarchive', entity_type: 'event', entity_id: id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDuplicateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: original, error: fetchErr } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!original) throw new Error('Evento não encontrado');

      const slugBase = `${original.slug}-copia`;
      const { data: dup, error: dupErr } = await supabase
        .from('events')
        .insert({
          name: `${original.name} (Cópia)`,
          slug: slugBase,
          description: original.description,
          event_date: original.event_date,
          event_time: original.event_time,
          location: original.location,
          capacity: original.capacity,
          expected_audience: original.expected_audience,
          banner_url: original.banner_url,
          logo_url: original.logo_url,
          photos: original.photos,
          messages_config: original.messages_config,
          status: 'coming_soon',
          is_archived: false,
        })
        .select()
        .single();
      if (dupErr) throw dupErr;
      await logAudit({ action: 'event_duplicate', entity_type: 'event', entity_id: dup.id, new_values: { source_id: id } });
      return dup;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

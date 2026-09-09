import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { logAudit } from './useAuditLog';
import type { EventScheduleItem } from '../types';

export function useEventSchedule(eventId: string) {
  return useQuery<EventScheduleItem[]>({
    queryKey: ['event-schedule', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_schedule')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!eventId,
  });
}

export function useCreateScheduleItem(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { time_label: string; title: string; description?: string; sort_order?: number }) => {
      const { data, error } = await supabase
        .from('event_schedule')
        .insert({ ...input, event_id: eventId })
        .select()
        .single();
      if (error) throw error;
      await logAudit({ action: 'schedule_create', event_id: eventId, entity_type: 'event_schedule', entity_id: data.id, new_values: input });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event-schedule', eventId] }),
  });
}

export function useUpdateScheduleItem(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<EventScheduleItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('event_schedule')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await logAudit({ action: 'schedule_update', event_id: eventId, entity_type: 'event_schedule', entity_id: id, new_values: patch });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event-schedule', eventId] }),
  });
}

export function useDeleteScheduleItem(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('event_schedule').delete().eq('id', id);
      if (error) throw error;
      await logAudit({ action: 'schedule_delete', event_id: eventId, entity_type: 'event_schedule', entity_id: id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event-schedule', eventId] }),
  });
}

export function useReorderSchedule(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      for (const item of items) {
        const { error } = await supabase
          .from('event_schedule')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event-schedule', eventId] }),
  });
}

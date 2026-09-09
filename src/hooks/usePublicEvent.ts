import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Event, EventScheduleItem } from '../types';

// Fetch the most recent non-archived event for the public site.
export function usePublicEvent() {
  return useQuery<Event | null>({
    queryKey: ['public-event'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function usePublicSchedule(eventId: string | undefined) {
  return useQuery<EventScheduleItem[]>({
    queryKey: ['public-schedule', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_schedule')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 30,
  });
}

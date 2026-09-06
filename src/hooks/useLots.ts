import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Lot } from '../types';

export function useLots(eventId?: string) {
  return useQuery<Lot[]>({
    queryKey: ['lots', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      let query = supabase
        .from('lots')
        .select('*')
        .order('sort_order', { ascending: true });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

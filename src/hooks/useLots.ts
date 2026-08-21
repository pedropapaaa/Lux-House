import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Lot } from '../types';

export function useLots() {
  return useQuery<Lot[]>({
    queryKey: ['lots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lots')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';

export function useOrder(orderId: string | undefined, refetchInterval?: number) {
  return useQuery<Order | null>({
    queryKey: ['order', orderId],
    enabled: !!orderId,
    refetchInterval,
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('orders')
        .select('*, lots(*)')
        .eq('id', orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

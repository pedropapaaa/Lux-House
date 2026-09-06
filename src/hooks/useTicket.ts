import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Ticket } from '../types';

export function useTicketByCode(code: string | undefined) {
  return useQuery<Ticket | null>({
    queryKey: ['ticket', 'code', code],
    enabled: !!code,
    queryFn: async () => {
      if (!code) return null;
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('code', code)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useTicketByOrderId(orderId: string | undefined, enabled: boolean) {
  return useQuery<Ticket | null>({
    queryKey: ['ticket', 'order', orderId],
    enabled: !!orderId && enabled,
    refetchInterval: 3000,
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { AuditLog } from '../types';

export function useAuditLogs(limit = 100) {
  return useQuery<AuditLog[]>({
    queryKey: ['audit-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 10,
  });
}

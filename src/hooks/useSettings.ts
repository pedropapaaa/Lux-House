import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface AppSettings {
  show_remaining_tickets: boolean;
  sales_enabled: boolean;
}

export function useSettings() {
  return useQuery<AppSettings>({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('show_remaining_tickets, sales_enabled')
        .eq('id', 'main')
        .maybeSingle();
      if (error) throw error;
      return data ?? { show_remaining_tickets: false, sales_enabled: true };
    },
    staleTime: 1000 * 30,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<AppSettings>) => {
      const { error, count } = await supabase
        .from('app_settings')
        .update(patch, { count: 'exact' })
        .eq('id', 'main');
      if (error) throw error;
      if (count === 0) throw new Error('Não foi possível salvar — verifique se você está autenticado como administrador.');
    },
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: ['app-settings'] });
      const previous = qc.getQueryData<AppSettings>(['app-settings']);
      if (previous) {
        qc.setQueryData<AppSettings>(['app-settings'], { ...previous, ...patch });
      }
      return { previous };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app-settings'] });
    },
    onError: (_err, _patch, context) => {
      if (context?.previous) {
        qc.setQueryData(['app-settings'], context.previous);
      }
    },
  });
}

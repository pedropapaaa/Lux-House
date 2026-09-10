import { useEffect, useState } from 'react';
import { Save, Globe2, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { useEventContext } from '../../context/EventContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import type { Event, EventStatus, EventScheduleItem } from '../../types';

const statusOptions: { value: EventStatus; label: string }[] = [
  { value: 'coming_soon', label: 'Em breve' }, { value: 'sales_open', label: 'Vendas abertas' },
  { value: 'last_tickets', label: 'Últimos ingressos' }, { value: 'live', label: 'Acontecendo' },
  { value: 'ended', label: 'Encerrado' }, { value: 'cancelled', label: 'Cancelado' },
];

interface SiteForm {
  name: string; slug: string; description: string; event_date: string; event_time: string; location: string;
  capacity: string; expected_audience: string; status: EventStatus; banner_url: string; logo_url: string;
  coming_soon_message: string; last_tickets_alert: string; photos: string;
  current_attraction: string; next_attraction: string; notices: string;
  final_message: string; next_event_name: string; next_event_date: string;
}

interface ScheduleDraft { id?: string; time_label: string; title: string; description: string; sort_order: number }

function toForm(event: Event): SiteForm {
  const live = event.live_info ?? {};
  const ended = event.ended_info ?? {};
  return {
    name: event.name, slug: event.slug, description: event.description ?? '', event_date: event.event_date ?? '',
    event_time: event.event_time ?? '', location: event.location ?? '', capacity: event.capacity?.toString() ?? '',
    expected_audience: event.expected_audience?.toString() ?? '', status: event.status, banner_url: event.banner_url ?? '',
    logo_url: event.logo_url ?? '', coming_soon_message: event.coming_soon_message ?? '',
    last_tickets_alert: event.last_tickets_alert ?? '', photos: event.photos?.join('\n') ?? '',
    current_attraction: live.current_attraction ?? '', next_attraction: live.next_attraction ?? '', notices: live.notices ?? '',
    final_message: ended.final_message ?? '', next_event_name: ended.next_event_name ?? '', next_event_date: ended.next_event_date ?? '',
  };
}

function Field({ label, value, onChange, multiline = false, placeholder = '' }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium mb-1.5 block">{label}</span>
      {multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className="w-full input-premium rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-y" /> : <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />}
    </label>
  );
}

export default function EventEditPage() {
  const { loading } = useAdminGuard();
  const { selectedEvent } = useEventContext();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SiteForm | null>(null);
  const [scheduleDrafts, setScheduleDrafts] = useState<ScheduleDraft[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: schedule = [] } = useQuery<EventScheduleItem[]>({
    queryKey: ['site-schedule', selectedEvent?.id],
    enabled: !!selectedEvent,
    queryFn: async () => {
      const { data, error: queryError } = await supabase.from('event_schedule').select('*').eq('event_id', selectedEvent?.id).order('sort_order');
      if (queryError) throw queryError;
      return data ?? [];
    },
  });

  useEffect(() => { if (selectedEvent) setForm(toForm(selectedEvent)); }, [selectedEvent]);
  useEffect(() => { setScheduleDrafts(schedule.map((item) => ({ id: item.id, time_label: item.time_label, title: item.title, description: item.description ?? '', sort_order: item.sort_order }))); }, [schedule]);

  const saveSite = useMutation({
    mutationFn: async () => {
      if (!selectedEvent || !form) throw new Error('Site não carregado.');
      const { error: updateError } = await supabase.from('events').update({
        name: form.name.trim(), slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'), description: form.description.trim() || null,
        event_date: form.event_date || null, event_time: form.event_time.trim() || null, location: form.location.trim() || null,
        capacity: form.capacity ? Number(form.capacity) : null, expected_audience: form.expected_audience ? Number(form.expected_audience) : null,
        status: form.status, banner_url: form.banner_url.trim() || null, logo_url: form.logo_url.trim() || null,
        coming_soon_message: form.coming_soon_message.trim() || null, last_tickets_alert: form.last_tickets_alert.trim() || null,
        photos: form.photos.split('\n').map((url) => url.trim()).filter(Boolean),
        live_info: { current_attraction: form.current_attraction.trim() || undefined, next_attraction: form.next_attraction.trim() || undefined, notices: form.notices.trim() || undefined },
        ended_info: { final_message: form.final_message.trim() || undefined, next_event_name: form.next_event_name.trim() || undefined, next_event_date: form.next_event_date.trim() || undefined },
      }).eq('id', selectedEvent.id);
      if (updateError) throw updateError;
      const existingIds = scheduleDrafts.filter((item) => item.id).map((item) => item.id as string);
      if (existingIds.length) await supabase.from('event_schedule').delete().eq('event_id', selectedEvent.id).not('id', 'in', `(${existingIds.join(',')})`);
      for (const [index, item] of scheduleDrafts.entries()) {
        const payload = { event_id: selectedEvent.id, time_label: item.time_label.trim(), title: item.title.trim(), description: item.description.trim() || null, sort_order: index };
        const result = item.id ? await supabase.from('event_schedule').update(payload).eq('id', item.id) : await supabase.from('event_schedule').insert(payload);
        if (result.error) throw result.error;
      }
    },
    onSuccess: () => { void queryClient.invalidateQueries(); setMessage('Site atualizado com sucesso.'); setError(''); },
    onError: (saveError: Error) => { setError(saveError.message || 'Não foi possível salvar o site.'); setMessage(''); },
  });

  if (loading) return <div className="min-h-screen bg-dark-950 flex items-center justify-center"><Spinner size={48} /></div>;
  if (!selectedEvent || !form) return <AdminLayout title="Modificar site"><div className="glass-card rounded-2xl p-10 text-center"><Globe2 size={34} className="text-white/20 mx-auto mb-3" /><p className="text-white/50">O evento único ainda está carregando.</p></div></AdminLayout>;

  const setField = (key: keyof SiteForm, value: string) => { setForm((current) => current ? { ...current, [key]: value } : current); setMessage(''); setError(''); };
  const addSchedule = () => setScheduleDrafts((items) => [...items, { time_label: '', title: '', description: '', sort_order: items.length }]);
  const updateSchedule = (index: number, key: keyof ScheduleDraft, value: string) => setScheduleDrafts((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));

  return (
    <AdminLayout title="Modificar site">
      <div className="max-w-5xl space-y-5">
        <div className="glass-card rounded-2xl p-5 sm:p-6"><div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-magenta-500/15 text-magenta-300 flex items-center justify-center"><Globe2 size={19} /></div><div><h2 className="text-lg font-medium text-white">Conteúdo completo do site</h2><p className="text-xs text-white/35">Tudo o que você salvar aqui aparece no site público do evento único.</p></div></div>
          <div className="grid sm:grid-cols-2 gap-4"><Field label="Nome principal" value={form.name} onChange={(value) => setField('name', value)} /><Field label="Identificador" value={form.slug} onChange={(value) => setField('slug', value)} /><Field label="Data" value={form.event_date} onChange={(value) => setField('event_date', value)} /><Field label="Horário" value={form.event_time} onChange={(value) => setField('event_time', value)} /><Field label="Local" value={form.location} onChange={(value) => setField('location', value)} /><Field label="Capacidade" value={form.capacity} onChange={(value) => setField('capacity', value)} /><Field label="Público esperado" value={form.expected_audience} onChange={(value) => setField('expected_audience', value)} /><label><span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium mb-1.5 block">Status</span><select value={form.status} onChange={(event) => setField('status', event.target.value)} className="w-full input-premium rounded-xl px-4 py-3 text-sm text-white outline-none">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div>
          <div className="grid gap-4 mt-4"><Field label="Descrição principal" value={form.description} onChange={(value) => setField('description', value)} multiline /><Field label="Imagem dos avisos (URL)" value={form.banner_url} onChange={(value) => setField('banner_url', value)} /><Field label="Logo (URL opcional)" value={form.logo_url} onChange={(value) => setField('logo_url', value)} /><Field label="Fotos das atrações (uma URL por linha)" value={form.photos} onChange={(value) => setField('photos', value)} multiline /></div>
        </div>

        <div className="glass-card rounded-2xl p-5 sm:p-6"><h2 className="text-lg font-medium text-white mb-1">Mensagens e status</h2><p className="text-xs text-white/35 mb-5">Controle os textos que aparecem conforme o momento do evento.</p><div className="grid sm:grid-cols-2 gap-4"><Field label="Mensagem quando estiver em breve" value={form.coming_soon_message} onChange={(value) => setField('coming_soon_message', value)} multiline /><Field label="Alerta de últimos ingressos" value={form.last_tickets_alert} onChange={(value) => setField('last_tickets_alert', value)} multiline /><Field label="Atração atual (ao vivo)" value={form.current_attraction} onChange={(value) => setField('current_attraction', value)} /><Field label="Próxima atração" value={form.next_attraction} onChange={(value) => setField('next_attraction', value)} /><Field label="Aviso ao vivo" value={form.notices} onChange={(value) => setField('notices', value)} multiline /><Field label="Mensagem de encerramento" value={form.final_message} onChange={(value) => setField('final_message', value)} multiline /><Field label="Próximo evento" value={form.next_event_name} onChange={(value) => setField('next_event_name', value)} /><Field label="Data do próximo evento" value={form.next_event_date} onChange={(value) => setField('next_event_date', value)} /></div></div>

        <div className="glass-card rounded-2xl p-5 sm:p-6"><div className="flex items-center justify-between gap-3 mb-5"><div><h2 className="text-lg font-medium text-white">Atrações e programação</h2><p className="text-xs text-white/35">Esses itens formam os cards da seção Atrações.</p></div><Button variant="outline" size="sm" onClick={addSchedule}><Plus size={14} /> Adicionar</Button></div><div className="space-y-3">{scheduleDrafts.map((item, index) => <div key={item.id ?? `new-${index}`} className="grid sm:grid-cols-[120px_1fr_1fr_auto] gap-3 items-end"><Field label="Horário" value={item.time_label} onChange={(value) => updateSchedule(index, 'time_label', value)} /><Field label="Título" value={item.title} onChange={(value) => updateSchedule(index, 'title', value)} /><Field label="Descrição" value={item.description} onChange={(value) => updateSchedule(index, 'description', value)} /><button type="button" onClick={() => setScheduleDrafts((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="h-11 px-3 rounded-xl border border-red-500/20 text-red-300 hover:bg-red-500/10"><Trash2 size={15} /></button></div>)}</div></div>

        {(message || error) && <p className={`text-sm ${error ? 'text-red-400' : 'text-emerald-400'}`}>{error || message}</p>}<Button onClick={() => saveSite.mutate()} loading={saveSite.isPending} className="w-full sm:w-auto"><Save size={15} /> Salvar site</Button>
      </div>
    </AdminLayout>
  );
}

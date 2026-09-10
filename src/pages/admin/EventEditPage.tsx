import { useEffect, useState } from 'react';
import { Save, CalendarDays } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { useEventContext } from '../../context/EventContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import type { Event, EventStatus } from '../../types';

const statusOptions: { value: EventStatus; label: string }[] = [
  { value: 'coming_soon', label: 'Em breve' },
  { value: 'sales_open', label: 'Vendas abertas' },
  { value: 'last_tickets', label: 'Últimos ingressos' },
  { value: 'live', label: 'Acontecendo' },
  { value: 'ended', label: 'Encerrado' },
  { value: 'cancelled', label: 'Cancelado' },
];

interface EventForm {
  name: string;
  slug: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  capacity: string;
  expected_audience: string;
  status: EventStatus;
  banner_url: string;
  coming_soon_message: string;
  last_tickets_alert: string;
}

function toForm(event: Event): EventForm {
  return {
    name: event.name,
    slug: event.slug,
    description: event.description ?? '',
    event_date: event.event_date ?? '',
    event_time: event.event_time ?? '',
    location: event.location ?? '',
    capacity: event.capacity?.toString() ?? '',
    expected_audience: event.expected_audience?.toString() ?? '',
    status: event.status,
    banner_url: event.banner_url ?? '',
    coming_soon_message: event.coming_soon_message ?? '',
    last_tickets_alert: event.last_tickets_alert ?? '',
  };
}

export default function EventEditPage() {
  const { loading } = useAdminGuard();
  const { selectedEvent } = useEventContext();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EventForm | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedEvent) setForm(toForm(selectedEvent));
  }, [selectedEvent]);

  const updateEvent = useMutation({
    mutationFn: async (values: EventForm) => {
      if (!selectedEvent) throw new Error('Nenhum evento selecionado.');
      const { error: updateError } = await supabase
        .from('events')
        .update({
          name: values.name.trim(),
          slug: values.slug.trim().toLowerCase().replace(/\s+/g, '-'),
          description: values.description.trim() || null,
          event_date: values.event_date || null,
          event_time: values.event_time.trim() || null,
          location: values.location.trim() || null,
          capacity: values.capacity ? Number(values.capacity) : null,
          expected_audience: values.expected_audience ? Number(values.expected_audience) : null,
          status: values.status,
          banner_url: values.banner_url.trim() || null,
          coming_soon_message: values.coming_soon_message.trim() || null,
          last_tickets_alert: values.last_tickets_alert.trim() || null,
        })
        .eq('id', selectedEvent.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] });
      void queryClient.invalidateQueries({ queryKey: ['public-event'] });
      setMessage('Evento atualizado com sucesso.');
      setError('');
    },
    onError: (updateError: Error) => {
      setError(updateError.message || 'Não foi possível salvar o evento.');
      setMessage('');
    },
  });

  if (loading) {
    return <div className="min-h-screen bg-dark-950 flex items-center justify-center"><Spinner size={48} /></div>;
  }

  if (!selectedEvent || !form) {
    return (
      <AdminLayout title="Modificar evento">
        <div className="glass-card rounded-2xl p-10 text-center">
          <CalendarDays size={34} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50">Selecione um evento no seletor acima para modificar.</p>
        </div>
      </AdminLayout>
    );
  }

  const setField = <K extends keyof EventForm>(key: K, value: EventForm[K]) => {
    setForm((current) => current ? { ...current, [key]: value } : current);
    setMessage('');
    setError('');
  };

  return (
    <AdminLayout title="Modificar evento">
      <div className="max-w-4xl space-y-5">
        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-magenta-500/15 text-magenta-300 flex items-center justify-center">
              <CalendarCog size={19} />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Dados do evento selecionado</h2>
              <p className="text-xs text-white/35">Edite um único evento por vez usando o seletor do topo.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome" value={form.name} onChange={(event) => setField('name', event.target.value)} />
            <Input label="Identificador" value={form.slug} onChange={(event) => setField('slug', event.target.value)} />
            <Input label="Data" type="date" value={form.event_date} onChange={(event) => setField('event_date', event.target.value)} />
            <Input label="Horário" value={form.event_time} onChange={(event) => setField('event_time', event.target.value)} placeholder="21h00 — 03h30" />
            <Input label="Local" value={form.location} onChange={(event) => setField('location', event.target.value)} />
            <Input label="Capacidade" type="number" value={form.capacity} onChange={(event) => setField('capacity', event.target.value)} />
            <Input label="Público esperado" type="number" value={form.expected_audience} onChange={(event) => setField('expected_audience', event.target.value)} />
            <label className="block">
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium mb-1.5 block">Status</span>
              <select value={form.status} onChange={(event) => setField('status', event.target.value as EventStatus)} className="w-full input-premium rounded-xl px-4 py-3 text-sm text-white outline-none">
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>

          <div className="space-y-4 mt-4">
            <Input label="Descrição" value={form.description} onChange={(event) => setField('description', event.target.value)} />
            <Input label="Imagem principal (URL)" value={form.banner_url} onChange={(event) => setField('banner_url', event.target.value)} />
            <Input label="Mensagem — em breve" value={form.coming_soon_message} onChange={(event) => setField('coming_soon_message', event.target.value)} />
            <Input label="Alerta — últimos ingressos" value={form.last_tickets_alert} onChange={(event) => setField('last_tickets_alert', event.target.value)} />
          </div>
        </div>

        {(message || error) && <p className={`text-sm ${error ? 'text-red-400' : 'text-emerald-400'}`}>{error || message}</p>}
        <Button onClick={() => updateEvent.mutate(form)} loading={updateEvent.isPending} className="w-full sm:w-auto">
          <Save size={15} /> Salvar alterações
        </Button>
      </div>
    </AdminLayout>
  );
}

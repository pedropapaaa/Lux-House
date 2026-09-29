import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus, Archive, AlertCircle, Plus, Trash2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { useEventContext } from '../../context/EventContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { logAudit } from '../../hooks/useAuditLog';
import type { EventStatus } from '../../types';

const statusOptions: { value: EventStatus; label: string }[] = [
  { value: 'coming_soon', label: 'Em breve' },
  { value: 'sales_open', label: 'Vendas abertas' },
  { value: 'last_tickets', label: 'Últimos ingressos' },
  { value: 'live', label: 'Acontecendo' },
  { value: 'ended', label: 'Encerrado' },
  { value: 'cancelled', label: 'Cancelado' },
];

interface LotDraft {
  name: string;
  price: string;
  quantity: string;
}

interface NewEventForm {
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
  logo_url: string;
  coming_soon_message: string;
  photos: string;
}

const emptyForm: NewEventForm = {
  name: '',
  slug: '',
  description: '',
  event_date: '',
  event_time: '',
  location: '',
  capacity: '',
  expected_audience: '',
  status: 'coming_soon',
  banner_url: '',
  logo_url: '',
  coming_soon_message: '',
  photos: '',
};

function Field({ label, value, onChange, multiline = false, placeholder = '', type = 'text' }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium mb-1.5 block">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full input-premium rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-y"
        />
      ) : (
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}

export default function NewEventPage() {
  const { loading, isAdmin } = useAdminGuard();
  const { events, selectEvent } = useEventContext();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState<NewEventForm>(emptyForm);
  const [lots, setLots] = useState<LotDraft[]>([{ name: 'Lote 1', price: '', quantity: '' }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState('');

  const activeEvents = events.filter((e) => !e.is_archived);

  const setField = (key: keyof NewEventForm, value: string) => {
    setForm((cur) => ({ ...cur, [key]: value }));
    setError('');
    setSuccess('');
  };

  const updateLot = (index: number, key: keyof LotDraft, value: string) => {
    setLots((items) => items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const addLot = () => setLots((items) => [...items, { name: `Lote ${items.length + 1}`, price: '', quantity: '' }]);
  const removeLot = (index: number) => setLots((items) => items.filter((_, i) => i !== index));

  const createEvent = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error('Informe o nome do evento.');
      if (!form.slug.trim()) throw new Error('Informe um identificador (slug) para o evento.');

      const slug = form.slug.trim().toLowerCase().replace(/\s+/g, '-');
      const photos = form.photos.split('\n').map((url) => url.trim()).filter(Boolean);

      const { data: newEvent, error: insertError } = await supabase
        .from('events')
        .insert({
          name: form.name.trim(),
          slug,
          description: form.description.trim() || null,
          event_date: form.event_date || null,
          event_time: form.event_time.trim() || null,
          location: form.location.trim() || null,
          capacity: form.capacity ? Number(form.capacity) : null,
          expected_audience: form.expected_audience ? Number(form.expected_audience) : null,
          status: form.status,
          banner_url: form.banner_url.trim() || null,
          logo_url: form.logo_url.trim() || null,
          coming_soon_message: form.coming_soon_message.trim() || null,
          photos,
          is_archived: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      for (const [index, lot] of lots.entries()) {
        if (!lot.name.trim()) continue;
        const price = parseFloat(lot.price.replace(',', '.'));
        const qty = parseInt(lot.quantity, 10);
        if (isNaN(price) || price < 0) throw new Error(`Preço inválido no lote ${index + 1}.`);
        if (isNaN(qty) || qty <= 0) throw new Error(`Quantidade inválida no lote ${index + 1}.`);

        const { error: lotError } = await supabase.from('lots').insert({
          event_id: newEvent.id,
          name: lot.name.trim(),
          price,
          total_quantity: qty,
          sold_quantity: 0,
          status: index === 0 ? 'active' : 'closed',
          sort_order: index,
        });
        if (lotError) throw lotError;
      }

      await logAudit({ action: 'event_create', entity_type: 'event', entity_id: newEvent.id, new_values: { name: form.name, slug } });
      return newEvent;
    },
    onSuccess: (newEvent) => {
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries();
      selectEvent(newEvent.id);
      setSuccess(`Evento "${newEvent.name}" criado com sucesso!`);
      setForm(emptyForm);
      setLots([{ name: 'Lote 1', price: '', quantity: '' }]);
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    },
    onError: (err: Error) => {
      setError(err.message || 'Não foi possível criar o evento.');
      setSuccess('');
    },
  });

  const handleArchiveCurrent = async () => {
    const current = events.find((e) => !e.is_archived);
    if (!current) return;
    setArchiving(true);
    setArchiveError('');
    try {
      const { error: updateError } = await supabase
        .from('events')
        .update({ is_archived: true, status: 'ended' })
        .eq('id', current.id);
      if (updateError) throw updateError;
      await logAudit({ action: 'event_archive', entity_type: 'event', entity_id: current.id, old_values: { name: current.name } });
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries();
      setArchiveConfirm(false);
      setArchiving(false);
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : 'Erro ao arquivar evento.');
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size={48} />
      </div>
    );
  }

  return (
    <AdminLayout title="Novo Evento">
      <div className="max-w-5xl space-y-5">
        {/* Archive current event banner */}
        {activeEvents.length > 0 && (
          <div className="glass-card rounded-2xl p-5 sm:p-6 border border-amber-500/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center shrink-0">
                <Archive size={19} />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-medium text-white mb-1">Evento ativo atual</h2>
                <p className="text-xs text-white/40 mb-3">
                  Você tem o evento <span className="text-amber-300 font-medium">{activeEvents[0].name}</span> ativo agora.
                  Ao criar um novo evento, o atual será automaticamente arquivado com todos os dados preservados (ingressos,
                  participantes, faturamento) para consulta futura na aba "Eventos Arquivados".
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setArchiveConfirm(true)}
                  disabled={archiving}
                >
                  <Archive size={14} /> Arquivar evento atual
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Event details form */}
        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-magenta-500/15 text-magenta-300 flex items-center justify-center">
              <CalendarPlus size={19} />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Dados do novo evento</h2>
              <p className="text-xs text-white/35">Preencha as informações principais do evento.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome do evento" value={form.name} onChange={(v) => setField('name', v)} placeholder="Ex: Lux Sunset 2026" />
            <Field label="Identificador (slug)" value={form.slug} onChange={(v) => setField('slug', v)} placeholder="ex: lux-sunset-2026" />
            <Field label="Data" value={form.event_date} onChange={(v) => setField('event_date', v)} type="date" />
            <Field label="Horário" value={form.event_time} onChange={(v) => setField('event_time', v)} placeholder="Ex: 22h00" />
            <Field label="Local" value={form.location} onChange={(v) => setField('location', v)} placeholder="Ex: Vinhedo - SP" />
            <Field label="Capacidade" value={form.capacity} onChange={(v) => setField('capacity', v)} type="number" placeholder="Ex: 500" />
            <Field label="Público esperado" value={form.expected_audience} onChange={(v) => setField('expected_audience', v)} type="number" placeholder="Ex: 400" />
            <label>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium mb-1.5 block">Status inicial</span>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className="w-full input-premium rounded-xl px-4 py-3 text-sm text-white outline-none"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 mt-4">
            <Field label="Descrição" value={form.description} onChange={(v) => setField('description', v)} multiline placeholder="Descrição do evento..." />
            <Field label="Banner (URL)" value={form.banner_url} onChange={(v) => setField('banner_url', v)} placeholder="URL da imagem do banner" />
            <Field label="Logo (URL opcional)" value={form.logo_url} onChange={(v) => setField('logo_url', v)} placeholder="URL do logo" />
            <Field label={'Mensagem "Em breve"'} value={form.coming_soon_message} onChange={(v) => setField('coming_soon_message', v)} multiline />
            <Field label="Fotos das atrações (uma URL por linha)" value={form.photos} onChange={(v) => setField('photos', v)} multiline />
          </div>
        </div>

        {/* Lots section */}
        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-medium text-white">Lotes de ingressos</h2>
              <p className="text-xs text-white/35">Defina os lotes iniciais. O primeiro lote será criado como ativo.</p>
            </div>
            <Button variant="outline" size="sm" onClick={addLot}>
              <Plus size={14} /> Adicionar lote
            </Button>
          </div>

          <div className="space-y-3">
            {lots.map((lot, index) => (
              <div key={index} className="grid sm:grid-cols-[1fr_120px_120px_auto] gap-3 items-end">
                <Field label={`Lote ${index + 1}`} value={lot.name} onChange={(v) => updateLot(index, 'name', v)} placeholder="Nome do lote" />
                <Field label="Preço (R$)" value={lot.price} onChange={(v) => updateLot(index, 'price', v)} placeholder="Ex: 65,00" />
                <Field label="Quantidade" value={lot.quantity} onChange={(v) => updateLot(index, 'quantity', v)} type="number" placeholder="Ex: 100" />
                {lots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLot(index)}
                    className="h-11 px-3 rounded-xl border border-red-500/20 text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        {(error || success) && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            error ? 'bg-red-500/10 border-red-500/25' : 'bg-emerald-500/10 border-emerald-500/25'
          }`}>
            <AlertCircle size={16} className={`shrink-0 mt-0.5 ${error ? 'text-red-400' : 'text-emerald-400'}`} />
            <p className={`text-sm ${error ? 'text-red-400' : 'text-emerald-400'}`}>{error || success}</p>
          </div>
        )}

        <Button onClick={() => createEvent.mutate()} loading={createEvent.isPending} className="w-full sm:w-auto">
          <CalendarPlus size={15} /> Criar evento
        </Button>
      </div>

      {/* Archive confirmation modal */}
      <Modal
        open={archiveConfirm}
        onClose={() => !archiving && setArchiveConfirm(false)}
        title="Arquivar evento atual"
        maxWidth="md"
      >
        <div className="p-6 space-y-5">
          {activeEvents[0] && (
            <p className="text-sm text-white/60">
              Tem certeza que deseja arquivar o evento <span className="text-white font-medium">{activeEvents[0].name}</span>?
              Todos os dados serão preservados e ficarão acessíveis na aba "Eventos Arquivados".
              Esta ação não pode ser desfeita.
            </p>
          )}
          {archiveError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{archiveError}</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setArchiveConfirm(false)} className="flex-1" disabled={archiving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleArchiveCurrent} loading={archiving} className="flex-1">
              <Archive size={15} /> Arquivar
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

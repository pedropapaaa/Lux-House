import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClock, Clock, Plus, Trash2, Edit3, ChevronUp, ChevronDown,
  Radio, Megaphone, Image as ImageIcon, Save, X, AlertTriangle,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { useUpdateEvent } from '../../hooks/useEvents';
import {
  useEventSchedule, useCreateScheduleItem, useUpdateScheduleItem, useDeleteScheduleItem, useReorderSchedule,
} from '../../hooks/useEventSchedule';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';
import type { Event, EventStatus, EventLiveInfo, EventEndedInfo } from '../../types';

const STATUSES: { value: EventStatus; label: string; color: string }[] = [
  { value: 'coming_soon', label: 'Em breve', color: 'blue' },
  { value: 'sales_open', label: 'Vendas abertas', color: 'green' },
  { value: 'last_tickets', label: 'Últimos ingressos', color: 'yellow' },
  { value: 'live', label: 'Acontecendo', color: 'red' },
  { value: 'ended', label: 'Encerrado', color: 'gray' },
];

const statusColor: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  blue: 'blue', green: 'green', yellow: 'yellow', red: 'red', gray: 'gray',
};

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-purple-400" />
        <h4 className="text-sm font-medium text-white/80">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function PlanningModal({ open, onClose, event }: { open: boolean; onClose: () => void; event: Event | null }) {
  const { selectedEventId } = useEventContext();
  const updateMut = useUpdateEvent();
  const { data: schedule = [], isLoading: scheduleLoading } = useEventSchedule(event?.id ?? '');
  const createScheduleMut = useCreateScheduleItem(event?.id ?? '');
  const updateScheduleMut = useUpdateScheduleItem(event?.id ?? '');
  const deleteScheduleMut = useDeleteScheduleItem(event?.id ?? '');
  const reorderMut = useReorderSchedule(event?.id ?? '');

  const [activeTab, setActiveTab] = useState<'status' | 'content' | 'schedule' | 'automation'>('status');
  const [saveError, setSaveError] = useState('');

  // Content form state
  const [content, setContent] = useState({
    name: '', description: '', event_date: '', event_time: '', location: '',
    banner_url: '', coming_soon_message: '', last_tickets_alert: '',
    live_current: '', live_next: '', live_notices: '',
    ended_message: '', ended_next_name: '', ended_next_date: '',
    photos: '',
  });

  // Schedule form
  const [newSlot, setNewSlot] = useState({ time_label: '', title: '', description: '' });
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editSlot, setEditSlot] = useState({ time_label: '', title: '', description: '' });

  // Automation form
  const [autoAt, setAutoAt] = useState('');
  const [autoTo, setAutoTo] = useState<EventStatus>('sales_open');

  // Sync content form when event changes
  const lastSynced = useState<string | null>(null);
  if (event && open && lastSynced[0] !== event.id) {
    lastSynced[1](event.id);
    const live = (event.live_info ?? {}) as EventLiveInfo;
    const ended = (event.ended_info ?? {}) as EventEndedInfo;
    setContent({
      name: event.name,
      description: event.description ?? '',
      event_date: event.event_date ?? '',
      event_time: event.event_time ?? '',
      location: event.location ?? '',
      banner_url: event.banner_url ?? '',
      coming_soon_message: event.coming_soon_message ?? '',
      last_tickets_alert: event.last_tickets_alert ?? '',
      live_current: live.current_attraction ?? '',
      live_next: live.next_attraction ?? '',
      live_notices: live.notices ?? '',
      ended_message: ended.final_message ?? '',
      ended_next_name: ended.next_event_name ?? '',
      ended_next_date: ended.next_event_date ?? '',
      photos: (event.photos ?? []).join('\n'),
    });
    setAutoAt(event.auto_transition_at ? new Date(event.auto_transition_at).toISOString().slice(0, 16) : '');
    setAutoTo(event.auto_transition_to ?? 'sales_open');
  }

  if (!event) return null;

  const handleStatusChange = (status: EventStatus) => {
    updateMut.mutate(
      { id: event.id, status },
      { onError: (err) => setSaveError(err instanceof Error ? err.message : 'Erro ao alterar status.') },
    );
  };

  const handleSaveContent = () => {
    const photos = content.photos.split('\n').map((p) => p.trim()).filter(Boolean);
    updateMut.mutate(
      {
        id: event.id,
        name: content.name,
        description: content.description || null,
        event_date: content.event_date || null,
        event_time: content.event_time || null,
        location: content.location || null,
        banner_url: content.banner_url || null,
        coming_soon_message: content.coming_soon_message || null,
        last_tickets_alert: content.last_tickets_alert || null,
        live_info: {
          current_attraction: content.live_current || undefined,
          next_attraction: content.live_next || undefined,
          notices: content.live_notices || undefined,
        },
        ended_info: {
          final_message: content.ended_message || undefined,
          next_event_name: content.ended_next_name || undefined,
          next_event_date: content.ended_next_date || undefined,
        },
        photos,
      },
      {
        onSuccess: () => setSaveError(''),
        onError: (err) => setSaveError(err instanceof Error ? err.message : 'Erro ao salvar conteúdo.'),
      },
    );
  };

  const handleAddSlot = () => {
    if (!newSlot.time_label.trim() || !newSlot.title.trim()) return;
    createScheduleMut.mutate(
      { time_label: newSlot.time_label.trim(), title: newSlot.title.trim(), description: newSlot.description.trim() || undefined, sort_order: schedule.length },
      {
        onSuccess: () => setNewSlot({ time_label: '', title: '', description: '' }),
        onError: (err) => setSaveError(err instanceof Error ? err.message : 'Erro ao adicionar horário.'),
      },
    );
  };

  const handleSaveSlot = (id: string) => {
    updateScheduleMut.mutate(
      { id, time_label: editSlot.time_label.trim(), title: editSlot.title.trim(), description: editSlot.description.trim() || null },
      { onSuccess: () => setEditingSlot(null) },
    );
  };

  const handleReorder = (index: number, dir: 'up' | 'down') => {
    const swapWith = dir === 'up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= schedule.length) return;
    const reordered = [...schedule];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    reorderMut.mutate(reordered.map((s, i) => ({ id: s.id, sort_order: i })));
  };

  const handleSaveAutomation = () => {
    updateMut.mutate(
      {
        id: event.id,
        auto_transition_at: autoAt ? new Date(autoAt).toISOString() : null,
        auto_transition_to: autoAt ? autoTo : null,
      },
      { onError: (err) => setSaveError(err instanceof Error ? err.message : 'Erro ao salvar automação.') },
    );
  };

  const tabs = [
    { id: 'status' as const, label: 'Estado', icon: Radio },
    { id: 'content' as const, label: 'Conteúdo', icon: ImageIcon },
    { id: 'schedule' as const, label: 'Horários', icon: Clock },
    { id: 'automation' as const, label: 'Automação', icon: CalendarClock },
  ];

  return (
    <Modal open={open} onClose={onClose} title={`Planejamento — ${event.name}`} maxWidth="2xl">
      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/5 pb-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                  : 'text-white/40 hover:text-white/70 border border-transparent'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {saveError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{saveError}</p>
            <button onClick={() => setSaveError('')} className="ml-auto text-white/30 hover:text-white/60"><X size={12} /></button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STATUS TAB */}
          {activeTab === 'status' && (
            <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-sm text-white/40">Selecione o estado atual do evento. O site público se adapta automaticamente.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleStatusChange(s.value)}
                    disabled={updateMut.isPending}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 disabled:opacity-50 ${
                      event.status === s.value
                        ? 'bg-purple-500/10 border-purple-500/40'
                        : 'bg-dark-800/40 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <span className="text-sm text-white/80">{s.label}</span>
                    {event.status === s.value && <Badge variant={statusColor[s.color]}>Ativo</Badge>}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <SectionCard icon={ImageIcon} title="Informações principais">
                <div className="space-y-3">
                  <Input label="Nome do evento" value={content.name} onChange={(e) => setContent({ ...content, name: e.target.value })} />
                  <Input label="Descrição" value={content.description} onChange={(e) => setContent({ ...content, description: e.target.value })} />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input label="Data" type="date" value={content.event_date} onChange={(e) => setContent({ ...content, event_date: e.target.value })} />
                    <Input label="Horário" value={content.event_time} onChange={(e) => setContent({ ...content, event_time: e.target.value })} placeholder="21h00" />
                  </div>
                  <Input label="Local" value={content.location} onChange={(e) => setContent({ ...content, location: e.target.value })} />
                  <Input label="Banner (URL)" value={content.banner_url} onChange={(e) => setContent({ ...content, banner_url: e.target.value })} placeholder="https://..." />
                  <div>
                    <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium mb-1.5 block">Fotos (uma URL por linha)</label>
                    <textarea
                      value={content.photos}
                      onChange={(e) => setContent({ ...content, photos: e.target.value })}
                      rows={3}
                      className="w-full input-premium rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                      placeholder="https://...&#10;https://..."
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={Megaphone} title="Mensagens por estado">
                <div className="space-y-3">
                  <Input label="Mensagem — Em breve" value={content.coming_soon_message} onChange={(e) => setContent({ ...content, coming_soon_message: e.target.value })} placeholder="Ingressos em breve" />
                  <Input label="Alerta — Últimos ingressos" value={content.last_tickets_alert} onChange={(e) => setContent({ ...content, last_tickets_alert: e.target.value })} placeholder="Últimos ingressos disponíveis" />
                </div>
              </SectionCard>

              <SectionCard icon={Radio} title="Informações em tempo real (ao vivo)">
                <div className="space-y-3">
                  <Input label="Atração atual" value={content.live_current} onChange={(e) => setContent({ ...content, live_current: e.target.value })} placeholder="DJ principal" />
                  <Input label="Próxima atração" value={content.live_next} onChange={(e) => setContent({ ...content, live_next: e.target.value })} placeholder="Show ao vivo" />
                  <Input label="Avisos" value={content.live_notices} onChange={(e) => setContent({ ...content, live_notices: e.target.value })} placeholder="Bar aberto até 03h" />
                </div>
              </SectionCard>

              <SectionCard icon={CalendarClock} title="Informações de encerramento">
                <div className="space-y-3">
                  <Input label="Mensagem final" value={content.ended_message} onChange={(e) => setContent({ ...content, ended_message: e.target.value })} placeholder="Obrigado a todos!" />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input label="Próximo evento" value={content.ended_next_name} onChange={(e) => setContent({ ...content, ended_next_name: e.target.value })} placeholder="Festival Lux 2027" />
                    <Input label="Data do próximo evento" value={content.ended_next_date} onChange={(e) => setContent({ ...content, ended_next_date: e.target.value })} placeholder="20/12/2026" />
                  </div>
                </div>
              </SectionCard>

              <Button onClick={handleSaveContent} loading={updateMut.isPending} className="w-full">
                <Save size={14} /> Salvar conteúdo
              </Button>
            </motion.div>
          )}

          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <SectionCard icon={Plus} title="Adicionar horário">
                <div className="grid sm:grid-cols-[120px_1fr_1fr_auto] gap-3 items-end">
                  <Input label="Horário" value={newSlot.time_label} onChange={(e) => setNewSlot({ ...newSlot, time_label: e.target.value })} placeholder="21:00" />
                  <Input label="Título" value={newSlot.title} onChange={(e) => setNewSlot({ ...newSlot, title: e.target.value })} placeholder="Abertura dos portões" />
                  <Input label="Descrição" value={newSlot.description} onChange={(e) => setNewSlot({ ...newSlot, description: e.target.value })} placeholder="Opcional" />
                  <Button onClick={handleAddSlot} loading={createScheduleMut.isPending} size="sm"><Plus size={14} /></Button>
                </div>
              </SectionCard>

              <SectionCard icon={Clock} title="Programação">
                {scheduleLoading ? (
                  <div className="flex justify-center py-8"><Spinner size={24} /></div>
                ) : schedule.length === 0 ? (
                  <p className="text-sm text-white/30 text-center py-8">Nenhum horário cadastrado. Adicione o primeiro acima.</p>
                ) : (
                  <div className="space-y-2">
                    {schedule.map((slot, i) => (
                      <div key={slot.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/40 border border-white/5">
                        {editingSlot === slot.id ? (
                          <>
                            <input value={editSlot.time_label} onChange={(e) => setEditSlot({ ...editSlot, time_label: e.target.value })} className="w-20 input-premium rounded-lg px-2 py-2 text-sm text-white outline-none" />
                            <input value={editSlot.title} onChange={(e) => setEditSlot({ ...editSlot, title: e.target.value })} className="flex-1 input-premium rounded-lg px-3 py-2 text-sm text-white outline-none" />
                            <input value={editSlot.description} onChange={(e) => setEditSlot({ ...editSlot, description: e.target.value })} className="flex-1 input-premium rounded-lg px-3 py-2 text-sm text-white outline-none" placeholder="Opcional" />
                            <button onClick={() => handleSaveSlot(slot.id)} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"><Save size={14} /></button>
                            <button onClick={() => setEditingSlot(null)} className="p-2 text-white/30 hover:bg-white/5 rounded-lg transition-colors"><X size={14} /></button>
                          </>
                        ) : (
                          <>
                            <span className="font-mono text-sm text-purple-400 w-20 shrink-0">{slot.time_label}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white/80">{slot.title}</div>
                              {slot.description && <div className="text-xs text-white/30">{slot.description}</div>}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => handleReorder(i, 'up')} disabled={i === 0} className="p-1.5 text-white/30 hover:text-white/70 disabled:opacity-20 transition-colors"><ChevronUp size={14} /></button>
                              <button onClick={() => handleReorder(i, 'down')} disabled={i === schedule.length - 1} className="p-1.5 text-white/30 hover:text-white/70 disabled:opacity-20 transition-colors"><ChevronDown size={14} /></button>
                              <button onClick={() => { setEditingSlot(slot.id); setEditSlot({ time_label: slot.time_label, title: slot.title, description: slot.description ?? '' }); }} className="p-1.5 text-white/30 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"><Edit3 size={14} /></button>
                              <button onClick={() => deleteScheduleMut.mutate(slot.id)} className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </motion.div>
          )}

          {/* AUTOMATION TAB */}
          {activeTab === 'automation' && (
            <motion.div key="automation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <SectionCard icon={CalendarClock} title="Alteração automática de estado">
                <p className="text-sm text-white/40 mb-4">Defina uma data e horário para mudar o estado do evento automaticamente. Deixe em branco para desativar.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input label="Data e horário" type="datetime-local" value={autoAt} onChange={(e) => setAutoAt(e.target.value)} />
                  <div>
                    <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium mb-1.5 block">Mudar para</label>
                    <select
                      value={autoTo}
                      onChange={(e) => setAutoTo(e.target.value as EventStatus)}
                      className="w-full input-premium rounded-xl px-4 py-3.5 text-sm text-white outline-none cursor-pointer"
                    >
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <Button onClick={handleSaveAutomation} loading={updateMut.isPending} className="w-full mt-4">
                  <Save size={14} /> Salvar automação
                </Button>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

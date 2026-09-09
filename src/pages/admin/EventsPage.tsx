import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, Plus, Edit3, Copy, Archive, Search,
  MapPin, Users, RotateCcw, CalendarClock,
} from 'lucide-react';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { useEventContext } from '../../context/EventContext';
import { useCreateEvent, useUpdateEvent, useArchiveEvent, useUnarchiveEvent, useDuplicateEvent } from '../../hooks/useEvents';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import PlanningModal from '../../components/admin/PlanningModal';
import type { Event, EventStatus } from '../../types';

const statusLabels: Record<EventStatus, string> = {
  coming_soon: 'Em breve',
  sales_open: 'Vendas abertas',
  last_tickets: 'Últimos ingressos',
  live: 'Acontecendo',
  ended: 'Encerrado',
  cancelled: 'Cancelado',
};

const statusVariants: Record<EventStatus, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  coming_soon: 'blue',
  sales_open: 'green',
  last_tickets: 'yellow',
  live: 'red',
  ended: 'gray',
  cancelled: 'red',
};

export default function EventsPage() {
  const { loading } = useAdminGuard();
  const { events, selectEvent, selectedEventId } = useEventContext();
  const createMut = useCreateEvent();
  const updateMut = useUpdateEvent();
  const archiveMut = useArchiveEvent();
  const unarchiveMut = useUnarchiveEvent();
  const duplicateMut = useDuplicateEvent();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<Event | null>(null);
  const [planningEvent, setPlanningEvent] = useState<Event | null>(null);

  const [form, setForm] = useState({
    name: '', slug: '', description: '', event_date: '',
    event_time: '', location: '', capacity: '', expected_audience: '',
    status: 'coming_soon' as EventStatus,
  });
  const [formError, setFormError] = useState('');

  const years = useMemo(() => {
    const ys = new Set<string>();
    events.forEach((e) => {
      if (e.event_date) ys.add(new Date(e.event_date).getFullYear().toString());
    });
    return Array.from(ys).sort((a, b) => b.localeCompare(a));
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.location?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      const matchYear = yearFilter === 'all' || (e.event_date && new Date(e.event_date).getFullYear().toString() === yearFilter);
      const matchArchived = showArchived ? e.is_archived : !e.is_archived;
      return matchSearch && matchStatus && matchYear && matchArchived;
    });
  }, [events, search, statusFilter, yearFilter, showArchived]);

  const handleCreate = () => {
    if (!form.name.trim() || !form.slug.trim()) {
      setFormError('Nome e slug são obrigatórios.');
      return;
    }
    createMut.mutate(
      {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: form.description.trim() || undefined,
        event_date: form.event_date || undefined,
        event_time: form.event_time.trim() || undefined,
        location: form.location.trim() || undefined,
        capacity: form.capacity ? parseInt(form.capacity, 10) : undefined,
        expected_audience: form.expected_audience ? parseInt(form.expected_audience, 10) : undefined,
        status: form.status,
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setForm({ name: '', slug: '', description: '', event_date: '', event_time: '', location: '', capacity: '', expected_audience: '', status: 'coming_soon' });
          setFormError('');
        },
        onError: (err) => setFormError(err instanceof Error ? err.message : 'Erro ao criar evento.'),
      }
    );
  };

  const handleEdit = (event: Event) => {
    setEditEvent(event);
    setForm({
      name: event.name,
      slug: event.slug,
      description: event.description ?? '',
      event_date: event.event_date ?? '',
      event_time: event.event_time ?? '',
      location: event.location ?? '',
      capacity: event.capacity?.toString() ?? '',
      expected_audience: event.expected_audience?.toString() ?? '',
      status: event.status,
    });
    setFormError('');
  };

  const handleSaveEdit = () => {
    if (!editEvent) return;
    updateMut.mutate(
      {
        id: editEvent.id,
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: form.description.trim() || null,
        event_date: form.event_date || null,
        event_time: form.event_time.trim() || null,
        location: form.location.trim() || null,
        capacity: form.capacity ? parseInt(form.capacity, 10) : null,
        expected_audience: form.expected_audience ? parseInt(form.expected_audience, 10) : null,
        status: form.status,
      },
      {
        onSuccess: () => { setEditEvent(null); setFormError(''); },
        onError: (err) => setFormError(err instanceof Error ? err.message : 'Erro ao atualizar evento.'),
      }
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-dark-950 flex items-center justify-center"><Spinner size={48} /></div>;
  }

  const formModal = (isOpen: boolean, onClose: () => void, title: string, onSubmit: () => void, isPending: boolean) => (
    <Modal open={isOpen} onClose={() => { onClose(); setFormError(''); }} title={title} maxWidth="xl">
      <div className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Nome *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Festival Lux 2026" />
          <Input label="Slug *" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="festival-lux-2026" />
        </div>
        <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição do evento" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Data" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
          <Input label="Horário" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} placeholder="21h00 — 03h30" />
        </div>
        <Input label="Local" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Vinhedo — São Paulo, SP" />
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Capacidade" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="500" />
          <Input label="Público Esperado" type="number" value={form.expected_audience} onChange={(e) => setForm({ ...form, expected_audience: e.target.value })} placeholder="450" />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })}>
            <option value="coming_soon">Em breve</option>
            <option value="sales_open">Vendas abertas</option>
            <option value="last_tickets">Últimos ingressos</option>
            <option value="live">Acontecendo</option>
            <option value="ended">Encerrado</option>
            <option value="cancelled">Cancelado</option>
          </Select>
        </div>
        {formError && <p className="text-sm text-red-400">{formError}</p>}
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => { onClose(); setFormError(''); }} className="flex-1">Cancelar</Button>
          <Button onClick={onSubmit} loading={isPending} className="flex-1">Salvar</Button>
        </div>
      </div>
    </Modal>
  );

  return (
    <AdminLayout title="Eventos">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-white/40">{filtered.length} evento{filtered.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => setCreateOpen(true)} size="sm"><Plus size={14} /> Novo Evento</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento..."
            className="w-full pl-10 pr-4 py-3 text-sm bg-dark-800 border border-white/10 rounded-xl text-white placeholder-white/25 outline-none focus:border-purple-500/40"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 text-sm bg-dark-800 border border-white/10 rounded-xl text-white/70 outline-none cursor-pointer">
          <option value="all">Todos status</option>
          <option value="coming_soon">Em breve</option>
          <option value="sales_open">Vendas abertas</option>
          <option value="last_tickets">Últimos ingressos</option>
          <option value="live">Acontecendo</option>
          <option value="ended">Encerrado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        {years.length > 0 && (
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="px-4 py-3 text-sm bg-dark-800 border border-white/10 rounded-xl text-white/70 outline-none cursor-pointer">
            <option value="all">Todos anos</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        <button
          onClick={() => setShowArchived((v) => !v)}
          className={`px-4 py-3 rounded-xl text-sm border transition-colors flex items-center gap-2 ${
            showArchived ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' : 'text-white/40 border-white/10 hover:text-white/70'
          }`}
        >
          <Archive size={14} /> {showArchived ? 'Arquivados' : 'Ativos'}
        </button>
      </div>

      {/* Event cards */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <CalendarDays size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Nenhum evento encontrado. Clique em "Novo Evento" para criar o primeiro.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card glass-card-hover rounded-2xl overflow-hidden cursor-pointer ${selectedEventId === event.id ? 'ring-1 ring-purple-500/40' : ''}`}
              onClick={() => selectEvent(event.id)}
            >
              {event.banner_url && (
                <div className="h-32 bg-dark-800 relative overflow-hidden">
                  <img src={event.banner_url} alt={event.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 to-transparent" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-playfair text-lg text-white/90 leading-tight">{event.name}</h3>
                  <Badge variant={statusVariants[event.status]}>{statusLabels[event.status]}</Badge>
                </div>
                {event.description && <p className="text-xs text-white/30 mb-3 line-clamp-2">{event.description}</p>}
                <div className="space-y-1.5 text-xs text-white/40">
                  {event.event_date && (
                    <div className="flex items-center gap-2">
                      <CalendarDays size={12} className="text-purple-400/60" />
                      {new Date(event.event_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-purple-400/60" /> {event.location}
                    </div>
                  )}
                  {event.capacity && (
                    <div className="flex items-center gap-2">
                      <Users size={12} className="text-purple-400/60" /> Capacidade: {event.capacity}
                    </div>
                  )}
                </div>
                {event.is_archived && <Badge variant="gray">Arquivado</Badge>}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                  <button onClick={(e) => { e.stopPropagation(); setPlanningEvent(event); }} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-pink-400 transition-colors px-3 py-1.5 rounded-lg border border-pink-500/20 hover:border-pink-500/40 bg-pink-500/5">
                    <CalendarClock size={12} /> Planejamento
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(event); }} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-purple-400 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-purple-500/30">
                    <Edit3 size={12} /> Editar
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); duplicateMut.mutate(event.id); }} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-cyan-400 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-cyan-500/30">
                    <Copy size={12} /> Duplicar
                  </button>
                  {event.is_archived ? (
                    <button onClick={(e) => { e.stopPropagation(); unarchiveMut.mutate(event.id); }} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-emerald-500/30 ml-auto">
                      <RotateCcw size={12} /> Restaurar
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); setConfirmArchive(event); }} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-amber-400 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-500/30 ml-auto">
                      <Archive size={12} /> Arquivar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {formModal(createOpen, () => setCreateOpen(false), 'Novo Evento', handleCreate, createMut.isPending)}
      {formModal(!!editEvent, () => setEditEvent(null), 'Editar Evento', handleSaveEdit, updateMut.isPending)}

      <PlanningModal open={!!planningEvent} onClose={() => setPlanningEvent(null)} event={planningEvent} />

      <Modal open={!!confirmArchive} onClose={() => setConfirmArchive(null)} title="Arquivar Evento" maxWidth="sm">
        <div className="p-6 space-y-4">
          <p className="text-sm text-white/50">
            Arquivar "{confirmArchive?.name}"? O evento permanecerá disponível para consultas e análises da IA, mas não aparecerá na lista de ativos.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setConfirmArchive(null)} className="flex-1">Cancelar</Button>
            <Button variant="danger" loading={archiveMut.isPending} onClick={() => { if (confirmArchive) { archiveMut.mutate(confirmArchive.id, { onSuccess: () => setConfirmArchive(null) }); } }} className="flex-1">Arquivar</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

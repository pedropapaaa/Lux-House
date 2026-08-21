import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, Check, Search } from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import type { EventStatus } from '../../types';

const statusLabels: Record<EventStatus, string> = {
  coming_soon: 'Em breve',
  sales_open: 'Vendas abertas',
  last_tickets: 'Últimos ingressos',
  live: 'Acontecendo',
  ended: 'Encerrado',
  cancelled: 'Cancelado',
};

const statusColors: Record<EventStatus, string> = {
  coming_soon: 'text-cyan-400',
  sales_open: 'text-emerald-400',
  last_tickets: 'text-amber-400',
  live: 'text-red-400',
  ended: 'text-white/40',
  cancelled: 'text-red-400',
};

export function EventSelector() {
  const { events, selectedEvent, selectEvent, isLoadingEvents } = useEventContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  );

  const activeEvents = filtered.filter((e) => !e.is_archived);
  const archivedEvents = filtered.filter((e) => e.is_archived);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors min-w-0"
      >
        <Calendar size={16} className="text-purple-400 shrink-0" />
        <div className="text-left min-w-0">
          <div className="text-[9px] tracking-widest text-white/30 uppercase">Evento</div>
          <div className="text-sm font-medium text-white/80 truncate max-w-40 sm:max-w-48">
            {isLoadingEvents ? 'Carregando...' : selectedEvent?.name ?? 'Selecionar...'}
          </div>
        </div>
        <ChevronDown size={14} className={`text-white/30 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => { setOpen(false); setSearch(''); }}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-80 glass-card rounded-xl overflow-hidden z-50 shadow-glass-lg"
            >
              <div className="p-3 border-b border-white/5">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar evento..."
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-dark-800 border border-white/10 rounded-lg text-white placeholder-white/25 outline-none focus:border-purple-500/40"
                  />
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {activeEvents.length > 0 && (
                  <div className="p-2">
                    <div className="text-[9px] tracking-widest text-white/20 uppercase px-2 py-1.5">Ativos</div>
                    {activeEvents.map((e) => (
                      <EventRow
                        key={e.id}
                        name={e.name}
                        status={e.status}
                        location={e.location}
                        isSelected={e.id === selectedEvent?.id}
                        onClick={() => { selectEvent(e.id); setOpen(false); setSearch(''); }}
                      />
                    ))}
                  </div>
                )}
                {archivedEvents.length > 0 && (
                  <div className="p-2 border-t border-white/5">
                    <div className="text-[9px] tracking-widest text-white/20 uppercase px-2 py-1.5">Arquivados</div>
                    {archivedEvents.map((e) => (
                      <EventRow
                        key={e.id}
                        name={e.name}
                        status={e.status}
                        location={e.location}
                        isSelected={e.id === selectedEvent?.id}
                        onClick={() => { selectEvent(e.id); setOpen(false); setSearch(''); }}
                      />
                    ))}
                  </div>
                )}
                {filtered.length === 0 && (
                  <div className="text-center py-8 text-white/25 text-sm">Nenhum evento encontrado.</div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventRow({ name, status, location, isSelected, onClick }: {
  name: string;
  status: EventStatus;
  location: string | null;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
        isSelected ? 'bg-purple-500/15' : 'hover:bg-white/5'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${isSelected ? 'text-purple-400' : 'text-white/80'}`}>{name}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] ${statusColors[status]}`}>{statusLabels[status]}</span>
          {location && <span className="text-[10px] text-white/25 truncate">· {location}</span>}
        </div>
      </div>
      {isSelected && <Check size={14} className="text-purple-400 shrink-0" />}
    </button>
  );
}

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck, Search, Check, Clock, MapPin,
  Users, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { useEventContext } from '../../context/EventContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

const PAGE_SIZE = 20;

export default function ParticipantsPage() {
  const { loading } = useAdminGuard();
  const { selectedEventId } = useEventContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');
  const [page, setPage] = useState(1);

  const { data: participants = [], isLoading } = useQuery({
    queryKey: ['participants', selectedEventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id, code, buyer_name, buyer_email, lot_name, is_used, used_at, created_at,
          orders!inner ( buyer_last_name, buyer_city, total_amount, created_at, payment_status )
        `)
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const processed = useMemo(() => {
    return participants.map((t: any) => ({
      id: t.id,
      code: t.code,
      fullName: t.buyer_name?.trim() || t.orders?.buyer_last_name?.trim() || 'Participante',
      email: t.buyer_email,
      lot: t.lot_name,
      isUsed: t.is_used,
      usedAt: t.used_at,
      purchaseTime: t.orders?.created_at ?? t.created_at,
      city: t.orders?.buyer_city ?? null,
    }));
  }, [participants]);

  const filtered = useMemo(() => {
    return processed.filter((p) => {
      const matchSearch = !search || p.fullName.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || (filter === 'checked_in' && p.isUsed) || (filter === 'not_checked_in' && !p.isUsed);
      return matchSearch && matchFilter;
    });
  }, [processed, search, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCheckedIn = processed.filter((p) => p.isUsed).length;
  const totalNotCheckedIn = processed.length - totalCheckedIn;

  if (loading) {
    return <div className="min-h-screen bg-dark-950 flex items-center justify-center"><Spinner size={48} /></div>;
  }

  return (
    <AdminLayout title="Participantes">
      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={Users} label="Total" value={String(processed.length)} color="purple" />
        <StatCard icon={Check} label="Entraram" value={String(totalCheckedIn)} color="emerald" />
        <StatCard icon={Clock} label="Faltam entrar" value={String(totalNotCheckedIn)} color="amber" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar participante..."
            className="w-full pl-10 pr-4 py-3 text-sm bg-dark-800 border border-white/10 rounded-xl text-white placeholder-white/25 outline-none focus:border-purple-500/40"
          />
        </div>
        <div className="flex gap-2">
          {([
            { key: 'all', label: 'Todos' },
            { key: 'checked_in', label: 'Check-in feito' },
            { key: 'not_checked_in', label: 'Pendentes' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setFilter(tab.key); setPage(1); }}
              className={`px-4 py-3 rounded-xl text-xs transition-colors whitespace-nowrap ${
                filter === tab.key ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'text-white/40 border border-white/10 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <UserCheck size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Ainda não há participantes para este evento. A lista aparecerá quando começarem as vendas.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Participante', 'E-mail', 'Lote', 'Cidade', 'Compra', 'Check-in', 'Status'].map((h) => (
                    <th key={h} className="text-left text-[10px] tracking-widest text-white/25 uppercase px-5 py-4 font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.01 }}
                    className="border-b border-white/5 hover:bg-white/3"
                  >
                    <td className="px-5 py-4 text-white/80 font-medium whitespace-nowrap">{p.fullName}</td>
                    <td className="px-5 py-4 text-white/40 text-xs">{p.email}</td>
                    <td className="px-5 py-4 text-white/50 text-xs">{p.lot ?? '—'}</td>
                    <td className="px-5 py-4 text-white/40 text-xs">
                      {p.city ? <span className="flex items-center gap-1"><MapPin size={10} /> {p.city}</span> : '—'}
                    </td>
                    <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">
                      {p.purchaseTime ? new Date(p.purchaseTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">
                      {p.usedAt ? new Date(p.usedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      {p.isUsed ? <Badge variant="green"><Check size={10} className="mr-1" /> Presente</Badge> : <Badge variant="yellow"><Clock size={10} className="mr-1" /> Pendente</Badge>}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
              <div className="text-xs text-white/40">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-white/10 text-white/30 hover:text-white/70 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-white/50 px-3">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-white/10 text-white/30 hover:text-white/70 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-500/15 text-purple-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
      <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center mb-3`}>
        <Icon size={18} />
      </div>
      <div className="font-playfair text-2xl text-white">{value}</div>
      <div className="text-xs text-white/35 mt-1">{label}</div>
    </motion.div>
  );
}

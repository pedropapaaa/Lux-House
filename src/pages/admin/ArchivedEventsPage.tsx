import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Calendar, MapPin, ChevronDown, TicketIcon, DollarSign, Users, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { useEventContext } from '../../context/EventContext';
import type { Event, Lot, Order } from '../../types';

interface ArchivedEventStats {
  totalSold: number;
  totalRevenue: number;
  totalOrders: number;
  checkedIn: number;
}

function statusBadge(status: string) {
  const map: Record<string, React.ReactNode> = {
    ended: <Badge variant="gray">Encerrado</Badge>,
    cancelled: <Badge variant="red">Cancelado</Badge>,
    live: <Badge variant="red">Acontecendo</Badge>,
    sales_open: <Badge variant="green">Vendas abertas</Badge>,
    coming_soon: <Badge variant="blue">Em breve</Badge>,
    last_tickets: <Badge variant="yellow">Últimos ingressos</Badge>,
  };
  return map[status] ?? <Badge variant="gray">{status}</Badge>;
}

function StatRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-white/40" />
      </div>
      <span className="text-xs text-white/40 flex-1">{label}</span>
      <span className="text-sm text-white/80 font-medium">{value}</span>
    </div>
  );
}

export default function ArchivedEventsPage() {
  const { loading } = useAdminGuard();
  const { events, selectEvent } = useEventContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const archivedEvents = events.filter((e) => e.is_archived);

  const { data: expandedData, isLoading: expandedLoading } = useQuery<{
    lots: Lot[];
    stats: ArchivedEventStats;
  }>({
    queryKey: ['archived-event-detail', expandedId],
    enabled: !!expandedId,
    queryFn: async () => {
      const [{ data: lots }, { data: orders }, { count: checkedIn }] = await Promise.all([
        supabase.from('lots').select('*').eq('event_id', expandedId).order('sort_order'),
        supabase.from('orders').select('*, lots(*)').eq('event_id', expandedId),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('event_id', expandedId).eq('is_used', true),
      ]);

      const allOrders = orders ?? [];
      const approved = allOrders.filter((o: Order) => o.payment_status === 'approved');
      const totalSold = approved.reduce((s, o) => s + (o.quantity ?? 0), 0);
      const totalRevenue = approved.reduce((s, o) => s + Number(o.total_amount), 0);

      return {
        lots: lots ?? [],
        stats: {
          totalSold,
          totalRevenue,
          totalOrders: allOrders.length,
          checkedIn: checkedIn ?? 0,
        },
      };
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size={48} />
      </div>
    );
  }

  const fmtCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <AdminLayout title="Eventos Arquivados">
      <div className="max-w-4xl space-y-4">
        <div className="glass-card rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center">
              <Archive size={19} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Eventos arquivados</h2>
              <p className="text-xs text-white/35">
                Todos os eventos passados com seus dados preservados. Clique para ver detalhes.
              </p>
            </div>
          </div>
        </div>

        {archivedEvents.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <Archive size={34} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Nenhum evento arquivado ainda.</p>
            <p className="text-white/20 text-xs mt-1">
              Quando você arquivar um evento, ele aparecerá aqui com todas as informações.
            </p>
          </div>
        ) : (
          archivedEvents.map((event: Event, index: number) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-white/3 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-purple-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-sm font-semibold text-white truncate">{event.name}</h3>
                    {statusBadge(event.status)}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/35">
                    {event.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(event.event_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-white/30 transition-transform shrink-0 ${expandedId === event.id ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {expandedId === event.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-white/5"
                  >
                    {expandedLoading ? (
                      <div className="flex justify-center py-8">
                        <Spinner size={28} />
                      </div>
                    ) : expandedData ? (
                      <div className="p-5 space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="rounded-xl bg-white/5 p-3 text-center">
                            <TicketIcon size={16} className="text-purple-400 mx-auto mb-1.5" />
                            <div className="font-playfair text-lg text-white">{expandedData.stats.totalSold}</div>
                            <div className="text-[10px] text-white/30">Ingressos vendidos</div>
                          </div>
                          <div className="rounded-xl bg-white/5 p-3 text-center">
                            <DollarSign size={16} className="text-emerald-400 mx-auto mb-1.5" />
                            <div className="font-playfair text-lg text-white">{fmtCurrency(expandedData.stats.totalRevenue)}</div>
                            <div className="text-[10px] text-white/30">Receita total</div>
                          </div>
                          <div className="rounded-xl bg-white/5 p-3 text-center">
                            <Users size={16} className="text-pink-400 mx-auto mb-1.5" />
                            <div className="font-playfair text-lg text-white">{expandedData.stats.checkedIn}</div>
                            <div className="text-[10px] text-white/30">Check-ins</div>
                          </div>
                          <div className="rounded-xl bg-white/5 p-3 text-center">
                            <TicketIcon size={16} className="text-cyan-400 mx-auto mb-1.5" />
                            <div className="font-playfair text-lg text-white">{expandedData.stats.totalOrders}</div>
                            <div className="text-[10px] text-white/30">Pedidos</div>
                          </div>
                        </div>

                        {/* Lots breakdown */}
                        {expandedData.lots.length > 0 && (
                          <div className="rounded-xl bg-dark-800/40 border border-white/5 p-4">
                            <h4 className="text-xs text-white/50 font-medium mb-3">Lotes</h4>
                            <div className="space-y-1">
                              {expandedData.lots.map((lot) => (
                                <StatRow
                                  key={lot.id}
                                  icon={TicketIcon}
                                  label={lot.name}
                                  value={`${lot.sold_quantity}/${lot.total_quantity} — ${fmtCurrency(lot.price)}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Event info */}
                        {event.description && (
                          <div className="rounded-xl bg-dark-800/40 border border-white/5 p-4">
                            <h4 className="text-xs text-white/50 font-medium mb-2">Descrição</h4>
                            <p className="text-xs text-white/50 leading-relaxed">{event.description}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              selectEvent(event.id);
                              window.location.href = '/admin/dashboard';
                            }}
                            className="flex items-center gap-2 text-xs text-purple-400/80 hover:text-purple-400 transition-colors px-4 py-2 border border-purple-500/20 rounded-lg hover:border-purple-500/40"
                          >
                            <Eye size={14} /> Ver no dashboard
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}

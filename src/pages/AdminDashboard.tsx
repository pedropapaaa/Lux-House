import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TicketIcon, Clock, DollarSign,
  Search, Download, RefreshCw, X, ChevronDown,
  ScanLine, ArrowRight, ChevronLeft, ChevronRight,
  Settings, Edit3, AlertCircle, Check,
  TrendingUp, Users, CreditCard, BarChart3,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { useEventContext } from '../context/EventContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import { AdminLayout } from '../components/admin/AdminLayout';
import { BarChart, LineChart, DonutChart, ChartCard } from '../components/admin/Charts';
import CouponManager from '../components/admin/CouponManager';
import { logAudit } from '../hooks/useAuditLog';
import type { Lot, Order } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const PAGE_SIZE_MOBILE = 10;
const PAGE_SIZE_DESKTOP = 15;
function statusBadge(status: Order['payment_status']) {
  const map = {
    approved: <Badge variant="green">Aprovado</Badge>,
    pending: <Badge variant="yellow">Pendente</Badge>,
    rejected: <Badge variant="red">Recusado</Badge>,
    expired: <Badge variant="gray">Expirado</Badge>,
  };
  return map[status];
}

function StatCard({ icon: Icon, label, description, value, gradient, isMobile, delay }: {
  icon: React.ElementType; label: string; description?: string; value: string; gradient: string; isMobile: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={isMobile ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isMobile ? 0 : delay }}
      whileHover={isMobile ? undefined : { y: -2 }}
      className="glass-card glass-card-hover rounded-xl p-5 relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${gradient} opacity-10 rounded-full ${isMobile ? '' : 'blur-2xl'} -translate-y-1/2 translate-x-1/2`} />
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${gradient} bg-opacity-10 flex items-center justify-center border border-white/5`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <div className="font-playfair text-2xl sm:text-3xl text-white mb-1">{value}</div>
      <div className="text-xs text-white/35">{label}</div>
      {description && <div className="text-[10px] text-white/20 mt-1 leading-tight">{description}</div>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { loading, isAdmin } = useAdminGuard();
  const { selectedEventId } = useEventContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const isMobile = useIsMobile();
  const PAGE_SIZE = isMobile ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP;

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['admin-orders', selectedEventId],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, lots(*)')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: lots = [], isLoading: lotsLoading } = useQuery<Lot[]>({
    queryKey: ['admin-lots', selectedEventId],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lots')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 30,
  });

  const { data: ticketsData } = useQuery<{ count: number }>({
    queryKey: ['tickets-count', selectedEventId],
    enabled: isAdmin,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', selectedEventId)
        .eq('is_used', true);
      if (error) throw error;
      return { count: count ?? 0 };
    },
    staleTime: 1000 * 30,
  });

  const { data: totalTickets } = useQuery<{ count: number }>({
    queryKey: ['total-tickets-count', selectedEventId],
    enabled: isAdmin,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', selectedEventId);
      if (error) throw error;
      return { count: count ?? 0 };
    },
    staleTime: 1000 * 30,
  });

  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editError, setEditError] = useState('');
  const [lotManagementOpen, setLotManagementOpen] = useState(false);

  const updateLotMutation = useMutation({
    mutationFn: async ({ id, total_quantity }: { id: string; total_quantity: number }) => {
      const { error } = await supabase
        .from('lots')
        .update({ total_quantity })
        .eq('id', id);
      if (error) throw error;
      await logAudit({ action: 'lot_update', entity_type: 'lot', entity_id: id, new_values: { total_quantity } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-lots'] });
      qc.invalidateQueries({ queryKey: ['lots'] });
      setEditingLot(null);
      setEditError('');
    },
    onError: (err) => {
      setEditError(err instanceof Error ? err.message : 'Erro ao atualizar lote.');
    },
  });

  const setActiveLotMutation = useMutation({
    mutationFn: async (lotId: string) => {
      const updates = lots.map((l) => ({
        id: l.id,
        status: l.id === lotId ? 'active' : (l.status === 'active' ? 'closed' : l.status),
      }));
      for (const u of updates) {
        const { error } = await supabase.from('lots').update({ status: u.status }).eq('id', u.id);
        if (error) throw error;
      }
      await logAudit({ action: 'lot_activate', entity_type: 'lot', entity_id: lotId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-lots'] });
      qc.invalidateQueries({ queryKey: ['lots'] });
    },
  });

  const handleEditLot = (lot: Lot) => {
    setEditingLot(lot);
    setEditQuantity(String(lot.total_quantity));
    setEditError('');
  };

  const handleSaveLot = () => {
    if (!editingLot) return;
    const qty = parseInt(editQuantity, 10);
    if (isNaN(qty) || qty < editingLot.sold_quantity) {
      setEditError(`A quantidade nao pode ser menor que os ingressos ja vendidos (${editingLot.sold_quantity}).`);
      return;
    }
    updateLotMutation.mutate({ id: editingLot.id, total_quantity: qty });
  };

  const { data: settings } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const resendMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/resend-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) throw new Error('Falha ao reenviar ingresso.');
    },
  });

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState('');
  const [settingsError, setSettingsError] = useState('');

  const handleUpdateSettings = (patch: Partial<{ show_remaining_tickets: boolean; sales_enabled: boolean }>) => {
    setSettingsError('');
    updateSettingsMutation.mutate(patch, {
      onError: (err: Error) => {
        setSettingsError(err.message || 'Erro ao salvar a configuração.');
      },
    });
  };

  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      setCancellingId(orderId);
      setCancelError('');
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'rejected' })
        .eq('id', orderId);
      if (error) throw error;
      await logAudit({ action: 'order_cancel', entity_type: 'order', entity_id: orderId });
    },
    onSuccess: () => {
      setCancellingId(null);
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err: Error) => {
      setCancellingId(null);
      setCancelError(err.message || 'Erro ao cancelar pedido.');
    },
  });

  const exportCSV = () => {
    const headers = ['ID', 'Nome', 'Sobrenome', 'CPF', 'Telefone', 'Email', 'Lote', 'Valor', 'Status', 'Data'];
    const rows = orders.map((o) => [
      o.id, o.buyer_name, o.buyer_last_name, o.buyer_cpf, o.buyer_phone,
      o.buyer_email, (o.lots as any)?.name ?? '', o.total_amount,
      o.payment_status, new Date(o.created_at).toLocaleString('pt-BR'),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pedidos-luxhouse.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ============ METRICS ============
  const approved = orders.filter((o) => o.payment_status === 'approved');
  const pending = orders.filter((o) => o.payment_status === 'pending');
  const totalRevenue = approved.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalSold = approved.reduce((s, o) => s + (o.quantity ?? 0), 0);
  const ticketCount = ticketsData?.count ?? 0;
  const totalTicketCount = totalTickets?.count ?? 0;
  const peopleRemaining = totalTicketCount - ticketCount;
  const avgTicket = totalSold > 0 ? totalRevenue / totalSold : 0;

  // Revenue by lot
  const revenueByLot = Object.entries(
    approved.reduce<Record<string, { count: number; revenue: number }>>((acc, o) => {
      const name = (o.lots as any)?.name ?? 'Desconhecido';
      acc[name] = acc[name] ?? { count: 0, revenue: 0 };
      acc[name].count++;
      acc[name].revenue += Number(o.total_amount);
      return acc;
    }, {})
  ).map(([label, { revenue }]) => ({ label, value: revenue }));

  // Revenue by payment method (approximation — all from MercadoPago unless free)
  const paymentMethods = [
    { label: 'Pix / Cartão', value: approved.filter((o) => Number(o.total_amount) > 0).length },
    { label: 'Cortesia', value: approved.filter((o) => Number(o.total_amount) === 0).length },
  ];

  // Revenue by hour
  const revenueByHour = Array.from({ length: 24 }, (_, h) => {
    const hourOrders = approved.filter((o) => new Date(o.created_at).getHours() === h);
    return { label: `${h}h`, value: hourOrders.reduce((s, o) => s + Number(o.total_amount), 0) };
  }).filter((d) => d.value > 0);

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_last_name.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_email.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_cpf.includes(search);
    const matchStatus = statusFilter === 'all' || o.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedOrders = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
  const handleStatusChange = (v: string) => { setStatusFilter(v); setPage(1); };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size={48} />
      </div>
    );
  }

  const fmtCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <AdminLayout title="Início">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={TicketIcon} label="Ingressos vendidos" description="Total de ingressos confirmados." value={String(totalSold)} gradient="bg-gradient-to-br from-purple-500 to-purple-600" isMobile={isMobile} delay={0} />
        <StatCard icon={Clock} label="Pendentes" description="Compras aguardando pagamento." value={String(pending.length)} gradient="bg-gradient-to-br from-amber-500 to-orange-500" isMobile={isMobile} delay={0.05} />
        <StatCard icon={DollarSign} label="Receita total" description="Valor total arrecadado." value={fmtCurrency(totalRevenue)} gradient="bg-gradient-to-br from-emerald-500 to-green-500" isMobile={isMobile} delay={0.1} />
        <StatCard icon={BarChart3} label="Ticket médio" description="Média arrecadada por ingresso vendido." value={fmtCurrency(avgTicket)} gradient="bg-gradient-to-br from-cyan-500 to-blue-500" isMobile={isMobile} delay={0.15} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Entraram" description="Participantes que já realizaram check-in." value={String(ticketCount)} gradient="bg-gradient-to-br from-pink-500 to-rose-500" isMobile={isMobile} delay={0.2} />
        <StatCard icon={Users} label="Faltam entrar" description="Participantes que ainda não fizeram check-in." value={String(peopleRemaining)} gradient="bg-gradient-to-br from-indigo-500 to-purple-500" isMobile={isMobile} delay={0.25} />
        <StatCard icon={TicketIcon} label="Total de pedidos" description="Compras realizadas." value={String(orders.length)} gradient="bg-gradient-to-br from-teal-500 to-cyan-500" isMobile={isMobile} delay={0.3} />
        <StatCard icon={TrendingUp} label="Taxa de conversão" description="Percentual de visitantes que compraram ingresso." value={`${orders.length > 0 ? ((approved.length / orders.length) * 100).toFixed(0) : 0}%`} gradient="bg-gradient-to-br from-violet-500 to-fuchsia-500" isMobile={isMobile} delay={0.35} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {!isMobile && revenueByHour.length > 0 && (
          <ChartCard title="Receita por Hora" icon={Clock}>
            <LineChart data={revenueByHour} formatValue={fmtCurrency} />
          </ChartCard>
        )}
        {!isMobile && revenueByLot.length > 0 && (
          <ChartCard title="Receita por Lote" icon={DollarSign}>
            <BarChart data={revenueByLot} formatValue={fmtCurrency} />
          </ChartCard>
        )}
      </div>

      {!isMobile && paymentMethods.length > 0 && paymentMethods.some((p) => p.value > 0) && (
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <ChartCard title="Método de Pagamento" icon={CreditCard}>
            <DonutChart data={paymentMethods} />
          </ChartCard>
        </div>
      )}

      {/* Quick access to check-in */}
      <motion.button
        initial={isMobile ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isMobile ? 0 : 0.1 }}
        onClick={() => navigate('/admin/checkin')}
        className="w-full glass-card glass-card-hover rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4 group mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
            <ScanLine size={24} className="text-white" />
          </div>
          <div className="text-left">
            <div className="text-base sm:text-lg font-semibold text-white">Check-in de Ingressos</div>
            <div className="text-xs text-white/35">Escanear QR Code ou buscar manualmente</div>
          </div>
        </div>
        <motion.div
          animate={isMobile ? undefined : { x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ArrowRight size={20} className="text-purple-400/60 group-hover:text-purple-400 transition-colors shrink-0" />
        </motion.div>
      </motion.button>

      {/* Lot management */}
      <motion.div
        initial={isMobile ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isMobile ? 0 : 0.15 }}
        className="glass-card rounded-2xl overflow-hidden mb-6"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-sm text-white/70 font-medium flex items-center gap-2">
            <Settings size={16} className="text-purple-400" />
            Gerenciar Lotes
          </h3>
          <button
            onClick={() => setLotManagementOpen((v) => !v)}
            className="flex items-center gap-2 text-xs text-purple-400/80 hover:text-purple-400 transition-colors px-4 py-2 border border-white/10 rounded-lg hover:border-purple-500/30"
          >
            {lotManagementOpen ? 'Recolher' : 'Expandir'}
            <ChevronDown size={14} className={`transition-transform duration-300 ${lotManagementOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {lotManagementOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {lotsLoading ? (
                <div className="flex justify-center py-12"><Spinner size={32} /></div>
              ) : (
                <div className="p-5 space-y-3">
                  {settingsError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2">
                      <AlertCircle size={14} className="text-red-400 shrink-0" />
                      <p className="text-xs text-red-400 flex-1">{settingsError}</p>
                      <button onClick={() => setSettingsError('')} className="text-white/30 hover:text-white/60">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-dark-800/60 border border-white/5">
                    <div>
                      <div className="text-sm font-medium text-white/80">Mostrar vagas restantes para os participantes</div>
                      <div className="text-xs text-white/35 mt-0.5">
                        Quando ativado, a quantidade de ingressos disponiveis aparece na pagina de compra
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateSettings({ show_remaining_tickets: !settings?.show_remaining_tickets })}
                      disabled={updateSettingsMutation.isPending}
                      className={`relative shrink-0 w-12 h-7 rounded-full transition-colors duration-300 disabled:opacity-50 ${
                        settings?.show_remaining_tickets ? 'bg-purple-500' : 'bg-white/10'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md ${
                          settings?.show_remaining_tickets ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors duration-300 ${
                    settings?.sales_enabled === false
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-emerald-500/5 border-emerald-500/20'
                  }`}>
                    <div>
                      <div className="text-sm font-medium text-white/80">Ativar / Desativar compras</div>
                      <div className="text-xs text-white/35 mt-0.5">
                        {settings?.sales_enabled === false
                          ? 'As vendas estao pausadas. Ninguem consegue comprar ingressos agora.'
                          : 'As vendas estao ativas. Os participantes podem comprar ingressos.'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateSettings({ sales_enabled: !(settings?.sales_enabled ?? true) })}
                      disabled={updateSettingsMutation.isPending}
                      className={`relative shrink-0 w-12 h-7 rounded-full transition-colors duration-300 disabled:opacity-50 ${
                        settings?.sales_enabled === false ? 'bg-white/10' : 'bg-emerald-500'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md ${
                          settings?.sales_enabled === false ? 'left-1' : 'left-6'
                        }`}
                      />
                    </button>
                  </div>

                  {lots.map((lot) => {
                    const available = lot.total_quantity - lot.sold_quantity;
                    const isActive = lot.status === 'active' && available > 0;
                    const isSoldOut = lot.status === 'sold_out';
                    return (
                      <div
                        key={lot.id}
                        className={`rounded-xl border p-4 transition-all duration-200 ${
                          isActive ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/5 bg-dark-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              isActive ? 'bg-purple-500/20 text-purple-400' : isSoldOut ? 'bg-red-500/15 text-red-400' : 'bg-cyan-500/15 text-cyan-400'
                            }`}>
                              <TicketIcon size={16} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white/90">{lot.name}</div>
                              <div className="text-xs text-white/40">{lot.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / ingresso</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-xs text-white/30">Vagas restantes</div>
                              <div className={`font-playfair text-lg ${available > 0 ? 'text-white/90' : 'text-red-400'}`}>{available}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-white/30">Vendidos</div>
                              <div className="font-playfair text-lg text-white/60">{lot.sold_quantity}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-white/30">Total</div>
                              <div className="font-playfair text-lg text-white/60">{lot.total_quantity}</div>
                            </div>
                            {isActive ? <Badge variant="green">Ativo</Badge> : isSoldOut ? <Badge variant="red">Esgotado</Badge> : <Badge variant="gray">Fechado</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                          <button
                            onClick={() => handleEditLot(lot)}
                            className="flex items-center gap-2 text-xs text-white/50 hover:text-purple-400 transition-colors px-3 py-2 rounded-lg border border-white/10 hover:border-purple-500/30"
                          >
                            <Edit3 size={12} /> Editar vagas
                          </button>
                          {!isActive && !isSoldOut && (
                            <button
                              onClick={() => setActiveLotMutation.mutate(lot.id)}
                              disabled={setActiveLotMutation.isPending}
                              className="flex items-center gap-2 text-xs text-cyan-400/80 hover:text-cyan-400 transition-colors px-3 py-2 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 disabled:opacity-50"
                            >
                              <Check size={12} /> Definir como lote ativo
                            </button>
                          )}
                          {isActive && <span className="text-xs text-purple-400/60 px-3 py-2">Este é o lote que os participantes estão comprando agora</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Edit lot modal */}
      <Modal
        open={!!editingLot}
        onClose={() => { setEditingLot(null); setEditError(''); }}
        title="Editar Vagas do Lote"
        maxWidth="md"
      >
        {editingLot && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-dark-800/60 border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <TicketIcon size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white/90">{editingLot.name}</div>
                <div className="text-xs text-white/40">{editingLot.sold_quantity} vendidos / {editingLot.total_quantity} total</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium">Quantidade total de vagas</label>
              <input
                type="number"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                min={editingLot.sold_quantity}
                className="w-full input-premium rounded-xl px-4 py-3.5 text-sm text-white outline-none"
                autoFocus
              />
              <p className="text-xs text-white/30">Minimo: {editingLot.sold_quantity} (ingressos ja vendidos).</p>
            </div>
            {editError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{editError}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => { setEditingLot(null); setEditError(''); }} className="flex-1">Cancelar</Button>
              <Button onClick={handleSaveLot} loading={updateLotMutation.isPending} className="flex-1">Salvar</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Coupon management */}
      <div className="mb-6">
        <CouponManager />
      </div>

      {/* Orders table */}
      <motion.div
        initial={isMobile ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isMobile ? 0 : 0.3 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        {cancelError && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-xs text-red-400">{cancelError}</p>
            <button onClick={() => setCancelError('')} className="ml-auto text-white/30 hover:text-white/60">
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex flex-col gap-4 p-5 border-b border-white/5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-sm text-white/70 font-medium flex items-center gap-2">
              <TicketIcon size={16} className="text-purple-400" />
              Participantes
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => qc.invalidateQueries({ queryKey: ['admin-orders'] })}
                className="p-2 rounded-lg border border-white/10 text-white/30 hover:text-white/70 hover:border-white/20 transition-colors"
                title="Atualizar"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 text-xs text-purple-400/80 hover:text-purple-400 transition-colors px-4 py-2 border border-white/10 rounded-lg hover:border-purple-500/30"
              >
                <Download size={14} /> CSV
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar participante..."
                className="w-full pl-10 pr-4 py-3 text-sm bg-dark-800 border border-white/10 rounded-xl text-white placeholder-white/25 outline-none focus:border-purple-500/40 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full sm:w-auto appearance-none pl-4 pr-10 py-3 text-sm bg-dark-800 border border-white/10 rounded-xl text-white/70 outline-none cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="approved">Aprovados</option>
                <option value="pending">Pendentes</option>
                <option value="rejected">Recusados</option>
                <option value="expired">Expirados</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size={40} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/25 text-sm">
            {search ? 'Nenhum resultado encontrado.' : 'Ainda não há informações para este evento.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Participante', 'E-mail', 'CPF', 'Lote', 'Valor', 'Status', 'Data', 'Ações'].map((h) => (
                      <th key={h} className="text-left text-[10px] tracking-widest text-white/25 uppercase px-5 py-4 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={isMobile ? false : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: isMobile ? 0 : i * 0.02 }}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-5 py-4 text-white/80 whitespace-nowrap font-medium">{order.buyer_name} {order.buyer_last_name}</td>
                      <td className="px-5 py-4 text-white/45 text-xs">{order.buyer_email}</td>
                      <td className="px-5 py-4 text-white/30 text-xs font-mono">{order.buyer_cpf}</td>
                      <td className="px-5 py-4 text-white/45 text-xs">{(order.lots as any)?.name ?? '—'}</td>
                      <td className="px-5 py-4 text-purple-400/90 text-xs font-mono font-medium">{Number(order.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="px-5 py-4">{statusBadge(order.payment_status)}</td>
                      <td className="px-5 py-4 text-white/25 text-xs whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {order.payment_status === 'approved' && (
                            <Button variant="ghost" size="sm" loading={resendMutation.isPending} onClick={() => resendMutation.mutate(order.id)} title="Reenviar ingresso">Reenviar</Button>
                          )}
                          {order.payment_status === 'pending' && (
                            <Button variant="danger" size="sm" loading={cancellingId === order.id} onClick={() => cancelMutation.mutate(order.id)}>Cancelar</Button>
                          )}
                        </div>
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
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-white/10 text-white/30 hover:text-white/70 hover:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-white/50 px-3">{page} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-white/10 text-white/30 hover:text-white/70 hover:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </AdminLayout>
  );
}

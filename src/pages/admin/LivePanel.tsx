import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Zap, DollarSign, TrendingUp,
  AlertTriangle, ScanLine, Clock,
  Radio,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { useEventContext } from '../../context/EventContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { LineChart, ChartCard } from '../../components/admin/Charts';
import { Spinner } from '../../components/ui/Spinner';

const fmtCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function LivePanel() {
  const { loading } = useAdminGuard();
  const { selectedEventId } = useEventContext();
  const [now, setNow] = useState(new Date());
  const [checkinsPerMin, setCheckinsPerMin] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: liveData, isLoading } = useQuery({
    queryKey: ['live-stats', selectedEventId],
    refetchInterval: 5000,
    queryFn: async () => {
      const [ticketsRes, totalTicketsRes, approvedOrdersRes, recentCheckinsRes] = await Promise.all([
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('is_used', true).eq('event_id', selectedEventId),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('event_id', selectedEventId),
        supabase.from('orders').select('total_amount, quantity, created_at').eq('payment_status', 'approved').eq('event_id', selectedEventId),
        supabase.from('tickets').select('used_at').not('used_at', 'is', null).order('used_at', { ascending: false }).limit(60),
      ]);

      const checkinsCount = ticketsRes.count ?? 0;
      const totalTickets = totalTicketsRes.count ?? 0;
      const approvedOrders = approvedOrdersRes.data ?? [];
      const recentCheckins = recentCheckinsRes.data ?? [];

      const revenue = approvedOrders.reduce((s, o) => s + Number(o.total_amount), 0);

      // Check-ins in last minute
      const oneMinAgo = new Date(Date.now() - 60000);
      const recentCount = recentCheckins.filter((t) => new Date(t.used_at ?? '').getTime() > oneMinAgo.getTime()).length;
      setCheckinsPerMin(recentCount);

      // Revenue by hour (last 12 hours)
      const revenueByHour = Array.from({ length: 12 }, (_, i) => {
        const h = (now.getHours() - 11 + i + 24) % 24;
        const hourOrders = approvedOrders.filter((o) => {
          const d = new Date(o.created_at);
          return d.getHours() === h && d > new Date(Date.now() - 12 * 60 * 60 * 1000);
        });
        return { label: `${h}h`, value: hourOrders.reduce((s, o) => s + Number(o.total_amount), 0) };
      });

      // Avg check-in time (approximate — time between consecutive check-ins)
      let avgCheckinTime = 0;
      if (recentCheckins.length > 1) {
        const times = recentCheckins.map((t) => new Date(t.used_at ?? '').getTime()).filter(Boolean).sort();
        const diffs: number[] = [];
        for (let i = 1; i < times.length; i++) diffs.push(times[i] - times[i - 1]);
        avgCheckinTime = diffs.length > 0 ? diffs.reduce((s, d) => s + d, 0) / diffs.length / 1000 : 0;
      }

      return {
        peopleInside: checkinsCount,
        peopleRemaining: totalTickets - checkinsCount,
        revenue,
        revenueByHour,
        avgCheckinTime,
        totalTickets,
        recentCheckinsCount: recentCheckins.length,
      };
    },
  });

  if (loading) {
    return <div className="min-h-screen bg-dark-950 flex items-center justify-center"><Spinner size={48} /></div>;
  }

  const alerts: { type: 'warning' | 'info' | 'danger'; message: string }[] = [];
  if (liveData && liveData.peopleRemaining < liveData.totalTickets * 0.1 && liveData.totalTickets > 0) {
    alerts.push({ type: 'warning', message: 'Estoque crítico: menos de 10% dos ingressos restantes.' });
  }
  if (checkinsPerMin === 0 && (liveData?.peopleInside ?? 0) > 0) {
    alerts.push({ type: 'info', message: 'Fluxo de check-in parado. Nenhum scan no último minuto.' });
  }
  if (liveData && liveData.peopleInside >= (liveData.totalTickets * 0.9)) {
    alerts.push({ type: 'danger', message: 'Evento próximo da capacidade máxima!' });
  }

  return (
    <AdminLayout title="Ao Vivo">
      {/* Live indicator */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-3 h-3 rounded-full bg-red-500"
        />
        <span className="text-sm text-red-400 font-medium">ACOMPANHANDO EM TEMPO REAL</span>
        <span className="text-xs text-white/30 font-mono ml-auto">{now.toLocaleTimeString('pt-BR')}</span>
      </div>

      {isLoading || !liveData ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : (
        <>
          {/* Main metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <LiveStat icon={Users} label="Pessoas dentro" value={String(liveData.peopleInside)} color="emerald" pulse />
            <LiveStat icon={Users} label="Faltam entrar" value={String(liveData.peopleRemaining)} color="cyan" />
            <LiveStat icon={ScanLine} label="Entradas por minuto" value={String(checkinsPerMin)} color="purple" />
            <LiveStat icon={DollarSign} label="Receita total" value={fmtCurrency(liveData.revenue)} color="pink" />
          </div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <LiveStat icon={Clock} label="Tempo médio de entrada" value={`${liveData.avgCheckinTime.toFixed(1)}s`} color="amber" />
            <LiveStat icon={Zap} label="Entradas (última hora)" value={String(liveData.recentCheckinsCount)} color="purple" />
            <LiveStat icon={TrendingUp} label="Ocupação" value={`${liveData.totalTickets > 0 ? ((liveData.peopleInside / liveData.totalTickets) * 100).toFixed(0) : 0}%`} color="emerald" />
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2 mb-6">
              <AnimatePresence>
                {alerts.map((alert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`glass-card rounded-xl p-4 flex items-center gap-3 border-l-4 ${
                      alert.type === 'danger' ? 'border-red-500' : alert.type === 'warning' ? 'border-amber-500' : 'border-cyan-500'
                    }`}
                  >
                    <AlertTriangle size={16} className={
                      alert.type === 'danger' ? 'text-red-400' : alert.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                    } />
                    <p className="text-sm text-white/70">{alert.message}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Revenue chart */}
          <ChartCard title="Receita em tempo real (últimas 12 horas)" icon={Radio}>
            <LineChart data={liveData.revenueByHour} formatValue={fmtCurrency} />
          </ChartCard>
        </>
      )}
    </AdminLayout>
  );
}

function LiveStat({ icon: Icon, label, value, color, pulse }: {
  icon: React.ElementType; label: string; value: string; color: string; pulse?: boolean;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/15 text-emerald-400',
    cyan: 'bg-cyan-500/15 text-cyan-400',
    purple: 'bg-purple-500/15 text-purple-400',
    pink: 'bg-pink-500/15 text-pink-400',
    amber: 'bg-amber-500/15 text-amber-400',
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-xl p-5 relative overflow-hidden"
    >
      {pulse && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"
        />
      )}
      <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center mb-3`}>
        <Icon size={18} />
      </div>
      <div className="font-playfair text-2xl text-white">{value}</div>
      <div className="text-xs text-white/35 mt-1">{label}</div>
    </motion.div>
  );
}

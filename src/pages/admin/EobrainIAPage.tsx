import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, Calendar, Clock, Users, DollarSign,
  Trophy, ArrowUp, ArrowDown, Lightbulb, AlertCircle,
  BarChart3, Target, MapPin, Sparkles, Download, FileText,
  TicketIcon, Tag, Check,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { useEventContext } from '../../context/EventContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { BarChart, DonutChart, LineChart, ChartCard } from '../../components/admin/Charts';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import type { Order } from '../../types';

const fmtCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function EobrainIAPage() {
  const { loading } = useAdminGuard();
  const { selectedEventId } = useEventContext();
  const [tab, setTab] = useState<'ai' | 'insights' | 'reports'>('ai');
  const [reportType, setReportType] = useState<'sales' | 'checkins' | 'coupons' | 'full'>('full');

  // =================== AI DATA (all events) ===================
  const { data: allEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['eobrain-events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: allOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['eobrain-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, lots(*)')
        .eq('payment_status', 'approved')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: allTickets = [] } = useQuery({
    queryKey: ['eobrain-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tickets').select('is_used, used_at, created_at, event_id');
      if (error) throw error;
      return data ?? [];
    },
  });

  // =================== PER-EVENT DATA ===================
  const { data: insightsOrders = [], isLoading: insightsLoading } = useQuery<Order[]>({
    queryKey: ['insights-orders', selectedEventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, lots(*)')
        .eq('payment_status', 'approved')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: reportOrders = [], isLoading: reportsLoading } = useQuery<Order[]>({
    queryKey: ['report-orders', selectedEventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, lots(*)')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ['report-coupons', selectedEventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: ticketCount } = useQuery<{ checkedIn: number; total: number }>({
    queryKey: ['report-tickets', selectedEventId],
    queryFn: async () => {
      const [checked, total] = await Promise.all([
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('is_used', true).eq('event_id', selectedEventId),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('event_id', selectedEventId),
      ]);
      return { checkedIn: checked.count ?? 0, total: total.count ?? 0 };
    },
  });

  // =================== AI ANALYSIS ===================
  const analysis = useMemo(() => {
    if (allEvents.length === 0 || allOrders.length === 0) return null;

    const eventStats = allEvents.map((event) => {
      const eventOrders = allOrders.filter((o: any) => o.event_id === event.id);
      const eventTickets = allTickets.filter((t: any) => t.event_id === event.id);
      const revenue = eventOrders.reduce((s: number, o: any) => s + Number(o.total_amount), 0);
      const ticketsSold = eventOrders.reduce((s: number, o: any) => s + (o.quantity ?? 0), 0);
      const checkedIn = eventTickets.filter((t: any) => t.is_used).length;
      const attendanceRate = eventTickets.length > 0 ? (checkedIn / eventTickets.length) * 100 : 0;
      const avgTicket = ticketsSold > 0 ? revenue / ticketsSold : 0;

      let avgCheckinTime = 0;
      const checkedTickets = eventTickets.filter((t: any) => t.is_used && t.used_at);
      if (checkedTickets.length > 0) {
        const diffs = checkedTickets.map((t: any) => {
          const purchase = new Date(t.created_at).getTime();
          const checkin = new Date(t.used_at).getTime();
          return (checkin - purchase) / (1000 * 60 * 60);
        }).filter((d: number) => d >= 0);
        avgCheckinTime = diffs.length > 0 ? diffs.reduce((s: number, d: number) => s + d, 0) / diffs.length : 0;
      }

      return { id: event.id, name: event.name, status: event.status, revenue, ticketsSold, checkedIn, attendanceRate, avgTicket, avgCheckinTime, event_date: event.event_date, location: event.location };
    });

    const totalRevenue = eventStats.reduce((s, e) => s + e.revenue, 0);
    const totalTickets = eventStats.reduce((s, e) => s + e.ticketsSold, 0);
    const avgAttendance = eventStats.length > 0 ? eventStats.reduce((s, e) => s + e.attendanceRate, 0) / eventStats.length : 0;
    const avgCheckinTime = eventStats.length > 0 ? eventStats.reduce((s, e) => s + e.avgCheckinTime, 0) / eventStats.length : 0;
    const mostProfitable = [...eventStats].sort((a, b) => b.revenue - a.revenue)[0];

    const sortedByDate = [...eventStats].filter((e) => e.event_date).sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime());
    const midPoint = Math.floor(sortedByDate.length / 2);
    const firstHalf = sortedByDate.slice(0, midPoint);
    const secondHalf = sortedByDate.slice(midPoint);
    const firstRevenue = firstHalf.reduce((s, e) => s + e.revenue, 0);
    const secondRevenue = secondHalf.reduce((s, e) => s + e.revenue, 0);
    const growthRate = firstRevenue > 0 ? ((secondRevenue - firstRevenue) / firstRevenue) * 100 : secondRevenue > 0 ? 100 : 0;

    const dayStats = Object.entries(
      allOrders.reduce<Record<string, number>>((acc, o: any) => {
        const day = dayNames[new Date(o.created_at).getDay()];
        acc[day] = (acc[day] ?? 0) + Number(o.total_amount);
        return acc;
      }, {})
    );
    const bestDay = dayStats.sort((a, b) => b[1] - a[1])[0];
    const dayChartData = dayStats.map(([label, value]) => ({ label, value }));

    const hourStats = Object.entries(
      allOrders.reduce<Record<string, number>>((acc, o: any) => {
        const h = new Date(o.created_at).getHours();
        const label = `${h}h`;
        acc[label] = (acc[label] ?? 0) + 1;
        return acc;
      }, {})
    );
    const bestHour = hourStats.sort((a, b) => b[1] - a[1])[0];
    const hourChartData = hourStats.map(([label, value]) => ({ label, value }));

    const revenueTrend = sortedByDate.map((e) => ({ label: e.name.slice(0, 12), value: e.revenue }));

    const cityStats = Object.entries(
      allOrders.reduce<Record<string, number>>((acc, o: any) => {
        const city = (o as any).buyer_city ?? 'Não informada';
        acc[city] = (acc[city] ?? 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const cityChartData = cityStats.map(([label, value]) => ({ label, value }));

    const avgRevenuePerEvent = totalRevenue / eventStats.length;
    const predictedNextRevenue = avgRevenuePerEvent * (1 + growthRate / 100);

    const alerts: { type: 'warning' | 'info' | 'danger'; message: string }[] = [];
    if (growthRate < 0) alerts.push({ type: 'warning', message: `Crescimento negativo de ${Math.abs(growthRate).toFixed(0)}% entre eventos.` });
    if (growthRate > 30) alerts.push({ type: 'info', message: `Crescimento positivo de ${growthRate.toFixed(0)}% entre eventos!` });
    if (avgAttendance < 60) alerts.push({ type: 'warning', message: `Taxa de comparecimento baixa: ${avgAttendance.toFixed(0)}%.` });
    if (eventStats.filter((e) => e.status === 'cancelled').length > 0) {
      alerts.push({ type: 'danger', message: 'Há eventos cancelados no histórico.' });
    }

    return {
      eventCount: eventStats.length,
      totalRevenue, totalTickets, avgAttendance, avgCheckinTime,
      mostProfitable, growthRate,
      bestDay: bestDay?.[0] ?? '—', dayChartData,
      bestHour: bestHour?.[0] ?? '—', hourChartData,
      revenueTrend, cityChartData,
      avgRevenuePerEvent, predictedNextRevenue,
      eventStats, alerts,
    };
  }, [allEvents, allOrders, allTickets]);

  // =================== PER-EVENT INSIGHTS ===================
  const insights = useMemo(() => {
    if (insightsOrders.length === 0) return null;

    const totalRevenue = insightsOrders.reduce((s, o) => s + Number(o.total_amount), 0);
    const totalTickets = insightsOrders.reduce((s, o) => s + (o.quantity ?? 0), 0);
    const avgTicket = totalTickets > 0 ? totalRevenue / totalTickets : 0;

    const lotStats = Object.entries(
      insightsOrders.reduce<Record<string, { count: number; revenue: number }>>((acc, o) => {
        const name = (o.lots as any)?.name ?? 'Desconhecido';
        acc[name] = acc[name] ?? { count: 0, revenue: 0 };
        acc[name].count++;
        acc[name].revenue += Number(o.total_amount);
        return acc;
      }, {})
    );
    const bestLot = lotStats.sort((a, b) => b[1].revenue - a[1].revenue)[0];
    const lotChartData = lotStats.map(([label, { revenue }]) => ({ label, value: revenue }));

    const dayStats = Object.entries(
      insightsOrders.reduce<Record<string, number>>((acc, o) => {
        const day = dayNames[new Date(o.created_at).getDay()];
        acc[day] = (acc[day] ?? 0) + Number(o.total_amount);
        return acc;
      }, {})
    );
    const bestDay = dayStats.sort((a, b) => b[1] - a[1])[0];
    const dayChartData = dayStats.map(([label, value]) => ({ label, value }));

    const hourStats = Object.entries(
      insightsOrders.reduce<Record<string, number>>((acc, o) => {
        const h = new Date(o.created_at).getHours();
        const label = `${h}h`;
        acc[label] = (acc[label] ?? 0) + 1;
        return acc;
      }, {})
    );
    const bestHour = hourStats.sort((a, b) => b[1] - a[1])[0];
    const hourChartData = hourStats.map(([label, value]) => ({ label, value }));

    const now = Date.now();
    const last7 = insightsOrders.filter((o) => new Date(o.created_at).getTime() > now - 7 * 24 * 60 * 60 * 1000);
    const prev7 = insightsOrders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t > now - 14 * 24 * 60 * 60 * 1000 && t <= now - 7 * 24 * 60 * 60 * 1000;
    });
    const last7Revenue = last7.reduce((s, o) => s + Number(o.total_amount), 0);
    const prev7Revenue = prev7.reduce((s, o) => s + Number(o.total_amount), 0);
    const growthRate = prev7Revenue > 0 ? ((last7Revenue - prev7Revenue) / prev7Revenue) * 100 : last7Revenue > 0 ? 100 : 0;

    const avgPerDay = totalRevenue / Math.max(1, Math.ceil((now - new Date(insightsOrders[0].created_at).getTime()) / (24 * 60 * 60 * 1000)));
    const estimatedFinalRevenue = avgPerDay * 30;
    const estimatedAudience = totalTickets * 1.15;

    const alerts: { type: 'warning' | 'info' | 'danger'; message: string }[] = [];
    if (growthRate < 0) alerts.push({ type: 'warning', message: `Vendas caíram ${Math.abs(growthRate).toFixed(0)}% nos últimos 7 dias.` });
    if (growthRate > 50) alerts.push({ type: 'info', message: `Vendas cresceram ${growthRate.toFixed(0)}% nos últimos 7 dias!` });
    const pendingOrders = insightsOrders.filter((o) => o.payment_status === 'pending').length;
    if (pendingOrders > 5) alerts.push({ type: 'danger', message: `${pendingOrders} pedidos pendentes precisam de atenção.` });

    return {
      totalRevenue, totalTickets, avgTicket,
      bestLot: bestLot?.[0] ?? '—', lotChartData,
      bestDay: bestDay?.[0] ?? '—', dayChartData,
      bestHour: bestHour?.[0] ?? '—', hourChartData,
      growthRate, last7Revenue, prev7Revenue,
      estimatedFinalRevenue, estimatedAudience,
      alerts,
    };
  }, [insightsOrders]);

  // =================== REPORTS ===================
  const report = useMemo(() => {
    if (reportOrders.length === 0) return null;
    const approved = reportOrders.filter((o) => o.payment_status === 'approved');
    const pending = reportOrders.filter((o) => o.payment_status === 'pending');
    const rejected = reportOrders.filter((o) => o.payment_status === 'rejected');

    const totalRevenue = approved.reduce((s, o) => s + Number(o.total_amount), 0);
    const totalTickets = approved.reduce((s, o) => s + (o.quantity ?? 0), 0);
    const avgTicket = totalTickets > 0 ? totalRevenue / totalTickets : 0;

    const byLot = Object.entries(
      approved.reduce<Record<string, { count: number; revenue: number; tickets: number }>>((acc, o) => {
        const name = (o.lots as any)?.name ?? 'Desconhecido';
        acc[name] = acc[name] ?? { count: 0, revenue: 0, tickets: 0 };
        acc[name].count++;
        acc[name].revenue += Number(o.total_amount);
        acc[name].tickets += o.quantity ?? 0;
        return acc;
      }, {})
    ).map(([name, stats]) => ({ name, ...stats }));

    const byDay = Object.entries(
      approved.reduce<Record<string, { count: number; revenue: number }>>((acc, o) => {
        const day = new Date(o.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        acc[day] = acc[day] ?? { count: 0, revenue: 0 };
        acc[day].count++;
        acc[day].revenue += Number(o.total_amount);
        return acc;
      }, {})
    ).map(([day, stats]) => ({ day, ...stats }));

    const couponStats = coupons.map((c: any) => ({
      code: c.code,
      uses: c.used_count,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      is_active: c.is_active,
    }));

    const statusData = [
      { label: 'Aprovados', value: approved.length },
      { label: 'Pendentes', value: pending.length },
      { label: 'Recusados', value: rejected.length },
    ];

    return {
      totalRevenue, totalTickets, avgTicket,
      approved: approved.length, pending: pending.length, rejected: rejected.length,
      byLot, byDay, couponStats, statusData,
      checkedIn: ticketCount?.checkedIn ?? 0,
      totalTicketsIssued: ticketCount?.total ?? 0,
    };
  }, [reportOrders, coupons, ticketCount]);

  const exportReport = () => {
    if (!report) return;
    const lines: string[] = [];
    lines.push('RELATORIO COMPLETO - LUX HOUSE');
    lines.push(`Data: ${new Date().toLocaleString('pt-BR')}`);
    lines.push('');
    lines.push('=== RESUMO ===');
    lines.push(`Receita Total: ${fmtCurrency(report.totalRevenue)}`);
    lines.push(`Ingressos Vendidos: ${report.totalTickets}`);
    lines.push(`Ticket Medio: ${fmtCurrency(report.avgTicket)}`);
    lines.push(`Pedidos Aprovados: ${report.approved}`);
    lines.push(`Pedidos Pendentes: ${report.pending}`);
    lines.push(`Pedidos Recusados: ${report.rejected}`);
    lines.push(`Check-ins: ${report.checkedIn}/${report.totalTicketsIssued}`);
    lines.push('');
    lines.push('=== VENDAS POR LOTE ===');
    report.byLot.forEach((l) => { lines.push(`${l.name}: ${l.tickets} ingressos, ${fmtCurrency(l.revenue)}`); });
    lines.push('');
    lines.push('=== VENDAS POR DIA ===');
    report.byDay.forEach((d) => { lines.push(`${d.day}: ${d.count} pedidos, ${fmtCurrency(d.revenue)}`); });
    lines.push('');
    lines.push('=== CUPONS ===');
    report.couponStats.forEach((c) => { lines.push(`${c.code}: ${c.uses} usos, ${c.discount_type === 'percent' ? c.discount_value + '%' : fmtCurrency(c.discount_value)}`); });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-luxhouse-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (!report) return;
    const headers = ['Lote', 'Ingressos', 'Pedidos', 'Receita'];
    const rows = report.byLot.map((l) => [l.name, l.tickets, l.count, l.revenue.toFixed(2)]);
    const csv = [headers, ...rows].map((r) => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendas-por-lote-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="min-h-screen bg-dark-950 flex items-center justify-center"><Spinner size={48} /></div>;
  }

  const tabs = [
    { key: 'ai' as const, label: 'eoBraia IA', icon: Brain },
    { key: 'insights' as const, label: 'Estatísticas', icon: Sparkles },
    { key: 'reports' as const, label: 'Relatórios', icon: FileText },
  ];

  return (
    <AdminLayout title="eoBraia IA">
      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 border-b border-white/5 pb-3 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* =================== AI TAB =================== */}
      {tab === 'ai' && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-white/60">Análise preditiva de todos os eventos</p>
              <p className="text-xs text-white/30">Aprendizado contínuo com o histórico completo da plataforma</p>
            </div>
          </div>

          {eventsLoading || ordersLoading ? (
            <div className="flex justify-center py-20"><Spinner size={32} /></div>
          ) : !analysis ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Lightbulb size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Ainda não há dados suficientes. A IA precisa de pelo menos um evento com vendas para começar as análises.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={BarChart3} label="Eventos Analisados" value={String(analysis.eventCount)} color="purple" />
                <StatCard icon={DollarSign} label="Receita total" value={fmtCurrency(analysis.totalRevenue)} color="emerald" />
                <StatCard icon={Users} label="Ingressos vendidos" value={String(analysis.totalTickets)} color="cyan" />
                <StatCard
                  icon={analysis.growthRate >= 0 ? ArrowUp : ArrowDown}
                  label="Crescimento da Marca"
                  value={`${analysis.growthRate >= 0 ? '+' : ''}${analysis.growthRate.toFixed(0)}%`}
                  color={analysis.growthRate >= 0 ? 'emerald' : 'red'}
                />
              </div>

              {analysis.alerts.length > 0 && (
                <div className="space-y-2 mb-6">
                  {analysis.alerts.map((alert, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`glass-card rounded-xl p-4 flex items-center gap-3 border-l-4 ${
                        alert.type === 'danger' ? 'border-red-500' : alert.type === 'warning' ? 'border-amber-500' : 'border-cyan-500'
                      }`}
                    >
                      <AlertCircle size={16} className={
                        alert.type === 'danger' ? 'text-red-400' : alert.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                      } />
                      <p className="text-sm text-white/70">{alert.message}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Trophy} label="Evento Mais Lucrativo" value={analysis.mostProfitable?.name ?? '—'} color="purple" />
                <StatCard icon={Calendar} label="Melhor Dia" value={analysis.bestDay} color="cyan" />
                <StatCard icon={Clock} label="Melhor Horário" value={analysis.bestHour} color="pink" />
                <StatCard icon={Target} label="Comparecimento Médio" value={`${analysis.avgAttendance.toFixed(0)}%`} color="emerald" />
              </div>

              <div className="grid lg:grid-cols-2 gap-4 mb-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-purple-400" />
                    <span className="text-xs tracking-widest text-white/30 uppercase">Previsão Próximo Evento</span>
                  </div>
                  <div className="font-playfair text-3xl text-purple-400">{fmtCurrency(analysis.predictedNextRevenue)}</div>
                  <p className="text-xs text-white/30 mt-2">Baseado na média histórica ({fmtCurrency(analysis.avgRevenuePerEvent)}) + crescimento de {analysis.growthRate.toFixed(0)}%</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={14} className="text-amber-400" />
                    <span className="text-xs tracking-widest text-white/30 uppercase">Tempo Médio Compra → Check-in</span>
                  </div>
                  <div className="font-playfair text-3xl text-amber-400">{analysis.avgCheckinTime.toFixed(1)}h</div>
                  <p className="text-xs text-white/30 mt-2">Tempo médio entre a compra do ingresso e o comparecimento ao evento</p>
                </motion.div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4 mb-6">
                <ChartCard title="Tendência de Receita por Evento" icon={TrendingUp}>
                  <LineChart data={analysis.revenueTrend} formatValue={fmtCurrency} />
                </ChartCard>
                <ChartCard title="Vendas por Dia da Semana" icon={Calendar}>
                  <BarChart data={analysis.dayChartData} formatValue={fmtCurrency} />
                </ChartCard>
              </div>

              <div className="grid lg:grid-cols-2 gap-4 mb-6">
                <ChartCard title="Horários de Maior Conversão" icon={Clock}>
                  <BarChart data={analysis.hourChartData} formatValue={(v) => `${v} vendas`} />
                </ChartCard>
                <ChartCard title="Cidades dos Compradores" icon={MapPin}>
                  <BarChart data={analysis.cityChartData} formatValue={(v) => `${v} compras`} />
                </ChartCard>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5">
                  <h3 className="text-sm text-white/70 font-medium flex items-center gap-2">
                    <Trophy size={16} className="text-purple-400" /> Comparação entre Eventos
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        {['Evento', 'Receita', 'Ingressos', 'Comparecimento', 'Ticket Médio', 'Status'].map((h) => (
                          <th key={h} className="text-left text-[10px] tracking-widest text-white/25 uppercase px-5 py-4 font-normal whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.eventStats.map((e, i) => (
                        <motion.tr
                          key={e.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-white/5 hover:bg-white/3"
                        >
                          <td className="px-5 py-4 text-white/80 font-medium">{e.name}</td>
                          <td className="px-5 py-4 text-emerald-400 font-mono">{fmtCurrency(e.revenue)}</td>
                          <td className="px-5 py-4 text-white/50">{e.ticketsSold}</td>
                          <td className="px-5 py-4 text-white/50">{e.attendanceRate.toFixed(0)}%</td>
                          <td className="px-5 py-4 text-white/50 font-mono">{fmtCurrency(e.avgTicket)}</td>
                          <td className="px-5 py-4">
                            <Badge variant={e.status === 'live' ? 'red' : e.status === 'sales_open' ? 'green' : e.status === 'ended' ? 'gray' : 'blue'}>
                              {e.status === 'coming_soon' ? 'Em breve' : e.status === 'sales_open' ? 'Vendas' : e.status === 'live' ? 'Ao vivo' : e.status === 'ended' ? 'Encerrado' : e.status}
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* =================== INSIGHTS TAB =================== */}
      {tab === 'insights' && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-white/60">Análise automática do evento selecionado</p>
              <p className="text-xs text-white/30">Atualizado em tempo real com base nas vendas</p>
            </div>
          </div>

          {insightsLoading ? (
            <div className="flex justify-center py-20"><Spinner size={32} /></div>
          ) : !insights ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Lightbulb size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Ainda não há vendas para este evento. As estatísticas aparecerão automaticamente quando começarem as vendas.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Trophy} label="Melhor Lote" value={insights.bestLot} color="purple" />
                <StatCard icon={Calendar} label="Melhor Dia" value={insights.bestDay} color="cyan" />
                <StatCard icon={Clock} label="Melhor Horário" value={insights.bestHour} color="pink" />
                <StatCard
                  icon={insights.growthRate >= 0 ? ArrowUp : ArrowDown}
                  label="Crescimento (7d)"
                  value={`${insights.growthRate >= 0 ? '+' : ''}${insights.growthRate.toFixed(0)}%`}
                  color={insights.growthRate >= 0 ? 'emerald' : 'red'}
                />
              </div>

              {insights.alerts.length > 0 && (
                <div className="space-y-2 mb-6">
                  {insights.alerts.map((alert, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`glass-card rounded-xl p-4 flex items-center gap-3 border-l-4 ${
                        alert.type === 'danger' ? 'border-red-500' : alert.type === 'warning' ? 'border-amber-500' : 'border-cyan-500'
                      }`}
                    >
                      <AlertCircle size={16} className={
                        alert.type === 'danger' ? 'text-red-400' : alert.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                      } />
                      <p className="text-sm text-white/70">{alert.message}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign size={14} className="text-emerald-400" />
                    <span className="text-xs tracking-widest text-white/30 uppercase">Estimativa de Faturamento</span>
                  </div>
                  <div className="font-playfair text-3xl text-emerald-400">{fmtCurrency(insights.estimatedFinalRevenue)}</div>
                  <p className="text-xs text-white/30 mt-2">Baseado na média diária projetada para 30 dias</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={14} className="text-cyan-400" />
                    <span className="text-xs tracking-widest text-white/30 uppercase">Estimativa de Público</span>
                  </div>
                  <div className="font-playfair text-3xl text-cyan-400">{Math.round(insights.estimatedAudience)}</div>
                  <p className="text-xs text-white/30 mt-2">Ingressos vendidos + 15% estimativa de walk-in</p>
                </motion.div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4 mb-6">
                <ChartCard title="Vendas por Lote" icon={Trophy}>
                  <BarChart data={insights.lotChartData} formatValue={fmtCurrency} />
                </ChartCard>
                <ChartCard title="Vendas por Dia da Semana" icon={Calendar}>
                  <BarChart data={insights.dayChartData} formatValue={fmtCurrency} />
                </ChartCard>
              </div>

              <div className="grid lg:grid-cols-2 gap-4 mb-6">
                <ChartCard title="Vendas por Horário" icon={Clock}>
                  <BarChart data={insights.hourChartData} formatValue={(v) => `${v} vendas`} />
                </ChartCard>
                <ChartCard title="Resumo Executivo" icon={Sparkles}>
                  <div className="space-y-3">
                    <SummaryRow label="Receita Total" value={fmtCurrency(insights.totalRevenue)} />
                    <SummaryRow label="Ingressos Vendidos" value={String(insights.totalTickets)} />
                    <SummaryRow label="Ticket Médio" value={fmtCurrency(insights.avgTicket)} />
                    <SummaryRow label="Receita Últimos 7 dias" value={fmtCurrency(insights.last7Revenue)} />
                    <SummaryRow label="Receita 7 dias Anteriores" value={fmtCurrency(insights.prev7Revenue)} />
                  </div>
                </ChartCard>
              </div>
            </>
          )}
        </>
      )}

      {/* =================== REPORTS TAB =================== */}
      {tab === 'reports' && (
        <>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex gap-2">
              {([
                { key: 'full', label: 'Completo' },
                { key: 'sales', label: 'Vendas' },
                { key: 'checkins', label: 'Check-ins' },
                { key: 'coupons', label: 'Cupons' },
              ] as const).map((rt) => (
                <button
                  key={rt.key}
                  onClick={() => setReportType(rt.key)}
                  className={`px-4 py-2 rounded-lg text-xs transition-colors ${
                    reportType === rt.key ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'text-white/40 border border-white/10 hover:text-white/70'
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportCSV}><Download size={14} /> CSV</Button>
              <Button size="sm" onClick={exportReport}><Download size={14} /> Relatório TXT</Button>
            </div>
          </div>

          {reportsLoading ? (
            <div className="flex justify-center py-20"><Spinner size={32} /></div>
          ) : !report ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <FileText size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Ainda não há dados para gerar relatórios. Os relatórios aparecerão quando começarem as vendas.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={DollarSign} label="Receita total" value={fmtCurrency(report.totalRevenue)} color="emerald" />
                <StatCard icon={TicketIcon} label="Ingressos vendidos" value={String(report.totalTickets)} color="purple" />
                <StatCard icon={TrendingUp} label="Ticket médio" value={fmtCurrency(report.avgTicket)} color="cyan" />
                <StatCard icon={Check} label="Check-ins" value={`${report.checkedIn}/${report.totalTicketsIssued}`} color="pink" />
              </div>

              {(reportType === 'full' || reportType === 'sales') && (
                <>
                  <div className="grid lg:grid-cols-2 gap-4 mb-6">
                    <ChartCard title="Vendas por Lote" icon={BarChart3}>
                      <BarChart data={report.byLot.map((l) => ({ label: l.name, value: l.revenue }))} formatValue={fmtCurrency} />
                    </ChartCard>
                    <ChartCard title="Vendas por Dia" icon={Calendar}>
                      <BarChart data={report.byDay.map((d) => ({ label: d.day, value: d.revenue }))} formatValue={fmtCurrency} />
                    </ChartCard>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-4 mb-6">
                    <ChartCard title="Status de Pedidos" icon={TicketIcon}>
                      <DonutChart data={report.statusData} />
                    </ChartCard>
                    <ChartCard title="Detalhamento por Lote" icon={BarChart3}>
                      <div className="space-y-3">
                        {report.byLot.map((l, i) => (
                          <motion.div
                            key={l.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-dark-800/40 border border-white/5"
                          >
                            <div>
                              <div className="text-sm font-medium text-white/80">{l.name}</div>
                              <div className="text-xs text-white/30">{l.tickets} ingressos · {l.count} pedidos</div>
                            </div>
                            <div className="font-playfair text-lg text-emerald-400">{fmtCurrency(l.revenue)}</div>
                          </motion.div>
                        ))}
                      </div>
                    </ChartCard>
                  </div>
                </>
              )}

              {(reportType === 'full' || reportType === 'coupons') && report.couponStats.length > 0 && (
                <div className="glass-card rounded-2xl overflow-hidden mb-6">
                  <div className="p-5 border-b border-white/5">
                    <h3 className="text-sm text-white/70 font-medium flex items-center gap-2">
                      <Tag size={16} className="text-purple-400" /> Cupons
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Código', 'Usos', 'Desconto', 'Status'].map((h) => (
                            <th key={h} className="text-left text-[10px] tracking-widest text-white/25 uppercase px-5 py-4 font-normal">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.couponStats.map((c) => (
                          <tr key={c.code} className="border-b border-white/5">
                            <td className="px-5 py-4 text-white/80 font-mono">{c.code}</td>
                            <td className="px-5 py-4 text-white/50">{c.uses}</td>
                            <td className="px-5 py-4 text-white/50">
                              {c.discount_type === 'percent' ? `${c.discount_value}%` : fmtCurrency(Number(c.discount_value))}
                            </td>
                            <td className="px-5 py-4">
                              {c.is_active ? <Badge variant="green">Ativo</Badge> : <Badge variant="gray">Inativo</Badge>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/15 text-emerald-400',
    red: 'bg-red-500/15 text-red-400',
    cyan: 'bg-cyan-500/15 text-cyan-400',
    purple: 'bg-purple-500/15 text-purple-400',
    pink: 'bg-pink-500/15 text-pink-400',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
      <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center mb-3`}>
        <Icon size={18} />
      </div>
      <div className="font-playfair text-lg sm:text-xl text-white truncate">{value}</div>
      <div className="text-xs text-white/35 mt-1">{label}</div>
    </motion.div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-sm text-white/80 font-mono">{value}</span>
    </div>
  );
}

import { motion } from 'framer-motion';
import {
  ShieldCheck, LogIn, LogOut, Edit3, Trash2, DollarSign,
  TicketIcon, Tag, Settings, ScanLine, AlertCircle,
  Users, Building2, Package, Calendar,
} from 'lucide-react';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { useState } from 'react';

type AuditVariant = 'purple' | 'pink' | 'green' | 'red' | 'yellow' | 'blue' | 'gray';

const actionConfig: Record<string, { label: string; icon: React.ElementType; variant: AuditVariant }> = {
  login: { label: 'Login', icon: LogIn, variant: 'green' },
  logout: { label: 'Logout', icon: LogOut, variant: 'gray' },
  price_change: { label: 'Alteração de Preço', icon: DollarSign, variant: 'yellow' },
  lot_update: { label: 'Alteração de Lote', icon: TicketIcon, variant: 'blue' },
  lot_activate: { label: 'Lote Ativado', icon: TicketIcon, variant: 'purple' },
  coupon_create: { label: 'Cupom Criado', icon: Tag, variant: 'purple' },
  coupon_delete: { label: 'Cupom Excluído', icon: Trash2, variant: 'red' },
  order_cancel: { label: 'Pedido Cancelado', icon: AlertCircle, variant: 'red' },
  stock_change: { label: 'Alteração de Estoque', icon: Settings, variant: 'yellow' },
  settings_change: { label: 'Configuração Alterada', icon: Settings, variant: 'gray' },
  promoter_create: { label: 'Membro da Equipe Adicionado', icon: Users, variant: 'green' },
  promoter_update: { label: 'Membro da Equipe Atualizado', icon: Edit3, variant: 'blue' },
  promoter_delete: { label: 'Membro da Equipe Excluído', icon: Trash2, variant: 'red' },
  transaction_create: { label: 'Transação Criada', icon: DollarSign, variant: 'green' },
  transaction_delete: { label: 'Transação Excluída', icon: Trash2, variant: 'red' },
  sponsor_create: { label: 'Patrocinador Criado', icon: Building2, variant: 'purple' },
  sponsor_delete: { label: 'Patrocinador Excluído', icon: Trash2, variant: 'red' },
  stock_create: { label: 'Item de Estoque Criado', icon: Package, variant: 'green' },
  stock_update: { label: 'Item de Estoque Atualizado', icon: Edit3, variant: 'blue' },
  stock_delete: { label: 'Item de Estoque Excluído', icon: Trash2, variant: 'red' },
  stock_movement: { label: 'Movimento de Estoque', icon: Package, variant: 'yellow' },
  event_create: { label: 'Evento Criado', icon: Calendar, variant: 'green' },
  ticket_checkin: { label: 'Check-in Realizado', icon: ScanLine, variant: 'green' },
};

const variantStyles: Record<AuditVariant, { bg: string; text: string }> = {
  green: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  red: { bg: 'bg-red-500/15', text: 'text-red-400' },
  yellow: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  blue: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  purple: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  pink: { bg: 'bg-pink-500/15', text: 'text-pink-400' },
  gray: { bg: 'bg-white/5', text: 'text-white/40' },
};

export default function AuditoriaPage() {
  const { loading } = useAdminGuard();
  const { data: logs = [], isLoading } = useAuditLogs(200);
  const [filter, setFilter] = useState('all');

  if (loading) {
    return <div className="min-h-screen bg-dark-950 flex items-center justify-center"><Spinner size={48} /></div>;
  }

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.action === filter);
  const uniqueActions = [...new Set(logs.map((l) => l.action))].sort();

  return (
    <AdminLayout title="Histórico">
      <p className="text-sm text-white/40 mb-4">
        Registro de todas as ações realizadas no sistema. {logs.length} ação{logs.length !== 1 ? 'ões' : ''} registrada{logs.length !== 1 ? 's' : ''}.
      </p>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-2 rounded-lg text-xs transition-colors ${
            filter === 'all' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'text-white/40 hover:text-white/70 border border-white/10'
          }`}
        >
          Todos
        </button>
        {uniqueActions.map((action) => {
          const cfg = actionConfig[action];
          if (!cfg) return null;
          return (
            <button
              key={action}
              onClick={() => setFilter(action)}
              className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                filter === action ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'text-white/40 hover:text-white/70 border border-white/10'
              }`}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Logs */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <ShieldCheck size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Nenhuma ação registrada ainda. O histórico aparecerá aqui conforme o sistema for utilizado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log, i) => {
            const cfg = actionConfig[log.action] ?? { label: log.action, icon: AlertCircle, variant: 'gray' as const };
            const Icon = cfg.icon;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.01 }}
                className="glass-card rounded-xl p-4 flex items-center gap-4 flex-wrap"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${variantStyles[cfg.variant].bg}`}>
                  <Icon size={14} className={variantStyles[cfg.variant].text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white/80">{cfg.label}</span>
                    <Badge variant={cfg.variant}>{log.action}</Badge>
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">
                    {log.user_email ?? 'Sistema'} · {new Date(log.created_at).toLocaleString('pt-BR')}
                    {log.ip_address && ` · IP: ${log.ip_address}`}
                  </div>
                </div>
                {log.new_values && (
                  <div className="text-xs text-white/25 font-mono max-w-xs truncate hidden sm:block">
                    {JSON.stringify(log.new_values).slice(0, 80)}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, Plus, Trash2, TrendingUp, TrendingDown,
  Wallet, ArrowUpRight, ArrowDownRight, Building2,
} from 'lucide-react';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { useEventContext } from '../../context/EventContext';
import { useTransactions, useCreateTransaction, useDeleteTransaction, useSponsors, useCreateSponsor, useDeleteSponsor } from '../../hooks/useFinance';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { BarChart, ChartCard } from '../../components/admin/Charts';
import type { TransactionType, SponsorTier } from '../../types';

const fmtCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const typeConfig: Record<TransactionType, { label: string; icon: React.ElementType; color: string; variant: 'green' | 'red' | 'purple' | 'blue' | 'yellow' }> = {
  revenue: { label: 'Receita', icon: ArrowUpRight, color: 'text-emerald-400', variant: 'green' },
  expense: { label: 'Despesa', icon: ArrowDownRight, color: 'text-red-400', variant: 'red' },
  sponsorship: { label: 'Patrocínio', icon: Building2, color: 'text-purple-400', variant: 'purple' },
  commission: { label: 'Comissão', icon: DollarSign, color: 'text-amber-400', variant: 'yellow' },
  refund: { label: 'Reembolso', icon: ArrowDownRight, color: 'text-red-400', variant: 'red' },
};

export default function FinanceiroPage() {
  const { loading } = useAdminGuard();
  const { selectedEventId } = useEventContext();
  const { data: transactions = [], isLoading } = useTransactions(selectedEventId);
  const { data: sponsors = [] } = useSponsors(selectedEventId);
  const createTx = useCreateTransaction(selectedEventId);
  const deleteTx = useDeleteTransaction(selectedEventId);
  const createSponsor = useCreateSponsor(selectedEventId);
  const deleteSponsor = useDeleteSponsor(selectedEventId);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    type: 'expense' as TransactionType,
    category: '',
    description: '',
    amount: '',
    payment_method: 'pix',
    transaction_date: new Date().toISOString().split('T')[0],
  });
  const [sponsorForm, setSponsorForm] = useState({
    name: '', amount: '', tier: 'gold' as SponsorTier,
    contact_name: '', contact_email: '', contact_phone: '', notes: '',
  });
  const [txError, setTxError] = useState('');
  const [sponsorError, setSponsorError] = useState('');

  if (loading) {
    return <div className="min-h-screen bg-dark-950 flex items-center justify-center"><Spinner size={48} /></div>;
  }

  const totalRevenue = transactions.filter((t) => t.type === 'revenue' || t.type === 'sponsorship').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense' || t.type === 'commission' || t.type === 'refund').reduce((s, t) => s + Number(t.amount), 0);
  const profit = totalRevenue - totalExpenses;
  const totalSponsorship = sponsors.reduce((s, sp) => s + Number(sp.amount), 0);

  const revenueByCategory = Object.entries(
    transactions.filter((t) => t.type === 'revenue').reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + Number(t.amount);
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  const expenseByCategory = Object.entries(
    transactions.filter((t) => t.type === 'expense').reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + Number(t.amount);
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  const handleCreateTx = () => {
    if (!txForm.category.trim() || !txForm.amount) {
      setTxError('Categoria e valor são obrigatórios.');
      return;
    }
    createTx.mutate(
      {
        type: txForm.type,
        category: txForm.category.trim(),
        description: txForm.description.trim() || null,
        amount: parseFloat(txForm.amount) || 0,
        payment_method: txForm.payment_method,
        reference_id: null,
        created_by: null,
        transaction_date: txForm.transaction_date,
      },
      {
        onSuccess: () => {
          setTxModalOpen(false);
          setTxForm({ type: 'expense', category: '', description: '', amount: '', payment_method: 'pix', transaction_date: new Date().toISOString().split('T')[0] });
          setTxError('');
        },
        onError: (err) => setTxError(err instanceof Error ? err.message : 'Erro ao criar transação.'),
      }
    );
  };

  const handleCreateSponsor = () => {
    if (!sponsorForm.name.trim() || !sponsorForm.amount) {
      setSponsorError('Nome e valor são obrigatórios.');
      return;
    }
    createSponsor.mutate(
      {
        name: sponsorForm.name.trim(),
        amount: parseFloat(sponsorForm.amount) || 0,
        tier: sponsorForm.tier,
        contact_name: sponsorForm.contact_name.trim() || null,
        contact_email: sponsorForm.contact_email.trim() || null,
        contact_phone: sponsorForm.contact_phone.trim() || null,
        notes: sponsorForm.notes.trim() || null,
      },
      {
        onSuccess: () => {
          setSponsorModalOpen(false);
          setSponsorForm({ name: '', amount: '', tier: 'gold', contact_name: '', contact_email: '', contact_phone: '', notes: '' });
          setSponsorError('');
        },
        onError: (err) => setSponsorError(err instanceof Error ? err.message : 'Erro ao criar patrocinador.'),
      }
    );
  };

  return (
    <AdminLayout title="Financeiro">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <div className="font-playfair text-2xl text-white">{fmtCurrency(totalRevenue)}</div>
          <div className="text-xs text-white/35 mt-1">Receita total</div>
          <div className="text-[10px] text-white/20 mt-1">Total arrecadado com vendas e patrocínios.</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center mb-3">
            <TrendingDown size={18} className="text-red-400" />
          </div>
          <div className="font-playfair text-2xl text-white">{fmtCurrency(totalExpenses)}</div>
          <div className="text-xs text-white/35 mt-1">Custos totais</div>
          <div className="text-[10px] text-white/20 mt-1">Soma de todas as despesas e comissões pagas.</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${profit >= 0 ? 'bg-purple-500/15' : 'bg-red-500/15'}`}>
            <Wallet size={18} className={profit >= 0 ? 'text-purple-400' : 'text-red-400'} />
          </div>
          <div className={`font-playfair text-2xl ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtCurrency(profit)}</div>
          <div className="text-xs text-white/35 mt-1">{profit >= 0 ? 'Lucro' : 'Prejuízo'}</div>
          <div className="text-[10px] text-white/20 mt-1">Diferença entre receita e custos.</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-xl p-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center mb-3">
            <Building2 size={18} className="text-cyan-400" />
          </div>
          <div className="font-playfair text-2xl text-white">{fmtCurrency(totalSponsorship)}</div>
          <div className="text-xs text-white/35 mt-1">Patrocínios</div>
          <div className="text-[10px] text-white/20 mt-1">Valor total recebido de patrocinadores.</div>
        </motion.div>
      </div>

      {/* Charts */}
      {(revenueByCategory.length > 0 || expenseByCategory.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {revenueByCategory.length > 0 && (
            <ChartCard title="Receita por Categoria" icon={TrendingUp}>
              <BarChart data={revenueByCategory} formatValue={fmtCurrency} />
            </ChartCard>
          )}
          {expenseByCategory.length > 0 && (
            <ChartCard title="Despesas por Categoria" icon={TrendingDown}>
              <BarChart data={expenseByCategory} formatValue={fmtCurrency} />
            </ChartCard>
          )}
        </div>
      )}

      {/* Sponsors section */}
      <div className="glass-card rounded-2xl overflow-hidden mb-6">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-sm text-white/70 font-medium flex items-center gap-2">
            <Building2 size={16} className="text-purple-400" /> Patrocinadores
          </h3>
          <Button size="sm" onClick={() => setSponsorModalOpen(true)}><Plus size={14} /> Adicionar</Button>
        </div>
        {sponsors.length === 0 ? (
          <div className="text-center py-12 text-white/25 text-sm">Ainda não há patrocinadores cadastrados. Clique em "Adicionar" para incluir um.</div>
        ) : (
          <div className="p-5 space-y-2">
            {sponsors.map((sp) => (
              <div key={sp.id} className="flex items-center gap-4 p-3 rounded-xl bg-dark-800/40 border border-white/5">
                <Badge variant={sp.tier === 'gold' ? 'yellow' : sp.tier === 'silver' ? 'gray' : sp.tier === 'bronze' ? 'yellow' : 'blue'}>
                  {sp.tier.toUpperCase()}
                </Badge>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white/80">{sp.name}</div>
                  {sp.contact_name && <div className="text-xs text-white/30">{sp.contact_name}</div>}
                </div>
                <div className="font-playfair text-lg text-emerald-400">{fmtCurrency(Number(sp.amount))}</div>
                <button onClick={() => deleteSponsor.mutate(sp.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-sm text-white/70 font-medium flex items-center gap-2">
            <DollarSign size={16} className="text-purple-400" /> Transações
          </h3>
          <Button size="sm" onClick={() => setTxModalOpen(true)}><Plus size={14} /> Nova Transação</Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size={32} /></div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-white/25 text-sm">Ainda não há transações registradas. Clique em "Nova Transação" para começar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Tipo', 'Categoria', 'Descrição', 'Valor', 'Pagamento', 'Data', ''].map((h) => (
                    <th key={h} className="text-left text-[10px] tracking-widest text-white/25 uppercase px-5 py-4 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const cfg = typeConfig[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Icon size={14} className={cfg.color} />
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/70">{tx.category}</td>
                      <td className="px-5 py-4 text-white/40 text-xs">{tx.description ?? '—'}</td>
                      <td className={`px-5 py-4 font-mono font-medium ${tx.type === 'revenue' || tx.type === 'sponsorship' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'revenue' || tx.type === 'sponsorship' ? '+' : '-'}{fmtCurrency(Number(tx.amount))}
                      </td>
                      <td className="px-5 py-4 text-white/40 text-xs">{tx.payment_method ?? '—'}</td>
                      <td className="px-5 py-4 text-white/30 text-xs">{new Date(tx.transaction_date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => deleteTx.mutate(tx.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction modal */}
      <Modal open={txModalOpen} onClose={() => { setTxModalOpen(false); setTxError(''); }} title="Nova Transação" maxWidth="md">
        <div className="p-6 space-y-4">
          <Select label="Tipo" value={txForm.type} onChange={(e) => setTxForm({ ...txForm, type: e.target.value as TransactionType })}>
            <option value="revenue">Receita</option>
            <option value="expense">Despesa</option>
            <option value="sponsorship">Patrocínio</option>
            <option value="commission">Comissão</option>
            <option value="refund">Reembolso</option>
          </Select>
          <Input label="Categoria *" value={txForm.category} onChange={(e) => setTxForm({ ...txForm, category: e.target.value })} placeholder="Ex: equipamento, staff, bar" />
          <Input label="Descrição" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} placeholder="Detalhe opcional" />
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Valor (R$) *" type="number" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} placeholder="0.00" />
            <Select label="Pagamento" value={txForm.payment_method} onChange={(e) => setTxForm({ ...txForm, payment_method: e.target.value })}>
              <option value="pix">Pix</option>
              <option value="cash">Dinheiro</option>
              <option value="card">Cartão</option>
              <option value="transfer">Transferência</option>
            </Select>
            <Input label="Data" type="date" value={txForm.transaction_date} onChange={(e) => setTxForm({ ...txForm, transaction_date: e.target.value })} />
          </div>
          {txError && <p className="text-sm text-red-400">{txError}</p>}
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => { setTxModalOpen(false); setTxError(''); }} className="flex-1">Cancelar</Button>
            <Button onClick={handleCreateTx} loading={createTx.isPending} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Sponsor modal */}
      <Modal open={sponsorModalOpen} onClose={() => { setSponsorModalOpen(false); setSponsorError(''); }} title="Novo Patrocinador" maxWidth="md">
        <div className="p-6 space-y-4">
          <Input label="Nome *" value={sponsorForm.name} onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })} placeholder="Empresa XYZ" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Valor (R$) *" type="number" value={sponsorForm.amount} onChange={(e) => setSponsorForm({ ...sponsorForm, amount: e.target.value })} placeholder="5000.00" />
            <Select label="Categoria" value={sponsorForm.tier} onChange={(e) => setSponsorForm({ ...sponsorForm, tier: e.target.value as SponsorTier })}>
              <option value="gold">Ouro</option>
              <option value="silver">Prata</option>
              <option value="bronze">Bronze</option>
              <option value="custom">Personalizado</option>
            </Select>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Contato" value={sponsorForm.contact_name} onChange={(e) => setSponsorForm({ ...sponsorForm, contact_name: e.target.value })} placeholder="Nome" />
            <Input label="E-mail" value={sponsorForm.contact_email} onChange={(e) => setSponsorForm({ ...sponsorForm, contact_email: e.target.value })} placeholder="email@empresa.com" />
            <Input label="Telefone" value={sponsorForm.contact_phone} onChange={(e) => setSponsorForm({ ...sponsorForm, contact_phone: e.target.value })} placeholder="(11) 3333-3333" />
          </div>
          <Input label="Notas" value={sponsorForm.notes} onChange={(e) => setSponsorForm({ ...sponsorForm, notes: e.target.value })} placeholder="Observações" />
          {sponsorError && <p className="text-sm text-red-400">{sponsorError}</p>}
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => { setSponsorModalOpen(false); setSponsorError(''); }} className="flex-1">Cancelar</Button>
            <Button onClick={handleCreateSponsor} loading={createSponsor.isPending} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

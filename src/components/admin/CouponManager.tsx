import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Trash2, ToggleLeft, ToggleRight, ChevronDown,
  AlertCircle, Check, X, Percent, DollarSign,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

interface CouponForm {
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: string;
  max_uses: string;
}

const emptyForm: CouponForm = {
  code: '',
  discount_type: 'percent',
  discount_value: '',
  max_uses: '',
};

export default function CouponManager() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: async (coupon: Omit<Coupon, 'id' | 'used_count' | 'created_at'>) => {
      const { error } = await supabase.from('coupons').insert(coupon);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      setForm(emptyForm);
      setShowForm(false);
      setFormError('');
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Erro ao criar cupom.';
      setFormError(msg.includes('unique') ? 'Esse código já existe.' : msg);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('coupons').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 1500);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const handleSubmit = () => {
    setFormError('');
    const code = form.code.trim().toUpperCase();
    if (!code) { setFormError('Informe o código do cupom.'); return; }
    if (!/^[A-Z0-9_-]{2,20}$/.test(code)) {
      setFormError('Código inválido. Use letras, números, _ ou - (2-20 caracteres).');
      return;
    }
    const value = parseFloat(form.discount_value);
    if (isNaN(value) || value <= 0) { setFormError('Informe um valor de desconto válido.'); return; }
    if (form.discount_type === 'percent' && value > 100) {
      setFormError('Percentual não pode ultrapassar 100%.');
      return;
    }
    const maxUses = form.max_uses.trim() ? parseInt(form.max_uses, 10) : null;
    if (maxUses !== null && (isNaN(maxUses) || maxUses < 1)) {
      setFormError('Limite de usos deve ser um número maior que zero.');
      return;
    }
    createMutation.mutate({ code, discount_type: form.discount_type, discount_value: value, max_uses: maxUses, is_active: true });
  };

  const formatDiscount = (c: Coupon) =>
    c.discount_type === 'percent'
      ? `${c.discount_value}%`
      : c.discount_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <h3 className="text-sm text-white/70 font-medium flex items-center gap-2">
          <Tag size={16} className="text-emerald-400" />
          Cupons de Desconto
          {coupons.length > 0 && (
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {coupons.filter((c) => c.is_active).length} ativos
            </span>
          )}
        </h3>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-xs text-emerald-400/80 hover:text-emerald-400 transition-colors px-4 py-2 border border-white/10 rounded-lg hover:border-emerald-500/30"
        >
          {open ? 'Recolher' : 'Expandir'}
          <ChevronDown size={14} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-4">

              {/* Create form toggle */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/30">
                  {coupons.length === 0 ? 'Nenhum cupom criado ainda.' : `${coupons.length} cupom${coupons.length !== 1 ? 's' : ''} no total`}
                </p>
                <button
                  onClick={() => { setShowForm((v) => !v); setFormError(''); }}
                  className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg border transition-colors bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                >
                  {showForm ? <X size={12} /> : <Plus size={12} />}
                  {showForm ? 'Cancelar' : 'Novo Cupom'}
                </button>
              </div>

              {/* Create form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-4"
                  >
                    <p className="text-xs text-emerald-400/80 font-medium flex items-center gap-2">
                      <Plus size={12} /> Criar novo cupom
                    </p>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {/* Code */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] uppercase text-white/40">Código</label>
                        <input
                          value={form.code}
                          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                          placeholder="EX: PROMO10"
                          maxLength={20}
                          className="input-premium rounded-xl px-4 py-3 text-sm text-white outline-none uppercase placeholder:normal-case"
                        />
                      </div>

                      {/* Type */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] uppercase text-white/40">Tipo</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, discount_type: 'percent' }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm border transition-colors ${
                              form.discount_type === 'percent'
                                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                                : 'border-white/10 text-white/40 hover:border-white/20'
                            }`}
                          >
                            <Percent size={13} /> Percentual
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, discount_type: 'fixed' }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm border transition-colors ${
                              form.discount_type === 'fixed'
                                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                                : 'border-white/10 text-white/40 hover:border-white/20'
                            }`}
                          >
                            <DollarSign size={13} /> Valor fixo
                          </button>
                        </div>
                      </div>

                      {/* Value */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] uppercase text-white/40">
                          {form.discount_type === 'percent' ? 'Desconto (%)' : 'Desconto (R$)'}
                        </label>
                        <input
                          type="number"
                          value={form.discount_value}
                          onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                          placeholder={form.discount_type === 'percent' ? '10' : '20.00'}
                          min="0.01"
                          max={form.discount_type === 'percent' ? '100' : undefined}
                          step="0.01"
                          className="input-premium rounded-xl px-4 py-3 text-sm text-white outline-none"
                        />
                      </div>

                      {/* Max uses */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] uppercase text-white/40">
                          Limite de usos <span className="text-white/20">(vazio = ilimitado)</span>
                        </label>
                        <input
                          type="number"
                          value={form.max_uses}
                          onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                          placeholder="Ilimitado"
                          min="1"
                          className="input-premium rounded-xl px-4 py-3 text-sm text-white outline-none"
                        />
                      </div>
                    </div>

                    {formError && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25">
                        <AlertCircle size={14} className="text-red-400 shrink-0" />
                        <p className="text-xs text-red-400">{formError}</p>
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      loading={createMutation.isPending}
                      className="w-full"
                    >
                      <Check size={14} /> Criar Cupom
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Coupon list */}
              {isLoading ? (
                <div className="text-center py-8 text-white/30 text-xs">Carregando...</div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-8 text-white/20 text-xs">Nenhum cupom ainda.</div>
              ) : (
                <div className="space-y-2">
                  {coupons.map((coupon) => {
                    const exhausted = coupon.max_uses !== null && coupon.used_count >= coupon.max_uses;
                    return (
                      <motion.div
                        key={coupon.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl border p-3 sm:p-4 transition-all duration-200 ${
                          coupon.is_active && !exhausted
                            ? 'border-emerald-500/25 bg-emerald-500/5'
                            : 'border-white/5 bg-dark-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              coupon.is_active && !exhausted
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-white/5 text-white/20'
                            }`}>
                              {coupon.discount_type === 'percent' ? <Percent size={14} /> : <DollarSign size={14} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-semibold text-white/90 tracking-wider">
                                  {coupon.code}
                                </span>
                                <span className="text-xs text-emerald-400 font-medium">
                                  -{formatDiscount(coupon)}
                                </span>
                              </div>
                              <div className="text-xs text-white/30 mt-0.5">
                                {coupon.used_count} uso{coupon.used_count !== 1 ? 's' : ''}
                                {coupon.max_uses !== null && ` / ${coupon.max_uses}`}
                                {exhausted && <span className="ml-1 text-amber-400">· esgotado</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {coupon.is_active && !exhausted
                              ? <Badge variant="green">Ativo</Badge>
                              : exhausted
                              ? <Badge variant="yellow">Esgotado</Badge>
                              : <Badge variant="gray">Inativo</Badge>}

                            {successId === coupon.id && (
                              <span className="text-emerald-400">
                                <Check size={14} />
                              </span>
                            )}

                            <button
                              onClick={() => toggleMutation.mutate({ id: coupon.id, is_active: !coupon.is_active })}
                              disabled={toggleMutation.isPending}
                              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white/70 disabled:opacity-40"
                              title={coupon.is_active ? 'Desativar' : 'Ativar'}
                            >
                              {coupon.is_active
                                ? <ToggleRight size={18} className="text-emerald-400" />
                                : <ToggleLeft size={18} />}
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Excluir o cupom "${coupon.code}"?`)) {
                                  deleteMutation.mutate(coupon.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-white/20 hover:text-red-400 disabled:opacity-40"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

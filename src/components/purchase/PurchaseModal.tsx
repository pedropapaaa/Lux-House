import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Ticket, User, Shield, Tag, X, Check, Loader2, Gift } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import LotSelector from './LotSelector';
import { useLots } from '../../hooks/useLots';
import { useSettings } from '../../hooks/useSettings';
import { purchaseSchema, type PurchaseFormData } from '../../schemas/purchase';
import { supabase } from '../../lib/supabase';

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
}

interface AppliedCoupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
}

function maskCPF(v: string) {
  return v
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14);
}

function maskPhone(v: string) {
  return v
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}

function calcFinalPrice(base: number, coupon: AppliedCoupon | null): number {
  if (!coupon) return base;
  const raw = coupon.discount_type === 'percent'
    ? base * (1 - coupon.discount_value / 100)
    : base - coupon.discount_value;
  return Math.max(0, Math.round(raw * 100) / 100);
}

function isFree(price: number): boolean {
  return price <= 0;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export default function PurchaseModal({ open, onClose }: PurchaseModalProps) {
  const navigate = useNavigate();
  const { data: lots = [], isLoading: lotsLoading } = useLots();
  const { data: settings } = useSettings();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const couponInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { lot_id: '' },
  });

  const selectedLotId = watch('lot_id');
  const selectedLot = lots.find((l) => l.id === selectedLotId);
  const finalPrice = selectedLot ? calcFinalPrice(selectedLot.price, appliedCoupon) : 0;
  const free = selectedLot ? isFree(finalPrice) : false;

  const handleClose = () => {
    reset();
    setServerError('');
    setCouponInput('');
    setCouponError('');
    setAppliedCoupon(null);
    onClose();
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('id, code, discount_type, discount_value, max_uses, used_count, is_active')
        .eq('is_active', true)
        .ilike('code', code)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setCouponError('Cupom inválido ou não encontrado.');
        return;
      }
      if (data.max_uses !== null && data.used_count >= data.max_uses) {
        setCouponError('Este cupom já atingiu o limite de usos.');
        return;
      }
      setAppliedCoupon({
        id: data.id,
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
      });
      setCouponInput('');
    } catch {
      setCouponError('Erro ao verificar cupom. Tente novamente.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const onSubmit = async (data: PurchaseFormData) => {
    setSubmitting(true);
    setServerError('');

    try {
      if (!selectedLot) throw new Error('Selecione um lote.');

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          lot_id: data.lot_id,
          buyer_name: data.name,
          buyer_last_name: data.last_name,
          buyer_cpf: data.cpf,
          buyer_phone: data.phone,
          buyer_email: data.email,
          quantity: 1,
          total_amount: finalPrice,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      if (free) {
        // Free order: approve immediately via secure RPC, skip QR code
        const { error: approveError } = await supabase
          .rpc('approve_free_order', { order_id: order.id });
        if (approveError) throw approveError;

        void supabase
          .rpc('increment_coupon_usage', { coupon_id: appliedCoupon!.id })
          .then(() => {})
          .catch(() => {});

        handleClose();
        // Navigate to payment page which will auto-redirect to ticket once approved
        navigate(`/pagamento/${order.id}`);
        return;
      }

      // Paid order: generate QR code via edge function
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Erro ao processar pagamento.' }));
        throw new Error(errBody.error ?? 'Erro ao processar pagamento.');
      }

      if (appliedCoupon) {
        void supabase
          .rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id })
          .then(() => {})
          .catch(() => {});
      }

      handleClose();
      navigate(`/pagamento/${order.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setServerError(message || 'Erro inesperado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Comprar Ingresso" maxWidth="lg">
      <div className="p-4 sm:p-6 lg:p-8">
        {lotsLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size={40} />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Lot selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <LotSelector
                lots={lots}
                selectedId={selectedLotId}
                onChange={(id) => setValue('lot_id', id, { shouldValidate: true })}
                error={errors.lot_id?.message}
                showRemaining={settings?.show_remaining_tickets ?? false}
              />
            </motion.div>

            {/* Divider */}
            <div className="my-6 sm:my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              <User size={14} className="text-purple-500/40" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
            </div>

            {/* Section title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-2 mb-4 sm:mb-5"
            >
              <User size={14} className="text-purple-400" />
              <span className="text-[10px] tracking-[0.2em] text-purple-400/80 uppercase font-medium">
                Dados do Comprador
              </span>
            </motion.div>

            {/* Name fields */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid sm:grid-cols-2 gap-4 mb-4"
            >
              <Input
                label="Nome"
                placeholder="Joao"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Sobrenome"
                placeholder="Silva"
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </motion.div>

            {/* Document fields */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid sm:grid-cols-2 gap-4 mb-4"
            >
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                maxLength={14}
                error={errors.cpf?.message}
                {...register('cpf', {
                  onChange: (e) => {
                    e.target.value = maskCPF(e.target.value);
                  },
                })}
              />
              <Input
                label="Telefone"
                placeholder="(11) 99999-9999"
                maxLength={15}
                error={errors.phone?.message}
                {...register('phone', {
                  onChange: (e) => {
                    e.target.value = maskPhone(e.target.value);
                  },
                })}
              />
            </motion.div>

            {/* Email fields */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid sm:grid-cols-2 gap-4 mb-6 sm:mb-8"
            >
              <Input
                label="E-mail"
                type="email"
                placeholder="joao@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Confirmar E-mail"
                type="email"
                placeholder="joao@email.com"
                error={errors.confirm_email?.message}
                {...register('confirm_email')}
              />
            </motion.div>

            {/* Coupon field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="mb-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Tag size={13} className="text-emerald-400/70" />
                <span className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-medium">
                  Cupom de Desconto
                </span>
              </div>

              {appliedCoupon ? (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${free ? 'border-yellow-500/40 bg-yellow-500/10' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
                  {free ? <Gift size={14} className="text-yellow-400 shrink-0" /> : <Check size={14} className="text-emerald-400 shrink-0" />}
                  <div className="flex-1">
                    <span className={`font-mono text-sm font-semibold tracking-wider ${free ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {appliedCoupon.code}
                    </span>
                    <span className={`ml-2 text-xs ${free ? 'text-yellow-400/80 font-semibold' : 'text-emerald-400/70'}`}>
                      {free ? '— GRÁTIS' : `- ${appliedCoupon.discount_type === 'percent'
                        ? `${appliedCoupon.discount_value}%`
                        : appliedCoupon.discount_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-lg hover:bg-red-500/10 transition-colors text-white/30 hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    ref={couponInputRef}
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                    placeholder="CÓDIGO DO CUPOM"
                    className="input-premium flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none uppercase placeholder:normal-case placeholder:tracking-normal tracking-widest"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim() || couponLoading}
                    className="px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium transition-colors hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                  >
                    {couponLoading ? <Loader2 size={14} className="animate-spin" /> : <Tag size={13} />}
                    Aplicar
                  </button>
                </div>
              )}

              {couponError && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} /> {couponError}
                </p>
              )}
            </motion.div>

            {/* Summary */}
            {selectedLot && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mb-6 p-4 sm:p-5 rounded-xl border ${free ? 'border-yellow-500/25' : 'border-purple-500/20'}`}
                style={{
                  background: free
                    ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.08), rgba(251, 146, 60, 0.08))'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(255, 90, 0, 0.08))',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Ticket size={14} className={free ? 'text-yellow-400' : 'text-pink-400'} />
                      <span className="text-xs text-white/40">{selectedLot.name}</span>
                    </div>
                    <div className="text-sm text-white/60">1 ingresso</div>
                  </div>
                  <div className="text-right">
                    {appliedCoupon && (
                      <div className="text-xs text-white/30 line-through mb-0.5">
                        {selectedLot.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    )}
                    {free ? (
                      <div className="flex items-center gap-2">
                        <Gift size={16} className="text-yellow-400" />
                        <span className="font-playfair text-2xl text-yellow-400">GRÁTIS</span>
                      </div>
                    ) : (
                      <div className="font-playfair text-2xl text-gradient-primary">
                        {finalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    )}
                    <div className="text-[10px] text-white/30 flex items-center gap-1 mt-1">
                      {free ? (
                        <>
                          <Gift size={10} className="text-yellow-400/60" />
                          Ingresso gratuito
                        </>
                      ) : (
                        <>
                          <Shield size={10} className="text-cyan-400" />
                          Pagamento via Pix
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Server error */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3"
              >
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{serverError}</p>
              </motion.div>
            )}

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Button
                type="submit"
                size="lg"
                loading={submitting}
                className={`w-full ${free ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 border-0' : ''}`}
              >
                {free ? 'Confirmar Ingresso Gratuito' : 'Gerar QR Code Pix'}
              </Button>
            </motion.div>

            <p className="text-center text-xs text-white/20 mt-4 leading-relaxed">
              Ao continuar, voce concorda com nossos termos de uso.
            </p>
          </form>
        )}
      </div>
    </Modal>
  );
}

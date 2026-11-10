import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Ticket, User, Shield, Tag, X, Check, Loader2, Gift } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import LotSelector from './LotSelector';
import GuestFields from './GuestFields';
import { useLots } from '../../hooks/useLots';
import { useSettings } from '../../hooks/useSettings';
import { usePublicEvent } from '../../hooks/usePublicEvent';
import { purchaseSchema, type PurchaseFormData } from '../../schemas/purchase';
import { supabase } from '../../lib/supabase';
import { maskCPF } from '../../lib/masks';

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

const SERVICE_FEE = 4.5;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export default function PurchaseModal({ open, onClose }: PurchaseModalProps) {
  const navigate = useNavigate();
  const { data: publicEvent } = usePublicEvent();
  const { data: lots = [], isLoading: lotsLoading } = useLots(publicEvent?.id);
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
    control,
    formState: { errors },
    reset,
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { lot_id: '', guests: [] },
  });

  const { fields: guestFields, replace: replaceGuests } = useFieldArray({ control, name: 'guests' });

  const selectedLotId = watch('lot_id');
  const selectedLot = lots.find((l) => l.id === selectedLotId);
  const finalPrice = selectedLot ? calcFinalPrice(selectedLot.price, appliedCoupon) : 0;
  const free = selectedLot ? isFree(finalPrice) : false;
  const serviceFee = free ? 0 : SERVICE_FEE;
  const totalAmount = finalPrice + serviceFee;

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

  const handleLotChange = (id: string) => {
    setValue('lot_id', id, { shouldValidate: true });
    const lot = lots.find((l) => l.id === id);
    const guestCount = lot && lot.guests_per_unit > 1 ? lot.guests_per_unit : 0;
    replaceGuests(Array.from({ length: guestCount }, () => ({ name: '', cpf: '' })));
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
          event_id: publicEvent?.id ?? null,
          lot_id: data.lot_id,
          buyer_name: data.name,
          buyer_last_name: data.last_name,
          buyer_cpf: data.cpf,
          buyer_phone: data.phone,
          buyer_email: data.email,
          quantity: 1,
          guests: data.guests,
          total_amount: totalAmount,
          coupon_id: appliedCoupon?.id ?? null,
          discount_amount: selectedLot.price - finalPrice,
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

        if (appliedCoupon) {
          void Promise.resolve(
            supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id })
          ).catch(() => {});
        }

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
        const errBody = await res.json().catch(() => ({
          error: 'Erro ao processar pagamento.',
        }));
        throw new Error(errBody.error ?? 'Erro ao processar pagamento.');
      }

      if (appliedCoupon) {
        void Promise.resolve(
          supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id })
        ).catch(() => {});
      }

      handleClose();
      navigate(`/pagamento/${order.id}`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string'
            ? err.message
            : '';
      setServerError(message || 'Erro inesperado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Comprar Ingresso" maxWidth="lg">
      <div className="bg-white p-4 sm:p-7 lg:p-9">
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
                onChange={handleLotChange}
                error={errors.lot_id?.message}
                showRemaining={settings?.show_remaining_tickets ?? false}
              />
            </motion.div>

            {/* Divider */}
            <div className="my-6 sm:my-8 flex items-center gap-4" aria-hidden="true">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-950/15 to-transparent" />
              <User size={14} className="text-neutral-500" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-950/15 to-transparent" />
            </div>

            {/* Section title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-5 flex items-center gap-3 border-b border-neutral-200 pb-4 sm:mb-6"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-white"><User size={14} /></span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
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
                tone="light"
                placeholder="Joao"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Sobrenome"
                tone="light"
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
                tone="light"
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
                tone="light"
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
                tone="light"
                type="email"
                placeholder="joao@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Confirmar E-mail"
                tone="light"
                type="email"
                placeholder="joao@email.com"
                error={errors.confirm_email?.message}
                {...register('confirm_email')}
              />
            </motion.div>

            {guestFields.length > 0 && (
              <GuestFields fields={guestFields} register={register} errors={errors} />
            )}

            {/* Coupon field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="mb-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Tag size={13} className="text-emerald-400/70" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Cupom de Desconto
                </span>
              </div>

              {appliedCoupon ? (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${free ? 'border-yellow-500/40 bg-yellow-500/10' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
                  {free ? (
                    <Gift size={14} className="text-yellow-400 shrink-0" />
                  ) : (
                    <Check size={14} className="text-emerald-400 shrink-0" />
                  )}

                  <div className="flex-1">
                    <span className={`font-mono text-sm font-semibold tracking-wider ${free ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {appliedCoupon.code}
                    </span>

                    <span className={`ml-2 text-xs ${free ? 'text-yellow-400/80 font-semibold' : 'text-emerald-400/70'}`}>
                      {free
                        ? '— GRÁTIS'
                        : `- ${
                            appliedCoupon.discount_type === 'percent'
                              ? `${appliedCoupon.discount_value}%`
                              : appliedCoupon.discount_value.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })
                          }`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex w-full min-w-0 gap-2">
                  <input
                    ref={couponInputRef}
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), handleApplyCoupon())
                    }
                    placeholder="CÓDIGO DO CUPOM"
                    className="w-0 min-w-0 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm uppercase tracking-widest text-neutral-950 outline-none placeholder:normal-case placeholder:tracking-normal focus:border-neutral-950 focus:bg-white"
                    maxLength={20}
                  />

                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim() || couponLoading}
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-neutral-950 bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {couponLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Tag size={13} />
                    )}
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
                className={`mb-6 p-4 sm:p-5 rounded-xl border ${free ? 'border-yellow-500/25 bg-yellow-500/5' : 'border-neutral-300 bg-neutral-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Ticket size={14} className={free ? 'text-yellow-400' : 'text-neutral-700'} />
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{selectedLot.name}</span>
                    </div>
                    <div className="mt-1 text-sm text-neutral-600">
                      {selectedLot.guests_per_unit > 1 ? `${selectedLot.guests_per_unit} ingressos nominais` : '1 ingresso'}
                    </div>
                  </div>

                  <div className="text-right">
                    {appliedCoupon && (
                      <div className="mb-0.5 text-xs text-neutral-400 line-through">
                        {selectedLot.price.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </div>
                    )}

                    {free ? (
                      <div className="flex items-center gap-2">
                        <Gift size={16} className="text-yellow-400" />
                        <span className="font-display text-2xl font-bold text-neutral-950">GRÁTIS</span>
                      </div>
                    ) : (
                      <>
                        <div className="font-display text-2xl font-bold text-neutral-950">
                          {totalAmount.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </div>
                        <div className="mt-1 text-[10px] text-neutral-500">
                          {finalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} + {SERVICE_FEE.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de taxa
                        </div>
                      </>
                    )}

                    <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-500">
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
                variant="mono"
                size="lg"
                loading={submitting}
                className={`w-full ${free ? 'bg-neutral-950 hover:bg-neutral-700 border-0' : ''}`}
              >
                {free ? 'Confirmar Ingresso Gratuito' : 'Gerar QR Code Pix'}
              </Button>
            </motion.div>

            <p className="mt-4 text-center text-xs leading-relaxed text-neutral-400">
              Ao continuar, voce concorda com nossos termos de uso.
            </p>
          </form>
        )}
      </div>
    </Modal>
  );
}
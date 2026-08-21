import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, XCircle, RefreshCw, Ticket, Clock, Shield } from 'lucide-react';
import { useOrder } from '../hooks/useOrder';
import { useTicketByOrderId } from '../hooks/useTicket';
import QRCodeDisplay from '../components/payment/QRCodeDisplay';
import CountdownTimer from '../components/payment/CountdownTimer';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

export default function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, error, refetch } = useOrder(orderId, 5000);

  const isApproved = order?.payment_status === 'approved';
  const { data: ticket } = useTicketByOrderId(orderId, isApproved);

  useEffect(() => {
    if (isApproved && ticket?.code) {
      navigate(`/ingresso/${ticket.code}`, { replace: true });
    }
  }, [isApproved, ticket?.code, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size={48} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center"
        >
          <AlertCircle size={36} className="text-red-400" />
        </motion.div>
        <h2 className="font-playfair text-2xl sm:text-3xl text-white">Pedido nao encontrado</h2>
        <p className="text-white/40 text-sm max-w-xs">Verifique o link ou volte para a pagina inicial.</p>
        <Link to="/">
          <Button variant="outline">Voltar ao Inicio</Button>
        </Link>
      </div>
    );
  }

  if (order.payment_status === 'rejected' || order.payment_status === 'expired') {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center"
        >
          <XCircle size={36} className="text-red-400" />
        </motion.div>
        <h2 className="font-playfair text-2xl sm:text-3xl text-white">
          {order.payment_status === 'expired' ? 'Pagamento Expirado' : 'Pagamento Recusado'}
        </h2>
        <p className="text-white/40 text-sm max-w-sm">
          {order.payment_status === 'expired'
            ? 'O tempo para pagamento expirou. Volte ao inicio e tente novamente.'
            : 'O pagamento foi recusado. Tente novamente.'}
        </p>
        <Link to="/">
          <Button>Tentar Novamente</Button>
        </Link>
      </div>
    );
  }

  if (isApproved) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-6 px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-emerald-500/15 flex items-center justify-center"
          style={{ boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)' }}
        >
          <CheckCircle2 size={44} className="text-emerald-400" />
        </motion.div>
        <h2 className="font-playfair text-2xl sm:text-3xl text-white">Pagamento Aprovado!</h2>
        <p className="text-white/40 text-sm">Gerando seu ingresso...</p>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 px-4 py-10 sm:py-16">
      {/* Ambient glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-purple-500/5 blur-[200px] pointer-events-none" />

      <div className="max-w-lg mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-10"
        >
          <Link to="/" className="inline-block mb-6 group">
            <motion.div whileHover={{ scale: 1.05 }}>
              <picture>
                <source srcSet="/images/logo.webp" type="image/webp" />
                <img
                  src="/images/logo.webp"
                  alt="Lux House"
                  width={80}
                  height={80}
                  className="w-18 h-18 object-contain mx-auto rounded-full"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))' }}
                />
              </picture>
            </motion.div>
          </Link>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-full px-4 py-2 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-amber-400 font-medium">Aguardando pagamento</span>
          </motion.div>

          <h1 className="font-playfair text-2xl sm:text-3xl text-white mb-3">Finalize seu Pagamento</h1>
          <p className="text-white/40 text-sm">Escaneie o QR Code ou copie o codigo Pix para pagar.</p>
        </motion.div>

        {/* Timer */}
        {order.expires_at && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl glass-card">
              <Clock size={18} className="text-purple-400" />
              <CountdownTimer expiresAt={order.expires_at} onExpire={() => refetch()} />
            </div>
          </motion.div>
        )}

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 sm:p-8 mb-6"
        >
          {order.qr_code ? (
            <QRCodeDisplay pixCode={order.qr_code} qrBase64={order.qr_code_base64} />
          ) : (
            <div className="flex flex-col items-center gap-4 py-12">
              <Spinner size={40} />
              <p className="text-white/30 text-sm">Gerando QR Code...</p>
            </div>
          )}
        </motion.div>

        {/* Order summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5 sm:p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Ticket size={14} className="text-purple-400" />
            <span className="text-[10px] tracking-widest text-white/25 uppercase font-medium">Resumo do Pedido</span>
          </div>

          <div className="space-y-3 text-sm">
            {[
              { label: 'Comprador', value: `${order.buyer_name} ${order.buyer_last_name}` },
              { label: 'E-mail', value: order.buyer_email },
              { label: 'Lote', value: (order.lots as any)?.name ?? '—' },
              { label: 'Valor', value: order.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between gap-4 items-center">
                <span className="text-white/30 text-xs">{label}</span>
                <span className={`text-right truncate max-w-[60%] ${highlight ? 'font-playfair text-lg text-purple-400' : 'text-white/70 text-sm'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
          >
            <RefreshCw size={14} /> Verificar pagamento
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-white/15 mt-4 leading-relaxed flex items-center justify-center gap-1.5"
        >
          <Shield size={12} className="text-cyan-400/50" />
          Apos o pagamento, seu ingresso sera gerado automaticamente
        </motion.p>
      </div>
    </div>
  );
}
